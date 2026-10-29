import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSimWebGLRenderer } from '../services/art-direction.js';
import { buildRobotModel, normalizeRobotBuildConfig } from '../services/studio-robot-builder.js';
import { animateAddons } from '../services/robotAddons.js';

/** Live 3D turntable for the Robot Workshop: the real Robot Studio model, drag to spin. */
export default function WorkshopPreview({ config, bounce = 0 }) {
  const hostRef = useRef(null);
  const state = useRef({});

  useEffect(() => {
    const host = hostRef.current;
    const renderer = createSimWebGLRenderer({ antialias: true });
    if (!renderer) return undefined;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b1f3b);
    scene.fog = new THREE.Fog(0x1b1f3b, 9, 22);
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x312e81, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(3, 7, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rimA = new THREE.DirectionalLight(0xa78bfa, 1.4); rimA.position.set(-5, 3, -4); scene.add(rimA);
    const rimB = new THREE.DirectionalLight(0x22d3ee, 0.9); rimB.position.set(5, 2, -3); scene.add(rimB);

    // Garage turntable: dark disc, glowing ring, grid floor
    const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 64), new THREE.MeshStandardMaterial({ color: 0x23284d, roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.01; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(24, 32, 0x4c51a8, 0x2e3367); grid.position.y = 0; scene.add(grid);
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.16, 64), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.6 }));
    table.position.y = 0.08; table.receiveShadow = true; scene.add(table);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.03, 8, 96), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 1.6 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.16; scene.add(ring);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    const holder = new THREE.Group();
    holder.position.y = 0.16;
    scene.add(holder);
    const resize = () => {
      const w = host.clientWidth || 400, h = host.clientHeight || 400;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let spin = 0.5, drag = null, raf, t = 0;
    const down = (e) => { drag = e.clientX; };
    const move = (e) => { if (drag != null) { holder.rotation.y += (e.clientX - drag) * 0.01; drag = e.clientX; spin = 0; } };
    const up = () => { if (drag != null) setTimeout(() => { spin = 0.5; }, 1600); drag = null; };
    renderer.domElement.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; t += dt;
      holder.rotation.y += spin * dt;
      const s = state.current;
      const model = holder.children[0];
      if (model) {
        model.userData.animate?.(t, dt);
        animateAddons(model, dt);
      }
      if (s.pop > 0) { s.pop = Math.max(0, s.pop - dt * 2.4); holder.position.y = 0.16 + Math.sin(s.pop * Math.PI) * 0.3; }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    state.current = { holder, camera, pop: 0 };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const key = JSON.stringify(config);
  useEffect(() => {
    const { holder, camera } = state.current;
    if (!holder) return;
    holder.children.forEach((c) => c.traverse((n) => { n.geometry?.dispose?.(); }));
    holder.clear();
    let model;
    try { model = buildRobotModel(normalizeRobotBuildConfig({ sensors: [], tools: [], ...config })); } catch { return; }
    model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    if (model.userData.animate) for (let i = 1; i <= 20; i++) model.userData.animate(i * 0.05, 0.05);
    // Fit any robot (tiny Pac-Bot or tall Humanoid) to the turntable
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const k = 2.3 / Math.max(size.x, size.y * 0.85, size.z, 0.5);
    model.scale.multiplyScalar(k);
    model.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(model);
    model.position.y -= b2.min.y;
    holder.add(model);
    const h = (b2.max.y - b2.min.y);
    camera.position.set(0, 1.2 + h * 0.45, 5.6 + h * 0.35);
    camera.lookAt(0, 0.2 + h * 0.42, 0);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (bounce) state.current.pop = 1; }, [bounce]);

  return <div ref={hostRef} className="cs-preview3d cs-preview3d--garage" aria-label="3D preview of your robot — drag to spin" />;
}
