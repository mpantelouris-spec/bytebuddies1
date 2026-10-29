/**
 * MK8PhotoKit.js — photographic lighting + PBR surfaces for the MK8 showcase tracks.
 *
 * Uses CC0 Poly Haven assets shipped in /assets/tracks/_sky and /assets/tracks/_pbr:
 *   - an HDRI per world lights every PBR material (image-based lighting + reflections)
 *   - a 4K photo sky as the background, with the key light aimed at the sun in the photo
 *   - real asphalt / grass / cliff / bark / sand / snow textures, triplanar on terrain
 *     and foliage so nothing stretches
 *   - the sun's shadow box follows the camera, so trees and props shade the whole lap
 */
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const BASE = `${import.meta.env?.BASE_URL || '/'}assets/tracks`;

/** Sky photo + where its sun sits (equirect u, v from top), and the haze colour at the horizon. */
export const PHOTO_SKIES = {
  day: { file: 'kloofendal_48d_partly_cloudy_puresky', u: 0.594, v: 0.234, haze: 0xb4c2d8, sun: 0xfff1dc },
  afternoon: { file: 'qwantani_late_afternoon_puresky', u: 0.598, v: 0.391, haze: 0xd6d0c6, sun: 0xffe2b8 },
  snow: { file: 'snow_field_puresky', u: 0.604, v: 0.289, haze: 0xc8ccd2, sun: 0xfff6ec },
  clear: { file: 'syferfontein_18d_clear_puresky', u: 0.598, v: 0.395, haze: 0xd8dde2, sun: 0xfff0d6 },
};

const texLoader = new THREE.TextureLoader();
const cache = new Map();

function loadTex(path, { srgb = true, repeat = null } = {}) {
  const key = `${path}|${srgb}`;
  if (!cache.has(key)) {
    cache.set(key, new Promise((resolve) => {
      texLoader.load(`${BASE}/${path}`, (t) => {
        if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 8;
        resolve(t);
      }, undefined, () => resolve(null));
    }));
  }
  return cache.get(key).then((t) => {
    if (!t || !repeat) return t;
    const c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(repeat[0], repeat[1]);
    return c;
  });
}

function loadSet(name) {
  return Promise.all([
    loadTex(`_pbr/${name}_diff.jpg`),
    loadTex(`_pbr/${name}_nor.jpg`, { srgb: false }),
    loadTex(`_pbr/${name}_rough.jpg`, { srgb: false }),
  ]).then(([map, normalMap, roughnessMap]) => ({ map, normalMap, roughnessMap }));
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ── Composited surfaces ──────────────────────────────────────────────────────
/** Photo asphalt with painted white edge lines; u runs across the road, v along it. */
async function asphaltSurface() {
  const img = await loadImage(`${BASE}/_pbr/asphalt_track_diff.jpg`);
  const set = await loadSet('asphalt_track');
  if (!img) return null;
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  // two tiles across the lane, two along → ~4 m per tile on an 8 m road
  // The scan is near-black; lift it to a kart-game mid-grey and cool it slightly
  ctx.filter = 'brightness(2.9) saturate(0.35) contrast(1.05)';
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) ctx.drawImage(img, i * 512, j * 512, 512, 512);
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(90,96,112,0.12)';
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = 'rgba(246,246,240,0.95)';
  ctx.fillRect(1024 * 0.03, 0, 1024 * 0.024, 1024);
  ctx.fillRect(1024 * 0.946, 0, 1024 * 0.024, 1024);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 12;
  map.repeat.set(1, 0.25);
  const nrm = set.normalMap?.clone();
  if (nrm) { nrm.needsUpdate = true; nrm.repeat.set(2, 0.5); }
  const rough = set.roughnessMap?.clone();
  if (rough) { rough.needsUpdate = true; rough.repeat.set(2, 0.5); }
  return { map, normalMap: nrm, roughnessMap: rough };
}

/** Photo grass with broad mowing stripes, world-scaled (1 texture = 16 m). */
async function lawnSurface(kind) {
  const name = kind === 'snow' ? 'snow_02' : kind === 'sand' ? 'coast_sand_01' : 'leafy_grass';
  const img = await loadImage(`${BASE}/_pbr/${name}_diff.jpg`);
  const set = await loadSet(name);
  if (!img) return null;
  const paint = (checker) => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');
    // The grass scan is a dry olive; push it to a lush kart-game green
    ctx.filter = kind === 'grass' ? 'saturate(1.9) hue-rotate(32deg) brightness(0.78) contrast(1.15)'
      : kind === 'sand' ? 'sepia(0.6) saturate(1.5) brightness(1.55)'
        : 'brightness(1.08)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) ctx.drawImage(img, i * 256, j * 256, 256, 256);
    ctx.filter = 'none';
    if (kind === 'grass') {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(52,150,28,0.55)';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.globalCompositeOperation = 'source-over';
      if (checker) {
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          ctx.fillStyle = (i + j) % 2 ? 'rgba(255,255,210,0.10)' : 'rgba(0,30,0,0.08)';
          ctx.fillRect(i * 512, j * 512, 512, 512);
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 12;
    return t;
  };
  const map = paint(true);
  const plainMap = paint(false);
  return { map, plainMap, normalMap: set.normalMap, roughnessMap: set.roughnessMap, tile: 16 };
}

function planarUVs(geometry, tile, obj) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  const uv = new Float32Array(pos.count * 2);
  obj.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
    uv[i * 2] = v.x / tile;
    uv[i * 2 + 1] = v.z / tile;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function applyLawn(mesh, surf) {
  if (!mesh?.isMesh || !surf) return;
  planarUVs(mesh.geometry, surf.tile, mesh);
  mesh.material = new THREE.MeshStandardMaterial({
    map: surf.map,
    normalMap: surf.normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: surf.roughnessMap,
    roughness: 1,
    metalness: 0,
    polygonOffset: mesh.material?.polygonOffset ?? false,
    polygonOffsetFactor: mesh.material?.polygonOffsetFactor ?? 0,
    polygonOffsetUnits: mesh.material?.polygonOffsetUnits ?? 0,
  });
  mesh.receiveShadow = true;
}

// ── Triplanar shader injection ───────────────────────────────────────────────
/**
 * Terrain splat: top faces get the lawn texture, steep faces get triplanar cliff rock.
 * Vertex colours still tint (and fade far ridges into the haze).
 */
function makeTerrainMaterial(grassTex, rockTex, grassTile, rockTile, topTint) {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.tGrass = { value: grassTex };
    shader.uniforms.tRock = { value: rockTex };
    shader.uniforms.grassTile = { value: grassTile };
    shader.uniforms.rockTile = { value: rockTile };
    shader.uniforms.topTint = { value: new THREE.Color(topTint) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTriP;\nvarying vec3 vTriN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTriP = (modelMatrix * vec4(position, 1.0)).xyz;\nvTriN = normalize(mat3(modelMatrix) * normal);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform sampler2D tGrass; uniform sampler2D tRock; uniform float grassTile; uniform float rockTile; uniform vec3 topTint;
varying vec3 vTriP; varying vec3 vTriN;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 n = normalize(vTriN);
  vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z);
  vec3 rock = texture2D(tRock, vTriP.zy / rockTile).rgb * w.x
            + texture2D(tRock, vTriP.xz / rockTile).rgb * w.y
            + texture2D(tRock, vTriP.xy / rockTile).rgb * w.z;
  vec3 grass = texture2D(tGrass, vTriP.xz / grassTile).rgb;
  float g = smoothstep(0.55, 0.78, n.y);
  vec3 surf = mix(rock * 1.1, grass, g);
  // vertexColor carries the painted tint + distance haze; keep its hue, take detail from photos
  diffuseColor.rgb = mix(surf * mix(vec3(1.0), topTint, g * 0.35), diffuseColor.rgb, 0.3) * mix(0.9, 0.72, g);
}`);
  };
  mat.customProgramCacheKey = () => 'mk8-terrain';
  return mat;
}

/** Object-space triplanar leaf detail for instanced canopy blobs. */
function leafTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(0, 0, 512, 512);
  let s = 7;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < 2600; i++) {
    const x = r() * 512, y = r() * 512, a = r() * Math.PI * 2, L = 7 + r() * 9;
    const v = 120 + Math.floor(r() * 135);
    for (const [dx, dy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
      ctx.save();
      ctx.translate(x + dx, y + dy);
      ctx.rotate(a);
      const g = ctx.createLinearGradient(-L, 0, L, 0);
      g.addColorStop(0, `rgb(${v * 0.7},${v * 0.7},${v * 0.7})`);
      g.addColorStop(1, `rgb(${Math.min(255, v * 1.1)},${Math.min(255, v * 1.1)},${Math.min(255, v * 1.1)})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, L, L * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

let _leafTex = null;
function leafify(mat, scale = 1.6) {
  if (!_leafTex) _leafTex = leafTexture();
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.tLeaf = { value: _leafTex };
    shader.uniforms.leafScale = { value: scale };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLeafP;\nvarying vec3 vLeafN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLeafP = position;\nvLeafN = normal;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D tLeaf; uniform float leafScale;\nvarying vec3 vLeafP; varying vec3 vLeafN;')
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec3 n = normalize(vLeafN);
  vec3 w = pow(abs(n), vec3(3.0)); w /= (w.x + w.y + w.z);
  float l = texture2D(tLeaf, vLeafP.zy * leafScale).r * w.x
          + texture2D(tLeaf, vLeafP.xz * leafScale).r * w.y
          + texture2D(tLeaf, vLeafP.xy * leafScale).r * w.z;
  diffuseColor.rgb *= 0.28 + l * 1.35;
}`);
  };
  mat.customProgramCacheKey = () => `mk8-leaf-${scale}`;
  mat.needsUpdate = true;
}

// ── Public: surfaces ─────────────────────────────────────────────────────────
/**
 * Swap in the photo materials once the textures arrive.
 * `ground` is 'grass' | 'sand' | 'snow'; `asphalt` repaints the road.
 */
export async function applyPhotoSurfaces(scene, root, { ground = 'grass', asphalt = false, topTint = 0x7cc247 } = {}) {
  const [road, lawn, rock, bark] = await Promise.all([
    asphalt ? asphaltSurface() : null,
    lawnSurface(ground),
    loadTex('_pbr/cliff_side_diff.jpg'),
    loadSet('bark_brown_02'),
  ]);
  if (!root.parent) return; // track torn down while loading

  if (road) {
    const roadMesh = scene.userData.raceRoadMesh;
    if (roadMesh?.isMesh) {
      const old = roadMesh.material;
      roadMesh.material = new THREE.MeshStandardMaterial({
        map: road.map,
        normalMap: road.normalMap,
        normalScale: new THREE.Vector2(0.9, 0.9),
        roughnessMap: road.roughnessMap,
        roughness: 1,
        metalness: 0,
        polygonOffset: old?.polygonOffset ?? true,
        polygonOffsetFactor: old?.polygonOffsetFactor ?? -4,
        polygonOffsetUnits: old?.polygonOffsetUnits ?? -4,
      });
      roadMesh.receiveShadow = true;
    }
  }

  if (lawn) {
    ['mk8-lawn', 'roadside-verge', 'track-ground-disc', 'mk-ground'].forEach((n) => {
      scene.traverse((o) => { if (o.name === n) applyLawn(o, lawn); });
    });
    const hills = root.getObjectByName('mk8-hills');
    if (hills && rock) hills.material = makeTerrainMaterial(lawn.plainMap, rock, lawn.tile * 1.5, 22, topTint);
  }

  root.traverse((o) => {
    if (!o.isInstancedMesh) return;
    if (/^mk8-trunks/.test(o.name) && bark.map) {
      o.material = new THREE.MeshStandardMaterial({
        map: bark.map, normalMap: bark.normalMap, roughnessMap: bark.roughnessMap, roughness: 1, metalness: 0,
      });
    }
    if (/^mk8-foliage/.test(o.name)) leafify(o.material, 1.4);
  });
  // Rounded start-gate canopies and any other soft canopies get leaves too
  scene.traverse((o) => { if (o.isMesh && o.userData.mk8Canopy) leafify(o.material, 1.1); });
  console.log('[MK8Photo] surfaces', { ground, asphalt, road: !!road, lawn: !!lawn });
}

// ── Public: lighting ─────────────────────────────────────────────────────────
function sunFromSky(sky) {
  const lon = (sky.u - 0.5) * Math.PI * 2;
  const lat = (0.5 - sky.v) * Math.PI;
  return new THREE.Vector3(Math.cos(lon) * Math.cos(lat), Math.sin(lat), Math.sin(lon) * Math.cos(lat)).normalize();
}

/**
 * Image-based lighting + photo background + a camera-following sun shadow.
 * Called by the Live Lab after its own light setup so nothing overrides it.
 */
export function finalizePhotoLighting(scene, renderer, lights, skyId) {
  const sky = PHOTO_SKIES[skyId];
  if (!sky || !renderer) return;
  const { amb, hemi, sun, fill, shadows = true } = lights || {};
  const sunDir = sunFromSky(sky);

  // Direct light does the modelling; the HDRI supplies bounce + reflections
  if (sun) {
    sun.color.setHex(sky.sun);
    sun.intensity = 2.3;
    sun.castShadow = shadows;
    const hi = scene.userData.qualityTier === 'high';
    sun.shadow.mapSize.set(hi ? 2048 : 1024, hi ? 2048 : 1024);
    const sc = sun.shadow.camera;
    sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70;
    sc.near = 1; sc.far = 400;
    sc.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    sun.shadow.map?.dispose();
    sun.shadow.map = null;
    if (!sun.target.parent) scene.add(sun.target);
  }
  if (amb) amb.intensity = 0.05;
  if (hemi) hemi.intensity = 0.25;
  if (fill) fill.intensity = 0;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.toneMappingExposure = 0.95;
  scene.userData.expMood = 0.95;

  scene.fog = new THREE.Fog(sky.haze, 420, 2400);

  // Every object may cast/receive now that the shadow box tracks the camera
  scene.traverse((o) => {
    if (!o.isMesh || o.isSprite) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m || m.isMeshBasicMaterial || m.isShaderMaterial || m.transparent) return;
    o.receiveShadow = true;
    if (!/^(mk8-hills|mk8-lawn|roadside-verge|track-ground-disc|mk-ground|ocean|kart-kerbs)/.test(o.name)) o.castShadow = true;
  });

  const pmrem = new THREE.PMREMGenerator(renderer);
  new RGBELoader().load(`${BASE}/_sky/${sky.file}.hdr`, (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const env = pmrem.fromEquirectangular(hdr).texture;
    hdr.dispose();
    pmrem.dispose();
    scene.environment = env;
    if ('environmentIntensity' in scene) scene.environmentIntensity = 0.85;
    scene.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mats.forEach((m) => { if ('envMapIntensity' in m) m.envMapIntensity = 1; });
    });
  });
  // Tablets / low tier keep the painted sky dome: the 4K photo costs ~32 MB of GPU memory
  if (scene.userData.qualityTier !== 'low') texLoader.load(`${BASE}/_sky/${sky.file}.jpg`, (bg) => {
    bg.mapping = THREE.EquirectangularReflectionMapping;
    bg.colorSpace = THREE.SRGBColorSpace;
    scene.background = bg;
    if ('backgroundIntensity' in scene) scene.backgroundIntensity = 1.0;
    // The painted fallback sky and cloud puffs step aside for the photo
    ['mk8-sky', 'mk8-sun-glare', 'mk8-clouds', 'track-sky-dome'].forEach((n) => {
      scene.traverse((o) => { if (o.name === n) o.visible = false; });
    });
  });

  // Sun + shadow box ride along with the camera
  const hookGeo = new THREE.BufferGeometry();
  hookGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, -900, 0, 0.001, -900, 0, 0, -900, 0.001], 3));
  const hook = new THREE.Mesh(hookGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  hook.frustumCulled = false;
  hook.name = 'mk8-sun-follow';
  const fwd = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  hook.onBeforeRender = (_r, _s, cam) => {
    if (!sun) return;
    cam.getWorldDirection(fwd);
    fwd.y = 0;
    if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, -1);
    fwd.normalize();
    tgt.copy(cam.position).addScaledVector(fwd, 32);
    // snap to shadow texels so edges don't shimmer while driving
    const snap = 140 / (sun.shadow.mapSize.x || 1024);
    tgt.x = Math.round(tgt.x / snap) * snap;
    tgt.z = Math.round(tgt.z / snap) * snap;
    tgt.y = 0;
    sun.target.position.copy(tgt);
    sun.target.updateMatrixWorld();
    sun.position.copy(tgt).addScaledVector(sunDir, 200);
    sun.updateMatrixWorld();
  };
  (scene.getObjectByName('mk8-showcase') || scene).add(hook);
  // Struggling device: redraw the shadow map every 4th frame instead of turning
  // shadows off — switching shadows off recompiles every shader (a freeze).
  (scene.userData.perfShedders ||= []).push(() => {
    renderer.shadowMap.autoUpdate = false;
    let n = 0;
    const tick = hook.onBeforeRender;
    hook.onBeforeRender = (...args) => {
      tick(...args);
      if ((n++ & 3) === 0) renderer.shadowMap.needsUpdate = true;
    };
  });
  scene.userData.mk8PhotoSky = skyId;
  console.log('[MK8Photo] lighting', skyId);
}
