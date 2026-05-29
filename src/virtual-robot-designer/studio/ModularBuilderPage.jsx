/**
 * ModularBuilderPage.jsx
 * Professional "Build Your Own Robot" modular builder.
 * Dark industrial aesthetic · Three.js workshop viewport · Live stats
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// ─── Shared geometry ────────────────────────────────────────────────────────
const _BOX  = new THREE.BoxGeometry(1, 1, 1);
const _CYL  = new THREE.CylinderGeometry(1, 1, 1, 16);
const _SPH  = new THREE.SphereGeometry(1, 12, 8);
const _TOR  = new THREE.TorusGeometry(1, 0.3, 8, 32);
const _CONE = new THREE.ConeGeometry(1, 1, 12);

function m3(color, met = 0.5, rou = 0.5, em = null, ei = 0.8) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: met, roughness: rou });
  if (em) { mat.emissive = new THREE.Color(em); mat.emissiveIntensity = ei; }
  return mat;
}
function bx(w, h, d, c, met = 0.5, rou = 0.5) {
  const mesh = new THREE.Mesh(_BOX, m3(c, met, rou));
  mesh.scale.set(w, h, d); mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function cy(r, h, c, met = 0.6, rou = 0.4) {
  const mesh = new THREE.Mesh(_CYL, m3(c, met, rou));
  mesh.scale.set(r, h, r); mesh.castShadow = true;
  return mesh;
}

// ─── Parts Catalog ──────────────────────────────────────────────────────────
export const PARTS_CATALOG = [
  {
    id: 'bodies', label: 'ROBOT BODIES', icon: '🤖',
    parts: [
      { id:'body-spider',    name:'Spider Body',      emoji:'🕷️', color:'#374151', weight:25, pw:50, dur:60, spd:70, agi:80, int:0, bat:0, slots:6,  desc:'6-legged climber. Wall traversal, rough terrain, agile navigation.' },
      { id:'body-drone',     name:'Drone Body',       emoji:'🚁', color:'#9CA3AF', weight:12, pw:60, dur:40, spd:90, agi:85, int:0, bat:0, slots:4,  desc:'Quadcopter aerial frame. Fast, agile, aerial reconnaissance.' },
      { id:'body-plane',     name:'Plane Body',       emoji:'✈️', color:'#6B7280', weight:35, pw:80, dur:50, spd:95, agi:60, int:0, bat:0, slots:5,  desc:'Fixed-wing fuselage. Long-distance flight, maximum speed.' },
      { id:'body-humanoid',  name:'Humanoid Torso',   emoji:'🦾', color:'#E5E7EB', weight:30, pw:60, dur:60, spd:50, agi:60, int:0, bat:0, slots:8,  desc:'Bipedal robot. Manipulation, stairs, human environments.' },
      { id:'body-tracked',   name:'Tracked Body',     emoji:'🪖', color:'#4B5563', weight:45, pw:80, dur:90, spd:30, agi:40, int:0, bat:0, slots:8,  desc:'Heavy tank chassis. Max durability, heavy load carrying.' },
      { id:'body-hover',     name:'Hover Body',       emoji:'🛸', color:'#06B6D4', weight:18, pw:70, dur:45, spd:85, agi:90, int:0, bat:0, slots:6,  desc:'Anti-gravity pod. Frictionless movement, any terrain.' },
      { id:'body-underwater',name:'Underwater Body',  emoji:'🤿', color:'#1D4ED8', weight:32, pw:65, dur:75, spd:50, agi:55, int:0, bat:0, slots:6,  desc:'Submarine hull. Pressure-resistant, sonar navigation.' },
      { id:'body-arm',       name:'Robot Arm Base',   emoji:'🦿', color:'#374151', weight:60, pw:100,dur:85, spd:20, agi:75, int:0, bat:0, slots:4,  desc:'Fixed-mount 6-axis arm. Precision manipulation, industrial tasks.' },
    ],
  },
  {
    id: 'wheels', label: 'WHEELS', icon: '🛞',
    parts: [
      { id:'wheel-rubber',    name:'Rubber Tire',      emoji:'⭕', color:'#1a1a1a', weight:3,   pw:2,  dur:10, spd:75, agi:5,  int:0, bat:0, slots:1, desc:'Standard rubber tire. Good traction on smooth surfaces and roads.' },
      { id:'wheel-monster',   name:'Monster Truck',    emoji:'🔵', color:'#2a2a2a', weight:6,   pw:5,  dur:25, spd:50, agi:-5, int:0, bat:0, slots:1, desc:'Large aggressive off-road tire. Mud, sand, rough terrain.' },
      { id:'wheel-racing',    name:'Racing Wheel',     emoji:'⚫', color:'#111827', weight:2,   pw:0,  dur:5,  spd:95, agi:10, int:0, bat:0, slots:1, desc:'Slick racing tire. Maximum speed on smooth surfaces.' },
      { id:'wheel-allterrain',name:'All-Terrain',      emoji:'🟤', color:'#3D2B1F', weight:4,   pw:3,  dur:15, spd:65, agi:5,  int:0, bat:0, slots:1, desc:'Balanced all-terrain tire. Mixed surfaces, outdoor exploration.' },
      { id:'wheel-micro',     name:'Micro Wheel',      emoji:'🔘', color:'#6B7280', weight:0.5, pw:0,  dur:5,  spd:70, agi:8,  int:0, bat:0, slots:1, desc:'Tiny precision wheel. Compact robots, tight spaces.' },
      { id:'wheel-magnetic',  name:'Magnetic Wheel',   emoji:'🔷', color:'#1E3A8A', weight:4,   pw:15, dur:20, spd:50, agi:0,  int:0, bat:0, slots:1, desc:'EM wheel. Perfect grip on metal surfaces only.' },
    ],
  },
  {
    id: 'legs', label: 'LEGS', icon: '🦿',
    parts: [
      { id:'leg-spider',   name:'Spider Leg',        emoji:'🕸️', color:'#374151', weight:5,  pw:5,  dur:15, spd:70, agi:10, int:0, bat:0, slots:1, desc:'3-joint articulated leg with claw foot. Wall climbing, rough terrain.' },
      { id:'leg-humanoid', name:'Humanoid Leg',      emoji:'🦵', color:'#D1D5DB', weight:8,  pw:8,  dur:20, spd:60, agi:8,  int:0, bat:0, slots:1, desc:'Bipedal leg with knee joint. Stairs, human environments.' },
      { id:'leg-stalker',  name:'Stalker Leg',       emoji:'🦶', color:'#4B5563', weight:4,  pw:6,  dur:10, spd:75, agi:12, int:0, bat:0, slots:1, desc:'Long multi-jointed leg. Obstacle courses, precise stepping.' },
      { id:'leg-stubby',   name:'Stubby Leg',        emoji:'🔩', color:'#6B7280', weight:10, pw:3,  dur:40, spd:40, agi:-5, int:0, bat:0, slots:1, desc:'Short thick leg. Maximum stability, heavy loads.' },
      { id:'leg-treading', name:'Treading Foot',     emoji:'👟', color:'#374151', weight:2,  pw:0,  dur:10, spd:55, agi:5,  int:0, bat:0, slots:1, desc:'Wide flat foot with tread. Stability, smooth surface movement.' },
      { id:'leg-claw',     name:'Gripping Claw Leg', emoji:'🦞', color:'#B91C1C', weight:7,  pw:10, dur:25, spd:50, agi:15, int:0, bat:0, slots:1, desc:'Leg with integrated gripping claw. Manipulation while moving.' },
    ],
  },
  {
    id: 'arms', label: 'ARMS & TOOLS', icon: '🦾',
    parts: [
      { id:'arm-grabber', name:'Grabber Arm',     emoji:'✊', color:'#FF8C00', weight:8,  pw:15, dur:15, spd:0, agi:0, int:0, bat:0, slots:2, desc:'3-joint arm with 2-finger gripper. 1.2m reach, object manipulation.' },
      { id:'arm-extend',  name:'Extending Arm',   emoji:'🦾', color:'#EC4899', weight:10, pw:25, dur:15, spd:0, agi:0, int:0, bat:0, slots:2, desc:'Telescoping 3-stage arm. Extended range, up to 2m reach.' },
      { id:'tool-drill',  name:'Drill',           emoji:'🔩', color:'#888888', weight:5,  pw:30, dur:20, spd:0, agi:0, int:0, bat:0, slots:1, desc:'Motorized drill bit. Boring through materials, penetration tasks.' },
      { id:'tool-laser',  name:'Laser Module',    emoji:'⚡', color:'#FF00FF', weight:3,  pw:25, dur:10, spd:0, agi:0, int:5, bat:0, slots:1, desc:'High-power laser cutter. 50m range, ±1mm precision.' },
      { id:'tool-magnet', name:'Magnetic Gripper',emoji:'🧲', color:'#818CF8', weight:4,  pw:20, dur:15, spd:0, agi:0, int:0, bat:0, slots:1, desc:'EM gripper. Holds ferrous metal objects without mechanical contact.' },
    ],
  },
  {
    id: 'sensors', label: 'SENSORS', icon: '📡',
    parts: [
      { id:'sensor-cam',     name:'Camera Module',  emoji:'📷', color:'#1E90FF', weight:1,   pw:5,  dur:5,  spd:0, agi:5,  int:15, bat:0, slots:1, desc:'HD vision camera. Object recognition, 30m range, 1080p.' },
      { id:'sensor-ultra',   name:'Ultrasonic',      emoji:'📡', color:'#00D9FF', weight:0.5, pw:3,  dur:5,  spd:0, agi:5,  int:10, bat:0, slots:1, desc:'Sound-wave proximity sensor. 4m range, works in darkness.' },
      { id:'sensor-lidar',   name:'LIDAR Scanner',   emoji:'🔴', color:'#FF3333', weight:3,   pw:15, dur:15, spd:0, agi:10, int:25, bat:0, slots:1, desc:'360° laser mapping. 50m range, ±2cm accuracy, creates 3D map.' },
      { id:'sensor-thermal', name:'Thermal Camera',  emoji:'🌡️', color:'#F97316', weight:1.5, pw:8,  dur:5,  spd:0, agi:0,  int:12, bat:0, slots:1, desc:'Heat detection camera. 20m range, ±2°C accuracy.' },
      { id:'sensor-gyro',    name:'Gyroscope',       emoji:'🔄', color:'#00C851', weight:0.3, pw:2,  dur:5,  spd:0, agi:20, int:8,  bat:0, slots:1, desc:'Balance and orientation sensor. Stability control.' },
      { id:'sensor-compass', name:'Compass',         emoji:'🧭', color:'#6366F1', weight:0.2, pw:1,  dur:5,  spd:0, agi:5,  int:8,  bat:0, slots:1, desc:'Magnetic navigation. Direction and heading tracking.' },
    ],
  },
  {
    id: 'power', label: 'POWER', icon: '🔋',
    parts: [
      { id:'bat-small',  name:'Battery Pack (S)', emoji:'🔋', color:'#059669', weight:3,  pw:0,   dur:0, spd:0, agi:0, int:0,  bat:20,  slots:1, desc:'50Wh compact battery. 2-hour runtime, lightweight.' },
      { id:'bat-medium', name:'Battery Pack (M)', emoji:'🔋', color:'#047857', weight:6,  pw:0,   dur:0, spd:0, agi:0, int:0,  bat:50,  slots:2, desc:'150Wh standard battery. 5-hour runtime, balanced.' },
      { id:'bat-large',  name:'Battery Pack (L)', emoji:'🔋', color:'#065F46', weight:12, pw:0,   dur:0, spd:0, agi:0, int:0,  bat:80,  slots:3, desc:'300Wh high-capacity. 12-hour runtime, heavy.' },
      { id:'solar',      name:'Solar Panel',      emoji:'☀️', color:'#1D4ED8', weight:2,  pw:-20, dur:0, spd:0, agi:0, int:0,  bat:30,  slots:2, desc:'10W solar charging. Outdoor renewable power generation.' },
      { id:'fusion',     name:'Fusion Core',      emoji:'🌟', color:'#FDE68A', weight:10, pw:-50, dur:0, spd:0, agi:0, int:10, bat:100, slots:4, desc:'Advanced fusion energy. Unlimited runtime, powers anything.' },
    ],
  },
  {
    id: 'ai', label: 'AI SYSTEMS', icon: '🧠',
    parts: [
      { id:'ai-brain',  name:'AI Brain',          emoji:'🧠', color:'#7C3AED', weight:1,   pw:20, dur:0, spd:0, agi:0, int:30, bat:0, slots:2, desc:'Standard AI unit. Basic autonomy and decision making.' },
      { id:'ai-neural', name:'Neural Processor',  emoji:'💻', color:'#4F46E5', weight:2,   pw:30, dur:0, spd:0, agi:0, int:50, bat:0, slots:2, desc:'Deep learning chip. Advanced pattern recognition.' },
      { id:'ai-logic',  name:'Logic Controller',  emoji:'🖥️', color:'#6366F1', weight:0.5, pw:10, dur:0, spd:0, agi:0, int:20, bat:0, slots:1, desc:'Rule-based logic. Reliable, low-power control system.' },
      { id:'ai-auto',   name:'Autonomous Module', emoji:'⚛️', color:'#EC4899', weight:3,   pw:40, dur:0, spd:0, agi:5, int:70, bat:0, slots:3, desc:'Full autonomy. Self-navigating, mission-completing AI.' },
    ],
  },
  {
    id: 'comm', label: 'COMMUNICATIONS', icon: '📶',
    parts: [
      { id:'comm-wifi',  name:'WiFi Module',    emoji:'📶', color:'#10B981', weight:0.2, pw:5,  dur:5,  spd:0, agi:0, int:5,  bat:0, slots:1, desc:'WiFi 6 networking. High-speed local area connection.' },
      { id:'comm-radio', name:'Radio Antenna',  emoji:'📻', color:'#F59E0B', weight:0.5, pw:8,  dur:10, spd:0, agi:0, int:5,  bat:0, slots:1, desc:'Long-range radio. 1km range, penetrates obstacles.' },
      { id:'comm-bt',    name:'Bluetooth',      emoji:'🔵', color:'#3B82F6', weight:0.1, pw:3,  dur:5,  spd:0, agi:0, int:3,  bat:0, slots:1, desc:'Short-range Bluetooth. Low-power device pairing.' },
      { id:'comm-sat',   name:'Satellite Link', emoji:'🛰️', color:'#8B5CF6', weight:1,   pw:20, dur:10, spd:0, agi:0, int:10, bat:0, slots:2, desc:'Satellite comms. Global range, anywhere on Earth.' },
    ],
  },
  {
    id: 'structure', label: 'ARMOR & STRUCTURE', icon: '🛡️',
    parts: [
      { id:'struct-armor',  name:'Armor Plating',    emoji:'🛡️', color:'#374151', weight:8, pw:0,  dur:30, spd:-5, agi:-5, int:0, bat:0, slots:0, desc:'Heavy armor plating. Significant durability increase.' },
      { id:'struct-light',  name:'Support Frame',    emoji:'🔩', color:'#9CA3AF', weight:2, pw:0,  dur:10, spd:5,  agi:5,  int:0, bat:0, slots:2, desc:'Lightweight structural frame. Adds mounting slots.' },
      { id:'struct-shield', name:'Energy Shield',    emoji:'⚡', color:'#06B6D4', weight:3, pw:30, dur:40, spd:0,  agi:0,  int:0, bat:0, slots:2, desc:'Active energy shield. High protection, high power cost.' },
    ],
  },
  {
    id: 'lighting', label: 'LIGHTING', icon: '💡',
    parts: [
      { id:'light-led',  name:'LED Array',   emoji:'💡', color:'#FCD34D', weight:0.2, pw:3, dur:5, spd:0, agi:0, int:5, bat:0, slots:1, desc:'Multi-color LED array. Illumination and visual signaling.' },
      { id:'light-spot', name:'Spotlight',   emoji:'🔦', color:'#F9FAFB', weight:0.3, pw:8, dur:5, spd:0, agi:0, int:3, bat:0, slots:1, desc:'High-intensity spotlight. 30m illumination beam range.' },
      { id:'light-uv',   name:'UV Scanner',  emoji:'🟣', color:'#7C3AED', weight:0.2, pw:5, dur:5, spd:0, agi:0, int:8, bat:0, slots:1, desc:'UV light scanner. Reveals hidden markings and bacteria.' },
    ],
  },
];

// ─── Platform placement slots ────────────────────────────────────────────────
const SLOTS = [
  [0,0],[-.9,0],[.9,0],[0,-.9],[0,.9],
  [-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9],
  [-1.7,0],[1.7,0],[0,-1.7],[0,1.7],
  [-1.7,-.9],[1.7,-.9],[-1.7,.9],[1.7,.9],
  [-.9,-1.7],[.9,-1.7],[-.9,1.7],[.9,1.7],
  [-2.4,0],[2.4,0],[0,-2.4],[0,2.4],
];

// ─── 3D part meshes ──────────────────────────────────────────────────────────
function createPartMesh(part) {
  const g = new THREE.Group();
  const c = part.color || '#888888';

  // ── ROBOT BODIES ────────────────────────────────────────────────────────────
  if (part.id === 'body-spider') {
    // Central chassis — flat oval body
    const body = bx(.46,.1,.32,c,.7,.4); body.position.y=.07; g.add(body);
    // Sensor head with glowing eye
    const head = new THREE.Mesh(_SPH, m3('#222',.5,.3)); head.scale.set(.07,.07,.07); head.position.set(.2,.14,0); g.add(head);
    const eye  = new THREE.Mesh(_SPH, m3('#ff2200',.1,.1,'#ff2200',2.5)); eye.scale.set(.03,.03,.03); eye.position.set(.25,.14,0); g.add(eye);
    // 6 articulated legs (3 per side)
    [-1,0,1].forEach(row => [-1,1].forEach(side => {
      const zOff = row*0.1, s = side;
      // Segment 1 (hip — going sideways)
      const hip = bx(.19,.028,.028,c,.7,.4); hip.position.set(s*.09,.06,zOff); hip.rotation.y=s*.25; g.add(hip);
      // Segment 2 (knee — angled down)
      const kn  = bx(.16,.024,.024,'#555',.6,.5); kn.position.set(s*.22,.04,zOff); kn.rotation.z=s*-.45; g.add(kn);
      // Segment 3 (ankle — lower)
      const lo  = bx(.13,.02,.02,'#333',.7,.4); lo.position.set(s*.34,-.04,zOff); lo.rotation.z=s*-.75; g.add(lo);
      // Claw (3 toes)
      [-0.02,0,.02].forEach(tz => {
        const toe = bx(.055,.012,.012,'#aaa',.8,.2);
        toe.position.set(s*.43,-.1,zOff+tz); toe.rotation.z=.3; g.add(toe);
      });
    }));

  } else if (part.id === 'body-drone') {
    // Central hub plate
    const hub = cy(.09,.05,c,.6,.3); hub.position.y=.1; g.add(hub);
    const hubRing = new THREE.Mesh(_TOR, m3('#aaa',.5,.3)); hubRing.scale.set(.085,.085,.018); hubRing.rotation.x=Math.PI/2; hubRing.position.y=.1; g.add(hubRing);
    // 4 diagonal arms + motor pods + translucent propeller discs
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dz]) => {
      const angle = Math.atan2(dx,dz);
      const arm = bx(.26,.018,.018,c,.6,.4); arm.position.set(dx*.13,.1,dz*.13); arm.rotation.y=angle; g.add(arm);
      const mot = cy(.038,.042,'#333',.8,.3); mot.position.set(dx*.25,.1,dz*.25); g.add(mot);
      // Prop disc (semi-transparent)
      const propM = new THREE.MeshStandardMaterial({ color:0xcccccc, transparent:true, opacity:.5, roughness:.4, metalness:.3 });
      const prop  = new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.003,20), propM);
      prop.position.set(dx*.25,.14,dz*.25); g.add(prop);
    });
    // Camera gimbal under nose
    const cam = new THREE.Mesh(_SPH, m3('#111',.5,.3)); cam.scale.set(.032,.032,.032); cam.position.set(0,.07,.05); g.add(cam);
    // Landing skids
    [-1,1].forEach(s => {
      const skid = bx(.32,.008,.008,'#555',.5,.5); skid.position.set(0,.065,s*.09); g.add(skid);
      [-0.13,0.13].forEach(x => { const p=bx(.008,.04,.008,'#555',.5,.5); p.position.set(x,.075,s*.09); g.add(p); });
    });

  } else if (part.id === 'body-plane') {
    // Fuselage (elongated, tapered)
    const fuse = cy(.065,.58,c,.5,.4); fuse.rotation.z=Math.PI/2; fuse.position.y=.1; g.add(fuse);
    const nose = new THREE.Mesh(_CONE, m3(c,.5,.4)); nose.scale.set(.065,.1,.065); nose.rotation.z=Math.PI/2; nose.position.set(.32,.1,0); g.add(nose);
    // Wings (wide flat)
    const wing = bx(.1,.006,.46,c,.5,.4); wing.position.set(.02,.1,0); g.add(wing);
    // Tail vertical fin
    const finV = bx(.14,.1,.006,'#777',.5,.4); finV.position.set(-.25,.15,0); g.add(finV);
    // Tail horizontal stabiliser
    const finH = bx(.1,.006,.18,'#777',.5,.4); finH.position.set(-.25,.1,0); g.add(finH);
    // Engine intake (front)
    const intake = cy(.04,.07,'#333',.7,.3); intake.rotation.z=Math.PI/2; intake.position.set(.26,.1,0); g.add(intake);
    // Cockpit dome
    const domeM = new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:.55,roughness:.1,metalness:.1});
    const dome = new THREE.Mesh(_SPH, domeM); dome.scale.set(.048,.038,.042); dome.position.set(.2,.13,0); g.add(dome);

  } else if (part.id === 'body-humanoid') {
    // Torso
    const torso = bx(.22,.28,.14,c,.35,.5); torso.position.y=.25; g.add(torso);
    // Chest glow panel
    const glM = m3('#0077ff',.1,.4,'#0077ff',1.4);
    const gl  = new THREE.Mesh(_BOX, glM); gl.scale.set(.1,.07,.002); gl.position.set(0,.27,.072); g.add(gl);
    // Head
    const head = bx(.14,.14,.12,'#dde',.25,.5); head.position.y=.46; g.add(head);
    // Eyes
    [-0.03,0.03].forEach(ex => {
      const e = new THREE.Mesh(_SPH, m3('#00d9ff',.1,.1,'#00d9ff',1.6)); e.scale.set(.018,.014,.014); e.position.set(ex,.47,.062); g.add(e);
    });
    // Shoulders + arms
    [-1,1].forEach(s => {
      const sh = new THREE.Mesh(_SPH, m3(c,.5,.4)); sh.scale.set(.055,.055,.055); sh.position.set(s*.145,.37,0); g.add(sh);
      const ua = cy(.038,.15,c,.45,.5); ua.position.set(s*.19,.24,0); g.add(ua);
      const la = cy(.032,.13,'#ccd',.45,.5); la.position.set(s*.19,.09,0); g.add(la);
      const hand = new THREE.Mesh(_SPH, m3('#ccc',.4,.4)); hand.scale.set(.035,.03,.03); hand.position.set(s*.19,.01,0); g.add(hand);
    });
    // Legs
    [-1,1].forEach(s => {
      const th = cy(.048,.17,c,.45,.5); th.position.set(s*.065,.05,0); g.add(th);
      const kn = new THREE.Mesh(_SPH, m3('#aab',.6,.3)); kn.scale.set(.04,.04,.04); kn.position.set(s*.065,-.04,0); g.add(kn);
      const sh2 = cy(.04,.15,'#ccd',.45,.5); sh2.position.set(s*.065,-.13,0); g.add(sh2);
      const ft = bx(.07,.025,.12,'#888',.4,.6); ft.position.set(s*.065+.015,-.21,.012); g.add(ft);
    });

  } else if (part.id === 'body-tracked') {
    // Main chassis box
    const chassis = bx(.48,.16,.3,c,.6,.5); chassis.position.y=.12; g.add(chassis);
    // Track assemblies on both sides
    [-1,1].forEach(s => {
      const track = bx(.5,.1,.08,'#111',.8,.65); track.position.set(0,.09,s*.19); g.add(track);
      // Drive sprockets
      [-0.22,0.22].forEach(x => {
        const sp = cy(.052,.08,'#2a2a2a',.7,.3); sp.rotation.x=Math.PI/2; sp.position.set(x,.09,s*.19); g.add(sp);
        const hub2 = cy(.022,.082,'#777',.8,.2); hub2.rotation.x=Math.PI/2; hub2.position.set(x,.09,s*.19); g.add(hub2);
      });
      // Track link segments
      for (let i=-2;i<=2;i++) {
        const seg = bx(.08,.01,.08,'#181818',.8,.5); seg.position.set(i*.1,.045,s*.19); g.add(seg);
      }
    });
    // Equipment rack on top
    const rack = bx(.3,.038,.22,'#2a2a2a',.6,.5); rack.position.y=.215; g.add(rack);
    // Armour rivets (top edges)
    [-0.19,0.19].forEach(z => [-0.18,0.18].forEach(x => {
      const rv = cy(.012,.02,'#444',.7,.4); rv.position.set(x,.205,z); g.add(rv);
    }));

  } else if (part.id === 'body-hover') {
    // Rounded pod body
    const pod = new THREE.Mesh(_SPH, m3(c,.35,.3)); pod.scale.set(.22,.11,.22); pod.position.y=.19; g.add(pod);
    // Transparent canopy
    const capM = new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:.32,roughness:.1});
    const cap = new THREE.Mesh(_SPH, capM); cap.scale.set(.1,.07,.1); cap.position.y=.28; g.add(cap);
    // 4 thruster pods
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz]) => {
      const pod2 = cy(.038,.1,'#333',.7,.4); pod2.position.set(dx*.17,.09,dz*.17); g.add(pod2);
      const glowM = m3(c,.1,.1,c,2.0);
      const gl2 = new THREE.Mesh(_SPH, glowM); gl2.scale.set(.03,.03,.03); gl2.position.set(dx*.17,.04,dz*.17); g.add(gl2);
    });
    // Glow ring at base
    const ringGeo2 = new THREE.TorusGeometry(.165,.012,8,40);
    const rM2 = m3(c,.2,.2,c,1.6);
    const ring2 = new THREE.Mesh(ringGeo2, rM2); ring2.rotation.x=Math.PI/2; ring2.position.y=.065; g.add(ring2);

  } else if (part.id === 'body-underwater') {
    // Pressure hull — elongated cylinder
    const hull = cy(.1,.55,c,.5,.4); hull.rotation.z=Math.PI/2; hull.position.y=.12; g.add(hull);
    // Sonar dome (nose)
    const sonar = new THREE.Mesh(_SPH, m3('#7799bb',.3,.4)); sonar.scale.set(.1,.1,.1); sonar.position.set(.3,.12,0); g.add(sonar);
    // Viewing ports
    [-0.06,0.06].forEach(z => {
      const portM = new THREE.MeshStandardMaterial({color:0xaaccff,transparent:true,opacity:.7,roughness:.05});
      const port = new THREE.Mesh(_SPH, portM); port.scale.set(.024,.024,.024); port.position.set(.1,.16,z); g.add(port);
    });
    // Tail fins
    const finV2 = bx(.12,.1,.006,'#4466aa',.4,.5); finV2.position.set(-.25,.17,0); g.add(finV2);
    const finH2 = bx(.1,.006,.17,'#4466aa',.4,.5); finH2.position.set(-.25,.12,0); g.add(finH2);
    // Side thrusters
    [-1,1].forEach(s => {
      const thr = cy(.024,.06,'#333',.7,.4); thr.rotation.z=Math.PI/2; thr.position.set(-.21,.12,s*.12); g.add(thr);
    });

  } else if (part.id === 'body-arm') {
    // Heavy bolted base plate
    const base = cy(.21,.055,'#1a1a1a',.8,.5); base.position.y=.028; g.add(base);
    for (let i=0;i<4;i++) {
      const a=i*Math.PI/2;
      const bolt = cy(.013,.02,'#666',.7,.4); bolt.position.set(Math.cos(a)*.16,0.05,Math.sin(a)*.16); g.add(bolt);
    }
    // Arm segments
    const s1 = cy(.057,.17,c,.6,.4); s1.position.y=.14; g.add(s1);
    const j1 = new THREE.Mesh(_SPH, m3('#888',.7,.3)); j1.scale.set(.057,.057,.057); j1.position.y=.24; g.add(j1);
    const s2 = bx(.048,.17,.048,c,.6,.4); s2.position.set(.07,.3,0); s2.rotation.z=-.5; g.add(s2);
    const j2 = new THREE.Mesh(_SPH, m3('#888',.7,.3)); j2.scale.set(.046,.046,.046); j2.position.set(.14,.39,0); g.add(j2);
    const s3 = bx(.036,.14,.036,'#888',.6,.4); s3.position.set(.19,.47,0); s3.rotation.z=-.3; g.add(s3);
    // Gripper fingers
    [-0.028,0.028].forEach(z => { const f=bx(.018,.07,.012,'#555',.7,.4); f.position.set(.24,.53,z); g.add(f); });

  // ── WHEELS ──────────────────────────────────────────────────────────────────
  } else if (part.id.startsWith('wheel-')) {
    let torR, torT, nSpokes, hubC, tireC;
    if      (part.id==='wheel-monster')    { torR=.19; torT=.092; nSpokes=5; hubC='#111'; tireC='#0a0a0a'; }
    else if (part.id==='wheel-racing')     { torR=.15; torT=.042; nSpokes=8; hubC='#333'; tireC='#111'; }
    else if (part.id==='wheel-micro')      { torR=.065;torT=.022; nSpokes=4; hubC='#777'; tireC='#222'; }
    else if (part.id==='wheel-magnetic')   { torR=.14; torT=.058; nSpokes=6; hubC='#1a2a88'; tireC='#111'; }
    else if (part.id==='wheel-allterrain') { torR=.155;torT=.072; nSpokes=5; hubC='#333'; tireC='#111'; }
    else                                   { torR=.14; torT=.058; nSpokes=6; hubC='#2a2a2a'; tireC='#111'; }
    const tireGeo = new THREE.TorusGeometry(torR, torT, 16, 36);
    const tireM   = new THREE.MeshStandardMaterial({ color: new THREE.Color(tireC), roughness: .9, metalness: .05 });
    if (part.id==='wheel-magnetic') { tireM.emissive=new THREE.Color('#001166'); tireM.emissiveIntensity=.5; }
    const tire = new THREE.Mesh(tireGeo, tireM);
    tire.rotation.y = Math.PI/2; tire.position.y = torR; g.add(tire);
    // Hub cylinder
    const hub3 = cy(torT*.75, torT*1.5, hubC, .7, .3);
    hub3.rotation.z = Math.PI/2; hub3.position.y = torR; g.add(hub3);
    // Spokes
    for (let s=0; s<nSpokes; s++) {
      const a = (s/nSpokes)*Math.PI*2;
      const spk = bx(torT*1.3, torR*.82, torT*.22, hubC, .7, .35);
      spk.rotation.y = Math.PI/2; spk.rotation.z = a; spk.position.y = torR; g.add(spk);
    }
    // Tread blocks on monster/all-terrain
    if (part.id==='wheel-monster'||part.id==='wheel-allterrain') {
      const nLugs = part.id==='wheel-monster'?8:10;
      for (let i=0;i<nLugs;i++) {
        const a=(i/nLugs)*Math.PI*2;
        const lug=bx(torT*.6,torT*.3,torT*.8,'#000',.8,.8);
        lug.position.set(Math.sin(a)*(torR+torT*.6), torR+Math.cos(a)*(torR+torT*.6)-.01, Math.sin(i*.7)*.06);
        // simplified — just offset blocks radially
        lug.position.set(0, torR, 0);
        lug.rotation.set(0, a, 0);
        lug.translateX(torR+torT*.55);
        g.add(lug);
      }
    }

  // ── LEGS ────────────────────────────────────────────────────────────────────
  } else if (part.id === 'leg-spider') {
    const hip2 = new THREE.Mesh(_SPH, m3('#444',.7,.3)); hip2.scale.set(.038,.038,.038); hip2.position.y=.04; g.add(hip2);
    const s1l = bx(.21,.026,.026,c,.7,.4); s1l.position.set(.105,.04,0); g.add(s1l);
    const kn2  = new THREE.Mesh(_SPH, m3('#333',.7,.3)); kn2.scale.set(.032,.032,.032); kn2.position.set(.21,.04,0); g.add(kn2);
    const s2l = bx(.03,.19,.03,'#555',.6,.5); s2l.position.set(.24,-.03,0); s2l.rotation.z=-.4; g.add(s2l);
    const an2  = new THREE.Mesh(_SPH, m3('#333',.7,.3)); an2.scale.set(.026,.026,.026); an2.position.set(.27,-.16,0); g.add(an2);
    [-0.022,0,.022].forEach(tz => {
      const toe2=bx(.055,.011,.011,'#aaa',.8,.2); toe2.position.set(.31,-.17,tz); toe2.rotation.z=.3; g.add(toe2);
    });

  } else if (part.id === 'leg-humanoid') {
    const hipB = new THREE.Mesh(_SPH, m3('#999',.5,.4)); hipB.scale.set(.048,.048,.048); hipB.position.y=.03; g.add(hipB);
    const thigh2 = cy(.043,.22,c,.4,.5); thigh2.position.y=-.09; g.add(thigh2);
    const knee3 = new THREE.Mesh(_SPH, m3('#888',.6,.3)); knee3.scale.set(.048,.048,.048); knee3.position.y=-.21; g.add(knee3);
    const shin2 = cy(.037,.2,'#ccc',.4,.5); shin2.position.y=-.34; g.add(shin2);
    const ank2  = new THREE.Mesh(_SPH, m3('#888',.6,.3)); ank2.scale.set(.038,.038,.038); ank2.position.y=-.46; g.add(ank2);
    const foot2 = bx(.075,.025,.13,'#aaa',.4,.6); foot2.position.set(.018,-.49,.014); g.add(foot2);

  } else if (part.id === 'leg-stalker') {
    const pts=[[0,0],[.12,-.035],[.24,-.09],[.34,-.18],[.4,-.33]];
    for (let i=0;i<pts.length-1;i++){
      const [x1,y1]=pts[i],[x2,y2]=pts[i+1];
      const len=Math.sqrt((x2-x1)**2+(y2-y1)**2);
      const ang=Math.atan2(y2-y1,x2-x1);
      const seg2=bx(len,.016,.016,i%2===0?c:'#666',.6,.4);
      seg2.position.set((x1+x2)/2,(y1+y2)/2,0); seg2.rotation.z=ang; g.add(seg2);
      const j=new THREE.Mesh(_SPH, m3('#555',.7,.3)); j.scale.set(.02,.02,.02); j.position.set(x1,y1,0); g.add(j);
    }
    const tip2 = new THREE.Mesh(_SPH, m3('#aaa',.7,.2)); tip2.scale.set(.016,.016,.016); tip2.position.set(.4,-.33,0); g.add(tip2);

  } else if (part.id === 'leg-stubby') {
    const upS=cy(.068,.13,c,.5,.5); upS.position.y=-.04; g.add(upS);
    const kn3=new THREE.Mesh(_SPH, m3('#888',.6,.4)); kn3.scale.set(.068,.068,.068); kn3.position.y=-.115; g.add(kn3);
    const loS=cy(.062,.1,'#888',.5,.5); loS.position.y=-.195; g.add(loS);
    const ft3=cy(.1,.022,'#444',.4,.7); ft3.position.y=-.26; g.add(ft3);

  } else if (part.id === 'leg-treading') {
    const ank3=cy(.028,.1,c,.5,.4); ank3.position.y=-.03; g.add(ank3);
    const pad=bx(.19,.028,.13,'#333',.3,.8); pad.position.y=-.1; g.add(pad);
    for (let i=-2;i<=2;i++) { const t=bx(.19,.01,.01,'#1a1a1a',.5,.8); t.position.set(0,-.09,i*.025); g.add(t); }

  } else if (part.id === 'leg-claw') {
    const hipC=new THREE.Mesh(_SPH, m3('#666',.7,.3)); hipC.scale.set(.038,.038,.038); hipC.position.y=.04; g.add(hipC);
    const upC=bx(.17,.028,.028,c,.6,.4); upC.position.set(.085,.04,0); g.add(upC);
    const kn4=new THREE.Mesh(_SPH, m3('#555',.7,.3)); kn4.scale.set(.032,.032,.032); kn4.position.set(.17,.04,0); g.add(kn4);
    const loC=bx(.028,.14,.028,'#777',.6,.4); loC.position.set(.19,-.03,0); loC.rotation.z=-.5; g.add(loC);
    const clwB=cy(.028,.038,'#555',.7,.3); clwB.position.set(.22,-.12,0); g.add(clwB);
    // 4 articulated claw fingers
    [-0.024,-0.008,0.008,0.024].forEach(z => {
      const finger=bx(.065,.01,.01,'#aa1111',.7,.3);
      finger.position.set(.26,-.12,z); finger.rotation.z=z>0?.45:-.3; g.add(finger);
    });

  // ── ARMS & TOOLS ────────────────────────────────────────────────────────────
  } else if (part.id === 'arm-grabber') {
    const shA=new THREE.Mesh(_SPH, m3(c,.5,.4)); shA.scale.set(.056,.056,.056); shA.position.y=.057; g.add(shA);
    const upA=bx(.07,.3,.07,c,.5,.4); upA.position.y=.22; g.add(upA);
    const elA=new THREE.Mesh(_SPH, m3('#888',.6,.3)); elA.scale.set(.054,.054,.054); elA.position.y=.38; g.add(elA);
    const foA=bx(.06,.24,.06,c,.5,.4); foA.position.set(.065,.47,0); foA.rotation.z=-.55; g.add(foA);
    [-0.038,0.038].forEach(z => { const f=bx(.028,.11,.028,'#bbb',.6,.3); f.position.set(.175,.58,z); g.add(f); });

  } else if (part.id === 'arm-extend') {
    const bE=cy(.057,.09,c,.5,.4); bE.position.y=.05; g.add(bE);
    const s1E=cy(.048,.22,c,.5,.4); s1E.position.y=.2; g.add(s1E);
    const s2E=cy(.038,.2,'#aaa',.5,.4); s2E.position.y=.41; g.add(s2E);
    const s3E=cy(.03,.16,'#ccc',.5,.4); s3E.position.y=.59; g.add(s3E);
    const tipE=new THREE.Mesh(_SPH, m3(c,.3,.4,c,.9)); tipE.scale.set(.036,.036,.036); tipE.position.y=.69; g.add(tipE);

  } else if (part.id === 'tool-drill') {
    const bD=cy(.056,.19,'#555',.6,.4); bD.position.y=.14; g.add(bD);
    [.07,.12,.18].forEach(y => { const band=cy(.059,.018,'#333',.5,.6); band.position.y=y; g.add(band); });
    const ch=cy(.038,.055,'#888',.7,.3); ch.position.y=.245; g.add(ch);
    const bit=new THREE.Mesh(_CONE, m3('#bbb',.9,.1)); bit.scale.set(.022,.17,.022); bit.rotation.x=Math.PI; bit.position.y=.35; g.add(bit);

  } else if (part.id === 'tool-laser') {
    const bL=cy(.048,.28,c,.4,.4); bL.position.y=.17; g.add(bL);
    const em2=cy(.03,.055,'#111',.8,.3); em2.position.y=.315; g.add(em2);
    const lens2=new THREE.Mesh(_SPH, m3(c,.1,.05,c,2.8)); lens2.scale.set(.036,.036,.036); lens2.position.y=.356; g.add(lens2);
    [-0.012,0.012].forEach(x => { const con=cy(.007,.26,c,.3,.5); con.position.set(x,.16,.038); g.add(con); });

  } else if (part.id === 'tool-magnet') {
    const bM2=bx(.14,.055,.1,'#222',.6,.4); bM2.position.y=.1; g.add(bM2);
    const gM=new THREE.Mesh(_BOX, m3(c,.1,.2,c,1.3)); gM.scale.set(.12,.038,.08); gM.position.y=.072; g.add(gM);
    [.06,.1,.14].forEach(y => {
      const coil=new THREE.Mesh(_TOR, m3(c,.5,.3,c,.55));
      coil.scale.set(.058,.058,.013); coil.rotation.x=Math.PI/2; coil.position.y=y; g.add(coil);
    });

  // ── SENSORS ─────────────────────────────────────────────────────────────────
  } else if (part.id === 'sensor-cam') {
    const bC2=bx(.095,.075,.075,'#111',.5,.5); bC2.position.y=.067; g.add(bC2);
    const barr=cy(.038,.055,'#2a2a2a',.7,.3); barr.rotation.x=Math.PI/2; barr.position.set(0,.067,.065); g.add(barr);
    const lens3=new THREE.Mesh(_SPH, m3('#001133',.1,.05,'#0044ff',.45)); lens3.scale.set(.032,.032,.032); lens3.position.set(0,.067,.1); g.add(lens3);
    for (let i=0;i<8;i++) {
      const a=(i/8)*Math.PI*2;
      const led2=new THREE.Mesh(_SPH, m3('#ff3300',.1,.1,'#ff3300',1.3)); led2.scale.set(.006,.006,.006);
      led2.position.set(Math.cos(a)*.032,.067+Math.sin(a)*.032,.094); g.add(led2);
    }
    const mnt=bx(.055,.028,.018,'#333',.5,.5); mnt.position.set(0,.022,0); g.add(mnt);

  } else if (part.id === 'sensor-ultra') {
    const hs=bx(.095,.038,.058,'#ddd',.2,.7); hs.position.y=.038; g.add(hs);
    [-0.024,0.024].forEach(x => {
      const td=cy(.018,.024,'#777',.5,.5); td.rotation.x=Math.PI/2; td.position.set(x,.038,.038); g.add(td);
      const mb=new THREE.Mesh(_SPH, m3(c,.2,.3,c,.9)); mb.scale.set(.016,.016,.008); mb.position.set(x,.038,.052); g.add(mb);
    });

  } else if (part.id === 'sensor-lidar') {
    const bLi=cy(.058,.048,'#333',.6,.4); bLi.position.y=.025; g.add(bLi);
    const sc2=cy(.068,.055,'#1a1a1a',.7,.3); sc2.position.y=.082; g.add(sc2);
    const tur=cy(.062,.038,'#111',.8,.2); tur.position.y=.138; g.add(tur);
    for (let i=0;i<8;i++) {
      const a=(i/8)*Math.PI*2;
      const le=new THREE.Mesh(_SPH, m3(c,.1,.1,c,1.6)); le.scale.set(.009,.009,.009);
      le.position.set(Math.cos(a)*.058,.138,Math.sin(a)*.058); g.add(le);
    }
    const sr=new THREE.Mesh(_TOR, m3(c,.2,.2,c,1.1)); sr.scale.set(.052,.052,.01); sr.rotation.x=Math.PI/2; sr.position.y=.138; g.add(sr);

  } else if (part.id === 'sensor-thermal') {
    const bT=bx(.088,.066,.066,'#1a1a1a',.5,.5); bT.position.y=.058; g.add(bT);
    const lensT=new THREE.Mesh(_SPH, m3('#550077',.1,.1,'#aa00cc',1.1)); lensT.scale.set(.033,.033,.016); lensT.position.set(0,.058,.048); g.add(lensT);
    const hM2=new THREE.MeshStandardMaterial({color:0xff5500,transparent:true,opacity:.38,roughness:.4});
    const hV=new THREE.Mesh(_SPH, hM2); hV.scale.set(.055,.038,.038); hV.position.set(0,.058,.075); g.add(hV);

  } else if (part.id === 'sensor-gyro') {
    const o=new THREE.Mesh(_TOR, m3(c,.5,.4)); o.scale.set(.086,.086,.022); o.rotation.x=Math.PI/2; o.position.y=.088; g.add(o);
    const i2=new THREE.Mesh(_TOR, m3('#888',.5,.4)); i2.scale.set(.052,.052,.018); i2.position.y=.088; g.add(i2);
    const core=new THREE.Mesh(_SPH, m3(c,.4,.3,c,.9)); core.scale.set(.028,.028,.028); core.position.y=.088; g.add(core);

  } else if (part.id === 'sensor-compass') {
    const bCo=cy(.048,.022,'#2a2a2a',.5,.5); bCo.position.y=.012; g.add(bCo);
    const face2=cy(.043,.009,'#f5f5f0',.1,.85); face2.position.y=.028; g.add(face2);
    const needleN=bx(.065,.004,.007,c,.4,.3); needleN.position.set(.016,.034,0); g.add(needleN);
    const needleS2=bx(.032,.004,.007,'#aaa',.4,.3); needleS2.position.set(-.016,.034,0); g.add(needleS2);

  // ── POWER ────────────────────────────────────────────────────────────────────
  } else if (part.id === 'bat-small') {
    const cas2=bx(.15,.09,.075,c,.2,.7); cas2.position.y=.077; g.add(cas2);
    const pos2=cy(.014,.022,'#888',.7,.3); pos2.position.set(.048,.145,0); g.add(pos2);
    [.038,0,-.038].forEach(x => { const led3=new THREE.Mesh(_SPH, m3('#00ff88',.1,.1,'#00ff88',1.1)); led3.scale.set(.009,.009,.009); led3.position.set(x,.09,.042); g.add(led3); });

  } else if (part.id === 'bat-medium') {
    const cas3=bx(.21,.11,.095,c,.2,.7); cas3.position.y=.093; g.add(cas3);
    const pos3=cy(.014,.022,'#888',.7,.3); pos3.position.set(.065,.153,0); g.add(pos3);
    const neg=cy(.009,.014,'#888',.7,.3); neg.position.set(-.065,.152,0); g.add(neg);
    [-0.058,0.058].forEach(x => { const sep2=bx(.003,.09,.088,'#224',.3,.8); sep2.position.set(x,.093,0); g.add(sep2); });
    [.055,0,-.055].forEach(x => { const led4=new THREE.Mesh(_SPH, m3('#00cc55',.1,.1,'#00cc55',1.0)); led4.scale.set(.009,.009,.009); led4.position.set(x,.11,.052); g.add(led4); });

  } else if (part.id === 'bat-large') {
    const cas4=bx(.28,.15,.11,c,.2,.7); cas4.position.y=.113; g.add(cas4);
    [-0.088,0,0.088].forEach(x => { const sep3=bx(.003,.13,.1,'#113',.3,.8); sep3.position.set(x,.113,0); g.add(sep3); });
    [-0.075,0.075].forEach(x => { const t2=cy(.015,.028,'#888',.7,.3); t2.position.set(x,.202,0); g.add(t2); });
    [.08,0,-.08].forEach(x => { const led5=new THREE.Mesh(_SPH, m3('#00aa44',.1,.1,'#00aa44',1.0)); led5.scale.set(.01,.01,.01); led5.position.set(x,.135,.06); g.add(led5); });

  } else if (part.id === 'solar') {
    const frame2=bx(.38,.009,.25,'#334455',.3,.6); frame2.position.y=.045; g.add(frame2);
    const cM2=new THREE.MeshStandardMaterial({color:0x001466,roughness:.3,metalness:.2,emissive:new THREE.Color(0x001f88),emissiveIntensity:.12});
    for (let row=0;row<4;row++) for (let col=0;col<6;col++) {
      const cell2=new THREE.Mesh(_BOX,cM2); cell2.scale.set(.052,.005,.05);
      cell2.position.set(-.157+col*.059,.05,-.095+row*.062); g.add(cell2);
    }
    // Grid lines
    const gridM=new THREE.MeshStandardMaterial({color:0x223355,roughness:.5});
    for (let i=0;i<=6;i++) { const gl3=new THREE.Mesh(_BOX,gridM); gl3.scale.set(.002,.007,.25); gl3.position.set(-.157+i*.059,.049,0); g.add(gl3); }

  } else if (part.id === 'fusion') {
    const core2=new THREE.Mesh(_SPH, m3(c,.2,.2,c,2.0)); core2.scale.set(.13,.13,.13); core2.position.y=.18; g.add(core2);
    const ring3=new THREE.Mesh(_TOR, m3(c,.3,.3,c,1.3)); ring3.scale.set(.17,.17,.038); ring3.rotation.x=Math.PI/2; ring3.position.y=.18; g.add(ring3);
    for (let i=0;i<4;i++) {
      const a=i*Math.PI/2;
      const rib2=new THREE.Mesh(_TOR, m3('#666',.5,.4)); rib2.scale.set(.14,.14,.016); rib2.rotation.y=a; rib2.position.y=.18; g.add(rib2);
    }

  // ── AI ───────────────────────────────────────────────────────────────────────
  } else if (part.id.startsWith('ai-')) {
    const chip2=bx(.15,.018,.15,c,.3,.5); chip2.position.y=.08; g.add(chip2);
    [[0,.065],[.065,0],[-.065,0],[0,-.065]].forEach(([tx,tz]) => {
      const trace=bx(tx?(.11):(.006),(.003),tz?(.11):(.006),c,.2,.5); trace.position.set(tx*.5,.09,tz*.5); g.add(trace);
    });
    const glow2=new THREE.Mesh(_SPH, m3(c,.1,.1,c,1.4)); glow2.scale.set(.048,.038,.048); glow2.position.y=.1; g.add(glow2);

  // ── COMMS ────────────────────────────────────────────────────────────────────
  } else if (part.id.startsWith('comm-')) {
    const bCm=bx(.075,.038,.058,'#2a2a2a',.6,.4); bCm.position.y=.038; g.add(bCm);
    const ant2=cy(.011,.21,c,.4,.4); ant2.position.y=.16; g.add(ant2);
    const ball2=new THREE.Mesh(_SPH, m3(c,.2,.2,c,.95)); ball2.scale.set(.028,.028,.028); ball2.position.y=.272; g.add(ball2);
    if (part.id !== 'comm-bt') {
      [.058,.1].forEach(r => {
        const wave2=new THREE.Mesh(_TOR, m3(c,.1,.2,c,.45)); wave2.scale.set(r,r,.009); wave2.rotation.x=Math.PI/2; wave2.position.y=.272; g.add(wave2);
      });
    }

  // ── STRUCTURE ────────────────────────────────────────────────────────────────
  } else if (part.id.startsWith('struct-')) {
    if (part.id === 'struct-shield') {
      const domeS=new THREE.Mesh(_SPH, m3(c,.1,.2,c,.9));
      domeS.material.transparent=true; domeS.material.opacity=.38;
      domeS.scale.set(.21,.21,.21); domeS.position.y=.18; g.add(domeS);
      const rS=new THREE.Mesh(_TOR, m3(c,.3,.3,c,1.6)); rS.scale.set(.21,.21,.026); rS.rotation.x=Math.PI/2; rS.position.y=.05; g.add(rS);
    } else {
      const barS=bx(.34,.038,.038,c,.7,.3); barS.position.y=.1; g.add(barS);
      const platS=bx(.24,.018,.19,c,.6,.4); platS.position.y=.2; g.add(platS);
      [-0.077,0.077].forEach(x => { const blt=cy(.018,.022,'#555',.8,.3); blt.position.set(x,.21,0); g.add(blt); });
    }

  // ── LIGHTING ─────────────────────────────────────────────────────────────────
  } else if (part.id.startsWith('light-')) {
    const hsg2=bx(.11,.048,.075,'#222',.6,.4); hsg2.position.y=.077; g.add(hsg2);
    const eC = part.id==='light-uv'?'#8800ff':part.id==='light-spot'?'#ffffff':'#ffee66';
    const emL=m3(eC,.1,.2,eC,2.2);
    if (part.id==='light-led') {
      [-0.028,0,.028].forEach(x => { const l2=new THREE.Mesh(_SPH,emL); l2.scale.set(.016,.016,.016); l2.position.set(x,.078,.044); g.add(l2); });
    } else {
      const l3=new THREE.Mesh(_SPH,emL); l3.scale.set(.036,.036,.036); l3.position.set(0,.078,.044); g.add(l3);
    }

  } else {
    // Fallback
    const fb=bx(.18,.18,.18,c,.5,.5); fb.position.y=.1; g.add(fb);
  }

  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}

// ─── Stat bar component ───────────────────────────────────────────────────────
function StatBar({ label, value, max, unit = '', color = '#00d9ff', icon }) {
  const pct = Math.min(100, (value / max) * 100);
  const statusColor = pct > 80 ? '#ff4444' : pct > 60 ? '#ffb800' : color;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#888', display:'flex', alignItems:'center', gap: 5 }}>
          {icon && <span>{icon}</span>}{label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, fontFamily: 'monospace' }}>
          {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${pct}%`,
          background: statusColor,
          borderRadius: 3,
          transition: 'width 0.5s ease, background 0.3s ease',
          boxShadow: pct > 0 ? `0 0 6px ${statusColor}66` : 'none',
        }} />
      </div>
    </div>
  );
}

// ─── Three.js Workshop Viewport ──────────────────────────────────────────────
function WorkshopViewport({ attachedParts, showGrid, onClearHighlight }) {
  const wrapRef  = useRef(null);
  const sceneRef = useRef(null);
  const camRef   = useRef(null);
  const rendRef  = useRef(null);
  const rafRef   = useRef(null);
  const roRef    = useRef(null);
  const meshesRef= useRef({});   // uid → group
  const glowRef  = useRef(null);
  const gridRef  = useRef(null);
  const orb      = useRef({ theta: 0.65, phi: 0.68, r: 9, drag: false, lx: 0, ly: 0, spin: true });
  const spinTimer= useRef(null);

  function updateCam() {
    const o = orb.current;
    const cam = camRef.current;
    if (!cam) return;
    cam.position.set(
      o.r * Math.sin(o.phi) * Math.sin(o.theta),
      o.r * Math.cos(o.phi),
      o.r * Math.sin(o.phi) * Math.cos(o.theta)
    );
    cam.lookAt(0, 0.5, 0);
  }

  // ── Initial scene setup ──────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xedf0f7);
    scene.fog = new THREE.FogExp2(0xedf0f7, 0.022);
    sceneRef.current = scene;

    // Camera
    const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 120);
    camRef.current = cam;
    updateCam();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Lighting ─────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 2.8));

    const key = new THREE.DirectionalLight(0xfff8ee, 1.6);
    key.position.set(-6, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8; key.shadow.camera.right = 8;
    key.shadow.camera.top  =  8; key.shadow.camera.bottom= -8;
    key.shadow.bias = -0.0003;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xaabbee, 0.5);
    fill.position.set(5, 5, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x4466aa, 0.3);
    rim.position.set(0, 3, -7);
    scene.add(rim);

    const cyan = new THREE.PointLight(0x00d9ff, 2.0, 7);
    cyan.position.set(0, 0.5, 0);
    scene.add(cyan);

    // ── Floor ────────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(28, 28, 1, 1);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xcdd3de, roughness: 0.92, metalness: 0.05 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid
    const fGrid = new THREE.GridHelper(28, 28, 0xb4bdd0, 0xb4bdd0);
    fGrid.position.y = -0.49;
    scene.add(fGrid);

    // ── Platform ─────────────────────────────────────────────────────────
    const platGeo = new THREE.CylinderGeometry(3.8, 3.8, 0.18, 72);
    const platMat = new THREE.MeshStandardMaterial({ color: 0xdde2ef, metalness: 0.6, roughness: 0.4 });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.y = -0.41;
    plat.receiveShadow = true;
    plat.castShadow = true;
    scene.add(plat);

    // Platform grid overlay
    const pgrid = new THREE.GridHelper(7.2, 12, 0x99aac8, 0xaabbd8);
    pgrid.position.y = -0.315;
    pgrid.name = 'platformGrid';
    scene.add(pgrid);
    gridRef.current = pgrid;

    // Glow ring
    const ringGeo = new THREE.TorusGeometry(3.83, 0.065, 8, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d9ff, emissive: new THREE.Color(0x00d9ff), emissiveIntensity: 2.0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.32;
    scene.add(ring);
    glowRef.current = ring;

    // Inner accent ring
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.025, 8, 72),
      new THREE.MeshStandardMaterial({ color: 0x0055aa, emissive: new THREE.Color(0x0055aa), emissiveIntensity: 0.8 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -0.32;
    scene.add(innerRing);

    // ── Background: workshop walls ────────────────────────────────────────
    const wallM = m3('#d4d9e8', 0.05, 0.8);
    const backW = new THREE.Mesh(new THREE.PlaneGeometry(28, 12), wallM);
    backW.position.set(0, 5.5, -9);
    scene.add(backW);

    const leftW = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), wallM);
    leftW.position.set(-9, 5.5, 0);
    leftW.rotation.y = Math.PI / 2;
    scene.add(leftW);

    // Windows on back wall (sunny daylight)
    const winM = new THREE.MeshStandardMaterial({ color: 0x9cc8f0, emissive: new THREE.Color(0x88bbee), emissiveIntensity: 0.6 });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 4), winM);
    win.position.set(-3, 6.5, -8.9);
    scene.add(win);
    const win2 = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 4), winM);
    win2.position.set(3, 6.5, -8.9);
    scene.add(win2);

    // Overhead industrial lights
    const lampM = new THREE.MeshStandardMaterial({ color: 0xd8d8cc, emissive: new THREE.Color(0xffffee), emissiveIntensity: 0.5 });
    [-4, 0, 4].forEach(x => {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.15, 12), lampM);
      lamp.position.set(x, 8.8, -2);
      scene.add(lamp);
    });

    // Workbenches
    [[-7.5, -3], [-7.5, 2]].forEach(([x, z]) => {
      const top = bx(1.8, 0.1, 0.8, '#b89a6a', 0.25, 0.7); top.position.set(x, 2.4, z); scene.add(top);
      [[-.7, -.3],[.7, -.3],[-.7, .3],[.7, .3]].forEach(([lx, lz]) => {
        const leg = bx(0.07, 2.3, 0.07, '#8a7050', 0.3, 0.75); leg.position.set(x+lx, 1.15, z+lz); scene.add(leg);
      });
    });

    // Tool rack on back wall
    const rack = bx(5, 0.06, 0.08, '#bbc4d8', 0.4, 0.6); rack.position.set(5, 5, -8.85); scene.add(rack);
    // Hanging tools (simple cylinders)
    [-0.5, 0.5, 1.5, 2.5].forEach(tx => {
      const tool = cy(0.04, 0.4, '#8899bb', 0.5, 0.5); tool.position.set(5+tx, 4.7, -8.85); scene.add(tool);
    });

    // ── Orbit controls ────────────────────────────────────────────────────
    const canvas = renderer.domElement;

    const onDown = e => {
      orb.current.drag = true;
      orb.current.lx = e.clientX;
      orb.current.ly = e.clientY;
      orb.current.spin = false;
      clearTimeout(spinTimer.current);
    };
    const onMove = e => {
      if (!orb.current.drag) return;
      const dx = e.clientX - orb.current.lx;
      const dy = e.clientY - orb.current.ly;
      orb.current.theta -= dx * 0.006;
      orb.current.phi   = Math.max(0.12, Math.min(1.45, orb.current.phi + dy * 0.006));
      orb.current.lx = e.clientX;
      orb.current.ly = e.clientY;
      updateCam();
    };
    const onUp = () => {
      orb.current.drag = false;
      spinTimer.current = setTimeout(() => { orb.current.spin = true; }, 3000);
    };
    const onWheel = e => {
      orb.current.r = Math.max(3.5, Math.min(20, orb.current.r + e.deltaY * 0.015));
      updateCam();
    };
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });

    // Touch
    const onTouch = e => { if(e.touches[0]) { orb.current.drag=true; orb.current.lx=e.touches[0].clientX; orb.current.ly=e.touches[0].clientY; orb.current.spin=false; } };
    const onTMove = e => { if(!orb.current.drag||!e.touches[0]) return; const dx=e.touches[0].clientX-orb.current.lx, dy=e.touches[0].clientY-orb.current.ly; orb.current.theta-=dx*.006; orb.current.phi=Math.max(.12,Math.min(1.45,orb.current.phi+dy*.006)); orb.current.lx=e.touches[0].clientX; orb.current.ly=e.touches[0].clientY; updateCam(); };
    const onTEnd = () => { orb.current.drag=false; spinTimer.current=setTimeout(()=>{orb.current.spin=true;},3000); };
    canvas.addEventListener('touchstart', onTouch, {passive:true});
    canvas.addEventListener('touchmove', onTMove, {passive:true});
    canvas.addEventListener('touchend', onTEnd);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = Math.max(el.clientWidth, 1), h = Math.max(el.clientHeight, 1);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    roRef.current = ro;

    // ── Animate ───────────────────────────────────────────────────────────
    let t = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      t += 0.008;
      if (orb.current.spin) {
        orb.current.theta += 0.0025;
        updateCam();
      }
      if (glowRef.current) glowRef.current.material.emissiveIntensity = 1.8 + Math.sin(t * 2) * 0.4;
      renderer.render(scene, cam);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(spinTimer.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('touchmove', onTMove);
      canvas.removeEventListener('touchend', onTEnd);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []); // eslint-disable-line

  // ── Sync attachedParts to scene ──────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // Remove all old part meshes
    Object.values(meshesRef.current).forEach(m => scene.remove(m));
    meshesRef.current = {};
    // Add current parts
    attachedParts.forEach((p, idx) => {
      const slot = SLOTS[idx % SLOTS.length] || [0, 0];
      const g = createPartMesh(p);
      g.position.set(slot[0], -0.3, slot[1]);
      scene.add(g);
      meshesRef.current[p._uid] = g;
    });
  }, [attachedParts]);

  // ── Grid visibility sync ─────────────────────────────────────────────────
  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = showGrid;
  }, [showGrid]);

  return <div ref={wrapRef} style={{ width:'100%', height:'100%' }} />;
}

// ─── Main Builder Page ───────────────────────────────────────────────────────
export default function ModularBuilderPage({ onSimulate }) {
  const [attachedParts, setAttachedParts] = useState([]);
  const [expandedCats,  setExpandedCats]  = useState({ bodies: true });
  const [searchQuery,   setSearchQuery]   = useState('');
  const [activeTool,    setActiveTool]    = useState('select');
  const [showGrid,      setShowGrid]      = useState(true);
  const [snapOn,        setSnapOn]        = useState(true);
  const [hoveredPart,   setHoveredPart]   = useState(null); // part data for left panel hover
  const [selectedPart,  setSelectedPart]  = useState(null); // attached part uid
  const [showSave,      setShowSave]      = useState(false);
  const [showClear,     setShowClear]     = useState(false);
  const [robotName,     setRobotName]     = useState('My Custom Robot');
  const uidRef = useRef(0);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let wt=0,pw=0,dur=0,spd=0,agi=0,intel=0,bat=0;
    attachedParts.forEach(p => {
      wt  += p.weight || 0;
      pw  += p.pw     || 0;
      dur += p.dur    || 0;
      spd += p.spd    || 0;
      agi += p.agi    || 0;
      intel+=p.int    || 0;
      bat += p.bat    || 0;
    });
    return {
      weight:  Math.round(Math.min(wt, 1000) * 10) / 10,
      power:   Math.max(0, Math.round(Math.min(pw, 500))),
      dur:     Math.min(Math.max(0, Math.round(dur)), 100),
      spd:     Math.min(Math.max(0, Math.round(spd)), 100),
      agi:     Math.min(Math.max(0, Math.round(agi)), 100),
      intel:   Math.min(Math.max(0, Math.round(intel)), 100),
      bat:     Math.min(Math.max(0, Math.round(bat)), 100),
    };
  }, [attachedParts]);

  const status = useMemo(() => {
    if (!attachedParts.length) return { col: '#888', msg: 'Select a robot body to start building' };
    const hasBody = attachedParts.some(p => p.id.startsWith('body-'));
    if (!hasBody) return { col: '#ffb800', msg: 'Add a robot body first' };
    const hasPower = attachedParts.some(p => p.id.startsWith('bat-') || p.id==='solar' || p.id==='fusion');
    if (!hasPower) return { col: '#ffb800', msg: 'Robot needs a power source' };
    return { col: '#00cc55', msg: '✓ Robot is ready for testing!' };
  }, [attachedParts]);

  // ── Part actions ─────────────────────────────────────────────────────────
  const addPart = useCallback((part) => {
    const uid = `${part.id}_${++uidRef.current}`;
    setAttachedParts(prev => [...prev, { ...part, _uid: uid }]);
  }, []);

  const removePart = useCallback((uid) => {
    setAttachedParts(prev => prev.filter(p => p._uid !== uid));
    setSelectedPart(null);
  }, []);

  const clearAll = useCallback(() => {
    setAttachedParts([]);
    setSelectedPart(null);
    setShowClear(false);
  }, []);

  const autoBalance = useCallback(() => {
    setAttachedParts(prev => [...prev].sort((a, b) => (b.weight||0) - (a.weight||0)));
  }, []);

  // ── Toolbar tools ────────────────────────────────────────────────────────
  const tools = [
    { id:'select', label:'SELECT', icon:'↖' },
    { id:'move',   label:'MOVE',   icon:'✛' },
    { id:'rotate', label:'ROTATE', icon:'↺' },
    { id:'scale',  label:'SCALE',  icon:'⤢' },
    { id:'mirror', label:'MIRROR', icon:'⇔' },
  ];

  // ── Filtered catalog ─────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();
  const filteredCatalog = PARTS_CATALOG.map(cat => ({
    ...cat,
    parts: cat.parts.filter(p => !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
  })).filter(cat => cat.parts.length > 0);

  // ── Colors ───────────────────────────────────────────────────────────────
  const BG   = '#f1f4f9';
  const PAN  = '#ffffff';
  const PAN2 = '#f4f6fb';
  const BOR  = '#e0e4ed';
  const ACC  = '#0099cc';
  const TXT  = '#111827';
  const DIM  = '#6b7280';

  return (
    <div style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', background: BG, color: TXT, fontFamily: "'Inter', system-ui, sans-serif", overflow:'hidden' }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', background: PAN, borderBottom:`1px solid ${BOR}`, flexShrink:0 }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)}
            title={t.label}
            style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
              border:`1px solid ${activeTool===t.id ? ACC : BOR}`,
              background: activeTool===t.id ? `${ACC}22` : 'transparent',
              color: activeTool===t.id ? ACC : DIM,
              borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700,
              transition:'all 0.15s',
            }}>
            <span style={{fontSize:13}}>{t.icon}</span>{t.label}
          </button>
        ))}

        <div style={{ width:1, height:22, background: BOR, margin:'0 6px' }} />

        {/* Grid toggle */}
        <button onClick={() => setShowGrid(v => !v)}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
            border:`1px solid ${showGrid ? ACC : BOR}`,
            background: showGrid ? `${ACC}22` : 'transparent',
            color: showGrid ? ACC : DIM, borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
          ⊞ GRID
        </button>

        {/* Snap toggle */}
        <button onClick={() => setSnapOn(v => !v)}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
            border:`1px solid ${snapOn ? '#ffb800' : BOR}`,
            background: snapOn ? '#ffb80022' : 'transparent',
            color: snapOn ? '#ffb800' : DIM, borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
          🧲 SNAP
        </button>

        {/* Reset camera */}
        <button onClick={() => {}}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
            border:`1px solid ${BOR}`, background:'transparent', color: DIM,
            borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
          ⌖ RESET
        </button>

        <div style={{ flex:1 }} />

        {/* Status dot */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:6, background: PAN2, border:`1px solid ${BOR}` }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: status.col, boxShadow:`0 0 6px ${status.col}` }} />
          <span style={{ fontSize:10, color: status.col, fontWeight:700 }}>{status.msg}</span>
        </div>

        <button onClick={() => setShowSave(true)}
          style={{ padding:'6px 16px', background: ACC, color:'#fff', border:'none', borderRadius:7,
            cursor:'pointer', fontSize:11, fontWeight:800, letterSpacing:'0.05em', marginLeft:8 }}>
          SAVE ROBOT
        </button>
      </div>

      {/* ── Body: three columns ──────────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ─── LEFT PANEL ────────────────────────────────────────────────── */}
        <div style={{ width:260, flexShrink:0, background: PAN, borderRight:`1px solid ${BOR}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'12px 14px 8px', borderBottom:`1px solid ${BOR}`, flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', color: DIM, marginBottom:8 }}>PART LIBRARY</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', background: PAN2, borderRadius:7, border:`1px solid ${BOR}` }}>
              <span style={{ color: DIM, fontSize:12 }}>🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search parts..."
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color: TXT, fontSize:11 }} />
            </div>
          </div>

          {/* Categories scroll */}
          <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
            {filteredCatalog.map(cat => {
              const isOpen = !!expandedCats[cat.id];
              return (
                <div key={cat.id}>
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'9px 14px', background:'transparent', border:'none', borderBottom:`1px solid ${BOR}`,
                      cursor:'pointer', color: TXT, textAlign:'left' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, fontWeight:700, letterSpacing:'0.08em' }}>
                      <span>{cat.icon}</span>{cat.label}
                    </span>
                    <span style={{ color: DIM, fontSize:10 }}>{isOpen ? '▾' : '▸'}</span>
                  </button>

                  {/* Parts list */}
                  {isOpen && cat.parts.map(part => {
                    const isHovered = hoveredPart?.id === part.id;
                    return (
                      <div key={part.id}
                        onMouseEnter={() => setHoveredPart(part)}
                        onMouseLeave={() => setHoveredPart(null)}
                        style={{ padding:'8px 12px', borderBottom:`1px solid #eef0f5`,
                          background: isHovered ? '#eef4ff' : 'transparent',
                          transition:'background 0.15s', cursor:'default' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          {/* Emoji icon */}
                          <div style={{ width:38, height:38, flexShrink:0, borderRadius:6,
                            background: `${part.color}22`, border:`1px solid ${part.color}44`,
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                            {part.emoji}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color: TXT, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {part.name}
                            </div>
                            <div style={{ fontSize:9, color: DIM, marginBottom:5, lineHeight:1.3 }}>{part.desc}</div>
                            {/* Stats mini */}
                            <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                              {part.weight > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#6b7280' }}>⚖ +{part.weight}kg</span>}
                              {part.pw > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#d97706' }}>⚡ +{part.pw}W</span>}
                              {part.dur > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#2563eb' }}>🛡 +{part.dur}</span>}
                              {part.spd > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#059669' }}>🚀 +{part.spd}</span>}
                              {part.int > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#7c3aed' }}>🧠 +{part.int}</span>}
                              {part.bat > 0 && <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color:'#0d9488' }}>🔋 +{part.bat}</span>}
                              <span style={{ fontSize:8, padding:'1px 5px', background:'#eef0f5', borderRadius:3, color: DIM }}>{part.slots} slots</span>
                            </div>
                          </div>
                        </div>

                        {/* Add button (visible on hover) */}
                        {isHovered && (
                          <button onClick={() => addPart(part)}
                            style={{ marginTop:7, width:'100%', padding:'5px', background: ACC, color:'#fff',
                              border:'none', borderRadius:5, cursor:'pointer', fontSize:10, fontWeight:800, letterSpacing:'0.05em' }}>
                            + ADD TO ROBOT
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── CENTER VIEWPORT ───────────────────────────────────────────── */}
        <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#edf0f7' }}>
          <WorkshopViewport attachedParts={attachedParts} showGrid={showGrid} />

          {/* Empty state */}
          {attachedParts.length === 0 && (
            <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)',
              padding:'10px 20px', background:'rgba(255,255,255,0.88)', borderRadius:8,
              border:`1px solid ${BOR}`, pointerEvents:'none' }}>
              <span style={{ fontSize:12, color: DIM, fontStyle:'italic' }}>
                Click a part in the library to add it to your robot.
              </span>
            </div>
          )}

          {/* Part count badge */}
          {attachedParts.length > 0 && (
            <div style={{ position:'absolute', top:10, left:10, padding:'4px 10px',
              background:'rgba(255,255,255,0.88)', borderRadius:6, border:`1px solid ${BOR}` }}>
              <span style={{ fontSize:11, color: ACC, fontWeight:700 }}>{attachedParts.length} parts</span>
            </div>
          )}

          {/* Hint */}
          <div style={{ position:'absolute', bottom:10, right:10,
            fontSize:9, color:'#aab', fontStyle:'italic', pointerEvents:'none' }}>
            Drag to rotate · Scroll to zoom
          </div>
        </div>

        {/* ─── RIGHT PANEL ───────────────────────────────────────────────── */}
        <div style={{ width:270, flexShrink:0, background: PAN, borderLeft:`1px solid ${BOR}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 0' }}>

            {/* Robot overview title */}
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', color: DIM, marginBottom:12 }}>ROBOT OVERVIEW</div>

            {/* Robot name */}
            <div style={{ padding:'8px 10px', background: PAN2, borderRadius:7, border:`1px solid ${BOR}`, marginBottom:14, textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:700, color: TXT }}>{robotName}</div>
              <div style={{ fontSize:9, color: DIM, marginTop:2 }}>{attachedParts.length} parts · {stats.weight}kg</div>
            </div>

            {/* Stats */}
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', color: DIM, marginBottom:8 }}>STATS</div>
            <StatBar label="Weight"       value={stats.weight} max={1000} unit=" kg" color="#9CA3AF" icon="⚖️" />
            <StatBar label="Power Usage"  value={stats.power}  max={500}  unit=" W"  color="#fbbf24" icon="⚡" />
            <StatBar label="Durability"   value={stats.dur}    max={100}  color="#60a5fa"   icon="🛡️" />
            <StatBar label="Speed"        value={stats.spd}    max={100}  color="#34d399"   icon="🚀" />
            <StatBar label="Agility"      value={stats.agi}    max={100}  color="#fb923c"   icon="⚡" />
            <StatBar label="Intelligence" value={stats.intel}  max={100}  color="#a78bfa"   icon="🧠" />
            <StatBar label="Battery"      value={stats.bat}    max={100}  color="#6ee7b7"   icon="🔋" />

            <div style={{ height:1, background: BOR, margin:'14px 0' }} />

            {/* Quick Actions */}
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', color: DIM, marginBottom:8 }}>QUICK ACTIONS</div>
            {[
              { label:'▶  TEST MOVEMENT',    col: ACC,      act: () => onSimulate?.() },
              { label:'👁  PREVIEW ANIMATION',col: '#7c3aed', act: () => {} },
              { label:'⚖  AUTO-BALANCE',     col: '#ffb800', act: autoBalance },
              { label:'🗑  CLEAR ALL',        col: '#ff4444', act: () => setShowClear(true) },
            ].map(btn => (
              <button key={btn.label} onClick={btn.act}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:8,
                  padding:'9px 12px', marginBottom:5,
                  background: `${btn.col}15`, border:`1px solid ${btn.col}44`,
                  color: btn.col, borderRadius:7, cursor:'pointer', fontSize:10, fontWeight:700,
                  textAlign:'left', letterSpacing:'0.04em', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background=`${btn.col}28`; e.currentTarget.style.borderColor=`${btn.col}88`; }}
                onMouseLeave={e => { e.currentTarget.style.background=`${btn.col}15`; e.currentTarget.style.borderColor=`${btn.col}44`; }}>
                {btn.label}
              </button>
            ))}

            <div style={{ height:1, background: BOR, margin:'14px 0' }} />

            {/* Attached parts list */}
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', color: DIM, marginBottom:8 }}>
              PARTS ATTACHED ({attachedParts.length})
            </div>
            {attachedParts.length === 0 && (
              <div style={{ fontSize:10, color:'#aab', fontStyle:'italic', marginBottom:8 }}>
                No parts added yet.<br/>Select parts from the library.
              </div>
            )}
            {attachedParts.map(p => (
              <div key={p._uid}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', marginBottom:4,
                  background: selectedPart===p._uid ? '#eff4ff' : PAN2,
                  border:`1px solid ${selectedPart===p._uid ? ACC+'44' : BOR}`,
                  borderRadius:6, cursor:'pointer', transition:'all 0.15s' }}
                onClick={() => setSelectedPart(prev => prev===p._uid ? null : p._uid)}>
                <span style={{ fontSize:15 }}>{p.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color: TXT, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize:8, color: DIM }}>
                    {p.weight>0?`⚖ +${p.weight}kg`:''}{p.pw>0?`  ⚡ +${p.pw}W`:''}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); removePart(p._uid); }}
                  style={{ padding:'2px 7px', background:'transparent', border:`1px solid #d1d5db`,
                    color:'#9ca3af', borderRadius:4, cursor:'pointer', fontSize:11, flexShrink:0 }}
                  onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';e.currentTarget.style.borderColor='#ef4444';}}
                  onMouseLeave={e=>{e.currentTarget.style.color='#9ca3af';e.currentTarget.style.borderColor='#d1d5db';}}>
                  ✕
                </button>
              </div>
            ))}

            <div style={{ height:40 }} />
          </div>
        </div>
      </div>

      {/* ── Save Dialog ──────────────────────────────────────────────────── */}
      {showSave && (
        <div style={{ position:'fixed', inset:0, background:'rgba(30,40,80,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#ffffff', border:`1px solid ${BOR}`, borderRadius:12, padding:28, width:340, boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize:14, fontWeight:800, color: TXT, marginBottom:18 }}>💾 Save Robot Design</div>
            <label style={{ fontSize:11, color: DIM, display:'block', marginBottom:5 }}>Robot Name</label>
            <input value={robotName} onChange={e => setRobotName(e.target.value)}
              style={{ width:'100%', padding:'8px 12px', background: PAN2, border:`1px solid ${BOR}`,
                color: TXT, borderRadius:7, fontSize:12, outline:'none', boxSizing:'border-box', marginBottom:14 }} />
            <div style={{ fontSize:10, color: DIM, marginBottom:18 }}>
              {attachedParts.length} parts · {stats.weight}kg · {status.msg}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowSave(false)}
                style={{ flex:1, padding:'9px', background:'transparent', border:`1px solid ${BOR}`,
                  color: DIM, borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:700 }}>
                Cancel
              </button>
              <button onClick={() => setShowSave(false)}
                style={{ flex:2, padding:'9px', background: ACC, border:'none',
                  color:'#fff', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:800 }}>
                Save Robot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Confirm ─────────────────────────────────────────────────── */}
      {showClear && (
        <div style={{ position:'fixed', inset:0, background:'rgba(30,40,80,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#ffffff', border:`1px solid #ffcccc`, borderRadius:12, padding:28, width:300, textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize:28, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:13, fontWeight:700, color: TXT, marginBottom:8 }}>Clear All Parts?</div>
            <div style={{ fontSize:11, color: DIM, marginBottom:22 }}>This will remove all {attachedParts.length} parts.<br/>This cannot be undone.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowClear(false)}
                style={{ flex:1, padding:'9px', background:PAN2, border:`1px solid ${BOR}`,
                  color: DIM, borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:700 }}>
                Cancel
              </button>
              <button onClick={clearAll}
                style={{ flex:1, padding:'9px', background:'#ef4444', border:'none',
                  color:'#fff', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:800 }}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
