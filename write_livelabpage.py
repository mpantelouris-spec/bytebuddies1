#!/usr/bin/env python3
"""Writes the new LiveLabPage.jsx — 3-column immersive lab with CSS Blockly blocks."""
import os, textwrap

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(ROOT, "src", "virtual-robot-designer", "studio", "LiveLabPage.jsx")

JSX = r"""/**
 * LiveLabPage.jsx — ByteBuddies Live Robot Lab
 * One immersive page: Blockly-style code (left) | 3D arena hero (center) | robot systems (right)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { buildRobotModel } from '../services/studio-robot-builder.js';
import './LiveLabPage.css';

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const CATS = [
  { id:'move',    label:'Move',    icon:'🏃', color:'#3b82f6' },
  { id:'sense',   label:'Sense',   icon:'📡', color:'#22c55e' },
  { id:'control', label:'Control', icon:'🔁', color:'#f97316' },
  { id:'ai',      label:'AI',      icon:'🧠', color:'#a855f7' },
  { id:'tools',   label:'Tools',   icon:'🔧', color:'#ec4899' },
  { id:'lights',  label:'Lights',  icon:'💡', color:'#06b6d4' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const BDEFS = [
  // ── MOVEMENT (blue) ──────────────────────────────────────────────────────
  { id:'move_forward',  cat:'move', bt:'stack', icon:'⬆',  label:'Move Forward',  requires:null,               params:[{name:'steps',   type:'range',  min:1,max:10,default:3,  unit:' steps'}] },
  { id:'move_backward', cat:'move', bt:'stack', icon:'⬇',  label:'Reverse',       requires:null,               params:[{name:'steps',   type:'range',  min:1,max:10,default:1,  unit:' steps'}] },
  { id:'turn_left',     cat:'move', bt:'stack', icon:'↺',  label:'Turn Left',     requires:null,               params:[{name:'degrees', type:'select', options:[45,90,135,180], default:90, unit:'°'}] },
  { id:'turn_right',    cat:'move', bt:'stack', icon:'↻',  label:'Turn Right',    requires:null,               params:[{name:'degrees', type:'select', options:[45,90,135,180], default:90, unit:'°'}] },
  { id:'spin',          cat:'move', bt:'stack', icon:'🌀', label:'Spin Around',   requires:null,               params:[] },
  { id:'stop',          cat:'move', bt:'stack', icon:'⏹', label:'Stop',          requires:null,               params:[] },
  { id:'set_speed',     cat:'move', bt:'stack', icon:'⚡', label:'Set Speed',    requires:null,               params:[{name:'speed', type:'select', options:['slow','medium','fast','turbo'], default:'medium'}] },
  { id:'patrol',        cat:'move', bt:'stack', icon:'🔄', label:'Patrol',        requires:null,               params:[{name:'laps',    type:'range',  min:1,max:5,default:2,   unit:'x'}] },
  { id:'fly_up',        cat:'move', bt:'stack', icon:'🚀', label:'Fly Up',        requires:['flying','jets'],  params:[{name:'height',  type:'range',  min:1,max:5,default:2,   unit:'m'}] },
  { id:'fly_down',      cat:'move', bt:'stack', icon:'📉', label:'Fly Down',      requires:['flying','jets'],  params:[{name:'height',  type:'range',  min:1,max:5,default:2,   unit:'m'}] },
  { id:'hover_hold',    cat:'move', bt:'stack', icon:'🛸', label:'Hover',         requires:['hover'],          params:[{name:'seconds', type:'range',  min:0.5,max:3,step:0.5,default:1, unit:'s'}] },
  { id:'jump',          cat:'move', bt:'stack', icon:'⬆',  label:'Jump',          requires:['legs'],           params:[] },
  // ── SENSORS (green) ──────────────────────────────────────────────────────
  { id:'scan',           cat:'sense', bt:'stack', icon:'📡', label:'Scan Distance',  requires:['ultrasonic','lidar'],  params:[] },
  { id:'obstacle_ahead', cat:'sense', bt:'bool',  icon:'🚧', label:'Obstacle Ahead?', requires:['ultrasonic','lidar'], params:[] },
  { id:'line_below',     cat:'sense', bt:'bool',  icon:'〰', label:'Line Below?',     requires:['line_sensor'],        params:[] },
  { id:'see_object',     cat:'sense', bt:'bool',  icon:'👁', label:'See Object?',     requires:['camera'],             params:[] },
  { id:'collision',      cat:'sense', bt:'bool',  icon:'💥', label:'Collision?',      requires:null,                   params:[] },
  { id:'battery_low',    cat:'sense', bt:'bool',  icon:'🔋', label:'Battery Low?',    requires:null,                   params:[] },
  { id:'if_obstacle',    cat:'sense', bt:'stack', icon:'🚧', label:'If Obstacle →',  requires:['ultrasonic','lidar'],  params:[{name:'action', type:'select', options:['turn left','turn right','stop','back up'], default:'turn left'}] },
  { id:'look',           cat:'sense', bt:'stack', icon:'👁', label:'Look Around',    requires:['camera'],             params:[] },
  // ── CONTROL (orange) ─────────────────────────────────────────────────────
  { id:'wait',    cat:'control', bt:'stack', icon:'⏸', label:'Wait',    requires:null, params:[{name:'seconds', type:'range', min:0.5,max:5,step:0.5,default:1, unit:'s'}] },
  { id:'repeat',  cat:'control', bt:'c',     icon:'🔁', label:'Repeat',  requires:null, params:[{name:'times',   type:'range', min:2,max:10,default:3, unit:'x'}] },
  { id:'forever', cat:'control', bt:'c',     icon:'♾', label:'Forever', requires:null, params:[] },
  { id:'if_then', cat:'control', bt:'c',     icon:'❓', label:'If ... Then', requires:null, params:[] },
  // ── AI (purple) ──────────────────────────────────────────────────────────
  { id:'avoid_obstacle', cat:'ai', bt:'stack', icon:'🛡', label:'Avoid Obstacle', requires:['ultrasonic','lidar'], params:[] },
  { id:'follow_line',    cat:'ai', bt:'stack', icon:'〰', label:'Follow Line',   requires:['line_sensor'],        params:[{name:'steps', type:'range', min:2,max:10,default:4, unit:' steps'}] },
  { id:'patrol_area',    cat:'ai', bt:'stack', icon:'🔄', label:'Patrol Area',   requires:null,                   params:[{name:'laps',  type:'range', min:1,max:5, default:2, unit:'x'}] },
  { id:'follow_target',  cat:'ai', bt:'stack', icon:'🎯', label:'Follow Target', requires:['camera'],             params:[{name:'steps', type:'range', min:2,max:8, default:3, unit:' steps'}] },
  { id:'return_home',    cat:'ai', bt:'stack', icon:'🏠', label:'Return Home',   requires:null,                   params:[] },
  { id:'search_area',    cat:'ai', bt:'stack', icon:'🔍', label:'Search Area',   requires:null,                   params:[{name:'radius',type:'range', min:1,max:5, default:2, unit:'m'}] },
  // ── TOOLS (pink) ─────────────────────────────────────────────────────────
  { id:'grab',        cat:'tools', bt:'stack', icon:'✊', label:'Grab Object',  requires:['grabber','claw'],   params:[] },
  { id:'release',     cat:'tools', bt:'stack', icon:'👐',label:'Release',       requires:['grabber','claw'],   params:[] },
  { id:'rotate_arm',  cat:'tools', bt:'stack', icon:'🦾', label:'Rotate Arm',   requires:['grabber','claw'],   params:[{name:'degrees', type:'select', options:[30,45,90,180], default:90, unit:'°'}] },
  { id:'drill',       cat:'tools', bt:'stack', icon:'🔩', label:'Drill',        requires:['drill'],            params:[{name:'seconds', type:'range', min:1,max:5,default:2, unit:'s'}] },
  { id:'fire_laser',  cat:'tools', bt:'stack', icon:'⚡', label:'Fire Laser',   requires:['laser'],            params:[] },
  { id:'scan_object', cat:'tools', bt:'stack', icon:'📷', label:'Scan Object',  requires:['camera'],           params:[] },
  // ── LIGHTS & SOUND (cyan) ────────────────────────────────────────────────
  { id:'lights_on',  cat:'lights', bt:'stack', icon:'💡', label:'LEDs On',       requires:null, params:[] },
  { id:'lights_off', cat:'lights', bt:'stack', icon:'🌑', label:'LEDs Off',      requires:null, params:[] },
  { id:'flash',      cat:'lights', bt:'stack', icon:'✨', label:'Flash Lights',  requires:null, params:[{name:'times', type:'range', min:1,max:5,default:3, unit:'x'}] },
  { id:'rainbow',    cat:'lights', bt:'stack', icon:'🌈', label:'Rainbow Mode',  requires:null, params:[] },
  { id:'play_sound', cat:'lights', bt:'stack', icon:'🔊', label:'Play Sound',    requires:null, params:[{name:'sound', type:'select', options:['beep','laser','victory','alarm'], default:'beep'}] },
  { id:'robot_voice',cat:'lights', bt:'stack', icon:'🤖', label:'Robot Voice',   requires:null, params:[] },
];

function isUnlocked(block, rc) {
  if (!block.requires) return true;
  const req = block.requires;
  const movTypes = ['wheels','wheels6','tracks','legs','flying','jets','hover'];
  if (req.some(r => movTypes.includes(r))) return req.includes(rc.movementId);
  if (req.some(r => ['ultrasonic','lidar','camera','line_sensor'].includes(r)))
    return (rc.sensors||[]).some(s => req.includes(s));
  if (req.some(r => ['grabber','claw','drill','laser'].includes(r)))
    return (rc.tools||[]).some(t => req.includes(t));
  if (req.some(r => r.startsWith('led') || ['searchlight','strobes','ring'].includes(r)))
    return req.includes(rc.lightId);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART ROBOT PROFILES
// ─────────────────────────────────────────────────────────────────────────────
function getSmartProfile(rc) {
  const mov = rc.movementId || 'wheels';
  const tools = rc.tools || [];
  if (mov === 'flying' || mov === 'jets') {
    return {
      arenaType:'sky', arenaLabel:'Sky Testing Facility', tipIcon:'✈️', tip:'Great for aerial challenges!',
      challenges:[
        { id:'ring_dash',  name:'Ring Dash',          icon:'💫', desc:'Fly through all the sky rings!',     color:'#0ea5e9', obstacles:5,  totalDist:25 },
        { id:'altitude',   name:'Altitude Challenge',  icon:'🚀', desc:'Reach maximum altitude fastest!',   color:'#7c3aed', obstacles:3,  totalDist:20 },
        { id:'sky_maze',   name:'Sky Maze',            icon:'🌀', desc:'Navigate the aerial obstacle maze.',color:'#ec4899', obstacles:8,  totalDist:30 },
        { id:'cargo_drop', name:'Cargo Drop',          icon:'📦', desc:'Drop cargo onto the target zones.', color:'#f59e0b', obstacles:4,  totalDist:22 },
      ],
    };
  }
  if (mov === 'hover') {
    return {
      arenaType:'hover', arenaLabel:'Anti-Gravity Arena', tipIcon:'🛸', tip:'Built for hover challenges!',
      challenges:[
        { id:'platform_hop',  name:'Platform Hop',   icon:'🔵', desc:'Hop between floating platforms!', color:'#06b6d4', obstacles:5, totalDist:22 },
        { id:'antigrav_race', name:'Anti-Grav Race',  icon:'⚡', desc:'Float through the energy gates!', color:'#7c3aed', obstacles:4, totalDist:18 },
        { id:'float_fetch',   name:'Float & Fetch',   icon:'💎', desc:'Collect gems in mid-air!',        color:'#0ea5e9', obstacles:6, totalDist:25 },
        { id:'hover_maze',    name:'Hover Maze',      icon:'🌀', desc:'Find your way through the maze!', color:'#f59e0b', obstacles:9, totalDist:30 },
      ],
    };
  }
  if (mov === 'legs') {
    return {
      arenaType:'terrain', arenaLabel:'Terrain Traversal Zone', tipIcon:'🕷️', tip:'Optimised for climbing!',
      challenges:[
        { id:'terrain_trek', name:'Terrain Trek',    icon:'🏔️', desc:'Cross the rough terrain!',         color:'#10b981', obstacles:6, totalDist:25 },
        { id:'step_stones',  name:'Stepping Stones', icon:'🪨', desc:'Jump across the stepping stones!', color:'#f59e0b', obstacles:5, totalDist:20 },
        { id:'wall_climb',   name:'Wall Climb',      icon:'🧗', desc:'Scale the vertical walls!',        color:'#ef4444', obstacles:7, totalDist:28 },
        { id:'speed_walk',   name:'Speed Walk',      icon:'⚡', desc:'Race on four legs!',               color:'#8b5cf6', obstacles:4, totalDist:18 },
      ],
    };
  }
  if (mov === 'tracks') {
    return {
      arenaType:'rough', arenaLabel:'Rough Terrain Course', tipIcon:'🚜', tip:'Great for heavy terrain!',
      challenges:[
        { id:'obstacle',   name:'Obstacle Course', icon:'🏁', desc:'Crush through the obstacle course!', color:'#22c55e', obstacles:10, totalDist:22 },
        { id:'cargo_push', name:'Cargo Push',      icon:'📦', desc:'Push heavy cargo to the target!',   color:'#f59e0b', obstacles:5,  totalDist:18 },
        { id:'rough_run',  name:'Rough Run',       icon:'🪨', desc:'Tackle the rocky environment!',     color:'#8b5cf6', obstacles:12, totalDist:30 },
        { id:'ramp_king',  name:'Ramp King',       icon:'🏔️', desc:'Climb all the ramps to the top!',  color:'#0ea5e9', obstacles:6,  totalDist:22 },
      ],
    };
  }
  if (tools.includes('grabber') || tools.includes('claw')) {
    return {
      arenaType:'factory', arenaLabel:'Industrial Workstation', tipIcon:'🦾', tip:'This robot can carry cargo!',
      challenges:[
        { id:'sorting',  name:'Sorting Line',  icon:'🏭', desc:'Sort the coloured boxes!',           color:'#0ea5e9', obstacles:5, totalDist:15 },
        { id:'stacking', name:'Tower Builder', icon:'📦', desc:'Stack boxes as high as you can!',    color:'#22c55e', obstacles:4, totalDist:12 },
        { id:'assembly', name:'Assembly Task', icon:'🔩', desc:'Assemble all the parts correctly!',  color:'#f59e0b', obstacles:6, totalDist:18 },
        { id:'delivery', name:'Delivery Run',  icon:'🚚', desc:'Deliver cargo to the dropoff!',      color:'#8b5cf6', obstacles:5, totalDist:16 },
      ],
    };
  }
  return {
    arenaType:'ground', arenaLabel:'STEM Challenge Arena', tipIcon:'🤖', tip:'Perfect for maze navigation!',
    challenges:[
      { id:'obstacle', name:'Obstacle Course', icon:'🏁', desc:'Navigate obstacles to the finish!', color:'#22c55e', obstacles:10, totalDist:22 },
      { id:'speedrun', name:'Speed Run',        icon:'⚡', desc:'Beat the clock, full speed!',       color:'#f59e0b', obstacles:5,  totalDist:16 },
      { id:'maze',     name:'Maze Navigator',   icon:'🌀', desc:'Find the exit through the maze!',   color:'#8b5cf6', obstacles:18, totalDist:30 },
      { id:'collect',  name:'Cargo Run',        icon:'📦', desc:'Pick up all the cargo boxes!',      color:'#0ea5e9', obstacles:6,  totalDist:20 },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ARENA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function _groundArena(scene, ch) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0xe8f0fe);
  scene.fog = new THREE.Fog(0xe8f0fe, 32, 58);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,65),
    new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.3,metalness:0.15}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; g.add(floor);
  const lm = new THREE.LineBasicMaterial({color:0xdde4ff});
  for(let i=-20;i<=20;i+=2){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,0.01,i*1.6),new THREE.Vector3(20,0.01,i*1.6)]),lm));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-32),new THREE.Vector3(i,0.01,22)]),lm));
  }
  [[40,5,0.3,0,-32,0,0x3b82f6],[40,5,0.3,0,22,0,0x10b981],[65,5,0.3,-20.2,-5,Math.PI/2,0x8b5cf6],[65,5,0.3,20.2,-5,Math.PI/2,0xf59e0b]].forEach(([ww,wh,wd,wx,wz,wr,wc])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(ww,wh,wd),new THREE.MeshStandardMaterial({color:wc,roughness:0.45,metalness:0.3,emissive:new THREE.Color(wc).multiplyScalar(0.07)}));
    m.position.set(wx,wh/2,wz); m.rotation.y=wr; m.castShadow=true; g.add(m);
  });
  const sm=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.2});
  [-16,-10,-4,2,8,14].forEach(z=>{
    [-20.05,20.05].forEach(x=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.7),sm); s.position.set(x,2.5,z); g.add(s); });
  });
  const startM=new THREE.Mesh(new THREE.PlaneGeometry(6,2.5),new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.3}));
  startM.rotation.x=-Math.PI/2; startM.position.set(0,0.015,6); g.add(startM);
  const finM=new THREE.Mesh(new THREE.PlaneGeometry(7,2.5),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.45}));
  finM.rotation.x=-Math.PI/2; finM.position.set(0,0.015,-24); g.add(finM);
  const am=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.4});
  [-2.8,2.8].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,5.5,8),am); p.position.set(x,2.75,-24); g.add(p); });
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,6,8),am); bar.rotation.z=Math.PI/2; bar.position.set(0,5.5,-24); g.add(bar);
  const oc=[0x3b82f6,0xef4444,0x8b5cf6,0x10b981,0xf59e0b,0xec4899];
  [[-1.1,-3],[1.0,-5.5],[-0.6,-8],[1.4,-10.5],[-1.0,-13],[0.5,-15.5],[-1.3,-5],[1.1,-7.5],[-0.4,-11],[0.9,-14]].slice(0,ch.obstacles||8).forEach(([ox,oz],i)=>{
    const h=0.55+(i%3)*0.38; const col=oc[i%oc.length];
    const geos=[new THREE.BoxGeometry(0.8,h,0.8),new THREE.CylinderGeometry(0.38,0.38,h,8),new THREE.ConeGeometry(0.42,h+0.5,8)];
    const m=new THREE.Mesh(geos[i%3],new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.25}));
    m.position.set(ox,h/2,oz); m.castShadow=true; g.add(m);
  });
  [-6,-13,-20].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.09,8,32),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:0.9,transparent:true,opacity:0.85}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'; g.add(ring);
  });
  const labC=[0x1e40af,0x7e22ce,0x065f46,0x9a3412];
  [-14,-7,0,7].forEach((z,i)=>{
    [-18.5,18.5].forEach(x=>{
      const panel=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.9,0.2),new THREE.MeshStandardMaterial({color:labC[i%4],roughness:0.3,metalness:0.6}));
      panel.position.set(x,2,z); g.add(panel);
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.15),new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:0.85}));
      screen.position.set(x<0?x+0.15:x-0.15,2,z); screen.rotation.y=x<0?Math.PI/2:-Math.PI/2; g.add(screen);
    });
  });
  scene.add(g);
}

function _skyArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0xb0d8f8, 28, 60);
  const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.9});
  [[-8,6,-10],[5,9,-18],[-5,11,-25],[8,7,-5],[0,8,-30]].forEach(([cx,cy,cz])=>{
    [0.8,1.4,0.9].forEach((r,ci)=>{ const c=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),cloudMat); c.position.set(cx+ci*r*1.3,cy,cz); g.add(c); });
  });
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,0.3,16),new THREE.MeshStandardMaterial({color:0x1e40af,metalness:0.6,roughness:0.3}));
  pad.position.set(0,0,6); g.add(pad);
  const padTop=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,0.05,16),new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.4}));
  padTop.position.set(0,0.18,6); g.add(padTop);
  const ringColors=[0x00d9ff,0xfbbf24,0xef4444,0x22c55e,0x8b5cf6];
  [[-8,2.5,-5],[0,4,-10],[7,5.5,-16],[-6,3.5,-22],[3,6,-28]].forEach(([rx,ry,rz],i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.15,8,32),new THREE.MeshStandardMaterial({color:ringColors[i],emissive:ringColors[i],emissiveIntensity:1.0,transparent:true,opacity:0.88}));
    ring.rotation.y=Math.PI/4; ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
  });
  [[4,1,-8],[-5,2.5,-15],[3,3.5,-22]].forEach(([px,py,pz])=>{
    const plat=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.25,3.5),new THREE.MeshStandardMaterial({color:0x7c3aed,metalness:0.5,roughness:0.3,emissive:0x7c3aed,emissiveIntensity:0.15}));
    plat.position.set(px,py,pz); g.add(plat);
  });
  const finPlat=new THREE.Mesh(new THREE.BoxGeometry(5,0.3,5),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.5}));
  finPlat.position.set(0,5.5,-30); g.add(finPlat);
  scene.add(g);
}

function _terrainArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x2d5a27);
  scene.fog = new THREE.Fog(0x2d5a27, 30, 56);
  const terrainMat=new THREE.MeshStandardMaterial({color:0x5a7c45,roughness:0.9});
  for(let tx=-3;tx<=3;tx++) for(let tz=-10;tz<=3;tz++){
    const h=0.05+Math.sin(tx*1.3+tz*0.7)*0.12+Math.cos(tx*0.8-tz*1.1)*0.08;
    const tile=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.2+h,2.4),terrainMat);
    tile.position.set(tx*2.4,(0.2+h)/2-0.1,tz*2.4); tile.receiveShadow=true; g.add(tile);
  }
  const stoneMat=new THREE.MeshStandardMaterial({color:0x9ca3af,roughness:0.8});
  [[-2,0.35,-4],[-1,0.5,-6],[0,0.4,-7.5],[1,0.55,-9],[-1,0.4,-11],[0,0.5,-13]].forEach(([sx,sy,sz])=>{
    const stone=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.85,0.28,8),stoneMat);
    stone.position.set(sx,sy,sz); stone.castShadow=true; g.add(stone);
  });
  const trunkMat=new THREE.MeshStandardMaterial({color:0x4a3728});
  const leafMat=new THREE.MeshStandardMaterial({color:0x22c55e,roughness:0.9});
  [[-8,0,-8],[8,0,-5],[-9,0,-16],[9,0,-20]].forEach(([tx,ty,tz])=>{
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,1.5,8),trunkMat);
    trunk.position.set(tx,0.75,tz); g.add(trunk);
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.2,8),leafMat);
    leaf.position.set(tx,2.35,tz); g.add(leaf);
  });
  [-7,-14,-21].forEach(z=>{
    const arch=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.12,8,24),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:1.0}));
    arch.rotation.x=Math.PI/2; arch.position.set(0,0.5,z); arch.name='cp'; g.add(arch);
  });
  const startPad=new THREE.Mesh(new THREE.CylinderGeometry(2,2,0.12,16),new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.4}));
  startPad.position.set(0,0.06,5); g.add(startPad);
  scene.add(g);
}

function _hoverArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0a0a2e);
  scene.fog = new THREE.Fog(0x0a0a2e, 28, 55);
  const gridMat=new THREE.LineBasicMaterial({color:0x1e3a5f,transparent:true,opacity:0.5});
  for(let i=-20;i<=20;i+=3){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,-3,i),new THREE.Vector3(20,-3,i)]),gridMat));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,-3,-32),new THREE.Vector3(i,-3,22)]),gridMat));
  }
  const launchPad=new THREE.Mesh(new THREE.BoxGeometry(4,0.2,4),new THREE.MeshStandardMaterial({color:0x1e40af,metalness:0.8,roughness:0.2,emissive:0x1e40af,emissiveIntensity:0.2}));
  launchPad.position.set(0,0,5); g.add(launchPad);
  const platC=[0x7c3aed,0x0ea5e9,0xec4899,0x22c55e,0xf59e0b];
  [[-3,0.5,-4],[3,1,-8],[-2,1.5,-13],[3,2,-18],[-3,2.5,-23]].forEach(([px,py,pz],i)=>{
    const plat=new THREE.Mesh(new THREE.BoxGeometry(4,0.2,4),new THREE.MeshStandardMaterial({color:platC[i%platC.length],metalness:0.7,roughness:0.2,emissive:new THREE.Color(platC[i%platC.length]).multiplyScalar(0.15)}));
    plat.position.set(px,py,pz); g.add(plat);
    const glow=new THREE.PointLight(platC[i%platC.length],0.8,4); glow.position.set(px,py-0.5,pz); g.add(glow);
    const ering=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.06,8,32),new THREE.MeshStandardMaterial({color:platC[i%platC.length],emissive:platC[i%platC.length],emissiveIntensity:0.8,transparent:true,opacity:0.7}));
    ering.rotation.x=Math.PI/2; ering.position.set(px,py+0.15,pz); ering.name='cp'; g.add(ering);
  });
  [-5,-10,-16,-22].forEach((z,i)=>{
    const obs=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.5,1.2),new THREE.MeshStandardMaterial({color:0xef4444,metalness:0.5,emissive:0xef4444,emissiveIntensity:0.3}));
    obs.position.set(i%2===0?-4:4,1+i*0.5,z); obs.name='mover'+i; g.add(obs);
  });
  const finPlat=new THREE.Mesh(new THREE.BoxGeometry(5,0.25,5),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.6}));
  finPlat.position.set(0,3,-28); g.add(finPlat);
  scene.add(g);
}

function _roughArena(scene, ch) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x3d2b1f);
  scene.fog = new THREE.Fog(0x3d2b1f, 30, 56);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,65),new THREE.MeshStandardMaterial({color:0x5c3d2e,roughness:0.95}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const rockMat=new THREE.MeshStandardMaterial({color:0x78716c,roughness:0.9});
  [[-3,-5],[2,-8],[-4,-12],[3,-15],[-2,-19],[1,-22],[-5,-9],[4,-6]].forEach(([rx,rz])=>{
    const h=0.4+Math.abs(rx)*0.1;
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(h,0),rockMat);
    rock.position.set(rx,h*0.4,rz); rock.castShadow=true; g.add(rock);
  });
  const rampMat=new THREE.MeshStandardMaterial({color:0x57534e,roughness:0.7,metalness:0.2});
  [[-2,-7,0.22],[ 2,-14,-0.2],[0,-20,0.15]].forEach(([rx,rz,rot])=>{
    const ramp=new THREE.Mesh(new THREE.BoxGeometry(5,0.25,3.8),rampMat);
    ramp.position.set(rx,0.3,rz); ramp.rotation.z=rot; ramp.castShadow=true; g.add(ramp);
  });
  const cargoMat=new THREE.MeshStandardMaterial({color:0xd97706,roughness:0.5,metalness:0.3});
  [[-1,-4],[1,-6],[-2,-10],[0,-13],[2,-17]].forEach(([cx,cz])=>{
    const cargo=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.2),cargoMat);
    cargo.position.set(cx,0.6,cz); cargo.castShadow=true; g.add(cargo);
  });
  [-8,-15,-22].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.12,8,32),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.6,z); ring.name='cp'; g.add(ring);
  });
  [[40,5,0.35,0,-32,0,0x57534e],[40,5,0.35,0,22,0,0x57534e],[65,5,0.35,-20.2,-5,Math.PI/2,0x44403c],[65,5,0.35,20.2,-5,Math.PI/2,0x44403c]].forEach(([ww,wh,wd,wx,wz,wr,wc])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(ww,wh,wd),new THREE.MeshStandardMaterial({color:wc,roughness:0.7}));
    m.position.set(wx,wh/2,wz); m.rotation.y=wr; g.add(m);
  });
  scene.add(g);
}

function _factoryArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 25, 50);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,40),new THREE.MeshStandardMaterial({color:0x374151,roughness:0.6,metalness:0.4}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const gm=new THREE.LineBasicMaterial({color:0x4b5563});
  for(let i=-15;i<=15;i+=2.5){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15,0.01,i),new THREE.Vector3(15,0.01,i)]),gm));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-20),new THREE.Vector3(i,0.01,20)]),gm));
  }
  const beltMat=new THREE.MeshStandardMaterial({color:0x1f2937,roughness:0.5,metalness:0.6});
  [-8,-4,0,4,8].forEach(x=>{
    const belt=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.15,12),beltMat);
    belt.position.set(x,0.08,-2); g.add(belt);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.03,0.35),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.6}));
    stripe.position.set(x,0.17,-2); stripe.name='beltstripe'; g.add(stripe);
  });
  const boxC=[0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xec4899];
  [[-8,-6],[-4,-6],[0,-6],[4,-6],[8,-6],[-6,-3],[-2,-3],[2,-3],[6,-3]].forEach(([bx,bz],i)=>{
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),new THREE.MeshStandardMaterial({color:boxC[i%boxC.length],roughness:0.4,metalness:0.2}));
    box.position.set(bx,0.3,bz); box.castShadow=true; g.add(box);
  });
  boxC.forEach((col,i)=>{
    const bin=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.8,1.8),new THREE.MeshStandardMaterial({color:col,roughness:0.5,metalness:0.3,transparent:true,opacity:0.55}));
    bin.position.set(-8+i*4,0.4,6); g.add(bin);
    const label=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.6),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.5}));
    label.position.set(-8+i*4,0.82,6.92); g.add(label);
  });
  const mMat=new THREE.MeshStandardMaterial({color:0x374151,roughness:0.3,metalness:0.7});
  [-14,14].forEach(x=>{
    for(let z=-8;z<=4;z+=4){
      const machine=new THREE.Mesh(new THREE.BoxGeometry(2.5,3,2.5),mMat);
      machine.position.set(x,1.5,z); machine.castShadow=true; g.add(machine);
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:0.8}));
      screen.position.set(x<0?x+1.3:x-1.3,2,z); screen.rotation.y=x<0?Math.PI/2:-Math.PI/2; g.add(screen);
    }
  });
  [[-5,4,0],[0,4,-5],[5,4,0],[0,4,-10]].forEach(([lx,ly,lz])=>{
    const lp=new THREE.PointLight(0xffffff,0.6,10); lp.position.set(lx,ly,lz); g.add(lp);
  });
  [-8,-15,-22].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.1,8,24),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function buildSmartArena(scene, arenaType, challenge) {
  switch(arenaType) {
    case 'sky':     _skyArena(scene);              break;
    case 'terrain': _terrainArena(scene);          break;
    case 'hover':   _hoverArena(scene);            break;
    case 'rough':   _roughArena(scene, challenge); break;
    case 'factory': _factoryArena(scene);          break;
    default:        _groundArena(scene, challenge); break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PHYSICS HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getBlockDuration(block) {
  const p = block.paramValues || {};
  switch(block.id) {
    case 'move_forward':   return Math.max(0.4,(p.steps||3)*0.7);
    case 'move_backward':  return Math.max(0.4,(p.steps||1)*0.7);
    case 'turn_left':
    case 'turn_right':     return Math.max(0.25,(p.degrees||90)/90*0.6);
    case 'spin':           return 1.0;
    case 'stop':           return 0.5;
    case 'set_speed':      return 0.3;
    case 'patrol':         return (p.laps||2)*1.8;
    case 'wait':           return Math.max(0.2,p.seconds||1);
    case 'repeat':         return Math.max(0.4,(p.times||3)*0.6);
    case 'forever':        return 3.0;
    case 'fly_up':
    case 'fly_down':       return 0.9;
    case 'hover_hold':     return Math.max(0.5,p.seconds||1);
    case 'jump':           return 0.7;
    case 'scan':           return 1.6;
    case 'obstacle_ahead':
    case 'line_below':
    case 'see_object':
    case 'collision':
    case 'battery_low':    return 0.5;
    case 'if_obstacle':    return 0.7;
    case 'look':           return 1.3;
    case 'avoid_obstacle': return 1.5;
    case 'follow_line':    return (p.steps||4)*0.6;
    case 'patrol_area':    return (p.laps||2)*1.8;
    case 'follow_target':  return (p.steps||3)*0.8;
    case 'return_home':    return 2.0;
    case 'search_area':    return 1.8;
    case 'grab':
    case 'release':        return 0.9;
    case 'rotate_arm':     return 0.8;
    case 'drill':          return Math.max(0.5,p.seconds||2);
    case 'fire_laser':     return 0.7;
    case 'scan_object':    return 1.2;
    case 'lights_on':
    case 'lights_off':     return 0.3;
    case 'flash':          return Math.max(0.5,(p.times||3)*0.3);
    case 'rainbow':        return 1.2;
    case 'play_sound':     return 0.8;
    case 'robot_voice':    return 1.0;
    default:               return 0.5;
  }
}

function applyBlock(block, rs, dt, movId) {
  const p   = block.paramValues || {};
  const dur = rs.currentDur || 1;
  const spd = movId==='flying'||movId==='jets'?1.5 : movId==='hover'?1.2 : movId==='tracks'?0.85 : movId==='legs'?0.7 : 1.0;
  switch(block.id) {
    case 'move_forward':   { const d=(p.steps||3)*1.9*spd;  rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*8; break; }
    case 'move_backward':  { const d=(p.steps||1)*1.9*spd;  rs.x-=Math.sin(rs.angle)*(d/dur)*dt; rs.z-=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.5; rs.bobPhase+=dt*6; break; }
    case 'turn_left':      rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'turn_right':     rs.angle-=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'spin':           rs.angle+=(Math.PI*2)/dur*dt; break;
    case 'patrol':         { rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; rs.bobPhase+=dt*7; break; }
    case 'fly_up':         rs.y=Math.min(6,(rs.y||0)+2.5/dur*dt); break;
    case 'fly_down':       rs.y=Math.max(0,(rs.y||0)-2.5/dur*dt); break;
    case 'jump':           { const phase=rs.stepTime/dur; rs.y=Math.max(0,Math.sin(phase*Math.PI)*1.8); break; }
    case 'avoid_obstacle': { rs.angle-=(Math.PI/2)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt*0.6; break; }
    case 'follow_line':    { const d=(p.steps||4)*1.5*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*7; break; }
    case 'patrol_area':    { rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; rs.angle+=dt*0.5; break; }
    case 'follow_target':  { const d=(p.steps||3)*1.6*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break; }
    case 'return_home':    { const dx=-rs.x, dz=5-rs.z; const len=Math.sqrt(dx*dx+dz*dz)||1; rs.x+=dx/len*3*dt; rs.z+=dz/len*3*dt; rs.totalDist+=3*dt*0.4; break; }
    case 'search_area':    rs.angle+=(Math.PI*2)/dur*dt; break;
    default: break;
  }
}

function getGroundEffect(movId, bobPhase, t) {
  switch(movId) {
    case 'legs':   return {yOff:Math.abs(Math.sin(bobPhase*2.5))*0.12, rollZ:0};
    case 'hover':  return {yOff:Math.sin(t*1.8)*0.15+0.28, rollZ:Math.sin(t*0.9)*0.04};
    case 'flying':
    case 'jets':   return {yOff:Math.sin(t*1.2)*0.1+0.35, rollZ:0};
    case 'tracks': return {yOff:0, rollZ:Math.sin(bobPhase*1.5)*0.012};
    default:       return {yOff:0, rollZ:Math.sin(bobPhase*1.5)*0.018};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SIMULATOR CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function SimCanvas({robotConfig, codeBlocks, runMode, stepTrigger, onProgress, onFpsUpdate, arenaType, challenge, onBlockActive}) {
  const wrapRef = useRef(null);
  const modeRef = useRef('idle');
  const stepRef = useRef(false);
  const rafRef  = useRef(null);
  const fpsRef  = useRef({frames:0, last:0});
  const rsRef   = useRef({x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0});
  const lastActiveRef = useRef(-1);

  useEffect(()=>{ modeRef.current = runMode; },[runMode]);
  useEffect(()=>{ if(runMode==='step'||runMode==='running') stepRef.current=true; },[stepTrigger,runMode]);

  useEffect(()=>{
    const el = wrapRef.current; if(!el) return;
    const W = Math.max(el.clientWidth,1), H = Math.max(el.clientHeight,1);
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(48,W/H,0.1,80);
    camera.position.set(0,4,10); camera.lookAt(0,0.5,0);
    const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    el.appendChild(renderer.domElement);

    const amb  = new THREE.AmbientLight(0xffffff,0.55); scene.add(amb);
    const sun  = new THREE.DirectionalLight(0xfffcf0,1.1);
    sun.position.set(8,14,6); sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.far=60; scene.add(sun);
    const fill1=new THREE.PointLight(0x4488ff,0.5,30); fill1.position.set(-8,5,-5); scene.add(fill1);
    const fill2=new THREE.PointLight(0xff8844,0.4,25); fill2.position.set(8,4,5);   scene.add(fill2);

    buildSmartArena(scene, arenaType, challenge);

    const robot = buildRobotModel(robotConfig);
    robot.castShadow = true;
    const rs = rsRef.current;
    Object.assign(rs,{x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0});
    lastActiveRef.current = -1;
    robot.position.set(rs.x,rs.y,rs.z); robot.rotation.y=rs.angle;
    scene.add(robot);

    const beamGroup = new THREE.Group(); beamGroup.name='beams'; scene.add(beamGroup);
    let beamTimer = 0;
    function flashBeam(col, len) {
      beamGroup.clear();
      const pts=[new THREE.Vector3(0,0.5,0),new THREE.Vector3(0,0.5,-len)];
      const bm=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.85}));
      beamGroup.add(bm); beamTimer=0.9;
    }

    const camPos  = new THREE.Vector3(0,4,10);
    const camLook = new THREE.Vector3(0,0.5,0);
    const movId   = robotConfig.movementId||'wheels';
    const blocks  = codeBlocks||[];
    let lastTime  = performance.now()/1000;

    const onResize=()=>{
      if(!el) return;
      const nW=Math.max(el.clientWidth,1), nH=Math.max(el.clientHeight,1);
      renderer.setSize(nW,nH); camera.aspect=nW/nH; camera.updateProjectionMatrix();
    };
    const ro=new ResizeObserver(onResize); ro.observe(el);

    const tick=()=>{
      rafRef.current=requestAnimationFrame(tick);
      const now=performance.now()/1000;
      const dt=Math.min(now-lastTime,0.08); lastTime=now;
      rs.t+=dt;
      if(beamTimer>0){ beamTimer-=dt; if(beamTimer<=0) beamGroup.clear(); }

      fpsRef.current.frames++;
      if(now-fpsRef.current.last>=1){
        onFpsUpdate?.(fpsRef.current.frames);
        fpsRef.current.frames=0; fpsRef.current.last=now;
      }

      const mode=modeRef.current;
      if((mode==='running'||mode==='step')&&!rs.done){
        if(blocks.length>0){
          if(rs.step>=blocks.length){ rs.done=true; }
          else {
            if(rs.stepTime===0) rs.currentDur=getBlockDuration(blocks[rs.step]);
            rs.stepTime+=dt;
            const bk=blocks[rs.step];
            applyBlock(bk,rs,dt,movId);
            if(lastActiveRef.current!==rs.step){
              lastActiveRef.current=rs.step;
              onBlockActive?.(rs.step, bk.label||bk.id);
            }
            if(bk.id==='scan'||bk.id==='obstacle_ahead'||bk.id==='if_obstacle'||bk.id==='search_area'||bk.id==='avoid_obstacle') flashBeam(0x00ff88,8);
            else if(bk.id==='look'||bk.id==='see_object'||bk.id==='follow_target'||bk.id==='scan_object') flashBeam(0xcc00ff,6);
            else if(bk.id==='fire_laser') flashBeam(0xff2200,12);
            else if(bk.id==='patrol_area'||bk.id==='follow_line') flashBeam(0x00aaff,5);

            if(mode==='step'){
              if(rs.stepTime>=rs.currentDur){ rs.step++; rs.stepTime=0; rs.currentDur=0; modeRef.current='paused'; }
            } else {
              if(rs.stepTime>=rs.currentDur){ rs.step++; rs.stepTime=0; rs.currentDur=0; }
            }
          }
        } else {
          rs.x+=Math.sin(rs.angle)*1.2*dt; rs.z+=Math.cos(rs.angle)*1.2*dt;
          rs.totalDist+=1.2*dt; rs.bobPhase+=dt*6;
          if(rs.z<-22) rs.angle+=Math.PI+0.3;
        }
        const prog=blocks.length>0?Math.min(100,(rs.step/Math.max(1,blocks.length))*100):Math.min(100,(rs.totalDist/22)*100);
        rs.battery=Math.max(0,100-rs.totalDist*0.8);
        rs.avoided=Math.floor(rs.totalDist/4);
        onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:prog,done:rs.done,blockIdx:rs.step});
        if(rs.done){ onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:100,done:true}); modeRef.current='idle'; }
      } else if(mode==='idle'){
        robot.rotation.y=Math.PI+Math.sin(rs.t*0.7)*0.08;
      }

      const {yOff,rollZ}=getGroundEffect(movId,rs.bobPhase||0,rs.t);
      robot.position.set(rs.x,rs.y+yOff,rs.z);
      robot.rotation.y=rs.angle;
      robot.rotation.z=rollZ;
      beamGroup.position.copy(robot.position);
      beamGroup.rotation.y=rs.angle;

      const isAerial=arenaType==='sky'||arenaType==='hover';
      const bx=rs.x+Math.sin(rs.angle+Math.PI)*8;
      const bz=rs.z+Math.cos(rs.angle+Math.PI)*8;
      camPos.lerp(new THREE.Vector3(Math.max(-18,Math.min(18,bx)),isAerial?rs.y+5.5:5,Math.max(-30,Math.min(18,bz))),0.045);
      camLook.lerp(new THREE.Vector3(rs.x,rs.y+0.7,rs.z),0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);

      scene.traverse(c=>{
        if(c.name==='cp'){ c.rotation.z+=dt*0.9; if(c.material) c.material.emissiveIntensity=0.7+Math.sin(rs.t*3)*0.3; }
        if(c.name&&c.name.startsWith('mover')){ const idx=parseInt(c.name.slice(5))||0; c.position.x=Math.sin(rs.t*(0.8+idx*0.2))*(4+idx); }
        if(c.name==='beltstripe'){ c.position.z=-2+(rs.t*0.8)%12-6; }
      });
      renderer.render(scene,camera);
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if(el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig,arenaType,challenge]);
  return <div ref={wrapRef} style={{width:'100%',height:'100%'}} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE BLOCK — CSS Blockly shape
// ─────────────────────────────────────────────────────────────────────────────
function PaletteBlock({block, unlocked, onAdd}) {
  const cc = 'bb-'+block.cat;
  const locked = !unlocked;

  const onDragStart = (e) => {
    if(locked){ e.preventDefault(); return; }
    e.dataTransfer.setData('blockId', block.id);
    e.dataTransfer.effectAllowed='copy';
  };
  const click = () => unlocked && onAdd(block);
  const title = unlocked ? 'Click or drag: '+block.label : 'Needs: '+(block.requires||[]).join(', ');

  const inner = <>
    <span style={{fontSize:15,flexShrink:0,width:20,textAlign:'center',lineHeight:1}}>{block.icon}</span>
    <span style={{flex:1,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{block.label}</span>
    {block.params&&block.params.length>0&&(
      <span style={{fontSize:9,background:'rgba(0,0,0,.28)',borderRadius:8,padding:'1px 6px',flexShrink:0,color:'rgba(255,255,255,.8)'}}>
        {block.params[0].default}{block.params[0].unit||''}
      </span>
    )}
    {locked&&<span style={{fontSize:11,flexShrink:0}}>🔒</span>}
  </>;

  if(block.bt==='bool') return (
    <div className={`bblock bblock-bool ${cc} ${locked?'bblock-locked':''}`}
      draggable={!locked} onDragStart={onDragStart} onClick={click} title={title}
      style={{cursor:locked?'not-allowed':'grab'}}>
      {inner}
    </div>
  );

  if(block.bt==='c') return (
    <div className={`bblock-c-wrap ${locked?'bblock-locked':''}`}
      draggable={!locked} onDragStart={onDragStart} onClick={click} title={title}
      style={{cursor:locked?'not-allowed':'grab',marginBottom:10}}>
      <div className={`bblock-c-top ${cc}`}>{inner}</div>
      <div className="bblock-c-slot">
        <span style={{fontSize:10,color:'#4b5563',padding:'4px 8px',display:'block',fontStyle:'italic'}}>blocks go here…</span>
      </div>
      <div className={`bblock-c-bottom ${cc}`} />
    </div>
  );

  return (
    <button className={`bblock ${cc} ${locked?'bblock-locked':''}`}
      draggable={!locked} onDragStart={onDragStart} onClick={click} title={title}
      style={{cursor:locked?'not-allowed':'grab'}}>
      {inner}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM BLOCK — CSS Blockly shape in program list
// ─────────────────────────────────────────────────────────────────────────────
function ProgramBlock({block, index, total, isActive, onDelete, onMoveUp, onMoveDown, onParamChange}) {
  const cc = 'bb-'+block.cat;

  const controls = (
    <div style={{display:'flex',gap:1,flexShrink:0,marginLeft:'auto'}}>
      <button onClick={()=>onMoveUp(index)} disabled={index===0}
        style={{background:'none',border:'none',cursor:index===0?'default':'pointer',color:index===0?'rgba(255,255,255,.15)':'rgba(255,255,255,.55)',fontSize:12,padding:'0 3px',fontWeight:800,lineHeight:1}}>↑</button>
      <button onClick={()=>onMoveDown(index)} disabled={index===total-1}
        style={{background:'none',border:'none',cursor:index===total-1?'default':'pointer',color:index===total-1?'rgba(255,255,255,.15)':'rgba(255,255,255,.55)',fontSize:12,padding:'0 3px',fontWeight:800,lineHeight:1}}>↓</button>
      <button onClick={()=>onDelete(index)}
        style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,100,100,.8)',fontSize:13,padding:'0 3px',fontWeight:800,lineHeight:1}}>✕</button>
    </div>
  );

  const seqBadge = (
    <div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:9,fontWeight:800,background:isActive?'rgba(255,255,255,.9)':'rgba(0,0,0,.3)',color:isActive?'#6d28d9':'#fff',transition:'all .2s'}}>
      {isActive?'▶':index+1}
    </div>
  );

  const blockInner = (
    <div style={{display:'flex',alignItems:'center',gap:6,width:'100%'}}>
      {seqBadge}
      <span style={{fontSize:14,flexShrink:0}}>{block.icon}</span>
      <span style={{flex:1,fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{block.label}</span>
      {controls}
    </div>
  );

  const params = block.params&&block.params.length>0&&(
    <div style={{marginLeft:24,padding:'5px 8px 6px',background:'rgba(0,0,0,.22)',borderRadius:'0 0 6px 6px',borderLeft:'3px solid rgba(255,255,255,.08)',marginBottom:2}}>
      {block.params.map(p=>(
        <div key={p.name} style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
          <span style={{fontSize:9,color:'#6b7280',minWidth:38}}>{p.name}</span>
          {p.type==='range'?(
            <input type="range" min={p.min} max={p.max} step={p.step||1}
              value={(block.paramValues&&block.paramValues[p.name]!=null)?block.paramValues[p.name]:p.default}
              onChange={e=>onParamChange(index,p.name,Number(e.target.value))}
              style={{flex:1,accentColor:'#7c3aed',height:3}}/>
          ):(
            <select value={(block.paramValues&&block.paramValues[p.name]!=null)?block.paramValues[p.name]:p.default}
              onChange={e=>onParamChange(index,p.name,e.target.value)}
              style={{flex:1,background:'rgba(0,0,0,.45)',border:'1px solid #334155',borderRadius:4,color:'#f0f6ff',fontSize:10,padding:'1px 4px'}}>
              {p.options&&p.options.map(o=><option key={o} value={o}>{o}{p.unit||''}</option>)}
            </select>
          )}
          <span style={{fontSize:10,color:'#a78bfa',minWidth:24,textAlign:'right'}}>
            {(block.paramValues&&block.paramValues[p.name]!=null)?block.paramValues[p.name]:p.default}{p.unit||''}
          </span>
        </div>
      ))}
    </div>
  );

  if(block.bt==='c') return (
    <div style={{marginBottom:4}}>
      <div className={`bblock-c-wrap`}>
        <div className={`bblock-c-top ${cc} ${isActive?'bblock-active':''}`}>{blockInner}</div>
        <div className="bblock-c-slot">
          <span style={{fontSize:10,color:'#4b5563',padding:'4px 8px',display:'block',fontStyle:'italic'}}>(inner blocks)</span>
        </div>
        <div className={`bblock-c-bottom ${cc}`} />
      </div>
      {params}
    </div>
  );

  return (
    <div style={{marginBottom:2}}>
      <div className={`bblock prog-block ${cc} ${block.bt==='bool'?'bblock-bool':''} ${isActive?'bblock-active':''}`}>
        {blockInner}
      </div>
      {params}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEMS PANEL (right column)
// ─────────────────────────────────────────────────────────────────────────────
function SystemsPanel({robotConfig, stats, challenge, profile, isRunning, fps}) {
  const battColor = stats.battery>60?'#22c55e':stats.battery>30?'#f59e0b':'#ef4444';
  const timeStr   = String(Math.floor(stats.time/60)).padStart(2,'0')+':'+String(Math.floor(stats.time%60)).padStart(2,'0');
  const circ      = 2*Math.PI*22;
  const sensors   = [...(robotConfig.sensors||[]), ...(robotConfig.tools||[]).filter(t=>['lidar','camera','ultrasonic'].includes(t))];
  return (
    <div style={{width:'22%',minWidth:180,maxWidth:275,display:'flex',flexDirection:'column',background:'#161b22',borderLeft:'1px solid #21262d',overflow:'hidden',flexShrink:0}}>

      {/* Robot card */}
      <div style={{padding:'11px 12px',borderBottom:'1px solid #21262d',background:'#0d1117',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>🤖</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{robotConfig.name||'My Robot'}</div>
            <div style={{fontSize:9,color:challenge.color,fontWeight:700,marginTop:1}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>
        <div style={{marginTop:7,display:'flex',gap:3,flexWrap:'wrap'}}>
          <span style={{fontSize:8,background:'rgba(59,130,246,.16)',color:'#60a5fa',border:'1px solid rgba(59,130,246,.28)',borderRadius:4,padding:'2px 6px',fontWeight:700}}>{robotConfig.movementId||'wheels'}</span>
          {fps!==null&&fps!==undefined&&<span style={{fontSize:8,background:'rgba(34,197,94,.14)',color:'#4ade80',border:'1px solid rgba(34,197,94,.28)',borderRadius:4,padding:'2px 6px',fontWeight:700}}>{fps} fps</span>}
        </div>
      </div>

      {/* Systems status */}
      <div style={{padding:'10px 12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.6,marginBottom:8}}>Systems</div>
        <div style={{marginBottom:9}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:10,color:'#9ca3af'}}>🔋 Battery</span>
            <span style={{fontSize:11,fontWeight:800,color:battColor}}>{Math.round(stats.battery)}%</span>
          </div>
          <div className="sys-bar-track"><div className="sys-bar-fill" style={{width:stats.battery+'%',background:battColor}}/></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
          <span style={{fontSize:10,color:'#9ca3af'}}>📏 Distance</span>
          <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff'}}>{stats.dist.toFixed(1)} m</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
          <span style={{fontSize:10,color:'#9ca3af'}}>⏱ Time</span>
          <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff',fontFamily:'monospace'}}>{timeStr}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:10,color:'#9ca3af'}}>🚧 Cleared</span>
          <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff'}}>{stats.avoided}</span>
        </div>
      </div>

      {/* Sensor activity */}
      {sensors.length>0&&(
        <div style={{padding:'10px 12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
          <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7}}>Sensors</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {sensors.slice(0,6).map(s=>(
              <div key={s} style={{display:'flex',alignItems:'center',gap:7}}>
                <div style={{position:'relative',width:8,height:8,borderRadius:'50%',background:isRunning?'#22c55e':'#374151',boxShadow:isRunning?'0 0 7px #22c55e':'none',transition:'all .3s',flexShrink:0}} />
                <span style={{fontSize:10,color:'#9ca3af'}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge progress ring */}
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7,alignSelf:'flex-start'}}>Challenge</div>
        <div style={{fontSize:11,color:challenge.color,fontWeight:700,marginBottom:8,textAlign:'center'}}>{challenge.icon} {challenge.name}</div>
        <svg width="82" height="82" viewBox="0 0 52 52" style={{overflow:'visible'}}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="#21262d" strokeWidth="4"/>
          <circle cx="26" cy="26" r="22" fill="none" stroke={challenge.color} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={String(circ)}
            strokeDashoffset={String(circ*(1-stats.progress/100))}
            transform="rotate(-90 26 26)"
            style={{transition:'stroke-dashoffset .5s ease'}}/>
          <text x="26" y="22" textAnchor="middle" fill="#f0f6ff" fontSize="9" fontWeight="bold">{Math.round(stats.progress)}%</text>
          <text x="26" y="33" textAnchor="middle" fill="#6b7280" fontSize="7">done</text>
        </svg>
      </div>

      {/* Tip */}
      <div style={{marginTop:'auto',padding:'8px 12px',borderTop:'1px solid #21262d',background:'rgba(124,58,237,.06)',flexShrink:0}}>
        <div style={{fontSize:9,color:'#6b7280',lineHeight:1.5}}>{profile.tipIcon} {profile.tip}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveLabPage({robotConfig, robotCode, setRobotCode, preflight, onFpsUpdate}) {
  const [activeCat,  setActiveCat]  = useState('move');
  const [runMode,    setRunMode]    = useState('idle');
  const [stepTrig,   setStepTrig]   = useState(0);
  const [activeBlk,  setActiveBlk]  = useState(-1);
  const [stats,      setStats]      = useState({time:0,dist:0,battery:100,avoided:0,progress:0});
  const [activity,   setActivity]   = useState(['🤖 Robot ready — add code blocks and press Run!']);
  const [fps,        setFps]        = useState(null);
  const [challengeI, setChallengeI] = useState(0);
  const [dragOver,   setDragOver]   = useState(false);
  const simKeyRef = useRef(0);
  const [simKey,  setSimKey]  = useState(0);

  const rc      = robotConfig || {};
  const profile = useMemo(()=>getSmartProfile(rc),[rc]);
  const challenge = profile.challenges[challengeI]||profile.challenges[0];

  const paletteBlocks = useMemo(()=>BDEFS.filter(b=>b.cat===activeCat),[activeCat]);

  const addBlock = useCallback((tpl)=>{
    const nb={...tpl, uid:Date.now()+Math.random(), paramValues:{}};
    if(tpl.params) tpl.params.forEach(p=>{ nb.paramValues[p.name]=p.default; });
    setRobotCode(prev=>[...prev,nb]);
    setActivity(a=>[...a,'Added: '+tpl.label]);
  },[setRobotCode]);

  const deleteBlock = useCallback((i)=>setRobotCode(prev=>prev.filter((_,idx)=>idx!==i)),[setRobotCode]);
  const moveUp      = useCallback((i)=>setRobotCode(prev=>{ if(i===0) return prev; const a=[...prev]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; }),[setRobotCode]);
  const moveDown    = useCallback((i)=>setRobotCode(prev=>{ if(i>=prev.length-1) return prev; const a=[...prev]; [a[i],a[i+1]]=[a[i+1],a[i]]; return a; }),[setRobotCode]);
  const setParam    = useCallback((i,name,val)=>setRobotCode(prev=>prev.map((b,idx)=>idx===i?{...b,paramValues:{...b.paramValues,[name]:val}}:b)),[setRobotCode]);

  // Drag-and-drop from palette into workspace
  const handleDrop = useCallback((e)=>{
    e.preventDefault(); setDragOver(false);
    const id = e.dataTransfer.getData('blockId');
    const tpl = BDEFS.find(b=>b.id===id);
    if(tpl&&isUnlocked(tpl,rc)) addBlock(tpl);
  },[rc,addBlock]);

  const doRun = useCallback(()=>{
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setActiveBlk(-1); setRunMode('running');
    setActivity([(rc.name||'Robot')+' launching!', 'Challenge: '+challenge.name, (robotCode.length||0)+' blocks loaded']);
  },[rc,robotCode,challenge]);

  const doPause = useCallback(()=>{
    setRunMode(m=>{ const next=m==='paused'?'running':'paused'; setActivity(a=>[...a,next==='paused'?'⏸ Paused':'▶ Resumed']); return next; });
  },[]);

  const doStep = useCallback(()=>{
    if(runMode==='idle'||runMode==='paused'){
      if(runMode==='idle'){ simKeyRef.current++; setSimKey(simKeyRef.current); setStats({time:0,dist:0,battery:100,avoided:0,progress:0}); setActiveBlk(-1); }
      setRunMode('step'); setStepTrig(t=>t+1); setActivity(a=>[...a,'⏭ Step']);
    }
  },[runMode]);

  const doReset = useCallback(()=>{
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunMode('idle'); setActiveBlk(-1);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setActivity(['🔄 Robot reset — ready!']);
  },[]);

  const handleProgress = useCallback((data)=>{
    setStats({time:data.time,dist:data.dist,battery:data.battery,avoided:data.avoided,progress:data.progress});
    if(data.done){ setRunMode('idle'); setActiveBlk(-1); setActivity(a=>[...a,'🏆 Program complete! Great job!']); }
  },[]);

  const handleBlockActive = useCallback((idx)=>setActiveBlk(idx),[]);
  const handleFps = useCallback((f)=>{ setFps(f); onFpsUpdate?.(f); },[onFpsUpdate]);

  const isRunning = runMode==='running';
  const isPaused  = runMode==='paused';
  const isIdle    = runMode==='idle';
  const statusTxt = isRunning?'Running':isPaused?'Paused':'Ready';
  const statusCol = isRunning?'#22c55e':isPaused?'#f59e0b':'#6b7280';

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#0d1117',overflow:'hidden',color:'#f0f6ff',fontFamily:'system-ui,sans-serif'}}>

      {/* ══════ TOP BAR ══════ */}
      <div style={{height:50,background:'#161b22',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 12px',gap:8,flexShrink:0}}>

        {/* Robot identity */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>🤖</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',lineHeight:1.2}}>{rc.name||'My Robot'}</div>
            <div style={{fontSize:8,color:'#6b7280'}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>

        {/* Challenge tabs */}
        <div style={{display:'flex',gap:2,padding:'2px',background:'rgba(0,0,0,.3)',borderRadius:9,overflow:'auto',flex:1,maxWidth:400}}>
          {profile.challenges.map((ch,i)=>(
            <button key={ch.id} onClick={()=>!isRunning&&setChallengeI(i)}
              style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',borderRadius:6,border:'none',
                cursor:isRunning?'default':'pointer',whiteSpace:'nowrap',transition:'all .14s',
                background:i===challengeI?(ch.color+'22'):'transparent',
                borderBottom:i===challengeI?('2px solid '+ch.color):'2px solid transparent',
                color:i===challengeI?ch.color:'#6b7280',fontSize:10,fontWeight:700}}>
              <span>{ch.icon}</span><span>{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Run controls */}
        <div style={{display:'flex',gap:4,marginLeft:'auto',flexShrink:0,alignItems:'center'}}>
          {isIdle&&(
            <button onClick={doRun} style={{padding:'7px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer',boxShadow:'0 2px 8px rgba(34,197,94,.4)'}}>
              ▶ Run
            </button>
          )}
          {isRunning&&(
            <button onClick={doPause} style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#f59e0b',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>⏸ Pause</button>
          )}
          {isPaused&&(
            <button onClick={doPause} style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>▶ Resume</button>
          )}
          {(isRunning||isPaused)&&(
            <button onClick={doReset} style={{padding:'7px 10px',borderRadius:8,border:'none',background:'#ef4444',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>■ Stop</button>
          )}
          <button onClick={doStep} title="Execute one block"
            style={{padding:'7px 10px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#8b949e',fontWeight:700,fontSize:12,cursor:'pointer'}}>⏭</button>
          <button onClick={doReset} title="Reset robot"
            style={{padding:'7px 10px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#8b949e',fontWeight:700,fontSize:12,cursor:'pointer'}}>↺</button>
        </div>

        {/* Status badge */}
        <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:14,
          background:isRunning?'rgba(34,197,94,.1)':isPaused?'rgba(245,158,11,.1)':'rgba(255,255,255,.04)',
          border:'1px solid '+(isRunning?'#22c55e':isPaused?'#f59e0b':'#21262d'),flexShrink:0}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:statusCol,display:'inline-block'}}/>
          <span style={{fontSize:9,fontWeight:700,color:statusCol}}>{statusTxt}</span>
        </div>
      </div>

      {/* ══════ THREE-COLUMN MAIN AREA ══════ */}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* ━━ LEFT: CODE PANEL (22%) ━━ */}
        <div style={{width:'22%',minWidth:195,maxWidth:295,display:'flex',flexDirection:'column',background:'#161b22',borderRight:'1px solid #21262d',overflow:'hidden',flexShrink:0}}>

          {/* Category tabs */}
          <div style={{display:'flex',background:'#0d1117',borderBottom:'1px solid #21262d',flexShrink:0}}>
            {CATS.map(cat=>(
              <button key={cat.id} className={`ll-cat-tab ${activeCat===cat.id?'ll-active':''}`}
                onClick={()=>setActiveCat(cat.id)}
                style={{'--cat-color':cat.color}}>
                <span className="cat-ico">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Block palette */}
          <div className="ll-scroll" style={{height:'44%',overflowY:'auto',padding:'8px 8px 4px',borderBottom:'1px solid #21262d',flexShrink:0}}>
            <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.5,marginBottom:6,paddingLeft:2}}>
              Drag or click to add
            </div>
            {paletteBlocks.length===0?(
              <div style={{fontSize:11,color:'#4b5563',padding:'14px 6px',textAlign:'center'}}>No blocks.</div>
            ):paletteBlocks.map(b=>(
              <PaletteBlock key={b.id} block={b} unlocked={isUnlocked(b,rc)} onAdd={addBlock}/>
            ))}
          </div>

          {/* Program workspace */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 10px 4px',flexShrink:0,borderBottom:'1px solid #21262d',background:'#0d1117'}}>
              <span style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.5}}>
                My Program {robotCode&&robotCode.length>0&&`(${robotCode.length})`}
              </span>
              {robotCode&&robotCode.length>0&&(
                <button onClick={()=>{setRobotCode([]);setActivity(a=>[...a,'Program cleared']);}}
                  style={{fontSize:8,background:'none',border:'1px solid #ef4444',borderRadius:4,color:'#ef4444',padding:'2px 6px',cursor:'pointer',fontWeight:700}}>
                  Clear
                </button>
              )}
            </div>

            <div className={`ll-scroll ll-drop-zone ${dragOver?'drag-over':''}`}
              style={{flex:1,overflowY:'auto',padding:'8px',minHeight:0,transition:'all .15s'}}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={handleDrop}>

              {(!robotCode||robotCode.length===0)?(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7,opacity:0.35,padding:16,minHeight:80}}>
                  <div style={{fontSize:28}}>📝</div>
                  <div style={{fontSize:10,color:'#6b7280',textAlign:'center',lineHeight:1.5}}>Your program is empty.<br/>Drag or click blocks above!</div>
                </div>
              ):robotCode.map((b,i)=>(
                <ProgramBlock
                  key={b.uid||i} block={b} index={i} total={robotCode.length}
                  isActive={isRunning&&activeBlk===i}
                  onDelete={deleteBlock} onMoveUp={moveUp} onMoveDown={moveDown} onParamChange={setParam}/>
              ))}
            </div>
          </div>

          {/* Progress strip (during run) */}
          {(isRunning||isPaused)&&(
            <div style={{padding:'6px 10px',borderTop:'1px solid #21262d',flexShrink:0,background:'#0d1117'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase'}}>Progress</span>
                <span style={{fontSize:10,fontWeight:800,color:challenge.color}}>{Math.round(stats.progress)}%</span>
              </div>
              <div style={{height:4,background:'#21262d',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',background:challenge.color,width:stats.progress+'%',transition:'width .3s',boxShadow:'0 0 6px '+challenge.color}}/>
              </div>
            </div>
          )}
        </div>

        {/* ━━ CENTER: HERO ARENA ━━ */}
        <div style={{flex:1,position:'relative',overflow:'hidden',background:'#0d1117',minWidth:0}}>
          <SimCanvas
            key={simKey}
            robotConfig={rc}
            codeBlocks={robotCode||[]}
            runMode={runMode}
            stepTrigger={stepTrig}
            onProgress={handleProgress}
            onFpsUpdate={handleFps}
            arenaType={profile.arenaType}
            challenge={challenge}
            onBlockActive={handleBlockActive}/>

          {/* Top progress bar overlay */}
          {(isRunning||isPaused)&&(
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'rgba(0,0,0,.4)',zIndex:5}}>
              <div style={{height:'100%',background:challenge.color,width:stats.progress+'%',transition:'width .4s',boxShadow:'0 0 8px '+challenge.color}}/>
            </div>
          )}

          {/* Challenge badge — top-left */}
          <div style={{position:'absolute',top:12,left:12,background:'rgba(13,17,23,.82)',backdropFilter:'blur(10px)',borderRadius:10,padding:'7px 12px',border:'1px solid #21262d',pointerEvents:'none',maxWidth:210}}>
            <div style={{fontSize:12,fontWeight:800,color:challenge.color}}>{challenge.icon} {challenge.name}</div>
            <div style={{fontSize:9,color:'#6b7280',marginTop:1,lineHeight:1.4}}>{challenge.desc}</div>
          </div>

          {/* Active block HUD — bottom-center */}
          {isRunning&&activeBlk>=0&&robotCode&&robotCode[activeBlk]&&(
            <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',background:'rgba(13,17,23,.92)',backdropFilter:'blur(10px)',borderRadius:22,padding:'6px 18px',border:'1px solid rgba(124,58,237,.7)',pointerEvents:'none',display:'flex',alignItems:'center',gap:9,boxShadow:'0 0 20px rgba(124,58,237,.32)',whiteSpace:'nowrap',zIndex:5}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#7c3aed',display:'inline-block',flexShrink:0,boxShadow:'0 0 6px #7c3aed'}}/>
              <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{robotCode[activeBlk].icon} {robotCode[activeBlk].label}</span>
              <span style={{fontSize:9,color:'#a78bfa',borderLeft:'1px solid rgba(124,58,237,.4)',paddingLeft:8}}>Block {activeBlk+1}/{robotCode.length}</span>
            </div>
          )}

          {/* Ready / empty hint — center */}
          {isIdle&&stats.progress===0&&(
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(13,17,23,.9)',backdropFilter:'blur(12px)',borderRadius:18,padding:'20px 26px',border:'1px solid #30363d',textAlign:'center',pointerEvents:'none',minWidth:195,maxWidth:260,zIndex:3}}>
              <div style={{fontSize:30,marginBottom:7}}>{challenge.icon}</div>
              <div style={{fontSize:14,fontWeight:800,color:'#f0f6ff',marginBottom:4}}>{challenge.name}</div>
              <div style={{fontSize:10,color:'#6b7280',marginBottom:9,lineHeight:1.5}}>
                {robotCode&&robotCode.length>0?robotCode.length+' blocks ready':'Add code blocks on the left!'}
              </div>
              {robotCode&&robotCode.length>0&&<div style={{fontSize:11,color:'#22c55e',fontWeight:800}}>Press ▶ Run to launch!</div>}
            </div>
          )}

          {/* Completion banner */}
          {isIdle&&stats.progress>=99&&(
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(13,17,23,.96)',backdropFilter:'blur(12px)',borderRadius:22,padding:'24px 34px',border:'2px solid #22c55e',textAlign:'center',zIndex:6,boxShadow:'0 0 32px rgba(34,197,94,.28)',minWidth:210}}>
              <div style={{fontSize:42,marginBottom:8}}>🏆</div>
              <div style={{fontSize:18,fontWeight:800,color:'#22c55e',marginBottom:4}}>Challenge Complete!</div>
              <div style={{fontSize:11,color:'#86efac',marginBottom:14}}>
                {stats.dist.toFixed(1)} m · {String(Math.floor(stats.time/60)).padStart(2,'0')}:{String(Math.floor(stats.time%60)).padStart(2,'0')}
              </div>
              <button onClick={doRun} style={{padding:'8px 24px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer'}}>
                Play Again ▶
              </button>
            </div>
          )}
        </div>

        {/* ━━ RIGHT: SYSTEMS PANEL (22%) ━━ */}
        <SystemsPanel
          robotConfig={rc}
          stats={stats}
          challenge={challenge}
          profile={profile}
          isRunning={isRunning}
          fps={fps}/>
      </div>

      {/* ══════ ACTIVITY FEED ══════ */}
      <div style={{height:28,background:'#0d1117',borderTop:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 10px',overflow:'hidden',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#2d3748',marginRight:6,whiteSpace:'nowrap',flexShrink:0}}>LOG</div>
        <div style={{display:'flex',gap:0,overflow:'hidden',flex:1}}>
          {activity.slice(-20).map((ev,i,arr)=>(
            <span key={i} style={{fontSize:9,color:i===arr.length-1?'#00d9ff':'#2d3748',fontFamily:'monospace',whiteSpace:'nowrap',padding:'0 8px',borderRight:'1px solid #21262d'}}>
              {ev}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
"""

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(JSX.lstrip('\n'))

print(f"Written {len(JSX)} chars ({JSX.count(chr(10))} lines) to:")
print(f"  {OUT}")
