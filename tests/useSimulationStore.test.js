import {
  useSimulationStore,
  DEFAULT_CODE_BLOCKS,
  interpretBlocksForSpeed,
} from '../src/store/useSimulationStore';

describe('useSimulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      isRunning: false,
      vehicleSpeed: 0,
      timeMs: 0,
      lap: 1,
      blocks: DEFAULT_CODE_BLOCKS.map((b) => ({ ...b })),
    });
  });

  it('starts with default KS2 block stack', () => {
    const { blocks } = useSimulationStore.getState();
    expect(blocks).toHaveLength(4);
    expect(blocks[0].type).toBe('trigger');
    expect(blocks[1].label).toBe('Set speed');
  });

  it('interpretBlocksForSpeed applies boost multiplier', () => {
    const speed = interpretBlocksForSpeed(DEFAULT_CODE_BLOCKS);
    expect(speed).toBeCloseTo(78, 0);
  });

  it('executeCode sets running state and derived speed', () => {
    useSimulationStore.getState().executeCode();
    const { isRunning, vehicleSpeed, timeMs } = useSimulationStore.getState();
    expect(isRunning).toBe(true);
    expect(vehicleSpeed).toBeCloseTo(78, 0);
    expect(timeMs).toBe(0);
  });

  it('resetSimulation clears runtime without losing blocks', () => {
    useSimulationStore.getState().executeCode();
    useSimulationStore.getState().tick(500);
    useSimulationStore.getState().resetSimulation();
    const state = useSimulationStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.vehicleSpeed).toBe(0);
    expect(state.timeMs).toBe(0);
    expect(state.blocks).toHaveLength(4);
  });

  it('reorderBlocks moves items in the stack', () => {
    useSimulationStore.getState().reorderBlocks(1, 3);
    const labels = useSimulationStore.getState().blocks.map((b) => b.label);
    expect(labels).toEqual([
      'When START clicked',
      'Boost off the line',
      'Keep driving',
      'Set speed',
    ]);
  });
});
