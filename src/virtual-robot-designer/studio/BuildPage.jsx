/**
 * BuildPage.jsx
 * Full 3-column build experience: Parts library | 3D Viewer | Stats/Config
 * v2 — bright stage, rich part tiles, delete functionality, robot-click overlay
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  CHASSIS_DATA, SENSORS_DATA, TOOLS_DATA, POWER_DATA, HEADS_DATA, ARMS_DATA, LIGHTS_DATA,
  BLOCKS_DATA, SAMPLE_ROBOTS, buildRobotModel,
} from '../services/studio-robot-builder.js';

// ─── Colour palette ────────────────────────────────────────────────────────
const PALETTE = [
  '#FF3333', '#FF8C00', '#FFD700', '#00C851', '#1E90FF', '#9B59B6',
  '#FFFFFF', '#CCCCCC', '#888888', '#333333', '#00D9FF', '#FF69B4',
];

// ─── Part descriptions & accent colors ────────────────────────────────────
const PART_META = {
  // Sensors
  camera:      { desc: 'HD vision system',    bg: '#E3F2FD', accent: '#1E90FF' },
  ultrasonic:  { desc: 'Distance scanner',    bg: '#E0F7FA', accent: '#00BCD4' },
  lidar:       { desc: '360° 3D mapping',     bg: '#FFEBEE', accent: '#FF3333' },
  ir:          { desc: 'Heat & motion',        bg: '#FFF3E0', accent: '#FF8C00' },
  gyro:        { desc: 'Balance control',     bg: '#E8F5E9', accent: '#00C851' },
  gps:         { desc: 'GPS navigation',      bg: '#FFFDE7', accent: '#FFD700' },
  // Tools
  grabber:     { desc: 'Pick up objects',     bg: '#FFF3E0', accent: '#FF8C00' },
  drill:       { desc: 'Drilling tool',       bg: '#FAFAFA', accent: '#888888' },
  laser:       { desc: 'Laser emitter',       bg: '#F3E5F5', accent: '#9B59B6' },
  shovel:      { desc: 'Terrain digger',      bg: '#EFEBE9', accent: '#8B4513' },
  claw:        { desc: 'Crab claw grip',      bg: '#FFEBEE', accent: '#FF6B6B' },
  saw:         { desc: 'Cutting blade',       bg: '#F5F5F5', accent: '#555555' },
  // Arms
  simple:      { desc: 'Basic arm',           bg: '#FAFAFA', accent: '#888' },
  'claw-arm':  { desc: 'Claw manipulator',   bg: '#FFF3E0', accent: '#FF8C00' },
  'drill-arm': { desc: 'Drill attachment',   bg: '#F5F5F5', accent: '#555' },
  torch:       { desc: 'Welding torch',       bg: '#FFEBEE', accent: '#FF4500' },
  'laser-arm': { desc: 'Laser arm',           bg: '#F3E5F5', accent: '#9B59B6' },
  bucket:      { desc: 'Bucket scoop',        bg: '#EFEBE9', accent: '#8B4513' },
  // Power
  solar:       { desc: 'Solar panels',        bg: '#FFFDE7', accent: '#FFD700' },
  battery:     { desc: 'Li-ion battery',      bg: '#E8F5E9', accent: '#00C851' },
  nuclear:     { desc: 'Nuclear core',        bg: '#E0F7FA', accent: '#00D9FF' },
  fuel:        { desc: 'Hydrogen cell',       bg: '#FFF3E0', accent: '#FF8C00' },
  // Heads
  dome:        { desc: 'Dome scanner',        bg: '#FAFAFA', accent: '#888' },
  spike:       { desc: 'Spike antenna',       bg: '#FFEBEE', accent: '#FF0000' },
  antenna:     { desc: 'Signal antenna',      bg: '#E0F7FA', accent: '#00D9FF' },
  flat:        { desc: 'Flat sensor plate',   bg: '#E3F2FD', accent: '#1E90FF' },
  face:        { desc: 'Friendly face',       bg: '#FFFDE7', accent: '#FFD700' },
  scanner:     { desc: 'Laser scanner',       bg: '#E8F5E9', accent: '#00C851' },
  // Lights
  'led-white': { desc: 'White LED strip',     bg: '#FAFAFA', accent: '#AAA' },
  'led-cyan':  { desc: 'Cyan glow',           bg: '#E0F7FA', accent: '#00D9FF' },
  'led-red':   { desc: 'Red warning light',   bg: '#FFEBEE', accent: '#FF3333' },
  searchlight: { desc: 'High-power beam',     bg: '#FFFDE7', accent: '#FFD700' },
  strobes:     { desc: 'Strobe flashes',      bg: '#F3E5F5', accent: '#FF00FF' },
  ring:        { desc: 'LED ring halo',       bg: '#FFFDE7', accent: '#FFD700' },
};

const MOVEMENT_OPTS = [
  { id: 'wheels',  name: 'Wheels (4)', icon: '🛞', desc: 'Standard grip',   bg: '#FFF3E0', accent: '#FF8C00' },
  { id: 'wheels6', name: 'Wheels (6)', icon: '🛞', desc: 'Extra traction',  bg: '#E8F5E9', accent: '#00C851' },
  { id: 'tracks',  name: 'Tracks',     icon: '⛓️', desc: 'Tank treads',     bg: '#ECEFF1', accent: '#555' },
  { id: 'legs',    name: 'Legs',       icon: '🦵', desc: 'Articulated gait',bg: '#F3E5F5', accent: '#9B59B6' },
  { id: 'flying',  name: 'Hover',      icon: '🚁', desc: 'Thrust levitation',bg: '#E0F7FA', accent: '#00D9FF' },
  { id: 'jets',    name: 'Jets',       icon: '🚀', desc: 'Rocket propulsion',bg: '#FFEBEE', accent: '#FF3333' },
];

const CATEGORIES = [
  { id: 'body',     label: 'Body',     icon: '📦' },
  { id: 'movement', label: 'Movement', icon: '⚙️' },
  { id: 'heads',    label: 'Heads',    icon: '🤖' },
  { id: 'sensors',  label: 'Sensors',  icon: '📡' },
  { id: 'arms',     label: 'Arms',     icon: '🦾' },
  { id: 'tools',    label: 'Tools',    icon: '🔧' },
  { id: 'power',    label: 'Power',    icon: '🔋' },
  { id: 'lights',   label: 'Lights',   icon: '💡' },
];

// ─── Rich part tile ────────────────────────────────────────────────────────
function PartTile({ id, icon, name, desc, active, onClick, bg = '#F5F5F5', accent = '#7c3aed', isCustom = false }) {
  return (
    <button
      className={`bb-pt${active ? ' bb-pt--active' : ''}`}
      onClick={onClick}
      style={active
        ? { '--pt-accent': accent, '--pt-bg': bg, borderColor: accent, background: bg }
        : { '--pt-accent': accent, '--pt-bg': bg }
      }
    >
      {active && <span className="bb-pt-check">✓</span>}
      {isCustom && <span className="bb-pt-custom-star">✨</span>}
      <div className="bb-pt-icon-wrap" style={{ background: active ? `${accent}22` : '#f0f0f0' }}>
        <span className="bb-pt-icon">{icon}</span>
      </div>
      <div className="bb-pt-body">
        <span className="bb-pt-name">{name}</span>
        {desc && <span className="bb-pt-desc">{desc}</span>}
      </div>
    </button>
  );
}

// ─── Chassis card (larger card for body category) ─────────────────────────
function ChassisCard({ ch, active, onClick }) {
  return (
    <button
      className={`bb-chassis-card${active ? ' selected' : ''}`}
      onClick={onClick}
      style={active ? { background: `linear-gradient(160deg,${ch.bgGrad[0]},${ch.bgGrad[1]})`, borderColor: ch.accentColor || '#7c3aed' } : {}}
    >
      <span className="bb-chassis-icon">{ch.icon}</span>
      <span className="bb-chassis-name">{ch.name}</span>
      <span className="bb-chassis-badge" style={active ? { background: ch.primaryColor, color: '#fff' } : {}}>{ch.badge}</span>
      <div className="bb-chassis-bars">
        <div className="bb-chassis-bar" title="Speed" style={{ width: `${ch.speed}%`, background: '#1E90FF' }} />
        <div className="bb-chassis-bar" title="Power" style={{ width: `${ch.power}%`, background: '#9B59B6' }} />
        <div className="bb-chassis-bar" title="Durability" style={{ width: `${ch.durability}%`, background: '#00C851' }} />
      </div>
    </button>
  );
}

// ─── 3D Viewer ─────────────────────────────────────────────────────────────
function RobotCanvas({ robotConfig, onRobotClick }) {
  const wrapRef  = useRef(null);
  const sceneRef = useRef(null);
  const camRef   = useRef(null);
  const rendRef  = useRef(null);
  const robotRef = useRef(null);
  const rafRef   = useRef(null);
  const roRef    = useRef(null);

  // Init scene once per key-mount
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    // ── Scene: LIGHT background ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f8);
    scene.fog = new THREE.Fog(0xf0f2f8, 22, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 80);
    camera.position.set(2.4, 2.0, 3.6);
    camera.lookAt(0, 0.4, 0);
    camRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Lights: bright studio setup ─────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8e0f0, 0.6);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff8f0, 1.4);
    sun.position.set(6, 10, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;   sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0002;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xd0e8ff, 0.5);
    fill.position.set(-5, 4, -3);
    scene.add(fill);

    // Rim / accent lights (soft, from below/sides)
    const rim = new THREE.DirectionalLight(0xe8d8ff, 0.35);
    rim.position.set(0, -2, -5);
    scene.add(rim);

    // ── Floor + grid ─────────────────────────────────────────────────────────
    const floorGeo  = new THREE.CircleGeometry(4.5, 64);
    const floorMat  = new THREE.MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.08, roughness: 0.9 });
    const floor     = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y  = -0.12;
    floor.receiveShadow = true;
    scene.add(floor);

    // Platform disc
    const platMat = new THREE.MeshStandardMaterial({ color: 0xdde2f2, metalness: 0.55, roughness: 0.3 });
    const plat    = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 64), platMat);
    plat.position.y = -0.04;
    plat.receiveShadow = true;
    scene.add(plat);

    // Platform accent ring (purple)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 0.7 });
    const ring    = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.04, 8, 72), ringMat);
    ring.position.y = 0.02;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Shadow ground (barely visible on light bg)
    const shadowGeo = new THREE.CircleGeometry(2.0, 32);
    const shadowMat = new THREE.MeshStandardMaterial({ color: 0xc8cee0, transparent: true, opacity: 0.18 });
    const shadow    = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y  = -0.11;
    scene.add(shadow);

    // ── Raycaster for robot-click ─────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const handleClick = (e) => {
      if (!robotRef.current || !onRobotClick) return;
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camRef.current);
      const hits = raycaster.intersectObjects(robotRef.current.children, true);
      if (hits.length > 0) {
        onRobotClick();
        // Brief pulse highlight
        const origColor = hits[0].object.material?.color?.clone?.();
        if (hits[0].object.material?.emissive) {
          hits[0].object.material.emissive.set(0xffffff);
          hits[0].object.material.emissiveIntensity = 0.4;
          setTimeout(() => {
            if (hits[0].object.material?.emissive) {
              hits[0].object.material.emissive.set(0x000000);
              hits[0].object.material.emissiveIntensity = 0;
            }
          }, 350);
        }
      }
    };
    el.addEventListener('click', handleClick);

    // ── ResizeObserver ─────────────────────────────────────────────────────
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
    window.addEventListener('resize', onResize);

    // ── Animation ──────────────────────────────────────────────────────────
    let t = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      t += 0.004;
      if (robotRef.current) {
        robotRef.current.rotation.y = t;
        robotRef.current.position.y = Math.sin(t * 1.4) * 0.06;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      el.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafRef.current);
      roRef.current?.disconnect();
      window.removeEventListener('resize', onResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild robot model when config changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (robotRef.current) {
      scene.remove(robotRef.current);
      robotRef.current = null;
    }
    const model = buildRobotModel(robotConfig);
    scene.add(model);
    robotRef.current = model;
  }, [robotConfig]);

  return <div ref={wrapRef} className="bb-studio-canvas-wrap" style={{ cursor: 'pointer' }} />;
}

// ─── Left Panel ────────────────────────────────────────────────────────────
function LeftPanel({ robotConfig, setRobotConfig, activeRobotId, setActiveRobotId, customParts = [], onGoCreate }) {
  const [activeCat, setActiveCat] = useState('body');
  const [search, setSearch]       = useState('');
  const [savedRobots]             = useState(SAMPLE_ROBOTS);

  const toggleSensor = (id) =>
    setRobotConfig(prev => ({
      ...prev,
      sensors: prev.sensors.includes(id)
        ? prev.sensors.filter(s => s !== id)
        : [...prev.sensors, id],
    }));

  const toggleTool = (id) =>
    setRobotConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(id)
        ? prev.tools.filter(t => t !== id)
        : [...prev.tools, id],
    }));

  const customTile = (catLabel) => (
    <PartTile
      key="__custom__"
      id="__custom__"
      icon="✨"
      name="Create Custom"
      desc={`Design your own ${catLabel}`}
      bg="#f0eeff"
      accent="#7c3aed"
      isCustom
      onClick={onGoCreate}
    />
  );

  const renderParts = () => {
    const q = search.toLowerCase();
    switch (activeCat) {
      case 'body': {
        const customChassis = customParts.filter(p => p.type === 'chassis');
        const allChassis = [...CHASSIS_DATA, ...customChassis.map(c => ({
          id: c.id, name: c.name, icon: '✨', badge: 'Custom',
          primaryColor: c.color, accentColor: c.color,
          speed: 70, power: 70, durability: 70,
          bgGrad: [`${c.color}33`, `${c.color}11`],
          isCustom: true,
        }))];
        const filtered = allChassis.filter(c => !q || c.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Chassis Type</p>
            <div className="bb-chassis-grid">
              {filtered.map(ch => (
                <ChassisCard
                  key={ch.id}
                  ch={ch}
                  active={robotConfig.chassisId === ch.id}
                  onClick={() => setRobotConfig(prev => ({
                    ...prev,
                    chassisId: ch.id,
                    primaryColor: ch.primaryColor || prev.primaryColor,
                    accentColor: ch.accentColor || prev.accentColor,
                  }))}
                />
              ))}
              <button className="bb-chassis-card bb-chassis-card--create" onClick={onGoCreate}>
                <span className="bb-chassis-icon">✨</span>
                <span className="bb-chassis-name">Create Custom</span>
                <span className="bb-chassis-badge" style={{ background: '#7c3aed', color: '#fff' }}>New</span>
              </button>
            </div>
          </>
        );
      }

      case 'movement': {
        const filtered = MOVEMENT_OPTS.filter(m => !q || m.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Movement System</p>
            <div className="bb-pt-grid">
              {filtered.map(m => (
                <PartTile key={m.id} {...m} bg={m.bg} accent={m.accent}
                  active={robotConfig.movementId === m.id}
                  onClick={() => setRobotConfig(prev => ({ ...prev, movementId: m.id }))}
                />
              ))}
              {customTile('movement system')}
            </div>
          </>
        );
      }

      case 'heads': {
        const filtered = HEADS_DATA.filter(h => !q || h.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Head Type</p>
            <div className="bb-pt-grid">
              {filtered.map(h => {
                const m = PART_META[h.id] || {};
                return (
                  <PartTile key={h.id} id={h.id} icon={h.icon} name={h.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || h.color}
                    active={robotConfig.headId === h.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, headId: prev.headId === h.id ? null : h.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }

      case 'sensors': {
        const customSensors = customParts.filter(p => p.type === 'sensor');
        const allSensors = [...SENSORS_DATA, ...customSensors.map(s => ({
          id: s.id, name: s.name, icon: '✨', color: s.color || '#7c3aed', isCustom: true,
        }))];
        const filtered = allSensors.filter(s => !q || s.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Sensors</p>
            <div className="bb-pt-grid">
              {filtered.map(s => {
                const m = PART_META[s.id] || {};
                return (
                  <PartTile key={s.id} id={s.id} icon={s.icon} name={s.name}
                    desc={m.desc || (s.isCustom ? 'Custom sensor' : '')}
                    bg={m.bg || '#f0eeff'} accent={m.accent || s.color}
                    active={robotConfig.sensors.includes(s.id)}
                    isCustom={s.isCustom}
                    onClick={() => toggleSensor(s.id)}
                  />
                );
              })}
              {customTile('sensor')}
            </div>
          </>
        );
      }

      case 'arms': {
        const filtered = ARMS_DATA.filter(a => !q || a.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Arms & Manipulators</p>
            <div className="bb-pt-grid">
              {filtered.map(a => {
                const m = PART_META[a.id] || {};
                return (
                  <PartTile key={a.id} id={a.id} icon={a.icon} name={a.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || a.color}
                    active={robotConfig.armId === a.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, armId: prev.armId === a.id ? null : a.id }))}
                  />
                );
              })}
              {customTile('arm')}
            </div>
          </>
        );
      }

      case 'tools': {
        const filtered = TOOLS_DATA.filter(t => !q || t.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Tools</p>
            <div className="bb-pt-grid">
              {filtered.map(t => {
                const m = PART_META[t.id] || {};
                return (
                  <PartTile key={t.id} id={t.id} icon={t.icon} name={t.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || t.color}
                    active={robotConfig.tools.includes(t.id)}
                    onClick={() => toggleTool(t.id)}
                  />
                );
              })}
              {customTile('tool')}
            </div>
          </>
        );
      }

      case 'power': {
        const filtered = POWER_DATA.filter(p => !q || p.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Power Source</p>
            <div className="bb-pt-grid">
              {filtered.map(p => {
                const m = PART_META[p.id] || {};
                return (
                  <PartTile key={p.id} id={p.id} icon={p.icon} name={p.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || p.color}
                    active={robotConfig.powerId === p.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, powerId: p.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }

      case 'lights': {
        const filtered = LIGHTS_DATA.filter(l => !q || l.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Lighting</p>
            <div className="bb-pt-grid">
              {filtered.map(l => {
                const m = PART_META[l.id] || {};
                return (
                  <PartTile key={l.id} id={l.id} icon={l.icon} name={l.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || l.color}
                    active={robotConfig.lightId === l.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, lightId: prev.lightId === l.id ? null : l.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="bb-studio-left">
      {/* Header */}
      <div className="bb-studio-left-top">
        <div className="bb-studio-left-label">🔧 Build Your Robot</div>
        <input
          className="bb-studio-search"
          placeholder="🔍  Search parts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="bb-studio-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`bb-studio-cat-btn ${activeCat === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Parts scroll area */}
      <div className="bb-studio-parts-scroll">
        {renderParts()}
      </div>

      {/* Blocks strip */}
      <div className="bb-studio-blocks">
        <p className="bb-studio-section-label" style={{ margin: '10px 0 4px' }}>Blocks</p>
        <div className="bb-studio-blocks-grid">
          {BLOCKS_DATA.map(b => (
            <div key={b.id} className="bb-studio-block-item" style={{ background: b.color }} title={b.label} />
          ))}
        </div>
        <button className="bb-studio-more-btn">＋ More Parts</button>
      </div>

      {/* My Robots strip */}
      <div className="bb-studio-my-robots">
        <div className="bb-studio-my-robots-head">
          <span className="bb-studio-my-robots-title">My Robots</span>
          <button className="bb-studio-new-btn">＋ New</button>
        </div>
        <div className="bb-studio-robots-row">
          {savedRobots.map(r => (
            <button
              key={r.id}
              className={`bb-studio-robot-thumb ${activeRobotId === r.id ? 'selected' : ''}`}
              onClick={() => {
                setActiveRobotId(r.id);
                setRobotConfig(prev => ({
                  ...prev, chassisId: r.chassisId,
                  primaryColor: r.primaryColor, accentColor: r.accentColor,
                  sensors: r.sensors, tools: r.tools,
                }));
              }}
            >
              <span className="bb-studio-robot-thumb-icon">{r.icon}</span>
              <span className="bb-studio-robot-thumb-name">{r.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────
function RightPanel({ robotConfig, setRobotConfig, onSimulate, robotValidation }) {
  const chassis = CHASSIS_DATA.find(c => c.id === robotConfig.chassisId) || CHASSIS_DATA[0];

  // Validation notices (errors + warnings only)
  const notices = (robotValidation?.results || []).filter(
    r => r.severity === 'error' || r.severity === 'warning'
  );

  const removeSensor = (id) => setRobotConfig(prev => ({ ...prev, sensors: prev.sensors.filter(s => s !== id) }));
  const removeTool   = (id) => setRobotConfig(prev => ({ ...prev, tools:   prev.tools.filter(t => t !== id)   }));
  const removeHead   = ()   => setRobotConfig(prev => ({ ...prev, headId:  null }));
  const removeArm    = ()   => setRobotConfig(prev => ({ ...prev, armId:   null }));
  const removeLight  = ()   => setRobotConfig(prev => ({ ...prev, lightId: null }));

  const stats = {
    speed:     Math.min(chassis.speed + (robotConfig.movementId === 'flying' ? 30 : robotConfig.movementId === 'jets' ? 50 : 0), 100),
    power:     Math.min(chassis.power + (robotConfig.tools.length * 5), 100),
    durability:Math.min(chassis.durability, 100),
  };

  // Build full installed-parts list with remove callbacks
  const installedParts = [
    ...robotConfig.sensors.map(id => {
      const s = SENSORS_DATA.find(x => x.id === id);
      return s ? { ...s, onRemove: () => removeSensor(id) } : null;
    }),
    ...robotConfig.tools.map(id => {
      const t = TOOLS_DATA.find(x => x.id === id);
      return t ? { ...t, onRemove: () => removeTool(id) } : null;
    }),
    ...(robotConfig.headId ? (() => {
      const h = HEADS_DATA.find(x => x.id === robotConfig.headId);
      return h ? [{ ...h, onRemove: removeHead }] : [];
    })() : []),
    ...(robotConfig.armId ? (() => {
      const a = ARMS_DATA.find(x => x.id === robotConfig.armId);
      return a ? [{ ...a, onRemove: removeArm }] : [];
    })() : []),
    ...(robotConfig.lightId ? (() => {
      const l = LIGHTS_DATA.find(x => x.id === robotConfig.lightId);
      return l ? [{ ...l, onRemove: removeLight }] : [];
    })() : []),
  ].filter(Boolean);

  return (
    <div className="bb-studio-right">
      <div className="bb-studio-right-head">
        <div className="bb-studio-right-title">📊 Robot Stats</div>
      </div>

      <div className="bb-studio-right-scroll">
        {/* Validation notices */}
        {notices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {notices.slice(0, 4).map((n, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '7px 10px', borderRadius: 8,
                background: n.severity === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(249,115,22,0.12)',
                border: `1px solid ${n.severity === 'error' ? '#ef444444' : '#f9731644'}`,
                fontSize: 11, lineHeight: 1.4,
              }}>
                <span style={{ color: n.severity === 'error' ? '#ef4444' : '#f97316', fontSize: 13, flexShrink: 0 }}>
                  {n.severity === 'error' ? '✕' : '⚠'}
                </span>
                <span style={{ color: n.severity === 'error' ? '#fca5a5' : '#fdba74' }}>{n.message}</span>
              </div>
            ))}
          </div>
        )}
        {/* Specs card */}
        <div className="bb-studio-specs-card">
          <div className="bb-studio-specs-name">{robotConfig.name || 'My Robot'}</div>
          <div className="bb-studio-specs-sub">{chassis.name} · {chassis.movement}</div>
          <div className="bb-studio-specs-grid">
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Weight</div>
              <div className="bb-studio-spec-val">{chassis.weight}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Parts</div>
              <div className="bb-studio-spec-val">{installedParts.length}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Movement</div>
              <div className="bb-studio-spec-val">{chassis.movement}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Sensors</div>
              <div className="bb-studio-spec-val">{robotConfig.sensors.length}</div>
            </div>
          </div>
        </div>

        {/* Stat bars */}
        {[
          { label: 'Speed',      value: stats.speed,      color: '#1E90FF', icon: '🚀' },
          { label: 'Power',      value: stats.power,      color: '#9B59B6', icon: '⚡' },
          { label: 'Durability', value: stats.durability, color: '#00C851', icon: '🛡️' },
        ].map(s => (
          <div key={s.label} className="bb-studio-stat-row">
            <div className="bb-studio-stat-head">
              <span>{s.icon} {s.label}</span>
              <span className="bb-studio-stat-val">{s.value}%</span>
            </div>
            <div className="bb-studio-stat-bar">
              <div className="bb-studio-stat-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}

        {/* Primary colour */}
        <div className="bb-studio-color-section">
          <div className="bb-studio-color-label">Primary Color</div>
          <div className="bb-studio-colors">
            {PALETTE.map(c => (
              <button key={c}
                className={`bb-studio-color-swatch ${robotConfig.primaryColor === c ? 'active' : ''}`}
                style={{ background: c, border: c === '#FFFFFF' ? '1.5px solid #ddd' : 'none' }}
                onClick={() => setRobotConfig(prev => ({ ...prev, primaryColor: c }))}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Accent colour */}
        <div className="bb-studio-color-section">
          <div className="bb-studio-color-label">Accent Color</div>
          <div className="bb-studio-colors">
            {PALETTE.map(c => (
              <button key={c}
                className={`bb-studio-color-swatch ${robotConfig.accentColor === c ? 'active' : ''}`}
                style={{ background: c, border: c === '#FFFFFF' ? '1.5px solid #ddd' : 'none' }}
                onClick={() => setRobotConfig(prev => ({ ...prev, accentColor: c }))}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* ── Installed parts with delete buttons ─────────────────────────── */}
        <div className="bb-installed-parts">
          <div className="bb-studio-color-label" style={{ marginBottom: 8 }}>
            🔩 Installed Parts ({installedParts.length})
          </div>
          {installedParts.length === 0 && (
            <div className="bb-installed-empty">No parts added yet. Select parts from the left panel.</div>
          )}
          {installedParts.map(p => (
            <div key={p.id} className="bb-installed-row">
              <span className="bb-installed-icon" style={{ color: p.color }}>{p.icon}</span>
              <span className="bb-installed-name">{p.name}</span>
              <button
                className="bb-installed-del"
                title={`Remove ${p.name}`}
                onClick={p.onRemove}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bb-studio-actions">
        <button className="bb-studio-act-btn bb-studio-act-btn--simulate" onClick={onSimulate}>
          📝 Code My Robot →
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--save">
          💾 Save Design
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--code">
          &lt;/&gt; Generate Code
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--ghost"
          onClick={() => setRobotConfig(prev => ({ ...prev, sensors: [], tools: [], headId: null, armId: null, lightId: null }))}>
          🔄 Clear Parts
        </button>
      </div>
    </div>
  );
}

// ─── Build Page ─────────────────────────────────────────────────────────────
export default function BuildPage({ robotConfig, setRobotConfig, onSimulate, customParts = [], onGoCreate, robotValidation }) {
  const [activeRobotId, setActiveRobotId] = useState(1);
  const [partsOverlay, setPartsOverlay]   = useState(false);
  const chassis = CHASSIS_DATA.find(c => c.id === robotConfig.chassisId) || CHASSIS_DATA[0];

  const removeSensor = (id) => setRobotConfig(prev => ({ ...prev, sensors: prev.sensors.filter(s => s !== id) }));
  const removeTool   = (id) => setRobotConfig(prev => ({ ...prev, tools:   prev.tools.filter(t => t !== id)   }));

  return (
    <div className="bb-studio-build">
      <LeftPanel
        robotConfig={robotConfig}
        setRobotConfig={setRobotConfig}
        activeRobotId={activeRobotId}
        setActiveRobotId={setActiveRobotId}
        customParts={customParts}
        onGoCreate={onGoCreate}
      />

      {/* Center Viewport */}
      <div className="bb-studio-center">
        <div className="bb-studio-viewport-header">
          <span className="bb-studio-viewport-title">🤖 {robotConfig.name || 'My Robot'}</span>
          <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>Click robot to manage parts</span>
          <button className="bb-studio-vp-btn bb-studio-vp-btn--test" onClick={onSimulate}>📝 Code My Robot</button>
          <button className="bb-studio-vp-btn bb-studio-vp-btn--reset"
            onClick={() => setRobotConfig(prev => ({ ...prev, sensors: [], tools: [], headId: null, armId: null, lightId: null }))}>
            ↺ Clear
          </button>
        </div>

        {/* The 3D canvas — rebuilds on config change */}
        <RobotCanvas
          key={JSON.stringify(robotConfig)}
          robotConfig={robotConfig}
          onRobotClick={() => setPartsOverlay(v => !v)}
        />

        {/* Click-robot overlay */}
        {partsOverlay && (
          <div className="bb-parts-overlay">
            <div className="bb-parts-overlay-inner">
              <div className="bb-parts-overlay-head">
                <span>🔩 Robot Parts</span>
                <button className="bb-parts-overlay-close" onClick={() => setPartsOverlay(false)}>✕</button>
              </div>

              {robotConfig.sensors.length === 0 && robotConfig.tools.length === 0 ? (
                <div className="bb-parts-overlay-empty">No removable parts installed.<br/>Add sensors or tools in the left panel.</div>
              ) : (
                <>
                  {robotConfig.sensors.map(id => {
                    const s = SENSORS_DATA.find(x => x.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="bb-parts-overlay-row">
                        <span className="bb-parts-overlay-icon">{s.icon}</span>
                        <span className="bb-parts-overlay-name">{s.name}</span>
                        <button className="bb-parts-overlay-del" onClick={() => { removeSensor(id); }}>
                          🗑️ Remove
                        </button>
                      </div>
                    );
                  })}
                  {robotConfig.tools.map(id => {
                    const t = TOOLS_DATA.find(x => x.id === id);
                    if (!t) return null;
                    return (
                      <div key={id} className="bb-parts-overlay-row">
                        <span className="bb-parts-overlay-icon">{t.icon}</span>
                        <span className="bb-parts-overlay-name">{t.name}</span>
                        <button className="bb-parts-overlay-del" onClick={() => { removeTool(id); }}>
                          🗑️ Remove
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        <span className="bb-studio-canvas-label">{chassis.name} · {chassis.badge}</span>
        <span className="bb-studio-canvas-hint">Drag to rotate · Click to manage parts</span>
      </div>

      <RightPanel
        robotConfig={robotConfig}
        setRobotConfig={setRobotConfig}
        onSimulate={onSimulate}
        robotValidation={robotValidation}
      />
    </div>
  );
}
