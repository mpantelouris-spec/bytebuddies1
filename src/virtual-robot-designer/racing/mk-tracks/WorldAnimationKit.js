/**
 * WorldAnimationKit.js — Keeps worlds alive: wind, waves, wildlife, mist, flags.
 */
import * as THREE from 'three';

export function tagWindSway(obj, phase = 0, amount = 0.12) {
  obj.userData.windSway = true;
  obj.userData.windPhase = phase;
  obj.userData.windAmount = amount;
  return obj;
}

export function tagRock(obj, phase = 0) {
  obj.userData.rock = true;
  obj.userData.rockPhase = phase;
  return obj;
}

export function tagSoar(obj, phase = 0, radius = 12, height = 8) {
  obj.userData.soar = true;
  obj.userData.soarPhase = phase;
  obj.userData.soarRadius = radius;
  obj.userData.soarHeight = height;
  obj.userData.basePos = obj.position.clone();
  return obj;
}

export function tagLeap(obj, phase = 0) {
  obj.userData.leap = true;
  obj.userData.leapPhase = phase;
  obj.userData.baseY = obj.position.y;
  return obj;
}

export function tagMist(obj, phase = 0) {
  obj.userData.mist = true;
  obj.userData.mistPhase = phase;
  return obj;
}

export function tagFlag(obj, phase = 0) {
  obj.userData.flag = true;
  obj.userData.flagPhase = phase;
  return obj;
}

export function tagPulseLight(obj, phase = 0) {
  obj.userData.pulseLight = true;
  obj.userData.pulsePhase = phase;
  return obj;
}

export function animateWorldLife(root, time) {
  root.traverse((obj) => {
    if (obj.userData.windSway) {
      const a = obj.userData.windAmount ?? 0.1;
      const ph = obj.userData.windPhase ?? 0;
      obj.rotation.z = Math.sin(time * 1.2 + ph) * a;
      obj.rotation.x = Math.sin(time * 0.9 + ph * 1.3) * a * 0.4;
    }
    if (obj.userData.rock) {
      const ph = obj.userData.rockPhase ?? 0;
      obj.rotation.z = Math.sin(time * 0.8 + ph) * 0.04;
      obj.position.y = (obj.userData.baseY ?? obj.position.y) + Math.sin(time * 1.1 + ph) * 0.15;
    }
    if (obj.userData.soar && obj.userData.basePos) {
      const ph = obj.userData.soarPhase ?? 0;
      const r = obj.userData.soarRadius ?? 10;
      const h = obj.userData.soarHeight ?? 6;
      obj.position.x = obj.userData.basePos.x + Math.sin(time * 0.4 + ph) * r;
      obj.position.z = obj.userData.basePos.z + Math.cos(time * 0.35 + ph) * r * 0.6;
      obj.position.y = obj.userData.basePos.y + h + Math.sin(time * 0.6 + ph) * 2;
      obj.rotation.y = time * 0.5 + ph;
    }
    if (obj.userData.leap) {
      const ph = obj.userData.leapPhase ?? 0;
      const cycle = ((time * 0.35 + ph) % 6) / 6;
      const jump = cycle < 0.4 ? Math.sin(cycle / 0.4 * Math.PI) * 6 : 0;
      obj.position.y = (obj.userData.baseY ?? 0) + jump;
    }
    if (obj.userData.mist) {
      const ph = obj.userData.mistPhase ?? 0;
      if (obj.material?.opacity !== undefined) {
        obj.material.opacity = 0.15 + Math.sin(time * 0.5 + ph) * 0.1;
      }
      obj.position.x += Math.sin(time * 0.2 + ph) * 0.02;
    }
    if (obj.userData.flag) {
      const ph = obj.userData.flagPhase ?? 0;
      obj.rotation.y = Math.sin(time * 3 + ph) * 0.25;
    }
    if (obj.userData.pulseLight && obj.isLight) {
      const ph = obj.userData.pulsePhase ?? 0;
      obj.intensity = (obj.userData.baseIntensity ?? obj.intensity) * (0.85 + Math.sin(time * 1.5 + ph) * 0.15);
    }
    if (obj.userData.beaconSpin) {
      obj.rotation.y = time * 0.8;
    }
  });
}

export function chainWorldAnimation(world, extraFn) {
  const prev = world.userData.animTick;
  world.userData.animTick = (time) => {
    prev?.(time);
    animateWorldLife(world, time);
    extraFn?.(time, world);
  };
}

/** Drifting leaves / petals across track corridor */
export function spawnDriftingLeaves(world, bounds, count = 25, color = 0xffaa44) {
  for (let i = 0; i < count; i++) {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 0.18),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    );
    leaf.position.set(
      bounds.cx + (Math.random() - 0.5) * bounds.spanX * 0.7,
      1.5 + Math.random() * 4,
      bounds.cz + (Math.random() - 0.5) * bounds.spanZ * 0.7,
    );
    leaf.userData.drift = true;
    leaf.userData.driftPhase = i;
    leaf.userData.driftSpeed = 0.3 + Math.random() * 0.4;
    world.add(leaf);
  }
}

export function animateDriftingLeaves(world, time) {
  world.traverse((obj) => {
    if (!obj.userData.drift) return;
    const ph = obj.userData.driftPhase ?? 0;
    const sp = obj.userData.driftSpeed ?? 0.3;
    obj.position.x += Math.sin(time * sp + ph) * 0.04;
    obj.position.z += Math.cos(time * sp * 0.7 + ph) * 0.03;
    obj.rotation.z = time * 2 + ph;
    obj.rotation.y = Math.sin(time + ph) * 0.5;
  });
}
