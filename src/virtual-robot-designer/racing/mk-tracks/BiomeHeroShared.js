/**
 * BiomeHeroShared.js — Shared checkpoint arches, signs, boost pads for all 10 biome tracks.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildNeonCheckpointArch, buildChevronBoostPad, registerNeonArch } from './SunsetCoastHeroKit.js';

export function makeSignTexture(text, { fg = '#00eeff', bg = '#001a28', fontSize = 44 } = {}) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 96);
  ctx.shadowColor = fg;
  ctx.shadowBlur = 24;
  ctx.fillStyle = fg;
  ctx.font = `bold ${fontSize}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makePlaqueTexture(title, subtitle = '') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3545';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#6a6078';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 488, 232);
  ctx.fillStyle = '#e8e0f8';
  ctx.font = 'bold 26px Georgia,serif';
  ctx.textAlign = 'center';
  title.split(' ').forEach((w, i) => ctx.fillText(w, 256, 80 + i * 36));
  if (subtitle) {
    ctx.font = '18px system-ui,sans-serif';
    ctx.fillStyle = '#a8a0c0';
    ctx.fillText(subtitle, 256, 200);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** PBR emissive sign — world UI in 3D (not MeshBasicMaterial). */
export function emissiveSignMat(tex, emissive = 0x00ffff, intensity = 1.6) {
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive,
    emissiveIntensity: intensity,
    roughness: 0.4,
    metalness: 0.05,
    transparent: true,
    depthWrite: false,
  });
}

/** Stone/crystal arch with emissive CHECKPOINT sign + optional title plaque. */
export function buildCheckpointArch(hw, color = 0x00ffff, opts = {}) {
  const { sign = 'CHECKPOINT', plaque = null, stone = true } = opts;
  const g = new THREE.Group();
  g.name = 'biome-checkpoint-arch';
  const archW = hw * 2 + 2.5;
  const archH = 5.5;
  const stoneMat = pbrMat(stone ? 0x5a5a68 : color, {
    roughness: 0.88, emissive: stone ? 0x1a0830 : color, emi: stone ? 0.2 : 0.4,
  });
  const glowMat = pbrMat(color, { emissive: color, emi: 2.8, roughness: 0.12 });

  [-archW / 2, archW / 2].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, archH, 1.1), stoneMat);
    pillar.position.set(x, archH / 2, 0);
    g.add(pillar);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(archW + 1, 0.9, 1.1), stoneMat);
  lintel.position.y = archH;
  g.add(lintel);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(archW / 2 - 0.1, 0.16, 10, 48, Math.PI),
    glowMat,
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI;
  ring.position.y = archH * 0.55;
  g.add(ring);

  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 1.1),
    emissiveSignMat(makeSignTexture(sign, { fg: `#${new THREE.Color(color).getHexString()}` }), color),
  );
  signMesh.position.set(0, archH + 0.15, 0.65);
  g.add(signMesh);

  if (plaque) {
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.5),
      emissiveSignMat(makePlaqueTexture(plaque), 0xc8b8e8, 0.9),
    );
    plaqueMesh.position.set(-archW / 2 - 0.7, 1.4, 0.6);
    g.add(plaqueMesh);
  }

  const pl = new THREE.PointLight(color, 2.2, 18);
  pl.position.set(0, archH * 0.6, 0);
  g.add(pl);
  g.userData.pulse = true;
  g.userData.glowMat = glowMat;
  return g;
}

export function placeCheckpointArches(world, curve, hw, cpTs, colors = []) {
  cpTs.forEach((t, i) => {
    const arch = buildNeonCheckpointArch(hw, colors[i % colors.length] || 0x00ccff);
    arch.scale.setScalar(1.08);
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    arch.position.copy(pos);
    arch.rotation.y = frame.rot ?? 0;
    arch.position.y += (curve.getPointAt(t).y || 0);
    registerNeonArch(world, arch);
    world.add(arch);
  });
}

export function placeBoostPads(world, curve, boostTs) {
  boostTs.forEach((t) => {
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    const pad = buildChevronBoostPad();
    pad.position.copy(pos);
    pad.rotation.y = frame.rot ?? 0;
    pad.position.y += (curve.getPointAt(t).y || 0);
    world.add(pad);
  });
}

export function animateCheckpointPulse(world, time) {
  const arches = world.userData?.neonArches;
  if (arches?.length) {
    arches.forEach((mat, i) => {
      mat.emissiveIntensity = 2.2 + Math.sin(time * 3.5 + i) * 0.8;
    });
    return;
  }
  world.traverse((obj) => {
    if (!obj.userData?.pulse || !obj.userData?.glowMat) return;
    obj.userData.glowMat.emissiveIntensity = 2.2 + Math.sin(time * 3.5 + (obj.id || 0)) * 0.8;
  });
}

export function scatterAlongSides(world, curve, hw, count, buildProp, sideOffset = 6) {
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (i / count) * 0.92;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + sideOffset + (i % 3)), 0);
    const prop = buildProp(i);
    prop.position.copy(pos);
    prop.rotation.y = (frame.rot ?? 0) + (side > 0 ? Math.PI : 0);
    world.add(prop);
  }
}
