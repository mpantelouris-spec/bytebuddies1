/**
 * RainbowRoadGlassShader.js — MK Rainbow Road glass tile ribbon + neon materials.
 */
import * as THREE from 'three';
import { sampleTrackFrame, stabilizeNormal } from './GameWorldBuilder.js';

/** Procedural glass tile grid — saturated MK rainbow bands (color pop, not white wash). */
export function createRainbowGlassTrackMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.97 },
      tileRepeat: { value: new THREE.Vector2(6.5, 18) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform vec2 tileRepeat;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      // Pure MK lane colours — fully saturated, no grey
      vec3 mkBand(float idx) {
        float i = mod(idx, 7.0);
        if (i < 1.0) return vec3(1.00, 0.10, 0.22);
        if (i < 2.0) return vec3(1.00, 0.50, 0.00);
        if (i < 3.0) return vec3(1.00, 0.92, 0.00);
        if (i < 4.0) return vec3(0.10, 0.98, 0.38);
        if (i < 5.0) return vec3(0.00, 0.78, 1.00);
        if (i < 6.0) return vec3(0.22, 0.38, 1.00);
        return vec3(0.82, 0.22, 1.00);
      }

      vec3 saturate(vec3 c, float amt) {
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        return mix(vec3(l), c, amt);
      }

      void main() {
        vec2 gridUv = vUv * tileRepeat;
        vec2 tileId = floor(gridUv);
        vec2 tileUv = fract(gridUv);

        float lineW = 0.055;
        float edgeX = min(tileUv.x, 1.0 - tileUv.x);
        float edgeY = min(tileUv.y, 1.0 - tileUv.y);
        float gridLine = 1.0 - smoothstep(0.0, lineW, edgeX) * smoothstep(0.0, lineW, edgeY);

        // Rainbow across track WIDTH — smooth blend between saturated bands
        float bandPos = vUv.x * 7.0;
        float band = floor(bandPos);
        vec3 rainbow = mix(mkBand(band), mkBand(band + 1.0), fract(bandPos));

        // Tile face: full saturated colour in centre, only slightly darker at edges
        float tileFace = smoothstep(0.04, 0.22, tileUv.x) * smoothstep(0.96, 0.78, tileUv.x)
                       * smoothstep(0.04, 0.22, tileUv.y) * smoothstep(0.96, 0.78, tileUv.y);
        vec3 col = mix(rainbow * 0.82, rainbow, tileFace);

        // Grid seams: brighten IN the lane hue (not white) so colours stay vivid
        vec3 seamCol = saturate(rainbow * 1.25, 1.4);
        col = mix(col, seamCol, gridLine * 0.85);

        // Rare sparkle — tinted to lane colour, not white
        float sparkleSeed = fract(sin(dot(tileId, vec2(12.9898, 78.233))) * 43758.5453);
        float twinkle = step(0.95, sparkleSeed) * (0.5 + 0.5 * sin(time * 7.0 + sparkleSeed * 40.0));
        col = mix(col, saturate(rainbow * 1.35, 1.5), twinkle * 0.35);

        // Subtle glass sheen — keeps hue
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewDir);
        float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        col = mix(col, saturate(rainbow * 1.15, 1.3), fresnel * 0.18);

        col = saturate(col, 1.42);

        float alpha = opacity * (0.94 + gridLine * 0.06);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    fog: false,
    toneMapped: false,
  });
}

/** Neon cable material — blooms via toneMapped:false + high emissive. */
export function createNeonCableMaterial(color, intensity = 1.0) {
  return new THREE.MeshBasicMaterial({
    color,
    fog: false,
    toneMapped: false,
    transparent: true,
    opacity: 0.95,
    userData: { emissiveIntensity: intensity },
  });
}

export const NEON_RAIL_COLORS = {
  top: 0x00e5ff,
  mid: 0x00ff33,
  bot: 0xff007f,
};

function inRibbonSkipZone(p, skipZone) {
  if (!skipZone) return false;
  const { x = 0, zLow, zHigh, halfWidth = 4 } = skipZone;
  return Math.abs(p.x - x) < halfWidth + 1.2 && p.z >= zLow - 1 && p.z <= zHigh + 1;
}

/** Build glass ribbon track mesh along a Catmull-Rom spline — continuous arc-length UVs. */
export function buildRainbowGlassRibbon(curve, {
  halfWidth = 3.75,
  segments = 320,
  use3D = true,
  tileRepeatAlong = 22,
  skipZone = null,
  surfaceOffset = 0.36,
  tileLength = 2.0,
  tileWidth = 1.45,
} = {}) {
  const mat = createRainbowGlassTrackMaterial();
  const tilesAcross = (halfWidth * 2) / tileWidth;
  mat.uniforms.tileRepeat.value.set(tilesAcross, 1);
  mat.uniforms.opacity.value = 0.97;

  const pos = [];
  const idx = [];
  const uvs = [];
  const frames = [];
  let prevN = null;
  let arcLen = 0;
  let prevP = null;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const frame = sampleTrackFrame(curve, t);
    const p = frame.p;
    const n = stabilizeNormal(frame.n, prevN);
    prevN = n;
    if (prevP) arcLen += p.distanceTo(prevP);
    prevP = p.clone();
    frames.push({ p, n, t, arcLen });

    const yOff = use3D ? surfaceOffset : 0.2;
    const l = p.clone().addScaledVector(n, -halfWidth);
    const r = p.clone().addScaledVector(n, halfWidth);
    l.y += yOff;
    r.y += yOff;
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    const vAlong = arcLen / tileLength;
    uvs.push(0, vAlong, 1, vAlong);
  }

  for (let i = 0; i < segments; i++) {
    if (skipZone
        && (inRibbonSkipZone(frames[i].p, skipZone) || inRibbonSkipZone(frames[i + 1].p, skipZone))) {
      continue;
    }
    const b = i * 2;
    idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'rainbow-glass-ribbon';
  mesh.renderOrder = 5;

  return {
    mesh,
    material: mat,
    updateTime: (t) => { mat.uniforms.time.value = t; },
  };
}
