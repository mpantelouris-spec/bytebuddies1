/**
 * Birdbot — a streamlined robot bird.
 *
 * Painted-metal teardrop body (your Body colour) with a lighter belly plate; a dark glass visor with two glowing eyes; a
 * two-part steel beak; swept crest fins; articulated wings built from
 * overlapping metal feathers with thruster pods; and a fanned tail. It perches
 * on a small stand in the builder (hidden in flight).
 *
 * Faces +Z, up is +Y. userData: wingL / wingR (flap on rotation.z),
 * flappyHideParts (the stand), animate(t) for the idle loop.
 */
import * as THREE from 'three';

const noPaint = (m) => { m.userData.skipStudioPaint = true; return m; };

function paint(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.28, metalness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.18, ...opts,
  });
}
const steel = (color = 0x9aa3ad, rough = 0.3) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.9 });
const glow = (color) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.8, roughness: 0.2 });

function mesh(geo, material, { pos, rot, scale, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/** Streamlined body: a lathed teardrop, round at the head and tapering to the tail. */
function bodyGeometry() {
  const pts = [];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 = tail tip, 1 = nose
    const r = Math.sin(Math.pow(t, 1.45) * Math.PI) * 0.4 + 0.012; // widest just behind the head
    pts.push(new THREE.Vector2(r, (t - 0.5) * 1.3));
  }
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.rotateX(Math.PI / 2); // lathe axis Y → body axis Z (nose at +Z)
  return geo;
}

/** One feather plate: a long rounded blade, thin and slightly curved. */
function featherGeometry(len, width) {
  const s = new THREE.Shape();
  s.moveTo(0, -width / 2);
  s.lineTo(len * 0.78, -width * 0.42);
  s.quadraticCurveTo(len, 0, len * 0.78, width * 0.42);
  s.lineTo(0, width / 2);
  s.quadraticCurveTo(-width * 0.3, 0, 0, -width / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 10 });
  geo.translate(0, 0, -0.0125);
  return geo;
}

function buildWing(side, primary, accent) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.28, 0.9, 0.08);
  // Raised a little (dihedral) so the wings read as wings, not aeroplane stubs
  const arm = new THREE.Group();
  arm.rotation.z = side * 0.28;
  pivot.add(arm);
  const bodyPaint = paint(primary);
  const tipPaint = paint(accent);
  arm.add(noPaint(mesh(new THREE.SphereGeometry(0.075, 16, 12), steel(0x6b7480))));
  // Covert: a rounded plate that hides the feather roots
  arm.add(mesh(new THREE.SphereGeometry(0.2, 20, 12), bodyPaint, { pos: [side * 0.16, 0, -0.05], scale: [1.1, 0.22, 0.85] }));
  // Feathers fan from the shoulder: long primaries at the front, shorter ones swept back
  const feathers = [
    [0.86, 0.17, 0.08], [0.8, 0.16, 0.3], [0.72, 0.15, 0.52], [0.62, 0.14, 0.74], [0.52, 0.13, 0.96], [0.42, 0.12, 1.16],
  ];
  feathers.forEach(([len, width, sweep], i) => {
    const f = mesh(featherGeometry(len, width), i < 2 ? tipPaint : bodyPaint, {
      pos: [side * 0.08, -0.008 * i, -0.02 * i],
      rot: [Math.PI / 2, 0, side > 0 ? -sweep : Math.PI + sweep],
    });
    if (i < 2) noPaint(f);
    arm.add(f);
  });
  // Thruster pod under the wing
  arm.add(noPaint(mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.24, 16), steel(0x5c6570, 0.35), {
    pos: [side * 0.24, -0.08, -0.04], rot: [Math.PI / 2, 0, 0],
  })));
  const flame = noPaint(mesh(new THREE.CylinderGeometry(0.042, 0.018, 0.1, 12), glow(0x5ff5ff), {
    pos: [side * 0.24, -0.08, -0.2], rot: [Math.PI / 2, 0, 0], shadow: false,
  }));
  flame.userData.isLed = true;
  arm.add(flame);
  return { pivot, flame };
}

export function buildBirdBotModel(primary = '#e52222', accent = '#fbbf24') {
  const g = new THREE.Group();
  g.name = 'BirdBot';
  const bodyPaint = paint(primary);
  const bellyPaint = paint(new THREE.Color(primary).lerp(new THREE.Color(0xffffff), 0.72));
  const accentPaint = paint(accent);
  const dark = steel(0x2b313a, 0.35);

  // ── Perch stand (builder only) ───────────────────────────────────────────
  const stand = new THREE.Group();
  stand.name = 'BirdBotStand';
  stand.add(noPaint(mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.08, 32), dark, { pos: [0, 0.04, 0] })));
  stand.add(noPaint(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 12), steel(), { pos: [0, 0.25, 0] })));
  stand.add(noPaint(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 12), steel(), { pos: [0, 0.42, 0], rot: [0, 0, Math.PI / 2] })));
  g.add(stand);

  // ── Body ─────────────────────────────────────────────────────────────────
  const body = new THREE.Group();
  body.position.set(0, 0.86, 0);
  g.add(body);
  body.add(mesh(bodyGeometry(), bodyPaint, { scale: [1, 0.95, 1] }));
  // Lighter belly plate hugging the underside
  body.add(noPaint(mesh(bodyGeometry(), bellyPaint, { pos: [0, -0.045, 0], scale: [0.9, 0.84, 0.9] })));

  // ── Head: visor, eyes, beak, crest ───────────────────────────────────────
  const visor = noPaint(mesh(
    new THREE.SphereGeometry(0.3, 32, 16, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.3, Math.PI * 0.22), // arc centred on +Z
    new THREE.MeshPhysicalMaterial({ color: 0x0b1320, roughness: 0.08, metalness: 0.4, clearcoat: 1 }),
    { pos: [0, 0.03, 0.3], scale: [1.08, 1, 1.02], shadow: false },
  ));
  body.add(visor);
  const eyeMat = glow(0x5ff5ff);
  const eyes = [-1, 1].map((s) => {
    const e = noPaint(mesh(new THREE.SphereGeometry(0.062, 16, 12), eyeMat.clone(), { pos: [s * 0.12, 0.1, 0.56], scale: [1.25, 0.85, 0.5], shadow: false }));
    e.userData.isLed = true;
    body.add(e);
    return e;
  });
  // Two-part beak: upper hooked blade over a shorter lower jaw
  body.add(noPaint(mesh(new THREE.ConeGeometry(0.1, 0.34, 20), steel(0x39414b, 0.25), { pos: [0, -0.02, 0.72], rot: [Math.PI / 2, 0, 0], scale: [1, 0.55, 1] })));
  body.add(noPaint(mesh(new THREE.ConeGeometry(0.075, 0.22, 16), accentPaint, { pos: [0, -0.08, 0.66], rot: [Math.PI / 2, 0, 0], scale: [1, 0.45, 1] })));
  // Crest: three swept fins
  [0, 1, 2].forEach((i) => {
    const fin = noPaint(mesh(featherGeometry(0.3 - i * 0.06, 0.08), accentPaint, {
      pos: [0, 0.34 - i * 0.02, 0.28 - i * 0.1], rot: [0, -Math.PI / 2, Math.PI / 2 + 0.55 + i * 0.12],
    }));
    body.add(fin);
  });

  // ── Wings ────────────────────────────────────────────────────────────────
  const L = buildWing(-1, primary, accent);
  const R = buildWing(1, primary, accent);
  g.add(L.pivot, R.pivot);

  // ── Tail fan ─────────────────────────────────────────────────────────────
  const tail = new THREE.Group();
  tail.position.set(0, 0.9, -0.6);
  g.add(tail);
  [-2, -1, 0, 1, 2].forEach((k) => {
    const f = mesh(featherGeometry(0.44 - Math.abs(k) * 0.04, 0.12), Math.abs(k) === 2 ? accentPaint : bodyPaint, {
      rot: [Math.PI / 2 - 0.18, 0, -Math.PI / 2 + k * 0.22],
    });
    if (Math.abs(k) === 2) noPaint(f);
    tail.add(f);
  });

  // ── Tucked legs with three-toed feet ─────────────────────────────────────
  [-1, 1].forEach((s) => {
    const leg = new THREE.Group();
    leg.position.set(s * 0.12, 0.52, 0.06);
    leg.add(noPaint(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.14, 8), steel(), { pos: [0, -0.02, 0] })));
    [-0.45, 0, 0.45].forEach((a) => {
      leg.add(noPaint(mesh(new THREE.CylinderGeometry(0.016, 0.01, 0.12, 6), steel(0x6b7480), {
        pos: [Math.sin(a) * 0.05, -0.09, Math.cos(a) * 0.05], rot: [Math.PI / 2 - 0.3, a, 0],
      })));
    });
    g.add(leg);
  });

  g.userData.wingL = L.pivot;
  g.userData.wingR = R.pivot;
  g.userData.flappyHideParts = [stand];
  g.userData.isBirdBot = true;

  g.userData.animate = (t) => {
    // Idle: gentle hover bob, slow wing breathing, blinking eyes, thruster flicker
    body.position.y = 0.86 + Math.sin(t * 2.4) * 0.015;
    L.pivot.rotation.z = Math.sin(t * 2.4) * 0.12;
    R.pivot.rotation.z = -Math.sin(t * 2.4) * 0.12;
    const blink = t % 4 < 0.12 ? 0.15 : 1;
    eyes.forEach((e) => { e.scale.y = 0.8 * blink; });
    [L.flame, R.flame].forEach((f, i) => { f.material.emissiveIntensity = 1.5 + Math.sin(t * 18 + i) * 0.4; });
    tail.rotation.x = Math.sin(t * 1.6) * 0.05;
  };
  return g;
}
