/**
 * CrystalCavernHeroKit.js — Crystal Cavern Run hero assets (reference-image layout).
 * Dark obsidian track · cyan neon lanes · stone CHECKPOINT arch · giant crystals · vista.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { emissiveSignMat } from './BiomeHeroShared.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import {
  CRYSTAL_CAVERN_PALETTE as P,
  CRYSTAL_CAVERN_EMISSIVE as E,
  CRYSTAL_CAVERN_TRACK as T,
} from './CrystalCavernPalette.js';

const REF_IMG = '/assets/backgrounds/tracks/crystal_cavern_reference.png';

let _refTexCache = null;
export function getCrystalCavernReferenceTexture() {
  if (!_refTexCache) {
    _refTexCache = new THREE.TextureLoader().load(REF_IMG);
    _refTexCache.colorSpace = THREE.SRGBColorSpace;
  }
  return _refTexCache;
}

/** Full 3D cave sky — reference art via illustrated backdrop dome. */
export function applyCrystalCavernReferenceSky(scene, curve, bounds, finishT = 0) {
  scene.background = new THREE.Color(0x0a0a0c);
  return null;
}

/** Upper-hemisphere sky mesh — reinforces reference vista inside WebGL. */
export function buildCrystalSkyHemisphere(bounds, tex = null) {
  const map = tex || getCrystalCavernReferenceTexture();
  const g = new THREE.Group();
  g.name = 'crystal-sky-hemisphere';
  const r = Math.max(bounds.spanX, bounds.spanZ) * 0.85 + 40;
  const geo = new THREE.SphereGeometry(r, 56, 28, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissiveMap: map,
    emissive: 0xffffff,
    emissiveIntensity: 0.55,
    roughness: 1,
    metalness: 0,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.position.set(bounds.cx, -2, bounds.cz);
  g.add(dome);
  return g;
}

/** Cyan curb glow strips along both road edges. */
export function buildRoadEdgeGlow(curve, hw, steps = 96) {
  const g = new THREE.Group();
  g.name = 'road-edge-glow';
  const curbMat = pbrMat(P.neonCyan, { emissive: P.neonCyan, emi: 2.4, roughness: 0.08, metalness: 0.05 });
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    [-hw - 0.25, hw + 0.25].forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.14);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 2.6), curbMat);
      curb.position.copy(pos);
      curb.rotation.y = frame.rot ?? 0;
      g.add(curb);
    });
  }
  return g;
}

/** Cinematic cave lighting rig — key/fill/rim + accent points. */
export function installCrystalCavernLighting(scene, bounds) {
  scene.children
    .filter((c) => c.isHemisphereLight || (c.isAmbientLight && c.intensity < 0.5))
    .forEach((l) => scene.remove(l));
  scene.add(new THREE.AmbientLight(0x1a2848, 0.65));
  scene.add(new THREE.HemisphereLight(0x2a4060, 0x0a0a0c, 0.45));
  const key = new THREE.DirectionalLight(0x00d4ff, 0.85);
  key.position.set(bounds.cx - 35, 48, bounds.cz + 28);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbd10e0, 0.22);
  rim.position.set(bounds.cx + 30, 24, bounds.cz - 22);
  scene.add(rim);
}

function rockMat(color = P.caveRockDark, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extras.roughness ?? 0.94,
    metalness: extras.metalness ?? 0.05,
    emissive: extras.emissive ?? 0x1a0830,
    emissiveIntensity: extras.emi ?? 0.35,
  });
}

function glowMat(color, intensity = 2.5) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.28,
    thickness: 0.6,
    transparent: true,
    opacity: 0.94,
  });
}

function glowTex(text, color = '#00ffff', bg = '#001a28', fontSize = 44) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 96);
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function plaqueTex(title) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3545';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#6a6078';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 488, 232);
  ctx.fillStyle = '#c8b8e8';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  title.split(' ').forEach((w, i) => ctx.fillText(w, 256, 90 + i * 42));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Reference-image backdrop planes at start + along track sides. */
export function buildReferenceImageBackdrop(scene, curve, bounds, finishT = 0) {
  const g = new THREE.Group();
  g.name = 'crystal-reference-backdrop';
  const loader = new THREE.TextureLoader();
  const tex = loader.load(REF_IMG);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: 0xffffff,
    emissiveIntensity: 0.75,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Main hero plane beyond start arch (visible through CHECKPOINT arch from camera)
  const { pos, frame } = placeAtTrack(curve, finishT + 0.18, 0, 0);
  const hero = new THREE.Mesh(new THREE.PlaneGeometry(120, 74), mat);
  hero.position.copy(pos);
  hero.position.y += 14;
  hero.rotation.y = (frame.rot ?? 0) + Math.PI;
  hero.renderOrder = -10;
  g.add(hero);

  // Side panels for depth along first straight
  [-(bounds.spanX * 0.35), bounds.spanX * 0.35].forEach((off, i) => {
    const { pos: sp, frame: sf } = placeAtTrack(curve, finishT + 0.04, off, 0);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(50, 35), mat.clone());
    side.position.copy(sp);
    side.position.y += 10;
    side.rotation.y = (sf.rot ?? 0) + (i ? -Math.PI / 2.2 : Math.PI / 2.2);
    g.add(side);
  });

  scene.add(g);
  return g;
}

export function buildGiantCrystalCluster(scale = 1) {
  const g = new THREE.Group();
  g.name = 'hero-crystal-cluster';
  const hues = [
    P.crystalPurple, P.crystalBlue, P.crystalPurpleDeep,
    P.crystalBlueLight, P.crystalMagenta, P.crystalLavender, P.crystalBlue,
  ];
  [24, 20, 17, 14, 12, 10, 9].forEach((h, i) => {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(1.9 + (i % 3) * 0.55, h * scale, 6),
      glowMat(hues[i % hues.length], E.crystalHero * (i < 2 ? 1.3 : 0.9)),
    );
    crystal.position.set((i - 3) * 2.5 * scale, h * 0.42 * scale, (i % 2) * 1.4);
    crystal.rotation.z = (i - 3) * 0.1;
    crystal.castShadow = true;
    g.add(crystal);
    if (i < 4) {
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.8 * scale, 5),
        glowMat(P.crystalBlue, 5.0),
      );
      tip.position.set(crystal.position.x, h * 0.82 * scale, crystal.position.z);
      g.add(tip);
    }
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(2.4 * scale, 12, 10),
    glowMat(P.crystalPurple, 2.2),
  );
  core.position.y = 3.2 * scale;
  g.add(core);
  const light = new THREE.PointLight(P.crystalBlue, 8, 52);
  light.position.y = 13 * scale;
  g.add(light);
  g.add(new THREE.PointLight(P.crystalPurple, 5, 36).translateY(8 * scale).translateX(-4 * scale));
  return g;
}

export function buildCrystalShard(size = 1.2) {
  const hue = size > 1.3 ? P.crystalPurple : P.crystalBlueLight;
  return new THREE.Mesh(new THREE.OctahedronGeometry(size, 1), glowMat(hue, E.crystalSmall));
}

export function buildCavernCeiling(bounds) {
  const g = new THREE.Group();
  g.name = 'cavern-ceiling';
  // No solid ceiling plane — it blocked scene.background / reference sky

  const geo = new THREE.ConeGeometry(0.4, 4.5, 5);
  const mat = rockMat(P.caveRockMid, { emi: 0.15 });
  const mesh = new THREE.InstancedMesh(geo, mat, 42);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 42; i++) {
    const x = bounds.cx + (Math.sin(i * 1.7) * 0.5) * bounds.spanX * 0.85;
    const z = bounds.cz + (Math.cos(i * 2.3) * 0.5) * bounds.spanZ * 0.85;
    const h = 2.8 + (i % 5) * 1.3;
    dummy.position.set(x, 30.5 - h * 0.35, z);
    dummy.rotation.x = Math.PI;
    dummy.scale.set(0.9 + (i % 3) * 0.35, h / 4.5, 0.9 + (i % 2) * 0.25);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  g.add(mesh);

  for (let i = 0; i < 16; i++) {
    const x = bounds.cx + (Math.sin(i * 2.1) * 0.5) * bounds.spanX * 0.7;
    const z = bounds.cz + (Math.cos(i * 1.9) * 0.5) * bounds.spanZ * 0.7;
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 + (i % 3) * 0.1, 6, 6),
      glowMat(P.crystalPurple, 2.4),
    );
    tip.position.set(x, 27.5, z);
    g.add(tip);
  }
  return g;
}

export function buildCrystalCheckpointArch(hw = 4, opts = {}) {
  const { showCheckpointSign = false, showTitlePlaque = false, titleText = 'CRYSTAL CAVERN RUN' } = opts;
  const g = new THREE.Group();
  g.name = 'crystal-checkpoint';
  const mat = rockMat(P.caveRockMid, { roughness: 0.9, emi: 0.28 });
  const archW = Math.max(T.archSpan, hw * 2 + 2);
  const archH = T.archClearance;

  [-archW / 2, archW / 2].forEach((x, pi) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, archH + 0.8, 1.4), mat);
    pillar.position.set(x, (archH + 0.8) / 2, 0);
    pillar.castShadow = true;
    g.add(pillar);
    for (let j = 0; j < 5; j++) {
      const cry = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.25 + (j % 2) * 0.12, 0),
        glowMat(P.crystalPurple, 2.2),
      );
      cry.position.set(x + (j % 2 ? 0.4 : -0.4), 0.9 + j * 0.7, 0.7);
      g.add(cry);
    }
    if (showTitlePlaque && pi === 0) {
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 1.7),
        new THREE.MeshStandardMaterial({ map: plaqueTex(titleText), emissive: 0xc8b8e8, emissiveIntensity: 0.6, roughness: 0.5 }),
      );
      plaque.position.set(x + 0.85, 1.35, 0.75);
      g.add(plaque);
    }
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(archW + 1.4, 1.15, 1.4), mat);
  lintel.position.y = archH + 0.55;
  g.add(lintel);

  if (showCheckpointSign) {
    const signTex = glowTex('CHECKPOINT', '#00ffff');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 1.4),
      emissiveSignMat(signTex, P.neonCyan, 1.5),
    );
    sign.position.set(0, archH + 0.6, 0.8);
    g.add(sign);
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 1.55, 0.15),
      glowMat(0x002233, 0.6),
    );
    back.position.set(0, archH + 0.6, 0.7);
    g.add(back);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(archW / 2 - 0.15, 0.18, 10, 48, Math.PI),
    glowMat(P.neonCyan, E.archRing),
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI;
  ring.position.y = archH * 0.55;
  g.add(ring);

  const pl = new THREE.PointLight(P.neonCyan, showCheckpointSign ? 2.2 : 1.4, 24);
  pl.position.set(0, archH * 0.6, 1.2);
  g.add(pl);
  g.userData.pulse = true;
  g.userData.glowMats = [];
  g.traverse((o) => {
    if (o.material?.emissiveIntensity > 0.5) g.userData.glowMats.push(o.material);
  });
  return g;
}

export function buildMineCartWreck() {
  const g = new THREE.Group();
  g.name = 'minecart-wreck';
  const wood = rockMat(0x6b4423, { roughness: 0.92, emi: 0.05, emissive: 0x221100 });
  const rust = rockMat(0x5a4030, { roughness: 0.85, metalness: 0.35, emi: 0.05 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.6), wood);
  body.position.set(0, 0.55, 0);
  body.rotation.z = 0.14;
  g.add(body);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.18, 1.7), rust);
  rim.position.set(0, 1.0, 0);
  rim.rotation.z = 0.14;
  g.add(rim);
  [[-0.9, 0.28, 0.7], [0.9, 0.28, 0.7], [-0.9, 0.22, -0.7], [0.85, 0.18, -0.65]].forEach(([x, y, z], i) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.18, 10),
      rockMat(0x2a2a2a, { metalness: 0.5, roughness: 0.6, emi: 0 }),
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    if (i === 3) wheel.rotation.x = 0.4;
    g.add(wheel);
  });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 0.2), rockMat(0x3a3a3a, { metalness: 0.6, emi: 0 }));
  rail.position.set(0, 0.06, 0.35);
  g.add(rail);
  g.add(rail.clone().translateZ(-0.7));
  const shard = buildCrystalShard(0.5);
  shard.position.set(0.2, 1.35, 0.25);
  g.add(shard);
  return g;
}

export function buildCavernVista() {
  const g = new THREE.Group();
  g.name = 'cavern-vista';

  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 42, 24, 12),
    glowMat(P.waterBase, E.waterCaustic),
  );
  lake.material.transparent = true;
  lake.material.opacity = 0.92;
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(0, -0.2, 24);
  lake.userData.water = true;
  g.add(lake);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(26, 28),
    new THREE.MeshBasicMaterial({
      color: P.crystalBlue, transparent: true, opacity: 0.42,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, -0.08, 24);
  g.add(glow);

  const bridge = new THREE.Group();
  bridge.add(new THREE.Mesh(new THREE.BoxGeometry(24, 0.6, 4.5), rockMat(0x4a4555, { emi: 0.15 })).translateY(1.7));
  [-11, 11].forEach((x) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 1.8), rockMat(P.caveRockMid));
    pier.position.set(x, 0.9, 0);
    bridge.add(pier);
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.4, 8, 16, Math.PI),
      rockMat(P.cavePurple, { emi: 0.2 }),
    );
    arch.rotation.z = Math.PI / 2;
    arch.position.set(x, 1.2, 0);
    bridge.add(arch);
  });
  bridge.position.set(0, 0, 22);
  g.add(bridge);

  for (let i = 0; i < 5; i++) {
    const falls = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 24),
      new THREE.MeshBasicMaterial({
        color: 0x88ffff, transparent: true, opacity: 0.55 - i * 0.06,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }),
    );
    falls.position.set(12 + i * 1.8, 12, 16 + i * 0.5);
    falls.userData.waterfall = true;
    g.add(falls);
  }

  const mist = new THREE.Mesh(
    new THREE.CircleGeometry(8, 16),
    new THREE.MeshBasicMaterial({
      color: 0xaaffff, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide,
    }),
  );
  mist.rotation.x = -Math.PI / 2;
  mist.position.set(16, 0.3, 18);
  g.add(mist);

  for (let i = 0; i < 10; i++) {
    const c = buildCrystalShard(1.0 + (i % 3) * 0.45);
    c.position.set(-20 + i * 4.5, 2 + (i % 4), 30 + (i % 2) * 3);
    g.add(c);
  }

  g.add(new THREE.PointLight(P.crystalBlue, 5.5, 50).translateY(6).translateZ(22));
  g.add(new THREE.PointLight(0x88ffff, 3.5, 30).translateX(16).translateY(8).translateZ(18));
  return g;
}

export function buildStartGodRays() {
  const g = new THREE.Group();
  g.name = 'start-god-rays';
  for (let i = 0; i < 5; i++) {
    const ray = new THREE.Mesh(
      new THREE.PlaneGeometry(7 + i * 2, 40 + i * 6),
      new THREE.MeshStandardMaterial({
        color: P.crystalBlueLight, transparent: true, opacity: 0.14 - i * 0.015,
        emissive: P.crystalBlueLight, emissiveIntensity: 0.8,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }),
    );
    ray.position.set(-8 + i * 2.2, 18, 6 + i * 1.5);
    ray.rotation.set(-0.45 + i * 0.03, 0.2, 0.06);
    g.add(ray);
  }
  return g;
}

export function buildTrackCavernWalls(curve, hw, samples = 50) {
  const g = new THREE.Group();
  g.name = 'cavern-walls';
  const wallMat = pbrMat(0x1f2833, { roughness: 0.92, emissive: 0x0a1020, emi: 0.15 });
  const rockMats = [
    wallMat,
    pbrMat(0x2d1b4e, { roughness: 0.9, emissive: 0x1a0830, emi: 0.2 }),
    pbrMat(0x1a3a52, { roughness: 0.88, emissive: 0x081828, emi: 0.18 }),
  ];
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    [-(hw + 11 + (i % 4) * 2.2), hw + 12 + (i % 3) * 2.2].forEach((side, si) => {
      const { pos, frame } = placeAtTrack(curve, t, side, 0);
      const h = 12 + (i % 6) * 2.2;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(6 + (i % 3), h, 4.2), rockMats[i % 3]);
      wall.position.copy(pos);
      wall.position.y += h * 0.38;
      wall.rotation.y = (frame.rot ?? 0) + (si ? 0.08 : -0.08);
      wall.castShadow = true;
      g.add(wall);
      if (i % 3 === 0) {
        const cry = buildCrystalShard(0.9 + (i % 3) * 0.3);
        cry.position.copy(pos);
        cry.position.y += 3 + (i % 3);
        cry.position.x += si ? 1.2 : -1.2;
        g.add(cry);
        const pl = new THREE.PointLight(i % 6 === 0 ? P.crystalPurple : P.crystalBlue, 2.6, 20);
        pl.position.copy(cry.position);
        pl.position.y += 1;
        g.add(pl);
      }
    });
  }
  return g;
}

export function buildCrystalStartCorridor(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  g.name = 'crystal-start-corridor';
  // Twin mega-crystals tight to road — must fill chase-cam frame at start line
  [-hw - 4, hw + 4].forEach((side, i) => {
    const cluster = buildGiantCrystalCluster(2.0);
    const { pos, frame } = placeAtTrack(curve, finishT + 0.008, side, 0);
    cluster.position.copy(pos);
    cluster.rotation.y = (frame.rot ?? 0) + (i ? -0.35 : 0.35);
    g.add(cluster);
  });
  // Glowing crystal pillars lining first straight
  for (let i = 0; i < 10; i++) {
    const t = (finishT + 0.015 + (i / 10) * 0.14) % 1;
    [-hw - 2.5, hw + 2.5].forEach((side) => {
      const shard = buildCrystalShard(1.6 + (i % 3) * 0.4);
      const { pos, frame } = placeAtTrack(curve, t, side, 0);
      shard.position.copy(pos);
      shard.position.y += 2 + (i % 4) * 0.6;
      shard.rotation.y = frame.rot ?? 0;
      g.add(shard);
      if (i % 2 === 0) {
        const pl = new THREE.PointLight(P.crystalBlue, 4, 18);
        pl.position.copy(shard.position);
        g.add(pl);
      }
    });
  }
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  g.name = 'crystal-start-hero';

  const archT = finishT + 0.045;
  const arch = buildCrystalCheckpointArch(hw, { showCheckpointSign: true, showTitlePlaque: true });
  arch.scale.setScalar(1.35);
  const { pos: ap, frame: af } = placeAtTrack(curve, archT, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);

  const hero = buildGiantCrystalCluster(2.4);
  const { pos: hp, frame: hf } = placeAtTrack(curve, finishT + 0.01, -(hw + 4.5), 0);
  hero.position.copy(hp);
  hero.position.y += 0.2;
  hero.rotation.y = (hf.rot ?? 0) + 0.25;
  g.add(hero);

  const cart = buildMineCartWreck();
  cart.scale.setScalar(1.5);
  const { pos: cp, frame: cf } = placeAtTrack(curve, finishT + 0.02, hw + 4, 0);
  cart.position.copy(cp);
  cart.rotation.y = (cf.rot ?? 0) - Math.PI / 2;
  g.add(cart);

  const rays = buildStartGodRays();
  const { pos: rayPos } = placeAtTrack(curve, finishT, 0, 0);
  rays.position.copy(rayPos);
  g.add(rays);

  return g;
}

export function buildRoadNeonLanes(curve, hw, startT = 0, lengthT = 1, opts = {}) {
  const g = new THREE.Group();
  g.name = 'road-neon-lanes';
  const noCross = opts.noCross ?? false;
  const laneMat = pbrMat(P.neonCyan, {
    emissive: P.neonCyan,
    emi: opts.emi ?? 1.15,
    roughness: 0.12,
    metalness: 0.05,
  });
  const laneOffsets = [-hw * 0.55, -hw * 0.18, hw * 0.18, hw * 0.55];
  const steps = opts.steps ?? 72;
  const span = Math.min(1, Math.max(0.2, lengthT));
  for (let i = 0; i < steps; i++) {
    const t = (startT + (i / steps) * span) % 1;
    laneOffsets.forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.06);
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.2), laneMat);
      strip.rotation.x = -Math.PI / 2;
      strip.rotation.y = frame.rot ?? 0;
      strip.position.copy(pos);
      strip.position.y += 0.11;
      g.add(strip);
    });
    if (!noCross && i % 3 === 0) {
      const { pos, frame } = placeAtTrack(curve, t, 0, 0.08);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(hw * 1.9, 0.04, 0.18), laneMat);
      cross.position.copy(pos);
      cross.rotation.y = frame.rot ?? 0;
      g.add(cross);
    }
  }
  return g;
}

export function buildCrystalBoostPad() {
  const g = new THREE.Group();
  g.name = 'crystal-boost-pad';
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), glowMat(P.neonCyan, E.boostPad));
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.08;
  g.add(pad);
  return g;
}

export function buildCrystalPuddleZone(hw) {
  const g = new THREE.Group();
  g.name = 'crystal-puddle';
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(hw * 0.85, 24),
    new THREE.MeshStandardMaterial({
      color: P.crystalBlue, emissive: P.crystalBlue, emissiveIntensity: 1.6,
      transparent: true, opacity: 0.55, roughness: 0.08,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.06;
  g.add(pool);
  return g;
}

export function buildCavernSparkles(bounds, count = 500) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = bounds.cx + (Math.sin(i * 1.3) * 0.5) * bounds.spanX;
    pos[i * 3 + 1] = 1 + (i % 22) * 0.95;
    pos[i * 3 + 2] = bounds.cz + (Math.cos(i * 1.7) * 0.5) * bounds.spanZ;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: P.neonCyan, size: 0.16, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.sparkle = true;
  return pts;
}

export function animateCrystalWorld(world, time) {
  world.traverse((obj) => {
    if (obj.userData?.pulse && obj.userData?.glowMats) {
      obj.userData.glowMats.forEach((m) => {
        m.emissiveIntensity = E.archRing * 0.5 + Math.sin(time * 3.2) * 0.9;
      });
    }
    if (obj.userData?.sparkle && obj.material) {
      obj.material.opacity = 0.45 + Math.sin(time * 2 + obj.id) * 0.3;
    }
    if (obj.userData?.waterfall && obj.material) {
      obj.material.opacity = 0.65 + Math.sin(time * 3.5) * 0.15;
    }
  });
}

export function placeCrystalScenery(world, curve, hw) {
  [0.14, 0.22, 0.32, 0.48, 0.58, 0.68, 0.78, 0.88].forEach((t, i) => {
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 9 + (i % 3) * 2), 0);
    const cluster = buildGiantCrystalCluster(0.55 + (i % 3) * 0.15);
    cluster.position.copy(pos);
    cluster.rotation.y = (frame.rot ?? 0) + side * 0.3;
    world.add(cluster);
  });
}

export function placeCheckpointArches(world, curve, hw, checkpointTs) {
  checkpointTs.forEach((t) => {
    const arch = buildCrystalCheckpointArch(hw, { showCheckpointSign: true });
    arch.scale.setScalar(1.08);
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    arch.position.copy(pos);
    arch.rotation.y = frame.rot ?? 0;
    world.add(arch);
  });
}

export function placeBoostPads(world, curve, boostTs) {
  boostTs.forEach((t) => {
    const pad = buildCrystalBoostPad();
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    pad.position.copy(pos);
    pad.rotation.y = frame.rot ?? 0;
    world.add(pad);
  });
}

export { buildWideCheckeredStart };
