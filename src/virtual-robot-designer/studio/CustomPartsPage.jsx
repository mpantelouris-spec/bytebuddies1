/**
 * CustomPartsPage.jsx
 * Kids can design their own custom robot parts with real-time 3D previews.
 * Views: 'library' → 'select-type' → 'building'
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ─── localStorage key ──────────────────────────────────────────────────────
const LS_KEY = 'bb-studio-custom-parts';

function loadParts() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}
function saveParts(parts) {
  localStorage.setItem(LS_KEY, JSON.stringify(parts));
}
function uid() { return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

// ─── Part type metadata ────────────────────────────────────────────────────
const PART_TYPES = [
  { id: 'chassis',    icon: '📦', label: 'Chassis',    color: '#7c3aed', desc: 'The main body of your robot' },
  { id: 'wheel',      icon: '⚙️', label: 'Wheel',      color: '#0891b2', desc: 'How your robot moves around' },
  { id: 'sensor',     icon: '📡', label: 'Sensor',     color: '#059669', desc: 'Lets your robot see the world' },
  { id: 'arm',        icon: '🦾', label: 'Arm',        color: '#dc2626', desc: 'Pick up and interact with things' },
  { id: 'decoration', icon: '✨', label: 'Decoration',  color: '#d97706', desc: 'Make your robot look awesome' },
];

const TYPE_COLORS = {
  chassis: '#7c3aed', wheel: '#0891b2', sensor: '#059669', arm: '#dc2626', decoration: '#d97706',
};

// ─── Default configs per part type ────────────────────────────────────────
const DEFAULTS = {
  chassis: {
    name: 'My Chassis', shape: 'box', width: 1.4, height: 0.6, depth: 1.8,
    material: 'plastic', color: '#FF8C00', weight: 3,
    wheelSockets: 4, sensorSockets: 2, armSockets: 1, hasHead: true,
  },
  wheel: {
    name: 'My Wheel', style: 'standard', radius: 0.35, thickness: 0.22,
    tireColor: '#222222', rimColor: '#888888', grip: 80, weight: 0.5,
  },
  sensor: {
    name: 'My Sensor', type: 'camera', range: 6, accuracy: 90,
    powerDrain: 2, size: 0.3, color: '#00d9ff',
  },
  arm: {
    name: 'My Arm', type: 'grabber', length: 1.2, strength: 70,
    color: '#888888', side: 'right',
  },
  decoration: {
    name: 'My Decoration', type: 'led-strip', color: '#00ffff',
    glowIntensity: 1.2, position: 'top', size: 0.6,
  },
};

// ─── 3D Preview builders ───────────────────────────────────────────────────
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: 0.25, roughness: 0.55, ...opts });
}
function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function buildChassisPreview(group, cfg) {
  const c = new THREE.Color(cfg.color);
  const bodyMat = mat(c.getHexString(), { metalness: cfg.material === 'metal' ? 0.7 : 0.15, roughness: cfg.material === 'carbon' ? 0.2 : 0.55 });
  let body;
  if (cfg.shape === 'sphere') {
    body = mesh(new THREE.SphereGeometry(cfg.width * 0.5, 20, 16), bodyMat);
    body.scale.set(1, cfg.height / cfg.width, cfg.depth / cfg.width);
  } else if (cfg.shape === 'cylinder') {
    body = mesh(new THREE.CylinderGeometry(cfg.width * 0.45, cfg.width * 0.45, cfg.height, 20), bodyMat);
    body.scale.z = cfg.depth / cfg.width;
  } else if (cfg.shape === 'cone') {
    body = mesh(new THREE.ConeGeometry(cfg.width * 0.45, cfg.height * 1.6, 16), bodyMat);
  } else {
    body = mesh(new THREE.BoxGeometry(cfg.width, cfg.height, cfg.depth), bodyMat);
  }
  body.position.y = cfg.height * 0.5;
  group.add(body);

  // Wheel socket indicators
  const socketMat = mat('#333', { emissive: new THREE.Color('#ff8c00'), emissiveIntensity: 0.5 });
  const sockPositions = cfg.wheelSockets === 6
    ? [[-0.6,0,-0.7],[0.6,0,-0.7],[-0.6,0,0],[0.6,0,0],[-0.6,0,0.7],[0.6,0,0.7]]
    : [[-0.6,0,-0.5],[0.6,0,-0.5],[-0.6,0,0.5],[0.6,0,0.5]];
  sockPositions.forEach(([x,y,z]) => {
    const s = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), socketMat);
    s.position.set(x * (cfg.width / 1.4), y, z * (cfg.depth / 1.8));
    s.rotation.z = Math.PI / 2;
    group.add(s);
  });
}

function buildWheelPreview(group, cfg) {
  const tireMat = mat(cfg.tireColor, { roughness: cfg.style === 'off-road' ? 0.95 : 0.7 });
  const rimMat  = mat(cfg.rimColor,  { metalness: 0.75, roughness: 0.25 });
  // Tire
  const tire = mesh(new THREE.TorusGeometry(cfg.radius, cfg.thickness * 0.48, 16, 40), tireMat);
  tire.rotation.y = Math.PI / 2;
  group.add(tire);
  // Rim
  const rim = mesh(new THREE.CylinderGeometry(cfg.radius * 0.6, cfg.radius * 0.6, cfg.thickness * 0.35, 20), rimMat);
  rim.rotation.z = Math.PI / 2;
  group.add(rim);
  // Spokes
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spoke = mesh(new THREE.BoxGeometry(cfg.radius * 0.8, cfg.thickness * 0.08, cfg.thickness * 0.08), rimMat);
    spoke.position.set(Math.cos(angle) * cfg.radius * 0.3, Math.sin(angle) * cfg.radius * 0.3, 0);
    spoke.rotation.z = angle;
    group.add(spoke);
  }
  if (cfg.style === 'spike') {
    const spikeMat = mat('#cc2200', { metalness: 0.6 });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const spike = mesh(new THREE.ConeGeometry(0.04, 0.18, 6), spikeMat);
      spike.position.set(
        Math.cos(ang) * (cfg.radius + 0.09),
        Math.sin(ang) * (cfg.radius + 0.09),
        0,
      );
      spike.rotation.z = ang + Math.PI / 2;
      group.add(spike);
    }
  }
  if (cfg.style === 'omni') {
    const bMat = mat('#555');
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const b = mesh(new THREE.CylinderGeometry(0.055, 0.055, cfg.thickness * 0.95, 8), bMat);
      b.position.set(Math.cos(ang) * cfg.radius, Math.sin(ang) * cfg.radius, 0);
      b.rotation.z = ang + Math.PI / 2;
      group.add(b);
    }
  }
}

function buildSensorPreview(group, cfg) {
  const sensorMat = mat(cfg.color, { metalness: 0.3, roughness: 0.4 });
  const darkMat   = mat('#1a1a2e');
  const glassMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.color), transparent: true, opacity: 0.45, metalness: 0.1 });

  if (cfg.type === 'camera') {
    const body = mesh(new THREE.BoxGeometry(cfg.size * 1.2, cfg.size * 0.9, cfg.size * 0.7), sensorMat);
    group.add(body);
    const lens = mesh(new THREE.CylinderGeometry(cfg.size * 0.28, cfg.size * 0.32, cfg.size * 0.35, 20), darkMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = cfg.size * 0.5;
    group.add(lens);
    const glass = mesh(new THREE.CylinderGeometry(cfg.size * 0.2, cfg.size * 0.2, 0.02, 20), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = cfg.size * 0.67;
    group.add(glass);
  } else if (cfg.type === 'sonar' || cfg.type === 'lidar') {
    const body = mesh(new THREE.CylinderGeometry(cfg.size * 0.5, cfg.size * 0.5, cfg.size * 0.7, 20), sensorMat);
    group.add(body);
    const dish = mesh(new THREE.SphereGeometry(cfg.size * 0.52, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
    dish.position.y = cfg.size * 0.35;
    group.add(dish);
  } else if (cfg.type === 'ir') {
    const body = mesh(new THREE.BoxGeometry(cfg.size * 0.6, cfg.size * 0.6, cfg.size * 0.4), sensorMat);
    group.add(body);
    for (let i = -1; i <= 1; i++) {
      const eye = mesh(new THREE.SphereGeometry(cfg.size * 0.12, 10, 8), darkMat);
      eye.position.set(i * cfg.size * 0.18, 0, cfg.size * 0.22);
      group.add(eye);
    }
  } else {
    // gyro / gps
    const body = mesh(new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size * 0.5), sensorMat);
    group.add(body);
    const board = mesh(new THREE.BoxGeometry(cfg.size * 0.8, cfg.size * 0.8, 0.04), mat('#1a6632'));
    board.position.y = cfg.size * 0.28;
    group.add(board);
  }

  // Range cone (translucent)
  const coneH = Math.min(cfg.range * 0.35, 2.5);
  const coneGeo = new THREE.ConeGeometry(coneH * 0.45, coneH, 16, 1, true);
  const coneMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.color), transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = -Math.PI / 2;
  cone.position.z = coneH * 0.5 + cfg.size * 0.4;
  group.add(cone);
}

function buildArmPreview(group, cfg) {
  const armMat  = mat(cfg.color, { metalness: 0.55, roughness: 0.35 });
  const darkMat = mat('#222');
  const redMat  = mat('#cc2200', { metalness: 0.6 });

  // Base joint
  const base = mesh(new THREE.SphereGeometry(0.14, 12, 10), armMat);
  group.add(base);

  // Arm segments
  const seg1 = mesh(new THREE.CylinderGeometry(0.06, 0.08, cfg.length * 0.55, 10), armMat);
  seg1.position.y = cfg.length * 0.28;
  seg1.rotation.z = 0.28;
  group.add(seg1);

  const joint = mesh(new THREE.SphereGeometry(0.1, 10, 8), darkMat);
  joint.position.set(cfg.length * 0.16, cfg.length * 0.56, 0);
  group.add(joint);

  const seg2 = mesh(new THREE.CylinderGeometry(0.05, 0.06, cfg.length * 0.45, 10), armMat);
  seg2.position.set(cfg.length * 0.32, cfg.length * 0.78, 0);
  seg2.rotation.z = -0.35;
  group.add(seg2);

  // End effector
  if (cfg.type === 'grabber') {
    for (let s of [-1, 1]) {
      const claw = mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), darkMat);
      claw.position.set(cfg.length * 0.47 + s * 0.07, cfg.length * 1.0, 0);
      group.add(claw);
    }
  } else if (cfg.type === 'drill') {
    const drill = mesh(new THREE.ConeGeometry(0.07, 0.28, 12), mat('#888', { metalness: 0.85 }));
    drill.position.set(cfg.length * 0.5, cfg.length * 1.05, 0);
    group.add(drill);
  } else if (cfg.type === 'laser') {
    const emitter = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 12), redMat);
    emitter.position.set(cfg.length * 0.49, cfg.length * 1.02, 0);
    emitter.rotation.z = Math.PI / 2;
    group.add(emitter);
  } else if (cfg.type === 'torch' || cfg.type === 'saw') {
    const tool = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.08), mat('#555', { metalness: 0.7 }));
    tool.position.set(cfg.length * 0.49, cfg.length * 1.02, 0);
    group.add(tool);
  }
}

function buildDecorationPreview(group, cfg) {
  const col = cfg.color;
  const glowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(col),
    emissive: new THREE.Color(col),
    emissiveIntensity: cfg.glowIntensity,
    transparent: true,
    opacity: 0.9,
  });

  if (cfg.type === 'led-strip') {
    for (let i = 0; i < 8; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, cfg.size * 0.18), glowMat);
      led.position.set((i - 3.5) * cfg.size * 0.14, 0, 0);
      group.add(led);
    }
  } else if (cfg.type === 'spotlight') {
    const spot = new THREE.Mesh(new THREE.ConeGeometry(cfg.size * 0.38, cfg.size * 0.7, 12, 1, true), glowMat);
    spot.rotation.x = Math.PI;
    group.add(spot);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(cfg.size * 0.2, cfg.size * 0.2, cfg.size * 0.15, 12), mat('#333'));
    base.position.y = cfg.size * 0.07;
    group.add(base);
  } else if (cfg.type === 'antenna') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, cfg.size * 1.1, 8), mat('#555', { metalness: 0.7 }));
    pole.position.y = cfg.size * 0.55;
    group.add(pole);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(cfg.size * 0.2, 12, 10), glowMat);
    orb.position.y = cfg.size * 1.1;
    group.add(orb);
  } else if (cfg.type === 'neon-ring') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.size * 0.7, 0.06, 8, 48), glowMat);
    group.add(ring);
  } else if (cfg.type === 'badge') {
    const badge = new THREE.Mesh(new THREE.BoxGeometry(cfg.size * 0.9, cfg.size * 0.65, 0.06), mat('#fff', { metalness: 0.5 }));
    group.add(badge);
    const star = new THREE.Mesh(new THREE.SphereGeometry(cfg.size * 0.18, 8, 6), glowMat);
    group.add(star);
  }
}

// ─── 3D Preview Canvas ─────────────────────────────────────────────────────
function PartPreviewCanvas({ partType, config }) {
  const wrapRef  = useRef(null);
  const sceneRef = useRef(null);
  const camRef   = useRef(null);
  const rendRef  = useRef(null);
  const groupRef = useRef(null);
  const rafRef   = useRef(null);
  const roRef    = useRef(null);

  // Init once
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.065);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 80);
    camera.position.set(0, 1.4, 3.6);
    camera.lookAt(0, 0.2, 0);
    camRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0x334488, 0.4));
    scene.add(new THREE.HemisphereLight(0x1a2850, 0x08090e, 0.35));

    const sun = new THREE.DirectionalLight(0xfff8f0, 1.3);
    sun.position.set(5, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x1e40a0, 0.3);
    fill.position.set(-5, 4, -3);
    scene.add(fill);

    const pl1 = new THREE.PointLight(0x8b5cf6, 0.4, 10);
    pl1.position.set(-2, 3, -1);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(0x00d9ff, 0.25, 7);
    pl2.position.set(2, 0.5, 3);
    scene.add(pl2);

    // Platform
    const platMat = new THREE.MeshStandardMaterial({ color: 0x1e2238, metalness: 0.8, roughness: 0.2 });
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 48), platMat);
    plat.position.y = -0.04;
    plat.receiveShadow = true;
    scene.add(plat);

    const ringMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 1.0 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.045, 8, 64), ringMat);
    ring.position.y = 0.02;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // ResizeObserver
    const onResize = () => {
      if (!el) return;
      const w = Math.max(el.clientWidth, 1);
      const h = Math.max(el.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    roRef.current = ro;

    // Animate
    let t = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      t += 0.005;
      if (groupRef.current) {
        groupRef.current.rotation.y = t;
        groupRef.current.position.y = Math.sin(t * 1.2) * 0.05 + 0.1;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      roRef.current?.disconnect();
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Rebuild model on config change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old model
    if (groupRef.current) {
      scene.remove(groupRef.current);
      groupRef.current.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      groupRef.current = null;
    }

    const group = new THREE.Group();
    try {
      if (partType === 'chassis')    buildChassisPreview(group, config);
      if (partType === 'wheel')      buildWheelPreview(group, config);
      if (partType === 'sensor')     buildSensorPreview(group, config);
      if (partType === 'arm')        buildArmPreview(group, config);
      if (partType === 'decoration') buildDecorationPreview(group, config);
    } catch (e) {
      console.error('Part preview error:', e);
    }
    scene.add(group);
    groupRef.current = group;
  }, [partType, config]);

  return <div ref={wrapRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── Slider row ────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 0.01, onChange, unit = '' }) {
  return (
    <div className="bb-cp-param-row">
      <div className="bb-cp-param-label">
        <span>{label}</span>
        <span className="bb-cp-param-val">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{unit}</span>
      </div>
      <input
        type="range" className="bb-cp-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ─── Choice buttons ─────────────────────────────────────────────────────────
function Choices({ options, value, onChange }) {
  return (
    <div className="bb-cp-choices">
      {options.map(opt => (
        <button
          key={opt.id ?? opt}
          className={`bb-cp-btn-choice${(opt.id ?? opt) === value ? ' active' : ''}`}
          onClick={() => onChange(opt.id ?? opt)}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label ?? opt}
        </button>
      ))}
    </div>
  );
}

// ─── Color row ─────────────────────────────────────────────────────────────
const PALETTE = [
  '#FF3333','#FF8C00','#FFD700','#00C851','#1E90FF','#9B59B6',
  '#FFFFFF','#CCCCCC','#555555','#111111','#00D9FF','#FF69B4',
];
function ColorRow({ label, value, onChange }) {
  return (
    <div className="bb-cp-param-row" style={{ marginBottom: 10 }}>
      <div className="bb-cp-param-label"><span>{label}</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
        {PALETTE.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 24, height: 24, borderRadius: 6, border: c === value ? '2.5px solid #fff' : '2px solid transparent',
              background: c, cursor: 'pointer',
              boxShadow: c === value ? '0 0 0 2px #7c3aed' : '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.12s',
            }}
          />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 1, background: '#222' }} />
      </div>
    </div>
  );
}

// ─── Name field ─────────────────────────────────────────────────────────────
function NameField({ value, onChange }) {
  return (
    <div className="bb-cp-param-row" style={{ marginBottom: 12 }}>
      <div className="bb-cp-param-label"><span>Part Name</span></div>
      <input
        type="text"
        className="bb-cp-name-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={30}
        placeholder="Give your part a name..."
      />
    </div>
  );
}

// ─── Stats impact ───────────────────────────────────────────────────────────
function StatsPanel({ partType, config }) {
  const stats = computeStats(partType, config);
  return (
    <div className="bb-cp-stats-panel">
      <div className="bb-cp-stats-title">📊 Stats Impact</div>
      {stats.map(s => (
        <div key={s.label} className="bb-cp-stat-row">
          <span className="bb-cp-stat-label">{s.icon} {s.label}</span>
          <div className="bb-cp-stat-bar-wrap">
            <div className="bb-cp-stat-bar" style={{ width: `${s.value}%`, background: s.color }} />
          </div>
          <span className="bb-cp-stat-val">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function computeStats(partType, cfg) {
  if (partType === 'chassis') return [
    { label: 'Durability',  icon: '🛡️', value: Math.round(50 + cfg.width * 14 + cfg.height * 8),     color: '#22c55e' },
    { label: 'Agility',     icon: '⚡', value: Math.max(10, Math.round(100 - cfg.weight * 8)),        color: '#3b82f6' },
    { label: 'Capacity',    icon: '📦', value: Math.round(40 + cfg.wheelSockets * 5 + cfg.sensorSockets * 7), color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.weight * 10),                           color: '#ef4444' },
  ];
  if (partType === 'wheel') return [
    { label: 'Speed',       icon: '🚀', value: Math.round(60 + (0.6 - cfg.radius) * 40),              color: '#3b82f6' },
    { label: 'Grip',        icon: '🏁', value: cfg.grip,                                              color: '#22c55e' },
    { label: 'Stability',   icon: '⚖️', value: Math.round(50 + cfg.thickness * 80),                   color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.weight * 30),                           color: '#ef4444' },
  ];
  if (partType === 'sensor') return [
    { label: 'Range',       icon: '📡', value: Math.round(cfg.range * 8),                             color: '#3b82f6' },
    { label: 'Accuracy',    icon: '🎯', value: cfg.accuracy,                                          color: '#22c55e' },
    { label: 'Power Use',   icon: '🔋', value: Math.round(cfg.powerDrain * 14),                       color: '#f59e0b' },
    { label: 'Size',        icon: '📦', value: Math.round(cfg.size * 90),                             color: '#ef4444' },
  ];
  if (partType === 'arm') return [
    { label: 'Reach',       icon: '🦾', value: Math.round(cfg.length * 55),                           color: '#3b82f6' },
    { label: 'Strength',    icon: '💪', value: cfg.strength,                                          color: '#22c55e' },
    { label: 'Precision',   icon: '🎯', value: Math.round(85 - cfg.length * 8),                       color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.length * 18),                           color: '#ef4444' },
  ];
  // decoration
  return [
    { label: 'Style',       icon: '✨', value: Math.round(60 + cfg.glowIntensity * 20),               color: '#f59e0b' },
    { label: 'Glow',        icon: '💡', value: Math.round(cfg.glowIntensity * 55),                    color: '#3b82f6' },
    { label: 'Cool Factor', icon: '😎', value: Math.round(70 + cfg.size * 20),                        color: '#22c55e' },
    { label: 'Weight',      icon: '⚖️', value: 5,                                                     color: '#ef4444' },
  ];
}

// ─── Chassis Builder ───────────────────────────────────────────────────────
function ChassisBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Shape</div>
        <Choices
          options={[{id:'box',label:'Box'},{id:'sphere',label:'Sphere'},{id:'cylinder',label:'Cylinder'},{id:'cone',label:'Cone'}]}
          value={config.shape} onChange={v => p('shape', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Dimensions</div>
        <SliderRow label="Width"  value={config.width}  min={0.6} max={2.4} onChange={v => p('width', v)} />
        <SliderRow label="Height" value={config.height} min={0.3} max={1.4} onChange={v => p('height', v)} />
        <SliderRow label="Depth"  value={config.depth}  min={0.6} max={2.8} onChange={v => p('depth', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Material</div>
        <Choices
          options={[{id:'plastic',label:'Plastic'},{id:'metal',label:'Metal'},{id:'carbon',label:'Carbon'},{id:'rubber',label:'Rubber'}]}
          value={config.material} onChange={v => p('material', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Sockets & Slots</div>
        <SliderRow label="Wheel Sockets" value={config.wheelSockets}  min={2} max={8} step={2} onChange={v => p('wheelSockets', v)} unit=" sockets" />
        <SliderRow label="Sensor Slots"  value={config.sensorSockets} min={0} max={6} step={1} onChange={v => p('sensorSockets', v)} unit=" slots" />
        <SliderRow label="Arm Mounts"    value={config.armSockets}    min={0} max={4} step={1} onChange={v => p('armSockets', v)} unit=" mounts" />
        <SliderRow label="Weight (kg)"   value={config.weight}        min={0.5} max={8} step={0.5} onChange={v => p('weight', v)} unit=" kg" />
      </div>
    </>
  );
}

// ─── Wheel Builder ─────────────────────────────────────────────────────────
function WheelBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Wheel Style</div>
        <Choices
          options={[{id:'standard',label:'Standard'},{id:'off-road',label:'Off-Road'},{id:'racing',label:'Racing'},{id:'spike',label:'Spike'},{id:'omni',label:'Omni'}]}
          value={config.style} onChange={v => p('style', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Dimensions</div>
        <SliderRow label="Radius"    value={config.radius}    min={0.18} max={0.65} onChange={v => p('radius', v)} />
        <SliderRow label="Thickness" value={config.thickness} min={0.1}  max={0.45} onChange={v => p('thickness', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Colors</div>
        <ColorRow label="Tire Color" value={config.tireColor} onChange={v => p('tireColor', v)} />
        <ColorRow label="Rim Color"  value={config.rimColor}  onChange={v => p('rimColor', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Performance</div>
        <SliderRow label="Grip (%)"   value={config.grip}   min={10} max={100} step={5} onChange={v => p('grip', v)} unit="%" />
        <SliderRow label="Weight (kg)" value={config.weight} min={0.1} max={2} step={0.1} onChange={v => p('weight', v)} unit=" kg" />
      </div>
    </>
  );
}

// ─── Sensor Builder ────────────────────────────────────────────────────────
function SensorBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Sensor Type</div>
        <Choices
          options={[{id:'camera',label:'Camera'},{id:'sonar',label:'Sonar'},{id:'lidar',label:'Lidar'},{id:'ir',label:'IR'},{id:'gyro',label:'Gyro'},{id:'gps',label:'GPS'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Specs</div>
        <SliderRow label="Range (m)"   value={config.range}      min={1} max={15} step={0.5} onChange={v => p('range', v)} unit=" m" />
        <SliderRow label="Accuracy (%)" value={config.accuracy}  min={40} max={100} step={5} onChange={v => p('accuracy', v)} unit="%" />
        <SliderRow label="Power Drain" value={config.powerDrain} min={0.5} max={8} step={0.5} onChange={v => p('powerDrain', v)} />
        <SliderRow label="Size"        value={config.size}       min={0.1} max={0.8} onChange={v => p('size', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
    </>
  );
}

// ─── Arm Builder ───────────────────────────────────────────────────────────
function ArmBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Arm Type</div>
        <Choices
          options={[{id:'grabber',label:'Grabber'},{id:'drill',label:'Drill'},{id:'torch',label:'Torch'},{id:'saw',label:'Saw'},{id:'laser',label:'Laser'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Specs</div>
        <SliderRow label="Length"      value={config.length}   min={0.4} max={2.2} onChange={v => p('length', v)} />
        <SliderRow label="Strength (%)" value={config.strength} min={10} max={100} step={5} onChange={v => p('strength', v)} unit="%" />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Side</div>
        <Choices
          options={[{id:'right',label:'Right'},{id:'left',label:'Left'},{id:'both',label:'Both'}]}
          value={config.side} onChange={v => p('side', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
    </>
  );
}

// ─── Decoration Builder ────────────────────────────────────────────────────
function DecorationBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Decoration Type</div>
        <Choices
          options={[{id:'led-strip',label:'LED Strip'},{id:'spotlight',label:'Spotlight'},{id:'antenna',label:'Antenna'},{id:'neon-ring',label:'Neon Ring'},{id:'badge',label:'Badge'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Appearance</div>
        <ColorRow label="Color" value={config.color} onChange={v => p('color', v)} />
        <SliderRow label="Glow Intensity" value={config.glowIntensity} min={0} max={3} step={0.1} onChange={v => p('glowIntensity', v)} />
        <SliderRow label="Size" value={config.size} min={0.2} max={1.4} onChange={v => p('size', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Position</div>
        <Choices
          options={[{id:'top',label:'Top'},{id:'front',label:'Front'},{id:'side',label:'Side'},{id:'back',label:'Back'}]}
          value={config.position} onChange={v => p('position', v)}
        />
      </div>
    </>
  );
}

// ─── Part Type Selector ────────────────────────────────────────────────────
function PartTypeSelector({ onSelect, onBack }) {
  return (
    <div className="bb-cp-page">
      <div className="bb-cp-page-head">
        <button className="bb-cp-back-btn" onClick={onBack}>← Back</button>
        <div>
          <div className="bb-cp-page-title">✨ What would you like to create?</div>
          <div className="bb-cp-page-sub">Choose a part type to start designing</div>
        </div>
      </div>
      <div className="bb-cp-type-grid">
        {PART_TYPES.map(pt => (
          <button
            key={pt.id}
            className="bb-cp-type-card"
            style={{ '--type-color': pt.color }}
            onClick={() => onSelect(pt.id)}
          >
            <div className="bb-cp-type-icon">{pt.icon}</div>
            <div className="bb-cp-type-label">{pt.label}</div>
            <div className="bb-cp-type-desc">{pt.desc}</div>
            <div className="bb-cp-type-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Builder View ──────────────────────────────────────────────────────────
function BuilderView({ partType, editingId, savedConfig, onSave, onBack }) {
  const [config, setConfig] = useState(savedConfig || DEFAULTS[partType]);
  const typeInfo = PART_TYPES.find(pt => pt.id === partType);

  const handleSave = () => onSave({ id: editingId || uid(), type: partType, ...config });

  const renderBuilder = () => {
    switch (partType) {
      case 'chassis':    return <ChassisBuilder    config={config} setConfig={setConfig} />;
      case 'wheel':      return <WheelBuilder      config={config} setConfig={setConfig} />;
      case 'sensor':     return <SensorBuilder     config={config} setConfig={setConfig} />;
      case 'arm':        return <ArmBuilder        config={config} setConfig={setConfig} />;
      case 'decoration': return <DecorationBuilder config={config} setConfig={setConfig} />;
      default: return null;
    }
  };

  return (
    <div className="bb-cp-builder-wrap">
      {/* Top bar */}
      <div className="bb-cp-builder-bar">
        <button className="bb-cp-back-btn" onClick={onBack}>← Back</button>
        <div className="bb-cp-builder-title">
          <span>{typeInfo?.icon}</span>
          {editingId ? `Edit ${typeInfo?.label}` : `New ${typeInfo?.label}`}
        </div>
        <button className="bb-cp-save-btn" onClick={handleSave}>
          💾 Save Part
        </button>
      </div>

      {/* 3-column layout */}
      <div className="bb-cp-builder">
        {/* Left: controls */}
        <div className="bb-cp-left">
          <div className="bb-cp-scroll">
            {renderBuilder()}
          </div>
        </div>

        {/* Center: 3D preview */}
        <div className="bb-cp-center">
          <div className="bb-cp-preview-label">🔭 Live 3D Preview</div>
          <div className="bb-cp-canvas-wrap">
            <PartPreviewCanvas partType={partType} config={config} key={partType} />
          </div>
          <div className="bb-cp-preview-hint">
            Model updates as you change parameters
          </div>
        </div>

        {/* Right: stats */}
        <div className="bb-cp-right">
          <StatsPanel partType={partType} config={config} />
          <div className="bb-cp-part-badge" style={{ background: typeInfo?.color }}>
            {typeInfo?.icon} {typeInfo?.label}
          </div>
          <div className="bb-cp-save-hint">
            Your part will be saved to My Parts library and will appear in the Build page.
          </div>
          <button className="bb-cp-save-btn-big" onClick={handleSave}>
            💾 Save to My Parts
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── My Custom Parts Library ───────────────────────────────────────────────
function MyCustomPartsLibrary({ parts, onNew, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? parts : parts.filter(p => p.type === filter);

  return (
    <div className="bb-cp-page">
      {/* Header */}
      <div className="bb-cp-lib-head">
        <div>
          <div className="bb-cp-page-title">✨ My Custom Parts</div>
          <div className="bb-cp-page-sub">{parts.length} part{parts.length !== 1 ? 's' : ''} created</div>
        </div>
        <button className="bb-cp-new-btn" onClick={onNew}>
          + Create New Part
        </button>
      </div>

      {/* Filter pills */}
      <div className="bb-cp-filter-row">
        {['all', ...PART_TYPES.map(pt => pt.id)].map(f => (
          <button
            key={f}
            className={`bb-cp-filter-pill${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Parts' : `${PART_TYPES.find(pt => pt.id === f)?.icon} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bb-cp-empty">
          <div className="bb-cp-empty-icon">🔧</div>
          <div className="bb-cp-empty-title">
            {parts.length === 0 ? 'No parts yet!' : 'No parts match this filter'}
          </div>
          <div className="bb-cp-empty-sub">
            {parts.length === 0
              ? 'Create your first custom part to get started. Your designs will show up here.'
              : 'Try selecting a different filter above.'}
          </div>
          {parts.length === 0 && (
            <button className="bb-cp-new-btn" onClick={onNew} style={{ marginTop: 16 }}>
              ✨ Create Your First Part
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="bb-cp-grid">
          {filtered.map(part => {
            const typeInfo = PART_TYPES.find(pt => pt.id === part.type);
            return (
              <div key={part.id} className="bb-cp-card">
                <div className="bb-cp-card-thumb" style={{ background: `linear-gradient(135deg, ${typeInfo?.color}33, ${typeInfo?.color}11)` }}>
                  <span style={{ fontSize: 40 }}>{typeInfo?.icon}</span>
                </div>
                <div className="bb-cp-card-body">
                  <div className="bb-cp-card-name">{part.name}</div>
                  <div className="bb-cp-card-type" style={{ color: typeInfo?.color }}>
                    {typeInfo?.label}
                    {part.type === 'chassis' && ` · ${part.shape}`}
                    {part.type === 'wheel' && ` · ${part.style}`}
                    {part.type === 'sensor' && ` · ${part.type}`}
                    {part.type === 'arm' && ` · ${part.type}`}
                  </div>
                  {part.color && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: part.color, border: '1px solid rgba(0,0,0,0.2)' }} />
                      <span style={{ fontSize: 11, color: '#888' }}>{part.color}</span>
                    </div>
                  )}
                  <div className="bb-cp-card-actions">
                    <button className="bb-cp-card-btn edit" onClick={() => onEdit(part)}>✏️ Edit</button>
                    <button className="bb-cp-card-btn delete" onClick={() => onDelete(part.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main CustomPartsPage ──────────────────────────────────────────────────
export default function CustomPartsPage({ customParts, setCustomParts }) {
  // view: 'library' | 'select-type' | 'building'
  const [view, setView]         = useState('library');
  const [partType, setPartType] = useState(null);
  const [editingPart, setEditingPart] = useState(null); // part being edited (or null for new)

  const handleNew = () => setView('select-type');

  const handleSelectType = (type) => {
    setPartType(type);
    setEditingPart(null);
    setView('building');
  };

  const handleEdit = (part) => {
    setPartType(part.type);
    setEditingPart(part);
    setView('building');
  };

  const handleSave = (partData) => {
    setCustomParts(prev => {
      const exists = prev.find(p => p.id === partData.id);
      const next = exists
        ? prev.map(p => p.id === partData.id ? partData : p)
        : [...prev, partData];
      saveParts(next);
      return next;
    });
    setView('library');
    setEditingPart(null);
  };

  const handleDelete = (id) => {
    setCustomParts(prev => {
      const next = prev.filter(p => p.id !== id);
      saveParts(next);
      return next;
    });
  };

  if (view === 'select-type') {
    return (
      <div className="bb-cp-root">
        <PartTypeSelector onSelect={handleSelectType} onBack={() => setView('library')} />
      </div>
    );
  }

  if (view === 'building' && partType) {
    return (
      <div className="bb-cp-root bb-cp-root--building">
        <BuilderView
          partType={partType}
          editingId={editingPart?.id}
          savedConfig={editingPart ? { ...editingPart } : null}
          onSave={handleSave}
          onBack={() => { setView('library'); setEditingPart(null); }}
        />
      </div>
    );
  }

  return (
    <div className="bb-cp-root">
      <MyCustomPartsLibrary
        parts={customParts}
        onNew={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
