/**
 * AerialRingGateKit — premium holo rings (reference: cyan core + gold rim bloom).
 */
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import { flyingMat } from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';

const GATE_TIERS = {
  tutorial: { major: 4.2, minor: 0.38 },
  standard: { major: 3.35, minor: 0.22 },
  hard: { major: 3.4, minor: 0.3 },
  forgiving: { major: 4.5, minor: 0.36 },
  mixed: { major: 3.8, minor: 0.34 },
};

function makeNumberSprite(n) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), 32, 34);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
}

/** Reference-style holo ring — metal frame, cyan inner glow, orange rim accent, holographic disc. */
export function buildPremiumHoloRing(majorR, accentCyan = 0x00d4ff, accentGold = 0xffa040) {
  const g = new THREE.Group();
  g.name = 'premium-holo-ring';

  const frameMat = flyingMat('painted_steel', { metalness: 0.82, roughness: 0.28, emissive: 0x1e293b, emi: 0.08 });
  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, 0.22, 20, 72),
    frameMat,
  );
  g.add(outer);

  const cyanMat = pbrMat(accentCyan, { emissive: accentCyan, emi: 1.65, metalness: 0.4, roughness: 0.15 });
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(majorR * 0.93, 0.12, 16, 72),
    cyanMat,
  );
  g.add(inner);

  const goldMat = pbrMat(accentGold, { emissive: accentGold, emi: 1.25, metalness: 0.5, roughness: 0.18 });
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(majorR * 1.055, 0.06, 12, 72),
    goldMat,
  );
  g.add(rim);

  // Holographic inner disc — semi-transparent portal effect
  const holoDisc = new THREE.Mesh(
    new THREE.CircleGeometry(majorR * 0.88, 32),
    new THREE.MeshBasicMaterial({
      color: accentCyan,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  g.add(holoDisc);

  // Direction chevrons
  [-1, 1].forEach((s) => {
    for (let i = 0; i < 3; i++) {
      const chev = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.35),
        new THREE.MeshBasicMaterial({
          color: accentCyan, transparent: true, opacity: 0.55,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        }),
      );
      chev.position.set(s * 0.15, 0, -0.5 - i * 0.45);
      chev.rotation.y = s > 0 ? 0 : Math.PI;
      g.add(chev);
    }
  });

  // Particle ring — small glowing orbs orbiting the torus
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 6, 4),
      new THREE.MeshBasicMaterial({
        color: accentCyan, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    const a = (i / particleCount) * Math.PI * 2;
    orb.position.set(Math.cos(a) * majorR, Math.sin(a) * majorR, 0);
    orb.userData.orbitAngle = a;
    orb.userData.orbitR = majorR;
    g.add(orb);
  }

  const plCyan = new THREE.PointLight(accentCyan, 0.45, majorR * 3);
  g.add(plCyan);

  g.userData.cyanMat = cyanMat;
  g.userData.goldMat = goldMat;
  g.userData.holoDisc = holoDisc;

  const strutMat = pbrMat(0x6b7280, { metalness: 0.8, roughness: 0.35, emissive: 0x334155, emi: 0.2 });
  for (let a = 0; a < 3; a++) {
    const ang = (a / 3) * Math.PI * 2 + Math.PI / 2;
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), strutMat);
    strut.position.set(Math.cos(ang) * majorR, Math.sin(ang) * majorR, 0);
    strut.rotation.z = ang - Math.PI / 2;
    g.add(strut);
  }

  return g;
}

function buildKidFriendlyRing(majorR, color) {
  const g = new THREE.Group();
  g.name = 'kid-friendly-ring';
  const ringMat = pbrMat(color, {
    emissive: color, emi: 0.62, metalness: 0.06, roughness: 0.32,
  });
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, Math.max(0.32, majorR * 0.09), 16, 40),
    ringMat,
  );
  g.add(ring);
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(majorR * 0.82, Math.max(0.14, majorR * 0.04), 12, 36),
    pbrMat(0xffffff, { emissive: color, emi: 0.35, transparent: true, opacity: 0.45 }),
  );
  g.add(inner);
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.28, majorR * 0.07), 10, 8),
    pbrMat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.75 }),
  );
  star.position.set(0, majorR + 0.5, 0);
  star.userData.spinStar = true;
  g.add(star);
  g.userData.cyanMat = ringMat;
  return g;
}

function buildSquareArchGate(majorR, color, accent) {
  const g = new THREE.Group();
  g.name = 'heli-arch-gate';
  const frame = pbrMat(color, { emissive: color, emi: 0.45, metalness: 0.35 });
  const w = majorR * 2.2;
  const h = majorR * 2.4;
  [-w / 2, w / 2].forEach((x, i) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), frame);
    jamb.position.set(x, 0, 0);
    jamb.name = `Jamb${i}`;
    g.add(jamb);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.45, 0.45), frame);
  lintel.position.y = h / 2;
  g.add(lintel);
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.6, 0.08, w * 0.6),
    pbrMat(accent, { emissive: accent, emi: 0.35 }),
  );
  pad.position.y = -h / 2 + 0.2;
  g.add(pad);
  g.userData.cyanMat = frame;
  return g;
}

function buildHexGate(majorR, color, accent) {
  const g = new THREE.Group();
  g.name = 'hex-gate';
  const frameMat = flyingMat('dark_steel', { metalness: 0.88, roughness: 0.2, emissive: 0x0f172a, emi: 0.06 });
  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, 0.3, 6, 6),
    frameMat,
  );
  g.add(outer);

  const cyanMat = pbrMat(color, { emissive: color, emi: 2.1, metalness: 0.35, roughness: 0.1 });
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(majorR * 0.86, 0.16, 6, 6),
    cyanMat,
  );
  g.add(inner);

  const holoDisc = new THREE.Mesh(
    new THREE.CircleGeometry(majorR * 0.82, 6),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  g.add(holoDisc);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const node = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      pbrMat(color, { emissive: color, emi: 1.35 }),
    );
    node.position.set(Math.cos(a) * majorR, Math.sin(a) * majorR, 0);
    g.add(node);
  }

  const pl = new THREE.PointLight(color, 0.55, majorR * 4);
  g.add(pl);

  g.userData.cyanMat = cyanMat;
  g.userData.goldMat = inner.material;
  g.userData.holoDisc = holoDisc;
  return g;
}

function buildStealthWireGate(majorR, color) {
  const g = new THREE.Group();
  g.name = 'stealth-wire-gate';
  const wire = new THREE.Mesh(
    new THREE.TorusGeometry(majorR, 0.06, 8, 48),
    pbrMat(color, { emissive: color, emi: 0.35, metalness: 0.6 }),
  );
  g.add(wire);
  g.userData.cyanMat = wire.material;
  return g;
}

function buildTightFpvGate(majorR, color, accent) {
  const g = buildPremiumHoloRing(majorR * 0.82, color, accent);
  g.name = 'fpv-tight-gate';
  return g;
}

function buildSquareFpvGate(majorR, color, accent) {
  const g = new THREE.Group();
  g.name = 'fpv-square-gate';
  const s = majorR * 1.05;
  const h = s * 2.15;
  const frame = flyingMat('dark_steel', { metalness: 0.88, roughness: 0.22, emissive: 0x0f172a, emi: 0.06 });
  const glow = pbrMat(color, { emissive: color, emi: 1.85, metalness: 0.35, roughness: 0.12 });
  const gold = pbrMat(accent, { emissive: accent, emi: 1.1, metalness: 0.45, roughness: 0.2 });
  [[-s, -s], [s, -s], [s, s], [-s, s]].forEach(([x, z], i) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, 0.4), frame);
    post.position.set(x, h / 2, z);
    post.name = `Post${i}`;
    g.add(post);
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(s * 2, 0.35, 0.35), glow);
  topBar.position.set(0, h - 0.2, -s);
  g.add(topBar);
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(s * 2, 0.35, 0.35), glow);
  botBar.position.set(0, 0.2, -s);
  g.add(botBar);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), gold);
  leftBar.position.set(-s, h / 2, 0);
  g.add(leftBar);
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), gold);
  rightBar.position.set(s, h / 2, 0);
  g.add(rightBar);
  const disc = new THREE.Mesh(
    new THREE.PlaneGeometry(s * 1.7, s * 1.7),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  g.add(disc);
  g.userData.cyanMat = glow;
  g.userData.goldMat = gold;
  g.userData.holoDisc = disc;
  g.add(new THREE.PointLight(color, 0.5, majorR * 4));
  return g;
}

function buildGateForChassis(style, radius, cyan, gold, kidClarity = false) {
  if (kidClarity) return buildKidFriendlyRing(radius, cyan);
  switch (style) {
    case 'helicopter':
      return buildSquareArchGate(radius, cyan, gold);
    case 'hoverbot':
      return buildHexGate(radius, cyan, gold);
    case 'drone':
    case 'jetplane':
      return buildPremiumHoloRing(radius, cyan, gold);
    case 'steathjet':
      return buildStealthWireGate(radius, cyan);
    case 'racedrone':
      return buildHexGate(radius, cyan, gold);
    case 'hoverracer':
      return buildSquareFpvGate(radius * 0.92, cyan, gold);
    case 'rescuedrone':
      return buildSquareArchGate(radius * 1.05, 0xf97316, 0x22c55e);
    case 'aerobat':
      return buildPremiumHoloRing(radius * 1.08, cyan, gold);
    default:
      return buildPremiumHoloRing(radius, cyan, gold);
  }
}

export function placeAerialGates(scene, curve, recipe) {
  const gates = recipe.gates || { mode: 'ring', count: 8, tier: 'standard' };
  const tier = GATE_TIERS[gates.tier] || GATE_TIERS.standard;
  const root = new THREE.Group();
  root.name = 'AerialGates';
  scene.add(root);

  const ringMeshes = [];
  const count = gates.count || gates.ringCount || 8;
  const difficulty = Math.max(1, Math.min(10, recipe.difficultyLevel || 1));
  const gateScale = Math.max(0.8, 1.14 - (difficulty - 1) * 0.035);
  const gateRadius = tier.major * gateScale;
  const colors = recipe.gateColors || {};

  if (gates.mode === 'band' || gates.mode === 'mixed' && gates.bandCount) {
    placeBandArches(scene, curve, gates.bandCount || gates.count || 8, gates.bandY ?? 18, gates.bandHeight ?? 4, root);
  }

  if (gates.mode === 'ring' || gates.mode === 'mixed') {
    const ringCount = count;
    for (let i = 0; i < ringCount; i++) {
      const authoredDistribution = Number.isFinite(gates.startT) && Number.isFinite(gates.endT);
      const t = authoredDistribution
        ? gates.startT + (gates.endT - gates.startT) * (ringCount === 1 ? 0.5 : i / (ringCount - 1))
        : (i + 1) / (ringCount + 1);
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      const isFinal = i === ringCount - 1;
      const cyan = isFinal
        ? (colors.final ?? 0xef4444)
        : (i % 2 === 0 ? (colors.primary ?? 0x00d4ff) : (colors.secondary ?? 0x38bdf8));
      const gold = isFinal ? (colors.final ?? 0xff4444) : (colors.secondary ?? 0xffa040);

      const ring = buildGateForChassis(
        recipe.gateStyle || recipe.chassisId || scene.userData.flyingContract?.chassisId,
        gateRadius,
        cyan,
        gold,
        recipe.kidClarity,
      );
      ring.position.copy(p);
      ring.rotation.y = yaw;
      ring.rotateZ(THREE.MathUtils.degToRad((gates.rollDegrees || 0) * (i % 2 ? -1 : 1)));
      ring.name = `aerial_ring_${i}`;
      root.add(ring);

      const num = makeNumberSprite(i + 1);
      num.scale.set(1.1, 1.1, 1);
      num.position.set(p.x, p.y + gateRadius + 1.2, p.z);
      root.add(num);

      const cyanMat = ring.userData.cyanMat;
      const goldMat = ring.userData.goldMat;
      if (gates.emissiveMax) ring.traverse(obj => {
        if (obj.material?.emissiveIntensity) obj.material.emissiveIntensity = Math.min(obj.material.emissiveIntensity, gates.emissiveMax);
      });
      arenaMover(scene, (time) => {
        if (cyanMat) cyanMat.emissiveIntensity = recipe.kidClarity
          ? 0.9 + Math.sin(time * 1.8 + i) * 0.1
          : 1.2 + Math.sin(time * (Math.PI * 2 / 1.6) + i) * 0.22;
        if (goldMat) goldMat.emissiveIntensity = 0.95 + Math.sin(time * (Math.PI * 2 / 1.6) + i + 1) * 0.18;
        if (gates.emissiveMax) {
          if (cyanMat) cyanMat.emissiveIntensity = Math.min(cyanMat.emissiveIntensity, gates.emissiveMax);
          if (goldMat) goldMat.emissiveIntensity = Math.min(goldMat.emissiveIntensity, gates.emissiveMax);
        }
        // Animate orbiting particles
        ring.children.forEach((child) => {
          if (child.userData.orbitAngle !== undefined) {
            const oa = child.userData.orbitAngle + time * 1.2;
            const or = child.userData.orbitR;
            child.position.set(Math.cos(oa) * or, Math.sin(oa) * or, 0);
          }
        });
        // Pulse holo disc
        const disc = ring.userData.holoDisc;
        if (disc) disc.material.opacity = 0.06 + Math.sin(time * 2 + i) * 0.03;
      });
      ringMeshes.push(ring);
    }
  }

  if (gates.stuntRing) {
    placeStuntRing(scene, curve, 0.72, root, recipe);
  }

  scene.userData.aerialGates = ringMeshes;
  scene.userData.obstacles = ringMeshes.map((r) => ({
    mesh: r, radius: gateRadius, type: 'ring_edge', check3d: true,
  }));
  return ringMeshes;
}

function placeBandArches(scene, curve, count, bandY, bandHeight, root) {
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    const archY = bandY ?? p.y;
    [-4, 4].forEach((ox) => {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(4.0, 0.2, 10, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.0 }),
      );
      const lx = p.x + Math.cos(yaw) * ox;
      const lz = p.z - Math.sin(yaw) * ox;
      arch.position.set(lx, archY, lz);
      arch.rotation.y = yaw;
      root.add(arch);
    });
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(8, bandHeight ?? 4),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
    );
    ribbon.position.set(p.x, archY, p.z);
    ribbon.rotation.y = yaw;
    root.add(ribbon);
  }
}

function placeStuntRing(scene, curve, t, root, recipe = {}) {
  const p = curve.getPoint(t);
  const ring = buildPremiumHoloRing(4.0, recipe.gateColors?.primary, recipe.gateColors?.secondary);
  ring.position.copy(p);
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), curve.getTangent(t).normalize());
  ring.rotateZ(THREE.MathUtils.degToRad(recipe.gates?.stuntRollDegrees ?? 45));
  ring.name = 'aerial_stunt_ring';
  root.add(ring);
  if (recipe.gates?.emissiveMax) ring.traverse(obj => {
    if (obj.material?.emissiveIntensity) obj.material.emissiveIntensity = Math.min(obj.material.emissiveIntensity, recipe.gates.emissiveMax);
  });
}

export function placeGroundTargets(scene, curve, count, floorY = -42) {
  const root = scene.getObjectByName('AerialGates') || new THREE.Group();
  if (!root.parent) {
    root.name = 'AerialGates';
    scene.add(root);
  }
  const targets = [];
  for (let i = 0; i < count; i++) {
    const t = 0.38 + (i / Math.max(1, count - 1)) * 0.42;
    const p = curve.getPoint(Math.min(0.92, t));
    const groundY = Math.min(p.y - 2, floorY + 1);
    const flyY = Math.max(groundY + 6, p.y - 4);
    const target = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 1.2 }),
    );
    target.position.set(p.x, groundY, p.z);
    target.name = `aerial_target_${i}`;
    target.userData.flyThroughY = flyY;
    root.add(target);
    targets.push(target);
  }
  scene.userData.aerialGroundTargets = targets;
  return targets;
}
