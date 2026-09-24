/**
 * MooMooMeadowsWorld.js — Pastoral figure-8 farm circuit (reference art style).
 */
import * as THREE from 'three';
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { getMKVisual } from './MKTrackVisualSpec.js';
import { sampleTrackBounds, cornerPosition, faceCenter } from './mk-track-layout.js';

function trackHeading(curve, t) {
  const frame = sampleTrackFrame(curve, t);
  return frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
}

function whiteStartLine(curve, halfWidth, finishT = 0) {
  const { pos } = placeAtTrack(curve, finishT, 0, 0);
  const rot = trackHeading(curve, finishT);
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(halfWidth * 2.2, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }),
  );
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = rot;
  line.position.copy(pos);
  line.position.y = 0.13;
  return line;
}

function buildCow(i = 0) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const spotMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.15, 2.5), bodyMat);
  body.position.y = 1.15;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 1.1), bodyMat);
  head.position.set(0, 1.35, 1.55);
  g.add(head);
  for (let s = 0; s < 4 + (i % 3); s++) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.15, 6, 6), spotMat);
    spot.position.set(
      (Math.random() - 0.5) * 1.2,
      0.9 + Math.random() * 0.6,
      (Math.random() - 0.5) * 1.6,
    );
    g.add(spot);
  }
  [-0.55, 0.55].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.7, 6), bodyMat);
    leg.position.set(x, 0.35, 0.6);
    g.add(leg);
    const leg2 = leg.clone();
    leg2.position.z = -0.6;
    g.add(leg2);
  });
  g.userData.grazePhase = i * 1.7;
  return g;
}

function buildSheep() {
  const g = new THREE.Group();
  const wool = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.95 }),
  );
  wool.position.y = 0.75;
  wool.scale.set(1.2, 1, 1.4);
  g.add(wool);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333 }),
  );
  head.position.set(0, 0.7, 0.75);
  g.add(head);
  return g;
}

function buildItemBox() {
  const g = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(80,140,255,0.9)';
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 56, 56);
  ctx.fillStyle = '#ffee00';
  ctx.font = 'bold 40px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('?', 32, 46);
  const tex = new THREE.CanvasTexture(canvas);
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 1.4),
    new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      opacity: 0.88,
      emissive: 0x2244aa,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.15,
    }),
  );
  box.position.y = 1.6;
  g.add(box);
  g.userData.spin = Math.random() * Math.PI * 2;
  return g;
}

function buildBalloons() {
  const g = new THREE.Group();
  const colors = [0x00aa44, 0xff2222, 0xffdd00];
  colors.forEach((col, i) => {
    const balloon = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 }),
    );
    balloon.position.set((i - 1) * 0.45, 2.2 + i * 0.15, 0);
    g.add(balloon);
  });
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 1.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
  );
  post.position.y = 0.9;
  g.add(post);
  return g;
}

function buildRedBarn() {
  const g = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xdc143c, roughness: 0.75 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 10), red);
  body.position.y = 4.5;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 5, 4), red);
  roof.position.set(0, 11, 0);
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.2), white);
  door.position.set(0, 2.5, 5.05);
  g.add(door);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.4, 10.2), white);
  trim.position.y = 9.2;
  g.add(trim);
  return g;
}

function buildSilo() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7, roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 18, 14), metal);
  body.position.y = 9;
  g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), metal);
  dome.position.y = 18;
  g.add(dome);
  return g;
}

function buildWindmill() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.8, 14, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
  );
  tower.position.y = 7;
  g.add(tower);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 }),
  );
  hub.position.y = 14.5;
  hub.rotation.x = Math.PI / 2;
  g.add(hub);
  const blades = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 7, 0.12),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffffff : 0xdc143c }),
    );
    blade.position.y = 3.5;
    blade.rotation.z = (i / 4) * Math.PI * 2;
    blades.add(blade);
  }
  blades.position.y = 14.5;
  g.add(blades);
  g.userData.blades = blades;
  return g;
}

export function buildPicketFence(curve, root, halfWidth, segments = 200) {
  const fenceGroup = new THREE.Group();
  fenceGroup.name = 'meadow-picket-fence';
  const picketMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.75 });
  const picketGeo = new THREE.BoxGeometry(0.1, 0.95, 0.07);
  const railGeo = new THREE.BoxGeometry(0.08, 0.08, 0.6);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const offset = halfWidth + 4.8;
    for (const side of [-1, 1]) {
      const { pos } = placeAtTrack(curve, t, side * offset, 0);
      const rot = trackHeading(curve, t);
      const picket = new THREE.Mesh(picketGeo, picketMat);
      picket.position.set(pos.x, 0.48, pos.z);
      picket.rotation.y = rot;
      fenceGroup.add(picket);
      if (i % 4 === 0 && side === 1) {
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(pos.x, 0.72, pos.z);
        rail.rotation.y = rot;
        rail.scale.z = 2.2;
        fenceGroup.add(rail);
      }
    }
  }
  root.add(fenceGroup);
  return fenceGroup;
}

function buildWoodenTurnPosts(curve, root, halfWidth) {
  const postMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
  const turns = [0.12, 0.28, 0.5, 0.72, 0.88];
  turns.forEach((t) => {
    for (const side of [-1, 1]) {
      const { pos } = placeAtTrack(curve, t, side * (halfWidth + 2.8), 0);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.4, 6), postMat);
      post.position.copy(pos);
      post.position.y = 0.7;
      root.add(post);
    }
  });
}

function buildMeadowGrass(scene, color, bounds) {
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX + 100, bounds.spanZ + 100, 24, 24),
    new THREE.MeshStandardMaterial({ color, roughness: 0.94 }),
  );
  const pos = grass.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, Math.sin(x * 0.04) * 0.25 + Math.cos(z * 0.05) * 0.2);
  }
  pos.needsUpdate = true;
  grass.geometry.computeVertexNormals();
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(bounds.cx, -0.03, bounds.cz);
  grass.name = 'meadow-grass';
  scene.add(grass);
  return grass;
}

function buildPollenParticles(root) {
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = 1 + Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff8dc,
    size: 0.35,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'meadow-pollen';
  root.add(points);
  return points;
}

function buildDustPuffs(root, curve, halfWidth) {
  const group = new THREE.Group();
  group.name = 'meadow-dust';
  const dustMat = new THREE.MeshBasicMaterial({
    color: 0xd4a574,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  [0.18, 0.42, 0.58, 0.8].forEach((t, i) => {
  const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * (halfWidth * 0.4), 0);
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.8 + (i % 2), 8, 8), dustMat);
    puff.position.copy(pos);
    puff.position.y = 0.6;
    puff.scale.set(1.6, 0.5, 1.2);
    puff.userData.phase = i * 1.3;
    group.add(puff);
  });
  root.add(group);
  return group;
}

function buildBirdFlock(root, x, y, z) {
  const flock = new THREE.Group();
  flock.position.set(x, y, z);
  for (let i = 0; i < 4; i++) {
    const bird = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.5, 4),
      new THREE.MeshBasicMaterial({ color: 0x333333 }),
    );
    bird.rotation.z = Math.PI / 2;
    bird.position.set(i * 0.6 - 0.9, Math.sin(i) * 0.2, i * 0.15);
    flock.add(bird);
  }
  flock.userData.flyRadius = 8 + Math.random() * 4;
  flock.userData.flyPhase = Math.random() * Math.PI * 2;
  root.add(flock);
  return flock;
}

export function buildMooMooMeadowsWorld(scene, curve, root, opts = {}) {
  const world = new THREE.Group();
  world.name = 'mk-moo-meadows';
  const hw = opts.halfWidth || 3;
  const bounds = sampleTrackBounds(curve);
  const visual = getMKVisual('moo_moo_meadows');
  const { top, fog, ground } = visual.sky;

  scene.background = new THREE.Color(top);
  scene.fog = new THREE.Fog(fog, visual.fogNear ?? 40, visual.fogFar ?? 170);
  buildMeadowGrass(scene, ground, bounds);

  const barn = buildRedBarn();
  const barnSpot = cornerPosition(bounds, 'nw', 22);
  barn.position.set(barnSpot.x, 0, barnSpot.z);
  barn.rotation.y = faceCenter(bounds, barnSpot.x, barnSpot.z);
  barn.scale.setScalar(1.05);
  world.add(barn);

  const silo = buildSilo();
  const siloSpot = cornerPosition(bounds, 'ne', 18);
  silo.position.set(siloSpot.x, 0, siloSpot.z);
  world.add(silo);

  const silo2 = buildSilo();
  const silo2Spot = cornerPosition(bounds, 'sw', 16);
  silo2.position.set(silo2Spot.x, 0, silo2Spot.z);
  silo2.scale.setScalar(0.8);
  world.add(silo2);

  const windmill = buildWindmill();
  const windSpot = cornerPosition(bounds, 'se', 20);
  windmill.position.set(windSpot.x, 0, windSpot.z);
  windmill.rotation.y = faceCenter(bounds, windSpot.x, windSpot.z);
  world.add(windmill);

  const cowTs = [0.12, 0.28, 0.45, 0.62, 0.78, 0.9];
  const cows = [];
  cowTs.forEach((t, i) => {
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 9), 0);
    const cow = buildCow(i);
    cow.position.copy(pos);
    cow.rotation.y = trackHeading(curve, t) + (side > 0 ? 0.4 : -0.4);
    world.add(cow);
    cows.push(cow);
  });

  for (let i = 0; i < 6; i++) {
    const sheep = buildSheep();
    const angle = (i / 6) * Math.PI * 2;
    const r = bounds.radius + 32;
    sheep.position.set(
      bounds.cx + Math.cos(angle) * r,
      0,
      bounds.cz + Math.sin(angle) * r,
    );
    sheep.rotation.y = angle;
    world.add(sheep);
  }

  const itemBoxes = [];
  [0.2, 0.65].forEach((t) => {
    const { pos } = placeAtTrack(curve, t, -(hw + 8), 0);
    const box = buildItemBox();
    box.position.copy(pos);
    world.add(box);
    itemBoxes.push(box);
  });

  const { pos: balloonPos } = placeAtTrack(curve, 0.4, hw + 10, 0);
  const balloons = buildBalloons();
  balloons.position.copy(balloonPos);
  world.add(balloons);

  const birds = [
    buildBirdFlock(world, bounds.cx - 40, 22, bounds.cz - 30),
    buildBirdFlock(world, bounds.cx + 35, 18, bounds.cz + 40),
  ];

  buildPicketFence(curve, world, hw, 56);

  const finishT = opts.finishT ?? 0;
  world.add(whiteStartLine(curve, hw, finishT));

  const pollen = buildPollenParticles(world);

  world.userData.animTick = (time) => {
    cows.forEach((cow, i) => {
      cow.rotation.x = Math.sin(time * 0.8 + cow.userData.grazePhase) * 0.04;
      cow.position.y = Math.sin(time * 1.2 + i) * 0.02;
    });
    if (windmill.userData.blades) {
      windmill.userData.blades.rotation.z = time * 0.35;
    }
    itemBoxes.forEach((box) => {
      box.rotation.y = time * 1.4 + (box.userData.spin || 0);
      box.children[0].position.y = 1.6 + Math.sin(time * 2 + box.userData.spin) * 0.12;
    });
    birds.forEach((flock) => {
      const ph = flock.userData.flyPhase || 0;
      flock.position.x += Math.cos(time * 0.4 + ph) * 0.04;
      flock.position.z += Math.sin(time * 0.35 + ph) * 0.04;
      flock.position.y = 20 + Math.sin(time * 0.6 + ph) * 2;
    });
    if (pollen?.geometry?.attributes?.position) {
      const arr = pollen.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += Math.sin(time + i) * 0.002;
        arr[i] += Math.cos(time * 0.5 + i) * 0.003;
      }
      pollen.geometry.attributes.position.needsUpdate = true;
    }
  };

  root.add(world);
  return world;
}
