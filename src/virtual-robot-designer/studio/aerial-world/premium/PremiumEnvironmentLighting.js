/**
 * Per-vista lighting rigs for premium flying environments 5–10.
 * (Neon necropolis lighting lives in NeonServerNecropolisKit.js)
 */
import * as THREE from 'three';

function addRig(scene, name) {
  if (scene.getObjectByName(name)) return null;
  const rig = new THREE.Group();
  rig.name = name;
  scene.add(rig);
  return rig;
}

export function installMonasticRuinsLighting(scene, root) {
  const rig = addRig(scene, 'MonasticVistaLights');
  if (!rig) return;
  const sun = new THREE.DirectionalLight(0xfbbf24, 0.2);
  sun.position.set(50, 60, -30);
  rig.add(sun);
  const mist = new THREE.AmbientLight(0x78716c, 0.06);
  rig.add(mist);
}

export function installObsidianCitadelLighting(scene, root) {
  const rig = addRig(scene, 'ObsidianVistaLights');
  if (!rig) return;
  const rim = new THREE.DirectionalLight(0x818cf8, 0.14);
  rim.position.set(0, 40, 60);
  rig.add(rim);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('LightningRod')) return;
    const pl = new THREE.PointLight(0xa78bfa, 0.35, 24, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
}

export function installQuantumReactorLighting(scene, root) {
  const rig = addRig(scene, 'QuantumVistaLights');
  if (!rig) return;
  const core = root.getObjectByName('CorePlasma');
  if (core) {
    const pl = new THREE.PointLight(0x22d3ee, 0.55, 48, 2);
    pl.position.copy(core.position);
    rig.add(pl);
  }
  const cool = new THREE.DirectionalLight(0x67e8f9, 0.1);
  cool.position.set(-20, 30, 10);
  rig.add(cool);
}

export function installBioluminescentTrenchLighting(scene, root) {
  const rig = addRig(scene, 'BioVistaLights');
  if (!rig) return;
  const deep = new THREE.AmbientLight(0x0c4a6e, 0.08);
  rig.add(deep);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('BioOrb')) return;
    const pl = new THREE.PointLight(0x22d3ee, 0.22, 14, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
}

export function installVictorianLibraryLighting(scene, root) {
  const rig = addRig(scene, 'LibraryVistaLights');
  if (!rig) return;
  const warm = new THREE.DirectionalLight(0xfbbf24, 0.12);
  warm.position.set(20, 25, 30);
  rig.add(warm);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('ChandelierBulb') && !obj.name?.startsWith('TableLamp')) return;
    const pl = new THREE.PointLight(0xfff3c4, 0.28, 16, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
}

export function installLowOrbitCarrierLighting(scene, root) {
  const rig = addRig(scene, 'CarrierVistaLights');
  if (!rig) return;
  const sun = new THREE.DirectionalLight(0xffffff, 0.25);
  sun.position.set(80, 120, 40);
  rig.add(sun);
  const earthGlow = new THREE.DirectionalLight(0x3b82f6, 0.08);
  earthGlow.position.set(-60, -40, 80);
  rig.add(earthGlow);
}
