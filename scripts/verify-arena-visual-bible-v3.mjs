import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import * as THREE from 'three';
import { MISSION_ART_DIRECTION_V3 } from '../src/virtual-robot-designer/studio/mission-world/MissionArtDirectionV3.js';
import { getMissionArtDirection, getMissionVisual } from '../src/virtual-robot-designer/studio/mission-world/MissionVisualBibleV2.js';
import { MISSION_CAMERA_PRESETS } from '../src/virtual-robot-designer/studio/ArenaBroadcastKit.js';
import { applyMissionVisuals, mergeTags } from '../src/virtual-robot-designer/studio/MissionVisualDirector.js';
import { GAME_MODE_SPECS_BY_ID } from '../src/virtual-robot-designer/data/game-mode-specifications.js';
import { applyMissionRoutePresentation } from '../src/virtual-robot-designer/studio/mission-world/MissionRouteKit.js';
import { buildSimRobot } from '../src/virtual-robot-designer/services/studio-robot-builder.js';
import {
  applyMissionAuthoredHeroDressing,
  classifyMissionHeroCategories,
} from '../src/virtual-robot-designer/studio/mission-world/MissionAuthoredHeroKit.js';
import { ENVIRONMENTS } from '../src/virtual-robot-designer/data/robot-arena-config.js';
import {
  buildKidClarityBaseArena,
  CHASSIS_VISUAL_DNA,
  getMissionKidClarity,
  KID_FAMILY_PROFILES,
  KID_CLARITY_VERSION,
} from '../src/virtual-robot-designer/studio/mission-world/MissionKidClarity.js';
import {
  applyKidMissionTeachingProps,
  classifyKidMissionFeature,
} from '../src/virtual-robot-designer/studio/mission-world/MissionKidTeachingProps.js';
import {
  GOLD_CHAPTER_MODES,
  ROBOT_DEEP_RENDER_SPEC,
  getGoldChapterMode,
  getRobotDeepRenderSpec,
} from '../src/virtual-robot-designer/studio/mission-world/RobotChapterDeepSpec.js';
import {
  installGoldCrawlerChapter,
  installGoldJetChapter,
} from '../src/virtual-robot-designer/studio/mission-world/RobotChapterGoldKit.js';

const EXPECTED_MISSION_COUNT = 330;
const EXPECTED_CHASSIS_COUNT = 33;
const REQUIRED_TEXT_FIELDS = [
  'cameraDescription',
  'lighting',
  'scatterRecipe',
  'lookDescription',
  'heroDescription',
  'goalDescription',
  'mood',
];
const GENERIC_COPY = /\b(?:tbd|todo|placeholder|generic|same as|palette[- ]?swap|lorem ipsum)\b/i;
const HEX_COLOR = /^#[\da-f]{6}$/i;
const normalizeCopy = value => value
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const artEntries = Object.entries(MISSION_ART_DIRECTION_V3);
const missionIds = artEntries.map(([id]) => id);
assert.equal(artEntries.length, EXPECTED_MISSION_COUNT, 'Visual bible must cover exactly 330 missions');
assert.equal(new Set(missionIds).size, EXPECTED_MISSION_COUNT, 'Mission IDs must be unique');

const counts = new Map();
const featureCounts = new Map();
const modesByChassis = new Map();
const directionFingerprints = new Map();
const testCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -30),
  new THREE.Vector3(4, 0, -60),
]);
for (const [id, art] of artEntries) {
  const gameplay = GAME_MODE_SPECS_BY_ID[id];
  assert.ok(gameplay, `Missing gameplay: ${id}`);
  assert.equal(gameplay.id, id, `Gameplay mission ID/key mismatch: ${id}`);
  assert.equal(gameplay.chassisId, art.chassisId, `Gameplay chassis mismatch: ${id}`);
  assert.equal(gameplay.modeNumber, art.modeNumber, `Gameplay progression mismatch: ${id}`);
  assert.equal(art.title, gameplay.modeName, `Mission title mismatch: ${id}`);
  assert.ok(String(gameplay.visualDescription || '').trim(), `Missing gameplay visual description: ${id}`);
  assert.ok(ENVIRONMENTS[art.environmentId], `Unknown environment: ${id}`);
  assert.ok(MISSION_CAMERA_PRESETS[art.camera], `Unknown camera: ${id}`);
  assert.equal(
    String(art.cameraDescription).trim().split(/\s/)[0],
    art.camera,
    `Camera description/preset mismatch: ${id}`,
  );
  for (const field of REQUIRED_TEXT_FIELDS) {
    const value = String(art[field] ?? '').trim();
    assert.ok(value, `Missing ${field}: ${id}`);
    assert.ok(!GENERIC_COPY.test(value), `Generic ${field} copy: ${id}`);
  }
  assert.ok(art.palette && typeof art.palette === 'object', `Missing palette: ${id}`);
  for (const role of ['primary', 'secondary', 'accent']) {
    assert.match(art.palette[role] || '', HEX_COLOR, `Invalid ${role} palette color: ${id}`);
  }
  assert.ok(Array.isArray(art.paletteColors) && art.paletteColors.length >= 3, `Incomplete palette: ${id}`);
  for (const color of art.paletteColors) assert.match(color, HEX_COLOR, `Invalid palette color: ${id}`);
  assert.deepEqual(
    art.paletteColors.slice(0, 3).map(color => color.toLowerCase()),
    ['primary', 'secondary', 'accent'].map(role => art.palette[role].toLowerCase()),
    `Palette role/list mismatch: ${id}`,
  );
  assert.ok(!['rover', 'scout', 'footballbot'].includes(art.chassisId));
  counts.set(art.chassisId, (counts.get(art.chassisId) || 0) + 1);
  if (!modesByChassis.has(art.chassisId)) modesByChassis.set(art.chassisId, new Set());
  const chassisModes = modesByChassis.get(art.chassisId);
  assert.ok(!chassisModes.has(art.modeNumber), `Duplicate mode ${art.modeNumber}: ${art.chassisId}`);
  chassisModes.add(art.modeNumber);

  // Deliberately excludes palette: identical authored direction with different
  // colors is still a palette-swap collision. This is metadata verification,
  // not screenshot or rendered-pixel parity.
  const directionFingerprint = [
    art.camera,
    art.cameraDescription,
    art.lighting,
    art.scatterRecipe,
    art.lookDescription,
    art.heroDescription,
    art.goalDescription,
    art.mood,
  ].map(normalizeCopy).join('|');
  const collision = directionFingerprints.get(directionFingerprint);
  assert.ok(!collision, `Generic/palette-swap art direction collision: ${collision} and ${id}`);
  directionFingerprints.set(directionFingerprint, id);

  const challenge = { id, chassisId: art.chassisId, modeIndex: art.modeNumber, isChassisMode: true };
  assert.equal(getMissionArtDirection(challenge), art);
  assert.equal(getMissionArtDirection({ ...challenge, id: undefined }), art);
  const visual = getMissionVisual(challenge, 'underwater');
  assert.equal(visual.environmentId, art.environmentId, `Stale environment won: ${id}`);
  assert.ok(visual.fogFar > visual.fogNear);
  assert.ok(visual.scatterSpacing >= 8 && visual.scatterSpacing <= 12);
  const tags = mergeTags(challenge);
  assert.ok(!tags.includes('rainbow') && !tags.includes('football'), `Excluded scenery: ${id}`);
  if (['sky_aerial', 'hybrid_race_sky'].includes(art.environmentId)) {
    assert.ok(!tags.some(tag => ['coral', 'underwater', 'deep', 'wreck', 'trench', 'mud'].includes(tag)), `Underwater scenery in flight: ${id}`);
  }
  assert.equal(classifyMissionHeroCategories(art).length, 3, `Incomplete hero landmarks: ${id}`);
  const clarity = getMissionKidClarity(challenge);
  assert.ok(KID_FAMILY_PROFILES[art.environmentId], `Missing kid family profile: ${id}`);
  assert.equal(clarity.maxGlowColors, 2, `Glow budget drift: ${id}`);
  assert.ok(clarity.maxLandmarks <= 1, `Landmark budget drift: ${id}`);
  assert.ok(clarity.robotScreenFraction[0] >= 0.25 && clarity.robotScreenFraction[1] <= 0.35, `Robot framing drift: ${id}`);
  const feature = classifyKidMissionFeature(challenge);
  assert.ok(feature, `Missing objective teaching feature: ${id}`);
  featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
  if (feature !== 'opponent_only') {
    const featureScene = new THREE.Scene();
    const featureRoot = applyKidMissionTeachingProps(featureScene, challenge, testCurve);
    assert.equal(featureRoot.children.length, 1, `Teaching landmark budget drift: ${id}`);
    let meshes = 0;
    featureRoot.traverse(object => { if (object.isMesh) meshes += 1; });
    assert.ok(meshes > 0, `Teaching feature has no geometry: ${id} (${feature})`);
  }
}
assert.equal(counts.size, EXPECTED_CHASSIS_COUNT);
for (const [id, count] of counts) {
  assert.equal(count, 10, id);
  assert.deepEqual(
    [...modesByChassis.get(id)].sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    `Modes must progress from 1 through 10: ${id}`,
  );
}
const expectedMissionIds = Object.values(GAME_MODE_SPECS_BY_ID)
  .filter(spec => counts.has(spec.chassisId))
  .map(spec => spec.id);
assert.equal(expectedMissionIds.length, EXPECTED_MISSION_COUNT, 'Selected 33 chassis must define 330 gameplay missions');
assert.deepEqual(
  [...missionIds].sort(),
  [...expectedMissionIds].sort(),
  'Visual bible coverage differs from the 33-chassis gameplay catalog',
);
assert.equal(KID_CLARITY_VERSION, '2026-09-06-v4');
const identityKeys = new Set();
for (const chassisId of counts.keys()) {
  const dna = CHASSIS_VISUAL_DNA[chassisId];
  assert.ok(dna?.floorKind, `Missing locked floor DNA: ${chassisId}`);
  assert.ok(dna?.surroundings, `Missing locked skyline DNA: ${chassisId}`);
  assert.ok(dna?.signatureProp, `Missing locked signature DNA: ${chassisId}`);
  const identity = `${dna.floorKind}|${dna.surroundings}|${dna.signatureProp}`;
  assert.ok(!identityKeys.has(identity), `Palette-swap identity collision: ${chassisId}`);
  identityKeys.add(identity);
}
assert.equal(identityKeys.size, 33, 'Every chassis must have distinct composite visual DNA');
assert.equal(Object.keys(ROBOT_DEEP_RENDER_SPEC).length, 33, 'Every chassis needs numeric deep render data');
for (const chassisId of counts.keys()) {
  const deep = getRobotDeepRenderSpec(chassisId);
  assert.ok(deep.cameraRig && Number.isFinite(deep.cameraRig.fov), `Missing camera rig: ${chassisId}`);
  assert.ok(deep.fogFar > deep.fogNear, `Invalid deep fog: ${chassisId}`);
  assert.ok(deep.post.bloom >= 0.1 && deep.post.bloom <= 0.24, `Invalid bloom: ${chassisId}`);
  assert.ok(deep.lighting.keyIntensity > 0 && deep.lighting.shadowMap >= 1024, `Invalid lighting: ${chassisId}`);
}
assert.equal(Object.keys(GOLD_CHAPTER_MODES).length, 20, 'Crawler and Jet need all ten gold modes');
assert.deepEqual(getRobotDeepRenderSpec('crawler').cameraRig, {
  camBack: 7, camUp: 3.4, lookAhead: 7, lookHeight: 0.8, fov: 50,
});
assert.equal(getRobotDeepRenderSpec('jetplane', 4).cameraRig.fov, 52);
assert.equal(getRobotDeepRenderSpec('jetplane', 1).post.bloom, 0.24);

const crawlerLayouts = new Set();
const jetLayouts = new Set();
for (const mode of Object.values(GOLD_CHAPTER_MODES)) {
  const goldScene = new THREE.Scene();
  const challenge = { id: mode.missionId, chassisId: mode.chassisId, modeIndex: mode.modeNumber, isChassisMode: true };
  assert.equal(getGoldChapterMode(challenge), mode);
  const installed = mode.chassisId === 'crawler'
    ? installGoldCrawlerChapter(goldScene, challenge, testCurve)
    : installGoldJetChapter(goldScene, challenge, testCurve);
  assert.equal(installed, true, `Gold chapter did not install: ${mode.missionId}`);
  const rootName = mode.chassisId === 'crawler' ? 'GoldCrawlerArena' : 'GoldJetArena';
  const goldRoot = goldScene.getObjectByName(rootName);
  assert.ok(goldRoot, `Gold root missing: ${mode.missionId}`);
  let meshes = 0;
  goldRoot.traverse(object => { if (object.isMesh) meshes += 1; });
  if (mode.modeNumber !== 1 || mode.chassisId !== 'jetplane') {
    assert.ok(meshes > 0, `Gold mode has no authored geometry: ${mode.missionId}`);
  }
  (mode.chassisId === 'crawler' ? crawlerLayouts : jetLayouts).add(mode.layoutKind);
}
assert.equal(crawlerLayouts.size, 10, 'Crawler gold modes reused layouts');
assert.equal(jetLayouts.size, 10, 'Jet gold modes reused layouts');
assert.ok(featureCounts.size >= 20, 'Mission classifier collapsed into generic visuals');
assert.deepEqual(ENVIRONMENTS.hybrid_race_sky.arenaTypes, [
  'rainbow_road', 'drone_canyon', 'sunny_circuit', 'cloud_race',
  'dragon_skyway', 'flight_rings', 'volcano_drift', 'storm_cloud',
  'street_grand_prix', 'warp_gate',
]);
assert.equal(getMissionArtDirection({ isRobotMission: true, chassisId: 'crawler' }), null);
const kidBaseScene = new THREE.Scene();
buildKidClarityBaseArena(kidBaseScene, {
  id: 'crawler_rocky_mountain_climb',
  chassisId: 'crawler',
  modeIndex: 1,
  isChassisMode: true,
});
assert.ok(kidBaseScene.getObjectByName('KidClarityFloor'), 'Sparse base floor missing');
assert.ok(kidBaseScene.getObjectByName('KidClarityGradientSky'), 'Gradient atmosphere missing');
assert.equal(kidBaseScene.getObjectByName('ChassisSignatureProp'), undefined, 'Base duplicated premium landmark');
assert.equal(kidBaseScene.userData.skipMissionScatter, true, 'Side scatter must stay disabled');
const farmClarity = getMissionKidClarity({ chassisId: 'farmbot', modeIndex: 1, isChassisMode: true });
const mineClarity = getMissionKidClarity({ chassisId: 'miningbot', modeIndex: 1, isChassisMode: true });
assert.notEqual(farmClarity.floorKind, mineClarity.floorKind, 'Ground robots must not share floor kind');
assert.notEqual(farmClarity.ground, mineClarity.ground, 'Ground robots must not share ground palette');
assert.equal(kidBaseScene.children.filter(child => child.isLight).length, 2, 'Sparse base lighting budget drift');
for (const id of ['miningbot_crystal_ore_extraction', 'securitybot_night_sentry_watch', 'stealth_silent_footsteps', 'submarine_coral_reef_survey']) {
  assert.ok(getMissionVisual({ id }, 'industrial').look, `Lost bespoke dressing: ${id}`);
}
// Real Three.js geometry: validate ownership, finite transforms and repeat safety.
const scene = new THREE.Scene();
scene.userData._chassisCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0), new THREE.Vector3(8, 0, -20), new THREE.Vector3(0, 0, -50),
]);
const crawler = Object.entries(MISSION_ART_DIRECTION_V3).find(([, art]) => art.chassisId === 'crawler' && art.modeNumber === 2)[0];
const challenge = { id: crawler, isChassisMode: true };
applyMissionVisuals(scene, challenge);
const root = scene.getObjectByName('MissionVisualRoot');
assert.ok(root.children.length > 0, 'Authored dressing produced no geometry');
assert.ok(scene.userData.missionAppliedVisualTags.includes('mud'));
const count = root.children.length;
applyMissionVisuals(scene, challenge);
assert.equal(root.children.length, count);
root.traverse(object => assert.ok(object.position.toArray().every(Number.isFinite)));
const aerial = new THREE.Scene();
aerial.userData.aerialWorldBuilt = true;
applyMissionVisuals(aerial, challenge);
assert.equal(aerial.children.length, 0, 'Ground props leaked into aerial builder');
const aerialMission = Object.entries(MISSION_ART_DIRECTION_V3)
  .find(([, art]) => art.environmentId === 'sky_aerial');
const aerialHeroScene = new THREE.Scene();
aerialHeroScene.userData.aerialWorldBuilt = true;
aerialHeroScene.userData._chassisCurve = scene.userData._chassisCurve;
aerialHeroScene.userData.maxMissionLandmarks = 1;
assert.ok(applyMissionAuthoredHeroDressing(aerialHeroScene, {
  id: aerialMission[0],
  isChassisMode: true,
}), 'Aerial authored heroes were not built');
assert.equal(aerialHeroScene.getObjectByName('MissionAuthoredHeroDressing').children.length, 1);
const combatMission = Object.entries(MISSION_ART_DIRECTION_V3)
  .find(([, art]) => art.environmentId === 'boxing_mech');
const combatHeroScene = new THREE.Scene();
combatHeroScene.userData.combatMode = true;
combatHeroScene.userData.maxMissionLandmarks = 0;
assert.equal(applyMissionAuthoredHeroDressing(combatHeroScene, {
  id: combatMission[0],
  isChassisMode: true,
}), false, 'Combat ring exceeded its zero-landmark budget');
// Canvas text is irrelevant to this geometry regression. Rendered sign
// readability is checked separately in the website.
const context = new Proxy({}, { get: (_, key) => key === 'measureText'
  ? text => ({ width: text.length * 8 })
  : key === 'createLinearGradient' || key === 'createRadialGradient' ? () => ({ addColorStop() {} })
  : key === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })
  : () => {} });
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const routeScene = new THREE.Scene();
routeScene.userData.chassisCheckpoints = [{x:0,z:-10}, {x:0,z:-20}];
for (let i=0; i<5; i++) { const cp = new THREE.Group(); cp.name = 'cp'; routeScene.add(cp); }
applyMissionRoutePresentation(routeScene, scene.userData._chassisCurve, { path:0xfbbf24, glow:0x3b82f6 }, {}, 'industrial');
assert.equal(routeScene.getObjectByName('cp'), undefined, 'Legacy checkpoint removal failed');
const road = routeScene.getObjectByName('MissionPBRoad');
road.geometry.computeBoundingBox();
assert.ok(road.geometry.boundingBox.max.y - road.geometry.boundingBox.min.y < .01, 'Road should be a flat ribbon');
assert.ok(routeScene.getObjectByName('MissionStartGantry'), 'Missing objective banner');
const miningRobot = buildSimRobot({chassisId:'miningbot', sensors:[],tools:[]});
assert.ok(!miningRobot.userData.buildFallback, 'Mining Bot fell back to the rover');
assert.ok(miningRobot.userData.artDirection, 'Robot material preparation did not run');
delete globalThis.document;

// Concurrent visual-quality work may introduce one or more of these kits.
// If a kit exists, verify its public API without prescribing one exact function
// name: aerial/special-purpose functions and metrics contracts are both valid.
const optionalQualityKits = [
  '../src/virtual-robot-designer/studio/mission-world/MissionReferenceQualityKit.js',
  '../src/virtual-robot-designer/studio/aerial-world/AerialReferenceQualityKit.js',
  '../src/virtual-robot-designer/studio/mission-world/MissionSpecialQualityKit.js',
  '../src/virtual-robot-designer/studio/mission-world/MissionSpecialArenaQualityKit.js',
];
for (const relativePath of optionalQualityKits) {
  const moduleUrl = new URL(relativePath, import.meta.url);
  try {
    await access(moduleUrl);
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }
  const qualityKit = await import(moduleUrl.href);
  const qualityFunctions = Object.entries(qualityKit)
    .filter(([name, value]) => typeof value === 'function' && /(?:reference|quality|aerial|special|metric)/i.test(name));
  const metricsContracts = Object.entries(qualityKit)
    .filter(([name, value]) => /metrics?/i.test(name) && value && typeof value === 'object' && !Array.isArray(value));
  assert.ok(
    qualityFunctions.length > 0,
    `${relativePath} must export a reference-quality, aerial/special-quality, or metrics function`,
  );
  for (const [name, metrics] of metricsContracts) {
    assert.ok(Object.keys(metrics).length > 0, `${relativePath} ${name} metrics contract is empty`);
  }
}

console.log('PASS: 330 missions have complete static art direction, unique IDs/progression/fingerprints, valid runtime contracts and geometry (no screenshot pixel-parity claim).');
