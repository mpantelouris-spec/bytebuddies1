/**
 * ModularBuilderPage.jsx — ByteBuddies Robotics Lab — Professional Redesign
 * Inspired by: Roblox Studio · Lego Builder · Figma · Tinkercad
 * Single-page layout · Light theme · Drag-to-position · Color customizer
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildRobotModel } from '../services/studio-robot-builder.js';

// ─── THREE.js primitives ─────────────────────────────────────────────────────
const _BOX  = new THREE.BoxGeometry(1, 1, 1);
const _CYL  = new THREE.CylinderGeometry(1, 1, 1, 28);    // ↑ smoother cylinders
const _SPH  = new THREE.SphereGeometry(1, 28, 18);         // ↑ smoother spheres
const _TOR  = new THREE.TorusGeometry(1, 0.3, 14, 52);     // ↑ smoother tori
const _CONE = new THREE.ConeGeometry(1, 1, 18);             // ↑ smoother cones
// Extra geometry types for premium models
const _CAPSULE = new THREE.CapsuleGeometry(1, 1, 8, 20);   // organic joints
const _OCT     = new THREE.OctahedronGeometry(1);           // crystal/gem shapes

function m3(color, met = 0.5, rou = 0.5, em = null, ei = 0.8) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: met, roughness: rou });
  if (em) { mat.emissive = new THREE.Color(em); mat.emissiveIntensity = ei; }
  return mat;
}
function bx(w, h, d, c, met = 0.5, rou = 0.5) {
  const m = new THREE.Mesh(_BOX, m3(c, met, rou)); m.scale.set(w, h, d); m.castShadow = true; m.receiveShadow = true; return m;
}
function cy(r, h, c, met = 0.6, rou = 0.4) {
  const m = new THREE.Mesh(_CYL, m3(c, met, rou)); m.scale.set(r, h, r); m.castShadow = true; return m;
}

// ─── GLTF Model Loader (try real models first, fall back to procedural) ──────
const _gltfLoader = new GLTFLoader();
const _gltfCache  = new Map();

/**
 * Try loading a GLB from /models/bodies/<chassisId>.glb.
 * Returns the THREE.Group on success, null if the file doesn't exist.
 */
async function tryLoadChassisGltf(chassisId) {
  const url = `/models/bodies/${chassisId}.glb`;
  if (_gltfCache.has(url)) {
    const cached = _gltfCache.get(url);
    if (cached === 'MISSING') return null;
    return cached.scene.clone(true);
  }
  return new Promise(resolve => {
    _gltfLoader.load(url,
      gltf => {
        _gltfCache.set(url, gltf);
        resolve(gltf.scene.clone(true));
      },
      undefined,
      () => { _gltfCache.set(url, 'MISSING'); resolve(null); }
    );
  });
}

/** Normalize a GLTF scene to fit in a ~0.55-unit tall bounding box sitting on Y=0 */
function normalizeGltfChassis(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 0.55 / maxDim;
  model.scale.setScalar(scale);
  // Re-compute after scale
  const box2 = new THREE.Box3().setFromObject(model);
  const min2  = box2.min;
  // Shift so bottom sits at Y=0, horizontally centered
  model.position.set(-center.x * scale, -min2.y, -center.z * scale);
  model.traverse(ch => {
    if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; }
  });
  return model;
}

// ─── Studio Robot Builder → Chassis ID Mapping ──────────────────────────────
// Maps every chassis variant ID → { buildKey (studio-robot-builder key), accent, primary }
const CHASSIS_BUILD_MAP = {
  // Spider variants
  'spider-nano':      { buildKey:'spider',     accent:'#00ffaa', primary:'#6B7280' },
  'spider-scout':     { buildKey:'spider',     accent:'#00d9ff', primary:'#374151' },
  'spider-tank':      { buildKey:'battlebot',  accent:'#ff4400', primary:'#1F2937' },
  // Rover variants
  'rover-racer':      { buildKey:'scout',      accent:'#ff6600', primary:'#DC2626' },
  'rover-explorer':   { buildKey:'rover',      accent:'#22c55e', primary:'#B45309' },
  'rover-cargo':      { buildKey:'crawler',    accent:'#22c55e', primary:'#166534' },
  // Drone variants
  'drone-quad':       { buildKey:'drone',      accent:'#3b82f6', primary:'#1E40AF' },
  'drone-hex':        { buildKey:'drone',      accent:'#0ea5e9', primary:'#0F766E' },
  'drone-wing':       { buildKey:'jetplane',   accent:'#6366f1', primary:'#4F46E5' },
  // Humanoid / Mech variants
  'mech-slim':        { buildKey:'mech',       accent:'#38bdf8', primary:'#E5E7EB' },
  'mech-warrior':     { buildKey:'mech',       accent:'#f43f5e', primary:'#1F2937' },
  'mech-heavy':       { buildKey:'droid',      accent:'#f97316', primary:'#0C0A09' },
  // Tracked / Tank variants
  'tank-fast':        { buildKey:'tank',       accent:'#84cc16', primary:'#374151' },
  'tank-heavy':       { buildKey:'tank',       accent:'#f59e0b', primary:'#1C1917' },
  'tank-siege':       { buildKey:'battlebot',  accent:'#ef4444', primary:'#0A0A09' },
  // Hover variants
  'hover-pod':        { buildKey:'hoverbot',   accent:'#67e8f9', primary:'#0284C7' },
  'hover-skiff':      { buildKey:'hoverracer', accent:'#2dd4bf', primary:'#0F766E' },
  'hover-orb':        { buildKey:'hoverbot',   accent:'#a855f7', primary:'#7C3AED' },
  // Underwater variants
  'sub-torpedo':      { buildKey:'submarine',  accent:'#38bdf8', primary:'#1E40AF' },
  'sub-squid':        { buildKey:'submarine',  accent:'#818cf8', primary:'#1E3A8A' },
  'sub-heavy':        { buildKey:'deepseabot', accent:'#22d3ee', primary:'#172554' },
  // Carrier variants
  'carrier-launch':   { buildKey:'spacerover', accent:'#a78bfa', primary:'#7E22CE' },
  'carrier-bus':      { buildKey:'spacerover', accent:'#8b5cf6', primary:'#6D28D9' },
  'carrier-orbital':  { buildKey:'spacerover', accent:'#c4b5fd', primary:'#4C1D95' },
};

/**
 * Build a chassis mesh using the high-quality studio-robot-builder geometry.
 * colorOverride sets primary body color; accentOverride, trimOverride, ledOverride set
 * secondary / trim / LED emissive colors; met/rou override material properties.
 */
function buildChassisMeshFromStudio(chassisId, colorOverride, accentOverride, trimOverride, ledOverride, met, rou) {
  const map = CHASSIS_BUILD_MAP[chassisId] || { buildKey:'spider', accent:'#00d9ff', primary:'#374151' };
  const primaryColor = colorOverride || map.primary;
  const group = buildRobotModel({
    chassisBuildKey: map.buildKey,
    primaryColor,
    accentColor: accentOverride || map.accent,
    ...(trimOverride && { trimColor: trimOverride }),
    ...(ledOverride  && { ledColor:  ledOverride  }),
    ...(met !== undefined && { materialMetalness: met }),
    ...(rou !== undefined && { materialRoughness: rou }),
    sensors: [],
    tools: [],
  });
  group.userData.studioBuild = true;
  return normalizeGltfChassis(group);
}

// ─── Robot Types & Variants ───────────────────────────────────────────────────
const ROBOT_TYPES = [
  { id:'spider',     emoji:'🕷️', name:'Spider',     color:'#7C3AED', stat:'AGI 80',
    baseStats:{spd:70,agi:80,dur:60,pwr:50},
    variants:[
      {id:'compact',  name:'Compact',   desc:'Lightweight & fast',   chassis:'spider-nano',  mods:{agi:+15,spd:+15,dur:-15}, col:'#6B7280'},
      {id:'standard', name:'Standard',  desc:'Balanced & reliable',  chassis:'spider-scout', mods:{},                        col:'#374151'},
      {id:'heavy',    name:'Heavy',     desc:'Armored & tough',      chassis:'spider-tank',  mods:{dur:+20,spd:-10,agi:-10}, col:'#1F2937'},
      {id:'stealth',  name:'Stealth',   desc:'Low-profile infiltrator',chassis:'spider-scout',mods:{agi:+10,spd:+5,dur:-5},  col:'#111827'},
    ],
  },
  { id:'rover',      emoji:'🚗', name:'Rover',      color:'#D97706', stat:'DUR 80',
    baseStats:{spd:60,agi:40,dur:80,pwr:80},
    variants:[
      {id:'scout',    name:'Scout',     desc:'Fast recon vehicle',   chassis:'rover-racer',    mods:{spd:+20,agi:+10,dur:-10}, col:'#DC2626'},
      {id:'standard', name:'Standard',  desc:'Science platform',     chassis:'rover-explorer', mods:{},                        col:'#B45309'},
      {id:'cargo',    name:'Cargo',     desc:'Heavy-duty hauler',    chassis:'rover-cargo',    mods:{dur:+15,spd:-10,pwr:+15}, col:'#166534'},
      {id:'racing',   name:'Racing',    desc:'Maximum velocity',     chassis:'rover-racer',    mods:{spd:+30,dur:-20,agi:+10}, col:'#7F1D1D'},
    ],
  },
  { id:'drone',      emoji:'🚁', name:'Drone',      color:'#0284C7', stat:'SPD 90',
    baseStats:{spd:90,agi:85,dur:40,pwr:60},
    variants:[
      {id:'light',    name:'Light',     desc:'Fast & agile',         chassis:'drone-quad',   mods:{spd:+20,agi:+15,dur:-15}, col:'#93C5FD'},
      {id:'standard', name:'Standard',  desc:'Versatile quad',       chassis:'drone-quad',   mods:{},                        col:'#1E40AF'},
      {id:'heavy',    name:'Heavy',     desc:'Six-arm heavy lifter', chassis:'drone-hex',    mods:{dur:+20,spd:-15,agi:-10}, col:'#0F766E'},
      {id:'wing',     name:'Falcon',    desc:'Fixed-wing long range',chassis:'drone-wing',   mods:{spd:+25,agi:-10,pwr:-10}, col:'#4F46E5'},
    ],
  },
  { id:'humanoid',   emoji:'🦾', name:'Humanoid',   color:'#BE123C', stat:'AGI 60',
    baseStats:{spd:50,agi:60,dur:60,pwr:60},
    variants:[
      {id:'lean',     name:'Lean',      desc:'Lightweight & quick',  chassis:'mech-slim',    mods:{agi:+20,spd:+15,dur:-20}, col:'#E5E7EB'},
      {id:'athletic', name:'Athletic',  desc:'Balanced fighter',     chassis:'mech-warrior', mods:{},                        col:'#1F2937'},
      {id:'tank',     name:'Tank',      desc:'Heavily armored',      chassis:'mech-heavy',   mods:{dur:+25,spd:-15,agi:-10}, col:'#0C0A09'},
      {id:'combat',   name:'Combat',    desc:'Battle-optimized',     chassis:'mech-warrior', mods:{dur:+10,agi:+10,pwr:+10}, col:'#7F1D1D'},
    ],
  },
  { id:'tracked',    emoji:'🪖', name:'Tracked',    color:'#16A34A', stat:'DUR 90',
    baseStats:{spd:30,agi:40,dur:90,pwr:80},
    variants:[
      {id:'scout',    name:'Scout',     desc:'Fast light tracks',    chassis:'tank-fast',    mods:{spd:+20,agi:+10,dur:-20}, col:'#374151'},
      {id:'standard', name:'Standard',  desc:'Classic battle tank',  chassis:'tank-heavy',   mods:{},                        col:'#1C1917'},
      {id:'siege',    name:'Siege',     desc:'Long-range destroyer', chassis:'tank-siege',   mods:{dur:+15,pwr:+20,spd:-10}, col:'#0A0A09'},
      {id:'fortified',name:'Fortified', desc:'Maximum armor rating', chassis:'tank-heavy',   mods:{dur:+30,spd:-15,agi:-15}, col:'#14532D'},
    ],
  },
  { id:'hover',      emoji:'🛸', name:'Hover',      color:'#0891B2', stat:'AGI 90',
    baseStats:{spd:85,agi:90,dur:45,pwr:70},
    variants:[
      {id:'light',    name:'Light',     desc:'Speed pod',            chassis:'hover-pod',    mods:{spd:+15,agi:+15,dur:-10}, col:'#67E8F9'},
      {id:'standard', name:'Standard',  desc:'Gravity pod',          chassis:'hover-pod',    mods:{},                        col:'#0284C7'},
      {id:'skiff',    name:'Platform',  desc:'Cargo capable',        chassis:'hover-skiff',  mods:{pwr:+20,spd:-10,dur:+10}, col:'#0F766E'},
      {id:'sphere',   name:'Sphere',    desc:'Plasma orb, omni-dir', chassis:'hover-orb',    mods:{agi:+20,spd:+10,dur:-15}, col:'#7C3AED'},
    ],
  },
  { id:'underwater', emoji:'🤿', name:'Aqua',       color:'#075985', stat:'DUR 75',
    baseStats:{spd:50,agi:55,dur:75,pwr:65},
    variants:[
      {id:'torpedo',  name:'Torpedo',   desc:'Ultra-fast submarine', chassis:'sub-torpedo',  mods:{spd:+25,agi:+10,dur:-10}, col:'#1D4ED8'},
      {id:'standard', name:'Standard',  desc:'All-depth explorer',   chassis:'sub-torpedo',  mods:{},                        col:'#1E40AF'},
      {id:'squid',    name:'Squid',     desc:'Bio-inspired agile',   chassis:'sub-squid',    mods:{agi:+20,spd:+10,dur:-5},  col:'#1E3A8A'},
      {id:'deep',     name:'Deep',      desc:'Pressure-sphere hull', chassis:'sub-heavy',    mods:{dur:+30,spd:-15,agi:-10}, col:'#172554'},
    ],
  },
  { id:'carrier',    emoji:'🚀', name:'Carrier',    color:'#7E22CE', stat:'PWR 100',
    baseStats:{spd:40,agi:30,dur:80,pwr:100},
    variants:[
      {id:'launch',   name:'Launcher',  desc:'Rapid-deploy rocket',  chassis:'carrier-launch',  mods:{spd:+15,pwr:+20,dur:-10},col:'#7E22CE'},
      {id:'standard', name:'Star Bus',  desc:'Wide-body carrier',    chassis:'carrier-bus',     mods:{},                       col:'#6D28D9'},
      {id:'orbital',  name:'Orbital',   desc:'Ring-station hull',    chassis:'carrier-orbital', mods:{dur:+20,pwr:+20,spd:-10},col:'#4C1D95'},
      {id:'heavy',    name:'Heavy Bus', desc:'Max cargo capacity',   chassis:'carrier-bus',     mods:{dur:+15,pwr:+25,agi:-15},col:'#3B0764'},
    ],
  },
];

const SIZE_OPTIONS = [
  { id:'small',  name:'Small',  emoji:'○',   scale:0.75, wMult:0.7, desc:'Tiny & nimble'   },
  { id:'medium', name:'Medium', emoji:'◎',   scale:1.0,  wMult:1.0, desc:'Standard size'   },
  { id:'large',  name:'Large',  emoji:'●',   scale:1.3,  wMult:1.35,desc:'Big & powerful'  },
  { id:'huge',   name:'Huge',   emoji:'⬤',  scale:1.65, wMult:1.8, desc:'Massive fortress' },
];

// ── Which categories (and how many) each robot type can use ──────────────────
// 0 = category not available for this robot type.
// Each type has a DISTINCT set — spiders don't get armor, drones have no legs, etc.
const SLOT_CAPS = {
  // Spider: agile hunter — legs + arms + sensors + power + AI + lights (NO armor, NO comms)
  spider:    {wheels:0, legs:8,  arms:4,  propulsion:0, sensors:4, power:3, ai:3, comm:0, structure:0, lighting:4},
  // Rover: science explorer — wheels + arms + sensors + full kit (comms for remote science)
  rover:     {wheels:6, legs:0,  arms:4,  propulsion:0, sensors:6, power:4, ai:3, comm:3, structure:4, lighting:4},
  // Drone: aerial platform — propellers + sensors + AI + comms + lights (NO legs, NO armor)
  drone:     {wheels:0, legs:0,  arms:2,  propulsion:8, sensors:6, power:4, ai:4, comm:4, structure:0, lighting:6},
  // Humanoid: general-purpose biped — legs + arms + full kit
  humanoid:  {wheels:0, legs:6,  arms:6,  propulsion:0, sensors:4, power:3, ai:4, comm:3, structure:6, lighting:4},
  // Tracked: armored tank — tracks + arms + heavy armor (limited sensors/AI, few lights)
  tracked:   {wheels:8, legs:0,  arms:3,  propulsion:0, sensors:4, power:4, ai:2, comm:2, structure:8, lighting:2},
  // Hover: speed craft — propulsion + sensors + comms + lights (NO legs, NO armor — too light!)
  hover:     {wheels:0, legs:0,  arms:3,  propulsion:6, sensors:6, power:4, ai:3, comm:4, structure:0, lighting:6},
  // Underwater: submersible — propulsion + sensors + hull armor + comms (NO lights — it's dark!)
  underwater:{wheels:0, legs:0,  arms:4,  propulsion:6, sensors:6, power:4, ai:2, comm:2, structure:4, lighting:0},
  // Carrier: massive platform — everything, max capacity
  carrier:   {wheels:0, legs:0,  arms:8,  propulsion:8, sensors:8, power:6, ai:4, comm:6, structure:6, lighting:8},
};

// ── Per-robot-type attachment positions for each category ────────────────────
// Coordinates are [x, y, z] relative to robot centre.
// x = left/right,  y = up/down (0 = platform floor),  z = front(+)/back(-)
const ROBOT_POSITIONS = {
  spider: {
    // Legs: sockets at the body hull edge (radius 0.20) — matches glowing socket collar positions
    legs:      [[.20,.06,0],[.141,.06,.141],[0,.06,.20],[-.141,.06,.141],
                [-.20,.06,0],[-.141,.06,-.141],[0,.06,-.20],[.141,.06,-.141]],
    // Arms: slightly higher than legs, front quarter of body
    arms:      [[.20,.10,.08],[-.20,.10,.08],[.18,.09,-.08],[-.18,.09,-.08]],
    // Sensors: on top of body dome
    sensors:   [[0,.18,.06],[.08,.16,.04],[-.08,.16,.04],[0,.14,.12],[.06,.15,.09],[-.06,.15,.09]],
    power:     [[0,.08,-.10],[.07,.07,-.08],[-.07,.07,-.08],[0,.07,-.14]],
    ai:        [[0,.14,.04],[.06,.12,.03],[-.06,.12,.03],[0,.11,.09]],
    comm:      [[.10,.16,0],[-.10,.16,0],[0,.17,-.06]],
    structure: [[0,.08,0],[.10,.07,.06],[-.10,.07,.06],[0,.07,-.10],[.11,.06,-.05],[-.11,.06,-.05]],
    lighting:  [[.13,.14,.07],[-.13,.14,.07],[0,.17,.10],[.14,.12,0],[-.14,.12,0],[0,.13,-.11]],
  },
  rover: {
    // Wheels: X = chassis axle (±0.29), Y = axle height (0.10) minus tire radius (0.13) = -0.03
    wheels:    [[.29,-.03,.22],[-.29,-.03,.22],[.29,-.03,0],[-.29,-.03,0],[.29,-.03,-.22],[-.29,-.03,-.22]],
    // Arms: extend from rover front corners
    arms:      [[.22,.22,.10],[-.22,.22,.10],[.20,.18,-.08],[-.20,.18,-.08]],
    // Sensors: on mast or deck
    sensors:   [[0,.28,.14],[.10,.24,.10],[-.10,.24,.10],[0,.22,.20],[.06,.20,.16],[-.06,.20,.16]],
    power:     [[0,.10,-.14],[.09,.09,-.10],[-.09,.09,-.10],[0,.08,-.20]],
    ai:        [[0,.16,.06],[.07,.12,.04],[-.07,.12,.04]],
    comm:      [[.14,.22,0],[-.14,.22,0],[0,.24,-.06]],
    structure: [[0,.10,.08],[.12,.08,.06],[-.12,.08,.06],[0,.08,-.12]],
    lighting:  [[.18,.18,.10],[-.18,.18,.10],[0,.22,.14],[.18,.14,-.06]],
  },
  drone: {
    // Propulsion: sit ON the motor mounts at arm tips (dx*0.265, Y=0.155, dz*0.265 for drone-quad)
    propulsion:[[.265,.16,0],[0,.16,.265],[-.265,.16,0],[0,.16,-.265],
                [.19,.17,.19],[-.19,.17,.19],[.19,.17,-.19],[-.19,.17,-.19]],
    // Arms: hang from body underside
    arms:      [[.16,.09,.16],[-.16,.09,.16],[.14,.07,-.12],[-.14,.07,-.12]],
    // Sensors: below body or on front
    sensors:   [[0,.05,.12],[.08,.07,.10],[-.08,.07,.10],[0,.08,-.08],[.12,.07,0],[-.12,.07,0]],
    power:     [[0,.10,0],[.08,.08,-.06],[-.08,.08,-.06],[0,.06,-.12]],
    ai:        [[0,.14,0],[.06,.12,.04],[-.06,.12,.04],[0,.11,.08]],
    comm:      [[.12,.20,0],[-.12,.20,0],[0,.22,0],[.08,.18,-.08]],
    structure: [[0,.10,.04],[.10,.08,.06],[-.10,.08,.06],[0,.08,-.10]],
    lighting:  [[.20,.12,.12],[-.20,.12,.12],[.20,.12,-.12],[-.20,.12,-.12],[0,.14,.18],[0,.14,-.16]],
  },
  humanoid: {
    // Legs: at hip joints (mech hip is at ±0.06, Y=0.06)
    legs:      [[.065,.06,0],[-.065,.06,0],[.075,.06,.04],[-.075,.06,.04],[.06,.06,-.04],[-.06,.06,-.04]],
    // Arms: at shoulder joints
    arms:      [[.14,.34,0],[-.14,.34,0],[.16,.28,.06],[-.16,.28,.06],[.13,.24,-.06],[-.13,.24,-.06]],
    // Sensors: head height
    sensors:   [[0,.50,.06],[.07,.48,.05],[-.07,.48,.05],[0,.42,.12],[.09,.44,.06],[-.09,.44,.06]],
    power:     [[0,.22,-.06],[.06,.20,-.05],[-.06,.20,-.05],[0,.15,-.10]],
    ai:        [[0,.42,.04],[.05,.38,.05],[-.05,.38,.05],[0,.34,.08]],
    comm:      [[.15,.40,0],[-.15,.40,0],[0,.46,-.06]],
    structure: [[0,.20,.06],[.12,.18,.04],[-.12,.18,.04],[.09,.10,0],[-.09,.10,0],[0,.28,.03],[.12,.14,-.04],[-.12,.14,-.04]],
    lighting:  [[.06,.48,.08],[-.06,.48,.08],[0,.28,.10],[.12,.32,.06],[-.12,.32,.06],[0,.20,-.08]],
  },
  tracked: {
    // Wheels: track housings run along sides at Y=0.10 (sprocket height)
    wheels:    [[.29,.10,.28],[-.29,.10,.28],[.29,.10,.10],[-.29,.10,.10],
                [.29,.10,-.10],[-.29,.10,-.10],[.29,.10,-.28],[-.29,.10,-.28]],
    arms:      [[.20,.22,.20],[-.20,.22,.20],[.22,.18,.10],[-.22,.18,.10]],
    sensors:   [[0,.30,.18],[.12,.26,.12],[-.12,.26,.12],[0,.22,.24],[.08,.20,.18],[-.08,.20,.18]],
    power:     [[0,.10,-.18],[.10,.09,-.12],[-.10,.09,-.12],[0,.08,-.24]],
    ai:        [[0,.20,.06],[.08,.16,.04],[-.08,.16,.04]],
    comm:      [[.16,.26,0],[-.16,.26,0],[0,.28,-.06]],
    structure: [[0,.12,.10],[.16,.10,.08],[-.16,.10,.08],[0,.12,-.10],[.16,.09,-.08],[-.16,.09,-.08],[.18,.08,0],[-.18,.08,0]],
    lighting:  [[.18,.20,.14],[-.18,.20,.14],[0,.24,.18],[.20,.16,-.08]],
  },
  hover: {
    // Propulsion: thruster nozzles underneath/sides (hover-pod thr at ±0.18, Y=0.10)
    propulsion:[[.18,.08,.18],[-.18,.08,.18],[.18,.08,-.18],[-.18,.08,-.18],
                [0,.20,0],[.22,.12,0],[-.22,.12,0]],
    arms:      [[.20,.22,.08],[-.20,.22,.08],[.18,.18,-.08],[-.18,.18,-.08]],
    sensors:   [[0,.32,.14],[.10,.28,.10],[-.10,.28,.10],[0,.24,.18],[.06,.22,.14],[-.06,.22,.14]],
    power:     [[0,.12,-.14],[.10,.10,-.10],[-.10,.10,-.10],[0,.08,-.20]],
    ai:        [[0,.22,.08],[.08,.16,.06],[-.08,.16,.06]],
    comm:      [[.14,.28,0],[-.14,.28,0],[0,.30,0]],
    structure: [[0,.14,.04],[.12,.10,.06],[-.12,.10,.06],[.12,.08,-.06]],
    lighting:  [[.18,.18,.12],[-.18,.18,.12],[.18,.16,-.10],[-.18,.16,-.10],[0,.28,.14],[0,.26,-.12]],
  },
  underwater: {
    // Propulsion: rear thrusters + side props (sub hull centered at Y=0.14)
    propulsion:[[0,.14,-.22],[.14,.14,-.18],[-.14,.14,-.18],[.20,.12,-.12],[-.20,.12,-.12],[0,.08,.20]],
    arms:      [[.18,.16,.14],[-.18,.16,.14],[.16,.12,.08],[-.16,.12,.08]],
    sensors:   [[0,.22,.24],[.07,.20,.20],[-.07,.20,.20],[.14,.18,.14],[-.14,.18,.14],[0,.16,.28]],
    power:     [[0,.10,-.06],[.10,.08,-.04],[-.10,.08,-.04],[0,.07,-.14]],
    ai:        [[0,.20,.06],[.07,.16,.04],[-.07,.16,.04]],
    comm:      [[.14,.26,0],[-.14,.26,0],[0,.28,0]],
    structure: [[0,.12,.04],[.12,.10,.06],[-.12,.10,.06],[0,.14,-.08],[.10,.09,-.06],[-.10,.09,-.06]],
    lighting:  [[.12,.16,.18],[-.12,.16,.18],[0,.18,.22],[.18,.14,0],[-.18,.14,0],[0,.12,-.18]],
  },
  carrier: {
    // Propulsion: 4 main arms + 4 secondary (similar to drone-quad but larger)
    propulsion:[[.28,.22,.28],[-.28,.22,.28],[.28,.22,-.28],[-.28,.22,-.28],
                [.30,.18,0],[-.30,.18,0],[0,.24,.32],[0,.24,-.32]],
    arms:      [[.28,.18,.10],[-.28,.18,.10],[.26,.14,-.08],[-.26,.14,-.08],
                [.24,.10,.18],[-.24,.10,.18],[.24,.10,-.14],[-.24,.10,-.14]],
    sensors:   [[0,.36,.16],[.14,.32,.10],[-.14,.32,.10],[.24,.30,0],[-.24,.30,0],
                [0,.26,-.14],[.14,.28,-.10],[-.14,.28,-.10]],
    power:     [[0,.10,.04],[.14,.08,.08],[-.14,.08,.08],[0,.08,-.18],[.14,.08,-.10],[-.14,.08,-.10]],
    ai:        [[0,.24,.08],[.08,.20,.06],[-.08,.20,.06],[0,.18,.14]],
    comm:      [[.20,.30,.08],[-.20,.30,.08],[0,.34,0],[.24,.26,-.08],[-.24,.26,-.08],[0,.28,-.14]],
    structure: [[0,.14,.10],[.18,.10,.08],[-.18,.10,.08],[.18,.08,-.07],[-.18,.08,-.07],[0,.12,-.14],[.20,.08,0],[-.20,.08,0]],
    lighting:  [[.24,.24,.16],[-.24,.24,.16],[.24,.22,-.14],[-.24,.22,-.14],[0,.30,.22],[0,.30,-.20],[.28,.20,0],[-.28,.20,0],[.20,.16,.20],[-.20,.16,.20]],
  },
};

// Fallback positions used when a robot type has no specific entry for a category
const FALLBACK_POSITIONS = {
  wheels:    [[.36,0,.2],[-.36,0,.2],[.36,0,-.2],[-.36,0,-.2],[.36,0,.05],[-.36,0,.05]],
  legs:      [[.32,0,.17],[-.32,0,.17],[.32,0,0],[-.32,0,0],[.32,0,-.17],[-.32,0,-.17],[.32,0,-.3],[-.32,0,-.3]],
  arms:      [[.38,.22,0],[-.38,.22,0],[.34,.18,-.12],[-.34,.18,-.12]],
  propulsion:[[.28,.18,.28],[-.28,.18,.28],[.28,.18,-.28],[-.28,.18,-.28],[0,.25,.32],[0,.25,-.32]],
  sensors:   [[0,.48,.08],[.17,.42,.06],[-.12,.44,.07],[0,.38,.22],[.2,.36,.1]],
  power:     [[0,.12,-.22],[.17,.1,-.16],[-.17,.1,-.16],[0,.12,-.35]],
  ai:        [[0,.28,.1],[.12,.22,.06],[-.08,.24,.08],[0,.2,.22]],
  comm:      [[.22,.38,0],[-.22,.38,0],[0,.42,-.1]],
  structure: [[0,.14,0],[.18,.12,.14],[-.18,.12,.14],[0,.12,-.22]],
  lighting:  [[.25,.32,.16],[-.25,.32,.16],[0,.4,.2],[.3,.28,0],[-.3,.28,0]],
};

function getDefaultPos(catId, countInCat, robotTypeId) {
  const robotMap = ROBOT_POSITIONS[robotTypeId] || {};
  const slots = robotMap[catId] || FALLBACK_POSITIONS[catId] || [[0,.2,.2]];
  return [...(slots[countInCat % slots.length])];
}

/** Radial outward rotation for legs/arms so geometry points away from body center */
function getSocketRotY(catId, pos) {
  if (catId === 'legs' || catId === 'arms') {
    const [sx, , sz] = pos;
    return Math.atan2(-sz, sx);
  }
  return 0;
}

function getDefaultPosAndRot(catId, countInCat, robotTypeId) {
  const pos = getDefaultPos(catId, countInCat, robotTypeId);
  return { pos, socketRotY: getSocketRotY(catId, pos) };
}
function getPartCatId(partId, robotTypeId) {
  const typeCat = robotTypeId ? ROBOT_PARTS_CATALOG[robotTypeId] : null;
  if (typeCat) {
    for (const [key, cat] of Object.entries(typeCat)) {
      if (cat.parts?.find(p => p.id === partId)) return key;
    }
  }
  for (const tc of Object.values(ROBOT_PARTS_CATALOG)) {
    for (const [key, cat] of Object.entries(tc)) {
      if (cat.parts?.find(p => p.id === partId)) return key;
    }
  }
  for (const cat of PARTS_CATALOG) { if (cat.parts.find(p => p.id === partId)) return cat.id; }
  return 'sensors';
}

// ─── Parts Catalog (130 addable parts across 10 categories!) ────────────────
export const PARTS_CATALOG = [
  { id:'wheels', label:'WHEELS', icon:'🛞', catColor:'#2563eb', bg:'#eff6ff', parts:[
    {id:'wheel-rubber',     n:'Rubber Tire',      emoji:'🛞',color:'#1a1a1a',weight:3,  pw:2,  spd:75, dur:10,desc:'Great grip on roads and paths!'},
    {id:'wheel-racing',     n:'Racing Wheel',     emoji:'⚡',color:'#111827',weight:2,  pw:0,  spd:95, dur:5, desc:'Super fast! Zooms on smooth ground!'},
    {id:'wheel-monster',    n:'Monster Truck',    emoji:'🚛',color:'#2a2a2a',weight:6,  pw:5,  spd:50, dur:25,desc:'Huge wheels handle ANY terrain!'},
    {id:'wheel-allterrain', n:'All-Terrain',      emoji:'🌍',color:'#3D2B1F',weight:4,  pw:3,  spd:65, dur:15,desc:'Goes anywhere! Mud, rocks, sand!'},
    {id:'wheel-micro',      n:'Micro Wheel',      emoji:'🔘',color:'#6B7280',weight:1,  pw:0,  spd:70, dur:5, desc:'Tiny wheels for small spaces!'},
    {id:'wheel-magnetic',   n:'Magnetic Wheel',   emoji:'🧲',color:'#1E3A8A',weight:4,  pw:15, spd:50, dur:20,desc:'Sticks to metal walls! Cool!'},
    {id:'wheel-spiky',      n:'Spiky Wheel',      emoji:'⭐',color:'#7C3AED',weight:3,  pw:5,  spd:55, dur:20,desc:'Spikes help climb steep hills!'},
    {id:'wheel-hover',      n:'Hover Wheel',      emoji:'🌀',color:'#06B6D4',weight:2,  pw:20, spd:80, dur:10,desc:'Floats above the ground! Magic!'},
    {id:'wheel-metal',      n:'Metal Wheel',      emoji:'⚙️',color:'#6B7280',weight:7,  pw:0,  spd:60, dur:35,desc:'Super durable, lasts forever!'},
    {id:'wheel-foam',       n:'Foam Wheel',       emoji:'🫧',color:'#FCA5A5',weight:1,  pw:0,  spd:70, dur:5, desc:'Lightweight and bouncy!'},
    {id:'wheel-sticky',     n:'Sticky Wheel',     emoji:'🟣',color:'#7C3AED',weight:3,  pw:5,  spd:60, dur:15,desc:'Amazing grip, never slips!'},
    {id:'wheel-smooth',     n:'Smooth Wheel',     emoji:'🔵',color:'#0EA5E9',weight:2,  pw:0,  spd:90, dur:5, desc:'Ultra smooth for max speed!'},
    {id:'wheel-hex',        n:'Hexagon Wheel',    emoji:'🔷',color:'#F59E0B',weight:3,  pw:0,  spd:65, dur:15,desc:'6-sided! Looks so cool!'},
    {id:'wheel-square',     n:'Square Wheel',     emoji:'⬜',color:'#374151',weight:4,  pw:0,  spd:40, dur:30,desc:'Bumpy ride but super tough!'},
    {id:'wheel-diamond',    n:'Diamond Wheel',    emoji:'💎',color:'#818CF8',weight:3,  pw:0,  spd:70, dur:20,desc:'Diamond shape for unique moves!'},
    {id:'wheel-ball',       n:'Ball Wheel',       emoji:'🎱',color:'#111827',weight:2,  pw:10, spd:75, dur:10,desc:'Rolls in ANY direction!'},
  ]},
  { id:'legs', label:'LEGS', icon:'🦵', catColor:'#16a34a', bg:'#f0fdf4', parts:[
    {id:'leg-spider',    n:'Spider Leg',    emoji:'🕷️',color:'#374151',weight:5,  pw:5,  spd:70, dur:15,desc:'6 joints! Climbs walls easily!'},
    {id:'leg-humanoid',  n:'Humanoid Leg',  emoji:'🦵',color:'#D1D5DB',weight:8,  pw:8,  spd:60, dur:20,desc:'Walks like a person! Climbs stairs!'},
    {id:'leg-stalker',   n:'Stalker Leg',   emoji:'👣',color:'#4B5563',weight:4,  pw:6,  spd:75, dur:10,desc:'Long smooth legs for sneaking!'},
    {id:'leg-insect',    n:'Insect Leg',    emoji:'🦟',color:'#065F46',weight:3,  pw:5,  spd:80, dur:10,desc:'8 legs! Goes in any direction!'},
    {id:'leg-spring',    n:'Spring Leg',    emoji:'🌀',color:'#EC4899',weight:4,  pw:8,  spd:65, dur:15,desc:'Bouncy! Jumps really high! Boing!'},
    {id:'leg-pogo',      n:'Pogo Leg',      emoji:'⬆️',color:'#F97316',weight:3,  pw:10, spd:70, dur:10,desc:'Extreme jumping power! Boing boing!'},
    {id:'leg-hydraulic', n:'Hydraulic Leg', emoji:'🔧',color:'#1E40AF',weight:10, pw:12, spd:50, dur:35,desc:'Super powerful controlled jumps!'},
    {id:'leg-air',       n:'Air Leg',       emoji:'💨',color:'#BAE6FD',weight:2,  pw:8,  spd:60, dur:8, desc:'Soft landings! Float down gently!'},
    {id:'leg-claw',      n:'Claw Leg',      emoji:'🦞',color:'#B91C1C',weight:7,  pw:10, spd:50, dur:25,desc:'Grabs things AND walks!'},
    {id:'leg-magnetic',  n:'Magnetic Leg',  emoji:'🧲',color:'#1D4ED8',weight:6,  pw:15, spd:45, dur:25,desc:'Sticks to metal ceilings!'},
    {id:'leg-suction',   n:'Suction Leg',   emoji:'🪣',color:'#0891B2',weight:5,  pw:12, spd:50, dur:20,desc:'Climbs glass and smooth walls!'},
    {id:'leg-wheel',     n:'Wheel-Leg',     emoji:'🛞',color:'#059669',weight:4,  pw:8,  spd:70, dur:15,desc:'Walks OR rolls! Best of both!'},
    {id:'leg-tiny',      n:'Tiny Leg',      emoji:'🔩',color:'#9CA3AF',weight:1,  pw:3,  spd:55, dur:8, desc:'Mini legs for small robots!'},
    {id:'leg-standard',  n:'Standard Leg',  emoji:'🦿',color:'#374151',weight:5,  pw:6,  spd:65, dur:20,desc:'Reliable leg for any robot!'},
    {id:'leg-long',      n:'Long Leg',      emoji:'📏',color:'#7C3AED',weight:6,  pw:8,  spd:60, dur:15,desc:'Takes big steps, reaches far!'},
    {id:'leg-thick',     n:'Thick Leg',     emoji:'💪',color:'#6B7280',weight:12, pw:5,  spd:40, dur:45,desc:'Super durable! Handles anything!'},
  ]},
  { id:'arms', label:'ARMS & TOOLS', icon:'🦾', catColor:'#dc2626', bg:'#fff1f2', parts:[
    {id:'arm-gripper',    n:'Gripper Arm',    emoji:'✊',color:'#FF8C00',weight:8,  pw:15, spd:0,dur:15,desc:'Grabs things! Standard robot arm!'},
    {id:'arm-precision',  n:'Precision Arm',  emoji:'🎯',color:'#EC4899',weight:5,  pw:12, spd:0,dur:10,desc:'Super careful and precise!'},
    {id:'arm-power',      n:'Power Arm',      emoji:'💪',color:'#B91C1C',weight:15, pw:25, spd:0,dur:30,desc:'Incredibly strong! Lifts anything!'},
    {id:'arm-soft',       n:'Soft Arm',       emoji:'🤲',color:'#FCA5A5',weight:4,  pw:8,  spd:0,dur:8, desc:"Gentle touch, won't break things!"},
    {id:'tool-drill',     n:'Drill',          emoji:'🔩',color:'#888888',weight:5,  pw:30, spd:0,dur:20,desc:'Spins and drills holes!'},
    {id:'tool-saw',       n:'Saw',            emoji:'🪚',color:'#D97706',weight:6,  pw:25, spd:0,dur:20,desc:'Cuts through materials fast!'},
    {id:'tool-hammer',    n:'Hammer',         emoji:'🔨',color:'#374151',weight:8,  pw:20, spd:0,dur:30,desc:'Smashes and impacts things!'},
    {id:'tool-laser',     n:'Laser Cutter',   emoji:'⚡',color:'#FF00FF',weight:3,  pw:25, spd:0,dur:10,desc:'Laser beam cuts with light!'},
    {id:'arm-extend',     n:'Extending Arm',  emoji:'📐',color:'#8B5CF6',weight:10, pw:25, spd:0,dur:15,desc:'Stretches out to 2 meters!'},
    {id:'arm-spinning',   n:'Spinning Arm',   emoji:'🌀',color:'#0891B2',weight:7,  pw:20, spd:0,dur:15,desc:'Spins really fast! Whirr!'},
    {id:'arm-whip',       n:'Whip Arm',       emoji:'〰️',color:'#F59E0B',weight:4,  pw:15, spd:0,dur:10,desc:'Flexible! Bends around things!'},
    {id:'arm-ball',       n:'Ball Arm',       emoji:'🎱',color:'#111827',weight:6,  pw:15, spd:0,dur:20,desc:'Ball on end for knocking stuff!'},
    {id:'tool-magnet',    n:'Magnet Arm',     emoji:'🧲',color:'#818CF8',weight:4,  pw:20, spd:0,dur:15,desc:'Picks up metal things! Bzzt!'},
    {id:'tool-vacuum',    n:'Vacuum Arm',     emoji:'🌪️',color:'#6B7280',weight:5,  pw:22, spd:0,dur:12,desc:'Sucks things up like a hoover!'},
    {id:'tool-welder',    n:'Welding Arm',    emoji:'🔥',color:'#DC2626',weight:6,  pw:30, spd:0,dur:15,desc:'Joins metal pieces together!'},
    {id:'tool-painter',   n:'Painting Arm',   emoji:'🎨',color:'#EC4899',weight:3,  pw:10, spd:0,dur:8, desc:'Sprays paint! Make things colorful!'},
    {id:'arm-metal',      n:'Metal Arm',      emoji:'⚙️',color:'#4B5563',weight:12, pw:15, spd:0,dur:40,desc:'Super durable metal arm!'},
    {id:'arm-foam',       n:'Foam Arm',       emoji:'🫧',color:'#FCA5A5',weight:2,  pw:8,  spd:0,dur:5, desc:"Light and won't hurt anyone!"},
    {id:'arm-flexible',   n:'Flexible Arm',   emoji:'🌊',color:'#0EA5E9',weight:4,  pw:12, spd:0,dur:10,desc:'Bends in any direction!'},
    {id:'arm-strong',     n:'Super Strong Arm',emoji:'🏋️',color:'#1D4ED8',weight:20, pw:30, spd:0,dur:50,desc:'The strongest arm ever made!'},
  ]},
  { id:'propulsion', label:'PROPELLERS', icon:'🚀', catColor:'#7c3aed', bg:'#faf5ff', parts:[
    {id:'prop-small',    n:'Mini Propeller',  emoji:'🌀',color:'#CBD5E1',weight:1, pw:10,spd:60, dur:10,desc:'Small propeller for flying!'},
    {id:'prop-large',    n:'Mega Propeller',  emoji:'🌀',color:'#94A3B8',weight:3, pw:25,spd:80, dur:15,desc:'Big propeller, heavy lifting!'},
    {id:'thrust-ion',    n:'Ion Thruster',    emoji:'💨',color:'#67E8F9',weight:2, pw:40,spd:90, dur:20,desc:'Electric ion drive, super quiet!'},
    {id:'thrust-rocket', n:'Rocket Booster',  emoji:'🔥',color:'#EF4444',weight:4, pw:60,spd:100,dur:10,desc:'Rocket power! MAXIMUM speed!'},
    {id:'prop-fin',      n:'Hydro Fin',       emoji:'🐟',color:'#3B82F6',weight:2, pw:5, spd:70, dur:20,desc:'Swim fast underwater!'},
    {id:'thrust-plasma', n:'Plasma Jet',      emoji:'⚡',color:'#A855F7',weight:3, pw:50,spd:95, dur:15,desc:'Plasma-powered super thruster!'},
    {id:'prop-dual',     n:'Dual Rotors',     emoji:'🚁',color:'#374151',weight:4, pw:30,spd:85, dur:20,desc:'Two rotors for stable flight!'},
    {id:'prop-turbo',    n:'Turbo Fan',       emoji:'🌪️',color:'#0F766E',weight:3, pw:35,spd:88, dur:15,desc:'Turbofan engine! Super fast!'},
  ]},
  { id:'sensors', label:'SENSORS', icon:'👁️', catColor:'#d97706', bg:'#fffbeb', parts:[
    {id:'sensor-cam',       n:'Camera HD',          emoji:'📷',color:'#1E90FF',weight:1,   pw:5,  spd:0,dur:5, desc:'Sees everything in HD!'},
    {id:'sensor-night',     n:'Night Vision Cam',   emoji:'🌙',color:'#1D4ED8',weight:1.5, pw:10, spd:0,dur:5, desc:'Sees in total darkness!'},
    {id:'sensor-thermal',   n:'Thermal Camera',     emoji:'🌡️',color:'#F97316',weight:1.5, pw:8,  spd:0,dur:5, desc:'Sees heat! Finds warm things!'},
    {id:'sensor-wide',      n:'Wide Angle Camera',  emoji:'🔭',color:'#0891B2',weight:1,   pw:6,  spd:0,dur:5, desc:'Sees everything around it!'},
    {id:'sensor-lidar',     n:'LIDAR Scanner',      emoji:'🔴',color:'#FF3333',weight:3,   pw:15, spd:0,dur:15,desc:'360° laser map of everything!'},
    {id:'sensor-ultra',     n:'Ultrasonic Sensor',  emoji:'📡',color:'#00D9FF',weight:0.5, pw:3,  spd:0,dur:5, desc:'Sonar waves find nearby things!'},
    {id:'sensor-radar',     n:'Radar Sensor',       emoji:'📻',color:'#6B7280',weight:2,   pw:12, spd:0,dur:15,desc:'Detects things far away!'},
    {id:'sensor-prox',      n:'Proximity Sensor',   emoji:'🔔',color:'#F59E0B',weight:0.3, pw:2,  spd:0,dur:5, desc:'Buzzes when something is close!'},
    {id:'sensor-temp',      n:'Temperature Sensor', emoji:'🌡️',color:'#DC2626',weight:0.2, pw:1,  spd:0,dur:5, desc:'Measures how hot or cold!'},
    {id:'sensor-pressure',  n:'Pressure Sensor',    emoji:'💨',color:'#4B5563',weight:0.3, pw:2,  spd:0,dur:5, desc:'Feels pressure like a squeeze!'},
    {id:'sensor-humidity',  n:'Humidity Sensor',    emoji:'💧',color:'#0EA5E9',weight:0.2, pw:1,  spd:0,dur:5, desc:'Knows if the air is wet or dry!'},
    {id:'sensor-light',     n:'Light Sensor',       emoji:'☀️',color:'#FCD34D',weight:0.2, pw:1,  spd:0,dur:5, desc:'Measures how bright it is!'},
    {id:'sensor-accel',     n:'Accelerometer',      emoji:'🏃',color:'#10B981',weight:0.2, pw:2,  spd:0,dur:5, desc:'Feels movement and shaking!'},
    {id:'sensor-gyro',      n:'Gyroscope',          emoji:'🔄',color:'#059669',weight:0.3, pw:2,  spd:0,dur:5, desc:"Knows which way it's tilting!"},
    {id:'sensor-compass',   n:'Compass',            emoji:'🧭',color:'#1D4ED8',weight:0.2, pw:1,  spd:0,dur:5, desc:'Always knows North/South!'},
    {id:'sensor-gps',       n:'GPS',                emoji:'🛰️',color:'#7C3AED',weight:0.5, pw:5,  spd:0,dur:5, desc:'Knows exactly where it is!'},
  ]},
  { id:'power', label:'POWER', icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', parts:[
    {id:'bat-small',   n:'Small Battery',   emoji:'🔋',color:'#059669',weight:1,  pw:0,spd:0,dur:0,desc:'1kg battery. Short run time.'},
    {id:'bat-medium',  n:'Medium Battery',  emoji:'🔋',color:'#047857',weight:2,  pw:0,spd:0,dur:0,desc:'2kg battery. Normal run time!'},
    {id:'bat-large',   n:'Large Battery',   emoji:'🔋',color:'#065F46',weight:4,  pw:0,spd:0,dur:0,desc:'4kg battery. Lasts a long time!'},
    {id:'bat-huge',    n:'Huge Battery',    emoji:'🔋',color:'#064E3B',weight:8,  pw:0,spd:0,dur:0,desc:'8kg! Runs for super long!'},
    {id:'solar',       n:'Solar Panel',     emoji:'☀️',color:'#1D4ED8',weight:2,  pw:0,spd:0,dur:0,desc:'Free power from sunlight!'},
    {id:'wind-gen',    n:'Wind Generator',  emoji:'🌬️',color:'#0891B2',weight:3,  pw:0,spd:0,dur:0,desc:'Makes power from the wind!'},
    {id:'nuclear',     n:'Nuclear Core',    emoji:'☢️',color:'#FDE68A',weight:10, pw:0,spd:0,dur:0,desc:'Unlimited power! Super heavy!'},
    {id:'hydrogen',    n:'Hydrogen Cell',   emoji:'💧',color:'#38BDF8',weight:3,  pw:0,spd:0,dur:0,desc:'Clean power from hydrogen!'},
    {id:'bat-solar',   n:'Battery + Solar', emoji:'🌤️',color:'#10B981',weight:4,  pw:0,spd:0,dur:0,desc:'Battery AND solar backup!'},
    {id:'bat-wind',    n:'Battery + Wind',  emoji:'🌪️',color:'#0891B2',weight:5,  pw:0,spd:0,dur:0,desc:'Battery AND wind power!'},
    {id:'triple-fuel', n:'Triple Fuel',     emoji:'⚡',color:'#F59E0B',weight:8,  pw:0,spd:0,dur:0,desc:'Three power sources in one!'},
    {id:'capacitor',   n:'Capacitor Pack',  emoji:'⚡',color:'#EC4899',weight:2,  pw:0,spd:0,dur:0,desc:'Super fast charging! Instant!'},
  ]},
  { id:'ai', label:'AI BRAINS', icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', parts:[
    {id:'ai-simple',      n:'Simple AI',          emoji:'🧠',color:'#9CA3AF',weight:1,   pw:10,spd:0,dur:0,desc:'Basic brain. Follows simple rules!'},
    {id:'ai-smart',       n:'Smart AI',           emoji:'💡',color:'#F59E0B',weight:2,   pw:20,spd:0,dur:0,desc:'Makes good decisions! Smart!'},
    {id:'ai-super',       n:'Super AI',           emoji:'🌟',color:'#7C3AED',weight:2,   pw:30,spd:0,dur:0,desc:'Expert level! Handles anything!'},
    {id:'ai-ml',          n:'Learning AI',        emoji:'🤖',color:'#EC4899',weight:3,   pw:40,spd:0,dur:0,desc:'Learns and gets smarter over time!'},
    {id:'ai-single',      n:'Single Core CPU',    emoji:'💻',color:'#6B7280',weight:0.5, pw:5, spd:0,dur:0,desc:'Basic processor chip!'},
    {id:'ai-quad',        n:'Quad Core CPU',      emoji:'💻',color:'#374151',weight:1,   pw:15,spd:0,dur:0,desc:'4x processing power! Fast!'},
    {id:'ai-octa',        n:'Octa Core CPU',      emoji:'🖥️',color:'#1E40AF',weight:2,   pw:25,spd:0,dur:0,desc:'8x processing! Super fast!'},
    {id:'ai-quantum',     n:'Quantum Processor',  emoji:'⚛️',color:'#A855F7',weight:3,   pw:50,spd:0,dur:0,desc:'Quantum computing! The future!'},
    {id:'ai-neural',      n:'Neural Network',     emoji:'🕸️',color:'#4F46E5',weight:2,   pw:30,spd:0,dur:0,desc:'Recognizes patterns like a brain!'},
    {id:'ai-logic',       n:'Logic Board',        emoji:'📊',color:'#0891B2',weight:1,   pw:15,spd:0,dur:0,desc:'Follows logical rules. Reliable!'},
    {id:'ai-memory',      n:'Memory Module',      emoji:'💾',color:'#059669',weight:0.5, pw:5, spd:0,dur:0,desc:'Remembers everything!'},
    {id:'ai-personality', n:'Personality Chip',   emoji:'😊',color:'#F97316',weight:0.5, pw:8, spd:0,dur:0,desc:'Gives your robot a personality!'},
  ]},
  { id:'comm', label:'COMMUNICATION', icon:'📡', catColor:'#0891b2', bg:'#ecfeff', parts:[
    {id:'comm-wifi',      n:'WiFi Module',       emoji:'📶',color:'#10B981',weight:0.2,pw:5,  spd:0,dur:5, desc:'Fast wireless internet!'},
    {id:'comm-bluetooth', n:'Bluetooth',         emoji:'📱',color:'#3B82F6',weight:0.2,pw:3,  spd:0,dur:5, desc:'Talks to nearby devices!'},
    {id:'comm-radio',     n:'Radio Module',      emoji:'📻',color:'#F59E0B',weight:0.5,pw:8,  spd:0,dur:10,desc:'Long range radio! 1km!'},
    {id:'comm-sat',       n:'Satellite Link',    emoji:'🛰️',color:'#8B5CF6',weight:1,  pw:20, spd:0,dur:10,desc:'Connects anywhere on Earth!'},
    {id:'comm-laser',     n:'Laser Link',        emoji:'⚡',color:'#00D9FF',weight:0.5,pw:15, spd:0,dur:8, desc:'Super fast laser comms!'},
    {id:'comm-sound',     n:'Sound Transmitter', emoji:'🔊',color:'#EC4899',weight:0.3,pw:5,  spd:0,dur:5, desc:'Makes cool sounds and noises!'},
    {id:'comm-antenna',   n:'Signal Antenna',    emoji:'📡',color:'#6B7280',weight:0.5,pw:8,  spd:0,dur:10,desc:'Boosts all signal strength!'},
    {id:'comm-mobile',    n:'Mobile Module',     emoji:'📲',color:'#16A34A',weight:0.5,pw:10, spd:0,dur:8, desc:'Uses the phone network!'},
  ]},
  { id:'structure', label:'ARMOR', icon:'🛡️', catColor:'#374151', bg:'#f9fafb', parts:[
    {id:'armor-light',    n:'Light Plating',      emoji:'🛡️',color:'#9CA3AF',weight:3,  pw:0, spd:3,  dur:15,desc:'Small protection, stays fast!'},
    {id:'armor-medium',   n:'Medium Armor',       emoji:'⚔️',color:'#6B7280',weight:6,  pw:0, spd:0,  dur:30,desc:'Good protection! Balanced!'},
    {id:'armor-heavy',    n:'Heavy Armor',        emoji:'🦺',color:'#374151',weight:12, pw:0, spd:-5, dur:50,desc:'Lots of protection! Very heavy!'},
    {id:'armor-reflect',  n:'Reflective Armor',   emoji:'🪞',color:'#BAE6FD',weight:5,  pw:0, spd:0,  dur:25,desc:'Bounces attacks away!'},
    {id:'armor-spike',    n:'Spike Armor',        emoji:'🔺',color:'#DC2626',weight:8,  pw:0, spd:0,  dur:30,desc:'Pointy spikes! Looks scary!'},
    {id:'armor-magshield',n:'Magnetic Shield',    emoji:'🧲',color:'#1D4ED8',weight:5,  pw:20,spd:0,  dur:35,desc:'Blocks magnetic attacks!'},
    {id:'armor-force',    n:'Force Field',        emoji:'💠',color:'#06B6D4',weight:3,  pw:30,spd:0,  dur:40,desc:'Energy shield! Like sci-fi!'},
    {id:'armor-camo',     n:'Camouflage',         emoji:'👻',color:'#4B5563',weight:2,  pw:15,spd:5,  dur:10,desc:'Makes the robot invisible!'},
    {id:'armor-absorb',   n:'Absorption Plating', emoji:'🧽',color:'#7C3AED',weight:7,  pw:0, spd:0,  dur:45,desc:'Absorbs damage like a sponge!'},
    {id:'armor-regen',    n:'Regenerative Armor', emoji:'❤️',color:'#EC4899',weight:8,  pw:25,spd:0,  dur:60,desc:'Repairs itself! Self-healing!'},
  ]},
  { id:'lighting', label:'DECORATIONS', icon:'⭐', catColor:'#ec4899', bg:'#fdf2f8', parts:[
    {id:'deco-led',       n:'LED Lights',         emoji:'💡',color:'#FCD34D',weight:0.2,pw:3,  spd:0,dur:5,desc:'Colorful LED lights! Blink!'},
    {id:'deco-neon',      n:'Neon Lights',        emoji:'🌈',color:'#A855F7',weight:0.3,pw:5,  spd:0,dur:5,desc:'Glowing neon! Super cool look!'},
    {id:'deco-holo',      n:'Hologram Projector', emoji:'📺',color:'#06B6D4',weight:1,  pw:15, spd:0,dur:5,desc:'Projects hologram images!'},
    {id:'deco-paint',     n:'Paint Job',          emoji:'🎨',color:'#EC4899',weight:0.5,pw:0,  spd:0,dur:5,desc:'Fresh paint! New color!'},
    {id:'deco-decals',    n:'Stickers & Decals',  emoji:'⭐',color:'#F59E0B',weight:0.1,pw:0,  spd:0,dur:3,desc:'Cool stickers and designs!'},
    {id:'deco-wings',     n:'Wings',              emoji:'🪶',color:'#E5E7EB',weight:2,  pw:0,  spd:5,dur:8,desc:'Wings! Looks like it flies!'},
    {id:'deco-fins',      n:'Fins',               emoji:'🐟',color:'#38BDF8',weight:1,  pw:0,  spd:3,dur:8,desc:'Fins for an underwater look!'},
    {id:'deco-spikes',    n:'Spike Decoration',   emoji:'🔺',color:'#DC2626',weight:1,  pw:0,  spd:0,dur:5,desc:'Sharp spikes! Looks tough!'},
    {id:'deco-chrome',    n:'Chrome Trim',        emoji:'✨',color:'#CBD5E1',weight:0.5,pw:0,  spd:0,dur:5,desc:'Shiny chrome! Super fancy!'},
    {id:'deco-smoke',     n:'Smoke Generator',    emoji:'💨',color:'#9CA3AF',weight:1,  pw:10, spd:0,dur:5,desc:'Makes cool smoke effects!'},
    {id:'deco-flame',     n:'Flame Effects',      emoji:'🔥',color:'#F97316',weight:0.5,pw:8,  spd:0,dur:5,desc:'Fire effects! Looking hot!'},
    {id:'deco-propeller', n:'Spinner Prop',       emoji:'🌀',color:'#3B82F6',weight:0.5,pw:5,  spd:0,dur:5,desc:'Spinning decoration! Whirr!'},
    {id:'deco-antenna',   n:'Style Antenna',      emoji:'📡',color:'#10B981',weight:0.3,pw:3,  spd:0,dur:5,desc:'Looks super high-tech!'},
    {id:'deco-exhaust',   n:'Exhaust Pipes',      emoji:'🌪️',color:'#374151',weight:1,  pw:0,  spd:3,dur:8,desc:'Speed look! Like a race car!'},
    {id:'deco-spoiler',   n:'Aerospoiler',        emoji:'🏎️',color:'#111827',weight:2,  pw:0,  spd:5,dur:8,desc:'Spoiler for aerodynamic look!'},
  ]},
];

// Give all parts a `name` from `n` field (for backward compat)
PARTS_CATALOG.forEach(cat => cat.parts.forEach(p => { p.name = p.name || p.n; }));

// ─── Robot-Specific Parts Catalog ────────────────────────────────────────────
// Each robot type gets its OWN inventory: unique bodies, movement, sensors, tools.
// Parts from one type NEVER appear in another type's builder.
const ROBOT_PARTS_CATALOG = {
  // ──────────────────────────────────────────────── SPIDER
  spider: {
    body:    { id:'body',    label:'SPIDER BODY', icon:'🕷️', catColor:'#7c3aed', bg:'#f5f3ff', cap:1, parts:[
      {id:'spider-body-scout',    n:'Scout Spider',    emoji:'🕷️', color:'#2d3748', weight:8,  pw:2, spd:90, dur:50, desc:'Lightweight hex frame. Built for speed — fastest spider body!'},
      {id:'spider-body-explorer', n:'Explorer Spider', emoji:'🔭', color:'#374151', weight:12, pw:5, spd:65, dur:60, desc:'Expanded sensor mounts for science missions. Wide stable base.'},
      {id:'spider-body-heavy',    n:'Heavy Spider',    emoji:'🛡️', color:'#1f2937', weight:22, pw:3, spd:45, dur:88, desc:'Armoured hex hull. Tanks through rough terrain.'},
      {id:'spider-body-cargo',    n:'Cargo Spider',    emoji:'📦', color:'#374151', weight:18, pw:5, spd:55, dur:70, desc:'Storage compartments on the abdomen. Carries supplies!'},
      {id:'spider-body-climbing', n:'Climbing Spider', emoji:'🧗', color:'#1a2035', weight:10, pw:4, spd:72, dur:65, desc:'Extended leg anchors. Masters walls and ceilings.'},
      {id:'spider-body-tactical', n:'Tactical Spider', emoji:'⚔️', color:'#111827', weight:16, pw:6, spd:62, dur:78, desc:'Armoured shell with advanced sensor hardpoints. Mission ready.'},
    ]},
    legs:    { id:'legs',    label:'LEGS',        icon:'🦵', catColor:'#16a34a', bg:'#f0fdf4', cap:8, parts:[
      {id:'spider-leg-standard',   n:'Standard Legs',   emoji:'🦵', color:'#374151', weight:5,  pw:4,  spd:70, dur:60, desc:'3-segment articulated legs. Reliable all-rounder.'},
      {id:'spider-leg-fast',       n:'Fast Legs',       emoji:'⚡', color:'#1d4ed8', weight:3,  pw:6,  spd:95, dur:38, desc:'Slim titanium legs. Blistering speed — less durable.'},
      {id:'spider-leg-heavy',      n:'Heavy Legs',      emoji:'💪', color:'#292524', weight:14, pw:8,  spd:42, dur:92, desc:'Thick armoured segments. Nearly indestructible.'},
      {id:'spider-leg-climbing',   n:'Climbing Legs',   emoji:'🧗', color:'#065f46', weight:6,  pw:10, spd:65, dur:70, desc:'Micro-gripper hooked tips. Scales any surface.'},
      {id:'spider-leg-magnetic',   n:'Magnetic Legs',   emoji:'🧲', color:'#1e3a8a', weight:8,  pw:12, spd:50, dur:75, desc:'Electromagnetic feet. Walks on metal walls and ceilings!'},
      {id:'spider-leg-precision',  n:'Precision Legs',  emoji:'🎯', color:'#4c1d95', weight:4,  pw:7,  spd:60, dur:55, desc:'Ultra-fine joints. Picks up tiny objects accurately.'},
      {id:'spider-leg-terrain',    n:'Terrain Legs',    emoji:'🌍', color:'#422006', weight:8,  pw:5,  spd:65, dur:80, desc:'Wide padded feet. Mud, sand, rocks — no problem.'},
      {id:'spider-leg-jump',       n:'Jump Legs',       emoji:'🚀', color:'#7c2d12', weight:6,  pw:14, spd:75, dur:55, desc:'Spring-loaded joints. Leaps over obstacles!'},
      {id:'spider-leg-stealth',    n:'Stealth Legs',    emoji:'👻', color:'#111827', weight:3,  pw:6,  spd:82, dur:42, desc:'Vibration-dampened. Near-silent movement.'},
      {id:'spider-leg-industrial', n:'Industrial Legs', emoji:'⚙️', color:'#1c1917', weight:16, pw:8,  spd:38, dur:96, desc:'Heavy-duty industrial joints. Maximum load capacity.'},
    ]},
    sensors: { id:'sensors', label:'SENSORS',     icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:4, parts:[
      {id:'spider-sensor-vision',    n:'Spider Eye Camera',   emoji:'👁️', color:'#1e90ff', weight:1,   pw:4,  spd:0, dur:20, desc:'Wide-angle compound eye camera. Sees 270° around!'},
      {id:'spider-sensor-thermal',   n:'Thermal Vision',      emoji:'🌡️', color:'#f97316', weight:2,   pw:8,  spd:0, dur:20, desc:'Detects heat signatures. Finds hidden targets in the dark.'},
      {id:'spider-sensor-night',     n:'Night Vision',        emoji:'🌙', color:'#1d4ed8', weight:1,   pw:6,  spd:0, dur:20, desc:'Amplified low-light camera. Sees in total darkness.'},
      {id:'spider-sensor-lidar',     n:'Lidar Scanner',       emoji:'🔴', color:'#dc2626', weight:3,   pw:12, spd:0, dur:30, desc:'3D laser mapping. Builds exact terrain models.'},
      {id:'spider-sensor-motion',    n:'Motion Tracker',      emoji:'📡', color:'#7c3aed', weight:2,   pw:8,  spd:0, dur:25, desc:'Detects movement up to 20m away.'},
      {id:'spider-sensor-vibration', n:'Vibration Sensor',    emoji:'〰️', color:'#059669', weight:1,   pw:3,  spd:0, dur:15, desc:'Feels ground vibrations — detects footsteps!'},
      {id:'spider-sensor-wall',      n:'Wall Detection Sonar',emoji:'🔊', color:'#0891b2', weight:1,   pw:4,  spd:0, dur:20, desc:'Ultrasonic pulses map nearby walls and gaps.'},
      {id:'spider-sensor-env',       n:'Environment Sensor',  emoji:'💨', color:'#16a34a', weight:1,   pw:5,  spd:0, dur:15, desc:'Air quality, temperature, humidity and pressure.'},
    ]},
    tools:   { id:'tools',   label:'TOOLS',       icon:'🔧', catColor:'#dc2626', bg:'#fff1f2', cap:4, parts:[
      {id:'spider-tool-sample',   n:'Sample Collector', emoji:'🧪', color:'#a16207', weight:3, pw:6,  spd:0, dur:25, desc:'Collects soil, rock and liquid samples in sealed vials.'},
      {id:'spider-tool-repair',   n:'Field Repair Tool',emoji:'🔧', color:'#6b7280', weight:4, pw:10, spd:0, dur:30, desc:'Welds, seals and fixes damaged equipment in the field.'},
      {id:'spider-tool-scanner',  n:'Object Scanner',   emoji:'🔬', color:'#6d28d9', weight:2, pw:8,  spd:0, dur:20, desc:'Identifies materials, chemicals and biological traces.'},
      {id:'spider-tool-hook',     n:'Cargo Hook',       emoji:'🪝', color:'#374151', weight:5, pw:5,  spd:0, dur:40, desc:'Grapple hook drags and carries loads up to 10kg.'},
      {id:'spider-tool-claw',     n:'Climbing Claw',    emoji:'🦞', color:'#991b1b', weight:4, pw:8,  spd:0, dur:35, desc:'Raptor claw for anchoring to surfaces while working.'},
      {id:'spider-tool-research', n:'Research Module',  emoji:'🔭', color:'#0c4a6e', weight:6, pw:12, spd:0, dur:25, desc:'Advanced science instrument pack for field research.'},
    ]},
    power:   { id:'power',   label:'POWER',       icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:2, parts:[
      {id:'spider-power-std',   n:'Standard Battery',      emoji:'🔋', color:'#059669', weight:3, pw:0, spd:0, dur:0, desc:'60-minute run time. Standard mission battery.'},
      {id:'spider-power-high',  n:'High-Capacity Battery', emoji:'⚡', color:'#047857', weight:6, pw:0, spd:0, dur:0, desc:'120-minute run time. Heavy but goes the distance.'},
      {id:'spider-power-solar', n:'Solar Cell Array',      emoji:'☀️', color:'#1d4ed8', weight:2, pw:0, spd:0, dur:0, desc:'Trickle-charges in sunlight. Never runs out outdoors!'},
    ]},
    ai:      { id:'ai',      label:'AI BRAIN',    icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'spider-ai-basic', n:'Basic Spider Brain',  emoji:'🧠', color:'#9ca3af', weight:1, pw:5,  spd:0, dur:0, desc:'Patrol and explore commands. Simple and reliable.'},
      {id:'spider-ai-smart', n:'Smart Navigation AI', emoji:'💡', color:'#f59e0b', weight:2, pw:15, spd:0, dur:0, desc:'Autonomous pathfinding. Learns routes and avoids danger.'},
      {id:'spider-ai-swarm', n:'Swarm Intelligence', emoji:'🕸️', color:'#7c3aed', weight:2, pw:25, spd:0, dur:0, desc:'Coordinates with other spiders. Stronger as a team!'},
    ]},
    lighting:{ id:'lighting',label:'LIGHTS',      icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:3, parts:[
      {id:'spider-light-led',    n:'Status LEDs',      emoji:'💡', color:'#fcd34d', weight:0.2, pw:2, spd:0, dur:5,  desc:'Coloured LEDs show power and status. Looks amazing!'},
      {id:'spider-light-spot',   n:'Spotlights',       emoji:'🔦', color:'#fef3c7', weight:1,   pw:6, spd:0, dur:10, desc:'Forward-facing lights for dark cave exploration.'},
      {id:'spider-light-uv',     n:'UV Scanner Light', emoji:'🔵', color:'#818cf8', weight:1,   pw:8, spd:0, dur:10, desc:'UV light reveals hidden biological traces and marks.'},
      {id:'spider-light-beacon', n:'Emergency Beacon', emoji:'🔴', color:'#dc2626', weight:0.5, pw:4, spd:0, dur:10, desc:'Flashing rescue beacon visible from 500m away.'},
    ]},
  },

  // ──────────────────────────────────────────────── DRONE
  drone: {
    body:      { id:'body',      label:'DRONE FRAME',   icon:'🚁', catColor:'#0284c7', bg:'#eff6ff', cap:1, parts:[
      {id:'drone-body-racing',    n:'Racing Frame',      emoji:'🏎️', color:'#dc2626', weight:6,  pw:0, spd:98, dur:35, desc:'Ultralight carbon-fibre frame. Fastest drone on the field!'},
      {id:'drone-body-survey',    n:'Survey Frame',      emoji:'🗺️', color:'#374151', weight:12, pw:0, spd:60, dur:65, desc:'Stable wide-arm frame. Perfect for mapping large areas.'},
      {id:'drone-body-camera',    n:'Camera Frame',      emoji:'📷', color:'#1e40af', weight:9,  pw:0, spd:65, dur:50, desc:'Gimbal-ready frame. Built for cinematic aerial filming.'},
      {id:'drone-body-heavylift', n:'Heavy Lift Frame',  emoji:'💪', color:'#292524', weight:20, pw:0, spd:44, dur:80, desc:'Reinforced arms for carrying loads up to 15kg.'},
      {id:'drone-body-rescue',    n:'Rescue Frame',      emoji:'🚨', color:'#b91c1c', weight:14, pw:0, spd:55, dur:70, desc:'Emergency lights, beacon and first-responder payload bay.'},
      {id:'drone-body-cargo',     n:'Cargo Frame',       emoji:'📦', color:'#166534', weight:18, pw:0, spd:50, dur:75, desc:'Large underbelly cargo bay for delivery missions.'},
      {id:'drone-body-hex',       n:'Hexacopter Frame',  emoji:'⬡',  color:'#0f766e', weight:16, pw:0, spd:60, dur:82, desc:'6-arm stability. Handles wind much better than a quad!'},
      {id:'drone-body-octo',      n:'Octocopter Frame',  emoji:'⭕', color:'#0c4a6e', weight:22, pw:0, spd:55, dur:92, desc:'8 motors — cinematic smoothness and payload capacity.'},
    ]},
    propulsion:{ id:'propulsion',label:'ROTORS',        icon:'🌀', catColor:'#7c3aed', bg:'#faf5ff', cap:8, parts:[
      {id:'drone-rotor-standard',  n:'Standard Rotors',   emoji:'🌀', color:'#9ca3af', weight:1,   pw:15, spd:70, dur:40, desc:'Reliable 5-inch props. Great all-purpose flying!'},
      {id:'drone-rotor-racing',    n:'Racing Rotors',     emoji:'⚡', color:'#dc2626', weight:0.8, pw:28, spd:100,dur:25, desc:'3-inch high-RPM blades. Maximum speed!'},
      {id:'drone-rotor-silent',    n:'Silent Rotors',     emoji:'🤫', color:'#4b5563', weight:1.5, pw:12, spd:60, dur:45, desc:'Noise-dampened blades. Near-silent operation.'},
      {id:'drone-rotor-heavylift', n:'Heavy Lift Rotors', emoji:'💪', color:'#1c1917', weight:3,   pw:42, spd:44, dur:60, desc:'Wide 15-inch props generate massive lifting force.'},
      {id:'drone-rotor-longrange', n:'Long Range Rotors', emoji:'🛫', color:'#1e3a8a', weight:2,   pw:18, spd:65, dur:50, desc:'High-efficiency blades — 50% more flight time!'},
      {id:'drone-rotor-folding',   n:'Foldable Rotors',   emoji:'📐', color:'#374151', weight:1.2, pw:16, spd:68, dur:40, desc:'Fold flat for transport. Deploy and fly instantly.'},
    ]},
    sensors:   { id:'sensors',   label:'SENSORS',        icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:4, parts:[
      {id:'drone-sensor-camera',   n:'HD Camera',         emoji:'📷', color:'#1e90ff', weight:1,   pw:5,  spd:0, dur:20, desc:'4K wide-angle lens. Captures stunning aerial footage!'},
      {id:'drone-sensor-thermal',  n:'Thermal Camera',    emoji:'🌡️', color:'#f97316', weight:2,   pw:10, spd:0, dur:20, desc:'Finds people and wildlife from the air using heat.'},
      {id:'drone-sensor-gps',      n:'GPS Module',        emoji:'🛰️', color:'#7c3aed', weight:0.5, pw:5,  spd:0, dur:10, desc:'Centimetre-precise positioning. Flies exact routes!'},
      {id:'drone-sensor-altitude', n:'Altitude Sensor',   emoji:'📏', color:'#374151', weight:0.3, pw:3,  spd:0, dur:10, desc:'Laser altimeter. Knows exact height above ground.'},
      {id:'drone-sensor-lidar',    n:'Lidar Scanner',     emoji:'🔴', color:'#dc2626', weight:3,   pw:15, spd:0, dur:30, desc:'3D laser scans terrain from the air in real time.'},
      {id:'drone-sensor-tracking', n:'Object Tracker',    emoji:'🎯', color:'#059669', weight:2,   pw:12, spd:0, dur:25, desc:'AI camera locks onto and follows a moving target.'},
      {id:'drone-sensor-weather',  n:'Weather Sensor',    emoji:'⛅', color:'#0891b2', weight:1,   pw:5,  spd:0, dur:15, desc:'Measures wind, temperature, pressure and humidity.'},
      {id:'drone-sensor-wind',     n:'Wind Sensor',       emoji:'💨', color:'#16a34a', weight:0.5, pw:3,  spd:0, dur:10, desc:'Real-time wind speed and direction for safe flying.'},
    ]},
    tools:     { id:'tools',     label:'PAYLOAD',        icon:'📦', catColor:'#dc2626', bg:'#fff1f2', cap:3, parts:[
      {id:'drone-tool-winch',    n:'Cargo Winch',          emoji:'🪝', color:'#374151', weight:4, pw:10, spd:0, dur:40, desc:'Cable winch lowers and retrieves payloads precisely.'},
      {id:'drone-tool-rescue',   n:'Rescue Hook',          emoji:'🔴', color:'#dc2626', weight:3, pw:8,  spd:0, dur:35, desc:'Deploys emergency rescue line for stranded survivors.'},
      {id:'drone-tool-spotlight',n:'Search Spotlight',     emoji:'🔦', color:'#fef3c7', weight:2, pw:15, spd:0, dur:20, desc:'1000-lumen spotlight. Illuminates night operations.'},
      {id:'drone-tool-delivery', n:'Delivery Box',         emoji:'📦', color:'#166534', weight:6, pw:0,  spd:0, dur:50, desc:'Insulated compartment. Delivers packages safely.'},
      {id:'drone-tool-medical',  n:'Medical Supply Drop',  emoji:'🏥', color:'#dc2626', weight:5, pw:5,  spd:0, dur:40, desc:'Temperature-controlled medical carrier. Saves lives!'},
    ]},
    power:     { id:'power',     label:'POWER',          icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'drone-power-std',      n:'Standard LiPo',      emoji:'🔋', color:'#059669', weight:3, pw:0, spd:0, dur:0, desc:'Lithium battery — 20 minutes of flight.'},
      {id:'drone-power-high',     n:'High-Capacity LiPo', emoji:'⚡', color:'#047857', weight:6, pw:0, spd:0, dur:0, desc:'Double capacity — 40 minutes of flight!'},
      {id:'drone-power-hydrogen', n:'Hydrogen Fuel Cell',emoji:'💧', color:'#38bdf8', weight:4, pw:0, spd:0, dur:0, desc:'Clean fuel cell power — 90 minutes of flight!'},
    ]},
    ai:        { id:'ai',        label:'FLIGHT COMPUTER',icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'drone-ai-basic', n:'Basic Flight Controller',emoji:'🧠', color:'#9ca3af', weight:0.5, pw:5,  spd:0, dur:0, desc:'Stabilises hover. Manual control assistance.'},
      {id:'drone-ai-auto',  n:'Autopilot System',       emoji:'🛫', color:'#f59e0b', weight:1,   pw:15, spd:0, dur:0, desc:'Plans and flies routes automatically. Avoids obstacles.'},
      {id:'drone-ai-smart', n:'Swarm Coordinator AI',  emoji:'🌐', color:'#7c3aed', weight:1,   pw:25, spd:0, dur:0, desc:'Controls multiple drones as a coordinated fleet!'},
    ]},
    lighting:  { id:'lighting',  label:'LIGHTS',         icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:4, parts:[
      {id:'drone-light-nav',    n:'Navigation Lights', emoji:'🟢', color:'#16a34a', weight:0.2, pw:3,  spd:0, dur:5,  desc:'Required position lights for night flying.'},
      {id:'drone-light-strobe', n:'Strobe Light',      emoji:'⚡', color:'#fbbf24', weight:0.3, pw:4,  spd:0, dur:5,  desc:'Bright strobe visible from 3km away!'},
      {id:'drone-light-rgb',    n:'RGB LED Ring',      emoji:'🌈', color:'#a855f7', weight:0.5, pw:6,  spd:0, dur:10, desc:'Colourful LED ring. Customise your drone look!'},
      {id:'drone-light-search', n:'Search Spotlight',  emoji:'🔦', color:'#fef3c7', weight:1.5, pw:12, spd:0, dur:15, desc:'Powerful searchlight for night rescue missions.'},
    ]},
  },

  // ──────────────────────────────────────────────── HUMANOID
  humanoid: {
    body:    { id:'body',    label:'BODY FRAME',   icon:'🦾', catColor:'#be123c', bg:'#fff1f2', cap:1, parts:[
      {id:'humanoid-body-student',  n:'Student Bot',   emoji:'🎒', color:'#e5e7eb', weight:15, pw:0, spd:62, dur:55, desc:'Friendly learning robot. Perfect for school and labs.'},
      {id:'humanoid-body-explorer', n:'Explorer Bot',  emoji:'🔭', color:'#1e40af', weight:18, pw:0, spd:55, dur:65, desc:'All-weather joints and sensors for fieldwork.'},
      {id:'humanoid-body-security', n:'Security Bot',  emoji:'🛡️', color:'#1f2937', weight:25, pw:0, spd:50, dur:82, desc:'Armoured torso. Surveillance and patrol duty.'},
      {id:'humanoid-body-worker',   n:'Worker Bot',    emoji:'⚙️', color:'#374151', weight:22, pw:0, spd:45, dur:86, desc:'Heavy-duty joints for factory and construction.'},
      {id:'humanoid-body-athlete',  n:'Athlete Bot',   emoji:'🏃', color:'#dc2626', weight:12, pw:0, spd:85, dur:60, desc:'Lightweight performance frame. Runs and jumps!'},
      {id:'humanoid-body-heavy',    n:'Heavy Bot',     emoji:'💪', color:'#292524', weight:35, pw:0, spd:35, dur:96, desc:'Maximum strength. Lifts up to 200kg!'},
      {id:'humanoid-body-research', n:'Research Bot',  emoji:'🔬', color:'#0c4a6e', weight:14, pw:0, spd:58, dur:62, desc:'Precision frame with clean-room compatible joints.'},
    ]},
    legs:    { id:'legs',    label:'LEGS',         icon:'🦵', catColor:'#16a34a', bg:'#f0fdf4', cap:2, parts:[
      {id:'humanoid-leg-walking',   n:'Walking Legs',    emoji:'🚶', color:'#d1d5db', weight:8,  pw:6,  spd:60, dur:65, desc:'Smooth balanced bipedal gait. Easy to program.'},
      {id:'humanoid-leg-running',   n:'Running Legs',    emoji:'🏃', color:'#dc2626', weight:6,  pw:12, spd:92, dur:50, desc:'Spring-loaded joints. Sprints up to 15 km/h!'},
      {id:'humanoid-leg-climbing',  n:'Climbing Legs',   emoji:'🧗', color:'#065f46', weight:10, pw:10, spd:50, dur:76, desc:'Grip-enhanced joints. Climbs ladders and rough terrain.'},
      {id:'humanoid-leg-heavyduty', n:'Heavy-Duty Legs', emoji:'💪', color:'#1c1917', weight:18, pw:8,  spd:38, dur:94, desc:'Industrial joints. Carries massive loads.'},
      {id:'humanoid-leg-precision', n:'Precision Legs',  emoji:'🎯', color:'#4c1d95', weight:7,  pw:9,  spd:55, dur:62, desc:'Surgical joint control for delicate environments.'},
      {id:'humanoid-leg-jump',      n:'Jump Legs',       emoji:'🚀', color:'#7c2d12', weight:8,  pw:16, spd:70, dur:55, desc:'Hydraulic springs. Clears obstacles 2m high!'},
    ]},
    arms:    { id:'arms',    label:'ARMS',         icon:'🦾', catColor:'#dc2626', bg:'#fff1f2', cap:2, parts:[
      {id:'humanoid-arm-standard',     n:'Standard Arms',     emoji:'🤖', color:'#d1d5db', weight:5,  pw:8,  spd:0, dur:55, desc:'Multi-purpose arms. Lift, carry and manipulate.'},
      {id:'humanoid-arm-precision',    n:'Precision Arms',    emoji:'🎯', color:'#ec4899', weight:4,  pw:10, spd:0, dur:45, desc:'Fine motor control. Handles delicate objects.'},
      {id:'humanoid-arm-heavylift',    n:'Heavy Lift Arms',   emoji:'💪', color:'#1c1917', weight:14, pw:25, spd:0, dur:82, desc:'Powerful arms. Moves objects up to 100kg.'},
      {id:'humanoid-arm-repair',       n:'Repair Arms',       emoji:'🔧', color:'#374151', weight:6,  pw:12, spd:0, dur:62, desc:'Multi-tool hands: screwdrivers, welders, cutters.'},
      {id:'humanoid-arm-construction', n:'Construction Arms', emoji:'🏗️', color:'#92400e', weight:16, pw:20, spd:0, dur:86, desc:'Jackhammer and drill. Demolishes and constructs.'},
      {id:'humanoid-arm-medical',      n:'Medical Arms',      emoji:'🏥', color:'#dc2626', weight:3,  pw:8,  spd:0, dur:42, desc:'Sterile medical-grade arms for healthcare tasks.'},
    ]},
    sensors: { id:'sensors', label:'SENSORS',      icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:3, parts:[
      {id:'humanoid-sensor-vision',   n:'Binocular Vision', emoji:'👀', color:'#1e90ff', weight:1,   pw:6,  spd:0, dur:20, desc:'Dual HD cameras for 3D depth perception.'},
      {id:'humanoid-sensor-thermal',  n:'Thermal Vision',   emoji:'🌡️', color:'#f97316', weight:2,   pw:10, spd:0, dur:20, desc:'Infrared overlay — detects body heat.'},
      {id:'humanoid-sensor-lidar',    n:'360° Lidar',       emoji:'🔴', color:'#dc2626', weight:3,   pw:15, spd:0, dur:30, desc:'Full 360-degree laser scan of the environment.'},
      {id:'humanoid-sensor-hearing',  n:'Audio Sensors',    emoji:'👂', color:'#7c3aed', weight:0.5, pw:3,  spd:0, dur:15, desc:'Directional microphones. Locates sounds precisely.'},
      {id:'humanoid-sensor-touch',    n:'Touch Sensors',    emoji:'🤚', color:'#059669', weight:1,   pw:4,  spd:0, dur:20, desc:'Pressure-sensitive fingertips for grip control.'},
    ]},
    tools:   { id:'tools',   label:'TOOLS',        icon:'🔧', catColor:'#374151', bg:'#f9fafb', cap:3, parts:[
      {id:'humanoid-tool-toolkit',   n:'General Toolkit', emoji:'🧰', color:'#6b7280', weight:3, pw:5,  spd:0, dur:30, desc:'Standard multi-tool kit. Handles everyday tasks.'},
      {id:'humanoid-tool-welder',    n:'Welding Module',  emoji:'🔥', color:'#dc2626', weight:5, pw:20, spd:0, dur:40, desc:'High-temperature welding torch. Joins metal parts.'},
      {id:'humanoid-tool-medkit',    n:'Medical Kit',     emoji:'🏥', color:'#dc2626', weight:4, pw:8,  spd:0, dur:30, desc:'First aid dispenser. Used in rescue operations.'},
      {id:'humanoid-tool-scanner',   n:'Body Scanner',    emoji:'📡', color:'#7c3aed', weight:2, pw:10, spd:0, dur:20, desc:'Scans people for injuries. Guides rescue teams.'},
      {id:'humanoid-tool-shield',    n:'Shield Module',   emoji:'🛡️', color:'#374151', weight:8, pw:5,  spd:0, dur:60, desc:'Deployable protective barrier. Guards and deflects.'},
    ]},
    power:   { id:'power',   label:'POWER',        icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'humanoid-power-std',      n:'Standard Power Cell',  emoji:'🔋', color:'#059669', weight:5,  pw:0, spd:0, dur:0, desc:'4-hour mission battery. Reliable and safe.'},
      {id:'humanoid-power-high',     n:'Extended Power Cell',  emoji:'⚡', color:'#047857', weight:10, pw:0, spd:0, dur:0, desc:'8-hour battery for long operations.'},
      {id:'humanoid-power-hydrogen', n:'Hydrogen Power Module',emoji:'💧', color:'#38bdf8', weight:7,  pw:0, spd:0, dur:0, desc:'12-hour fuel cell. Refills in just 3 minutes!'},
    ]},
    ai:      { id:'ai',      label:'AI BRAIN',     icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'humanoid-ai-basic',    n:'Basic Control System',emoji:'🧠', color:'#9ca3af', weight:1, pw:8,  spd:0, dur:0, desc:'Simple command execution. Does what it is told.'},
      {id:'humanoid-ai-smart',    n:'Smart Assistant AI', emoji:'💡', color:'#f59e0b', weight:2, pw:20, spd:0, dur:0, desc:'Understands speech. Adapts to situations.'},
      {id:'humanoid-ai-advanced', n:'Learning AI',        emoji:'🤖', color:'#7c3aed', weight:2, pw:35, spd:0, dur:0, desc:'Learns from experience. Improves every mission.'},
      {id:'humanoid-ai-social',   n:'Social AI',          emoji:'😊', color:'#ec4899', weight:1, pw:15, spd:0, dur:0, desc:'Understands emotions. Works naturally with humans.'},
    ]},
    lighting:{ id:'lighting',label:'LIGHTS',       icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:2, parts:[
      {id:'humanoid-light-eye',       n:'Eye Displays',     emoji:'👀', color:'#00d9ff', weight:0.3, pw:5, spd:0, dur:5,  desc:'Glowing display eyes. Shows emotions and status.'},
      {id:'humanoid-light-chest',     n:'Chest Panel',      emoji:'💠', color:'#a855f7', weight:0.5, pw:8, spd:0, dur:10, desc:'Status display panel. Communicates with people.'},
      {id:'humanoid-light-indicator', n:'Joint Indicators', emoji:'💡', color:'#fcd34d', weight:0.3, pw:3, spd:0, dur:5,  desc:'LEDs at every joint show movement status.'},
      {id:'humanoid-light-halo',      n:'Emergency Halo',   emoji:'🔴', color:'#dc2626', weight:0.4, pw:6, spd:0, dur:8,  desc:'Bright ring beacon for rescue operations.'},
    ]},
  },

  // ──────────────────────────────────────────────── ROVER
  rover: {
    body:    { id:'body',    label:'ROVER CHASSIS',icon:'🚗', catColor:'#d97706', bg:'#fffbeb', cap:1, parts:[
      {id:'rover-body-compact',  n:'Compact Rover',  emoji:'🔵', color:'#374151', weight:10, pw:0, spd:78, dur:55, desc:'Nimble lightweight chassis. Explores tight spaces.'},
      {id:'rover-body-explorer', n:'Explorer Rover', emoji:'🔭', color:'#b45309', weight:18, pw:0, spd:60, dur:70, desc:'Wide-body science platform. Carries all the sensors!'},
      {id:'rover-body-cargo',    n:'Cargo Rover',    emoji:'📦', color:'#166534', weight:25, pw:0, spd:45, dur:80, desc:'Flatbed cargo bed. Hauls heavy equipment.'},
      {id:'rover-body-rescue',   n:'Rescue Rover',   emoji:'🚨', color:'#dc2626', weight:20, pw:0, spd:55, dur:76, desc:'Emergency lights, siren and rescue payload bay.'},
      {id:'rover-body-heavy',    n:'Heavy Rover',    emoji:'💪', color:'#292524', weight:35, pw:0, spd:40, dur:92, desc:'Industrial chassis. Works in extreme conditions.'},
      {id:'rover-body-mining',   n:'Mining Rover',   emoji:'⛏️', color:'#78350f', weight:28, pw:0, spd:44, dur:87, desc:'Reinforced for underground mining and drilling.'},
      {id:'rover-body-science',  n:'Science Rover',  emoji:'🔬', color:'#0c4a6e', weight:16, pw:0, spd:52, dur:66, desc:'Lab-on-wheels. Full analysis instruments onboard.'},
      {id:'rover-body-offroad',  n:'Off-Road Rover', emoji:'🏔️', color:'#166534', weight:22, pw:0, spd:56, dur:82, desc:'High clearance, rugged suspension. Goes anywhere.'},
    ]},
    wheels:  { id:'wheels',  label:'WHEELS',       icon:'🛞', catColor:'#2563eb', bg:'#eff6ff', cap:6, parts:[
      {id:'rover-wheel-standard',    n:'Standard Wheels',   emoji:'🛞', color:'#1a1a1a', weight:3,  pw:2, spd:70, dur:50, desc:'Rubber tyres. Reliable on most surfaces.'},
      {id:'rover-wheel-offroad',     n:'Off-Road Wheels',   emoji:'🌍', color:'#3d2b1f', weight:5,  pw:3, spd:60, dur:72, desc:'Chunky all-terrain tyres. Handles everything!'},
      {id:'rover-wheel-omni',        n:'Omni Wheels',       emoji:'🔄', color:'#0284c7', weight:3,  pw:4, spd:65, dur:45, desc:'Moves in any direction instantly!'},
      {id:'rover-wheel-mecanum',     n:'Mecanum Wheels',    emoji:'⚙️', color:'#374151', weight:4,  pw:5, spd:60, dur:50, desc:'Diagonal roller wheels. Incredibly agile.'},
      {id:'rover-wheel-monster',     n:'Monster Wheels',    emoji:'🚛', color:'#2a2a2a', weight:8,  pw:5, spd:50, dur:82, desc:'Massive tyres handle boulders and deep mud.'},
      {id:'rover-wheel-tracks',      n:'Tank Tracks',       emoji:'🪖', color:'#1c1917', weight:12, pw:6, spd:40, dur:92, desc:'Steel tracks. Maximum grip on all surfaces.'},
      {id:'rover-wheel-heavytracks', n:'Heavy Tracks',      emoji:'⚫', color:'#0a0a09', weight:18, pw:8, spd:34, dur:96, desc:'Wide reinforced tracks. Ultimate traction.'},
    ]},
    arms:    { id:'arms',    label:'ROVER ARM',    icon:'🦾', catColor:'#dc2626', bg:'#fff1f2', cap:2, parts:[
      {id:'rover-arm-science',   n:'Science Arm',    emoji:'🔬', color:'#374151', weight:5,  pw:10, spd:0, dur:40, desc:'6-axis arm collects samples and manipulates objects.'},
      {id:'rover-arm-drill',     n:'Drill Arm',      emoji:'⛏️', color:'#78350f', weight:8,  pw:18, spd:0, dur:55, desc:'Rotary drill extracts core samples from rock.'},
      {id:'rover-arm-heavy',     n:'Heavy Lift Arm', emoji:'💪', color:'#1c1917', weight:12, pw:20, spd:0, dur:65, desc:'Crane arm. Lifts boulders and heavy equipment.'},
      {id:'rover-arm-precision', n:'Precision Arm',  emoji:'🎯', color:'#4c1d95', weight:4,  pw:8,  spd:0, dur:36, desc:'Fine-motor arm for delicate sample handling.'},
    ]},
    sensors: { id:'sensors', label:'SENSORS',      icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:4, parts:[
      {id:'rover-sensor-panoramic', n:'Panoramic Camera', emoji:'📷', color:'#1e90ff', weight:1, pw:5,  spd:0, dur:20, desc:'360-degree camera mast. Sees all around the rover.'},
      {id:'rover-sensor-lidar',     n:'Lidar Scanner',    emoji:'🔴', color:'#dc2626', weight:3, pw:15, spd:0, dur:30, desc:'3D laser maps the terrain in real time.'},
      {id:'rover-sensor-chem',      n:'Chemistry Sensor', emoji:'🧪', color:'#7c3aed', weight:2, pw:10, spd:0, dur:25, desc:'Analyses soil and rock chemistry on the spot.'},
      {id:'rover-sensor-weather',   n:'Weather Station',  emoji:'⛅', color:'#0891b2', weight:2, pw:8,  spd:0, dur:20, desc:'Wind, temperature, pressure and humidity monitor.'},
      {id:'rover-sensor-ground',    n:'Ground Radar',     emoji:'📡', color:'#374151', weight:4, pw:15, spd:0, dur:35, desc:'Sees underground! Finds buried objects and tunnels.'},
      {id:'rover-sensor-radiation', n:'Radiation Sensor', emoji:'☢️', color:'#fde68a', weight:1, pw:6,  spd:0, dur:20, desc:'Detects dangerous radiation levels. Keeps crew safe.'},
    ]},
    tools:   { id:'tools',   label:'EQUIPMENT',    icon:'🔧', catColor:'#374151', bg:'#f9fafb', cap:3, parts:[
      {id:'rover-tool-sample',  n:'Sample Storage',     emoji:'🧪', color:'#a16207', weight:3, pw:2,  spd:0, dur:30, desc:'Sealed containers for soil, rock and liquid samples.'},
      {id:'rover-tool-solar',   n:'Solar Panel Array',  emoji:'☀️', color:'#1d4ed8', weight:4, pw:0,  spd:0, dur:40, desc:'Foldable solar panels for recharging in the field.'},
      {id:'rover-tool-antenna', n:'Long Range Antenna', emoji:'📡', color:'#374151', weight:2, pw:8,  spd:0, dur:30, desc:'High-gain antenna for long-distance communication.'},
      {id:'rover-tool-drill',   n:'Core Drill',         emoji:'⛏️', color:'#78350f', weight:6, pw:15, spd:0, dur:45, desc:'Extracts cylindrical rock cores for lab analysis.'},
      {id:'rover-tool-lights',  n:'Terrain Floodlights',emoji:'🔦', color:'#fef3c7', weight:1, pw:8,  spd:0, dur:20, desc:'Powerful lights for working in pitch-dark environments.'},
    ]},
    power:   { id:'power',   label:'POWER',        icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'rover-power-std',     n:'Standard Battery',  emoji:'🔋', color:'#059669', weight:6,  pw:0, spd:0, dur:0, desc:'8-hour operation battery. Standard rover pack.'},
      {id:'rover-power-nuclear', n:'RTG Power Source',  emoji:'☢️', color:'#fde68a', weight:12, pw:0, spd:0, dur:0, desc:'Radioisotope generator. Runs for years non-stop!'},
      {id:'rover-power-solar',   n:'Solar + Battery',   emoji:'☀️', color:'#1d4ed8', weight:8,  pw:0, spd:0, dur:0, desc:'Solar array with battery backup. Unlimited daylight range.'},
    ]},
    ai:      { id:'ai',      label:'NAVIGATION AI',icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'rover-ai-basic',    n:'Basic Autopilot',      emoji:'🧠', color:'#9ca3af', weight:1, pw:5,  spd:0, dur:0, desc:'Avoids obstacles and navigates simple terrain.'},
      {id:'rover-ai-science',  n:'Science AI',           emoji:'💡', color:'#f59e0b', weight:2, pw:15, spd:0, dur:0, desc:'Identifies interesting geological targets automatically.'},
      {id:'rover-ai-advanced', n:'Full Autonomy AI',     emoji:'🌐', color:'#7c3aed', weight:2, pw:30, spd:0, dur:0, desc:'Plans multi-day exploration routes independently.'},
    ]},
    lighting:{ id:'lighting',label:'LIGHTS',       icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:3, parts:[
      {id:'rover-light-work',   n:'Work Lights',    emoji:'💡', color:'#fef3c7', weight:0.5, pw:8, spd:0, dur:10, desc:'Bright work lights for nighttime operations.'},
      {id:'rover-light-strobe', n:'Warning Strobe', emoji:'⚡', color:'#f59e0b', weight:0.3, pw:4, spd:0, dur:5,  desc:'Flashing warning lights keep the area safe.'},
      {id:'rover-light-nav',    n:'Navigation Lights',emoji:'🔴',color:'#dc2626', weight:0.2, pw:2, spd:0, dur:5,  desc:'Coloured nav lights for low-visibility driving.'},
    ]},
  },

  // ──────────────────────────────────────────────── TRACKED
  tracked: {
    body:    { id:'body',    label:'TANK HULL',    icon:'🪖', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'tracked-body-scout',     n:'Scout Tank',    emoji:'💨', color:'#374151', weight:20, pw:0, spd:72, dur:68, desc:'Fast light hull. Speed and surprise over armour.'},
      {id:'tracked-body-standard',  n:'Battle Tank',   emoji:'🪖', color:'#1c1917', weight:35, pw:0, spd:45, dur:88, desc:'Classic armoured hull. Balanced for combat.'},
      {id:'tracked-body-siege',     n:'Siege Tank',    emoji:'🎯', color:'#292524', weight:45, pw:0, spd:32, dur:95, desc:'Heavy siege platform. Unstoppable firepower.'},
      {id:'tracked-body-fortified', n:'Fortress Tank', emoji:'🏰', color:'#14532d', weight:55, pw:0, spd:25, dur:99, desc:'Maximum armour plating. Nearly indestructible.'},
    ]},
    wheels:  { id:'wheels',  label:'TRACKS',       icon:'⚫', catColor:'#374151', bg:'#f9fafb', cap:8, parts:[
      {id:'tracked-track-light',  n:'Light Tracks',  emoji:'💨', color:'#374151', weight:8,  pw:5, spd:68, dur:65, desc:'Lightweight composite tracks. Fast movement.'},
      {id:'tracked-track-standard',n:'Standard Tracks',emoji:'🪖',color:'#1c1917', weight:14, pw:6, spd:50, dur:82, desc:'Proven steel tracks. Reliable in all terrain.'},
      {id:'tracked-track-heavy',  n:'Heavy Tracks',  emoji:'💪', color:'#0a0a09', weight:20, pw:8, spd:38, dur:94, desc:'Wide armoured tracks. Climbs over anything.'},
      {id:'tracked-track-rubber', n:'Rubber Tracks', emoji:'🔇', color:'#2a2a2a', weight:12, pw:5, spd:55, dur:72, desc:'Noise-dampened. Silent movement for stealth ops.'},
    ]},
    tools:   { id:'tools',   label:'EQUIPMENT',    icon:'🎯', catColor:'#dc2626', bg:'#fff1f2', cap:4, parts:[
      {id:'tracked-tool-cannon',   n:'Artillery Cannon', emoji:'🎯', color:'#292524', weight:20, pw:25, spd:0, dur:50, desc:'Long-range cannon. Fires from safe distance.'},
      {id:'tracked-tool-dozer',    n:'Dozer Blade',      emoji:'🏗️', color:'#78350f', weight:15, pw:10, spd:0, dur:70, desc:'Heavy-duty bulldozer blade. Clears anything.'},
      {id:'tracked-tool-crane',    n:'Crane Arm',        emoji:'🏗️', color:'#374151', weight:12, pw:15, spd:0, dur:55, desc:'Heavy-lift crane for rescue and construction.'},
      {id:'tracked-tool-mine',     n:'Mine Detector',    emoji:'⚠️', color:'#fde68a', weight:3,  pw:8,  spd:0, dur:30, desc:'Finds hidden mines and buried objects safely.'},
      {id:'tracked-tool-shield',   n:'Active Shield',    emoji:'🛡️', color:'#1e40af', weight:10, pw:20, spd:0, dur:80, desc:'Reactive armour plate. Intercepts incoming hits.'},
    ]},
    sensors: { id:'sensors', label:'SENSORS',      icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:3, parts:[
      {id:'tracked-sensor-camera', n:'Battle Camera',    emoji:'📷', color:'#1e90ff', weight:1, pw:5,  spd:0, dur:25, desc:'Armoured camera housing. Sees during combat.'},
      {id:'tracked-sensor-radar',  n:'Target Radar',     emoji:'📡', color:'#dc2626', weight:3, pw:12, spd:0, dur:35, desc:'Tracks moving targets at long range.'},
      {id:'tracked-sensor-thermal',n:'Thermal Sight',    emoji:'🌡️', color:'#f97316', weight:2, pw:8,  spd:0, dur:25, desc:'Thermal imaging for night and smoke operations.'},
      {id:'tracked-sensor-drone',  n:'Scout Drone Bay',  emoji:'🚁', color:'#374151', weight:5, pw:15, spd:0, dur:40, desc:'Launches a scout drone to see over the hill!'},
    ]},
    power:   { id:'power',   label:'POWER',        icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'tracked-power-std',   n:'Standard Engine',  emoji:'🔋', color:'#059669', weight:15, pw:0, spd:0, dur:0, desc:'Diesel engine pack. 12-hour operation.'},
      {id:'tracked-power-heavy', n:'Heavy Power Plant', emoji:'⚡', color:'#047857', weight:25, pw:0, spd:0, dur:0, desc:'High-output turbine. Maximum sustained power.'},
    ]},
    ai:      { id:'ai',      label:'TACTICAL AI',  icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'tracked-ai-basic',   n:'Basic Targeting',  emoji:'🧠', color:'#9ca3af', weight:1, pw:5,  spd:0, dur:0, desc:'Target lock assistance for the gunner.'},
      {id:'tracked-ai-combat',  n:'Combat Tactics AI',emoji:'💡', color:'#f59e0b', weight:2, pw:18, spd:0, dur:0, desc:'Plans battle strategy and coordinates movement.'},
    ]},
  },

  // ──────────────────────────────────────────────── HOVER
  hover: {
    body:      { id:'body',      label:'HOVER CRAFT',  icon:'🛸', catColor:'#0891b2', bg:'#ecfeff', cap:1, parts:[
      {id:'hover-body-pod',      n:'Speed Pod',       emoji:'🛸', color:'#0284c7', weight:8,  pw:0, spd:95, dur:45, desc:'Sleek aerodynamic pod. Fastest hover craft!'},
      {id:'hover-body-skiff',    n:'Cargo Skiff',     emoji:'🛥️', color:'#0f766e', weight:18, pw:0, spd:60, dur:70, desc:'Wide flat platform for carrying cargo.'},
      {id:'hover-body-orb',      n:'Plasma Orb',      emoji:'🔮', color:'#7c3aed', weight:10, pw:0, spd:90, dur:52, desc:'Spherical plasma hover — moves in all directions!'},
      {id:'hover-body-platform', n:'Hover Platform',  emoji:'⬡',  color:'#0e7490', weight:22, pw:0, spd:55, dur:75, desc:'Stable hexagonal platform for science missions.'},
    ]},
    propulsion:{ id:'propulsion',label:'THRUSTERS',   icon:'🚀', catColor:'#7c3aed', bg:'#faf5ff', cap:6, parts:[
      {id:'hover-thrust-standard', n:'Ion Thrusters',    emoji:'💨', color:'#67e8f9', weight:2, pw:20, spd:75, dur:45, desc:'Standard ion drive. Quiet and efficient.'},
      {id:'hover-thrust-plasma',   n:'Plasma Jets',      emoji:'⚡', color:'#a855f7', weight:3, pw:45, spd:98, dur:35, desc:'Plasma-powered. Ultra high speed thrust!'},
      {id:'hover-thrust-gravity',  n:'Anti-Gravity Pods',emoji:'🌀', color:'#06b6d4', weight:4, pw:35, spd:80, dur:60, desc:'Gravity manipulation. Ultra stable at all speeds.'},
      {id:'hover-thrust-pulse',    n:'Pulse Thrusters',  emoji:'💥', color:'#f59e0b', weight:2, pw:30, spd:88, dur:42, desc:'Burst fire thrusters. Instant acceleration!'},
    ]},
    sensors:   { id:'sensors',   label:'SENSORS',      icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:4, parts:[
      {id:'hover-sensor-scan',    n:'Area Scanner',    emoji:'📡', color:'#0891b2', weight:1, pw:8,  spd:0, dur:20, desc:'Wide-area scanner maps terrain below.'},
      {id:'hover-sensor-lidar',   n:'Altitude Lidar',  emoji:'🔴', color:'#dc2626', weight:2, pw:12, spd:0, dur:25, desc:'Laser altimeter + terrain avoidance.'},
      {id:'hover-sensor-camera',  n:'Surveillance Cam',emoji:'📷', color:'#1e90ff', weight:1, pw:5,  spd:0, dur:20, desc:'Wide-angle surveillance camera.'},
      {id:'hover-sensor-thermal', n:'Thermal Scanner', emoji:'🌡️', color:'#f97316', weight:2, pw:10, spd:0, dur:20, desc:'Thermal imaging for search and rescue.'},
      {id:'hover-sensor-obstacle',n:'Obstacle Radar',  emoji:'⚠️', color:'#fbbf24', weight:1, pw:6,  spd:0, dur:15, desc:'Forward radar avoids collisions at high speed.'},
    ]},
    tools:     { id:'tools',     label:'TOOLS',        icon:'🔧', catColor:'#374151', bg:'#f9fafb', cap:3, parts:[
      {id:'hover-tool-cargo',   n:'Cargo Clamp',    emoji:'🪝', color:'#374151', weight:5, pw:5,  spd:0, dur:35, desc:'Magnetic clamp picks up and carries large objects.'},
      {id:'hover-tool-scanner', n:'Survey Scanner', emoji:'🔬', color:'#6d28d9', weight:3, pw:10, spd:0, dur:25, desc:'High-resolution ground survey scanner.'},
      {id:'hover-tool-beacon',  n:'Signal Beacon',  emoji:'📡', color:'#dc2626', weight:2, pw:8,  spd:0, dur:30, desc:'Emergency beacon for marking locations.'},
    ]},
    power:     { id:'power',     label:'POWER',        icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'hover-power-std',   n:'Compact Energy Cell',emoji:'🔋', color:'#059669', weight:3, pw:0, spd:0, dur:0, desc:'1-hour hover time on a standard cell.'},
      {id:'hover-power-plasma',n:'Plasma Energy Core', emoji:'⚡', color:'#7c3aed', weight:4, pw:0, spd:0, dur:0, desc:'3-hour plasma core — powers the fastest thrusters.'},
    ]},
    lighting:  { id:'lighting',  label:'LIGHTS',       icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:4, parts:[
      {id:'hover-light-glow',   n:'Underflow Glow',  emoji:'🌟', color:'#00d9ff', weight:0.3, pw:5,  spd:0, dur:8,  desc:'Soft LED glow underneath. Looks spectacular!'},
      {id:'hover-light-beacon', n:'Strobe Beacon',   emoji:'⚡', color:'#fbbf24', weight:0.4, pw:4,  spd:0, dur:8,  desc:'Visible from 2km away. Safety and style!'},
      {id:'hover-light-ring',   n:'Neon Ring',       emoji:'🌈', color:'#a855f7', weight:0.5, pw:6,  spd:0, dur:10, desc:'Colour-changing neon ring. Turn heads everywhere!'},
      {id:'hover-light-spot',   n:'Spotlights',      emoji:'🔦', color:'#fef3c7', weight:1,   pw:8,  spd:0, dur:12, desc:'Forward spotlights for night operations.'},
    ]},
  },

  // ──────────────────────────────────────────────── UNDERWATER
  underwater: {
    body:      { id:'body',      label:'SUBMARINE HULL',icon:'🤿', catColor:'#075985', bg:'#f0f9ff', cap:1, parts:[
      {id:'underwater-body-torpedo',n:'Torpedo Sub',   emoji:'🚀', color:'#1d4ed8', weight:15, pw:0, spd:88, dur:60, desc:'Sleek torpedo hull. Fastest underwater vehicle.'},
      {id:'underwater-body-squid',  n:'Squid Sub',     emoji:'🦑', color:'#1e3a8a', weight:12, pw:0, spd:80, dur:62, desc:'Bio-inspired design. Manoeuvres like a real squid!'},
      {id:'underwater-body-deep',   n:'Deep Diver',    emoji:'⚓', color:'#172554', weight:25, pw:0, spd:48, dur:92, desc:'Pressure-resistant sphere hull. Goes to 5000m depth!'},
      {id:'underwater-body-explorer',n:'Ocean Explorer',emoji:'🔭',color:'#1e40af', weight:18, pw:0, spd:60, dur:75, desc:'Wide science platform. Carries all your ocean sensors.'},
    ]},
    propulsion:{ id:'propulsion',label:'PROPULSION',  icon:'🌀', catColor:'#7c3aed', bg:'#faf5ff', cap:6, parts:[
      {id:'underwater-prop-thruster', n:'Hydro Thrusters',emoji:'🌀', color:'#3b82f6', weight:2, pw:18, spd:70, dur:45, desc:'Electric thrusters. Silent and efficient.'},
      {id:'underwater-prop-jet',      n:'Water Jet',      emoji:'💨', color:'#0284c7', weight:3, pw:30, spd:92, dur:40, desc:'Pump-jet propulsion. Maximum underwater speed!'},
      {id:'underwater-prop-fin',      n:'Hydrofoil Fins', emoji:'🐟', color:'#0891b2', weight:2, pw:10, spd:65, dur:55, desc:'Flexible fin propulsion like a real fish.'},
      {id:'underwater-prop-screw',    n:'Precision Screws',emoji:'⚙️',color:'#374151', weight:3, pw:15, spd:58, dur:65, desc:'Multi-axis screws for precise manoeuvring.'},
    ]},
    sensors:   { id:'sensors',   label:'SENSORS',      icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:4, parts:[
      {id:'underwater-sensor-sonar',   n:'Active Sonar',      emoji:'🔊', color:'#3b82f6', weight:2, pw:10, spd:0, dur:25, desc:'Sound-wave mapping of ocean floor and objects.'},
      {id:'underwater-sensor-camera',  n:'Underwater Camera', emoji:'📷', color:'#1e90ff', weight:1, pw:5,  spd:0, dur:20, desc:'High-def camera. Records amazing deep-sea footage!'},
      {id:'underwater-sensor-pressure',n:'Depth Gauge',       emoji:'📏', color:'#374151', weight:0.5,pw:3,  spd:0, dur:15, desc:'Measures water pressure for safe depth control.'},
      {id:'underwater-sensor-chem',    n:'Water Chemistry',   emoji:'🧪', color:'#7c3aed', weight:1, pw:8,  spd:0, dur:20, desc:'Analyses ocean chemistry in real time.'},
      {id:'underwater-sensor-thermal', n:'Thermal Vent Sensor',emoji:'🌡️',color:'#f97316', weight:2, pw:8, spd:0, dur:20, desc:'Detects thermal vents and temperature anomalies.'},
      {id:'underwater-sensor-life',    n:'Life Detector',     emoji:'🐠', color:'#059669', weight:2, pw:12, spd:0, dur:25, desc:'Detects movement and bio-electric fields of marine life.'},
    ]},
    tools:     { id:'tools',     label:'EQUIPMENT',    icon:'🔧', catColor:'#374151', bg:'#f9fafb', cap:3, parts:[
      {id:'underwater-tool-sample', n:'Sea Floor Sampler',emoji:'🧪', color:'#a16207', weight:3, pw:6,  spd:0, dur:30, desc:'Collects seafloor sediment and water samples.'},
      {id:'underwater-tool-arm',    n:'Manipulator Arm', emoji:'🦾', color:'#374151', weight:5, pw:10, spd:0, dur:40, desc:'Robotic arm retrieves objects from the seafloor.'},
      {id:'underwater-tool-light',  n:'Deep Light Array', emoji:'🔦', color:'#fef3c7', weight:2, pw:12, spd:0, dur:20, desc:'Ultra-bright lights. Sees in total ocean darkness.'},
      {id:'underwater-tool-anchor', n:'Anchor & Cable',   emoji:'⚓', color:'#1c1917', weight:6, pw:5,  spd:0, dur:50, desc:'Anchors to seafloor for stable scientific work.'},
    ]},
    power:     { id:'power',     label:'POWER',        icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'underwater-power-std',   n:'Sealed LiPo Pack', emoji:'🔋', color:'#059669', weight:5, pw:0, spd:0, dur:0, desc:'Waterproof sealed battery. 3-hour dive time.'},
      {id:'underwater-power-nuke',  n:'Mini Nuclear Cell',emoji:'☢️', color:'#fde68a', weight:12, pw:0, spd:0, dur:0, desc:'Miniature RTG. Powers deep dives for weeks!'},
    ]},
    ai:        { id:'ai',        label:'NAVIGATION AI',icon:'🧠', catColor:'#7c3aed', bg:'#faf5ff', cap:1, parts:[
      {id:'underwater-ai-basic',  n:'Basic Dive Controller',emoji:'🧠', color:'#9ca3af', weight:1, pw:5,  spd:0, dur:0, desc:'Depth hold and basic navigation.'},
      {id:'underwater-ai-smart',  n:'Ocean Explorer AI',    emoji:'💡', color:'#f59e0b', weight:2, pw:20, spd:0, dur:0, desc:'Maps ocean floor, finds interesting features.'},
    ]},
  },

  // ──────────────────────────────────────────────── CARRIER
  carrier: {
    body:      { id:'body',      label:'CARRIER HULL', icon:'🚀', catColor:'#7e22ce', bg:'#faf5ff', cap:1, parts:[
      {id:'carrier-body-launch',  n:'Rocket Launcher',  emoji:'🚀', color:'#7e22ce', weight:20, pw:0, spd:65, dur:70, desc:'Rapid-deploy rocket hull. Reaches orbit!'},
      {id:'carrier-body-bus',     n:'Star Bus',         emoji:'🛸', color:'#6d28d9', weight:35, pw:0, spd:45, dur:85, desc:'Wide-body carrier for heavy orbital missions.'},
      {id:'carrier-body-orbital', n:'Orbital Station',  emoji:'⭕', color:'#4c1d95', weight:50, pw:0, spd:30, dur:95, desc:'Ring-station hull. Houses multiple sub-systems.'},
      {id:'carrier-body-heavy',   n:'Heavy Carrier',    emoji:'💪', color:'#3b0764', weight:55, pw:0, spd:28, dur:98, desc:'Maximum cargo capacity. The ultimate carrier.'},
    ]},
    propulsion:{ id:'propulsion',label:'ENGINES',      icon:'🚀', catColor:'#7c3aed', bg:'#faf5ff', cap:8, parts:[
      {id:'carrier-engine-ion',    n:'Ion Drive',       emoji:'💨', color:'#67e8f9', weight:3, pw:20, spd:60, dur:55, desc:'Silent ion propulsion. Efficient for long distances.'},
      {id:'carrier-engine-plasma', n:'Plasma Engine',   emoji:'⚡', color:'#a855f7', weight:5, pw:60, spd:85, dur:45, desc:'Plasma-powered main engine. Incredible thrust!'},
      {id:'carrier-engine-rocket', n:'Rocket Booster',  emoji:'🔥', color:'#dc2626', weight:8, pw:80, spd:100,dur:35, desc:'Chemical rocket. Maximum launch velocity!'},
      {id:'carrier-engine-gravity',n:'Gravity Drive',   emoji:'🌀', color:'#06b6d4', weight:6, pw:50, spd:75, dur:65, desc:'Experimental gravity manipulation engine.'},
      {id:'carrier-engine-nuclear',n:'Nuclear Pulse',   emoji:'☢️', color:'#fde68a', weight:10, pw:100,spd:90,dur:70, desc:'Nuclear pulse drive. Powers the biggest carriers.'},
      {id:'carrier-engine-warp',   n:'Warp Thruster',   emoji:'🌟', color:'#c084fc', weight:4, pw:90, spd:95, dur:50, desc:'Experimental warp drive technology!'},
    ]},
    arms:      { id:'arms',      label:'ROBOTIC ARMS',  icon:'🦾', catColor:'#dc2626', bg:'#fff1f2', cap:8, parts:[
      {id:'carrier-arm-standard', n:'Utility Arm',     emoji:'🤖', color:'#374151', weight:8,  pw:12, spd:0, dur:55, desc:'General purpose carrier arm. Handles cargo.'},
      {id:'carrier-arm-heavy',    n:'Heavy Lift Arm',  emoji:'💪', color:'#1c1917', weight:18, pw:30, spd:0, dur:75, desc:'Lifts massive cargo containers with ease.'},
      {id:'carrier-arm-precision',n:'Precision Arm',   emoji:'🎯', color:'#4c1d95', weight:5,  pw:10, spd:0, dur:45, desc:'Precision docking arm for spacecraft connections.'},
      {id:'carrier-arm-repair',   n:'Maintenance Arm', emoji:'🔧', color:'#374151', weight:6,  pw:15, spd:0, dur:60, desc:'Repairs external damage and replaces components.'},
    ]},
    sensors:   { id:'sensors',   label:'SENSORS',       icon:'👁️', catColor:'#d97706', bg:'#fffbeb', cap:6, parts:[
      {id:'carrier-sensor-radar', n:'Long Range Radar', emoji:'📡', color:'#374151', weight:3, pw:15, spd:0, dur:40, desc:'Detects objects thousands of km away.'},
      {id:'carrier-sensor-scan',  n:'Deep Space Scanner',emoji:'🔭',color:'#1e40af', weight:4, pw:20, spd:0, dur:35, desc:'Maps star systems and distant planets.'},
      {id:'carrier-sensor-track', n:'Multi-Target Tracker',emoji:'🎯',color:'#dc2626',weight:3, pw:18, spd:0, dur:35, desc:'Tracks many objects simultaneously.'},
      {id:'carrier-sensor-comm',  n:'Deep Space Comms',  emoji:'📻', color:'#7c3aed', weight:2, pw:25, spd:0, dur:30, desc:'Communicates across the entire solar system!'},
      {id:'carrier-sensor-life',  n:'Life Scanner',      emoji:'🌍', color:'#059669', weight:2, pw:15, spd:0, dur:30, desc:'Searches for signs of life on planets below.'},
    ]},
    tools:     { id:'tools',     label:'SYSTEMS',       icon:'🔧', catColor:'#374151', bg:'#f9fafb', cap:4, parts:[
      {id:'carrier-tool-dock',    n:'Docking Port',    emoji:'🔗', color:'#374151', weight:8,  pw:5,  spd:0, dur:50, desc:'Links to other spacecraft and space stations.'},
      {id:'carrier-tool-shield',  n:'Deflector Shield',emoji:'🛡️', color:'#1e40af', weight:10, pw:30, spd:0, dur:75, desc:'Energy shield deflects space debris and attacks.'},
      {id:'carrier-tool-lab',     n:'Science Lab',     emoji:'🔬', color:'#0c4a6e', weight:6,  pw:15, spd:0, dur:40, desc:'On-board laboratory. Analyses alien materials.'},
      {id:'carrier-tool-beacon',  n:'Distress Beacon', emoji:'📡', color:'#dc2626', weight:2,  pw:10, spd:0, dur:30, desc:'Emergency signal reaches rescue ships anywhere.'},
    ]},
    power:     { id:'power',     label:'POWER CORE',   icon:'🔋', catColor:'#16a34a', bg:'#f0fdf4', cap:1, parts:[
      {id:'carrier-power-fusion', n:'Fusion Reactor', emoji:'☀️', color:'#fde68a', weight:20, pw:0, spd:0, dur:0, desc:'Fusion power. Unlimited clean energy!'},
      {id:'carrier-power-nuke',   n:'Nuclear Reactor',emoji:'☢️', color:'#059669', weight:30, pw:0, spd:0, dur:0, desc:'Nuclear fission. Powers the biggest carriers.'},
    ]},
    lighting:  { id:'lighting',  label:'SYSTEMS',      icon:'💡', catColor:'#ec4899', bg:'#fdf2f8', cap:6, parts:[
      {id:'carrier-light-nav',    n:'Navigation Array',  emoji:'🔴', color:'#dc2626', weight:0.5, pw:5,  spd:0, dur:10, desc:'Required navigation lights for space travel.'},
      {id:'carrier-light-dock',   n:'Docking Lights',    emoji:'🟡', color:'#f59e0b', weight:0.5, pw:6,  spd:0, dur:10, desc:'Guides ships to the docking bay safely.'},
      {id:'carrier-light-holo',   n:'Hologram Emitter',  emoji:'🌐', color:'#06b6d4', weight:2,   pw:20, spd:0, dur:20, desc:'Projects holographic status displays outside!'},
      {id:'carrier-light-plasma', n:'Plasma Trail',      emoji:'✨', color:'#a855f7', weight:1,   pw:15, spd:0, dur:15, desc:'Glowing plasma trail from the engines.'},
    ]},
  },
};

// ── Add `name` alias for all robot-specific parts ──────────────────────────
Object.values(ROBOT_PARTS_CATALOG).forEach(typeCat => {
  Object.values(typeCat).forEach(cat => {
    cat.parts?.forEach(p => { p.name = p.name || p.n; });
  });
});

// ── Map new body part IDs → chassis mesh IDs ──────────────────────────────
const BODY_TO_CHASSIS_MAP = {
  'spider-body-scout':'spider-scout','spider-body-explorer':'spider-scout',
  'spider-body-heavy':'spider-tank', 'spider-body-cargo':'spider-tank',
  'spider-body-climbing':'spider-scout','spider-body-tactical':'spider-scout',
  'drone-body-racing':'drone-quad',  'drone-body-survey':'drone-quad',
  'drone-body-camera':'drone-quad',  'drone-body-heavylift':'drone-hex',
  'drone-body-rescue':'drone-quad',  'drone-body-cargo':'drone-quad',
  'drone-body-hex':'drone-hex',      'drone-body-octo':'drone-hex',
  'humanoid-body-student':'mech-slim','humanoid-body-explorer':'mech-warrior',
  'humanoid-body-security':'mech-warrior','humanoid-body-worker':'mech-heavy',
  'humanoid-body-athlete':'mech-slim','humanoid-body-heavy':'mech-heavy',
  'humanoid-body-research':'mech-slim',
  'rover-body-compact':'rover-racer', 'rover-body-explorer':'rover-explorer',
  'rover-body-cargo':'rover-cargo',   'rover-body-rescue':'rover-explorer',
  'rover-body-heavy':'rover-cargo',   'rover-body-mining':'rover-cargo',
  'rover-body-science':'rover-explorer','rover-body-offroad':'rover-cargo',
  'tracked-body-scout':'tank-fast',   'tracked-body-standard':'tank-heavy',
  'tracked-body-siege':'tank-siege',  'tracked-body-fortified':'tank-heavy',
  'hover-body-pod':'hover-pod',       'hover-body-skiff':'hover-skiff',
  'hover-body-orb':'hover-orb',       'hover-body-platform':'hover-skiff',
  'underwater-body-torpedo':'sub-torpedo','underwater-body-squid':'sub-squid',
  'underwater-body-deep':'sub-heavy', 'underwater-body-explorer':'sub-torpedo',
  'carrier-body-launch':'carrier-launch','carrier-body-bus':'carrier-bus',
  'carrier-body-orbital':'carrier-orbital','carrier-body-heavy':'carrier-bus',
};

// ── Map new robot-specific part IDs → existing mesh logic IDs ─────────────
// This avoids rewriting 200+ mesh functions; new parts reuse existing geometry.
const PART_MESH_FALLBACK = {
  // Spider legs → existing leg meshes
  'spider-leg-standard':'leg-spider',    'spider-leg-fast':'leg-stalker',
  'spider-leg-heavy':'leg-thick',        'spider-leg-climbing':'leg-claw',
  'spider-leg-magnetic':'leg-magnetic',  'spider-leg-precision':'leg-spider',
  'spider-leg-terrain':'leg-spider',     'spider-leg-jump':'leg-spring',
  'spider-leg-stealth':'leg-stalker',    'spider-leg-industrial':'leg-thick',
  // Spider sensors/tools/power/ai/lights
  'spider-sensor-vision':'sensor-cam',   'spider-sensor-thermal':'sensor-thermal',
  'spider-sensor-night':'sensor-night',  'spider-sensor-lidar':'sensor-lidar',
  'spider-sensor-motion':'sensor-radar', 'spider-sensor-vibration':'sensor-ultra',
  'spider-sensor-wall':'sensor-ultra',   'spider-sensor-env':'sensor-temp',
  'spider-tool-sample':'tool-drill',     'spider-tool-repair':'arm-gripper',
  'spider-tool-scanner':'sensor-lidar',  'spider-tool-hook':'arm-whip',
  'spider-tool-claw':'leg-claw',         'spider-tool-research':'sensor-cam',
  'spider-power-std':'bat-medium',       'spider-power-high':'bat-large',
  'spider-power-solar':'solar',          'spider-ai-basic':'ai-simple',
  'spider-ai-smart':'ai-smart',          'spider-ai-swarm':'ai-super',
  'spider-light-led':'deco-led',         'spider-light-spot':'deco-led',
  'spider-light-uv':'deco-neon',         'spider-light-beacon':'deco-led',
  // Drone rotors → propeller meshes
  'drone-rotor-standard':'prop-small',   'drone-rotor-racing':'prop-small',
  'drone-rotor-silent':'prop-large',     'drone-rotor-heavylift':'prop-large',
  'drone-rotor-longrange':'prop-large',  'drone-rotor-folding':'prop-dual',
  'drone-sensor-camera':'sensor-cam',    'drone-sensor-thermal':'sensor-thermal',
  'drone-sensor-gps':'sensor-gps',       'drone-sensor-altitude':'sensor-accel',
  'drone-sensor-lidar':'sensor-lidar',   'drone-sensor-tracking':'sensor-cam',
  'drone-sensor-weather':'sensor-temp',  'drone-sensor-wind':'sensor-ultra',
  'drone-tool-winch':'arm-whip',         'drone-tool-rescue':'arm-gripper',
  'drone-tool-spotlight':'deco-led',     'drone-tool-delivery':'bat-large',
  'drone-tool-medical':'bat-medium',     'drone-power-std':'bat-medium',
  'drone-power-high':'bat-large',        'drone-power-hydrogen':'hydrogen',
  'drone-ai-basic':'ai-simple',          'drone-ai-auto':'ai-smart',
  'drone-ai-smart':'ai-super',           'drone-light-nav':'deco-led',
  'drone-light-strobe':'deco-neon',      'drone-light-rgb':'deco-neon',
  'drone-light-search':'deco-led',
  // Humanoid legs → leg meshes
  'humanoid-leg-walking':'leg-humanoid', 'humanoid-leg-running':'leg-spring',
  'humanoid-leg-climbing':'leg-claw',    'humanoid-leg-heavyduty':'leg-thick',
  'humanoid-leg-precision':'leg-humanoid','humanoid-leg-jump':'leg-pogo',
  'humanoid-arm-standard':'arm-gripper', 'humanoid-arm-precision':'arm-precision',
  'humanoid-arm-heavylift':'arm-power',  'humanoid-arm-repair':'arm-precision',
  'humanoid-arm-construction':'arm-power','humanoid-arm-medical':'arm-soft',
  'humanoid-sensor-vision':'sensor-cam', 'humanoid-sensor-thermal':'sensor-thermal',
  'humanoid-sensor-lidar':'sensor-lidar','humanoid-sensor-hearing':'sensor-ultra',
  'humanoid-sensor-touch':'sensor-prox', 'humanoid-tool-toolkit':'arm-gripper',
  'humanoid-tool-welder':'tool-welder',  'humanoid-tool-medkit':'arm-soft',
  'humanoid-tool-scanner':'sensor-lidar','humanoid-tool-shield':'armor-heavy',
  'humanoid-power-std':'bat-large',      'humanoid-power-high':'bat-huge',
  'humanoid-power-hydrogen':'hydrogen',  'humanoid-ai-basic':'ai-simple',
  'humanoid-ai-smart':'ai-smart',        'humanoid-ai-advanced':'ai-ml',
  'humanoid-ai-social':'ai-personality', 'humanoid-light-eye':'deco-led',
  'humanoid-light-chest':'deco-holo',    'humanoid-light-indicator':'deco-led',
  'humanoid-light-halo':'deco-neon',
  // Rover wheels → wheel meshes
  'rover-wheel-standard':'wheel-rubber', 'rover-wheel-offroad':'wheel-allterrain',
  'rover-wheel-omni':'wheel-ball',        'rover-wheel-mecanum':'wheel-hex',
  'rover-wheel-monster':'wheel-monster', 'rover-wheel-tracks':'wheel-metal',
  'rover-wheel-heavytracks':'wheel-metal','rover-arm-science':'arm-gripper',
  'rover-arm-drill':'tool-drill',         'rover-arm-heavy':'arm-power',
  'rover-arm-precision':'arm-precision',  'rover-sensor-panoramic':'sensor-wide',
  'rover-sensor-lidar':'sensor-lidar',    'rover-sensor-chem':'sensor-temp',
  'rover-sensor-weather':'sensor-temp',   'rover-sensor-ground':'sensor-radar',
  'rover-sensor-radiation':'sensor-prox', 'rover-tool-sample':'tool-vacuum',
  'rover-tool-solar':'solar',             'rover-tool-antenna':'comm-antenna',
  'rover-tool-drill':'tool-drill',        'rover-tool-lights':'deco-led',
  'rover-power-std':'bat-large',          'rover-power-nuclear':'nuclear',
  'rover-power-solar':'bat-solar',        'rover-ai-basic':'ai-simple',
  'rover-ai-science':'ai-smart',          'rover-ai-advanced':'ai-super',
  'rover-light-work':'deco-led',          'rover-light-strobe':'deco-neon',
  'rover-light-nav':'deco-led',
  // Tracked
  'tracked-track-light':'wheel-metal',    'tracked-track-standard':'wheel-metal',
  'tracked-track-heavy':'wheel-metal',    'tracked-track-rubber':'wheel-metal',
  'tracked-tool-cannon':'tool-laser',     'tracked-tool-dozer':'arm-power',
  'tracked-tool-crane':'arm-extend',      'tracked-tool-mine':'sensor-lidar',
  'tracked-tool-shield':'armor-heavy',    'tracked-sensor-camera':'sensor-cam',
  'tracked-sensor-radar':'sensor-radar',  'tracked-sensor-thermal':'sensor-thermal',
  'tracked-sensor-drone':'prop-small',    'tracked-power-std':'bat-huge',
  'tracked-power-heavy':'bat-huge',       'tracked-ai-basic':'ai-simple',
  'tracked-ai-combat':'ai-smart',
  // Hover
  'hover-thrust-standard':'thrust-ion',   'hover-thrust-plasma':'thrust-plasma',
  'hover-thrust-gravity':'thrust-ion',    'hover-thrust-pulse':'thrust-rocket',
  'hover-sensor-scan':'sensor-radar',     'hover-sensor-lidar':'sensor-lidar',
  'hover-sensor-camera':'sensor-cam',     'hover-sensor-thermal':'sensor-thermal',
  'hover-sensor-obstacle':'sensor-prox',  'hover-tool-cargo':'arm-whip',
  'hover-tool-scanner':'sensor-lidar',    'hover-tool-beacon':'comm-antenna',
  'hover-power-std':'bat-large',          'hover-power-plasma':'bat-huge',
  'hover-light-glow':'deco-neon',         'hover-light-beacon':'deco-neon',
  'hover-light-ring':'deco-neon',         'hover-light-spot':'deco-led',
  // Underwater
  'underwater-prop-thruster':'thrust-ion', 'underwater-prop-jet':'prop-turbo',
  'underwater-prop-fin':'prop-fin',        'underwater-prop-screw':'prop-small',
  'underwater-sensor-sonar':'sensor-ultra','underwater-sensor-camera':'sensor-cam',
  'underwater-sensor-pressure':'sensor-pressure','underwater-sensor-chem':'sensor-temp',
  'underwater-sensor-thermal':'sensor-thermal','underwater-sensor-life':'sensor-prox',
  'underwater-tool-sample':'tool-vacuum',  'underwater-tool-arm':'arm-gripper',
  'underwater-tool-light':'deco-led',      'underwater-tool-anchor':'armor-heavy',
  'underwater-power-std':'bat-large',      'underwater-power-nuke':'nuclear',
  'underwater-ai-basic':'ai-simple',       'underwater-ai-smart':'ai-smart',
  // Carrier
  'carrier-engine-ion':'thrust-ion',       'carrier-engine-plasma':'thrust-plasma',
  'carrier-engine-rocket':'thrust-rocket', 'carrier-engine-gravity':'thrust-ion',
  'carrier-engine-nuclear':'nuclear',      'carrier-engine-warp':'thrust-plasma',
  'carrier-arm-standard':'arm-gripper',    'carrier-arm-heavy':'arm-power',
  'carrier-arm-precision':'arm-precision', 'carrier-arm-repair':'arm-precision',
  'carrier-sensor-radar':'sensor-radar',   'carrier-sensor-scan':'sensor-lidar',
  'carrier-sensor-track':'sensor-radar',   'carrier-sensor-comm':'comm-sat',
  'carrier-sensor-life':'sensor-cam',      'carrier-tool-dock':'comm-laser',
  'carrier-tool-shield':'armor-force',     'carrier-tool-lab':'sensor-lidar',
  'carrier-tool-beacon':'comm-antenna',    'carrier-power-fusion':'nuclear',
  'carrier-power-nuke':'nuclear',          'carrier-light-nav':'deco-led',
  'carrier-light-dock':'deco-led',         'carrier-light-holo':'deco-holo',
  'carrier-light-plasma':'deco-neon',
};

/** Search all robot catalogs + legacy catalog for a part by ID */
function findPartById(id, robotTypeId) {
  // Search robot-specific catalog first
  const typeCat = ROBOT_PARTS_CATALOG[robotTypeId];
  if (typeCat) {
    for (const cat of Object.values(typeCat)) {
      const p = cat.parts?.find(q => q.id === id); if (p) return p;
    }
  }
  // Search all robot catalogs
  for (const typeCat2 of Object.values(ROBOT_PARTS_CATALOG)) {
    for (const cat of Object.values(typeCat2)) {
      const p = cat.parts?.find(q => q.id === id); if (p) return p;
    }
  }
  // Fall back to legacy PARTS_CATALOG
  for (const cat of PARTS_CATALOG) { const p = cat.parts.find(q => q.id===id); if (p) return p; }
  return null;
}
function getRobotType(id) { return ROBOT_TYPES.find(t => t.id===id) || ROBOT_TYPES[0]; }
function getVariant(typeId, varId) { const t=getRobotType(typeId); return t.variants.find(v=>v.id===varId)||t.variants[0]; }
function getSize(id) { return SIZE_OPTIONS.find(s=>s.id===id)||SIZE_OPTIONS[1]; }

// ─── Chassis Meshes ───────────────────────────────────────────────────────────
function createChassisMesh(chassisId, colorOverride) {
  const g = new THREE.Group();
  const co = colorOverride;

  if (chassisId === 'spider-scout') {
    const bodyC = co||'#2d3748';
    const acC = '#00d9ff';
    const bodyM = m3(bodyC,.85,.22);
    const glowM = new THREE.MeshStandardMaterial({color:new THREE.Color(acC),emissive:new THREE.Color(acC),emissiveIntensity:1.0,roughness:0,metalness:0});
    // ── Main hexagonal body (clean, like prebuilt SpiderBodyMesh) ──
    const mainHex = new THREE.Mesh(new THREE.CylinderGeometry(.20,.24,.095,6), bodyM);
    mainHex.position.set(0,.065,0); mainHex.rotation.y=Math.PI/6; mainHex.castShadow=true; g.add(mainHex);
    // ── Raised head cap (second smaller hex on top) ──
    const headHex = new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.06,6), m3(bodyC,.88,.20));
    headHex.position.set(0,.145,0); headHex.rotation.y=Math.PI/6; headHex.castShadow=true; g.add(headHex);
    // ── Glowing edge ring between body and head ──
    const ringG = new THREE.TorusGeometry(.145,.004,8,24);
    const ring = new THREE.Mesh(ringG,glowM); ring.rotation.x=Math.PI/2; ring.position.y=.115; g.add(ring);
    // ── Sensor eye (front-facing) ──
    const eyeM = new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:1.8,roughness:0,metalness:0});
    const eye = new THREE.Mesh(_SPH,eyeM); eye.scale.set(.024,.024,.014); eye.position.set(.175,.150,0); g.add(eye);
    // ── Power core in body center ──
    const core = new THREE.Mesh(_SPH,glowM); core.scale.setScalar(.018); core.position.set(0,.068,0); g.add(core);
    // ── LED strips on 3 hex faces ──
    const ledM = new THREE.MeshStandardMaterial({color:new THREE.Color(acC),emissive:new THREE.Color(acC),emissiveIntensity:0.7,roughness:0});
    [0,2,4].forEach(fi=>{
      const a=(fi/6)*Math.PI*2+Math.PI/6;
      const strip=new THREE.Mesh(new THREE.BoxGeometry(.001,.06,.08),ledM);
      strip.position.set(Math.cos(a)*.205,.065,Math.sin(a)*.205); strip.rotation.y=-a; g.add(strip);
    });
    // ── 8 Leg socket collars at body edge ──
    const sockM = new THREE.MeshStandardMaterial({color:new THREE.Color(acC),emissive:new THREE.Color(acC),emissiveIntensity:0.9,roughness:0,metalness:0});
    const collarBodyM = m3('#1a2535',.90,.20);
    [[.20,.06,0],[.141,.06,.141],[0,.06,.20],[-.141,.06,.141],
     [-.20,.06,0],[-.141,.06,-.141],[0,.06,-.20],[.141,.06,-.141]].forEach(([sx,sy,sz])=>{
      const collarG = new THREE.CylinderGeometry(.014,.016,.024,8);
      const collar = new THREE.Mesh(collarG,collarBodyM);
      collar.rotation.z=Math.PI/2; collar.rotation.y=-Math.atan2(sz,sx);
      collar.position.set(sx,sy,sz); g.add(collar);
      const dot=new THREE.Mesh(_SPH,sockM); dot.scale.setScalar(.010); dot.position.set(sx,sy,sz); g.add(dot);
    });
  } else if (chassisId==='spider-tank') {
    const body=bx(.52,.14,.36,co||'#1F2937',.8,.4); body.position.y=.09; g.add(body);
    const top=bx(.38,.05,.28,'#111827',.8,.35); top.position.y=.185; g.add(top);
    [-.14,0,.14].forEach(z=>{const rv=cy(.013,.025,'#374151',.7,.4); rv.position.set(0,.21,z); g.add(rv);});
    const eye=new THREE.Mesh(_SPH,m3('#ff4400',.1,.1,'#ff4400',3)); eye.scale.set(.035,.035,.035); eye.position.set(.245,.1,0); g.add(eye);
    // 8 socket stubs on tank hull sides — heavy armored hip collars
    const tankSockM = new THREE.MeshStandardMaterial({color:0x00aaff,emissive:0x00aaff,emissiveIntensity:2.0,roughness:0});
    [[.26,.09,0],[.185,.09,.185],[0,.09,.26],[-.185,.09,.185],
     [-.26,.09,0],[-.185,.09,-.185],[0,.09,-.26],[.185,.09,-.185]].forEach(([sx,sy,sz])=>{
      const c2=new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,.032,8),new THREE.MeshStandardMaterial({color:0x374151,metalness:.9,roughness:.2}));
      c2.rotation.z=Math.PI/2; c2.rotation.y=-Math.atan2(sz,sx); c2.position.set(sx,sy,sz); g.add(c2);
      const d2=new THREE.Mesh(_SPH,tankSockM); d2.scale.setScalar(.012); d2.position.set(sx,sy,sz); g.add(d2);
    });
  } else if (chassisId==='spider-nano') {
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.055,6),m3(co||'#6B7280',.6,.3)); body.position.y=.045; g.add(body);
    const core=new THREE.Mesh(_SPH,m3('#00ffaa',.1,.2,'#00ffaa',1.5)); core.scale.set(.04,.04,.04); core.position.y=.075; g.add(core);
    // 8 tiny nano socket dots at hull edge
    const nanoSM = new THREE.MeshStandardMaterial({color:0x00ffaa,emissive:0x00ffaa,emissiveIntensity:3.0,roughness:0});
    [0,1,2,3,4,5,6,7].forEach(i=>{
      const a=(i/8)*Math.PI*2;
      const d=new THREE.Mesh(_SPH,nanoSM); d.scale.setScalar(.007); d.position.set(Math.cos(a)*.12,.04,Math.sin(a)*.12); g.add(d);
    });
  } else if (chassisId==='rover-explorer') {
    const body=bx(.55,.12,.26,co||'#B45309',.5,.55); body.position.y=.17; g.add(body);
    const deck=bx(.38,.04,.22,'#92400E',.5,.55); deck.position.y=.25; g.add(deck);
    const mast=cy(.016,.18,'#78350F',.6,.4); mast.position.set(.12,.33,0); g.add(mast);
    const panel=bx(.12,.001,.1,'#1E40AF',.3,.6); panel.position.set(.12,.43,0); panel.rotation.z=.3; g.add(panel);
    [-.22,0,.22].forEach(z=>[-1,1].forEach(s=>{
      const axle=cy(.015,.07,'#6B7280',.7,.3); axle.rotation.z=Math.PI/2; axle.position.set(s*.29,.1,z); g.add(axle);
      const rim=new THREE.Mesh(_TOR,m3('#1a1a1a',.05,.9)); rim.scale.set(.08,.08,.022); rim.rotation.y=Math.PI/2; rim.position.set(s*.29,.1,z); g.add(rim);
    }));
  } else if (chassisId==='rover-racer') {
    const body=bx(.52,.075,.22,co||'#DC2626',.6,.4); body.position.y=.1; g.add(body);
    const cockpit=new THREE.Mesh(_SPH,m3('#88ccff',.1,.1)); cockpit.scale.set(.1,.055,.09); cockpit.position.set(.05,.145,0); g.add(cockpit);
    const spoiler=bx(.1,.045,.26,'#991B1B',.7,.3); spoiler.position.set(-.21,.15,0); g.add(spoiler);
    [-.22,.22].forEach(z=>[-1,1].forEach((s,si)=>{
      const r=si===1?.088:.1;
      const rim=new THREE.Mesh(_TOR,m3('#111',.05,.95)); rim.scale.set(r,r,.028); rim.rotation.y=Math.PI/2; rim.position.set(s*.27,.1,z); g.add(rim);
      const hub=cy(.03,.03,'#333',.8,.3); hub.rotation.z=Math.PI/2; hub.position.set(s*.27,.1,z); g.add(hub);
    }));
  } else if (chassisId==='rover-cargo') {
    const frame=bx(.58,.06,.3,co||'#166534',.6,.5); frame.position.y=.1; g.add(frame);
    const bed=bx(.46,.018,.28,'#14532D',.5,.55); bed.position.y=.14; g.add(bed);
    [-.13,.13].forEach(z=>{const rail=bx(.48,.025,.006,co||'#166534',.6,.4); rail.position.set(0,.16,z); g.add(rail);});
    [-.19,0,.19].forEach(z=>[-1,1].forEach(s=>{
      const rim=new THREE.Mesh(_TOR,m3('#0a0a0a',.05,.95)); rim.scale.set(.075,.075,.025); rim.rotation.y=Math.PI/2; rim.position.set(s*.31,.1,z); g.add(rim);
      const hub=cy(.025,.025,'#2d4a2d',.7,.3); hub.rotation.z=Math.PI/2; hub.position.set(s*.31,.1,z); g.add(hub);
    }));
  } else if (chassisId==='drone-quad') {
    const dc = co||'#1E40AF';
    const acC = '#4DBBFF';
    // ── Central hub (octagonal body) ──
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.085,.095,.055,8), m3(dc,.85,.2));
    hub.position.y=.13; g.add(hub);
    // Top dome (tinted glass canopy)
    const canopyM = new THREE.MeshStandardMaterial({color:0x88aaff,transparent:true,opacity:.4,roughness:.05,metalness:.1});
    const canopy = new THREE.Mesh(_SPH,canopyM); canopy.scale.set(.07,.04,.07); canopy.position.y=.165; g.add(canopy);
    // Bottom electronics plate
    const plate = bx(.11,.01,.11,'#0a0f1e',.9,.2); plate.position.y=.1; g.add(plate);
    // Hub ring accent
    const hubRingM = new THREE.MeshStandardMaterial({color:new THREE.Color(acC),emissive:new THREE.Color(acC),emissiveIntensity:0.8,roughness:0});
    const hubRing = new THREE.Mesh(new THREE.TorusGeometry(.085,.005,8,40),hubRingM);
    hubRing.rotation.x=Math.PI/2; hubRing.position.y=.15; g.add(hubRing);
    // ── 4 Arms with motors and props ──
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz],ai)=>{
      const armAngle = Math.atan2(dx,dz);
      // Arm tube
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(.014,.016,.28,8),m3(dc,.85,.3));
      arm.rotation.z = Math.PI/2; arm.rotation.y = armAngle;
      arm.position.set(dx*.14,.13,dz*.14); g.add(arm);
      // Arm accent line
      const armLine = new THREE.Mesh(new THREE.BoxGeometry(.001,.001,.26), new THREE.MeshStandardMaterial({color:0x224488,emissive:0x224488,emissiveIntensity:0.8}));
      armLine.rotation.y=armAngle; armLine.position.set(dx*.14,.145,dz*.14); g.add(armLine);
      // Motor housing (cylindrical)
      const mot = new THREE.Mesh(new THREE.CylinderGeometry(.028,.032,.042,12),m3('#0f1520',.9,.25));
      mot.position.set(dx*.265,.13,dz*.265); g.add(mot);
      // Motor bell bottom
      const bell = new THREE.Mesh(new THREE.CylinderGeometry(.032,.026,.012,12),m3('#1a2a3a',.9,.3));
      bell.position.set(dx*.265,.105,dz*.265); g.add(bell);
      // Motor indicator LED
      const ledC = ai%2===0 ? '#ff4444' : '#44ff44';
      const ledM = new THREE.MeshStandardMaterial({color:new THREE.Color(ledC),emissive:new THREE.Color(ledC),emissiveIntensity:3.0});
      const led = new THREE.Mesh(_SPH,ledM); led.scale.setScalar(.007);
      led.position.set(dx*.265,.152,dz*.265); g.add(led);
      // Prop guard ring
      const guardM = new THREE.MeshStandardMaterial({color:new THREE.Color(dc),metalness:.7,roughness:.4,transparent:true,opacity:.6});
      const guard = new THREE.Mesh(new THREE.TorusGeometry(.095,.006,8,32),guardM);
      guard.rotation.x=Math.PI/2; guard.position.set(dx*.265,.13,dz*.265); g.add(guard);
      // Propulsion socket glow — user adds propulsion parts here
      const propSockM = new THREE.MeshStandardMaterial({color:0x44ffcc,emissive:0x44ffcc,emissiveIntensity:0.8,roughness:0});
      const propSock = new THREE.Mesh(_SPH,propSockM); propSock.scale.setScalar(.010);
      propSock.position.set(dx*.265,.158,dz*.265); g.add(propSock);
    });
    // ── Landing legs ──
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([lx,lz])=>{
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.09,6),m3('#334155',.7,.5));
      leg.position.set(lx*.06,.055,lz*.06); g.add(leg);
      const foot = bx(.08,.006,.006,'#22304a',.7,.5); foot.position.set(lx*.06,.005,lz*.06); g.add(foot);
    });
    // Power indicator core
    const piM = new THREE.MeshStandardMaterial({color:0x00ffaa,emissive:0x00ffaa,emissiveIntensity:1.0,roughness:0});
    const pi = new THREE.Mesh(_SPH,piM); pi.scale.setScalar(.014); pi.position.set(0,.13,0); g.add(pi);
  } else if (chassisId==='drone-hex') {
    const hub=cy(.08,.05,co||'#0F766E',.7,.3); hub.position.y=.14; g.add(hub);
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      const arm=bx(.22,.012,.012,co||'#0D9488',.7,.4); arm.position.set(Math.sin(a)*.11,.14,Math.cos(a)*.11); arm.rotation.y=a; g.add(arm);
      const mot=cy(.028,.035,'#0A0A0A',.8,.3); mot.position.set(Math.sin(a)*.21,.14,Math.cos(a)*.21); g.add(mot);
      const pM=new THREE.MeshStandardMaterial({color:0x99ddcc,transparent:true,opacity:.5,roughness:.3});
      const pp=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.003,18),pM); pp.position.set(Math.sin(a)*.21,.165,Math.cos(a)*.21); g.add(pp);
    }
    [-1,1].forEach(s=>{const sk=bx(.32,.005,.005,'#1F2937',.5,.5); sk.position.set(0,.085,s*.08); g.add(sk);});
  } else if (chassisId==='drone-wing') {
    const fuse=cy(.055,.52,co||'#4F46E5',.6,.4); fuse.rotation.z=Math.PI/2; fuse.position.y=.12; g.add(fuse);
    const nose=new THREE.Mesh(_CONE,m3(co||'#4F46E5',.6,.3)); nose.scale.set(.055,.09,.055); nose.rotation.z=Math.PI/2; nose.position.set(.3,.12,0); g.add(nose);
    const domeM=new THREE.MeshStandardMaterial({color:0x99aaff,transparent:true,opacity:.5,roughness:.1});
    const dome=new THREE.Mesh(_SPH,domeM); dome.scale.set(.04,.03,.038); dome.position.set(.18,.145,0); g.add(dome);
    const wing=bx(.08,.005,.42,co||'#3730A3',.6,.4); wing.position.set(.02,.12,0); g.add(wing);
    const finV=bx(.12,.09,.005,'#6366F1',.5,.4); finV.position.set(-.21,.165,0); g.add(finV);
    const finH=bx(.09,.005,.16,'#6366F1',.5,.4); finH.position.set(-.21,.12,0); g.add(finH);
    const pM2=new THREE.MeshStandardMaterial({color:0xaabbff,transparent:true,opacity:.5});
    const pp2=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.003,16),pM2); pp2.position.set(-.27,.12,0); g.add(pp2);
  } else if (chassisId==='tank-heavy') {
    const hull=bx(.52,.18,.34,co||'#1C1917',.75,.5); hull.position.y=.13; g.add(hull);
    const tBase=cy(.12,.04,'#292524',.75,.45); tBase.position.y=.245; g.add(tBase);
    const tRing=new THREE.Mesh(_TOR,m3('#44403C',.7,.3)); tRing.scale.set(.115,.115,.012); tRing.rotation.x=Math.PI/2; tRing.position.y=.245; g.add(tRing);
    [-1,1].forEach(s=>{
      const track=bx(.54,.1,.095,'#0A0A0A',.85,.7); track.position.set(0,.1,s*.2); g.add(track);
      [-0.23,.23].forEach(x=>{const sp=cy(.048,.098,co||'#1C1917',.7,.4); sp.rotation.x=Math.PI/2; sp.position.set(x,.1,s*.2); g.add(sp);});
      for(let i=-2;i<=2;i++){const seg=bx(.075,.01,.095,'#141414',.85,.6); seg.position.set(i*.105,.052,s*.2); g.add(seg);}
    });
  } else if (chassisId==='tank-fast') {
    const hull=bx(.48,.1,.22,co||'#374151',.7,.45); hull.position.y=.1; g.add(hull);
    const wedge=new THREE.Mesh(_CONE,m3(co||'#374151',.7,.45)); wedge.scale.set(.11,.18,.22); wedge.rotation.z=Math.PI/2; wedge.position.set(.29,.1,0); g.add(wedge);
    [-1,1].forEach(s=>{
      const track=bx(.5,.065,.065,'#111',.85,.7); track.position.set(0,.065,s*.145); g.add(track);
      [-0.22,.22].forEach(x=>{const sp=cy(.034,.066,'#222',.7,.4); sp.rotation.x=Math.PI/2; sp.position.set(x,.065,s*.145); g.add(sp);});
    });
  } else if (chassisId==='tank-siege') {
    const hull=bx(.62,.16,.32,co||'#292524',.75,.5); hull.position.y=.12; g.add(hull);
    [-1,1].forEach((s,si)=>{
      const rng=cy(.085,.035,co||'#1C1917',.75,.4); rng.position.set(si===0?.1:-.1,.22,0); g.add(rng);
    });
    [-1,1].forEach(s=>{
      const track=bx(.64,.1,.09,'#0A0A0A',.85,.7); track.position.set(0,.1,s*.2); g.add(track);
      [-0.27,.27].forEach(x=>{const sp=cy(.048,.092,co||'#1C1917',.7,.4); sp.rotation.x=Math.PI/2; sp.position.set(x,.1,s*.2); g.add(sp);});
    });
  } else if (chassisId==='hover-pod') {
    const pod=new THREE.Mesh(_SPH,m3(co||'#0284C7',.4,.3)); pod.scale.set(.22,.12,.22); pod.position.y=.22; g.add(pod);
    const capM=new THREE.MeshStandardMaterial({color:0x88ddff,transparent:true,opacity:.35,roughness:.1});
    const cap=new THREE.Mesh(_SPH,capM); cap.scale.set(.1,.07,.1); cap.position.y=.3; g.add(cap);
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz])=>{
      const thr=cy(.035,.09,'#0F172A',.75,.4); thr.position.set(dx*.18,.1,dz*.18); g.add(thr);
      const gl=new THREE.Mesh(_SPH,m3('#00ccff',.1,.1,'#00ccff',1.8)); gl.scale.set(.025,.025,.025); gl.position.set(dx*.18,.055,dz*.18); g.add(gl);
    });
    const ringG=new THREE.TorusGeometry(.175,.012,8,48);
    const ring=new THREE.Mesh(ringG,m3(co||'#0284C7',.3,.2,co||'#0284C7',1.4)); ring.rotation.x=Math.PI/2; ring.position.y=.08; g.add(ring);
  } else if (chassisId==='hover-skiff') {
    const plat=bx(.5,.05,.3,co||'#0F766E',.65,.4); plat.position.y=.18; g.add(plat);
    const r1=bx(.52,.03,.02,co||'#0D9488',.7,.3); r1.position.set(0,.18,.16); g.add(r1);
    const r2=bx(.52,.03,.02,co||'#0D9488',.7,.3); r2.position.set(0,.18,-.16); g.add(r2);
    [[.23,.15],[.23,-.15],[-.23,.15],[-.23,-.15]].forEach(([x,z])=>{
      const thr=cy(.032,.1,'#0A2A2A',.8,.4); thr.position.set(x,.12,z); g.add(thr);
      const gl=new THREE.Mesh(_SPH,m3('#00ffcc',.1,.1,'#00ffcc',1.6)); gl.scale.set(.022,.022,.022); gl.position.set(x,.065,z); g.add(gl);
    });
  } else if (chassisId==='hover-orb') {
    const orb=new THREE.Mesh(_SPH,m3(co||'#7C3AED',.45,.3)); orb.scale.set(.21,.21,.21); orb.position.y=.21; g.add(orb);
    const eqR=new THREE.Mesh(new THREE.TorusGeometry(.21,.012,8,48),m3(co||'#A78BFA',.5,.2,'#A78BFA',1.2)); eqR.rotation.x=Math.PI/2; eqR.position.y=.21; g.add(eqR);
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      const thr=cy(.025,.07,'#2E1065',.8,.4); thr.position.set(Math.cos(a)*.19,.21,Math.sin(a)*.19); g.add(thr);
      const gl=new THREE.Mesh(_SPH,m3('#c084fc',.1,.1,'#c084fc',1.8)); gl.scale.set(.018,.018,.018); gl.position.set(Math.cos(a)*.19,.175,Math.sin(a)*.19); g.add(gl);
    }
    const capM=new THREE.MeshStandardMaterial({color:0xccaaff,transparent:true,opacity:.3,roughness:.1});
    const cap=new THREE.Mesh(_SPH,capM); cap.scale.set(.1,.1,.1); cap.position.y=.3; g.add(cap);
  } else if (chassisId==='mech-warrior') {
    const torso=bx(.22,.28,.15,co||'#1F2937',.45,.5); torso.position.y=.25; g.add(torso);
    const gl=new THREE.Mesh(_BOX,m3('#0077ff',.1,.4,'#0077ff',1.5)); gl.scale.set(.1,.07,.002); gl.position.set(0,.27,.076); g.add(gl);
    const head=bx(.13,.13,.11,'#111827',.4,.45); head.position.y=.45; g.add(head);
    [-.03,.03].forEach(ex=>{const e=new THREE.Mesh(_SPH,m3('#00d9ff',.1,.1,'#00d9ff',1.6)); e.scale.set(.017,.013,.013); e.position.set(ex,.46,.057); g.add(e);});
    [-1,1].forEach(s=>{
      const sh=new THREE.Mesh(_SPH,m3(co||'#1F2937',.5,.4)); sh.scale.set(.052,.052,.052); sh.position.set(s*.135,.37,0); g.add(sh);
      const ua=cy(.035,.14,co||'#1F2937',.5,.5); ua.position.set(s*.185,.25,0); g.add(ua);
      const la=cy(.029,.12,'#374151',.5,.5); la.position.set(s*.185,.1,0); g.add(la);
      const hand=new THREE.Mesh(_SPH,m3('#6B7280',.4,.4)); hand.scale.set(.033,.028,.028); hand.position.set(s*.185,.025,0); g.add(hand);
    });
    [-1,1].forEach(s=>{
      const th=cy(.044,.16,co||'#1F2937',.5,.5); th.position.set(s*.06,.06,0); g.add(th);
      const kn=new THREE.Mesh(_SPH,m3('#374151',.6,.3)); kn.scale.set(.038,.038,.038); kn.position.set(s*.06,-.035,0); g.add(kn);
      const sh=cy(.038,.14,'#374151',.5,.5); sh.position.set(s*.06,-.125,0); g.add(sh);
      const ft=bx(.065,.022,.11,co||'#1F2937',.5,.6); ft.position.set(s*.065+.01,-.205,.01); g.add(ft);
    });
  } else if (chassisId==='mech-heavy') {
    const torso=bx(.3,.3,.2,co||'#1C1917',.55,.5); torso.position.y=.28; g.add(torso);
    const gl=new THREE.Mesh(_BOX,m3('#ff4400',.1,.4,'#ff4400',1.3)); gl.scale.set(.12,.05,.002); gl.position.set(0,.28,.101); g.add(gl);
    [-1,1].forEach(s=>{const pad=bx(.1,.1,.06,'#292524',.7,.4); pad.position.set(s*.2,.38,0); g.add(pad);});
    const head=bx(.15,.12,.12,'#0C0A09',.5,.45); head.position.y=.49; g.add(head);
    const visor=new THREE.Mesh(_BOX,m3('#ff2200',.1,.1,'#ff2200',1.8)); visor.scale.set(.12,.025,.002); visor.position.set(0,.495,.062); g.add(visor);
    [-1,1].forEach(s=>{
      const ua=cy(.052,.18,co||'#1C1917',.6,.5); ua.position.set(s*.22,.28,0); g.add(ua);
      const la=cy(.044,.15,'#292524',.6,.5); la.position.set(s*.22,.09,0); g.add(la);
    });
    [-1,1].forEach(s=>{
      const th=cy(.06,.18,co||'#1C1917',.6,.5); th.position.set(s*.075,.07,0); g.add(th);
      const sh=cy(.05,.16,'#292524',.6,.5); sh.position.set(s*.075,-.12,0); g.add(sh);
      const ft=bx(.09,.03,.14,co||'#1C1917',.6,.6); ft.position.set(s*.075+.015,-.21,.015); g.add(ft);
    });
  } else if (chassisId==='mech-slim') {
    const torso=bx(.16,.25,.11,co||'#E5E7EB',.25,.6); torso.position.y=.24; g.add(torso);
    const gl=new THREE.Mesh(_BOX,m3('#22d3ee',.1,.3,'#22d3ee',1.4)); gl.scale.set(.07,.04,.002); gl.position.set(0,.26,.056); g.add(gl);
    const head=new THREE.Mesh(_SPH,m3(co||'#F9FAFB',.2,.5)); head.scale.set(.065,.07,.065); head.position.y=.435; g.add(head);
    [-.02,.02].forEach(ex=>{const e=new THREE.Mesh(_SPH,m3('#22d3ee',.1,.1,'#22d3ee',1.4)); e.scale.set(.012,.01,.01); e.position.set(ex,.44,.064); g.add(e);});
    [-1,1].forEach(s=>{
      const ua=cy(.024,.13,co||'#E5E7EB',.3,.6); ua.position.set(s*.115,.27,0); g.add(ua);
      const la=cy(.02,.11,'#D1D5DB',.3,.6); la.position.set(s*.115,.125,0); g.add(la);
    });
    [-1,1].forEach(s=>{
      const th=cy(.03,.14,co||'#E5E7EB',.3,.6); th.position.set(s*.042,.055,0); g.add(th);
      const kn=new THREE.Mesh(_SPH,m3('#D1D5DB',.3,.5)); kn.scale.set(.028,.028,.028); kn.position.set(s*.042,-.03,0); g.add(kn);
      const sh=cy(.025,.12,'#D1D5DB',.3,.6); sh.position.set(s*.042,-.115,0); g.add(sh);
    });
  } else if (chassisId==='sub-torpedo') {
    const hull=cy(.09,.54,co||'#1D4ED8',.5,.4); hull.rotation.z=Math.PI/2; hull.position.y=.14; g.add(hull);
    const sonar=new THREE.Mesh(_SPH,m3('#60A5FA',.3,.4)); sonar.scale.set(.09,.09,.09); sonar.position.set(.3,.14,0); g.add(sonar);
    const finV=bx(.11,.1,.006,'#1E40AF',.5,.5); finV.position.set(-.23,.19,0); g.add(finV);
    const finH=bx(.09,.006,.16,'#1E40AF',.5,.5); finH.position.set(-.23,.14,0); g.add(finH);
    [-1,1].forEach(s=>{const thr=cy(.022,.055,'#0F172A',.7,.4); thr.rotation.z=Math.PI/2; thr.position.set(-.22,.14,s*.11); g.add(thr);});
  } else if (chassisId==='sub-squid') {
    const body=new THREE.Mesh(_SPH,m3(co||'#1E40AF',.5,.4)); body.scale.set(.22,.14,.18); body.position.y=.17; g.add(body);
    const eye=new THREE.Mesh(_SPH,m3('#fbbf24')); eye.scale.set(.04,.035,.035); eye.position.set(.2,.19,0); g.add(eye);
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      const tent=cy(.012,.12,co||'#1E3A8A',.6,.5); tent.position.set(Math.cos(a)*.07-.15,.13,Math.sin(a)*.07); tent.rotation.z=.3+i*.1; g.add(tent);
    }
    const finL=bx(.1,.004,.1,co||'#1D4ED8',.4,.5); finL.position.set(-.05,.19,.15); finL.rotation.y=.5; g.add(finL);
    const finR=bx(.1,.004,.1,co||'#1D4ED8',.4,.5); finR.position.set(-.05,.19,-.15); finR.rotation.y=-.5; g.add(finR);
  } else if (chassisId==='sub-heavy') {
    const sphere=new THREE.Mesh(_SPH,m3(co||'#1E3A8A',.6,.4)); sphere.scale.set(.24,.24,.24); sphere.position.y=.24; g.add(sphere);
    for(let i=0;i<3;i++){const rib=new THREE.Mesh(new THREE.TorusGeometry(.24,.01,8,48),m3('#1D4ED8',.65,.35)); rib.rotation.x=Math.PI/2; rib.rotation.z=i*Math.PI/3; rib.position.y=.24; g.add(rib);}
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz])=>{const thr=cy(.03,.075,'#0C4A6E',.75,.4); thr.position.set(dx*.22,.15,dz*.22); g.add(thr);});
  } else if (chassisId==='carrier-launch') {
    const rocket=cy(.1,.52,co||'#7E22CE',.6,.4); rocket.position.y=.28; g.add(rocket);
    const nose=new THREE.Mesh(_CONE,m3(co||'#6D28D9',.6,.3)); nose.scale.set(.1,.12,.1); nose.position.y=.55; g.add(nose);
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz])=>{const f=bx(.02,.1,.1,co||'#5B21B6',.6,.4); f.position.set(dx*.12,.1,dz*.12); g.add(f);});
    [-.12,0,.12].forEach(z=>{const tube=cy(.028,.15,'#1F0A3C',.8,.4); tube.position.set(.13,.25,z); tube.rotation.z=Math.PI/2; g.add(tube);});
    const glR=new THREE.Mesh(new THREE.TorusGeometry(.1,.008,8,32),m3('#c084fc',.1,.1,'#c084fc',1.5)); glR.rotation.x=Math.PI/2; glR.position.y=.04; g.add(glR);
  } else if (chassisId==='carrier-bus') {
    const fuse=bx(.62,.16,.24,co||'#6D28D9',.6,.4); fuse.position.y=.16; g.add(fuse);
    const nose=new THREE.Mesh(_CONE,m3(co||'#7C3AED',.6,.35)); nose.scale.set(.12,.1,.12); nose.rotation.z=Math.PI/2; nose.position.set(.34,.16,0); g.add(nose);
    const wing=bx(.1,.006,.48,co||'#5B21B6',.6,.4); wing.position.set(.02,.16,0); g.add(wing);
    const domeM=new THREE.MeshStandardMaterial({color:0xd8b4fe,transparent:true,opacity:.4,roughness:.1});
    const dome=new THREE.Mesh(_SPH,domeM); dome.scale.set(.06,.04,.05); dome.position.set(.2,.2,0); g.add(dome);
    [-1,1].forEach(s=>{const eng=cy(.04,.08,'#1F0A3C',.8,.4); eng.rotation.z=Math.PI/2; eng.position.set(-.22,.16,s*.19); g.add(eng);});
  } else if (chassisId==='carrier-orbital') {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.26,.05,16,48),m3(co||'#5B21B6',.7,.3)); ring.rotation.x=Math.PI/2; ring.position.y=.2; g.add(ring);
    const hub=cy(.06,.04,co||'#4C1D95',.7,.3); hub.position.y=.2; g.add(hub);
    for(let i=0;i<4;i++){const a=i*Math.PI/2; const spoke=bx(.22,.01,.01,co||'#6D28D9',.6,.4); spoke.rotation.y=a; spoke.position.y=.2; g.add(spoke);}
    const glR=new THREE.Mesh(new THREE.TorusGeometry(.26,.008,8,48),m3('#c084fc',.1,.1,'#c084fc',1.2)); glR.rotation.x=Math.PI/2; glR.position.y=.2; g.add(glR);
    [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz])=>{const panel=bx(.1,.001,.05,'#1E3A8A',.3,.6); panel.position.set(dx*.38,.22,dz*.38); g.add(panel);});
  } else {
    // Fallback generic body
    const fb=bx(.4,.2,.3,co||'#374151',.6,.5); fb.position.y=.1; g.add(fb);
  }
  return g;
}

// ─── Part Meshes (full catalog) ───────────────────────────────────────────────
function createPartMesh(part, colorOverride) {
  // Resolve robot-specific part IDs → existing mesh IDs via PART_MESH_FALLBACK
  // so the if-chain below handles every new catalog part without extra code.
  const _resolvedId = PART_MESH_FALLBACK[part.id];
  if (_resolvedId) part = { ...part, id: _resolvedId };

  const g = new THREE.Group();
  const c = colorOverride || part.color || '#888888';
  if (part.id.startsWith('wheel-')) {
    // ── Professional Wheel Models ──
    let torR, torT, nS, rimC, tireRou, spokestyle, glowC;
    if (part.id==='wheel-monster'){
      torR=.19; torT=.092; nS=5; rimC='#2a1a0a'; tireRou=.95; spokestyle='thick'; glowC=null;
    } else if (part.id==='wheel-racing'){
      torR=.135; torT=.038; nS=9; rimC='#cc2200'; tireRou=.5; spokestyle='thin'; glowC='#ff4400';
    } else if (part.id==='wheel-micro'){
      torR=.065; torT=.022; nS=4; rimC='#888'; tireRou=.8; spokestyle='simple'; glowC=null;
    } else if (part.id==='wheel-magnetic'){
      torR=.13; torT=.048; nS=6; rimC='#1a2a88'; tireRou=.7; spokestyle='magnet'; glowC='#4488ff';
    } else if (part.id==='wheel-allterrain'){
      torR=.15; torT=.072; nS=5; rimC='#3d2b1f'; tireRou=.98; spokestyle='thick'; glowC=null;
    } else if (part.id==='wheel-hover'){
      torR=.12; torT=.035; nS=6; rimC='#0088aa'; tireRou=.2; spokestyle='thin'; glowC='#00d9ff';
    } else if (part.id==='wheel-metal'){
      torR=.14; torT=.06; nS=8; rimC='#888'; tireRou=.2; spokestyle='thick'; glowC=null;
    } else if (part.id==='wheel-spiky'){
      torR=.13; torT=.05; nS=5; rimC='#6b21d4'; tireRou=.7; spokestyle='thin'; glowC='#a855f7';
    } else if (part.id==='wheel-ball'){
      torR=.12; torT=.05; nS=6; rimC='#111'; tireRou=.6; spokestyle='thin'; glowC=null;
    } else {
      torR=.13; torT=.052; nS=6; rimC='#2a2a2a'; tireRou=.85; spokestyle='simple'; glowC=null;
    }

    const wC = c || '#0a0a0a';
    // ── Tire (outer rubber ring) ──
    const tireM = new THREE.MeshStandardMaterial({ color:new THREE.Color('#080808'), roughness:tireRou, metalness:.02 });
    const tire = new THREE.Mesh(new THREE.TorusGeometry(torR, torT, 20, 52), tireM);
    tire.rotation.y=Math.PI/2; tire.position.y=torR; g.add(tire);

    // Tread grooves — thin rings around the tire
    if (part.id!=='wheel-hover' && part.id!=='wheel-ball') {
      const treadM = new THREE.MeshStandardMaterial({ color:0x111111, roughness:1.0, metalness:0 });
      [-torT*.4, 0, torT*.4].forEach(off=>{
        const tread = new THREE.Mesh(new THREE.TorusGeometry(torR, torT*.12, 8, 52), treadM);
        tread.rotation.y=Math.PI/2+off; tread.position.y=torR; g.add(tread);
      });
    }

    // Spikes on spiky wheel
    if (part.id==='wheel-spiky') {
      for (let si=0; si<12; si++) {
        const sa = (si/12)*Math.PI*2;
        const spike = new THREE.Mesh(_CONE, m3('#9333ea',.8,.2,'#a855f7',.5));
        spike.scale.set(.012,.032,.012); spike.rotation.x=sa; spike.rotation.z=Math.PI;
        spike.position.set(0, torR+Math.sin(sa)*(torR+torT*.5), Math.cos(sa)*(torR+torT*.5)); g.add(spike);
      }
    }

    // ── Rim (inner wheel structure) ──
    const rimM = new THREE.MeshStandardMaterial({ color:new THREE.Color(rimC), metalness:.88, roughness:.18 });
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(torT*1.0, torT*1.0, torT*2.2, 16), rimM);
    rim.rotation.z=Math.PI/2; rim.position.y=torR; g.add(rim);

    // Rim lip rings
    [-1,1].forEach(s=>{
      const lip = new THREE.Mesh(new THREE.TorusGeometry(torR*.72, torT*.1, 8, 24), rimM);
      lip.rotation.y=Math.PI/2; lip.position.set(s*torT*.9, torR, 0); g.add(lip);
    });

    // ── Spokes ──
    const spokeM = new THREE.MeshStandardMaterial({ color:new THREE.Color(rimC), metalness:.9, roughness:.15 });
    for (let sp=0; sp<nS; sp++) {
      const a = (sp/nS)*Math.PI;
      const sw = spokestyle==='thick' ? torT*.28 : torT*.18;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(torT*2.2, torR*.85, sw), spokeM);
      spoke.rotation.x = a; spoke.rotation.z=Math.PI/2; spoke.position.y=torR; g.add(spoke);
    }

    // ── Hub cap ──
    const hubCapM = new THREE.MeshStandardMaterial({ color:new THREE.Color(rimC), metalness:.92, roughness:.1 });
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(torT*.82, torT*.82, torT*.35, 12), hubCapM);
    hubCap.rotation.z=Math.PI/2; hubCap.position.y=torR; g.add(hubCap);
    const hubCenter = new THREE.Mesh(new THREE.CylinderGeometry(torT*.2, torT*.2, torT*.38, 8), m3('#111',.95,.05));
    hubCenter.rotation.z=Math.PI/2; hubCenter.position.y=torR; g.add(hubCenter);
    // Lug bolts
    for (let lb=0; lb<(nS>6?6:5); lb++) {
      const la = (lb/(nS>6?6:5))*Math.PI*2;
      const lug = new THREE.Mesh(new THREE.CylinderGeometry(torT*.06,torT*.06,torT*.42,6), m3('#555',.9,.15));
      lug.rotation.z=Math.PI/2; lug.position.set(torT*.22, torR+Math.cos(la)*torT*.54, Math.sin(la)*torT*.54); g.add(lug);
    }

    // ── Glow ring for high-tech wheels ──
    if (glowC) {
      const glowM = new THREE.MeshStandardMaterial({ color:new THREE.Color(glowC), emissive:new THREE.Color(glowC), emissiveIntensity:2.2, roughness:0 });
      const glow = new THREE.Mesh(new THREE.TorusGeometry(torR*.72, torT*.07, 8, 32), glowM);
      glow.rotation.y=Math.PI/2; glow.position.y=torR; g.add(glow);
    }

    // Magnetic coils for magnetic wheel
    if (part.id==='wheel-magnetic') {
      for (let mc=0; mc<3; mc++) {
        const ma = (mc/3)*Math.PI*2;
        const coil = new THREE.Mesh(new THREE.TorusGeometry(torT*.35,.008,8,20), m3('#3366cc',.7,.3,'#4488ff',1.0));
        coil.rotation.y=Math.PI/2+ma; coil.position.set(torT*.7,torR,0); g.add(coil);
      }
    }

  } else if(part.id==='leg-spider'){
    // Thick mechanical spider leg — 3 armored segments + joints
    const bodyM2=m3(c,.85,.25); const darkM2=m3('#1a2535',.90,.20);
    const jointM=new THREE.MeshStandardMaterial({color:0x445566,metalness:.88,roughness:.22});
    // Hip housing (cylinder pointing outward)
    const hipH=new THREE.Mesh(new THREE.CylinderGeometry(.030,.036,.052,10),darkM2);
    hipH.rotation.z=Math.PI/2; hipH.position.set(.026,0,0); g.add(hipH);
    // Femur — wide armored box with accent strip
    const fem=new THREE.Mesh(new THREE.BoxGeometry(.14,.042,.038),bodyM2);
    fem.position.set(.13,0,0); fem.castShadow=true; g.add(fem);
    const stripM=new THREE.MeshStandardMaterial({color:new THREE.Color(c),emissive:new THREE.Color(c),emissiveIntensity:0.9,roughness:0});
    const fstrip=new THREE.Mesh(new THREE.BoxGeometry(.12,.004,.002),stripM);
    fstrip.position.set(.13,.022,0); g.add(fstrip);
    // Knee joint
    const kn=new THREE.Mesh(_SPH,jointM); kn.scale.setScalar(.034); kn.position.set(.21,-.003,0); g.add(kn);
    // Tibia — slightly thinner, angled down
    const tib=new THREE.Mesh(new THREE.BoxGeometry(.13,.030,.028),m3('#2d3a4a',.88,.28));
    tib.position.set(.31,-.020,0); tib.rotation.z=-.12; g.add(tib);
    // Foot tip
    const footM=new THREE.MeshStandardMaterial({color:0x778899,metalness:.82,roughness:.28});
    const foot=new THREE.Mesh(_SPH,footM); foot.scale.set(.020,.015,.020); foot.position.set(.385,-.046,0); g.add(foot);
  } else if(part.id==='leg-humanoid'){
    const th=cy(.044,.17,c,.5,.5); th.position.y=.09; g.add(th);
    const kn=new THREE.Mesh(_SPH,m3('#555',.6,.3)); kn.scale.set(.038,.038,.038); kn.position.y=-.04; g.add(kn);
    const sh=cy(.038,.15,'#ccd',.5,.5); sh.position.y=-.17; g.add(sh);
    const ft=bx(.065,.02,.11,'#888',.4,.6); ft.position.set(.01,-.26,.01); g.add(ft);
  } else if(part.id==='leg-stalker'){
    // Long sleek stalker leg — 3 segments, dramatic reach
    const jM=new THREE.MeshStandardMaterial({color:0x334455,metalness:.88,roughness:.22});
    const s1=new THREE.Mesh(new THREE.BoxGeometry(.18,.038,.034),m3(c,.85,.25)); s1.position.set(.09,.005,0); g.add(s1);
    const j1=new THREE.Mesh(_SPH,jM); j1.scale.setScalar(.032); j1.position.set(.19,.003,0); g.add(j1);
    const s2=new THREE.Mesh(new THREE.BoxGeometry(.16,.028,.026),m3('#2a3545',.88,.28)); s2.position.set(.32,-.022,0); s2.rotation.z=-.22; g.add(s2);
    const j2=new THREE.Mesh(_SPH,jM); j2.scale.setScalar(.026); j2.position.set(.42,-.052,0); g.add(j2);
    const s3=new THREE.Mesh(new THREE.BoxGeometry(.10,.020,.018),m3('#1a2535',.88,.32)); s3.position.set(.50,-.086,0); s3.rotation.z=.25; g.add(s3);
  } else if(part.id==='leg-stubby'){
    // Stocky stubby leg — thick cylinder, wide foot
    const stump=cy(.058,.10,c,.80,.35); stump.position.y=.052; stump.castShadow=true; g.add(stump);
    const ankle=new THREE.Mesh(_SPH,m3('#444',.85,.25)); ankle.scale.setScalar(.046); ankle.position.y=-.002; g.add(ankle);
    const ft=new THREE.Mesh(new THREE.BoxGeometry(.11,.018,.09),m3('#555',.6,.5)); ft.position.set(.02,-.018,.0); g.add(ft);
  } else if(part.id==='leg-claw'){
    // Armored leg ending in dual claw
    const jM2=new THREE.MeshStandardMaterial({color:0x334455,metalness:.88,roughness:.22});
    const hip=new THREE.Mesh(new THREE.BoxGeometry(.16,.038,.034),m3(c,.85,.25)); hip.position.set(.08,.004,0); hip.castShadow=true; g.add(hip);
    const kn=new THREE.Mesh(_SPH,jM2); kn.scale.setScalar(.032); kn.position.set(.17,.002,0); g.add(kn);
    const fore=new THREE.Mesh(new THREE.BoxGeometry(.14,.030,.028),m3('#1f2937',.88,.28)); fore.position.set(.295,-.018,0); fore.rotation.z=-.18; g.add(fore);
    const clawM=new THREE.MeshStandardMaterial({color:0xB91C1C,metalness:.9,roughness:.2,emissive:0x550000,emissiveIntensity:0.3});
    [.018,-.018].forEach(z=>{
      const cl=new THREE.Mesh(new THREE.BoxGeometry(.10,.018,.016),clawM);
      cl.position.set(.405,-.040,z); cl.rotation.z=z>0?.35:-.35; g.add(cl);
    });
  } else if(part.id==='arm-grabber'){
    const j1=new THREE.Mesh(_SPH,m3(c,.5,.4)); j1.scale.set(.04,.04,.04); j1.position.y=.04; g.add(j1);
    const s1=cy(.028,.15,c,.5,.5); s1.position.set(.07,.09,0); s1.rotation.z=-.5; g.add(s1);
    const j2=new THREE.Mesh(_SPH,m3('#888',.6,.3)); j2.scale.set(.032,.032,.032); j2.position.set(.14,.18,0); g.add(j2);
    const s2=bx(.036,.12,.036,'#888',.55,.5); s2.position.set(.18,.27,0); s2.rotation.z=-.25; g.add(s2);
    [-.02,.02].forEach(z=>{const f=bx(.016,.065,.011,'#555',.7,.4); f.position.set(.22,.35,z); g.add(f);});
  } else if(part.id==='arm-extend'){
    const base=cy(.04,.04,c,.6,.4); base.position.y=.04; g.add(base);
    [.08,.16,.22].forEach((y,i)=>{const seg=cy(.036-.007*i,.06,i%2?'#888':c,.6,.4); seg.position.y=y; g.add(seg);});
    [-.018,.018].forEach(z=>{const f=bx(.012,.07,.01,'#555',.7,.4); f.position.set(0,.31,z); g.add(f);});
  } else if(part.id==='tool-drill'){
    const body=cy(.04,.09,c,.65,.4); body.position.y=.06; g.add(body);
    const bit=new THREE.Mesh(_CONE,m3('#888',.85,.15)); bit.scale.set(.022,.1,.022); bit.position.y=.16; g.add(bit);
  } else if(part.id==='tool-laser'){
    const barrel=cy(.025,.13,c,.7,.3); barrel.position.y=.07; g.add(barrel);
    const emitter=new THREE.Mesh(_SPH,m3('#FF00FF',.1,.1,'#FF00FF',2.5)); emitter.scale.set(.018,.018,.018); emitter.position.y=.145; g.add(emitter);
  } else if(part.id==='tool-magnet'){
    const body=new THREE.Mesh(new THREE.TorusGeometry(.052,.016,8,24),m3('#818CF8',.7,.3)); body.rotation.x=Math.PI/2; body.position.y=.07; g.add(body);
    const core=cy(.02,.07,c,.65,.4); core.position.y=.06; g.add(core);
  } else if(part.id==='tool-cannon'){
    const barrel=cy(.045,.18,c,.65,.4); barrel.position.y=.1; g.add(barrel);
    const mouth=new THREE.Mesh(new THREE.TorusGeometry(.045,.01,8,24),m3('#555',.7,.3)); mouth.rotation.x=Math.PI/2; mouth.position.y=.2; g.add(mouth);
  } else if(part.id==='prop-small'){
    const hub=cy(.018,.025,'#333',.75,.35); hub.position.y=.015; g.add(hub);
    const pM=new THREE.MeshStandardMaterial({color:0xcccccc,transparent:true,opacity:.55,roughness:.3});
    const pp=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.003,20),pM); pp.position.y=.028;
    pp.userData.spinProp = true;  // animate() will spin this
    g.add(pp);
  } else if(part.id==='prop-large'){
    const hub=cy(.025,.03,'#222',.75,.35); hub.position.y=.02; g.add(hub);
    const pM=new THREE.MeshStandardMaterial({color:0xaaaaaa,transparent:true,opacity:.5,roughness:.3});
    const pp=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.003,24),pM); pp.position.y=.035;
    pp.userData.spinProp = true;
    g.add(pp);
  } else if(part.id==='thrust-ion'){
    const nozzle=new THREE.Mesh(_CONE,m3(c,.7,.3)); nozzle.scale.set(.05,.08,.05); nozzle.rotation.x=Math.PI; nozzle.position.y=.04; g.add(nozzle);
    const chamber=cy(.04,.1,c,.65,.35); chamber.position.y=.12; g.add(chamber);
    const gl=new THREE.Mesh(_SPH,m3('#67E8F9',.1,.1,'#67E8F9',2.0)); gl.scale.set(.025,.025,.025); gl.position.y=.01; g.add(gl);
  } else if(part.id==='thrust-rocket'){
    const nozzle=new THREE.Mesh(_CONE,m3('#555',.8,.3)); nozzle.scale.set(.06,.07,.06); nozzle.rotation.x=Math.PI; nozzle.position.y=.02; g.add(nozzle);
    const tank=cy(.05,.14,c,.6,.4); tank.position.y=.12; g.add(tank);
    const gl=new THREE.Mesh(_SPH,m3('#EF4444',.1,.1,'#ff6600',2.5)); gl.scale.set(.03,.03,.03); gl.position.y=-.01; g.add(gl);
  } else if(part.id==='prop-fin'){
    const fin=bx(.12,.004,.18,c,.5,.5); fin.position.y=.04; fin.rotation.z=-.15; g.add(fin);
    const strut=bx(.016,.07,.016,'#555',.6,.4); strut.position.y=.04; g.add(strut);
  } else if(part.id==='sensor-cam'){
    // ── Professional HD Camera ──
    // Body housing (machined aluminium look)
    const body=bx(.07,.06,.06,c,.88,.2); body.position.y=.04; g.add(body);
    // Front face plate
    const face=bx(.002,.054,.054,'#111',.95,.1); face.position.set(.036,.04,0); g.add(face);
    // Lens barrel
    const barrelM = m3('#1a1a1a',.9,.1);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.018,.02,.018,16),barrelM);
    barrel.rotation.z=Math.PI/2; barrel.position.set(.046,.04,0); g.add(barrel);
    // Lens glass (deep blue with slight glow)
    const lensM = new THREE.MeshStandardMaterial({color:0x003399,emissive:0x001166,emissiveIntensity:0.8,roughness:.02,metalness:.1,transparent:true,opacity:.92});
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.004,16),lensM);
    lens.rotation.z=Math.PI/2; lens.position.set(.056,.04,0); g.add(lens);
    // Lens ring chrome
    const lringM = m3('#ccc',.95,.05);
    const lring = new THREE.Mesh(new THREE.TorusGeometry(.018,.003,8,20),lringM);
    lring.rotation.y=Math.PI/2; lring.position.set(.055,.04,0); g.add(lring);
    // Status LED
    const statM = new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff2200,emissiveIntensity:3.0});
    const stat = new THREE.Mesh(_SPH,statM); stat.scale.setScalar(.006); stat.position.set(-.034,.065,-.024); g.add(stat);
  } else if(part.id==='sensor-lidar'){
    // ── LiDAR Scanner (spinning dome style) ──
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.048,.052,.03,10),m3(c,.85,.25));
    base.position.y=.018; g.add(base);
    const scanner = new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.028,10),m3('#cc1111',.8,.3));
    scanner.position.y=.053; g.add(scanner);
    // Dome window (transparent strip)
    const winM = new THREE.MeshStandardMaterial({color:0xff3333,emissive:0xff3333,emissiveIntensity:2.5,transparent:true,opacity:.7,roughness:0});
    const win = new THREE.Mesh(new THREE.CylinderGeometry(.043,.043,.008,10),winM);
    win.position.y=.053; g.add(win);
    // Top lens cluster
    const tlM = new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff4400,emissiveIntensity:3.0,roughness:0});
    const tl = new THREE.Mesh(_SPH,tlM); tl.scale.setScalar(.014); tl.position.y=.082; g.add(tl);
    // Base accent ring
    const bringM = new THREE.MeshStandardMaterial({color:0xff3333,emissive:0xff3333,emissiveIntensity:1.2,roughness:0});
    const bring = new THREE.Mesh(new THREE.TorusGeometry(.048,.004,8,32),bringM);
    bring.rotation.x=Math.PI/2; bring.position.y=.034; g.add(bring);
  } else if(part.id==='sensor-thermal'){
    // ── Thermal Camera ──
    const body=bx(.072,.06,.06,c,.85,.22); body.position.y=.04; g.add(body);
    // Orange-tinted thermal lens
    const lensM = new THREE.MeshStandardMaterial({color:0xdd5500,emissive:0xff3300,emissiveIntensity:1.2,roughness:.05,transparent:true,opacity:.85});
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.004,16),lensM);
    lens.rotation.z=Math.PI/2; lens.position.set(.038,.04,0); g.add(lens);
    // Thermal grid (heat diffuser)
    [-1,1].forEach(s=>{ const rib=bx(.001,.04,.01,'#333',.8,.4); rib.position.set(-.02,.04,s*.015); g.add(rib); });
  } else if(part.id==='sensor-gyro'){
    // ── Gyroscope (3-axis gimbal) ──
    const outerRingM = m3(c,.78,.22);
    const outer=new THREE.Mesh(new THREE.TorusGeometry(.058,.01,12,36),outerRingM);
    outer.rotation.x=Math.PI/2; outer.position.y=.065; g.add(outer);
    const mid=new THREE.Mesh(new THREE.TorusGeometry(.042,.009,10,32),m3('#4466aa',.8,.2));
    mid.rotation.z=Math.PI/2; mid.position.y=.065; g.add(mid);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(.028,.008,10,28),m3('#888',.85,.15));
    inner.rotation.x=Math.PI/4; inner.position.y=.065; g.add(inner);
    const ballM = new THREE.MeshStandardMaterial({color:0xaabbff,emissive:0x4466ff,emissiveIntensity:1.5,metalness:.8,roughness:.1});
    const ball=new THREE.Mesh(_SPH,ballM); ball.scale.setScalar(.018); ball.position.y=.065; g.add(ball);
  } else if(part.id==='sensor-ultra'||part.id==='sensor-sonar'){
    // ── Ultrasonic / Sonar Sensor ──
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.048,.048,.022,16),m3(c,.82,.25));
    disc.position.y=.015; g.add(disc);
    // Dual emitter circles
    const glC = part.id==='sensor-sonar'?'#00ffff':'#00D9FF';
    [-1,1].forEach(s=>{
      const ringM = new THREE.MeshStandardMaterial({color:new THREE.Color(glC),emissive:new THREE.Color(glC),emissiveIntensity:2.0,roughness:0});
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.003,12),ringM);
      ring.position.set(0,.028,s*.018); g.add(ring);
    });
    // Sonar rings (interference pattern)
    const sonarM = new THREE.MeshStandardMaterial({color:new THREE.Color(glC),emissive:new THREE.Color(glC),emissiveIntensity:1.2,roughness:0,transparent:true,opacity:.6});
    const sonar = new THREE.Mesh(new THREE.TorusGeometry(.04,.003,8,32),sonarM);
    sonar.rotation.x=Math.PI/2; sonar.position.y=.032; g.add(sonar);
  } else if(part.id.startsWith('bat-')||part.id==='fusion'||part.id.includes('solar')||part.id.includes('fuel')||part.id.includes('wind')||part.id.includes('nuclear')||part.id.includes('hydrogen')||part.id.includes('capacitor')||part.id.includes('triple')){
    // ── Professional Battery / Power System ──
    const bH = part.id==='bat-small'?.062 : part.id==='bat-medium'?.1 : part.id==='bat-large'?.14 : part.id==='bat-xl'?.18 : .09;
    const bW = part.id==='bat-small'?.09  : part.id==='bat-medium'?.12 : part.id==='bat-large'?.15 : .1;
    const bD = bW * .82;
    const isFusion = part.id==='fusion'||part.id.includes('nuclear')||part.id.includes('quantum');
    const glowColor = isFusion?'#FDE68A' : part.id.includes('solar')?'#60a5fa' : part.id.includes('hydrogen')?'#34d399' : part.id.includes('wind')?'#93c5fd' : null;

    // Main body
    const box=bx(bW,bH,bD,c,.82,.3); box.position.y=bH/2; g.add(box);
    // Terminal ends (darker caps)
    const cap=bx(bW*.98,.012,bD*.98,'#111',.9,.2); cap.position.y=bH+.007; g.add(cap);
    // Charge indicator strip (LED bar)
    const barM = new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00ff88,emissiveIntensity:2.5,roughness:0});
    const bar=new THREE.Mesh(new THREE.BoxGeometry(bW*.12,.008,bD*.8),barM);
    bar.position.set(bW*.38,bH*.55,0); g.add(bar);
    // Warning stripes
    [-1,1].forEach(s=>{
      const stripe=bx(.003,bH*.5,bD*.12,'#fbbf24',.5,.5); stripe.position.set(s*bW*.38,bH*.35,0); g.add(stripe);
    });
    // Glow core for fusion/nuclear
    if (glowColor) {
      const gM = new THREE.MeshStandardMaterial({color:new THREE.Color(glowColor),emissive:new THREE.Color(glowColor),emissiveIntensity:3.0,roughness:0});
      const gl = new THREE.Mesh(_SPH,gM); gl.scale.setScalar(.022); gl.position.y=bH+.018; g.add(gl);
    }
  } else if(part.id==='solar'||part.id.includes('solar')){
    // ── Solar Panel ──
    const framM = m3(c,.85,.25);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(.22,.005,.14),framM); panel.position.y=.04; g.add(panel);
    // Solar cells (6x4 grid)
    for(let x=-2;x<=2;x++) for(let z=-1;z<=1;z++){
      const cellM = new THREE.MeshStandardMaterial({color:0x1a3a8a,roughness:.4,metalness:.3});
      const cell=new THREE.Mesh(_BOX,cellM); cell.scale.set(.036,.002,.032); cell.position.set(x*.04,.044,z*.04); g.add(cell);
    }
    // Frame rails
    [-1,1].forEach(s=>{
      const rail=bx(.22,.012,.006,'#444',.85,.25); rail.position.set(0,.04,s*.072); g.add(rail);
    });
    // Power output connector
    const conn=cy(.008,.025,'#cc9900',.9,.1); conn.position.set(-.1,.065,0); g.add(conn);
  } else if(part.id.startsWith('ai-')){
    // ── Professional AI Brain / CPU ──
    const glC = part.id==='ai-super'||part.id==='ai-quantum'?'#a855f7' : part.id==='ai-neural'||part.id==='ai-ml'?'#4F46E5' : part.id==='ai-smart'?'#F59E0B' : part.id==='ai-personality'?'#f97316' : '#00d9ff';
    const intensity = part.id.includes('quantum')||part.id.includes('super') ? 3.0 : 2.0;
    // PCB substrate (green/dark board)
    const boardC = part.id.includes('quantum')?'#1a0a2e':part.id.includes('neural')?'#0a0a1e':'#0f1a0a';
    const board=new THREE.Mesh(new THREE.BoxGeometry(.11,.016,.11),m3(boardC,.3,.7)); board.position.y=.01; g.add(board);
    // Main processor die
    const chipM = new THREE.MeshStandardMaterial({color:0x111111,metalness:.8,roughness:.2});
    const chipSz = part.id.includes('quad')||part.id.includes('octa')||part.id.includes('super') ? .065 : .042;
    const chip=new THREE.Mesh(new THREE.BoxGeometry(chipSz,.018,chipSz),chipM); chip.position.y=.021; g.add(chip);
    // CPU die marking (emissive)
    const dieM = new THREE.MeshStandardMaterial({color:new THREE.Color(glC),emissive:new THREE.Color(glC),emissiveIntensity:intensity});
    const die=new THREE.Mesh(new THREE.BoxGeometry(chipSz*.7,.001,chipSz*.7),dieM); die.position.y=.031; g.add(die);
    // Heat fins (for high-power chips)
    if (part.id.includes('super')||part.id.includes('quantum')||part.id.includes('octa')) {
      for(let f=-2;f<=2;f++){
        const fin=new THREE.Mesh(new THREE.BoxGeometry(.002,.022,.1),m3('#333',.9,.2));
        fin.position.set(f*.012,.024,0); g.add(fin);
      }
    }
    // RAM modules
    [-1,1].forEach(s=>{
      const ram=new THREE.Mesh(new THREE.BoxGeometry(.008,.018,.04),m3('#1a1a3a',.6,.4));
      ram.position.set(s*.044,.021,0); g.add(ram);
      // RAM status indicator
      const rLed=new THREE.Mesh(_SPH,dieM); rLed.scale.setScalar(.005); rLed.position.set(s*.044,.033,.015); g.add(rLed);
    });
    // Capacitors (cylindrical bumps)
    [[.04,.04],[-.04,.04],[.04,-.04]].forEach(([cx,cz])=>{
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.014,8),m3('#222',.6,.4));
      cap.position.set(cx,.021,cz); g.add(cap);
    });
  } else if(part.id==='comm-wifi'||part.id==='comm-bluetooth'){
    // ── WiFi / Bluetooth Module ──
    const base=new THREE.Mesh(new THREE.BoxGeometry(.055,.016,.055),m3(c,.82,.3)); base.position.y=.01; g.add(base);
    // Antenna
    const ant=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.095,8),m3(c,.85,.2)); ant.position.set(.018,.075,0); g.add(ant);
    const tip=new THREE.Mesh(_SPH,m3(c,.9,.1)); tip.scale.setScalar(.007); tip.position.set(.018,.124,0); g.add(tip);
    // Wireless signal arc (emissive)
    const sigC = part.id==='comm-wifi'?'#22cc77':'#3b82f6';
    const sigM = new THREE.MeshStandardMaterial({color:new THREE.Color(sigC),emissive:new THREE.Color(sigC),emissiveIntensity:2.0,roughness:0});
    [.022,.034].forEach(r=>{
      const arc=new THREE.Mesh(new THREE.TorusGeometry(r,.003,6,16,Math.PI*.7),sigM);
      arc.rotation.z=-Math.PI*.35; arc.position.set(.038,.085,0); g.add(arc);
    });
  } else if(part.id==='comm-radio'){
    const base=new THREE.Mesh(new THREE.BoxGeometry(.065,.022,.065),m3(c,.8,.3)); base.position.y=.013; g.add(base);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.14,8),m3('#666',.7,.35)); mast.position.y=.085; g.add(mast);
    const cross=new THREE.Mesh(new THREE.BoxGeometry(.09,.004,.004),m3('#555',.7,.4)); cross.position.y=.152; g.add(cross);
    // Signal indicator LED
    const sigM = new THREE.MeshStandardMaterial({color:0xffaa00,emissive:0xffaa00,emissiveIntensity:2.5,roughness:0});
    const sig=new THREE.Mesh(_SPH,sigM); sig.scale.setScalar(.007); sig.position.set(-.025,.024,.025); g.add(sig);
  } else if(part.id==='comm-sat'){
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.07,8),m3('#555',.7,.4)); mast.position.y=.035; g.add(mast);
    // Dish (partial sphere)
    const dish=new THREE.Mesh(new THREE.SphereGeometry(.07,18,8,0,Math.PI*2,0,Math.PI/2.2),m3(c,.7,.35));
    dish.position.y=.075; dish.rotation.x=-.85; g.add(dish);
    // Dish surface detail lines
    const dishEdgeM = m3('#888',.85,.2);
    [0, Math.PI/2, Math.PI, Math.PI*3/2].forEach(ra=>{
      const srib=new THREE.Mesh(new THREE.BoxGeometry(.001,.001,.068),dishEdgeM);
      srib.rotation.y=ra; srib.position.y=.08; g.add(srib);
    });
    // Feed horn
    const feed=new THREE.Mesh(new THREE.ConeGeometry(.014,.024,8),m3('#aaa',.9,.1));
    feed.position.y=.1; g.add(feed);
  } else if(part.id==='struct-armor'||part.id.startsWith('armor-')){
    // ── Premium Armor Plates ──
    const isHeavy = part.id==='armor-heavy';
    const isForce = part.id==='armor-force';
    const isSpike = part.id==='armor-spike';
    const isReflect = part.id==='armor-reflect';
    const h = isHeavy?.055 : .035;
    const sz = isHeavy?.22 : .18;
    const met = isReflect?.98 : isHeavy?.88 : .78;
    const rou = isReflect?.02 : isHeavy?.2 : .38;
    if (isForce) {
      // Force field dome (translucent energy)
      const fM = new THREE.MeshStandardMaterial({color:0x00aaff,emissive:0x0044ff,emissiveIntensity:1.5,transparent:true,opacity:.3,roughness:0,metalness:.1});
      const dome=new THREE.Mesh(_SPH,fM); dome.scale.set(.18,.12,.18); dome.position.y=.08; g.add(dome);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.006,10,40),m3('#00aaff',.1,.1,'#00aaff',2.5));
      ring.rotation.x=Math.PI/2; ring.position.y=.06; g.add(ring);
    } else {
      const plate=new THREE.Mesh(new THREE.BoxGeometry(sz,h,sz),m3(c,met,rou)); plate.position.y=h/2; g.add(plate);
      // Rivet/bolt details
      for(let x=-1;x<=1;x++) for(let z=-1;z<=1;z++){
        const rv=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.02,8),m3('#444',.9,.1));
        rv.position.set(x*(sz*.38),h+.004,z*(sz*.38)); g.add(rv);
      }
      if (isSpike) {
        // Outward spikes
        for(let si=0;si<6;si++){
          const sa=(si/6)*Math.PI*2;
          const spk=new THREE.Mesh(_CONE,m3('#cc2222',.85,.15));
          spk.scale.set(.012,.035,.012); spk.position.set(Math.cos(sa)*sz*.35,h+.02,Math.sin(sa)*sz*.35); g.add(spk);
        }
      }
      if (isReflect) {
        // Mirror trim ring
        const rimM = new THREE.MeshStandardMaterial({color:0xffffff,metalness:.99,roughness:.01});
        const rim=new THREE.Mesh(new THREE.TorusGeometry(sz*.5*.82,.005,8,32),rimM);
        rim.rotation.x=Math.PI/2; rim.position.y=h*.9; g.add(rim);
      }
    }
  } else if(part.id==='struct-light'){
    const frame=bx(.18,.008,.18,c,.6,.4); frame.position.y=.004; g.add(frame);
    [-.08,.08].forEach(x=>[-.08,.08].forEach(z=>{const post=cy(.01,.08,'#555',.6,.4); post.position.set(x,.04,z); g.add(post);}));
  } else if(part.id==='struct-shield'){
    const dome=new THREE.Mesh(_SPH,m3('#06B6D4',.3,.3,'#06B6D4',.8)); dome.scale.set(.14,.09,.14); dome.position.y=.05; g.add(dome);
  } else if(part.id==='deco-led'||part.id==='light-led'){
    // ── LED Light Strip ──
    const strip=new THREE.Mesh(new THREE.BoxGeometry(.12,.012,.028),m3('#1a1a1a',.85,.25));
    strip.position.y=.01; g.add(strip);
    const ledColor = c || '#FCD34D';
    const ledM = new THREE.MeshStandardMaterial({color:new THREE.Color(ledColor),emissive:new THREE.Color(ledColor),emissiveIntensity:3.5,roughness:0});
    // Individual LED dots
    [-2,-1,0,1,2].forEach(i=>{
      const led=new THREE.Mesh(new THREE.BoxGeometry(.012,.006,.012),ledM);
      led.position.set(i*.022,.018,0); g.add(led);
    });
    // Diffuse glow overlay
    const glowM = new THREE.MeshStandardMaterial({color:new THREE.Color(ledColor),emissive:new THREE.Color(ledColor),emissiveIntensity:1.5,transparent:true,opacity:.4,roughness:0});
    const glow=new THREE.Mesh(new THREE.BoxGeometry(.13,.01,.03),glowM); glow.position.y=.022; g.add(glow);
  } else if(part.id==='deco-neon'||part.id==='light-spot'){
    // ── Neon Light Tube ──
    const housingM = m3('#2a2a2a',.8,.3);
    const housing=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.1,10),housingM);
    housing.position.y=.05; g.add(housing);
    const neonC = c || '#ff00ff';
    const neonM = new THREE.MeshStandardMaterial({color:new THREE.Color(neonC),emissive:new THREE.Color(neonC),emissiveIntensity:4.0,roughness:0,transparent:true,opacity:.9});
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.098,10),neonM);
    tube.position.y=.05; g.add(tube);
    const neonGlowM = new THREE.MeshStandardMaterial({color:new THREE.Color(neonC),emissive:new THREE.Color(neonC),emissiveIntensity:1.8,transparent:true,opacity:.25,roughness:0});
    const glowTube=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.1,10),neonGlowM);
    glowTube.position.y=.05; g.add(glowTube);
    // End caps
    [-1,1].forEach(s=>{
      const cap=new THREE.Mesh(new THREE.SphereGeometry(.014,12,8),new THREE.MeshStandardMaterial({color:new THREE.Color(neonC),emissive:new THREE.Color(neonC),emissiveIntensity:3.0}));
      cap.position.y=.05+s*.05; g.add(cap);
    });
  } else if(part.id==='deco-wings'){
    // ── Wing Pair ──
    [-1,1].forEach(s=>{
      // Main wing surface
      const wing=new THREE.Mesh(new THREE.BoxGeometry(.005,.055,.16),m3(c,.82,.25));
      wing.position.set(0,.06,s*.09); wing.rotation.y=s*-.15; g.add(wing);
      // Wing leading edge
      const edge=new THREE.Mesh(new THREE.CylinderGeometry(.006,.004,.16,8),m3('#888',.9,.1));
      edge.rotation.x=Math.PI/2; edge.position.set(.006,.06,s*.09); g.add(edge);
      // Wing accent stripe
      const stripeM = new THREE.MeshStandardMaterial({color:new THREE.Color(c||'#4488ff'),emissive:new THREE.Color(c||'#4488ff'),emissiveIntensity:1.5,roughness:0});
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(.002,.002,.14),stripeM);
      stripe.position.set(0,.085,s*.09); g.add(stripe);
    });
  } else if(part.id==='deco-spoiler'){
    // ── Racing Spoiler ──
    // Main blade
    const blade=new THREE.Mesh(new THREE.BoxGeometry(.005,.04,.2),m3(c,.82,.2)); blade.position.y=.09; g.add(blade);
    // Support struts
    [-1,1].forEach(s=>{
      const strut=new THREE.Mesh(new THREE.BoxGeometry(.004,.065,.004),m3('#444',.85,.2));
      strut.position.set(0,.065,s*.08); g.add(strut);
    });
    // Blade accent
    const accentM = new THREE.MeshStandardMaterial({color:new THREE.Color(c||'#ff2200'),emissive:new THREE.Color(c||'#ff2200'),emissiveIntensity:1.2,roughness:0});
    const accent=new THREE.Mesh(new THREE.BoxGeometry(.002,.005,.2),accentM); accent.position.y=.112; g.add(accent);
  } else if(part.id==='deco-holo'){
    // ── Hologram Projector ──
    const projM = m3(c,.85,.2);
    const proj=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.04,10),projM); proj.position.y=.025; g.add(proj);
    // Emitter lens
    const emitM = new THREE.MeshStandardMaterial({color:0x00ffff,emissive:0x00ffff,emissiveIntensity:3.0,roughness:0,transparent:true,opacity:.8});
    const emit=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.006,12),emitM); emit.position.y=.048; g.add(emit);
    // Hologram beam (translucent cone)
    const beamM = new THREE.MeshStandardMaterial({color:0x00ccff,emissive:0x00ccff,emissiveIntensity:1.0,transparent:true,opacity:.15,roughness:0});
    const beam=new THREE.Mesh(new THREE.ConeGeometry(.055,.1,12),beamM); beam.position.y=.1; g.add(beam);
  } else if(part.id==='deco-chrome'){
    // ── Chrome Trim ──
    const trimM = new THREE.MeshStandardMaterial({color:0xccddee,metalness:.98,roughness:.02});
    const main=new THREE.Mesh(new THREE.BoxGeometry(.14,.01,.14),trimM); main.position.y=.008; g.add(main);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.068,.006,8,36),trimM);
    ring.rotation.x=Math.PI/2; ring.position.y=.014; g.add(ring);
  } else if(part.id==='deco-flame'||part.id==='deco-smoke'||part.id==='deco-exhaust'){
    // ── Exhaust Pipes ──
    const pipeM = m3(c,.85,.2);
    [-1,1].forEach(s=>{
      const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.1,10),pipeM);
      pipe.position.set(0,.05,s*.028); g.add(pipe);
      const tipM = new THREE.MeshStandardMaterial({
        color: part.id==='deco-flame'?0xff4400:0x888888,
        emissive: part.id==='deco-flame'?0xff2200:0x444444,
        emissiveIntensity: part.id==='deco-flame'?2.5:0.3,
        roughness:0
      });
      const tip=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.012,10),tipM);
      tip.position.set(0,.104,s*.028); g.add(tip);
    });
  } else if(part.id==='deco-propeller'){
    // ── Decorative Spinner ──
    const hubM = m3('#2a2a2a',.85,.25);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.022,10),hubM); hub.position.y=.018; g.add(hub);
    const propM = new THREE.MeshStandardMaterial({color:new THREE.Color(c||'#3b82f6'),emissive:new THREE.Color(c||'#3b82f6'),emissiveIntensity:0.8,roughness:.3,metalness:.5,transparent:true,opacity:.75});
    const prop=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.004,24),propM); prop.position.y=.032; g.add(prop);
  } else {
    // ── Generic fallback (no part.id matched) — simple colored block ──
    const fb=new THREE.Mesh(new THREE.BoxGeometry(.1,.08,.1),m3(c,.7,.4)); fb.position.y=.04; g.add(fb);
    // Status light
    const stM = new THREE.MeshStandardMaterial({color:new THREE.Color(c||'#7c3aed'),emissive:new THREE.Color(c||'#7c3aed'),emissiveIntensity:2.0,roughness:0});
    const st=new THREE.Mesh(_SPH,stM); st.scale.setScalar(.01); st.position.y=.084; g.add(st);
  }
  return g;
}

// ─── WorkshopViewport (professional, drag-to-reposition) ─────────────────────
function WorkshopViewport({ chassisId, chassisScale, chassisColorOverride, accentColorOverride, trimColorOverride, glowColorOverride, placedParts, partColors,
                            selectedUid, onPartClick, onPartMove, cameraReset, metalness, roughness,
                            newPartUidRef: newPartUidProp }) {
  const canvasRef      = useRef(null);
  const sceneRef       = useRef(null);
  const rendererRef    = useRef(null);
  const composerRef    = useRef(null);
  const camRef         = useRef(null);
  const frameRef       = useRef(null);
  const chassisMeshRef = useRef(null);
  const partMeshesRef  = useRef({});
  const orb = useRef({ theta:0.6, phi:1.28, r:1.7, drag:false, spin:true, dX:0, dY:0 });
  const dragRef = useRef({ active:false, uid:null, plane:new THREE.Plane(new THREE.Vector3(0,1,0), 0) });
  const placedPartsRef  = useRef([]);
  const snapActiveRef   = useRef(false);
  const snapPosRef      = useRef(null);
  const snapIndicatorRef= useRef(null);
  const _localNewPartRef= useRef(null);   // fallback (unused when parent provides the ref)
  // newPartUidRef comes from parent so handleAddPart can write to it before setPlacedParts
  const newPartUidRef   = newPartUidProp || _localNewPartRef;
  const snapInRef       = useRef({});     // uid → { t: 0..1 } spring progress
  const platformRing1Ref= useRef(null);   // outer glow ring — pulsed in animate
  const clockRef        = useRef(0);      // frame counter for idle animations

  // Scene init
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const W = canvas.clientWidth || 700, H = canvas.clientHeight || 480;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3d4f72);  // Bright workshop blue-slate
    scene.fog = new THREE.Fog(0x3d4f72, 12, 40);  // Light linear fog, distant
    sceneRef.current = scene;

    // ── Environment Map — real PBR reflections ──
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envMap = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
      scene.environment = envMap;
      pmrem.dispose();
    } catch(e) { /* graceful fallback if RoomEnvironment unavailable */ }

    const cam = new THREE.PerspectiveCamera(46, W/H, 0.05, 60);
    camRef.current = cam;

    // ── Bloom post-processing ──
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, cam));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), 0.22, 0.38, 0.78);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // ── Bright Studio Lighting ──
    scene.add(new THREE.AmbientLight(0xd0ddf0, 1.8));   // Bright cool-white ambient
    const sun = new THREE.DirectionalLight(0xfff8f0, 2.6);  // Warm key from upper-right
    sun.position.set(3, 5, 3); sun.castShadow = true;
    sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.near=0.1; sun.shadow.camera.far=20;
    sun.shadow.camera.left=-3; sun.shadow.camera.right=3;
    sun.shadow.camera.top=3; sun.shadow.camera.bottom=-3;
    sun.shadow.bias = -0.001;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xaabbff, 1.0); // Blue fill from left
    fill.position.set(-3, 3, -2); scene.add(fill);
    const fill2 = new THREE.DirectionalLight(0xffffff, 0.8); // Front fill
    fill2.position.set(0, 2, 4); scene.add(fill2);
    const rim1 = new THREE.PointLight(0x00d9ff, 1.4, 10);   // Cyan accent left
    rim1.position.set(-2, 1.2, 0.5); scene.add(rim1);
    const rim2 = new THREE.PointLight(0xff6bcd, 1.0, 10);   // Pink accent right
    rim2.position.set(2, 1.2, 0.5); scene.add(rim2);
    const under = new THREE.PointLight(0x4488ff, 0.5, 4);   // Platform underlight
    under.position.set(0, -0.3, 0); scene.add(under);

    // ── Workshop Display Platform (robot-scale, not huge) ──
    // Main polished base — smaller radius to match robots (0.45, not 0.72)
    const platGeo = new THREE.CylinderGeometry(0.45, 0.46, 0.04, 48);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d18, metalness: 0.98, roughness: 0.08,
    });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.y = -0.02; plat.receiveShadow = true; scene.add(plat);

    // Outer bevel ring
    const bevelG = new THREE.TorusGeometry(0.455, 0.014, 10, 64);
    const bevelM = new THREE.MeshStandardMaterial({ color:0x3355aa, metalness:0.95, roughness:0.18 });
    const bevel = new THREE.Mesh(bevelG, bevelM);
    bevel.rotation.x = Math.PI/2; bevel.position.y = 0.0; scene.add(bevel);

    // Outer glow ring (cyan) — subtle, won't blow out with bloom
    const ring1G = new THREE.TorusGeometry(0.43, 0.006, 10, 64);
    const ring1M = new THREE.MeshStandardMaterial({ color:0x00d9ff, emissive:0x00d9ff, emissiveIntensity:0.7 });
    const ring1 = new THREE.Mesh(ring1G, ring1M);
    ring1.rotation.x = Math.PI/2; ring1.position.y = 0.001; scene.add(ring1);
    platformRing1Ref.current = ring1M;  // save for animate loop pulse

    // Inner accent ring (purple)
    const ring2G = new THREE.TorusGeometry(0.18, 0.004, 10, 48);
    const ring2M = new THREE.MeshStandardMaterial({ color:0x7c3aed, emissive:0x7c3aed, emissiveIntensity:0.6 });
    const ring2 = new THREE.Mesh(ring2G, ring2M);
    ring2.rotation.x = Math.PI/2; ring2.position.y = 0.001; scene.add(ring2);

    // Radial spoke lines — very dim, just visible guides
    for (let i=0; i<8; i++) {
      const a = (i/8)*Math.PI*2;
      const spokeM = new THREE.MeshStandardMaterial({ color:0x00d9ff, emissive:0x00d9ff, emissiveIntensity: i%2===0 ? 0.3 : 0.1 });
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.001, 0.38), spokeM);
      spoke.rotation.y = a; spoke.position.y = 0.001; scene.add(spoke);
    }

    // Corner markers — dimmed
    [[0.32,0],[0,-0.32],[-0.32,0],[0,0.32]].forEach(([x,z]) => {
      const markerM = new THREE.MeshStandardMaterial({ color:0xff6bcd, emissive:0xff6bcd, emissiveIntensity:0.5 });
      const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.009,0.012,8), markerM);
      marker.position.set(x, 0.001, z); scene.add(marker);
    });
    // Snap indicator — shown while dragging near another part
    const snapRingG = new THREE.TorusGeometry(0.16, 0.014, 8, 32);
    const snapRingM = new THREE.MeshBasicMaterial({ color:0x00ff88 });
    const snapInd = new THREE.Mesh(snapRingG, snapRingM);
    snapInd.rotation.x = Math.PI/2; snapInd.visible = false; scene.add(snapInd);
    snapIndicatorRef.current = snapInd;
    // Animate
    const o = orb.current;
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      clockRef.current += 0.016;  // ~60fps clock
      if (!o.drag && !dragRef.current.active && o.spin) o.theta += 0.003;
      cam.position.set(o.r*Math.sin(o.phi)*Math.sin(o.theta), o.r*Math.cos(o.phi), o.r*Math.sin(o.phi)*Math.cos(o.theta));
      cam.lookAt(0, 0.10, 0);  // Center on robot body (sits at Y≈0.05–0.15)
      // ── Idle platform pulse ──
      const t = clockRef.current;
      if (platformRing1Ref.current) {
        platformRing1Ref.current.emissiveIntensity = 0.55 + Math.sin(t * 1.8) * 0.20;
      }
      // ── Spin propulsion parts ──
      Object.entries(partMeshesRef.current).forEach(([uid, mesh]) => {
        if (!uid.startsWith('ring_')) {
          mesh.traverse(ch => {
            if (ch.userData.spinProp) ch.rotation.y += 0.18;
          });
        }
      });
      // ── Chassis idle: bob + spin built-in props ──
      if (chassisMeshRef.current) {
        chassisMeshRef.current.position.y = Math.sin(t * 0.9) * 0.004;
        chassisMeshRef.current.traverse(ch => {
          if (ch.userData.spinProp) ch.rotation.y += 0.18;
        });
      }
      // Snap indicator follows dragged part when snapping
      const si = snapIndicatorRef.current;
      if (si) {
        const sp = snapPosRef.current;
        if (dragRef.current.active && snapActiveRef.current && sp) {
          si.visible = true;
          si.position.set(sp.x, dragRef.current.planeY + 0.01, sp.z);
        } else { si.visible = false; }
      }
      // Snap-in spring animation: newly added parts scale 0 → 1 with overshoot
      const snapIn = snapInRef.current;
      const partMeshes = partMeshesRef.current;
      Object.keys(snapIn).forEach(uid => {
        const state = snapIn[uid];
        if (state.t >= 1) { delete snapIn[uid]; return; }
        state.t = Math.min(state.t + 0.055, 1);
        const t = state.t;
        // Spring overshoot: ease-out elastic-ish curve peaks at ~1.15 then settles to 1
        const s = t < 0.7
          ? (1.3 * t / 0.7)
          : (1.3 - 0.3 * ((t - 0.7) / 0.3));
        const mesh = partMeshes[uid];
        if (mesh) mesh.scale.setScalar(Math.max(0.01, s));
      });
      composer.render();
    }
    animate();
    const onResize = () => {
      const W2=canvas.clientWidth, H2=canvas.clientHeight;
      renderer.setSize(W2,H2,false);
      composer.setSize(W2,H2);
      cam.aspect=W2/H2; cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize',onResize); renderer.dispose(); };
  }, []);

  // Keep placedPartsRef in sync so event handlers always see fresh positions
  useEffect(() => { placedPartsRef.current = placedParts || []; }, [placedParts]);

  // Chassis mesh — tries GLTF first, falls back to procedural
  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return;
    if (chassisMeshRef.current) { scene.remove(chassisMeshRef.current); chassisMeshRef.current = null; }
    if (!chassisId) return;

    let cancelled = false;

    function applyChassisAppearance(m) {
      const s = chassisScale || 1.0;
      // Only scale procedural meshes (GLTF was already normalized)
      if (!m.userData.isGltf) m.scale.set(s, s, s);
      m.traverse(ch => {
        if (ch.isMesh && ch.material && !ch.material.transparent) {
          ch.material = ch.material.clone();
          ch.material.metalness = metalness !== undefined ? metalness : 0.5;
          ch.material.roughness = roughness !== undefined ? roughness : 0.5;
          // Studio-built meshes have color baked into primaryColor — don't flatten them
          if (chassisColorOverride && !m.userData.studioBuild) ch.material.color = new THREE.Color(chassisColorOverride);
        }
      });
      if (!cancelled) { scene.add(m); chassisMeshRef.current = m; }
    }

    (async () => {
      // Try loading a real GLB from /public/models/bodies/<chassisId>.glb
      const gltfModel = await tryLoadChassisGltf(chassisId);
      if (cancelled) return;

      if (gltfModel) {
        // Real model found — normalize to fit our scene scale then apply
        const normalized = normalizeGltfChassis(gltfModel);
        const s = chassisScale || 1.0;
        normalized.scale.multiplyScalar(s);
        normalized.userData.isGltf = true;
        applyChassisAppearance(normalized);
      } else {
        // No GLB — use high-quality studio-robot-builder mesh
        const m = buildChassisMeshFromStudio(chassisId, chassisColorOverride, accentColorOverride, trimColorOverride, glowColorOverride, metalness, roughness);
        applyChassisAppearance(m);
      }
    })();

    return () => { cancelled = true; };
  }, [chassisId, chassisScale, chassisColorOverride, accentColorOverride, trimColorOverride, glowColorOverride, metalness, roughness]);

  // Placed parts
  useEffect(() => {
    const scene = sceneRef.current; if (!scene) return;
    Object.values(partMeshesRef.current).forEach(m => scene.remove(m));
    partMeshesRef.current = {};
    const freshUid = newPartUidRef.current;
    // Reset snap-in tracking; only the new part gets animated
    snapInRef.current = freshUid ? { [freshUid]: { t: 0 } } : {};
    newPartUidRef.current = null;
    (placedParts||[]).forEach(pp => {
      const def = findPartById(pp.partId); if (!def) return;
      const co = (partColors||{})[pp.uid] || null;
      const mesh = createPartMesh(def, co);
      mesh.position.set(...pp.pos); mesh.rotation.y = pp.rotY||0;
      // Snap-in: start new part invisible; existing parts at full scale
      if (pp.uid === freshUid) { mesh.scale.setScalar(0.01); }
      else { mesh.scale.setScalar(1); }
      if (pp.uid === selectedUid) {
        mesh.traverse(ch => {
          if (ch.isMesh && ch.material) {
            ch.material = ch.material.clone();
            ch.material.emissive = new THREE.Color(0x0066ff);
            ch.material.emissiveIntensity = 0.6;
          }
        });
        // Add selection ring
        const ringG2 = new THREE.TorusGeometry(0.12, 0.008, 8, 32);
        const ringM2 = new THREE.MeshStandardMaterial({color:0x0088ff,emissive:0x0088ff,emissiveIntensity:1.5});
        const selRing = new THREE.Mesh(ringG2, ringM2);
        selRing.rotation.x = Math.PI/2;
        selRing.position.y = pp.pos[1];
        scene.add(selRing);
        // Store in partMeshes under a special key so it gets cleaned up
        partMeshesRef.current[`ring_${pp.uid}`] = selRing;
      }
      scene.add(mesh); partMeshesRef.current[pp.uid] = mesh;
    });
  }, [placedParts, selectedUid, partColors]);

  // Camera reset
  useEffect(() => {
    if (cameraReset>0) { const o=orb.current; o.theta=0.6; o.phi=1.28; o.r=1.7; o.spin=true; }
  }, [cameraReset]);

  // Raycasting helpers
  const getRaycastUid = useCallback((e) => {
    const canvas = canvasRef.current, cam = camRef.current;
    if (!canvas || !cam) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX-rect.left)/rect.width)*2-1;
    const y = -((e.clientY-rect.top)/rect.height)*2+1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({x,y}, cam);
    const pairs = [];
    Object.entries(partMeshesRef.current).forEach(([uid, group]) => {
      if (uid.startsWith('ring_')) return;
      group.traverse(ch => { if (ch.isMesh) pairs.push([ch, uid]); });
    });
    const hits = raycaster.intersectObjects(pairs.map(([m])=>m), false);
    if (hits.length>0) { const pair=pairs.find(([m])=>m===hits[0].object); return pair?pair[1]:null; }
    return null;
  }, []);

  const getWorldPointerOnPlane = useCallback((e, planeY) => {
    const canvas = canvasRef.current, cam = camRef.current;
    if (!canvas || !cam) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX-rect.left)/rect.width)*2-1;
    const y = -((e.clientY-rect.top)/rect.height)*2+1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({x,y}, cam);
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0), -planeY);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    return target;
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button!==0) return;
    const uid = getRaycastUid(e);
    if (uid) {
      onPartClick(uid);
      // Find part's current Y position for drag plane
      const part = partMeshesRef.current[uid];
      const planeY = part ? part.position.y : 0.15;
      dragRef.current = { active:true, uid, planeY, moved:false };
      e.preventDefault();
    } else {
      orb.current.drag=true; orb.current.spin=false;
      orb.current.dX=e.clientX; orb.current.dY=e.clientY;
    }
  }, [getRaycastUid, onPartClick]);

  const handleMouseMove = useCallback((e) => {
    if (dragRef.current.active) {
      dragRef.current.moved=true;
      const pos = getWorldPointerOnPlane(e, dragRef.current.planeY);
      if (pos && onPartMove) {
        // ── Snap-to-part logic ──────────────────────────────────────────
        const SNAP_DIST = 0.32;
        const draggingUid = dragRef.current.uid;
        let bestDist = SNAP_DIST;
        let snapResult = null;
        placedPartsRef.current.forEach(pp => {
          if (pp.uid === draggingUid) return;
          const dx = pos.x - pp.pos[0];
          const dz = pos.z - pp.pos[2];
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (dist < bestDist) {
            bestDist = dist;
            // Place dragged part right next to the target (0.18 units away)
            if (dist < 0.01) {
              snapResult = { x: pp.pos[0] + 0.18, z: pp.pos[2] };
            } else {
              const nx = dx/dist, nz = dz/dist;
              snapResult = { x: pp.pos[0] + nx*0.18, z: pp.pos[2] + nz*0.18 };
            }
          }
        });
        snapActiveRef.current = !!snapResult;
        snapPosRef.current = snapResult;
        const fx = snapResult ? snapResult.x : pos.x;
        const fz = snapResult ? snapResult.z : pos.z;
        // ────────────────────────────────────────────────────────────────
        onPartMove(draggingUid, [
          parseFloat(fx.toFixed(2)),
          parseFloat(dragRef.current.planeY.toFixed(2)),
          parseFloat(fz.toFixed(2))
        ]);
      }
    } else if (orb.current.drag) {
      const o=orb.current;
      o.theta -= (e.clientX-o.dX)*0.008;
      o.phi = Math.max(0.12, Math.min(Math.PI*0.82, o.phi+(e.clientY-o.dY)*0.008));
      o.dX=e.clientX; o.dY=e.clientY;
    }
  }, [getWorldPointerOnPlane, onPartMove]);

  const handleMouseUp = useCallback((e) => {
    if (dragRef.current.active && !dragRef.current.moved) {
      // It was a click, not a drag — selection already set in mousedown
    }
    dragRef.current.active=false;
    orb.current.drag=false;
    snapActiveRef.current=false;
    snapPosRef.current=null;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    orb.current.r = Math.max(1.2, Math.min(4.5, orb.current.r+e.deltaY*0.007));
  }, []);

  const handleDblClick = useCallback(() => {
    const o=orb.current; o.theta=0.6; o.phi=0.58; o.r=2.6; o.spin=true;
  }, []);

  const handleClickEmpty = useCallback((e) => {
    if (!dragRef.current.moved) {
      const uid = getRaycastUid(e);
      if (!uid) onPartClick(null);
    }
    dragRef.current.moved=false;
  }, [getRaycastUid, onPartClick]);

  return (
    <canvas ref={canvasRef}
      style={{ width:'100%', height:'100%', display:'block', cursor: dragRef.current?.active?'grabbing':'grab' }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onWheel={handleWheel} onDoubleClick={handleDblClick}
      onClick={handleClickEmpty}
    />
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#ffffff','#111827','#dc2626','#ea580c','#eab308','#16a34a',
  '#06b6d4','#3b82f6','#7c3aed','#ec4899','#6b7280','#78350f',
];

function HuePicker({ hue, onChange }) {
  const divRef = useRef(null);
  const handleClick = useCallback((e) => {
    const rect = divRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const angle = Math.atan2(e.clientY-cy, e.clientX-cx);
    let h = (angle*180/Math.PI + 90 + 360) % 360;
    onChange(Math.round(h));
  }, [onChange]);
  const dotAngle = ((hue-90)*Math.PI/180);
  const R=55;
  return (
    <div ref={divRef} onClick={handleClick}
      style={{ position:'relative', width:140, height:140, borderRadius:'50%', cursor:'crosshair',
        background:'conic-gradient(hsl(0,100%,50%) 0deg,hsl(60,100%,50%) 60deg,hsl(120,100%,50%) 120deg,hsl(180,100%,50%) 180deg,hsl(240,100%,50%) 240deg,hsl(300,100%,50%) 300deg,hsl(360,100%,50%) 360deg)',
        flexShrink:0 }}>
      {/* White center hole */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:82, height:82, borderRadius:'50%', background:'#f8fafc', pointerEvents:'none' }} />
      {/* Hue indicator dot */}
      <div style={{ position:'absolute',
        left: 70 + Math.cos(dotAngle)*R - 7,
        top:  70 + Math.sin(dotAngle)*R - 7,
        width:14, height:14, borderRadius:'50%',
        background:`hsl(${hue},100%,50%)`, border:'2.5px solid white',
        boxShadow:'0 1px 4px rgba(0,0,0,0.4)', pointerEvents:'none' }} />
    </div>
  );
}

function SLPicker({ hue, sat, light, onChange }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const W=c.width, H=c.height;
    const gH = ctx.createLinearGradient(0,0,W,0);
    gH.addColorStop(0,'white'); gH.addColorStop(1,`hsl(${hue},100%,50%)`);
    ctx.fillStyle=gH; ctx.fillRect(0,0,W,H);
    const gV = ctx.createLinearGradient(0,0,0,H);
    gV.addColorStop(0,'rgba(0,0,0,0)'); gV.addColorStop(1,'rgba(0,0,0,1)');
    ctx.fillStyle=gV; ctx.fillRect(0,0,W,H);
  }, [hue]);
  const handleClick = useCallback((e) => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const s = Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    const l = Math.max(0.05,Math.min(0.95,1-(e.clientY-rect.top)/rect.height*0.9-0.05));
    onChange(Math.round(s*100), Math.round(l*100));
  }, [onChange]);
  const dotX = (sat/100)*110;
  const dotY = (1-(light/100-0.05)/0.9)*110;
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <canvas ref={canvasRef} width={110} height={110} style={{ borderRadius:6, cursor:'crosshair', display:'block' }} onClick={handleClick} />
      <div style={{ position:'absolute', left:Math.max(0,Math.min(105,dotX-4)), top:Math.max(0,Math.min(105,dotY-4)),
        width:9, height:9, borderRadius:'50%', border:'2px solid white',
        background:`hsl(${hue},${sat}%,${light}%)`,
        boxShadow:'0 1px 4px rgba(0,0,0,0.5)', pointerEvents:'none' }} />
    </div>
  );
}

function hexToHsl(hex) {
  let r=0,g=0,b=0;
  if(hex.length===7){r=parseInt(hex.slice(1,3),16)/255;g=parseInt(hex.slice(3,5),16)/255;b=parseInt(hex.slice(5,7),16)/255;}
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}
function hslToHex(h,s,l) {
  s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;const col=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*col).toString(16).padStart(2,'0');};
  return `#${f(0)}${f(8)}${f(4)}`;
}


// ─── Category Button Config ───────────────────────────────────────────────────
const CAT_BUTTONS = PARTS_CATALOG.map(cat => ({
  id: cat.id, label: cat.label, icon: cat.icon,
  color: cat.catColor||'#7c3aed', bg: cat.bg||'#faf5ff',
}));

// ─── Wizard Wrapper ───────────────────────────────────────────────────────────
function WizardPage({ step, total, title, subtitle, onBack, onNext, nextLabel, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f0f4ff',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#0891b2 100%)',
        padding:'14px 20px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          {onBack
            ? <button onClick={onBack} style={{ background:'rgba(255,255,255,0.25)', border:'none',
                color:'white', fontWeight:800, fontSize:14, cursor:'pointer',
                borderRadius:8, padding:'6px 14px', fontFamily:'inherit' }}>← Back</button>
            : <div style={{ width:80 }} />}
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, fontWeight:700 }}>Step {step} of {total}</div>
          <div style={{ width:80 }} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12 }}>
          {Array.from({length:total}).map((_,i) => (
            <div key={i} style={{ width: i+1===step ? 24 : 8, height:8, borderRadius:4,
              background: i+1<=step ? 'white' : 'rgba(255,255,255,0.3)',
              transition:'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ textAlign:'center', color:'white' }}>
          <div style={{ fontSize:20, fontWeight:900, marginBottom:4 }}>{title}</div>
          <div style={{ fontSize:12, opacity:0.85 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 16px 0' }}>{children}</div>
      {onNext && (
        <div style={{ padding:'12px 16px', flexShrink:0, background:'white', borderTop:'2px solid #e5e7eb' }}>
          <button onClick={onNext} style={{
            width:'100%', padding:'14px 0', borderRadius:12, border:'none',
            background:'linear-gradient(135deg,#7c3aed 0%,#0891b2 100%)',
            color:'white', fontWeight:900, fontSize:16, cursor:'pointer',
            fontFamily:'inherit', boxShadow:'0 4px 16px rgba(124,58,237,0.4)', transition:'transform 0.1s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >{nextLabel || 'Next →'}</button>
        </div>
      )}
    </div>
  );
}

function WizardNameStep({ robotName, setRobotName, onNext }) {
  return (
    <WizardPage step={1} total={4} title="What's Your Robot's Name? 🤖"
      subtitle="Give your robot an awesome name!" onNext={onNext} nextLabel="Name it! →">
      <div style={{ maxWidth:400, margin:'0 auto', textAlign:'center' }}>
        <div style={{ fontSize:80, marginBottom:20, lineHeight:1 }}>🤖</div>
        <input value={robotName} onChange={e=>setRobotName(e.target.value)}
          placeholder="e.g. Thunderbot 3000!"
          style={{ width:'100%', padding:'16px 18px', fontSize:20, fontWeight:800,
            borderRadius:14, border:'3px solid #7c3aed', outline:'none',
            textAlign:'center', fontFamily:'inherit', color:'#1f2937',
            boxShadow:'0 4px 20px rgba(124,58,237,0.15)', boxSizing:'border-box' }}
          onKeyDown={e=>{ if(e.key==='Enter') onNext(); }} autoFocus />
        <div style={{ marginTop:12, fontSize:13, color:'#9ca3af', fontWeight:600 }}>
          Press Enter or tap the button below!
        </div>
        <div style={{ marginTop:20, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
          {['Thunderbot','Robo-Rex','Captain Cog','Mega-Tron','Spark-E','Zippy 9000'].map(name=>(
            <button key={name} onClick={()=>setRobotName(name)} style={{
              padding:'7px 14px', borderRadius:20, border:'2px solid #7c3aed',
              background:'white', color:'#7c3aed', fontWeight:700, fontSize:12,
              cursor:'pointer', fontFamily:'inherit', transition:'all 0.1s',
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background='#7c3aed'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.color='#7c3aed'; }}
            >{name}</button>
          ))}
        </div>
      </div>
    </WizardPage>
  );
}

// Per-robot-type available categories — must match SLOT_CAPS non-zero entries
const TYPE_PART_TAGS = {
  spider:    ['\u{1F9B5} Legs x8','\u{1F9BE} Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','⭐ Lights'],
  rover:     ['\u{1F6DE} Wheels x6','\u{1F9BE} Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','\u{1F6E1}️ Armor','⭐ Lights'],
  drone:     ['\u{1F680} Propellers x8','\u{1F9BE} Light Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','⭐ Lights'],
  humanoid:  ['\u{1F9B5} Legs x6','\u{1F9BE} Arms x6','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','\u{1F6E1}️ Armor','⭐ Lights'],
  tracked:   ['\u{1F6DE} Tracks x8','\u{1F9BE} Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','\u{1F6E1}️ ARMOR x8'],
  hover:     ['\u{1F680} Thrusters x6','\u{1F9BE} Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','⭐ Lights'],
  underwater:['\u{1F680} Props x6','\u{1F9BE} Arms','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F4E1} Comm','\u{1F6E1}️ Hull Armor'],
  carrier:   ['\u{1F680} Props x8','\u{1F9BE} Arms x8','\u{1F441}️ Sensors','\u{1F50B} Power','\u{1F9E0} AI','\u{1F4E1} Comm','\u{1F6E1}️ Armor','⭐ Lights'],
};

function WizardTypeStep({ robotTypeId, onTypeChange, onBack, onNext }) {
  const sel = ROBOT_TYPES.find(r => r.id === robotTypeId);
  return (
    <WizardPage step={2} total={4} title="Choose Your Robot Type! 🦾"
      subtitle="Your type decides which parts you can add!"
      onBack={onBack} onNext={onNext}
      nextLabel={sel ? `${sel.emoji} Let's go! →` : 'Pick one first!'}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:500, margin:'0 auto' }}>
        {ROBOT_TYPES.map(rt => {
          const active = rt.id === robotTypeId;
          return (
            <button key={rt.id} onClick={()=>onTypeChange(rt.id)} style={{
              padding:'18px 12px', borderRadius:14,
              border:`3px solid ${active ? rt.color : '#e5e7eb'}`,
              background: active ? rt.color : 'white', color: active ? 'white' : '#1f2937',
              cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', textAlign:'center',
              boxShadow: active ? `0 6px 20px ${rt.color}55` : '0 2px 8px rgba(0,0,0,0.06)',
              transform: active ? 'scale(1.04)' : 'scale(1)',
            }}>
              <div style={{ fontSize:36, marginBottom:6 }}>{rt.emoji}</div>
              <div style={{ fontSize:14, fontWeight:900, marginBottom:4 }}>{rt.name}</div>
              <div style={{ fontSize:10, opacity:active?0.9:0.6, lineHeight:1.4 }}>{rt.stat}</div>
            </button>
          );
        })}
      </div>
      {/* Selection confirmation + available parts preview */}
      {sel && (
        <div style={{ marginTop:16, marginBottom:8, padding:'14px 16px', borderRadius:14,
          background:`${sel.color}12`, border:`2px solid ${sel.color}44` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:28, flexShrink:0 }}>{sel.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:900, color:sel.color }}>{sel.name} selected! ✅</div>
              <div style={{ fontSize:11, color:'#6b7280', marginTop:1 }}>Next: pick your body frame →</div>
            </div>
          </div>
          <div style={{ fontSize:10, fontWeight:800, color:'#9ca3af', letterSpacing:'0.6px', marginBottom:6 }}>
            AVAILABLE PARTS FOR THIS TYPE:
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {(TYPE_PART_TAGS[sel.id]||[]).map(tag => (
              <span key={tag} style={{ padding:'3px 8px', borderRadius:20, fontSize:10, fontWeight:700,
                background:`${sel.color}22`, color:sel.color, border:`1px solid ${sel.color}44` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </WizardPage>
  );
}

// Body frame icons per chassis ID
const CHASSIS_ICONS = {
  'spider-scout':    '🕷️', 'spider-tank':     '🛡️', 'spider-nano':   '🔬',
  'rover-explorer':  '🔭', 'rover-racer':     '🏎️', 'rover-cargo':   '📦',
  'drone-quad':      '🚁', 'drone-hex':       '⬡',  'drone-wing':    '✈️',
  'mech-slim':       '🏃', 'mech-warrior':    '⚔️', 'mech-heavy':    '🛡️',
  'tank-fast':       '💨', 'tank-heavy':      '🪖', 'tank-siege':    '🎯',
  'hover-pod':       '🛸', 'hover-skiff':     '🛥️', 'hover-orb':     '🔮',
  'sub-torpedo':     '🐟', 'sub-squid':       '🦑', 'sub-heavy':     '⚓',
  'carrier-launch':  '🚀', 'carrier-bus':     '🛸', 'carrier-orbital':'⭕',
};

// Stat mod display helper
function ModBadges({ mods, baseCol }) {
  const entries = Object.entries(mods||{}).filter(([,v])=>v!==0);
  if (!entries.length) return <span style={{fontSize:10,color:'#9ca3af'}}>Balanced build</span>;
  return (
    <span style={{display:'flex',flexWrap:'wrap',gap:4}}>
      {entries.map(([k,v])=>(
        <span key={k} style={{fontSize:10,fontWeight:800,padding:'1px 6px',borderRadius:10,
          background: v>0?'#dcfce7':'#fee2e2', color: v>0?'#16a34a':'#dc2626'}}>
          {v>0?'+':''}{v} {k.toUpperCase()}
        </span>
      ))}
    </span>
  );
}

function WizardStyleStep({ robotTypeId, variantId, onVariantChange, onBack, onNext }) {
  const type = ROBOT_TYPES.find(r => r.id === robotTypeId);
  const typeColor = type?.color || '#7c3aed';
  return (
    <WizardPage step={3} total={4} title="Choose Your Body Frame! 🏗️"
      subtitle={`${type?.variants?.length || 4} different ${type?.name||''} bodies to choose from!`}
      onBack={onBack} onNext={onNext} nextLabel="Looking good! →">
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:500, margin:'0 auto' }}>
        {(type?.variants||[]).map((v) => {
          const sel = v.id === variantId;
          const col = v.col || typeColor;
          const icon = CHASSIS_ICONS[v.chassis] || type?.emoji || '🤖';
          return (
            <button key={v.id} onClick={()=>onVariantChange(v.id)} style={{
              padding:'14px 16px', borderRadius:14,
              border:`3px solid ${sel ? typeColor : '#e5e7eb'}`,
              background: sel ? `${typeColor}12` : 'white',
              cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              transition:'all 0.15s', display:'flex', alignItems:'center', gap:14,
              boxShadow: sel ? `0 4px 16px ${typeColor}33` : '0 2px 6px rgba(0,0,0,0.05)',
            }}>
              {/* Body shape icon */}
              <div style={{ width:54, height:54, borderRadius:12, flexShrink:0,
                background: sel ? typeColor : `${col}18`,
                border: sel ? 'none' : `2px solid ${col}44`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:28, transition:'all 0.15s' }}>
                {icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                  <div style={{ fontSize:15, fontWeight:900, color: sel ? typeColor : '#111827' }}>
                    {v.name}
                  </div>
                  {sel && <span style={{fontSize:16}}>✅</span>}
                </div>
                <div style={{ fontSize:11, color:'#6b7280', lineHeight:1.4, marginBottom:5 }}>{v.desc}</div>
                <ModBadges mods={v.mods} baseCol={typeColor} />
              </div>
            </button>
          );
        })}
      </div>
    </WizardPage>
  );
}

function WizardSizeStep({ sizeId, onSizeChange, onBack, onNext }) {
  const sizeColors = ['#16a34a','#0891b2','#d97706','#dc2626'];
  const sizeDots   = ['●','●●','●●●','●●●●'];
  return (
    <WizardPage step={4} total={4} title="How Big Is Your Robot? 📐"
      subtitle="Bigger robots are heavier but tougher!"
      onBack={onBack} onNext={onNext} nextLabel="Start Building! 🔧">
      <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:500, margin:'0 auto' }}>
        {SIZE_OPTIONS.map((sz,i) => {
          const sel = sz.id === sizeId;
          const col = sizeColors[i];
          return (
            <button key={sz.id} onClick={()=>onSizeChange(sz.id)} style={{
              padding:'16px 18px', borderRadius:14,
              border:`3px solid ${sel ? col : '#e5e7eb'}`,
              background: sel ? `${col}15` : 'white',
              cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              transition:'all 0.15s', display:'flex', alignItems:'center', gap:14,
              boxShadow: sel ? `0 4px 16px ${col}33` : '0 2px 6px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize:22, flexShrink:0, width:48, textAlign:'center',
                letterSpacing:-2, color: sel ? col : '#9ca3af' }}>{sizeDots[i]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:900, color: sel ? col : '#111827', marginBottom:2 }}>
                  {sz.emoji} {sz.name}
                </div>
                <div style={{ fontSize:11, color:'#6b7280' }}>{sz.desc}</div>
              </div>
              {sel && <div style={{ fontSize:24, flexShrink:0 }}>✅</div>}
            </button>
          );
        })}
      </div>
    </WizardPage>
  );
}

// ─── Parts Picker Modal (bottom sheet) ────────────────────────────────────────
function PartsPickerModal({ pickerCat, onClose, robotTypeId, placedParts, onAddPart }) {
  if (!pickerCat) return null;
  const cat = PARTS_CATALOG.find(c => c.id === pickerCat);
  if (!cat) return null;
  const caps  = SLOT_CAPS[robotTypeId] || {};
  const cap   = caps[cat.id] ?? 4;
  const count = placedParts.filter(p => p.catId === cat.id).length;
  const cc    = { color: cat.catColor||'#7c3aed', bg: cat.bg||'#faf5ff' };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000,
      background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column',
      justifyContent:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'white', borderRadius:'20px 20px 0 0',
        maxHeight:'72vh', display:'flex', flexDirection:'column',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.25)' }}>
        <div style={{ padding:'12px 0 4px', flexShrink:0, display:'flex', justifyContent:'center' }}>
          <div style={{ width:44, height:4, borderRadius:2, background:'#d1d5db' }} />
        </div>
        <div style={{ padding:'8px 20px 10px', borderBottom:'2px solid #f3f4f6',
          flexShrink:0, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:32 }}>{cat.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:900, color:cc.color }}>{cat.label}</div>
            <div style={{ fontSize:12, color:'#9ca3af' }}>
              {count}/{cap} added • Tap [+ ADD!] to attach to your robot!
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#f3f4f6', border:'none',
            width:36, height:36, borderRadius:18, fontSize:20, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#6b7280', fontWeight:700, flexShrink:0 }}>×</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 20px',
          scrollbarWidth:'thin', scrollbarColor:`${cc.color} #f1f5f9` }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {cat.parts.map(part => {
              const full = count >= cap;
              return (
                <div key={part.id} style={{ background:'white', borderRadius:12,
                  border:`2px solid ${cc.bg}`, padding:'12px 10px',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                  display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:6, lineHeight:1 }}>{part.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:'#111827',
                    marginBottom:4, lineHeight:1.3 }}>{part.n}</div>
                  <div style={{ fontSize:10, color:'#9ca3af', marginBottom:8,
                    lineHeight:1.4, flex:1 }}>{part.desc}</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'center', marginBottom:10 }}>
                    {part.spd>0 && <span style={{ fontSize:9, background:'#eff6ff', color:'#2563eb',
                      borderRadius:6, padding:'2px 6px', fontWeight:700 }}>⚡+{part.spd}</span>}
                    {part.dur>0 && <span style={{ fontSize:9, background:'#f0fdf4', color:'#16a34a',
                      borderRadius:6, padding:'2px 6px', fontWeight:700 }}>🛡️+{part.dur}</span>}
                    {part.pw>0  && <span style={{ fontSize:9, background:'#fffbeb', color:'#d97706',
                      borderRadius:6, padding:'2px 6px', fontWeight:700 }}>🔋{part.pw}W</span>}
                  </div>
                  <button disabled={full} onClick={()=>onAddPart(cat.id, part)}
                    style={{ width:'100%', padding:'9px 0', borderRadius:9, border:'none',
                      cursor: full?'not-allowed':'pointer',
                      background: full ? '#e5e7eb' : cc.color,
                      color: full ? '#9ca3af' : 'white',
                      fontWeight:900, fontSize:14, fontFamily:'inherit',
                      boxShadow: full ? 'none' : `0 3px 10px ${cc.color}44`,
                      transition:'transform 0.1s',
                    }}
                    onMouseEnter={e=>{ if(!full) e.currentTarget.style.transform='scale(1.04)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
                  >{full ? '✅ Full!' : '+ ADD!'}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Add Panel (builder right panel) ────────────────────────────────────
function QuickAddPanel({ robotTypeId, placedParts, onCatPick, selectedUid,
                         onRemovePart, onClonePart }) {
  const caps = SLOT_CAPS[robotTypeId] || {};
  const countByCat = {};
  placedParts.forEach(p => { countByCat[p.catId] = (countByCat[p.catId]||0)+1; });
  const selectedPart = placedParts.find(p => p.uid === selectedUid);
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%',
      background:'#f8fafc', borderLeft:'2px solid #e5e7eb', fontFamily:'inherit' }}>
      <div style={{ padding:'10px 14px 8px',
        background:'linear-gradient(135deg,#7c3aed 0%,#0891b2 100%)', flexShrink:0 }}>
        <div style={{ fontSize:15, fontWeight:900, color:'white' }}>➕ ADD PARTS</div>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.85)', marginTop:1 }}>
          {placedParts.length} part{placedParts.length!==1?'s':''} on your robot!
        </div>
      </div>
      {selectedPart && (
        <div style={{ padding:'8px 10px', background:'#f0f9ff',
          borderBottom:'2px solid #bae6fd', flexShrink:0 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#0369a1', marginBottom:5,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {selectedPart.emoji} {selectedPart.name}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={()=>onClonePart(selectedUid)} style={{
              flex:1, padding:'6px 0', borderRadius:8, border:'none', cursor:'pointer',
              background:'#7c3aed', color:'white', fontSize:11, fontWeight:800,
              fontFamily:'inherit' }}>📋 Clone</button>
            <button onClick={()=>onRemovePart(selectedUid)} style={{
              flex:1, padding:'6px 0', borderRadius:8, border:'none', cursor:'pointer',
              background:'#dc2626', color:'white', fontSize:11, fontWeight:800,
              fontFamily:'inherit' }}>🗑 Remove</button>
          </div>
        </div>
      )}
      <div style={{ flex:1, overflowY:'auto', padding:'10px',
        scrollbarWidth:'thin', scrollbarColor:'#7c3aed #f1f5f9' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {CAT_BUTTONS.map(cat => {
            const cap   = caps[cat.id] ?? 4;
            if (cap === 0) return null;
            const count = countByCat[cat.id] || 0;
            const full  = count >= cap;
            return (
              <button key={cat.id} disabled={full} onClick={()=>onCatPick(cat.id)}
                style={{ width:'100%', padding:'12px 14px', borderRadius:12,
                  border:`2px solid ${full?'#e5e7eb':cat.color}`,
                  background: full ? '#f9fafb' : cat.bg,
                  cursor: full ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', gap:10,
                  textAlign:'left', fontFamily:'inherit', transition:'all 0.15s',
                  boxShadow: full ? 'none' : `0 2px 8px ${cat.color}22`,
                }}
                onMouseEnter={e=>{ if(!full){ e.currentTarget.style.transform='scale(1.02)';
                  e.currentTarget.style.boxShadow=`0 4px 14px ${cat.color}44`; }}}
                onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)';
                  e.currentTarget.style.boxShadow=full?'none':`0 2px 8px ${cat.color}22`; }}
              >
                <span style={{ fontSize:26, flexShrink:0 }}>{cat.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:900,
                    color: full ? '#9ca3af' : cat.color, lineHeight:1.2 }}>{cat.label}</div>
                  <div style={{ fontSize:10, color: full?'#d1d5db':'#6b7280', marginTop:1 }}>
                    {full ? `Full! (${cap}/${cap})` : `${count}/${cap} added`}
                  </div>
                </div>
                <div style={{ width:28, height:28, borderRadius:14, flexShrink:0,
                  background: full ? '#e5e7eb' : cat.color,
                  color: full ? '#9ca3af' : 'white',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, fontWeight:900 }}>
                  {full ? '✓' : '+'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ stats, partCount }) {
  const bars = [
    { icon:'⚡', label:'Speed',   val:Math.min(stats.speed,100), max:100, col:'#3b82f6' },
    { icon:'🛡️', label:'Tough',   val:Math.min(stats.dur,100),   max:100, col:'#16a34a' },
    { icon:'🎯', label:'Agility', val:Math.min(stats.agi,100),   max:100, col:'#f59e0b' },
    { icon:'🧠', label:'Smart',   val:Math.min(stats.intel,100), max:100, col:'#7c3aed' },
  ];
  return (
    <div style={{ background:'white', borderTop:'2px solid #e5e7eb',
      padding:'5px 14px', flexShrink:0, display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ flexShrink:0, textAlign:'center',
        background:'linear-gradient(135deg,#7c3aed,#0891b2)',
        borderRadius:8, padding:'3px 10px', color:'white', minWidth:44 }}>
        <div style={{ fontSize:17, fontWeight:900, lineHeight:1 }}>{partCount}</div>
        <div style={{ fontSize:8, fontWeight:700 }}>PARTS</div>
      </div>
      {bars.map((b,i) => {
        const pct = (b.val/b.max)*100;
        return (
          <div key={i} style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#374151' }}>{b.icon} {b.label}</span>
              <span style={{ fontSize:9, fontWeight:700, color:b.col }}>{Math.round(pct)}%</span>
            </div>
            <div style={{ height:7, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, borderRadius:4,
                background:b.col, transition:'width 0.4s ease-out' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Color Themes (4-target preset schemes) ───────────────────────────────────
const COLOR_THEMES = [
  { name:'Cyber Blue',  emoji:'🔵', primary:'#0f172a', accent:'#00d9ff', trim:'#3b82f6',  glow:'#00d9ff' },
  { name:'Fire Red',    emoji:'🔴', primary:'#1c0505', accent:'#ef4444', trim:'#f97316',  glow:'#fbbf24' },
  { name:'Forest',      emoji:'🟢', primary:'#052e16', accent:'#22c55e', trim:'#84cc16',  glow:'#34d399' },
  { name:'Galaxy',      emoji:'🟣', primary:'#0f0720', accent:'#a855f7', trim:'#6366f1',  glow:'#e879f9' },
  { name:'Gold Rush',   emoji:'🟡', primary:'#1c1106', accent:'#f59e0b', trim:'#eab308',  glow:'#fcd34d' },
  { name:'Arctic',      emoji:'⚪', primary:'#e2e8f0', accent:'#cbd5e1', trim:'#94a3b8',  glow:'#bae6fd' },
  { name:'Midnight',    emoji:'⚫', primary:'#0a0a12', accent:'#1e293b', trim:'#334155',  glow:'#6366f1' },
  { name:'Neon Pink',   emoji:'🩷', primary:'#1a0010', accent:'#ec4899', trim:'#f43f5e',  glow:'#fb7185' },
  { name:'Ocean',       emoji:'🔷', primary:'#0c1a2e', accent:'#0ea5e9', trim:'#38bdf8',  glow:'#67e8f9' },
  { name:'Lava',        emoji:'🟠', primary:'#1a0800', accent:'#ea580c', trim:'#dc2626',  glow:'#fbbf24' },
];

const RICH_PRESET_COLORS = [
  '#ffffff','#f8fafc','#e2e8f0','#94a3b8','#475569','#1e293b','#0f172a','#000000',
  '#ef4444','#dc2626','#b91c1c','#f97316','#ea580c','#c2410c','#eab308','#ca8a04',
  '#22c55e','#16a34a','#15803d','#06b6d4','#0891b2','#0284c7','#3b82f6','#2563eb',
  '#8b5cf6','#7c3aed','#6d28d9','#a855f7','#ec4899','#db2777','#f43f5e','#e11d48',
  '#00d9ff','#00ffaa','#ffd93d','#ff6b6b','#c084fc','#4ade80','#38bdf8','#fb923c',
];

// ─── Color Modal — Multi-Target Color Customizer ───────────────────────────────
function ColorModal({ isOpen, onClose,
  chassisColor, setChassisColor,
  accentColor, setAccentColor,
  trimColor, setTrimColor,
  glowColor, setGlowColor,
  selectedUid, partColors, setPartColors,
  metalness, roughness, setMetalness, setRoughness }) {

  const COLOR_TARGETS = [
    { id:'primary',  label:'Primary',  emoji:'🎨', desc:'Main body color',    getter:chassisColor||'#374151',          setter:setChassisColor },
    { id:'accent',   label:'Accent',   emoji:'✨', desc:'Secondary / trim',   getter:accentColor||'#00d9ff',           setter:setAccentColor },
    { id:'trim',     label:'Trim',     emoji:'🔲', desc:'Detail / edge color', getter:trimColor||'#3b82f6',            setter:setTrimColor },
    { id:'glow',     label:'LED Glow', emoji:'💡', desc:'Emissive glow color', getter:glowColor||'#00d9ff',            setter:setGlowColor },
  ];

  const [activeTarget, setActiveTarget] = useState('primary');
  const [colorHistory, setColorHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('wheel'); // 'wheel' | 'themes'

  const activeDef = COLOR_TARGETS.find(t => t.id === activeTarget) || COLOR_TARGETS[0];
  const currentHex = selectedUid && activeTarget === 'primary'
    ? (partColors[selectedUid] || '#7c3aed')
    : activeDef.getter;

  const [hsl, setHsl] = useState(() => hexToHsl(currentHex));

  useEffect(() => {
    if (isOpen) {
      setHsl(hexToHsl(currentHex));
      setActiveTab('wheel');
    }
  }, [isOpen, activeTarget]); // eslint-disable-line

  if (!isOpen) return null;

  const applyColor = hex => {
    // Push to history (max 12, no dupes)
    setColorHistory(prev => [hex, ...prev.filter(c => c !== hex)].slice(0, 12));
    if (selectedUid && activeTarget === 'primary') {
      setPartColors(prev => ({ ...prev, [selectedUid]: hex }));
    } else {
      activeDef.setter(hex);
    }
  };
  const applyHsl = (h, s, l) => { setHsl({ h, s, l }); applyColor(hslToHex(h, s, l)); };
  const displayHex = hslToHex(hsl.h, hsl.s, hsl.l);

  const applyTheme = theme => {
    setChassisColor(theme.primary);
    setAccentColor(theme.accent);
    setTrimColor(theme.trim);
    setGlowColor(theme.glow);
    setHsl(hexToHsl(theme[activeTarget] || theme.primary));
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000,
      background:'rgba(0,0,0,0.72)', display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{ background:'linear-gradient(160deg,#0f1629 0%,#1a1040 100%)',
        borderRadius:20, padding:'0 0 20px', width:420, maxHeight:'92vh', overflowY:'auto',
        boxShadow:'0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

        {/* Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:'white' }}>🎨 Color Studio</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>
              Customize every color on your robot
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none',
            width:32, height:32, borderRadius:8, color:'white', fontSize:18,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* 4 Color target swatches */}
        <div style={{ padding:'14px 20px 0' }}>
          <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', marginBottom:8 }}>COLOR TARGETS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
            {COLOR_TARGETS.map(t => {
              const hex = t.id === 'primary' && selectedUid ? (partColors[selectedUid] || t.getter) : t.getter;
              const isActive = activeTarget === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTarget(t.id)} style={{
                  padding:'10px 6px', borderRadius:12, border:`2px solid ${isActive ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                  cursor:'pointer', transition:'all 0.15s', textAlign:'center',
                  boxShadow: isActive ? '0 0 0 1px rgba(168,85,247,0.4)' : 'none',
                }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:hex, margin:'0 auto 6px',
                    border:'2px solid rgba(255,255,255,0.2)',
                    boxShadow:`0 2px 8px ${hex}66` }} />
                  <div style={{ fontSize:9, fontWeight:800, color: isActive ? '#c084fc' : 'rgba(255,255,255,0.5)', lineHeight:1.2 }}>
                    {t.emoji} {t.label}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', textAlign:'center', marginTop:6, marginBottom:4 }}>
            {activeDef.desc}
            {selectedUid && activeTarget === 'primary' && ' (selected part)'}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ padding:'12px 20px 0', display:'flex', gap:6 }}>
          {[['wheel','🎡 Color Wheel'],['themes','🎭 Themes'],['presets','🎨 Swatches']].map(([tab,label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex:1, padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer',
              fontFamily:'inherit', fontWeight:700, fontSize:10,
              background: activeTab === tab ? '#7c3aed' : 'rgba(255,255,255,0.07)',
              color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.45)',
              transition:'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding:'16px 20px 0' }}>

          {activeTab === 'wheel' && (
            <>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:12 }}>
                <HuePicker hue={hsl.h} onChange={h => applyHsl(h, hsl.s, hsl.l)} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <SLPicker hue={hsl.h} sat={hsl.s} light={hsl.l}
                    onChange={(s, l) => applyHsl(hsl.h, s, l)} />
                  <div style={{ height:32, borderRadius:8, background:displayHex,
                    border:'1px solid rgba(255,255,255,0.12)',
                    boxShadow:`0 4px 12px ${displayHex}44` }} />
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textAlign:'center',
                    fontFamily:'monospace', letterSpacing:'0.5px' }}>{displayHex.toUpperCase()}</div>
                </div>
              </div>

              {colorHistory.length > 0 && (
                <>
                  <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', marginBottom:6 }}>RECENT</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
                    {colorHistory.map((col, i) => (
                      <button key={`${col}-${i}`} onClick={() => { setHsl(hexToHsl(col)); applyColor(col); }} style={{
                        width:28, height:28, borderRadius:6, background:col, cursor:'pointer', border:'none',
                        boxShadow:`0 1px 4px ${col}66`, transition:'transform 0.1s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'themes' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              {COLOR_THEMES.map(theme => (
                <button key={theme.name} onClick={() => applyTheme(theme)} style={{
                  padding:'10px 12px', borderRadius:12, border:'1.5px solid rgba(255,255,255,0.1)',
                  background:'rgba(255,255,255,0.05)', cursor:'pointer', textAlign:'left',
                  transition:'all 0.15s', fontFamily:'inherit',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}
                >
                  <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                    {[theme.primary, theme.accent, theme.trim, theme.glow].map((c, i) => (
                      <div key={i} style={{ flex:1, height:12, borderRadius:3, background:c,
                        boxShadow:`0 1px 4px ${c}55` }} />
                    ))}
                  </div>
                  <div style={{ fontSize:11, fontWeight:800, color:'white' }}>{theme.emoji} {theme.name}</div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'presets' && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {RICH_PRESET_COLORS.map(col => (
                <button key={col} onClick={() => { setHsl(hexToHsl(col)); applyColor(col); }} style={{
                  width:34, height:34, borderRadius:7, background:col, cursor:'pointer', border:'none',
                  outline:`3px solid ${col === displayHex ? '#a855f7' : 'transparent'}`,
                  outlineOffset:2, boxShadow:'0 1px 4px rgba(0,0,0,0.3)', transition:'transform 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.18)'}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
              ))}
            </div>
          )}

          {/* Material effects */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:12, marginTop:4 }}>
            <div style={{ fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', marginBottom:10 }}>MATERIAL EFFECTS</div>
            {[['✨ Metallic', metalness, setMetalness, '#a855f7'],['○ Roughness', roughness, setRoughness, '#0891b2']].map(([label, val, setter, col]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:700, width:90, flexShrink:0 }}>{label}</span>
                <input type="range" min={0} max={1} step={0.01} value={val}
                  onChange={e => setter(parseFloat(e.target.value))}
                  style={{ flex:1, accentColor:col, cursor:'pointer' }} />
                <span style={{ fontSize:11, color:col, width:34, textAlign:'right', fontWeight:800 }}>{Math.round(val * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Done button */}
        <div style={{ padding:'4px 20px 0' }}>
          <button onClick={onClose} style={{
            width:'100%', padding:'13px 0', borderRadius:12, border:'none', cursor:'pointer',
            fontWeight:900, fontSize:14, fontFamily:'inherit',
            background:'linear-gradient(135deg,#7c3aed 0%,#0891b2 100%)',
            color:'white', boxShadow:'0 4px 16px rgba(124,58,237,0.4)',
          }}>✅ Apply Colors</button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionButton({ emoji, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, border:'none', cursor:'pointer',
      background:'transparent', color:'white',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:3,
      fontFamily:'inherit',
      borderRight:'1px solid rgba(255,255,255,0.06)',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}28`; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      onMouseDown={e => { e.currentTarget.style.background = `${color}50`; }}
      onMouseUp={e => { e.currentTarget.style.background = `${color}28`; }}
    >
      <span style={{ fontSize:24 }}>{emoji}</span>
      <span style={{ fontSize:9, fontWeight:900, letterSpacing:'1px',
        color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>{label}</span>
    </button>
  );
}

// ─── Parts Carousel Modal ─────────────────────────────────────────────────────
function PartsCarouselModal({ isOpen, onClose, robotTypeId, placedParts, onAddPart }) {
  const [mode, setMode]           = useState('cat');
  const [activeCat, setActiveCat] = useState(null);
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    if (!isOpen) { setMode('cat'); setActiveCat(null); setJustAdded(null); }
  }, [isOpen]);

  // Use robot-specific catalog (each type has its own unique parts)
  const robotCatalog = ROBOT_PARTS_CATALOG[robotTypeId] || {};
  const hasRobotCat  = Object.keys(robotCatalog).length > 0;

  // Build the list of available categories from robot catalog or legacy fallback
  const availCats = hasRobotCat
    ? Object.values(robotCatalog)
    : (() => {
        const caps = SLOT_CAPS[robotTypeId] || {};
        return CAT_BUTTONS
          .filter(c => (caps[c.id] ?? 4) > 0)
          .map(c => ({ ...c, cap: caps[c.id] ?? 4, parts: PARTS_CATALOG.find(pc => pc.id === c.id)?.parts || [] }));
      })();

  const activeCatDef = activeCat
    ? (hasRobotCat ? robotCatalog[activeCat] : availCats.find(c => c.id === activeCat))
    : null;
  const catParts   = activeCatDef?.parts || [];
  const catCap     = activeCatDef?.cap ?? 4;
  const isBodyCat  = activeCat === 'body';
  const countInCat = isBodyCat ? 0 : placedParts.filter(p => p.catId === activeCat).length;
  const isCatFull  = !isBodyCat && countInCat >= catCap;

  const handleAdd = (part) => {
    if (isCatFull) return;
    onAddPart(activeCat, part);
    setJustAdded(part.id);
    setTimeout(() => setJustAdded(null), 950);
    // Body selections close the modal automatically after a beat
    if (isBodyCat) { setTimeout(() => { setMode('cat'); onClose(); }, 700); }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0,
        background:'rgba(0,0,0,0.78)', backdropFilter:'blur(5px)' }} />

      {/* Bottom sheet */}
      <div style={{ position:'relative', background:'#13152e', borderRadius:'22px 22px 0 0',
        maxHeight:'74vh', display:'flex', flexDirection:'column',
        animation:'bbSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow:'0 -8px 50px rgba(0,0,0,0.7)' }}>

        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 0' }}>
          <div style={{ width:38, height:4, borderRadius:2, background:'rgba(255,255,255,0.22)' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px 10px',
          borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {mode === 'part'
            ? <button onClick={() => setMode('cat')} style={{
                width:34, height:34, borderRadius:8, border:'none', flexShrink:0,
                background:'rgba(255,255,255,0.1)', color:'white', fontSize:17,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}>←</button>
            : <div style={{ width:34 }} />}

          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:17, fontWeight:900, color:'white' }}>
              {mode === 'cat'
                ? `➕ Add Parts — ${availCats.length} categories`
                : `${activeCatDef?.icon || ''} ${activeCatDef?.label || ''}`}
            </div>
            {mode === 'part' && (
              <div style={{ fontSize:11, marginTop:2,
                color: isCatFull ? '#f87171' : 'rgba(255,255,255,0.45)' }}>
                {isBodyCat
                  ? `Choose your frame — ${catParts.length} options`
                  : isCatFull
                    ? `SLOT FULL! (${catCap}/${catCap}) 🚫`
                    : `${countInCat}/${catCap} slots used • ${catParts.length} types to pick from`}
              </div>
            )}
          </div>

          <button onClick={onClose} style={{
            width:34, height:34, borderRadius:8, border:'none', flexShrink:0,
            background:'rgba(255,255,255,0.1)', color:'white', fontSize:19,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:'auto', padding:13, WebkitOverflowScrolling:'touch' }}>
          {mode === 'cat' ? (
            /* Category grid */
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
              {availCats.map(cat => {
                const catId  = cat.id;
                const isBody = catId === 'body';
                const cnt    = isBody ? 0 : placedParts.filter(p => p.catId === catId).length;
                const cp     = cat.cap ?? 4;
                const full   = !isBody && cnt >= cp;
                const color  = cat.catColor || cat.color || '#7c3aed';
                return (
                  <button key={catId}
                    onClick={() => { if (!full) { setActiveCat(catId); setMode('part'); } }}
                    style={{
                      padding:'14px 6px 10px', borderRadius:14, border:'none',
                      background: full
                        ? 'rgba(255,255,255,0.04)'
                        : `linear-gradient(135deg,${color}e0,${color}90)`,
                      color:'white', cursor: full ? 'default' : 'pointer',
                      textAlign:'center', opacity: full ? 0.42 : 1,
                      transition:'transform 0.12s',
                      boxShadow: full ? 'none' : `0 4px 14px ${color}44`,
                    }}
                    onMouseEnter={e => { if (!full) e.currentTarget.style.transform='scale(1.07)'; }}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  >
                    <div style={{ fontSize:26, marginBottom:4 }}>{cat.icon}</div>
                    <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.5px' }}>{cat.label}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:2 }}>
                      {isBody ? '🔄 Change Frame' : full ? '🚫 FULL' : `${cnt}/${cp} added`}
                    </div>
                    {!full && (
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', marginTop:2,
                        background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'1px 5px',
                        display:'inline-block' }}>
                        {cat.parts?.length || 0} options
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Parts list — enhanced with stat bars */
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {catParts.map(part => {
                const isJust = justAdded === part.id;
                const catColor = activeCatDef?.catColor || activeCatDef?.color || '#7c3aed';
                const hasStats = (part.spd||0) + (part.dur||0) + (part.pw||0) + (part.weight||0) > 0;
                return (
                  <button key={part.id} onClick={() => handleAdd(part)}
                    disabled={isCatFull}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', borderRadius:14,
                      border: isJust ? '1.5px solid rgba(16,185,129,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                      background: isJust
                        ? 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.2))'
                        : isCatFull ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                      color:'white', cursor: isCatFull ? 'not-allowed' : 'pointer',
                      textAlign:'left', transition:'all 0.18s',
                      transform: isJust ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isJust ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isCatFull && !isJust) {
                      e.currentTarget.style.background=`rgba(${catColor==='#7c3aed'?'124,58,237':catColor==='#0891b2'?'8,145,178':catColor==='#16a34a'?'22,163,74':'100,100,200'},0.18)`;
                      e.currentTarget.style.borderColor='rgba(255,255,255,0.18)';
                    }}}
                    onMouseLeave={e => { if (!isCatFull && !isJust) {
                      e.currentTarget.style.background='rgba(255,255,255,0.07)';
                      e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';
                    }}}
                  >
                    {/* Emoji */}
                    <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
                      background: isJust ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:24, border:'1px solid rgba(255,255,255,0.08)' }}>
                      {part.emoji || '⚙️'}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, marginBottom:2, lineHeight:1.2 }}>{part.n}</div>
                      {part.desc && (
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1.3, marginBottom:hasStats?5:0 }}>
                          {part.desc}
                        </div>
                      )}
                      {/* Mini stat bars */}
                      {hasStats && (
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {part.spd>0 && <span style={{ fontSize:9, background:'rgba(59,130,246,0.25)', color:'#93c5fd',
                            borderRadius:5, padding:'1px 6px', fontWeight:700 }}>⚡{part.spd}</span>}
                          {part.dur>0 && <span style={{ fontSize:9, background:'rgba(22,163,74,0.25)', color:'#86efac',
                            borderRadius:5, padding:'1px 6px', fontWeight:700 }}>🛡️{part.dur}</span>}
                          {part.pw>0  && <span style={{ fontSize:9, background:'rgba(245,158,11,0.25)', color:'#fcd34d',
                            borderRadius:5, padding:'1px 6px', fontWeight:700 }}>🔋{part.pw}W</span>}
                          {part.weight>0 && <span style={{ fontSize:9, background:'rgba(156,163,175,0.15)', color:'#9ca3af',
                            borderRadius:5, padding:'1px 6px', fontWeight:700 }}>⚖️{part.weight}kg</span>}
                        </div>
                      )}
                    </div>

                    {/* Action icon */}
                    <div style={{ fontSize:20, flexShrink:0 }}>
                      {isJust ? '✅' : isCatFull ? '🚫' : isBodyCat ? '🔄' : '➕'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confetti Overlay ──────────────────────────────────────────────────────────
function ConfettiOverlay({ celebration }) {
  const particles = useMemo(() => {
    if (!celebration) return [];
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      tx: ((Math.random() - 0.5) * 320).toFixed(1),
      ty: (-(60 + Math.random() * 210)).toFixed(1),
      rot: (Math.random() * 720 - 360).toFixed(1),
      color: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bcd','#c084fc'][i % 6],
      size: (8 + Math.random() * 10).toFixed(1),
      delay: (Math.random() * 0.18).toFixed(2),
    }));
  }, [celebration]);  // eslint-disable-line

  if (!celebration) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:12000, pointerEvents:'none',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:82, animation:'celebPop 0.72s cubic-bezier(0.34,1.56,0.64,1) forwards',
        userSelect:'none' }}>
        {celebration.emoji}
      </div>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', top:'50%', left:'50%',
          width:`${p.size}px`, height:`${p.size}px`,
          background:p.color, borderRadius:3,
          animationName:'confettiBurst',
          animationDuration:'0.85s',
          animationDelay:`${p.delay}s`,
          animationTimingFunction:'ease-out',
          animationFillMode:'forwards',
          '--tx':`${p.tx}px`,
          '--ty':`${p.ty}px`,
          '--rot':`${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}

// ─── Save Dialog ───────────────────────────────────────────────────────────────
const ROBOT_SAVE_EMOJIS = ['🤖','🦾','🕷️','🚁','🚗','🦿','🛸','⚙️','🔩','🛡️','⚔️','🎯',
  '🧠','💡','🔬','🚀','🌟','💫','⚡','🔥','❄️','🌊','🌈','🎮','🏆','👾','🤯','💎','🧲','🛰️'];

function SaveDialog({ isOpen, onClose, robotName, setRobotName, partCount, robotType,
                      robotTypeId, variantId, sizeId, chassisColor, accentColor, trimColor, glowColor, placedParts, codeBlocks }) {
  const [phase, setPhase]           = useState('edit');
  const [shareCode, setShareCode]   = useState('');
  const [robotEmoji, setRobotEmoji] = useState(robotType?.emoji || '🤖');
  const [description, setDescription] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) { setPhase('edit'); setShareCode(''); setShowEmojiPicker(false); }
    if (isOpen)  { setRobotEmoji(robotType?.emoji || '🤖'); }
  }, [isOpen, robotType]);

  const handleSave = () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    setShareCode(code);
    setPhase('saved');
    try {
      const existing = JSON.parse(localStorage.getItem('bytebuddies_robots') || '[]');
      const entry = {
        id: `robot_${Date.now()}`,
        name: robotName || 'My Robot',
        type: robotType?.name || 'Robot',
        emoji: robotEmoji,
        description: description || '',
        date: new Date().toLocaleDateString(),
        parts: partCount,
        codeCount: codeBlocks?.length || 0,
        shareCode: code,
        robotTypeId, variantId, sizeId, chassisColor, accentColor, trimColor, glowColor,
        placedParts: placedParts || [],
        codeBlocks:  codeBlocks  || [],
      };
      existing.push(entry);
      localStorage.setItem('bytebuddies_robots', JSON.stringify(existing.slice(-20)));
    } catch(e) { /* localStorage may be unavailable */ }
  };

  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:11000,
      background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(7px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'linear-gradient(160deg,#ffffff 0%,#f5f3ff 100%)',
        borderRadius:24, padding:'0', width:330, maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.2)',
        animation:'bbSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

        {phase === 'edit' ? (
          <>
            {/* Header gradient bar */}
            <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#0891b2 100%)',
              borderRadius:'24px 24px 0 0', padding:'20px 24px' }}>
              <div style={{ fontSize:13, fontWeight:900, color:'rgba(255,255,255,0.8)', letterSpacing:'0.5px' }}>SAVE YOUR ROBOT</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>
                {partCount} parts · {codeBlocks?.length || 0} code blocks
              </div>
            </div>

            <div style={{ padding:'20px 24px' }}>
              {/* Emoji + Name row */}
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <button onClick={() => setShowEmojiPicker(v => !v)} style={{
                    width:52, height:52, borderRadius:14, border:'2.5px solid #ede9fe',
                    background:'#f5f3ff', fontSize:28, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.15s', boxShadow: showEmojiPicker ? '0 0 0 3px rgba(124,58,237,0.35)' : 'none',
                  }}>{robotEmoji}</button>
                  {showEmojiPicker && (
                    <div style={{ position:'absolute', top:58, left:0, zIndex:20,
                      background:'white', borderRadius:14, padding:10,
                      boxShadow:'0 8px 32px rgba(0,0,0,0.2)', border:'1.5px solid #ede9fe',
                      display:'flex', flexWrap:'wrap', gap:4, width:220 }}>
                      {ROBOT_SAVE_EMOJIS.map(em => (
                        <button key={em} onClick={() => { setRobotEmoji(em); setShowEmojiPicker(false); }}
                          style={{ width:32, height:32, borderRadius:7, border:'none', fontSize:18,
                            cursor:'pointer', background: em===robotEmoji ? '#ede9fe' : 'transparent',
                            transition:'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background='#f3f4f6'}
                          onMouseLeave={e => e.currentTarget.style.background= em===robotEmoji ? '#ede9fe' : 'transparent'}
                        >{em}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#9ca3af', letterSpacing:'0.8px', marginBottom:4 }}>ROBOT NAME</div>
                  <input value={robotName} onChange={e => setRobotName(e.target.value)}
                    placeholder="My Awesome Robot"
                    style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                      border:'2px solid #ede9fe', fontSize:14, fontWeight:700,
                      fontFamily:'inherit', outline:'none', boxSizing:'border-box',
                      color:'#111827', background:'white' }}
                    onFocus={e => { e.target.style.borderColor='#7c3aed'; }}
                    onBlur={e => { e.target.style.borderColor='#ede9fe'; }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, fontWeight:800, color:'#9ca3af', letterSpacing:'0.8px', marginBottom:4 }}>DESCRIPTION (optional)</div>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What makes this robot special?"
                  rows={2}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                    border:'2px solid #ede9fe', fontSize:12, fontFamily:'inherit',
                    outline:'none', boxSizing:'border-box', color:'#374151',
                    background:'white', resize:'none', lineHeight:1.5 }}
                  onFocus={e => { e.target.style.borderColor='#7c3aed'; }}
                  onBlur={e => { e.target.style.borderColor='#ede9fe'; }} />
              </div>

              {/* Stats preview */}
              <div style={{ background:'#f5f3ff', borderRadius:12, padding:'10px 14px', marginBottom:16,
                border:'1.5px solid #ede9fe', display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ fontSize:24 }}>{robotEmoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:900, color:'#111827' }}>{robotName || 'My Robot'}</div>
                  <div style={{ fontSize:10, color:'#7c3aed', marginTop:1 }}>
                    {robotType?.emoji} {robotType?.name} · {partCount} parts · {codeBlocks?.length || 0} blocks
                  </div>
                </div>
              </div>

              <button onClick={handleSave} style={{
                width:'100%', padding:'13px 0', borderRadius:14, border:'none',
                background:'linear-gradient(135deg,#16a34a,#15803d)', color:'white',
                fontWeight:900, fontSize:15, cursor:'pointer', fontFamily:'inherit',
                boxShadow:'0 4px 16px rgba(22,163,74,0.4)', marginBottom:8,
              }}>💾 SAVE IT!</button>
              <button onClick={onClose} style={{
                width:'100%', padding:'10px 0', borderRadius:12,
                border:'2px solid #e5e7eb', background:'white',
                color:'#9ca3af', fontWeight:700, fontSize:13,
                cursor:'pointer', fontFamily:'inherit',
              }}>Cancel</button>
            </div>
          </>
        ) : (
          <div style={{ padding:'28px 24px', textAlign:'center' }}>
            <div style={{ fontSize:60, marginBottom:10,
              animation:'celebPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#111827', marginBottom:6 }}>
              {robotName} Saved!
            </div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:18 }}>Share with your friends!</div>
            <div style={{ background:'#f5f3ff', borderRadius:14, padding:'16px 12px',
              marginBottom:20, cursor:'pointer', border:'2px solid rgba(124,58,237,0.15)' }}
              onClick={() => navigator.clipboard?.writeText(shareCode)}>
              <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', marginBottom:4, letterSpacing:'0.8px' }}>
                YOUR SHARE CODE
              </div>
              <div style={{ fontSize:34, fontWeight:900, color:'#7c3aed',
                letterSpacing:'6px', fontFamily:'monospace' }}>{shareCode}</div>
              <div style={{ fontSize:10, color:'#a78bfa', marginTop:4 }}>📋 Tap to copy!</div>
            </div>
            <button onClick={onClose} style={{
              width:'100%', padding:'13px 0', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#0891b2)', color:'white',
              fontWeight:900, fontSize:15, cursor:'pointer', fontFamily:'inherit',
            }}>Keep Building! 🚀</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:'first',    icon:'🤖', title:'First Part!',     desc:'You added your first part!',           check:pp => pp.length >= 1 },
  { id:'wheels4',  icon:'🛞', title:'Wheel Master!',   desc:'4 wheels on your robot!',              check:pp => pp.filter(p=>p.catId==='wheels').length >= 4 },
  { id:'legs4',    icon:'🦵', title:'Leg Master!',     desc:'4 legs attached!',                     check:pp => pp.filter(p=>p.catId==='legs').length >= 4 },
  { id:'arm1',     icon:'🦾', title:'Armed Up!',       desc:'Got your first arm or tool!',          check:pp => pp.filter(p=>p.catId==='arms').length >= 1 },
  { id:'sensors5', icon:'👁️', title:'All Seeing!',     desc:'5 sensors! Nothing escapes you!',     check:pp => pp.filter(p=>p.catId==='sensors').length >= 5 },
  { id:'ai1',      icon:'🧠', title:'AI Expert!',      desc:'Added a brain! Smart robot!',          check:pp => pp.filter(p=>p.catId==='ai').length >= 1 },
  { id:'parts10',  icon:'⚙️', title:'Busy Builder!',   desc:'10 parts! Keep going!',                check:pp => pp.length >= 10 },
  { id:'parts20',  icon:'🏆', title:'Master Builder!', desc:'20 parts! Incredible robot!',          check:pp => pp.length >= 20 },
  { id:'deco3',    icon:'✨', title:'Looking Cool!',   desc:'3 decorations! So stylish!',           check:pp => pp.filter(p=>p.catId==='lighting').length >= 3 },
  { id:'armor2',   icon:'🛡️', title:'Tank Mode!',      desc:'2 armor pieces! Hard to beat!',       check:pp => pp.filter(p=>p.catId==='structure').length >= 2 },
];

// ─── Block-Based Coding System ────────────────────────────────────────────────
const BLOCK_CATS = [
  { id:'movement', label:'🏃 MOVE',    color:'#10b981' },
  { id:'action',   label:'⚡ ACTIONS', color:'#ef4444' },
  { id:'control',  label:'🔄 CONTROL', color:'#d97706' },
];

const BLOCK_TYPES = [
  // Movement
  { id:'move-forward',  cat:'movement', label:'MOVE FORWARD',  emoji:'⬆️', color:'#10b981', bg:'#d1fae5', hasVal:true,  unit:'steps', def:50 },
  { id:'move-backward', cat:'movement', label:'MOVE BACKWARD', emoji:'⬇️', color:'#059669', bg:'#d1fae5', hasVal:true,  unit:'steps', def:50 },
  { id:'turn-left',     cat:'movement', label:'TURN LEFT',     emoji:'↩️', color:'#3b82f6', bg:'#dbeafe', hasVal:true,  unit:'°',     def:90 },
  { id:'turn-right',    cat:'movement', label:'TURN RIGHT',    emoji:'↪️', color:'#2563eb', bg:'#dbeafe', hasVal:true,  unit:'°',     def:90 },
  { id:'jump',          cat:'movement', label:'JUMP',          emoji:'🦘', color:'#f59e0b', bg:'#fef3c7', hasVal:false, unit:null,    def:null },
  { id:'fly-up',        cat:'movement', label:'FLY UP',        emoji:'🚀', color:'#8b5cf6', bg:'#ede9fe', hasVal:true,  unit:'m',     def:20 },
  { id:'fly-down',      cat:'movement', label:'FLY DOWN',      emoji:'🛸', color:'#7c3aed', bg:'#ede9fe', hasVal:true,  unit:'m',     def:20 },
  { id:'spin',          cat:'movement', label:'SPIN AROUND',   emoji:'🌀', color:'#06b6d4', bg:'#cffafe', hasVal:true,  unit:'times', def:1 },
  // Actions
  { id:'grab',          cat:'action',   label:'GRAB',          emoji:'✊', color:'#ef4444', bg:'#fee2e2', hasVal:false, unit:null, def:null },
  { id:'release',       cat:'action',   label:'RELEASE',       emoji:'🤲', color:'#dc2626', bg:'#fee2e2', hasVal:false, unit:null, def:null },
  { id:'drill',         cat:'action',   label:'DRILL',         emoji:'🔩', color:'#f97316', bg:'#ffedd5', hasVal:false, unit:null, def:null },
  { id:'shoot-laser',   cat:'action',   label:'SHOOT LASER',   emoji:'⚡', color:'#a855f7', bg:'#f3e8ff', hasVal:false, unit:null, def:null },
  { id:'lights-on',     cat:'action',   label:'LIGHTS ON',     emoji:'💡', color:'#ca8a04', bg:'#fefce8', hasVal:false, unit:null, def:null },
  { id:'scan',          cat:'action',   label:'SCAN AREA',     emoji:'📡', color:'#0891b2', bg:'#cffafe', hasVal:false, unit:null, def:null },
  { id:'make-sound',    cat:'action',   label:'MAKE SOUND',    emoji:'🔊', color:'#16a34a', bg:'#dcfce7', hasVal:false, unit:null, def:null },
  // Control
  { id:'wait',          cat:'control',  label:'WAIT',          emoji:'⏱️', color:'#6b7280', bg:'#f3f4f6', hasVal:true,  unit:'sec',   def:1 },
  { id:'repeat',        cat:'control',  label:'REPEAT',        emoji:'🔄', color:'#d97706', bg:'#fef3c7', hasVal:true,  unit:'times', def:3 },
  { id:'repeat-forever',cat:'control',  label:'REPEAT FOREVER',emoji:'∞',  color:'#b45309', bg:'#fef3c7', hasVal:false, unit:null,    def:null },
];

const BLOCK_DURATIONS = {
  'move-forward':2,'move-backward':2,'turn-left':1,'turn-right':1,
  'jump':1.5,'fly-up':1.5,'fly-down':1.5,'spin':1.5,
  'grab':0.8,'release':0.5,'drill':1.5,'shoot-laser':0.8,
  'lights-on':0.3,'scan':1.2,'make-sound':0.5,
  'wait':1,'repeat':0.3,'repeat-forever':0.3,
};
const BLOCK_POWER = {
  'move-forward':3,'move-backward':3,'turn-left':2,'turn-right':2,
  'jump':8,'fly-up':10,'fly-down':5,'spin':4,
  'grab':5,'release':2,'drill':12,'shoot-laser':15,
  'lights-on':1,'scan':4,'make-sound':1,
  'wait':0.5,'repeat':0,'repeat-forever':0,
};

// ─── Code Editor Modal ────────────────────────────────────────────────────────
function CodeEditorModal({ isOpen, onClose, codeBlocks, setCodeBlocks }) {
  const [activeCat, setActiveCat] = useState('movement');

  const addBlock = (bt) => {
    setCodeBlocks(prev => [...prev, { uid:`${bt.id}_${Date.now()}`, ...bt, value:bt.def }]);
  };
  const removeBlock = (uid) => setCodeBlocks(prev => prev.filter(b => b.uid !== uid));
  const moveBlock   = (uid, dir) => setCodeBlocks(prev => {
    const idx = prev.findIndex(b => b.uid === uid);
    if (dir==='up'   && idx > 0)               { const n=[...prev]; [n[idx-1],n[idx]]=[n[idx],n[idx-1]]; return n; }
    if (dir==='down' && idx < prev.length - 1) { const n=[...prev]; [n[idx],n[idx+1]]=[n[idx+1],n[idx]]; return n; }
    return prev;
  });
  const updateVal = (uid, v) => setCodeBlocks(prev => prev.map(b => b.uid===uid ? {...b,value:Number(v)||1} : b));

  const toolboxBlocks = BLOCK_TYPES.filter(b => b.cat === activeCat);

  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:11000, display:'flex', flexDirection:'column',
      background:'#0f1629', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

      {/* Header */}
      <div style={{ height:52, flexShrink:0, display:'flex', alignItems:'center', gap:10,
        padding:'0 14px', background:'rgba(0,0,0,0.55)', borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
        <button onClick={onClose} style={{ padding:'6px 14px', borderRadius:8, border:'none',
          background:'rgba(255,255,255,0.12)', color:'white', fontWeight:800, fontSize:13,
          cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
        <div style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:900, color:'white' }}>🎮 Code Editor</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{codeBlocks.length} blocks</div>
      </div>

      {/* Two-column body */}
      <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>

        {/* LEFT: Toolbox */}
        <div style={{ width:'44%', flexShrink:0, display:'flex', flexDirection:'column',
          background:'rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
          {/* Category tabs */}
          <div style={{ display:'flex', padding:'8px 6px 0' }}>
            {BLOCK_CATS.map(cat => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                style={{ flex:1, padding:'6px 2px', borderRadius:'8px 8px 0 0', border:'none',
                  background: activeCat===cat.id ? '#1e2d4e' : 'transparent',
                  color: activeCat===cat.id ? 'white' : 'rgba(255,255,255,0.4)',
                  fontWeight:800, fontSize:9, cursor:'pointer', fontFamily:'inherit',
                  letterSpacing:'0.2px', transition:'all 0.1s' }}>
                {cat.label}
              </button>
            ))}
          </div>
          {/* Block list */}
          <div style={{ flex:1, overflowY:'auto', padding:'6px', display:'flex', flexDirection:'column', gap:5 }}>
            {toolboxBlocks.map(bt => (
              <button key={bt.id} onClick={() => addBlock(bt)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px',
                  borderRadius:10, border:`1.5px solid ${bt.color}33`,
                  background: bt.bg, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  transition:'transform 0.1s', boxShadow:`0 2px 6px ${bt.color}18` }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
              >
                <span style={{ fontSize:18, flexShrink:0 }}>{bt.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:900, color:bt.color, letterSpacing:'0.4px' }}>{bt.label}</div>
                  {bt.hasVal && <div style={{ fontSize:9, color:'#9ca3af' }}>value: {bt.def} {bt.unit}</div>}
                </div>
                <span style={{ fontSize:15, color:bt.color, fontWeight:900 }}>+</span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Program */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ padding:'9px 10px 4px', fontSize:10, fontWeight:800,
            color:'rgba(255,255,255,0.4)', letterSpacing:'0.8px' }}>
            YOUR PROGRAM — {codeBlocks.length} BLOCK{codeBlocks.length!==1?'S':''}
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'0 8px 8px', display:'flex', flexDirection:'column', gap:5 }}>
            {codeBlocks.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 16px', color:'rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>👈</div>
                <div style={{ fontSize:12, fontWeight:700 }}>Tap blocks on the left to add them!</div>
                <div style={{ fontSize:10, marginTop:5, lineHeight:1.4 }}>Stack blocks to build your robot's program.</div>
              </div>
            ) : codeBlocks.map((block, idx) => (
              <div key={block.uid}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 8px',
                  borderRadius:10, background:`${block.color}18`, border:`1.5px solid ${block.color}44` }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:700, minWidth:16 }}>{idx+1}</span>
                <span style={{ fontSize:16, flexShrink:0 }}>{block.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, fontWeight:900, color:block.color, letterSpacing:'0.4px' }}>{block.label}</div>
                  {block.hasVal && (
                    <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
                      <input type="number" value={block.value} min={1} max={360}
                        onChange={e => updateVal(block.uid, e.target.value)}
                        style={{ width:44, padding:'2px 4px', borderRadius:4, border:`1px solid ${block.color}44`,
                          background:'rgba(0,0,0,0.3)', color:'white', fontSize:11, fontWeight:700,
                          fontFamily:'inherit', outline:'none' }} />
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>{block.unit}</span>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:2 }}>
                  {['↑','↓'].map((arrow,ai) => (
                    <button key={arrow} onClick={() => moveBlock(block.uid, ai===0?'up':'down')}
                      disabled={(ai===0&&idx===0)||(ai===1&&idx===codeBlocks.length-1)}
                      style={{ width:20, height:20, borderRadius:4, border:'none',
                        background: ((ai===0&&idx===0)||(ai===1&&idx===codeBlocks.length-1)) ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                        color: ((ai===0&&idx===0)||(ai===1&&idx===codeBlocks.length-1)) ? 'rgba(255,255,255,0.2)' : 'white',
                        cursor: ((ai===0&&idx===0)||(ai===1&&idx===codeBlocks.length-1)) ? 'default' : 'pointer', fontSize:10 }}>
                      {arrow}
                    </button>
                  ))}
                  <button onClick={() => removeBlock(block.uid)}
                    style={{ width:20, height:20, borderRadius:4, border:'none',
                      background:'rgba(239,68,68,0.18)', color:'#f87171', cursor:'pointer', fontSize:10 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {codeBlocks.length > 0 && (
            <div style={{ padding:'6px 8px 10px' }}>
              <button onClick={() => setCodeBlocks([])}
                style={{ width:'100%', padding:'9px 0', borderRadius:10, border:'none',
                  background:'rgba(239,68,68,0.14)', color:'#fca5a5', fontWeight:800,
                  fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>
                🗑️ Clear All Blocks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Arena Challenges & Sim Helpers ──────────────────────────────────────────
const ARENA_CHALLENGES = [
  { id:'obstacle', name:'Obstacle Course', icon:'🏁', color:'#22c55e', obstacles:10, totalDist:22, difficulty:'Easy'   },
  { id:'speedrun',  name:'Speed Run',       icon:'⚡',  color:'#f59e0b', obstacles:5,  totalDist:16, difficulty:'Medium' },
  { id:'maze',      name:'Maze Navigator',  icon:'🌀', color:'#8b5cf6', obstacles:18, totalDist:30, difficulty:'Hard'   },
  { id:'collect',   name:'Cargo Run',       icon:'📦', color:'#0ea5e9', obstacles:6,  totalDist:20, difficulty:'Medium' },
];

const ROBOT_TYPE_TO_MOVEID = {
  spider:'legs', rover:'wheels', drone:'flying', humanoid:'legs',
  tracked:'tracks', hover:'hover', underwater:'hover', carrier:'jets',
};

function buildTestArena(scene, challenge) {
  const g = new THREE.Group(); g.name='arena';
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,65),new THREE.MeshStandardMaterial({color:0xf0f4ff,roughness:0.3,metalness:0.15}));
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; g.add(floor);
  const lineMat=new THREE.LineBasicMaterial({color:0xdde4ff});
  for(let i=-20;i<=20;i+=2){
    const h=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,0.01,i*1.6),new THREE.Vector3(20,0.01,i*1.6)]);
    const v=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-32),new THREE.Vector3(i,0.01,22)]);
    g.add(new THREE.Line(h,lineMat)); g.add(new THREE.Line(v,lineMat));
  }
  [{w:40,h:5,d:0.3,x:0,z:-32,ry:0,c:0x3b82f6},{w:40,h:5,d:0.3,x:0,z:22,ry:0,c:0x10b981},
   {w:65,h:5,d:0.3,x:-20.2,z:-5,ry:Math.PI/2,c:0x8b5cf6},{w:65,h:5,d:0.3,x:20.2,z:-5,ry:Math.PI/2,c:0xf59e0b},
  ].forEach(w=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w.w,w.h,w.d),new THREE.MeshStandardMaterial({color:w.c,roughness:0.45,metalness:0.3,emissive:new THREE.Color(w.c).multiplyScalar(0.07)}));
    m.position.set(w.x,w.h/2,w.z); m.rotation.y=w.ry; m.castShadow=true; m.receiveShadow=true; g.add(m);
  });
  const strMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.2});
  [-16,-10,-4,2,8,14].forEach(z=>{
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.7),strMat); s.position.set(-20.05,2.5,z); g.add(s);
    const s2=s.clone(); s2.position.set(20.05,2.5,z); g.add(s2);
  });
  const startM=new THREE.Mesh(new THREE.PlaneGeometry(6,2.5),new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.3}));
  startM.rotation.x=-Math.PI/2; startM.position.set(0,0.015,6); g.add(startM);
  const finM=new THREE.Mesh(new THREE.PlaneGeometry(7,2.5),new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.45}));
  finM.rotation.x=-Math.PI/2; finM.position.set(0,0.015,-24); g.add(finM);
  const archMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.4});
  [-2.8,2.8].forEach(x=>{const post=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,5.5,8),archMat);post.position.set(x,2.75,-24);g.add(post);});
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,6,8),archMat);bar.rotation.z=Math.PI/2;bar.position.set(0,5.5,-24);g.add(bar);
  const oc=[0x3b82f6,0xef4444,0x8b5cf6,0x10b981,0xf59e0b,0xec4899];
  const oPos=[[-1.1,-3],[1.0,-5.5],[-0.6,-8],[1.4,-10.5],[-1.0,-13],[0.5,-15.5],[-1.3,-5],[1.1,-7.5],[-0.4,-11],[0.9,-14],[-0.7,-9],[1.2,-12]];
  oPos.slice(0,challenge?.obstacles||10).forEach(([x,z],i)=>{
    const h=0.55+(i%3)*0.38; const col=oc[i%oc.length];
    const geos=[new THREE.BoxGeometry(0.8,h,0.8),new THREE.CylinderGeometry(0.38,0.38,h,8),new THREE.ConeGeometry(0.42,h+0.5,8)];
    const m=new THREE.Mesh(geos[i%3],new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.25,emissive:new THREE.Color(col).multiplyScalar(0.07)}));
    m.position.set(x,h/2,z); m.castShadow=true; m.receiveShadow=true; g.add(m);
  });
  [-6,-13,-20].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.09,8,32),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:0.9,transparent:true,opacity:0.85}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'+z; g.add(ring);
  });
  scene.add(g);
}

function getSimBlockDuration(block){
  const p=block.paramValues||{};
  switch(block.id){
    case 'move_forward':  return Math.max(0.4,(p.steps||2)*0.75);
    case 'move_backward': return Math.max(0.4,(p.steps||1)*0.75);
    case 'turn_left': case 'turn_right': return Math.max(0.25,(p.degrees||90)/90*0.6);
    case 'spin':   return 1.0;
    case 'wait':   return Math.max(0.2,p.seconds||1);
    case 'fly_up': case 'fly_down': return 0.9;
    case 'scan':   return 1.6;
    case 'grab': case 'release': return 0.9;
    case 'lights_on': case 'lights_off': return 0.3;
    default:       return 0.4;
  }
}

function applySimCodeBlock(block,rs,dt,movId){
  const p=block.paramValues||{};
  const dur=rs.currentDur||1;
  const spd=movId==='wheels'?1.0:movId==='tracks'?0.8:movId==='legs'?0.65:movId==='hover'?1.1:movId==='flying'?1.4:movId==='jets'?1.8:1.0;
  switch(block.id){
    case 'move_forward':{const d=(p.steps||2)*1.9*spd;rs.x+=Math.sin(rs.angle)*(d/dur)*dt;rs.z+=Math.cos(rs.angle)*(d/dur)*dt;rs.totalDist+=(d/dur)*dt;rs.bobPhase=(rs.bobPhase||0)+dt*8;break;}
    case 'move_backward':{const d=(p.steps||1)*1.9*spd;rs.x-=Math.sin(rs.angle)*(d/dur)*dt;rs.z-=Math.cos(rs.angle)*(d/dur)*dt;rs.totalDist+=(d/dur)*dt*0.5;rs.bobPhase=(rs.bobPhase||0)+dt*6;break;}
    case 'turn_left':  rs.angle+=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'turn_right': rs.angle-=((p.degrees||90)*Math.PI/180)/dur*dt; break;
    case 'spin':       rs.angle+=(Math.PI*2)/dur*dt; break;
    case 'fly_up':     rs.y=Math.min(4.5,(rs.y||0)+2.0/dur*dt); break;
    case 'fly_down':   rs.y=Math.max(0,(rs.y||0)-2.0/dur*dt); break;
    default: break;
  }
}

function getSimGroundEffect(movId,bobPhase,t){
  switch(movId){
    case 'legs':   return{yOffset:Math.abs(Math.sin(bobPhase*2.5))*0.12,rollZ:0};
    case 'hover':  return{yOffset:Math.sin(t*1.8)*0.15+0.25,rollZ:Math.sin(t*0.9)*0.04};
    case 'flying': case 'jets': return{yOffset:Math.sin(t*1.2)*0.1+0.3,rollZ:0};
    case 'tracks': return{yOffset:0,rollZ:Math.sin(bobPhase*1.5)*0.012};
    default:       return{yOffset:0,rollZ:Math.sin(bobPhase*1.5)*0.018};
  }
}

function translateCustomBlocks(customBlocks){
  const out=[];
  for(const block of(customBlocks||[])){
    const val=block.value??block.def??1;
    switch(block.id){
      case 'move-forward':  out.push({id:'move_forward', blockId:block.uid,label:`↑ Fwd ${val}`,  paramValues:{steps:Math.max(1,Math.round(val/25))}}); break;
      case 'move-backward': out.push({id:'move_backward',blockId:block.uid,label:`↓ Back ${val}`, paramValues:{steps:Math.max(1,Math.round(val/25))}}); break;
      case 'turn-left':     out.push({id:'turn_left',  blockId:block.uid,label:`↩ Left ${val}°`,  paramValues:{degrees:val}}); break;
      case 'turn-right':    out.push({id:'turn_right', blockId:block.uid,label:`↪ Right ${val}°`, paramValues:{degrees:val}}); break;
      case 'fly-up':        out.push({id:'fly_up',   blockId:block.uid,label:'🚀 Fly Up',  paramValues:{}}); break;
      case 'fly-down':      out.push({id:'fly_down', blockId:block.uid,label:'🛸 Fly Down', paramValues:{}}); break;
      case 'jump':          out.push({id:'fly_up',   blockId:block.uid,label:'🦘 Jump',    paramValues:{}}); break;
      case 'spin':{const t=Math.max(1,Math.min(5,val|0));for(let i=0;i<t;i++)out.push({id:'spin',blockId:`${block.uid}_${i}`,label:'🌀 Spin',paramValues:{}});break;}
      case 'grab':          out.push({id:'grab',    blockId:block.uid,label:'✊ Grab',    paramValues:{}}); break;
      case 'release':       out.push({id:'release', blockId:block.uid,label:'🤲 Release', paramValues:{}}); break;
      case 'drill':         out.push({id:'grab',    blockId:block.uid,label:'🔩 Drill',   paramValues:{}}); break;
      case 'shoot-laser':   out.push({id:'lights_on',blockId:block.uid,label:'⚡ Laser!',  paramValues:{}}); break;
      case 'lights-on':     out.push({id:'lights_on',blockId:block.uid,label:'💡 Lights',  paramValues:{}}); break;
      case 'scan':          out.push({id:'scan',    blockId:block.uid,label:'📡 Scan',    paramValues:{}}); break;
      case 'make-sound':    out.push({id:'wait',    blockId:block.uid,label:'🔊 Sound',   paramValues:{seconds:0.6}}); break;
      case 'wait':          out.push({id:'wait',    blockId:block.uid,label:`⏱ Wait ${val}s`,paramValues:{seconds:val}}); break;
      case 'repeat':{const t=Math.max(1,Math.min(10,val|0));out.push({id:'wait',blockId:block.uid,label:`🔄 Repeat ×${t}`,paramValues:{seconds:0.4}});break;}
      case 'repeat-forever':out.push({id:'wait',blockId:block.uid,label:'∞ Loop',paramValues:{seconds:0.3}}); break;
      default: break;
    }
  }
  return out;
}

// ─── Test Arena Canvas ────────────────────────────────────────────────────────
function TestArenaCanvas({
  chassisId,chassisScale,chassisColorOverride,
  placedParts,partColors,metalness,roughness,
  robotCode,movementId,running,challenge,onProgress,speedScale,resetKey,
}){
  const wrapRef=useRef(null);
  const runRef=useRef(false);
  const codeRef=useRef([]);
  const speedRef=useRef(1);
  const rsRef=useRef(null);

  useEffect(()=>{runRef.current=running;},[running]);
  useEffect(()=>{codeRef.current=robotCode||[];},[robotCode]);
  useEffect(()=>{speedRef.current=speedScale||1;},[speedScale]);
  // Reset sim state when resetKey changes (restart button / new run)
  useEffect(()=>{rsRef.current={x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100};},[resetKey]);

  // Three.js scene — re-init when chassis or challenge changes
  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const W=Math.max(el.clientWidth,1),H=Math.max(el.clientHeight,1);
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0xe8f0fe); scene.fog=new THREE.Fog(0xe8f0fe,32,58);
    const camera=new THREE.PerspectiveCamera(48,W/H,0.1,80); camera.position.set(0,4,10); camera.lookAt(0,0.5,0);
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xddeeff,0.72));
    const sun=new THREE.DirectionalLight(0xfff8f0,1.6); sun.position.set(8,18,10); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-26; sun.shadow.camera.right=26;
    sun.shadow.camera.top=32; sun.shadow.camera.bottom=-32; sun.shadow.bias=-0.001; scene.add(sun);
    scene.add(Object.assign(new THREE.PointLight(0x6699ff,0.8,36),{position:{x:-10,y:6,z:0}}));
    scene.add(Object.assign(new THREE.PointLight(0x99ffdd,0.65,30),{position:{x:10,y:5,z:-10}}));
    buildTestArena(scene,challenge);
    // Robot group — custom mesh built async
    const robotGroup=new THREE.Group();
    robotGroup.position.set(0,0,5); robotGroup.rotation.y=Math.PI; robotGroup.scale.setScalar(1.4);
    scene.add(robotGroup);
    if(!rsRef.current) rsRef.current={x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,done:false,t:0,bobPhase:0,battery:100};
    let cancelled=false;
    (async()=>{
      const gltf=await tryLoadChassisGltf(chassisId||'spider-scout'); if(cancelled) return;
      let cm;
      if(gltf){cm=normalizeGltfChassis(gltf);cm.scale.multiplyScalar(chassisScale||1.0);cm.userData.isGltf=true;}
      else{cm=buildChassisMeshFromStudio(chassisId||'spider-scout',chassisColorOverride);cm.scale.multiplyScalar(chassisScale||1.0);}
      // Color already baked for studio builds; only apply override to GLTF external models
      if(chassisColorOverride&&!cm.userData.studioBuild) cm.traverse(ch=>{if(ch.isMesh&&ch.material&&!ch.material.transparent){ch.material=ch.material.clone();ch.material.color=new THREE.Color(chassisColorOverride);}});
      if(!cancelled) robotGroup.add(cm);
      for(const pp of(placedParts||[])){
        if(cancelled) break;
        const def=findPartById(pp.partId); if(!def) continue;
        const mesh=createPartMesh(def,(partColors||{})[pp.uid]||null);
        mesh.position.set(...pp.pos); mesh.rotation.y=pp.rotY||0; robotGroup.add(mesh);
      }
    })();
    const camPos=new THREE.Vector3(0,4,10); const camLook=new THREE.Vector3(0,0.5,5);
    let prev=performance.now(); let rafId;
    const movId=movementId||'wheels';
    const tick=(now)=>{
      rafId=requestAnimationFrame(tick);
      const rawDt=Math.min((now-prev)/1000,0.05);
      const dt=rawDt*(speedRef.current||1);
      prev=now;
      const rs=rsRef.current; const code=codeRef.current;
      if(runRef.current&&rs&&!rs.done){
        rs.t+=dt; rs.battery=Math.max(0,100-rs.t*0.5);
        if(code.length>0){
          const block=code[rs.step];
          if(block){
            if(rs.stepTime===0) rs.currentDur=getSimBlockDuration(block);
            rs.stepTime+=dt; applySimCodeBlock(block,rs,dt,movId);
            if(rs.stepTime>=rs.currentDur){rs.step++;rs.stepTime=0;rs.currentDur=0;}
          }
          if(rs.step>=code.length) rs.done=true;
        }else{
          const spd=movId==='jets'?3.5:movId==='hover'?2.8:2.2;
          rs.angle=Math.PI+Math.sin(rs.totalDist*0.18)*0.28;
          rs.x+=Math.sin(rs.angle)*spd*dt; rs.z+=Math.cos(rs.angle)*spd*dt;
          rs.totalDist+=spd*dt; rs.bobPhase=(rs.bobPhase||0)+dt*8;
        }
        if(rs.z<=-25) rs.done=true;
        const{yOffset,rollZ}=getSimGroundEffect(movId,rs.bobPhase||0,rs.t);
        robotGroup.position.set(Math.max(-3.8,Math.min(3.8,rs.x)),yOffset+(rs.y||0),rs.z);
        robotGroup.rotation.y=rs.angle; robotGroup.rotation.z=rollZ;
        const totalSteps=code.length;
        const progress=rs.done?100:Math.min(totalSteps>0?(rs.step/totalSteps)*100:rs.totalDist/(challenge?.totalDist||22)*100,99);
        onProgress?.({time:rs.t,battery:rs.battery,progress,done:rs.done,step:rs.step,totalSteps,execBlock:code[rs.step]?.label||null});
      }else if(rs){
        rs.t+=rawDt*0.4;
        robotGroup.rotation.y=Math.PI+Math.sin(rs.t*0.7)*0.08;
        const{yOffset}=getSimGroundEffect(movId,0,rs.t); robotGroup.position.y=yOffset;
      }
      const rx=robotGroup.position.x,rz=robotGroup.position.z;
      const bx=rx+Math.sin((rs?.angle||Math.PI)+Math.PI)*7.5;
      const bz=rz+Math.cos((rs?.angle||Math.PI)+Math.PI)*7.5;
      camPos.lerp(new THREE.Vector3(Math.max(-18,Math.min(18,bx)),4.8,Math.max(-29,Math.min(19,bz))),0.045);
      camLook.lerp(new THREE.Vector3(rx,(robotGroup.position.y||0)+0.7,rz),0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);
      scene.traverse(c=>{if(c.name&&c.name.startsWith('cp')){c.rotation.z+=rawDt*0.9;if(c.material)c.material.emissiveIntensity=0.7+Math.sin((rs?.t||0)*3)*0.3;}});
      renderer.render(scene,camera);
    };
    rafId=requestAnimationFrame(tick);
    const onResize=()=>{const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const ro=new ResizeObserver(onResize); ro.observe(el);
    return()=>{cancelled=true;cancelAnimationFrame(rafId);ro.disconnect();if(el&&renderer.domElement.parentNode===el)el.removeChild(renderer.domElement);renderer.dispose();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[chassisId,challenge]);
  return <div ref={wrapRef} style={{width:'100%',height:'100%'}} />;
}

// ─── Test Mode Overlay ────────────────────────────────────────────────────────
function TestModeOverlay({
  isOpen,onClose,codeBlocks,
  chassisId,chassisScale,chassisColorOverride,
  placedParts,partColors,metalness,roughness,
  robotTypeId,
}){
  const [running,   setRunning]  = useState(false);
  const [paused,    setPaused]   = useState(false);
  const [done,      setDone]     = useState(false);
  const [speed,     setSpeed]    = useState(1);
  const [challenge, setChallenge]= useState(ARENA_CHALLENGES[0]);
  const [resetKey,  setResetKey] = useState(0);
  const [stats,     setStats]    = useState({time:0,battery:100,progress:0,step:0,totalSteps:0,execBlock:null,done:false});

  const translatedCode = useMemo(() => translateCustomBlocks(codeBlocks), [codeBlocks]);
  const movementId = ROBOT_TYPE_TO_MOVEID[robotTypeId] || 'wheels';

  const reset = useCallback(() => {
    setRunning(false); setPaused(false); setDone(false);
    setStats({time:0,battery:100,progress:0,step:0,totalSteps:0,execBlock:null,done:false});
    setResetKey(k => k+1);
  }, []);

  useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);

  const handleProgress = useCallback((p) => {
    setStats(p);
    if (p.done) setDone(true);
  }, []);

  const startRun = () => { reset(); setTimeout(() => { setRunning(true); setDone(false); }, 80); };

  if (!isOpen) return null;
  const batColor = stats.battery > 60 ? '#22c55e' : stats.battery > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:11000, display:'flex', flexDirection:'column',
      background:'#0f1629', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

      {/* Header */}
      <div style={{ height:50, flexShrink:0, display:'flex', alignItems:'center', gap:8,
        padding:'0 12px', background:'rgba(0,0,0,0.6)', borderBottom:'1px solid rgba(255,255,255,0.09)' }}>
        <button onClick={() => { reset(); onClose(); }}
          style={{ padding:'5px 12px', borderRadius:8, border:'none',
            background:'rgba(255,255,255,0.1)', color:'white', fontWeight:800,
            fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>← Stop</button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:900, color:'white' }}>
          {challenge.icon} {challenge.name}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{translatedCode.length} steps</div>
      </div>

      {/* Stats bar */}
      <div style={{ flexShrink:0, display:'flex', background:'rgba(0,0,0,0.45)',
        borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'6px 10px' }}>
        {[
          { emoji:'🔋', label:'BATTERY',  val:`${Math.round(stats.battery)}%`,   color:batColor    },
          { emoji:'⏱️', label:'TIME',     val:`${Math.round(stats.time)}s`,       color:'#60a5fa'   },
          { emoji:'📊', label:'PROGRESS', val:`${Math.round(stats.progress)}%`,   color:'#34d399'   },
          { emoji:'📋', label:'BLOCK',    val:stats.totalSteps>0?`${stats.step+1}/${stats.totalSteps}`:'—', color:'#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontSize:14 }}>{s.emoji}</div>
            <div style={{ fontSize:13, fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.35)', letterSpacing:'0.4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ height:3, background:'rgba(255,255,255,0.08)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${stats.progress}%`, transition:'width 0.4s',
          background:'linear-gradient(90deg,#3b82f6,#22c55e)' }} />
      </div>

      {/* Arena + side panel */}
      <div style={{ flex:1, minHeight:0, display:'flex' }}>

        {/* 3D Arena canvas */}
        <div style={{ flex:1, position:'relative', minWidth:0 }}>
          <TestArenaCanvas
            chassisId={chassisId} chassisScale={chassisScale}
            chassisColorOverride={chassisColorOverride} placedParts={placedParts}
            partColors={partColors} metalness={metalness} roughness={roughness}
            robotCode={translatedCode} movementId={movementId}
            running={running && !paused} challenge={challenge}
            onProgress={handleProgress} speedScale={speed} resetKey={resetKey}
          />
          {/* Current block badge */}
          {stats.execBlock && running && (
            <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)',
              background:'rgba(0,0,0,0.82)', borderRadius:12, padding:'6px 14px',
              fontSize:12, fontWeight:700, color:'white', whiteSpace:'nowrap',
              backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.12)', maxWidth:'90%' }}>
              {stats.execBlock}
            </div>
          )}
          {/* Completion overlay */}
          {done && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.55)', backdropFilter:'blur(3px)' }}>
              <div style={{ textAlign:'center', color:'white' }}>
                <div style={{ fontSize:52 }}>🏆</div>
                <div style={{ fontSize:20, fontWeight:900, marginTop:6 }}>Complete!</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:4 }}>
                  {Math.round(stats.time)}s · Battery {Math.round(stats.battery)}%
                </div>
              </div>
            </div>
          )}
          {/* No code overlay */}
          {translatedCode.length === 0 && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.72)', backdropFilter:'blur(4px)' }}>
              <div style={{ textAlign:'center', color:'white', padding:24 }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🎮</div>
                <div style={{ fontSize:17, fontWeight:900, marginBottom:6 }}>No code blocks!</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.4 }}>
                  Go back and use the<br/>Code Editor to add blocks.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: arena selector + translated program list */}
        <div style={{ width:130, flexShrink:0, background:'rgba(0,0,0,0.5)',
          borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ padding:'7px 6px 3px', fontSize:9, fontWeight:800,
            color:'rgba(255,255,255,0.4)', letterSpacing:'0.5px', textAlign:'center' }}>ARENA</div>
          {ARENA_CHALLENGES.map(ch => (
            <button key={ch.id} onClick={() => { if (!running) setChallenge(ch); }}
              style={{ margin:'2px 5px', padding:'6px 5px', borderRadius:8, border:'none',
                background: challenge.id===ch.id ? ch.color+'33' : 'transparent',
                color: challenge.id===ch.id ? ch.color : 'rgba(255,255,255,0.4)',
                fontWeight:800, fontSize:9, cursor: running?'default':'pointer', fontFamily:'inherit',
                outline: challenge.id===ch.id ? `1.5px solid ${ch.color}66` : 'none', textAlign:'left' }}>
              {ch.icon} {ch.name}
            </button>
          ))}
          <div style={{ padding:'7px 6px 3px', marginTop:3, fontSize:9, fontWeight:800,
            color:'rgba(255,255,255,0.4)', letterSpacing:'0.5px', textAlign:'center',
            borderTop:'1px solid rgba(255,255,255,0.07)' }}>PROGRAM</div>
          {translatedCode.length === 0 ? (
            <div style={{ padding:'10px 7px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:9, lineHeight:1.4 }}>
              No blocks.<br/>Add code first!
            </div>
          ) : translatedCode.map((block, idx) => (
            <div key={block.blockId||idx}
              style={{ margin:'2px 5px', padding:'4px 6px', borderRadius:7, fontSize:9, fontWeight:700, lineHeight:1.3,
                background: (running&&!done&&stats.step===idx) ? 'rgba(34,197,94,0.22)' : 'rgba(255,255,255,0.04)',
                color:      (running&&!done&&stats.step===idx) ? '#4ade80' : 'rgba(255,255,255,0.5)',
                border:     (running&&!done&&stats.step===idx) ? '1px solid rgba(34,197,94,0.35)' : '1px solid transparent',
                transition:'all 0.2s' }}>
              {block.label}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ flexShrink:0, padding:'8px 10px', background:'rgba(0,0,0,0.52)',
        borderTop:'1px solid rgba(255,255,255,0.09)', display:'flex', gap:7, alignItems:'center' }}>
        {(!running || done) ? (
          <button onClick={startRun} disabled={translatedCode.length===0}
            style={{ flex:2, padding:'11px 0', borderRadius:12, border:'none',
              background: translatedCode.length===0 ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#16a34a,#15803d)',
              color: translatedCode.length===0 ? 'rgba(255,255,255,0.3)' : 'white',
              fontWeight:900, fontSize:14, cursor: translatedCode.length===0 ? 'default' : 'pointer',
              fontFamily:'inherit', boxShadow: translatedCode.length===0 ? 'none' : '0 4px 16px rgba(22,163,74,0.4)' }}>
            {done ? '🔄 RUN AGAIN' : '▶️ RUN CODE'}
          </button>
        ) : (
          <>
            <button onClick={() => setPaused(p => !p)}
              style={{ flex:2, padding:'11px 0', borderRadius:12, border:'none',
                background: paused ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.1)',
                color:'white', fontWeight:900, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              {paused ? '▶️ RESUME' : '⏸ PAUSE'}
            </button>
            <button onClick={reset}
              style={{ flex:1, padding:'11px 0', borderRadius:12, border:'none',
                background:'rgba(255,255,255,0.07)', color:'white',
                fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>🔄</button>
          </>
        )}
        <button onClick={() => { const s=[0.5,1,2,3]; const i=s.indexOf(speed); setSpeed(s[(i+1)%s.length]); }}
          style={{ padding:'11px 10px', borderRadius:12, border:'none',
            background:'rgba(255,255,255,0.07)', color:'white',
            fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:'inherit', minWidth:50 }}>
          {speed}x⚡
        </button>
      </div>
    </div>
  );
}

// ─── Load Robots Modal ────────────────────────────────────────────────────────
function LoadRobotsModal({ isOpen, onClose, onLoad }) {
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try { setRobots(JSON.parse(localStorage.getItem('bytebuddies_robots') || '[]').reverse()); }
      catch(e) { setRobots([]); }
    }
  }, [isOpen]);

  const deleteRobot = (id) => {
    const upd = robots.filter(r => r.id !== id);
    localStorage.setItem('bytebuddies_robots', JSON.stringify([...upd].reverse()));
    setRobots(upd);
  };

  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:11000, background:'rgba(0,0,0,0.85)',
      display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(7px)' }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'linear-gradient(160deg,#0f1629 0%,#1a1040 100%)',
        borderRadius:24, width:340, maxHeight:'85vh', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
        animation:'bbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>

        {/* Header */}
        <div style={{ padding:'20px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize:18, fontWeight:900, color:'white', textAlign:'center' }}>📂 My Robots</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textAlign:'center', marginTop:3 }}>
            {robots.length} saved robot{robots.length!==1?'s':''} — most recent first
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', minHeight:0 }}>
          {robots.length === 0 ? (
            <div style={{ textAlign:'center', padding:'36px 0', color:'rgba(255,255,255,0.35)' }}>
              <div style={{ fontSize:52 }}>🤖</div>
              <div style={{ fontSize:14, marginTop:10, fontWeight:700, color:'rgba(255,255,255,0.5)' }}>No saved robots yet!</div>
              <div style={{ fontSize:11, marginTop:4 }}>Build one and hit SAVE.</div>
            </div>
          ) : robots.map(r => {
            const colors = [r.chassisColor||'#374151', r.accentColor||'#00d9ff', r.trimColor||'#3b82f6', r.glowColor||'#00d9ff'];
            return (
              <div key={r.id}
                style={{ borderRadius:14, marginBottom:10, overflow:'hidden',
                  border:'1px solid rgba(255,255,255,0.1)',
                  background:'rgba(255,255,255,0.05)' }}>
                {/* Color bar at top */}
                <div style={{ display:'flex', height:5 }}>
                  {colors.map((c, i) => <div key={i} style={{ flex:1, background:c }} />)}
                </div>
                <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
                  {/* Emoji badge */}
                  <div style={{ width:44, height:44, borderRadius:10, flexShrink:0,
                    background:`linear-gradient(135deg,${colors[0]}44,${colors[1]}44)`,
                    border:'1px solid rgba(255,255,255,0.12)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:24 }}>{r.emoji||'🤖'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:900, fontSize:13, color:'white',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:1 }}>
                      {r.type} · {r.parts} parts · {r.codeCount||0} code blocks
                    </div>
                    {r.description && (
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2, lineHeight:1.3,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.description}
                      </div>
                    )}
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:2 }}>{r.date}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                    <button onClick={() => { onLoad(r); onClose(); }}
                      style={{ padding:'6px 12px', borderRadius:8, border:'none',
                        background:'linear-gradient(135deg,#7c3aed,#0891b2)', color:'white', fontWeight:800,
                        fontSize:11, cursor:'pointer', fontFamily:'inherit',
                        boxShadow:'0 3px 10px rgba(124,58,237,0.4)' }}>Load</button>
                    <button onClick={() => deleteRobot(r.id)}
                      style={{ padding:'6px 12px', borderRadius:8, border:'none',
                        background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontWeight:700,
                        fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose}
            style={{ width:'100%', padding:'12px 0', borderRadius:12, border:'1.5px solid rgba(255,255,255,0.15)',
              background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:14,
              cursor:'pointer', fontFamily:'inherit' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ModularBuilderPage() {
  const [robotTypeId, setRobotTypeId] = useState('spider');
  const [variantId,   setVariantId  ] = useState('standard');
  const [sizeId,      setSizeId     ] = useState('medium');
  const [placedParts, setPlacedParts] = useState([]);
  const [selectedUid, setSelectedUid] = useState(null);
  const [partColors,  setPartColors ] = useState({});
  const [chassisColor,setChassisColor]= useState(null);
  const [metalness,   setMetalness  ] = useState(0.5);
  const [roughness,   setRoughness  ] = useState(0.5);
  const [cameraReset, setCameraReset] = useState(0);
  const [robotName,   setRobotName  ] = useState('My Robot');
  const [accentColor, setAccentColor] = useState(null);
  const [trimColor,   setTrimColor  ] = useState(null);
  const [glowColor,   setGlowColor  ] = useState(null);
  const [toasts,      setToasts     ] = useState([]);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [wizardStep,  setWizardStep ] = useState(0);
  const [pickerCat,   setPickerCat  ] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [partsModalOpen,  setPartsModalOpen ] = useState(false);
  const [saveDialogOpen,  setSaveDialogOpen ] = useState(false);
  const [codeEditorOpen,  setCodeEditorOpen ] = useState(false);
  const [testModeOpen,    setTestModeOpen   ] = useState(false);
  const [loadModalOpen,   setLoadModalOpen  ] = useState(false);
  const [codeBlocks,      setCodeBlocks     ] = useState([]);
  const [selectedBodyId,  setSelectedBodyId ] = useState(null);
  const earnedAchievements = useRef(new Set());
  const newPartUidRef      = useRef(null);   // signals WorkshopViewport to animate the newest part

  const addToast = useCallback((msg, type='ok') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id!==id)), type==='achievement'?4500:3200);
  }, []);

  const currentType    = getRobotType(robotTypeId);
  const currentVariant = useMemo(() => currentType?.variants.find(v=>v.id===variantId), [currentType,variantId]);
  const currentSize    = useMemo(() => SIZE_OPTIONS.find(s=>s.id===sizeId), [sizeId]);
  const chassisId      = selectedBodyId || currentVariant?.chassis || 'spider-scout';
  const chassisScale   = currentSize?.scale || 1.0;

  const stats = useMemo(() => {
    const base = { ...currentType.baseStats };
    if (currentVariant) Object.entries(currentVariant.mods).forEach(([k,v])=>{ base[k]=(base[k]||0)+v; });
    let totalWeight=0, totalPower=0;
    placedParts.forEach(pp => { totalWeight+=pp.weight||0; totalPower+=pp.pw||0; });
    const m = currentSize?.wMult || 1.0;
    return {
      weight: Math.round(totalWeight * m),
      power:  totalPower,
      speed:  Math.min(100, Math.max(0, base.spd||0)),
      agi:    Math.min(100, Math.max(0, base.agi||0)),
      dur:    Math.min(100, Math.max(0, base.dur||0)),
      intel:  Math.min(100, Math.max(0, base.pwr||50)),
    };
  }, [currentType, currentVariant, currentSize, placedParts]);

  const handleTypeChange = useCallback(id => {
    setRobotTypeId(id); setVariantId('standard');
    setPlacedParts([]); setSelectedUid(null);
    setPartColors({}); setChassisColor(null);
    setAccentColor(null); setTrimColor(null); setGlowColor(null);
    setSelectedBodyId(null); setCodeBlocks([]);
  }, []);

  const handleLoadRobot = useCallback((saved) => {
    if (saved.robotTypeId) setRobotTypeId(saved.robotTypeId);
    if (saved.variantId)   setVariantId(saved.variantId);
    if (saved.sizeId)      setSizeId(saved.sizeId);
    if (saved.chassisColor)setChassisColor(saved.chassisColor);
    if (saved.accentColor) setAccentColor(saved.accentColor);
    if (saved.trimColor)   setTrimColor(saved.trimColor);
    if (saved.glowColor)   setGlowColor(saved.glowColor);
    setPlacedParts(saved.placedParts || []);
    setCodeBlocks(saved.codeBlocks   || []);
    setSelectedUid(null); setSelectedBodyId(null);
    setRobotName(saved.name || 'My Robot');
    setWizardStep(4); // jump straight into the builder
    addToast(`📂 Loaded "${saved.name}"!`);
  }, [addToast]);

  const handleAddPart = useCallback((catId, part) => {
    // Body category: change the chassis mesh, don't add a placed 3D part
    if (catId === 'body') {
      const newChassis = BODY_TO_CHASSIS_MAP[part.id] || currentVariant?.chassis || 'spider-scout';
      setSelectedBodyId(newChassis);
      addToast(`${part.emoji||'🤖'} Body changed: ${part.n}!`);
      setCelebration({ emoji: part.emoji || '🤖' });
      setTimeout(() => setCelebration(null), 900);
      return;
    }
    // Get slot cap from robot catalog first, fall back to SLOT_CAPS
    const robotCatDef = ROBOT_PARTS_CATALOG[robotTypeId]?.[catId];
    const cap  = robotCatDef?.cap ?? (SLOT_CAPS[robotTypeId]?.[catId] ?? 4);
    const cnt  = placedParts.filter(p=>p.catId===catId).length;
    if (cnt>=cap) { addToast(`${part.n}: slot full! (${cap} max)`, 'error'); return; }
    const uid = `${part.id}_${Date.now()}`;
    // 'tools' category uses arm socket positions for placement
    const posCatId = catId === 'tools' ? 'arms' : catId;
    const { pos, socketRotY } = getDefaultPosAndRot(posCatId, cnt, robotTypeId);
    const newPart = { uid, partId:part.id, name:part.n, emoji:part.emoji||'⚙️',
      catId, pos, rotY:socketRotY, weight:part.weight||0, pw:part.pw||0,
      spd:part.spd||0, dur:part.dur||0 };
    const newParts = [...placedParts, newPart];
    // Signal viewport to animate this part snapping in
    newPartUidRef.current = uid;
    setPlacedParts(newParts);
    setSelectedUid(uid);
    addToast(`${part.emoji||'⚙️'} Added ${part.n}!`);
    setCelebration({ emoji: part.emoji || '🎉' });
    setTimeout(() => setCelebration(null), 900);
    // Check achievements
    ACHIEVEMENTS.forEach(ach => {
      if (!earnedAchievements.current.has(ach.id) && ach.check(newParts)) {
        earnedAchievements.current.add(ach.id);
        setTimeout(() => addToast(`${ach.icon} ACHIEVEMENT: ${ach.title} — ${ach.desc}`, 'achievement'), 600);
      }
    });
  }, [robotTypeId, placedParts, addToast, currentVariant]);

  const handlePartMove = useCallback((uid, pos) => {
    setPlacedParts(prev => prev.map(p => p.uid===uid ? {...p, pos} : p));
  }, []);

  const handleRemovePart = useCallback(uid => {
    setPlacedParts(prev => prev.filter(p=>p.uid!==uid));
    setSelectedUid(null); addToast('Part removed','info');
  }, [addToast]);

  const handleClonePart = useCallback(uid => {
    const src = placedParts.find(p=>p.uid===uid); if (!src) return;
    const caps = SLOT_CAPS[robotTypeId] || {};
    const cap  = caps[src.catId]??4;
    const cnt  = placedParts.filter(p=>p.catId===src.catId).length;
    if (cnt>=cap) { addToast('Slot full — cannot clone','error'); return; }
    const newUid = `${src.partId}_${Date.now()}`;
    setPlacedParts(prev => [...prev, {...src, uid:newUid, pos:[src.pos[0]+0.15, src.pos[1], src.pos[2]+0.15]}]);
    setSelectedUid(newUid); addToast(`Cloned ${src.name}`);
  }, [placedParts, robotTypeId, addToast]);

  const handleSave = useCallback(() => addToast('Robot saved! 🎉','ok'), [addToast]);

  // ── Wizard steps (0–3) — wrapped in bounded height so NEXT button stays visible ──
  if (wizardStep < 4) {
    let wizardChild;
    if (wizardStep === 0) wizardChild = (
      <WizardNameStep robotName={robotName} setRobotName={setRobotName}
        onNext={()=>setWizardStep(1)} />
    );
    else if (wizardStep === 1) wizardChild = (
      <WizardTypeStep robotTypeId={robotTypeId} onTypeChange={handleTypeChange}
        onBack={()=>setWizardStep(0)} onNext={()=>setWizardStep(2)} />
    );
    else if (wizardStep === 2) wizardChild = (
      <WizardStyleStep robotTypeId={robotTypeId} variantId={variantId}
        onVariantChange={setVariantId} onBack={()=>setWizardStep(1)} onNext={()=>setWizardStep(3)} />
    );
    else wizardChild = (
      <WizardSizeStep sizeId={sizeId} onSizeChange={setSizeId}
        onBack={()=>setWizardStep(2)} onNext={()=>setWizardStep(4)} />
    );
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden',
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
        {wizardChild}
      </div>
    );
  }

  // ── Builder (step 4) — GAME MODE ──
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0,
      overflow:'hidden', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      background:'#1e2d4e' }}>

      {/* ── Minimal Header (50px) ── */}
      <div style={{ height:50, flexShrink:0, display:'flex', alignItems:'center', gap:8,
        padding:'0 10px', background:'rgba(20,32,62,0.97)',
        borderBottom:'1px solid rgba(100,140,220,0.2)' }}>
        <button onClick={()=>setWizardStep(0)} style={{
          padding:'5px 12px', borderRadius:8, border:'none',
          background:'rgba(255,255,255,0.1)', color:'white', fontWeight:800,
          fontSize:13, cursor:'pointer', fontFamily:'inherit', flexShrink:0,
        }}>← Back</button>
        <div style={{ flex:1, textAlign:'center', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14, fontWeight:900, color:'white' }}>{robotName}</span>
            <span style={{ fontSize:13 }}>{currentType?.emoji}</span>
            <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{placedParts.length}pts</span>
          </div>
          {/* Mini color swatches row */}
          <div style={{ display:'flex', gap:3, marginTop:2 }}>
            {[chassisColor||'#374151', accentColor||'#00d9ff', trimColor||'#3b82f6', glowColor||'#00d9ff'].map((c, i) => (
              <div key={i} onClick={()=>setColorModalOpen(true)} style={{
                width:14, height:14, borderRadius:3, background:c, cursor:'pointer',
                border:'1.5px solid rgba(255,255,255,0.2)',
                boxShadow:`0 1px 3px ${c}55`, transition:'transform 0.1s',
              }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.3)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              />
            ))}
          </div>
        </div>
        <button onClick={()=>setCameraReset(n=>n+1)} title="Reset camera" style={{
          width:30, height:30, borderRadius:8, border:'none', cursor:'pointer',
          background:'rgba(255,255,255,0.1)', color:'white', fontSize:14,
          fontWeight:700, flexShrink:0,
        }}>↺</button>
        <button onClick={()=>{ setPlacedParts([]); setSelectedUid(null); setPartColors({});
          addToast('Cleared!','info'); }} title="Clear all parts" style={{
          width:30, height:30, borderRadius:8, border:'none', cursor:'pointer',
          background:'rgba(239,68,68,0.28)', color:'#fca5a5', fontSize:13,
          fontWeight:700, flexShrink:0,
        }}>✕</button>
      </div>

      {/* ── Robot Viewport — FULL WIDTH, fills all remaining space ── */}
      <div style={{ flex:1, minHeight:0, overflow:'hidden', background:'#3d4f72' }}>
        <WorkshopViewport
          chassisId={chassisId} chassisScale={chassisScale}
          chassisColorOverride={chassisColor}
          accentColorOverride={accentColor}
          trimColorOverride={trimColor}
          glowColorOverride={glowColor}
          placedParts={placedParts}
          partColors={partColors} selectedUid={selectedUid}
          onPartClick={setSelectedUid} onPartMove={handlePartMove}
          cameraReset={cameraReset} metalness={metalness} roughness={roughness}
          newPartUidRef={newPartUidRef}
        />
      </div>

      {/* ── 6 Action Buttons (2 rows of 3) ── */}
      <div style={{ flexShrink:0, background:'rgba(20,32,62,0.97)', borderTop:'1px solid rgba(100,140,220,0.25)' }}>
        <div style={{ height:60, display:'flex' }}>
          <ActionButton emoji="➕" label="ADD PART" color="#a855f7"
            onClick={()=>setPartsModalOpen(true)} />
          <ActionButton emoji="🎮" label="CODE" color="#f59e0b"
            onClick={()=>setCodeEditorOpen(true)} />
          <ActionButton emoji="▶️" label="TEST" color="#0891b2"
            onClick={()=>setTestModeOpen(true)} />
        </div>
        <div style={{ height:60, display:'flex', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <ActionButton emoji="🎨" label="COLOR" color="#ec4899"
            onClick={()=>setColorModalOpen(true)} />
          <ActionButton emoji="💾" label="SAVE" color="#22c55e"
            onClick={()=>setSaveDialogOpen(true)} />
          <ActionButton emoji="📂" label="LOAD" color="#d97706"
            onClick={()=>setLoadModalOpen(true)} />
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      <PartsCarouselModal
        isOpen={partsModalOpen} onClose={()=>setPartsModalOpen(false)}
        robotTypeId={robotTypeId} placedParts={placedParts} onAddPart={handleAddPart}
      />
      <ColorModal
        isOpen={colorModalOpen} onClose={()=>setColorModalOpen(false)}
        chassisColor={chassisColor} setChassisColor={setChassisColor}
        accentColor={accentColor} setAccentColor={setAccentColor}
        trimColor={trimColor} setTrimColor={setTrimColor}
        glowColor={glowColor} setGlowColor={setGlowColor}
        selectedUid={selectedUid} partColors={partColors} setPartColors={setPartColors}
        metalness={metalness} roughness={roughness}
        setMetalness={setMetalness} setRoughness={setRoughness}
      />
      <SaveDialog
        isOpen={saveDialogOpen} onClose={()=>setSaveDialogOpen(false)}
        robotName={robotName} setRobotName={setRobotName}
        partCount={placedParts.length} robotType={currentType}
        robotTypeId={robotTypeId} variantId={variantId} sizeId={sizeId}
        chassisColor={chassisColor} accentColor={accentColor}
        trimColor={trimColor} glowColor={glowColor}
        placedParts={placedParts} codeBlocks={codeBlocks}
      />
      <CodeEditorModal
        isOpen={codeEditorOpen} onClose={()=>setCodeEditorOpen(false)}
        codeBlocks={codeBlocks} setCodeBlocks={setCodeBlocks}
      />
      <TestModeOverlay
        isOpen={testModeOpen} onClose={()=>setTestModeOpen(false)}
        codeBlocks={codeBlocks} robotTypeId={robotTypeId}
        chassisId={chassisId} chassisScale={chassisScale}
        chassisColorOverride={chassisColor}
        placedParts={placedParts} partColors={partColors}
        metalness={metalness} roughness={roughness}
      />
      <LoadRobotsModal
        isOpen={loadModalOpen} onClose={()=>setLoadModalOpen(false)}
        onLoad={handleLoadRobot}
      />
      <ConfettiOverlay celebration={celebration} />

      {/* ── Toasts ── */}
      <div style={{ position:'fixed', bottom:80, right:14, zIndex:9999,
        display:'flex', flexDirection:'column', gap:6,
        alignItems:'flex-end', pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: t.type==='achievement' ? '10px 16px' : '7px 14px',
            borderRadius: t.type==='achievement' ? 12 : 8,
            fontSize: t.type==='achievement' ? 13 : 11,
            fontWeight:700, color:'white',
            background: t.type==='achievement'
              ? 'linear-gradient(135deg,#f59e0b,#d97706)'
              : t.type==='error' ? '#dc2626'
              : t.type==='info'  ? '#374151' : '#7c3aed',
            boxShadow: t.type==='achievement'
              ? '0 4px 20px rgba(245,158,11,0.5)'
              : '0 3px 12px rgba(0,0,0,0.18)',
            animation:'bbSlide 0.25s ease',
            border: t.type==='achievement' ? '2px solid #fcd34d' : 'none',
            maxWidth:280,
          }}>{t.msg}</div>
        ))}
      </div>
      <style>{`
        @keyframes bbSlide{from{transform:translateX(32px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes bbSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes celebPop{
          0%  {transform:scale(0) rotate(-15deg);opacity:0}
          50% {transform:scale(1.3) rotate(5deg);opacity:1}
          80% {transform:scale(1.1) rotate(0deg);opacity:1}
          100%{transform:scale(0.8) rotate(0deg);opacity:0}
        }
        @keyframes confettiBurst{
          0%  {transform:translate(-50%,-50%) rotate(0deg);opacity:1}
          100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) rotate(var(--rot));opacity:0}
        }
      `}</style>
    </div>
  );
}
