/**
 * Robot add-ons for the Robot Workshop: toppers, back gear and front gadgets that
 * snap onto ANY Robot Studio body. Each part is sized from the body's bounding box,
 * so a crown sits on a drone as neatly as on a rover. Saved robots keep
 * `addons: { top, back, front }` and buildRobotModel() adds them everywhere the
 * robot is shown (workshop, garage, every game).
 */
import * as THREE from 'three';

export const ADDON_SLOTS = {
  top: [
    { id: 'none', label: 'Nothing', icon: '➖' },
    { id: 'antenna', label: 'Antenna', icon: '📡' },
    { id: 'twin', label: 'Twin antennae', icon: '📶' },
    { id: 'crown', label: 'Crown', icon: '👑' },
    { id: 'propcap', label: 'Propeller cap', icon: '🌀' },
    { id: 'siren', label: 'Siren light', icon: '🚨' },
    { id: 'dish', label: 'Radar dish', icon: '🛰' },
    { id: 'horns', label: 'Horns', icon: '🐂' },
    { id: 'partyhat', label: 'Party hat', icon: '🎉' },
    { id: 'headphones', label: 'Headphones', icon: '🎧' },
    { id: 'mohawk', label: 'Spiky mohawk', icon: '🦔' },
    { id: 'flower', label: 'Flower', icon: '🌼' },
  ],
  back: [
    { id: 'none', label: 'Nothing', icon: '➖' },
    { id: 'jetpack', label: 'Jetpack', icon: '🚀' },
    { id: 'boosters', label: 'Twin boosters', icon: '🔥' },
    { id: 'flag', label: 'Team flag', icon: '🚩' },
    { id: 'solar', label: 'Solar wings', icon: '☀' },
    { id: 'backpack', label: 'Backpack', icon: '🎒' },
    { id: 'spoiler', label: 'Race spoiler', icon: '🏎' },
    { id: 'tank', label: 'Air tank', icon: '🫧' },
  ],
  front: [
    { id: 'none', label: 'Nothing', icon: '➖' },
    { id: 'headlights', label: 'Headlights', icon: '🔦' },
    { id: 'camera', label: 'Camera eye', icon: '📷' },
    { id: 'claw', label: 'Grabber claw', icon: '🦾' },
    { id: 'bumper', label: 'Bumper', icon: '🛡' },
    { id: 'scoop', label: 'Scoop', icon: '🪣' },
    { id: 'plate', label: 'Number plate', icon: '🔢' },
    { id: 'sonar', label: 'Sonar', icon: '🔊' },
  ],
};

const std = (color, rough = 0.42, metal = 0.25, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
const glow = (color, i = 1.4) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, roughness: 0.3 });
const steel = () => std(0xcbd5e1, 0.28, 0.85);
const dark = () => std(0x1f2937, 0.55, 0.45);

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  // Keep add-on colours when the body is repainted
  m.userData.skipStudioPaint = true;
  return m;
}

/* ── Toppers: built around (0,0,0) = top centre of the body, size 1 ≈ body width ── */
const TOP = {
  antenna: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.42, 10), steel(), 0, 0.21, 0));
    g.add(mesh(new THREE.SphereGeometry(0.08, 16, 12), glow(c.led, 1.6), 0, 0.46, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 16), dark(), 0, 0.02, 0));
    return g;
  },
  twin: (c) => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const rod = mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.38, 8), steel(), s * 0.14, 0.18, 0);
      rod.rotation.z = s * -0.35; g.add(rod);
      g.add(mesh(new THREE.SphereGeometry(0.065, 14, 10), glow(c.accent, 1.2), s * 0.21, 0.37, 0));
    });
    return g;
  },
  crown: () => {
    const gold = std(0xfacc15, 0.22, 0.95);
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 8, 1, true), gold, 0, 0.06, 0));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.add(mesh(new THREE.ConeGeometry(0.045, 0.14, 6), gold, Math.cos(a) * 0.19, 0.18, Math.sin(a) * 0.19));
      if (i % 2 === 0) g.add(mesh(new THREE.SphereGeometry(0.028, 10, 8), glow([0xef4444, 0x3b82f6, 0x22c55e, 0xa855f7][i / 2], 0.8), Math.cos(a) * 0.205, 0.07, Math.sin(a) * 0.205));
    }
    return g;
  },
  propcap: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(c.accent, 0.5, 0.1), 0, 0, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), steel(), 0, 0.26, 0));
    const blades = new THREE.Group(); blades.position.y = 0.34; blades.userData.spin = 9;
    [0xef4444, 0xfacc15, 0x3b82f6].forEach((col, i) => {
      const b = mesh(new THREE.BoxGeometry(0.34, 0.015, 0.07), std(col, 0.4, 0.1), 0, 0, 0);
      b.rotation.y = (i / 3) * Math.PI; blades.add(b);
    });
    g.add(blades);
    return g;
  },
  siren: () => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.05, 20), dark(), 0, 0.025, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 20), glow(0xef4444, 1.8), -0.08, 0.13, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 20), glow(0x3b82f6, 1.8), 0.08, 0.13, 0));
    return g;
  },
  dish: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.22, 10), steel(), 0, 0.11, 0));
    const d = mesh(new THREE.SphereGeometry(0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), std(0xf8fafc, 0.35, 0.4, { side: THREE.DoubleSide }), 0, 0.32, 0);
    d.rotation.x = Math.PI * 0.75; g.add(d);
    g.add(mesh(new THREE.SphereGeometry(0.035, 10, 8), glow(c.led, 1.4), 0, 0.3, 0.1));
    return g;
  },
  horns: () => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.14, 0, 0), new THREE.Vector3(s * 0.28, 0.14, 0), new THREE.Vector3(s * 0.3, 0.32, -0.02)]);
      g.add(mesh(new THREE.TubeGeometry(curve, 16, 0.045, 10), std(0xfef3c7, 0.45, 0.05)));
      g.add(mesh(new THREE.ConeGeometry(0.045, 0.1, 10), std(0xfef3c7, 0.45, 0.05), s * 0.3, 0.37, -0.02));
    });
    return g;
  },
  partyhat: (c) => {
    const g = new THREE.Group();
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
    const x = canvas.getContext('2d');
    x.fillStyle = '#ec4899'; x.fillRect(0, 0, 64, 64);
    x.fillStyle = '#facc15'; for (let i = 0; i < 64; i += 16) x.fillRect(0, i, 64, 7);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    g.add(mesh(new THREE.ConeGeometry(0.16, 0.38, 24), std(0xffffff, 0.5, 0, { map: tex }), 0, 0.19, 0));
    g.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), std(c.accent, 0.6, 0), 0, 0.4, 0));
    return g;
  },
  headphones: (c) => {
    const g = new THREE.Group();
    const band = mesh(new THREE.TorusGeometry(0.26, 0.03, 10, 28, Math.PI), std(c.accent, 0.4, 0.3), 0, -0.04, 0);
    g.add(band);
    [-1, 1].forEach((s) => {
      const cup = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 20), dark(), s * 0.26, -0.08, 0);
      cup.rotation.z = Math.PI / 2; g.add(cup);
      const ring = mesh(new THREE.TorusGeometry(0.085, 0.015, 8, 20), glow(c.led, 1.2), s * 0.3, -0.08, 0);
      ring.rotation.y = Math.PI / 2; g.add(ring);
    });
    return g;
  },
  mohawk: (c) => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const s = mesh(new THREE.ConeGeometry(0.05, 0.2 + (i % 2) * 0.06, 8), std(c.accent, 0.4, 0.2), 0, 0.1, -0.16 + i * 0.08);
      s.rotation.x = -0.25; g.add(s);
    }
    return g;
  },
  flower: () => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 6), std(0x16a34a, 0.6, 0), 0, 0.12, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.add(mesh(new THREE.SphereGeometry(0.06, 12, 8), std(0xf472b6, 0.55, 0), Math.cos(a) * 0.09, 0.27, Math.sin(a) * 0.09));
    }
    g.add(mesh(new THREE.SphereGeometry(0.05, 12, 8), std(0xfacc15, 0.5, 0), 0, 0.28, 0));
    return g;
  },
};

/* ── Back gear: (0,0,0) = middle of the robot's back, facing out along -z ── */
const BACK = {
  jetpack: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.34, 0.36, 0.14), std(c.accent, 0.35, 0.5), 0, 0, -0.07));
    [-1, 1].forEach((s) => {
      g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 16), steel(), s * 0.13, 0, -0.17));
      const fl = mesh(new THREE.ConeGeometry(0.07, 0.2, 14), glow(0xf97316, 1.8), s * 0.13, -0.3, -0.17);
      fl.rotation.x = Math.PI; g.add(fl);
    });
    return g;
  },
  boosters: () => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const b = mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.36, 16), steel(), s * 0.16, 0, -0.12);
      b.rotation.x = Math.PI / 2; g.add(b);
      const f = mesh(new THREE.ConeGeometry(0.09, 0.26, 14), glow(0x38bdf8, 1.8), s * 0.16, 0, -0.42);
      f.rotation.x = -Math.PI / 2; g.add(f);
    });
    return g;
  },
  flag: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), steel(), 0.08, 0.32, -0.04));
    const f = mesh(new THREE.PlaneGeometry(0.34, 0.22), std(c.accent, 0.6, 0, { side: THREE.DoubleSide }), 0.25, 0.6, -0.04);
    g.add(f);
    g.add(mesh(new THREE.SphereGeometry(0.03, 10, 8), std(0xfacc15, 0.3, 0.9), 0.08, 0.73, -0.04));
    return g;
  },
  solar: () => {
    const g = new THREE.Group();
    const panel = std(0x1e3a8a, 0.25, 0.6, { emissive: 0x1d4ed8, emissiveIntensity: 0.25 });
    [-1, 1].forEach((s) => {
      const p = mesh(new THREE.BoxGeometry(0.5, 0.02, 0.28), panel, s * 0.36, 0.06, -0.08);
      p.rotation.z = s * 0.22; g.add(p);
      g.add(mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), steel(), s * 0.1, 0.02, -0.06));
    });
    return g;
  },
  backpack: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.36, 0.38, 0.18), std(c.accent, 0.7, 0), 0, 0, -0.09));
    g.add(mesh(new THREE.BoxGeometry(0.28, 0.14, 0.06), std(0xffffff, 0.7, 0), 0, -0.07, -0.2));
    g.add(mesh(new THREE.SphereGeometry(0.03, 10, 8), std(0xfacc15, 0.3, 0.8), 0, 0.03, -0.21));
    return g;
  },
  spoiler: (c) => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => g.add(mesh(new THREE.BoxGeometry(0.03, 0.2, 0.06), dark(), s * 0.22, 0.1, -0.06)));
    g.add(mesh(new THREE.BoxGeometry(0.62, 0.035, 0.18), std(c.accent, 0.3, 0.4), 0, 0.22, -0.08));
    return g;
  },
  tank: () => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      g.add(mesh(new THREE.CapsuleGeometry(0.08, 0.28, 6, 14), std(0xfacc15, 0.35, 0.6), s * 0.1, 0, -0.1));
    });
    g.add(mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), steel(), 0, 0.22, -0.1));
    return g;
  },
};

/* ── Front gadgets: (0,0,0) = middle of the robot's face, facing +z ── */
const FRONT = {
  headlights: () => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const h = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 18), steel(), s * 0.18, 0, 0.03);
      h.rotation.x = Math.PI / 2; g.add(h);
      g.add(mesh(new THREE.CircleGeometry(0.055, 18), glow(0xfffbeb, 2.2), s * 0.18, 0, 0.065));
    });
    return g;
  },
  camera: (c) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.14, 0.12), dark(), 0, 0, 0.06));
    const l = mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.08, 18), steel(), 0, 0, 0.15);
    l.rotation.x = Math.PI / 2; g.add(l);
    g.add(mesh(new THREE.CircleGeometry(0.045, 18), glow(c.led, 1.4), 0, 0, 0.191));
    return g;
  },
  claw: (c) => {
    const g = new THREE.Group();
    const arm = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 10), steel(), 0, 0, 0.14);
    arm.rotation.x = Math.PI / 2; g.add(arm);
    [-1, 1].forEach((s) => {
      const f = mesh(new THREE.BoxGeometry(0.03, 0.04, 0.16), std(c.accent, 0.35, 0.5), s * 0.06, 0, 0.3);
      f.rotation.y = s * 0.35; g.add(f);
    });
    return g;
  },
  bumper: () => {
    const g = new THREE.Group();
    const b = mesh(new THREE.CapsuleGeometry(0.045, 0.5, 6, 14), std(0x111827, 0.5, 0.3), 0, 0, 0.06);
    b.rotation.z = Math.PI / 2; g.add(b);
    [-1, 1].forEach((s) => g.add(mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), glow(0xf97316, 1.0), s * 0.28, 0, 0.07)));
    return g;
  },
  scoop: () => {
    const g = new THREE.Group();
    const s = mesh(new THREE.BoxGeometry(0.5, 0.025, 0.24), steel(), 0, -0.05, 0.14);
    s.rotation.x = -0.25; g.add(s);
    [-1, 1].forEach((k) => g.add(mesh(new THREE.BoxGeometry(0.025, 0.1, 0.22), steel(), k * 0.25, -0.02, 0.13)));
    return g;
  },
  plate: (c) => {
    const g = new THREE.Group();
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 48;
    const x = canvas.getContext('2d');
    x.fillStyle = '#fde047'; x.fillRect(0, 0, 128, 48);
    x.fillStyle = '#111827'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(c.plate || 'BB 01', 64, 26);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    g.add(mesh(new THREE.PlaneGeometry(0.3, 0.11), std(0xffffff, 0.5, 0, { map: tex }), 0, 0, 0.02));
    return g;
  },
  sonar: (c) => {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const t = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 18), steel(), s * 0.09, 0, 0.04);
      t.rotation.x = Math.PI / 2; g.add(t);
      g.add(mesh(new THREE.CircleGeometry(0.045, 18), glow(c.led, 0.9), s * 0.09, 0, 0.081));
    });
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.04), dark(), 0, -0.07, 0.03));
    return g;
  },
};

/**
 * Where the robot's main body is: the biggest visible part plus everything stacked on it
 * (head, hat…), ignoring far-reaching legs, propellers and arms so parts sit on the body.
 */
function bodyFrame(group) {
  const parts = [];
  group.traverse((o) => {
    if (!o.isMesh || !o.visible || o.material?.visible === false) return;
    if (o.material?.transparent && (o.material.opacity ?? 1) < 0.3) return;
    const b = new THREE.Box3().setFromObject(o);
    if (b.isEmpty()) return;
    const s = b.getSize(new THREE.Vector3());
    parts.push({ b, vol: Math.max(1e-6, s.x * s.y * s.z), c: b.getCenter(new THREE.Vector3()) });
  });
  if (!parts.length) return {};
  const core = parts.reduce((a, p) => (p.vol > a.vol ? p : a)).b.clone();
  const cs = core.getSize(new THREE.Vector3());
  const box = core.clone();
  // Anything sitting over the core (a head, a cockpit…) counts as body too
  parts.forEach((p) => {
    const over = p.c.x > core.min.x - cs.x * 0.1 && p.c.x < core.max.x + cs.x * 0.1 && p.c.z > core.min.z - cs.z * 0.1 && p.c.z < core.max.z + cs.z * 0.1;
    const small = p.vol < cs.x * cs.y * cs.z * 1.5;
    if (over && small && p.b.max.y < core.max.y + cs.y * 2.5) box.union(p.b);
  });
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const k = Math.max(0.35, Math.max(size.x, size.z) * 0.85);
  // The highest point straight above the middle (the top of the head, not a raised arm)
  const mx = size.x * 0.18, mz = size.z * 0.18;
  let topY = -Infinity, headW = 0;
  parts.forEach((p) => {
    if (p.b.min.x <= centre.x + mx && p.b.max.x >= centre.x - mx && p.b.min.z <= centre.z + mz && p.b.max.z >= centre.z - mz && p.b.max.y <= box.max.y + 0.01 && p.b.max.y > topY) {
      topY = p.b.max.y;
      const ps = p.b.getSize(new THREE.Vector3());
      headW = Math.max(ps.x, ps.z);
    }
  });
  if (!Number.isFinite(topY)) topY = box.max.y;
  // Hats are sized to the head they sit on (a kart's helmet, not the whole kart)
  const kTop = Math.min(k, Math.max(k * 0.45, headW * 1.7, size.y * 0.35));
  // The nearest surface in front of / behind the middle, at chest height
  const midY = box.min.y + size.y * 0.5;
  let frontZ = -Infinity, backZ = Infinity;
  parts.forEach((p) => {
    if (p.b.min.x > centre.x + size.x * 0.25 || p.b.max.x < centre.x - size.x * 0.25) return;
    if (p.b.min.y > midY + size.y * 0.3 || p.b.max.y < midY - size.y * 0.3) return;
    if (p.vol < 1e-4) return;
    frontZ = Math.max(frontZ, p.b.max.z); backZ = Math.min(backZ, p.b.min.z);
  });
  if (!Number.isFinite(frontZ)) frontZ = box.max.z;
  if (!Number.isFinite(backZ)) backZ = box.min.z;
  return { box, size, centre, k, kTop, topY, frontZ, backZ, midY };
}

/**
 * Add the chosen add-ons to a built robot. `group` should already be at its final scale.
 * Robots face +z. Parts are placed from the body's bounding box and scaled to its width.
 */
export function attachAddons(group, addons = {}, colors = {}) {
  if (!group || !addons) return group;
  const picks = { top: addons.top, back: addons.back, front: addons.front };
  if (!Object.values(picks).some((v) => v && v !== 'none')) return group;
  group.updateMatrixWorld(true);
  const { box, size, centre, k, kTop, topY, frontZ, backZ, midY } = bodyFrame(group);
  if (!box) return group;
  const c = { primary: colors.primary || '#6366f1', accent: colors.accent || '#facc15', led: colors.led || '#5eead4', plate: colors.plate };
  const holder = new THREE.Group();
  holder.name = 'robotAddons';
  const s = group.scale.x || 1;
  const put = (builder, x, y, z, grow = 1, base = k) => {
    if (!builder) return;
    const part = builder(c);
    part.scale.setScalar((base * grow) / s);
    part.position.copy(group.worldToLocal(new THREE.Vector3(x, y, z)));
    holder.add(part);
  };
  put(TOP[picks.top], centre.x, topY - size.y * 0.01, centre.z, 1, kTop);
  put(BACK[picks.back], centre.x, midY + size.y * 0.05, backZ - 0.01, 1.1);
  put(FRONT[picks.front], centre.x, midY - size.y * 0.05, frontZ + 0.01, 1.35);
  group.add(holder);
  group.userData.addonSpinners = [];
  holder.traverse((o) => { if (o.userData.spin) group.userData.addonSpinners.push(o); });
  return group;
}

/** Spin propellers etc. Call each frame with the time step. */
export function animateAddons(group, dt) {
  (group?.userData?.addonSpinners || []).forEach((o) => { o.rotation.y += o.userData.spin * dt; });
}
