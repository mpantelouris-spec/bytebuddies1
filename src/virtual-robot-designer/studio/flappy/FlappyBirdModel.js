/**
 * The Flappy Bird hero in 3D, cartoon style: a round yellow bird with a cream
 * belly, big googly eyes, a two-tone orange beak and cream wings, toon shaded
 * with a dark outline so it reads like the original sprite.
 * Faces +Z, up is +Y, wings on the ±X sides (flap on rotation.z).
 */
import * as THREE from 'three';

const OUTLINE = 0x3a2208;
let _toonRamp = null;

/** Three-step light ramp for crisp cartoon shading. */
function toonRamp() {
  if (_toonRamp) return _toonRamp;
  const data = new Uint8Array([90, 90, 90, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
  _toonRamp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  _toonRamp.minFilter = THREE.NearestFilter;
  _toonRamp.magFilter = THREE.NearestFilter;
  _toonRamp.needsUpdate = true;
  return _toonRamp;
}

function toonMat(color) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonRamp() });
}

const outlineMat = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });

/** A shape plus its slightly larger back-faced twin, which draws the cartoon outline. */
function outlined(geo, color, { scale = [1, 1, 1], pos = [0, 0, 0], rot = [0, 0, 0], line = 0.035 } = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, toonMat(color));
  const o = new THREE.Mesh(geo, outlineMat);
  m.castShadow = true;
  o.scale.setScalar(1 + line / Math.max(0.05, Math.min(...scale) * 0.5));
  g.add(m, o);
  g.scale.set(...scale);
  g.position.set(...pos);
  g.rotation.set(...rot);
  return g;
}

export function buildFlappyBirdModel({ body = 0xf8d23a, belly = 0xfff2b8, beakTop = 0xf35b2c, beakBottom = 0xf9a02c } = {}) {
  const g = new THREE.Group();
  g.name = 'FlappyBird';
  const sphere = new THREE.SphereGeometry(0.5, 32, 24);

  // Round body, a little longer than tall, like the sprite
  g.add(outlined(sphere, body, { scale: [0.86, 0.9, 1.1] }));
  // Cream lower half of the face and belly
  g.add(outlined(sphere, belly, { scale: [0.78, 0.55, 0.82], pos: [0, -0.16, 0.12], line: 0.02 }));

  // Big white eyes with a black pupil and a shine, one on each side
  [-1, 1].forEach((side) => {
    g.add(outlined(sphere, 0xffffff, { scale: [0.3, 0.5, 0.46], pos: [side * 0.28, 0.18, 0.27], line: 0.025 }));
    const pupil = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x151515 }));
    pupil.scale.set(0.08, 0.22, 0.11);
    pupil.position.set(side * 0.38, 0.18, 0.44);
    g.add(pupil);
    const shine = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.scale.set(0.03, 0.05, 0.05);
    shine.position.set(side * 0.415, 0.25, 0.46);
    g.add(shine);
  });

  // Two-tone "lips" beak
  g.add(outlined(sphere, beakTop, { scale: [0.42, 0.15, 0.46], pos: [0, -0.03, 0.5], line: 0.02 }));
  g.add(outlined(sphere, beakBottom, { scale: [0.36, 0.12, 0.4], pos: [0, -0.14, 0.46], line: 0.02 }));

  // Tail feathers
  g.add(outlined(sphere, belly, { scale: [0.2, 0.16, 0.26], pos: [0, 0.06, -0.54], rot: [-0.35, 0, 0], line: 0.02 }));

  // Wings pivot at the shoulder on each side
  const wings = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.38, -0.06, -0.16);
    pivot.add(outlined(sphere, 0xfbeab0, { scale: [0.1, 0.22, 0.42], pos: [side * 0.05, -0.02, -0.08], rot: [0.25, 0, 0], line: 0.02 }));
    g.add(pivot);
    return pivot;
  });

  g.userData.wingL = wings[0];
  g.userData.wingR = wings[1];
  g.userData.flappyHideParts = [];
  g.userData.isFlappyBird = true;
  g.userData.chassisId = 'birdbot';
  return g;
}
