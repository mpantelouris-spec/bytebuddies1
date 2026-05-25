/**
 * Virtual Robot Designer — automated coverage for test plan sections 1, 5, 9.
 */
import { placePartOnSlot, removePartFromSlot, migrateAssembly } from '../src/virtual-robot-designer/services/assembly-service.js';
import { slotAcceptsPart, SNAP_SLOTS } from '../src/virtual-robot-designer/data/assembly-parts.js';
import { computeDesignStats } from '../src/virtual-robot-designer/services/design-service.js';
import VirtualRobotDB from '../src/virtual-robot-designer/database/virtual-robot-db.js';
import { createFreshRobotDesign } from '../src/virtual-robot-designer/utils/initRobotDesign.js';
import { MODULAR_CHASSIS } from '../src/virtual-robot-designer/data/modular-parts-registry.js';
import { migrateDesign } from '../src/virtual-robot-designer/config.js';

describe('VRD — chassis catalog (FT-001)', () => {
  test('at least 6 selectable chassis types', () => {
    expect(MODULAR_CHASSIS.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(MODULAR_CHASSIS.map((c) => c.id));
    expect(ids.has('rover')).toBe(true);
    expect(ids.has('tank')).toBe(true);
  });
});

describe('VRD — socket validation (FT-007, IT-005, IT-006)', () => {
  let design;

  beforeEach(() => {
    design = createFreshRobotDesign();
  });

  test('movement socket accepts movement category', () => {
    expect(slotAcceptsPart('movement', 'movement')).toBe(true);
  });

  test('movement socket rejects sensor category', () => {
    expect(slotAcceptsPart('movement', 'sensors')).toBe(false);
  });

  test('invalid category does not place on slot', () => {
    const before = migrateAssembly(design).slots.front;
    const next = placePartOnSlot(design, 'movement', 'sensors', 'camera');
    expect(migrateAssembly(next).slots.movement).toBeFalsy();
    expect(next).toEqual(design);
  });

  test('valid movement part attaches to movement socket', () => {
    const next = placePartOnSlot(design, 'movement', 'movement', 'standard');
    const slot = migrateAssembly(next).slots.movement;
    expect(slot).toEqual({ category: 'movement', partId: 'standard' });
  });

  test('double-attach to occupied socket is rejected (IT-006)', () => {
    let d = placePartOnSlot(design, 'front', 'sensors', 'ultrasonic');
    const first = { ...migrateAssembly(d).slots.front };
    expect(first.partId).toBe('ultrasonic');
    d = placePartOnSlot(d, 'front', 'sensors', 'lidar');
    expect(migrateAssembly(d).slots.front).toEqual(first);
  });

  test('remove frees socket for new part', () => {
    let d = placePartOnSlot(design, 'head', 'head', 'camera');
    d = removePartFromSlot(d, 'head');
    d = placePartOnSlot(d, 'head', 'head', 'ai_visor');
    expect(migrateAssembly(d).slots.head.partId).toBe('ai_visor');
  });
});

describe('VRD — stats (FT-009–FT-012, ET-005)', () => {
  test('stats are clamped between 5 and 100', () => {
    let d = createFreshRobotDesign();
    for (let i = 0; i < 8; i += 1) {
      const slotId = Object.keys(SNAP_SLOTS)[i];
      const cat = SNAP_SLOTS[slotId].accepts.find((c) => c !== '*') || 'utility';
      const partId = cat === 'movement' ? 'standard' : cat === 'head' ? 'basic' : cat === 'sensors' ? 'camera' : 'gripper';
      if (slotAcceptsPart(slotId, cat)) {
        d = placePartOnSlot(d, slotId, cat, partId);
      }
    }
    d = migrateDesign({
      ...d,
      wheels: { type: 'standard', count: 8, motor: 'turbo', size: 'large' },
      abilities: { speedBoost: true, superStrength: true, chaosMode: true },
    });
    const stats = computeDesignStats(d);
    ['speed', 'power', 'agility', 'weight', 'battery', 'stability'].forEach((key) => {
      expect(stats[key]).toBeGreaterThanOrEqual(5);
      expect(stats[key]).toBeLessThanOrEqual(100);
    });
  });

  test('wheel count affects speed stat (FT-010)', () => {
    const base = createFreshRobotDesign();
    const with2 = computeDesignStats({ ...base, wheels: { type: 'standard', count: 2 } });
    const with8 = computeDesignStats({ ...base, wheels: { type: 'standard', count: 8 } });
    expect(with2.speed).not.toBe(with8.speed);
  });
});

describe('VRD — save / load / delete (FT-013–FT-015, DT-001–DT-002, ET-002)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('save and load restores configuration', () => {
    let d = placePartOnSlot(createFreshRobotDesign(), 'movement', 'movement', 'tracks');
    d = migrateDesign({ ...d, name: 'Bot A' });
    expect(migrateAssembly(d).slots.movement?.partId).toBe('tracks');
    const saved = VirtualRobotDB.saveDesign(d);
    expect(saved.ok).toBe(true);
    expect(saved.design.name).toBe('Bot A');

    const list = VirtualRobotDB.listDesigns();
    expect(list.some((x) => x.id === saved.design.id)).toBe(true);

    const loaded = list.find((x) => x.id === saved.design.id);
    expect(migrateAssembly(loaded).slots.movement.partId).toBe('tracks');
  });

  test('multiple saves stay independent (DT-002)', () => {
    const a = VirtualRobotDB.saveDesign({ ...createFreshRobotDesign(), id: 'vrd-test-bot-1', name: 'Bot 1' });
    const b = VirtualRobotDB.saveDesign({ ...createFreshRobotDesign(), id: 'vrd-test-bot-2', name: 'Bot 2' });
    expect(a.design.id).not.toBe(b.design.id);
    const names = VirtualRobotDB.listDesigns().map((d) => d.name);
    expect(names).toContain('Bot 1');
    expect(names).toContain('Bot 2');
  });

  test('delete removes design (FT-015)', () => {
    const saved = VirtualRobotDB.saveDesign({ ...createFreshRobotDesign(), name: 'Temp' });
    VirtualRobotDB.deleteDesign(saved.design.id);
    expect(VirtualRobotDB.listDesigns().find((d) => d.id === saved.design.id)).toBeUndefined();
  });

  test('storage full returns error code (ET-002)', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new DOMException('quota', 'QuotaExceededError');
      throw err;
    });
    const result = VirtualRobotDB.saveDesign({ ...createFreshRobotDesign(), name: 'X' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('storage_full');
    spy.mockRestore();
  });
});
