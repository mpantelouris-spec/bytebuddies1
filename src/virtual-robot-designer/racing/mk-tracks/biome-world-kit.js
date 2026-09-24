/**
 * biome-world-kit.js — Shared high-quality prop builders for biome circuits.
 */
import * as THREE from 'three';
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { sampleTrackBounds, cornerPosition, faceCenter } from './mk-track-layout.js';

export function trackHeading(curve, t) {
  const frame = sampleTrackFrame(curve, t);
  return frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
}

export function toonMat(color, emissive = 0x000000, emi = 0, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: emi, roughness, metalness: 0.08, flatShading: true,
  });
}

/** Cel-shaded outline accent */
export function withOutline(mesh, color = 0x111111) {
  const g = new THREE.Group();
  g.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }),
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  edges.scale.copy(mesh.scale);
  g.add(edges);
  return g;
}

export function checkeredStartLine(curve, halfWidth, finishT = 0) {
  const { pos, frame } = placeAtTrack(curve, finishT, 0, 0);
  const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111111' : '#ffffff';
      ctx.fillRect(x * 16, y * 16, 16, 16);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(halfWidth * 0.5, 1);
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(halfWidth * 2.6, 4.2),
    new THREE.MeshPhysicalMaterial({
      map: tex, roughness: 0.12, metalness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.1,
    }),
  );
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = rot;
  line.position.copy(pos);
  line.position.y = 0.42;
  line.receiveShadow = true;
  line.name = 'checkered-start-line';
  return line;
}

export function scatterAlongTrack(world, curve, count, halfWidth, lateralOffset, builder) {
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (i / count) * 0.92;
    const side = (i % 2 ? 1 : -1) * (halfWidth + lateralOffset + (i % 3) * 2);
    const { pos } = placeAtTrack(curve, t, side, 0);
    const prop = builder(i, t, side);
    prop.position.copy(pos);
    prop.rotation.y = trackHeading(curve, t) + (side > 0 ? 0 : Math.PI);
    world.add(prop);
  }
}

export function buildSkyDome(scene, topColor, horizonColor, radius = 420) {
  const existing = scene.getObjectByName('biome-sky-dome');
  if (existing) scene.remove(existing);
  const geo = new THREE.SphereGeometry(radius, 40, 20);
  const top = new THREE.Color(topColor);
  const hor = new THREE.Color(horizonColor);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.pow(Math.max(0, (y / radius + 1) * 0.5), 0.55);
    const c = hor.clone().lerp(top, t);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  dome.name = 'biome-sky-dome';
  dome.renderOrder = -20;
  scene.add(dome);
  scene.background = null;
  return dome;
}

function makeGroundTexture(baseColor) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const col = new THREE.Color(baseColor);
  const r = Math.round(col.r * 255);
  const g = Math.round(col.g * 255);
  const b = Math.round(col.b * 255);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const shade = 0.75 + Math.random() * 0.5;
    ctx.fillStyle = `rgba(${Math.min(255, r * shade)},${Math.min(255, g * shade)},${Math.min(255, b * shade)},${0.08 + Math.random() * 0.14})`;
    const sz = 1 + Math.random() * 3;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, sz, sz);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

export function applyGround(scene, color, bounds, size = 280) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({
      map: makeGroundTexture(color),
      color,
      roughness: 0.92,
      metalness: 0.02,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(bounds.cx, -0.1, bounds.cz);
  ground.renderOrder = -3;
  scene.add(ground);
  return ground;
}

export function addSunLighting(scene, bounds, {
  sky, horizon, ground, sun, fill, intensity = 1.5, skyDome = true,
} = {}) {
  const top = sky ?? 0x87ceeb;
  const hor = horizon ?? ground ?? top;
  if (skyDome) buildSkyDome(scene, top, hor);
  else scene.background = new THREE.Color(top);
  if (!scene.fog) scene.fog = new THREE.Fog(new THREE.Color(hor).getHex(), 40, 200);

  const amb = new THREE.AmbientLight(hor, 0.42);
  scene.add(amb);
  if (ground != null) {
    const hemi = new THREE.HemisphereLight(top, ground, 1.05);
    scene.add(hemi);
  }
  const dir = new THREE.DirectionalLight(sun ?? 0xfff4e0, intensity);
  dir.position.set(bounds.cx + 45, 72, bounds.cz + 30);
  dir.castShadow = false;
  scene.add(dir);
  if (fill) {
    const rim = new THREE.DirectionalLight(fill, 0.55);
    rim.position.set(bounds.cx - 35, 28, bounds.cz - 40);
    scene.add(rim);
  }
  const bounce = new THREE.DirectionalLight(0xffffff, 0.18);
  bounce.position.set(bounds.cx, -10, bounds.cz);
  scene.add(bounce);
  return dir;
}

export function buildSunDisc(bounds, color = 0xffdd66, size = 22) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.CircleGeometry(size, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, fog: false }),
  );
  g.add(core);
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(size * 2.2, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, fog: false }),
  );
  glow.position.z = -0.5;
  g.add(glow);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(size * 3.5, 32),
    new THREE.MeshBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.08, fog: false }),
  );
  halo.position.z = -1;
  g.add(halo);
  g.position.set(bounds.cx + 90, 42, bounds.minZ - 70);
  return g;
}

export function scatterGuardrails(world, curve, halfWidth, step = 0.075) {
  let i = 0;
  for (let t = 0.03; t < 0.97; t += step) {
    for (const side of [-1, 1]) {
      const offset = side * (halfWidth + 2.1);
      const { pos, frame } = placeAtTrack(curve, t, offset, 0);
      const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
      const stripe = (i % 2) === 0;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 1.05, 0.28),
        toonMat(stripe ? 0xffffff : 0xe82020, 0x000000, 0),
      );
      post.position.copy(pos);
      post.position.y = 0.52;
      post.rotation.y = rot;
      world.add(post);
      if (i % 3 === 0) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.14, 2.8),
          toonMat(0xcccccc, 0x000000, 0),
        );
        rail.position.copy(pos);
        rail.position.y = 0.95;
        rail.rotation.y = rot;
        world.add(rail);
      }
      i++;
    }
  }
}

export function scatterTrackLights(world, curve, halfWidth, color = 0xfff4cc, count = 14) {
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (i / count) * 0.92;
    const side = i % 2 ? 1 : -1;
    const offset = side * (halfWidth + 4.5);
    const { pos, frame } = placeAtTrack(curve, t, offset, 0);
    const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
    const pole = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 5.5, 6),
      toonMat(0x888899, 0x000000, 0, 0.35),
    );
    shaft.position.y = 2.75;
    pole.add(shaft);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      toonMat(color, color, 0.65, 0.2),
    );
    lamp.position.y = 5.6;
    pole.add(lamp);
    const light = new THREE.PointLight(color, 2.8, 22, 1.6);
    light.position.y = 5.6;
    pole.add(light);
    pole.position.copy(pos);
    pole.rotation.y = rot;
    world.add(pole);
  }
}

export function buildGrandstand(length = 32, tiers = 5, accent = 0xcc2222) {
  const g = new THREE.Group();
  for (let tier = 0; tier < tiers; tier++) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(length, 1.1, 2.8 + tier * 0.45),
      toonMat(tier % 2 ? accent : 0x2a3a55, 0x000000, 0, 0.7),
    );
    seat.position.set(0, 0.55 + tier * 1.05, -tier * 1.6);
    g.add(seat);
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(length + 0.4, 0.18, 0.18),
      toonMat(0xdddddd),
    );
    rail.position.set(0, 1.1 + tier * 1.05, -tier * 1.6 - 1.2);
    g.add(rail);
  }
  const crowdColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xff9ff3, 0x54a0ff];
  for (let i = 0; i < 48; i++) {
    const person = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.55, 0.28),
      toonMat(crowdColors[i % crowdColors.length]),
    );
    const tier = i % tiers;
    person.position.set(
      (Math.random() - 0.5) * (length - 2),
      1.2 + tier * 1.05,
      -tier * 1.6 - 0.5 + (Math.random() - 0.5) * 0.6,
    );
    g.add(person);
  }
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(length * 0.6, 2.5),
    new THREE.MeshBasicMaterial({ color: accent, fog: false }),
  );
  banner.position.set(0, tiers * 1.05 + 2.5, -tiers * 1.6 - 0.5);
  g.add(banner);
  return g;
}

export function glowParticleField(root, count, color, spread, yRange, name = 'biome-glow-particles') {
  const verts = [];
  const phases = [];
  for (let i = 0; i < count; i++) {
    verts.push((Math.random() - 0.5) * spread, yRange[0] + Math.random() * (yRange[1] - yRange[0]), (Math.random() - 0.5) * spread);
    phases.push(Math.random() * Math.PI * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color, size: 0.35, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    }),
  );
  pts.name = name;
  pts.userData.phases = phases;
  root.add(pts);
  return pts;
}

export function animateEmissivePulse(world, time, speed = 2) {
  world.traverse((obj) => {
    if (!obj.isMesh || !obj.material?.emissive) return;
    const base = obj.userData.baseEmissive ?? obj.material.emissiveIntensity;
    if (obj.userData.baseEmissive == null) obj.userData.baseEmissive = base;
    obj.material.emissiveIntensity = base + Math.sin(time * speed + (obj.id % 7)) * base * 0.35;
  });
}

export function makeFog(scene, color, near, far) {
  scene.fog = new THREE.Fog(color, near, far);
}

export function particleField(root, count, color, spread, yRange, name = 'biome-particles') {
  const verts = [];
  const phases = [];
  for (let i = 0; i < count; i++) {
    verts.push((Math.random() - 0.5) * spread, yRange[0] + Math.random() * (yRange[1] - yRange[0]), (Math.random() - 0.5) * spread);
    phases.push(Math.random() * Math.PI * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color, size: 0.28, transparent: true, opacity: 0.82,
      depthWrite: false, sizeAttenuation: true,
    }),
  );
  pts.name = name;
  pts.userData.phases = phases;
  pts.userData.baseY = verts.filter((_, i) => i % 3 === 1);
  root.add(pts);
  return pts;
}

export function registerAnimTick(world, fn) {
  const prev = world.userData.animTick;
  world.userData.animTick = (time) => {
    prev?.(time);
    fn(time);
  };
}

export function animateParticles(world, time) {
  world.traverse((obj) => {
    if (!obj.isPoints || !obj.userData.phases || obj.userData.basePositions) return;
    const pos = obj.geometry.attributes.position;
    const phases = obj.userData.phases;
    for (let i = 0; i < pos.count; i++) {
      const baseY = pos.getY(i);
      pos.setY(i, baseY + Math.sin(time * 1.5 + phases[i]) * 0.04);
      pos.setX(i, pos.getX(i) + Math.sin(time * 0.3 + phases[i]) * 0.008);
    }
    pos.needsUpdate = true;
  });
}

// ── Prop builders ──────────────────────────────────────────────────────────

export function buildPalmTree(scale = 1) {
  const g = new THREE.Group();
  const trunk = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 7 * scale, 6), toonMat(0x8b6914)));
  trunk.position.y = 3.5 * scale;
  g.add(trunk);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(2.2 * scale, 5 * scale, 4), toonMat(0x1faa4a, 0x0a5528, 0.08));
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 1.4 * scale, 7.2 * scale, Math.sin(a) * 1.4 * scale);
    leaf.rotation.z = Math.cos(a) * 0.5;
    leaf.rotation.x = Math.sin(a) * 0.3;
    g.add(leaf);
  }
  const coconuts = new THREE.Mesh(new THREE.SphereGeometry(0.22 * scale, 6, 6), toonMat(0x5c3a1e));
  coconuts.position.y = 6.8 * scale;
  g.add(coconuts);
  return g;
}

export function buildBeachUmbrella() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 6), toonMat(0xdddddd));
  pole.position.y = 2.25;
  g.add(pole);
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(2.8, 1.2, 8, 1, true),
    toonMat(0xff6b6b, 0xff3333, 0.1),
  );
  canopy.position.y = 4.5;
  canopy.rotation.x = Math.PI;
  g.add(canopy);
  return g;
}

export function buildCliff(w = 12, h = 18) {
  const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 6),
    toonMat(0xcd853f, 0x8b4513, 0.05),
  );
  cliff.position.y = h / 2;
  return cliff;
}

export function buildCrystalCluster(h = 12) {
  const g = new THREE.Group();
  const hues = [0x00ccff, 0x44ffee, 0x8866ff, 0x00ffaa, 0x2288ff];
  for (let i = 0; i < 6; i++) {
    const hue = hues[i % hues.length];
    const crystal = withOutline(new THREE.Mesh(
      new THREE.ConeGeometry(1.1 + i * 0.28, h * (0.45 + i * 0.1), 6),
      toonMat(hue, hue, 0.7, 0.12),
    ));
    crystal.position.set((i - 2.5) * 1.3, h * 0.32, (i % 2) * 0.7);
    crystal.rotation.z = (i - 2.5) * 0.1;
    g.add(crystal);
  }
  const glow = new THREE.PointLight(0x00ffff, 4, 18, 1.5);
  glow.position.y = h * 0.4;
  g.add(glow);
  return g;
}

export function buildReflectivePool(r = 4) {
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(r, 24),
    new THREE.MeshStandardMaterial({
      color: 0x224466, transparent: true, opacity: 0.85,
      emissive: 0x00aaff, emissiveIntensity: 0.35, roughness: 0.05, metalness: 0.6,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.08;
  return pool;
}

export function buildGiantFlower(color = 0xff69b4) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 5, 6), toonMat(0x228b22));
  stem.position.y = 2.5;
  g.add(stem);
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 8, 8),
      toonMat(color, color, 0.15),
    );
    const a = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 1.6, 5.2, Math.sin(a) * 1.6);
    petal.scale.set(1, 0.35, 1);
    g.add(petal);
  }
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), toonMat(0xffdd00, 0xffaa00, 0.3));
  center.position.y = 5.2;
  g.add(center);
  return g;
}

export function buildWaterfall(w = 3, h = 14) {
  const g = new THREE.Group();
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.65, side: THREE.DoubleSide }),
  );
  fall.position.y = h / 2;
  g.add(fall);
  const mist = particleField(g, 20, 0xaaddff, w * 2, [0, 2], 'waterfall-mist');
  mist.position.y = 0.5;
  return g;
}

export function buildBasaltCliff(h = 16) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(3 + Math.random() * 2, h * (0.6 + Math.random() * 0.4), 2.5),
      toonMat(0x2f2f2f, 0xff4500, 0.08),
    );
    block.position.set((i - 1.5) * 2.8, block.geometry.parameters.height / 2, 0);
    g.add(block);
  }
  return g;
}

export function buildNeonBillboard(text, bg = '#ff00ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 78);
  const tex = new THREE.CanvasTexture(canvas);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }),
  );
  const frame = new THREE.Mesh(new THREE.BoxGeometry(8.4, 2.4, 0.3), toonMat(0x111133));
  const g = new THREE.Group();
  g.add(frame);
  board.position.z = 0.2;
  g.add(board);
  g.position.y = 6;
  return g;
}

export function buildSkyscraper(h = 35, accent = 0xff00ff) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(7, h, 7),
    toonMat(0x0a0a22, accent, 0.2),
  );
  body.position.y = h / 2;
  g.add(body);
  for (let row = 0; row < 6; row++) {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1.2),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.4 + Math.random() * 0.3 }),
    );
    win.position.set(0, 4 + row * (h / 7), 3.55);
    g.add(win);
  }
  return g;
}

export function buildSnowPine(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.5 * scale, 5), toonMat(0x4a3728));
  trunk.position.y = 1.25 * scale;
  g.add(trunk);
  [3.5, 2.8, 2].forEach((r, i) => {
    const layer = new THREE.Mesh(new THREE.ConeGeometry(r * scale, 2.5 * scale, 7), toonMat(0xffffff));
    layer.position.y = (2.5 + i * 1.8) * scale;
    g.add(layer);
  });
  return g;
}

export function buildTemplePillar(h = 10) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, h, 10), toonMat(0x8b7355));
  shaft.position.y = h / 2;
  g.add(shaft);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), toonMat(0x6b5344));
  cap.position.y = h + 0.25;
  g.add(cap);
  const vine = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 4, 8), toonMat(0x228b22));
  vine.position.y = h * 0.6;
  vine.rotation.x = Math.PI / 2;
  g.add(vine);
  return g;
}

export function buildRedBarn() {
  const g = new THREE.Group();
  const red = toonMat(0xdc143c);
  const white = toonMat(0xffffff);
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 9), red);
  body.position.y = 4;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(10, 4.5, 4), red);
  roof.position.set(0, 10, 0);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4.5, 0.2), white);
  door.position.set(0, 2.25, 4.55);
  g.add(door);
  return g;
}

export function buildWindmill() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 11, 10), toonMat(0xd4a574));
  tower.position.y = 5.5;
  g.add(tower);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), toonMat(0xffffff));
  hub.position.set(2.2, 10, 0);
  g.add(hub);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 0.6), toonMat(0xffffff));
  blade.position.set(2.2, 10, 0);
  blade.userData.spin = true;
  g.add(blade);
  g.userData.blade = blade;
  return g;
}

export function buildCow(i = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.3), toonMat(0xffffff));
  body.position.y = 1.1;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.8, 1), toonMat(0xffffff));
  head.position.set(0, 1.3, 1.4);
  g.add(head);
  for (let s = 0; s < 3; s++) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), toonMat(0x111111));
    spot.position.set((s - 1) * 0.4, 1.2, (s % 2) * 0.5);
    g.add(spot);
  }
  g.userData.grazePhase = i;
  return g;
}

export function buildMetroArch(w = 8, h = 10) {
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), toonMat(0x555555));
  left.position.set(-w / 2, h / 2, 0);
  g.add(left);
  const right = left.clone();
  right.position.x = w / 2;
  g.add(right);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.2, 1.2), toonMat(0x555555));
  top.position.y = h;
  g.add(top);
  const light = new THREE.PointLight(0xffff88, 3, 18);
  light.position.set(0, h - 1, 0);
  g.add(light);
  return g;
}

export function buildGraffitiWall() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 256, 128);
  ['#ff00ff', '#00ffff', '#ffff00', '#ff4444'].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.font = `bold ${28 + i * 4}px system-ui`;
    ctx.fillText(['RACE', 'ZONE', 'MK', 'GO!'][i], 20 + i * 10, 40 + i * 22);
  });
  const tex = new THREE.CanvasTexture(canvas);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 5),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  wall.position.y = 2.5;
  return wall;
}

export function buildSteamVent() {
  const g = new THREE.Group();
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8), toonMat(0x666666, 0x888888, 0.1));
  pipe.position.y = 0.6;
  g.add(pipe);
  const steam = particleField(g, 15, 0xcccccc, 2, [1, 4], 'steam');
  g.userData.steam = steam;
  return g;
}

export function buildTrackArch(label, color = '#ffffff', bg = '#ff7f50') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, '#ffffff22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.font = 'bold 44px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 256, 98);
  ctx.shadowBlur = 0;
  ctx.font = '600 26px system-ui,sans-serif';
  ctx.fillStyle = '#ffffffcc';
  ctx.fillText('MK CIRCUIT', 256, 148);
  const tex = new THREE.CanvasTexture(canvas);
  const arch = new THREE.Group();
  const frameMat = toonMat(0xf5f5f5, 0xffffff, 0.12, 0.4);
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.3, 10, 1.3), frameMat);
  left.position.set(-6.5, 5, 0);
  arch.add(left);
  const right = left.clone();
  right.position.x = 6.5;
  arch.add(right);
  const top = new THREE.Mesh(new THREE.BoxGeometry(14, 1.4, 1.4), frameMat);
  top.position.y = 10;
  arch.add(top);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(11.5, 4.8),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }),
  );
  sign.position.set(0, 7.5, 0.75);
  arch.add(sign);
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(6.8, 0.18, 6, 24, Math.PI),
    toonMat(0xffd700, 0xffaa00, 0.4),
  );
  trim.position.y = 10;
  trim.rotation.x = Math.PI;
  arch.add(trim);
  return arch;
}

export { sampleTrackBounds, cornerPosition, faceCenter };
