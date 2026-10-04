import * as THREE from 'three';
import { applyStudioPaint } from '../src/virtual-robot-designer/services/studio-robot-builder.js';

describe('studio paint', () => {
  test('recolors a body mesh to the chosen hex', () => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff8c00 }),
    );
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x111111 }),
    );
    wheel.userData.isWheel = true;
    group.add(body, wheel);

    applyStudioPaint(group, '#1E90FF', '#FFD700', '#ff3333');
    expect(body.material.color.getHexString()).toBe('1e90ff');
    expect(wheel.material.color.getHexString()).toBe('ff3333');
  });
});
