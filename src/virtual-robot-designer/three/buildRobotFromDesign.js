import * as THREE from 'three';
import { migrateDesign } from '../config.js';
import { migrateAssembly } from '../services/assembly-service.js';
import { buildRobotFromAssembly } from './buildRobotFromAssembly.js';
import { buildRobotFromBlocks } from './buildRobotFromBlocks.js';
import { countActiveTools } from '../services/design-service.js';
import { tagAnim } from './collectAnimatables.js';
import {
  makeBodyMat,
  makeAccentMat,
  buildTankBody,
  buildRoverBody,
  buildDroneBody,
  buildSpiderBody,
  buildHumanoidBody,
  buildArmBody,
  buildModularBody,
  addStandardWheels,
  addDroneProps,
} from './robotTemplates3D.js';

const SIZE_SCALE = { tiny: 0.5, small: 0.72, medium: 1, large: 1.28 };
const TEMPLATE_SCALE = { drone: 0.9, spider: 0.95, humanoid: 1, tank: 1.12, arm: 0.95, rover: 1, blank: 1 };

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
  });
}

function getDimensions(d) {
  const s = SIZE_SCALE[d.chassis?.size] || 1;
  const t = TEMPLATE_SCALE[d.template] || 1;
  const sx = (d.chassis?.scaleX ?? 1) * s * t;
  const sy = (d.chassis?.scaleY ?? 1) * s * t;
  const sz = (d.chassis?.scaleZ ?? 1) * s * t;
  return {
    bodyW: 1.05 * sx,
    bodyH: 0.62 * sy,
    bodyD: 1.2 * sz,
  };
}

function addGlowShell(group, w, h, d, color) {
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(w * 1.05, h * 1.05, d * 1.05),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    }),
  );
  tagAnim(shell, 'shell-pulse', { base: 0.08, amp: 0.1 });
  group.add(shell);
  return shell;
}

function addPatternDecals(group, pattern, dims, primary, secondary, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  if (pattern === 'solid') return;

  if (pattern === 'stripes' || pattern === 'racing') {
    [-1, 1].forEach((side) => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW * 0.08, bodyH * 0.9, bodyD * 1.02),
        makeAccentMat(secondary, 0.55),
      );
      stripe.position.set(side * bodyW * 0.38, bodyH * 0.05, 0);
      group.add(stripe);
      disposables.push(stripe.geometry, stripe.material);
    });
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.85, bodyH * 0.06, bodyD * 0.2),
      makeAccentMat(secondary, 0.45),
    );
    hood.position.set(0, bodyH * 0.35, bodyD * 0.38);
    group.add(hood);
    disposables.push(hood.geometry, hood.material);
    return;
  }

  if (pattern === 'dots') {
    for (let i = 0; i < 8; i += 1) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        makeAccentMat(secondary, 0.6),
      );
      dot.position.set((Math.random() - 0.5) * bodyW * 0.7, (Math.random() - 0.5) * bodyH * 0.5, bodyD * 0.48);
      group.add(dot);
      disposables.push(dot.geometry, dot.material);
    }
    return;
  }

  if (pattern === 'camo') {
    const colors = [primary, secondary, 0x334155];
    for (let i = 0; i < 6; i += 1) {
      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW * 0.25, bodyH * 0.2, 0.02),
        makeAccentMat(colors[i % 3], 0.25),
      );
      patch.position.set((Math.random() - 0.5) * bodyW * 0.6, (Math.random() - 0.5) * bodyH * 0.4, bodyD * 0.5);
      group.add(patch);
      disposables.push(patch.geometry, patch.material);
    }
  }
}

function addSensorMarkers(group, sensors, dims, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const led = (hex) => makeAccentMat(hex, 0.9);
  const place = (mesh, x, y, z) => {
    mesh.position.set(x, y, z);
    tagAnim(mesh, 'pulse', { base: 0.55, amp: 0.45 });
    group.add(mesh);
  };

  if (sensors.camera || sensors.camera360) {
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.06), led(0x00ff41));
    place(cam, 0, bodyH * 0.45, bodyD * 0.48);
    disposables.push(cam.geometry, cam.material);
    if (sensors.camera360) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.02, 8, 24),
        led(0x00ff41),
      );
      ring.rotation.x = Math.PI / 2;
      place(ring, 0, bodyH * 0.55, 0);
      disposables.push(ring.geometry, ring.material);
    }
  }
  if (sensors.ultrasonic || sensors.lidar) {
    const us = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 16), led(0x00d4ff));
    us.rotation.x = Math.PI / 2;
    place(us, 0, bodyH * 0.15, bodyD * 0.52);
    disposables.push(us.geometry, us.material);
  }
  if (sensors.lidar) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), led(0x00d4ff));
    place(dome, 0, bodyH * 0.55, 0);
    disposables.push(dome.geometry, dome.material);
  }
  if (sensors.gyroscope || sensors.accelerometer || sensors.inclinometer) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.12), led(0xfbbf24));
    place(chip, -bodyW * 0.35, bodyH * 0.4, 0);
    disposables.push(chip.geometry, chip.material);
  }
  if (sensors.touch || sensors.pressure || sensors.collision) {
    const touch = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), led(0xff006e));
    place(touch, bodyW * 0.42, 0, bodyD * 0.35);
    disposables.push(touch.geometry, touch.material);
  }
  if (sensors.thermal || sensors.nightVision || sensors.xray) {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.6, 0.05, 0.03),
      led(sensors.xray ? 0x8b5cf6 : 0xef4444),
    );
    place(visor, 0, bodyH * 0.5, bodyD * 0.46);
    disposables.push(visor.geometry, visor.material);
  }
  if (sensors.temperature || sensors.light || sensors.humidity) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), led(0x22d3ee));
    place(pod, bodyW * 0.4, bodyH * 0.3, -bodyD * 0.35);
    disposables.push(pod.geometry, pod.material);
  }
}

function addTools(group, tools, dims, colors, template, disposables) {
  if (!countActiveTools({ tools })) return;
  const { bodyW, bodyH, bodyD } = dims;
  const primary = colors.primary;
  const armMat = makeAccentMat(primary, 0.3);

  const hasGrabber = tools.pincer || tools.gripper || tools.rotatingGrip || tools.longArm || tools.megaClaw;
  const hasShooter = tools.ballLauncher || tools.dart || tools.water || tools.laser;
  const hasBlade = tools.bulldozer || tools.bumper || tools.saw || tools.laserBlade;
  const hasOther = tools.magnet || tools.net || tools.drill || tools.vacuum || tools.flamethrower;

  if (hasBlade || tools.bulldozer) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 1.15, bodyH * 0.55, 0.12),
      makeAccentMat(tools.laserBlade ? 0x00ff41 : 0x64748b, tools.laserBlade ? 0.6 : 0.15),
    );
    blade.position.set(0, bodyH * 0.05, bodyD * 0.58);
    group.add(blade);
    disposables.push(blade.geometry, blade.material);
  }

  if (hasGrabber) {
    const scale = tools.megaClaw ? 1.6 : tools.longArm ? 1.3 : 1;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, bodyH * 1.1 * scale, 0.1), armMat);
    arm.position.set(bodyW * 0.52, bodyH * 0.2, 0);
    group.add(arm);
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.06), armMat);
    clawL.position.set(bodyW * 0.52, -bodyH * 0.35 * scale, 0.08);
    const clawR = clawL.clone();
    clawR.position.z = -0.08;
    group.add(arm, clawL, clawR);
    disposables.push(arm.geometry, arm.material, clawL.geometry, clawL.material);
  }

  if (hasShooter) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.45, 12),
      makeAccentMat(tools.laser ? 0xff00ff : 0x475569, tools.laser ? 1 : 0.2),
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, bodyH * 0.35, bodyD * 0.55);
    tagAnim(barrel, 'pulse', { base: 0.4, amp: 0.8 });
    group.add(barrel);
    disposables.push(barrel.geometry, barrel.material);
  }

  if (tools.magnet) {
    const mag = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), makeAccentMat(0xef4444, 0.5));
    mag.position.set(-bodyW * 0.45, bodyH * 0.2, 0);
    group.add(mag);
    disposables.push(mag.geometry, mag.material);
  }
  if (tools.vacuum) {
    const vac = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.2, 16), makeAccentMat(0x94a3b8, 0.2));
    vac.position.set(0, -bodyH * 0.2, bodyD * 0.5);
    group.add(vac);
    disposables.push(vac.geometry, vac.material);
  }
  if (tools.flamethrower) {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.35, 8),
      makeAccentMat(0xff6b35, 0.9),
    );
    flame.rotation.x = Math.PI / 2;
    flame.position.set(0, bodyH * 0.1, bodyD * 0.55);
    tagAnim(flame, 'pulse', { base: 0.7, amp: 0.5 });
    group.add(flame);
    disposables.push(flame.geometry, flame.material);
  }
}

function addAbilityFX(group, abilities, dims, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  if (abilities.speedBoost) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(bodyW * 0.65, bodyW * 0.9, 40),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -bodyH * 0.5;
    tagAnim(ring, 'spin-y', { speed: 2 });
    group.add(ring);
    disposables.push(ring.geometry, ring.material);
  }
  if (abilities.forceField || abilities.stealth) {
    const field = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(bodyW, bodyD) * 0.8, 20, 14),
      new THREE.MeshBasicMaterial({ color: 0x8b00ff, transparent: true, opacity: 0.1, wireframe: true }),
    );
    tagAnim(field, 'shield-pulse');
    group.add(field);
    disposables.push(field.geometry, field.material);
  }
  if (abilities.chaosMode) {
    const chaos = new THREE.Mesh(
      new THREE.OctahedronGeometry(bodyW * 0.3, 0),
      makeAccentMat(0xff006e, 0.8),
    );
    chaos.position.y = bodyH * 0.75;
    tagAnim(chaos, 'chaos-spin');
    group.add(chaos);
    disposables.push(chaos.geometry, chaos.material);
  }
}

function addPowerModules(group, d, dims, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const mods = d.modules || {};
  if (mods.power === 'fusion' || d.wheels?.motor === 'turbo') {
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.12, 1),
      new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.1 }),
    );
    core.position.set(0, bodyH * 0.55, -bodyD * 0.2);
    tagAnim(core, 'pulse', { base: 0.8, amp: 0.6 });
    group.add(core);
    disposables.push(core.geometry, core.material);
  }
  if (mods.power === 'solar') {
    [-1, 1].forEach((side) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, bodyH * 0.5, bodyD * 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1e3a5f, emissive: 0xfbbf24, emissiveIntensity: 0.15, metalness: 0.7, roughness: 0.3 }),
      );
      panel.position.set(side * bodyW * 0.55, bodyH * 0.1, 0);
      panel.rotation.z = side * 0.3;
      group.add(panel);
      disposables.push(panel.geometry, panel.material);
    });
  }
  if (mods.power === 'cooling') {
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.3, 0.04, bodyD * 0.25),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 }),
    );
    vent.position.set(0, bodyH * 0.45, -bodyD * 0.35);
    group.add(vent);
    disposables.push(vent.geometry, vent.material);
  }
}

function addCommsModules(group, d, dims, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const mods = d.modules || {};
  if (mods.comms === 'antenna' || mods.comms === 'radio') {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, bodyH * 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 }),
    );
    pole.position.set(-bodyW * 0.4, bodyH * 0.5, 0);
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff006e, emissive: 0xff006e, emissiveIntensity: 0.8 }),
    );
    tip.position.set(-bodyW * 0.4, bodyH * 0.85, 0);
    tagAnim(tip, 'pulse', { base: 0.5, amp: 0.5 });
    group.add(pole, tip);
    disposables.push(pole.geometry, pole.material, tip.geometry, tip.material);
  }
  if (mods.comms === 'dish') {
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 }),
    );
    dish.rotation.x = Math.PI / 2;
    dish.position.set(bodyW * 0.35, bodyH * 0.5, -bodyD * 0.3);
    group.add(dish);
    disposables.push(dish.geometry, dish.material);
  }
  if (mods.comms === 'holo_proj') {
    const holo = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.14, 24),
      new THREE.MeshBasicMaterial({ color: 0xff006e, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    );
    holo.position.set(0, bodyH * 0.7, bodyD * 0.3);
    tagAnim(holo, 'spin-y', { speed: 1.5 });
    group.add(holo);
    disposables.push(holo.geometry, holo.material);
  }
}

function addRobotFace(group, dims, d, disposables) {
  const { bodyW, bodyH, bodyD } = dims;
  const led = d.cosmetics?.ledColor || '#00FF41';
  const eyeMat = new THREE.MeshStandardMaterial({
    color: led,
    emissive: new THREE.Color(led),
    emissiveIntensity: 1.2,
  });
  const eyeGeom = new THREE.SphereGeometry(0.07, 12, 12);
  disposables.push(eyeGeom);
  [-1, 1].forEach((side, i) => {
    const eye = new THREE.Mesh(eyeGeom, eyeMat.clone());
    eye.position.set(side * bodyW * 0.22, bodyH * 0.35, bodyD * 0.48);
    tagAnim(eye, 'pulse', { base: 0.7, amp: 0.5, phase: i * 1.5 });
    group.add(eye);
    disposables.push(eye.material);
  });
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(bodyW * 0.12, 0.015, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 }),
  );
  smile.rotation.x = Math.PI / 2;
  smile.rotation.z = Math.PI;
  smile.position.set(0, bodyH * 0.18, bodyD * 0.5);
  group.add(smile);
  disposables.push(smile.geometry, smile.material);
}

/** Build a Three.js robot group from VRD design config */
export function buildRobotFromDesign(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);

  if (asm.buildMode === 'blocks' || asm.buildMode === 'hybrid') {
    return buildRobotFromBlocks(d);
  }

  if (asm.mode === 'custom') {
    return buildRobotFromAssembly(d);
  }

  const group = new THREE.Group();
  const disposables = [];
  const dims = getDimensions(d);
  const bodyMat = makeBodyMat(d.chassis, d.cosmetics);
  disposables.push(bodyMat);

  const glowColor = d.chassis?.color || d.cosmetics?.primaryColor || '#8B00FF';
  const secondary = d.cosmetics?.secondaryColor || '#FF006E';
  const template = d.template || 'rover';

  let built;
  switch (template) {
    case 'tank':
      built = buildTankBody(group, dims, bodyMat, secondary, d, disposables);
      if (d.wheels?.type !== 'tracks') addStandardWheels(group, d, dims, disposables);
      break;
    case 'drone':
      built = buildDroneBody(group, dims, bodyMat, disposables);
      addDroneProps(group, dims, disposables);
      break;
    case 'spider':
      built = buildSpiderBody(group, dims, bodyMat, disposables);
      addStandardWheels(group, d, dims, disposables);
      break;
    case 'humanoid':
      built = buildHumanoidBody(group, dims, bodyMat, disposables);
      addStandardWheels(group, d, dims, disposables);
      break;
    case 'arm':
      built = buildArmBody(group, dims, bodyMat, disposables);
      break;
    case 'rover':
      built = buildRoverBody(group, dims, bodyMat, d, disposables);
      addStandardWheels(group, d, dims, disposables);
      break;
    default:
      built = buildModularBody(group, dims, bodyMat, d.chassis, disposables);
      if ((d.wheels?.count ?? 4) > 0) addStandardWheels(group, d, dims, disposables);
  }

  const { mainMesh, bodyW, bodyH, bodyD } = built;
  const finalDims = { bodyW, bodyH, bodyD };

  addPatternDecals(group, d.chassis?.pattern, finalDims, glowColor, secondary, disposables);
  addGlowShell(group, bodyW, bodyH, bodyD, glowColor);
  addSensorMarkers(group, d.sensors || {}, finalDims, disposables);
  addTools(group, d.tools || {}, finalDims, { primary: glowColor, secondary }, template, disposables);
  addAbilityFX(group, d.abilities || {}, finalDims, disposables);

  if (d.cosmetics?.accentLights) {
    const led = new THREE.Color(d.cosmetics.ledColor || '#00FF41');
    const ledGeom = new THREE.SphereGeometry(0.045, 8, 8);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
      const dot = new THREE.Mesh(
        ledGeom,
        new THREE.MeshStandardMaterial({ color: led, emissive: led, emissiveIntensity: 1 }),
      );
      dot.position.set(sx * bodyW * 0.46, bodyH * 0.2, sz * bodyD * 0.46);
      tagAnim(dot, 'pulse', { base: 0.6, amp: 0.5, phase: i });
      group.add(dot);
      disposables.push(dot.material);
    });
    disposables.push(ledGeom);
  }

  const motorGlow = { weak: 0.08, medium: 0.18, strong: 0.32, turbo: 0.5 }[d.wheels?.motor] || 0.18;
  if (mainMesh?.material) {
    mainMesh.material.emissiveIntensity = 0.12 + motorGlow;
    tagAnim(mainMesh, 'chassis-breathe', { base: mainMesh.material.emissiveIntensity, amp: 0.1 });
  }

  addRobotFace(group, finalDims, d, disposables);
  addPowerModules(group, d, finalDims, disposables);
  addCommsModules(group, d, finalDims, disposables);

  const dispose = () => {
    disposeObject(group);
    disposables.forEach((item) => {
      try { item?.dispose?.(); } catch { /* ignore */ }
    });
  };

  return { group, dispose, glowColor };
}
