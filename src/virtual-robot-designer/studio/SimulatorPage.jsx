/**
 * SimulatorPage.jsx — ByteBuddies Robot Simulator
 * Left:   Real Google Blockly visual-code workspace
 * Center: Live Three.js robot arena
 * Right:  Stats + challenge selector + controls
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE    from 'three';
import * as Blockly  from 'blockly';
import { buildRobotModel } from '../services/studio-robot-builder.js';

// ─── Challenges ──────────────────────────────────────────────────────────────
const CHALLENGES = [
  { id:'obstacle', name:'Obstacle Course', icon:'🏁', desc:'Navigate to the finish!',  color:'#22c55e', obstacles:10, totalDist:22, difficulty:'Easy'   },
  { id:'speedrun',  name:'Speed Run',       icon:'⚡',  desc:'Beat the clock!',          color:'#f59e0b', obstacles:5,  totalDist:16, difficulty:'Medium' },
  { id:'maze',      name:'Maze Navigator',  icon:'🌀', desc:'Find the exit!',            color:'#8b5cf6', obstacles:18, totalDist:30, difficulty:'Hard'   },
  { id:'collect',   name:'Cargo Run',       icon:'📦', desc:'Collect every cargo box!',  color:'#0ea5e9', obstacles:6,  totalDist:20, difficulty:'Medium' },
];
const INIT_STATS = { time:0, dist:0, battery:100, avoided:0, progress:0 };

// ─── Blockly block registration (runs once) ───────────────────────────────────
let _registered = false;
function registerBlocks() {
  if (_registered) return;
  _registered = true;

  /* EVENTS – yellow hat blocks */
  Blockly.Blocks['when_start'] = { init() {
    this.appendDummyInput().appendField('🟢  when  ▶  Start');
    this.setNextStatement(true, null);
    this.setColour('#E6A817');
    this.setTooltip('Your program begins here');
  }};

  Blockly.Blocks['when_obstacle'] = { init() {
    this.appendDummyInput().appendField('🚨  when obstacle detected');
    this.setNextStatement(true, null);
    this.setColour('#E6A817');
    this.setTooltip('Runs when the sensor sees an obstacle');
  }};

  /* CONTROL – orange C-blocks */
  Blockly.Blocks['repeat_n'] = { init() {
    this.appendDummyInput()
      .appendField('🔁  repeat')
      .appendField(new Blockly.FieldNumber(3, 1, 20, 1), 'TIMES')
      .appendField('times');
    this.appendStatementInput('DO').setCheck(null).appendField('do');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#CF8B17');
    this.setTooltip('Repeat the blocks inside');
  }};

  Blockly.Blocks['if_obstacle_c'] = { init() {
    this.appendDummyInput().appendField('🚧  if obstacle ahead');
    this.appendStatementInput('DO').setCheck(null).appendField('then');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#CF8B17');
  }};

  Blockly.Blocks['if_else_c'] = { init() {
    this.appendDummyInput().appendField('❓  if obstacle ahead');
    this.appendStatementInput('DO').setCheck(null).appendField('then');
    this.appendStatementInput('ELSE').setCheck(null).appendField('else');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#CF8B17');
  }};

  Blockly.Blocks['wait_sec'] = { init() {
    this.appendDummyInput()
      .appendField('⏱  wait')
      .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECS')
      .appendField('seconds');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#CF8B17');
  }};

  /* MOTION – blue stack blocks */
  Blockly.Blocks['move_forward'] = { init() {
    this.appendDummyInput()
      .appendField('⬆️  move forward')
      .appendField(new Blockly.FieldNumber(2, 1, 10, 1), 'STEPS')
      .appendField('steps');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  Blockly.Blocks['move_backward'] = { init() {
    this.appendDummyInput()
      .appendField('⬇️  move backward')
      .appendField(new Blockly.FieldNumber(2, 1, 10, 1), 'STEPS')
      .appendField('steps');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  Blockly.Blocks['turn_left'] = { init() {
    this.appendDummyInput()
      .appendField('↺  turn left')
      .appendField(new Blockly.FieldNumber(90, 15, 360, 15), 'DEGREES')
      .appendField('°');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  Blockly.Blocks['turn_right'] = { init() {
    this.appendDummyInput()
      .appendField('↻  turn right')
      .appendField(new Blockly.FieldNumber(90, 15, 360, 15), 'DEGREES')
      .appendField('°');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  Blockly.Blocks['spin_around'] = { init() {
    this.appendDummyInput().appendField('🌀  spin around');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  Blockly.Blocks['stop_robot'] = { init() {
    this.appendDummyInput().appendField('⏹  stop');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#4C97FF');
  }};

  /* FLIGHT – sky blue (flying robots only) */
  Blockly.Blocks['fly_up'] = { init() {
    this.appendDummyInput()
      .appendField('🚀  fly up')
      .appendField(new Blockly.FieldNumber(2, 1, 5, 1), 'HEIGHT')
      .appendField('m');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5CB1D6');
  }};

  Blockly.Blocks['fly_down'] = { init() {
    this.appendDummyInput().appendField('🪂  fly down');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5CB1D6');
  }};

  Blockly.Blocks['hover_place'] = { init() {
    this.appendDummyInput()
      .appendField('🚁  hover for')
      .appendField(new Blockly.FieldNumber(2, 0.5, 10, 0.5), 'SECS')
      .appendField('sec');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5CB1D6');
  }};

  /* ARM – green (arm robots only) */
  Blockly.Blocks['grab_object'] = { init() {
    this.appendDummyInput().appendField('🤏  grab object');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#59C059');
  }};

  Blockly.Blocks['release_object'] = { init() {
    this.appendDummyInput().appendField('👐  release object');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#59C059');
  }};

  Blockly.Blocks['extend_arm'] = { init() {
    this.appendDummyInput().appendField('💪  extend arm');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#59C059');
  }};

  /* SENSORS – teal (sensor robots only) */
  Blockly.Blocks['scan_area'] = { init() {
    this.appendDummyInput().appendField('📡  scan area');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5CB1D6');
  }};

  Blockly.Blocks['look_around'] = { init() {
    this.appendDummyInput().appendField('👁  look around');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5CB1D6');
  }};

  /* LIGHTS – purple (light robots only) */
  Blockly.Blocks['lights_on'] = { init() {
    this.appendDummyInput().appendField('💡  lights on');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#9966FF');
  }};

  Blockly.Blocks['lights_off'] = { init() {
    this.appendDummyInput().appendField('🔦  lights off');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#9966FF');
  }};

  Blockly.Blocks['lights_flash'] = { init() {
    this.appendDummyInput()
      .appendField('✨  flash lights')
      .appendField(new Blockly.FieldNumber(3, 1, 10, 1), 'TIMES')
      .appendField('times');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#9966FF');
  }};
}

// ─── Dynamic toolbox (depends on robot config) ───────────────────────────────
function buildToolbox(robotConfig) {
  const movId   = robotConfig?.movementId || 'wheels';
  const sensors = robotConfig?.sensors    || [];
  const armId   = robotConfig?.armId;
  const lightId  = robotConfig?.lightId;
  const isFlying = ['flying', 'jets', 'hover'].includes(movId);

  const cats = [
    {
      kind:'category', name:'⚡ Events', colour:'#E6A817',
      contents:[
        { kind:'block', type:'when_start' },
        ...(sensors.length ? [{ kind:'block', type:'when_obstacle' }] : []),
      ],
    },
    {
      kind:'category', name:'🔁 Control', colour:'#CF8B17',
      contents:[
        { kind:'block', type:'repeat_n' },
        { kind:'block', type:'wait_sec' },
        ...(sensors.length ? [
          { kind:'block', type:'if_obstacle_c' },
          { kind:'block', type:'if_else_c' },
        ] : []),
      ],
    },
    {
      kind:'category', name:'🚗 Motion', colour:'4C97FF',
      contents:[
        { kind:'block', type:'move_forward' },
        { kind:'block', type:'move_backward' },
        { kind:'block', type:'turn_left' },
        { kind:'block', type:'turn_right' },
        { kind:'block', type:'spin_around' },
        { kind:'block', type:'stop_robot' },
      ],
    },
  ];

  if (isFlying) cats.push({
    kind:'category', name:'✈️ Flight', colour:'#5CB1D6',
    contents:[
      { kind:'block', type:'fly_up' },
      { kind:'block', type:'fly_down' },
      { kind:'block', type:'hover_place' },
    ],
  });

  if (armId) cats.push({
    kind:'category', name:'🦾 Arm', colour:'#59C059',
    contents:[
      { kind:'block', type:'grab_object' },
      { kind:'block', type:'release_object' },
      { kind:'block', type:'extend_arm' },
    ],
  });

  if (sensors.length) cats.push({
    kind:'category', name:'📡 Sensors', colour:'#5CB1D6',
    contents:[
      { kind:'block', type:'scan_area' },
      { kind:'block', type:'look_around' },
    ],
  });

  if (lightId) cats.push({
    kind:'category', name:'💡 Lights', colour:'#9966FF',
    contents:[
      { kind:'block', type:'lights_on' },
      { kind:'block', type:'lights_off' },
      { kind:'block', type:'lights_flash' },
    ],
  });

  return { kind:'categoryToolbox', contents:cats };
}

// ─── Starter program loaded into fresh workspace ──────────────────────────────
const STARTER_PROGRAM = {
  blocks:{
    languageVersion:0,
    blocks:[{
      type:'when_start', id:'bb_start', x:40, y:40,
      next:{ block:{
        type:'repeat_n', id:'bb_repeat',
        fields:{ TIMES:3 },
        inputs:{ DO:{ block:{
          type:'move_forward', id:'bb_fwd',
          fields:{ STEPS:2 },
          next:{ block:{
            type:'turn_right', id:'bb_turn',
            fields:{ DEGREES:90 },
          }},
        }}},
      }},
    }],
  },
};

// ─── Workspace → robotCode compiler ──────────────────────────────────────────
function traverseStack(block) {
  if (!block) return [];
  const out = [];
  const nf  = (name, def) => parseFloat(block.getFieldValue(name)) || def;

  switch (block.type) {
    case 'repeat_n': {
      const times = Math.max(1, Math.min(20, nf('TIMES', 3) | 0));
      const body  = traverseStack(block.getInputTargetBlock('DO'));
      for (let i = 0; i < times; i++) out.push(...body);
      break;
    }
    case 'if_obstacle_c':
      out.push({ id:'if_obstacle', blockId:block.id, label:'If Obstacle', paramValues:{} });
      out.push(...traverseStack(block.getInputTargetBlock('DO')));
      break;
    case 'if_else_c':
      out.push({ id:'if_obstacle', blockId:block.id, label:'If/Else Obstacle', paramValues:{} });
      out.push(...traverseStack(block.getInputTargetBlock('DO')));
      out.push(...traverseStack(block.getInputTargetBlock('ELSE')));
      break;
    case 'wait_sec': {
      const s = nf('SECS', 1);
      out.push({ id:'wait', blockId:block.id, label:`Wait ${s}s`, paramValues:{ seconds:s } });
      break;
    }
    case 'move_forward': {
      const n = nf('STEPS', 2);
      out.push({ id:'move_forward', blockId:block.id, label:`Forward ${n}`, paramValues:{ steps:n } });
      break;
    }
    case 'move_backward': {
      const n = nf('STEPS', 2);
      out.push({ id:'move_backward', blockId:block.id, label:`Backward ${n}`, paramValues:{ steps:n } });
      break;
    }
    case 'turn_left': {
      const d = nf('DEGREES', 90);
      out.push({ id:'turn_left', blockId:block.id, label:`Left ${d}°`, paramValues:{ degrees:d } });
      break;
    }
    case 'turn_right': {
      const d = nf('DEGREES', 90);
      out.push({ id:'turn_right', blockId:block.id, label:`Right ${d}°`, paramValues:{ degrees:d } });
      break;
    }
    case 'spin_around':
      out.push({ id:'spin',  blockId:block.id, label:'Spin', paramValues:{} }); break;
    case 'stop_robot':
      out.push({ id:'stop',  blockId:block.id, label:'Stop', paramValues:{} }); break;
    case 'fly_up':
      out.push({ id:'fly_up', blockId:block.id, label:'Fly Up', paramValues:{} }); break;
    case 'fly_down':
      out.push({ id:'fly_down', blockId:block.id, label:'Fly Down', paramValues:{} }); break;
    case 'hover_place': {
      const s = nf('SECS', 2);
      out.push({ id:'wait', blockId:block.id, label:`Hover ${s}s`, paramValues:{ seconds:s } }); break;
    }
    case 'grab_object':
      out.push({ id:'grab',    blockId:block.id, label:'Grab',    paramValues:{} }); break;
    case 'release_object':
      out.push({ id:'release', blockId:block.id, label:'Release', paramValues:{} }); break;
    case 'extend_arm':
      out.push({ id:'grab',    blockId:block.id, label:'Extend Arm', paramValues:{} }); break;
    case 'scan_area':
      out.push({ id:'scan',  blockId:block.id, label:'Scan', paramValues:{} }); break;
    case 'look_around':
      out.push({ id:'look',  blockId:block.id, label:'Look', paramValues:{} }); break;
    case 'lights_on':
      out.push({ id:'lights_on',  blockId:block.id, label:'Lights On',  paramValues:{} }); break;
    case 'lights_off':
      out.push({ id:'lights_off', blockId:block.id, label:'Lights Off', paramValues:{} }); break;
    case 'lights_flash': {
      const t = nf('TIMES', 3);
      out.push({ id:'flash', blockId:block.id, label:`Flash ×${t}`, paramValues:{ times:t } }); break;
    }
    default: break;
  }
  out.push(...traverseStack(block.getNextBlock()));
  return out;
}

function compileWorkspace(ws) {
  const start = ws.getTopBlocks(true).find(b => b.type === 'when_start');
  if (!start) return [];
  return traverseStack(start.getNextBlock());
}

// ─── Execution helpers (kept from original) ──────────────────────────────────
function getBlockDuration(block) {
  const p = block.paramValues || {};
  switch (block.id) {
    case 'move_forward':  return Math.max(0.4, (p.steps  ||2)*0.75);
    case 'move_backward': return Math.max(0.4, (p.steps  ||1)*0.75);
    case 'turn_left':
    case 'turn_right':    return Math.max(0.25,(p.degrees||90)/90*0.6);
    case 'spin':          return 1.0;
    case 'stop':          return 0.5;
    case 'wait':          return Math.max(0.2, p.seconds||1);
    case 'fly_up':
    case 'fly_down':      return 0.9;
    case 'scan':          return 1.6;
    case 'if_obstacle':   return 0.7;
    case 'look':          return 1.3;
    case 'grab':
    case 'release':       return 0.9;
    case 'lights_on':
    case 'lights_off':    return 0.3;
    case 'flash':         return Math.max(0.5,(p.times||3)*0.3);
    default:              return 0.4;
  }
}

function applyCodeBlock(block, rs, dt, movId) {
  const p   = block.paramValues || {};
  const dur = rs.currentDur || 1;
  const spd = movId==='wheels'?1.0:movId==='tracks'?0.8:movId==='legs'?0.65:movId==='hover'?1.1:movId==='flying'?1.4:movId==='jets'?1.8:1.0;
  switch (block.id) {
    case 'move_forward': {
      const d=(p.steps||2)*1.9*spd;
      rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt;
      rs.totalDist+=(d/dur)*dt; rs.bobPhase=(rs.bobPhase||0)+dt*8; break;
    }
    case 'move_backward': {
      const d=(p.steps||1)*1.9*spd;
      rs.x-=Math.sin(rs.angle)*(d/dur)*dt; rs.z-=Math.cos(rs.angle)*(d/dur)*dt;
      rs.totalDist+=(d/dur)*dt*0.5; rs.bobPhase=(rs.bobPhase||0)+dt*6; break;
    }
    case 'turn_left':  rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'turn_right': rs.angle-=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'spin':       rs.angle+=(Math.PI*2)/dur*dt; break;
    case 'fly_up':     rs.y=Math.min(4.5,(rs.y||0)+2.0/dur*dt); break;
    case 'fly_down':   rs.y=Math.max(0,(rs.y||0)-2.0/dur*dt); break;
    default: break;
  }
}

function getRobotGroundEffect(movId, bobPhase, t) {
  switch (movId) {
    case 'legs':    return { yOffset:Math.abs(Math.sin(bobPhase*2.5))*0.12, rollZ:0 };
    case 'hover':   return { yOffset:Math.sin(t*1.8)*0.15+0.25, rollZ:Math.sin(t*0.9)*0.04 };
    case 'flying':
    case 'jets':    return { yOffset:Math.sin(t*1.2)*0.1+0.3, rollZ:0 };
    case 'tracks':  return { yOffset:0, rollZ:Math.sin(bobPhase*1.5)*0.012 };
    default:        return { yOffset:0, rollZ:Math.sin(bobPhase*1.5)*0.018 };
  }
}

// ─── Arena builder ────────────────────────────────────────────────────────────
function buildArena(scene, challenge) {
  const g = new THREE.Group(); g.name='arena';

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,65),
    new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.3,metalness:0.15}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);

  const lineMat = new THREE.LineBasicMaterial({color:0xdde4ff});
  for(let i=-20;i<=20;i+=2){
    const h=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,0.01,i*1.6),new THREE.Vector3(20,0.01,i*1.6)]);
    const v=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-32),new THREE.Vector3(i,0.01,22)]);
    g.add(new THREE.Line(h,lineMat)); g.add(new THREE.Line(v,lineMat));
  }

  [{w:40,h:5,d:0.3,x:0,    z:-32,ry:0,         c:0x3b82f6},
   {w:40,h:5,d:0.3,x:0,    z: 22,ry:0,         c:0x10b981},
   {w:65,h:5,d:0.3,x:-20.2,z: -5,ry:Math.PI/2, c:0x8b5cf6},
   {w:65,h:5,d:0.3,x: 20.2,z: -5,ry:Math.PI/2, c:0xf59e0b},
  ].forEach(w=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w.w,w.h,w.d),
      new THREE.MeshStandardMaterial({color:w.c,roughness:0.45,metalness:0.3,emissive:new THREE.Color(w.c).multiplyScalar(0.07)}));
    m.position.set(w.x,w.h/2,w.z); m.rotation.y=w.ry; m.castShadow=true; m.receiveShadow=true; g.add(m);
  });

  const strMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.2});
  [-16,-10,-4,2,8,14].forEach(z=>{
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.7),strMat);
    s.position.set(-20.05,2.5,z); g.add(s);
    const s2=s.clone(); s2.position.set(20.05,2.5,z); g.add(s2);
  });

  const startM=new THREE.Mesh(new THREE.PlaneGeometry(6,2.5),
    new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.3}));
  startM.rotation.x=-Math.PI/2; startM.position.set(0,0.015,6); g.add(startM);

  const finM=new THREE.Mesh(new THREE.PlaneGeometry(7,2.5),
    new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.45}));
  finM.rotation.x=-Math.PI/2; finM.position.set(0,0.015,-24); g.add(finM);
  const archMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.4});
  [-2.8,2.8].forEach(x=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,5.5,8),archMat);
    post.position.set(x,2.75,-24); g.add(post);
  });
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,6,8),archMat);
  bar.rotation.z=Math.PI/2; bar.position.set(0,5.5,-24); g.add(bar);

  const oc=[0x3b82f6,0xef4444,0x8b5cf6,0x10b981,0xf59e0b,0xec4899];
  const oPos=[[-1.1,-3],[1.0,-5.5],[-0.6,-8],[1.4,-10.5],[-1.0,-13],[0.5,-15.5],
              [-1.3,-5],[1.1,-7.5],[-0.4,-11],[0.9,-14],[-0.7,-9],[1.2,-12]];
  oPos.slice(0,challenge?.obstacles||10).forEach(([x,z],i)=>{
    const h=0.55+(i%3)*0.38; const col=oc[i%oc.length];
    const geos=[new THREE.BoxGeometry(0.8,h,0.8),new THREE.CylinderGeometry(0.38,0.38,h,8),new THREE.ConeGeometry(0.42,h+0.5,8)];
    const m=new THREE.Mesh(geos[i%3],new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.25,emissive:new THREE.Color(col).multiplyScalar(0.07)}));
    m.position.set(x,h/2,z); m.castShadow=true; m.receiveShadow=true; g.add(m);
  });

  [-6,-13,-20].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.09,8,32),
      new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:0.9,transparent:true,opacity:0.85}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'+z; g.add(ring);
  });

  scene.add(g);
}

// ─── Three.js canvas ──────────────────────────────────────────────────────────
function SimCanvas({ robotConfig, robotCode=[], running, onProgress, onFpsUpdate, challenge }) {
  const wrapRef = useRef(null);
  const rsRef   = useRef({ x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,pass:0,maxPasses:1,done:false,t:0,bobPhase:0,battery:100 });
  const runRef  = useRef(false);
  const fpsRef  = useRef({ frames:0, last:0 });

  useEffect(()=>{ runRef.current=running; },[running]);

  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const W=Math.max(el.clientWidth,1),H=Math.max(el.clientHeight,1);
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0xe8f0fe);
    scene.fog=new THREE.Fog(0xe8f0fe,32,58);
    const camera=new THREE.PerspectiveCamera(48,W/H,0.1,80);
    camera.position.set(0,4,10); camera.lookAt(0,0.5,0);
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xddeeff,0.72));
    const sun=new THREE.DirectionalLight(0xfff8f0,1.6);
    sun.position.set(8,18,10); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-26; sun.shadow.camera.right=26;
    sun.shadow.camera.top=32; sun.shadow.camera.bottom=-32; sun.shadow.bias=-0.001; scene.add(sun);
    scene.add(Object.assign(new THREE.PointLight(0x6699ff,0.8,36),{position:{x:-10,y:6,z:0}}));
    scene.add(Object.assign(new THREE.PointLight(0x99ffdd,0.65,30),{position:{x:10,y:5,z:-10}}));

    buildArena(scene,challenge);

    const rs=rsRef.current;
    const robot=buildRobotModel(robotConfig);
    robot.position.set(rs.x,rs.y,rs.z); robot.rotation.y=rs.angle; robot.scale.setScalar(1.4);
    robot.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
    scene.add(robot);

    const sensors=robotConfig.sensors||[];
    const bColor={ultrasonic:0x00ffff,lidar:0xff6600,camera:0xffff00,gyro:0x00ff88,'line-sensor':0xff00ff};
    const bLen={ultrasonic:4.5,lidar:7,camera:3.5,gyro:2,'line-sensor':2};
    const beams=sensors.slice(0,4).map((s,i)=>{
      const pts=[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-(bLen[s]||3.5))];
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({color:bColor[s]||0xffffff,transparent:true,opacity:0.75}));
      line.position.set((i-1.5)*0.35,0.65,0); line.visible=false; robot.add(line); return line;
    });

    const codeBlocks=robotCode.filter(b=>b.id!=='repeat');
    rs.maxPasses=1;
    const hasCode=codeBlocks.length>0;
    const movId=robotConfig.movementId||'wheels';

    const onResize=()=>{
      const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    };
    const ro=new ResizeObserver(onResize); ro.observe(el);

    const camPos=new THREE.Vector3(0,4,10);
    const camLook=new THREE.Vector3(0,0.5,5);
    let prev=performance.now();
    let rafId;

    const tick=(now)=>{
      rafId=requestAnimationFrame(tick);
      const dt=Math.min((now-prev)/1000,0.05); prev=now;
      fpsRef.current.frames++;
      if(now-fpsRef.current.last>1000){
        onFpsUpdate?.(Math.round(fpsRef.current.frames*1000/(now-fpsRef.current.last)));
        fpsRef.current.frames=0; fpsRef.current.last=now;
      }

      if(runRef.current){
        rs.t+=dt; rs.battery=Math.max(0,100-rs.t*0.5);
        if(hasCode){
          if(!rs.done){
            const block=codeBlocks[rs.step];
            if(block){
              if(rs.stepTime===0) rs.currentDur=getBlockDuration(block);
              rs.stepTime+=dt;
              applyCodeBlock(block,rs,dt,movId);
              const sensing=['scan','if_obstacle','look'].includes(block.id);
              beams.forEach((b,i)=>{ b.visible=sensing; if(sensing) b.material.opacity=0.45+Math.sin(rs.t*6+i)*0.3; });
              if(rs.stepTime>=rs.currentDur){ rs.step++; rs.stepTime=0; rs.currentDur=0; beams.forEach(b=>b.visible=false); }
            }
            if(rs.step>=codeBlocks.length){
              rs.pass++; if(rs.pass<rs.maxPasses) rs.step=0; else rs.done=true;
            }
          }
        } else {
          const speed=movId==='jets'?3.5:movId==='hover'?2.8:2.2;
          rs.angle=Math.PI+Math.sin(rs.totalDist*0.18)*0.28;
          rs.x+=Math.sin(rs.angle)*speed*dt; rs.z+=Math.cos(rs.angle)*speed*dt;
          rs.totalDist+=speed*dt; rs.bobPhase=(rs.bobPhase||0)+dt*8;
          if(rs.z<=-25) rs.done=true;
        }

        const {yOffset,rollZ}=getRobotGroundEffect(movId,rs.bobPhase||0,rs.t);
        robot.position.set(Math.max(-3.8,Math.min(3.8,rs.x)),yOffset+(rs.y||0),rs.z);
        robot.rotation.y=rs.angle; robot.rotation.z=rollZ;

        const progress=rs.done?100:Math.min(
          hasCode?(rs.pass*codeBlocks.length+rs.step)/(codeBlocks.length*Math.max(1,rs.maxPasses))*100
                 :rs.totalDist/(challenge?.totalDist||22)*100, 99);

        onProgress?.({
          time:rs.t, dist:rs.totalDist, battery:rs.battery,
          avoided:Math.min(Math.floor(rs.totalDist/2.2),challenge?.obstacles||10),
          progress:rs.done?100:progress, done:rs.done,
          execBlock:codeBlocks[rs.step]?.label||null,
          execBlockId:codeBlocks[rs.step]?.blockId||null,
        });
        if(rs.done) runRef.current=false;
      } else {
        rs.t+=dt*0.4;
        robot.rotation.y=Math.PI+Math.sin(rs.t*0.7)*0.08;
        robot.position.y=getRobotGroundEffect(movId,rs.t*4,rs.t).yOffset;
      }

      const rx=robot.position.x,rz=robot.position.z;
      const bx=rx+Math.sin(rs.angle+Math.PI)*7.5;
      const bz=rz+Math.cos(rs.angle+Math.PI)*7.5;
      camPos.lerp(new THREE.Vector3(Math.max(-18,Math.min(18,bx)),4.8,Math.max(-29,Math.min(19,bz))),0.045);
      camLook.lerp(new THREE.Vector3(rx,robot.position.y+0.7,rz),0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);

      scene.traverse(c=>{
        if(c.name&&c.name.startsWith('cp')){ c.rotation.z+=dt*0.9; if(c.material) c.material.emissiveIntensity=0.7+Math.sin(rs.t*3)*0.3; }
      });
      renderer.render(scene,camera);
    };
    rafId=requestAnimationFrame(tick);

    return ()=>{
      cancelAnimationFrame(rafId); ro.disconnect();
      if(el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig,challenge]);

  return <div ref={wrapRef} style={{width:'100%',height:'100%'}} />;
}

// ─── Blockly workspace panel ──────────────────────────────────────────────────
function BlocklyPanel({ robotConfig, onCodeChange, execBlockId, blockCount }) {
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);
  const prevHlRef    = useRef(null);

  /* Register blocks once globally */
  useEffect(() => { registerBlocks(); }, []);

  /* Init Blockly workspace (once) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const bbTheme = Blockly.Theme.defineTheme('bytebuddies', {
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: '#f0f4ff',
        toolboxBackgroundColour:   '#1a2233',
        toolboxForegroundColour:   '#e2e8f0',
        flyoutBackgroundColour:    '#243044',
        flyoutForegroundColour:    '#f0f4ff',
        flyoutOpacity:             0.98,
        scrollbarColour:           '#7c3aed',
        scrollbarOpacity:          0.5,
      },
      fontStyle: { family:'"Inter", system-ui, sans-serif', weight:'700', size:11 },
    });

    const ws = Blockly.inject(el, {
      toolbox:  buildToolbox(robotConfig),
      theme:    bbTheme,
      renderer: 'zelos',
      grid:     { spacing:24, length:3, colour:'#dde6ff', snap:true },
      zoom:     { controls:true, wheel:true, startScale:0.9, maxScale:2.0, minScale:0.3, scaleSpeed:1.2 },
      trashcan: true,
      sounds:   false,
      move:     { scrollbars:{ horizontal:true, vertical:true }, drag:true, wheel:false },
    });

    workspaceRef.current = ws;

    /* Load starter program */
    try { Blockly.serialization.workspaces.load(STARTER_PROGRAM, ws); } catch(_) {}

    /* Recompile on any structural change */
    const recompile = () => { onCodeChange?.(compileWorkspace(ws)); };
    ws.addChangeListener(e => { if (!e.isUiEvent) recompile(); });
    setTimeout(recompile, 80); // initial compile after DOM settles

    return () => { ws.dispose(); workspaceRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once

  /* Update toolbox when robot capabilities change */
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    try { ws.updateToolbox(buildToolbox(robotConfig)); } catch(_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    robotConfig?.movementId,
    robotConfig?.armId,
    robotConfig?.lightId,
    (robotConfig?.sensors||[]).join(','),
  ]);

  /* Highlight the currently executing block */
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    const clear = (id) => { if (!id) return; try { ws.highlightBlock(id, false); const b=ws.getBlockById(id); b?.setHighlighted?.(false); } catch(_){} };
    const set   = (id) => { if (!id) return; try { ws.highlightBlock(id, true);  const b=ws.getBlockById(id); b?.setHighlighted?.(true);  } catch(_){} };
    clear(prevHlRef.current);
    set(execBlockId);
    prevHlRef.current = execBlockId;
  }, [execBlockId]);

  return (
    <div className="bb-sim-code-panel">
      <div className="bb-sim-code-header">
        <span className="bb-sim-code-title">🤖 Robot Code</span>
        <span className="bb-sim-code-badge">
          {blockCount > 0 ? `${blockCount} step${blockCount !== 1 ? 's' : ''}` : 'Empty program'}
        </span>
      </div>
      <div ref={containerRef} className="bb-sim-blockly-wrap" />
    </div>
  );
}

// ─── Stat helpers ─────────────────────────────────────────────────────────────
function StatBar({ label, value, color, unit='' }) {
  return (
    <div className="bb-sim-stat-row">
      <div className="bb-sim-stat-label">{label}</div>
      <div className="bb-sim-stat-val" style={{ color }}>{Math.round(value)}{unit}</div>
      <div className="bb-sim-stat-track">
        <div className="bb-sim-stat-fill" style={{ width:`${Math.max(0,Math.min(100,value))}%`, background:color }} />
      </div>
    </div>
  );
}
function StatNum({ label, value, unit='' }) {
  return (
    <div className="bb-sim-stat-num">
      <div className="bb-sim-stat-label">{label}</div>
      <div className="bb-sim-stat-big">{value}<span className="bb-sim-stat-unit">{unit}</span></div>
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────
function ActivityFeed({ events }) {
  const ref = useRef(null);
  useEffect(() => { if(ref.current) ref.current.scrollLeft=ref.current.scrollWidth; }, [events]);
  return (
    <div className="bb-sim-activity">
      <span className="bb-sim-activity-label">ACTIVITY</span>
      <div ref={ref} className="bb-sim-activity-scroll">
        {events.slice(-16).map((ev,i) => (
          <span key={i} className={`bb-sim-activity-item${i===events.slice(-16).length-1?' latest':''}`}>{ev}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main SimulatorPage ───────────────────────────────────────────────────────
export default function SimulatorPage({ robotConfig }) {
  const [robotCode,      setRobotCode]    = useState([]);
  const [running,        setRunning]      = useState(false);
  const [paused,         setPaused]       = useState(false);
  const [stats,          setStats]        = useState(INIT_STATS);
  const [activeChallenge,setChallenge]    = useState(CHALLENGES[0]);
  const [execBlockId,    setExecBlockId]  = useState(null);
  const [execLabel,      setExecLabel]    = useState(null);
  const [activity,       setActivity]     = useState(['🟢 Robot ready — build your code and press Launch!']);
  const [fps,            setFps]          = useState(null);
  const simKeyRef  = useRef(0);
  const [simKey,   setSimKey]  = useState(0);
  const prevProgRef = useRef(0);

  const handleCodeChange = useCallback(code => setRobotCode(code), []);

  const handleProgress = useCallback(data => {
    setStats({ time:data.time, dist:data.dist, battery:data.battery, avoided:data.avoided, progress:data.progress });
    if (data.execBlockId !== undefined) { setExecBlockId(data.execBlockId||null); setExecLabel(data.execBlock||null); }
    const cp = Math.floor(data.progress/34);
    if (cp > Math.floor(prevProgRef.current/34)) setActivity(a=>[...a,`🏁 Checkpoint ${cp}!`]);
    prevProgRef.current = data.progress;
    if (data.done) {
      setRunning(false); setPaused(false); setExecBlockId(null); setExecLabel(null);
      setActivity(a=>[...a,'🏆 Challenge complete! Great job!']);
    }
  }, []);

  const doStart = useCallback(() => {
    setStats(INIT_STATS); prevProgRef.current=0;
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunning(true); setPaused(false); setExecBlockId(null); setExecLabel(null);
    setActivity([
      `🚀 ${robotConfig?.name||'Robot'} launching…`,
      `📋 Program: ${robotCode.length} step${robotCode.length!==1?'s':''}`,
      `🏁 ${activeChallenge.name}`,
      robotCode.length===0 ? '⚡ Auto-navigation mode' : '▶ Running your Blockly code!',
    ]);
  }, [robotConfig, robotCode, activeChallenge]);

  const doStop = useCallback(() => {
    setRunning(false); setPaused(false); setStats(INIT_STATS); prevProgRef.current=0;
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setExecBlockId(null); setExecLabel(null);
    setActivity(['🟡 Stopped — edit your code and try again!']);
  }, []);

  const doPause = useCallback(() => {
    setPaused(p => { setActivity(a=>[...a, p?'▶ Resumed':'⏸ Paused']); return !p; });
  }, []);

  const battColor = stats.battery>60?'#22c55e':stats.battery>30?'#f59e0b':'#ef4444';

  return (
    <div className="bb-sim-root">

      {/* ── Top bar ── */}
      <div className="bb-sim-topbar">
        <div className="bb-sim-topbar-left">
          <span className="bb-sim-ch-icon">{activeChallenge.icon}</span>
          <span className="bb-sim-ch-title">{activeChallenge.name}</span>
          <span className="bb-sim-ch-diff" style={{ background:activeChallenge.color+'22', color:activeChallenge.color }}>
            {activeChallenge.difficulty}
          </span>
        </div>
        <div className="bb-sim-topbar-center">
          <div className={`bb-sim-status-pill ${running?(paused?'paused':'running'):''}`}>
            <span className="bb-sim-status-dot" />
            {running?(paused?'Paused':'Simulating'):'Ready'}
          </div>
          {fps!==null && (
            <span className="bb-sim-fps" style={{color:fps>=50?'#22c55e':fps>=30?'#f59e0b':'#ef4444'}}>
              {fps} FPS
            </span>
          )}
        </div>
        <div className="bb-sim-topbar-right">
          {!running ? (
            <button className="bb-sim-btn launch" onClick={doStart}>▶ Launch</button>
          ) : (
            <>
              <button className="bb-sim-btn pause" onClick={doPause}>{paused?'▶ Resume':'⏸ Pause'}</button>
              <button className="bb-sim-btn stop"  onClick={doStop}>⏹ Stop</button>
            </>
          )}
          {!running && stats.progress>0 && (
            <button className="bb-sim-btn reset" onClick={doStop}>↺ Reset</button>
          )}
        </div>
      </div>

      {/* ── Body (3 columns) ── */}
      <div className="bb-sim-body">

        {/* LEFT – Blockly workspace */}
        <BlocklyPanel
          robotConfig={robotConfig}
          onCodeChange={handleCodeChange}
          execBlockId={execBlockId}
          blockCount={robotCode.length}
        />

        {/* CENTER – 3D simulator */}
        <div className="bb-sim-viewport">
          <SimCanvas
            key={simKey}
            robotConfig={robotConfig}
            robotCode={robotCode}
            running={running&&!paused}
            onProgress={handleProgress}
            onFpsUpdate={setFps}
            challenge={activeChallenge}
          />

          {/* Progress bar */}
          {running && (
            <div className="bb-sim-prog-bar">
              <div className="bb-sim-prog-fill" style={{width:stats.progress+'%',background:activeChallenge.color}} />
            </div>
          )}

          {/* Executing-block overlay */}
          {running && !paused && execLabel && (
            <div className="bb-sim-exec-bubble">
              <span className="bb-sim-exec-dot" />
              {execLabel}
            </div>
          )}

          {/* Launch prompt */}
          {!running && stats.progress===0 && (
            <div className="bb-sim-launch-hint">
              <span style={{fontSize:22}}>{activeChallenge.icon}</span>
              <div>
                <div className="bb-sim-launch-hint-title">{activeChallenge.name}</div>
                <div className="bb-sim-launch-hint-sub">
                  {robotCode.length>0 ? `${robotCode.length} blocks ready` : 'Build your code on the left, then launch!'}
                </div>
              </div>
              <button className="bb-sim-btn launch" onClick={doStart}>▶ Launch!</button>
            </div>
          )}
        </div>

        {/* RIGHT – stats + challenge picker */}
        <div className="bb-sim-right">

          <div className="bb-sim-robot-card">
            <div className="bb-sim-robot-name">{robotConfig?.name||'My Robot'}</div>
            <div className="bb-sim-robot-sub">
              {robotConfig?.chassisId||'rover'} · {robotConfig?.movementId||'wheels'}
              {(robotConfig?.sensors?.length||0)>0&&` · ${robotConfig.sensors.length} sensors`}
            </div>
          </div>

          <div className="bb-sim-stats-block">
            <StatBar label="Battery"   value={stats.battery}       color={battColor} unit="%" />
            <StatNum label="Distance"  value={stats.dist.toFixed(1)} unit="m" />
            <StatNum label="Time"
              value={`${String(Math.floor(stats.time/60)).padStart(2,'0')}:${String(Math.floor(stats.time%60)).padStart(2,'0')}`} />
            <StatNum label="Obstacles" value={stats.avoided} />
          </div>

          <div className="bb-sim-ch-section-label">Challenges</div>
          <div className="bb-sim-ch-list">
            {CHALLENGES.map(ch=>{
              const active=ch.id===activeChallenge.id;
              return (
                <button key={ch.id}
                  className={`bb-sim-ch-row ${active?'active':''}`}
                  style={active?{borderLeftColor:ch.color,background:ch.color+'18'}:{}}
                  onClick={()=>!running&&setChallenge(ch)}
                  disabled={running&&!active}
                >
                  <span className="bb-sim-ch-row-icon">{ch.icon}</span>
                  <div className="bb-sim-ch-row-info">
                    <span className="bb-sim-ch-row-name">{ch.name}</span>
                    <span className="bb-sim-ch-row-diff"
                      style={{background:ch.color+'22',color:ch.color}}>{ch.difficulty}</span>
                  </div>
                  {active&&stats.progress>0&&(
                    <span className="bb-sim-ch-row-pct">{Math.round(stats.progress)}%</span>
                  )}
                </button>
              );
            })}
          </div>

          {running&&(
            <div className="bb-sim-running-bar">
              <div className="bb-sim-running-label">Running…</div>
              <div className="bb-sim-running-track">
                <div className="bb-sim-running-fill" style={{width:stats.progress+'%',background:activeChallenge.color}} />
              </div>
              <div className="bb-sim-running-pct">{Math.round(stats.progress)}%</div>
            </div>
          )}

          {!running&&stats.progress>=100&&(
            <div className="bb-sim-complete">
              <div style={{fontSize:30}}>🏆</div>
              <div className="bb-sim-complete-title">Complete!</div>
              <div className="bb-sim-complete-sub">{stats.dist.toFixed(1)}m · {Math.floor(stats.time)}s</div>
              <button className="bb-sim-btn launch" style={{width:'100%',marginTop:8}} onClick={doStart}>
                ▶ Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <ActivityFeed events={activity} />
    </div>
  );
}
