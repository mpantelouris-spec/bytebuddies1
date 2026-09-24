import * as THREE from 'three';

function mat(color, roughness = 0.72, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness: 0.04, ...extras,
  });
}

function placeAlong(curve, t, side, offset, object, yLift = 0) {
  const p = curve.getPointAt(t);
  const tangent = curve.getTangentAt(t).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  object.position.copy(p).addScaledVector(normal, side * offset);
  object.position.y = p.y + yLift;
  object.rotation.y = Math.atan2(tangent.x, tangent.z);
}

function palm() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 5.4, 10), mat(0xb57a3c, 0.88));
  trunk.position.y = 2.7;
  trunk.rotation.z = 0.05;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 8; i += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.35, 10, 6), mat(i % 2 ? 0x2f9a4a : 0x58c46a, 0.55));
    leaf.scale.set(1.7, 0.16, 0.38);
    leaf.position.y = 5.45;
    leaf.rotation.y = i * (Math.PI * 2 / 8);
    leaf.rotation.z = (i % 2 ? 0.32 : -0.22);
    g.add(leaf);
  }
  return g;
}

function hayBale() {
  const g = new THREE.Group();
  const bale = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.35, 1.35), mat(0xe8c15a, 0.92));
  bale.position.y = 0.68;
  bale.castShadow = true;
  g.add(bale);
  [-0.32, 0.32].forEach((z) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.09, 0.09), mat(0x8d5a22));
    band.position.set(0, 0.7, z);
    g.add(band);
  });
  return g;
}

function starFace() {
  const g = new THREE.Group();
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.78),
    mat(0xffe14a, 0.35, { emissive: 0xffcc33, emissiveIntensity: 0.55 }),
  );
  star.rotation.z = Math.PI / 4;
  g.add(star);
  [-0.18, 0.18].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), mat(0x1a1a1a, 0.4));
    eye.position.set(x, 0.12, 0.55);
    g.add(eye);
  });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 10, Math.PI), mat(0x1a1a1a, 0.4));
  smile.position.set(0, -0.08, 0.54);
  smile.rotation.z = Math.PI;
  g.add(smile);
  return g;
}

export function balloonArch(halfWidth = 4) {
  const g = new THREE.Group();
  g.name = 'balloon-star-arch';
  const colors = [0xff3b4a, 0xffd447, 0x2e91f2, 0x3dcc5a, 0xff7a1a, 0xff4fa3, 0x5ee0ff];
  const span = Math.max(halfWidth * 2.05, 8.4);
  const count = 18;
  for (let i = 0; i <= count; i += 1) {
    const u = i / count;
    const x = -span / 2 + u * span;
    const y = 2.4 + Math.sin(u * Math.PI) * 4.05;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 10), mat(colors[i % colors.length], 0.42));
    ball.position.set(x, y, 0);
    ball.castShadow = true;
    g.add(ball);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), mat(0xfff7e8, 0.5));
    knot.position.set(x, y - 0.5, 0);
    g.add(knot);
  }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.6, 8), mat(0xf4fbff));
  const left = post.clone();
  const right = post.clone();
  left.position.set(-span / 2, 1.3, 0);
  right.position.set(span / 2, 1.3, 0);
  g.add(left, right);
  const star = starFace();
  star.position.set(0, 6.85, 0.15);
  g.add(star);
  return g;
}

function centerDashes(curve, samples = 160) {
  const group = new THREE.Group();
  group.name = 'rally-center-dashes';
  for (let i = 2; i < samples; i += 6) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 1.35), mat(0xffd23f, 0.5));
    dash.position.set(p.x, p.y + 0.2, p.z);
    dash.rotation.y = Math.atan2(tangent.x, tangent.z);
    group.add(dash);
  }
  return group;
}

function neonGate(halfWidth = 4) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-gate';
  const span = Math.max(halfWidth * 2.2, 9);
  const hull = mat(0x2a2e38, 0.35, { metalness: 0.85 });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x33e6ff });
  const orange = new THREE.MeshBasicMaterial({ color: 0xff9a2e });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(span / 2, 0.55, 10, 40, Math.PI), hull);
  arch.position.y = 0.6;
  g.add(arch);
  const inner = new THREE.Mesh(new THREE.TorusGeometry(span / 2 - 0.6, 0.12, 8, 40, Math.PI), cyan);
  inner.position.set(0, 0.6, 0.35);
  g.add(inner);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(span / 2 + 0.6, 0.1, 8, 40, Math.PI), orange);
  outer.position.set(0, 0.6, 0.35);
  g.add(outer);
  return g;
}

function asteroid(size = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(size, 1),
    mat(0x6b6259, 0.95, { flatShading: true }),
  );
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  rock.castShadow = true;
  return rock;
}

/** Continuous low metal walls with glowing strips, cyan on the left and orange on the right. */
function buildNeonWalls(curve, halfWidth, samples = 320) {
  const g = new THREE.Group();
  g.name = 'cosmic-neon-walls';
  const wallGeo = new THREE.BoxGeometry(0.45, 0.9, 1);
  const stripGeo = new THREE.BoxGeometry(0.12, 0.14, 1);
  const wallMat = mat(0x2b2f3a, 0.35, { metalness: 0.85 });
  const walls = new THREE.InstancedMesh(wallGeo, wallMat, samples * 2);
  const strips = {
    [-1]: new THREE.InstancedMesh(stripGeo, new THREE.MeshBasicMaterial({ color: 0x33e6ff }), samples),
    [1]: new THREE.InstancedMesh(stripGeo, new THREE.MeshBasicMaterial({ color: 0xff9a2e }), samples),
  };
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let w = 0;
  for (let i = 0; i < samples; i += 1) {
    const t0 = i / samples;
    const t1 = (i + 1) / samples;
    const a = curve.getPointAt(t0);
    const b = curve.getPointAt(t1 % 1);
    const seg = b.clone().sub(a);
    const len = seg.length();
    const dir = seg.normalize();
    const n = new THREE.Vector3().crossVectors(up, dir).normalize();
    const basis = new THREE.Matrix4().makeBasis(n, new THREE.Vector3().crossVectors(dir, n), dir);
    q.setFromRotationMatrix(basis);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    [-1, 1].forEach((side) => {
      pos.copy(mid).addScaledVector(n, -side * (halfWidth + 0.35));
      pos.y += 0.45;
      s.set(1, 1, len * 1.04);
      m.compose(pos, q, s);
      walls.setMatrixAt(w, m);
      w += 1;
      pos.y += 0.42;
      m.compose(pos, q, s);
      strips[side].setMatrixAt(i, m);
    });
  }
  walls.castShadow = true;
  g.add(walls, strips[-1], strips[1]);
  return g;
}

function installCosmicPresentation(scene, curve, root, origin, fwd, right, angle, halfWidth) {
  const gate = neonGate(halfWidth);
  gate.scale.setScalar(1.4);
  gate.position.copy(origin).addScaledVector(fwd, 18);
  gate.rotation.y = angle;
  root.add(gate);

  root.add(buildNeonWalls(curve, halfWidth));

  for (let i = 0; i < 10; i += 1) {
    const side = i % 2 ? 1 : -1;
    const rock = asteroid(1.2 + (i % 3) * 0.9);
    rock.position.copy(origin)
      .addScaledVector(fwd, 10 + i * 6)
      .addScaledVector(right, side * (halfWidth + 7 + (i % 3) * 4));
    rock.position.y = origin.y + 3 + (i % 4) * 2.2;
    root.add(rock);
  }
}

export function installRacePresentation(scene, curve, {
  halfWidth = 4,
  spawn = null,
  startT = 0,
  theme = null,
} = {}) {
  if (scene.userData.racePresentationRoot) {
    scene.remove(scene.userData.racePresentationRoot);
    scene.userData.racePresentationRoot = null;
  }
  const root = new THREE.Group();
  root.name = 'original-race-presentation';
  root.userData.presentationLayer = true;

  const t0 = spawn?.trackT ?? startT ?? 0;
  const p0 = curve.getPointAt(((t0 % 1) + 1) % 1);
  const angle = spawn?.angle ?? (() => {
    const a = curve.getPointAt((t0 + 0.004) % 1);
    return Math.atan2(a.x - p0.x, a.z - p0.z);
  })();
  const origin = spawn
    ? new THREE.Vector3(spawn.x, spawn.y ?? p0.y, spawn.z)
    : new THREE.Vector3(p0.x, p0.y, p0.z);
  const fwd = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  const right = new THREE.Vector3(fwd.z, 0, -fwd.x);

  if (theme === 'star_station_01') {
    installCosmicPresentation(scene, curve, root, origin, fwd, right, angle, halfWidth);
    scene.add(root);
    scene.userData.racePresentationRoot = root;
    scene.userData.racePresentation = 'cosmic-skyway';
    return;
  }

  const finish = balloonArch(halfWidth);
  finish.scale.setScalar(1.55);
  finish.position.copy(origin).addScaledVector(fwd, 18);
  finish.position.y = origin.y;
  finish.rotation.y = angle;
  root.add(finish);

  root.add(centerDashes(curve));

  for (let i = 0; i < 8; i += 1) {
    const along = 5 + i * 4.2;
    [-1, 1].forEach((side) => {
      const usePalm = i % 2 === 0;
      const prop = usePalm ? palm() : hayBale();
      prop.scale.setScalar(usePalm ? 1.35 : 1.25);
      prop.position.copy(origin)
        .addScaledVector(fwd, along)
        .addScaledVector(right, side * (halfWidth + (usePalm ? 4.8 : 3.4)));
      prop.position.y = origin.y;
      prop.rotation.y = angle;
      root.add(prop);
    });
  }

  scene.add(root);
  scene.userData.racePresentationRoot = root;
  scene.userData.racePresentation = 'bright-arcade-circuit';
  scene.background = new THREE.Color(0x4eb8ef);
  if (scene.fog) {
    scene.fog.color.set(0xa8dff5);
    scene.fog.near = 70;
    scene.fog.far = 240;
  }
}
