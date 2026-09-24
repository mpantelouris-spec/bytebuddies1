/**
 * RoboWreckerArena.js — "Robo Wrecker" course
 * Angry Birds-style 3D destruction game.
 *
 * Architecture:
 *   - Robot sits on launch pad; when it "moves" the arena intercepts and
 *     converts the first movement into a ballistic launch.
 *   - All block physics + orb physics run inside scene.userData.movers.
 *   - Collecting orbs uses scene.userData.collectibles (engine standard).
 *   - Win = all orbs collected AND robot reaches finish pad.
 *
 * Uses:
 *   DestructibleBlock.js  — per-block physics, health, destruction
 *   TargetOrb.js          — glowing collectible orbs inside structures
 *
 * Engine hooks respected:
 *   scene.userData.finishZone    {x, z, radius}
 *   scene.userData.collectibles  [{mesh, pos, radius, value, collected}]
 *   scene.userData.movers        [{update: (t, dt, rs) => {}}]
 *   scene.userData.customSky     true → skips addSkyGradient
 *   scene.userData.customDecor   true → skips addFloatingDecorations
 */

import * as THREE from 'three';
import { DestructibleBlock } from './DestructibleBlock.js';
import { TargetOrb } from './TargetOrb.js';

// ─── helpers ─────────────────────────────────────────────────────────────────
function _mover(scene, fn) {
  (scene.userData.movers ||= []).push({ update: fn });
}

// ─── sky (bright daytime construction-site sky) ───────────────────────────────
function _buildSky(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(220, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying float vY;
        void main(){
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        varying float vY;
        void main(){
          float t = clamp(vY / 180.0, 0.0, 1.0);
          vec3 top    = vec3(0.30, 0.62, 0.95);   // vivid blue
          vec3 bottom = vec3(0.82, 0.91, 1.00);   // near-white horizon
          gl_FragColor = vec4(mix(bottom, top, t), 1.0);
        }`,
    }),
  );
  scene.add(sky);

  // Fluffy cloud clusters
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
  [
    [30, 22, -80], [-45, 28, -65], [55, 18, -100], [-20, 32, -110], [70, 24, -50],
  ].forEach(([cx, cy, cz]) => {
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(4.5 + Math.random() * 4.5, 9, 7), cloudMat,
      );
      puff.position.set(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 4, cz + (Math.random() - 0.5) * 12);
      scene.add(puff);
    }
  });

  // Cloud drift animation
  const driftGroups = [];
  // Reuse the puffs for drift by collecting them in groups is complex —
  // instead we animate the cloud material UV offset on a large plane
  const cloudCv = document.createElement('canvas');
  cloudCv.width = cloudCv.height = 512;
  const cc = cloudCv.getContext('2d');
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    const r = 20 + Math.random() * 50;
    const g = cc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cc.fillStyle = g;
    cc.beginPath(); cc.arc(x, y, r, 0, Math.PI * 2); cc.fill();
  }
  const cloudTex = new THREE.CanvasTexture(cloudCv);
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
  cloudTex.repeat.set(3, 3);
  const bgCloud = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  bgCloud.rotation.x = -Math.PI / 2;
  bgCloud.position.set(20, -4, -60);
  scene.add(bgCloud);
  _mover(scene, (t) => { cloudTex.offset.x = t * 0.00025; });
}

// ─── ground terrain ──────────────────────────────────────────────────────────
function _buildGround(scene) {
  // Low-poly vertex-colour grass
  const geo = new THREE.PlaneGeometry(100, 50, 10, 8);
  geo.rotateX(-Math.PI / 2);
  const ni = geo.toNonIndexed();
  const pos = ni.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c1 = new THREE.Color(0x56ab2f);
  const c2 = new THREE.Color(0x4a9428);
  for (let i = 0; i < pos.count; i += 3) {
    const c = Math.random() < 0.5 ? c1 : c2;
    for (let k = 0; k < 3; k++) {
      col[(i + k) * 3]     = c.r;
      col[(i + k) * 3 + 1] = c.g;
      col[(i + k) * 3 + 2] = c.b;
    }
  }
  ni.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const ground = new THREE.Mesh(ni, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  ground.position.set(20, 0, -22);
  ground.receiveShadow = true;
  scene.add(ground);

  // Rocky edge cliff on left (where launch pad sits)
  const cliff = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3, 50),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
  );
  cliff.position.set(-2, -1.5, -22);
  scene.add(cliff);

  // Background rolling hills
  [[-22, 0, -40], [62, 0, -44], [22, 0, -52]].forEach(([x, y, z]) => {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(10, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: 0x4a9428 }),
    );
    hill.position.set(x, y, z);
    scene.add(hill);
  });

  // Background decorative crane silhouettes
  [[15, 0, -48], [45, 0, -42]].forEach(([x, y, z]) => {
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 14, 0.5), new THREE.MeshLambertMaterial({ color: 0xf57f17 }));
    mast.position.set(x, 7, z);
    scene.add(mast);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 0.4), new THREE.MeshLambertMaterial({ color: 0xf57f17 }));
    arm.position.set(x + 4, 14, z);
    scene.add(arm);
  });
}

// ─── lighting ─────────────────────────────────────────────────────────────────
function _buildLighting(scene) {
  scene.add(new THREE.AmbientLight(0xfff8e1, 0.55));
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x56ab2f, 0.65));

  const sun = new THREE.DirectionalLight(0xfff3e0, 1.35);
  sun.position.set(10, 28, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far  = 100;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top   = 20;
  sun.shadow.camera.bottom = -5;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xcfe8ff, 0.30);
  fill.position.set(-12, 10, 5);
  scene.add(fill);
}

// ─── launch pad ───────────────────────────────────────────────────────────────
function _buildLaunchPad(scene, x, y, z) {
  // Stone base disc
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, 256, 256);
  // Concentric target rings
  ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 6;
  [110, 80, 52, 26].forEach(r => { ctx.beginPath(); ctx.arc(128, 128, r, 0, Math.PI * 2); ctx.stroke(); });
  // Center dot
  ctx.fillStyle = '#f57f17';
  ctx.beginPath(); ctx.arc(128, 128, 14, 0, Math.PI * 2); ctx.fill();
  // "LAUNCH" label
  ctx.font = 'bold 22px Arial'; ctx.fillStyle = '#ffe082';
  ctx.textAlign = 'center'; ctx.fillText('LAUNCH', 128, 218);
  const padTex = new THREE.CanvasTexture(cv);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.0, 3.2, 0.28, 32),
    new THREE.MeshStandardMaterial({ map: padTex, roughness: 0.88, metalness: 0.1 }),
  );
  pad.position.set(x, y, z);
  pad.receiveShadow = true;
  scene.add(pad);

  // Launch frame — two tall posts with horizontal crossbar
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.6, metalness: 0.7 });
  const warningMat = new THREE.MeshStandardMaterial({ color: 0xf44336, emissive: 0xf44336, emissiveIntensity: 0.8 });

  [[-1.5, 1], [1.5, 1]].forEach(([dx, side]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.5, 8), frameMat);
    post.position.set(x + dx, y + 2.25, z);
    scene.add(post);
    const warning = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), warningMat);
    warning.position.set(x + dx, y + 4.6, z);
    scene.add(warning);
    // Animate warning lights — alternate blink
    _mover(scene, (t) => {
      warning.material.emissiveIntensity = (Math.sin(t * 4 + side * Math.PI) > 0) ? 1.2 : 0.15;
    });
  });

  // Crossbar
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6), frameMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(x, y + 4.5, z);
  scene.add(bar);
}

// ─── trajectory preview dots ──────────────────────────────────────────────────
const PREVIEW_STEPS = 22;
const PREVIEW_DT    = 0.11; // seconds per dot

function _buildTrajectoryDots(scene, launchX, launchY, launchZ) {
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xffee55, transparent: true,
    depthWrite: false,
  });
  const dots = [];
  for (let i = 0; i < PREVIEW_STEPS; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.06 + i * 0.005, 6, 4), dotMat.clone());
    scene.add(d);
    dots.push(d);
  }

  // Update dot positions based on angle + power
  function updateArc(angleDeg, power) {
    const angleRad = angleDeg * Math.PI / 180;
    const speed    = power * 0.36; // max ~36 units/s at power 100
    let vx = Math.cos(angleRad) * speed;
    let vy = Math.sin(angleRad) * speed;
    let px = launchX, py = launchY + 0.5, pz = launchZ;

    for (let i = 0; i < PREVIEW_STEPS; i++) {
      vy -= 9.8 * PREVIEW_DT;
      px += vx * PREVIEW_DT;
      py += vy * PREVIEW_DT;
      // pz stays constant (aimed straight ahead -z direction for now)

      dots[i].position.set(px, py, pz - i * 0.3 * PREVIEW_DT); // slight Z advance
      // Fade out with distance (uncertainty increases)
      const fade = 1 - i / PREVIEW_STEPS;
      dots[i].material.opacity = fade * fade * 0.9;

      // Hide dots below ground
      if (py < 0) {
        for (let j = i; j < PREVIEW_STEPS; j++) {
          dots[j].material.opacity = 0;
        }
        break;
      }
    }
  }

  // Default preview: 45° angle, power 65
  updateArc(45, 65);

  return { dots, updateArc };
}

// ─── structure builder ────────────────────────────────────────────────────────
/**
 * Builds a group of blocks from a layout array.
 * layout entries: [col, floorY, w, h, d, type]
 *   col    = X offset from groupX
 *   floorY = bottom Y of this block
 *   w/h/d  = dimensions (default 1×1×1 — BlockGeometry is 1×1×1 scaled via pos only)
 *   type   = 'wood'|'stone'|'metal'
 *
 * Returns array of DestructibleBlock instances.
 */
function _buildStructureGroup(scene, blocks, groupX, groupZ, layout) {
  const GROUND_Y = 0;
  const newBlocks = [];

  for (const [col, floorY, , h, , type] of layout) {
    const bx = groupX + col;
    const by = GROUND_Y + floorY + h / 2;  // center from floor
    const bz = groupZ;

    const blk = new DestructibleBlock(
      scene, type,
      new THREE.Vector3(bx, by, bz),
    );
    // Override height scaling — geometry is 1×1×1, use mesh scale for h
    blk.mesh.scale.y = h;
    blk.halfSize.y   = h / 2;
    // Width/depth from layout
    const [, , w, , d] = layout.find(([c]) => c === col) || [0,0,1,1,1];
    blk.mesh.scale.x = w ?? 1;
    blk.mesh.scale.z = d ?? 1;
    blk.halfSize.x   = (w ?? 1) / 2;
    blk.halfSize.z   = (d ?? 1) / 2;

    blocks.push(blk);
    newBlocks.push(blk);
  }
  return newBlocks;
}

// ─── structure group definitions ──────────────────────────────────────────────
// layout: [colOffset, floorY, width, height, depth, 'type']
const STRUCTURES = [
  // GROUP 1 — simple wood tower (20 units forward, left)
  {
    x: 16, z: -20,
    label: 'Tower 1',
    layout: [
      [-0.6, 0, 0.3, 2.8, 0.8, 'wood'],   // left post
      [ 0.6, 0, 0.3, 2.8, 0.8, 'wood'],   // right post
      [   0, 2.8, 1.8, 0.28, 0.8, 'wood'], // crossbeam
      [   0, 3.1, 1.2, 0.55, 0.8, 'wood'], // crate top
    ],
    orbPositions: [new THREE.Vector3(16, 3.8, -20)],
  },

  // GROUP 2 — L-shaped stone wall with hidden orb under roof
  {
    x: 24, z: -24,
    label: 'Tower 2',
    layout: [
      [-1.5, 0, 0.3, 3.0, 0.8, 'stone'],
      [-0.5, 0, 0.3, 3.0, 0.8, 'stone'],
      [ 0.5, 0, 0.3, 3.0, 0.8, 'stone'],
      [ 1.5, 0, 0.3, 3.0, 0.8, 'stone'],
      [-0.5, 3.0, 3.2, 0.28, 0.8, 'stone'], // roof slab
    ],
    orbPositions: [new THREE.Vector3(24, 2.0, -24)],
  },

  // GROUP 3 — mixed castle: outer U-wall + inner tower
  {
    x: 34, z: -20,
    label: 'Castle',
    layout: [
      // Outer U-wall posts (4 columns)
      [-2.4, 0, 0.3, 3.5, 0.8, 'stone'],
      [-1.2, 0, 0.3, 3.5, 0.8, 'stone'],
      [ 1.2, 0, 0.3, 3.5, 0.8, 'stone'],
      [ 2.4, 0, 0.3, 3.5, 0.8, 'stone'],
      // Wall lintel top
      [ 0,   3.5, 5.0, 0.3, 0.8, 'stone'],
      // Inner wooden tower
      [ 0,   0, 0.3, 5.0, 0.8, 'wood'],
      [ 0,   5.0, 1.2, 0.28, 0.8, 'wood'],
    ],
    orbPositions: [
      new THREE.Vector3(34,  3.5, -20),
      new THREE.Vector3(34,  5.4, -20),
    ],
  },

  // GROUP 4 — three-tower fortress, hardest
  {
    x: 44, z: -20,
    label: 'Fortress',
    layout: [
      // Left tower (4 high, wood)
      [-3.5, 0, 0.3, 4.0, 0.8, 'wood'],
      [-3.5, 4.0, 1.4, 0.3, 0.8, 'wood'],
      // Center tower (tallest, mix of stone+wood)
      [ 0,   0, 0.32, 2.0, 0.85, 'stone'],
      [ 0,   2.0, 0.32, 2.0, 0.85, 'wood'],
      [ 0,   4.0, 0.32, 1.8, 0.85, 'stone'],
      [ 0,   5.8, 1.5, 0.32, 0.85, 'stone'], // parapet
      // Right tower (stone, medium)
      [ 3.5, 0, 0.3, 3.5, 0.8, 'stone'],
      [ 3.5, 3.5, 1.5, 0.3, 0.8, 'stone'],
      // Bridge between left and center at height 3
      [-1.75, 3.0, 3.5, 0.25, 0.7, 'wood'],
      // Metal block guarding center base
      [ 0,   0, 0.35, 0.75, 0.85, 'metal'],
    ],
    orbPositions: [
      new THREE.Vector3(40.5, 4.5, -20),
      new THREE.Vector3(44,   6.2, -20),
      new THREE.Vector3(47.5, 4.0, -20),
    ],
  },
];

// ─── projectile system ────────────────────────────────────────────────────────
class Projectile {
  constructor(scene, origin, angleDeg, power, blocks, orbs) {
    this.scene  = scene;
    this.blocks = blocks;
    this.orbs   = orbs;
    this.alive  = true;
    this.age    = 0;

    const angleRad = angleDeg * Math.PI / 180;
    const speed    = power * 0.36;
    this.vel = new THREE.Vector3(
      Math.cos(angleRad) * speed,
      Math.sin(angleRad) * speed,
      0,
    );

    // Visual: glowing energy sphere
    const geo = new THREE.SphereGeometry(0.28, 14, 10);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff6d00, emissive: 0xff3d00, emissiveIntensity: 2.8,
      roughness: 0.05, metalness: 0.3,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(origin);
    scene.add(this.mesh);

    // Halo
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffcc80, transparent: true, opacity: 0.15, side: THREE.BackSide,
    });
    this.mesh.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), haloMat));

    // Point light
    this.light = new THREE.PointLight(0xff6d00, 3.5, 6);
    this.mesh.add(this.light);

    // Trail particles
    const tGeo = new THREE.BufferGeometry();
    const tPos = new Float32Array(30 * 3);
    tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
    this.trail     = new THREE.Points(tGeo, new THREE.PointsMaterial({ color: 0xffa726, size: 0.1, transparent: true, opacity: 0.65, depthWrite: false }));
    this.trailPos  = tPos;
    this.trailHead = 0;
    scene.add(this.trail);

    // Collision cooldown map (obstacle id → last hit ms)
    this._cooldowns = new Map();
  }

  update(dt) {
    if (!this.alive) return;
    this.age += dt;
    if (this.age > 8) { this._destroy(); return; }

    // Physics
    this.vel.y -= 9.8 * dt;
    this.mesh.position.addScaledVector(this.vel, dt);

    // Nose-down rotation follows velocity
    this.mesh.rotation.z = -Math.atan2(this.vel.y, this.vel.x);

    // Trail
    const p  = this.mesh.position;
    const ti = (this.trailHead % 10) * 3;
    this.trailPos[ti]     = p.x + (Math.random() - 0.5) * 0.12;
    this.trailPos[ti + 1] = p.y + (Math.random() - 0.5) * 0.12;
    this.trailPos[ti + 2] = p.z;
    this.trailHead++;
    this.trail.geometry.attributes.position.needsUpdate = true;

    // Ground hit
    if (this.mesh.position.y < 0.3) {
      this._groundImpact();
      return;
    }

    // Block collisions
    for (const blk of this.blocks) {
      if (!blk.isActive) continue;
      if (this._onCooldown(blk.id)) continue;

      const dx = Math.abs(p.x - blk.mesh.position.x) - blk.halfSize.x * blk.mesh.scale.x;
      const dy = Math.abs(p.y - blk.mesh.position.y) - blk.halfSize.y * blk.mesh.scale.y;
      const dz = Math.abs(p.z - blk.mesh.position.z) - blk.halfSize.z * blk.mesh.scale.z;

      if (dx < 0.28 && dy < 0.28 && dz < 0.28) {
        const force = this.vel.length() * 3.5; // robot mass factor
        const dir   = this.vel.clone().normalize();

        blk.applyImpulse(dir, force * 1.8);
        const destroyed = blk.takeDamage(force);

        // Propagate splash to nearby blocks
        this._splashNearby(blk.mesh.position, force * 0.55, blk.id);

        // Camera shake & flash via scene event
        this.scene.dispatchEvent({
          type: 'projectileImpact',
          position: p.clone(),
          force,
          destroyed,
          blockType: blk.type,
        });

        // Slow projectile on hit (doesn't instantly stop — can pierce)
        this.vel.multiplyScalar(0.52);
        this._setCooldown(blk.id);
      }
    }

    // Orb freeing — if orb is still trapped and projectile is very close, free it
    for (const orb of this.orbs) {
      if (orb.state !== 'trapped') continue;
      if (this.mesh.position.distanceTo(orb.group.position) < 0.9) {
        orb.free(this.vel.clone().multiplyScalar(0.25));
      }
    }
  }

  _splashNearby(centre, force, excludeId) {
    for (const blk of this.blocks) {
      if (!blk.isActive || blk.id === excludeId) continue;
      const dist = blk.mesh.position.distanceTo(centre);
      if (dist < 2.8 && dist > 0.01) {
        const scaled = force * (1 - dist / 2.8);
        const dir    = blk.mesh.position.clone().sub(centre).normalize();
        blk.applyImpulse(dir, scaled);
        blk.takeDamage(scaled * 0.6);
      }
    }
  }

  _groundImpact() {
    this.mesh.position.y = 0.3;
    this._spawnImpactBurst(this.mesh.position.clone(), 1.5);
    this._destroy();
    this.scene.dispatchEvent({ type: 'projectileMiss', position: this.mesh.position.clone() });
  }

  _spawnImpactBurst(pos, scale) {
    const N   = 40;
    const buf = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      buf[i * 3] = pos.x; buf[i * 3 + 1] = pos.y; buf[i * 3 + 2] = pos.z;
      const speed = (1.8 + Math.random() * 3.5) * scale;
      const a     = Math.random() * Math.PI * 2;
      const e     = Math.random() * Math.PI;
      vel.push(new THREE.Vector3(
        Math.sin(e) * Math.cos(a) * speed,
        Math.abs(Math.cos(e)) * speed + 0.5,
        Math.sin(e) * Math.sin(a) * speed,
      ));
    }
    const geo  = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(buf, 3);
    geo.setAttribute('position', attr);
    const mat  = new THREE.PointsMaterial({ color: 0xff6d00, size: 0.14, transparent: true, opacity: 0.9, depthWrite: false });
    const pts  = new THREE.Points(geo, mat);
    this.scene.add(pts);
    const flash = new THREE.PointLight(0xff6d00, 8, 6);
    flash.position.copy(pos);
    this.scene.add(flash);

    const start = performance.now();
    const tick  = () => {
      const t = (performance.now() - start) / 650;
      if (t > 1) {
        this.scene.remove(pts); geo.dispose(); mat.dispose();
        this.scene.remove(flash);
        return;
      }
      mat.opacity = 1 - t;
      flash.intensity = 8 * (1 - t);
      for (let i = 0; i < N; i++) {
        vel[i].y -= 6.0 * 0.016;
        buf[i * 3]     += vel[i].x * 0.016;
        buf[i * 3 + 1] += vel[i].y * 0.016;
        buf[i * 3 + 2] += vel[i].z * 0.016;
      }
      attr.needsUpdate = true;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _onCooldown(id)  { return (this._cooldowns.get(id) || 0) > performance.now(); }
  _setCooldown(id) { this._cooldowns.set(id, performance.now() + 400); }

  _destroy() {
    this.alive = false;
    this.scene.remove(this.mesh);
    this.scene.remove(this.trail);
  }
}

// ─── finish pad ───────────────────────────────────────────────────────────────
function _buildFinishPad(scene) {
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 2.8, 0.06, 24),
    new THREE.MeshStandardMaterial({ color: 0xf57f17, emissive: 0xe65100, emissiveIntensity: 0.5, roughness: 0.55, metalness: 0.3 }),
  );
  pad.position.set(0, 0.04, -8);
  scene.add(pad);

  // Spinning ring above pad
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.1, 8, 40),
    new THREE.MeshStandardMaterial({ color: 0xf57f17, emissive: 0xff6d00, emissiveIntensity: 0.9 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.12, -8);
  scene.add(ring);
  _mover(scene, (t) => { ring.rotation.z = t * 1.2; });

  const pl = new THREE.PointLight(0xf57f17, 2.5, 9);
  pl.position.set(0, 2, -8);
  scene.add(pl);
  _mover(scene, (t) => { pl.intensity = 1.8 + Math.sin(t * 3) * 0.8; });

  // Billboard
  const bCv = document.createElement('canvas');
  bCv.width = 280; bCv.height = 70;
  const bc  = bCv.getContext('2d');
  bc.fillStyle = 'rgba(20,10,0,0.82)';
  bc.fillRect(0, 0, 280, 70);
  bc.strokeStyle = '#f57f17'; bc.lineWidth = 3; bc.strokeRect(3, 3, 274, 64);
  bc.fillStyle = '#fff'; bc.font = 'bold 26px Arial';
  bc.textAlign = 'center'; bc.textBaseline = 'middle';
  bc.fillText('💥 RETURN TO BASE', 140, 35);
  const bTex = new THREE.CanvasTexture(bCv);
  const bill = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.88),
    new THREE.MeshBasicMaterial({ map: bTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  );
  bill.position.set(0, 4.2, -8);
  scene.add(bill);

  scene.userData.finishZone = { x: 0, z: -8, radius: 3.0 };
}

// ─── decorative scene props ───────────────────────────────────────────────────
function _buildSceneryProps(scene) {
  const tree = (x, z, h = 3.2) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, h, 7),
      new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
    trunk.position.set(x, h / 2, z);
    scene.add(trunk);
    [[0, h + 0.6, 0, 1.4], [0, h + 1.4, 0, 1.0], [0, h + 2.1, 0, 0.65]].forEach(([dx, dy, dz, r]) => {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.5, 8),
        new THREE.MeshLambertMaterial({ color: 0x388e3c }));
      leaf.position.set(x + dx, dy, z + dz);
      scene.add(leaf);
    });
  };

  // Trees around the border
  tree(-6, -5); tree(-8, -18); tree(-6, -35);
  tree(70, -12); tree(68, -28);
}

// ─── main export ─────────────────────────────────────────────────────────────
export function buildRoboWreckerArena(scene) {
  scene.userData.customSky   = true;
  scene.userData.customDecor = true;
  scene.userData.arenaBounds = { camMinZ: -55, camMaxX: 60 };
  scene.fog = new THREE.Fog(0xb8d4f0, 55, 130);

  _buildSky(scene);
  _buildLighting(scene);
  _buildGround(scene);
  _buildSceneryProps(scene);
  _buildLaunchPad(scene, 0, 0, 0);
  _buildFinishPad(scene);

  // ── Build all blocks and orbs ────────────────────────────────────────────
  const allBlocks = [];
  const allOrbs   = [];

  STRUCTURES.forEach((sg) => {
    _buildStructureGroup(scene, allBlocks, sg.x, sg.z, sg.layout);
    sg.orbPositions.forEach((pos, i) => {
      const orb = new TargetOrb(scene, pos, allOrbs.length + i);
      allOrbs.push(orb);
    });
  });

  // Register orbs as collectibles using the engine's standard system
  // (engine checks distance between robot and pos each frame)
  allOrbs.forEach((orb) => {
    (scene.userData.collectibles ||= []).push({
      mesh: orb.group,
      pos: orb._startPos,
      radius: 1.0,
      value: 25,
      collected: false,
      _orb: orb, // back-reference for sync
    });
  });

  // ── Projectile + physics mover ───────────────────────────────────────────
  let activeProjectile = null;
  let launchAngle = 45;
  let launchPower = 68;
  let shotsUsed   = 0;
  const MAX_SHOTS = 5;

  // Expose launch function for robot runtime (called via scene.userData)
  scene.userData.rwLaunch = (angleDeg, power) => {
    if (activeProjectile?.alive) return; // mid-flight
    if (shotsUsed >= MAX_SHOTS) return;
    shotsUsed++;
    launchAngle = angleDeg ?? launchAngle;
    launchPower = power    ?? launchPower;
    activeProjectile = new Projectile(
      scene,
      new THREE.Vector3(0, 0.8, 0), // robot is on launch pad
      launchAngle, launchPower,
      allBlocks, allOrbs,
    );
    scene.userData.rwShotsRemaining = MAX_SHOTS - shotsUsed;
    scene.dispatchEvent({ type: 'rwShotFired', shotsRemaining: MAX_SHOTS - shotsUsed });
  };

  // Set launch parameters (called by robot code blocks before launch)
  scene.userData.rwSetAngle = (a) => { launchAngle = Math.max(5, Math.min(85, a)); };
  scene.userData.rwSetPower = (p) => { launchPower = Math.max(1, Math.min(100, p)); };
  scene.userData.rwShotsRemaining = MAX_SHOTS;

  // Track which orbs are collected to sync with engine collectibles array
  scene.addEventListener('orbCollected', (e) => {
    const entry = (scene.userData.collectibles || []).find(c => c._orb === e.orb);
    if (entry) entry.collected = true;
    // Check win: all orbs collected
    const allCollected = (scene.userData.collectibles || []).every(c => c.collected);
    if (allCollected) {
      scene.dispatchEvent({ type: 'rwAllOrbsFreed' });
    }
  });

  // Block-to-block chain reaction: when a block is destroyed, send impulse to neighbours
  let chainCount  = 0;
  let chainTimer  = 0;
  scene.addEventListener('blockDestroyed', (e) => {
    chainTimer = 0.8; // reset chain window
    chainCount++;
    if (chainCount > 1) {
      scene.dispatchEvent({ type: 'rwChainReaction', chain: chainCount });
    }
    // Free any orbs that were sitting on top of destroyed block
    const destroyedPos = e.position;
    allOrbs.forEach(orb => {
      if (orb.state !== 'trapped') return;
      const dx = Math.abs(orb.group.position.x - destroyedPos.x);
      const dy = Math.abs(orb.group.position.y - destroyedPos.y);
      const dz = Math.abs(orb.group.position.z - destroyedPos.z);
      if (dx < 1.5 && dy < 2.5 && dz < 1.5) {
        orb.free(new THREE.Vector3((Math.random() - 0.5) * 2, 2, 0));
      }
    });
  });

  // ── Trajectory preview dots ─────────────────────────────────────────────
  const { dots, updateArc } = _buildTrajectoryDots(scene, 0, 0, 0);

  // ── Main mover — all physics in one place ───────────────────────────────
  _mover(scene, (t, dt) => {
    // Projectile
    if (activeProjectile) activeProjectile.update(dt);

    // Block physics
    for (const blk of allBlocks) blk.update(dt, 0);

    // Orb update (free orbs fall, trapped orbs animate)
    for (let i = 0; i < allOrbs.length; i++) {
      const orb = allOrbs[i];
      orb.update(t, dt, 0);

      // Check if robot (robot state is in robotState from rs param — skip, use collectibles check)
      // Orb collection is handled via scene.userData.collectibles above
    }

    // Sync collectibles pos with free orbs (orbs move, engine pos needs to track)
    (scene.userData.collectibles || []).forEach(c => {
      if (c._orb && c._orb.state === 'free' && !c.collected) {
        c.pos = {
          x: c._orb.group.position.x,
          y: c._orb.group.position.y,
          z: c._orb.group.position.z,
        };
      }
    });

    // Chain timer decay
    if (chainTimer > 0) {
      chainTimer -= dt;
      if (chainTimer <= 0) {
        chainCount = 0; // chain window closed
      }
    }

    // Update trajectory preview (only when not in flight)
    if (!activeProjectile?.alive) {
      updateArc(launchAngle, launchPower);
      dots.forEach(d => { d.visible = true; });
    } else {
      dots.forEach(d => { d.visible = false; });
    }

    // Shot limit fail: all shots used, not all orbs collected
    if (shotsUsed >= MAX_SHOTS && !activeProjectile?.alive) {
      const allFree = allOrbs.every(o => o.state !== 'trapped');
      if (!allFree) {
        scene.dispatchEvent({ type: 'rwOutOfShots' });
      }
    }
  });

  // ── Retry handler (reset everything) ───────────────────────────────────
  scene.userData.rwReset = () => {
    if (activeProjectile?.alive) {
      activeProjectile._destroy();
      activeProjectile = null;
    }
    allBlocks.forEach(b => b.reset());
    allOrbs.forEach((o, i) => {
      o.reset();
      // Sync collectibles
      const c = (scene.userData.collectibles || [])[i];
      if (c) { c.collected = false; c.pos = o._startPos; }
    });
    shotsUsed = 0;
    scene.userData.rwShotsRemaining = MAX_SHOTS;
    dots.forEach(d => { d.visible = true; });
    updateArc(launchAngle, launchPower);
  };
}
