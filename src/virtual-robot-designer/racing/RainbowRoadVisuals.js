/**
 * RainbowRoadVisuals.js — Mario Kart Rainbow Road decorative props.
 */
import * as THREE from 'three';
import { sampleTrack } from './RacingTrackSystem.js';

const GEM_COLORS = [0xff44aa, 0x44ffcc, 0xffee44, 0x88ff44, 0x44aaff, 0xcc66ff];

/** Multicolored faceted gem stars scattered in space (MK8 sky). */
export function buildColorfulGemStars(scene, count = 80) {
  const group = new THREE.Group();
  group.name = 'gem-stars';
  const geo = new THREE.OctahedronGeometry(0.55, 0);
  for (let i = 0; i < count; i++) {
    const col = GEM_COLORS[i % GEM_COLORS.length];
    const mat = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 1.0,
      metalness: 0.4, roughness: 0.15, fog: false,
    });
    const gem = new THREE.Mesh(geo, mat);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 55 + Math.random() * 75;
    gem.position.set(
      Math.cos(angle) * dist,
      8 + Math.random() * 45,
      Math.sin(angle) * dist - 20,
    );
    gem.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    gem.scale.setScalar(0.6 + Math.random() * 1.4);
    gem.userData.spin = (Math.random() - 0.5) * 1.2;
    group.add(gem);
  }
  scene.add(group);
  return {
    group,
    update: (t) => {
      group.children.forEach((g, i) => {
        g.rotation.y += (g.userData.spin || 0.3) * 0.016;
        if (g.material) g.material.emissiveIntensity = 0.8 + Math.sin(t * 3 + i) * 0.2;
      });
    },
  };
}

function _makeChevronTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, 0, c.width, c.height);
  const colors = ['#ff2244', '#ff8800', '#ffee00', '#22ff88', '#00ccff', '#4466ff'];
  const chevW = 48;
  for (let x = 0; x < c.width + chevW; x += chevW) {
    const col = colors[Math.floor(x / chevW) % colors.length];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x + chevW * 0.55, 32);
    ctx.lineTo(x, 56);
    ctx.lineTo(x + chevW * 0.25, 32);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(4, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** LED chevron barrier wall on sharp turns (MK8 reference). */
export function buildChevronBarrier(curve, t, halfWidth, use3D = false) {
  const { p, n, rot } = sampleTrack(curve, t);
  const y = (use3D ? p.y : 0) + 0.65;
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({
    map: _makeChevronTexture(),
    emissive: 0xffffff,
    emissiveIntensity: 0.4,
    emissiveMap: _makeChevronTexture(),
    fog: false,
  });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(halfWidth * 2.2, 0.9, 0.35), wallMat);
  wall.position.set(p.x, y + 0.45, p.z);
  wall.rotation.y = rot;
  g.add(wall);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 }),
    );
    const pos = p.clone().addScaledVector(n, side * (halfWidth + 0.2));
    post.position.set(pos.x, y + 0.55, pos.z);
    g.add(post);
    const star = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.07, 6, 5),
      new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 2.0 }),
    );
    star.position.set(pos.x, y + 1.15, pos.z);
    star.rotation.x = Math.PI / 2;
    g.add(star);
  }
  return g;
}

/** Large golden hoop the track dives through (MK8). */
export function buildMegaGoldenHoop(curve, t, use3D = false, radius = 7.5) {
  const { p, tan } = sampleTrack(curve, t);
  const y = (use3D ? p.y : 0) + radius;
  const g = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00, emissive: 0xff9900, emissiveIntensity: 1.6,
    metalness: 0.55, roughness: 0.2,
  });
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.32, 12, 48), goldMat);
  hoop.rotation.x = Math.PI / 2;
  hoop.position.set(p.x, y, p.z);
  hoop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan.clone().normalize());
  g.add(hoop);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const star = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.1, 5, 5),
      goldMat,
    );
    star.position.set(p.x + Math.cos(a) * radius, y + Math.sin(a) * radius, p.z);
    star.rotation.x = Math.PI / 2;
    g.add(star);
  }
  g.userData.glowMats = [goldMat];
  return g;
}

/** Hollow golden star frame for guardrail posts. */
export function makeHollowGoldStar() {
  const outer = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.42 : 0.16;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) outer.moveTo(x, y);
    else outer.lineTo(x, y);
  }
  outer.closePath();
  const inner = new THREE.Path();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.28 : 0.1;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) inner.moveTo(x, y);
    else inner.lineTo(x, y);
  }
  inner.closePath();
  outer.holes.push(inner);
  const geo = new THREE.ExtrudeGeometry(outer, { depth: 0.12, bevelEnabled: false });
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 2.2,
    metalness: 0.5, roughness: 0.2, side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}
