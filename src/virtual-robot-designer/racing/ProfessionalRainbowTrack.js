/**
 * ProfessionalRainbowTrack.js — MK Rainbow Road reference.
 * Single continuous glass ribbon + unified gold star guardrails.
 */
import * as THREE from 'three';
import { sampleTrackFrame, stabilizeNormal } from './GameWorldBuilder.js';
import { buildRainbowGlassRibbon } from './RainbowRoadGlassShader.js';
import { makeHollowGoldStar } from './RainbowRoadVisuals.js';

export const TRACK_Y = 48;
export const TRACK_SURFACE_OFFSET = 0.38;

export const RAINBOW_LAUNCH_ZONE = {
  x: 0,
  y: TRACK_Y,
  zHigh: 79,
  zLow: -48,
  heading: Math.PI,
};

/**
 * Grand prix layout: a long launch straight, two hairpin pockets, a fast back
 * straight and a looping final hairpin back onto the start line.
 */
export function buildProfessionalCircuitWaypoints() {
  const y = TRACK_Y;
  return [
    { x: 0, y, z: 72 },   // start/finish line (finishT=0)
    { x: 0, y, z: 30 },
    { x: 0, y, z: -10 },
    { x: 0, y, z: -47 },   // end of the launch straight
    { x: 3, y, z: -62 },   // turn 1
    { x: 12, y, z: -72 },
    { x: 22, y, z: -70 },
    { x: 28, y, z: -58 },
    { x: 31, y, z: -47 },   // first hairpin pocket
    { x: 35, y, z: -38 },
    { x: 42, y, z: -35 },
    { x: 49, y, z: -39 },
    { x: 52, y, z: -50 },
    { x: 55, y, z: -66 },
    { x: 61, y, z: -76 },
    { x: 70, y, z: -75 },
    { x: 74, y, z: -62 },   // back straight
    { x: 74, y, z: -40 },
    { x: 74, y, z: -4 },
    { x: 74, y, z: 30 },
    { x: 72, y, z: 48 },
    { x: 64, y, z: 60 },   // second hairpin pocket
    { x: 55, y, z: 58 },
    { x: 51, y, z: 47 },
    { x: 48, y, z: 35 },
    { x: 44, y, z: 26 },
    { x: 37, y, z: 22 },
    { x: 31, y, z: 26 },
    { x: 29, y, z: 38 },
    { x: 30, y, z: 56 },   // run home
    { x: 29, y, z: 76 },
    { x: 24, y, z: 92 },   // final hairpin onto the start straight
    { x: 12, y, z: 99 },
    { x: 3, y, z: 93 },
    { x: 0, y, z: 82 },
  ];
}

export function isOnLaunchStrip(x, z, halfWidth) {
  const { x: cx, zHigh, zLow } = RAINBOW_LAUNCH_ZONE;
  return Math.abs(x - cx) <= halfWidth + 2
    && z <= zHigh + 1
    && z >= zLow - 1;
}

function buildGoldStarRails(trackGroup, curve, {
  halfWidth, use3D, spacingM = 5,
}) {
  const edge = halfWidth + 0.06;
  const railLift = (use3D ? TRACK_SURFACE_OFFSET : 0.2) + 0.08;
  const goldMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44, fog: false, toneMapped: false,
  });
  const posts = [];
  let arcLen = 0;
  let prevP = null;
  let prevN = null;

  for (let s = 0; s <= 320; s++) {
    const frame = sampleTrackFrame(curve, s / 320);
    const { p, n: rawN } = frame;
    const n = stabilizeNormal(rawN, prevN);
    prevN = n;
    if (prevP) arcLen += p.distanceTo(prevP);
    prevP = p.clone();
    const idx = Math.round(arcLen / spacingM);
    if (!posts.some((pt) => pt.idx === idx)) {
      posts.push({
        idx,
        left: p.clone().addScaledVector(n, -edge),
        right: p.clone().addScaledVector(n, edge),
        y: (use3D ? p.y : 0) + railLift,
      });
    }
  }

  const _zAxis = new THREE.Vector3(0, 0, 1);
  const _dir = new THREE.Vector3();
  const _quat = new THREE.Quaternion();

  for (let i = 0; i < posts.length - 1; i++) {
    const a0 = posts[i];
    const a1 = posts[i + 1];
    for (const side of ['left', 'right']) {
      const a = new THREE.Vector3(a0[side].x, a0.y, a0[side].z);
      const b = new THREE.Vector3(a1[side].x, a1.y, a1[side].z);
      _dir.subVectors(b, a);
      const len = _dir.length();
      if (len < 0.08) continue;
      _dir.normalize();
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, len), goldMat);
      seg.position.copy(a).addScaledVector(_dir, len * 0.5);
      _quat.setFromUnitVectors(_zAxis, _dir);
      seg.quaternion.copy(_quat);
      trackGroup.add(seg);
    }
  }

  posts.forEach(({ left, right, y }) => {
    [left, right].forEach((pt) => {
      const star = makeHollowGoldStar(0.65);
      star.position.set(pt.x, y + 0.32, pt.z);
      star.rotation.set(-Math.PI / 2, 0, 0);
      trackGroup.add(star);
    });
  });
}

export function buildProfessionalRainbowTrack(curve, group, {
  halfWidth = 3.75,
  use3D = true,
} = {}) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'mk-glass-rainbow-road';
  group.add(trackGroup);

  const curveLen = Math.max(1, curve.getLength());
  const segments = Math.max(400, Math.floor(curveLen / 1.8));

  const ribbon = buildRainbowGlassRibbon(curve, {
    halfWidth,
    segments,
    use3D,
    surfaceOffset: TRACK_SURFACE_OFFSET,
    tileLength: 2.0,
    tileWidth: 1.45,
  });
  trackGroup.add(ribbon.mesh);
  buildGoldStarRails(trackGroup, curve, { halfWidth, use3D, spacingM: 5 });

  return {
    group: trackGroup,
    drawCalls: 4,
    updateTime: (t) => ribbon.updateTime(t),
  };
}
