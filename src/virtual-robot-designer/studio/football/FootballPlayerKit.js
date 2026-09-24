/**
 * Football player pipeline — glTF skinned mesh when available, procedural fallback.
 */
import * as THREE from 'three';
import { loadRobotGltf } from '../../three/gltfLoader.js';
import {
  buildFootballPlayer,
  buildFootballHumanoidStub,
} from '../football-character-models.js';
import { FOOTBALL_GLB, footballGlbReady, FOOTBALL_GLB_PLAYERS_ENABLED } from './FootballAssetManifest.js';

const TEAM_JERSEY = { green: '#16a34a', blue: '#2563eb' };
let _greenTpl = null;
let _blueTpl = null;

function normalizeFootballGlbScale(root, targetHeight = 1.72) {
  root.traverse((o) => {
    if (o.isSkinnedMesh?.skeleton) {
      o.skeleton.update();
      o.computeBoundingBox?.();
      o.computeBoundingSphere?.();
    }
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) {
    root.scale.setScalar(0.85);
    return;
  }
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 0.35);
  const s = THREE.MathUtils.clamp(targetHeight / h, 0.04, 2.2);
  root.scale.setScalar(s);
  root.updateMatrixWorld(true);
  const grounded = new THREE.Box3().setFromObject(root);
  root.position.y -= grounded.min.y;
  root.position.x -= (grounded.min.x + grounded.max.x) * 0.5;
  root.position.z -= (grounded.min.z + grounded.max.z) * 0.5;
}

function tintKit(root, teamColor) {
  const hex = TEAM_JERSEY[teamColor] || TEAM_JERSEY.green;
  const kit = new THREE.Color(hex);
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    if (o.userData?.isSkin || o.userData?.isHair) return;
    const name = (o.name || '').toLowerCase();
    if (/skin|face|head|hair|eye|teeth|hand|foot/i.test(name)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.color) m.color.lerp(kit, 0.38);
    });
  });
}

function wrapGlbPlayer(scene, { teamColor, jerseyNumber, playstyle, name }) {
  const g = new THREE.Group();
  g.name = name || 'FootballBot';
  normalizeFootballGlbScale(scene);
  scene.rotation.y = Math.PI;
  scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = true;
    }
  });
  tintKit(scene, teamColor);
  g.add(scene);
  g.userData.isFootballPlayer = true;
  g.userData.isGltfFootballPlayer = true;
  g.userData.teamColor = teamColor;
  g.userData.jerseyNumber = jerseyNumber;
  g.userData.playstyle = playstyle;
  g.userData.setAnimState = (state) => {
    g.userData._animState = state;
  };
  g.userData.animate = (t, dt) => {
    const spd = g.userData._runSpeed || 0;
    if (spd > 0.08) {
      scene.rotation.y = Math.sin(t * (8 + spd * 0.6)) * 0.02;
    }
  };
  g.userData.footballRig = { setRunSpeed: (s) => { g.userData._runSpeed = s; } };
  return g;
}

export function clampFootballActorScale(root, targetHeight = 1.72) {
  if (!root) return;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const h = Math.max(box.getSize(new THREE.Vector3()).y, 0.15);
  if (h <= targetHeight * 1.15) return;
  const factor = THREE.MathUtils.clamp(targetHeight / h, 0.02, 1.5);
  root.scale.multiplyScalar(factor);
}

export async function preloadFootballGlbTemplates() {
  if (!FOOTBALL_GLB_PLAYERS_ENABLED) return;
  _greenTpl = await loadRobotGltf(FOOTBALL_GLB.playerGreen);
  _blueTpl = await loadRobotGltf(FOOTBALL_GLB.playerBlue);
  if (!_greenTpl) {
  _greenTpl = await loadRobotGltf(FOOTBALL_GLB.footballer);
  }
}

export function cloneGlbFootballPlayer(config = {}) {
  if (!FOOTBALL_GLB_PLAYERS_ENABLED) return null;
  const { teamColor = 'green' } = config;
  if (!footballGlbReady(teamColor)) return null;
  const tpl = teamColor === 'blue' ? _blueTpl : _greenTpl;
  if (!tpl) return null;
  const mesh = wrapGlbPlayer(tpl.clone(true), config);
  const box = new THREE.Box3().setFromObject(mesh);
  const h = box.isEmpty() ? 0 : box.getSize(new THREE.Vector3()).y;
  if (h > 2.0 || h < 0.4) {
    console.warn('[FootballPlayerKit] glTF scale out of range — procedural fallback', h);
    return null;
  }
  return mesh;
}

/** Sync mesh build — glTF clone when prewarmed, else procedural FIFA player. */
export function buildFootballPlayerMesh(config = {}) {
  const glb = cloneGlbFootballPlayer(config);
  if (glb) return glb;
  try {
    const fighter = buildFootballPlayer({
      teamColor: config.teamColor,
      jerseyNumber: config.jerseyNumber,
      playstyle: config.playstyle,
    });
    const g = new THREE.Group();
    g.name = config.name || 'FootballBot';
    g.add(fighter);
    g.userData.fighterCore = fighter;
    g.userData.rig = fighter.userData.rig;
    g.userData.isFootballPlayer = true;
    g.userData.animate = (t, dt) => fighter.userData.animate?.(t, dt);
    g.userData.setAnimState = (s, d) => fighter.userData.setAnimState?.(s, d);
    g.userData.setSkeletonDriven = (on) => fighter.userData.setSkeletonDriven?.(on);
    g.userData.footballRig = fighter.userData.footballRig;
    g.traverse((o) => { if (o.isMesh) o.frustumCulled = true; });
    return g;
  } catch (err) {
    console.warn('[FootballPlayerKit] procedural fallback', config.name, err);
    const stub = buildFootballHumanoidStub(config);
    const g = new THREE.Group();
    g.name = config.name || 'FootballBot';
    g.add(stub);
    g.userData.setAnimState = () => {};
    g.userData.animate = () => {};
    return g;
  }
}
