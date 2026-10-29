/**
 * MissionThemeKit — kart-quality themed worlds for every primary-studio mission arena.
 * Keeps the gameplay route (road, kerbs, checkpoints, start/finish) and replaces all scenery
 * with a recipe-driven world: sky, lights, ground or indoor room, props, animation and particles.
 */
import * as THREE from 'three';
import { createThemeContext, hideBaseWorld, themeSky, themeLights, skyDisc, seeded } from '../../../racing/themes/RaceThemeCore.js';
import { M, E, tex, css, labelTexture } from './propKit.js';
import { OUTDOOR } from './propsOutdoor.js';
import { INDOOR } from './propsIndoor.js';
import { SKYSEA } from './propsSkySea.js';
import { WORK } from './propsWork.js';
import { TASKS } from './propsTasks.js';
import { GIANT_GARDEN } from './propsGiantGarden.js';
import { MISSION_THEME_RECIPES } from './recipes/index.js';
import { MISSION_TASKS } from './recipes/tasks.js';

export const MISSION_THEME_ROOT = 'mission-theme-scene';
const PROPS = { ...OUTDOOR, ...INDOOR, ...SKYSEA, ...WORK, ...TASKS, ...GIANT_GARDEN };

const GROUND_HIDE = ['KidClarityBase', 'HorizonSilhouette', 'PrimaryStudioArena', 'MissionWorldRoot'];
const AERIAL_HIDE = [
  'KidClarityBase', 'HorizonSilhouette', 'PrimaryStudioArena', 'AerialWorldRoot', 'FlyingVistaLayer',
  'AerialMidground', 'FlyingChassisSetPiece', 'GothicVistaLights', 'FlyingMissionDressing', 'ue5-aerial-atmosphere',
  'AerialDifficultyDressing', 'aaa-sky-dome', 'FlyingModeScenery',
];

const LIGHTS = {
  day: { sun: 0xfff4e0, sunIntensity: 1.6, hemiSky: 0xcfe8ff, hemiGround: 0x9a8a6a, hemiIntensity: 0.95, ambient: 0xffffff, ambientIntensity: 0.3 },
  warm: { sun: 0xffe2b0, sunIntensity: 1.7, hemiSky: 0xffe6c8, hemiGround: 0xa07850, hemiIntensity: 0.9, ambient: 0xfff0dc, ambientIntensity: 0.3 },
  sunset: { sun: 0xffb27a, sunIntensity: 1.5, hemiSky: 0xffc8a8, hemiGround: 0x6a4a5a, hemiIntensity: 0.8, ambient: 0xffd8c0, ambientIntensity: 0.3 },
  night: { sun: 0xa8b8ff, sunIntensity: 0.6, hemiSky: 0x5a6aa8, hemiGround: 0x1c1a2a, hemiIntensity: 0.7, ambient: 0x5a5a8a, ambientIntensity: 0.5, night: true },
  indoor: { sun: 0xfff6ea, sunIntensity: 1.1, hemiSky: 0xffffff, hemiGround: 0xd8c8b0, hemiIntensity: 1.05, ambient: 0xffffff, ambientIntensity: 0.4 },
  underwater: { sun: 0xa8ecff, sunIntensity: 1.0, hemiSky: 0x7fdcff, hemiGround: 0x1a5a6a, hemiIntensity: 0.95, ambient: 0x3a8aa0, ambientIntensity: 0.5 },
  deep: { sun: 0x6fb8ff, sunIntensity: 0.55, hemiSky: 0x3a7ab8, hemiGround: 0x0a1a2a, hemiIntensity: 0.7, ambient: 0x2a4a7a, ambientIntensity: 0.5, night: true },
  space: { sun: 0xffffff, sunIntensity: 1.4, hemiSky: 0x8a9aff, hemiGround: 0x2a2a3a, hemiIntensity: 0.55, ambient: 0x6a6a9a, ambientIntensity: 0.35, night: true },
  stage: { sun: 0xffd8f0, sunIntensity: 0.8, hemiSky: 0xb48aff, hemiGround: 0x2a1a3a, hemiIntensity: 0.75, ambient: 0x8a6aaa, ambientIntensity: 0.45, night: true },
};

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function hasMissionTheme(arenaId) {
  return Boolean(MISSION_THEME_RECIPES[arenaId]);
}

// ─── Textures ───────────────────────────────────────────────────────

function speck(x, w, h, base, dots, count, rMin, rMax) {
  x.fillStyle = base;
  x.fillRect(0, 0, w, h);
  const r = seeded(count * 31 + dots.length);
  for (let i = 0; i < count; i++) {
    x.fillStyle = dots[i % dots.length];
    x.globalAlpha = 0.3 + r() * 0.5;
    x.beginPath();
    x.arc(r() * w, r() * h, rMin + r() * (rMax - rMin), 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

const shade = (hex, k) => css(new THREE.Color(hex).multiplyScalar(k).getHex());
const tint = (hex, k) => css(new THREE.Color(hex).lerp(new THREE.Color(0xffffff), k).getHex());

/** Tileable ground / floor skins. */
function surfaceTexture(kind, color, alt) {
  const c = color ?? 0x7fcf6a;
  const a = alt ?? c;
  return tex(`surf-${kind}-${c}-${a}`, (x, w, h) => {
    switch (kind) {
      case 'tiles':
      case 'checker': {
        const n = kind === 'tiles' ? 4 : 2;
        for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) {
          x.fillStyle = (r + k) % 2 ? css(a) : css(c);
          x.fillRect((k * w) / n, (r * h) / n, w / n, h / n);
        }
        if (kind === 'tiles') {
          x.strokeStyle = 'rgba(0,0,0,0.12)';
          x.lineWidth = 3;
          for (let i = 0; i <= n; i++) {
            x.beginPath(); x.moveTo((i * w) / n, 0); x.lineTo((i * w) / n, h); x.stroke();
            x.beginPath(); x.moveTo(0, (i * h) / n); x.lineTo(w, (i * h) / n); x.stroke();
          }
        }
        break;
      }
      case 'wood': {
        for (let i = 0; i < 8; i++) {
          x.fillStyle = i % 2 ? css(c) : shade(c, 0.9);
          x.fillRect(0, (i * h) / 8, w, h / 8);
          x.fillStyle = 'rgba(0,0,0,0.12)';
          x.fillRect(0, (i * h) / 8, w, 2);
          x.fillRect(((i * 37) % 8) * (w / 8), (i * h) / 8, 2, h / 8);
        }
        break;
      }
      case 'carpet':
        speck(x, w, h, css(c), [shade(c, 0.92), tint(c, 0.12)], 1600, 0.6, 1.4);
        break;
      case 'mat': {
        x.fillStyle = css(c);
        x.fillRect(0, 0, w, h);
        x.strokeStyle = shade(c, 0.8);
        x.lineWidth = 4;
        x.strokeRect(2, 2, w - 4, h - 4);
        x.fillStyle = css(a);
        x.beginPath(); x.arc(w / 2, h / 2, w * 0.18, 0, Math.PI * 2); x.fill();
        break;
      }
      case 'grid': {
        x.fillStyle = css(c);
        x.fillRect(0, 0, w, h);
        x.strokeStyle = css(a);
        x.lineWidth = 2;
        for (let i = 0; i <= 8; i++) {
          x.beginPath(); x.moveTo((i * w) / 8, 0); x.lineTo((i * w) / 8, h); x.stroke();
          x.beginPath(); x.moveTo(0, (i * h) / 8); x.lineTo(w, (i * h) / 8); x.stroke();
        }
        break;
      }
      case 'water': {
        const g = x.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, css(c));
        g.addColorStop(1, css(a));
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        x.strokeStyle = 'rgba(255,255,255,0.35)';
        x.lineWidth = 2;
        for (let i = 0; i < 14; i++) {
          const y = (i / 14) * h;
          x.beginPath();
          for (let k = 0; k <= w; k += 8) x.lineTo(k, y + Math.sin(k * 0.1 + i) * 3);
          x.stroke();
        }
        break;
      }
      case 'ripples': {
        x.fillStyle = css(c);
        x.fillRect(0, 0, w, h);
        x.strokeStyle = shade(c, 0.88);
        x.lineWidth = 3;
        for (let i = 0; i < 10; i++) {
          const y = (i / 10) * h;
          x.beginPath();
          for (let k = 0; k <= w; k += 6) x.lineTo(k, y + Math.sin(k * 0.08 + i * 2) * 4);
          x.stroke();
        }
        break;
      }
      case 'cobble': {
        x.fillStyle = shade(c, 0.7);
        x.fillRect(0, 0, w, h);
        for (let r = 0; r < 6; r++) for (let k = 0; k < 6; k++) {
          x.fillStyle = (r * 7 + k * 3) % 4 ? css(c) : css(a);
          x.beginPath();
          x.roundRect(k * (w / 6) + (r % 2) * 10 + 2, r * (h / 6) + 2, w / 6 - 4, h / 6 - 4, 6);
          x.fill();
        }
        break;
      }
      case 'grass':
        speck(x, w, h, css(c), [shade(c, 0.85), tint(c, 0.18), shade(c, 0.75)], 1400, 1, 3);
        break;
      default:
        speck(x, w, h, css(c), [shade(c, 0.86), tint(c, 0.2), css(a)], 1000, 1, 3.2);
    }
  }, 256, 256);
}

/** Path skin: u across the road, v along it. */
function pathTexture(kind, color, edge) {
  const c = color ?? 0xd9b98a;
  const e = edge ?? 0xffffff;
  return tex(`path-${kind}-${c}-${e}`, (x, w, h) => {
    switch (kind) {
      case 'wood':
      case 'boardwalk':
        for (let i = 0; i < 8; i++) {
          x.fillStyle = i % 2 ? css(c) : shade(c, 0.9);
          x.fillRect(0, (i * h) / 8, w, h / 8 - 3);
          x.fillStyle = 'rgba(0,0,0,0.25)';
          x.fillRect(0, (i * h) / 8 + h / 8 - 3, w, 3);
        }
        break;
      case 'rainbow': {
        const cols = ['#ff5d5d', '#ff9a3c', '#ffe14d', '#4fd66f', '#3fb7ff', '#8b6bff'];
        cols.forEach((col, i) => { x.fillStyle = col; x.fillRect((i * w) / cols.length, 0, w / cols.length + 1, h); });
        break;
      }
      case 'stripes':
        x.fillStyle = css(c);
        x.fillRect(0, 0, w, h);
        x.fillStyle = css(e);
        x.fillRect(w / 2 - 4, 0, 8, h / 2);
        break;
      case 'tiles':
      case 'checker': {
        const n = 4;
        for (let r = 0; r < n * 2; r++) for (let k = 0; k < n; k++) {
          x.fillStyle = (r + k) % 2 ? css(e) : css(c);
          x.fillRect((k * w) / n, (r * h) / (n * 2), w / n, h / (n * 2));
        }
        break;
      }
      case 'glow': {
        x.fillStyle = css(c);
        x.fillRect(0, 0, w, h);
        x.fillStyle = css(e);
        for (let i = 0; i < 4; i++) x.fillRect(w * 0.2, (i * h) / 4 + 6, w * 0.6, h / 8);
        break;
      }
      case 'cobble': {
        x.fillStyle = shade(c, 0.65);
        x.fillRect(0, 0, w, h);
        for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) {
          x.fillStyle = (r + k) % 3 ? css(c) : tint(c, 0.15);
          x.beginPath();
          x.roundRect(k * (w / 4) + (r % 2) * 14 - 6, r * (h / 8) + 2, w / 4 - 4, h / 8 - 4, 6);
          x.fill();
        }
        break;
      }
      default:
        speck(x, w, h, css(c), [shade(c, 0.85), tint(c, 0.2)], 900, 1, 3);
    }
    if (kind !== 'rainbow') {
      x.fillStyle = css(e);
      x.fillRect(0, 0, w * 0.05, h);
      x.fillRect(w * 0.95, 0, w * 0.05, h);
    }
  }, 128, 256);
}

// ─── World pieces ───────────────────────────────────────────────────

function hideBase(scene, aerial) {
  hideBaseWorld(scene);
  (aerial ? AERIAL_HIDE : GROUND_HIDE).forEach((name) => {
    scene.traverse((o) => { if (o.name === name) o.visible = false; });
  });
  if (Array.isArray(scene.userData.obstacles)) {
    scene.userData.obstacles = scene.userData.obstacles.filter((o) => !o.primaryDecor);
  }
}

function buildGround(ctx, g) {
  const map = surfaceTexture(g.kind ?? 'grass', g.color, g.alt);
  const size = (ctx.radius + 420) * 2;
  map.repeat.set(size / (g.tile ?? 6), size / (g.tile ?? 6));
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 72), M(0xffffff, { map, roughness: g.rough ?? 0.92, metalness: g.metal ?? 0 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(ctx.center.x, ctx.groundY - 0.015, ctx.center.z);
  mesh.receiveShadow = true;
  mesh.name = 'mission-theme-ground';
  ctx.root.add(mesh);
  if (g.kind === 'water' || g.animate) ctx.tick((now) => { map.offset.set(now * 0.01, now * 0.015); });
}

function wallTexture(r, title) {
  const wall = r.wall ?? 0xfff3d6;
  return tex(`wall-${wall}-${r.trim}-${r.windows}-${r.posters}-${title}`, (x, w, h) => {
    x.fillStyle = css(wall);
    x.fillRect(0, 0, w, h);
    x.fillStyle = css(r.trim ?? 0x8fc7ff);
    x.fillRect(0, h * 0.86, w, h * 0.14);
    x.fillRect(0, h * 0.5, w, 6);
    if (r.windows !== false) {
      for (let i = 0; i < 3; i++) {
        const wx = 40 + i * 330;
        x.fillStyle = css(r.frame ?? 0xffffff);
        x.fillRect(wx - 8, 60, 196, 200);
        const sky = x.createLinearGradient(0, 70, 0, 250);
        sky.addColorStop(0, css(r.outside ?? 0x7cc8ff));
        sky.addColorStop(1, tint(r.outside ?? 0x7cc8ff, 0.5));
        x.fillStyle = sky;
        x.fillRect(wx, 68, 180, 184);
        x.fillStyle = css(r.frame ?? 0xffffff);
        x.fillRect(wx + 86, 68, 8, 184);
        x.fillRect(wx, 156, 180, 8);
      }
    }
    if (r.wallPad) {
      const padTop = h * 0.64;
      const padBottom = h * 0.86;
      x.fillStyle = css(r.wallPad);
      x.fillRect(0, padTop, w, padBottom - padTop);
      // Upholstered wall panels give the gym a purposeful, padded sports-hall edge.
      x.fillStyle = 'rgba(255,255,255,0.16)';
      x.fillRect(0, padTop, w, 5);
      x.strokeStyle = 'rgba(255,255,255,0.16)';
      x.lineWidth = 3;
      for (let px = 0; px <= w; px += 128) {
        x.beginPath(); x.moveTo(px, padTop + 8); x.lineTo(px, padBottom - 8); x.stroke();
      }
    }
    if (r.posters !== false) {
      const cols = r.posterColors ?? ['#ff5d8f', '#ffd23f', '#3fa7ff', '#3fcf7a'];
      for (let i = 0; i < 3; i++) {
        const px = 215 + i * 330;
        x.fillStyle = cols[i % cols.length];
        x.beginPath();
        x.roundRect(px, 300, 80, 100, 8);
        x.fill();
        x.fillStyle = 'rgba(255,255,255,0.8)';
        x.beginPath();
        x.arc(px + 40, 340, 18, 0, Math.PI * 2);
        x.fill();
      }
    }
    if (title) {
      x.fillStyle = css(r.bannerBg ?? 0x7c3aed);
      x.beginPath();
      x.roundRect(w / 2 - 260, 14, 520, 38, 12);
      x.fill();
      x.fillStyle = '#ffffff';
      x.font = 'bold 28px system-ui, Arial';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(title.toUpperCase(), w / 2, 34);
    }
  }, 1024, 512);
}

function buildRoom(ctx, r, title) {
  const half = ctx.radius + (r.pad ?? 18);
  const H = r.h ?? 18;
  const cx = ctx.center.x;
  const cz = ctx.center.z;
  const y0 = ctx.groundY;
  const floorMap = surfaceTexture(r.floor ?? 'wood', r.floorColor ?? 0xd9a86c, r.floorAlt).clone();
  floorMap.needsUpdate = true;
  floorMap.repeat.set((half * 2) / (r.tile ?? 5), (half * 2) / (r.tile ?? 5));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(half * 2, half * 2), new THREE.MeshStandardMaterial({ map: floorMap, roughness: r.floorRough ?? 0.55, metalness: 0.02 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, y0 - 0.015, cz);
  floor.receiveShadow = true;
  ctx.root.add(floor);
  const wallMats = [0, 1, 2, 3].map((i) => {
    const t = wallTexture(r, i === 0 ? title : null).clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(1, Math.round((half * 2) / 30)), 1);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 });
  });
  const walls = [
    [cx, cz - half, 0], [cx + half, cz, -Math.PI / 2], [cx, cz + half, Math.PI], [cx - half, cz, Math.PI / 2],
  ];
  const f0 = ctx.frame(0);
  const aheadIdx = Math.abs(f0.tan.z) > Math.abs(f0.tan.x) ? (f0.tan.z < 0 ? 0 : 2) : (f0.tan.x > 0 ? 1 : 3);
  walls.forEach(([x, z, ry], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(half * 2, H), wallMats[(i - aheadIdx + 4) % 4]);
    m.position.set(x, y0 + H / 2, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    ctx.root.add(m);
  });
  const ceilMap = tex(`ceil-${r.ceiling ?? 0xffffff}`, (x, w, h) => {
    x.fillStyle = css(r.ceiling ?? 0xffffff);
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#fffbe8';
    x.fillRect(w * 0.3, h * 0.3, w * 0.4, h * 0.4);
    x.strokeStyle = 'rgba(0,0,0,0.08)';
    x.strokeRect(0, 0, w, h);
  }, 64, 64).clone();
  ceilMap.needsUpdate = true;
  ceilMap.repeat.set((half * 2) / 8, (half * 2) / 8);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(half * 2, half * 2), new THREE.MeshStandardMaterial({ map: ceilMap, emissive: 0xffffff, emissiveMap: ceilMap, emissiveIntensity: 0.35, side: THREE.DoubleSide }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(cx, y0 + H, cz);
  ctx.root.add(ceil);
  if (r.sportsHall) {
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x71829a, roughness: 0.7, metalness: 0.18 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xc8efff, emissiveIntensity: 1.1, roughness: 0.25 });
    const beamLen = half * 2 - 2;
    for (let z = cz - half + 10; z < cz + half; z += 20) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(beamLen, 0.34, 0.42), beamMat);
      beam.position.set(cx, y0 + H - 0.7, z);
      ctx.root.add(beam);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(beamLen * 0.72, 0.07, 0.2), lampMat);
      lamp.position.set(cx, y0 + H - 0.92, z);
      ctx.root.add(lamp);
    }
    for (let x = cx - half + 10; x < cx + half; x += 20) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.3, beamLen), beamMat);
      beam.position.set(x, y0 + H - 0.55, cz);
      ctx.root.add(beam);
    }
  }
  ctx.roomHalf = half;
}

function restylePath(scene, ctx, rc) {
  const p = rc.path ?? {};
  const road = scene.getObjectByName('MissionPBRoad');
  if (road) {
    if (p.hide) road.visible = false;
    const map = pathTexture(p.kind ?? 'dirt', p.color, p.edge).clone();
    map.needsUpdate = true;
    map.repeat.set(1, Math.max(3, Math.round(ctx.len / (p.tile ?? 4))));
    road.material = new THREE.MeshStandardMaterial({
      map,
      roughness: p.rough ?? 0.8,
      metalness: p.metal ?? 0.02,
      emissive: p.glow ?? 0x000000,
      emissiveMap: p.glow ? map : null,
      emissiveIntensity: p.glow ? 0.35 : 0,
    });
  }
  const kerb = p.kerb ?? rc.accent ?? 0xffffff;
  scene.traverse((o) => {
    if (o.name === 'MissionKerbs' && o.material) {
      o.material.color.setHex(kerb);
      o.material.emissive?.setHex(kerb);
      o.material.emissiveIntensity = 0.25;
      o.visible = !p.noKerbs;
    }
    if (o.name === 'MissionCpArch' && o.material && (rc.cpColor ?? rc.accent) != null) {
      o.material.color.setHex(rc.cpColor ?? rc.accent);
      o.material.emissive?.setHex(rc.cpColor ?? rc.accent);
    }
    // Worlds with their own hero start (e.g. the Giant Garden) drop the generic gantry
    if (o.name === 'MissionStartGantry' && rc.hideGantry) o.visible = false;
  });
}

function addBalanceBeamCourse(ctx) {
  const curve = ctx.curve;
  const segments = Math.max(72, Math.ceil(ctx.len * 5));
  const halfWidth = 1.32;
  const topOffset = 0.24;
  const ribbon = (width, sideOffset = 0, yOffset = topOffset) => {
    const positions = new Float32Array((segments + 1) * 2 * 3);
    const indices = [];
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      forward.copy(curve.getTangentAt(t)).setY(0).normalize();
      right.set(-forward.z, 0, forward.x);
      const center = point.addScaledVector(right, sideOffset);
      const y = center.y + yOffset;
      const j = i * 6;
      positions[j] = center.x - right.x * width / 2;
      positions[j + 1] = y;
      positions[j + 2] = center.z - right.z * width / 2;
      positions[j + 3] = center.x + right.x * width / 2;
      positions[j + 4] = y;
      positions[j + 5] = center.z + right.z * width / 2;
      if (i < segments) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };

  const base = new THREE.Mesh(ribbon(halfWidth * 2 + 0.16, 0, 0.1), new THREE.MeshStandardMaterial({
    color: 0x17365d, roughness: 0.72, metalness: 0.12,
  }));
  base.name = 'BalanceGymBeamBase';
  base.receiveShadow = true;
  ctx.root.add(base);

  const deck = new THREE.Mesh(ribbon(halfWidth * 2), new THREE.MeshStandardMaterial({
    color: 0x176fc1, roughness: 0.52, metalness: 0.03,
  }));
  deck.name = 'BalanceGymBeamDeck';
  deck.receiveShadow = true;
  deck.castShadow = true;
  ctx.root.add(deck);

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x27e0cd, emissive: 0x08766e, emissiveIntensity: 0.3, roughness: 0.38,
  });
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(ribbon(0.09, side * (halfWidth - 0.09), topOffset + 0.015), edgeMaterial);
    edge.name = 'BalanceGymBeamEdge';
    ctx.root.add(edge);
  }

  const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x17365d, roughness: 0.7 });
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0xeaf8ff, roughness: 0.55 });
  for (let d = 6; d < ctx.len - 4; d += 6) {
    const t = d / ctx.len;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).setY(0).normalize();
    const yaw = Math.atan2(tangent.x, tangent.z);
    const support = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.38, 0.44), supportMaterial);
    support.position.set(p.x, p.y + 0.045, p.z);
    support.rotation.y = yaw;
    support.castShadow = true;
    ctx.root.add(support);

    const marker = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.025, 0.055), panelMaterial);
    marker.position.set(p.x, p.y + topOffset + 0.018, p.z);
    marker.rotation.y = yaw;
    ctx.root.add(marker);
  }
}

// ─── Placement ──────────────────────────────────────────────────────

const range = (v, def) => (Array.isArray(v) ? v : v != null ? [v, v] : def);

function faceYaw(face, x, z, ctx, fallback) {
  if (face === 'random') return ctx.rand() * Math.PI * 2;
  if (face === 'center') return Math.atan2(ctx.center.x - x, ctx.center.z - z);
  if (face === 'out') return Math.atan2(x - ctx.center.x, z - ctx.center.z);
  return fallback;
}

function spotsFor(ctx, L) {
  const out = [];
  const [s0, s1] = range(L.s, [0.9, 1.2]);
  const scale = () => s0 + ctx.rand() * (s1 - s0);
  const at = L.at ?? 'area';
  const flyBase = (ctx.routeY0 + ctx.routeY1) / 2;

  if (at === 'near') {
    const step = L.n ?? 4;
    const [o0, o1] = range(L.r, [0.6, 3]);
    const sides = L.sides ?? [-1, 1];
    const [y0, y1] = range(L.y, [0, 0]);
    const end = ctx.len - (L.to ?? 1);
    for (let d = L.from ?? 1.5; d < end; d += step) {
      for (const s of sides) {
        const dd = d + (ctx.rand() - 0.5) * step * (L.onRoute ? 0 : 0.4);
        const off = L.onRoute ? 0 : s * (ctx.hw + o0 + ctx.rand() * (o1 - o0));
        const f = ctx.frame(dd, off);
        const sc = scale();
        if (!L.onRoute && !ctx.clear(f.pos, (L.clear ?? 0.6) * sc, f.t)) continue;
        const toRoad = L.face === 'along'
          ? f.angle
          : Math.atan2(-s * f.right.x, -s * f.right.z);
        const dy = y0 + ctx.rand() * (y1 - y0);
        const y = ctx.aerial ? f.pos.y - 0.2 + dy : ctx.groundY + dy;
        out.push({ x: f.pos.x, y, z: f.pos.z, yaw: faceYaw(L.face ?? 'road', f.pos.x, f.pos.z, ctx, toRoad), s: sc });
      }
    }
    return out;
  }

  if (at === 'hero') {
    const where = L.where ?? 'end';
    const sc = scale();
    let f;
    let yaw;
    let pos;
    for (let tries = 0; tries < 8; tries++) {
      if (where === 'mid' || where === 'side') {
        const side = (L.side ?? 16) + tries * 4;
        f = ctx.frame(ctx.len * (L.t ?? 0.5), side);
        pos = f.pos;
        yaw = Math.atan2(-Math.sign(side) * f.right.x, -Math.sign(side) * f.right.z);
      } else if (where === 'center') {
        pos = ctx.center.clone().add(new THREE.Vector3((tries % 3) * 6, 0, Math.floor(tries / 3) * 6));
        yaw = Math.atan2(ctx.frame(0).pos.x - pos.x, ctx.frame(0).pos.z - pos.z);
      } else {
        const e = ctx.curve.getPointAt(1);
        const tan = ctx.curve.getTangentAt(1).setY(0).normalize();
        const right = new THREE.Vector3(-tan.z, 0, tan.x);
        const dist = (L.d ?? 12) + tries * 4;
        pos = new THREE.Vector3(e.x, e.y, e.z).addScaledVector(tan, dist).addScaledVector(right, L.side ?? 0);
        yaw = Math.atan2(-tan.x, -tan.z);
      }
      if (ctx.offRoute(pos, (L.clear ?? 3) * sc)) break;
    }
    const y = ctx.aerial && !L.ground ? flyBase + (L.y ?? 0) : ctx.groundY + (L.y ?? 0);
    out.push({ x: pos.x, y, z: pos.z, yaw: yaw + (L.rotY ?? 0), s: sc });
    return out;
  }

  const n = L.n ?? 10;
  if (at === 'ring') {
    const [r0, r1] = range(L.r, [70, 110]);
    const [y0, y1] = range(L.y, [0, 0]);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (ctx.rand() - 0.5) * (Math.PI / n) + (L.phase ?? 0);
      const r = ctx.radius + r0 + ctx.rand() * (r1 - r0);
      const x = ctx.center.x + Math.cos(a) * r;
      const z = ctx.center.z + Math.sin(a) * r;
      const base = L.sky || (ctx.aerial && L.fly) ? flyBase : ctx.groundY;
      out.push({ x, y: base + y0 + ctx.rand() * (y1 - y0), z, yaw: faceYaw(L.face ?? 'center', x, z, ctx, 0), s: scale() });
    }
    return out;
  }

  // area / sky / float: random spots in an annulus around the route, kept off the path.
  const [r0, r1] = range(L.r, [-ctx.radius, 30]);
  const [y0, y1] = range(L.y, at === 'sky' ? [22, 40] : [0, 0]);
  const R0 = Math.max(0, ctx.radius + r0);
  const R1 = Math.max(R0 + 1, ctx.radius + r1);
  const inRoom = ctx.roomHalf ? ctx.roomHalf - (L.wallPad ?? 2) : Infinity;
  for (let tries = 0; out.length < n && tries < n * 12; tries++) {
    const a = ctx.rand() * Math.PI * 2;
    const r = Math.sqrt(R0 * R0 + ctx.rand() * (R1 * R1 - R0 * R0));
    const x = ctx.center.x + Math.cos(a) * r;
    const z = ctx.center.z + Math.sin(a) * r;
    if (Math.abs(x - ctx.center.x) > inRoom || Math.abs(z - ctx.center.z) > inRoom) continue;
    const sc = scale();
    const fenceClear = at === 'area' && ctx.fenceBand ? ctx.fenceBand + 3.2 * sc : 0;
    if (!ctx.offRoute({ x, z }, Math.max((L.clear ?? 1.4) * sc, fenceClear))) continue;
    const base = at === 'sky' ? (ctx.aerial ? flyBase : ctx.groundY) : at === 'float' ? flyBase : ctx.groundY;
    out.push({ x, y: base + y0 + ctx.rand() * (y1 - y0), z, yaw: faceYaw(L.face ?? (at === 'area' ? 'random' : 'center'), x, z, ctx, 0), s: sc });
  }
  return out;
}

/**
 * Flying arenas are seen from the air with the whole world in view at once, so
 * the same recipe reads far busier than on the ground: thin out what floats at
 * flight height, push route-side props further out and lighten the ground.
 */
function calmAerialLayer(L) {
  const at = L.at ?? 'area';
  if (at === 'hero' || L.onRoute) return L;
  const fewer = (k) => Math.max(1, Math.round((L.n ?? 10) * k));
  if (at === 'near') {
    const [o0, o1] = range(L.r, [0.6, 3]);
    return { ...L, n: (L.n ?? 4) * 2.5, r: [o0 + 4, o1 + 7] };
  }
  if (at === 'float') return { ...L, n: fewer(0.35), clear: Math.max(L.clear ?? 1.4, 9) };
  if (at === 'sky') return { ...L, n: fewer(0.5) };
  if (at === 'ring') return { ...L, n: fewer(0.7) };
  return { ...L, n: fewer(0.45) };
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);
const _box = new THREE.Box3();

function placeLayer(ctx, L) {
  const build = PROPS[L.p];
  if (!build) {
    console.warn('[MissionTheme] unknown prop', L.p);
    return 0;
  }
  const variants = L.v ?? [L.o ?? {}];
  const first = build(ctx.rand, variants[0]);
  _box.setFromObject(first);
  const foot = _box.isEmpty() ? 1 : Math.max(-_box.min.x, _box.max.x, -_box.min.z, _box.max.z);
  const top = _box.isEmpty() ? 1 : _box.max.y;
  const spots = spotsFor(ctx, L).filter((sp) => !ctx.inCameraLane(sp, foot, top));
  if (!spots.length) return 0;
  if (first.userData.tick || L.single) {
    spots.forEach((sp, i) => {
      const obj = i === 0 ? first : build(ctx.rand, variants[i % variants.length]);
      obj.position.set(sp.x, sp.y, sp.z);
      obj.rotation.y = sp.yaw;
      obj.scale.setScalar(sp.s);
      obj.userData.baseX = sp.x;
      obj.userData.baseY = sp.y;
      obj.userData.baseZ = sp.z;
      obj.userData.baseRotY = sp.yaw;
      ctx.root.add(obj);
      const tick = obj.userData.tick;
      if (tick) ctx.tick((now, cam) => tick(now, obj, cam));
    });
    return spots.length;
  }
  const templates = [first, ...variants.slice(1).map((v) => build(ctx.rand, v))];
  const buckets = templates.map(() => []);
  spots.forEach((sp, i) => {
    _q.setFromAxisAngle(_up, sp.yaw);
    buckets[i % templates.length].push(_m.clone().compose(new THREE.Vector3(sp.x, sp.y, sp.z), _q.clone(), new THREE.Vector3(sp.s, sp.s, sp.s)));
  });
  templates.forEach((t, i) => { if (buckets[i].length) ctx.scatter(t, buckets[i]); });
  return spots.length;
}

// ─── Particles ──────────────────────────────────────────────────────

let _dot = null;
function dotTexture() {
  if (_dot) return _dot;
  _dot = tex('fx-dot', (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, w);
  }, 64);
  return _dot;
}

const FX = {
  snow: { n: 900, colors: [0xffffff], size: 0.35, vy: -2.2, sway: 0.8 },
  rain: { n: 1100, colors: [0xaecbff], size: 0.25, vy: -22, sway: 0 },
  bubbles: { n: 380, colors: [0xdff8ff, 0xbfefff], size: 0.45, vy: 1.6, sway: 0.6, opacity: 0.6 },
  fireflies: { n: 160, colors: [0xfff27a, 0xc8ff7a], size: 0.55, vy: 0.15, sway: 1.2, glow: true },
  confetti: { n: 600, colors: [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff, 0xff8ad8], size: 0.4, vy: -1.6, sway: 1.4 },
  petals: { n: 380, colors: [0xffc2dc, 0xffe0ee, 0xffffff], size: 0.4, vy: -0.9, sway: 1.6 },
  leaves: { n: 320, colors: [0xff9a2a, 0xffc233, 0xe8542f], size: 0.45, vy: -1.1, sway: 1.8 },
  sparkles: { n: 260, colors: [0xffffff, 0xfff3a8, 0xc8f0ff], size: 0.4, vy: 0.3, sway: 0.5, glow: true },
  dust: { n: 300, colors: [0xfff0d0], size: 0.25, vy: 0.08, sway: 0.4, opacity: 0.5 },
  stars: { n: 240, colors: [0xffffff, 0xc8e0ff], size: 0.35, vy: 0, sway: 0.1, glow: true },
  embers: { n: 260, colors: [0xffa040, 0xff6a2a, 0xffd06a], size: 0.35, vy: 1.4, sway: 0.7, glow: true },
  plankton: { n: 420, colors: [0x9fffe0, 0x7fd8ff, 0xffffff], size: 0.28, vy: 0.2, sway: 0.5, glow: true, opacity: 0.8 },
};

function particles(ctx, spec) {
  const base = FX[spec.k];
  if (!base) return;
  const cfg = { ...base, ...spec };
  const n = cfg.n;
  const area = cfg.area ?? 70;
  const height = cfg.height ?? 26;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const r = seeded(n * 13 + spec.k.length);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (r() - 0.5) * area;
    pos[i * 3 + 1] = r() * height;
    pos[i * 3 + 2] = (r() - 0.5) * area;
    c.setHex(cfg.colors[i % cfg.colors.length]);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: cfg.size, map: dotTexture(), vertexColors: true, transparent: true, opacity: cfg.opacity ?? 0.9,
    depthWrite: false, blending: cfg.glow ? THREE.AdditiveBlending : THREE.NormalBlending,
  }));
  pts.frustumCulled = false;
  pts.renderOrder = 5;
  ctx.root.add(pts);
  let last = null;
  const baseY = ctx.aerial ? ctx.routeY0 - 8 : ctx.groundY;
  ctx.tick((now, camera) => {
    const dt = last == null ? 0 : Math.min(0.05, now - last);
    last = now;
    if (camera) pts.position.set(camera.position.x, baseY, camera.position.z);
    const a = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      a[i * 3 + 1] += cfg.vy * dt;
      if (cfg.sway) {
        a[i * 3] += Math.sin(now * 0.9 + i) * cfg.sway * dt;
        a[i * 3 + 2] += Math.cos(now * 0.7 + i * 1.3) * cfg.sway * dt;
      }
      if (a[i * 3 + 1] < 0) a[i * 3 + 1] += height;
      if (a[i * 3 + 1] > height) a[i * 3 + 1] -= height;
    }
    geo.attributes.position.needsUpdate = true;
  });
}

/** Soft light shafts from above (underwater, forests, halls). */
function lightRays(ctx, { color = 0xcff6ff, n = 7, opacity = 0.08 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const rays = [];
  for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
    const a = ctx.rand() * Math.PI * 2;
    const r = ctx.rand() * (ctx.radius + 30);
    const x = ctx.center.x + Math.cos(a) * r;
    const z = ctx.center.z + Math.sin(a) * r;
    // A camera inside an additive cone washes the whole view out.
    if (!ctx.offRoute({ x, z }, 12)) continue;
    i++;
    const m = new THREE.Mesh(new THREE.ConeGeometry(3 + ctx.rand() * 3, 46, 16, 1, true), mat);
    m.position.set(x, ctx.groundY + 22, z);
    m.rotation.z = 0.25;
    m.renderOrder = 6;
    ctx.root.add(m);
    rays.push({ m, ph: ctx.rand() * 6 });
  }
  ctx.tick((now) => rays.forEach(({ m, ph }) => { m.material.opacity = opacity * (0.7 + Math.sin(now * 0.6 + ph) * 0.3); m.rotation.z = 0.25 + Math.sin(now * 0.2 + ph) * 0.06; }));
}

// ─── Tasks ──────────────────────────────────────────────────────────

const TRACK_PARTS = new Set(['MissionKerbs', 'MissionCpArch', 'MissionCpPost', 'MissionStartGantry']);
const DONE_GREEN = 0x3fdc6a;

function tickTexture() {
  return tex('task-tick', (x, w) => {
    x.fillStyle = '#22c55e';
    x.beginPath();
    x.arc(w / 2, w / 2, w * 0.46, 0, Math.PI * 2);
    x.fill();
    x.lineWidth = w * 0.06;
    x.strokeStyle = '#ffffff';
    x.stroke();
    x.lineWidth = w * 0.12;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.beginPath();
    x.moveTo(w * 0.28, w * 0.52);
    x.lineTo(w * 0.44, w * 0.68);
    x.lineTo(w * 0.73, w * 0.34);
    x.stroke();
  }, 128);
}

function padMesh(r0, r1, color, opacity) {
  const pad = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(r0, r1, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }),
  );
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(r0, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity * 0.22, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = disc.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  disc.position.y = 0.04;
  pad.add(ring, disc);
  pad.userData.mats = [ring.material, disc.material];
  return pad;
}

/** Replace the race-track look with task objects on each checkpoint and a beacon over the next one. */
function installTasks(scene, ctx, curve, task, accent) {
  scene.traverse((o) => { if (TRACK_PARTS.has(o.name)) o.visible = false; });
  const road = scene.getObjectByName('MissionPBRoad');
  if (road && !task.trail) road.visible = false;

  const build = PROPS[task.p];
  const cps = scene.userData.chassisCheckpoints ?? [];
  if (!build || !cps.length) return;
  const s = (task.s ?? 1) * 1.3;
  const y = ctx.groundY;
  const items = cps.map((cp, i) => {
    const t = (i + 1) / (cps.length + 1);
    const tan = curve.getTangent(t).setY(0).normalize();
    const g = new THREE.Group();
    g.position.set(cp.x, y, cp.z);
    g.rotation.y = Math.atan2(-tan.x, -tan.z);
    const pad = padMesh(1.3, 1.65, accent, 0.9);
    g.add(pad);
    const item = build(ctx.rand, task.o ?? {});
    item.scale.setScalar(s);
    g.add(item);
    const grow = task.done === 'grow' ? (item.userData.grow ?? item) : null;
    if (grow) grow.scale.multiplyScalar(grow === item ? 0.05 : 0.3);
    if (task.done === 'deliver') item.visible = false;
    if (task.station) {
      const st = PROPS[task.station.p]?.(ctx.rand, task.station.o ?? {});
      if (st) {
        const ss = task.station.s ?? 1;
        _box.setFromObject(st);
        const foot = Math.max(-_box.min.x, _box.max.x, -_box.min.z, _box.max.z);
        const off = 2.4 + foot * ss;
        g.updateMatrixWorld();
        const side = [1, -1].find((k) => {
          const w = new THREE.Vector3(k * off, 0, -0.6).applyMatrix4(g.matrixWorld);
          return !ctx.inCameraLane({ x: w.x, y: w.y, z: w.z, s: ss }, foot, _box.max.y);
        });
        if (side) {
          st.scale.setScalar(ss);
          st.position.set(side * off, 0, -0.6);
          st.rotation.y = -side * Math.PI / 2;
          g.add(st);
        }
      }
    }
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: tickTexture(), transparent: true, depthWrite: false }));
    badge.position.y = 2.6;
    badge.visible = false;
    g.add(badge);
    ctx.root.add(g);
    if (item.userData.tick) ctx.tick((now) => item.userData.tick(now, item));
    return { cp, item, grow, pad, badge, doneAt: null };
  });

  const fz = scene.userData.finishZone;
  const goal = fz ? padMesh(2.2, 2.7, 0xffd23f, 0.95) : null;
  if (goal) {
    goal.position.set(fz.x, y, fz.z);
    ctx.root.add(goal);
  }

  const beamMat = new THREE.MeshBasicMaterial({
    color: accent, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1, 18, 24, 1, true), beamMat);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 16), new THREE.MeshBasicMaterial({ color: accent }));
  arrow.rotation.x = Math.PI;
  ctx.root.add(beam, arrow);

  const green = new THREE.Color(DONE_GREEN);
  const accentCol = new THREE.Color(accent);
  const setPad = (it, col, op) => {
    it.pad.userData.mats[0].color.copy(col);
    it.pad.userData.mats[1].color.copy(col);
    it.pad.userData.mats[0].opacity = op;
  };
  const reset = (it) => {
    it.doneAt = null;
    it.item.visible = task.done !== 'deliver';
    it.item.position.y = 0;
    it.item.scale.setScalar(s);
    if (it.grow) it.grow.scale.setScalar(it.grow === it.item ? s * 0.05 : 0.3);
    it.item.userData.out = 1;
    it.item.userData.doneK = 0;
    it.badge.visible = false;
    setPad(it, accentCol, 0.9);
  };

  ctx.tick((now) => {
    let next = null;
    for (const it of items) {
      if (!it.cp.passed) {
        if (it.doneAt != null) reset(it);
        if (!next) next = it;
        continue;
      }
      if (it.doneAt == null) {
        it.doneAt = now;
        setPad(it, green, 0.55);
      }
      const k = Math.min(1, (now - it.doneAt) / 0.8);
      const pop = k < 1 ? 1 + Math.sin(k * Math.PI) * 0.35 : 1;
      it.item.userData.doneK = Math.min(1, (now - it.doneAt) / 1.6);
      if (task.done === 'collect') {
        it.item.position.y = k * 2.2;
        it.item.scale.setScalar(s * Math.max(0.001, 1 - k));
        it.item.visible = k < 1;
      } else if (task.done === 'out') {
        it.item.userData.out = 1 - k;
      } else if (task.done === 'grow') {
        it.grow.scale.setScalar((it.grow === it.item ? s : 1) * (0.3 + 0.7 * k) * pop);
      } else if (task.done === 'deliver') {
        it.item.visible = true;
        it.item.position.y = (1 - k) * 3;
        it.item.scale.setScalar(s * pop);
      }
      it.badge.visible = task.done !== 'collect' || k >= 1;
      it.badge.scale.setScalar(0.9 * pop);
      it.badge.position.y = 2.6 + Math.sin(now * 2) * 0.1;
    }
    const target = next ? next.cp : fz;
    beam.visible = arrow.visible = !!target;
    if (target) {
      beam.position.set(target.x, y + 9, target.z);
      arrow.position.set(target.x, y + 3.6 + Math.sin(now * 3) * 0.25, target.z);
      arrow.rotation.y = now * 2;
      beamMat.opacity = 0.16 + Math.sin(now * 3) * 0.05;
    }
    if (next) next.pad.scale.setScalar(1 + Math.sin(now * 4) * 0.06);
    if (goal) goal.scale.setScalar(next ? 1 : 1 + Math.sin(now * 4) * 0.06);
  });
}

// ─── Install ────────────────────────────────────────────────────────

export function installMissionTheme(scene, curve, arena, challenge) {
  const rc = MISSION_THEME_RECIPES[arena?.id];
  if (!rc || !curve) return false;
  try {
    const old = scene.getObjectByName(MISSION_THEME_ROOT);
    if (old) old.parent?.remove(old);
    const aerial = challenge?.physics === 'flight_3dof';
    hideBase(scene, aerial);
    const spawnRoot = aerial && rc.groundAt != null && scene.getObjectByName('FlyingSpawnRoot');
    if (spawnRoot) spawnRoot.visible = false;

    const ctx = createThemeContext(scene, curve, { halfWidth: aerial ? 4.5 : 3.4, seed: hashStr(arena.tierLevel ? `${arena.id}:${arena.mode}` : arena.id) });
    ctx.root.name = MISSION_THEME_ROOT;
    ctx.aerial = aerial;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (let i = 0; i <= 40; i++) {
      const p = curve.getPointAt(i / 40);
      y0 = Math.min(y0, p.y);
      y1 = Math.max(y1, p.y);
    }
    ctx.routeY0 = y0;
    ctx.routeY1 = y1;
    const samples = [];
    for (let i = 0; i <= 240; i++) samples.push(curve.getPointAt(i / 240));
    // The chase camera starts behind the first point; keep that lane clear.
    const start = curve.getPointAt(0);
    const back = curve.getTangentAt(0).setY(0).normalize();
    const lane = [];
    // The robot spawns facing -Z, so the camera can sit on +Z even when the route turns straight away.
    const spawnBack = start.clone().set(0, 0, -1);
    for (let k = 1; k <= 16; k++) {
      lane.push(start.clone().addScaledVector(back, -k));
      lane.push(start.clone().addScaledVector(spawnBack, -k));
    }
    samples.push(...lane);
    // Props far below an aerial route can't reach the camera.
    ctx.inCameraLane = (sp, foot = 1, top = 1) => {
      if (ctx.aerial && sp.y + top * sp.s < y0 - 4) return false;
      const lim = Math.max(1.8 + 1.2 * sp.s, foot * sp.s + 1.2);
      return lane.some((p) => (p.x - sp.x) ** 2 + (p.z - sp.z) ** 2 < lim * lim);
    };
    ctx.offRoute = (pos, r) => {
      const lim = ctx.hw + 1.6 + r;
      const lim2 = lim * lim;
      for (const s of samples) {
        const dx = s.x - pos.x;
        const dz = s.z - pos.z;
        if (dx * dx + dz * dz < lim2) return false;
      }
      return true;
    };
    ctx.groundY = aerial ? (rc.groundAt ?? y0 - (rc.drop ?? 24)) : 0;
    ctx.center.y = ctx.groundY;
    ctx.minRoadY = ctx.groundY;

    const sky = rc.sky ?? {};
    themeSky(ctx, {
      top: sky.top ?? 0x4aa8ff, mid: sky.mid ?? 0x9fd6ff, horizon: sky.horizon ?? 0xe8f6ff,
      fog: sky.fog ?? sky.horizon ?? 0xe8f6ff, near: sky.near ?? (rc.room ? 80 : 60), far: sky.far ?? (rc.room ? 340 : 280),
      stars: sky.stars ?? 0, starColor: sky.starColor ?? 0xffffff,
    });
    if (sky.sun) skyDisc(ctx, { color: 0xfff6d0, halo: 0xffe2a0, size: 26, haloSize: 170, height: 90, dist: 600, ...sky.sun });
    themeLights(scene, { ...LIGHTS[rc.light ?? 'day'], ...(rc.lights ?? {}) });

    if (rc.room) buildRoom(ctx, rc.room, arena.title);
    else if (rc.ground) buildGround(ctx, rc.ground);
    if (!aerial) restylePath(scene, ctx, rc);
    if (!aerial && rc.balanceBeamCourse) addBalanceBeamCourse(ctx);
    // Worlds can frame their own shot, e.g. a low bug's-eye view in the Giant Garden
    if (rc.camera) scene.userData.missionCameraPreset = { ...(scene.userData.missionCameraPreset || {}), ...rc.camera };

    let placed = 0;
    // Fences/hedges line the path; field props (crop rows, cows…) must sit fully outside them
    ctx.fenceBand = aerial ? 0 : (rc.layers ?? []).reduce((m, L) => (
      (L.at ?? 'area') === 'near' && /fence|hedge|rail|barrier/i.test(L.p || '')
        ? Math.max(m, range(L.r, [0.6, 3])[1]) : m), 0);
    for (const L of rc.layers ?? []) placed += placeLayer(ctx, aerial ? calmAerialLayer(L) : L);
    const fx = (rc.fx ?? []).map((f) => (aerial ? { ...f, n: Math.round((f.n ?? FX[f.k]?.n ?? 200) * 0.35) } : f));
    for (const f of fx) {
      if (f.k === 'rays') lightRays(ctx, f);
      else particles(ctx, f);
    }
    // Arena Maker worlds bring their own gems and goals, so they skip the mission checkpoint props.
    const task = !aerial && !challenge?.noTasks && (rc.task ?? MISSION_TASKS[arena.id]);
    if (task) installTasks(scene, ctx, curve, task, rc.accent ?? 0x22d3ee);
    const hideSet = new Set(aerial ? AERIAL_HIDE : GROUND_HIDE);
    const bg = scene.background?.isColor ? scene.background.clone() : null;
    const fog = scene.fog ? { color: scene.fog.color.clone(), near: scene.fog.near, far: scene.fog.far } : null;
    let nextHide = 0;
    ctx.tick((now, cam) => {
      scene.userData.missionThemeCamera = cam;
      // Mission cameras default to far=120, which clips the sky dome and horizon props.
      if (cam && cam.far < 1000) {
        cam.far = 1000;
        cam.updateProjectionMatrix();
      }
      if (now < nextHide) return;
      nextHide = now + 0.5;
      for (const c of scene.children) if (c.visible && hideSet.has(c.name)) c.visible = false;
      if (bg && scene.background?.isColor && !scene.background.equals(bg)) scene.background.copy(bg);
      if (fog && scene.fog) {
        scene.fog.color.copy(fog.color);
        scene.fog.near = fog.near;
        scene.fog.far = fog.far;
      }
    });
    ctx.finish();
    scene.userData.missionThemeId = arena.id;
    scene.userData.missionThemeRoot = ctx.root;
    scene.userData.customSky = true;
    scene.userData.skipSoftEnvironment = true;
    console.log('[MissionTheme] installed', arena.id, { aerial, placed, route: Math.round(ctx.len), radius: Math.round(ctx.radius) });
    return true;
  } catch (err) {
    console.error('[MissionTheme] failed', arena?.id, err);
    return false;
  }
}

export { E, labelTexture, PROPS as MISSION_PROPS, surfaceTexture };
