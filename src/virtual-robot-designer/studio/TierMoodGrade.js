/**
 * Colour-grade a finished arena with a tier level's lighting mood (modes 11–50),
 * so a level that shares a stadium or ring with others still looks like its own
 * place: dawn, golden hour, dusk, storm…
 */
import * as THREE from 'three';

export function applyTierMoodGrade(scene, mood) {
  if (!scene || !mood) return;
  const tintColor = new THREE.Color(mood.tint);
  const grade = (c, k = 1) => c && c.isColor && c.lerp(tintColor, mood.amount * k);
  if (scene.background?.isColor) grade(scene.background);
  if (scene.fog?.color) grade(scene.fog.color);
  scene.traverse((o) => {
    if (!o.isLight) return;
    grade(o.color, 0.8);
    if (o.groundColor) grade(o.groundColor, 0.5);
    o.intensity *= mood.light;
  });
  scene.userData.tierMood = mood.id;
}
