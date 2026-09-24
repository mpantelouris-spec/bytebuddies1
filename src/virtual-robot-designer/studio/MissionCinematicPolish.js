/**
 * MissionCinematicPolish — Nintendo-grade dressing for chassis + campaign missions.
 * Neon routes, landmark props, bloom, cinematic lights, environmental FX.
 */
import * as THREE from 'three';
import { arenaMover } from './ArenaBuilderCore.js';
import { resolveArenaTheme } from '../services/sim-visual-polish.js';
import { scatterFamilyArena, applyFamilyHeroKit } from './ArenaBroadcastKit.js';
import { emberParticles, snowParticles, bubbleParticles, dustParticles } from './ArenaBuilderCore.js';

function mat(col, em = 0, ei = 0, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: col, emissive: em || col, emissiveIntensity: ei,
    roughness: opts.roughness ?? 0.65, metalness: opts.metalness ?? 0.15, ...opts,
  });
}

function makeRoadTexture(accentHex, glowHex) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1f2e';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      ctx.fillStyle = `hsl(220,12%,${14 + Math.random() * 6}%)`;
      ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.strokeStyle = `#${glowHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = `#${accentHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 248, 248);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  return tex;
}

function boostBloom(scene, accent) {
  scene.userData.raceVisual = {
    bloom: 0.38,
    threshold: 0.82,
    radius: 0.36,
    accent,
  };
  scene.userData.cinematicMission = true;
}

function addCinematicLights(scene, accent, curve) {
  if (scene.getObjectByName('MissionCineLights')) return;
  const g = new THREE.Group();
  g.name = 'MissionCineLights';
  const ac = new THREE.Color(accent);
  const rim = new THREE.DirectionalLight(ac, 0.45);
  rim.position.set(-12, 18, 8);
  g.add(rim);
  const fill = new THREE.HemisphereLight(ac.clone().lerp(new THREE.Color(0xffffff), 0.5), 0x0f172a, 0.55);
  g.add(fill);
  if (curve) {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const p = curve.getPoint(t);
      const pl = new THREE.PointLight(ac, 1.8, 14, 2);
      pl.position.set(p.x, 2.5, p.z);
      g.add(pl);
      arenaMover(scene, (time) => {
        pl.intensity = 1.2 + Math.sin(time * 2.5 + i) * 0.6;
      });
    }
  }
  scene.add(g);
}

function addNeonRouteRibbon(scene, curve, accent, glow) {
  if (!curve || scene.getObjectByName('NeonRouteRibbon')) return;
  const pts = [];
  for (let i = 0; i <= 64; i++) pts.push(curve.getPoint(i / 64).clone().setY(0.22));
  const path = new THREE.CatmullRomCurve3(pts);
  const tubeGeo = new THREE.TubeGeometry(path, 80, 0.14, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: glow, emissive: accent, emissiveIntensity: 1.4,
    transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.4,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.name = 'NeonRouteRibbon';
  scene.add(tube);
  arenaMover(scene, (t) => {
    tubeMat.emissiveIntensity = 1.0 + Math.sin(t * 3) * 0.45;
    tubeMat.opacity = 0.7 + Math.sin(t * 2) * 0.15;
  });

  // Side laser rails
  for (let side = -1; side <= 1; side += 2) {
    const railPts = pts.map((p, i) => {
      const t = i / (pts.length - 1);
      const tan = curve.getTangent(t).normalize();
      const perpX = -tan.z * side * 2.6;
      const perpZ = tan.x * side * 2.6;
      return new THREE.Vector3(p.x + perpX, 0.35, p.z + perpZ);
    });
    const railPath = new THREE.CatmullRomCurve3(railPts);
    const railGeo = new THREE.TubeGeometry(railPath, 60, 0.06, 6, false);
    const railMat = new THREE.MeshStandardMaterial({
      color: accent, emissive: glow, emissiveIntensity: 1.1,
      transparent: true, opacity: 0.9,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    scene.add(rail);
    arenaMover(scene, (t) => {
      railMat.emissiveIntensity = 0.8 + Math.sin(t * 4 + side) * 0.35;
    });
  }
}

function addStartFinishGates(scene, curve, accent, title = 'MISSION') {
  if (!curve) return;
  const start = curve.getPoint(0);
  const end = curve.getPoint(1);
  const buildGate = (p, label, col) => {
    const g = new THREE.Group();
    [-2.8, 2.8].forEach((ox) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.5, 0.35), mat(col, col, 0.5, { metalness: 0.5 }));
      post.position.set(ox, 2.25, 0);
      g.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), mat(0xffffff, col, 1.2));
      cap.position.set(ox, 4.6, 0);
      g.add(cap);
    });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 0.4), mat(col, col, 0.9));
    beam.position.y = 4.2;
    g.add(beam);
    const cnv = document.createElement('canvas');
    cnv.width = 512;
    cnv.height = 96;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.roundRect(8, 8, 496, 80, 12);
    ctx.fill();
    ctx.strokeStyle = `#${col.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label.slice(0, 22), 256, 58);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1.05),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    sign.position.y = 5.2;
    g.add(sign);
    g.position.set(p.x, 0, p.z);
    scene.add(g);
    arenaMover(scene, (t) => {
      beam.material.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.35;
    });
    return g;
  };
  if (!scene.getObjectByName('StartGate')) {
    const sg = buildGate(start, 'START', 0x22c55e);
    sg.name = 'StartGate';
  }
  if (!scene.getObjectByName('FinishGate')) {
    const fg = buildGate(end, title.slice(0, 18).toUpperCase(), accent);
    fg.name = 'FinishGate';
  }
}

function upgradeCheckpointArches(scene, accent) {
  scene.children.filter((c) => c.name === 'cp').forEach((ring, i) => {
    const col = ring.material?.color?.getHex?.() || accent;
    const p = ring.position;
    [-2.4, 2.4].forEach((ox) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 3.8, 8),
        mat(col, col, 0.85, { metalness: 0.35 }),
      );
      post.position.set(p.x + ox, 1.9, p.z);
      scene.add(post);
    });
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.1, 6, 20, Math.PI),
      mat(col, col, 1.0),
    );
    arch.rotation.x = Math.PI / 2;
    arch.rotation.z = Math.PI;
    arch.position.set(p.x, 3.6, p.z);
    scene.add(arch);
    ring.scale.set(1.15, 1.15, 1.15);
    arenaMover(scene, (t) => {
      ring.material.emissiveIntensity = 0.9 + Math.sin(t * 4 + i) * 0.5;
    });
  });
}

const LANDMARK_BUILDERS = {
  martian: (scene, x, z, accent) => {
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 7), mat(0x8b4513, 0xff6644, 0.25));
    spire.position.set(x, 2.25, z);
    scene.add(spire);
    for (let i = 0; i < 4; i++) {
      const cry = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 5), mat(accent, accent, 1.0, { roughness: 0.3 }));
      cry.position.set(x + (i - 1.5) * 0.6, 0.6 + i * 0.2, z + 0.8);
      scene.add(cry);
    }
  },
  underwater: (scene, x, z, accent) => {
  for (let i = 0; i < 6; i++) {
      const h = 1.2 + Math.random() * 2.5;
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.22, h, 6),
        mat([0xf472b6, 0x22d3ee, 0xa855f7][i % 3], 0, 0, { emissiveIntensity: 0.4 }),
      );
      branch.position.set(x + (Math.random() - 0.5) * 2, h / 2, z + (Math.random() - 0.5) * 2);
      branch.rotation.z = (Math.random() - 0.5) * 0.5;
      scene.add(branch);
    }
    const glow = new THREE.PointLight(accent, 1.2, 8);
    glow.position.set(x, 1.5, z);
    scene.add(glow);
  },
  industrial: (scene, x, z, accent) => {
    const crane = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), mat(0x64748b, 0, 0, { metalness: 0.6 }));
    mast.position.y = 3;
    crane.add(mast);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(5, 0.35, 0.35), mat(0xfbbf24, 0xfbbf24, 0.5, { metalness: 0.5 }));
    arm.position.set(2, 5.5, 0);
    crane.add(arm);
    crane.position.set(x, 0, z);
    scene.add(crane);
    arenaMover(scene, (t) => { arm.rotation.z = Math.sin(t * 0.4) * 0.08; });
  },
  forest: (scene, x, z) => {
    const mush = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0xa855f7, 0x7c3aed, 0.35),
    );
    mush.position.set(x, 0.2, z);
    mush.scale.set(1.2, 0.7, 1.2);
    scene.add(mush);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.4, 8), mat(0xf5f5f4, 0, 0));
    stem.position.set(x, 0.7, z);
    scene.add(stem);
    const spore = new THREE.PointLight(0x4ade80, 0.8, 6);
    spore.position.set(x, 2.2, z);
    scene.add(spore);
  },
  sky_aerial: (scene, x, z, accent) => {
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 3, 1.2, 8),
      mat(0x38bdf8, accent, 0.3),
    );
    island.position.set(x, 3.5, z);
    scene.add(island);
    const under = new THREE.PointLight(accent, 1.5, 10);
    under.position.set(x, 2.5, z);
    scene.add(under);
    arenaMover(scene, (t) => { island.position.y = 3.5 + Math.sin(t + z) * 0.25; });
  },
  emergency: (scene, x, z) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 5, 6), mat(0x64748b, 0, 0, { metalness: 0.5 }));
    tower.position.set(x, 2.5, z);
    scene.add(tower);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mat(0xef4444, 0xff0000, 1.2));
    lamp.position.set(x, 5.2, z);
    scene.add(lamp);
    arenaMover(scene, (t) => {
      lamp.material.emissiveIntensity = Math.sin(t * 6) > 0 ? 1.4 : 0.2;
    });
  },
  cyber_ninja: (scene, x, z, accent) => {
    for (let i = 0; i < 4; i++) {
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 0.8),
        mat([0xec4899, 0x06b6d4, accent, 0xfbbf24][i % 4], 0, 0.9),
      );
      sign.position.set(x, 2 + i * 0.6, z + (i % 2 ? 0.3 : -0.3));
      sign.rotation.y = (i % 2 ? 0.3 : -0.3);
      scene.add(sign);
    }
  },
  default: (scene, x, z, accent) => {
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), mat(accent, accent, 1.1, { roughness: 0.3 }));
    beacon.position.set(x, 2, z);
    scene.add(beacon);
    arenaMover(scene, (t) => {
      beacon.rotation.y = t * 0.8;
      beacon.position.y = 2 + Math.sin(t * 2) * 0.2;
    });
  },
};

function addRouteLandmarks(scene, curve, family, accent) {
  if (!curve || scene.getObjectByName('RouteLandmarks')) return;
  const g = new THREE.Group();
  g.name = 'RouteLandmarks';
  const builder = LANDMARK_BUILDERS[family] || LANDMARK_BUILDERS.default;
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const side = i % 2 === 0 ? 1 : -1;
    const x = p.x + (-tan.z * side * 7);
    const z = p.z + (tan.x * side * 7);
    builder(scene, x, z, accent);
  }
  scene.add(g);
}

function addGroundGloss(scene, accent) {
  if (scene.getObjectByName('MissionGroundGloss')) return;
  const gloss = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: accent,
      emissiveIntensity: 0.04,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.6,
    }),
  );
  gloss.rotation.x = -Math.PI / 2;
  gloss.position.y = 0.02;
  gloss.name = 'MissionGroundGloss';
  scene.add(gloss);
}

function addEnvironmentalFX(scene, tags, family) {
  if (scene.userData.cineEnvFX) return;
  if (tags.some((t) => ['lava', 'volcano', 'fire', 'ember'].includes(t)) || family === 'emergency') {
    emberParticles(scene, 380);
  } else if (tags.some((t) => ['snow', 'arctic'].includes(t))) {
    snowParticles(scene, 420);
  } else if (tags.some((t) => ['coral', 'underwater', 'deep', 'tsunami'].includes(t)) || family === 'underwater') {
    bubbleParticles(scene, 320);
  } else if (tags.some((t) => ['desert', 'sand', 'martian'].includes(t)) || family === 'martian') {
    dustParticles(scene, 280);
  } else {
    emberParticles(scene, 120);
  }
  scene.userData.cineEnvFX = true;
}

function resolveFamily(challenge, arenaType) {
  const env = challenge?.environmentId;
  if (env && env !== 'rainbow_road' && env !== 'flappy') return env;
  const key = `${arenaType} ${challenge?.cat || ''}`;
  if (/underwater|coral|reef|trench|kelp|atlantis|mariana|shipwreck/i.test(key)) return 'underwater';
  if (/mars|martian|alien|desert_rally/i.test(key)) return 'martian';
  if (/cyber|shadow|museum|ninja/i.test(key)) return 'cyber_ninja';
  if (/drone|sky|cloud|flight|jet|aerial|hover|warp/i.test(key)) return 'sky_aerial';
  if (/fire|hospital|snow|rescue|emergency/i.test(key)) return 'emergency';
  if (/spider|climb|pipeline/i.test(key)) return 'spider_climber';
  if (/factory|warehouse|industrial|mine/i.test(key)) return 'industrial';
  if (/jungle|forest|farm|garden/i.test(key)) return 'forest';
  return 'industrial';
}

/** Apply full cinematic polish — call after arena + route + mission visuals. */
export function applyMissionCinematicPolish(scene, challenge = {}, arenaType = '') {
  if (scene.userData.combatMode || scene.userData.flappyMode) return;
  if (scene.userData.biomeAAA || scene.userData.mkThemedTrack) return;
  if (!challenge?.isChassisMode && !challenge?.isRobotMission) return;
  if (scene.getObjectByName('MissionCinematicRoot')) return;

  const theme = scene.userData.arenaTheme || resolveArenaTheme(arenaType, challenge);
  const accent = theme?.accent ?? 0x38bdf8;
  const glow = theme?.accent ?? 0x06b6d4;
  const curve = scene.userData._chassisCurve;
  const family = resolveFamily(challenge, arenaType);
  const tags = scene.userData.missionVisualTags || [];

  const root = new THREE.Group();
  root.name = 'MissionCinematicRoot';
  scene.add(root);

  boostBloom(scene, accent);
  addCinematicLights(scene, accent, curve);
  addGroundGloss(scene, accent);
  if (curve) {
    addNeonRouteRibbon(scene, curve, accent, glow);
    addRouteLandmarks(scene, curve, family === 'hybrid_race_sky' ? 'sky_aerial' : family, accent);
    const title = challenge.shortName || challenge.name || 'GOAL';
    addStartFinishGates(scene, curve, accent, title);
    upgradeCheckpointArches(scene, accent);
  }
  addEnvironmentalFX(scene, tags, family);

  const envId = challenge?.environmentId || scene.userData.environmentId;
  if (envId && curve) {
    scatterFamilyArena(scene, envId, curve);
    applyFamilyHeroKit(scene, envId, curve);
  }

  scene.userData.expMood = Math.max(scene.userData.expMood || 1, 1.15);
}
