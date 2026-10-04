/**
 * Flappy Bird world, built like the other robot arenas: physically lit
 * materials, soft shadows and distance haze. Behind the course (camera on +X)
 * sit, back to front: rolling hills, a band of clouds, a city skyline, and a
 * line of trees and hedges. Each layer scrolls at its own parallax speed along Z.
 * Returns parallax entries in the FlappyBirdArena contract.
 */
import * as THREE from 'three';

const GROUND_Y = -4;
const PERIOD = 75; // each layer repeats every PERIOD along Z, so wrapping is seamless

export function pbr(color, { rough = 0.8, metal = 0, ...rest } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...rest });
}

function canvasTexture(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

/** Facade with rows of glass windows. */
function facadeTexture(wall) {
  return canvasTexture(128, 256, (x, w, h) => {
    x.fillStyle = wall;
    x.fillRect(0, 0, w, h);
    for (let r = 0; r < 12; r++) {
      for (let k = 0; k < 4; k++) {
        const lit = (r * 7 + k * 3) % 5 === 0;
        x.fillStyle = lit ? '#fff3c4' : '#5b7894';
        x.fillRect(10 + k * 30, 10 + r * 20, 18, 12);
      }
    }
  });
}

/**
 * `count` items spread over one PERIOD, then the same pattern repeated once
 * more behind it. The layer covers z 100 … -50, and the arena steps it back by
 * exactly PERIOD when it passes z = 20, so the view never sees a seam or a gap.
 */
function row(name, build, count, xDepth, speed) {
  const group = new THREE.Group();
  group.name = name;
  for (let i = 0; i < count; i++) {
    const item = build(i);
    item.position.x += xDepth;
    item.position.z += 100 - (i / count) * PERIOD;
    group.add(item);
    const twin = item.clone();
    twin.position.z -= PERIOD;
    group.add(twin);
  }
  return { group, entry: { mesh: group, speed, baseZ: 0, period: PERIOD } };
}

export function buildClassicFlappyBackdrop(scene, variant) {
  const rand = (() => { let s = 7; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); })();
  const parallax = [];
  const add = (layer) => { scene.add(layer.group); parallax.push(layer.entry); };
  const grass = new THREE.Color(variant.grass);

  // Rolling hills far back, softened by the haze
  const hillMat = pbr(grass.clone().lerp(new THREE.Color(0x4a8a5a), 0.45), { rough: 0.95 });
  const dome = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  add(row('FlappyHills', () => {
    const m = new THREE.Mesh(dome, hillMat);
    m.scale.set(9 + rand() * 6, 5 + rand() * 5, 14 + rand() * 8);
    m.position.y = GROUND_Y;
    return m;
  }, 6, -62, 0.04));

  // Clouds: clusters of soft white puffs, lit by the sun
  const puff = new THREE.SphereGeometry(1, 20, 14);
  const cloudMat = pbr(0xffffff, { rough: 1, emissive: 0xdfeaf5, emissiveIntensity: 0.35 });
  add(row('FlappyClouds', () => {
    const g = new THREE.Group();
    const n = 4 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(puff, cloudMat);
      const r = 1.2 + rand() * 1.4;
      m.scale.set(r * 0.9, r * 0.75, r * 1.3);
      m.position.set(rand() * 1.5, GROUND_Y + 13 + rand() * 1.2 - (k % 2) * 0.6, (k - n / 2) * 1.6);
      g.add(m);
    }
    return g;
  }, 7, -48, 0.07));

  // City: blocks with glass facades, a few with rooftop details
  const walls = ['#c8d6df', '#b7c7d3', '#d8dfe4', '#a9bccb'];
  const facades = walls.map((w) => facadeTexture(w));
  add(row('FlappyCity', (i) => {
    const w = 3 + rand() * 2.5;
    const d = 3 + rand() * 2;
    const h = 5 + rand() * 8;
    const map = facades[i % facades.length].clone();
    map.needsUpdate = true;
    map.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 5)));
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), pbr(0xffffff, { map, rough: 0.55, metal: 0.15 }));
    m.position.y = GROUND_Y + h / 2;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(d + 0.2, 0.3, w + 0.2), pbr(0x7c8a96, { rough: 0.7, metal: 0.3 }));
    roof.position.y = GROUND_Y + h + 0.15;
    g.add(roof);
    if (i % 3 === 0) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 14), pbr(0x9aa5ae, { rough: 0.5, metal: 0.5 }));
      tank.position.set(0, GROUND_Y + h + 0.85, 0);
      g.add(tank);
    }
    return g;
  }, 14, -36, 0.13));

  // Trees and hedges along the back of the lawn
  const trunkMat = pbr(0x6b4a2f, { rough: 0.9 });
  const leafMats = [0x3f8f3a, 0x4d9e3f, 0x357a33].map((c) => pbr(c, { rough: 0.85 }));
  const hedgeMat = pbr(grass.clone().multiplyScalar(0.72), { rough: 0.9 });
  add(row('FlappyTrees', (i) => {
    const g = new THREE.Group();
    if (i % 3 === 1) {
      const hedge = new THREE.Mesh(puff, hedgeMat);
      hedge.scale.set(1.4, 1.1 + rand() * 0.5, 2.4 + rand() * 1.2);
      hedge.position.y = GROUND_Y + 0.6;
      hedge.castShadow = true;
      g.add(hedge);
      return g;
    }
    const h = 2.2 + rand() * 1.6;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 8), trunkMat);
    trunk.position.y = GROUND_Y + h / 2;
    trunk.castShadow = true;
    g.add(trunk);
    for (let k = 0; k < 3; k++) {
      const leaf = new THREE.Mesh(puff, leafMats[(i + k) % leafMats.length]);
      const r = 1 + rand() * 0.6;
      leaf.scale.setScalar(r);
      leaf.position.set((rand() - 0.5) * 0.8, GROUND_Y + h + 0.3 + k * 0.45, (rand() - 0.5) * 1.1);
      leaf.castShadow = true;
      g.add(leaf);
    }
    return g;
  }, 22, -15, 0.32));

  return parallax;
}

/** Grass: blades and clumps in a few greens, tiled across the lawn. */
export function flappyGrassTexture(grass) {
  const base = new THREE.Color(grass);
  return canvasTexture(256, 256, (x, w, h) => {
    x.fillStyle = `#${base.getHexString()}`;
    x.fillRect(0, 0, w, h);
    const shades = [0.78, 0.88, 1.08, 1.18].map((k) => `#${base.clone().multiplyScalar(k).getHexString()}`);
    for (let i = 0; i < 2600; i++) {
      x.strokeStyle = shades[i % shades.length];
      x.globalAlpha = 0.5;
      x.lineWidth = 1.5;
      const px = Math.random() * w;
      const py = Math.random() * h;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + (Math.random() - 0.5) * 3, py - 3 - Math.random() * 5);
      x.stroke();
    }
    x.globalAlpha = 1;
  }, [10, 6]);
}

/** Soil face under the lawn: layered earth with pebbles. */
export function flappySoilTexture() {
  return canvasTexture(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8a6a45');
    g.addColorStop(1, '#6b4f33');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      x.fillStyle = ['#a3845c', '#5c4329', '#b89c74'][i % 3];
      x.globalAlpha = 0.55;
      x.beginPath();
      x.ellipse(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 2, 0, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
  }, [8, 2]);
}
