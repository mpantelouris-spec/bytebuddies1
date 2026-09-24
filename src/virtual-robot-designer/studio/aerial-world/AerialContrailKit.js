/**
 * AerialContrailKit — soft vapor trail behind flying chassis.
 */
import * as THREE from 'three';

const POOL = 28;

export function initAerialContrails(scene) {
  if (scene.userData.aerialContrails) return scene.userData.aerialContrails;

  const g = new THREE.Group();
  g.name = 'AerialContrails';
  scene.add(g);

  const parts = [];
  for (let i = 0; i < POOL; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 6, 4),
      new THREE.MeshBasicMaterial({
        color: 0xe8f4ff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    mesh.renderOrder = 5;
    g.add(mesh);
    parts.push({ mesh, life: 0, maxLife: 0.55 + (i % 5) * 0.08 });
  }

  const state = { group: g, parts, head: 0 };
  scene.userData.aerialContrails = state;
  return state;
}

export function updateAerialContrails(scene, x, y, z, angle, speed, dt) {
  const state = scene.userData.aerialContrails;
  if (!state) return;

  const spawnRate = speed > 6 ? 0.04 : speed > 3 ? 0.07 : 0.12;
  state._acc = (state._acc ?? 0) + dt;
  if (state._acc >= spawnRate && speed > 1.5) {
    state._acc = 0;
    const p = state.parts[state.head];
    state.head = (state.head + 1) % state.parts.length;
    const back = 1.8 + speed * 0.04;
    p.mesh.position.set(
      x - Math.sin(angle) * back,
      y - 0.15,
      z - Math.cos(angle) * back,
    );
    const s = 0.35 + Math.min(speed * 0.02, 0.45);
    p.mesh.scale.setScalar(s);
    p.life = p.maxLife;
    p.mesh.material.opacity = 0.38;
  }

  state.parts.forEach((p) => {
    if (p.life <= 0) {
      p.mesh.material.opacity = 0;
      return;
    }
    p.life -= dt;
    const t = Math.max(0, p.life / p.maxLife);
    p.mesh.material.opacity = t * 0.42;
    p.mesh.scale.multiplyScalar(1 + dt * 0.35);
    p.mesh.position.y -= dt * 0.08;
  });
}

export function disposeAerialContrails(scene) {
  const state = scene.userData.aerialContrails;
  if (!state) return;
  state.group.parent?.remove(state.group);
  state.parts.forEach((p) => {
    p.mesh.geometry?.dispose?.();
    p.mesh.material?.dispose?.();
  });
  delete scene.userData.aerialContrails;
}
