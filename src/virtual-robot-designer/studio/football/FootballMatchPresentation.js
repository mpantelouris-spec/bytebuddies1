/**
 * Match presentation layer — goal moments, kickoff, pass juice (single hook point).
 */
import * as THREE from 'three';

export function bindFootballMatchPresentation(scene, match) {
  const presentation = {
    lastGoalAt: 0,
    passFlashUntil: 0,
  };
  scene.userData.footballPresentation = presentation;

  const priorGoal = scene.userData.onFootballGoal;
  scene.userData.onFootballGoal = (data = {}) => {
    presentation.lastGoalAt = performance.now();
    priorGoal?.(data);
    spawnGoalConfetti(scene, data);
  };

  const priorKick = scene.userData.onFootballKick;
  scene.userData.onFootballKick = (data = {}) => {
    if (/pass/i.test(data.kickType || '')) {
      presentation.passFlashUntil = performance.now() + 400;
    }
    priorKick?.(data);
  };

  return presentation;
}

function spawnGoalConfetti(scene, { x = 0, z = 0 } = {}) {
  const grp = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.08, 6, 6);
  const mats = [
    new THREE.MeshBasicMaterial({ color: 0x22c55e }),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
  ];
  for (let i = 0; i < 10; i += 1) {
    const p = new THREE.Mesh(geo, mats[i % 2]);
    p.position.set((Math.random() - 0.5) * 1.6, 1.2 + Math.random(), (Math.random() - 0.5) * 1.6);
    p.userData.vy = 2.2 + Math.random() * 2;
    grp.add(p);
  }
  grp.position.set(x, 0, z);
  scene.add(grp);
  const start = performance.now();
  const tick = () => {
    const age = (performance.now() - start) / 1000;
    for (const p of grp.children) {
      p.position.y += p.userData.vy * 0.016;
      p.userData.vy -= 5.5 * 0.016;
    }
    if (age > 1.5) {
      scene.remove(grp);
      geo.dispose();
      mats.forEach((m) => m.dispose());
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function getFootballPresentationState(scene) {
  return scene.userData.footballPresentation || {};
}
