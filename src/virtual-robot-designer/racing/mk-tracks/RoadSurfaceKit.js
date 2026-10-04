/**
 * RoadSurfaceKit.js — gives each kart world its own road: lane-marked city
 * asphalt, a wooden boardwalk, rutted canyon dirt, packed snow, cracked basalt
 * with glowing lava seams, a leafy forest path, lit metal panels, sky-stone,
 * glowing glass and cobblestones. Also places "»»" chevron boards on the
 * outside of the sharpest corners, like a kart game.
 *
 * Road UVs: u runs across the road (0..1), v runs along it (1 unit ≈ 2 m).
 */
import * as THREE from 'three';

const SIZE = 512;

function canvas() {
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  return [c, c.getContext('2d')];
}

// Deterministic noise so a track looks the same every visit
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function speckle(x, rand, colors, count, rMin, rMax, alpha = 1) {
  x.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    x.fillStyle = colors[Math.floor(rand() * colors.length)];
    const r = rMin + rand() * (rMax - rMin);
    x.beginPath();
    x.arc(rand() * SIZE, rand() * SIZE, r, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

function edgeLines(x, color, w = 14, inset = 22) {
  x.fillStyle = color;
  x.fillRect(inset, 0, w, SIZE);
  x.fillRect(SIZE - inset - w, 0, w, SIZE);
}

/** Each painter returns { map, emissive?, repeatV, roughness, metalness }. */
const PAINTERS = {
  asphalt() {
    const [c, x] = canvas();
    const rand = rng(11);
    x.fillStyle = '#3a3d44';
    x.fillRect(0, 0, SIZE, SIZE);
    speckle(x, rand, ['#2e3137', '#474b53', '#52565e'], 5000, 0.6, 2.2);
    edgeLines(x, '#f4f4f4');
    // Dashed lane dividers (two lanes each way reads as a wide city road)
    x.fillStyle = '#f4f4f4';
    [SIZE * 0.34, SIZE / 2, SIZE * 0.66].forEach((lx) => { for (let y = 0; y < SIZE; y += 128) x.fillRect(lx - 5, y, 10, 64); });
    return { map: c, repeatV: 0.25, roughness: 0.82, metalness: 0.05 };
  },
  boardwalk() {
    const [c, x] = canvas();
    const rand = rng(21);
    const plank = SIZE / 8; // planks run across the road
    for (let i = 0; i < 8; i++) {
      const tone = 150 + Math.floor(rand() * 40);
      x.fillStyle = `rgb(${tone + 40},${tone - 5},${tone - 60})`;
      x.fillRect(0, i * plank, SIZE, plank);
      // Grain
      x.strokeStyle = 'rgba(90,50,20,0.22)';
      x.lineWidth = 2;
      for (let g = 0; g < 5; g++) {
        const gy = i * plank + 6 + rand() * (plank - 12);
        x.beginPath(); x.moveTo(0, gy); x.bezierCurveTo(SIZE * 0.3, gy + 4, SIZE * 0.6, gy - 4, SIZE, gy + 2); x.stroke();
      }
      // Seam + nail heads
      x.fillStyle = '#5a3414';
      x.fillRect(0, i * plank + plank - 5, SIZE, 5);
      x.fillStyle = '#3a2410';
      [40, SIZE / 2, SIZE - 40].forEach((nx) => { x.beginPath(); x.arc(nx, i * plank + plank / 2, 4, 0, 7); x.fill(); });
    }
    // Darker planks along the edges read as the boardwalk rim
    x.fillStyle = 'rgba(70,40,15,0.35)';
    x.fillRect(0, 0, 26, SIZE);
    x.fillRect(SIZE - 26, 0, 26, SIZE);
    return { map: c, repeatV: 1, roughness: 0.86, metalness: 0 };
  },
  dirt() {
    const [c, x] = canvas();
    const rand = rng(31);
    x.fillStyle = '#b8743e';
    x.fillRect(0, 0, SIZE, SIZE);
    speckle(x, rand, ['#a0602e', '#c98a50', '#8e5426', '#d49a60'], 4000, 1, 5);
    // Tyre ruts
    x.fillStyle = 'rgba(80,40,15,0.25)';
    [0.3, 0.42, 0.58, 0.7].forEach((u) => x.fillRect(u * SIZE - 10, 0, 20, SIZE));
    speckle(x, rand, ['#e0b080'], 40, 6, 14, 0.5); // pebbles
    return { map: c, repeatV: 0.5, roughness: 0.95, metalness: 0 };
  },
  snow() {
    const [c, x] = canvas();
    const rand = rng(41);
    x.fillStyle = '#e8f0fb';
    x.fillRect(0, 0, SIZE, SIZE);
    speckle(x, rand, ['#d8e4f6', '#f8fbff', '#cddcf2'], 3500, 1, 6);
    // Packed tyre tracks with a blue tint
    x.fillStyle = 'rgba(95,130,200,0.38)';
    [0.32, 0.44, 0.56, 0.68].forEach((u) => x.fillRect(u * SIZE - 14, 0, 28, SIZE));
    // Blue-grey snowbank edges so the road reads against white verges
    x.fillStyle = 'rgba(110,140,190,0.45)';
    x.fillRect(0, 0, 30, SIZE);
    x.fillRect(SIZE - 30, 0, 30, SIZE);
    // Icy patches
    speckle(x, rand, ['rgba(150,200,255,0.35)'], 24, 18, 46);
    return { map: c, repeatV: 0.5, roughness: 0.55, metalness: 0.05 };
  },
  lava() {
    const [c, x] = canvas();
    const [e, ex] = canvas();
    const rand = rng(51);
    x.fillStyle = '#3a302c';
    x.fillRect(0, 0, SIZE, SIZE);
    ex.fillStyle = '#000';
    ex.fillRect(0, 0, SIZE, SIZE);
    // Irregular basalt slabs separated by glowing cracks
    const cells = [];
    for (let i = 0; i < 26; i++) cells.push([rand() * SIZE, rand() * SIZE]);
    for (let py = 0; py < SIZE; py += 4) {
      for (let px = 0; px < SIZE; px += 4) {
        let d1 = Infinity; let d2 = Infinity; let k = 0;
        cells.forEach(([cx, cy], i) => {
          const d = Math.hypot(((px - cx + SIZE * 1.5) % SIZE) - SIZE / 2, ((py - cy + SIZE * 1.5) % SIZE) - SIZE / 2);
          if (d < d1) { d2 = d1; d1 = d; k = i; } else if (d < d2) d2 = d;
        });
        if (d2 - d1 < 5) {
          x.fillStyle = '#ff6a1a';
          x.fillRect(px, py, 4, 4);
          ex.fillStyle = d2 - d1 < 2.5 ? '#ffd060' : '#ff6a1a';
          ex.fillRect(px, py, 4, 4);
        } else {
          const tone = 50 + ((k * 37) % 26);
          x.fillStyle = `rgb(${tone + 8},${tone - 2},${tone - 6})`;
          x.fillRect(px, py, 4, 4);
        }
      }
    }
    return { map: c, emissive: e, emissiveColor: 0xff8a2a, emissiveIntensity: 1.3, repeatV: 0.5, roughness: 0.9, metalness: 0.05 };
  },
  forest() {
    const [c, x] = canvas();
    const rand = rng(61);
    x.fillStyle = '#9a6a3a';
    x.fillRect(0, 0, SIZE, SIZE);
    speckle(x, rand, ['#8e5e32', '#a47442'], 1800, 1, 4, 0.7);
    // A few fallen leaves, mostly towards the edges
    x.save();
    x.beginPath(); x.rect(0, 0, SIZE * 0.22, SIZE); x.rect(SIZE * 0.78, 0, SIZE * 0.22, SIZE); x.clip();
    speckle(x, rand, ['#e8a030', '#d86a2a', '#7ab04a'], 90, 4, 8, 0.8);
    x.restore();
    x.fillStyle = 'rgba(80,140,50,0.55)';
    x.fillRect(0, 0, 30, SIZE);
    x.fillRect(SIZE - 30, 0, 30, SIZE);
    return { map: c, repeatV: 0.5, roughness: 0.95, metalness: 0 };
  },
  metal() {
    const [c, x] = canvas();
    const [e, ex] = canvas();
    x.fillStyle = '#5a6272';
    x.fillRect(0, 0, SIZE, SIZE);
    ex.fillStyle = '#000';
    ex.fillRect(0, 0, SIZE, SIZE);
    // Panels with bevelled seams
    for (let py = 0; py < SIZE; py += 128) {
      for (let px = 0; px < SIZE; px += 128) {
        x.fillStyle = (px + py) % 256 ? '#626b7c' : '#58606f';
        x.fillRect(px + 3, py + 3, 122, 122);
        x.fillStyle = 'rgba(255,255,255,0.08)';
        x.fillRect(px + 3, py + 3, 122, 6);
      }
    }
    // Glowing edge strips + centre light dashes
    ['#5ee0ff'].forEach((col) => {
      [x, ex].forEach((ctx) => {
        ctx.fillStyle = col;
        ctx.fillRect(18, 0, 10, SIZE);
        ctx.fillRect(SIZE - 28, 0, 10, SIZE);
        for (let y = 0; y < SIZE; y += 128) ctx.fillRect(SIZE / 2 - 4, y + 20, 8, 70);
      });
    });
    return { map: c, emissive: e, emissiveColor: 0x5ee0ff, emissiveIntensity: 1.1, repeatV: 0.5, roughness: 0.45, metalness: 0.55 };
  },
  stone() {
    const [c, x] = canvas();
    const [e, ex] = canvas();
    const rand = rng(81);
    x.fillStyle = '#d8cbb0';
    x.fillRect(0, 0, SIZE, SIZE);
    for (let py = 0; py < SIZE; py += 64) {
      const off = (py / 64) % 2 ? 48 : 0;
      for (let px = -off; px < SIZE; px += 96) {
        const tone = 200 + Math.floor(rand() * 30);
        x.fillStyle = `rgb(${tone},${tone - 12},${tone - 36})`;
        x.fillRect(px + 3, py + 3, 90, 58);
      }
    }
    ex.fillStyle = '#000';
    ex.fillRect(0, 0, SIZE, SIZE);
    [x, ex].forEach((ctx) => { ctx.fillStyle = '#4ab8ff'; ctx.fillRect(12, 0, 12, SIZE); ctx.fillRect(SIZE - 24, 0, 12, SIZE); });
    return { map: c, emissive: e, emissiveColor: 0x4ab8ff, emissiveIntensity: 0.9, repeatV: 1, roughness: 0.8, metalness: 0 };
  },
  glass() {
    const [c, x] = canvas();
    const [e, ex] = canvas();
    const g = x.createLinearGradient(0, 0, SIZE, 0);
    g.addColorStop(0, '#0e7fb0'); g.addColorStop(0.5, '#27c4e8'); g.addColorStop(1, '#0e7fb0');
    x.fillStyle = g;
    x.fillRect(0, 0, SIZE, SIZE);
    // Caustic light ripples
    const rand = rng(91);
    x.strokeStyle = 'rgba(200,250,255,0.35)';
    x.lineWidth = 3;
    for (let i = 0; i < 40; i++) {
      const cx = rand() * SIZE; const cy = rand() * SIZE;
      x.beginPath(); x.ellipse(cx, cy, 20 + rand() * 40, 8 + rand() * 16, rand() * 3, 0, Math.PI * 2); x.stroke();
    }
    ex.fillStyle = '#000';
    ex.fillRect(0, 0, SIZE, SIZE);
    [x, ex].forEach((ctx) => {
      ctx.fillStyle = '#9ff6ff';
      ctx.fillRect(14, 0, 12, SIZE);
      ctx.fillRect(SIZE - 26, 0, 12, SIZE);
      for (let y = 0; y < SIZE; y += 128) ctx.fillRect(SIZE / 2 - 4, y + 20, 8, 70);
    });
    return { map: c, emissive: e, emissiveColor: 0x7ff0ff, emissiveIntensity: 1.0, repeatV: 0.5, roughness: 0.2, metalness: 0.3 };
  },
  cobble() {
    const [c, x] = canvas();
    const rand = rng(101);
    x.fillStyle = '#6e6a62';
    x.fillRect(0, 0, SIZE, SIZE);
    for (let py = 0; py < SIZE; py += 42) {
      const off = (py / 42) % 2 ? 26 : 0;
      for (let px = -off; px < SIZE; px += 52) {
        const tone = 150 + Math.floor(rand() * 45);
        x.fillStyle = `rgb(${tone},${tone - 6},${tone - 16})`;
        x.beginPath();
        x.roundRect(px + 3, py + 3, 46, 36, 10);
        x.fill();
        x.fillStyle = 'rgba(255,255,255,0.12)';
        x.fillRect(px + 10, py + 7, 26, 5);
      }
    }
    // A little moss in the joints
    speckle(x, rand, ['rgba(90,140,60,0.55)'], 160, 2, 5);
    return { map: c, repeatV: 1, roughness: 0.9, metalness: 0 };
  },
};

function toTexture(c, repeatV, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, repeatV);
  t.anisotropy = 8;
  if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Swap the road's material for the world's own surface. */
export function applyRoadSurface(scene, theme) {
  const road = scene.userData.raceRoadMesh;
  if (!road?.geometry?.attributes?.uv || road.userData.themedSurface) return false;
  const paint = PAINTERS[theme.surface];
  if (!paint) return false;
  const p = paint();
  const old = road.material;
  const matOpts = {
    map: toTexture(p.map, p.repeatV),
    roughness: p.roughness,
    metalness: p.metalness,
    polygonOffset: old?.polygonOffset ?? true,
    polygonOffsetFactor: old?.polygonOffsetFactor ?? -4,
    polygonOffsetUnits: old?.polygonOffsetUnits ?? -4,
  };
  if (p.emissive) {
    matOpts.emissiveMap = toTexture(p.emissive, p.repeatV);
    matOpts.emissive = new THREE.Color(p.emissiveColor);
    matOpts.emissiveIntensity = p.emissiveIntensity;
  }
  road.material = new THREE.MeshStandardMaterial(matOpts);
  road.userData.themedSurface = theme.surface;
  // The road's sides and underside share the old material; tint them to match
  road.parent?.children.forEach((m) => {
    if (m !== road && m.isMesh && m.material === old) m.material = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.9 });
  });
  old?.dispose?.();
  return true;
}

/** Kerbs and the painted centre dashes only belong on tarmac circuits. */
export function applyRoadMarkings(scene, theme) {
  // Pieces built later (the start presentation) read this too
  scene.userData.trackTheme = theme;
  scene.traverse((o) => {
    if (o.name === 'kart-kerbs') o.visible = !!theme.kerbs;
    if (o.name === 'rally-center-dashes') o.visible = !!theme.centreLine;
    // The themed fence replaces the old plain grey walls
    if (o.name === 'kart-walls') o.visible = false;
  });
}

function chevronTexture(accent, dir) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#12213f';
  x.fillRect(0, 0, 256, 96);
  x.strokeStyle = '#ffffff';
  x.lineWidth = 6;
  x.strokeRect(3, 3, 250, 90);
  x.fillStyle = accent;
  for (let i = 0; i < 3; i++) {
    const cx = 60 + i * 68;
    x.beginPath();
    if (dir > 0) { x.moveTo(cx - 22, 18); x.lineTo(cx + 10, 48); x.lineTo(cx - 22, 78); x.lineTo(cx - 6, 78); x.lineTo(cx + 26, 48); x.lineTo(cx - 6, 18); }
    else { x.moveTo(cx + 22, 18); x.lineTo(cx - 10, 48); x.lineTo(cx + 22, 78); x.lineTo(cx + 6, 78); x.lineTo(cx - 26, 48); x.lineTo(cx + 6, 18); }
    x.closePath();
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Chevron boards on the outside of the sharpest bends, facing the oncoming
 * karts and pointing the way the road turns.
 */
export function placeCornerChevrons(world, curve, hw, theme, offset) {
  const root = new THREE.Group();
  root.name = 'roadside-chevrons';
  const N = 240;
  const turn = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const a = curve.getTangentAt(t).setY(0).normalize();
    const b = curve.getTangentAt((t + 0.012) % 1).setY(0).normalize();
    turn.push(a.x * b.z - a.z * b.x); // signed turn rate
  }
  const picks = [];
  for (let i = 0; i < N; i++) {
    const v = Math.abs(turn[i]);
    if (v < 0.05) continue;
    const isPeak = [-3, -2, -1, 1, 2, 3].every((d) => v >= Math.abs(turn[(i + d + N) % N]));
    if (!isPeak) continue;
    if (picks.some((p) => Math.min(Math.abs(p.i - i), N - Math.abs(p.i - i)) < N * 0.07)) continue;
    picks.push({ i, v });
  }
  picks.sort((a, b) => b.v - a.v).slice(0, 8).forEach(({ i }) => {
    // Board a little before the apex so it is seen on the approach
    const t = ((i - 4 + N) % N) / N;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).setY(0).normalize();
    const right = new THREE.Vector3(tan.z, 0, -tan.x);
    // Which way does the road bend? Put the board on the outside.
    const ahead = curve.getPointAt((t + 0.02) % 1).sub(p);
    const bendsRight = ahead.dot(right) > 0;
    const side = bendsRight ? -1 : 1;
    const g = new THREE.Group();
    const post = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.6, metalness: 0.4 });
    [-1.3, 1.3].forEach((px) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.4, 0.14), post);
      m.position.set(px, 0.7, 0);
      g.add(m);
    });
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.2),
      new THREE.MeshStandardMaterial({ map: chevronTexture(theme.accent, bendsRight ? 1 : -1), emissive: 0xffffff, emissiveIntensity: 0.25, emissiveMap: null, side: THREE.DoubleSide }),
    );
    board.material.emissiveMap = board.material.map;
    board.position.y = 1.7;
    g.add(board);
    g.position.copy(p).addScaledVector(right, side * offset);
    g.rotation.y = Math.atan2(-tan.x, -tan.z) + side * -0.25;
    root.add(g);
  });
  world.add(root);
  return root;
}
