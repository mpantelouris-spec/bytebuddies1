/**
 * MarioKartTrackBuilder.js — Proper kart racing track geometry.
 * Solid road deck + kerbs + barrier walls. NOT a flat wonky ribbon.
 */
import * as THREE from 'three';
import { sampleTrackFrame } from './GameWorldBuilder.js';
import { buildProfessionalCircuitWaypoints } from './ProfessionalRainbowTrack.js';
import { FLAT_ROAD_BASE_Y } from './RacingRaceLogic.js';
import { makeBiomeRoadTexture } from './mk-tracks/BiomeAAARoadTextures.js';
import { makeRoadPBRMaterial, TRACK_GEOMETRY_SPEC } from './mk-tracks/PBRMaterialKit.js';
import { getActiveCosmicTheme, cosmicHex } from './mk-tracks/CosmicSkywayRegistry.js';

export { TRACK_GEOMETRY_SPEC };

function paintCenterStripe(ctx, color = '#ffffff', width = 4, dash = [28, 22]) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();
}

function speckle(ctx, count = 600, alpha = 0.04) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
}

function makeRoadTexture(style = 'asphalt') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  if (style === 'rainbow') {
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    ['#ff0044', '#ff8800', '#ffee00', '#00ff66', '#0088ff', '#8800ff', '#ff0044'].forEach((col, i) => {
      g.addColorStop(i / 6, col);
    });
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    paintCenterStripe(ctx, 'rgba(255,255,255,0.85)');
  } else if (style === 'luigi_red') {
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#c01818');
    grad.addColorStop(0.5, '#ff3030');
    grad.addColorStop(1, '#c01818');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2200; i++) {
      const shade = 140 + Math.random() * 60;
      ctx.fillStyle = `rgba(${shade},${40 + Math.random() * 30},${30 + Math.random() * 25},${0.12 + Math.random() * 0.18})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 2);
    }
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(60,10,10,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 1);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(22, 512);
    ctx.moveTo(490, 0);
    ctx.lineTo(490, 512);
    ctx.stroke();
    paintCenterStripe(ctx, '#ffffff', 5, [28, 22]);
  } else if (style === 'farm_gravel') {
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) {
      const shade = 180 + Math.random() * 50;
      ctx.fillStyle = `rgba(${shade},${120 + Math.random() * 45},${70 + Math.random() * 35},${0.2 + Math.random() * 0.25})`;
      const sz = 1 + Math.random() * 4;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, sz, sz);
    }
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(90,70,45,${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 1);
    }
    speckle(ctx, 300, 0.03);
  } else if (style === 'stadium_blue') {
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#0038bb');
    grad.addColorStop(0.5, '#0055ee');
    grad.addColorStop(1, '#0038bb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const shade = 0.04 + Math.random() * 0.08;
      ctx.fillStyle = `rgba(255,255,255,${shade})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1);
    }
    for (let i = 0; i < 45; i++) {
      ctx.strokeStyle = `rgba(20,20,40,${0.08 + Math.random() * 0.12})`;
      ctx.lineWidth = 2 + Math.random() * 4;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(20, 512);
    ctx.moveTo(492, 0);
    ctx.lineTo(492, 512);
    ctx.stroke();
    ctx.shadowBlur = 0;
    paintCenterStripe(ctx, '#ffff00', 6, [32, 24]);
  } else if (style === 'peach_pink') {
    ctx.fillStyle = '#ffb6d9';
    ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 300, 0.08);
    paintCenterStripe(ctx, '#fffacd', 4, [30, 22]);
  } else if (style === 'desert_sand') {
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${180 + Math.random() * 40},${120 + Math.random() * 40},${60 + Math.random() * 30},0.25)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    paintCenterStripe(ctx, '#f5deb3', 3, [20, 30]);
  } else if (style === 'canyon_gray') {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 700, 0.05);
    paintCenterStripe(ctx, '#ffffff', 4, [24, 20]);
  } else if (style === 'bowser_black') {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 48) {
      ctx.fillStyle = y % 96 === 0 ? '#ff0000' : '#0a0a0a';
      ctx.fillRect(0, y, 512, 24);
    }
    paintCenterStripe(ctx, '#ff4400', 4, [16, 16]);
  } else if (style === 'bone_sand') {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(200,200,180,${Math.random() * 0.3})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 1);
    }
    paintCenterStripe(ctx, '#d3d3d3', 2, [14, 32]);
  } else if (style === 'water_slide') {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#87ceeb');
    g.addColorStop(1, '#0077be');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, i * 18);
      ctx.bezierCurveTo(170, i * 18 + 8, 340, i * 18 - 8, 512, i * 18);
      ctx.stroke();
    }
    paintCenterStripe(ctx, 'rgba(255,255,255,0.5)', 3, [20, 24]);
  } else if (style === 'volcano_glow') {
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,${80 + Math.random() * 100},0,${Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
    paintCenterStripe(ctx, '#ffd700', 4, [22, 18]);
  } else if (style === 'cheese_gold') {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = '#ffa500';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 8 + Math.random() * 18, 0, Math.PI * 2);
      ctx.fill();
    }
    paintCenterStripe(ctx, '#ffb6d9', 4, [26, 26]);
  } else if (style === 'candy') {
    ctx.fillStyle = '#ff7799';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360},80%,70%)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    paintCenterStripe(ctx, '#ffffff', 5, [30, 20]);
  } else if (style === 'sunset_coral') {
    const g = ctx.createLinearGradient(0, 0, 512, 256);
    g.addColorStop(0, '#e85a30'); g.addColorStop(0.35, '#ff9966'); g.addColorStop(0.65, '#ffbb77'); g.addColorStop(1, '#e85a30');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(255,${180 + Math.random() * 60},${100 + Math.random() * 40},${0.06 + Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 4, 1);
    }
    speckle(ctx, 700, 0.08);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 16; ctx.shadowColor = '#ff8844'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(18, 512); ctx.moveTo(494, 0); ctx.lineTo(494, 512); ctx.stroke();
    ctx.shadowBlur = 0;
    paintCenterStripe(ctx, '#ffffff', 5, [28, 22]);
  } else if (style === 'crystal_obsidian') {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(0,${140 + Math.random() * 90},255,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1);
    }
  } else if (style === 'sky_jade') {
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, '#00c878'); g.addColorStop(0.5, '#00fa9a'); g.addColorStop(1, '#00c878');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 500, 0.07);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(255,255,200,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
    paintCenterStripe(ctx, '#ffd700', 5, [30, 20]);
  } else if (style === 'volcano_charcoal') {
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(255,${40 + Math.random() * 100},0,${Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 3);
    }
    for (let y = 0; y < 512; y += 8) {
      ctx.fillStyle = `rgba(255,80,0,${0.03 + Math.random() * 0.04})`;
      ctx.fillRect(0, y, 512, 2);
    }
    paintCenterStripe(ctx, '#ff5500', 5, [16, 18]);
  } else if (style === 'cyber_navy') {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#001530'); g.addColorStop(0.5, '#002244'); g.addColorStop(1, '#000a18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,0,255' : '0,255,255'},${0.12 + Math.random() * 0.25})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); ctx.moveTo(0, i * 12); ctx.lineTo(512, i * 12 + 15); ctx.stroke();
    }
    speckle(ctx, 400, 0.06);
    paintCenterStripe(ctx, '#ff00ff', 5, [20, 16]);
  } else if (style === 'frost_ice') {
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, '#7ec8e8'); g.addColorStop(0.5, '#a8d8f0'); g.addColorStop(1, '#5dade2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1);
    }
    paintCenterStripe(ctx, '#e8f4ff', 5, [24, 22]);
  } else if (style === 'ruins_moss') {
    const g = ctx.createLinearGradient(0, 0, 512, 256);
    g.addColorStop(0, '#4a6b3a'); g.addColorStop(1, '#556b2f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${30 + Math.random() * 40},${70 + Math.random() * 50},${15 + Math.random() * 25},0.35)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    paintCenterStripe(ctx, '#ffd700', 5, [26, 20]);
  } else if (style === 'stardust_violet') {
    const g = ctx.createLinearGradient(0, 0, 512, 0);
    g.addColorStop(0, '#5a18a0'); g.addColorStop(0.5, '#9b30ff'); g.addColorStop(1, '#5a18a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 1200, 0.12);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    paintCenterStripe(ctx, '#ffffff', 5, [28, 22]);
  } else if (style === 'cosmic_metal') {
    ctx.fillStyle = '#1c1e26'; ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 900, 0.05);
    ctx.strokeStyle = 'rgba(8,9,14,0.9)'; ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
    for (let x = 128; x < 512; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
    const cosmic = getActiveCosmicTheme();
    ctx.fillStyle = cosmicHex(cosmic.left); ctx.fillRect(20, 0, 10, 512);
    ctx.fillStyle = cosmicHex(cosmic.right); ctx.fillRect(482, 0, 10, 512);
    paintCenterStripe(ctx, '#ffd9a0', 4, [26, 22]);
  } else if (style === 'meadow_gravel') {
    ctx.fillStyle = '#c4956a'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(${150 + Math.random() * 60},${100 + Math.random() * 50},${50 + Math.random() * 35},0.28)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 1);
    }
    speckle(ctx, 300, 0.04);
    paintCenterStripe(ctx, '#ffffff', 4, [28, 24]);
  } else if (style === 'metro_black') {
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 64) {
      ctx.fillStyle = y % 128 === 0 ? '#ffee00' : '#111111';
      ctx.fillRect(0, y, 512, 14);
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(255,255,0,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 1);
    }
    paintCenterStripe(ctx, '#ffff00', 5, [14, 14]);
  } else {
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(0, 0, 512, 512);
    speckle(ctx, 800, 0.04);
    paintCenterStripe(ctx, '#ffffff', 4, [24, 18]);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 8);
  tex.anisotropy = 8;
  return tex;
}

function roadMaterialParams(style) {
  const map = {
    rainbow: { roughness: 0.25, metalness: 0.35, emissive: 0x442266, emi: 0.28 },
    luigi_red: { roughness: 0.38, metalness: 0.1, emissive: 0xaa1010, emi: 0.18 },
    farm_gravel: { roughness: 0.92, metalness: 0.02, emissive: 0x000000, emi: 0 },
    stadium_blue: { roughness: 0.12, metalness: 0.55, emissive: 0x0a2288, emi: 0.28 },
    peach_pink: { roughness: 0.3, metalness: 0.2, emissive: 0x442233, emi: 0.1 },
    desert_sand: { roughness: 0.95, metalness: 0.02, emissive: 0x000000, emi: 0 },
    canyon_gray: { roughness: 0.75, metalness: 0.1, emissive: 0x111111, emi: 0.03 },
    bowser_black: { roughness: 0.55, metalness: 0.35, emissive: 0x440000, emi: 0.15 },
    bone_sand: { roughness: 0.9, metalness: 0.02, emissive: 0x222222, emi: 0.02 },
    water_slide: { roughness: 0.15, metalness: 0.45, emissive: 0x004488, emi: 0.2 },
    volcano_glow: { roughness: 0.4, metalness: 0.3, emissive: 0xff4400, emi: 0.35 },
    cheese_gold: { roughness: 0.5, metalness: 0.15, emissive: 0x664400, emi: 0.12 },
    candy: { roughness: 0.65, metalness: 0.08, emissive: 0x441122, emi: 0.08 },
    asphalt: { roughness: 0.62, metalness: 0.08, emissive: 0x000000, emi: 0 },
    sunset_coral: { roughness: 0.55, metalness: 0.12, emissive: 0x331100, emi: 0.08 },
    crystal_obsidian: { roughness: 0.05, metalness: 0.82, emissive: 0x00ccff, emi: 0.85 },
    sky_jade: { roughness: 0.08, metalness: 0.6, emissive: 0x00ff88, emi: 0.58 },
    volcano_charcoal: { roughness: 0.3, metalness: 0.4, emissive: 0xff5500, emi: 0.88 },
    cyber_navy: { roughness: 0.05, metalness: 0.78, emissive: 0xff00ff, emi: 0.78 },
    frost_ice: { roughness: 0.06, metalness: 0.68, emissive: 0x88ddff, emi: 0.62 },
    ruins_moss: { roughness: 0.72, metalness: 0.1, emissive: 0x88aa44, emi: 0.35 },
    stardust_violet: { roughness: 0.1, metalness: 0.6, emissive: 0xaa44ff, emi: 0.85 },
    cosmic_metal: { roughness: 0.32, metalness: 0.75, emissive: 0x000000, emi: 0 },
    meadow_gravel: { roughness: 0.82, metalness: 0.08, emissive: 0xffdd88, emi: 0.25 },
    metro_black: { roughness: 0.5, metalness: 0.35, emissive: 0xffff00, emi: 0.45 },
  };
  return map[style] || { roughness: 0.65, metalness: 0.08, emissive: 0x000000, emi: 0 };
}

/** Solid asphalt colours for flat chase-cam tracks (avoids UV banding / z-fight ribs). */
const FLAT_ROAD_COLORS = {
  sunset_coral: 0xe8a868,
  crystal_obsidian: 0x121212,
  sky_jade: 0x3ab878,
  volcano_charcoal: 0x4a3a30,
  cyber_navy: 0x1a2248,
  frost_ice: 0xd0e8f8,
  ruins_moss: 0x6a7a58,
  stardust_violet: 0x4a1888,
  cosmic_metal: 0x1c1e26,
  metro_black: 0x4a4a4a,
  asphalt: 0x4a4e56,
  desert_sand: 0xd4b896,
  candy: 0xff7799,
  luigi_red: 0xcc2222,
  peach_pink: 0xffaacc,
  canyon_gray: 0x6a6a72,
  bone_sand: 0xc8b898,
};

const FLAT_STRIPE_COLORS = {
  sunset_coral: '#ffffff',
  crystal_obsidian: '#00ffff',
  sky_jade: '#fffacd',
  volcano_charcoal: '#ffaa44',
  cyber_navy: '#ff00ff',
  frost_ice: '#4488cc',
  ruins_moss: '#ffd700',
  stardust_violet: '#dda0ff',
  cosmic_metal: '#ffd9a0',
  metro_black: '#ffff00',
  meadow_gravel: '#ffffff',
};

function hexToRgb(hex) {
  const c = new THREE.Color(hex);
  return { r: c.r * 255 | 0, g: c.g * 255 | 0, b: c.b * 255 | 0 };
}

function makeFlatRoadTexture(style) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const base = flatRoadColor(style);
  const { r, g, b } = hexToRgb(base);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 400; i++) {
    const s = 0.92 + Math.random() * 0.16;
    ctx.fillStyle = `rgba(${Math.min(255, r * s)},${Math.min(255, g * s)},${Math.min(255, b * s)},${0.06 + Math.random() * 0.1})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 1 + Math.random() * 2);
  }
  const stripe = FLAT_STRIPE_COLORS[style] ?? '#ffffff';
  ctx.strokeStyle = stripe;
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 18]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(16, 256);
  ctx.moveTo(240, 0);
  ctx.lineTo(240, 256);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 4;
  return tex;
}

function flatRoadColor(style) {
  return FLAT_ROAD_COLORS[style] ?? 0x5a5a62;
}

function makeKerbTexture(roadStyle = 'asphalt') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d');
  const stripeH = 10;
  const coastal = roadStyle === 'sunset_coral' || roadStyle === 'candy_pink';
  for (let y = 0; y < 64; y += stripeH) {
    const band = Math.floor(y / stripeH);
    if (coastal) {
      ctx.fillStyle = band % 2 === 0 ? '#f5f0e8' : '#c8b898';
    } else {
      ctx.fillStyle = band % 2 === 0 ? '#ff2a2a' : '#ffffff';
    }
    ctx.fillRect(0, y, 128, stripeH);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function signedCurvature(curve, t) {
  const eps = 0.008;
  const t0 = (t - eps + 1) % 1;
  const t1 = (t + eps) % 1;
  const a = curve.getTangentAt(t0).normalize();
  const b = curve.getTangentAt(t1).normalize();
  return Math.atan2(a.x * b.z - a.z * b.x, a.dot(b));
}

function bankAngleRad(curvature) {
  const abs = Math.abs(curvature);
  if (abs < 0.04) return 0;
  const deg = abs > 0.14 ? TRACK_GEOMETRY_SPEC.BANK_HAIRPIN_DEG : TRACK_GEOMETRY_SPEC.BANK_MEDIUM_DEG;
  return (deg * Math.PI) / 180;
}

/**
 * Build a solid Mario Kart style track: road deck + kerbs + outer walls.
 */
export const KART_ROAD_DECK_RISE = 0.02;

/** Match MarioKartTrackBuilder road vertex height at spline parameter t. */
export function sampleKartRoadSurfaceY(curve, t, { use3D = false } = {}) {
  const { p } = sampleTrackFrame(curve, t);
  const baseY = use3D ? p.y : FLAT_ROAD_BASE_Y;
  return baseY + KART_ROAD_DECK_RISE;
}

export function buildMarioKartTrack(curve, group, {
  halfWidth = TRACK_GEOMETRY_SPEC.LANE_HALF,
  segments = 480,
  roadStyle = 'asphalt',
  use3D = false,
  kerbs = true,
  walls = true,
  wallHeight = 1.1,
  glowMaterial = null,
  banking = false,
  pbrRoad = true,
} = {}) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'kart-track';
  group.add(trackGroup);

  const curveLen = curve.getLength?.() ?? segments * 2;
  const segCount = Math.max(segments, Math.ceil(curveLen / TRACK_GEOMETRY_SPEC.SPLINE_STEP_M));
  segments = segCount;

  const roadTex = (!pbrRoad && use3D) ? makeRoadTexture(roadStyle) : null;
  const kerbTex = makeKerbTexture(roadStyle);
  const matP = roadMaterialParams(roadStyle);
  const thickness = TRACK_GEOMETRY_SPEC.ROAD_THICKNESS;
  const kerbW = TRACK_GEOMETRY_SPEC.KERB_WIDTH;
  const kerbH = TRACK_GEOMETRY_SPEC.KERB_RISE;

  const roadMat = glowMaterial || (pbrRoad
    ? makeRoadPBRMaterial(roadStyle)
    : new THREE.MeshPhysicalMaterial({
      map: roadTex || makeBiomeRoadTexture(roadStyle),
      color: 0xffffff,
      roughness: use3D ? matP.roughness : (matP.roughness ?? 0.65),
      metalness: use3D ? matP.metalness : (matP.metalness ?? 0.08),
      emissive: matP.emissive,
      emissiveIntensity: use3D ? matP.emi : (matP.emi * 0.22),
      clearcoat: 0.45,
      clearcoatRoughness: 0.12,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }));

  const coastal = roadStyle === 'sunset_coral' || roadStyle === 'candy_pink';
  const kerbMat = new THREE.MeshStandardMaterial({
    map: kerbTex,
    roughness: 0.55,
    metalness: 0.04,
    emissive: coastal ? 0x8a7a60 : 0xff2244,
    emissiveIntensity: coastal ? 0.04 : 0.22,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: roadStyle === 'rainbow' ? 0xaaccff : 0xcccccc,
    emissive: roadStyle === 'rainbow' ? 0x224488 : 0x111111,
    emissiveIntensity: roadStyle === 'rainbow' ? 0.35 : 0.05,
    roughness: 0.5,
    metalness: 0.3,
  });
  const roadVerts = [];
  const roadIdx = [];
  const roadUvs = [];
  const roadBotVerts = [];
  const sideVerts = [];
  const sideIdx = [];
  const kerbVerts = [];
  const kerbIdx = [];
  const wallVerts = [];
  const wallIdx = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const frame = sampleTrackFrame(curve, t);
    const { p, n } = frame;
    const y = use3D ? p.y : FLAT_ROAD_BASE_Y;
    const curv = banking ? signedCurvature(curve, t) : 0;
    const bank = bankAngleRad(curv);
    const bankSign = curv >= 0 ? 1 : -1;
    const bankOffset = Math.tan(bank) * halfWidth * bankSign;

    const left = p.clone().addScaledVector(n, -halfWidth);
    const right = p.clone().addScaledVector(n, halfWidth);
    const topY = y + KART_ROAD_DECK_RISE;
    left.y = topY - bankOffset;
    right.y = topY + bankOffset;

    roadVerts.push(left.x, left.y, left.z, right.x, right.y, right.z);
    roadBotVerts.push(left.x, left.y - thickness, left.z, right.x, right.y - thickness, right.z);
    const uvAlong = t * (curveLen / 2);
    roadUvs.push(0, uvAlong, 1, uvAlong);

    if (i < segments) {
      const b2 = i * 2;
      roadIdx.push(b2, b2 + 1, b2 + 2, b2 + 1, b2 + 3, b2 + 2);
      const sb = sideVerts.length / 3;
      sideVerts.push(
        left.x, left.y, left.z,
        left.x, left.y - thickness, left.z,
        right.x, right.y, right.z,
        right.x, right.y - thickness, right.z,
      );
      sideIdx.push(sb, sb + 1, sb + 2, sb + 1, sb + 3, sb + 2);
    }

    if (kerbs) {
      const kl = left.clone().addScaledVector(n, -kerbW * 0.5);
      const kr = right.clone().addScaledVector(n, kerbW * 0.5);
      const klOut = left.clone().addScaledVector(n, -kerbW);
      const krOut = right.clone().addScaledVector(n, kerbW);
      kl.y = left.y + kerbH * 0.5;
      kr.y = right.y + kerbH * 0.5;
      klOut.y = left.y;
      krOut.y = right.y;
      const kb = kerbVerts.length / 3;
      kerbVerts.push(
        klOut.x, klOut.y, klOut.z, kl.x, kl.y, kl.z,
        krOut.x, krOut.y, krOut.z, kr.x, kr.y, kr.z,
      );
      kerbIdx.push(kb, kb + 1, kb + 2, kb + 1, kb + 3, kb + 2);
    }

    if (walls) {
      const wallOut = kerbW + 0.35;
      for (const side of [-1, 1]) {
        const base = side < 0 ? left : right;
        const outer = base.clone().addScaledVector(n, side * wallOut);
        const top = outer.clone();
        top.y += wallHeight;
        const wBase = wallVerts.length / 3;
        wallVerts.push(outer.x, outer.y, outer.z, top.x, top.y, top.z);
        if (i > 0) {
          const prev = wBase - 2;
          wallIdx.push(prev, prev + 1, wBase, prev + 1, wBase + 1, wBase);
        }
      }
    }
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVerts, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeo.setIndex(roadIdx);
  roadGeo.computeVertexNormals();
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  roadMesh.castShadow = true;
  roadMesh.renderOrder = 3;
  trackGroup.add(roadMesh);

  if (sideVerts.length) {
    const sideGeo = new THREE.BufferGeometry();
    sideGeo.setAttribute('position', new THREE.Float32BufferAttribute(sideVerts, 3));
    sideGeo.setIndex(sideIdx);
    sideGeo.computeVertexNormals();
    const sideMesh = new THREE.Mesh(sideGeo, roadMat);
    sideMesh.castShadow = true;
    sideMesh.receiveShadow = true;
    trackGroup.add(sideMesh);
  }

  const botGeo = new THREE.BufferGeometry();
  botGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadBotVerts, 3));
  const botIdx = [];
  for (let i = 0; i < segments; i++) {
    const b2 = i * 2;
    botIdx.push(b2 + 2, b2 + 1, b2, b2 + 2, b2 + 3, b2 + 1);
  }
  botGeo.setIndex(botIdx);
  botGeo.computeVertexNormals();
  const botMesh = new THREE.Mesh(botGeo, roadMat);
  botMesh.receiveShadow = true;
  trackGroup.add(botMesh);

  if (kerbs && kerbVerts.length) {
    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbVerts, 3));
    kerbGeo.setIndex(kerbIdx);
    kerbGeo.computeVertexNormals();
    const kerbMesh = new THREE.Mesh(kerbGeo, kerbMat);
    kerbMesh.castShadow = true;
    kerbMesh.receiveShadow = true;
    trackGroup.add(kerbMesh);
  }

  if (walls && wallVerts.length) {
    const wallGeo = new THREE.BufferGeometry();
    wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallVerts, 3));
    wallGeo.setIndex(wallIdx);
    wallGeo.computeVertexNormals();
    const barrierMesh = new THREE.Mesh(wallGeo, wallMat);
    barrierMesh.castShadow = true;
    barrierMesh.receiveShadow = true;
    trackGroup.add(barrierMesh);
  }

  return {
    group: trackGroup,
    roadMesh,
    roadMat,
    roadTex,
    updateTime: (time) => {
      if (roadMat.uniforms?.time) roadMat.uniforms.time.value = time;
      if (roadTex) roadTex.offset.y = -time * 0.05;
    },
  };
}

/** Pre-built Mario Circuit style splines — elongated, NOT circular. */
export const MARIO_CIRCUIT_CANDY = [
  { x: 0, y: 0, z: 50 },
  { x: 0, y: 0, z: 38 },
  { x: 0, y: 0, z: 26 },
  { x: 4, y: 0, z: 16 },
  { x: 14, y: 0, z: 10 },
  { x: 28, y: 0, z: 6 },
  { x: 44, y: 0, z: 4 },
  { x: 58, y: 0, z: 8 },
  { x: 66, y: 0, z: 20 },
  { x: 64, y: 0, z: 34 },
  { x: 52, y: 0, z: 44 },
  { x: 36, y: 0.4, z: 48 },
  { x: 18, y: 0.4, z: 50 },
  { x: 2, y: 0.4, z: 48 },
  { x: -14, y: 0, z: 42 },
  { x: -26, y: 0, z: 30 },
  { x: -30, y: 0, z: 14 },
  { x: -24, y: 0, z: 0 },
  { x: -12, y: 0, z: -8 },
  { x: 4, y: 0, z: -10 },
  { x: 18, y: 0, z: -4 },
  { x: 26, y: 0, z: 8 },
  { x: 22, y: 0, z: 22 },
  { x: 10, y: 0, z: 32 },
  { x: 0, y: 0, z: 40 },
  { x: 0, y: 0, z: 50 },
];

// Rainbow Road — professional circuit layout (~370m main loop + return leg)
export const MARIO_CIRCUIT_RAINBOW = buildProfessionalCircuitWaypoints();

export const MARIO_CIRCUIT_DRAGON = [
  { x: 0, y: 4, z: 40 },
  { x: 0, y: 5, z: 28 },
  { x: 8, y: 6, z: 16 },
  { x: 22, y: 7, z: 8 },
  { x: 38, y: 8, z: 4 },
  { x: 52, y: 7, z: 10 },
  { x: 58, y: 5, z: 24 },
  { x: 52, y: 4, z: 38 },
  { x: 38, y: 3, z: 46 },
  { x: 20, y: 3, z: 48 },
  { x: 2, y: 4, z: 44 },
  { x: -16, y: 5, z: 34 },
  { x: -28, y: 6, z: 18 },
  { x: -30, y: 7, z: 0 },
  { x: -22, y: 6, z: -16 },
  { x: -8, y: 5, z: -24 },
  { x: 8, y: 4, z: -22 },
  { x: 20, y: 4, z: -10 },
  { x: 18, y: 4, z: 6 },
  { x: 8, y: 4, z: 18 },
  { x: 0, y: 4, z: 28 },
  { x: 0, y: 4, z: 40 },
];

/** Flat straight launch strip — t=0 at the grid, t=1 at the far end (−Z). */
export const RAINBOW_STRAIGHT = { x: 0, y: 40, zStart: 78, zEnd: -100 };

export function createStraightRainbowCurve({
  x = 0, y = 40, zStart = 78, zEnd = -70,
} = {}) {
  const pts = [];
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    pts.push(new THREE.Vector3(x, y, zStart + (zEnd - zStart) * f));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
}

export function createCircuitCurve(points, closed = true, tension = 0.4, curveType = 'centripetal') {
  let pts = (points || []).map((p) => new THREE.Vector3(p.x, p.y ?? 0, p.z));
  if (closed && pts.length > 3) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    if (a.distanceToSquared(b) < 0.08) pts = pts.slice(0, -1);
  }
  return new THREE.CatmullRomCurve3(pts, closed, curveType, tension);
}

/** Ultra-low tension — dense Rainbow Road waypoints follow the authored path. */
export function createRainbowCircuitCurve(points) {
  return createCircuitCurve(points, true, 0.01, 'catmullrom');
}
