/**
 * PremiumBiomeEnhancements.js — High-quality landmark and environment builders
 * Upgrades tracks to match concept art visual style with:
 * - Premium landmark geometry (crystals, flowers, temples, etc.)
 * - Enhanced lighting and glow effects
 * - Particle systems (sparkles, mist, ash, etc.)
 * - Material quality (PBR with proper roughness, metallic, emissive)
 */

import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM CRYSTAL BUILDER — Crystal Cavern Ultra
// ═══════════════════════════════════════════════════════════════════════════

export function buildPremiumCrystal(position, size = 1, color = 0x00FFFF) {
  const group = new THREE.Group();
  
  // Main crystal body with multiple facets
  const geometry = new THREE.IcosahedronGeometry(size, 4); // High-poly
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.2,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.95,
    envMapIntensity: 1.5,
  });
  
  const crystal = new THREE.Mesh(geometry, material);
  crystal.castShadow = true;
  crystal.receiveShadow = true;
  group.add(crystal);
  
  // Glow halo
  const glowGeo = new THREE.IcosahedronGeometry(size * 1.3, 3);
  const glowMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);
  
  group.position.copy(position);
  group.userData.animType = 'crystal-pulse';
  
  return group;
}

export function createCrystalCluster(center, count = 5, radius = 10) {
  const group = new THREE.Group();
  const colors = [0x00FFFF, 0x00FF88, 0x8800FF, 0xFF00FF];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = Math.random() * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = Math.random() * 8;
    
    const pos = new THREE.Vector3(center.x + x, center.y + y, center.z + z);
    const size = 0.8 + Math.random() * 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    group.add(buildPremiumCrystal(pos, size, color));
  }
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM FLOWER BUILDER — Sky Garden Flora
// ═══════════════════════════════════════════════════════════════════════════

export function buildGiantFlower(position, scale = 1) {
  const group = new THREE.Group();
  
  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 8 * scale, 8);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x2D5016,
    roughness: 0.7,
    metalness: 0.1,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 4 * scale;
  stem.castShadow = true;
  group.add(stem);
  
  // Flower petals (5 large petals)
  const petalColors = [0xFF69B4, 0xFF85C0, 0xFF5FA3];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petGeo = new THREE.SphereGeometry(1.2 * scale, 12, 12);
    const petalColor = petalColors[i % petalColors.length];
    const petMat = new THREE.MeshStandardMaterial({
      color: petalColor,
      emissive: petalColor,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.0,
    });
    
    const petal = new THREE.Mesh(petGeo, petMat);
    petal.scale.set(0.7, 1, 0.6);
    petal.position.x = Math.cos(angle) * 2.2 * scale;
    petal.position.z = Math.sin(angle) * 2.2 * scale;
    petal.position.y = 9 * scale;
    petal.castShadow = true;
    petal.rotation.x = Math.PI * 0.3;
    group.add(petal);
  }
  
  // Center stamen
  const stamenGeo = new THREE.SphereGeometry(0.6 * scale, 16, 16);
  const stamenMat = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    emissive: 0xFFD700,
    emissiveIntensity: 0.6,
    roughness: 0.4,
    metalness: 0.2,
  });
  const stamen = new THREE.Mesh(stamenGeo, stamenMat);
  stamen.position.y = 8.8 * scale;
  stamen.castShadow = true;
  group.add(stamen);
  
  group.position.copy(position);
  group.userData.animType = 'flower-sway';
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM TEMPLE ARCH BUILDER — Jungle Ruins
// ═══════════════════════════════════════════════════════════════════════════

export function buildTempleArch(position, width = 6, height = 5) {
  const group = new THREE.Group();
  
  // Stone material
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.85,
    metalness: 0.05,
    emissive: 0x1A0F00,
    emissiveIntensity: 0.15,
  });
  
  // Left pillar
  const pillarGeo = new THREE.BoxGeometry(0.8, height, 0.8);
  const leftPillar = new THREE.Mesh(pillarGeo, stoneMat.clone());
  leftPillar.position.x = -width / 2;
  leftPillar.castShadow = true;
  group.add(leftPillar);
  
  // Right pillar
  const rightPillar = new THREE.Mesh(pillarGeo, stoneMat.clone());
  rightPillar.position.x = width / 2;
  rightPillar.castShadow = true;
  group.add(rightPillar);
  
  // Arch (torus segment)
  const archGeo = new THREE.TorusGeometry(width / 2.2, 0.6, 16, 32, 0, Math.PI);
  const arch = new THREE.Mesh(archGeo, stoneMat.clone());
  arch.position.y = height * 0.4;
  arch.rotation.x = Math.PI * 0.5;
  arch.castShadow = true;
  group.add(arch);
  
  // Carved detail at top
  const detailGeo = new THREE.BoxGeometry(width * 1.1, 0.4, 0.5);
  const detail = new THREE.Mesh(detailGeo, stoneMat.clone());
  detail.position.y = height * 0.5 + 0.3;
  detail.castShadow = true;
  group.add(detail);
  
  group.position.copy(position);
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM VOLCANO LAVA FLOW — Volcanic Inferno
// ═══════════════════════════════════════════════════════════════════════════

export function buildLavaFlow(curve, t, width = 8, intensity = 1) {
  const group = new THREE.Group();
  
  const { pos, frame } = placeAtTrack(curve, t, 0, 0);
  
  // Glowing lava surface
  const lavaGeo = new THREE.PlaneGeometry(width, 12);
  const lavaMat = new THREE.MeshStandardMaterial({
    color: 0xFF4500,
    emissive: 0xFF6600,
    emissiveIntensity: 1.5 * intensity,
    roughness: 0.6,
    metalness: 0.8,
  });
  
  const lava = new THREE.Mesh(lavaGeo, lavaMat);
  lava.rotation.x = -Math.PI * 0.5;
  lava.position.copy(pos);
  lava.position.y = 0.05;
  group.add(lava);
  
  // Heat wave distortion (visual only via shader-like effect)
  group.userData.animType = 'lava-wave';
  group.userData.intensity = intensity;
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM NEON BILLBOARD — Cyber City
// ═══════════════════════════════════════════════════════════════════════════

export function buildNeonBillboard(position, width = 8, height = 6, text = 'NEON') {
  const group = new THREE.Group();
  
  // Billboard frame (dark metal)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.9,
  });
  
  const frameGeo = new THREE.BoxGeometry(width, height, 0.2);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.castShadow = true;
  group.add(frame);
  
  // Neon glow border
  const glowGeo = new THREE.EdgesGeometry(frameGeo);
  const glowMat = new THREE.LineBasicMaterial({
    color: 0x00FFFF,
    linewidth: 3,
  });
  const glowLine = new THREE.LineSegments(glowGeo, glowMat);
  group.add(glowLine);
  
  // Emissive panel
  const panelGeo = new THREE.PlaneGeometry(width * 0.9, height * 0.9);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    emissive: 0x00FFFF,
    emissiveIntensity: 0.8,
    side: THREE.FrontSide,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.z = 0.11;
  group.add(panel);
  
  group.position.copy(position);
  group.userData.animType = 'billboard-flicker';
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM ICE FORMATION — Frost Peak
// ═══════════════════════════════════════════════════════════════════════════

export function buildIceFormation(position, scale = 1) {
  const group = new THREE.Group();
  
  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xC0E0FF,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    emissive: 0x4080FF,
    emissiveIntensity: 0.4,
    envMapIntensity: 1.2,
  });
  
  // Random ice spikes
  for (let i = 0; i < 4; i++) {
    const coneGeo = new THREE.ConeGeometry(0.5 * scale, 3 * scale, 8);
    const spike = new THREE.Mesh(coneGeo, iceMat.clone());
    spike.position.x = (Math.random() - 0.5) * 2 * scale;
    spike.position.z = (Math.random() - 0.5) * 2 * scale;
    spike.position.y = 1.5 * scale;
    spike.rotation.x = Math.random() * 0.3;
    spike.castShadow = true;
    group.add(spike);
  }
  
  // Base ice platform
  const baseGeo = new THREE.IcosahedronGeometry(1.5 * scale, 3);
  const base = new THREE.Mesh(baseGeo, iceMat.clone());
  base.position.y = 0.5 * scale;
  base.castShadow = true;
  group.add(base);
  
  group.position.copy(position);
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM PARTICLE SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════

export function buildCrystalSparkles(count = 100, bounds) {
  const group = new THREE.Group();
  
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  const sparkleColors = [
    [0, 1, 1],     // Cyan
    [0, 1, 0.5],   // Green
    [1, 0, 1],     // Magenta
  ];
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * bounds.spanX;
    positions[i * 3 + 1] = Math.random() * bounds.spanY * 0.8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.spanZ;
    
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
    
    sizes[i] = Math.random() * 1.5 + 0.5;
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const particleMat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  
  const sparkles = new THREE.Points(particleGeo, particleMat);
  group.add(sparkles);
  group.userData.animType = 'sparkle-float';
  
  return group;
}

export function buildVolcanoAsh(count = 200, bounds) {
  const group = new THREE.Group();
  
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * bounds.spanX;
    positions[i * 3 + 1] = Math.random() * bounds.spanY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.spanZ;
    
    velocities[i * 3] = (Math.random() - 0.5) * 0.05;
    velocities[i * 3 + 1] = Math.random() * 0.02 + 0.01;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.userData.velocities = velocities;
  
  const ashMat = new THREE.PointsMaterial({
    color: 0x4a4a4a,
    size: 0.3,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  
  const ash = new THREE.Points(particleGeo, ashMat);
  group.add(ash);
  group.userData.animType = 'ash-drift';
  
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function animatePremiumBiome(group, time, arenaType) {
  group.traverse((child) => {
    const animType = child.userData?.animType;
    
    if (animType === 'crystal-pulse') {
      child.rotation.x = time * 0.5;
      child.rotation.y = time * 0.7;
      child.scale.set(
        1 + Math.sin(time * 2) * 0.1,
        1 + Math.sin(time * 2 + 1) * 0.1,
        1 + Math.sin(time * 2 + 2) * 0.1
      );
    } else if (animType === 'flower-sway') {
      child.rotation.z = Math.sin(time * 0.5) * 0.1;
    } else if (animType === 'lava-wave') {
      const material = child.material;
      if (material.emissiveIntensity) {
        material.emissiveIntensity = 1.3 + Math.sin(time * 2) * 0.3;
      }
    } else if (animType === 'billboard-flicker') {
      if (Math.random() > 0.95) {
        child.visible = !child.visible;
      }
    } else if (animType === 'sparkle-float') {
      const pos = child.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time + i) * 0.01;
      }
      child.geometry.attributes.position.needsUpdate = true;
    }
  });
}

export default {
  buildPremiumCrystal,
  createCrystalCluster,
  buildGiantFlower,
  buildTempleArch,
  buildLavaFlow,
  buildNeonBillboard,
  buildIceFormation,
  buildCrystalSparkles,
  buildVolcanoAsh,
  animatePremiumBiome,
};
