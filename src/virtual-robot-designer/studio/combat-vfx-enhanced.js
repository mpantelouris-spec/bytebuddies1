/**
 * ENHANCED COMBAT VFX & AUDIO PIPELINE
 * Implements professional fighting game "juice":
 * - Motion trails for whiff/air swings
 * - Explosive spark bursts on clean hits
 * - Energy shield flash on blocks
 * - Shockwave rings on heavy impacts
 * - Layered audio (whoosh, impact, block sounds)
 */
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SPARK_POOL_SIZE = 50;
const TRAIL_SEGMENTS = 16;
const SHOCKWAVE_RINGS = 3;

// ═══════════════════════════════════════════════════════════════════════════
// MOTION TRAIL SYSTEM (Whiff/Air Swing)
// ═══════════════════════════════════════════════════════════════════════════

export function createMotionTrail(scene, color = 0xffffff) {
  const positions = new Float32Array(TRAIL_SEGMENTS * 3);
  const colors = new Float32Array(TRAIL_SEGMENTS * 3);
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    linewidth: 3,
  });
  
  const trail = new THREE.Line(geometry, material);
  trail.visible = false;
  scene.add(trail);
  
  const trailState = {
    active: false,
    life: 0,
    points: [],
  };
  
  return {
    /**
     * Start a motion trail following a limb
     * @param {THREE.Vector3} startPoint - Starting position
     * @param {string} type - 'kick' | 'punch'
     */
    start(startPoint, type = 'kick') {
      trailState.active = true;
      trailState.life = type === 'kick' ? 0.35 : 0.25;
      trailState.points = [startPoint.clone()];
      trail.visible = true;
      
      // Set trail color based on attack type
      const col = type === 'kick' ? new THREE.Color(0x00ffff) : new THREE.Color(0xffff00);
      for (let i = 0; i < TRAIL_SEGMENTS; i++) {
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      geometry.attributes.color.needsUpdate = true;
    },
    
    /**
     * Update trail with new point
     * @param {THREE.Vector3} point - Current limb position
     */
    addPoint(point) {
      if (!trailState.active) return;
      
      trailState.points.push(point.clone());
      if (trailState.points.length > TRAIL_SEGMENTS) {
        trailState.points.shift();
      }
      
      // Update geometry
      for (let i = 0; i < TRAIL_SEGMENTS; i++) {
        const p = trailState.points[i] || trailState.points[trailState.points.length - 1];
        if (p) {
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }
      }
      geometry.attributes.position.needsUpdate = true;
    },
    
    /**
     * Update trail each frame
     */
    tick(dt) {
      if (!trailState.active) return;
      
      trailState.life -= dt;
      material.opacity = Math.max(0, trailState.life * 2.5);
      
      if (trailState.life <= 0) {
        trailState.active = false;
        trail.visible = false;
      }
    },
    
    isActive: () => trailState.active,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SPARK BURST SYSTEM (Clean Hit)
// ═══════════════════════════════════════════════════════════════════════════

export function createSparkSystem(scene) {
  const sparks = [];
  const sparkGeo = new THREE.SphereGeometry(0.04, 6, 6);
  
  const materials = {
    cyan: new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true }),
    white: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
    yellow: new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true }),
    orange: new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true }),
    red: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true }),
  };
  
  // Pre-create spark pool
  for (let i = 0; i < SPARK_POOL_SIZE; i++) {
    const matKey = ['cyan', 'white', 'yellow'][i % 3];
    const mesh = new THREE.Mesh(sparkGeo, materials[matKey].clone());
    mesh.visible = false;
    scene.add(mesh);
    sparks.push({
      mesh,
      velocity: new THREE.Vector3(),
      life: 0,
      gravity: 8,
    });
  }
  
  return {
    /**
     * Emit spark burst at impact point
     * @param {THREE.Vector3} position - Impact position
     * @param {THREE.Vector3} normal - Collision normal
     * @param {boolean} heavy - Heavy hit generates more sparks
     * @param {boolean} critical - Critical hit uses special colors
     */
    emitBurst(position, normal = new THREE.Vector3(0, 1, 0), heavy = false, critical = false) {
      const count = heavy ? 35 : 20;
      const speed = heavy ? 4.5 : 3.0;
      
      for (let i = 0; i < count; i++) {
        const spark = sparks.find(s => s.life <= 0);
        if (!spark) break;
        
        spark.mesh.position.copy(position);
        spark.mesh.visible = true;
        spark.life = 0.4 + Math.random() * (heavy ? 0.3 : 0.2);
        
        // Randomize direction with bias toward normal
        const dir = normal.clone()
          .add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 1.5,
            (Math.random() - 0.5) * 2
          ))
          .normalize();
        
        spark.velocity.copy(dir).multiplyScalar(speed * (0.5 + Math.random() * 0.5));
        
        // Color based on hit type
        if (critical) {
          spark.mesh.material = materials.orange.clone();
        } else if (heavy) {
          spark.mesh.material = i % 2 === 0 ? materials.cyan.clone() : materials.white.clone();
        } else {
          spark.mesh.material = materials.yellow.clone();
        }
        spark.mesh.material.opacity = 1;
      }
    },
    
    /**
     * Update all sparks
     */
    tick(dt) {
      sparks.forEach(spark => {
        if (spark.life <= 0) {
          spark.mesh.visible = false;
          return;
        }
        
        spark.life -= dt;
        spark.velocity.y -= spark.gravity * dt;
        spark.mesh.position.add(spark.velocity.clone().multiplyScalar(dt));
        
        // Fade out
        spark.mesh.material.opacity = Math.min(1, spark.life * 2.5);
        
        // Scale down as life decreases
        const scale = 0.5 + spark.life;
        spark.mesh.scale.setScalar(scale);
        
        if (spark.life <= 0) {
          spark.mesh.visible = false;
        }
      });
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SHOCKWAVE RING SYSTEM (Heavy Impact)
// ═══════════════════════════════════════════════════════════════════════════

export function createShockwaveSystem(scene) {
  const rings = [];
  
  for (let i = 0; i < SHOCKWAVE_RINGS; i++) {
    const geo = new THREE.RingGeometry(0.1, 0.15, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    scene.add(ring);
    
    rings.push({
      mesh: ring,
      life: 0,
      maxRadius: 2,
      speed: 8,
    });
  }
  
  return {
    /**
     * Emit shockwave ring at impact point
     * @param {THREE.Vector3} position - Impact position
     * @param {THREE.Vector3} normal - Collision normal for ring orientation
     */
    emit(position, normal = new THREE.Vector3(0, 1, 0)) {
      const ring = rings.find(r => r.life <= 0);
      if (!ring) return;
      
      ring.mesh.position.copy(position);
      ring.mesh.visible = true;
      ring.life = 0.35;
      ring.mesh.scale.set(0.1, 0.1, 0.1);
      ring.mesh.material.opacity = 0.9;
      
      // Orient ring along collision normal
      ring.mesh.lookAt(position.clone().add(normal));
    },
    
    /**
     * Update all shockwaves
     */
    tick(dt) {
      rings.forEach(ring => {
        if (ring.life <= 0) {
          ring.mesh.visible = false;
          return;
        }
        
        ring.life -= dt;
        
        // Expand ring
        const t = 1 - ring.life / 0.35;
        const scale = 0.1 + t * ring.maxRadius;
        ring.mesh.scale.set(scale, scale, scale);
        
        // Fade out
        ring.mesh.material.opacity = Math.max(0, ring.life * 2.5);
        
        if (ring.life <= 0) {
          ring.mesh.visible = false;
        }
      });
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK SHIELD EFFECT (Defensive Hit)
// ═══════════════════════════════════════════════════════════════════════════

export function createBlockShield(scene) {
  // Create hexagonal shield mesh
  const geo = new THREE.CircleGeometry(0.6, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const shield = new THREE.Mesh(geo, mat);
  shield.visible = false;
  scene.add(shield);
  
  // Create metallic particle spray
  const particles = [];
  const particleGeo = new THREE.BoxGeometry(0.02, 0.02, 0.06);
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0x8888ff,
    transparent: true,
  });
  
  for (let i = 0; i < 20; i++) {
    const p = new THREE.Mesh(particleGeo, particleMat.clone());
    p.visible = false;
    scene.add(p);
    particles.push({
      mesh: p,
      velocity: new THREE.Vector3(),
      life: 0,
      rotation: new THREE.Vector3(),
    });
  }
  
  const state = {
    active: false,
    life: 0,
  };
  
  return {
    /**
     * Trigger block shield flash
     * @param {THREE.Vector3} position - Block position
     * @param {THREE.Vector3} facing - Direction defender is facing
     */
    trigger(position, facing = new THREE.Vector3(0, 0, -1)) {
      shield.position.copy(position);
      shield.position.y += 1.0;
      shield.visible = true;
      state.active = true;
      state.life = 0.25;
      
      // Orient shield toward attacker
      shield.lookAt(position.clone().add(facing));
      
      // Emit metallic particles
      particles.forEach(p => {
        p.mesh.position.copy(shield.position);
        p.mesh.visible = true;
        p.life = 0.3 + Math.random() * 0.2;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        p.velocity.set(
          Math.cos(angle) * speed,
          0.5 + Math.random() * 2,
          Math.sin(angle) * speed
        );
        p.rotation.set(
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10
        );
        p.mesh.material.opacity = 1;
      });
    },
    
    /**
     * Update shield effect
     */
    tick(dt) {
      if (state.active) {
        state.life -= dt;
        
        // Flash animation
        const t = 1 - state.life / 0.25;
        mat.opacity = Math.sin(t * Math.PI) * 0.8;
        
        // Scale pulse
        const scale = 1 + Math.sin(t * Math.PI * 2) * 0.1;
        shield.scale.setScalar(scale);
        
        if (state.life <= 0) {
          state.active = false;
          shield.visible = false;
        }
      }
      
      // Update particles
      particles.forEach(p => {
        if (p.life <= 0) {
          p.mesh.visible = false;
          return;
        }
        
        p.life -= dt;
        p.velocity.y -= 5 * dt;
        p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
        p.mesh.rotation.x += p.rotation.x * dt;
        p.mesh.rotation.y += p.rotation.y * dt;
        p.mesh.rotation.z += p.rotation.z * dt;
        p.mesh.material.opacity = Math.min(1, p.life * 3);
        
        if (p.life <= 0) {
          p.mesh.visible = false;
        }
      });
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export function createCombatAudioManager() {
  const audioContext = typeof AudioContext !== 'undefined' 
    ? new AudioContext() 
    : null;
  
  if (!audioContext) {
    console.warn('Web Audio API not available');
    return {
      playWhoosh: () => {},
      playImpact: () => {},
      playBlock: () => {},
    };
  }
  
  /**
   * Generate a whoosh sound effect
   */
  function generateWhoosh(heavy = false) {
    const duration = heavy ? 0.3 : 0.2;
    const sampleRate = audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(t / duration * Math.PI);
      
      // High-frequency noise filtered
      const noise = (Math.random() * 2 - 1) * 0.3;
      const freq = heavy ? 800 + t * 2000 : 1200 + t * 3000;
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.2;
      
      data[i] = (noise + wave) * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Generate impact sound (bass thud + metallic crunch)
   */
  function generateImpact(heavy = false) {
    const duration = heavy ? 0.4 : 0.25;
    const sampleRate = audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * (heavy ? 8 : 12));
      
      // Low-frequency bass thud (60Hz boost)
      const bass = Math.sin(2 * Math.PI * 60 * t) * (heavy ? 0.5 : 0.3);
      
      // High-frequency metallic crunch
      const crunch = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.4;
      
      // Mid impact
      const mid = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 15) * 0.3;
      
      data[i] = (bass + crunch + mid) * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Generate block sound (dull thud)
   */
  function generateBlock() {
    const duration = 0.2;
    const sampleRate = audioContext.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15);
      
      // Wooden/metallic block sound
      const thud = Math.sin(2 * Math.PI * 150 * t) * 0.4;
      const rattle = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 25) * 0.2;
      
      data[i] = (thud + rattle) * envelope;
    }
    
    return buffer;
  }
  
  function playBuffer(buffer, volume = 0.5) {
    if (!audioContext) return;
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    source.start();
  }
  
  // Pre-generate buffers
  const whooshLight = generateWhoosh(false);
  const whooshHeavy = generateWhoosh(true);
  const impactLight = generateImpact(false);
  const impactHeavy = generateImpact(true);
  const blockSound = generateBlock();
  
  return {
    /**
     * Play whoosh sound at attack startup
     */
    playWhoosh(heavy = false) {
      playBuffer(heavy ? whooshHeavy : whooshLight, heavy ? 0.4 : 0.3);
    },
    
    /**
     * Play impact sound on hit
     */
    playImpact(heavy = false) {
      playBuffer(heavy ? impactHeavy : impactLight, heavy ? 0.6 : 0.45);
    },
    
    /**
     * Play block sound on defended hit
     */
    playBlock() {
      playBuffer(blockSound, 0.5);
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED VFX SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export function createEnhancedCombatVFX(scene) {
  const motionTrail = createMotionTrail(scene);
  const sparks = createSparkSystem(scene);
  const shockwave = createShockwaveSystem(scene);
  const blockShield = createBlockShield(scene);
  const audio = createCombatAudioManager();
  
  return {
    /**
     * Start whiff/swing trail
     */
    startSwingTrail(position, type = 'kick') {
      motionTrail.start(position, type);
      audio.playWhoosh(type === 'heavy_kick' || type === 'heavy_punch');
    },
    
    /**
     * Update swing trail with new position
     */
    updateSwingTrail(position) {
      motionTrail.addPoint(position);
    },
    
    /**
     * Trigger clean hit effects
     */
    onCleanHit(position, normal, heavy = false, critical = false) {
      sparks.emitBurst(position, normal, heavy, critical);
      
      if (heavy) {
        shockwave.emit(position, normal);
      }
      
      audio.playImpact(heavy);
    },
    
    /**
     * Trigger block hit effects
     */
    onBlockedHit(position, facing) {
      blockShield.trigger(position, facing);
      audio.playBlock();
      
      // Small spark spray for blocked hit
      sparks.emitBurst(
        position.clone().add(new THREE.Vector3(0, 1, 0)),
        new THREE.Vector3(0, 1, 0),
        false,
        false
      );
    },
    
    /**
     * Update all VFX systems each frame
     */
    tick(dt) {
      motionTrail.tick(dt);
      sparks.tick(dt);
      shockwave.tick(dt);
      blockShield.tick(dt);
    },
    
    // Expose individual systems
    motionTrail,
    sparks,
    shockwave,
    blockShield,
    audio,
  };
}

export default createEnhancedCombatVFX;
