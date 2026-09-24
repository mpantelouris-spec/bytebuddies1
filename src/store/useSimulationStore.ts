import { create } from 'zustand';

/** Discriminated block kinds used by the KS2 visual editor. */
export type CodeBlockType = 'trigger' | 'action';

/** A single snap-together block in the student's program stack. */
export interface CodeBlock {
  id: string;
  type: CodeBlockType;
  label: string;
  value: number;
  color: string;
}

export interface SimulationRuntimeState {
  isRunning: boolean;
  vehicleSpeed: number;
  timeMs: number;
  lap: number;
}

export interface SimulationStoreState extends SimulationRuntimeState {
  blocks: CodeBlock[];
}

export interface SimulationStoreActions {
  addBlock: (block: Omit<CodeBlock, 'id'> & { id?: string }) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  executeCode: () => void;
  resetSimulation: () => void;
  setBlocks: (blocks: CodeBlock[]) => void;
  updateBlock: (id: string, patch: Partial<Pick<CodeBlock, 'label' | 'value' | 'color'>>) => void;
  removeBlock: (id: string) => void;
  tick: (deltaMs: number) => void;
  completeLap: () => void;
}

export type SimulationStore = SimulationStoreState & SimulationStoreActions;

const MAX_LAPS = 3;

function createBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Default KS2 starter stack — mirrors the Rainbow Road racing script. */
export const DEFAULT_CODE_BLOCKS: CodeBlock[] = [
  {
    id: 'trigger-start',
    type: 'trigger',
    label: 'When START clicked',
    value: 0,
    color: '#ef4444',
  },
  {
    id: 'action-speed',
    type: 'action',
    label: 'Set speed',
    value: 65,
    color: '#3b82f6',
  },
  {
    id: 'action-boost',
    type: 'action',
    label: 'Boost off the line',
    value: 1.2,
    color: '#a855f7',
  },
  {
    id: 'action-drive',
    type: 'action',
    label: 'Keep driving',
    value: 0,
    color: '#4f46e5',
  },
];

const INITIAL_RUNTIME: SimulationRuntimeState = {
  isRunning: false,
  vehicleSpeed: 0,
  timeMs: 0,
  lap: 1,
};

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Walk action blocks (after the trigger) and derive vehicle speed from KS2 racing blocks.
 * Boost multiplies base speed; "Keep driving" ensures motion continues after launch.
 */
export function interpretBlocksForSpeed(blocks: CodeBlock[]): number {
  let baseSpeed = 40;
  let boostMultiplier = 1;
  let keepDriving = false;

  for (const block of blocks) {
    if (block.type !== 'action') continue;
    const key = normalizeLabel(block.label);

    if (key.startsWith('set speed')) {
      baseSpeed = Math.max(0, block.value);
    } else if (key.includes('boost')) {
      boostMultiplier = Math.max(0.1, block.value);
    } else if (key.includes('keep driving')) {
      keepDriving = true;
    }
  }

  const computed = baseSpeed * boostMultiplier;
  if (keepDriving && computed <= 0) return 40;
  return computed;
}

function cloneBlocks(blocks: CodeBlock[]): CodeBlock[] {
  return blocks.map((b) => ({ ...b }));
}

export const useSimulationStore = create(
  (set, get): SimulationStore => ({
  ...INITIAL_RUNTIME,
  blocks: cloneBlocks(DEFAULT_CODE_BLOCKS),

  addBlock: (block) => {
    const next: CodeBlock = {
      id: block.id ?? createBlockId(),
      type: block.type,
      label: block.label,
      value: block.value,
      color: block.color,
    };
    set((state) => ({ blocks: [...state.blocks, next] }));
  },

  reorderBlocks: (fromIndex, toIndex) => {
    set((state) => {
      const blocks = [...state.blocks];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= blocks.length ||
        toIndex >= blocks.length ||
        fromIndex === toIndex
      ) {
        return state;
      }
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { blocks };
    });
  },

  executeCode: () => {
    const { blocks, isRunning } = get();
    if (isRunning) return;

    const hasTrigger = blocks.some((b) => b.type === 'trigger');
    if (!hasTrigger) return;

    const vehicleSpeed = interpretBlocksForSpeed(blocks);
    set({
      isRunning: true,
      vehicleSpeed,
      timeMs: 0,
    });
  },

  resetSimulation: () => {
    set({
      ...INITIAL_RUNTIME,
      blocks: cloneBlocks(get().blocks),
    });
  },

  setBlocks: (blocks) => {
    set({ blocks: cloneBlocks(blocks) });
  },

  updateBlock: (id, patch) => {
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  },

  removeBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id || b.type === 'trigger'),
    }));
  },

  tick: (deltaMs) => {
    const { isRunning } = get();
    if (!isRunning || deltaMs <= 0) return;
    set((state) => ({ timeMs: state.timeMs + deltaMs }));
  },

  completeLap: () => {
    set((state) => {
      if (state.lap >= MAX_LAPS) {
        return { isRunning: false, vehicleSpeed: 0 };
      }
      return { lap: state.lap + 1 };
    });
  },
  }),
);
