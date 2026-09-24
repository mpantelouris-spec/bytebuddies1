/**
 * mk-track-layout.js — Place scenery relative to the actual spline bounds.
 */

export function sampleTrackBounds(curve, samples = 80) {
  const bounds = {
    minX: Infinity, maxX: -Infinity,
    minZ: Infinity, maxZ: -Infinity,
  };
  for (let i = 0; i <= samples; i++) {
    const p = curve.getPointAt(i / samples);
    bounds.minX = Math.min(bounds.minX, p.x);
    bounds.maxX = Math.max(bounds.maxX, p.x);
    bounds.minZ = Math.min(bounds.minZ, p.z);
    bounds.maxZ = Math.max(bounds.maxZ, p.z);
  }
  bounds.cx = (bounds.minX + bounds.maxX) / 2;
  bounds.cz = (bounds.minZ + bounds.maxZ) / 2;
  bounds.spanX = bounds.maxX - bounds.minX;
  bounds.spanZ = bounds.maxZ - bounds.minZ;
  bounds.radius = Math.max(bounds.spanX, bounds.spanZ) * 0.5;
  return bounds;
}

/** Place a landmark outside the track bounding box. */
export function cornerPosition(bounds, corner, margin = 16) {
  const { minX, maxX, minZ, maxZ, cx, cz } = bounds;
  switch (corner) {
    case 'nw': return { x: minX - margin, z: minZ - margin };
    case 'ne': return { x: maxX + margin, z: minZ - margin };
    case 'sw': return { x: minX - margin, z: maxZ + margin };
    case 'se': return { x: maxX + margin, z: maxZ + margin };
    case 'n': return { x: cx, z: minZ - margin };
    case 's': return { x: cx, z: maxZ + margin };
    case 'w': return { x: minX - margin, z: cz };
    case 'e': return { x: maxX + margin, z: cz };
    default: return { x: cx, z: cz };
  }
}

/** Y rotation so an object at (x,z) faces the track center. */
export function faceCenter(bounds, x, z) {
  return Math.atan2(bounds.cx - x, bounds.cz - z);
}

/** Minimum ring radius so infield grass stays inside the track loop. */
export function trackInfieldRadius(curve, bounds, padding = 4) {
  let maxDist = 0;
  for (let i = 0; i <= 80; i++) {
    const p = curve.getPointAt(i / 80);
    maxDist = Math.max(maxDist, Math.hypot(p.x - bounds.cx, p.z - bounds.cz));
  }
  return maxDist + padding;
}
