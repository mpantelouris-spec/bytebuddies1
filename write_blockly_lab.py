#!/usr/bin/env python3
"""Write real Blockly LiveLabPage.jsx"""
import os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(ROOT,'src','virtual-robot-designer','studio','LiveLabPage.jsx')

CODE = r"""/**
 * LiveLabPage.jsx  —  ByteBuddies Real Blockly Simulator
 * Real Blockly workspace (left) | 3D arena (center) | Systems (right)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Blockly from 'blockly';
import * as THREE from 'three';
import { buildRobotModel } from '../services/studio-robot-builder.js';
import './LiveLabPage.css';

// ─────────────────────────────────────────────────────────────────────────────
// REAL BLOCKLY — CUSTOM ROBOT BLOCK DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const ROBOT_BLOCK_DEFS = [
  // ── EVENTS (hat block — no previousStatement) ────────────────────────────
  { type:'robot_when_start', message0:'🚀  When  START  clicked', nextStatement:null,
    style:'event_blocks', hat:'cap', tooltip:'Start your robot program here!' },

  // ── MOVEMENT ─────────────────────────────────────────────────────────────
  { type:'robot_move_forward', message0:'⬆  Move forward  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:3,min:1,max:20,precision:1}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Move the robot forward a number of steps' },

  { type:'robot_move_backward', message0:'⬇  Move backward  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:2,min:1,max:20,precision:1}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_turn_left', message0:'↺  Turn left  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['135°','135'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_turn_right', message0:'↻  Turn right  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['135°','135'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_spin', message0:'🌀  Spin around',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_stop', message0:'⏹  Stop',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_set_speed', message0:'⚡  Set speed to  %1',
    args0:[{type:'field_dropdown',name:'SPEED',options:[['slow 🐢','slow'],['medium 🏃','medium'],['fast 🚀','fast'],['turbo ⚡','turbo']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_fly_up', message0:'🚀  Fly up  %1  meters',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires flying / jet propulsion' },

  { type:'robot_fly_down', message0:'📉  Fly down  %1  meters',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires flying / jet propulsion' },

  { type:'robot_hover', message0:'🛸  Hover for  %1  seconds',
    args0:[{type:'field_number',name:'SECS',value:1,min:0.5,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires hover propulsion' },

  { type:'robot_jump', message0:'⬆  Jump!',
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires leg joints' },

  // ── CONTROL ──────────────────────────────────────────────────────────────
  { type:'robot_wait', message0:'⏸  Wait  %1  seconds',
    args0:[{type:'field_number',name:'SECS',value:1,min:0.1,max:10}],
    previousStatement:null, nextStatement:null, style:'control_blocks' },

  { type:'robot_repeat', message0:'🔁  Repeat  %1  times', message1:'do  %1',
    args0:[{type:'field_number',name:'TIMES',value:3,min:1,max:20,precision:1}],
    args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Repeat the blocks inside this many times' },

  { type:'robot_forever', message0:'♾  Forever', message1:'do  %1',
    args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Repeat forever — press Stop to end' },

  { type:'robot_if_then', message0:'❓  If  %1', message1:'then  %1',
    args0:[{type:'input_value',name:'COND',check:'Boolean'}],
    args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Run blocks inside only when the condition is true' },

  // ── SENSORS — boolean hexagon blocks ─────────────────────────────────────
  { type:'robot_obstacle_ahead', message0:'🚧  obstacle ahead?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if an obstacle is in front of the robot' },

  { type:'robot_line_below', message0:'〰  line below?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if a line is detected below the robot' },

  { type:'robot_see_object', message0:'👁  see object?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if the camera detects an object' },

  { type:'robot_battery_low', message0:'🔋  battery low?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if battery is below 20%' },

  { type:'robot_collision', message0:'💥  collision?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if the robot has collided with something' },

  // sensor action blocks
  { type:'robot_scan', message0:'📡  Scan surroundings',
    previousStatement:null, nextStatement:null, style:'sense_blocks',
    tooltip:'Uses ultrasonic or lidar to scan the area' },

  { type:'robot_look', message0:'👁  Look around',
    previousStatement:null, nextStatement:null, style:'sense_blocks',
    tooltip:'Use the camera to look for objects' },

  // ── AI BEHAVIOURS ────────────────────────────────────────────────────────
  { type:'robot_avoid_obstacle', message0:'🛡  Avoid obstacles',
    previousStatement:null, nextStatement:null, style:'ai_blocks',
    tooltip:'Automatically steer around obstacles' },

  { type:'robot_follow_line', message0:'〰  Follow line  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:5,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'ai_blocks',
    tooltip:'Follow a line on the ground — requires line sensor' },

  { type:'robot_patrol_area', message0:'🔄  Patrol area  %1  laps',
    args0:[{type:'field_number',name:'LAPS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  { type:'robot_follow_target', message0:'🎯  Follow target  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:4,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks',
    tooltip:'Follow a target — requires camera' },

  { type:'robot_return_home', message0:'🏠  Return home',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  { type:'robot_search_area', message0:'🔍  Search area radius  %1',
    args0:[{type:'field_number',name:'RADIUS',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  // ── TOOLS ────────────────────────────────────────────────────────────────
  { type:'robot_grab', message0:'✊  Grab object',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires grabber or claw attachment' },

  { type:'robot_release', message0:'👐  Release',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires grabber or claw attachment' },

  { type:'robot_rotate_arm', message0:'🦾  Rotate arm  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['30°','30'],['45°','45'],['90°','90'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires arm or claw attachment' },

  { type:'robot_drill', message0:'🔩  Drill for  %1  seconds',
    args0:[{type:'field_number',name:'SECS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires drill attachment' },

  { type:'robot_fire_laser', message0:'⚡  Fire laser',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires laser attachment' },

  { type:'robot_scan_object', message0:'📷  Scan object',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires camera sensor' },

  // ── LIGHTS & SOUND ───────────────────────────────────────────────────────
  { type:'robot_led_on', message0:'💡  LEDs  ON',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_led_off', message0:'🌑  LEDs  OFF',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_flash', message0:'✨  Flash lights  %1  times',
    args0:[{type:'field_number',name:'TIMES',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_rainbow', message0:'🌈  Rainbow mode',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_play_sound', message0:'🔊  Play sound  %1',
    args0:[{type:'field_dropdown',name:'SOUND',options:[['beep 🔔','beep'],['laser ⚡','laser'],['victory 🏆','victory'],['alarm 🚨','alarm']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_voice', message0:'🤖  Robot says hi!',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
];

let _blocksRegistered = false;
function registerRobotBlocks() {
  if (_blocksRegistered) return;
  _blocksRegistered = true;
  try { Blockly.defineBlocksWithJsonArray(ROBOT_BLOCK_DEFS); }
  catch(e) { console.warn('Block registration:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKLY THEME — dark ByteBuddies style
// ─────────────────────────────────────────────────────────────────────────────
function makeBBTheme() {
  return Blockly.Theme.defineTheme('bytebuddies', {
    blockStyles: {
      event_blocks:   { colourPrimary:'#e11d48', colourSecondary:'#9f1239', colourTertiary:'#881337' },
      move_blocks:    { colourPrimary:'#3b82f6', colourSecondary:'#1d4ed8', colourTertiary:'#1e40af' },
      control_blocks: { colourPrimary:'#f97316', colourSecondary:'#c2410c', colourTertiary:'#9a3412' },
      sense_blocks:   { colourPrimary:'#22c55e', colourSecondary:'#15803d', colourTertiary:'#166534' },
      ai_blocks:      { colourPrimary:'#a855f7', colourSecondary:'#7e22ce', colourTertiary:'#6b21a8' },
      tools_blocks:   { colourPrimary:'#ec4899', colourSecondary:'#be185d', colourTertiary:'#9d174d' },
      lights_blocks:  { colourPrimary:'#06b6d4', colourSecondary:'#0e7490', colourTertiary:'#155e75' },
    },
    componentStyles: {
      workspaceBackgroundColour: '#0d1117',
      toolboxBackgroundColour:   '#161b22',
      toolboxForegroundColour:   '#c9d1d9',
      flyoutBackgroundColour:    '#21262d',
      flyoutForegroundColour:    '#e6edf3',
      flyoutOpacity:             1,
      scrollbarColour:           '#30363d',
      scrollbarOpacity:          0.7,
      cursorColour:              '#7c3aed',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBOX — dynamic per robot config
// ─────────────────────────────────────────────────────────────────────────────
function buildToolbox(rc) {
  const mov  = rc.movementId || 'wheels';
  const sens = rc.sensors || [];
  const tools = rc.tools || [];
  const hasSens  = (...n) => n.some(x => sens.includes(x));
  const hasTool  = (...n) => n.some(x => tools.includes(x));

  const b = (type) => ({ kind:'block', type });

  const moveBlocks = [
    b('robot_move_forward'), b('robot_move_backward'),
    b('robot_turn_left'), b('robot_turn_right'),
    b('robot_spin'), b('robot_stop'), b('robot_set_speed'),
  ];
  if (mov === 'flying' || mov === 'jets') { moveBlocks.push(b('robot_fly_up'), b('robot_fly_down')); }
  if (mov === 'hover')  { moveBlocks.push(b('robot_hover')); }
  if (mov === 'legs')   { moveBlocks.push(b('robot_jump')); }

  const senseBlocks = [b('robot_collision'), b('robot_battery_low')];
  if (hasSens('ultrasonic','lidar'))  { senseBlocks.push(b('robot_scan'), b('robot_obstacle_ahead')); }
  if (hasSens('line_sensor'))         { senseBlocks.push(b('robot_line_below')); }
  if (hasSens('camera'))              { senseBlocks.push(b('robot_look'), b('robot_see_object')); }

  const aiBlocks = [b('robot_patrol_area'), b('robot_return_home'), b('robot_search_area')];
  if (hasSens('ultrasonic','lidar'))  { aiBlocks.push(b('robot_avoid_obstacle')); }
  if (hasSens('line_sensor'))         { aiBlocks.push(b('robot_follow_line')); }
  if (hasSens('camera'))              { aiBlocks.push(b('robot_follow_target')); }

  const toolBlocks = [];
  if (hasTool('grabber','claw'))      { toolBlocks.push(b('robot_grab'), b('robot_release'), b('robot_rotate_arm')); }
  if (hasTool('drill'))               { toolBlocks.push(b('robot_drill')); }
  if (hasTool('laser'))               { toolBlocks.push(b('robot_fire_laser')); }
  if (hasSens('camera'))              { toolBlocks.push(b('robot_scan_object')); }

  const lightBlocks = [
    b('robot_led_on'), b('robot_led_off'), b('robot_flash'),
    b('robot_rainbow'), b('robot_play_sound'), b('robot_voice'),
  ];

  const contents = [
    { kind:'category', name:'⚡  Events',  colour:'#e11d48', contents:[b('robot_when_start')] },
    { kind:'category', name:'🏃  Move',    colour:'#3b82f6', contents:moveBlocks },
    { kind:'category', name:'🔁  Control', colour:'#f97316', contents:[b('robot_wait'),b('robot_repeat'),b('robot_forever'),b('robot_if_then')] },
    { kind:'category', name:'📡  Sense',   colour:'#22c55e', contents:senseBlocks },
    { kind:'category', name:'🧠  AI',      colour:'#a855f7', contents:aiBlocks },
    { kind:'category', name:'💡  Lights',  colour:'#06b6d4', contents:lightBlocks },
  ];
  if (toolBlocks.length > 0) {
    contents.splice(5, 0, { kind:'category', name:'🔧  Tools', colour:'#ec4899', contents:toolBlocks });
  }
  return { kind:'categoryToolbox', contents };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALK BLOCKLY TREE → flat action array for SimCanvas
// ─────────────────────────────────────────────────────────────────────────────
function walkBlocks(block) {
  const actions = [];
  while (block) {
    const t = block.type;
    const bid = block.id;

    if (t === 'robot_when_start') { /* hat — just walk next */ }
    else if (t === 'robot_move_forward')
      actions.push({ id:'move_forward',  cat:'move', icon:'⬆', label:'Move Forward',  blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||3 } });
    else if (t === 'robot_move_backward')
      actions.push({ id:'move_backward', cat:'move', icon:'⬇', label:'Reverse',        blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||2 } });
    else if (t === 'robot_turn_left')
      actions.push({ id:'turn_left',     cat:'move', icon:'↺', label:'Turn Left',      blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_turn_right')
      actions.push({ id:'turn_right',    cat:'move', icon:'↻', label:'Turn Right',     blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_spin')
      actions.push({ id:'spin',          cat:'move', icon:'🌀', label:'Spin Around',   blocklyId:bid, paramValues:{ degrees:360 } });
    else if (t === 'robot_stop')
      actions.push({ id:'stop',          cat:'move', icon:'⏹', label:'Stop',           blocklyId:bid, paramValues:{} });
    else if (t === 'robot_set_speed')
      actions.push({ id:'set_speed',     cat:'move', icon:'⚡', label:'Set Speed',      blocklyId:bid, paramValues:{ speed: block.getFieldValue('SPEED')||'medium' } });
    else if (t === 'robot_fly_up')
      actions.push({ id:'fly_up',        cat:'move', icon:'🚀', label:'Fly Up',        blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_fly_down')
      actions.push({ id:'fly_down',      cat:'move', icon:'📉', label:'Fly Down',      blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_hover')
      actions.push({ id:'hover_hold',    cat:'move', icon:'🛸', label:'Hover',         blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||1 } });
    else if (t === 'robot_jump')
      actions.push({ id:'jump',          cat:'move', icon:'⬆', label:'Jump',           blocklyId:bid, paramValues:{} });
    else if (t === 'robot_wait')
      actions.push({ id:'wait',          cat:'control', icon:'⏸', label:'Wait',        blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||1 } });
    else if (t === 'robot_repeat') {
      const times = Math.max(1, parseInt(block.getFieldValue('TIMES'))||3);
      const inner = block.getInputTargetBlock('DO');
      const innerActs = inner ? walkBlocks(inner) : [];
      for (let i = 0; i < times; i++) innerActs.forEach(a => actions.push({...a}));
    }
    else if (t === 'robot_forever') {
      const inner = block.getInputTargetBlock('DO');
      const innerActs = inner ? walkBlocks(inner) : [];
      for (let i = 0; i < 5; i++) innerActs.forEach(a => actions.push({...a}));
    }
    else if (t === 'robot_if_then') {
      // simplified: always execute the body in simulation
      const inner = block.getInputTargetBlock('DO');
      const innerActs = inner ? walkBlocks(inner) : [];
      innerActs.forEach(a => actions.push(a));
    }
    else if (t === 'robot_obstacle_ahead' || t === 'robot_collision')
      actions.push({ id:'obstacle_ahead', cat:'sense', icon:'🚧', label:'Obstacle?',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_line_below')
      actions.push({ id:'line_below',     cat:'sense', icon:'〰', label:'Line Below?', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_see_object')
      actions.push({ id:'see_object',     cat:'sense', icon:'👁', label:'See Object?', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_battery_low')
      actions.push({ id:'battery_low',    cat:'sense', icon:'🔋', label:'Battery Low?',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_scan')
      actions.push({ id:'scan',           cat:'sense', icon:'📡', label:'Scan',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_look')
      actions.push({ id:'look',           cat:'sense', icon:'👁', label:'Look Around', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_avoid_obstacle')
      actions.push({ id:'avoid_obstacle', cat:'ai',    icon:'🛡', label:'Avoid',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_follow_line')
      actions.push({ id:'follow_line',    cat:'ai',    icon:'〰', label:'Follow Line', blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||5 } });
    else if (t === 'robot_patrol_area')
      actions.push({ id:'patrol_area',    cat:'ai',    icon:'🔄', label:'Patrol Area', blocklyId:bid, paramValues:{ laps: +block.getFieldValue('LAPS')||2 } });
    else if (t === 'robot_follow_target')
      actions.push({ id:'follow_target',  cat:'ai',    icon:'🎯', label:'Follow Target',blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||4 } });
    else if (t === 'robot_return_home')
      actions.push({ id:'return_home',    cat:'ai',    icon:'🏠', label:'Return Home', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_search_area')
      actions.push({ id:'search_area',    cat:'ai',    icon:'🔍', label:'Search Area', blocklyId:bid, paramValues:{ radius: +block.getFieldValue('RADIUS')||3 } });
    else if (t === 'robot_grab')
      actions.push({ id:'grab',           cat:'tools', icon:'✊', label:'Grab',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_release')
      actions.push({ id:'release',        cat:'tools', icon:'👐', label:'Release',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_rotate_arm')
      actions.push({ id:'rotate_arm',     cat:'tools', icon:'🦾', label:'Rotate Arm', blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_drill')
      actions.push({ id:'drill',          cat:'tools', icon:'🔩', label:'Drill',       blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||2 } });
    else if (t === 'robot_fire_laser')
      actions.push({ id:'fire_laser',     cat:'tools', icon:'⚡', label:'Laser',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_scan_object')
      actions.push({ id:'scan_object',    cat:'tools', icon:'📷', label:'Scan Object', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_led_on')
      actions.push({ id:'lights_on',      cat:'lights',icon:'💡', label:'LEDs On',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_led_off')
      actions.push({ id:'lights_off',     cat:'lights',icon:'🌑', label:'LEDs Off',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_flash')
      actions.push({ id:'flash',          cat:'lights',icon:'✨', label:'Flash',        blocklyId:bid, paramValues:{ times: +block.getFieldValue('TIMES')||3 } });
    else if (t === 'robot_rainbow')
      actions.push({ id:'rainbow',        cat:'lights',icon:'🌈', label:'Rainbow',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_play_sound')
      actions.push({ id:'play_sound',     cat:'lights',icon:'🔊', label:'Play Sound',  blocklyId:bid, paramValues:{ sound: block.getFieldValue('SOUND')||'beep' } });
    else if (t === 'robot_voice')
      actions.push({ id:'robot_voice',    cat:'lights',icon:'🤖', label:'Robot Voice', blocklyId:bid, paramValues:{} });

    block = block.getNextBlock();
  }
  return actions;
}

function extractActionsFromWorkspace(ws) {
  if (!ws) return [];
  const topBlocks = ws.getTopBlocks(true);
  // Find the hat block
  const hat = topBlocks.find(b => b.type === 'robot_when_start');
  if (hat) return walkBlocks(hat.getNextBlock());
  // Fall back: walk all top-level stacks
  const all = [];
  topBlocks.forEach(b => { if (b.type !== 'robot_when_start') all.push(...walkBlocks(b)); });
  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART PROFILES — arena + challenge per robot type
// ─────────────────────────────────────────────────────────────────────────────
function getSmartProfile(rc) {
  const mov = rc.movementId || 'wheels';
  const tools = rc.tools || [];
  if (mov === 'flying' || mov === 'jets') return {
    arenaType:'sky', arenaLabel:'Sky Testing Facility', tipIcon:'✈️', tip:'Great for aerial challenges!',
    challenges:[
      { id:'ring_dash',  name:'Ring Dash',         icon:'💫', desc:'Fly through all the sky rings!',    color:'#0ea5e9', obstacles:5, totalDist:25 },
      { id:'altitude',   name:'Altitude Challenge', icon:'🚀', desc:'Reach maximum altitude fastest!',   color:'#7c3aed', obstacles:3, totalDist:20 },
      { id:'sky_maze',   name:'Sky Maze',           icon:'🌀', desc:'Navigate the aerial obstacle maze.',color:'#ec4899', obstacles:8, totalDist:30 },
      { id:'cargo_drop', name:'Cargo Drop',         icon:'📦', desc:'Drop cargo onto the target zones.', color:'#f59e0b', obstacles:4, totalDist:22 },
    ],
  };
  if (mov === 'hover') return {
    arenaType:'hover', arenaLabel:'Anti-Gravity Arena', tipIcon:'🛸', tip:'Built for hover challenges!',
    challenges:[
      { id:'platform_hop',  name:'Platform Hop',  icon:'🔵', desc:'Hop between floating platforms!', color:'#06b6d4', obstacles:5, totalDist:22 },
      { id:'antigrav_race', name:'Anti-Grav Race', icon:'⚡', desc:'Float through the energy gates!',  color:'#7c3aed', obstacles:4, totalDist:18 },
      { id:'float_fetch',   name:'Float & Fetch',  icon:'💎', desc:'Collect gems in mid-air!',          color:'#0ea5e9', obstacles:6, totalDist:25 },
      { id:'hover_maze',    name:'Hover Maze',     icon:'🌀', desc:'Find your way through the maze!',  color:'#f59e0b', obstacles:9, totalDist:30 },
    ],
  };
  if (mov === 'legs') return {
    arenaType:'terrain', arenaLabel:'Terrain Traversal Zone', tipIcon:'🕷️', tip:'Optimised for climbing!',
    challenges:[
      { id:'terrain_trek', name:'Terrain Trek',    icon:'🏔️', desc:'Cross the rough terrain!',         color:'#10b981', obstacles:6, totalDist:25 },
      { id:'step_stones',  name:'Stepping Stones', icon:'🪨', desc:'Jump across the stepping stones!', color:'#f59e0b', obstacles:5, totalDist:20 },
      { id:'wall_climb',   name:'Wall Climb',      icon:'🧗', desc:'Scale the vertical walls!',         color:'#ef4444', obstacles:7, totalDist:28 },
      { id:'speed_walk',   name:'Speed Walk',      icon:'⚡', desc:'Race on four legs!',                color:'#8b5cf6', obstacles:4, totalDist:18 },
    ],
  };
  if (mov === 'tracks') return {
    arenaType:'rough', arenaLabel:'Rough Terrain Course', tipIcon:'🚜', tip:'Great for heavy terrain!',
    challenges:[
      { id:'obstacle',   name:'Obstacle Course', icon:'🏁', desc:'Crush through the obstacle course!', color:'#22c55e', obstacles:10, totalDist:22 },
      { id:'cargo_push', name:'Cargo Push',      icon:'📦', desc:'Push heavy cargo to the target!',    color:'#f59e0b', obstacles:5,  totalDist:18 },
      { id:'rough_run',  name:'Rough Run',       icon:'🪨', desc:'Tackle the rocky environment!',      color:'#8b5cf6', obstacles:12, totalDist:30 },
      { id:'ramp_king',  name:'Ramp King',       icon:'🏔️', desc:'Climb all the ramps to the top!',   color:'#0ea5e9', obstacles:6,  totalDist:22 },
    ],
  };
  if (tools.includes('grabber') || tools.includes('claw')) return {
    arenaType:'factory', arenaLabel:'Industrial Workstation', tipIcon:'🦾', tip:'This robot can carry cargo!',
    challenges:[
      { id:'sorting',  name:'Sorting Line',  icon:'🏭', desc:'Sort the coloured boxes!',          color:'#0ea5e9', obstacles:5, totalDist:15 },
      { id:'stacking', name:'Tower Builder', icon:'📦', desc:'Stack boxes as high as you can!',   color:'#22c55e', obstacles:4, totalDist:12 },
      { id:'assembly', name:'Assembly Task', icon:'🔩', desc:'Assemble all the parts correctly!', color:'#f59e0b', obstacles:6, totalDist:18 },
      { id:'delivery', name:'Delivery Run',  icon:'🚚', desc:'Deliver cargo to the dropoff!',     color:'#8b5cf6', obstacles:5, totalDist:16 },
    ],
  };
  return {
    arenaType:'ground', arenaLabel:'STEM Challenge Arena', tipIcon:'🤖', tip:'Perfect for maze navigation!',
    challenges:[
      { id:'obstacle', name:'Obstacle Course', icon:'🏁', desc:'Navigate obstacles to the finish!', color:'#22c55e', obstacles:10, totalDist:22 },
      { id:'speedrun', name:'Speed Run',        icon:'⚡', desc:'Beat the clock, full speed!',        color:'#f59e0b', obstacles:5,  totalDist:16 },
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
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,65), new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.3,metalness:0.15}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; g.add(floor);
  const lm = new THREE.LineBasicMaterial({color:0xdde4ff});
  for(let i=-20;i<=20;i+=2){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,0.01,i*1.6),new THREE.Vector3(20,0.01,i*1.6)]),lm));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-32),new THREE.Vector3(i,0.01,22)]),lm));
  }
  [[40,5,0.3,0,-32,0,0x3b82f6],[40,5,0.3,0,22,0,0x10b981],[65,5,0.3,-20.2,-5,Math.PI/2,0x8b5cf6],[65,5,0.3,20.2,-5,Math.PI/2,0xf59e0b]].forEach(([ww,wh,wd,wx,wz,wr,wc])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(ww,wh,wd),new THREE.MeshStandardMaterial({color:wc,roughness:0.45,metalness:0.3}));
    m.position.set(wx,wh/2,wz); m.rotation.y=wr; m.castShadow=true; g.add(m);
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
  const ringColors=[0x00d9ff,0xfbbf24,0xef4444,0x22c55e,0x8b5cf6];
  [[-8,2.5,-5],[0,4,-10],[7,5.5,-16],[-6,3.5,-22],[3,6,-28]].forEach(([rx,ry,rz],i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.15,8,32),new THREE.MeshStandardMaterial({color:ringColors[i],emissive:ringColors[i],emissiveIntensity:1.0,transparent:true,opacity:0.88}));
    ring.rotation.y=Math.PI/4; ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
  });
  [[4,1,-8],[-5,2.5,-15],[3,3.5,-22]].forEach(([px,py,pz])=>{
    const plat=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.25,3.5),new THREE.MeshStandardMaterial({color:0x7c3aed,metalness:0.5,roughness:0.3}));
    plat.position.set(px,py,pz); g.add(plat);
  });
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
    const stone=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.85,0.28,8),stoneMat); stone.position.set(sx,sy,sz); stone.castShadow=true; g.add(stone);
  });
  [-7,-14,-21].forEach(z=>{
    const arch=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.12,8,24),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:1.0}));
    arch.rotation.x=Math.PI/2; arch.position.set(0,0.5,z); arch.name='cp'; g.add(arch);
  });
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
  const launchPad=new THREE.Mesh(new THREE.BoxGeometry(4,0.2,4),new THREE.MeshStandardMaterial({color:0x1e40af,metalness:0.8,roughness:0.2}));
  launchPad.position.set(0,0,5); g.add(launchPad);
  const platC=[0x7c3aed,0x0ea5e9,0xec4899,0x22c55e,0xf59e0b];
  [[-3,0.5,-4],[3,1,-8],[-2,1.5,-13],[3,2,-18],[-3,2.5,-23]].forEach(([px,py,pz],i)=>{
    const plat=new THREE.Mesh(new THREE.BoxGeometry(4,0.2,4),new THREE.MeshStandardMaterial({color:platC[i%platC.length],metalness:0.7,roughness:0.2}));
    plat.position.set(px,py,pz); g.add(plat);
    const ering=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.06,8,32),new THREE.MeshStandardMaterial({color:platC[i%platC.length],emissive:platC[i%platC.length],emissiveIntensity:0.8,transparent:true,opacity:0.7}));
    ering.rotation.x=Math.PI/2; ering.position.set(px,py+0.15,pz); ering.name='cp'; g.add(ering);
  });
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
  [-8,-15,-22].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.12,8,32),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.6,z); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _factoryArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.Fog(0x1a1a2e, 25, 50);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,40),new THREE.MeshStandardMaterial({color:0x374151,roughness:0.6,metalness:0.4}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const boxC=[0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xec4899];
  [[-8,-6],[-4,-6],[0,-6],[4,-6],[8,-6],[-6,-3],[-2,-3],[2,-3],[6,-3]].forEach(([bx,bz],i)=>{
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),new THREE.MeshStandardMaterial({color:boxC[i%boxC.length],roughness:0.4,metalness:0.2}));
    box.position.set(bx,0.3,bz); box.castShadow=true; g.add(box);
  });
  const beltMat=new THREE.MeshStandardMaterial({color:0x1f2937,roughness:0.5,metalness:0.6});
  [-8,-4,0,4,8].forEach(x=>{
    const belt=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.15,12),beltMat);
    belt.position.set(x,0.08,-2); g.add(belt);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.03,0.35),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.6}));
    stripe.position.set(x,0.17,-2); stripe.name='beltstripe'; g.add(stripe);
  });
  [-7,-14].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.1,8,32),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function buildSmartArena(scene, arenaType, challenge) {
  switch(arenaType) {
    case 'sky':     _skyArena(scene); break;
    case 'terrain': _terrainArena(scene); break;
    case 'hover':   _hoverArena(scene); break;
    case 'rough':   _roughArena(scene, challenge); break;
    case 'factory': _factoryArena(scene); break;
    default:        _groundArena(scene, challenge); break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PHYSICS
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
    case 'patrol':
    case 'patrol_area':    return (p.laps||2)*1.8;
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
    case 'look':           return 1.3;
    case 'avoid_obstacle': return 1.5;
    case 'follow_line':    return (p.steps||4)*0.6;
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
    case 'move_forward':  { const d=(p.steps||3)*1.9*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*8; break; }
    case 'move_backward': { const d=(p.steps||1)*1.9*spd; rs.x-=Math.sin(rs.angle)*(d/dur)*dt; rs.z-=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.5; rs.bobPhase+=dt*6; break; }
    case 'turn_left':     rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'turn_right':    rs.angle-=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'spin':          rs.angle+=(Math.PI*2)/dur*dt; break;
    case 'fly_up':        rs.y=Math.min(6,(rs.y||0)+2.5/dur*dt); break;
    case 'fly_down':      rs.y=Math.max(0,(rs.y||0)-2.5/dur*dt); break;
    case 'jump':          { const phase=rs.stepTime/dur; rs.y=Math.max(0,Math.sin(phase*Math.PI)*1.8); break; }
    case 'avoid_obstacle':{ rs.angle-=(Math.PI/2)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt*0.6; break; }
    case 'follow_line':   { const d=(p.steps||4)*1.5*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*7; break; }
    case 'patrol_area':   { rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; rs.angle+=dt*0.5; break; }
    case 'follow_target': { const d=(p.steps||3)*1.6*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break; }
    case 'return_home':   { const dx=-rs.x, dz=5-rs.z; const len=Math.sqrt(dx*dx+dz*dz)||1; rs.x+=dx/len*3*dt; rs.z+=dz/len*3*dt; rs.totalDist+=3*dt*0.4; break; }
    case 'search_area':   rs.angle+=(Math.PI*2)/dur*dt; break;
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
  const rafRef  = useRef(null);
  const fpsRef  = useRef({frames:0, last:0});
  const rsRef   = useRef({x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0});
  const lastActiveRef = useRef(-1);

  useEffect(()=>{ modeRef.current = runMode; },[runMode]);

  useEffect(()=>{
    const el = wrapRef.current; if(!el) return;
    const W=Math.max(el.clientWidth,1), H=Math.max(el.clientHeight,1);
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
    scene.add(new THREE.PointLight(0x4488ff,0.5,30)).position.set(-8,5,-5);
    scene.add(new THREE.PointLight(0xff8844,0.4,25)).position.set(8,4,5);

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

    const ro = new ResizeObserver(()=>{
      if(!el) return;
      const nW=Math.max(el.clientWidth,1), nH=Math.max(el.clientHeight,1);
      renderer.setSize(nW,nH); camera.aspect=nW/nH; camera.updateProjectionMatrix();
    });
    ro.observe(el);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const now = performance.now()/1000;
      const dt  = Math.min(now-lastTime, 0.05); lastTime=now;
      rs.t += dt;
      if(beamTimer>0){ beamTimer-=dt; if(beamTimer<=0) beamGroup.clear(); }

      fpsRef.current.frames++;
      if(now-fpsRef.current.last>=1){ onFpsUpdate?.(fpsRef.current.frames); fpsRef.current.frames=0; fpsRef.current.last=now; }

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
            if(['scan','obstacle_ahead','search_area','avoid_obstacle'].includes(bk.id)) flashBeam(0x00ff88,8);
            else if(['look','see_object','follow_target','scan_object'].includes(bk.id)) flashBeam(0xcc00ff,6);
            else if(bk.id==='fire_laser') flashBeam(0xff2200,12);
            else if(['patrol_area','follow_line'].includes(bk.id)) flashBeam(0x00aaff,5);

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
        onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:prog,done:rs.done});
        if(rs.done){ onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:100,done:true}); modeRef.current='idle'; }
      } else if(mode==='idle'){
        robot.rotation.y=Math.PI+Math.sin(rs.t*0.7)*0.08;
      }

      const {yOff,rollZ}=getGroundEffect(movId,rs.bobPhase||0,rs.t);
      robot.position.set(rs.x,rs.y+yOff,rs.z);
      robot.rotation.y=rs.angle; robot.rotation.z=rollZ;
      beamGroup.position.copy(robot.position); beamGroup.rotation.y=rs.angle;

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
// REAL BLOCKLY WORKSPACE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function BlocklyWorkspace({ robotConfig, wsRef, highlightId, onBlocksChange }) {
  const divRef = useRef(null);
  const prevHlRef = useRef(null);

  // Init / re-init when robot capabilities change
  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    registerRobotBlocks();
    const theme = makeBBTheme();
    const toolbox = buildToolbox(robotConfig);

    const ws = Blockly.inject(div, {
      toolbox,
      theme,
      grid: { spacing: 22, length: 4, colour: '#ffffff10', snap: true },
      move: { scrollbars: { horizontal:true, vertical:true }, drag:true, wheel:true },
      zoom: { controls:true, wheel:true, startScale:0.85, maxScale:3, minScale:0.25, scaleSpeed:1.2 },
      trashcan: true,
      sounds: false,
      renderer: 'zelos',
    });

    wsRef.current = ws;

    // Pre-load a starter program
    try {
      const startXml = [
        '<xml xmlns="https://developers.google.com/blockly/xml">',
        '  <block type="robot_when_start" x="30" y="30">',
        '    <next>',
        '      <block type="robot_move_forward">',
        '        <field name="STEPS">3</field>',
        '      </block>',
        '    </next>',
        '  </block>',
        '</xml>',
      ].join('');
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(startXml), ws);
    } catch(e) { /* ignore */ }

    // Resize handler
    const ro = new ResizeObserver(() => {
      if (!ws.isDisposed()) Blockly.svgResize(ws);
    });
    ro.observe(div);

    // Change listener for block count
    const onChange = () => { onBlocksChange?.(ws.getAllBlocks(false).length); };
    ws.addChangeListener(onChange);

    return () => {
      ws.removeChangeListener(onChange);
      ro.disconnect();
      ws.dispose();
      wsRef.current = null;
    };
  // Re-create when movement type / sensors / tools change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotConfig.movementId,
      JSON.stringify((robotConfig.sensors||[]).slice().sort()),
      JSON.stringify((robotConfig.tools||[]).slice().sort())]);

  // Highlight the active block during execution
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.isDisposed()) return;

    // Clear previous highlight
    if (prevHlRef.current) {
      const prev = ws.getBlockById(prevHlRef.current);
      if (prev) {
        try { prev.getSvgRoot().classList.remove('bb-exec-block'); } catch(e) {}
      }
    }

    // Apply new highlight
    if (highlightId) {
      const block = ws.getBlockById(highlightId);
      if (block) {
        try {
          const root = block.getSvgRoot();
          root.classList.add('bb-exec-block');
          // Scroll to block
          ws.centerOnBlock(block.id);
        } catch(e) {}
      }
    }
    prevHlRef.current = highlightId;
  }, [highlightId]);

  return (
    <div
      ref={divRef}
      style={{ width:'100%', height:'100%', position:'relative', display:'block' }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEMS PANEL (right column)
// ─────────────────────────────────────────────────────────────────────────────
function SystemsPanel({ robotConfig, stats, challenge, profile, isRunning, fps }) {
  const battColor = stats.battery>60?'#22c55e':stats.battery>30?'#f59e0b':'#ef4444';
  const timeStr   = String(Math.floor(stats.time/60)).padStart(2,'0')+':'+String(Math.floor(stats.time%60)).padStart(2,'0');
  const circ      = 2*Math.PI*22;
  const sensors   = [...(robotConfig.sensors||[]), ...(robotConfig.tools||[]).filter(t=>['lidar','camera','ultrasonic'].includes(t))];
  return (
    <div style={{flex:'0 0 250px',display:'flex',flexDirection:'column',background:'#161b22',borderLeft:'1px solid #21262d',overflow:'hidden'}}>
      {/* Robot card */}
      <div style={{padding:'12px',borderBottom:'1px solid #21262d',background:'#0d1117',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🤖</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{robotConfig.name||'My Robot'}</div>
            <div style={{fontSize:9,color:challenge.color,fontWeight:700,marginTop:1}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>
        <div style={{marginTop:8,display:'flex',gap:4,flexWrap:'wrap'}}>
          <span style={{fontSize:8,background:'rgba(59,130,246,.16)',color:'#60a5fa',border:'1px solid rgba(59,130,246,.28)',borderRadius:4,padding:'2px 7px',fontWeight:700}}>{robotConfig.movementId||'wheels'}</span>
          {fps!==null&&fps!==undefined&&<span style={{fontSize:8,background:'rgba(34,197,94,.14)',color:'#4ade80',border:'1px solid rgba(34,197,94,.28)',borderRadius:4,padding:'2px 7px',fontWeight:700}}>{fps} fps</span>}
        </div>
      </div>

      {/* Systems status */}
      <div style={{padding:'12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:10}}>Systems</div>
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,color:'#9ca3af'}}>🔋 Battery</span>
            <span style={{fontSize:11,fontWeight:800,color:battColor}}>{Math.round(stats.battery)}%</span>
          </div>
          <div className="sys-bar-track"><div className="sys-bar-fill" style={{width:stats.battery+'%',background:battColor}}/></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
          <span style={{fontSize:10,color:'#9ca3af'}}>📏 Distance</span>
          <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff'}}>{stats.dist.toFixed(1)} m</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
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
        <div style={{padding:'12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
          <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:8}}>Sensors</div>
          {sensors.slice(0,6).map(s=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:isRunning?'#22c55e':'#374151',boxShadow:isRunning?'0 0 7px #22c55e':'none',transition:'all .3s',flexShrink:0}} />
              <span style={{fontSize:10,color:'#9ca3af'}}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Challenge progress */}
      <div style={{padding:'12px',display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:8,alignSelf:'flex-start'}}>Challenge</div>
        <div style={{fontSize:11,color:challenge.color,fontWeight:700,marginBottom:10,textAlign:'center'}}>{challenge.icon} {challenge.name}</div>
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
      <div style={{marginTop:'auto',padding:'10px 12px',borderTop:'1px solid #21262d',background:'rgba(124,58,237,.06)',flexShrink:0}}>
        <div style={{fontSize:9,color:'#6b7280',lineHeight:1.6}}>{profile.tipIcon} {profile.tip}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE LAB PAGE — main component
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveLabPage({ robotConfig: robotConfigProp, onFpsUpdate }) {
  const rc = useMemo(() => {
    const stored = localStorage.getItem('bb-studio-robot');
    try {
      return robotConfigProp || (stored ? JSON.parse(stored) : { name:'ByteBot', movementId:'wheels', sensors:[], tools:[], lightId:'basic' });
    } catch(e) { return { name:'ByteBot', movementId:'wheels', sensors:[], tools:[], lightId:'basic' }; }
  }, [robotConfigProp]);

  const workspaceRef  = useRef(null);   // Blockly workspace object
  const codeBlocksRef = useRef([]);     // current flat action array (for highlight lookup)
  const simKeyRef     = useRef(0);

  const [runMode,     setRunMode]     = useState('idle');
  const [stepTrig,    setStepTrig]    = useState(0);
  const [codeBlocks,  setCodeBlocks]  = useState([]);
  const [highlightId, setHighlightId] = useState(null);  // Blockly block UUID to highlight
  const [blockCount,  setBlockCount]  = useState(0);
  const [stats,       setStats]       = useState({time:0,dist:0,battery:100,avoided:0,progress:0});
  const [activity,    setActivity]    = useState(['🤖 Drag blocks into the workspace, then press  ▶ Run!']);
  const [fps,         setFps]         = useState(null);
  const [challengeI,  setChallengeI]  = useState(0);
  const [simKey,      setSimKey]      = useState(0);

  // Keep ref in sync so handleBlockActive can look up without stale closure
  useEffect(() => { codeBlocksRef.current = codeBlocks; }, [codeBlocks]);

  const profile   = useMemo(() => getSmartProfile(rc), [rc]);
  const challenge = profile.challenges[Math.min(challengeI, profile.challenges.length-1)];

  const isRunning = runMode === 'running';
  const isPaused  = runMode === 'paused';
  const isIdle    = runMode === 'idle';

  // ── Extract Blockly workspace → flat action array ─────────────────────────
  const extractBlocks = useCallback(() => extractActionsFromWorkspace(workspaceRef.current), []);

  // ── Run ───────────────────────────────────────────────────────────────────
  const doRun = useCallback(() => {
    const acts = extractBlocks();
    if (acts.length === 0) {
      setActivity(['Add at least one block below the  🚀 When START clicked  hat!']);
      return;
    }
    setCodeBlocks(acts);
    simKeyRef.current++;
    setSimKey(simKeyRef.current);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setHighlightId(null);
    setRunMode('running');
    setActivity([rc.name+' launching! 🚀', 'Challenge: '+challenge.name, acts.length+' blocks ready']);
  }, [extractBlocks, rc, challenge]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const doPause = useCallback(() => {
    setRunMode(m => m === 'paused' ? 'running' : 'paused');
  }, []);

  // ── Step ──────────────────────────────────────────────────────────────────
  const doStep = useCallback(() => {
    if (isIdle) {
      const acts = extractBlocks();
      setCodeBlocks(acts);
      simKeyRef.current++;
      setSimKey(simKeyRef.current);
      setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
      setHighlightId(null);
    }
    setRunMode('step');
    setStepTrig(t => t+1);
  }, [isIdle, extractBlocks]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const doReset = useCallback(() => {
    simKeyRef.current++;
    setSimKey(simKeyRef.current);
    setRunMode('idle');
    setHighlightId(null);
    setCodeBlocks([]);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setActivity(['🔄 Reset! Build your program and press  ▶ Run']);
    // Clear workspace highlights
    const ws = workspaceRef.current;
    if (ws && !ws.isDisposed()) {
      ws.getAllBlocks(false).forEach(b => {
        try { b.getSvgRoot().classList.remove('bb-exec-block'); } catch(e) {}
      });
    }
  }, []);

  // ── Clear workspace ───────────────────────────────────────────────────────
  const doClear = useCallback(() => {
    const ws = workspaceRef.current;
    if (!ws || ws.isDisposed()) return;
    ws.clear();
    try {
      const startXml = '<xml><block type="robot_when_start" x="30" y="30"></block></xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(startXml), ws);
    } catch(e) {}
    setActivity(['🗑 Workspace cleared — start fresh!']);
  }, []);

  // ── Block highlight from SimCanvas ────────────────────────────────────────
  const handleBlockActive = useCallback((idx) => {
    const b = codeBlocksRef.current[idx];
    setHighlightId(b?.blocklyId ?? null);
  }, []);

  const handleProgress = useCallback((data) => {
    setStats({time:data.time,dist:data.dist,battery:data.battery,avoided:data.avoided,progress:data.progress});
    if (data.done) {
      setRunMode('idle');
      setHighlightId(null);
      setActivity(a => [...a, '🏆 Program complete! Great job!']);
    }
  }, []);

  const handleFps = useCallback((f) => { setFps(f); onFpsUpdate?.(f); }, [onFpsUpdate]);

  const statusCol = isRunning?'#22c55e':isPaused?'#f59e0b':'#6b7280';
  const statusTxt = isRunning?'Running':isPaused?'Paused':'Ready';

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#0d1117',overflow:'hidden',color:'#f0f6ff',fontFamily:'system-ui,sans-serif'}}>

      {/* ══════ TOP BAR ══════ */}
      <div style={{height:52,background:'#161b22',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 14px',gap:10,flexShrink:0}}>
        {/* Robot identity */}
        <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',lineHeight:1.2}}>{rc.name||'My Robot'}</div>
            <div style={{fontSize:8,color:'#6b7280'}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>

        {/* Challenge tabs */}
        <div style={{display:'flex',gap:2,padding:'2px',background:'rgba(0,0,0,.3)',borderRadius:9,overflow:'auto',flex:1,maxWidth:420,flexShrink:0}}>
          {profile.challenges.map((ch,i)=>(
            <button key={ch.id} onClick={()=>!isRunning&&setChallengeI(i)}
              style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:6,border:'none',
                cursor:isRunning?'default':'pointer',whiteSpace:'nowrap',transition:'all .14s',
                background:i===challengeI?(ch.color+'22'):'transparent',
                borderBottom:i===challengeI?('2px solid '+ch.color):'2px solid transparent',
                color:i===challengeI?ch.color:'#6b7280',fontSize:10,fontWeight:700}}>
              <span>{ch.icon}</span><span>{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{display:'flex',gap:4,marginLeft:'auto',flexShrink:0,alignItems:'center'}}>
          {isIdle&&(
            <button onClick={doRun}
              style={{padding:'7px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer',boxShadow:'0 2px 8px rgba(34,197,94,.4)'}}>
              ▶ Run
            </button>
          )}
          {isRunning&&(
            <button onClick={doPause}
              style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#f59e0b',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>
              ⏸ Pause
            </button>
          )}
          {isPaused&&(
            <button onClick={doPause}
              style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>
              ▶ Resume
            </button>
          )}
          {(isRunning||isPaused)&&(
            <button onClick={doReset}
              style={{padding:'7px 10px',borderRadius:8,border:'none',background:'#ef4444',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>
              ■ Stop
            </button>
          )}
          <button onClick={doStep} title="Step one block"
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

      {/* ══════ 3-COLUMN MAIN AREA ══════ */}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* ━━ LEFT: REAL BLOCKLY WORKSPACE ━━ */}
        <div style={{flex:'0 0 38%',minWidth:300,maxWidth:520,display:'flex',flexDirection:'column',background:'#0d1117',borderRight:'1px solid #21262d',overflow:'hidden'}}>
          {/* Workspace header */}
          <div style={{height:38,background:'#161b22',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 12px',gap:8,flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:700,color:'#8b949e',flex:1}}>
              🧩 Block Workspace
              {blockCount>0&&<span style={{marginLeft:6,background:'rgba(124,58,237,.2)',color:'#c084fc',borderRadius:10,padding:'1px 7px',fontSize:9,fontWeight:800}}>{blockCount} blocks</span>}
            </span>
            <button onClick={doClear}
              style={{padding:'3px 10px',borderRadius:6,border:'1px solid #30363d',background:'transparent',color:'#6b7280',fontSize:10,fontWeight:700,cursor:'pointer'}}>
              🗑 Clear
            </button>
          </div>

          {/* Blockly injection target */}
          <div style={{flex:1,position:'relative',overflow:'hidden'}}>
            <BlocklyWorkspace
              robotConfig={rc}
              wsRef={workspaceRef}
              highlightId={highlightId}
              onBlocksChange={setBlockCount}
            />
          </div>
        </div>

        {/* ━━ CENTER: 3D ARENA (hero) ━━ */}
        <div style={{flex:1,position:'relative',overflow:'hidden',background:'#0d1117',minWidth:0}}>
          <SimCanvas
            key={simKey}
            robotConfig={rc}
            codeBlocks={codeBlocks}
            runMode={runMode}
            stepTrigger={stepTrig}
            onProgress={handleProgress}
            onFpsUpdate={handleFps}
            arenaType={profile.arenaType}
            challenge={challenge}
            onBlockActive={handleBlockActive}
          />

          {/* Progress bar overlay (top) */}
          {(isRunning||isPaused)&&(
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'rgba(0,0,0,.4)',zIndex:5}}>
              <div style={{height:'100%',background:challenge.color,width:stats.progress+'%',transition:'width .4s',boxShadow:'0 0 8px '+challenge.color}}/>
            </div>
          )}

          {/* Challenge badge overlay */}
          <div style={{position:'absolute',top:12,left:12,background:'rgba(13,17,23,.85)',backdropFilter:'blur(10px)',borderRadius:10,padding:'8px 12px',border:'1px solid #21262d',pointerEvents:'none',maxWidth:230,zIndex:4}}>
            <div style={{fontSize:12,fontWeight:800,color:challenge.color}}>{challenge.icon} {challenge.name}</div>
            <div style={{fontSize:9,color:'#6b7280',marginTop:2,lineHeight:1.4}}>{challenge.desc}</div>
          </div>

          {/* Ready hint (when idle + workspace has blocks) */}
          {isIdle&&blockCount>0&&(
            <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',background:'rgba(34,197,94,.15)',backdropFilter:'blur(8px)',borderRadius:20,padding:'8px 20px',border:'1px solid rgba(34,197,94,.4)',pointerEvents:'none',zIndex:4,whiteSpace:'nowrap'}}>
              <span style={{fontSize:11,fontWeight:700,color:'#4ade80'}}>✓ {blockCount} blocks ready — press  ▶ Run!</span>
            </div>
          )}

          {/* Completion banner */}
          {isIdle&&stats.progress>=99&&(
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(13,17,23,.92)',backdropFilter:'blur(14px)',borderRadius:16,padding:'24px 36px',border:'2px solid '+challenge.color,textAlign:'center',zIndex:10}}>
              <div style={{fontSize:32,marginBottom:8}}>🏆</div>
              <div style={{fontSize:20,fontWeight:800,color:challenge.color}}>Challenge Complete!</div>
              <div style={{fontSize:12,color:'#9ca3af',marginTop:6}}>{stats.dist.toFixed(1)} m · {timeStr(stats.time)}</div>
            </div>
          )}
        </div>

        {/* ━━ RIGHT: SYSTEMS PANEL ━━ */}
        <SystemsPanel
          robotConfig={rc}
          stats={stats}
          challenge={challenge}
          profile={profile}
          isRunning={isRunning}
          fps={fps}
        />
      </div>

      {/* ══════ ACTIVITY FEED ══════ */}
      <div style={{height:30,background:'#161b22',borderTop:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 14px',gap:10,overflow:'hidden',flexShrink:0}}>
        {activity.slice(-4).map((msg,i)=>(
          <span key={i} style={{fontSize:10,color:i===activity.slice(-4).length-1?'#c9d1d9':'#4b5563',whiteSpace:'nowrap',transition:'color .3s'}}>
            {i>0&&<span style={{margin:'0 4px',color:'#30363d'}}>·</span>}{msg}
          </span>
        ))}
      </div>
    </div>
  );
}

function timeStr(t) {
  return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');
}
"""

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(CODE.lstrip())

lines = CODE.strip().count('\n') + 1
print(f"Written {len(CODE)} chars ({lines} lines) to:\n  {OUT}")
