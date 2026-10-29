/**
 * Outfits for the fighting worlds: a weapon in the right hand, something in the left
 * (shield, spell orb), headgear, and body colours. Items hang off the hand and head
 * bones, so a sword follows every swing the boxer animations make.
 *
 *   knight · orc · samurai · ninja · pirate · skeleton · wizard · darkwizard ·
 *   laserknight · droid · dummy
 */
import * as THREE from 'three';

const std = (color, metal = 0.3, rough = 0.5, emissive = null, ei = 0) => new THREE.MeshStandardMaterial({
  color, metalness: metal, roughness: rough, ...(emissive != null ? { emissive, emissiveIntensity: ei } : {}),
});
const glow = (color) => new THREE.MeshBasicMaterial({ color });
const part = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.userData.skipBounds = true;
  return m;
};

/* ── Hand items (built pointing up the glove's +y: blades come out of the thumb side of the fist) ── */

function sword({ blade = 0xdfe6ee, guard = 0xd4a017, grip = 0x5b3a1e, length = 0.78, width = 0.05 } = {}) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), std(grip, 0.1, 0.8)));
  g.add(part(new THREE.SphereGeometry(0.032, 10, 8), std(guard, 0.8, 0.3), 0, -0.09, 0));
  g.add(part(new THREE.BoxGeometry(0.2, 0.03, 0.04), std(guard, 0.8, 0.3), 0, 0.09, 0));
  g.add(part(new THREE.BoxGeometry(width, length, 0.014), std(blade, 0.9, 0.18), 0, 0.1 + length / 2, 0));
  const tip = part(new THREE.ConeGeometry(width * 0.7, 0.09, 4), std(blade, 0.9, 0.18), 0, 0.1 + length + 0.045, 0);
  tip.rotation.y = Math.PI / 4;
  tip.scale.z = 0.3;
  g.add(tip);
  return g;
}

function katana({ blade = 0xeef2f7, grip = 0x111111 } = {}) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8), std(grip, 0.1, 0.7), 0, -0.02, 0));
  g.add(part(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 16), std(0x9a7b2f, 0.8, 0.3), 0, 0.11, 0));
  // Slight curve: two blade halves, the top one tipped back
  const low = part(new THREE.BoxGeometry(0.034, 0.48, 0.01), std(blade, 0.95, 0.12), 0, 0.36, 0);
  const high = part(new THREE.BoxGeometry(0.03, 0.42, 0.01), std(blade, 0.95, 0.12), -0.02, 0.8, 0);
  high.rotation.z = 0.08;
  g.add(low, high);
  return g;
}

function cutlass() {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8), std(0x3b2414, 0.1, 0.8)));
  const hilt = part(new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI), std(0xd4a017, 0.8, 0.3), 0, 0.02, 0.03);
  hilt.rotation.y = Math.PI / 2;
  g.add(hilt);
  const b1 = part(new THREE.BoxGeometry(0.07, 0.36, 0.012), std(0xd7dde4, 0.9, 0.2), 0, 0.27, 0);
  const b2 = part(new THREE.BoxGeometry(0.07, 0.3, 0.012), std(0xd7dde4, 0.9, 0.2), -0.035, 0.58, 0);
  b2.rotation.z = 0.25;
  g.add(b1, b2);
  return g;
}

function axe() {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.024, 0.026, 0.95, 8), std(0x5b3a1e, 0.05, 0.85), 0, 0.3, 0));
  const head = part(new THREE.BoxGeometry(0.26, 0.2, 0.03), std(0x9ca3af, 0.85, 0.3), 0.12, 0.66, 0);
  g.add(head);
  g.add(part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12, 1, false, 0, Math.PI), std(0xc0c7d0, 0.9, 0.2), 0.24, 0.66, 0));
  g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  return g;
}

function laserSword(color) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.026, 0.026, 0.22, 12), std(0x9ca3af, 0.9, 0.25)));
  g.add(part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), std(0x111827, 0.6, 0.3), 0, 0.11, 0));
  g.add(part(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 10), glow(color), 0, 0.58, 0));
  const halo = part(new THREE.CylinderGeometry(0.045, 0.045, 0.92, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, depthWrite: false }), 0, 0.58, 0);
  g.add(halo);
  return g;
}

function staff(orb) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.022, 0.026, 1.25, 8), std(0x6b4423, 0.05, 0.85), 0, 0.3, 0));
  g.add(part(new THREE.TorusGeometry(0.07, 0.014, 6, 14), std(0xd4a017, 0.8, 0.3), 0, 0.95, 0));
  g.add(part(new THREE.SphereGeometry(0.075, 16, 12), glow(orb), 0, 0.98, 0));
  return g;
}

function shield({ face = 0x1e40af, rim = 0xd4a017, emblem = 0xf8fafc } = {}) {
  const g = new THREE.Group();
  const disc = part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 28), std(face, 0.35, 0.45));
  disc.rotation.z = Math.PI / 2;
  g.add(disc);
  const ring = part(new THREE.TorusGeometry(0.3, 0.022, 8, 28), std(rim, 0.85, 0.3));
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const v = part(new THREE.BoxGeometry(0.05, 0.36, 0.06), std(emblem, 0.3, 0.4), -0.025, 0, 0);
  const h = part(new THREE.BoxGeometry(0.05, 0.06, 0.36), std(emblem, 0.3, 0.4), -0.025, 0.04, 0);
  g.add(v, h);
  g.position.x = -0.12; // on the outside of the left forearm
  return g;
}

function orb(color) {
  const g = new THREE.Group();
  g.add(part(new THREE.SphereGeometry(0.09, 16, 12), glow(color), 0, 0.1, 0.02));
  g.add(part(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false }), 0, 0.1, 0.02));
  return g;
}

/* ── Headgear (built on the head bone, y up from the neck) ── */

function knightHelmet() {
  const g = new THREE.Group();
  const dome = part(new THREE.SphereGeometry(0.2, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), std(0xcbd5e1, 0.9, 0.25), 0, 0.2, 0);
  dome.scale.set(1.05, 1.1, 1.08);
  g.add(dome);
  g.add(part(new THREE.BoxGeometry(0.3, 0.025, 0.05), std(0x1f2937, 0.4, 0.5), 0, 0.2, 0.2));
  const plume = part(new THREE.ConeGeometry(0.05, 0.28, 10), std(0xdc2626, 0.1, 0.7), 0, 0.5, -0.04);
  plume.rotation.x = -0.4;
  g.add(plume);
  return g;
}

function hornedHelmet() {
  const g = new THREE.Group();
  const dome = part(new THREE.SphereGeometry(0.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), std(0x57534e, 0.8, 0.35), 0, 0.2, 0);
  dome.scale.set(1.05, 1, 1.08);
  g.add(dome);
  [-1, 1].forEach((s) => {
    const horn = part(new THREE.ConeGeometry(0.045, 0.24, 10), std(0xf5f5dc, 0.05, 0.6), s * 0.22, 0.34, 0);
    horn.rotation.z = -s * 0.7;
    g.add(horn);
  });
  return g;
}

function headband(color, tails = true) {
  const g = new THREE.Group();
  const band = part(new THREE.TorusGeometry(0.19, 0.025, 8, 24), std(color, 0.1, 0.7), 0, 0.27, 0);
  band.rotation.x = Math.PI / 2;
  g.add(band);
  if (tails) {
    [-0.05, 0.05].forEach((x) => {
      const t = part(new THREE.BoxGeometry(0.035, 0.16, 0.012), std(color, 0.1, 0.7), x, 0.2, -0.21);
      t.rotation.x = 0.5;
      g.add(t);
    });
  }
  return g;
}

function ninjaHood() {
  const g = new THREE.Group();
  const hood = part(new THREE.SphereGeometry(0.22, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), std(0x111827, 0.1, 0.8), 0, 0.17, -0.01);
  hood.scale.set(1.05, 1.15, 1.1);
  g.add(hood);
  g.add(headband(0x7f1d1d, true));
  return g;
}

function tricorn() {
  const g = new THREE.Group();
  const brim = part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 3), std(0x111111, 0.1, 0.8), 0, 0.36, 0);
  brim.rotation.y = Math.PI;
  g.add(brim);
  g.add(part(new THREE.CylinderGeometry(0.15, 0.18, 0.14, 16), std(0x111111, 0.1, 0.8), 0, 0.43, 0));
  const trim = part(new THREE.TorusGeometry(0.3, 0.012, 6, 3), std(0xd4a017, 0.8, 0.3), 0, 0.375, 0);
  trim.rotation.x = Math.PI / 2;
  g.add(trim);
  const skull = part(new THREE.SphereGeometry(0.035, 10, 8), std(0xf5f5f4, 0.05, 0.6), 0, 0.44, 0.15);
  g.add(skull);
  return g;
}

function wizardHat(color, band) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.32, 0.32, 0.025, 24), std(color, 0.05, 0.8), 0, 0.34, 0));
  const cone = part(new THREE.ConeGeometry(0.19, 0.5, 20), std(color, 0.05, 0.8), 0, 0.6, 0);
  cone.rotation.z = 0.12;
  g.add(cone);
  const b = part(new THREE.CylinderGeometry(0.192, 0.195, 0.05, 20), std(band, 0.6, 0.3), 0, 0.38, 0);
  g.add(b);
  [[0.1, 0.55, 0.12], [-0.06, 0.7, 0.1]].forEach(([x, y, z]) => g.add(part(new THREE.OctahedronGeometry(0.03), glow(band), x, y, z)));
  return g;
}

function spaceVisor(color) {
  const g = new THREE.Group();
  const dome = part(new THREE.SphereGeometry(0.22, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), std(0xf1f5f9, 0.5, 0.25), 0, 0.18, 0);
  dome.scale.set(1.05, 1.1, 1.08);
  g.add(dome);
  const visor = part(new THREE.BoxGeometry(0.3, 0.07, 0.04), glow(color), 0, 0.24, 0.21);
  g.add(visor);
  return g;
}

function antenna(color) {
  const g = new THREE.Group();
  g.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), std(0x475569, 0.8, 0.3), 0.1, 0.42, 0));
  g.add(part(new THREE.SphereGeometry(0.03, 10, 8), glow(color), 0.1, 0.54, 0));
  return g;
}

/* ── Bodies: armour, robes, coats, bones… so every character has its own shape ──
 * Each builder calls put(boneName, item). Items are placed in the fighter's own axes
 * (+y up, +z forward), measured from that bone. */

const pieces = (...list) => { const g = new THREE.Group(); list.forEach((m) => g.add(m)); return g; };
const robeSkirt = (color, top = 0.28, bottom = 0.56, h = 1.05, y = -0.5) => {
  const m = part(new THREE.CylinderGeometry(top, bottom, h, 24, 1, true), std(color, 0.05, 0.85), 0, y, 0.02);
  m.material.side = THREE.DoubleSide;
  return m;
};
const trim = (color, r, y) => {
  const t = part(new THREE.TorusGeometry(r, 0.03, 6, 28), std(color, 0.7, 0.3), 0, y, 0.02);
  t.rotation.x = Math.PI / 2;
  return t;
};
const pauldrons = (put, color, r = 0.15) => ['LeftArm', 'RightArm'].forEach((b) => {
  const p = part(new THREE.SphereGeometry(r, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(color, 0.85, 0.25), 0, 0.02, 0);
  p.scale.set(1.1, 0.8, 1.1);
  put(b, pieces(p));
});

function darkHood() {
  const g = new THREE.Group();
  const hood = part(new THREE.SphereGeometry(0.24, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.7), std(0x1c1917, 0.05, 0.85), 0, 0.15, -0.02);
  hood.scale.set(1.05, 1.25, 1.1);
  const tip = part(new THREE.ConeGeometry(0.12, 0.3, 14), std(0x1c1917, 0.05, 0.85), 0, 0.42, -0.08);
  tip.rotation.x = -0.35;
  g.add(hood, tip);
  [-0.07, 0.07].forEach((x) => g.add(part(new THREE.SphereGeometry(0.035, 10, 8), glow(0xef4444), x, 0.16, 0.2)));
  return g;
}

const BODIES = {
  knight(put) {
    const plate = part(new THREE.BoxGeometry(0.56, 0.5, 0.4), std(0xcbd5e1, 0.9, 0.22), 0, 0.08, 0.02);
    const cross = part(new THREE.BoxGeometry(0.08, 0.32, 0.02), std(0xd4a017, 0.8, 0.3), 0, 0.1, 0.23);
    const bar = part(new THREE.BoxGeometry(0.24, 0.08, 0.02), std(0xd4a017, 0.8, 0.3), 0, 0.16, 0.23);
    put('Spine2', pieces(plate, cross, bar));
    const tabard = part(new THREE.BoxGeometry(0.4, 0.62, 0.04), std(0x1e3a8a, 0.05, 0.8), 0, -0.3, 0.17);
    put('Hips', pieces(tabard, trim(0x78350f, 0.27, 0.02)));
    pauldrons(put, 0xcbd5e1);
  },
  orc(put) {
    put('Spine', pieces(part(new THREE.SphereGeometry(0.25, 20, 16), std(0x4d7c0f, 0.05, 0.8), 0, -0.02, 0.08)));
    ['LeftArm', 'RightArm'].forEach((b) => {
      const pad = part(new THREE.BoxGeometry(0.28, 0.12, 0.28), std(0x3f3f46, 0.7, 0.4), 0, 0.06, 0);
      const s1 = part(new THREE.ConeGeometry(0.04, 0.16, 8), std(0xe7e5e4, 0.2, 0.5), 0.05, 0.18, 0.05);
      const s2 = part(new THREE.ConeGeometry(0.04, 0.16, 8), std(0xe7e5e4, 0.2, 0.5), -0.05, 0.18, -0.05);
      put(b, pieces(pad, s1, s2));
    });
    const cloth = part(new THREE.BoxGeometry(0.34, 0.42, 0.04), std(0x78350f, 0.05, 0.9), 0, -0.24, 0.17);
    const back = part(new THREE.BoxGeometry(0.34, 0.42, 0.04), std(0x78350f, 0.05, 0.9), 0, -0.24, -0.15);
    put('Hips', pieces(cloth, back, trim(0x3f2a14, 0.29, 0.02)));
    const tusks = [-0.07, 0.07].map((x) => part(new THREE.ConeGeometry(0.025, 0.1, 8), std(0xf5f5dc, 0.05, 0.5), x, 0.04, 0.2));
    put('Head', pieces(...tusks));
  },
  samurai(put) {
    const dou = part(new THREE.BoxGeometry(0.54, 0.5, 0.38), std(0x991b1b, 0.4, 0.4), 0, 0.06, 0.02);
    const bands = [-0.08, 0.04, 0.16].map((y) => part(new THREE.BoxGeometry(0.56, 0.03, 0.4), std(0xd4a017, 0.8, 0.3), 0, y, 0.02));
    put('Spine2', pieces(dou, ...bands));
    ['LeftArm', 'RightArm'].forEach((b) => put(b, pieces(part(new THREE.BoxGeometry(0.26, 0.3, 0.06), std(0x991b1b, 0.4, 0.4), 0, -0.1, 0))));
    put('Hips', pieces(robeSkirt(0x111827, 0.3, 0.52, 0.78, -0.38), trim(0xf8fafc, 0.29, 0.02)));
  },
  ninja(put) {
    const scarf = part(new THREE.TorusGeometry(0.14, 0.05, 8, 20), std(0x7f1d1d, 0.05, 0.8), 0, 0.02, 0);
    scarf.rotation.x = Math.PI / 2;
    const tail = part(new THREE.BoxGeometry(0.08, 0.4, 0.02), std(0x7f1d1d, 0.05, 0.8), 0.06, -0.2, -0.14);
    put('Neck', pieces(scarf, tail));
    put('Hips', pieces(trim(0x7f1d1d, 0.27, 0.04)));
  },
  pirate(put) {
    const coat = part(new THREE.BoxGeometry(0.54, 0.54, 0.38), std(0x7f1d1d, 0.05, 0.8), 0, 0.05, 0);
    const shirt = part(new THREE.BoxGeometry(0.16, 0.5, 0.02), std(0xf5f5f4, 0.05, 0.8), 0, 0.05, 0.2);
    put('Spine2', pieces(coat, shirt));
    const tails = robeSkirt(0x7f1d1d, 0.3, 0.44, 0.7, -0.36);
    const buckle = part(new THREE.BoxGeometry(0.1, 0.08, 0.03), std(0xd4a017, 0.9, 0.2), 0, 0.02, 0.29);
    put('Hips', pieces(tails, trim(0x1c1917, 0.28, 0.02), buckle));
    put('Head', pieces(part(new THREE.BoxGeometry(0.09, 0.07, 0.02), std(0x111111, 0.1, 0.8), 0.07, 0.16, 0.2)));
  },
  skeleton(put) {
    const bone = std(0xf5f5f4, 0.05, 0.6);
    const ribs = [0.18, 0.08, -0.02, -0.12].map((y, i) => {
      const r = part(new THREE.TorusGeometry(0.2 - i * 0.015, 0.025, 6, 20), bone, 0, y, 0.02);
      r.rotation.x = Math.PI / 2;
      r.scale.y = 0.75;
      return r;
    });
    put('Spine2', pieces(...ribs, part(new THREE.BoxGeometry(0.05, 0.36, 0.05), bone, 0, 0.04, 0.17)));
    put('Spine', pieces(part(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), bone, 0, 0.1, -0.12)));
    const pelvis = part(new THREE.TorusGeometry(0.2, 0.04, 6, 18), bone, 0, 0, 0);
    pelvis.rotation.x = Math.PI / 2;
    put('Hips', pieces(pelvis));
    const skull = part(new THREE.SphereGeometry(0.2, 18, 14), bone, 0, 0.14, 0.02);
    const eyes = [-0.07, 0.07].map((x) => part(new THREE.SphereGeometry(0.05, 10, 8), std(0x111111, 0, 1), x, 0.16, 0.18));
    const jaw = part(new THREE.BoxGeometry(0.2, 0.08, 0.16), bone, 0, 0.0, 0.08);
    put('Head', pieces(skull, ...eyes, jaw));
  },
  wizard(put) {
    put('Spine2', pieces(part(new THREE.CylinderGeometry(0.27, 0.3, 0.6, 20), std(0x5b21b6, 0.05, 0.85), 0, 0.05, 0.02)));
    put('Hips', pieces(robeSkirt(0x5b21b6), trim(0xfbbf24, 0.555, -1.0), trim(0xfbbf24, 0.29, 0.02)));
    const beard = part(new THREE.ConeGeometry(0.12, 0.32, 14), std(0xf1f5f9, 0.05, 0.9), 0, 0.0, 0.17);
    beard.rotation.x = Math.PI;
    put('Head', pieces(beard));
  },
  darkwizard(put) {
    put('Spine2', pieces(part(new THREE.CylinderGeometry(0.27, 0.3, 0.6, 20), std(0x1c1917, 0.05, 0.85), 0, 0.05, 0.02)));
    put('Hips', pieces(robeSkirt(0x1c1917), trim(0xdc2626, 0.555, -1.0), trim(0xdc2626, 0.29, 0.02)));
  },
  laserknight(put) {
    const plate = part(new THREE.BoxGeometry(0.54, 0.48, 0.38), std(0xf1f5f9, 0.6, 0.25), 0, 0.07, 0.02);
    const core = part(new THREE.CircleGeometry(0.07, 18), glow(0x38bdf8), 0, 0.12, 0.215);
    const cape = part(new THREE.PlaneGeometry(0.6, 1.25), std(0x1d4ed8, 0.05, 0.8), 0, -0.4, -0.23);
    cape.material.side = THREE.DoubleSide;
    cape.rotation.x = 0.12;
    put('Spine2', pieces(plate, core, cape));
    pauldrons(put, 0xf1f5f9, 0.14);
  },
  droid(put) {
    const chest = part(new THREE.BoxGeometry(0.58, 0.52, 0.42), std(0x334155, 0.85, 0.3), 0, 0.06, 0.02);
    const lights = [-0.12, 0, 0.12].map((x) => part(new THREE.BoxGeometry(0.06, 0.06, 0.02), glow(0xf97316), x, 0.14, 0.235));
    put('Spine2', pieces(chest, ...lights));
    const headBox = part(new THREE.BoxGeometry(0.36, 0.32, 0.34), std(0x475569, 0.85, 0.3), 0, 0.15, 0.02);
    const visor = part(new THREE.BoxGeometry(0.28, 0.06, 0.02), glow(0xf43f5e), 0, 0.17, 0.2);
    put('Head', pieces(headBox, visor));
    pauldrons(put, 0x334155, 0.14);
  },
  dummy(put) {
    put('Spine', pieces(part(new THREE.CylinderGeometry(0.3, 0.32, 0.8, 16), std(0xd6b25e, 0, 1), 0, 0.2, 0)));
    put('Head', pieces(part(new THREE.SphereGeometry(0.22, 16, 12), std(0xc8a165, 0, 1), 0, 0.14, 0.02)));
  },
};

/** body = jersey/head colour, accent = trunks; glove = gauntlet colour; size = how big they stand */
export const OUTFITS = {
  knight: { body: '#94a3b8', accent: '#1e3a8a', glove: 0x64748b, right: () => sword(), left: () => shield(), head: knightHelmet },
  orc: { body: '#4d7c0f', accent: '#3f2a14', glove: 0x3f2a14, right: axe, head: hornedHelmet, size: 1.14 },
  samurai: { body: '#b91c1c', accent: '#111111', glove: 0x111111, right: () => katana(), head: () => headband(0xf8fafc) },
  ninja: { body: '#1f2937', accent: '#111111', glove: 0x111111, right: () => katana({ grip: 0x7f1d1d }), head: ninjaHood, size: 0.93 },
  pirate: { body: '#991b1b', accent: '#1c1917', glove: 0x3b2414, right: cutlass, head: tricorn },
  skeleton: { body: '#1c1917', accent: '#1c1917', glove: 0xf5f5f4, right: cutlass, head: () => headband(0xb91c1c, true), size: 0.97 },
  wizard: { body: '#6d28d9', accent: '#312e81', glove: 0x4c1d95, right: () => staff(0x67e8f9), left: () => orb(0x67e8f9), head: () => wizardHat(0x5b21b6, 0xfbbf24) },
  darkwizard: { body: '#1c1917', accent: '#450a0a', glove: 0x111111, right: () => staff(0xef4444), left: () => orb(0xef4444), head: darkHood },
  laserknight: { body: '#e2e8f0', accent: '#1d4ed8', glove: 0x1e293b, right: () => laserSword(0x38bdf8), head: () => spaceVisor(0x38bdf8) },
  droid: { body: '#475569', accent: '#ea580c', glove: 0x1f2937, right: () => laserSword(0xf43f5e), head: () => antenna(0xf43f5e), size: 1.06 },
  dummy: { body: '#a16207', accent: '#78350f', glove: 0x78350f },
};
Object.entries(BODIES).forEach(([k, fn]) => { if (OUTFITS[k]) OUTFITS[k].bodyParts = fn; });

/** Colours to build the fighter in, before it is dressed. */
export function outfitColors(name) {
  const o = OUTFITS[name];
  return o ? { primary: o.body, accent: o.accent } : {};
}

/**
 * Holder on a bone that cancels the bone's scale (items are sized in model units) and,
 * in the pose the fighter is built in, lines up with the fighter's own axes (+y up, +z forward).
 */
function holderOn(bone, root) {
  root.updateMatrixWorld(true);
  const h = new THREE.Group();
  const ws = bone.getWorldScale(new THREE.Vector3()).x || 1;
  h.scale.setScalar(1 / ws);
  const bq = bone.getWorldQuaternion(new THREE.Quaternion());
  const rq = root.getWorldQuaternion(new THREE.Quaternion());
  h.quaternion.copy(bq.invert().multiply(rq));
  bone.add(h);
  return h;
}

/** Put an outfit on a boxer built by buildCuteBoxer (X Bot or classic). Safe to call twice. */
export function dressFighter(fighter, name) {
  const o = OUTFITS[name];
  if (!fighter || !o) return;
  const old = [];
  fighter.traverse((c) => { if (c.userData?.outfitItem) old.push(c); });
  old.forEach((c) => c.removeFromParent());
  const tag = (g) => { g.userData.outfitItem = true; return g; };
  // Armour, robes, coats and bones on the skeleton, so each character has its own shape
  const bones = {};
  fighter.traverse((b) => { if (b.isBone) bones[b.name.replace(/^mixamorig:?/, '')] = b; });
  if (o.bodyParts && Object.keys(bones).length) {
    o.bodyParts((boneName, item) => {
      const bone = bones[boneName];
      if (!bone) return;
      const h = holderOn(bone, fighter);
      h.add(item);
      tag(h);
    });
  }
  const L = fighter.userData.leftGlove;
  const R = fighter.userData.rightGlove;
  // Gloves become smaller gauntlets in the outfit's colour
  [L, R].forEach((glove) => {
    if (!glove) return;
    glove.traverse((m) => {
      if (m.isMesh && m.material && !m.userData.outfitItem) {
        m.material = m.material.clone();
        m.material.color?.setHex(o.glove);
        if (m.material.emissive) m.material.emissive.setHex(0x000000);
      }
    });
    if (!glove.userData.gauntlet) {
      glove.children.forEach((c) => { if (!c.userData.outfitItem) c.scale.multiplyScalar(0.72); });
      glove.userData.gauntlet = true;
    }
  });
  if (R && o.right) {
    // Items are built along +y; the glove's +z runs up out of the fist in guard and towards
    // the rival on every strike, so the blade stands up in guard and thrusts on attacks
    const item = o.right();
    item.rotation.x = Math.PI / 2;
    R.add(tag(item));
  }
  if (L && o.left) L.add(tag(o.left()));
  if (o.head) {
    let head = null;
    fighter.traverse((b) => { if (!head && b.isBone && /Head$/.test(b.name)) head = b; });
    if (head) {
      const h = holderOn(head, fighter);
      h.add(o.head());
      tag(h);
    } else {
      const hg = fighter.getObjectByName('Head_Group');
      if (hg) hg.add(tag(o.head()));
    }
  }
  // Bigger orc, smaller ninja… (the boxer kit keeps the feet planted on the floor)
  const rig = fighter.getObjectByName('BoxerRig');
  if (rig) rig.scale.setScalar(o.size || 1);
  fighter.userData.outfit = name;
}
