/**
 * Football ball physics — rolling, bouncing, kick impulses.
 */
import * as THREE from 'three';

export const BALL_CONFIG = {
  radius: 0.28,
  mass: 0.43,
  restitution: 0.62,
  linearDamping: 0.14,
  angularDamping: 0.32,
  friction: 0.48,
  groundY: 0.30,
};

export function createBallState(x = 0, z = 0) {
  return {
    x, y: BALL_CONFIG.groundY, z,
    vx: 0, vy: 0, vz: 0,
    spinX: 0, spinZ: 0,
    grounded: true,
    lastTouch: null,
    inGoal: false,
    kickCooldown: 0,
  };
}

/**
 * Classic 32-panel football: 12 black pentagons and 20 white hexagons laid out
 * as a truncated icosahedron, with darker stitched seams between panels.
 * Colours are painted per vertex on a finely subdivided sphere, so the pattern
 * sits exactly on the ball instead of a flat picture stretched around it.
 */
function createClassicBallGeometry(radius) {
  const geo = new THREE.IcosahedronGeometry(radius, 24);
  // Panel centres: icosahedron vertices (pentagons) and face centres (hexagons)
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const ip = ico.attributes.position;
  const pent = [];
  for (let i = 0; i < ip.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(ip, i).normalize();
    if (!pent.some((p) => p.distanceTo(v) < 1e-3)) pent.push(v);
  }
  const hex = [];
  for (let i = 0; i < ip.count; i += 3) {
    hex.push(new THREE.Vector3()
      .fromBufferAttribute(ip, i)
      .add(new THREE.Vector3().fromBufferAttribute(ip, i + 1))
      .add(new THREE.Vector3().fromBufferAttribute(ip, i + 2))
      .normalize());
  }
  const centres = [...pent.map((v) => ({ v, black: true })), ...hex.map((v) => ({ v, black: false }))];
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const black = new THREE.Color(0x141414);
  const white = new THREE.Color(0xf5f5f2);
  const seam = new THREE.Color(0x9a9a96);
  const d = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    let a1 = Infinity;
    let a2 = Infinity;
    let nearest = null;
    for (const c of centres) {
      const a = d.angleTo(c.v);
      if (a < a1) { a2 = a1; a1 = a; nearest = c; } else if (a < a2) a2 = a;
    }
    const col = a2 - a1 < 0.025 ? seam : (nearest.black ? black : white);
    colors.set([col.r, col.g, col.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

export function createBallMesh() {
  const grp = new THREE.Group();
  grp.name = 'Football';

  const geo = createClassicBallGeometry(BALL_CONFIG.radius);
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.38, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25,
  });
  const ball = new THREE.Mesh(geo, mat);
  ball.frustumCulled = false;
  ball.renderOrder = 8;
  ball.castShadow = true;
  ball.receiveShadow = true;
  ball.userData.isFootball = true;
  grp.add(ball);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(BALL_CONFIG.radius * 0.85, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -BALL_CONFIG.radius + 0.02;
  shadow.renderOrder = 1;
  shadow.name = 'BallShadow';
  grp.add(shadow);

  grp.userData.ballMesh = ball;
  grp.userData.shadowMesh = shadow;
  return grp;
}

/**
 * Apply kick impulse with timing-based power and loft.
 */
export function applyKickToBall(ball, kickForce, direction, contactOffsetY = 0) {
  const { power, accuracy, loft } = kickForce;
  const spread = (1 - accuracy) * 0.15;
  const dx = direction.x + (Math.random() - 0.5) * spread;
  const dz = direction.z + (Math.random() - 0.5) * spread;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  const loftRad = (loft * Math.PI) / 180;
  ball.vx = (dx / len) * power;
  ball.vz = (dz / len) * power;
  ball.vy = Math.sin(loftRad) * power * 0.35 + contactOffsetY * 0.5;
  ball.grounded = false;
  ball.spinZ = (contactOffsetY / BALL_CONFIG.radius) * power * 0.3;
}

export function tickBallPhysics(ball, dt, bounds) {
  const cfg = BALL_CONFIG;
  const g = 9.8;

  ball.vx *= Math.max(0, 1 - cfg.linearDamping * dt);
  ball.vz *= Math.max(0, 1 - cfg.linearDamping * dt);
  ball.vy -= g * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  // Ground bounce
  if (ball.y <= cfg.groundY) {
    ball.y = cfg.groundY;
    if (ball.vy < -0.5) {
      ball.vy = -ball.vy * cfg.restitution;
      ball.vx *= (1 - cfg.friction * 0.3);
      ball.vz *= (1 - cfg.friction * 0.3);
    } else {
      ball.vy = 0;
      ball.grounded = true;
      ball.vx *= (1 - cfg.friction * dt);
      ball.vz *= (1 - cfg.friction * dt);
    }
  } else {
    ball.grounded = false;
  }

  // Pitch bounds — hoarding bounce, but let the ball enter the goal mouth
  const { halfX, halfZ, goalWidth = 0, netDepth = 1.45 } = bounds;
  if (ball.x < -halfX) { ball.x = -halfX; ball.vx = Math.abs(ball.vx) * cfg.restitution * 0.6; }
  if (ball.x > halfX) { ball.x = halfX; ball.vx = -Math.abs(ball.vx) * cfg.restitution * 0.6; }
  const inMouth = goalWidth > 0 && Math.abs(ball.x) < goalWidth * 0.52 && ball.y < 2.6;
  const netLimit = halfZ + netDepth;
  if (inMouth) {
    if (ball.z > netLimit) { ball.z = netLimit; ball.vz *= -0.15; }
    if (ball.z < -netLimit) { ball.z = -netLimit; ball.vz *= -0.15; }
  } else {
    if (ball.z < -halfZ) { ball.z = -halfZ; ball.vz = Math.abs(ball.vz) * cfg.restitution * 0.6; }
    if (ball.z > halfZ) { ball.z = halfZ; ball.vz = -Math.abs(ball.vz) * cfg.restitution * 0.6; }
  }

  // Stop micro-movement
  if (ball.grounded && Math.abs(ball.vx) < 0.05) ball.vx = 0;
  if (ball.grounded && Math.abs(ball.vz) < 0.05) ball.vz = 0;
}

export function syncBallMesh(mesh, ball, dt = 1 / 60) {
  if (!mesh || !ball) return;
  mesh.position.set(ball.x, ball.y, ball.z);
  const ballMesh = mesh.userData.ballMesh || mesh;
  const step = Math.max(dt, 1 / 120);
  if (ball.grounded) {
    const rollX = (ball.vz / BALL_CONFIG.radius) * step;
    const rollZ = (-ball.vx / BALL_CONFIG.radius) * step;
    ballMesh.rotation.x += rollX;
    ballMesh.rotation.z += rollZ;
  }
  const shadow = mesh.userData.shadowMesh;
  if (shadow) {
    const lift = Math.max(0, ball.y - BALL_CONFIG.groundY);
    shadow.scale.setScalar(1 - Math.min(lift * 0.35, 0.45));
    shadow.material.opacity = 0.35 - Math.min(lift * 0.12, 0.2);
  }
}

export function distanceToBall(px, pz, ball) {
  const dx = ball.x - px;
  const dz = ball.z - pz;
  return Math.sqrt(dx * dx + dz * dz);
}

export function directionTo(px, pz, tx, tz) {
  const dx = tx - px;
  const dz = tz - pz;
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  return { x: dx / len, z: dz / len };
}
