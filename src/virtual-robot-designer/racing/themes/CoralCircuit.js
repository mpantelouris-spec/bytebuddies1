/** Track 14 — Coral Circuit: wooden boardwalk on stilts over a turquoise sea, karst islands, flower arches. */
import * as THREE from 'three';
import {
  canvasTexture, signTexture, toon, themeSky, themeLights, themeGround, roadSurface, startStripes,
  coins, palmTree, sideScatter, roadSupports, cloudPuff,
} from './RaceThemeCore.js';

function plankTexture() {
  return canvasTexture((x, w, h) => {
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const shade = 170 + Math.floor(Math.random() * 40);
      x.fillStyle = `rgb(${shade + 30},${shade - 10},${shade - 70})`;
      x.fillRect(0, r * (h / rows), w, h / rows);
      x.fillStyle = 'rgba(90,50,20,0.55)';
      x.fillRect(0, r * (h / rows), w, 3);
      for (let k = 0; k < 6; k++) {
        x.fillStyle = 'rgba(120,70,30,0.25)';
        x.fillRect(Math.random() * w, r * (h / rows) + 6 + Math.random() * 18, 30 + Math.random() * 60, 2);
      }
      x.fillStyle = 'rgba(60,40,20,0.8)';
      [0.12, 0.88].forEach((u) => {
        x.beginPath();
        x.arc(u * w, r * (h / rows) + h / rows / 2, 3, 0, Math.PI * 2);
        x.fill();
      });
    }
  }, 256, 256);
}

function waveTexture() {
  return canvasTexture((x, w, h) => {
    x.fillStyle = '#18c1c9';
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      x.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(10,120,150,0.35)';
      x.lineWidth = 2;
      const px = Math.random() * w;
      const py = Math.random() * h;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + 8, py - 4, px + 16, py);
      x.stroke();
    }
  }, 256, 256, { repeat: [80, 80] });
}

function karst(rand) {
  const g = new THREE.Group();
  const h = 18 + rand() * 26;
  const r = 4 + rand() * 5;
  const rockMat = toon(0xcfc6b8, { flatShading: true, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, h, 8, 3), rockMat);
  body.position.y = h / 2 - 2;
  g.add(body);
  const top = new THREE.Mesh(new THREE.SphereGeometry(r * 0.82, 10, 8), toon(0x3fae4a, { flatShading: true }));
  top.scale.y = 0.55;
  top.position.y = h - 1.5;
  g.add(top);
  for (let i = 0; i < 3; i++) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 8, 6), toon(0x2f9a42, { flatShading: true }));
    const a = rand() * Math.PI * 2;
    bush.position.set(Math.cos(a) * r * 0.75, h * (0.45 + rand() * 0.35), Math.sin(a) * r * 0.75);
    g.add(bush);
  }
  return g;
}

function islet(rand) {
  const g = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.SphereGeometry(5, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xf6dca0, { roughness: 1 }));
  sand.scale.y = 0.25;
  g.add(sand);
  for (let i = 0; i < 2; i++) {
    const p = palmTree(1 + rand() * 0.3);
    p.position.set((i - 0.5) * 3, 0.9, (rand() - 0.5) * 2);
    p.rotation.y = rand() * Math.PI * 2;
    g.add(p);
  }
  const umb = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), toon(0xffffff));
  pole.position.y = 1.9;
  umb.add(pole);
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 8), toon([0xff5a7a, 0xffd23f, 0x3fb7ff][Math.floor(rand() * 3)], { flatShading: true }));
  canopy.position.y = 3.2;
  umb.add(canopy);
  umb.position.set(1.5, 0.5, 2);
  g.add(umb);
  return g;
}

function coral(color) {
  const g = new THREE.Group();
  const mat = toon(color, { flatShading: true, emissive: color, emissiveIntensity: 0.15 });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6 + i * 0.2, 6), mat);
    const a = (i / 5) * Math.PI * 2;
    c.position.set(Math.cos(a) * 0.35, 0.7, Math.sin(a) * 0.35);
    c.rotation.set(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35);
    g.add(c);
  }
  return g;
}

function flowerArch(ctx, d, signMap = null) {
  const g = new THREE.Group();
  const r = ctx.hw + 1.4;
  const arch = new THREE.Mesh(new THREE.TorusGeometry(r, 0.28, 8, 40, Math.PI), toon(0x3f9a3a));
  g.add(arch);
  const colors = [0xff5a9a, 0xffd23f, 0xffffff, 0xff8a3d, 0xc77dff];
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * Math.PI;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.34 + ctx.rand() * 0.18, 10, 8), toon(colors[i % colors.length], { emissive: colors[i % colors.length], emissiveIntensity: 0.12 }));
    f.position.set(Math.cos(a) * r, Math.sin(a) * r, (ctx.rand() - 0.5) * 0.4);
    g.add(f);
  }
  if (signMap) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.3, 1.2), new THREE.MeshStandardMaterial({ map: signMap, transparent: true }));
    sign.position.set(0, r - 0.4, -0.35);
    sign.rotation.y = Math.PI;
    g.add(sign);
  }
  ctx.place(g, d, 0);
}

export function buildCoralCircuit(ctx) {
  const { hw, rand } = ctx;
  themeSky(ctx, { top: 0x1e7fe6, mid: 0x6fd0ff, horizon: 0xd6f6ff, fog: 0xbfeeff, near: 100, far: 420 });
  themeLights(ctx.scene, { sun: 0xfff6e0, hemiSky: 0xbfeaff, hemiGround: 0x2fc6c9, ambient: 0xe8fbff });

  const seaY = ctx.minRoadY - 3.6;
  const waveTex = waveTexture();
  const sea = themeGround(ctx, { color: 0xffffff, map: waveTex, roughness: 0.12, metalness: 0.15, y: seaY });
  sea.material.emissive = new THREE.Color(0x0b7f99);
  sea.material.emissiveIntensity = 0.25;
  ctx.tick((now) => { waveTex.offset.set(now * 0.01, now * 0.006); });

  const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1, 8), toon(0x8a5a2b));
  stilt.geometry.translate(0, 0.5, 0);
  roadSupports(ctx, stilt, { step: 4.5, minHeight: 0.3, inset: 0.4 });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(ctx.hw * 2 + 0.6, 0.35, 0.3), toon(0x7a4f25));
  const beams = [];
  for (let d = 0; d < ctx.len; d += 4.5) beams.push(ctx.matrixAt(d, 0, { y: -0.3 }));
  ctx.scatter(beam, beams);

  roadSurface(ctx, { map: plankTexture(), roughness: 0.85, repeatLen: 2.6, width: ctx.hw * 2 + 0.8 });
  startStripes(ctx, 0xffffff);

  // Rope railing both sides.
  const postGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 6);
  postGeo.translate(0, 0.6, 0);
  const posts = [];
  const ropes = [];
  for (let d = 0; d < ctx.len; d += 2.5) {
    [-1, 1].forEach((s) => {
      posts.push(ctx.matrixAt(d, s * (ctx.hw + 0.3)));
      ropes.push(ctx.matrixAt(d + 1.25, s * (ctx.hw + 0.3), { y: 1.0 }));
      ropes.push(ctx.matrixAt(d + 1.25, s * (ctx.hw + 0.3), { y: 0.55 }));
    });
  }
  ctx.scatter(new THREE.Mesh(postGeo, toon(0x8a5a2b)), posts);
  ctx.scatter(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.55, 5).rotateX(Math.PI / 2), toon(0xe8d2a0)), ropes);

  flowerArch(ctx, 22, signTexture('CORAL CIRCUIT', { w: 768, h: 128, bg: '#ff5a9a', fg: '#ffffff', border: '#ffd23f', font: 'bold 80px system-ui, Arial' }));
  for (let d = 90; d < ctx.len - 30; d += 85) flowerArch(ctx, d);

  for (let v = 0; v < 4; v++) {
    sideScatter(ctx, karst(rand), { step: 44 + v * 7, jitter: 20, offMin: 30, offMax: 110, clearR: 10, scaleMin: 0.8, scaleMax: 1.5, ground: true, from: v * 11 });
  }
  for (let v = 0; v < 2; v++) {
    sideScatter(ctx, islet(rand), { step: 55, jitter: 18, offMin: 11, offMax: 24, clearR: 6, ground: true, from: 20 + v * 25 });
  }
  [0xff6f91, 0xff9f43, 0xa66cff, 0x2fe0c0].forEach((c, i) => {
    sideScatter(ctx, coral(c), { step: 13, jitter: 8, offMin: 2, offMax: 9, clearR: 0.8, ground: true, scaleMin: 0.8, scaleMax: 1.8, from: i * 3 });
  });

  // Puffy clouds.
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4, fog: false, roughness: 1 });
  for (let i = 0; i < 14; i++) {
    const c = cloudPuff(rand, cloudMat, 5, 4, 8);
    ctx.place(c, rand() * ctx.len, (rand() < 0.5 ? -1 : 1) * (40 + rand() * 120), { y: 30 + rand() * 25, face: false });
  }

  // Dolphins leaping.
  const dolphins = [];
  const dMat = toon(0x6f9fc8, { roughness: 0.3 });
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.6, 6, 10), dMat);
    body.rotation.x = Math.PI / 2;
    g.add(body);
    g.rotation.order = 'YXZ';
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 4), dMat);
    fin.position.y = 0.5;
    g.add(fin);
    const f = ctx.frame(30 + (i * ctx.len) / 5, (i % 2 ? 1 : -1) * (hw + 14));
    g.position.set(f.pos.x, seaY, f.pos.z);
    g.rotation.y = f.angle;
    ctx.root.add(g);
    dolphins.push({ g, base: g.position.clone(), dir: f.tan.clone(), phase: rand() * 6 });
  }
  ctx.tick((now) => {
    for (const k of dolphins) {
      const t = ((now * 0.35 + k.phase) % 2) / 2;
      const arc = Math.sin(t * Math.PI);
      k.g.visible = t < 1;
      k.g.position.copy(k.base).addScaledVector(k.dir, (t - 0.5) * 10);
      k.g.position.y = k.base.y - 0.6 + arc * 3.2;
      k.g.rotation.x = -Math.cos(t * Math.PI) * 0.9;
    }
  });

  coins(ctx, { every: 30 });
}
