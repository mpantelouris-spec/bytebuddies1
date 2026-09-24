/**
 * Arcade-style hit feedback — particles, screen shake tiers, block sparks, KO dust.
 */
import * as THREE from 'three';
import { mapCombatActionToAttack } from './boxingGameMechanics.js';
import { ATTACKS } from './boxingGameConstants.js';

export const IMPACT_TIERS = {
  light: { particles: 20, shake: 0.06, color: 0xffffff, flash: 0.04, size: 0.05 },
  medium: { particles: 30, shake: 0.12, color: 0xffee88, flash: 0.06, size: 0.06 },
  heavy: { particles: 50, shake: 0.22, color: 0xff8800, flash: 0.08, size: 0.08 },
  lightKick: { particles: 25, shake: 0.10, color: 0xccddff, flash: 0.05, size: 0.055 },
  roundhouseKick: { particles: 35, shake: 0.15, color: 0xaaddff, flash: 0.07, size: 0.065 },
  heavyKick: { particles: 60, shake: 0.25, color: 0xffffff, flash: 0.10, size: 0.09 },
  sweepKick: { particles: 20, shake: 0.12, color: 0x998877, flash: 0.05, size: 0.06 },
  kick: { particles: 35, shake: 0.15, color: 0xffaa44, flash: 0.07, size: 0.07 },
  mega: { particles: 60, shake: 0.28, color: 0xff4400, flash: 0.1, size: 0.09 },
  block: { particles: 12, shake: 0.04, color: 0x66ccff, flash: 0.03, size: 0.04 },
  knockdown: { particles: 45, shake: 0.3, color: 0xcccccc, flash: 0.12, size: 0.1 },
};

const ATTACK_TIER = {
  JAB: 'light',
  STRAIGHT: 'medium',
  HOOK: 'heavy',
  KICK: 'lightKick',
  ROUNDHOUSE: 'roundhouseKick',
  HAYMAKER: 'heavyKick',
  SWEEP: 'sweepKick',
  POWER_PUNCH: 'mega',
};

export function getImpactTier(actionId, blocked = false) {
  if (blocked) return IMPACT_TIERS.block;
  const key = mapCombatActionToAttack(actionId);
  const tierName = ATTACK_TIER[key] || 'light';
  return IMPACT_TIERS[tierName];
}

export function getImpactShake(actionId, blocked = false) {
  return getImpactTier(actionId, blocked).shake;
}

function burstParticles(scene, x, y, z, tier, velocityBias = [0, 1, 0]) {
  const count = tier.particles;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = x + (Math.random() - 0.5) * 0.25;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.25;
    vel.push({
      x: (Math.random() - 0.5) * 2.5 + velocityBias[0],
      y: Math.random() * 2.8 + velocityBias[1],
      z: (Math.random() - 0.5) * 2.5 + velocityBias[2],
    });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: tier.color,
    size: tier.size,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  let life = 0.35;
  const tick = () => {
    life -= 0.016;
    const arr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += vel[i].x * 0.016;
      arr[i * 3 + 1] += vel[i].y * 0.016;
      arr[i * 3 + 2] += vel[i].z * 0.016;
      vel[i].y -= 0.08;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, life / 0.35);
    if (life <= 0) {
      scene.remove(pts);
      geo.dispose();
      mat.dispose();
    } else {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

export function spawnGameHitBurst(scene, x, y, z, actionId, blocked = false) {
  const tier = getImpactTier(actionId, blocked);
  burstParticles(scene, x, y, z, tier, blocked ? [0, 0.5, 0] : [0, 1.2, 0]);
  return tier;
}

export function spawnBlockSpark(scene, x, y, z) {
  burstParticles(scene, x, y, z, IMPACT_TIERS.block, [0, 0.8, 0]);
}

export function spawnKnockdownDust(scene, x, z) {
  burstParticles(scene, x, 0.15, z, IMPACT_TIERS.knockdown, [0, 0.4, 0]);
}

/** Brief full-screen flash overlay on the viewport element */
export function flashViewport(viewportEl, intensity = 0.08, color = '255,255,255') {
  if (!viewportEl) return;
  const flash = document.createElement('div');
  flash.className = 'boxing-hit-flash';
  flash.style.cssText = `
    position:absolute;inset:0;pointer-events:none;z-index:15;
    background:rgba(${color},${Math.min(0.35, intensity)});
    animation:boxing-flash-fade 0.12s ease-out forwards;
  `;
  viewportEl.appendChild(flash);
  setTimeout(() => flash.remove(), 130);
}

export function getAttackKnockback(actionId, blocked = false) {
  const key = mapCombatActionToAttack(actionId);
  const atk = ATTACKS[key];
  if (!atk) return blocked ? 0.02 : 0.05;
  return blocked ? (atk.knockback || 0.1) * 0.2 : (atk.knockback || 0.1);
}
