import * as THREE from 'three';
import { migrateAssembly } from '../services/assembly-service.js';
import { getBlockType, gridToWorld, BLOCK_CELL } from '../data/block-parts.js';
import { tagAnim } from './collectAnimatables.js';
import { makeAccentMat } from './robotTemplates3D.js';
import { buildRobotFromAssembly } from './buildRobotFromAssembly.js';

function makeBlockMat(type) {
  const color = new THREE.Color(type.color || '#E3000B');
  const isLego = true;
  return new THREE.MeshStandardMaterial({
    color,
    metalness: isLego ? 0.05 : 0.55,
    roughness: isLego ? 0.72 : 0.28,
    emissive: color,
    emissiveIntensity: isLego ? 0.04 : (type.emissive ?? 0.25),
    transparent: !!type.transparent,
    opacity: type.transparent ? 0.82 : 1,
  });
}

function addConnectorStuds(group, mat, disposables) {
  const s = BLOCK_CELL * 0.12;
  [[-s, -s], [s, -s], [-s, s], [s, s]].forEach(([x, z]) => {
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(BLOCK_CELL * 0.06, BLOCK_CELL * 0.07, BLOCK_CELL * 0.05, 10), mat.clone());
    stud.position.set(x, BLOCK_CELL * 0.46, z);
    group.add(stud);
    disposables.push(stud.geometry, stud.material);
  });
}

function createBlockMesh(type, disposables) {
  const g = new THREE.Group();
  const mat = makeBlockMat(type);
  let mesh;

  switch (type.id) {
    case 'round':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(BLOCK_CELL * 0.42, BLOCK_CELL * 0.42, BLOCK_CELL * 0.85, 20), mat);
      break;
    case 'armor':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.95, BLOCK_CELL * 0.35, BLOCK_CELL * 0.95), mat);
      break;
    case 'hinge':
      mesh = new THREE.Mesh(new THREE.TorusGeometry(BLOCK_CELL * 0.25, BLOCK_CELL * 0.08, 8, 20), mat);
      mesh.rotation.x = Math.PI / 2;
      break;
    case 'wheel':
    case 'track':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(BLOCK_CELL * 0.38, BLOCK_CELL * 0.38, BLOCK_CELL * 0.22, 20), mat);
      mesh.rotation.z = Math.PI / 2;
      break;
    case 'motor':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.6, BLOCK_CELL * 0.6, BLOCK_CELL * 0.6), mat);
      break;
    case 'sensor':
    case 'lidar':
    case 'camera':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.55, BLOCK_CELL * 0.35, BLOCK_CELL * 0.45), mat);
      break;
    case 'ai_core':
      mesh = new THREE.Mesh(new THREE.OctahedronGeometry(BLOCK_CELL * 0.38, 0), mat);
      tagAnim(mesh, 'pulse', { base: 0.6, amp: 0.5 });
      break;
    case 'claw':
    case 'gripper': {
      const g = new THREE.Group();
      const arm = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.15, BLOCK_CELL * 0.7, BLOCK_CELL * 0.15), mat);
      g.add(arm);
      [-1, 1].forEach((s) => {
        const f = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.1, BLOCK_CELL * 0.25, BLOCK_CELL * 0.08), mat.clone());
        f.position.set(s * BLOCK_CELL * 0.12, -BLOCK_CELL * 0.35, 0);
        g.add(f);
        disposables.push(f.geometry, f.material);
      });
      disposables.push(arm.geometry, mat);
      return g;
    }
    case 'fusion':
    case 'battery': {
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.7, BLOCK_CELL * 0.55, BLOCK_CELL * 0.5), mat);
      g.add(box);
      if (type.id === 'fusion') {
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(BLOCK_CELL * 0.18, 1), makeAccentMat('#00d4ff', 1.2));
        g.add(core);
        tagAnim(core, 'pulse', { base: 0.8, amp: 0.6 });
        disposables.push(core.geometry, core.material);
      }
      disposables.push(box.geometry, mat);
      return g;
    }
    case 'antenna': {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(BLOCK_CELL * 0.04, BLOCK_CELL * 0.05, BLOCK_CELL * 0.9, 10), mat);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(BLOCK_CELL * 0.1, 10, 10), makeAccentMat('#ff006e', 0.9));
      tip.position.y = BLOCK_CELL * 0.5;
      tagAnim(tip, 'pulse', { base: 0.5, amp: 0.5 });
      g.add(pole, tip);
      disposables.push(pole.geometry, mat, tip.geometry, tip.material);
      return g;
    }
    case 'neon':
    case 'energy':
    case 'disco':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.88, BLOCK_CELL * 0.88, BLOCK_CELL * 0.88), mat);
      tagAnim(mesh, 'pulse', { base: type.emissive * 0.7, amp: type.emissive * 0.4 });
      break;
    default:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(BLOCK_CELL * 0.88, BLOCK_CELL * 0.88, BLOCK_CELL * 0.88), mat);
  }

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  disposables.push(mesh.geometry, mat);
  g.add(mesh);

  if (['cube', 'round', 'armor', 'neon', 'energy'].includes(type.id) || type.category === 'structure') {
    addConnectorStuds(g, mat, disposables);
  }

  if (type.emissive > 0.5) {
    const aura = new THREE.Mesh(
      new THREE.BoxGeometry(BLOCK_CELL * 0.94, BLOCK_CELL * 0.94, BLOCK_CELL * 0.94),
      new THREE.MeshBasicMaterial({ color: type.color, transparent: true, opacity: 0.08, side: THREE.BackSide }),
    );
    g.add(aura);
    disposables.push(aura.geometry, aura.material);
  }

  return g;
}

function addBlocksToGroup(group, blocks, disposables) {
  blocks.forEach((block) => {
    const type = getBlockType(block.type);
    if (!type) return;
    const mesh = createBlockMesh(type, disposables);
    const [wx, wy, wz] = gridToWorld(block.x, block.y, block.z);
    mesh.position.set(wx, wy, wz);
    mesh.rotation.y = THREE.MathUtils.degToRad(block.rotY || 0);
    group.add(mesh);
  });
}

/** Build robot from modular block grid — supports pure blocks and hybrid mode */
export function buildRobotFromBlocks(design) {
  const asm = migrateAssembly(design);
  const blocks = asm.blocks || [];
  const disposables = [];

  if (asm.buildMode === 'hybrid' && Object.values(asm.slots).some(Boolean)) {
    const baseBuilt = buildRobotFromAssembly(design);
    addBlocksToGroup(baseBuilt.group, blocks, disposables);
    const hybridDispose = () => {
      baseBuilt.dispose();
      disposables.forEach((x) => { try { x?.dispose?.(); } catch { /* ignore */ } });
    };
    return {
      ...baseBuilt,
      dispose: hybridDispose,
      glowColor: asm.base?.color || '#8B00FF',
    };
  }

  const group = new THREE.Group();

  if (blocks.length === 0) {
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(BLOCK_CELL * 0.5, BLOCK_CELL * 0.5, BLOCK_CELL * 0.5),
      makeAccentMat('#8B00FF', 0.3),
    );
    placeholder.position.y = BLOCK_CELL * 0.5;
    tagAnim(placeholder, 'pulse', { base: 0.2, amp: 0.15 });
    group.add(placeholder);
    disposables.push(placeholder.geometry, placeholder.material);
  } else {
    addBlocksToGroup(group, blocks, disposables);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 0.85, 48),
    new THREE.MeshBasicMaterial({ color: 0x8b00ff, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.02;
  tagAnim(ring, 'spin-y', { speed: 0.4 });
  group.add(ring);
  disposables.push(ring.geometry, ring.material);

  const dispose = () => {
    group.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => m.dispose());
    });
    disposables.forEach((x) => { try { x?.dispose?.(); } catch { /* ignore */ } });
  };

  return { group, dispose, glowColor: asm.base?.color || '#8B00FF', dims: { bodyW: 1.2, bodyH: 1, bodyD: 1.2 } };
}
