/**
 * Robot Designer → 3D model. A "design" is a small set of choices a child makes
 * (body, head, eyes, arms, movement, top, pattern, colours). Saved robots carry
 * the design, and the model is rebuilt anywhere it is shown.
 */
import * as THREE from 'three';

export const DESIGN_OPTIONS = {
  body: [
    { id: 'box', label: 'Boxy', emoji: '🟦' }, { id: 'round', label: 'Round', emoji: '🔵' }, { id: 'capsule', label: 'Capsule', emoji: '💊' },
    { id: 'egg', label: 'Egg', emoji: '🥚' }, { id: 'tank', label: 'Tank', emoji: '🛡️' }, { id: 'saucer', label: 'Saucer', emoji: '🛸' },
  ],
  head: [
    { id: 'dome', label: 'Dome', emoji: '🔮' }, { id: 'box', label: 'Box head', emoji: '📦' }, { id: 'tv', label: 'TV screen', emoji: '📺' },
    { id: 'cat', label: 'Cat ears', emoji: '🐱' }, { id: 'bucket', label: 'Bucket', emoji: '🪣' }, { id: 'none', label: 'No head', emoji: '➖' },
  ],
  eyes: [
    { id: 'round', label: 'Googly', emoji: '👀' }, { id: 'visor', label: 'Visor', emoji: '🕶️' }, { id: 'cyclops', label: 'One eye', emoji: '👁️' },
    { id: 'happy', label: 'Happy', emoji: '😊' }, { id: 'angry', label: 'Determined', emoji: '😠' }, { id: 'hearts', label: 'Hearts', emoji: '😍' },
  ],
  arms: [
    { id: 'claws', label: 'Claws', emoji: '🦀' }, { id: 'grabbers', label: 'Grabbers', emoji: '🦾' }, { id: 'noodle', label: 'Noodle arms', emoji: '🍜' },
    { id: 'wings', label: 'Wings', emoji: '🪽' }, { id: 'boosters', label: 'Boosters', emoji: '🚀' }, { id: 'none', label: 'No arms', emoji: '➖' },
  ],
  move: [
    { id: 'wheels', label: 'Wheels', emoji: '🛞' }, { id: 'tracks', label: 'Tracks', emoji: '⛓️' }, { id: 'legs', label: 'Legs', emoji: '🦿' },
    { id: 'hover', label: 'Hover', emoji: '🛸' }, { id: 'spring', label: 'Spring', emoji: '🌀' }, { id: 'propeller', label: 'Propeller', emoji: '🚁' },
  ],
  top: [
    { id: 'antenna', label: 'Antenna', emoji: '📡' }, { id: 'crown', label: 'Crown', emoji: '👑' }, { id: 'cap', label: 'Cap', emoji: '🧢' },
    { id: 'horns', label: 'Horns', emoji: '🦄' }, { id: 'flower', label: 'Flower', emoji: '🌼' }, { id: 'none', label: 'Nothing', emoji: '➖' },
  ],
  pattern: [
    { id: 'plain', label: 'Plain', emoji: '⬜' }, { id: 'stripes', label: 'Stripes', emoji: '🦓' }, { id: 'spots', label: 'Spots', emoji: '🐞' },
    { id: 'stars', label: 'Stars', emoji: '⭐' }, { id: 'checks', label: 'Checks', emoji: '🏁' }, { id: 'bolts', label: 'Lightning', emoji: '⚡' },
  ],
};

export const DEFAULT_DESIGN = { body: 'round', head: 'dome', eyes: 'round', arms: 'claws', move: 'wheels', top: 'antenna', pattern: 'plain' };

export function randomDesign(rnd = Math.random) {
  const pick = (k) => DESIGN_OPTIONS[k][Math.floor(rnd() * DESIGN_OPTIONS[k].length)].id;
  return { body: pick('body'), head: pick('head'), eyes: pick('eyes'), arms: pick('arms'), move: pick('move'), top: pick('top'), pattern: pick('pattern') };
}

const mat = (c, rough = 0.45, metal = 0.2, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, ...extra });
const glow = (c, i = 1.2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.3 });
function m(geo, material) { const x = new THREE.Mesh(geo, material); x.castShadow = true; x.receiveShadow = true; return x; }

function patternTexture(pattern, base, accent) {
  if (pattern === 'plain') return null;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  x.fillStyle = accent; x.strokeStyle = accent;
  if (pattern === 'stripes') for (let i = 0; i < 256; i += 48) x.fillRect(0, i, 256, 22);
  if (pattern === 'spots') for (let i = 0; i < 14; i++) { x.beginPath(); x.arc((i * 73) % 256, (i * 151) % 256, 16 + (i % 3) * 6, 0, Math.PI * 2); x.fill(); }
  if (pattern === 'checks') for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * 32, j * 32, 32, 32);
  if (pattern === 'stars') {
    for (let i = 0; i < 10; i++) {
      const cx = (i * 89) % 256, cy = (i * 137) % 256, r = 16;
      x.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      x.fill();
    }
  }
  if (pattern === 'bolts') {
    x.lineWidth = 12; x.lineJoin = 'round';
    for (let i = 0; i < 3; i++) { const ox = 30 + i * 80; x.beginPath(); x.moveTo(ox, 20); x.lineTo(ox + 30, 110); x.lineTo(ox, 130); x.lineTo(ox + 34, 236); x.stroke(); }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Returns a THREE.Group, about 1.2 units tall, facing +z. */
export function buildDesignedRobot(design = DEFAULT_DESIGN, primary = '#6366f1', accent = '#facc15', led = '#5eead4') {
  const d = { ...DEFAULT_DESIGN, ...design };
  const g = new THREE.Group();
  const tex = patternTexture(d.pattern, primary, accent);
  const bodyMat = mat(tex ? 0xffffff : primary, 0.4, 0.25, tex ? { map: tex } : {});
  const accMat = mat(accent, 0.4, 0.3);
  const darkMat = mat(0x1f2937, 0.6, 0.4);

  /* Movement (sets how high the body sits) */
  let base = 0.32;
  const legsParts = [];
  if (d.move === 'wheels') {
    [[-0.42, 0.28], [0.42, 0.28], [-0.42, -0.28], [0.42, -0.28]].forEach(([x, z]) => {
      const w = m(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 20), darkMat);
      w.rotation.z = Math.PI / 2; w.position.set(x, 0.17, z); g.add(w);
      const hub = m(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), accMat);
      hub.rotation.z = Math.PI / 2; hub.position.set(x, 0.17, z); g.add(hub);
    });
  } else if (d.move === 'tracks') {
    [-0.42, 0.42].forEach((x) => {
      const t = m(new THREE.CapsuleGeometry(0.15, 0.55, 6, 12), darkMat);
      t.rotation.x = Math.PI / 2; t.position.set(x, 0.16, 0); g.add(t);
      for (let i = -2; i <= 2; i++) { const b = m(new THREE.BoxGeometry(0.2, 0.03, 0.06), accMat); b.position.set(x, 0.32, i * 0.15); g.add(b); }
    });
  } else if (d.move === 'legs') {
    base = 0.55;
    [-0.2, 0.2].forEach((x) => {
      const leg = m(new THREE.CylinderGeometry(0.07, 0.08, 0.45, 12), darkMat); leg.position.set(x, 0.3, 0); g.add(leg);
      const foot = m(new THREE.BoxGeometry(0.22, 0.08, 0.32), accMat); foot.position.set(x, 0.05, 0.05); g.add(foot);
      legsParts.push(leg);
    });
  } else if (d.move === 'hover') {
    base = 0.45;
    const ring = m(new THREE.TorusGeometry(0.42, 0.06, 10, 28), glow(led, 1.4)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.18; g.add(ring);
    const pad = m(new THREE.CylinderGeometry(0.36, 0.42, 0.12, 24), accMat); pad.position.y = 0.26; g.add(pad);
  } else if (d.move === 'spring') {
    base = 0.55;
    for (let i = 0; i < 4; i++) { const coil = m(new THREE.TorusGeometry(0.17, 0.035, 8, 20), mat(0x94a3b8, 0.3, 0.9)); coil.rotation.x = Math.PI / 2; coil.position.y = 0.08 + i * 0.1; g.add(coil); }
  } else if (d.move === 'propeller') {
    base = 0.4;
    const pole = m(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), darkMat); pole.position.y = 0.25; g.add(pole);
    const ball = m(new THREE.SphereGeometry(0.12, 14, 10), accMat); ball.position.y = 0.12; g.add(ball);
  }

  /* Body */
  let bodyTop = base + 0.55, bodyW = 0.75;
  let body;
  if (d.body === 'box') { body = m(new THREE.BoxGeometry(0.75, 0.55, 0.6), bodyMat); body.position.y = base + 0.275; }
  else if (d.body === 'round') { body = m(new THREE.SphereGeometry(0.4, 28, 20), bodyMat); body.position.y = base + 0.36; bodyTop = base + 0.7; bodyW = 0.8; }
  else if (d.body === 'capsule') { body = m(new THREE.CapsuleGeometry(0.3, 0.35, 10, 20), bodyMat); body.position.y = base + 0.47; bodyTop = base + 0.9; bodyW = 0.6; }
  else if (d.body === 'egg') { body = m(new THREE.SphereGeometry(0.38, 28, 20), bodyMat); body.scale.set(1, 1.3, 1); body.position.y = base + 0.46; bodyTop = base + 0.9; }
  else if (d.body === 'tank') { body = m(new THREE.BoxGeometry(0.95, 0.4, 0.75), bodyMat); body.position.y = base + 0.2; bodyTop = base + 0.4; bodyW = 0.95; const turret = m(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 20), accMat); turret.position.y = base + 0.49; g.add(turret); bodyTop = base + 0.58; }
  else { body = m(new THREE.SphereGeometry(0.55, 32, 16), bodyMat); body.scale.set(1, 0.42, 1); body.position.y = base + 0.23; bodyTop = base + 0.45; bodyW = 1.1; const rim = m(new THREE.TorusGeometry(0.54, 0.04, 8, 32), glow(led, 0.8)); rim.rotation.x = Math.PI / 2; rim.position.y = base + 0.23; g.add(rim); }
  g.add(body);
  // A chest light so every robot has a bit of personality
  const chest = m(new THREE.CircleGeometry(0.08, 18), glow(accent, 0.8));
  chest.position.set(0, (base + bodyTop) / 2 - 0.02, d.body === 'box' || d.body === 'tank' ? (d.body === 'tank' ? 0.38 : 0.31) : 0.38);
  if (d.body !== 'saucer') g.add(chest);

  /* Head */
  let headY = bodyTop, faceZ = 0.3, headH = 0;
  const headMat = mat(primary, 0.4, 0.25);
  if (d.head === 'dome') { const h = m(new THREE.SphereGeometry(0.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), headMat); h.position.y = headY; g.add(h); headH = 0.3; faceZ = 0.27; }
  else if (d.head === 'box') { const h = m(new THREE.BoxGeometry(0.5, 0.38, 0.45), headMat); h.position.y = headY + 0.19; g.add(h); headH = 0.38; faceZ = 0.23; }
  else if (d.head === 'tv') {
    const h = m(new THREE.BoxGeometry(0.62, 0.44, 0.36), mat(accent, 0.4, 0.3)); h.position.y = headY + 0.22; g.add(h);
    const scr = m(new THREE.PlaneGeometry(0.5, 0.32), glow(0x0f172a, 0.2)); scr.position.set(0, headY + 0.22, 0.181); g.add(scr);
    headH = 0.44; faceZ = 0.19;
  } else if (d.head === 'cat') {
    const h = m(new THREE.SphereGeometry(0.3, 24, 16), headMat); h.scale.set(1, 0.85, 0.95); h.position.y = headY + 0.22; g.add(h);
    [-1, 1].forEach((s) => { const ear = m(new THREE.ConeGeometry(0.11, 0.22, 4), headMat); ear.position.set(s * 0.18, headY + 0.48, 0); ear.rotation.z = s * -0.3; g.add(ear); });
    headH = 0.48; faceZ = 0.28;
  } else if (d.head === 'bucket') {
    const h = m(new THREE.CylinderGeometry(0.3, 0.24, 0.42, 22), mat(0x94a3b8, 0.35, 0.8)); h.position.y = headY + 0.21; g.add(h);
    const handle = m(new THREE.TorusGeometry(0.3, 0.02, 6, 20, Math.PI), mat(0x64748b, 0.4, 0.8)); handle.position.y = headY + 0.42; g.add(handle);
    headH = 0.42; faceZ = 0.28;
  } else { faceZ = d.body === 'box' ? 0.31 : 0.38; headY = bodyTop - 0.28; headH = 0.18; }
  const eyeY = d.head === 'dome' ? headY + 0.13 : d.head === 'none' ? headY : headY + headH * 0.55;

  /* Eyes */
  const white = mat(0xffffff, 0.2, 0);
  const pupilMat = mat(0x111827, 0.3, 0);
  const ledMat = glow(led, 1.6);
  if (d.eyes === 'round' || d.eyes === 'angry') {
    [-0.11, 0.11].forEach((x) => {
      const e = m(new THREE.SphereGeometry(0.085, 16, 12), white); e.position.set(x, eyeY, faceZ); g.add(e);
      const p = m(new THREE.SphereGeometry(0.045, 12, 10), pupilMat); p.position.set(x, eyeY, faceZ + 0.07); g.add(p);
      if (d.eyes === 'angry') { const brow = m(new THREE.BoxGeometry(0.14, 0.03, 0.03), pupilMat); brow.position.set(x, eyeY + 0.11, faceZ + 0.05); brow.rotation.z = x < 0 ? -0.4 : 0.4; g.add(brow); }
    });
  } else if (d.eyes === 'visor') {
    const v = m(new THREE.BoxGeometry(0.42, 0.11, 0.06), glow(led, 1.2)); v.position.set(0, eyeY, faceZ + 0.01); g.add(v);
  } else if (d.eyes === 'cyclops') {
    const e = m(new THREE.SphereGeometry(0.13, 18, 14), white); e.position.set(0, eyeY, faceZ); g.add(e);
    const p = m(new THREE.SphereGeometry(0.07, 14, 10), ledMat); p.position.set(0, eyeY, faceZ + 0.1); g.add(p);
  } else if (d.eyes === 'happy') {
    [-0.11, 0.11].forEach((x) => { const a = m(new THREE.TorusGeometry(0.06, 0.018, 6, 14, Math.PI), ledMat); a.position.set(x, eyeY - 0.02, faceZ + 0.02); g.add(a); });
  } else if (d.eyes === 'hearts') {
    [-0.11, 0.11].forEach((x) => {
      const s = new THREE.Shape();
      s.moveTo(0, -0.06); s.bezierCurveTo(-0.1, 0.02, -0.05, 0.08, 0, 0.03); s.bezierCurveTo(0.05, 0.08, 0.1, 0.02, 0, -0.06);
      const h = m(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), glow(0xf43f5e, 1)); h.position.set(x, eyeY, faceZ); g.add(h);
    });
  }
  // Smile for most faces
  if (d.eyes !== 'visor' && d.head !== 'tv') {
    const smile = m(new THREE.TorusGeometry(0.07, 0.015, 6, 14, Math.PI), pupilMat);
    smile.rotation.z = Math.PI; smile.position.set(0, eyeY - 0.13, faceZ + 0.01); g.add(smile);
  }

  /* Arms */
  const armY = (base + bodyTop) / 2;
  const sx = bodyW / 2 + 0.05;
  [-1, 1].forEach((s) => {
    if (d.arms === 'claws') {
      const a = m(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10), darkMat); a.rotation.z = s * 1.2; a.position.set(s * (sx + 0.1), armY, 0.05); g.add(a);
      const c1 = m(new THREE.ConeGeometry(0.06, 0.18, 8), accMat); c1.position.set(s * (sx + 0.27), armY + 0.1, 0.12); c1.rotation.x = 0.6; g.add(c1);
      const c2 = c1.clone(); c2.position.y = armY - 0.02; c2.rotation.x = 2.4; g.add(c2);
    } else if (d.arms === 'grabbers') {
      const up = m(new THREE.CapsuleGeometry(0.06, 0.2, 6, 10), darkMat); up.position.set(s * (sx + 0.06), armY - 0.05, 0); g.add(up);
      const hand = m(new THREE.SphereGeometry(0.09, 14, 10), accMat); hand.position.set(s * (sx + 0.06), armY - 0.25, 0.04); g.add(hand);
    } else if (d.arms === 'noodle') {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(s * sx, armY, 0), new THREE.Vector3(s * (sx + 0.2), armY + 0.15, 0.1), new THREE.Vector3(s * (sx + 0.3), armY - 0.05, 0.15), new THREE.Vector3(s * (sx + 0.35), armY + 0.1, 0.25)]);
      g.add(m(new THREE.TubeGeometry(curve, 20, 0.035, 8), accMat));
      const tip = m(new THREE.SphereGeometry(0.06, 10, 8), mat(primary)); tip.position.set(s * (sx + 0.35), armY + 0.1, 0.25); g.add(tip);
    } else if (d.arms === 'wings') {
      const wing = m(new THREE.BoxGeometry(0.45, 0.04, 0.3), accMat); wing.position.set(s * (sx + 0.2), armY + 0.12, -0.05); wing.rotation.z = s * 0.35; g.add(wing);
    } else if (d.arms === 'boosters') {
      const b = m(new THREE.CylinderGeometry(0.09, 0.09, 0.32, 14), mat(0xe2e8f0, 0.3, 0.8)); b.rotation.x = Math.PI / 2; b.position.set(s * (sx + 0.05), armY, -0.05); g.add(b);
      const f = m(new THREE.ConeGeometry(0.08, 0.2, 12), glow(0xf97316, 1.4)); f.rotation.x = -Math.PI / 2; f.position.set(s * (sx + 0.05), armY, -0.3); g.add(f);
    }
  });

  /* Top */
  const topY = headY + headH + (d.head === 'none' ? 0.18 : 0);
  if (d.top === 'antenna') {
    const p = m(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), darkMat); p.position.set(0, topY + 0.14, 0); g.add(p);
    const b = m(new THREE.SphereGeometry(0.065, 12, 10), glow(accent, 1.2)); b.position.set(0, topY + 0.31, 0); g.add(b);
  } else if (d.top === 'crown') {
    const c = m(new THREE.CylinderGeometry(0.18, 0.16, 0.12, 6, 1, true), mat(0xfacc15, 0.25, 0.9)); c.position.y = topY + 0.05; g.add(c);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const s = m(new THREE.ConeGeometry(0.04, 0.12, 6), mat(0xfacc15, 0.25, 0.9)); s.position.set(Math.cos(a) * 0.17, topY + 0.16, Math.sin(a) * 0.17); g.add(s); }
  } else if (d.top === 'cap') {
    const c = m(new THREE.SphereGeometry(0.25, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), accMat); c.position.y = topY - 0.04; g.add(c);
    const brim = m(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 20, 1, false, -Math.PI / 2, Math.PI), accMat); brim.position.set(0, topY - 0.03, 0.18); g.add(brim);
  } else if (d.top === 'horns') {
    [-1, 1].forEach((s) => { const h = m(new THREE.ConeGeometry(0.06, 0.26, 10), mat(0xfef3c7, 0.4, 0.1)); h.position.set(s * 0.15, topY + 0.1, 0); h.rotation.z = s * -0.35; g.add(h); });
  } else if (d.top === 'flower') {
    const st = m(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), mat(0x16a34a)); st.position.y = topY + 0.11; g.add(st);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const pe = m(new THREE.SphereGeometry(0.06, 10, 8), mat(0xf472b6)); pe.position.set(Math.cos(a) * 0.08, topY + 0.25, Math.sin(a) * 0.08); g.add(pe); }
    const c = m(new THREE.SphereGeometry(0.05, 10, 8), mat(0xfacc15)); c.position.y = topY + 0.25; g.add(c);
  }
  if (d.move === 'propeller') {
    const hub = m(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), darkMat); hub.position.y = topY + (d.top === 'none' ? 0.06 : 0.36); g.add(hub);
    [0, Math.PI / 2].forEach((r) => { const blade = m(new THREE.BoxGeometry(0.8, 0.02, 0.08), accMat); blade.position.y = hub.position.y + 0.06; blade.rotation.y = r; g.add(blade); });
  }
  g.userData.legs = legsParts;
  return g;
}
