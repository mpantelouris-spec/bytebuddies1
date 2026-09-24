/**
 * TrackPropScatter.js — Instanced scenery every 8–12m along track sides.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import {
  buildFerrisWheel, buildCircusTent,
  buildMetroPillar, buildCastleTower, buildJungleTree, buildTemplePyramid, buildSnowPine,
  buildLavaRiver, buildGear, buildHabitatDome, buildGiantDaisy, buildToadstool,
  buildWindmill, buildOceanPlane, buildCloudSea, buildEarthSphere,
  buildLollipopPole, buildCandyCane, buildTicketBooth, buildCandyShop,
} from './TrackPropBuilders.js';
import { snapPropToRoad } from './TrackGroundSnap.js';

const SCATTER_CONFIG = {
  sunset_cove_01: {
    // Vista + scatter handled by TrackWorldBuilder + glTF enrich after road mesh.
  },
  candy_carnival_01: {
    step: 0.08,
    offset: 12,
    props: ['tent', 'tent', 'lollipop', 'candy_cane', 'tent'],
    landmarks: [
      { fn: () => buildFerrisWheel(1.0), t: 0.12, side: -1, off: 28 },
      { fn: () => buildCircusTent(1.3), t: 0.35, side: 1, off: 24 },
      { fn: () => buildCircusTent(1.2), t: 0.62, side: -1, off: 22 },
    ],
  },
  neon_metro_01: {
    step: 0.07,
    offset: 12,
    props: ['pillar', 'pillar'],
  },
  cloud_citadel_01: {
    step: 0.09,
    offset: 14,
    props: ['tower', 'tower'],
    vista: () => buildCloudSea(200),
    landmarks: [
      { fn: () => buildCastleTower(0.8), t: 0.3, side: 1, off: 20 },
      { fn: () => buildCastleTower(0.7), t: 0.7, side: -1, off: 22 },
    ],
  },
  jungle_ruins_01: {
    step: 0.08,
    offset: 13,
    props: ['jungle', 'jungle', 'jungle'],
    landmarks: [{ fn: () => buildTemplePyramid(1.2), t: 0.25, side: 1, off: 28 }],
  },
  frost_peak_01: {
    step: 0.085,
    offset: 14,
    props: ['pine', 'pine', 'pine'],
  },
  lava_foundry_01: {
    step: 0.09,
    offset: 14,
    props: ['gear', 'gear'],
    vista: () => buildLavaRiver(16, 32),
  },
  star_station_01: {
    step: 0.1,
    offset: 13,
    props: ['dome', 'dome'],
    vista: () => buildEarthSphere(45),
  },
  fairy_glen_01: {
    step: 0.085,
    offset: 12,
    props: ['daisy', 'toadstool', 'daisy'],
  },
  thunder_ridge_01: {
    step: 0.09,
    offset: 14,
    props: ['pine', 'pine'],
  },
};

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

export function scatterTrackProps(world, curve, hw, bounds, arenaType, finishT, perf = null, scene = null) {
  const cfg = SCATTER_CONFIG[arenaType];
  if (!cfg) return;

  if (cfg.vista) {
    const vista = cfg.vista();
    if (arenaType === 'lava_foundry_01') {
      vista.position.set(bounds.cx + 36, -1.6, bounds.cz);
    } else {
      vista.position.set(bounds.cx, 0, bounds.cz);
    }
    world.add(vista);
  }

  if (cfg.landmarks) {
    cfg.landmarks.forEach((lm) => {
      const off = lm.side * (hw + (lm.off ?? 20));
      const { pos, frame } = placeAtTrack(curve, lm.t, off, 0);
      const m = lm.fn();
      m.position.copy(pos);
      const lmY = roadY(curve, lm.t);
      m.position.y += lmY;
      if (scene) m.position.y = snapPropToRoad(scene, pos.x, pos.z, m.position.y);
      m.userData.groundSnap = true;
      m.rotation.y = frame.rot ?? 0;
      world.add(m);
    });
  }

  if (cfg.step && cfg.props?.length) {
    const maxTotal = perf
      ? Math.max(10, Math.round((perf.maxScatterPerSide ?? 14) * 2 * (perf.propMult ?? 1)))
      : 28;
    const builders = {
      tent: () => buildCircusTent(1.2),
      pillar: () => buildMetroPillar(1.25),
      tower: () => buildCastleTower(1.05),
      jungle: () => buildJungleTree(1.2),
      pine: () => buildSnowPine(1.25),
      gear: () => buildGear(1.05),
      dome: () => buildHabitatDome(1.1),
      daisy: () => buildGiantDaisy(1.2),
      toadstool: () => buildToadstool(1.25),
      lollipop: () => buildLollipopPole(1.3),
      candy_cane: () => buildCandyCane(1.25),
    };
    let idx = 0;
    for (let t = 0.05; t < 0.95 && idx < maxTotal; t += cfg.step) {
      const key = cfg.props[idx % cfg.props.length];
      const build = builders[key];
      if (!build) { idx++; continue; }
      const side = idx % 2 ? 1 : -1;
      const off = side * (hw + (cfg.offset ?? 12) + (idx % 3));
      const { pos, frame } = placeAtTrack(curve, t, off, 0);
      const m = build();
      m.position.copy(pos);
      let y = roadY(curve, t);
      if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y);
      m.position.y = y;
      m.rotation.y = frame.rot ?? 0;
      m.userData.groundSnap = true;
      world.add(m);
      idx++;
    }
  }
}

export function animateScatteredProps(world, time) {
  world.traverse((obj) => {
    if (obj.name === 'prop-ferris-wheel') obj.rotation.y = time * 0.08;
    if (obj.name === 'prop-gear') obj.rotation.z = time * 0.5;
    if (obj.name === 'prop-windmill') {
      const blades = obj.getObjectByName('windmill-blades');
      if (blades) blades.rotation.z = time * 0.6;
    }
    if (obj.name === 'lava-river' && obj.children[0]?.material) {
      obj.children[0].material.emissiveIntensity = 0.7 + Math.sin(time * 2.5) * 0.25;
    }
    if (obj.name === 'ocean-plane' && obj.children[0]?.material) {
      obj.children[0].material.emissiveIntensity = 0.12 + Math.sin(time) * 0.06;
    }
    if (obj.userData?.animated && obj.name === 'prop-tiki-torch') {
      const flame = obj.children[1];
      if (flame?.material) flame.material.emissiveIntensity = 0.9 + Math.sin(time * 4) * 0.4;
    }
  });
}
