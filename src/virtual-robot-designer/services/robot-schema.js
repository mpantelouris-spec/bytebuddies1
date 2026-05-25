/**
 * Spec Part 7 — single source of truth robot JSON.
 * Used by Designer, Simulator, Code Studio, and persistence.
 */
import { migrateDesign } from '../config.js';
import { migrateAssembly, listPlacedParts, syncDesignFromAssembly } from './assembly-service.js';
import { syncBlocksToDesign } from './block-service.js';
import { getBlockType } from '../data/block-parts.js';

export function exportRobotSpec(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const attachments = listPlacedParts(asm).map(({ slotId, category, partId, label }) => ({
    socket: slotId,
    component: partId,
    category,
    label,
    color: asm.base?.color || d.chassis?.color,
    material: asm.base?.material || d.chassis?.material,
  }));

  return {
    robot: {
      id: d.id || `robot_${Date.now()}`,
      name: d.name || 'My Robot',
      mode: asm.buildMode || 'advanced',
      chassis: {
        type: asm.base?.chassisType || asm.base?.shape || 'rover',
        material: asm.base?.material || d.chassis?.material || 'metal',
        color: asm.base?.color || d.chassis?.color || '#8B00FF',
      },
      movement: {
        type: d.wheels?.type || 'standard',
        count: d.wheels?.count ?? 4,
        material: d.wheels?.size || 'medium',
        color: d.cosmetics?.secondaryColor || '#1A1A2E',
      },
      attachments,
      blocks: (asm.blocks || []).map((b) => ({
        type: b.type,
        position: [b.x, b.y, b.z],
        rotation: b.rotY || 0,
        color: getBlockType(b.type)?.color || '#8B00FF',
        material: 'neon_plastic',
      })),
      power: {
        type: d.modules?.power || asm.slots?.back?.partId || 'battery',
        capacity: d.stats?.battery ?? 100,
        color: '#0066FF',
      },
      sensors: Object.entries(d.sensors || {})
        .filter(([, v]) => v)
        .map(([k]) => k),
      ai_module: {
        type: d.modules?.ai || 'standard',
        personality: d.template || 'explorer',
        color: '#8B00FF',
      },
      program: d.program || { mode: 'blocks', blocks: [], python: '', javascript: '' },
      cosmetics: d.cosmetics,
      template: d.template,
    },
  };
}

export function importRobotSpec(spec) {
  const r = spec?.robot || spec;
  if (!r) return null;

  const attachments = r.attachments || [];
  const slots = {
    movement: null, head: null, front: null, left: null, right: null,
    back: null, top: null, addon_a: null, addon_b: null,
  };
  attachments.forEach((a) => {
    if (a.socket && slots[a.socket] !== undefined) {
      slots[a.socket] = { category: a.category, partId: a.component, label: a.label };
    }
  });

  const sensors = {};
  (r.sensors || []).forEach((s) => { sensors[s] = true; });

  let design = migrateDesign({
    name: r.name,
    template: r.template || r.ai_module?.personality || 'rover',
    chassis: {
      shape: r.chassis?.type || 'rectangular',
      color: r.chassis?.color,
      material: r.chassis?.material,
    },
    wheels: r.movement || {},
    sensors,
    program: r.program,
    cosmetics: r.cosmetics,
    assembly: {
      buildMode: r.mode || 'advanced',
      base: {
        chassisType: r.chassis?.type || 'rover',
        shape: r.chassis?.type === 'drone' || r.chassis?.type === 'spider' ? 'round' : 'box',
        color: r.chassis?.color,
        material: r.chassis?.material,
      },
      slots,
      blocks: (r.blocks || []).map((b, i) => ({
        id: `blk_${i}`,
        type: b.type,
        x: b.position?.[0] ?? 0,
        y: b.position?.[1] ?? 0,
        z: b.position?.[2] ?? 0,
        rotY: b.rotation || 0,
      })),
    },
  });

  design = syncBlocksToDesign(design);
  return syncDesignFromAssembly(design);
}
