/**
 * CapstoneArenaBuilder — Mode 10 mega-courses with labeled zone arches (Visual Bible Part 3 capstones).
 */
import * as THREE from 'three';
import { arenaMover } from './ArenaBuilderCore.js';

export const CAPSTONE_ZONES = {
  martian: ['MOUNTAIN', 'MUD', 'LOG', 'BOULDERS', 'TRENCH', 'DUNES', 'QUAKE', 'RAMP', 'WILDERNESS', 'FINISH'],
  industrial: ['ASSEMBLY', 'STACK', 'QC', 'AGV', 'HAZMAT', 'ALARM', 'WRAP', 'SYNC', 'STAMP', 'INDUSTRY 4.0'],
  underwater: ['REEF', 'TRENCH', 'KELP', 'WRECK', 'CURRENT', 'SONAR', 'CLEANUP', 'BIO', 'VENT', 'PEARL'],
  emergency: ['BLAZE', 'SMOKE', 'HYDRANT', 'CHEMICAL', 'LADDER', 'WILDFIRE', 'GAS', 'SIREN', 'FLASH', 'CHIEF'],
  sky_aerial: ['RINGS', 'ALTITUDE', 'DIVE', 'FORMATION', 'ASCENT', 'DELIVERY', 'PHOTO', 'WIND', 'ROLL', 'SKY ACE'],
  hybrid_race_sky: ['FPV', 'TUNNEL', 'DRIFT', 'SPEED', 'SLALOM', 'BATTERY', 'BARREL', 'GHOST', 'LOW ALT', 'SKY PRIX'],
  cyber_ninja: ['LASERS', 'CLOAK', 'SILENT', 'DASH', 'NV', 'GUARDS', 'HACK', 'RECON', 'FLARE', 'DARK OPS'],
  spider_climber: ['WEB', 'PIPE', 'CEILING', 'TRAP', 'SLALOM', 'HIGH STEP', 'VIBRATE', 'DASH', 'IK GAIT', 'QUEEN'],
  sandbox: ['TEST', 'OBSTACLE', 'SENSOR', 'BLOCKS', 'SPEED', 'TOOLS', 'LOGIC', 'COMMUNITY', 'DUEL', 'SHOWCASE'],
};

const ZONE_GROUND = {
  martian: [0xc1440e, 0x8b4513, 0x6b8e23, 0x78716c, 0x57534e, 0xd4a050, 0xdc2626, 0x9e8060, 0x65a30d, 0xffd700],
  industrial: [0x3b82f6, 0xf97316, 0xef4444, 0x22c55e, 0xfbbf24, 0xdc2626, 0x64748b, 0xec4899, 0xf59e0b, 0xffd700],
  underwater: [0x0d9488, 0x021a30, 0x15803d, 0x8a7055, 0x0369a1, 0x164e63, 0x22c55e, 0x06b6d4, 0xfbbf24, 0xe0f2fe],
  emergency: [0xdc2626, 0x374151, 0x06b6d4, 0x22c55e, 0xf97316, 0xea580c, 0xfbbf24, 0x1e40af, 0xff4400, 0xffd700],
  sky_aerial: [0x06b6d4, 0x38bdf8, 0xef4444, 0x0ea5e9, 0xa855f7, 0x22c55e, 0xfbbf24, 0x94a3b8, 0xec4899, 0xffd700],
  hybrid_race_sky: [0x06b6d4, 0x7c3aed, 0xec4899, 0xfbbf24, 0x22d3ee, 0x22c55e, 0xa855f7, 0x64748b, 0x0ea5e9, 0xffd700],
  cyber_ninja: [0xef4444, 0x06b6d4, 0x64748b, 0xec4899, 0x22c55e, 0xfbbf24, 0x22c55e, 0x06b6d4, 0xff4400, 0x7c3aed],
  spider_climber: [0xffffff, 0x78716c, 0xa855f7, 0xff8800, 0x9e8060, 0x57534e, 0xdc2626, 0x06b6d4, 0xea580c, 0xffd700],
  sandbox: [0xef4444, 0xf97316, 0x22c55e, 0x3b82f6, 0xfbbf24, 0x8b5cf6, 0x10b981, 0xec4899, 0xdc2626, 0xffd700],
};

function makeArchLabel(text, sub = 'CAPSTONE') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  ctx.roundRect(8, 8, 496, 112, 12);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 52);
  ctx.font = '16px system-ui,sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(sub, 256, 88);
  return new THREE.CanvasTexture(c);
}

export function buildCapstoneDecor(scene, family, curve, zoneCount = 10) {
  const labels = CAPSTONE_ZONES[family] || CAPSTONE_ZONES.sandbox;
  const grounds = ZONE_GROUND[family] || ZONE_GROUND.sandbox;
  const g = new THREE.Group();
  g.name = 'CapstoneCourse';

  for (let i = 0; i < zoneCount; i++) {
    const t = (i + 0.5) / zoneCount;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 5),
      new THREE.MeshStandardMaterial({
        color: grounds[i % grounds.length],
        emissive: grounds[i % grounds.length],
        emissiveIntensity: 0.12,
        roughness: 0.92,
      }),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.rotation.z = yaw;
    strip.position.set(p.x, 0.02, p.z);
    g.add(strip);

    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.12, 8, 24, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.9, metalness: 0.4,
      }),
    );
    arch.rotation.y = yaw;
    arch.position.set(p.x, 1.4, p.z);
    g.add(arch);

    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({
        map: makeArchLabel(labels[i] || `ZONE ${i + 1}`),
        transparent: true,
        depthWrite: false,
      }),
    );
    lbl.position.set(p.x, 3.2, p.z);
    lbl.rotation.y = yaw;
    g.add(lbl);

    [-2.8, 2.8].forEach((ox) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 2.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.6 }),
      );
      const lx = p.x + Math.cos(yaw + Math.PI / 2) * ox;
      const lz = p.z + Math.sin(yaw + Math.PI / 2) * ox;
      post.position.set(lx, 1.3, lz);
      g.add(post);
    });
  }

  const trophy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xfbbf24, emissiveIntensity: 0.8, metalness: 0.7 }),
  );
  const endP = curve.getPoint(1);
  trophy.position.set(endP.x, 0.7, endP.z);
  g.add(trophy);
  arenaMover(scene, (t) => {
    trophy.rotation.y = t * 0.8;
    trophy.position.y = 0.7 + Math.sin(t * 2) * 0.08;
  });

  scene.add(g);
  scene.userData.capstoneCourse = true;
  scene.userData.capstoneZones = labels;
  return g;
}

export function isCapstoneMode(challenge) {
  return Number(challenge?.modeIndex) === 10 && challenge?.isChassisMode;
}
