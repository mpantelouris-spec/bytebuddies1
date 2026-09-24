/**
 * CombatRingSkins — 10 boxing/combat ring environments per visual bible Part 1I.
 */
import * as THREE from 'three';

const RING_HALF = 3;

export const RING_SKIN_NAMES = [
  'Classic Colosseum', 'Neon Cyber Ring', 'Rooftop Night', 'Lava Pit', 'Ice Arena',
  'Warehouse Brawl', 'Space Station Ring', 'Jungle Pit', 'Championship Gold', 'Boss Throne Room',
];

export function getRingSkinIndex(challenge = {}) {
  const idx = Number(challenge.modeIndex || challenge.ringSkin || 1);
  return Math.max(0, Math.min(9, idx - 1));
}

function makeLabelTex(title, sub, w = 512, h = 128) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.roundRect(6, 6, w - 12, h - 12, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, w / 2, 48);
  if (sub) {
    ctx.font = '18px system-ui,sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(sub, w / 2, 82);
  }
  return new THREE.CanvasTexture(c);
}

/** Tint ring apron, ropes, canvas via userData on ring group children */
export function applyRingSkinStyle(ringGroup, skinIndex) {
  const skins = [
    { apron: 0xcc0000, rope: 0xd4a574, canvas: 0xe5e7eb },
    { apron: 0x0f172a, rope: 0xec4899, canvas: 0x111827 },
    { apron: 0x374151, rope: 0x64748b, canvas: 0x1e293b },
    { apron: 0x1c1917, rope: 0xf97316, canvas: 0x292524 },
    { apron: 0x0ea5e9, rope: 0xe0f2fe, canvas: 0xdbeafe },
    { apron: 0xb45309, rope: 0xfbbf24, canvas: 0xd6d3d1 },
    { apron: 0x475569, rope: 0x94a3b8, canvas: 0x64748b },
    { apron: 0x15803d, rope: 0xfbbf24, canvas: 0x9e8060 },
    { apron: 0xfbbf24, rope: 0xffd700, canvas: 0xfef3c7 },
    { apron: 0x1e1b4b, rope: 0x7c3aed, canvas: 0x0f172a },
  ];
  const s = skins[skinIndex] || skins[0];
  ringGroup.traverse((o) => {
    if (o.name === 'RingApron' && o.material) o.material.color.setHex(s.apron);
    if (o.name === 'RingRopes' && o.isGroup) {
      o.traverse((r) => { if (r.material?.color) r.material.color.setHex(s.rope); });
    }
    if (o.name === 'RingCanvas' && o.material) {
      o.material.color.setHex(s.canvas);
      o.material.emissive = new THREE.Color(s.canvas);
      o.material.emissiveIntensity = skinIndex === 1 ? 0.15 : 0.02;
    }
  });
}

export function buildCombatRingBackdrop(scene, skinIndex = 0) {
  const g = new THREE.Group();
  g.name = 'RingSkinBackdrop';
  const idx = Math.max(0, Math.min(9, skinIndex));

  const setSky = (stops, fogCol, fogNear = 35, fogFar = 90) => {
    const c = document.createElement('canvas');
    c.width = 2;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    stops.forEach(([p, hex]) => grad.addColorStop(p, hex));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = tex;
    scene.fog = new THREE.Fog(fogCol, fogNear, fogFar);
  };

  switch (idx) {
    case 0: // Colosseum
      setSky([[0, '#87ceeb'], [0.6, '#fbbf24'], [1, '#92400e']], 0xc87830);
      for (let i = 0; i < 8; i++) {
        const arch = new THREE.Mesh(
          new THREE.BoxGeometry(3, 5, 1.2),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 }),
        );
        const a = (i / 8) * Math.PI * 2;
        arch.position.set(Math.cos(a) * 14, 2.5, Math.sin(a) * 14);
        arch.rotation.y = -a;
        g.add(arch);
      }
      [[-6, 8], [6, 8]].forEach(([x, z]) => {
        const torch = new THREE.PointLight(0xff8800, 1.5, 12);
        torch.position.set(x, 2, z);
        g.add(torch);
        const flame = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.2 }),
        );
        flame.position.set(x, 1.2, z);
        g.add(flame);
      });
      break;

    case 1: // Neon cyber
      setSky([[0, '#0f172a'], [0.5, '#1e1b4b'], [1, '#0f172a']], 0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.025);
      for (let i = 0; i < 6; i++) {
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.8, 0.1),
          new THREE.MeshStandardMaterial({
            color: i % 2 ? 0xec4899 : 0x06b6d4, emissive: i % 2 ? 0xec4899 : 0x06b6d4, emissiveIntensity: 1,
          }),
        );
        sign.position.set((i % 2 ? -1 : 1) * 10, 4 + i * 0.5, -12 + i * 2);
        g.add(sign);
      }
      g.add(new THREE.AmbientLight(0x1e293b, 0.4));
      break;

    case 2: // Rooftop night
      setSky([[0, '#020617'], [0.4, '#1e293b'], [1, '#0f172a']], 0x020617);
      for (let i = 0; i < 12; i++) {
        const bld = new THREE.Mesh(
          new THREE.BoxGeometry(3 + Math.random() * 4, 8 + Math.random() * 12, 3),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }),
        );
        bld.position.set((Math.random() - 0.5) * 40, bld.geometry.parameters.height / 2, 18 + Math.random() * 8);
        g.add(bld);
      }
      const heli = new THREE.SpotLight(0xffffff, 2, 40, 0.3, 0.5);
      heli.position.set(8, 15, -5);
      heli.target.position.set(0, 0, 0);
      g.add(heli, heli.target);
      break;

    case 3: // Lava pit
      setSky([[0, '#1a0500'], [0.5, '#4a1808'], [1, '#1a0500']], 0x3a1008, 25, 70);
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.8 }),
      );
      lava.rotation.x = -Math.PI / 2;
      lava.position.y = -2;
      g.add(lava);
      for (let i = 0; i < 4; i++) {
        const jet = new THREE.PointLight(0xff6600, 1.2, 8);
        const a = (i / 4) * Math.PI * 2 + 0.4;
        jet.position.set(Math.cos(a) * 4.5, 0.5, Math.sin(a) * 4.5);
        g.add(jet);
      }
      break;

    case 4: // Ice arena
      setSky([[0, '#0c4a6e'], [0.4, '#7dd3fc'], [1, '#e0f2fe']], 0xb8d4e8);
      const iceFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.2, metalness: 0.15 }),
      );
      iceFloor.rotation.x = -Math.PI / 2;
      iceFloor.position.y = -0.1;
      g.add(iceFloor);
      g.add(new THREE.AmbientLight(0xc8e8ff, 0.6));
      break;

    case 5: // Warehouse
      setSky([[0, '#1a1a28'], [1, '#2a2a38']], 0x2a2a38);
      for (let i = 0; i < 8; i++) {
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 1.2, 1.2),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 }),
        );
        crate.position.set(-8 + (i % 4) * 2.5, 0.6, 10 + Math.floor(i / 4) * 2);
        g.add(crate);
      }
      const lamp = new THREE.PointLight(0xfff0c0, 1.5, 20);
      lamp.position.set(0, 8, 6);
      g.add(lamp);
      break;

    case 6: // Space station
      setSky([[0, '#000008'], [1, '#000010']], 0x000010, 50, 120);
      scene.fog = null;
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(8, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x1e40af, emissive: 0x0ea5e9, emissiveIntensity: 0.2 }),
      );
      earth.position.set(0, 12, 25);
      g.add(earth);
      const grate = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 }),
      );
      grate.rotation.x = -Math.PI / 2;
      grate.position.y = -0.15;
      g.add(grate);
      break;

    case 7: // Jungle pit
      setSky([[0, '#0a2818'], [0.5, '#1a4020'], [1, '#0a1808']], 0x142810);
      for (let i = 0; i < 6; i++) {
        const vine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 4, 5),
          new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.9 }),
        );
        const a = (i / 6) * Math.PI * 2;
        vine.position.set(Math.cos(a) * 5.5, 2, Math.sin(a) * 5.5);
        g.add(vine);
      }
      for (let i = 0; i < 20; i++) {
        const fly = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 4, 4),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
        );
        fly.position.set((Math.random() - 0.5) * 12, 1 + Math.random() * 4, (Math.random() - 0.5) * 12);
        g.add(fly);
      }
      break;

    case 8: // Championship gold
      setSky([[0, '#1a1040'], [0.5, '#4a2080'], [1, '#1a1040']], 0x2a1848);
      const jumbotron = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 4),
        new THREE.MeshStandardMaterial({ map: makeLabelTex('CHAMPIONSHIP', 'BYTEBUDDIES FIGHT NIGHT') }),
      );
      jumbotron.position.set(0, 8, 14);
      g.add(jumbotron);
      for (let i = 0; i < 4; i++) {
        const goldTrim = new THREE.Mesh(
          new THREE.TorusGeometry(3.8, 0.08, 8, 32),
          new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xfbbf24, emissiveIntensity: 0.8 }),
        );
        goldTrim.rotation.x = Math.PI / 2;
        goldTrim.position.y = 0.02 + i * 0.01;
        g.add(goldTrim);
      }
      break;

    case 9: // Boss throne
      setSky([[0, '#000000'], [1, '#0a0a0a']], 0x050505, 20, 60);
      scene.fog = new THREE.FogExp2(0x050505, 0.04);
      const throne = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8 }),
      );
      throne.position.set(0, 2, 12);
      g.add(throne);
      const bossSil = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 5, 1),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x7c3aed, emissiveIntensity: 0.3 }),
      );
      bossSil.position.set(0, 3.5, 11);
      g.add(bossSil);
      const spot = new THREE.SpotLight(0xffffff, 3, 25, 0.35, 0.6);
      spot.position.set(0, 12, 0);
      spot.target.position.set(0, 1, 0);
      g.add(spot, spot.target);
      break;

    default:
      break;
  }

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 1.2),
    new THREE.MeshBasicMaterial({
      map: makeLabelTex(RING_SKIN_NAMES[idx], 'FIGHT!'),
      transparent: true,
      depthWrite: false,
    }),
  );
  banner.position.set(0, 6.5, -RING_HALF - 1.5);
  g.add(banner);

  scene.userData.ringSkinIndex = idx;
  scene.userData.ringSkinName = RING_SKIN_NAMES[idx];
  return g;
}
