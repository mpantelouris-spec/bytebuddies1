/**
 * RainbowRoadWorld.js — Magical floating cosmic highway.
 * NOT a test track. A destination children want to explore.
 *
 * Sections:
 *   1 Star Launch Platform
 *   2 Nebula Run
 *   3 Crystal Canyon
 *   4 Planet Ring Highway
 *   5 Cosmic Portal Zone
 *   6 Galaxy Spiral
 *   7 Final Star Bridge
 */
import * as THREE from 'three';
import {
  sampleTrackFrame, placeAtTrack, buildSectionSign, buildCrystal,
  buildStarCollectible, addCollectible, animateCollectible,
  scatterCollectiblesAlongTrack, updateCollectibleAnimations,
} from '../GameWorldBuilder.js';
import {
  buildSpaceSkybox, buildRingedPlanet, buildMoon, buildStarParticles, buildNebulaSprites, buildAsteroidField,
} from '../RainbowRoadEnvironment.js';

function buildObservatory() {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x223355, emissive: 0x1144aa, emissiveIntensity: 0.4, metalness: 0.7, roughness: 0.2,
      transparent: true, opacity: 0.85,
    }),
  );
  dome.position.y = 3;
  g.add(dome);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 6, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0x334466, metalness: 0.5, roughness: 0.4 }),
  );
  base.position.y = 1.5;
  g.add(base);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x8899bb, emissive: 0x4466aa, emissiveIntensity: 0.3 }),
    );
    pillar.position.set(Math.cos(a) * 5.2, 4, Math.sin(a) * 5.2);
    g.add(pillar);
  }
  const scope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xccddee, metalness: 0.8 }),
  );
  scope.rotation.z = Math.PI / 4;
  scope.position.set(2, 6, 0);
  g.add(scope);
  const gateLight = new THREE.PointLight(0x88ccff, 2.5, 25);
  gateLight.position.set(0, 5, 0);
  g.add(gateLight);
  return g;
}

function buildLaunchGateway() {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 12, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xeeeeff, emissive: 0xaaccff, emissiveIntensity: 0.6 }),
    );
    col.position.set(side * 5, 6, 0);
    g.add(col);
  }
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(5.5, 0.35, 8, 32, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x88aaff, emissiveIntensity: 1.2 }),
  );
  arch.rotation.x = Math.PI / 2;
  arch.position.y = 12;
  g.add(arch);
  const portal = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 32),
    new THREE.MeshBasicMaterial({
      color: 0x4488ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  );
  portal.position.z = 0.1;
  portal.position.y = 8;
  g.add(portal);
  g.userData.portal = portal;
  return g;
}

function buildNebulaCloud(color, scale = 1) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  spr.scale.set(35 * scale, 25 * scale, 1);
  return spr;
}

function buildShootingStarSystem(scene) {
  const stars = [];
  for (let i = 0; i < 6; i++) {
    const trail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.08, 3, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    trail.visible = false;
    scene.add(trail);
    stars.push({
      mesh: trail,
      next: Math.random() * 8 + 2,
      timer: Math.random() * 5,
    });
  }
  return {
    update(dt, time) {
      stars.forEach((s) => {
        s.timer += dt;
        if (s.timer > s.next) {
          s.timer = 0;
          s.next = 4 + Math.random() * 10;
          s.mesh.visible = true;
          s.mesh.position.set(
            (Math.random() - 0.5) * 80,
            15 + Math.random() * 20,
            (Math.random() - 0.5) * 80,
          );
          s.mesh.rotation.set(Math.random(), Math.random(), Math.random());
          s.life = 0.6;
        }
        if (s.mesh.visible && s.life != null) {
          s.life -= dt;
          s.mesh.position.x += dt * 25;
          s.mesh.position.y -= dt * 8;
          if (s.life <= 0) s.mesh.visible = false;
        }
      });
    },
  };
}

function buildCrystalCluster(count = 5, spread = 8) {
  const g = new THREE.Group();
  const colors = [0x88ccff, 0xff88cc, 0x88ffcc, 0xcc88ff, 0xffcc88];
  for (let i = 0; i < count; i++) {
    const crystal = buildCrystal({
      height: 3 + Math.random() * 5,
      color: colors[i % colors.length],
      emissive: colors[i % colors.length],
    });
    crystal.position.set(
      (Math.random() - 0.5) * spread,
      0,
      (Math.random() - 0.5) * spread,
    );
    crystal.rotation.y = Math.random() * Math.PI;
    crystal.scale.setScalar(0.8 + Math.random() * 0.6);
    g.add(crystal);
  }
  return g;
}

function buildLaserBeam(from, to, color = 0xff4488) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, len, 6),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }),
  );
  beam.position.copy(from).add(to).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return beam;
}

function buildPlanetRing(planetCenter, radius = 28) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 1.2, 8, 64),
    new THREE.MeshStandardMaterial({
      color: 0xccaa88, emissive: 0x886644, emissiveIntensity: 0.3, transparent: true, opacity: 0.75,
    }),
  );
  ring.rotation.x = Math.PI / 2.5;
  g.add(ring);
  g.position.copy(planetCenter);
  g.userData.ring = ring;
  return g;
}

function buildWormhole(radius = 5) {
  const g = new THREE.Group();
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.5, 16, 48),
    new THREE.MeshStandardMaterial({
      color: 0x8844ff, emissive: 0x6622cc, emissiveIntensity: 1.5, transparent: true, opacity: 0.9,
    }),
  );
  g.add(torus);
  const swirl = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.85, 32),
    new THREE.MeshBasicMaterial({
      color: 0x220044, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }),
  );
  g.add(swirl);
  const light = new THREE.PointLight(0xaa66ff, 2, 20);
  g.add(light);
  g.userData.torus = torus;
  g.userData.swirl = swirl;
  return g;
}

function buildSpaceCastle() {
  const g = new THREE.Group();
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x8899cc, emissive: 0x334488, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5,
  });
  [[-3, 0], [3, 0], [0, -3], [0, 3]].forEach(([x, z], i) => {
    const h = 8 + i * 2;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, h, 8), towerMat);
    tower.position.set(x * 2, h / 2, z * 2);
    g.add(tower);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 8), towerMat);
    spire.position.set(x * 2, h + 1.5, z * 2);
    g.add(spire);
  });
  const keep = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 6), towerMat);
  keep.position.y = 2.5;
  g.add(keep);
  const windowLight = new THREE.PointLight(0x88aaff, 1.5, 15);
  windowLight.position.y = 4;
  g.add(windowLight);
  return g;
}

function buildAsteroid(size = 2) {
  const geo = new THREE.IcosahedronGeometry(size, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) * (0.85 + Math.random() * 0.3));
    pos.setY(i, pos.getY(i) * (0.85 + Math.random() * 0.3));
    pos.setZ(i, pos.getZ(i) * (0.85 + Math.random() * 0.3));
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.95, metalness: 0.05 }),
  );
  return mesh;
}

function buildFinishGate(halfWidth = 3.75) {
  const g = new THREE.Group();
  const trackWidth = halfWidth * 2;
  const scale = trackWidth / 12;
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffee88,
    emissiveIntensity: 1.6,
    metalness: 0.2,
    roughness: 0.35,
  });

  for (const side of [-1, 1]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.75, 15, 0.75), pillarMat);
    col.position.set(side * (trackWidth / 2 + 0.35) / scale, 7.5, 0);
    g.add(col);
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 15.2, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffee00, emissive: 0xffdd00, emissiveIntensity: 2.2 }),
    );
    trim.position.set(side * (trackWidth / 2 + 0.35) / scale, 7.5, 0.42);
    g.add(trim);
  }

  const beamMat = new THREE.MeshStandardMaterial({
    color: 0xffee00,
    emissive: 0xffcc00,
    emissiveIntensity: 1.8,
    metalness: 0.15,
    roughness: 0.3,
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(trackWidth / scale + 0.6, 0.55, 0.55), beamMat);
  beam.position.set(0, 14.2, 0);
  g.add(beam);

  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffee00';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, c.width - 12, c.height - 12);
  ctx.font = 'bold 56px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  ctx.strokeText('START / FINISH', c.width / 2, c.height / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('START / FINISH', c.width / 2, c.height / 2);
  const signTex = new THREE.CanvasTexture(c);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(trackWidth / scale + 0.2, 2.4),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  sign.position.set(0, 14.6, 0.25);
  g.add(sign);

  const bulbs = [];
  const bulbCount = 9;
  for (let i = 0; i < bulbCount; i++) {
    const col = i % 2 ? 0xff2266 : 0x44ff88;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 10),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.4 }),
    );
    bulb.position.set(
      -trackWidth / (2 * scale) + 0.35 + (i / (bulbCount - 1)) * (trackWidth / scale - 0.7),
      14.0,
      0.45,
    );
    g.add(bulb);
    bulbs.push(bulb);
  }

  g.scale.setScalar(scale);
  g.userData.bulbs = bulbs;
  return g;
}

function buildComet() {
  const g = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x88ccff, emissiveIntensity: 1.0 }),
  );
  g.add(head);
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 6, 8),
    new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }),
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.z = 3;
  g.add(tail);
  return g;
}

/** Build the complete Rainbow Road game world. */
export function buildRainbowRoadWorld(scene, curve, root, opts = {}) {
  const halfWidth = opts.halfWidth ?? 3.75;
  const qp = scene.userData?.qualityPreset || {};
  const worldLod = qp.worldLod ?? 1;
  const maxLights = qp.maxPointLights ?? 8;
  // More aggressive thresholds: medium tier (worldLod ~0.75) now treated as reduced
  const minimal = worldLod < 0.7;
  const reduced = worldLod < 0.9;
  const world = new THREE.Group();
  world.name = 'rainbow-road-world';
  root.add(world);

  const skySeg = worldLod >= 0.95 ? { width: 40, height: 28 } : { width: 12, height: 10 };
  const sky = buildSpaceSkybox(scene, 90, { segments: skySeg, worldLod });
  const planet = buildRingedPlanet(scene, { x: -70, y: 45, z: -120, radius: 22, ringRadius: 34 });
  const moon = reduced ? null : buildMoon(scene, { x: 55, y: 18, z: -90, radius: 5 });
  // Drastically reduce particle counts for better performance
  const starCount = minimal ? 15 : reduced ? 30 : 60;
  const stars = buildStarParticles(scene, starCount);
  // Only enable shooting stars on high tier
  const shootingStars = worldLod >= 0.95 ? buildShootingStarSystem(scene) : { update: () => {} };
  // Fewer asteroids
  const asteroidCount = minimal ? 2 : reduced ? 4 : 6;
  const asteroids = buildAsteroidField(scene, asteroidCount);

  const animProps = [];

  const sections = [
    { t: 0.02, name: 'STAR LAUNCH', sub: 'Observatory Gateway', color: 0x88ccff },
    { t: 0.16, name: 'NEBULA RUN', sub: 'Cosmic Clouds', color: 0xff88cc },
    { t: 0.30, name: 'CRYSTAL CANYON', sub: 'Laser Reflections', color: 0x88ffcc },
    { t: 0.44, name: 'PLANET RINGS', sub: 'Upside-Down Highway', color: 0xffcc88 },
    { t: 0.58, name: 'COSMIC PORTALS', sub: 'Wormhole Zone', color: 0xaa66ff },
    { t: 0.72, name: 'GALAXY SPIRAL', sub: 'Helix of Stars', color: 0x44aaff },
    { t: 0.88, name: 'STAR BRIDGE', sub: 'Rainbow Finale', color: 0xffdd44 },
  ];

  let ringGroup = null;

  if (!minimal) {
    // ── Section 1: Star Launch Platform ──
    if (!reduced) {
      const s1 = placeAtTrack(curve, 0.02, -22, 4);
      const observatory = buildObservatory();
      observatory.position.copy(s1.pos);
      observatory.position.y += 8;
      observatory.scale.setScalar(0.85);
      world.add(observatory);

      const s1gate = placeAtTrack(curve, 0.04, 20, 6);
      const gateway = buildLaunchGateway();
      gateway.position.copy(s1gate.pos);
      gateway.position.y += 2;
      gateway.scale.setScalar(0.75);
      const { rot: gateRot } = sampleTrackFrame(curve, 0.04);
      gateway.rotation.y = gateRot;
      world.add(gateway);
      animProps.push({ portal: gateway.userData.portal, speed: 0.8 });

      const sign1 = buildSectionSign('STAR LAUNCH', 'Observatory Gateway', 0x88ccff);
      sign1.position.copy(s1.pos);
      sign1.position.y += 6;
      sign1.lookAt(0, sign1.position.y, 0);
      world.add(sign1);
    }

    // ── Section 2: Nebula Run ──
    if (!reduced) {
      [0.14, 0.18, 0.22].forEach((t, i) => {
        const { pos } = placeAtTrack(curve, t, (i - 1) * 18, 5);
        const cloud = buildNebulaCloud([0x8844cc, 0x44aaaa, 0xcc4488][i], 0.8 + i * 0.2);
        cloud.position.copy(pos);
        world.add(cloud);
        animProps.push({ cloud, drift: 0.3 + i * 0.1, phase: i });
      });

      const sign2 = buildSectionSign('NEBULA RUN', 'Ride the cosmic clouds', 0xff88cc);
      sign2.position.copy(placeAtTrack(curve, 0.16, 14, 4).pos);
      world.add(sign2);

      [0.12, 0.24].forEach((t, i) => {
        const comet = buildComet();
        const { p: pos, rot } = sampleTrackFrame(curve, t);
        comet.position.copy(pos);
        comet.position.add(new THREE.Vector3(15 * (i ? -1 : 1), 8, 0));
        comet.rotation.y = rot;
        world.add(comet);
        animProps.push({ comet, orbit: 0.15 + i * 0.05, center: comet.position.clone() });
      });
    }

    // ── Section 3: Crystal Canyon ──
    if (!reduced) {
      [0.28, 0.32, 0.36].forEach((t) => {
        const { pos } = placeAtTrack(curve, t, 16, 0);
        const cluster = buildCrystalCluster(4 + Math.floor(Math.random() * 3), 10);
        cluster.position.copy(pos);
        world.add(cluster);
        cluster.children.forEach((c) => {
          if (c.userData.crystalMat) animProps.push({ crystalMat: c.userData.crystalMat, phase: Math.random() * 6 });
        });
      });

      const c1 = placeAtTrack(curve, 0.30, 10, 2).pos;
      const c2 = placeAtTrack(curve, 0.34, -10, 6).pos;
      world.add(buildLaserBeam(c1, c2, 0xff4488));

      const sign3 = buildSectionSign('CRYSTAL CANYON', 'Dodge the laser beams!', 0x88ffcc);
      sign3.position.copy(placeAtTrack(curve, 0.30, -14, 3).pos);
      world.add(sign3);
    }

    // ── Section 4: Planet Ring Highway ──
    const ringCenter = new THREE.Vector3(-55, -95, -40);
    ringGroup = buildPlanetRing(ringCenter, 32);
    world.add(ringGroup);

    if (!reduced) {
      const sign4 = buildSectionSign('PLANET RINGS', 'Drive the ring highway!', 0xffcc88);
      sign4.position.copy(placeAtTrack(curve, 0.44, 12, 5).pos);
      world.add(sign4);
    }

    // ── Section 5: Cosmic Portal Zone ──
    if (!reduced) {
      [0.54, 0.60, 0.66].forEach((t, i) => {
        const { p: pos, rot } = sampleTrackFrame(curve, t);
        const wormhole = buildWormhole(4 + i * 0.5);
        wormhole.position.copy(pos);
        wormhole.position.y += 4 + i * 2;
        wormhole.position.add(new THREE.Vector3(Math.sin(rot) * 10, 0, Math.cos(rot) * 10));
        world.add(wormhole);
        animProps.push({ wormhole, speed: 0.6 + i * 0.2 });
      });

      const castle = buildSpaceCastle();
      castle.position.copy(placeAtTrack(curve, 0.58, -20, 8).pos);
      world.add(castle);

      const sign5 = buildSectionSign('COSMIC PORTALS', 'Choose your route!', 0xaa66ff);
      sign5.position.copy(placeAtTrack(curve, 0.58, 15, 6).pos);
      world.add(sign5);
    }

    // ── Section 6: Galaxy Spiral ──
    if (!reduced) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 4;
        const r = 8 + i * 1.2;
        const star = buildStarCollectible(0.6 + (i % 3) * 0.15, [0xff4488, 0x44ff88, 0x4488ff][i % 3]);
        const { pos } = placeAtTrack(curve, 0.68 + i * 0.008, Math.cos(a) * r * 0.3, Math.sin(a) * 2);
        star.position.copy(pos);
        world.add(star);
        animProps.push({ star, spin: 0.8 + i * 0.05 });
      }

      const sign6 = buildSectionSign('GALAXY SPIRAL', 'Hold on tight!', 0x44aaff);
      sign6.position.copy(placeAtTrack(curve, 0.72, -12, 8).pos);
      world.add(sign6);

      for (let i = 0; i < 4; i++) {
        const ast = buildAsteroid(1.2 + Math.random() * 0.6);
        const { pos } = placeAtTrack(curve, 0.72 + i * 0.02, 22 + i * 4, 8);
        ast.position.copy(pos);
        world.add(ast);
        animProps.push({
          asteroid: ast,
          orbitSpeed: 0.15 + i * 0.06,
          orbitR: 4 + i * 1.5,
          center: pos.clone(),
          angle: i * 1.2,
        });
      }
    }

    if (!reduced) {
      const sign7 = buildSectionSign('STAR BRIDGE', 'Rainbow to the stars!', 0xffdd44);
      sign7.position.copy(placeAtTrack(curve, 0.88, 10, 6).pos);
      world.add(sign7);
    }

    // Floating space castles in distance — high LOD only
    if (!reduced) {
      [[-40, 15, -60], [50, 20, -50], [-30, 25, 40], [45, 18, 35]].forEach(([x, y, z]) => {
        const sc = buildSpaceCastle();
        sc.position.set(x, y, z);
        sc.scale.setScalar(0.6 + Math.random() * 0.4);
        world.add(sc);
      });
    }

    // Collectibles — drastically reduced on medium/low for performance
    const starTs = [0.08, 0.12, 0.20, 0.28, 0.36, 0.48, 0.56, 0.64, 0.74, 0.82, 0.90, 0.94];
    const coinTs = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.92];
    // Minimal: no collectibles. Reduced: quarter of collectibles. High: half.
    const pickTs = (ts) => {
      if (minimal) return [];
      if (reduced) return ts.filter((_, i) => i % 4 === 0);
      return ts.filter((_, i) => i % 2 === 0);
    };
    scatterCollectiblesAlongTrack(scene, curve, pickTs(starTs), 'star', 25);
    scatterCollectiblesAlongTrack(scene, curve, pickTs(coinTs), 'coin', 10);
  }

  // Start/finish line is built by RacingCourse (buildRacingStartLine).
  const finishT = opts.finishT ?? 0;
  const startLineT = opts.startLineT ?? finishT;
  const linePos = opts.startLinePosition;
  const lineHeading = opts.startLineHeading ?? Math.PI;
  const finishEps = 0.004;
  let finishP;
  let finishRot;
  if (linePos) {
    const ref = curve.getPointAt(startLineT);
    finishP = new THREE.Vector3(linePos.x, ref.y, linePos.z);
    finishRot = lineHeading;
  } else {
    finishP = curve.getPointAt(startLineT);
    const finishAhead = curve.getPointAt((startLineT + finishEps) % 1);
    finishRot = Math.atan2(finishAhead.x - finishP.x, finishAhead.z - finishP.z);
  }
  const finishGate = buildFinishGate(halfWidth);
  finishGate.position.copy(finishP);
  finishGate.rotation.y = finishRot + Math.PI;
  world.add(finishGate);
  animProps.push({ finishGate, blink: true });

  // ── Boost pads — glowing cyan/blue tiles set into the track surface ────
  const boostMat = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    emissive: 0x0066ff,
    emissiveIntensity: 2.5,
    roughness: 0.1,
    metalness: 0.6,
    transparent: true,
    opacity: 0.85,
  });
  const boostGeo = new THREE.BoxGeometry(3.5, 0.15, 1.8);
  const boostPositions = minimal ? [0.28, 0.64] : [0.10, 0.28, 0.46, 0.64, 0.82];
  const boostPads = [];
  boostPositions.forEach((bt) => {
    const frame = sampleTrackFrame(curve, bt);
    const { p, tan } = frame;
    const pad = new THREE.Mesh(boostGeo, boostMat.clone());
    pad.position.copy(p);
    pad.position.y += 0.22;
    pad.lookAt(p.clone().add(tan));
    pad.userData.boostT = bt;
    world.add(pad);
    boostPads.push(pad);
    if (!minimal) {
      const chevGeo = new THREE.PlaneGeometry(2.8, 1.2);
      const chevMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      const chev = new THREE.Mesh(chevGeo, chevMat);
      chev.position.copy(p);
      chev.position.y += 0.30;
      chev.lookAt(p.clone().add(tan));
      chev.rotateX(Math.PI / 2);
      world.add(chev);
    }
  });

  // Point lights are expensive — only on high tier
  const TRACK_LIGHT_COUNT = worldLod >= 0.95 ? Math.min(2, maxLights) : 0;
  const trackLights = [];
  for (let i = 0; i < TRACK_LIGHT_COUNT; i++) {
    const t = i / TRACK_LIGHT_COUNT;
    const { p } = sampleTrackFrame(curve, t);
    const hue = (t * 360) % 360;
    const col = new THREE.Color().setHSL(hue / 360, 0.9, 0.55);
    const light = new THREE.PointLight(col.getHex(), 0.6, 15);
    light.castShadow = false;
    light.position.copy(p);
    light.position.y += 0.5;
    world.add(light);
    trackLights.push({ light, t, base: 0.6 });
  }

  let _updateSkip = 0;
  const _ringGroup = ringGroup;
  // Throttle factor: skip some frames on lower tiers
  const _skipMod = minimal ? 4 : reduced ? 2 : 1;

  return {
    world,
    sections,
    update(time, dt) {
      _updateSkip = (_updateSkip + 1) % _skipMod;
      
      // Boost pads need responsive feedback every frame
      boostPads.forEach((pad) => {
        pad.material.emissiveIntensity = 2.0 + Math.sin(time * 4 + pad.userData.boostT * 10) * 0.8;
      });
      
      // Skip expensive updates on some frames for low/medium
      if (_updateSkip !== 0) return;
      
      sky.update(time);
      planet.update(dt);
      stars.update(time);
      shootingStars.update(dt, time);
      asteroids.update(dt);
      
      // Skip collectible animations on minimal tier
      if (!minimal) updateCollectibleAnimations(scene, time);

      // Animate decorative props
      if (!minimal) {
        animProps.forEach((a) => {
          if (a.portal) a.portal.material.opacity = 0.35 + Math.sin(time * a.speed * 3) * 0.15;
          if (a.cloud) {
            a.cloud.position.x += Math.sin(time * 0.3 + a.phase) * dt * 0.5;
            a.cloud.material.opacity = 0.45 + Math.sin(time * 0.5 + a.phase) * 0.12;
          }
          if (a.comet) {
            a.comet.position.x = a.center.x + Math.cos(time * a.orbit) * 8;
            a.comet.position.z = a.center.z + Math.sin(time * a.orbit) * 8;
          }
          if (a.crystalMat) a.crystalMat.emissiveIntensity = 0.7 + Math.sin(time * 2 + a.phase) * 0.35;
          if (a.wormhole) {
            a.wormhole.rotation.z += dt * a.speed;
            a.wormhole.userData.swirl.rotation.z -= dt * a.speed * 1.5;
          }
          if (a.star) a.star.rotation.y += dt * (a.spin ?? 1);
          if (a.asteroid) {
            a.angle += dt * a.orbitSpeed;
            a.asteroid.position.x = a.center.x + Math.cos(a.angle) * a.orbitR;
            a.asteroid.position.z = a.center.z + Math.sin(a.angle) * a.orbitR;
            a.asteroid.rotation.x += dt * 0.4;
            a.asteroid.rotation.y += dt * 0.25;
          }
          if (a.finishGate?.blink) {
            a.finishGate.userData.bulbs?.forEach((b, i) => {
              b.material.emissiveIntensity = 0.6 + Math.sin(time * 6 + i * 0.8) * 0.6;
            });
          }
        });
      }

      trackLights.forEach(({ light, t, base }) => {
        const hue = ((t * 360) - time * 30) % 360;
        light.color.setHSL(hue / 360, 0.95, 0.55);
        light.intensity = base + Math.sin(time * 4 + t * 20) * 0.3;
      });

      if (_ringGroup?.userData.ring) _ringGroup.userData.ring.rotation.z += dt * 0.05;
    },
  };
}
