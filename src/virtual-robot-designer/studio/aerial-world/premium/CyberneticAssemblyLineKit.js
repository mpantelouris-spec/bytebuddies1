/**
 * CyberneticAssemblyLineKit — art-directed vista #3 (Hover Bot).
 * Hero: overhead gantry crane + weld spark field + triple conveyor lanes.
 */
import * as THREE from 'three';
import { add, geo, mat, instancedMesh, hazardStripes, sparkPoints } from '../PremiumEnvironmentHelpers.js';

export function installCyberneticAssemblyLighting(scene, root) {
  if (!scene || scene.getObjectByName('AssemblyVistaLights')) return;
  const rig = new THREE.Group();
  rig.name = 'AssemblyVistaLights';
  const overhead = new THREE.DirectionalLight(0x67e8f9, 0.12);
  overhead.position.set(0, 40, -20);
  rig.add(overhead);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('WeldArc')) return;
    const pl = new THREE.PointLight(0xf97316, 0.45, 18, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
  scene.add(rig);
}

export function buildCyberneticAssemblyLine(g, backdrop, y) {
  const floor = backdrop.at(0, -45);
  const root = new THREE.Group();
  root.name = 'CyberneticAssemblyLine';
  g.add(root);

  // Layer 0: factory floor + hazard runway
  add(root, geo.plane(360, 120, 16, 6), mat('asphalt'), floor.x, y - 1, floor.z, 'FactoryFloor', { rotX: -Math.PI / 2 });
  hazardStripes(root, floor.x, y - 0.92, floor.z + 48, 320, 4, 'AssemblyHazard');

  // Layer 1: foreground framing debris (flight-path edges)
  const debrisGeo = new THREE.BoxGeometry(0.45, 0.28, 0.38);
  instancedMesh(root, debrisGeo, mat('rust'), 420, (dummy, i) => {
    const lane = i % 3;
    const side = lane === 1 ? 0 : (lane === 0 ? -1 : 1);
    const p = backdrop.at(side * (38 + (i % 5)), -20 - Math.floor(i / 12) * 8);
    dummy.position.set(p.x + (Math.random() - 0.5) * 6, y + Math.random() * 8, p.z + (Math.random() - 0.5) * 4);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.setScalar(0.6 + Math.random() * 1.4);
  }, 'AssemblyDebrisInstanced');

  // Layer 2: triple conveyor lanes (hero midground)
  for (let lane = 0; lane < 3; lane++) {
    const lx = (lane - 1) * 28;
    for (let s = 0; s < 5; s++) {
      const p = backdrop.at(lx, -40 - s * 22);
      add(root, geo.box(22, 1.2, 3.2), mat('painted_steel'), p.x, y + 2, p.z, `Conveyor${lane}_${s}`);
      for (let r = 0; r < 6; r++) {
        add(root, geo.cylinder(0.35, 0.35, 3.2, 8), mat('dark_steel'), p.x - 10 + r * 3.8, y + 1.2, p.z, `Roller${lane}_${s}_${r}`);
      }
      add(root, geo.cylinder(0.85, 0.85, 2.2, 10), mat('dark_steel'), p.x - 9, y + 3.4, p.z, `RobotArmBase${lane}_${s}`);
      add(root, geo.box(7, 0.38, 0.38), mat('helipad_yellow'), p.x - 5, y + 5.8, p.z, `RobotArm${lane}_${s}`);
      add(root, geo.box(2.2, 0.28, 0.28), mat('rust'), p.x - 2, y + 6.6, p.z, `RobotGripper${lane}_${s}`);
      if (s % 2 === 0) {
        add(root, geo.sphere(0.35, 8, 6), mat(0xf97316, { emissive: 0xf97316, emi: 0.85 }), p.x - 3, y + 7.2, p.z, `WeldArc${lane}_${s}`);
      }
    }
  }

  // Layer 3: hero gantry crane spanning lanes
  const gantry = backdrop.at(0, -30);
  add(root, geo.box(280, 1.2, 2.5), mat('painted_steel', { metalness: 0.75 }), gantry.x, y + 16, gantry.z, 'GantryBeam');
  add(root, geo.box(3.5, 16, 3.5), mat('dark_steel'), gantry.x - 130, y + 8, gantry.z, 'GantryTowerL');
  add(root, geo.box(3.5, 16, 3.5), mat('dark_steel'), gantry.x + 130, y + 8, gantry.z, 'GantryTowerR');
  add(root, geo.box(8, 1.5, 4), mat('helipad_yellow'), gantry.x, y + 14, gantry.z, 'GantryCrane');
  add(root, geo.box(2.5, 6, 2.5), mat('dark_steel'), gantry.x, y + 10, gantry.z + 6, 'GantryHook');

  // Layer 4: background pipe runs + atmospheric haze
  for (let pipe = 0; pipe < 6; pipe++) {
    const pp = backdrop.at(-70 + pipe * 28, -55);
    add(root, geo.cylinder(0.45, 0.45, 42, 10), mat('painted_steel'), pp.x, y + 12, pp.z, `PipeRun${pipe}`);
    add(root, geo.cylinder(0.55, 0.55, 0.8, 10), mat('rust'), pp.x, y + 8, pp.z, `PipeFlange${pipe}`);
  }
  const haze = add(root, geo.plane(340, 80), mat(0x334155, { transparent: true, opacity: 0.18 }), floor.x, y + 14, floor.z - 40, 'FactoryHaze', { rotX: -Math.PI / 2 });
  haze.material.depthWrite = false;

  const sparkRoot = new THREE.Group();
  sparkRoot.position.set(floor.x, 0, floor.z);
  root.add(sparkRoot);
  sparkPoints(sparkRoot, 800, { x: 300, y: 18, z: 110 }, y + 2, 'AssemblySparkField');

  root.userData.premiumEnvironment = 'cybernetic_assembly_line';
  root.userData.artDirected = true;
  return root;
}
