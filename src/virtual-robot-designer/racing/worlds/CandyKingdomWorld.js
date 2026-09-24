/**
 * CandyKingdomWorld.js — Mario Kart-style candy adventure world.
 * Cookie villages, chocolate rivers, donut tunnels, marshmallow hills.
 */
import * as THREE from 'three';
import {
  sampleTrackFrame, placeAtTrack, buildSectionSign,
  scatterCollectiblesAlongTrack, updateCollectibleAnimations,
} from '../GameWorldBuilder.js';

function makeCandyGroundTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffd6ee';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `hsla(${300 + Math.random() * 40}, 80%, ${72 + Math.random() * 18}%, 0.35)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 6 + Math.random() * 18, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `hsla(${40 + Math.random() * 30}, 90%, 75%, 0.25)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 8, 4 + Math.random() * 8);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function buildMarshmallowHill(radius = 4, color = 0xfff0f5) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95, emissive: 0xffe0ee, emissiveIntensity: 0.12 }),
  );
  top.scale.y = 0.55;
  top.position.y = radius * 0.35;
  g.add(top);
  return g;
}

function buildGummyBear(color = 0xff4488) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, emissive: color, emissiveIntensity: 0.18 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), mat);
  body.scale.set(1, 1.1, 0.9);
  body.position.y = 1;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), mat);
  head.position.y = 2;
  g.add(head);
  [[-0.35, 2.35, 0.3], [0.35, 2.35, 0.3]].forEach(([x, y, z]) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), mat);
    ear.position.set(x, y, z);
    g.add(ear);
  });
  return g;
}

function buildDonut(scale = 1) {
  const g = new THREE.Group();
  const donut = new THREE.Mesh(
    new THREE.TorusGeometry(2.5 * scale, 0.9 * scale, 12, 24),
    new THREE.MeshStandardMaterial({
      color: 0xff8866, emissive: 0xff6644, emissiveIntensity: 0.25, roughness: 0.65,
    }),
  );
  donut.rotation.x = Math.PI / 2;
  g.add(donut);
  const sprinkleColors = [0xff4488, 0x44ff88, 0x4488ff, 0xffdd00, 0xff88ff];
  for (let i = 0; i < 20; i++) {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: sprinkleColors[i % 5] }),
    );
    const a = (i / 20) * Math.PI * 2;
    s.position.set(Math.cos(a) * 2.5 * scale, Math.sin(i) * 0.3, Math.sin(a) * 2.5 * scale);
    g.add(s);
  }
  return g;
}

/** Donut arch spanning the track — drive-through tunnel. */
function buildDonutTunnelArch(curve, t, halfWidth) {
  const frame = sampleTrackFrame(curve, t);
  const g = new THREE.Group();
  const archW = halfWidth * 2 + 2.5;
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xffccaa, emissiveIntensity: 0.35, roughness: 0.4,
  });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 7, 10), pillarMat);
    pillar.position.set(side * (archW / 2), 3.5, 0);
    g.add(pillar);
  }
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(archW / 2 + 0.2, 0.55, 10, 32, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0xff8866, emissive: 0xff5533, emissiveIntensity: 0.45, roughness: 0.5,
    }),
  );
  arch.rotation.x = Math.PI / 2;
  arch.position.y = 7;
  g.add(arch);
  const innerDonut = buildDonut(0.55);
  innerDonut.position.y = 7.5;
  innerDonut.scale.setScalar(0.9);
  g.add(innerDonut);
  const portal = new THREE.Mesh(
    new THREE.CircleGeometry(archW / 2 - 0.3, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffaa88, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  portal.rotation.x = Math.PI / 2;
  portal.position.y = 3.6;
  g.add(portal);
  g.userData.portal = portal;
  g.position.copy(frame.p);
  g.position.y = 0;
  g.rotation.y = frame.rot;
  return g;
}

function buildCandyCastle() {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xffccdd, roughness: 0.75, emissive: 0xff88aa, emissiveIntensity: 0.08 });
  const towerMat = new THREE.MeshStandardMaterial({ color: 0xff88aa, emissive: 0xff4488, emissiveIntensity: 0.22 });
  const keep = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), wallMat);
  keep.position.y = 3;
  g.add(keep);
  [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([x, z]) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 10, 10), towerMat);
    tower.position.set(x, 5, z);
    g.add(tower);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 10), new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xffaa44, emissiveIntensity: 0.15 }));
    cone.position.set(x, 11.5, z);
    g.add(cone);
  });
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 1.2),
    new THREE.MeshBasicMaterial({ color: 0xff4488, side: THREE.DoubleSide }),
  );
  flag.position.set(0, 12, 0);
  g.add(flag);
  const glow = new THREE.PointLight(0xff88cc, 2.5, 35);
  glow.position.set(0, 8, 0);
  g.add(glow);
  return g;
}

function buildChocolateRiver(width = 12, length = 20) {
  const g = new THREE.Group();
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshStandardMaterial({
      color: 0x5c3317, emissive: 0x3d1f0a, emissiveIntensity: 0.15, roughness: 0.25, metalness: 0.15,
    }),
  );
  river.rotation.x = -Math.PI / 2;
  g.add(river);
  g.userData.river = river;
  return g;
}

function buildGiantCookie(radius = 3) {
  const g = new THREE.Group();
  const cookie = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.82, emissive: 0xaa7711, emissiveIntensity: 0.06 }),
  );
  cookie.position.y = 0.25;
  g.add(cookie);
  for (let i = 0; i < 10; i++) {
    const chip = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x3d2314 }),
    );
    const a = (i / 10) * Math.PI * 2;
    chip.position.set(Math.cos(a) * radius * 0.55, 0.55, Math.sin(a) * radius * 0.55);
    g.add(chip);
  }
  return g;
}

function buildCookieHouse(scale = 1) {
  const g = new THREE.Group();
  const base = buildGiantCookie(2.2 * scale);
  g.add(base);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.8 * scale, 2.2 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0xffcc88, emissive: 0xff9944, emissiveIntensity: 0.12 }),
  );
  roof.position.y = 1.8 * scale;
  g.add(roof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.7 * scale, 1.0 * scale, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x5c3317 }),
  );
  door.position.set(0, 0.55 * scale, 2.1 * scale);
  g.add(door);
  return g;
}

function buildLollipop(height = 6, candyColor = 0xff4488) {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, height, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
  );
  stick.position.y = height / 2;
  g.add(stick);
  const candy = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: candyColor, emissive: candyColor, emissiveIntensity: 0.35, roughness: 0.35,
    }),
  );
  candy.position.y = height + 0.5;
  g.add(candy);
  const swirl = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.55, 0.12, 48, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2 }),
  );
  swirl.position.y = height + 0.5;
  swirl.scale.setScalar(0.9);
  g.add(swirl);
  return g;
}

function buildCottonCandyCloud(scale = 1, color = 0xffaacc) {
  const g = new THREE.Group();
  const puffMat = new THREE.MeshStandardMaterial({
    color, transparent: true, opacity: 0.82, roughness: 1, emissive: color, emissiveIntensity: 0.15,
  });
  [[0, 0, 0], [1.2, 0.3, 0.4], [-1, 0.2, -0.3], [0.4, 0.5, -0.8], [-0.6, 0.1, 0.7]].forEach(([x, y, z], i) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.1 * scale * (0.85 + i * 0.05), 10, 8), puffMat);
    puff.position.set(x * scale, y * scale, z * scale);
    g.add(puff);
  });
  return g;
}

function buildCandySky(scene) {
  scene.background = new THREE.Color(0xffccee);
  scene.fog = new THREE.Fog(0xffe0f5, 45, 130);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0xff66bb) },
        bottomColor: { value: new THREE.Color(0xffeedd) },
        horizonColor: { value: new THREE.Color(0xffaacc) },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld).y * 0.5 + 0.5;
          vec3 col = mix(bottomColor, horizonColor, smoothstep(0.0, 0.45, h));
          col = mix(col, topColor, smoothstep(0.45, 1.0, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);
  return sky;
}

export function buildCandyKingdomWorld(scene, curve, root) {
  const world = new THREE.Group();
  world.name = 'candy-kingdom-world';
  root.add(world);

  buildCandySky(scene);

  // Marshmallow ground — no floating void
  const groundTex = makeCandyGroundTexture();
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(55, 48),
    new THREE.MeshStandardMaterial({
      map: groundTex, color: 0xffeedd, roughness: 0.92, emissive: 0xffccdd, emissiveIntensity: 0.04,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  world.add(ground);

  scene.add(new THREE.AmbientLight(0xffeedd, 0.6));
  scene.add(new THREE.HemisphereLight(0xffccff, 0xffeedd, 0.9));
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.45);
  sun.position.set(-25, 45, 20);
  sun.castShadow = true;
  scene.add(sun);
  const fill = new THREE.PointLight(0xff88cc, 0.75, 80);
  fill.position.set(20, 15, -10);
  scene.add(fill);

  // Cotton candy clouds in sky
  [
    { x: -18, y: 22, z: -12, s: 2.2, c: 0xffaacc },
    { x: 22, y: 26, z: 8, s: 1.8, c: 0xffccff },
    { x: -8, y: 20, z: 24, s: 1.6, c: 0xffeedd },
    { x: 14, y: 24, z: -22, s: 2.0, c: 0xff99cc },
  ].forEach(({ x, y, z, s, c }) => {
    const cloud = buildCottonCandyCloud(s, c);
    cloud.position.set(x, y, z);
    world.add(cloud);
  });

  // Marshmallow hills ring the circuit — closer and larger
  [0.08, 0.25, 0.42, 0.58, 0.72, 0.88].forEach((t, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * 14, 0);
    const hill = buildMarshmallowHill(4 + (i % 2), [0xfff0f5, 0xffe0ee, 0xffd6e8][i % 3]);
    hill.position.set(pos.x, -0.2, pos.z);
    hill.scale.setScalar(1.2 + (i % 2) * 0.3);
    world.add(hill);
  });

  // Cookie village beside start/finish straight — visible immediately
  const startFrame = sampleTrackFrame(curve, 0.04);
  [[0, 0], [7, 5], [-5, 7], [10, -4], [-8, -3]].forEach(([ox, oz], i) => {
    const house = buildCookieHouse(0.9 + (i % 2) * 0.25);
    house.position.set(startFrame.p.x + ox, 0, startFrame.p.z + oz);
    house.rotation.y = startFrame.rot + (i * 0.4);
    world.add(house);
  });

  // Gummy bears cheering beside track
  [0.12, 0.32, 0.52, 0.72, 0.88].forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * 8, 0);
    const bear = buildGummyBear([0xff4488, 0x44ff88, 0x4488ff, 0xffdd00, 0xff88ff][i % 5]);
    bear.position.set(pos.x, 0, pos.z);
    bear.scale.setScalar(1.6);
    bear.rotation.y = pos.x * 0.1;
    world.add(bear);
  });

  // Chocolate river beside hairpin
  const riverPos = placeAtTrack(curve, 0.48, 10, 0);
  const river = buildChocolateRiver(8, 22);
  river.position.set(riverPos.pos.x, -0.05, riverPos.pos.z);
  river.rotation.y = riverPos.frame?.rot ?? 0;
  river.userData.riverMesh = river.children[0];
  world.add(river);

  // Donut tunnel arch over track — drive through it
  const tunnel = buildDonutTunnelArch(curve, 0.55, 3.5);
  world.add(tunnel);

  // Giant decorative donut beside tunnel
  const sideDonut = buildDonut(1.4);
  const sidePos = placeAtTrack(curve, 0.55, 11, 0);
  sideDonut.position.set(sidePos.pos.x, 2, sidePos.pos.z);
  world.add(sideDonut);

  // Candy castle overlooking back straight — closer
  const castlePos = placeAtTrack(curve, 0.78, 14, 0);
  const castle = buildCandyCastle();
  castle.position.set(castlePos.pos.x, 0, castlePos.pos.z);
  castle.scale.setScalar(1.15);
  world.add(castle);

  // Lollipops lining the track — candy cane forest
  [0.06, 0.18, 0.28, 0.4, 0.52, 0.65, 0.78, 0.9].forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * 6.5, 0);
    const colors = [0xff4488, 0x44ccff, 0xffdd00, 0x88ff44, 0xff88ff];
    const pop = buildLollipop(4.5 + (i % 2), colors[i % colors.length]);
    pop.position.copy(pos);
    world.add(pop);
  });

  const signs = [
    { t: 0.05, name: 'COOKIE VILLAGE', sub: 'Welcome to Candy Kingdom!' },
    { t: 0.30, name: 'CHOCOLATE RIVER', sub: 'Don\'t fall in!' },
    { t: 0.55, name: 'DONUT TUNNEL', sub: 'Speed through!' },
    { t: 0.80, name: 'SUGAR RUSH', sub: 'Final sprint!' },
  ];
  signs.forEach(({ t, name, sub }) => {
    const sign = buildSectionSign(name, sub, 0xff88cc);
    sign.position.copy(placeAtTrack(curve, t, 8, 3.5).pos);
    world.add(sign);
  });

  scatterCollectiblesAlongTrack(scene, curve,
    [0.08, 0.15, 0.22, 0.35, 0.42, 0.55, 0.62, 0.75, 0.85, 0.92],
    'coin', 15,
  );
  scatterCollectiblesAlongTrack(scene, curve,
    [0.12, 0.28, 0.45, 0.58, 0.72, 0.88],
    'star', 30,
  );

  return {
    world,
    update(time) {
      updateCollectibleAnimations(scene, time);
      if (river.userData.riverMesh?.material) {
        river.userData.riverMesh.material.emissiveIntensity = 0.1 + Math.sin(time * 1.5) * 0.05;
      }
      if (tunnel.userData.portal) {
        tunnel.userData.portal.material.opacity = 0.18 + Math.sin(time * 2.5) * 0.08;
      }
    },
  };
}
