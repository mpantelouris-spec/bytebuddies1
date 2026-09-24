/**
 * CosmicSkywayKit.js — procedural space scenery shared by all Cosmic Skyway tracks:
 * nebula sky, wormholes, galaxy bursts, planets, black holes, suns, pulsars, comets,
 * space stations, asteroid belts, neon loops and distant neon highways.
 * Every piece is themed per track (see CosmicSkywayRegistry). Canvas textures only.
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getCosmicTheme } from './CosmicSkywayRegistry.js';

const TAU = Math.PI * 2;

function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

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

function nebulaSkyTexture(theme, seed = 7) {
  return canvasTex(1024, 512, (ctx, w, h) => {
    const r = rand(seed);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, theme.nebulaBg[0]);
    bg.addColorStop(0.5, theme.nebulaBg[1]);
    bg.addColorStop(1, theme.nebulaBg[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const spots = [
      [0.18, 0.36, 0.22, 0.11], [0.3, 0.48, 0.18, 0.1], [0.62, 0.34, 0.2, 0.09],
      [0.8, 0.42, 0.14, 0.06], [0.9, 0.38, 0.14, 0.09], [0.45, 0.62, 0.2, 0.08],
    ];
    spots.forEach(([cx, cy, cr, a], k) => {
      const col = theme.nebula[k % theme.nebula.length];
      for (let i = 0; i < 12; i++) {
        const x = (cx + (r() - 0.5) * cr) * w;
        const y = (cy + (r() - 0.5) * cr * 0.8) * h;
        glow(ctx, x, y, (0.03 + r() * 0.07) * w, [[0, rgba(col, a)], [1, 'rgba(0,0,0,0)']]);
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

function wormholeTexture(glowCols, arms) {
  return canvasTex(1024, 1024, (ctx, w) => {
    const c = w / 2;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, c, c, c, [[0, 'rgba(255,255,255,1)'], [0.12, rgba(glowCols[0], 0.95)], [0.35, rgba(glowCols[1], 0.55)], [0.75, rgba(glowCols[2], 0.25)], [1, 'rgba(0,0,0,0)']]);
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
      ctx.strokeStyle = rgba(arms[arm % 2], arm % 2 ? 0.55 : 0.5);
      ctx.lineWidth = 26;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,255,0.35)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  });
}

function burstTexture(core, mid, outer, seed = 11) {
  return canvasTex(1024, 1024, (ctx, w) => {
    const c = w / 2;
    const r = rand(seed);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, c, c, c, [[0, 'rgba(255,255,245,1)'], [0.08, rgba(core, 0.95)], [0.25, rgba(mid, 0.55)], [0.55, rgba(outer, 0.25)], [1, 'rgba(0,0,0,0)']]);
    for (let i = 0; i < 90; i++) {
      const a = r() * TAU;
      const len = c * (0.35 + r() * 0.65);
      const k = r();
      const col = [0, 1, 2].map((j) => Math.round(core[j] * (1 - k) + mid[j] * k));
      ctx.strokeStyle = rgba(col, 0.08 + r() * 0.22);
      ctx.lineWidth = 1 + r() * 5;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
      ctx.stroke();
    }
  });
}

function softGlowTexture(stops) {
  return canvasTex(256, 256, (ctx, w) => {
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, w / 2, w / 2, w / 2, stops);
  });
}

function planetTexture(sea, land, seed = 23) {
  return canvasTex(1024, 512, (ctx, w, h) => {
    const r = rand(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sea[0]);
    g.addColorStop(0.5, sea[1]);
    g.addColorStop(1, sea[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = r() * w;
      const y = h * (0.2 + r() * 0.6);
      glow(ctx, x, y, 20 + r() * 50, [[0, rgba(land, 0.9)], [0.7, rgba(land, 0.5)], [1, 'rgba(0,0,0,0)']]);
    }
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 10 + r() * 60, 3 + r() * 10, (r() - 0.5) * 0.6, 0, TAU);
      ctx.fill();
    }
  });
}

function gasBandsTexture(bands, seed = 31) {
  return canvasTex(512, 256, (ctx, w, h) => {
    const r = rand(seed);
    let y = 0;
    while (y < h) {
      const bh = 6 + r() * 22;
      ctx.fillStyle = bands[Math.floor(r() * bands.length)];
      ctx.fillRect(0, y, w, bh + 1);
      y += bh;
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 20 + r() * 80, 1 + r() * 3, 0, 0, TAU);
      ctx.fill();
    }
  });
}

/** Radial bands on a square canvas — RingGeometry's planar UVs map this to concentric rings. */
function ringBandsTexture(a, b, inner = 0.6, seed = 41) {
  return canvasTex(512, 512, (ctx, w) => {
    const r = rand(seed);
    const c = w / 2;
    for (let rad = c; rad > c * inner; rad -= 2 + r() * 6) {
      const k = r();
      const col = [0, 1, 2].map((j) => Math.round(a[j] * (1 - k) + b[j] * k));
      ctx.strokeStyle = rgba(col, 0.25 + r() * 0.6);
      ctx.lineWidth = 2 + r() * 5;
      ctx.beginPath();
      ctx.arc(c, c, rad, 0, TAU);
      ctx.stroke();
    }
  });
}

function accretionTexture(cols, seed = 51) {
  return canvasTex(1024, 1024, (ctx, w) => {
    const c = w / 2;
    const r = rand(seed);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(c, c, c * 0.34, c, c, c);
    g.addColorStop(0, rgba(cols[0], 1));
    g.addColorStop(0.2, rgba(cols[1], 0.85));
    g.addColorStop(0.6, rgba(cols[2], 0.35));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
    for (let i = 0; i < 160; i++) {
      const rad = c * (0.36 + r() * 0.6);
      const a0 = r() * TAU;
      ctx.strokeStyle = rgba(cols[Math.floor(r() * 2)], 0.08 + r() * 0.25);
      ctx.lineWidth = 1 + r() * 4;
      ctx.beginPath();
      ctx.arc(c, c, rad, a0, a0 + 0.4 + r() * 1.6);
      ctx.stroke();
    }
  });
}

/** Vertical fade used for pulsar beams and comet tails (bright at v=1). */
function streakTexture(col) {
  return canvasTex(64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, rgba(col, 0.35));
    g.addColorStop(1, 'rgba(255,255,255,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const s = ctx.createLinearGradient(0, 0, w, 0);
    s.addColorStop(0, 'rgba(0,0,0,1)');
    s.addColorStop(0.5, 'rgba(0,0,0,0)');
    s.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, w, h);
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

function buildWormhole(o, theme) {
  const g = new THREE.Group();
  g.name = 'cosmic-wormhole';
  const tex = wormholeTexture(o.glow, o.arms);
  for (let i = 0; i < 2; i++) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(22 - i * 4, 40), additive(tex, 0.95 - i * 0.2));
    disc.position.z = -i * 3;
    disc.userData.spin = (i % 2 ? -1 : 1) * (0.25 + i * 0.15);
    g.add(disc);
  }
  g.add(new THREE.Mesh(new THREE.TorusGeometry(24, 2.4, 12, 48), metal(theme.frame)));
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * TAU;
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.6), neon(i % 2 ? theme.left : theme.right));
    lamp.position.set(Math.cos(a) * 24, Math.sin(a) * 24, 2.3);
    lamp.rotation.z = a;
    g.add(lamp);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(21.6, 0.25, 6, 48), neon(o.rim));
  rim.position.z = 1.5;
  g.add(rim);
  return g;
}

function buildBurst(o) {
  const tex = burstTexture(o.core, o.mid, o.outer);
  const g = new THREE.Group();
  g.name = 'cosmic-galaxy-burst';
  const a = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), additive(tex, 1));
  const b = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), additive(tex, 0.7));
  b.rotation.z = 0.6;
  b.userData.spin = 0.03;
  g.add(a, b);
  return g;
}

function buildPlanet(o, radius = 90) {
  const g = new THREE.Group();
  g.name = 'cosmic-planet';
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 24),
    new THREE.MeshStandardMaterial({
      map: planetTexture(o.sea, o.land), emissive: o.emissive, emissiveIntensity: 0.5, roughness: 0.8, fog: false,
    }),
  );
  surface.userData.spinY = 0.01;
  g.add(surface);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.055, 32, 24),
    new THREE.MeshBasicMaterial({
      color: o.atmo, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending,
      side: THREE.BackSide, depthWrite: false, fog: false,
    }),
  );
  g.add(atmo);
  return g;
}

function buildRingedPlanet(o) {
  const g = new THREE.Group();
  g.name = 'cosmic-ringed-planet';
  const tilt = new THREE.Group();
  tilt.rotation.set(0.35, 0, -0.3);
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(46, 32, 24),
    new THREE.MeshStandardMaterial({ map: gasBandsTexture(o.bands), roughness: 0.9, emissive: 0x220a1a, emissiveIntensity: 0.4, fog: false }),
  );
  body.userData.spinY = 0.02;
  tilt.add(body);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(58, 96, 96),
    new THREE.MeshBasicMaterial({
      map: ringBandsTexture(o.ring[0], o.ring[1]), transparent: true, side: THREE.DoubleSide,
      depthWrite: false, fog: false, toneMapped: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  tilt.add(ring);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(49, 32, 24),
    new THREE.MeshBasicMaterial({ color: o.atmo, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false, fog: false }),
  );
  tilt.add(atmo);
  g.add(tilt);
  g.userData.noFaceCamera = true;
  return g;
}

function buildTwinPlanets() {
  const g = new THREE.Group();
  g.name = 'cosmic-twin-planets';
  const a = buildPlanet({ sea: ['#1e6a3a', '#3aa860', '#145a2e'], land: [200, 190, 120], atmo: 0x8aff9a, emissive: 0x0a3016 }, 44);
  a.position.set(-30, 10, 0);
  const b = buildPlanet({ sea: ['#4a2a8a', '#7a4ac8', '#341e6e'], land: [240, 160, 220], atmo: 0xc89aff, emissive: 0x1e0a3a }, 28);
  b.position.set(46, 34, -30);
  g.add(a, b);
  const glowTex = softGlowTexture([[0, 'rgba(160,255,200,0.35)'], [1, 'rgba(0,0,0,0)']]);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), additive(glowTex, 0.6));
  halo.position.z = -60;
  g.add(halo);
  return g;
}

function buildSun(o) {
  const g = new THREE.Group();
  g.name = 'cosmic-sun';
  g.add(new THREE.Mesh(new THREE.SphereGeometry(18, 32, 24), neon(o.core)));
  const corona = softGlowTexture([[0, rgba(o.glow[0], 1)], [0.2, rgba(o.glow[1], 0.7)], [0.55, rgba(o.glow[2], 0.25)], [1, 'rgba(0,0,0,0)']]);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(130, 130), additive(corona, 1)));
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(170, 170), additive(burstTexture(o.glow[0], o.glow[1], o.glow[2], 17), 0.55));
  rays.userData.spin = -0.02;
  g.add(rays);
  return g;
}

function buildBlackHole(o) {
  const g = new THREE.Group();
  g.name = 'cosmic-black-hole';
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    additive(softGlowTexture([[0, rgba(o.disk[1], 0.5)], [0.35, rgba(o.disk[2], 0.25)], [1, 'rgba(0,0,0,0)']]), 0.8),
  );
  halo.position.z = -6;
  g.add(halo);
  const diskTex = accretionTexture(o.disk);
  const back = new THREE.Mesh(new THREE.RingGeometry(13.2, 26, 96), additive(diskTex, 0.7));
  back.position.z = -1;
  back.userData.spin = 0.08;
  g.add(back);
  const tilt = new THREE.Group();
  tilt.rotation.x = -1.2;
  const disk = new THREE.Mesh(new THREE.RingGeometry(14, 46, 128), additive(diskTex, 1));
  disk.userData.spin = 0.12;
  tilt.add(disk);
  g.add(tilt);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 24), new THREE.MeshBasicMaterial({ color: 0x000000, fog: false })));
  const photon = new THREE.Mesh(new THREE.TorusGeometry(12.7, 0.35, 8, 64), neon(o.ring));
  g.add(photon);
  return g;
}

function buildPulsar(o) {
  const g = new THREE.Group();
  g.name = 'cosmic-pulsar';
  g.add(new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), neon(0xffffff)));
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    additive(softGlowTexture([[0, 'rgba(255,255,255,1)'], [0.15, rgba(o.color, 0.8)], [1, 'rgba(0,0,0,0)']]), 1),
  ));
  const spinner = new THREE.Group();
  spinner.rotation.z = 0.5;
  const beamTex = streakTexture(o.color);
  [1, -1].forEach((dir) => {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(7, 190, 20, 1, true), additive(beamTex, 0.6));
    beam.position.y = dir * 95;
    if (dir < 0) beam.rotation.z = Math.PI;
    spinner.add(beam);
  });
  const axis = new THREE.Group();
  axis.add(spinner);
  axis.userData.spinY = 0.9;
  g.add(axis);
  return g;
}

function buildComet(o) {
  const g = new THREE.Group();
  g.name = 'cosmic-comet';
  const nucleus = new THREE.Mesh(asteroidGeometry(77), new THREE.MeshStandardMaterial({ color: 0xd8ecf8, roughness: 0.6, emissive: 0x3a5a7a, emissiveIntensity: 0.4 }));
  nucleus.scale.setScalar(5);
  g.add(nucleus);
  g.add(new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    additive(softGlowTexture([[0, 'rgba(255,255,255,0.95)'], [0.25, rgba(o.color, 0.6)], [1, 'rgba(0,0,0,0)']]), 1),
  ));
  const tailTex = streakTexture(o.color);
  const tail = new THREE.Mesh(new THREE.PlaneGeometry(26, 220), additive(tailTex, 0.9));
  tail.rotation.z = Math.PI / 2 + 0.25;
  tail.position.set(106, -26, -2);
  g.add(tail);
  const ion = new THREE.Mesh(new THREE.PlaneGeometry(9, 260), additive(streakTexture([140, 200, 255]), 0.8));
  ion.rotation.z = Math.PI / 2 + 0.1;
  ion.position.set(128, -12, -3);
  g.add(ion);
  return g;
}

function buildStation(o, theme) {
  const g = new THREE.Group();
  g.name = 'cosmic-station';
  const spin = new THREE.Group();
  spin.userData.spin = 0.12;
  spin.add(new THREE.Mesh(new THREE.TorusGeometry(30, 3, 12, 64), metal(0x3a3e48)));
  [-1, 1].forEach((side) => {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(30, 0.3, 6, 64), neon(side < 0 ? o.accent : theme.right));
    edge.position.z = side * 3;
    spin.add(edge);
  });
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 58, 8), metal(0x2e323c));
    spoke.rotation.z = (i / 4) * Math.PI;
    spin.add(spoke);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 0.4), neon(0xfff2c8));
    win.position.set(Math.cos(a) * 30, Math.sin(a) * 30, 3.2);
    win.rotation.z = a;
    spin.add(win);
  }
  g.add(spin);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 16, 16).rotateX(Math.PI / 2), metal(0x4a4e58)));
  const truss = new THREE.Mesh(new THREE.BoxGeometry(110, 1.2, 1.2), metal(0x2a2e38));
  truss.position.z = -10;
  g.add(truss);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a3a8a, roughness: 0.3, metalness: 0.6, emissive: 0x0a1a4a, emissiveIntensity: 0.6 });
  [-1, 1].forEach((side) => {
    for (let k = 0; k < 2; k++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(18, 30, 0.4), panelMat);
      panel.position.set(side * (40 + k * 20), 0, -10);
      g.add(panel);
    }
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), neon(o.accent));
  beacon.position.set(0, 0, 9);
  g.add(beacon);
  return g;
}

function buildHero(o, theme) {
  if (!o) return null;
  let obj;
  switch (o.type) {
    case 'wormhole': obj = buildWormhole(o, theme); break;
    case 'burst': obj = buildBurst(o); break;
    case 'planet': obj = buildPlanet(o); break;
    case 'ringedPlanet': obj = buildRingedPlanet(o); break;
    case 'twinPlanets': obj = buildTwinPlanets(); break;
    case 'sun': obj = buildSun(o); break;
    case 'blackhole': obj = buildBlackHole(o); break;
    case 'pulsar': obj = buildPulsar(o); break;
    case 'comet': obj = buildComet(o); break;
    case 'station': obj = buildStation(o, theme); break;
    default: return null;
  }
  if (o.scale) obj.scale.setScalar(o.scale);
  if (o.y != null) obj.userData.heroY = o.y;
  return obj;
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

function buildAsteroidBelt(cx, cz, count, color, seed) {
  const g = new THREE.Group();
  g.name = 'cosmic-asteroid-belt';
  const r = rand(seed);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.05 });
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
    g.add(inst);
  });
  return g;
}

/** Giant decorative loop like the vertical loop in the art: metal ribbon with neon edges. */
function buildNeonLoop(radius, theme) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-loop';
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(radius, 1.6, 6, 48), metal(theme.frame));
  ribbon.scale.z = 3.2;
  g.add(ribbon);
  [-1, 1].forEach((side) => {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.1, 0.22, 6, 48), neon(side < 0 ? theme.left : theme.right));
    edge.position.z = side * 5;
    g.add(edge);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(radius - 1.7, 0.14, 6, 48), neon(theme.left));
    inner.position.z = side * 4.2;
    g.add(inner);
  });
  return g;
}

/** Distant elevated highway ribbon with neon strips along a spline. */
function buildDistantHighway(points, theme) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.Group();
  g.name = 'cosmic-distant-highway';
  const deck = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 3, 4, false), metal(theme.frame));
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
    g.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.28, 4, false),
      neon(side < 0 ? theme.left : theme.right),
    ));
  });
  return g;
}

function buildNebulaDome(cx, cz, theme, seed) {
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(820, 32, 16),
    new THREE.MeshBasicMaterial({ map: nebulaSkyTexture(theme, seed), side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }),
  );
  dome.name = 'cosmic-nebula-dome';
  dome.position.set(cx, 0, cz);
  dome.renderOrder = -25;
  dome.frustumCulled = false;
  return dome;
}

export function installCosmicSkyway(world, bounds, variant = null, arenaType = 'star_station_01') {
  const theme = getCosmicTheme(arenaType);
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

  const seedBase = (v.asteroidSeed ?? 90) - 90;
  g.add(buildNebulaDome(cx, cz, theme, 7 + seedBase));

  const slots = {};
  [['a', 'wormhole'], ['b', 'burst'], ['c', 'planet']].forEach(([slot, key]) => {
    const obj = buildHero(theme.heroes[slot], theme);
    if (!obj) return;
    obj.position.set(cx + v[key].x, obj.userData.heroY ?? v[key].y, cz + v[key].z);
    g.add(obj);
    slots[slot] = obj;
  });

  g.add(buildAsteroidBelt(cx, cz, theme.asteroidCount ?? 48, theme.asteroid, 99 + seedBase));

  const loopA = buildNeonLoop(28, theme);
  loopA.position.set(cx + v.loopA.x, v.loopA.y, cz + v.loopA.z);
  loopA.rotation.y = v.loopA.ry;
  g.add(loopA);
  const loopB = buildNeonLoop(22, theme);
  loopB.position.set(cx + v.loopB.x, v.loopB.y, cz + v.loopB.z);
  loopB.rotation.y = v.loopB.ry;
  g.add(loopB);

  g.add(buildDistantHighway([
    [cx - 160, 30, cz - 120], [cx - 60, 45, cz - 160], [cx + 60, 35, cz - 190], [cx + 180, 55, cz - 170],
  ], theme));

  const spinners = [];
  g.traverse((o) => {
    if (o.userData.spin || o.userData.spinY) spinners.push(o);
  });
  g.userData.cosmicSpinners = spinners;
  g.userData.heroes = { slots, loopA, loopB, variant: v };

  world.add(g);
  world.userData.cosmicSkyway = g;
}

/**
 * Re-anchor the hero vista to the start line so every layout opens on its landmarks.
 * Offsets are (ahead, right) in the start frame; the variant's x/z deltas from the
 * original layout add per-track variety.
 */
export function alignCosmicSkywayToStart(world, curve, finishT = 0) {
  const g = world?.userData?.cosmicSkyway;
  const h = g?.userData?.heroes;
  if (!h || !curve) return;
  const t = ((finishT % 1) + 1) % 1;
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t);
  const fwd = new THREE.Vector3(tan.x, 0, tan.z).normalize();
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const v = h.variant;
  const at = (ahead, side, y) => new THREE.Vector3(p.x, y, p.z)
    .addScaledVector(fwd, ahead)
    .addScaledVector(right, side);
  const look = new THREE.Vector3(p.x, p.y + 4, p.z);
  const place = (obj, key, baseX, baseZ, ahead, side) => {
    if (!obj) return;
    obj.position.copy(at(ahead - (v[key].z - baseZ), side + (v[key].x - baseX), obj.userData.heroY ?? v[key].y));
    if (!obj.userData.noFaceCamera) obj.lookAt(look);
  };

  place(h.slots.a, 'wormhole', 10, -150, 150, -44);
  place(h.slots.b, 'burst', 115, -250, 250, 61);
  place(h.slots.c, 'planet', 150, -170, 170, 96);
  const turn = Math.atan2(fwd.x, fwd.z) - Math.PI;
  h.loopA.position.copy(at(70, 41, v.loopA.y));
  h.loopA.rotation.y = turn + v.loopA.ry;
  h.loopB.position.copy(at(-40, -154, v.loopB.y));
  h.loopB.rotation.y = turn + v.loopB.ry;
  const eye = new THREE.Vector3(p.x, p.y + 6, p.z);
  const sightLines = [h.slots.a, h.slots.b]
    .filter(Boolean)
    .map((o) => new THREE.Line3(eye, o.position.clone()));
  clearBeltFromRoad(g, curve, sightLines);
}

/** Hide belt asteroids that sit on the road or block the start-line view of the landmarks. */
function clearBeltFromRoad(g, curve, sightLines = []) {
  const belt = g.getObjectByName('cosmic-asteroid-belt');
  if (!belt) return;
  const samples = curve.getSpacedPoints(180);
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const closest = new THREE.Vector3();
  belt.children.forEach((inst) => {
    if (!inst.isInstancedMesh) return;
    for (let i = 0; i < inst.count; i++) {
      inst.getMatrixAt(i, m);
      m.decompose(pos, quat, scl);
      const reach = 12 + Math.max(scl.x, scl.y, scl.z);
      const onRoad = samples.some((s) => Math.abs(s.y - pos.y) < reach + 6
        && Math.hypot(s.x - pos.x, s.z - pos.z) < reach);
      const blocksView = sightLines.some((line) => {
        line.closestPointToPoint(pos, true, closest);
        return closest.distanceTo(pos) < 16 + Math.max(scl.x, scl.y, scl.z);
      });
      if (onRoad || blocksView) inst.setMatrixAt(i, hidden);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
}

export function animateCosmicSkyway(world, time) {
  const spinners = world?.userData?.cosmicSkyway?.userData?.cosmicSpinners;
  if (!spinners?.length) return;
  for (let i = 0; i < spinners.length; i++) {
    const o = spinners[i];
    if (o.userData.spin) o.rotation.z = time * o.userData.spin;
    if (o.userData.spinY) o.rotation.y = time * o.userData.spinY;
  }
}
