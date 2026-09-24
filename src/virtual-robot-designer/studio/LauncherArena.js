/**
 * LauncherArena.js — "Sling-B's Rescue Mission"
 * Angry Birds-style educational physics arena.
 * Robot companion launches energy orbs to topple towers and free trapped bots.
 *
 * Blockly commands: MoveForward, TurnLeft, TurnRight, LaunchProjectile,
 *                   AimUp, AimDown, SetPower, WaitForLanding
 */

import * as THREE from 'three';

// ─── constants ───────────────────────────────────────────────────────────────
const GRAVITY   = -18;          // units/s²
const BLOCK_RESTITUTION = 0.28; // how bouncy blocks are
const ORB_RADIUS        = 0.22;
const MAX_PROJECTILES   = 8;

// ─── helpers ─────────────────────────────────────────────────────────────────
const mat = (hex, rough = 0.6, metal = 0.1, emissive = null) => {
  const m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
  if (emissive) { m.emissive.set(emissive); m.emissiveIntensity = 0.45; }
  return m;
};
const box = (w, h, d, hex, rough, metal) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex, rough, metal));

// ─── mover registration (consistent with engine format) ──────────────────────
const _mover = (scene, fn) => {
  (scene.userData.movers ||= []).push({ update: fn });
};

// ─── register collectible (trapped bot = collectible) ────────────────────────
const _reg = (scene, mesh, x, y, z, value = 10, radius = 1.0) => {
  (scene.userData.collectibles ||= []).push({
    mesh, pos: new THREE.Vector3(x, y, z),
    radius, value, collected: false,
  });
};

// ─── simple AABB physics for falling blocks ───────────────────────────────────
class PhysicsBlock {
  constructor(mesh, mass = 1) {
    this.mesh   = mesh;
    this.vel    = new THREE.Vector3();
    this.angVel = new THREE.Vector3();
    this.mass   = mass;
    this.active = false;  // only simulated after first impact
    this.onGround = false;
    this.halfSize = new THREE.Vector3();
    mesh.geometry.boundingBox
      ? mesh.geometry.boundingBox.getSize(this.halfSize).multiplyScalar(0.5)
      : this.halfSize.set(0.5, 0.5, 0.5);
  }

  update(dt) {
    if (!this.active) return;
    this.vel.y += GRAVITY * dt;

    this.mesh.position.addScaledVector(this.vel, dt);
    this.mesh.rotation.x += this.angVel.x * dt;
    this.mesh.rotation.z += this.angVel.z * dt;

    // floor collision (y=0 is ground)
    const floor = this.halfSize.y;
    if (this.mesh.position.y < floor) {
      this.mesh.position.y = floor;
      this.vel.y = -this.vel.y * BLOCK_RESTITUTION;
      this.vel.x *= 0.75;
      this.vel.z *= 0.75;
      this.angVel.multiplyScalar(0.6);
      if (Math.abs(this.vel.y) < 0.5) { this.vel.y = 0; this.onGround = true; }
    }
  }
}

// ─── projectile ───────────────────────────────────────────────────────────────
class EnergyOrb {
  constructor(scene, origin, direction, speed) {
    this.scene = scene;
    this.vel   = direction.clone().normalize().multiplyScalar(speed);
    this.alive = true;

    // Visual — glowing energy sphere
    const geo = new THREE.SphereGeometry(ORB_RADIUS, 14, 10);
    const mat2 = new THREE.MeshStandardMaterial({
      color: '#ffcc00', emissive: '#ff8800', emissiveIntensity: 2.2,
      roughness: 0.1, metalness: 0.4,
    });
    this.mesh = new THREE.Mesh(geo, mat2);
    this.mesh.position.copy(origin);
    scene.add(this.mesh);

    // Glow halo
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(ORB_RADIUS * 1.7, 10, 8),
      new THREE.MeshBasicMaterial({ color: '#ffee44', transparent: true, opacity: 0.18, side: THREE.BackSide }),
    );
    this.mesh.add(halo);

    // Trail particles (simple point cloud)
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(60 * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    this.trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({
      color: '#ffcc00', size: 0.12, transparent: true, opacity: 0.55,
    }));
    this.trailBuffer = trailPos;
    this.trailHead   = 0;
    scene.add(this.trail);

    this.age = 0;
  }

  update(dt, blocks) {
    if (!this.alive) return;
    this.age += dt;
    if (this.age > 6) { this._destroy(); return; }

    this.vel.y += GRAVITY * dt;
    this.mesh.position.addScaledVector(this.vel, dt);

    // Update trail
    const p = this.mesh.position;
    const ti = (this.trailHead % 20) * 3;
    this.trailBuffer[ti]     = p.x + (Math.random() - 0.5) * 0.08;
    this.trailBuffer[ti + 1] = p.y + (Math.random() - 0.5) * 0.08;
    this.trailBuffer[ti + 2] = p.z + (Math.random() - 0.5) * 0.08;
    this.trailHead++;
    this.trail.geometry.attributes.position.needsUpdate = true;

    // Ground hit
    if (this.mesh.position.y < ORB_RADIUS) {
      this._impactAt(this.mesh.position, blocks, 2.5);
      this._destroy();
      return;
    }

    // Block collision (AABB sphere test)
    for (const blk of blocks) {
      const bPos = blk.mesh.position;
      const hs   = blk.halfSize;
      const dx   = Math.abs(p.x - bPos.x) - hs.x;
      const dy   = Math.abs(p.y - bPos.y) - hs.y;
      const dz   = Math.abs(p.z - bPos.z) - hs.z;
      if (dx < ORB_RADIUS && dy < ORB_RADIUS && dz < ORB_RADIUS) {
        // Apply impulse to block
        blk.active = true;
        const impulse = this.vel.clone().multiplyScalar(0.55 / blk.mass);
        blk.vel.add(impulse);
        blk.angVel.set(
          (Math.random() - 0.5) * 4,
          0,
          (Math.random() - 0.5) * 4,
        );
        this._impactAt(p, blocks, 1.2);
        this._destroy();
        return;
      }
    }
  }

  _impactAt(pos, blocks, blastRadius) {
    // Splash impulse on nearby blocks
    for (const blk of blocks) {
      const dist = blk.mesh.position.distanceTo(pos);
      if (dist < blastRadius + 0.5) {
        blk.active = true;
        const dir    = blk.mesh.position.clone().sub(pos).normalize();
        const factor = Math.max(0, 1 - dist / (blastRadius + 0.5));
        blk.vel.addScaledVector(dir, factor * 8);
        blk.angVel.set((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6);
      }
    }

    // Impact flash
    const flash = new THREE.PointLight('#ffee88', 5, 4);
    flash.position.copy(pos);
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 160);
  }

  _destroy() {
    this.alive = false;
    this.scene.remove(this.mesh);
    this.scene.remove(this.trail);
  }
}

// ─── trapped robot (collectible beacon inside tower) ─────────────────────────
function _buildTrappedBot(scene, x, y, z, colorHex, index) {
  const g = new THREE.Group();

  // Cage frame
  const cageMat = mat('#aaaaaa', 0.7, 0.5);
  [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(([nx,ny,nz]) => {
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
      cageMat,
    );
    bar.position.set(nx * 0.35, ny * 0.35, nz * 0.35);
    if (nx !== 0) bar.rotation.z = Math.PI / 2;
    if (nz !== 0) bar.rotation.x = Math.PI / 2;
    g.add(bar);
  });

  // Tiny robot inside
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.2), mat(colorHex, 0.5, 0.3, colorHex));
  body.material.emissiveIntensity = 0.6;
  g.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.15, 0.15), mat(colorHex, 0.5, 0.3));
  head.position.y = 0.19;
  g.add(head);

  // Blinking distress light
  const distress = new THREE.PointLight(colorHex, 1.2, 1.4);
  g.add(distress);

  g.position.set(x, y, z);
  scene.add(g);

  _mover(scene, (t) => {
    distress.intensity = 0.6 + Math.abs(Math.sin(t * 6 + index)) * 1.4;
    body.rotation.y = t * 1.5;
  });

  _reg(scene, g, x, y, z, 20, 1.1);
  return g;
}

// ─── slingshot launcher ───────────────────────────────────────────────────────
function _buildSlingshot(scene, x, y, z) {
  const g = new THREE.Group();
  const wood = mat('#6b3a1f', 0.8, 0.05);

  // Y-shaped frame — two fork arms
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 1.8, 8), wood);
  trunk.position.y = 0.9;
  g.add(trunk);

  [[-0.22, 1.9, 0.3], [0.22, 1.9, 0.3]].forEach(([dx, dy, dz], i) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.7, 7), wood);
    arm.position.set(dx, dy, 0);
    arm.rotation.z = i === 0 ? -0.35 : 0.35;
    g.add(arm);

    // Rubber band end knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat('#ff2222', 0.4, 0.1));
    knob.position.set(dx * 1.35, dy + 0.15, 0);
    g.add(knob);
  });

  // Energy orb cradle (loaded orb, glowing)
  const cradle = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 10),
    new THREE.MeshStandardMaterial({ color: '#ffcc00', emissive: '#ff8800', emissiveIntensity: 1.8 }),
  );
  cradle.position.set(0, 1.95, 0.05);
  g.add(cradle);
  _mover(scene, (t) => { cradle.material.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.7; });

  // Glow light at cradle
  const cradleLight = new THREE.PointLight('#ffcc00', 1.5, 3.5);
  cradleLight.position.set(0, 1.95, 0.05);
  g.add(cradleLight);

  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ─── destructible tower builder ──────────────────────────────────────────────
/*
 * materials: 'wood' (brown), 'glass' (cyan transparent), 'stone' (grey)
 * Returns array of PhysicsBlock for collision/simulation.
 */
function _buildTower(scene, blocks, cx, cz, layout, material) {
  const MATS = {
    wood:  { color: '#8b5a2b', rough: 0.85, metal: 0.0 },
    glass: { color: '#aaeeff', rough: 0.1,  metal: 0.05, transparent: true, opacity: 0.62 },
    stone: { color: '#888888', rough: 0.9,  metal: 0.05 },
  };
  const m = MATS[material] || MATS.wood;
  const mainMat = new THREE.MeshStandardMaterial({
    color: m.color, roughness: m.rough, metalness: m.metal,
    transparent: !!m.transparent, opacity: m.opacity ?? 1,
  });

  for (const [col, row, w, h, d] of layout) {
    const bx = cx + col;
    const by = h / 2 + row;
    const bz = cz;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mainMat.clone());
    mesh.position.set(bx, by, bz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Compute bounding box for physics
    mesh.geometry.computeBoundingBox();
    const mass = material === 'stone' ? 2.5 : material === 'glass' ? 0.7 : 1;
    blocks.push(new PhysicsBlock(mesh, mass));
  }
}

// ─── decorative ground / arena ────────────────────────────────────────────────
function _buildGround(scene) {
  // Colourful grassy ground — low-poly vertex colours
  const geo = new THREE.PlaneGeometry(60, 36, 8, 6);
  geo.rotateX(-Math.PI / 2);
  geo.toNonIndexed();
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c1 = new THREE.Color('#5dbb63');
  const c2 = new THREE.Color('#4aaa55');
  for (let i = 0; i < pos.count; i += 3) {
    const c = Math.random() < 0.5 ? c1 : c2;
    col[i * 3]     = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    col[(i+1)*3]   = c.r; col[(i+1)*3+1] = c.g; col[(i+1)*3+2] = c.b;
    col[(i+2)*3]   = c.r; col[(i+2)*3+1] = c.g; col[(i+2)*3+2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Dirt path running from slingshot to towers
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 28),
    mat('#c4a265', 0.9, 0.0),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.01, -8);
  scene.add(path);
}

// ─── background scenery ───────────────────────────────────────────────────────
function _buildScenery(scene) {
  // Puffy cartoon clouds
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });
  [[12, 9, -18], [-15, 11, -22], [20, 7, -10], [-8, 14, -30]].forEach(([x, y, z]) => {
    const g = new THREE.Group();
    [[0,0,0,1.6],[1.3,0.3,0,1.2],[-1.2,0.2,0,1.1],[0.4,1.0,0,1.0]].forEach(([dx,dy,dz,r]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 9, 7), cloudMat);
      puff.position.set(dx, dy, dz);
      g.add(puff);
    });
    g.position.set(x, y, z);
    scene.add(g);
  });

  // Rolling hills backdrop
  [[18, 0, -18], [-18, 0, -18], [0, 0, -25]].forEach(([x, y, z]) => {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(5, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2),
      mat('#4aaa55', 0.9, 0),
    );
    hill.position.set(x, y, z);
    scene.add(hill);
  });

  // Trees
  [[14, 0, -4], [-14, 0, -4], [16, 0, -14], [-16, 0, -14]].forEach(([x, y, z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 7), mat('#6b3a1f', 0.9));
    trunk.position.set(x, 0.7, z);
    scene.add(trunk);
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.1, 9, 8), mat('#33aa44', 0.85));
    canopy.position.set(x, 2.1, z);
    scene.add(canopy);
  });

  // Score board / level sign near slingshot
  const sign = box(2.4, 1.2, 0.1, '#d4a017', 0.7, 0.1);
  sign.position.set(-3.5, 2.2, 5);
  scene.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 7), mat('#6b3a1f', 0.9));
  post.position.set(-3.5, 1.1, 5);
  scene.add(post);
}

// ─── lighting ─────────────────────────────────────────────────────────────────
function _setupLighting(scene) {
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.55));

  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a8c30, 0.65);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff8e1, 1.2);
  sun.position.set(12, 20, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far  = 80;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top   = 20;
  sun.shadow.camera.bottom = -5;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xaaddff, 0.35);
  fill.position.set(-10, 8, 5);
  scene.add(fill);
}

// ─── sky ──────────────────────────────────────────────────────────────────────
function _buildSky(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(200, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor:    { value: new THREE.Color('#1a7ad4') },
        bottomColor: { value: new THREE.Color('#e8f4fd') },
      },
      vertexShader: `
        varying float vY;
        void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        uniform vec3 topColor, bottomColor;
        varying float vY;
        void main() {
          float t = clamp(vY / 180.0, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `,
    }),
  );
  scene.add(sky);
  scene.userData.customSky = true;
}

// ─── win condition check ──────────────────────────────────────────────────────
function _setupWinZone(scene) {
  // Win when all 3 trapped bots are collected — finishZone is at the exit pad
  scene.userData.finishZone = { x: 0, z: -22, radius: 3.5 };

  // Visual finish pad
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 0.06, 24),
    mat('#ffdd00', 0.4, 0.3, '#ffcc00'),
  );
  pad.material.emissiveIntensity = 0.5;
  pad.position.set(0, 0.04, -22);
  scene.add(pad);

  const padLight = new THREE.PointLight('#ffffaa', 2.0, 8);
  padLight.position.set(0, 2, -22);
  scene.add(padLight);
  _mover(scene, (t) => { padLight.intensity = 1.4 + Math.sin(t * 3) * 0.8; });

  // Rotating goal ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.5, 0.1, 8, 40),
    new THREE.MeshStandardMaterial({ color: '#ffdd00', emissive: '#ffaa00', emissiveIntensity: 0.8 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.12, -22);
  scene.add(ring);
  _mover(scene, (t) => { ring.rotation.z = t * 0.9; });
}

// ─── projectile system (exposed to robot runtime via scene.userData) ──────────
function _setupProjectileSystem(scene, blocks) {
  const orbs = [];
  scene.userData.orbs   = orbs;
  scene.userData.blocks = blocks;

  // Called by robot runtime when LAUNCH_PROJECTILE Blockly block fires
  scene.userData.launchProjectile = (origin, direction, speed = 18) => {
    if (orbs.filter(o => o.alive).length >= MAX_PROJECTILES) return;
    orbs.push(new EnergyOrb(scene, origin, direction, speed));
  };

  _mover(scene, (t, dt) => {
    for (const orb of orbs) orb.update(dt, blocks);
    for (const blk of blocks) blk.update(dt);
  });
}

// ─── main export ─────────────────────────────────────────────────────────────
export function buildLauncherArena(scene) {
  scene.userData.customSky   = true;
  scene.userData.customDecor = true;
  scene.userData.arenaBounds = { camMinZ: -35, camMaxX: 20 };
  scene.fog = new THREE.Fog(0xd4eef8, 30, 90);

  _buildSky(scene);
  _setupLighting(scene);
  _buildGround(scene);
  _buildScenery(scene);

  // ── slingshot at robot start position ──────────────────────────────────────
  _buildSlingshot(scene, 0, 0, 6.5);

  // ── physics block registry ─────────────────────────────────────────────────
  const blocks = [];

  // ── Tower 1 — Wood tower (easy, front) ─────────────────────────────────────
  // layout: [col_offset, floor_y, width, height, depth]
  _buildTower(scene, blocks, -4, -10, [
    [-0.6, 0, 0.3, 2.4, 0.6],   // left post
    [ 0.6, 0, 0.3, 2.4, 0.6],   // right post
    [   0, 2.4, 1.5, 0.3, 0.6], // crossbeam top
    [   0, 2.7, 1.2, 0.5, 0.6], // top crate
  ], 'wood');

  // Trapped bot 1 — inside wood tower
  _buildTrappedBot(scene, -4, 1.4, -10, '#00ffcc', 0);

  // ── Tower 2 — Glass tower (middle) ─────────────────────────────────────────
  _buildTower(scene, blocks, 0, -16, [
    [-0.6,   0, 0.28, 3.2, 0.6],
    [ 0.6,   0, 0.28, 3.2, 0.6],
    [   0, 3.2, 1.4,  0.3, 0.6],
    [-0.3, 3.5, 0.6,  0.6, 0.6],
    [ 0.3, 3.5, 0.6,  0.6, 0.6],
    [   0, 4.1, 1.4,  0.4, 0.6],
  ], 'glass');

  // Trapped bot 2 — inside glass tower
  _buildTrappedBot(scene, 0, 1.8, -16, '#ff6600', 1);

  // ── Tower 3 — Stone fortress (hard, back) ──────────────────────────────────
  _buildTower(scene, blocks, 4, -22, [
    [-0.9,   0, 0.35, 4.0, 0.7],
    [ 0.9,   0, 0.35, 4.0, 0.7],
    [-0.3,   0, 0.35, 2.0, 0.7],
    [ 0.3,   0, 0.35, 2.0, 0.7],
    [   0, 2.0, 2.0,  0.4, 0.7],   // floor plate
    [   0, 2.4, 1.8,  0.35,0.7],   // second floor
    [-0.6, 2.75,0.7,  0.6, 0.7],
    [ 0.6, 2.75,0.7,  0.6, 0.7],
    [   0, 3.35,1.8,  0.5, 0.7],   // roof
  ], 'stone');

  // Trapped bot 3 — inside stone fortress
  _buildTrappedBot(scene, 4, 2.25, -22, '#ff44cc', 2);

  // ── Projectile system ───────────────────────────────────────────────────────
  _setupProjectileSystem(scene, blocks);

  // ── Win / finish zone ───────────────────────────────────────────────────────
  _setupWinZone(scene);
}
