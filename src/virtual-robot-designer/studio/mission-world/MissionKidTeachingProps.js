/**
 * One objective-specific teaching landmark per mission.
 * A landmark may contain repeated parts (three puddles, six lasers), but is
 * treated as one readable idea and one item in the scene budget.
 */
import * as THREE from 'three';
import { getMissionArtDirection } from './MissionVisualBibleV2.js';

const FAMILY_COLORS = {
  martian: [0xc65f45, 0xfbbf24],
  industrial: [0xfacc15, 0x3b82f6],
  underwater: [0x06b6d4, 0xf472b6],
  emergency: [0xf97316, 0x3b82f6],
  cyber_ninja: [0xec4899, 0x22d3ee],
  spider_climber: [0xcbd5e1, 0x22c55e],
  boxing_mech: [0xef4444, 0x3b82f6],
  sky_aerial: [0x38bdf8, 0xfbbf24],
  hybrid_race_sky: [0x06b6d4, 0xec4899],
  flappy: [0x22c55e, 0xfbbf24],
  sandbox: [0x3b82f6, 0xfacc15],
};

function missionText(challenge) {
  const art = getMissionArtDirection(challenge);
  return {
    art,
    text: [
      art?.title,
      art?.lookDescription,
      art?.heroDescription,
      art?.goalDescription,
      challenge?.name,
      challenge?.modeName,
      challenge?.primaryObjective?.label,
    ].filter(Boolean).join(' ').toLowerCase(),
  };
}

export function classifyKidMissionFeature(challenge) {
  const { art, text } = missionText(challenge);
  const env = art?.environmentId || challenge?.environmentId || 'sandbox';
  const mode = Number(art?.modeNumber || challenge?.modeIndex || 1);

  if (mode === 10 || /capstone|master|champion/.test(text)) return 'capstone_course';
  if (/central core|power core|fortress core/.test(text)) return 'core';
  if (/sumo|ring out|ring-out/.test(text)) return 'sumo_zone';
  if (/shield|block stance|iron guard/.test(text)) return 'shield';
  if (/minefield|cartoon mine/.test(text)) return 'mines';
  if (/cooling|overheat|thermal vent/.test(text)) return 'cooling_pads';
  if (/mud|puddle|traction/.test(text)) return 'puddles';
  if (/log bridge|bridge crossing|span gap|bridge construction/.test(text)) return 'bridge';
  if (/boulder|rocky field/.test(text)) return 'boulders';
  if (/earthquake|fissure|ground shake/.test(text)) return 'fissures';
  if (/dune/.test(text)) return 'dunes';
  if (/incline|stair|ascent|ladder climb|slope/.test(text)) return 'ramp';
  if (/trench|tunnel dig|cave-in|mine tunnel/.test(text)) return 'tunnel';
  if (/apple|orchard/.test(text)) return 'trees';
  if (/plant|seed|crop|plow|wheat|harvest|farm/.test(text)) return 'crop_rows';
  if (/water every|watering|sprinkler/.test(text)) return 'water_stops';
  if (/crystal|ore|mining|drill|sample core/.test(text)) return 'crystal_nodes';
  if (/sort|hopper|quality control|reject defective/.test(text)) return 'sorting_bins';
  if (/crate|cargo|payload|haul|deliver|package|girder|beam placement/.test(text)) return 'cargo';
  if (/terminal|hack|code|access card|vault lock|alarm panel/.test(text)) return 'terminal';
  if (/laser grid/.test(text)) return 'laser_grid';
  if (/cloak|shadow zone|silent foot|noise meter|blind spot/.test(text)) return 'shadow_zones';
  if (/wall|bunker|barrier|smash|demolition|stomp siege/.test(text)) return 'barriers';
  if (/target|accuracy|cannon|strike|shuriken|bullseye/.test(text)) return 'targets';
  if (env === 'boxing_mech' && /duel|showdown|fight|survival|brawl|knockout|combo|counter/.test(text)) return 'opponent_only';
  if (/rescue|patient|triage|bandage|medkit|evacuee|lifeline/.test(text)) return 'rescue_target';
  if (/fire|blaze|hydrant|foam|flashover/.test(text)) return 'fire_zone';
  if (/snow|avalanche/.test(text)) return 'snow_beacons';
  if (/gas|vent|heat signature|hazard/.test(text)) return 'hazard_zones';
  if (/coral|reef/.test(text)) return 'coral_arches';
  if (/buoyancy|hold depth|pressure/.test(text)) return 'depth_gates';
  if (/wreck|artifact|relic|ruin/.test(text)) return 'wreck';
  if (/current/.test(text)) return 'current_arrows';
  if (/pipeline|seal crack/.test(text)) return 'pipeline';
  if (/squid|anglerfish|marine species/.test(text)) return 'sea_creature';
  if (/balance beam|stability/.test(text)) return 'balance_beam';
  if (/jump|hurdle/.test(text)) return 'hurdles';
  if (/stack|brick|block|lego/.test(text)) return 'blocks';
  if (/conveyor|assembly|stamp|wrap|production/.test(text)) return 'machine';
  if (/dance|gesture|pose/.test(text)) return 'pose_station';
  if (/web|spider|ceiling crawl/.test(text)) return 'web_wall';
  if (/patrol|search|scan|survey|sweep|waypoint|sector/.test(text)) return 'beacons';
  if (/ring|slalom|flight|glide|hover|aerial|sky/.test(text)) return 'sky_marker';

  if (env === 'underwater') return 'coral_arches';
  if (env === 'emergency') return 'rescue_target';
  if (env === 'cyber_ninja') return 'terminal';
  if (env === 'spider_climber') return 'web_wall';
  if (env === 'boxing_mech') return 'targets';
  if (env === 'sky_aerial' || env === 'hybrid_race_sky') return 'sky_marker';
  if (env === 'sandbox') return 'lab_station';
  if (env === 'martian') return 'beacons';
  return 'machine';
}

function mat(color, emissive = 0, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity,
    roughness: 0.72,
    metalness: 0.04,
  });
}

function mesh(geometry, material, position, group) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  group.add(object);
  return object;
}

function addPost(group, x, z, color, y = 1.1) {
  mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.2, 10), mat(0x475569), [x, y, z], group);
  mesh(new THREE.SphereGeometry(0.32, 12, 8), mat(color, color, 0.35), [x, y + 1.15, z], group);
}

function addFeatureGeometry(group, kind, colors, aerial, combat) {
  const [primary, secondary] = colors;
  const y = combat ? 0.62 : (aerial ? 0 : 0.04);

  if (kind === 'puddles') {
    [-4, 0, 4].forEach(z => mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.08, 24), mat(0x795548), [0, y, z], group));
  } else if (kind === 'bridge' || kind === 'balance_beam') {
    mesh(new THREE.BoxGeometry(kind === 'bridge' ? 3.2 : 1.2, 0.35, 13), mat(0xa16207), [0, y + 0.25, 0], group);
  } else if (kind === 'boulders') {
    [[-2.7,-4], [2.5,-2], [-2.2,1], [2.7,3], [0,5]].forEach(([x,z], i) => {
      const rock = mesh(new THREE.DodecahedronGeometry(0.85 + (i % 2) * 0.25, 0), mat(0x9a5d45), [x, y + 0.8, z], group);
      rock.scale.y = 0.82;
    });
  } else if (kind === 'dunes') {
    [-4, 0, 4].forEach(z => {
      const dune = mesh(new THREE.SphereGeometry(2.4, 18, 10), mat(0xe58a45), [0, y - 0.5, z], group);
      dune.scale.set(1.6, 0.5, 1);
    });
  } else if (kind === 'fissures') {
    [-3, 0, 3].forEach((z, i) => {
      const crack = mesh(new THREE.BoxGeometry(5, 0.06, 0.18), mat(0xef4444, 0xef4444, 0.45), [0, y, z], group);
      crack.rotation.y = (i - 1) * 0.16;
    });
  } else if (kind === 'ramp') {
    for (let i = 0; i < 5; i++) mesh(new THREE.BoxGeometry(4.5, 0.45 + i * 0.35, 2.2), mat(0x94a3b8), [0, y + i * 0.18, i * 2.1 - 4], group);
  } else if (kind === 'tunnel') {
    [-3.5, 0, 3.5].forEach(z => {
      const arch = mesh(new THREE.TorusGeometry(2.6, 0.32, 10, 24, Math.PI), mat(0x78716c), [0, y + 0.1, z], group);
      arch.rotation.z = Math.PI;
    });
  } else if (kind === 'trees') {
    [-3.2, 0, 3.2].forEach((x, i) => {
      mesh(new THREE.CylinderGeometry(0.24, 0.32, 2.2, 10), mat(0x92400e), [x, y + 1.1, i % 2 ? 1.5 : -1], group);
      mesh(new THREE.SphereGeometry(1.25, 12, 9), mat(0x22c55e), [x, y + 2.7, i % 2 ? 1.5 : -1], group);
    });
  } else if (kind === 'crop_rows') {
    [-1.8, 0, 1.8].forEach(x => mesh(new THREE.BoxGeometry(0.65, 0.28, 11), mat(0x65a30d), [x, y + 0.18, 0], group));
  } else if (kind === 'water_stops') {
    [-3, 0, 3].forEach(z => mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 20), mat(0x38bdf8, 0x38bdf8, 0.25), [0, y, z], group));
  } else if (kind === 'crystal_nodes') {
    [-2.5, 0, 2.5].forEach((x, i) => {
      const crystal = mesh(new THREE.ConeGeometry(0.65, 2.2, 6), mat(secondary, secondary, 0.3), [x, y + 1.1, i % 2 ? 1.5 : -1], group);
      crystal.rotation.z = (i - 1) * 0.12;
    });
  } else if (kind === 'sorting_bins') {
    [-1.5, 1.5].forEach((x, i) => mesh(new THREE.CylinderGeometry(1, 0.78, 1.8, 12), mat(i ? 0x3b82f6 : 0xef4444), [x, y + 0.9, 0], group));
  } else if (kind === 'cargo') {
    mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), mat(primary), [-1.8, y + 0.9, 0], group);
    mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 24), mat(0x22c55e, 0x22c55e, 0.28), [2.2, y, 0], group);
  } else if (kind === 'terminal' || kind === 'lab_station') {
    mesh(new THREE.BoxGeometry(2.2, 2.5, 1.2), mat(0x334155), [0, y + 1.25, 0], group);
    mesh(new THREE.BoxGeometry(1.45, 0.9, 0.08), mat(secondary, secondary, 0.55), [0, y + 1.55, -0.64], group);
  } else if (kind === 'laser_grid') {
    for (let i = 0; i < 6; i++) {
      const beam = mesh(new THREE.CylinderGeometry(0.055, 0.055, 5.4, 8), mat(primary, primary, 0.8), [0, y + 0.45 + (i % 3) * 0.62, -2.2 + Math.floor(i / 3) * 4.4], group);
      beam.rotation.z = Math.PI / 2;
    }
  } else if (kind === 'shadow_zones') {
    [-3, 0, 3].forEach(z => mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 24), mat(0x111827), [0, y, z], group));
  } else if (kind === 'barriers') {
    [-3, 0, 3].forEach(z => mesh(new THREE.BoxGeometry(4.3, 1.8, 0.55), mat(0x94a3b8), [0, y + 0.9, z], group));
  } else if (kind === 'targets') {
    [-2.4, 0, 2.4].forEach((x, i) => {
      mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.18, 24), mat(i === 1 ? secondary : primary, primary, 0.2), [x, y + 1.5, 0], group).rotation.x = Math.PI / 2;
    });
  } else if (kind === 'rescue_target') {
    mesh(new THREE.CapsuleGeometry(0.65, 1.2, 6, 12), mat(secondary), [0, y + 1.2, 0], group);
    mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 24), mat(0x22c55e, 0x22c55e, 0.28), [0, y, 0], group);
  } else if (kind === 'fire_zone') {
    [-0.8, 0, 0.8].forEach((x, i) => {
      const flame = mesh(new THREE.ConeGeometry(0.55, 1.8 + i * 0.25, 10), mat(0xf97316, 0xf97316, 0.45), [x, y + 0.9, 0], group);
      flame.rotation.z = (i - 1) * 0.16;
    });
  } else if (kind === 'snow_beacons' || kind === 'beacons') {
    [-3, 0, 3].forEach(z => addPost(group, 0, z, kind === 'snow_beacons' ? 0xf97316 : secondary, y + 1.1));
  } else if (kind === 'hazard_zones' || kind === 'cooling_pads') {
    [-2.2, 2.2].forEach(x => mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.08, 24), mat(kind === 'cooling_pads' ? 0x38bdf8 : 0xef4444, kind === 'cooling_pads' ? 0x38bdf8 : 0xef4444, 0.25), [x, y, 0], group));
  } else if (kind === 'coral_arches' || kind === 'depth_gates' || kind === 'sky_marker') {
    const count = kind === 'depth_gates' ? 4 : (kind === 'sky_marker' ? 1 : 2);
    for (let i = 0; i < count; i++) {
      const ring = mesh(new THREE.TorusGeometry(kind === 'sky_marker' ? 2.8 : 1.8, 0.28, 10, 24), mat(kind === 'coral_arches' ? 0xf472b6 : primary, primary, 0.18), [(i - (count - 1) / 2) * 3.8, y + 2, 0], group);
      ring.rotation.y = aerial ? 0 : Math.PI / 2;
    }
  } else if (kind === 'wreck') {
    const hull = mesh(new THREE.BoxGeometry(5.5, 1.3, 2.2), mat(0x92400e), [0, y + 0.65, 0], group);
    hull.rotation.z = -0.12;
  } else if (kind === 'current_arrows') {
    [-3, 0, 3].forEach(z => {
      const arrow = mesh(new THREE.ConeGeometry(0.5, 1.7, 8), mat(primary, primary, 0.2), [0, y + 1.2, z], group);
      arrow.rotation.x = -Math.PI / 2;
    });
  } else if (kind === 'pipeline') {
    const pipe = mesh(new THREE.CylinderGeometry(0.7, 0.7, 8, 16), mat(0x64748b), [0, y + 0.8, 0], group);
    pipe.rotation.z = Math.PI / 2;
  } else if (kind === 'sea_creature') {
    mesh(new THREE.SphereGeometry(1.35, 16, 10), mat(0xa855f7), [0, y + 1.5, 0], group);
    [-1, 0, 1].forEach(x => mesh(new THREE.CapsuleGeometry(0.16, 1.5, 4, 8), mat(0xa855f7), [x * 0.55, y + 0.1, 0], group));
  } else if (kind === 'hurdles') {
    [-3, -1, 1, 3].forEach(z => mesh(new THREE.BoxGeometry(4, 0.35, 0.35), mat(primary), [0, y + 1, z], group));
  } else if (kind === 'blocks') {
    for (let i = 0; i < 5; i++) mesh(new THREE.BoxGeometry(1.15, 0.7, 1.15), mat(i % 2 ? primary : secondary), [(i - 2) * 1.05, y + 0.35 + (i % 2) * 0.55, 0], group);
  } else if (kind === 'machine') {
    mesh(new THREE.BoxGeometry(4.2, 2.8, 2), mat(0x64748b), [0, y + 1.4, 0], group);
    mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.2, 14), mat(primary), [0, y + 2.9, 0], group);
  } else if (kind === 'pose_station') {
    mesh(new THREE.BoxGeometry(2.8, 3.2, 0.2), mat(0x93c5fd), [0, y + 1.6, 0], group);
  } else if (kind === 'web_wall') {
    mesh(new THREE.BoxGeometry(5.5, 5.5, 0.35), mat(0x64748b), [0, y + 2.75, 0], group);
    [-1.8, 0, 1.8].forEach(x => mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 6), mat(secondary, secondary, 0.25), [x, y + 2.75, -0.22], group));
  } else if (kind === 'core') {
    mesh(new THREE.CylinderGeometry(0.75, 1, 1, 16), mat(0x475569), [0, y + 0.5, 1.8], group);
    mesh(new THREE.SphereGeometry(0.72, 18, 12), mat(0x3b82f6, 0x3b82f6, 0.55), [0, y + 1.65, 1.8], group);
  } else if (kind === 'sumo_zone') {
    const zone = mesh(new THREE.RingGeometry(2.15, 2.4, 48), mat(primary), [0, y + 0.02, 0], group);
    zone.rotation.x = -Math.PI / 2;
  } else if (kind === 'shield') {
    mesh(new THREE.SphereGeometry(1.8, 20, 14), new THREE.MeshStandardMaterial({ color: secondary, transparent: true, opacity: 0.2, roughness: 0.25 }), [0, y + 1.6, 0], group);
  } else if (kind === 'mines') {
    [[-1.8,-1.8], [0,-1.8], [1.8,-1.8], [-1.8,1.8], [0,1.8], [1.8,1.8]].forEach(([x,z]) => mesh(new THREE.SphereGeometry(0.34, 10, 7), mat(0xef4444), [x, y + 0.18, z], group));
  } else if (kind === 'capstone_course') {
    [-3.5, 0, 3.5].forEach((z, i) => addPost(group, 0, z, i === 2 ? 0x22c55e : colors[i % 2], y + 1.1));
  }
}

export function applyKidMissionTeachingProps(scene, challenge, curve = null, options = {}) {
  if (scene.getObjectByName('KidMissionTeachingProps')) return scene.getObjectByName('KidMissionTeachingProps');
  const art = getMissionArtDirection(challenge);
  if (!art) return null;

  const kind = options.kind || classifyKidMissionFeature(challenge);
  const env = art.environmentId || 'sandbox';
  const colors = FAMILY_COLORS[env] || FAMILY_COLORS.sandbox;
  const aerial = options.mode === 'aerial';
  const combat = options.mode === 'combat';
  const anchorT = options.anchorT ?? 0.55;
  const anchor = curve?.getPoint ? curve.getPoint(anchorT) : new THREE.Vector3(0, 0, combat ? 0 : -32);

  const root = new THREE.Group();
  root.name = 'KidMissionTeachingProps';
  const feature = new THREE.Group();
  feature.name = `KidFeature_${kind}`;
  feature.position.copy(anchor);
  feature.position.x += options.offsetX || 0;
  feature.position.z += options.offsetZ || 0;
  if (aerial) feature.position.y += 0.5;
  addFeatureGeometry(feature, kind, colors, aerial, combat);
  root.add(feature);
  scene.add(root);
  scene.userData.kidMissionFeature = kind;
  return root;
}
