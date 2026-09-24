/**
 * IllustratedTrackKit.js — Vibrant arcade aesthetic + performance caps (tablet/MacBook).
 * No realtime shadows · emissive-first lighting · tier-scaled geometry.
 */
import * as THREE from 'three';
import { buildAtmosphereSky, buildVolumetricCloudLayer } from './BiomeAAAKit.js';
import { pbrMat } from './BiomeAAAKit.js';

export const ILLUSTRATED_PALETTES = {
  sky_island_01: { skyTop: 0x4fc3f7, skyHorizon: 0x87ceeb, skyGlow: 0xffb6c1, fog: 0x87ceeb, ground: 0x7cfc00, accent: 0xff69b4 },
  cyber_boulevard_01: { skyTop: 0x000005, skyHorizon: 0x001f3f, skyGlow: 0xff00ff, fog: 0x000a20, ground: 0x001f3f, accent: 0x00ffff },
  crystal_palace_01: { skyTop: 0x030408, skyHorizon: 0x0b0b0b, skyGlow: 0x8a2be2, fog: 0x06101e, ground: 0x0b0b0b, accent: 0x00ffff },
  desert_dunes_01: { skyTop: 0xff8c42, skyHorizon: 0xff6b9d, skyGlow: 0xffd700, fog: 0xff9a5c, ground: 0xf4d03f, accent: 0x00ced1 },
  volcano_canyon_01: { skyTop: 0x1a0500, skyHorizon: 0x5a0a00, skyGlow: 0xff4500, fog: 0x5a0a00, ground: 0x2f2f2f, accent: 0xff4500 },
  ice_cavern_01: { skyTop: 0x5dade2, skyHorizon: 0xd0e8f8, skyGlow: 0xb8a9c9, fog: 0xd0e8f5, ground: 0xe8f4fc, accent: 0xc0c0c0 },
  underwater_temple_01: { skyTop: 0x1a3010, skyHorizon: 0x556b2f, skyGlow: 0xffd700, fog: 0x2e5228, ground: 0x556b2f, accent: 0x40e0d0 },
  cyber_boulevard_01: { skyTop: 0x000005, skyHorizon: 0x001f3f, skyGlow: 0x00bfff, fog: 0x000a20, ground: 0x001f3f, accent: 0xff00ff },
  forest_maze_01: { skyTop: 0x228b22, skyHorizon: 0x7cfc00, skyGlow: 0xffd700, fog: 0x3a5a32, ground: 0x7cfc00, accent: 0xff0000 },
  moonlight_cavern_01: { skyTop: 0x010005, skyHorizon: 0x1a0840, skyGlow: 0x8a2be2, fog: 0x040010, ground: 0x8a2be2, accent: 0xff1493 },
};

export function tierN(tier, high, medium, low) {
  if (tier === 'high') return high;
  if (tier === 'low') return low;
  return medium;
}

export function illMat(color, { emissive = color, emi = 0.45, roughness = 0.45, metalness = 0.08 } = {}) {
  return pbrMat(color, { emissive, emi, roughness, metalness });
}

/** One key directional + ambient — no shadow maps. */
export function installIllustratedLighting(scene, bounds, palette, tier = 'medium') {
  scene.traverse((o) => {
    if (o.isLight && o.castShadow) o.castShadow = false;
  });
  const amb = scene.children.find((c) => c.isAmbientLight) || new THREE.AmbientLight(palette.skyHorizon, 0.55);
  if (!amb.parent) scene.add(amb);
  amb.intensity = tier === 'low' ? 0.62 : 0.72;
  amb.color.set(palette.skyHorizon);

  let key = scene.userData._illKeyLight;
  if (!key) {
    key = new THREE.DirectionalLight(palette.accent, tierN(tier, 1.05, 0.85, 0.65));
    key.position.set(bounds.cx + 40, 55, bounds.cz + 30);
    scene.add(key);
    scene.userData._illKeyLight = key;
  }
  key.intensity = tierN(tier, 1.05, 0.85, 0.65);
  key.color.set(palette.accent);
}

export function installIllustratedSky(scene, bounds, palette, tier = 'medium') {
  buildAtmosphereSky(scene, palette.skyTop, palette.skyHorizon, 500, palette.skyGlow);
  scene.fog = new THREE.FogExp2(palette.fog, tier === 'low' ? 0.0028 : 0.0022);
  if (tier !== 'low') {
    const clouds = buildVolumetricCloudLayer(bounds, tierN(tier, 48, 28, 12), 0xffffff, 0.28, 0.55, 9);
    clouds.position.y = -8;
    scene.add(clouds);
  }
}

/** Stylized giant mushroom — illustrated caps (no point lights). */
export function buildIllustratedMushroom(capColor, scale = 1) {
  const g = new THREE.Group();
  g.name = 'ill-mushroom';
  const h = 3 + scale * 2;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, h, 6),
    illMat(0xf5f0e8, { emi: 0.05 }),
  );
  stem.position.y = h / 2;
  g.add(stem);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(1.4 * scale, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    illMat(capColor, { emi: 0.85, roughness: 0.25 }),
  );
  cap.position.y = h + 0.4 * scale;
  cap.scale.set(1.4, 0.65, 1.4);
  g.add(cap);
  const spots = new THREE.Mesh(
    new THREE.SphereGeometry(0.25 * scale, 6, 4),
    illMat(0xffffff, { emi: 0.3 }),
  );
  spots.position.set(0.5 * scale, h + 0.9 * scale, 0.3 * scale);
  g.add(spots);
  return g;
}

export function buildIllustratedWaterfall(width = 6, height = 14) {
  const g = new THREE.Group();
  g.name = 'ill-waterfall';
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.55, fog: true }),
  );
  sheet.position.y = height / 2;
  g.add(sheet);
  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.4, 3),
    new THREE.MeshBasicMaterial({ color: 0xe8f8ff, transparent: true, opacity: 0.35, fog: true }),
  );
  mist.position.y = 0.5;
  g.add(mist);
  g.userData.animated = true;
  return g;
}

export function buildParallaxHills(bounds, color, y = -12, count = 5) {
  const g = new THREE.Group();
  g.name = 'ill-parallax';
  for (let i = 0; i < count; i++) {
    const w = bounds.spanX * 0.4 + i * 8;
    const hill = new THREE.Mesh(
      new THREE.CylinderGeometry(w * 0.5, w * 0.65, 18 + i * 4, 8),
      illMat(color, { emi: 0.12, roughness: 0.95 }),
    );
    hill.position.set(
      bounds.cx + Math.sin(i * 1.3) * bounds.spanX * 0.35,
      y,
      bounds.cz + Math.cos(i * 0.9) * bounds.spanZ * 0.4,
    );
    g.add(hill);
  }
  return g;
}

export function buildNeonTunnelSegment(length = 40, tier = 'medium') {
  const g = new THREE.Group();
  g.name = 'neon-tunnel';
  const steps = tierN(tier, 14, 10, 6);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const sideColor = i % 2 ? 0xff00ff : 0x00ffff;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(length / steps + 0.2, 4, 0.15),
      illMat(sideColor, { emi: 1.2, roughness: 0.1 }),
    );
    panel.position.set(-length / 2 + t * length, 2.5, -3.8);
    g.add(panel);
    const panelR = panel.clone();
    panelR.position.z = 3.8;
    g.add(panelR);
  }
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.2, 8),
    illMat(0x001a33, { emi: 0.15 }),
  );
  ceiling.position.y = 5;
  g.add(ceiling);
  g.userData.animated = true;
  return g;
}

export function animateIllustratedProps(world, time) {
  world.traverse((obj) => {
    if (obj.name === 'ill-waterfall' && obj.userData.animated) {
      obj.children[0].material.opacity = 0.45 + Math.sin(time * 3) * 0.12;
    }
    if (obj.name === 'neon-tunnel' && obj.userData.animated) {
      const pulse = 0.85 + Math.sin(time * 4) * 0.15;
      obj.children.forEach((c) => {
        if (c.material?.emissiveIntensity != null) c.material.emissiveIntensity = pulse * 1.2;
      });
    }
    if (obj.name === 'hero-giant-flower') {
      obj.rotation.y = Math.sin(time * 0.2) * 0.08;
    }
  });
}
