import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { migrateDesign } from '../config.js';
import { buildRobotFromDesign } from '../three/buildRobotFromDesign.js';
import { collectAnimatables } from '../three/collectAnimatables.js';
import { animatePreviewFrame } from '../three/animatePreviewFrame.js';

function createStarfield(count = 420) {
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const r = 4 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
    pos[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.02 + Math.random() * 0.06;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geom, mat);
}

/** Real WebGL 3D preview with bloom, neon, and animated parts */
export default function RobotPreview3D({ design, autoSpin = true }) {
  const mountRef = useRef(null);
  const robotHolderRef = useRef(null);
  const disposeRobotRef = useRef(null);
  const animatablesRef = useRef([]);
  const composerRef = useRef(null);
  const neonLightsRef = useRef([]);
  const glowColorRef = useRef('#8B00FF');
  const frameRef = useRef(null);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  const [spinning, setSpinning] = useState(autoSpin);
  const [zoom, setZoom] = useState(1);
  const [userYaw, setUserYaw] = useState(0);
  const [userPitch, setUserPitch] = useState(0.15);
  const spinRef = useRef(autoSpin);
  const zoomRef = useRef(1);
  const yawRef = useRef(0);
  const pitchRef = useRef(0.15);

  useEffect(() => { spinRef.current = spinning; }, [spinning]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { yawRef.current = userYaw; }, [userYaw]);
  useEffect(() => { pitchRef.current = userPitch; }, [userPitch]);

  const d = migrateDesign(design);
  const glow = d.chassis?.color || d.cosmetics?.primaryColor || '#8B00FF';
  glowColorRef.current = glow;

  const rebuildRobot = useCallback(() => {
    const holder = robotHolderRef.current;
    if (!holder) return;

    if (disposeRobotRef.current) {
      disposeRobotRef.current();
      disposeRobotRef.current = null;
    }
    while (holder.children.length > 0) {
      holder.remove(holder.children[0]);
    }

    const built = buildRobotFromDesign(d);
    holder.add(built.group);
    disposeRobotRef.current = built.dispose;
    animatablesRef.current = collectAnimatables(built.group);
    glowColorRef.current = built.glowColor || glow;

    neonLightsRef.current.forEach((light) => {
      if (light?.color) light.color.set(built.glowColor || glow);
    });
  }, [design, glow]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050510');
    scene.fog = new THREE.FogExp2('#050510', 0.08);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0.35, 0.55, 5.2);
    camera.lookAt(0, 0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.35, 0.72);
    composer.addPass(bloom);
    composerRef.current = composer;

    scene.add(new THREE.AmbientLight(0x4040aa, 0.35));
    scene.add(new THREE.HemisphereLight(0x8b00ff, 0x080818, 0.5));

    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);

    const neon1 = new THREE.PointLight(0x8b00ff, 2.2, 14);
    neon1.position.set(-3.5, 2.5, 3);
    scene.add(neon1);

    const neon2 = new THREE.PointLight(0xff006e, 1.6, 14);
    neon2.position.set(3.5, 1.5, -2.5);
    scene.add(neon2);

    const neon3 = new THREE.PointLight(0x00d4ff, 1.1, 10);
    neon3.position.set(0, -1, 4);
    scene.add(neon3);
    neonLightsRef.current = [neon1, neon2, neon3];

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(5, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a1e,
        metalness: 0.92,
        roughness: 0.18,
        emissive: 0x1a0a3a,
        emissiveIntensity: 0.25,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.68;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(8, 32, 0x8b00ff, 0x151530);
    grid.position.y = -0.67;
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    scene.add(grid);

    const holoRing = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.45, 64),
      new THREE.MeshBasicMaterial({
        color: 0x8b00ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    holoRing.rotation.x = -Math.PI / 2;
    holoRing.position.y = -0.66;
    scene.add(holoRing);

    const stars = createStarfield();
    scene.add(stars);

    const driftParticles = createStarfield(120);
    driftParticles.position.y = 0.5;
    scene.add(driftParticles);

    const holder = new THREE.Group();
    scene.add(holder);
    robotHolderRef.current = holder;

    const resize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let t0 = performance.now();
    const animate = (now) => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;

      animatePreviewFrame(animatablesRef.current, now, dt);

      if (holder) {
        if (spinRef.current) {
          holder.rotation.y += dt * 0.5;
          holder.rotation.x = THREE.MathUtils.lerp(holder.rotation.x, 0, 0.08);
        } else {
          holder.rotation.y = yawRef.current;
          holder.rotation.x = pitchRef.current;
        }
        holder.position.y = Math.sin(now * 0.0018) * 0.08;
      }

      const orbitT = now * 0.00035;
      neon1.position.x = Math.cos(orbitT) * 3.8;
      neon1.position.z = Math.sin(orbitT) * 3.8;
      neon2.position.x = Math.cos(orbitT + 2.1) * 3.2;
      neon2.position.z = Math.sin(orbitT + 2.1) * 3.2;
      holoRing.rotation.z += dt * 0.35;
      holoRing.material.opacity = 0.15 + Math.sin(now * 0.002) * 0.08;
      stars.rotation.y += dt * 0.015;
      driftParticles.rotation.y -= dt * 0.04;
      driftParticles.rotation.x = Math.sin(now * 0.0005) * 0.1;

      const sway = Math.sin(now * 0.0007) * 0.12;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.15 + sway, 0.05);
      camera.position.y = 0.62 + Math.sin(now * 0.001) * 0.06;
      camera.position.z = 5.2 / zoomRef.current;
      camera.lookAt(0, 0.05, 0);

      composer.render();
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
      if (disposeRobotRef.current) disposeRobotRef.current();
      composer.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      robotHolderRef.current = null;
      composerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSpinning(autoSpin);
    spinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    rebuildRobot();
  }, [rebuildRobot]);

  const onPointerDown = (e) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.style.cursor = 'grabbing';
    setSpinning(false);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    setUserYaw((y) => y + dx * 0.01);
    setUserPitch((p) => Math.max(-0.6, Math.min(0.6, p + dy * 0.008)));
  };

  const onPointerUp = (e) => {
    dragRef.current.active = false;
    e.currentTarget.style.cursor = 'grab';
  };

  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.55, Math.min(1.9, z + (e.deltaY > 0 ? -0.08 : 0.08))));
  };

  const resetView = () => {
    setZoom(1);
    setUserYaw(0);
    setUserPitch(0.15);
    setSpinning(autoSpin);
    spinRef.current = autoSpin;
  };

  return (
    <div className="vrd-preview-wrap vrd-preview-wrap--wow" style={{ '--vrd-glow-color': glow }}>
      <div className="vrd-preview-particles" aria-hidden />
      <div className="vrd-preview-scanlines" aria-hidden />
      <div
        className="vrd-preview-stage vrd-preview-stage--webgl"
        ref={mountRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={resetView}
        role="img"
        aria-label="3D robot preview with bloom effects"
      />
      <div className="vrd-preview-vignette" aria-hidden />
      <div className="vrd-preview-controls">
        <button type="button" className="vrd-preview-ctrl" onClick={() => { setSpinning(false); setUserYaw((a) => a - 0.25); }} title="Rotate left">←</button>
        <button type="button" className="vrd-preview-ctrl" onClick={() => setSpinning((s) => !s)} title="Toggle spin">
          {spinning ? '⏸' : '⟳'}
        </button>
        <button type="button" className="vrd-preview-ctrl" onClick={() => { setSpinning(false); setUserYaw((a) => a + 0.25); }} title="Rotate right">→</button>
        <button type="button" className="vrd-preview-ctrl" onClick={() => setZoom((z) => Math.min(1.9, z + 0.1))}>+</button>
        <button type="button" className="vrd-preview-ctrl" onClick={() => setZoom((z) => Math.max(0.55, z - 0.1))}>−</button>
        <button type="button" className="vrd-preview-ctrl" onClick={resetView} title="Reset">↺</button>
      </div>
      <div className="vrd-preview-badge vrd-preview-badge--pulse">🤖 YOUR ROBOT</div>
      <p className="vrd-preview-hint">Drag · Scroll zoom · Double-click reset</p>
    </div>
  );
}
