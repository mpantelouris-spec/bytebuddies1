/**
 * RacingKartKit.js — Industrial roll-cage racer + Kenney race.glb when loaded.
 */
import * as THREE from 'three';
import { getCachedGltf, cloneGltfScene, normalizeObjectHeight } from './mk-tracks/TrackAssetLoader.js';
import { KART_ASSET_MANIFEST } from './mk-tracks/TrackAssetManifest.js';

function kartMat(color, { metalness = 0.45, roughness = 0.35, emissive = 0x000000, emi = 0, clearcoat = 0.5 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, metalness, roughness, emissive, emissiveIntensity: emi,
    clearcoat, clearcoatRoughness: 0.12,
  });
}

function pipe(r, h, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), mat);
  return m;
}

function buildOffRoadWheel(radius = 0.28, width = 0.18) {
  const g = new THREE.Group();
  const tireMat = kartMat(0x141414, { metalness: 0.05, roughness: 0.92, clearcoat: 0 });
  const tread = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 18), tireMat);
  tread.rotation.z = Math.PI / 2;
  g.add(tread);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const knob = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.08, 0.04),
      tireMat,
    );
    knob.position.set(Math.cos(a) * radius * 0.92, Math.sin(a) * radius * 0.92, 0);
    tread.add(knob);
  }
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, width * 1.05, 12),
    kartMat(0xaaaaaa, { metalness: 0.9, roughness: 0.2, clearcoat: 0.8 }),
  );
  hub.rotation.z = Math.PI / 2;
  g.add(hub);
  g.userData.isWheel = true;
  return g;
}

/** Industrial pipe-frame racer matching Crystal Cavern / MK reference karts. */
export function buildIndustrialRacerKart({
  bodyColor = '#1a2848',
  accentColor = '#FF6600',
  ledColor = '#9933FF',
} = {}) {
  const g = new THREE.Group();
  g.name = 'student-kart';
  g.userData.isRaceKart = true;

  const bodyCol = new THREE.Color(bodyColor);
  const accentCol = new THREE.Color(accentColor);
  const glowCol = new THREE.Color(ledColor);

  const frameMat = kartMat(0x4a4a58, { metalness: 0.85, roughness: 0.22, clearcoat: 0.7 });
  const bodyMat = kartMat(bodyCol, { metalness: 0.5, roughness: 0.32, clearcoat: 0.55 });
  const accentMat = kartMat(accentCol, { metalness: 0.45, roughness: 0.3 });
  const glowMat = kartMat(glowCol, { emissive: glowCol, emi: 2.5, metalness: 0.4 });

  // Floor pan + nose guard
  const pan = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 1.15), bodyMat);
  pan.position.set(0, 0.18, 0);
  pan.castShadow = true;
  g.add(pan);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.38), accentMat);
  nose.position.set(0, 0.28, 0.52);
  g.add(nose);

  // Roll cage posts
  const posts = [
    [-0.4, 0.52, 0.22], [0.4, 0.52, 0.22],
    [-0.4, 0.52, -0.28], [0.4, 0.52, -0.28],
  ];
  posts.forEach(([x, y, z]) => {
    const post = pipe(0.035, 0.62, frameMat);
    post.position.set(x, y, z);
    g.add(post);
  });
  // Cage top bars
  [-0.4, 0.4].forEach((x) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.55), frameMat);
    bar.position.set(x, 0.78, -0.03);
    g.add(bar);
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.04, 0.04), frameMat);
  topBar.position.set(0, 0.78, 0.22);
  g.add(topBar);

  // Rear engine block
  const engine = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.48), bodyMat);
  engine.position.set(0, 0.36, -0.48);
  g.add(engine);
  const engineTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.35), accentMat);
  engineTop.position.set(0, 0.58, -0.48);
  g.add(engineTop);

  const exhaustGlow = kartMat(0xff8a1a, { emissive: 0xff6a00, emi: 3.8, metalness: 0.2, roughness: 0.35, clearcoat: 0 });
  [-0.16, 0.16].forEach((x) => {
    const ex = pipe(0.045, 0.38, frameMat);
    ex.rotation.x = -0.55;
    ex.position.set(x, 0.48, -0.72);
    g.add(ex);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), exhaustGlow);
    tip.position.set(x, 0.62, -0.88);
    g.add(tip);
    const pl = new THREE.PointLight(0xff7a18, 0.85, 6);
    pl.position.set(x, 0.62, -0.9);
    g.add(pl);
  });
  [0, 0.12].forEach((zOff, i) => {
    const chev = new THREE.Mesh(new THREE.ConeGeometry(0.22 - i * 0.04, 0.18, 3), exhaustGlow);
    chev.rotation.x = Math.PI;
    chev.position.set(0, 0.28, -0.78 - zOff);
    g.add(chev);
  });

  // Side accent panels (orange / purple)
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.55), side > 0 ? accentMat : glowMat);
    panel.position.set(side * 0.48, 0.32, -0.05);
    g.add(panel);
  });

  // Driver — small glowing robot head in cage (ByteBuddies identity)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    kartMat(0x00d9ff, { emissive: 0x00d9ff, emi: 2.2, metalness: 0.3 }),
  );
  head.position.set(0, 0.58, 0.05);
  g.add(head);
  const eye = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.03),
    kartMat(0x00ff88, { emissive: 0x00ff88, emi: 3 }),
  );
  eye.position.set(0, 0.6, 0.18);
  g.add(eye);

  // Chunky off-road wheels
  const wheelPos = [
    [-0.5, 0.28, 0.38], [0.5, 0.28, 0.38],
    [-0.5, 0.28, -0.35], [0.5, 0.28, -0.35],
  ];
  wheelPos.forEach(([x, y, z]) => {
    const w = buildOffRoadWheel(0.28, 0.18);
    w.position.set(x, y, z);
    w.castShadow = true;
    g.add(w);
  });

  // Front headlights
  [-0.22, 0.22].forEach((x) => {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.05, 10),
      kartMat(0xffffff, { emissive: 0xffffff, emi: 2.5 }),
    );
    lamp.position.set(x, 0.24, 0.62);
    lamp.rotation.x = -Math.PI / 2;
    g.add(lamp);
  });

  g.userData.exhaustTips = [];
  g.userData.animTick = (time) => {
    const pulse = 2.5 + Math.sin(time * 8) * 0.8;
    g.children.forEach((c) => {
      if (c.material?.emissiveIntensity > 2) {
        c.material.emissiveIntensity = pulse;
      }
    });
  };

  return g;
}

/** Race kart entry point — Kenney race.glb when preloaded, else industrial frame racer. */
export function buildStudentKart(opts = {}) {
  const cached = getCachedGltf(KART_ASSET_MANIFEST.student_race);
  if (cached?.scene) {
    const g = cloneGltfScene(cached);
    if (g) {
      g.name = 'student-kart';
      g.userData.isRaceKart = true;
      normalizeObjectHeight(g, 1.1);
      const bodyCol = new THREE.Color(opts.bodyColor || '#1a2848');
      g.traverse((obj) => {
        if (obj.isMesh?.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => {
            if (mat.color && mat.color.getHex() < 0x888888) mat.color.lerp(bodyCol, 0.35);
          });
        }
      });
      return g;
    }
  }
  return buildIndustrialRacerKart(opts);
}
