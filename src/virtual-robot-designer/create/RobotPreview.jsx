import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSimWebGLRenderer } from '../services/art-direction.js';
import { buildDesignedRobot } from './designedRobot.js';

/** Live 3D turntable for the Robot Designer. Drag to spin; it slowly turns by itself. */
export default function RobotPreview({ design, primary, accent, led, bounce = 0 }) {
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
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef2ff);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 1.3));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(3, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xa78bfa, 1.2);
    rim.position.set(-4, 3, -4);
    scene.add(rim);
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.14, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
    stage.position.y = -0.07;
    stage.receiveShadow = true;
    scene.add(stage);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.025, 8, 64), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.8 }));
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 1.6, 4.3);
    camera.lookAt(0, 0.65, 0);
    const holder = new THREE.Group();
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
    let spin = 0.6, drag = null, raf;
    const down = (e) => { drag = e.clientX; };
    const move = (e) => { if (drag != null) { holder.rotation.y += (e.clientX - drag) * 0.01; drag = e.clientX; spin = 0; } };
    const up = () => { drag = null; setTimeout(() => { spin = 0.6; }, 1500); };
    renderer.domElement.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      holder.rotation.y += spin * dt;
      const s = state.current;
      if (s.pop > 0) { s.pop = Math.max(0, s.pop - dt * 2.5); holder.position.y = Math.sin(s.pop * Math.PI) * 0.35; }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    state.current = { holder, pop: 0 };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const { holder } = state.current;
    if (!holder) return;
    holder.children.forEach((c) => {
      c.traverse((n) => { n.geometry?.dispose?.(); if (n.material) [].concat(n.material).forEach((m) => { m.map?.dispose?.(); m.dispose?.(); }); });
    });
    holder.clear();
    const model = buildDesignedRobot(design, primary, accent, led);
    model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(model);
    const h = box.max.y - box.min.y;
    const k = h > 1.7 ? 1.7 / h : 1;
    model.scale.setScalar(k);
    holder.add(model);
  }, [design, primary, accent, led]);

  useEffect(() => { if (bounce) state.current.pop = 1; }, [bounce]);

  return <div ref={hostRef} className="cs-preview3d" aria-label="3D preview of your robot — drag to spin" />;
}
