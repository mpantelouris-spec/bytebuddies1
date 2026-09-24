/**
 * Kid-facing render contract shared by every Visual Bible mission.
 * It is intentionally restrictive: readability wins over scene density.
 */
import * as THREE from 'three';
import { getMissionArtDirection } from './MissionVisualBibleV2.js';
import { getRobotDeepRenderSpec } from './RobotChapterDeepSpec.js';
import { isPrimaryStudioChassis } from '../../data/primary-robot-studio.js';

export const KID_CLARITY_VERSION = '2026-09-06-v4';

/** Per-robot visual identity — shape & silhouette, NOT just palette swaps. */
export const CHASSIS_VISUAL_DNA = {
  crawler: {
    label: 'Mars red-dirt hills',
    floorKind: 'martian_dirt',
    sky: 0xffc9a6, ground: 0xc65f45, fog: 0xf4a47d,
    surroundings: 'Peach Mars sky, twin tiny moons, one round mesa silhouette. Red dusty ground with tread marks — never grey concrete.',
    pathStyle: 'Wide rust-dirt track with soft ruts, no neon glow',
    signatureProp: 'NASA-style flag or mesa summit',
  },
  spacerover: {
    label: 'Grey lunar surface',
    floorKind: 'lunar_grey',
    sky: 0x0a0a1a, ground: 0x9ca3af, fog: 0x6b7280,
    surroundings: 'Black starfield sky with Earth blue marble on horizon. Grey cratered ground — different from orange Mars.',
    pathStyle: 'Pale grey regolith with boot-print texture',
    signatureProp: 'Satellite dish or sample station',
  },
  miningbot: {
    label: 'Underground mine tunnel',
    floorKind: 'mine_tunnel',
    sky: 0x2a1810, ground: 0x4a3728, fog: 0x3d2817,
    surroundings: 'Low rock tunnel walls on both sides with amber work lights. Dark ceiling — NOT open sky factory.',
    pathStyle: 'Gravel track with mine-cart rails',
    signatureProp: 'Glowing crystal cluster or drill site',
  },
  securitybot: {
    label: 'Neo City Central',
    floorKind: 'city_plaza',
    sky: 0x87ceeb, ground: 0xe2e8f0, fog: 0xb8d4e8,
    surroundings: 'Bright futuristic city — white rounded towers, cherry blossoms, monorail, ByteBuddies HQ spire, canals and parks.',
    pathStyle: 'Clean white paving with turquoise patrol markers and orange accents',
    signatureProp: 'Holographic security checkpoint arch',
  },
  farmbot: {
    label: 'Outdoor farm field',
    floorKind: 'farm_field',
    sky: 0x87ceeb, ground: 0x6b8e23, fog: 0xb8d4e8,
    surroundings: 'Bright blue sky, red barn silhouette on horizon, green rolling hills. Brown soil furrows — NOT factory floor.',
    pathStyle: 'Brown soil rows between green crop strips',
    signatureProp: 'Hay bale or apple tree',
  },
  factorybot: {
    label: 'Factory assembly floor',
    floorKind: 'factory_floor',
    sky: 0xcfe8ff, ground: 0x6b7280, fog: 0xdbeafe,
    surroundings: 'Indoor factory with overhead crane silhouette and ONE conveyor belt along the wall.',
    pathStyle: 'Grey concrete with yellow centre stripe',
    signatureProp: 'Assembly robot arm or conveyor drop zone',
  },
  robotarm: {
    label: 'Clean workbench lab',
    floorKind: 'lab_grid',
    sky: 0xe0f2fe, ground: 0xf1f5f9, fog: 0xe2e8f0,
    surroundings: 'White lab walls, pegboard tool silhouette, magnifying lamp arm. Clinical and precise.',
    pathStyle: 'White grid mat with blue alignment lines',
    signatureProp: 'Microchip tray or precision target pad',
  },
  legobot: {
    label: 'LEGO play mat',
    floorKind: 'stud_mat',
    sky: 0xfff7ed, ground: 0xfef08a, fog: 0xfde68a,
    surroundings: 'Colourful stud mat floor pattern, giant LEGO brick wall silhouette. Playroom mood.',
    pathStyle: 'Yellow stud mat with red brick lane markers',
    signatureProp: 'Oversized 2×4 brick stack',
  },
  droid: {
    label: 'Humanoid training gym',
    floorKind: 'gym_mats',
    sky: 0xe0e7ff, ground: 0xc7d2fe, fog: 0xe0e7ff,
    surroundings: 'Indoor gym with blue wall pads and balance beam silhouette. Sports hall windows.',
    pathStyle: 'Blue exercise mat path with white lane tape',
    signatureProp: 'Balance beam or hurdle bar',
  },
  mech: {
    label: 'Industrial scrap yard',
    floorKind: 'scrap_yard',
    sky: 0x78716c, ground: 0x57534e, fog: 0xa8a29e,
    surroundings: 'Outdoor yard with stacked metal beams and a crane hook silhouette. Overcast industrial sky.',
    pathStyle: 'Cracked concrete with oil stains and yellow caution paint',
    signatureProp: 'Shipping container or hydraulic press',
  },
  spider: {
    label: 'Vertical climb shaft',
    floorKind: 'climb_shaft',
    sky: 0x1e1b4b, ground: 0x64748b, fog: 0xc4b5fd,
    surroundings: 'Brick or pipe wall fills the background — camera tilts vertical. Shaft light from above.',
    pathStyle: 'Wall holds and web-strand guides (not a flat floor path)',
    signatureProp: 'Ceiling hook or web bridge',
  },
  stealth: {
    label: 'Night rooftop',
    floorKind: 'rooftop_tar',
    sky: 0x1e1b4b, ground: 0x1f2937, fog: 0x312e81,
    surroundings: 'Purple night sky, moon, simple city skyline black silhouette. Tar rooftop surface.',
    pathStyle: 'Dark rooftop with pink laser grid lines',
    signatureProp: 'Hack terminal or ventilation unit',
  },
  ninja: {
    label: 'Japanese temple roof',
    floorKind: 'temple_tiles',
    sky: 0x1e1b4b, ground: 0x44403c, fog: 0x312e81,
    surroundings: 'Night sky with red torii gate silhouette and lantern glow. Curved tile roof sections.',
    pathStyle: 'Dark tiles with moonlit edge highlights',
    signatureProp: 'Torii gate or training dummy',
  },
  submarine: {
    label: 'Shallow coral bay',
    floorKind: 'sandy_seabed',
    sky: 0x67e8f9, ground: 0xf5d58a, fog: 0x5eead4,
    surroundings: 'Bright teal water, sun rays from surface, sandy floor. Two pink coral mounds — not factory grey.',
    pathStyle: 'Sandy seabed trail with bubble trail',
    signatureProp: 'Coral arch or treasure chest',
  },
  deepseabot: {
    label: 'Deep ocean trench',
    floorKind: 'abyss_rock',
    sky: 0x0c4a6e, ground: 0x1e293b, fog: 0x0f172a,
    surroundings: 'Dark blue water with ONE bioluminescent jellyfish silhouette. Rocky trench walls. Sub headlight cone.',
    pathStyle: 'Rocky ledge path with depth meter HUD',
    signatureProp: 'Thermal vent or ancient ruin door',
  },
  rescuedrone: {
    label: 'Disaster city street',
    floorKind: 'rubble_street',
    sky: 0xfed7aa, ground: 0x78716c, fog: 0xffedd5,
    surroundings: 'Smoke-haze orange sky, collapsed building silhouettes, cracked road. Heroic rescue mood.',
    pathStyle: 'Cracked asphalt with orange cone markers',
    signatureProp: 'Survivor marker or medkit drop zone',
    aerialVista: 'bioluminescent_trench',
  },
  medbot: {
    label: 'Hospital corridor',
    floorKind: 'hospital_tile',
    sky: 0xf8fafc, ground: 0xe2e8f0, fog: 0xf1f5f9,
    surroundings: 'Clean white hospital ceiling lights, blue cross signs on walls. Polished tile floor — NOT street.',
    pathStyle: 'White-blue checker tile corridor',
    signatureProp: 'Hospital bed or gurney station',
  },
  firebot: {
    label: 'Burning city block',
    floorKind: 'wet_street',
    sky: 0x7f1d1d, ground: 0x374151, fog: 0x991b1b,
    surroundings: 'Orange smoke sky, cartoon fire glow on one building, reflective puddles on street.',
    pathStyle: 'Wet dark asphalt reflecting fire light',
    signatureProp: 'Fire hydrant or burning doorway',
  },
  drone: {
    label: 'Gothic clockwork spire',
    floorKind: 'open_sky',
    sky: 0xc4782a, ground: 0x000000, fog: 0x8b6914,
    surroundings: 'Wrought-iron clock tower with spinning brass gears and flying buttresses. Deep contact shadows.',
    pathStyle: 'Floating holo rings between gear arches',
    signatureProp: 'Clock ring or brass spire beacon',
    aerialVista: 'gothic_clockwork_spire',
  },
  helicopter: {
    label: 'Venetian midnight canal',
    floorKind: 'open_sky',
    sky: 0x1e3a5f, ground: 0x000000, fog: 0x1e293b,
    surroundings: 'Moonlit Italian canal with reflective water mirroring warm palazzo windows.',
    pathStyle: 'Bridge hops over dark rippling water',
    signatureProp: 'Canal bridge lamp or campanile',
    aerialVista: 'venetian_midnight_canal',
  },
  hoverbot: {
    label: 'Cybernetic assembly line',
    floorKind: 'open_sky',
    sky: 0x78716c, ground: 0x000000, fog: 0x57534e,
    surroundings: 'Abandoned factory with conveyor belts, robot arms, and falling debris sparks.',
    pathStyle: 'Conveyor lane gates between robot arms',
    signatureProp: 'Assembly arm or spark vent',
    aerialVista: 'cybernetic_assembly_line',
  },
  jetplane: {
    label: 'Low-orbit stealth carrier',
    floorKind: 'open_sky',
    sky: 0x0f172a, ground: 0x000000, fog: 0x020617,
    surroundings: 'Space hangar bay with metallic drones, Earth limb glow, and HDRI sheen on hull plates.',
    pathStyle: 'High-speed ring gates over carrier deck',
    signatureProp: 'Stealth drone or command island',
    aerialVista: 'low_orbit_stealth_carrier',
  },
  steathjet: {
    label: 'Storm obsidian citadel',
    floorKind: 'open_sky',
    sky: 0x1e1b4b, ground: 0x000000, fog: 0x1e293b,
    surroundings: 'Wet obsidian fortress towers in heavy volumetric storm fog. Clearcoat wet surfaces.',
    pathStyle: 'Stealth corridor between dark spires',
    signatureProp: 'Obsidian tower or storm fog bank',
    aerialVista: 'obsidian_citadel',
  },
  aerobat: {
    label: 'Overgrown monastic ruins',
    floorKind: 'open_sky',
    sky: 0xfcd34d, ground: 0x000000, fog: 0xd9f99d,
    surroundings: 'Ancient moss-covered cathedral with ivy columns and crumbling stone walls.',
    pathStyle: 'Smoke ring course through ruin arches',
    signatureProp: 'Bell tower or moss-covered column',
    aerialVista: 'monastic_ruins',
  },
  racedrone: {
    label: 'Neon server necropolis',
    floorKind: 'open_sky',
    sky: 0x1e293b, ground: 0x000000, fog: 0x0f172a,
    surroundings: 'Dark cybersecurity labyrinth of glowing server racks and streaming data LEDs.',
    pathStyle: 'Neon data-pylon ribbon with speed rings',
    signatureProp: 'Server rack or data stream arch',
    aerialVista: 'neon_server_necropolis',
  },
  hoverracer: {
    label: 'Quantum reactor core',
    floorKind: 'open_sky',
    sky: 0x4c1d95, ground: 0x000000, fog: 0x312e81,
    surroundings: 'High-contrast reactor interior with spinning hex energy rings and plasma core.',
    pathStyle: 'Floating hex lane with warp corners',
    signatureProp: 'Hex energy cell or reactor pylon',
    aerialVista: 'quantum_reactor_core',
  },
  tank: {
    label: 'Desert combat yard',
    floorKind: 'desert_sand',
    sky: 0xfed7aa, ground: 0xd97706, fog: 0xfde68a,
    surroundings: 'Sandy desert training ground with bunker walls — NOT boxing ring canvas for defense modes.',
    pathStyle: 'Sandy lane between concrete bunkers',
    signatureProp: 'Fortress core or target dummy',
  },
  battlebot: {
    label: 'Mech combat arena',
    floorKind: 'combat_ring',
    sky: 0x1e293b, ground: 0x374151, fog: 0x475569,
    surroundings: 'Dark stadium with neon trim. Elevated metal ring — industrial combat, not sand colosseum.',
    pathStyle: 'Metal grating ring platform',
    signatureProp: 'Energy core or opponent mech',
  },
  striker: {
    label: 'Boxing stadium',
    floorKind: 'combat_ring',
    sky: 0x7c3aed, ground: 0xf5f5f4, fog: 0xc4b5fd,
    surroundings: 'Classic boxing stadium spotlights, crowd colour blobs, canvas ring centre.',
    pathStyle: 'Boxing canvas with rope square',
    signatureProp: 'Punching bag or opponent boxer',
  },
  blaster: {
    label: 'Magic elemental arena',
    floorKind: 'combat_ring',
    sky: 0x312e81, ground: 0x4c1d95, fog: 0x4338ca,
    surroundings: 'Mystical purple arena with floating rune circles and elemental colour orbs.',
    pathStyle: 'Runed stone circle platform',
    signatureProp: 'Spell target crystal or mana fountain',
  },
  berserker: {
    label: 'Rage pit arena',
    floorKind: 'combat_ring',
    sky: 0x7f1d1d, ground: 0x292524, fog: 0x991b1b,
    surroundings: 'Dark pit with orange lava glow cracks below the ring. Aggressive red spotlight.',
    pathStyle: 'Obsidian ring with crack glow',
    signatureProp: 'Training dummy or rage totem',
  },
  birdbot: {
    label: 'Cartoon flappy sky',
    floorKind: 'flappy_scroll',
    sky: 0x87ceeb, ground: 0x22c55e, fog: 0x87ceeb,
    surroundings: 'Flat cartoon blue sky, scrolling green hills, chunky green pipes.',
    pathStyle: 'Side-scroll lane with pipe gaps',
    signatureProp: 'Slingshot or nest goal',
  },
  custom: {
    label: 'School robotics mat',
    floorKind: 'lab_grid',
    sky: 0xe0f2fe, ground: 0xf8fafc, fog: 0xe0f2fe,
    surroundings: 'White lab with coloured zone squares on the mat. Bulletin board silhouette.',
    pathStyle: 'Tape path on white mat',
    signatureProp: 'Checkpoint flag or trophy podium',
  },
  rover: {
    label: 'Garden maze path',
    floorKind: 'farm_field',
    sky: 0x87ceeb, ground: 0x86efac, fog: 0xbbf7d0,
    surroundings: 'Sunny garden with hedges and a greenhouse silhouette.',
    pathStyle: 'Flower-bordered dirt path',
    signatureProp: 'Sunflower arch',
  },
  scout: {
    label: 'Speed-gate lot',
    floorKind: 'asphalt_lot',
    sky: 0x38bdf8, ground: 0x334155, fog: 0x7dd3fc,
    surroundings: 'Open practice lot with cyan gates and painted lines.',
    pathStyle: 'Asphalt with cyan speed stripes',
    signatureProp: 'Cyan gate',
  },
};

export const KID_FAMILY_PROFILES = {
  martian: {
    style: 'Mars playground', budget: ['route', 'landmark', 'goal'],
    maxLandmarks: 1, effect: 'warm_haze', skyRatio: 0.7,
  },
  industrial: {
    style: 'School factory tour', budget: ['floor_lines', 'machine', 'goal'],
    maxLandmarks: 1, effect: 'soft_shadow', skyRatio: 0.55,
  },
  underwater: {
    style: 'Friendly reef', budget: ['sand', 'coral_arch', 'goal_buoy'],
    maxLandmarks: 1, effect: 'surface_glow', skyRatio: 0.6,
  },
  emergency: {
    style: 'Hero rescue cartoon', budget: ['route', 'hazard', 'goal'],
    maxLandmarks: 1, effect: 'soft_smoke', skyRatio: 0.6,
  },
  sky_aerial: {
    style: 'Cloud playground', budget: ['sky', 'cloud_landmark', 'rings', 'finish'],
    maxLandmarks: 1, maxGates: 8, minGates: 6, effect: 'soft_cloud', skyRatio: 0.75,
  },
  hybrid_race_sky: {
    style: 'Simple sky speedway', budget: ['ribbon', 'rings', 'speed_feature', 'finish'],
    maxLandmarks: 1, maxGates: 8, minGates: 6, effect: 'soft_bloom', skyRatio: 0.6,
  },
  cyber_ninja: {
    style: 'Cartoon spy', budget: ['floor', 'laser_grid', 'terminal'],
    maxLandmarks: 1, maxLasers: 6, effect: 'moon_glow', skyRatio: 0.62,
  },
  spider_climber: {
    style: 'Playground climbing wall', budget: ['wall', 'web_guides', 'hook_goal'],
    maxLandmarks: 1, effect: 'shaft_light', skyRatio: 0.55,
  },
  boxing_mech: {
    style: 'Saturday cartoon boxing', budget: ['ring', 'posts', 'soft_sky'],
    maxLandmarks: 0, effect: 'soft_shadow', skyRatio: 0.62,
  },
  flappy: {
    style: 'Classic Flappy simplicity', budget: ['sky', 'hill', 'pipes'],
    maxLandmarks: 0, effect: 'none', skyRatio: 0.8,
  },
  sandbox: {
    style: 'School robotics table', budget: ['mat', 'tape', 'flag'],
    maxLandmarks: 1, effect: 'soft_shadow', skyRatio: 0.65,
  },
};

function missionText(challenge, art) {
  return [
    art?.title,
    art?.lookDescription,
    art?.heroDescription,
    art?.goalDescription,
    challenge?.name,
    challenge?.modeName,
    challenge?.desc,
    challenge?.tagline,
  ].filter(Boolean).join(' ').toLowerCase();
}

function teachingHint(text, modeNumber) {
  if (modeNumber === 10 || /capstone|master|champion/.test(text)) return 'three_beats_one_zone';
  if (/laser/.test(text)) return 'single_laser_grid';
  if (/ring|slalom|pipe/.test(text)) return 'large_wide_gates';
  if (/climb|stair|incline|ascent/.test(text)) return 'simple_uphill';
  if (/drop|landing|rooftop|touch-and-go/.test(text)) return 'single_big_target';
  if (/patrol|sector|search|sweep/.test(text)) return 'three_big_zones';
  if (/fight|duel|boxing|brawl/.test(text)) return 'large_fighters';
  return 'obvious_route';
}

export function getMissionKidClarity(challenge) {
  const art = getMissionArtDirection(challenge);
  const environmentId = challenge?.studioFloorKind
    ? (challenge.environmentId || 'sandbox')
    : (art?.environmentId || challenge?.environmentId || 'sandbox');
  const family = KID_FAMILY_PROFILES[environmentId] || KID_FAMILY_PROFILES.sandbox;
  const chassisId = challenge?.chassisId || art?.chassisId || 'custom';
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  const modeNumber = Number(art?.modeNumber || challenge?.modeIndex || 1);
  const text = missionText(challenge, art);
  const deepRender = getRobotDeepRenderSpec(chassisId, modeNumber);
  return {
    ...family,
    ...dna,
    ...deepRender,
    sky: challenge?.studioSky || dna.sky,
    ground: challenge?.studioGround || dna.ground,
    fog: challenge?.studioFog || dna.fog,
    floorKind: challenge?.studioFloorKind || dna.floorKind,
    version: KID_CLARITY_VERSION,
    environmentId,
    chassisId,
    modeNumber,
    capstone: modeNumber === 10,
    hint: teachingHint(text, modeNumber),
    maxGlowColors: 2,
    particleTypes: modeNumber === 10 ? 1 : 0,
    premiumKidVisuals: true,
    softBackgroundOnly: true,
    robotScreenFraction: deepRender.robotScreenFraction,
    horizonKey: challenge?.studioFloorKind || dna.floorKind || environmentId,
  };
}

export function applyMissionKidClarity(scene, challenge) {
  const spec = getMissionKidClarity(challenge);
  scene.userData.kidClarity = spec;
  scene.userData.maxMissionLandmarks = spec.maxLandmarks;
  scene.userData.skipMissionScatter = true;
  scene.userData.allowHeroGltf = true;
  scene.userData.maxGlowColors = spec.maxGlowColors;
  scene.userData.robotDeepRenderSpec = spec;
  scene.userData.cameraMode = spec.camera;
  scene.userData.missionCameraPreset = { ...spec.cameraRig };
  scene.userData.raceVisual = {
    ...(scene.userData.raceVisual || {}),
    bloom: spec.post.bloom,
    threshold: spec.post.threshold,
    radius: spec.post.radius,
  };
  return spec;
}

const SIMPLE_BASE_PALETTES = {
  martian: { sky: 0xffc9a6, ground: 0xc65f45, fog: 0xf4a47d },
  industrial: { sky: 0xcfe8ff, ground: 0xe5e7eb, fog: 0xdbeafe },
  underwater: { sky: 0x67e8f9, ground: 0xf5d58a, fog: 0x5eead4 },
  emergency: { sky: 0xfed7aa, ground: 0xcbd5e1, fog: 0xffedd5 },
  cyber_ninja: { sky: 0x312e81, ground: 0x1e1b4b, fog: 0x312e81 },
  spider_climber: { sky: 0xd8b4fe, ground: 0x64748b, fog: 0xc4b5fd },
  sandbox: { sky: 0xe0f2fe, ground: 0xf8fafc, fog: 0xe0f2fe },
};

function floorMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.9,
    metalness: opts.metalness ?? 0,
    ...opts,
  });
}

function addFlatFloor(root, color, size = 180, opts = {}) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), floorMat(color, opts));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'KidClarityFloor';
  root.add(floor);
  return floor;
}

function addSideStripes(root, colors, widths = [24, 24]) {
  [-1, 1].forEach((side, i) => {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(widths[i] ?? 24, 180),
      floorMat(colors[i] ?? colors[0]),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.x = side * 42;
    strip.receiveShadow = true;
    root.add(strip);
  });
}

function addCenterStripe(root, color, width = 2.5) {
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 180),
    floorMat(color),
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.y = 0.01;
  stripe.receiveShadow = true;
  root.add(stripe);
}

function addRaisedRows(root, color, xPositions, height = 0.32, width = 1.5) {
  xPositions.forEach((x) => {
    const row = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 176),
      floorMat(color, { roughness: 0.96 }),
    );
    row.position.set(x, height / 2, -60);
    row.receiveShadow = true;
    root.add(row);
  });
}

function addGradientDome(root, dna) {
  const top = new THREE.Color(dna.sky ?? 0x60a5fa);
  const horizon = new THREE.Color(dna.fog ?? dna.sky ?? 0xfed7aa);
  const lower = new THREE.Color(dna.ground ?? 0x64748b).lerp(horizon, 0.55);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(220, 32, 18),
    new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: top },
        horizonColor: { value: horizon },
        lowerColor: { value: lower },
      },
      vertexShader: `
        varying float vSkyY;
        void main() {
          vSkyY = normalize(position).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 lowerColor;
        varying float vSkyY;
        void main() {
          float upperMix = smoothstep(0.02, 0.72, vSkyY);
          float lowerMix = smoothstep(-0.42, 0.02, vSkyY);
          vec3 lowBand = mix(lowerColor, horizonColor, lowerMix);
          gl_FragColor = vec4(mix(lowBand, topColor, upperMix), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  dome.name = 'KidClarityGradientSky';
  dome.position.set(0, 22, -55);
  dome.renderOrder = -1000;
  root.add(dome);
}

function addSkyIdentity(root, floorKind) {
  const addOrb = (name, color, radius, position) => {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 20, 14),
      new THREE.MeshBasicMaterial({ color, fog: false }),
    );
    orb.name = name;
    orb.position.set(...position);
    root.add(orb);
  };
  if (floorKind === 'martian_dirt') {
    addOrb('MarsMoonA', 0xfff1d6, 4.2, [-34, 34, -112]);
    addOrb('MarsMoonB', 0xfde68a, 2.1, [-22, 26, -116]);
  } else if (floorKind === 'lunar_grey') {
    addOrb('EarthHorizonMarble', 0x38bdf8, 6.5, [38, 28, -118]);
  } else if (floorKind === 'rooftop_tar' || floorKind === 'temple_tiles') {
    addOrb('NightMoon', 0xf8fafc, 6, [-34, 32, -116]);
  } else if (floorKind === 'hospital_tile') {
    addOrb('HospitalCrossGlow', 0xbfdbfe, 5, [30, 28, -110]);
  } else if (floorKind === 'farm_field') {
    addOrb('FarmSun', 0xfbbf24, 7, [32, 30, -114]);
  } else if (floorKind === 'city_plaza') {
    addOrb('CitySun', 0xfff4e0, 8, [38, 38, -120]);
  } else if (floorKind === 'combat_ring') {
    addOrb('ArenaSpotlight', 0xfbbf24, 4, [0, 40, -100]);
  } else if (floorKind === 'sandy_seabed' || floorKind === 'abyss_rock') {
    addOrb('ReefGlow', 0x22d3ee, 3.5, [-28, 20, -108]);
  } else if (floorKind === 'wet_street' || floorKind === 'rubble_street') {
    addOrb('RescueGlow', 0xf97316, 4.5, [-26, 26, -112]);
  } else if (floorKind === 'lab_grid') {
    addOrb('LabPulse', 0x38bdf8, 3.8, [28, 24, -112]);
  } else if (floorKind === 'desert_sand') {
    addOrb('DesertSun', 0xfbbf24, 8, [36, 34, -118]);
  }
}

function addTunnelWalls(root, wallColor, lightColor) {
  [-28, 28].forEach((x) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(8, 14, 180),
      floorMat(wallColor),
    );
    wall.position.set(x, 7, -60);
    wall.receiveShadow = true;
    root.add(wall);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      floorMat(lightColor, { emissive: lightColor, emissiveIntensity: 0.8 }),
    );
    lamp.position.set(x * 0.85, 10, -30);
    root.add(lamp);
  });
}

function addCheckerTiles(root, c1, c2, tile = 6) {
  const cols = Math.floor(180 / tile);
  for (let ix = 0; ix < cols; ix++) {
    for (let iz = 0; iz < cols; iz++) {
      const tileMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(tile, tile),
        floorMat((ix + iz) % 2 === 0 ? c1 : c2),
      );
      tileMesh.rotation.x = -Math.PI / 2;
      tileMesh.position.set(ix * tile - 90 + tile / 2, 0.005, iz * tile - 90 + tile / 2);
      tileMesh.receiveShadow = true;
      root.add(tileMesh);
    }
  }
}

function addStudPattern(root, baseColor, studColor) {
  addFlatFloor(root, baseColor);
  for (let x = -80; x <= 80; x += 8) {
    for (let z = -80; z <= 40; z += 8) {
      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.35, 10),
        floorMat(studColor, { roughness: 0.7 }),
      );
      stud.position.set(x, 0.18, z);
      stud.receiveShadow = true;
      root.add(stud);
    }
  }
}

function addClimbWallBackdrop(root, wallColor) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(120, 40, 4),
    floorMat(wallColor),
  );
  wall.position.set(0, 20, -95);
  wall.receiveShadow = true;
  root.add(wall);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const hold = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 8, 8),
        floorMat(0xf472b6),
      );
      hold.position.set(-35 + col * 10, 6 + row * 6, -93);
      root.add(hold);
    }
  }
}

function addSignatureProp(root, dna) {
  if (!dna?.signatureProp) return;
  const g = new THREE.Group();
  g.name = 'ChassisSignatureProp';
  const prop = dna.signatureProp.toLowerCase();
  let mesh;
  if (/barn|mesa|torii|castle|lighthouse|bunker|tree|flag/.test(prop)) {
    const h = /torii|lighthouse/.test(prop) ? 12 : 8;
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(6, h, 2),
      floorMat(/barn/.test(prop) ? 0xdc2626 : /torii/.test(prop) ? 0xef4444 : 0x78716c),
    );
    mesh.position.y = h / 2;
  } else if (/coral|crystal|jellyfish|vent/.test(prop)) {
    mesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 10, 10),
      floorMat(/coral/.test(prop) ? 0xf472b6 : /crystal/.test(prop) ? 0x22d3ee : 0x06b6d4,
        { emissive: 0x22d3ee, emissiveIntensity: 0.3 }),
    );
    mesh.position.y = 2.5;
  } else if (/hay|brick|container|hydrant|bed|gurney/.test(prop)) {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 3),
      floorMat(/hay/.test(prop) ? 0xd97706 : /brick/.test(prop) ? 0xef4444 : 0x64748b),
    );
    mesh.position.y = 1.25;
  } else {
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.8, 4, 8),
      floorMat(0x94a3b8),
    );
    mesh.position.y = 2;
  }
  g.add(mesh);
  g.position.set(18, 0, -75);
  root.add(g);
}

function addNintendoHills(root, palette) {
  const hillMat = (c) => floorMat(c, { roughness: 1, metalness: 0 });
  const g = palette.ground ?? 0x86efac;
  const hillA = new THREE.Mesh(new THREE.SphereGeometry(28, 10, 8), hillMat(g));
  hillA.scale.set(1.8, 0.45, 1.1);
  hillA.position.set(-52, 4, -105);
  root.add(hillA);
  const hillB = new THREE.Mesh(new THREE.SphereGeometry(22, 10, 8), hillMat(new THREE.Color(g).lerp(new THREE.Color(palette.sky ?? 0x87ceeb), 0.35).getHex()));
  hillB.scale.set(1.5, 0.4, 1);
  hillB.position.set(48, 3.5, -112);
  root.add(hillB);
  [[-18, 19, -98], [26, 24, -102], [8, 17, -108]].forEach(([x, y, z], i) => {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(5 + i, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, fog: false }),
    );
    cloud.position.set(x, y, z);
    cloud.scale.set(2 + i * 0.15, 0.7, 1.2);
    root.add(cloud);
  });
}

/** Themed floor per Arena Bible mode — readable, not a flat green void. */
function buildNintendoThemedFloor(root, floorKind, palette) {
  if (floorKind === 'lab_grid') {
    addFlatFloor(root, palette.ground ?? 0xfef9c3, 220, { roughness: 0.96 });
    [[-26, -42, 0xbfdbfe], [26, -42, 0xfecaca], [-26, -78, 0xfef08a], [26, -78, 0xbbf7d0]].forEach(([x, z, c]) => {
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), floorMat(c, { roughness: 0.94 }));
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.012, z);
      root.add(pad);
    });
    return;
  }
  if (floorKind === 'stud_mat') {
    addFlatFloor(root, palette.ground ?? 0xfef08a, 220, { roughness: 0.92 });
    [-60, 0, 60].forEach((x) => {
      [-70, -30, 10].forEach((z) => {
        const stud = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.4, 0.32, 10),
          floorMat(0xfde047, { roughness: 0.75 }),
        );
        stud.position.set(x, 0.16, z);
        root.add(stud);
      });
    });
    return;
  }
  buildChassisFloor(root, floorKind, palette);
}

/** Distant set dressing — off the play path (Nintendo-style backdrop, not route spam). */
function addNintendoHorizonDressing(root, floorKind, palette) {
  const g = new THREE.Group();
  g.name = 'NintendoHorizonDressing';
  const accent = new THREE.Color(palette.ground ?? 0x86efac).lerp(new THREE.Color(palette.sky ?? 0x87ceeb), 0.35).getHex();
  const addSil = (geo, color, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, floorMat(color, { roughness: 0.98 }));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    g.add(m);
  };
  if (floorKind === 'farm_field' || floorKind === 'martian_dirt') {
    addSil(new THREE.BoxGeometry(8, 5, 5), 0xdc2626, -58, 2.5, -108);
    addSil(new THREE.ConeGeometry(6, 3, 4), 0x7f1d1d, -58, 6.5, -108);
    addSil(new THREE.CylinderGeometry(1.2, 1.6, 7, 8), 0x92400e, 52, 3.5, -112);
    addSil(new THREE.SphereGeometry(4, 10, 8), 0x4ade80, 52, 8, -112);
  } else if (floorKind === 'city_plaza') {
    [[-55, 12], [-42, 16], [48, 14], [62, 10]].forEach(([x, h], i) => {
      addSil(new THREE.BoxGeometry(4 + i, h, 4 + i), 0xf8fafc, x, h / 2, -115 + i * 2);
    });
    addSil(new THREE.CylinderGeometry(0.4, 0.5, 18, 8), 0x22d3ee, 0, 9, -118);
  } else if (floorKind === 'sandy_seabed' || floorKind === 'abyss_rock') {
    addSil(new THREE.TorusGeometry(4, 0.8, 8, 20), 0xf472b6, -50, 2.5, -105);
    addSil(new THREE.ConeGeometry(2.5, 5, 7), 0x14b8a6, 54, 2.5, -110);
  } else if (floorKind === 'open_sky') {
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 11, 3.5, 12),
      floorMat(0x4ade80, { roughness: 0.95 }),
    );
    island.position.set(-62, 8, -115);
    g.add(island);
    addSil(new THREE.SphereGeometry(3, 10, 8), 0xffffff, -58, 14, -112);
    const islandB = island.clone();
    islandB.material = floorMat(0x86efac);
    islandB.position.set(58, 6, -118);
    islandB.scale.set(0.85, 1, 0.85);
    g.add(islandB);
  } else if (floorKind === 'mine_tunnel' || floorKind === 'temple_tiles') {
    addSil(new THREE.BoxGeometry(14, 10, 2), 0x44403c, 0, 5, -112);
  } else {
    addSil(new THREE.CylinderGeometry(2, 2.8, 6, 10), accent, -48, 3, -108);
    addSil(new THREE.CylinderGeometry(1.6, 2.2, 5, 10), accent, 50, 2.5, -114);
  }
  root.add(g);
}

function buildChassisFloor(root, floorKind, palette) {
  const g = palette.ground;
  switch (floorKind) {
    case 'lunar_grey':
      addFlatFloor(root, g);
      for (let i = 0; i < 6; i++) {
        const crater = new THREE.Mesh(
          new THREE.CylinderGeometry(2 + i * 0.3, 2.5 + i * 0.3, 0.15, 12),
          floorMat(0x6b7280),
        );
        crater.rotation.x = -Math.PI / 2;
        crater.position.set(-30 + i * 12, 0.02, -50 - i * 8);
        root.add(crater);
      }
      break;
    case 'mine_tunnel':
      addFlatFloor(root, 0x3d2817);
      addTunnelWalls(root, 0x292524, 0xfbbf24);
      break;
    case 'asphalt_lot':
      addFlatFloor(root, 0x374151);
      addCenterStripe(root, 0xffffff, 1.8);
      break;
    case 'city_plaza':
      addFlatFloor(root, 0xe2e8f0, { roughness: 0.55 });
      addCenterStripe(root, 0x22d3ee, 1.4);
      addSideStripes(root, [0x4ade80, 0x4ade80], [22, 22]);
      break;
    case 'farm_field':
      addFlatFloor(root, 0x8b6914);
      addSideStripes(root, [0x4d7c0f, 0x4d7c0f]);
      addRaisedRows(root, 0x6b4f12, [-28, -22, -16, 16, 22, 28], 0.38, 1.8);
      break;
    case 'factory_floor':
      addFlatFloor(root, 0x6b7280);
      addCenterStripe(root, 0xfbbf24, 2.2);
      break;
    case 'lab_grid':
      addFlatFloor(root, 0xf1f5f9);
      for (let x = -90; x <= 90; x += 6) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(0.08, 180),
          floorMat(0x93c5fd),
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0.01, -60);
        root.add(line);
      }
      break;
    case 'stud_mat':
      addStudPattern(root, 0xfef08a, 0xfde047);
      break;
    case 'gym_mats':
      addFlatFloor(root, 0xc7d2fe);
      addSideStripes(root, [0x818cf8, 0x818cf8], [18, 18]);
      addCenterStripe(root, 0xffffff, 0.42);
      break;
    case 'scrap_yard':
      addFlatFloor(root, 0x57534e);
      addCenterStripe(root, 0xfbbf24, 1.5);
      break;
    case 'climb_shaft':
      addFlatFloor(root, 0x64748b);
      addClimbWallBackdrop(root, 0x44403c);
      addRaisedRows(root, 0x94a3b8, [-24, -12, 0, 12, 24], 0.42, 0.85);
      break;
    case 'rooftop_tar':
      addFlatFloor(root, 0x1f2937);
      addRaisedRows(root, 0xec4899, [-22, 22], 0.12, 0.18);
      break;
    case 'temple_tiles':
      addFlatFloor(root, 0x44403c);
      addRaisedRows(root, 0x292524, [-30, -20, -10, 0, 10, 20, 30], 0.22, 0.75);
      break;
    case 'sandy_seabed':
      addFlatFloor(root, 0xf5d58a);
      addRaisedRows(root, 0xe8c875, [-30, -18, -6, 6, 18, 30], 0.16, 1.2);
      break;
    case 'abyss_rock':
      addFlatFloor(root, 0x1e293b);
      addTunnelWalls(root, 0x0f172a, 0x22d3ee);
      break;
    case 'rubble_street':
      addFlatFloor(root, 0x78716c);
      addCenterStripe(root, 0xf97316, 0.34);
      break;
    case 'hospital_tile':
      addCheckerTiles(root, 0xffffff, 0xbfdbfe);
      break;
    case 'wet_street':
      addFlatFloor(root, 0x374151, { roughness: 0.4, metalness: 0.15 });
      addCenterStripe(root, 0xfbbf24, 0.32);
      break;
    case 'desert_sand':
      addFlatFloor(root, 0xd97706);
      [-20, 20].forEach((x) => {
        const bunker = new THREE.Mesh(
          new THREE.BoxGeometry(6, 3, 8),
          floorMat(0x78716c),
        );
        bunker.position.set(x, 1.5, -70);
        root.add(bunker);
      });
      break;
    case 'flappy_scroll':
      addFlatFloor(root, 0x22c55e);
      break;
    case 'combat_ring': {
      addFlatFloor(root, 0x334155);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(8, 9.5, 32),
        floorMat(0xfbbf24, { emissive: 0xfbbf24, emissiveIntensity: 0.15 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.02, -60);
      root.add(ring);
      break;
    }
    case 'open_sky':
      addFlatFloor(root, g);
      break;
    case 'martian_dirt':
    default:
      addFlatFloor(root, g);
      addRaisedRows(root, 0xa94732, [-4.2, 4.2], 0.18, 0.72);
      break;
  }
}

/**
 * Build the deliberately sparse foundation used by non-specialized catalog
 * missions. Route, teaching landmark and goal are added by MissionWorldKit.
 */
export function buildKidClarityBaseArena(scene, challenge) {
  const clarity = applyMissionKidClarity(scene, challenge);
  const chassisId = challenge?.chassisId || clarity.chassisId || 'custom';
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  const palette = {
    sky: challenge?.studioSky || clarity.sky || dna.sky,
    ground: challenge?.studioGround || clarity.ground || dna.ground,
    fog: challenge?.studioFog || clarity.fog || dna.fog,
  };
  const floorKind = challenge?.studioFloorKind || clarity.floorKind || dna.floorKind || 'lab_grid';
  const nintendoClean = challenge?.isChassisMode && isPrimaryStudioChassis(chassisId);
  if (nintendoClean) scene.userData.nintendoClean = true;

  const root = new THREE.Group();
  root.name = 'KidClarityBase';

  if (nintendoClean) {
    scene.userData.nintendoRich = true;
    buildNintendoThemedFloor(root, floorKind, palette);
    addGradientDome(root, palette);
    addSkyIdentity(root, floorKind);
    addNintendoHorizonDressing(root, floorKind, palette);
    if (/farm_field|open_sky|martian_dirt|desert_sand|sandy_seabed|city_plaza|stud_mat/.test(floorKind)) {
      addNintendoHills(root, palette);
    }
    addSignatureProp(root, {
      ...dna,
      signatureProp: challenge?.studioLandmark || dna.signatureProp,
    });
  } else {
    buildChassisFloor(root, floorKind, palette);
    addGradientDome(root, palette);
    addSkyIdentity(root, floorKind);
    addSignatureProp(root, {
      ...dna,
      signatureProp: challenge?.studioLandmark || dna.signatureProp,
    });
  }
  scene.add(root);

  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.fog, nintendoClean ? 70 : clarity.fogNear, nintendoClean ? 210 : clarity.fogFar);

  const light = clarity.lighting;
  const hemi = new THREE.HemisphereLight(light.hemiSky, palette.ground, nintendoClean ? 1.12 : light.hemiIntensity);
  hemi.name = 'KidClarityFill';
  scene.add(hemi);
  const key = new THREE.DirectionalLight(light.keyColor, nintendoClean ? light.keyIntensity * 0.88 : light.keyIntensity);
  key.name = 'KidClaritySun';
  key.position.set(...light.keyPosition);
  key.castShadow = !nintendoClean;
  if (key.castShadow) {
    key.shadow.mapSize.set(light.shadowMap, light.shadowMap);
  }
  scene.add(key);

  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.groundY = 0;
  scene.userData.skipSoftEnvironment = true;
  scene.userData.chassisVisualDna = dna;
  scene.userData.horizonKey = floorKind;
  scene.userData.arenaBounds = {
    camMinZ: -115,
    camMaxZ: 20,
    camMaxX: 36,
  };
  return root;
}
