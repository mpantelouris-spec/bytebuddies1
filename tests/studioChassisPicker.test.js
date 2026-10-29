import {
  STARTER_CHASSIS_IDS,
  CHASSIS_FAMILY,
  partitionByStarterIds,
} from '../src/virtual-robot-designer/data/primary-robot-studio.js';

describe('pre-built studio robots', () => {
  test('first screen is the family starters, not the full catalogue', () => {
    expect(STARTER_CHASSIS_IDS).toEqual([
      'rover', 'droid', 'drone', 'spider', 'submarine', 'robotarm', 'footballbot', 'striker', 'birdbot', 'legobot',
      'snakebot', 'pacbot', 'brickbot', 'hopbot', 'raiderbot', 'jumpbot', 'racedrone', 'jetplane', 'blockbot',
    ]);
    const all = Object.keys(CHASSIS_FAMILY);
    expect(all.length).toBeGreaterThan(STARTER_CHASSIS_IDS.length + 10);
    STARTER_CHASSIS_IDS.forEach((id) => expect(CHASSIS_FAMILY[id]).toBeTruthy());
  });

  test('extras stay available behind More robots', () => {
    const items = Object.keys(CHASSIS_FAMILY).map((id) => ({ id }));
    const { starters, more } = partitionByStarterIds(items, (x) => x.id, STARTER_CHASSIS_IDS);
    expect(starters.map((s) => s.id)).toEqual(STARTER_CHASSIS_IDS);
    expect(more.map((m) => m.id)).toContain('scout');
    expect(more.map((m) => m.id)).toContain('hoverracer');
    expect(more).toHaveLength(items.length - STARTER_CHASSIS_IDS.length);
  });
});
