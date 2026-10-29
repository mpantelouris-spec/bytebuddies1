/**
 * Arenas children build in the Arena Maker, played in the real Robot Studio lab —
 * the same 3D world, robot, blocks, sensors, camera and HUD as the pre-built missions.
 *
 * The grid becomes a real place: each square is CELL world units. Walls, decorations,
 * crates and lava are obstacles the robot bumps into (and its "obstacle ahead" sensor
 * sees); gems, coins and keys are collectibles; the flag is the finish zone; bugs patrol.
 * The robot spawns on the Start square facing "up" the map (-z), like every Studio mission.
 */
import * as THREE from 'three';
import { themeFor, GOALS, normaliseMap } from '../arcade/games/arena.js';
import { boardLook, ladybug } from '../arcade/scene3d.js';
import { installMissionTheme, MISSION_PROPS, MISSION_THEME_ROOT } from './mission-world/themes/MissionThemeKit.js';
import { MISSION_THEME_RECIPES } from './mission-world/themes/recipes/index.js';

export const CELL = 2.4; // one square = one "Move forward" step
const SPAWN_Z = 5; // the lab's default spawn point is (0, 5) facing -z

const std = (color, rough = 0.7, metal = 0.05, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
function mk(geo, mat, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}
function seeded(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** A thin square frame for the top edge of a block wall (the wall's own material shows inside). */
function trimGeometry(w, t = 0.14, h = 0.09) {
  const parts = [
    [w, h, t, 0, (w - t) / 2], [w, h, t, 0, -(w - t) / 2],
    [t, h, w - 2 * t, (w - t) / 2, 0], [t, h, w - 2 * t, -(w - t) / 2, 0],
  ].map(([x, y, z, px, pz]) => new THREE.BoxGeometry(x, y, z).translate(px, 0, pz));
  const geo = new THREE.BufferGeometry();
  const pos = [], nor = [], idx = [];
  let off = 0;
  parts.forEach((g) => {
    const gi = g.toNonIndexed();
    pos.push(...gi.attributes.position.array); nor.push(...gi.attributes.normal.array);
    for (let i = 0; i < gi.attributes.position.count; i++) idx.push(off + i);
    off += gi.attributes.position.count;
  });
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return geo;
}

/** Arena Maker arena → a lab course (a robot mission the lab already knows how to play). */
export function arenaToLabCourse(arena) {
  const map = normaliseMap(arena.map);
  const T = themeFor(arena.theme);
  const count = (ch) => map.join('').split(ch).length - 1;
  const gems = count('G'), coins = count('C');
  const goal = arena.goal || 'flag';
  const objective = goal === 'gems' ? `Collect all ${gems} gems`
    : goal === 'coins' ? `Collect all ${coins} coins`
      : goal === 'both' ? `Collect all ${gems} gems, then reach the flag`
        : 'Reach the flag';
  return {
    id: `custom-arena-${arena.id}`,
    customArena: arena,
    isRobotMission: true,
    cat: 'custom_arena',
    icon: arena.emoji || '🏟️',
    name: arena.name || 'My Arena',
    shortName: arena.name || 'My Arena',
    tagline: `${T.name} · made by you`,
    desc: arena.hint || `${GOALS[goal] || GOALS.flag} in your own ${T.name} arena.`,
    arenaType: `custom_${T.recipe}`,
    color: '#14b8a6',
    timeLimit: arena.time || 300,
    totalDist: map.length * CELL,
    obstacles: count('#') + count('P'),
    genre: 'adventure',
    difficulty: 2,
    primaryObjective: { id: 'custom_goal', text: objective, type: goal === 'flag' || goal === 'both' ? 'reach_goal' : 'collect_count', target: goal === 'coins' ? coins : gems },
    subObjectives: [{ id: 'no_bump', text: 'Finish without bumping into anything', bonusXP: 40 }],
    gameObjectives: [objective, 'Finish without bumping into anything (+40 XP)'],
    winCondition: objective,
    winText: `${arena.name || 'Arena'} complete!`,
    codeHint: arena.hint ? `HINT: ${arena.hint}` : 'Use "Move forward" and turns to steer, and "obstacle ahead" to feel for walls.',
    collectTarget: goal === 'coins' ? coins : gems,
    xpBase: 100,
    xpReward: 140,
    zones: 1,
    zoneCount: 1,
    teaches: ['sequencing', 'algorithms'],
    systemsBuilt: ['movement', 'sensors'],
  };
}

/**
 * Where each square of the map sits in the world. In the lab the Start square is at the
 * lab's spawn point; in the Arena Maker the board is centred on the origin.
 */
export function arenaLayout(mapIn, { centred = false } = {}) {
  const map = normaliseMap(mapIn);
  const H = map.length, W = map[0].length;
  let sx = 1, sy = 1;
  map.forEach((r, y) => { const i = r.indexOf('S'); if (i >= 0) { sx = i; sy = y; } });
  const ox = centred ? (W - 1) / 2 : sx, oy = centred ? (H - 1) / 2 : sy, oz = centred ? 0 : SPAWN_Z;
  const pos = (x, y) => new THREE.Vector3((x - ox) * CELL, 0, oz + (y - oy) * CELL);
  return { map, H, W, sx, sy, pos, minX: -ox * CELL, maxX: (W - 1 - ox) * CELL, minZ: oz - oy * CELL, maxZ: oz + (H - 1 - oy) * CELL };
}

/**
 * Build the arena in the lab scene and register everything with the lab's systems
 * (scene.userData.obstacles / collectibles / finishZone / movers).
 */
export function buildCustomArenaLab(scene, course) {
  const arena = course.customArena;
  const L = arenaLayout(arena.map);
  const { map, sx, sy } = L;
  const ud = scene.userData;
  ud.obstacles = [];
  ud.collectibles = [];
  ud.movers = ud.movers || [];
  ud.customArenaGoal = arena.goal || 'flag';
  ud.arenaType = course.arenaType;
  ud.missionCameraPreset = { camBack: 8.5, camUp: 8, lookAhead: 6, lookHeight: 0 };
  // Face the first open square from the start (up, right, down, left), like Arena Quest
  const openDir = [[0, -1, Math.PI], [1, 0, Math.PI / 2], [0, 1, 0], [-1, 0, -Math.PI / 2]]
    .find(([dx, dy]) => { const c = map[sy + dy]?.[sx + dx]; return c && !'#PLBD'.includes(c); });
  ud.raceSpawn = { x: 0, z: SPAWN_Z, y: 0, angle: openDir ? openDir[2] : Math.PI };
  ud.spawnAngle = ud.raceSpawn.angle;
  installArenaWorld(scene, arena, L);
  ud.arenaBounds = { camMinZ: L.minZ - 12, camMaxZ: L.maxZ + 14, camMaxX: Math.max(24, Math.max(-L.minX, L.maxX) + 10), floorLen: L.maxZ - L.minZ + 20 };
  const root = new THREE.Group();
  root.name = 'CustomArenaBoard';
  scene.add(root);
  buildArenaBoard(root, arena, L, ud);
  return true;
}

/** The themed 3D world around the board — the same theme builder as the pre-built Studio arenas. */
export function installArenaWorld(scene, arena, L) {
  const T = themeFor(arena.theme);
  const { minX, maxX, minZ, maxZ } = L;
  const pts = [];
  const lanes = Math.max(2, Math.ceil((maxZ - minZ) / 6) + 1);
  for (let i = 0; i < lanes; i++) {
    const z = maxZ - ((maxZ - minZ) * i) / (lanes - 1);
    const xs = i % 2 ? [maxX, (minX + maxX) / 2, minX] : [minX, (minX + maxX) / 2, maxX];
    xs.forEach((x) => pts.push(new THREE.Vector3(x, 0.05, z)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  let themed = false;
  try { themed = installMissionTheme(scene, curve, { id: T.recipe, title: arena.name || 'Arena' }, { noTasks: true }); } catch { themed = false; }
  if (!themed) {
    scene.background = new THREE.Color(T.sky);
    scene.fog = new THREE.Fog(T.sky, 60, 170);
  }
  // The theme lays a route and a few props along it; the arena board replaces the route,
  // and scenery that landed on the board (a turtle in the maze!) is moved out of the way.
  scene.traverse((o) => { if (/route|path|road|kerb|checkpoint/i.test(o.name || '') && o !== scene) o.visible = false; });
  const themeRoot = scene.getObjectByName(MISSION_THEME_ROOT);
  if (themeRoot) {
    const pad = CELL * 0.9;
    const onBoard = (b) => b.max.x > minX - CELL / 2 - pad && b.min.x < maxX + CELL / 2 + pad && b.max.z > minZ - CELL / 2 - pad && b.min.z < maxZ + CELL / 2 + pad;
    const boardArea = (maxX - minX + CELL) * (maxZ - minZ + CELL);
    themeRoot.updateMatrixWorld(true);
    const hideIn = (node, depth) => {
      [...node.children].forEach((ch) => {
        const b = new THREE.Box3().setFromObject(ch);
        if (b.isEmpty() || !onBoard(b)) return;
        const sz = b.getSize(new THREE.Vector3());
        // Big things (the ground, the sky, a whole room) stay; look inside groups for the props
        if (sz.x * sz.z > boardArea * 0.5 || sz.y > 30) { if (depth < 3) hideIn(ch, depth + 1); return; }
        ch.visible = false;
      });
    };
    hideIn(themeRoot, 0);
  }
  return themed;
}

/**
 * The board itself — floor, walls, decorations, crates, lava, start pad, gems, coins, keys,
 * doors, the flag and bugs — added to `root`. Obstacles, collectibles, the finish zone and
 * animations are registered on `ud` (the lab's scene.userData, or a stand-in in the editor).
 */
export function buildArenaBoard(root, arena, L, ud) {
  const { map, H, W, sx, sy, pos, minX, maxX, minZ, maxZ } = L;
  const T = themeFor(arena.theme);
  ud.obstacles = ud.obstacles || [];
  ud.collectibles = ud.collectibles || [];
  ud.movers = ud.movers || [];
  const rc = MISSION_THEME_RECIPES[T.recipe] || {};
  const style = boardLook(T, rc);
  const accent = rc.accent ?? T.wallTop;
  const k = (x, y) => `${x},${y}`;
  const cells = { floor: [], wall: [], prop: [], lava: [], crate: [] };
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') cells.wall.push([x, y]);
    else if (c === 'P') { cells.prop.push([x, y]); cells.floor.push([x, y]); }
    else if (c === 'L') cells.lava.push([x, y]);
    else { cells.floor.push([x, y]); if (c === 'B') cells.crate.push([x, y]); }
  }));
  const m4 = new THREE.Matrix4();
  const floorGeo = new THREE.BoxGeometry(CELL * 0.98, 0.1, CELL * 0.98);
  const floorMat = (shade) => new THREE.MeshStandardMaterial({
    map: style.floorMap, color: new THREE.Color(0xffffff).multiplyScalar(shade), roughness: style.floorRough, metalness: style.floorMetal,
    ...(style.floorGlow ? { emissive: style.floorGlow, emissiveMap: style.floorMap, emissiveIntensity: 0.22 } : {}),
  });
  const fa = new THREE.InstancedMesh(floorGeo, floorMat(1), Math.max(1, cells.floor.length));
  const fb = new THREE.InstancedMesh(floorGeo, floorMat(0.9), Math.max(1, cells.floor.length));
  let na = 0, nb = 0;
  cells.floor.forEach(([x, y]) => { const p = pos(x, y); (x + y) % 2 ? fa.setMatrixAt(na++, m4.makeTranslation(p.x, 0.02, p.z)) : fb.setMatrixAt(nb++, m4.makeTranslation(p.x, 0.02, p.z)); });
  fa.count = na; fb.count = nb;
  fa.receiveShadow = fb.receiveShadow = true;
  root.add(fa, fb);
  const kerb = mk(new THREE.BoxGeometry(W * CELL + 0.6, 0.12, H * CELL + 0.6), std(accent, 0.5, 0.1, { emissive: accent, emissiveIntensity: T.glow ? 0.3 : 0.1 }), false);
  kerb.position.set((minX + maxX) / 2, -0.04, (minZ + maxZ) / 2);
  root.add(kerb);

  const block = (x, y, radius = CELL * 0.5, type = 'wall') => {
    const p = pos(x, y);
    const o = new THREE.Object3D();
    o.position.set(p.x, 0, p.z);
    ud.obstacles.push({ mesh: o, radius, type, customArena: true });
    return o;
  };
  // Walls: hedges in green worlds, otherwise blocks of the world's own stone, ice, coral, panels…
  const hedge = style.wall === 'hedge';
  const wallH = hedge ? 1.25 : 1.1;
  const wallMesh = new THREE.InstancedMesh(hedge ? new THREE.BoxGeometry(CELL * 0.94, wallH, CELL * 0.94) : new THREE.BoxGeometry(CELL, wallH, CELL),
    hedge ? std(T.wall, 0.9, 0.05, { flatShading: true })
      : new THREE.MeshStandardMaterial({
        map: style.wallMap, roughness: style.wallRough, metalness: style.wallMetal, transparent: style.wallOpacity < 1, opacity: style.wallOpacity,
        ...(style.capGlow ? { emissive: style.cap, emissiveMap: style.wallMap, emissiveIntensity: 0.18 } : {}),
      }), Math.max(1, cells.wall.length));
  const capMesh = new THREE.InstancedMesh(hedge ? new THREE.IcosahedronGeometry(CELL * 0.43, 1) : trimGeometry(CELL),
    std(style.cap, 0.6, 0.1, { ...(style.capGlow ? { emissive: style.cap, emissiveIntensity: 0.45 } : {}), ...(hedge ? { flatShading: true } : {}) }), Math.max(1, cells.wall.length));
  cells.wall.forEach(([x, y], i) => {
    const p = pos(x, y);
    wallMesh.setMatrixAt(i, m4.makeTranslation(p.x, wallH / 2, p.z));
    capMesh.setMatrixAt(i, hedge ? m4.compose(new THREE.Vector3(p.x, wallH + 0.05, p.z), new THREE.Quaternion(), new THREE.Vector3(1.0, 0.42, 1.0)) : m4.makeTranslation(p.x, wallH + 0.04, p.z));
    block(x, y);
  });
  wallMesh.count = capMesh.count = cells.wall.length;
  wallMesh.castShadow = wallMesh.receiveShadow = capMesh.castShadow = true;
  root.add(wallMesh, capMesh);

  // Decorations: real props from the world (a sunflower, a rocket, a cupcake…)
  const rnd = seeded(arena.name?.length || 7);
  cells.prop.forEach(([x, y], i) => {
    const name = arena.props?.[`${x},${y}`] || T.props[i % T.props.length];
    let obj = null;
    try { obj = MISSION_PROPS[name]?.(rnd, {}); } catch { obj = null; }
    if (!obj) obj = mk(new THREE.ConeGeometry(0.9, 2.4, 8), std(0x22c55e));
    const b = new THREE.Box3().setFromObject(obj);
    const foot = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) || 1;
    const tall = (b.max.y - b.min.y) || 1;
    obj.scale.multiplyScalar(Math.min((CELL * 0.85) / foot, 3.6 / tall));
    obj.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    const p = pos(x, y);
    obj.position.set(p.x, 0.05, p.z);
    obj.rotation.y = (i % 4) * (Math.PI / 2);
    root.add(obj);
    block(x, y, CELL * 0.45, 'decoration');
  });

  // Crates
  const crateMat = std(0xb45309, 0.8);
  cells.crate.forEach(([x, y]) => {
    const p = pos(x, y);
    const c = mk(new THREE.BoxGeometry(CELL * 0.7, CELL * 0.7, CELL * 0.7), crateMat);
    c.position.set(p.x, CELL * 0.35, p.z);
    root.add(c);
    const band = mk(new THREE.BoxGeometry(CELL * 0.72, 0.12, CELL * 0.72), std(0x78350f, 0.8));
    band.position.set(p.x, CELL * 0.35, p.z);
    root.add(band);
    block(x, y, CELL * 0.42, 'crate');
  });

  // Lava: glowing pools — touching one hurts, so code a way round
  const lavaMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.1, roughness: 0.4 });
  cells.lava.forEach(([x, y], i) => {
    const p = pos(x, y);
    const l = mk(new THREE.BoxGeometry(CELL * 0.98, 0.12, CELL * 0.98), lavaMat, false);
    l.position.set(p.x, 0.02, p.z);
    root.add(l);
    const bubble = mk(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfde047 }), false);
    bubble.position.set(p.x + 0.4, 0.1, p.z - 0.3);
    root.add(bubble);
    ud.movers.push({ update: (t) => { bubble.position.y = 0.1 + Math.abs(Math.sin(t * 2 + i)) * 0.35; } });
    const o = block(x, y, CELL * 0.42, 'lava');
    ud.obstacles[ud.obstacles.length - 1].damaging = true;
    void o;
  });

  // Start pad (only when the map has a Start square)
  if (map.some((r) => r.includes('S'))) {
    const p = pos(sx, sy);
    const disc = mk(new THREE.CylinderGeometry(1.25, 1.3, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.45 }), false);
    disc.position.set(p.x, 0.08, p.z);
    root.add(disc);
    const arrow = mk(new THREE.ConeGeometry(0.35, 0.7, 3), new THREE.MeshBasicMaterial({ color: 0xffffff }), false);
    arrow.rotation.x = -Math.PI / 2; arrow.position.set(p.x, 0.14, p.z - 0.6);
    root.add(arrow);
  }

  // Gems, coins, keys
  const gemMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.15 });
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.45, metalness: 0.8, roughness: 0.25 });
  const keyMat = std(0xfacc15, 0.25, 0.9);
  const keys = [];
  const doors = [];
  map.forEach((row, y) => [...row].forEach((c, x) => {
    const p = pos(x, y);
    let m = null, type = null, value = 10;
    if (c === 'G') { m = mk(new THREE.OctahedronGeometry(0.55, 0), gemMat); type = 'gem'; value = 20; }
    else if (c === 'C') { m = mk(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 24), coinMat); m.rotation.x = Math.PI / 2; type = 'coin'; value = 10; }
    else if (c === 'K') {
      m = new THREE.Group();
      const ring = mk(new THREE.TorusGeometry(0.28, 0.08, 8, 18), keyMat); ring.position.x = -0.3;
      const shaft = mk(new THREE.BoxGeometry(0.7, 0.12, 0.12), keyMat); shaft.position.x = 0.2;
      const tooth = mk(new THREE.BoxGeometry(0.12, 0.25, 0.12), keyMat); tooth.position.set(0.45, -0.14, 0);
      m.add(ring, shaft, tooth); type = 'key'; value = 15;
    } else if (c === 'D') {
      const dg = new THREE.Group();
      const slab = mk(new THREE.BoxGeometry(CELL * 0.92, 2.2, CELL * 0.5), std(0x92400e, 0.7)); slab.position.y = 1.1;
      const band = mk(new THREE.BoxGeometry(CELL * 0.95, 0.25, CELL * 0.55), std(0xfacc15, 0.3, 0.8)); band.position.y = 1.2;
      const lock = mk(new THREE.BoxGeometry(0.45, 0.5, CELL * 0.56), std(0xfacc15, 0.3, 0.8)); lock.position.y = 1.0;
      dg.add(slab, band, lock);
      dg.position.set(p.x, 0, p.z);
      root.add(dg);
      const obs = { mesh: dg, radius: CELL * 0.48, type: 'door', customArena: true };
      ud.obstacles.push(obs);
      doors.push({ obs, mesh: dg, open: 0 });
      return;
    }
    if (!m) return;
    m.position.set(p.x, 0.9, p.z);
    root.add(m);
    // Generous pick-up height so tall walkers and low karts both collect it
    const col = { mesh: m, pos: { x: p.x, y: 0.8, z: p.z }, radius: 1.7, value, type, collected: false };
    ud.collectibles.push(col);
    if (type === 'key') keys.push(col);
  }));
  ud.customArenaTotals = { gems: ud.collectibles.filter((c) => c.type === 'gem').length, coins: ud.collectibles.filter((c) => c.type === 'coin').length };
  // A collected key opens the nearest locked door
  if (doors.length) {
    ud.movers.push({
      // Restart: lock the doors again
      restartRace: () => {
        keys.forEach((kc) => { kc.used = false; });
        doors.forEach((d) => { d.opening = false; d.open = 0; d.mesh.position.y = 0; if (!ud.obstacles.includes(d.obs)) ud.obstacles.push(d.obs); });
      },
      update: (t, dt) => {
        if (keys.some((kc) => kc.used && !kc.collected)) {
          // the run was reset: keys are back, so the doors lock again
          keys.forEach((kc) => { kc.used = false; });
          doors.forEach((d) => { d.opening = false; d.open = 0; d.mesh.position.y = 0; if (!ud.obstacles.includes(d.obs)) ud.obstacles.push(d.obs); });
        }
        keys.forEach((kc) => {
          if (!kc.collected || kc.used) return;
          const d = doors.filter((x) => !x.opening).sort((a, b) => a.mesh.position.distanceToSquared(kc.mesh.position) - b.mesh.position.distanceToSquared(kc.mesh.position))[0];
          kc.used = true;
          if (d) { d.opening = true; ud.obstacles = ud.obstacles.filter((o) => o !== d.obs); }
        });
        doors.forEach((d) => { if (d.opening && d.open < 1) { d.open = Math.min(1, d.open + (dt || 0.016) * 1.5); d.mesh.position.y = -2.3 * d.open; } });
      },
    });
  }

  // Finish flag
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== 'F') return;
    const p = pos(x, y);
    const fg = new THREE.Group();
    const pole = mk(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 10), std(0xe2e8f0, 0.3, 0.7)); pole.position.y = 1.7;
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; const cx = cv.getContext('2d');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { cx.fillStyle = (i + j) % 2 ? '#111' : '#fff'; cx.fillRect(i * 16, j * 16, 16, 16); }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const cloth = mk(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide })); cloth.position.set(0.72, 2.85, 0);
    const pad = mk(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 28), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.5 }), false); pad.position.y = 0.06;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 14, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff7c2, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.position.y = 7;
    fg.add(pole, cloth, pad, beam);
    fg.position.set(p.x, 0, p.z);
    root.add(fg);
    ud.movers.push({ update: (t) => { cloth.rotation.y = Math.sin(t * 2.2) * 0.18; } });
    if (!ud.finishZone) ud.finishZone = { x: p.x, z: p.z, radius: 1.15, y3d: 0 };
  }));

  // Bugs patrol along their row or column, turning at walls
  const solid = (x, y) => { const c = map[y]?.[x]; return !c || c === '#' || c === 'P' || c === 'L' || c === 'B' || c === 'D'; };
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== 'H' && c !== 'V') return;
    const horiz = c === 'H';
    let a = 0, b = 0;
    while (!solid(x + (horiz ? a - 1 : 0), y + (horiz ? 0 : a - 1))) a--;
    while (!solid(x + (horiz ? b + 1 : 0), y + (horiz ? 0 : b + 1))) b++;
    const bug = ladybug();
    bug.scale.setScalar(2.6);
    const home = pos(x, y);
    bug.position.copy(home);
    root.add(bug);
    ud.obstacles.push({ mesh: bug, radius: 0.85, type: 'bug', damaging: true, customArena: true });
    const span = Math.max(0, b - a) * CELL;
    const start = a * CELL;
    const speed = 2.2;
    ud.movers.push({
      update: (t) => {
        if (!span) return;
        const ph = (t * speed) % (2 * span);
        const d = start + (ph < span ? ph : 2 * span - ph);
        if (horiz) { bug.position.x = home.x + d; bug.rotation.y = ph < span ? Math.PI / 2 : -Math.PI / 2; }
        else { bug.position.z = home.z + d; bug.rotation.y = ph < span ? 0 : Math.PI; }
      },
    });
  }));
  return true;
}

/** Did the child's robot finish? Called by the lab every frame for custom arenas. */
export function customArenaWon(scene) {
  const ud = scene.userData;
  const goal = ud.customArenaGoal;
  if (!goal) return null;
  const left = (type) => (ud.collectibles || []).some((c) => c.type === type && !c.collected);
  if (goal === 'gems') return !left('gem');
  if (goal === 'coins') return !left('coin');
  return null; // flag goals use the finish zone
}

/** For "gems, then the flag": the flag only counts once every gem is collected. */
export function customArenaFlagReady(scene) {
  const ud = scene.userData;
  if (ud.customArenaGoal !== 'both') return true;
  return !(ud.collectibles || []).some((c) => c.type === 'gem' && !c.collected);
}
