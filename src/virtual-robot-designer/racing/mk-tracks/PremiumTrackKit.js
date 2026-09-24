/**
 * PremiumTrackKit.js — Procedural illustrated meshes (spec-aligned, WebGL-optimized).
 */
import * as THREE from 'three';
import { pbrMat } from './BiomeAAAKit.js';

export function tierN(tier, high, medium, low) {
  if (tier === 'high') return high;
  if (tier === 'low') return low;
  return medium;
}

export function premiumMat(color, opts = {}) {
  return pbrMat(color, {
    emissive: opts.emissive ?? color,
    emi: opts.emi ?? 0.35,
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.08,
  });
}

export function buildFacetedCrystal(scale = 1, color = 0xe0ffff) {
  const g = new THREE.Group();
  g.name = 'premium-crystal';
  const geo = new THREE.IcosahedronGeometry(1.2 * scale, 0);
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.1,
    metalness: 0,
    transmission: 0.85,
    thickness: 0.8,
    ior: 1.5,
    transparent: true,
    opacity: 0.92,
    emissive: new THREE.Color(0x00ff88),
    emissiveIntensity: 0.45,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 1.2 * scale;
  g.add(mesh);
  return g;
}

export function buildCrystalArch(span = 12, height = 15) {
  const g = new THREE.Group();
  g.name = 'crystal-arch';
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-span / 2, 0, 0),
    new THREE.Vector3(-span / 4, height * 0.85, 0),
    new THREE.Vector3(0, height, 0),
    new THREE.Vector3(span / 4, height * 0.85, 0),
    new THREE.Vector3(span / 2, 0, 0),
  ]);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 32, 0.45, 8, false),
    premiumMat(0x7cfc00, { emi: 0.85, roughness: 0.15 }),
  );
  g.add(tube);
  const inner = tube.clone();
  inner.scale.setScalar(0.82);
  inner.material = premiumMat(0xe0ffff, { emi: 1.0, roughness: 0.08 });
  g.add(inner);
  return g;
}

export function buildTitleBillboard(title, fill = 0x7cfc00, glow = 0x00ff88, w = 16, h = 4.5) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d');
  const fillHex = `#${new THREE.Color(fill).getHexString()}`;
  const glowHex = `#${new THREE.Color(glow).getHexString()}`;
  ctx.fillStyle = 'rgba(0, 20, 40, 0.45)';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.shadowColor = glowHex;
  ctx.shadowBlur = 28;
  ctx.fillStyle = fillHex;
  ctx.font = 'bold 84px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 512, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
  );
  mesh.name = 'track-title-billboard';
  mesh.userData.animated = true;
  return mesh;
}

export function buildNeonBillboard(text = 'CYBER GP', w = 8, h = 6) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000814';
  ctx.fillRect(0, 0, 512, 384);
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 72px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 192);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
  );
  mesh.name = 'neon-billboard';
  return mesh;
}

export function buildCyberBuilding(height = 35, color = 0x1a1a2e) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(12, height, 12),
    premiumMat(color, { emi: 0.08, roughness: 0.82 }),
  );
  body.position.y = height / 2;
  g.add(body);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.2),
        premiumMat(0xffdd99, { emi: 0.85, roughness: 0.2 }),
      );
      win.position.set(-3 + c * 3, 4 + r * 6, 6.05);
      g.add(win);
    }
  }
  return g;
}

export function buildTrackLamps(curve, hw, finishT, count = 20) {
  const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 8, 1);
  const poleMat = premiumMat(0xdddddd, { emi: 0.05, roughness: 0.6 });
  const headGeo = new THREE.SphereGeometry(0.5, 6, 6);
  const headMat = premiumMat(0xffdd99, { emi: 0.7 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, count);
  const heads = new THREE.InstancedMesh(headGeo, headMat, count);
  poles.name = 'street-lamps';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + i / count) % 1;
    const p = curve.getPointAt(t);
    const side = i % 2 ? hw + 5.5 : -(hw + 5.5);
    dummy.position.set(p.x + side, 4, p.z);
    dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
    dummy.position.y = 8.2;
    heads.setMatrixAt(i, dummy.matrix);
  }
  poles.instanceMatrix.needsUpdate = true;
  heads.instanceMatrix.needsUpdate = true;
  const g = new THREE.Group();
  g.add(poles);
  g.add(heads);
  return g;
}

export function buildInstancedLamps(count = 16, spacing = 22) {
  const geo = new THREE.CylinderGeometry(0.15, 0.18, 7, 6);
  const mat = premiumMat(0xdddddd, { emi: 0.05, roughness: 0.6 });
  const lamps = new THREE.InstancedMesh(geo, mat, count);
  lamps.name = 'street-lamps';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(i * spacing - (count * spacing) / 2, 3.5, 5.5);
    dummy.updateMatrix();
    lamps.setMatrixAt(i, dummy.matrix);
  }
  lamps.instanceMatrix.needsUpdate = true;
  const headGeo = new THREE.SphereGeometry(0.45, 6, 6);
  const headMat = premiumMat(0xffdd99, { emi: 0.7 });
  const head = new THREE.InstancedMesh(headGeo, headMat, count);
  for (let i = 0; i < count; i++) {
    dummy.position.set(i * spacing - (count * spacing) / 2, 7.2, 5.5);
    dummy.updateMatrix();
    head.setMatrixAt(i, dummy.matrix);
  }
  head.instanceMatrix.needsUpdate = true;
  const g = new THREE.Group();
  g.add(lamps);
  g.add(head);
  return g;
}

export function buildGiantTree(scale = 1) {
  const g = new THREE.Group();
  g.name = 'giant-tree';
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9 * scale, 1.2 * scale, 22 * scale, 8),
    premiumMat(0x5d4037, { emi: 0.02, roughness: 0.9 }),
  );
  trunk.position.y = 11 * scale;
  g.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(7 * scale, 1),
    premiumMat(0x228b22, { emi: 0.15, roughness: 0.75 }),
  );
  crown.position.y = 24 * scale;
  crown.scale.set(1.2, 0.85, 1.2);
  g.add(crown);
  return g;
}

export function buildTwistedTree(scale = 1) {
  const g = buildGiantTree(scale);
  g.name = 'twisted-tree';
  g.rotation.z = 0.15;
  g.children[1].rotation.y = 0.4;
  return g;
}

export function buildMazeWalls(curve, hw, finishT, count = 60) {
  const geo = new THREE.PlaneGeometry(1, 3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    emissive: 0x1b4d3e,
    emissiveIntensity: 0.25,
    roughness: 0.75,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
  });
  const walls = new THREE.InstancedMesh(geo, mat, count);
  walls.name = 'maze-walls';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + i / count * 0.95) % 1;
    const t2 = (t + 0.01) % 1;
    const p = curve.getPointAt(t);
    const p2 = curve.getPointAt(t2);
    const side = i % 2 ? hw + 2.5 : -(hw + 2.5);
    const dx = p2.x - p.x;
    const dz = p2.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    dummy.position.set(p.x + nx * side, 1.5, p.z + nz * side);
    dummy.rotation.y = Math.atan2(dx, dz);
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);
  }
  walls.instanceMatrix.needsUpdate = true;
  return walls;
}

export function buildLavaShaderRiver(length = 80, width = 20) {
  const geo = new THREE.PlaneGeometry(length, width, 32, 16);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(position.x * 0.1 + uTime) * 0.3;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec3 c = vec3(1.0, 0.27, 0.0);
        float glow = 0.5 + 0.5 * sin(uTime * 2.0 + vUv.x * 10.0);
        c *= mix(0.8, 1.2, glow);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.name = 'lava-river';
  mesh.userData.animated = true;
  mesh.userData.shaderMat = mat;
  return mesh;
}

export function buildColoredParticles(count, bounds, color, name, size = 0.1) {
  const positions = new Float32Array(count * 3);
  const span = Math.max(bounds.spanX, bounds.spanZ) + 40;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = bounds.cx + (Math.random() - 0.5) * span;
    positions[i * 3 + 1] = Math.random() * 30;
    positions[i * 3 + 2] = bounds.cz + (Math.random() - 0.5) * span;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  pts.name = name;
  pts.userData.animated = true;
  return pts;
}

export function buildIcicles(curve, hw, finishT, count = 12) {
  const geo = new THREE.ConeGeometry(0.3, 2.5, 4);
  const mat = premiumMat(0xb8ddf0, { emi: 0.35, roughness: 0.2 });
  const ices = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + i / count * 0.8) % 1;
    const side = i % 2 ? hw + 8 : -(hw + 8);
    const p = curve.getPointAt(t);
    dummy.position.set(p.x + side, 10, p.z);
    dummy.rotation.x = Math.PI;
    dummy.updateMatrix();
    ices.setMatrixAt(i, dummy.matrix);
  }
  ices.instanceMatrix.needsUpdate = true;
  return ices;
}

export function buildFloatingPlatforms(curve, finishT, count = 6) {
  const geo = new THREE.BoxGeometry(14, 1.2, 10);
  const mat = premiumMat(0x7cb342, { emi: 0.2, roughness: 0.7 });
  const plats = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + i / count * 0.85) % 1;
    const p = curve.getPointAt(t);
    dummy.position.set(p.x, p.y + 2, p.z);
    dummy.updateMatrix();
    plats.setMatrixAt(i, dummy.matrix);
  }
  plats.instanceMatrix.needsUpdate = true;
  return plats;
}

export function buildSandstonePillars(count, curve, hw, finishT) {
  const geo = new THREE.CylinderGeometry(1.5, 2, 12, 6);
  const mat = premiumMat(0xc4a574, { emi: 0.15, roughness: 0.85 });
  const cols = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + 0.1 + i / count * 0.75) % 1;
    const side = i % 2 ? hw + 11 : -(hw + 11);
    const p = curve.getPointAt(t);
    dummy.position.set(p.x + side, 6, p.z);
    dummy.updateMatrix();
    cols.setMatrixAt(i, dummy.matrix);
  }
  cols.instanceMatrix.needsUpdate = true;
  return cols;
}

export function buildLavaRiver(length = 60, width = 18) {
  const geo = new THREE.PlaneGeometry(length, width, 24, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff4500,
    emissive: 0xff4500,
    emissiveIntensity: 0.85,
    roughness: 0.75,
    metalness: 0.1,
  });
  mat.userData.animated = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.name = 'lava-river';
  mesh.userData.animated = true;
  return mesh;
}

export function buildBasaltColumns(count = 8, curve, hw, finishT) {
  const geo = new THREE.CylinderGeometry(1.8, 2.2, 14, 8);
  const mat = premiumMat(0x2f2f2f, { emi: 0.25, roughness: 0.85 });
  const cols = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const t = (finishT + 0.1 + i / count * 0.7) % 1;
    const side = i % 2 ? hw + 10 : -(hw + 10);
    const p = curve.getPointAt(t);
    dummy.position.set(p.x + side, 7, p.z);
    dummy.updateMatrix();
    cols.setMatrixAt(i, dummy.matrix);
  }
  cols.instanceMatrix.needsUpdate = true;
  return cols;
}

export function buildSparkleParticles(count = 200, bounds, color = 0xffffff) {
  const positions = new Float32Array(count * 3);
  const span = Math.max(bounds.spanX, bounds.spanZ) + 40;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = bounds.cx + (Math.random() - 0.5) * span;
    positions[i * 3 + 1] = 2 + Math.random() * 25;
    positions[i * 3 + 2] = bounds.cz + (Math.random() - 0.5) * span;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color, size: 0.12, transparent: true, opacity: 0.65, depthWrite: false }),
  );
  pts.name = 'sparkle-particles';
  pts.userData.animated = true;
  return pts;
}

export function buildRainLines(count = 180) {
  const positions = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 90;
    const y = Math.random() * 35 + 5;
    const z = (Math.random() - 0.5) * 90;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 2.5;
    positions[i * 6 + 5] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.35 }),
  );
  lines.name = 'rain-lines';
  lines.userData.animated = true;
  return lines;
}

export function animatePremiumProps(world, time) {
  world.traverse((obj) => {
    if (obj.name === 'lava-river') {
      if (obj.userData.shaderMat) obj.userData.shaderMat.uniforms.uTime.value = time;
      else if (obj.material?.emissiveIntensity !== undefined) {
        obj.material.emissiveIntensity = 0.7 + Math.sin(time * 2.5) * 0.25;
      }
    }
    if (obj.name === 'sparkle-particles' || obj.name === 'leaf-particles' || obj.name === 'ember-particles'
      || obj.name === 'bubble-particles' || obj.name === 'sand-particles' || obj.name === 'spore-particles') {
      if (!obj.geometry?.attributes?.position) return;
      const arr = obj.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += Math.sin(time + i) * 0.004;
        if (obj.name === 'ember-particles') arr[i + 1] += 0.02;
        if (obj.name === 'bubble-particles') arr[i + 1] += 0.015;
        if (obj.name === 'leaf-particles') {
          arr[i] += Math.cos(time + i * 0.1) * 0.01;
          arr[i + 2] += Math.sin(time + i * 0.1) * 0.01;
          if (arr[i + 1] < 0) arr[i + 1] = 35;
        }
        if (obj.name === 'ember-particles' && arr[i + 1] > 28) arr[i + 1] = 0;
      }
      obj.geometry.attributes.position.needsUpdate = true;
    }
    if (obj.name === 'rain-lines' && obj.geometry?.attributes?.position) {
      const arr = obj.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 6) {
        arr[i + 1] -= 0.35;
        arr[i + 4] -= 0.35;
        if (arr[i + 1] < 0) {
          arr[i + 1] = 30 + Math.random() * 10;
          arr[i + 4] = arr[i + 1] - 2.5;
        }
      }
      obj.geometry.attributes.position.needsUpdate = true;
    }
    if (obj.name === 'neon-billboard' && obj.material) {
      obj.material.opacity = 0.85 + Math.sin(time * 3) * 0.15;
    }
  });
}

export const PREMIUM_PALETTES = {
  crystal_palace_01: { sky: 0x87ceeb, fog: 0x87ceeb, accent: 0x00ff88 },
  cyber_boulevard_01: { sky: 0x000814, fog: 0x001030, accent: 0xff00ff },
  forest_maze_01: { sky: 0x228b22, fog: 0x2e5228, accent: 0x2ecc71 },
  volcano_canyon_01: { sky: 0x5a0a00, fog: 0x662200, accent: 0xff4500 },
  ice_cavern_01: { sky: 0xb8ddf0, fog: 0xd0e8f8, accent: 0x5dade2 },
  underwater_temple_01: { sky: 0x006994, fog: 0x004466, accent: 0x40e0d0 },
  sky_island_01: { sky: 0x87cefa, fog: 0x99ddee, accent: 0xff69b4 },
  desert_dunes_01: { sky: 0xff8c42, fog: 0xffcc66, accent: 0xffd700 },
  moonlight_cavern_01: { sky: 0x1a0840, fog: 0x2a1050, accent: 0xaa44ff },
  magic_forest_01: { sky: 0x7cfc00, fog: 0x3a5a32, accent: 0xffd700 },
};

export function installPremiumSky(scene, palette, tier = 'medium', arenaType = '') {
  if (scene.userData.useReferenceBackdrop) return;
  scene.background = new THREE.Color(palette.sky);
  const fogDensity = tier === 'low' ? 0.004 : arenaType === 'crystal_palace_01' ? 0.0018 : 0.0028;
  scene.fog = new THREE.FogExp2(palette.fog, fogDensity);
  if (!scene.userData._premiumHemi) {
    scene.userData._premiumHemi = new THREE.HemisphereLight(palette.sky, 0x554433, 0.6);
    scene.add(scene.userData._premiumHemi);
  }
  if (!scene.userData._premiumKey) {
    scene.userData._premiumKey = new THREE.DirectionalLight(0xffffff, 1.2);
    scene.userData._premiumKey.position.set(30, 50, 20);
    scene.add(scene.userData._premiumKey);
  }
  const key = scene.userData._premiumKey;
  key.color.set(palette.accent);
  key.intensity = arenaType === 'cyber_boulevard_01' ? 0.9 : 1.2;
  scene.userData._premiumHemi.color.set(palette.sky);
}
