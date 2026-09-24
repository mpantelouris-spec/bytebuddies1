/**
 * DestructibleBlock.js
 * A single physics-simulated block in the Robo Wrecker arena.
 *
 * Three types: 'wood' (low health/mass), 'stone' (medium), 'metal' (high/heavy).
 * Each block tracks its own velocity, angular velocity, and health.
 * When health reaches 0, destroy() fires: spawns fragments, dust, score popup.
 *
 * Physics update is called by BlockPhysicsManager every frame.
 */

import * as THREE from 'three';

// ─── per-type constants ───────────────────────────────────────────────────────
export const BLOCK_TYPES = {
  wood: {
    color: 0x9c6a38,
    roughness: 0.85,
    metalness: 0.0,
    health: 2,
    mass: 1.0,
    damageThreshold: 3.0,   // impactForce needed to take 1 health
    destroyThreshold: 7.0,  // impactForce for instant destroy
    fragmentCount: 5,
    crackColor: '#7a4820',
    dustColor: 0xb08040,
    scorePerBlock: 50,
    soundClass: 'wood',
  },
  stone: {
    color: 0x9e9e9e,
    roughness: 0.95,
    metalness: 0.05,
    health: 4,
    mass: 2.5,
    damageThreshold: 5.0,
    destroyThreshold: 13.0,
    fragmentCount: 7,
    crackColor: '#666666',
    dustColor: 0x888888,
    scorePerBlock: 100,
    soundClass: 'stone',
  },
  metal: {
    color: 0x607d8b,
    roughness: 0.3,
    metalness: 0.8,
    health: 8,
    mass: 4.0,
    damageThreshold: 10.0,
    destroyThreshold: 26.0,
    fragmentCount: 4,
    crackColor: '#1a2a30',
    dustColor: 0x8090a0,
    scorePerBlock: 200,
    soundClass: 'metal',
  },
};

// Shared crack-overlay canvas textures, one per type (lazily created)
const _crackTexCache = {};
function _getCrackTex(type) {
  if (_crackTexCache[type]) return _crackTexCache[type];
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.strokeStyle = BLOCK_TYPES[type].crackColor;
  ctx.lineWidth = 2;
  // Draw 4–6 jagged crack lines from center out
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
    ctx.beginPath();
    let x = 32, y = 32;
    ctx.moveTo(x, y);
    const steps = 4;
    for (let s = 0; s < steps; s++) {
      x += Math.cos(ang + (Math.random() - 0.5) * 0.8) * 9;
      y += Math.sin(ang + (Math.random() - 0.5) * 0.8) * 9;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  _crackTexCache[type] = tex;
  return tex;
}

// ─── DestructibleBlock ───────────────────────────────────────────────────────
export class DestructibleBlock {
  /**
   * @param {THREE.Scene} scene
   * @param {'wood'|'stone'|'metal'} type
   * @param {THREE.Vector3} position
   * @param {THREE.Euler} rotation
   */
  constructor(scene, type, position, rotation = new THREE.Euler()) {
    this.scene  = scene;
    this.type   = type;
    this.cfg    = BLOCK_TYPES[type];
    this.id     = Math.random().toString(36).slice(2);

    // Physics state
    this.vel    = new THREE.Vector3();
    this.angVel = new THREE.Vector3();
    this.mass   = this.cfg.mass;

    // Game state
    this.health       = this.cfg.health;
    this.maxHealth    = this.cfg.health;
    this.isActive     = true;   // false → removed from simulation
    this.isSettled    = false;
    this._settledTimer = 0;
    this._damagedMesh  = false; // has crack overlay been applied?

    // Build material (clone so we can mutate per-block for damage overlay)
    this.material = new THREE.MeshStandardMaterial({
      color: this.cfg.color,
      roughness: this.cfg.roughness,
      metalness: this.cfg.metalness,
    });

    // Mesh
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.material);
    this.mesh.position.copy(position);
    this.mesh.rotation.copy(rotation);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData.blockRef = this; // back-reference for collision lookup
    scene.add(this.mesh);

    // Bounding half-size for AABB collision
    this.halfSize = new THREE.Vector3(0.5, 0.5, 0.5);

    // Start position cache (for reset/retry)
    this._startPosition = position.clone();
    this._startRotation = rotation.clone();
    this._startHealth   = this.health;
  }

  // ── Physics update (called by BlockPhysicsManager) ─────────────────────────
  update(dt, groundY = 0) {
    if (!this.isActive || this.isSettled) return;

    // Gravity
    this.vel.y -= 9.8 * dt;

    // Air drag (prevents infinite acceleration in long falls)
    const drag = 1 - Math.min(0.02 * dt * 60, 0.4);
    this.vel.multiplyScalar(drag);
    this.angVel.multiplyScalar(1 - Math.min(0.05 * dt * 60, 0.5));

    // Integrate
    this.mesh.position.addScaledVector(this.vel, dt);
    this.mesh.rotation.x += this.angVel.x * dt;
    this.mesh.rotation.y += this.angVel.y * dt;
    this.mesh.rotation.z += this.angVel.z * dt;

    // Ground collision (simple floor)
    const floor = groundY + this.halfSize.y;
    if (this.mesh.position.y < floor) {
      this.mesh.position.y = floor;
      this.vel.y  = -this.vel.y * 0.28;   // bounce (energy loss)
      this.vel.x *= 0.80;                  // friction
      this.vel.z *= 0.80;
      this.angVel.multiplyScalar(0.65);
    }

    // Settle check — stop simulating when nearly at rest
    const speed = this.vel.length();
    if (speed < 0.06 && Math.abs(this.vel.y) < 0.08) {
      this._settledTimer += dt;
      if (this._settledTimer > 0.9) {
        this.isSettled = true;
        this.vel.set(0, 0, 0);
        this.angVel.set(0, 0, 0);
      }
    } else {
      this._settledTimer = 0;
    }

    // Remove if fallen off the level
    if (this.mesh.position.y < groundY - 14) {
      this._removeFromScene();
    }
  }

  // ── Apply impact force from projectile or neighbouring block ───────────────
  applyImpulse(direction, force) {
    if (!this.isActive) return;
    this.isSettled    = false;
    this._settledTimer = 0;

    const dir = direction.clone().normalize();
    this.vel.addScaledVector(dir, force / this.mass);

    // Add spin proportional to force
    this.angVel.add(new THREE.Vector3(
      (Math.random() - 0.5) * force * 0.4,
      (Math.random() - 0.5) * force * 0.2,
      (Math.random() - 0.5) * force * 0.4,
    ));
  }

  // ── Receive damage from impact ─────────────────────────────────────────────
  takeDamage(impactForce) {
    if (!this.isActive) return false;

    if (impactForce >= this.cfg.destroyThreshold) {
      this.health = 0;
    } else if (impactForce >= this.cfg.damageThreshold) {
      this.health -= 1;
    } else {
      // Force too low to damage — just push
      return false;
    }

    if (this.health <= 0) {
      this.destroy();
      return true; // destroyed
    }

    // Apply damaged visual: crack overlay on material
    if (!this._damagedMesh) {
      this._damagedMesh = true;
      this.material.emissive = new THREE.Color(this.cfg.crackColor);
      this.material.emissiveIntensity = 0.25;
      this.material.emissiveMap = _getCrackTex(this.type);
    } else {
      // Already cracked — make it glow a bit more for second hit
      this.material.emissiveIntensity = Math.min(this.material.emissiveIntensity + 0.2, 0.6);
    }
    return false; // damaged but not destroyed
  }

  // ── Destruction ───────────────────────────────────────────────────────────
  destroy() {
    if (!this.isActive) return;
    this.isActive = false;

    const pos   = this.mesh.position.clone();
    const scene = this.scene;

    // Remove original mesh
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();

    // Spawn fragments
    this._spawnFragments(pos, scene);

    // Dust particle burst
    this._spawnDust(pos, scene);

    // Score popup (floating canvas text that rises and fades)
    this._spawnScorePopup(pos, scene, this.cfg.scorePerBlock);

    // Dispatch event so BlockPhysicsManager can track chain reactions
    scene.dispatchEvent({ type: 'blockDestroyed', block: this, position: pos });
  }

  _spawnFragments(origin, scene) {
    const fragMat = this.material.clone();
    fragMat.emissiveMap = null;

    for (let i = 0; i < this.cfg.fragmentCount; i++) {
      const size = 0.14 + Math.random() * 0.22;
      const frag = new THREE.Mesh(
        new THREE.BoxGeometry(size, size * (0.6 + Math.random() * 0.6), size),
        fragMat,
      );
      frag.position.copy(origin);
      frag.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.4 + 0.3,
        (Math.random() - 0.5) * 0.6,
      ));

      // Initial outward velocity
      const speed = 2.5 + Math.random() * 4.0;
      const fragVel = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        Math.random() * speed * 0.8 + 1.0,
        (Math.random() - 0.5) * speed,
      );

      scene.add(frag);

      // Animate fragment with simple physics + fade-out over 2.5s
      const startTime = performance.now();
      const LIFETIME  = 2500;
      let vy = fragVel.y;

      const update = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed > LIFETIME) {
          scene.remove(frag);
          frag.geometry.dispose();
          return;
        }
        const dt = 0.016;
        vy -= 9.8 * dt;
        frag.position.x += fragVel.x * dt;
        frag.position.y += vy * dt;
        frag.position.z += fragVel.z * dt;
        frag.rotation.x += 0.08;
        frag.rotation.z += 0.05;

        // Bounce off ground
        if (frag.position.y < 0.1) {
          frag.position.y = 0.1;
          vy = Math.abs(vy) * 0.3;
          fragVel.x *= 0.8;
          fragVel.z *= 0.8;
        }

        // Fade out in last third of life
        if (elapsed > LIFETIME * 0.65) {
          fragMat.transparent = true;
          fragMat.opacity = 1 - (elapsed - LIFETIME * 0.65) / (LIFETIME * 0.35);
        }

        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }
  }

  _spawnDust(origin, scene) {
    const N = 35;
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = origin.x + (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.6;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 3.5 + 0.5,
        (Math.random() - 0.5) * 4.0,
      ));
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3);
    geo.setAttribute('position', posAttr);
    const mat = new THREE.PointsMaterial({
      color: this.cfg.dustColor, size: 0.14,
      transparent: true, opacity: 0.75, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const start = performance.now();
    const LIFE  = 900;
    const update = () => {
      const t = (performance.now() - start) / LIFE;
      if (t > 1) { scene.remove(pts); geo.dispose(); mat.dispose(); return; }
      mat.opacity = 0.75 * (1 - t);
      for (let i = 0; i < N; i++) {
        vel[i].y -= 3.0 * 0.016;
        pos[i * 3]     += vel[i].x * 0.016;
        pos[i * 3 + 1] += vel[i].y * 0.016;
        pos[i * 3 + 2] += vel[i].z * 0.016;
      }
      posAttr.needsUpdate = true;
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  _spawnScorePopup(origin, scene, score) {
    const cv = document.createElement('canvas');
    cv.width = 120; cv.height = 44;
    const ctx = cv.getContext('2d');
    ctx.font = 'bold 30px Arial';
    ctx.shadowColor = '#000';
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = this.type === 'metal' ? '#80deea' : this.type === 'stone' ? '#ffcc80' : '#a5d6a7';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${score}`, 60, 22);
    const tex  = new THREE.CanvasTexture(cv);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.44),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    );
    mesh.position.copy(origin).add(new THREE.Vector3(0, 0.5, 0));
    scene.add(mesh);

    const start = performance.now();
    const update = () => {
      const t = (performance.now() - start) / 700;
      if (t > 1) { scene.remove(mesh); tex.dispose(); return; }
      mesh.position.y = origin.y + 0.5 + t * 1.8;
      mesh.material.opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // ── Reset for retry ───────────────────────────────────────────────────────
  reset() {
    this.health       = this._startHealth;
    this.maxHealth    = this._startHealth;
    this.isActive     = true;
    this.isSettled    = false;
    this._settledTimer = 0;
    this._damagedMesh  = false;
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);

    // Rebuild mesh if destroyed
    if (!this.mesh.parent) {
      this.material = new THREE.MeshStandardMaterial({
        color: this.cfg.color,
        roughness: this.cfg.roughness,
        metalness: this.cfg.metalness,
      });
      this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.userData.blockRef = this;
      this.scene.add(this.mesh);
    } else {
      this.material.emissive = new THREE.Color(0x000000);
      this.material.emissiveIntensity = 0;
      this.material.emissiveMap = null;
      this.material.transparent = false;
      this.material.opacity = 1;
      this.material.needsUpdate = true;
    }

    this.mesh.position.copy(this._startPosition);
    this.mesh.rotation.copy(this._startRotation);
  }

  _removeFromScene() {
    this.isActive = false;
    if (this.mesh.parent) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.material.dispose();
    }
  }

  dispose() {
    this._removeFromScene();
  }
}
