/**
 * AerialDifficultyKit — visible and playable progression across flight arenas.
 */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';

export const AERIAL_DIFFICULTY_PROFILES = [
  null,
  { rating: 1, label: 'TUTORIAL', hazards: 0, laneOffset: 8.0, motion: 0 },
  { rating: 2, label: 'EASY', hazards: 0, laneOffset: 7.5, motion: 0 },
  { rating: 3, label: 'EASY+', hazards: 1, laneOffset: 6.8, motion: 0 },
  { rating: 4, label: 'MEDIUM', hazards: 2, laneOffset: 6.0, motion: 0.15 },
  { rating: 5, label: 'MEDIUM+', hazards: 3, laneOffset: 5.4, motion: 0.22 },
  { rating: 6, label: 'ADVANCED', hazards: 4, laneOffset: 4.9, motion: 0.3 },
  { rating: 7, label: 'HARD', hazards: 5, laneOffset: 4.5, motion: 0.42 },
  { rating: 8, label: 'HARD+', hazards: 6, laneOffset: 4.1, motion: 0.55 },
  { rating: 9, label: 'ACE', hazards: 8, laneOffset: 3.8, motion: 0.7 },
  { rating: 10, label: 'EXPERT', hazards: 10, laneOffset: 3.5, motion: 0.85 },
];

function makeHazardDrone(accent, index) {
  const group = new THREE.Group();
  group.name = `aerial-hazard-${index}`;
  const shell = new THREE.MeshStandardMaterial({
    color: 0x20283a,
    metalness: 0.62,
    roughness: 0.34,
    envMapIntensity: 0.7,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 0.85,
    metalness: 0.25,
    roughness: 0.28,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), shell);
  core.castShadow = true;
  group.add(core);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), glow);
  eye.position.z = 0.62;
  group.add(eye);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 0.24), shell);
    arm.rotation.z = (i / 3) * Math.PI * 2;
    arm.position.set(Math.sin(arm.rotation.z) * 0.78, Math.cos(arm.rotation.z) * 0.78, 0);
    group.add(arm);
  }
  const warning = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.055, 8, 32), glow);
  warning.userData.warningRing = true;
  group.add(warning);
  return group;
}

function addHazards(scene, root, curve, profile, accent) {
  const obstacles = scene.userData.obstacles = scene.userData.obstacles || [];
  for (let i = 0; i < profile.hazards; i++) {
    const t = 0.14 + ((i + 1) / (profile.hazards + 1)) * 0.76;
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const side = i % 2 ? -1 : 1;
    const lateral = profile.laneOffset + (i % 3) * 0.45;
    const drone = makeHazardDrone(accent, i);
    drone.position.set(
      p.x - tangent.z * side * lateral,
      p.y + ((i % 3) - 1) * 1.2,
      p.z + tangent.x * side * lateral,
    );
    drone.rotation.y = Math.atan2(tangent.x, tangent.z);
    root.add(drone);
    obstacles.push({ mesh: drone, radius: 1.0, type: 'aerial_hazard', check3d: true });

    const base = drone.position.clone();
    const phase = i * 1.37;
    arenaMover(scene, (time) => {
      drone.rotation.y += 0.006 + profile.motion * 0.004;
      const ring = drone.children.find((child) => child.userData.warningRing);
      if (ring) ring.rotation.z = time * (0.35 + profile.motion);
      if (profile.motion > 0) {
        drone.position.x = base.x + Math.sin(time * (0.55 + profile.motion * 0.35) + phase) * profile.motion * 1.8;
        drone.position.y = base.y + Math.cos(time * 0.7 + phase) * profile.motion * 0.75;
      }
    });
  }
}

function addRain(scene, root, curve, intensity = 1) {
  const center = curve.getPoint(0.5);
  const count = Math.round(140 * intensity);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = center.x + (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = center.y - 18 + Math.random() * 50;
    positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * 150;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const rain = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0x9ecbff,
    size: 0.12,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  }));
  root.add(rain);
  arenaMover(scene, (_time, dt = 1 / 60) => {
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - dt * (22 + intensity * 8);
      if (y < center.y - 18) y += 50;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
}

function addWindZones(scene, root, curve, count, accent) {
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const p = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const ribbonPoints = [];
    for (let j = -3; j <= 3; j++) {
      ribbonPoints.push(new THREE.Vector3(
        p.x - tangent.z * j * 1.5,
        p.y + Math.sin(j * 0.9) * 0.7,
        p.z + tangent.x * j * 1.5,
      ));
    }
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribbonPoints), 24, 0.06, 5, false),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    root.add(ribbon);
    arenaMover(scene, (time) => {
      ribbon.material.opacity = 0.22 + Math.sin(time * 2 + i) * 0.08;
    });
  }
}

function addHoverPads(root, curve, count, accent) {
  for (let i = 0; i < count; i++) {
    const p = curve.getPoint((i + 1) / (count + 1));
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.35, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        emissive: accent,
        emissiveIntensity: 0.22,
        metalness: 0.55,
        roughness: 0.34,
      }),
    );
    pad.position.set(p.x, p.y - 5.5, p.z);
    pad.receiveShadow = true;
    root.add(pad);
  }
}

function addSectionBeacons(scene, root, curve, accent) {
  const colors = [0x38bdf8, 0xfacc15, 0xf97316, accent];
  [0.12, 0.36, 0.62, 0.86].forEach((t, i) => {
    const p = curve.getPoint(t);
    const material = new THREE.MeshStandardMaterial({
      color: colors[i],
      emissive: colors[i],
      emissiveIntensity: 0.55,
      roughness: 0.3,
    });
    [-1, 1].forEach((side) => {
      const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), material);
      beacon.position.set(p.x + side * 7, p.y + 2, p.z);
      root.add(beacon);
      arenaMover(scene, (time) => {
        beacon.position.y = p.y + 2 + Math.sin(time * 1.4 + i + side) * 0.45;
        beacon.rotation.y = time * 0.45 * side;
      });
    });
  });
}

function addStormVortex(scene, root, curve) {
  const center = curve.getPoint(0.62);
  const vortex = new THREE.Group();
  vortex.name = 'AerialStormVortex';
  vortex.position.copy(center);
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0x29364d,
    roughness: 1,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const radius = 10.5 + (i % 3) * 1.7;
    const cloud = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2.8 + (i % 4) * 0.6, 1),
      cloudMaterial,
    );
    cloud.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i % 2) * 2 - 1);
    cloud.scale.set(1.5, 0.72, 1);
    vortex.add(cloud);
  }
  root.add(vortex);
  arenaMover(scene, (time) => {
    vortex.rotation.z = time * 0.075;
    vortex.scale.setScalar(1 + Math.sin(time * 0.45) * 0.035);
  });
}

export function installAerialDifficulty(scene, curve, recipe, challenge = null) {
  const level = Math.max(1, Math.min(10, Number(challenge?.modeIndex || recipe.difficultyLevel || 1)));
  const profile = AERIAL_DIFFICULTY_PROFILES[level];
  const accent = recipe.gateColors?.primary ?? 0x38bdf8;
  const root = new THREE.Group();
  root.name = 'AerialDifficultyDressing';
  scene.add(root);

  scene.userData.aerialDifficulty = {
    level,
    rating: profile.rating,
    label: challenge?.difficulty || profile.label,
    hazards: profile.hazards,
    arena: recipe.id,
  };

  addHazards(scene, root, curve, profile, accent);
  if (recipe.rain) addRain(scene, root, curve, level >= 9 ? 1.55 : 1);
  if (recipe.windZones) addWindZones(scene, root, curve, recipe.windZones, accent);
  if (recipe.hoverPads) addHoverPads(root, curve, recipe.hoverPads, accent);
  if (recipe.sections) addSectionBeacons(scene, root, curve, accent);
  if (recipe.stormWall) addStormVortex(scene, root, curve);
  return profile;
}
