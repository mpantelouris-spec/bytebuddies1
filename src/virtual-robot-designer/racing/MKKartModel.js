/**
 * MKKartModel.js — console-kart style go-karts with ByteBuddies robot drivers.
 *
 * Every kart faces +Z and sits on y = 0. Four body styles and three drivers so the
 * grid never looks like clones:
 *   standard  — classic open tub, raised nose, rear wing, chrome exhausts
 *   speedster — long pointed F1-style nose, front + rear wings, low stance
 *   buggy     — tube roll cage, big knobbly tyres, bull bar, roof lights
 *   bubble    — round pod body with fins and a clear bubble canopy
 * Drivers: helmet (round visor), boxy (square screen-face bot), dome (glass-dome bot).
 * Wheels are tagged `isWheel` so the race code can spin them and plant the kart.
 */
import * as THREE from 'three';

let paintCache = new Map();
function paint(color, { clear = 1, rough = 0.28, metal = 0.1 } = {}) {
  const key = `${color}|${clear}|${rough}|${metal}`;
  if (!paintCache.has(key)) {
    paintCache.set(key, new THREE.MeshPhysicalMaterial({
      color, roughness: rough, metalness: metal, clearcoat: clear, clearcoatRoughness: 0.08,
    }));
  }
  return paintCache.get(key);
}
const std = (color, rough = 0.6, metal = 0.1, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

const CHROME = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.12, metalness: 1 });
const DARK = std(0x2a2d34, 0.5, 0.35);
const SEAT = std(0x24262c, 0.7, 0.05);

// ── Wheels ───────────────────────────────────────────────────────────────────
/** Rounded-shoulder tyre, lathed about X. */
function tyre(radius, width, knobbly = false) {
  const pts = [];
  const r0 = radius * 0.62;
  const shoulder = Math.min(width * 0.28, radius * 0.25);
  pts.push(new THREE.Vector2(r0, -width / 2));
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI / 2;
    pts.push(new THREE.Vector2(radius - shoulder + Math.sin(a) * shoulder, -width / 2 + shoulder - Math.cos(a) * shoulder));
  }
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI / 2;
    pts.push(new THREE.Vector2(radius - shoulder + Math.cos(a) * shoulder, width / 2 - shoulder + Math.sin(a) * shoulder));
  }
  pts.push(new THREE.Vector2(r0, width / 2));
  const g = new THREE.LatheGeometry(pts, knobbly ? 36 : 28);
  if (knobbly) {
    // chunky tread blocks: push every other ring of lathe columns outward
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const rr = Math.hypot(x, z);
      if (rr > radius * 0.9) {
        const a = Math.atan2(z, x);
        const bump = Math.sin(a * 18) > 0.2 ? 1.06 : 1;
        p.setX(i, x * bump);
        p.setZ(i, z * bump);
      }
    }
    g.computeVertexNormals();
  }
  g.rotateZ(Math.PI / 2);
  return g;
}

function kartWheel(radius, width, hubColor, side, tyreColor, knobbly = false) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(tyre(radius, width, knobbly), std(tyreColor, 0.82, 0.02)));
  if (!knobbly) {
    for (const x of [-width * 0.18, width * 0.18]) {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.995, radius * 0.03, 6, 28), std(0x0e0f12, 0.9));
      groove.rotation.y = Math.PI / 2;
      groove.position.x = x;
      g.add(groove);
    }
  }
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, width * 0.9, 20), paint(hubColor, { rough: 0.3, metal: 0.3 }));
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.2, 14, 10), CHROME);
  cap.scale.x = 0.6;
  cap.position.x = side * width * 0.46;
  g.add(cap);
  for (let k = 0; k < 5; k++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.02, radius * 0.95, radius * 0.12), CHROME);
    sp.position.x = side * width * 0.45;
    sp.rotation.x = (k / 5) * Math.PI;
    g.add(sp);
  }
  g.userData.isWheel = true;
  g.traverse((c) => { if (c.isMesh) c.userData.isWheel = true; });
  return g;
}

function addWheels(g, spec, hub, tyreColor) {
  spec.forEach(([side, x, z, r, w, knob]) => {
    const wh = kartWheel(r, w, hub, side, tyreColor, knob);
    wh.position.set(side * x, r, z);
    g.add(wh);
  });
}

// ── Shared bits ──────────────────────────────────────────────────────────────
function tubGeometry(len = 1, width = 1) {
  const s = new THREE.Shape();
  s.moveTo(-0.34, 0.98);
  s.quadraticCurveTo(0, 1.08, 0.34, 0.98);
  s.lineTo(0.5, 0.38);
  s.quadraticCurveTo(0.62, 0.1, 0.6, -0.2);
  s.lineTo(0.56, -0.72);
  s.quadraticCurveTo(0.54, -0.9, 0.36, -0.92);
  s.lineTo(-0.36, -0.92);
  s.quadraticCurveTo(-0.54, -0.9, -0.56, -0.72);
  s.lineTo(-0.6, -0.2);
  s.quadraticCurveTo(-0.62, 0.1, -0.5, 0.38);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.3, 0.12);
  hole.quadraticCurveTo(0, 0.24, 0.3, 0.12);
  hole.lineTo(0.32, -0.62);
  hole.lineTo(-0.32, -0.62);
  hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 16 });
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI);
  g.scale(width, 1, len);
  return g;
}

function numberPlate(number, accent) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.beginPath(); x.arc(64, 64, 60, 0, Math.PI * 2); x.fill();
  x.lineWidth = 10; x.strokeStyle = `#${new THREE.Color(accent).getHexString()}`; x.stroke();
  x.fillStyle = '#1a1a1a';
  x.font = '900 76px Arial Black, Arial, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(String(number), 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }));
}

function seatAndWheel(g, { seatZ = -0.5, wheelZ = 0.22, y = 0 } = {}) {
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.12), SEAT);
  seat.position.set(0, 0.62 + y, seatZ);
  seat.rotation.x = -0.25;
  g.add(seat);
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.4), SEAT);
  seatBase.position.set(0, 0.38 + y, seatZ + 0.18);
  g.add(seatBase);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), CHROME);
  col.position.set(0, 0.58 + y, wheelZ + 0.1);
  col.rotation.x = 0.9;
  g.add(col);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 10, 24), DARK);
  sw.position.set(0, 0.69 + y, wheelZ);
  sw.rotation.x = 0.55;
  g.add(sw);
}

function exhausts(g, z = -1.06, y = 0.58, spread = 0.16) {
  for (const side of [-1, 1]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.42, 14, 1, true), CHROME);
    pipe.position.set(side * spread, y, z);
    pipe.rotation.x = -1.0;
    g.add(pipe);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.05, 14), new THREE.MeshBasicMaterial({ color: 0xff8a2a }));
    glow.position.set(side * spread, y + 0.11, z - 0.18);
    glow.rotation.x = 2.1;
    g.add(glow);
  }
}

function rearWing(g, P, { y = 0.98, z = -0.98, span = 1.0, depth = 0.26 } = {}) {
  const wing = new THREE.Mesh(new THREE.BoxGeometry(span, 0.05, depth), P.accent);
  wing.position.set(0, y, z);
  wing.rotation.x = 0.12;
  g.add(wing);
  for (const side of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, depth + 0.04), P.body);
    end.position.set(side * span / 2, y - 0.03, z);
    g.add(end);
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.04, y - 0.56, 0.06), DARK);
    strut.position.set(side * 0.2, (y + 0.56) / 2, z + 0.02);
    g.add(strut);
  }
}

// ── Body styles ──────────────────────────────────────────────────────────────
const STYLES = {
  standard(g, P) {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.7), DARK);
    pan.position.y = 0.2;
    g.add(pan);
    const tub = new THREE.Mesh(tubGeometry(), P.body);
    tub.position.y = 0.2;
    g.add(tub);
    const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), P.body);
    cowl.scale.set(0.95, 0.4, 1.3);
    cowl.position.set(0, 0.46, 0.48);
    g.add(cowl);
    const plate = numberPlate(P.number, P.accentColor);
    plate.position.set(0, 0.555, 0.84);
    plate.rotation.x = -1.0;
    g.add(plate);
    const bumper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.5, 4, 12), DARK);
    bumper.rotation.z = Math.PI / 2;
    bumper.position.set(0, 0.26, 0.98);
    g.add(bumper);
    for (const side of [-1, 1]) {
      const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.62, 6, 14), P.accent);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(side * 0.62, 0.3, -0.05);
      g.add(pod);
    }
    seatAndWheel(g);
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.3), DARK);
    engine.position.set(0, 0.46, -0.86);
    g.add(engine);
    exhausts(g);
    rearWing(g, P);
    addWheels(g, [
      [-1, 0.66, 0.64, 0.28, 0.24], [1, 0.66, 0.64, 0.28, 0.24],
      [-1, 0.72, -0.66, 0.34, 0.36], [1, 0.72, -0.66, 0.34, 0.36],
    ], P.hub, P.tyre);
    return { driverY: 0, driverZ: 0 };
  },

  speedster(g, P) {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 2.1), DARK);
    pan.position.set(0, 0.17, 0);
    g.add(pan);
    const tub = new THREE.Mesh(tubGeometry(1.15, 0.82), P.body);
    tub.position.y = 0.16;
    g.add(tub);
    // long pointed nose cone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.0, 20, 1), P.body);
    nose.rotation.x = Math.PI / 2;
    nose.scale.set(1.4, 0.7, 1);
    nose.position.set(0, 0.36, 1.2);
    g.add(nose);
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), P.accent);
    noseTip.position.set(0, 0.36, 1.7);
    g.add(noseTip);
    // front wing
    const fw = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.26), P.accent);
    fw.position.set(0, 0.2, 1.55);
    g.add(fw);
    for (const side of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.3), P.body);
      end.position.set(side * 0.65, 0.24, 1.55);
      g.add(end);
      // side intakes
      const intake = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 6, 12), P.body);
      intake.rotation.x = Math.PI / 2;
      intake.position.set(side * 0.46, 0.34, -0.25);
      g.add(intake);
      const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), DARK);
      mouth.position.set(side * 0.46, 0.34, 0.1);
      g.add(mouth);
    }
    const plate = numberPlate(P.number, P.accentColor);
    plate.scale.setScalar(0.9);
    plate.position.set(0, 0.47, 0.95);
    plate.rotation.x = -1.3;
    g.add(plate);
    seatAndWheel(g, { seatZ: -0.55, wheelZ: 0.16, y: -0.05 });
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.5, 16), DARK);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(0, 0.42, -1.0);
    g.add(engine);
    exhausts(g, -1.28, 0.5, 0.1);
    rearWing(g, P, { y: 1.02, z: -1.2, span: 1.1, depth: 0.32 });
    addWheels(g, [
      [-1, 0.68, 0.95, 0.27, 0.26], [1, 0.68, 0.95, 0.27, 0.26],
      [-1, 0.72, -0.82, 0.33, 0.4], [1, 0.72, -0.82, 0.33, 0.4],
    ], P.hub, P.tyre);
    return { driverY: -0.05, driverZ: -0.04 };
  },

  buggy(g, P) {
    const lift = 0.14;
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 1.7), DARK);
    pan.position.set(0, 0.3 + lift, 0);
    g.add(pan);
    const tub = new THREE.Mesh(tubGeometry(0.95, 0.95), P.body);
    tub.position.y = 0.28 + lift;
    g.add(tub);
    // roll cage
    const bar = (a, b, r = 0.035) => {
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), P.cage);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.lookAt(b);
      m.rotateX(Math.PI / 2);
      g.add(m);
    };
    const y0 = 0.45 + lift, y1 = 1.45 + lift;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    for (const s of [-1, 1]) {
      bar(V(s * 0.42, y0, 0.25), V(s * 0.34, y1, -0.05));
      bar(V(s * 0.42, y0, -0.75), V(s * 0.34, y1, -0.55));
      bar(V(s * 0.34, y1, -0.05), V(s * 0.34, y1, -0.55));
    }
    bar(V(-0.34, y1, -0.05), V(0.34, y1, -0.05));
    bar(V(-0.34, y1, -0.55), V(0.34, y1, -0.55));
    // roof light bar
    for (const x of [-0.2, 0, 0.2]) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 14), std(0xfff6d0, 0.2, 0, { emissive: 0xfff1b0, emissiveIntensity: 1.2 }));
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(x, y1 + 0.05, -0.02);
      g.add(lamp);
    }
    // bull bar + grille
    bar(V(-0.4, 0.34 + lift, 1.0), V(0.4, 0.34 + lift, 1.0), 0.045);
    bar(V(-0.3, 0.2 + lift, 0.95), V(-0.3, 0.55 + lift, 1.0), 0.04);
    bar(V(0.3, 0.2 + lift, 0.95), V(0.3, 0.55 + lift, 1.0), 0.04);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.5), P.body);
    hood.position.set(0, 0.52 + lift, 0.62);
    hood.rotation.x = 0.12;
    g.add(hood);
    const plate = numberPlate(P.number, P.accentColor);
    plate.position.set(0, 0.62 + lift, 0.86);
    plate.rotation.x = -0.5;
    g.add(plate);
    seatAndWheel(g, { y: lift });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.34), DARK);
    engine.position.set(0, 0.6 + lift, -0.86);
    g.add(engine);
    exhausts(g, -1.06, 0.72 + lift, 0.2);
    // whip flag
    const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 6), DARK);
    whip.position.set(0.34, y1 + 0.45, -0.55);
    g.add(whip);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), new THREE.MeshStandardMaterial({ color: P.accentColor, side: THREE.DoubleSide }));
    flag.position.set(0.48, y1 + 0.8, -0.55);
    g.add(flag);
    addWheels(g, [
      [-1, 0.74, 0.68, 0.38, 0.32, true], [1, 0.74, 0.68, 0.38, 0.32, true],
      [-1, 0.76, -0.66, 0.4, 0.36, true], [1, 0.76, -0.66, 0.4, 0.36, true],
    ], P.hub, P.tyre);
    return { driverY: lift, driverZ: 0 };
  },

  bubble(g, P) {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 1.5), DARK);
    pan.position.y = 0.18;
    g.add(pan);
    // round pod body with a cockpit cut out of the top
    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.72, 40, 24, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.64), P.body);
    pod.scale.set(0.95, 0.62, 1.35);
    pod.position.set(0, 0.62, 0);
    g.add(pod);
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.04, 10, 48), P.accent);
    rimRing.rotation.x = Math.PI / 2;
    rimRing.scale.set(0.95, 1.35, 1);
    rimRing.position.set(0, 0.8, 0);
    g.add(rimRing);
    // clear bubble canopy over the front of the cockpit
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 16, Math.PI * 0.15, Math.PI * 0.7, 0, Math.PI * 0.45),
      new THREE.MeshPhysicalMaterial({ color: 0xcfefff, roughness: 0.02, metalness: 0, transmission: 0.9, transparent: true, opacity: 0.35, thickness: 0.05 }),
    );
    canopy.position.set(0, 0.85, 0.12);
    g.add(canopy);
    // tail fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(-0.46, 0);
    finShape.quadraticCurveTo(-0.5, 0.3, -0.34, 0.42);
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
    finGeo.rotateY(-Math.PI / 2); // sweep back from the cockpit rim
    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(finGeo, P.accent);
      fin.position.set(side * 0.3, 0.8, -0.5);
      fin.rotation.z = side * -0.25;
      g.add(fin);
    }
    // headlight eyes on the nose
    for (const x of [-0.26, 0.26]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), std(0xfffbe6, 0.1, 0, { emissive: 0xfff4c0, emissiveIntensity: 1.0 }));
      hl.position.set(x, 0.6, 0.9);
      hl.scale.z = 0.5;
      g.add(hl);
    }
    const plate = numberPlate(P.number, P.accentColor);
    plate.position.set(0, 0.46, 0.97);
    plate.rotation.x = -0.25;
    g.add(plate);
    seatAndWheel(g, { seatZ: -0.42, wheelZ: 0.26, y: 0.06 });
    exhausts(g, -1.0, 0.44, 0.22);
    addWheels(g, [
      [-1, 0.62, 0.58, 0.26, 0.24], [1, 0.62, 0.58, 0.26, 0.24],
      [-1, 0.66, -0.58, 0.3, 0.3], [1, 0.66, -0.58, 0.3, 0.3],
    ], P.hub, P.tyre);
    return { driverY: 0.06, driverZ: 0.06 };
  },
};

// ── Drivers ──────────────────────────────────────────────────────────────────
function driverBody(d, suit, white) {
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.22, 6, 16), suit);
  torso.position.set(0, 0.62, -0.28);
  torso.rotation.x = -0.18;
  d.add(torso);
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Vector3(side * 0.2, 0.74, -0.24);
    const hand = new THREE.Vector3(side * 0.13, 0.66, 0.22);
    const len = shoulder.distanceTo(hand);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, len - 0.06, 4, 10), suit);
    arm.position.copy(shoulder).add(hand).multiplyScalar(0.5);
    arm.lookAt(hand);
    arm.rotateX(Math.PI / 2);
    d.add(arm);
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), white);
    glove.position.copy(hand);
    d.add(glove);
  }
}

const DRIVERS = {
  helmet(d, P) {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 28, 20), P.white);
    head.scale.set(1, 0.95, 1.02);
    head.position.set(0, 1.02, -0.3);
    d.add(head);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.028, 8, 32, Math.PI), P.body);
    stripe.rotation.set(0, Math.PI / 2, 0);
    stripe.position.copy(head.position);
    d.add(stripe);
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.262, 32, 16, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.3, Math.PI * 0.3),
      new THREE.MeshPhysicalMaterial({ color: 0x12182a, roughness: 0.05, metalness: 0.2, clearcoat: 1 }),
    );
    visor.position.copy(head.position);
    visor.scale.copy(head.scale);
    d.add(visor);
    for (const x of [-0.075, 0.075]) {
      const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.035, 4, 10), P.eye);
      eye.position.set(x, head.position.y + 0.035, head.position.z + 0.262);
      d.add(eye);
    }
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), CHROME);
    ant.position.set(0.1, 1.28, -0.32);
    ant.rotation.z = -0.25;
    d.add(ant);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), std(P.bodyColor, 0.3, 0, { emissive: P.bodyColor, emissiveIntensity: 0.8 }));
    bulb.position.set(0.12, 1.37, -0.32);
    d.add(bulb);
  },

  boxy(d, P) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.36, 0.4, 2, 2, 2), P.white);
    head.position.set(0, 1.02, -0.3);
    d.add(head);
    // rounded feel: bevel edges with thin frame
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), new THREE.MeshPhysicalMaterial({ color: 0x0c1220, roughness: 0.1, clearcoat: 1 }));
    screen.position.set(0, 1.02, -0.099);
    d.add(screen);
    // pixel-smile face
    const px = (x, y, w = 0.035, h = 0.035) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), P.eye);
      m.position.set(x, y, -0.097);
      d.add(m);
    };
    px(-0.08, 1.06, 0.05, 0.06); px(0.08, 1.06, 0.05, 0.06);
    [-0.06, -0.02, 0.02, 0.06].forEach((x, i) => px(x, 0.965 + (i === 0 || i === 3 ? 0.02 : 0), 0.035, 0.025));
    // ear bolts
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 14), P.accent);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(s * 0.25, 1.02, -0.3);
      d.add(ear);
    }
    // twin antennae
    for (const s of [-1, 1]) {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), CHROME);
      ant.position.set(s * 0.12, 1.28, -0.3);
      ant.rotation.z = s * 0.3;
      d.add(ant);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), std(P.accentColor, 0.3, 0, { emissive: P.accentColor, emissiveIntensity: 0.9 }));
      tip.position.set(s * 0.15, 1.37, -0.3);
      d.add(tip);
    }
  },

  dome(d, P) {
    // metal collar + glass dome with a glowing core and one big eye
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 24), P.accent);
    collar.position.set(0, 0.9, -0.3);
    d.add(collar);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), P.white);
    core.position.set(0, 1.06, -0.3);
    d.add(core);
    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 10, 24), DARK);
    eyeRing.position.set(0, 1.08, -0.15);
    d.add(eyeRing);
    const eye = new THREE.Mesh(new THREE.CircleGeometry(0.062, 24), P.eye);
    eye.position.set(0, 1.08, -0.148);
    d.add(eye);
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 32, 20),
      new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, roughness: 0.02, metalness: 0, transmission: 0.95, transparent: true, opacity: 0.28, thickness: 0.04 }),
    );
    glass.position.set(0, 1.07, -0.3);
    d.add(glass);
    const spin = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 12), P.body);
    spin.position.set(0, 1.37, -0.3);
    d.add(spin);
  },
};

function buildDriver(kind, P, offset) {
  const d = new THREE.Group();
  d.name = 'kart-driver';
  driverBody(d, P.suit, P.white);
  const chest = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), P.eye);
  chest.position.set(0, 0.7, -0.08);
  chest.rotation.x = -0.18;
  d.add(chest);
  (DRIVERS[kind] || DRIVERS.helmet)(d, P);
  d.position.set(0, offset.driverY || 0, offset.driverZ || 0);
  return d;
}

export const KART_STYLES = Object.keys(STYLES);
export const KART_DRIVERS = Object.keys(DRIVERS);

/**
 * @param {object} o
 * @param {string|number} o.body    main paint
 * @param {string|number} o.accent  trim / driver suit
 * @param {string} [o.style]        standard | speedster | buggy | bubble
 * @param {string} [o.driver]       helmet | boxy | dome
 * @param {string|number} [o.tyre]  tyre colour
 * @param {string|number} [o.eyes]  driver eye / LED colour
 * @param {number} [o.number]       race number
 */
export function buildMKKart({
  body = '#ff8c00', accent = '#ffd700', style = 'standard', driver = 'helmet',
  tyre = 0x1b1c20, eyes = 0x7ff6ff, number = 1,
} = {}) {
  paintCache = new Map(); // every kart owns its paint, so per-kart tweaks never bleed across the grid
  const g = new THREE.Group();
  g.name = 'mk-kart';
  const P = {
    body: paint(body),
    accent: paint(accent, { rough: 0.3 }),
    suit: paint(accent, { rough: 0.45, clear: 0.4 }),
    white: paint(0xf6f7fb, { rough: 0.3 }),
    cage: new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.35, metalness: 0.8 }),
    eye: new THREE.MeshBasicMaterial({ color: eyes, side: THREE.DoubleSide }),
    bodyColor: body,
    accentColor: accent,
    hub: accent,
    tyre,
    number,
  };
  const offset = (STYLES[style] || STYLES.standard)(g, P) || {};
  g.add(buildDriver(driver, P, offset));
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.userData.isMKKart = true;
  g.userData.kartStyle = style;
  g.userData.skipStudioPaint = true;
  return g;
}

/** The kart each chassis drives, so rover and scout never look alike. */
export const CHASSIS_KART = {
  rover: { style: 'standard', driver: 'helmet' },
  scout: { style: 'speedster', driver: 'boxy' },
};
