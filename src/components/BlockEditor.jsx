import React, { useState, useRef, useEffect, useCallback } from 'react';

let _uid = 0;
const uid = () => String(++_uid);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function darken(hex, amt = 50) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Sprite characters ──────────────────────────────────────────────────
const SPRITES = [
  { id: 'rocket',    label: 'Rocket',    emoji: '🚀', color: '#ef4444' },
  { id: 'cat',       label: 'Cat',       emoji: '🐱', color: '#f59e0b' },
  { id: 'robot',     label: 'Robot',     emoji: '🤖', color: '#6366f1' },
  { id: 'dragon',    label: 'Dragon',    emoji: '🐉', color: '#10b981' },
  { id: 'shark',     label: 'Shark',     emoji: '🦈', color: '#06b6d4' },
  { id: 'ninja',     label: 'Ninja',     emoji: '🥷', color: '#8b5cf6' },
  { id: 'butterfly', label: 'Butterfly', emoji: '🦋', color: '#ec4899' },
  { id: 'car',       label: 'Race Car',  emoji: '🏎️', color: '#f97316' },
];

// ── Themed backgrounds ─────────────────────────────────────────────────
const BACKGROUNDS = [
  {
    id: 'space', label: 'Space', thumb: ['#000012', '#0a0a2e'],
    draw(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#000012'); g.addColorStop(1, '#0a0a2e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 37.1) * 0.5 + 0.5) * W;
        const sy = (Math.sin(i * 19.3) * 0.5 + 0.5) * H;
        const sr = 0.5 + (i % 3) * 0.5;
        ctx.globalAlpha = 0.4 + (i % 5) * 0.12;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // planet
      ctx.fillStyle = '#4a1d96'; ctx.beginPath(); ctx.arc(W - 52, 44, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(W - 58, 38, 18, 0, Math.PI * 2); ctx.fill();
    }
  },
  {
    id: 'ocean', label: 'Ocean', thumb: ['#0369a1', '#0ea5e9'],
    draw(ctx, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, '#93c5fd'); sky.addColorStop(1, '#bfdbfe');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);
      const sea = ctx.createLinearGradient(0, H * 0.55, 0, H);
      sea.addColorStop(0, '#0369a1'); sea.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = sea; ctx.fillRect(0, H * 0.55, W, H);
      // sun
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(W * 0.15, H * 0.18, 22, 0, Math.PI * 2); ctx.fill();
      // waves
      ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2;
      for (let w = 0; w < 3; w++) {
        ctx.beginPath(); ctx.moveTo(0, H * 0.58 + w * 18);
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, H * 0.58 + w * 18 + Math.sin(x * 0.08) * 5);
        ctx.stroke();
      }
    }
  },
  {
    id: 'jungle', label: 'Jungle', thumb: ['#14532d', '#15803d'],
    draw(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#166534'); g.addColorStop(1, '#14532d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // ground
      ctx.fillStyle = '#713f12'; ctx.fillRect(0, H * 0.75, W, H);
      // trees
      const drawTree = (tx, th) => {
        ctx.fillStyle = '#78350f'; ctx.fillRect(tx - 6, H * 0.75 - th * 0.4, 12, th * 0.4);
        ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(tx, H * 0.75 - th * 0.4, th * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(tx, H * 0.75 - th * 0.55, th * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(tx, H * 0.75 - th * 0.65, th * 0.2, 0, Math.PI * 2); ctx.fill();
      };
      [[30,90],[80,110],[W-40,100],[W-90,80],[W/2-20,120],[W/2+40,90]].forEach(([x,h]) => drawTree(x,h));
    }
  },
  {
    id: 'city', label: 'City', thumb: ['#1e293b', '#334155'],
    draw(ctx, W, H) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1e3a5f'); g.addColorStop(1, '#0f172a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // moon
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.15, 18, 0, Math.PI * 2); ctx.fill();
      // buildings
      const buildings = [[0,60,50,H],[60,40,40,H],[110,80,60,H],[180,30,35,H],[225,65,50,H],[280,45,40,H],[330,75,55,H]];
      buildings.forEach(([x, h, w, fH]) => {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x, fH - h, w, h);
        ctx.fillStyle = '#fbbf24';
        for (let r = 0; r < Math.floor(h / 18); r++)
          for (let c = 0; c < Math.floor(w / 14); c++)
            if (Math.random() > 0.4) { ctx.globalAlpha = 0.6 + Math.random() * 0.4; ctx.fillRect(x + c * 14 + 3, fH - h + r * 18 + 3, 8, 10); }
        ctx.globalAlpha = 1;
      });
    }
  },
  {
    id: 'desert', label: 'Desert', thumb: ['#92400e', '#fbbf24'],
    draw(ctx, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      sky.addColorStop(0, '#fcd34d'); sky.addColorStop(1, '#f97316');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);
      const sand = ctx.createLinearGradient(0, H * 0.6, 0, H);
      sand.addColorStop(0, '#d97706'); sand.addColorStop(1, '#92400e');
      ctx.fillStyle = sand; ctx.fillRect(0, H * 0.6, W, H);
      // dunes
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.moveTo(0, H * 0.75); ctx.quadraticCurveTo(W * 0.3, H * 0.55, W * 0.6, H * 0.75); ctx.lineTo(W * 0.6, H); ctx.lineTo(0, H); ctx.fill();
      ctx.fillStyle = '#92400e';
      ctx.beginPath(); ctx.moveTo(W * 0.4, H * 0.8); ctx.quadraticCurveTo(W * 0.7, H * 0.6, W, H * 0.75); ctx.lineTo(W, H); ctx.lineTo(W * 0.4, H); ctx.fill();
      // sun
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.2, 30, 0, Math.PI * 2); ctx.fill();
    }
  },
  {
    id: 'arcade', label: 'Arcade', thumb: ['#4a044e', '#86198f'],
    draw(ctx, W, H) {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);
      // grid lines
      ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // glow dots
      const dotColors = ['#f0abfc','#818cf8','#34d399','#f87171','#fbbf24'];
      for (let i = 0; i < 20; i++) {
        const dx = (Math.sin(i * 23.7) * 0.5 + 0.5) * W;
        const dy = (Math.cos(i * 17.3) * 0.5 + 0.5) * H;
        ctx.fillStyle = dotColors[i % dotColors.length];
        ctx.shadowColor = dotColors[i % dotColors.length]; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  },
];

// ── Block category definitions ────────────────────────────────────────
const CATS = [
  { id: 'event',    label: 'Events',    color: '#f59e0b', icon: '⚡' },
  { id: 'motion',   label: 'Motion',    color: '#3b82f6', icon: '🏃' },
  { id: 'looks',    label: 'Looks',     color: '#9333ea', icon: '👁️' },
  { id: 'control',  label: 'Control',   color: '#059669', icon: '🔄' },
  { id: 'sensing',  label: 'Sensing',   color: '#06b6d4', icon: '🔍' },
  { id: 'sound',    label: 'Sound',     color: '#84cc16', icon: '🔊' },
  { id: 'variable', label: 'Variables', color: '#f97316', icon: '📦' },
  { id: 'math',     label: 'Math',      color: '#ef4444', icon: '🔢' },
  { id: 'game',     label: 'Game',      color: '#e11d48', icon: '🎮' },
  { id: 'physics',  label: 'Physics',   color: '#1abc9c', icon: '💨' },
  { id: 'ai',       label: 'AI',        color: '#a855f7', icon: '🤖' },
];

// ── Block palette definitions ─────────────────────────────────────────
const PALETTE = {
  event: [
    { type:'when_flag',   hat:true, parts:['When 🚩 clicked'] },
    { type:'when_key',    hat:true, parts:['When key',{k:'key',t:'str',v:'space',w:55},'pressed'] },
    { type:'when_click',  hat:true, parts:['When sprite clicked'] },
    { type:'broadcast',            parts:['Broadcast',{k:'msg',t:'str',v:'start',w:70}] },
    { type:'on_message',  hat:true, parts:['When I receive',{k:'msg',t:'str',v:'start',w:70}] },
  ],
  motion: [
    { type:'move',       parts:['Move',{k:'steps',t:'num',v:10,w:44},'steps'] },
    { type:'turn_r',     parts:['Turn ↻',{k:'deg',t:'num',v:90,w:44},'degrees'] },
    { type:'turn_l',     parts:['Turn ↺',{k:'deg',t:'num',v:90,w:44},'degrees'] },
    { type:'go_xy',      parts:['Go to x:',{k:'x',t:'num',v:0,w:44},'y:',{k:'y',t:'num',v:0,w:44}] },
    { type:'set_x',      parts:['Set X to',{k:'x',t:'num',v:0,w:50}] },
    { type:'set_y',      parts:['Set Y to',{k:'y',t:'num',v:0,w:50}] },
    { type:'point_dir',  parts:['Point in direction',{k:'dir',t:'num',v:90,w:44}] },
    { type:'point_mouse',parts:['Point toward mouse'] },
    { type:'bounce',     parts:['If on edge, bounce'] },
    { type:'glide',      parts:['Glide',{k:'s',t:'num',v:1,w:34},'secs to x:',{k:'x',t:'num',v:0,w:44},'y:',{k:'y',t:'num',v:0,w:44}] },
  ],
  looks: [
    { type:'say_for',    parts:['Say',{k:'msg',t:'str',v:'Hello!',w:80},'for',{k:'s',t:'num',v:2,w:34},'secs'] },
    { type:'say',        parts:['Say',{k:'msg',t:'str',v:'Hello!',w:80}] },
    { type:'think',      parts:['Think',{k:'msg',t:'str',v:'Hmm...',w:80}] },
    { type:'set_size',   parts:['Set size to',{k:'size',t:'num',v:100,w:50},'%'] },
    { type:'grow',       parts:['Change size by',{k:'n',t:'num',v:10,w:44}] },
    { type:'show',       parts:['Show'] },
    { type:'hide',       parts:['Hide'] },
    { type:'next_cos',   parts:['Next costume'] },
  ],
  control: [
    { type:'repeat',     parts:['Repeat',{k:'n',t:'num',v:10,w:44},'times'], isC:true },
    { type:'forever',    parts:['Forever'], isC:true },
    { type:'if_block',   parts:['If',{k:'cond',t:'str',v:'true',w:80}], isC:true },
    { type:'wait',       parts:['Wait',{k:'s',t:'num',v:1,w:44},'seconds'] },
    { type:'stop_all',   parts:['Stop all'] },
  ],
  sensing: [
    { type:'touching_edge',  parts:['Touching edge?'] },
    { type:'key_pressed',    parts:['Key',{k:'key',t:'str',v:'space',w:55},'pressed?'] },
    { type:'mouse_x',        parts:['Mouse X'] },
    { type:'mouse_y',        parts:['Mouse Y'] },
    { type:'timer',          parts:['Timer'] },
    { type:'reset_timer',    parts:['Reset timer'] },
  ],
  sound: [
    { type:'play_sound',  parts:['Play sound',{k:'snd',t:'str',v:'pop',w:70}] },
    { type:'set_volume',  parts:['Set volume to',{k:'vol',t:'num',v:100,w:44},'%'] },
    { type:'stop_sounds', parts:['Stop all sounds'] },
  ],
  variable: [
    { type:'var_set',    parts:['Set',{k:'name',t:'str',v:'score',w:55},'to',{k:'val',t:'str',v:'0',w:50}] },
    { type:'var_change', parts:['Change',{k:'name',t:'str',v:'score',w:55},'by',{k:'n',t:'num',v:1,w:44}] },
    { type:'var_show',   parts:['Show variable',{k:'name',t:'str',v:'score',w:70}] },
    { type:'var_hide',   parts:['Hide variable',{k:'name',t:'str',v:'score',w:70}] },
  ],
  math: [
    { type:'math_add',    parts:[{k:'a',t:'num',v:1,w:44},'+',{k:'b',t:'num',v:1,w:44}] },
    { type:'math_sub',    parts:[{k:'a',t:'num',v:10,w:44},'−',{k:'b',t:'num',v:3,w:44}] },
    { type:'math_mult',   parts:[{k:'a',t:'num',v:2,w:44},'×',{k:'b',t:'num',v:3,w:44}] },
    { type:'math_div',    parts:[{k:'a',t:'num',v:10,w:44},'÷',{k:'b',t:'num',v:2,w:44}] },
    { type:'math_random', parts:['Random',{k:'min',t:'num',v:1,w:44},'to',{k:'max',t:'num',v:10,w:44}] },
    { type:'math_mod',    parts:['Mod',{k:'a',t:'num',v:10,w:44},'÷',{k:'b',t:'num',v:3,w:44}] },
  ],
  game: [
    { type:'score_add',  parts:['Add',{k:'n',t:'num',v:10,w:44},'to score'] },
    { type:'score_set',  parts:['Set score to',{k:'n',t:'num',v:0,w:44}] },
    { type:'lose_life',  parts:['Lose a life'] },
    { type:'set_lives',  parts:['Set lives to',{k:'n',t:'num',v:3,w:44}] },
    { type:'game_over',  parts:['💀 Game Over'] },
    { type:'you_win',    parts:['🎉 You Win!'] },
    { type:'next_level', parts:['⬆️ Next Level'] },
    { type:'spawn',      parts:['Spawn clone of this'] },
    { type:'destroy',    parts:['Destroy this sprite'] },
  ],
  physics: [
    { type:'set_vel',    parts:['Set velocity X:',{k:'vx',t:'num',v:5,w:40},'Y:',{k:'vy',t:'num',v:0,w:40}] },
    { type:'set_grav',   parts:['Set gravity to',{k:'g',t:'num',v:0.5,w:44}] },
    { type:'bounce_edges',parts:['Bounce off edges'] },
    { type:'jump',       parts:['Jump with power',{k:'p',t:'num',v:10,w:44}] },
    { type:'friction',   parts:['Set friction to',{k:'f',t:'num',v:0.9,w:44}] },
  ],
  ai: [
    { type:'ai_generate',parts:['AI: generate text for',{k:'prompt',t:'str',v:'Write a story',w:120}] },
    { type:'ai_classify',parts:['AI: classify',{k:'input',t:'str',v:'a photo',w:100}] },
    { type:'ai_translate',parts:['AI: translate',{k:'text',t:'str',v:'Hello',w:80},'to',{k:'lang',t:'str',v:'Spanish',w:70}] },
  ],
};

// ── Block runtime ─────────────────────────────────────────────────────
async function runBlocks(blocks, state, redraw, isStopped) {
  for (const b of blocks) {
    if (isStopped()) return;
    switch (b.type) {
      case 'move': {
        const r = state.dir * Math.PI / 180;
        const nx = state.x + (b.params.steps || 10) * Math.cos(r);
        const ny = state.y - (b.params.steps || 10) * Math.sin(r);
        if (state.penDown) state.trail.push({ x1: state.x, y1: state.y, x2: nx, y2: ny, color: state.penColor, size: state.penSize });
        state.x = nx; state.y = ny; break;
      }
      case 'turn_r': state.dir += (b.params.deg || 90); break;
      case 'turn_l': state.dir -= (b.params.deg || 90); break;
      case 'go_xy':  state.x = b.params.x || 0; state.y = b.params.y || 0; break;
      case 'set_x':  state.x = b.params.x || 0; break;
      case 'set_y':  state.y = b.params.y || 0; break;
      case 'say_for':
      case 'say':    state.saying = b.params.msg || ''; redraw(); await sleep(2000); state.saying = ''; break;
      case 'show':   state.visible = true; break;
      case 'hide':   state.visible = false; break;
      case 'set_size': state.size = Math.max(10, Math.min(300, b.params.size || 100)); break;
      case 'wait':   await sleep(Math.min((b.params.s || 1) * 1000, 5000)); break;
      case 'stop_all': isStopped = () => true; return;
      case 'repeat':
        for (let i = 0; i < (b.params.n || 10) && !isStopped(); i++)
          await runBlocks(b.children || [], state, redraw, isStopped);
        break;
      case 'forever':
        while (!isStopped()) await runBlocks(b.children || [], state, redraw, isStopped);
        return;
      default: break;
    }
    redraw(); await sleep(50);
  }
}

// ── Stage canvas drawing ──────────────────────────────────────────────
function drawStage(canvas, state, bgDef, spriteDef) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  bgDef.draw(ctx, W, H);

  // pen trails
  for (const l of state.trail) {
    ctx.strokeStyle = l.color; ctx.lineWidth = l.size; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(W/2 + l.x1, H/2 + l.y1); ctx.lineTo(W/2 + l.x2, H/2 + l.y2); ctx.stroke();
  }

  if (!state.visible) return;

  // sprite emoji
  const sx = W/2 + state.x, sy = H/2 + state.y;
  const fontSize = Math.round(32 * (state.size / 100));
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(state.dir * Math.PI / 180);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(spriteDef.emoji, 0, 0);
  ctx.restore();

  // speech bubble
  if (state.saying) {
    ctx.font = 'bold 12px system-ui';
    const tw = ctx.measureText(state.saying).width;
    const bw = tw + 20, bh = 28, bx = sx + 20, by = sy - 28;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by - bh/2, bw, bh, 8) : ctx.rect(bx, by - bh/2, bw, bh);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillText(state.saying, bx + bw/2, by + 4);
  }
}

// ── Block param input ─────────────────────────────────────────────────
function PI({ val, t, w, color, onChange }) {
  const base = {
    fontSize: 12, fontWeight: 700, outline: 'none', borderRadius: 5,
    border: `1.5px solid rgba(255,255,255,0.4)`, color: '#fff',
    background: 'rgba(0,0,0,0.3)', padding: '1px 4px',
    verticalAlign: 'middle', margin: '0 2px',
  };
  if (t === 'num') return (
    <input type="number" value={val} onChange={e => onChange(Number(e.target.value))}
      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
      style={{ ...base, width: w || 44, textAlign: 'center' }} />
  );
  return (
    <input type="text" value={val} onChange={e => onChange(e.target.value)}
      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
      style={{ ...base, width: w || 70 }} />
  );
}

// ── Puzzle-piece block shape ──────────────────────────────────────────
const NUB_W = 24, NUB_X = 18, NUB_H = 8;

function BlockShape({ color, hat, children, isC, innerBlocks, onAddInside, paramsByKey, onParam, onDelete, blockId }) {
  const dark = darken(color, 50);
  return (
    <div style={{ position: 'relative', marginTop: hat ? 4 : NUB_H + 2, userSelect: 'none' }}>
      {/* top slot shadow (female connector) */}
      {!hat && (
        <div style={{ position: 'absolute', top: -NUB_H, left: NUB_X, width: NUB_W, height: NUB_H,
          background: '#f59e0b', borderRadius: '4px 4px 0 0', zIndex: 0 }} />
      )}

      {/* main block body */}
      <div style={{
        background: '#f59e0b',
        borderRadius: hat ? '14px 14px 4px 4px' : '10px',
        padding: '10px 36px 10px 14px',
        display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
        color: '#fff', fontWeight: 700, fontSize: 13,
        boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
        position: 'relative', zIndex: 1, minHeight: 36,
        cursor: 'grab',
      }}>
        {children}
        <button onClick={() => onDelete(blockId)}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 6,
            color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            hover: { background: 'rgba(255,255,255,0.5)' }
          }}>✕</button>
      </div>

      {/* C-block mouth */}
      {isC && (
        <div style={{
          marginLeft: NUB_X + 4, borderLeft: `4px solid #f59e0b`,
          borderBottom: `4px solid #f59e0b`, borderRadius: '0 0 0 4px',
          minHeight: 32, paddingLeft: 8, paddingTop: 4, paddingBottom: 4,
          background: 'rgba(245, 158, 11, 0.08)',
        }}>
          {innerBlocks}
          <button onClick={onAddInside} style={{
            fontSize: 11, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)',
            border: `1.5px dashed rgba(245, 158, 11, 0.5)`, borderRadius: 6,
            padding: '3px 12px', cursor: 'pointer', marginTop: 4, display: 'block',
          }}>+ block inside</button>
        </div>
      )}

      {/* bottom nub (male connector) */}
      <div style={{
        position: 'absolute', bottom: -(NUB_H), left: NUB_X,
        width: NUB_W, height: NUB_H,
        background: `linear-gradient(180deg, ${darken(color, 20)} 0%, ${dark} 100%)`,
        borderRadius: '0 0 4px 4px',
        boxShadow: `0 3px 0 ${dark}`,
        zIndex: 1,
      }} />
    </div>
  );
}

// ── WorkspaceBlock (renders a block instance) ────────────────────────
function WorkspaceBlock({ block, catMap, palMap, onParamChange, onDelete, onAddInside }) {
  const catId = palMap[block.type]?.catId;
  const cat = catMap[catId] || { color: '#6366f1' };
  const def = palMap[block.type];
  if (!def) return null;

  const params = block.params || {};

  const content = (def.parts || []).map((part, i) => {
    if (typeof part === 'string') return <span key={i} style={{ whiteSpace: 'nowrap' }}>{part}</span>;
    return (
      <PI key={i} val={params[part.k] ?? part.v} t={part.t} w={part.w} color={cat.color}
        onChange={v => onParamChange(block.id, part.k, v)} />
    );
  });

  return (
    <BlockShape
      color={cat.color} hat={def.hat} isC={def.isC} blockId={block.id}
      onDelete={onDelete}
      onAddInside={() => onAddInside(block.id)}
      innerBlocks={(block.children || []).map(child => (
        <WorkspaceBlock key={child.id} block={child} catMap={catMap} palMap={palMap}
          onParamChange={onParamChange} onDelete={onDelete} onAddInside={onAddInside} />
      ))}
    >
      {content}
    </BlockShape>
  );
}

// ── Palette block (in sidebar) ────────────────────────────────────────
function PaletteBlock({ def, catColor, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', marginBottom: NUB_H + 6, cursor: 'pointer' }}>
      <div style={{
        background: hover
          ? `linear-gradient(180deg, ${catColor} 0%, ${darken(catColor, 10)} 100%)`
          : `linear-gradient(180deg, ${darken(catColor,-10)} 0%, ${catColor} 100%)`,
        borderRadius: def.hat ? '14px 14px 4px 4px' : 6,
        padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: 12,
        boxShadow: `0 3px 0 ${darken(catColor, 50)}, inset 0 1px 0 rgba(255,255,255,0.2)`,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
        transition: 'transform 0.1s', transform: hover ? 'translateY(-1px)' : 'none',
      }}>
        {(def.parts || []).map((p, i) =>
          typeof p === 'string'
            ? <span key={i}>{p}</span>
            : <span key={i} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>{p.v}</span>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: -(NUB_H), left: NUB_X, width: NUB_W, height: NUB_H,
        background: darken(catColor, 40), borderRadius: '0 0 4px 4px',
        boxShadow: `0 3px 0 ${darken(catColor, 60)}`,
      }} />
    </div>
  );
}

// ── Mini sprite thumbnail ─────────────────────────────────────────────
function SpriteThumbnail({ sprite, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 60, height: 60, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
      background: selected ? `${sprite.color}30` : 'rgba(255,255,255,0.04)',
      border: selected ? `2.5px solid ${sprite.color}` : '2px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2, transition: 'all 0.15s', transform: selected ? 'scale(1.08)' : 'none',
      boxShadow: selected ? `0 0 12px ${sprite.color}60` : 'none',
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{sprite.emoji}</span>
      <span style={{ fontSize: 9, color: selected ? sprite.color : '#475569', fontWeight: 700, letterSpacing: 0.2 }}>{sprite.label}</span>
    </div>
  );
}

// ── Background swatch ─────────────────────────────────────────────────
function BgSwatch({ bg, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 52, height: 36, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
      background: `linear-gradient(135deg, ${bg.thumb[0]}, ${bg.thumb[1]})`,
      border: selected ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '2px 0 3px', transition: 'all 0.15s',
      boxShadow: selected ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
      transform: selected ? 'scale(1.1)' : 'none',
    }}>
      <span style={{ fontSize: 9, color: '#fff', fontWeight: 700, textShadow: '0 1px 3px #000' }}>{bg.label}</span>
    </div>
  );
}

// ── Main BlockEditor ──────────────────────────────────────────────────
function initBlock(def, type, catId) {
  const params = {};
  (def.parts || []).forEach(p => { if (typeof p !== 'string') params[p.k] = p.v; });
  return { id: uid(), type, params, catId, ...(def.isC ? { children: [] } : {}) };
}

export default function BlockEditor({ starterBlocks, editorHeight = 480 }) {
  const [activeCat, setActiveCat] = useState('event');
  const [workspace, setWorkspace] = useState(() => {
    const startDef = PALETTE.event[0];
    return [initBlock(startDef, 'when_flag', 'event')];
  });
  const [running, setRunning] = useState(false);
  const [insertParent, setInsertParent] = useState(null);
  const [activeSpriteId, setActiveSpriteId] = useState('rocket');
  const [activeBgId, setActiveBgId] = useState('space');

  const canvasRef = useRef();
  const stoppedRef = useRef(false);
  const spriteStateRef = useRef({ x: 0, y: 0, dir: 0, saying: '', size: 100, visible: true, penDown: false, penColor: '#ff0000', penSize: 2, trail: [] });

  // build lookup maps
  const catMap = Object.fromEntries(CATS.map(c => [c.id, c]));
  const palMap = {};
  Object.entries(PALETTE).forEach(([catId, defs]) => defs.forEach(def => { palMap[def.type] = { ...def, catId }; }));

  const activeBg = BACKGROUNDS.find(b => b.id === activeBgId) || BACKGROUNDS[0];
  const activeSprite = SPRITES.find(s => s.id === activeSpriteId) || SPRITES[0];

  const redraw = useCallback(() => {
    if (canvasRef.current) drawStage(canvasRef.current, spriteStateRef.current, activeBg, activeSprite);
  }, [activeBg, activeSprite]);

  useEffect(() => { redraw(); }, [redraw]);

  const resetSprite = () => {
    spriteStateRef.current = { x: 0, y: 0, dir: 0, saying: '', size: 100, visible: true, penDown: false, penColor: '#ff0000', penSize: 2, trail: [] };
  };

  const handleRun = async () => {
    stoppedRef.current = false; resetSprite(); redraw(); setRunning(true);
    const fi = workspace.findIndex(b => b.type === 'when_flag');
    await runBlocks(fi >= 0 ? workspace.slice(fi + 1) : workspace, spriteStateRef.current, redraw, () => stoppedRef.current);
    setRunning(false);
  };
  const handleStop = () => { stoppedRef.current = true; setRunning(false); };
  const handleReset = () => { handleStop(); resetSprite(); redraw(); };

  const onParamChange = (blockId, key, val) => {
    const up = bs => bs.map(b => {
      if (b.id === blockId) return { ...b, params: { ...b.params, [key]: val } };
      if (b.children) return { ...b, children: up(b.children) };
      return b;
    });
    setWorkspace(p => up(p));
  };
  const onDelete = blockId => {
    const rm = bs => bs.filter(b => b.id !== blockId).map(b => b.children ? { ...b, children: rm(b.children) } : b);
    setWorkspace(p => rm(p));
  };
  const addBlockToParent = (parentId, block) => {
    const add = bs => bs.map(b => {
      if (b.id === parentId) return { ...b, children: [...(b.children || []), block] };
      if (b.children) return { ...b, children: add(b.children) };
      return b;
    });
    setWorkspace(p => add(p));
  };

  const handlePaletteClick = (def, type, catId) => {
    const block = initBlock(def, type, catId);
    if (insertParent) {
      addBlockToParent(insertParent, block);
      setInsertParent(null);
    } else {
      setWorkspace(p => [...p, block]);
    }
  };

  const STAGE_W = 260;
  const cat = catMap[activeCat] || CATS[0];

  return (
    <div style={{
      display: 'flex', height: editorHeight, borderRadius: 14, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)', background: '#0d0d1a',
      fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>

      {/* ── Category sidebar ── */}
      <div style={{ width: 58, background: '#060610', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', gap: 2, overflowY: 'auto', flexShrink: 0 }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} title={c.label} style={{
            width: 46, height: 46, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeCat === c.id ? `${c.color}25` : 'transparent',
            outline: activeCat === c.id ? `2px solid ${c.color}` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span style={{ fontSize: 8, color: activeCat === c.id ? c.color : '#374151', fontWeight: 700, letterSpacing: 0.3 }}>
              {c.label.slice(0, 5).toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      {/* ── Block palette ── */}
      <div style={{ width: 186, background: '#0a0a18', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '10px 10px 6px', borderBottom: `2px solid ${cat.color}40`, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: cat.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>{cat.label}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 20px' }}>
          {insertParent && (
            <div style={{ fontSize: 10, color: '#f59e0b', background: '#f59e0b18', border: '1px solid #f59e0b40', borderRadius: 6, padding: '4px 8px', marginBottom: 8 }}>
              Picking for inside block ↓
              <button onClick={() => setInsertParent(null)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: 10 }}>✕ cancel</button>
            </div>
          )}
          {(PALETTE[activeCat] || []).map((def, i) => (
            <PaletteBlock key={i} def={def} catColor={cat.color} onClick={() => handlePaletteClick(def, def.type, activeCat)} />
          ))}
        </div>
      </div>

      {/* ── Workspace ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#111122' }}>
        {/* toolbar */}
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', flexShrink: 0, background: '#0d0d1e' }}>
          <button onClick={handleRun} disabled={running} style={{
            padding: '6px 18px', borderRadius: 8, border: 'none', cursor: running ? 'default' : 'pointer',
            background: running ? '#1f2937' : 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#fff', fontWeight: 800, fontSize: 13,
            boxShadow: running ? 'none' : '0 2px 8px rgba(22,163,74,0.4)',
          }}>▶ Run</button>
          <button onClick={handleStop} disabled={!running} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: !running ? 'default' : 'pointer',
            background: !running ? '#1f2937' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#fff', fontWeight: 800, fontSize: 13, opacity: !running ? 0.4 : 1,
            boxShadow: running ? '0 2px 8px rgba(220,38,38,0.4)' : 'none',
          }}>■ Stop</button>
          <button onClick={handleReset} style={{
            padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', background: 'transparent', color: '#64748b', fontSize: 13, fontWeight: 700,
          }}>↺ Reset</button>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#334155' }}>
            {workspace.length} blocks
          </div>
        </div>

        {/* script area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 40px' }}>
          {workspace.length === 0 && (
            <div style={{ textAlign: 'center', color: '#1f2937', paddingTop: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🧩</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Click a block to add it here</div>
            </div>
          )}
          {workspace.map(block => (
            <WorkspaceBlock key={block.id} block={block} catMap={catMap} palMap={palMap}
              onParamChange={onParamChange} onDelete={onDelete}
              onAddInside={id => { setInsertParent(id); }} />
          ))}
        </div>
      </div>

      {/* ── Stage + Sprites + Backgrounds ── */}
      <div style={{ width: STAGE_W, display: 'flex', flexDirection: 'column', background: '#060610', borderLeft: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {/* stage header */}
        <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#374151', letterSpacing: 1.5, textTransform: 'uppercase' }}>Stage</span>
          <span style={{ fontSize: 11, color: '#1d4ed8', background: running ? '#1d4ed820' : 'transparent', borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
            {running ? '● RUNNING' : ''}
          </span>
        </div>

        {/* canvas */}
        <canvas ref={canvasRef} width={STAGE_W} height={170}
          style={{ display: 'block', flexShrink: 0 }} />

        {/* sprite info strip */}
        <div style={{ padding: '4px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0a0a1e', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{activeSprite.emoji}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: activeSprite.color }}>{activeSprite.label}</div>
              <div style={{ fontSize: 9, color: '#374151' }}>
                x:{Math.round(spriteStateRef.current.x)} y:{Math.round(spriteStateRef.current.y)} dir:{Math.round(spriteStateRef.current.dir)}°
              </div>
            </div>
          </div>
        </div>

        {/* sprite selector */}
        <div style={{ padding: '8px 8px 4px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Choose Sprite</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SPRITES.map(s => (
              <SpriteThumbnail key={s.id} sprite={s} selected={activeSpriteId === s.id}
                onClick={() => { setActiveSpriteId(s.id); setTimeout(redraw, 10); }} />
            ))}
          </div>
        </div>

        {/* background selector */}
        <div style={{ padding: '6px 8px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Background</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BACKGROUNDS.map(bg => (
              <BgSwatch key={bg.id} bg={bg} selected={activeBgId === bg.id}
                onClick={() => { setActiveBgId(bg.id); setTimeout(redraw, 10); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
