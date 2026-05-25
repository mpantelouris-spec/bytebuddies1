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
  return migrateDesign(syncBlocksToDesign({ ...d, assembly: { ...asm, blocks } }));
}

export function clearBlocks(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const next = syncBlocksToDesign({ ...d, assembly: { ...asm, blocks: [] } });
  next.assembly = { ...asm, blocks: [] };
  return migrateDesign(next);
}

function resetBlockDerivedFields(d) {
  const sensors = Object.fromEntries(Object.keys(d.sensors || {}).map((k) => [k, false]));
  const tools = {
    ...d.tools,
    pincer: false,
    gripper: false,
    bulldozer: false,
    magnet: false,
    drill: false,
    vacuum: false,
    laser: false,
    flamethrower: false,
    longArm: false,
    ballLauncher: false,
    dart: false,
    water: false,
    grabber: 'none',
  };
  const abilities = Object.fromEntries(Object.keys(d.abilities || {}).map((k) => [k, false]));
  return {
    ...d,
    sensors,
    tools,
    abilities,
    modules: {},
    wheels: { type: 'standard', count: 4, size: 'medium', motor: d.wheels?.motor },
  };
}

function applyBlockAffects(d, blocks = []) {
  let next = { ...d };
  blocks.forEach((block) => {
    const type = getBlockType(block.type);
    if (!type?.affects) return;
    if (type.affects.sensors) {
      next.sensors = { ...next.sensors, ...type.affects.sensors };
    }
    if (type.affects.tools) {
      next.tools = { ...next.tools, ...type.affects.tools };
    }
    if (type.affects.wheels) {
      next.wheels = { ...next.wheels, ...type.affects.wheels };
    }
    if (type.affects.modules) {
      next.modules = { ...next.modules, ...type.affects.modules };
    }
    if (type.affects.abilities) {
      next.abilities = { ...next.abilities, ...type.affects.abilities };
    }
  });
  return next;
}

export function syncBlocksToDesign(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const mode = asm.buildMode || 'advanced';

  if (mode === 'blocks') {
    let next = resetBlockDerivedFields(d);
    next = applyBlockAffects(next, asm.blocks);
    next.assembly = { ...asm, mode: 'custom' };
    return migrateDesign(next);
  }

  if (mode === 'hybrid') {
    let next = syncDesignFromAssembly({ ...d, assembly: { ...asm, mode: 'custom' } });
    next = applyBlockAffects(next, asm.blocks);
    next.assembly = { ...asm, mode: 'custom' };
    return migrateDesign(next);
  }

  return syncDesignFromAssembly(d);
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
    program: blueprint.program ? { ...blueprint.program } : d.program,
    assembly: {
      ...asm,
      mode: 'custom',
      buildMode: blueprint.buildMode || 'advanced',
      base: { ...asm.base, ...bpAsm.base },
      slots: { ...asm.slots, ...bpAsm.slots },
      blocks: bpAsm.blocks ? [...bpAsm.blocks] : [],
    },
  };

  const synced = syncBlocksToDesign(migrateDesign(next));
  return syncDesignFromAssembly(synced);
}

export function countBlocks(assembly) {
  return (assembly?.blocks || []).length;
}
