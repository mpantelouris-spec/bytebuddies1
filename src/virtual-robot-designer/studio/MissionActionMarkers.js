/**
 * MissionActionMarkers.js — turns a mission's checkpoints into "do something here" spots.
 *
 * For missions that need an action block (Pick up, Spray water, Take photo, Land…)
 * each checkpoint gets a floating icon of that action over a glowing pad. Flying
 * missions swap their fly-through rings for real stations: landing pads, delivery
 * baskets, camera posts and lanterns. When the right block is used on a marker it
 * flips to a green tick.
 */
import * as THREE from 'three';
import { getMissionAction } from '../data/mission-actions.js';

function iconTexture(emoji, ring = '#ffffff', done = false) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = done ? '#22c55e' : 'rgba(15,23,42,0.82)';
  x.beginPath(); x.arc(64, 64, 58, 0, Math.PI * 2); x.fill();
  x.lineWidth = 8; x.strokeStyle = done ? '#bbf7d0' : ring; x.stroke();
  x.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(done ? '✔' : emoji, 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const STATION_COLORS = {
  land: 0x38bdf8, drop_package: 0xf59e0b, take_photo: 0xec4899, light_up: 0xfacc15,
  pick_up: 0x22c55e, drop_off: 0xf97316, scan_here: 0x06b6d4, spray_water: 0x3b82f6,
  drill: 0xa16207, plant_flag: 0xef4444, push_object: 0x8b5cf6, press_alarm: 0xef4444,
};

function landingPad(color) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.5, 40), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.2 }));
  base.position.y = -0.25;
  g.add(base);
  const top = new THREE.Mesh(new THREE.CircleGeometry(2.45, 40), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 }));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.01;
  g.add(top);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.2, 40), new THREE.MeshBasicMaterial({ color, toneMapped: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);
  // big "H"
  const hMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [[-0.55, 0, 0.18, 1.5], [0.55, 0, 0.18, 1.5], [0, 0, 1.1, 0.18]].forEach(([x, z, w, d]) => {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(w, d), hMat);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set(x, 0.03, z);
    g.add(bar);
  });
  // little floating island rock under the pad
  const rock = new THREE.Mesh(new THREE.ConeGeometry(2.7, 4.5, 9), new THREE.MeshStandardMaterial({ color: 0x8b6b4a, roughness: 1, flatShading: true }));
  rock.rotation.x = Math.PI;
  rock.position.y = -2.8;
  g.add(rock);
  return g;
}

function balloonStation(color) {
  const g = new THREE.Group();
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 1.1, 14), new THREE.MeshStandardMaterial({ color: 0x9a6b3c, roughness: 0.9 }));
  g.add(basket);
  const env = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 18), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
  env.scale.y = 1.2;
  env.position.y = 4.4;
  g.add(env);
  const ropeMat = new THREE.MeshBasicMaterial({ color: 0x3b2a1a });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 4), ropeMat);
    rope.position.set(Math.cos(a) * 0.9, 1.8, Math.sin(a) * 0.9);
    g.add(rope);
  }
  return g;
}

function cameraPost(color) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.6, roughness: 0.3 }));
  pole.position.y = -1.5;
  g.add(pole);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 8, 4), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 }));
  frame.rotation.z = Math.PI / 4;
  g.add(frame);
  return g;
}

function lantern(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 14), new THREE.MeshStandardMaterial({ color: 0x3f3f46, emissive: color, emissiveIntensity: 0.05, roughness: 0.5 }));
  body.scale.y = 1.25;
  body.name = 'lantern-body';
  g.add(body);
  return g;
}

export function groundPad(color) {
  const disc = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.6, 36), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, toneMapped: false }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.06;
  return disc;
}

export function installMissionActionMarkers(scene, challenge) {
  scene.userData.missionAction = null;
  const action = getMissionAction(challenge);
  let cps = scene.userData.chassisCheckpoints || [];
  if (!action || !cps.length) return null;
  // A handful of well-spaced stations reads better than a crowd of them
  const tierMarkers = (challenge?.modeIndex || 1) > 10 ? cps.length : 0; // tier levels set their own count
  const want = tierMarkers || Math.min(cps.length, (challenge?.modeIndex || 1) <= 5 ? 3 : 4);
  if (cps.length > want) {
    cps = Array.from({ length: want }, (_, i) => cps[Math.round((i + 0.5) * (cps.length / want) - 0.5)]);
    cps.forEach((c, i) => { c.index = i; c.passed = false; });
    scene.userData.chassisCheckpoints = cps;
    scene.userData.chassisCheckpointTotal = cps.length;
  }
  scene.userData.missionAction = action;
  const aerial = !!scene.userData.aerialWorldBuilt;
  const col = STATION_COLORS[action.id] ?? 0x22c55e;
  const root = new THREE.Group();
  root.name = 'mission-action-markers';
  scene.add(root);

  // Flying stations replace the fly-through rings for these missions
  if (aerial && ['land', 'drop_package', 'take_photo'].includes(action.id)) {
    const gates = scene.getObjectByName('AerialGates');
    if (gates) gates.visible = false;
  }
  const lo = scene.userData._chassisCurve?.points?.reduce((m, q) => Math.min(m, q.y), Infinity);
  const padY = Number.isFinite(lo) ? lo - 5 : 0;

  cps.forEach((cp) => {
    const g = new THREE.Group();
    const baseY = aerial ? (action.id === 'land' ? padY : (cp.y ?? 6) - (action.id === 'drop_package' ? 5 : 0)) : 0;
    g.position.set(cp.x, baseY, cp.z);
    if (aerial) {
      if (action.id === 'land') g.add(landingPad(col));
      else if (action.id === 'drop_package') g.add(balloonStation(col));
      else if (action.id === 'take_photo') g.add(cameraPost(col));
      else if (action.id === 'light_up') g.add(lantern(col));
    } else {
      // The arena already draws a ring + badge at each checkpoint: hide its badge so ours replaces it
      scene.traverse((o) => {
        if (!o.isSprite || o === g) return;
        const v = o.getWorldPosition(new THREE.Vector3());
        if (Math.hypot(v.x - cp.x, v.z - cp.z) < 1.6 && v.y < 4) o.visible = false;
      });
    }
    const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(action.icon, `#${new THREE.Color(col).getHexString()}`), depthTest: false, transparent: true }));
    icon.scale.setScalar(aerial ? 2.6 : 1.25);
    icon.position.y = aerial ? (action.id === 'land' ? 3.2 : 3.6) : 4.6;
    icon.renderOrder = 30;
    icon.userData.baseY = icon.position.y;
    g.add(icon);
    g.userData.icon = icon;
    root.add(g);
    cp.mesh = g;
  });

  scene.userData.onMissionMarkerDone = (cp) => {
    const g = cp.mesh;
    if (!g) return;
    const icon = g.userData.icon;
    if (icon) {
      icon.material.map?.dispose();
      icon.material.map = iconTexture(action.icon, '#22c55e', true);
      icon.material.needsUpdate = true;
    }
    g.traverse((o) => {
      if (o.name === 'lantern-body') { o.material.emissive.setHex(0xffd166); o.material.emissiveIntensity = 1.6; }
    });
  };

  // bob the icons so they catch the eye
  (scene.userData.movers ||= []).push({
    update(t) {
      root.children.forEach((g, i) => {
        const ic = g.userData.icon;
        if (ic) ic.position.y = ic.userData.baseY + Math.sin(t * 2 + i) * 0.18;
      });
    },
  });
  console.log('[MissionAction]', action.id, 'markers', cps.length);
  return action;
}
