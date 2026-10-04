/**
 * RaceCorridorClearance.js — keeps kart roads drivable.
 *
 * Track kits scatter scenery (houses, palms, statues, rocks) around the spline,
 * and some pieces land on the tarmac. After a track is built, and again while
 * glTF scenery streams in, this pass checks each prop's actual vertices against
 * the road corridor and slides intruders out to the roadside. Arches are left
 * as built. A prop is hidden only if no clear spot is found.
 * Road parts, drive-through checkpoint gates, boost pads, coins and karts are left alone.
 */
import * as THREE from 'three';

// Things that belong on or over the road.
const KEEP = /theme-scenery|theme-gate|roadside|road|deck-surface|kerb|curb|rail|barrier|guard|lane|stripe|dash|marking|edge|start-line|finish|checker|gantry|boost|pad|chevron|coin|item|pickup|rival|kart|robot|sky|dome|ocean|water|sea|ground|terrain|floor|island|bridge|tunnel|banner|minimap|shadow|decal|presentation|checkpoint|glow/i;
const ARCH = /arch|gate|portal/i;

const CLEAR_MARGIN = 0.8;      // gap between road edge and scenery
const BAND_LOW = 0.3;          // ignore flat decals on the road
const BAND_HIGH = 4.5;         // overhead scenery (arch tops, signs) is fine
const MAX_UNIT_RADIUS = 9;     // bigger groups are split into their children
const MAX_VERTS = 500;         // vertices sampled per mesh

const _v = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _box = new THREE.Box3();

/** Road centreline samples with a coarse spatial hash for fast nearest lookups. */
function makeRoad(curve, hw) {
  const pts = curve.getSpacedPoints(900);
  const cell = 8;
  const hash = new Map();
  pts.forEach((q, i) => {
    const k = `${Math.floor(q.x / cell)},${Math.floor(q.z / cell)}`;
    if (!hash.has(k)) hash.set(k, []);
    hash.get(k).push(i);
  });
  const nearest = (x, z) => {
    const cx = Math.floor(x / cell);
    const cz = Math.floor(z / cell);
    let best = Infinity;
    let bi = -1;
    for (let ring = 1; ring <= 3 && bi < 0; ring++) {
      for (let i = -ring; i <= ring; i++) {
        for (let j = -ring; j <= ring; j++) {
          for (const k of hash.get(`${cx + i},${cz + j}`) || []) {
            const q = pts[k];
            const dd = (q.x - x) ** 2 + (q.z - z) ** 2;
            if (dd < best) { best = dd; bi = k; }
          }
        }
      }
    }
    if (bi < 0) {
      pts.forEach((q, k) => {
        const dd = (q.x - x) ** 2 + (q.z - z) ** 2;
        if (dd < best) { best = dd; bi = k; }
      });
    }
    return { q: pts[bi], i: bi, dist: Math.sqrt(best) };
  };
  return { pts, hw, nearest, margin: CLEAR_MARGIN };
}

/** Road half-width from the road mesh itself (robust to per-track widths). */
export function roadHalfWidth(scene, curve) {
  const road = scene.userData.raceRoadMesh;
  const pos = road?.geometry?.attributes?.position;
  if (!pos) return 4.5;
  const probe = makeRoad(curve, 0);
  road.updateMatrixWorld(true);
  const d = [];
  const step = Math.max(1, Math.floor(pos.count / 1500));
  for (let i = 0; i < pos.count; i += step) {
    _v.fromBufferAttribute(pos, i).applyMatrix4(road.matrixWorld);
    d.push(probe.nearest(_v.x, _v.z).dist);
  }
  d.sort((a, b) => a - b);
  const hw = d[Math.floor(d.length * 0.97)] || 4.5;
  return Math.min(Math.max(hw, 3.5), 12);
}

/**
 * Deepest intrusion of `obj`'s vertices into the road corridor.
 * Returns null when clear, else { depth, dir } where dir points away from the road.
 */
function intrusion(obj, road) {
  const limit = road.hw + road.margin;
  let worst = null;
  obj.updateMatrixWorld(true);
  obj.traverse((m) => {
    if (!m.isMesh || !m.visible || m.isInstancedMesh) return;
    const pos = m.geometry?.attributes?.position;
    if (!pos) return;
    const step = Math.max(1, Math.floor(pos.count / MAX_VERTS));
    for (let i = 0; i < pos.count; i += step) {
      _v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      const { q, dist } = road.nearest(_v.x, _v.z);
      if (_v.y < q.y + BAND_LOW || _v.y > q.y + BAND_HIGH) continue;
      const depth = limit - dist;
      if (depth > 0 && (!worst || depth > worst.depth)) {
        let dx = _v.x - q.x;
        let dz = _v.z - q.z;
        if (Math.hypot(dx, dz) < 1e-3) {
          // Dead centre: push towards the side the object's bulk is on
          _box.setFromObject(obj);
          dx = (_box.min.x + _box.max.x) / 2 - q.x || 1;
          dz = (_box.min.z + _box.max.z) / 2 - q.z;
        }
        const n = Math.hypot(dx, dz) || 1;
        worst = { depth, dir: new THREE.Vector3(dx / n, 0, dz / n) };
      }
    }
  });
  return worst;
}

function moveWorld(obj, dx, dz) {
  if (!obj.parent) return;
  const here = obj.getWorldPosition(new THREE.Vector3());
  const a = obj.parent.worldToLocal(here.clone());
  const b = obj.parent.worldToLocal(here.add(new THREE.Vector3(dx, 0, dz)));
  obj.position.x += b.x - a.x;
  obj.position.z += b.z - a.z;
  obj.updateMatrixWorld(true);
}

/** Slide a prop out of the corridor; hide it if it cannot be cleared. */
function fixUnit(obj, road, stats) {
  let hit = intrusion(obj, road);
  if (!hit) return;
  for (let tries = 0; tries < 4 && hit; tries++) {
    moveWorld(obj, hit.dir.x * (hit.depth + 0.3), hit.dir.z * (hit.depth + 0.3));
    hit = intrusion(obj, road);
  }
  if (hit) {
    obj.visible = false;
    stats.hidden++;
  } else {
    stats.moved++;
  }
}

function fixInstances(mesh, road, stats) {
  if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
  const r0 = mesh.geometry.boundingSphere.radius;
  const c0 = mesh.geometry.boundingSphere.center;
  mesh.updateMatrixWorld(true);
  const inv = mesh.matrixWorld.clone().invert();
  const limit = road.hw + road.margin;
  let changed = false;
  for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, _m);
    const world = _m.clone().premultiply(mesh.matrixWorld);
    world.decompose(_p, _q, _s);
    const r = r0 * Math.max(_s.x, _s.z);
    if (r < 0.2 || r > MAX_UNIT_RADIUS) continue;
    _v.copy(c0).applyMatrix4(world);
    const { q, dist } = road.nearest(_v.x, _v.z);
    if (_v.y + r0 * _s.y < q.y + BAND_LOW || _v.y - r0 * _s.y > q.y + BAND_HIGH) continue;
    const need = limit + r * 0.8;
    if (dist >= need) continue;
    let dx = _v.x - q.x;
    let dz = _v.z - q.z;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len; dz /= len;
    const tx = q.x + dx * (need + 0.3);
    const tz = q.z + dz * (need + 0.3);
    if (road.nearest(tx, tz).dist >= need) {
      _p.x += tx - _v.x;
      _p.z += tz - _v.z;
      world.compose(_p, _q, _s);
      stats.moved++;
    } else {
      world.compose(_p, _q, _s.set(0, 0, 0));
      stats.hidden++;
    }
    mesh.setMatrixAt(i, world.premultiply(inv));
    changed = true;
  }
  if (changed) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere?.();
  }
}

/** The player's robot, rival karts and anything that drives. */
function isVehicle(obj) {
  const u = obj.userData || {};
  return Boolean(u.chassisId || u.isKartRival || u.isRaceKart || u.isRaceObstacle || u.isCombatFighter || u.animate);
}

/**
 * Props that drive their own position each frame (birds, bobbing buoys, spinning
 * gems). Moving them fights their animation and makes them jitter, so leave them.
 */
function isSelfAnimated(obj) {
  const u = obj.userData || {};
  return Boolean(u.tick || u.animTick || u.animated || u.animPhase !== undefined || u.animSpin
    || u.spin || u.soar || u.leap || u.basePos || u.baseX !== undefined || u.baseY !== undefined
    || u.baseZ !== undefined);
}

function visit(obj, road, stats, skip) {
  if (skip.has(obj) || !obj.visible || isVehicle(obj) || isSelfAnimated(obj)) return;
  if (obj.name && KEEP.test(obj.name)) return;
  if (obj.isLight || obj.isCamera || obj.isSprite || obj.isPoints || obj.isLine) return;
  if (obj.isInstancedMesh) { fixInstances(obj, road, stats); return; }
  if (obj.name && ARCH.test(obj.name)) return; // arches span the road by design
  _box.setFromObject(obj);
  if (_box.isEmpty()) return;
  const r = Math.max(_box.max.x - _box.min.x, _box.max.z - _box.min.z) / 2;
  if (r > MAX_UNIT_RADIUS && obj.children.length) {
    // A whole scenery layer: judge its pieces individually
    obj.children.slice().forEach((c) => visit(c, road, stats, skip));
    return;
  }
  if (obj.isMesh || obj.children.length) fixUnit(obj, road, stats);
}

/** Slide scenery off the kart road. Safe to call repeatedly as scenery streams in. */
export function clearRaceRoadCorridor(scene) {
  const curve = scene?.userData?.raceCurve;
  if (!curve) return null;
  const hw = scene.userData._raceClearHalfWidth ?? roadHalfWidth(scene, curve);
  scene.userData._raceClearHalfWidth = hw;
  const road = makeRoad(curve, hw);
  // Tracks with a verge + fence want props pushed beyond the fence line
  road.margin = scene.userData._raceClearMargin ?? CLEAR_MARGIN;
  const skip = new Set();
  if (scene.userData.raceRoadMesh) skip.add(scene.userData.raceRoadMesh);
  const stats = { moved: 0, hidden: 0, hw };
  scene.children.slice().forEach((c) => visit(c, road, stats, skip));
  return stats;
}

/** Has the player started driving? After that, scenery must stay put. */
function raceUnderway(scene) {
  const rs = scene.userData._raceState;
  return Boolean(rs && ((rs.raceLapTime ?? 0) > 0.6 || (rs.raceSpeedKmh ?? 0) > 2));
}

/**
 * Run while the track loads: once now, then again only when new scenery
 * (glTF models) has streamed in. Stops for good once the race is underway so
 * nothing ever shifts or stalls a frame while the player is driving.
 */
export function scheduleRaceRoadClearance(scene, { interval = 700, until = 15000 } = {}) {
  let lastNodes = -1;
  const started = performance.now();
  const run = () => {
    if (!scene.userData.raceCurve || raceUnderway(scene)) return false;
    let nodes = 0;
    scene.traverse(() => { nodes++; });
    if (nodes === lastNodes) return true;   // nothing new streamed in
    lastNodes = nodes;
    const stats = clearRaceRoadCorridor(scene);
    if (stats && (stats.moved || stats.hidden)) {
      console.log('[RaceClearance]', scene.userData.arenaType, stats);
    }
    return true;
  };
  let timer = setTimeout(function tick() {
    if (!run() || performance.now() - started > until) return;
    timer = setTimeout(tick, interval);
  }, 0);
  return () => clearTimeout(timer);
}
