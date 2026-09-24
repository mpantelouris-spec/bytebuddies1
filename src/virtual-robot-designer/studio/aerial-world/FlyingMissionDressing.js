/** Authored mission props, separate from the chassis-locked distant vista. */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';
import { flyingMissionMat, flyingGeo } from './FlyingArenaMaterialKit.js';

export const FLYING_MISSION_FEATURES = {
  drone: ['tutorial_arch', 'altitude_band', 'dive_targets', 'drone_swarm', 'launch_flare', 'drop_pad', 'photo_columns', 'wind_tunnel', 'roll_cue', 'cloud_finale'],
  helicopter: ['cargo_hook', 'rig_landing', 'bucket_fire', 'snow_peak', 'rotor_wash', 'girders', 'tanker_ship', 'medevac', 'vehicle_winch', 'cargo_finale'],
  hoverbot: ['repulsor_pulse', 'plasma_bridge', 'magnet_rail', 'rotating_labs', 'height_ticks', 'lab_bridges', 'shield_dome', 'tunnel_boost', 'chasm', 'lab_finale'],
  jetplane: ['reference', 'deck_target', 'deck_landing', 'speed_burst', 'radar_sweep', 'jammer_dish', 'tanker_plane', 'carrier_tunnel', 'transport_escort', 'carrier_finale'],
  steathjet: ['night_stars', 'lit_windows', 'cold_corridor', 'ghost_formation', 'jamming_static', 'recon_columns', 'glide_slope', 'sniper_target', 'emp_pulse', 'stealth_finale'],
  aerobat: ['loop_apex', 'alternating_roll', 'knife_edge', 'smoke_rings', 'snip_ribbon', 'inverted_rings', 'hammerhead', 'fireworks', 'slalom_pylons', 'airshow_finale'],
  racedrone: ['tight_rings', 'pink_tunnel', 'drift_puffs', 'neon_crossing', 'dragon_tunnel', 'battery_pad', 'barrel_roll', 'ghost_drone', 'rooftop_skim', 'neon_finale'],
  hoverracer: ['plasma_start', 'plasma_straights', 'apex_recharge', 'three_recharges', 'sonic_wave', 'elimination_gate', 'warp_burst', 'inversion_strip', 'lead_racer', 'plasma_finale'],
  rescuedrone: ['survivors', 'medkit_pad', 'flood_water', 'thermal_columns', 'beacon_poles', 'lifelines', 'hurricane', 'searchlight', 'gas_cloud', 'rescue_finale'],
};

function material(color, opacity = 1, glow = .22) {
  return flyingMissionMat(color, opacity, glow);
}

export function installFlyingMissionDressing(scene, curve, contract) {
  if (!contract?.mission || scene.getObjectByName('FlyingMissionDressing')) return;
  const { chassisId, mode, mission, bible } = contract;
  const feature = FLYING_MISSION_FEATURES[chassisId]?.[mode - 1];
  const root = new THREE.Group();
  root.name = 'FlyingMissionDressing';
  root.userData = { missionId: mission.id, feature, description: mission.dressing, decorative: true };
  scene.add(root);
  const primary = bible.gateColors.primary, secondary = bible.gateColors.secondary;
  const at = (t, side = 0, dy = 0) => {
    const p = curve.getPoint(t), tan = curve.getTangent(t);
    return p.add(new THREE.Vector3(-tan.z * side, dy, tan.x * side));
  };
  const mesh = (name, geometry, color, p, opacity = 1, glow = .22) => {
    const obj = new THREE.Mesh(geometry, material(color, opacity, glow));
    obj.name = name; obj.position.copy(p); obj.castShadow = opacity === 1; obj.receiveShadow = true;
    root.add(obj); return obj;
  };
  const box = (name, p, size, color = primary, opacity = 1) => mesh(name, new THREE.BoxGeometry(...size), color, p, opacity);
  const ring = (name, t, radius = 4.5, color = primary, roll = 0, opacity = .65) => {
    const obj = mesh(name, flyingGeo.torus(radius, .14, 16, 48), color, at(t), opacity);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), curve.getTangent(t).normalize());
    obj.rotateZ(THREE.MathUtils.degToRad(roll)); return obj;
  };
  const label = (text, p, color = '#ffffff') => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 96;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#13233e'; ctx.fillRect(0,0,256,96);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 40px system-ui'; ctx.fillText(text,128,48,240);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));
    sprite.name = `MissionLabel:${text}`; sprite.position.copy(p); sprite.scale.set(3.4,1.25,1); root.add(sprite); return sprite;
  };
  const pad = (t, text = 'H', color = secondary, side = 7) => {
    const p = at(t,side,-4);
    const obj = mesh(`MissionPad:${text}`, flyingGeo.cylinder(3.5, 3.8, .55, 24), color, p);
    label(text,p.clone().add(new THREE.Vector3(0,1.5,0)));
    return obj;
  };
  const cable = (a,b,name='WinchCable',color=0xe2e8f0) => {
    const delta=b.clone().sub(a);
    const obj=mesh(name,new THREE.CylinderGeometry(.06,.06,delta.length(),6),color,a.clone().add(b).multiplyScalar(.5));
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return obj;
  };
  const pulse = obj => arenaMover(scene,time=>{obj.material.emissiveIntensity=.2+Math.sin(time*2)*.15;});
  const particles = (name,t,color=secondary,count=18) => {
    const center=at(t), positions=[];
    for(let i=0;i<count;i++)positions.push(Math.sin(i*2.4)*5,Math.cos(i*1.7)*4,(i%7)-3);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const obj=new THREE.Points(geometry,new THREE.PointsMaterial({color,size:.22,transparent:true,opacity:.6,depthWrite:false}));
    obj.position.copy(center);obj.name=name;root.add(obj);
    arenaMover(scene,time=>{obj.rotation.z=time*.15;obj.material.opacity=.25+(Math.sin(time*2)+1)*.2;});return obj;
  };
  const aircraft = (name,t,side=0,opacity=.3,drone=false) => {
    const group=new THREE.Group();group.name=name;group.position.copy(at(t,side));root.add(group);
    const add=(geo,color,p)=>{const o=new THREE.Mesh(geo,material(color,opacity));o.position.set(...p);group.add(o);};
    add(new THREE.CapsuleGeometry(.55,2.8,4,8),secondary,[0,0,0]);group.children[0].rotation.x=Math.PI/2;
    add(new THREE.BoxGeometry(drone ? 3.2 : 7,.16,drone ? .3 : 1.3),primary,[0,0,.3]);
    add(new THREE.BoxGeometry(2.5,.15,.7),primary,[0,.25,1.7]);
    if(drone) for(const x of [-1.5,1.5])for(const z of [-1,1])add(new THREE.TorusGeometry(.6,.07,4,16),secondary,[x,.15,z]);
    arenaMover(scene,time=>{group.position.y=at(t,side).y+Math.sin(time)*.4;});return group;
  };
  const columns = (prefix,color=primary) => [.25,.5,.75].forEach((t,i)=>{
    const p=at(t);const obj=mesh(`${prefix}${i+1}`,new THREE.CylinderGeometry(1.5,1.5,7,12),color,p,.16);pulse(obj);label(prefix==='Photo'?'ABC'[i]:prefix,p.clone().add(new THREE.Vector3(0,5,0)));
  });
  const tunnel = (color=primary,from=.15,to=.85) => {
    const pts=Array.from({length:25},(_,i)=>curve.getPoint(from+(to-from)*i/24));
    const obj=mesh('MissionTunnel',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,5,12,false),color,new THREE.Vector3(),.12);
    obj.material.side=THREE.DoubleSide;
    for(let i=0;i<5;i++)ring('TunnelHoop',from+(to-from)*i/4,5,color,0,.4);
  };
  const recharge = (t=.5,text='CHARGE') => {const obj=pad(t,text,0x22d3ee,0);pulse(obj);return obj;};
  const flood = () => box('FloodSurface',at(.5,0,-12),[110,.15,mission.layout.match(/· (\d+)m/)?.[1]*1||180],0x38bdf8,.55);
  const beacon = t => {const p=at(t,8,-4);box('BeaconPole',p,[.25,6,.25],0xfbbf24);pulse(mesh('BeaconLamp',new THREE.SphereGeometry(.55,8,8),0xfbbf24,p.clone().add(new THREE.Vector3(0,3,0))));};
  const target = (t=.7,text='TARGET') => {const obj=pad(t,text,0xef4444,0);ring('TargetApproach',t,4,0x22c55e);return obj;};
  const bullseye = (t, side = 0, drop = 8, radius = 4.5, name = 'DiveBullseye') => {
    const p = at(t, side, -drop);
    mesh(`${name}Outer`, new THREE.TorusGeometry(radius, 0.38, 10, 32), 0xef4444, p, 0.9, 0.55);
    const inner = mesh(`${name}Mid`, new THREE.TorusGeometry(radius * 0.62, 0.28, 8, 24), 0xffffff, p, 0.85, 0.15);
    inner.rotation.x = Math.PI / 2;
    mesh(`${name}Core`, new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, 0.25, 16), 0xfbbf24, p.clone().add(new THREE.Vector3(0, 0.15, 0)), 1, 0.45);
    return p;
  };
  const rollRing = (t, degrees = 45, color = primary) => {
    const obj = ring(`RollCueRing${degrees}`, t, 5.5, color, degrees, 0.72);
    obj.rotation.x = THREE.MathUtils.degToRad(degrees);
    return obj;
  };
  const cross = p => {box('MedicalCrossHorizontal',p,[1.8,.45,.3],0xffffff);box('MedicalCrossVertical',p,[.45,1.8,.3],0xffffff);};
  const cargo = (t=0) => {const p=at(t,0,-3);box('SuspendedCargo',p,[1.8,1.5,1.8],0xf97316);cable(at(t),p);};

  switch(feature) {
    case 'tutorial_arch': ring('TutorialCloudArch',.045,6,primary);label('START',at(.045,0,7));break;
    case 'altitude_band': box('AltitudeBand',at(.4),[10,6,24],0x22c55e,.08);label('24–30 m',at(.4,6,4));scene.userData.flyingRequiredAltitude=[24,30];break;
    case 'dive_targets':
      [0.38, 0.48, 0.58, 0.68].forEach((t, i) => bullseye(t, (i % 2 ? 1 : -1) * 6, 10 + (i % 2) * 4, 4.2 + (i % 2), `StormBullseye${i}`));
      label('DIVE · PULL UP', at(.45, 0, 6));
      break;
    case 'drone_swarm': for(let i=0;i<3;i++)aircraft(`PatrolDrone${i}`, .45+i*.02, (i-1)*8,.3,true);break;
    case 'launch_flare': particles('LaunchSparks',0,0xfbbf24);break;
    case 'drop_pad': target(.5,'DROP');break;
    case 'photo_columns': case 'recon_columns': columns('Photo',0x38bdf8);break;
    case 'wind_tunnel': tunnel(0x14b8a6);for(const t of [.3,.65]){const blade=box('TurbineBlades',at(t,8),[.35,8,.7],0xcbd5e1);arenaMover(scene,time=>blade.rotation.z=time*2);}break;
    case 'roll_cue':
      rollRing(.72, 45);
      label('ROLL 45°', at(.72, 0, 6));
      break;
    case 'barrel_roll':
      rollRing(.68, 60, secondary);
      label('ROLL 60°', at(.72, 0, 6));
      break;
    case 'cloud_finale': ring('CloudFinishArch',.9,7);particles('FinishSparkles',.9);break;
    case 'cargo_hook': cargo();label('AIRLIFT',at(.03,0,5));break;
    case 'rig_landing': pad(.45,'RIG 2',0xfbbf24);break;
    case 'bucket_fire': {const p=pad(.4,'WATER',0xef4444).position;mesh('RigFire',new THREE.ConeGeometry(1.6,4,8),0xf97316,p.clone().add(new THREE.Vector3(0,2,0)),.75);cargo();break;}
    case 'snow_peak': mesh('SnowCappedRig',new THREE.ConeGeometry(5,8,8),0xffffff,at(.6,12,-4));break;
    case 'rotor_wash': for(const t of [.2,.4,.6,.8])particles('RotorWash',t,0xe0f2fe);break;
    case 'girders': for(const t of [.25,.5,.75]){const p=pad(t,'STEEL',0x64748b).position;box('SteelGirder',p.clone().add(new THREE.Vector3(0,1,0)),[6,.6,.8],0x94a3b8);}break;
    case 'tanker_ship': {const p=at(.5,10,-16);box('TankerHull',p,[8,2,22],0x334155);box('TankerBridge',p.clone().add(new THREE.Vector3(0,3,7)),[5,5,4],0xf8fafc);break;}
    case 'medevac': {const p=pad(.5,'RESCUE',0xdc2626).position;cross(p.clone().add(new THREE.Vector3(0,2,0)));beacon(.5);break;}
    case 'vehicle_winch': {const p=at(.65,0,-9);box('RecoveryVehicle',p,[2,1.3,3.6],0xfbbf24);cable(at(.65),p);break;}
    case 'cargo_finale': cargo(.9);pad(.6,'MEDEVAC',0x22c55e);break;
    case 'repulsor_pulse': pulse(ring('RepulsorPulse',.15,5));break;
    case 'plasma_bridge': case 'lab_bridges': for(const t of [.25,.5,.75]){pad(t,'LAB',primary);box('PlasmaBridge',at(t,4,-4),[8,.2,2],0x22d3ee,.65);}break;
    case 'magnet_rail': case 'inversion_strip': {const pts=[at(.25,0,-3),at(.45,0,-3),at(.65,0,-3)];for(let i=0;i<2;i++)cable(pts[i],pts[i+1],'MagneticRail',0x22d3ee);if(feature==='inversion_strip')label('FLIP 180°',at(.6,0,5));break;}
    case 'rotating_labs': for(const t of [.2,.45,.7]){const obj=pad(t,'ZERO G',primary);arenaMover(scene,time=>obj.rotation.y=time*.2);}break;
    case 'height_ticks': for(let i=0;i<6;i++){box('HeightTick',at(.15,7,i*2-5),[2,.12,.2],secondary);}label('HEIGHT',at(.15,7,8));break;
    case 'shield_dome': mesh('EnergyShield',new THREE.SphereGeometry(4.5,20,12),0x22d3ee,at(.4),.13);break;
    case 'tunnel_boost': tunnel(secondary);recharge(.5,'BOOST');break;
    case 'chasm': box('Chasm',at(.6,0,-17),[40,.2,55],0x080b18);pad(.45,'A');pad(.8,'B');break;
    case 'lab_finale': tunnel(primary,.5,.75);pad(.35,'LAB');break;
    case 'reference': ring('AceTrainingRing', .12, 6, primary);label('ACE TRAINING',at(.12,0,7));particles('GoldSparks',.12,0xfbbf24,12);break;
    case 'deck_target': target(.55);break;
    case 'deck_landing': pad(.45,'TOUCH DOWN',0xf8fafc,0);break;
    case 'speed_burst': particles('SpeedLines',.72,0xffffff,30);break;
    case 'radar_sweep': {const obj=mesh('RadarSweep',new THREE.ConeGeometry(8,16,16,1,true),0x22c55e,at(.55,8,-6),.09);arenaMover(scene,time=>obj.rotation.z=Math.sin(time)*.6);break;}
    case 'jammer_dish': {const p=pad(.5,'JAMMER').position;const dish=mesh('JammerDish',new THREE.SphereGeometry(2,12,8,0,Math.PI*2,0,Math.PI/2),0x94a3b8,p.clone().add(new THREE.Vector3(0,2,0)));dish.rotation.x=Math.PI/3;break;}
    case 'tanker_plane': aircraft('RefuelTanker',.45,9,.8);label('REFUEL',at(.45,9,5));break;
    case 'carrier_tunnel': tunnel(0x38bdf8);for(const side of [-8,8])box('CarrierTower',at(.4,side,-5),[3,18,4],0x64748b);break;
    case 'transport_escort': aircraft('TransportEscort',.65,0,.8);break;
    case 'carrier_finale': label('TOP GUN',at(.9,0,7));particles('GoldFinish',.9,0xfbbf24);break;
    case 'night_stars': case 'stealth_finale': particles('StealthStars',.5,0x94a3b8,24);break;
    case 'lit_windows': for(let i=0;i<6;i++)box('LitWindow',at(.2+i*.1,18,-6),[1,2,.1],0xfbbf24);break;
    case 'cold_corridor': box('ColdCorridor',at(.5),[10,8,35],0x38bdf8,.06);break;
    case 'ghost_formation': aircraft('GhostWingLeft',.45,-20,.25);aircraft('GhostWingRight',.45,20,.25);break;
    case 'jamming_static': for(const t of [.4,.5,.6])particles('JammerStatic',t,0x94a3b8);break;
    case 'glide_slope':
      for (const t of [.25, .5, .75]) {
        ring('GlideGuide', t, 5.5, 0x64748b, 0, 0.22);
        box(`GlidePylon${t}`, at(t, 12, -2), [0.5, 10, 0.5], 0x64748b);
      }
      label('GLIDE 3°', at(.45, 0, 5));
      break;
    case 'sniper_target': target(.92);break;
    case 'emp_pulse': case 'sonic_wave': {const obj=ring('Shockwave',feature==='emp_pulse'?.72:.8,5,secondary);arenaMover(scene,time=>{obj.scale.setScalar(1+(time%2)*.5);obj.material.opacity=.5*(1-(time%2)/2);});break;}
    case 'loop_apex': ring('LoopApex',.35,6);break;
    case 'alternating_roll':
      rollRing(.25, -35, 0x38bdf8);
      rollRing(.55, 35, 0xf97316);
      label('ROLL LEFT / RIGHT', at(.1, 0, 6));
      break;
    case 'knife_edge': {const obj=ring('KnifeEdgeGate',.45,5,primary,90);obj.scale.x=.55;break;}
    case 'smoke_rings': for(const t of [.3,.5,.7])ring('SmokeRing',t,5,0xffffff,0,.35);break;
    case 'snip_ribbon': box('SnipRibbon',at(.5),[9,.6,.08],0xfb923c);break;
    case 'inverted_rings':
      rollRing(.35, 180, 0xf97316);
      rollRing(.65, 180, 0x38bdf8);
      label('INVERTED', at(.5, 0, -5));
      break;
    case 'hammerhead': {const obj=ring('VerticalClimbRing',.35,5);obj.rotation.x=Math.PI/2;label('CLIMB',at(.35,0,7));break;}
    case 'fireworks': for(const t of [.2,.5,.8])particles('Fireworks',t,0xfbbf24,30);break;
    case 'slalom_pylons': for(let i=0;i<6;i++){const p=at(.15+i*.12,i%2?7:-7,-3);mesh('SlalomPylon',new THREE.CylinderGeometry(.4,.8,10,8),i%2?0xffffff:0xef4444,p);}break;
    case 'airshow_finale': for(const t of [.3,.6,.85])ring('FinalSmokeRing',t,5,0xffffff,0,.35);label('AIRSHOW',at(.9,0,7));break;
    case 'tight_rings':
      for (let i = 0; i < 3; i++) {
        const t = 0.2 + i * 0.18;
        const p = at(t, (i % 2 ? 1 : -1) * 5, 0);
        box(`FpvGatePostL${i}`, p.clone().add(new THREE.Vector3(-3.5, 2.5, 0)), [0.35, 5, 0.35], primary);
        box(`FpvGatePostR${i}`, p.clone().add(new THREE.Vector3(3.5, 2.5, 0)), [0.35, 5, 0.35], primary);
        box(`FpvGateTop${i}`, p.clone().add(new THREE.Vector3(0, 5.2, 0)), [7.2, 0.35, 0.35], secondary, 0.85);
      }
      label('FPV', at(.08, 0, 6));
      break;
    case 'pink_tunnel': if(!scene.getObjectByName('FlyingWarpTunnel'))tunnel(0xec4899,0,1);break;
    case 'drift_puffs': for(const t of [.25,.65])particles('DriftPuffs',t,0xcbd5e1);break;
    case 'neon_crossing': ring('NeonCrossing',.5,6,secondary);break;
    case 'dragon_tunnel': tunnel(0xa855f7,.35,.7);break;
    case 'battery_pad': recharge(.5);break;
    case 'ghost_drone': aircraft('GhostReplay',.45,0,.3,true);break;
    case 'rooftop_skim': for(const t of [.2,.45,.7])pad(t,'SKIM',secondary,0);break;
    case 'neon_finale': tunnel(primary,.4,.75);break;
    case 'plasma_start': case 'plasma_straights': box('PlasmaUnderlay',at(.3,0,-4),[5,.1,18],secondary,.45);break;
    case 'apex_recharge': recharge(.3);recharge(.7);break;
    case 'three_recharges': for(const t of [.25,.5,.75])recharge(t);break;
    case 'elimination_gate': {const obj=box('EliminationBarrier',at(.75),[8,.5,.25],0xef4444,.7);arenaMover(scene,time=>{obj.position.y=at(.75).y+Math.sin(time*.7)*4;});label('HURRY',at(.75,0,6));break;}
    case 'warp_burst': tunnel(primary,.4,.6);break;
    case 'lead_racer': aircraft('LeadHoverRacer',.5,0,.6,true);break;
    case 'plasma_finale': tunnel(primary,.5,.8);ring('PlasmaCathedral',.9,7,secondary);break;
    case 'survivors': for(const t of [.2,.45,.7]){pad(t,'RESCUE',0x22c55e);beacon(t);}break;
    case 'medkit_pad': {const p=pad(.4,'MEDKIT',0x22c55e).position;cross(p.clone().add(new THREE.Vector3(0,2,0)));break;}
    case 'flood_water': flood();break;
    case 'thermal_columns': columns('HEAT',0xf97316);break;
    case 'beacon_poles': for(const t of [.2,.5,.8])beacon(t);break;
    case 'lifelines': for(const t of [.25,.5,.75]){const p=pad(t,'LIFELINE',0xf97316).position;cable(p,p.clone().add(new THREE.Vector3(3,-10,0)),'RescueRope',0xfbbf24);}break;
    case 'hurricane': for(let i=0;i<4;i++)ring('HurricaneWind',.4+i*.05,6+i,0x64748b,0,.12);break;
    case 'searchlight': {const obj=mesh('SearchlightCone',new THREE.ConeGeometry(5,14,16,1,true),0xfff3c4,at(.5,6,-5),.12);arenaMover(scene,time=>obj.rotation.z=Math.sin(time*.7)*.5);break;}
    case 'gas_cloud': mesh('HazardGas',new THREE.SphereGeometry(5,16,12),0x84cc16,at(.65,6),.18);break;
    case 'rescue_finale': flood();beacon(.3);beacon(.7);pad(.8,'RESCUED',0x22c55e);break;
    default: throw new Error(`Missing flying mission feature: ${mission.id}`);
  }
  scene.userData.flyingMissionSpec=mission;
  scene.userData.flyingMissionFeature=feature;
  return root;
}
