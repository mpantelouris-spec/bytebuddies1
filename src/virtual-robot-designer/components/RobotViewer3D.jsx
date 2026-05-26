/**
 * RobotViewer3D.jsx
 * Professional 3D rendering of robots with:
 * - Realistic vehicle geometries (Rover, Tank, Drone, etc)
 * - Real-time updates from config changes
 * - Professional lighting and shadows
 * - Interactive camera
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../styles/robot-viewer-3d.css';

// ============================================================================
// VEHICLE BUILDERS - Create realistic geometries
// ============================================================================

function createRoverChassis(color) {
  // Rover = Car-like, good balance
  const group = new THREE.Group();
  
  // Main body - rectangular box with rounded appearance
  const bodyGeom = new THREE.BoxGeometry(0.8, 0.5, 1.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.4,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 0.4;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Windshield area (darker band)
  const windGeom = new THREE.BoxGeometry(0.7, 0.2, 0.4);
  const windMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.6),
    metalness: 0.7,
    roughness: 0.3,
  });
  const windshield = new THREE.Mesh(windGeom, windMat);
  windshield.position.set(0, 0.7, 0.3);
  windshield.castShadow = true;
  group.add(windshield);

  return group;
}

function createTankChassis(color) {
  // Tank = Heavy, powerful, military look
  const group = new THREE.Group();

  // Main hull
  const hullGeom = new THREE.BoxGeometry(0.7, 0.6, 1.4);
  const hullMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.6,
    roughness: 0.3,
  });
  const hull = new THREE.Mesh(hullGeom, hullMat);
  hull.position.y = 0.35;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // Turret on top
  const turretGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 8);
  const turretMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.8),
    metalness: 0.5,
    roughness: 0.4,
  });
  const turret = new THREE.Mesh(turretGeom, turretMat);
  turret.position.y = 0.8;
  turret.castShadow = true;
  group.add(turret);

  // Gun barrel
  const barrelGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
  const barrelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#333333'),
    metalness: 0.8,
    roughness: 0.2,
  });
  const barrel = new THREE.Mesh(barrelGeom, barrelMat);
  barrel.rotation.z = Math.PI / 6;
  barrel.position.set(0.3, 0.9, 0.1);
  barrel.castShadow = true;
  group.add(barrel);

  return group;
}

function createDroneChassis(color) {
  // Drone = Compact, light
  const group = new THREE.Group();

  // Central body
  const bodyGeom = new THREE.BoxGeometry(0.6, 0.3, 0.6);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.5,
    roughness: 0.4,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 0.25;
  body.castShadow = true;
  group.add(body);

  // 4 arms extending outward
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const armGeom = new THREE.BoxGeometry(0.08, 0.08, 0.4);
    const armMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).multiplyScalar(0.7),
      metalness: 0.4,
      roughness: 0.5,
    });
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(
      Math.cos(angle) * 0.35,
      0.3,
      Math.sin(angle) * 0.35
    );
    arm.castShadow = true;
    group.add(arm);
  }

  return group;
}

function createHumanoidChassis(color) {
  // Humanoid = Two legs, torso, head-like
  const group = new THREE.Group();

  // Torso (upper body)
  const torsoGeom = new THREE.BoxGeometry(0.4, 0.6, 0.35);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.4,
    roughness: 0.5,
  });
  const torso = new THREE.Mesh(torsoGeom, torsoMat);
  torso.position.y = 0.6;
  torso.castShadow = true;
  group.add(torso);

  // Head
  const headGeom = new THREE.SphereGeometry(0.2, 8, 8);
  const headMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.9),
    metalness: 0.3,
    roughness: 0.6,
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = 1.3;
  head.castShadow = true;
  group.add(head);

  // Left leg
  const legGeom = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const legMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.85),
    metalness: 0.5,
    roughness: 0.4,
  });
  const leftLeg = new THREE.Mesh(legGeom, legMat);
  leftLeg.position.set(-0.15, 0.2, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Mesh(legGeom, legMat);
  rightLeg.position.set(0.15, 0.2, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  return group;
}

function createSpiderChassis(color) {
  // Spider = 6 legs, compact body
  const group = new THREE.Group();

  // Central body
  const bodyGeom = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.5,
    roughness: 0.4,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.y = 0.35;
  body.castShadow = true;
  group.add(body);

  // 6 legs
  const legPositions = [
    [-0.25, -0.1, -0.3], [0, -0.1, -0.35], [0.25, -0.1, -0.3],
    [-0.25, -0.1, 0.3], [0, -0.1, 0.35], [0.25, -0.1, 0.3],
  ];

  legPositions.forEach((pos) => {
    const legGeom = new THREE.BoxGeometry(0.06, 0.5, 0.06);
    const legMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).multiplyScalar(0.7),
      metalness: 0.6,
      roughness: 0.3,
    });
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    group.add(leg);
  });

  return group;
}

function createIndustrialChassis(color) {
  // Industrial = Heavy, large frame, powerful
  const group = new THREE.Group();

  // Main frame - large box
  const frameGeom = new THREE.BoxGeometry(0.9, 0.7, 1.6);
  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.7,
    roughness: 0.3,
  });
  const frame = new THREE.Mesh(frameGeom, frameMat);
  frame.position.y = 0.4;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  // Large gripper/manipulator arm
  const armGeom = new THREE.BoxGeometry(0.15, 1.0, 0.15);
  const armMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.75),
    metalness: 0.8,
    roughness: 0.2,
  });
  const arm = new THREE.Mesh(armGeom, armMat);
  arm.position.set(0.5, 0.8, 0);
  arm.castShadow = true;
  group.add(arm);

  return group;
}

// Get chassis builder function by type
function getChassisByType(type, color) {
  const builders = {
    'rover': createRoverChassis,
    'tank': createTankChassis,
    'drone': createDroneChassis,
    'humanoid': createHumanoidChassis,
    'spider': createSpiderChassis,
    'industrial': createIndustrialChassis,
  };
  return (builders[type] || createRoverChassis)(color);
}

// ============================================================================
// WHEELS BUILDER
// ============================================================================

function createWheels(count, color) {
  const wheels = [];
  const wheelRadius = 0.28;
  const wheelThickness = 0.15;

  const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 16);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.8,
    roughness: 0.2,
  });

  // Position wheels based on count
  const positions = {
    2: [[-0.35, 0.28, 0], [0.35, 0.28, 0]],
    3: [[-0.35, 0.28, -0.3], [0, 0.28, 0.35], [0.35, 0.28, -0.3]],
    4: [[-0.35, 0.28, -0.4], [-0.35, 0.28, 0.4], [0.35, 0.28, -0.4], [0.35, 0.28, 0.4]],
    6: [
      [-0.35, 0.28, -0.5], [-0.35, 0.28, 0], [-0.35, 0.28, 0.5],
      [0.35, 0.28, -0.5], [0.35, 0.28, 0], [0.35, 0.28, 0.5],
    ],
    8: [
      [-0.4, 0.28, -0.5], [-0.3, 0.28, -0.2], [-0.3, 0.28, 0.2], [-0.4, 0.28, 0.5],
      [0.4, 0.28, -0.5], [0.3, 0.28, -0.2], [0.3, 0.28, 0.2], [0.4, 0.28, 0.5],
    ],
  };

  const wheelPositions = positions[Math.min(count, 8)] || positions[4];
  
  wheelPositions.slice(0, count).forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    wheels.push(wheel);
  });

  return wheels;
}

// ============================================================================
// MAIN VIEWER COMPONENT
// ============================================================================

export default function RobotViewer3D({ robotConfig }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const robotGroupRef = useRef(null);
  const animationIdRef = useRef(null);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f23);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(2.5, 1.5, 2.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTS
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(4, 6, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.far = 100;
    scene.add(dirLight);

    // Accent light (cyan)
    const accentLight = new THREE.PointLight(0x00d9ff, 0.3);
    accentLight.position.set(-3, 3, 3);
    scene.add(accentLight);

    // PLATFORM
    const platformGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.08, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.y = -0.04;
    platform.receiveShadow = true;
    scene.add(platform);

    // Glow ring under platform
    const ringGeom = new THREE.TorusGeometry(1.2, 0.08, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00d9ff,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.y = 0.02;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Robot group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);
    robotGroupRef.current = robotGroup;

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Gentle rotation
      if (robotGroup.children.length > 0) {
        robotGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update robot when config changes
  useEffect(() => {
    if (!sceneRef.current || !robotGroupRef.current) return;

    // Clear old robot
    robotGroupRef.current.clear();

    // Build chassis
    const chassis = getChassisByType(robotConfig.chassis.type, robotConfig.chassis.color);
    robotGroupRef.current.add(chassis);

    // Build wheels
    if (robotConfig.movement.type === 'wheels') {
      const wheels = createWheels(robotConfig.movement.count, robotConfig.movement.color);
      wheels.forEach(w => robotGroupRef.current.add(w));
    }

    // Add sensor indicators (small glowing spheres)
    robotConfig.sensors.forEach((sensor, i) => {
      const sensorGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const sensorMat = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.8,
      });
      const sensorMesh = new THREE.Mesh(sensorGeom, sensorMat);
      sensorMesh.position.set(0.3, 0.8 + (i * 0.2), 0.5);
      robotGroupRef.current.add(sensorMesh);
    });

    // Add tool indicators (small boxes)
    robotConfig.tools.forEach((tool, i) => {
      const toolGeom = new THREE.BoxGeometry(0.15, 0.15, 0.15);
      const toolMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.6,
      });
      const toolMesh = new THREE.Mesh(toolGeom, toolMat);
      toolMesh.position.set(-0.3, 0.5 + (i * 0.2), -0.5);
      robotGroupRef.current.add(toolMesh);
    });

  }, [robotConfig]);

  return (
    <div className="robot-viewer-container">
      <div ref={containerRef} className="robot-viewer-canvas" />
      <div className="robot-viewer-label">
        {robotConfig.chassis.type.charAt(0).toUpperCase() + robotConfig.chassis.type.slice(1)}
      </div>
    </div>
  );
}
