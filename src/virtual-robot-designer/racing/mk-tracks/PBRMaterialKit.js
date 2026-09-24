/**
 * PBRMaterialKit.js — Procedural PBR texture stacks (albedo + normal + roughness + AO).
 * Simulates 4K detail via 1024px tiling + anisotropy (WebGL-safe).
 */
import * as THREE from 'three';

let _pbrTexSize = 1024;

/** Set PBR texture resolution before building road materials (tier-aware). */
export function setPBRTextureTier(tier = 'medium') {
  _pbrTexSize = tier === 'high' ? 1024 : tier === 'medium' ? 512 : 256;
}

function texSize() { return _pbrTexSize; }

function noiseCanvas(size = texSize()) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d') };
}

function makeNormalFromHeight(ctx, size, strength = 4) {
  const img = ctx.getImageData(0, 0, size, size);
  const out = noiseCanvas(size);
  const od = out.ctx.createImageData(size, size);
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = (y * size + x) * 4;
      const hL = img.data[((y * size + (x - 1)) * 4)];
      const hR = img.data[((y * size + (x + 1)) * 4)];
      const hU = img.data[(((y - 1) * size + x) * 4)];
      const hD = img.data[(((y + 1) * size + x) * 4)];
      const dx = (hL - hR) / 255 * strength;
      const dy = (hU - hD) / 255 * strength;
      const dz = 1;
      const len = Math.hypot(dx, dy, dz) || 1;
      od.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      od.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      od.data[i + 2] = ((dz / len) * 0.5 + 0.5) * 255;
      od.data[i + 3] = 255;
    }
  }
  out.ctx.putImageData(od, 0, 0);
  return out.canvas;
}

function canvasTexture(canvas, repeat = [1, 1]) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function grayTexture(size, fillFn) {
  const { canvas, ctx } = noiseCanvas(size);
  fillFn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

/** Full PBR stack for biome road surfaces. */
export function makeRoadPBRStack(roadStyle) {
  const SIZE = texSize();
  const { canvas, ctx } = noiseCanvas(SIZE);
  const builders = ROAD_ALBEDO_BUILDERS;
  (builders[roadStyle] || builders.sunset_coral)(ctx, SIZE);

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = SIZE;
  heightCanvas.height = SIZE;
  const hctx = heightCanvas.getContext('2d');
  hctx.drawImage(canvas, 0, 0);
  hctx.globalCompositeOperation = 'luminosity';
  hctx.fillStyle = '#808080';
  hctx.fillRect(0, 0, SIZE, SIZE);

  const map = canvasTexture(canvas, [1, 1]);
  const normalMap = canvasTexture(makeNormalFromHeight(hctx, SIZE, 3.5), [1, 1]);
  normalMap.colorSpace = THREE.LinearSRGBColorSpace;

  const roughnessMap = grayTexture(512, (rx, s) => {
    const params = ROAD_PBR_PARAMS[roadStyle] || ROAD_PBR_PARAMS.sunset_coral;
    const base = params.roughnessDry ?? 0.55;
    const wet = params.roughnessWet ?? 0.08;
    for (let i = 0; i < 5000; i++) {
      const v = Math.random() < (params.wetCoverage ?? 0.15) ? wet : base;
      const g = Math.floor(v * 255);
      rx.fillStyle = `rgb(${g},${g},${g})`;
      rx.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 4, 2);
    }
  });

  const aoMap = grayTexture(512, (ax, s) => {
    ax.fillStyle = '#ffffff';
    ax.fillRect(0, 0, s, s);
    for (let i = 0; i < 3000; i++) {
      const v = 200 + Math.random() * 55;
      ax.fillStyle = `rgb(${v},${v},${v})`;
      ax.fillRect(Math.random() * s, Math.random() * s, 3, 3);
    }
    for (let i = 0; i < 80; i++) {
      ax.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.15})`;
      ax.fillRect(Math.random() * s, Math.random() * s, 8 + Math.random() * 20, 2);
    }
  });

  const params = ROAD_PBR_PARAMS[roadStyle] || ROAD_PBR_PARAMS.sunset_coral;
  return { map, normalMap, roughnessMap, aoMap, params };
}

export function makeRoadPBRMaterial(roadStyle) {
  const { map, normalMap, roughnessMap, aoMap, params } = makeRoadPBRStack(roadStyle);
  // Obsidian must stay near-black — white baseColor was washing the road pink/gray under CSS grade
  const baseColor = roadStyle === 'crystal_obsidian' ? 0x0a0a0c : 0xffffff;
  const mat = new THREE.MeshPhysicalMaterial({
    map,
    normalMap,
    roughnessMap,
    aoMap,
    aoMapIntensity: roadStyle === 'crystal_obsidian' ? 0.4 : 0.65,
    color: baseColor,
    roughness: params.roughnessDry ?? 0.55,
    metalness: params.metalness ?? 0.12,
    emissive: params.emissive ?? 0x000000,
    emissiveIntensity: params.emissiveIntensity ?? 0,
    clearcoat: params.clearcoat ?? 0.45,
    clearcoatRoughness: roadStyle === 'crystal_obsidian' ? 0.05 : 0.12,
    normalScale: new THREE.Vector2(0.35, 0.35),
    envMapIntensity: roadStyle === 'crystal_obsidian' ? 1.2 : (roadStyle === 'cosmic_metal' ? 0.25 : 0.85),
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  if (roadStyle === 'crystal_obsidian') {
    mat.emissive = new THREE.Color(0x00aacc);
    mat.emissiveIntensity = 0.35;
    mat.roughness = 0.04;
    mat.metalness = 0.22;
    mat.clearcoat = 0.98;
  }
  return mat;
}

function canvasSz(ctx) { return ctx.canvas.width; }

function baseAsphalt(ctx, r, g, b, variation = 0.15) {
  const S = canvasSz(ctx);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) {
    const s = 1 + (Math.random() - 0.5) * variation * 2;
    ctx.fillStyle = `rgba(${Math.min(255, r * s)},${Math.min(255, g * s)},${Math.min(255, b * s)},${0.05 + Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 2 + Math.random() * 4, 1 + Math.random() * 2);
  }
}

function edgePaint(ctx, color = '#F5F5F0', inset = 28) {
  const S = canvasSz(ctx);
  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(inset, 0);
  ctx.lineTo(inset, S);
  ctx.moveTo(S - inset, 0);
  ctx.lineTo(S - inset, S);
  ctx.stroke();
}

function centerDash(ctx, color = '#FFD700', width = 8, dash = [32, 32]) {
  const S = canvasSz(ctx);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(S / 2, 0);
  ctx.lineTo(S / 2, S);
  ctx.stroke();
  ctx.setLineDash([]);
}

function wetPatches(ctx, color = '#C44F2A', count = 120) {
  const S = canvasSz(ctx);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},${0.12 + Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * S, Math.random() * S, 12 + Math.random() * 28, 6 + Math.random() * 14, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function aggregateNormal(ctx) {
  const S = canvasSz(ctx);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 2, 1);
  }
}

const ROAD_PBR_PARAMS = {
  sunset_coral: {
    roughnessDry: 0.48, roughnessWet: 0.1, wetCoverage: 0.22,
    metalness: 0.12, emissive: 0xff6622, emissiveIntensity: 0.08,
    clearcoat: 0.55,
  },
  crystal_obsidian: { roughnessDry: 0.05, roughnessWet: 0.03, metalness: 0.15, emissive: 0x00d9ff, emissiveIntensity: 1.4, clearcoat: 0.95, wetCoverage: 0.35 },
  sky_jade: { roughnessDry: 0.18, metalness: 0.35, emissive: 0x00ff88, emissiveIntensity: 0.35, clearcoat: 0.6 },
  garden_green: { roughnessDry: 0.5, metalness: 0.08, emissive: 0x7cfc00, emissiveIntensity: 0.12, clearcoat: 0.25 },
  volcano_charcoal: { roughnessDry: 0.65, metalness: 0.25, emissive: 0xff5500, emissiveIntensity: 0.75, clearcoat: 0.2 },
  cyber_navy: { roughnessDry: 0.03, roughnessWet: 0.02, wetCoverage: 0.35, metalness: 0.78, emissive: 0xff00ff, emissiveIntensity: 0.65, clearcoat: 0.9 },
  frost_ice: { roughnessDry: 0.06, metalness: 0.55, emissive: 0x88ddff, emissiveIntensity: 0.4, clearcoat: 0.95 },
  ruins_moss: { roughnessDry: 0.72, metalness: 0.1, emissive: 0x446622, emissiveIntensity: 0.15, clearcoat: 0.15 },
  stardust_violet: { roughnessDry: 0.1, metalness: 0.75, emissive: 0xaa44ff, emissiveIntensity: 0.35, clearcoat: 0.7 },
  cosmic_metal: { roughnessDry: 0.5, metalness: 0.3, emissive: 0x000000, emissiveIntensity: 0, clearcoat: 0.25 },
  meadow_gravel: { roughnessDry: 0.78, metalness: 0.05, emissive: 0x000000, emissiveIntensity: 0, clearcoat: 0.1 },
  metro_black: { roughnessDry: 0.55, roughnessWet: 0.02, wetCoverage: 0.28, metalness: 0.35, emissive: 0xffff00, emissiveIntensity: 0.12, clearcoat: 0.35 },
  candy_pink: { roughnessDry: 0.35, metalness: 0.1, emissive: 0xff69b4, emissiveIntensity: 0.25, clearcoat: 0.4 },
  asphalt: {
    roughnessDry: 0.62, roughnessWet: 0.18, wetCoverage: 0.12,
    metalness: 0.08, emissive: 0x000000, emissiveIntensity: 0, clearcoat: 0.22,
  },
};

const ROAD_ALBEDO_BUILDERS = {
  asphalt(ctx) {
    const S = canvasSz(ctx);
    ctx.fillStyle = '#3d4148';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 2200; i++) {
      const g = 48 + Math.random() * 40;
      ctx.fillStyle = `rgba(${g},${g + 2},${g + 6},${0.12 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 1);
    }
    wetPatches(ctx, '#2a2e34', 40);
    aggregateNormal(ctx);
    edgePaint(ctx, '#F5F5F0', 22);
    centerDash(ctx, '#FFFFFF', 7, [28, 22]);
  },
  sunset_coral(ctx) {
    const S = canvasSz(ctx);
    const g = ctx.createLinearGradient(0, 0, S, S * 0.5);
    g.addColorStop(0, '#e85a30');
    g.addColorStop(0.35, '#ff9966');
    g.addColorStop(0.65, '#ffbb77');
    g.addColorStop(1, '#e85a30');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    wetPatches(ctx, '#d94a28', 70);
    aggregateNormal(ctx);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,${180 + Math.random() * 60},${100 + Math.random() * 40},${0.06 + Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 2 + Math.random() * 4, 1);
    }
    edgePaint(ctx, '#F5F5F0');
    centerDash(ctx, '#FFFFFF', 6, [30, 26]);
  },
  crystal_obsidian(ctx) {
    const S = canvasSz(ctx);
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = 'rgba(10,24,36,0.4)';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(0,${150 + Math.random() * 80},255,${0.05 + Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 2, 1);
    }
    wetPatches(ctx, '#0a2838', 80);
    aggregateNormal(ctx);
  },
  sky_jade(ctx) {
    baseAsphalt(ctx, 62, 232, 160, 0.1);
    centerDash(ctx, '#FFD700', 6, [30, 24]);
    edgePaint(ctx, 'rgba(255,215,0,0.5)');
  },
  garden_green(ctx) {
    const S = canvasSz(ctx);
    baseAsphalt(ctx, 124, 252, 0, 0.12);
    aggregateNormal(ctx);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(60,${140 + Math.random() * 60},${20 + Math.random() * 40},${0.08 + Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 3, 2);
    }
    edgePaint(ctx, '#F5F5F0');
    centerDash(ctx, '#FFD700', 7, [32, 32]);
  },
  volcano_charcoal(ctx) {
    const S = canvasSz(ctx);
    baseAsphalt(ctx, 42, 38, 32, 0.2);
    centerDash(ctx, '#FF4500', 5, [24, 18]);
    for (let i = 0; i < 200; i++) {
      ctx.strokeStyle = `rgba(255,${80 + Math.random() * 100},0,${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * S, Math.random() * S);
      ctx.lineTo(Math.random() * S, Math.random() * S);
      ctx.stroke();
    }
  },
  cyber_navy(ctx) {
    baseAsphalt(ctx, 0, 26, 51, 0.08);
    wetPatches(ctx, '#001A33', 200);
    centerDash(ctx, '#FF00AA', 6, [18, 14]);
    edgePaint(ctx, 'rgba(0,204,255,0.55)', 20);
  },
  frost_ice(ctx) {
    baseAsphalt(ctx, 126, 200, 232, 0.06);
    centerDash(ctx, '#D0D8E0', 5, [26, 20]);
    edgePaint(ctx, 'rgba(232,244,255,0.7)');
  },
  ruins_moss(ctx) {
    const S = canvasSz(ctx);
    baseAsphalt(ctx, 74, 90, 50, 0.22);
    centerDash(ctx, '#D4AF37', 5, [28, 22]);
    for (let i = 0; i < 350; i++) {
      ctx.fillStyle = `rgba(45,90,35,${0.1 + Math.random() * 0.25})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 6, 3);
    }
  },
  stardust_violet(ctx) {
    baseAsphalt(ctx, 123, 47, 190, 0.1);
    centerDash(ctx, '#FFFFFF', 6, [22, 16]);
    edgePaint(ctx, 'rgba(200,150,255,0.5)');
  },
  cosmic_metal(ctx) {
    const S = canvasSz(ctx);
    baseAsphalt(ctx, 30, 32, 42, 0.1);
    ctx.strokeStyle = 'rgba(20,22,30,0.9)';
    ctx.lineWidth = 2;
    for (let y = 0; y < S; y += S / 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke();
    }
    for (let x = S / 4; x < S; x += S / 4) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S); ctx.stroke();
    }
    ctx.fillStyle = '#33e6ff';
    ctx.fillRect(S * 0.04, 0, S * 0.025, S);
    ctx.fillStyle = '#ff9a2e';
    ctx.fillRect(S * 0.935, 0, S * 0.025, S);
  },
  meadow_gravel(ctx) {
    const S = canvasSz(ctx);
    baseAsphalt(ctx, 201, 166, 107, 0.25);
    centerDash(ctx, '#FFFFFF', 4, [20, 18]);
    for (let i = 0; i < 4000; i++) {
      const v = 120 + Math.random() * 80;
      ctx.fillStyle = `rgba(${v},${(v * 0.7) | 0},${(v * 0.45) | 0},0.2)`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 2, 2);
    }
  },
  metro_black(ctx) {
    baseAsphalt(ctx, 20, 20, 20, 0.1);
    wetPatches(ctx, '#0A0A0A', 80);
    centerDash(ctx, '#FFE600', 5, [16, 12]);
    edgePaint(ctx, 'rgba(255,230,0,0.45)');
  },
  candy_pink(ctx) {
    const S = canvasSz(ctx);
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#ff8ec8');
    g.addColorStop(0.5, '#ffb6d9');
    g.addColorStop(1, '#ff7eb8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    wetPatches(ctx, '#ff69b4', 55);
    centerDash(ctx, '#FFD700', 7, [28, 24]);
    edgePaint(ctx, '#FFFFFF');
    for (let i = 0; i < 450; i++) {
      ctx.fillStyle = `rgba(255,${180 + Math.random() * 75},${200 + Math.random() * 55},${0.12 + Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * S, Math.random() * S, 3 + Math.random() * 4, 2);
    }
  },
};

export const TRACK_GEOMETRY_SPEC = {
  LANE_WIDTH: 8.0,
  LANE_HALF: 4.0,
  KERB_WIDTH: 0.95,
  KERB_RISE: 0.16,
  ROAD_THICKNESS: 0.18,
  EDGE_PAINT: 0.25,
  SPLINE_STEP_M: 2.0,
  BANK_MEDIUM_DEG: 6,
  BANK_HAIRPIN_DEG: 12,
};
