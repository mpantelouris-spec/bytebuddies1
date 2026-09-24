/**
 * RacingMinimap.jsx — Mario Kart-style top-down track map (2D canvas).
 */
import React, { useEffect, useRef } from 'react';
import {
  mapWorldToCanvas,
  normalizeTrackT,
  getSectionAtT,
  getNextSection,
  colorForEdge,
  isTInSegment,
  resolveRaceMinimap,
} from './RaceMinimapData.js';
import { getBiomeTrack } from './mk-tracks/BiomeTrackRegistry.js';
import { getTrackStandard } from './mk-tracks/CodeRacerTrackStandards.js';

const SIZE = 200;
const PAD = 12;

function drawCircuitEdge(ctx, pA, pB, bounds, width, color, alpha = 1) {
  const a = mapWorldToCanvas(pA.x, pA.z, bounds, SIZE, PAD);
  const b = mapWorldToCanvas(pB.x, pB.z, bounds, SIZE, PAD);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.cx, a.cy);
  ctx.lineTo(b.cx, b.cy);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Draw the full closed circuit as one continuous ribbon. */
function drawStaticTrack(ctx, minimap, accent = '#818cf8') {
  const { points, bounds, segments, start, checkpoints } = minimap;
  ctx.clearRect(0, 0, SIZE, SIZE);

  const inner = SIZE - PAD * 2;
  ctx.fillStyle = 'rgba(6, 10, 24, 0.92)';
  ctx.beginPath();
  ctx.roundRect(PAD, PAD, inner, inner, 10);
  ctx.fill();

  const grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 8, SIZE / 2, SIZE / 2, inner * 0.55);
  grad.addColorStop(0, `${accent}22`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(PAD, PAD, inner, inner);

  const edgeCount = points.length - 1;

  for (let i = 0; i < edgeCount; i++) {
    drawCircuitEdge(ctx, points[i], points[i + 1], bounds, 10, 'rgba(8,8,16,0.95)');
  }

  for (let i = 0; i < edgeCount; i++) {
    const color = colorForEdge(points[i].t, points[i + 1].t, segments);
    drawCircuitEdge(ctx, points[i], points[i + 1], bounds, 5.5, color, 0.98);
  }

  ctx.setLineDash([4, 5]);
  for (let i = 0; i < edgeCount; i += 2) {
    drawCircuitEdge(ctx, points[i], points[i + 1], bounds, 1, 'rgba(255,255,255,0.28)');
  }
  ctx.setLineDash([]);

  for (const cp of checkpoints || []) {
    const { cx, cy } = mapWorldToCanvas(cp.x, cp.z, bounds, SIZE, PAD);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (start) {
    const { cx, cy } = mapWorldToCanvas(start.x, start.z, bounds, SIZE, PAD);
    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#001a00';
    ctx.font = 'bold 7px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', cx, cy + 0.5);
  }

  // Numbered section markers matching Track palette order
  if (segments?.length) {
    ctx.font = 'bold 8px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      const midT = normalizeTrackT((seg.startT + seg.endT) * 0.5);
      const idx = Math.min(points.length - 1, Math.round(midT * (points.length - 1)));
      const pt = points[idx];
      const { cx, cy } = mapWorldToCanvas(pt.x, pt.z, bounds, SIZE, PAD);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = seg.color || '#ffffff';
      ctx.fillText(String(si + 1), cx, cy + 0.5);
    }
  }
}

function drawSectionHighlight(ctx, minimap, seg, themeAccent) {
  if (!seg) return;
  const { points, bounds } = minimap;
  const color = seg.color || themeAccent;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  for (let i = 0; i < points.length - 1; i++) {
    const midT = normalizeTrackT((points[i].t + points[i + 1].t) * 0.5);
    if (!isTInSegment(midT, seg)) continue;
    drawCircuitEdge(ctx, points[i], points[i + 1], bounds, 6, color, 0.7);
  }
  ctx.shadowBlur = 0;
}

export function RacingMinimap({ stats, challenge, themeAccent = '#ff44cc', pillBg, pillBorder, className = '', arenaType: arenaTypeProp }) {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const minimapKeyRef = useRef('');

  const arenaType = arenaTypeProp || challenge?.arenaType;
  const biome = arenaType ? getBiomeTrack(arenaType) : null;
  const std = arenaType ? getTrackStandard(arenaType) : null;
  const accent = biome?.color || themeAccent;

  const minimap = resolveRaceMinimap(
    { ...challenge, arenaType: arenaType || challenge?.arenaType },
    stats.raceMinimap,
  );
  const trackT = normalizeTrackT(stats.raceTrackT ?? stats._raceTrackTHint ?? 0);
  const robotX = stats.raceRobotX;
  const robotZ = stats.raceRobotZ;
  const robotAngle = stats.raceRobotAngle ?? Math.PI;

  const currentSection = minimap ? getSectionAtT(minimap.segments, trackT) : null;
  const nextSection = minimap ? getNextSection(minimap.segments, trackT) : null;
  const progressPct = Math.round(trackT * 100);
  const trackTitle = std?.displayName
    ?? biome?.label
    ?? challenge?.raceTrackLabel
    ?? challenge?.racing?.displayName
    ?? challenge?.name
    ?? stats.raceWorldName
    ?? 'Track';
  const trackEmoji = biome?.emoji || challenge?.icon || '🗺️';

  useEffect(() => {
    if (!minimap || !canvasRef.current) return;

    const key = `v${minimap.version ?? 1}-${minimap.points.length}-${arenaType || ''}`;
    if (key !== minimapKeyRef.current || !bgRef.current) {
      const off = document.createElement('canvas');
      off.width = SIZE;
      off.height = SIZE;
      drawStaticTrack(off.getContext('2d'), minimap, accent);
      bgRef.current = off;
      minimapKeyRef.current = key;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bgRef.current, 0, 0);

    drawSectionHighlight(ctx, minimap, nextSection, themeAccent);

    if (Number.isFinite(robotX) && Number.isFinite(robotZ)) {
      const { cx, cy } = mapWorldToCanvas(robotX, robotZ, minimap.bounds, SIZE, PAD);
      const pulse = 0.85 + Math.sin(Date.now() * 0.006) * 0.15;

      ctx.fillStyle = 'rgba(255, 238, 0, 0.28)';
      ctx.beginPath();
      ctx.arc(cx, cy, 9 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffee00';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const fwdX = Math.sin(robotAngle);
      const fwdZ = Math.cos(robotAngle);
      const ax = cx + fwdX * 8;
      const ay = cy + fwdZ * 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
  }, [minimap, robotX, robotZ, robotAngle, trackT, themeAccent, nextSection, accent, arenaType]);

  if (!minimap) return null;

  const sectionLabel = currentSection?.sectionName?.replace(/·.*/, '').trim() || 'Track';
  const nextLabel = nextSection?.sectionName?.split('·').pop()?.trim();

  return (
    <div
      className={`rc-minimap ${className}`.trim()}
      style={{ background: pillBg, borderColor: pillBorder || accent }}
      aria-label="Race track minimap"
    >
      <div className="rc-minimap-header" style={{ color: accent }}>
        <span className="rc-minimap-title">{trackEmoji} {trackTitle}</span>
        <span className="rc-minimap-pct">{progressPct}%</span>
      </div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="rc-minimap-canvas" />
      <div className="rc-minimap-section" title={currentSection?.sectionName}>
        {sectionLabel}
      </div>
      {nextLabel && nextLabel !== sectionLabel && (
        <div className="rc-minimap-next">
          Next: <strong>{nextLabel}</strong>
        </div>
      )}
      <div className="rc-minimap-legend">Read the map → code each turn!</div>
    </div>
  );
}

export default RacingMinimap;
