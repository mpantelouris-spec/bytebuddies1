/**
 * Merge every mesh in a group that never moves on its own into one mesh per
 * material. A rival kart is ~150 little meshes (≈150 draw calls, twice with
 * shadows); baked it is ~10. The group itself can still move/rotate as a whole.
 */
import * as THREE from 'three';

// Join non-indexed geometries that share the same attributes (all pieces here are)
function mergeGeometries(geos) {
  const out = new THREE.BufferGeometry();
  Object.keys(geos[0].attributes).forEach((name) => {
    const first = geos[0].attributes[name];
    const total = geos.reduce((n, g) => n + g.attributes[name].array.length, 0);
    const arr = new first.array.constructor(total);
    let off = 0;
    geos.forEach((g) => { arr.set(g.attributes[name].array, off); off += g.attributes[name].array.length; });
    out.setAttribute(name, new THREE.BufferAttribute(arr, first.itemSize, first.normalized));
  });
  return out;
}

// Pieces often get their own copy of an identical material; group them by how they look
function materialLook(m) {
  if (m.onBeforeCompile && m.onBeforeCompile.toString() !== 'onBeforeCompile(){}' && !/^\(\)\s*=>\s*\{\s*\}$/.test(m.onBeforeCompile.toString())) return m.uuid;
  const hex = (c) => (c && c.getHexString ? c.getHexString() : '');
  return [m.type, hex(m.color), hex(m.emissive), m.emissiveIntensity, m.roughness, m.metalness, m.shininess,
    m.map?.uuid, m.emissiveMap?.uuid, m.normalMap?.uuid, m.roughnessMap?.uuid, m.alphaMap?.uuid,
    m.transparent, m.opacity, m.side, m.flatShading, m.vertexColors, m.depthWrite, m.depthTest, m.blending, m.toneMapped, m.fog, m.wireframe].join(',');
}

export function bakeStaticGroup(group) {
  group.updateMatrixWorld(true);
  const toLocal = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const buckets = new Map();
  group.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.geometry?.attributes?.position) return;
    if (o.morphTargetInfluences?.length) return;
    let visible = true;
    for (let q = o; q && q !== group; q = q.parent) if (!q.visible) { visible = false; break; }
    if (!visible) return;
    const key = `${materialLook(o.material)}|${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
    if (!buckets.has(key)) buckets.set(key, { material: o.material, cast: o.castShadow, receive: o.receiveShadow, items: [] });
    buckets.get(key).items.push(o);
  });
  let merged = 0;
  buckets.forEach((b) => {
    if (b.items.length < 2) return;
    const geos = b.items.map((o) => {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toLocal, o.matrixWorld));
      return g;
    });
    // Only attributes every piece has can be merged
    const names = Object.keys(geos[0].attributes).filter((n) => geos.every((g) => g.attributes[n] && g.attributes[n].itemSize === geos[0].attributes[n].itemSize));
    geos.forEach((g) => { Object.keys(g.attributes).forEach((n) => { if (!names.includes(n)) g.deleteAttribute(n); }); g.morphAttributes = {}; });
    const geo = names.includes('position') ? mergeGeometries(geos) : null;
    geos.forEach((g) => g.dispose());
    if (!geo) return;
    const mesh = new THREE.Mesh(geo, b.material);
    mesh.castShadow = b.cast; mesh.receiveShadow = b.receive;
    mesh.name = 'baked';
    b.items.forEach((o) => { o.parent?.remove(o); });
    group.add(mesh);
    merged += b.items.length;
  });
  // Drop groups left empty
  const empties = [];
  group.traverse((o) => { if (o !== group && !o.isMesh && !o.isLight && o.children.length === 0 && o.type === 'Group') empties.push(o); });
  empties.forEach((o) => o.parent?.remove(o));
  group.userData.baked = merged;
  return group;
}
