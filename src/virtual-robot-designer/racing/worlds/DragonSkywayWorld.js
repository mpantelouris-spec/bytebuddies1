/**
 * DragonSkywayWorld.js — Floating fantasy kingdom adventure.
 * Floating islands, castles, dragons, waterfalls, crystal trees.
 */
import * as THREE from 'three';
import {
  sampleTrackFrame, placeAtTrack, buildSectionSign, buildCrystal,
  scatterCollectiblesAlongTrack, updateCollectibleAnimations, buildWarpStarfield,
} from '../GameWorldBuilder.js';

function buildFloatingIsland(w, d, thickness = 2) {
  const g = new THREE.Group();
  const topGeo = new THREE.CylinderGeometry(w * 0.5, w * 0.55, thickness, 12);
  const pos = topGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.4);
  }
  topGeo.computeVertexNormals();
  const top = new THREE.Mesh(
    topGeo,
    new THREE.MeshStandardMaterial({ color: 0x5aad52, roughness: 0.9, emissive: 0x2a6a28, emissiveIntensity: 0.05 }),
  );
  top.position.y = thickness / 2;
  g.add(top);
  const rock = new THREE.Mesh(
    new THREE.ConeGeometry(w * 0.45, thickness * 2.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x6a5040, roughness: 0.95 }),
  );
  rock.position.y = -thickness;
  rock.rotation.x = Math.PI;
  g.add(rock);
  return g;
}

function buildFantasyCastle() {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x9988aa, roughness: 0.7 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x6644aa, emissive: 0x442266, emissiveIntensity: 0.2 });
  const keep = new THREE.Mesh(new THREE.BoxGeometry(7, 8, 7), stone);
  keep.position.y = 4;
  g.add(keep);
  [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([x, z]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 12, 8), stone);
    t.position.set(x, 6, z);
    g.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 8), roof);
    c.position.set(x, 14, z);
    g.add(c);
  });
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 2),
    new THREE.MeshBasicMaterial({ color: 0xff4488, side: THREE.DoubleSide }),
  );
  banner.position.set(0, 16, 0);
  g.add(banner);
  return g;
}

function buildDragon(color = 0xcc4422) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 10),
    new THREE.MeshStandardMaterial({ color, emissive: 0x882211, emissiveIntensity: 0.25, roughness: 0.6 }),
  );
  body.scale.set(2, 1, 1.2);
  body.position.y = 2;
  g.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 10, 10),
    new THREE.MeshStandardMaterial({ color }),
  );
  head.position.set(2.2, 2.8, 0);
  g.add(head);
  const wingGeo = new THREE.PlaneGeometry(3, 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xdd6644, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  });
  [-1, 1].forEach((s) => {
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 3, s * 1.5);
    wing.rotation.y = s * 0.4;
    g.add(wing);
    g.userData.wings = g.userData.wings || [];
    g.userData.wings.push(wing);
  });
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 3, 6),
    new THREE.MeshStandardMaterial({ color }),
  );
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-2.5, 2, 0);
  g.add(tail);
  g.userData.body = body;
  return g;
}

function buildWaterfall(height = 12) {
  const g = new THREE.Group();
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(3, height),
    new THREE.MeshBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  fall.position.y = height / 2;
  g.add(fall);
  const mist = new THREE.Mesh(
    new THREE.SphereGeometry(2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
  );
  mist.position.y = 0.5;
  mist.scale.y = 0.4;
  g.add(mist);
  g.userData.fall = fall;
  return g;
}

function buildCrystalTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x886644 }),
  );
  trunk.position.y = 1.5;
  g.add(trunk);
  for (let i = 0; i < 5; i++) {
    const crystal = buildCrystal({ height: 1.5 + i * 0.3, color: 0x88ffcc, emissive: 0x44ccaa });
    crystal.position.set((Math.random() - 0.5) * 1.5, 3 + i * 0.4, (Math.random() - 0.5) * 1.5);
    crystal.rotation.y = Math.random() * Math.PI;
    g.add(crystal);
  }
  return g;
}

function buildFlyingShip() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x886644, roughness: 0.7 }),
  );
  g.add(hull);
  const sail = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 4),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
  );
  sail.position.set(0, 3, 0);
  g.add(sail);
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff8866, emissive: 0xff6644, emissiveIntensity: 0.2 }),
  );
  balloon.position.set(0, 5, 0);
  g.add(balloon);
  return g;
}

function buildFantasySky(scene) {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#1a4488');
  g.addColorStop(0.35, '#5599dd');
  g.addColorStop(0.65, '#aaccff');
  g.addColorStop(1, '#ffe8cc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.fog = new THREE.Fog(0xaaccff, 40, 110);
}

export function buildDragonSkywayWorld(scene, curve, root) {
  const world = new THREE.Group();
  world.name = 'dragon-skyway-world';
  root.add(world);

  buildFantasySky(scene);

  // Cloud sea far below
  const cloudTex = (() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const ctx = cv.getContext('2d');
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, r = 20 + Math.random() * 40;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.5)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    return new THREE.CanvasTexture(cv);
  })();
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
  const cloudSea = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  cloudSea.rotation.x = -Math.PI / 2;
  cloudSea.position.y = -25;
  world.add(cloudSea);

  scene.add(new THREE.AmbientLight(0xffeedd, 0.45));
  scene.add(new THREE.HemisphereLight(0x88ccff, 0xffddbb, 0.65));
  const sun = new THREE.DirectionalLight(0xfff4dd, 1.0);
  sun.position.set(30, 50, 20);
  scene.add(sun);

  // Floating islands
  const islands = [
    { x: -30, y: -2, z: -25, w: 14, d: 12 },
    { x: 25, y: 1, z: -30, w: 16, d: 14 },
    { x: -20, y: 3, z: 25, w: 12, d: 10 },
    { x: 35, y: -1, z: 20, w: 15, d: 13 },
    { x: 0, y: 5, z: -40, w: 18, d: 16 },
  ];
  islands.forEach(({ x, y, z, w, d }) => {
    const island = buildFloatingIsland(w, d);
    island.position.set(x, y, z);
    world.add(island);
  });

  // Castles on islands
  const castle1 = buildFantasyCastle();
  castle1.position.set(-30, 1, -25);
  world.add(castle1);

  // Offset off the track's central x-axis so it doesn't sit directly down
  // the forward camera sightline from the start (same issue fixed on
  // Rainbow Road's background planet).
  const castle2 = buildFantasyCastle();
  castle2.position.set(22, 9, -42);
  castle2.scale.setScalar(1.2);
  world.add(castle2);

  // Dragons flying
  const dragons = [];
  [0xcc4422, 0x2244cc, 0x44aa22].forEach((col, i) => {
    const dragon = buildDragon(col);
    const { pos } = placeAtTrack(curve, 0.15 + i * 0.25, 0, 12);
    dragon.position.copy(pos);
    dragon.position.y += 8;
    world.add(dragon);
    dragons.push({ dragon, pathT: 0.15 + i * 0.25, speed: 0.03 + i * 0.01, phase: i * 2 });
  });

  // Waterfalls
  [0.25, 0.55, 0.78].forEach((t) => {
    const wf = buildWaterfall(10 + Math.random() * 4);
    const { pos } = placeAtTrack(curve, t, 12, 0);
    wf.position.copy(pos);
    world.add(wf);
  });

  // Crystal trees
  for (let i = 0; i < 8; i++) {
    const tree = buildCrystalTree();
    const a = (i / 8) * Math.PI * 2;
    tree.position.set(Math.cos(a) * 22, 0, Math.sin(a) * 22);
    world.add(tree);
  }

  // Flying ships
  const ships = [];
  [0.3, 0.7].forEach((t, i) => {
    const ship = buildFlyingShip();
    const { pos } = placeAtTrack(curve, t, -15, 6);
    ship.position.copy(pos);
    world.add(ship);
    ships.push({ ship, t, phase: i * 3 });
  });

  const signs = [
    { t: 0.05, name: 'CLOUD HIGHWAY', sub: 'Welcome to the sky!' },
    { t: 0.20, name: 'DRAGON NEST', sub: 'Watch for dragons!' },
    { t: 0.40, name: 'FLOATING TEMPLE', sub: 'Ancient magic ahead' },
    { t: 0.60, name: 'STORM VALLEY', sub: 'Hold on tight!' },
    { t: 0.80, name: 'DRAGON KING', sub: 'Castle in the clouds' },
  ];
  signs.forEach(({ t, name, sub }) => {
    const sign = buildSectionSign(name, sub, 0xff8866);
    sign.position.copy(placeAtTrack(curve, t, 10, 4).pos);
    world.add(sign);
  });

  scatterCollectiblesAlongTrack(scene, curve,
    [0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.94],
    'star', 20,
  );

  return {
    world,
    update(time, dt) {
      updateCollectibleAnimations(scene, time);
      cloudTex.offset.x = time * 0.0002;

      dragons.forEach(({ dragon, pathT, speed, phase }) => {
        const t = (pathT + time * speed * 0.02) % 1;
        const { pos } = sampleTrackFrame(curve, t);
        dragon.position.x = pos.x + Math.sin(time * 0.5 + phase) * 8;
        dragon.position.z = pos.z + Math.cos(time * 0.4 + phase) * 6;
        dragon.position.y = pos.y + 10 + Math.sin(time * 0.8 + phase) * 2;
        dragon.rotation.y = time * 0.3 + phase;
        dragon.userData.wings?.forEach((w, i) => {
          w.rotation.z = Math.sin(time * 8 + i) * 0.4;
        });
      });

      ships.forEach(({ ship, t, phase }) => {
        const frame = sampleTrackFrame(curve, t);
        ship.position.x = frame.p.x + Math.sin(time * 0.2 + phase) * 12;
        ship.position.z = frame.p.z + Math.cos(time * 0.15 + phase) * 8;
        ship.position.y = frame.p.y + 8 + Math.sin(time * 0.5 + phase);
      });
    },
  };
}
