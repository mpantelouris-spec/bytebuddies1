/**
 * SunsetCoastHeroKit.js — MK8-style hero assets for Track 1 (reference art).
 * Industrial start gantry, neon checkpoint, moss cliff, dome town, crowd.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';

function screenTexture(text, bg = '#2244aa', fg = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 4) {
    ctx.fillStyle = `rgba(255,255,255,${y % 8 === 0 ? 0.04 : 0.02})`;
    ctx.fillRect(0, y, 512, 2);
  }
  ctx.strokeStyle = '#88aaff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 240);
  ctx.fillStyle = fg;
  ctx.font = 'bold 64px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 128);
  return new THREE.CanvasTexture(c);
}

/** Mockup START gate — checkered flags + START banner spanning the road. */
export function buildCheckeredStartGantry(halfWidth = 4, label = 'START') {
  const g = new THREE.Group();
  g.name = 'industrial-start-gantry';
  const span = Math.max(halfWidth * 2 + 1.4, 9.5);
  const postX = span / 2;
  const postH = 5.4;
  const steel = pbrMat(0x3a3f48, { metalness: 0.55, roughness: 0.28 });
  const dark = pbrMat(0x1a1c22, { metalness: 0.4, roughness: 0.4 });

  [-postX, postX].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, postH, 0.32), steel);
    post.position.set(x, postH / 2, 0);
    post.castShadow = true;
    g.add(post);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), dark);
    cap.position.set(x, postH + 0.05, 0);
    g.add(cap);
  });

  const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 0.5, 0.38, 0.38), steel);
  beam.position.set(0, postH + 0.12, 0);
  beam.castShadow = true;
  g.add(beam);

  const flagW = span * 0.22;
  const flagH = 1.35;
  const cols = 8;
  const rows = 4;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111111' : '#f4f4f0';
      ctx.fillRect((x * 256) / cols, (y * 128) / rows, 256 / cols + 1, 128 / rows + 1);
    }
  }
  const flagTex = new THREE.CanvasTexture(canvas);
  flagTex.colorSpace = THREE.SRGBColorSpace;
  const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide });
  [-1, 1].forEach((side) => {
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(flagW, flagH), flagMat);
    flag.position.set(side * (span * 0.34), postH - 0.55, 0.22);
    g.add(flag);
  });

  const signC = document.createElement('canvas');
  signC.width = 512;
  signC.height = 128;
  const sctx = signC.getContext('2d');
  sctx.fillStyle = '#2a3038';
  sctx.fillRect(0, 0, 512, 128);
  sctx.fillStyle = '#f8fafc';
  sctx.font = 'bold 72px system-ui,sans-serif';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText(String(label || 'START').toUpperCase(), 256, 68);
  const signTex = new THREE.CanvasTexture(signC);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 0.42, 1.15),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }),
  );
  sign.position.set(0, postH - 0.55, 0.24);
  g.add(sign);
  const signBack = new THREE.Mesh(
    new THREE.BoxGeometry(span * 0.44, 1.22, 0.1),
    dark,
  );
  signBack.position.set(0, postH - 0.55, 0.16);
  g.add(signBack);

  return g;
}

/** Colorful industrial START gantry — orange/yellow/blue with 3 digital screens. */
export function buildIndustrialStartGantry(label = 'BEACH RACE') {
  const g = new THREE.Group();
  g.name = 'industrial-start-gantry';

  const colors = [0xff8800, 0xffcc00, 0x2288ff];
  [-5.2, 5.2].forEach((x, i) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 5.8, 0.55),
      pbrMat(0xeeeeee, { metalness: 0.4, roughness: 0.35 }),
    );
    post.position.set(x, 2.9, 0);
    post.castShadow = true;
    g.add(post);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.2, 0.58),
      pbrMat(colors[i % 3], { emissive: colors[i % 3], emi: 0.35 }),
    );
    stripe.position.set(x, 4.8, 0);
    g.add(stripe);
  });

  // Main beam — segmented orange / yellow / blue
  const segW = 4;
  colors.forEach((col, i) => {
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(segW - 0.1, 0.85, 0.7),
      pbrMat(col, { metalness: 0.25, roughness: 0.3, emissive: col, emi: 0.2 }),
    );
    seg.position.set((i - 1) * segW, 5.6, 0);
    seg.castShadow = true;
    g.add(seg);
  });

  // Three digital screens
  ['GO!', label, 'LAP 1'].forEach((txt, i) => {
    const tex = screenTexture(txt, ['#ff6622', '#2244aa', '#118844'][i]);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.4),
      new THREE.MeshBasicMaterial({ map: tex }),
    );
    screen.position.set((i - 1) * 3.2, 6.8, 0.4);
    g.add(screen);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.55, 0.12),
      pbrMat(0x333333, { metalness: 0.6, roughness: 0.25 }),
    );
    frame.position.set((i - 1) * 3.2, 6.8, 0.32);
    g.add(frame);
  });

  const light = new THREE.PointLight(0xffaa44, 2, 22);
  light.position.set(0, 6, 2);
  g.add(light);
  return g;
}

/** 10m checkered strip — 16 alternating squares (1.25m each). */
export function buildWideCheckeredStart(curve, halfWidth, finishT = 0) {
  const { pos, frame } = placeAtTrack(curve, finishT, 0, 0);
  const rot = frame.rot ?? 0;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cols = 16;
  const rows = 4;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111111' : '#f5f5f0';
      ctx.fillRect((x * 512) / cols, (y * 128) / rows, 512 / cols + 1, 128 / rows + 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 2.5),
    pbrMat(0xffffff, {
      map: tex, roughness: 0.15, metalness: 0.2, emissive: 0x222222, emi: 0.05,
    }),
  );
  line.rotation.x = -Math.PI / 2;
  line.rotation.y = rot;
  line.position.copy(pos);
  const roadY = curve.getPointAt(finishT).y || 0;
  line.position.y += roadY + 0.07;
  line.receiveShadow = true;
  line.name = 'checkered-start-wide';
  return line;
}

/** Glowing blue neon CHECKPOINT torus arch (reference image). */
export function buildNeonCheckpointArch(halfWidth = 4, color = 0x00ccff) {
  const g = new THREE.Group();
  g.name = 'neon-checkpoint';

  const glowMat = pbrMat(color, { emissive: color, emi: 2.5, roughness: 0.1, metalness: 0.3 });
  const archR = halfWidth + 0.5;
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(archR, 0.22, 12, 48, Math.PI),
    glowMat,
  );
  torus.rotation.x = Math.PI / 2;
  torus.rotation.z = Math.PI;
  torus.position.y = archR + 0.3;
  g.add(torus);

  [-archR, archR].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.5, 10), glowMat);
    post.position.set(x, 1.75, 0);
    g.add(post);
  });

  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#001a33';
  ctx.fillRect(0, 0, 512, 96);
  ctx.shadowColor = '#00ccff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#00eeff';
  ctx.font = 'bold 48px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHECKPOINT', 256, 48);
  const tex = new THREE.CanvasTexture(c);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.0),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  sign.position.set(0, archR * 2 + 0.5, 0.3);
  g.add(sign);

  const pl = new THREE.PointLight(color, 1.8, 16);
  pl.position.set(0, archR, 0);
  g.add(pl);
  g.userData.pulse = true;
  g.userData.glowMat = glowMat;
  return g;
}

export function registerNeonArch(world, arch) {
  const mat = arch.userData?.glowMat;
  if (!mat) return;
  if (!world.userData.neonArches) world.userData.neonArches = [];
  world.userData.neonArches.push(mat);
}

/** Mossy rocky cliff with colorful flowers (left side of track). */
export function buildMossCliff(w = 14, h = 16) {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1, 1),
    pbrMat(0x8a7a68, { roughness: 0.88, metalness: 0.05 }),
  );
  rock.scale.set(w * 0.45, h * 0.35, 4);
  rock.position.y = h * 0.35;
  rock.castShadow = true;
  rock.receiveShadow = true;
  g.add(rock);

  const moss = new THREE.Mesh(
    new THREE.SphereGeometry(w * 0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    pbrMat(0x2d8f4e, { roughness: 0.92, emissive: 0x1a5530, emi: 0.08 }),
  );
  moss.position.set(0, h * 0.55, 1.5);
  moss.scale.set(1.2, 0.6, 0.8);
  g.add(moss);

  const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9b59b6, 0x00ced1];
  for (let i = 0; i < 18; i++) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.5 + Math.random() * 0.6, 5),
      pbrMat(0x228b22, { roughness: 0.8 }),
    );
    const fx = (Math.random() - 0.5) * w * 0.7;
    const fz = 1 + Math.random() * 2;
    const fy = h * 0.35 + Math.random() * h * 0.35;
    stem.position.set(fx, fy, fz);
    g.add(stem);
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 6, 6),
      pbrMat(flowerColors[i % flowerColors.length], { emissive: flowerColors[i % flowerColors.length], emi: 0.25 }),
    );
    petal.position.set(fx, fy + 0.35, fz);
    g.add(petal);
  }

  for (let i = 0; i < 8; i++) {
    const succulent = new THREE.Mesh(
      new THREE.SphereGeometry(0.25 + Math.random() * 0.2, 8, 6),
      pbrMat(0x4a9e5a, { roughness: 0.7 }),
    );
    succulent.position.set((Math.random() - 0.5) * w * 0.6, 0.3 + Math.random() * 1.5, 2 + Math.random());
    succulent.scale.y = 0.5;
    g.add(succulent);
  }
  return g;
}

/** Futuristic dome town with spectator crowd (right side). */
export function buildDomeTownWithCrowd(width = 28, depth = 18, bannerText = 'BEACH CUP') {
  const g = new THREE.Group();
  g.name = 'dome-town';

  const domeColors = [0xffaa66, 0x88ccff, 0xff88aa, 0xaaddff];
  for (let i = 0; i < 5; i++) {
    const bx = (i - 2) * 5.5;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.8, 3.5, 12),
      pbrMat(0xe8e8f0, { roughness: 0.35, metalness: 0.15 }),
    );
    body.position.set(bx, 1.75, -2);
    body.castShadow = true;
    g.add(body);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      pbrMat(domeColors[i % 4], { roughness: 0.25, metalness: 0.2, emissive: domeColors[i % 4], emi: 0.1 }),
    );
    dome.position.set(bx, 3.5, -2);
    g.add(dome);
    const window = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 8),
      pbrMat(0x88ddff, { emissive: 0x44aaff, emi: 0.8 }),
    );
    window.position.set(bx, 2.2, -0.35);
    g.add(window);
  }

  // Grandstand crowd
  const crowdColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xff9ff3, 0x54a0ff, 0xff8844];
  for (let tier = 0; tier < 4; tier++) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.9, 2.5 + tier * 0.4),
      pbrMat(tier % 2 ? 0xcc4444 : 0x334466, { roughness: 0.65 }),
    );
    seat.position.set(0, 0.45 + tier * 1.0, 4 + tier * 1.5);
    g.add(seat);
    for (let i = 0; i < 24; i++) {
      const person = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        pbrMat(crowdColors[(i + tier) % crowdColors.length], { roughness: 0.75 }),
      );
      person.position.set(
        (i - 12) * 1.1 + (Math.random() - 0.5) * 0.3,
        1.1 + tier * 1.0,
        4.2 + tier * 1.5 + (Math.random() - 0.5) * 0.4,
      );
      person.scale.y = 1.3;
      g.add(person);
    }
  }

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 1.5),
    new THREE.MeshBasicMaterial({
      map: screenTexture(bannerText, '#ff6622', '#ffffff'),
    }),
  );
  banner.position.set(0, 6.5, 3);
  g.add(banner);
  return g;
}

/** Background flying vehicles (reference sky). */
export function buildFlyingVehicles(bounds, count = 6) {
  const g = new THREE.Group();
  g.name = 'flying-vehicles';
  for (let i = 0; i < count; i++) {
    const ship = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.2, 4, 8),
      pbrMat(0xeeeeff, { metalness: 0.5, roughness: 0.2, emissive: 0x4488ff, emi: 0.15 }),
    );
    body.rotation.z = Math.PI / 2;
    ship.add(body);
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.06, 0.5),
      pbrMat(0xccccff, { metalness: 0.4, roughness: 0.25 }),
    );
    ship.add(wing);
    const angle = (i / count) * Math.PI * 2;
    const dist = bounds.radius + 35 + (i % 3) * 12;
    ship.position.set(
      bounds.cx + Math.cos(angle) * dist,
      28 + (i % 4) * 6,
      bounds.cz + Math.sin(angle) * dist,
    );
    ship.rotation.y = angle + Math.PI / 2;
    ship.userData.flyPhase = i * 1.7;
    g.add(ship);
  }
  g.userData.animTick = (time) => {
    g.children.forEach((ship) => {
      ship.position.y += Math.sin(time * 0.4 + ship.userData.flyPhase) * 0.008;
      ship.rotation.z = Math.sin(time * 0.3 + ship.userData.flyPhase) * 0.05;
    });
  };
  return g;
}

/** Boost pad with chevron arrows (reference). */
export function buildChevronBoostPad() {
  const g = new THREE.Group();
  g.name = 'chevron-boost-pad';
  g.userData.isBoostPad = true;
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 2),
    pbrMat(0xffaa00, { emissive: 0xff8800, emi: 0.7, roughness: 0.2 }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.06;
  pad.name = 'boost-pad';
  g.add(pad);
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const ox = 40 + i * 50;
    ctx.moveTo(ox, 10);
    ctx.lineTo(ox + 30, 32);
    ctx.lineTo(ox, 54);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  const arrows = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.4),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  arrows.rotation.x = -Math.PI / 2;
  arrows.position.y = 0.08;
  g.add(arrows);
  return g;
}

/** Place hero cliff on left, town on right along track — tight to road like reference. */
export function placeSunsetHeroSet(world, curve, hw, bounds) {
  // Left cliff wall — dense, close to track
  for (let i = 0; i < 16; i++) {
    const t = 0.03 + (i / 16) * 0.94;
    const { pos, frame } = placeAtTrack(curve, t, -(hw + 8 + (i % 3) * 2), 0);
    const cliff = buildMossCliff(10 + (i % 4), 12 + (i % 3) * 2);
    cliff.position.copy(pos);
    cliff.rotation.y = (frame.rot ?? 0) + 0.15;
    world.add(cliff);
  }

  // Right dome town + crowd — every section
  for (let i = 0; i < 10; i++) {
    const t = 0.05 + (i / 10) * 0.9;
    const { pos, frame } = placeAtTrack(curve, t, hw + 12 + (i % 2) * 3, 0);
    const town = buildDomeTownWithCrowd(22, 12);
    town.position.copy(pos);
    town.rotation.y = (frame.rot ?? 0) + Math.PI;
    world.add(town);
  }
}

export function placeSunsetTrackGameplay(world, curve, hw) {
  const boostTs = [0.18, 0.52, 0.78];
  boostTs.forEach((t) => {
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    const pad = buildChevronBoostPad();
    pad.position.copy(pos);
    pad.rotation.y = frame.rot ?? 0;
    world.add(pad);
  });
}

export function animateNeonCheckpoints(world, time) {
  const arches = world.userData?.neonArches;
  if (arches?.length) {
    arches.forEach((mat, i) => {
      mat.emissiveIntensity = 1.8 + Math.sin(time * 3.8 + i) * 0.8;
    });
    return;
  }
  world.traverse((obj) => {
    if (!obj.userData?.pulse || !obj.userData?.glowMat) return;
    obj.userData.glowMat.emissiveIntensity = 1.8 + Math.sin(time * 3.8) * 0.8;
  });
}
