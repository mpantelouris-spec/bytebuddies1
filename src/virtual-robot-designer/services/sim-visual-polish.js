/**
 * sim-visual-polish.js — Game-like atmosphere, particles, and robot animation helpers for Live Lab.
 */
import * as THREE from 'three';

export const ARENA_THEMES = {
  ground:      { sky: 0xb8dce8, fog: 0xc8e6f0, accent: 0x3b82f6, particles: 'spark',  label: 'Training Lab' },
  line_follow: { sky: 0xdce8f4, fog: 0xe8f0f8, accent: 0x10b981, particles: 'spark',  label: 'Tech Track' },
  sky:         { sky: 0x87ceeb, fog: 0xb0d8f8, accent: 0x0ea5e9, particles: 'cloud',  label: 'Sky World' },
  hover:       { sky: 0xd8e4f0, fog: 0xe0e8f4, accent: 0x6366f1, particles: 'cloud',  label: 'Hover Course' },
  neon_race:   { sky: 0xd0dcf0, fog: 0xdce4f4, accent: 0xec4899, particles: 'spark',  label: 'Race Track' },
  neon_city:   { sky: 0xd0dcf0, fog: 0xdce4f4, accent: 0x0ea5e9, particles: 'spark',  label: 'City Course' },
  jungle:      { sky: 0x2d5a27, fog: 0x1a3d14, accent: 0x22c55e, particles: 'firefly',label: 'Fantasy Forest' },
  jungle_maze: { sky: 0x1e4620, fog: 0x143018, accent: 0x4ade80, particles: 'firefly',label: 'Jungle Maze' },
  terrain:     { sky: 0x3d6b4f, fog: 0x2d5040, accent: 0x10b981, particles: 'firefly',label: 'Wild Terrain' },
  temple_ext:  { sky: 0x4a7a2a, fog: 0x3a6a1a, accent: 0xfbbf24, particles: 'firefly',label: 'Ancient Temple' },
  lego:        { sky: 0xfef3c7, fog: 0xfde68a, accent: 0xef4444, particles: 'spark',  label: 'Candy Kingdom' },
  space:       { sky: 0x000008, fog: null,       accent: 0x94a3b8, particles: 'star',   label: 'Space Station' },
  zero_g:      { sky: 0x000010, fog: null,       accent: 0x7c3aed, particles: 'star',   label: 'Zero-G' },
  underwater:  { sky: 0x0369a1, fog: 0x0c4a6e, accent: 0x06b6d4, particles: 'bubble', label: 'Deep Ocean' },
  rough:       { sky: 0x57534e, fog: 0x44403c, accent: 0xf97316, particles: 'dust',   label: 'Lava Ridge' },
  combat:      { sky: 0x1a0505, fog: 0x2a0808, accent: 0xef4444, particles: 'ember',  label: 'Combat Zone' },
  factory:     { sky: 0x1e1e2e, fog: 0x2a2a3a, accent: 0xec4899, particles: 'spark',  label: 'Factory Floor' },
  jet:         { sky: 0x1e3a5f, fog: 0x0c4a6e, accent: 0xf59e0b, particles: 'cloud',  label: 'Jet Canyon' },
  cavern:      { sky: 0x0a0a14, fog: 0x120820, accent: 0x8b5cf6, particles: 'firefly',label: 'Crystal Cavern' },
  crystal_cave:{ sky: 0x0a0a18, fog: 0x180828, accent: 0xa855f7, particles: 'firefly',label: 'Crystal Cave' },
};

export function resolveArenaTheme(arenaType, challenge) {
  const cat = challenge?.cat || challenge?.trackId || '';
  if (/jungle|forest|temple|terrain|jungle_expedition/i.test(arenaType + cat)) return ARENA_THEMES.jungle;
  if (/space|zero_g|asteroid/i.test(arenaType)) return ARENA_THEMES.space;
  if (/underwater|ocean|coral/i.test(arenaType)) return ARENA_THEMES.underwater;
  if (/neon|hover|cyber|transit_tunnel/i.test(arenaType)) return ARENA_THEMES.neon_city;
  if (/disaster|rescue/i.test(arenaType + cat)) return ARENA_THEMES.rough;
  if (/hospital|warehouse_sort/i.test(arenaType)) return ARENA_THEMES.factory;
  if (/lego|candy|block/i.test(arenaType)) return ARENA_THEMES.lego;
  if (/combat|lava|rough|volcano|warzone/i.test(arenaType)) return ARENA_THEMES.rough;
  if (/jet|stunt|supersonic|sky|drone_canyon|drone_rooftop|drone_survey/i.test(arenaType)) return ARENA_THEMES.sky;
  if (/deep_trench|trench/i.test(arenaType)) return ARENA_THEMES.underwater;
  return ARENA_THEMES[arenaType] || ARENA_THEMES.ground;
}

function makeParticleTexture(color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/** Floating atmospheric particles — visible but lightweight */
export function addAtmosphereParticles(scene, themeKey, bounds = { x: 36, y: 14, z: 70 }) {
  const theme = typeof themeKey === 'object' ? themeKey : (ARENA_THEMES[themeKey] || ARENA_THEMES.ground);
  const count = theme.particles === 'star' ? 500 : theme.particles === 'bubble' ? 100 : 220;
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const colors = {
    spark: 0x60a5fa, neon: 0xec4899, firefly: 0xa3e635, star: 0xffffff,
    bubble: 0x7dd3fc, dust: 0xd97706, ember: 0xf97316, cloud: 0xffffff,
  };
  const col = colors[theme.particles] || 0xffffff;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * bounds.x;
    positions[i * 3 + 1] = Math.random() * bounds.y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z - 10;
    velocities.push({
      x: (Math.random() - 0.5) * 0.4,
      y: theme.particles === 'bubble' ? 0.15 + Math.random() * 0.2 : (Math.random() - 0.5) * 0.15,
      z: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const size = theme.particles === 'star' ? 0.38 : theme.particles === 'firefly' ? 0.28 : 0.22;
  const mat = new THREE.PointsMaterial({
    size,
    map: makeParticleTexture(`rgba(${(col >> 16) & 255},${(col >> 8) & 255},${col & 255},1)`),
    transparent: true,
    opacity: theme.particles === 'star' ? 0.95 : 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'atmoParticles';
  points.frustumCulled = false;
  scene.add(points);

  return {
    mesh: points,
    update(t, dt, robotPos) {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const v = velocities[i];
        pos[i * 3] += v.x * dt;
        pos[i * 3 + 1] += v.y * dt + Math.sin(t * 2 + v.phase) * 0.002;
        pos[i * 3 + 2] += v.z * dt;
        if (robotPos && theme.particles === 'firefly') {
          const dx = pos[i * 3] - robotPos.x;
          const dz = pos[i * 3 + 2] - robotPos.z;
          if (dx * dx + dz * dz < 16) pos[i * 3 + 1] += dt * 0.3;
        }
        if (pos[i * 3 + 1] > bounds.y) pos[i * 3 + 1] = 0;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = bounds.y;
        if (Math.abs(pos[i * 3]) > bounds.x / 2) pos[i * 3] *= -0.9;
        if (pos[i * 3 + 2] < -bounds.z) pos[i * 3 + 2] = 10;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.5 + Math.sin(t * 1.5) * 0.15;
    },
    dispose() {
      scene.remove(points);
      geo.dispose();
      mat.dispose();
    },
  };
}

/** Soft gradient sky dome */
export function addSkyGradient(scene, theme) {
  const top = new THREE.Color(theme.sky);
  const bottom = top.clone().lerp(new THREE.Color(0x000000), 0.35);
  const canvas = document.createElement('canvas');
  canvas.width = 2; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, `#${top.getHexString()}`);
  grad.addColorStop(1, `#${bottom.getHexString()}`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  if (theme.fog != null) scene.fog = new THREE.Fog(theme.fog, 40, 95);
}

/** Large floating props — immediately visible game dressing */
export function addFloatingDecorations(scene, theme, arenaType) {
  const g = new THREE.Group();
  g.name = 'arenaDecor';
  const accent = new THREE.Color(theme.accent || 0x3b82f6);
  const cols = [accent, new THREE.Color(0xec4899), new THREE.Color(0x22c55e), new THREE.Color(0xfbbf24)];

  if (/jungle|forest|terrain|temple/i.test(arenaType)) {
    [[-12, 0, -8], [14, 0, -18], [-10, 0, -32]].forEach(([x, , z], i) => {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.8 - i * 0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4ade80, emissiveIntensity: 0.35, roughness: 0.6 }),
      );
      cap.position.set(x, 0.1, z);
      cap.scale.set(1 + i * 0.15, 0.55, 1 + i * 0.15);
      g.add(cap);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 1.2, 10),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.8 }),
      );
      stem.position.set(x, 0.6, z);
      g.add(stem);
    });
  } else if (/space|zero_g|asteroid/i.test(arenaType)) {
    for (let i = 0; i < 5; i++) {
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(1.2 + (i % 3) * 0.5, 20, 16),
        new THREE.MeshStandardMaterial({
          color: [0x6366f1, 0xf97316, 0x06b6d4, 0xa855f7, 0x22c55e][i],
          emissive: 0x222244,
          emissiveIntensity: 0.4,
          metalness: 0.3,
          roughness: 0.55,
        }),
      );
      planet.position.set(-20 + i * 9, 8 + (i % 2) * 2, -35 - i * 6);
      planet.userData.decorSpin = 0.15 + i * 0.05;
      g.add(planet);
    }
  } else {
    // Soft course markers — readable, not neon clutter
    [-14, 14].forEach((x, i) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 2.2, 10),
        new THREE.MeshStandardMaterial({
          color: cols[i % cols.length],
          emissive: cols[i % cols.length],
          emissiveIntensity: 0.25,
          metalness: 0.06,
          roughness: 0.78,
        }),
      );
      pillar.position.set(x, 1.1, -12);
      g.add(pillar);
    });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.8 + i * 0.3, 0.07, 8, 32),
        new THREE.MeshStandardMaterial({
          color: cols[i % cols.length],
          emissive: cols[i % cols.length],
          emissiveIntensity: 0.2,
          metalness: 0.05,
          roughness: 0.75,
          transparent: true,
          opacity: 0.7,
        }),
      );
      ring.position.set((i % 2 === 0 ? -8 : 8), 3.5 + i * 0.3, -10 - i * 8);
      ring.rotation.x = Math.PI / 2 + 0.2;
      ring.userData.decorSpin = 0.15 + i * 0.06;
      g.add(ring);
    }
  }

  scene.add(g);
  return {
    group: g,
    update(t) {
      g.children.forEach((c) => {
        if (c.userData.decorSpin) c.rotation.z += c.userData.decorSpin * 0.016;
        if (c.geometry?.type === 'SphereGeometry' && c.position.y > 5) {
          c.position.y += Math.sin(t * 0.8 + c.position.x) * 0.002;
        }
      });
    },
  };
}

/** Golden pollen motes — forest courses only */
function _makeForestParticles(scene, color, count, size, speed, bounds) {
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * bounds.x;
    positions[i * 3 + 1] = 0.3 + Math.random() * bounds.y;
    positions[i * 3 + 2] = 8 - Math.random() * bounds.z;
    velocities.push({ phase: Math.random() * Math.PI * 2, s: speed * (0.6 + Math.random() * 0.8) });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size, color,
    transparent: true, opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  return { pts, geo, mat, velocities, count, bounds };
}

export function addPollenParticles(scene, theme) {
  // Layer 1: golden pollen / dust motes
  const p1 = _makeForestParticles(scene, 0xffdd44, 160, 0.22, 0.1, { x: 44, y: 9, z: 72 });
  // Layer 2: magic fireflies — green
  const p2 = _makeForestParticles(scene, 0x44ff88, 80, 0.32, 0.06, { x: 38, y: 7, z: 68 });
  // Layer 3: purple sparkles
  const p3 = _makeForestParticles(scene, 0xcc44ff, 60, 0.28, 0.08, { x: 36, y: 6, z: 65 });
  // Layer 4: blue motes
  const p4 = _makeForestParticles(scene, 0x44aaff, 50, 0.20, 0.07, { x: 42, y: 8, z: 70 });
  // Layer 5: orange embers
  const p5 = _makeForestParticles(scene, 0xff8800, 40, 0.18, 0.12, { x: 32, y: 5, z: 60 });

  const layers = [p1, p2, p3, p4, p5];

  return {
    mesh: p1.pts,
    update(t, dt) {
      layers.forEach(({ geo, mat, velocities, count, bounds }, li) => {
        const pos = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          const v = velocities[i];
          pos[i * 3]     += Math.sin(t * v.s + v.phase) * dt * 0.4;
          pos[i * 3 + 1] += Math.sin(t * 0.5 + v.phase * 1.3) * dt * 0.12;
          pos[i * 3 + 2] += dt * 0.04;
          if (pos[i * 3 + 2] > 9) pos[i * 3 + 2] = 8 - bounds.z;
        }
        geo.attributes.position.needsUpdate = true;
        // Fireflies pulse brightness
        mat.opacity = 0.6 + Math.sin(t * (1.2 + li * 0.3) + li) * 0.38;
        // Size pulse for fireflies
        if (li === 1 || li === 2) mat.size = 0.28 + Math.sin(t * 2.5 + li * 1.1) * 0.12;
      });
    },
    dispose() {
      layers.forEach(({ pts, geo, mat }) => { scene.remove(pts); geo.dispose(); mat.dispose(); });
    },
  };
}

export function applyArenaAtmosphere(scene, arenaType, challenge) {
  const theme = resolveArenaTheme(arenaType, challenge);
  const isForest = arenaType === 'ground' || challenge?.id === 'fox_battery_chase' || challenge?.isFoxChase;
  if (isForest) {
    const pollen = addPollenParticles(scene, theme);
    scene.userData.pollen = pollen;
    scene.userData.arenaTheme = theme;
    return theme;
  }
  if (!scene.userData.customSky) addSkyGradient(scene, theme);
  const atmo = addAtmosphereParticles(scene, theme);
  const decor = addFloatingDecorations(scene, theme, arenaType);
  scene.userData.atmo = atmo;
  scene.userData.decor = decor;
  scene.userData.arenaTheme = theme;
  return theme;
}

/** Spin wheel meshes while robot moves */
export function animateRobotWheels(robot, rs, dt, movId, mode) {
  if (mode !== 'running' && mode !== 'step') return;
  const moving = rs.stepTime > 0 || rs.totalDist > 0.01;
  if (!moving) return;
  const spin = dt * (movId === 'tracks' ? 4 : movId === 'wheels6' ? 5 : 6) * (rs.stopTimer > 0 ? 0 : 1);
  robot.traverse((o) => {
    if (o.userData?.isWheel) o.rotation.x += spin;
  });
}

/** Subtle idle bounce + LED pulse */
export function animateRobotIdle(robot, t, mode) {
  if (mode !== 'idle') return;
  robot.traverse((o) => {
    if (!o.isMesh || !o.material?.emissive) return;
    if (o.userData?.isLed) {
      o.material.emissiveIntensity = 0.4 + Math.sin(t * 4 + (o.id || 0)) * 0.35;
    }
  });
}

/** Dust puff when wheels move on ground */
export function emitWheelDust(emitFn, rs, movId, mode) {
  if ((mode !== 'running' && mode !== 'step') || movId === 'flying' || movId === 'jets') return;
  if (Math.random() > 0.65) return;
  const backX = rs.x - Math.sin(rs.angle) * 0.5;
  const backZ = rs.z - Math.cos(rs.angle) * 0.5;
  emitFn(backX, (rs.y || 0) + 0.05, backZ, 2, 0.05);
}
