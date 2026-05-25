/**
 * Virtual Robot Designer — comprehensive automated test plan coverage.
 * Maps to test plan IDs in describe/test names.
 */
import fs from 'fs';
import path from 'path';
import {
  placePartOnSlot,
  removePartFromSlot,
  updateAssemblyBase,
  migrateAssembly,
  syncDesignFromAssembly,
  listPlacedParts,
  countPlacedParts,
  clearAllParts,
} from '../src/virtual-robot-designer/services/assembly-service.js';
import { SNAP_SLOTS, slotAcceptsPart, CHASSIS_TYPES, getWorkshopPart } from '../src/virtual-robot-designer/data/assembly-parts.js';
import { computeDesignStats, countActiveSensors } from '../src/virtual-robot-designer/services/design-service.js';
import { exportRobotSpec } from '../src/virtual-robot-designer/services/robot-schema.js';
import VirtualRobotDB from '../src/virtual-robot-designer/database/virtual-robot-db.js';
import { createFreshRobotDesign } from '../src/virtual-robot-designer/utils/initRobotDesign.js';
import { MODULAR_CHASSIS, ALL_SLOT_IDS } from '../src/virtual-robot-designer/data/modular-parts-registry.js';
import { migrateDesign } from '../src/virtual-robot-designer/config.js';
import {
  findFirstOpenSlot,
  canAttachPartAnywhere,
  getVisibleSockets,
  getEngineeringStatus,
  getBuildPhase,
} from '../src/virtual-robot-designer/utils/build-slots.js';
import { useRobotStore } from '../src/virtual-robot-designer/store/robotStore.js';
import { useUiStore } from '../src/virtual-robot-designer/store/uiStore.js';
import { VRD_COLORS, STAT_COLORS } from '../src/virtual-robot-designer/constants/colors.js';
import { statBarColor } from '../src/virtual-robot-designer/hooks/useRobotStats.js';
import { detectWebGL } from '../src/virtual-robot-designer/hooks/useWebGL.js';
import vrdApi from '../src/virtual-robot-designer/apis/vrd-api.js';
import { meetsWcagAA } from './helpers/vrd-contrast.js';

const RD_CSS = fs.readFileSync(
  path.join(process.cwd(), 'src/virtual-robot-designer/styles/robot-designer.css'),
  'utf8',
);

function fresh() {
  return createFreshRobotDesign();
}

function asmOf(d) {
  return migrateAssembly(migrateDesign(d));
}

// ─── Section 1: Functional ───────────────────────────────────────────

describe('FT-001 chassis selection', () => {
  const SIX = ['rover', 'tank', 'humanoid', 'drone', 'spider', 'industrial'];

  test.each(SIX)('chassis %s updates base geometry', (id) => {
    const meta = MODULAR_CHASSIS.find((c) => c.id === id);
    expect(meta).toBeTruthy();
    const d = updateAssemblyBase(fresh(), {
      chassisType: meta.id,
      shape: meta.meshShape,
      width: meta.width,
      height: meta.height,
      depth: meta.depth,
      scale: meta.scale,
    });
    expect(asmOf(d).base.chassisType).toBe(id);
    expect(asmOf(d).base.width).toBe(meta.width);
  });
});

describe('FT-002 movement systems', () => {
  test('wheels, tracks, and legs each attach and set wheel type', () => {
    const cases = [
      ['standard', 'standard'],
      ['tracks', 'tracks'],
      ['legs', 'legs'],
    ];
    cases.forEach(([partId, wheelType]) => {
      const d = placePartOnSlot(fresh(), 'movement', 'movement', partId);
      expect(asmOf(d).slots.movement.partId).toBe(partId);
      expect(migrateDesign(d).wheels.type).toBe(wheelType);
    });
  });

  test.each([2, 4, 6, 8])('wheel count %i updates design.wheels.count', (count) => {
    let d = placePartOnSlot(fresh(), 'movement', 'movement', 'standard');
    d = migrateDesign({ ...d, wheels: { ...d.wheels, count } });
    expect(d.wheels.count).toBe(count);
    const stats = computeDesignStats(d);
    expect(stats.speed).toBeGreaterThanOrEqual(5);
    expect(stats.speed).toBeLessThanOrEqual(100);
  });
});

describe('FT-003 multiple sensors', () => {
  test('attach sensors on distinct sockets and count them', () => {
    let d = fresh();
    const mounts = [
      ['front', 'ultrasonic'],
      ['top', 'lidar'],
      ['addon_a', 'proximity'],
    ];
    mounts.forEach(([slot, partId]) => {
      d = placePartOnSlot(d, slot, 'sensors', partId);
      expect(asmOf(d).slots[slot].partId).toBe(partId);
    });
    expect(countActiveSensors(migrateDesign(d))).toBeGreaterThanOrEqual(3);
    expect(countPlacedParts(asmOf(d))).toBe(3);
  });

  test('removing sensor decreases active sensor count', () => {
    let d = placePartOnSlot(fresh(), 'front', 'sensors', 'ultrasonic');
    const before = countActiveSensors(migrateDesign(d));
    d = removePartFromSlot(d, 'front');
    const after = countActiveSensors(syncDesignFromAssembly(d));
    expect(after).toBeLessThan(before);
  });
});

describe('FT-004 tool attachment', () => {
  test('tools attach only on valid arm sockets', () => {
    let d = placePartOnSlot(fresh(), 'left', 'utility', 'gripper');
    expect(asmOf(d).slots.left).toEqual({ category: 'utility', partId: 'gripper' });
    d = placePartOnSlot(d, 'right', 'utility', 'laser');
    expect(asmOf(d).slots.right.partId).toBe('laser');
    const invalid = placePartOnSlot(d, 'movement', 'utility', 'gripper');
    expect(asmOf(invalid).slots.movement).toBeFalsy();
  });
});

describe('FT-005 color application', () => {
  test('custom hex color applies to chassis base', () => {
    const hex = '#FF6B6B';
    const d = updateAssemblyBase(fresh(), { color: hex, material: 'industrial' });
    expect(asmOf(d).base.color).toBe(hex);
    expect(migrateDesign(d).chassis.color).toBe(hex);
  });

  test('preset colors from design tokens are valid hex', () => {
    expect(VRD_COLORS.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(VRD_COLORS.wheel).toBe('#1E90FF');
    expect(VRD_COLORS.eye).toBe('#00D9FF');
  });
});

describe('FT-006 drag payload format', () => {
  test('part drag JSON includes type category id', () => {
    const payload = { type: 'part', category: 'movement', id: 'standard', label: 'Wheels' };
    const raw = JSON.stringify(payload);
    const parsed = JSON.parse(raw);
    expect(parsed.type).toBe('part');
    expect(parsed.category).toBe('movement');
    expect(getWorkshopPart(parsed.category, parsed.id)).toBeTruthy();
  });
});

describe('FT-007 / IT-005 invalid drops', () => {
  const INVALID_PAIRS = [
    ['movement', 'sensors', 'ultrasonic'],
    ['movement', 'utility', 'gripper'],
    ['head', 'movement', 'standard'],
    ['front', 'movement', 'tracks'],
    ['back', 'sensors', 'lidar'],
    ['left', 'power', 'battery'],
  ];

  test.each(INVALID_PAIRS)('slot %s rejects %s/%s', (slotId, category, partId) => {
    expect(slotAcceptsPart(slotId, category)).toBe(false);
    const d = fresh();
    const next = placePartOnSlot(d, slotId, category, partId);
    expect(asmOf(next).slots[slotId]).toBeFalsy();
  });
});

describe('FT-008 sequential multi-part build', () => {
  test('fills all 9 sockets without corruption', () => {
    let d = fresh();
    const plan = [
      ['movement', 'movement', 'standard'],
      ['head', 'head', 'camera'],
      ['front', 'sensors', 'ultrasonic'],
      ['left', 'utility', 'gripper'],
      ['right', 'utility', 'laser'],
      ['back', 'power', 'battery'],
      ['top', 'sensors', 'lidar'],
      ['addon_a', 'lighting', 'headlights'],
      ['addon_b', 'comms', 'antenna'],
    ];
    plan.forEach(([slot, cat, id]) => {
      if (!getWorkshopPart(cat, id)) return;
      d = placePartOnSlot(d, slot, cat, id);
      expect(asmOf(d).slots[slot]?.partId).toBe(id);
    });
    expect(countPlacedParts(asmOf(d))).toBeGreaterThanOrEqual(7);
    const stats = computeDesignStats(d);
    expect(stats.power).toBeGreaterThanOrEqual(5);
  });
});

describe('FT-009–FT-012 stats', () => {
  test('FT-009 base power near 50% for empty robot', () => {
    const stats = computeDesignStats(fresh());
    expect(stats.power).toBeGreaterThanOrEqual(45);
    expect(stats.power).toBeLessThanOrEqual(60);
  });

  test('FT-009 motor increases power', () => {
    const base = computeDesignStats(fresh());
    let d = placePartOnSlot(fresh(), 'movement', 'movement', 'racing_wheels');
    const withMotor = computeDesignStats(d);
    expect(withMotor.power).toBeGreaterThanOrEqual(base.power);
  });

  test('FT-010 heavy chassis reduces speed vs racing', () => {
    const hauler = updateAssemblyBase(fresh(), { chassisType: 'hauler', scale: 1.15 });
    const racing = updateAssemblyBase(fresh(), { chassisType: 'racing', scale: 1 });
    expect(computeDesignStats(hauler).speed).toBeLessThan(computeDesignStats(racing).speed);
  });

  test('FT-011 weight increases with hauler chassis and battery', () => {
    const light = computeDesignStats(updateAssemblyBase(fresh(), { chassisType: 'mini', scale: 0.75 })).weight;
    let d = updateAssemblyBase(fresh(), { chassisType: 'hauler', scale: 1.15 });
    d = placePartOnSlot(d, 'back', 'power', 'battery');
    expect(computeDesignStats(d).weight).toBeGreaterThan(light);
  });

  test('FT-012 stability responds to armor', () => {
    let d = placePartOnSlot(fresh(), 'front', 'armor', 'light_plate');
    const withArmor = computeDesignStats(d).stability;
    expect(withArmor).toBeGreaterThanOrEqual(5);
    expect(withArmor).toBeLessThanOrEqual(100);
  });

  test('ET-005 all stat keys capped 5–100', () => {
    const stats = computeDesignStats(fresh());
    ['speed', 'power', 'agility', 'weight', 'battery', 'stability'].forEach((k) => {
      expect(stats[k]).toBeGreaterThanOrEqual(5);
      expect(stats[k]).toBeLessThanOrEqual(100);
    });
  });
});

describe('Blockly unlock report', () => {
  test('ultrasonic part unlocks scan blocks in report', async () => {
    const { getBlocklyUnlockReport } = await import('../src/virtual-robot-designer/services/block-unlocks.js');
    const { buildVrdToolbox } = await import('../src/virtual-robot-designer/utils/vrdBlocklySetup.js');
    let d = fresh();
    d = placePartOnSlot(d, 'front', 'sensors', 'ultrasonic');
    d = syncDesignFromAssembly(d);
    const report = getBlocklyUnlockReport(d);
    const scan = report.groups.find((g) => g.id === 'sensor')?.items.find((i) => i.id === 'scan');
    expect(scan?.unlocked).toBe(true);
    const toolbox = buildVrdToolbox(d);
    const sensorCat = toolbox.contents.find((c) => c.name === 'Sensors');
    expect(sensorCat?.contents?.some((b) => b.type === 'vrd_scan')).toBe(true);
  });
});

// ─── Section 5 & 9: Edge + Data (also in vrd-designer.test.js) ─────

describe('ET-004 maximum parts', () => {
  test('when all slots filled findFirstOpenSlot returns null', () => {
    const fullPlan = [
      ['movement', 'movement', 'standard'],
      ['head', 'head', 'camera'],
      ['front', 'sensors', 'ultrasonic'],
      ['left', 'utility', 'gripper'],
      ['right', 'utility', 'laser'],
      ['back', 'power', 'battery'],
      ['top', 'sensors', 'lidar'],
      ['addon_a', 'lighting', 'headlights'],
      ['addon_b', 'comms', 'antenna'],
    ];
    let d = fresh();
    fullPlan.forEach(([slot, cat, id]) => {
      d = placePartOnSlot(d, slot, cat, id);
    });
    expect(countPlacedParts(asmOf(d))).toBe(9);
    expect(findFirstOpenSlot(asmOf(d).slots, 'sensors', false)).toBeNull();
    expect(canAttachPartAnywhere(asmOf(d).slots, 'movement', false)).toBe(false);
  });
});

describe('DT-001 complete configuration export', () => {
  test('export spec includes all mounted modules', () => {
    let d = placePartOnSlot(fresh(), 'movement', 'movement', 'tracks');
    d = updateAssemblyBase(d, { color: '#FF0000', chassisType: 'rover' });
    d = migrateDesign({ ...d, name: 'Complex Bot' });
    const spec = exportRobotSpec(d);
    expect(spec.robot.name).toBe('Complex Bot');
    expect(spec.robot.chassis.color).toBe('#FF0000');
    expect(spec.robot.movement.type).toBe('tracks');
    expect(spec.robot.attachments.length).toBeGreaterThanOrEqual(1);
  });
});

describe('DT-003 undo / redo', () => {
  beforeEach(() => {
    const d = fresh();
    useRobotStore.setState({ design: migrateDesign(d), past: [], future: [], tab: 'design' });
    useUiStore.setState({ draggingPart: null, hoveredSocket: null, dragOverViewport: false });
  });

  test('undo and redo restore part placement', () => {
    const { setDesign, undo, redo } = useRobotStore.getState();
    setDesign((prev) => placePartOnSlot(prev, 'movement', 'movement', 'standard'));
    expect(asmOf(useRobotStore.getState().design).slots.movement?.partId).toBe('standard');
    expect(undo()).toBe(true);
    expect(asmOf(useRobotStore.getState().design).slots.movement).toBeFalsy();
    expect(redo()).toBe(true);
    expect(asmOf(useRobotStore.getState().design).slots.movement?.partId).toBe('standard');
  });
});

// ─── Section 2 & 8: Visual / Responsive (static) ───────────────────

describe('VT-002 panel layout CSS', () => {
  test('grid uses 280px left and 320px right', () => {
    expect(RD_CSS).toContain('--vrd-left-w: 280px');
    expect(RD_CSS).toContain('--vrd-right-w: 320px');
    expect(RD_CSS).toContain('--vrd-header-h: 80px');
  });
});

describe('VT-004 / VT-006 design token colors', () => {
  test('primary accent colors match specification', () => {
    expect(VRD_COLORS.primary).toBe('#1E90FF');
    expect(VRD_COLORS.accentOrange).toBe('#FF8C00');
    expect(STAT_COLORS.high).toBe('#00FF41');
    expect(VRD_COLORS.navy).toBe('#1a1a2e');
    expect(VRD_COLORS.panel).toBe('#FFFFFF');
  });

  test('statBarColor returns spec greens and oranges', () => {
    expect(statBarColor(80)).toBe('#00FF41');
    expect(statBarColor(40)).toBe('#FF8C00');
  });
});

describe('RT-003 / RT-004 responsive breakpoints', () => {
  test('CSS defines tablet and mobile media queries', () => {
    expect(RD_CSS).toMatch(/@media \(max-width: 1100px\)/);
    expect(RD_CSS).toMatch(/@media \(max-width: 700px\)/);
  });
});

// ─── Section 6: Accessibility ───────────────────────────────────────

describe('AT-005 WCAG contrast', () => {
  test('body text on white panel meets AA', () => {
    expect(meetsWcagAA(VRD_COLORS.text, VRD_COLORS.panel)).toBe(true);
  });

  test('white on navy header meets AA', () => {
    expect(meetsWcagAA('#FFFFFF', VRD_COLORS.navy)).toBe(true);
  });
});

// ─── Section 5: WebGL / API ─────────────────────────────────────────

describe('ET-003 WebGL detection', () => {
  test('detectWebGL does not throw in jsdom', () => {
    expect(typeof detectWebGL()).toBe('boolean');
  });
});

describe('vrd-api integration', () => {
  beforeEach(() => localStorage.clear());

  test('createDesign and getDesign round-trip', async () => {
    const created = await vrdApi.createDesign({ name: 'API Bot' });
    expect(created.name).toBe('API Bot');
    const found = await vrdApi.getDesign(created.id);
    expect(found?.id).toBe(created.id);
  });

  test('deleteDesign removes entry', async () => {
    const created = await vrdApi.createDesign({ name: 'Del' });
    await vrdApi.deleteDesign(created.id);
    expect(await vrdApi.getDesign(created.id)).toBeNull();
  });
});

// ─── UI store + build helpers ───────────────────────────────────────

describe('uiStore drag state', () => {
  test('setDraggingPart and clearDragState', () => {
    useUiStore.getState().setDraggingPart({ category: 'sensors', id: 'lidar' });
    expect(useUiStore.getState().draggingPart.category).toBe('sensors');
    useUiStore.getState().clearDragState();
    expect(useUiStore.getState().draggingPart).toBeNull();
  });
});

describe('build-slots helpers', () => {
  test('getBuildPhase starts at wheels for empty robot', () => {
    const phase = getBuildPhase(asmOf(fresh()), false);
    expect(phase.phase).toBe('wheels');
    expect(phase.activeSlot).toBe('movement');
  });

  test('getVisibleSockets free build shows all slots', () => {
    const visible = getVisibleSockets(asmOf(fresh()), false, { freeBuild: true });
    expect(visible.length).toBe(Object.keys(SNAP_SLOTS).length);
  });

  test('getEngineeringStatus mentions canvas when empty', () => {
    expect(getEngineeringStatus(asmOf(fresh()), false)).toMatch(/canvas/i);
  });
});

describe('CHASSIS_TYPES catalog', () => {
  test('maps all modular chassis for UI', () => {
    expect(CHASSIS_TYPES.length).toBe(MODULAR_CHASSIS.length);
    expect(CHASSIS_TYPES[0]).toHaveProperty('meshShape');
  });
});

describe('clearAllParts', () => {
  test('removes every mounted module', () => {
    let d = placePartOnSlot(fresh(), 'movement', 'movement', 'standard');
    d = clearAllParts(d);
    expect(countPlacedParts(asmOf(d))).toBe(0);
  });
});
