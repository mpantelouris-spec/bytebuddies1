/**
 * TrackStartHeroKit.js — Large themed props at the start line (visible on first frame).
 */
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { snapPropToRoad } from './TrackGroundSnap.js';

/** scatter = SCATTER_BUILDERS key; building = BUILDING_BUILDERS key */
export const CUP_START_HEROES = {
  sunset_cove_01: [
    { scatter: 'palm', side: -1, off: 9, tOff: 0, scale: 2.8 },
    { scatter: 'palm', side: 1, off: 10, tOff: 0, scale: 2.6 },
    { scatter: 'torch', side: -1, off: 6, tOff: 0, scale: 2.0 },
    { scatter: 'torch', side: 1, off: 6, tOff: 0, scale: 2.0 },
    { scatter: 'hut', side: -1, off: 14, tOff: 0, scale: 2.2 },
    { scatter: 'umbrella', side: 1, off: 12, tOff: 0, scale: 2.0 },
  ],
  candy_carnival_01: [
    { scatter: 'tent', side: 1, off: 10, tOff: 0, scale: 2.4 },
    { scatter: 'lollipop', side: -1, off: 8, tOff: 0, scale: 2.5 },
    { scatter: 'candy_cane', side: 1, off: 8, tOff: 0, scale: 2.3 },
    { building: 'ticket_booth', side: -1, off: 22, tOff: 0.22, scale: 2.0 },
    { scatter: 'tent', side: 1, off: 16, tOff: 0.02, scale: 2.2 },
  ],
  neon_metro_01: [
    { building: 'skyscraper', side: -1, off: 16, tOff: 0, scale: 1.1, h: 28 },
    { building: 'skyscraper', side: 1, off: 18, tOff: 0, scale: 1.0, h: 32 },
    { scatter: 'neon_sign', side: 1, off: 8, tOff: 0, scale: 2.2 },
    { scatter: 'pillar', side: -1, off: 7, tOff: 0, scale: 2.0 },
    { building: 'holo_billboard', side: 0, off: 0, tOff: 0.03, scale: 1.4, y: 8 },
  ],
  cloud_citadel_01: [
    { scatter: 'tower', side: -1, off: 12, tOff: 0, scale: 2.2 },
    { scatter: 'tower', side: 1, off: 13, tOff: 0, scale: 2.1 },
    { building: 'castle_tower', side: -1, off: 20, tOff: 0, scale: 1.8 },
    { building: 'castle_tower', side: 1, off: 22, tOff: 0.02, scale: 1.7 },
  ],
  jungle_ruins_01: [
    { building: 'temple_gate', side: 0, off: 0, tOff: 0, scale: 1.6 },
    { scatter: 'jungle', side: -1, off: 10, tOff: 0, scale: 2.4 },
    { scatter: 'jungle', side: 1, off: 11, tOff: 0, scale: 2.3 },
    { animal: 'statue_jaguar', side: 1, off: 14, tOff: 0, scale: 1.8 },
    { scatter: 'vine_pillar', side: -1, off: 8, tOff: 0, scale: 2.0 },
  ],
  frost_peak_01: [
    { scatter: 'pine', side: -1, off: 10, tOff: 0, scale: 2.5 },
    { scatter: 'pine', side: 1, off: 11, tOff: 0, scale: 2.4 },
    { scatter: 'icicle', side: -1, off: 7, tOff: 0, scale: 2.0 },
    { building: 'ski_lodge', side: -1, off: 18, tOff: 0, scale: 1.8 },
    { scatter: 'pine', side: 1, off: 14, tOff: 0.02, scale: 2.2 },
  ],
  lava_foundry_01: [
    { scatter: 'gear', side: -1, off: 11, tOff: 0, scale: 1.8 },
    { scatter: 'factory_pipe', side: 1, off: 10, tOff: 0, scale: 1.7 },
    { scatter: 'factory_pipe', side: -1, off: 9, tOff: 0.02, scale: 1.6 },
    { scatter: 'gear', side: 1, off: 12, tOff: 0.02, scale: 1.6 },
    { building: 'crane', side: 1, off: 22, tOff: 0.04, scale: 1.2 },
    { building: 'factory_wall', side: -1, off: 28, tOff: 0.08, scale: 1.0 },
  ],
  star_station_01: [
    { scatter: 'dome', side: -1, off: 14, tOff: 0, scale: 2.0 },
    { scatter: 'satellite', side: 1, off: 12, tOff: 0, scale: 2.2 },
    { building: 'habitat_dome', side: -1, off: 20, tOff: 0, scale: 1.7 },
    { building: 'glass_deck', side: 0, off: 0, tOff: 0.04, scale: 1.5 },
    { scatter: 'dome', side: 1, off: 16, tOff: 0.02, scale: 1.9 },
  ],
  fairy_glen_01: [
    { scatter: 'daisy', side: -1, off: 9, tOff: 0, scale: 2.8 },
    { scatter: 'toadstool', side: 1, off: 10, tOff: 0, scale: 2.6 },
    { scatter: 'lollipop_tree', side: -1, off: 12, tOff: 0, scale: 2.4 },
    { building: 'fairy_cottage', side: 1, off: 18, tOff: 0, scale: 1.8 },
    { scatter: 'daisy', side: 1, off: 8, tOff: 0, scale: 2.5 },
  ],
  thunder_ridge_01: [
    { building: 'windmill', side: -1, off: 18, tOff: 0, scale: 1.8 },
    { scatter: 'pine', side: -1, off: 10, tOff: 0, scale: 2.4 },
    { scatter: 'pine', side: 1, off: 11, tOff: 0, scale: 2.3 },
    { scatter: 'barn', side: 1, off: 14, tOff: 0, scale: 2.2 },
    { building: 'barn', side: -1, off: 20, tOff: 0.02, scale: 1.9 },
  ],
};

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

/**
 * Place large hero props at/near finish line so the chase camera sees a themed world immediately.
 */
export function placeStartLineHeroes(
  world,
  curve,
  hw,
  arenaType,
  finishT,
  scene,
  perf,
  { scatterBuilders, buildingBuilders, animalBuilders, placeOnTrack },
) {
  const heroes = CUP_START_HEROES[arenaType];
  if (!heroes?.length) return 0;

  let placed = 0;
  heroes.forEach((h, i) => {
    let obj = null;

    if (h.scatter && scatterBuilders[h.scatter]) {
      obj = scatterBuilders[h.scatter]();
      obj.name = `prop-start-${h.scatter}-${i}`;
    } else if (h.building && buildingBuilders[h.building]) {
      obj = buildingBuilders[h.building]({ h: h.h });
      obj.name = `prop-start-building-${h.building}-${i}`;
    } else if (h.animal && animalBuilders[h.animal]) {
      obj = animalBuilders[h.animal]();
      obj.name = `prop-start-animal-${h.animal}-${i}`;
    }
    if (!obj) return;

    const scale = Math.max(h.scale ?? 2.0, 1.5);
    obj.scale.multiplyScalar(scale);
    const side = h.side ?? 1;
    const tNorm = ((finishT + (h.tOff ?? 0)) % 1 + 1) % 1;

    if (side === 0) {
      const lateral = h.off ?? 12;
      const { pos, frame } = placeAtTrack(curve, tNorm, lateral, 0);
      obj.position.copy(pos);
      let y = roadY(curve, tNorm) + (h.y ?? 0);
      if (scene) y = snapPropToRoad(scene, pos.x, pos.z, roadY(curve, tNorm)) + (h.y ?? 0);
      obj.position.y = y;
      obj.rotation.y = frame.rot ?? 0;
      obj.userData.groundSnap = true;
      world.add(obj);
    } else {
      placeOnTrack(world, curve, hw, scene, perf, {
        t: tNorm,
        side,
        off: h.off ?? 8,
        y: h.y ?? 0,
      }, obj);
    }
    placed++;
  });

  console.log('[TrackStartHero]', arenaType, { placed, finishT });
  return placed;
}

/** Reposition vista so it fills the chase-camera view at the start line (+tan = forward). */
export function alignVistaToStart(world, curve, finishT, hw, recipe) {
  if (!recipe?.vista) return;
  const frame = sampleTrackFrame(curve, finishT);
  const vistaName = recipe.vista === 'ocean' ? 'ocean-plane'
    : recipe.vista === 'cloud_sea' ? 'cloud-sea'
    : recipe.vista === 'lava' ? 'lava-river'
    : recipe.vista === 'earth' ? 'earth-sphere'
    : null;

  const vista = world.children.find((c) => c.name === vistaName);
  if (!vista) return;

  if (recipe.vista === 'ocean') {
    const ahead = frame.tan.clone().multiplyScalar(30);
    const lateral = frame.n.clone().multiplyScalar(-28);
    vista.position.copy(frame.p).add(ahead).add(lateral);
    vista.position.y = -0.32;
    vista.scale.set(2.1, 1, 2.1);
    vista.rotation.y = frame.rot ?? 0;
    return;
  }

  if (recipe.vista === 'cloud_sea') {
    const ahead = frame.tan.clone().multiplyScalar(28);
    vista.position.copy(frame.p).add(ahead);
    vista.position.y = -6;
    vista.scale.set(1.7, 1, 1.7);
    return;
  }

  if (recipe.vista === 'lava') {
    const ahead = frame.tan.clone().multiplyScalar(18);
    const lateral = frame.n.clone().multiplyScalar(26);
    vista.position.copy(frame.p).add(ahead).add(lateral);
    vista.position.y = -1.6;
    vista.scale.set(1.05, 1, 1.05);
    vista.rotation.y = frame.rot ?? 0;
    return;
  }

  const ahead = frame.tan.clone().multiplyScalar(30);
  vista.position.copy(frame.p).add(ahead);
  vista.position.y = -8;
  if (recipe.vista === 'earth') vista.scale.set(1.8, 1.8, 1.8);
}
