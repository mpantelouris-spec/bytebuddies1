/**
 * ArenaBroadcastKit — FIFA / CodeRacer-tier lighting, palette, and scatter for mission arenas.
 * Mirrors BiomeAAAVisualSpec + TrackWorldRecipes density — not flat void + boxes.
 */
import * as THREE from 'three';
import {
  addHorizonSilhouette, dressRouteCorridor, addMartianRock, addConveyor,
  addWarehouseShelf, addCoralCluster, addNeonRingGate, addLaserGridPair, addTargetMarker,
  addCommDish, addLedStackLight, addHospitalGurney, addFireHydrant, addHelipad,
  addWarpTunnel, addSecurityCamera,
} from './ArenaSceneryKit.js';
import { MISSION_FAMILY_VISUALS } from './mission-world/MissionVisualBibleV2.js';

/** Bible Part 0 camera profiles — wired to sampleFixedChaseCamera in LiveLab. */
export const MISSION_CAMERA_PRESETS = {
  rover_wide: { camBack: 7, camUp: 3.4, lookAhead: 7, lookHeight: 0.8, fov: 50 },
  factory_overview: { camBack: 7.5, camUp: 4.2, lookAhead: 5.5, lookHeight: 1.0, fov: 48 },
  underwater_follow: { camBack: 6.6, camUp: 2.6, lookAhead: 5, lookHeight: 0.5, fov: 52 },
  chase_close: { camBack: 6.2, camUp: 2.4, lookAhead: 4, lookHeight: 0.6, fov: 52 },
  aerial_chase: { camBack: 10.5, camUp: 5.8, lookAhead: 12, lookHeight: 3.0, fov: 48 },
  stealth_follow: { camBack: 6.8, camUp: 3.0, lookAhead: 5, lookHeight: 1.0, fov: 48 },
  climber_follow: { camBack: 6.2, camUp: 5.2, lookAhead: 4, lookHeight: 2.0, fov: 48 },
  fight_broadcast: { camBack: 0, camUp: 3, lookAhead: 0, lookHeight: 1, fov: 50 },
  side_scroll: { camBack: 0, camUp: 0.55, lookAhead: 0, lookHeight: 0.35, fov: 50 },
  lab_overview: { camBack: 7, camUp: 3.6, lookAhead: 5, lookHeight: 0.5, fov: 50 },
  race_chase: { camBack: 7.4, camUp: 2.8, lookAhead: 6, lookHeight: 0.7, fov: 50 },
};

export function getMissionCameraPreset(cameraId) {
  return MISSION_CAMERA_PRESETS[cameraId] || MISSION_CAMERA_PRESETS.chase_close;
}

function scatterMat(col, em = 0, ei = 0, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: col, emissive: em || col, emissiveIntensity: ei, roughness: 0.72, metalness: 0.12, ...opts,
  });
}

function placeScatterProp(scene, kind, x, z, family) {
  const y = 0;
  switch (kind) {
    case 'rock': addMartianRock(scene, x, z); break;
    case 'flag': {
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), scatterMat(0x1e40af, 0x3b82f6, 0.25));
      flag.position.set(x, 1.8, z);
      scene.add(flag);
      break;
    }
    case 'beacon': {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), scatterMat(0xfbbf24, 0xfbbf24, 1.2));
      lamp.position.set(x, 2.1, z);
      scene.add(lamp);
      break;
    }
    case 'panel': {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.12), scatterMat(0x64748b, 0x3b82f6, 0.15));
      panel.position.set(x, 0.9, z);
      scene.add(panel);
      break;
    }
    case 'shelf': addWarehouseShelf(scene, x, z); break;
    case 'conveyor': addConveyor(scene, x, z, 4); break;
    case 'crate': {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), scatterMat(0xfbbf24));
      crate.position.set(x, 0.45, z);
      scene.add(crate);
      break;
    }
    case 'light': {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), scatterMat(0xfbbf24, 0xfbbf24, 1.1));
      bulb.position.set(x, 3.2, z);
      scene.add(bulb);
      break;
    }
    case 'coral': addCoralCluster(scene, x, z); break;
    case 'kelp': addCoralCluster(scene, x, z); break;
    case 'wreck': {
      const wreck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.2), scatterMat(0x475569));
      wreck.position.set(x, 0.4, z);
      wreck.rotation.y = Math.random() * Math.PI;
      scene.add(wreck);
      break;
    }
    case 'cone': {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 6), scatterMat(0xf97316, 0xf97316, 0.45));
      cone.position.set(x, 0.35, z);
      scene.add(cone);
      break;
    }
    case 'barrier': {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.35), scatterMat(0xef4444, 0xdc2626, 0.2));
      bar.position.set(x, 0.45, z);
      scene.add(bar);
      break;
    }
    case 'hydrant': addFireHydrant(scene, x, z); break;
    case 'tape': {
      const tape = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.35), scatterMat(0xfbbf24, 0xfbbf24, 0.5));
      tape.rotation.x = -Math.PI / 2;
      tape.position.set(x, 0.05, z);
      scene.add(tape);
      break;
    }
    case 'ring': addNeonRingGate(scene, x, 2.8, z, family === 'hybrid_race_sky' ? 0xec4899 : 0x06b6d4); break;
    case 'pylon': {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 4.5, 6), scatterMat(0x94a3b8));
      pylon.position.set(x, 2.25, z);
      scene.add(pylon);
      break;
    }
    case 'cloud': {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), scatterMat(0xffffff, 0, 0, { transparent: true, opacity: 0.55 }));
      cloud.position.set(x, 5 + Math.random() * 4, z);
      scene.add(cloud);
      break;
    }
    case 'pad': {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 16), scatterMat(0x22c55e, 0x22c55e, 0.35));
      pad.position.set(x, 0.06, z);
      scene.add(pad);
      break;
    }
    case 'boost': addNeonRingGate(scene, x, 1.2, z, 0xfbbf24); break;
    case 'neon': {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), scatterMat(0xec4899, 0xec4899, 0.9));
      sign.position.set(x, 2.5, z);
      scene.add(sign);
      break;
    }
    case 'sign': {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), scatterMat(0x06b6d4, 0x06b6d4, 0.75));
      sign.position.set(x, 2.2, z);
      scene.add(sign);
      break;
    }
    case 'laser': addLaserGridPair(scene, x, z, 3); break;
    case 'vent': {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.2), scatterMat(0x374151));
      vent.position.set(x, 0.18, z);
      scene.add(vent);
      break;
    }
    case 'tower': {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), scatterMat(0x1e293b, 0x3b82f6, 0.08));
      tower.position.set(x, 4, z);
      scene.add(tower);
      break;
    }
    case 'pipe': {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 8), scatterMat(0x78716c, 0, 0, { metalness: 0.45 }));
      pipe.position.set(x, 2.5, z);
      scene.add(pipe);
      break;
    }
    case 'web': {
      const web = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), scatterMat(0xe2e8f0, 0x10b981, 0.15, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
      web.position.set(x, 2, z);
      scene.add(web);
      break;
    }
    case 'girder': {
      const girder = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 0.35), scatterMat(0x57534e));
      girder.position.set(x, 3.5, z);
      scene.add(girder);
      break;
    }
    case 'fungus': {
      const fungus = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), scatterMat(0xa855f7, 0xc084fc, 0.4));
      fungus.position.set(x, 0.35, z);
      scene.add(fungus);
      break;
    }
    case 'rope': {
      const rope = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.5, 0.08), scatterMat(0xef4444));
      rope.position.set(x, 1.25, z);
      scene.add(rope);
      break;
    }
    case 'post': {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8), scatterMat(0xe5e7eb));
      post.position.set(x, 1.4, z);
      scene.add(post);
      break;
    }
    case 'banner': {
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), scatterMat(0xef4444, 0xfbbf24, 0.35));
      banner.position.set(x, 2.8, z);
      scene.add(banner);
      break;
    }
    case 'crowd': {
      for (let c = 0; c < 4; c++) {
        const fan = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.35), scatterMat(0x64748b));
        fan.position.set(x + (c - 1.5) * 0.5, 0.35, z + Math.random() * 0.4);
        scene.add(fan);
      }
      break;
    }
    case 'nest': {
      const nest = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.35, 8), scatterMat(0x8b5cf6));
      nest.position.set(x, 0.2, z);
      scene.add(nest);
      break;
    }
    case 'balloon': {
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), scatterMat(0xef4444, 0xf97316, 0.35));
      balloon.position.set(x, 2.5, z);
      scene.add(balloon);
      break;
    }
    case 'tile': {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), scatterMat(0x3b82f6));
      tile.position.set(x, 0.04, z);
      scene.add(tile);
      break;
    }
    case 'wall': {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 0.4), scatterMat(0x64748b));
      wall.position.set(x, 0.9, z);
      scene.add(wall);
      break;
    }
    case 'target': addTargetMarker(scene, x, z); break;
    case 'stack': addLedStackLight(scene, x, z); break;
    case 'dish': addCommDish(scene, x, z); break;
    case 'gurney': addHospitalGurney(scene, x, z); break;
    default: addMartianRock(scene, x, z);
  }
}

/** Scatter Part 1 prop kits + route corridor dressing (not grey void). */
export function scatterFamilyArena(scene, environmentId = 'industrial', curve = null) {
  const spec = ARENA_FAMILY_AAA[environmentId] || ARENA_FAMILY_AAA.industrial;
  const scatter = spec.scatter || ['crate', 'light'];
  const family = environmentId === 'hybrid_race_sky' ? 'sky_aerial' : environmentId;

  if (curve && !scene.userData.routeCorridorDressed) {
    dressRouteCorridor(scene, curve, family in ARENA_FAMILY_AAA ? family : 'industrial');
    scene.userData.routeCorridorDressed = true;
  }

  if (scene.getObjectByName('FamilyScatterRoot')) return;

  const root = new THREE.Group();
  root.name = 'FamilyScatterRoot';

  const count = scatter.length * 8;
  for (let i = 0; i < count; i++) {
    const kind = scatter[i % scatter.length];
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const r = 12 + Math.random() * 14;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r - 12;
    placeScatterProp(scene, kind, x, z, family);
  }

  scene.add(root);
}

/** 2–3 hero props at route start — bible Part 1 prop kits */
export function applyFamilyHeroKit(scene, environmentId = 'industrial', curve = null) {
  if (scene.getObjectByName('FamilyHeroKit')) return;
  const g = new THREE.Group();
  g.name = 'FamilyHeroKit';
  const start = curve?.getPoint?.(0);
  const mid = curve?.getPoint?.(0.42);
  const sx = start?.x ?? 0;
  const sz = start?.z ?? 4;
  const mx = mid?.x ?? -4;
  const mz = mid?.z ?? -12;

  switch (environmentId) {
    case 'martian':
      addCommDish(scene, sx - 6, sz - 2);
      addMartianRock(scene, sx + 5, sz + 1);
      break;
    case 'industrial':
      addLedStackLight(scene, sx - 5, sz);
      addConveyor(scene, sx + 6, sz - 3, 5);
      break;
    case 'underwater':
      addCoralCluster(scene, sx - 5, sz);
      addCoralCluster(scene, sx + 4, sz - 2);
      break;
    case 'emergency':
      addFireHydrant(scene, mx, mz);
      addHospitalGurney(scene, sx - 4, sz + 2);
      break;
    case 'sky_aerial':
      addHelipad(scene, sx - 7, sz);
      addNeonRingGate(scene, mx, 3, mz, 0x06b6d4);
      break;
    case 'hybrid_race_sky':
      addHelipad(scene, sx - 7, sz);
      addWarpTunnel(scene, mx, 2.5, mz);
      addNeonRingGate(scene, mx + 5, 3.5, mz - 8, 0xec4899);
      break;
    case 'cyber_ninja':
      addSecurityCamera(scene, sx - 4, sz - 3);
      addLaserGridPair(scene, mx, mz, 4);
      break;
    case 'spider_climber':
      addLaserGridPair(scene, mx, mz, 3);
      break;
    case 'boxing_mech':
      addNeonRingGate(scene, sx, 2, sz, 0xef4444);
      break;
    default:
      addLedStackLight(scene, sx - 4, sz);
  }
  scene.add(g);
}

export function applyUndulatingGroundOverlay(scene, spec) {
  if (scene.getObjectByName('MissionTerrainOverlay') || scene.userData.biomeAAA) return;
  const size = 88;
  const geo = new THREE.PlaneGeometry(size, size, 44, 44);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave = Math.sin(x * 0.14) * 0.32 + Math.cos(y * 0.11) * 0.26 + Math.sin((x + y) * 0.07) * 0.18;
    pos.setZ(i, wave);
  }
  geo.computeVertexNormals();
  const colors = [];
  const base = new THREE.Color(spec.ground);
  const accent = new THREE.Color(spec.keyLight);
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getZ(i);
    const c = base.clone().lerp(accent, Math.max(0, Math.min(1, h * 0.12 + 0.06)));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0.06 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.03;
  mesh.receiveShadow = true;
  mesh.name = 'MissionTerrainOverlay';
  scene.add(mesh);
}

export const ARENA_FAMILY_AAA = MISSION_FAMILY_VISUALS;

function _skyGradient(scene, top, mid, bot) {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}

/** Apply broadcast-grade palette, fog, and fill lights (racing-track parity). */
export function applyArenaBroadcastLook(scene, environmentId = 'industrial', challenge = null) {
  if (scene.userData?.footballMode || scene.userData?.raceMode || scene.userData?.biomeAAA) return;
  if (scene.userData?.broadcastLookApplied) {
    if (!scene.userData.missionCameraPreset) {
      const spec = ARENA_FAMILY_AAA[environmentId] || ARENA_FAMILY_AAA.industrial;
      scene.userData.missionCameraPreset = getMissionCameraPreset(challenge?.camera || scene.userData.cameraMode || spec.camera);
    }
    return;
  }

  const spec = ARENA_FAMILY_AAA[environmentId] || ARENA_FAMILY_AAA.industrial;
  const fogCol = typeof spec.palette.fog === 'number' ? spec.palette.fog : parseInt(spec.palette.fog.replace('#', ''), 16);
  scene.fog = new THREE.FogExp2(fogCol, spec.fogDensity);

  if (!scene.userData.customSky) {
    const p = spec.palette;
    _skyGradient(scene, p.primary, p.secondary, p.accent);
  }

  scene.add(new THREE.HemisphereLight(0xf1f7ff, spec.ground, 1.15));
  scene.add(new THREE.AmbientLight(spec.ambient, 0.5));
  const key = new THREE.DirectionalLight(spec.keyLight, 2.8);
  key.position.set(-10, 16, 8);
  key.castShadow = true;
  scene.add(key);

  const fill = new THREE.DirectionalLight(spec.fillLight, 1.1);
  fill.position.set(8, 6, -6);
  scene.add(fill);

  const rim = new THREE.PointLight(spec.rimLight, 0.55, 45);
  rim.position.set(0, 8, -18);
  scene.add(rim);

  if (!scene.getObjectByName('HorizonSilhouette')) {
    const horizonKey = environmentId === 'hybrid_race_sky' ? 'cyber_ninja' : environmentId;
    addHorizonSilhouette(scene, horizonKey in ARENA_FAMILY_AAA ? horizonKey : 'industrial');
  }

  scene.userData.broadcastLookApplied = true;
  scene.userData.arenaFamilySpec = spec;
  scene.userData.arenaMood = spec.mood;
  scene.userData.missionCameraPreset = getMissionCameraPreset(challenge?.camera || scene.userData.cameraMode || spec.camera);
  if (!scene.userData.raceVisual) {
    scene.userData.raceVisual = { bloom: 0.38, threshold: 0.82, radius: 0.36, accent: spec.keyLight };
  }
}

export function getArenaFamilySpec(environmentId) {
  return ARENA_FAMILY_AAA[environmentId] || ARENA_FAMILY_AAA.industrial;
}
