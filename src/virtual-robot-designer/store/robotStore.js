import { create } from 'zustand';
import { DEFAULT_ROBOT_DESIGN, migrateDesign } from '../config.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';

const MAX_HISTORY = 50;

function cloneDesign(d) {
  return migrateDesign(JSON.parse(JSON.stringify(d)));
}

export const useRobotStore = create((set, get) => ({
  tab: 'design',
  design: cloneDesign(VirtualRobotDB.getCurrentDesign() || DEFAULT_ROBOT_DESIGN),
  past: [],
  future: [],

  /** Replace design without recording history (load, reset welcome, sync) */
  replaceDesign: (next, { record = false } = {}) => {
    const migrated = cloneDesign(next);
    if (record) {
      const { design, past } = get();
      set({
        design: migrated,
        past: [...past.slice(-MAX_HISTORY + 1), cloneDesign(design)],
        future: [],
      });
    } else {
      set({ design: migrated });
    }
    VirtualRobotDB.setCurrentDesign(migrated);
  },

  /** User edit — pushes current state to undo stack */
  setDesign: (updater) => {
    const { design, past } = get();
    const prev = cloneDesign(design);
    const next = typeof updater === 'function' ? updater(prev) : cloneDesign(updater);
    const migrated = cloneDesign(next);
    set({
      design: migrated,
      past: [...past.slice(-MAX_HISTORY + 1), prev],
      future: [],
    });
    VirtualRobotDB.setCurrentDesign(migrated);
  },

  undo: () => {
    const { past, design, future } = get();
    if (past.length === 0) return false;
    const previous = past[past.length - 1];
    set({
      design: cloneDesign(previous),
      past: past.slice(0, -1),
      future: [cloneDesign(design), ...future].slice(0, MAX_HISTORY),
    });
    VirtualRobotDB.setCurrentDesign(cloneDesign(previous));
    return true;
  },

  redo: () => {
    const { past, design, future } = get();
    if (future.length === 0) return false;
    const next = future[0];
    set({
      design: cloneDesign(next),
      past: [...past, cloneDesign(design)].slice(-MAX_HISTORY),
      future: future.slice(1),
    });
    VirtualRobotDB.setCurrentDesign(cloneDesign(next));
    return true;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clearHistory: () => set({ past: [], future: [] }),

  simAutoRun: false,
  requestSimRun: () => set({ simAutoRun: true, tab: 'simulator' }),
}));

/** Hook-compatible setter for components expecting setDesign prop */
export function useDesignActions() {
  const setDesign = useRobotStore((s) => s.setDesign);
  const replaceDesign = useRobotStore((s) => s.replaceDesign);
  const undo = useRobotStore((s) => s.undo);
  const redo = useRobotStore((s) => s.redo);
  const canUndo = useRobotStore((s) => s.past.length > 0);
  const canRedo = useRobotStore((s) => s.future.length > 0);
  const clearHistory = useRobotStore((s) => s.clearHistory);
  return { setDesign, replaceDesign, undo, redo, canUndo, canRedo, clearHistory };
}
