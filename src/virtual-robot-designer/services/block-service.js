import { migrateDesign } from '../config.js';
import { migrateAssembly, syncDesignFromAssembly } from './assembly-service.js';
import { getBlockType, worldKey, DEFAULT_BLOCKS } from '../data/block-parts.js';

let blockIdCounter = 1;

export function nextBlockId() {
  blockIdCounter += 1;
  return `blk_${Date.now()}_${blockIdCounter}`;
}

export function setBuildMode(design, buildMode) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  return migrateDesign({
    ...d,
    assembly: { ...asm, buildMode, mode: 'custom' },
  });
}

export function placeBlock(design, typeId, gx, gy, gz, rotY = 0) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const type = getBlockType(typeId);
  if (!type) return d;

  const key = worldKey(gx, gy, gz);
  const blocks = [...(asm.blocks || DEFAULT_BLOCKS)];
  if (blocks.some((b) => worldKey(b.x, b.y, b.z) === key)) return d;

  blocks.push({ id: nextBlockId(), type: typeId, x: gx, y: gy, z: gz, rotY });
  const next = syncBlocksToDesign({ ...d, assembly: { ...asm, mode: 'custom', blocks } });
  next.assembly = { ...asm, mode: 'custom', blocks };
  return migrateDesign(next);
}

export function removeBlock(design, blockId) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const blocks = (asm.blocks || []).filter((b) => b.id !== blockId);
  const next = syncBlocksToDesign({ ...d, assembly: { ...asm, blocks } });
  next.assembly = { ...asm, blocks };
  return migrateDesign(next);
}

export function rotateBlock(design, blockId) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const blocks = (asm.blocks || []).map((b) =>
    b.id === blockId ? { ...b, rotY: ((b.rotY || 0) + 90) % 360 } : b,
  );
  return migrateDesign({ ...d, assembly: { ...asm, blocks } });
}

export function clearBlocks(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const next = syncBlocksToDesign({ ...d, assembly: { ...asm, blocks: [] } });
  next.assembly = { ...asm, blocks: [] };
  return migrateDesign(next);
}

function syncBlocksToDesign(design) {
  let d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const blocks = asm.blocks || [];

  blocks.forEach((block) => {
    const type = getBlockType(block.type);
    if (!type?.affects) return;
    if (type.affects.sensors) {
      d.sensors = { ...d.sensors, ...type.affects.sensors };
    }
    if (type.affects.tools) {
      d.tools = { ...d.tools, ...type.affects.tools };
    }
    if (type.affects.wheels) {
      d.wheels = { ...d.wheels, ...type.affects.wheels };
    }
    if (type.affects.modules) {
      d.modules = { ...d.modules, ...type.affects.modules };
    }
    if (type.affects.abilities) {
      d.abilities = { ...d.abilities, ...type.affects.abilities };
    }
  });

  if (asm.buildMode !== 'blocks') {
    d = syncDesignFromAssembly(d);
  }

  return d;
}

export function applyBlueprint(design, blueprint) {
  if (!blueprint) return design;
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const bpAsm = blueprint.assembly || {};

  const next = {
    ...d,
    name: blueprint.name,
    template: 'blank',
    assembly: {
      ...asm,
      mode: 'custom',
      buildMode: blueprint.buildMode || 'advanced',
      base: { ...asm.base, ...bpAsm.base },
      slots: { ...asm.slots, ...bpAsm.slots },
      blocks: bpAsm.blocks ? [...bpAsm.blocks] : [],
    },
  };

  return syncDesignFromAssembly(migrateDesign(next));
}

export function countBlocks(assembly) {
  return (assembly?.blocks || []).length;
}
