/**
 * Advanced Visual Effects & Performance Optimization Engine
 * Includes pixelate, whirl, fisheye, mosaic, and more
 */

export class VisualEffectsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.effectCache = new Map();
  }

  // ─── PIXELATE EFFECT ───

  pixelate(imageData, pixelSize = 10) {
    if (!imageData) return null;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        // Average color in pixel block
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        r /= count;
        g /= count;
        b /= count;
        a /= count;

        // Apply average color
        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }

    return imageData;
  }

  // ─── FISHEYE DISTORTION ───

  fisheye(imageData, strength = 0.5) {
    if (!imageData) return null;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Apply fisheye distortion
        const distorted = dist + dist * strength * (1 - dist / maxRadius);
        const srcX = Math.floor(centerX + Math.cos(angle) * distorted);
        const srcY = Math.floor(centerY + Math.sin(angle) * distorted);

        // Bounds check and copy
        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * width + x) * 4;

          newData[dstIdx] = data[srcIdx];
          newData[dstIdx + 1] = data[srcIdx + 1];
          newData[dstIdx + 2] = data[srcIdx + 2];
          newData[dstIdx + 3] = data[srcIdx + 3];
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  // ─── WHIRL EFFECT ───

  whirl(imageData, angle = 45) {
    if (!imageData) return null;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const radians = (angle * Math.PI) / 180;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalized = dist / maxRadius;

        let srcAngle = Math.atan2(dy, dx);
        srcAngle += radians * (1 - normalized);

        const srcX = Math.floor(centerX + Math.cos(srcAngle) * dist);
        const srcY = Math.floor(centerY + Math.sin(srcAngle) * dist);

        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * width + x) * 4;

          newData[dstIdx] = data[srcIdx];
          newData[dstIdx + 1] = data[srcIdx + 1];
          newData[dstIdx + 2] = data[srcIdx + 2];
          newData[dstIdx + 3] = data[srcIdx + 3];
        }
      }
    }

    return new ImageData(newData, width, height);
  }

  // ─── MOSAIC EFFECT ───

  mosaic(imageData, tileSize = 8) {
    if (!imageData) return null;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let tileY = 0; tileY < height; tileY += tileSize) {
      for (let tileX = 0; tileX < width; tileX += tileSize) {
        // Pick random color from tile
        const rx = Math.floor(Math.random() * tileSize);
        const ry = Math.floor(Math.random() * tileSize);
        const srcIdx = ((tileY + ry) * width + (tileX + rx)) * 4;

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];
        const a = data[srcIdx + 3];

        // Fill tile
        for (let y = 0; y < tileSize && tileY + y < height; y++) {
          for (let x = 0; x < tileSize && tileX + x < width; x++) {
            const idx = ((tileY + y) * width + (tileX + x)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }

    return imageData;
  }

  // ─── BLUR EFFECT ───

  blur(imageData, radius = 5) {
    if (!imageData) return null;

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const newData = new Uint8ClampedArray(data);

    const kSize = Math.ceil(radius * 2) + 1;
    const kernel = this._createGaussianKernel(radius);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0, g = 0, b = 0, a = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[ky + radius][kx + radius];

            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
            a += data[idx + 3] * weight;
          }
        }

        const dstIdx = (y * width + x) * 4;
        newData[dstIdx] = r;
        newData[dstIdx + 1] = g;
        newData[dstIdx + 2] = b;
        newData[dstIdx + 3] = a;
      }
    }

    return new ImageData(newData, width, height);
  }

  _createGaussianKernel(radius) {
    const size = Math.ceil(radius * 2) + 1;
    const kernel = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));
    const sigma = radius / 3;
    let sum = 0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const value =
          Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) /
          (2 * Math.PI * sigma * sigma);
        kernel[y][x] = value;
        sum += value;
      }
    }

    // Normalize
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }

    return kernel;
  }

  // ─── COLOR EFFECTS ───

  grayscale(imageData) {
    if (!imageData) return null;

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    return imageData;
  }

  sepia(imageData) {
    if (!imageData) return null;

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }

    return imageData;
  }

  invert(imageData) {
    if (!imageData) return null;

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }

    return imageData;
  }

  adjustBrightness(imageData, factor) {
    if (!imageData) return null;

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }

    return imageData;
  }

  adjustSaturation(imageData, factor) {
    if (!imageData) return null;

    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      let s, c;
      if (max === min) {
        s = 0;
        c = 0;
      } else {
        s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        c = Math.max(r, g, b);
      }

      const h = this._getHue(r, g, b);
      const newS = Math.min(1, s * factor);
      const [newR, newG, newB] = this._hslToRgb(h, newS, l);

      data[i] = Math.round(newR * 255);
      data[i + 1] = Math.round(newG * 255);
      data[i + 2] = Math.round(newB * 255);
    }

    return imageData;
  }

  _getHue(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
      const c = max - min;
      switch (max) {
        case r:
          h = ((g - b) / c + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / c + 2) / 6;
          break;
        case b:
          h = ((r - g) / c + 4) / 6;
          break;
      }
    }

    return h;
  }

  _hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  }
}

// ─── PERFORMANCE OPTIMIZATION ───

export class PerformanceOptimizer {
  constructor() {
    this.spriteCache = new Map();
    this.canvasCache = null;
    this.frameSkip = 0;
    this.maxFrames = 60;
  }

  // Sprite rendering cache
  cacheSprite(spriteId, renderFunc) {
    const cached = this.spriteCache.get(spriteId);
    if (cached && cached.valid) {
      return cached.canvas;
    }

    const canvas = document.createElement('canvas');
    renderFunc(canvas);

    this.spriteCache.set(spriteId, {
      canvas,
      valid: true,
      age: 0,
    });

    return canvas;
  }

  invalidateSpriteCache(spriteId) {
    if (this.spriteCache.has(spriteId)) {
      this.spriteCache.get(spriteId).valid = false;
    }
  }

  // Adaptive frame skipping for performance
  shouldRenderFrame() {
    if (this.frameSkip === 0) return true;

    const skip = this.frameSkip > 0 ? this.frameSkip : 0;
    const shouldSkip = (performance.now() % (skip + 1)) !== 0;

    return !shouldSkip;
  }

  setTargetFrameRate(fps) {
    // Calculate frame skip needed
    this.maxFrames = fps;
    const requiredSkip = Math.max(0, 60 / fps - 1);
    this.frameSkip = Math.floor(requiredSkip);
  }

  // Batch operations for efficiency
  batchRenderSprites(sprites, renderFunc) {
    const sorted = sprites.sort((a, b) => (a.z || 0) - (b.z || 0));

    for (const sprite of sorted) {
      if (!sprite.visible) continue;
      renderFunc(sprite);
    }
  }

  // Collision detection optimization (spatial hashing)
  buildSpatialHash(sprites, cellSize = 50) {
    const hash = new Map();

    for (const sprite of sprites) {
      const cellX = Math.floor(sprite.x / cellSize);
      const cellY = Math.floor(sprite.y / cellSize);
      const key = `${cellX},${cellY}`;

      if (!hash.has(key)) {
        hash.set(key, []);
      }

      hash.get(key).push(sprite);
    }

    return hash;
  }

  // Check only nearby sprites for collision
  getNearbySprites(sprite, hash, cellSize = 50) {
    const cellX = Math.floor(sprite.x / cellSize);
    const cellY = Math.floor(sprite.y / cellSize);
    const nearby = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (hash.has(key)) {
          nearby.push(...hash.get(key));
        }
      }
    }

    return nearby;
  }

  // Object pooling for frequent allocations
  createObjectPool(factory, size = 100) {
    const pool = [];

    for (let i = 0; i < size; i++) {
      pool.push(factory());
    }

    return {
      get() {
        return pool.length > 0 ? pool.pop() : factory();
      },
      release(obj) {
        pool.push(obj);
      },
    };
  }

  // Memory profiling
  getMemoryUsage() {
    if (!performance.memory) {
      return { status: 'unavailable' };
    }

    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.totalJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;

    return {
      usedMB: (used / 1048576).toFixed(2),
      totalMB: (total / 1048576).toFixed(2),
      limitMB: (limit / 1048576).toFixed(2),
      percentUsed: ((used / limit) * 100).toFixed(1),
    };
  }
}

export const visualEffects = new VisualEffectsEngine();
export const performanceOptimizer = new PerformanceOptimizer();
