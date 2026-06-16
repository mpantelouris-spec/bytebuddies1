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
import { buildSimRobot, normalizeRobotBuildConfig } from '../services/studio-robot-builder.js';
import {
  applyArenaAtmosphere, animateRobotWheels, animateRobotIdle, emitWheelDust, resolveArenaTheme,
} from '../services/sim-visual-polish.js';
import {
  setupSimLighting, setupSoftEnvironment, configureLabRenderer,
  stylizeMeshMaterials, createExecutionTrail, WORLD_COLORS,
} from '../services/art-direction.js';
import { createRobotStateController, attachRobotAccentGlow } from '../services/robot-visual-states.js';
import { ROBOT_COURSES, TIERS, ROBOT_TYPE_TO_CATALOG } from '../../data/courseCatalog.js';
import { ROBOT_TRACKS, trackLevelToCourse, calcTrackScore, calcTrackXp, getTrackLevel, getTrackLevelById, BONUS_COURSES, ALL_COURSES_CATALOG, COURSE_LENGTHS, TRACK_CATEGORIES, LEVELS_PER_TRACK } from '../data/robot-tracks.js';
import { GameProgress, fmtTime, LVL_THRESH, DIFF_XP } from '../services/game-progress.js';
import {
  MissionControlPanel, StatsBar,
  GameLevelSelect, GameVictoryScreen, GameFailureScreen, robotMood,
  CustomCodePanel, getRobotGroup,
} from './LiveLabGameUI.jsx';
import { expandFlagshipCourses, buildFlagshipStories } from '../data/flagship-courses.js';
import { buildFlagshipArena } from '../services/flagship-arenas.js';
import {
  expandGameMissionsAsCourses, getGameMission, getMissionStory, MISSION_GENRE_SECTIONS,
} from '../data/game-missions.js';
import {
  filterCoursesForRobot, enrichCourseWithGameLogic, getGameLogicForCourse,
} from '../data/course-game-logic.js';
import {
  FOX_CHASE_WAYPOINTS, buildFoxChasePath, buildFoxChaseObstacles, buildFoxPawPrints,
  buildFoxForestZones, buildFoxMinimalBackdrop, buildFoxPathCoins,
  calcPathProgress, calcFoxZoneIndex,
} from '../services/fox-chase-arena.js';
import { DesignerProgress } from '../services/game-designer-progress.js';
import {
  MissionStudioPanel, MissionZoneIntro, MissionRemixBanner,
} from './MissionStudioPanel.jsx';
import './LiveLabPage.css';
import './LiveLabGame.css';

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

  // ── GRIPPER SYSTEM BLOCKS ──────────────────────────────────────────────────
  { type:'gripper_scan_area',    message0:'📡  Scan area for items',
    previousStatement:null, nextStatement:null, style:'sense_blocks', tooltip:'Detect nearby items (5m radius)' },
  { type:'gripper_grab',         message0:'✊  Grab item',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Pick up nearest item within range' },
  { type:'gripper_release',      message0:'📦  Release / Deliver',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Drop item — score if in delivery zone' },
  { type:'gripper_check_cargo',  message0:'⚖️  Check cargo',
    previousStatement:null, nextStatement:null, style:'sense_blocks', tooltip:'Log what the gripper is carrying' },
  // Dual / humanoid
  { type:'gripper_grab_left',    message0:'✊  Grab LEFT',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Grab with left gripper/hand' },
  { type:'gripper_grab_right',   message0:'✊  Grab RIGHT',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Grab with right gripper/hand' },
  { type:'gripper_grab_both',    message0:'🤲  Grab BOTH hands',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Grab two items simultaneously' },
  { type:'gripper_release_left', message0:'👐  Release LEFT',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Drop item from left hand' },
  { type:'gripper_release_right',message0:'👐  Release RIGHT',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Drop item from right hand' },
  { type:'gripper_release_both', message0:'👐  Release BOTH',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Drop both items simultaneously' },
  // Power / Hydraulic
  { type:'gripper_grip_force',   message0:'💪  Grip force  %1',
    args0:[{type:'field_number',name:'FORCE',value:10,min:1,max:100}],
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Set grip force (1-100)' },
  { type:'gripper_power_grip',   message0:'🦾  POWER GRIP',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Maximum force grab — for very heavy items' },
  { type:'gripper_measure_weight',message0:'⚖️  Measure item weight',
    previousStatement:null, nextStatement:null, style:'sense_blocks', tooltip:'Measure weight of nearest item' },
  // Precision
  { type:'gripper_grab_gentle',  message0:'🎯  Grab GENTLE (fragile)',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Gentle precision grip — only grabs fragile items without breaking' },
  { type:'gripper_release_carefully',message0:'🎯  Release carefully',
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Carefully place item — no damage' },
  { type:'gripper_detect_delicate',message0:'💎  Detect fragile items',
    previousStatement:null, nextStatement:null, style:'sense_blocks', tooltip:'Scan for fragile items only' },
  { type:'gripper_grip_sensitivity',message0:'🎯  Grip sensitivity  %1',
    args0:[{type:'field_number',name:'LEVEL',value:3,min:1,max:5}],
    previousStatement:null, nextStatement:null, style:'tools_blocks', tooltip:'Set precision grip sensitivity (1-5)' },

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
      event_blocks:   { colourPrimary:'#f43f5e', colourSecondary:'#e11d48', colourTertiary:'#be123c', hat:'cap' },
      move_blocks:    { colourPrimary:'#3b82f6', colourSecondary:'#2563eb', colourTertiary:'#1d4ed8' },
      control_blocks: { colourPrimary:'#fb923c', colourSecondary:'#f97316', colourTertiary:'#ea580c' },
      sense_blocks:   { colourPrimary:'#4ade80', colourSecondary:'#22c55e', colourTertiary:'#16a34a' },
      ai_blocks:      { colourPrimary:'#c084fc', colourSecondary:'#a855f7', colourTertiary:'#9333ea' },
      tools_blocks:    { colourPrimary:'#f472b6', colourSecondary:'#ec4899', colourTertiary:'#db2777' },
      lights_blocks:   { colourPrimary:'#22d3ee', colourSecondary:'#06b6d4', colourTertiary:'#0891b2' },
      variable_blocks: { colourPrimary:'#fbbf24', colourSecondary:'#f59e0b', colourTertiary:'#d97706' },
      timer_blocks:    { colourPrimary:'#2dd4bf', colourSecondary:'#14b8a6', colourTertiary:'#0d9488' },
    },
    fontStyle: { family:'system-ui, "Segoe UI", sans-serif', weight:'bold', size:13 },
    componentStyles: {
      workspaceBackgroundColour: '#0a0e14',
      toolboxBackgroundColour:   '#12171f',
      toolboxForegroundColour:   '#e2e8f0',
      flyoutBackgroundColour:    '#1a2030',
      flyoutForegroundColour:    '#f1f5f9',
      flyoutOpacity:             1,
      scrollbarColour:           '#7c3aed88',
      scrollbarOpacity:          0.85,
      cursorColour:              '#a78bfa',
      insertionMarkerColour:     '#22c55e',
      insertionMarkerOpacity:    0.55,
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
// GRIPPER SYSTEM — type detection, capabilities, item definitions
// ─────────────────────────────────────────────────────────────────────────────
function detectGripperType(rc) {
  const arm = (rc.armId || '').toLowerCase();
  const ch  = (rc.chassisId || '').toLowerCase();
  if (/hydraulic/.test(arm)) return 'hydraulic';
  if (/power/.test(arm))     return 'power';
  if (/precision/.test(arm)) return 'precision';
  if (/dual/.test(arm))      return 'dual';
  if (/humanoid|droid|mech|legobot/.test(ch)) return 'humanoid_basic';
  if (arm || /factorybot/.test(ch))           return 'basic';
  return null; // no gripper
}

const GRIPPER_CAPS = {
  basic:          { maxKg:5,   label:'Basic Gripper',     color:'#22c55e', dual:false, canFragile:false, icon:'✊' },
  power:          { maxKg:15,  label:'Power Gripper',     color:'#f59e0b', dual:false, canFragile:false, icon:'💪' },
  hydraulic:      { maxKg:100, label:'Hydraulic Gripper', color:'#ef4444', dual:false, canFragile:false, icon:'🦾' },
  humanoid_basic: { maxKg:5,   label:'Gripper Hands',     color:'#a78bfa', dual:true,  canFragile:false, icon:'🤲' },
  precision:      { maxKg:5,   label:'Precision Gripper', color:'#06b6d4', dual:false, canFragile:true,  icon:'🎯' },
  dual:           { maxKg:10,  label:'Dual Gripper',      color:'#8b5cf6', dual:true,  canFragile:false, icon:'🤲' },
};

// Item weight/type definitions used by arenas and pickup logic
const PICKUP_ITEM_DEFS = {
  light:   { label:'Light Box',    kg:2,  fragile:false, col:0x22c55e, emv:0x00ff44,  value:10 },
  medium:  { label:'Medium Crate', kg:8,  fragile:false, col:0xf59e0b, emv:0xffaa00,  value:20 },
  heavy:   { label:'Heavy Crate',  kg:45, fragile:false, col:0xef4444, emv:0xff2200,  value:35 },
  fragile: { label:'Crystal Vase', kg:1,  fragile:true,  col:0x06b6d4, emv:0x00ddff,  value:30 },
  coin:    { label:'Coin',         kg:0.1,fragile:false, col:0xfbbf24, emv:0xffd700,  value:5  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE COURSE LIBRARY  —  ALL courses always accessible
// ─────────────────────────────────────────────────────────────────────────────
const CAT_META = {
  flagship_line:      { label:'Line Following', icon:'〰️', color:'#00d9ff' },
  flagship_warehouse: { label:'Manipulator',    icon:'🦾', color:'#3b82f6' },
  flagship_jungle:    { label:'Obstacle Nav',   icon:'🌴', color:'#22c55e' },
  flagship_race:      { label:'Velocity',       icon:'🏎️', color:'#ff0080' },
  flagship_rescue:    { label:'Rescue',         icon:'🚨', color:'#ef4444' },
  flagship_soccer:    { label:'Soccer',         icon:'⚽', color:'#00aa00' },
  flagship_maze:      { label:'Maze Master',    icon:'🏛️', color:'#9900ff' },
  flagship_hospital:  { label:'Precision',      icon:'🏥', color:'#0066cc' },
  ground:  { label:'Forest',  icon:'🌲', color:'#22c55e' },
  ai:      { label:'AI Lab',  icon:'🧠', color:'#a855f7' },
  cavern:  { label:'Cavern',  icon:'💎', color:'#8b5cf6' },
  race:    { label:'Neon Race',icon:'🏎️',color:'#ff6b35' },
  temple:  { label:'Temple',  icon:'🏛️', color:'#d97706' },
};

const FLAGSHIP_COURSES = expandFlagshipCourses();
const GAME_MISSION_COURSES = expandGameMissionsAsCourses();

// rec[] = robot-type keywords that find this course "recommended"
const ALL_COURSES = [
  // ── PIXAR STORY WORLDS ─────────────────────────────────────────────────────
  // Each world is a full narrative experience. Children should say "I'm in that world!"
  {
    id:'power_garden', cat:'story_garden', icon:'🌻', color:'#ffcc00',
    name:'The Power Garden',
    desc:'The magical energy flowers are wilting — the entire garden is losing power! Guide your robot through giant sunflowers, repair broken sprinklers, and recharge the energy crystals before the garden goes dark forever.',
    arenaType:'power_garden', obstacles:6, totalDist:28, estMinutes:18, checkpoints:7,
    genre:'adventure', storyWorld:'power_garden',
    rec:['rover','tank','spider','humanoid','medbot','security'],
    systemsBuilt:['movement','triggers','loops','sensors'],
    zones:10,
  },
  {
    id:'crystal_caverns', cat:'story_cave', icon:'💎', color:'#8040ff',
    name:'Crystal Caverns',
    desc:'Deep beneath the earth, an underground city runs on ancient crystal energy. The crystals are dimming — giant formations need recharging before the city falls into darkness. Navigate glowing tunnels, collect energy orbs, and restore power to every crystal cluster.',
    arenaType:'crystal_caverns', obstacles:8, totalDist:32, estMinutes:20, checkpoints:8,
    genre:'adventure', storyWorld:'crystal_caverns',
    rec:['rover','spider','humanoid','underwater','submarine'],
    systemsBuilt:['movement','variables','sensors','loops','if_else'],
    zones:10,
  },
  {
    id:'robot_reef', cat:'story_reef', icon:'🐠', color:'#00c8a0',
    name:'Robot Reef',
    desc:'Pollution is breaking the colour-coding system that guides sea life through the reef. Without it, the fish are lost and the coral is dying. Dive in, guide the schools of fish home, clean the pollution sensors, and restore the reef\'s living light system.',
    arenaType:'robot_reef', obstacles:7, totalDist:30, estMinutes:19, checkpoints:7,
    genre:'exploration', storyWorld:'robot_reef',
    rec:['underwater','submarine','rover'],
    systemsBuilt:['movement','loops','events','sensors','variables'],
    zones:10,
  },
  {
    id:'sky_island', cat:'story_sky', icon:'🏝️', color:'#ff8c20',
    name:'Sky Island Delivery',
    desc:'A storm has knocked out the rope bridges between floating sky islands. The islanders are running out of supplies — their windmills are broken and packages are piling up on the main island. Repair bridges, restart windmills, and deliver cargo before sunset.',
    arenaType:'sky_island', obstacles:7, totalDist:34, estMinutes:22, checkpoints:8,
    genre:'simulation', storyWorld:'sky_island',
    rec:['drone','hover','racedrone','jet','rover'],
    systemsBuilt:['movement','variables','timers','loops','conditions'],
    zones:10,
  },
  // ── GAME CREATION MISSIONS (full 10-zone game builds) ─────────────────────
  ...GAME_MISSION_COURSES,
  // ── 8 FLAGSHIP COURSE PROGRAMS (40 levels) ────────────────────────────────
  ...FLAGSHIP_COURSES,
  // ── FOREST (GROUND ARENA) ──────────────────────────────────────────────────
  {id:'obstacle',    cat:'ground', icon:'🏁', name:'Obstacle Course',        desc:'Navigate obstacles to the finish!',       arenaType:'ground',     color:'#22c55e', obstacles:10, totalDist:22, rec:['rover','tank','spider','humanoid']},
  {id:'race_track',  cat:'ground', icon:'🏎️',name:'Race Track',             desc:'Speed around the track!',                 arenaType:'ground',     color:'#ef4444', obstacles:5,  totalDist:18, rec:['rover','race','jet']},
  {id:'maze',        cat:'ground', icon:'🌀', name:'Maze Navigation',        desc:'Find the exit through the maze!',         arenaType:'ground',     color:'#8b5cf6', obstacles:18, totalDist:30, rec:['rover','spider','humanoid']},
  {id:'cargo',       cat:'ground', icon:'📦', name:'Cargo Delivery',         desc:'Pick up and deliver all cargo!',          arenaType:'ground',     color:'#0ea5e9', obstacles:6,  totalDist:20, rec:['rover','factory','tank']},
  {id:'speedrun',    cat:'ground', icon:'⚡', name:'Speed Run',              desc:'Beat the clock at full speed!',           arenaType:'ground',     color:'#f59e0b', obstacles:5,  totalDist:16, rec:['rover','race','hover']},
  {id:'line_follow', cat:'ground', icon:'〰', name:'Line Follow Arena',      desc:'Follow the line perfectly!',              arenaType:'line_follow',color:'#10b981', obstacles:4,  totalDist:30, rec:['rover','humanoid']},
  {id:'precision',   cat:'ground', icon:'🎯', name:'Precision Driving',      desc:'Park precisely in each target zone!',     arenaType:'ground',     color:'#ec4899', obstacles:4,  totalDist:12, rec:['rover','factory','humanoid']},
  {id:'stem_play',   cat:'ground', icon:'🔬', name:'STEM Playground',        desc:'Explore the science lab arena!',          arenaType:'ground',     color:'#06b6d4', obstacles:8,  totalDist:22, rec:['rover','humanoid','spider']},
  {id:'checkpoint',  cat:'ground', icon:'📍', name:'Checkpoint Challenge',   desc:'Hit every checkpoint in order!',          arenaType:'ground',     color:'#3b82f6', obstacles:6,  totalDist:22, rec:['rover','race','humanoid']},
  {id:'run_easy',    cat:'ground', icon:'🟢', name:'Simple Sprint',          desc:'Sprint the short course — beat the 5-minute clock!', arenaType:'ground', color:'#4ade80', obstacles:3, totalDist:16, rec:['rover','hover','drone','racedrone','jet','humanoid','spider']},
  // ── AI / SENSOR (FOREST ARENA) ─────────────────────────────────────────────
  {id:'ai_training', cat:'ai',     icon:'🧠', name:'AI Training Lab',        desc:'Train your AI algorithms!',               arenaType:'ground',     color:'#a855f7', obstacles:5,  totalDist:18, rec:['rover','drone','humanoid']},
  {id:'stealth',     cat:'ai',     icon:'👻', name:'Stealth Arena',          desc:'Move without being detected!',            arenaType:'ground',     color:'#4b5563', obstacles:6,  totalDist:20, rec:['rover','spider','humanoid']},
  {id:'obj_detect',  cat:'ai',     icon:'👁', name:'Object Detection',       desc:'Find and scan all objects!',              arenaType:'ground',     color:'#22c55e', obstacles:8,  totalDist:22, rec:['rover','drone','factory']},
  {id:'smart_patrol',cat:'ai',     icon:'🏙️', name:'Smart City Patrol',     desc:'Patrol every sector of the city!',        arenaType:'ground',     color:'#0ea5e9', obstacles:6,  totalDist:24, rec:['rover','humanoid','security']},
  {id:'auto_nav',    cat:'ai',     icon:'🗺️', name:'Autonomous Navigation',  desc:'Navigate completely on your own!',        arenaType:'ground',     color:'#f59e0b', obstacles:10, totalDist:28, rec:['rover','drone','humanoid']},
  // ── CRYSTAL CAVERN ─────────────────────────────────────────────────────────
  {id:'crystal_cave',  cat:'cavern', icon:'💎', name:'Crystal Cavern',        desc:'Scale the glowing crystal walls!',        arenaType:'cavern',     color:'#8b5cf6', obstacles:9,  totalDist:26, rec:['spider','humanoid','climbing']},
  {id:'stalactite_run',cat:'cavern', icon:'🦇', name:'Stalactite Run',        desc:'Dodge stalactites as you climb!',         arenaType:'cavern',     color:'#7c3aed', obstacles:12, totalDist:30, rec:['spider','climbing']},
  {id:'cavern_boss',   cat:'cavern', icon:'🕷️', name:'Cavern Boss Challenge', desc:'Defeat the cavern keeper!',               arenaType:'cavern',     color:'#a855f7', obstacles:14, totalDist:28, rec:['spider']},
  {id:'deep_cave',     cat:'cavern', icon:'🌑', name:'Deep Cave Descent',     desc:'Reach the bottom of the dark cave!',      arenaType:'cavern',     color:'#6d28d9', obstacles:10, totalDist:32, rec:['spider','humanoid']},
  // ── NEON RACING CIRCUIT ────────────────────────────────────────────────────
  {id:'neon_race',    cat:'race',   icon:'🏎️', name:'Neon Racing Circuit',   desc:'Race through the neon city track!',       arenaType:'neon_race',  color:'#ff6b35', obstacles:6,  totalDist:24, rec:['hover','race','rover','jet','drone','racedrone']},
  {id:'neon_chase',   cat:'race',   icon:'🚓', name:'Neon City Chase',        desc:'Chase down the runaway bot!',             arenaType:'neon_race',  color:'#ef4444', obstacles:8,  totalDist:26, rec:['hover','rover','race','jet','drone','racedrone']},
  {id:'drift_king',   cat:'race',   icon:'🌀', name:'Drift King',             desc:'Master the perfect drift line!',          arenaType:'neon_race',  color:'#ec4899', obstacles:5,  totalDist:22, rec:['hover','race','jet','drone']},
  {id:'turbo_league', cat:'race',   icon:'⚡', name:'Turbo League Race',      desc:'First to cross the finish wins!',         arenaType:'neon_race',  color:'#fbbf24', obstacles:4,  totalDist:20, rec:['hover','race','rover','jet','racedrone']},
  {id:'run_medium',   cat:'race',   icon:'🏆', name:'Optimized Race',         desc:'Pick your route and beat the 3-minute world record!', arenaType:'neon_race', color:'#f59e0b', obstacles:5, totalDist:22, rec:['hover','rover','drone','racedrone','jet','humanoid']},
  // ── ANCIENT TEMPLE ─────────────────────────────────────────────────────────
  {id:'temple_run',    cat:'temple', icon:'🏛️', name:'Temple Run',            desc:'Escape the ancient temple traps!',        arenaType:'temple',     color:'#a16207', obstacles:10, totalDist:26, rec:['humanoid','spider','rover']},
  {id:'pressure_path', cat:'temple', icon:'⬛', name:'Pressure Plate Path',   desc:'Step on every pressure plate in order!', arenaType:'temple',     color:'#92400e', obstacles:8,  totalDist:22, rec:['humanoid','spider']},
  {id:'idol_heist',    cat:'temple', icon:'🏺', name:'Idol Heist',             desc:'Grab the idol and escape!',               arenaType:'temple',     color:'#d97706', obstacles:9,  totalDist:24, rec:['humanoid','spider','rover']},
  {id:'guardian_fight',cat:'temple', icon:'⚔️', name:'Guardian Challenge',    desc:'Defeat the temple guardians!',            arenaType:'temple',     color:'#ef4444', obstacles:15, totalDist:28, rec:['tank','humanoid','spider']},
  // ── ROVER X1 EXCLUSIVE — underground transit & city grid ───────────────────
  {id:'rover_transit',  cat:'ground', icon:'🚇', name:'Transit Line Tracker',   desc:'Follow the cyan track through the sci-fi underground tunnel at speed!', arenaType:'rover_transit',   color:'#00e5ff', obstacles:4,  totalDist:30, rec:['rover'], exclusive:'rover'},
  {id:'rover_delivery', cat:'ground', icon:'🏙️', name:'City Delivery Grid',     desc:'Navigate city blocks, obey traffic lights, and hit every drop zone!',  arenaType:'rover_delivery',  color:'#22c55e', obstacles:8,  totalDist:24, rec:['rover'], exclusive:'rover'},
  {id:'rover_survey',   cat:'ground', icon:'📡', name:'Terrain Survey',         desc:'Drive precisely to every survey marker and hold position for a full scan!', arenaType:'rover_survey', color:'#fbbf24', obstacles:6, totalDist:20, rec:['rover'], exclusive:'rover'},
  // ── SPIDER BOT EXCLUSIVE — pipes, ruins, rescue ────────────────────────────
  {id:'spider_pipeline',cat:'cavern', icon:'🔧', name:'Pipeline Inspection',    desc:'Crawl the pipe interior and tag every fault marker on the walls!',     arenaType:'spider_pipeline', color:'#ff3333', obstacles:5,  totalDist:18, rec:['spider'], exclusive:'spider'},
  {id:'spider_ruins',   cat:'cavern', icon:'🏛️', name:'Ruin Crawler',           desc:'Climb over collapsed temple rubble to reach the signal beacon!',       arenaType:'spider_ruins',    color:'#d97706', obstacles:10, totalDist:26, rec:['spider'], exclusive:'spider'},
  {id:'spider_rescue',  cat:'cavern', icon:'🆘', name:'Urban Search & Rescue',  desc:'Find survivors across multiple floors of a collapsed building!',       arenaType:'spider_rescue',   color:'#3b82f6', obstacles:12, totalDist:28, rec:['spider'], exclusive:'spider'},
  // ── DRONE EXCLUSIVE — canyon, rooftop, survey ──────────────────────────────
  {id:'drone_canyon',   cat:'sky',    icon:'🏜️', name:'Canyon Flight',          desc:'Thread through the narrow red-rock canyon corridor without hitting the walls!', arenaType:'drone_canyon',  color:'#e8a060', obstacles:8, totalDist:22, rec:['drone','jet'], exclusive:'drone'},
  {id:'drone_rooftop',  cat:'sky',    icon:'🏢', name:'Rooftop Delivery',        desc:'Drop packages to exact rooftop pads across the city skyline!',        arenaType:'drone_rooftop',   color:'#38bdf8', obstacles:6,  totalDist:20, rec:['drone','hover'], exclusive:'drone'},
  {id:'drone_survey',   cat:'sky',    icon:'📷', name:'Countryside Survey',      desc:'Photograph every ground marker across the fields before the sun sets!', arenaType:'drone_survey',   color:'#22c55e', obstacles:4,  totalDist:18, rec:['drone'], exclusive:'drone'},
  // ── TANK EXCLUSIVE — demolition, mountain ──────────────────────────────────
  {id:'tank_demolition',cat:'ground', icon:'💣', name:'Demolition Yard',         desc:'Bulldoze every debris chunk into the dump zones using full tank power!', arenaType:'tank_demolition', color:'#f97316', obstacles:6, totalDist:16, rec:['tank'], exclusive:'tank'},
  {id:'tank_mountain',  cat:'ground', icon:'⛰️', name:'Mountain Assault',        desc:'Climb the rocky switchback terrain to the summit relay station!',      arenaType:'tank_mountain',   color:'#78716c', obstacles:8,  totalDist:30, rec:['tank'], exclusive:'tank'},
  // ── HUMANOID EXCLUSIVE — assembly line, stairwell ──────────────────────────
  {id:'human_assembly', cat:'temple', icon:'🏭', name:'Assembly Line',           desc:'Use both hands to pick, place, and assemble parts on the conveyor!',   arenaType:'human_assembly',  color:'#a855f7', obstacles:4, totalDist:10, rec:['humanoid'], exclusive:'humanoid'},
  {id:'human_stairwell',cat:'temple', icon:'🪜', name:'Stairwell Ascent',        desc:'Climb 6 floors and activate every emergency control panel!',           arenaType:'human_stairwell', color:'#ef4444', obstacles:6, totalDist:20, rec:['humanoid'], exclusive:'humanoid'},
  // ── ROBOT ARM EXCLUSIVE — surgery, sorting ─────────────────────────────────
  {id:'arm_surgery',    cat:'ground', icon:'🔬', name:'Micro Surgery',           desc:'Repair every circuit board fault with the fine-tip tool — no misses!', arenaType:'arm_surgery',     color:'#00ff88', obstacles:5, totalDist:8,  rec:['factory'], exclusive:'arm'},
  {id:'arm_sort',       cat:'ground', icon:'📦', name:'Warehouse Sort',          desc:'Sort every belt item by type and destination before the shift ends!',  arenaType:'arm_sort',        color:'#06b6d4', obstacles:8, totalDist:10, rec:['factory'], exclusive:'arm'},

  // ── UNDERWATER EXCLUSIVE — ocean & deep-sea ──────────────────────────────────
  {id:'coral_reef',     cat:'sky',   icon:'🪸', name:'Coral Reef Expedition',   desc:'Weave through towering coral towers and tag glowing sea life!',         arenaType:'coral_reef',      color:'#06b6d4', obstacles:8,  totalDist:24, rec:['underwater','submarine'], exclusive:'underwater'},
  {id:'deep_trench',    cat:'sky',   icon:'🌊', name:'Deep Trench Dive',         desc:'Descend into crushing darkness and find the ancient shipwreck!',        arenaType:'deep_trench',     color:'#1d4ed8', obstacles:12, totalDist:32, rec:['underwater','submarine'], exclusive:'underwater'},
  {id:'ocean_race',     cat:'race',  icon:'🐠', name:'Ocean Current Race',       desc:'Ride the thermal current through underwater arches to the reef crown!',  arenaType:'coral_reef',      color:'#22d3ee', obstacles:6,  totalDist:20, rec:['underwater','submarine'], exclusive:'underwater'},

  // ── JET EXCLUSIVE — high-speed aerial stunts ─────────────────────────────────
  {id:'jet_stunt',      cat:'sky',   icon:'🎯', name:'Stunt Showdown',           desc:'Thread pylons, barrel-roll through rings and stomp the high-score pad!', arenaType:'jet_stunt',       color:'#f59e0b', obstacles:7,  totalDist:26, rec:['jet'], exclusive:'jet'},
  {id:'jet_supersonic', cat:'sky',   icon:'💨', name:'Supersonic Sprint',        desc:'Full afterburner — blast through every speed gate before fuel burns out!',arenaType:'jet_supersonic',  color:'#ef4444', obstacles:5,  totalDist:30, rec:['jet'], exclusive:'jet'},

  // ── ROUGH / HEAVY TERRAIN ────────────────────────────────────────────────────
  {id:'volcano_run',    cat:'ground',icon:'🌋', name:'Volcano Run',              desc:'Race through lava flows and dodge molten boulders to the eruption zone!', arenaType:'rough',           color:'#f97316', obstacles:10, totalDist:28, rec:['tank','rover','firebot']},
  {id:'warzone',        cat:'ground',icon:'💣', name:'War Zone Blitz',           desc:'Charge through the bomb-cratered battlefield and capture the command post!',arenaType:'rough',          color:'#78716c', obstacles:14, totalDist:32, rec:['tank','firebot']},
  {id:'tank_siege',     cat:'ground',icon:'🛡️', name:'Fortress Siege',          desc:'Breach the fortress walls and disable every defense turret!',             arenaType:'tank_demolition', color:'#ef4444', obstacles:10, totalDist:26, rec:['tank'], exclusive:'tank'},
  {id:'tank_rubble',    cat:'ground',icon:'🪨', name:'Rubble Rescue',            desc:'Clear the debris field and open three escape corridors!',                arenaType:'rough',           color:'#78716c', obstacles:8,  totalDist:22, rec:['tank']},

  // ── UNDERWATER EXTRA ─────────────────────────────────────────────────────────
  {id:'kelp_forest',    cat:'sky',   icon:'🌿', name:'Kelp Forest Maze',         desc:'Weave through the towering kelp labyrinth without disturbing the sea life!', arenaType:'kelp_forest',  color:'#22c55e', obstacles:9, totalDist:22, rec:['underwater','submarine']},
  {id:'arctic_dive',    cat:'sky',   icon:'🧊', name:'Arctic Ice Dive',           desc:'Dive under the frozen ice sheet and navigate to the research station!',     arenaType:'arctic_dive',  color:'#93c5fd', obstacles:7, totalDist:28, rec:['underwater','submarine']},
  {id:'submarine_race', cat:'race',  icon:'🚤', name:'Submarine Sprint',         desc:'Race through the underwater tunnel system — fastest sub wins!',             arenaType:'coral_reef',   color:'#06b6d4', obstacles:5, totalDist:18, rec:['underwater','submarine']},
  {id:'seafloor_scan',  cat:'ai',    icon:'📡', name:'Seafloor Survey',          desc:'Map every quadrant of the ocean floor using your sonar array!',            arenaType:'deep_trench',  color:'#1e40af', obstacles:4, totalDist:20, rec:['underwater','submarine']},

  // ── FACTORY / INDUSTRIAL EXTRA ───────────────────────────────────────────────
  {id:'factory_rush',   cat:'ground',icon:'⚙️', name:'Assembly Line Rush',       desc:'Pick, assemble, and deliver 12 kits before the shift timer runs out!',     arenaType:'factory',      color:'#f59e0b', obstacles:6, totalDist:14, rec:['factory','assembly','factorybot']},
  {id:'quality_gate',   cat:'ground',icon:'🔍', name:'Quality Control',          desc:'Inspect every product on the belt and reject all defective units!',        arenaType:'factory',      color:'#3b82f6', obstacles:5, totalDist:12, rec:['factory','assembly','factorybot']},
  {id:'crane_challenge',cat:'ground',icon:'🏗️', name:'Crane Challenge',          desc:'Use the overhead crane to stack crates to the target height — no drops!',  arenaType:'factory',      color:'#a855f7', obstacles:7, totalDist:10, rec:['factory','crane','factorybot']},

  // ── MEDBOT EXCLUSIVE ─────────────────────────────────────────────────────────
  {id:'triage_run',     cat:'ground',icon:'🚑', name:'Field Triage',             desc:'Reach every injured unit across the arena and deliver first aid in time!',  arenaType:'medbot_triage',color:'#ef4444', obstacles:8, totalDist:20, rec:['medbot'], exclusive:'medbot'},
  {id:'hospital_nav',   cat:'ground',icon:'🏥', name:'Hospital Navigation',      desc:'Navigate the ward corridors, deliver medication, and avoid patient zones!', arenaType:'medbot_ward',  color:'#22c55e', obstacles:6, totalDist:18, rec:['medbot'], exclusive:'medbot'},
  {id:'med_delivery',   cat:'ground',icon:'💊', name:'Medicine Delivery',        desc:'Collect prescriptions and deliver them to 6 patient rooms before lights out!',arenaType:'ground',     color:'#06b6d4', obstacles:5, totalDist:16, rec:['medbot','rover']},

  // ── FIREBOT EXCLUSIVE ────────────────────────────────────────────────────────
  {id:'blaze_run',      cat:'ground',icon:'🔥', name:'Wildfire Response',        desc:'Race to three burning zones and suppress each blaze before it spreads!',    arenaType:'firebot_blaze',color:'#f97316', obstacles:9, totalDist:24, rec:['firebot'], exclusive:'firebot'},
  {id:'rescue_extract', cat:'ground',icon:'🆘', name:'Rescue Extraction',        desc:'Breach burning corridors, locate survivors, and guide them to safety!',     arenaType:'firebot_blaze',color:'#ef4444', obstacles:12,totalDist:28, rec:['firebot'], exclusive:'firebot'},
  {id:'fire_maze',      cat:'ground',icon:'🏚️', name:'Burning Building',         desc:'Navigate the smoke-filled structure floor by floor to reach the rooftop!', arenaType:'rough',        color:'#fbbf24', obstacles:10,totalDist:22, rec:['firebot','tank']},

  // ── JET — neon racing access ─────────────────────────────────────────────────
  {id:'jet_circuit',    cat:'sky',   icon:'🏁', name:'Jet Circuit Race',         desc:'Lap the aerial circuit at full throttle — three laps, fastest time wins!', arenaType:'jet_stunt',    color:'#ef4444', obstacles:6, totalDist:26, rec:['jet'], exclusive:'jet'},

  // ════════════════════════════════════════════════════════════════════════════
  // 20 GROUND / WHEELED COURSES
  // ════════════════════════════════════════════════════════════════════════════
  {id:'forest_trail',      cat:'ground', icon:'🌲', name:'Forest Trail Chase',     desc:'Race an enchanted forest path lit by fireflies and lanterns!',              arenaType:'forest_trail',        color:'#22c55e', obstacles:8,  totalDist:24, rec:['rover','tank','security','medbot','firebot']},
  {id:'city_delivery',     cat:'ground', icon:'🌆', name:'City Grid Delivery',      desc:'Navigate rain-slicked neon streets and hit every drop zone!',               arenaType:'city_delivery',       color:'#38bdf8', obstacles:10, totalDist:28, rec:['rover','tank','security','medbot','firebot']},
  {id:'lava_canyon',       cat:'ground', icon:'🌋', name:'Lava Canyon Run',         desc:'Race through a volcanic canyon above rivers of molten rock!',               arenaType:'lava_canyon',         color:'#f97316', obstacles:12, totalDist:30, rec:['rover','tank','security','medbot','firebot']},
  {id:'arctic_station',    cat:'ground', icon:'🧊', name:'Arctic Ice Station',      desc:'Push through a blizzard across crevasse fields to the research base!',      arenaType:'arctic_station',      color:'#93c5fd', obstacles:9,  totalDist:26, rec:['rover','tank','security','medbot','firebot']},
  {id:'temple_maze_course',cat:'ground', icon:'🏛️', name:'Ancient Temple Maze',    desc:'Dark stone corridors, torch traps, and a hidden treasure vault await!',    arenaType:'temple_maze',         color:'#a16207', obstacles:14, totalDist:28, rec:['rover','tank','security','medbot','firebot']},
  {id:'desert_rally',      cat:'ground', icon:'🏜️', name:'Desert Rally',           desc:'Blast across sun-scorched dunes and rally flags at golden hour!',           arenaType:'desert_rally',        color:'#fbbf24', obstacles:7,  totalDist:32, rec:['rover','tank','security','medbot','firebot']},
  {id:'underground_mine',  cat:'ground', icon:'⛏️', name:'Underground Mine',       desc:'Navigate dark tunnels past crystal veins and rumbling mine carts!',         arenaType:'underground_mine',    color:'#6d28d9', obstacles:11, totalDist:26, rec:['rover','tank','security','medbot','firebot']},
  {id:'flooded_city',      cat:'ground', icon:'🌊', name:'Flooded City',            desc:'Hop between rooftops in a half-submerged city to reach dry land!',         arenaType:'flooded_city',        color:'#1d4ed8', obstacles:10, totalDist:24, rec:['rover','tank','security','medbot','firebot']},
  {id:'space_corridor',    cat:'ground', icon:'🚀', name:'Space Station Corridor',  desc:'Race through metal-grate corridors under emergency red-alert lights!',      arenaType:'space_corridor',      color:'#e2e8f0', obstacles:8,  totalDist:22, rec:['rover','tank','security','medbot','firebot']},
  {id:'haunted_graveyard', cat:'ground', icon:'🎃', name:'Haunted Graveyard',       desc:'Full moon night, howling ghosts, and pumpkin checkpoints throughout!',      arenaType:'haunted_graveyard',   color:'#7c3aed', obstacles:10, totalDist:24, rec:['rover','tank','security','medbot','firebot']},
  {id:'racing_circuit',    cat:'ground', icon:'🏎️', name:'Racing Circuit Night',   desc:'Stadium floodlights blaze as you tear around the championship tarmac!',    arenaType:'racing_circuit',      color:'#ef4444', obstacles:6,  totalDist:20, rec:['rover','tank','security','medbot','firebot']},
  {id:'farm_harvest',      cat:'ground', icon:'🚜', name:'Farm Field Harvest',      desc:'Sunny farmland, a big red barn, and butterflies on the breeze!',           arenaType:'farm_harvest',        color:'#86efac', obstacles:5,  totalDist:18, rec:['rover','tank','security','medbot','firebot']},
  {id:'pirate_dock',       cat:'ground', icon:'🏴‍☠️', name:'Pirate Dock',          desc:'Wooden plank walkways, tall ships, and booming cannons everywhere!',        arenaType:'pirate_dock',         color:'#d97706', obstacles:9,  totalDist:22, rec:['rover','tank','security','medbot','firebot']},
  {id:'toxic_wasteland',   cat:'ground', icon:'☢️', name:'Toxic Wasteland',        desc:'Cracked earth, glowing green pools, and rusted vehicle graveyards!',       arenaType:'toxic_wasteland',     color:'#84cc16', obstacles:13, totalDist:30, rec:['rover','tank','security','medbot','firebot']},
  {id:'carnival_funfair',  cat:'ground', icon:'🎡', name:'Carnival Funfair',        desc:'Ferris wheel, neon carnival lights, and moving ride obstacles!',           arenaType:'carnival_funfair',    color:'#f43f5e', obstacles:8,  totalDist:22, rec:['rover','tank','security','medbot','firebot']},
  {id:'jungle_bridge',     cat:'ground', icon:'🌴', name:'Jungle Bridge Run',       desc:'Cross rope bridges over a canyon with a roaring waterfall below!',         arenaType:'jungle_bridge',       color:'#16a34a', obstacles:10, totalDist:26, rec:['rover','tank','security','medbot','firebot']},
  {id:'museum_heist',      cat:'ground', icon:'🏛️', name:'Museum Heist',           desc:'Marble floors, laser grid security, and priceless sculptures to dodge!',   arenaType:'museum_heist',        color:'#c4b5fd', obstacles:12, totalDist:24, rec:['rover','tank','security','medbot','firebot']},
  {id:'snow_rescue',       cat:'ground', icon:'⛷️', name:'Snow Mountain Rescue',   desc:'Alpine blizzard, avalanche zones, and injured climbers to reach!',         arenaType:'snow_rescue',         color:'#bae6fd', obstacles:9,  totalDist:28, rec:['rover','tank','security','medbot','firebot']},
  {id:'cyber_city',        cat:'ground', icon:'🤖', name:'Cyber City Hack',         desc:'Cyberpunk streets, streaming data pillars, and hacker terminal checkpoints!',arenaType:'cyber_city',        color:'#06b6d4', obstacles:11, totalDist:26, rec:['rover','tank','security','medbot','firebot']},
  {id:'time_trial_gauntlet',cat:'ground',icon:'⏱️', name:'Time Trial Gauntlet',   desc:'Abstract void of floating platforms and geometric barriers — pure speed!', arenaType:'time_trial_gauntlet',color:'#a855f7', obstacles:14, totalDist:28, rec:['rover','tank','security','medbot','firebot']},

  // ════════════════════════════════════════════════════════════════════════════
  // 20 AERIAL COURSES
  // ════════════════════════════════════════════════════════════════════════════
  {id:'canyon_flight_course',cat:'sky', icon:'🏜️', name:'Canyon Flight',           desc:'Thread through narrow red-rock canyon corridors at high speed!',           arenaType:'canyon_flight',       color:'#e8a060', obstacles:9,  totalDist:24, rec:['drone','jet','hover','racedrone']},
  {id:'city_skyline_race',   cat:'sky', icon:'🌆', name:'City Skyline Race',        desc:'Weave between skyscrapers above a glittering night city!',                 arenaType:'city_skyline',        color:'#38bdf8', obstacles:10, totalDist:26, rec:['drone','jet','hover','racedrone']},
  {id:'storm_cloud_chase',   cat:'sky', icon:'⛈️', name:'Storm Cloud Chase',        desc:'Fly through thunderhead clouds with lightning flashing all around!',       arenaType:'storm_cloud',         color:'#6b7280', obstacles:11, totalDist:28, rec:['drone','jet','hover','racedrone']},
  {id:'volcanic_flythrough', cat:'sky', icon:'🌋', name:'Volcanic Fly-Through',     desc:'Dive through an erupting volcano caldera — dodge ash clouds and boulders!',arenaType:'volcanic_flythrough', color:'#f97316', obstacles:13, totalDist:30, rec:['drone','jet','hover','racedrone']},
  {id:'arctic_survey_flight',cat:'sky', icon:'🧊', name:'Arctic Survey',            desc:'Fly grid patterns over frozen tundra to map the ice shelf!',               arenaType:'arctic_survey',       color:'#bae6fd', obstacles:5,  totalDist:22, rec:['drone','jet','hover','racedrone']},
  {id:'rooftop_delivery',    cat:'sky', icon:'🏢', name:'Rooftop Delivery',         desc:'Drop packages precisely to penthouse pads across the cityscape!',          arenaType:'rooftop_delivery',    color:'#22c55e', obstacles:7,  totalDist:20, rec:['drone','jet','hover','racedrone']},
  {id:'space_station_orbit', cat:'sky', icon:'🛸', name:'Space Station Orbit',      desc:'Circle the orbital station and dock at every airlock gate!',               arenaType:'space_orbit',         color:'#c4b5fd', obstacles:8,  totalDist:28, rec:['drone','jet','hover','racedrone']},
  {id:'rainforest_canopy',   cat:'sky', icon:'🌴', name:'Rainforest Canopy',        desc:'Zip through tangled jungle canopy — branches and toucans everywhere!',     arenaType:'rainforest_canopy',   color:'#16a34a', obstacles:12, totalDist:24, rec:['drone','jet','hover','racedrone']},
  {id:'cloud_race',          cat:'sky', icon:'☁️', name:'Race Through Clouds',      desc:'Slalom between cloud pillars in a bright-blue sky gauntlet!',              arenaType:'cloud_race',          color:'#e0f2fe', obstacles:8,  totalDist:22, rec:['drone','jet','hover','racedrone']},
  {id:'night_patrol',        cat:'sky', icon:'🌃', name:'Night City Patrol',        desc:'Survey every sector of the sleeping city from above — spot anomalies!',   arenaType:'night_patrol',        color:'#1e3a5f', obstacles:6,  totalDist:26, rec:['drone','jet','hover','racedrone']},
  {id:'desert_air_race',     cat:'sky', icon:'🏁', name:'Desert Air Race',          desc:'Full throttle across the scorching desert — checkpoint pylons mark your path!',arenaType:'desert_air',       color:'#fbbf24', obstacles:8,  totalDist:24, rec:['drone','jet','hover','racedrone']},
  {id:'mountain_pass_nav',   cat:'sky', icon:'⛰️', name:'Mountain Pass Navigation',desc:'Thread through alpine peaks on gusty winds — precision flying required!',   arenaType:'mountain_pass',       color:'#78716c', obstacles:10, totalDist:26, rec:['drone','jet','hover','racedrone']},
  {id:'glacier_flyover',     cat:'sky', icon:'🏔️', name:'Glacier Flyover',         desc:'Soar over crystal-blue glaciers and survey crevasse fields!',              arenaType:'glacier_flyover',     color:'#93c5fd', obstacles:5,  totalDist:20, rec:['drone','jet','hover','racedrone']},
  {id:'typhoon_escape',      cat:'sky', icon:'🌀', name:'Typhoon Escape',           desc:'Outrun the rotating typhoon wall — it speeds up every 30 seconds!',        arenaType:'typhoon',             color:'#0284c7', obstacles:14, totalDist:32, rec:['drone','jet','hover','racedrone']},
  {id:'alien_planet',        cat:'sky', icon:'👽', name:'Alien Planet Survey',      desc:'Purple skies, floating rocks, and alien megaliths to scan and map!',       arenaType:'alien_planet',        color:'#a855f7', obstacles:9,  totalDist:26, rec:['drone','jet','hover','racedrone']},
  {id:'fireworks_display',   cat:'sky', icon:'🎆', name:'Fireworks Display',        desc:'Light every launch pad in sequence to trigger the grand finale show!',     arenaType:'fireworks',           color:'#f43f5e', obstacles:7,  totalDist:20, rec:['drone','jet','hover','racedrone']},
  {id:'cloud_fortress',      cat:'sky', icon:'🏰', name:'Cloud Fortress',           desc:'Storm a fortress floating on clouds — breach towers and hit the flag!',    arenaType:'cloud_fortress',      color:'#c4b5fd', obstacles:12, totalDist:28, rec:['drone','jet','hover','racedrone']},
  {id:'drone_racing_league', cat:'sky', icon:'⚡', name:'Drone Racing League',      desc:'Neon gate course, stadium crowd, and lap record to smash!',                arenaType:'drone_league',        color:'#f59e0b', obstacles:8,  totalDist:22, rec:['drone','jet','hover','racedrone']},
  {id:'coastal_rescue',      cat:'sky', icon:'🌊', name:'Coastal Rescue',           desc:'Locate capsized vessels along the stormy coastline and drop life rings!',  arenaType:'coastal_rescue',      color:'#06b6d4', obstacles:7,  totalDist:24, rec:['drone','jet','hover','racedrone']},
  {id:'warp_gate_champ',     cat:'sky', icon:'🌀', name:'Warp Gate Championship',   desc:'Hypnotic warp rings accelerate you — keep control through 12 gates!',     arenaType:'warp_gate',           color:'#ec4899', obstacles:10, totalDist:26, rec:['drone','jet','hover','racedrone']},

  // ════════════════════════════════════════════════════════════════════════════
  // 20 WALKER COURSES
  // ════════════════════════════════════════════════════════════════════════════
  {id:'pipeline_crawl',      cat:'cavern', icon:'🔩', name:'Industrial Pipeline Crawl',   desc:'Crawl through twisting industrial pipes and tag every fault sensor!',   arenaType:'pipeline_crawl',    color:'#f97316', obstacles:8,  totalDist:18, rec:['spider','humanoid']},
  {id:'temple_climb_course', cat:'cavern', icon:'🏛️', name:'Crumbling Temple Climb',     desc:'Scale crumbling stone spires to reach the signal beacon at the top!',  arenaType:'temple_climb',      color:'#a16207', obstacles:11, totalDist:22, rec:['spider','humanoid']},
  {id:'collapsed_building',  cat:'cavern', icon:'🏚️', name:'Collapsed Building Search',  desc:'Navigate unstable floors of a collapsed building to save survivors!',   arenaType:'collapsed_building',color:'#78716c', obstacles:13, totalDist:26, rec:['spider','humanoid']},
  {id:'military_infiltration',cat:'cavern',icon:'🪖', name:'Military Base Infiltration', desc:'Crawl under laser grids and over walls to reach the control room!',     arenaType:'military_base',     color:'#4b5563', obstacles:12, totalDist:24, rec:['spider','humanoid']},
  {id:'factory_floor_walk',  cat:'cavern', icon:'🏭', name:'Factory Assembly Floor',     desc:'Maneuver around active conveyor belts and robotic arms!',               arenaType:'factory_floor',     color:'#fbbf24', obstacles:10, totalDist:20, rec:['spider','humanoid']},
  {id:'space_eva',           cat:'cavern', icon:'🚀', name:'Space Station EVA',           desc:'Walk the exterior hull of a space station — magnetic boots required!',  arenaType:'space_eva',         color:'#c4b5fd', obstacles:9,  totalDist:22, rec:['spider','humanoid']},
  {id:'hospital_emergency',  cat:'cavern', icon:'🏥', name:'Hospital Emergency',          desc:'Rush through packed corridors to deliver critical equipment in time!',  arenaType:'hospital_walk',     color:'#22c55e', obstacles:7,  totalDist:18, rec:['spider','humanoid']},
  {id:'mine_shaft_descent',  cat:'cavern', icon:'⛏️', name:'Mining Shaft Descent',       desc:'Lower yourself down dark shafts between crystal-vein walls!',           arenaType:'mine_shaft',        color:'#7c3aed', obstacles:10, totalDist:24, rec:['spider','humanoid']},
  {id:'urban_obstacle',      cat:'cavern', icon:'🏙️', name:'Urban Obstacle Course',      desc:'Parkour across rooftops, scaffolding, and urban debris!',               arenaType:'urban_obstacle',    color:'#06b6d4', obstacles:12, totalDist:22, rec:['spider','humanoid']},
  {id:'ancient_colosseum',   cat:'cavern', icon:'🏟️', name:'Ancient Colosseum',          desc:'Navigate the arena floor while avoiding falling pillars!',              arenaType:'colosseum',         color:'#d97706', obstacles:14, totalDist:26, rec:['spider','humanoid']},
  {id:'volcanic_climb',      cat:'cavern', icon:'🌋', name:'Volcanic Rock Climb',        desc:'Scale lava-hardened basalt pillars above a glowing magma pit!',         arenaType:'volcanic_climb',    color:'#f97316', obstacles:11, totalDist:20, rec:['spider','humanoid']},
  {id:'bamboo_forest_run',   cat:'cavern', icon:'🎋', name:'Bamboo Forest Run',           desc:'Sprint through dense bamboo columns in a misty ancient forest!',        arenaType:'bamboo_forest',     color:'#86efac', obstacles:8,  totalDist:22, rec:['spider','humanoid']},
  {id:'ice_palace',          cat:'cavern', icon:'❄️', name:'Ice Palace Ascent',          desc:'Climb slippery frozen staircases inside a spectacular ice palace!',     arenaType:'ice_palace',        color:'#bae6fd', obstacles:10, totalDist:24, rec:['spider','humanoid']},
  {id:'robot_museum',        cat:'cavern', icon:'🤖', name:'Robot Museum Climb',         desc:'Scale towering robot sculptures in a futuristic science museum!',       arenaType:'robot_museum',      color:'#38bdf8', obstacles:7,  totalDist:18, rec:['spider','humanoid']},
  {id:'sewers_run',          cat:'cavern', icon:'🐀', name:'Sewer System Run',            desc:'Navigate slippery sewer tunnels filled with obstacles and rushing water!',arenaType:'sewers',           color:'#6b7280', obstacles:9,  totalDist:20, rec:['spider','humanoid']},
  {id:'sky_garden',          cat:'cavern', icon:'🌸', name:'Sky Garden Traverse',         desc:'Cross hanging garden platforms high above the misty valley floor!',     arenaType:'sky_garden',        color:'#f9a8d4', obstacles:8,  totalDist:22, rec:['spider','humanoid']},
  {id:'cargo_ship_crawl',    cat:'cavern', icon:'🚢', name:'Cargo Ship Crawl',            desc:'Creep through a listing cargo ship — crates shift with every wave!',    arenaType:'cargo_ship',        color:'#0369a1', obstacles:11, totalDist:22, rec:['spider','humanoid']},
  {id:'haunted_mansion',     cat:'cavern', icon:'👻', name:'Haunted Mansion',             desc:'Crawl through candlelit haunted halls — ghosts guard every door!',      arenaType:'haunted_mansion',   color:'#7c3aed', obstacles:10, totalDist:20, rec:['spider','humanoid']},
  {id:'cave_of_wonders',     cat:'cavern', icon:'✨', name:'Cave of Wonders',             desc:'Glittering gem cavern with crumbling bridges and rising water!',        arenaType:'cave_of_wonders',   color:'#fbbf24', obstacles:12, totalDist:24, rec:['spider','humanoid']},
  {id:'cyber_dungeon',       cat:'cavern', icon:'💻', name:'Cyber Dungeon',               desc:'Digital maze of holographic walls and electric floor traps!',           arenaType:'cyber_dungeon',     color:'#06b6d4', obstacles:13, totalDist:26, rec:['spider','humanoid']},

  // ════════════════════════════════════════════════════════════════════════════
  // 20 UNDERWATER COURSES
  // ════════════════════════════════════════════════════════════════════════════
  {id:'coral_reef_survey',   cat:'sky', icon:'🪸', name:'Coral Reef Survey',        desc:'Map the entire reef ecosystem and tag every species of sea life!',         arenaType:'coral_reef_survey', color:'#06b6d4', obstacles:7,  totalDist:22, rec:['underwater','submarine']},
  {id:'shipwreck_explore',   cat:'sky', icon:'⚓', name:'Shipwreck Exploration',    desc:'Explore a sunken galleon — navigate dark cabins and find the treasure!',  arenaType:'shipwreck',         color:'#d97706', obstacles:10, totalDist:26, rec:['underwater','submarine']},
  {id:'deep_trench_course',  cat:'sky', icon:'🌊', name:'Deep Sea Trench Dive',     desc:'Descend into crushing darkness — bioluminescent creatures light the way!', arenaType:'deep_trench_course',color:'#1d4ed8', obstacles:12, totalDist:30, rec:['underwater','submarine']},
  {id:'hydrothermal_vents',  cat:'sky', icon:'♨️', name:'Hydrothermal Vents',      desc:'Weave around scalding thermal vents rising from the ocean floor!',         arenaType:'hydrothermal',      color:'#f97316', obstacles:11, totalDist:24, rec:['underwater','submarine']},
  {id:'submarine_canyon',    cat:'sky', icon:'🏔️', name:'Submarine Canyon',        desc:'Navigate a dramatic underwater mountain range canyon system!',             arenaType:'sub_canyon',        color:'#0369a1', obstacles:9,  totalDist:26, rec:['underwater','submarine']},
  {id:'ice_shelf_dive',      cat:'sky', icon:'🧊', name:'Under the Ice Shelf',      desc:'Explore beneath the polar ice cap — blue glacial light everywhere!',       arenaType:'ice_shelf',         color:'#bae6fd', obstacles:8,  totalDist:22, rec:['underwater','submarine']},
  {id:'ocean_current_maze',  cat:'sky', icon:'🌀', name:'Ocean Current Maze',       desc:'Ride and fight powerful currents through an underwater cave network!',     arenaType:'current_maze',      color:'#22d3ee', obstacles:10, totalDist:24, rec:['underwater','submarine']},
  {id:'whale_migration',     cat:'sky', icon:'🐋', name:'Whale Migration Route',    desc:'Escort the whale pod safely through nets and boat traffic!',               arenaType:'whale_route',       color:'#1e3a5f', obstacles:6,  totalDist:28, rec:['underwater','submarine']},
  {id:'bioluminescent_bay',  cat:'sky', icon:'✨', name:'Bioluminescent Bay',       desc:'Navigate by the soft glow of bioluminescent plankton clouds!',            arenaType:'bioluminescent',    color:'#818cf8', obstacles:8,  totalDist:20, rec:['underwater','submarine']},
  {id:'pirate_treasure',     cat:'sky', icon:'💰', name:'Pirate Treasure Hunt',     desc:'Find all six treasure chests scattered around a sunken pirate fleet!',    arenaType:'pirate_wreck',      color:'#fbbf24', obstacles:9,  totalDist:24, rec:['underwater','submarine']},
  {id:'underwater_volcano',  cat:'sky', icon:'🌋', name:'Underwater Volcano',       desc:'Circle the smoking submarine volcano without touching the lava flow!',     arenaType:'undersea_volcano',  color:'#f97316', obstacles:13, totalDist:28, rec:['underwater','submarine']},
  {id:'seagrass_meadow',     cat:'sky', icon:'🌿', name:'Seagrass Meadow Dash',    desc:'Sprint through swaying seagrass while tagging hidden sonar buoys!',        arenaType:'seagrass',          color:'#16a34a', obstacles:5,  totalDist:18, rec:['underwater','submarine']},
  {id:'tidal_cave',          cat:'sky', icon:'🦀', name:'Tidal Cave Exploration',  desc:'Navigate tidal caves that flood and drain every 45 seconds!',             arenaType:'tidal_cave',        color:'#0284c7', obstacles:11, totalDist:22, rec:['underwater','submarine']},
  {id:'deep_station',        cat:'sky', icon:'🛸', name:'Deep Sea Station',         desc:'Dock at every port of the deep-sea research station modules!',            arenaType:'deep_station',      color:'#38bdf8', obstacles:7,  totalDist:20, rec:['underwater','submarine']},
  {id:'squid_chase',         cat:'sky', icon:'🦑', name:'Giant Squid Chase',        desc:'Outmaneuver the colossal squid through a maze of kelp towers!',           arenaType:'squid_chase',       color:'#7c3aed', obstacles:12, totalDist:26, rec:['underwater','submarine']},
  {id:'atlantis_ruins',      cat:'sky', icon:'🏛️', name:'Atlantis Ruins',          desc:'Explore the lost city — crumbling columns and ancient traps remain!',     arenaType:'atlantis',          color:'#a16207', obstacles:10, totalDist:24, rec:['underwater','submarine']},
  {id:'ocean_race_grand',    cat:'race', icon:'🏁', name:'Ocean Grand Prix',        desc:'Full-speed sub race through a lit underwater circuit — fastest wins!',    arenaType:'coral_reef',        color:'#ef4444', obstacles:6,  totalDist:22, rec:['underwater','submarine']},
  {id:'eel_cavern',          cat:'sky', icon:'⚡', name:'Electric Eel Cavern',      desc:'Dodge electric eels guarding the passage through a dark sea cave!',       arenaType:'eel_cavern',        color:'#fbbf24', obstacles:11, totalDist:20, rec:['underwater','submarine']},
  {id:'tsunami_escape',      cat:'sky', icon:'🌊', name:'Tsunami Escape',           desc:'Outswim a wall of crushing water racing toward the safe zone!',           arenaType:'tsunami',           color:'#1d4ed8', obstacles:14, totalDist:30, rec:['underwater','submarine']},
  {id:'mariana_challenge',   cat:'sky', icon:'🌑', name:'Mariana Trench Challenge', desc:'Ultimate depth run — navigate the absolute darkest trench on Earth!',     arenaType:'mariana',           color:'#0f172a', obstacles:15, totalDist:32, rec:['underwater','submarine']},
];

// ─────────────────────────────────────────────────────────────────────────────
// COURSE TYPES — challenge categories with Easy / Medium / Hard variants
// ─────────────────────────────────────────────────────────────────────────────
const COURSE_TYPES = [
  {
    id:'racing', icon:'🏎️', name:'Racing', color:'#ef4444',
    desc:'Compete in high-speed races through the neon city circuit',
    duration:'15-25 min', focus:'Speed + Precision',
    xp:{easy:100,medium:200,hard:300},
    rec:['rover','hover','drone','racedrone'], ok:['humanoid','spider'], bad:['factory','underwater'],
    variants:[
      {diff:'easy',  name:'Neon Racing Circuit', id:'neon_race',   minutes:15, tip:'Clean race · learn the circuit'},
      {diff:'medium',name:'Neon City Chase',      id:'neon_chase',  minutes:20, tip:'Chase mode · catch the runaway bot'},
      {diff:'hard',  name:'Turbo League',         id:'turbo_league',minutes:25, tip:'First to finish · no mercy racing'},
    ],
  },
  {
    id:'forest', icon:'🌲', name:'Forest Run', color:'#22c55e',
    desc:'Navigate the Whispering Forest — obstacles, rivers, caves and more',
    duration:'10-25 min', focus:'Navigation + Obstacles',
    xp:{easy:100,medium:200,hard:300},
    rec:['rover','spider','humanoid'], ok:['tank','hover'], bad:['underwater'],
    variants:[
      {diff:'easy',  name:'Simple Sprint',    id:'run_easy',   minutes:8,  tip:'Short forest sprint · beginner friendly'},
      {diff:'medium',name:'Obstacle Course',  id:'obstacle',   minutes:15, tip:'Logs · rivers · roots · full forest traverse'},
      {diff:'hard',  name:'Maze Navigation',  id:'maze',       minutes:25, tip:'Deep forest maze · find the exit'},
    ],
  },
  {
    id:'cavern', icon:'💎', name:'Crystal Cavern', color:'#8b5cf6',
    desc:'Explore glowing underground caverns filled with crystals and mysteries',
    duration:'15-30 min', focus:'Exploration + Agility',
    xp:{easy:100,medium:200,hard:300},
    rec:['spider','humanoid','climbing'], ok:['rover'], bad:['drone','jet','underwater'],
    variants:[
      {diff:'easy',  name:'Crystal Cavern',    id:'crystal_cave',    minutes:15, tip:'Glowing crystals · bright paths · easy traverse'},
      {diff:'medium',name:'Stalactite Run',     id:'stalactite_run',  minutes:20, tip:'Dodge stalactites · faster pace'},
      {diff:'hard',  name:'Deep Cave Descent',  id:'deep_cave',       minutes:30, tip:'Pitch dark · complex route · reach the bottom'},
    ],
  },
  {
    id:'temple', icon:'🏛️', name:'Ancient Temple', color:'#d97706',
    desc:'Survive ancient traps, pressure plates and temple guardians',
    duration:'15-30 min', focus:'Puzzle + Combat',
    xp:{easy:100,medium:200,hard:300},
    rec:['humanoid','spider','rover'], ok:['tank'], bad:['drone','jet','underwater'],
    variants:[
      {diff:'easy',  name:'Temple Run',        id:'temple_run',     minutes:15, tip:'Classic escape · avoid traps · reach the exit'},
      {diff:'medium',name:'Pressure Path',     id:'pressure_path',  minutes:20, tip:'Step on plates in order · read the symbols'},
      {diff:'hard',  name:'Guardian Challenge',id:'guardian_fight', minutes:30, tip:'Defeat the temple guardians · ultimate test'},
    ],
  },
  {
    id:'puzzle', icon:'🧩', name:'Puzzle', color:'#a855f7',
    desc:'Solve ancient logic challenges and environmental brain-teasers',
    duration:'15-30 min', focus:'Problem-solving',
    xp:{easy:100,medium:200,hard:300},
    rec:['rover','humanoid','spider'], ok:['tank','hover'], bad:[],
    variants:[
      {diff:'easy',  name:'Checkpoint Run',   id:'checkpoint',    minutes:12, tip:'Hit every checkpoint · learn the arena'},
      {diff:'medium',name:'Pressure Path',    id:'pressure_path', minutes:20, tip:'Temple logic · activate plates in order'},
      {diff:'hard',  name:'Idol Heist',       id:'idol_heist',    minutes:30, tip:'Grab the idol and escape · multi-stage challenge'},
    ],
  },
  {
    id:'speedrun', icon:'⚡', name:'Speed Run', color:'#fbbf24',
    desc:'Blast through the course as fast as possible and top the leaderboard',
    duration:'5-15 min', focus:'Optimization + Records',
    xp:{easy:100,medium:200,hard:300},
    rec:['rover','hover','drone','racedrone'], ok:['humanoid','spider'], bad:['factory','tank'],
    variants:[
      {diff:'easy',  name:'Simple Sprint',  id:'run_easy',   minutes:5,  tip:'Forest sprint · 5-min target · beginner friendly'},
      {diff:'medium',name:'Optimized Race', id:'run_medium', minutes:10, tip:'Neon circuit · 3-min target · plan your path'},
      {diff:'hard',  name:'Drift King',     id:'drift_king', minutes:15, tip:'Perfect drift lines · sub 2-min target'},
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROBOT COURSE ACCESS — which course types each robot can play
// ─────────────────────────────────────────────────────────────────────────────
const ROBOT_COURSE_ACCESS = {
  rover:      ['racing','forest','cavern','puzzle','speedrun'],
  spider:     ['racing','forest','cavern','temple','puzzle'],
  drone:      ['racing','speedrun'],
  racedrone:  ['racing','speedrun'],
  jet:        ['racing','speedrun'],
  hover:      ['racing','forest','speedrun'],
  tank:       ['racing','forest','temple','puzzle'],
  factory:    ['puzzle','forest'],
  factorybot: ['puzzle','forest'],
  humanoid:   ['forest','cavern','temple','puzzle','racing','speedrun'],
  underwater: ['puzzle','racing'],
  security:   ['racing','forest'],
  medbot:     ['forest','puzzle'],
  firebot:    ['forest','puzzle'],
};
const ROBOT_UNAVAIL_REASON = {
  racing:  { factory:"Industrial arm — not race-ready", factorybot:"Factory bot — no racing mode", underwater:"Sub — can't race on ground", medbot:"Medical bot — not a racer", firebot:"Fire truck — too slow" },
  forest:  { drone:"Aerial only — can't traverse forest floor", racedrone:"Speed racer — no terrain mode", jet:"Jet — not for ground traversal", underwater:"Sub — land environments only" },
  cavern:  { drone:"Aerial only — caves are ground traversal", racedrone:"Speed racer — no cave mode", jet:"Jet — not for cave exploration", hover:"Hover — tight cave spaces", tank:"Too wide for cavern passages", underwater:"Sub — land environments only", security:"Patrol bot — no cave mode", medbot:"Medical bot — no cave mode", firebot:"Fire truck — no cave mode" },
  temple:  { drone:"Aerial only — temple is ground traversal", racedrone:"Speed racer — no temple mode", jet:"Jet — not for temple exploration", hover:"Hover — not suited for temple puzzles", underwater:"Sub — land environments only", factory:"Factory arm — no temple mode", factorybot:"Too slow for temple", security:"Patrol bot — no temple mode", medbot:"Medical bot — no temple mode", firebot:"Fire truck — no temple mode" },
  puzzle:  { racedrone:"Speed racer — not puzzle-focused", jet:"Fighter — not puzzle-designed", drone:"Delivery drone — not puzzle-ready" },
  speedrun:{ factory:"Industrial arm — slow mover", factorybot:"Too slow for speed runs", underwater:"Sub — not for speed runs", medbot:"Medical bot — too slow", firebot:"Fire truck — too slow" },
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE STORIES — narrative + objectives for each course variant
// ─────────────────────────────────────────────────────────────────────────────
const COURSE_STORIES = {
  ...buildFlagshipStories(),
  // ── Forest / Ground ────────────────────────────────────────────────────────
  fox_battery_chase: { emoji:'🦊', story:"A mysterious fox stole the forest battery! Follow glowing paw prints through 9 magical zones — meadow, river, root gate, windy canyon, fox chase, hidden cave, escape bridge — to restore power at the shrine.", objectives:["Clear all 9 zones in order","Collect 50+ coins & gems","Reach the Power Shrine in 23 min"], tip:"Follow the blue paw prints in Zone 2. Collect coins on stepping stones at the river!", collectibles:"150+ coins · shields · rare gems · shrine crystal" },
  obstacle:     { emoji:'🏁', story:"The Whispering Forest calls. Logs, roots and stone walls block your path — navigate through all 9 zones to reach the Power Shrine!", objectives:["Clear all 9 zones","Collect 20+ coins","Finish in under 6 minutes"], tip:"Slow down for root gates — then boost through open meadows!", collectibles:"25 coins · 3 shields · 2 speed boosts" },
  race_track:   { emoji:'🏎️', story:"Race the winding forest path from the wooden arch gate to the ancient shrine. Speed and precision win this one!", objectives:["Reach the finish","Beat the time target","Collect 15+ coins"], tip:"Hug the stone path — grass edges slow you down!", collectibles:"20 coins · 2 speed pads" },
  maze:         { emoji:'🌀', story:"The forest maze shifts with fog and shadow. Follow paw prints, find the bridge, and escape the deep woods before darkness falls.", objectives:["Navigate all 9 zones","Find the exit","Collect 10+ gems"], tip:"Paw prints glow faintly — follow them when lost!", collectibles:"15 gems · 20 coins · hidden treasures" },
  cargo:        { emoji:'📦', story:"Supply crates are scattered across the forest. Collect and deliver them to the Power Shrine before the forest spirits reclaim them!", objectives:["Deliver all crates","Complete in under 5 minutes","No drops"], tip:"Use the stone path — off-road slows cargo bots!", collectibles:"6 crates · 10 coins" },
  speedrun:     { emoji:'⚡', story:"Full speed through the Whispering Forest — wooden gate to power shrine in record time. Every second counts!", objectives:["Beat the clock","Reach the shrine","Zero collisions"], tip:"The stone path is fastest — never leave it!", collectibles:"5 coins · 1 speed boost" },
  line_follow:  { emoji:'〰', story:"A glowing trail winds through the arena. Keep your robot on the line — perfect tracking earns the highest score!", objectives:["Follow the line","Zero departures","Complete the full loop"], tip:"Use the LINE_DETECT sensor — don't just guess the path!", collectibles:"10 coins along the trail" },
  precision:    { emoji:'🎯', story:"Park precisely inside glowing target circles across the forest floor. Accuracy wins more points than speed here!", objectives:["Hit all target zones","Center parking bonus","Complete in under 4 minutes"], tip:"Slow down 2 meters before each zone — brake precisely!", collectibles:"8 targets · 5 coins each" },
  stem_play:    { emoji:'🔬', story:"The forest is a natural science lab! Scan objects, measure distances, and explore 9 zones of hands-on STEM challenges.", objectives:["Complete all 9 challenges","Scan 10+ objects","Collect all data logs"], tip:"Use LIDAR_SCAN near every glowing object!", collectibles:"10 data logs · 15 coins · 3 gems" },
  checkpoint:   { emoji:'📍', story:"Glowing checkpoints are hidden across all 9 forest zones. Hit every one in order — miss one and the timer resets!", objectives:["Hit all checkpoints in order","Complete in under 7 minutes","No missed checkpoints"], tip:"Look for the green glow between tree lines!", collectibles:"9 checkpoints · 20 coins" },
  run_easy:     { emoji:'🟢', story:"A short forest sprint — wooden arch to the meadow. 5-minute target, clear path, perfect for your first run!", objectives:["Complete in under 5 minutes","Collect all 3 coins","Beat your personal best"], tip:"Fire the ACCELERATE block the instant the timer starts!", collectibles:"3 coins · 1 speed pad · 1 checkpoint" },
  // ── AI / Sensor ────────────────────────────────────────────────────────────
  ai_training:  { emoji:'🧠', story:"The Whispering Forest is your training ground. Navigate 9 zones using only your AI sensors — no manual override allowed!", objectives:["Complete 9 zones autonomously","Scan 15+ objects","Zero manual inputs"], tip:"Train your obstacle avoidance before the final canyon!", collectibles:"20 coins · 5 data beacons" },
  stealth:      { emoji:'👻', story:"Sensor towers scan the forest. Move through shadows, time your dashes between detection beams, and reach the shrine unseen!", objectives:["Reach the shrine","Zero detections","Use stealth mode in every zone"], tip:"Wait for the sensor sweep to pass — then sprint!", collectibles:"15 coins · 3 stealth pickups" },
  obj_detect:   { emoji:'👁',  story:"Ancient artifacts are scattered across all 9 forest zones. Scan and log every one — your sensor accuracy determines your score!", objectives:["Scan 25+ objects","100% scan accuracy","Complete in under 8 minutes"], tip:"Hold still when scanning — movement reduces accuracy!", collectibles:"25 artifacts · 20 coins" },
  smart_patrol: { emoji:'🏙️', story:"Patrol all 9 sectors of the forest arena. Map every zone, log every anomaly, and report back to base — in order!", objectives:["Patrol all 9 sectors","Log all anomalies","Complete the circuit"], tip:"Use COMPASS to track your sector count!", collectibles:"9 sector logs · 15 coins" },
  auto_nav:     { emoji:'🗺️', story:"Navigate the full forest — all 9 zones — using only your onboard map and sensors. No hints. Total autonomy.", objectives:["Navigate all 9 zones","Zero manual assists","Find the Power Shrine"], tip:"Build a waypoint list at the start — execute it perfectly!", collectibles:"20 coins · 5 hidden gems" },
  // ── Crystal Cavern ─────────────────────────────────────────────────────────
  crystal_cave:    { emoji:'💎', story:"Glowing crystals light the underground. Navigate all 9 cavern zones — from the entrance to the legendary Gemstone Throne!", objectives:["Reach the Gemstone Throne","Collect 15+ crystals","Complete 9 zones"], tip:"Crystal clusters mark safe paths — follow the purple glow!", collectibles:"20 crystals · 15 coins · 3 gems" },
  stalactite_run:  { emoji:'🦇', story:"Stalactites drop from the ceiling without warning. Dash through 9 underground chambers before the cavern collapses!", objectives:["Complete 9 zones","Zero stalactite hits","Beat the clock"], tip:"Listen for the cracking sound — a stalactite is about to fall!", collectibles:"15 coins · 4 shields" },
  cavern_boss:     { emoji:'🕷️', story:"The crystal spider guardian awakens. Survive the Cavern Boss across all 9 zones — reach the Gemstone Throne to claim victory!", objectives:["Defeat the Cavern Boss","Survive all 9 zones","Collect the throne gem"], tip:"The boss is slower in crystal clusters — use them as cover!", collectibles:"25 coins · boss treasure (200 pts)" },
  deep_cave:       { emoji:'🌑', story:"No light. No map. Only your sensors guide you through 9 pitch-dark cavern zones to the deepest point of the ancient underground.", objectives:["Reach Zone 9","Navigate in darkness","Discover 5 hidden chambers"], tip:"LIDAR_SCAN returns wall distances — use them to build a mental map!", collectibles:"20 coins · 5 hidden chambers · ancient relic" },
  // ── Neon Racing Circuit ────────────────────────────────────────────────────
  neon_race:    { emoji:'🏎️', story:"The neon circuit blazes to life. Starting grid to finish line — 9 zones of pure speed through the city circuit. Race!", objectives:["Finish the circuit","Beat the target time","Collect 20+ coins"], tip:"Hit the boost pads in Zone 2 — they're worth the line!", collectibles:"25 coins · 4 boost pads · 2 shields" },
  neon_chase:   { emoji:'🚓', story:"A rogue bot has stolen cargo from the city! Chase it through 9 neon zones — catch it before it reaches the exit!", objectives:["Catch the runaway bot","Complete in under 4 minutes","No shortcuts"], tip:"The target bot slows in the drift hairpin — plan your intercept!", collectibles:"15 coins · 3 speed boosts" },
  drift_king:   { emoji:'🌀', story:"This circuit rewards style. Master the drift lines through 9 zones — perfect drifts multiply your score!", objectives:["Complete the circuit","10+ perfect drifts","Top the leaderboard"], tip:"Enter turns wide, hit the apex, exit with throttle — classic drift!", collectibles:"20 coins · drift bonus points" },
  turbo_league: { emoji:'⚡', story:"First bot to cross the finish line wins. Boost pads, scanner lanes, neon city skyline — 9 zones of pure race to the end!", objectives:["Cross the finish first","Use 3+ boost pads","Complete in under 3 minutes"], tip:"The boost corridor in Zone 7 gives the biggest speed gain!", collectibles:"20 coins · 5 boost pads · 1 trophy (100 pts)" },
  run_medium:   { emoji:'🏆', story:"Three different routes through the neon circuit. Each has trade-offs. Which path does your algorithm choose? The 3-minute record awaits.", objectives:["Complete in under 3 minutes","Test all 3 routes","Beat the world record"], tip:"The middle route looks longer but has fewer turns — do the math!", collectibles:"8 coins · 3 routes · split times per checkpoint" },
  // ── Ancient Temple ─────────────────────────────────────────────────────────
  temple_run:    { emoji:'🏛️', story:"The ancient temple awakens with traps and pendulums. Race through all 9 zones — reach the Idol Chamber before the walls close!", objectives:["Complete 9 zones","Avoid all traps","Reach the Idol Chamber"], tip:"Traps have rhythms — watch 2 cycles before you dash!", collectibles:"20 coins · 4 shields · 3 gems" },
  pressure_path: { emoji:'⬛', story:"Temple pressure plates must be activated in exact order. Wrong steps trigger ancient traps. Read the symbols — they hold the answer!", objectives:["Find the correct sequence","Activate all plates","Avoid every trap"], tip:"Wall symbols hint at the activation order — look carefully!", collectibles:"50 coins · 5 ancient artifacts" },
  idol_heist:    { emoji:'🏺', story:"The legendary idol sits at the heart of the temple. Grab it and escape through 9 guardian-filled zones — but every step triggers something!", objectives:["Grab the idol","Escape the temple","Survive all 9 zones"], tip:"Once you grab the idol, go fast — every trap activates!", collectibles:"30 coins · 1 legendary idol (500 pts)" },
  guardian_fight:{ emoji:'⚔️', story:"Four temple guardians block the path to the Inner Sanctum. Battle through 9 zones — defeat each guardian to claim the ancient power!", objectives:["Defeat all 4 guardians","Reach the Inner Sanctum","Complete 9 zones"], tip:"Each guardian has a weak point — scan them before engaging!", collectibles:"30 coins · 4 guardian drops · ancient power (300 pts)" },
};

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

  // ── Gripper-specific block sets ─────────────────────────────────────────
  const gType = detectGripperType(rc);
  const _gripperBlocks = (() => {
    if (!gType) return [];
    const base = [b('gripper_scan_area'),b('gripper_grab'),b('gripper_release'),b('gripper_check_cargo')];
    if (gType === 'humanoid_basic') return [...base,b('gripper_grab_left'),b('gripper_grab_right'),b('gripper_grab_both'),b('gripper_release_left'),b('gripper_release_right')];
    if (gType === 'dual')           return [...base,b('gripper_grab_left'),b('gripper_grab_right'),b('gripper_grab_both'),b('gripper_release_left'),b('gripper_release_right'),b('gripper_release_both')];
    if (gType === 'power')          return [...base,b('gripper_grip_force'),b('gripper_measure_weight')];
    if (gType === 'hydraulic')      return [...base,b('gripper_grip_force'),b('gripper_power_grip'),b('gripper_measure_weight')];
    if (gType === 'precision')      return [b('gripper_detect_delicate'),b('gripper_grab_gentle'),b('gripper_release_carefully'),b('gripper_grip_sensitivity'),b('gripper_check_cargo')];
    return base; // basic
  })();

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
               b('robot_rotate_place'),b('robot_climb_mode'),b('robot_power_mode'),b('robot_stop'),b('robot_boost'),
               b('robot_brake'),b('robot_set_speed'),b('robot_spin'),b('robot_emergency_stop'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_collision'),b('robot_battery_low'),b('robot_scan'),
               b('robot_terrain_detect'),b('robot_motion_detect'),b('robot_distance_wall'),
               b('robot_temperature'),b('robot_timer_start'),b('robot_timer_done'),
               b('robot_counter_increment'),b('robot_counter_value'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),b('robot_guard_area'),
               b('robot_map_env'),b('robot_predict_obstacle'),b('robot_explore_area'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_push_object'),b('robot_tool_change'),b('robot_emergency_lights'),b('robot_alarm_sound'),
                    ...(hasTool('grabber','claw')?[b('robot_grab'),b('robot_release')]:[] )];
      break;

    case 'drone':
      move  = [b('robot_takeoff'),b('robot_land'),
               b('robot_fly_forward'),b('robot_fly_backward'),b('robot_fly_left'),b('robot_fly_right'),
               b('robot_fly_up'),b('robot_fly_down'),
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
      move  = [b('robot_fly_forward'),b('robot_fly_backward'),b('robot_fly_left'),b('robot_fly_right'),
               b('robot_fly_up'),b('robot_fly_down'),
               b('robot_thrust'),b('robot_roll_left'),b('robot_roll_right'),
               b('robot_pitch_up'),b('robot_pitch_down'),
               b('robot_glide'),b('robot_jet_boost'),b('robot_loop_maneuver'),b('robot_stop'),
               b('robot_barrel_roll'),b('robot_split_s'),b('robot_immelmann'),
               b('robot_stall_recovery'),b('robot_yaw'),b('robot_air_brake'),
               b('robot_boost_flight'),b('robot_set_speed'),b('robot_maintain_altitude'),b('robot_wind_correction'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_aerial_scan'),b('robot_terrain_detect'),
               b('robot_altitude'),b('robot_get_speed'),b('robot_tilt'),b('robot_target_found'),
               b('robot_motion_detect'),b('robot_timer_start'),b('robot_timer_done')];
      ai    = [b('robot_avoid_air_obstacle'),b('robot_return_home'),b('robot_autopilot_wp'),b('robot_follow_beacon'),
               b('robot_formation_fly'),b('robot_follow_target'),b('robot_predict_obstacle'),b('robot_eval_strategy')];
      toolBlocks = [b('robot_emergency_lights'),b('robot_flash_leds'),b('robot_custom_sound'),
                    ...(hasSens('camera')?[b('robot_aerial_tracking'),b('robot_scan_object')]:[] )];
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
      move  = [b('robot_fly_forward'),b('robot_fly_backward'),b('robot_fly_left'),b('robot_fly_right'),
               b('robot_fly_up'),b('robot_fly_down'),
               b('robot_hover_stabilize'),b('robot_float_up'),
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
               b('robot_navigate_to'),b('robot_return_home'),b('robot_emergency_stop'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_motion_detect'),b('robot_collision'),
               b('robot_scan'),b('robot_distance_wall'),b('robot_temperature'),
               b('robot_timer_start'),b('robot_timer_done'),b('robot_counter_increment'),b('robot_counter_value'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found'),b('robot_color_detect')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_follow_target'),b('robot_return_home'),
               b('robot_search_area'),b('robot_map_env'),b('robot_eval_strategy'),
               b('robot_patrol_area'),b('robot_locate_object'),b('robot_priority_decision')];
      toolBlocks = [b('robot_led_color'),b('robot_emergency_lights'),b('robot_custom_sound'),b('robot_display_text'),
                    b('robot_scan_object'),b('robot_grab'),b('robot_release'),b('robot_place_item'),b('robot_alarm_sound')];
      break;

    case 'firebot':
      move  = [b('robot_move_forward'),b('robot_move_backward'),b('robot_turn_left'),b('robot_turn_right'),
               b('robot_stop'),b('robot_set_speed'),b('robot_spin'),b('robot_brake'),
               b('robot_navigate_to'),b('robot_return_home'),b('robot_emergency_stop'),b('robot_boost'),b('robot_wait')];
      sense = [b('robot_obstacle_ahead'),b('robot_battery_low'),b('robot_motion_detect'),b('robot_collision'),
               b('robot_temperature'),b('robot_scan'),b('robot_distance_wall'),
               b('robot_terrain_detect'),b('robot_timer_start'),b('robot_timer_done'),
               b('robot_counter_increment'),b('robot_counter_value'),
               ...(hasSens('camera')?[b('robot_see_object'),b('robot_target_found'),b('robot_thermal_scan')]:[] )];
      ai    = [b('robot_avoid_obstacle'),b('robot_patrol_area'),b('robot_return_home'),
               b('robot_search_area'),b('robot_guard_area'),b('robot_eval_strategy'),
               b('robot_follow_target'),b('robot_map_env'),b('robot_priority_decision')];
      toolBlocks = [b('robot_emergency_lights'),b('robot_activate_alarm'),b('robot_custom_sound'),b('robot_display_text'),
                    b('robot_push_object'),b('robot_grab'),b('robot_release'),b('robot_alarm_sound'),b('robot_warning_lights')];
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

  // Append gripper blocks to tools if robot has a gripper
  const finalToolsWithGripper = _gripperBlocks.length > 0
    ? [..._gripperBlocks, { kind:'sep' }, ...finalTools]
    : finalTools;

  const contents = [
    { kind:'category', name:'⚡ Events',      colour:'#e11d48', contents:[b('robot_when_start')] },
    { kind:'category', name:'🚀 Move',        colour:'#3b82f6', contents:move },
    { kind:'category', name:'🔁 Control',     colour:'#f97316', contents:ctrl },
    { kind:'category', name:'👁 Sensors',     colour:'#22c55e', contents:sense },
    { kind:'category', name:'🧠 AI',          colour:'#a855f7', contents:ai },
    { kind:'category', name:'⚙️ Tools',       colour:'#ec4899', contents:finalToolsWithGripper },
    { kind:'category', name:'💡 Lights',      colour:'#06b6d4', contents:lights },
    { kind:'category', name:'📦 Variables',    colour:'#f59e0b', contents:vars },
    ...(_gripperBlocks.length > 0 ? [{ kind:'category', name:'🦾  Gripper',   colour:'#22c55e', contents:_gripperBlocks }] : []),
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
    // ── GRIPPER SYSTEM blocks ───────────────────────────────────────────────
    else if (t === 'gripper_scan_area')
      acts.push({ id:'gripper_scan',   cat:'sense',  icon:'📡', label:'Scan Area',    blocklyId:bid, paramValues:{} });
    else if (t === 'gripper_grab')
      acts.push({ id:'gripper_grab',   cat:'tools',  icon:'✊', label:'Grab Item',    blocklyId:bid, paramValues:{} });
    else if (t === 'gripper_release')
      acts.push({ id:'gripper_release',cat:'tools',  icon:'📦', label:'Deliver',      blocklyId:bid, paramValues:{} });
    else if (t === 'gripper_check_cargo')
      acts.push({ id:'gripper_check',  cat:'sense',  icon:'⚖️', label:'Check Cargo',  blocklyId:bid, paramValues:{} });
    else if (t === 'gripper_grab_left')
      acts.push({ id:'gripper_grab_L', cat:'tools',  icon:'✊', label:'Grab Left',    blocklyId:bid, paramValues:{side:'left'} });
    else if (t === 'gripper_grab_right')
      acts.push({ id:'gripper_grab_R', cat:'tools',  icon:'✊', label:'Grab Right',   blocklyId:bid, paramValues:{side:'right'} });
    else if (t === 'gripper_grab_both')
      acts.push({ id:'gripper_grab_B', cat:'tools',  icon:'🤲', label:'Grab Both',    blocklyId:bid, paramValues:{side:'both'} });
    else if (t === 'gripper_release_left')
      acts.push({ id:'gripper_rel_L',  cat:'tools',  icon:'👐', label:'Release Left', blocklyId:bid, paramValues:{side:'left'} });
    else if (t === 'gripper_release_right')
      acts.push({ id:'gripper_rel_R',  cat:'tools',  icon:'👐', label:'Release Right',blocklyId:bid, paramValues:{side:'right'} });
    else if (t === 'gripper_release_both')
      acts.push({ id:'gripper_rel_B',  cat:'tools',  icon:'👐', label:'Release Both', blocklyId:bid, paramValues:{side:'both'} });
    else if (t === 'gripper_grip_force')
      acts.push({ id:'gripper_force',  cat:'tools',  icon:'💪', label:'Grip Force',   blocklyId:bid, paramValues:{force: +block.getFieldValue('FORCE')||10} });
    else if (t === 'gripper_power_grip')
      acts.push({ id:'gripper_power',  cat:'tools',  icon:'🦾', label:'Power Grip',   blocklyId:bid, paramValues:{force:100} });
    else if (t === 'gripper_measure_weight')
      acts.push({ id:'gripper_weigh',  cat:'sense',  icon:'⚖️', label:'Measure Wt',  blocklyId:bid, paramValues:{} });
    else if (t === 'gripper_grab_gentle')
      acts.push({ id:'gripper_gentle', cat:'tools',  icon:'🎯', label:'Grab Gentle',  blocklyId:bid, paramValues:{gentle:true} });
    else if (t === 'gripper_release_carefully')
      acts.push({ id:'gripper_care',   cat:'tools',  icon:'🎯', label:'Rel. Careful', blocklyId:bid, paramValues:{careful:true} });
    else if (t === 'gripper_detect_delicate')
      acts.push({ id:'gripper_fragile',cat:'sense',  icon:'💎', label:'Detect Fragile',blocklyId:bid,paramValues:{} });
    else if (t === 'gripper_grip_sensitivity')
      acts.push({ id:'gripper_sens',   cat:'tools',  icon:'🎯', label:'Sensitivity',  blocklyId:bid, paramValues:{level: +block.getFieldValue('LEVEL')||3} });
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
  const type  = detectRobotType(rc);
  const pd    = PROFILE_DATA[type] || PROFILE_DATA.rover;
  const recCourses = filterCoursesForRobot(ALL_COURSES, type, pd.recKeys);
  const missionDefault = recCourses[0];
  const rest = recCourses.filter((c) => c.id !== missionDefault?.id).slice(0, 3);
  const picked = [missionDefault, ...rest].filter(Boolean).slice(0, 4);
  const challenges = picked.map((c) => enrichCourseWithGameLogic(c));
  return { ...pd, challenges };
}

// ══════════════════════════════════════════════════════════════════════════════
// AAA ZONE PROGRESSION HELPERS — numbered beacons, collectibles, path guides
// ══════════════════════════════════════════════════════════════════════════════

/** Place a zone waypoint — natural standing stone with a glowing crystal (no UI badge) */
function _zoneMarker(g, scene, x, z, num, col) {
  const hexCol = parseInt(col.replace('#',''), 16);
  const stoneM = new THREE.MeshStandardMaterial({ color: 0x5a5448, roughness: 0.95, metalness: 0.04 });
  const mossM = new THREE.MeshStandardMaterial({ color: 0x3a5c1e, roughness: 0.98, emissive: 0x1a3008, emissiveIntensity: 0.08 });
  // Weathered standing stone — taller for later zones so progression reads naturally
  const h = 1.6 + (num % 3) * 0.35;
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, h, 6), stoneM);
  stone.position.set(x, h / 2, z);
  stone.rotation.y = num * 0.7; stone.rotation.z = (num % 2 ? 1 : -1) * 0.05;
  g.add(stone);
  // Two tumbled base rocks
  for (let i = 0; i < 2; i++) {
    const br = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + i * 0.08, 0), stoneM);
    const ba = num * 1.3 + i * Math.PI;
    br.position.set(x + Math.cos(ba) * 0.5, 0.12, z + Math.sin(ba) * 0.45);
    br.rotation.y = ba; g.add(br);
  }
  // Moss cap on the stone's shoulder
  const moss = new THREE.Mesh(new THREE.SphereGeometry(0.26, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.4), mossM);
  moss.position.set(x - 0.05, h - 0.08, z); g.add(moss);
  // Glowing crystal embedded at the top — zone color, pulses via 'cp' tick animation
  const crysM = new THREE.MeshStandardMaterial({ color: hexCol, emissive: hexCol, emissiveIntensity: 1.1, transparent: true, opacity: 0.92, roughness: 0.15 });
  const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), crysM);
  crys.position.set(x, h + 0.28, z); crys.name = 'cp'; g.add(crys);
  // Soft floor glow ring around the stone
  const fGlow = new THREE.Mesh(new THREE.CircleGeometry(1.6, 18),
    new THREE.MeshBasicMaterial({ color: hexCol, transparent: true, opacity: 0.07, depthWrite: false }));
  fGlow.rotation.x = -Math.PI/2; fGlow.position.set(x, 0.012, z); g.add(fGlow);
}

/** Zone entrance arch gate spanning the track */
function _zoneArch(g, x, z, col, halfW = 5.5, height = 4.8) {
  const hexCol = parseInt(col.replace('#',''), 16);
  const mat = new THREE.MeshStandardMaterial({ color: hexCol, emissive: hexCol, emissiveIntensity: 1.3, transparent: true, opacity: 0.9 });
  // Vertical pillars
  [-halfW, halfW].forEach(px => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, height, 8), mat);
    post.position.set(x + px, height / 2, z); g.add(post);
  });
  // Horizontal beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 + 0.28, 0.22, 0.22), mat);
  beam.position.set(x, height, z); g.add(beam);
  // Floor glow line
  const fLine = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2, 0.16),
    new THREE.MeshBasicMaterial({ color: hexCol, transparent: true, opacity: 0.5, depthWrite: false }));
  fLine.rotation.x = -Math.PI/2; fLine.position.set(x, 0.018, z); g.add(fLine);
}

/** Generate random coin positions within a rectangular zone */
function _coinGrid(cx, cz, w, d, count, yOff = 0.35) {
  const pts = [];
  // Capped density — keeps zones readable instead of carpeted in gold
  const n = Math.min(count, Math.max(4, Math.round(count * 0.5)));
  for (let i = 0; i < n; i++) {
    pts.push([cx + (Math.random() - 0.5) * w, yOff, cz + (Math.random() - 0.5) * d]);
  }
  return pts;
}

/** Populate scene.userData.collectibles with golden coins */
function _placeCoins(scene, g, pts, value = 5) {
  if (!scene.userData.collectibles) scene.userData.collectibles = [];
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.9, metalness: 0.85, roughness: 0.12 });
  const coinGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.07, 10);
  pts.forEach(([x, y, z]) => {
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.position.set(x, y, z); coin.rotation.x = Math.PI / 2;
    g.add(coin);
    scene.userData.collectibles.push({ mesh: coin, pos: new THREE.Vector3(x, y, z), radius: 0.82, value, collected: false });
  });
}

/** Populate scene.userData.collectibles with blue shield gems */
function _placeShields(scene, g, pts) {
  if (!scene.userData.collectibles) scene.userData.collectibles = [];
  const shMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.85, metalness: 0.65, roughness: 0.25 });
  const shGeo = new THREE.OctahedronGeometry(0.26, 0);
  pts.forEach(([x, y, z]) => {
    const sh = new THREE.Mesh(shGeo, shMat);
    sh.position.set(x, y || 0.42, z); sh.name = 'shield';
    g.add(sh);
    scene.userData.collectibles.push({ mesh: sh, pos: new THREE.Vector3(x, y || 0.42, z), radius: 0.88, value: 20, collected: false });
  });
}

/** Populate scene.userData.collectibles with rare purple gems */
function _placeGems(scene, g, pts) {
  if (!scene.userData.collectibles) scene.userData.collectibles = [];
  const gemMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.2, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.92 });
  const gemGeo = new THREE.OctahedronGeometry(0.22, 1);
  pts.forEach(([x, y, z]) => {
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(x, y || 0.5, z); gem.name = 'gem';
    g.add(gem);
    scene.userData.collectibles.push({ mesh: gem, pos: new THREE.Vector3(x, y || 0.5, z), radius: 0.75, value: 50, collected: false });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ARENA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function _groundArena(scene,ch){
  const g=new THREE.Group(); g.name='arena';
  const isFox=ch?.id==='fox_battery_chase'||ch?.isFoxChase;
  const dist=Math.max(isFox?56:48,(ch?.totalDist||30)*1.4);
  const finishZ=4-dist;
  const floorLen=dist+22;
  const centerZ=(4+finishZ)/2;
  let riverMesh=null;
  let riverShim=null;

  // ── PER-COURSE PROFILE — each mission gets its own sky, fog, hazards & feel ──
  const FOREST_PROFILES={
    // light: [ambient×, hemi×, sun×, optional sun color] · exp: tone-mapping exposure×
    full: {sky:['#c87c28','#8a4c14','#1e3060','#080c1a'], fog:[0x5a3010,0.007], clutter:1.0,  boulder:true,  drone:true,  rocks:true,  light:[1.0,1.0,1.0], exp:1.0},
    race: {sky:['#7ec8f0','#ffd989','#6a9c45','#0c1a0a'], fog:[0x23481c,0.006], clutter:0.4,  boulder:false, drone:false, rocks:false, light:[1.0,1.0,1.0], exp:1.0},
    maze: {sky:['#3a5068','#a07040','#2a4820','#060d04'], fog:[0x102808,0.018], clutter:0.85, boulder:true,  drone:false, rocks:false, light:[0.72,0.62,0.52,0xd8c8a0], exp:0.88},
    night:{sky:['#060c1a','#12203a','#101e14','#020602'], fog:[0x060c18,0.014], clutter:0.6,  boulder:false, drone:true,  rocks:false, light:[0.3,0.22,0.16,0x9ab8ff], exp:0.60},
    dusk: {sky:['#4a3870','#c86840','#3a5020','#080e08'], fog:[0x182010,0.010], clutter:0.7,  boulder:false, drone:true,  rocks:false, light:[0.68,0.58,0.48,0xff7a50], exp:0.82},
    calm: {sky:['#6ab8d8','#e8b858','#4a7830','#080e08'], fog:[0x182c10,0.008], clutter:0.7,  boulder:false, drone:false, rocks:false, light:[1,1,1], exp:1},
  };
  const FOREST_COURSE_PROFILE={
    obstacle:'full', fox_battery_chase:'full',
    race_track:'race', speedrun:'race', run_easy:'race',
    maze:'maze', stealth:'night',
    ai_training:'dusk', obj_detect:'dusk', smart_patrol:'dusk', auto_nav:'dusk',
    cargo:'calm', precision:'calm', stem_play:'calm', checkpoint:'calm',
  };
  const prof=FOREST_PROFILES[FOREST_COURSE_PROFILE[ch?.id]||'full'];
  if(isFox){ prof.boulder=true; prof.drone=true; prof.rocks=true; prof.clutter=0; }
  scene.userData.lightMood=prof.light; // consumed by SimCanvas after build
  scene.userData.expMood=prof.exp;

  // ── PROCEDURAL CANVAS TEXTURES ───────────────────────────────────────────────
  const _mkTex=(w,h,fn)=>{
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const ctx=c.getContext('2d'); fn(ctx,w,h);
    const t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
  };

  // ── SKY — gradient varies per course profile ─────────────────────────────────
  const _skyTex=_mkTex(4,512,(ctx,w,h)=>{
    const grd=ctx.createLinearGradient(0,0,0,h);
    grd.addColorStop(0,prof.sky[0]); grd.addColorStop(0.35,prof.sky[1]); grd.addColorStop(0.7,prof.sky[2]); grd.addColorStop(1,prof.sky[3]);
    ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
  });
  _skyTex.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=_skyTex;
  scene.fog=new THREE.FogExp2(prof.fog[0],prof.fog[1]);
  const grassTex=_mkTex(256,256,(ctx,w,h)=>{
    ctx.fillStyle='#2a5a1a'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<2800;i++){
      const x=Math.random()*w,y=Math.random()*h;
      ctx.strokeStyle=Math.random()>0.55?'#3a7a28':'#1e4010';
      ctx.lineWidth=Math.random()*1.4+0.4;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(Math.random()-0.5)*4,y-Math.random()*8); ctx.stroke();
    }
    for(let i=0;i<12;i++){
      const x=Math.random()*w,y=Math.random()*h,r=8+Math.random()*18;
      const grd=ctx.createRadialGradient(x,y,0,x,y,r);
      grd.addColorStop(0,'rgba(8,18,6,0.35)'); grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  }); grassTex.repeat.set(8,floorLen/4);
  const stoneTex=_mkTex(256,256,(ctx,w,h)=>{
    ctx.fillStyle='#b8824f'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<12;i++){
      const x=(i%4)*64,y=Math.floor(i/4)*64,s=0.8+Math.random()*0.3;
      ctx.fillStyle=`rgba(${Math.floor(s*138)},${Math.floor(s*120)},${Math.floor(s*104)},0.5)`;
      ctx.fillRect(x+2,y+2,60,60);
    }
    ctx.strokeStyle='rgba(55,40,25,0.65)'; ctx.lineWidth=1;
    for(let i=0;i<18;i++){
      ctx.beginPath(); let cx2=Math.random()*w,cy2=Math.random()*h; ctx.moveTo(cx2,cy2);
      for(let j=0;j<4;j++){cx2+=(Math.random()-0.5)*14;cy2+=(Math.random()-0.5)*14;ctx.lineTo(cx2,cy2);}
      ctx.stroke();
    }
    for(let i=0;i<6;i++){
      const x=Math.random()*w,y=Math.random()*h,r=4+Math.random()*9;
      ctx.fillStyle='rgba(55,90,35,0.28)'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  }); stoneTex.repeat.set(4,dist/4);
  const barkTex=_mkTex(64,128,(ctx,w,h)=>{
    ctx.fillStyle='#5c3a1e'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(28,12,4,0.7)'; ctx.lineWidth=1.5;
    for(let y=0;y<h;y+=4+Math.random()*3){
      ctx.beginPath(); ctx.moveTo(0,y);
      for(let x=0;x<w;x+=6) ctx.lineTo(x+(Math.random()-0.5)*2.5,y+(Math.random()-0.5)*1.5);
      ctx.stroke();
    }
  }); barkTex.repeat.set(2,3);

  // ── GROUND ───────────────────────────────────────────────────────────────────
  const grassMat=new THREE.MeshStandardMaterial({map:grassTex,color:0x2d5a2d,roughness:0.92,metalness:0.0});
  const floorW=isFox?52:44;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(floorW,floorLen),grassMat);
  floor.rotation.x=-Math.PI/2; floor.position.z=centerZ; floor.receiveShadow=true; g.add(floor);
  // Dirt border
  const dirtMat=new THREE.MeshStandardMaterial({color:0x2a1e0e,roughness:0.98});
  [-13,13].forEach(dx=>{
    const db=new THREE.Mesh(new THREE.PlaneGeometry(isFox?10:8,floorLen),dirtMat);
    db.rotation.x=-Math.PI/2; db.position.set(dx,0.001,centerZ); g.add(db);
  });

  // ── STONE TILE PATH ──────────────────────────────────────────────────────────
  const tileMat=new THREE.MeshStandardMaterial({map:stoneTex,color:0xc4956a,roughness:0.88,metalness:0.02});
  const gEdgeMat=new THREE.MeshStandardMaterial({color:0x2d5a1a,roughness:0.96,emissive:0x1a3810,emissiveIntensity:0.05});
  const pathGlowMat=new THREE.MeshStandardMaterial({color:0x4ade80,emissive:0x22c55e,emissiveIntensity:1.4,roughness:0.4});
  const railMat=new THREE.MeshStandardMaterial({color:0x6b4226,roughness:0.92});
  if(isFox){
    const pathPts=buildFoxChasePath(g,scene,{tileMat,edgeMat:gEdgeMat,glowMat:pathGlowMat,railMat});
    buildFoxPathCoins(scene,g,pathPts,(sc,gr,pts)=>_placeCoins(sc,gr,pts));
  } else {
  for(let tz=4;tz>finishZ-2;tz-=2.2){
    const tile=new THREE.Mesh(new THREE.BoxGeometry(7.5,0.1,2.0),tileMat);
    tile.position.set(0,0.05,tz-1.1); tile.receiveShadow=true; g.add(tile);
    const gap=new THREE.Mesh(new THREE.BoxGeometry(7.6,0.03,0.08),new THREE.MeshStandardMaterial({color:0x4a3c2c,roughness:0.99}));
    gap.position.set(0,0.1,tz-2.1); g.add(gap);
  }
  }
  if(!isFox){
  [-5.6,5.6].forEach(ex=>{
    const gs=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.07,floorLen),gEdgeMat);
    gs.position.set(ex,0.035,centerZ); g.add(gs);
  });
  }

  // ── ANIMATED MOVERS registry (must be before any push) ──────────────────────
  if(!scene.userData.movers) scene.userData.movers=[];

  // ── GLOWING BLUE ARROW CHEVRONS (navigation) ─────────────────────────────────
  {
    const arrowShape=new THREE.Shape();
    arrowShape.moveTo(0,0.55); arrowShape.lineTo(0.45,0); arrowShape.lineTo(0.22,0);
    arrowShape.lineTo(0.22,-0.38); arrowShape.lineTo(-0.22,-0.38); arrowShape.lineTo(-0.22,0);
    arrowShape.lineTo(-0.45,0); arrowShape.closePath();
    const arrowGeo=new THREE.ShapeGeometry(arrowShape);
    const arrowMat=new THREE.MeshStandardMaterial({color:0x60a5fa,emissive:0x60a5fa,emissiveIntensity:2.5,transparent:true,opacity:0.9,side:THREE.DoubleSide,depthWrite:false});
    let arrowT=0;
    for(let ai=0;ai<5;ai++){
      const az=-1-ai*3.2;
      const arrow=new THREE.Mesh(arrowGeo,arrowMat.clone());
      arrow.position.set(0,0.04,az); arrow.rotation.x=-Math.PI/2;
      arrow.scale.setScalar(0.88);
      const phase=ai*0.4;
      scene.userData.movers.push({update:(t)=>{
        const op=0.7+Math.sin(t*2.2+phase)*0.25;
        arrow.material.opacity=op; arrow.material.emissiveIntensity=2.2+Math.sin(t*1.8+phase)*0.5;
      }});
      g.add(arrow);
    }
  }

  // ── WOODEN FENCE (right side of path) — skip on fox chase (clean driving lane) ──
  if(!isFox){
    const fPostMat=new THREE.MeshStandardMaterial({color:0x6b4226,roughness:0.92,metalness:0.02});
    const fRailMat=new THREE.MeshStandardMaterial({color:0x5a3518,roughness:0.94});
    for(let fz=4;fz>finishZ+8;fz-=2.4){
      const post=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.9,0.11),fPostMat);
      post.position.set(4.2,0.45,fz); post.castShadow=true; g.add(post);
    }
    for(let fz=4;fz>finishZ+8;fz-=2.4){
      const rail=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,2.45),fRailMat);
      rail.position.set(4.2,0.65,fz-1.2); g.add(rail);
      const rail2=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,2.45),fRailMat);
      rail2.position.set(4.2,0.32,fz-1.2); g.add(rail2);
    }
  }

  // ── SHARED MATERIALS ─────────────────────────────────────────────────────────
  const trunkMat=new THREE.MeshStandardMaterial({map:barkTex,color:0x5c3a1e,roughness:0.95});
  const rockMat=new THREE.MeshStandardMaterial({color:0x6e6e5e,roughness:0.94,metalness:0.04});
  const rockDarkMat=new THREE.MeshStandardMaterial({color:0x4a4a3a,roughness:0.97});
  const mossMat2=new THREE.MeshStandardMaterial({color:0x3d6e1e,roughness:0.98,emissive:0x1e3d10,emissiveIntensity:0.08});
  const woodMat=new THREE.MeshStandardMaterial({color:0x6b3e26,roughness:0.92,metalness:0.04});
  const woodDarkMat=new THREE.MeshStandardMaterial({color:0x4a2810,roughness:0.95});
  const fernMat=new THREE.MeshStandardMaterial({color:0x2d7a1e,roughness:0.96,emissive:0x1a4810,emissiveIntensity:0.1,transparent:true,opacity:0.88,side:THREE.DoubleSide});
  const vineMat=new THREE.MeshStandardMaterial({color:0x2d5a18,roughness:0.97,transparent:true,opacity:0.78});
  if(isFox){
    buildFoxChaseObstacles(g,scene,{woodDarkMat,rockMat});
    const canopyMat=new THREE.MeshStandardMaterial({color:0x2d7a2d,roughness:0.88});
    buildFoxMinimalBackdrop(g,trunkMat,canopyMat);
  }
  const cMats=[
    new THREE.MeshStandardMaterial({color:0x1e5a1e,roughness:0.88,emissive:0x0a2810,emissiveIntensity:0.05}),
    new THREE.MeshStandardMaterial({color:0x2d7a2d,roughness:0.85}),
    new THREE.MeshStandardMaterial({color:0x3a6a1a,roughness:0.9}),
    new THREE.MeshStandardMaterial({color:0x1a4a1a,roughness:0.87}),
    new THREE.MeshStandardMaterial({color:0x4a7a1e,roughness:0.86}),
  ];
  const canyonMat=new THREE.MeshStandardMaterial({color:0x7a6550,roughness:0.95});
  const canyonLightMat=new THREE.MeshStandardMaterial({color:0x9a8a7a,roughness:0.92});
  const rootMossMat=new THREE.MeshStandardMaterial({color:0x2d5a18,roughness:0.99,emissive:0x0d2a0a,emissiveIntensity:0.07});

  // ── ANIMATED ELEMENT REGISTRIES ──────────────────────────────────────────────
  const treeCanopies=[];
  const fireflyLights=[];
  if(!scene.userData.movers) scene.userData.movers=[];

  // ── TREE HELPER (ultra-detailed with animation) ───────────────────────────────
  const _tree=(tx,tz2,sz=1.0,animate=true)=>{
    const h=(3.2+Math.random()*1.1)*sz;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22*sz,0.38*sz,h,8),trunkMat);
    trunk.position.set(tx,h/2,tz2); trunk.castShadow=false; g.add(trunk);
    // Root buttresses
    for(let ri=0;ri<4;ri++){
      const ra=(ri/4)*Math.PI*2;
      const root=new THREE.Mesh(new THREE.BoxGeometry(0.11*sz,0.2*sz,0.6*sz),
        new THREE.MeshStandardMaterial({color:0x4a2e10,roughness:0.97}));
      root.position.set(tx+Math.cos(ra)*0.38*sz,0.1*sz,tz2+Math.sin(ra)*0.38*sz);
      root.rotation.y=ra; root.rotation.z=0.35; g.add(root);
    }
    // Moss at base
    const baseMoss=new THREE.Mesh(new THREE.CylinderGeometry(0.4*sz,0.43*sz,0.1,8),mossMat2);
    baseMoss.position.set(tx,0.05,tz2); g.add(baseMoss);
    const cm=cMats[Math.floor(Math.abs(tx*7+tz2*3))%cMats.length];
    const cm2=cMats[Math.floor(Math.abs(tx*3+tz2*5))%cMats.length];
    const cm3=cMats[Math.floor(Math.abs(tx*5+tz2*2))%cMats.length];
    const canopyGroup=new THREE.Group();
    canopyGroup.position.set(tx,h,tz2);
    const spheres=[
      {geo:new THREE.SphereGeometry(1.85*sz,10,9),offset:[0,0.9*sz,0],mat:cm},
      {geo:new THREE.SphereGeometry(1.3*sz,9,8),offset:[0.9*sz,0.3*sz,0.5*sz],mat:cm2},
      {geo:new THREE.SphereGeometry(1.1*sz,9,8),offset:[-0.7*sz,0.2*sz,-0.4*sz],mat:cm3},
      {geo:new THREE.SphereGeometry(0.88*sz,8,7),offset:[0.4*sz,1.4*sz,0.3*sz],mat:cm},
    ];
    spheres.forEach(({geo,offset,mat})=>{
      const m=new THREE.Mesh(geo,mat); m.position.set(...offset); m.castShadow=false; canopyGroup.add(m);
    });
    // Hanging vines
    for(let vi=0;vi<2;vi++){
      const vn=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.014,1.1*sz,5),vineMat);
      vn.position.set((Math.random()-0.5)*sz,-0.3*sz,(Math.random()-0.5)*sz); canopyGroup.add(vn);
    }
    g.add(canopyGroup);
    if(animate) treeCanopies.push({group:canopyGroup,phase:Math.random()*Math.PI*2,amplitude:0.007+Math.random()*0.006});
  };

  // ── ROCK HELPER (with moss + satellite rocks) ─────────────────────────────────
  const _rock=(rx,rz2,rs=0.6)=>{
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(rs,1),rockMat);
    rock.position.set(rx,rs*0.55,rz2);
    rock.rotation.y=Math.sin(rx*rz2)*Math.PI; rock.rotation.x=Math.sin(rx*2)*0.32;
    rock.castShadow=true; g.add(rock);
    for(let si=0;si<2;si++){
      const sr=new THREE.Mesh(new THREE.DodecahedronGeometry(rs*(0.28+Math.random()*0.18),0),rockDarkMat);
      const sa=si*Math.PI+Math.random();
      sr.position.set(rx+Math.cos(sa)*rs*0.85,rs*0.2,rz2+Math.sin(sa)*rs*0.78);
      sr.rotation.y=Math.random()*Math.PI; g.add(sr);
    }
    const mossCap=new THREE.Mesh(new THREE.SphereGeometry(rs*0.88,7,5,0,Math.PI*2,0,Math.PI*0.38),mossMat2);
    mossCap.position.set(rx-rs*0.1,rs*0.88,rz2); g.add(mossCap);
  };

  // ── MUSHROOM HELPER ───────────────────────────────────────────────────────────
  const _mushroom=(mx,mz2,mh=0.28,capCol=0xc0392b)=>{
    const cM=new THREE.MeshStandardMaterial({color:capCol,roughness:0.7,emissive:capCol,emissiveIntensity:0.08});
    const stemM=new THREE.MeshStandardMaterial({color:0xf5f0e0,roughness:0.85});
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.038,0.052,mh,6),stemM);
    stem.position.set(mx,mh/2,mz2); g.add(stem);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(mh*0.88,8,5,0,Math.PI*2,0,Math.PI*0.55),cM);
    cap.position.set(mx,mh,mz2); g.add(cap);
    const gills=new THREE.Mesh(new THREE.CylinderGeometry(mh*0.83,0.055,0.04,8),
      new THREE.MeshStandardMaterial({color:0xffd5b0,roughness:0.9}));
    gills.position.set(mx,mh-0.02,mz2); g.add(gills);
  };

  // ── FERN HELPER ───────────────────────────────────────────────────────────────
  const _fern=(fx,fz2,fs=1.0)=>{
    for(let fi=0;fi<4;fi++){
      const fa=(fi/4)*Math.PI*2;
      const frond=new THREE.Mesh(new THREE.PlaneGeometry(0.38*fs,1.05*fs),fernMat);
      frond.position.set(fx+Math.cos(fa)*0.22*fs,0.48*fs,fz2+Math.sin(fa)*0.22*fs);
      frond.rotation.y=fa; frond.rotation.x=-0.32; frond.rotation.z=Math.sin(fa)*0.28; g.add(frond);
    }
  };

  // ── FALLEN LOG HELPER ─────────────────────────────────────────────────────────
  const _log=(lx,lz2,la=0,ls=1.0)=>{
    const logMat=new THREE.MeshStandardMaterial({color:0x4a2e14,roughness:0.96});
    const logMossMat2=new THREE.MeshStandardMaterial({color:0x2d5a18,roughness:0.98,emissive:0x0d2a0a,emissiveIntensity:0.09});
    const log=new THREE.Mesh(new THREE.CylinderGeometry(0.27*ls,0.21*ls,3.4*ls,8),logMat);
    log.position.set(lx,0.21*ls,lz2); log.rotation.z=Math.PI/2; log.rotation.y=la; log.castShadow=true; g.add(log);
    const mossLog=new THREE.Mesh(new THREE.CylinderGeometry(0.28*ls,0.22*ls,3.4*ls,8,1,false,0,Math.PI*0.58),logMossMat2);
    mossLog.position.set(lx,0.21*ls,lz2); mossLog.rotation.z=Math.PI/2-0.5; mossLog.rotation.y=la; g.add(mossLog);
    for(let mi=0;mi<3;mi++){
      const mofs=-1.1+mi*1.1;
      _mushroom(lx+Math.cos(la+Math.PI/2)*mofs,lz2+Math.sin(la+Math.PI/2)*mofs,0.17,[0xc0392b,0xe67e22,0x8e44ad][mi]);
    }
  };

  // ── FLOWER HELPER (with petals) ───────────────────────────────────────────────
  const _flower=(fx,fz2,col)=>{
    const sM=new THREE.MeshStandardMaterial({color:0x2d6a1a,roughness:0.9});
    const bM=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.18});
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.038,0.46,5),sM);
    stem.position.set(fx,0.23,fz2); g.add(stem);
    const leaf=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.32),fernMat);
    leaf.position.set(fx+0.07,0.18,fz2); leaf.rotation.z=-0.65; g.add(leaf);
    const bloom=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),bM);
    bloom.position.set(fx,0.55,fz2); g.add(bloom);
    for(let pi=0;pi<5;pi++){
      const pa=(pi/5)*Math.PI*2;
      const petal=new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.2),
        new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.28,transparent:true,opacity:0.82,side:THREE.DoubleSide}));
      petal.position.set(fx+Math.cos(pa)*0.16,0.54,fz2+Math.sin(pa)*0.16);
      petal.rotation.y=pa; petal.rotation.z=0.48; g.add(petal);
    }
  };

  // ── LANTERN HELPER (flickering) ───────────────────────────────────────────────
  const _lantern=(lx,lz2,lh=2.8,lc=0xffa030)=>{
    const pM=new THREE.MeshStandardMaterial({color:0x2a1a08,roughness:0.88,metalness:0.42});
    const gM=new THREE.MeshStandardMaterial({color:lc,emissive:lc,emissiveIntensity:2.4,transparent:true,opacity:0.9});
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.048,0.062,lh,7),pM);
    pole.position.set(lx,lh/2,lz2); g.add(pole);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.04,0.04),pM);
    arm.position.set(lx,lh+0.04,lz2-0.17); g.add(arm);
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.3,6),gM);
    body.position.set(lx,lh+0.21,lz2-0.36); g.add(body);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(0.21,0.14,6),pM);
    cap.position.set(lx,lh+0.52,lz2-0.36); g.add(cap);
    scene.userData.movers.push({update:(t)=>{body.material.emissiveIntensity=1.8+Math.sin(t*7.3+lx)*0.35+Math.sin(t*13.1+lz2)*0.15;}});
  };

  // ── 9 FOREST ZONES ────────────────────────────────────────────────────────────
  const F_COLS=isFox?FOX_CHASE_WAYPOINTS.map(w=>w.col):['#22c55e','#06b6d4','#3b82f6','#d97706','#a8a29e','#f97316','#0d9488','#dc2626','#fbbf24'];
  const F_NAMES=isFox?FOX_CHASE_WAYPOINTS.map(w=>w.name):['FOREST ENTRANCE','PAW PRINT TRAIL','RIVER CROSSING','ROOT GATE',
                 'WINDY CANYON','FOX CHASE','HIDDEN CAVE','ESCAPE BRIDGE','POWER SHRINE'];
  const fz9=isFox
    ? FOX_CHASE_WAYPOINTS.map((wp,i)=>({x:wp.x,z:wp.z,col:wp.col,name:wp.name,num:i+1}))
    : F_COLS.map((col,i)=>({z:4-i*(dist/8),col,name:F_NAMES[i],num:i+1}));

  // ── ZONE 1: FOREST ENTRANCE ───────────────────────────────────────────────────
  const z1=fz9[0].z; const x1=fz9[0].x||0;
  _zoneMarker(g,scene,x1-7,z1,1,fz9[0].col); _zoneMarker(g,scene,x1+7,z1,1,fz9[0].col);

  // Living tree-trunk arch gate — organic, overgrown look
  const archTrunkMat=new THREE.MeshStandardMaterial({color:0x3d2210,roughness:0.97,metalness:0.0});
  const archMossMat=new THREE.MeshStandardMaterial({color:0x2a5c14,roughness:0.98,emissive:0x1a3d0a,emissiveIntensity:0.1});
  const archLeafMats=[
    new THREE.MeshStandardMaterial({color:0x1a5c14,roughness:0.88,emissive:0x0d3008,emissiveIntensity:0.12}),
    new THREE.MeshStandardMaterial({color:0x2e7a1c,roughness:0.85}),
    new THREE.MeshStandardMaterial({color:0x3a6a18,roughness:0.9}),
    new THREE.MeshStandardMaterial({color:0x4a8a22,roughness:0.86}),
  ];
  // Gnarled trunk posts with bark ridges
  [-5.2,5.2].forEach((px,pi)=>{
    // Main trunk — tapered cylinder, slightly tilted inward
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.52,7.5,9),archTrunkMat);
    trunk.position.set(px,3.75,z1); trunk.rotation.z=(px>0?-1:1)*0.06; g.add(trunk);
    // Bark ridge rings
    [1,2.5,4.2,5.8].forEach(rh=>{
      const ridge=new THREE.Mesh(new THREE.TorusGeometry(0.38,0.06,5,9),archTrunkMat);
      ridge.rotation.x=Math.PI/2; ridge.position.set(px,rh,z1); g.add(ridge);
    });
    // Moss patches on trunk
    [0.8,2.2,4.5].forEach(mh=>{
      const moss=new THREE.Mesh(new THREE.SphereGeometry(0.22,7,5,0,Math.PI*2,0,Math.PI*0.45),archMossMat);
      moss.position.set(px+(px>0?-0.25:0.25),mh,z1-0.15); g.add(moss);
    });
    // Root buttresses at base
    for(let ri=0;ri<3;ri++){
      const ra=(ri/3)*Math.PI+(pi===0?0.3:-0.3);
      const root=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.22,0.65),archTrunkMat);
      root.position.set(px+Math.cos(ra)*0.48,0.11,z1+Math.sin(ra)*0.48);
      root.rotation.y=ra; root.rotation.z=0.3; g.add(root);
    }
    // Leaf canopy clusters on upper trunk
    [[px,7.8,z1],[px+(px>0?0.6:-0.6),7.0,z1-0.4],[px+(px>0?-0.4:0.4),8.2,z1+0.3]].forEach(([cx,cy,cz2],ci)=>{
      const lm=archLeafMats[ci%archLeafMats.length];
      const sz=1.1+ci*0.15;
      const cluster=new THREE.Mesh(new THREE.SphereGeometry(sz,8,7),lm);
      cluster.position.set(cx,cy,cz2); g.add(cluster);
      // Sub-clusters
      for(let si=0;si<3;si++){
        const sa=(si/3)*Math.PI*2;
        const sub=new THREE.Mesh(new THREE.SphereGeometry(sz*0.62,7,6),archLeafMats[(ci+si+1)%archLeafMats.length]);
        sub.position.set(cx+Math.cos(sa)*sz*0.72,cy+Math.sin(sa*0.8)*0.4,cz2+Math.sin(sa)*sz*0.6); g.add(sub);
      }
    });
  });
  // Arching branch that bridges the two trunks
  const archBranchMat=new THREE.MeshStandardMaterial({color:0x2e1a0a,roughness:0.96});
  const archBranch=new THREE.Mesh(new THREE.TorusGeometry(5.0,0.28,7,22,Math.PI),archBranchMat);
  archBranch.rotation.z=Math.PI; archBranch.position.set(x1,7.6,z1-0.15); g.add(archBranch);
  // Hanging vines from arch
  [-3.2,-1.2,0,1.2,3.2].forEach((vx,vi)=>{
    const vlen=0.9+vi%3*0.4;
    const vine=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.014,vlen,5),vineMat);
    vine.position.set(vx,7.6-vlen/2,z1-0.2); g.add(vine);
    // Small leaf at vine tip
    const vtip=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,5),archLeafMats[vi%archLeafMats.length]);
    vtip.position.set(vx,7.6-vlen-0.06,z1-0.2); g.add(vtip);
  });
  // Leaf clusters draped sparsely over the arch top
  for(let li=0;li<5;li++){
    const la=((li+0.5)/5)*Math.PI;
    const lr=5.0;
    const lx=Math.cos(la)*lr; const ly=7.6+Math.sin(la)*lr;
    const leafCluster=new THREE.Mesh(new THREE.SphereGeometry(0.55+Math.sin(li*1.5)*0.15,7,6),archLeafMats[li%archLeafMats.length]);
    leafCluster.position.set(lx,ly,z1-0.05+Math.sin(li*2.1)*0.3); g.add(leafCluster);
  }
  // Glowing START rune carved into arch branch
  const runeMat2=new THREE.MeshStandardMaterial({color:0x4ade80,emissive:0x22c55e,emissiveIntensity:2.2,transparent:true,opacity:0.92});
  const archRune=new THREE.Mesh(new THREE.CircleGeometry(0.38,8),runeMat2);
  archRune.position.set(0,8.1,z1-0.4); g.add(archRune);
  const runeGlowPL=new THREE.PointLight(0x4ade80,1.8,9); runeGlowPL.position.set(0,8.0,z1); g.add(runeGlowPL);
  scene.userData.movers.push({update:(t)=>{runeGlowPL.intensity=1.4+Math.sin(t*1.8)*0.5; archRune.material.emissiveIntensity=1.8+Math.sin(t*2.2)*0.6;}});
  // Lanterns on arch posts
  _lantern(-5.2,z1-0.1,6.5,0xffa030); _lantern(5.2,z1-0.1,6.5,0xffa030);
  if(!isFox){
  // Entry flowers — a few accents, not a carpet
  [[-3.5,z1+1.2,0xff6b9d],[3.5,z1+1.2,0xffd93d],
   [-4.2,z1-1.2,0xfda4af],[4.2,z1-1.2,0xa78bfa]].forEach(([fx,fz2,fc])=>_flower(fx,fz2,fc));
  // Ferns at gate base
  [-4.5,4.5,-6,6].forEach(fx2=>_fern(fx2,z1,0.85));
  // Mushroom clusters at base of posts
  [-5.5,5.5].forEach(mx=>{ [0xc0392b,0xe67e22].forEach((mc,mi)=>_mushroom(mx+(mi-0.5)*0.6,z1+0.4,0.22,mc)); });
  // Welcome trees framing entrance
  _tree(-8,z1,1.4); _tree(8,z1,1.3); _tree(-12,z1+2,1.6); _tree(12,z1+2,1.5);
  _tree(-10,z1-3,1.2); _tree(10,z1-3,1.1); _tree(-14,z1,1.8); _tree(14,z1,1.7);
  } else {
  _tree(-10,z1,1.2); _tree(10,z1,1.1);
  }
  if(!isFox) _placeCoins(scene,g,_coinGrid(0,z1,8,5,12));

  // ── ZONE 2: PAW PRINT TRAIL ───────────────────────────────────────────────────
  const z2=fz9[1].z; const x2=fz9[1].x||0;
  _zoneMarker(g,scene,x2-7,z2,2,fz9[1].col); _zoneMarker(g,scene,x2+7,z2,2,fz9[1].col);
  // Glowing paw prints along winding path
  if(isFox&&scene.userData.coursePath){
    const pawMat=new THREE.MeshStandardMaterial({color:0xffc040,emissive:0xffa020,emissiveIntensity:2.0,transparent:true,opacity:0.88,depthWrite:false,side:THREE.DoubleSide});
    buildFoxPawPrints(g,scene.userData.coursePath,pawMat);
  } else if(isFox){
    const pawMat=new THREE.MeshStandardMaterial({color:0xffc040,emissive:0xffa020,emissiveIntensity:2.0,transparent:true,opacity:0.88,depthWrite:false,side:THREE.DoubleSide});
    const _paw=(px,pz2)=>{
      const main=new THREE.Mesh(new THREE.CircleGeometry(0.28,8),pawMat);
      main.rotation.x=-Math.PI/2; main.position.set(px,0.01,pz2); g.add(main);
      [[-0.22,-0.35],[0,-0.42],[0.22,-0.35]].forEach(([dx,dz2])=>{
        const toe=new THREE.Mesh(new THREE.CircleGeometry(0.12,7),pawMat);
        toe.rotation.x=-Math.PI/2; toe.position.set(px+dx,0.01,pz2+dz2); g.add(toe);
      });
    };
    [[-1.5,z2+2],[1.5,z2+1],[-1.0,z2-0.5],[1.8,z2-1.5],[-1.2,z2-2.8],[1.0,z2-4]].forEach(([px,pz2])=>_paw(px,pz2));
  }
  // Flower clusters either side
  if(!isFox){
  for(let fi=0;fi<4;fi++){
    const fx2=(fi%2===0?-1:1)*(5.5+fi*0.5);
    const fz2a=z2+2-fi*2.1;
    _flower(fx2,fz2a,[0xff6b9d,0xffd93d,0xa78bfa,0xff6b35][fi%4]);
  }
  _placeCoins(scene,g,_coinGrid(x2,z2,9,6,14));
  _placeCoins(scene,g,[[x2-2,0.35,z2+1.5],[x2+2,0.35,z2-1],[x2-1.5,0.35,z2-3]]);
  }

  // ── ZONE 3: RIVER CROSSING ────────────────────────────────────────────────────
  const z3=fz9[2].z; const x3=fz9[2].x||0;
  _zoneMarker(g,scene,x3-7,z3,3,fz9[2].col); _zoneMarker(g,scene,x3+7,z3,3,fz9[2].col);
  // River — animated vertex water
  const riverMat=new THREE.MeshStandardMaterial({color:0x0c4a8a,emissive:0x1e3a8a,emissiveIntensity:0.22,transparent:true,opacity:0.82,roughness:0.08,metalness:0.45});
  const riverGeo=new THREE.PlaneGeometry(38,9,24,12);
  riverMesh=new THREE.Mesh(riverGeo,riverMat);
  riverMesh.rotation.x=-Math.PI/2; riverMesh.position.set(x3,-0.04,z3-1); g.add(riverMesh);
  scene.userData.movers.push({update:(t)=>{
    const pa=riverGeo.attributes.position;
    for(let vi=0;vi<pa.count;vi++){
      const vx=pa.getX(vi); const vy=pa.getY(vi);
      pa.setZ(vi,Math.sin(vx*0.42+t*1.6)*0.055+Math.cos(vy*0.61+t*1.1)*0.038+Math.sin(vx*0.28+vy*0.33+t*0.9)*0.025);
    }
    pa.needsUpdate=true; riverGeo.computeVertexNormals();
    riverMat.emissiveIntensity=0.18+Math.sin(t*0.7)*0.06;
  }});
  // Shimmer layer
  const shimMat=new THREE.MeshBasicMaterial({color:0x60a5fa,transparent:true,opacity:0.08,depthWrite:false});
  riverShim=new THREE.Mesh(new THREE.PlaneGeometry(38,9),shimMat);
  riverShim.rotation.x=-Math.PI/2; riverShim.position.set(x3,0.02,z3-1); g.add(riverShim);
  scene.userData.movers.push({update:(t)=>{shimMat.opacity=0.05+Math.abs(Math.sin(t*1.15))*0.07;}});
  // Stepping stones with moss
  const stoneGrey=new THREE.MeshStandardMaterial({color:0x7a7a6a,roughness:0.9,metalness:0.05});
  const mossMat=new THREE.MeshStandardMaterial({color:0x4a7c2a,roughness:0.97,emissive:0x2d5a15,emissiveIntensity:0.12});
  [[-3.5,z3+2.5],[0,z3+0.5],[3.5,z3-1.5],[0,z3-3.5]].forEach(([sx,sz2])=>{
    const stone=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.1,0.3,8),stoneGrey);
    stone.position.set(x3+sx,0.15,sz2); g.add(stone);
    const moss2=new THREE.Mesh(new THREE.CircleGeometry(0.82,9),mossMat);
    moss2.rotation.x=-Math.PI/2; moss2.position.set(x3+sx,0.31,sz2); g.add(moss2);
    if(!isFox) _placeCoins(scene,g,[[x3+sx,0.38,sz2]],8);
  });
  // Wooden bridge planks
  [-1.2,0,1.2].forEach(bx=>{
    const plank=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.08,9),woodMat);
    plank.position.set(x3+bx,0.08,z3-0.5); g.add(plank);
  });
  // Rope railings
  const ropeMat=new THREE.MeshStandardMaterial({color:0x8b6914,roughness:0.88});
  [-2.5,2.5].forEach(rx=>{
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,9,6),ropeMat);
    rail.rotation.x=Math.PI/2; rail.position.set(rx,0.8,z3-0.5); g.add(rail);
    [z3+3.5,z3-0.5,z3-4.2].forEach(rpz=>{
      const rpost=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.09,1.4,6),woodMat);
      rpost.position.set(rx,0.7,rpz); g.add(rpost);
    });
  });
  // Waterfalls on sides
  [-11,11].forEach(wx=>{
    const wfMat=new THREE.MeshStandardMaterial({color:0x93c5fd,emissive:0x60a5fa,emissiveIntensity:0.28,transparent:true,opacity:0.42});
    const wf=new THREE.Mesh(new THREE.PlaneGeometry(2.5,6),wfMat);
    wf.rotation.y=wx>0?-Math.PI/6:Math.PI/6; wf.position.set(wx,3,z3); g.add(wf);
  });

  if(!isFox) _placeCoins(scene,g,_coinGrid(-7,z3-1,5,7,6));
  if(!isFox) _placeCoins(scene,g,_coinGrid(7,z3-1,5,7,6));
  _placeShields(scene,g,[[0,0.5,z3+3.5]]);

  // ── ZONE 4: ROOT GATE ─────────────────────────────────────────────────────────
  const z4=fz9[3].z; const x4=fz9[3].x||0;
  _zoneMarker(g,scene,x4-7,z4,4,fz9[3].col); _zoneMarker(g,scene,x4+7,z4,4,fz9[3].col);
  // Wooden gate in path
  const gateMat=new THREE.MeshStandardMaterial({color:0x5c3a1e,roughness:0.93});
  [-3.5,3.5].forEach(gx=>{
    const gpost=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.4,5.5,7),gateMat);
    gpost.position.set(x4+gx,2.75,z4); g.add(gpost);
  });
  const gBeam=new THREE.Mesh(new THREE.BoxGeometry(8.5,0.55,0.5),gateMat);
  gBeam.position.set(x4,5.5,z4); g.add(gBeam);
  [1.0,2.0,3.0,4.0].forEach(gy=>{
    const slat=new THREE.Mesh(new THREE.BoxGeometry(7,0.28,0.22),woodMat);
    slat.position.set(x4,gy,z4-0.05); g.add(slat);
  });
  // Glowing rune on gate
  const runeMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.5,transparent:true,opacity:0.9});
  const rune=new THREE.Mesh(new THREE.CircleGeometry(0.55,6),runeMat);
  rune.position.set(x4,3.2,z4-0.3); g.add(rune);
  // Twisted root obstacles on sides
  const rootMat=new THREE.MeshStandardMaterial({color:0x4a2e10,roughness:0.96});
  [[-6,z4+1,0.4,2.5],[-7,z4-1,0.35,3.5],[6,z4+1.5,0.38,3.0],[7,z4-2,0.42,2.8]].forEach(([rx,rz2,rr,rh])=>{
    const root=new THREE.Mesh(new THREE.CylinderGeometry(rr*0.35,rr,rh,6),rootMat);
    root.position.set(rx,rh/2,rz2); root.rotation.z=(rx>0?1:-1)*0.25; g.add(root);
    const branch=new THREE.Mesh(new THREE.CylinderGeometry(rr*0.18,rr*0.32,rh*0.6,5),rootMat);
    branch.position.set(rx+(rx>0?0.8:-0.8),rh*0.3,rz2-0.5); branch.rotation.z=(rx>0?0.7:-0.7); g.add(branch);
  });

  if(!isFox) _placeCoins(scene,g,_coinGrid(x4,z4,10,6,14));
  _placeGems(scene,g,[[-2,0.5,z4+1.5],[2,0.5,z4+1.5]]);

  // ── ZONE 5: WINDY CANYON ──────────────────────────────────────────────────────
  const z5=fz9[4].z; const x5=fz9[4].x||0;
  _zoneMarker(g,scene,x5-7,z5,5,fz9[4].col); _zoneMarker(g,scene,x5+7,z5,5,fz9[4].col);
  const canyon5Mat=new THREE.MeshStandardMaterial({color:0x6e5f4a,roughness:0.95});
  const canyon5DarkMat=new THREE.MeshStandardMaterial({color:0x4a3d2e,roughness:0.97});
  [[-8,z5+1,3,10],[-8,z5-4,2.5,8],[8,z5+2,2.8,9],[8,z5-3,3.2,10]].forEach(([wx,wz2,wd,wh])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(wd,wh,5.5),canyon5Mat);
    wall.position.set(x5+wx,wh/2,wz2); g.add(wall);
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(wd+0.1,0.3,5.6),canyon5DarkMat);
    stripe.position.set(x5+wx,wh*0.4,wz2); g.add(stripe);
  });
  // Wind debris pebbles swept to sides
  for(let wi=0;wi<6;wi++){
    const wx2=(wi%2===0?-4:4)+Math.sin(wi*1.7)*1.5;
    const wz2b=z5+2-wi*1.2;
    const deb=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.06,0.22),
      new THREE.MeshStandardMaterial({color:0x8a7560,roughness:0.95}));
    deb.position.set(wx2,0.04,wz2b); deb.rotation.y=wi*0.6; g.add(deb);
  }
  _rock(-5,z5-2,0.8); _rock(5,z5+1,0.7); _rock(-6,z5-5,0.55); _rock(6,z5-4,0.65);
  // ── ROLLING BOULDER HAZARD — only in obstacle/maze profiles ──────────────────
  if(!scene.userData.obstacles) scene.userData.obstacles=[];
  if(prof.boulder){
    const rollBoulder=new THREE.Mesh(new THREE.DodecahedronGeometry(0.85,1),rockMat);
    rollBoulder.position.set(x5,0.85,z5-1.5); rollBoulder.castShadow=true; g.add(rollBoulder);
    const boulderDust=new THREE.Mesh(new THREE.CircleGeometry(0.9,12),
      new THREE.MeshBasicMaterial({color:0xa8957a,transparent:true,opacity:0.18,depthWrite:false}));
    boulderDust.rotation.x=-Math.PI/2; boulderDust.position.set(x5,0.02,z5-1.5); g.add(boulderDust);
    scene.userData.obstacles.push({mesh:rollBoulder,radius:1.05,type:'boulder'});
    scene.userData.movers.push({update:(t)=>{
      const bx=x5+Math.sin(t*0.55)*3.5;
      rollBoulder.position.x=bx;
      rollBoulder.rotation.z=-bx*1.15;
      boulderDust.position.x=bx;
      boulderDust.material.opacity=0.1+Math.abs(Math.cos(t*0.55))*0.14;
    }});
  }

  if(!isFox) _placeCoins(scene,g,_coinGrid(x5,z5,7,7,12));
  _placeShields(scene,g,[[0,0.5,z5+3],[-3,0.5,z5-3],[3,0.5,z5-3]]);

  // ── ZONE 6: FOX CHASE ─────────────────────────────────────────────────────────
  const z6=fz9[5].z; const x6=fz9[5].x||0;
  _zoneMarker(g,scene,x6-7,z6,6,fz9[5].col); _zoneMarker(g,scene,x6+7,z6,6,fz9[5].col);
  // Open bright meadow patches
  [[-4,z6+2],[4,z6],[0,z6-3],[-5,z6-5],[5,z6-4]].forEach(([mx,mz2])=>{
    const meadow=new THREE.Mesh(new THREE.CircleGeometry(1.8,10),
      new THREE.MeshStandardMaterial({color:0x4a8a2a,emissive:0x2d5a15,emissiveIntensity:0.1,roughness:0.96}));
    meadow.rotation.x=-Math.PI/2; meadow.position.set(mx,0.01,mz2); g.add(meadow);
  });
  // Fox creature body
  const foxBodyMat=new THREE.MeshStandardMaterial({color:0xe07028,roughness:0.7,emissive:0xcc5500,emissiveIntensity:0.2});
  const foxBody=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.55,1.0),foxBodyMat);
  foxBody.position.set(x6-3,0.55,z6-1); g.add(foxBody);
  const foxHead=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.45,0.5),foxBodyMat);
  foxHead.position.set(x6-3,1.0,z6-1.35); g.add(foxHead);
  const foxEarMat=new THREE.MeshStandardMaterial({color:0xffa050,emissive:0xff6020,emissiveIntensity:0.3});
  [[-0.15,0.25],[0.15,0.25]].forEach(([ex,ey])=>{
    const ear=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.3,5),foxEarMat);
    ear.position.set(x6-3+ex,1.25+ey,z6-1.35); g.add(ear);
  });
  const foxTail=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.7,7),foxBodyMat);
  foxTail.rotation.x=-0.5; foxTail.position.set(x6-3,0.6,z6-0.4); g.add(foxTail);
  if(!scene.userData.movers) scene.userData.movers=[];
  scene.userData.movers.push({update:(t)=>{
    const sx=x6-3+Math.sin(t*0.9)*4.5;
    foxBody.position.x=sx; foxHead.position.x=sx; foxTail.position.x=sx;
  }});

  if(!isFox) _placeCoins(scene,g,_coinGrid(x6,z6,12,7,16));
  _placeGems(scene,g,[[3,0.5,z6-2],[-3,0.5,z6-4]]);

  // ── ZONE 7: HIDDEN CAVE ───────────────────────────────────────────────────────
  const z7=fz9[6].z; const x7=fz9[6].x||0;
  _zoneMarker(g,scene,x7-7,z7,7,fz9[6].col); _zoneMarker(g,scene,x7+7,z7,7,fz9[6].col);
  // Cave mouth arch — big rock formation
  const caveMat=new THREE.MeshStandardMaterial({color:0x3a2e22,roughness:0.97});
  const caveArch=new THREE.Mesh(new THREE.TorusGeometry(4.8,1.4,8,20,Math.PI),caveMat);
  caveArch.rotation.z=Math.PI; caveArch.position.set(x7,4.8,z7-1); g.add(caveArch);
  [-5.5,5.5].forEach(cx=>{
    const cpil=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,8,7),caveMat);
    cpil.position.set(x7+cx,4,z7-1); g.add(cpil);
  });
  // Cave interior glow
  const caveGlowMat=new THREE.MeshBasicMaterial({color:0x0d9488,transparent:true,opacity:0.1,depthWrite:false});
  const caveGlow=new THREE.Mesh(new THREE.CircleGeometry(4.5,20),caveGlowMat);
  caveGlow.rotation.x=-Math.PI/2; caveGlow.position.set(x7,0.01,z7-2); g.add(caveGlow);
  // Crystals inside cave
  const caveCrysMat=new THREE.MeshStandardMaterial({color:0x06b6d4,emissive:0x0d9488,emissiveIntensity:0.9,transparent:true,opacity:0.85,roughness:0.15});
  [[-3.5,z7-2,0.7],[3.5,z7-2,0.8],[-2,z7-4,0.6],[2,z7-4,0.55],[0,z7-5,0.9]].forEach(([cx,cz2,cs])=>{
    const crys=new THREE.Mesh(new THREE.ConeGeometry(cs*0.4,cs*2.2,5),caveCrysMat);
    crys.position.set(x7+cx,cs*1.1,cz2); g.add(crys);
  });
  // Treasure chests
  const chestMat=new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:0.82});
  const chestAccMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.0});
  [[-4.5,z7],[4.5,z7]].forEach(([chx,chz2])=>{
    const chest=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.7,0.65),chestMat);
    chest.position.set(chx,0.35,chz2); g.add(chest);
    const band=new THREE.Mesh(new THREE.BoxGeometry(0.92,0.1,0.67),chestAccMat);
    band.position.set(chx,0.5,chz2); g.add(band);
    const clasp=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.18,0.08),chestAccMat);
    clasp.position.set(chx,0.42,chz2-0.33); g.add(clasp);
  });
  // ── GUARD DRONE ENEMY — only in stealth/AI profiles ──────────────────────────
  if(!scene.userData.obstacles) scene.userData.obstacles=[];
  if(prof.drone){
  const droneGrp=new THREE.Group();
  const droneBody=new THREE.Mesh(new THREE.SphereGeometry(0.42,10,8),
    new THREE.MeshStandardMaterial({color:0x2a2a34,roughness:0.4,metalness:0.72}));
  droneGrp.add(droneBody);
  const droneEye=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),
    new THREE.MeshStandardMaterial({color:0xff2222,emissive:0xff0000,emissiveIntensity:2.5}));
  droneEye.position.set(0,0.05,-0.38); droneGrp.add(droneEye);
  const droneRing=new THREE.Mesh(new THREE.TorusGeometry(0.56,0.05,6,18),
    new THREE.MeshStandardMaterial({color:0x44444f,roughness:0.45,metalness:0.65}));
  droneRing.rotation.x=Math.PI/2; droneGrp.add(droneRing);
  // 4 rotor pods
  for(let di=0;di<4;di++){
    const da=(di/4)*Math.PI*2+Math.PI/4;
    const pod=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.06,8),
      new THREE.MeshStandardMaterial({color:0x55555f,roughness:0.4,metalness:0.7}));
    pod.position.set(Math.cos(da)*0.56,0.04,Math.sin(da)*0.56); droneGrp.add(pod);
  }
  const droneLight=new THREE.PointLight(0xff2200,0.85,6); droneGrp.add(droneLight);
  droneGrp.position.set(x7,1.35,z7+2.5); g.add(droneGrp);
  scene.userData.obstacles.push({mesh:droneGrp,radius:0.95,type:'drone'});
  scene.userData.movers.push({update:(t)=>{
    const px=x7+Math.sin(t*0.42)*5;
    droneGrp.position.x=px;
    droneGrp.position.y=1.3+Math.sin(t*2.2)*0.18;
    droneGrp.rotation.y=Math.cos(t*0.42)>0?-Math.PI/2:Math.PI/2;
    droneRing.rotation.z=t*9;
    droneEye.material.emissiveIntensity=2+Math.sin(t*5)*0.8;
    droneLight.intensity=0.7+Math.sin(t*5)*0.25;
  }});
  }
  if(!isFox) _placeCoins(scene,g,_coinGrid(x7,z7,10,6,25));
  _placeShields(scene,g,[[0,0.5,z7+2],[-4,0.5,z7-3],[4,0.5,z7-3]]);


  // ── ZONE 8: ESCAPE BRIDGE ─────────────────────────────────────────────────────
  const z8=fz9[7].z; const x8=fz9[7].x||0;
  _zoneMarker(g,scene,x8-7,z8,8,fz9[7].col); _zoneMarker(g,scene,x8+7,z8,8,fz9[7].col);
  // Rocky ravine underneath
  const ravineMat=new THREE.MeshStandardMaterial({color:0x1a1208,roughness:0.97});
  const ravine=new THREE.Mesh(new THREE.PlaneGeometry(38,8),ravineMat);
  ravine.rotation.x=-Math.PI/2; ravine.position.set(x8,-0.15,z8-2); g.add(ravine);
  // Stone bridge
  const bridgeMat=new THREE.MeshStandardMaterial({color:0x7a6a5a,roughness:0.9,metalness:0.05});
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(7,0.2,8),bridgeMat);
  bridge.position.set(x8,0.1,z8-2); g.add(bridge);
  [-3.2,3.2].forEach(bx=>{
    const parapet=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.65,8),bridgeMat);
    parapet.position.set(x8+bx,0.42,z8-2); g.add(parapet);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.12,8.1),
      new THREE.MeshStandardMaterial({color:0x9a8a7a,roughness:0.88}));
    cap.position.set(x8+bx,0.79,z8-2); g.add(cap);
  });
  // Falling rocks — slam down to bridge level, real 3D collision hazard
  if(!scene.userData.movers) scene.userData.movers=[];
  if(!scene.userData.obstacles) scene.userData.obstacles=[];
  if(prof.rocks) [-2.5,0,2.5].forEach((rx,ri)=>{
    const rockFall=new THREE.Mesh(new THREE.DodecahedronGeometry(0.42,0),rockMat);
    rockFall.position.set(x8+rx,3,z8-2-ri*0.8); rockFall.castShadow=true; g.add(rockFall);
    // Shadow target ring on the bridge — warns where the rock lands
    const warnRing=new THREE.Mesh(new THREE.RingGeometry(0.32,0.5,14),
      new THREE.MeshBasicMaterial({color:0xff3300,transparent:true,opacity:0.4,side:THREE.DoubleSide,depthWrite:false}));
    warnRing.rotation.x=-Math.PI/2; warnRing.position.set(x8+rx,0.13,z8-2-ri*0.8); g.add(warnRing);
    scene.userData.obstacles.push({mesh:rockFall,radius:0.6,type:'falling_rock',check3d:true});
    scene.userData.movers.push({update:(t)=>{
      // Slams from 4.5 down to bridge level and back up
      const cyc=Math.abs(Math.sin(t*(0.8+ri*0.3)+ri*1.7));
      rockFall.position.y=0.55+cyc*4.0;
      rockFall.rotation.x=t*(1.2+ri*0.4);
      warnRing.material.opacity=cyc<0.3?0.65:0.18; // bright when rock is low
    }});
  });
  // Warning cracks on bridge surface
  const crackMat2=new THREE.LineBasicMaterial({color:0xff2200,transparent:true,opacity:0.6});
  [[0,z8-1.5],[1.5,z8-3],[-1.8,z8-4]].forEach(([cx,cz2])=>{
    const crack=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(cx-0.5,0.11,cz2),new THREE.Vector3(cx+0.5,0.11,cz2+0.8)
    ]),crackMat2);
    g.add(crack);
  });
  _rock(-7,z8+1,1.2); _rock(7,z8,1.1); _rock(-9,z8-3,0.9); _rock(9,z8-5,0.85);

  if(!isFox) _placeCoins(scene,g,_coinGrid(x8,z8,8,6,14));
  _placeShields(scene,g,[[0,0.5,z8+3.5]]);
  _placeGems(scene,g,[[-3,0.5,z8-3],[3,0.5,z8-5]]);

  // ── ZONE 9: POWER SHRINE ──────────────────────────────────────────────────────
  const z9=fz9[8].z; const x9=fz9[8].x||0;
  scene.userData.finishZ=z9;
  _zoneMarker(g,scene,x9-7,z9,9,fz9[8].col); _zoneMarker(g,scene,x9+7,z9,9,fz9[8].col);
  // Stone shrine platform
  const shrineBaseMat=new THREE.MeshStandardMaterial({color:0x6e5a3a,roughness:0.85,metalness:0.1});
  const shrineBase=new THREE.Mesh(new THREE.CylinderGeometry(8,9,0.4,10),shrineBaseMat);
  shrineBase.position.set(x9,0.2,z9); g.add(shrineBase);
  // Ring of standing stones
  for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2;
    const ss=new THREE.Mesh(new THREE.BoxGeometry(0.8,4.5+k%3,0.45),canyonMat);
    ss.position.set(x9+Math.cos(a)*6.5,2.25+k%3*0.5,z9+Math.sin(a)*6.5);
    ss.rotation.y=a; g.add(ss);
  }
  // Central glowing blue portal (Power Station from reference)
  const portalMat=new THREE.MeshStandardMaterial({color:0x06b6d4,emissive:0x0ea5e9,emissiveIntensity:2.5,transparent:true,opacity:0.9,roughness:0.15});
  const portalRing=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.45,10,32),portalMat);
  portalRing.position.set(x9,4.2,z9); g.add(portalRing);
  const portalFillMat=new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.22,side:THREE.DoubleSide,depthWrite:false});
  const portalFill=new THREE.Mesh(new THREE.CircleGeometry(2.8,24),portalFillMat);
  portalFill.position.set(x9,4.2,z9-0.1); g.add(portalFill);
  // Energy pillars flanking portal
  const enPilMat=new THREE.MeshStandardMaterial({color:0x0ea5e9,emissive:0x0284c7,emissiveIntensity:1.2,roughness:0.2,metalness:0.7});
  [-3.8,3.8].forEach(px=>{
    const epil=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.35,8,8),enPilMat);
    epil.position.set(x9+px,4,z9); g.add(epil);
    const ecap=new THREE.Mesh(new THREE.SphereGeometry(0.5,10,10),
      new THREE.MeshStandardMaterial({color:0x06b6d4,emissive:0x0ea5e9,emissiveIntensity:3.0}));
    ecap.position.set(x9+px,8.5,z9); g.add(ecap);
  });
  // Orbiting rings
  if(!scene.userData.movers) scene.userData.movers=[];
  [[0x06b6d4,2.8],[0x38bdf8,3.4],[0xfbbf24,4.0]].forEach(([rc,rr],ri)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(rr,0.09,7,26),
      new THREE.MeshBasicMaterial({color:rc,transparent:true,opacity:0.65}));
    ring.position.set(x9,4.2,z9); g.add(ring);
    scene.userData.movers.push({update:(t)=>{ring.rotation.x=t*(0.6+ri*0.3); ring.rotation.y=t*(0.4+ri*0.25);}});
  });
  if(!isFox) _placeCoins(scene,g,_coinGrid(x9,z9,12,5,14));
  _placeGems(scene,g,[[-3,0.5,z9+2],[3,0.5,z9+2],[0,0.5,z9-3],[-2,0.5,z9-2],[2,0.5,z9-2]]);

  // ── TREES lining both sides of path throughout ────────────────────────────────
  if(!isFox){
  for(let tz2=z1-1;tz2>z9+3;tz2-=6.5){
    const v1=0.9+Math.sin(tz2*3.1)*0.15;
    const v2=0.95+Math.sin(tz2*2.7)*0.12;
    _tree(-9,tz2,v1); _tree(9,tz2+2.2,v2);
    _tree(-13,tz2+1.5,1.1+Math.sin(tz2*2.2)*0.15); _tree(13,tz2,1.05+Math.sin(tz2*3.4)*0.13);
  }

  // ── ROCKS scattered naturally along the path ──────────────────────────────────
  [[-7,z1-3,0.6],[-8,fz9[1].z-2,0.5],[7,fz9[1].z+1,0.55],[-6,fz9[3].z+2,0.65],
   [8,fz9[4].z-3,0.7],[-7,fz9[5].z+2,0.6],[8,fz9[7].z-2,0.8],[-9,fz9[7].z+1,0.7]].forEach(([rx,rz2,rs])=>_rock(rx,rz2,rs));

  // ── FLOWERS scattered near path edges ─────────────────────────────────────────
  const fCols=[0xff6b9d,0xffd93d,0xa78bfa,0xff6b35,0x86efac,0xfda4af];
  for(let fz3=z1-2;fz3>z9+5;fz3-=5.5/prof.clutter){
    [5.8,-5.8,6.5,-6.5].forEach((fx2)=>{
      if(Math.sin(fz3*fx2*0.1)>0)
        _flower(fx2+Math.sin(fz3*0.5)*0.5,fz3+Math.cos(fx2*0.3)*0.5,fCols[Math.abs(Math.floor(fx2*fz3))%fCols.length]);
    });
  }
  }

  // ── LANTERNS along the path every 8 units ─────────────────────────────────────
  if(!isFox){
  for(let lz2=z1-3;lz2>z9+4;lz2-=8){
    _lantern(-5,lz2,2.5,0xffa030); _lantern(5,lz2-4,2.5,0xffa030);
  }
  }

  // ── BACKGROUND LARGE TREES (silhouette depth) ─────────────────────────────────
  if(!isFox){
  [[-18,centerZ-5,1.8],[-20,centerZ+8,1.5],[18,centerZ-2,1.7],[20,centerZ+6,1.6],
   [-22,centerZ-15,2.0],[22,centerZ-12,1.9],[-16,z9+6,1.4],[16,z9+4,1.5]].forEach(([tx,tz2,ts])=>_tree(tx,tz2,ts));
  }

  // ── ENERGY PADS — glowing pads that recharge battery on contact ───────────────
  const _energyPad=(bx,bz2)=>{
    const padRing=new THREE.Mesh(new THREE.RingGeometry(0.55,0.85,18),
      new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.6,side:THREE.DoubleSide,depthWrite:false}));
    padRing.rotation.x=-Math.PI/2; padRing.position.set(bx,0.03,bz2); g.add(padRing);
    const padCore=new THREE.Mesh(new THREE.CircleGeometry(0.5,16),
      new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.16,depthWrite:false}));
    padCore.rotation.x=-Math.PI/2; padCore.position.set(bx,0.025,bz2); g.add(padCore);
    // Lightning bolt symbol — two thin angled bars
    const boltM=new THREE.MeshBasicMaterial({color:0xccfff2,transparent:true,opacity:0.85,depthWrite:false});
    const b1=new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.36),boltM);
    b1.rotation.x=-Math.PI/2; b1.rotation.z=0.45; b1.position.set(bx-0.05,0.035,bz2-0.08); g.add(b1);
    const b2=new THREE.Mesh(new THREE.PlaneGeometry(0.1,0.36),boltM);
    b2.rotation.x=-Math.PI/2; b2.rotation.z=0.45; b2.position.set(bx+0.05,0.035,bz2+0.12); g.add(b2);
    let padUsed=false;
    scene.userData.movers.push({update:(t,dt2,rsv)=>{
      padRing.material.opacity=padUsed?0.12:(0.42+Math.sin(t*3.5)*0.22);
      padCore.material.opacity=padUsed?0.05:(0.12+Math.sin(t*3.5+1)*0.08);
      if(!padUsed&&rsv&&rsv.battery!=null){
        const pdx=rsv.x-bx, pdz=rsv.z-bz2;
        if(pdx*pdx+pdz*pdz<1.15){
          padUsed=true;
          rsv.battery=Math.min(100,rsv.battery+12);
          padCore.material.opacity=0.55; // flash on pickup
        }
      }
    }});
  };
  _energyPad(0,fz9[1].z-2);    // Zone 2 — on the paw print trail
  _energyPad(-1.5,fz9[5].z+1); // Zone 6 — fox chase meadow

  // ── FERNS scattered at path edges (density scales with course clutter) ───────
  if(!isFox){
  for(let fz4=z1-1;fz4>z9+5;fz4-=3.2/prof.clutter){
    const s1=5.2+Math.sin(fz4*2.1)*0.8;
    const s2=5.0+Math.sin(fz4*1.7)*0.9;
    if(Math.sin(fz4*3.7)>-0.3) _fern(-s1,fz4,0.58+Math.sin(fz4*2.3)*0.2);
    if(Math.cos(fz4*3.1)>-0.3) _fern(s2,fz4+1.1,0.62+Math.cos(fz4*1.9)*0.18);
  }

  // ── FALLEN LOGS with built-in moss + mushrooms ────────────────────────────────
  [[-7.2,z1-5,0.4,0.9],[-6.5,fz9[1].z-3,1.1,0.85],[7.3,fz9[2].z+3,0.8,0.9],
   [-8.1,fz9[3].z-3,1.5,0.75],[7.0,fz9[4].z+1.5,2.0,1.05],[-7.5,fz9[5].z-4,0.3,0.8]]
   .slice(0,Math.max(2,Math.round(6*prof.clutter)))
   .forEach(([lx,lz3,la,ls])=>_log(lx,lz3,la,ls));

  // ── MUSHROOM CLUSTERS scattered near rocks ────────────────────────────────────
  [[-5.5,z1-6],[8.2,fz9[1].z+4],[-8.0,fz9[2].z-5],[7.5,fz9[3].z-6],
   [-8.0,fz9[4].z+3],[7.8,fz9[6].z-4]]
   .slice(0,Math.max(2,Math.round(6*prof.clutter)))
   .forEach(([mx,mz4])=>{
    const mcols=[0xc0392b,0xe67e22,0x8e44ad,0xc9a0dc];
    for(let mi=0;mi<4;mi++)
      _mushroom(mx+Math.sin(mi*1.7)*0.55,mz4+Math.cos(mi*2.3)*0.48,0.15+mi*0.06,mcols[mi%4]);
  });
  }

  // ── AMBIENT ZONE GLOWS ────────────────────────────────────────────────────────
  [[0,4,z1,0x4ade80],[0,4,z9,0x06b6d4],[0,3,centerZ,0x4a8a2a]].forEach(([lx,ly,lz2,lc])=>{
    const glow=new THREE.Mesh(new THREE.SphereGeometry(0.32,6,6),
      new THREE.MeshBasicMaterial({color:lc,transparent:true,opacity:0.32,depthWrite:false}));
    glow.position.set(lx,ly,lz2); g.add(glow);
  });

  // ── FIREFLY PARTICLE SYSTEM (BufferGeometry Points) ───────────────────────────
  const FF_COUNT=isFox?24:80;
  const ffGeo=new THREE.BufferGeometry();
  const ffPos=new Float32Array(FF_COUNT*3);
  const ffPhase=new Float32Array(FF_COUNT);
  for(let i=0;i<FF_COUNT;i++){
    ffPos[i*3  ]=(Math.random()-0.5)*24;
    ffPos[i*3+1]=0.6+Math.random()*3.8;
    ffPos[i*3+2]=z9+Math.random()*(z1-z9);
    ffPhase[i]=Math.random()*Math.PI*2;
  }
  ffGeo.setAttribute('position',new THREE.BufferAttribute(ffPos,3));
  const ffMat=new THREE.PointsMaterial({color:0xccff88,size:0.12,transparent:true,opacity:0.9,
    blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  g.add(new THREE.Points(ffGeo,ffMat));
  const ffBX=new Float32Array(FF_COUNT);
  const ffBY=new Float32Array(FF_COUNT);
  const ffBZ=new Float32Array(FF_COUNT);
  for(let i=0;i<FF_COUNT;i++){ffBX[i]=ffPos[i*3];ffBY[i]=ffPos[i*3+1];ffBZ[i]=ffPos[i*3+2];}

  // ── POLLEN / DUST MOTES (BufferGeometry Points) ───────────────────────────────
  const PL_COUNT=36;
  const plGeo=new THREE.BufferGeometry();
  const plPos=new Float32Array(PL_COUNT*3);
  const plPhase=new Float32Array(PL_COUNT);
  for(let i=0;i<PL_COUNT;i++){
    plPos[i*3  ]=(Math.random()-0.5)*28;
    plPos[i*3+1]=0.4+Math.random()*5.5;
    plPos[i*3+2]=z9+Math.random()*(z1-z9);
    plPhase[i]=Math.random()*Math.PI*2;
  }
  plGeo.setAttribute('position',new THREE.BufferAttribute(plPos,3));
  const plMat=new THREE.PointsMaterial({color:0xfff9c4,size:0.05,transparent:true,opacity:0.2,
    blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  g.add(new THREE.Points(plGeo,plMat));
  const plBX=new Float32Array(PL_COUNT);
  const plBY=new Float32Array(PL_COUNT);
  const plBZ=new Float32Array(PL_COUNT);
  for(let i=0;i<PL_COUNT;i++){plBX[i]=plPos[i*3];plBY[i]=plPos[i*3+1];plBZ[i]=plPos[i*3+2];}

  // ── PARTICLE ANIMATION MOVER ──────────────────────────────────────────────────
  if(!scene.userData.movers) scene.userData.movers=[];
  scene.userData.movers.push({update:(t)=>{
    // Fireflies
    const ap=ffGeo.attributes.position;
    for(let i=0;i<FF_COUNT;i++){
      ap.setX(i,ffBX[i]+Math.sin(t*0.72+ffPhase[i])*1.9);
      ap.setY(i,ffBY[i]+Math.sin(t*1.1+ffPhase[i]*1.4)*0.65+Math.cos(t*0.55+ffPhase[i])*0.38);
      ap.setZ(i,ffBZ[i]+Math.cos(t*0.5+ffPhase[i]*0.85)*2.3);
    }
    ap.needsUpdate=true;
    ffMat.opacity=0.28+Math.abs(Math.sin(t*2.1))*0.25;
    // Pollen
    const bp=plGeo.attributes.position;
    for(let i=0;i<PL_COUNT;i++){
      bp.setX(i,plBX[i]+Math.sin(t*0.25+plPhase[i]*1.1)*3.2+Math.sin(t*0.11+plPhase[i]*0.5)*2.0);
      bp.setY(i,plBY[i]+Math.sin(t*0.38+plPhase[i])*0.78+Math.sin(t*0.13+plPhase[i]*2.1)*1.1);
      bp.setZ(i,plBZ[i]+Math.cos(t*0.19+plPhase[i]*0.9)*2.6);
    }
    bp.needsUpdate=true;
  }});

  // ── TREE CANOPY SWAY (via scene.userData.atmo) ────────────────────────────────
  scene.userData.atmo={update:(t)=>{
    for(let ti=0;ti<treeCanopies.length;ti++){
      const {group,phase,amplitude}=treeCanopies[ti];
      group.rotation.z=Math.sin(t*0.75+phase)*amplitude*3.8+Math.sin(t*1.35+phase*1.4)*amplitude*1.6;
      group.rotation.x=Math.cos(t*0.58+phase*0.8)*amplitude*2.0;
    }
  }};

  scene.userData.finishZone={x:x9,z:z9,radius:6.5,y3d:0};
  if(isFox){
    const foxZones=buildFoxForestZones(dist,ch?.isGameMission||ch?.missionId,finishZ);
    scene.userData.forestZones=foxZones.forestZones;
  } else {
  scene.userData.forestZones=fz9.map((z)=>({ ...z, zMin:z.z-dist/18, zMax:z.z+dist/18 }));
  if(ch?.isGameMission||ch?.missionId){
    scene.userData.forestZones.push({
      z:finishZ-1,col:'#f472b6',name:'CREATE YOUR GAME',num:10,
      zMin:finishZ-8,zMax:finishZ+4,
    });
  }
  }
  scene.userData.arenaBounds={camMinZ:z9-14,camMaxZ:18,camMaxX:isFox?28:24,floorLen,isForest:true};
  scene.userData.isFoxChase=isFox;

  scene.add(g);
}

function _lineFollowArena(scene, ch) {
  const g = new THREE.Group(); g.name = 'arena';
  const level = ch?.trackLevel || 1;
  const dist = Math.max(36, ch?.totalDist || 40);
  const finishZ = 5 - dist;
  const centerZ = (5 + finishZ) / 2;
  const floorLen = dist + 20;

  // Night circuit theme
  scene.background = new THREE.Color(0x080c14);
  scene.fog = new THREE.Fog(0x080c14, 42, Math.max(90, floorLen));

  // Dark asphalt floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(36, floorLen),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2; floor.position.z = centerZ; floor.receiveShadow = true; g.add(floor);

  // Track boundary glow strips (left and right edges of the track)
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, emissive: 0x1e40af, emissiveIntensity: 0.8, transparent: true, opacity: 0.7 });
  [-9, 9].forEach(x => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.18, floorLen), edgeMat);
    edge.rotation.x = -Math.PI / 2; edge.position.set(x, 0.015, centerZ); g.add(edge);
  });

  // The glowing line path — thick and clearly visible
  const wobble = level >= 8 ? 3.5 : level >= 6 ? 2.8 : level >= 4 ? 2.0 : level >= 2 ? 1.2 : 0.4;
  const freq = level >= 6 ? 0.18 : level >= 4 ? 0.14 : level >= 2 ? 0.1 : 0.06;
  const points = [];
  const steps = Math.max(80, Math.floor(dist * 3));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = 5 - t * dist;
    const x = Math.sin(z * freq + Math.PI * 0.3) * wobble + Math.cos(z * freq * 0.6) * wobble * 0.35;
    points.push(new THREE.Vector3(x, 0, z));
  }

  // Thick glowing line (neon green)
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1.8, roughness: 0.5 });
  const lineGlowMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.6, transparent: true, opacity: 0.35 });
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]; const b = points[i + 1];
    const dx = b.x - a.x; const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 0.01;
    const angle = Math.atan2(dx, dz);
    // Core bright line
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, len + 0.06), lineMat);
    core.position.set((a.x + b.x) / 2, 0.022, (a.z + b.z) / 2);
    core.rotation.y = angle; g.add(core);
    // Soft glow halo every 3 segments
    if (i % 3 === 0) {
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, len * 3 + 0.1), lineGlowMat);
      glow.position.set((a.x + b.x) / 2, 0.01, (a.z + b.z) / 2);
      glow.rotation.y = angle; g.add(glow);
    }
  }

  // Fork paths for advanced levels
  if (level >= 6) {
    const forkColors = [0xef4444, 0x3b82f6];
    [[-3.5, finishZ * 0.35], [3.5, finishZ * 0.65]].forEach(([ox, oz], fi) => {
      for (let s = 0; s < 12; s++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.9),
          new THREE.MeshStandardMaterial({ color: forkColors[fi], emissive: forkColors[fi], emissiveIntensity: 1.4 }));
        seg.position.set(ox + Math.sin(s * 0.4) * 1.2, 0.022, oz - s * 0.85); g.add(seg);
      }
    });
  }

  // Checkpoint glowing arches — spanning across the track
  const cpCount = ch?.checkpoints || Math.max(3, Math.floor(dist / 10));
  const cpCols = [0x10b981, 0x3b82f6, 0xa855f7, 0xf59e0b, 0xec4899];
  for (let ci = 0; ci < cpCount; ci++) {
    const t = (ci + 1) / (cpCount + 1);
    const cz = 5 - t * dist;
    const pathIdx = Math.floor(t * (points.length - 1));
    const px = points[Math.min(pathIdx, points.length - 1)].x;
    const col = cpCols[ci % cpCols.length];
    // Gate ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 8, 28),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 }));
    ring.rotation.x = Math.PI / 2; ring.position.set(px, 0.8, cz); ring.name = 'cp'; g.add(ring);
    // Pillars
    [-2.2, 2.2].forEach(ox => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8 }));
      post.position.set(px + ox, 0.8, cz); g.add(post);
    });
    // Glow on floor
    const fGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.4),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, transparent: true, opacity: 0.6 }));
    fGlow.rotation.x = -Math.PI / 2; fGlow.position.set(px, 0.01, cz); g.add(fGlow);
  }

  // START gate — two neon pillars (no blocking wall)
  const startGateMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.4 });
  [-4, 4].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4, 10), startGateMat);
    post.position.set(x, 2, 4); g.add(post);
  });
  const startBeam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 0.25), startGateMat);
  startBeam.position.set(0, 4.15, 4); g.add(startBeam);
  const startGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.65, transparent: true, opacity: 0.65 }));
  startGlow.rotation.x = -Math.PI / 2; startGlow.position.set(0, 0.01, 4); g.add(startGlow);

  // FINISH gate
  const finMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1.4 });
  [-4, 4].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.5, 10), finMat);
    post.position.set(x, 2.25, finishZ); g.add(post);
  });
  const finBeam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 0.25), finMat);
  finBeam.position.set(0, 4.6, finishZ); g.add(finBeam);
  const finGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.7, transparent: true, opacity: 0.7 }));
  finGlow.rotation.x = -Math.PI / 2; finGlow.position.set(0, 0.01, finishZ); g.add(finGlow);

  // Atmospheric roadside lights every 8 units
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfef9c3, emissiveIntensity: 2.5, transparent: true, opacity: 0.9 });
  for (let z = 0; z > finishZ; z -= 8) {
    [-11, 11].forEach(x => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 }));
      pole.position.set(x, 1.1, z); g.add(pole);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lampMat);
      bulb.position.set(x, 2.35, z); g.add(bulb);
      const lamp = new THREE.PointLight(0xfef9c3, 0.7, 10); lamp.position.set(x, 2.35, z); g.add(lamp);
    });
  }

  scene.userData.lineFollowPath = points;
  scene.userData.finishZ = finishZ;
  scene.userData.targetDist = dist;
  scene.add(g);
}

function _skyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  // Dramatic sunset/dusk sky
  scene.background=new THREE.Color(0x0a1628);
  scene.fog=new THREE.Fog(0x0c1f3a,40,85);

  // Stars in background
  const starPos=[]; for(let i=0;i<600;i++){starPos.push((Math.random()-0.5)*180,(Math.random()*30+10),(Math.random()-0.5)*180);}
  const starGeo=new THREE.BufferGeometry(); starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  g.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.22,sizeAttenuation:true,transparent:true,opacity:0.8})));

  // Launch pad platform
  const padMat=new THREE.MeshStandardMaterial({color:0x1e40af,metalness:0.8,roughness:0.2,emissive:0x1e40af,emissiveIntensity:0.15});
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,0.4,16),padMat);
  pad.position.set(0,0,5); g.add(pad);
  // Pad landing lights
  for(let a=0;a<8;a++){
    const ang=a/8*Math.PI*2;
    const light=new THREE.Mesh(new THREE.SphereGeometry(0.18,6,6),
      new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:2.5}));
    light.position.set(Math.cos(ang)*2.5,0.2+Math.sin(ang)*0.02,5+Math.sin(ang)*2.5); g.add(light);
  }

  // Giant glowing sky rings (the main course obstacles)
  const ringColors=[0x00d9ff,0xfbbf24,0xef4444,0x22c55e,0x8b5cf6,0xec4899,0xf97316];
  const ringPos=[
    [-6,3.5,-6],[4,5,-12],[-3,7,-18],[7,4.5,-24],[-5,8,-30],[2,6,-36],[0,9,-42]
  ];
  ringPos.forEach(([rx,ry,rz],i)=>{
    const col=ringColors[i%ringColors.length];
    const ringMat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.4,transparent:true,opacity:0.92});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.22,10,36),ringMat);
    ring.rotation.z=Math.sin(i*0.7)*0.3; ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
    // Inner ring (double ring effect)
    const inner=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.08,8,28),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.8,transparent:true,opacity:0.5}));
    inner.rotation.z=Math.sin(i*0.7)*0.3; inner.position.set(rx,ry,rz); g.add(inner);
    // Ring glow point light
    const rpl=new THREE.PointLight(col,1.5,12); rpl.position.set(rx,ry,rz); g.add(rpl);
  });

  // Floating sky platforms between rings
  const platCols=[0x7c3aed,0x0ea5e9,0xec4899,0x10b981,0xf59e0b];
  [[-8,1.8,-9],[5,3.5,-15],[-4,5.5,-21],[8,4,-27],[-3,6.8,-33]].forEach(([px,py,pz],i)=>{
    const col=platCols[i%platCols.length];
    const plat=new THREE.Mesh(new THREE.BoxGeometry(4.5,0.3,4.5),
      new THREE.MeshStandardMaterial({color:col,metalness:0.7,roughness:0.2}));
    plat.position.set(px,py,pz); g.add(plat);
    // Platform edge glow
    const glow=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.08,4.6),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.0}));
    glow.position.set(px,py+0.19,pz); g.add(glow);
    // Platform underlight
    const upl=new THREE.PointLight(col,0.8,8); upl.position.set(px,py-0.5,pz); g.add(upl);
  });

  // Dramatic clouds (volumetric-style clusters)
  const cloudMat=new THREE.MeshStandardMaterial({color:0x1e3a5f,roughness:1,transparent:true,opacity:0.45});
  const cloudPos=[[-15,5,-8],[-10,9,-20],[-18,7,-35],[15,6,-5],[12,10,-18],[16,8,-30],[0,12,-25],[-8,14,-40],[8,13,-42]];
  cloudPos.forEach(([cx,cy,cz])=>{
    const sz=2+Math.random()*2;
    [sz,sz*1.4,sz*0.9,sz*0.7].forEach((r,ci)=>{
      const c=new THREE.Mesh(new THREE.SphereGeometry(r,8,5),cloudMat);
      c.position.set(cx+ci*r*1.1-r,cy+Math.sin(ci)*0.5,cz+ci*0.4); g.add(c);
    });
  });

  // Atmospheric distant city below
  const cityCols=[0x0a1628,0x0d1f38,0x102240];
  for(let bi=0;bi<16;bi++){
    const bx=(Math.random()-0.5)*60, bz=-10-Math.random()*55;
    const bh=6+Math.random()*18, bw=2.5+Math.random()*4;
    const bld=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bw*0.7),
      new THREE.MeshStandardMaterial({color:cityCols[bi%3],roughness:0.7,metalness:0.5}));
    bld.position.set(bx+28*(bi%2===0?1:-1),-bh*0.5+2,bz); g.add(bld);
    // Building top light
    const tl=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,6),
      new THREE.MeshStandardMaterial({color:0xef4444,emissive:0xef4444,emissiveIntensity:2.0}));
    tl.position.set(bx+28*(bi%2===0?1:-1),2+bh*0.5,bz); g.add(tl);
  }

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
  // Anti-gravity neon circuit — deep space floating track
  scene.background=_makeSkyTex([[0,'#02001a'],[0.3,'#060030'],[0.6,'#100050'],[1,'#02001a']]);
  scene.fog=new THREE.FogExp2(0x04002a,0.016);

  // Star field
  const starPos=[]; for(let i=0;i<800;i++){starPos.push((Math.random()-0.5)*200,(Math.random()*40-5),(Math.random()-0.5)*200);}
  const starGeo=new THREE.BufferGeometry(); starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  g.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.18,transparent:true,opacity:0.85,sizeAttenuation:true})));

  // Grid floor (infinite feel)
  const gridMat=new THREE.LineBasicMaterial({color:0x2244aa,transparent:true,opacity:0.55});
  for(let i=-28;i<=28;i+=2.5){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-28,-2.5,i),new THREE.Vector3(28,-2.5,i)]),gridMat));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,-2.5,-40),new THREE.Vector3(i,-2.5,10)]),gridMat));
  }
  // Grid glow
  _addPl(scene,0x2244ff,0.6,40,0,-2,-15);

  // Launch pad with neon edge
  const padMat=new THREE.MeshStandardMaterial({color:0x0d1640,metalness:0.9,roughness:0.15});
  const pad=new THREE.Mesh(new THREE.BoxGeometry(5,0.22,5),padMat);
  pad.position.set(0,0,6); g.add(pad);
  const padGlow=new THREE.Mesh(new THREE.BoxGeometry(5.1,0.05,5.1),new THREE.MeshBasicMaterial({color:0x4488ff}));
  padGlow.position.set(0,0.12,6); g.add(padGlow);
  _addPl(scene,0x4488ff,1.0,10,0,0.5,6);

  // Floating platforms with bottom-glow
  const platCols=[0x7c3aed,0x0ea5e9,0xec4899,0x22c55e,0xf59e0b,0x06b6d4];
  const platData=[[-5,1.2,-5,5],[4,2,-10,6],[-4,3,-15,5],[5,2.5,-20,6],[-3,4,-26,5],[0,3.5,-32,7]];
  platData.forEach(([px,py,pz,sz],i)=>{
    const col=platCols[i%platCols.length];
    const plat=new THREE.Mesh(new THREE.BoxGeometry(sz,0.22,sz),new THREE.MeshStandardMaterial({color:col,metalness:0.75,roughness:0.18,emissive:col,emissiveIntensity:0.08}));
    plat.position.set(px,py,pz); g.add(plat);
    // Neon edge trim
    const edge=new THREE.Mesh(new THREE.BoxGeometry(sz+0.1,0.05,sz+0.1),new THREE.MeshBasicMaterial({color:col}));
    edge.position.set(px,py+0.12,pz); g.add(edge);
    // Underside glow beam
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(sz*0.25,sz*0.5,py+2.5,8,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.06,side:THREE.DoubleSide}));
    beam.position.set(px,-1.2,pz); g.add(beam);
    _addPl(scene,col,1.4,12,px,py-0.4,pz);
    // Checkpoint ring
    const ring=new THREE.Mesh(new THREE.TorusGeometry(sz*0.52,0.1,10,32),new THREE.MeshBasicMaterial({color:col}));
    ring.rotation.x=Math.PI/2; ring.position.set(px,py+0.18,pz); ring.name='cp'; g.add(ring);
  });

  // Holographic waypoint pillars between platforms
  [[-5,0,-5,0x7c3aed],[4,0,-10,0x0ea5e9],[-4,0,-15,0xec4899]].forEach(([px,,pz,col])=>{
    const pillar=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,8,8),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.3}));
    pillar.position.set(px,0,pz); g.add(pillar);
  });

  // Distant floating city rings (decoration)
  [[20,8,-30,0x0066ff],[-22,12,-40,0x6600ff],[0,15,-50,0xff0066]].forEach(([rx,ry,rz,col])=>{
    const dRing=new THREE.Mesh(new THREE.TorusGeometry(8,0.3,8,36),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.3}));
    dRing.rotation.x=Math.PI/2; dRing.position.set(rx,ry,rz); g.add(dRing);
  });

  // Bobbing animation on platforms
  if(!scene.userData.movers) scene.userData.movers=[];
  const platMeshes=g.children.filter(c=>c.geometry?.type==='BoxGeometry'&&c.position.y>0.5);
  scene.userData.movers.push(t=>{
    platMeshes.forEach((p,i)=>{p.position.y+=Math.sin(t*1.2+i*0.9)*0.002;});
  });

  scene.add(new THREE.AmbientLight(0x060030,0.5));
  _addPl(scene,0x8844ff,1.5,50,0,10,-15);
  scene.add(g);
}

function _addPl(scene,col,int,dist,x,y,z){const l=new THREE.PointLight(col,int,dist);l.position.set(x,y,z);scene.add(l);}
function _addDl(scene,col,int,x,y,z,shadow){const l=new THREE.DirectionalLight(col,int);l.position.set(x,y,z);if(shadow)l.castShadow=true;scene.add(l);}

function _roughArena(scene,ch){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#1a0400'],[0.3,'#3d0e00'],[0.55,'#7a2200'],[0.75,'#b84010'],[1,'#e86030']]);
  scene.fog=new THREE.FogExp2(0x3d1200,0.018);

  const floorMat=new THREE.MeshStandardMaterial({color:0x3a2010,roughness:1,metalness:0.05});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,80),floorMat);
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);

  // Lava cracks
  const lavaMat=new THREE.MeshBasicMaterial({color:0xff4400});
  [[-5,-6,12,0.25],[3,-10,0.2,8],[-7,-14,0.2,6],[4,-18,10,0.25],[-3,-22,8,0.2],[2,-28,0.2,7]].forEach(([x,z,w,d])=>{
    const crack=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lavaMat);
    crack.rotation.x=-Math.PI/2; crack.position.set(x,0.02,z); g.add(crack);
    _addPl(scene,0xff3300,0.6,8,x,0.3,z);
  });

  // Volcanic rock spires
  const rockMat=new THREE.MeshStandardMaterial({color:0x2d1408,roughness:1});
  const hotRockMat=new THREE.MeshStandardMaterial({color:0x4a1a00,roughness:0.9,emissive:0x300800,emissiveIntensity:0.4});
  [[-8,-4,1.4,4],[-6,-10,0.9,3],[7,-7,1.2,5],[-9,-18,1.1,4],[8,-16,1.5,6],[-5,-24,1.0,3],[6,-22,0.8,3.5],
   [-10,-30,1.3,5],[9,-28,1.1,4],[-7,-36,0.9,3],[8,-34,1.4,5]].forEach(([x,z,r,h],i)=>{
    const spire=new THREE.Mesh(new THREE.ConeGeometry(r,h,7),i%3===0?hotRockMat:rockMat);
    spire.position.set(x,h/2,z); spire.rotation.y=Math.random()*Math.PI; spire.castShadow=true; g.add(spire);
    if(i%3===0) _addPl(scene,0xff4400,0.5,6,x,0.5,z);
  });

  // Destroyed tank hulks
  const metalMat=new THREE.MeshStandardMaterial({color:0x4a3820,metalness:0.6,roughness:0.8});
  const burnMat=new THREE.MeshStandardMaterial({color:0x1a0e00,metalness:0.4,roughness:0.95});
  [[-4,-8],[5,-20],[-6,-32]].forEach(([x,z])=>{
    const hull=new THREE.Mesh(new THREE.BoxGeometry(3.5,1.2,2),metalMat);
    hull.position.set(x,0.6,z); hull.castShadow=true; g.add(hull);
    const turret=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.8,0.6,8),burnMat);
    turret.position.set(x+0.3,1.35,z); g.add(turret);
    _addPl(scene,0xff5500,1.2,8,x,1.5,z);
  });

  // Bomb craters
  const craterMat=new THREE.MeshStandardMaterial({color:0x1a0a00,roughness:1});
  [[-2,-3],[3,-13],[-5,-20],[4,-30],[-3,-38]].forEach(([cx,cz])=>{
    const r=1.2+Math.random()*0.8;
    const crater=new THREE.Mesh(new THREE.CylinderGeometry(r*0.5,r,0.4,12),craterMat);
    crater.position.set(cx,-0.1,cz); g.add(crater);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(r*0.3,10),lavaMat);
    pool.rotation.x=-Math.PI/2; pool.position.set(cx,0.03,cz); g.add(pool);
    _addPl(scene,0xff2200,0.4,5,cx,0.2,cz);
  });

  // Checkpoint rings — fiery orange
  [-8,-18,-28,-38].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.18,10,32),new THREE.MeshBasicMaterial({color:0xff5500}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.7,z); ring.name='cp'; g.add(ring);
    _addPl(scene,0xff4400,1.0,10,0,1.5,z);
  });

  // Smoke particles
  if(!scene.userData.movers) scene.userData.movers=[];
  const smokeGeo=new THREE.BufferGeometry();
  const smokeCount=80; const smokePos=new Float32Array(smokeCount*3);
  const smokeData=[];
  for(let i=0;i<smokeCount;i++){
    const sx=(-8+Math.random()*16); const sz=(-40+Math.random()*45);
    smokePos[i*3]=sx; smokePos[i*3+1]=Math.random()*6; smokePos[i*3+2]=sz;
    smokeData.push({x:sx,z:sz,vy:0.04+Math.random()*0.04});
  }
  smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokePos,3));
  const smokePts=new THREE.Points(smokeGeo,new THREE.PointsMaterial({color:0x331100,size:1.8,transparent:true,opacity:0.35,depthWrite:false,sizeAttenuation:true}));
  scene.add(smokePts);
  scene.userData.movers.push(t=>{
    const pos=smokeGeo.attributes.position.array;
    for(let i=0;i<smokeCount;i++){
      pos[i*3+1]+=smokeData[i].vy;
      pos[i*3]+=Math.sin(t*0.4+i)*0.004;
      if(pos[i*3+1]>10){pos[i*3+1]=0;pos[i*3]=smokeData[i].x;pos[i*3+2]=smokeData[i].z;}
    }
    smokeGeo.attributes.position.needsUpdate=true;
  });

  scene.add(new THREE.AmbientLight(0x3a1000,0.7));
  _addDl(scene,0xff6620,0.9,0,15,20,true);
  _addPl(scene,0xff2200,2.0,60,0,12,-20);
  scene.add(g);
}

function _factoryArena(scene){
  const g=new THREE.Group(); g.name='arena';
  // Industrial night-shift factory — dark steel & neon safety lighting
  scene.background=_makeSkyTex([[0,'#060a10'],[0.5,'#0d1520'],[1,'#060a10']]);
  scene.fog=new THREE.Fog(0x0a1018,22,55);

  // Polished concrete floor with grid markings
  const floorMat=new THREE.MeshStandardMaterial({color:0x2d3748,roughness:0.55,metalness:0.25});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,65),floorMat);
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);

  // Yellow safety lanes
  const laneMat=new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:0.7});
  [-7,0,7].forEach(x=>{
    const lane=new THREE.Mesh(new THREE.PlaneGeometry(0.18,60),laneMat);
    lane.rotation.x=-Math.PI/2; lane.position.set(x,0.01,0); g.add(lane);
  });

  // Heavy industrial machinery — stamping presses
  const machineMat=new THREE.MeshStandardMaterial({color:0x374151,metalness:0.7,roughness:0.3});
  const accentMat=new THREE.MeshStandardMaterial({color:0xf59e0b,metalness:0.5,roughness:0.4,emissive:0xf59e0b,emissiveIntensity:0.15});
  [[-10,0,-6],[-10,0,-14],[-10,0,-22],[10,0,-6],[10,0,-14],[10,0,-22]].forEach(([x,,z])=>{
    const base=new THREE.Mesh(new THREE.BoxGeometry(4,3.5,3.5),machineMat);
    base.position.set(x,1.75,z); base.castShadow=true; g.add(base);
    const head=new THREE.Mesh(new THREE.BoxGeometry(3.5,1.2,3.2),new THREE.MeshStandardMaterial({color:0x1f2937,metalness:0.8}));
    head.position.set(x,3.8,z); g.add(head);
    // Warning stripes on machine sides
    for(let i=0;i<3;i++){
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(0.3,3.5,0.12),accentMat);
      stripe.position.set(x+(i-1)*1.2,1.75,z+1.82); g.add(stripe);
    }
    _addPl(scene,0xfbbf24,0.4,6,x,4,z);
  });

  // Central conveyor belts (3 parallel)
  const beltFrameMat=new THREE.MeshStandardMaterial({color:0x1f2937,metalness:0.6,roughness:0.5});
  const beltSurfMat=new THREE.MeshStandardMaterial({color:0x111827,roughness:0.7});
  [-4,0,4].forEach(bx=>{
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.28,30),beltFrameMat);
    frame.position.set(bx,0.44,0); frame.castShadow=true; g.add(frame);
    const surf=new THREE.Mesh(new THREE.BoxGeometry(1.38,0.06,29.6),beltSurfMat);
    surf.position.set(bx,0.59,0); g.add(surf);
    // Belt rollers at ends
    [-15,15].forEach(z=>{
      const roller=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,1.6,12),new THREE.MeshStandardMaterial({color:0x4b5563,metalness:0.8}));
      roller.rotation.z=Math.PI/2; roller.position.set(bx,0.44,z); g.add(roller);
    });
    // Animated belt stripes (movers)
    if(!scene.userData.movers) scene.userData.movers=[];
    const stripes=[];
    for(let s=0;s<8;s++){
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.36,0.04,0.4),new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:0.6}));
      stripe.position.set(bx,0.62,-14+s*4); g.add(stripe);
      stripes.push(stripe);
    }
    scene.userData.movers.push(()=>{
      stripes.forEach(s=>{ s.position.z+=0.04; if(s.position.z>15) s.position.z=-14; });
    });
  });

  // Colored product boxes on belt
  const boxCols=[0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xec4899];
  [[-4,3],[-4,-6],[-4,-14],[0,6],[0,-2],[0,-10],[4,9],[4,1],[4,-7]].forEach(([bx,bz],i)=>{
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.62,0.65),new THREE.MeshStandardMaterial({color:boxCols[i%5],roughness:0.4,emissive:boxCols[i%5],emissiveIntensity:0.08}));
    box.position.set(bx,0.94,bz); box.castShadow=true; g.add(box);
  });

  // Overhead gantry crane rail
  const railMat=new THREE.MeshStandardMaterial({color:0x6b7280,metalness:0.8});
  const rail=new THREE.Mesh(new THREE.BoxGeometry(22,0.35,0.35),railMat);
  rail.position.set(0,7,0); g.add(rail);
  const crane=new THREE.Mesh(new THREE.BoxGeometry(0.4,2,0.4),railMat);
  crane.position.set(-6,6,0); g.add(crane);
  const hook=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,1,8),railMat);
  hook.position.set(-6,4.8,0); g.add(hook);
  // Animate crane sliding along rail
  if(!scene.userData.movers) scene.userData.movers=[];
  let craneDir=1;
  scene.userData.movers.push(()=>{
    crane.position.x+=0.015*craneDir; hook.position.x+=0.015*craneDir;
    if(crane.position.x>9||crane.position.x<-9) craneDir*=-1;
  });

  // Tall factory walls with windows
  const wallMat=new THREE.MeshStandardMaterial({color:0x1e2939,roughness:0.8});
  [[-15,4.5,0,0.4,9,55],[15,4.5,0,0.4,9,55]].forEach(([x,y,z,w,h,d])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat);
    wall.position.set(x,y,z); g.add(wall);
    // Windows with light behind them
    for(let wi=0;wi<6;wi++){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.8),new THREE.MeshBasicMaterial({color:0xfff5d0,transparent:true,opacity:0.6}));
      win.rotation.y=x>0?-Math.PI/2:Math.PI/2; win.position.set(x+(x>0?-0.22:0.22),y+1,-20+wi*8); g.add(win);
      _addPl(scene,0xfff5d0,0.3,6,x,y+1,-20+wi*8);
    }
  });

  // Overhead industrial lights (grid)
  for(let lx=-8;lx<=8;lx+=8) for(let lz=-20;lz<=10;lz+=10){
    const fixture=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.15,0.5),new THREE.MeshStandardMaterial({color:0x9ca3af}));
    fixture.position.set(lx,8,lz); g.add(fixture);
    _addPl(scene,0xfff5d0,1.0,14,lx,7.5,lz);
  }

  // Checkpoint rings — cyan industrial
  [-6,-16,-26].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.14,10,32),new THREE.MeshBasicMaterial({color:0x00d9ff}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'; g.add(ring);
    _addPl(scene,0x00d9ff,0.8,10,0,1,z);
  });

  scene.add(new THREE.AmbientLight(0x1a2a3a,0.6));
  _addDl(scene,0xd0e8ff,0.5,0,12,10,true);
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
  scene.background=new THREE.Color(0x00000a);
  scene.fog=new THREE.Fog(0x00000a,48,95);

  // Dense star field — thousands of stars
  const sp=[]; for(let i=0;i<1800;i++){sp.push((Math.random()-.5)*200,(Math.random()*70-10),(Math.random()-.5)*200);}
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.22,sizeAttenuation:true,transparent:true,opacity:0.9})));

  // Distant galaxy spiral glow (just a few bright clusters)
  const galaxyCols=[0x7c3aed,0x1e40af,0x0c4a6e];
  [[-60,15,-80],[50,20,-90],[-40,25,-70]].forEach(([gx,gy,gz],i)=>{
    const nebula=new THREE.Mesh(new THREE.SphereGeometry(12+i*4,12,8),
      new THREE.MeshStandardMaterial({color:galaxyCols[i],emissive:galaxyCols[i],emissiveIntensity:0.3,transparent:true,opacity:0.18}));
    nebula.position.set(gx,gy,gz); g.add(nebula);
  });

  // Moon/asteroid surface floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,95),
    new THREE.MeshStandardMaterial({color:0x1c1917,roughness:0.97,metalness:0.08}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);

  // Surface cracks (glow lines)
  const crackMat=new THREE.MeshStandardMaterial({color:0x7c3aed,emissive:0x7c3aed,emissiveIntensity:0.7,transparent:true,opacity:0.5});
  [[-5,-8],[3,-15],[-8,-22],[6,-30],[-3,-38]].forEach(([cx,cz])=>{
    const crack=new THREE.Mesh(new THREE.PlaneGeometry(0.1+Math.random()*0.15,4+Math.random()*6),crackMat);
    crack.rotation.x=-Math.PI/2; crack.rotation.z=Math.random()*Math.PI;
    crack.position.set(cx,0.01,cz); g.add(crack);
  });

  // Craters — deeper and more dramatic
  const cMat=new THREE.MeshStandardMaterial({color:0x0c0a09,roughness:0.99});
  const craterRimMat=new THREE.MeshStandardMaterial({color:0x2c2520,roughness:0.96});
  [[-3,-6,1.4],[2,-12,1.0],[-5,-19,1.8],[4,-26,1.2],[-1,-33,1.6],[5,-10,0.9],[-4,-15,1.3],[2,-40,2.0]].forEach(([cx,cz,r])=>{
    const crater=new THREE.Mesh(new THREE.CylinderGeometry(r*0.7,r,0.3,14),cMat);
    crater.position.set(cx,-0.05,cz); g.add(crater);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(r,0.22,6,14),craterRimMat);
    rim.rotation.x=Math.PI/2; rim.position.set(cx,0.1,cz); g.add(rim);
  });

  // Alien rock formations
  const rockMat=new THREE.MeshStandardMaterial({color:0x2d2620,roughness:0.92,metalness:0.08});
  const glowRockMat=new THREE.MeshStandardMaterial({color:0x4c1d95,emissive:0x4c1d95,emissiveIntensity:0.6,roughness:0.5,metalness:0.3});
  [[-6,-4,1.2],[4,-9,0.9],[-3,-16,1.5],[6,-22,1.0],[-5,-28,1.8],[3,-35,1.1]].forEach(([rx,rz,r],i)=>{
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),i%3===0?glowRockMat:rockMat);
    rock.position.set(rx,r*0.6,rz); rock.castShadow=true;
    rock.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,0); g.add(rock);
  });

  // Space station / base — large dramatic structure
  const stationMat=new THREE.MeshStandardMaterial({color:0x374151,metalness:0.85,roughness:0.18});
  const station=new THREE.Mesh(new THREE.BoxGeometry(5,1.5,5),stationMat);
  station.position.set(0,0.75,5.5); g.add(station);
  // Solar panels
  [-5,5].forEach(x=>{
    const panel=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.06,2),
      new THREE.MeshStandardMaterial({color:0x1e3a5f,metalness:0.6,roughness:0.3,emissive:0x1e40af,emissiveIntensity:0.3}));
    panel.position.set(x,1.7,5.5); g.add(panel);
  });
  // Station lights
  for(let a=0;a<6;a++){
    const ang=a/6*Math.PI*2;
    const sl=new THREE.Mesh(new THREE.SphereGeometry(0.15,6,6),
      new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:2.5}));
    sl.position.set(Math.cos(ang)*2.2,1.8,5.5+Math.sin(ang)*2.2); g.add(sl);
  }

  // Checkpoint neon rings — floating in space
  const cpCols=[0x00d9ff,0x7c3aed,0xec4899,0xf59e0b,0x22c55e];
  [[-6,0.8,-8],[3,1.2,-16],[-4,1.0,-24],[7,1.5,-32],[-2,1.0,-40]].forEach(([rx,ry,rz],i)=>{
    const col=cpCols[i];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.16,10,34),
      new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.6,transparent:true,opacity:0.92}));
    ring.rotation.x=Math.PI/2; ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
    const pl=new THREE.PointLight(col,2.0,15); pl.position.set(rx,ry+1,rz); g.add(pl);
    // Orbiting micro satellite effect
    const sat=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.15,0.4),
      new THREE.MeshStandardMaterial({color:0x6b7280,metalness:0.9,roughness:0.2}));
    sat.position.set(rx,ry+3.2,rz); sat.name=`mover_sat${i}`; g.add(sat);
  });

  // Dramatic planets in sky
  const planet1=new THREE.Mesh(new THREE.SphereGeometry(11,20,16),
    new THREE.MeshStandardMaterial({color:0xb45309,emissive:0x78350f,emissiveIntensity:0.25,roughness:0.85}));
  planet1.position.set(35,22,-70); g.add(planet1);
  // Planet ring
  const pRing=new THREE.Mesh(new THREE.TorusGeometry(15,1.5,4,50),
    new THREE.MeshStandardMaterial({color:0xd97706,transparent:true,opacity:0.5}));
  pRing.rotation.x=Math.PI/3; pRing.position.set(35,22,-70); g.add(pRing);

  const planet2=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),
    new THREE.MeshStandardMaterial({color:0x1d4ed8,emissive:0x1e3a8a,emissiveIntensity:0.3,roughness:0.7}));
  planet2.position.set(-45,18,-60); g.add(planet2);

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
  // Crystal Cavern Expedition — 9 zones of bioluminescent discovery
  // Nebula + starfield sky (Crystal Run reference: purple/pink nebula, stars, darker at top)
  const skyCanvas=document.createElement('canvas'); skyCanvas.width=512; skyCanvas.height=512;
  const skyCtx=skyCanvas.getContext('2d');
  const skyGrad=skyCtx.createLinearGradient(0,0,0,512);
  skyGrad.addColorStop(0,'#04020e'); skyGrad.addColorStop(0.45,'#160b2e');
  skyGrad.addColorStop(0.7,'#3d1a55'); skyGrad.addColorStop(0.85,'#6b2a6e'); skyGrad.addColorStop(1,'#0a0616');
  skyCtx.fillStyle=skyGrad; skyCtx.fillRect(0,0,512,512);
  // Nebula wisps
  for(let i=0;i<7;i++){
    const nx=Math.random()*512, ny=120+Math.random()*240, nr=50+Math.random()*90;
    const ng=skyCtx.createRadialGradient(nx,ny,0,nx,ny,nr);
    const hue=[270,290,320,250][i%4];
    ng.addColorStop(0,`hsla(${hue},70%,45%,0.16)`); ng.addColorStop(1,'rgba(0,0,0,0)');
    skyCtx.fillStyle=ng; skyCtx.beginPath(); skyCtx.arc(nx,ny,nr,0,Math.PI*2); skyCtx.fill();
  }
  // Stars — denser near the top
  for(let i=0;i<240;i++){
    const sy=Math.pow(Math.random(),1.6)*340;
    const sx=Math.random()*512;
    const sr=Math.random()*1.1+0.3;
    skyCtx.fillStyle=`rgba(255,255,255,${0.35+Math.random()*0.55})`;
    skyCtx.beginPath(); skyCtx.arc(sx,sy,sr,0,Math.PI*2); skyCtx.fill();
  }
  const skyTex=new THREE.CanvasTexture(skyCanvas);
  skyTex.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=skyTex;
  scene.userData.customSky=true; // prevent applyArenaAtmosphere from overriding
  scene.fog = new THREE.FogExp2(0x0a0616, 0.022);

  const dist = 50;
  const centerZ = (4 - dist) / 2;

  // ── CAVE FLOOR — procedural rocky texture (cracks, patches, depth) ──────────
  const rockCanvas=document.createElement('canvas'); rockCanvas.width=256; rockCanvas.height=256;
  const rctx=rockCanvas.getContext('2d');
  rctx.fillStyle='#1a1230'; rctx.fillRect(0,0,256,256);
  // Tonal rock patches
  for(let i=0;i<40;i++){
    const px=Math.random()*256, py=Math.random()*256, pr=10+Math.random()*26;
    const pg=rctx.createRadialGradient(px,py,0,px,py,pr);
    const shade=Math.random()>0.5?'rgba(42,30,70,0.5)':'rgba(10,6,24,0.55)';
    pg.addColorStop(0,shade); pg.addColorStop(1,'rgba(0,0,0,0)');
    rctx.fillStyle=pg; rctx.beginPath(); rctx.arc(px,py,pr,0,Math.PI*2); rctx.fill();
  }
  // Crack lines
  rctx.strokeStyle='rgba(5,3,14,0.85)'; rctx.lineWidth=1.2;
  for(let i=0;i<14;i++){
    let cx2=Math.random()*256, cy2=Math.random()*256;
    rctx.beginPath(); rctx.moveTo(cx2,cy2);
    for(let j=0;j<5;j++){cx2+=(Math.random()-0.5)*36; cy2+=(Math.random()-0.5)*36; rctx.lineTo(cx2,cy2);}
    rctx.stroke();
  }
  // Faint crystal-dust speckle
  for(let i=0;i<160;i++){
    rctx.fillStyle=`rgba(${150+Math.random()*60|0},${110+Math.random()*40|0},255,${Math.random()*0.1})`;
    rctx.fillRect(Math.random()*256,Math.random()*256,1.4,1.4);
  }
  const rockTex=new THREE.CanvasTexture(rockCanvas);
  rockTex.wrapS=rockTex.wrapT=THREE.RepeatWrapping; rockTex.repeat.set(5,(dist+16)/6);
  const cavFloorMat = new THREE.MeshStandardMaterial({map:rockTex,color:0xbdb0e8,roughness:0.95,metalness:0.08});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, dist + 16), cavFloorMat);
  floor.rotation.x = -Math.PI/2; floor.position.z = centerZ; floor.receiveShadow=true; g.add(floor);

  // Rock cracks on floor (thin dark lines)
  const crackMat = new THREE.LineBasicMaterial({color:0x0a0618,transparent:true,opacity:0.7});
  [[-7,4,-4,4,-20],[3,4,3,4,-40],[-3,4,-3,4,-28],[5,4,5,4,-36]].forEach(([x1,y1,x2,y2,z])=>{
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,0.01,z-3),new THREE.Vector3(x2,0.01,z+3)]),crackMat));
  });

  // ── 9 CAVERN ZONES ──────────────────────────────────────────────────────────
  const C_COLS=['#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#a78bfa','#06b6d4','#8b5cf6','#7c3aed','#fbbf24'];
  const C_NAMES=['CAVERN ENTRANCE','CRYSTAL FOREST','UNDERGROUND LAKE','MUSHROOM GROVE',
                 'TIGHT PASSAGE','SPIRE CHAMBER','SAFE DEN','ANCIENT GATEWAY','GEMSTONE THRONE'];
  const cz9=C_COLS.map((col,i)=>({z:4-i*(dist/8),col,name:C_NAMES[i],num:i+1}));

  const crystalColors=[0x9b59b6,0x8b5cf6,0x7c3aed,0x6d28d9,0xa78bfa,0xddd6fe];
  const crysMat=(col)=>new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.65,transparent:true,opacity:0.88,roughness:0.15,metalness:0.55});

  // Helper: crystal cluster at a position
  const _crystCluster=(cx,cz,size=1)=>{
    const angles=[0,72,144,216,288];
    angles.forEach((a,i)=>{
      const rad=a*Math.PI/180; const r=size*(0.3+i*0.18);
      const h=size*(0.9+i*0.35); const col=crystalColors[i%crystalColors.length];
      const crys=new THREE.Mesh(new THREE.ConeGeometry(size*0.14+i*0.04,h,5),crysMat(col));
      crys.position.set(cx+Math.cos(rad)*r,h/2,cz+Math.sin(rad)*r);
      crys.rotation.z=(Math.random()-0.5)*0.3; crys.castShadow=true; g.add(crys);
    });
  };

  // Helper: stalactite cluster hanging from ceiling at y=ceiling
  const _stalactiteAt=(x,z,ceilY=11)=>{
    const col=crystalColors[Math.floor(Math.random()*crystalColors.length)];
    const h=0.8+Math.random()*1.6;
    const crys=new THREE.Mesh(new THREE.ConeGeometry(0.18+Math.random()*0.1,h,5),crysMat(col));
    crys.position.set(x,ceilY-h/2,z); crys.rotation.z=Math.PI; g.add(crys);
  };

  // ── ZONE 1: CAVERN ENTRANCE ──────────────────────────────────────────────────
  const z1c=cz9[0].z;
  // Stone arch entrance
  const stoneArchMat=new THREE.MeshStandardMaterial({color:0x2a1f3d,roughness:0.95});
  [-5.5,5.5].forEach(sx=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.8,9,8),stoneArchMat);
    post.position.set(sx,4.5,z1c-1); g.add(post);
  });
  const archBeam=new THREE.Mesh(new THREE.BoxGeometry(13.5,1.0,0.9),stoneArchMat);
  archBeam.position.set(0,9.2,z1c-1); g.add(archBeam);
  // Crystal clusters at entrance sides
  _crystCluster(-7,z1c-2,1.4); _crystCluster(7,z1c-2,1.4);
  // Bioluminescent glow patches on floor
  const bioMat=new THREE.MeshBasicMaterial({color:0x8b5cf6,transparent:true,opacity:0.25,depthWrite:false});
  [[-4,z1c+1],[4,z1c-3],[0,z1c-5]].forEach(([px,pz])=>{
    const bio=new THREE.Mesh(new THREE.CircleGeometry(1.2,12),bioMat);
    bio.rotation.x=-Math.PI/2; bio.position.set(px,0.01,pz); g.add(bio);
  });
  // Welcome glow + zone markers
  const entPL=new THREE.PointLight(0xa78bfa,1.8,14); entPL.position.set(0,5,z1c); g.add(entPL);
  _zoneMarker(g,scene,-8,z1c,1,'#a78bfa'); _zoneMarker(g,scene,8,z1c,1,'#a78bfa');
  _placeCoins(scene,g,_coinGrid(0,z1c,9,5,12));
  // Zone arch between Z1 and Z2
  _zoneArch(g,0,cz9[0].z-dist/16,'#a78bfa',5.5,5.2);

  // ── ZONE 2: CRYSTAL FOREST ───────────────────────────────────────────────────
  const z2c=cz9[1].z;
  // Dense crystal clusters scattered through this zone
  [[-5,z2c+2],[5,z2c+1],[-3,z2c-2],[3,z2c-4],[-6,z2c-6],[0,z2c+3]].forEach(([cx,cz])=>_crystCluster(cx,cz,1.1));
  // Ceiling stalactites
  [[-4,z2c+1],[-1,z2c-1],[3,z2c-3],[5,z2c+2],[-6,z2c-5],[2,z2c-6]].forEach(([sx,sz])=>_stalactiteAt(sx,sz,12));
  // Glowing crystal pillars (tall vertical crystals marking path edge)
  [[-8,z2c],[8,z2c],[-8,z2c-4],[8,z2c-4]].forEach(([px,pz],i)=>{
    const col=crystalColors[i%crystalColors.length];
    const pil=new THREE.Mesh(new THREE.ConeGeometry(0.22,3.5+i*0.4,5),crysMat(col));
    pil.position.set(px,1.75+i*0.2,pz); g.add(pil);
    const pl=new THREE.PointLight(col,0.7,9); pl.position.set(px,3.5,pz); g.add(pl);
  });
  _zoneMarker(g,scene,-8,z2c,2,'#8b5cf6'); _zoneMarker(g,scene,8,z2c,2,'#8b5cf6');
  _placeCoins(scene,g,_coinGrid(0,z2c,10,6,14));
  _placeGems(scene,g,[[-4,0.5,z2c-1],[4,0.5,z2c-3]]);
  _zoneArch(g,0,cz9[1].z-dist/16,'#8b5cf6',5.5,5.2);

  // ── ZONE 3: UNDERGROUND LAKE ─────────────────────────────────────────────────
  const z3c=cz9[2].z;
  // Lake surface — glowing cyan-teal
  const lakeMat=new THREE.MeshStandardMaterial({color:0x0a1a2e,emissive:0x0d4a6e,emissiveIntensity:0.35,transparent:true,opacity:0.82,roughness:0.12,metalness:0.4});
  const lake=new THREE.Mesh(new THREE.PlaneGeometry(16,8),lakeMat);
  lake.rotation.x=-Math.PI/2; lake.position.set(0,0.005,z3c-2); g.add(lake);
  // Lake glow reflection
  const lakeGlowMat=new THREE.MeshBasicMaterial({color:0x06b6d4,transparent:true,opacity:0.08,depthWrite:false});
  const lakeGlow=new THREE.Mesh(new THREE.PlaneGeometry(18,10),lakeGlowMat);
  lakeGlow.rotation.x=-Math.PI/2; lakeGlow.position.set(0,0.02,z3c-2); g.add(lakeGlow);
  // Stepping stones across the lake
  const stoneMat2=new THREE.MeshStandardMaterial({color:0x3a2d55,roughness:0.9,metalness:0.08});
  [[-4,z3c+1],[0,z3c-1],[4,z3c-3],[-3,z3c-5],[3,z3c-5]].forEach(([sx,sz],i)=>{
    const stone=new THREE.Mesh(new THREE.CylinderGeometry(0.8+i*0.1,0.95,0.22,7),stoneMat2);
    stone.position.set(sx,0.11,sz); g.add(stone);
    // Coin on each stone
    _placeCoins(scene,g,[[sx,0.35,sz]],8);
  });
  // Lake lanterns (floating crystals over water)
  [[-6,z3c],[6,z3c-2],[0,z3c-4]].forEach(([lx,lz],i)=>{
    const col=crystalColors[i%3+2];
    const lantern=new THREE.Mesh(new THREE.OctahedronGeometry(0.35),crysMat(col));
    lantern.position.set(lx,1.8,lz); g.add(lantern);
    const lpl=new THREE.PointLight(col,0.8,10); lpl.position.set(lx,1.8,lz); g.add(lpl);
  });
  const lakePL=new THREE.PointLight(0x06b6d4,1.2,16); lakePL.position.set(0,3,z3c-2); g.add(lakePL);
  _zoneMarker(g,scene,-8,z3c,3,'#7c3aed'); _zoneMarker(g,scene,8,z3c,3,'#7c3aed');
  _placeCoins(scene,g,_coinGrid(-6,z3c-7,5,3,6)); _placeCoins(scene,g,_coinGrid(6,z3c-7,5,3,6));
  _placeShields(scene,g,[[0,0.5,z3c+2]]);
  _zoneArch(g,0,cz9[2].z-dist/16,'#7c3aed',5.5,5.2);

  // ── ZONE 4: MUSHROOM GROVE ───────────────────────────────────────────────────
  const z4c=cz9[3].z;
  // Glowing mushrooms
  const mushStemMat=new THREE.MeshStandardMaterial({color:0x3d2b5e,roughness:0.85});
  const _mushroom=(mx,mz,h,capCol)=>{
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.18,h,7),mushStemMat);
    stem.position.set(mx,h/2,mz); g.add(stem);
    const capMat=new THREE.MeshStandardMaterial({color:capCol,emissive:capCol,emissiveIntensity:0.7,transparent:true,opacity:0.9});
    const cap=new THREE.Mesh(new THREE.SphereGeometry(h*0.42,10,7,0,Math.PI*2,0,Math.PI/2),capMat);
    cap.position.set(mx,h+h*0.12,mz); g.add(cap);
    const pl=new THREE.PointLight(capCol,0.55,7); pl.position.set(mx,h*1.3,mz); g.add(pl);
  };
  [[-5,z4c+1,2.2,0xa78bfa],[5,z4c-1,3.0,0x8b5cf6],[-3,z4c-3,1.8,0x7c3aed],
   [3,z4c-5,2.5,0x06b6d4],[-6,z4c-4,1.5,0xa78bfa],[7,z4c+2,2.8,0x8b5cf6],
   [0,z4c-7,3.2,0x7c3aed]].forEach(([mx,mz,mh,mc])=>_mushroom(mx,mz,mh,mc));
  // Bioluminescent floor patches
  [[-4,z4c],[4,z4c-2],[0,z4c-4],[-5,z4c-6],[5,z4c-5]].forEach(([px,pz],i)=>{
    const bMat=new THREE.MeshBasicMaterial({color:crystalColors[i%crystalColors.length],transparent:true,opacity:0.18,depthWrite:false});
    const bio=new THREE.Mesh(new THREE.CircleGeometry(1.0+i*0.2,12),bMat);
    bio.rotation.x=-Math.PI/2; bio.position.set(px,0.01,pz); g.add(bio);
  });
  _zoneMarker(g,scene,-8,z4c,4,'#6d28d9'); _zoneMarker(g,scene,8,z4c,4,'#6d28d9');
  _placeCoins(scene,g,_coinGrid(0,z4c-3,11,7,16));
  _placeGems(scene,g,[[0,0.5,z4c-6],[-5,0.5,z4c-2]]);
  _zoneArch(g,0,cz9[3].z-dist/16,'#6d28d9',5.5,5.2);

  // ── ZONE 5: TIGHT PASSAGE ────────────────────────────────────────────────────
  const z5c=cz9[4].z;
  // Narrow stone walls pressing in from sides
  const passWallMat=new THREE.MeshStandardMaterial({color:0x221533,roughness:0.95,metalness:0.07});
  [[-6,z5c-3],[6,z5c-3],[-6,z5c+1],[6,z5c+1],[-5.5,z5c-7],[5.5,z5c-7]].forEach(([wx,wz])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(2.5,8,4.5),passWallMat);
    wall.position.set(wx,4,wz); g.add(wall);
  });
  // Crystal vein strips on passage walls
  [[-6,z5c-3],[6,z5c-3]].forEach(([wx,wz])=>{
    [1,3,5].forEach(wy=>{
      const vein=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.35,4.4),
        new THREE.MeshStandardMaterial({color:0xa78bfa,emissive:0xa78bfa,emissiveIntensity:1.0}));
      vein.position.set(wx+(wx>0?-1.2:1.2),wy,wz); g.add(vein);
    });
  });
  // Obstacle boulders in path
  const boulderMat=new THREE.MeshStandardMaterial({color:0x2d1d40,roughness:0.92});
  [[-2,z5c-1],[2,z5c-4],[-1,z5c-7],[3,z5c+0.5]].forEach(([bx,bz])=>{
    const boul=new THREE.Mesh(new THREE.SphereGeometry(0.75+Math.random()*0.3,7,6),boulderMat);
    boul.position.set(bx,0.75,bz); g.add(boul);
  });
  _zoneMarker(g,scene,-8,z5c,5,'#a78bfa'); _zoneMarker(g,scene,8,z5c,5,'#a78bfa');
  _placeCoins(scene,g,_coinGrid(0,z5c-3,4,7,10));
  _placeShields(scene,g,[[-3,0.5,z5c-5],[3,0.5,z5c-2]]);
  _zoneArch(g,0,cz9[4].z-dist/16,'#a78bfa',4.0,5.2);

  // ── ZONE 6: SPIRE CHAMBER ────────────────────────────────────────────────────
  const z6c=cz9[5].z;
  // Tall crystal spires rising from floor
  const _spire=(sx,sz,h,col)=>{
    const spMat=crysMat(col);
    const sp=new THREE.Mesh(new THREE.ConeGeometry(0.35,h,6),spMat);
    sp.position.set(sx,h/2,sz); sp.castShadow=true; g.add(sp);
    const spl=new THREE.PointLight(col,0.65,9); spl.position.set(sx,h*0.75,sz); g.add(spl);
  };
  [[-7,z6c,8,0xa78bfa],[7,z6c,7,0x8b5cf6],[-6,z6c-4,6,0x7c3aed],[6,z6c-5,9,0x06b6d4],
   [-8,z6c-8,5,0xa78bfa],[8,z6c-7,7,0x8b5cf6],[0,z6c-9,10,0x6d28d9]].forEach(a=>_spire(...a));
  // Central chamber glow ring on floor
  const chamberGlowMat=new THREE.MeshBasicMaterial({color:0x06b6d4,transparent:true,opacity:0.12,depthWrite:false});
  const chamberRing=new THREE.Mesh(new THREE.RingGeometry(2.5,5.5,24),chamberGlowMat);
  chamberRing.rotation.x=-Math.PI/2; chamberRing.position.set(0,0.01,z6c-4); g.add(chamberRing);
  const chamberPL=new THREE.PointLight(0x06b6d4,1.5,18); chamberPL.position.set(0,6,z6c-4); g.add(chamberPL);
  _zoneMarker(g,scene,-8,z6c,6,'#06b6d4'); _zoneMarker(g,scene,8,z6c,6,'#06b6d4');
  _placeCoins(scene,g,_coinGrid(0,z6c-4,7,7,14));
  _placeGems(scene,g,[[-2,0.5,z6c-2],[2,0.5,z6c-6],[0,0.5,z6c-8]]);
  _zoneArch(g,0,cz9[5].z-dist/16,'#06b6d4',5.5,5.5);

  // ── ZONE 7: SAFE DEN ─────────────────────────────────────────────────────────
  const z7c=cz9[6].z;
  // Cozy cave alcove feel — warm purple glow, supply crates
  const crateMat=new THREE.MeshStandardMaterial({color:0x4a3a6e,roughness:0.8,metalness:0.2});
  const crateAccMat=new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:0.5});
  [[-5,z7c],[5,z7c+1],[-4,z7c-4],[4,z7c-3]].forEach(([cx,cz])=>{
    const crate=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4),crateMat);
    crate.position.set(cx,0.7,cz); g.add(crate);
    const lid=new THREE.Mesh(new THREE.BoxGeometry(1.45,0.15,1.45),crateAccMat);
    lid.position.set(cx,1.47,cz); g.add(lid);
  });
  // Crystal healing pool (glowing circle)
  const healMat=new THREE.MeshStandardMaterial({color:0x7c3aed,emissive:0x7c3aed,emissiveIntensity:0.5,transparent:true,opacity:0.55,roughness:0.12});
  const healPool=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,0.12,20),healMat);
  healPool.position.set(0,0.06,z7c-3); g.add(healPool);
  const healPL=new THREE.PointLight(0xa78bfa,1.6,12); healPL.position.set(0,1.5,z7c-3); g.add(healPL);
  // Hanging crystal chandeliers
  [[-3,z7c],[3,z7c-4],[0,z7c-7]].forEach(([hx,hz])=>{
    const col=crystalColors[Math.floor(Math.random()*3)+1];
    const chain=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.5,5),new THREE.MeshStandardMaterial({color:0x8b5cf6}));
    chain.position.set(hx,10,hz); g.add(chain);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.5),crysMat(col));
    gem.position.set(hx,8.5,hz); g.add(gem);
    const cpl=new THREE.PointLight(col,0.7,10); cpl.position.set(hx,8.5,hz); g.add(cpl);
  });
  _zoneMarker(g,scene,-8,z7c,7,'#8b5cf6'); _zoneMarker(g,scene,8,z7c,7,'#8b5cf6');
  _placeCoins(scene,g,_coinGrid(0,z7c-3,10,6,25));
  _placeShields(scene,g,[[0,0.5,z7c+2],[-5,0.5,z7c-5],[5,0.5,z7c-5]]);
  _zoneArch(g,0,cz9[6].z-dist/16,'#8b5cf6',5.5,5.2);

  // ── ZONE 8: ANCIENT GATEWAY — giant glowing portal ring (Crystal Run style) ───
  const z8c=cz9[7].z;
  const runicMat=new THREE.MeshStandardMaterial({color:0x1e1030,roughness:0.92,emissive:0x4b2080,emissiveIntensity:0.25});
  [-4.8,4.8].forEach(rx=>{
    const pillar=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.7,10,7),runicMat);
    pillar.position.set(rx,5,z8c); g.add(pillar);
  });
  // Runic glyph runes (glowing boxes on arch pillars)
  [[-4.8,2,z8c],[-4.8,4,z8c],[-4.8,6,z8c],[4.8,2,z8c],[4.8,4,z8c],[4.8,6,z8c]].forEach(([rx,ry,rz])=>{
    const rune=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.1),
      new THREE.MeshStandardMaterial({color:0x06b6d4,emissive:0x06b6d4,emissiveIntensity:1.6}));
    rune.position.set(rx,ry,rz-0.35); g.add(rune);
  });
  // Massive vertical portal ring — bright blue, faces the player
  const portalRingMat=new THREE.MeshStandardMaterial({color:0x0099ff,emissive:0x00ccff,emissiveIntensity:2.2,roughness:0.1,metalness:0.85});
  const portalRing=new THREE.Mesh(new THREE.TorusGeometry(4.0,0.32,12,48),portalRingMat);
  portalRing.position.set(0,4.6,z8c); g.add(portalRing);
  // Tech studs around the ring
  for(let si=0;si<12;si++){
    const sa=si/12*Math.PI*2;
    const stud=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.46),
      new THREE.MeshStandardMaterial({color:0x223044,roughness:0.4,metalness:0.85}));
    stud.position.set(Math.cos(sa)*4.0,4.6+Math.sin(sa)*4.0,z8c);
    stud.lookAt(0,4.6,z8c); g.add(stud);
  }
  // Soft energy fill inside the ring
  const portalMat=new THREE.MeshBasicMaterial({color:0x66e0ff,transparent:true,opacity:0.1,depthWrite:false,side:THREE.DoubleSide});
  const portal=new THREE.Mesh(new THREE.CircleGeometry(3.7,32),portalMat);
  portal.position.set(0,4.6,z8c-0.05); g.add(portal);
  const gatePL=new THREE.PointLight(0x00bbff,3.0,26); gatePL.position.set(0,4.6,z8c); g.add(gatePL);
  if(!scene.userData.movers) scene.userData.movers=[];
  scene.userData.movers.push({update:(t)=>{
    portalRingMat.emissiveIntensity=1.9+Math.sin(t*1.5)*0.5;
    portalMat.opacity=0.07+Math.abs(Math.sin(t*0.9))*0.07;
    gatePL.intensity=2.6+Math.sin(t*1.5)*0.6;
  }});
  // Movers: flying crystal shards
  if(!scene.userData.movers) scene.userData.movers=[];
  [[-3,3,z8c-2],[3,3,z8c-4]].forEach(([sx,sy,sz],i)=>{
    const col=crystalColors[i];
    const shard=new THREE.Mesh(new THREE.OctahedronGeometry(0.28),crysMat(col));
    shard.position.set(sx,sy,sz); g.add(shard);
    const startX=sx;
    scene.userData.movers.push({update:(t)=>{shard.position.x=startX+Math.sin(t*(1.1+i*0.3))*2.5; shard.rotation.y=t*(1.5+i);shard.rotation.x=t*0.8;}});
  });
  _zoneMarker(g,scene,-8,z8c,8,'#7c3aed'); _zoneMarker(g,scene,8,z8c,8,'#7c3aed');
  _placeCoins(scene,g,_coinGrid(0,z8c-3,10,7,16));
  _placeGems(scene,g,[[-5,0.5,z8c-2],[5,0.5,z8c-4],[0,0.5,z8c-6]]);

  // ── ZONE 9: GEMSTONE THRONE ──────────────────────────────────────────────────
  const z9c=cz9[8].z;
  // Throne room floor — rich crystal mosaic
  const throneMosaicMat=new THREE.MeshStandardMaterial({color:0x2e1a55,roughness:0.5,metalness:0.3,emissive:0x1a0a35,emissiveIntensity:0.2});
  const thronePlatform=new THREE.Mesh(new THREE.CylinderGeometry(8,9,0.35,10),throneMosaicMat);
  thronePlatform.position.set(0,0.175,z9c); g.add(thronePlatform);
  // Ring of 8 giant crystal columns around throne
  for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2; const r=6.5;
    const col=crystalColors[k%crystalColors.length];
    const spi=new THREE.Mesh(new THREE.ConeGeometry(0.5,7+k%3,6),crysMat(col));
    spi.position.set(Math.cos(a)*r,3.5,z9c+Math.sin(a)*r); g.add(spi);
    const spl=new THREE.PointLight(col,0.9,10); spl.position.set(Math.cos(a)*r,7,z9c+Math.sin(a)*r); g.add(spl);
  }
  // Central Gemstone Goal — massive glowing crystal
  const goalGemMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:2.5,transparent:true,opacity:0.92,roughness:0.05,metalness:0.8});
  const goalGem=new THREE.Mesh(new THREE.OctahedronGeometry(2.2),goalGemMat);
  goalGem.position.set(0,3.5,z9c); g.add(goalGem);
  // Orbiting crystal rings
  const ringColors=[0xa78bfa,0x06b6d4,0xfbbf24];
  if(!scene.userData.movers) scene.userData.movers=[];
  ringColors.forEach((rc,ri)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8+ri*0.6,0.09,7,26),
      new THREE.MeshBasicMaterial({color:rc,transparent:true,opacity:0.7}));
    ring.position.set(0,3.5,z9c); g.add(ring);
    scene.userData.movers.push({update:(t)=>{ring.rotation.x=t*(0.6+ri*0.3);ring.rotation.y=t*(0.4+ri*0.25);ring.rotation.z=t*(0.3+ri*0.2);}});
  });
  // Spotlight beam on goal
  const throneSpot=new THREE.SpotLight(0xfbbf24,5.0,30,Math.PI/10,0.4);
  throneSpot.position.set(0,18,z9c); throneSpot.target.position.set(0,0,z9c);
  g.add(throneSpot); g.add(throneSpot.target);
  // Goal floor glow
  const goalFloorC=new THREE.Mesh(new THREE.CircleGeometry(6,32),
    new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.35,transparent:true,opacity:0.18}));
  goalFloorC.rotation.x=-Math.PI/2; goalFloorC.position.set(0,0.013,z9c); g.add(goalFloorC);
  const goalPLC=new THREE.PointLight(0xfbbf24,4.5,24); goalPLC.position.set(0,7,z9c); g.add(goalPLC);
  _zoneMarker(g,scene,-8,z9c,9,'#fbbf24'); _zoneMarker(g,scene,8,z9c,9,'#fbbf24');
  _placeCoins(scene,g,_coinGrid(0,z9c,10,5,15));
  _placeGems(scene,g,[[-3,0.5,z9c+2],[3,0.5,z9c+2],[0,0.5,z9c-3],[-2,0.5,z9c-2],[2,0.5,z9c-2]]);
  scene.userData.finishZ = z9c;

  // ── CAVE WALL COLUMNS flanking the full path ──────────────────────────────────
  const wMat=new THREE.MeshStandardMaterial({color:0x1a1228,roughness:0.96});
  for(let cz2=z1c-2;cz2>z9c+3;cz2-=5){
    [-10,10].forEach(wx=>{
      const wp=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,10,7),wMat);
      wp.position.set(wx,5,cz2); g.add(wp);
      // Crystal vein accent on wall column
      if(Math.abs(cz2%10)<3){
        const col=crystalColors[Math.floor(Math.abs(cz2)/5)%crystalColors.length];
        const vein2=new THREE.Mesh(new THREE.BoxGeometry(0.18,2.2,0.18),crysMat(col));
        vein2.position.set(wx+(wx>0?-1.0:1.0),3.5,cz2); g.add(vein2);
      }
    });
  }
  // Stalactite curtain along ceiling
  for(let cz3=z1c;cz3>z9c+2;cz3-=3){
    [-6,-2,2,6].forEach(sx2=>{
      if(Math.random()>0.45) _stalactiteAt(sx2,cz3,11+Math.random()*1.5);
    });
  }

  // ── ATMOSPHERIC LIGHTS ────────────────────────────────────────────────────────
  [[0,3,z1c,0xa78bfa,1.6,14],[0,4,z9c,0xfbbf24,2.0,18],[0,3,(z1c+z9c)/2,0x7c3aed,0.7,22],
   [-5,2,cz9[3].z,0x8b5cf6,0.6,12],[5,2,cz9[5].z,0x06b6d4,0.8,14]].forEach(([lx,ly,lz,lc,li,lr])=>{
    const pl=new THREE.PointLight(lc,li,lr); pl.position.set(lx,ly,lz); g.add(pl);
  });

  // ── CYAN ENERGY STREAM — glowing channel leading the eye to the throne ───────
  const streamGeo=new THREE.PlaneGeometry(1.5,dist+8,1,36);
  const streamMat=new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00ccff,emissiveIntensity:0.5,transparent:true,opacity:0.3,roughness:0.2,metalness:0.4,depthWrite:false});
  const stream=new THREE.Mesh(streamGeo,streamMat);
  stream.rotation.x=-Math.PI/2; stream.position.set(0,0.02,centerZ); g.add(stream);
  const streamGlow=new THREE.Mesh(new THREE.PlaneGeometry(3.0,dist+8),
    new THREE.MeshBasicMaterial({color:0x00d9ff,transparent:true,opacity:0.05,depthWrite:false}));
  streamGlow.rotation.x=-Math.PI/2; streamGlow.position.set(0,0.015,centerZ); g.add(streamGlow);
  if(!scene.userData.movers) scene.userData.movers=[];
  scene.userData.movers.push({update:(t)=>{
    const pa=streamGeo.attributes.position;
    for(let vi=0;vi<pa.count;vi++){
      pa.setZ(vi,Math.sin(pa.getY(vi)*0.5+t*2.2)*0.035);
    }
    pa.needsUpdate=true;
    streamMat.emissiveIntensity=0.45+Math.sin(t*1.8)*0.15;
  }});

  // Dark mystical lighting mood (consumed by SimCanvas after build)
  scene.userData.lightMood=[0.55,0.45,0.35,0x9ab8ff];
  scene.userData.expMood=0.85;
  // Crystal Run palette: purple-tinted ambient, cyan fill from the energy stream
  scene.userData.lightTint={amb:0x7a5cff,fill:0x00b8d9,hemiSky:0x5a3a9e,hemiGround:0x12081f};

  scene.add(g);
}

function _neonRaceArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  // Neon Racing Circuit — 9 zones of high-speed hover challenge
  scene.background = new THREE.Color(0x04020d);
  scene.fog = new THREE.FogExp2(0x04020d, 0.02);

  const dist = 50;
  const centerZ = (4 - dist) / 2;

  // ── RACE TRACK SURFACE ───────────────────────────────────────────────────────
  const trackMat = new THREE.MeshStandardMaterial({color:0x0a0a1a,roughness:0.28,metalness:0.72});
  const track = new THREE.Mesh(new THREE.PlaneGeometry(14, dist + 16), trackMat);
  track.rotation.x = -Math.PI/2; track.position.z = centerZ; track.receiveShadow = true; g.add(track);

  // Track edge neon strips (full length)
  const neonPinkMat = new THREE.MeshStandardMaterial({color:0xff0080,emissive:0xff0080,emissiveIntensity:2.0});
  const neonBlueMat = new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:2.0});
  const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.1,dist+16),neonPinkMat);
  edgeL.position.set(-6.5,0.05,centerZ); g.add(edgeL);
  const edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.1,dist+16),neonBlueMat);
  edgeR.position.set(6.5,0.05,centerZ); g.add(edgeR);

  // Center lane dashes
  const dashMat = new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.4,transparent:true,opacity:0.4});
  for(let dz=4;dz>(4-dist-4);dz-=3.5){
    const dash=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.02,1.6),dashMat);
    dash.position.set(0,0.025,dz); g.add(dash);
  }

  // ── 9 NEON RACE ZONES ────────────────────────────────────────────────────────
  const N_COLS=['#00ff88','#00d4ff','#ff0080','#ffd700','#ff6b35','#00d4ff','#8b5cf6','#ff0080','#ffd700'];
  const N_NAMES=['STARTING GRID','SPEED STRAIGHT','BANK CURVE 1','NEON TUNNEL',
                 'JUMP RAMP ZONE','DRIFT HAIRPIN','BOOST CORRIDOR','FINAL TURN','FINISH LINE'];
  const nz9=N_COLS.map((col,i)=>({z:4-i*(dist/8),col,name:N_NAMES[i],num:i+1}));

  // ── ZONE 1: STARTING GRID ────────────────────────────────────────────────────
  const z1n=nz9[0].z;
  // Checkered start line
  const checkMat = new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff88,emissiveIntensity:0.85});
  const startLine = new THREE.Mesh(new THREE.PlaneGeometry(12,1.4),checkMat);
  startLine.rotation.x=-Math.PI/2; startLine.position.set(0,0.025,z1n+1); g.add(startLine);
  // Grid position markers (car slots)
  [[-3.5,z1n-1],[3.5,z1n-1],[-3.5,z1n-3],[3.5,z1n-3]].forEach(([gx,gz])=>{
    const slot=new THREE.Mesh(new THREE.PlaneGeometry(2.2,3.5),
      new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff88,emissiveIntensity:0.3,transparent:true,opacity:0.35}));
    slot.rotation.x=-Math.PI/2; slot.position.set(gx,0.03,gz); g.add(slot);
  });
  // Start arch gantry
  const gantryMat=new THREE.MeshStandardMaterial({color:0x1a1a3e,roughness:0.4,metalness:0.65});
  [-6.5,6.5].forEach(px=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.35,7,8),gantryMat);
    post.position.set(px,3.5,z1n+1); g.add(post);
  });
  const gantryBeam=new THREE.Mesh(new THREE.BoxGeometry(15,0.55,0.55),gantryMat);
  gantryBeam.position.set(0,7.25,z1n+1); g.add(gantryBeam);
  // Start lights on gantry
  [0x00ff00,0xffff00,0xffff00,0xff0000,0xff0000].forEach((lc,i)=>{
    const light=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,8),
      new THREE.MeshStandardMaterial({color:lc,emissive:lc,emissiveIntensity:2.5}));
    light.position.set(-4+i*2,7.2,z1n+0.8); g.add(light);
  });
  const startPL=new THREE.PointLight(0x00ff88,1.8,14); startPL.position.set(0,5,z1n); g.add(startPL);
  _zoneMarker(g,scene,-9,z1n,1,'#00ff88'); _zoneMarker(g,scene,9,z1n,1,'#00ff88');
  _placeCoins(scene,g,_coinGrid(0,z1n-2,9,5,12));
  _zoneArch(g,0,nz9[0].z-dist/16,'#00ff88',5.8,5.5);

  // ── ZONE 2: SPEED STRAIGHT ───────────────────────────────────────────────────
  const z2n=nz9[1].z;
  // Speed booster pads (glowing diamonds on track)
  [[0,z2n+1],[0,z2n-2],[0,z2n-5]].forEach(([bx,bz])=>{
    const boostMat=new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:1.2,transparent:true,opacity:0.6});
    const boostPad=new THREE.Mesh(new THREE.PlaneGeometry(2.5,1.8),boostMat);
    boostPad.rotation.x=-Math.PI/2; boostPad.position.set(bx,0.03,bz); g.add(boostPad);
    // Arrow direction
    const arrowMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.8,transparent:true,opacity:0.7});
    const arrow=new THREE.Mesh(new THREE.PlaneGeometry(0.4,1.0),arrowMat);
    arrow.rotation.x=-Math.PI/2; arrow.position.set(bx,0.04,bz); g.add(arrow);
  });
  // Roadside billboards
  [[-9,z2n],[-9,z2n-4],[9,z2n-2],[9,z2n-6]].forEach(([bx,bz],i)=>{
    const bMat=new THREE.MeshStandardMaterial({color:[0xff0080,0x00d4ff,0x00ff88,0xffd700][i],
      emissive:[0xff0080,0x00d4ff,0x00ff88,0xffd700][i],emissiveIntensity:0.5});
    const board=new THREE.Mesh(new THREE.BoxGeometry(3,1.8,0.15),bMat);
    board.position.set(bx,4,bz); g.add(board);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,4,6),gantryMat);
    pole.position.set(bx,2,bz); g.add(pole);
  });
  _zoneMarker(g,scene,-9,z2n,2,'#00d4ff'); _zoneMarker(g,scene,9,z2n,2,'#00d4ff');
  _placeCoins(scene,g,_coinGrid(0,z2n-3,8,7,16));
  _zoneArch(g,0,nz9[1].z-dist/16,'#00d4ff',5.8,5.5);

  // ── ZONE 3: BANK CURVE 1 ─────────────────────────────────────────────────────
  const z3n=nz9[2].z;
  // Banked side walls
  const bankMat=new THREE.MeshStandardMaterial({color:0x14102a,roughness:0.45,metalness:0.55});
  [[-10,z3n-2],[10,z3n-4],[-10,z3n-5],[10,z3n-1]].forEach(([bx,bz])=>{
    const bank=new THREE.Mesh(new THREE.BoxGeometry(5,0.7,5),bankMat);
    bank.position.set(bx,0.35,bz); g.add(bank);
    const rim=new THREE.Mesh(new THREE.BoxGeometry(5.1,0.07,5.1),neonPinkMat);
    rim.position.set(bx,0.72,bz); g.add(rim);
  });
  // Curve guide arrows on track
  [z3n+1,z3n-1,z3n-3,z3n-5].forEach((az,i)=>{
    const aCol=i%2===0?0xff0080:0x00d4ff;
    const arPad=new THREE.Mesh(new THREE.PlaneGeometry(1.0,2.0),
      new THREE.MeshStandardMaterial({color:aCol,emissive:aCol,emissiveIntensity:0.9,transparent:true,opacity:0.55}));
    arPad.rotation.x=-Math.PI/2; arPad.position.set((i%2===0?-2:2),0.03,az); g.add(arPad);
  });
  _zoneMarker(g,scene,-9,z3n,3,'#ff0080'); _zoneMarker(g,scene,9,z3n,3,'#ff0080');
  _placeCoins(scene,g,_coinGrid(0,z3n-3,10,6,14));
  _placeShields(scene,g,[[0,0.5,z3n-3]]);
  _zoneArch(g,0,nz9[2].z-dist/16,'#ff0080',5.8,5.5);

  // ── ZONE 4: NEON TUNNEL ──────────────────────────────────────────────────────
  const z4n=nz9[3].z;
  // Tunnel walls and ceiling
  const tunnelMat=new THREE.MeshStandardMaterial({color:0x0c0818,roughness:0.65,metalness:0.45});
  // Left/right walls
  [-7,7].forEach(tx=>{
    const twall=new THREE.Mesh(new THREE.BoxGeometry(1.2,6,8.5),tunnelMat);
    twall.position.set(tx,3,z4n-3); g.add(twall);
  });
  // Ceiling slab
  const tceil=new THREE.Mesh(new THREE.BoxGeometry(16,0.8,8.5),tunnelMat);
  tceil.position.set(0,6,z4n-3); g.add(tceil);
  // Tunnel neon strip lights on walls
  const tunnelStripColors=[0xff0080,0x00d4ff,0xff0080,0x00d4ff,0xff0080,0x00d4ff];
  [-7,7].forEach((tx,si)=>{
    [1,2,3,4].forEach((sy,li)=>{
      const strip=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.35,8.4),
        new THREE.MeshStandardMaterial({color:tunnelStripColors[(si*2+li)%6],emissive:tunnelStripColors[(si*2+li)%6],emissiveIntensity:1.5}));
      strip.position.set(tx+(tx>0?-0.6:0.6),sy,z4n-3); g.add(strip);
    });
  });
  // Tunnel ceiling lights
  [-3,0,3].forEach((clx,i)=>{
    const cCol=[0xff0080,0xffd700,0x00d4ff][i];
    const cLight=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.1,8.3),
      new THREE.MeshStandardMaterial({color:cCol,emissive:cCol,emissiveIntensity:1.0,transparent:true,opacity:0.85}));
    cLight.position.set(clx,5.58,z4n-3); g.add(cLight);
    const tpl=new THREE.PointLight(cCol,0.8,10); tpl.position.set(clx,5.5,z4n-3); g.add(tpl);
  });
  _zoneMarker(g,scene,-9,z4n,4,'#ffd700'); _zoneMarker(g,scene,9,z4n,4,'#ffd700');
  _placeCoins(scene,g,_coinGrid(0,z4n-3,8,6,18));
  _zoneArch(g,0,nz9[3].z-dist/16,'#ffd700',5.8,5.5);

  // ── ZONE 5: JUMP RAMP ZONE ───────────────────────────────────────────────────
  const z5n=nz9[4].z;
  // Launch ramp
  const rampMat=new THREE.MeshStandardMaterial({color:0x1a1535,roughness:0.5,metalness:0.5});
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(8,0.4,4),rampMat);
  ramp.rotation.x=Math.PI/18; ramp.position.set(0,0.6,z5n+1); g.add(ramp);
  // Ramp neon edge
  const rampEdge=new THREE.Mesh(new THREE.BoxGeometry(8.1,0.08,0.12),
    new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff6b35,emissiveIntensity:2.2}));
  rampEdge.position.set(0,0.95,z5n-0.7); g.add(rampEdge);
  // Landing pad (flat glowing zone)
  const landMat=new THREE.MeshStandardMaterial({color:0x1a1028,roughness:0.45,metalness:0.55,emissive:0xff6b35,emissiveIntensity:0.15});
  const landPad=new THREE.Mesh(new THREE.PlaneGeometry(10,5),landMat);
  landPad.rotation.x=-Math.PI/2; landPad.position.set(0,0.03,z5n-6); g.add(landPad);
  // Landing markers
  [-4,4].forEach(lx=>{
    const lm=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,3,8),
      new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff6b35,emissiveIntensity:1.5}));
    lm.position.set(lx,1.5,z5n-6); g.add(lm);
    const lpl=new THREE.PointLight(0xff6b35,0.9,8); lpl.position.set(lx,3,z5n-6); g.add(lpl);
  });
  _zoneMarker(g,scene,-9,z5n,5,'#ff6b35'); _zoneMarker(g,scene,9,z5n,5,'#ff6b35');
  _placeCoins(scene,g,_coinGrid(0,z5n-3,9,7,14));
  _placeShields(scene,g,[[-3,0.5,z5n-5],[3,0.5,z5n-5]]);
  _zoneArch(g,0,nz9[4].z-dist/16,'#ff6b35',5.8,5.5);

  // ── ZONE 6: DRIFT HAIRPIN ────────────────────────────────────────────────────
  const z6n=nz9[5].z;
  // Tight hairpin barriers
  const barrierMat=new THREE.MeshStandardMaterial({color:0x1a1040,roughness:0.55,metalness:0.6});
  [[-5,z6n+1,0.4,6],[-5,z6n-5,0.4,6],[5,z6n-2,0.4,6]].forEach(([bx,bz,bw,bh])=>{
    const barr=new THREE.Mesh(new THREE.BoxGeometry(bw,1.2,bh),barrierMat);
    barr.position.set(bx,0.6,bz); g.add(barr);
    // Hazard stripes on barrier top
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(bw+0.05,0.08,bh+0.05),
      new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:1.3}));
    stripe.position.set(bx,1.24,bz); g.add(stripe);
  });
  // Drift skid marks on track
  [[-1,z6n],[2,z6n-3],[-3,z6n-5]].forEach(([sx,sz])=>{
    const skid=new THREE.Mesh(new THREE.PlaneGeometry(1.5,3.5),
      new THREE.MeshStandardMaterial({color:0x1a1535,transparent:true,opacity:0.7,roughness:1.0}));
    skid.rotation.x=-Math.PI/2; skid.rotation.z=(Math.random()-0.5)*0.4; skid.position.set(sx,0.015,sz); g.add(skid);
  });
  // Apex marker (tight corner indicator)
  const apexMat=new THREE.MeshStandardMaterial({color:0x00d4ff,emissive:0x00d4ff,emissiveIntensity:2.0});
  const apex=new THREE.Mesh(new THREE.ConeGeometry(0.4,1.4,8),apexMat);
  apex.position.set(-5.5,0.7,z6n-3); g.add(apex);
  const apexPL=new THREE.PointLight(0x00d4ff,1.4,10); apexPL.position.set(-5.5,2,z6n-3); g.add(apexPL);
  _zoneMarker(g,scene,-9,z6n,6,'#00d4ff'); _zoneMarker(g,scene,9,z6n,6,'#00d4ff');
  _placeCoins(scene,g,_coinGrid(0,z6n-3,9,6,14));
  _placeGems(scene,g,[[-4,0.5,z6n-3],[4,0.5,z6n-1]]);
  _zoneArch(g,0,nz9[5].z-dist/16,'#00d4ff',5.8,5.5);

  // ── ZONE 7: BOOST CORRIDOR ───────────────────────────────────────────────────
  const z7n=nz9[6].z;
  // Speed boost strips on track (multiple)
  [z7n+1,z7n-2,z7n-5].forEach(bz=>{
    const bMat=new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:1.4,transparent:true,opacity:0.7});
    const boost=new THREE.Mesh(new THREE.PlaneGeometry(12,1.0),bMat);
    boost.rotation.x=-Math.PI/2; boost.position.set(0,0.03,bz); g.add(boost);
  });
  // Side neon bollards
  for(let bz2=z7n+2;bz2>z7n-8;bz2-=2.5){
    [-6.2,6.2].forEach(bx2=>{
      const boll=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,1.2,7),
        new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:1.6}));
      boll.position.set(bx2,0.6,bz2); g.add(boll);
    });
  }
  // Corridor ceiling light beam
  const beamMat=new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:0.5,transparent:true,opacity:0.15});
  const beam=new THREE.Mesh(new THREE.BoxGeometry(12,4,8),beamMat);
  beam.position.set(0,4,z7n-3); g.add(beam);
  const corridorPL=new THREE.PointLight(0x8b5cf6,1.5,16); corridorPL.position.set(0,5,z7n-3); g.add(corridorPL);
  _zoneMarker(g,scene,-9,z7n,7,'#8b5cf6'); _zoneMarker(g,scene,9,z7n,7,'#8b5cf6');
  _placeCoins(scene,g,_coinGrid(0,z7n-3,10,6,20));
  _placeGems(scene,g,[[0,0.5,z7n-4]]);
  _zoneArch(g,0,nz9[6].z-dist/16,'#8b5cf6',5.8,5.5);

  // ── ZONE 8: FINAL TURN ───────────────────────────────────────────────────────
  const z8n=nz9[7].z;
  // Last banked curve with warning chevrons
  const chevMat=new THREE.MeshStandardMaterial({color:0xff0080,emissive:0xff0080,emissiveIntensity:1.8});
  [z8n+2,z8n,z8n-2,z8n-4].forEach((cz,i)=>{
    const ch=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.12,1.8),chevMat);
    ch.position.set(i%2===0?-2:2,0.06,cz); g.add(ch);
  });
  // Warning lights on track edges
  [z8n+1,z8n-2,z8n-5].forEach(wz=>{
    [-6,6].forEach(wx=>{
      const wl=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8),
        new THREE.MeshStandardMaterial({color:0xff0080,emissive:0xff0080,emissiveIntensity:2.5}));
      wl.position.set(wx,0.18,wz); g.add(wl);
    });
  });
  // Mover: sweeping scanner light on this zone
  if(!scene.userData.movers) scene.userData.movers=[];
  const scanBase=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),new THREE.MeshBasicMaterial({color:0xff0080,visible:false}));
  scanBase.position.set(0,5,z8n-3); g.add(scanBase);
  const scanPL=new THREE.PointLight(0xff0080,2.0,14); scanPL.position.set(0,5,z8n-3); g.add(scanPL);
  scene.userData.movers.push({update:(t)=>{const sx=Math.sin(t*1.8)*5; scanPL.position.x=sx;}});
  _zoneMarker(g,scene,-9,z8n,8,'#ff0080'); _zoneMarker(g,scene,9,z8n,8,'#ff0080');
  _placeCoins(scene,g,_coinGrid(0,z8n-3,9,6,14));
  _placeShields(scene,g,[[0,0.5,z8n-5]]);
  _placeGems(scene,g,[[-4,0.5,z8n-2],[4,0.5,z8n-4]]);
  _zoneArch(g,0,nz9[7].z-dist/16,'#ff0080',5.8,5.5);

  // ── ZONE 9: FINISH LINE ──────────────────────────────────────────────────────
  const z9n=nz9[8].z;
  // Iconic finish line (wide checkered)
  const finMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.2});
  const finLine=new THREE.Mesh(new THREE.PlaneGeometry(13,2.0),finMat);
  finLine.rotation.x=-Math.PI/2; finLine.position.set(0,0.03,z9n+1); g.add(finLine);
  // Checkered black squares
  for(let ci=-5;ci<=5;ci+=2){
    const cSq=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),
      new THREE.MeshStandardMaterial({color:0x000000,transparent:true,opacity:0.6}));
    cSq.rotation.x=-Math.PI/2; cSq.position.set(ci*1.0,0.035,z9n+1+(ci%2===0?0.5:-0.5)); g.add(cSq);
  }
  // Victory gantry arch
  [-6.5,6.5].forEach(px=>{
    const vpost=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.38,8,8),gantryMat);
    vpost.position.set(px,4,z9n); g.add(vpost);
  });
  const vBeam=new THREE.Mesh(new THREE.BoxGeometry(15,0.7,0.6),
    new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.8,metalness:0.5}));
  vBeam.position.set(0,8.25,z9n); g.add(vBeam);
  // Victory orb above gantry
  const vOrbMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:2.8,transparent:true,opacity:0.9});
  const vOrb=new THREE.Mesh(new THREE.SphereGeometry(1.4,16,14),vOrbMat);
  vOrb.position.set(0,11,z9n); g.add(vOrb);
  // Orbiting rings around victory orb
  if(!scene.userData.movers) scene.userData.movers=[];
  [[0xffd700,2.2],[0x00d4ff,2.7],[0xff0080,3.2]].forEach(([rc,rr],ri)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(rr,0.1,7,26),
      new THREE.MeshBasicMaterial({color:rc,transparent:true,opacity:0.75}));
    ring.position.set(0,11,z9n); g.add(ring);
    scene.userData.movers.push({update:(t)=>{ring.rotation.x=t*(0.7+ri*0.25);ring.rotation.y=t*(0.5+ri*0.2);ring.rotation.z=t*(0.3+ri*0.3);}});
  });
  // Spotlight beams on finish
  const finSpot=new THREE.SpotLight(0xffd700,6.0,35,Math.PI/9,0.35);
  finSpot.position.set(0,20,z9n); finSpot.target.position.set(0,0,z9n);
  g.add(finSpot); g.add(finSpot.target);
  // Confetti lights (colored point lights around goal)
  [[0xff0080,-4],[0x00d4ff,4],[0x00ff88,-2],[0xffd700,2]].forEach(([lc,lx])=>{
    const cPL=new THREE.PointLight(lc,1.4,12); cPL.position.set(lx,7,z9n); g.add(cPL);
  });
  // Goal floor glow
  const goalFloorN=new THREE.Mesh(new THREE.CircleGeometry(6,32),
    new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.4,transparent:true,opacity:0.18}));
  goalFloorN.rotation.x=-Math.PI/2; goalFloorN.position.set(0,0.013,z9n); g.add(goalFloorN);
  _zoneMarker(g,scene,-9,z9n,9,'#ffd700'); _zoneMarker(g,scene,9,z9n,9,'#ffd700');
  _placeCoins(scene,g,_coinGrid(0,z9n,10,5,15));
  _placeGems(scene,g,[[-3,0.5,z9n+2],[3,0.5,z9n+2],[0,0.5,z9n-2],[-2,0.5,z9n-4],[2,0.5,z9n-4]]);
  scene.userData.finishZ = z9n;

  // ── NEON CITY SKYLINE in background ──────────────────────────────────────────
  const skyLineMat=new THREE.MeshStandardMaterial({color:0x090716,emissive:0x0e0c28,emissiveIntensity:0.25});
  [[-22,10,centerZ-4],[22,14,centerZ-4],[-16,7,centerZ-4],[16,8,centerZ-4],
   [-10,18,centerZ-4],[10,12,centerZ-4],[-4,22,centerZ-4],[4,16,centerZ-4]].forEach(([bx,bh,bz])=>{
    const bld=new THREE.Mesh(new THREE.BoxGeometry(3.8,bh,0.9),skyLineMat);
    bld.position.set(bx,bh/2,bz); g.add(bld);
    const winColors=[0x00d4ff,0xff0080,0x8b5cf6,0x00ff88];
    for(let wy=1.5;wy<bh-1;wy+=2.2){
      if(Math.random()>0.35){
        const wc=winColors[Math.floor(Math.random()*winColors.length)];
        const win=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.38,0.1),
          new THREE.MeshStandardMaterial({color:wc,emissive:wc,emissiveIntensity:1.8,transparent:true,opacity:0.8}));
        win.position.set(bx+(Math.random()-0.5)*2.5,wy,bz+0.5); g.add(win);
      }
    }
    // Antenna light
    const ant=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6),
      new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:3.0}));
    ant.position.set(bx,bh+0.12,bz); g.add(ant);
  });

  // ── ATMOSPHERIC LIGHTS ────────────────────────────────────────────────────────
  [[0,4,z1n,0x00ff88,1.5,14],[0,4,z9n,0xffd700,2.5,18],[0,3,(z1n+z9n)/2,0x8b5cf6,0.6,22],
   [-5,3,nz9[3].z,0xff0080,0.8,12],[5,3,nz9[6].z,0x00d4ff,0.8,14]].forEach(([lx,ly,lz,lc,li,lr])=>{
    const pl=new THREE.PointLight(lc,li,lr); pl.position.set(lx,ly,lz); g.add(pl);
  });

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

function _templeArena(scene, ch) {
  const g = new THREE.Group(); g.name = 'arena';
  const isIdolHeist=ch?.id==='idol_heist';
  // Ancient Temple Expedition — warm golden-hour mystical atmosphere
  scene.background = new THREE.Color(isIdolHeist?0x1a1008:0x0e0a04);
  scene.fog = new THREE.FogExp2(isIdolHeist?0x2a1a0a:0x0e0a04, isIdolHeist?0.018:0.025);

  const dist = 50;
  const centerZ = (4 - dist) / 2;

  // ── STONE FLOOR ──────────────────────────────────────────────────────────────
  const stoneMat = new THREE.MeshStandardMaterial({color:0x4a3e2a,roughness:0.95,metalness:0.04});
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, dist + 16), stoneMat);
  floor.rotation.x = -Math.PI/2; floor.position.z = centerZ; floor.receiveShadow=true; g.add(floor);
  // Stone tile joints
  const tileMat = new THREE.LineBasicMaterial({color:0x2a2218,transparent:true,opacity:0.55});
  for(let x=-12;x<=12;x+=2.5)
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0.01,-dist+2),new THREE.Vector3(x,0.01,6)]),tileMat));
  for(let tz=-dist+2;tz<=6;tz+=2.5)
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12,0.01,tz),new THREE.Vector3(12,0.01,tz)]),tileMat));

  // ── 9 TEMPLE ZONES ───────────────────────────────────────────────────────────
  const T_COLS=['#f59e0b','#d97706','#b45309','#fbbf24','#92400e','#ffd700','#b45309','#f59e0b','#ffd700'];
  const T_NAMES=['TEMPLE ENTRANCE','PAW PRINT TRAIL','RIVER CROSSING','ROOT PUZZLE',
                 'WINDY CORRIDOR','FOX CHASE ZONE','SAFE CAVE','COLLAPSING HALL','POWER SHRINE'];
  const tz9=T_COLS.map((col,i)=>({z:4-i*(dist/8),col,name:T_NAMES[i],num:i+1}));

  // ── ZONE 1: TEMPLE ENTRANCE ───────────────────────────────────────────────────
  const z1t=tz9[0].z;
  const colMat=new THREE.MeshStandardMaterial({color:0x7a6a4e,roughness:0.88});
  const capMat=new THREE.MeshStandardMaterial({color:0x8b7a5a,roughness:0.82,metalness:0.12});
  // Grand entrance columns
  [[-6,z1t-1],[6,z1t-1],[-6,z1t-4],[6,z1t-4]].forEach(([cx,cz])=>{
    const col2=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.68,8,8),colMat);
    col2.position.set(cx,4,cz); col2.castShadow=true; g.add(col2);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.44,1.55),capMat);
    cap.position.set(cx,8.22,cz); g.add(cap);
  });
  // Entrance beam
  const entrBeam=new THREE.Mesh(new THREE.BoxGeometry(14,0.55,0.55),
    new THREE.MeshStandardMaterial({color:0x8b7355,roughness:0.84,emissive:0x4a3a1a,emissiveIntensity:0.3}));
  entrBeam.position.set(0,8.5,z1t-1); g.add(entrBeam);
  // Torch pair at entrance
  const torchMat=new THREE.MeshStandardMaterial({color:0x5c3d1e,roughness:0.92});
  const flameMat=new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff4500,emissiveIntensity:2.8,transparent:true,opacity:0.92});
  [[-6,z1t],[6,z1t]].forEach(([tx,ttz])=>{
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,1.0,6),torchMat); t.position.set(tx,5,ttz); g.add(t);
    const f=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.55,8),flameMat); f.position.set(tx,5.75,ttz); g.add(f);
    const tpl=new THREE.PointLight(0xff6b35,1.1,8); tpl.position.set(tx,5.8,ttz); g.add(tpl);
  });
  // Welcome glow on floor
  const wGlow=new THREE.Mesh(new THREE.PlaneGeometry(12,2.5),
    new THREE.MeshStandardMaterial({color:0xf59e0b,emissive:0xf59e0b,emissiveIntensity:0.35,transparent:true,opacity:0.55}));
  wGlow.rotation.x=-Math.PI/2; wGlow.position.set(0,0.012,z1t); g.add(wGlow);
  // Glowing floor runes — ornate temple pattern
  const runeMat=new THREE.MeshStandardMaterial({color:0xaa6600,emissive:0xffaa00,emissiveIntensity:1.6,transparent:true,opacity:0.75,roughness:0.3,metalness:0.4});
  [[-6,z1t+2],[0,z1t+1],[6,z1t+2],[-4,z1t-2],[4,z1t-2]].forEach(([rx,rz])=>{
    const rune=new THREE.Mesh(new THREE.RingGeometry(0.35,0.55,6),runeMat);
    rune.rotation.x=-Math.PI/2; rune.position.set(rx,0.014,rz); g.add(rune);
  });
  // Wall tapestries (purple/gold banners)
  const bannerMat=new THREE.MeshStandardMaterial({color:0x6d28d9,emissive:0x4c1d95,emissiveIntensity:0.35,roughness:0.85,side:THREE.DoubleSide});
  [-11,11].forEach(bx=>{
    const banner=new THREE.Mesh(new THREE.PlaneGeometry(1.8,4.5),bannerMat);
    banner.position.set(bx,2.5,z1t-0.5); banner.rotation.y=bx>0?-Math.PI/2:Math.PI/2; g.add(banner);
  });
  _placeCoins(scene,g,_coinGrid(0,z1t,10,5,10));
  _placeShields(scene,g,[[0,0.45,z1t-2]]);

  // ── ZONE 2: PAW PRINT TRAIL ───────────────────────────────────────────────────
  const z2t=tz9[1].z;
  _zoneMarker(g,scene,-8,z2t,2,'#d97706'); _zoneMarker(g,scene,8,z2t,2,'#d97706');
  // Glowing guide prints (magical trail)
  const printMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.0,transparent:true,opacity:0.75});
  for(let pi=0;pi<8;pi++){
    const px=Math.sin(pi*0.8)*2.5, pz=z2t-pi*0.8;
    const print=new THREE.Mesh(new THREE.CircleGeometry(0.25,8),printMat);
    print.rotation.x=-Math.PI/2; print.position.set(px,0.015,pz); g.add(print);
  }
  // Animal track markers — decorative roots
  const rootMat=new THREE.MeshStandardMaterial({color:0x3d2610,roughness:0.95});
  [[-4,z2t-1],[4,z2t-2],[-3,z2t-4],[4,z2t-5]].forEach(([rx,rz])=>{
    const root=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.18,1.5,6),rootMat);
    root.position.set(rx,0.55,rz); root.rotation.z=Math.PI*0.12; root.castShadow=true; g.add(root);
  });
  // Columns continue alongside
  [[-7,z2t-2],[7,z2t-2],[-7,z2t-5],[7,z2t-5]].forEach(([cx,cz])=>{
    const col2=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.62,7,8),colMat);
    col2.position.set(cx,3.5,cz); col2.castShadow=true; g.add(col2);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.13,0.9,6),torchMat); t.position.set(cx,4.5,cz); g.add(t);
    const f=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.48,8),flameMat); f.position.set(cx,5.15,cz); g.add(f);
    const tpl=new THREE.PointLight(0xff6b35,0.8,6); tpl.position.set(cx,5.2,cz); g.add(tpl);
  });
  _placeCoins(scene,g,_coinGrid(0,z2t,10,4,14));

  // ── ZONE 3: RIVER CROSSING ────────────────────────────────────────────────────
  const z3t=tz9[2].z;
  _zoneMarker(g,scene,-8,z3t,3,'#b45309'); _zoneMarker(g,scene,8,z3t,3,'#b45309');
  // Underground river
  const rivMat=new THREE.MeshStandardMaterial({color:0x1e3a5c,emissive:0x1e40af,emissiveIntensity:0.28,transparent:true,opacity:0.82,roughness:0.1,metalness:0.4});
  const riv=new THREE.Mesh(new THREE.PlaneGeometry(28,7),rivMat);
  riv.rotation.x=-Math.PI/2; riv.position.set(0,-0.05,z3t); g.add(riv);
  // Ancient stone stepping platforms
  const ancStoneMat=new THREE.MeshStandardMaterial({color:0x7a6a4e,roughness:0.88,metalness:0.08});
  [[-4.5,-1.5],[0,0],[4.5,-1.5],[-3,1.5],[3,1.5]].forEach(([sx,sdz],si)=>{
    const stn=new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.88,0.28,8),ancStoneMat);
    stn.position.set(sx,0.12,z3t+sdz); stn.receiveShadow=true; g.add(stn);
    // Glyph mark
    const glyph=new THREE.Mesh(new THREE.CircleGeometry(0.35,6),
      new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.7,transparent:true,opacity:0.65}));
    glyph.rotation.x=-Math.PI/2; glyph.position.set(sx,0.26,z3t+sdz); g.add(glyph);
  });
  const rivPL=new THREE.PointLight(0x1e40af,1.0,12); rivPL.position.set(0,1,z3t); g.add(rivPL);
  _placeCoins(scene,g,_coinGrid(0,z3t,12,6,15));
  _placeShields(scene,g,[[0,0.45,z3t+2]]);
  _placeGems(scene,g,[[0,0.5,z3t+3.5],[-3,0.5,z3t-2]]);

  // ── ZONE 4: ROOT PUZZLE ───────────────────────────────────────────────────────
  const z4t=tz9[3].z;
  _zoneMarker(g,scene,-8,z4t,4,'#fbbf24'); _zoneMarker(g,scene,8,z4t,4,'#fbbf24');
  // Massive twisted roots forming a wall-like obstacle array
  const rootWallMat=new THREE.MeshStandardMaterial({color:0x2d1a08,roughness:0.97,metalness:0.02});
  const rootGlowMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.8,transparent:true,opacity:0.7});
  [[-5,1.2,z4t-1],[5,1.5,z4t-1],[-3,1.0,z4t-3],[3,0.9,z4t-3],[0,1.8,z4t-2],[0,0.5,z4t-4]].forEach(([rx,rh,rz],ri)=>{
    const root=new THREE.Mesh(new THREE.CylinderGeometry(0.22+ri%2*0.08,0.3,rh*2,6),rootWallMat);
    root.position.set(rx,rh,rz); root.rotation.z=Math.sin(ri)*0.2; root.castShadow=true; g.add(root);
  });
  // Ancient switch pressure plates
  const pMat0=new THREE.MeshStandardMaterial({color:0x7a6a4e,roughness:0.7,metalness:0.28});
  const pMatA=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.0});
  [[-2.5,z4t+0.5],[2.5,z4t+0.5],[0,z4t-1.5],[-2.5,z4t-3.5],[2.5,z4t-3.5]].forEach(([px,pz],pi)=>{
    const plate=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.08,1.5),pi===0?pMatA:pMat0);
    plate.position.set(px,0.04,pz); g.add(plate);
    const mark=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.02,0.55),rootGlowMat);
    mark.position.set(px,0.1,pz); g.add(mark);
    if(pi===0){ const spl=new THREE.PointLight(0xffd700,0.7,4); spl.position.set(px,0.5,pz); g.add(spl); }
  });
  // Energy magic flowing through roots when activated
  const rMagic=new THREE.Mesh(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([new THREE.Vector3(-5,1,z4t-1),new THREE.Vector3(0,2,z4t-2),new THREE.Vector3(5,1.5,z4t-1)]),16,0.08,6,false),
    new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.5,transparent:true,opacity:0.62}));
  g.add(rMagic);
  _placeCoins(scene,g,_coinGrid(0,z4t,10,5,12));
  _placeGems(scene,g,[[0,0.5,z4t+2]]);

  // ── ZONE 5: WINDY CORRIDOR ────────────────────────────────────────────────────
  const z5t=tz9[4].z;
  _zoneMarker(g,scene,-8,z5t,5,'#92400e'); _zoneMarker(g,scene,8,z5t,5,'#92400e');
  // Narrower stone corridor
  [-8,8].forEach((wx)=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(1.6,7,10),
      new THREE.MeshStandardMaterial({color:0x3a3020,roughness:0.96,metalness:0.04}));
    wall.position.set(wx,3.5,z5t); g.add(wall);
  });
  // Hazard cracks in floor
  const crackMat=new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff4500,emissiveIntensity:0.8,transparent:true,opacity:0.6});
  [[-3,z5t-1],[3,z5t-1],[0,z5t-3],[-3,z5t-5],[3,z5t-5]].forEach(([cx,cz])=>{
    const crack=new THREE.Mesh(new THREE.PlaneGeometry(0.1+Math.random()*0.15,2+Math.random()*3),crackMat);
    crack.rotation.x=-Math.PI/2; crack.rotation.z=Math.random()*Math.PI; crack.position.set(cx,0.01,cz); g.add(crack);
    const cpl=new THREE.PointLight(0xff6b35,0.4,3); cpl.position.set(cx,0.5,cz); g.add(cpl);
  });
  // Wind debris (stationary markers)
  const debrisMat=new THREE.MeshStandardMaterial({color:0x5a4a30,roughness:0.9});
  [[-5,z5t-2],[5,z5t-3],[-4,z5t-5],[4,z5t-4]].forEach(([dx,dz])=>{
    const d=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4),debrisMat);
    d.position.set(dx,0.2,dz); d.rotation.y=Math.random()*Math.PI; g.add(d);
  });
  _placeCoins(scene,g,_coinGrid(0,z5t,9,5,14));
  _placeShields(scene,g,[[0,0.45,z5t+2.5]]);

  // ── ZONE 6: FOX CHASE ────────────────────────────────────────────────────────
  const z6t=tz9[5].z;
  _zoneMarker(g,scene,-8,z6t,6,'#ffd700'); _zoneMarker(g,scene,8,z6t,6,'#ffd700');
  // Chase path — wider corridor
  const chaseMat=new THREE.MeshStandardMaterial({color:0xff6b35,emissive:0xff4500,emissiveIntensity:0.7,transparent:true,opacity:0.65});
  // Speed arrows on ground
  [0,-1.8,-3.6,-5.4].forEach(az=>{
    const arr=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.9,3),chaseMat);
    arr.rotation.x=-Math.PI/2; arr.position.set(0,0.025,z6t+az); g.add(arr);
  });
  // Fox (target mover)
  const foxMat=new THREE.MeshStandardMaterial({color:0xff8c00,roughness:0.55,metalness:0.1});
  const fox=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35,0.7),foxMat);
  fox.position.set(0,0.3,z6t-3); fox.name='mover_fox'; g.add(fox);
  // Fox ears
  const eMat=new THREE.MeshStandardMaterial({color:0xff6600});
  [[-0.12,0.55],[ 0.12,0.55]].forEach(([ex,_])=>{
    const ear=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.22,4),eMat);
    ear.position.set(ex,0.56,z6t-2.9); g.add(ear);
  });
  const foxPL=new THREE.PointLight(0xff8c00,0.9,6); foxPL.position.set(0,1,z6t-3); g.add(foxPL);
  // Shortcut markings
  [-5,5].forEach(sx=>{
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(1.2,3),
      new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.5,transparent:true,opacity:0.45}));
    sc.rotation.x=-Math.PI/2; sc.position.set(sx,0.013,z6t-2); g.add(sc);
  });
  _placeCoins(scene,g,_coinGrid(0,z6t,12,5,14));
  _placeGems(scene,g,[[-4,0.5,z6t-2],[4,0.5,z6t-2]]);

  // ── ZONE 7: SAFE CAVE ────────────────────────────────────────────────────────
  const z7t=tz9[6].z;
  _zoneMarker(g,scene,-8,z7t,7,'#b45309'); _zoneMarker(g,scene,8,z7t,7,'#b45309');
  // Crystal cave ceiling hints (stalagmites)
  const crysMat=new THREE.MeshStandardMaterial({color:0x9b59b6,emissive:0x8b5cf6,emissiveIntensity:0.7,transparent:true,opacity:0.88,roughness:0.2,metalness:0.55});
  [[-5,z7t+1],[5,z7t+1],[-3,z7t-2],[3,z7t-2],[0,z7t-1]].forEach(([cx,cz],ci)=>{
    const h=0.9+(ci%2)*0.6;
    const crys=new THREE.Mesh(new THREE.ConeGeometry(0.24,h,5),crysMat);
    crys.position.set(cx,h/2,cz); g.add(crys);
  });
  // Healing pool (water)
  const poolMat=new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00aaff,emissiveIntensity:0.5,transparent:true,opacity:0.6,roughness:0.1});
  const pool=new THREE.Mesh(new THREE.CircleGeometry(2.0,16),poolMat);
  pool.rotation.x=-Math.PI/2; pool.position.set(0,-0.02,z7t); g.add(pool);
  const poolPL=new THREE.PointLight(0x00d9ff,1.2,10); poolPL.position.set(0,1,z7t); g.add(poolPL);
  // Supply chests
  [-4.5,4.5].forEach(cx=>{
    const chest=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.7,0.7),
      new THREE.MeshStandardMaterial({color:0x8b6914,roughness:0.6,metalness:0.35}));
    chest.position.set(cx,0.35,z7t); chest.castShadow=true; g.add(chest);
    const lock=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,0.08),
      new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.9}));
    lock.position.set(cx,0.48,z7t-0.36); g.add(lock);
  });
  _placeCoins(scene,g,_coinGrid(0,z7t,14,7,25)); // Generous recovery coins
  _placeShields(scene,g,[[-3,0.45,z7t+2],[3,0.45,z7t+2],[0,0.45,z7t-2],[0,0.45,z7t+2]]);

  // ── ZONE 8: COLLAPSING HALL ───────────────────────────────────────────────────
  const z8t=tz9[7].z;
  _zoneMarker(g,scene,-8,z8t,8,'#f59e0b'); _zoneMarker(g,scene,8,z8t,8,'#f59e0b');
  // Crumbling column (tilted)
  const collMat=new THREE.MeshStandardMaterial({color:0x6b5a35,roughness:0.94,metalness:0.06});
  const fallCol=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.62,7,8),collMat);
  fallCol.position.set(-4,3,z8t-1); fallCol.rotation.z=0.35; fallCol.castShadow=true; g.add(fallCol);
  // Falling blocks (movers)
  [-3,-1,1,3].forEach((bx,bi)=>{
    const blk=new THREE.Mesh(new THREE.BoxGeometry(1.2+bi%2*0.4,0.9,1.2),collMat);
    blk.position.set(bx,2.5+bi,z8t-bi*1.2); blk.name=`mover_block${bi}`; blk.castShadow=true; g.add(blk);
  });
  // Dust/rubble on floor
  const rubbleMat=new THREE.MeshStandardMaterial({color:0x5a4830,roughness:0.98});
  [[-3,z8t-1],[3,z8t-2],[0,z8t-3],[-2,z8t-4],[2,z8t-5]].forEach(([rx,rz])=>{
    const rub=new THREE.Mesh(new THREE.DodecahedronGeometry(0.2+Math.random()*0.15,0),rubbleMat);
    rub.position.set(rx,0.15,rz); rub.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,0); g.add(rub);
  });
  // Danger light
  const dangPL=new THREE.PointLight(0xff4400,1.4,15); dangPL.position.set(0,5,z8t); g.add(dangPL);
  // Warning cracks on floor
  const wcMat=new THREE.MeshStandardMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:0.7,transparent:true,opacity:0.55});
  [[-2,z8t-2],[2,z8t-3],[0,z8t-4]].forEach(([wx,wz])=>{
    const wc=new THREE.Mesh(new THREE.PlaneGeometry(0.09,2.5+Math.random()*2),wcMat);
    wc.rotation.x=-Math.PI/2; wc.rotation.z=Math.random()*Math.PI*0.5; wc.position.set(wx,0.01,wz); g.add(wc);
  });
  _placeCoins(scene,g,_coinGrid(0,z8t,11,5,14));
  _placeShields(scene,g,[[0,0.45,z8t+3]]);

  // ── ZONE 9: POWER SHRINE ─────────────────────────────────────────────────────
  const z9t=tz9[8].z;
  scene.userData.finishZ=z9t;
  // Shrine structure
  const shrMat=new THREE.MeshStandardMaterial({color:0x8b7355,roughness:0.84,metalness:0.16});
  const shrineBase=new THREE.Mesh(new THREE.CylinderGeometry(4,5,0.5,12),shrMat);
  shrineBase.position.set(0,0.25,z9t); g.add(shrineBase);
  // Shrine columns ring
  for(let ci=0;ci<8;ci++){
    const a=ci/8*Math.PI*2;
    const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,6,8),shrMat);
    sc.position.set(Math.cos(a)*3.2,3,z9t+Math.sin(a)*3.2); sc.castShadow=true; g.add(sc);
    const tf=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.55,8),flameMat);
    tf.position.set(Math.cos(a)*3.2,6.3,z9t+Math.sin(a)*3.2); g.add(tf);
    const tpl2=new THREE.PointLight(0xff6b35,0.6,4); tpl2.position.set(Math.cos(a)*3.2,6.3,z9t+Math.sin(a)*3.2); g.add(tpl2);
  }
  // Elevated idol platform
  const platMat=new THREE.MeshStandardMaterial({color:0xaa6600,metalness:0.75,roughness:0.25,emissive:0x664400,emissiveIntensity:0.3});
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.5,0.55,16),platMat);
  plat.position.set(0,0.55,z9t); g.add(plat);
  const platGlow=new THREE.Mesh(new THREE.RingGeometry(2.3,2.8,24),
    new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:0.35,side:THREE.DoubleSide}));
  platGlow.rotation.x=-Math.PI/2; platGlow.position.set(0,0.82,z9t); g.add(platGlow);
  // Central goal — golden idol (Idol Heist) or power crystal
  if(isIdolHeist){
    const idolMat=new THREE.MeshStandardMaterial({color:0xffaa00,emissive:0xff8800,emissiveIntensity:2.2,metalness:0.95,roughness:0.12});
    const idolBody=new THREE.Mesh(new THREE.BoxGeometry(0.7,1.1,0.5),idolMat);
    idolBody.position.set(0,1.45,z9t); idolBody.name='cp'; g.add(idolBody);
    const idolHead=new THREE.Mesh(new THREE.SphereGeometry(0.32,10,10),idolMat);
    idolHead.position.set(0,2.15,z9t); idolHead.name='cp'; g.add(idolHead);
  } else {
    const crystGoalMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:5.0,roughness:0.1,metalness:0.6,transparent:true,opacity:0.95});
    const crystGoal=new THREE.Mesh(new THREE.OctahedronGeometry(1.2,1),crystGoalMat);
    crystGoal.position.set(0,6.5,z9t); crystGoal.name='cp'; g.add(crystGoal);
  }
  // Orbiting gems around shrine crystal
  for(let oi=0;oi<6;oi++){
    const oa=oi/6*Math.PI*2;
    const og=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),
      new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:2.5}));
    og.position.set(Math.cos(oa)*1.8,6.5,z9t+Math.sin(oa)*1.8); og.name='cp'; g.add(og);
  }
  // Energy beam shooting up
  const shrineSpot=new THREE.SpotLight(0xffd700,5.0,30,Math.PI/6,0.3,1.2);
  shrineSpot.position.set(0,18,z9t); shrineSpot.target.position.set(0,0,z9t);
  g.add(shrineSpot); g.add(shrineSpot.target);
  // Goal floor glow
  const goalFloor=new THREE.Mesh(new THREE.CircleGeometry(5.5,32),
    new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:0.4,transparent:true,opacity:0.2}));
  goalFloor.rotation.x=-Math.PI/2; goalFloor.position.set(0,0.013,z9t); g.add(goalFloor);
  const goalPL=new THREE.PointLight(0xffd700,4.0,22); goalPL.position.set(0,6.5,z9t); g.add(goalPL);
  _placeCoins(scene,g,_coinGrid(0,z9t,10,5,12));
  _placeGems(scene,g,[[-2,0.5,z9t+2],[2,0.5,z9t+2],[0,0.5,z9t-2]]);

  // ── COLUMNS FLANKING the full path ───────────────────────────────────────────
  for(let cz2=z1t-6;cz2>z9t+4;cz2-=6){
    [-7,7].forEach(cx=>{
      const col2=new THREE.Mesh(new THREE.CylinderGeometry(0.48,0.58,7,8),colMat);
      col2.position.set(cx,3.5,cz2); col2.castShadow=true; g.add(col2);
      const cap2=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.38,1.4),capMat);
      cap2.position.set(cx,7.19,cz2); g.add(cap2);
      // Torch on every 2nd column
      if(Math.abs(cz2 % 12)<3){
        const t=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,0.9,6),torchMat); t.position.set(cx,4.8,cz2); g.add(t);
        const f=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.48,8),flameMat); f.position.set(cx,5.44,cz2); g.add(f);
        const tpl=new THREE.PointLight(0xff6b35,0.75,7); tpl.position.set(cx,5.5,cz2); g.add(tpl);
      }
    });
  }

  // ── ATMOSPHERIC LIGHTS ────────────────────────────────────────────────────────
  [[0,3,z1t,0xf59e0b,1.8,14],[0,4,z9t,0xffd700,2.2,18],[0,3,(z1t+z9t)/2,0xb45309,0.7,24],
   [-6,2,tz9[4].z,0xff4400,0.6,14],[6,2,tz9[4].z,0xff4400,0.6,14]].forEach(([lx,ly,lz,lc,li,lr])=>{
    const pl=new THREE.PointLight(lc,li,lr); pl.position.set(lx,ly,lz); g.add(pl);
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

// ══════════════════════════════════════════════════════════════════════════════
// ULTIMATE COURSES — DODGE, ESCAPE, COLLECT, FLIGHT
// ══════════════════════════════════════════════════════════════════════════════

function _dodgeBallsArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 50, 80);
  const floorMat = new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.25,metalness:0.05});
  // Floor extended to z=18 so camera at z=13 has floor beneath it
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 80), floorMat);
  floor.rotation.x=-Math.PI/2; floor.position.set(0,0,-7); floor.receiveShadow=true; g.add(floor);
  const checkMat = new THREE.MeshStandardMaterial({color:0xe0e8ff,roughness:0.3});
  for(let x=-5;x<=5;x++) for(let z=-6;z<=7;z++){
    if((x+z)%2===0){
      const tile=new THREE.Mesh(new THREE.PlaneGeometry(4.8,4.8),checkMat);
      tile.rotation.x=-Math.PI/2; tile.position.set(x*5,0.005,z*5); g.add(tile);
    }
  }
  const startMat=new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.5,transparent:true,opacity:0.85});
  const startZ=new THREE.Mesh(new THREE.PlaneGeometry(10,5),startMat);
  startZ.rotation.x=-Math.PI/2; startZ.position.set(0,0.01,4); g.add(startZ);
  const finMat=new THREE.MeshStandardMaterial({color:0xef4444,emissive:0xff2200,emissiveIntensity:0.9,transparent:true,opacity:0.9});
  const finZ=new THREE.Mesh(new THREE.PlaneGeometry(10,5),finMat);
  finZ.rotation.x=-Math.PI/2; finZ.position.set(0,0.01,-28); g.add(finZ);
  const poleMat=new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff2200,emissiveIntensity:2.5});
  [-4,4].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,6,8),poleMat); p.position.set(x,3,-28); g.add(p); });
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,9,8),poleMat); bar.rotation.z=Math.PI/2; bar.position.set(0,6,-28); g.add(bar);
  const wMat=new THREE.MeshStandardMaterial({color:0x3b82f6,roughness:0.6,metalness:0.3});
  // Back wall moved to z=18 so camera (at z≈13) stays INSIDE the arena
  [-32,18].forEach(wz=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(60,5,0.4),wMat); w.position.set(0,2.5,wz); g.add(w); });
  [-30,30].forEach(wx=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(0.4,5,84),wMat); w.position.set(wx,2.5,-7); g.add(w); });
  const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.9});
  [[-12,8,-18],[10,7,-8],[-5,9,-25],[15,6,-3]].forEach(([cx,cy,cz])=>{
    [1.2,1.8,1.3,1.0].forEach((r,ci)=>{ const c=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),cloudMat); c.position.set(cx+ci*r*1.4,cy,cz); g.add(c); });
  });
  const ballDefs=[{col:0xef4444,r:0.9,x:-7,pz:-12,phase:0},{col:0x3b82f6,r:0.8,x:0,pz:-18,phase:2.1},{col:0xf59e0b,r:1.0,x:7,pz:-6,phase:4.2}];
  const balls=ballDefs.map((bd,i)=>{
    const ball=new THREE.Mesh(new THREE.SphereGeometry(bd.r,18,14),new THREE.MeshStandardMaterial({color:bd.col,metalness:0.3,roughness:0.4,emissive:bd.col,emissiveIntensity:0.2}));
    ball.position.set(bd.x,bd.r,bd.pz); ball.castShadow=true; ball.name=`dball_${i}`; g.add(ball);
    const pl=new THREE.PointLight(bd.col,0.6,5); pl.position.set(bd.x,1.5,bd.pz); g.add(pl);
    return ball;
  });
  const sunLight=new THREE.DirectionalLight(0xfffce0,1.2); sunLight.position.set(8,14,5); sunLight.castShadow=true; g.add(sunLight);
  // Active ball state — each ball rolls toward robot position
  const ballState=ballDefs.map((bd,i)=>({z:bd.pz, dir:i%2===0?-1:1, speed:3.5+i*0.6}));
  scene.userData.finishZone={x:0,z:-28,radius:5};
  scene.userData.obstacles=balls.map((b,i)=>({mesh:b,radius:ballDefs[i].r+0.12,type:'rolling'}));
  scene.userData.movers=balls.map((b,i)=>({
    update(t,dt,rs){
      const bs=ballState[i];
      // Home x-axis toward robot to intercept
      if(rs){ const dx=rs.x-ballDefs[i].x; ballDefs[i].x+=dx*0.018; }
      bs.z+=bs.dir*bs.speed*dt;
      if(bs.z<-33){ bs.z=-33; bs.dir=1; }
      if(bs.z>10){ bs.z=10; bs.dir=-1; }
      b.position.z=bs.z; b.position.x=ballDefs[i].x;
      b.rotation.x+=bs.dir*bs.speed*dt*0.85; b.rotation.z=Math.sin(t*1.2+i)*0.15;
    }
  }));
  scene.add(g);
}

function _dodgeLaserArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x060a18);
  scene.fog = new THREE.Fog(0x060a18, 25, 55);
  const floorMat=new THREE.MeshStandardMaterial({color:0x0d1226,roughness:0.4,metalness:0.7});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(66,68),floorMat);
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const gridMat=new THREE.MeshStandardMaterial({color:0x1a2040,roughness:0.3,metalness:0.8,emissive:0x0a1020,emissiveIntensity:0.3});
  for(let x=-6;x<=6;x+=2) for(let z=-6;z<=6;z+=2){
    const tile=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),gridMat); tile.rotation.x=-Math.PI/2; tile.position.set(x*5,0.002,z*5); g.add(tile);
  }
  const neon=new THREE.MeshStandardMaterial({color:0x00ffff,emissive:0x00ddff,emissiveIntensity:3.0});
  [-32,18].forEach(wz=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(66,0.05,0.1),neon); s.position.set(0,0.03,wz); g.add(s); });
  [-33,33].forEach(wx=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.05,84),neon); s.position.set(wx,0.03,-7); g.add(s); });
  const safesMat=new THREE.MeshStandardMaterial({color:0x00aaff,emissive:0x0088dd,emissiveIntensity:0.7,transparent:true,opacity:0.7});
  const safeSt=new THREE.Mesh(new THREE.CircleGeometry(4.5,16),safesMat); safeSt.rotation.x=-Math.PI/2; safeSt.position.set(0,0.01,5); g.add(safeSt);
  const pl0=new THREE.PointLight(0x00aaff,1.8,12); pl0.position.set(0,2,5); g.add(pl0);
  const safeFinMat=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:1.0,transparent:true,opacity:0.8});
  const safeFin=new THREE.Mesh(new THREE.CircleGeometry(4.5,16),safeFinMat); safeFin.rotation.x=-Math.PI/2; safeFin.position.set(0,0.01,-28); g.add(safeFin);
  const pl1=new THREE.PointLight(0x00ff88,2.5,14); pl1.position.set(0,2,-28); g.add(pl1);
  const laserPositions=[{x:-9,z:-5},{x:8,z:-8},{x:-6,z:-14},{x:7,z:-18},{x:-10,z:-22},{x:9,z:-25}];
  const laserObs=laserPositions.map(p=>({mesh:{position:{x:p.x,y:1.8,z:p.z}},radius:0.7,type:'laser_tip'}));
  const laserGroups=laserPositions.map((pos,i)=>{
    const postMat=new THREE.MeshStandardMaterial({color:0x223344,metalness:0.85,roughness:0.25});
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,3.2,8),postMat); post.position.set(pos.x,1.6,pos.z); g.add(post);
    const baseMat=new THREE.MeshStandardMaterial({color:0x334455,metalness:0.9,roughness:0.2,emissive:0x00aaff,emissiveIntensity:0.4});
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.3,12),baseMat); base.position.set(pos.x,0.15,pos.z); g.add(base);
    const lg=new THREE.Group(); lg.position.set(pos.x,1.9,pos.z);
    const armMat=new THREE.MeshStandardMaterial({color:0x00ffdd,emissive:0x00ffdd,emissiveIntensity:4.0,transparent:true,opacity:0.95});
    const arm=new THREE.Mesh(new THREE.BoxGeometry(4.8,0.06,0.06),armMat); arm.position.x=2.4; lg.add(arm);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,8),new THREE.MeshStandardMaterial({color:0x00ffff,emissive:0x00ffff,emissiveIntensity:5.0})); tip.position.x=4.8; lg.add(tip);
    const lpl=new THREE.PointLight(0x00ffdd,1.0,8); lpl.position.x=2.4; lg.add(lpl);
    g.add(lg);
    return {group:lg,pos};
  });
  const wallMat=new THREE.MeshStandardMaterial({color:0x0a0f1a,roughness:0.7,metalness:0.5});
  // Back wall moved to z=18 so camera (at z≈13) is INSIDE the arena
  [-32,18].forEach(wz=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(66,8,0.5),wallMat); w.position.set(0,4,wz); g.add(w); });
  [-33,33].forEach(wx=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(0.5,8,84),wallMat); w.position.set(wx,4,-7); g.add(w); });
  [[0x00ffdd,8,-10,10],[0xff00aa,4,-20,8],[0x0044ff,10,-4,6]].forEach(([col,x,z,r])=>{ const pl=new THREE.PointLight(col,0.7,r); pl.position.set(x,3,z); g.add(pl); });
  scene.userData.finishZone={x:0,z:-28,radius:4.5};
  scene.userData.obstacles=laserObs;
  scene.userData.movers=laserGroups.map((lg,i)=>({
    update(t,dt,rs){
      // Lasers speed up the longer robot is alive
      const urgency=rs?Math.min(2.2,1+rs.t*0.008):1;
      const spd=(0.7+i*0.22)*urgency;
      const angle=t*spd*(i%2===0?1:-1);
      lg.group.rotation.y=angle;
      laserObs[i].mesh.position.x=lg.pos.x+Math.sin(angle)*4.8;
      laserObs[i].mesh.position.z=lg.pos.z+Math.cos(angle)*4.8;
    }
  }));
  scene.add(g);
}

function _dodgeAsteroidArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x000008);
  scene.fog = null;
  const starGeo=new THREE.BufferGeometry();
  const sp=new Float32Array(2000*3); for(let i=0;i<sp.length;i++) sp[i]=(Math.random()-0.5)*200;
  starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
  g.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.3,transparent:true,opacity:0.9})));
  const nebMat=new THREE.MeshStandardMaterial({color:0x1a0030,emissive:0x3300ff,emissiveIntensity:0.12,transparent:true,opacity:0.28,side:THREE.DoubleSide});
  [[-20,5,-30],[15,8,-25],[-5,3,-20]].forEach(([nx,ny,nz])=>{ const n=new THREE.Mesh(new THREE.SphereGeometry(12,8,6),nebMat); n.position.set(nx,ny,nz); g.add(n); });
  const platMat=new THREE.MeshStandardMaterial({color:0x1a3a5c,metalness:0.9,roughness:0.2,emissive:0x0066cc,emissiveIntensity:0.3});
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,0.4,10),platMat); plat.position.set(0,0,5); g.add(plat);
  const prMat=new THREE.MeshStandardMaterial({color:0x0088ff,emissive:0x0066ff,emissiveIntensity:2.8});
  const pr=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.15,8,24),prMat); pr.rotation.x=Math.PI/2; pr.position.set(0,0.3,5); g.add(pr);
  const beaconMat=new THREE.MeshStandardMaterial({color:0xffaa00,emissive:0xffcc00,emissiveIntensity:3.5});
  const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,8,8),beaconMat); beacon.position.set(0,0,-42); g.add(beacon);
  const brMat=new THREE.MeshStandardMaterial({color:0xffcc00,emissive:0xffaa00,emissiveIntensity:2.5,transparent:true,opacity:0.9});
  const br=new THREE.Mesh(new THREE.TorusGeometry(4,0.2,8,24),brMat); br.rotation.x=Math.PI/2; br.position.set(0,0,-42); br.name='cp'; g.add(br);
  const bpl=new THREE.PointLight(0xffaa00,3.5,22); bpl.position.set(0,2,-42); g.add(bpl);
  const astDefs=Array.from({length:20},(_,i)=>{
    const sz=0.35+Math.random()*0.9;
    return {x:(Math.random()-0.5)*22,y:(Math.random()-0.5)*4,z:-6-i*2.2,sz,
      rx:Math.random()*0.025,ry:Math.random()*0.035,rz:Math.random()*0.018,phase:i*0.42};
  });
  const astMeshes=astDefs.map((ad,i)=>{
    const geo=new THREE.SphereGeometry(ad.sz,10,8);
    const pos2=geo.attributes.position;
    for(let v=0;v<pos2.count;v++){const n2=1+(Math.random()-0.5)*0.38; pos2.setXYZ(v,pos2.getX(v)*n2,pos2.getY(v)*n2,pos2.getZ(v)*n2);}
    pos2.needsUpdate=true; geo.computeVertexNormals();
    const ast=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x5a4a3a,roughness:0.95,metalness:0.15}));
    ast.position.set(ad.x,ad.y,ad.z); ast.castShadow=true; ast.name=`ast_${i}`; g.add(ast); return ast;
  });
  const ambl=new THREE.AmbientLight(0x111122,1.0); g.add(ambl);
  [0x4466ff,0xffffff].forEach((col,i)=>{ const pl=new THREE.PointLight(col,i===0?1.8:0.6,80); pl.position.set(i*10-5,10,-20); g.add(pl); });
  scene.userData.finishZone={x:0,z:-42,radius:4.5};
  scene.userData.obstacles=astMeshes.map((m,i)=>({mesh:m,radius:astDefs[i].sz+0.35,type:'asteroid',check3d:true}));
  scene.userData.movers=astMeshes.map((m,i)=>({
    update(t,dt,rs){
      // Asteroids drift AND slowly converge toward robot's path
      const drift=astDefs[i];
      const targetX=rs?rs.x*0.25+drift.x*0.75:drift.x;
      drift.x+=(targetX-drift.x)*0.004;
      m.position.x=drift.x+Math.sin(t*0.5+drift.phase)*7;
      m.position.z=drift.z+Math.sin(t*0.32+drift.phase*0.8)*6;
      m.position.y=drift.y+Math.sin(t*0.7+drift.phase*0.5)*2.5;
      m.rotation.x+=drift.rx; m.rotation.y+=drift.ry; m.rotation.z+=drift.rz;
    }
  }));
  scene.add(g);
}

function _escapeWallArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x180a00);
  scene.fog = new THREE.Fog(0x180a00, 20, 52);
  const floorMat=new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:0.95,metalness:0.05});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(7,78),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const crackMat=new THREE.MeshStandardMaterial({color:0x1a0f00,roughness:1});
  for(let z=-32;z<=8;z+=5){ const c=new THREE.Mesh(new THREE.BoxGeometry(5+Math.random()*2,0.02,0.12),crackMat); c.rotation.x=-Math.PI/2; c.position.set((Math.random()-0.5)*2,0.005,z); g.add(c); }
  const stoneMat=new THREE.MeshStandardMaterial({color:0x4a3820,roughness:0.97,metalness:0.02});
  const wallL=new THREE.Mesh(new THREE.BoxGeometry(1.5,10,80),stoneMat); wallL.position.set(-4.3,5,-14); wallL.castShadow=true; g.add(wallL);
  const wallR=new THREE.Mesh(new THREE.BoxGeometry(1.5,10,80),stoneMat); wallR.position.set(4.3,5,-14); wallR.castShadow=true; g.add(wallR);
  const ceil=new THREE.Mesh(new THREE.BoxGeometry(7,0.5,80),new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:0.99})); ceil.position.set(0,8.5,-14); g.add(ceil);
  const torchMat=new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff4400,emissiveIntensity:3.0});
  [-26,-20,-14,-8,-2,4].forEach(tz=>{
    [-3.0,3.0].forEach(tx=>{
      const torch=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.5,6),new THREE.MeshStandardMaterial({color:0x8b4513})); torch.position.set(tx,3.5,tz); g.add(torch);
      const flame=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,6),torchMat); flame.position.set(tx,4.0,tz); g.add(flame);
      const tpl=new THREE.PointLight(0xff6600,0.9,8); tpl.position.set(tx,4.0,tz); g.add(tpl);
    });
  });
  const doorMat=new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x00ff44,emissiveIntensity:1.8});
  const door=new THREE.Mesh(new THREE.BoxGeometry(5,8,0.4),doorMat); door.position.set(0,4,-34); g.add(door);
  const dpl=new THREE.PointLight(0x00ff66,3.5,16); dpl.position.set(0,4,-30); g.add(dpl);
  const doorFrame=new THREE.Mesh(new THREE.BoxGeometry(5.6,8.6,0.2),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.85})); doorFrame.position.set(0,4.3,-34.1); g.add(doorFrame);
  const wallMeshMat=new THREE.MeshStandardMaterial({color:0x5a3010,roughness:0.95,metalness:0.1,emissive:0xff3300,emissiveIntensity:0.05});
  // Wall starts further back (z=18) so camera at z=13 can see the robot initially
  const wallMesh=new THREE.Mesh(new THREE.BoxGeometry(6,10,1.5),wallMeshMat); wallMesh.position.set(0,5,18); wallMesh.castShadow=true; wallMesh.name='escape_wall_mesh'; g.add(wallMesh);
  for(let ci=0;ci<8;ci++){
    const wc=new THREE.Mesh(new THREE.BoxGeometry(0.06,2.5+Math.random()*3,0.06),crackMat); wc.position.set((Math.random()-0.5)*5,2+Math.random()*3,18.8); g.add(wc);
  }
  const dustPl=new THREE.PointLight(0xaa6633,1.4,8); dustPl.position.set(0,5,18); g.add(dustPl);
  const ambl2=new THREE.AmbientLight(0x110800,1.0); g.add(ambl2);
  scene.userData.finishZone={x:0,z:-34,radius:4.0};
  scene.userData.obstacles=[{mesh:wallMesh,radius:3.2,type:'wall'}];
  scene.userData.movers=[{
    update(t,dt,rs){
      // Wall gets faster as robot gets closer to finish
      const baseSpeed=2.4;
      const urgency=rs?Math.min(3.5,1+(Math.abs(rs.z)/12)*0.6):1;
      wallMesh.position.z=18-t*baseSpeed*urgency;
      dustPl.position.z=wallMesh.position.z;
      wallMesh.position.x=Math.sin(t*9)*0.09;
      wallMesh.rotation.z=Math.sin(t*7)*0.005;
    }
  }];
  scene.add(g);
}

function _escapeHuntersArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a3010);
  scene.fog = new THREE.Fog(0x1a3010, 32, 62);
  const floorMat=new THREE.MeshStandardMaterial({color:0x3a5a20,roughness:0.9,metalness:0.0});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(88,92),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const dirtMat=new THREE.MeshStandardMaterial({color:0x8b6040,roughness:0.95});
  [[-10,-10,22,5],[5,-20,5,32],[14,-5,32,4]].forEach(([px,pz,pw,ph])=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),dirtMat); p.rotation.x=-Math.PI/2; p.position.set(px,0.002,pz); g.add(p); });
  const trunkMat=new THREE.MeshStandardMaterial({color:0x4a2a10,roughness:0.9});
  const leafMat=new THREE.MeshStandardMaterial({color:0x2a6020,roughness:0.8});
  const dkLeaf=new THREE.MeshStandardMaterial({color:0x1a4010,roughness:0.9});
  for(let i=0;i<30;i++){
    const angle=(i/30)*Math.PI*2; const r=40+(Math.random()-0.5)*5;
    const tx=Math.cos(angle)*r, tz=Math.sin(angle)*r; const h=4+Math.random()*5;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.35,h,6),trunkMat); trunk.position.set(tx,h/2,tz); trunk.castShadow=true; g.add(trunk);
    const lh=2.5+Math.random()*2;
    const leaves=new THREE.Mesh(new THREE.ConeGeometry(2+Math.random(),lh,8),leafMat); leaves.position.set(tx,h+lh/2,tz); leaves.castShadow=true; g.add(leaves);
    const l2=new THREE.Mesh(new THREE.ConeGeometry(1.5,lh*0.8,7),dkLeaf); l2.position.set(tx,h+lh/2+lh*0.6,tz); g.add(l2);
  }
  const sfMat=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:1.0,transparent:true,opacity:0.22,side:THREE.DoubleSide});
  const sfRingMat=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff88,emissiveIntensity:2.5,transparent:true,opacity:0.9});
  [[-12,-18],[15,-10],[-8,-32],[12,-28]].forEach(([sx,sz])=>{
    const sf=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,10),sfMat); sf.position.set(sx,2,sz); g.add(sf);
    const sfr=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.15,8,24),sfRingMat); sfr.rotation.x=Math.PI/2; sfr.position.set(sx,0.2,sz); sfr.name='cp'; g.add(sfr);
    const spl=new THREE.PointLight(0x00ff88,1.8,9); spl.position.set(sx,2,sz); g.add(spl);
  });
  const finMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xffaa00,emissiveIntensity:1.8,transparent:true,opacity:0.88});
  const fin=new THREE.Mesh(new THREE.PlaneGeometry(10,6),finMat); fin.rotation.x=-Math.PI/2; fin.position.set(0,0.01,-38); g.add(fin);
  const fpl=new THREE.PointLight(0xfbbf24,3.5,16); fpl.position.set(0,3,-38); g.add(fpl);
  const hunterColors=[0xef4444,0x8b5cf6,0x3b82f6];
  const hunterData=[{x:-12,z:-8},{x:11,z:-16},{x:0,z:-26}];
  const hunters=hunterColors.map((col,i)=>{
    const hg=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.65,12,10),new THREE.MeshStandardMaterial({color:col,metalness:0.6,roughness:0.3,emissive:col,emissiveIntensity:0.55})); hg.add(body);
    const aura=new THREE.Mesh(new THREE.TorusGeometry(0.95,0.05,6,24),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:2.8,transparent:true,opacity:0.75})); aura.name='cp'; hg.add(aura);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,8),new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:4.5})); eye.position.z=0.55; hg.add(eye);
    const hpl=new THREE.PointLight(col,1.2,7); hg.add(hpl);
    hg.position.set(hunterData[i].x,0.65,hunterData[i].z); g.add(hg); return hg;
  });
  const sunL=new THREE.DirectionalLight(0xc8e8a0,1.0); sunL.position.set(5,12,4); g.add(sunL);
  scene.userData.finishZone={x:0,z:-38,radius:5.5};
  scene.userData.obstacles=hunters.map(h=>({mesh:h,radius:0.9,type:'hunter'}));
  scene.userData.movers=hunters.map((h,i)=>({
    update(t,dt,rs){
      if(!rs){
        // Fallback orbit
        const r=7; const spd=0.4+i*0.1; const off=(i/3)*Math.PI*2;
        h.position.x=hunterData[i].x+Math.cos(t*spd+off)*r;
        h.position.z=hunterData[i].z+Math.sin(t*spd+off)*r;
        return;
      }
      // REAL CHASE: hunters home in on robot with slight delay so you can dodge
      const chaseSpeed=(1.4+i*0.2)*dt;
      const dx=rs.x-h.position.x, dz=rs.z-h.position.z;
      const dist=Math.sqrt(dx*dx+dz*dz);
      if(dist>0.6){
        h.position.x+=dx/dist*chaseSpeed;
        h.position.z+=dz/dist*chaseSpeed;
      }
      h.position.y=0.65+Math.sin(t*3+i*1.2)*0.12;
      h.rotation.y=Math.atan2(dx,dz);
    }
  }));
  scene.add(g);
}

function _escapeSwarmArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x080c14);
  scene.fog = new THREE.Fog(0x080c14, 38, 72);
  const floorMat=new THREE.MeshStandardMaterial({color:0x0e1820,roughness:0.6,metalness:0.4});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(165,168),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const buildMat=new THREE.MeshStandardMaterial({color:0x1a2030,roughness:0.5,metalness:0.7});
  const emMat=new THREE.MeshStandardMaterial({color:0x0033aa,emissive:0x0033aa,emissiveIntensity:0.5,transparent:true,opacity:0.8});
  [[-15,4,-15,4,14],[ 12,3,-20,3,12],[-8,4,-30,4,10],[16,3,-32,3,8],[-20,4,-44,4,12],[8,4,-46,4,6],[-6,5,-58,5,15]].forEach(([bx,bw,bz,bd,bh])=>{
    const build=new THREE.Mesh(new THREE.BoxGeometry(bw*2,bh,bd*2),buildMat); build.position.set(bx,bh/2,bz); build.castShadow=true; build.receiveShadow=true; g.add(build);
    const wpl=new THREE.PointLight(0x2244ff,0.45,11); wpl.position.set(bx,bh*0.7,bz); g.add(wpl);
    const strip=new THREE.Mesh(new THREE.BoxGeometry(bw*2+0.1,0.08,0.08),emMat); strip.position.set(bx,bh+0.05,bz+bd); g.add(strip);
  });
  const bunkerMat=new THREE.MeshStandardMaterial({color:0x3a4a5a,metalness:0.85,roughness:0.25});
  const bunker=new THREE.Mesh(new THREE.BoxGeometry(8,5,8),bunkerMat); bunker.position.set(0,2.5,-65); bunker.castShadow=true; g.add(bunker);
  const doorMat=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff44,emissiveIntensity:3.0});
  const bDoor=new THREE.Mesh(new THREE.BoxGeometry(3,4,0.2),doorMat); bDoor.position.set(0,2,-69.1); g.add(bDoor);
  const beac=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,4,6),doorMat); beac.position.set(0,7,-65); g.add(beac);
  const bpl2=new THREE.PointLight(0x00ff88,4.5,22); bpl2.position.set(0,4,-65); g.add(bpl2);
  const droneDefs=Array.from({length:10},(_,i)=>({x:(i%5-2)*10,z:-12-Math.floor(i/5)*14,y:1.6+Math.random()*2,speed:0.32+Math.random()*0.3,off:i*(Math.PI*2/10)}));
  const droneMeshes=droneDefs.map((dd,i)=>{
    const dg=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.5),new THREE.MeshStandardMaterial({color:0x1a1a2a,metalness:0.9,roughness:0.2})); dg.add(body);
    const rotMat=new THREE.MeshStandardMaterial({color:0x444444,metalness:0.8,roughness:0.2});
    [[-0.3,0,-0.3],[0.3,0,-0.3],[-0.3,0,0.3],[0.3,0,0.3]].forEach(([rx,ry,rz])=>{ const rotor=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.03,8),rotMat); rotor.position.set(rx,ry,rz); dg.add(rotor); });
    const scan=new THREE.Mesh(new THREE.SphereGeometry(0.08,6,6),new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:4.5})); scan.position.set(0,-0.1,0.25); dg.add(scan);
    const dpl3=new THREE.PointLight(0xff2200,0.55,4); dg.add(dpl3);
    dg.position.set(dd.x,dd.y,dd.z); dg.name=`swarm_${i}`; g.add(dg); return dg;
  });
  const abl=new THREE.AmbientLight(0x0a0a15,1.0); g.add(abl);
  scene.userData.finishZone={x:0,z:-65,radius:5.0};
  scene.userData.obstacles=droneMeshes.map(m=>({mesh:m,radius:0.65,type:'drone',check3d:true}));
  scene.userData.movers=droneMeshes.map((m,i)=>({
    update(t,dt,rs){
      const dd=droneDefs[i];
      if(rs && t>5){
        // Swarm converges: mix of orbit + chase
        const chaseWeight=Math.min(0.9,(t-5)*0.05);
        // Chase toward robot
        const dx=rs.x-m.position.x, dz=rs.z-m.position.z;
        const dist=Math.sqrt(dx*dx+dz*dz);
        if(dist>1.5){
          m.position.x+=dx/dist*(0.55+i*0.03)*dt*chaseWeight;
          m.position.z+=dz/dist*(0.55+i*0.03)*dt*chaseWeight;
        }
        // Orbit component decreases as chase increases
        const r=(5+Math.sin(t*0.22+dd.off)*3)*(1-chaseWeight);
        m.position.x+=Math.cos(t*dd.speed+dd.off)*r*dt;
        m.position.z+=Math.sin(t*dd.speed*0.75+dd.off)*r*dt;
      } else {
        const r=7+Math.sin(t*0.22+dd.off)*4;
        m.position.x=dd.x+Math.cos(t*dd.speed+dd.off)*r;
        m.position.z=dd.z+Math.sin(t*dd.speed*0.75+dd.off)*r;
      }
      m.position.y=dd.y+Math.sin(t*1.3+dd.off)*0.55;
      m.rotation.y=t*dd.speed*2.2;
    }
  }));
  scene.add(g);
}

function _collectEasyArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0xf0f8ff);
  scene.fog = new THREE.Fog(0xf0f8ff, 42, 72);
  const floorMat=new THREE.MeshStandardMaterial({color:0xf8faff,roughness:0.2,metalness:0.05});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(48,52),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const gridMat=new THREE.LineBasicMaterial({color:0xe0e8f0});
  for(let i=-11;i<=11;i+=2){
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i*2,0.005,-25),new THREE.Vector3(i*2,0.005,23)]),gridMat));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-23,0.005,i*2),new THREE.Vector3(23,0.005,i*2)]),gridMat));
  }
  const delivMat=new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x16a34a,emissiveIntensity:0.55,transparent:true,opacity:0.88});
  const deliv=new THREE.Mesh(new THREE.PlaneGeometry(11,7),delivMat); deliv.rotation.x=-Math.PI/2; deliv.position.set(0,0.01,-19); g.add(deliv);
  const delivR=new THREE.Mesh(new THREE.TorusGeometry(5.5,0.13,7,28),new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:3.0})); delivR.rotation.x=Math.PI/2; delivR.position.set(0,0.16,-19); delivR.name='cp'; g.add(delivR);
  const dpl4=new THREE.PointLight(0x22c55e,2.5,14); dpl4.position.set(0,2,-19); g.add(dpl4);
  const cubeColors=[0xef4444,0x3b82f6,0x22c55e]; const cubePos=[{x:-6,z:-3},{x:0,z:-9},{x:6,z:-3}];
  const cubeMeshes=cubeColors.map((col,i)=>{
    const cube=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.65,metalness:0.3,roughness:0.4}));
    cube.position.set(cubePos[i].x,0.65,cubePos[i].z); cube.castShadow=true; cube.name=`cube_${i}`; g.add(cube);
    const gb=new THREE.Mesh(new THREE.CircleGeometry(0.85,8),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.45,transparent:true,opacity:0.5})); gb.rotation.x=-Math.PI/2; gb.position.set(cubePos[i].x,0.01,cubePos[i].z); g.add(gb);
    const cpl=new THREE.PointLight(col,1.1,5.5); cpl.position.set(cubePos[i].x,1.6,cubePos[i].z); g.add(cpl);
    return cube;
  });
  const wMat=new THREE.MeshStandardMaterial({color:0xc8d8e8,roughness:0.5,metalness:0.1,transparent:true,opacity:0.7});
  [-24,24].forEach(wz=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(49,4,0.3),wMat); w.position.set(0,2,wz); g.add(w); });
  [-24,24].forEach(wx=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(0.3,4,53),wMat); w.position.set(wx,2,-0.5); g.add(w); });
  const sunL2=new THREE.DirectionalLight(0xfff8f0,1.3); sunL2.position.set(8,15,5); sunL2.castShadow=true; g.add(sunL2);
  scene.userData.finishZone={x:0,z:-19,radius:5.5};
  scene.userData.obstacles=[];
  scene.userData.movers=cubeMeshes.map((c,i)=>({
    update(t){ c.position.y=0.65+Math.sin(t*2+i)*0.18; c.rotation.y+=0.012; }
  }));
  scene.add(g);
}

function _collectMediumArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a1a28);
  scene.fog = new THREE.Fog(0x1a1a28, 32, 62);
  const floorMat=new THREE.MeshStandardMaterial({color:0x2a2a3a,roughness:0.7,metalness:0.3});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(67,72),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const hazMat1=new THREE.MeshStandardMaterial({color:0xfbbf24}); const hazMat2=new THREE.MeshStandardMaterial({color:0x1a1a1a});
  for(let z=-32;z<=8;z+=4){ const stripe=new THREE.Mesh(new THREE.PlaneGeometry(67,1.5),(z%8===0?hazMat1:hazMat2)); stripe.rotation.x=-Math.PI/2; stripe.position.set(0,0.003,z); g.add(stripe); }
  const rackMat=new THREE.MeshStandardMaterial({color:0x3a3a50,metalness:0.75,roughness:0.35});
  [[-14,-10],[-14,-22],[14,-10],[14,-22]].forEach(([rx,rz])=>{
    const rack=new THREE.Mesh(new THREE.BoxGeometry(1,5,6),rackMat); rack.position.set(rx,2.5,rz); rack.castShadow=true; g.add(rack);
    [1,2.5,4].forEach(ry=>{ const shelf=new THREE.Mesh(new THREE.BoxGeometry(3,0.12,5.8),rackMat); shelf.position.set(rx,ry,rz); g.add(shelf); });
  });
  const objDefs=[{col:0xa855f7,x:-8,z:-5,type:'fragile'},{col:0x8b5cf6,x:8,z:-5,type:'fragile'},{col:0x78716c,x:-6,z:-18,type:'heavy'},{col:0x57534e,x:6,z:-18,type:'heavy'},{col:0x3b82f6,x:0,z:-12,type:'normal'}];
  const objMeshes=objDefs.map((od,i)=>{
    let geo; if(od.type==='fragile') geo=new THREE.OctahedronGeometry(0.65,1); else if(od.type==='heavy') geo=new THREE.BoxGeometry(1.1,1.1,1.1); else geo=new THREE.SphereGeometry(0.6,10,8);
    const obj=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:od.col,emissive:od.col,emissiveIntensity:od.type==='fragile'?0.55:0.2,metalness:od.type==='heavy'?0.75:0.3,roughness:0.4}));
    obj.position.set(od.x,0.65,od.z); obj.castShadow=true; g.add(obj);
    const opl=new THREE.PointLight(od.col,0.85,4.5); opl.position.set(od.x,1.6,od.z); g.add(opl);
    return obj;
  });
  const delivCols=[0xa855f7,0x8b5cf6,0x78716c,0x57534e,0x3b82f6];
  [[-10,-30],[-5,-30],[0,-30],[5,-30],[10,-30]].forEach(([dx,dz],i)=>{
    const dm=new THREE.MeshStandardMaterial({color:delivCols[i],emissive:delivCols[i],emissiveIntensity:0.65,transparent:true,opacity:0.72});
    const dz2=new THREE.Mesh(new THREE.CircleGeometry(1.9,10),dm); dz2.rotation.x=-Math.PI/2; dz2.position.set(dx,0.01,dz); g.add(dz2);
  });
  const wallObs=new THREE.Mesh(new THREE.BoxGeometry(15,3,0.5),new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff4400,emissiveIntensity:0.35,metalness:0.55,roughness:0.5}));
  wallObs.position.set(0,1.5,-16); g.add(wallObs);
  const floorL=new THREE.PointLight(0xffffff,1.2,42); g.add(floorL);
  scene.userData.finishZone={x:0,z:-30,radius:5.0};
  scene.userData.obstacles=[{mesh:wallObs,radius:8,type:'wall'}];
  scene.userData.movers=[
    {update(t){wallObs.position.x=Math.sin(t*0.65)*6;}},
    ...objMeshes.map((m,i)=>({update(t){m.position.y=0.65+Math.sin(t*1.5+i)*0.14; m.rotation.y+=0.008;}}))
  ];
  scene.add(g);
}

function _collectHardArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0f1015);
  scene.fog = new THREE.Fog(0x0f1015, 38, 78);
  const floorMat=new THREE.MeshStandardMaterial({color:0x1a1a20,roughness:0.7,metalness:0.4});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(108,112),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const gridMat2=new THREE.MeshStandardMaterial({color:0x222230,roughness:0.5,metalness:0.65});
  for(let x=-10;x<=10;x+=2) for(let z=-10;z<=10;z+=2){ const tile=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),gridMat2); tile.rotation.x=-Math.PI/2; tile.position.set(x*5,0.001,z*5); g.add(tile); }
  const rackMat2=new THREE.MeshStandardMaterial({color:0x2a2a3a,metalness:0.8,roughness:0.3});
  for(let row=0;row<3;row++) for(let side=0;side<2;side++){
    const rx=(side===0?-1:1)*17; const rz=-12-row*16;
    const rack=new THREE.Mesh(new THREE.BoxGeometry(1,8,11),rackMat2); rack.position.set(rx,4,rz); rack.castShadow=true; g.add(rack);
    for(let sh=1;sh<=4;sh++){ const shelf=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.12,10.8),rackMat2); shelf.position.set(rx+(side===0?2.2:-2.2),sh*1.85,rz); g.add(shelf); }
  }
  const hardObjDefs=[
    ...[0,1,2,3].map(i=>({col:0xa855f7,type:'fragile',x:-8+i*5,z:-6})),
    ...[0,1,2].map(i=>({col:0x78716c,type:'heavy',x:-4+i*5,z:-20})),
    ...[0,1,2].map(i=>({col:0xef4444,type:'hazardous',x:-4+i*5,z:-34})),
    ...[0,1,2,3,4].map(i=>({col:0x3b82f6,type:'normal',x:-8+i*4,z:-46})),
  ];
  const hardObjMeshes=hardObjDefs.map((od,i)=>{
    const geo=od.type==='fragile'?new THREE.OctahedronGeometry(0.52,1):od.type==='hazardous'?new THREE.TetrahedronGeometry(0.62,1):od.type==='heavy'?new THREE.BoxGeometry(1.1,1.1,1.1):new THREE.SphereGeometry(0.52,8,6);
    const obj=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:od.col,emissive:od.col,emissiveIntensity:od.type==='hazardous'?1.1:od.type==='fragile'?0.42:0.18,metalness:od.type==='heavy'?0.82:0.3,roughness:0.4}));
    obj.position.set(od.x||0,0.58,od.z||-6); obj.castShadow=true; g.add(obj);
    return obj;
  });
  ['#a855f7','#78716c','#ef4444','#3b82f6'].forEach((col,i)=>{
    const c=parseInt(col.slice(1),16);
    const dm=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.75,transparent:true,opacity:0.78});
    const d=new THREE.Mesh(new THREE.PlaneGeometry(8,4),dm); d.rotation.x=-Math.PI/2; d.position.set(-12+i*8,0.01,-56); g.add(d);
  });
  const barDefs=[{x:0,z:-16,w:22,speed:0.52},{x:0,z:-30,w:20,speed:0.68},{x:0,z:-44,w:18,speed:0.85}];
  const barMeshes=barDefs.map(bd=>{
    const bar=new THREE.Mesh(new THREE.BoxGeometry(bd.w,2.5,0.55),new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff2200,emissiveIntensity:0.25,metalness:0.65,roughness:0.4}));
    bar.position.set(bd.x,1.25,bd.z); bar.castShadow=true; g.add(bar); return bar;
  });
  const ambl3=new THREE.AmbientLight(0x111118,1.0); g.add(ambl3);
  const fpl2=new THREE.PointLight(0xffffff,0.9,65); g.add(fpl2);
  scene.userData.finishZone={x:0,z:-56,radius:6.0};
  scene.userData.obstacles=barMeshes.map(b=>({mesh:b,radius:11.5,type:'wall'}));
  scene.userData.movers=[
    ...barMeshes.map((b,i)=>({update(t){b.position.x=Math.sin(t*barDefs[i].speed)*9;}})),
    ...hardObjMeshes.map((m,i)=>({update(t){m.rotation.y+=0.006; m.position.y=0.58+Math.sin(t*1.2+i)*0.09;}}))
  ];
  scene.add(g);
}

function _flightRingsArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x1a6ad0);
  scene.fog = new THREE.Fog(0x5599dd, 55, 95);
  const skyMat=new THREE.MeshStandardMaterial({color:0x4488cc,roughness:1,side:THREE.BackSide,emissive:0x2244aa,emissiveIntensity:0.22});
  g.add(new THREE.Mesh(new THREE.SphereGeometry(82,16,12),skyMat));
  const groundMat=new THREE.MeshStandardMaterial({color:0x4a8a30,roughness:0.9});
  const groundM=new THREE.Mesh(new THREE.PlaneGeometry(200,200),groundMat); groundM.rotation.x=-Math.PI/2; groundM.position.y=-8; g.add(groundM);
  const cloudMat2=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.88});
  for(let i=0;i<14;i++){
    const cx=(Math.random()-0.5)*72,cy=-2+Math.random()*4,cz=(Math.random()-0.5)*72;
    [1.5,2.6,2.2,1.8].forEach((r,ci)=>{ const c=new THREE.Mesh(new THREE.SphereGeometry(r,6,5),cloudMat2); c.position.set(cx+ci*r*1.5,cy,cz); g.add(c); });
  }
  const ringDefs=[{x:0,y:3,z:-5},{x:5,y:7,z:-13},{x:-5,y:10,z:-21},{x:6,y:8,z:-29},{x:0,y:6,z:-39}];
  const ringMeshes=ringDefs.map((rd,i)=>{
    const ringMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xffaa00,emissiveIntensity:1.8,metalness:0.92,roughness:0.1});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.22,12,32),ringMat); ring.position.set(rd.x,rd.y,rd.z); ring.name=`ring_${i}`; ring.castShadow=true; g.add(ring);
    const inner=new THREE.Mesh(new THREE.CircleGeometry(2.4,16),new THREE.MeshStandardMaterial({color:0xffdd88,emissive:0xffcc44,emissiveIntensity:0.42,transparent:true,opacity:0.14,side:THREE.DoubleSide})); inner.position.copy(ring.position); g.add(inner);
    const rpl=new THREE.PointLight(0xffaa00,1.8,9); rpl.position.copy(ring.position); g.add(rpl);
    const marker=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,6),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2.5})); marker.position.set(rd.x,rd.y+2.8,rd.z); marker.name='cp'; g.add(marker);
    return ring;
  });
  const pathPts=ringDefs.map(rd=>new THREE.Vector3(rd.x,rd.y,rd.z));
  const pathLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPts),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.28})); g.add(pathLine);
  const sunDir=new THREE.DirectionalLight(0xfff8e0,1.3); sunDir.position.set(10,20,5); sunDir.castShadow=true; g.add(sunDir);
  const abl4=new THREE.AmbientLight(0xaac8ff,0.65); g.add(abl4);
  scene.userData.finishZone={x:ringDefs[4].x,z:ringDefs[4].z,radius:4.5,y3d:ringDefs[4].y};
  scene.userData.obstacles=ringMeshes.map((r,i)=>({mesh:r,radius:2.7,type:'ring_edge',check3d:true}));
  scene.userData.movers=ringMeshes.map((r,i)=>({
    update(t){ r.rotation.y+=0.008; r.position.y=ringDefs[i].y+Math.sin(t*0.85+i)*0.45; }
  }));
  scene.add(g);
}

function _flightAcroArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x0a1525);
  scene.fog = new THREE.Fog(0x0a1525, 62, 112);
  const terrMat=new THREE.MeshStandardMaterial({color:0x3a3020,roughness:0.95});
  const terrM=new THREE.Mesh(new THREE.PlaneGeometry(200,200),terrMat); terrM.rotation.x=-Math.PI/2; terrM.position.y=-15; g.add(terrM);
  const cloudMat3=new THREE.MeshStandardMaterial({color:0x8090a8,roughness:1,transparent:true,opacity:0.62});
  for(let i=0;i<18;i++){
    const cx=(Math.random()-0.5)*85,cy=8+Math.random()*13,cz=(Math.random()-0.5)*85;
    [2.5,3.6,2.9,2.1].forEach((r,ci)=>{ const c=new THREE.Mesh(new THREE.SphereGeometry(r,7,5),cloudMat3); c.position.set(cx+ci*r*1.6,cy,cz); g.add(c); });
  }
  const acroDefs=[
    {x:0,y:4,z:-5,rx:0,ry:0,rz:0,sz:3.0,col:0xef4444},{x:6,y:7,z:-13,rx:0.32,ry:0.22,rz:0,sz:2.6,col:0xf59e0b},
    {x:-5,y:11,z:-19,rx:0,ry:Math.PI/4,rz:0.42,sz:2.9,col:0x22c55e},{x:8,y:6,z:-26,rx:-0.22,ry:0,rz:0.32,sz:2.6,col:0x3b82f6},
    {x:-6,y:13,z:-33,rx:0.42,ry:Math.PI/3,rz:0,sz:3.1,col:0xa855f7},{x:4,y:9,z:-40,rx:0,ry:0,rz:-0.32,sz:2.6,col:0xec4899},
    {x:-8,y:5,z:-46,rx:0.22,ry:Math.PI/5,rz:0.22,sz:2.9,col:0x0ea5e9},{x:3,y:15,z:-52,rx:-0.32,ry:0,rz:0,sz:3.1,col:0xfbbf24},
    {x:-4,y:10,z:-58,rx:0,ry:Math.PI/6,rz:-0.32,sz:2.6,col:0xef4444},{x:0,y:12,z:-65,rx:0,ry:0,rz:0,sz:3.6,col:0x22c55e},
  ];
  const acroRings=acroDefs.map((rd,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(rd.sz,0.19,12,32),new THREE.MeshStandardMaterial({color:rd.col,emissive:rd.col,emissiveIntensity:1.9,metalness:0.82,roughness:0.2}));
    ring.position.set(rd.x,rd.y,rd.z); ring.rotation.set(rd.rx,rd.ry,rd.rz); ring.name=`acro_${i}`; g.add(ring);
    const rpl2=new THREE.PointLight(rd.col,1.35,11); rpl2.position.set(rd.x,rd.y,rd.z); g.add(rpl2);
    return ring;
  });
  const spinObs=[{x:2,y:8,z:-9},{x:-3,y:7,z:-16},{x:4,y:10,z:-22}].map((pos,i)=>{
    const obs=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.13,8,16),new THREE.MeshStandardMaterial({color:0xff4444,emissive:0xff2200,emissiveIntensity:1.8,transparent:true,opacity:0.92}));
    obs.position.set(pos.x,pos.y,pos.z); obs.name=`spin_${i}`; g.add(obs); return obs;
  });
  const dirL=new THREE.DirectionalLight(0xc0d0ff,0.85); dirL.position.set(-10,15,5); g.add(dirL);
  const abl5=new THREE.AmbientLight(0x202835,0.75); g.add(abl5);
  scene.userData.finishZone={x:acroDefs[9].x,z:acroDefs[9].z,radius:5.0};
  scene.userData.obstacles=[
    ...acroRings.map((r,i)=>({mesh:r,radius:acroDefs[i].sz+0.22,type:'ring_edge',check3d:true})),
    ...spinObs.map(m=>({mesh:m,radius:1.7,type:'spinner',check3d:true}))
  ];
  scene.userData.movers=[
    ...acroRings.map((r,i)=>({update(t){ r.rotation.y+=0.006*(i%2===0?1:-1); r.position.y=acroDefs[i].y+Math.sin(t*0.62+i)*0.55; }})),
    ...spinObs.map((m,i)=>({update(t){m.rotation.z+=0.028; m.rotation.y+=0.018;}}))
  ];
  scene.add(g);
}

function _flightSlalomArena(scene) {
  const g = new THREE.Group(); g.name = 'arena';
  scene.background = new THREE.Color(0x000008);
  scene.fog = null;
  const starGeo2=new THREE.BufferGeometry();
  const sp2=new Float32Array(3000*3); for(let i=0;i<sp2.length;i++) sp2[i]=(Math.random()-0.5)*300;
  starGeo2.setAttribute('position',new THREE.BufferAttribute(sp2,3));
  g.add(new THREE.Points(starGeo2,new THREE.PointsMaterial({color:0xffffff,size:0.28,transparent:true,opacity:0.88})));
  const slalomDefs=Array.from({length:20},(_,i)=>{
    const z=-5-i*5.8, x=Math.sin(i*0.72)*13, y=4+Math.cos(i*0.52)*6;
    const cols=[0xef4444,0x3b82f6,0x22c55e,0xfbbf24,0xa855f7,0x0ea5e9,0xff6b35,0xec4899];
    return {x,y,z,sz:2.2+Math.random()*0.85,col:cols[i%cols.length],rx:Math.random()*0.32-0.16,ry:Math.random()*0.45,rz:Math.random()*0.32-0.16};
  });
  const slalomRings=slalomDefs.map((sd,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(sd.sz,0.16,10,24),new THREE.MeshStandardMaterial({color:sd.col,emissive:sd.col,emissiveIntensity:2.8,metalness:0.9,roughness:0.1}));
    ring.position.set(sd.x,sd.y,sd.z); ring.rotation.set(sd.rx,sd.ry,sd.rz); g.add(ring);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(sd.sz+0.45,0.04,6,24),new THREE.MeshStandardMaterial({color:sd.col,emissive:sd.col,emissiveIntensity:1.1,transparent:true,opacity:0.42}));
    halo.position.copy(ring.position); halo.rotation.copy(ring.rotation); g.add(halo);
    const spl2=new THREE.PointLight(sd.col,1.7,13); spl2.position.set(sd.x,sd.y,sd.z); g.add(spl2);
    return ring;
  });
  const astObs=Array.from({length:8},(_,i)=>{
    const ao=new THREE.Mesh(new THREE.SphereGeometry(0.65+Math.random()*0.42,8,6),new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:0.95,metalness:0.15}));
    ao.position.set((Math.random()-0.5)*22,3+Math.random()*6,-16-i*13); g.add(ao); return ao;
  });
  const astOOdefs=astObs.map(ao=>({x:ao.position.x,y:ao.position.y,z:ao.position.z}));
  const nebMat2=new THREE.MeshStandardMaterial({color:0x330044,emissive:0x440066,emissiveIntensity:0.12,transparent:true,opacity:0.17,side:THREE.DoubleSide});
  [[-20,5,-52],[15,8,-74],[-10,3,-94]].forEach(([nx,ny,nz])=>{ const n=new THREE.Mesh(new THREE.SphereGeometry(19,8,6),nebMat2); n.position.set(nx,ny,nz); g.add(n); });
  const abl6=new THREE.AmbientLight(0x0a0a20,1.1); g.add(abl6);
  [0x4466ff,0xff44aa,0x44ffcc].forEach((col,i)=>{ const pl=new THREE.PointLight(col,2.2,85); pl.position.set(i*16-16,10,-52); g.add(pl); });
  scene.userData.finishZone={x:slalomDefs[19].x,z:slalomDefs[19].z,radius:5.0};
  scene.userData.obstacles=[
    ...slalomRings.map((r,i)=>({mesh:r,radius:slalomDefs[i].sz+0.22,type:'ring_edge',check3d:true})),
    ...astObs.map(m=>({mesh:m,radius:0.85,type:'asteroid',check3d:true}))
  ];
  scene.userData.movers=[
    ...slalomRings.map((r,i)=>({update(t){r.rotation.y+=0.007*(i%2===0?1:-1);}})),
    ...astObs.map((m,i)=>({update(t,dt,rs){
      m.position.x=astOOdefs[i].x+Math.cos(t*0.35+i)*4;
      // Drift toward robot's x to intercept
      if(rs){ astOOdefs[i].x+=(rs.x-astOOdefs[i].x)*0.003; }
      m.rotation.y+=0.012;
    }}))
  ];
  scene.add(g);
}

// ══════════════════════════════════════════════════════════════════════════════
// ARENA HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function _addTo(g,obj,opts={}){
  if(opts.position){const p=opts.position;obj.position.set(p.x||0,p.y||0,p.z||0);}
  if(opts.rotation){const r=opts.rotation;obj.rotation.set(r.x||0,r.y||0,r.z||0);}
  if(opts.receiveShadow!=null)obj.receiveShadow=opts.receiveShadow;
  if(opts.castShadow!=null)obj.castShadow=opts.castShadow;
  g.add(obj); return obj;
}
// ── COLLECTIBLES HELPER ──────────────────────────────────────────────────────
function _scatterCoins(g,scene,count,bounds){
  if(!scene.userData.collectibles) scene.userData.collectibles=[];
  const mat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xffaa00,emissiveIntensity:1.8,metalness:0.92,roughness:0.08});
  const gemMat=new THREE.MeshStandardMaterial({color:0x00ddff,emissive:0x0099dd,emissiveIntensity:2.0,metalness:0.8,roughness:0.1,transparent:true,opacity:0.92});
  for(let i=0;i<count;i++){
    const px=(bounds.xMin||0)+(Math.random()*((bounds.xMax||10)-(bounds.xMin||0)));
    const pz=(bounds.zMin||0)+(Math.random()*((bounds.zMax||-20)-(bounds.zMin||0)));
    const py=bounds.y!=null?bounds.y:0.45;
    const isGem=bounds.gemChance&&Math.random()<bounds.gemChance;
    const mesh=new THREE.Mesh(
      isGem?new THREE.OctahedronGeometry(0.24,1):new THREE.CylinderGeometry(0.22,0.22,0.055,8),
      isGem?gemMat:mat);
    mesh.position.set(px,py,pz);
    if(!isGem) mesh.rotation.x=Math.PI/2;
    mesh.castShadow=false; g.add(mesh);
    scene.userData.collectibles.push({mesh,pos:{x:px,y:py,z:pz},radius:0.85,type:isGem?'gem':'coin',value:isGem?20:5,collected:false});
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW ARENA BUILDERS (for 100-course catalog)
// ══════════════════════════════════════════════════════════════════════════════

function _templeExtArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x4a7a2a);
  scene.fog=new THREE.Fog(0x3a6a1a,28,60);
  const floorMat=new THREE.MeshStandardMaterial({color:0x5a7a30,roughness:0.9,metalness:0.0});
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(54,70),floorMat),{rotation:{x:-Math.PI/2,y:0,z:0},receiveShadow:true});
  // Stone path
  const stoneMat=new THREE.MeshStandardMaterial({color:0x9a8a70,roughness:0.95,metalness:0.05});
  for(let z=8;z>=-28;z-=2.5){ const s=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.12,2.2),stoneMat); s.position.set(0,0.06,z); g.add(s); }
  // Temple back wall + columns
  const templeMat=new THREE.MeshStandardMaterial({color:0xc8a870,roughness:0.85,metalness:0.1});
  const wall=new THREE.Mesh(new THREE.BoxGeometry(22,14,1.5),templeMat); wall.position.set(0,7,-33); wall.castShadow=true; g.add(wall);
  [-9,-5,0,5,9].forEach(cx=>{ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.85,14,8),templeMat); col.position.set(cx,7,-33.5); col.castShadow=true; g.add(col); });
  // Vines
  const vineMat=new THREE.MeshStandardMaterial({color:0x2a6a10,roughness:1});
  for(let i=0;i<18;i++){ const v=new THREE.Mesh(new THREE.BoxGeometry(0.12,4+Math.random()*5,0.12),vineMat); v.position.set((Math.random()-0.5)*22,3+Math.random()*3,(Math.random()-0.5)*20-5); g.add(v); }
  // Platform jumps
  [[-5,-8,0.5],[5,-12,0.5],[0,-16,0.6],[-6,-20,0.55],[6,-25,0.6]].forEach(([px,pz,ph])=>{
    const p=new THREE.Mesh(new THREE.BoxGeometry(4,ph,3.5),stoneMat); p.position.set(px,ph/2,pz); p.castShadow=true; g.add(p);
    const pl=new THREE.PointLight(0xffaa44,0.4,6); pl.position.set(px,2,pz); g.add(pl);
  });
  // Finish zone (temple gate glow)
  const finMat=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffaa00,emissiveIntensity:1.5,transparent:true,opacity:0.8});
  const fin=new THREE.Mesh(new THREE.PlaneGeometry(8,4),finMat); fin.rotation.x=-Math.PI/2; fin.position.set(0,0.02,-30); g.add(fin);
  const fpl=new THREE.PointLight(0xffd700,3.5,14); fpl.position.set(0,3,-30); g.add(fpl);
  // Ambient rolling log obstacles
  const logMat=new THREE.MeshStandardMaterial({color:0x7a5020,roughness:0.9});
  const logs=[{x:-3,z:-6,r:0.5},{x:4,z:-13,r:0.5},{x:-4,z:-20,r:0.5}];
  const logMeshes=logs.map((ld,i)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(ld.r,ld.r,4,8),logMat); m.rotation.z=Math.PI/2; m.position.set(ld.x,ld.r,ld.z); m.castShadow=true; g.add(m); return m; });
  const logObs=logMeshes.map((m,i)=>({mesh:m,radius:logs[i].r+0.3,type:'log'}));
  const dirL=new THREE.DirectionalLight(0xffe8a0,1.2); dirL.position.set(8,14,6); dirL.castShadow=true; g.add(dirL);
  g.add(new THREE.AmbientLight(0x88aa44,0.7));
  _scatterCoins(g,scene,35,{xMin:-12,xMax:12,zMin:-30,zMax:8,y:0.4,gemChance:0.12});
  scene.userData.finishZone={x:0,z:-30,radius:5.0};
  scene.userData.obstacles=logObs;
  scene.userData.movers=logMeshes.map((m,i)=>({
    update(t,dt,rs){
      m.position.x=logs[i].x+Math.sin(t*0.8+i*1.5)*5;
      m.rotation.y=t*0.5;
    }
  }));
  scene.add(g);
}

function _stoneBridgeArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x6a8aaa);
  scene.fog=new THREE.Fog(0xaabbcc,20,52);
  // Gorge floor (far below)
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a3010,roughness:1})),{position:{x:0,y:-22,z:-12},rotation:{x:-Math.PI/2,y:0,z:0}});
  // Gorge walls
  const rockMat=new THREE.MeshStandardMaterial({color:0x6a5a4a,roughness:0.95,metalness:0.05});
  [-18,18].forEach(wx=>{ const w=new THREE.Mesh(new THREE.BoxGeometry(10,50,70),rockMat); w.position.set(wx,-12,-12); g.add(w); });
  // Platform chain (start)
  const stoneMat2=new THREE.MeshStandardMaterial({color:0xa0907a,roughness:0.9});
  _addTo(g, new THREE.Mesh(new THREE.BoxGeometry(10,0.4,8),stoneMat2),{position:{x:0,y:0,z:8}});
  // Bridges — each gets narrower
  const bridgeDefs=[{w:5,z:-4},{w:3.5,z:-12},{w:2.2,z:-20},{w:1.4,z:-28}];
  bridgeDefs.forEach((bd,i)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(bd.w,0.3,8),stoneMat2); b.position.set(0,0.15,bd.z); b.castShadow=true; g.add(b); });
  // End platform
  const finPlat=new THREE.Mesh(new THREE.BoxGeometry(10,0.4,8),stoneMat2); finPlat.position.set(0,0.2,-34); g.add(finPlat);
  const finMat=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:1.2,transparent:true,opacity:0.75});
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(9,7),finMat),{position:{x:0,y:0.42,z:-34},rotation:{x:-Math.PI/2,y:0,z:0}});
  const fpl2=new THREE.PointLight(0x00ff88,3.0,14); fpl2.position.set(0,3,-34); g.add(fpl2);
  // Wind particles / mist
  const mistMat=new THREE.MeshStandardMaterial({color:0xccddee,transparent:true,opacity:0.28,roughness:1});
  for(let i=0;i<8;i++){ const m2=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2,6,5),mistMat); m2.position.set((Math.random()-0.5)*12,-2+Math.random()*4,-8-i*4); g.add(m2); }
  g.add(new THREE.DirectionalLight(0xddeeff,1.0));
  g.add(new THREE.AmbientLight(0x8899bb,0.8));
  _scatterCoins(g,scene,25,{xMin:-4,xMax:4,zMin:-36,zMax:8,y:0.6,gemChance:0.1});
  scene.userData.finishZone={x:0,z:-34,radius:5.0};
  scene.userData.obstacles=[];
  scene.userData.movers=[];
  scene.add(g);
}

function _bossArenaBuilder(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x06000e);
  scene.fog=new THREE.Fog(0x06000e,28,60);
  // Hex floor pattern
  const floorMat2=new THREE.MeshStandardMaterial({color:0x0d0815,roughness:0.4,metalness:0.7});
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(60,60),floorMat2),{rotation:{x:-Math.PI/2,y:0,z:0}});
  const hexMat=new THREE.MeshStandardMaterial({color:0x3b0060,emissive:0x6600aa,emissiveIntensity:0.45,metalness:0.8,roughness:0.2});
  for(let i=0;i<40;i++){ const a=(i/40)*Math.PI*2; const r=3+Math.floor(i/8)*3.5; const hex=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,0.05,6),hexMat); hex.position.set(Math.cos(a)*r,0.025,Math.sin(a)*r); g.add(hex); }
  // Arena walls
  const wallMat2=new THREE.MeshStandardMaterial({color:0x1a0020,metalness:0.8,roughness:0.3,emissive:0x440066,emissiveIntensity:0.18});
  for(let i=0;i<20;i++){ const a=(i/20)*Math.PI*2; const w2=new THREE.Mesh(new THREE.BoxGeometry(3.5,14,0.6),wallMat2); w2.position.set(Math.cos(a)*27,7,Math.sin(a)*27); w2.rotation.y=-a; g.add(w2); }
  // Boss entity (large sphere)
  const bossMat=new THREE.MeshStandardMaterial({color:0x440022,metalness:0.9,roughness:0.1,emissive:0xaa0044,emissiveIntensity:0.7});
  const boss=new THREE.Mesh(new THREE.SphereGeometry(2.4,14,12),bossMat); boss.position.set(0,2.4,-18); boss.castShadow=true; boss.name='boss_entity'; g.add(boss);
  const eyeMat=new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff2200,emissiveIntensity:5.5});
  const bossEye=new THREE.Mesh(new THREE.SphereGeometry(0.38,8,8),eyeMat); bossEye.position.set(0,3.1,-15.7); g.add(bossEye);
  const bossRingMat=new THREE.MeshStandardMaterial({color:0xff0044,emissive:0xff0033,emissiveIntensity:3.0});
  const bossRing=new THREE.Mesh(new THREE.TorusGeometry(4.5,0.22,8,32),bossRingMat); bossRing.rotation.x=Math.PI/2; bossRing.position.set(0,0.15,-18); bossRing.name='cp'; g.add(bossRing);
  // Lights
  const bossLight2=new THREE.PointLight(0xff0044,4.5,18); bossLight2.position.set(0,3,-18); g.add(bossLight2);
  _addTo(g, new THREE.PointLight(0x4400ff,2.0,25),{position:{x:0,y:8,z:-15}});
  _addTo(g, new THREE.PointLight(0xff4400,1.5,20),{position:{x:12,y:6,z:0}});
  g.add(new THREE.AmbientLight(0x110008,1.0));
  // Start zone
  const startMat2=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:0.8,transparent:true,opacity:0.7});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(3.5,16),startMat2),{position:{x:0,y:0.01,z:12},rotation:{x:-Math.PI/2,y:0,z:0}});
  _scatterCoins(g,scene,18,{xMin:-12,xMax:12,zMin:-15,zMax:10,y:0.4,gemChance:0.25});
  const bossObs=[{mesh:boss,radius:2.6,type:'boss'}];
  scene.userData.finishZone={x:0,z:-18,radius:4.0};
  scene.userData.obstacles=bossObs;
  scene.userData.movers=[{
    update(t,dt,rs){
      // Boss circles arena and pulses toward robot
      boss.position.x=Math.sin(t*0.45)*10;
      boss.position.z=-18+Math.cos(t*0.35)*5;
      boss.rotation.y=t*0.7;
      bossEye.position.x=boss.position.x+Math.sin(boss.rotation.y)*2.4;
      bossEye.position.z=boss.position.z+Math.cos(boss.rotation.y)*2.4;
      bossObs[0].mesh.position.x=boss.position.x;
      bossObs[0].mesh.position.z=boss.position.z;
      bossLight2.position.x=boss.position.x;
      bossLight2.position.z=boss.position.z;
      bossRing.position.x=boss.position.x;
      bossRing.position.z=boss.position.z;
      // Eye tracks robot
      if(rs){ const dx=rs.x-bossEye.position.x,dz=rs.z-bossEye.position.z; bossEye.lookAt(rs.x,rs.y+1,rs.z); }
    }
  }];
  scene.add(g);
}

function _crystalCaveArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x02000a);
  scene.fog=new THREE.Fog(0x02000a,18,48);
  // Cave floor
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(44,58),new THREE.MeshStandardMaterial({color:0x0a0818,roughness:0.9,metalness:0.2})),{rotation:{x:-Math.PI/2,y:0,z:0}});
  // Crystal formations
  const crystalColors=[0x00ddff,0xaa44ff,0xff44aa,0x44ffaa,0xffaa00];
  const crystalObs=[];
  for(let i=0;i<22;i++){
    const col=crystalColors[i%crystalColors.length];
    const cMat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.8,metalness:0.7,roughness:0.1,transparent:true,opacity:0.88});
    const h=1.5+Math.random()*2.5; const r=0.3+Math.random()*0.5;
    const crystal=new THREE.Mesh(new THREE.ConeGeometry(r,h,6),cMat);
    const px=(Math.random()-0.5)*18, pz=-4-Math.random()*28;
    crystal.position.set(px,h/2,pz); crystal.rotation.y=Math.random()*Math.PI*2; crystal.castShadow=true; g.add(crystal);
    const cpl2=new THREE.PointLight(col,0.6,5); cpl2.position.set(px,1,pz); g.add(cpl2);
    // Only make outer ring crystals into obstacles
    if(Math.abs(px)>5) crystalObs.push({mesh:crystal,radius:r+0.4,type:'crystal'});
  }
  // Stalactites (decorative)
  for(let i=0;i<15;i++){ const s=new THREE.Mesh(new THREE.ConeGeometry(0.2+Math.random()*0.3,1.5+Math.random()*2,6),new THREE.MeshStandardMaterial({color:0x1a0a2a,roughness:0.95})); s.rotation.z=Math.PI; s.position.set((Math.random()-0.5)*18,7.5,-5-Math.random()*24); g.add(s); }
  // Cave walls
  const caveMat=new THREE.MeshStandardMaterial({color:0x0a0615,roughness:0.97});
  [-20,20].forEach(wx=>{ const w3=new THREE.Mesh(new THREE.BoxGeometry(6,16,60),caveMat); w3.position.set(wx,8,-15); g.add(w3); });
  // Exit glow
  const exitMat=new THREE.MeshStandardMaterial({color:0xaaffaa,emissive:0x44ff44,emissiveIntensity:2.0,transparent:true,opacity:0.8});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(3.5,16),exitMat),{position:{x:0,y:0.02,z:-34},rotation:{x:-Math.PI/2,y:0,z:0}});
  _addTo(g, new THREE.PointLight(0x44ff88,4.0,14),{position:{x:0,y:3,z:-34}});
  g.add(new THREE.AmbientLight(0x0a0518,1.0));
  _scatterCoins(g,scene,30,{xMin:-8,xMax:8,zMin:-32,zMax:-2,y:0.4,gemChance:0.3});
  scene.userData.finishZone={x:0,z:-34,radius:4.5};
  scene.userData.obstacles=crystalObs;
  scene.userData.movers=crystalObs.map((obs,i)=>({
    update(t){ obs.mesh.rotation.y+=0.008*(i%2===0?1:-1); obs.mesh.position.y=obs.mesh.position.y+(Math.sin(t*0.9+i)*0.002); }
  }));
  scene.add(g);
}

function _jungleMazeArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x0a1808);
  scene.fog=new THREE.Fog(0x0a1808,18,44);
  // Floor
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(50,56),new THREE.MeshStandardMaterial({color:0x1a3010,roughness:0.92})),{rotation:{x:-Math.PI/2,y:0,z:0}});
  // Maze walls (hedge-like)
  const hedgeMat=new THREE.MeshStandardMaterial({color:0x1a4a08,roughness:0.98,metalness:0.0});
  const wallSegments=[
    [0,-5,14,1.5],[-7,-11,1.5,10],[7,-11,1.5,10],[-3,-15,8,1.5],[4,-19,1.5,8],
    [-6,-23,12,1.5],[2,-27,1.5,8],[-4,-31,10,1.5],[0,-35,14,1.5],
  ].map(s=>{ if(!Array.isArray(s)||s[0]===undefined) return null;
    const w4=new THREE.Mesh(new THREE.BoxGeometry(s[2],4,s[3]),hedgeMat); w4.position.set(s[0],2,s[1]); w4.castShadow=true; g.add(w4); return w4; }).filter(Boolean);
  // Jungle trees on perimeter
  const trunkM=new THREE.MeshStandardMaterial({color:0x3a1a08,roughness:0.9});
  const leafM=new THREE.MeshStandardMaterial({color:0x1a5008,roughness:0.85});
  for(let i=0;i<24;i++){ const a=(i/24)*Math.PI*2; const r=22+Math.random()*3; const h=5+Math.random()*4; const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,h,6),trunkM); trunk.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r-12); g.add(trunk); const lh2=3+Math.random()*2; const lv=new THREE.Mesh(new THREE.ConeGeometry(2.2,lh2,8),leafM); lv.position.set(Math.cos(a)*r,h+1.5,Math.sin(a)*r-12); g.add(lv); }
  // Finish zone
  const finMat3=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xffaa00,emissiveIntensity:1.5,transparent:true,opacity:0.8});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(3.5,16),finMat3),{position:{x:0,y:0.02,z:-36},rotation:{x:-Math.PI/2,y:0,z:0}});
  _addTo(g, new THREE.PointLight(0xffd700,3.5,12),{position:{x:0,y:3,z:-36}});
  g.add(new THREE.AmbientLight(0x0a1a04,1.2));
  const mazeObs=wallSegments.slice(0,4).map(w5=>({mesh:w5,radius:Math.max(w5.geometry.parameters.width,w5.geometry.parameters.depth)/2+0.3,type:'wall'}));
  _scatterCoins(g,scene,25,{xMin:-10,xMax:10,zMin:-34,zMax:-3,y:0.4,gemChance:0.2});
  scene.userData.finishZone={x:0,z:-36,radius:4.5};
  scene.userData.obstacles=mazeObs;
  scene.userData.movers=[];
  scene.add(g);
}

function _neonCityArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x03010a);
  scene.fog=new THREE.Fog(0x03010a,28,62);
  // City floor with neon grid
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(60,68),new THREE.MeshStandardMaterial({color:0x080510,roughness:0.5,metalness:0.6})),{rotation:{x:-Math.PI/2,y:0,z:0}});
  const gridM=new THREE.LineBasicMaterial({color:0x2211aa});
  for(let i=-6;i<=6;i+=2){ g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i*5,0.01,-35),new THREE.Vector3(i*5,0.01,8)]),gridM)); g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30,0.01,i*5-15),new THREE.Vector3(30,0.01,i*5-15)]),gridM)); }
  // Buildings
  const bColors=[0xaa0044,0x004488,0x008844,0x880044,0x0044aa];
  const buildings=[{x:-14,z:-8,w:7,d:7,h:18},{x:14,z:-8,w:7,d:7,h:14},{x:-14,z:-22,w:7,d:7,h:22},{x:14,z:-22,w:7,d:7,h:16},{x:-10,z:-32,w:6,d:6,h:12},{x:10,z:-32,w:6,d:6,h:20}];
  const buildObs=[];
  buildings.forEach((bd,i)=>{
    const buildMat=new THREE.MeshStandardMaterial({color:0x0a0818,roughness:0.4,metalness:0.8,emissive:bColors[i%bColors.length],emissiveIntensity:0.12});
    const build2=new THREE.Mesh(new THREE.BoxGeometry(bd.w,bd.h,bd.d),buildMat); build2.position.set(bd.x,bd.h/2,bd.z); build2.castShadow=true; g.add(build2);
    // Neon sign
    const neon2=new THREE.Mesh(new THREE.BoxGeometry(bd.w+0.1,0.1,0.1),new THREE.MeshStandardMaterial({color:bColors[i%bColors.length],emissive:bColors[i%bColors.length],emissiveIntensity:4.0})); neon2.position.set(bd.x,bd.h*0.7,bd.z+bd.d/2+0.05); g.add(neon2);
    const bpl=new THREE.PointLight(bColors[i%bColors.length],0.8,10); bpl.position.set(bd.x,bd.h*0.7,bd.z); g.add(bpl);
    buildObs.push({mesh:build2,radius:(bd.w+bd.d)/4+0.4,type:'building'});
  });
  // Flying vehicle obstacles
  const vehicleColor=[0x00ffcc,0xff00aa,0xffcc00];
  const vehicles=vehicleColor.map((col,i)=>{
    const vm=new THREE.Group();
    const body2=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.5,1.2),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.5,metalness:0.9}));
    vm.add(body2);
    const vpl=new THREE.PointLight(col,1.2,6); vm.add(vpl);
    vm.position.set((i-1)*8,2.5+i,-5-i*6); g.add(vm); return vm;
  });
  const vehicleObs=vehicles.map(v=>({mesh:v,radius:1.6,type:'vehicle'}));
  // Finish (neon portal at end of city)
  const portalMat=new THREE.MeshStandardMaterial({color:0x00ffcc,emissive:0x00ddaa,emissiveIntensity:3.5,transparent:true,opacity:0.85});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(3.5,16),portalMat),{position:{x:0,y:0.02,z:-38},rotation:{x:-Math.PI/2,y:0,z:0}});
  _addTo(g, new THREE.PointLight(0x00ffcc,4.5,14),{position:{x:0,y:3,z:-38}});
  g.add(new THREE.AmbientLight(0x050310,0.9));
  _scatterCoins(g,scene,30,{xMin:-10,xMax:10,zMin:-36,zMax:6,y:0.4,gemChance:0.2});
  const vDefs=vehicles.map((v,i)=>({startX:(i-1)*8,startZ:-5-i*6,speed:2.8+i*0.5,dir:i%2===0?1:-1}));
  scene.userData.finishZone={x:0,z:-38,radius:4.5};
  scene.userData.obstacles=[...buildObs,...vehicleObs];
  scene.userData.movers=vehicles.map((v,i)=>({
    update(t,dt,rs){
      v.position.x=vDefs[i].startX+Math.sin(t*vDefs[i].speed*0.3+i)*12*vDefs[i].dir;
      v.rotation.y=Math.atan2(Math.cos(t*vDefs[i].speed*0.3+i)*vDefs[i].dir,0.1);
      vehicleObs[i].mesh.position.x=v.position.x;
    }
  }));
  scene.add(g);
}

function _mountainFlyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x1a3a6a);
  scene.fog=new THREE.Fog(0x3a6aaa,40,90);
  // Terrain base
  const terrGeo=new THREE.PlaneGeometry(120,120,20,20);
  const tPos=terrGeo.attributes.position;
  for(let vi=0;vi<tPos.count;vi++){ const nx=tPos.getX(vi)/120,nz=tPos.getZ(vi)/120; tPos.setY(vi,Math.sin(nx*Math.PI*3)*6+Math.cos(nz*Math.PI*2)*8-8); }
  terrGeo.computeVertexNormals();
  _addTo(g, new THREE.Mesh(terrGeo,new THREE.MeshStandardMaterial({color:0x4a5a2a,roughness:0.95,metalness:0.05})),{rotation:{x:-Math.PI/2,y:0,z:0},receiveShadow:true});
  // Mountain peaks (obstacles)
  const peakMat=new THREE.MeshStandardMaterial({color:0x7a7060,roughness:0.98,metalness:0.05});
  const peakDefs=[{x:-8,z:-10,r:3,h:12},{x:9,z:-18,r:2.5,h:10},{x:-7,z:-26,r:3,h:14},{x:8,z:-34,r:2.5,h:11}];
  const peakMeshes=peakDefs.map(pd=>{ const m3=new THREE.Mesh(new THREE.ConeGeometry(pd.r,pd.h,8),peakMat); m3.position.set(pd.x,pd.h/2,pd.z); m3.castShadow=true; g.add(m3); return m3; });
  // Snow caps
  const snowMat=new THREE.MeshStandardMaterial({color:0xeef4ff,roughness:1});
  peakDefs.forEach(pd=>{ const sc=new THREE.Mesh(new THREE.ConeGeometry(pd.r*0.4,pd.h*0.2,8),snowMat); sc.position.set(pd.x,pd.h*0.85,pd.z); g.add(sc); });
  // Clouds
  const cloudMat4=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.82});
  for(let i=0;i<12;i++){ const cx=(Math.random()-0.5)*40,cy=5+Math.random()*8,cz=-6-Math.random()*32; [1.8,2.8,2.2,1.5].forEach((cr,ci)=>{ const c2=new THREE.Mesh(new THREE.SphereGeometry(cr,6,5),cloudMat4); c2.position.set(cx+ci*cr*1.5,cy,cz); g.add(c2); }); }
  // Finish peak beacon
  const beaconMat2=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffaa00,emissiveIntensity:3.5});
  _addTo(g, new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,6,6),beaconMat2),{position:{x:0,y:10,z:-44}});
  const finRing2=new THREE.Mesh(new THREE.TorusGeometry(3,0.2,8,24),beaconMat2); finRing2.rotation.x=Math.PI/2; finRing2.position.set(0,6,- 44); finRing2.name='cp'; g.add(finRing2);
  _addTo(g, new THREE.PointLight(0xffd700,4.0,16),{position:{x:0,y:8,z:-44}});
  _addTo(g, new THREE.DirectionalLight(0x88aaff,0.9),{position:{x:-8,y:16,z:4}});
  g.add(new THREE.AmbientLight(0x1a2a4a,0.8));
  _scatterCoins(g,scene,20,{xMin:-6,xMax:6,zMin:-42,zMax:0,y:4,gemChance:0.25});
  scene.userData.finishZone={x:0,z:-44,radius:5.5};
  scene.userData.obstacles=peakMeshes.map((m4,i)=>({mesh:m4,radius:peakDefs[i].r+0.3,type:'mountain',check3d:false}));
  scene.userData.movers=[];
  scene.add(g);
}

function _stormChaseArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x030508);
  scene.fog=new THREE.Fog(0x0a0f18,22,55);
  // Storm cloud base
  const stormMat=new THREE.MeshStandardMaterial({color:0x1a1a28,roughness:1,transparent:true,opacity:0.88});
  for(let i=0;i<20;i++){ const cx=(Math.random()-0.5)*40,cy=2+Math.random()*6,cz=-4-Math.random()*36; [2.5,4,3.2,2].forEach((cr2,ci)=>{ const c3=new THREE.Mesh(new THREE.SphereGeometry(cr2,7,5),stormMat); c3.position.set(cx+ci*cr2*1.4,cy,cz); g.add(c3); }); }
  // Rain particles
  const rainGeo=new THREE.BufferGeometry(); const rp=new Float32Array(800*3); for(let i=0;i<rp.length;i+=3){ rp[i]=(Math.random()-0.5)*40; rp[i+1]=Math.random()*12; rp[i+2]=-4-Math.random()*36; }
  rainGeo.setAttribute('position',new THREE.BufferAttribute(rp,3));
  g.add(new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0x8899cc,size:0.05,transparent:true,opacity:0.6})));
  // Lightning bolt obstacles (thin boxes that move)
  const boltMat=new THREE.MeshStandardMaterial({color:0xffff88,emissive:0xffff00,emissiveIntensity:4.5,transparent:true,opacity:0.92});
  const boltDefs=[{x:-8,z:-10,h:10},{x:5,z:-18,h:8},{x:-4,z:-26,h:12},{x:8,z:-32,h:9}];
  const boltMeshes=boltDefs.map(bd=>{ const b2=new THREE.Mesh(new THREE.BoxGeometry(0.15,bd.h,0.15),boltMat); b2.position.set(bd.x,bd.h/2,bd.z); g.add(b2); const bpl2=new THREE.PointLight(0xffff00,2.5,8); bpl2.position.set(bd.x,bd.h*0.4,bd.z); g.add(bpl2); return {mesh:b2,light:bpl2}; });
  // Energy orb collectibles  
  const orbMat=new THREE.MeshStandardMaterial({color:0xffff00,emissive:0xffcc00,emissiveIntensity:2.8,metalness:0.5,roughness:0.1,transparent:true,opacity:0.9});
  // Finish zone (eye of storm)
  const eyeMat2=new THREE.MeshStandardMaterial({color:0x88ffcc,emissive:0x44ddaa,emissiveIntensity:2.0,transparent:true,opacity:0.8});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(4,16),eyeMat2),{position:{x:0,y:0.02,z:-40},rotation:{x:-Math.PI/2,y:0,z:0}});
  _addTo(g, new THREE.PointLight(0x44ffcc,4.5,16),{position:{x:0,y:3,z:-40}});
  g.add(new THREE.AmbientLight(0x040508,0.9));
  const boltObs=boltMeshes.map(b3=>({mesh:b3.mesh,radius:0.4,type:'lightning'}));
  _scatterCoins(g,scene,22,{xMin:-12,xMax:12,zMin:-38,zMax:-2,y:0.5,gemChance:0.35});
  scene.userData.finishZone={x:0,z:-40,radius:5.0};
  scene.userData.obstacles=boltObs;
  scene.userData.movers=boltMeshes.map((b4,i)=>({
    update(t,dt,rs){
      // Bolts flash — suddenly appear in new position
      const vis=Math.sin(t*4+i*2.2)>0.3;
      b4.mesh.visible=vis; b4.light.visible=vis;
      if(vis){ b4.mesh.position.x=boltDefs[i].x+Math.sin(t*1.2+i)*4; boltObs[i].mesh.position.x=b4.mesh.position.x; }
      else { boltObs[i].mesh.position.x=9999; } // hide collision when invisible
    }
  }));
  scene.add(g);
}

function _combatZoneArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=new THREE.Color(0x0d1008);
  scene.fog=new THREE.Fog(0x0d1008,30,65);
  // Battlefield floor
  _addTo(g, new THREE.Mesh(new THREE.PlaneGeometry(72,76),new THREE.MeshStandardMaterial({color:0x1a1e10,roughness:0.92,metalness:0.05})),{rotation:{x:-Math.PI/2,y:0,z:0},receiveShadow:true});
  // Cover objects (walls, crates)
  const crateColor=0x4a3a2a; const crateMat=new THREE.MeshStandardMaterial({color:crateColor,roughness:0.9,metalness:0.15});
  const barricadeMat=new THREE.MeshStandardMaterial({color:0x5a4a2a,roughness:0.88,metalness:0.2,emissive:0x221108,emissiveIntensity:0.3});
  const coverDefs=[[-8,-6,2.5,2.5,1.5],[8,-6,2.5,2.5,1.5],[-5,-14,4,1.5,1.2],[5,-14,4,1.5,1.2],[-9,-22,2,2,1.5],[9,-22,2,2,1.5],[-4,-30,5,1.5,1.0],[4,-30,5,1.5,1.0]];
  const coverMeshes=coverDefs.map(cd=>{ const cv=new THREE.Mesh(new THREE.BoxGeometry(cd[2],cd[4],cd[3]),cd[2]>3?barricadeMat:crateMat); cv.position.set(cd[0],cd[4]/2,cd[1]); cv.castShadow=true; g.add(cv); return cv; });
  // Burning barrels
  const fireMat=new THREE.MeshStandardMaterial({color:0xff6600,emissive:0xff4400,emissiveIntensity:3.5});
  [[-11,-10],[12,-18],[-10,-28],[11,-8]].forEach(([bx,bz])=>{ const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,1.2,8),new THREE.MeshStandardMaterial({color:0x4a4440,metalness:0.7})); bar.position.set(bx,0.6,bz); g.add(bar); const flame2=new THREE.Mesh(new THREE.SphereGeometry(0.5,6,6),fireMat); flame2.position.set(bx,1.6,bz); flame2.name='cp'; g.add(flame2); _addTo(g, new THREE.PointLight(0xff6600,1.8,9),{position:{x:bx,y:2,z:bz}}); });
  // Enemy indicator beacons (not real enemies — visual only since enemies = movers)
  const enemyMat=new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff1100,emissiveIntensity:1.8,metalness:0.7,roughness:0.3});
  const enemyDefs=[{x:-6,z:-10},{x:7,z:-18},{x:-7,z:-26},{x:5,z:-32}];
  const enemyMeshes=enemyDefs.map((ed,i)=>{ const em=new THREE.Group(); const body3=new THREE.Mesh(new THREE.SphereGeometry(0.55,10,8),enemyMat); em.add(body3); const eye2=new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6),new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:5})); eye2.position.z=0.5; em.add(eye2); em.position.set(ed.x,0.55,ed.z); g.add(em); return em; });
  const enemyObs=enemyMeshes.map(em=>({mesh:em,radius:0.75,type:'enemy'}));
  // Finish safe zone
  const safeFin2=new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:1.5,transparent:true,opacity:0.8});
  _addTo(g, new THREE.Mesh(new THREE.CircleGeometry(4,16),safeFin2),{position:{x:0,y:0.02,z:-40},rotation:{x:-Math.PI/2,y:0,z:0}});
  _addTo(g, new THREE.PointLight(0x00ff88,4.0,14),{position:{x:0,y:3,z:-40}});
  _addTo(g, new THREE.DirectionalLight(0xaabb88,0.8),{position:{x:5,y:12,z:4},castShadow:true});
  g.add(new THREE.AmbientLight(0x0a0e08,1.0));
  _scatterCoins(g,scene,28,{xMin:-12,xMax:12,zMin:-38,zMax:6,y:0.4,gemChance:0.18});
  const coverObs=coverMeshes.map((cv2,i)=>({mesh:cv2,radius:Math.max(coverDefs[i][2],coverDefs[i][3])/2+0.3,type:'cover'}));
  scene.userData.finishZone={x:0,z:-40,radius:5.0};
  scene.userData.obstacles=[...coverObs,...enemyObs];
  scene.userData.movers=enemyMeshes.map((em,i)=>({
    update(t,dt,rs){
      if(!rs){ const r2=5+Math.sin(t*0.2+i)*3; const spd2=0.3+i*0.08; em.position.x=enemyDefs[i].x+Math.cos(t*spd2+i)*r2; em.position.z=enemyDefs[i].z+Math.sin(t*spd2*0.75+i)*r2; return; }
      const dx=rs.x-em.position.x, dz=rs.z-em.position.z;
      const dist2=Math.sqrt(dx*dx+dz*dz);
      if(dist2>0.7){ em.position.x+=(dx/dist2)*(1.2+i*0.15)*dt; em.position.z+=(dz/dist2)*(1.2+i*0.15)*dt; }
      em.rotation.y=Math.atan2(dx,dz);
      em.position.y=0.55+Math.sin(t*3+i)*0.1;
    }
  }));
  scene.add(g);
}

// ── helper: paint canvas sky gradient ────────────────────────────────────────
function _makeSkyTex(stops){
  const c=document.createElement('canvas'); c.width=512; c.height=512;
  const ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,512);
  stops.forEach(([pos,col])=>g.addColorStop(pos,col));
  ctx.fillStyle=g; ctx.fillRect(0,0,512,512);
  const t=new THREE.CanvasTexture(c);
  t.mapping=THREE.EquirectangularReflectionMapping;
  return t;
}

// ── ROVER TRANSIT ─────────────────────────────────────────────────────────────
function _roverTransitArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#000814'],[0.5,'#000d2a'],[1,'#001040']]);
  scene.fog=new THREE.FogExp2(0x000814,0.018);
  // Tunnel floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,80),new THREE.MeshStandardMaterial({color:0x0a0a1a,roughness:0.7,metalness:0.3}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Tunnel walls & ceiling
  const wallMat=new THREE.MeshStandardMaterial({color:0x0d1a2e,roughness:0.8,metalness:0.4});
  [-6,6].forEach(x=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(0.5,6,80),wallMat);
    wall.position.set(x,3,0); g.add(wall);
  });
  const ceil=new THREE.Mesh(new THREE.BoxGeometry(14,0.4,80),wallMat);
  ceil.position.set(0,6.2,0); g.add(ceil);
  // Cyan track line
  const trackMat=new THREE.MeshBasicMaterial({color:0x00e5ff});
  const track=new THREE.Mesh(new THREE.PlaneGeometry(0.3,78),trackMat);
  track.rotation.x=-Math.PI/2; track.position.set(0,0.02,-2); g.add(track);
  // Track dashes
  for(let i=0;i<20;i++){
    const dash=new THREE.Mesh(new THREE.PlaneGeometry(0.12,1.5),new THREE.MeshBasicMaterial({color:0x00aaff,transparent:true,opacity:0.6}));
    dash.rotation.x=-Math.PI/2; dash.position.set(-2,0.02,-35+i*3.5); g.add(dash);
    const dash2=dash.clone(); dash2.position.x=2; g.add(dash2);
  }
  // Neon strip lights on walls
  for(let i=0;i<12;i++){
    const strip=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,2.5),new THREE.MeshBasicMaterial({color:0x00e5ff}));
    strip.position.set(-5.7,4.5,-35+i*6); g.add(strip);
    const strip2=strip.clone(); strip2.position.x=5.7; g.add(strip2);
    _addPl(scene,0x00e5ff,0.5,10,-5,4.5,-35+i*6);
  }
  // Gate arches
  for(let i=0;i<5;i++){
    const arch=new THREE.Mesh(new THREE.TorusGeometry(4,0.15,8,24,Math.PI),new THREE.MeshBasicMaterial({color:0x0044ff}));
    arch.rotation.x=Math.PI/2; arch.position.set(0,4,-10-i*12); g.add(arch);
    _addPl(scene,0x0044ff,0.4,8,0,4,-10-i*12);
  }
  scene.add(new THREE.AmbientLight(0x001133,0.5));
  _addPl(scene,0x00e5ff,1.2,40,0,5,5);
  scene.add(g);
}

// ── ROVER DELIVERY ────────────────────────────────────────────────────────────
function _roverDeliveryArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#87ceeb'],[0.5,'#b0d8f0'],[1,'#e8f4f8']]);
  scene.fog=new THREE.Fog(0xd0e8f4,30,60);
  // Road surface
  const road=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x333340,roughness:0.9}));
  road.rotation.x=-Math.PI/2; road.receiveShadow=true; g.add(road);
  // Road markings grid
  const lineMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.8});
  [-12,0,12].forEach(z=>{
    const line=new THREE.Mesh(new THREE.PlaneGeometry(60,0.25),lineMat);
    line.rotation.x=-Math.PI/2; line.position.set(0,0.01,z); g.add(line);
  });
  [-12,0,12].forEach(x=>{
    const line=new THREE.Mesh(new THREE.PlaneGeometry(0.25,60),lineMat);
    line.rotation.x=-Math.PI/2; line.position.set(x,0.01,0); g.add(line);
  });
  // City buildings
  const bldMats=[0x445566,0x334455,0x556677,0x223344].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:0.7}));
  [[-18,8,8],[-18,12,-8],[-18,6,-18],[18,10,8],[18,14,-6],[18,8,-18],[8,7,-22],[-8,9,-22]].forEach(([x,h,z],i)=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(5,h,5),bldMats[i%4]);
    b.position.set(x,h/2,z); b.castShadow=true; g.add(b);
    // Windows
    for(let w=0;w<3;w++) for(let f=0;f<Math.floor(h/2);f++){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.8),new THREE.MeshBasicMaterial({color:0xffee88,transparent:true,opacity:Math.random()>0.4?0.9:0.1}));
      win.position.set(x+2.51,1+f*2.2,z-1+w*1.2); g.add(win);
    }
  });
  // Traffic lights
  [[-6,0,0],[6,0,0],[0,0,-6]].forEach(([x,,z])=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,4,8),new THREE.MeshStandardMaterial({color:0x333333}));
    pole.position.set(x,2,z); g.add(pole);
    const box=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.1,0.4),new THREE.MeshStandardMaterial({color:0x111111}));
    box.position.set(x,4.1,z); g.add(box);
    const light=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,8),new THREE.MeshBasicMaterial({color:0x22ff22}));
    light.position.set(x,4.4,z+0.21); g.add(light);
    _addPl(scene,0x22ff22,0.5,4,x,4.4,z);
  });
  // Delivery pads
  [[4,0,4],[-4,0,-10],[8,0,-16]].forEach(([x,,z])=>{
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.08,16),new THREE.MeshBasicMaterial({color:0x22c55e}));
    pad.position.set(x,0.01,z); g.add(pad);
    _addPl(scene,0x22c55e,0.6,5,x,0.5,z);
  });
  scene.add(new THREE.AmbientLight(0xc0d8f0,0.8));
  _addDl(scene,0xfff8e0,1.2,10,20,8,true);
  scene.add(g);
}

// ── ROVER SURVEY ──────────────────────────────────────────────────────────────
function _roverSurveyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#87ceeb'],[0.6,'#c8e8f8'],[1,'#f0f8ff']]);
  scene.fog=new THREE.Fog(0xd8eef8,35,65);
  // Open terrain
  const terrain=new THREE.Mesh(new THREE.PlaneGeometry(60,60,16,16),new THREE.MeshStandardMaterial({color:0xb8a875,roughness:1}));
  terrain.rotation.x=-Math.PI/2; terrain.receiveShadow=true; g.add(terrain);
  // Scattered rocks
  const rockMat=new THREE.MeshStandardMaterial({color:0x7a6848,roughness:1});
  [[-8,6],[4,-10],[-14,2],[10,14],[-4,-18],[16,-4]].forEach(([x,z])=>{
    const r=new THREE.Mesh(new THREE.DodecahedronGeometry(0.7+Math.random()*0.5,0),rockMat);
    r.position.set(x,0.3,z); r.rotation.set(Math.random(),Math.random(),Math.random()); r.castShadow=true; g.add(r);
  });
  // Survey beacon poles
  [[-12,0,-8],[0,0,-14],[12,0,-8],[18,0,4],[-18,0,4],[0,0,14]].forEach(([x,,z],i)=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.8,8),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.3}));
    pole.position.set(x,0.9,z); g.add(pole);
    const beacon=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,10),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.9}));
    beacon.position.set(x,1.9,z); g.add(beacon);
    _addPl(scene,0xfbbf24,0.7,6,x,2,z);
  });
  // Satellite dish (decorative)
  const dish=new THREE.Mesh(new THREE.SphereGeometry(1.2,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xd0d0d0,metalness:0.6,roughness:0.3}));
  dish.rotation.x=-Math.PI/2; dish.position.set(-20,1.2,-20); g.add(dish);
  scene.add(new THREE.AmbientLight(0xffe8a0,1.0));
  _addDl(scene,0xfff3c0,1.4,12,22,8,true);
  scene.add(g);
}

// ── SPIDER PIPELINE ───────────────────────────────────────────────────────────
function _spiderPipelineArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#080808'],[0.5,'#0f1a0f'],[1,'#040808']]);
  scene.fog=new THREE.FogExp2(0x050c05,0.03);
  // Interior pipe walls — large cylinder as tube interior
  const pipeMat=new THREE.MeshStandardMaterial({color:0x1a2a18,roughness:0.6,metalness:0.5,side:THREE.BackSide});
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(5,5,80,24),pipeMat);
  pipe.rotation.z=Math.PI/2; pipe.position.set(-20,3,0); g.add(pipe);
  // Pipe floor (flat walk surface)
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,10),new THREE.MeshStandardMaterial({color:0x0d170d,roughness:0.9,metalness:0.3}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-1.8; floor.receiveShadow=true; g.add(floor);
  // Pipe ribs (structural rings)
  for(let i=0;i<10;i++){
    const rib=new THREE.Mesh(new THREE.TorusGeometry(4.8,0.2,8,24),new THREE.MeshStandardMaterial({color:0x2d4a2d,metalness:0.7,roughness:0.4}));
    rib.rotation.y=Math.PI/2; rib.position.set(-40+i*8,3,0); g.add(rib);
  }
  // Fault markers (red X-marks on wall)
  [[0,2,-4],[16,4,3],[32,1,-3],[-16,3,4]].forEach(([x,y,z])=>{
    const fault=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.1),new THREE.MeshBasicMaterial({color:0xff2200}));
    fault.position.set(x,y+3,z); fault.lookAt(new THREE.Vector3(x,y+3,0)); g.add(fault);
    _addPl(scene,0xff2200,0.8,5,x,y+3,z);
  });
  // Pipe status lights (green strips)
  for(let i=0;i<8;i++){
    const strip=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,1.5),new THREE.MeshBasicMaterial({color:0x00ff44}));
    strip.position.set(-36+i*9,7,0); g.add(strip);
    _addPl(scene,0x00aa33,0.4,8,-36+i*9,7,0);
  }
  scene.add(new THREE.AmbientLight(0x0a1a0a,0.4));
  _addPl(scene,0x00ff44,0.8,30,0,5,0);
  scene.add(g);
}

// ── SPIDER RUINS ──────────────────────────────────────────────────────────────
function _spiderRuinsArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#1a0f05'],[0.4,'#2d1a08'],[0.7,'#3d2510'],[1,'#1a0f05']]);
  scene.fog=new THREE.FogExp2(0x1a0e05,0.024);
  // Cracked stone floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({color:0x5a4530,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Fallen pillars
  const pillarMat=new THREE.MeshStandardMaterial({color:0x6b5040,roughness:0.95});
  [[-6,0,0,-2,3],[-2,0,4,0,4],[4,0,-2,1,3],[8,0,6,2,3],[-10,0,8,-1,4],[2,0,12,0,3]].forEach(([x,,z,ry,h])=>{
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.65,h,10),pillarMat);
    p.rotation.z=0.4+ry*0.2; p.position.set(x,h*0.3,z); p.castShadow=true; g.add(p);
    // debris chunks
    const d=new THREE.Mesh(new THREE.DodecahedronGeometry(0.4,0),new THREE.MeshStandardMaterial({color:0x4a3820,roughness:1}));
    d.position.set(x+0.5,0.2,z+0.3); g.add(d);
  });
  // Standing walls
  [[-14,1.5,0,0.8,3,6],[14,1.5,0,0.8,3,6],[0,1.5,-14,6,3,0.8]].forEach(([x,y,z,w,h,d])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),pillarMat);
    wall.position.set(x,y,z); wall.castShadow=true; g.add(wall);
  });
  // Torches
  [[-12,2.5,0],[12,2.5,0],[0,2.5,-12],[0,2.5,12]].forEach(([x,y,z])=>{
    const flame=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,8),new THREE.MeshBasicMaterial({color:0xff8830}));
    flame.position.set(x,y+0.4,z); g.add(flame);
    _addPl(scene,0xff6620,1.2,12,x,y+0.6,z);
  });
  // Web strands
  for(let i=0;i<5;i++){
    const web=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,7,4),new THREE.MeshBasicMaterial({color:0xe8e8e8,transparent:true,opacity:0.45}));
    web.position.set(Math.cos(i*1.26)*8,3.5,Math.sin(i*1.26)*8); web.rotation.z=0.3+i*0.1; g.add(web);
  }
  scene.add(new THREE.AmbientLight(0x3a2010,0.5));
  _addDl(scene,0x7a5530,0.3,0,10,5,false);
  scene.add(g);
}

// ── SPIDER RESCUE ─────────────────────────────────────────────────────────────
function _spiderRescueArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#111827'],[0.5,'#1f2937'],[1,'#111827']]);
  scene.fog=new THREE.FogExp2(0x111827,0.025);
  // Urban rubble floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x374151,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Collapsed building slabs
  const concMat=new THREE.MeshStandardMaterial({color:0x4b5563,roughness:0.95});
  [[-8,1.5,-6,3,3,2.5],[ 6,2,2,3.5,4,2.5],[-4,1,8,2.5,2,2.5],[10,1.5,-10,3,3,2.5],[-12,2.5,4,3,5,2.5]].forEach(([x,y,z,w,h,d])=>{
    const slab=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),concMat);
    slab.position.set(x,y/2,z); slab.castShadow=true; g.add(slab);
  });
  // Rebar sticking out
  [[0,1,-6],[6,3,0],[-8,2,8]].forEach(([x,y,z])=>{
    const rebar=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.5,6),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.8}));
    rebar.position.set(x,y,z); rebar.rotation.z=0.4; g.add(rebar);
  });
  // Survivor beacons (orange glow)
  [[-6,0.1,4],[4,0.1,-8],[0,0.1,14]].forEach(([x,y,z])=>{
    const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.12,16),new THREE.MeshBasicMaterial({color:0xff4400}));
    beacon.position.set(x,y,z); g.add(beacon);
    _addPl(scene,0xff4400,1.5,7,x,y+0.5,z);
  });
  // Emergency rotating lights
  _addPl(scene,0x0044ff,2.0,22,-10,8,0);
  _addPl(scene,0xff0000,2.0,22,10,8,0);
  scene.add(new THREE.AmbientLight(0x334455,0.4));
  _addDl(scene,0x6688aa,0.3,0,12,0,false);
  scene.add(g);
}

// ── DRONE CANYON ──────────────────────────────────────────────────────────────
function _droneCanyonArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#e8a060'],[0.4,'#d4784a'],[0.7,'#7a3820'],[1,'#3d1a08']]);
  scene.fog=new THREE.Fog(0xe8a060,30,65);
  // Canyon floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,80),new THREE.MeshStandardMaterial({color:0xb8622a,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-8; floor.receiveShadow=true; g.add(floor);
  // Canyon walls — left and right cliff faces
  const cliffMat=new THREE.MeshStandardMaterial({color:0xc8722e,roughness:0.95});
  const cliffMat2=new THREE.MeshStandardMaterial({color:0xa85828,roughness:0.95});
  // Left cliff
  for(let i=0;i<8;i++){
    const h=10+Math.random()*6; const w=6+Math.random()*3;
    const cliff=new THREE.Mesh(new THREE.BoxGeometry(w,h,9),i%2===0?cliffMat:cliffMat2);
    cliff.position.set(-12-Math.random()*3,h/2-8,-32+i*9); cliff.castShadow=true; g.add(cliff);
  }
  // Right cliff
  for(let i=0;i<8;i++){
    const h=10+Math.random()*6; const w=6+Math.random()*3;
    const cliff=new THREE.Mesh(new THREE.BoxGeometry(w,h,9),i%2===0?cliffMat:cliffMat2);
    cliff.position.set(12+Math.random()*3,h/2-8,-32+i*9); cliff.castShadow=true; g.add(cliff);
  }
  // Arch bridge spanning canyon
  const archMat=new THREE.MeshStandardMaterial({color:0x8b4220,roughness:0.9});
  const arch=new THREE.Mesh(new THREE.TorusGeometry(7,0.8,8,24,Math.PI),archMat);
  arch.rotation.x=Math.PI/2; arch.position.set(0,4,-10); g.add(arch);
  // Checkpoint rings (glowing orange)
  [-24,-12,0,12,24].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4,0.18,10,32),new THREE.MeshBasicMaterial({color:0xff7820}));
    ring.position.set(0,2,z); g.add(ring);
    _addPl(scene,0xff7820,0.7,10,0,2,z);
  });
  scene.add(new THREE.AmbientLight(0xe08040,0.9));
  _addDl(scene,0xffb060,1.2,15,20,10,true);
  scene.add(g);
}

// ── DRONE ROOFTOP ─────────────────────────────────────────────────────────────
function _droneRooftopArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#1a2a4a'],[0.4,'#2d4a7a'],[0.7,'#4a70aa'],[1,'#87ceeb']]);
  scene.fog=new THREE.Fog(0x2d4a7a,30,70);
  // Rooftop platforms
  const roofMat=new THREE.MeshStandardMaterial({color:0x7a8799,roughness:0.7,metalness:0.2});
  [[0,0,0,8,0.4,8],[12,2,0,6,0.4,6],[-12,1,4,5,0.4,5],[0,4,-14,7,0.4,7],[16,3,-12,5,0.4,5],[-8,5,-18,4,0.4,4]].forEach(([x,y,z,w,h,d])=>{
    const roof=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),roofMat);
    roof.position.set(x,y,z); roof.castShadow=true; roof.receiveShadow=true; g.add(roof);
    // HVAC unit
    const hvac=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,1),new THREE.MeshStandardMaterial({color:0x556677,metalness:0.5}));
    hvac.position.set(x+w/2-1,y+0.6,z); g.add(hvac);
  });
  // Background city buildings
  [[-30,-20,-10,10,20,30].map((x,i)=>{
    const h=12+i*4;
    const bld=new THREE.Mesh(new THREE.BoxGeometry(4,h,4),new THREE.MeshStandardMaterial({color:0x223344}));
    bld.position.set(x,-5+Math.random()*2,-28); g.add(bld);
    // Window lights
    for(let w=0;w<2;w++) for(let f=0;f<h/2;f++){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.7),new THREE.MeshBasicMaterial({color:0xffee44,transparent:true,opacity:Math.random()>0.5?0.8:0.05}));
      win.position.set(x+2.01,-5+1+f*2.2,-28+w*0.01); g.add(win);
    }
  })];
  // Delivery pad targets
  [[12,2.4,0],[0,4.4,-14],[-8,5.4,-18]].forEach(([x,y,z])=>{
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.1,16),new THREE.MeshBasicMaterial({color:0x38bdf8}));
    pad.position.set(x,y,z); g.add(pad);
    _addPl(scene,0x38bdf8,0.8,6,x,y+0.5,z);
  });
  scene.add(new THREE.AmbientLight(0x304060,0.8));
  _addDl(scene,0xfff8e0,0.9,20,30,10,true);
  _addPl(scene,0xffa020,0.6,50,0,20,0);
  scene.add(g);
}

// ── DRONE SURVEY ──────────────────────────────────────────────────────────────
function _droneSurveyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#87ceeb'],[0.5,'#b8e0f4'],[1,'#e8f8ff']]);
  scene.fog=new THREE.Fog(0xc8eaf8,40,75);
  // Green countryside below
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0x4a7c3f,roughness:0.9}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-2; ground.receiveShadow=true; g.add(ground);
  // Crop fields
  [[- 25,0.01,-25,'#d4a853'],[25,0.01,-25,'#8bc34a'],[-25,0.01,25,'#c8862e'],[25,0.01,25,'#6aaa40']].forEach(([x,y,z,col])=>{
    const field=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({color:new THREE.Color(col)}));
    field.rotation.x=-Math.PI/2; field.position.set(x,y-2,z); g.add(field);
  });
  // Trees
  [[-8,2,8],[4,2,12],[-14,2,4],[10,2,-6],[-4,2,-10],[14,2,8]].forEach(([x,y,z])=>{
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,2.8,7),new THREE.MeshStandardMaterial({color:0x5c3a1e}));
    trunk.position.set(x,y-0.6,z); g.add(trunk);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(1.3,2.8,8),new THREE.MeshStandardMaterial({color:0x2d6a1a,roughness:0.9}));
    crown.position.set(x,y+2.2,z); g.add(crown);
  });
  // Survey waypoints (photo targets)
  [[-16,5,-16],[0,6,-16],[16,5,-16],[-16,7,0],[0,8,0],[16,7,0],[-16,5,16],[0,6,16],[16,5,16]].forEach(([x,y,z],i)=>{
    const marker=new THREE.Mesh(new THREE.OctahedronGeometry(0.35,0),new THREE.MeshBasicMaterial({color:0x22c55e}));
    marker.position.set(x,y,z); g.add(marker);
    _addPl(scene,0x22c55e,0.6,6,x,y,z);
  });
  scene.add(new THREE.AmbientLight(0xd0f0a0,1.2));
  _addDl(scene,0xfffbe0,1.1,15,25,10,true);
  scene.add(g);
}

// ── TANK DEMOLITION ───────────────────────────────────────────────────────────
function _tankDemolitionArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#7a6050'],[0.5,'#a07860'],[1,'#c09070']]);
  scene.fog=new THREE.Fog(0xa07860,25,55);
  // Dusty yard floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x7a6040,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Debris blocks to push
  const dMats=[0x8b7355,0x7a6040,0x6b5535,0x5c4430].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:0.95}));
  [[-6,0,0],[4,0,4],[-3,0,-5],[7,0,-8],[-8,0,8],[2,0,-12],[5,0,10],[-5,0,-10]].forEach(([x,,z],i)=>{
    const size=1.2+Math.random()*0.8;
    const debris=new THREE.Mesh(new THREE.BoxGeometry(size,size,size),dMats[i%4]);
    debris.position.set(x,size/2,z); debris.rotation.y=Math.random()*Math.PI; debris.castShadow=true; g.add(debris);
  });
  // Dump zones (marked squares)
  [[14,0,0],[14,0,10],[-14,0,0]].forEach(([x,,z])=>{
    const zone=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({color:0xff6620,transparent:true,opacity:0.35}));
    zone.rotation.x=-Math.PI/2; zone.position.set(x,0.01,z); g.add(zone);
    // Zone border
    const border=new THREE.Mesh(new THREE.PlaneGeometry(5.1,5.1),new THREE.MeshBasicMaterial({color:0xff6620,wireframe:true}));
    border.rotation.x=-Math.PI/2; border.position.set(x,0.02,z); g.add(border);
    _addPl(scene,0xff6620,0.6,8,x,1,z);
  });
  // Cranes / scaffolding in background
  [[18,4,0],[-18,4,10]].forEach(([x,h,z])=>{
    const crane=new THREE.Mesh(new THREE.BoxGeometry(0.4,h,0.4),new THREE.MeshStandardMaterial({color:0xf59e0b,metalness:0.5}));
    crane.position.set(x,h/2,z); g.add(crane);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(5,0.4,0.4),new THREE.MeshStandardMaterial({color:0xf59e0b,metalness:0.5}));
    arm.position.set(x-2.5,h,z); g.add(arm);
  });
  scene.add(new THREE.AmbientLight(0xc0a060,0.9));
  _addDl(scene,0xffe0a0,1.0,10,18,8,true);
  scene.add(g);
}

// ── TANK MOUNTAIN ─────────────────────────────────────────────────────────────
function _tankMountainArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#87a0b8'],[0.5,'#aabccc'],[1,'#d8e8f0']]);
  scene.fog=new THREE.Fog(0xaabccc,25,55);
  // Rocky base
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x6e5c4a,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Switchback ramps
  const rampMat=new THREE.MeshStandardMaterial({color:0x7a6248,roughness:0.95});
  [[0,0.5,5,20,1,4],[- 7,1.5,-2,4,1,12],[5,2.5,-8,14,1,4],[-4,3.5,-14,4,1,10],[4,4.5,-18,10,1,4]].forEach(([x,y,z,w,h,d])=>{
    const ramp=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),rampMat);
    ramp.position.set(x,y,z); ramp.castShadow=true; ramp.receiveShadow=true; g.add(ramp);
  });
  // Boulders
  const boulderMat=new THREE.MeshStandardMaterial({color:0x5a4835,roughness:1});
  [[-4,1.5,2],[3,2.5,-5],[-2,3.5,-11],[6,4.5,-16],[- 3,5.5,-19]].forEach(([x,y,z])=>{
    const b=new THREE.Mesh(new THREE.DodecahedronGeometry(0.7+Math.random()*0.4,0),boulderMat);
    b.position.set(x,y,z); b.rotation.set(Math.random(),Math.random(),0); b.castShadow=true; g.add(b);
  });
  // Summit — relay station
  const station=new THREE.Mesh(new THREE.BoxGeometry(3,2,3),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.5}));
  station.position.set(4,6,-18); g.add(station);
  // Flag
  const flagpole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3,8),new THREE.MeshStandardMaterial({color:0xaaaaaa}));
  flagpole.position.set(4,8.5,-18); g.add(flagpole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.9),new THREE.MeshBasicMaterial({color:0xef4444,side:THREE.DoubleSide}));
  flag.position.set(4.75,9.5,-18); g.add(flag);
  _addPl(scene,0xef4444,0.8,6,4,9,-18);
  scene.add(new THREE.AmbientLight(0xb0c0d0,0.9));
  _addDl(scene,0xfff0d0,1.0,10,20,5,true);
  scene.add(g);
}

// ── HUMAN ASSEMBLY ────────────────────────────────────────────────────────────
function _humanAssemblyArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#0f1923'],[0.5,'#1a2d3a'],[1,'#0f1923']]);
  scene.fog=new THREE.Fog(0x1a2d3a,25,50);
  // Factory floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0xe2e8f0,roughness:0.6}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Floor grid lines
  for(let i=-4;i<=4;i++){
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(40,0.05),new THREE.MeshBasicMaterial({color:0xcccccc}));
    gl.rotation.x=-Math.PI/2; gl.position.set(0,0.01,i*2); g.add(gl);
    const gl2=new THREE.Mesh(new THREE.PlaneGeometry(0.05,40),new THREE.MeshBasicMaterial({color:0xcccccc}));
    gl2.rotation.x=-Math.PI/2; gl2.position.set(i*2,0.01,0); g.add(gl2);
  }
  // Conveyor belt
  const beltMat=new THREE.MeshStandardMaterial({color:0x1f2937,metalness:0.3});
  const belt=new THREE.Mesh(new THREE.BoxGeometry(18,0.25,2.2),beltMat);
  belt.position.set(0,0.62,0); belt.castShadow=true; g.add(belt);
  const beltSurface=new THREE.Mesh(new THREE.BoxGeometry(17.8,0.06,2),new THREE.MeshStandardMaterial({color:0x374151}));
  beltSurface.position.set(0,0.76,0); g.add(beltSurface);
  // Parts on belt
  const partCols=[0xff4444,0x4444ff,0x44ff44,0xffaa00];
  [-6,-3,0,3,6].forEach((x,i)=>{
    const part=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),new THREE.MeshStandardMaterial({color:partCols[i%4],emissive:partCols[i%4],emissiveIntensity:0.15}));
    part.position.set(x,1.05,0); g.add(part);
  });
  // Assembly stations
  [[-6,0,4],[0,0,4],[6,0,4]].forEach(([x,,z],i)=>{
    const table=new THREE.Mesh(new THREE.BoxGeometry(2.5,1,1.5),new THREE.MeshStandardMaterial({color:0x475569,metalness:0.4}));
    table.position.set(x,0.5,z); table.castShadow=true; g.add(table);
    const indicator=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.05,0.1),new THREE.MeshBasicMaterial({color:partCols[i]}));
    indicator.position.set(x,1.03,z-0.8); g.add(indicator);
    _addPl(scene,partCols[i],0.4,5,x,1.5,z);
  });
  // Overhead factory lights
  [[-8,5,0],[0,5,0],[8,5,0]].forEach(([x,y,z])=>{
    const fixture=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.2,0.4),new THREE.MeshStandardMaterial({color:0x888888}));
    fixture.position.set(x,y,z); g.add(fixture);
    _addPl(scene,0xfff5d0,1.2,12,x,y-0.5,z);
  });
  // Factory walls
  const wallMat=new THREE.MeshStandardMaterial({color:0xd1d5db,roughness:0.8});
  [[-15,3,0,0.4,6,30],[15,3,0,0.4,6,30]].forEach(([x,y,z,w,h,d])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat);
    wall.position.set(x,y,z); g.add(wall);
  });
  scene.add(new THREE.AmbientLight(0xe0e8f0,0.7));
  scene.add(g);
}

// ── HUMAN STAIRWELL ───────────────────────────────────────────────────────────
function _humanStairwellArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#1e293b'],[0.5,'#334155'],[1,'#1e293b']]);
  scene.fog=new THREE.Fog(0x334155,20,45);
  // Concrete walls forming stairwell shaft
  const concMat=new THREE.MeshStandardMaterial({color:0x94a3b8,roughness:0.85});
  // Shaft walls
  [[-4,8,0,0.4,16,8],[4,8,0,0.4,16,8],[0,8,-4,8,16,0.4]].forEach(([x,y,z,w,h,d])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),concMat);
    wall.position.set(x,y,z); g.add(wall);
  });
  const floorH=2.6;
  // 6 stair flights
  for(let floor=0;floor<6;floor++){
    const y=floor*floorH;
    const side=floor%2===0?1:-1;
    // Landing platform
    const landing=new THREE.Mesh(new THREE.BoxGeometry(4.5,0.2,3.5),concMat);
    landing.position.set(side*1.8,y+floorH-0.1,0); landing.castShadow=true; landing.receiveShadow=true; g.add(landing);
    // Steps (8 per flight)
    for(let s=0;s<8;s++){
      const step=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.22,3.5),new THREE.MeshStandardMaterial({color:0xb0bec5,roughness:0.7}));
      step.position.set(side*(1.8-0.25*s),y+0.22+s*(floorH/8),0); step.receiveShadow=true; g.add(step);
    }
    // Handrail
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,floorH,8),new THREE.MeshStandardMaterial({color:0xef4444,metalness:0.5}));
    rail.position.set(side*3.4,y+floorH/2,1.5); rail.rotation.z=0.1*side; g.add(rail);
    // Floor number + emergency panel
    const panel=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.1),new THREE.MeshStandardMaterial({color:0x1d4ed8}));
    panel.position.set(-side*3.8,y+floorH-0.6,-1.8); g.add(panel);
    const panelLight=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.4),new THREE.MeshBasicMaterial({color:0x60a5fa}));
    panelLight.position.set(-side*3.74,y+floorH-0.6,-1.8); g.add(panelLight);
    _addPl(scene,0x60a5fa,0.5,4,-side*3.8,y+floorH-0.6,-1.8);
    // Ceiling light per floor
    const light=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.1,0.4),new THREE.MeshBasicMaterial({color:0xffffff}));
    light.position.set(0,y+floorH+0.1,0); g.add(light);
    _addPl(scene,0xffffff,0.8,5,0,y+floorH,0);
  }
  scene.add(new THREE.AmbientLight(0xd0d8e0,0.5));
  scene.add(g);
}

// ── ARM SURGERY ───────────────────────────────────────────────────────────────
function _armSurgeryArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#f0f4f8'],[0.5,'#e8f0f8'],[1,'#f0f4f8']]);
  // Clean room floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0xf0f4f8,roughness:0.3,metalness:0.1}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Circuit board on table
  const boardTable=new THREE.Mesh(new THREE.BoxGeometry(6,0.8,4),new THREE.MeshStandardMaterial({color:0xd1d5db,roughness:0.4,metalness:0.3}));
  boardTable.position.set(0,0.4,0); g.add(boardTable);
  const board=new THREE.Mesh(new THREE.BoxGeometry(5,0.12,3.2),new THREE.MeshStandardMaterial({color:0x065f46,roughness:0.6}));
  board.position.set(0,0.86,0); g.add(board);
  // Circuit traces
  [[- 1.5,0.1,-0.8],[0,0.1,-0.5],[1.5,0.1,0.2],[-0.8,0.1,0.6],[0.8,0.1,0.9]].forEach(([x,,z])=>{
    const trace=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.04,0.06),new THREE.MeshBasicMaterial({color:0xfbbf24}));
    trace.position.set(x,0.93,z); g.add(trace);
    // IC chips
    const chip=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.2),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.3}));
    chip.position.set(x,0.97,z); g.add(chip);
  });
  // Fault markers (red dots needing repair)
  [[-1,0.97,-1],[0.5,0.97,0.8],[-0.5,0.97,1.2],[1.2,0.97,-0.6]].forEach(([x,y,z])=>{
    const fault=new THREE.Mesh(new THREE.CircleGeometry(0.12,12),new THREE.MeshBasicMaterial({color:0xff0000}));
    fault.rotation.x=-Math.PI/2; fault.position.set(x,y+0.01,z); g.add(fault);
    _addPl(scene,0xff0000,0.6,2,x,y+0.3,z);
  });
  // Surgical arm tool holder (side)
  const toolHolder=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,3,12),new THREE.MeshStandardMaterial({color:0x9ca3af,metalness:0.7,roughness:0.3}));
  toolHolder.position.set(4,1.5,0); g.add(toolHolder);
  // Overhead surgical lamp
  const lamp=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.6,0.3,16),new THREE.MeshStandardMaterial({color:0xd0d0d0,metalness:0.5}));
  lamp.position.set(0,5,0); g.add(lamp);
  _addPl(scene,0xffffff,3.0,10,0,4.5,0);
  // Ring lights on the board
  for(let i=0;i<8;i++){
    const rad=2.2; const angle=i/8*Math.PI*2;
    _addPl(scene,0xf0f8ff,0.4,4,Math.cos(angle)*rad,3,Math.sin(angle)*rad*0.7);
  }
  scene.add(new THREE.AmbientLight(0xddeeff,1.0));
  _addDl(scene,0xffffff,0.8,0,8,0,true);
  scene.add(g);
}

// ── ARM SORT ──────────────────────────────────────────────────────────────────
function _armSortArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#0f1923'],[0.5,'#1a2d3a'],[1,'#0f1923']]);
  scene.fog=new THREE.Fog(0x1a2d3a,25,50);
  // Factory floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,30),new THREE.MeshStandardMaterial({color:0xe5e7eb,roughness:0.6}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  // Conveyor belt structure
  const frameMat=new THREE.MeshStandardMaterial({color:0x374151,metalness:0.6,roughness:0.4});
  const belt=new THREE.Mesh(new THREE.BoxGeometry(18,0.22,2.2),frameMat);
  belt.position.set(0,0.61,0); belt.castShadow=true; g.add(belt);
  const beltSurf=new THREE.Mesh(new THREE.BoxGeometry(17.6,0.06,1.9),new THREE.MeshStandardMaterial({color:0x1f2937}));
  beltSurf.position.set(0,0.75,0); g.add(beltSurf);
  // Belt roller ends
  [-9,9].forEach(x=>{
    const roller=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,2.2,16),new THREE.MeshStandardMaterial({color:0x6b7280,metalness:0.7}));
    roller.rotation.z=Math.PI/2; roller.position.set(x,0.5,0); g.add(roller);
  });
  // Colored packages
  const pkgCols=[0xef4444,0x22c55e,0x3b82f6,0xf59e0b];
  [-6,-3,0,3,6].forEach((x,i)=>{
    const pkg=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),new THREE.MeshStandardMaterial({color:pkgCols[i%4],emissive:pkgCols[i%4],emissiveIntensity:0.2}));
    pkg.position.set(x,1.06,0); g.add(pkg);
  });
  // Sort bins with color coding
  pkgCols.forEach((col,i)=>{
    const binX=10;
    const binZ=(i-1.5)*2.6;
    const bin=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.4,2.0),new THREE.MeshStandardMaterial({color:col,transparent:true,opacity:0.35}));
    bin.position.set(binX,0.7,binZ); g.add(bin);
    const binBorder=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.82,1.42,2.02)),new THREE.LineBasicMaterial({color:col}));
    binBorder.position.set(binX,0.7,binZ); g.add(binBorder);
    _addPl(scene,col,0.6,5,binX,1.5,binZ);
  });
  // Robot arm base (side)
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,2,14),new THREE.MeshStandardMaterial({color:0x6b7280,metalness:0.7,roughness:0.3}));
  base.position.set(0,1,3); g.add(base);
  const arm1=new THREE.Mesh(new THREE.BoxGeometry(0.3,2.5,0.3),new THREE.MeshStandardMaterial({color:0x9ca3af,metalness:0.6}));
  arm1.position.set(0,3.2,3); g.add(arm1);
  // Overhead lights
  [[-6,5,0],[0,5,0],[6,5,0]].forEach(([x,y,z])=>{
    const fix=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.15,0.35),new THREE.MeshStandardMaterial({color:0x888888}));
    fix.position.set(x,y,z); g.add(fix);
    _addPl(scene,0xfff5d0,1.1,12,x,y-0.4,z);
  });
  scene.add(new THREE.AmbientLight(0xe0e8f0,0.6));
  scene.add(g);
}

// ── CORAL REEF ────────────────────────────────────────────────────────────────
function _coralReefArena(scene){
  const g=new THREE.Group(); g.name='arena';
  // Shallow tropical ocean — dappled light blue
  scene.background=_makeSkyTex([[0,'#003d5c'],[0.35,'#005f7a'],[0.65,'#008fa0'],[1,'#00bfbf']]);
  scene.fog=new THREE.FogExp2(0x004060,0.022);

  // Sandy sea floor
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,75),new THREE.MeshStandardMaterial({color:0xd4b896,roughness:0.98}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-0.5; floor.receiveShadow=true; g.add(floor);

  // Undulating caustic light ripple overlay
  const caustic=new THREE.Mesh(new THREE.PlaneGeometry(70,75),new THREE.MeshBasicMaterial({color:0x40aadd,transparent:true,opacity:0.08,depthWrite:false}));
  caustic.rotation.x=-Math.PI/2; caustic.position.y=0.01; g.add(caustic);

  // Towering coral columns
  const coralCols=[0xff6b6b,0xff8e53,0xffd93d,0xee82ee,0xff69b4,0x40e0d0];
  [[-6,0,-5,0.6,5],[-8,0,-11,0.4,3.5],[7,0,-8,0.7,6],[-5,0,-16,0.5,4],[8,0,-14,0.55,5.5],
   [-7,0,-22,0.65,5],[5,0,-20,0.45,3.5],[-9,0,-28,0.7,6],[7,0,-26,0.5,4.5],
   [-6,0,-34,0.6,5],[8,0,-32,0.4,3],[-4,0,-38,0.55,5]].forEach(([x,,z,r,h],i)=>{
    const col=coralCols[i%coralCols.length];
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(r*0.4,r,h,8),new THREE.MeshStandardMaterial({color:col,roughness:0.6,emissive:col,emissiveIntensity:0.12}));
    trunk.position.set(x,h/2-0.5,z); trunk.castShadow=true; g.add(trunk);
    // Crown branches
    for(let b=0;b<3;b++){
      const ang=b/3*Math.PI*2+i; const blen=0.8+Math.random()*0.6;
      const branch=new THREE.Mesh(new THREE.CylinderGeometry(r*0.15,r*0.25,blen,6),new THREE.MeshStandardMaterial({color:col,roughness:0.5,emissive:col,emissiveIntensity:0.2}));
      branch.position.set(x+Math.cos(ang)*r*1.2,h-0.3+blen*0.4,z+Math.sin(ang)*r*1.2);
      branch.rotation.z=0.6+b*0.2; g.add(branch);
    }
    _addPl(scene,col,0.4,6,x,h*0.7,z);
  });

  // Glowing sea anemones
  const anemoneMat=new THREE.MeshStandardMaterial({color:0xff69b4,emissive:0xff1493,emissiveIntensity:0.5,roughness:0.5});
  [[-3,-0.3,-4],[4,-0.3,-12],[-5,-0.3,-19],[3,-0.3,-27],[-4,-0.3,-33]].forEach(([x,y,z])=>{
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.45,0.4,10),anemoneMat);
    base.position.set(x,y,z); g.add(base);
    for(let t=0;t<8;t++){
      const tentacle=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.7,5),anemoneMat);
      const a=t/8*Math.PI*2; tentacle.position.set(x+Math.cos(a)*0.25,y+0.5,z+Math.sin(a)*0.25);
      tentacle.rotation.z=0.3; g.add(tentacle);
    }
    _addPl(scene,0xff69b4,0.4,4,x,y+0.6,z);
  });

  // Fish school (animated)
  if(!scene.userData.movers) scene.userData.movers=[];
  const fishMeshes=[];
  const fishCols=[0xff6b6b,0xffd700,0x4fc3f7];
  for(let i=0;i<15;i++){
    const fc=fishCols[i%3];
    const fish=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.38,5),new THREE.MeshStandardMaterial({color:fc,emissive:fc,emissiveIntensity:0.2}));
    fish.rotation.x=Math.PI/2;
    fish.position.set((Math.random()-0.5)*10, 1.5+Math.random()*3, -5-Math.random()*30);
    g.add(fish); fishMeshes.push({mesh:fish,phase:Math.random()*Math.PI*2,speed:0.4+Math.random()*0.4,radius:1.5+Math.random()*2});
  }
  scene.userData.movers.push(t=>{
    fishMeshes.forEach(f=>{
      f.mesh.position.x=Math.sin(t*f.speed+f.phase)*f.radius;
      f.mesh.position.y=1.5+Math.sin(t*0.8+f.phase)*0.5;
      f.mesh.rotation.y=Math.cos(t*f.speed+f.phase)>0?0:Math.PI;
    });
  });

  // Checkpoint arches — glowing cyan portals
  [-6,-16,-26,-36].forEach((z,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.2,0.2,10,32),new THREE.MeshBasicMaterial({color:0x00ffcc}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,1.5,z); ring.name='cp'; g.add(ring);
    _addPl(scene,0x00ffcc,1.0,10,0,2,z);
  });

  // Caustic ripple animation
  scene.userData.movers.push(t=>{
    caustic.material.opacity=0.05+Math.sin(t*1.4)*0.04;
    caustic.rotation.z=t*0.02;
  });

  // Dappled light shafts from surface
  [[-5,8,-10],[3,8,-22],[-4,8,-34]].forEach(([x,y,z])=>{
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.8,2.5,y+0.5,8,1,true),new THREE.MeshBasicMaterial({color:0x80ffff,transparent:true,opacity:0.06,side:THREE.DoubleSide,depthWrite:false}));
    shaft.position.set(x,y/2,z); g.add(shaft);
    _addPl(scene,0x40c0c0,0.4,12,x,y,z);
  });

  scene.add(new THREE.AmbientLight(0x003355,0.7));
  _addDl(scene,0x80eeff,0.6,5,20,10,true);
  _addPl(scene,0x00aacc,0.8,50,0,6,-15);
  scene.add(g);
}

// ── DEEP TRENCH ───────────────────────────────────────────────────────────────
function _deepTrenchArena(scene){
  const g=new THREE.Group(); g.name='arena';
  scene.background=_makeSkyTex([[0,'#000511'],[0.4,'#000a1f'],[0.8,'#001228'],[1,'#000511']]);
  scene.fog=new THREE.FogExp2(0x000814,0.028);

  // Trench floor — dark sediment
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,80),new THREE.MeshStandardMaterial({color:0x0a0e18,roughness:1}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-1; floor.receiveShadow=true; g.add(floor);

  // Trench walls — tall cliffs on both sides
  const cliffMat=new THREE.MeshStandardMaterial({color:0x0d1520,roughness:0.95,metalness:0.1});
  [-14,14].forEach(side=>{
    for(let i=0;i<10;i++){
      const h=12+Math.random()*8; const w=5+Math.random()*3;
      const cliff=new THREE.Mesh(new THREE.BoxGeometry(w,h,8),cliffMat);
      cliff.position.set(side+(side>0?1:-1)*Math.random()*2,h/2-1,-38+i*8); cliff.castShadow=true; g.add(cliff);
    }
  });

  // Ancient shipwreck (goal landmark)
  const shipMat=new THREE.MeshStandardMaterial({color:0x1a1208,roughness:0.95,metalness:0.2});
  const hull=new THREE.Mesh(new THREE.BoxGeometry(8,2.5,20),shipMat);
  hull.position.set(2,-0.2,-32); hull.rotation.y=0.2; hull.castShadow=true; g.add(hull);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(7,0.4,18),new THREE.MeshStandardMaterial({color:0x241a0a,roughness:1}));
  deck.position.set(2,1.1,-32); deck.rotation.y=0.2; g.add(deck);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,6,8),new THREE.MeshStandardMaterial({color:0x1a1208,roughness:0.95}));
  mast.position.set(2,4,-32); g.add(mast);
  _addPl(scene,0x00aaff,0.6,15,2,2,-32);

  // Bioluminescent deep-sea creatures & vents
  const bioMat=new THREE.MeshBasicMaterial({color:0x00ffaa,transparent:true,opacity:0.6});
  [[-4,0,-6],[5,0,-14],[-3,0,-22],[4,0,-30],[-5,0,-38]].forEach(([x,y,z])=>{
    // Hydrothermal vent
    const vent=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,1.2,8),new THREE.MeshStandardMaterial({color:0x1a0e00,roughness:0.9}));
    vent.position.set(x,y+0.6,z); g.add(vent);
    // Glow particles rising from vent
    _addPl(scene,0x00ff88,0.8,6,x,y+1.5,z);
    // Glowing jellyfish
    const jellyBody=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x8844ff,transparent:true,opacity:0.5}));
    jellyBody.position.set(x+2,1.5+Math.random()*3,z+Math.random()*2-1); g.add(jellyBody);
    _addPl(scene,0x8844ff,0.4,4,x+2,2,z);
  });

  // Glowing deep-sea lantern fish (animated)
  if(!scene.userData.movers) scene.userData.movers=[];
  const lanternFish=[];
  for(let i=0;i<8;i++){
    const fish=new THREE.Mesh(new THREE.SphereGeometry(0.22,7,5),new THREE.MeshBasicMaterial({color:0x00ffaa}));
    fish.position.set((Math.random()-0.5)*16,0.5+Math.random()*5,-5-Math.random()*35); g.add(fish);
    const light=new THREE.PointLight(0x00ffaa,0.6,4); light.position.copy(fish.position); scene.add(light);
    lanternFish.push({mesh:fish,light,phase:Math.random()*Math.PI*2,depth:fish.position.z});
  }
  scene.userData.movers.push(t=>{
    lanternFish.forEach(f=>{
      f.mesh.position.x=Math.sin(t*0.6+f.phase)*5;
      f.mesh.position.y=2+Math.sin(t*0.4+f.phase*2)*1.5;
      f.light.position.copy(f.mesh.position);
      f.light.intensity=0.4+Math.sin(t*3+f.phase)*0.2;
    });
  });

  // Checkpoint arches — blue bioluminescent
  [-6,-16,-26,-36].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3,0.18,10,32),new THREE.MeshBasicMaterial({color:0x0066ff}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,1,z); ring.name='cp'; g.add(ring);
    _addPl(scene,0x0066ff,1.0,10,0,2,z);
  });

  scene.add(new THREE.AmbientLight(0x000814,0.4));
  _addPl(scene,0x0033aa,0.5,60,0,8,0);
  scene.add(g);
}

// ── JET STUNT ─────────────────────────────────────────────────────────────────
function _jetStuntArena(scene){
  const g=new THREE.Group(); g.name='arena';
  // Bright blue sky with dramatic cloud formations for a stunt airshow
  scene.background=_makeSkyTex([[0,'#0a1a3a'],[0.25,'#1a3a80'],[0.55,'#2d6abf'],[0.8,'#5d9fd0'],[1,'#87ceeb']]);
  scene.fog=new THREE.Fog(0x4488c0,40,90);

  // Airshow crowd grandstand (far background)
  const grandMat=new THREE.MeshStandardMaterial({color:0x2d4060,roughness:0.7});
  const grand=new THREE.Mesh(new THREE.BoxGeometry(30,4,3),grandMat);
  grand.position.set(0,2,10); g.add(grand);
  // Crowd color dots
  const crowdCols=[0xef4444,0x22c55e,0x3b82f6,0xfbbf24,0xec4899];
  for(let ci=0;ci<30;ci++){
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.2,5,4),new THREE.MeshBasicMaterial({color:crowdCols[ci%5]}));
    dot.position.set(-14+ci*1,2.8+Math.random()*1.5,10); g.add(dot);
  }

  // Launch runway strip
  const runway=new THREE.Mesh(new THREE.PlaneGeometry(8,12),new THREE.MeshStandardMaterial({color:0x444444,roughness:0.6}));
  runway.rotation.x=-Math.PI/2; runway.position.set(0,-1,6); g.add(runway);
  // Runway center line
  const rLine=new THREE.Mesh(new THREE.PlaneGeometry(0.3,10),new THREE.MeshBasicMaterial({color:0xffffff}));
  rLine.rotation.x=-Math.PI/2; rLine.position.set(0,-0.98,6); g.add(rLine);

  // Dramatic stunt pylon gates
  const pylonMat=new THREE.MeshStandardMaterial({color:0xef4444,metalness:0.5,roughness:0.4});
  const pylonWhite=new THREE.MeshStandardMaterial({color:0xffffff,metalness:0.3});
  const pylonData=[[0,3,-5],[0,5,-12],[-4,4,-19],[4,5,-26],[0,6,-33]];
  const stunGateColors=[0xef4444,0xfbbf24,0x22c55e,0x3b82f6,0xec4899];
  pylonData.forEach(([rx,ry,rz],i)=>{
    const col=stunGateColors[i];
    // Left post
    [-3.5,3.5].forEach(side=>{
      const post=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,ry*2,8),i%2===0?pylonMat:pylonWhite);
      post.position.set(rx+side,ry/2,rz); g.add(post);
      // Warning bands
      for(let b=0;b<3;b++){
        const band=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.25,8),new THREE.MeshBasicMaterial({color:col}));
        band.position.set(rx+side,0.5+b*2,rz); g.add(band);
      }
    });
    // Gate ring
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.22,10,36),new THREE.MeshBasicMaterial({color:col}));
    ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
    _addPl(scene,col,0.8,12,rx,ry,rz);
    // Smoke trail markers
    _addPl(scene,0xffffff,0.4,8,rx,ry-2,rz);
  });

  // Speed/boost arrows on the course line
  [-4,-11,-18,-25,-32].forEach(z=>{
    const arrow=new THREE.Mesh(new THREE.PlaneGeometry(1.2,2.5),new THREE.MeshBasicMaterial({color:0xfbbf24,transparent:true,opacity:0.7}));
    arrow.rotation.x=-Math.PI/2; arrow.position.set(0,-0.97,z); g.add(arrow);
  });

  // Wind sock (rotating)
  if(!scene.userData.movers) scene.userData.movers=[];
  const sockPole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,4,8),new THREE.MeshStandardMaterial({color:0xaaaaaa}));
  sockPole.position.set(-10,2,8); g.add(sockPole);
  const sock=new THREE.Mesh(new THREE.ConeGeometry(0.25,1.5,8),new THREE.MeshStandardMaterial({color:0xef4444}));
  sock.rotation.z=Math.PI/2; sock.position.set(-10,3.8,8); g.add(sock);
  scene.userData.movers.push(t=>{
    sock.rotation.y=Math.sin(t*1.5)*0.4;
    sock.rotation.x=Math.sin(t*0.9)*0.15;
  });

  // Dramatic cloud layers
  const cloudMat=new THREE.MeshStandardMaterial({color:0xddeeff,roughness:1,transparent:true,opacity:0.75});
  [[-18,12,-15],[12,15,-25],[-8,18,-38],[16,10,-40],[-15,14,-50],[0,20,-55]].forEach(([cx,cy,cz])=>{
    const sz=3+Math.random()*3;
    [sz,sz*1.3,sz*0.85,sz*0.7].forEach((r,ci)=>{
      const c=new THREE.Mesh(new THREE.SphereGeometry(r,7,5),cloudMat);
      c.position.set(cx+ci*r*1.0-r,cy,cz+ci*0.3); g.add(c);
    });
  });

  // Flags on pylons (waving animation)
  const flagMeshes=[];
  [[-12,4,6],[12,4,6]].forEach(([fx,fy,fz])=>{
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,5,8),new THREE.MeshStandardMaterial({color:0xaaaaaa}));
    pole.position.set(fx,fy,fz); g.add(pole);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(2,1.2),new THREE.MeshBasicMaterial({color:0xef4444,side:THREE.DoubleSide}));
    flag.position.set(fx+1,fy+2,fz); g.add(flag); flagMeshes.push(flag);
  });
  scene.userData.movers.push(t=>{
    flagMeshes.forEach((f,i)=>{f.rotation.y=Math.sin(t*2.5+i)*0.25;});
  });

  scene.add(new THREE.AmbientLight(0xaac8f0,1.1));
  _addDl(scene,0xfff8e8,1.4,15,25,10,true);
  scene.add(g);
}

// ── JET SUPERSONIC ────────────────────────────────────────────────────────────
function _jetSupersonicArena(scene){
  const g=new THREE.Group(); g.name='arena';
  // High altitude — stratosphere feel, deep blue to black
  scene.background=_makeSkyTex([[0,'#000510'],[0.3,'#001030'],[0.6,'#002060'],[0.8,'#0040a0'],[1,'#0080d0']]);
  scene.fog=new THREE.Fog(0x001a50,50,100);

  // Stars above
  const starPos=[]; for(let i=0;i<500;i++){starPos.push((Math.random()-0.5)*200,(Math.random()*30+15),(Math.random()-0.5)*200);}
  const starGeo=new THREE.BufferGeometry(); starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  g.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.25,transparent:true,opacity:0.7,sizeAttenuation:true})));

  // Speed gates — thin neon rings at altitude
  const gateColors=[0x00aaff,0xff4400,0x00ff88,0xffaa00,0xff0088];
  [[0,5,-6],[0,6.5,-13],[0,8,-20],[0,6,-27],[0,9,-34]].forEach(([rx,ry,rz],i)=>{
    const col=gateColors[i];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4.5,0.28,10,36),new THREE.MeshBasicMaterial({color:col}));
    ring.position.set(rx,ry,rz); ring.name='cp'; g.add(ring);
    // Inner ring
    const inner=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.1,8,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.5}));
    inner.position.set(rx,ry,rz); g.add(inner);
    _addPl(scene,col,1.2,16,rx,ry,rz);
    // Speed trail flash marker
    const trail=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.15,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.3}));
    trail.position.set(rx,ry,rz+3); g.add(trail);
  });

  // Cloud layer below — we're above the clouds
  const cloudMat=new THREE.MeshStandardMaterial({color:0xdde8ff,roughness:1,transparent:true,opacity:0.85});
  for(let ci=0;ci<20;ci++){
    const cx=(Math.random()-0.5)*60, cz=-10-Math.random()*50;
    const sz=4+Math.random()*5;
    [sz,sz*1.2,sz*0.9].forEach((r,k)=>{
      const c=new THREE.Mesh(new THREE.SphereGeometry(r,7,5),cloudMat);
      c.position.set(cx+k*r*0.9-r,-1+Math.random(),cz); g.add(c);
    });
  }

  // Sonic boom shock waves (visual rings)
  if(!scene.userData.movers) scene.userData.movers=[];
  const booms=[];
  for(let i=0;i<3;i++){
    const boom=new THREE.Mesh(new THREE.TorusGeometry(1,0.06,6,32),new THREE.MeshBasicMaterial({color:0x80aaff,transparent:true,opacity:0.0}));
    boom.position.set(0,6,-5-i*12); g.add(boom);
    booms.push({mesh:boom,phase:i*2.1});
  }
  scene.userData.movers.push(t=>{
    booms.forEach(b=>{
      const p=(t*0.5+b.phase)%3;
      const scale=1+p*3; b.mesh.scale.set(scale,scale,scale);
      b.mesh.material.opacity=Math.max(0,(1-p/3)*0.4);
    });
  });

  // Distant other jets (background)
  const jetSilMat=new THREE.MeshStandardMaterial({color:0x334466,metalness:0.8,roughness:0.2});
  [[-20,8,-25],[18,12,-35]].forEach(([jx,jy,jz])=>{
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.15,3,8),jetSilMat);
    body.rotation.z=Math.PI/2; body.position.set(jx,jy,jz); g.add(body);
    const wing=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.08,0.7),jetSilMat);
    wing.position.set(jx,jy,jz); g.add(wing);
  });

  scene.add(new THREE.AmbientLight(0x001040,0.5));
  _addDl(scene,0xfff0d8,1.6,20,30,15,true);
  _addPl(scene,0x0055aa,0.8,80,0,10,-20);
  scene.add(g);
}

// ── KELP FOREST ARENA ───────────────────────────────────────────────────────
function _kelpForestArena(scene){
  scene.background=_makeSkyTex('#001a0a','#003320');
  scene.fog=new THREE.Fog('#001a0a',30,90);
  const floorMat=new THREE.MeshStandardMaterial({color:0x1a3a10,roughness:0.9,metalness:0});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  // Kelp stalks — tall thin cylinders with swaying animation
  scene.userData.movers=[];
  const kelpMat=new THREE.MeshStandardMaterial({color:0x22a84a,emissive:0x0a4020,emissiveIntensity:0.2});
  for(let i=0;i<40;i++){
    const x=-45+Math.random()*90, z=-45+Math.random()*90;
    if(Math.abs(x)<4&&Math.abs(z)<10) continue;
    const h=8+Math.random()*10;
    const g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,h,6),kelpMat); stalk.position.y=h/2; g.add(stalk);
    const top=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,4),kelpMat); top.position.y=h; g.add(top);
    const ph=Math.random()*Math.PI*2;
    scene.userData.movers.push({update(t){g.rotation.z=Math.sin(t*0.6+ph)*0.12; g.rotation.x=Math.cos(t*0.5+ph)*0.08;}});
  }
  // Glowing fish schools
  const fishMat=new THREE.MeshStandardMaterial({color:0xffaa22,emissive:0xff8800,emissiveIntensity:0.6});
  for(let f=0;f<3;f++){
    const group=new THREE.Group(); scene.add(group);
    const fishes=[]; const r=12+f*6;
    for(let i=0;i<8;i++){
      const fish=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,4),fishMat); group.add(fish); fishes.push({m:fish,off:i/8*Math.PI*2});
    }
    const ph=f*2.1;
    scene.userData.movers.push({update(t){group.position.set(Math.cos(t*0.3+ph)*r,4+Math.sin(t*0.2)*1,Math.sin(t*0.3+ph)*r); fishes.forEach(({m,off})=>{m.position.set(Math.cos(off+t*0.5)*1.5,Math.sin(off+t*0.7)*0.5,Math.sin(off+t*0.5)*1.5); m.rotation.y=off+t*0.5+Math.PI/2;});}});
  }
  // Checkpoint arches — coral gate style
  for(let i=0;i<5;i++){
    const z=-20+i*10;
    const archMat=new THREE.MeshStandardMaterial({color:0xff6699,emissive:0xff3366,emissiveIntensity:0.5});
    const lp=new THREE.Mesh(new THREE.TorusGeometry(3,0.15,8,20,Math.PI),archMat); lp.position.set(0,3,z); lp.rotation.z=Math.PI; scene.add(lp);
    _addPl(scene,0xff3366,0.8,8,0,4,z);
  }
  scene.add(new THREE.AmbientLight(0x003322,0.8));
  _addDl(scene,0x80ffaa,0.6,0,20,0,false);
  _addPl(scene,0x00ff88,0.6,40,0,8,0);
}

// ── ARCTIC ICE DIVE ARENA ───────────────────────────────────────────────────
function _arcticDiveArena(scene){
  scene.background=_makeSkyTex('#001040','#000a20');
  scene.fog=new THREE.Fog('#001040',25,80);
  const floorMat=new THREE.MeshStandardMaterial({color:0x8ab4d0,roughness:0.1,metalness:0.7});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),floorMat); floor.rotation.x=-Math.PI/2; floor.position.y=-0.5; floor.receiveShadow=true; scene.add(floor);
  // Ice ceiling
  const iceMat=new THREE.MeshStandardMaterial({color:0xb0e0ff,roughness:0.05,metalness:0.4,transparent:true,opacity:0.7});
  const iceCeil=new THREE.Mesh(new THREE.PlaneGeometry(120,120),iceMat); iceCeil.rotation.x=Math.PI/2; iceCeil.position.y=12; scene.add(iceCeil);
  // Ice crack light shafts
  for(let i=0;i<8;i++){
    const x=-20+Math.random()*40, z=-40+i*10;
    _addPl(scene,0x80c8ff,0.5,12,x,11,z);
  }
  // Underwater ice columns / stalactites
  const iceColMat=new THREE.MeshStandardMaterial({color:0xc0e8ff,roughness:0.1,metalness:0.5});
  for(let i=0;i<20;i++){
    const x=-40+Math.random()*80, z=-40+Math.random()*80;
    if(Math.abs(x)<5&&Math.abs(z)<8) continue;
    const h=3+Math.random()*6;
    const col=new THREE.Mesh(new THREE.ConeGeometry(0.3+Math.random()*0.4,h,6),iceColMat);
    col.position.set(x,12-h/2,z); col.rotation.x=Math.PI; scene.add(col);
  }
  // Checkpoint rings — icy blue
  scene.userData.movers=[];
  for(let i=0;i<5;i++){
    const z=-22+i*10;
    const ringMat=new THREE.MeshStandardMaterial({color:0x00ccff,emissive:0x0088cc,emissiveIntensity:0.7});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3,0.15,8,30),ringMat); ring.position.set(0,5,z); scene.add(ring);
    scene.userData.movers.push({update(t){ring.rotation.z=Math.sin(t*0.4+i)*0.15;}});
    _addPl(scene,0x00ccff,0.7,8,0,5,z);
  }
  scene.add(new THREE.AmbientLight(0x001840,0.5));
  _addDl(scene,0x80c8ff,0.8,0,12,0,false);
}

// ── MEDBOT TRIAGE ARENA ─────────────────────────────────────────────────────
function _medbotTriageArena(scene){
  scene.background=_makeSkyTex('#1a0a0a','#2a0808');
  scene.fog=new THREE.Fog('#1a0a0a',40,100);
  // Battlefield floor
  const floorMat=new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:0.8});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  // Medical tents — green cross tents with glowing sides
  const tentMat=new THREE.MeshStandardMaterial({color:0x1a4a1a});
  const redMat=new THREE.MeshStandardMaterial({color:0xee1111,emissive:0xaa0000,emissiveIntensity:0.5});
  [[-20,0],[5,-15],[-8,20],[18,10],[-15,-18]].forEach(([x,z],i)=>{
    const tent=new THREE.Mesh(new THREE.ConeGeometry(2.5,3,4),tentMat); tent.position.set(x,1.5,z); scene.add(tent);
    const cross=new THREE.Mesh(new THREE.BoxGeometry(0.3,1.5,0.3),redMat); cross.position.set(x,3.5,z); scene.add(cross);
    _addPl(scene,0xff2222,0.6,8,x,3,z);
  });
  // Injured bots (glowing red distress beacons)
  scene.userData.movers=[];
  [[-22,-5],[10,18],[-5,-22],[20,-8],[0,15]].forEach(([x,z],i)=>{
    const bMat=new THREE.MeshStandardMaterial({color:0xff3300,emissive:0xff0000,emissiveIntensity:1.0});
    const beacon=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,8),bMat); beacon.position.set(x,0.5,z); scene.add(beacon);
    const ph=i*1.3;
    scene.userData.movers.push({update(t){beacon.material.emissiveIntensity=0.4+Math.sin(t*3+ph)*0.6;}});
    _addPl(scene,0xff2200,0.8,5,x,1,z);
  });
  // Medical supply crates (green)
  const supMat=new THREE.MeshStandardMaterial({color:0x22aa44,emissive:0x005522,emissiveIntensity:0.3});
  [[-10,5],[12,-10],[0,-5],[15,15]].forEach(([x,z])=>{
    const crate=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),supMat); crate.position.set(x,0.5,z); scene.add(crate);
  });
  scene.add(new THREE.AmbientLight(0x200a0a,0.4));
  _addDl(scene,0xff9966,0.6,5,15,10,true);
  _addPl(scene,0xff4422,0.5,50,0,8,0);
}

// ── MEDBOT WARD ARENA ───────────────────────────────────────────────────────
function _medbotWardArena(scene){
  scene.background=new THREE.Color(0x0a1a0a);
  scene.fog=new THREE.Fog(0x0a1a0a,30,80);
  // Clean white hospital floor
  const floorMat=new THREE.MeshStandardMaterial({color:0xe8f8e8,roughness:0.3,metalness:0.1});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  // Grid floor tiles
  const tileMat=new THREE.MeshStandardMaterial({color:0xc8e8c8,roughness:0.4});
  for(let x=-8;x<=8;x+=2) for(let z=-8;z<=8;z+=2){
    const tile=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9),tileMat); tile.rotation.x=-Math.PI/2; tile.position.set(x*3,0.001,z*3); scene.add(tile);
  }
  // Hospital walls + corridor separators
  const wallMat=new THREE.MeshStandardMaterial({color:0xdafada,roughness:0.5});
  [[-18,0,0],[18,0,0],[0,0,-18],[0,0,18]].forEach(([x,y,z])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(x===0?36:1,4,z===0?1:36),wallMat); wall.position.set(x,2,z); wall.castShadow=true; scene.add(wall);
  });
  // Patient beds (6 rooms with glowing status)
  scene.userData.movers=[];
  const bedMat=new THREE.MeshStandardMaterial({color:0xffffff});
  [[-10,-10],[0,-10],[10,-10],[-10,10],[0,10],[10,10]].forEach(([x,z],i)=>{
    const bed=new THREE.Mesh(new THREE.BoxGeometry(2,0.5,3.5),bedMat); bed.position.set(x,0.25,z); scene.add(bed);
    const statusCols=[0x22ff22,0xff8800,0xff2222];
    const sMat=new THREE.MeshStandardMaterial({color:statusCols[i%3],emissive:statusCols[i%3],emissiveIntensity:0.8});
    const statusLight=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3),sMat); statusLight.position.set(x+0.8,0.8,z-1.5); scene.add(statusLight);
    scene.userData.movers.push({update(t){statusLight.material.emissiveIntensity=0.4+Math.sin(t*2+i)*0.6;}});
    _addPl(scene,statusCols[i%3],0.4,4,x,1.5,z);
  });
  // Overhead medical lights
  for(let x=-8;x<=8;x+=8) for(let z=-8;z<=8;z+=8){
    _addPl(scene,0xffffff,0.8,12,x,5,z);
  }
  scene.add(new THREE.AmbientLight(0xd0f0d0,0.9));
  _addDl(scene,0xffffff,0.8,5,15,5,true);
}

// ── FIREBOT BLAZE ARENA ─────────────────────────────────────────────────────
function _firebotBlazeArena(scene){
  scene.background=_makeSkyTex('#1a0000','#2a0800');
  scene.fog=new THREE.Fog('#2a0400',20,70);
  const floorMat=new THREE.MeshStandardMaterial({color:0x2a1500,roughness:0.9});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  // Burning structure walls
  const buildMat=new THREE.MeshStandardMaterial({color:0x3a2010,roughness:0.8,metalness:0.1});
  const charMat=new THREE.MeshStandardMaterial({color:0x1a0a00,roughness:1.0});
  [[-15,0,-5],[15,0,-5],[0,0,-20],[-15,0,10],[15,0,10]].forEach(([x,y,z])=>{
    const wall=new THREE.Mesh(new THREE.BoxGeometry(8,5,1),buildMat); wall.position.set(x,2.5,z); wall.castShadow=true; scene.add(wall);
    const char=new THREE.Mesh(new THREE.BoxGeometry(8,2,0.2),charMat); char.position.set(x,1,z+0.5); scene.add(char);
  });
  // Fire zones — animated flame points
  scene.userData.movers=[];
  const flameCols=[0xff4400,0xff8800,0xffcc00];
  [[-15,-5],[0,-15],[15,5],[-8,12],[10,-18]].forEach(([x,z],i)=>{
    for(let f=0;f<4;f++){
      const fMat=new THREE.MeshStandardMaterial({color:flameCols[f%3],emissive:flameCols[f%3],emissiveIntensity:1.2,transparent:true,opacity:0.85});
      const flame=new THREE.Mesh(new THREE.ConeGeometry(0.6,2+f*0.5,5),fMat); flame.position.set(x+f*0.8-1.2,1+f*0.4,z); scene.add(flame);
      const ph=f*1.2+i*0.7;
      scene.userData.movers.push({update(t){flame.scale.y=0.8+Math.sin(t*5+ph)*0.3; flame.rotation.y+=0.05; flame.material.emissiveIntensity=0.8+Math.sin(t*4+ph)*0.5;}});
    }
    _addPl(scene,0xff4400,1.2,10,x,3,z);
  });
  // Smoke particles
  const smokeGeo=new THREE.BufferGeometry();
  const sPos=[]; for(let i=0;i<200;i++){ sPos.push((-40+Math.random()*80),(1+Math.random()*12),(-40+Math.random()*80)); }
  smokeGeo.setAttribute('position',new THREE.Float32BufferAttribute(sPos,3));
  const smokeMat=new THREE.PointsMaterial({color:0x333333,size:1.5,transparent:true,opacity:0.25});
  scene.add(new THREE.Points(smokeGeo,smokeMat));
  // Rescue victim beacons
  [[-20,8],[8,20],[-5,-25],[22,-5]].forEach(([x,z])=>{
    const bMat=new THREE.MeshStandardMaterial({color:0xffff00,emissive:0xffaa00,emissiveIntensity:1.0});
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,1.5,6),bMat); b.position.set(x,0.75,z); scene.add(b);
    _addPl(scene,0xffaa00,0.9,6,x,2,z);
  });
  scene.add(new THREE.AmbientLight(0x200800,0.4));
  _addDl(scene,0xff6620,0.7,5,12,5,false);
  _addPl(scene,0xff4400,0.6,60,0,8,0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20 GROUND ARENAS
// ═══════════════════════════════════════════════════════════════════════════════
function _forestTrailArena(scene){
  scene.background=new THREE.Color(0x0a1a0a); scene.fog=new THREE.FogExp2(0x0d2a0d,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a3a0f,roughness:0.95}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const tMat=new THREE.MeshStandardMaterial({color:0x2d4a1a});
  for(let i=0;i<30;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.4,5+Math.random()*4,7),tMat);t.position.set((Math.random()-0.5)*60,(2.5),(Math.random()-0.5)*60);scene.add(t);}
  const pMat=new THREE.MeshStandardMaterial({color:0x5a3a1a,roughness:0.9});
  [-12,0,12,24].forEach((z,i)=>{const p=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.2,12),pMat);p.position.set(i*2-3,0.1,z);scene.add(p);});
  for(let i=0;i<20;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.12),new THREE.MeshBasicMaterial({color:0xffff44}));f.position.set((Math.random()-0.5)*50,0.5+Math.random()*2,(Math.random()-0.5)*50);scene.add(f);_addPl(scene,0xffff44,0.4,3,f.position.x,f.position.y,f.position.z);}
  scene.add(new THREE.AmbientLight(0x112211,0.5)); _addDl(scene,0x88ff44,0.4,30,8,12,true);
  [[-15,8],[-5,16],[8,5],[20,14]].forEach(([x,z])=>_addPl(scene,0xff8800,1.2,10,x,2,z));
}
function _cityDeliveryArena(scene){
  scene.background=new THREE.Color(0x050510); scene.fog=new THREE.Fog(0x050510,20,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x111118,roughness:0.8,metalness:0.3}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.6});
  [[10,0,8,20],[-10,0,6,16],[5,0,12,14],[-15,0,8,18]].forEach(([x,,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bMat);b.position.set(x,h/2,Math.random()*30-15);scene.add(b);});
  const nMat=new THREE.MeshBasicMaterial({color:0x00ffff});
  for(let i=0;i<8;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(0.2,3,0.2),nMat);s.position.set((Math.random()-0.5)*40,1.5,(Math.random()-0.5)*40);scene.add(s);}
  scene.add(new THREE.AmbientLight(0x050520,0.6)); _addDl(scene,0x4444ff,0.3,30,0,15,true);
  [[0,0],[12,10],[-12,-8],[6,-15]].forEach(([x,z])=>{_addPl(scene,0x00ffff,0.8,12,x,3,z);_addPl(scene,0xff00aa,0.5,8,x+3,2,z+3);});
}
function _lavaCanyonArena(scene){
  scene.background=new THREE.Color(0x1a0500); scene.fog=new THREE.FogExp2(0x200800,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x2a0a00,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x3a1200,roughness:0.9});
  [[-20,0,6,25],[20,0,6,25],[0,0,60,6]].forEach(([x,y,w,h])=>{const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,4),wMat);wall.position.set(x,h/2,-10);scene.add(wall);});
  const lMat=new THREE.MeshBasicMaterial({color:0xff4400});
  for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(8,0.15,1.5),lMat);l.position.set((Math.random()-0.5)*30,0.05,i*8-20);scene.add(l);_addPl(scene,0xff4400,0.8,6,l.position.x,0.5,l.position.z);}
  scene.add(new THREE.AmbientLight(0x200800,0.4)); _addDl(scene,0xff6600,0.6,30,5,12,true);
  _addPl(scene,0xff2200,1.5,40,0,1,0); _addPl(scene,0xff8800,0.8,20,-15,3,10);
}
function _arcticStationArena(scene){
  scene.background=new THREE.Color(0xaaccff); scene.fog=new THREE.Fog(0xddeeff,15,60);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xe8f0ff,roughness:0.3,metalness:0.1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const iMat=new THREE.MeshStandardMaterial({color:0xaaccff,roughness:0.1,metalness:0.2,transparent:true,opacity:0.8});
  for(let i=0;i<12;i++){const h=2+Math.random()*4;const b=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.8,h,6),iMat);b.position.set((Math.random()-0.5)*50,h/2,(Math.random()-0.5)*50);scene.add(b);}
  const bMat=new THREE.MeshStandardMaterial({color:0x334455,roughness:0.7});
  [[0,0,8,4],[12,0,6,3]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,6),bMat);b.position.set(x,h/2,5);scene.add(b);});
  scene.add(new THREE.AmbientLight(0x8899cc,0.8)); _addDl(scene,0xffffff,0.9,30,10,20,true);
  _addPl(scene,0x4499ff,0.6,25,0,4,0); _addPl(scene,0xffffff,0.4,15,12,3,5);
}
function _templeMazeArena(scene){
  scene.background=new THREE.Color(0x080608); scene.fog=new THREE.FogExp2(0x100810,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1218,roughness:0.95}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x2a2030,roughness:0.9});
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(Math.random()>0.4){const w=new THREE.Mesh(new THREE.BoxGeometry(0.8,4,8),wMat);w.position.set(r*12-18,2,c*10-15);scene.add(w);}}
  const tMat=new THREE.MeshStandardMaterial({color:0xff8800,emissive:0xff4400,emissiveIntensity:0.5});
  for(let i=0;i<12;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,0.8,6),tMat);t.position.set((Math.random()-0.5)*40,0.4,(Math.random()-0.5)*40);scene.add(t);_addPl(scene,0xff6600,0.6,4,t.position.x,1,t.position.z);}
  scene.add(new THREE.AmbientLight(0x080508,0.3)); _addDl(scene,0x886644,0.5,30,5,10,true);
}
function _desertRallyArena(scene){
  scene.background=new THREE.Color(0x3a2800); scene.fog=new THREE.Fog(0x5a3a10,25,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xd4a050,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const dMat=new THREE.MeshStandardMaterial({color:0xc8903a,roughness:1});
  for(let i=0;i<15;i++){const h=1+Math.random()*3;const d=new THREE.Mesh(new THREE.CylinderGeometry(2+Math.random()*3,3+Math.random()*4,h,8),dMat);d.position.set((Math.random()-0.5)*70,h/2,(Math.random()-0.5)*70);scene.add(d);}
  const fMat=new THREE.MeshBasicMaterial({color:0xff2200});
  [-20,-10,0,10,20].forEach((z)=>{const f=new THREE.Mesh(new THREE.BoxGeometry(0.2,3,0.2),fMat);f.position.set(Math.sin(z)*10,1.5,z);scene.add(f);});
  scene.add(new THREE.AmbientLight(0x4a3010,0.7)); _addDl(scene,0xffaa44,1.0,30,15,20,true);
  _addPl(scene,0xff8800,0.8,30,0,5,0);
}
function _undergroundMineArena(scene){
  scene.background=new THREE.Color(0x050308); scene.fog=new THREE.FogExp2(0x080510,0.06);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1015,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const cMat=new THREE.MeshStandardMaterial({color:0x2a2030,roughness:0.95});
  for(let i=0;i<20;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.4+Math.random()*0.6),cMat);s.position.set((Math.random()-0.5)*50,0.4,(Math.random()-0.5)*50);scene.add(s);}
  const xMat=new THREE.MeshBasicMaterial({color:0x8855ff});
  for(let i=0;i<10;i++){const x=new THREE.Mesh(new THREE.OctahedronGeometry(0.3),xMat);x.position.set((Math.random()-0.5)*40,0.5,(Math.random()-0.5)*40);scene.add(x);_addPl(scene,0x8844ff,0.5,4,x.position.x,1,x.position.z);}
  scene.add(new THREE.AmbientLight(0x050308,0.2)); _addPl(scene,0xffaa44,1,15,0,3,0);
  [[-15,5],[10,-10],[5,15]].forEach(([x,z])=>_addPl(scene,0x8844ff,0.7,8,x,2,z));
}
function _floodedCityArena(scene){
  scene.background=new THREE.Color(0x0a1520); scene.fog=new THREE.Fog(0x0a1520,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2030,roughness:0.1,metalness:0.6}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x1a2a35,roughness:0.7});
  [[-15,5,8,6],[0,5,6,10],[12,3,10,7],[-5,2,5,5]].forEach(([x,h,w,bh])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,bh,w),bMat);b.position.set(x,bh/2-1,h);scene.add(b);});
  const pMat=new THREE.MeshStandardMaterial({color:0x2a3a45,roughness:0.8});
  for(let i=0;i<6;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(3,0.3,3),pMat);p.position.set((Math.random()-0.5)*30,1.5+Math.random()*3,(Math.random()-0.5)*30);scene.add(p);}
  scene.add(new THREE.AmbientLight(0x0a1520,0.5)); _addDl(scene,0x4488aa,0.4,30,0,15,true);
  _addPl(scene,0x00aaff,0.6,20,0,2,0); _addPl(scene,0x0044ff,0.4,15,-15,3,10);
}
function _spaceCorridorArena(scene){
  scene.background=new THREE.Color(0x020408); scene.fog=new THREE.Fog(0x020408,15,60);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0d0d1a,roughness:0.3,metalness:0.8}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.4,metalness:0.7});
  for(let i=0;i<5;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(12,5,0.5),wMat);w.position.set(0,2.5,i*10-20);scene.add(w);}
  const lMat=new THREE.MeshBasicMaterial({color:0xff2200});
  for(let i=0;i<10;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),lMat);l.position.set((Math.random()-0.5)*10,0.1,(Math.random()-0.5)*40);scene.add(l);_addPl(scene,0xff0000,0.4,3,l.position.x,0.5,l.position.z);}
  scene.add(new THREE.AmbientLight(0x050510,0.4)); _addDl(scene,0x8888ff,0.4,30,0,10,true);
  [[-5,0],[5,10],[0,-10]].forEach(([x,z])=>_addPl(scene,0x4444ff,0.6,10,x,3,z));
}
function _hauntedGraveyardArena(scene){
  scene.background=new THREE.Color(0x080510); scene.fog=new THREE.FogExp2(0x0d0a15,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0f1208,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const sMat=new THREE.MeshStandardMaterial({color:0x555566,roughness:0.9});
  for(let i=0;i<20;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(0.5+Math.random()*0.5,1+Math.random()*0.8,0.15),sMat);s.position.set((Math.random()-0.5)*50,0.8,(Math.random()-0.5)*50);scene.add(s);}
  const pMat=new THREE.MeshBasicMaterial({color:0xff8800});
  for(let i=0;i<8;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,4),pMat);p.position.set((Math.random()-0.5)*40,0.4,(Math.random()-0.5)*40);scene.add(p);_addPl(scene,0xff6600,0.5,5,p.position.x,1,p.position.z);}
  scene.add(new THREE.AmbientLight(0x050308,0.3)); _addDl(scene,0x8866cc,0.3,30,3,15,true);
  _addPl(scene,0x8800ff,0.6,25,0,5,0);
}
function _racingCircuitArena(scene){
  scene.background=new THREE.Color(0x050508); scene.fog=new THREE.Fog(0x050508,30,90);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x111114,roughness:0.6}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const lMat=new THREE.MeshBasicMaterial({color:0xffffff});
  for(let i=0;i<20;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.2,8,0.2),lMat);l.position.set((Math.random()-0.5)*60,4,(Math.random()-0.5)*60);scene.add(l);_addPl(scene,0xffffff,0.8,10,l.position.x,5,l.position.z);}
  const rMat=new THREE.MeshStandardMaterial({color:0xff1100,roughness:0.4});
  for(let i=0;i<6;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(1,0.15,8,20),rMat);r.rotation.x=Math.PI/2;r.position.set((Math.random()-0.5)*30,1.5,(i-3)*8);scene.add(r);}
  scene.add(new THREE.AmbientLight(0x080808,0.4)); _addDl(scene,0xffeedd,0.7,30,10,15,true);
  _addPl(scene,0xff4400,0.8,20,-15,5,0); _addPl(scene,0x4400ff,0.6,15,15,5,10);
}
function _farmHarvestArena(scene){
  scene.background=new THREE.Color(0x87ceeb); scene.fog=new THREE.Fog(0xd4eeff,30,100);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x4a7a20,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0xcc2200,roughness:0.9});
  const barn=new THREE.Mesh(new THREE.BoxGeometry(10,6,8),bMat); barn.position.set(20,3,0); scene.add(barn);
  const cMat=new THREE.MeshStandardMaterial({color:0xf0c840,roughness:0.9});
  for(let i=0;i<25;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,2,5),cMat);c.position.set((Math.random()-0.5)*50,1,(Math.random()-0.5)*50);scene.add(c);}
  scene.add(new THREE.AmbientLight(0x88aabb,0.8)); _addDl(scene,0xffcc66,1.2,30,15,20,true);
  _addPl(scene,0xffaa00,0.5,20,0,4,0);
}
function _pirateDockArena(scene){
  scene.background=new THREE.Color(0x0a1825); scene.fog=new THREE.Fog(0x0a1825,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x3a2510,roughness:0.9}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x5a3a18,roughness:0.95});
  for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(2,0.2,2),wMat);p.position.set((Math.random()-0.5)*40,0.1,(Math.random()-0.5)*40);scene.add(p);}
  const mMat=new THREE.MeshStandardMaterial({color:0x6a4020,roughness:0.9});
  [[-15,10],[10,-5]].forEach(([x,z])=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,12,8),mMat);m.position.set(x,6,z);scene.add(m);});
  const cMat=new THREE.MeshStandardMaterial({color:0x444444,roughness:0.5,metalness:0.6});
  for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,1.5,8),cMat);c.rotation.z=Math.PI/2;c.position.set((Math.random()-0.5)*20,0.8,(Math.random()-0.5)*20);scene.add(c);}
  scene.add(new THREE.AmbientLight(0x0a1020,0.5)); _addDl(scene,0xffaa44,0.6,30,5,10,true);
  _addPl(scene,0xff8800,0.7,15,0,3,0);
}
function _toxicWastelandArena(scene){
  scene.background=new THREE.Color(0x0a1000); scene.fog=new THREE.FogExp2(0x0d1a00,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2000,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const gMat=new THREE.MeshBasicMaterial({color:0x44ff00,transparent:true,opacity:0.7});
  for(let i=0;i<8;i++){const g=new THREE.Mesh(new THREE.CylinderGeometry(1+Math.random()*2,1.5,0.2,8),gMat);g.position.set((Math.random()-0.5)*50,0.1,(Math.random()-0.5)*50);scene.add(g);_addPl(scene,0x44ff00,0.5,6,g.position.x,0.5,g.position.z);}
  const rMat=new THREE.MeshStandardMaterial({color:0x332211,roughness:0.9,metalness:0.4});
  for(let i=0;i<6;i++){const v=new THREE.Mesh(new THREE.BoxGeometry(3+Math.random()*4,1.5,2),rMat);v.position.set((Math.random()-0.5)*50,0.75,(Math.random()-0.5)*50);scene.add(v);}
  scene.add(new THREE.AmbientLight(0x081000,0.3)); _addDl(scene,0x44aa00,0.4,30,0,12,true);
  _addPl(scene,0x44ff00,0.8,25,0,2,0);
}
function _carnivalFunfairArena(scene){
  scene.background=new THREE.Color(0x0a0020); scene.fog=new THREE.Fog(0x0a0020,25,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a0830,roughness:0.8}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const fwMat=new THREE.MeshStandardMaterial({color:0x222244,roughness:0.7,metalness:0.5});
  const fw=new THREE.Mesh(new THREE.TorusGeometry(6,0.3,8,32),fwMat); fw.position.set(-18,7,0); scene.add(fw);
  const colors=[0xff0044,0xff8800,0x00ff88,0x00aaff,0xff44ff];
  for(let i=0;i<12;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.3),new THREE.MeshBasicMaterial({color:colors[i%5]}));s.position.set((Math.random()-0.5)*40,2+Math.random()*4,(Math.random()-0.5)*40);scene.add(s);_addPl(scene,colors[i%5],0.5,5,s.position.x,s.position.y,s.position.z);}
  scene.add(new THREE.AmbientLight(0x0a0015,0.3)); _addDl(scene,0xaa44ff,0.4,30,0,12,true);
  _addPl(scene,0xff0088,0.8,20,0,5,0);
}
function _jungleBridgeArena(scene){
  scene.background=new THREE.Color(0x0a1a0a); scene.fog=new THREE.FogExp2(0x0d2010,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a3010,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x6a4a20,roughness:0.95});
  for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.2,2),bMat);b.position.set((i-2)*4,1.5+Math.sin(i)*0.3,0);scene.add(b);}
  const tMat=new THREE.MeshStandardMaterial({color:0x2a4a1a,roughness:0.9});
  for(let i=0;i<20;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,7+Math.random()*5,7),tMat);t.position.set((Math.random()-0.5)*60,3.5,(Math.random()-0.5)*60);scene.add(t);}
  _addPl(scene,0x44ffff,0.8,15,-5,1,-15); _addPl(scene,0x88ffff,0.5,10,-5,3,-8);
  scene.add(new THREE.AmbientLight(0x112211,0.5)); _addDl(scene,0x88cc44,0.5,30,5,15,true);
}
function _museumHeistArena(scene){
  scene.background=new THREE.Color(0x050508); scene.fog=new THREE.Fog(0x050508,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xccbbaa,roughness:0.2,metalness:0.1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const pMat=new THREE.MeshStandardMaterial({color:0xddccbb,roughness:0.2});
  for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,5,8),pMat);p.position.set((Math.random()-0.5)*40,2.5,(Math.random()-0.5)*40);scene.add(p);}
  const lMat=new THREE.MeshBasicMaterial({color:0xff0000});
  for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,12),lMat);l.position.set((Math.random()-0.5)*20,0.3+Math.random()*2,(Math.random()-0.5)*20);l.rotation.y=Math.random()*Math.PI;scene.add(l);_addPl(scene,0xff0000,0.3,5,l.position.x,l.position.y,l.position.z);}
  scene.add(new THREE.AmbientLight(0x080808,0.4)); _addDl(scene,0xffeedd,0.8,30,5,15,true);
}
function _snowRescueArena(scene){
  scene.background=new THREE.Color(0x8899cc); scene.fog=new THREE.Fog(0xaabbdd,8,50);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xeef0ff,roughness:0.2}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const mMat=new THREE.MeshStandardMaterial({color:0x778899,roughness:0.9});
  for(let i=0;i<8;i++){const h=5+Math.random()*8;const m=new THREE.Mesh(new THREE.ConeGeometry(3+Math.random()*3,h,6),mMat);m.position.set((Math.random()-0.5)*60,h/2,(Math.random()-0.5)*60);scene.add(m);}
  const rMat=new THREE.MeshBasicMaterial({color:0xff2200});
  for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.SphereGeometry(0.4),rMat);r.position.set((Math.random()-0.5)*30,0.4,(Math.random()-0.5)*30);scene.add(r);_addPl(scene,0xff2200,0.8,6,r.position.x,1,r.position.z);}
  scene.add(new THREE.AmbientLight(0x7788aa,0.8)); _addDl(scene,0xffffff,0.6,30,10,20,true);
}
function _cyberCityArena(scene){
  scene.background=new THREE.Color(0x010110); scene.fog=new THREE.Fog(0x010110,15,60);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x050520,roughness:0.2,metalness:0.8}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x0a0a25,roughness:0.3,metalness:0.8});
  for(let i=0;i<8;i++){const h=8+Math.random()*15;const b=new THREE.Mesh(new THREE.BoxGeometry(4,h,4),bMat);b.position.set((Math.random()-0.5)*50,h/2,(Math.random()-0.5)*50);scene.add(b);}
  const dMat=new THREE.MeshBasicMaterial({color:0x00ffff});
  for(let i=0;i<6;i++){const d=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,8,4),dMat);d.position.set((Math.random()-0.5)*30,4,(Math.random()-0.5)*30);scene.add(d);_addPl(scene,0x00ffff,0.4,6,d.position.x,2,d.position.z);}
  scene.add(new THREE.AmbientLight(0x010120,0.4)); _addDl(scene,0x4444ff,0.3,30,0,10,true);
  _addPl(scene,0x00ffff,1.0,20,0,4,0); _addPl(scene,0xff00ff,0.6,15,10,3,-10);
}
function _timeTrialGauntletArena(scene){
  scene.background=new THREE.Color(0x000000); scene.fog=new THREE.Fog(0x000000,20,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0d0d1a,roughness:0.1,metalness:0.9}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const pColors=[0xff0088,0x00ffaa,0xffaa00,0x4488ff];
  for(let i=0;i<12;i++){const c=pColors[i%4];const p=new THREE.Mesh(new THREE.BoxGeometry(2,0.2,2),new THREE.MeshBasicMaterial({color:c}));p.position.set((Math.random()-0.5)*40,1+Math.random()*3,(Math.random()-0.5)*40);scene.add(p);_addPl(scene,c,0.6,6,p.position.x,p.position.y+1,p.position.z);}
  const gMat=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true});
  for(let i=0;i<5;i++){const g=new THREE.Mesh(new THREE.TorusGeometry(3,0.1,6,20),gMat);g.position.set((i-2)*8,2,0);scene.add(g);}
  scene.add(new THREE.AmbientLight(0x050510,0.3)); _addPl(scene,0xffffff,0.6,30,0,5,0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20 AERIAL ARENAS
// ═══════════════════════════════════════════════════════════════════════════════
function _canyonFlightArena(scene){
  scene.background=new THREE.Color(0x3a1a05); scene.fog=new THREE.Fog(0x3a1a05,20,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x8a4020,roughness:1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-15; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0xc46030,roughness:0.95});
  [[-12,20,4,30],[12,20,4,30],[0,20,60,4]].forEach(([x,h,w,d])=>{const w2=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wMat);w2.position.set(x,0,0);scene.add(w2);});
  scene.add(new THREE.AmbientLight(0x3a1505,0.5)); _addDl(scene,0xff8844,0.8,30,10,15,true);
  _addPl(scene,0xff6622,0.6,30,0,5,0);
}
function _citySkylineArena(scene){
  scene.background=new THREE.Color(0x05050f); scene.fog=new THREE.Fog(0x05050f,25,90);
  const bMat=new THREE.MeshStandardMaterial({color:0x0d0d22,roughness:0.4,metalness:0.7});
  for(let i=0;i<15;i++){const h=10+Math.random()*20;const b=new THREE.Mesh(new THREE.BoxGeometry(5+Math.random()*4,h,5+Math.random()*4),bMat);b.position.set((Math.random()-0.5)*70,(h/2)-10,(Math.random()-0.5)*70);scene.add(b);}
  scene.add(new THREE.AmbientLight(0x050510,0.5)); _addDl(scene,0x4466ff,0.4,30,0,15,true);
  [[0,5,0],[15,8,10],[-15,6,-10],[5,10,15]].forEach(([x,y,z])=>_addPl(scene,0x4488ff,0.6,12,x,y,z));
}
function _stormCloudArena(scene){
  scene.background=new THREE.Color(0x101018); scene.fog=new THREE.FogExp2(0x151520,0.03);
  for(let i=0;i<20;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*5),new THREE.MeshStandardMaterial({color:0x222230,roughness:1,transparent:true,opacity:0.7}));c.position.set((Math.random()-0.5)*60,2+Math.random()*8,(Math.random()-0.5)*60);scene.add(c);}
  scene.add(new THREE.AmbientLight(0x080812,0.4)); _addDl(scene,0x8888cc,0.4,30,0,10,false);
  for(let i=0;i<5;i++)_addPl(scene,0xaaaaff,0.8,15,(Math.random()-0.5)*30,5,(Math.random()-0.5)*30);
}
function _volcanicFlythroughArena(scene){
  scene.background=new THREE.Color(0x1a0400); scene.fog=new THREE.FogExp2(0x200600,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshBasicMaterial({color:0xff3300}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-10; scene.add(gnd);
  _addPl(scene,0xff2200,2.0,60,0,-5,0);
  for(let i=0;i<8;i++){const h=6+Math.random()*8;const v=new THREE.Mesh(new THREE.CylinderGeometry(1,3,h,7),new THREE.MeshStandardMaterial({color:0x3a1400,roughness:0.9}));v.position.set((Math.random()-0.5)*50,h/2-10,(Math.random()-0.5)*50);scene.add(v);}
  scene.add(new THREE.AmbientLight(0x200800,0.4)); _addDl(scene,0xff6600,0.6,30,5,12,false);
}
function _arcticSurveyArena(scene){
  scene.background=new THREE.Color(0x99bbdd); scene.fog=new THREE.Fog(0xaaccee,20,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xddeeff,roughness:0.1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-5; scene.add(gnd);
  for(let i=0;i<10;i++){const h=3+Math.random()*6;const ic=new THREE.Mesh(new THREE.ConeGeometry(2+Math.random()*3,h,6),new THREE.MeshStandardMaterial({color:0x99ccff,roughness:0.1,transparent:true,opacity:0.8}));ic.position.set((Math.random()-0.5)*60,h/2-4,(Math.random()-0.5)*60);scene.add(ic);}
  scene.add(new THREE.AmbientLight(0x8899bb,0.9)); _addDl(scene,0xffffff,0.8,30,10,20,true);
}
function _rooftopDeliveryArena(scene){
  scene.background=new THREE.Color(0x05050f); scene.fog=new THREE.Fog(0x05050f,20,70);
  const bMat=new THREE.MeshStandardMaterial({color:0x0d0d22,roughness:0.4,metalness:0.6});
  const roofH=[8,12,10,15,9,11];
  roofH.forEach((h,i)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(6,h,6),bMat);b.position.set((i-2.5)*10,h/2-2,0);scene.add(b);const pad=new THREE.Mesh(new THREE.CircleGeometry(1.5,8),new THREE.MeshBasicMaterial({color:0x00ff88}));pad.rotation.x=-Math.PI/2;pad.position.set((i-2.5)*10,h-2,0);scene.add(pad);_addPl(scene,0x00ff88,0.6,8,(i-2.5)*10,h,0);});
  scene.add(new THREE.AmbientLight(0x050510,0.5)); _addDl(scene,0x4466ff,0.4,30,0,15,true);
}
function _spaceOrbitArena(scene){
  scene.background=new THREE.Color(0x000005);
  for(let i=0;i<200;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.05),new THREE.MeshBasicMaterial({color:0xffffff}));s.position.set((Math.random()-0.5)*150,(Math.random()-0.5)*150,(Math.random()-0.5)*150);scene.add(s);}
  const sMat=new THREE.MeshStandardMaterial({color:0x334455,roughness:0.4,metalness:0.8});
  const station=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,20,8),sMat); station.rotation.z=Math.PI/2; station.position.set(0,0,0); scene.add(station);
  scene.add(new THREE.AmbientLight(0x050510,0.5)); _addDl(scene,0xffffff,1.2,30,20,10,true);
  _addPl(scene,0x4488ff,0.6,20,0,5,0);
}
function _rainforestCanopyArena(scene){
  scene.background=new THREE.Color(0x0a1505); scene.fog=new THREE.FogExp2(0x0d2010,0.05);
  const tMat=new THREE.MeshStandardMaterial({color:0x1a3a10,roughness:0.9});
  for(let i=0;i<30;i++){const h=8+Math.random()*6;const t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.4,h,6),tMat);t.position.set((Math.random()-0.5)*60,h/2-2,(Math.random()-0.5)*60);scene.add(t);const leaf=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2),new THREE.MeshStandardMaterial({color:0x2a5a15,roughness:0.9}));leaf.position.set(t.position.x,h-2,t.position.z);scene.add(leaf);}
  scene.add(new THREE.AmbientLight(0x0a1505,0.6)); _addDl(scene,0x88cc44,0.5,30,5,15,true);
  _addPl(scene,0x44ff22,0.5,20,0,5,0);
}
function _cloudRaceArena(scene){
  scene.background=new THREE.Color(0x88bbff); scene.fog=new THREE.Fog(0xaaddff,20,80);
  for(let i=0;i<25;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.9,transparent:true,opacity:0.85}));c.position.set((Math.random()-0.5)*70,Math.random()*10,(Math.random()-0.5)*70);scene.add(c);}
  const gMat=new THREE.MeshBasicMaterial({color:0xffcc00});
  for(let i=0;i<8;i++){const g=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.2,8,24),gMat);g.position.set((i-4)*8,2+Math.sin(i)*2,0);scene.add(g);_addPl(scene,0xffcc00,0.6,8,(i-4)*8,2,0);}
  scene.add(new THREE.AmbientLight(0x8899cc,0.9)); _addDl(scene,0xffffff,1.0,30,10,20,true);
}
function _nightPatrolArena(scene){
  scene.background=new THREE.Color(0x02020a); scene.fog=new THREE.Fog(0x02020a,20,80);
  const bMat=new THREE.MeshStandardMaterial({color:0x0a0a18,roughness:0.4,metalness:0.7});
  for(let i=0;i<12;i++){const h=6+Math.random()*14;const b=new THREE.Mesh(new THREE.BoxGeometry(4+Math.random()*4,h,4+Math.random()*4),bMat);b.position.set((Math.random()-0.5)*60,h/2,(Math.random()-0.5)*60);scene.add(b);}
  for(let i=0;i<8;i++)_addPl(scene,0xffaa44,0.5,8,(Math.random()-0.5)*50,3+Math.random()*5,(Math.random()-0.5)*50);
  scene.add(new THREE.AmbientLight(0x020208,0.3)); _addDl(scene,0x2244aa,0.3,30,0,15,false);
}
function _desertAirArena(scene){
  scene.background=new THREE.Color(0x5a3010); scene.fog=new THREE.Fog(0x5a3010,25,90);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xd49a40,roughness:1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-8; scene.add(gnd);
  for(let i=0;i<10;i++){const h=3+Math.random()*5;const p=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,h,4),new THREE.MeshBasicMaterial({color:i%2===0?0xff2200:0xffffff}));p.position.set((i-5)*8,h/2-6,(Math.random()-0.5)*5);scene.add(p);}
  scene.add(new THREE.AmbientLight(0x4a2808,0.7)); _addDl(scene,0xffcc66,1.0,30,15,20,true);
  _addPl(scene,0xff8800,0.6,25,0,5,0);
}
function _mountainPassArena(scene){
  scene.background=new THREE.Color(0x99aacc); scene.fog=new THREE.Fog(0x99aacc,15,60);
  const mMat=new THREE.MeshStandardMaterial({color:0x556677,roughness:0.95});
  for(let i=0;i<12;i++){const h=10+Math.random()*15;const m=new THREE.Mesh(new THREE.ConeGeometry(4+Math.random()*5,h,7),mMat);m.position.set((Math.random()-0.5)*70,h/2-8,(Math.random()-0.5)*70);scene.add(m);}
  scene.add(new THREE.AmbientLight(0x8899aa,0.8)); _addDl(scene,0xffffff,0.8,30,10,20,true);
  _addPl(scene,0x8899cc,0.5,20,0,5,0);
}
function _glacierFlyoverArena(scene){
  scene.background=new THREE.Color(0x99ccff); scene.fog=new THREE.Fog(0xbbddff,20,80);
  const gMat=new THREE.MeshStandardMaterial({color:0x66aadd,roughness:0.1,metalness:0.2,transparent:true,opacity:0.85});
  for(let i=0;i<10;i++){const g=new THREE.Mesh(new THREE.BoxGeometry(10+Math.random()*10,4+Math.random()*6,8+Math.random()*8),gMat);g.position.set((Math.random()-0.5)*60,-2+Math.random()*2,(Math.random()-0.5)*60);scene.add(g);}
  scene.add(new THREE.AmbientLight(0x8899bb,0.9)); _addDl(scene,0xffffff,0.9,30,10,20,true);
  _addPl(scene,0x4499ff,0.5,20,0,5,0);
}
function _typhoonArena(scene){
  scene.background=new THREE.Color(0x0a0a18); scene.fog=new THREE.FogExp2(0x0d0d20,0.04);
  for(let i=0;i<30;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*4),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.9,transparent:true,opacity:0.7}));const a=i/30*Math.PI*2;const r=5+i*1.5;c.position.set(Math.cos(a)*r,Math.sin(i*0.5)*2,Math.sin(a)*r);scene.add(c);}
  scene.add(new THREE.AmbientLight(0x080810,0.4)); _addPl(scene,0x4488ff,1.0,30,0,5,0);
  for(let i=0;i<5;i++)_addPl(scene,0x2244aa,0.5,10,(Math.random()-0.5)*20,3,(Math.random()-0.5)*20);
}
function _alienPlanetArena(scene){
  scene.background=new THREE.Color(0x180820); scene.fog=new THREE.FogExp2(0x1a0a22,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x2a0a35,roughness:1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-8; scene.add(gnd);
  for(let i=0;i<8;i++){const h=5+Math.random()*10;const r=new THREE.Mesh(new THREE.CylinderGeometry(1+Math.random()*2,1,h,5),new THREE.MeshStandardMaterial({color:0x4a1a55,roughness:0.8}));r.position.set((Math.random()-0.5)*60,h/2-7,(Math.random()-0.5)*60);scene.add(r);}
  for(let i=0;i<15;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.3+Math.random()*1),new THREE.MeshBasicMaterial({color:0xaa44ff}));s.position.set((Math.random()-0.5)*50,Math.random()*5-3,(Math.random()-0.5)*50);scene.add(s);_addPl(scene,0xaa44ff,0.3,4,s.position.x,s.position.y,s.position.z);}
  scene.add(new THREE.AmbientLight(0x100815,0.4)); _addDl(scene,0xaa44ff,0.4,30,5,12,false);
  _addPl(scene,0xcc44ff,0.8,25,0,5,0);
}
function _fireworksArena(scene){
  scene.background=new THREE.Color(0x020208);
  for(let i=0;i<200;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.04),new THREE.MeshBasicMaterial({color:0xffffff}));s.position.set((Math.random()-0.5)*120,(Math.random()-0.5)*80,(Math.random()-0.5)*120);scene.add(s);}
  const colors=[0xff0044,0xff8800,0x00ff88,0x00aaff,0xff44ff,0xffff00];
  for(let i=0;i<12;i++){const c=colors[i%6];_addPl(scene,c,1.0,10,(Math.random()-0.5)*40,3+Math.random()*6,(Math.random()-0.5)*40);}
  scene.add(new THREE.AmbientLight(0x020205,0.3)); _addDl(scene,0xffeedd,0.4,30,0,10,false);
}
function _cloudFortressArena(scene){
  scene.background=new THREE.Color(0xaaccff); scene.fog=new THREE.Fog(0xbbddff,15,60);
  for(let i=0;i<20;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(4+Math.random()*6),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.9}));c.position.set((Math.random()-0.5)*60,Math.random()*5,(Math.random()-0.5)*60);scene.add(c);}
  const fMat=new THREE.MeshStandardMaterial({color:0xddccaa,roughness:0.7});
  const fort=new THREE.Mesh(new THREE.BoxGeometry(12,8,12),fMat); fort.position.set(0,4,0); scene.add(fort);
  for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,12,8),fMat);const a=i*Math.PI/2;t.position.set(Math.cos(a)*7,6,Math.sin(a)*7);scene.add(t);}
  scene.add(new THREE.AmbientLight(0x8899cc,0.9)); _addDl(scene,0xffffff,0.9,30,10,20,true);
}
function _droneLeagueArena(scene){
  scene.background=new THREE.Color(0x050510); scene.fog=new THREE.Fog(0x050510,20,80);
  const colors=[0xff0088,0x00ffaa,0xffaa00,0x4488ff];
  for(let i=0;i<12;i++){const c=colors[i%4];const g=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.2,8,24),new THREE.MeshBasicMaterial({color:c}));g.position.set((Math.random()-0.5)*40,1+Math.random()*4,(i-6)*5);scene.add(g);_addPl(scene,c,0.6,8,g.position.x,g.position.y,g.position.z);}
  scene.add(new THREE.AmbientLight(0x050510,0.3)); _addDl(scene,0xffeedd,0.5,30,0,10,false);
  _addPl(scene,0xffffff,0.5,20,0,5,0);
}
function _coastalRescueArena(scene){
  scene.background=new THREE.Color(0x1a3050); scene.fog=new THREE.Fog(0x1a3050,20,80);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a4060,roughness:0.1,metalness:0.3});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(80,80),wMat); water.rotation.x=-Math.PI/2; water.position.y=-5; scene.add(water);
  const rMat=new THREE.MeshBasicMaterial({color:0xff2200});
  for(let i=0;i<6;i++){const r=new THREE.Mesh(new THREE.SphereGeometry(0.4),rMat);r.position.set((Math.random()-0.5)*40,0+Math.random()*2,(Math.random()-0.5)*40);scene.add(r);_addPl(scene,0xff2200,0.8,6,r.position.x,r.position.y+1,r.position.z);}
  scene.add(new THREE.AmbientLight(0x1a2030,0.6)); _addDl(scene,0x88aacc,0.5,30,5,15,true);
  _addPl(scene,0x4488cc,0.5,20,0,5,0);
}
function _warpGateArena(scene){
  scene.background=new THREE.Color(0x000000);
  for(let i=0;i<150;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.06),new THREE.MeshBasicMaterial({color:0xffffff}));s.position.set((Math.random()-0.5)*120,(Math.random()-0.5)*80,(Math.random()-0.5)*120);scene.add(s);}
  const colors=[0xff00ff,0x00ffff,0xff8800,0x44ff44];
  for(let i=0;i<12;i++){const c=colors[i%4];const g=new THREE.Mesh(new THREE.TorusGeometry(3,0.3,8,32),new THREE.MeshBasicMaterial({color:c}));g.position.set(0,0,(i-6)*8);g.rotation.y=Math.PI/2;scene.add(g);_addPl(scene,c,0.8,8,0,0,(i-6)*8);}
  scene.add(new THREE.AmbientLight(0x050510,0.3));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20 WALKER ARENAS
// ═══════════════════════════════════════════════════════════════════════════════
function _pipelineCrawlArena(scene){
  scene.background=new THREE.Color(0x0a0810); scene.fog=new THREE.FogExp2(0x0d0a12,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1520,roughness:0.6,metalness:0.5}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const pMat=new THREE.MeshStandardMaterial({color:0x335566,roughness:0.4,metalness:0.8});
  [[-20,3,-5],[0,5,10],[15,2,-8],[-8,7,5]].forEach(([x,y,z])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,30,12),pMat);p.rotation.z=Math.PI/4;p.position.set(x,y,z);scene.add(p);});
  scene.add(new THREE.AmbientLight(0x050408,0.3)); _addDl(scene,0x4466aa,0.4,30,0,10,true);
  [[-10,4,0],[8,6,8]].forEach(([x,y,z])=>_addPl(scene,0xffaa44,0.6,8,x,y,z));
}
function _templeClimbArena(scene){
  scene.background=new THREE.Color(0x080608); scene.fog=new THREE.FogExp2(0x100810,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1218,roughness:0.95}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const sMat=new THREE.MeshStandardMaterial({color:0x2a2235,roughness:0.9});
  for(let i=0;i<8;i++){const h=2+i*0.8;const s=new THREE.Mesh(new THREE.BoxGeometry(8-i*0.5,1,8-i*0.5),sMat);s.position.set(0,h,0);scene.add(s);}
  const tMat=new THREE.MeshBasicMaterial({color:0xff8800});
  for(let i=0;i<8;i++){const t=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,0.8,6),tMat);t.position.set((Math.random()-0.5)*30,0.4,(Math.random()-0.5)*30);scene.add(t);_addPl(scene,0xff6600,0.6,4,t.position.x,1,t.position.z);}
  scene.add(new THREE.AmbientLight(0x080508,0.3)); _addDl(scene,0x886644,0.5,30,5,10,true);
}
function _collapsedBuildingArena(scene){
  scene.background=new THREE.Color(0x080808); scene.fog=new THREE.FogExp2(0x0d0d0d,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const dMat=new THREE.MeshStandardMaterial({color:0x333333,roughness:0.9});
  for(let i=0;i<20;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1+Math.random()*4,0.5+Math.random()*2,1+Math.random()*4),dMat);s.position.set((Math.random()-0.5)*50,Math.random()*3,(Math.random()-0.5)*50);s.rotation.y=Math.random()*Math.PI;scene.add(s);}
  const rMat=new THREE.MeshBasicMaterial({color:0xff2200});
  for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.SphereGeometry(0.3),rMat);r.position.set((Math.random()-0.5)*30,1,(Math.random()-0.5)*30);scene.add(r);_addPl(scene,0xff2200,0.8,5,r.position.x,1.5,r.position.z);}
  scene.add(new THREE.AmbientLight(0x080808,0.3)); _addDl(scene,0x8888aa,0.3,30,5,10,true);
  for(let i=0;i<3;i++)_addPl(scene,0xffaa44,0.5,8,(Math.random()-0.5)*20,2,(Math.random()-0.5)*20);
}
function _militaryBaseArena(scene){
  scene.background=new THREE.Color(0x0a1005); scene.fog=new THREE.FogExp2(0x0d1508,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2510,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const fMat=new THREE.MeshStandardMaterial({color:0x3a5520,roughness:0.9});
  for(let i=0;i<8;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(12,3,0.5),fMat);w.position.set((Math.random()-0.5)*30,1.5,(Math.random()-0.5)*30);w.rotation.y=Math.random()*Math.PI;scene.add(w);}
  const lMat=new THREE.MeshBasicMaterial({color:0xff2200});
  for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,15),lMat);l.position.set((Math.random()-0.5)*15,0.3+Math.random()*1.5,(Math.random()-0.5)*15);l.rotation.y=Math.random()*Math.PI;scene.add(l);}
  scene.add(new THREE.AmbientLight(0x0a1005,0.4)); _addDl(scene,0x44aa22,0.5,30,5,12,true);
}
function _factoryFloorArena(scene){
  scene.background=new THREE.Color(0x050508); scene.fog=new THREE.Fog(0x050508,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1a22,roughness:0.4,metalness:0.6}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const mMat=new THREE.MeshStandardMaterial({color:0x334455,roughness:0.4,metalness:0.7});
  for(let i=0;i<4;i++){const arm=new THREE.Mesh(new THREE.BoxGeometry(0.4,4,0.4),mMat);arm.position.set((i-1.5)*10,2,0);scene.add(arm);}
  for(let i=0;i<3;i++){const belt=new THREE.Mesh(new THREE.BoxGeometry(20,0.3,2),new THREE.MeshStandardMaterial({color:0x222233,roughness:0.5,metalness:0.4}));belt.position.set(0,0.15,(i-1)*8);scene.add(belt);}
  scene.add(new THREE.AmbientLight(0x050508,0.5)); _addDl(scene,0xffeecc,0.7,30,0,10,true);
  [[-10,4,0],[10,4,8],[0,4,-8]].forEach(([x,y,z])=>_addPl(scene,0xffcc44,0.6,10,x,y,z));
}
function _spaceEvaArena(scene){
  scene.background=new THREE.Color(0x000005);
  for(let i=0;i<200;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.05),new THREE.MeshBasicMaterial({color:0xffffff}));s.position.set((Math.random()-0.5)*150,(Math.random()-0.5)*80,(Math.random()-0.5)*150);scene.add(s);}
  const hMat=new THREE.MeshStandardMaterial({color:0x334455,roughness:0.4,metalness:0.8});
  const hull=new THREE.Mesh(new THREE.CylinderGeometry(4,4,30,12),hMat); hull.rotation.z=Math.PI/2; hull.position.set(0,0,0); scene.add(hull);
  scene.add(new THREE.AmbientLight(0x050510,0.4)); _addDl(scene,0xffffff,1.2,30,20,10,true);
  _addPl(scene,0x4488ff,0.5,20,0,5,0);
}
function _hospitalWalkArena(scene){
  scene.background=new THREE.Color(0x050508); scene.fog=new THREE.Fog(0x050508,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xf0f0f5,roughness:0.2}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0xe8e8f0,roughness:0.2});
  for(let i=0;i<6;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(0.3,4,15),wMat);w.position.set((i-2.5)*8,2,0);scene.add(w);}
  const bMat=new THREE.MeshStandardMaterial({color:0x88aacc,roughness:0.6});
  for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(2,0.8,3.5),bMat);b.position.set((i-1.5)*12,0.4,5);scene.add(b);}
  scene.add(new THREE.AmbientLight(0x888899,0.9)); _addDl(scene,0xffffff,0.8,30,0,10,true);
  _addPl(scene,0xff2200,0.6,12,8,3,8);
}
function _mineShaftArena(scene){
  scene.background=new THREE.Color(0x050308); scene.fog=new THREE.FogExp2(0x080510,0.06);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1015,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const sMat=new THREE.MeshStandardMaterial({color:0x2a2030,roughness:0.95});
  for(let i=0;i<5;i++){const col=new THREE.Mesh(new THREE.BoxGeometry(0.3,6,0.3),sMat);col.position.set((i-2)*4,3,0);scene.add(col);const beam=new THREE.Mesh(new THREE.BoxGeometry(4,0.3,0.3),sMat);beam.position.set(0,6,i*5-10);scene.add(beam);}
  for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(0.2),new THREE.MeshBasicMaterial({color:0xffaa44}));l.position.set((Math.random()-0.5)*20,0.3,(Math.random()-0.5)*30);scene.add(l);_addPl(scene,0xffaa44,0.5,4,l.position.x,1,l.position.z);}
  scene.add(new THREE.AmbientLight(0x050308,0.2)); _addPl(scene,0xffaa44,0.8,15,0,3,0);
}
function _urbanObstacleArena(scene){
  scene.background=new THREE.Color(0x0a0a12); scene.fog=new THREE.Fog(0x0a0a12,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x151520,roughness:0.6}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x222235,roughness:0.6,metalness:0.3});
  for(let i=0;i<10;i++){const h=2+Math.random()*5;const b=new THREE.Mesh(new THREE.BoxGeometry(2+Math.random()*3,h,2+Math.random()*3),bMat);b.position.set((Math.random()-0.5)*40,h/2,(Math.random()-0.5)*40);scene.add(b);}
  for(let i=0;i<3;i++){const sc=new THREE.Mesh(new THREE.BoxGeometry(4,0.2,1),new THREE.MeshStandardMaterial({color:0x445566,metalness:0.7}));sc.position.set((i-1)*8,3+i*0.5,5);scene.add(sc);}
  scene.add(new THREE.AmbientLight(0x080810,0.4)); _addDl(scene,0x4466aa,0.4,30,0,12,true);
  [[-10,4,0],[10,4,8]].forEach(([x,y,z])=>_addPl(scene,0xffcc44,0.5,8,x,y,z));
}
function _colosseumArena(scene){
  scene.background=new THREE.Color(0x1a0a04); scene.fog=new THREE.Fog(0x1a0a04,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x8a6a40,roughness:0.9}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const pMat=new THREE.MeshStandardMaterial({color:0xc8a870,roughness:0.8});
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const p=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,8,8),pMat);p.position.set(Math.cos(a)*18,4,Math.sin(a)*18);scene.add(p);}
  for(let i=0;i<6;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,6,8),pMat);p.position.set((Math.random()-0.5)*15,3,(Math.random()-0.5)*15);scene.add(p);}
  scene.add(new THREE.AmbientLight(0x2a1504,0.5)); _addDl(scene,0xffcc88,0.8,30,10,15,true);
  _addPl(scene,0xff8800,0.6,20,0,5,0);
}
function _volcanicClimbArena(scene){
  scene.background=new THREE.Color(0x1a0500); scene.fog=new THREE.FogExp2(0x200800,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshBasicMaterial({color:0xff3300}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-3; scene.add(gnd);
  const rMat=new THREE.MeshStandardMaterial({color:0x2a1000,roughness:1});
  for(let i=0;i<10;i++){const h=3+i*0.8;const r=new THREE.Mesh(new THREE.CylinderGeometry(0.8+i*0.15,1.5,h,7),rMat);r.position.set((Math.random()-0.5)*20,h/2-2,(Math.random()-0.5)*20);scene.add(r);}
  scene.add(new THREE.AmbientLight(0x200800,0.4)); _addDl(scene,0xff6600,0.6,30,5,12,true);
  _addPl(scene,0xff2200,1.5,40,0,1,0);
}
function _bambooForestArena(scene){
  scene.background=new THREE.Color(0x0a1505); scene.fog=new THREE.FogExp2(0x0d1a08,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a3010,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const bMat=new THREE.MeshStandardMaterial({color:0x5a8a20,roughness:0.8});
  for(let i=0;i<40;i++){const h=6+Math.random()*5;const b=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,h,6),bMat);b.position.set((Math.random()-0.5)*50,h/2,(Math.random()-0.5)*50);scene.add(b);}
  scene.add(new THREE.AmbientLight(0x0a1505,0.6)); _addDl(scene,0x88cc44,0.5,30,5,15,true);
  _addPl(scene,0x44ff22,0.4,15,0,4,0);
}
function _icePalaceArena(scene){
  scene.background=new THREE.Color(0x88aacc); scene.fog=new THREE.Fog(0xaaccee,15,60);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x99ccff,roughness:0.05,metalness:0.2}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const iMat=new THREE.MeshStandardMaterial({color:0xaaddff,roughness:0.05,metalness:0.2,transparent:true,opacity:0.8});
  for(let i=0;i<8;i++){const h=3+i*0.5;const c=new THREE.Mesh(new THREE.BoxGeometry(3-i*0.2,h,3-i*0.2),iMat);c.position.set(0,h/2,0);scene.add(c);}
  for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,8,8),iMat);p.position.set((Math.random()-0.5)*40,4,(Math.random()-0.5)*40);scene.add(p);}
  scene.add(new THREE.AmbientLight(0x8899bb,0.9)); _addDl(scene,0xffffff,0.9,30,10,20,true);
  _addPl(scene,0x4499ff,0.5,20,0,5,0);
}
function _robotMuseumArena(scene){
  scene.background=new THREE.Color(0x050508); scene.fog=new THREE.Fog(0x050508,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xddccaa,roughness:0.2}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const sMat=new THREE.MeshStandardMaterial({color:0x335577,roughness:0.4,metalness:0.7});
  for(let i=0;i<6;i++){const h=4+Math.random()*6;const s=new THREE.Mesh(new THREE.BoxGeometry(2,h,2),sMat);s.position.set((i-2.5)*10,h/2,0);scene.add(s);const head=new THREE.Mesh(new THREE.SphereGeometry(1),sMat);head.position.set((i-2.5)*10,h,0);scene.add(head);_addPl(scene,0x4488ff,0.5,8,(i-2.5)*10,h+1,0);}
  scene.add(new THREE.AmbientLight(0x080810,0.5)); _addDl(scene,0xffeedd,0.8,30,5,15,true);
}
function _sewersArena(scene){
  scene.background=new THREE.Color(0x050308); scene.fog=new THREE.FogExp2(0x080510,0.06);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1520,roughness:0.6,metalness:0.3}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x2a2535,roughness:0.7,metalness:0.3});
  for(let i=0;i<8;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(8,4,0.4),wMat);w.position.set((Math.random()-0.5)*30,2,(Math.random()-0.5)*30);w.rotation.y=Math.random()*Math.PI;scene.add(w);}
  const wMat2=new THREE.MeshBasicMaterial({color:0x336633,transparent:true,opacity:0.6});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(80,80),wMat2); water.rotation.x=-Math.PI/2; water.position.y=0.05; scene.add(water);
  scene.add(new THREE.AmbientLight(0x050308,0.3)); _addPl(scene,0xffaa44,0.6,10,0,2,0);
  [[-10,2,5],[8,2,-8]].forEach(([x,y,z])=>_addPl(scene,0x44ff66,0.4,6,x,y,z));
}
function _skyGardenArena(scene){
  scene.background=new THREE.Color(0x88aacc); scene.fog=new THREE.Fog(0xaaccee,20,80);
  const fMat=new THREE.MeshStandardMaterial({color:0x228833,roughness:0.9});
  for(let i=0;i<12;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(3+Math.random()*3,0.3,3+Math.random()*3),fMat);p.position.set((Math.random()-0.5)*40,Math.random()*5,(Math.random()-0.5)*40);scene.add(p);
  const f=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,1.5+Math.random()*2,5),new THREE.MeshStandardMaterial({color:0xf472b6}));f.position.set(p.position.x,p.position.y+1,p.position.z);scene.add(f);}
  scene.add(new THREE.AmbientLight(0x8899cc,0.9)); _addDl(scene,0xffffff,0.9,30,10,20,true);
  _addPl(scene,0x88ff88,0.4,15,0,5,0);
}
function _cargoShipArena(scene){
  scene.background=new THREE.Color(0x0a1520); scene.fog=new THREE.Fog(0x0a1520,20,70);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a1a28,roughness:0.1,metalness:0.4}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-3; scene.add(gnd);
  const hMat=new THREE.MeshStandardMaterial({color:0x334455,roughness:0.4,metalness:0.7});
  const hull=new THREE.Mesh(new THREE.BoxGeometry(12,2,40),hMat); hull.position.set(0,-1,0); scene.add(hull);
  const cMat=new THREE.MeshStandardMaterial({color:0x883322,roughness:0.8});
  for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(3,3,3),cMat);c.position.set((Math.random()-0.5)*8,1.5+Math.random()*1,(i-2.5)*6);scene.add(c);}
  scene.add(new THREE.AmbientLight(0x0a1520,0.5)); _addDl(scene,0x4488cc,0.4,30,5,12,true);
  _addPl(scene,0xffaa44,0.5,12,0,4,0);
}
function _hauntedMansionArena(scene){
  scene.background=new THREE.Color(0x050308); scene.fog=new THREE.FogExp2(0x0a0510,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0f0d10,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a1520,roughness:0.9});
  for(let i=0;i<8;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.4),wMat);w.position.set((Math.random()-0.5)*25,2.5,(Math.random()-0.5)*25);w.rotation.y=Math.floor(Math.random()*4)*Math.PI/2;scene.add(w);}
  for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(0.15),new THREE.MeshBasicMaterial({color:0xffcc44}));c.position.set((Math.random()-0.5)*30,1.5+Math.random(),(Math.random()-0.5)*30);scene.add(c);_addPl(scene,0xffcc44,0.4,4,c.position.x,c.position.y,c.position.z);}
  scene.add(new THREE.AmbientLight(0x050308,0.3)); _addDl(scene,0x6655aa,0.3,30,3,10,true);
  _addPl(scene,0x8800ff,0.5,20,0,4,0);
}
function _caveOfWondersArena(scene){
  scene.background=new THREE.Color(0x050308); scene.fog=new THREE.FogExp2(0x080510,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a1020,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const colors=[0xffd700,0xaa44ff,0x44ffaa,0xff4488];
  for(let i=0;i<20;i++){const c=colors[i%4];const g=new THREE.Mesh(new THREE.OctahedronGeometry(0.3+Math.random()*0.5),new THREE.MeshBasicMaterial({color:c}));g.position.set((Math.random()-0.5)*40,0.5+Math.random()*2,(Math.random()-0.5)*40);scene.add(g);_addPl(scene,c,0.4,4,g.position.x,g.position.y+0.5,g.position.z);}
  for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(3,0.2,3),new THREE.MeshStandardMaterial({color:0x2a2030}));b.position.set((Math.random()-0.5)*20,0.5+Math.random()*2,(Math.random()-0.5)*20);scene.add(b);}
  scene.add(new THREE.AmbientLight(0x050308,0.3)); _addPl(scene,0xffd700,0.8,20,0,4,0);
}
function _cyberDungeonArena(scene){
  scene.background=new THREE.Color(0x000010); scene.fog=new THREE.FogExp2(0x000015,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x050520,roughness:0.1,metalness:0.9}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x0a0a30,roughness:0.2,metalness:0.8});
  for(let i=0;i<10;i++){const h=3+Math.random()*4;const w=new THREE.Mesh(new THREE.BoxGeometry(6,h,0.4),wMat);w.position.set((Math.random()-0.5)*30,h/2,(Math.random()-0.5)*30);w.rotation.y=Math.floor(Math.random()*4)*Math.PI/2;scene.add(w);}
  const gMat=new THREE.MeshBasicMaterial({color:0x00ffcc});
  for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,8),gMat);l.position.set((Math.random()-0.5)*20,0.2+Math.random()*1.5,(Math.random()-0.5)*20);l.rotation.y=Math.random()*Math.PI;scene.add(l);}
  scene.add(new THREE.AmbientLight(0x000010,0.3)); _addDl(scene,0x4444ff,0.3,30,0,10,false);
  _addPl(scene,0x00ffcc,0.8,20,0,3,0); _addPl(scene,0xff00cc,0.5,12,10,2,-10);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20 UNDERWATER ARENAS
// ═══════════════════════════════════════════════════════════════════════════════
function _coralReefSurveyArena(scene){ _coralReefArena(scene); }
function _shipwreckArena(scene){
  scene.background=new THREE.Color(0x051015); scene.fog=new THREE.FogExp2(0x061218,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2810,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const hMat=new THREE.MeshStandardMaterial({color:0x3a2a10,roughness:0.9,metalness:0.3});
  const hull=new THREE.Mesh(new THREE.BoxGeometry(10,4,30),hMat); hull.position.set(0,2,-5); hull.rotation.z=0.2; scene.add(hull);
  const mMat=new THREE.MeshStandardMaterial({color:0x4a3820,roughness:0.9});
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,12,8),mMat); mast.position.set(0,8,-5); scene.add(mast);
  for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(0.3),new THREE.MeshBasicMaterial({color:0x00ffcc}));c.position.set((Math.random()-0.5)*30,0.5,(Math.random()-0.5)*30);scene.add(c);_addPl(scene,0x00aacc,0.3,4,c.position.x,1,c.position.z);}
  scene.add(new THREE.AmbientLight(0x051015,0.4)); _addDl(scene,0x0088aa,0.4,30,5,10,true);
  _addPl(scene,0x0066aa,0.5,25,0,5,0);
}
function _deepTrenchCourseArena(scene){ _deepTrenchArena(scene); }
function _hydrothermalArena(scene){
  scene.background=new THREE.Color(0x0a0800); scene.fog=new THREE.FogExp2(0x0d0a00,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x2a1a00,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  for(let i=0;i<10;i++){const h=2+Math.random()*5;const v=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.8,h,8),new THREE.MeshStandardMaterial({color:0x2a1a00,roughness:0.8}));v.position.set((Math.random()-0.5)*50,h/2,(Math.random()-0.5)*50);scene.add(v);_addPl(scene,0xff8800,0.8,6,v.position.x,h+0.5,v.position.z);}
  scene.add(new THREE.AmbientLight(0x0a0800,0.3)); _addDl(scene,0xff6600,0.4,30,0,10,true);
  _addPl(scene,0xff4400,1.0,30,0,2,0);
}
function _subCanyonArena(scene){
  scene.background=new THREE.Color(0x051520); scene.fog=new THREE.FogExp2(0x061820,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2030,roughness:1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-5; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a3040,roughness:0.9});
  [[-15,10,4,25],[15,10,4,25]].forEach(([x,y,w,h])=>{const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,30),wMat);wall.position.set(x,0,0);scene.add(wall);});
  scene.add(new THREE.AmbientLight(0x051520,0.4)); _addDl(scene,0x0088cc,0.4,30,0,10,true);
  _addPl(scene,0x00aaff,0.6,25,0,5,0);
}
function _iceShelfArena(scene){
  scene.background=new THREE.Color(0x88aacc); scene.fog=new THREE.Fog(0xaaccee,15,60);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a1a2a,roughness:0.1,metalness:0.3}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-3; scene.add(gnd);
  const iMat=new THREE.MeshStandardMaterial({color:0xaaddff,roughness:0.05,transparent:true,opacity:0.85});
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(80,80),iMat); ceil.rotation.x=Math.PI/2; ceil.position.y=6; scene.add(ceil);
  for(let i=0;i<15;i++){const l=1+Math.random()*3;const s=new THREE.Mesh(new THREE.ConeGeometry(0.3,l,6),iMat);s.rotation.x=Math.PI;s.position.set((Math.random()-0.5)*50,6-l/2,(Math.random()-0.5)*50);scene.add(s);}
  scene.add(new THREE.AmbientLight(0x8899bb,0.7)); _addDl(scene,0xaaccff,0.5,30,5,10,true);
  _addPl(scene,0x4499ff,0.5,20,0,3,0);
}
function _currentMazeArena(scene){
  scene.background=new THREE.Color(0x051015); scene.fog=new THREE.FogExp2(0x061218,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2030,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a3040,roughness:0.9});
  for(let i=0;i<6;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(0.5,5,12),wMat);w.position.set((Math.random()-0.5)*25,2.5,(Math.random()-0.5)*25);scene.add(w);}
  for(let i=0;i<8;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(0.2),new THREE.MeshBasicMaterial({color:0x00ffcc}));b.position.set((Math.random()-0.5)*30,1+Math.random()*3,(Math.random()-0.5)*30);scene.add(b);_addPl(scene,0x00aacc,0.3,4,b.position.x,b.position.y,b.position.z);}
  scene.add(new THREE.AmbientLight(0x051015,0.4)); _addDl(scene,0x0088cc,0.4,30,0,10,true);
  _addPl(scene,0x00aaff,0.5,20,0,3,0);
}
function _whaleRouteArena(scene){
  scene.background=new THREE.Color(0x051a28); scene.fog=new THREE.Fog(0x071e2c,20,80);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2a3a,roughness:1}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-8; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x334466,roughness:0.4,metalness:0.1});
  const whale=new THREE.Mesh(new THREE.SphereGeometry(4,8,6),wMat); whale.scale.set(2.5,1,1); whale.position.set(-15,2,5); scene.add(whale);
  scene.add(new THREE.AmbientLight(0x051a28,0.5)); _addDl(scene,0x0088cc,0.4,30,5,10,true);
  _addPl(scene,0x00aaff,0.5,25,0,3,0);
}
function _bioluminescentArena(scene){
  scene.background=new THREE.Color(0x020510); scene.fog=new THREE.FogExp2(0x030612,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a0820,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const colors=[0x4488ff,0x44ffcc,0xaa44ff,0x44ff88];
  for(let i=0;i<30;i++){const c=colors[i%4];const s=new THREE.Mesh(new THREE.SphereGeometry(0.2+Math.random()*0.4),new THREE.MeshBasicMaterial({color:c}));s.position.set((Math.random()-0.5)*50,0.3+Math.random()*3,(Math.random()-0.5)*50);scene.add(s);_addPl(scene,c,0.3,4,s.position.x,s.position.y,s.position.z);}
  scene.add(new THREE.AmbientLight(0x020510,0.2));
}
function _pirateWreckArena(scene){
  scene.background=new THREE.Color(0x051015); scene.fog=new THREE.FogExp2(0x061218,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2810,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  for(let i=0;i<3;i++){const hMat=new THREE.MeshStandardMaterial({color:0x3a2a10,roughness:0.9});const hull=new THREE.Mesh(new THREE.BoxGeometry(6,3,18),hMat);hull.position.set((i-1)*15,1.5,(Math.random()-0.5)*20);hull.rotation.y=Math.random()*0.5;scene.add(hull);}
  for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xcc9900,roughness:0.5,metalness:0.6}));c.position.set((Math.random()-0.5)*40,0.5,(Math.random()-0.5)*40);scene.add(c);_addPl(scene,0xffcc00,0.5,5,c.position.x,1,c.position.z);}
  scene.add(new THREE.AmbientLight(0x051015,0.4)); _addDl(scene,0x0088aa,0.4,30,5,10,true);
}
function _underseaVolcanoArena(scene){
  scene.background=new THREE.Color(0x0a0800); scene.fog=new THREE.FogExp2(0x0d0a00,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a0a00,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const vMat=new THREE.MeshStandardMaterial({color:0x2a1000,roughness:0.9});
  const vol=new THREE.Mesh(new THREE.ConeGeometry(12,10,8),vMat); vol.position.set(0,5,0); scene.add(vol);
  const lMat=new THREE.MeshBasicMaterial({color:0xff3300});
  for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(3,0.15,3),lMat);l.position.set((Math.random()-0.5)*20,0.05,(Math.random()-0.5)*20);scene.add(l);_addPl(scene,0xff4400,0.8,6,l.position.x,0.5,l.position.z);}
  scene.add(new THREE.AmbientLight(0x0a0800,0.3)); _addDl(scene,0xff6600,0.6,30,5,12,true);
  _addPl(scene,0xff2200,1.5,40,0,6,0);
}
function _seagrassArena(scene){
  scene.background=new THREE.Color(0x0a2010); scene.fog=new THREE.FogExp2(0x0d2512,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a3015,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const gMat=new THREE.MeshStandardMaterial({color:0x1a6a20,roughness:0.8});
  for(let i=0;i<60;i++){const h=1+Math.random()*3;const g=new THREE.Mesh(new THREE.BoxGeometry(0.1,h,0.1),gMat);g.position.set((Math.random()-0.5)*60,h/2,(Math.random()-0.5)*60);scene.add(g);}
  scene.add(new THREE.AmbientLight(0x0a2010,0.6)); _addDl(scene,0x44cc44,0.5,30,0,10,true);
  _addPl(scene,0x44ff22,0.5,20,0,4,0);
}
function _tidalCaveArena(scene){
  scene.background=new THREE.Color(0x051015); scene.fog=new THREE.FogExp2(0x061218,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2820,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const rMat=new THREE.MeshStandardMaterial({color:0x1a2830,roughness:0.9});
  for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(0.5,1,2+Math.random()*3,7),rMat);s.position.set((Math.random()-0.5)*40,0.5,(Math.random()-0.5)*40);scene.add(s);}
  const wMat2=new THREE.MeshStandardMaterial({color:0x0a2030,roughness:0.1,transparent:true,opacity:0.5});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(80,80),wMat2); water.rotation.x=-Math.PI/2; water.position.y=1.5; scene.add(water);
  scene.add(new THREE.AmbientLight(0x051015,0.4)); _addDl(scene,0x0088cc,0.4,30,0,10,true);
  _addPl(scene,0x00aaff,0.5,15,0,3,0);
}
function _deepStationArena(scene){
  scene.background=new THREE.Color(0x010510); scene.fog=new THREE.FogExp2(0x020612,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a1020,roughness:0.6,metalness:0.4}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const sMat=new THREE.MeshStandardMaterial({color:0x1a2a3a,roughness:0.4,metalness:0.7});
  for(let i=0;i<4;i++){const mod=new THREE.Mesh(new THREE.CylinderGeometry(3,3,5,10),sMat);mod.rotation.z=Math.PI/2;mod.position.set((i-1.5)*12,2,0);scene.add(mod);_addPl(scene,0x00aaff,0.5,8,(i-1.5)*12,4,0);}
  scene.add(new THREE.AmbientLight(0x020510,0.4)); _addDl(scene,0x4488cc,0.4,30,0,10,true);
  _addPl(scene,0x0066ff,0.6,20,0,5,0);
}
function _squidChaseArena(scene){
  scene.background=new THREE.Color(0x051015); scene.fog=new THREE.FogExp2(0x061218,0.04);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2030,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const kMat=new THREE.MeshStandardMaterial({color:0x1a5020,roughness:0.8});
  for(let i=0;i<20;i++){const h=4+Math.random()*6;const k=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.4,h,6),kMat);k.position.set((Math.random()-0.5)*50,h/2,(Math.random()-0.5)*50);scene.add(k);}
  const sqMat=new THREE.MeshStandardMaterial({color:0xff4488,roughness:0.5});
  const sq=new THREE.Mesh(new THREE.SphereGeometry(3,8,6),sqMat); sq.scale.set(1,1.5,2); sq.position.set(15,4,5); scene.add(sq);
  scene.add(new THREE.AmbientLight(0x051015,0.4)); _addDl(scene,0x0088cc,0.4,30,0,10,true);
  _addPl(scene,0xff4488,0.6,15,15,4,5);
}
function _atlantisArena(scene){
  scene.background=new THREE.Color(0x051520); scene.fog=new THREE.FogExp2(0x061820,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x1a2830,roughness:0.4}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const pMat=new THREE.MeshStandardMaterial({color:0x4488aa,roughness:0.3,metalness:0.2});
  for(let i=0;i<16;i++){const h=3+Math.random()*5;const p=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,h,8),pMat);p.position.set((Math.random()-0.5)*40,h/2,(Math.random()-0.5)*40);scene.add(p);}
  const aMat=new THREE.MeshStandardMaterial({color:0x6aaa88,roughness:0.5});
  for(let i=0;i<5;i++){const a=new THREE.Mesh(new THREE.TorusGeometry(3,0.3,6,16),aMat);a.rotation.x=Math.PI/2;a.position.set((i-2)*10,1,(Math.random()-0.5)*10);scene.add(a);}
  scene.add(new THREE.AmbientLight(0x051520,0.5)); _addDl(scene,0x0088cc,0.4,30,5,10,true);
  _addPl(scene,0x00aaff,0.6,25,0,4,0);
}
function _eelCavernArena(scene){
  scene.background=new THREE.Color(0x030508); scene.fog=new THREE.FogExp2(0x040608,0.05);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a1020,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  const eMat=new THREE.MeshStandardMaterial({color:0x226622,roughness:0.7});
  for(let i=0;i<8;i++){const e=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,5+Math.random()*5,6),eMat);e.position.set((Math.random()-0.5)*30,2.5,(Math.random()-0.5)*30);e.rotation.z=0.3+Math.random()*0.4;scene.add(e);_addPl(scene,0xffff00,0.6,5,e.position.x,e.position.y,e.position.z);}
  scene.add(new THREE.AmbientLight(0x030508,0.3)); _addDl(scene,0x004488,0.3,30,0,10,true);
  _addPl(scene,0xffff00,0.4,15,0,3,0);
}
function _tsunamiArena(scene){
  scene.background=new THREE.Color(0x051520); scene.fog=new THREE.FogExp2(0x061820,0.03);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a2030,roughness:0.1,metalness:0.3}));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-2; scene.add(gnd);
  const wMat=new THREE.MeshStandardMaterial({color:0x1a4060,roughness:0.05,metalness:0.3,transparent:true,opacity:0.85});
  const wave=new THREE.Mesh(new THREE.BoxGeometry(80,15,8),wMat); wave.position.set(0,5,-25); scene.add(wave);
  scene.add(new THREE.AmbientLight(0x051520,0.5)); _addDl(scene,0x4488cc,0.5,30,0,15,true);
  _addPl(scene,0x0044ff,1.0,30,0,5,-25);
}
function _marianaArena(scene){
  scene.background=new THREE.Color(0x000005); scene.fog=new THREE.FogExp2(0x000008,0.06);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x05050a,roughness:1}));
  gnd.rotation.x=-Math.PI/2; scene.add(gnd);
  for(let i=0;i<15;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.15+Math.random()*0.2),new THREE.MeshBasicMaterial({color:0x0044ff}));s.position.set((Math.random()-0.5)*50,0.3+Math.random()*2,(Math.random()-0.5)*50);scene.add(s);_addPl(scene,0x0044ff,0.2,3,s.position.x,s.position.y,s.position.z);}
  for(let i=0;i<8;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.8,3+Math.random()*4,7),new THREE.MeshStandardMaterial({color:0x0a0810,roughness:1}));r.position.set((Math.random()-0.5)*40,1.5,(Math.random()-0.5)*40);scene.add(r);}
  scene.add(new THREE.AmbientLight(0x000005,0.15)); _addPl(scene,0x0033ff,0.5,15,0,3,0);
}

/* ════════════════════════════════════════════════════════════════════════════
   PIXAR-QUALITY STORY WORLDS
   Four fully realized miniature worlds with strong visual identities.
   Each tells its story through environment alone.
   ════════════════════════════════════════════════════════════════════════════ */

/* ── WORLD 1: POWER GARDEN ──────────────────────────────────────────────────
   Identity: Warm yellow + lime green. Giant magical sunflowers power the world.
   Story: Tiny helper robots keep the energy flowers alive.
   Palette: #ffcc00 flowers · #2d8a18 stems · #1a3a08 ground · #ffe8b0 sky
   ─────────────────────────────────────────────────────────────────────────── */
function _powerGardenArena(scene){
  scene.background=new THREE.Color(0x5aaa28);
  scene.fog=new THREE.Fog(0x88cc44,45,95);

  // Rich dark-grass ground
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(110,110,10,10),
    new THREE.MeshStandardMaterial({color:0x1a3a08,roughness:0.92}));
  gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; scene.add(gnd);

  // Dirt path for robot to follow — warm brown strip
  const path=new THREE.Mesh(new THREE.PlaneGeometry(3.5,80),
    new THREE.MeshStandardMaterial({color:0x8a5a2a,roughness:0.97}));
  path.rotation.x=-Math.PI/2; path.position.set(0,0.01,-30); scene.add(path);

  // ── GIANT SUNFLOWERS (hero elements — 6–13 units tall) ──
  const flowerData=[
    [-18,0,-32,9],[-28,0,-48,12],[20,0,-40,8],[32,0,-28,10],
    [-14,0,-58,13],[22,0,-62,7],[38,0,-55,9],[-35,0,-35,11]
  ];
  flowerData.forEach(([x,_y,z,h])=>{
    const grp=new THREE.Group(); grp.position.set(x,0,z);
    // Stem
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.22,h,8),
      new THREE.MeshStandardMaterial({color:0x2d8a18,roughness:0.8}));
    stem.position.y=h/2; stem.castShadow=true; grp.add(stem);
    // Head centre (dark disc)
    const centre=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,0.28,16),
      new THREE.MeshStandardMaterial({color:0x5a2800,roughness:0.65}));
    centre.position.y=h; grp.add(centre);
    // 10 petals fanned radially
    for(let p=0;p<10;p++){
      const ang=(p/10)*Math.PI*2;
      const petal=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.12,1.6),
        new THREE.MeshStandardMaterial({color:0xffcc00,roughness:0.45,emissive:0xffaa00,emissiveIntensity:0.15}));
      petal.position.set(Math.cos(ang)*1.55,h+0.1,Math.sin(ang)*1.55);
      petal.rotation.y=ang; grp.add(petal);
    }
    // Glowing energy crystal at head — the "power" battery
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(0.28),
      new THREE.MeshStandardMaterial({color:0xffee44,emissive:0xffcc00,emissiveIntensity:1.4,roughness:0.05,transparent:true,opacity:0.9}));
    gem.position.y=h+0.62; grp.add(gem);
    _addPl(scene,0xffcc22,1.0,7,x,h*0.9,z);
    // Gentle sway animation
    scene.userData.movers=scene.userData.movers||[];
    const phase=Math.random()*Math.PI*2, sp=0.38+Math.random()*0.28;
    scene.userData.movers.push(t=>{ grp.rotation.z=Math.sin(t*sp+phase)*0.055; gem.rotation.y=t*0.9; });
    scene.add(grp);
  });

  // ── Sprinkler arcs (large glowing arcs of water) ──
  [[6,-15],[-8,-22],[4,-35]].forEach(([x,z])=>{
    const pts=[]; for(let i=0;i<=18;i++){const a=(i/18)*Math.PI; pts.push(new THREE.Vector3(Math.cos(a)*3.5,Math.sin(a)*4,0));}
    const arc=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,0.08,7,false),
      new THREE.MeshStandardMaterial({color:0x44ddff,emissive:0x0088cc,emissiveIntensity:0.6,transparent:true,opacity:0.72}));
    arc.position.set(x,0.1,z); arc.rotation.y=Math.random()*Math.PI;
    scene.add(arc);
    scene.userData.movers=scene.userData.movers||[];
    scene.userData.movers.push(t=>{ arc.rotation.y+=0.008; });
  });

  // ── Path guidance: glowing flower buds ──
  [[0,-8],[1,-13],[-1,-19],[2,-25],[0,-31],[-2,-37],[1,-43]].forEach(([x,z])=>{
    const bud=new THREE.Mesh(new THREE.SphereGeometry(0.20,8,6),
      new THREE.MeshStandardMaterial({color:0xffee44,emissive:0xffcc00,emissiveIntensity:0.9,roughness:0.1}));
    bud.position.set(x,0.22,z); scene.add(bud);
    scene.userData.movers=scene.userData.movers||[];
    const ph=Math.random()*Math.PI*2;
    scene.userData.movers.push(t=>{ bud.position.y=0.22+Math.sin(t*2+ph)*0.06; });
  });

  // ── Background: distant hedgerow trees ──
  [[-40,-65],[40,-70],[-50,-50],[45,-40]].forEach(([x,z])=>{
    for(let i=0;i<4;i++){
      const tr=new THREE.Mesh(new THREE.SphereGeometry(2.8+Math.random(),7,6),
        new THREE.MeshStandardMaterial({color:0x1a5a0a,roughness:1}));
      tr.position.set(x+i*4.5,2.6+Math.random()*1.5,z); scene.add(tr);
    }
  });

  // ── Lighting ──
  scene.add(new THREE.AmbientLight(0x224410,0.55));
  _addDl(scene,0xffd060,1.3,22,18,-8,true);  // warm afternoon sun
  _addDl(scene,0x88ffaa,0.22,-8,6,12,false);  // soft green fill
  _addPl(scene,0xffcc44,0.9,22,0,3,-6);        // spawn glow
}

/* ── WORLD 2: CRYSTAL CAVERNS ────────────────────────────────────────────────
   Identity: Deep purple + electric cyan. Massive ancient crystals power the city.
   Story: The underground city loses power — gather energy from the crystal formations.
   Palette: #6010c0 crystals · #00d9ff cyan veins · #12082a ground · #08031a sky
   ─────────────────────────────────────────────────────────────────────────── */
function _crystalCavernsArena(scene){
  scene.background=new THREE.Color(0x04011a);
  scene.fog=new THREE.FogExp2(0x08032a,0.022);

  // Dark stone floor with subtle grid
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(110,110,18,18),
    new THREE.MeshStandardMaterial({color:0x120828,roughness:0.96,metalness:0.12}));
  gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; scene.add(gnd);

  // Glowing vein path
  const veinPath=new THREE.Mesh(new THREE.PlaneGeometry(2.8,80),
    new THREE.MeshStandardMaterial({color:0x6010c0,emissive:0x4008a0,emissiveIntensity:0.35,roughness:0.6}));
  veinPath.rotation.x=-Math.PI/2; veinPath.position.set(0,0.02,-30); scene.add(veinPath);

  // ── GIANT CRYSTAL FORMATIONS (hero) — 8–16 units tall ──
  const crystalData=[
    [-18,0,-38,10,1.4,0x6010c0,0x4008a0],
    [24,0,-45,14,1.8,0x8020e0,0x6010c0],
    [-8,0,-60,16,2.1,0x00d9ff,0x0088cc],
    [35,0,-52,11,1.5,0xa040ff,0x6020cc],
    [-32,0,-42,12,1.6,0x00aaff,0x0055cc],
    [18,0,-68,9,1.2,0xcc40ff,0x8820cc],
    [-22,0,-72,13,1.7,0x4040ff,0x2020aa],
    [42,0,-35,8,1.1,0x00ffcc,0x00aa88],
  ];
  crystalData.forEach(([x,_y,z,h,r,col,emi])=>{
    // Crystal cluster: main spike + 2 smaller flanking spikes
    [[0,h/2,0,r,h],[-r*0.7,h*0.38,r*0.4,r*0.6,h*0.65],[r*0.8,h*0.42,-r*0.5,r*0.55,h*0.6]].forEach(([ox,oy,oz,cr,ch])=>{
      const cry=new THREE.Mesh(new THREE.ConeGeometry(cr,ch,6),
        new THREE.MeshStandardMaterial({color:col,emissive:emi,emissiveIntensity:0.55,roughness:0.04,metalness:0.25,transparent:true,opacity:0.88}));
      cry.position.set(x+ox,oy,z+oz); cry.castShadow=true; scene.add(cry);
    });
    // Bright point light at crystal tip
    _addPl(scene,col,1.6,10,x,h*0.85,z);
    // Pulsing animation
    scene.userData.movers=scene.userData.movers||[];
    const ph=Math.random()*Math.PI*2, spd=0.6+Math.random()*0.5;
    scene.userData.movers.push(t=>{
      // Pulse via glow — handled by point light in scene.userData.movers (approximated)
    });
  });

  // ── Smaller floor crystal deposits ──
  for(let i=0;i<24;i++){
    const x=(Math.random()-0.5)*70, z=-10-Math.random()*65;
    const h=0.8+Math.random()*2.2;
    const cols=[0x6010c0,0x00d9ff,0xa040ff,0x4040ff,0x00aaff];
    const c=cols[i%cols.length];
    const fc=new THREE.Mesh(new THREE.ConeGeometry(0.18+Math.random()*0.22,h,6),
      new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.4,roughness:0.1,transparent:true,opacity:0.85}));
    fc.position.set(x,h/2,z); scene.add(fc);
  }

  // ── Ceiling stalactites ──
  for(let i=0;i<18;i++){
    const x=(Math.random()-0.5)*60, z=-8-Math.random()*60, h=2+Math.random()*5;
    const st=new THREE.Mesh(new THREE.ConeGeometry(0.25+Math.random()*0.35,h,6),
      new THREE.MeshStandardMaterial({color:0x180830,roughness:0.98}));
    st.rotation.x=Math.PI; st.position.set(x,18-Math.random()*3,z); scene.add(st);
  }

  // ── Energy orbs floating mid-air (collectibles) ──
  [[0,-10],[3,-20],[-2,-30],[4,-40],[-1,-50]].forEach(([x,z])=>{
    const orb=new THREE.Mesh(new THREE.SphereGeometry(0.30,12,8),
      new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00aaff,emissiveIntensity:1.5,roughness:0.0,transparent:true,opacity:0.88}));
    orb.position.set(x,1.4,z); scene.add(orb);
    _addPl(scene,0x00aaff,0.7,4,x,1.4,z);
    scene.userData.movers=scene.userData.movers||[];
    const ph=Math.random()*Math.PI*2;
    scene.userData.movers.push(t=>{ orb.position.y=1.4+Math.sin(t*1.8+ph)*0.28; orb.rotation.y=t*1.2; });
  });

  // ── Lighting: deep purple ambient + cyan accents ──
  scene.add(new THREE.AmbientLight(0x0c0422,0.45));
  _addDl(scene,0x8040ff,0.28,-10,14,-20,true);
  _addPl(scene,0x8040ff,0.9,18,0,4,0);
  _addPl(scene,0x00d9ff,0.6,14,-12,3,-18);
  _addPl(scene,0x00aaff,0.5,14,15,3,-15);
}

/* ── WORLD 3: ROBOT REEF ──────────────────────────────────────────────────────
   Identity: Turquoise + warm coral orange. Underwater robots protect the reef.
   Story: Pollution is breaking the reef's colour coding system. Restore it!
   Palette: #00c8a0 water · #ff7040 coral · #0044aa deep water · #00ffcc glow
   ─────────────────────────────────────────────────────────────────────────── */
function _robotReefArena(scene){
  scene.background=new THREE.Color(0x003855);
  scene.fog=new THREE.FogExp2(0x003060,0.028);

  // Sandy floor
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(110,110,12,12),
    new THREE.MeshStandardMaterial({color:0x2a4818,roughness:0.88}));
  gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; scene.add(gnd);

  // ── GIANT CORAL FORMATIONS (hero) ──
  const coralData=[
    [-20,0,-35,0xff6040],[25,0,-44,0xff8020],[-10,0,-55,0xff4080],
    [32,0,-38,0xffaa40],[-28,0,-50,0xff5060],[20,0,-62,0xcc4088]
  ];
  coralData.forEach(([x,_y,z,col])=>{
    const grp=new THREE.Group(); grp.position.set(x,0,z);
    // Main trunk
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.6,3,9),
      new THREE.MeshStandardMaterial({color:col,roughness:0.65}));
    trunk.position.y=1.5; trunk.castShadow=true; grp.add(trunk);
    // Branch fingers (6–9 branching spikes)
    const branches=5+Math.floor(Math.random()*4);
    for(let b=0;b<branches;b++){
      const bh=2+Math.random()*3.5;
      const ang=(b/branches)*Math.PI*2+Math.random()*0.5;
      const bran=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.22,bh,7),
        new THREE.MeshStandardMaterial({color:col,roughness:0.6,emissive:col,emissiveIntensity:0.12}));
      bran.position.set(Math.cos(ang)*1.0,3+bh/2,Math.sin(ang)*1.0);
      bran.rotation.z=Math.cos(ang)*0.4; bran.rotation.x=Math.sin(ang)*0.3;
      bran.castShadow=true; grp.add(bran);
    }
    // Sway animation
    scene.userData.movers=scene.userData.movers||[];
    const phase=Math.random()*Math.PI*2;
    scene.userData.movers.push(t=>{ grp.rotation.z=Math.sin(t*0.5+phase)*0.04; grp.rotation.x=Math.sin(t*0.38+phase)*0.025; });
    _addPl(scene,col,0.6,8,x,4,z);
    scene.add(grp);
  });

  // ── Sea anemones (large round tentacle clusters) ──
  [[-5,-18],[8,-28],[-12,-38],[6,-48]].forEach(([x,z])=>{
    const base=new THREE.Mesh(new THREE.SphereGeometry(0.55,12,8),
      new THREE.MeshStandardMaterial({color:0xff4080,roughness:0.7}));
    base.position.set(x,0.4,z); scene.add(base);
    for(let t2=0;t2<8;t2++){
      const ang=(t2/8)*Math.PI*2;
      const ten=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.12,1.1,6),
        new THREE.MeshStandardMaterial({color:0xff88aa,roughness:0.6,emissive:0xff4080,emissiveIntensity:0.15}));
      ten.position.set(x+Math.cos(ang)*0.5,1.1,z+Math.sin(ang)*0.5);
      ten.rotation.z=Math.cos(ang)*0.4; scene.add(ten);
    }
  });

  // ── Glowing jellyfish floating above ──
  [[2,-12,3],[-8,-25,4],[12,-38,3.5],[-5,-50,5]].forEach(([x,z,ht])=>{
    const jbell=new THREE.Mesh(new THREE.SphereGeometry(0.55,12,7,0,Math.PI*2,0,Math.PI*0.5),
      new THREE.MeshStandardMaterial({color:0x88eeff,emissive:0x00ccff,emissiveIntensity:0.8,transparent:true,opacity:0.55,side:THREE.DoubleSide}));
    jbell.position.set(x,ht,z); scene.add(jbell);
    for(let i=0;i<6;i++){
      const ten=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.015,1.2+Math.random(),4),
        new THREE.MeshStandardMaterial({color:0xaaffee,transparent:true,opacity:0.4}));
      ten.position.set(x+(Math.random()-0.5)*0.7,ht-0.6-Math.random()*0.4,z+(Math.random()-0.5)*0.7);
      scene.add(ten);
    }
    _addPl(scene,0x00d9ff,0.5,5,x,ht,z);
    scene.userData.movers=scene.userData.movers||[];
    const ph=Math.random()*Math.PI*2;
    scene.userData.movers.push(t=>{ jbell.position.y=ht+Math.sin(t*0.9+ph)*0.35; jbell.rotation.y=t*0.4; });
  });

  // ── Caustic light shafts from above ──
  for(let i=0;i<6;i++){
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.4+Math.random()*0.6,0.15,22,8,1,true),
      new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.032,side:THREE.DoubleSide}));
    shaft.position.set((Math.random()-0.5)*40,11,-10-Math.random()*50); scene.add(shaft);
  }

  // ── Fish school (animated point cloud) ──
  const fishCount=80;
  const fishGeo=new THREE.BufferGeometry();
  const fpos=new Float32Array(fishCount*3);
  for(let i=0;i<fishCount;i++){fpos[i*3]=(Math.random()-0.5)*18;fpos[i*3+1]=2+Math.random()*5;fpos[i*3+2]=-8-Math.random()*40;}
  fishGeo.setAttribute('position',new THREE.BufferAttribute(fpos,3));
  const fishPts=new THREE.Points(fishGeo,new THREE.PointsMaterial({color:0xffdd88,size:0.18,transparent:true,opacity:0.8}));
  scene.add(fishPts);
  scene.userData.movers=scene.userData.movers||[];
  scene.userData.movers.push(t=>{
    const pa=fishGeo.attributes.position; const farr=pa.array;
    for(let i=0;i<fishCount;i++){farr[i*3]+=Math.sin(t*0.8+i)*0.008;farr[i*3+1]+=Math.sin(t*1.1+i*0.5)*0.005;}
    pa.needsUpdate=true;
  });

  // ── Bubble particles ──
  const bubCount=120; const bubGeo=new THREE.BufferGeometry();
  const bpos=new Float32Array(bubCount*3);
  for(let i=0;i<bubCount;i++){bpos[i*3]=(Math.random()-0.5)*60;bpos[i*3+1]=Math.random()*14;bpos[i*3+2]=-5-Math.random()*65;}
  bubGeo.setAttribute('position',new THREE.BufferAttribute(bpos,3));
  const bubPts=new THREE.Points(bubGeo,new THREE.PointsMaterial({color:0xaaeeff,size:0.12,transparent:true,opacity:0.55}));
  scene.add(bubPts);
  scene.userData.movers=scene.userData.movers||[];
  scene.userData.movers.push(t=>{
    const ba=bubGeo.attributes.position; const barr=ba.array;
    for(let i=0;i<bubCount;i++){barr[i*3+1]+=0.012;if(barr[i*3+1]>15)barr[i*3+1]=0;}
    ba.needsUpdate=true;
  });

  // ── Lighting ──
  scene.add(new THREE.AmbientLight(0x002844,0.55));
  _addDl(scene,0x00c8a0,0.35,-5,16,-15,true);
  _addPl(scene,0x00d9ff,0.8,20,0,4,0);
  _addPl(scene,0xff6040,0.5,14,18,3,-28);
  _addPl(scene,0x00ccff,0.4,12,-16,3,-22);
}

/* ── WORLD 4: SKY ISLAND DELIVERY ───────────────────────────────────────────
   Identity: Warm orange + sky blue. Floating islands connected by bridges.
   Story: Islands depend on drone deliveries. A storm cut the routes — restore them!
   Palette: #ff8c20 sunset · #4ac8ff sky · #88cc44 island grass · #fff5e0 clouds
   ─────────────────────────────────────────────────────────────────────────── */
function _skyIslandArena(scene){
  scene.background=new THREE.Color(0xff9a3c);
  scene.fog=new THREE.Fog(0xffbb66,60,110);

  // The main floating island platform (player starts here)
  function makeIsland(cx,cy,cz,w,d,thick){
    const isl=new THREE.Mesh(new THREE.BoxGeometry(w,thick,d),
      new THREE.MeshStandardMaterial({color:0x88cc44,roughness:0.9}));
    isl.position.set(cx,cy,cz); isl.receiveShadow=true; isl.castShadow=true; scene.add(isl);
    // Underside rock
    const rock=new THREE.Mesh(new THREE.BoxGeometry(w*0.8,thick*0.9,d*0.8),
      new THREE.MeshStandardMaterial({color:0x7a6048,roughness:1}));
    rock.position.set(cx,cy-thick*0.9,cz); scene.add(rock);
  }

  // Central island (spawn)
  makeIsland(0,0,0,22,18,1.4);
  // Mid island
  makeIsland(0,-0.8,-42,16,12,1.2);
  // Far island
  makeIsland(6,-1.5,-74,14,10,1.1);

  // Rope bridges between islands
  function makeBridge(x1,z1,x2,z2,y){
    const dx=x2-x1,dz=z2-z1, len=Math.sqrt(dx*dx+dz*dz);
    const ang=Math.atan2(dx,dz);
    const bridge=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.22,len),
      new THREE.MeshStandardMaterial({color:0x8a5a2a,roughness:0.95}));
    bridge.position.set((x1+x2)/2,y,(z1+z2)/2); bridge.rotation.y=ang; bridge.receiveShadow=true; scene.add(bridge);
    // Rope rails
    for(let side=-1;side<=1;side+=2){
      const rail=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,len,5),
        new THREE.MeshStandardMaterial({color:0xcc9944}));
      rail.position.set((x1+x2)/2+side*1.1,y+0.4,(z1+z2)/2); rail.rotation.y=ang+Math.PI/2; scene.add(rail);
    }
  }
  makeBridge(0,-9,0,-33,-0.3);
  makeBridge(0,-51,6,-69,-1.0);

  // ── GIANT WINDMILL (hero landmark) ──
  const wmill=new THREE.Group(); wmill.position.set(8,0.7,-8);
  const wmtower=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.7,6,10),
    new THREE.MeshStandardMaterial({color:0xfff8e8,roughness:0.6}));
  wmtower.position.y=3; wmill.add(wmtower);
  const wmtop=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.2,10),
    new THREE.MeshStandardMaterial({color:0xcc3322,roughness:0.7}));
  wmtop.position.y=6.6; wmill.add(wmtop);
  // 4 blades as elongated boxes, in a group that spins
  const bladeGrp=new THREE.Group(); bladeGrp.position.y=6; wmill.add(bladeGrp);
  for(let b=0;b<4;b++){
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.22,3.8,0.1),
      new THREE.MeshStandardMaterial({color:0xfff8e8,roughness:0.5}));
    blade.position.set(Math.cos((b/4)*Math.PI*2)*1.9,Math.sin((b/4)*Math.PI*2)*1.9,0.05);
    blade.rotation.z=(b/4)*Math.PI*2; bladeGrp.add(blade);
  }
  scene.userData.movers=scene.userData.movers||[];
  scene.userData.movers.push(t=>{ bladeGrp.rotation.z=t*0.6; });
  scene.add(wmill);

  // ── Distant floating islands in background (silhouettes) ──
  [[-50,8,-80,12,8,0.8],[55,12,-90,10,7,0.7],[-40,15,-100,14,9,0.9]].forEach(([x,y,z,w,d,thick])=>{
    makeIsland(x,y,z,w,d,thick);
    // A tiny windmill on each
    const mw=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,2.5,7),
      new THREE.MeshStandardMaterial({color:0xfff8e8,roughness:0.6}));
    mw.position.set(x,y+1.25+thick/2,z); scene.add(mw);
  });

  // ── Cloud puffs (sphere clusters, low to the sides) ──
  [[-30,6,-20],[-45,10,-50],[40,4,-30],[50,8,-60]].forEach(([cx,cy,cz])=>{
    for(let c=0;c<5;c++){
      const cl=new THREE.Mesh(new THREE.SphereGeometry(2.5+Math.random()*2,8,6),
        new THREE.MeshStandardMaterial({color:0xfff5e0,roughness:1,transparent:true,opacity:0.88}));
      cl.position.set(cx+(Math.random()-0.5)*6,cy+(Math.random()-0.5)*2,cz+(Math.random()-0.5)*5);
      scene.add(cl);
    }
  });

  // ── Package delivery props (crates on island) ──
  [[4,1.4,-3],[-5,1.4,-5],[2,1.4,-12]].forEach(([x,y,z])=>{
    const crate=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7),
      new THREE.MeshStandardMaterial({color:0xcc8822,roughness:0.8}));
    crate.position.set(x,y,z); crate.castShadow=true; scene.add(crate);
  });

  // ── Sunset sky gradient strips ──
  [[0xff9a3c,0],[0xff6b20,-2],[0xffcc55,2]].forEach(([col,oy])=>{
    const strip=new THREE.Mesh(new THREE.PlaneGeometry(300,40),
      new THREE.MeshBasicMaterial({color:col,side:THREE.BackSide,transparent:true,opacity:0.25}));
    strip.position.set(0,15+oy,-90); scene.add(strip);
  });

  // ── Lighting: warm sunset ──
  scene.add(new THREE.AmbientLight(0x442210,0.5));
  _addDl(scene,0xff9944,1.3,25,12,-5,true);   // golden sun
  _addDl(scene,0x8ac8ff,0.28,-15,8,18,false);   // sky fill
  _addPl(scene,0xffcc66,0.9,22,0,4,0);           // spawn warmth
  _addPl(scene,0xff8833,0.55,16,8,5,-40);         // mid-island glow
}

function buildSmartArena(scene,arenaType,challenge){
  switch(arenaType){
    case 'sky':             _skyArena(scene); break;
    case 'terrain':         _terrainArena(scene); break;
    case 'hover':           _hoverArena(scene); break;
    case 'rough':           _roughArena(scene,challenge); break;
    case 'factory':         _factoryArena(scene); break;
    case 'jet':             _jetArena(scene); break;
    case 'space':           _spaceArena(scene); break;
    case 'underwater':      _underwaterArena(scene); break;
    case 'lego':            _legoArena(scene); break;
    case 'cavern':          _cavernArena(scene); break;
    case 'neon_race':       _neonRaceArena(scene); break;
    case 'jungle':          _jungleArena(scene); break;
    case 'zero_g':          _zeroGArena(scene); break;
    case 'warehouse':       _warehouseArena(scene); break;
    case 'temple':          _templeArena(scene,challenge); break;
    case 'combat':          _combatArena(scene); break;
    case 'dodge_balls':     _dodgeBallsArena(scene); break;
    case 'dodge_lasers':    _dodgeLaserArena(scene); break;
    case 'dodge_asteroids': _dodgeAsteroidArena(scene); break;
    case 'escape_wall':     _escapeWallArena(scene); break;
    case 'escape_hunters':  _escapeHuntersArena(scene); break;
    case 'escape_swarm':    _escapeSwarmArena(scene); break;
    case 'collect_easy':    _collectEasyArena(scene); break;
    case 'collect_medium':  _collectMediumArena(scene); break;
    case 'collect_hard':    _collectHardArena(scene); break;
    case 'flight_rings':    _flightRingsArena(scene); break;
    case 'flight_acro':     _flightAcroArena(scene); break;
    case 'flight_slalom':   _flightSlalomArena(scene); break;
    // New catalog arenas
    case 'temple_ext':      _templeExtArena(scene); break;
    case 'stone_bridge':    _stoneBridgeArena(scene); break;
    case 'boss_arena':      _bossArenaBuilder(scene); break;
    case 'crystal_cave':    _crystalCaveArena(scene); break;
    case 'jungle_maze':     _jungleMazeArena(scene); break;
    case 'neon_city':       _neonCityArena(scene); break;
    case 'mountain_fly':    _mountainFlyArena(scene); break;
    case 'storm_chase':     _stormChaseArena(scene); break;
    case 'combat_zone':     _combatZoneArena(scene); break;
    case 'line_follow':     _lineFollowArena(scene, challenge); break;
    case 'transit_tunnel':
    case 'warehouse_sort':
    case 'jungle_expedition':
    case 'disaster_zone':
    case 'soccer_arena':
    case 'temple_maze':
    case 'hospital_corridor':
      buildFlagshipArena(scene, arenaType, challenge);
      break;
    // ── Robot-exclusive signature environments ──────────────────────────
    case 'rover_transit':    _roverTransitArena(scene); break;
    case 'rover_delivery':   _roverDeliveryArena(scene); break;
    case 'rover_survey':     _roverSurveyArena(scene); break;
    case 'spider_pipeline':  _spiderPipelineArena(scene); break;
    case 'spider_ruins':     _spiderRuinsArena(scene); break;
    case 'spider_rescue':    _spiderRescueArena(scene); break;
    case 'drone_canyon':     _droneCanyonArena(scene); break;
    case 'drone_rooftop':    _droneRooftopArena(scene); break;
    case 'drone_survey':     _droneSurveyArena(scene); break;
    case 'tank_demolition':  _tankDemolitionArena(scene); break;
    case 'tank_mountain':    _tankMountainArena(scene); break;
    case 'human_assembly':   _humanAssemblyArena(scene); break;
    case 'human_stairwell':  _humanStairwellArena(scene); break;
    case 'arm_surgery':      _armSurgeryArena(scene); break;
    case 'arm_sort':         _armSortArena(scene); break;
    // ── Underwater ──────────────────────────────────────────────────────────
    case 'coral_reef':       _coralReefArena(scene); break;
    case 'deep_trench':      _deepTrenchArena(scene); break;
    case 'kelp_forest':      _kelpForestArena(scene); break;
    case 'arctic_dive':      _arcticDiveArena(scene); break;
    // ── Jet ─────────────────────────────────────────────────────────────────
    case 'jet_stunt':        _jetStuntArena(scene); break;
    case 'jet_supersonic':   _jetSupersonicArena(scene); break;
    // ── Medbot ──────────────────────────────────────────────────────────────
    case 'medbot_triage':    _medbotTriageArena(scene); break;
    case 'medbot_ward':      _medbotWardArena(scene); break;
    // ── Firebot ─────────────────────────────────────────────────────────────
    case 'firebot_blaze':    _firebotBlazeArena(scene); break;
    // ── Ground / Wheeled (20 new) ────────────────────────────────────────────
    case 'forest_trail':         _forestTrailArena(scene); break;
    case 'city_delivery':        _cityDeliveryArena(scene); break;
    case 'lava_canyon':          _lavaCanyonArena(scene); break;
    case 'arctic_station':       _arcticStationArena(scene); break;
    case 'temple_maze':          _templeMazeArena(scene); break;
    case 'desert_rally':         _desertRallyArena(scene); break;
    case 'underground_mine':     _undergroundMineArena(scene); break;
    case 'flooded_city':         _floodedCityArena(scene); break;
    case 'space_corridor':       _spaceCorridorArena(scene); break;
    case 'haunted_graveyard':    _hauntedGraveyardArena(scene); break;
    case 'racing_circuit':       _racingCircuitArena(scene); break;
    case 'farm_harvest':         _farmHarvestArena(scene); break;
    case 'pirate_dock':          _pirateDockArena(scene); break;
    case 'toxic_wasteland':      _toxicWastelandArena(scene); break;
    case 'carnival_funfair':     _carnivalFunfairArena(scene); break;
    case 'jungle_bridge':        _jungleBridgeArena(scene); break;
    case 'museum_heist':         _museumHeistArena(scene); break;
    case 'snow_rescue':          _snowRescueArena(scene); break;
    case 'cyber_city':           _cyberCityArena(scene); break;
    case 'time_trial_gauntlet':  _timeTrialGauntletArena(scene); break;
    // ── Aerial (20 new) ─────────────────────────────────────────────────────
    case 'canyon_flight':        _canyonFlightArena(scene); break;
    case 'city_skyline':         _citySkylineArena(scene); break;
    case 'storm_cloud':          _stormCloudArena(scene); break;
    case 'volcanic_flythrough':  _volcanicFlythroughArena(scene); break;
    case 'arctic_survey':        _arcticSurveyArena(scene); break;
    case 'rooftop_delivery':     _rooftopDeliveryArena(scene); break;
    case 'space_orbit':          _spaceOrbitArena(scene); break;
    case 'rainforest_canopy':    _rainforestCanopyArena(scene); break;
    case 'cloud_race':           _cloudRaceArena(scene); break;
    case 'night_patrol':         _nightPatrolArena(scene); break;
    case 'desert_air':           _desertAirArena(scene); break;
    case 'mountain_pass':        _mountainPassArena(scene); break;
    case 'glacier_flyover':      _glacierFlyoverArena(scene); break;
    case 'typhoon':              _typhoonArena(scene); break;
    case 'alien_planet':         _alienPlanetArena(scene); break;
    case 'fireworks':            _fireworksArena(scene); break;
    case 'cloud_fortress':       _cloudFortressArena(scene); break;
    case 'drone_league':         _droneLeagueArena(scene); break;
    case 'coastal_rescue':       _coastalRescueArena(scene); break;
    case 'warp_gate':            _warpGateArena(scene); break;
    // ── Walker (20 new) ─────────────────────────────────────────────────────
    case 'pipeline_crawl':       _pipelineCrawlArena(scene); break;
    case 'temple_climb':         _templeClimbArena(scene); break;
    case 'collapsed_building':   _collapsedBuildingArena(scene); break;
    case 'military_base':        _militaryBaseArena(scene); break;
    case 'factory_floor':        _factoryFloorArena(scene); break;
    case 'space_eva':            _spaceEvaArena(scene); break;
    case 'hospital_walk':        _hospitalWalkArena(scene); break;
    case 'mine_shaft':           _mineShaftArena(scene); break;
    case 'urban_obstacle':       _urbanObstacleArena(scene); break;
    case 'colosseum':            _colosseumArena(scene); break;
    case 'volcanic_climb':       _volcanicClimbArena(scene); break;
    case 'bamboo_forest':        _bambooForestArena(scene); break;
    case 'ice_palace':           _icePalaceArena(scene); break;
    case 'robot_museum':         _robotMuseumArena(scene); break;
    case 'sewers':               _sewersArena(scene); break;
    case 'sky_garden':           _skyGardenArena(scene); break;
    case 'cargo_ship':           _cargoShipArena(scene); break;
    case 'haunted_mansion':      _hauntedMansionArena(scene); break;
    case 'cave_of_wonders':      _caveOfWondersArena(scene); break;
    case 'cyber_dungeon':        _cyberDungeonArena(scene); break;
    // ── Underwater (20 new) ─────────────────────────────────────────────────
    case 'coral_reef_survey':    _coralReefSurveyArena(scene); break;
    case 'shipwreck':            _shipwreckArena(scene); break;
    case 'deep_trench_course':   _deepTrenchCourseArena(scene); break;
    case 'hydrothermal':         _hydrothermalArena(scene); break;
    case 'sub_canyon':           _subCanyonArena(scene); break;
    case 'ice_shelf':            _iceShelfArena(scene); break;
    case 'current_maze':         _currentMazeArena(scene); break;
    case 'whale_route':          _whaleRouteArena(scene); break;
    case 'bioluminescent':       _bioluminescentArena(scene); break;
    case 'pirate_wreck':         _pirateWreckArena(scene); break;
    case 'undersea_volcano':     _underseaVolcanoArena(scene); break;
    case 'seagrass':             _seagrassArena(scene); break;
    case 'tidal_cave':           _tidalCaveArena(scene); break;
    case 'deep_station':         _deepStationArena(scene); break;
    case 'squid_chase':          _squidChaseArena(scene); break;
    case 'atlantis':             _atlantisArena(scene); break;
    case 'eel_cavern':           _eelCavernArena(scene); break;
    case 'tsunami':              _tsunamiArena(scene); break;
    case 'mariana':              _marianaArena(scene); break;
    // ── Pixar Story Worlds ───────────────────────────────────────────────────
    case 'power_garden':         _powerGardenArena(scene); break;
    case 'crystal_caverns':      _crystalCavernsArena(scene); break;
    case 'robot_reef':           _robotReefArena(scene); break;
    case 'sky_island':           _skyIslandArena(scene); break;
    default:                 _groundArena(scene,challenge); break;
  }
  applyArenaAtmosphere(scene, arenaType, challenge);
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
  // Per-robot physics multipliers — each robot FEELS different
  const ROBOT_SPD={jets:2.6,flying:1.8,hover:1.5,wheels:1.35,wheels6:1.25,tracks:0.9,legs:1.0,fins:1.3,arm:0.55};
  const spd=ROBOT_SPD[movId]||1.0;
  const turnMult=movId==='jets'?2.2:movId==='legs'?1.6:movId==='tracks'?0.65:movId==='hover'?1.4:1.0;
  switch(block.id){
    case 'move_forward':  {const d=(p.steps||3)*1.9*spd; rs.x+=Math.sin(rs.angle)*(d/dur)*dt; rs.z+=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt; rs.bobPhase+=dt*8; break;}
    case 'move_backward': {const d=(p.steps||1)*1.9*spd; rs.x-=Math.sin(rs.angle)*(d/dur)*dt; rs.z-=Math.cos(rs.angle)*(d/dur)*dt; rs.totalDist+=(d/dur)*dt*0.5; rs.bobPhase+=dt*6; break;}
    case 'turn_left':     rs.angle+=((p.degrees||90)*Math.PI/180*turnMult)/dur*dt; break;
    case 'turn_right':    rs.angle-=((p.degrees||90)*Math.PI/180*turnMult)/dur*dt; break;
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

    // ── GRIPPER SYSTEM BLOCKS ────────────────────────────────────────────────
    // These set triggers on rs that the tick loop reads on block-start only
    case 'gripper_scan':
    case 'scan_area':
      if(rs.stepTime<0.05) rs.scanTrigger=true;
      break;
    case 'gripper_grab':
    case 'grab':
      if(rs.stepTime<0.05 && !rs.grabTrigger) rs.grabTrigger=true;
      break;
    case 'gripper_gentle':
      if(rs.stepTime<0.05 && !rs.grabTrigger){ rs.grabTrigger=true; rs.grabGentle=true; }
      break;
    case 'gripper_grab_L':
      if(rs.stepTime<0.05) rs.grabSide='left';
      if(rs.stepTime<0.05 && !rs.grabTrigger) rs.grabTrigger=true;
      break;
    case 'gripper_grab_R':
      if(rs.stepTime<0.05) rs.grabSide='right';
      if(rs.stepTime<0.05 && !rs.grabTrigger) rs.grabTrigger=true;
      break;
    case 'gripper_grab_B':
      if(rs.stepTime<0.05){ rs.grabSide='both'; rs.grabTrigger=true; }
      break;
    case 'gripper_release':
    case 'release':
      if(rs.stepTime<0.05 && !rs.releaseTrigger) rs.releaseTrigger=true;
      break;
    case 'gripper_care':
      if(rs.stepTime<0.05 && !rs.releaseTrigger){ rs.releaseTrigger=true; rs.releaseCareful=true; }
      break;
    case 'gripper_rel_L':
      if(rs.stepTime<0.05){ rs.releaseSide='left'; rs.releaseTrigger=true; }
      break;
    case 'gripper_rel_R':
      if(rs.stepTime<0.05){ rs.releaseSide='right'; rs.releaseTrigger=true; }
      break;
    case 'gripper_rel_B':
      if(rs.stepTime<0.05){ rs.releaseSide='both'; rs.releaseTrigger=true; }
      break;
    case 'gripper_force':
      rs.gripForce=Math.max(1,Math.min(100,p.force||10));
      break;
    case 'gripper_power':
      rs.gripForce=100;
      if(rs.stepTime<0.05 && !rs.grabTrigger) rs.grabTrigger=true;
      break;
    case 'gripper_check':
      // Visual only — label shows cargo in block execution HUD
      break;
    case 'gripper_weigh':
      // Visual only — label shows weight
      break;
    case 'gripper_fragile':
      if(rs.stepTime<0.05) rs.scanFragileOnly=true;
      if(rs.stepTime<0.05) rs.scanTrigger=true;
      break;
    case 'gripper_sens':
      rs.gripSensitivity=Math.max(1,Math.min(5,p.level||3));
      break;

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

function alignRobotToGround(model){
  model.updateMatrixWorld(true);
  const bbox=new THREE.Box3().setFromObject(model);
  if(!bbox.isEmpty()) model.position.y-=bbox.min.y;
  model.traverse(o=>{ if(o.isMesh) o.frustumCulled=false; });
}

// ─────────────────────────────────────────────────────────────────────────────
// AAA VISUAL HELPERS — block labels, colours, path prediction
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_EXEC_LABELS = {
  move_forward:'▶ Move Forward', move_backward:'◀ Move Back',
  turn_left:'↩ Turn Left', turn_right:'↪ Turn Right',
  spin:'🔄 Spin', stop:'⏹ Stop',
  fly_forward:'▶ Fly Forward', fly_backward:'◀ Fly Back',
  fly_left:'← Fly Left', fly_right:'→ Fly Right',
  fly_up:'↑ Fly Up', fly_down:'↓ Fly Down',
  takeoff:'🚀 Takeoff', land:'🛬 Land',
  jump:'🦘 Jump', leap:'🦘 Leap',
  grab:'✊ Grab', release:'🤚 Release',
  scan:'📡 Scan', aerial_scan:'📡 Aerial Scan',
  obstacle_ahead:'👁 Obstacle Check', avoid_obstacle:'↩ Avoid!',
  thrust:'🔥 Thrust', jet_boost:'⚡ Jet Boost', roll_left:'↙ Roll Left', roll_right:'↘ Roll Right',
  step_forward:'🦵 Step Forward', climb_wall:'🧗 Climb Wall',
  patrol_area:'🔍 Patrol', return_home:'🏠 Return Home',
  follow_line:'📏 Follow Line', follow_target:'🎯 Follow Target',
  hover:'🛸 Hover', altitude_hold:'🛸 Hold Alt',
  grab:'✊ Grab', release:'🤚 Release',
  lift_object:'⬆ Lift', drop_object:'⬇ Drop',
  fire_laser:'⚡ Fire Laser', scan_object:'📷 Scan Object',
  wait:'⏱ Wait', repeat:'🔁 Repeat', forever:'♾ Forever',
  accelerate:'💨 Accelerate', decelerate:'🛑 Decelerate',
  strafe_left:'◄ Strafe L', strafe_right:'► Strafe R',
  dive:'⬇ Dive', float_up:'⬆ Float Up',
  power_mode:'⚡ Power Mode', tank_steer:'🔄 Tank Steer',
  // Gripper system
  gripper_scan:'📡 Scan Area', gripper_grab:'✊ Grab Item!', gripper_release:'📦 Deliver!',
  gripper_check:'⚖️ Check Cargo', gripper_grab_L:'✊ Grab Left', gripper_grab_R:'✊ Grab Right',
  gripper_grab_B:'🤲 Grab Both!', gripper_rel_L:'👐 Release Left', gripper_rel_R:'👐 Release Right',
  gripper_rel_B:'👐 Release Both', gripper_force:'💪 Grip Force', gripper_power:'🦾 POWER GRIP!',
  gripper_weigh:'⚖️ Weighing…', gripper_gentle:'🎯 Gentle Grab', gripper_care:'🎯 Place Carefully',
  gripper_fragile:'💎 Fragile Scan', gripper_sens:'🎯 Sensitivity Set',
};
const BLOCK_EXEC_COLORS = {
  move_forward:'#22c55e', move_backward:'#86efac', step_forward:'#22c55e',
  turn_left:'#60a5fa', turn_right:'#60a5fa', spin:'#93c5fd',
  fly_up:'#22d3ee', fly_down:'#67e8f9', fly_forward:'#22c55e',
  fly_left:'#60a5fa', fly_right:'#60a5fa', fly_backward:'#86efac',
  takeoff:'#22d3ee', land:'#67e8f9',
  jump:'#a78bfa', leap:'#a78bfa', climb_wall:'#d946ef',
  grab:'#f59e0b', release:'#fbbf24', lift_object:'#f59e0b', drop_object:'#fbbf24',
  thrust:'#ef4444', jet_boost:'#ef4444', roll_left:'#f97316', roll_right:'#f97316',
  scan:'#8b5cf6', aerial_scan:'#8b5cf6', obstacle_ahead:'#7c3aed', scan_object:'#7c3aed',
  fire_laser:'#ef4444',
  patrol_area:'#0ea5e9', return_home:'#0ea5e9', follow_line:'#0ea5e9', follow_target:'#0ea5e9',
  hover:'#06b6d4', altitude_hold:'#06b6d4',
  accelerate:'#f97316', decelerate:'#94a3b8',
  wait:'#4b5563',
  // Gripper system colors
  gripper_scan:'#8b5cf6', gripper_grab:'#22c55e', gripper_release:'#f59e0b',
  gripper_check:'#06b6d4', gripper_grab_L:'#22c55e', gripper_grab_R:'#22c55e',
  gripper_grab_B:'#10b981', gripper_rel_L:'#f59e0b', gripper_rel_R:'#f59e0b',
  gripper_rel_B:'#f97316', gripper_force:'#f59e0b', gripper_power:'#ef4444',
  gripper_weigh:'#06b6d4', gripper_gentle:'#06b6d4', gripper_care:'#06b6d4',
  gripper_fragile:'#a78bfa', gripper_sens:'#06b6d4',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3D SIMULATOR CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function SimCanvas({robotConfig,codeBlocks,runMode,stepTrigger,onProgress,onFpsUpdate,arenaType,challenge,onBlockActive,introKey,onZoneChange}){
  const wrapRef=useRef(null);
  const modeRef=useRef('idle');
  const rafRef=useRef(null);
  const fpsRef=useRef({frames:0,last:0});
  const rsRef=useRef({x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0,collisions:0,stopTimer:0,collectedItems:0,collectedValue:0,hitFlash:false});
  const lastActiveRef=useRef(-1);
  const lastZoneRef=useRef(0);
  const blocksRef=useRef(codeBlocks||[]);
  const challengeKey = challenge?.id || 'default';

  const introKeyRef=useRef(introKey||0);
  useEffect(()=>{modeRef.current=runMode;},[runMode]);
  useEffect(()=>{blocksRef.current=codeBlocks||[];},[codeBlocks]);
  useEffect(()=>{ if(introKey>introKeyRef.current){ introKeyRef.current=introKey; } },[introKey]);

  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const W=Math.max(el.clientWidth,1),H=Math.max(el.clientHeight,1);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(54,W/H,0.1,120);
    const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas=renderer.domElement;
    canvas.className='ll-sim-canvas';
    canvas.style.display='block';
    canvas.style.width='100%';
    canvas.style.height='100%';
    el.appendChild(canvas);

    const isForestCourse=arenaType==='ground'||challenge?.isFoxChase||challenge?.id==='fox_battery_chase';

    // Per-arena colour grade (saturation + warm/cool gain tint)
    const _AG={sky:{s:1.05,g:[1.02,1.02,1.05],b:0.9,t:0.55},space:{s:1.10,g:[0.95,0.98,1.12],b:1.6,t:0.30},cavern:{s:1.20,g:[1.00,0.96,1.10],b:1.7,t:0.25},neon_race:{s:1.25,g:[1.05,0.98,1.10],b:1.8,t:0.22},underwater:{s:1.15,g:[0.92,1.02,1.10],b:1.4,t:0.30},jungle:{s:1.30,g:[1.05,1.05,0.92],b:1.0,t:0.45},factory:{s:1.00,g:[0.96,1.00,1.05],b:1.5,t:0.30},temple:{s:1.18,g:[1.06,1.00,0.90],b:1.2,t:0.38},combat:{s:1.15,g:[1.08,0.95,0.92],b:1.6,t:0.28},jet:{s:1.10,g:[1.03,1.02,0.98],b:1.0,t:0.50},zero_g:{s:1.10,g:[0.97,0.99,1.10],b:1.5,t:0.30},lego:{s:1.20,g:[1.04,1.02,1.00],b:0.9,t:0.55},terrain:{s:1.15,g:[1.05,1.02,0.94],b:1.0,t:0.48},ground:{s:1.30,g:[1.05,1.05,0.92],b:1.2,t:0.42},default:{s:1.10,g:[1.02,1.01,1.00],b:1.2,t:0.40}};
    const _g=_AG[arenaType]||_AG.default;
    const ColorGradeShader={uniforms:{tDiffuse:{value:null},sat:{value:_g.s},gain:{value:new THREE.Vector3(..._g.g)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float sat;uniform vec3 gain;varying vec2 vUv;void main(){vec4 t=texture2D(tDiffuse,vUv);vec3 c=t.rgb;float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,sat)*gain;gl_FragColor=vec4(clamp(c,0.0,1.0),t.a);}`};

    const composer=new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    const bloomPass=new UnrealBloomPass(new THREE.Vector2(W,H),_g.b,0.5,_g.t);
    composer.addPass(bloomPass);
    composer.addPass(new ShaderPass(ColorGradeShader));
    const fxaaPass=new ShaderPass(FXAAShader);
    const _setFxaa=(w,h)=>{const pr=Math.min(window.devicePixelRatio,2);fxaaPass.material.uniforms.resolution.value.set(1/(w*pr),1/(h*pr));};
    _setFxaa(W,H);
    composer.addPass(fxaaPass);
    composer.addPass(new OutputPass());
    configureLabRenderer(renderer, bloomPass, { isForest: isForestCourse });
    const renderFrame=()=>composer.render();

    const { amb, hemi, sun, fill } = setupSimLighting(scene, { isForest: isForestCourse });

    if(isForestCourse){
      const spawnWarm=new THREE.PointLight(0xffe8b0,0.22,12);
      spawnWarm.position.set(0,4,3);
      scene.add(spawnWarm);
    }
    let spawnPL=null;
    if(!isForestCourse){
      spawnPL=new THREE.PointLight(0xffffff,0.35,14);
      spawnPL.position.set(0,5,5);
      scene.add(spawnPL);
    }

    buildSmartArena(scene,arenaType,challenge);
    stylizeMeshMaterials(scene, { keepEmissive: true });
    // Per-course lighting mood (set by arena builder): [amb×, hemi×, sun×, sunColor?]
    const lightMood=scene.userData.lightMood;
    if(lightMood){
      amb.intensity*=lightMood[0];
      hemi.intensity*=lightMood[1];
      sun.intensity*=lightMood[2];
      fill.intensity*=lightMood[1];
      if(lightMood[3]) sun.color.setHex(lightMood[3]);
    }
    // Optional ambient/fill color tints (e.g. cavern: purple ambient, cyan fill)
    const lightTint=scene.userData.lightTint;
    if(lightTint){
      if(lightTint.amb) amb.color.setHex(lightTint.amb);
      if(lightTint.fill) fill.color.setHex(lightTint.fill);
      if(lightTint.hemiSky) hemi.color.setHex(lightTint.hemiSky);
      if(lightTint.hemiGround) hemi.groundColor.setHex(lightTint.hemiGround);
    }
    if(scene.userData.expMood) renderer.toneMappingExposure*=scene.userData.expMood;
    setupSoftEnvironment(scene);
    if(scene.userData.forestZones?.[0]){
      const z0=scene.userData.forestZones[0];
      lastZoneRef.current=z0.num;
      onZoneChange?.({ num:z0.num, name:z0.name, color:z0.col });
    }

    // ── Sim particle system ──────────────────────────────────────────────
    const SIM_MAX_P=60;
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

    const robot=buildSimRobot(robotConfig);
    robot.castShadow=true;
    robot.scale.setScalar(1.75);
    const robotState=createRobotStateController(robot);
    const execTrail=createExecutionTrail(scene);
    const rs=rsRef.current;
    const spawnZ=5;
    Object.assign(rs,{x:0,z:spawnZ,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100,avoided:0,collisions:0,stopTimer:0});
    lastActiveRef.current=-1;
    robot.position.set(rs.x,0,rs.z); robot.rotation.y=rs.angle;
    alignRobotToGround(robot);
    rs.y=robot.position.y;
    attachRobotAccentGlow(robot);
    scene.add(robot);

    // Soft spawn ring — goal-oriented starting marker
    const spawnRingGeo=new THREE.RingGeometry(1.1,1.55,32);
    const spawnRingMat=new THREE.MeshBasicMaterial({color:WORLD_COLORS.pathGlow,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false});
    const spawnRing=new THREE.Mesh(spawnRingGeo,spawnRingMat);
    spawnRing.rotation.x=-Math.PI/2; spawnRing.position.set(0,0.025,spawnZ); spawnRing.renderOrder=1;
    scene.add(spawnRing);
    const spawnDotGeo=new THREE.CircleGeometry(0.45,24);
    const spawnDotMat=new THREE.MeshBasicMaterial({color:WORLD_COLORS.pathGlow,transparent:true,opacity:0.18,side:THREE.DoubleSide,depthWrite:false});
    const spawnDot=new THREE.Mesh(spawnDotGeo,spawnDotMat);
    spawnDot.rotation.x=-Math.PI/2; spawnDot.position.set(0,0.02,spawnZ); spawnDot.renderOrder=1;
    scene.add(spawnDot);

    const beamGroup=new THREE.Group(); beamGroup.name='beams'; scene.add(beamGroup);
    let beamTimer=0;
    function flashBeam(col,len){
      beamGroup.clear();
      const pts=[new THREE.Vector3(0,0.5,0),new THREE.Vector3(0,0.5,-len)];
      const bm=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.85}));
      beamGroup.add(bm); beamTimer=0.9;
    }

    // ── Action flash lights ──────────────────────────────────────────────────
    const actionLights=[];
    function flashActionLight(x,y,z,hexColor,intensity,duration){
      const pl=new THREE.PointLight(hexColor,intensity,7);
      pl.position.set(x,y+0.6,z); scene.add(pl);
      actionLights.push({pl,timer:duration,duration,intensity});
    }

    // ── Camera shake / intro / victory ─────────────────────────────────────
    let camShake=0;
    scene.userData.introTimer=0;
    scene.userData.victoryT=0;
    let lastIntroKey=introKeyRef.current;

    // Initial camera: close and low to frame the robot prominently
    const camPos=new THREE.Vector3(rs.x,3.5,Math.min(rs.z+6,10));
    const camLook=new THREE.Vector3(rs.x,rs.y+0.7,rs.z);
    camera.position.copy(camPos); camera.lookAt(camLook);
    // Robust canvas size fix — try immediately, then fallback with rAF chain
    const _forceSize=()=>{
      const nW=el.clientWidth,nH=el.clientHeight;
      if(nW>4&&nH>4){renderer.setSize(nW,nH);composer.setSize(nW,nH);_setFxaa(nW,nH);camera.aspect=nW/nH;camera.updateProjectionMatrix();}
    };
    _forceSize();
    renderFrame();
    // Second pass on next paint — catches flex/tabs that need a layout tick
    requestAnimationFrame(()=>{ _forceSize(); renderFrame(); });
    // Third pass after 200ms — catches any tab-switch or animation-based layout delays
    const _sizeTimer=setTimeout(()=>{ _forceSize(); renderFrame(); }, 200);
    const movId=robotConfig.movementId||'wheels';
    const blocks=codeBlocks||[];
    let lastTime=performance.now()/1000;
    let trailTimer=0;

    const ro=new ResizeObserver(()=>{
      if(!el) return;
      const nW=Math.max(el.clientWidth,1),nH=Math.max(el.clientHeight,1);
      renderer.setSize(nW,nH); composer.setSize(nW,nH); camera.aspect=nW/nH; camera.updateProjectionMatrix();
    });
    ro.observe(el);

    let firstTick=true;
    let pageVisible=true;
    const onVis=()=>{ pageVisible=document.visibilityState!=='hidden'; };
    document.addEventListener('visibilitychange',onVis);
    const tick=()=>{
      rafRef.current=requestAnimationFrame(tick);
      if(!pageVisible) return;
      try {
      // Second-chance size fix — catches any remaining layout-before-paint edge cases
      if(firstTick){
        firstTick=false;
        const nW=el.clientWidth,nH=el.clientHeight;
        if(nW>4&&nH>4){renderer.setSize(nW,nH);composer.setSize(nW,nH);_setFxaa(nW,nH);camera.aspect=nW/nH;camera.updateProjectionMatrix();}
      }
      const now=performance.now()/1000;
      const dt=Math.min(now-lastTime,0.05); lastTime=now;
      rs.t+=dt;
      // Pulse the spawn ring
      spawnRing.material.opacity=0.35+Math.sin(rs.t*2.5)*0.35;
      spawnRing.position.set(rs.x,0.025,rs.z);
      spawnDot.position.set(rs.x,0.02,rs.z);
      if(beamTimer>0){beamTimer-=dt; if(beamTimer<=0) beamGroup.clear();}
      fpsRef.current.frames++;
      if(now-fpsRef.current.last>=1){onFpsUpdate?.(fpsRef.current.frames); fpsRef.current.frames=0; fpsRef.current.last=now;}

      // ── Action flash lights decay ─────────────────────────────────────────
      for(let ai=actionLights.length-1;ai>=0;ai--){
        const al=actionLights[ai];
        al.timer-=dt;
        al.pl.intensity=al.intensity*(al.timer/al.duration);
        if(al.timer<=0){scene.remove(al.pl);actionLights.splice(ai,1);}
      }

      // ── Camera shake ──────────────────────────────────────────────────────
      if(camShake>0.005){
        camShake*=0.78;
        camera.position.x+=(Math.random()-0.5)*camShake;
        camera.position.y+=Math.random()*camShake*0.4;
      } else { camShake=0; }

      // Always call robot's own animation (propellers, legs, lights, etc.)
      if(robot.userData.animate) robot.userData.animate(rs.t);
      if(introKeyRef.current!==lastIntroKey){ lastIntroKey=introKeyRef.current; scene.userData.introTimer=3.2; scene.userData.victoryT=0; rs.done=false; }
      if(scene.userData.introTimer>0) scene.userData.introTimer-=dt;
      if(scene.userData.atmo?.update) scene.userData.atmo.update(rs.t, dt, { x: rs.x, z: rs.z });
      if(scene.userData.pollen?.update) scene.userData.pollen.update(rs.t, dt);
      if(scene.userData.decor?.update) scene.userData.decor.update(rs.t);
      if(scene.userData.forestZones?.length){
        let zIdx=0;
        if(scene.userData.isFoxChase){
          zIdx=calcFoxZoneIndex(rs,scene.userData.forestZones);
        } else {
        for(let zi=0;zi<scene.userData.forestZones.length;zi++){
          if(rs.z<=scene.userData.forestZones[zi].z+2) zIdx=zi;
        }
        }
        const zd=scene.userData.forestZones[zIdx];
        if(zd&&zd.num!==lastZoneRef.current){
          lastZoneRef.current=zd.num;
          onZoneChange?.({ num:zd.num, name:zd.name, color:zd.col });
        }
      }

      const mode=modeRef.current;

      if((mode==='running'||mode==='step')&&!rs.done){
        if(blocks.length>0){
          if(rs.step>=blocks.length){rs.done=true;}
          else{
            if(rs.stepTime===0) rs.currentDur=getBlockDuration(blocks[rs.step]);
            rs.stepTime+=dt;
            const bk=blocks[rs.step];
            // Collision stop — freeze movement for 0.8s after hitting obstacle
            if((rs.stopTimer||0)>0){
              rs.stopTimer-=dt;
            } else {
              const prevX=rs.x, prevZ=rs.z, prevY=rs.y;
              applyBlock(bk,rs,dt,movId);
              // Check collisions against dynamic arena obstacles
              if(scene.userData.obstacles){
                for(const obs of scene.userData.obstacles){
                  if(!obs||!obs.mesh) continue;
                  const mx=obs.mesh.position.x||0, mz=obs.mesh.position.z||0, my=obs.mesh.position.y||0;
                  const dx=rs.x-mx, dz=rs.z-mz, dy=obs.check3d?(rs.y-my):0;
                  const dist=Math.sqrt(dx*dx+dz*dz+dy*dy);
                  if(dist<(obs.radius||1)+0.45){
                    rs.x=prevX; rs.z=prevZ; rs.y=prevY;
                    rs.stopTimer=0.9;
                    rs.collisions=(rs.collisions||0)+1;
                    rs.hitFlash=true;
                    robotState.onCollision();
                    // Big collision burst + camera shake + flash light
                    simEmit(prevX,prevY+0.3,prevZ,35,0.28);
                    for(let si=0;si<6;si++) simEmit(prevX+(Math.random()-0.5)*0.9,prevY+0.6,prevZ+(Math.random()-0.5)*0.9,5,0.2);
                    camShake=0.38;
                    flashActionLight(prevX,prevY,prevZ,0xff4400,3.5,0.55);
                    break;
                  }
                }
              }
            }
            if(lastActiveRef.current!==rs.step){
              lastActiveRef.current=rs.step;
              onBlockActive?.(rs.step,bk.label||bk.id);
              // ── In-world action feedback (light + particles, no overlay) ──
              if(rs.step<blocks.length){
                const execBk=blocks[rs.step];
                const col=BLOCK_EXEC_COLORS[execBk.id]||'#a78bfa';
                const hexCol=parseInt(col.replace('#',''),16);
                flashActionLight(rs.x,rs.y,rs.z,hexCol,2.8,0.7);
                // Action-specific extra particles
                if(['grab','lift_object'].includes(execBk.id)) simEmit(rs.x,rs.y+0.5,rs.z,8,0.18);
                else if(['jump','leap','fly_up','takeoff'].includes(execBk.id)) for(let q=0;q<6;q++) simEmit(rs.x+(Math.random()-0.5)*0.8,rs.y,rs.z+(Math.random()-0.5)*0.8,3,-0.08);
                else if(['fire_laser','thrust','jet_boost'].includes(execBk.id)) simEmit(rs.x,rs.y+0.2,rs.z,12,0.24);
              }
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
        const targetDist=challenge?.totalDist||22;
        const pathProg=scene.userData.coursePath?.length?calcPathProgress(rs,scene.userData.coursePath):null;
        const prog=blocks.length>0
          ?Math.min(100,(rs.step/Math.max(1,blocks.length))*100)
          :pathProg!=null?pathProg:Math.min(100,(rs.totalDist/targetDist)*100);
        if(pathProg!=null) rs.totalDist=(pathProg/100)*targetDist;
        rs.battery=Math.max(0,100-rs.totalDist*(100/targetDist)*0.08);
        rs.avoided=Math.floor(rs.totalDist/4);
        const hf=rs.hitFlash||false; rs.hitFlash=false;
        onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:prog,done:rs.done,collisions:rs.collisions||0,hitFlash:hf,collected:rs.collectedItems||0,collectedValue:rs.collectedValue||0});
        if(rs.done){onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,avoided:rs.avoided,progress:100,done:true,collisions:rs.collisions||0}); modeRef.current='idle'; robotState.onSuccess();}
      } else if(mode==='idle'){
        // LED heartbeat — stateFx.rotY handles look-around
        animateRobotIdle(robot, rs.t, mode);
      }

      animateRobotWheels(robot, rs, dt, movId, mode);
      emitWheelDust(simEmit, rs, movId, mode);

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
      const stateFx=robotState.apply(rs.t,dt,mode);
      robot.position.y+=stateFx.yOff;
      robot.rotation.y=rs.angle+(stateFx.rotY||0);
      robot.rotation.z=rollZ+(stateFx.rotZ||0);
      robot.rotation.x=(stateFx.rotX||0);
      if((mode==='running'||mode==='step')&&!rs.done){
        trailTimer+=dt;
        if(trailTimer>0.22){ trailTimer=0; execTrail.addPoint(rs.x,rs.y+yOff,rs.z); }
      } else if(mode==='idle'){ execTrail.clear(); trailTimer=0; }
      beamGroup.position.copy(robot.position); beamGroup.rotation.y=rs.angle;
      const largeArenas=['escape_swarm','collect_hard','flight_slalom','dodge_asteroids','flight_acro'];
      const wideArenas=['escape_wall','escape_hunters','flight_rings'];
      const ab=scene.userData.arenaBounds;
      const camMaxX=ab?.camMaxX??(largeArenas.includes(arenaType)?48:22);
      const camMinZ=ab?.camMinZ??(largeArenas.includes(arenaType)?-80:wideArenas.includes(arenaType)?-48:-38);
      const camMaxZ=ab?.camMaxZ??15;
      const isAerial=arenaType==='sky'||arenaType==='hover'||arenaType==='jet'||arenaType==='flight_rings'||arenaType==='flight_acro'||arenaType==='flight_slalom'||arenaType==='dodge_asteroids';
      const camDist=arenaType==='jet'?8:7.5;
      let bx=rs.x+Math.sin(rs.angle+Math.PI)*camDist;
      let bz=rs.z+Math.cos(rs.angle+Math.PI)*camDist;
      let camH=isAerial?Math.max(rs.y+3,4):4.0;
      const introT=scene.userData.introTimer||0;
      if(introT>0){
        const sweep=1-introT/3.2;
        bx=rs.x+Math.sin(sweep*Math.PI*1.4+0.8)*14;
        bz=rs.z+Math.cos(sweep*Math.PI*1.4+0.8)*10+4;
        camH=6+sweep*3;
        if(spawnPL) spawnPL.intensity=0.55+Math.sin(rs.t*8)*0.15;
      } else if(rs.done){
        scene.userData.victoryT=(scene.userData.victoryT||0)+dt;
        const orbit=scene.userData.victoryT*0.55;
        bx=rs.x+Math.sin(orbit)*7;
        bz=rs.z+Math.cos(orbit)*7;
        camH=rs.y+4.5+Math.sin(orbit*2)*0.6;
      }
      const camLerp=rs.done?0.035:introT>0?0.07:0.045;
      camPos.lerp(new THREE.Vector3(Math.max(-camMaxX,Math.min(camMaxX,bx)),camH,Math.max(camMinZ,Math.min(camMaxZ,bz))),camLerp);
      camLook.lerp(new THREE.Vector3(rs.x,rs.y+0.7,rs.z),rs.done?0.05:0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);
      scene.traverse(c=>{
        if(c.name==='cp'){c.rotation.z+=dt*0.9; if(c.material) c.material.emissiveIntensity=0.7+Math.sin(rs.t*3)*0.3;}
        if(c.name&&c.name.startsWith('mover')&&!scene.userData.movers){const idx=parseInt(c.name.slice(5))||0; c.position.x=Math.sin(rs.t*(0.8+idx*0.2))*(4+idx);}
        if(c.name==='beltstripe'){c.position.z=-2+(rs.t*0.8)%12-6;}
      });
      // Update custom obstacle movers for new arena types
      if(scene.userData.movers){
        for(const mv of scene.userData.movers){
          if(mv&&mv.update) mv.update(rs.t,dt,rs);
        }
      }
      // ── Collectibles check ────────────────────────────────────────────────
      if(scene.userData.collectibles){
        for(const col of scene.userData.collectibles){
          if(col.mesh?.visible && !col.collected) col.mesh.rotation.y+=dt*2.2;
          if(col.collected || !(mode==='running'||mode==='step')) continue;
          const cdx=rs.x-col.pos.x, cdz=rs.z-col.pos.z, cdy=(rs.y||0)-(col.pos.y||0.4);
          if(cdx*cdx+cdz*cdz+cdy*cdy<(col.radius||0.85)*(col.radius||0.85)){
            col.collected=true; col.mesh.visible=false;
            rs.collectedItems=(rs.collectedItems||0)+1;
            rs.collectedValue=(rs.collectedValue||0)+(col.value||5);
            simEmit(col.pos.x,(col.pos.y||0.4)+0.4,col.pos.z,6,0.14);
          }
        }
      }
      // ── Finish zone check ──────────────────────────────────────────────────
      if(scene.userData.finishZone && !rs.done && (mode==='running'||mode==='step')){
        const fz=scene.userData.finishZone;
        const fdx=rs.x-fz.x, fdz=rs.z-fz.z;
        const fdy=fz.y3d!=null?(rs.y-fz.y3d):0;
        if(Math.sqrt(fdx*fdx+fdz*fdz+fdy*fdy)<(fz.radius||3.5)){
          rs.done=true;
          scene.userData.victoryT=0;
          robotState.onSuccess();
          for(let fi=0;fi<8;fi++) simEmit(rs.x+(Math.random()-0.5)*2,rs.y+0.8+Math.random(),rs.z+(Math.random()-0.5)*2,12,0.28);
        }
      }
      renderFrame();
      } catch(err){ console.warn('[SimCanvas tick]',err); }
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{
      document.removeEventListener('visibilitychange',onVis);
      clearTimeout(_sizeTimer);
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      execTrail.dispose?.();
      composer.dispose?.();
      if(el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig,arenaType,challengeKey,challenge?.totalDist,challenge?.obstacles,introKey]);
  return <div ref={wrapRef} className="ll-sim-wrap" style={{width:'100%',height:'100%',minHeight:0}}/>;
}

function RunCountdown({ onDone }) {
  const [phase, setPhase] = useState(3);
  useEffect(() => {
    if (phase < 0) { onDone(); return undefined; }
    const delay = phase === 0 ? 650 : 780;
    const t = setTimeout(() => setPhase((p) => p - 1), delay);
    return () => clearTimeout(t);
  }, [phase, onDone]);
  const label = phase > 0 ? String(phase) : phase === 0 ? 'GO!' : null;
  if (label == null) return null;
  return (
    <div className="ll-countdown-overlay" aria-live="polite">
      <div className={`ll-countdown-num ${phase === 0 ? 'll-countdown-go' : ''}`} key={label}>{label}</div>
      <div className="ll-countdown-sub">Get ready!</div>
    </div>
  );
}

function VictoryCelebration({ xp, medal, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);
  const pieces = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    color: ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899', '#a78bfa'][i % 5],
    rot: `${Math.random() * 360}deg`,
  })), []);
  return (
    <div className="ll-victory-overlay" aria-live="polite">
      <div className="ll-victory-burst">
        <div className="ll-victory-stars">✨🏆✨</div>
        <div className="ll-victory-title">Level Complete!</div>
        {medal && <div className="ll-victory-medal">{medal}</div>}
        {xp > 0 && <div className="ll-victory-xp">+{xp} XP</div>}
      </div>
      {pieces.map((p) => (
        <span key={p.id} className="ll-confetti" style={{ left: p.left, animationDelay: p.delay, background: p.color, '--rot': p.rot }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL BLOCKLY WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
const BB_CATS = [
  { name:'⚡ Events',    icon:'⚡', color:'#e11d48' },
  { name:'🚀 Move',     icon:'🚀', color:'#3b82f6' },
  { name:'🔁 Control',  icon:'🔁', color:'#f97316' },
  { name:'👁 Sensors',  icon:'👁', color:'#22c55e' },
  { name:'🧠 AI',       icon:'🧠', color:'#a855f7' },
  { name:'⚙️ Tools',   icon:'⚙️', color:'#ec4899' },
  { name:'💡 Lights',  icon:'💡', color:'#06b6d4' },
  { name:'📦 Variables',icon:'📦', color:'#f59e0b' },
];

function BlocklyWorkspace({robotConfig,wsRef,highlightId,onBlocksChange}){
  const divRef   = useRef(null);
  const prevHlId = useRef(null);
  const [activeCat, setActiveCat] = useState(BB_CATS[0].name);

  useEffect(()=>{
    const div=divRef.current; if(!div) return;
    registerRobotBlocks();
    const theme  =makeBBTheme();
    const toolbox=buildToolbox(robotConfig);

    const ws=Blockly.inject(div,{
      toolbox, theme,
      grid:{spacing:22,length:4,colour:'#ffffff10',snap:true},
      move:{scrollbars:{horizontal:true,vertical:true},drag:true,wheel:true},
      zoom:{controls:true,wheel:true,startScale:0.72,maxScale:2.4,minScale:0.22,scaleSpeed:1.2},
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

    // Force toolbox to icon-only width via MutationObserver (Blockly sets width via JS inline style)
    const enforceTbNarrow=()=>{
      const tbDiv=div.querySelector('.blocklyToolboxDiv');
      if(!tbDiv) return;
      tbDiv.style.setProperty('width','52px','important');
      tbDiv.style.setProperty('min-width','52px','important');
      tbDiv.style.setProperty('max-width','52px','important');
      tbDiv.style.setProperty('overflow','hidden','important');
      tbDiv.querySelectorAll('.blocklyToolboxCategoryLabel').forEach(el=>{
        el.style.setProperty('display','none','important');
      });
    };
    const tbMo=new MutationObserver(enforceTbNarrow);
    tbMo.observe(div,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
    setTimeout(enforceTbNarrow,30);
    setTimeout(enforceTbNarrow,200);

    const openFirstCategory=()=>{
      try {
        const tb=ws.getToolbox?.();
        const items=tb?.getToolboxItems?.()||[];
        if(items.length>0) tb.selectItem(items[0]);
      } catch { /* ignore */ }
      Blockly.svgResize(ws);
    };
    requestAnimationFrame(openFirstCategory);
    const catTimer=setTimeout(openFirstCategory,150);

    return ()=>{
      clearTimeout(catTimer);
      tbMo.disconnect();
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

  const selectCat=(catName)=>{
    const ws=wsRef.current; if(!ws) return;
    try{
      const tb=ws.getToolbox?.();
      const items=tb?.getToolboxItems?.()||[];
      const item=items.find(it=>it.getName?.()===catName);
      if(item) tb.selectItem(item);
      else tb?.selectCategoryByName?.(catName);
    }catch(e){}
    setActiveCat(catName);
  };

  return (
    <div style={{width:'100%',height:'100%',position:'relative'}}>
      <div ref={divRef} style={{width:'100%',height:'100%'}}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEMS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function SystemsPanel({robotConfig,stats,challenge,profile,isRunning,fps,zoneInfo}){
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
        {(challenge?.isFoxChase||challenge?.id==='fox_battery_chase')&&zoneInfo&&(
          <div style={{marginBottom:10,padding:'8px 10px',borderRadius:10,background:zoneInfo.color+'18',border:`1px solid ${zoneInfo.color}55`}}>
            <div style={{fontSize:8,fontWeight:800,color:zoneInfo.color,letterSpacing:'0.08em'}}>ZONE {zoneInfo.num}/9</div>
            <div style={{fontSize:11,fontWeight:800,color:'#f0f6ff',marginTop:2}}>{zoneInfo.name}</div>
          </div>
        )}
        {[['📏 Distance',stats.dist.toFixed(1)+' m'],['⏱ Time',timeStr],['🪙 Collected',(stats.collected||0)+(stats.collected>0?' items':'')],['💥 Collisions',stats.collisions||0]].map(([k,v])=>(
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
      {/* Mission Objectives from COURSE_STORIES */}
      {(()=>{
        const story = COURSE_STORIES[challenge.id];
        if (!story || !story.objectives) return null;
        return (
          <div style={{padding:'10px 12px',borderTop:'1px solid #21262d',flexShrink:0}}>
            <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:0.7,marginBottom:7}}>Mission Objectives</div>
            {story.objectives.map((obj,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:5}}>
                <div style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${challenge.color}88`,flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {stats.progress>=100&&<span style={{fontSize:8,color:challenge.color}}>✓</span>}
                </div>
                <span style={{fontSize:9,color:'#9ca3af',lineHeight:1.4}}>{obj}</span>
              </div>
            ))}
            {story.tip && (
              <div style={{marginTop:6,padding:'5px 7px',background:'rgba(251,191,36,.07)',borderRadius:6,border:'1px solid rgba(251,191,36,.18)'}}>
                <span style={{fontSize:8,color:'#fbbf24'}}>💡 {story.tip}</span>
              </div>
            )}
          </div>
        );
      })()}
      <div style={{marginTop:'auto',padding:'10px 12px',borderTop:'1px solid #21262d',background:'rgba(124,58,237,.06)',flexShrink:0}}>
        <div style={{fontSize:9,color:'#6b7280',lineHeight:1.6}}>{profile.tipIcon} {profile.tip}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME PROGRESS  —  XP, levels, best scores (localStorage via game-progress.js)
// ══════════════════════════════════════════════════════════════════════════════
const DIFF_MAP = {
  dodge_balls:'easy',  escape_wall:'easy',   collect_easy:'easy',   flight_rings:'easy',
  dodge_lasers:'medium',escape_hunters:'medium',collect_medium:'medium',flight_acro:'medium',
  dodge_asteroids:'hard',escape_swarm:'hard', collect_hard:'hard',  flight_slalom:'hard',
  race_easy:'easy',   race_medium:'medium',  race_hard:'hard',
  surv_easy:'easy',   surv_medium:'medium',  surv_hard:'hard',
  expl_easy:'easy',   expl_medium:'medium',  expl_hard:'hard',
  run_easy:'easy',    run_medium:'medium',   run_hard:'hard',
  battle_royale:'easy',deathmatch:'medium',  elimination:'hard',
  block_puzzle:'easy', pressure_path:'medium',idol_heist:'hard',
};
const DIFF_STARS = {easy:2,medium:3,hard:4};
const DIFF_COL   = {easy:'#22c55e',medium:'#f59e0b',hard:'#ef4444'};
const DIFF_LBL   = {easy:'Easy',medium:'Medium',hard:'Hard'};

function getCourseDiff(course){
  if(DIFF_MAP[course.id]) return DIFF_MAP[course.id];
  if((course.obstacles||0)>=15||(course.totalDist||0)>=35) return 'hard';
  if((course.obstacles||0)>=8||(course.totalDist||0)>=24) return 'medium';
  return 'easy';
}

function calcScore(stats,course){
  const diff=getCourseDiff(course);
  const base=diff==='hard'?220:diff==='medium'?160:110;
  const timeBonus=Math.max(0,90-Math.floor(stats.time||0));
  const collPen=(stats.collisions||0)*18;
  const perfectBonus=stats.collisions===0?55:0;
  return Math.max(10,base+timeBonus+perfectBonus-collPen);
}
function calcXpEarned(course,collisions){
  let xp=DIFF_XP[getCourseDiff(course)]||50;
  if(!collisions) xp+=100;
  return xp;
}

const ROBOT_ABILITIES={
  rover:      {icon:'🏎️',tags:['Wheels','Camera','Speed']},
  tank:       {icon:'🚜',tags:['Tracks','Armor','Power']},
  drone:      {icon:'🚁',tags:['Propellers','Camera','Flight']},
  jet:        {icon:'✈️',tags:['Jet Engines','Speed','Agility']},
  spider:     {icon:'🕷️',tags:['6 Legs','Climber','Agile']},
  factory:    {icon:'🦾',tags:['Gripper','Precision','Tools']},
  factorybot: {icon:'🏭',tags:['Arm','Lifting','Logistics']},
  hover:      {icon:'🛸',tags:['Hover Tech','Levitation','Swift']},
  underwater: {icon:'🌊',tags:['Fins','Sonar','Waterproof']},
  humanoid:   {icon:'🧍',tags:['Legs','Hands','Versatile']},
  security:   {icon:'👮',tags:['LIDAR','Patrol','Detect']},
  medbot:     {icon:'🏥',tags:['Medical','Assist','Navigate']},
  firebot:    {icon:'🔥',tags:['Hose','Heavy','Rescue']},
  racedrone:  {icon:'🏁',tags:['Speed','Propellers','Nimble']},
};
const COURSE_FIT={
  dodge:{rover:'Wheels for fast evasion',spider:'Legs for agile dodging',drone:'Fly over obstacles',hover:'Float above dangers',tank:'Armor blocks impact',humanoid:'Reflexive footwork',security:'Patrol agility'},
  escape:{rover:'Speed wheels to outrun',spider:'Six legs sprint',hover:'Rapid hover escape',tank:'Tracks power through',humanoid:'Two-leg sprint'},
  collect:{factory:'Gripper perfect pickup',factorybot:'Industrial arm lifts',rover:'Stable carry platform',humanoid:'Hands grip objects'},
  flight:{drone:'Propellers for precision',jet:'Jet speed through gates',hover:'Levitation expert',racedrone:'Born for aerial speed'},
  air:{drone:'Sky supremacy',jet:'Aerial ace',hover:'High-altitude hover'},
  cavern:{spider:'Cave specialist climber',humanoid:'Explores tight spaces'},
  terrain:{spider:'Natural climber',humanoid:'Bipedal traversal'},
  heavy:{tank:'Heavy terrain king',spider:'Grip-based climbing'},
  factory:{factory:'Industrial precision',factorybot:'Factory floor master'},
  underwater:{underwater:'Deep sea native'},
};
function getRobotFit(robotType,course){
  const cat=course.cat;
  const catFits=COURSE_FIT[cat]||{};
  return catFits[robotType]||null;
}

// ──────────────────────────────────────────────────────────────────────────────
// COURSE RESULTS MODAL
// ──────────────────────────────────────────────────────────────────────────────
function CourseResultsModal({data,course,robotName,onRunAgain,onNextCourse,onClose}){
  const {score,xpEarned,isNewBest,prevBest,collisions,time,totalXp,level}=data;
  const diff=getCourseDiff(course);
  const diffCol=DIFF_COL[diff];
  const perfRun=!collisions;
  const stars=DIFF_STARS[diff]+(perfRun?1:0);
  const timeStr=fmtTime(time||0);
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',backdropFilter:'blur(20px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'linear-gradient(145deg,#161b22,#0d1117)',border:`2px solid ${isNewBest?'#fbbf24':diffCol}`,borderRadius:24,padding:'32px 36px',width:420,maxWidth:'94vw',boxShadow:`0 0 60px ${isNewBest?'#fbbf2444':diffCol+'44'},0 20px 40px #00000066`,position:'relative',overflow:'hidden'}}>
        {/* background glow */}
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at top,${diffCol}18,transparent 60%)`,pointerEvents:'none'}}/>
        {/* new best banner */}
        {isNewBest&&<div style={{position:'absolute',top:0,left:0,right:0,background:'linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)',padding:'6px 0',textAlign:'center',fontSize:11,fontWeight:900,color:'#000',letterSpacing:1}}>🏆 NEW PERSONAL BEST!</div>}
        <div style={{marginTop:isNewBest?28:0}}>
          {/* header */}
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:32,marginBottom:6}}>{perfRun?'🌟':'🏅'}</div>
            <div style={{fontSize:20,fontWeight:900,color:'#f0f6ff',marginBottom:4}}>{perfRun?'Perfect Run!':'Course Complete!'}</div>
            <div style={{fontSize:12,color:'#9ca3af'}}>{course.icon} {course.name}</div>
            {/* stars */}
            <div style={{fontSize:22,marginTop:8,letterSpacing:2}}>
              {Array.from({length:5},(_, i)=><span key={i} style={{opacity:i<stars?1:0.2}}>{i<stars?'⭐':'☆'}</span>)}
            </div>
          </div>
          {/* score big */}
          <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${diffCol}44`,borderRadius:16,padding:'16px 20px',marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#6b7280',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Final Score</div>
            <div style={{fontSize:48,fontWeight:900,color:isNewBest?'#fbbf24':diffCol,lineHeight:1}}>{score}</div>
            {prevBest>0&&<div style={{fontSize:10,color:'#6b7280',marginTop:4}}>Previous best: {prevBest} {isNewBest?<span style={{color:'#22c55e'}}>▲ +{score-prevBest}</span>:''}</div>}
          </div>
          {/* stats row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
            {[['⏱ Time',timeStr],['💥 Hits',collisions||0],['✨ Bonus',perfRun?'+Perfect':'—']].map(([k,v])=>(
              <div key={k} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
                <div style={{fontSize:9,color:'#6b7280',marginBottom:3}}>{k}</div>
                <div style={{fontSize:15,fontWeight:800,color:'#f0f6ff'}}>{v}</div>
              </div>
            ))}
          </div>
          {/* XP earned */}
          <div style={{background:`linear-gradient(135deg,#7c3aed22,#4338ca22)`,border:'1px solid #7c3aed44',borderRadius:12,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:10,color:'#a78bfa',fontWeight:700}}>XP EARNED</div>
              <div style={{fontSize:22,fontWeight:900,color:'#c4b5fd'}}>+{xpEarned} XP</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,color:'#6b7280'}}>Total XP</div>
              <div style={{fontSize:16,fontWeight:800,color:'#f0f6ff'}}>{totalXp} XP</div>
              <div style={{fontSize:10,color:'#7c3aed'}}>Level {level}</div>
            </div>
          </div>
          {/* action buttons */}
          <div style={{display:'flex',gap:8}}>
            <button onClick={onRunAgain} style={{flex:1,padding:'11px 0',borderRadius:10,border:'1px solid #22c55e44',background:'linear-gradient(135deg,#22c55e22,#16a34a11)',color:'#22c55e',fontWeight:800,fontSize:13,cursor:'pointer'}}>▶ Run Again</button>
            <button onClick={onNextCourse} style={{flex:1,padding:'11px 0',borderRadius:10,border:`1px solid ${diffCol}44`,background:`linear-gradient(135deg,${diffCol}22,${diffCol}11)`,color:diffCol,fontWeight:800,fontSize:13,cursor:'pointer'}}>⏭ Next Course</button>
            <button onClick={onClose} style={{padding:'11px 14px',borderRadius:10,border:'1px solid #30363d',background:'#21262d',color:'#8b949e',fontWeight:700,fontSize:12,cursor:'pointer'}}>✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// GAME COURSE PICKER  —  robot-specific, difficulty-tiered game-like selector
// ──────────────────────────────────────────────────────────────────────────────
function CourseTierCard({course,robotName,robotType,onSelect,currentId}){
  const diff=getCourseDiff(course); const diffCol=DIFF_COL[diff];
  const best=GameProgress.getBest(robotName,course.id);
  const sel=course.id===currentId;
  const pd=PROFILE_DATA[robotType]||PROFILE_DATA.rover;
  const fit=getRobotFit(robotType,course);
  const isRec=course.rec.some(r=>pd.recKeys.includes(r));
  const stars=DIFF_STARS[diff];
  return(
    <div onClick={()=>onSelect(course)}
      style={{borderRadius:14,border:`2px solid ${sel?diffCol:diffCol+'40'}`,background:sel?`linear-gradient(135deg,${diffCol}28,${diffCol}14)`:`linear-gradient(135deg,#161b22,#0d1117)`,padding:'14px 16px',cursor:'pointer',transition:'all .15s',position:'relative',boxShadow:sel?`0 0 20px ${diffCol}44`:'none',display:'flex',flexDirection:'column',gap:8}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 6px 24px ${diffCol}44`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=sel?`0 0 20px ${diffCol}44`:'none';}}>
      {sel&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,borderRadius:'12px 12px 0 0',background:`linear-gradient(90deg,transparent,${diffCol},transparent)`}}/>}
      {/* top row */}
      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
        <div style={{width:42,height:42,borderRadius:11,background:`linear-gradient(135deg,${diffCol}44,${diffCol}22)`,border:`1px solid ${diffCol}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{course.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:900,color:'#f0f6ff',lineHeight:1.3,marginBottom:3}}>{course.name}</div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            <span style={{fontSize:8,color:diffCol,background:diffCol+'22',borderRadius:4,padding:'1px 6px',fontWeight:800}}>{DIFF_LBL[diff]}</span>
            {isRec&&<span style={{fontSize:8,color:'#fbbf24',background:'#fbbf2422',borderRadius:4,padding:'1px 6px',fontWeight:800}}>⭐ PERFECT FIT</span>}
          </div>
        </div>
        <div style={{fontSize:14,letterSpacing:1,flexShrink:0}}>{Array.from({length:4},(_,i)=><span key={i} style={{opacity:i<stars?0.9:0.18}}>{i<stars?'⭐':'☆'}</span>)}</div>
      </div>
      {/* description */}
      <div style={{fontSize:9,color:'#8b949e',lineHeight:1.55}}>{course.desc}</div>
      {/* robot fit reason */}
      {fit&&<div style={{fontSize:9,color:diffCol,background:diffCol+'18',borderRadius:6,padding:'4px 8px',fontWeight:700}}>✓ {fit}</div>}
      {/* bottom: best score + play */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:2}}>
        <div>
          {best>0?<div style={{fontSize:10,color:'#fbbf24',fontWeight:800}}>🏆 Best: {best}</div>
           :<div style={{fontSize:9,color:'#4b5563'}}>Not played yet</div>}
        </div>
        <div style={{padding:'6px 14px',borderRadius:8,background:`linear-gradient(135deg,${diffCol},${diffCol}cc)`,color:'#000',fontWeight:900,fontSize:11,letterSpacing:0.5}}>▶ PLAY</div>
      </div>
    </div>
  );
}

function DiffSection({title,diffKey,courses,robotName,robotType,onSelect,currentId,locked,unlockXp,xp}){
  const col=DIFF_COL[diffKey]; const lbl=DIFF_LBL[diffKey]; const stars=DIFF_STARS[diffKey];
  return(
    <div style={{marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <div style={{height:1,flex:1,background:`linear-gradient(90deg,${col}66,transparent)`}}/>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:10,background:col+'22',border:`1px solid ${col}44`}}>
          <span style={{fontSize:12}}>{Array.from({length:stars},(_,i)=>'⭐').join('')}</span>
          <span style={{fontSize:11,fontWeight:900,color:col}}>{lbl}</span>
          {locked&&<span style={{fontSize:9,color:'#6b7280',marginLeft:4}}>🔒 {unlockXp} XP to unlock</span>}
        </div>
        <div style={{height:1,flex:1,background:`linear-gradient(270deg,${col}66,transparent)`}}/>
      </div>
      {locked?(
        <div style={{borderRadius:12,border:'1px dashed #30363d',background:'rgba(255,255,255,0.02)',padding:'20px',textAlign:'center'}}>
          <div style={{fontSize:20,marginBottom:6}}>🔒</div>
          <div style={{fontSize:12,fontWeight:800,color:'#6b7280',marginBottom:4}}>{lbl} courses locked</div>
          <div style={{fontSize:10,color:'#4b5563',marginBottom:8}}>Earn {unlockXp} total XP to unlock</div>
          <div style={{height:6,borderRadius:3,background:'#21262d',overflow:'hidden',width:160,margin:'0 auto'}}>
            <div style={{height:'100%',width:Math.min(100,(xp/unlockXp)*100)+'%',background:'linear-gradient(90deg,#7c3aed,#4338ca)',borderRadius:3,transition:'width .5s'}}/>
          </div>
          <div style={{fontSize:9,color:'#4b5563',marginTop:4}}>{xp} / {unlockXp} XP</div>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
          {courses.map(c=><CourseTierCard key={c.id} course={c} robotName={robotName} robotType={robotType} onSelect={onSelect} currentId={currentId}/>)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE TYPES TAB — 10-type grid with Easy/Medium/Hard selectors
// ─────────────────────────────────────────────────────────────────────────────
// ── Course Intro Modal — story + objectives before launching ─────────────────
function CourseIntroModal({ course, courseType, onConfirm, onBack }) {
  const story = COURSE_STORIES[course.id] || {};
  const diff  = DIFF_MAP[course.id] || 'easy';
  const dc    = { easy:'#22c55e', medium:'#f59e0b', hard:'#ef4444' }[diff];
  const xpReward = courseType?.xp?.[diff] || 100;
  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,.92)',backdropFilter:'blur(18px)',
      zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'system-ui,sans-serif',
    }}>
      <div style={{
        width:'min(580px,94vw)',maxHeight:'90vh',overflowY:'auto',
        background:'linear-gradient(145deg,#0d1117,#161b22)',
        border:`1.5px solid ${course.color}44`,borderRadius:20,
        boxShadow:`0 0 60px ${course.color}33, 0 20px 60px rgba(0,0,0,.8)`,
      }}>
        {/* Hero banner */}
        <div style={{
          background:`linear-gradient(135deg,${course.color}28,${course.color}10)`,
          borderBottom:`1px solid ${course.color}22`,
          padding:'24px 28px 20px',
          position:'relative',
        }}>
          <div style={{fontSize:48,marginBottom:10,lineHeight:1}}>{story.emoji || course.icon}</div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <h2 style={{margin:0,fontSize:20,fontWeight:900,color:'#f0f6ff'}}>{course.name}</h2>
            <span style={{fontSize:9,color:dc,background:dc+'22',borderRadius:5,padding:'2px 8px',fontWeight:800,textTransform:'uppercase'}}>{diff}</span>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {courseType && <span style={{fontSize:8,color:course.color,background:course.color+'18',borderRadius:4,padding:'2px 7px',fontWeight:700}}>{courseType.icon} {courseType.name}</span>}
            <span style={{fontSize:8,color:'#fbbf24',background:'#fbbf2418',borderRadius:4,padding:'2px 7px',fontWeight:700}}>+{xpReward} XP</span>
            <span style={{fontSize:8,color:'#60a5fa',background:'#60a5fa18',borderRadius:4,padding:'2px 7px',fontWeight:700}}>⏱ {course.totalDist||'?'} m</span>
          </div>
        </div>

        <div style={{padding:'20px 28px',display:'flex',flexDirection:'column',gap:16}}>
          {/* Story */}
          {story.story && (
            <div style={{
              padding:'14px 16px',
              background:'rgba(255,255,255,.03)',
              borderRadius:10,border:'1px solid #21262d',
              borderLeft:`3px solid ${course.color}88`,
            }}>
              <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:.7,marginBottom:6}}>Mission Briefing</div>
              <p style={{margin:0,fontSize:12,color:'#c9d1d9',lineHeight:1.65}}>{story.story}</p>
            </div>
          )}

          {/* Objectives */}
          {story.objectives?.length > 0 && (
            <div>
              <div style={{fontSize:8,fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:.7,marginBottom:8}}>🎯 Objectives</div>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {story.objectives.map((obj,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{
                      width:20,height:20,borderRadius:5,flexShrink:0,
                      background:course.color+'22',border:`1.5px solid ${course.color}55`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,color:course.color,fontWeight:900,
                    }}>{i+1}</div>
                    <span style={{fontSize:12,color:'#e6edf3',lineHeight:1.4}}>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          {story.tip && (
            <div style={{
              display:'flex',gap:10,padding:'11px 14px',
              background:'rgba(251,191,36,.07)',borderRadius:10,
              border:'1px solid rgba(251,191,36,.2)',
            }}>
              <span style={{fontSize:18,flexShrink:0}}>💡</span>
              <div>
                <div style={{fontSize:8,fontWeight:700,color:'#fbbf24',textTransform:'uppercase',letterSpacing:.7,marginBottom:3}}>Pro Tip</div>
                <span style={{fontSize:11,color:'#fde68a',lineHeight:1.5}}>{story.tip}</span>
              </div>
            </div>
          )}

          {/* Collectibles */}
          {story.collectibles && (
            <div style={{
              display:'flex',gap:8,padding:'9px 12px',
              background:'rgba(96,165,250,.07)',borderRadius:8,
              border:'1px solid rgba(96,165,250,.2)',
              alignItems:'center',
            }}>
              <span style={{fontSize:14}}>🪙</span>
              <span style={{fontSize:10,color:'#93c5fd'}}>{story.collectibles}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button onClick={onBack} style={{
              flex:1,padding:'12px',borderRadius:10,
              border:'1px solid #30363d',background:'#21262d',
              color:'#9ca3af',fontSize:12,fontWeight:700,cursor:'pointer',
            }}>← Back</button>
            <button onClick={onConfirm} style={{
              flex:2,padding:'12px',borderRadius:10,
              border:`1.5px solid ${course.color}`,
              background:`linear-gradient(135deg,${course.color},${course.color}cc)`,
              color:'#fff',fontSize:14,fontWeight:900,cursor:'pointer',
              boxShadow:`0 4px 20px ${course.color}55`,
              transition:'transform .1s, box-shadow .1s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow=`0 6px 28px ${course.color}77`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 4px 20px ${course.color}55`;}}
            >▶ START MISSION</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseTypesTab({ onSelect, onClose, currentId, robotType }) {
  const [introState, setIntroState] = React.useState(null); // {course, courseType}

  const DIFF_COLORS = { easy:'#22c55e', medium:'#f59e0b', hard:'#ef4444' };
  const DIFF_LABELS = { easy:'Easy', medium:'Medium', hard:'Hard' };
  const DIFF_ICONS  = { easy:'🟢', medium:'🟡', hard:'🔴' };

  // Which course types are accessible for this robot?
  const allowedTypes = robotType ? (ROBOT_COURSE_ACCESS[robotType] || []) : null;

  function isTypeAvailable(ctId) {
    if (!allowedTypes) return true;
    return allowedTypes.includes(ctId);
  }
  function getUnavailReason(ctId) {
    if (!robotType || !ROBOT_UNAVAIL_REASON[ctId]) return null;
    return ROBOT_UNAVAIL_REASON[ctId][robotType] || null;
  }

  function getRobotFitLabel(ct) {
    if (!robotType) return null;
    if (!isTypeAvailable(ct.id)) return null; // locked — no fit label
    if (ct.rec?.includes(robotType))  return { label:'⭐ Best fit',     col:'#22c55e' };
    if (ct.ok?.includes(robotType))   return { label:'✓ Works well',    col:'#f59e0b' };
    if (ct.bad?.includes(robotType))  return { label:'⚠ Not ideal',     col:'#6b7280' };
    return { label:'✓ Compatible',    col:'#60a5fa' };
  }

  if (introState) {
    return (
      <CourseIntroModal
        course={introState.course}
        courseType={introState.courseType}
        onConfirm={() => { onSelect(introState.course); onClose(); }}
        onBack={() => setIntroState(null)}
      />
    );
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
      {COURSE_TYPES.map(ct => {
        const available = isTypeAvailable(ct.id);
        const unavailReason = !available ? getUnavailReason(ct.id) : null;
        const fit = available ? getRobotFitLabel(ct) : null;
        return (
          <div key={ct.id} style={{
            background:'linear-gradient(145deg,#161b22,#0d1117)',
            border:`1px solid ${available ? ct.color+'33' : '#30363d'}`,
            borderRadius:16,
            overflow:'hidden',
            boxShadow:available ? `0 4px 20px ${ct.color}18` : 'none',
            opacity: available ? 1 : 0.55,
            position:'relative',
          }}>
            {/* Lock overlay for unavailable types */}
            {!available && (
              <div style={{
                position:'absolute',inset:0,zIndex:2,
                background:'rgba(13,17,23,.72)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                gap:6,backdropFilter:'blur(2px)',
                borderRadius:16,
              }}>
                <span style={{fontSize:28}}>🔒</span>
                <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff'}}>{ct.name} Locked</span>
                {unavailReason
                  ? <span style={{fontSize:9,color:'#f87171',textAlign:'center',padding:'0 20px',lineHeight:1.4}}>{unavailReason}</span>
                  : <span style={{fontSize:9,color:'#6b7280',textAlign:'center',padding:'0 20px',lineHeight:1.4}}>Not available for this robot type</span>
                }
              </div>
            )}
            {/* Card header */}
            <div style={{
              background:`linear-gradient(135deg,${available ? ct.color+'22' : '#21262d22'},${available ? ct.color+'0a' : 'transparent'})`,
              borderBottom:`1px solid ${available ? ct.color+'22' : '#21262d'}`,
              padding:'14px 16px',
              display:'flex',alignItems:'flex-start',gap:12,
            }}>
              <div style={{
                width:48,height:48,borderRadius:12,flexShrink:0,
                background:`linear-gradient(135deg,${available ? ct.color+'44' : '#30363d'},${available ? ct.color+'22' : '#21262d'})`,
                border:`1.5px solid ${available ? ct.color+'55' : '#30363d'}`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,
                filter: available ? 'none' : 'grayscale(0.7)',
              }}>{ct.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontSize:15,fontWeight:900,color: available ? '#f0f6ff' : '#6b7280'}}>{ct.name}</span>
                  {fit && <span style={{fontSize:8,color:fit.col,background:fit.col+'22',borderRadius:5,padding:'2px 7px',fontWeight:800}}>{fit.label}</span>}
                </div>
                <div style={{fontSize:9,color:'#8b949e',lineHeight:1.5,marginBottom:5}}>{ct.desc}</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:8,color:'#60a5fa',background:'#60a5fa18',borderRadius:4,padding:'2px 6px',fontWeight:700}}>⏱ {ct.duration}</span>
                  <span style={{fontSize:8,color:available ? ct.color : '#6b7280',background:(available ? ct.color : '#6b7280')+'18',borderRadius:4,padding:'2px 6px',fontWeight:700}}>🎯 {ct.focus}</span>
                  {ct.note && <span style={{fontSize:8,color:'#fbbf24',background:'#fbbf2418',borderRadius:4,padding:'2px 6px',fontWeight:700}}>⚡ {ct.note}</span>}
                </div>
              </div>
            </div>
            {/* Difficulty buttons */}
            <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
              {ct.variants.map(v => {
                const course = ALL_COURSES.find(c => c.id === v.id);
                const sel = currentId === v.id;
                const dc = DIFF_COLORS[v.diff];
                const xpReward = ct.xp?.[v.diff] || 100;
                return (
                  <button key={v.diff}
                    onClick={() => {
                      if (!available || !course) return;
                      setIntroState({ course, courseType: ct });
                    }}
                    disabled={!available}
                    style={{
                      display:'flex',alignItems:'center',gap:10,
                      padding:'10px 12px',borderRadius:10,
                      border:`1.5px solid ${sel ? dc : dc+'44'}`,
                      background:sel ? `linear-gradient(135deg,${dc}30,${dc}18)` : `linear-gradient(135deg,${dc}0f,transparent)`,
                      cursor: available && course ? 'pointer' : 'default',
                      textAlign:'left',
                      transition:'all .12s',
                      opacity: available ? 1 : 0.4,
                    }}
                    onMouseEnter={e=>{ if(available){e.currentTarget.style.transform='translateX(3px)'; e.currentTarget.style.borderColor=dc+'88'; e.currentTarget.style.boxShadow=`0 3px 12px ${dc}33`;} }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=sel?dc:dc+'44'; e.currentTarget.style.boxShadow=''; }}
                  >
                    <span style={{fontSize:16,flexShrink:0}}>{DIFF_ICONS[v.diff]}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                        <span style={{fontSize:11,fontWeight:800,color:'#f0f6ff'}}>{v.name}</span>
                        <span style={{fontSize:8,color:dc,background:dc+'22',borderRadius:4,padding:'1px 5px',fontWeight:700}}>{DIFF_LABELS[v.diff]}</span>
                        {sel && <span style={{fontSize:8,color:'#22c55e',background:'#22c55e22',borderRadius:4,padding:'1px 5px',fontWeight:800}}>▶ ACTIVE</span>}
                      </div>
                      <div style={{fontSize:9,color:'#6b7280',lineHeight:1.3}}>{v.tip}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:9,color:'#fbbf24',fontWeight:800}}>+{xpReward} XP</div>
                      <div style={{fontSize:8,color:'#4b5563'}}>{v.minutes} min</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorldPicker({ onSelect, onClose, currentId, robotType, robotName }) {
  const [tab, setTab]   = useState('types');
  const [cat, setCat]   = useState('all');
  const prog= GameProgress.get(robotName||'Robot');
  const xp  = prog.xp||0;
  const lvl = GameProgress.level(xp);
  const abilities  = ROBOT_ABILITIES[robotType]||{icon:'🤖',tags:['Robot']};
  // For 'all' tab (legacy worlds)
  const pd  = PROFILE_DATA[robotType] || PROFILE_DATA.rover;
  const isRec=(course)=>course.rec&&course.rec.some(r=>pd.recKeys.includes(r));
  const cats = ['all', ...Object.keys(CAT_META)];
  const shown = cat==='all' ? ALL_COURSES : ALL_COURSES.filter(c=>c.cat===cat);
  const TABS=[{id:'types',label:'🎮 Course Types'},{id:'tracks',label:'🏁 STEM Tracks'},{id:'mine',label:'🎖 My 20 Courses'},{id:'all',label:'🌍 Classic Worlds'}];
  // XP progress bar
  const nextLvlXp = GameProgress.nextXp(lvl);
  const prevLvlXp = LVL_THRESH[lvl-1]||0;
  const lvlPct    = nextLvlXp===Infinity?100:Math.min(100,((xp-prevLvlXp)/(nextLvlXp-prevLvlXp))*100);
  // Catalog courses for this robot
  const catalogId  = ROBOT_TYPE_TO_CATALOG[robotType]||'humanoid';
  const robotCatalogCourses = ROBOT_COURSES[catalogId]||[];
  const tierGroups = [1,2,3,4].map(tier=>({
    tier, ...TIERS[tier],
    courses: robotCatalogCourses.filter(c=>c.tier===tier),
    locked: xp < TIERS[tier].unlockXp,
  }));

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',backdropFilter:'blur(18px)',zIndex:200,display:'flex',flexDirection:'column',fontFamily:'system-ui,sans-serif'}}>
      {/* Robot Profile Header */}
      <div style={{background:'linear-gradient(135deg,#0d1117,#161b22)',borderBottom:'1px solid #21262d',padding:'14px 20px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          {/* Robot avatar */}
          <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7c3aed,#4338ca)',border:'2px solid #7c3aed44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
            {abilities.icon}
          </div>
          {/* Name + level + tags */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              <span style={{fontSize:16,fontWeight:900,color:'#f0f6ff'}}>{robotName||'My Robot'}</span>
              <span style={{fontSize:10,fontWeight:900,color:'#7c3aed',background:'#7c3aed22',border:'1px solid #7c3aed44',borderRadius:6,padding:'2px 8px'}}>Level {lvl}</span>
              <span style={{fontSize:10,color:'#fbbf24',background:'#fbbf2422',border:'1px solid #fbbf2444',borderRadius:6,padding:'2px 8px',fontWeight:700}}>{xp} XP</span>
            </div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:5}}>
              {abilities.tags.map(t=><span key={t} style={{fontSize:8,color:'#60a5fa',background:'#60a5fa18',borderRadius:4,padding:'1px 6px',fontWeight:700}}>{t}</span>)}
            </div>
            {/* XP progress bar */}
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{flex:1,height:5,borderRadius:3,background:'#21262d',overflow:'hidden'}}>
                <div style={{height:'100%',width:lvlPct+'%',background:'linear-gradient(90deg,#7c3aed,#a78bfa)',borderRadius:3,transition:'width .5s'}}/>
              </div>
              {nextLvlXp<Infinity&&<span style={{fontSize:8,color:'#6b7280',whiteSpace:'nowrap'}}>{xp} / {nextLvlXp}</span>}
              {nextLvlXp===Infinity&&<span style={{fontSize:8,color:'#fbbf24',whiteSpace:'nowrap'}}>MAX LEVEL</span>}
            </div>
          </div>
          {/* Close */}
          <button onClick={onClose} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #30363d',background:'#21262d',color:'#e6edf3',cursor:'pointer',fontWeight:700,fontSize:12,flexShrink:0}}>✕ Close</button>
        </div>
        {/* Tab bar */}
        <div style={{display:'flex',gap:4,marginTop:12}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'7px 18px',borderRadius:8,border:`1px solid ${tab===t.id?'#7c3aed':'#30363d'}`,background:tab===t.id?'linear-gradient(135deg,#7c3aed,#4338ca)':'rgba(255,255,255,0.04)',color:tab===t.id?'#fff':'#9ca3af',fontWeight:700,fontSize:11,cursor:'pointer',transition:'all .15s'}}>
              {t.label}
            </button>
          ))}
          <span style={{marginLeft:'auto',fontSize:10,color:'#4b5563',alignSelf:'center'}}>{COURSE_TYPES.length} types · {ALL_COURSES.length} worlds</span>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto',padding:'18px 20px'}}>
        {tab==='types' ? (
          <CourseTypesTab onSelect={onSelect} onClose={onClose} currentId={currentId} robotType={robotType} />
        ) : tab==='tracks' ? (
          <div>
            {ROBOT_TRACKS.map(track=>{
              const pct=GameProgress.getTrackCompletionPct(robotName||'Robot',track.id);
              return (
                <div key={track.id} style={{marginBottom:28}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <span style={{fontSize:24}}>{track.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:900,color:track.color}}>{track.name}</div>
                      <div style={{fontSize:9,color:'#6b7280',marginTop:2}}>{track.desc}</div>
                      <div style={{marginTop:6,height:4,background:'#21262d',borderRadius:2,overflow:'hidden',maxWidth:200}}>
                        <div style={{height:'100%',width:pct+'%',background:track.color,borderRadius:2}}/>
                      </div>
                    </div>
                    <span style={{fontSize:10,color:'#9ca3af'}}>{pct}%</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
                    {track.levels.map(level=>{
                      const done=GameProgress.isTrackLevelCompleted(robotName||'Robot',track.id,level.level);
                      const best=GameProgress.getTrackBest(robotName||'Robot',track.id,level.level);
                      const sel=currentId===level.id;
                      return (
                        <button key={level.id} onClick={()=>{onSelect(trackLevelToCourse({...level,trackName:track.name,trackIcon:track.icon,trackColor:track.color}));onClose();}}
                          style={{padding:'12px',borderRadius:10,border:`2px solid ${sel?track.color:done?track.color+'66':'#30363d'}`,background:done?track.color+'18':'#161b22',cursor:'pointer',textAlign:'left'}}>
                          <div style={{fontSize:10,fontWeight:800,color:track.color,marginBottom:4}}>L{level.level} · {level.totalDist}m {done?'✓':''}</div>
                          <div style={{fontSize:11,fontWeight:800,color:'#f0f6ff',marginBottom:3}}>{level.name}</div>
                          <div style={{fontSize:9,color:'#6b7280',lineHeight:1.4}}>{level.lengthLabel} · ~{level.estMinutes}min · {level.checkpoints} CP</div>
                          {best>0&&<div style={{fontSize:9,color:'#fbbf24',marginTop:6,fontWeight:700}}>Best: {best} pts</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab==='mine' ? (
          <div>
            {tierGroups.map(tg=>(
              <div key={tg.tier} style={{marginBottom:28}}>
                {/* Tier header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <span style={{fontSize:18}}>{tg.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:14,fontWeight:900,color:tg.color}}>Tier {tg.tier}: {tg.name}</span>
                      <span style={{fontSize:9,color:'#6b7280',background:'rgba(255,255,255,0.05)',borderRadius:4,padding:'2px 6px'}}>{tg.courses.length} courses</span>
                      {tg.locked&&<span style={{fontSize:9,color:'#ef4444',background:'#ef444420',borderRadius:4,padding:'2px 8px',fontWeight:800}}>🔒 Unlock at {tg.unlockXp} XP</span>}
                      {!tg.locked&&tg.tier>1&&<span style={{fontSize:9,color:tg.color,background:tg.color+'20',borderRadius:4,padding:'2px 8px',fontWeight:700}}>✓ Unlocked</span>}
                    </div>
                    <div style={{fontSize:9,color:'#4b5563',marginTop:2}}>{tg.xpReward} XP per course · {tg.diff} difficulty</div>
                  </div>
                </div>
                {tg.locked ? (
                  <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,border:`1px solid ${tg.color}33`,padding:'18px',textAlign:'center'}}>
                    <div style={{fontSize:28,marginBottom:6}}>🔒</div>
                    <div style={{fontSize:12,color:tg.color,fontWeight:700}}>Locked — Need {tg.unlockXp} XP</div>
                    <div style={{fontSize:10,color:'#4b5563',marginTop:4}}>You have {xp} XP · Need {tg.unlockXp-xp} more</div>
                    <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center'}}>
                      {tg.courses.map(c=><span key={c.id} style={{fontSize:8,color:'#4b5563',background:'rgba(255,255,255,0.04)',borderRadius:4,padding:'2px 7px'}}>{c.icon} {c.name}</span>)}
                    </div>
                  </div>
                ):(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:10}}>
                    {tg.courses.map(course=>{
                      const sel=course.id===currentId;
                      const best=GameProgress.getBest(robotName||'Robot',course.id);
                      return (
                        <button key={course.id} onClick={()=>{onSelect(course);onClose();}}
                          style={{padding:'14px',borderRadius:12,border:`2px solid ${sel?course.color:course.color+'44'}`,background:sel?`linear-gradient(135deg,${course.color}30,${course.color}18)`:`linear-gradient(135deg,${course.color}12,#0d1117)`,cursor:'pointer',textAlign:'left',transition:'all .15s',position:'relative'}}
                          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 6px 22px ${course.color}44`;}}
                          onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                          {course.hasBoss&&<span style={{position:'absolute',top:8,right:8,fontSize:8,background:'#ef444420',color:'#ef4444',borderRadius:4,padding:'2px 6px',fontWeight:800}}>👹 BOSS</span>}
                          {sel&&<span style={{position:'absolute',top:course.hasBoss?24:8,right:8,fontSize:8,background:'#22c55e20',color:'#22c55e',borderRadius:4,padding:'2px 6px',fontWeight:800}}>✓ ON</span>}
                          <div style={{display:'flex',alignItems:'flex-start',gap:9,marginBottom:7}}>
                            <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${course.color}44,${course.color}22)`,border:`1.5px solid ${course.color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{course.icon}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:800,color:'#f0f6ff',lineHeight:1.3,marginBottom:3}}>{course.name}</div>
                              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                                <span style={{fontSize:7,color:tg.color,background:tg.color+'20',borderRadius:3,padding:'1px 5px',fontWeight:700}}>{tg.icon} {tg.name}</span>
                                <span style={{fontSize:7,color:'#fbbf24',background:'#fbbf2420',borderRadius:3,padding:'1px 5px',fontWeight:700}}>+{course.xpReward||tg.xpReward} XP</span>
                              </div>
                            </div>
                          </div>
                          <div style={{fontSize:9,color:'#8b949e',lineHeight:1.5,marginBottom:7,WebkitLineClamp:2,overflow:'hidden',display:'-webkit-box',WebkitBoxOrient:'vertical'}}>{course.desc}</div>
                          <div style={{fontSize:9,color:'#6b7280',lineHeight:1.4,marginBottom:8,WebkitLineClamp:2,overflow:'hidden',display:'-webkit-box',WebkitBoxOrient:'vertical',fontStyle:'italic'}}>"{course.story.slice(0,75)}..."</div>
                          <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                            <span style={{fontSize:7,color:'#4b5563',background:'rgba(255,255,255,0.05)',borderRadius:3,padding:'1px 5px'}}>🪙 {course.coins} coins</span>
                            <span style={{fontSize:7,color:'#4b5563',background:'rgba(255,255,255,0.05)',borderRadius:3,padding:'1px 5px'}}>💎 {course.gems} gems</span>
                            {best>0&&<span style={{fontSize:9,color:'#fbbf24',fontWeight:800,marginLeft:'auto'}}>🏆 {best}</span>}
                          </div>
                          <div style={{marginTop:8,background:`linear-gradient(135deg,${course.color},${course.color}cc)`,borderRadius:7,padding:'6px',textAlign:'center',fontSize:10,fontWeight:900,color:'#fff',letterSpacing:0.5}}>
                            ▶ PLAY COURSE {course.n}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ):(
          <div>
            {/* Category filter pills */}
            <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:12,scrollbarWidth:'none',flexWrap:'wrap'}}>
              {cats.map(c=>{
                const meta=CAT_META[c]; const active=cat===c;
                const col=c==='all'?'#7c3aed':(meta?.color||'#7c3aed');
                const count=c==='all'?ALL_COURSES.length:ALL_COURSES.filter(x=>x.cat===c).length;
                return(
                  <button key={c} onClick={()=>setCat(c)} style={{padding:'5px 12px',borderRadius:14,border:`1px solid ${active?col:col+'33'}`,cursor:'pointer',background:active?`linear-gradient(135deg,${col},${col}cc)`:'rgba(255,255,255,0.04)',color:active?'#fff':col,fontSize:10,fontWeight:700,whiteSpace:'nowrap',transition:'all .15s',display:'flex',alignItems:'center',gap:3}}>
                    <span>{c==='all'?'🌐':meta?.icon}</span><span>{c==='all'?'All':meta?.label}</span><span style={{fontSize:8,opacity:0.75}}>({count})</span>
                  </button>
                );
              })}
            </div>
            {/* Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:10}}>
              {shown.map(course=>{
                const rec=isRec(course); const sel=course.id===currentId;
                const catMeta=CAT_META[course.cat];
                const best=GameProgress.getBest(robotName||'Robot',course.id);
                return(
                  <button key={course.id} onClick={()=>{onSelect(course);onClose();}}
                    style={{padding:'14px',borderRadius:12,border:`2px solid ${sel?course.color:rec?course.color+'55':'#21262d'}`,background:sel?`linear-gradient(135deg,${course.color}30,${course.color}18)`:rec?`linear-gradient(135deg,${course.color}18,${course.color}08)`:'linear-gradient(135deg,#161b22,#0d1117)',cursor:'pointer',textAlign:'left',transition:'all .15s',position:'relative',boxShadow:sel?`0 0 20px ${course.color}44`:rec?`0 0 10px ${course.color}22`:'none'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 4px 20px ${course.color}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=sel?`0 0 20px ${course.color}44`:rec?`0 0 10px ${course.color}22`:'none';}}>
                    {rec&&<span style={{position:'absolute',top:8,right:8,fontSize:8,background:course.color+'33',color:course.color,borderRadius:5,padding:'2px 6px',fontWeight:900}}>⭐ FIT</span>}
                    {sel&&<span style={{position:'absolute',top:8,right:rec?32:8,fontSize:8,background:'#22c55e33',color:'#22c55e',borderRadius:5,padding:'2px 6px',fontWeight:900}}>✓ ON</span>}
                    <div style={{display:'flex',alignItems:'flex-start',gap:9,marginBottom:7}}>
                      <div style={{width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${course.color}33,${course.color}18)`,border:`1px solid ${course.color}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:18}}>{course.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:800,color:'#f0f6ff',lineHeight:1.3,marginBottom:2}}>{course.name}</div>
                        <div style={{fontSize:8,color:catMeta?.color||'#6b7280',background:(catMeta?.color||'#6b7280')+'22',borderRadius:3,padding:'1px 4px',display:'inline-block',fontWeight:700}}>{catMeta?.icon} {catMeta?.label}</div>
                      </div>
                    </div>
                    <div style={{fontSize:9,color:'#8b949e',lineHeight:1.5,marginBottom:6}}>{course.desc}</div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',gap:4}}>
                        <span style={{fontSize:7,color:'#6b7280',background:'rgba(255,255,255,0.05)',borderRadius:3,padding:'1px 4px'}}>🏁 {course.obstacles}</span>
                        <span style={{fontSize:7,color:'#6b7280',background:'rgba(255,255,255,0.05)',borderRadius:3,padding:'1px 4px'}}>📏 {course.totalDist}m</span>
                      </div>
                      {best>0&&<span style={{fontSize:9,color:'#fbbf24',fontWeight:800}}>🏆 {best}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE LAB PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveLabPage({robotConfig:robotConfigProp,onFpsUpdate,initialChallenge,onChallengeConsumed}){
  const rc=useMemo(()=>{
    try {
      const stored = localStorage.getItem('bb-studio-robot');
      const raw = robotConfigProp || (stored ? JSON.parse(stored) : {});
      return normalizeRobotBuildConfig(raw);
    } catch {
      return normalizeRobotBuildConfig({});
    }
  },[robotConfigProp]);

  const workspaceRef    =useRef(null);
  const customScriptRef =useRef([]);   // custom block palette script
  const clearScriptRef  =useRef(null); // fn to clear custom script
  const gameRootRef     =useRef(null);
  const codeBlocksRef   =useRef([]);
  const simKeyRef       =useRef(0);
  const xpAwardedRef    =useRef(false);
  const failShownRef    =useRef(false);

  const [runMode,      setRunMode]      =useState('idle');
  const [stepTrig,     setStepTrig]     =useState(0);
  const [codeBlocks,   setCodeBlocks]   =useState([]);
  const [highlightId,  setHighlightId]  =useState(null);
  const [blockCount,   setBlockCount]   =useState(0);
  const blockCountRef = useRef(0);
  const [stats,        setStats]        =useState({time:0,dist:0,battery:100,avoided:0,progress:0,collisions:0});
  const [activity,     setActivity]     =useState(['🤖 Build your program in the workspace on the left, then press  ▶ Run!']);
  const [fps,          setFps]          =useState(null);
  const [challengeI,   setChallengeI]   =useState(0);
  const [simKey,       setSimKey]       =useState(0);
  const [showWorlds,   setShowWorlds]   =useState(false);
  const [activeCourse, setActiveCourse] =useState(null);
  const [robotXp,      setRobotXp]      =useState(()=>GameProgress.get(rc?.name||'Robot').xp||0);
  const [hitFlash,     setHitFlash]     =useState(false);
  const [execLabel,    setExecLabel]    =useState(null);  // {text,color} while running
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [showCountdown,setShowCountdown]=useState(false);
  const [introKey,     setIntroKey]     =useState(0);
  const [victory,      setVictory]      =useState(null);  // {xp, medal, coins}
  const [failure,      setFailure]      =useState(null);  // {message, hint}
  const [zoneInfo,     setZoneInfo]     =useState({ num:1, name:'FOREST ENTRANCE', color:'#22c55e' });
  const [drawerOpen,   setDrawerOpen]   =useState(false);
  const [missionOpen,  setMissionOpen]  =useState(true);
  const [studioMode,   setStudioMode]   =useState('edit');
  const [showZoneIntro,setShowZoneIntro]=useState(false);
  const [designerXp,   setDesignerXp]   =useState(()=>DesignerProgress.get(rc?.name||'Robot').designerXp||0);
  const lastMissionZoneRef = useRef(0);
  const [activeCat,    setActiveCat]    =useState('events');
  const [isFullscreen, setIsFullscreen] =useState(false);

  useEffect(()=>{codeBlocksRef.current=codeBlocks;},[codeBlocks]);
  useEffect(()=>{blockCountRef.current=blockCount;},[blockCount]);

  useEffect(()=>{
    if (!initialChallenge) return;
    const course = trackLevelToCourse(initialChallenge);
    if (!course) return;
    setActiveCourse(course);
    xpAwardedRef.current = false;
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunMode('idle');
    setStats({ time:0, dist:0, battery:100, avoided:0, progress:0, collisions:0 });
    setActivity([`🏁 Track: ${initialChallenge.trackName || course.name} — Level ${initialChallenge.level}`, course.desc, course.codeHint ? `💡 ${course.codeHint}` : 'Build your program and press ▶ Run!']);
    onChallengeConsumed?.();
  }, [initialChallenge, onChallengeConsumed]);

  const profile  =useMemo(()=>getSmartProfile(rc),[rc]);
  // If user picked a world via WorldPicker, use that; else use the profile's recommended default
  const challenge=useMemo(()=>{
    if (activeCourse) return activeCourse;
    return profile.challenges[Math.min(challengeI,profile.challenges.length-1)];
  },[activeCourse,profile,challengeI]);

  useEffect(()=>{
    if(!challenge?.isGameMission) return;
    const m=getGameMission(challenge);
    if(!m) return;
    setShowZoneIntro(true);
    const z1=m.zones?.[0];
    setZoneInfo({ num:1, name:z1?.name||'Introduction', color:challenge.color||'#22c55e' });
    lastMissionZoneRef.current=0;
  },[challenge]);

  const isRunning=runMode==='running';
  const isPaused =runMode==='paused';
  const isIdle   =runMode==='idle';

  // Use custom palette script; fall back to Blockly workspace if it has blocks
  const extractBlocks=useCallback(()=>{
    const custom=customScriptRef.current||[];
    if(custom.length>0) return custom;
    return extractActions(workspaceRef.current);
  },[]);

  const doRun=useCallback(()=>{
    const acts=extractBlocks();
    if(acts.length===0){
      setActivity(['⚠️ Click blocks in the palette on the left to build your program, then press Run!']);
      return;
    }
    xpAwardedRef.current=false;
    failShownRef.current=false;
    setVictory(null);
    setFailure(null);
    setCodeBlocks(acts);
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0,collisions:0});
    setHighlightId(null);
    setActiveStepIndex(-1);
    setIntroKey((k) => k + 1);
    setShowCountdown(true);
    setActivity([`⏱ ${rc.name} powering up…`, `Challenge: ${challenge.name}`, `${acts.length} blocks loaded`]);
  },[extractBlocks,rc,challenge]);

  const onCountdownDone=useCallback(()=>{
    setShowCountdown(false);
    setRunMode('running');
    setActivity((a)=>[...a, `${rc.name} GO! 🚀`]);
  },[rc]);

  const doPause=useCallback(()=>setRunMode(m=>m==='paused'?'running':'paused'),[]);

  const doStep=useCallback(()=>{
    if(isIdle){
      const acts=extractBlocks();
      setCodeBlocks(acts);
      simKeyRef.current++; setSimKey(simKeyRef.current);
      setStats({time:0,dist:0,battery:100,avoided:0,progress:0,collisions:0});
      setHighlightId(null);
      setActiveStepIndex(-1);
    }
    setRunMode('step'); setStepTrig(t=>t+1);
  },[isIdle,extractBlocks]);

  const doReset=useCallback(()=>{
    xpAwardedRef.current=false;
    failShownRef.current=false;
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunMode('idle'); setHighlightId(null); setCodeBlocks([]); setExecLabel(null); setActiveStepIndex(-1);
    setShowCountdown(false); setVictory(null); setFailure(null);
    setStats({time:0,dist:0,battery:100,avoided:0,progress:0,collisions:0});
    setActivity(['🔄 Reset! Build your program and press  ▶ Run']);
    const ws=workspaceRef.current;
    if(ws&&!ws.isDisposed) ws.getAllBlocks(false).forEach(b=>{try{b.getSvgRoot().classList.remove('bb-exec-block');}catch(e){}});
  },[]);

  const doClear=useCallback(()=>{
    // Clear custom palette script
    if(clearScriptRef.current) clearScriptRef.current();
    customScriptRef.current=[];
    setBlockCount(0);
    // Also clear Blockly workspace if present
    const ws=workspaceRef.current;
    if(ws&&!ws.isDisposed){
      ws.clear();
      try{
        const dom=new DOMParser().parseFromString('<xml><block type="robot_when_start" x="30" y="30"></block></xml>','text/xml').documentElement;
        Blockly.Xml.domToWorkspace(dom,ws);
      }catch(e){}
    }
    setActivity(['🗑 Script cleared — build your program and press ▶ Run!']);
  },[]);

  const handleBlockActive=useCallback((idx,rawLabel)=>{
    const b=codeBlocksRef.current[idx];
    setActiveStepIndex(idx);
    setHighlightId(b?.blocklyId??null);
    const bid=b?.id||'';
    const text=BLOCK_EXEC_LABELS[bid]||(rawLabel||bid)||'Running…';
    const color=BLOCK_EXEC_COLORS[bid]||'#a78bfa';
    setExecLabel({text,color});
  },[]);

  const challengeRef=useRef(challenge);
  useEffect(()=>{challengeRef.current=challenge;},[challenge]);

  const handleProgress=useCallback((data)=>{
    setStats({time:data.time,dist:data.dist,battery:data.battery,avoided:data.avoided,progress:data.progress,collisions:data.collisions||0,collected:data.collected||0,collectedValue:data.collectedValue||0});
    if(data.hitFlash){ setHitFlash(true); setTimeout(()=>setHitFlash(false),280); }
    if (!data.done && data.battery <= 0 && !failShownRef.current && !xpAwardedRef.current) {
      failShownRef.current = true;
      setRunMode('idle');
      setExecLabel(null);
      setActiveStepIndex(-1);
      setFailure({
        message: 'Battery empty! Your robot needs more power to finish the mission.',
        hint: challengeRef.current?.codeHint || 'Try adding fewer moves, or collect battery pickups along the way!',
      });
    }
    if(data.done && !xpAwardedRef.current){
      xpAwardedRef.current=true;
      setRunMode('idle'); setHighlightId(null); setExecLabel(null); setActiveStepIndex(-1);
      const ch=challengeRef.current;
      const rName=rc.name||'Robot';
      const trackDef = (ch.isTrackLevel || ch.isBonus)
        ? (getTrackLevel(ch.trackId, ch.trackLevel) || getTrackLevelById(ch.id) || { xpReward: ch.xpReward, basePoints: ch.basePoints, totalDist: ch.totalDist, timeLimit: ch.timeLimit })
        : null;
      const score = trackDef ? calcTrackScore(trackDef, data) : calcScore(data, ch);
      const xpEarned = trackDef ? calcTrackXp(trackDef, data) : calcXpEarned(ch, data.collisions||0);
      let isNewBest = false;
      if (ch.isTrackLevel || ch.isBonus) {
        const tr = GameProgress.completeTrackLevel(rName, ch.trackId || 'bonus', ch.trackLevel || 1, score, ch.id, { totalDist: ch.totalDist });
        isNewBest = tr.isNewBest;
        if (!data.collisions) GameProgress.addBadge(rName, 'perfect_run');
      } else {
        isNewBest = GameProgress.setBest(rName, ch.id, score);
      }
      const newXp=GameProgress.addXp(rName,xpEarned);
      setRobotXp(newXp);
      const mission = getGameMission(ch);
      let designerBonus = null;
      if (mission) {
        designerBonus = DesignerProgress.addDesignerXp(rName, 50 + (zoneInfo?.num || 1) * 10, 'Mission complete');
        setDesignerXp(designerBonus.xp);
      }
      const msg = (ch.isTrackLevel || ch.isBonus)
        ? `✅ ${ch.name} complete! ${score} pts · +${xpEarned} XP${isNewBest ? ' · NEW BEST!' : ''}`
        : (isNewBest ? `🏆 NEW BEST: ${score} pts! +${xpEarned} XP` : data.collisions===0 ? `🏆 Perfect run! ${score} pts! +${xpEarned} XP` : `✅ Score: ${score} pts! +${xpEarned} XP`);
      setActivity(a=>[...a, msg]);
    }
  },[rc]);

  const toggleFullscreen=useCallback(()=>{
    const el=gameRootRef.current;
    if(!el) return;
    if(!document.fullscreenElement){
      el.requestFullscreen?.().then(()=>setIsFullscreen(true)).catch(()=>{});
    } else {
      document.exitFullscreen?.().then(()=>setIsFullscreen(false)).catch(()=>{});
    }
  },[]);

  useEffect(()=>{
    const onFs=()=>setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return ()=>document.removeEventListener('fullscreenchange', onFs);
  },[]);

  useEffect(()=>{
    const resizeWs=()=>{
      const ws=workspaceRef.current;
      if(!ws||ws.isDisposed) return;
      Blockly.svgResize(ws);
      try {
        const tb=ws.getToolbox?.();
        const items=tb?.getToolboxItems?.()||[];
        const sel=tb?.getSelectedItem?.();
        if(!sel&&items.length>0) tb.selectItem(items[0]);
      } catch { /* ignore */ }
    };
    requestAnimationFrame(resizeWs);
    const t=setTimeout(resizeWs,120);
    const t2=setTimeout(resizeWs,350);
    return ()=>{ clearTimeout(t); clearTimeout(t2); };
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>{
      const ws=workspaceRef.current;
      if(ws&&!ws.isDisposed) Blockly.svgResize(ws);
    },200);
    return ()=>clearTimeout(t);
  },[]);

  const handleFps=useCallback((f)=>{setFps(f); onFpsUpdate?.(f);},[onFpsUpdate]);
  const handleZoneChange=useCallback((z)=>{
    setZoneInfo(z);
    setActivity((a)=>[...a.slice(-3), `🗺 Zone ${z.num}: ${z.name}`]);
    const ch = challengeRef.current;
    const mission = getGameMission(ch);
    if (mission && z.num !== lastMissionZoneRef.current) {
      lastMissionZoneRef.current = z.num;
      const rName = rc?.name || 'Robot';
      const result = DesignerProgress.clearZone(rName, mission.id, z.num, mission, { experimented: blockCountRef.current > 3 });
      if (result.xpResult) {
        setDesignerXp(result.xpResult.xp);
        setActivity((a) => [...a.slice(-4), `🎨 +${result.xpResult.gained} Designer XP — ${z.name}`]);
      }
      if (z.num >= 10) setStudioMode('edit');
    }
  },[rc]);
  const statusCol=isRunning?'#22c55e':isPaused?'#f59e0b':'#6b7280';
  const statusTxt=isRunning?'Running':isPaused?'Paused':'Ready';

  const selectCat = useCallback((catId) => { setActiveCat(catId); }, []);

  const robotType = detectRobotType(rc);
  const arenaType = challenge?.arenaType || profile?.arenaType || 'ground';

  const arenaThemeLabel = useMemo(() => resolveArenaTheme(arenaType, challenge).label, [arenaType, challenge]);
  const worldLabel = challenge?.isFoxChase ? 'Fox Battery Chase' : arenaThemeLabel;
  const mood = robotMood(stats, isRunning);
  const coins = stats.collectedValue || stats.collected || 0;
  const courseStory = useMemo(() => {
    const mission = getGameMission(challenge);
    if (mission) return getMissionStory(mission, zoneInfo?.num || 1);
    const base = COURSE_STORIES[challenge?.id] || {};
    const logic = getGameLogicForCourse(challenge?.id);
    if (logic || challenge?.gameObjectives) {
      return {
        ...base,
        objectives: challenge?.gameObjectives || logic?.objectives || base.objectives,
        tip: challenge?.codeHint || logic?.codeHint || base.tip,
        story: base.story || challenge?.winCondition || challenge?.desc,
        winCondition: challenge?.winCondition || logic?.winCondition,
        gameType: challenge?.gameType || logic?.gameType,
      };
    }
    return base;
  }, [challenge, zoneInfo?.num]);

  const activeMission = useMemo(() => getGameMission(challenge), [challenge]);

  const selectCourse = useCallback((c) => {
    const enriched = enrichCourseWithGameLogic(c);
    setActiveCourse(enriched);
    setShowWorlds(false);
    simKeyRef.current++;
    setSimKey(simKeyRef.current);
    setRunMode('idle');
    xpAwardedRef.current = false;
    setVictory(null);
    setFailure(null);
    setStats({ time: 0, dist: 0, battery: 100, avoided: 0, progress: 0, collisions: 0 });
    lastMissionZoneRef.current = 0;
    setStudioMode('edit');
    if (enriched?.isGameMission) {
      setShowZoneIntro(true);
      const m = getGameMission(enriched);
      const z1 = m?.zones?.[0];
      setZoneInfo({ num: 1, name: z1?.name || 'Introduction', color: enriched.color || '#22c55e' });
      const logic = getGameLogicForCourse(enriched.id);
      setActivity([
        `🎮 Game Mission: ${enriched.name}`,
        logic?.winCondition || enriched.desc,
        enriched.codeHint ? `💡 ${enriched.codeHint}` : '📖 Zone 1 — explore, then build your first system in Zone 2!',
      ]);
    } else {
      setActivity([
        `${enriched.icon || '🎮'} ${enriched.name}`,
        enriched.winCondition || enriched.desc,
        enriched.codeHint ? `💡 ${enriched.codeHint}` : 'Use IF/ELSE and sensors — not just MOVE forward!',
      ]);
    }
  }, []);

  // Robot-group-exclusive course filtering — exclusive + game-logic courses first
  const robotCourses = useMemo(() => {
    const recKeys = profile?.recKeys || [];
    return filterCoursesForRobot(ALL_COURSES, robotType, recKeys);
  }, [robotType, profile]);

  return (
    <div ref={gameRootRef} className="bb-game-root bb-new-layout">
      {showWorlds && (
        <GameLevelSelect
          courses={robotCourses}
          currentId={challenge.id}
          robotName={rc.name || 'Robot'}
          onSelect={selectCourse}
          onClose={() => setShowWorlds(false)}
        />
      )}

      <CustomCodePanel
        robotType={detectRobotType(rc)}
        scriptRef={customScriptRef}
        clearRef={clearScriptRef}
        onBlockCountChange={setBlockCount}
        onOpenLevels={() => !isRunning && setShowWorlds(true)}
        activeStepIndex={activeStepIndex}
        isRunning={isRunning || runMode === 'step'}
      />

      <div className="bb-center-viewport">
          <div className="bb-viewport-frame" aria-hidden="true" />
          <SimCanvas
            key={simKey}
            robotConfig={rc}
            codeBlocks={codeBlocks}
            runMode={runMode}
            stepTrigger={stepTrig}
            onProgress={handleProgress}
            onFpsUpdate={handleFps}
            arenaType={arenaType}
            challenge={challenge}
            onBlockActive={handleBlockActive}
            introKey={introKey}
            onZoneChange={handleZoneChange}
          />
          {showCountdown && <RunCountdown onDone={onCountdownDone} />}
          {failure && (
            <GameFailureScreen
              message={failure.message}
              hint={failure.hint}
              onRetry={() => { setFailure(null); doReset(); doRun(); }}
              onHint={() => {}}
            />
          )}
          {hitFlash && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,30,30,0.35)', pointerEvents: 'none', zIndex: 8, boxShadow: 'inset 0 0 60px rgba(255,0,0,0.5)' }} />
          )}
          {/* Run/Pause/Stop controls — floating overlay top-right of viewport */}
          <div className="bb-vp-run-controls">
            {isIdle && !showCountdown && (
              <button type="button" className="bb-vp-run-btn" onClick={doRun}>▶ Simulate</button>
            )}
            {isRunning && (
              <button type="button" className="bb-vp-run-btn bb-vp-pause-btn" onClick={doPause}>⏸</button>
            )}
            {isPaused && (
              <button type="button" className="bb-vp-run-btn" onClick={doPause}>▶</button>
            )}
            {(isRunning || isPaused) && (
              <button type="button" className="bb-vp-stop-btn" onClick={doReset}>■ Stop</button>
            )}
            {!isRunning && !isPaused && (
              <button type="button" className="bb-vp-step-btn" onClick={doStep} title="Step">⏭</button>
            )}
            <button type="button" className="bb-vp-icon-btn" onClick={() => !isRunning && setShowWorlds(true)} title="Choose level">🎮</button>
            <button type="button" className="bb-vp-icon-btn" onClick={toggleFullscreen} title="Fullscreen">{isFullscreen ? '⤓' : '⤢'}</button>
          </div>

          {execLabel && isRunning && (
            <div className="bb-exec-pill" style={{ borderColor: execLabel.color, color: execLabel.color }}>
              ⚡ {execLabel.text}
            </div>
          )}

          {showZoneIntro && activeMission && (
            <MissionZoneIntro
              mission={activeMission}
              zoneNum={1}
              onDismiss={() => setShowZoneIntro(false)}
            />
          )}
          {zoneInfo?.num >= 10 && activeMission && (
            <MissionRemixBanner
              mission={activeMission}
              onEnterRemix={() => setStudioMode('edit')}
            />
          )}

          {activeMission ? (
            <MissionStudioPanel
              mission={activeMission}
              challenge={challenge}
              stats={stats}
              zoneInfo={zoneInfo}
              story={courseStory}
              studioMode={studioMode}
              onModeChange={setStudioMode}
              robotName={rc?.name}
              blockCount={blockCount}
              onEndMission={doReset}
            />
          ) : (
            <MissionControlPanel
              challenge={challenge}
              profile={profile}
              robotConfig={rc}
              stats={stats}
              robotXp={robotXp}
              zoneInfo={zoneInfo}
              story={courseStory}
              onEndMission={doReset}
            />
          )}

          <StatsBar
            stats={stats}
            zoneInfo={zoneInfo}
            challenge={challenge}
            isRunning={isRunning}
            fps={fps}
          />
        </div>
    </div>
  );
}
