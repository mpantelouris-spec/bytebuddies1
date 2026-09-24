/**
 * TargetOrb.js
 * The glowing "rescue bot" collectibles trapped inside Robo Wrecker structures.
 * Equivalent to the "pigs" in Angry Birds — these are what the player is trying
 * to free and collect.
 *
 * Lifecycle:
 *   TRAPPED   → orbits inside structure, gentle pulse animation
 *   FREE      → structure destroyed, orb falls with physics and bounces
 *   COLLECTED → robot touches it, flies to score counter, triggers +XP
 */

import * as THREE from 'three';

// Shared materials for all orbs (instanced per-orb via clone)
const _BASE_MAT = new THREE.MeshStandardMaterial({
  color: 0x00e676, emissive: 0x00c853, emissiveIntensity: 1.5,
  metalness: 0.1, roughness: 0.1,
});

export class TargetOrb {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Vector3} position   - initial world position (inside structure)
   * @param {number} index             - 0-based index for phase offset in animations
   */
  constructor(scene, position, index = 0) {
    this.scene = scene;
    this.index = index;

    // State machine
    this.state = 'trapped'; // 'trapped' | 'free' | 'collected'

    // Physics (only active when state === 'free')
    this.vel    = new THREE.Vector3();
    this.radius = 0.45;

    // Build visual group
    this.group = new THREE.Group();
    this.group.position.copy(position);
    scene.add(this.group);

    // Orb sphere
    this.material = _BASE_MAT.clone();
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 14), this.material);
    this.mesh.castShadow = true;
    this.group.add(this.mesh);

    // Outer glow halo (BackSide larger sphere)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x69f0ae, transparent: true, opacity: 0.13, side: THREE.BackSide,
    });
    this.halo = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 8), haloMat);
    this.group.add(this.halo);

    // Point light — casts green light on nearby blocks
    this.light = new THREE.PointLight(0x00e676, 1.5, 5.5);
    this.group.add(this.light);

    // Spinning orbit ring (visible while trapped)
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.03, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.55 }),
    );
    this.ring.rotation.x = Math.PI / 3;
    this.group.add(this.ring);

    // Cache start position for retry
    this._startPos = position.clone();
    this._phase    = index * (Math.PI * 2 / 8);

    // Reference cached in scene collectibles array is handled externally
    this.collected = false;
  }

  // ── Called every frame by mover ─────────────────────────────────────────────
  update(t, dt, groundY = 0) {
    switch (this.state) {
      case 'trapped':   this._updateTrapped(t); break;
      case 'free':      this._updateFree(dt, groundY); break;
      case 'collected': /* mesh already removed */ break;
    }
  }

  _updateTrapped(t) {
    // Gentle bob and rotation
    this.mesh.rotation.y = t * 1.4 + this._phase;
    this.ring.rotation.z = t * 2.2 + this._phase;
    // Pulse glow
    const pulse = 0.85 + Math.sin(t * 3.5 + this._phase) * 0.65;
    this.material.emissiveIntensity = pulse;
    this.light.intensity = pulse * 1.1;
    this.halo.material.opacity = 0.08 + Math.sin(t * 2.8 + this._phase) * 0.06;
  }

  _updateFree(dt, groundY) {
    // Gravity
    this.vel.y -= 9.8 * dt;

    // Drag
    this.vel.multiplyScalar(1 - Math.min(0.018 * dt * 60, 0.35));

    // Integrate
    this.group.position.addScaledVector(this.vel, dt);
    this.mesh.rotation.y += dt * 4.5; // spin as it rolls

    // Ground bounce
    const floor = groundY + this.radius;
    if (this.group.position.y < floor) {
      this.group.position.y = floor;
      this.vel.y   = -this.vel.y * 0.42;
      this.vel.x  *= 0.78;
      this.vel.z  *= 0.78;
    }

    // Bright release glow fades to resting pulse
    this.material.emissiveIntensity = 1.2 + Math.sin(performance.now() * 0.004) * 0.4;
    this.light.intensity = this.material.emissiveIntensity * 0.9;

    // Deactivate if fallen off level
    if (this.group.position.y < groundY - 16) {
      this.scene.remove(this.group);
      this.state = 'collected'; // treat as lost — won't count for win
    }
  }

  // ── Called when the containing structure is destroyed ───────────────────────
  free(structureVelocity = new THREE.Vector3()) {
    if (this.state !== 'trapped') return;
    this.state = 'free';

    // Remove orbit ring (not relevant when tumbling)
    this.group.remove(this.ring);

    // Copy the structure's general momentum plus some randomness
    this.vel.copy(structureVelocity);
    this.vel.add(new THREE.Vector3(
      (Math.random() - 0.5) * 2.5,
      1.5 + Math.random() * 2.0,
      (Math.random() - 0.5) * 2.5,
    ));

    // Brief super-bright flash on release
    this.material.emissiveIntensity = 5.0;
    this.light.intensity = 6.0;
    this.light.distance  = 10;

    setTimeout(() => {
      if (this.state === 'free') {
        this.material.emissiveIntensity = 1.5;
        this.light.intensity = 1.5;
        this.light.distance  = 5.5;
      }
    }, 220);

    // "FREE!" floating label
    this._spawnFreeLabel();

    this.scene.dispatchEvent({ type: 'orbFreed', orb: this });
  }

  // ── Called when robot position overlaps this orb ────────────────────────────
  collect() {
    if (this.state === 'collected') return;
    this.state     = 'collected';
    this.collected = true;

    // Green particle burst
    this._spawnCollectBurst();

    // Remove visuals
    this.scene.remove(this.group);

    this.scene.dispatchEvent({ type: 'orbCollected', orb: this });
  }

  // ── Overlap test (called by RoboWreckerArena mover) ────────────────────────
  checkCollision(robotPos) {
    if (this.state !== 'free' || this.collected) return false;
    return this.group.position.distanceTo(robotPos) < this.radius + 0.8;
  }

  // ── Reset to initial state for retry ────────────────────────────────────────
  reset() {
    this.state     = 'trapped';
    this.collected = false;
    this.vel.set(0, 0, 0);

    this.group.position.copy(this._startPos);
    this.mesh.rotation.set(0, 0, 0);

    // Restore ring
    if (!this.ring.parent) this.group.add(this.ring);

    // Restore material
    this.material.emissiveIntensity = 1.5;
    this.light.intensity = 1.5;
    this.light.distance  = 5.5;
    this.halo.material.opacity = 0.13;

    if (!this.group.parent) this.scene.add(this.group);
  }

  dispose() {
    this.scene.remove(this.group);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.ring.geometry.dispose();
    this.ring.material.dispose();
    this.halo.geometry.dispose();
    this.halo.material.dispose();
  }

  // ── Particle helpers ────────────────────────────────────────────────────────
  _spawnFreeLabel() {
    const cv  = document.createElement('canvas');
    cv.width  = 100;
    cv.height = 36;
    const ctx = cv.getContext('2d');
    ctx.font  = 'bold 24px Arial';
    ctx.fillStyle = '#69f0ae';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FREE! ✓', 50, 18);
    const tex  = new THREE.CanvasTexture(cv);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.36),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    );
    const origin = this.group.position.clone();
    mesh.position.copy(origin).add(new THREE.Vector3(0, 0.8, 0));
    this.scene.add(mesh);

    const start = performance.now();
    const tick  = () => {
      const t = (performance.now() - start) / 900;
      if (t > 1) { this.scene.remove(mesh); tex.dispose(); return; }
      mesh.position.y = origin.y + 0.8 + t * 1.4;
      mesh.material.opacity = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _spawnCollectBurst() {
    const N   = 28;
    const pos = new Float32Array(N * 3);
    const vel = [];
    const origin = this.group.position;
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = origin.x;
      pos[i * 3 + 1] = origin.y;
      pos[i * 3 + 2] = origin.z;
      const speed = 2.5 + Math.random() * 3.5;
      const ang   = Math.random() * Math.PI * 2;
      const elev  = Math.random() * Math.PI;
      vel.push(new THREE.Vector3(
        Math.sin(elev) * Math.cos(ang) * speed,
        Math.cos(elev) * speed * 0.7 + 1.0,
        Math.sin(elev) * Math.sin(ang) * speed,
      ));
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3);
    geo.setAttribute('position', posAttr);
    const mat = new THREE.PointsMaterial({
      color: 0x00e676, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    const start = performance.now();
    const tick  = () => {
      const t = (performance.now() - start) / 800;
      if (t > 1) { this.scene.remove(pts); geo.dispose(); mat.dispose(); return; }
      mat.opacity = 1 - t;
      for (let i = 0; i < N; i++) {
        vel[i].y -= 5.0 * 0.016;
        pos[i * 3]     += vel[i].x * 0.016;
        pos[i * 3 + 1] += vel[i].y * 0.016;
        pos[i * 3 + 2] += vel[i].z * 0.016;
      }
      posAttr.needsUpdate = true;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
