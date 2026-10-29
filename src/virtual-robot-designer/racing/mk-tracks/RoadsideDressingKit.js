/**
 * RoadsideDressingKit.js — clean, kart-game roadsides for every biome circuit.
 *
 * Adds what makes a kart track read instantly: the world's own road surface,
 * a tidy verge strip on both sides, a continuous fence along its outer edge,
 * chevron boards on the sharp bends and a wooden track-name sign at the start.
 * Styled per world from TrackThemes (boardwalk + wooden rail on the beach,
 * cobbles + stone balustrade at the castle, lit barriers in space...).
 * Everything is instanced, so it costs a handful of draw calls per track.
 */
import * as THREE from 'three';
import { trackThemeFor } from './TrackThemes.js';
import { applyRoadSurface, applyRoadMarkings, placeCornerChevrons } from './RoadSurfaceKit.js';
import { applyThemeScenery, keepOldDecorationHidden, hasThemeScenery } from './ThemeSceneryKit.js';

const VERGE_WIDTH = 3.2;       // metres of verge beyond the kerb
const KERB_GAP = 0.35;         // verge tucks under the kerb so no gap shows
const POST_SPACING = 3.2;
const FENCE_HEIGHT = 1.1;

function mat(color, extras = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.04, ...extras });
}

/** Distance from (x, z) to the nearest road centreline sample. */
function makeNearest(samples) {
  return (x, z) => {
    let best = Infinity;
    for (let i = 0; i < samples.length; i += 2) {
      const q = samples[i];
      const d = (q.x - x) ** 2 + (q.z - z) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
}

/**
 * Verge ribbons on both sides. Each quad is only kept where it doesn't overlap
 * another stretch of road, so hairpins and close parallel sections stay clean.
 */
function buildVerge(curve, hw, style, samples, nearest) {
  const inner = hw + KERB_GAP;
  const outer = inner + VERGE_WIDTH;
  const pos = [];
  const idx = [];
  const n = samples.length;
  const frames = samples.map((p, i) => {
    const t = i / (n - 1);
    const tan = curve.getTangentAt(Math.min(t, 0.9999)).setY(0).normalize();
    return { p, right: new THREE.Vector3(tan.z, 0, -tan.x) };
  });
  for (const side of [-1, 1]) {
    for (let i = 0; i < n - 1; i++) {
      const a = frames[i];
      const b = frames[i + 1];
      const pts = [
        a.p.clone().addScaledVector(a.right, side * inner),
        a.p.clone().addScaledVector(a.right, side * outer),
        b.p.clone().addScaledVector(b.right, side * inner),
        b.p.clone().addScaledVector(b.right, side * outer),
      ];
      // Skip quads that would lie on top of another piece of road
      if (pts.some((q) => nearest(q.x, q.z) < hw + 0.2)) continue;
      const base = pos.length / 3;
      pts.forEach((q, k) => pos.push(q.x, (k < 2 ? a.p.y : b.p.y) + 0.005, q.z));
      if (side > 0) idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      else idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat(style.verge, { roughness: 0.92 }));
  mesh.name = 'roadside-verge';
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Instanced fence along the outer edge of the verge, in the world's style:
 * 'plank' wooden rail, 'rail' metal guard rail, 'stone' balustrade, 'glow' lit barrier.
 */
function buildFence(curve, hw, style, nearest) {
  const len = curve.getLength();
  const spacing = style.fence === 'stone' ? 2.4 : POST_SPACING;
  const count = Math.floor(len / spacing);
  const offset = hw + KERB_GAP + VERGE_WIDTH;
  const posts = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t).setY(0).normalize();
      const right = new THREE.Vector3(tan.z, 0, -tan.x);
      const at = p.clone().addScaledVector(right, side * offset);
      const clear = nearest(at.x, at.z) > hw + KERB_GAP + 1.5;
      posts.push({ at, yaw: Math.atan2(tan.x, tan.z), clear, side, i });
    }
  }
  const group = new THREE.Group();
  group.name = 'roadside-fence';

  const kind = style.fence;
  const postH = kind === 'stone' ? 1.0 : FENCE_HEIGHT + 0.2;
  const postGeo = kind === 'stone'
    ? new THREE.BoxGeometry(0.55, postH, 0.55)
    : kind === 'plank'
      ? new THREE.BoxGeometry(0.24, postH, 0.24)
      : new THREE.BoxGeometry(0.16, postH, 0.16);
  const postMat = mat(style.post, { metalness: kind === 'rail' || kind === 'glow' ? 0.45 : 0.02, roughness: kind === 'stone' ? 0.9 : 0.7 });
  const postMesh = new THREE.InstancedMesh(postGeo, postMat, posts.length);

  // Rails between posts: [height, thickness, depth] per rail
  const rails = kind === 'plank'
    ? [[0.5, 0.2, 0.08], [0.95, 0.24, 0.1]]
    : kind === 'stone'
      ? [[0.85, 0.22, 0.6], [0.35, 0.55, 0.32]]
      : kind === 'glow'
        ? [[0.8, 0.3, 0.12], [0.45, 0.08, 0.06]]
        : [[0.75, 0.3, 0.1]];
  const railGeo = new THREE.BoxGeometry(1, 1, 1);
  const railMat = mat(style.rail, kind === 'rail' || kind === 'glow' ? { metalness: 0.5, roughness: 0.35 } : { roughness: 0.85 });
  const railMesh = new THREE.InstancedMesh(railGeo, railMat, posts.length * rails.length);
  // Lit barriers get a glowing strip
  const glowMesh = style.glow
    ? new THREE.InstancedMesh(railGeo, new THREE.MeshBasicMaterial({ color: style.glow }), posts.length)
    : null;

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  let pn = 0;
  let rn = 0;
  let gn = 0;
  posts.forEach((post, k) => {
    if (!post.clear) return;
    m.compose(new THREE.Vector3(post.at.x, post.at.y + postH / 2, post.at.z), q.setFromAxisAngle(up, post.yaw), new THREE.Vector3(1, 1, 1));
    postMesh.setMatrixAt(pn++, m);
    const next = posts[post.i === count - 1 ? k - count + 1 : k + 1];
    if (!next?.clear || next.side !== post.side) return;
    const a = post.at;
    const b = next.at;
    const span = Math.hypot(b.x - a.x, b.z - a.z);
    if (span > spacing * 2.2) return;
    const yaw = Math.atan2(b.x - a.x, b.z - a.z);
    q.setFromAxisAngle(up, yaw);
    rails.forEach(([y, h, d]) => {
      const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + y, (a.z + b.z) / 2);
      m.compose(mid, q, new THREE.Vector3(d, h, span));
      railMesh.setMatrixAt(rn++, m);
    });
    if (glowMesh) {
      const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + rails[0][0] + rails[0][1] / 2 + 0.03, (a.z + b.z) / 2);
      m.compose(mid, q, new THREE.Vector3(0.14, 0.06, span));
      glowMesh.setMatrixAt(gn++, m);
    }
  });
  postMesh.count = pn;
  railMesh.count = rn;
  postMesh.castShadow = true;
  railMesh.castShadow = true;
  group.add(postMesh, railMesh);
  if (glowMesh) { glowMesh.count = gn; group.add(glowMesh); }
  return group;
}

function signTexture(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const x = c.getContext('2d');
  // Wooden planks
  const planks = ['#b8783e', '#a86c36', '#c0834a'];
  for (let i = 0; i < 3; i++) {
    x.fillStyle = planks[i];
    x.fillRect(0, (i * c.height) / 3, c.width, c.height / 3 - 2);
  }
  x.strokeStyle = '#6e4220';
  x.lineWidth = 10;
  x.strokeRect(5, 5, c.width - 10, c.height - 10);
  // Shrink the lettering until the whole name fits on the board
  let size = 64;
  do {
    x.font = `900 ${size}px system-ui, sans-serif`;
    size -= 2;
  } while (size > 26 && x.measureText(text).width > c.width - 56);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineWidth = 10;
  x.strokeStyle = '#5a3414';
  x.strokeText(text, c.width / 2, c.height / 2 + 4);
  x.fillStyle = '#ffd84a';
  x.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Wooden track-name sign on the right of the start straight, angled to the camera. */
function buildTrackSign(curve, hw, startT, name) {
  const g = new THREE.Group();
  g.name = 'roadside-track-sign';
  const wood = mat(0x8a5a2a);
  [-1.9, 1.9].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.6, 8), wood);
    post.position.set(x, 1.8, 0);
    post.castShadow = true;
    g.add(post);
  });
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 1.45, 0.22),
    [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: signTexture(name.toUpperCase().slice(0, 26)), roughness: 0.8 }), wood],
  );
  board.position.y = 2.9;
  board.castShadow = true;
  g.add(board);
  // Just past the start arch, standing on the verge inside the fence
  const t = (startT + 30 / Math.max(curve.getLength(), 1)) % 1;
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t).setY(0).normalize();
  const right = new THREE.Vector3(tan.z, 0, -tan.x);
  g.position.copy(p).addScaledVector(right, hw + KERB_GAP + VERGE_WIDTH * 0.6);
  // Face back towards the oncoming karts, turned a little towards the road
  g.rotation.y = Math.atan2(-tan.x, -tan.z) + 0.45;
  return g;
}

/**
 * Dress a biome circuit's roadsides. `hw` is the road half-width, `name` the
 * track title for the start sign.
 */
export function applyRoadsideDressing(world, curve, hw, arenaType, { startT = 0, name = '', scene = null } = {}) {
  if (!world || !curve || world.getObjectByName('roadside-dressing')) return null;
  const style = trackThemeFor(arenaType);
  const samples = curve.getSpacedPoints(Math.max(240, Math.round(curve.getLength() / 1.5)));
  const nearest = makeNearest(samples);
  const root = new THREE.Group();
  root.name = 'roadside-dressing';
  root.add(buildVerge(curve, hw, style, samples, nearest));
  root.add(buildFence(curve, hw, style, nearest));
  if (name) root.add(buildTrackSign(curve, hw, startT, name));
  world.add(root);
  if (scene) {
    applyRoadSurface(scene, style);
    applyRoadMarkings(scene, style);
  }
  placeCornerChevrons(root, curve, hw, style, hw + KERB_GAP + VERGE_WIDTH * 0.45);

  // Replace the old primitive decoration with the world's Kenney scenery
  if (hasThemeScenery(style.id)) {
    if (scene) scene.userData.themeScenery = style.id;
    // Old props keep streaming in for a few seconds, so hide them every frame and cover the stage until the new scenery lands
    const stopHiding = keepOldDecorationHidden(world);
    const announce = (delta) => {
      if (typeof window === 'undefined') return;
      window.__bbTrackLoadingCount = Math.max(0, (window.__bbTrackLoadingCount || 0) + delta);
      window.dispatchEvent(new CustomEvent('bb-track-loading', { detail: { loading: window.__bbTrackLoadingCount > 0 } }));
    };
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      announce(-1);
      setTimeout(stopHiding, 8000);
    };
    announce(1);
    setTimeout(finish, 12000);
    applyThemeScenery(world, curve, hw, style, { fenceOffset: hw + KERB_GAP + VERGE_WIDTH, startT })
      .then((r) => { if (r) console.log('[ThemeScenery]', style.id, r.userData.count, 'props'); finish(); })
      .catch((err) => { console.warn('[ThemeScenery] failed', style.id, err); finish(); });
  }
  return root;
}
