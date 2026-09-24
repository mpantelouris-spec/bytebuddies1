/**
 * BiomeAAARoadTextures.js — Per-biome AAA asphalt PBR textures (1024px tiled ≈ 4K detail).
 */
import * as THREE from 'three';

const SIZE = 1024;

function noise(ctx, count, alpha = 0.08) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1 + Math.random() * 3, 1);
  }
}

function baseAsphalt(ctx, r, g, b, variation = 0.15) {
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 5000; i++) {
    const s = 1 + (Math.random() - 0.5) * variation * 2;
    ctx.fillStyle = `rgba(${Math.min(255, r * s)},${Math.min(255, g * s)},${Math.min(255, b * s)},${0.05 + Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2 + Math.random() * 4, 1 + Math.random() * 2);
  }
}

function centerStripe(ctx, color, width = 6, dash = [28, 20]) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(SIZE / 2, 0);
  ctx.lineTo(SIZE / 2, SIZE);
  ctx.stroke();
  ctx.setLineDash([]);
}

function edgeLines(ctx, color = 'rgba(255,255,255,0.4)', inset = 24) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(inset, 0);
  ctx.lineTo(inset, SIZE);
  ctx.moveTo(SIZE - inset, 0);
  ctx.lineTo(SIZE - inset, SIZE);
  ctx.stroke();
}

function wetSheen(ctx, strength = 0.12) {
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, `rgba(255,255,255,${strength})`);
  g.addColorStop(0.5, 'rgba(255,255,255,0)');
  g.addColorStop(1, `rgba(200,220,255,${strength * 0.6})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function emissiveCracks(ctx, color, count = 40) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

const ROAD_BUILDERS = {
  sunset_coral(ctx) {
    baseAsphalt(ctx, 255, 168, 88, 0.14);
    wetSheen(ctx, 0.1);
    centerStripe(ctx, '#ffffff', 9, [36, 18]);
    edgeLines(ctx, 'rgba(255,255,255,0.85)');
    noise(ctx, 280, 0.04);
  },
  candy_pink(ctx) {
    baseAsphalt(ctx, 255, 120, 190, 0.12);
    centerStripe(ctx, '#fff36a', 9, [28, 16]);
    edgeLines(ctx, 'rgba(255,255,255,0.9)');
    noise(ctx, 220, 0.05);
  },
  crystal_obsidian(ctx) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = 'rgba(12,28,42,0.35)';
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(0,${140 + Math.random() * 90},255,${0.04 + Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1 + Math.random() * 2, 1);
    }
    wetSheen(ctx, 0.22);
    noise(ctx, 180, 0.04);
  },
  sky_jade(ctx) {
    baseAsphalt(ctx, 58, 184, 120, 0.1);
    centerStripe(ctx, '#ffd700', 6, [30, 24]);
    edgeLines(ctx, 'rgba(255,215,0,0.4)');
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 3, 1);
    }
  },
  volcano_charcoal(ctx) {
    baseAsphalt(ctx, 58, 48, 40, 0.2);
    emissiveCracks(ctx, '#ff6600', 70);
    centerStripe(ctx, '#ffaa44', 5, [24, 18]);
    edgeLines(ctx, 'rgba(255,100,0,0.3)');
  },
  cyber_navy(ctx) {
    baseAsphalt(ctx, 20, 28, 58, 0.08);
    wetSheen(ctx, 0.18);
    centerStripe(ctx, '#ff00ff', 6, [18, 14]);
    edgeLines(ctx, 'rgba(0,255,255,0.5)', 20);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(0,255,255,${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1 + Math.random() * 8, 1);
    }
  },
  frost_ice(ctx) {
    baseAsphalt(ctx, 200, 228, 248, 0.06);
    centerStripe(ctx, '#88bbee', 5, [26, 20]);
    edgeLines(ctx, 'rgba(200,230,255,0.6)');
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
    }
  },
  ruins_moss(ctx) {
    baseAsphalt(ctx, 90, 106, 72, 0.22);
    centerStripe(ctx, '#ffd700', 5, [28, 22]);
    edgeLines(ctx, 'rgba(255,215,0,0.35)');
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(60,100,40,${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 4, 2);
    }
  },
  stardust_violet(ctx) {
    baseAsphalt(ctx, 74, 24, 136, 0.1);
    centerStripe(ctx, '#dda0ff', 6, [22, 16]);
    edgeLines(ctx, 'rgba(200,150,255,0.45)');
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(Math.random() * SIZE, Math.random() * SIZE, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  meadow_gravel(ctx) {
    baseAsphalt(ctx, 196, 149, 106, 0.25);
    centerStripe(ctx, '#ffffff', 4, [20, 18]);
    for (let i = 0; i < 3000; i++) {
      const v = 140 + Math.random() * 80;
      ctx.fillStyle = `rgba(${v},${v * 0.7 | 0},${v * 0.5 | 0},${0.15 + Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2 + Math.random() * 3, 2);
    }
  },
  metro_black(ctx) {
    baseAsphalt(ctx, 58, 58, 58, 0.1);
    wetSheen(ctx, 0.1);
    centerStripe(ctx, '#ffff00', 5, [16, 12]);
    edgeLines(ctx, 'rgba(255,255,100,0.3)');
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(80,80,80,${0.2 + Math.random() * 0.3})`;
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 20 + Math.random() * 40, 2);
    }
  },
};

export function makeBiomeRoadTexture(roadStyle) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const build = ROAD_BUILDERS[roadStyle] || ROAD_BUILDERS.sunset_coral;
  build(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
