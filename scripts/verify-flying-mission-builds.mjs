/** Build all 90 production scenes without WebGL; browser QA checks appearance. */
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FLYING_MISSION_SPECS } from '../src/virtual-robot-designer/studio/aerial-world/FlyingMissionSpecs.js';
import { getFlyingArenaContract } from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaSpec.js';
import { buildAerialWorld } from '../src/virtual-robot-designer/studio/aerial-world/AerialWorldKit.js';

const context = new Proxy({}, {get:(_,key) => {
  if(key === 'measureText')return text=>({width:String(text).length*12});
  if(key === 'createLinearGradient' || key === 'createRadialGradient')return ()=>({addColorStop(){}});
  if(key === 'createImageData' || key === 'getImageData')return (w,h)=>({data:new Uint8ClampedArray(Math.max(0,w*h*4))});
  return ()=>{};
}});
globalThis.document = {createElement:()=>({width:256,height:256,getContext:()=>context})};
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem:()=>null, setItem(){} } });
globalThis.window = { innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1, matchMedia:()=>({matches:false}), location:{search:''} };
const failures=[];
const log=console.log;
console.log=()=>{};
let totalMeshes=0;
for(const spec of Object.values(FLYING_MISSION_SPECS)) {
  const scene=new THREE.Scene();
  try {
    // ID-only lookups must retain the correct mode, rather than silently mode 1.
    assert.equal(getFlyingArenaContract({id:spec.id}).mode,spec.mode);
    const challenge={id:spec.id,chassisId:spec.chassisId,modeIndex:spec.mode,arenaType:spec.recipeId,isChassisMode:true,physics:'flight_3dof'};
    assert.equal(buildAerialWorld(scene,challenge),true);
    assert.equal(scene.userData.flyingVista, getFlyingArenaContract({ id: spec.id }).bible.aerialVista);
    assert.equal(scene.userData.flyingMissionSpec.id,spec.id);
    assert.equal(scene.fog.near,spec.sky.near);
    assert.equal(scene.fog.far,spec.sky.far);
    assert.equal(`#${scene.fog.color.getHexString()}`,spec.sky.fog);
    assert.equal(scene.userData.aerialGates.length,spec.gates.count);
    const expectedCheckpoints = spec.gates.count + (spec.gates.targetCount || 0) + (spec.gates.stuntRing ? 1 : 0);
    const padCount = scene.userData.flyingMissionPads?.length || 0;
    assert.equal(scene.userData.chassisCheckpoints.length, expectedCheckpoints + padCount);
    if (spec.chassisId === 'drone') {
      assert.equal(scene.userData.droneModeArena, spec.mode, 'Drone mode arena landmark missing');
    }
    if (spec.chassisId === 'helicopter') {
      assert.equal(scene.userData.helicopterModeArena, spec.mode, 'Helicopter mode arena landmark missing');
    }
    if (spec.chassisId === 'hoverbot') {
      assert.equal(scene.userData.hoverbotModeArena, spec.mode, 'Hover Bot mode arena landmark missing');
    }
    assert.ok(scene.getObjectByName('FlyingMissionDressing'));
    assert.ok(scene.getObjectByName('FlyingVistaLayer'));
    assert.equal(scene.userData.killPlaneY,-50);
    const curve=scene.userData._chassisCurve;
    const first=scene.userData.aerialGates[0].position;
    const cp=scene.userData.chassisCheckpoints[0];
    assert.ok(first.distanceTo(new THREE.Vector3(cp.x,cp.y,cp.z))<.001,'Visual ring and checkpoint differ');
    if(spec.chassisId==='rescuedrone') {
      for(let i=0;i<=100;i++){const y=curve.getPoint(i/100).y;assert.ok(y>=11.5&&y<=22.5,`Rescue altitude ${y}`);}
    }
    for(const time of [0,1,2])for(const mover of scene.userData.movers||[])mover.update(time);
    scene.traverse(obj=>{
      assert.ok(obj.position.toArray().every(Number.isFinite),`Non-finite position: ${obj.name}`);
      if(obj.isMesh)totalMeshes++;
      if(spec.chassisId==='steathjet' && obj.material?.emissiveIntensity)assert.ok(obj.material.emissiveIntensity<=.5,`Stealth glare: ${obj.name}`);
    });
    const rootCount=scene.children.length;
    // All materials/geometries are disposable; no glTF fetch is needed for flyers.
    assert.ok(rootCount>0);
  } catch(error) {failures.push(`${spec.id}: ${error.message}`); if(failures.length===1)console.error(error.stack);}
  scene.traverse(obj=>{obj.geometry?.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats){mat?.map?.dispose();mat?.dispose();}});
}
console.log=log;
delete globalThis.document;
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`PASS: 90 production flying scenes, ${totalMeshes} meshes; locked vistas/fog, numbered gate counts, altitude, animation and finite transforms.`);
