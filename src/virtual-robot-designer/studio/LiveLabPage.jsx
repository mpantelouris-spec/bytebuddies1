/**
 * LiveLabPage.jsx  —  ByteBuddies Real Blockly Simulator
 * Real Blockly workspace (left) | 3D arena (center) | Systems (right)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Blockly from 'blockly';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { buildRobotModel } from '../services/studio-robot-builder.js';
import './LiveLabPage.css';

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ROBOT BLOCK DEFINITIONS  (Blockly 10 JSON array format)
// ─────────────────────────────────────────────────────────────────────────────
const ROBOT_BLOCK_DEFS = [
  // ── EVENTS (hat block — no previousStatement) ────────────────────────────
  { type:'robot_when_start', message0:'🚀  When  START  clicked',
    nextStatement:null, style:'event_blocks', hat:'cap',
    tooltip:'Start your robot program here' },

  // ── MOVEMENT ─────────────────────────────────────────────────────────────
  { type:'robot_move_forward', message0:'⬆  Move forward  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:3,min:1,max:20,precision:1}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Move the robot forward' },

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

  { type:'robot_set_speed', message0:'⚡  Set speed  %1',
    args0:[{type:'field_dropdown',name:'SPEED',options:[['slow 🐢','slow'],['medium 🏃','medium'],['fast 🚀','fast'],['turbo ⚡','turbo']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  { type:'robot_fly_up', message0:'🚀  Fly up  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires flying or jet propulsion' },

  { type:'robot_fly_down', message0:'📉  Fly down  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks',
    tooltip:'Requires flying or jet propulsion' },

  { type:'robot_hover', message0:'🛸  Hover  %1  seconds',
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

  { type:'robot_repeat',
    message0:'🔁  Repeat  %1  times', args0:[{type:'field_number',name:'TIMES',value:3,min:1,max:20,precision:1}],
    message1:'do  %1', args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Repeat the blocks inside this many times' },

  { type:'robot_forever',
    message0:'♾  Forever',
    message1:'do  %1', args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Repeat forever — press Stop to end' },

  { type:'robot_if_then',
    message0:'❓  If  %1', args0:[{type:'input_value',name:'COND',check:'Boolean'}],
    message1:'then  %1', args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks',
    tooltip:'Run the blocks inside only when the condition is true' },

  // ── SENSORS — boolean (hexagon) blocks ───────────────────────────────────
  { type:'robot_obstacle_ahead', message0:'🚧  obstacle ahead?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if an obstacle is in front' },

  { type:'robot_line_below', message0:'〰  line below?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if a line is detected below' },

  { type:'robot_see_object', message0:'👁  see object?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if camera detects an object' },

  { type:'robot_battery_low', message0:'🔋  battery low?',
    output:'Boolean', style:'sense_blocks',
    tooltip:'True if battery below 20%' },

  { type:'robot_collision', message0:'💥  collision?',
    output:'Boolean', style:'sense_blocks' },

  // sensor action blocks
  { type:'robot_scan', message0:'📡  Scan surroundings',
    previousStatement:null, nextStatement:null, style:'sense_blocks',
    tooltip:'Ultrasonic / lidar scan' },

  { type:'robot_look', message0:'👁  Look around',
    previousStatement:null, nextStatement:null, style:'sense_blocks',
    tooltip:'Camera look-around' },

  // ── AI BEHAVIOURS ────────────────────────────────────────────────────────
  { type:'robot_avoid_obstacle', message0:'🛡  Avoid obstacles',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  { type:'robot_follow_line', message0:'〰  Follow line  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:5,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'ai_blocks',
    tooltip:'Requires line sensor' },

  { type:'robot_patrol_area', message0:'🔄  Patrol area  %1  laps',
    args0:[{type:'field_number',name:'LAPS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  { type:'robot_follow_target', message0:'🎯  Follow target  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:4,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks',
    tooltip:'Requires camera' },

  { type:'robot_return_home', message0:'🏠  Return home',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  { type:'robot_search_area', message0:'🔍  Search radius  %1',
    args0:[{type:'field_number',name:'RADIUS',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  // ── TOOLS ────────────────────────────────────────────────────────────────
  { type:'robot_grab', message0:'✊  Grab object',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires grabber or claw' },

  { type:'robot_release', message0:'👐  Release',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires grabber or claw' },

  { type:'robot_rotate_arm', message0:'🦾  Rotate arm  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['30°','30'],['45°','45'],['90°','90'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires arm or claw' },

  { type:'robot_drill', message0:'🔩  Drill  %1  s',
    args0:[{type:'field_number',name:'SECS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires drill attachment' },

  { type:'robot_fire_laser', message0:'⚡  Fire laser',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires laser attachment' },

  { type:'robot_scan_object', message0:'📷  Scan object',
    previousStatement:null, nextStatement:null, style:'tools_blocks',
    tooltip:'Requires camera' },

  // ── LIGHTS & SOUND ───────────────────────────────────────────────────────
  { type:'robot_led_on',  message0:'💡  LEDs  ON',  previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_led_off', message0:'🌑  LEDs  OFF', previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_flash', message0:'✨  Flash  %1  times',
    args0:[{type:'field_number',name:'TIMES',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_rainbow', message0:'🌈  Rainbow mode',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_play_sound', message0:'🔊  Play  %1',
    args0:[{type:'field_dropdown',name:'SOUND',options:[['beep 🔔','beep'],['laser ⚡','laser'],['victory 🏆','victory'],['alarm 🚨','alarm']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  { type:'robot_voice', message0:'🤖  Robot says hi!',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  // ── DRONE / AERIAL ──────────────────────────────────────────────────────────
  { type:'robot_takeoff', message0:'🛸  Take off',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Lift off from ground' },
  { type:'robot_land', message0:'🛬  Land',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Set down on ground' },
  { type:'robot_rotate_air', message0:'🔄  Rotate mid-air  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_altitude_hold', message0:'✈️  Hold altitude  %1  s',
    args0:[{type:'field_number',name:'SECS',value:1,min:0.5,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_avoid_air_obstacle', message0:'🛡  Avoid air obstacle',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_aerial_scan', message0:'📡  Aerial scan',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },

  // ── JET PLANE ────────────────────────────────────────────────────────────────
  { type:'robot_thrust', message0:'🔥  Increase thrust',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_roll_left', message0:'↰  Roll left',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_roll_right', message0:'↱  Roll right',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_pitch_up', message0:'⬆  Pitch up',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_pitch_down', message0:'⬇  Pitch down',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_glide', message0:'🪂  Glide  %1  s',
    args0:[{type:'field_number',name:'SECS',value:2,min:1,max:8}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_jet_boost', message0:'⚡  Boost!',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_loop_maneuver', message0:'🔁  Loop maneuver',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── TANK / TRACKED ──────────────────────────────────────────────────────────
  { type:'robot_tank_steer', message0:'🎮  Tank steer  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left ↰','left'],['right ↱','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_rotate_place', message0:'🔄  Rotate in place  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['180°','180']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_push_object', message0:'💪  Push object',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Tank-push a heavy object' },
  { type:'robot_climb_mode', message0:'🏔️  Climb mode',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Engage low-gear for climbing' },
  { type:'robot_power_mode', message0:'⚡  Power mode',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Max torque — slow but powerful' },

  // ── SPIDER / WALKER ─────────────────────────────────────────────────────────
  { type:'robot_step_forward', message0:'🦶  Step forward  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:3,min:1,max:15}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_climb_wall', message0:'🧗  Climb wall',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Scale a vertical surface' },
  { type:'robot_stabilize_legs', message0:'⚖️  Stabilize legs',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Balance on rough terrain' },
  { type:'robot_crouch', message0:'🫳  Crouch',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_leap', message0:'🏃  Leap!',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Jump forward over a gap' },
  { type:'robot_terrain_detect', message0:'🔍  Terrain detect',
    output:'Boolean', style:'sense_blocks', tooltip:'True if on difficult terrain' },

  // ── FACTORY / ARM ────────────────────────────────────────────────────────────
  { type:'robot_stack_obj', message0:'📚  Stack object',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_sort_color', message0:'🎨  Sort by color',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_precision_mode', message0:'🎯  Precision mode',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Fine motor control' },

  // ── UNDERWATER ───────────────────────────────────────────────────────────────
  { type:'robot_dive', message0:'⬇  Dive  %1  m',
    args0:[{type:'field_number',name:'DEPTH',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_ascend_water', message0:'⬆  Ascend  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_sonar', message0:'📡  Sonar scan',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_water_stabilize', message0:'⚖️  Water stabilize',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_sample_collect', message0:'🧪  Collect sample',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },

  // ── HOVER ────────────────────────────────────────────────────────────────────
  { type:'robot_hover_stabilize', message0:'🛸  Hover stabilize',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_antigrav_boost', message0:'⚡  Anti-gravity boost',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_side_drift', message0:'↔  Side drift  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left','left'],['right','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_float_up', message0:'🔮  Float upward  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:1,min:0.5,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── ADVANCED MOVEMENT ────────────────────────────────────────────────────────
  { type:'robot_drift', message0:'🌀  Drift  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left','left'],['right','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_strafe', message0:'↔  Strafe  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_boost', message0:'🚀  Boost!',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_brake', message0:'🛑  Brake',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_navigate_checkpoint', message0:'📍  Navigate to checkpoint',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_random_move', message0:'🎲  Random movement',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── MORE FLY BLOCKS ──────────────────────────────────────────────────────────
  { type:'robot_barrel_roll', message0:'🔄  Barrel roll  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left','left'],['right','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Requires flying propulsion' },
  { type:'robot_stabilize_flight', message0:'⚖️  Stabilize flight',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_yaw', message0:'↺  Yaw  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left','left'],['right','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_air_brake', message0:'🛑  Air brake',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_autopilot', message0:'🤖  Autopilot  %1  s',
    args0:[{type:'field_number',name:'SECS',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── MORE WALKING ─────────────────────────────────────────────────────────────
  { type:'robot_walk', message0:'🚶  Walk  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:4,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_balance', message0:'⚖️  Balance',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── MORE ARM BLOCKS ──────────────────────────────────────────────────────────
  { type:'robot_extend_arm', message0:'📏  Extend arm',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_retract_arm', message0:'📏  Retract arm',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_place_item', message0:'📍  Place item',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_precision_grip', message0:'🎯  Precision grip',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },

  // ── MORE TOOL BLOCKS ─────────────────────────────────────────────────────────
  { type:'robot_activate_welder', message0:'🔥  Activate welder',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Requires welder attachment' },
  { type:'robot_repair_obj', message0:'🔧  Repair object',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Requires repair tool' },
  { type:'robot_pick_cargo', message0:'📦  Pick up cargo',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_deploy_cable', message0:'🔗  Deploy cable',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },

  // ── MORE SENSOR BLOCKS ───────────────────────────────────────────────────────
  { type:'robot_color_detect', message0:'🎨  color detected?',
    output:'Boolean', style:'sense_blocks', tooltip:'True if target colour is visible' },
  { type:'robot_motion_detect', message0:'🏃  motion detected?',
    output:'Boolean', style:'sense_blocks' },
  { type:'robot_target_found', message0:'🎯  target found?',
    output:'Boolean', style:'sense_blocks', tooltip:'True if target object is in range' },
  { type:'robot_distance_wall', message0:'📏  Distance to wall',
    output:'Number', style:'sense_blocks', tooltip:'Returns distance to nearest wall' },

  // ── LEGO MODE ────────────────────────────────────────────────────────────────
  { type:'robot_attach_block', message0:'🧱  Attach block',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_rotate_block', message0:'🔄  Rotate block  %1',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['90°','90'],['180°','180'],['270°','270']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_build_structure', message0:'🏗️  Build structure',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },

  // ── HUMANOID ─────────────────────────────────────────────────────────────────
  { type:'robot_wave', message0:'👋  Wave arm',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_carry_object', message0:'📦  Carry object',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_rotate_torso', message0:'🔄  Rotate torso  %1°',
    args0:[{type:'field_dropdown',name:'DEG',options:[['45°','45'],['90°','90'],['180°','180'],['270°','270']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_interact', message0:'🤝  Interact with object',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_balance_mode', message0:'⚖️  Activate balance mode',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_kneel', message0:'🧎  Kneel down',
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── UNDERWATER ────────────────────────────────────────────────────────────────
  { type:'robot_sonar_scan', message0:'🔊  Sonar scan',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_collect_sample', message0:'🧪  Collect sample',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_stabilize_underwater', message0:'⚓  Stabilize depth',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_pressure_check', message0:'🌡️  Pressure OK?',
    output:'Boolean', style:'sense_blocks' },

  // ── SPIDER EXTRA ─────────────────────────────────────────────────────────────
  { type:'robot_grip_surface', message0:'🦀  Grip surface',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_wall_cling', message0:'🧱  Cling to wall',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_spider_crawl', message0:'🕷️  Spider crawl  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:3,min:1,max:20,precision:1}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── VARIABLES ────────────────────────────────────────────────────────────────
  { type:'robot_var_set', message0:'📦  Set  %1  =  %2',
    args0:[{type:'field_input',name:'VAR',text:'score'},{type:'field_number',name:'VAL',value:0}],
    previousStatement:null, nextStatement:null, style:'variable_blocks', tooltip:'Set a variable to a value' },
  { type:'robot_var_change', message0:'📦  Change  %1  by  %2',
    args0:[{type:'field_input',name:'VAR',text:'score'},{type:'field_number',name:'DELTA',value:1}],
    previousStatement:null, nextStatement:null, style:'variable_blocks' },
  { type:'robot_var_get', message0:'📦  Get  %1',
    args0:[{type:'field_input',name:'VAR',text:'score'}],
    output:'Number', style:'variable_blocks' },

  // ── TIMER ────────────────────────────────────────────────────────────────────
  { type:'robot_timer_start', message0:'⏱  Start timer  %1',
    args0:[{type:'field_input',name:'TIMER',text:'t1'}],
    previousStatement:null, nextStatement:null, style:'timer_blocks' },
  { type:'robot_timer_check', message0:'⏱  Timer  %1  >  %2  s?',
    args0:[{type:'field_input',name:'TIMER',text:'t1'},{type:'field_number',name:'SECS',value:3,min:0.5,max:60}],
    output:'Boolean', style:'timer_blocks' },
  { type:'robot_timer_reset', message0:'⏱  Reset timer  %1',
    args0:[{type:'field_input',name:'TIMER',text:'t1'}],
    previousStatement:null, nextStatement:null, style:'timer_blocks' },

  // ── ADVANCED CONTROL ─────────────────────────────────────────────────────────
  { type:'robot_while',
    message0:'🔁  While  %1', args0:[{type:'input_value',name:'COND',check:'Boolean'}],
    message1:'do  %1',        args1:[{type:'input_statement',name:'DO'}],
    previousStatement:null, nextStatement:null, style:'control_blocks', tooltip:'Repeat while condition is true' },
  { type:'robot_wait_until',
    message0:'⏸  Wait until  %1', args0:[{type:'input_value',name:'COND',check:'Boolean'}],
    previousStatement:null, nextStatement:null, style:'control_blocks' },
  { type:'robot_if_else',
    message0:'❓  If  %1',  args0:[{type:'input_value',name:'COND',check:'Boolean'}],
    message1:'then  %1',     args1:[{type:'input_statement',name:'DO'}],
    message2:'else  %1',     args2:[{type:'input_statement',name:'ELSE'}],
    previousStatement:null, nextStatement:null, style:'control_blocks' },

  // ── ADVANCED MOVEMENT ────────────────────────────────────────────────────────
  { type:'robot_orbit_target', message0:'🔄  Orbit target  %1  laps',
    args0:[{type:'field_number',name:'LAPS',value:1,min:1,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Circle around target' },
  { type:'robot_maintain_distance', message0:'📏  Keep distance  %1  m',
    args0:[{type:'field_number',name:'DIST',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_follow_path', message0:'📍  Follow path  %1  waypoints',
    args0:[{type:'field_number',name:'PTS',value:4,min:2,max:8}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Navigate waypoints in order' },

  // ── DRONE ADVANCED ───────────────────────────────────────────────────────────
  { type:'robot_circle_target', message0:'⭕  Circle target  %1  m radius',
    args0:[{type:'field_number',name:'RADIUS',value:5,min:2,max:15}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_hover_scan', message0:'🔍  Hover scan area',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_follow_beacon', message0:'📡  Follow beacon signal',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_formation_fly', message0:'✈️  Formation fly  %1',
    args0:[{type:'field_dropdown',name:'POS',options:[['lead','lead'],['left wing','left'],['right wing','right']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_gimbal_track', message0:'🎥  Gimbal track object',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },

  // ── PLANE ADVANCED ───────────────────────────────────────────────────────────
  { type:'robot_split_s', message0:'💫  Split-S maneuver',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Half-roll then half-loop' },
  { type:'robot_immelmann', message0:'🔁  Immelmann turn',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Half-loop then half-roll' },
  { type:'robot_stall_recovery', message0:'⚠️  Stall recovery',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_autopilot_wp', message0:'🗺️  Autopilot to waypoint  %1',
    args0:[{type:'field_number',name:'WP',value:1,min:1,max:8}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  // ── SPIDER / WALKER ADVANCED ─────────────────────────────────────────────────
  { type:'robot_tripod_gait', message0:'🦀  Tripod gait',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'3+3 alternating legs for speed' },
  { type:'robot_wave_gait', message0:'🌊  Wave gait',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Sequential wave for terrain grip' },
  { type:'robot_leg_coord', message0:'⚙️  Leg mode  %1',
    args0:[{type:'field_dropdown',name:'MODE',options:[['tripod','tripod'],['wave','wave'],['ripple','ripple']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_claw_grip', message0:'🦀  Claw grip  %1',
    args0:[{type:'field_dropdown',name:'FORCE',options:[['light','light'],['medium','medium'],['strong','strong']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_ceiling_traverse', message0:'🕷️  Ceiling traverse',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Walk upside-down on ceiling' },

  // ── ROBOT ARM ADVANCED ───────────────────────────────────────────────────────
  { type:'robot_arm_goto', message0:'🎯  Arm to  X:%1  Y:%2  Z:%3',
    args0:[
      {type:'field_number',name:'X',value:0,min:-5,max:5},
      {type:'field_number',name:'Y',value:1,min:0,max:5},
      {type:'field_number',name:'Z',value:0,min:-5,max:5}
    ],
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Move arm to position' },
  { type:'robot_rotate_joint', message0:'🦾  Rotate  %1  by  %2°',
    args0:[
      {type:'field_dropdown',name:'JOINT',options:[['base','base'],['elbow','elbow'],['wrist','wrist']]},
      {type:'field_number',name:'DEG',value:45,min:-180,max:180}
    ],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_conveyor_sync', message0:'🏭  Sync with conveyor',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Match speed to belt' },
  { type:'robot_weld_point', message0:'🔥  Weld at position',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Requires welder attachment' },

  // ── AI ADVANCED ──────────────────────────────────────────────────────────────
  { type:'robot_map_env', message0:'🗺️  Map environment',
    previousStatement:null, nextStatement:null, style:'ai_blocks', tooltip:'SLAM-style mapping' },
  { type:'robot_guard_area', message0:'🛡️  Guard area  %1  m',
    args0:[{type:'field_number',name:'RADIUS',value:4,min:1,max:12}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_predict_obstacle', message0:'🧠  Predict obstacle?',
    output:'Boolean', style:'ai_blocks', tooltip:'AI predicts upcoming obstacle' },
  { type:'robot_eval_strategy', message0:'🧠  Evaluate best strategy',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_swarm_signal', message0:'📡  Swarm signal  %1',
    args0:[{type:'field_dropdown',name:'SIG',options:[['follow','follow'],['spread','spread'],['converge','converge']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  // ── SOUND / EFFECTS ──────────────────────────────────────────────────────────
  { type:'robot_stealth_mode', message0:'👻  Stealth mode  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON','on'],['OFF','off']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_emergency_lights', message0:'🚨  Emergency lights',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_countdown', message0:'⏳  Countdown  %1  s',
    args0:[{type:'field_number',name:'SECS',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_custom_sound', message0:'🎵  Play  %1',
    args0:[{type:'field_dropdown',name:'SND',options:[['engine rev 🔊','rev'],['siren 🚨','siren'],['radar ping 📡','ping'],['explosion 💥','boom'],['zap ⚡','zap']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  // ── ENVIRONMENT ──────────────────────────────────────────────────────────────
  { type:'robot_buoyancy_adjust', message0:'🌊  Buoyancy  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['sink ⬇','sink'],['rise ⬆','rise'],['neutral ⚖️','neutral']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Underwater buoyancy control' },
  { type:'robot_anti_grav', message0:'🔮  Anti-gravity  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON','on'],['OFF','off']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Zero-G station only' },
  { type:'robot_tool_change', message0:'🔧  Switch tool  %1',
    args0:[{type:'field_dropdown',name:'TOOL',options:[['gripper ✊','gripper'],['welder 🔥','welder'],['drill 🔩','drill'],['scanner 📷','scanner']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_pressure_equalize', message0:'⚖️  Pressure equalize',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Required before surfacing' },

  // ── SECURITY BOT ──────────────────────────────────────────────────────────────
  { type:'robot_patrol_route', message0:'🚔  Patrol route  %1',
    args0:[{type:'field_dropdown',name:'ROUTE',options:[['perimeter 🔁','perimeter'],['grid 📐','grid'],['random 🎲','random']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Security patrol pattern' },
  { type:'robot_investigate', message0:'🔍  Investigate  %1',
    args0:[{type:'field_dropdown',name:'TARGET',options:[['sound 🔊','sound'],['movement 👁','movement'],['anomaly ⚠️','anomaly']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_detect_intruder', message0:'🚨  Intruder detected?',
    output:'Boolean', style:'sense_blocks' },
  { type:'robot_activate_alarm', message0:'🚨  Activate  %1  alarm',
    args0:[{type:'field_dropdown',name:'TYPE',options:[['security 🚨','security'],['fire 🔥','fire'],['lockdown 🔒','lockdown']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_spotlight_target', message0:'🔦  Spotlight  %1',
    args0:[{type:'field_dropdown',name:'MODE',options:[['on target 🎯','target'],['sweep 🔄','sweep'],['off ⚫','off']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_scan_perimeter', message0:'📡  Scan perimeter',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_follow_suspect', message0:'👤  Follow suspect',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_return_to_station', message0:'🏠  Return to station',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_secure_zone', message0:'🔒  Secure zone  %1  m',
    args0:[{type:'field_number',name:'RADIUS',value:5,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_threat_assess', message0:'⚠️  Threat level?',
    output:'Number', style:'sense_blocks', tooltip:'Returns 0-10 threat score' },
  { type:'robot_guard_object', message0:'🛡️  Guard  %1',
    args0:[{type:'field_dropdown',name:'OBJ',options:[['entrance 🚪','entrance'],['asset 📦','asset'],['perimeter 🔁','perimeter']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_lock_entrance', message0:'🔐  Lock entrance',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_track_target', message0:'🎯  Track target  %1',
    args0:[{type:'field_dropdown',name:'MODE',options:[['visual 👁','visual'],['thermal 🌡','thermal'],['radar 📡','radar']]}],
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_monitor_camera', message0:'📹  Monitor camera  %1',
    args0:[{type:'field_number',name:'CAM',value:1,min:1,max:4}],
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_deploy_barrier', message0:'🚧  Deploy barrier',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_security_report', message0:'📋  Security report',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },

  // ── SPIDER ADVANCED ──────────────────────────────────────────────────────────
  { type:'robot_spider_sprint', message0:'⚡  Spider sprint  %1  steps',
    args0:[{type:'field_number',name:'STEPS',value:6,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Burst of speed on all 8 legs' },
  { type:'robot_terrain_adapt', message0:'🌿  Adapt to  %1  terrain',
    args0:[{type:'field_dropdown',name:'TERRAIN',options:[['rock 🪨','rock'],['sand 🏖️','sand'],['water 💧','water'],['ice 🧊','ice']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_ceiling_cling', message0:'🕷️  Cling to ceiling',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Magnetic grip on overhead surface' },
  { type:'robot_rotate_body', message0:'🔄  Rotate body  %1°',
    args0:[{type:'field_number',name:'DEG',value:90,min:-360,max:360}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_retract_legs', message0:'🦵  Retract legs',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Fold legs for tight spaces' },
  { type:'robot_extend_legs', message0:'🦵  Extend legs',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_pounce_target', message0:'🎯  Pounce on target',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Leap and grab target' },
  { type:'robot_stealth_crawl', message0:'🤫  Stealth crawl',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Silent low-profile movement' },
  { type:'robot_wall_jump', message0:'🧱  Wall jump',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_grip_strength', message0:'💪  Set grip  %1',
    args0:[{type:'field_dropdown',name:'LEVEL',options:[['light 🤏','light'],['firm ✊','firm'],['max 🔒','max']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_climb_over', message0:'🧗  Climb over obstacle',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_diagonal_movement', message0:'↗️  Move diagonal  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['front-right','fr'],['front-left','fl'],['back-right','br'],['back-left','bl']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_spider_evade', message0:'💨  Spider evade  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left ←','left'],['right →','right'],['back ↓','back']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_precision_climb', message0:'🎯  Precision climb  %1  cm',
    args0:[{type:'field_number',name:'DIST',value:10,min:1,max:100}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_wall_rotation', message0:'🌀  Wall rotation  %1°',
    args0:[{type:'field_number',name:'DEG',value:90,min:-360,max:360}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_cling_timer', message0:'⏱️  Cling for  %1  s',
    args0:[{type:'field_number',name:'SECS',value:3,min:1,max:30}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── DRONE ADVANCED ───────────────────────────────────────────────────────────
  { type:'robot_emergency_land', message0:'🆘  Emergency land',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Controlled emergency descent' },
  { type:'robot_altitude_hold', message0:'🔒  Hold altitude  %1  m',
    args0:[{type:'field_number',name:'ALT',value:5,min:0.5,max:50}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_wind_correction', message0:'🌬️  Wind correction  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON','on'],['OFF','off']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_maintain_altitude', message0:'🔁  Maintain altitude',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_drift_left', message0:'◀️  Drift left  %1  m',
    args0:[{type:'field_number',name:'DIST',value:1,min:0.1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_drift_right', message0:'▶️  Drift right  %1  m',
    args0:[{type:'field_number',name:'DIST',value:1,min:0.1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_boost_flight', message0:'⚡  Boost flight  %1  s',
    args0:[{type:'field_number',name:'SECS',value:2,min:0.5,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_auto_return', message0:'🏠  Auto return home',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_precision_landing', message0:'🎯  Precision landing',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_delivery_drop', message0:'📦  Drop delivery',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_aerial_tracking', message0:'👁️  Aerial track target',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_thermal_scan', message0:'🌡️  Thermal scan',
    output:'Boolean', style:'sense_blocks' },
  { type:'robot_aerial_mapping', message0:'🗺️  Aerial mapping',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },

  // ── UNIVERSAL MOVEMENT ───────────────────────────────────────────────────────
  { type:'robot_navigate_to', message0:'📍  Navigate to  X:%1  Z:%2',
    args0:[{type:'field_number',name:'X',value:0,min:-50,max:50},{type:'field_number',name:'Z',value:5,min:-50,max:50}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_follow_path', message0:'🛣️  Follow path  %1',
    args0:[{type:'field_dropdown',name:'PATH',options:[['waypoints 📍','waypoints'],['line ─','line'],['circle ○','circle']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_dock', message0:'🔌  Dock at station',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Seek and dock at charging station' },
  { type:'robot_temperature', message0:'🌡️  Temperature?',
    output:'Number', style:'sense_blocks' },
  { type:'robot_display_text', message0:'📺  Display  %1',
    args0:[{type:'field_input',name:'MSG',text:'Hello!'}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  // ── MOVEMENT — COMPLETE SET ──────────────────────────────────────────────────
  { type:'robot_move_to_xy', message0:'📍  Go to  X:%1  Z:%2',
    args0:[{type:'field_number',name:'X',value:0,min:-50,max:50},{type:'field_number',name:'Z',value:5,min:-50,max:50}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Navigate to world coordinates' },
  { type:'robot_face_direction', message0:'🧭  Face direction  %1°',
    args0:[{type:'field_number',name:'DEG',value:0,min:0,max:360}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'0=north 90=east 180=south 270=west' },
  { type:'robot_orbit_point', message0:'🔄  Orbit point  R:%1 m  speed:%2',
    args0:[{type:'field_number',name:'RADIUS',value:3,min:1,max:20},{type:'field_number',name:'SPEED',value:30,min:5,max:180}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Circular movement around current position' },
  { type:'robot_maintain_distance', message0:'↔️  Keep  %1  m from target',
    args0:[{type:'field_number',name:'DIST',value:2,min:0.5,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_random_walk', message0:'🎲  Random walk in  %1  m radius',
    args0:[{type:'field_number',name:'RADIUS',value:5,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_emergency_stop', message0:'🛑  EMERGENCY STOP',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Instant full stop' },
  { type:'robot_turn_smooth', message0:'↪️  Smooth turn  %1°  in  %2  s',
    args0:[{type:'field_number',name:'DEG',value:90,min:-360,max:360},{type:'field_number',name:'SECS',value:1,min:0.2,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_is_moving', message0:'🏃  is moving?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_get_speed', message0:'⚡  current speed (m/s)', output:'Number', style:'sense_blocks' },
  { type:'robot_get_distance_traveled', message0:'📏  distance traveled (m)', output:'Number', style:'sense_blocks' },
  { type:'robot_accelerate', message0:'⬆️  Accelerate  %1%',
    args0:[{type:'field_number',name:'PCT',value:50,min:0,max:100}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_decelerate', message0:'⬇️  Decelerate  %1%',
    args0:[{type:'field_number',name:'PCT',value:50,min:0,max:100}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── AI — COMPLETE SET ────────────────────────────────────────────────────────
  { type:'robot_explore_area', message0:'🗺️  Explore area  %1  m radius',
    args0:[{type:'field_number',name:'RADIUS',value:8,min:2,max:30}],
    previousStatement:null, nextStatement:null, style:'ai_blocks', tooltip:'Systematic coverage exploration' },
  { type:'robot_recognize_object', message0:'👁️  Find object  %1',
    args0:[{type:'field_input',name:'OBJ',text:'cube'}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_identify_color', message0:'🎨  Find color  %1',
    args0:[{type:'field_dropdown',name:'COLOR',options:[['red 🔴','red'],['blue 🔵','blue'],['green 🟢','green'],['yellow 🟡','yellow'],['orange 🟠','orange']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_identify_shape', message0:'🔷  Find shape  %1',
    args0:[{type:'field_dropdown',name:'SHAPE',options:[['cube','cube'],['sphere','sphere'],['cylinder','cylinder'],['cone','cone']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_locate_object', message0:'🔍  Locate and approach  %1',
    args0:[{type:'field_input',name:'OBJ',text:'target'}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_autonomous_nav', message0:'🚀  Autonomous navigate to  %1',
    args0:[{type:'field_input',name:'DEST',text:'goal'}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_smart_route', message0:'🧭  Calculate smart route',
    previousStatement:null, nextStatement:null, style:'ai_blocks', tooltip:'Plans optimal path to destination' },
  { type:'robot_investigate_sound', message0:'🔊  Investigate sound',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_return_to_charger', message0:'🔋  Return to charger',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_protect_object', message0:'🛡️  Protect object  %1  m',
    args0:[{type:'field_number',name:'DIST',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_adaptive_behavior', message0:'🧠  Adaptive behavior',
    previousStatement:null, nextStatement:null, style:'ai_blocks', tooltip:'AI adjusts to environment' },
  { type:'robot_threat_assessment', message0:'⚠️  Threat assessment',
    output:'Number', style:'ai_blocks', tooltip:'Returns threat level 0-100' },
  { type:'robot_priority_decision', message0:'🎯  Priority decision',
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_smart_avoid_obj', message0:'🧠  Smart avoid  %1',
    args0:[{type:'field_input',name:'OBJ',text:'obstacle'}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_formation_fly', message0:'🛸  Formation fly  %1',
    args0:[{type:'field_dropdown',name:'FMT',options:[['line ─','line'],['triangle △','triangle'],['square □','square'],['circle ○','circle']]}],
    previousStatement:null, nextStatement:null, style:'ai_blocks' },
  { type:'robot_get_nearby_objects', message0:'📡  Objects within  %1  m',
    args0:[{type:'field_number',name:'RADIUS',value:5,min:1,max:20}],
    output:'Number', style:'sense_blocks', tooltip:'Returns count of nearby objects' },
  { type:'robot_target_distance', message0:'📏  distance to target (m)', output:'Number', style:'sense_blocks' },
  { type:'robot_is_target_visible', message0:'👁️  target visible?', output:'Boolean', style:'sense_blocks' },

  // ── SENSORS — COMPLETE SET ───────────────────────────────────────────────────
  { type:'robot_line_detected', message0:'〰️  line detected?', output:'Boolean', style:'sense_blocks', tooltip:'Requires line sensor' },
  { type:'robot_face_detected', message0:'😊  face detected?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_sound_detected', message0:'🔊  sound detected?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_color_detected', message0:'🎨  color  %1  detected?',
    args0:[{type:'field_dropdown',name:'COLOR',options:[['red 🔴','red'],['blue 🔵','blue'],['green 🟢','green'],['yellow 🟡','yellow']]}],
    output:'Boolean', style:'sense_blocks' },
  { type:'robot_overheating', message0:'🌡️  overheating?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_object_picked_up', message0:'✊  holding object?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_wall_nearby', message0:'🧱  wall nearby?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_floor_edge', message0:'⚠️  floor edge ahead?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_water_detected', message0:'💧  water detected?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_light_level', message0:'☀️  light level (%)', output:'Number', style:'sense_blocks' },
  { type:'robot_pressure_reading', message0:'⚖️  pressure reading', output:'Number', style:'sense_blocks' },
  { type:'robot_humidity', message0:'💧  humidity (%)', output:'Number', style:'sense_blocks' },
  { type:'robot_distance_to', message0:'📏  distance to  %1  (m)',
    args0:[{type:'field_input',name:'OBJ',text:'wall'}],
    output:'Number', style:'sense_blocks' },
  { type:'robot_scan_surroundings', message0:'📡  Scan 360° surroundings',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_calibrate_sensor', message0:'🔧  Calibrate sensors',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },

  // ── EFFECTS — COMPLETE SET ───────────────────────────────────────────────────
  { type:'robot_headlights_on',  message0:'🔦  Headlights ON',  previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_headlights_off', message0:'🔦  Headlights OFF', previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_flash_leds', message0:'✨  Flash LEDs  %1',
    args0:[{type:'field_dropdown',name:'PATTERN',options:[['slow 🔅','slow'],['fast ⚡','fast'],['strobe 💫','strobe']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_warning_lights', message0:'🚨  Warning lights',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_pulse_lights', message0:'💓  Pulse lights  %1',
    args0:[{type:'field_colour',name:'COLOR',colour:'#00d9ff'}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_hologram_display', message0:'🔮  Hologram display  %1',
    args0:[{type:'field_input',name:'MSG',text:'BYTEBUDDIES'}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_robot_voice', message0:'🗣️  Say  %1',
    args0:[{type:'field_input',name:'PHRASE',text:'Hello world'}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_alarm_sound', message0:'🚨  Play alarm',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_success_sound', message0:'🎉  Play success sound',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_beep', message0:'📢  Beep  %1 Hz  for  %2  ms',
    args0:[{type:'field_number',name:'HZ',value:440,min:100,max:5000},{type:'field_number',name:'MS',value:300,min:50,max:2000}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_communication_ping', message0:'📡  Communication ping',
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_set_brightness', message0:'💡  Light brightness  %1%',
    args0:[{type:'field_number',name:'PCT',value:100,min:0,max:100}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_set_volume', message0:'🔊  Sound volume  %1%',
    args0:[{type:'field_number',name:'PCT',value:80,min:0,max:100}],
    previousStatement:null, nextStatement:null, style:'lights_blocks' },

  // ── ROBOT ARM — COMPLETE SET ─────────────────────────────────────────────────
  { type:'robot_arm_move_relative', message0:'🦾  Arm move  X:%1  Y:%2  Z:%3  (rel)',
    args0:[{type:'field_number',name:'X',value:0,min:-2,max:2},{type:'field_number',name:'Y',value:0.2,min:-2,max:2},{type:'field_number',name:'Z',value:0,min:-2,max:2}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_speed_limit', message0:'🦾  Arm speed limit  %1%',
    args0:[{type:'field_number',name:'PCT',value:50,min:5,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_safe_mode', message0:'🛡️  Arm safe mode  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON ✅','on'],['OFF ❌','off']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_collision_detect', message0:'💥  Arm collision detection  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON ✅','on'],['OFF ❌','off']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_emergency_stop', message0:'🛑  Arm emergency stop',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_product_sort', message0:'📦  Sort by  %1',
    args0:[{type:'field_dropdown',name:'CRIT',options:[['size 📐','size'],['color 🎨','color'],['weight ⚖️','weight']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_stack_objects', message0:'📚  Stack to  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:0.5,min:0.1,max:2}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_inspect_object', message0:'🔍  Inspect held object',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_quality_check', message0:'✅  Quality check',
    output:'Boolean', style:'tools_blocks', tooltip:'Returns pass/fail' },
  { type:'robot_assembly_step', message0:'🔧  Assembly step  %1',
    args0:[{type:'field_number',name:'STEP',value:1,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_smooth_motion', message0:'🎯  Smooth arm move  X:%1  Y:%2  in  %3  s',
    args0:[{type:'field_number',name:'X',value:0,min:-2,max:2},{type:'field_number',name:'Y',value:1,min:0,max:3},{type:'field_number',name:'SECS',value:1,min:0.2,max:5}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_precise_mode', message0:'🎯  Precise placement mode  %1',
    args0:[{type:'field_dropdown',name:'STATE',options:[['ON ✅','on'],['OFF ❌','off']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_get_position', message0:'📍  arm position (x)', output:'Number', style:'tools_blocks' },
  { type:'robot_arm_is_holding', message0:'✊  arm holding object?', output:'Boolean', style:'tools_blocks' },
  { type:'robot_arm_grip_pressure', message0:'💪  Grip pressure  %1%',
    args0:[{type:'field_number',name:'PCT',value:80,min:0,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_set_joint_angle', message0:'⚙️  Set joint  %1  to  %2°',
    args0:[{type:'field_dropdown',name:'JOINT',options:[['base','0'],['shoulder','1'],['elbow','2'],['wrist','3'],['hand','4']]},{type:'field_number',name:'DEG',value:0,min:-180,max:180}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_get_joint_angle', message0:'⚙️  joint  %1  angle (°)',
    args0:[{type:'field_dropdown',name:'JOINT',options:[['base','0'],['shoulder','1'],['elbow','2'],['wrist','3'],['hand','4']]}],
    output:'Number', style:'tools_blocks' },

  // ── HOVER — COMPLETE SET ─────────────────────────────────────────────────────
  { type:'robot_anti_grav_boost', message0:'🔮  Anti-gravity boost!',
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'1-second rapid altitude burst' },
  { type:'robot_hover_stabilize', message0:'⚖️  Stabilize hover',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_hover_side_drift', message0:'↔️  Hover drift  %1  at  %2  m/s',
    args0:[{type:'field_dropdown',name:'DIR',options:[['left ←','left'],['right →','right']]},{type:'field_number',name:'SPD',value:1,min:0.5,max:5}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_vertical_hover', message0:'🛸  Vertical hover (hold)',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_floating_orbit', message0:'🌀  Floating orbit  R:%1 m',
    args0:[{type:'field_number',name:'RADIUS',value:3,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_grav_field_on',  message0:'⚡  Gravity field ON',  previousStatement:null, nextStatement:null, style:'lights_blocks', tooltip:'Repels nearby objects' },
  { type:'robot_grav_field_off', message0:'⚡  Gravity field OFF', previousStatement:null, nextStatement:null, style:'lights_blocks' },
  { type:'robot_energy_overcharge', message0:'⚡⚡  Energy overcharge!',
    previousStatement:null, nextStatement:null, style:'lights_blocks', tooltip:'Increased power — risk of overheating' },

  // ── UNDERWATER — COMPLETE SET ────────────────────────────────────────────────
  { type:'robot_sonar_pulse', message0:'📡  Sonar pulse',
    previousStatement:null, nextStatement:null, style:'sense_blocks', tooltip:'50m range pulse' },
  { type:'robot_sonar_scan', message0:'📡  Sonar scan  %1  m radius',
    args0:[{type:'field_number',name:'RADIUS',value:20,min:5,max:100}],
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_sub_stabilize', message0:'⚖️  Stabilize underwater',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_collect_sample', message0:'🧪  Collect sample',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_scan_ocean_floor', message0:'🪸  Scan ocean floor',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_avoid_uw_obstacle', message0:'🪨  Avoid underwater obstacle',
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_pressure_check', message0:'⚖️  Pressure check',
    output:'Number', style:'sense_blocks' },
  { type:'robot_depth_measurement', message0:'📏  depth (m)',
    output:'Number', style:'sense_blocks' },
  { type:'robot_navigate_current', message0:'🌊  Navigate  %1  current',
    args0:[{type:'field_dropdown',name:'DIR',options:[['with 🌊','with'],['against 💪','against']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },

  // ── LOGIC EXTRAS ─────────────────────────────────────────────────────────────
  { type:'robot_wait', message0:'⏳  Wait  %1  seconds',
    args0:[{type:'field_number',name:'SECS',value:1,min:0.1,max:30}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Pause execution' },
  { type:'robot_timer_start', message0:'⏱️  Start timer  %1  s',
    args0:[{type:'field_number',name:'SECS',value:5,min:1,max:60}],
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_timer_done', message0:'⏱️  timer done?', output:'Boolean', style:'sense_blocks' },
  { type:'robot_counter_increment', message0:'🔢  Counter +1',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_counter_decrement', message0:'🔢  Counter -1',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },
  { type:'robot_counter_value', message0:'🔢  counter value', output:'Number', style:'sense_blocks' },
  { type:'robot_counter_reset', message0:'🔄  Reset counter',
    previousStatement:null, nextStatement:null, style:'sense_blocks' },

  // ── MISSING DRONE/FLIGHT BLOCKS ───────────────────────────────────────────
  { type:'robot_fly_forward', message0:'✈️  Fly forward  %1  m',
    args0:[{type:'field_number',name:'DIST',value:3,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Fly the drone forward' },
  { type:'robot_fly_backward', message0:'✈️  Fly backward  %1  m',
    args0:[{type:'field_number',name:'DIST',value:3,min:1,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_fly_left', message0:'⬅️  Strafe left  %1  m',
    args0:[{type:'field_number',name:'DIST',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_fly_right', message0:'➡️  Strafe right  %1  m',
    args0:[{type:'field_number',name:'DIST',value:2,min:1,max:10}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_ascend', message0:'⬆️  Ascend  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:0.5,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_descend', message0:'⬇️  Descend  %1  m',
    args0:[{type:'field_number',name:'HEIGHT',value:2,min:0.5,max:20}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_yaw_left', message0:'↺  Yaw left  %1°',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['180°','180'],['360°','360']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_yaw_right', message0:'↻  Yaw right  %1°',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['180°','180'],['360°','360']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_flip', message0:'🔄  Flip  %1',
    args0:[{type:'field_dropdown',name:'DIR',options:[['forward','forward'],['backward','backward'],['left','left'],['right','right']]}],
    previousStatement:null, nextStatement:null, style:'move_blocks', tooltip:'Perform an aerial flip' },
  { type:'robot_tilt', message0:'📐  Tilt  %1  at  %2°',
    args0:[
      {type:'field_dropdown',name:'AXIS',options:[['forward','pitch'],['sideways','roll']]},
      {type:'field_number',name:'ANGLE',value:30,min:5,max:60}
    ],
    previousStatement:null, nextStatement:null, style:'move_blocks' },
  { type:'robot_altitude', message0:'📏  Altitude (m)', output:'Number', style:'sense_blocks', tooltip:'Returns current altitude in meters' },
  { type:'robot_distance', message0:'📏  Distance to wall (m)', output:'Number', style:'sense_blocks', tooltip:'Returns distance to nearest obstacle' },
  { type:'robot_led_color', message0:'🎨  Set LED color  %1',
    args0:[{type:'field_dropdown',name:'COLOR',options:[['Red 🔴','red'],['Green 🟢','green'],['Blue 🔵','blue'],['Cyan','cyan'],['Yellow 🟡','yellow'],['White ⬜','white'],['Off','off']]}],
    previousStatement:null, nextStatement:null, style:'lights_blocks', tooltip:'Change LED strip color' },

  // ── MISSING ARM BLOCKS ────────────────────────────────────────────────────
  { type:'robot_arm_extend', message0:'🦾  Extend arm  %1  cm',
    args0:[{type:'field_number',name:'DIST',value:20,min:5,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_retract', message0:'🦾  Retract arm  %1  cm',
    args0:[{type:'field_number',name:'DIST',value:20,min:5,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_gripper_open', message0:'👐  Open gripper',
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_gripper_close', message0:'✊  Close gripper  %1%',
    args0:[{type:'field_number',name:'FORCE',value:50,min:10,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_arm_rotate', message0:'🔄  Rotate arm  %1°',
    args0:[{type:'field_dropdown',name:'ANGLE',options:[['45°','45'],['90°','90'],['135°','135'],['180°','180'],['270°','270'],['360°','360']]}],
    previousStatement:null, nextStatement:null, style:'tools_blocks' },
  { type:'robot_lift_object', message0:'⬆  Lift object',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Pick up and lift object under gripper' },
  { type:'robot_drop_object', message0:'⬇  Drop object',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Release and drop held object' },
];

let _blocksReg = false;
function registerRobotBlocks() {
  if (_blocksReg) return;
  _blocksReg = true;
  try { Blockly.defineBlocksWithJsonArray(ROBOT_BLOCK_DEFS); }
  catch(e) { console.warn('registerRobotBlocks:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// DARK THEME
// ─────────────────────────────────────────────────────────────────────────────
function makeBBTheme() {
  return Blockly.Theme.defineTheme('bytebuddies', {
    blockStyles: {
      event_blocks:   { colourPrimary:'#e11d48', colourSecondary:'#9f1239', colourTertiary:'#881337' },
      move_blocks:    { colourPrimary:'#3b82f6', colourSecondary:'#1d4ed8', colourTertiary:'#1e40af' },
      control_blocks: { colourPrimary:'#f97316', colourSecondary:'#c2410c', colourTertiary:'#9a3412' },
      sense_blocks:   { colourPrimary:'#22c55e', colourSecondary:'#15803d', colourTertiary:'#166534' },
      ai_blocks:      { colourPrimary:'#a855f7', colourSecondary:'#7e22ce', colourTertiary:'#6b21a8' },
      tools_blocks:    { colourPrimary:'#ec4899', colourSecondary:'#be185d', colourTertiary:'#9d174d' },
      lights_blocks:   { colourPrimary:'#06b6d4', colourSecondary:'#0e7490', colourTertiary:'#155e75' },
      variable_blocks: { colourPrimary:'#f59e0b', colourSecondary:'#b45309', colourTertiary:'#92400e' },
      timer_blocks:    { colourPrimary:'#14b8a6', colourSecondary:'#0f766e', colourTertiary:'#0d9488' },
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
// ROBOT TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────
function detectRobotType(rc) {
  const mov     = rc.movementId || 'wheels';
  const chassis = rc.chassisId  || 'rover';
  const hasArm  = rc.armId != null;
  // Chassis-specific type overrides (highest priority)
  if (['droid','mech','legobot'].includes(chassis)) return 'humanoid';
  if (chassis === 'spider')                          return 'spider';
  if (['drone','rescuedrone'].includes(chassis))             return 'drone';
  if (chassis === 'racedrone')                               return 'racedrone';
  if (chassis === 'helicopter')                      return 'drone';   // same arena/blocks
  if (['hoverbot','hoverracer'].includes(chassis))   return 'hover';
  if (['submarine','deepseabot'].includes(chassis))  return 'underwater';
  if (chassis === 'miningbot')                       return 'tank';    // heavy tracked
  if (chassis === 'securitybot')                     return 'security';
  if (chassis === 'medbot')                          return 'medbot';
  if (chassis === 'firebot')                         return 'firebot';
  if (chassis === 'factorybot')                      return 'factorybot';
  if (['jetplane','steathjet','aerobat'].includes(chassis)) return 'jet';
  // Movement-based fallback
  if (mov === 'jets')   return 'jet';
  if (mov === 'flying') return 'drone';
  if (mov === 'hover')  return 'hover';
  if (mov === 'swim')   return 'underwater';
  if (mov === 'tracks') return 'tank';
  if (mov === 'legs')   return 'humanoid';  // default legs = humanoid
  if (hasArm)           return 'factory';
  return 'rover';
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE COURSE LIBRARY  —  ALL courses always accessible
// ─────────────────────────────────────────────────────────────────────────────
const CAT_META = {
  ground:     { label:'Ground',     icon:'🌍', color:'#22c55e' },
  air:        { label:'Air',        icon:'✈️',  color:'#0ea5e9' },
  jet:        { label:'Jet',        icon:'🔥', color:'#ef4444' },
  heavy:      { label:'Heavy',      icon:'🪨', color:'#78716c' },
  terrain:    { label:'Terrain',    icon:'🧗', color:'#10b981' },
  hover:      { label:'Hover',      icon:'🛸', color:'#7c3aed' },
  factory:    { label:'Factory',    icon:'🏭', color:'#ec4899' },
  underwater: { label:'Underwater', icon:'🌊', color:'#06b6d4' },
  space:      { label:'Space',      icon:'🚀', color:'#94a3b8' },
  ai:         { label:'AI Lab',     icon:'🧠', color:'#a855f7' },
  lego:       { label:'LEGO',       icon:'🧱', color:'#f59e0b' },
  cavern:     { label:'Cavern',     icon:'🦇', color:'#8b5cf6' },
  race:       { label:'Race',       icon:'🏁', color:'#ff6b35' },
  jungle:     { label:'Jungle',     icon:'🌿', color:'#16a34a' },
  zerog:      { label:'Zero-G',     icon:'🌌', color:'#38bdf8' },
  warehouse:  { label:'Warehouse',  icon:'📦', color:'#d97706' },
  temple:     { label:'Temple',     icon:'🏛️', color:'#a16207' },
  combat:     { label:'Combat',     icon:'⚔️',  color:'#ef4444' },
};

// rec[] = robot-type keywords that find this course "recommended"
const ALL_COURSES = [
  // ── GROUND ─────────────────────────────────────────────────────────────────
  {id:'obstacle',    cat:'ground', icon:'🏁', name:'Obstacle Course',        desc:'Navigate obstacles to the finish!',       arenaType:'ground',     color:'#22c55e', obstacles:10, totalDist:22, rec:['rover','tank','spider','humanoid']},
  {id:'race_track',  cat:'ground', icon:'🏎️',name:'Race Track',             desc:'Speed around the track!',                 arenaType:'ground',     color:'#ef4444', obstacles:5,  totalDist:18, rec:['rover','race','jet']},
  {id:'maze',        cat:'ground', icon:'🌀', name:'Maze Navigation',        desc:'Find the exit through the maze!',         arenaType:'ground',     color:'#8b5cf6', obstacles:18, totalDist:30, rec:['rover','spider','humanoid']},
  {id:'cargo',       cat:'ground', icon:'📦', name:'Cargo Delivery',         desc:'Pick up and deliver all cargo!',          arenaType:'ground',     color:'#0ea5e9', obstacles:6,  totalDist:20, rec:['rover','factory','tank']},
  {id:'speedrun',    cat:'ground', icon:'⚡', name:'Speed Run',              desc:'Beat the clock at full speed!',           arenaType:'ground',     color:'#f59e0b', obstacles:5,  totalDist:16, rec:['rover','race','hover']},
  {id:'line_follow', cat:'ground', icon:'〰', name:'Line Follow Arena',      desc:'Follow the line perfectly!',              arenaType:'ground',     color:'#10b981', obstacles:4,  totalDist:18, rec:['rover','humanoid']},
  {id:'precision',   cat:'ground', icon:'🎯', name:'Precision Driving',      desc:'Park precisely in each target zone!',     arenaType:'ground',     color:'#ec4899', obstacles:4,  totalDist:12, rec:['rover','factory','humanoid']},
  {id:'stem_play',   cat:'ground', icon:'🔬', name:'STEM Playground',        desc:'Explore the science lab arena!',          arenaType:'ground',     color:'#06b6d4', obstacles:8,  totalDist:22, rec:['rover','humanoid','spider']},
  {id:'survival',    cat:'ground', icon:'💀', name:'Survival Arena',         desc:'Survive as long as possible!',            arenaType:'rough',      color:'#dc2626', obstacles:15, totalDist:28, rec:['tank','rover','spider']},
  {id:'checkpoint',  cat:'ground', icon:'📍', name:'Checkpoint Challenge',   desc:'Hit every checkpoint in order!',          arenaType:'ground',     color:'#3b82f6', obstacles:6,  totalDist:22, rec:['rover','race','humanoid']},
  // ── AIR ────────────────────────────────────────────────────────────────────
  {id:'sky_rings',   cat:'air',    icon:'💫', name:'Sky Ring Course',        desc:'Fly through all the sky rings!',          arenaType:'sky',        color:'#0ea5e9', obstacles:5,  totalDist:25, rec:['drone','hover','jet']},
  {id:'cloud_tunnel',cat:'air',    icon:'☁️', name:'Cloud Tunnel',           desc:'Navigate the cloud maze!',                arenaType:'sky',        color:'#60a5fa', obstacles:8,  totalDist:28, rec:['drone','hover']},
  {id:'air_race',    cat:'air',    icon:'🏁', name:'Aerial Race Track',      desc:'Race through aerial checkpoints!',         arenaType:'sky',        color:'#ef4444', obstacles:6,  totalDist:25, rec:['drone','jet','hover']},
  {id:'drone_rescue',cat:'air',    icon:'🚑', name:'Drone Rescue Mission',   desc:'Find and rescue survivors in the sky!',   arenaType:'sky',        color:'#22c55e', obstacles:4,  totalDist:22, rec:['drone']},
  {id:'sky_maze',    cat:'air',    icon:'🌀', name:'Air Maze',               desc:'Find the exit in the sky!',               arenaType:'sky',        color:'#8b5cf6', obstacles:10, totalDist:30, rec:['drone','hover']},
  {id:'sky_delivery',cat:'air',    icon:'📦', name:'Sky Delivery Run',       desc:'Drop cargo precisely on target zones!',   arenaType:'sky',        color:'#f59e0b', obstacles:4,  totalDist:20, rec:['drone','hover']},
  {id:'hover_check', cat:'air',    icon:'📍', name:'Hover Checkpoint',       desc:'Hit every checkpoint while hovering!',    arenaType:'sky',        color:'#ec4899', obstacles:5,  totalDist:22, rec:['drone','hover']},
  {id:'wind_storm',  cat:'air',    icon:'🌪️', name:'Wind Storm Arena',       desc:'Battle through the storm!',               arenaType:'sky',        color:'#94a3b8', obstacles:8,  totalDist:26, rec:['drone','jet']},
  // ── JET ────────────────────────────────────────────────────────────────────
  {id:'canyon_run',  cat:'jet',    icon:'🏔️', name:'Canyon Run',            desc:'Fly through the canyons at speed!',       arenaType:'jet',        color:'#f59e0b', obstacles:6,  totalDist:28, rec:['jet']},
  {id:'jet_loops',   cat:'jet',    icon:'🔁', name:'Loop Course',            desc:'Complete all loop maneuvers!',            arenaType:'jet',        color:'#ef4444', obstacles:5,  totalDist:24, rec:['jet']},
  {id:'jet_stunt',   cat:'jet',    icon:'⭐', name:'Stunt Arena',            desc:'Perform aerial stunts for points!',       arenaType:'jet',        color:'#8b5cf6', obstacles:4,  totalDist:20, rec:['jet']},
  {id:'time_trial',  cat:'jet',    icon:'⏱',  name:'Time Trial',             desc:'Race the clock around the circuit!',      arenaType:'jet',        color:'#22c55e', obstacles:3,  totalDist:22, rec:['jet','drone']},
  {id:'flight_tunnel',cat:'jet',   icon:'🌀', name:'Flight Tunnel',          desc:'Thread through the tight tunnel!',        arenaType:'jet',        color:'#06b6d4', obstacles:8,  totalDist:26, rec:['jet','drone']},
  // ── HEAVY TERRAIN ──────────────────────────────────────────────────────────
  {id:'rough_run',   cat:'heavy',  icon:'🪨', name:'Rough Terrain',          desc:'Tackle the rocky environment!',           arenaType:'rough',      color:'#78716c', obstacles:12, totalDist:30, rec:['tank','spider','mining']},
  {id:'cargo_push',  cat:'heavy',  icon:'💪', name:'Cargo Push',             desc:'Push heavy cargo to the target!',         arenaType:'rough',      color:'#f59e0b', obstacles:5,  totalDist:18, rec:['tank','bulldozer']},
  {id:'ramp_king',   cat:'heavy',  icon:'🏔️', name:'Ramp King',             desc:'Climb all the ramps to the top!',         arenaType:'rough',      color:'#0ea5e9', obstacles:6,  totalDist:22, rec:['tank','spider']},
  {id:'mining_run',  cat:'heavy',  icon:'⛏️', name:'Mining Tunnel',          desc:'Mine through the rock field!',            arenaType:'rough',      color:'#92400e', obstacles:10, totalDist:24, rec:['tank','mining','rover']},
  {id:'construction',cat:'heavy',  icon:'🏗️', name:'Construction Site',      desc:'Navigate the construction zone!',         arenaType:'rough',      color:'#d97706', obstacles:8,  totalDist:20, rec:['tank','bulldozer','factory']},
  // ── TERRAIN / CLIMBING ─────────────────────────────────────────────────────
  {id:'wall_climb',  cat:'terrain',icon:'🧗', name:'Wall Climbing Arena',    desc:'Scale the vertical walls!',               arenaType:'terrain',    color:'#10b981', obstacles:7,  totalDist:28, rec:['spider','humanoid','climbing']},
  {id:'cave_explore',cat:'terrain',icon:'🦇', name:'Cave Explorer',          desc:'Navigate the dark cave!',                 arenaType:'terrain',    color:'#6b7280', obstacles:8,  totalDist:22, rec:['spider','humanoid']},
  {id:'jungle_path', cat:'terrain',icon:'🌿', name:'Jungle Terrain',         desc:'Cross the dense jungle terrain!',         arenaType:'terrain',    color:'#16a34a', obstacles:10, totalDist:26, rec:['spider','humanoid','rover']},
  {id:'platform',    cat:'terrain',icon:'⬜', name:'Platform Traversal',     desc:'Leap across the platforms!',              arenaType:'terrain',    color:'#8b5cf6', obstacles:6,  totalDist:20, rec:['spider','humanoid']},
  {id:'vertical',    cat:'terrain',icon:'⬆️', name:'Vertical Climb',         desc:'Reach the summit!',                       arenaType:'terrain',    color:'#ef4444', obstacles:8,  totalDist:25, rec:['spider','climbing','humanoid']},
  // ── HOVER ──────────────────────────────────────────────────────────────────
  {id:'float_plat',  cat:'hover',  icon:'🌐', name:'Floating Platforms',     desc:'Hop between floating platforms!',         arenaType:'hover',      color:'#7c3aed', obstacles:5,  totalDist:22, rec:['hover','drone']},
  {id:'hover_race',  cat:'hover',  icon:'🏁', name:'Hover Racing Circuit',   desc:'Race through the hover gates!',           arenaType:'hover',      color:'#ec4899', obstacles:6,  totalDist:24, rec:['hover']},
  {id:'neon_city',   cat:'hover',  icon:'🌆', name:'Neon Hover City',        desc:'Navigate the neon city grid!',            arenaType:'hover',      color:'#0ea5e9', obstacles:8,  totalDist:28, rec:['hover','drone']},
  {id:'energy_bridge',cat:'hover', icon:'⚡', name:'Energy Bridge Run',      desc:'Cross the energy bridges!',               arenaType:'hover',      color:'#f59e0b', obstacles:5,  totalDist:20, rec:['hover']},
  {id:'antigrav',    cat:'hover',  icon:'🔮', name:'Anti-Gravity Arena',     desc:'Master zero-gravity movement!',           arenaType:'hover',      color:'#a855f7', obstacles:6,  totalDist:22, rec:['hover','drone','space']},
  // ── FACTORY ────────────────────────────────────────────────────────────────
  {id:'conveyor',    cat:'factory',icon:'🏭', name:'Conveyor Sorting',       desc:'Sort all the coloured items!',            arenaType:'factory',    color:'#0ea5e9', obstacles:5,  totalDist:15, rec:['factory','assembly']},
  {id:'tower_build', cat:'factory',icon:'📦', name:'Tower Builder',          desc:'Stack boxes as high as possible!',        arenaType:'factory',    color:'#22c55e', obstacles:4,  totalDist:12, rec:['factory','crane']},
  {id:'assembly',    cat:'factory',icon:'🔩', name:'Assembly Task',          desc:'Assemble all the components!',            arenaType:'factory',    color:'#f59e0b', obstacles:6,  totalDist:18, rec:['factory','assembly']},
  {id:'pick_place',  cat:'factory',icon:'🎯', name:'Pick & Place',           desc:'Precision placement challenge!',          arenaType:'factory',    color:'#8b5cf6', obstacles:5,  totalDist:16, rec:['factory','assembly']},
  {id:'factory_auto',cat:'factory',icon:'⚙️', name:'Factory Automation',     desc:'Automate the production line!',           arenaType:'factory',    color:'#ec4899', obstacles:7,  totalDist:20, rec:['factory','assembly','crane']},
  // ── UNDERWATER ─────────────────────────────────────────────────────────────
  {id:'coral_reef',  cat:'underwater',icon:'🐠',name:'Coral Reef Explorer',  desc:'Explore the beautiful coral reef!',       arenaType:'underwater', color:'#06b6d4', obstacles:8,  totalDist:22, rec:['underwater','submarine']},
  {id:'ocean_rescue',cat:'underwater',icon:'🚑',name:'Ocean Rescue Mission', desc:'Rescue underwater survivors!',            arenaType:'underwater', color:'#22c55e', obstacles:5,  totalDist:20, rec:['underwater']},
  {id:'deep_sea',    cat:'underwater',icon:'🌊',name:'Deep Sea Trench',      desc:'Dive to the deepest trench!',             arenaType:'underwater', color:'#1d4ed8', obstacles:7,  totalDist:26, rec:['underwater','submarine']},
  {id:'cave_dive',   cat:'underwater',icon:'🦈',name:'Underwater Cave',      desc:'Navigate the dark underwater cave!',      arenaType:'underwater', color:'#0284c7', obstacles:10, totalDist:28, rec:['underwater','submarine']},
  {id:'repair_pipe', cat:'underwater',icon:'🔧',name:'Underwater Repair',    desc:'Fix the underwater pipeline!',            arenaType:'underwater', color:'#f59e0b', obstacles:4,  totalDist:15, rec:['underwater','factory']},
  // ── SPACE ──────────────────────────────────────────────────────────────────
  {id:'moon_rover',  cat:'space',  icon:'🌕', name:'Moon Rover Arena',       desc:'Explore the lunar surface!',              arenaType:'space',      color:'#94a3b8', obstacles:8,  totalDist:24, rec:['rover','space','mining']},
  {id:'mars_explore',cat:'space',  icon:'🔴', name:'Mars Exploration',       desc:'Navigate the Mars terrain!',              arenaType:'space',      color:'#ef4444', obstacles:10, totalDist:28, rec:['rover','space']},
  {id:'space_repair',cat:'space',  icon:'🛸', name:'Space Station Repair',   desc:'Fix the space station components!',       arenaType:'space',      color:'#7c3aed', obstacles:5,  totalDist:18, rec:['space','factory']},
  {id:'asteroid',    cat:'space',  icon:'☄️', name:'Asteroid Mining',        desc:'Mine precious asteroids!',                arenaType:'space',      color:'#f59e0b', obstacles:7,  totalDist:22, rec:['mining','space','rover']},
  {id:'zero_g',      cat:'space',  icon:'🌌', name:'Zero Gravity Course',    desc:'Navigate in zero gravity!',               arenaType:'space',      color:'#0ea5e9', obstacles:6,  totalDist:20, rec:['space','drone','hover']},
  // ── AI / SENSOR ────────────────────────────────────────────────────────────
  {id:'ai_training', cat:'ai',     icon:'🧠', name:'AI Training Lab',        desc:'Train your AI algorithms!',               arenaType:'ground',     color:'#a855f7', obstacles:5,  totalDist:18, rec:['rover','drone','humanoid']},
  {id:'stealth',     cat:'ai',     icon:'👻', name:'Stealth Arena',          desc:'Move without being detected!',            arenaType:'ground',     color:'#4b5563', obstacles:6,  totalDist:20, rec:['rover','spider','humanoid']},
  {id:'obj_detect',  cat:'ai',     icon:'👁', name:'Object Detection',       desc:'Find and scan all objects!',              arenaType:'ground',     color:'#22c55e', obstacles:8,  totalDist:22, rec:['rover','drone','factory']},
  {id:'smart_patrol',cat:'ai',     icon:'🏙️', name:'Smart City Patrol',     desc:'Patrol every sector of the city!',        arenaType:'ground',     color:'#0ea5e9', obstacles:6,  totalDist:24, rec:['rover','humanoid','security']},
  {id:'auto_nav',    cat:'ai',     icon:'🗺️', name:'Autonomous Navigation',  desc:'Navigate completely on your own!',        arenaType:'ground',     color:'#f59e0b', obstacles:10, totalDist:28, rec:['rover','drone','humanoid']},
  // ── LEGO ───────────────────────────────────────────────────────────────────
  {id:'lego_city',   cat:'lego',   icon:'🧱', name:'LEGO City',              desc:'Build and explore LEGO city!',            arenaType:'lego',       color:'#ef4444', obstacles:6,  totalDist:18, rec:['lego','rover']},
  {id:'block_world', cat:'lego',   icon:'🌍', name:'Giant Block World',      desc:'Navigate the giant block world!',         arenaType:'lego',       color:'#3b82f6', obstacles:8,  totalDist:22, rec:['lego','rover']},
  {id:'bridge_build',cat:'lego',   icon:'🌉', name:'Bridge Builder',         desc:'Build a bridge to cross the gap!',        arenaType:'lego',       color:'#22c55e', obstacles:5,  totalDist:16, rec:['lego','factory']},
  {id:'block_puzzle',cat:'lego',   icon:'🧩', name:'Block Puzzle Arena',     desc:'Solve the colour block puzzle!',          arenaType:'lego',       color:'#f59e0b', obstacles:6,  totalDist:14, rec:['lego','factory']},
  {id:'lego_lab',    cat:'lego',   icon:'🔬', name:'LEGO Engineering Lab',   desc:'Complete the engineering challenges!',    arenaType:'lego',       color:'#a855f7', obstacles:7,  totalDist:20, rec:['lego','factory','rover']},
  // ── SPIDER CAVERN ──────────────────────────────────────────────────────────
  {id:'crystal_cave', cat:'cavern', icon:'💎', name:'Crystal Cavern',          desc:'Scale the glowing crystal walls!',        arenaType:'cavern',     color:'#8b5cf6', obstacles:9,  totalDist:26, rec:['spider','humanoid','climbing']},
  {id:'stalactite_run',cat:'cavern',icon:'🦇', name:'Stalactite Run',          desc:'Dodge stalactites as you climb!',         arenaType:'cavern',     color:'#7c3aed', obstacles:12, totalDist:30, rec:['spider','climbing']},
  {id:'cavern_boss',  cat:'cavern', icon:'🕷️', name:'Cavern Boss Challenge',   desc:'Defeat the cavern keeper!',               arenaType:'cavern',     color:'#a855f7', obstacles:14, totalDist:28, rec:['spider']},
  {id:'deep_cave',    cat:'cavern', icon:'🌑', name:'Deep Cave Descent',       desc:'Reach the bottom of the dark cave!',      arenaType:'cavern',     color:'#6d28d9', obstacles:10, totalDist:32, rec:['spider','humanoid']},
  // ── NEON RACE TRACK ────────────────────────────────────────────────────────
  {id:'neon_race',    cat:'race',   icon:'🏎️', name:'Neon Racing Circuit',     desc:'Race through the neon city track!',       arenaType:'neon_race',  color:'#ff6b35', obstacles:6,  totalDist:24, rec:['hover','race','rover']},
  {id:'neon_chase',   cat:'race',   icon:'🚓', name:'Neon City Chase',         desc:'Chase down the runaway bot!',             arenaType:'neon_race',  color:'#ef4444', obstacles:8,  totalDist:26, rec:['hover','rover','race']},
  {id:'drift_king',   cat:'race',   icon:'🌀', name:'Drift King',              desc:'Master the perfect drift line!',          arenaType:'neon_race',  color:'#ec4899', obstacles:5,  totalDist:22, rec:['hover','race']},
  {id:'turbo_league', cat:'race',   icon:'⚡', name:'Turbo League Race',       desc:'First to cross the finish wins!',         arenaType:'neon_race',  color:'#fbbf24', obstacles:4,  totalDist:20, rec:['hover','race','rover']},
  // ── JUNGLE EXPLORATION ─────────────────────────────────────────────────────
  {id:'jungle_trek',  cat:'jungle', icon:'🌿', name:'Jungle Trek',             desc:'Explore the dense jungle terrain!',       arenaType:'jungle',     color:'#16a34a', obstacles:11, totalDist:28, rec:['spider','tank','rover']},
  {id:'ancient_ruins',cat:'jungle', icon:'🏚️', name:'Ancient Ruins',           desc:'Navigate the crumbling ruins!',           arenaType:'jungle',     color:'#92400e', obstacles:9,  totalDist:24, rec:['spider','humanoid']},
  {id:'river_cross',  cat:'jungle', icon:'🌊', name:'River Crossing',          desc:'Cross all the jungle rivers!',            arenaType:'jungle',     color:'#0ea5e9', obstacles:7,  totalDist:22, rec:['spider','rover','tank']},
  {id:'canopy_race',  cat:'jungle', icon:'🌳', name:'Canopy Race',             desc:'Race through the treetops!',              arenaType:'jungle',     color:'#22c55e', obstacles:8,  totalDist:26, rec:['spider','humanoid']},
  // ── ZERO-G STATION ─────────────────────────────────────────────────────────
  {id:'zero_g_race',  cat:'zerog',  icon:'🌌', name:'Zero-G Raceway',          desc:'Race in zero gravity!',                   arenaType:'zero_g',     color:'#38bdf8', obstacles:6,  totalDist:22, rec:['hover','drone','space']},
  {id:'space_dance',  cat:'zerog',  icon:'🌀', name:'Zero-G Acrobatics',       desc:'Perform weightless acrobatics!',          arenaType:'zero_g',     color:'#7c3aed', obstacles:5,  totalDist:20, rec:['hover','drone']},
  {id:'orbital_repair',cat:'zerog', icon:'🔧', name:'Orbital Repair',          desc:'Fix the space station systems!',          arenaType:'zero_g',     color:'#94a3b8', obstacles:7,  totalDist:18, rec:['space','factory','hover']},
  {id:'debris_field', cat:'zerog',  icon:'☄️', name:'Debris Field Navigation',  desc:'Navigate the asteroid debris field!',    arenaType:'zero_g',     color:'#0ea5e9', obstacles:14, totalDist:30, rec:['hover','drone','space']},
  // ── WAREHOUSE PUZZLE ───────────────────────────────────────────────────────
  {id:'box_sort',     cat:'warehouse',icon:'📦',name:'Box Sorting Challenge',   desc:'Sort all boxes to their shelves!',        arenaType:'warehouse',  color:'#d97706', obstacles:8,  totalDist:18, rec:['factory','humanoid','rover']},
  {id:'warehouse_run',cat:'warehouse',icon:'🏃',name:'Warehouse Speedrun',      desc:'Grab all items before time runs out!',   arenaType:'warehouse',  color:'#f59e0b', obstacles:10, totalDist:22, rec:['rover','humanoid','factory']},
  {id:'crate_maze',   cat:'warehouse',icon:'🧩',name:'Crate Maze',              desc:'Navigate through shifting crates!',       arenaType:'warehouse',  color:'#0ea5e9', obstacles:12, totalDist:24, rec:['humanoid','rover','spider']},
  {id:'logistics',    cat:'warehouse',icon:'🚚',name:'Logistics Master',        desc:'Automate the warehouse workflow!',        arenaType:'warehouse',  color:'#8b5cf6', obstacles:6,  totalDist:16, rec:['factory','assembly']},
  // ── ANCIENT TEMPLE ─────────────────────────────────────────────────────────
  {id:'temple_run',   cat:'temple',  icon:'🏛️',name:'Temple Run',              desc:'Escape the ancient temple traps!',        arenaType:'temple',     color:'#a16207', obstacles:10, totalDist:26, rec:['humanoid','spider','rover']},
  {id:'pressure_path',cat:'temple',  icon:'⬛',name:'Pressure Plate Path',     desc:'Step on every pressure plate in order!', arenaType:'temple',     color:'#92400e', obstacles:8,  totalDist:22, rec:['humanoid','spider']},
  {id:'idol_heist',   cat:'temple',  icon:'🏺',name:'Idol Heist',              desc:'Grab the idol and escape!',               arenaType:'temple',     color:'#d97706', obstacles:9,  totalDist:24, rec:['humanoid','spider','rover']},
  {id:'guardian_fight',cat:'temple', icon:'⚔️',name:'Guardian Challenge',      desc:'Defeat the temple guardians!',            arenaType:'temple',     color:'#ef4444', obstacles:15, totalDist:28, rec:['tank','humanoid','spider']},
  // ── COMBAT ARENA ───────────────────────────────────────────────────────────
  {id:'battle_royale', cat:'combat', icon:'⚔️', name:'Battle Royale',          desc:'Last robot standing wins!',               arenaType:'combat',     color:'#ef4444', obstacles:12, totalDist:26, rec:['tank','battlebot','mech','humanoid']},
  {id:'deathmatch',    cat:'combat', icon:'💥', name:'Deathmatch Arena',        desc:'Score the most hits in time!',            arenaType:'combat',     color:'#dc2626', obstacles:14, totalDist:24, rec:['tank','rover','drone','hover']},
  {id:'capture_flag',  cat:'combat', icon:'🚩', name:'Capture the Flag',        desc:'Grab the flag and bring it home!',        arenaType:'combat',     color:'#f59e0b', obstacles:8,  totalDist:22, rec:['rover','hover','humanoid']},
  {id:'king_hill',     cat:'combat', icon:'👑', name:'King of the Hill',        desc:'Hold the hill longer than all others!',  arenaType:'combat',     color:'#8b5cf6', obstacles:10, totalDist:20, rec:['tank','humanoid','spider','hover']},
  {id:'elimination',   cat:'combat', icon:'🎯', name:'Elimination Round',       desc:'Take out all enemy bots!',                arenaType:'combat',     color:'#ef4444', obstacles:16, totalDist:28, rec:['tank','battlebot','drone','jet']},
];

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBOX JSON — fully per robot type
// ─────────────────────────────────────────────────────────────────────────────
function buildToolbox(rc) {
  const type  = detectRobotType(rc);
  const sens  = rc.sensors || [];
  const tools = rc.tools   || [];
  const hasSens = (...n) => n.some(x => sens.includes(x));
  const hasTool = (...n) => n.some(x => tools.includes(x));
  const b = (t) => ({ kind:'block', type:t });

  const ctrl   = [b('robot_wait'),b('robot_repeat'),b('robot_forever'),b('robot_if_then'),b('robot_if_else'),b('robot_while'),b('robot_wait_until')];
  const lights = [b('robot_led_on'),b('robot_led_off'),b('robot_flash'),b('robot_rainbow'),b('robot_play_sound'),b('robot_voice'),b('robot_stealth_mode'),b('robot_emergency_lights'),b('robot_countdown'),b('robot_custom_sound')];
  const vars   = [b('robot_var_set'),b('robot_var_change'),b('robot_var_get'),b('robot_timer_start'),b('robot_timer_check'),b('robot_timer_reset')];

  let move=[], sense=[], ai=[], toolBlocks=[];

  switch(type) {
    case 'rover':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_spin'),b('robot_stop'),b('robot_set_speed'),b('robot_boost'),b('robot_brake'),
               b('robot_drift'),b('robot_strafe'),b('robot_orbit_target'),b('robot_follow_path'),
               b('robot_move_to_xy'),b('robot_face_direction'),b('robot_orbit_point'),
               b('robot_random_walk'),b('robot_emergency_stop'),b('robot_turn_smooth'),
               b('robot_accelerate'),b('robot_decelerate'),b('robot_maintain_distance'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_collision'),b('robot_battery_low'),b('robot_motion_detect'),
               b('robot_is_moving'),b('robot_get_speed'),b('robot_get_distance_traveled'),
               b('robot_line_detected'),b('robot_floor_edge'),b('robot_wall_nearby'),
               b('robot_light_level'),b('robot_temperature'),b('robot_humidity'),
               b('robot_timer_start'),b('robot_timer_done'),
               b('robot_counter_increment'),b('robot_counter_decrement'),b('robot_counter_value'),b('robot_counter_reset'),
               ...(hasSens('ultrasonic','lidar')?[b('robot_scan'),b('robot_distance_wall'),b('robot_distance_to')]:[] ),
               ...(hasSens('camera')            ?[b('robot_look'),b('robot_see_object'),b('robot_color_detect'),b('robot_face_detected'),b('robot_color_detected')]:[] ),
               ...(hasSens('line_sensor')        ?[b('robot_line_below')]:[] )];
      ai    = [b('robot_patrol_area'),b('robot_return_home'),b('robot_search_area'),b('robot_map_env'),
               b('robot_eval_strategy'),b('robot_guard_area'),b('robot_explore_area'),
               b('robot_recognize_object'),b('robot_identify_color'),b('robot_identify_shape'),
               b('robot_locate_object'),b('robot_autonomous_nav'),b('robot_smart_route'),
               b('robot_return_to_charger'),b('robot_adaptive_behavior'),b('robot_priority_decision'),
               b('robot_is_target_visible'),b('robot_target_distance'),b('robot_get_nearby_objects'),
               ...(hasSens('ultrasonic','lidar')?[b('robot_avoid_obstacle'),b('robot_predict_obstacle'),b('robot_smart_avoid_obj')]:[] ),
               ...(hasSens('camera')            ?[b('robot_follow_target'),b('robot_follow_line'),b('robot_investigate_sound')]:[] )];
      toolBlocks = [b('robot_headlights_on'),b('robot_headlights_off'),b('robot_flash_leds'),
                    b('robot_warning_lights'),b('robot_pulse_lights'),b('robot_robot_voice'),
                    b('robot_alarm_sound'),b('robot_success_sound'),b('robot_beep'),b('robot_communication_ping'),
                    b('robot_set_brightness'),b('robot_set_volume'),b('robot_display_text'),
                    ...(hasTool('grabber','claw')?[b('robot_grab'),b('robot_release'),b('robot_rotate_arm'),b('robot_tool_change')]:[] ),
                    ...(hasTool('drill')          ?[b('robot_drill')]:[] ),
                    ...(hasTool('laser')          ?[b('robot_fire_laser')]:[] ),
                    ...(hasSens('camera')         ?[b('robot_scan_object')]:[] )];
      break;

    case 'tank':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_tank_steer'),
               b('robot_rotate_place'),b('robot_climb_mode'),b('robot_power_mode'),b('robot_stop'),b('robot_boost')];
      sense = [b('robot_obstacle_ahead'),b('robot_collision'),b('robot_battery_low'),b('robot_scan'),b('robot_terrain_detect')];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),b('robot_guard_area'),b('robot_map_env')];
      toolBlocks = [b('robot_push_object'),b('robot_tool_change')];
      break;

    case 'drone':
      move  = [b('robot_takeoff'),b('robot_land'),b('robot_fly_up'),b('robot_fly_down'),
               b('robot_hover'),b('robot_rotate_air'),b('robot_altitude_hold'),b('robot_spin'),
               b('robot_yaw'),b('robot_barrel_roll'),b('robot_stabilize_flight'),b('robot_air_brake'),
               b('robot_circle_target'),b('robot_orbit_target'),b('robot_follow_path'),
               b('robot_emergency_land'),b('robot_maintain_altitude'),
               b('robot_drift_left'),b('robot_drift_right'),b('robot_boost_flight'),
               b('robot_wind_correction'),b('robot_precision_landing')];
      sense = [b('robot_aerial_scan'),b('robot_hover_scan'),b('robot_see_object'),
               b('robot_battery_low'),b('robot_obstacle_ahead'),b('robot_target_found'),
               b('robot_altitude'),b('robot_aerial_tracking'),b('robot_thermal_scan')];
      ai    = [b('robot_avoid_air_obstacle'),b('robot_follow_target'),b('robot_return_home'),
               b('robot_search_area'),b('robot_follow_beacon'),b('robot_formation_fly'),
               b('robot_swarm_signal'),b('robot_auto_return'),b('robot_aerial_mapping')];
      toolBlocks = [b('robot_gimbal_track'),b('robot_delivery_drop'),
                    ...(hasSens('camera')?[b('robot_scan_object')]:[] )];
      break;

    case 'jet':
      move  = [b('robot_thrust'),b('robot_roll_left'),b('robot_roll_right'),
               b('robot_pitch_up'),b('robot_pitch_down'),
               b('robot_glide'),b('robot_jet_boost'),b('robot_loop_maneuver'),b('robot_stop'),
               b('robot_barrel_roll'),b('robot_split_s'),b('robot_immelmann'),
               b('robot_stall_recovery'),b('robot_yaw'),b('robot_air_brake')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_aerial_scan'),b('robot_terrain_detect')];
      ai    = [b('robot_avoid_air_obstacle'),b('robot_return_home'),b('robot_autopilot_wp'),b('robot_follow_beacon')];
      toolBlocks = [];
      break;

    case 'spider':
      move  = [b('robot_step_forward'),b('robot_spider_crawl'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_climb_wall'),b('robot_wall_cling'),b('robot_grip_surface'),
               b('robot_stabilize_legs'),b('robot_crouch'),b('robot_leap'),b('robot_stop'),
               b('robot_tripod_gait'),b('robot_wave_gait'),b('robot_leg_coord'),b('robot_ceiling_traverse'),
               b('robot_spider_sprint'),b('robot_terrain_adapt'),b('robot_ceiling_cling'),
               b('robot_rotate_body'),b('robot_retract_legs'),b('robot_extend_legs'),
               b('robot_pounce_target'),b('robot_stealth_crawl'),b('robot_wall_jump'),
               b('robot_climb_over'),b('robot_diagonal_movement'),b('robot_spider_evade'),
               b('robot_precision_climb'),b('robot_wall_rotation'),b('robot_cling_timer')];
      sense = [b('robot_terrain_detect'),b('robot_obstacle_ahead'),b('robot_battery_low'),
               b('robot_motion_detect'),b('robot_distance_wall'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),
               b('robot_search_area'),b('robot_map_env'),b('robot_guard_area'),b('robot_follow_path')];
      toolBlocks = [b('robot_claw_grip'),b('robot_grip_strength'),
                    ...(hasTool('grabber','claw')?[b('robot_grab'),b('robot_release')]:[] )];
      break;

    case 'humanoid':
      move  = [b('robot_walk'),b('robot_step_forward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_crouch'),b('robot_kneel'),b('robot_rotate_torso'),b('robot_stop'),
               b('robot_jump'),b('robot_balance'),b('robot_leap')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_collision'),b('robot_motion_detect'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found'),b('robot_color_detect')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),
               b('robot_follow_target'),b('robot_search_area'),b('robot_map_env'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_wave'),b('robot_interact'),b('robot_carry_object'),b('robot_balance_mode'),
                    b('robot_tool_change'),
                    ...(hasTool('grabber','claw')?[b('robot_grab'),b('robot_release')]:[] )];
      break;

    case 'factory':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_rotate_arm'),b('robot_extend_arm'),b('robot_retract_arm'),b('robot_precision_mode'),b('robot_stop'),
               b('robot_navigate_to'),b('robot_return_home'),b('robot_emergency_stop'),b('robot_wait')];
      sense = [b('robot_see_object'),b('robot_battery_low'),b('robot_scan_object'),
               b('robot_color_detect'),b('robot_target_found'),b('robot_motion_detect'),
               b('robot_object_picked_up'),b('robot_arm_is_holding'),b('robot_arm_get_position'),
               b('robot_overheating'),b('robot_timer_start'),b('robot_timer_done'),
               b('robot_counter_increment'),b('robot_counter_decrement'),b('robot_counter_value'),b('robot_counter_reset')];
      ai    = [b('robot_sort_color'),b('robot_return_home'),b('robot_search_area'),
               b('robot_follow_target'),b('robot_eval_strategy'),
               b('robot_product_sort'),b('robot_quality_check'),b('robot_adaptive_behavior')];
      toolBlocks = [b('robot_grab'),b('robot_release'),b('robot_place_item'),b('robot_precision_grip'),
                    b('robot_stack_obj'),b('robot_drill'),b('robot_activate_welder'),b('robot_repair_obj'),
                    b('robot_arm_goto'),b('robot_rotate_joint'),b('robot_conveyor_sync'),b('robot_weld_point'),
                    b('robot_arm_move_relative'),b('robot_arm_smooth_motion'),b('robot_arm_precise_mode'),
                    b('robot_arm_speed_limit'),b('robot_arm_safe_mode'),b('robot_arm_collision_detect'),
                    b('robot_arm_emergency_stop'),b('robot_arm_grip_pressure'),
                    b('robot_set_joint_angle'),b('robot_get_joint_angle'),
                    b('robot_stack_objects'),b('robot_inspect_object'),b('robot_assembly_step'),
                    b('robot_tool_change'),b('robot_gimbal_track')];
      break;

    case 'hover':
      move  = [b('robot_hover_stabilize'),b('robot_fly_up'),b('robot_fly_down'),b('robot_float_up'),
               b('robot_side_drift'),b('robot_antigrav_boost'),b('robot_rotate_air'),b('robot_spin'),b('robot_stop'),
               b('robot_drift'),b('robot_boost'),b('robot_air_brake'),b('robot_anti_grav'),b('robot_orbit_target'),
               b('robot_anti_grav_boost'),b('robot_hover_side_drift'),
               b('robot_vertical_hover'),b('robot_floating_orbit'),b('robot_altitude_hold'),
               b('robot_emergency_land'),b('robot_maintain_altitude'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_see_object'),
               b('robot_aerial_scan'),b('robot_distance_wall'),b('robot_target_found'),b('robot_motion_detect'),
               b('robot_altitude'),b('robot_is_moving'),b('robot_timer_start'),b('robot_timer_done')];
      ai    = [b('robot_avoid_air_obstacle'),b('robot_follow_target'),b('robot_return_home'),
               b('robot_patrol_area'),b('robot_follow_beacon'),b('robot_guard_area'),
               b('robot_formation_fly'),b('robot_explore_area'),b('robot_adaptive_behavior')];
      toolBlocks = [b('robot_gimbal_track'),b('robot_grav_field_on'),b('robot_grav_field_off'),
                    b('robot_energy_overcharge'),b('robot_emergency_lights'),b('robot_flash_leds'),
                    ...(hasSens('camera')?[b('robot_scan_object'),b('robot_aerial_tracking')]:[] )];
      break;

    case 'underwater':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_dive'),b('robot_ascend_water'),b('robot_stabilize_underwater'),b('robot_spin'),b('robot_stop'),
               b('robot_buoyancy_adjust'),b('robot_pressure_equalize'),b('robot_water_stabilize'),
               b('robot_sub_stabilize'),b('robot_navigate_current'),b('robot_avoid_uw_obstacle'),
               b('robot_emergency_stop'),b('robot_wait')];
      sense = [b('robot_sonar_scan'),b('robot_sonar'),b('robot_sonar_pulse'),
               b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_distance_wall'),
               b('robot_pressure_check'),b('robot_pressure_reading'),b('robot_depth_measurement'),
               b('robot_terrain_detect'),b('robot_water_detected'),b('robot_scan_ocean_floor'),
               b('robot_timer_start'),b('robot_timer_done'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),
               b('robot_search_area'),b('robot_follow_target'),b('robot_map_env'),
               b('robot_explore_area'),b('robot_adaptive_behavior')];
      toolBlocks = [b('robot_collect_sample'),b('robot_sample_collect'),b('robot_tool_change'),
                    b('robot_sonar_pulse'),b('robot_scan_ocean_floor'),b('robot_emergency_lights'),
                    ...(hasTool('grabber','claw')?[b('robot_grab'),b('robot_release')]:[] )];
      break;

    case 'security':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_stop'),b('robot_set_speed'),b('robot_spin'),b('robot_brake'),
               b('robot_patrol_route'),b('robot_investigate'),b('robot_follow_suspect'),
               b('robot_return_to_station'),b('robot_deploy_barrier'),b('robot_guard_object')];
      sense = [b('robot_detect_intruder'),b('robot_threat_assess'),b('robot_obstacle_ahead'),
               b('robot_battery_low'),b('robot_motion_detect'),b('robot_collision'),
               b('robot_scan_perimeter'),b('robot_track_target'),b('robot_monitor_camera'),b('robot_security_report'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_patrol_area'),b('robot_return_home'),b('robot_search_area'),b('robot_map_env'),
               b('robot_guard_area'),b('robot_follow_target'),b('robot_predict_obstacle'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_activate_alarm'),b('robot_spotlight_target'),b('robot_secure_zone'),
                    b('robot_lock_entrance'),b('robot_emergency_lights'),b('robot_custom_sound')];
      break;

    case 'medbot':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_stop'),b('robot_set_speed'),b('robot_spin'),b('robot_brake'),
               b('robot_navigate_to'),b('robot_return_home')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_motion_detect'),b('robot_collision'),
               b('robot_scan'),b('robot_distance'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_follow_target'),b('robot_return_home'),
               b('robot_search_area'),b('robot_map_env'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_led_color'),b('robot_emergency_lights'),b('robot_custom_sound'),b('robot_display_text')];
      break;

    case 'firebot':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_stop'),b('robot_set_speed'),b('robot_spin'),b('robot_brake'),
               b('robot_navigate_to'),b('robot_return_home')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_motion_detect'),b('robot_collision'),
               b('robot_temperature'),b('robot_scan'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),
               b('robot_search_area'),b('robot_guard_area'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_emergency_lights'),b('robot_activate_alarm'),b('robot_custom_sound'),b('robot_display_text')];
      break;

    case 'racedrone':
      move  = [b('robot_fly_forward'),b('robot_fly_backward'),b('robot_fly_left'),b('robot_fly_right'),
               b('robot_ascend'),b('robot_descend'),b('robot_stop'),b('robot_set_speed'),
               b('robot_yaw_left'),b('robot_yaw_right'),b('robot_flip'),b('robot_boost')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_altitude'),b('robot_tilt'),
               b('robot_scan'),b('robot_collision'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_follow_path'),b('robot_return_home'),
               b('robot_predict_obstacle'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_led_color'),b('robot_emergency_lights'),b('robot_custom_sound')];
      break;

    case 'factorybot':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_stop'),b('robot_set_speed'),b('robot_navigate_to'),b('robot_return_home')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_collision'),
               b('robot_scan'),b('robot_distance'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_search_area'),b('robot_map_env'),
               b('robot_guard_area'),b('robot_eval_strategy'),b('robot_predict_obstacle')];
      toolBlocks = [b('robot_arm_extend'),b('robot_arm_retract'),b('robot_gripper_open'),b('robot_gripper_close'),
                    b('robot_arm_rotate'),b('robot_lift_object'),b('robot_drop_object'),
                    b('robot_led_color'),b('robot_custom_sound')];
      break;

    default: // rover fallback
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),b('robot_stop')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_scan')];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home')];
  }

  // Always include a Tools category — use role-specific blocks or a universal fallback
  const defaultTools = [
    b('robot_grab'), b('robot_release'), b('robot_rotate_arm'),
    b('robot_drill'), b('robot_fire_laser'), b('robot_scan_object'),
    b('robot_extend_arm'), b('robot_retract_arm'), b('robot_place_item'),
    b('robot_precision_grip'), b('robot_tool_change'),
  ];
  const finalTools = toolBlocks.length > 0 ? toolBlocks : defaultTools;

  const contents = [
    { kind:'category', name:'⚡  Events',    colour:'#e11d48', contents:[b('robot_when_start')] },
    { kind:'category', name:'🏃  Move',      colour:'#3b82f6', contents:move },
    { kind:'category', name:'🔁  Control',   colour:'#f97316', contents:ctrl },
    { kind:'category', name:'📡  Sense',     colour:'#22c55e', contents:sense },
    { kind:'category', name:'🧠  AI',        colour:'#a855f7', contents:ai },
    { kind:'category', name:'🔧  Tools',     colour:'#ec4899', contents:finalTools },
    { kind:'category', name:'💡  Lights',    colour:'#06b6d4', contents:lights },
    { kind:'category', name:'📦  Variables', colour:'#f59e0b', contents:vars },
  ];
  return { kind:'categoryToolbox', contents };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALK BLOCKLY TREE → flat SimCanvas action array
// ─────────────────────────────────────────────────────────────────────────────
function walkBlocks(block) {
  const acts = [];
  while (block) {
    const t = block.type;
    const bid = block.id;

    if (t === 'robot_when_start') { /* hat — skip */ }
    else if (t === 'robot_move_forward')
      acts.push({ id:'move_forward',  cat:'move',    icon:'⬆', label:'Move Forward',  blocklyId:bid, paramValues:{ steps:   +block.getFieldValue('STEPS')||3 } });
    else if (t === 'robot_move_backward')
      acts.push({ id:'move_backward', cat:'move',    icon:'⬇', label:'Reverse',        blocklyId:bid, paramValues:{ steps:   +block.getFieldValue('STEPS')||2 } });
    else if (t === 'robot_turn_left')
      acts.push({ id:'turn_left',     cat:'move',    icon:'↺', label:'Turn Left',      blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_turn_right')
      acts.push({ id:'turn_right',    cat:'move',    icon:'↻', label:'Turn Right',     blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_spin')
      acts.push({ id:'spin',          cat:'move',    icon:'🌀', label:'Spin Around',   blocklyId:bid, paramValues:{ degrees: 360 } });
    else if (t === 'robot_stop')
      acts.push({ id:'stop',          cat:'move',    icon:'⏹', label:'Stop',           blocklyId:bid, paramValues:{} });
    else if (t === 'robot_set_speed')
      acts.push({ id:'set_speed',     cat:'move',    icon:'⚡', label:'Set Speed',      blocklyId:bid, paramValues:{ speed: block.getFieldValue('SPEED')||'medium' } });
    else if (t === 'robot_fly_up')
      acts.push({ id:'fly_up',        cat:'move',    icon:'🚀', label:'Fly Up',        blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_fly_down')
      acts.push({ id:'fly_down',      cat:'move',    icon:'📉', label:'Fly Down',      blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_hover')
      acts.push({ id:'hover_hold',    cat:'move',    icon:'🛸', label:'Hover',         blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||1 } });
    else if (t === 'robot_jump')
      acts.push({ id:'jump',          cat:'move',    icon:'⬆', label:'Jump',           blocklyId:bid, paramValues:{} });
    else if (t === 'robot_wait')
      acts.push({ id:'wait',          cat:'control', icon:'⏸', label:'Wait',           blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||1 } });
    else if (t === 'robot_repeat') {
      const times = Math.max(1, parseInt(block.getFieldValue('TIMES'))||3);
      const inner = block.getInputTargetBlock('DO');
      const inner_acts = inner ? walkBlocks(inner) : [];
      for (let i = 0; i < times; i++) inner_acts.forEach(a => acts.push({...a}));
    }
    else if (t === 'robot_forever') {
      const inner = block.getInputTargetBlock('DO');
      const inner_acts = inner ? walkBlocks(inner) : [];
      for (let i = 0; i < 5; i++) inner_acts.forEach(a => acts.push({...a}));
    }
    else if (t === 'robot_if_then') {
      const inner = block.getInputTargetBlock('DO');
      const inner_acts = inner ? walkBlocks(inner) : [];
      inner_acts.forEach(a => acts.push(a));
    }
    else if (t === 'robot_obstacle_ahead' || t === 'robot_collision')
      acts.push({ id:'obstacle_ahead', cat:'sense',  icon:'🚧', label:'Obstacle?',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_line_below')
      acts.push({ id:'line_below',     cat:'sense',  icon:'〰', label:'Line Below?',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_see_object')
      acts.push({ id:'see_object',     cat:'sense',  icon:'👁', label:'See Object?',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_battery_low')
      acts.push({ id:'battery_low',    cat:'sense',  icon:'🔋', label:'Battery Low?', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_scan')
      acts.push({ id:'scan',           cat:'sense',  icon:'📡', label:'Scan',         blocklyId:bid, paramValues:{} });
    else if (t === 'robot_look')
      acts.push({ id:'look',           cat:'sense',  icon:'👁', label:'Look Around',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_avoid_obstacle')
      acts.push({ id:'avoid_obstacle', cat:'ai',     icon:'🛡', label:'Avoid',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_follow_line')
      acts.push({ id:'follow_line',    cat:'ai',     icon:'〰', label:'Follow Line',  blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||5 } });
    else if (t === 'robot_patrol_area')
      acts.push({ id:'patrol_area',    cat:'ai',     icon:'🔄', label:'Patrol Area',  blocklyId:bid, paramValues:{ laps:  +block.getFieldValue('LAPS')||2 } });
    else if (t === 'robot_follow_target')
      acts.push({ id:'follow_target',  cat:'ai',     icon:'🎯', label:'Follow',       blocklyId:bid, paramValues:{ steps: +block.getFieldValue('STEPS')||4 } });
    else if (t === 'robot_return_home')
      acts.push({ id:'return_home',    cat:'ai',     icon:'🏠', label:'Return Home',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_search_area')
      acts.push({ id:'search_area',    cat:'ai',     icon:'🔍', label:'Search Area',  blocklyId:bid, paramValues:{ radius: +block.getFieldValue('RADIUS')||3 } });
    else if (t === 'robot_grab')
      acts.push({ id:'grab',           cat:'tools',  icon:'✊', label:'Grab',         blocklyId:bid, paramValues:{} });
    else if (t === 'robot_release')
      acts.push({ id:'release',        cat:'tools',  icon:'👐', label:'Release',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_rotate_arm')
      acts.push({ id:'rotate_arm',     cat:'tools',  icon:'🦾', label:'Rotate Arm',  blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_drill')
      acts.push({ id:'drill',          cat:'tools',  icon:'🔩', label:'Drill',        blocklyId:bid, paramValues:{ seconds: +block.getFieldValue('SECS')||2 } });
    else if (t === 'robot_fire_laser')
      acts.push({ id:'fire_laser',     cat:'tools',  icon:'⚡', label:'Laser',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_scan_object')
      acts.push({ id:'scan_object',    cat:'tools',  icon:'📷', label:'Scan Object',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_led_on')
      acts.push({ id:'lights_on',      cat:'lights', icon:'💡', label:'LEDs On',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_led_off')
      acts.push({ id:'lights_off',     cat:'lights', icon:'🌑', label:'LEDs Off',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_flash')
      acts.push({ id:'flash',          cat:'lights', icon:'✨', label:'Flash',         blocklyId:bid, paramValues:{ times: +block.getFieldValue('TIMES')||3 } });
    else if (t === 'robot_rainbow')
      acts.push({ id:'rainbow',        cat:'lights', icon:'🌈', label:'Rainbow',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_play_sound')
      acts.push({ id:'play_sound',     cat:'lights', icon:'🔊', label:'Play Sound',   blocklyId:bid, paramValues:{ sound: block.getFieldValue('SOUND')||'beep' } });
    else if (t === 'robot_voice')
      acts.push({ id:'robot_voice',    cat:'lights', icon:'🤖', label:'Robot Voice',  blocklyId:bid, paramValues:{} });

    // ── DRONE ──
    else if (t === 'robot_takeoff')
      acts.push({ id:'takeoff',          cat:'move', icon:'🛸', label:'Take Off',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_land')
      acts.push({ id:'land',             cat:'move', icon:'🛬', label:'Land',            blocklyId:bid, paramValues:{} });
    else if (t === 'robot_rotate_air')
      acts.push({ id:'rotate_air',       cat:'move', icon:'🔄', label:'Rotate Air',     blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_altitude_hold')
      acts.push({ id:'altitude_hold',    cat:'move', icon:'✈️', label:'Hold Altitude',  blocklyId:bid, paramValues:{ seconds:+block.getFieldValue('SECS')||1 } });
    else if (t === 'robot_avoid_air_obstacle')
      acts.push({ id:'avoid_air',        cat:'ai',   icon:'🛡', label:'Avoid Air',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_aerial_scan')
      acts.push({ id:'aerial_scan',      cat:'sense',icon:'📡', label:'Aerial Scan',    blocklyId:bid, paramValues:{} });

    // ── JET ──
    else if (t === 'robot_thrust')
      acts.push({ id:'thrust',           cat:'move', icon:'🔥', label:'Thrust',          blocklyId:bid, paramValues:{} });
    else if (t === 'robot_roll_left')
      acts.push({ id:'roll_left',        cat:'move', icon:'↰',  label:'Roll Left',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_roll_right')
      acts.push({ id:'roll_right',       cat:'move', icon:'↱',  label:'Roll Right',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pitch_up')
      acts.push({ id:'pitch_up',         cat:'move', icon:'⬆',  label:'Pitch Up',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pitch_down')
      acts.push({ id:'pitch_down',       cat:'move', icon:'⬇',  label:'Pitch Down',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_glide')
      acts.push({ id:'glide',            cat:'move', icon:'🪂', label:'Glide',           blocklyId:bid, paramValues:{ seconds:+block.getFieldValue('SECS')||2 } });
    else if (t === 'robot_jet_boost')
      acts.push({ id:'jet_boost',        cat:'move', icon:'⚡', label:'Boost!',          blocklyId:bid, paramValues:{} });
    else if (t === 'robot_loop_maneuver')
      acts.push({ id:'loop_maneuver',    cat:'move', icon:'🔁', label:'Loop Maneuver',   blocklyId:bid, paramValues:{} });

    // ── TANK ──
    else if (t === 'robot_tank_steer')
      acts.push({ id:'tank_steer',       cat:'move', icon:'🎮', label:'Tank Steer',      blocklyId:bid, paramValues:{ dir:block.getFieldValue('DIR')||'left' } });
    else if (t === 'robot_rotate_place')
      acts.push({ id:'rotate_place',     cat:'move', icon:'🔄', label:'Rotate In Place', blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_push_object')
      acts.push({ id:'push_object',      cat:'tools',icon:'💪', label:'Push Object',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_climb_mode')
      acts.push({ id:'climb_mode',       cat:'move', icon:'🏔️', label:'Climb Mode',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_power_mode')
      acts.push({ id:'power_mode',       cat:'move', icon:'⚡', label:'Power Mode',      blocklyId:bid, paramValues:{} });

    // ── SPIDER ──
    else if (t === 'robot_step_forward')
      acts.push({ id:'step_forward',     cat:'move', icon:'🦶', label:'Step Forward',    blocklyId:bid, paramValues:{ steps:+block.getFieldValue('STEPS')||3 } });
    else if (t === 'robot_climb_wall')
      acts.push({ id:'climb_wall',       cat:'move', icon:'🧗', label:'Climb Wall',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_stabilize_legs')
      acts.push({ id:'stabilize_legs',   cat:'move', icon:'⚖️', label:'Stabilize',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_crouch')
      acts.push({ id:'crouch',           cat:'move', icon:'🫳', label:'Crouch',          blocklyId:bid, paramValues:{} });
    else if (t === 'robot_leap')
      acts.push({ id:'leap',             cat:'move', icon:'🏃', label:'Leap!',           blocklyId:bid, paramValues:{} });
    else if (t === 'robot_terrain_detect')
      acts.push({ id:'terrain_detect',   cat:'sense',icon:'🔍', label:'Terrain Detect',  blocklyId:bid, paramValues:{} });

    // ── FACTORY ──
    else if (t === 'robot_stack_obj')
      acts.push({ id:'stack_obj',        cat:'tools',icon:'📚', label:'Stack Object',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_sort_color')
      acts.push({ id:'sort_color',       cat:'tools',icon:'🎨', label:'Sort Color',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_precision_mode')
      acts.push({ id:'precision_mode',   cat:'tools',icon:'🎯', label:'Precision Mode',  blocklyId:bid, paramValues:{} });

    // ── NEW DRONE / FLIGHT BLOCKS ────────────────────────────────────────
    else if (t === 'robot_fly_forward')
      acts.push({ id:'move_forward',  cat:'move', icon:'✈️', label:'Fly Forward',  blocklyId:bid, paramValues:{ steps: +block.getFieldValue('DIST')||3 } });
    else if (t === 'robot_fly_backward')
      acts.push({ id:'move_backward', cat:'move', icon:'✈️', label:'Fly Backward', blocklyId:bid, paramValues:{ steps: +block.getFieldValue('DIST')||3 } });
    else if (t === 'robot_fly_left')
      acts.push({ id:'strafe_left',   cat:'move', icon:'⬅️', label:'Strafe Left',  blocklyId:bid, paramValues:{ steps: +block.getFieldValue('DIST')||2 } });
    else if (t === 'robot_fly_right')
      acts.push({ id:'strafe_right',  cat:'move', icon:'➡️', label:'Strafe Right', blocklyId:bid, paramValues:{ steps: +block.getFieldValue('DIST')||2 } });
    else if (t === 'robot_ascend')
      acts.push({ id:'fly_up',        cat:'move', icon:'⬆️', label:'Ascend',       blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_descend')
      acts.push({ id:'fly_down',      cat:'move', icon:'⬇️', label:'Descend',      blocklyId:bid, paramValues:{ height: +block.getFieldValue('HEIGHT')||2 } });
    else if (t === 'robot_yaw_left')
      acts.push({ id:'turn_left',     cat:'move', icon:'↺',  label:'Yaw Left',     blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_yaw_right')
      acts.push({ id:'turn_right',    cat:'move', icon:'↻',  label:'Yaw Right',    blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_flip')
      acts.push({ id:'flip',          cat:'move', icon:'🔄', label:'Flip',         blocklyId:bid, paramValues:{ dir: block.getFieldValue('DIR')||'forward' } });
    else if (t === 'robot_tilt')
      acts.push({ id:'tilt',          cat:'move', icon:'📐', label:'Tilt',         blocklyId:bid, paramValues:{ axis: block.getFieldValue('AXIS')||'pitch', angle: +block.getFieldValue('ANGLE')||30 } });
    else if (t === 'robot_led_color')
      acts.push({ id:'led_color',     cat:'lights',icon:'🎨', label:'LED Color',   blocklyId:bid, paramValues:{ color: block.getFieldValue('COLOR')||'cyan' } });

    // ── NEW ARM BLOCKS ───────────────────────────────────────────────────
    else if (t === 'robot_arm_extend')
      acts.push({ id:'arm_extend',    cat:'tools', icon:'🦾', label:'Extend Arm',  blocklyId:bid, paramValues:{ dist: +block.getFieldValue('DIST')||20 } });
    else if (t === 'robot_arm_retract')
      acts.push({ id:'arm_retract',   cat:'tools', icon:'🦾', label:'Retract Arm', blocklyId:bid, paramValues:{ dist: +block.getFieldValue('DIST')||20 } });
    else if (t === 'robot_gripper_open')
      acts.push({ id:'gripper_open',  cat:'tools', icon:'👐', label:'Open Gripper',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_gripper_close')
      acts.push({ id:'gripper_close', cat:'tools', icon:'✊', label:'Close Gripper',blocklyId:bid, paramValues:{ force: +block.getFieldValue('FORCE')||50 } });
    else if (t === 'robot_arm_rotate')
      acts.push({ id:'rotate_arm',    cat:'tools', icon:'🔄', label:'Rotate Arm',  blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_lift_object')
      acts.push({ id:'lift_object',   cat:'tools', icon:'⬆',  label:'Lift Object', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_drop_object')
      acts.push({ id:'drop_object',   cat:'tools', icon:'⬇',  label:'Drop Object', blocklyId:bid, paramValues:{} });

    // ── EXPANDED MOVEMENT / SENSE / AI BLOCKS ────────────────────────────
    else if (t === 'robot_accelerate')
      acts.push({ id:'accelerate',    cat:'move', icon:'⚡', label:'Accelerate',   blocklyId:bid, paramValues:{ amount: +block.getFieldValue('AMOUNT')||50 } });
    else if (t === 'robot_decelerate')
      acts.push({ id:'decelerate',    cat:'move', icon:'🔻', label:'Decelerate',   blocklyId:bid, paramValues:{ amount: +block.getFieldValue('AMOUNT')||50 } });
    else if (t === 'robot_brake')
      acts.push({ id:'stop',          cat:'move', icon:'🛑', label:'Brake',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_emergency_stop')
      acts.push({ id:'stop',          cat:'move', icon:'🆘', label:'Emergency Stop',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_drift' || t === 'robot_drift_left')
      acts.push({ id:'strafe_left',   cat:'move', icon:'↖', label:'Drift',         blocklyId:bid, paramValues:{ steps:2 } });
    else if (t === 'robot_drift_right')
      acts.push({ id:'strafe_right',  cat:'move', icon:'↗', label:'Drift Right',   blocklyId:bid, paramValues:{ steps:2 } });
    else if (t === 'robot_strafe')
      acts.push({ id:'strafe_left',   cat:'move', icon:'↔', label:'Strafe',        blocklyId:bid, paramValues:{ steps:2 } });
    else if (t === 'robot_move_to_xy')
      acts.push({ id:'move_forward',  cat:'move', icon:'🎯', label:'Move To XY',   blocklyId:bid, paramValues:{ steps: +block.getFieldValue('X')||5 } });
    else if (t === 'robot_navigate_to' || t === 'robot_navigate_checkpoint')
      acts.push({ id:'move_forward',  cat:'ai',   icon:'🧭', label:'Navigate To',  blocklyId:bid, paramValues:{ steps:6 } });
    else if (t === 'robot_face_direction')
      acts.push({ id:'turn_right',    cat:'move', icon:'🧭', label:'Face Direction',blocklyId:bid, paramValues:{ degrees: +block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_orbit_target' || t === 'robot_orbit_point')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'🌀', label:'Orbit Target', blocklyId:bid, paramValues:{ laps:1 } });
    else if (t === 'robot_random_move' || t === 'robot_random_walk')
      acts.push({ id:'random_move',   cat:'ai',   icon:'🎲', label:'Random Move',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_follow_path')
      acts.push({ id:'follow_line',   cat:'ai',   icon:'🛤️', label:'Follow Path',  blocklyId:bid, paramValues:{ steps:8 } });
    else if (t === 'robot_patrol_route')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'🔄', label:'Patrol Route', blocklyId:bid, paramValues:{ laps:3 } });
    else if (t === 'robot_maintain_distance')
      acts.push({ id:'follow_target', cat:'ai',   icon:'📐', label:'Keep Distance',blocklyId:bid, paramValues:{ steps:4 } });
    else if (t === 'robot_auto_return' || t === 'robot_return_to_charger' || t === 'robot_return_to_station')
      acts.push({ id:'return_home',   cat:'ai',   icon:'🏠', label:'Return Home',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_map_env' || t === 'robot_explore_area')
      acts.push({ id:'search_area',   cat:'ai',   icon:'🗺️', label:'Map Area',     blocklyId:bid, paramValues:{ radius:4 } });
    else if (t === 'robot_smart_avoid_obj' || t === 'robot_predict_obstacle')
      acts.push({ id:'avoid_obstacle',cat:'ai',   icon:'🛡', label:'Smart Avoid',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_smart_route')
      acts.push({ id:'follow_line',   cat:'ai',   icon:'🧠', label:'Smart Route',  blocklyId:bid, paramValues:{ steps:6 } });
    else if (t === 'robot_autonomous_nav')
      acts.push({ id:'follow_line',   cat:'ai',   icon:'🤖', label:'Autonomous',   blocklyId:bid, paramValues:{ steps:8 } });
    else if (t === 'robot_formation_fly')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'✈️', label:'Formation',    blocklyId:bid, paramValues:{ laps:2 } });
    else if (t === 'robot_eval_strategy' || t === 'robot_priority_decision' || t === 'robot_threat_assess' || t === 'robot_threat_assessment')
      acts.push({ id:'scan',          cat:'ai',   icon:'🧠', label:'Strategy',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_adaptive_behavior')
      acts.push({ id:'avoid_obstacle',cat:'ai',   icon:'🔄', label:'Adaptive',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_swarm_signal' || t === 'robot_communication_ping')
      acts.push({ id:'scan',          cat:'sense',icon:'📡', label:'Signal',       blocklyId:bid, paramValues:{} });

    // Sensor / perception
    else if (t === 'robot_distance_to' || t === 'robot_distance_wall')
      acts.push({ id:'scan',          cat:'sense',icon:'📏', label:'Measure Dist', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_temperature')
      acts.push({ id:'scan',          cat:'sense',icon:'🌡️', label:'Temperature', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_light_level')
      acts.push({ id:'scan',          cat:'sense',icon:'💡', label:'Light Level',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_color_detect' || t === 'robot_identify_color')
      acts.push({ id:'scan',          cat:'sense',icon:'🎨', label:'Color Detect', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_identify_shape' || t === 'robot_recognize_object')
      acts.push({ id:'see_object',    cat:'sense',icon:'🔍', label:'ID Shape',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_motion_detect' || t === 'robot_sound_detected')
      acts.push({ id:'scan',          cat:'sense',icon:'📡', label:'Detect',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_sonar' || t === 'robot_sonar_pulse' || t === 'robot_sonar_scan')
      acts.push({ id:'scan',          cat:'sense',icon:'📡', label:'Sonar',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_thermal_scan')
      acts.push({ id:'see_object',    cat:'sense',icon:'🔥', label:'Thermal Scan', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_floor_edge')
      acts.push({ id:'line_below',    cat:'sense',icon:'⚠️', label:'Floor Edge',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_wall_nearby')
      acts.push({ id:'obstacle_ahead',cat:'sense',icon:'🧱', label:'Wall Nearby',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_scan_perimeter' || t === 'robot_scan_surroundings')
      acts.push({ id:'scan',          cat:'sense',icon:'🔄', label:'Scan Around',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_face_detected' || t === 'robot_detect_intruder')
      acts.push({ id:'see_object',    cat:'sense',icon:'👤', label:'Detect Face',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_locate_object')
      acts.push({ id:'see_object',    cat:'sense',icon:'📍', label:'Locate',       blocklyId:bid, paramValues:{} });

    // Effects / tools
    else if (t === 'robot_extend_arm')
      acts.push({ id:'arm_extend',    cat:'tools',icon:'🦾', label:'Extend Arm',   blocklyId:bid, paramValues:{ dist:20 } });
    else if (t === 'robot_retract_arm')
      acts.push({ id:'arm_retract',   cat:'tools',icon:'🦾', label:'Retract Arm',  blocklyId:bid, paramValues:{ dist:20 } });
    else if (t === 'robot_grab' || t === 'robot_claw_grip')
      acts.push({ id:'grab',          cat:'tools',icon:'✊', label:'Grab',         blocklyId:bid, paramValues:{} });
    else if (t === 'robot_inspect_object')
      acts.push({ id:'scan_object',   cat:'tools',icon:'🔬', label:'Inspect',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pick_cargo' || t === 'robot_carry_object')
      acts.push({ id:'grab',          cat:'tools',icon:'📦', label:'Pick Cargo',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_delivery_drop' || t === 'robot_place_item')
      acts.push({ id:'drop_object',   cat:'tools',icon:'📦', label:'Deliver',      blocklyId:bid, paramValues:{} });
    else if (t === 'robot_deploy_barrier' || t === 'robot_deploy_cable')
      acts.push({ id:'grab',          cat:'tools',icon:'🚧', label:'Deploy',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_activate_welder' || t === 'robot_weld_point' || t === 'robot_repair_obj')
      acts.push({ id:'drill',         cat:'tools',icon:'🔧', label:'Weld/Repair',  blocklyId:bid, paramValues:{ seconds:2 } });
    else if (t === 'robot_build_structure' || t === 'robot_assembly_step')
      acts.push({ id:'rotate_place',  cat:'tools',icon:'🏗️', label:'Build',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_rotate_joint')
      acts.push({ id:'rotate_arm',    cat:'tools',icon:'🦾', label:'Rotate Joint', blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_set_joint_angle')
      acts.push({ id:'rotate_arm',    cat:'tools',icon:'📐', label:'Set Joint',    blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_grip_strength')
      acts.push({ id:'gripper_close', cat:'tools',icon:'💪', label:'Grip Strength',blocklyId:bid, paramValues:{ force:+block.getFieldValue('FORCE')||80 } });
    else if (t === 'robot_grip_surface')
      acts.push({ id:'grab',          cat:'tools',icon:'🖐️', label:'Grip Surface',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_precision_grip')
      acts.push({ id:'gripper_close', cat:'tools',icon:'🎯', label:'Precision Grip',blocklyId:bid, paramValues:{ force:25 } });
    else if (t === 'robot_tool_change')
      acts.push({ id:'precision_mode',cat:'tools',icon:'🔧', label:'Change Tool',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_hologram_display')
      acts.push({ id:'lights_on',     cat:'lights',icon:'✨', label:'Hologram',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_spotlight_target')
      acts.push({ id:'lights_on',     cat:'lights',icon:'💡', label:'Spotlight',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pulse_lights' || t === 'robot_flash_leds')
      acts.push({ id:'flash',         cat:'lights',icon:'✨', label:'Pulse Lights',blocklyId:bid, paramValues:{ times:3 } });
    else if (t === 'robot_warning_lights' || t === 'robot_emergency_lights')
      acts.push({ id:'flash',         cat:'lights',icon:'🚨', label:'Warning',     blocklyId:bid, paramValues:{ times:5 } });
    else if (t === 'robot_stealth_mode')
      acts.push({ id:'lights_off',    cat:'lights',icon:'🌑', label:'Stealth',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_display_text')
      acts.push({ id:'robot_voice',   cat:'lights',icon:'💬', label:'Display Text',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_set_brightness')
      acts.push({ id:'lights_on',     cat:'lights',icon:'🔆', label:'Brightness',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_beep' || t === 'robot_alarm_sound' || t === 'robot_success_sound' || t === 'robot_set_volume')
      acts.push({ id:'play_sound',    cat:'lights',icon:'🔊', label:'Sound',       blocklyId:bid, paramValues:{ sound:'beep' } });
    else if (t === 'robot_countdown')
      acts.push({ id:'wait',          cat:'lights',icon:'⏱️', label:'Countdown',  blocklyId:bid, paramValues:{ seconds:3 } });

    // Spider / walker specific
    else if (t === 'robot_wall_jump')
      acts.push({ id:'jump',          cat:'move', icon:'🧗', label:'Wall Jump',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_ceiling_cling' || t === 'robot_ceiling_traverse')
      acts.push({ id:'climb_wall',    cat:'move', icon:'🕷️', label:'Ceiling',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pounce_target')
      acts.push({ id:'leap',          cat:'move', icon:'🏃', label:'Pounce',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_spider_crawl' || t === 'robot_tripod_gait' || t === 'robot_wave_gait')
      acts.push({ id:'step_forward',  cat:'move', icon:'🕷️', label:'Crawl',       blocklyId:bid, paramValues:{ steps:4 } });
    else if (t === 'robot_spider_sprint')
      acts.push({ id:'step_forward',  cat:'move', icon:'🏃', label:'Sprint',       blocklyId:bid, paramValues:{ steps:8 } });
    else if (t === 'robot_spider_evade')
      acts.push({ id:'avoid_obstacle',cat:'move', icon:'🕷️', label:'Evade',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_stealth_crawl')
      acts.push({ id:'step_forward',  cat:'move', icon:'🌑', label:'Stealth Crawl',blocklyId:bid, paramValues:{ steps:3 } });
    else if (t === 'robot_precision_climb')
      acts.push({ id:'climb_wall',    cat:'move', icon:'🎯', label:'Precise Climb',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_cling_timer')
      acts.push({ id:'wait',          cat:'move', icon:'⏱️', label:'Cling Wait',  blocklyId:bid, paramValues:{ seconds:2 } });
    else if (t === 'robot_wall_cling' || t === 'robot_wall_rotation')
      acts.push({ id:'climb_wall',    cat:'move', icon:'🧱', label:'Wall Cling',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_climb_over')
      acts.push({ id:'climb_mode',    cat:'move', icon:'🏔️', label:'Climb Over',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_extend_legs')
      acts.push({ id:'stabilize_legs',cat:'move', icon:'🦿', label:'Extend Legs', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_retract_legs')
      acts.push({ id:'crouch',        cat:'move', icon:'🦿', label:'Retract Legs',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_terrain_adapt')
      acts.push({ id:'terrain_detect',cat:'sense',icon:'⛰️', label:'Adapt Terrain',blocklyId:bid, paramValues:{} });

    // Humanoid gestures
    else if (t === 'robot_wave')
      acts.push({ id:'wave',          cat:'tools',icon:'👋', label:'Wave',         blocklyId:bid, paramValues:{} });
    else if (t === 'robot_kneel')
      acts.push({ id:'crouch',        cat:'move', icon:'🧎', label:'Kneel',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_walk')
      acts.push({ id:'move_forward',  cat:'move', icon:'🚶', label:'Walk',         blocklyId:bid, paramValues:{ steps:3 } });
    else if (t === 'robot_rotate_torso' || t === 'robot_rotate_body')
      acts.push({ id:'rotate_place',  cat:'move', icon:'🔄', label:'Rotate Torso', blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||90 } });
    else if (t === 'robot_diagonal_movement')
      acts.push({ id:'strafe_left',   cat:'move', icon:'↗', label:'Diagonal',      blocklyId:bid, paramValues:{ steps:2 } });
    else if (t === 'robot_balance' || t === 'robot_balance_mode')
      acts.push({ id:'stabilize_legs',cat:'move', icon:'⚖️', label:'Balance',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_interact')
      acts.push({ id:'grab',          cat:'tools',icon:'🤝', label:'Interact',     blocklyId:bid, paramValues:{} });

    // Hover specific
    else if (t === 'robot_anti_grav' || t === 'robot_anti_grav_boost' || t === 'robot_antigrav_boost')
      acts.push({ id:'fly_up',        cat:'move', icon:'🛸', label:'Anti-Grav',    blocklyId:bid, paramValues:{ height:1 } });
    else if (t === 'robot_vertical_hover' || t === 'robot_maintain_altitude')
      acts.push({ id:'altitude_hold', cat:'move', icon:'🛸', label:'Hover Hold',   blocklyId:bid, paramValues:{ seconds:2 } });
    else if (t === 'robot_hover_side_drift')
      acts.push({ id:'strafe_left',   cat:'move', icon:'🛸', label:'Side Drift',   blocklyId:bid, paramValues:{ steps:2 } });
    else if (t === 'robot_floating_orbit')
      acts.push({ id:'patrol_area',   cat:'move', icon:'🌀', label:'Float Orbit',  blocklyId:bid, paramValues:{ laps:1 } });
    else if (t === 'robot_grav_field_on')
      acts.push({ id:'power_mode',    cat:'move', icon:'⚡', label:'Grav Field On',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_grav_field_off')
      acts.push({ id:'stabilize_legs',cat:'move', icon:'🔋', label:'Grav Off',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_energy_overcharge')
      acts.push({ id:'jet_boost',     cat:'move', icon:'⚡', label:'Overcharge',   blocklyId:bid, paramValues:{} });

    // Underwater
    else if (t === 'robot_dive' || t === 'robot_ascend_water')
      acts.push({ id:'fly_up',        cat:'move', icon:'🌊', label:'Dive/Ascend',  blocklyId:bid, paramValues:{ height:2 } });
    else if (t === 'robot_buoyancy_adjust')
      acts.push({ id:'altitude_hold', cat:'move', icon:'🌊', label:'Buoyancy',     blocklyId:bid, paramValues:{ seconds:1 } });
    else if (t === 'robot_depth_measurement')
      acts.push({ id:'scan',          cat:'sense',icon:'📏', label:'Depth',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_sonar_pulse' || t === 'robot_scan_ocean_floor')
      acts.push({ id:'scan',          cat:'sense',icon:'🔊', label:'Sonar Pulse',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_water_stabilize' || t === 'robot_stabilize_underwater' || t === 'robot_sub_stabilize')
      acts.push({ id:'stabilize_legs',cat:'move', icon:'🌊', label:'Stabilize',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_water_detected')
      acts.push({ id:'line_below',    cat:'sense',icon:'💧', label:'Water?',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_dock')
      acts.push({ id:'return_home',   cat:'ai',   icon:'⚓', label:'Dock',         blocklyId:bid, paramValues:{} });
    else if (t === 'robot_pressure_check' || t === 'robot_pressure_equalize' || t === 'robot_pressure_reading')
      acts.push({ id:'scan',          cat:'sense',icon:'🌊', label:'Pressure',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_float_up')
      acts.push({ id:'fly_up',        cat:'move', icon:'🫧', label:'Float Up',     blocklyId:bid, paramValues:{ height:1 } });
    else if (t === 'robot_sample_collect' || t === 'robot_collect_sample')
      acts.push({ id:'grab',          cat:'tools',icon:'🧪', label:'Collect',      blocklyId:bid, paramValues:{} });

    // Security / patrol
    else if (t === 'robot_guard_area' || t === 'robot_guard_object')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'👮', label:'Guard Area',   blocklyId:bid, paramValues:{ laps:99 } });
    else if (t === 'robot_follow_suspect')
      acts.push({ id:'follow_target', cat:'ai',   icon:'👁️', label:'Follow',      blocklyId:bid, paramValues:{ steps:6 } });
    else if (t === 'robot_investigate' || t === 'robot_investigate_sound')
      acts.push({ id:'search_area',   cat:'ai',   icon:'🔍', label:'Investigate',  blocklyId:bid, paramValues:{ radius:2 } });
    else if (t === 'robot_lock_entrance')
      acts.push({ id:'rotate_place',  cat:'tools',icon:'🔒', label:'Lock',         blocklyId:bid, paramValues:{ degrees:90 } });
    else if (t === 'robot_scan_perimeter')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'🔄', label:'Scan Perimeter',blocklyId:bid, paramValues:{ laps:1 } });
    else if (t === 'robot_security_report' || t === 'robot_monitor_camera')
      acts.push({ id:'scan',          cat:'ai',   icon:'📋', label:'Report',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_activate_alarm')
      acts.push({ id:'flash',         cat:'lights',icon:'🚨', label:'Alarm!',      blocklyId:bid, paramValues:{ times:10 } });
    else if (t === 'robot_protect_object')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'🛡️', label:'Protect',     blocklyId:bid, paramValues:{ laps:2 } });
    else if (t === 'robot_secure_zone')
      acts.push({ id:'scan',          cat:'ai',   icon:'🔐', label:'Secure Zone',  blocklyId:bid, paramValues:{} });

    // Factory / industrial
    else if (t === 'robot_stack_objects')
      acts.push({ id:'stack_obj',     cat:'tools',icon:'📚', label:'Stack',        blocklyId:bid, paramValues:{} });
    else if (t === 'robot_product_sort' || t === 'robot_quality_check')
      acts.push({ id:'sort_color',    cat:'tools',icon:'🏭', label:'Sort/Check',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_conveyor_sync')
      acts.push({ id:'follow_line',   cat:'move', icon:'🏭', label:'Conveyor Sync',blocklyId:bid, paramValues:{ steps:5 } });
    else if (t === 'robot_attach_block' || t === 'robot_rotate_block')
      acts.push({ id:'rotate_place',  cat:'tools',icon:'🔩', label:'Attach/Rotate',blocklyId:bid, paramValues:{ degrees:90 } });

    // Jet maneuvers
    else if (t === 'robot_barrel_roll')
      acts.push({ id:'roll_left',     cat:'move', icon:'🔄', label:'Barrel Roll',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_immelmann')
      acts.push({ id:'pitch_up',      cat:'move', icon:'✈️', label:'Immelmann',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_split_s')
      acts.push({ id:'pitch_down',    cat:'move', icon:'✈️', label:'Split-S',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_stall_recovery')
      acts.push({ id:'glide',         cat:'move', icon:'✈️', label:'Stall Recover',blocklyId:bid, paramValues:{ seconds:1 } });
    else if (t === 'robot_air_brake')
      acts.push({ id:'stop',          cat:'move', icon:'✈️', label:'Air Brake',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_boost' || t === 'robot_boost_flight')
      acts.push({ id:'jet_boost',     cat:'move', icon:'⚡', label:'Boost!',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_stabilize_flight' || t === 'robot_hover_stabilize')
      acts.push({ id:'altitude_hold', cat:'move', icon:'✈️', label:'Stabilize',   blocklyId:bid, paramValues:{ seconds:1 } });
    else if (t === 'robot_wind_correction')
      acts.push({ id:'stabilize_legs',cat:'move', icon:'💨', label:'Wind Correct', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_circle_target')
      acts.push({ id:'patrol_area',   cat:'ai',   icon:'🌀', label:'Circle Target',blocklyId:bid, paramValues:{ laps:1 } });
    else if (t === 'robot_follow_beacon' || t === 'robot_autopilot' || t === 'robot_autopilot_wp')
      acts.push({ id:'follow_line',   cat:'ai',   icon:'📡', label:'Follow Beacon',blocklyId:bid, paramValues:{ steps:8 } });
    else if (t === 'robot_aerial_tracking' || t === 'robot_aerial_mapping' || t === 'robot_aerial_scan')
      acts.push({ id:'aerial_scan',   cat:'sense',icon:'🛸', label:'Aerial Scan',  blocklyId:bid, paramValues:{} });
    else if (t === 'robot_hover_scan')
      acts.push({ id:'aerial_scan',   cat:'sense',icon:'📡', label:'Hover Scan',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_gimbal_track')
      acts.push({ id:'see_object',    cat:'sense',icon:'📷', label:'Gimbal Track', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_precision_landing')
      acts.push({ id:'land',          cat:'move', icon:'🎯', label:'Precise Land', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_emergency_land')
      acts.push({ id:'land',          cat:'move', icon:'🆘', label:'Emergency Land',blocklyId:bid, paramValues:{} });

    // Utility getters (return values — just duration blocks in sim)
    else if (t === 'robot_get_speed')
      acts.push({ id:'scan',          cat:'sense',icon:'⚡', label:'Get Speed',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_get_distance_traveled')
      acts.push({ id:'scan',          cat:'sense',icon:'📏', label:'Get Distance', blocklyId:bid, paramValues:{} });
    else if (t === 'robot_get_joint_angle' || t === 'robot_arm_get_position')
      acts.push({ id:'scan',          cat:'sense',icon:'📐', label:'Get Joint',    blocklyId:bid, paramValues:{} });
    else if (t === 'robot_get_nearby_objects')
      acts.push({ id:'see_object',    cat:'sense',icon:'📡', label:'Nearby',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_target_distance' || t === 'robot_target_found')
      acts.push({ id:'see_object',    cat:'sense',icon:'🎯', label:'Target',       blocklyId:bid, paramValues:{} });
    else if (t === 'robot_is_moving')
      acts.push({ id:'scan',          cat:'sense',icon:'📡', label:'Is Moving?',   blocklyId:bid, paramValues:{} });
    else if (t === 'robot_is_target_visible')
      acts.push({ id:'see_object',    cat:'sense',icon:'👁️', label:'Target Visible?',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_arm_is_holding' || t === 'robot_object_picked_up')
      acts.push({ id:'scan',          cat:'tools',icon:'✊', label:'Holding?',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_overheating')
      acts.push({ id:'scan',          cat:'sense',icon:'🌡️', label:'Overheating?',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_humidity')
      acts.push({ id:'scan',          cat:'sense',icon:'💧', label:'Humidity',     blocklyId:bid, paramValues:{} });

    // Arm safe/mode blocks
    else if (t === 'robot_arm_safe_mode' || t === 'robot_arm_precise_mode')
      acts.push({ id:'precision_mode',cat:'tools',icon:'🎯', label:'Arm Mode',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_arm_emergency_stop')
      acts.push({ id:'stop',          cat:'tools',icon:'🆘', label:'Arm Stop',     blocklyId:bid, paramValues:{} });
    else if (t === 'robot_arm_collision_detect')
      acts.push({ id:'obstacle_ahead',cat:'sense',icon:'⚠️', label:'Arm Collision',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_arm_speed_limit')
      acts.push({ id:'set_speed',     cat:'tools',icon:'⚡', label:'Arm Speed',    blocklyId:bid, paramValues:{ speed:'slow' } });
    else if (t === 'robot_arm_smooth_motion')
      acts.push({ id:'precision_mode',cat:'tools',icon:'🎯', label:'Smooth Motion',blocklyId:bid, paramValues:{} });
    else if (t === 'robot_arm_move_relative' || t === 'robot_arm_goto')
      acts.push({ id:'rotate_arm',    cat:'tools',icon:'🦾', label:'Arm Move',     blocklyId:bid, paramValues:{ degrees:+block.getFieldValue('ANGLE')||45 } });
    else if (t === 'robot_arm_grip_pressure')
      acts.push({ id:'gripper_close', cat:'tools',icon:'💪', label:'Grip Pressure',blocklyId:bid, paramValues:{ force:+block.getFieldValue('FORCE')||60 } });

    block = block.getNextBlock();
  }
  return acts;
}

function extractActions(ws) {
  if (!ws) return [];
  const tops = ws.getTopBlocks(true);
  const hat  = tops.find(b => b.type === 'robot_when_start');
  if (hat) return walkBlocks(hat.getNextBlock());
  const all = [];
  tops.forEach(b => { if (b.type !== 'robot_when_start') all.push(...walkBlocks(b)); });
  return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART ARENA PROFILES — driven by ALL_COURSES
// ─────────────────────────────────────────────────────────────────────────────
const PROFILE_DATA = {
  rover:      { tipIcon:'🏎️', tip:'This rover is built for ground challenges!',          recommend:'Perfect for obstacle courses, delivery & speed runs',           arenaType:'ground',     arenaLabel:'STEM Challenge Arena',       recKeys:['rover','race','humanoid'] },
  tank:       { tipIcon:'🚜', tip:'This tank crushes heavy terrain!',                    recommend:'Built for heavy-duty terrain, ramps & cargo pushing',           arenaType:'rough',      arenaLabel:'Heavy Terrain Course',       recKeys:['tank','bulldozer','mining'] },
  drone:      { tipIcon:'🚁', tip:'This drone soars through aerial challenges!',         recommend:'Optimized for ring courses, altitude & sky missions',            arenaType:'sky',        arenaLabel:'Sky City Arena',             recKeys:['drone','hover'] },
  jet:        { tipIcon:'✈️', tip:'This jet is built for high-speed aerial racing!',     recommend:'Perfect for canyon runs, sky loops & stunt shows',              arenaType:'jet',        arenaLabel:'Jet Racing Circuit',         recKeys:['jet'] },
  spider:     { tipIcon:'🕷️', tip:'This spider scales walls and ceilings with ease!',   recommend:'Built for caverns, climbing, ceiling traversal & leaping',      arenaType:'cavern',     arenaLabel:'Crystal Cavern',             recKeys:['spider','humanoid','climbing'] },
  factory:    { tipIcon:'🦾', tip:'This arm robot rules the factory floor!',             recommend:'Perfect for sorting, stacking, assembly & delivery',            arenaType:'factory',    arenaLabel:'Industrial Workstation',     recKeys:['factory','assembly','crane'] },
  hover:      { tipIcon:'🛸', tip:'This hover robot flies above the neon city track!',   recommend:'Built for neon racing, anti-gravity & floating platform arenas', arenaType:'neon_race',  arenaLabel:'Neon Racing Circuit',        recKeys:['hover','race','drone'] },
  underwater: { tipIcon:'🌊', tip:'This sub dives deep into underwater challenges!',     recommend:'Explore coral reefs, caves & deep-sea trenches',                 arenaType:'underwater', arenaLabel:'Ocean Exploration Zone',     recKeys:['underwater','submarine'] },
  humanoid:   { tipIcon:'🧍', tip:'This humanoid explores temples and warehouses!',      recommend:'Built for temples, warehouses & urban navigation challenges',    arenaType:'temple',     arenaLabel:'Ancient Temple Challenge',   recKeys:['humanoid','race'] },
  security:   { tipIcon:'👮', tip:'This security bot patrols and protects the zone!',  recommend:'Built for perimeter patrol, intruder detection & area lockdown', arenaType:'ground',     arenaLabel:'Security Patrol Zone',       recKeys:['security','rover'] },
  medbot:     { tipIcon:'🏥', tip:'This medbot assists and heals on the field!',        recommend:'Built for obstacle navigation, delivery & triage missions',       arenaType:'ground',     arenaLabel:'STEM Challenge Arena',       recKeys:['rover','race'] },
  firebot:    { tipIcon:'🔥', tip:'This fire truck robot battles blazes!',              recommend:'Built for heavy terrain, timed challenges & rescue missions',     arenaType:'rough',      arenaLabel:'Heavy Terrain Course',       recKeys:['tank','rover'] },
  racedrone:  { tipIcon:'🏁', tip:'This racing drone blazes through aerial circuits!',  recommend:'Optimized for neon racing, tight ring courses & speed runs',      arenaType:'neon_race',  arenaLabel:'Neon Racing Circuit',        recKeys:['drone','hover','race'] },
  factorybot: { tipIcon:'🏭', tip:'This factory bot lifts and sorts on the floor!',     recommend:'Perfect for sorting, stacking, assembly & precision delivery',    arenaType:'factory',    arenaLabel:'Industrial Workstation',     recKeys:['factory','assembly'] },
};

function getSmartProfile(rc) {
  const type = detectRobotType(rc);
  const pd   = PROFILE_DATA[type] || PROFILE_DATA.rover;
  // Sort by specificity: courses exclusive to this type rank first
  const recCourses = ALL_COURSES
    .filter(c => c.rec.some(r => pd.recKeys.includes(r)))
    .slice()
    .sort((a,b) => {
      const aS = a.rec.filter(r=>pd.recKeys.includes(r)).length / a.rec.length;
      const bS = b.rec.filter(r=>pd.recKeys.includes(r)).length / b.rec.length;
      return bS - aS; // most exclusive to this type first
    });
  const challenges = (recCourses.length >= 4 ? recCourses.slice(0,4) : ALL_COURSES.slice(0,4))
    .map(c => ({ id:c.id, name:c.name, icon:c.icon, desc:c.desc, color:c.color, obstacles:c.obstacles, totalDist:c.totalDist }));
  return { ...pd, challenges };
}

// ─────────────────────────────────────────────────────────────────────────────
// ARENA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function _groundArena(scene,ch){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0xe8f0fe);
  scene.fog=new THREE.Fog(0xe8f0fe,32,58);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,65),new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.3,metalness:0.15}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const lm=new THREE.LineBasicMaterial({color:0xdde4ff});
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

function _skyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x87ceeb);
  scene.fog=new THREE.Fog(0xb0d8f8,28,60);
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

function _terrainArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x2d5a27);
  scene.fog=new THREE.Fog(0x2d5a27,30,56);
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

function _hoverArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x0a0a2e);
  scene.fog=new THREE.Fog(0x0a0a2e,28,55);
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

function _roughArena(scene,ch){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x3d2b1f);
  scene.fog=new THREE.Fog(0x3d2b1f,30,56);
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

function _factoryArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x1a1a2e);
  scene.fog=new THREE.Fog(0x1a1a2e,25,50);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,40),new THREE.MeshStandardMaterial({color:0x374151,roughness:0.6,metalness:0.4}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const boxC=[0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xec4899];
  [[-8,-6],[-4,-6],[0,-6],[4,-6],[8,-6],[-6,-3],[-2,-3],[2,-3],[6,-3]].forEach(([bx,bz],i)=>{
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),new THREE.MeshStandardMaterial({color:boxC[i%boxC.length],roughness:0.4,metalness:0.2}));
    box.position.set(bx,0.3,bz); box.castShadow=true; g.add(box);
  });
  const beltMat=new THREE.MeshStandardMaterial({color:0x1f2937,roughness:0.5,metalness:0.6});
  [-8,-4,0,4,8].forEach(x=>{
    const belt=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.15,12),beltMat); belt.position.set(x,0.08,-2); g.add(belt);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.03,0.35),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.6}));
    stripe.position.set(x,0.17,-2); stripe.name='beltstripe'; g.add(stripe);
  });
  [-7,-14].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.1,8,32),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _jetArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x9ad4ef, 30, 70);

  // Canyon walls
  const wallMat = new THREE.MeshStandardMaterial({color:0x8b6914,roughness:0.9,metalness:0.1});
  [[-14,8,0,-32],[-14,8,0,22],[14,8,0,-32],[14,8,0,22]].forEach(([wx,wh,wz1,wz2])=>{
    const len=Math.abs(wz2-wz1);
    const wall=new THREE.Mesh(new THREE.BoxGeometry(3,wh,len),wallMat);
    wall.position.set(wx,wh/2,(wz1+wz2)/2); wall.receiveShadow=true; g.add(wall);
  });
  // Canyon floor (deep below)
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(32,65),new THREE.MeshStandardMaterial({color:0x6b5a2e,roughness:0.95}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-4; floor.receiveShadow=true; g.add(floor);

  // Launch platform
  const launch=new THREE.Mesh(new THREE.BoxGeometry(6,0.4,6),new THREE.MeshStandardMaterial({color:0x374151,metalness:0.7,roughness:0.3}));
  launch.position.set(0,0.2,6); g.add(launch);

  // Speed loop gates (tilted torus)
  const loopColors=[0xfbbf24,0xef4444,0x3b82f6,0x22c55e,0x8b5cf6];
  [[0,3,-5],[0,4,-12],[0,5,-19],[0,4,-26],[0,3,-33]].forEach(([rx,ry,rz],i)=>{
    const loop=new THREE.Mesh(
      new THREE.TorusGeometry(3.5,0.2,8,32),
      new THREE.MeshStandardMaterial({color:loopColors[i],emissive:loopColors[i],emissiveIntensity:1.1,transparent:true,opacity:0.9})
    );
    loop.position.set(rx,ry,rz); loop.name='cp'; g.add(loop);
    // Gate posts
    [-3.5,3.5].forEach(side=>{
      const post=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,ry*2,8),
        new THREE.MeshStandardMaterial({color:loopColors[i],emissive:loopColors[i],emissiveIntensity:0.5}));
      post.position.set(rx+side,ry/2,rz); g.add(post);
    });
  });
  // Speed boost arrows on ground
  [[-7],[-14],[-21],[-28]].forEach(([z])=>{
    const arrow=new THREE.Mesh(new THREE.PlaneGeometry(1.5,3),
      new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.8,transparent:true,opacity:0.6}));
    arrow.rotation.x=-Math.PI/2; arrow.position.set(0,-3.8,z); g.add(arrow);
  });
  scene.add(g);
}

function _spaceArena(scene) {
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x01020f);
  scene.fog=new THREE.Fog(0x01020f,42,78);
  // Stars
  const sp=[]; for(let i=0;i<900;i++){sp.push((Math.random()-.5)*130,(Math.random()-.5)*60+30,(Math.random()-.5)*130);}
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.18,sizeAttenuation:true})));
  // Moon surface
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(52,72),new THREE.MeshStandardMaterial({color:0x9ca3af,roughness:0.96,metalness:0.05}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Craters
  const cMat=new THREE.MeshStandardMaterial({color:0x78716c,roughness:0.98});
  [[-3,-6],[2,-12],[-5,-18],[4,-24],[-1,-28],[3,-8],[-4,-15]].forEach(([cx,cz])=>{
    const r=0.9+Math.random()*0.8;
    const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.1,0.28,16),cMat);
    c.position.set(cx,-0.05,cz); g.add(c);
  });
  // Rocks
  const rMat=new THREE.MeshStandardMaterial({color:0x8b8680,roughness:0.92});
  [[-4,-4],[3,-8],[-2,-14],[5,-20],[-3,-26],[2,-30]].forEach(([rx,rz])=>{
    const h=0.3+Math.random()*0.7;
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(h,0),rMat);
    rock.position.set(rx,h*0.4,rz); rock.castShadow=true; g.add(rock);
  });
  // Checkpoint rings (futuristic neon)
  [[0,0.5,-8],[0,0.5,-18],[0,0.5,-28]].forEach(([rx,ry,rz],i)=>{
    const cols=[0x00d9ff,0x7c3aed,0xec4899];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.12,8,32),new THREE.MeshStandardMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:1.3,transparent:true,opacity:0.88}));
    ring.rotation.x=Math.PI/2; ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
  });
  // Landing pad
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.2,16),new THREE.MeshStandardMaterial({color:0x374151,metalness:0.85,roughness:0.15}));
  pad.position.set(0,0.1,6); g.add(pad);
  // Planet in background
  const planet=new THREE.Mesh(new THREE.SphereGeometry(8,16,16),new THREE.MeshStandardMaterial({color:0xef4444,emissive:0x7c0000,emissiveIntensity:0.3,roughness:0.8}));
  planet.position.set(30,20,-60); g.add(planet);
  scene.add(g);
}

function _underwaterArena(scene) {
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x003d5c);
  scene.fog=new THREE.Fog(0x003d5c,18,48);
  // Ocean floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(42,68),new THREE.MeshStandardMaterial({color:0xb8985a,roughness:0.96}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-0.1; floor.receiveShadow=true; g.add(floor);
  // Coral
  const coralC=[0xff6b6b,0xff8e53,0xffd93d,0x6bcb77,0x4d96ff];
  [[-5,-4],[3,-8],[-3,-12],[5,-16],[-4,-20],[2,-24],[4,-28],[-6,-10]].forEach(([cx,cz],i)=>{
    const h=0.9+Math.random()*1.4;
    const coral=new THREE.Mesh(new THREE.ConeGeometry(0.35+Math.random()*0.25,h,6),
      new THREE.MeshStandardMaterial({color:coralC[i%coralC.length],roughness:0.55,emissive:coralC[i%coralC.length],emissiveIntensity:0.18}));
    coral.position.set(cx,h/2,cz); coral.castShadow=true; g.add(coral);
  });
  // Seabed rocks
  const sRock=new THREE.MeshStandardMaterial({color:0x4a7c6f,roughness:0.92});
  [[-7,-6],[4,-10],[-2,-16],[6,-22],[-5,-26]].forEach(([rx,rz])=>{
    const r=0.5+Math.random()*0.9;
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),sRock);
    rock.position.set(rx,r*0.5,rz); g.add(rock);
  });
  // Checkpoint arches
  [[-7,-9],[0,-19],[7,-29]].forEach(([cpx,cpz],i)=>{
    const cpC=[0x00ffcc,0x0099ff,0xcc00ff];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.14,8,32),
      new THREE.MeshStandardMaterial({color:cpC[i],emissive:cpC[i],emissiveIntensity:1.25,transparent:true,opacity:0.9}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.5,cpz); ring.name='cp'; g.add(ring);
  });
  // Fish (animated movers)
  coralC.forEach((col,i)=>{
    const fish=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.18,0.28),new THREE.MeshStandardMaterial({color:col}));
    fish.position.set(-3+i*1.5,1.5+i*0.4,-5-i*4); fish.name=`mover${i}`; g.add(fish);
  });
  scene.add(g);
}

function _legoArena(scene) {
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x87ceeb);
  scene.fog=new THREE.Fog(0xb0d8f8,26,56);
  const legoC=[0xef4444,0x3b82f6,0xfbbf24,0x22c55e,0xec4899,0xa855f7,0xf97316];
  // Checkerboard LEGO baseplate
  for(let tx=-9;tx<=9;tx+=2) for(let tz=-20;tz<=5;tz+=2){
    const col=((tx+tz)%4===0)?0x2d862d:0x228b22;
    const tile=new THREE.Mesh(new THREE.BoxGeometry(2,0.15,2),new THREE.MeshStandardMaterial({color:col,roughness:0.38}));
    tile.position.set(tx,0.075,tz); tile.receiveShadow=true; g.add(tile);
  }
  // LEGO stud bumps
  const sM=new THREE.MeshStandardMaterial({color:0x1a7a1a,roughness:0.28});
  for(let sx=-7;sx<=7;sx+=2) for(let sz=-16;sz<=3;sz+=2){
    const stud=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.12,8),sM);
    stud.position.set(sx,0.21,sz); g.add(stud);
  }
  // Big colourful LEGO blocks as obstacles
  [[-3,-4,2,0.5],[2,-7,2,1],[-4,-10,2.5,1.5],[3,-14,2,1],[-2,-17,2,0.5],[0,-20,3,1.2]].forEach(([bx,bz,bw,bh],i)=>{
    const col=legoC[i%legoC.length];
    const block=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bw),new THREE.MeshStandardMaterial({color:col,roughness:0.28,metalness:0.08}));
    block.position.set(bx,bh/2+0.15,bz); block.castShadow=true; g.add(block);
    const sC=new THREE.MeshStandardMaterial({color:col,roughness:0.22});
    for(let sx2=0;sx2<Math.round(bw);sx2++) for(let sz2=0;sz2<Math.round(bw);sz2++){
      const stud=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.1,8),sC);
      stud.position.set(bx+(sx2-(bw-1)/2)*0.5,bh+0.2,bz+(sz2-(bw-1)/2)*0.5); g.add(stud);
    }
  });
  // Checkpoint rings (LEGO colours)
  [[-7,-6],[0,-13],[7,-20]].forEach(([cpx,cpz],i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.15,8,32),
      new THREE.MeshStandardMaterial({color:legoC[i],emissive:legoC[i],emissiveIntensity:0.95}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.5,cpz); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _cavernArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0a0510);
  scene.fog = new THREE.Fog(0x0a0510, 14, 42);
  // Rock floor
  const floorMat = new THREE.MeshStandardMaterial({color:0x1a1025,roughness:0.98,metalness:0.05});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 65), floorMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; g.add(floor);
  // Crystalline stalactites (hanging from ceiling)
  const crystalColors = [0x9b59b6, 0x8b5cf6, 0x7c3aed, 0x6d28d9, 0xa78bfa, 0xddd6fe];
  const crysMat = (col) => new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.55,transparent:true,opacity:0.88,roughness:0.2,metalness:0.6});
  // Stalagmites (floor)
  [[-4,0,-3],[3,0,-6],[-2,0,-9],[5,0,-12],[-5,0,-15],[2,0,-18],[-3,0,-21],[4,0,-24],[-1,0,-8],[-6,0,-5],[6,0,-18]].forEach(([sx,sy,sz],i)=>{
    const h = 1.2 + (i%3)*0.9; const col = crystalColors[i%crystalColors.length];
    const crys = new THREE.Mesh(new THREE.ConeGeometry(0.28+i%2*0.12,h,5), crysMat(col));
    crys.position.set(sx,h/2,sz); crys.castShadow=true; g.add(crys);
  });
  // Stalactites (ceiling — inverted, y=12)
  [[-3,12,-5],[4,11,-10],[-5,12.5,-16],[2,11.5,-22],[-2,12,-27],[5,11,-13],[0,12,-7]].forEach(([sx,sy,sz],i)=>{
    const h = 1.0 + (i%3)*0.7; const col = crystalColors[(i+2)%crystalColors.length];
    const crys = new THREE.Mesh(new THREE.ConeGeometry(0.22,h,5), crysMat(col));
    crys.position.set(sx,sy,sz); crys.rotation.z = Math.PI; g.add(crys);
  });
  // Cave walls — dark stone columns
  const wallMat = new THREE.MeshStandardMaterial({color:0x1e1529,roughness:0.96});
  [[-12,6,0],[-12,6,-16],[12,6,0],[12,6,-16]].forEach(([wx,wh,wz])=>{
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.5,3,wh*2,8),wallMat);
    wall.position.set(wx,wh,wz); g.add(wall);
  });
  // Bioluminescent patches
  const glowMat = new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:1.6,transparent:true,opacity:0.6});
  [[-5,0.01,-5],[3,0.01,-11],[-3,0.01,-19],[5,0.01,-26]].forEach(([px,py,pz])=>{
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.6+Math.random()*0.4,12),glowMat);
    patch.rotation.x = -Math.PI/2; patch.position.set(px,py,pz); g.add(patch);
  });
  // Vertical wall climbing surface (one side)
  const climbMat = new THREE.MeshStandardMaterial({color:0x2d1d4a,roughness:0.9,metalness:0.1});
  const climbWall = new THREE.Mesh(new THREE.BoxGeometry(0.4,10,28),climbMat);
  climbWall.position.set(-9,5,-13); g.add(climbWall);
  // Crystal accent strips on climb wall
  [0,-8,-16,-24].forEach((z,i)=>{
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.12,1.8),
      new THREE.MeshStandardMaterial({color:crystalColors[i%crystalColors.length],emissive:crystalColors[i%crystalColors.length],emissiveIntensity:1.2}));
    strip.position.set(-9,2+i*1.5,z); g.add(strip);
  });
  // Checkpoint arches
  [[-6,-10],[0,-20],[6,-30]].forEach(([cpx,cpz],i)=>{
    const col = [0xa78bfa,0x8b5cf6,0x7c3aed][i];
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6,0.14,8,32),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.5,transparent:true,opacity:0.9}));
    ring.rotation.x = Math.PI/2; ring.position.set(cpx,0.6,cpz); ring.name='cp'; g.add(ring);
  });
  // Point lights for atmosphere
  const pl1=new THREE.PointLight(0x8b5cf6,1.2,18); pl1.position.set(-3,2,-12); g.add(pl1);
  const pl2=new THREE.PointLight(0x7c3aed,0.8,14); pl2.position.set(4,2,-22); g.add(pl2);
  scene.add(g);
}

function _neonRaceArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x05030f);
  scene.fog = new THREE.Fog(0x05030f, 22, 60);
  // Neon track surface
  const trackMat = new THREE.MeshStandardMaterial({color:0x0d0d1a,roughness:0.35,metalness:0.7});
  const track = new THREE.Mesh(new THREE.PlaneGeometry(12, 65), trackMat);
  track.rotation.x = -Math.PI/2; track.receiveShadow = true; g.add(track);
  // Track edges — glowing neon strips
  const neonPink = new THREE.MeshStandardMaterial({color:0xff0080,emissive:0xff0080,emissiveIntensity:1.8});
  const neonBlue = new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:1.8});
  [[-5.8,-30],[5.8,-30]].forEach(([ex,ez],i)=>{
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,65), i===0?neonPink:neonBlue);
    edge.position.set(ex,0.04,ez); g.add(edge);
  });
  // Lane divider dashes
  for(let z = 2; z >= -60; z -= 4){
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.02,1.5),
      new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.4,transparent:true,opacity:0.5}));
    dash.position.set(0,0.02,z); g.add(dash);
  }
  // Banking curves (raised side pads)
  const bankMat = new THREE.MeshStandardMaterial({color:0x12102b,roughness:0.45,metalness:0.5});
  [[-10,-20],[10,-20],[-10,-40],[10,-40]].forEach(([bx,bz])=>{
    const bank = new THREE.Mesh(new THREE.BoxGeometry(4,0.6,15),bankMat);
    bank.position.set(bx,0.3,bz); g.add(bank);
    // Neon rim on bank
    const rim = new THREE.Mesh(new THREE.BoxGeometry(4.1,0.05,15.1),
      new THREE.MeshStandardMaterial({color:0xff0080,emissive:0xff0080,emissiveIntensity:1.2}));
    rim.position.set(bx,0.62,bz); g.add(rim);
  });
  // Checkpoint gates (glowing arches)
  const gateColors = [0x00d4ff,0xff0080,0x00ff88,0xffd700,0xff6b35];
  [[-15],[-25],[-35],[-45],[-55]].forEach(([gz],i)=>{
    const col = gateColors[i%gateColors.length];
    const gateMat = new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.6,transparent:true,opacity:0.92});
    const arch = new THREE.Mesh(new THREE.TorusGeometry(4,0.2,8,32),gateMat);
    arch.position.set(0,4,gz); arch.name='cp'; g.add(arch);
    [-4,4].forEach(gx=>{
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,8,8),
        new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.9}));
      post.position.set(gx,4,gz); g.add(post);
    });
  });
  // Neon city skyline silhouette in background
  const skyMat = new THREE.MeshStandardMaterial({color:0x0a0820,emissive:0x0d0d30,emissiveIntensity:0.3});
  [[-20,8,-55],[20,12,-55],[-14,5,-55],[14,6,-55],[-8,14,-55],[8,10,-55]].forEach(([bx,bh,bz])=>{
    const bld = new THREE.Mesh(new THREE.BoxGeometry(3.5,bh,0.8),skyMat);
    bld.position.set(bx,bh/2,bz); g.add(bld);
    // Window lights
    const winMat = new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:2.0,transparent:true,opacity:0.7});
    for(let wy=1;wy<bh-1;wy+=2){
      const win=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.35,0.1),winMat);
      win.position.set(bx+(Math.random()-0.5)*2,wy,-54.6); g.add(win);
    }
  });
  // Start/finish line
  const startLine = new THREE.Mesh(new THREE.PlaneGeometry(12,1.2),
    new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff88,emissiveIntensity:0.8}));
  startLine.rotation.x = -Math.PI/2; startLine.position.set(0,0.03,5); g.add(startLine);
  scene.add(g);
}

function _jungleArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0d2b0a);
  scene.fog = new THREE.Fog(0x1a4a12, 18, 48);
  // Muddy ground
  const groundMat = new THREE.MeshStandardMaterial({color:0x3d2b1a,roughness:0.98,metalness:0.02});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 65), groundMat);
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; g.add(ground);
  // Mud puddles
  const mudMat = new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:0.96,transparent:true,opacity:0.85});
  [[-3,-4],[4,-9],[-5,-14],[2,-20],[-3,-26]].forEach(([mx,mz])=>{
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.8+Math.random()*0.5,10),mudMat);
    puddle.rotation.x = -Math.PI/2; puddle.position.set(mx,0.01,mz); g.add(puddle);
  });
  // Trees — trunk + canopy
  const trunkMat = new THREE.MeshStandardMaterial({color:0x3d2610,roughness:0.95});
  const leafColors = [0x1a5c18, 0x22681a, 0x2d7a20, 0x16a34a, 0x15803d];
  [[-7,-5],[7,-8],[-9,-14],[8,-18],[-6,-22],[9,-26],[-8,-10],[6,-30],[-10,-32]].forEach(([tx,tz],i)=>{
    const tH = 4 + (i%3)*2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.32,tH,7),trunkMat);
    trunk.position.set(tx,tH/2,tz); trunk.castShadow=true; g.add(trunk);
    // Canopy spheres
    [[0,tH+0.5,0],[0.6,tH-0.3,0.4],[-0.5,tH-0.2,-0.3]].forEach(([lx,ly,lz],ci)=>{
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.2+(ci*0.3),7,5),
        new THREE.MeshStandardMaterial({color:leafColors[(i+ci)%leafColors.length],roughness:0.9}));
      leaf.position.set(tx+lx,ly,tz+lz); g.add(leaf);
    });
  });
  // Roots and rocks
  const rockMat = new THREE.MeshStandardMaterial({color:0x5a4a38,roughness:0.92});
  [[-3,-6],[4,-11],[-4,-17],[3,-23],[-2,-29]].forEach(([rx,rz],i)=>{
    const r = 0.4+i%2*0.3;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),rockMat);
    rock.position.set(rx,r*0.4,rz); rock.castShadow=true; g.add(rock);
  });
  // Water crossing rivers
  const riverMat = new THREE.MeshStandardMaterial({color:0x1a5c7a,roughness:0.1,transparent:true,opacity:0.82});
  [[-12],[-25]].forEach(([rz])=>{
    const river = new THREE.Mesh(new THREE.PlaneGeometry(28,3.5),riverMat);
    river.rotation.x = -Math.PI/2; river.position.set(0,0.02,rz); g.add(river);
  });
  // Stone bridges over rivers
  const bridgeMat = new THREE.MeshStandardMaterial({color:0x6b5a45,roughness:0.88});
  [[-12],[-25]].forEach(([bz])=>{
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.5,0.25,3.8),bridgeMat);
    bridge.position.set(0,0.12,bz); g.add(bridge);
  });
  // Vines
  const vineMat = new THREE.MeshStandardMaterial({color:0x2d5a20,roughness:0.95});
  [[-5,6,-8],[4,7,-16],[-3,5,-24]].forEach(([vx,vy,vz])=>{
    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,vy,5),vineMat);
    vine.position.set(vx,vy/2,vz); g.add(vine);
  });
  // Checkpoint rings — ancient stone style
  [[-7,-10],[0,-22],[7,-33]].forEach(([cpx,cpz],i)=>{
    const cols=[0x22c55e,0x16a34a,0x15803d];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.2,8,32),
      new THREE.MeshStandardMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:0.8,transparent:true,opacity:0.88}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.5,cpz); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _zeroGArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x01020a);
  scene.fog = new THREE.Fog(0x01020a, 35, 75);
  // Stars
  const sp=[]; for(let i=0;i<1200;i++){sp.push((Math.random()-.5)*160,(Math.random()-.5)*80+20,(Math.random()-.5)*160);}
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.15,sizeAttenuation:true})));
  // Space station floor (transparent grid)
  const gridMat=new THREE.LineBasicMaterial({color:0x1e3a5f,transparent:true,opacity:0.35});
  for(let i=-16;i<=16;i+=2.5){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-16,0,i),new THREE.Vector3(16,0,i)]),gridMat));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0,-36),new THREE.Vector3(i,0,8)]),gridMat));
  }
  // Station modules (metal cylinders/boxes)
  const metalMat = new THREE.MeshStandardMaterial({color:0x2a3545,roughness:0.3,metalness:0.85});
  const accentMat= new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:0.6});
  [[-10,0,-8],[10,0,-8],[-10,0,-24],[10,0,-24]].forEach(([mx,my,mz])=>{
    const mod = new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,6,12),metalMat);
    mod.position.set(mx,my,mz); mod.castShadow=true; g.add(mod);
    // Porthole
    const port = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.15,12),accentMat);
    port.rotation.z=Math.PI/2; port.position.set(mx>0?mx-2.2:mx+2.2,my,mz); g.add(port);
  });
  // Solar panels
  const panelMat = new THREE.MeshStandardMaterial({color:0x1a3a6a,roughness:0.2,metalness:0.8,emissive:0x0d1f3c,emissiveIntensity:0.2});
  [[-16,4,-14],[16,4,-14]].forEach(([px,py,pz])=>{
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.15,8,3.5),panelMat);
    panel.position.set(px,py,pz); g.add(panel);
  });
  // Floating debris
  const debrisMat = new THREE.MeshStandardMaterial({color:0x3a4a5a,roughness:0.7,metalness:0.4});
  [[-3,2,-5],[4,3,-10],[-5,1.5,-18],[2,4,-28],[-4,3,-22]].forEach(([dx,dy,dz],i)=>{
    const deb = new THREE.Mesh(
      i%2===0?new THREE.BoxGeometry(0.4,0.4,0.4):new THREE.DodecahedronGeometry(0.3,0),
      debrisMat);
    deb.position.set(dx,dy,dz); deb.name=`mover${i}`; g.add(deb);
  });
  // Anti-gravity lanes (glowing strips)
  const agMat = new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:0.5,transparent:true,opacity:0.25});
  [0,-14,-28].forEach(z=>{
    const lane = new THREE.Mesh(new THREE.BoxGeometry(6,0.05,8),agMat);
    lane.position.set(0,0.02,z); g.add(lane);
  });
  // Launch dock
  const dock = new THREE.Mesh(new THREE.BoxGeometry(5,0.25,5),metalMat);
  dock.position.set(0,0,5); g.add(dock);
  // Checkpoint rings
  [[0,1.5,-8],[0,3,-18],[0,1,-30]].forEach(([rx,ry,rz],i)=>{
    const cols=[0x00d4ff,0x7c3aed,0x38bdf8];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3,0.15,8,32),
      new THREE.MeshStandardMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:1.4,transparent:true,opacity:0.9}));
    ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
  });
  // Earth in background
  const earth=new THREE.Mesh(new THREE.SphereGeometry(12,16,16),
    new THREE.MeshStandardMaterial({color:0x2a6fda,emissive:0x1a4fa0,emissiveIntensity:0.25,roughness:0.7}));
  earth.position.set(-35,15,-70); g.add(earth);
  scene.add(g);
}

function _warehouseArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a1a1a);
  scene.fog = new THREE.Fog(0x1a1a1a, 22, 52);
  // Concrete floor
  const floorMat = new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:0.8,metalness:0.15});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(32, 65), floorMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; g.add(floor);
  // Floor markings
  const markMat = new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.4,transparent:true,opacity:0.8});
  for(let z=2;z>=-55;z-=8){
    [-4,4].forEach(x=>{
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.15,7.5),markMat);
      mark.rotation.x=-Math.PI/2; mark.position.set(x,0.01,z); g.add(mark);
    });
  }
  // Shelving units
  const shelfMat = new THREE.MeshStandardMaterial({color:0x3a3a40,roughness:0.7,metalness:0.5});
  [[-10,0,-8],[-10,0,-20],[-10,0,-32],[10,0,-8],[10,0,-20],[10,0,-32]].forEach(([sx,sy,sz])=>{
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.15,6,8),shelfMat);
    frame.position.set(sx,3,sz); g.add(frame);
    [1,2.5,4].forEach(sh=>{
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5,0.12,8),shelfMat);
      shelf.position.set(sx+(sx<0?0.8:-0.8),sh,sz); g.add(shelf);
    });
  });
  // Cargo boxes (colourful)
  const boxColors = [0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xec4899,0xa855f7,0xf97316];
  [[-4,-5,0.3],[4,-5,0.3],[-4,-10,0.3],[4,-10,0.3],[0,-7,0.3],
   [-4,-15,0.3],[4,-15,0.3],[0,-20,0.3],[-4,-25,0.3],[4,-25,0.3]].forEach(([bx,bz,bh],i)=>{
    const sz2 = 0.5+i%3*0.2; const col = boxColors[i%boxColors.length];
    const box = new THREE.Mesh(new THREE.BoxGeometry(sz2,sz2,sz2),
      new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.1}));
    box.position.set(bx,bh,bz); box.castShadow=true; g.add(box);
    // Barcode stripe
    const bar = new THREE.Mesh(new THREE.BoxGeometry(sz2,0.05,0.3),
      new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.3}));
    bar.position.set(bx,bh+sz2/2+0.01,bz+sz2/2+0.01); g.add(bar);
  });
  // Conveyor belt tracks
  const beltMat = new THREE.MeshStandardMaterial({color:0x1f2937,roughness:0.5,metalness:0.6});
  const beltStripe = new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.5});
  [[-4,4]].forEach(([bx,_])=>{
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.8,0.18,30),beltMat);
    belt.position.set(bx,0.09,-14); g.add(belt);
    for(let z=-28;z<=0;z+=2){
      const str = new THREE.Mesh(new THREE.BoxGeometry(1.7,0.04,0.4),beltStripe);
      str.position.set(bx,0.19,z); str.name='beltstripe'; g.add(str);
    }
  });
  // Forklift path arrows
  const arrowMat = new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:0.6,transparent:true,opacity:0.7});
  [-6,-14,-22,-30].forEach(z=>{
    const arr = new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.5),arrowMat);
    arr.rotation.x=-Math.PI/2; arr.position.set(0,0.01,z); g.add(arr);
  });
  // Checkpoint rings
  [[-5,-10],[0,-22],[5,-34]].forEach(([cpx,cpz],i)=>{
    const col=[0xfbbf24,0xf97316,0xd97706][i];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.13,8,32),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.0}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.5,cpz); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _templeArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a1208);
  scene.fog = new THREE.Fog(0x1a1208, 20, 50);
  // Stone floor
  const stoneMat = new THREE.MeshStandardMaterial({color:0x5a4e35,roughness:0.94,metalness:0.05});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 65), stoneMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Stone tile grid pattern
  const tileMat = new THREE.LineBasicMaterial({color:0x3a3228,transparent:true,opacity:0.6});
  for(let x=-12;x<=12;x+=2.5){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0.01,-32),new THREE.Vector3(x,0.01,8)]),tileMat));
  }
  for(let z=-30;z<=6;z+=2.5){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12,0.01,z),new THREE.Vector3(12,0.01,z)]),tileMat));
  }
  // Temple columns
  const colMat = new THREE.MeshStandardMaterial({color:0x7a6a4e,roughness:0.88});
  [[-7,0,-5],[7,0,-5],[-7,0,-15],[7,0,-15],[-7,0,-25],[7,0,-25]].forEach(([cx,cy,cz])=>{
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.65,8,8),colMat);
    col2.position.set(cx,4,cz); col2.castShadow=true; g.add(col2);
    // Capital
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5,0.4,1.5),colMat);
    cap.position.set(cx,8.2,cz); g.add(cap);
  });
  // Pressure plates (ancient mechanisms)
  const plateMat = new THREE.MeshStandardMaterial({color:0x8b7355,roughness:0.7,metalness:0.3});
  const activeMat= new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.9});
  [[-2,-5],[2,-8],[-3,-11],[1,-14],[-2,-17],[3,-20],[-1,-23]].forEach(([px,pz],i)=>{
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.6,0.08,1.6), i===0?activeMat:plateMat);
    plate.position.set(px,0.04,pz); g.add(plate);
    // Hieroglyph mark
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.02,0.6),
      new THREE.MeshStandardMaterial({color:0xdaa520,emissive:0xdaa520,emissiveIntensity:0.4}));
    mark.position.set(px,0.09,pz); g.add(mark);
  });
  // Torches
  const torchMat = new THREE.MeshStandardMaterial({color:0x6b4226,roughness:0.9});
  const flameMat = new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff4500,emissiveIntensity:2.5,transparent:true,opacity:0.9});
  [[-6,5,-6],[6,5,-6],[-6,5,-16],[6,5,-16],[-6,5,-26],[6,5,-26]].forEach(([tx,ty,tz])=>{
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,0.9,6),torchMat);
    torch.position.set(tx,ty,tz); g.add(torch);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.5,8),flameMat);
    flame.position.set(tx,ty+0.7,tz); g.add(flame);
    const light = new THREE.PointLight(0xff6b35,0.8,6);
    light.position.set(tx,ty+0.8,tz); g.add(light);
  });
  // Rolling boulder trap zone
  const boulderMat = new THREE.MeshStandardMaterial({color:0x6b5a45,roughness:0.95});
  [-4,-13,-22].forEach((bz,i)=>{
    const boulder = new THREE.Mesh(new THREE.SphereGeometry(0.7,8,6),boulderMat);
    boulder.position.set(-5+i*2,0.7,bz); boulder.name=`mover${i}`; boulder.castShadow=true; g.add(boulder);
  });
  // Temple arch exit
  const archMat = new THREE.MeshStandardMaterial({color:0x8b7355,roughness:0.85});
  const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8,7,0.8),archMat); archLeft.position.set(-3,3.5,-30); g.add(archLeft);
  const archRight= new THREE.Mesh(new THREE.BoxGeometry(0.8,7,0.8),archMat); archRight.position.set(3,3.5,-30); g.add(archRight);
  const archTop  = new THREE.Mesh(new THREE.BoxGeometry(7,0.8,0.8),archMat); archTop.position.set(0,7,-30); g.add(archTop);
  // Checkpoint rings — golden
  [[-5,-8],[0,-18],[5,-28]].forEach(([cpx,cpz],i)=>{
    const col=[0xffd700,0xf59e0b,0xd97706][i];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.18,8,32),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.1,transparent:true,opacity:0.92}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.6,cpz); ring.name='cp'; g.add(ring);
  });
  scene.add(g);
}

function _combatArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0a0505);
  scene.fog = new THREE.Fog(0x0a0505, 20, 55);
  // Battle floor — dark metal plates
  const floorMat = new THREE.MeshStandardMaterial({color:0x1a0f0f,roughness:0.65,metalness:0.5});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 65), floorMat);
  floor.rotation.x = -Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Metal plate grid
  const plateMat = new THREE.MeshStandardMaterial({color:0x221010,roughness:0.55,metalness:0.6});
  for(let x=-8;x<=8;x+=4) for(let z=-28;z<=6;z+=4){
    const plate = new THREE.Mesh(new THREE.BoxGeometry(3.8,0.06,3.8),plateMat);
    plate.position.set(x,0.03,z); g.add(plate);
  }
  // Glowing red border strips
  const borderMat = new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:1.5});
  [[-17,-30],[17,-30],[-17,7],[17,7]].forEach(([bx,bz])=>{
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.06,37),borderMat);
    strip.position.set(bx>0?17:-17,0.04,(bz+7)/2-12);
    const strip2 = new THREE.Mesh(new THREE.BoxGeometry(36,0.06,0.2),borderMat);
    strip2.position.set(0,0.04,bz); g.add(strip2);
    g.add(strip);
  });
  // Battle arena walls — crumbling concrete blocks
  const wallMat = new THREE.MeshStandardMaterial({color:0x3a1a1a,roughness:0.92,metalness:0.1});
  [[-13,2,-6],[-13,2,-15],[-13,2,-24],[13,2,-6],[13,2,-15],[13,2,-24]].forEach(([wx,wh,wz])=>{
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2,wh*2,3),wallMat);
    wall.position.set(wx,wh,wz); wall.castShadow=true; g.add(wall);
    // Cracks / damage marks
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.06,wh*1.8,0.06),
      new THREE.MeshStandardMaterial({color:0x666666,roughness:1}));
    crack.position.set(wx+0.5,wh,wz); g.add(crack);
  });
  // Explosion craters
  const craterMat = new THREE.MeshStandardMaterial({color:0x0f0505,roughness:0.99,metalness:0});
  [[-4,-5],[3,-10],[-3,-16],[5,-20],[-5,-28],[4,-24]].forEach(([cx,cz])=>{
    const crater = new THREE.Mesh(new THREE.CircleGeometry(0.7+Math.random()*0.4,8),craterMat);
    crater.rotation.x=-Math.PI/2; crater.position.set(cx,0.01,cz); g.add(crater);
    // Scorch marks
    const scorch = new THREE.Mesh(new THREE.CircleGeometry(1.2+Math.random()*0.5,8),
      new THREE.MeshStandardMaterial({color:0x1a0a0a,roughness:1,transparent:true,opacity:0.7}));
    scorch.rotation.x=-Math.PI/2; scorch.position.set(cx,0.005,cz); g.add(scorch);
  });
  // Energy barriers / force fields
  const barrierMat = new THREE.MeshStandardMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:1.0,transparent:true,opacity:0.35});
  [[-7,-12],[7,-12],[-7,-22],[7,-22]].forEach(([bx,bz])=>{
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.12,3.5,4),barrierMat);
    barrier.position.set(bx,1.75,bz); g.add(barrier);
  });
  // Lava/fire pits
  const lavaMat = new THREE.MeshStandardMaterial({color:0xff4500,emissive:0xff2200,emissiveIntensity:2.0,transparent:true,opacity:0.85});
  [[-5,-8],[5,-18],[-4,-24]].forEach(([lx,lz],i)=>{
    const lava = new THREE.Mesh(new THREE.CircleGeometry(0.9,10),lavaMat);
    lava.rotation.x=-Math.PI/2; lava.position.set(lx,0.02,lz); lava.name=`mover${i+8}`; g.add(lava);
    const glow = new THREE.PointLight(0xff4500,1.4,6);
    glow.position.set(lx,0.5,lz); g.add(glow);
  });
  // Checkpoint / capture zones
  [[0,-8],[0,-20],[0,-30]].forEach(([cpx,cpz],i)=>{
    const cols = [0xff0000, 0xff6600, 0xcc0000];
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3,0.18,8,32),
      new THREE.MeshStandardMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:1.4,transparent:true,opacity:0.9}));
    ring.rotation.x=Math.PI/2; ring.position.set(cpx,0.6,cpz); ring.name='cp'; g.add(ring);
  });
  // Spawn platform
  const spawnMat = new THREE.MeshStandardMaterial({color:0x3a0000,metalness:0.8,roughness:0.2});
  const spawn = new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,0.3,12),spawnMat);
  spawn.position.set(0,0.15,5); g.add(spawn);
  const spawnRing = new THREE.Mesh(new THREE.TorusGeometry(2.8,0.15,8,32),
    new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:1.8}));
  spawnRing.rotation.x=Math.PI/2; spawnRing.position.set(0,0.3,5); g.add(spawnRing);
  // Dramatic overhead lighting
  const redLight = new THREE.PointLight(0xff2200,1.5,22); redLight.position.set(0,8,-15); g.add(redLight);
  const blueLight= new THREE.PointLight(0x0044ff,0.8,18); blueLight.position.set(-8,6,-5);  g.add(blueLight);
  scene.add(g);
}

function buildSmartArena(scene,arenaType,challenge){
  switch(arenaType){
    case 'sky':        _skyArena(scene); break;
    case 'terrain':    _terrainArena(scene); break;
    case 'hover':      _hoverArena(scene); break;
    case 'rough':      _roughArena(scene,challenge); break;
    case 'factory':    _factoryArena(scene); break;
    case 'jet':        _jetArena(scene); break;
    case 'space':      _spaceArena(scene); break;
    case 'underwater': _underwaterArena(scene); break;
    case 'lego':       _legoArena(scene); break;
    case 'cavern':     _cavernArena(scene); break;
    case 'neon_race':  _neonRaceArena(scene); break;
    case 'jungle':     _jungleArena(scene); break;
    case 'zero_g':     _zeroGArena(scene); break;
    case 'warehouse':  _warehouseArena(scene); break;
    case 'temple':     _templeArena(scene); break;
    case 'combat':     _combatArena(scene); break;
    default:           _groundArena(scene,challenge); break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PHYSICS HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getBlockDuration(block){
  const p=block.paramValues||{};
  switch(block.id){
    case 'move_forward':  return Math.max(0.4,(p.steps||3)*0.7);
    case 'move_backward': return Math.max(0.4,(p.steps||1)*0.7);
    case 'turn_left':
    case 'turn_right':    return Math.max(0.25,(p.degrees||90)/90*0.6);
    case 'spin':          return 1.0;
    case 'stop':          return 0.5;
    case 'set_speed':     return 0.3;
    case 'patrol_area':   return (p.laps||2)*1.8;
    case 'wait':          return Math.max(0.2,p.seconds||1);
    case 'fly_up':
    case 'fly_down':      return 0.9;
    case 'hover_hold':    return Math.max(0.5,p.seconds||1);
    case 'jump':          return 0.7;
    case 'scan':          return 1.6;
    case 'obstacle_ahead':
    case 'line_below':
    case 'see_object':
    case 'collision':
    case 'battery_low':   return 0.5;
    case 'look':          return 1.3;
    case 'avoid_obstacle':return 1.5;
    case 'follow_line':   return (p.steps||4)*0.6;
    case 'follow_target': return (p.steps||3)*0.8;
    case 'return_home':   return 2.0;
    case 'search_area':   return 1.8;
    case 'grab':
    case 'release':       return 0.9;
    case 'rotate_arm':    return 0.8;
    case 'drill':         return Math.max(0.5,p.seconds||2);
    case 'fire_laser':    return 0.7;
    case 'scan_object':   return 1.2;
    case 'lights_on':
    case 'lights_off':    return 0.3;
    case 'flash':         return Math.max(0.5,(p.times||3)*0.3);
    case 'rainbow':       return 1.2;
    case 'play_sound':    return 0.8;
    case 'robot_voice':   return 1.0;
    // drone
    case 'takeoff':       return 1.2;
    case 'land':          return 1.0;
    case 'rotate_air':    return (p.degrees||90)/90*0.6;
    case 'altitude_hold': return p.seconds||1;
    case 'avoid_air':     return 1.2;
    case 'aerial_scan':   return 1.8;
    // jet
    case 'thrust':        return 0.8;
    case 'roll_left':
    case 'roll_right':    return 0.7;
    case 'pitch_up':
    case 'pitch_down':    return 0.6;
    case 'glide':         return p.seconds||2;
    case 'jet_boost':     return 0.9;
    case 'loop_maneuver': return 1.4;
    // tank
    case 'tank_steer':    return 0.7;
    case 'rotate_place':  return (p.degrees||90)/90*0.8;
    case 'push_object':   return 1.6;
    case 'climb_mode':    return 0.4;
    case 'power_mode':    return 0.4;
    // spider
    case 'step_forward':  return Math.max(0.5,(p.steps||3)*0.55);
    case 'climb_wall':    return 1.5;
    case 'stabilize_legs':return 0.8;
    case 'crouch':        return 0.5;
    case 'leap':          return 0.9;
    case 'terrain_detect':return 0.6;
    // factory
    case 'stack_obj':     return 1.2;
    case 'sort_color':    return 1.4;
    case 'precision_mode':return 0.5;
    // new blocks
    case 'strafe_left':
    case 'strafe_right':  return (p.steps||2)*0.7;
    case 'flip':          return 0.8;
    case 'tilt':          return 0.6;
    case 'arm_extend':
    case 'arm_retract':   return Math.max(0.3,(p.dist||20)*0.018);
    case 'gripper_open':
    case 'gripper_close': return 0.4;
    case 'lift_object':
    case 'drop_object':   return 0.8;
    case 'accelerate':    return 0.6;
    case 'decelerate':    return 0.8;
    case 'anti_grav':     return 0.7;
    case 'hover_hold':    return p.seconds||1;
    case 'led_color':     return 0.2;
    case 'random_move':   return 1.5;
    case 'wave':          return 1.2;
    case 'dive':
    case 'float_up':      return 1.0;
    default:              return 0.5;
  }
}

function applyBlock(block,rs,dt,movId){
  const p=block.paramValues||{};
  const dur=rs.currentDur||1;
  const spd=movId==='jets'?2.0:movId==='flying'?1.5:movId==='hover'?1.2:movId==='wheels6'?1.1:movId==='tracks'?0.85:movId==='legs'?0.75:1.0;
  switch(block.id){
    case 'move_forward':  {const d=(p.steps||3)*1.9*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*8; break;}
    case 'move_backward': {const d=(p.steps||1)*1.9*spd; rs.x-=Math.sin(rs.angle)*(d/dur)*dt; rs.z-=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.5; rs.bobPhase+=dt*6; break;}
    case 'turn_left':     rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'turn_right':    rs.angle-=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'spin':          rs.angle+=(Math.PI*2)/dur*dt; break;
    case 'fly_up':        rs.y=Math.min(6,(rs.y||0)+2.5/dur*dt); break;
    case 'fly_down':      rs.y=Math.max(0,(rs.y||0)-2.5/dur*dt); break;
    case 'jump':          {const phase=rs.stepTime/dur; rs.y=Math.max(0,Math.sin(phase*Math.PI)*1.8); break;}
    case 'avoid_obstacle':{rs.angle-=(Math.PI/2)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt*0.6; break;}
    case 'follow_line':   {const d=(p.steps||4)*1.5*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*7; break;}
    case 'patrol_area':   {rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; rs.angle+=dt*0.5; break;}
    case 'follow_target': {const d=(p.steps||3)*1.6*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break;}
    case 'return_home':   {const dx=-rs.x,dz=5-rs.z; const len=Math.sqrt(dx*dx+dz*dz)||1; rs.x+=dx/len*3*dt; rs.z+=dz/len*3*dt; rs.totalDist+=3*dt*0.4; break;}
    case 'search_area':    rs.angle+=(Math.PI*2)/dur*dt; break;
    // drone
    case 'takeoff':        rs.y=Math.min(2.5,rs.y+2.5/dur*dt); break;
    case 'land':           rs.y=Math.max(0,rs.y-2.5/dur*dt); break;
    case 'rotate_air':     rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'altitude_hold':  /* hover in place */ break;
    case 'avoid_air':      {rs.angle-=(Math.PI/2)/dur*dt; rs.x+=Math.sin(rs.angle)*1.2*dt; rs.z+=Math.cos(rs.angle)*1.2*dt; rs.totalDist+=1.2*dt*0.5; break;}
    case 'aerial_scan':    rs.angle+=(Math.PI*0.5)/dur*dt; break;
    // jet — fast, banking
    case 'thrust':         {const d=4*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break;}
    case 'roll_left':      rs.angle+=(Math.PI/3)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; break;
    case 'roll_right':     rs.angle-=(Math.PI/3)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt; rs.totalDist+=spd*dt; break;
    case 'pitch_up':       rs.y=Math.min(6,rs.y+2/dur*dt); rs.x+=Math.sin(rs.angle)*spd*0.6*dt; rs.z+=Math.cos(rs.angle)*spd*0.6*dt; break;
    case 'pitch_down':     rs.y=Math.max(0,rs.y-2/dur*dt); rs.x+=Math.sin(rs.angle)*spd*0.6*dt; rs.z+=Math.cos(rs.angle)*spd*0.6*dt; break;
    case 'glide':          {const d=(p.seconds||2)*2*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break;}
    case 'jet_boost':      {const d=6*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; break;}
    case 'loop_maneuver':  {rs.y=Math.sin((rs.stepTime/dur)*Math.PI)*2+0.5; rs.x+=Math.sin(rs.angle)*spd*0.5*dt; rs.z+=Math.cos(rs.angle)*spd*0.5*dt; rs.totalDist+=spd*0.5*dt; break;}
    // tank — slow + powerful
    case 'tank_steer':     {const dir=p.dir==='left'?1:-1; rs.angle+=dir*(Math.PI/2)/dur*dt; rs.x+=Math.sin(rs.angle)*spd*0.3*dt; rs.z+=Math.cos(rs.angle)*spd*0.3*dt; rs.totalDist+=spd*0.3*dt; break;}
    case 'rotate_place':   rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'push_object':    {const d=(p.steps||2)*1.2*spd*0.5; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.8; rs.bobPhase+=dt*12; break;}
    case 'climb_mode':     /* mode change, no movement */ break;
    case 'power_mode':     /* mode change */ break;
    // spider — stepping gait
    case 'step_forward':   {const d=(p.steps||3)*1.3*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*12; break;}
    case 'climb_wall':     rs.y=Math.min(4,rs.y+3/dur*dt); rs.totalDist+=3/dur*dt; break;
    case 'stabilize_legs': rs.bobPhase=0; break;
    case 'crouch':         rs.y=Math.max(0,rs.y-0.3); break;
    case 'leap':           {const phase=rs.stepTime/dur; rs.y=Math.max(0,Math.sin(phase*Math.PI)*1.6); rs.x+=Math.sin(rs.angle)*2.5*dt; rs.z+=Math.cos(rs.angle)*2.5*dt; rs.totalDist+=2.5*dt; break;}
    case 'terrain_detect': /* pause */ break;
    // factory
    case 'stack_obj':      {rs.y=Math.min(rs.y+0.8/dur*dt,0.8); rs.totalDist+=0.5/dur*dt; break;}
    case 'sort_color':     {rs.angle+=(Math.PI/4)/dur*dt; rs.totalDist+=0.8/dur*dt; break;}
    case 'precision_mode': {rs.x+=Math.sin(rs.angle)*0.3/dur*dt; rs.z+=Math.cos(rs.angle)*0.3/dur*dt; rs.totalDist+=0.3/dur*dt; break;}

    // NEW — drone strafe
    case 'strafe_left':    {const d=(p.steps||2)*1.4*spd; const a=rs.angle+Math.PI/2; rs.x+=Math.sin(a)*(d/dur)*dt; rs.z+=Math.cos(a)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.7; break;}
    case 'strafe_right':   {const d=(p.steps||2)*1.4*spd; const a=rs.angle-Math.PI/2; rs.x+=Math.sin(a)*(d/dur)*dt; rs.z+=Math.cos(a)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.7; break;}
    // NEW — drone flip / tilt
    case 'flip':           {const phase=rs.stepTime/dur; rs.y=Math.max(0,Math.sin(phase*Math.PI)*1.4); rs.x+=Math.sin(rs.angle)*spd*0.4*dt; rs.z+=Math.cos(rs.angle)*spd*0.4*dt; rs.totalDist+=spd*0.4*dt; break;}
    case 'tilt':           {rs.x+=Math.sin(rs.angle)*spd*0.6*dt; rs.z+=Math.cos(rs.angle)*spd*0.6*dt; rs.totalDist+=spd*0.6*dt; break;}
    // NEW — arm
    case 'arm_extend':     {rs.y=Math.min(rs.y+0.5/dur*dt,1.2); rs.totalDist+=(p.dist||20)*0.006/dur*dt; break;}
    case 'arm_retract':    {rs.y=Math.max(0,rs.y-0.5/dur*dt); rs.totalDist+=(p.dist||20)*0.004/dur*dt; break;}
    case 'gripper_open':   break; // visual only
    case 'gripper_close':  break; // visual only
    case 'lift_object':    {rs.y=Math.min(rs.y+0.6/dur*dt,1.5); rs.totalDist+=0.4/dur*dt; break;}
    case 'drop_object':    {rs.y=Math.max(0,rs.y-0.6/dur*dt); rs.totalDist+=0.2/dur*dt; break;}
    // NEW — accelerate/decelerate
    case 'accelerate':     {const d=((p.amount||50)/100)*3*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*10; break;}
    case 'decelerate':     {rs.bobPhase=Math.max(0,rs.bobPhase-dt*6); break;}
    // NEW — hover
    case 'anti_grav':      rs.y=Math.min(6,rs.y+1.5/dur*dt); break;
    case 'hover_hold':     /* altitude hold, no movement */ break;
    case 'led_color':      break; // visual only
    // NEW — random movement
    case 'random_move':    {const ra=rs.angle+Math.PI*(0.5+Math.random()); rs.angle=ra; rs.x+=Math.sin(ra)*spd*1.2*dt; rs.z+=Math.cos(ra)*spd*1.2*dt; rs.totalDist+=spd*1.2*dt; break;}
    // NEW — wave gesture
    case 'wave':           {rs.bobPhase+=dt*15; break;}
    // NEW — dive / float
    case 'dive':           rs.y=Math.max(-2,(rs.y||0)-2/dur*dt); break;
    case 'float_up':       rs.y=Math.min(2,(rs.y||0)+1.5/dur*dt); break;

    default: break;
  }
}

function getGroundEffect(movId,bobPhase,t){
  switch(movId){
    case 'legs':   return {yOff:Math.abs(Math.sin(bobPhase*2.5))*0.18,rollZ:Math.sin(bobPhase*1.2)*0.06};
    case 'hover':  return {yOff:Math.sin(t*1.8)*0.15+0.28,rollZ:Math.sin(t*0.9)*0.04};
    case 'flying': return {yOff:Math.sin(t*1.4)*0.12+0.35,rollZ:Math.sin(t*0.7)*0.05};
    case 'jets':   return {yOff:Math.sin(t*1.2)*0.08+0.4, rollZ:Math.sin(t*0.5)*0.08};
    case 'tracks': return {yOff:0,rollZ:Math.sin(bobPhase*1.5)*0.012};
    case 'wheels6':return {yOff:0,rollZ:Math.sin(bobPhase*1.5)*0.02};
    default:       return {yOff:0,rollZ:Math.sin(bobPhase*1.5)*0.018};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SIMULATOR CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function SimCanvas({robotConfig,codeBlocks,runMode,stepTrigger,onProgress,onFpsUpdate,arenaType,challenge,onBlockActive}){
  const wrapRef=useRef(null);
  const modeRef=useRef('idle');
  const rafRef=useRef(null);
  const fpsRef=useRef({frames:0,last:0});
  const rsRef=useRef({x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0});
  const lastActiveRef=useRef(-1);

  useEffect(()=>{modeRef.current=runMode;},[runMode]);

  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const W=Math.max(el.clientWidth,1),H=Math.max(el.clientHeight,1);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(48,W/H,0.1,80);
    camera.position.set(0,4,10); camera.lookAt(0,0.5,0);
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.3;
    el.appendChild(renderer.domElement);

    const amb=new THREE.AmbientLight(0xffffff,0.45); scene.add(amb);
    const hemi=new THREE.HemisphereLight(0xd0e8ff,0xd8dff0,0.4); scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xfffcf0,1.4);
    sun.position.set(8,14,6); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-20; sun.shadow.camera.right=20;
    sun.shadow.camera.top=20; sun.shadow.camera.bottom=-20; sun.shadow.camera.far=80;
    sun.shadow.bias=-0.0002; scene.add(sun);
    // Fill light from opposite side
    const fill=new THREE.DirectionalLight(0xc8e0ff,0.5); fill.position.set(-10,6,-8); scene.add(fill);
    // Rim light from behind (depth separation)
    const rim=new THREE.DirectionalLight(0xd0b0ff,0.35); rim.position.set(0,4,-15); scene.add(rim);
    // Dynamic colored point lights near robot spawn
    const pl1=new THREE.PointLight(0x4488ff,0.6,25); pl1.position.set(-6,4,-3); scene.add(pl1);
    const pl2=new THREE.PointLight(0xff8844,0.4,20); pl2.position.set(6,3,3);   scene.add(pl2);

    buildSmartArena(scene,arenaType,challenge);

    // ── Environment map for metallic reflections ────────────────────────
    const simEnvCanvas=document.createElement('canvas');
    simEnvCanvas.width=512; simEnvCanvas.height=256;
    const simEnvCtx=simEnvCanvas.getContext('2d');
    const simGrad=simEnvCtx.createLinearGradient(0,0,0,256);
    simGrad.addColorStop(0,'#6f86ad'); simGrad.addColorStop(0.42,'#aac4dd');
    simGrad.addColorStop(0.55,'#cfe0ee'); simGrad.addColorStop(0.6,'#8a9bae');
    simGrad.addColorStop(1,'#2c3340');
    simEnvCtx.fillStyle=simGrad; simEnvCtx.fillRect(0,0,512,256);
    const sunLobe=simEnvCtx.createRadialGradient(150,70,0,150,70,90);
    sunLobe.addColorStop(0,'rgba(255,250,235,0.95)'); sunLobe.addColorStop(1,'rgba(255,250,235,0)');
    simEnvCtx.fillStyle=sunLobe; simEnvCtx.fillRect(0,0,512,256);
    simEnvCtx.fillStyle='rgba(255,255,255,0.10)'; simEnvCtx.fillRect(0,128,512,18);
    const simEnvTex=new THREE.CanvasTexture(simEnvCanvas);
    simEnvTex.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=simEnvTex;

    // ── Post-processing stack ────────────────────────────────────────────
    const ARENA_GRADE={
      sky:      {sat:1.05,gain:[1.02,1.02,1.05],bloom:0.9, thresh:0.55},
      space:    {sat:1.10,gain:[0.95,0.98,1.12],bloom:1.6, thresh:0.30},
      cavern:   {sat:1.20,gain:[1.00,0.96,1.10],bloom:1.7, thresh:0.25},
      neon_race:{sat:1.25,gain:[1.05,0.98,1.10],bloom:1.8, thresh:0.22},
      underwater:{sat:1.15,gain:[0.92,1.02,1.10],bloom:1.4,thresh:0.30},
      jungle:   {sat:1.30,gain:[1.05,1.05,0.92],bloom:1.0, thresh:0.45},
      factory:  {sat:1.00,gain:[0.96,1.00,1.05],bloom:1.5, thresh:0.30},
      warehouse:{sat:1.00,gain:[0.96,1.00,1.05],bloom:1.4, thresh:0.32},
      temple:   {sat:1.18,gain:[1.06,1.00,0.90],bloom:1.2, thresh:0.38},
      combat:   {sat:1.15,gain:[1.08,0.95,0.92],bloom:1.6, thresh:0.28},
      jet:      {sat:1.10,gain:[1.03,1.02,0.98],bloom:1.0, thresh:0.50},
      zero_g:   {sat:1.10,gain:[0.97,0.99,1.10],bloom:1.5, thresh:0.30},
      lego:     {sat:1.20,gain:[1.04,1.02,1.00],bloom:0.9, thresh:0.55},
      rough:    {sat:1.10,gain:[1.04,1.00,0.95],bloom:1.1, thresh:0.45},
      terrain:  {sat:1.15,gain:[1.05,1.02,0.94],bloom:1.0, thresh:0.48},
      hover:    {sat:1.08,gain:[1.02,1.02,1.04],bloom:1.0, thresh:0.50},
      default:  {sat:1.10,gain:[1.02,1.01,1.00],bloom:1.2, thresh:0.40},
    };
    const grade=ARENA_GRADE[arenaType]||ARENA_GRADE.default;
    const ColorGradeShader={
      uniforms:{tDiffuse:{value:null},saturation:{value:grade.sat},gain:{value:new THREE.Vector3(...grade.gain)}},
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`uniform sampler2D tDiffuse; uniform float saturation; uniform vec3 gain; varying vec2 vUv;
        void main(){
          vec4 tex=texture2D(tDiffuse,vUv); vec3 col=tex.rgb;
          float lum=dot(col,vec3(0.2126,0.7152,0.0722));
          col=mix(vec3(lum),col,saturation); col*=gain;
          gl_FragColor=vec4(clamp(col,0.0,1.0),tex.a);
        }`,
    };
    const composer=new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W,H),grade.bloom,0.85,grade.thresh));
    composer.addPass(new ShaderPass(ColorGradeShader));
    const fxaaPass=new ShaderPass(FXAAShader);
    const setFxaa=(w,h)=>{const pr=Math.min(window.devicePixelRatio,2); fxaaPass.material.uniforms.resolution.value.set(1/(w*pr),1/(h*pr));};
    setFxaa(W,H);
    composer.addPass(fxaaPass);
    composer.addPass(new OutputPass());

    // ── Sim particle system ──────────────────────────────────────────────
    const SIM_MAX_P=150;
    const simPPos=new Float32Array(SIM_MAX_P*3);
    const simPGeo=new THREE.BufferGeometry();
    simPGeo.setAttribute('position',new THREE.BufferAttribute(simPPos,3));
    const simSprC=document.createElement('canvas'); simSprC.width=32; simSprC.height=32;
    const simSprCtx=simSprC.getContext('2d');
    const simRG=simSprCtx.createRadialGradient(16,16,0,16,16,16);
    simRG.addColorStop(0,'rgba(190,170,130,1)'); simRG.addColorStop(1,'rgba(190,170,130,0)');
    simSprCtx.fillStyle=simRG; simSprCtx.fillRect(0,0,32,32);
    const simPMat=new THREE.PointsMaterial({size:0.12,map:new THREE.CanvasTexture(simSprC),transparent:true,opacity:0.7,depthWrite:false,sizeAttenuation:true});
    scene.add(new THREE.Points(simPGeo,simPMat));
    const simPool=Array.from({length:SIM_MAX_P},()=>({x:0,y:-100,z:0,vx:0,vy:0,vz:0,life:0}));
    const simEmit=(x,y,z,n=3,vy0=0.06)=>{
      let e=0;
      for(let i=0;i<SIM_MAX_P&&e<n;i++){
        if(simPool[i].life<=0){
          simPool[i].x=x+(Math.random()-0.5)*0.4; simPool[i].y=y+Math.random()*0.08;
          simPool[i].z=z+(Math.random()-0.5)*0.4;
          simPool[i].vx=(Math.random()-0.5)*0.04; simPool[i].vy=vy0+Math.random()*0.06;
          simPool[i].vz=(Math.random()-0.5)*0.04; simPool[i].life=0.6+Math.random()*0.9;
          e++;
        }
      }
    };
    const updateSimP=(dt)=>{
      for(let i=0;i<SIM_MAX_P;i++){
        const p=simPool[i];
        if(p.life>0){
          p.life-=dt*0.7; p.x+=p.vx; p.y+=p.vy; p.z+=p.vz; p.vy-=0.003;
          simPPos[i*3]=p.life>0?p.x:0; simPPos[i*3+1]=p.life>0?p.y:-100; simPPos[i*3+2]=p.life>0?p.z:0;
        } else { simPPos[i*3+1]=-100; }
      }
      simPGeo.attributes.position.needsUpdate=true;
    };
    let simPTimer=0;

    const robot=buildRobotModel(robotConfig);
    robot.castShadow=true;
    const rs=rsRef.current;
    Object.assign(rs,{x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0});
    lastActiveRef.current=-1;
    robot.position.set(rs.x,rs.y,rs.z); robot.rotation.y=rs.angle;
    scene.add(robot);

    const beamGroup=new THREE.Group(); beamGroup.name='beams'; scene.add(beamGroup);
    let beamTimer=0;
    function flashBeam(col,len){
      beamGroup.clear();
      const pts=[new THREE.Vector3(0,0.5,0),new THREE.Vector3(0,0.5,-len)];
      const bm=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.85}));
      beamGroup.add(bm); beamTimer=0.9;
    }

    const camPos=new THREE.Vector3(0,4,10);
    const camLook=new THREE.Vector3(0,0.5,0);
    const movId=robotConfig.movementId||'wheels';
    const blocks=codeBlocks||[];
    let lastTime=performance.now()/1000;

    const ro=new ResizeObserver(()=>{
      if(!el) return;
      const nW=Math.max(el.clientWidth,1),nH=Math.max(el.clientHeight,1);
      renderer.setSize(nW,nH); camera.aspect=nW/nH; camera.updateProjectionMatrix();
      composer.setSize(nW,nH); setFxaa(nW,nH);
    });
    ro.observe(el);

    const tick=()=>{
      rafRef.current=requestAnimationFrame(tick);
      const now=performance.now()/1000;
      const dt=Math.min(now-lastTime,0.05); lastTime=now;
      rs.t+=dt;
      if(beamTimer>0){beamTimer-=dt; if(beamTimer<=0) beamGroup.clear();}
      fpsRef.current.frames++;
      if(now-fpsRef.current.last>=1){onFpsUpdate?.(fpsRef.current.frames); fpsRef.current.frames=0; fpsRef.current.last=now;}

      // Always call robot's own animation (propellers, legs, lights, etc.)
      if(robot.userData.animate) robot.userData.animate(rs.t);

      const mode=modeRef.current;
      if((mode==='running'||mode==='step')&&!rs.done){
        if(blocks.length>0){
          if(rs.step>=blocks.length){rs.done=true;}
          else{
            if(rs.stepTime===0) rs.currentDur=getBlockDuration(blocks[rs.step]);
            rs.stepTime+=dt;
            const bk=blocks[rs.step];
            applyBlock(bk,rs,dt,movId);
            if(lastActiveRef.current!==rs.step){
              lastActiveRef.current=rs.step;
              onBlockActive?.(rs.step,bk.label||bk.id);
            }
            if(['scan','obstacle_ahead','search_area','avoid_obstacle','terrain_detect'].includes(bk.id)) flashBeam(0x00ff88,8);
            else if(['look','see_object','follow_target','scan_object','aerial_scan','sonar'].includes(bk.id)) flashBeam(0xcc00ff,6);
            else if(bk.id==='fire_laser') flashBeam(0xff2200,12);
            else if(['patrol_area','follow_line'].includes(bk.id)) flashBeam(0x00aaff,5);
            else if(['thrust','jet_boost'].includes(bk.id)) flashBeam(0xff6600,14);
            else if(['takeoff','fly_up','pitch_up','climb_wall'].includes(bk.id)) flashBeam(0x00ddff,6);
            else if(['push_object','power_mode'].includes(bk.id)) flashBeam(0xffaa00,5);
            if(mode==='step'){if(rs.stepTime>=rs.currentDur){rs.step++;rs.stepTime=0;rs.currentDur=0;modeRef.current='paused';}}
            else{if(rs.stepTime>=rs.currentDur){rs.step++;rs.stepTime=0;rs.currentDur=0;}}
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
        if(rs.done){onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:100,done:true}); modeRef.current='idle';}
      } else if(mode==='idle'){
        // Gentle idle scan rotation - doesn't fight userData.animate since
        // userData.animate handles sub-group rotations, not root Y
        robot.rotation.y=Math.PI+Math.sin(rs.t*0.5)*0.1;
      }

      // Particle emission while running
      simPTimer+=dt;
      if(simPTimer>0.1 && mode==='running'){
        simPTimer=0;
        const speed=Math.sqrt(rs.x*rs.x+rs.z*rs.z); // crude speed proxy
        const cid=robot.userData.chassisId||'';
        if(/drone|helicopter|hoverbot/.test(cid)){
          for(let ia=0;ia<4;ia++){const a=(ia/4)*Math.PI*2; simEmit(rs.x+Math.cos(a)*0.55,rs.y+0.1,rs.z+Math.sin(a)*0.55,1,-0.06);}
        } else if(/spider|droid|mech/.test(cid)){
          simEmit(rs.x+(Math.random()-0.5)*0.8,rs.y+0.02,rs.z+(Math.random()-0.5)*0.8,2,0.03);
        } else {
          simEmit(rs.x+(Math.random()-0.5)*0.6,rs.y+0.05,rs.z+(Math.random()-0.5)*0.5,2,0.04);
        }
      }
      updateSimP(dt);

      const {yOff,rollZ}=getGroundEffect(movId,rs.bobPhase||0,rs.t);
      robot.position.set(rs.x,rs.y+yOff,rs.z);
      robot.rotation.y=rs.angle; robot.rotation.z=rollZ;
      beamGroup.position.copy(robot.position); beamGroup.rotation.y=rs.angle;
      const isAerial=arenaType==='sky'||arenaType==='hover'||arenaType==='jet';
      const camDist=arenaType==='jet'?10:8;
      const bx=rs.x+Math.sin(rs.angle+Math.PI)*camDist;
      const bz=rs.z+Math.cos(rs.angle+Math.PI)*camDist;
      const camH=isAerial?Math.max(rs.y+4,5):5;
      camPos.lerp(new THREE.Vector3(Math.max(-18,Math.min(18,bx)),camH,Math.max(-38,Math.min(18,bz))),0.045);
      camLook.lerp(new THREE.Vector3(rs.x,rs.y+0.7,rs.z),0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);
      scene.traverse(c=>{
        if(c.name==='cp'){c.rotation.z+=dt*0.9; if(c.material) c.material.emissiveIntensity=0.7+Math.sin(rs.t*3)*0.3;}
        if(c.name&&c.name.startsWith('mover')){const idx=parseInt(c.name.slice(5))||0; c.position.x=Math.sin(rs.t*(0.8+idx*0.2))*(4+idx);}
        if(c.name==='beltstripe'){c.position.z=-2+(rs.t*0.8)%12-6;}
      });
      composer.render();
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if(el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement);
      composer.dispose();
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig,arenaType,challenge]);
  return <div ref={wrapRef} style={{width:'100%',height:'100%'}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL BLOCKLY WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
function BlocklyWorkspace({robotConfig,wsRef,highlightId,onBlocksChange}){
  const divRef   = useRef(null);
  const prevHlId = useRef(null);

  useEffect(()=>{
    const div=divRef.current; if(!div) return;
    registerRobotBlocks();
    const theme  =makeBBTheme();
    const toolbox=buildToolbox(robotConfig);

    const ws=Blockly.inject(div,{
      toolbox, theme,
      grid:{spacing:22,length:4,colour:'#ffffff10',snap:true},
      move:{scrollbars:{horizontal:true,vertical:true},drag:true,wheel:true},
      zoom:{controls:true,wheel:true,startScale:0.85,maxScale:3,minScale:0.25,scaleSpeed:1.2},
      trashcan:true,
      sounds:false,
      renderer:'zelos',
    });
    wsRef.current=ws;

    // Type-specific starter program
    const rtype = detectRobotType(robotConfig);
    const STARTERS = {
      rover:   '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_move_forward"><field name="STEPS">3</field><next><block type="robot_turn_right"><field name="ANGLE">90</field></block></next></block></next></block></xml>',
      tank:    '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_power_mode"><next><block type="robot_move_forward"><field name="STEPS">3</field></block></next></block></next></block></xml>',
      drone:   '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_takeoff"><next><block type="robot_fly_up"><field name="HEIGHT">3</field><next><block type="robot_hover"><field name="SECS">1</field></block></next></block></next></block></next></block></xml>',
      jet:     '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_thrust"><next><block type="robot_roll_left"><next><block type="robot_loop_maneuver"></block></next></block></next></block></next></block></xml>',
      spider:  '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_step_forward"><field name="STEPS">3</field><next><block type="robot_leap"></block></next></block></next></block></xml>',
      factory: '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_grab"><next><block type="robot_rotate_arm"><field name="ANGLE">90</field><next><block type="robot_stack_obj"></block></next></block></next></block></next></block></xml>',
      hover:   '<xml><block type="robot_when_start" x="30" y="30"><next><block type="robot_hover_stabilize"><next><block type="robot_fly_up"><field name="HEIGHT">2</field><next><block type="robot_side_drift"><field name="DIR">left</field></block></next></block></next></block></next></block></xml>',
    };
    try{
      const xmlStr = STARTERS[rtype] || STARTERS.rover;
      const dom=new DOMParser().parseFromString(xmlStr,'text/xml').documentElement;
      Blockly.Xml.domToWorkspace(dom, ws);
    }catch(e){/* ignore */}

    // Resize (ws.isDisposed is a property getter in Blockly v10, not a method)
    const ro=new ResizeObserver(()=>{ if(!ws.isDisposed) Blockly.svgResize(ws); });
    ro.observe(div);

    // Change listener
    const onChange=()=>onBlocksChange?.(ws.getAllBlocks(false).length);
    ws.addChangeListener(onChange);

    return ()=>{
      ws.removeChangeListener(onChange);
      ro.disconnect();
      ws.dispose();
      wsRef.current=null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig.movementId, robotConfig.armId,
     JSON.stringify((robotConfig.sensors||[]).slice().sort()),
     JSON.stringify((robotConfig.tools||[]).slice().sort())]);

  // Highlight executing block
  useEffect(()=>{
    const ws=wsRef.current;
    if(!ws||ws.isDisposed) return;
    if(prevHlId.current){
      const prev=ws.getBlockById(prevHlId.current);
      if(prev){ try{prev.getSvgRoot().classList.remove('bb-exec-block');}catch(e){} }
    }
    if(highlightId){
      const blk=ws.getBlockById(highlightId);
      if(blk){
        try{
          blk.getSvgRoot().classList.add('bb-exec-block');
          ws.centerOnBlock(blk.id);
        }catch(e){}
      }
    }
    prevHlId.current=highlightId;
  },[highlightId]);

  return <div ref={divRef} style={{width:'100%',height:'100%',position:'relative',display:'block'}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEMS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function SystemsPanel({robotConfig,stats,challenge,profile,isRunning,fps}){
  const battColor=stats.battery>60?'#22c55e':stats.battery>30?'#f59e0b':'#ef4444';
  const timeStr=String(Math.floor(stats.time/60)).padStart(2,'0')+':'+String(Math.floor(stats.time%60)).padStart(2,'0');
  const circ=2*Math.PI*22;
  const sensors=[...(robotConfig.sensors||[]),...(robotConfig.tools||[]).filter(t=>['lidar','camera','ultrasonic'].includes(t))];
  return (
    <div style={{flex:'0 0 250px',display:'flex',flexDirection:'column',background:'#161b22',borderLeft:'1px solid #21262d',overflow:'hidden'}}>
      <div style={{padding:'12px',borderBottom:'1px solid #21262d',background:'#0d1117',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🤖</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{robotConfig.name||'My Robot'}</div>
            <div style={{fontSize:9,color:challenge.color,fontWeight:700,marginTop:1}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>
        <div style={{marginTop:8,display:'flex',gap:4,flexWrap:'wrap'}}>
          {(()=>{
            const typeColors={rover:'#3b82f6',tank:'#78716c',drone:'#06b6d4',jet:'#ef4444',spider:'#10b981',factory:'#ec4899',hover:'#7c3aed',underwater:'#0284c7',space:'#94a3b8',humanoid:'#9b59b6',security:'#f59e0b',medbot:'#e2e8f0',firebot:'#ef4444',racedrone:'#ff6b35',factorybot:'#f97316'};
            const typeLabels={rover:'🏎️ Rover',tank:'🚜 Tank',drone:'🚁 Drone',jet:'✈️ Jet',spider:'🕷️ Spider',factory:'🦾 Factory',hover:'🛸 Hover',underwater:'🌊 Sub',space:'🚀 Space',humanoid:'🧍 Humanoid'};
            const t=detectRobotType(robotConfig); const c=typeColors[t]||'#3b82f6';
            return <span style={{fontSize:8,background:c+'22',color:c,border:`1px solid ${c}44`,borderRadius:4,padding:'2px 7px',fontWeight:800}}>{typeLabels[t]||t}</span>;
          })()}
          {fps!=null&&<span style={{fontSize:8,background:'rgba(34,197,94,.14)',color:'#4ade80',border:'1px solid rgba(34,197,94,.28)',borderRadius:4,padding:'2px 7px',fontWeight:700}}>{fps} fps</span>}
        </div>
      </div>
      <div style={{padding:'12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:10}}>Systems</div>
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,color:'#9ca3af'}}>🔋 Battery</span>
            <span style={{fontSize:11,fontWeight:800,color:battColor}}>{Math.round(stats.battery)}%</span>
          </div>
          <div className="sys-bar-track"><div className="sys-bar-fill" style={{width:stats.battery+'%',background:battColor}}/></div>
        </div>
        {[['📏 Distance',stats.dist.toFixed(1)+' m'],['⏱ Time',timeStr],['🚧 Cleared',stats.avoided]].map(([k,v])=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:10,color:'#9ca3af'}}>{k}</span>
            <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff',fontFamily:'monospace'}}>{v}</span>
          </div>
        ))}
      </div>
      {sensors.length>0&&(
        <div style={{padding:'12px',borderBottom:'1px solid #21262d',flexShrink:0}}>
          <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:8}}>Sensors</div>
          {sensors.slice(0,6).map(s=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:isRunning?'#22c55e':'#374151',boxShadow:isRunning?'0 0 7px #22c55e':'none',transition:'all .3s',flexShrink:0}}/>
              <span style={{fontSize:10,color:'#9ca3af'}}>{s}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{padding:'12px',display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
        <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:8,alignSelf:'flex-start'}}>Challenge</div>
        <div style={{fontSize:11,color:challenge.color,fontWeight:700,marginBottom:10,textAlign:'center'}}>{challenge.icon} {challenge.name}</div>
        <svg width="82" height="82" viewBox="0 0 52 52" style={{overflow:'visible'}}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="#21262d" strokeWidth="4"/>
          <circle cx="26" cy="26" r="22" fill="none" stroke={challenge.color} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={String(circ)} strokeDashoffset={String(circ*(1-stats.progress/100))}
            transform="rotate(-90 26 26)" style={{transition:'stroke-dashoffset .5s ease'}}/>
          <text x="26" y="22" textAnchor="middle" fill="#f0f6ff" fontSize="9" fontWeight="bold">{Math.round(stats.progress)}%</text>
          <text x="26" y="33" textAnchor="middle" fill="#6b7280" fontSize="7">done</text>
        </svg>
      </div>
      <div style={{marginTop:'auto',padding:'10px 12px',borderTop:'1px solid #21262d',background:'rgba(124,58,237,.06)',flexShrink:0}}>
        <div style={{fontSize:9,color:'#6b7280',lineHeight:1.6}}>{profile.tipIcon} {profile.tip}</div>
      </div>
    </div>
  );
}

function fmtTime(t){ return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0'); }

// ─────────────────────────────────────────────────────────────────────────────
// WORLD PICKER  —  full-screen overlay showing ALL courses
// ─────────────────────────────────────────────────────────────────────────────
function WorldPicker({ onSelect, onClose, currentId, robotType }) {
  const [cat, setCat] = useState('all');
  const pd = PROFILE_DATA[robotType] || PROFILE_DATA.rover;
  const isRec = (course) => course.rec.some(r => pd.recKeys.includes(r));
  const cats  = ['all', ...Object.keys(CAT_META)];
  const shown = cat === 'all' ? ALL_COURSES : ALL_COURSES.filter(c => c.cat === cat);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',backdropFilter:'blur(16px)',zIndex:200,display:'flex',flexDirection:'column',fontFamily:'system-ui,sans-serif'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0d1117,#161b22)',borderBottom:'1px solid #21262d',padding:'16px 24px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          <span style={{fontSize:20,fontWeight:900,color:'#f0f6ff',letterSpacing:'-0.5px'}}>🌍 Simulator Worlds</span>
          <span style={{fontSize:10,color:'#6b7280'}}>All {ALL_COURSES.length} worlds accessible · ⭐ = optimized for your robot · Click to load</span>
        </div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,color:'#7c3aed',fontWeight:700,background:'rgba(124,58,237,0.15)',padding:'4px 10px',borderRadius:8,border:'1px solid rgba(124,58,237,0.3)'}}>
            {shown.length} worlds
          </span>
          <button onClick={onClose} style={{padding:'7px 16px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#e6edf3',cursor:'pointer',fontWeight:700,fontSize:12,transition:'all .15s'}}
            onMouseEnter={e=>e.target.style.background='#30363d'}
            onMouseLeave={e=>e.target.style.background='#21262d'}>
            ✕ Close
          </button>
        </div>
      </div>

      {/* Category filter - visual pills with icons */}
      <div style={{background:'#0d1117',borderBottom:'1px solid #21262d',padding:'10px 20px',display:'flex',gap:6,overflowX:'auto',flexShrink:0,scrollbarWidth:'none'}}>
        {cats.map(c=>{
          const meta = CAT_META[c];
          const active = cat === c;
          const col = c==='all'?'#7c3aed':(meta?.color||'#7c3aed');
          const count = c==='all'?ALL_COURSES.length:ALL_COURSES.filter(x=>x.cat===c).length;
          return (
            <button key={c} onClick={()=>setCat(c)}
              style={{
                padding:'6px 14px',borderRadius:16,border:`1px solid ${active?col:col+'33'}`,cursor:'pointer',
                background:active?`linear-gradient(135deg,${col},${col}cc)`:'rgba(255,255,255,0.04)',
                color:active?'#fff':meta?.color||'#6b7280',fontSize:11,fontWeight:700,whiteSpace:'nowrap',
                transition:'all .15s',flexShrink:0,display:'flex',alignItems:'center',gap:4,
                boxShadow:active?`0 0 12px ${col}44`:'none',
              }}>
              <span>{c==='all'?'🌐':meta?.icon}</span>
              <span>{c==='all'?'All Worlds':meta?.label}</span>
              <span style={{fontSize:9,opacity:0.75,fontWeight:600}}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* World Grid */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:10,alignContent:'start'}}>
        {shown.map(course=>{
          const rec = isRec(course);
          const sel = course.id === currentId;
          const catMeta = CAT_META[course.cat];
          return (
            <button key={course.id} onClick={()=>{onSelect(course);onClose();}}
              style={{
                padding:'14px',borderRadius:12,
                border:`2px solid ${sel?course.color:rec?course.color+'55':'#21262d'}`,
                background:sel?`linear-gradient(135deg,${course.color}30,${course.color}18)`
                          :rec?`linear-gradient(135deg,${course.color}18,${course.color}08)`
                          :'linear-gradient(135deg,#161b22,#0d1117)',
                cursor:'pointer',textAlign:'left',transition:'all .15s',position:'relative',
                boxShadow:sel?`0 0 20px ${course.color}44`:rec?`0 0 10px ${course.color}22`:'none',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 4px 20px ${course.color}44`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=sel?`0 0 20px ${course.color}44`:rec?`0 0 10px ${course.color}22`:'none';}}>
              {sel && <div style={{position:'absolute',top:0,left:0,right:0,height:2,borderRadius:'12px 12px 0 0',background:`linear-gradient(90deg,transparent,${course.color},transparent)`}} />}
              {rec && <span style={{position:'absolute',top:8,right:8,fontSize:8,background:course.color+'33',color:course.color,borderRadius:5,padding:'2px 6px',fontWeight:900,letterSpacing:0.5}}>⭐ BEST</span>}
              {sel && <span style={{position:'absolute',top:8,right:8,fontSize:8,background:'#22c55e33',color:'#22c55e',borderRadius:5,padding:'2px 6px',fontWeight:900}}>✓ ACTIVE</span>}
              {/* Icon + name */}
              <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${course.color}33,${course.color}18)`,border:`1px solid ${course.color}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:20}}>{course.icon}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:800,color:'#f0f6ff',lineHeight:1.3,marginBottom:3}}>{course.name}</div>
                  <div style={{fontSize:9,color:`${catMeta?.color||'#6b7280'}`,background:`${catMeta?.color||'#6b7280'}22`,borderRadius:4,padding:'1px 5px',display:'inline-block',fontWeight:700}}>
                    {catMeta?.icon} {catMeta?.label}
                  </div>
                </div>
              </div>
              {/* Description */}
              <div style={{fontSize:9,color:'#8b949e',lineHeight:1.5,marginBottom:8}}>{course.desc}</div>
              {/* Stats */}
              <div style={{display:'flex',gap:6}}>
                <span style={{fontSize:8,color:'#6b7280',background:'rgba(255,255,255,0.05)',borderRadius:4,padding:'2px 5px'}}>🏁 {course.obstacles} obstacles</span>
                <span style={{fontSize:8,color:'#6b7280',background:'rgba(255,255,255,0.05)',borderRadius:4,padding:'2px 5px'}}>📏 {course.totalDist}m</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE LAB PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveLabPage({robotConfig:robotConfigProp,onFpsUpdate}){
  const rc=useMemo(()=>{
    const stored=localStorage.getItem('bb-studio-robot');
    try{ return robotConfigProp||(stored?JSON.parse(stored):{name:'ByteBot',movementId:'wheels',sensors:[],tools:[],lightId:'basic'}); }
    catch(e){ return {name:'ByteBot',movementId:'wheels',sensors:[],tools:[],lightId:'basic'}; }
  },[robotConfigProp]);

  const workspaceRef =useRef(null);
  const codeBlocksRef=useRef([]);
  const simKeyRef    =useRef(0);

  const [runMode,      setRunMode]      =useState('idle');
  const [stepTrig,     setStepTrig]     =useState(0);
  const [codeBlocks,   setCodeBlocks]   =useState([]);
  const [highlightId,  setHighlightId]  =useState(null);
  const [blockCount,   setBlockCount]   =useState(0);
  const [stats,        setStats]        =useState({time:0,dist:0,battery:100,avoided:0,progress:0});
  const [activity,     setActivity]     =useState(['🤖 Build your program in the workspace on the left, then press  ▶ Run!']);
  const [fps,          setFps]          =useState(null);
  const [challengeI,   setChallengeI]   =useState(0);
  const [simKey,       setSimKey]       =useState(0);
  const [showWorlds,   setShowWorlds]   =useState(false);
  const [activeCourse, setActiveCourse] =useState(null); // null = use profile default

  useEffect(()=>{codeBlocksRef.current=codeBlocks;},[codeBlocks]);

  const profile  =useMemo(()=>getSmartProfile(rc),[rc]);
  // If user picked a world via WorldPicker, use that; else use the profile's recommended default
  const challenge=useMemo(()=>{
    if (activeCourse) return activeCourse;
    return profile.challenges[Math.min(challengeI,profile.challenges.length-1)];
  },[activeCourse,profile,challengeI]);
  const isRunning=runMode==='running';
  const isPaused =runMode==='paused';
  const isIdle   =runMode==='idle';

  const extractBlocks=useCallback(()=>extractActions(workspaceRef.current),[]);

  const doRun=useCallback(()=>{
    const acts=extractBlocks();
    if(acts.length===0){
      setActivity(['⚠️ Add blocks below the  🚀 When START  hat, then press Run!']);
      return;
    }
    setCodeBlocks(acts);
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setHighlightId(null);
    setRunMode('running');
    setActivity([rc.name+' launching! 🚀','Challenge: '+challenge.name,acts.length+' blocks ready']);
  },[extractBlocks,rc,challenge]);

  const doPause=useCallback(()=>setRunMode(m=>m==='paused'?'running':'paused'),[]);

  const doStep=useCallback(()=>{
    if(isIdle){
      const acts=extractBlocks();
      setCodeBlocks(acts);
      simKeyRef.current++; setSimKey(simKeyRef.current);
      setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
      setHighlightId(null);
    }
    setRunMode('step'); setStepTrig(t=>t+1);
  },[isIdle,extractBlocks]);

  const doReset=useCallback(()=>{
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunMode('idle'); setHighlightId(null); setCodeBlocks([]);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0});
    setActivity(['🔄 Reset! Build your program and press  ▶ Run']);
    const ws=workspaceRef.current;
    if(ws&&!ws.isDisposed) ws.getAllBlocks(false).forEach(b=>{try{b.getSvgRoot().classList.remove('bb-exec-block');}catch(e){}});
  },[]);

  const doClear=useCallback(()=>{
    const ws=workspaceRef.current; if(!ws||ws.isDisposed) return;
    ws.clear();
    try{
      const dom=new DOMParser().parseFromString('<xml><block type="robot_when_start" x="30" y="30"></block></xml>','text/xml').documentElement;
      Blockly.Xml.domToWorkspace(dom,ws);
    }catch(e){}
    setActivity(['🗑 Workspace cleared — start fresh!']);
  },[]);

  const handleBlockActive=useCallback((idx)=>{
    const b=codeBlocksRef.current[idx];
    setHighlightId(b?.blocklyId??null);
  },[]);

  const handleProgress=useCallback((data)=>{
    setStats({time:data.time,dist:data.dist,battery:data.battery,avoided:data.avoided,progress:data.progress});
    if(data.done){setRunMode('idle'); setHighlightId(null); setActivity(a=>[...a,'🏆 Program complete! Great job!']);}
  },[]);

  const handleFps=useCallback((f)=>{setFps(f); onFpsUpdate?.(f);},[onFpsUpdate]);
  const statusCol=isRunning?'#22c55e':isPaused?'#f59e0b':'#6b7280';
  const statusTxt=isRunning?'Running':isPaused?'Paused':'Ready';

  const robotType = detectRobotType(rc);
  const arenaType = activeCourse ? activeCourse.arenaType : profile.arenaType;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#0d1117',overflow:'hidden',color:'#f0f6ff',fontFamily:'system-ui,sans-serif'}}>
      {showWorlds&&<WorldPicker onSelect={c=>{setActiveCourse(c);setShowWorlds(false);simKeyRef.current++;setSimKey(simKeyRef.current);setRunMode('idle');setStats({time:0,dist:0,battery:100,avoided:0,progress:0});}} onClose={()=>setShowWorlds(false)} currentId={challenge.id} robotType={robotType}/>}

      {/* TOP BAR */}
      <div style={{height:52,background:'#161b22',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 14px',gap:10,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:'#f0f6ff',lineHeight:1.2}}>{rc.name||'My Robot'}</div>
            <div style={{fontSize:8,color:'#6b7280'}}>{profile.tipIcon} {profile.arenaLabel}</div>
          </div>
        </div>
        {/* Recommended quick-picks */}
        <div style={{display:'flex',gap:2,padding:'2px',background:'rgba(0,0,0,.3)',borderRadius:9,overflow:'auto',flex:1,maxWidth:460,flexShrink:0}}>
          {profile.challenges.map((ch,i)=>{
            const isSel = !activeCourse && i===challengeI;
            return (
              <button key={ch.id} onClick={()=>{if(!isRunning){setActiveCourse(null);setChallengeI(i);}}}
                style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:6,border:'none',cursor:isRunning?'default':'pointer',whiteSpace:'nowrap',transition:'all .14s',background:isSel?(ch.color+'22'):'transparent',borderBottom:isSel?('2px solid '+ch.color):'2px solid transparent',color:isSel?ch.color:'#6b7280',fontSize:10,fontWeight:700}}>
                <span>{ch.icon}</span><span>{ch.name}</span>
              </button>
            );
          })}
          {/* Active course from WorldPicker */}
          {activeCourse&&!profile.challenges.find(c=>c.id===activeCourse.id)&&(
            <button style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:6,border:'none',whiteSpace:'nowrap',background:activeCourse.color+'22',borderBottom:'2px solid '+activeCourse.color,color:activeCourse.color,fontSize:10,fontWeight:700}}>
              <span>{activeCourse.icon}</span><span>{activeCourse.name}</span>
            </button>
          )}
        </div>
        {/* All Worlds button */}
        <button onClick={()=>!isRunning&&setShowWorlds(true)}
          style={{padding:'5px 12px',borderRadius:8,border:'1px solid rgba(124,58,237,.4)',background:'rgba(124,58,237,.12)',color:'#c084fc',fontSize:10,fontWeight:700,cursor:isRunning?'default':'pointer',whiteSpace:'nowrap',flexShrink:0}}>
          🌍 All Worlds
        </button>
        <div style={{display:'flex',gap:4,marginLeft:'auto',flexShrink:0,alignItems:'center'}}>
          {isIdle&&<button onClick={doRun} style={{padding:'7px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer',boxShadow:'0 2px 8px rgba(34,197,94,.4)'}}>▶ Run</button>}
          {isRunning&&<button onClick={doPause} style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#f59e0b',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>⏸ Pause</button>}
          {isPaused&&<button onClick={doPause} style={{padding:'7px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>▶ Resume</button>}
          {(isRunning||isPaused)&&<button onClick={doReset} style={{padding:'7px 10px',borderRadius:8,border:'none',background:'#ef4444',color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'}}>■ Stop</button>}
          <button onClick={doStep} title="Step one block" style={{padding:'7px 10px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#8b949e',fontWeight:700,fontSize:12,cursor:'pointer'}}>⏭</button>
          <button onClick={doReset} title="Reset" style={{padding:'7px 10px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#8b949e',fontWeight:700,fontSize:12,cursor:'pointer'}}>↺</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:14,background:isRunning?'rgba(34,197,94,.1)':isPaused?'rgba(245,158,11,.1)':'rgba(255,255,255,.04)',border:'1px solid '+(isRunning?'#22c55e':isPaused?'#f59e0b':'#21262d'),flexShrink:0}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:statusCol,display:'inline-block'}}/>
          <span style={{fontSize:9,fontWeight:700,color:statusCol}}>{statusTxt}</span>
        </div>
      </div>

      {/* SMART RECOMMENDATION STRIP */}
      <div style={{height:28,background:'linear-gradient(90deg,rgba(124,58,237,.18),rgba(14,165,233,.12))',borderBottom:'1px solid rgba(124,58,237,.25)',display:'flex',alignItems:'center',padding:'0 14px',gap:10,flexShrink:0}}>
        <span style={{fontSize:16}}>{profile.tipIcon}</span>
        <span style={{fontSize:10,fontWeight:800,color:'#c084fc'}}>{profile.tip}</span>
        <span style={{fontSize:9,color:'#4b5563',marginLeft:4}}>— {profile.recommend}</span>
        <button onClick={()=>setShowWorlds(true)} style={{marginLeft:'auto',padding:'2px 9px',borderRadius:10,border:'1px solid rgba(124,58,237,.35)',background:'rgba(124,58,237,.14)',color:'#c084fc',fontSize:9,fontWeight:700,cursor:'pointer'}}>
          🌍 {ALL_COURSES.length} worlds available
        </button>
        <span style={{fontSize:9,color:'#4b5563',fontStyle:'italic'}}>🔧 Change robot in Build to unlock new abilities</span>
      </div>

      {/* 3-COLUMN MAIN */}
      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>

        {/* LEFT: REAL BLOCKLY */}
        <div style={{flex:'0 0 38%',minWidth:300,maxWidth:530,display:'flex',flexDirection:'column',background:'#0d1117',borderRight:'1px solid #21262d',overflow:'hidden'}}>
          <div style={{height:38,background:'#161b22',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 12px',gap:8,flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:700,color:'#8b949e',flex:1}}>
              🧩 Block Workspace
              {blockCount>0&&<span style={{marginLeft:7,background:'rgba(124,58,237,.2)',color:'#c084fc',borderRadius:10,padding:'1px 7px',fontSize:9,fontWeight:800}}>{blockCount} blocks</span>}
            </span>
            <button onClick={doClear} style={{padding:'3px 10px',borderRadius:6,border:'1px solid #30363d',background:'transparent',color:'#6b7280',fontSize:10,fontWeight:700,cursor:'pointer'}}>🗑 Clear</button>
          </div>
          <div style={{flex:1,position:'relative',overflow:'hidden'}}>
            <BlocklyWorkspace robotConfig={rc} wsRef={workspaceRef} highlightId={highlightId} onBlocksChange={setBlockCount}/>
          </div>
        </div>

        {/* CENTER: 3D ARENA */}
        <div style={{flex:1,position:'relative',overflow:'hidden',background:'#0d1117',minWidth:0}}>
          <SimCanvas key={simKey} robotConfig={rc} codeBlocks={codeBlocks} runMode={runMode} stepTrigger={stepTrig}
            onProgress={handleProgress} onFpsUpdate={handleFps} arenaType={arenaType} challenge={challenge} onBlockActive={handleBlockActive}/>
          {(isRunning||isPaused)&&(
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'rgba(0,0,0,.4)',zIndex:5}}>
              <div style={{height:'100%',background:challenge.color,width:stats.progress+'%',transition:'width .4s',boxShadow:'0 0 8px '+challenge.color}}/>
            </div>
          )}
          <div style={{position:'absolute',top:12,left:12,background:'rgba(13,17,23,.85)',backdropFilter:'blur(10px)',borderRadius:10,padding:'8px 12px',border:'1px solid #21262d',pointerEvents:'none',maxWidth:230,zIndex:4}}>
            <div style={{fontSize:12,fontWeight:800,color:challenge.color}}>{challenge.icon} {challenge.name}</div>
            <div style={{fontSize:9,color:'#6b7280',marginTop:2,lineHeight:1.4}}>{challenge.desc}</div>
          </div>
          {isIdle&&blockCount>0&&(
            <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',background:'rgba(34,197,94,.15)',backdropFilter:'blur(8px)',borderRadius:20,padding:'8px 20px',border:'1px solid rgba(34,197,94,.4)',pointerEvents:'none',zIndex:4,whiteSpace:'nowrap'}}>
              <span style={{fontSize:11,fontWeight:700,color:'#4ade80'}}>✓ {blockCount} blocks ready — press ▶ Run!</span>
            </div>
          )}
          {isIdle&&stats.progress>=99&&(
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(13,17,23,.92)',backdropFilter:'blur(14px)',borderRadius:16,padding:'24px 36px',border:'2px solid '+challenge.color,textAlign:'center',zIndex:10}}>
              <div style={{fontSize:32,marginBottom:8}}>🏆</div>
              <div style={{fontSize:20,fontWeight:800,color:challenge.color}}>Challenge Complete!</div>
              <div style={{fontSize:12,color:'#9ca3af',marginTop:6}}>{stats.dist.toFixed(1)} m · {fmtTime(stats.time)}</div>
            </div>
          )}
        </div>

        {/* RIGHT: SYSTEMS */}
        <SystemsPanel robotConfig={rc} stats={stats} challenge={challenge} profile={profile} isRunning={isRunning} fps={fps}/>
      </div>

      {/* ACTIVITY FEED */}
      <div style={{height:30,background:'#161b22',borderTop:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 14px',gap:0,overflow:'hidden',flexShrink:0}}>
        {activity.slice(-4).map((msg,i,arr)=>(
          <span key={i} style={{fontSize:10,color:i===arr.length-1?'#c9d1d9':'#4b5563',whiteSpace:'nowrap',transition:'color .3s'}}>
            {i>0&&<span style={{margin:'0 6px',color:'#21262d'}}>·</span>}{msg}
          </span>
        ))}
      </div>
    </div>
  );
}
