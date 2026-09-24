/**
 * VolcanoDriftWorld.js — Mario Kart-style volcano adventure world.
 * Obsidian rock arches, lava rivers, ash clouds, fire geysers.
 */
import * as THREE from 'three';
import {
  sampleTrackFrame, placeAtTrack, buildSectionSign,
  scatterCollectiblesAlongTrack, updateCollectibleAnimations,
} from '../GameWorldBuilder.js';

function makeAshGroundTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `hsla(${10 + Math.random() * 20}, 60%, ${15 + Math.random() * 20}%, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `hsla(${20 + Math.random() * 20}, 90%, 55%, 0.18)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 6, 3 + Math.random() * 6);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function buildLavaPool(width = 12, length = 16) {
  const g = new THREE.Group();
  const lava = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshStandardMaterial({
      color: 0xff4400, emissive: 0xff5500, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.1,
    }),
  );
  lava.rotation.x = -Math.PI / 2;
  g.add(lava);
  g.userData.lavaMesh = lava;
  const glow = new THREE.PointLight(0xff5500, 3.5, 30);
  glow.position.y = 2;
  g.add(glow);
  return g;
}

function buildObsidianSpire(height = 8, radius = 1.4) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1014, roughness: 0.6, emissive: 0xff3300, emissiveIntensity: 0.06 });
  const spire = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mat);
  spire.position.y = height / 2;
  g.add(spire);
  for (let i = 0; i < 3; i++) {
    const crack = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, height * 0.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff5500, emissiveIntensity: 1.2 }),
    );
    const a = (i / 3) * Math.PI * 2;
    crack.position.set(Math.cos(a) * radius * 0.6, height * 0.35, Math.sin(a) * radius * 0.6);
    crack.rotation.z = a;
    g.add(crack);
  }
  return g;
}

function buildFireGeyser(scale = 1) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2 * scale, 1.6 * scale, 0.6 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0x3a1a0a, roughness: 0.7 }),
  );
  base.position.y = 0.3 * scale;
  g.add(base);
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00, emissive: 0xff6600, emissiveIntensity: 1.4, transparent: true, opacity: 0.85,
  });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7 * scale, 3 * scale, 8), flameMat);
  flame.position.y = 1.9 * scale;
  g.add(flame);
  g.userData.flame = flame;
  const fireLight = new THREE.PointLight(0xff7700, 1.8, 14);
  fireLight.position.y = 2 * scale;
  g.add(fireLight);
  return g;
}

function buildLavaArch(curve, t, halfWidth) {
  const frame = sampleTrackFrame(curve, t);
  const g = new THREE.Group();
  const archW = halfWidth * 2 + 2.5;
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x1a1014, emissive: 0xff3300, emissiveIntensity: 0.25, roughness: 0.55,
  });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 7.5, 8), pillarMat);
    pillar.position.set(side * (archW / 2), 3.75, 0);
    g.add(pillar);
  }
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(archW / 2 + 0.2, 0.5, 10, 32, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2a1810, emissive: 0xff4400, emissiveIntensity: 0.55, roughness: 0.5 }),
  );
  arch.rotation.x = Math.PI / 2;
  arch.position.y = 7.5;
  g.add(arch);
  const portal = new THREE.Mesh(
    new THREE.CircleGeometry(archW / 2 - 0.3, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  portal.rotation.x = Math.PI / 2;
  portal.position.y = 3.8;
  g.add(portal);
  g.userData.portal = portal;
  g.position.copy(frame.p);
  g.position.y = 0;
  g.rotation.y = frame.rot;
  return g;
}

function buildVolcanoMountain() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.85, emissive: 0xff4400, emissiveIntensity: 0.1 });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(14, 20, 12), mat);
  cone.position.y = 10;
  g.add(cone);
  const craterGlow = new THREE.Mesh(
    new THREE.CircleGeometry(4, 16),
    new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff6600, emissiveIntensity: 1.5 }),
  );
  craterGlow.rotation.x = -Math.PI / 2;
  craterGlow.position.y = 19.5;
  g.add(craterGlow);
  const smokeLight = new THREE.PointLight(0xff6600, 4, 50);
  smokeLight.position.y = 20;
  g.add(smokeLight);
  return g;
}

function buildAshCloud(scale = 1, color = 0x4a3838) {
  const g = new THREE.Group();
  const puffMat = new THREE.MeshStandardMaterial({
    color, transparent: true, opacity: 0.7, roughness: 1, emissive: 0x331111, emissiveIntensity: 0.1,
  });
  [[0, 0, 0], [1.2, 0.3, 0.4], [-1, 0.2, -0.3], [0.4, 0.5, -0.8]].forEach(([x, y, z], i) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.1 * scale * (0.85 + i * 0.05), 10, 8), puffMat);
    puff.position.set(x * scale, y * scale, z * scale);
    g.add(puff);
  });
  return g;
}

function buildVolcanoSky(scene) {
  scene.background = new THREE.Color(0x3a1a14);
  scene.fog = new THREE.Fog(0x4a2418, 40, 125);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x1a0a08) },
        bottomColor: { value: new THREE.Color(0xff6622) },
        horizonColor: { value: new THREE.Color(0xcc4411) },
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
          vec3 col = mix(bottomColor, horizonColor, smoothstep(0.0, 0.4, h));
          col = mix(col, topColor, smoothstep(0.4, 1.0, h));
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

export function buildVolcanoDriftWorld(scene, curve, root) {
  const world = new THREE.Group();
  world.name = 'volcano-drift-world';
  root.add(world);

  buildVolcanoSky(scene);

  const groundTex = makeAshGroundTexture();
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(55, 48),
    new THREE.MeshStandardMaterial({
      map: groundTex, color: 0x4a2818, roughness: 0.95, emissive: 0xff3300, emissiveIntensity: 0.03,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  world.add(ground);

  scene.add(new THREE.AmbientLight(0xff8855, 0.55));
  scene.add(new THREE.HemisphereLight(0xff9966, 0x2a1208, 0.85));
  const sun = new THREE.DirectionalLight(0xffaa77, 1.3);
  sun.position.set(-25, 40, 20);
  sun.castShadow = true;
  scene.add(sun);
  const fill = new THREE.PointLight(0xff5500, 0.9, 80);
  fill.position.set(20, 15, -10);
  scene.add(fill);

  // Ash clouds drifting overhead
  [
    { x: -18, y: 22, z: -12, s: 2.4, c: 0x4a3838 },
    { x: 22, y: 26, z: 8, s: 2.0, c: 0x5a3030 },
    { x: -8, y: 20, z: 24, s: 1.8, c: 0x3a2828 },
    { x: 14, y: 24, z: -22, s: 2.2, c: 0x4a2c2c },
  ].forEach(({ x, y, z, s, c }) => {
    const cloud = buildAshCloud(s, c);
    cloud.position.set(x, y, z);
    world.add(cloud);
  });

  // Towering volcano centerpiece overlooking the track
  const volcanoPos = placeAtTrack(curve, 0.5, 22, 0);
  const volcano = buildVolcanoMountain();
  volcano.position.set(volcanoPos.pos.x, 0, volcanoPos.pos.z);
  world.add(volcano);

  // Obsidian spires ring the circuit
  [0.08, 0.25, 0.42, 0.58, 0.72, 0.88].forEach((t, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * 13, 0);
    const spire = buildObsidianSpire(6 + (i % 3) * 2, 1.2 + (i % 2) * 0.4);
    spire.position.set(pos.x, 0, pos.z);
    world.add(spire);
  });

  // Fire geysers lining the track
  [0.06, 0.18, 0.3, 0.45, 0.6, 0.75, 0.9].forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * 6.5, 0);
    const geyser = buildFireGeyser(0.9 + (i % 2) * 0.3);
    geyser.position.copy(pos);
    world.add(geyser);
  });

  // Lava pool beside hairpin
  const lavaPos = placeAtTrack(curve, 0.48, 10, 0);
  const lava = buildLavaPool(8, 22);
  lava.position.set(lavaPos.pos.x, -0.05, lavaPos.pos.z);
  lava.rotation.y = lavaPos.frame?.rot ?? 0;
  world.add(lava);

  // Obsidian arch over track — drive through it
  const arch = buildLavaArch(curve, 0.55, 3.5);
  world.add(arch);

  const signs = [
    { t: 0.05, name: 'CRATER PASS', sub: 'Welcome to Volcano Drift!' },
    { t: 0.30, name: 'MAGMA FLATS', sub: 'Watch the lava!' },
    { t: 0.55, name: 'OBSIDIAN GATE', sub: 'Speed through!' },
    { t: 0.80, name: 'ERUPTION SPRINT', sub: 'Final stretch!' },
  ];
  signs.forEach(({ t, name, sub }) => {
    const sign = buildSectionSign(name, sub, 0xff6622);
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

  const geysers = world.children.filter((c) => c.userData?.flame);

  return {
    world,
    update(time) {
      updateCollectibleAnimations(scene, time);
      if (lava.userData.lavaMesh?.material) {
        lava.userData.lavaMesh.material.emissiveIntensity = 0.75 + Math.sin(time * 2) * 0.2;
      }
      if (arch.userData.portal) {
        arch.userData.portal.material.opacity = 0.16 + Math.sin(time * 2.5) * 0.08;
      }
      geysers.forEach((g, i) => {
        if (g.userData.flame) {
          g.userData.flame.scale.y = 1 + Math.sin(time * 6 + i) * 0.3;
        }
      });
    },
  };
}
