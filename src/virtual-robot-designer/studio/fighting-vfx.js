/**
 * Fighting VFX — cyan impact sparks, punch trails, 3D damage popups, camera shake.
 */
import * as THREE from 'three';

const IMPACT_POOL = 30;
const POPUP_POOL = 8;
const TRAIL_SEGMENTS = 12;

export function createFightingVfx(scene) {
  const sparks = [];
  const geo = new THREE.SphereGeometry(0.05, 6, 6);
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.95 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const redMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.85 });

  for (let i = 0; i < IMPACT_POOL; i++) {
    const m = new THREE.Mesh(geo, (i % 3 === 0 ? whiteMat : cyanMat).clone());
    m.visible = false;
    scene.add(m);
    sparks.push({ mesh: m, life: 0, vx: 0, vy: 0, vz: 0 });
  }

  const popups = [];
  for (let i = 0; i < POPUP_POOL; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    sprite.scale.set(0.55, 0.28, 1);
    scene.add(sprite);
    popups.push({ sprite, canvas, tex, life: 0, vy: 0 });
  }

  const trailGeo = new THREE.BufferGeometry();
  const trailPositions = new Float32Array(TRAIL_SEGMENTS * 3);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trailMat = new THREE.LineBasicMaterial({
    color: 0x00bfff,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const punchTrail = new THREE.Line(trailGeo, trailMat);
  punchTrail.visible = false;
  scene.add(punchTrail);
  let trailLife = 0;

  let shake = 0;
  let flash = 0;
  let camKnockback = 0;
  let camKnockbackVel = 0;
  const camBase = new THREE.Vector3();
  // Hit-stop — the single biggest "arcade feel" trick in fighting games:
  // a tiny freeze on the frame a punch connects makes the impact register
  // as weight rather than two shapes passing through each other.
  let hitStopTimer = 0;

  function emitImpact(x, y, z, intensity = 1, heavy = false) {
    const count = Math.min(IMPACT_POOL, (heavy ? 24 : 18) + Math.floor(intensity * 6));
    for (let i = 0; i < count; i++) {
      const s = sparks.find((p) => p.life <= 0);
      if (!s) break;
      s.mesh.position.set(x, (y || 0) + 1.2, z || 0);
      const spread = heavy ? 3.2 : 2.2;
      s.vx = (Math.random() - 0.5) * spread * intensity;
      s.vy = 0.6 + Math.random() * (heavy ? 2.2 : 1.4) * intensity;
      s.vz = (Math.random() - 0.5) * spread * intensity;
      s.life = 0.35 + Math.random() * (heavy ? 0.35 : 0.2);
      s.mesh.material = (Math.random() > 0.7 ? whiteMat : cyanMat).clone();
      s.mesh.material.opacity = 0.95;
      s.mesh.visible = true;
    }
    shake = Math.max(shake, heavy ? 0.35 : 0.12 + intensity * 0.14);
    flash = Math.max(flash, heavy ? 0.24 : 0.12 + intensity * 0.08);
    hitStopTimer = Math.max(hitStopTimer, heavy ? 0.133 : 0.066);
    if (heavy) {
      camKnockbackVel = Math.max(camKnockbackVel, 0.35);
    }
  }

  /** Call once per frame with the real dt; returns how much to scale gameplay
   *  dt by this frame (1 = normal speed, near-0 = frozen on impact). */
  function getTimeScale(dt) {
    if (hitStopTimer > 0) {
      hitStopTimer -= dt;
      return 0.04;
    }
    return 1;
  }

  function emitDamageAura(x, y, z) {
    for (let i = 0; i < 12; i++) {
      const s = sparks.find((p) => p.life <= 0);
      if (!s) break;
      s.mesh.position.set(x + (Math.random() - 0.5) * 0.4, (y || 0) + 0.8 + Math.random() * 0.6, z || 0);
      s.vx = (Math.random() - 0.5) * 1.2;
      s.vy = 0.3 + Math.random() * 0.8;
      s.vz = (Math.random() - 0.5) * 1.2;
      s.life = 0.4 + Math.random() * 0.15;
      s.mesh.material = redMat.clone();
      s.mesh.material.opacity = 0.85;
      s.mesh.visible = true;
    }
  }

  function emitPunchTrail(x, z, heavy = false, isKick = false) {
    for (let i = 0; i < TRAIL_SEGMENTS; i++) {
      const t = i / (TRAIL_SEGMENTS - 1);
      trailPositions[i * 3] = x + t * (heavy ? 0.9 : 0.55);
      trailPositions[i * 3 + 1] = (isKick ? 0.75 : 1.0) + Math.sin(t * Math.PI) * (isKick ? 0.35 : 0.08);
      trailPositions[i * 3 + 2] = (z || 0) + t * 0.15;
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailMat.color.setHex(isKick ? 0x88eeff : 0x00bfff);
    trailMat.opacity = heavy ? 0.95 : 0.75;
    punchTrail.visible = true;
    trailLife = heavy ? 0.35 : 0.25;
  }

  function spawnDamagePopup3D(x, y, z, damage, { critical = false, blocked = false } = {}) {
    const slot = popups.find((p) => p.life <= 0);
    if (!slot) return;
    const ctx = slot.canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 64);
    ctx.textAlign = 'center';
    ctx.font = `bold ${critical ? 40 : blocked ? 28 : 34}px Arial`;
    ctx.fillStyle = blocked ? '#0047AB' : critical ? '#FF0000' : '#FFFF00';
    if (critical) {
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 8;
    }
    ctx.fillText(String(damage), 64, 44);
    slot.tex.needsUpdate = true;
    slot.sprite.position.set(x, (y || 0) + 1.6, z || 0);
    slot.sprite.visible = true;
    slot.life = 1.0;
    slot.vy = 0.9;
    slot.sprite.material.opacity = 1;
  }

  function tick(dt, camera) {
    sparks.forEach((s) => {
      if (s.life <= 0) {
        s.mesh.visible = false;
        return;
      }
      s.life -= dt;
      s.mesh.position.x += s.vx * dt;
      s.mesh.position.y += s.vy * dt;
      s.mesh.position.z += s.vz * dt;
      s.vy -= 5 * dt;
      s.mesh.material.opacity = Math.max(0, s.life * 2.2);
      if (s.life <= 0) s.mesh.visible = false;
    });

    if (trailLife > 0) {
      trailLife -= dt;
      trailMat.opacity = Math.max(0, trailLife * 2.5);
      if (trailLife <= 0) punchTrail.visible = false;
    }

    popups.forEach((p) => {
      if (p.life <= 0) {
        p.sprite.visible = false;
        return;
      }
      p.life -= dt;
      p.sprite.position.y += p.vy * dt;
      p.sprite.material.opacity = Math.max(0, p.life);
      if (p.life <= 0) p.sprite.visible = false;
    });

    if (camera) {
      if (camKnockbackVel > 0.01) {
        if (camBase.lengthSq() === 0) camBase.copy(camera.position);
        camKnockback += camKnockbackVel * dt;
        camKnockbackVel *= 0.88;
        camera.position.z = camBase.z - camKnockback;
      } else if (camKnockback > 0.001) {
        camKnockback *= 0.9;
        camera.position.z = camBase.z - camKnockback;
        if (camKnockback < 0.01) {
          camKnockback = 0;
          camera.position.copy(camBase);
        }
      }

      if (shake > 0.005) {
        shake *= 0.78;
        camera.position.x += (Math.random() - 0.5) * shake;
        camera.position.y += (Math.random() - 0.5) * shake * 0.35;
      } else {
        shake = 0;
      }
    }

    if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
    return { shake, flash };
  }

  return {
    emitImpact,
    emitDamageAura,
    emitPunchTrail,
    spawnDamagePopup3D,
    tick,
    getTimeScale,
    getFlash: () => flash,
  };
}

/** Attach combat impact handler to scene.userData */
export function wireFightingVfx(scene, vfx) {
  scene.userData.onCombatImpact = ({
    x = 0, y = 0, z = 0, intensity = 1, heavy = false, damage = 0, critical = false, blocked = false,
  } = {}) => {
    vfx.emitImpact(x, y, z, heavy ? intensity * 1.4 : intensity, heavy);
    if (damage > 0) {
      vfx.spawnDamagePopup3D(x, y, z, damage, { critical, blocked });
    }
  };

  scene.userData.onCombatAttack = ({ x = 0, z = 0, heavy = false, actionId = '' } = {}) => {
    const isKick = /kick|roundhouse|sweep/i.test(actionId);
    vfx.emitPunchTrail(x, z, heavy, isKick);
  };

  scene.userData.onCombatDamageTaken = ({ x = 0, y = 0, z = 0 } = {}) => {
    vfx.emitDamageAura(x, y, z);
  };
}
