/**
 * CosmicSkywayKit.js — procedural recreation of the Cosmic Skyway concept art:
 * nebula sky, swirling wormhole, galaxy burst, cloudy blue planet, asteroid belt,
 * giant neon loop rings and distant neon highways. Canvas textures only, no image files.
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glow(ctx, x, y, r, stops) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function nebulaSkyTexture() {
  return canvasTex(1024, 512, (ctx, w, h) => {
    const r = rand(7);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#04030c');
    bg.addColorStop(0.5, '#0b0822');
    bg.addColorStop(1, '#05040f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const clouds = [
      [0.18, 0.36, 0.22, 'rgba(110,50,210,0.11)'],
      [0.3, 0.48, 0.18, 'rgba(60,40,190,0.10)'],
      [0.62, 0.34, 0.2, 'rgba(140,60,220,0.09)'],
      [0.8, 0.42, 0.14, 'rgba(230,110,70,0.06)'],
      [0.9, 0.38, 0.14, 'rgba(80,60,210,0.09)'],
      [0.45, 0.62, 0.2, 'rgba(40,70,190,0.08)'],
    ];
    clouds.forEach(([cx, cy, cr, col]) => {
      for (let i = 0; i < 12; i++) {
        const x = (cx + (r() - 0.5) * cr) * w;
        const y = (cy + (r() - 0.5) * cr * 0.8) * h;
        glow(ctx, x, y, (0.03 + r() * 0.07) * w, [[0, col], [1, 'rgba(0,0,0,0)']]);
      }
    });
    for (let i = 0; i < 2200; i++) {
      const b = r();
      ctx.fillStyle = `rgba(255,255,255,${0.25 + b * 0.75})`;
      const s = b > 0.985 ? 2.2 : b > 0.9 ? 1.4 : 0.8;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
    for (let i = 0; i < 40; i++) {
      const x = r() * w;
      const y = r() * h * 0.8;
      glow(ctx, x, y, 6 + r() * 8, [[0, 'rgba(255,255,255,0.9)'], [0.3, 'rgba(180,200,255,0.35)'], [1, 'rgba(0,0,0,0)']]);
    }
  });
}

function wormholeTexture() {
  return canvasTex(1024, 1024, (ctx, w) => {
    const c = w / 2;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, c, c, c, [[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(230,200,255,0.95)'], [0.35, 'rgba(150,70,255,0.55)'], [0.75, 'rgba(80,20,180,0.25)'], [1, 'rgba(0,0,0,0)']]);
    for (let arm = 0; arm < 6; arm++) {
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const t = i / 220;
        const a = arm * (TAU / 6) + t * 7.5;
        const rad = 30 + t * (c - 40);
        const x = c + Math.cos(a) * rad;
        const y = c + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arm % 2 ? 'rgba(200,140,255,0.55)' : 'rgba(120,80,255,0.5)';
      ctx.lineWidth = 26;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,255,0.35)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  });
}

function galaxyBurstTexture() {
  return canvasTex(1024, 1024, (ctx, w) => {
    const c = w / 2;
    const r = rand(11);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, c, c, c, [[0, 'rgba(255,255,240,1)'], [0.08, 'rgba(255,230,160,0.95)'], [0.25, 'rgba(255,140,60,0.55)'], [0.55, 'rgba(230,70,140,0.25)'], [1, 'rgba(0,0,0,0)']]);
    for (let i = 0; i < 90; i++) {
      const a = r() * TAU;
      const len = c * (0.35 + r() * 0.65);
      ctx.strokeStyle = `rgba(255,${180 + (r() * 60) | 0},${120 + (r() * 80) | 0},${0.08 + r() * 0.22})`;
      ctx.lineWidth = 1 + r() * 5;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
      ctx.stroke();
    }
  });
}

function planetTexture() {
  return canvasTex(1024, 512, (ctx, w, h) => {
    const r = rand(23);
    const sea = ctx.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#1a4f9e');
    sea.addColorStop(0.5, '#2a78d0');
    sea.addColorStop(1, '#16448c');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = r() * w;
      const y = h * (0.2 + r() * 0.6);
      glow(ctx, x, y, 20 + r() * 50, [[0, 'rgba(60,120,70,0.9)'], [0.7, 'rgba(90,110,60,0.5)'], [1, 'rgba(0,0,0,0)']]);
    }
    for (let i = 0; i < 260; i++) {
      const x = r() * w;
      const y = r() * h;
      ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 10 + r() * 60, 3 + r() * 10, (r() - 0.5) * 0.6, 0, TAU);
      ctx.fill();
    }
  });
}

function additive(map, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    map, transparent: true, opacity, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false,
  });
}

function neon(color) {
  return new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false });
}

function metal(color = 0x2a2e38) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.85 });
}

function buildWormhole() {
  const g = new THREE.Group();
  g.name = 'cosmic-wormhole';
  const tex = wormholeTexture();
  for (let i = 0; i < 2; i++) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(22 - i * 4, 40), additive(tex, 0.95 - i * 0.2));
    disc.position.z = -i * 3;
    disc.userData.spin = (i % 2 ? -1 : 1) * (0.25 + i * 0.15);
    g.add(disc);
  }
  const frame = new THREE.Mesh(new THREE.TorusGeometry(24, 2.4, 12, 48), metal(0x1f232c));
  g.add(frame);
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * TAU;
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.6), neon(i % 2 ? 0x33e6ff : 0xff9a2e));
    lamp.position.set(Math.cos(a) * 24, Math.sin(a) * 24, 2.3);
    lamp.rotation.z = a;
    g.add(lamp);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(21.6, 0.25, 6, 48), neon(0x9d6bff));
  rim.position.z = 1.5;
  g.add(rim);
  return g;
}

function buildGalaxyBurst() {
  const tex = galaxyBurstTexture();
  const g = new THREE.Group();
  g.name = 'cosmic-galaxy-burst';
  const a = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), additive(tex, 1));
  const b = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), additive(tex, 0.7));
  b.rotation.z = 0.6;
  b.userData.spin = 0.03;
  g.add(a, b);
  return g;
}

function buildPlanet() {
  const g = new THREE.Group();
  g.name = 'cosmic-planet';
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 24),
    new THREE.MeshStandardMaterial({
      map: planetTexture(), emissive: 0x0c2a66, emissiveIntensity: 0.5, roughness: 0.8, fog: false,
    }),
  );
  surface.userData.spin = 0.01;
  g.add(surface);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(95, 32, 24),
    new THREE.MeshBasicMaterial({
      color: 0x66ccff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending,
      side: THREE.BackSide, depthWrite: false, fog: false,
    }),
  );
  g.add(atmo);
  return g;
}

/** Bumps depend only on vertex direction, so vertices shared between triangles stay welded. */
export function asteroidGeometry(seed) {
  const r = rand(seed);
  const craters = Array.from({ length: 6 }, () => ({
    d: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    size: 0.35 + r() * 0.35,
    depth: 0.08 + r() * 0.12,
  }));
  const f = [1 + r() * 2, 1 + r() * 2, 1 + r() * 2];
  const base = new THREE.IcosahedronGeometry(1, 2);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geo = mergeVertices(base);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let k = 1
      + 0.18 * Math.sin(v.x * 2.1 * f[0] + seed) * Math.cos(v.y * 1.7 * f[1])
      + 0.1 * Math.sin(v.z * 3.3 * f[2] + seed * 2)
      + 0.05 * Math.sin((v.x + v.y + v.z) * 9);
    craters.forEach((c) => {
      const dist = v.distanceTo(c.d);
      if (dist < c.size) k -= c.depth * (1 - (dist / c.size) ** 2);
    });
    v.multiplyScalar(k);
    v.y *= 0.8;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildAsteroidBelt(cx, cz, count = 48) {
  const g = new THREE.Group();
  g.name = 'cosmic-asteroid-belt';
  const r = rand(99);
  const mat = new THREE.MeshStandardMaterial({ color: 0x6e6258, roughness: 0.92, metalness: 0.05 });
  const geos = [1, 2, 3].map(asteroidGeometry);
  const per = Math.ceil(count / geos.length);
  geos.forEach((geo) => {
    const inst = new THREE.InstancedMesh(geo, mat, per);
    inst.name = 'prop-instanced-asteroids';
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < per; i++) {
      const a = r() * TAU;
      const rad = 70 + r() * 70;
      const s = 1.2 + Math.pow(r(), 2) * 7;
      e.set(r() * 3, r() * 3, r() * 3);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(cx + Math.cos(a) * rad, -6 + r() * 42, cz + Math.sin(a) * rad * 0.8),
        q,
        new THREE.Vector3(s, s * (0.7 + r() * 0.4), s * (0.8 + r() * 0.4)),
      );
      inst.setMatrixAt(i, m);
    }
    inst.castShadow = false;
    inst.frustumCulled = true;
    g.add(inst);
  });
  return g;
}

/** Giant decorative loop like the vertical loop in the art: metal ribbon with neon edges. */
function buildNeonLoop(radius = 26) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-loop';
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(radius, 1.6, 6, 48), metal(0x262a34));
  ribbon.scale.z = 3.2;
  g.add(ribbon);
  [-1, 1].forEach((side) => {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.1, 0.22, 6, 48), neon(side < 0 ? 0x33e6ff : 0xff9a2e));
    edge.position.z = side * 5;
    g.add(edge);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(radius - 1.7, 0.14, 6, 48), neon(0x33e6ff));
    inner.position.z = side * 4.2;
    g.add(inner);
  });
  return g;
}

/** Distant elevated highway ribbon with neon strips along a spline. */
function buildDistantHighway(points) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.Group();
  g.name = 'cosmic-distant-highway';
  const deck = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 3, 4, false), metal(0x22262f));
  deck.scale.y = 0.35;
  g.add(deck);
  [-1, 1].forEach((side) => {
    const pts = curve.getSpacedPoints(48).map((p, i, arr) => {
      const next = arr[Math.min(i + 1, arr.length - 1)];
      const prev = arr[Math.max(i - 1, 0)];
      const tan = next.clone().sub(prev).normalize();
      const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      return p.clone().addScaledVector(n, side * 3).add(new THREE.Vector3(0, 0.9, 0));
    });
    const strip = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.28, 4, false),
      neon(side < 0 ? 0x33e6ff : 0xff9a2e),
    );
    g.add(strip);
  });
  return g;
}

function buildNebulaDome(cx, cz) {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(820, 32, 16),
    new THREE.MeshBasicMaterial({ map: nebulaSkyTexture(), side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }),
  );
  dome.name = 'cosmic-nebula-dome';
  dome.position.set(cx, 0, cz);
  dome.renderOrder = -25;
  dome.frustumCulled = false;
  return dome;
}

/**
 * Start line is on the +x lobe heading -z, so the hero wormhole, galaxy burst and planet
 * are placed in that forward view, echoing the art's composition.
 */
export function installCosmicSkyway(world, bounds, variant = null) {
  const g = new THREE.Group();
  g.name = 'cosmic-skyway-vista';
  const { cx, cz } = bounds;
  const v = variant || {
    wormhole: { x: 10, y: 42, z: -150 },
    burst: { x: 115, y: 62, z: -250 },
    planet: { x: 150, y: -95, z: -170 },
    loopA: { x: 95, y: 28, z: -70, ry: Math.PI / 2.4 },
    loopB: { x: -100, y: 24, z: 40, ry: -Math.PI / 3 },
    asteroidSeed: 99,
  };

  g.add(buildNebulaDome(cx, cz));

  const wormhole = buildWormhole();
  wormhole.position.set(cx + v.wormhole.x, v.wormhole.y, cz + v.wormhole.z);
  wormhole.lookAt(cx + 54, 10, cz);
  g.add(wormhole);

  const burst = buildGalaxyBurst();
  burst.position.set(cx + v.burst.x, v.burst.y, cz + v.burst.z);
  burst.lookAt(cx + 54, 10, cz);
  g.add(burst);

  const planet = buildPlanet();
  planet.position.set(cx + v.planet.x, v.planet.y, cz + v.planet.z);
  g.add(planet);

  g.add(buildAsteroidBelt(cx, cz, 48));

  const loopA = buildNeonLoop(28);
  loopA.position.set(cx + v.loopA.x, v.loopA.y, cz + v.loopA.z);
  loopA.rotation.y = v.loopA.ry;
  g.add(loopA);
  const loopB = buildNeonLoop(22);
  loopB.position.set(cx + v.loopB.x, v.loopB.y, cz + v.loopB.z);
  loopB.rotation.y = v.loopB.ry;
  g.add(loopB);

  g.add(buildDistantHighway([
    [cx - 160, 30, cz - 120], [cx - 60, 45, cz - 160], [cx + 60, 35, cz - 190], [cx + 180, 55, cz - 170],
  ]));

  const spinners = [];
  g.traverse((o) => {
    if (o.userData.spin) spinners.push(o);
  });
  g.userData.cosmicSpinners = spinners;

  world.add(g);
  world.userData.cosmicSkyway = g;
}

export function animateCosmicSkyway(world, time) {
  const spinners = world?.userData?.cosmicSkyway?.userData?.cosmicSpinners;
  if (!spinners?.length) return;
  for (let i = 0; i < spinners.length; i++) {
    const o = spinners[i];
    o.rotation.z = time * o.userData.spin;
  }
}
