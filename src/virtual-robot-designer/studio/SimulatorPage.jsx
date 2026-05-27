/**
 * SimulatorPage.jsx
 * Full 3D obstacle course simulator with real-time metrics.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { buildRobotModel, CHASSIS_DATA } from '../services/studio-robot-builder.js';

// ─── Challenges ─────────────────────────────────────────────────────────────
const CHALLENGES = [
  {
    id: 'obstacle',
    name: 'Obstacle Course',
    icon: '🏁',
    desc: 'Avoid the obstacles and reach the finish line!',
    obstacles: 12,
    totalDist: 24,
    difficulty: 'Easy',
  },
  {
    id: 'speedrun',
    name: 'Speed Run',
    icon: '⚡',
    desc: 'Finish the track as fast as possible!',
    obstacles: 6,
    totalDist: 18,
    difficulty: 'Medium',
  },
  {
    id: 'maze',
    name: 'Maze Navigator',
    icon: '🌀',
    desc: 'Find the exit through the maze!',
    obstacles: 20,
    totalDist: 32,
    difficulty: 'Hard',
  },
];

// ─── Code Block Duration (seconds each block takes) ────────────────────────
function getBlockDuration(block) {
  const p = block.paramValues || {};
  switch (block.id) {
    case 'move_forward':  return Math.max(0.3, (p.steps  || 2) * 0.7);
    case 'move_backward': return Math.max(0.3, (p.steps  || 1) * 0.7);
    case 'turn_left':     return Math.max(0.2, (p.degrees|| 90) / 90 * 0.55);
    case 'turn_right':    return Math.max(0.2, (p.degrees|| 90) / 90 * 0.55);
    case 'spin':          return 0.9;
    case 'stop':          return 0.4;
    case 'wait':          return Math.max(0.1, p.seconds || 1);
    case 'fly_up':        return 0.8;
    case 'fly_down':      return 0.8;
    case 'scan':          return 1.5;
    case 'if_obstacle':   return 0.6;
    case 'look':          return 1.2;
    case 'if_see_object': return 0.6;
    case 'grab':          return 0.8;
    case 'release':       return 0.8;
    case 'drill':         return Math.max(0.5, p.seconds || 2);
    case 'fire_laser':    return 0.6;
    case 'lights_on':     return 0.3;
    case 'lights_off':    return 0.3;
    case 'flash':         return Math.max(0.5, (p.times || 3) * 0.3);
    case 'repeat':        return 0.1;
    default:              return 0.4;
  }
}

// Apply movement for a code block each frame
function applyCodeBlock(block, rs, dt) {
  const p = block.paramValues || {};
  const dur = rs.currentDur;
  if (dur <= 0) return;
  switch (block.id) {
    case 'move_forward': {
      const dist = (p.steps || 2) * 1.8;
      rs.x += Math.sin(rs.angle) * (dist / dur) * dt;
      rs.z += Math.cos(rs.angle) * (dist / dur) * dt;
      rs.totalDist += (dist / dur) * dt;
      break;
    }
    case 'move_backward': {
      const dist = (p.steps || 1) * 1.8;
      rs.x -= Math.sin(rs.angle) * (dist / dur) * dt;
      rs.z -= Math.cos(rs.angle) * (dist / dur) * dt;
      break;
    }
    case 'turn_left': {
      rs.angle += ((p.degrees || 90) * Math.PI / 180) / dur * dt;
      break;
    }
    case 'turn_right': {
      rs.angle -= ((p.degrees || 90) * Math.PI / 180) / dur * dt;
      break;
    }
    case 'spin': {
      rs.angle += (Math.PI * 2) / dur * dt;
      break;
    }
    case 'fly_up': {
      rs.y = Math.min(3, (rs.y || 0) + 1.5 / dur * dt);
      break;
    }
    case 'fly_down': {
      rs.y = Math.max(0, (rs.y || 0) - 1.5 / dur * dt);
      break;
    }
    default: break;
  }
}

// ─── 3D Sim Canvas ───────────────────────────────────────────────────────────
function SimCanvas({ robotConfig, running, paused, onProgress, onFpsUpdate, challenge, robotCode = [] }) {
  const wrapRef   = useRef(null);
  const sceneRef  = useRef(null);
  const rendRef   = useRef(null);
  const camRef    = useRef(null);
  const robotRef  = useRef(null);
  const rafRef    = useRef(null);
  // FPS tracking
  const fpsRef    = useRef({ frames: 0, last: 0, fps: 60 });
  // Auto-mode state
  const stateRef  = useRef({ t: 0, dist: 0, avoided: 0, battery: 100 });
  // Code-driven state
  const codeRef   = useRef(robotCode);
  const crsRef    = useRef({ x: 0, z: 5, y: 0, angle: Math.PI, step: 0, stepTime: 0, currentDur: 0, totalDist: 0, pass: 0, maxPasses: 1, done: false, t: 0 });
  const runRef    = useRef(false);
  const pauseRef  = useRef(false);

  // Sync running/paused into refs so the RAF loop reads current values
  useEffect(() => { runRef.current  = running;  }, [running]);
  useEffect(() => { pauseRef.current = paused;   }, [paused]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1525);
    scene.fog = new THREE.Fog(0x0e1525, 18, 45);
    sceneRef.current = scene;

    // Camera — overhead follow cam
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 80);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 0, 0);
    camRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 0.5));
    const sun = new THREE.DirectionalLight(0xfff8ee, 1.4);
    sun.position.set(6, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);
    const spl1 = new THREE.PointLight(0x1e90ff, 0.6, 24); spl1.position.set(0, 6, 0); scene.add(spl1);
    const spl2 = new THREE.PointLight(0x00d9ff, 0.4, 18); spl2.position.set(-8, 3, -5); scene.add(spl2);

    // Ground
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f1620, roughness: 0.9, metalness: 0.1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines on ground
    const gridHelper = new THREE.GridHelper(50, 50, 0x1a2a3a, 0x1a2a3a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Track lane
    const lane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 28),
      new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.8 }),
    );
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(0, 0.01, -8);
    lane.receiveShadow = true;
    scene.add(lane);

    // Lane stripes
    for (let i = -12; i <= 4; i += 3) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xffdd00, emissive: 0xffaa00, emissiveIntensity: 0.3 }),
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, i);
      scene.add(stripe);
    }

    // Finish line
    const finish = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00cc44, emissiveIntensity: 0.6 }),
    );
    finish.rotation.x = -Math.PI / 2;
    finish.position.set(0, 0.03, -20);
    scene.add(finish);

    // Finish arch
    [-1.8, 1.8].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00ff66, emissiveIntensity: 0.8 }),
      );
      post.position.set(x, 1.75, -20);
      scene.add(post);
    });

    // Obstacles
    const obstacleMeshes = [];
    const obstacleColors = [0x2196f3, 0xff5722, 0x4caf50, 0x9c27b0, 0xff9800];
    const obstPositions = [
      [-1.0, -4], [0.8, -7], [-0.5, -10], [1.2, -12.5], [-0.9, -15],
      [0.4, -17], [-1.3, -6], [1.0, -9], [-0.3, -13], [0.7, -16],
      [-0.8, -8], [1.1, -11],
    ];
    obstPositions.forEach(([ x, z ], i) => {
      const h = 0.5 + Math.random() * 0.8;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, h, 0.7),
        new THREE.MeshStandardMaterial({
          color: obstacleColors[i % obstacleColors.length],
          roughness: 0.5,
          metalness: 0.3,
        }),
      );
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      obstacleMeshes.push(mesh);
    });

    // Decorative background elements
    const bgColors = [0x1e3a5f, 0x2d1b4e, 0x1a3a2a];
    for (let i = 0; i < 8; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2 + Math.random(), 2 + Math.random() * 3, 1.2),
        new THREE.MeshStandardMaterial({ color: bgColors[i % bgColors.length], metalness: 0.5, roughness: 0.5 }),
      );
      box.position.set((Math.random() - 0.5) * 20, box.geometry.parameters.height / 2, -22 - Math.random() * 8);
      box.castShadow = true;
      scene.add(box);
    }

    // Robot
    const robot = buildRobotModel(robotConfig);
    robot.position.set(0, 0, 5);
    robot.rotation.y = Math.PI; // face forward
    scene.add(robot);
    robotRef.current = robot;

    // Resize handler
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
    window.addEventListener('resize', onResize);

    // Precompute repeat count from code
    const code = codeRef.current;
    const repeatBlock = code.find(b => b.id === 'repeat');
    if (repeatBlock) {
      crsRef.current.maxPasses = repeatBlock.paramValues?.times || 3;
    }
    const codeBlocks = code.filter(b => b.id !== 'repeat'); // exclude marker
    const hasCode = codeBlocks.length > 0;

    // Animation loop
    let prev = performance.now();
    const tick = (now) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      // FPS tracking
      fpsRef.current.frames++;
      if (now - fpsRef.current.last > 1000) {
        const newFps = Math.round(fpsRef.current.frames * 1000 / (now - fpsRef.current.last));
        fpsRef.current.fps = newFps;
        fpsRef.current.frames = 0;
        fpsRef.current.last = now;
        onFpsUpdate?.(newFps);
      }

      if (runRef.current && !pauseRef.current) {
        if (hasCode) {
          // ── CODE-DRIVEN MODE ────────────────────────────────────────────
          const rs = crsRef.current;
          if (!rs.done) {
            rs.t += dt;
            rs.battery = Math.max(0, 100 - rs.t * 0.45);

            // Get current block
            const block = codeBlocks[rs.step];
            if (block) {
              if (rs.stepTime === 0) {
                // First frame of this block — compute its duration
                rs.currentDur = getBlockDuration(block);
              }
              rs.stepTime += dt;
              applyCodeBlock(block, rs, dt);

              // Advance when block time is up
              if (rs.stepTime >= rs.currentDur) {
                rs.step++;
                rs.stepTime = 0;
                rs.currentDur = 0;
              }
            }

            // End of all blocks — check for repeat
            if (rs.step >= codeBlocks.length) {
              rs.pass++;
              if (rs.pass < rs.maxPasses) {
                rs.step = 0;  // loop
              } else {
                rs.done = true;
              }
            }

            // Apply robot transform
            robot.position.set(rs.x, rs.y || 0, rs.z);
            robot.rotation.y = rs.angle;
            robot.rotation.x = Math.sin(rs.t * 8) * 0.01;

            // Camera follows
            const cx = rs.x;
            const cz = rs.z;
            camera.position.set(cx + Math.sin(rs.angle + Math.PI) * 7, 4.5, cz + Math.cos(rs.angle + Math.PI) * 7);
            camera.lookAt(cx, 0.4, cz);

            // Progress = fraction of code steps completed across all passes
            const totalSteps = codeBlocks.length * rs.maxPasses;
            const doneSteps  = rs.pass * codeBlocks.length + rs.step;
            const progress   = Math.min((doneSteps / totalSteps) * 100, 100);

            onProgress?.({
              time:      rs.t,
              dist:      rs.totalDist,
              battery:   rs.battery,
              avoided:   Math.min(Math.floor(rs.totalDist / 2), challenge?.obstacles || 12),
              progress,
              done:      rs.done,
              execBlock: codeBlocks[rs.step]?.label || null,
            });

            if (rs.done) runRef.current = false;
          }
        } else {
          // ── AUTO-MOVEMENT MODE (no code provided) ───────────────────────
          const st = stateRef.current;
          st.t += dt;
          const speed = 2.8;
          st.dist += speed * dt;
          st.battery = Math.max(0, 100 - st.t * 0.55);

          const z = 5 - st.dist;
          const x = Math.sin(st.dist * 0.35) * 0.7;
          robot.position.set(x, 0, z);
          robot.rotation.z = -Math.cos(st.dist * 0.35) * 0.08;
          robot.rotation.x = Math.sin(st.t * 8) * 0.012;

          camera.position.set(x, 4.8, z + 8);
          camera.lookAt(x, 0.3, z - 2);

          st.avoided = Math.min(
            Math.floor(st.dist / (challenge?.totalDist / (challenge?.obstacles || 12))),
            challenge?.obstacles || 12,
          );

          obstacleMeshes.forEach((m, i) => {
            m.rotation.y = st.t * 0.5 + i;
          });

          const progress = Math.min((st.dist / (challenge?.totalDist || 24)) * 100, 100);
          onProgress?.({
            time: st.t,
            dist: st.dist,
            battery: st.battery,
            avoided: st.avoided,
            progress,
            done: progress >= 100,
          });

          if (st.dist >= (challenge?.totalDist || 24)) {
            runRef.current = false;
          }
        }
      } else if (!runRef.current && !pauseRef.current) {
        // Idle: gentle bobbing
        const t = hasCode ? crsRef.current.t : stateRef.current.t;
        robot.rotation.y = Math.PI + Math.sin(t * 0.6) * 0.05;
        robot.position.y = Math.sin(t) * 0.04;
        if (!hasCode) stateRef.current.t += dt;
      }

      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotConfig, challenge]);

  return <div ref={wrapRef} className="bb-studio-sim-canvas" />;
}

// ─── Simulator Stats Panel ───────────────────────────────────────────────────
function StatsPanel({ running, paused, stats, challenge, onStart, onPause, onStop }) {
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const statusClass = running ? (paused ? 'paused' : 'running') : 'stopped';
  const statusLabel = running ? (paused ? '⏸ Paused' : '● Running') : '■ Stopped';

  return (
    <div className="bb-studio-sim-right">
      <div className="bb-studio-sim-header">
        <span className="bb-studio-sim-title">Simulator</span>
        <div className={`bb-studio-sim-status ${statusClass}`}>
          <span className="bb-studio-sim-dot" />
          {statusLabel}
        </div>
      </div>

      <div className="bb-studio-sim-body">
        {/* Challenge card */}
        <div className="bb-studio-challenge-card">
          <div style={{ fontSize: 28, marginBottom: 6 }}>{challenge.icon}</div>
          <div className="bb-studio-challenge-name">{challenge.name}</div>
          <div className="bb-studio-challenge-desc">{challenge.desc}</div>
        </div>

        {/* Progress */}
        <div className="bb-studio-progress-wrap">
          <div className="bb-studio-progress-head">
            <span>Progress</span>
            <span style={{ fontWeight: 800, color: '#7c3aed' }}>{Math.round(stats.progress)}%</span>
          </div>
          <div className="bb-studio-progress-bar">
            <div className="bb-studio-progress-fill" style={{ width: `${stats.progress}%` }} />
          </div>
        </div>

        {/* Metrics */}
        <div className="bb-studio-metrics">
          <div className="bb-studio-metric">
            <div className="bb-studio-metric-label">Time</div>
            <div className="bb-studio-metric-value">
              {fmt(stats.time)}
            </div>
          </div>
          <div className="bb-studio-metric">
            <div className="bb-studio-metric-label">Distance</div>
            <div className="bb-studio-metric-value">
              {stats.dist.toFixed(1)}<span className="bb-studio-metric-unit">m</span>
            </div>
          </div>
          <div className="bb-studio-metric">
            <div className="bb-studio-metric-label">Obstacles</div>
            <div className="bb-studio-metric-value">
              {stats.avoided}<span className="bb-studio-metric-unit">/{challenge.obstacles}</span>
            </div>
          </div>
          <div className="bb-studio-metric">
            <div className="bb-studio-metric-label">Battery</div>
            <div className="bb-studio-metric-value">
              {Math.round(stats.battery)}<span className="bb-studio-metric-unit">%</span>
            </div>
          </div>
        </div>

        {/* Battery bar */}
        <div style={{ marginBottom: 14 }}>
          <div className="bb-studio-stat-head" style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6 }}>
            <span>Battery</span>
            <span style={{ fontWeight: 800, color: stats.battery < 20 ? '#ef4444' : '#00c851' }}>
              {Math.round(stats.battery)}%
            </span>
          </div>
          <div className="bb-studio-battery-bar">
            <div
              className={`bb-studio-battery-fill${stats.battery < 20 ? ' low' : ''}`}
              style={{ width: `${stats.battery}%` }}
            />
          </div>
        </div>

        {/* Challenge selector */}
        <div>
          <div className="bb-studio-color-label" style={{ marginBottom: 8 }}>Challenge</div>
          {CHALLENGES.map(ch => (
            <div
              key={ch.id}
              onClick={() => !running && onStart?.(ch)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 10, marginBottom: 6,
                background: challenge.id === ch.id ? '#f0eeff' : '#f8f8f8',
                border: `1.5px solid ${challenge.id === ch.id ? '#7c3aed' : '#ebebeb'}`,
                cursor: running ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{ch.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#333' }}>{ch.name}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{ch.difficulty} · {ch.obstacles} obstacles</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <div className="bb-studio-sim-controls">
        {!running || paused ? (
          <button className="bb-studio-ctrl-btn bb-studio-ctrl-btn--start" onClick={onStart}>
            ▶ {paused ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button className="bb-studio-ctrl-btn bb-studio-ctrl-btn--pause" onClick={onPause}>
            ⏸ Pause
          </button>
        )}
        <button className="bb-studio-ctrl-btn bb-studio-ctrl-btn--stop" onClick={onStop}>
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}

// ─── Main Simulator Page ─────────────────────────────────────────────────────
const INIT_STATS = { time: 0, dist: 0, battery: 100, avoided: 0, progress: 0 };

export default function SimulatorPage({ robotConfig, robotCode = [], preflight, onFpsUpdate }) {
  const [running, setRunning] = useState(false);
  const [paused,  setPaused]  = useState(false);
  const [stats,   setStats]   = useState(INIT_STATS);
  const [activeChallenge, setActiveChallenge] = useState(CHALLENGES[0]);
  const [showPreflight, setShowPreflight]     = useState(false);
  const [fps, setFps]                         = useState(null);
  const [execBlock, setExecBlock]             = useState(null);
  const simKeyRef = useRef(0);
  const [simKey, setSimKey] = useState(0);

  // Forward FPS up to parent
  const handleFps = useCallback((f) => {
    setFps(f);
    onFpsUpdate?.(f);
  }, [onFpsUpdate]);

  const handleProgress = useCallback((data) => {
    setStats({
      time:     data.time,
      dist:     data.dist,
      battery:  data.battery,
      avoided:  data.avoided,
      progress: data.progress,
    });
    if (data.execBlock !== undefined) setExecBlock(data.execBlock);
    if (data.done) {
      setRunning(false);
      setPaused(false);
      setExecBlock(null);
    }
  }, []);

  const doStart = useCallback((challenge) => {
    if (challenge && challenge.id) setActiveChallenge(challenge);
    setStats(INIT_STATS);
    simKeyRef.current += 1;
    setSimKey(simKeyRef.current);
    setRunning(true);
    setPaused(false);
    setExecBlock(null);
    setShowPreflight(false);
  }, []);

  // Clicking Launch opens preflight, or starts directly if already ok
  const handleLaunchClick = useCallback((challenge) => {
    if (preflight) {
      setShowPreflight(true);
    } else {
      doStart(challenge);
    }
  }, [preflight, doStart]);

  const handlePause = useCallback(() => setPaused(p => !p), []);

  const handleStop = useCallback(() => {
    setRunning(false);
    setPaused(false);
    setStats(INIT_STATS);
    simKeyRef.current += 1;
    setSimKey(simKeyRef.current);
    setExecBlock(null);
  }, []);

  const preflightChecks = preflight?.checks || [];
  const canRun = preflight ? preflight.canRun : true;
  const hasWarnings = (preflight?.warnings?.length || 0) > 0;

  return (
    <div className="bb-studio-sim">
      {/* Center: 3D sim */}
      <div className="bb-studio-sim-center">
        <div className="bb-studio-sim-toolbar">
          <button className="bb-studio-vp-btn bb-studio-vp-btn--back">← Build</button>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#333' }}>
            🏁 {activeChallenge.name}
          </span>
          {!running ? (
            <button className="bb-studio-vp-btn bb-studio-vp-btn--test" onClick={() => doStart()}>
              ▶ Start Simulation
            </button>
          ) : paused ? (
            <button className="bb-studio-vp-btn bb-studio-vp-btn--test" onClick={handlePause}>▶ Resume</button>
          ) : (
            <button
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', background: '#fff3e0', color: '#e65c00', fontSize: 12 }}
              onClick={handlePause}
            >
              ⏸ Pause
            </button>
          )}
        </div>

        {/* 3D canvas */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <SimCanvas
            key={simKey}
            robotConfig={robotConfig}
            robotCode={robotCode}
            running={running}
            paused={paused}
            onProgress={handleProgress}
            onFpsUpdate={handleFps}
            challenge={activeChallenge}
          />

          {/* FPS monitor — top-left corner when running */}
          {running && fps !== null && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
              color: fps >= 50 ? '#22c55e' : fps >= 30 ? '#f97316' : '#ef4444',
              fontSize: 10, fontWeight: 800, fontFamily: 'monospace',
              padding: '3px 8px', borderRadius: 6,
              pointerEvents: 'none',
            }}>
              {fps} FPS
            </div>
          )}

          {/* Now executing block indicator */}
          {running && execBlock && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '5px 14px', borderRadius: 20,
              border: '1px solid rgba(124,58,237,0.6)',
              pointerEvents: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', animation: 'bb-pulse 1s infinite' }} />
              Running: {execBlock}
            </div>
          )}

          {/* Preflight checklist overlay */}
          {showPreflight && (
            <div className="bb-studio-sim-overlay" style={{ backdropFilter: 'blur(6px)' }}>
              <div style={{
                background: '#0f172a', borderRadius: 16,
                border: '1px solid rgba(124,58,237,0.5)',
                padding: '24px 28px', maxWidth: 360, width: '90%',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🛠 Pre-Flight Check</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                  Making sure your robot is ready to go!
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {preflightChecks.map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: c.pass ? 'rgba(34,197,94,0.1)' : c.warn ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${c.pass ? '#22c55e' : c.warn ? '#f97316' : '#ef4444'}33`,
                    }}>
                      <span style={{ fontSize: 16 }}>{c.pass ? '✅' : c.warn ? '⚠️' : '❌'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{c.label}</div>
                        <div style={{ color: '#94a3b8', fontSize: 10 }}>{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setShowPreflight(false)}
                    style={{ flex: 1, padding: '9px 16px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                  >
                    ← Go Back
                  </button>
                  {(canRun || hasWarnings) && (
                    <button
                      onClick={() => doStart(activeChallenge)}
                      style={{
                        flex: 1, padding: '9px 16px', borderRadius: 10, border: 'none',
                        background: canRun
                          ? 'linear-gradient(135deg,#22c55e,#15803d)'
                          : 'linear-gradient(135deg,#f97316,#c2410c)',
                        color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      {canRun ? '▶ Launch!' : '⚠ Launch Anyway'}
                    </button>
                  )}
                  {!canRun && !hasWarnings && (
                    <div style={{ flex: 1, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontWeight: 700, fontSize: 12, textAlign: 'center' }}>
                      Fix issues first!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Start prompt overlay */}
          {!running && !showPreflight && stats.progress === 0 && (
            <div className="bb-studio-sim-overlay">
              <div className="bb-studio-sim-start-cue">
                <div className="bb-studio-sim-start-icon">{activeChallenge.icon}</div>
                <div className="bb-studio-sim-start-title">{activeChallenge.name}</div>
                <div className="bb-studio-sim-start-sub">{activeChallenge.desc}</div>
                <button
                  onClick={() => handleLaunchClick(activeChallenge)}
                  style={{
                    marginTop: 20, padding: '12px 32px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg,#00c851,#00a843)', color: '#fff',
                    fontWeight: 900, fontSize: 15, cursor: 'pointer',
                  }}
                >
                  ▶ Launch!
                </button>
              </div>
            </div>
          )}

          {/* Completion overlay */}
          {!running && stats.progress >= 100 && (
            <div className="bb-studio-sim-overlay">
              <div className="bb-studio-sim-start-cue" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 60, marginBottom: 10 }}>🏆</div>
                <div className="bb-studio-sim-start-title">Challenge Complete!</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '8px 0 16px' }}>
                  Time: {Math.floor(stats.time / 60).toString().padStart(2, '0')}:{Math.floor(stats.time % 60).toString().padStart(2, '0')} ·
                  Distance: {stats.dist.toFixed(1)}m
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => doStart()}
                    style={{ flex: 1, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🔁 Play Again
                  </button>
                  <button
                    onClick={handleStop}
                    style={{ flex: 1, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: stats */}
      <StatsPanel
        running={running}
        paused={paused}
        stats={stats}
        challenge={activeChallenge}
        onStart={doStart}
        onPause={handlePause}
        onStop={handleStop}
      />
    </div>
  );
}
