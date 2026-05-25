import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

const SIM_ROBOTS = [
  { id: 'rover',    label: 'Rover',     icon: '🚗', color: '#6366f1', desc: 'Wheeled explorer robot' },
  { id: 'tank',     label: 'Tank Bot',  icon: '🪖', color: '#84cc16', desc: 'Heavy tracked vehicle' },
  { id: 'drone',    label: 'Drone',     icon: '🚁', color: '#22d3ee', desc: 'Flying quadcopter' },
  { id: 'spider',   label: 'Spider',    icon: '🕷️', color: '#f97316', desc: 'Six-legged walker' },
  { id: 'humanoid', label: 'Humanoid',  icon: '🤖', color: '#ec4899', desc: 'Bipedal walking robot' },
  { id: 'arm',      label: 'Robot Arm', icon: '🦾', color: '#f59e0b', desc: 'Articulated arm (fixed base)' },
];

/* ─── Robot draw functions ─── */
function drawRover(ctx, state) {
  const { ledOn, tick, moving, headlightL, headlightR } = state;
  const wa = (tick || 0) * (moving ? 0.13 : 0);
  const hlL = headlightL ? `rgb(${headlightL.r},${headlightL.g},${headlightL.b})` : '#22d3ee';
  const hlR = headlightR ? `rgb(${headlightR.r},${headlightR.g},${headlightR.b})` : '#ef4444';
  const hlGlow = (c) => c ? (c.r + c.g + c.b > 30) : ledOn;

  // Drop shadow ellipse
  ctx.save();
  ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 7, 23, 11, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // ── 6 wheels — sphere-like with bright highlight spot ──
  [[-14,-11],[-14,0],[-14,11],[14,-11],[14,0],[14,11]].forEach(([wx,wy]) => {
    // Tire outer — radial gradient lit top-left
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.7)';
    const tireG = ctx.createRadialGradient(wx-2.5, wy-2.5, 0.5, wx, wy, 6.5);
    tireG.addColorStop(0, '#3d3d3d');
    tireG.addColorStop(0.5, '#111111');
    tireG.addColorStop(1, '#020202');
    ctx.fillStyle = tireG;
    ctx.beginPath(); ctx.arc(wx, wy, 6.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // Rim edge stroke
    ctx.strokeStyle = 'rgba(80,80,80,0.7)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(wx, wy, 6.5, 0, Math.PI*2); ctx.stroke();
    // Tread grooves
    ctx.strokeStyle = '#080808'; ctx.lineWidth = 1;
    for (let t = 0; t < 8; t++) {
      const ta = wa + t * Math.PI / 4;
      ctx.beginPath(); ctx.arc(wx, wy, 5.8, ta, ta + 0.25); ctx.stroke();
    }
    // Hub — radial gradient sphere-like
    const hubG = ctx.createRadialGradient(wx-2, wy-2.5, 0.3, wx, wy, 4.2);
    hubG.addColorStop(0, '#f8fafc');
    hubG.addColorStop(0.35, '#94a3b8');
    hubG.addColorStop(0.75, '#475569');
    hubG.addColorStop(1, '#1e293b');
    ctx.fillStyle = hubG;
    ctx.beginPath(); ctx.arc(wx, wy, 4.2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,0.65)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(wx, wy, 4.2, 0, Math.PI*2); ctx.stroke();
    // Spokes
    for (let s = 0; s < 3; s++) {
      const a = wa + s * Math.PI * 2 / 3;
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a)*1.3, wy + Math.sin(a)*1.3);
      ctx.lineTo(wx + Math.cos(a)*3.6, wy + Math.sin(a)*3.6);
      ctx.stroke();
    }
    // Center hub cap
    const capG = ctx.createRadialGradient(wx-0.8, wy-0.8, 0.1, wx, wy, 1.6);
    capG.addColorStop(0, '#f1f5f9'); capG.addColorStop(1, '#475569');
    ctx.fillStyle = capG;
    ctx.beginPath(); ctx.arc(wx, wy, 1.6, 0, Math.PI*2); ctx.fill();
    // Bright specular highlight spot on hub (sphere-like)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(wx-1.5, wy-1.8, 1.2, 0.75, -0.4, 0, Math.PI*2); ctx.fill();
    // Secondary micro-specular
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(wx-0.9, wy-1.1, 0.45, 0, Math.PI*2); ctx.fill();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(wx, wy, 4.0, 0.4*Math.PI, 0.9*Math.PI); ctx.stroke();
  });

  // Suspension bars
  ctx.strokeStyle = '#2d3f52'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  [[-14,-11],[-14,0],[-14,11],[14,-11],[14,0],[14,11]].forEach(([sx,sy]) => {
    const bx = sx < 0 ? -9 : 9;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(bx, sy, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, sy); ctx.stroke();
  });

  // ── Body — radial gradient lit top-left ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const bg = ctx.createRadialGradient(-6, -12, 1, 0, 0, 22);
  bg.addColorStop(0, '#c7d2fe');
  bg.addColorStop(0.3, '#6366f1');
  bg.addColorStop(0.65, '#4338ca');
  bg.addColorStop(1, '#1e1265');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(-9, -15, 18, 30, 5); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge rim lighting
  ctx.strokeStyle = 'rgba(199,210,254,0.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(-9, -15, 18, 30, 5); ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-8, -14, 12, 11, 4); ctx.fill();
  // Bright specular ellipse
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-4, -11, 4, 2.3, -0.3, 0, Math.PI*2); ctx.fill();
  // Panel lines
  ctx.strokeStyle = 'rgba(165,180,252,0.35)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(9,-4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-9, 5); ctx.lineTo(9, 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(0,15); ctx.stroke();

  // ── Sensor bar (front) ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.6)';
  const sbg = ctx.createRadialGradient(-4,-18,1, 0,-16, 8);
  sbg.addColorStop(0,'#2d3f52'); sbg.addColorStop(1,'#0f172a');
  ctx.fillStyle = sbg; ctx.beginPath(); ctx.roundRect(-7,-19,14,6,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(71,85,105,0.7)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.roundRect(-7,-19,14,6,2); ctx.stroke();
  // Left headlight
  ctx.save();
  if (hlGlow(headlightL)) { ctx.shadowBlur = 12; ctx.shadowColor = hlL; }
  ctx.fillStyle = hlL;
  ctx.beginPath(); ctx.arc(-3,-16,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // Right headlight
  ctx.save();
  if (hlGlow(headlightR)) { ctx.shadowBlur = 12; ctx.shadowColor = hlR; }
  ctx.fillStyle = hlR;
  ctx.beginPath(); ctx.arc(3,-16,3,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Camera dome — glass sphere with inner caustic ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  // AO ring at base
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(0,-3,6.5,3.5,0,0,Math.PI*2); ctx.fill();
  // Dome glass body — radial lit top-left
  const dg = ctx.createRadialGradient(-3,-6,0.4, 0,-3, 6.2);
  dg.addColorStop(0, '#eff6ff');
  dg.addColorStop(0.25, '#93c5fd');
  dg.addColorStop(0.6, '#1d4ed8');
  dg.addColorStop(0.85, '#1e3a8a');
  dg.addColorStop(1, '#0a1628');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.arc(0,-3,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(147,197,253,0.75)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(0,-3,6,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(147,197,253,0.35)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.arc(0,-3,5.8,0.3*Math.PI,0.9*Math.PI); ctx.stroke();
  // Camera lens
  ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0,-3,3.2,0,Math.PI*2); ctx.fill();
  // Inner caustic (refraction ring)
  const caustic = ctx.createRadialGradient(-0.5,-3.5,0.5, 0,-3,3);
  caustic.addColorStop(0,'rgba(99,102,241,0.8)'); caustic.addColorStop(1,'rgba(30,27,75,0.0)');
  ctx.fillStyle = caustic;
  ctx.beginPath(); ctx.arc(-0.5,-3.5,1.8,0,Math.PI*2); ctx.fill();
  // Glass specular bright
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.beginPath(); ctx.ellipse(-2.2,-5.8,1.6,0.95,0.5,0,Math.PI*2); ctx.fill();
  // Secondary small specular
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(-1.2,-4.5,0.65,0,Math.PI*2); ctx.fill();

  // ── Direction arrow ──
  ctx.fillStyle = 'rgba(165,243,252,0.9)';
  ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(9,-4); ctx.lineTo(9,4); ctx.closePath(); ctx.fill();
}

function drawTank(ctx, state) {
  const { ledOn, tick } = state;

  // Drop shadow
  ctx.save();
  ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); ctx.ellipse(3,8,26,13,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Tracks — subtle gradient shading ──
  [[-14,0],[14,0]].forEach(([tx]) => {
    const side = tx < 0 ? -1 : 1;
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
    // Track body — radial gradient for depth
    const trG = ctx.createRadialGradient(tx-4,-10,2, tx,0,16);
    trG.addColorStop(0,'#384e10'); trG.addColorStop(0.5,'#1a2e05'); trG.addColorStop(1,'#070f01');
    ctx.fillStyle = trG;
    ctx.beginPath();
    ctx.arc(tx,-12,8,Math.PI,0);
    ctx.lineTo(tx+8*side,12);
    ctx.arc(tx,12,8,0,Math.PI);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // Edge stroke
    ctx.strokeStyle = 'rgba(74,112,16,0.65)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx,-12,8,Math.PI,0);
    ctx.lineTo(tx+8*side,12);
    ctx.arc(tx,12,8,0,Math.PI);
    ctx.closePath(); ctx.stroke();
    // Track pad links — gradient shaded
    for (let i = -11; i <= 11; i += 4) {
      const padG = ctx.createLinearGradient(tx-7,i, tx-7,i+3);
      padG.addColorStop(0,'#4a6c14'); padG.addColorStop(1,'#1a2e05');
      ctx.fillStyle = padG;
      ctx.fillRect(tx-7, i, 14, 2.5);
      ctx.strokeStyle = 'rgba(77,124,15,0.5)'; ctx.lineWidth = 0.4;
      ctx.strokeRect(tx-7, i, 14, 2.5);
    }
    // Top-side specular sheen
    ctx.fillStyle = 'rgba(180,220,80,0.10)';
    ctx.beginPath(); ctx.roundRect(tx-7,-11,14,22,3); ctx.fill();
    // Drive sprockets — sphere-like radial gradient
    const sg = ctx.createRadialGradient(tx-3,-14,0.8, tx,-12,7.5);
    sg.addColorStop(0,'#c8f560'); sg.addColorStop(0.35,'#65a30d'); sg.addColorStop(0.7,'#2d5a06'); sg.addColorStop(1,'#0d1a02');
    ctx.save(); ctx.shadowBlur=7; ctx.shadowColor='rgba(0,0,0,0.55)';
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(tx,-12,7.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(132,204,22,0.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tx,-12,7.5,0,Math.PI*2); ctx.stroke();
    // Rim lighting on sprocket
    ctx.strokeStyle = 'rgba(163,230,53,0.35)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(tx,-12,7.2,0.4*Math.PI,0.9*Math.PI); ctx.stroke();
    // Sprocket teeth
    for (let t = 0; t < 6; t++) {
      const ta = t * Math.PI / 3;
      ctx.fillStyle = '#3a5c0e';
      ctx.beginPath(); ctx.arc(tx+Math.cos(ta)*7, -12+Math.sin(ta)*7, 1.5, 0, Math.PI*2); ctx.fill();
    }
    const sg2 = ctx.createRadialGradient(tx-3,10,0.8, tx,12,7.5);
    sg2.addColorStop(0,'#84cc16'); sg2.addColorStop(0.5,'#3a5c0e'); sg2.addColorStop(1,'#0d1a02');
    ctx.fillStyle = sg2; ctx.beginPath(); ctx.arc(tx,12,7.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(77,124,15,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    // Specular on top sprocket
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.ellipse(tx-2.5,-14.5,2.8,1.6,0.4,0,Math.PI*2); ctx.fill();
  });

  // ── Armored hull — radial gradient lit top-left ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const hg = ctx.createRadialGradient(-7,-10,1, 0,0,18);
  hg.addColorStop(0,'#c8f560');
  hg.addColorStop(0.3,'#7ec413');
  hg.addColorStop(0.6,'#3f6212');
  hg.addColorStop(1,'#111e03');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(10,-8);
  ctx.lineTo(10,8); ctx.lineTo(6,12); ctx.lineTo(-6,12);
  ctx.lineTo(-10,8); ctx.lineTo(-10,-8); ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Rim lighting edge stroke
  ctx.strokeStyle = 'rgba(200,245,96,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(10,-8);
  ctx.lineTo(10,8); ctx.lineTo(6,12); ctx.lineTo(-6,12);
  ctx.lineTo(-10,8); ctx.lineTo(-10,-8); ctx.closePath(); ctx.stroke();
  // Specular highlight strip top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(9,-9); ctx.lineTo(-9,-9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.ellipse(-3,-8,4,2,0.2,0,Math.PI*2); ctx.fill();
  // Armor panel lines
  ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(10,0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(0,12); ctx.stroke();
  // Rivets
  [[-7,-10],[-7,0],[-7,10],[7,-10],[7,0],[7,10]].forEach(([rx,ry]) => {
    const rv = ctx.createRadialGradient(rx-0.5,ry-0.5,0.1, rx,ry,1.5);
    rv.addColorStop(0,'#e4fb6a'); rv.addColorStop(1,'#3f6212');
    ctx.fillStyle = rv; ctx.beginPath(); ctx.arc(rx,ry,1.5,0,Math.PI*2); ctx.fill();
  });

  // AO at hull-turret joint
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill();

  // ── Turret — sphere-like radial gradient, bright top-left ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.55)';
  const tg = ctx.createRadialGradient(-4,-4,0.8, 0,0,9.5);
  tg.addColorStop(0,'#e8fc80');
  tg.addColorStop(0.3,'#a3d40e');
  tg.addColorStop(0.6,'#3d6b07');
  tg.addColorStop(1,'#071002');
  ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(0,0,9.5,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,245,96,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0,0,9.5,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(163,230,53,0.35)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(0,0,9.2,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Turret specular highlight (larger + bright)
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath(); ctx.ellipse(-3,-3.5,4,2.3,0.4,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-4.5,-4.5,1.2,0,Math.PI*2); ctx.fill();
  // Turret rivets
  for (let r = 0; r < 6; r++) {
    const ra = r * Math.PI / 3 + 0.2;
    const rx = Math.cos(ra)*7.5, ry = Math.sin(ra)*7.5;
    const rv2 = ctx.createRadialGradient(rx-0.4,ry-0.4,0.1,rx,ry,1.3);
    rv2.addColorStop(0,'#d4f04a'); rv2.addColorStop(1,'#3f6212');
    ctx.fillStyle = rv2; ctx.beginPath(); ctx.arc(rx,ry,1.3,0,Math.PI*2); ctx.fill();
  }
  // Turret hatch — radial gradient
  const hatchG = ctx.createRadialGradient(-3,-3,0.5,-2,-2,4.5);
  hatchG.addColorStop(0,'#a3e635'); hatchG.addColorStop(0.5,'#4d7c0f'); hatchG.addColorStop(1,'#0d1a02');
  ctx.fillStyle = hatchG; ctx.beginPath(); ctx.arc(-2,-2,4.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(163,230,53,0.7)'; ctx.lineWidth = 0.8; ctx.stroke();

  // ── Barrel ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const brg = ctx.createLinearGradient(9,-2.5,9,2.5);
  brg.addColorStop(0,'#b5e048'); brg.addColorStop(0.4,'#65a30d'); brg.addColorStop(1,'#1a2e05');
  ctx.fillStyle = brg; ctx.beginPath(); ctx.roundRect(9,-2.5,17,5,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(132,204,22,0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(9,-2.5,17,5,2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.roundRect(10,-2.2,16,1.5,1); ctx.fill();
  // Muzzle brake
  ctx.save();
  ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const mbg = ctx.createLinearGradient(25,-3,25,3);
  mbg.addColorStop(0,'#5a8f12'); mbg.addColorStop(1,'#0d1a02');
  ctx.fillStyle = mbg; ctx.beginPath(); ctx.roundRect(25,-3,5,6,1); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(77,124,15,0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(25,-3,5,6,1); ctx.stroke();

  // ── Sensor eye ──
  if (ledOn) {
    ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(4,-3,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  } else {
    const eyeG = ctx.createRadialGradient(3,-4,0.5,4,-3,3.5);
    eyeG.addColorStop(0,'#bbf7d0'); eyeG.addColorStop(1,'#166534');
    ctx.fillStyle = eyeG; ctx.beginPath(); ctx.arc(4,-3,3,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.arc(4,-3,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(3.3,-3.7,0.8,0,Math.PI*2); ctx.fill();
}

function drawDrone(ctx, state) {
  const { ledOn, tick } = state;
  const spin = (tick||0) * 0.35;

  // ── Arms (X-config) — gradient from dark to darker ──
  ctx.lineCap = 'round';
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([dx,dy]) => {
    // Drop shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.38)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(dx*3+1,dy*3+1); ctx.lineTo(dx*19+1,dy*19+1); ctx.stroke();
    // Arm dark base
    ctx.strokeStyle = '#0a1020'; ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(dx*3,dy*3); ctx.lineTo(dx*19,dy*19); ctx.stroke();
    // Mid gradient shade
    ctx.strokeStyle = '#1c2840'; ctx.lineWidth = 3.8;
    ctx.beginPath(); ctx.moveTo(dx*3,dy*3); ctx.lineTo(dx*19,dy*19); ctx.stroke();
    // Top-left highlight edge
    ctx.strokeStyle = 'rgba(100,116,139,0.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(dx*3-dy*0.9,dy*3-dx*0.9); ctx.lineTo(dx*19-dy*0.9,dy*19-dx*0.9); ctx.stroke();
  });

  // ── Motor pods + spinning propellers ──
  [[-19,-19],[19,-19],[19,19],[-19,19]].forEach(([px,py],i) => {
    // Propeller motion blur glow
    const propGlow = ctx.createRadialGradient(px,py,2,px,py,12);
    propGlow.addColorStop(0,'rgba(186,230,253,0.35)');
    propGlow.addColorStop(0.7,'rgba(148,210,253,0.15)');
    propGlow.addColorStop(1,'rgba(148,210,253,0)');
    ctx.fillStyle = propGlow;
    ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
    // Propeller disc rings
    ctx.strokeStyle = 'rgba(148,210,253,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px,py,11,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(148,210,253,0.25)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2); ctx.stroke();

    // AO under motor
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();

    // Motor pod — sphere-like radial gradient
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.55)';
    const mg = ctx.createRadialGradient(px-2,py-2,0.4, px,py,6.5);
    mg.addColorStop(0,'#cbd5e1');
    mg.addColorStop(0.35,'#64748b');
    mg.addColorStop(0.7,'#1e293b');
    mg.addColorStop(1,'#060c18');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(px,py,6.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // Edge stroke
    ctx.strokeStyle = 'rgba(100,116,139,0.65)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px,py,6.5,0,Math.PI*2); ctx.stroke();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(px,py,6.2,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
    // Specular highlight — sphere-like
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(px-2,py-2.5,2.2,1.3,0.5,0,Math.PI*2); ctx.fill();
    // Secondary micro specular
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.arc(px-3,py-3,0.8,0,Math.PI*2); ctx.fill();

    // Spinning blades
    ctx.save(); ctx.translate(px,py); ctx.rotate(spin + i*Math.PI*0.5);
    for (let b = 0; b < 2; b++) {
      ctx.save(); ctx.rotate(b*Math.PI);
      ctx.fillStyle = 'rgba(186,230,253,0.2)';
      ctx.beginPath(); ctx.ellipse(0,-7.5,4,8.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(186,230,253,0.6)';
      ctx.beginPath(); ctx.ellipse(0,-7.5,2.5,7.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath(); ctx.ellipse(-0.5,-6,1,3.5,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // LED status dot
    const ledColors = ['#ef4444','#22c55e','#22c55e','#ef4444'];
    if (ledOn) {
      ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = ledColors[i];
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
    }
  });

  // ── Shadow ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(2,5,13,9,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Central body diamond — radial gradient bright cyan top-left to dark navy ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const bg = ctx.createRadialGradient(-5,-5,0.5, 0,0,14);
  bg.addColorStop(0,'#a5f3fc');
  bg.addColorStop(0.25,'#22d3ee');
  bg.addColorStop(0.55,'#0369a1');
  bg.addColorStop(0.8,'#0c2d54');
  bg.addColorStop(1,'#020d1a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,13); ctx.lineTo(-13,0); ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(56,189,248,0.75)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,13); ctx.lineTo(-13,0); ctx.closePath();
  ctx.stroke();
  // Top facet highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,-4); ctx.closePath(); ctx.fill();
  // Specular highlight ellipse top-left
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-4,-6,4.5,2.2,0.7,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-5.5,-7,1,0,Math.PI*2); ctx.fill();
  // Carbon fiber texture lines
  ctx.strokeStyle = 'rgba(2,132,199,0.3)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(9,4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-9,4); ctx.lineTo(9,-4); ctx.stroke();

  // ── Camera gimbal — sphere-like ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const gimbalG = ctx.createRadialGradient(-1.5,1.5,0.4, 0,3,5.5);
  gimbalG.addColorStop(0,'#475569');
  gimbalG.addColorStop(0.5,'#1e293b');
  gimbalG.addColorStop(1,'#060c18');
  ctx.fillStyle = gimbalG; ctx.beginPath(); ctx.arc(0,3,5.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(71,85,105,0.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0,3,5.5,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.ellipse(-1.2,1.5,1.5,0.9,0.4,0,Math.PI*2); ctx.fill();
  // Camera lens
  const lensG = ctx.createRadialGradient(-1,2,0.3,0,3,3.2);
  lensG.addColorStop(0, ledOn ? '#fef08a' : '#67e8f9');
  lensG.addColorStop(0.6, ledOn ? '#f59e0b' : '#0e7490');
  lensG.addColorStop(1,'#0c1a2e');
  if (ledOn) { ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24'; }
  ctx.fillStyle = lensG; ctx.beginPath(); ctx.arc(0,3,3.2,0,Math.PI*2); ctx.fill();
  if (ledOn) ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.beginPath(); ctx.arc(-1.1,2.1,1.2,0,Math.PI*2); ctx.fill();

  // Direction arrow
  ctx.fillStyle = 'rgba(224,242,254,0.9)';
  ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(9,-4); ctx.lineTo(9,4); ctx.closePath(); ctx.fill();
}

function drawSpider(ctx, state) {
  const { ledOn, tick, moving } = state;
  const w = Math.sin((tick||0)*0.2) * (moving?5:1);

  // ── 6 legs with joints — segmented dark chitin ──
  const legDefs = [
    [[-9,-4], [-20,-18+w], [-27,-24+w*1.2]],
    [[-10,0], [-24,-2],    [-30,-1]],
    [[-9,4],  [-20,18-w],  [-27,24-w*1.2]],
    [[9,-4],  [20,-18-w],  [27,-24-w*1.2]],
    [[10,0],  [24,-2],     [30,-1]],
    [[9,4],   [20,18+w],   [27,24+w*1.2]],
  ];

  ctx.lineCap = 'round';
  // Thigh segments — dark base + lighter joint highlight
  ctx.strokeStyle = '#3d1a05'; ctx.lineWidth = 3.5;
  legDefs.forEach(([[sx,sy],[kx,ky]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
  });
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
  legDefs.forEach(([[sx,sy],[kx,ky]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
  });
  // Shin segments — slightly darker than thigh
  ctx.strokeStyle = '#2a0e02'; ctx.lineWidth = 2.5;
  legDefs.forEach(([[,],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  ctx.strokeStyle = '#9a3d0a'; ctx.lineWidth = 1.8;
  legDefs.forEach(([[,],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  // Leg chitin highlight — lighter at joints
  ctx.strokeStyle = 'rgba(251,146,60,0.28)'; ctx.lineWidth = 0.8;
  legDefs.forEach(([[sx,sy],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  // Knee joints — sphere-like radial gradients
  legDefs.forEach(([[,],[kx,ky]]) => {
    const kjG = ctx.createRadialGradient(kx-1,ky-1,0.2, kx,ky,3);
    kjG.addColorStop(0,'#fcd34d');
    kjG.addColorStop(0.35,'#d97706');
    kjG.addColorStop(0.7,'#92400e');
    kjG.addColorStop(1,'#451a03');
    ctx.fillStyle = kjG;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.stroke();
    // Specular highlight on knee joint
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(kx-0.9,ky-1,1.1,0.65,0.5,0,Math.PI*2); ctx.fill();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(217,119,6,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(kx,ky,2.8,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  });
  // Foot tips — sharp dark
  legDefs.forEach(([[,],[,],[fx,fy]]) => {
    const ftG = ctx.createRadialGradient(fx-0.5,fy-0.5,0.2,fx,fy,2.2);
    ftG.addColorStop(0,'#57534e'); ftG.addColorStop(0.5,'#1c1917'); ftG.addColorStop(1,'#050403');
    ctx.fillStyle = ftG;
    ctx.beginPath(); ctx.arc(fx,fy,2.2,0,Math.PI*2); ctx.fill();
  });

  // Shadow
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(2,5,15,11,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Abdomen (rear segment) — radial gradient + specular highlight ellipse ──
  ctx.save();
  ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const ag = ctx.createRadialGradient(-5,-10,1, 0,-5,15);
  ag.addColorStop(0,'#fde68a');
  ag.addColorStop(0.2,'#fb923c');
  ag.addColorStop(0.5,'#ea580c');
  ag.addColorStop(0.75,'#9a3412');
  ag.addColorStop(1,'#350a02');
  ctx.fillStyle = ag;
  ctx.beginPath(); ctx.ellipse(-2,-5,10,13,0.1,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(251,146,60,0.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(-2,-5,10,13,0.1,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(251,146,60,0.3)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(-2,-5,9.5,12.5,0.1,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Abdomen chitin stripes
  ctx.strokeStyle = 'rgba(251,146,60,0.4)'; ctx.lineWidth = 1.2;
  [-10,-5,0].forEach(y => {
    ctx.beginPath(); ctx.moveTo(-10,y); ctx.lineTo(6,y); ctx.stroke();
  });
  // Specular highlight ellipse — top-left
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.ellipse(-5,-11,4.5,2.8,0.3,0,Math.PI*2); ctx.fill();
  // Secondary micro specular
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.arc(-6,-12.5,1.2,0,Math.PI*2); ctx.fill();
  // AO at joint
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0,2,8,5,0,0,Math.PI*2); ctx.fill();

  // ── Cephalothorax — radial gradient with specular ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.45)';
  const cg = ctx.createRadialGradient(-4,2,1, 1,7,16);
  cg.addColorStop(0,'#fed7aa');
  cg.addColorStop(0.25,'#f97316');
  cg.addColorStop(0.55,'#c2410c');
  cg.addColorStop(0.8,'#7c1d06');
  cg.addColorStop(1,'#280702');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.ellipse(1,7,13,10,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(251,146,60,0.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(1,7,13,10,0,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(234,88,12,0.3)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.ellipse(1,7,12.5,9.5,0,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Cephalothorax specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath(); ctx.ellipse(-4,3,5.5,3.2,0.3,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(-5,2,1.4,0,Math.PI*2); ctx.fill();

  // ── 8 eyes — glowing ──
  const eyePositions=[[-5,2],[-2,0],[2,0],[5,2],[-5,5],[-2,7],[2,7],[5,5]];
  if (ledOn) {
    ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#fbbf24';
    eyePositions.slice(0,4).forEach(([ex,ey]) => {
      const eyeG = ctx.createRadialGradient(ex-0.4,ey-0.4,0.2,ex,ey,1.8);
      eyeG.addColorStop(0,'#fff7c0'); eyeG.addColorStop(0.5,'#fef08a'); eyeG.addColorStop(1,'#f59e0b');
      ctx.fillStyle = eyeG;
      ctx.beginPath(); ctx.arc(ex,ey,1.8,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
    eyePositions.slice(4).forEach(([ex,ey]) => {
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(ex,ey,1.4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.arc(ex+0.3,ey+0.3,0.6,0,Math.PI*2); ctx.fill();
    });
  } else {
    eyePositions.forEach(([ex,ey]) => {
      const eyeG = ctx.createRadialGradient(ex-0.3,ey-0.3,0.2,ex,ey,1.6);
      eyeG.addColorStop(0,'#fef3c7'); eyeG.addColorStop(1,'#92400e');
      ctx.fillStyle = eyeG;
      ctx.beginPath(); ctx.arc(ex,ey,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath(); ctx.arc(ex+0.3,ey+0.3,0.7,0,Math.PI*2); ctx.fill();
    });
  }

  // ── Fangs/chelicerae ──
  ctx.strokeStyle = '#3d1a05'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-3,15); ctx.quadraticCurveTo(-5,18,-5,22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3,15); ctx.quadraticCurveTo(5,18,5,22); ctx.stroke();
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-3,15); ctx.quadraticCurveTo(-5,18,-5,22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3,15); ctx.quadraticCurveTo(5,18,5,22); ctx.stroke();
  const fangG1 = ctx.createRadialGradient(-6,21,0.3,-5,22,2.5);
  fangG1.addColorStop(0,'#92400e'); fangG1.addColorStop(1,'#120501');
  ctx.fillStyle = fangG1; ctx.beginPath(); ctx.arc(-5,22,2.5,0,Math.PI*2); ctx.fill();
  const fangG2 = ctx.createRadialGradient(4,21,0.3,5,22,2.5);
  fangG2.addColorStop(0,'#92400e'); fangG2.addColorStop(1,'#120501');
  ctx.fillStyle = fangG2; ctx.beginPath(); ctx.arc(5,22,2.5,0,Math.PI*2); ctx.fill();
}

function drawHumanoid(ctx, state) {
  const { ledOn, tick, moving } = state;
  const phase = moving ? (tick||0)*0.18 : 0;

  const lThighDeg = Math.sin(phase)*28;
  const rThighDeg = Math.sin(phase+Math.PI)*28;
  const lKneeDeg  = Math.max(5,-lThighDeg*0.7+12);
  const rKneeDeg  = Math.max(5,-rThighDeg*0.7+12);
  const lArmDeg   = Math.sin(phase+Math.PI)*20;
  const rArmDeg   = Math.sin(phase)*20;

  const drawLimb = (hx,hy,s1,s2,a1d,a2d,col,w) => {
    const a1=a1d*Math.PI/180;
    const kx=hx+Math.sin(a1)*s1, ky=hy+Math.cos(a1)*s1;
    const a2=(a1d+a2d)*Math.PI/180;
    const ex=kx+Math.sin(a2)*s2, ey=ky+Math.cos(a2)*s2;
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(kx,ky); ctx.lineTo(ex,ey); ctx.stroke();
    return {kx,ky,ex,ey};
  };

  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0,32,12,5,0,0,Math.PI*2); ctx.fill();

  // ── Legs — gradient strokes (lighter near joints) ──
  const lLeg = drawLimb(-5,12,14,13,lThighDeg,lKneeDeg,'#5b21b6',6);
  const rLeg = drawLimb( 5,12,14,13,rThighDeg,rKneeDeg,'#6d28d9',6);
  // Limb highlight pass
  const lLeg2 = drawLimb(-5,12,14,13,lThighDeg,lKneeDeg,'rgba(139,92,246,0.45)',2);
  const rLeg2 = drawLimb( 5,12,14,13,rThighDeg,rKneeDeg,'rgba(139,92,246,0.45)',2);
  // Knee joints — sphere-like radial gradients
  [lLeg.kx,rLeg.kx].forEach((kx,i) => {
    const ky = i===0 ? lLeg.ky : rLeg.ky;
    const kjG = ctx.createRadialGradient(kx-1,ky-1,0.3, kx,ky,3.5);
    kjG.addColorStop(0,'#c4b5fd');
    kjG.addColorStop(0.4,'#7c3aed');
    kjG.addColorStop(1,'#2e1065');
    ctx.fillStyle=kjG;
    ctx.beginPath(); ctx.arc(kx,ky,3.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.6)'; ctx.lineWidth=0.7;
    ctx.beginPath(); ctx.arc(kx,ky,3.5,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(kx-0.9,ky-1,1.1,0.65,0.5,0,Math.PI*2); ctx.fill();
  });
  // Feet (boots)
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.4)';
  const bootG1 = ctx.createRadialGradient(lLeg.ex-1,lLeg.ey-1,0.5, lLeg.ex+1,lLeg.ey+1,7);
  bootG1.addColorStop(0,'#4c1d95'); bootG1.addColorStop(1,'#1a0836');
  ctx.fillStyle=bootG1;
  ctx.beginPath(); ctx.roundRect(lLeg.ex-3,lLeg.ey-2,9,5,2); ctx.fill();
  const bootG2 = ctx.createRadialGradient(rLeg.ex-1,rLeg.ey-1,0.5, rLeg.ex+1,rLeg.ey+1,7);
  bootG2.addColorStop(0,'#4c1d95'); bootG2.addColorStop(1,'#1a0836');
  ctx.fillStyle=bootG2;
  ctx.beginPath(); ctx.roundRect(rLeg.ex-3,rLeg.ey-2,9,5,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(109,40,217,0.7)'; ctx.lineWidth=0.8;
  ctx.strokeRect(lLeg.ex-3,lLeg.ey-2,9,5); ctx.strokeRect(rLeg.ex-3,rLeg.ey-2,9,5);

  // ── Torso — radial gradient + specular + shadow ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const tg = ctx.createRadialGradient(-7,-8,1, 0,1,22);
  tg.addColorStop(0,'#c4b5fd');
  tg.addColorStop(0.3,'#7c3aed');
  tg.addColorStop(0.65,'#5b21b6');
  tg.addColorStop(1,'#1e0a4a');
  ctx.fillStyle=tg; ctx.beginPath(); ctx.roundRect(-10,-10,20,22,5); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle='rgba(196,181,253,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle='rgba(255,255,255,0.16)';
  ctx.beginPath(); ctx.roundRect(-9,-9,13,9,4); ctx.fill();
  // Specular ellipse
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-5,-6,5,2.5,0.2,0,Math.PI*2); ctx.fill();
  // Torso panel lines
  ctx.strokeStyle='rgba(196,181,253,0.3)'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.moveTo(-10,-2); ctx.lineTo(10,-2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10,5); ctx.lineTo(10,5); ctx.stroke();
  // Shoulder pads — sphere-like radialGradients
  [[-14,-12],[6,-12]].forEach(([spx,spy]) => {
    const spG = ctx.createRadialGradient(spx+1,spy+1,0.5, spx+4,spy+4,8);
    spG.addColorStop(0,'#a78bfa');
    spG.addColorStop(0.4,'#7c3aed');
    spG.addColorStop(1,'#3b0f80');
    ctx.fillStyle=spG;
    ctx.beginPath(); ctx.roundRect(spx,spy,8,8,3); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.65)'; ctx.lineWidth=0.8; ctx.stroke();
    // Specular on shoulder pad
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(spx+1.5,spy+1.5,2,1.2,0.4,0,Math.PI*2); ctx.fill();
  });
  // Chest LED
  if(ledOn){
    ctx.save(); ctx.shadowBlur=10; ctx.shadowColor='#fbbf24';
    ctx.fillStyle='#fef08a';
    ctx.beginPath(); ctx.roundRect(-4,-6,8,8,2); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.roundRect(-4,-6,8,8,2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(-3,-5,3,6,1); ctx.fill();
    ctx.beginPath(); ctx.roundRect(0,-5,3,6,1); ctx.fill();
  }
  // Waist belt
  const wbG = ctx.createLinearGradient(-10,10,-10,14);
  wbG.addColorStop(0,'#4c1d95'); wbG.addColorStop(1,'#1a0836');
  ctx.fillStyle=wbG; ctx.beginPath(); ctx.roundRect(-10,10,20,4,1); ctx.fill();
  ctx.strokeStyle='rgba(124,58,237,0.6)'; ctx.lineWidth=0.6; ctx.stroke();

  // ── Arms — gradient strokes (lighter at joints) ──
  const lArm = drawLimb(-11,-6,12,10,lArmDeg,lArmDeg*0.4,'#5b21b6',5);
  const rArm = drawLimb( 11,-6,12,10,rArmDeg,rArmDeg*0.4,'#5b21b6',5);
  drawLimb(-11,-6,12,10,lArmDeg,lArmDeg*0.4,'rgba(139,92,246,0.4)',1.5);
  drawLimb( 11,-6,12,10,rArmDeg,rArmDeg*0.4,'rgba(139,92,246,0.4)',1.5);
  // Elbow joints — sphere-like
  [lArm.kx,rArm.kx].forEach((kx,i) => {
    const ky = i===0 ? lArm.ky : rArm.ky;
    const ejG = ctx.createRadialGradient(kx-0.8,ky-0.8,0.2, kx,ky,3);
    ejG.addColorStop(0,'#a78bfa');
    ejG.addColorStop(0.45,'#7c3aed');
    ejG.addColorStop(1,'#2e1065');
    ctx.fillStyle=ejG;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.55)'; ctx.lineWidth=0.6; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(kx-0.7,ky-0.8,0.9,0.55,0.5,0,Math.PI*2); ctx.fill();
  });
  // Hands — sphere-like
  [lArm,rArm].forEach(({ex,ey}) => {
    const hndG = ctx.createRadialGradient(ex-1.2,ey-1.2,0.4, ex,ey,4);
    hndG.addColorStop(0,'#8b5cf6');
    hndG.addColorStop(0.5,'#5b21b6');
    hndG.addColorStop(1,'#1e0a4a');
    ctx.fillStyle=hndG;
    ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.6)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.38)';
    ctx.beginPath(); ctx.ellipse(ex-1.2,ey-1.5,1.4,0.8,0.4,0,Math.PI*2); ctx.fill();
  });

  // ── Neck ──
  const nkG = ctx.createRadialGradient(-1.5,-13,0.5, 0,-11,5);
  nkG.addColorStop(0,'#7c3aed'); nkG.addColorStop(1,'#2e1065');
  ctx.fillStyle=nkG;
  ctx.beginPath(); ctx.roundRect(-3,-14,6,6,2); ctx.fill();

  // ── Head — radial gradient lit top-left + specular ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const hg = ctx.createRadialGradient(-7,-32,1, 0,-24,18);
  hg.addColorStop(0,'#ddd6fe');
  hg.addColorStop(0.3,'#a78bfa');
  hg.addColorStop(0.6,'#6d28d9');
  hg.addColorStop(1,'#2e1065');
  ctx.fillStyle=hg; ctx.beginPath(); ctx.roundRect(-10,-34,20,20,7); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle='rgba(221,214,254,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-9,-33,12,8,4); ctx.fill();
  // Specular ellipse bright
  ctx.fillStyle='rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-5,-30,4,2,0.2,0,Math.PI*2); ctx.fill();
  // Secondary micro specular
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-7,-32,1.2,0,Math.PI*2); ctx.fill();
  // Visor
  if(ledOn){
    ctx.save(); ctx.shadowBlur=10; ctx.shadowColor='#67e8f9';
    ctx.fillStyle='#a5f3fc';
    ctx.beginPath(); ctx.roundRect(-7,-30,14,9,3); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle='#164e63';
    ctx.beginPath(); ctx.roundRect(-7,-30,14,9,3); ctx.fill();
    ctx.fillStyle='#0e7490';
    ctx.beginPath(); ctx.roundRect(-6,-29,5,7,2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1,-29,5,7,2); ctx.fill();
    ctx.fillStyle='rgba(103,232,249,0.5)';
    ctx.beginPath(); ctx.arc(-3,-25.5,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(3,-25.5,1.5,0,Math.PI*2); ctx.fill();
  }
  // Chin/jaw detail
  ctx.fillStyle='#4c1d95';
  ctx.beginPath(); ctx.roundRect(-6,-17,12,3,1); ctx.fill();
  // Ear fins
  ctx.fillStyle='#6d28d9';
  ctx.beginPath(); ctx.moveTo(-10,-28); ctx.lineTo(-14,-24); ctx.lineTo(-10,-20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10,-28); ctx.lineTo(14,-24); ctx.lineTo(10,-20); ctx.closePath(); ctx.fill();
  // Antenna
  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,-34); ctx.lineTo(0,-41); ctx.stroke();
  const antG = ctx.createRadialGradient(-1,-42,0.5, 0,-41,3);
  antG.addColorStop(0,'#f5d0fe'); antG.addColorStop(1,'#a21caf');
  ctx.fillStyle=antG;
  ctx.beginPath(); ctx.arc(0,-41,3,0,Math.PI*2); ctx.fill();
  if(ledOn){ ctx.save(); ctx.shadowBlur=8; ctx.shadowColor='#f0abfc'; ctx.fill(); ctx.restore(); }
  ctx.strokeStyle='rgba(221,214,254,0.7)'; ctx.lineWidth=0.8; ctx.stroke();
}

function drawArm(ctx, state) {
  const { servoAngle, ledOn } = state;
  const angle1 = ((servoAngle||90)-90)*Math.PI/180;
  const angle2 = angle1*0.6;

  // ── Base plate — radial gradient from steel grey top to dark bottom ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const bpg = ctx.createRadialGradient(-10,15,1, 0,21,28);
  bpg.addColorStop(0,'#94a3b8');
  bpg.addColorStop(0.4,'#475569');
  bpg.addColorStop(1,'#0f1b2d');
  ctx.fillStyle=bpg; ctx.beginPath(); ctx.roundRect(-20,14,40,14,4); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  ctx.strokeStyle='rgba(71,85,105,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular strip top-left
  ctx.fillStyle='rgba(255,255,255,0.14)';
  ctx.beginPath(); ctx.roundRect(-19,14.5,18,4,2); ctx.fill();
  // Base bolts — sphere-like
  [[-16,18],[16,18],[-16,24],[16,24]].forEach(([bx,by])=>{
    const bltG = ctx.createRadialGradient(bx-0.5,by-0.5,0.2, bx,by,2);
    bltG.addColorStop(0,'#cbd5e1'); bltG.addColorStop(1,'#334155');
    ctx.fillStyle=bltG; ctx.beginPath(); ctx.arc(bx,by,2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(148,163,184,0.5)'; ctx.lineWidth=0.5; ctx.stroke();
  });
  // Mounting plate circle — sphere-like radialGradient
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const mpg = ctx.createRadialGradient(-3,11,1, 0,14,12);
  mpg.addColorStop(0,'#94a3b8');
  mpg.addColorStop(0.5,'#475569');
  mpg.addColorStop(1,'#0f1b2d');
  ctx.fillStyle=mpg; ctx.beginPath(); ctx.arc(0,14,12,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(71,85,105,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
  // Rim lighting on mounting plate
  ctx.strokeStyle='rgba(148,163,184,0.35)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.arc(0,14,11.5,0.4*Math.PI,0.85*Math.PI); ctx.stroke();
  // Specular on mounting plate
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(-3,11,3.5,2,0.3,0,Math.PI*2); ctx.fill();
  // Rotation ring
  ctx.strokeStyle='rgba(148,163,184,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(0,14,9,0,Math.PI*2); ctx.stroke();

  // ── Upper arm — radial gradient + specular ──
  ctx.save(); ctx.translate(0,14); ctx.rotate(angle1);
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const uag = ctx.createRadialGradient(-3,-18,1, 0,-18,12);
  uag.addColorStop(0,'#cbd5e1');
  uag.addColorStop(0.35,'#64748b');
  uag.addColorStop(0.7,'#2d3f52');
  uag.addColorStop(1,'#0c1825');
  ctx.fillStyle=uag; ctx.beginPath(); ctx.roundRect(-5,-36,10,36,4); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(203,213,225,0.65)'; ctx.lineWidth=1; ctx.stroke();
  // Upper arm specular highlight
  ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-4,-35,5,14,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-3,-28,1.8,6,0,0,Math.PI*2); ctx.fill();
  // Cable
  ctx.strokeStyle='rgba(100,116,139,0.7)'; ctx.lineWidth=1.5; ctx.setLineDash([2,2]);
  ctx.beginPath(); ctx.moveTo(3,-5); ctx.lineTo(3,-28); ctx.stroke();
  ctx.setLineDash([]);

  // Elbow joint — sphere-like radial gradient with bright highlight ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const ejg = ctx.createRadialGradient(-3,-38,0.5, 0,-36,8);
  ejg.addColorStop(0,'#a5b4fc');
  ejg.addColorStop(0.3,'#6366f1');
  ejg.addColorStop(0.65,'#3730a3');
  ejg.addColorStop(1,'#12106a');
  ctx.fillStyle=ejg; ctx.beginPath(); ctx.arc(0,-36,8,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(165,180,252,0.65)'; ctx.lineWidth=1.5; ctx.stroke();
  // Rim lighting on elbow
  ctx.strokeStyle='rgba(199,210,254,0.35)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.arc(0,-36,7.5,0.4*Math.PI,0.85*Math.PI); ctx.stroke();
  // Elbow specular
  ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(-2,-38,2.5,1.5,0.4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(199,210,254,0.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(0,-36,5,0,Math.PI*2); ctx.stroke();

  ctx.save(); ctx.translate(0,-36); ctx.rotate(angle2);

  // ── Forearm — radial gradient + specular ──
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const fag = ctx.createRadialGradient(-3,-14,0.5, 0,-14,9);
  fag.addColorStop(0,'#a5b4fc');
  fag.addColorStop(0.4,'#6366f1');
  fag.addColorStop(0.75,'#3730a3');
  fag.addColorStop(1,'#12106a');
  ctx.fillStyle=fag; ctx.beginPath(); ctx.roundRect(-4,-28,8,28,4); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(165,180,252,0.65)'; ctx.lineWidth=1; ctx.stroke();
  // Forearm specular
  ctx.fillStyle='rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.roundRect(-3,-27,4,12,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.38)';
  ctx.beginPath(); ctx.ellipse(-2.5,-22,1.5,5,0,0,Math.PI*2); ctx.fill();

  // Wrist joint — sphere-like radial gradient
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const wjg = ctx.createRadialGradient(-2,-30,0.5, 0,-28,6);
  wjg.addColorStop(0,'#67e8f9');
  wjg.addColorStop(0.4,'#0891b2');
  wjg.addColorStop(0.75,'#0c4a6e');
  wjg.addColorStop(1,'#021222');
  ctx.fillStyle=wjg; ctx.beginPath(); ctx.arc(0,-28,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(103,232,249,0.65)'; ctx.lineWidth=1.2; ctx.stroke();
  // Rim lighting on wrist
  ctx.strokeStyle='rgba(34,211,238,0.3)'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.arc(0,-28,5.7,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Wrist specular
  ctx.fillStyle='rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-1.5,-29.5,1.8,1,0.4,0,Math.PI*2); ctx.fill();

  // ── Gripper ──
  const gc = ledOn ? '#fbbf24' : '#0e7490';
  const gcl = ledOn ? '#fef08a' : '#22d3ee';
  if(ledOn){ ctx.save(); ctx.shadowBlur=8; ctx.shadowColor='#fbbf24'; }
  ctx.fillStyle=gc;
  ctx.beginPath(); ctx.roundRect(-7,-35,5,9,3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(2,-35,5,9,3); ctx.fill();
  ctx.fillStyle=gcl;
  ctx.beginPath(); ctx.roundRect(-6.5,-34.5,2,4,1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(4.5,-34.5,2,4,1); ctx.fill();
  if(ledOn) ctx.restore();
  ctx.strokeStyle=gcl; ctx.lineWidth=0.8;
  ctx.strokeRect(-7,-35,5,9); ctx.strokeRect(2,-35,5,9);

  ctx.restore(); ctx.restore();

  // Angle label
  ctx.fillStyle='#94a3b8'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(`${Math.round(servoAngle||90)}°`,0,32);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(99,102,241,0.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 480; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,360); ctx.stroke(); }
  for (let y = 0; y < 360; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(480,y); ctx.stroke(); }
}

/* ─── Track definitions & draw functions ─── */
const TRACKS = [
  { id: 'open',      icon: '⬜', label: 'Open Field',    desc: 'Plain grid — no obstacles' },
  { id: 'square',    icon: '⬛', label: 'Square Track',   desc: 'Rectangular loop road' },
  { id: 'figure8',   icon: '∞',  label: 'Figure 8',      desc: 'Figure-8 loop crossing in the middle' },
  { id: 'linefollow',icon: '〰️', label: 'Line Follow',   desc: 'Winding black line on white' },
  { id: 'maze',      icon: '🧩', label: 'Maze',          desc: 'Navigate through walls' },
  { id: 'obstacles', icon: '🔴', label: 'Obstacles',     desc: 'Dodge scattered obstacles' },
  { id: 'city',      icon: '🏙️', label: 'City Grid',     desc: 'Drive through road intersections' },
  { id: 'ramp',      icon: '🏔️', label: 'Ramp Course',   desc: 'Angled ramps and speed zones' },
];

function drawTrack(ctx, trackId) {
  if (!trackId || trackId === 'open') return;
  ctx.save();
  ctx.scale(1.5, 1.5); // tracks designed for 320×240; scale to 480×360

  if (trackId === 'square') {
    // Grass background
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 320, 240);
    // Road (outer minus inner)
    ctx.fillStyle = '#475569';
    ctx.fillRect(18, 14, 284, 212);
    ctx.fillStyle = '#166534';
    ctx.fillRect(62, 50, 196, 140);
    // Kerb lines (white border)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.strokeRect(18, 14, 284, 212);
    ctx.strokeRect(62, 50, 196, 140);
    // Centre dashes
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([12, 8]);
    ctx.strokeRect(40, 32, 240, 176);
    ctx.setLineDash([]);
    // Start/finish line
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) { ctx.fillStyle = '#ffffff'; } else { ctx.fillStyle = '#000'; }
      ctx.fillRect(155 + i*6, 14, 6, 18);
    }
  }

  else if (trackId === 'figure8') {
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 320, 240);
    // Draw two circular road loops
    const drawLoop = (cx, cy, ro, ri) => {
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, Math.PI*2);
      ctx.fillStyle = '#475569'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI*2);
      ctx.fillStyle = '#166534'; ctx.fill();
      // kerb
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI*2); ctx.stroke();
      // centre dash
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(cx, cy, (ro+ri)/2, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    };
    drawLoop(100, 120, 72, 38);
    drawLoop(220, 120, 72, 38);
    // Fill crossover bridge (hide gap)
    ctx.fillStyle = '#475569';
    ctx.fillRect(145, 98, 30, 44);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(145, 98, 30, 44);
    // Start marker
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(100, 55, 5, 0, Math.PI*2); ctx.fill();
  }

  else if (trackId === 'linefollow') {
    // White background
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 320, 240);
    // Draw faint dots
    ctx.fillStyle = 'rgba(99,102,241,0.1)';
    for (let x = 16; x < 320; x += 32) for (let y = 16; y < 240; y += 32) { ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); }
    // Winding black line
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.bezierCurveTo(60, 30,  120, 30,  160, 120);
    ctx.bezierCurveTo(200, 210, 260, 210, 290, 120);
    ctx.stroke();
    // Start dot
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(30, 120, 8, 0, Math.PI*2); ctx.fill();
    // End dot
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(290, 120, 8, 0, Math.PI*2); ctx.fill();
    // labels
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('START', 30, 108); ctx.fillText('END', 290, 108);
  }

  else if (trackId === 'maze') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 320, 240);
    // Floor
    ctx.fillStyle = '#1e293b'; ctx.fillRect(8, 8, 304, 224);
    // Walls
    const walls = [
      [8,8,304,12],   // top
      [8,220,304,12], // bottom
      [8,8,12,224],   // left
      [300,8,12,224], // right
      [8,8,12,120],[70,8,12,80],[70,80,100,12],[170,8,12,80],[170,80,100,12],[270,8,12,120],
      [70,160,12,80],[170,160,12,80],
      [100,110,120,12],[100,130,120,12],
      [8,120,60,12],[252,120,60,12],
    ];
    ctx.fillStyle = '#334155';
    walls.forEach(([x,y,w,h]) => {
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='#475569'; ctx.lineWidth=1; ctx.setLineDash([]);
      ctx.strokeRect(x,y,w,h);
    });
    // Start
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(40, 60, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('S', 40, 63);
    // End
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(280, 180, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('E', 280, 183);
  }

  else if (trackId === 'obstacles') {
    ctx.fillStyle = '#0c4a6e'; ctx.fillRect(0, 0, 320, 240);
    // Grid marks
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < 320; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,240); ctx.stroke(); }
    for (let y = 0; y < 240; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(320,y); ctx.stroke(); }
    // Obstacles
    const obs = [
      [100,60,18,'#ef4444'],[200,80,14,'#ef4444'],[80,160,16,'#ef4444'],
      [240,160,18,'#ef4444'],[160,120,12,'#f97316'],[130,200,14,'#ef4444'],
      [260,50,10,'#f97316'],[50,100,12,'#dc2626'],[290,190,16,'#ef4444'],
    ];
    obs.forEach(([x,y,r,c]) => {
      const g = ctx.createRadialGradient(x-r*0.3,y-r*0.3,1,x,y,r);
      g.addColorStop(0,'#fca5a5'); g.addColorStop(1,c);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7f1d1d'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('!',x,y+3);
    });
    // Start
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(30,210,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.fillText('S',30,213);
  }

  else if (trackId === 'city') {
    ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, 320, 240);
    // Roads (horizontal)
    const roads = [[0,80,320,40],[0,160,320,40]];
    // Roads (vertical)
    roads.push([80,0,40,240],[200,0,40,240]);
    ctx.fillStyle = '#374151';
    roads.forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));
    // Road lines
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([10,8]);
    // horizontal centre lines
    ctx.beginPath(); ctx.moveTo(0,100); ctx.lineTo(80,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(120,100); ctx.lineTo(200,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(240,100); ctx.lineTo(320,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,180); ctx.lineTo(80,180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(120,180); ctx.lineTo(200,180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(240,180); ctx.lineTo(320,180); ctx.stroke();
    // vertical centre lines
    ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(100,80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100,120); ctx.lineTo(100,160); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100,200); ctx.lineTo(100,240); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,0); ctx.lineTo(220,80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,120); ctx.lineTo(220,160); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,200); ctx.lineTo(220,240); ctx.stroke();
    ctx.setLineDash([]);
    // Buildings (blocks)
    ctx.fillStyle = '#1e3a5f';
    [[10,10,62,62],[130,10,62,62],[250,10,62,62],
     [10,130,62,22],[130,130,62,22],[250,130,62,22],
     [10,168,62,62],[130,168,62,62],[250,168,62,62]].forEach(([x,y,w,h]) => {
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='#2563eb'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
      // windows
      ctx.fillStyle='#93c5fd';
      for (let wx=x+6;wx<x+w-8;wx+=10) for (let wy=y+6;wy<y+h-8;wy+=10) ctx.fillRect(wx,wy,5,5);
      ctx.fillStyle='#1e3a5f';
    });
    // Start marker
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(160,120,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText('S',160,123);
  }

  else if (trackId === 'ramp') {
    // Ground
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 320, 240);
    // Tarmac base
    ctx.fillStyle = '#292524'; ctx.fillRect(20, 20, 280, 200);
    // Speed zones
    const zones = [[20,20,90,200,'#16a34a22'],[110,20,100,200,'#fbbf2422'],[210,20,90,200,'#dc262622']];
    zones.forEach(([x,y,w,h,c]) => { ctx.fillStyle=c; ctx.fillRect(x,y,w,h); });
    // Zone labels
    ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillStyle='#22c55e'; ctx.fillText('SLOW',65,235);
    ctx.fillStyle='#f59e0b'; ctx.fillText('MEDIUM',160,235);
    ctx.fillStyle='#ef4444'; ctx.fillText('FAST',255,235);
    // Ramps (trapezoid shapes)
    const ramps = [[50,120,70,20,'#6b7280'],[180,80,80,20,'#6b7280'],[220,160,70,20,'#6b7280']];
    ramps.forEach(([x,y,w,h,c]) => {
      ctx.fillStyle=c;
      ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+10,y); ctx.lineTo(x+w-10,y); ctx.lineTo(x+w,y+h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#9ca3af'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#d1d5db'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('▲',x+w/2,y+h-3);
    });
    // Speed limit signs
    [[100,30,'30'],[200,30,'60'],[300,30,'90']].forEach(([x,y,v]) => {
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ef4444'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#000'; ctx.font='bold 7px monospace'; ctx.textAlign='center'; ctx.fillText(v,x,y+3);
    });
    // Kerb lines
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.setLineDash([]);
    ctx.strokeRect(20,20,280,200);
    // Start line
    ctx.setLineDash([]);
    for (let i=0;i<5;i++) { ctx.fillStyle=i%2===0?'#fff':'#000'; ctx.fillRect(20+i*6,20,6,14); }
  }

  ctx.restore(); // undo scale(1.5, 1.5)
}

function drawTrail(ctx, trail) {
  if (trail.length < 2) return;
  ctx.beginPath(); ctx.strokeStyle = 'rgba(99,102,241,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
  trail.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.stroke(); ctx.setLineDash([]);
}

/* ─── Virtual robot display ─── */
/* ease in-out cubic */
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

/* ─── Virtual robot — smooth animation via ref API ─── */
const VirtualRobot = forwardRef(function VirtualRobot({ simRobotType, simTrack, isFullscreen }, ref) {
  const canvasRef = useRef(null);
  const posRef   = useRef({ x: 240, y: 180, angle: -90 });
  const trailRef = useRef([]);
  const stateRef = useRef({ ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0, headlightL: null, headlightR: null });
  const animLoopRef = useRef(null);
  const audioCtxRef = useRef(null);
  const activeOscRef = useRef([]);

  // Output display state (React state so panel re-renders when lights change)
  const [out, setOut] = useState({
    headlightL: null, headlightR: null,
    neopixels: Array(8).fill(null), neoCount: 8,
    displayText: '', displayIcon: null,
    ledMatrix: Array(25).fill(0),
  });
  const outRef = useRef(out);
  const updateOut = (patch) => {
    outRef.current = { ...outRef.current, ...patch };
    setOut({ ...outRef.current });
  };

  // Named colour → {r,g,b}
  const NAMED_RGB = { red:[255,0,0], green:[0,200,0], blue:[0,0,255], yellow:[255,220,0], cyan:[0,220,220], magenta:[220,0,220], white:[255,255,255], orange:[255,140,0], pink:[255,0,150], purple:[150,0,255], off:[0,0,0] };
  const namedToRgb = (n) => { const c = NAMED_RGB[(n||'').toLowerCase()] || [255,255,255]; return {r:c[0],g:c[1],b:c[2]}; };
  const rgbStr = (c) => c ? `rgb(${c.r},${c.g},${c.b})` : null;
  const NOTE_FREQ = {
    C3: 131, D3: 147, E3: 165, F3: 175, G3: 196, A3: 220, B3: 247,
    C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, E5: 659,
  };

  const getAudioCtx = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  };

  const playTone = (freq = 440, seconds = 0.25) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const dur = Math.max(0.05, Number(seconds) || 0.25);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Number(freq) || 440, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
    activeOscRef.current.push({ osc, gain });
    osc.onended = () => {
      activeOscRef.current = activeOscRef.current.filter((n) => n.osc !== osc);
    };
  };

  const playMelody = (name = 'happy') => {
    const tunes = {
      happy: ['C4', 'E4', 'G4', 'C5'],
      sad: ['C4', 'A3', 'G3', 'E3'],
      power_up: ['C4', 'E4', 'G4', 'C5', 'E5'],
      siren: ['A4', 'E4', 'A4', 'E4'],
      birthday: ['C4', 'C4', 'D4', 'C4', 'F4', 'E4'],
      twinkle: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
    };
    const seq = tunes[String(name || '').toLowerCase()] || tunes.happy;
    seq.forEach((note, idx) => {
      setTimeout(() => playTone(NOTE_FREQ[note] || 440, 0.22), idx * 180);
    });
  };

  // Micro:bit 5×5 icon patterns (row-major, 1=on)
  const MB_ICONS = {
    HAPPY:    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0],
    SAD:      [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,1],
    HEART:    [0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],
    YES:      [0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0],
    NO:       [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
    ARROW_N:  [0,0,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0],
    ARROW_S:  [0,0,1,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,0],
    ARROW_E:  [0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,0],
    ARROW_W:  [0,0,1,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0],
    SURPRISED:[0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0],
    ANGRY:    [1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,1],
    DIAMOND:  [0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0],
    SKULL:    [0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,0],
    ASLEEP:   [0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,1,1,1,0],
    CONFUSED: [0,1,1,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0],
  };

  /* pixel scale: 1cm = 4px, capped to keep robot on screen */
  const CM_TO_PX = 1;  /* 1 step = 1 pixel */
  const DEG_PER_MS = 0.18;   /* ~180°/s turn speed */
  const PX_PER_MS  = 0.18;   /* ~180px/s drive speed */

  // Resize canvas to native screen size when fullscreen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isFullscreen) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width  = 480;
      canvas.height = 360;
    }
  }, [isFullscreen]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Scale everything to logical 480×360 space
    const sx = W / 480, sy = H / 360;
    ctx.save();
    ctx.scale(sx, sy);

    drawTrack(ctx, simTrack);
    if (!simTrack || simTrack === 'open') drawGrid(ctx);
    const state = stateRef.current;

    if (simRobotType === 'arm') {
      ctx.save(); ctx.translate(240, 200);
      drawArm(ctx, state);
      ctx.restore();
    } else {
      drawTrail(ctx, trailRef.current);
      const { x, y, angle } = posRef.current;
      ctx.save(); ctx.translate(x, y);
      if (simRobotType === 'humanoid') {
        const facingLeft = Math.cos(angle * Math.PI / 180) < -0.1;
        if (facingLeft) ctx.scale(-1, 1);
        drawHumanoid(ctx, state);
      } else {
        // Sprites are drawn with front facing local -Y (upward).
        // Movement uses standard math angles (0=right, -90=up).
        // Pre-rotate +90° so the sprite visually matches the movement direction.
        ctx.rotate(angle * Math.PI / 180);
        ctx.rotate(Math.PI / 2);
        if      (simRobotType === 'rover')  drawRover(ctx, state);
        else if (simRobotType === 'tank')   drawTank(ctx, state);
        else if (simRobotType === 'drone')  drawDrone(ctx, state);
        else if (simRobotType === 'spider') drawSpider(ctx, state);
        else drawRover(ctx, state);
      }
      ctx.restore();
    }
    // Hover / drag highlight ring around robot
    if (simRobotType !== 'arm') {
      const { x, y } = posRef.current;
      if (hoverRobotRef.current || draggingRobotRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.strokeStyle = draggingRobotRef.current ? '#facc15' : '#a78bfa';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Small drag icon hint
        ctx.fillStyle = draggingRobotRef.current ? '#facc15cc' : '#a78bfacc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(draggingRobotRef.current ? '✥ dragging' : '✥ drag me', x, y - 36);
        ctx.restore();
      }
    }

    ctx.restore(); // pop scale
  }, [simRobotType, simTrack, isFullscreen]);

  /* continuous tick loop — keeps animated robots alive */
  useEffect(() => {
    let id;
    const tick = () => {
      stateRef.current.tick = (stateRef.current.tick || 0) + 1;
      drawFrame();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [drawFrame]);

  /* reset on robot type change */
  useEffect(() => {
    posRef.current = { x: 160, y: 120, angle: -90 };
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, [simRobotType]);

  /* ─── Animate a single command, return Promise that resolves when done ─── */
  const execute = useCallback((cmd) => {
    return new Promise(resolve => {
      const { id, params } = cmd;
      const p = posRef.current;
      const s = stateRef.current;

      /* non-movement commands resolve immediately */
      if (id === 'stop' || id === 'coast') { s.moving = false; resolve(); return; }
      if (id === 'wait') { setTimeout(resolve, (parseFloat(params?.secs)||1) * 1000); return; }
      if (id === 'buzz') { playTone(440, parseFloat(params?.secs || 0.5)); resolve(); return; }
      if (id === 'play_note') { playTone(NOTE_FREQ[String(params?.note || 'C4').toUpperCase()] || 262, parseFloat(params?.secs || 0.5)); resolve(); return; }
      if (id === 'play_melody') { playMelody(params?.melody || 'happy'); resolve(); return; }
      if (id === 'servo' || id === 'servo_sweep') {
        const targetAngle = parseFloat(params?.angle || params?.to || 90);
        const startAngle  = s.servoAngle;
        const diff = targetAngle - startAngle;
        const dur  = Math.abs(diff) * 8 + 200;
        const t0   = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          s.servoAngle = startAngle + diff * easeInOut(prog);
          if (prog < 1) requestAnimationFrame(go); else resolve();
        };
        requestAnimationFrame(go); return;
      }

      // ── Headlights ──
      if (id === 'headlight') {
        const c = { r: +(params?.r??255), g: +(params?.g??255), b: +(params?.b??255) };
        s.headlightL = c; s.headlightR = c;
        updateOut({ headlightL: c, headlightR: c }); resolve(); return;
      }
      if (id === 'headlight_l') {
        const c = { r: +(params?.r??255), g: +(params?.g??0), b: +(params?.b??0) };
        s.headlightL = c; updateOut({ headlightL: c }); resolve(); return;
      }
      if (id === 'headlight_r') {
        const c = { r: +(params?.r??0), g: +(params?.g??0), b: +(params?.b??255) };
        s.headlightR = c; updateOut({ headlightR: c }); resolve(); return;
      }

      // ── NeoPixel ──
      if (id === 'neo_init') {
        const n = +(params?.n || 8);
        updateOut({ neoCount: n, neopixels: Array(n).fill(null) }); resolve(); return;
      }
      if (id === 'neo_color') {
        const pxs = [...outRef.current.neopixels];
        pxs[+(params?.idx||0)] = namedToRgb(params?.color);
        updateOut({ neopixels: pxs }); resolve(); return;
      }
      if (id === 'neo_rgb') {
        const pxs = [...outRef.current.neopixels];
        pxs[+(params?.idx||0)] = { r: +(params?.r||0), g: +(params?.g||0), b: +(params?.b||0) };
        updateOut({ neopixels: pxs }); resolve(); return;
      }
      if (id === 'neo_all') {
        const c = { r: +(params?.r||0), g: +(params?.g||0), b: +(params?.b||0) };
        updateOut({ neopixels: Array(outRef.current.neoCount || 8).fill(c) }); resolve(); return;
      }
      if (id === 'neo_clear') { updateOut({ neopixels: Array(outRef.current.neoCount||8).fill(null) }); resolve(); return; }
      if (id === 'neo_show' || id === 'neo_bright') { resolve(); return; }

      // ── Display / micro:bit ──
      if (id === 'display' || id === 'disp_scroll' || id === 'show_num') {
        const txt = params?.text || String(params?.num ?? '') || '';
        updateOut({ displayText: txt, displayIcon: null, ledMatrix: Array(25).fill(0) });
        setTimeout(resolve, Math.max(600, txt.length * 120)); return;
      }
      if (id === 'show_icon') {
        const icon = params?.icon || 'HAPPY';
        const matrix = MB_ICONS[icon] || Array(25).fill(0);
        updateOut({ displayIcon: icon, displayText: '', ledMatrix: matrix });
        setTimeout(resolve, 800); return;
      }
      if (id === 'disp_show') { updateOut({ displayText: String(params?.val ?? ''), displayIcon: null }); resolve(); return; }
      if (id === 'disp_image') {
        const icon = params?.icon || 'HAPPY';
        const matrix = MB_ICONS[icon] || Array(25).fill(0);
        updateOut({ displayIcon: icon, displayText: '', ledMatrix: matrix }); resolve(); return;
      }
      if (id === 'disp_pixel') {
        const mx = [...outRef.current.ledMatrix];
        mx[+(params?.y||0)*5 + +(params?.x||0)] = +(params?.bright||9);
        updateOut({ ledMatrix: mx, displayText: '', displayIcon: null }); resolve(); return;
      }
      if (id === 'disp_clear') { updateOut({ displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) }); resolve(); return; }
      if (id === 'led') { s.ledOn = (params?.color||'') !== 'off'; resolve(); return; }
      if (id === 'led_rgb') { s.ledOn = true; resolve(); return; }
      if (id === 'clear_disp') { s.ledOn = false; updateOut({ displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) }); resolve(); return; }

      /* movement commands */
      const FORWARD  = ['forward','follow_line','avoid_wall'];
      const BACKWARD = ['back'];
      const STRAFEL  = ['move_left'];
      const STRAFER  = ['move_right'];
      const TURNL    = ['left','spin_left'];
      const TURNR    = ['right','spin_right'];

      if (FORWARD.includes(id) || BACKWARD.includes(id) || STRAFEL.includes(id) || STRAFER.includes(id)) {
        const cm   = parseFloat(params?.amount || 80);
        const dist = Math.min(cm * CM_TO_PX, 400);
        const dur  = dist / PX_PER_MS;
        // Forward/back use facing angle; strafe is 90° perpendicular
        const baseRad = p.angle * Math.PI / 180;
        let moveRad, dir;
        if (STRAFEL.includes(id))      { moveRad = baseRad - Math.PI / 2; dir = 1; }
        else if (STRAFER.includes(id)) { moveRad = baseRad + Math.PI / 2; dir = 1; }
        else                           { moveRad = baseRad; dir = BACKWARD.includes(id) ? -1 : 1; }
        const rad  = moveRad;
        const startX = p.x, startY = p.y;
        const endX   = Math.max(20, Math.min(460, startX + Math.cos(rad) * dist * dir));
        const endY   = Math.max(20, Math.min(340, startY + Math.sin(rad) * dist * dir));
        trailRef.current.push({ x: startX, y: startY });
        s.moving = true;
        const t0 = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          const ease = easeInOut(prog);
          p.x = startX + (endX - startX) * ease;
          p.y = startY + (endY - startY) * ease;
          s.wheelAngle = (s.wheelAngle || 0) + dir * 8;
          if (prog < 1) { requestAnimationFrame(go); }
          else {
            p.x = endX; p.y = endY;
            s.moving = false;
            if (trailRef.current.length > 80) trailRef.current = trailRef.current.slice(-80);
            resolve();
          }
        };
        requestAnimationFrame(go);

      } else if (TURNL.includes(id) || TURNR.includes(id)) {
        const deg    = parseFloat(params?.degrees || 90);
        const dir    = TURNL.includes(id) ? -1 : 1;
        const total  = deg * dir;
        const dur    = Math.abs(deg) / DEG_PER_MS;
        const startA = p.angle;
        s.moving = true;
        const t0 = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          p.angle = startA + total * easeInOut(prog);
          s.wheelAngle = (s.wheelAngle || 0) + dir * 5;
          if (prog < 1) { requestAnimationFrame(go); }
          else { p.angle = startA + total; s.moving = false; resolve(); }
        };
        requestAnimationFrame(go);

      } else {
        resolve();
      }
    });
  }, [CM_TO_PX, PX_PER_MS, DEG_PER_MS]);

  const reset = useCallback(() => {
    posRef.current = { x: 240, y: 180, angle: -90 };
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, []);

  // Soft reset — clears trail & state, resets angle to face up, keeps x/y position
  const resetState = useCallback(() => {
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    posRef.current = { ...posRef.current, angle: -90 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, []);

  useImperativeHandle(ref, () => ({ execute, reset, resetState }), [execute, reset, resetState]);

  // Convert a mouse event's CSS coords → logical 480×360 canvas coords
  const toLogical = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * 480,
      y: ((e.clientY - rect.top)  / rect.height) * 360,
    };
  };

  const draggingRobotRef = useRef(false);
  const dragOffsetRef    = useRef({ x: 0, y: 0 });
  const hoverRobotRef    = useRef(false);

  const handleMouseDown = (e) => {
    const { x, y } = toLogical(e);
    const p = posRef.current;
    const dist = Math.hypot(x - p.x, y - p.y);
    if (dist < 36) { // hit-test radius
      draggingRobotRef.current = true;
      dragOffsetRef.current = { x: x - p.x, y: y - p.y };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = toLogical(e);
    const p = posRef.current;
    hoverRobotRef.current = Math.hypot(x - p.x, y - p.y) < 36;
    if (draggingRobotRef.current) {
      posRef.current.x = Math.max(20, Math.min(460, x - dragOffsetRef.current.x));
      posRef.current.y = Math.max(20, Math.min(340, y - dragOffsetRef.current.y));
    }
    // Update cursor live
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = draggingRobotRef.current ? 'grabbing' : hoverRobotRef.current ? 'grab' : 'crosshair';
  };

  const handleMouseUp = () => { draggingRobotRef.current = false; };

  const hasOutput = out.headlightL || out.headlightR || out.neopixels.some(Boolean) || out.displayText || out.displayIcon || out.ledMatrix.some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <canvas ref={canvasRef} width={480} height={360}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          borderRadius: isFullscreen ? 0 : 10,
          background: '#080818', display: 'block',
          width: '100%', height: isFullscreen ? '100%' : 'auto',
          maxWidth: isFullscreen ? '100%' : 480,
          cursor: 'crosshair',
        }} />

      {/* ── Output Panel ── */}
      <div style={{
        background: '#0f172a', borderTop: '1px solid #1e293b',
        borderRadius: '0 0 10px 10px', padding: '10px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: 56,
      }}>
        {/* Headlights row — always visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>💡 Headlights</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['L','R'].map((side, i) => {
              const c = i === 0 ? out.headlightL : out.headlightR;
              const col = rgbStr(c) || '#1e293b';
              const glow = c && (c.r + c.g + c.b) > 10;
              return (
                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: col,
                    boxShadow: glow ? `0 0 10px 4px ${col}` : 'none',
                    border: '1.5px solid #334155',
                    transition: 'all 0.2s',
                    }} />
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>{side}</span>
                  </div>
                );
              })}
            </div>
          </div>

        {/* NeoPixel strip */}
        {out.neopixels.some(Boolean) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>🌈 NeoPixels</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {out.neopixels.map((c, i) => {
                const col = rgbStr(c) || '#1e293b';
                const glow = c && (c.r + c.g + c.b) > 10;
                return (
                  <div key={i} style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: col,
                    boxShadow: glow ? `0 0 8px 3px ${col}` : 'none',
                    border: '1.5px solid #334155',
                    transition: 'all 0.2s',
                  }} />
                );
              })}
            </div>
          </div>
        )}

        {/* LED matrix (5×5) */}
        {(out.ledMatrix.some(Boolean) || out.displayText) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>📟 Display</span>
            {out.displayText ? (
              <div style={{
                background: '#1e293b', borderRadius: 6, padding: '4px 12px',
                color: '#f59e0b', fontFamily: 'monospace', fontSize: 15, fontWeight: 700,
                letterSpacing: 2, border: '1px solid #334155',
                maxWidth: 220, overflow: 'hidden', whiteSpace: 'nowrap',
                animation: out.displayText.length > 4 ? 'lh-scroll 3s linear infinite' : 'none',
              }}>
                {out.displayText}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,14px)', gap: 2 }}>
                {out.ledMatrix.map((b, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: b > 0 ? `rgba(251,191,36,${b/9})` : '#1e293b',
                    boxShadow: b > 0 ? `0 0 6px 2px rgba(251,191,36,${b/12})` : 'none',
                    transition: 'all 0.15s',
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Idle state */}
        {!hasOutput && (
          <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic', textAlign: 'center', paddingBottom: 2 }}>
            Run a Lights or Outputs block to see it here
          </div>
        )}
      </div>
    </div>
  );
});

export { SIM_ROBOTS, TRACKS, VirtualRobot };
