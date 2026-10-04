/**
 * Robot Arcade engine — shared by Sumo Bot, Line Bot, Paint Bot and Snake Bot.
 *
 * A program is a flat list of blocks { id, type, indent, params }. Indentation
 * decides what sits inside Forever / Repeat / If (the same idea as Python).
 * Running a program is a generator: it yields one robot action at a time and
 * asks the game's sensors when it meets an If or Repeat-until.
 */

export const CONTROL_BLOCKS = {
  forever: { label: 'Forever', icon: '🔁', color: '#f59e0b', container: true, cat: 'Control' },
  repeat: { label: 'Repeat', icon: '🔄', color: '#f59e0b', container: true, cat: 'Control', params: [{ key: 'times', label: 'times', type: 'num', min: 1, max: 50, default: 4 }] },
  repeat_until: { label: 'Repeat until', icon: '⏳', color: '#f59e0b', container: true, cat: 'Control', params: [{ key: 'cond', type: 'cond' }] },
  if: { label: 'If', icon: '❓', color: '#8b5cf6', container: true, cat: 'Logic', params: [{ key: 'cond', type: 'cond' }] },
  else: { label: 'Else', icon: '↪️', color: '#8b5cf6', container: true, cat: 'Logic' },
  wait: { label: 'Wait', icon: '⏱️', color: '#64748b', cat: 'Control', params: [{ key: 'seconds', label: 'sec', type: 'num', min: 0.1, max: 5, step: 0.1, default: 0.5 }] },
};

let seq = 0;
export const uid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

export function makeBlock(game, type, indent = 0, params = {}) {
  const def = blockDef(game, type);
  const p = {};
  (def?.params || []).forEach((d) => {
    p[d.key] = d.type === 'cond' ? (game.conditions[0]?.id ?? '') : d.type === 'select' ? d.options[0].value : d.default;
  });
  return { id: uid(), type, indent, params: { ...p, ...params } };
}

/** Tiny helper for writing starter programs: S('forever'), S('if', 1, { cond: 'edge_ahead' }) */
export const starter = (game, rows) => rows.map(([type, indent = 0, params = {}]) => makeBlock(game, type, indent, params));

export function blockDef(game, type) {
  return CONTROL_BLOCKS[type] || game.blocks[type];
}

/** Flat indented list → tree. Else attaches to the If just before it at the same indent. */
export function parse(blocks) {
  const root = { children: [] };
  const stack = [{ node: root, indent: -1 }];
  let lastAt = {};
  for (const b of blocks) {
    const indent = Math.max(0, b.indent || 0);
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    const node = { ...b, indent, children: [] };
    if (b.type === 'else') {
      const prev = lastAt[indent];
      if (prev && prev.type === 'if' && !prev.elseNode) {
        prev.elseNode = node;
        stack.push({ node, indent });
        continue;
      }
      // A stray Else behaves like an If that never runs.
      node.orphan = true;
    }
    parent.children.push(node);
    lastAt[indent] = node;
    Object.keys(lastAt).forEach((k) => { if (Number(k) > indent) delete lastAt[k]; });
    stack.push({ node, indent });
  }
  return root.children;
}

/**
 * Runs the program tree. Yields { type, params, id } actions. `sense(cond)` reads a sensor.
 * Loops with no actions inside still yield 'idle' so the page never freezes.
 */
export function* execute(nodes, sense) {
  const ctx = { sinceAction: 0 };
  function* run(list) {
    for (const n of list) {
      if (++ctx.sinceAction > 300) { ctx.sinceAction = 0; yield { type: 'idle', id: n.id }; }
      switch (n.type) {
        case 'forever':
          for (;;) {
            yield* run(n.children);
            yield { type: 'idle', id: n.id, soft: true };
          }
        case 'repeat': {
          const times = Math.max(0, Math.min(200, Math.round(Number(n.params?.times) || 0)));
          for (let i = 0; i < times; i++) yield* run(n.children);
          break;
        }
        case 'repeat_until': {
          let guard = 0;
          while (!sense(n.params?.cond) && guard++ < 100000) {
            yield* run(n.children);
            yield { type: 'idle', id: n.id, soft: true };
          }
          break;
        }
        case 'if':
          if (sense(n.params?.cond)) yield* run(n.children);
          else if (n.elseNode) yield* run(n.elseNode.children);
          break;
        case 'else':
          break;
        default:
          ctx.sinceAction = 0;
          yield { type: n.type, params: n.params || {}, id: n.id };
      }
    }
  }
  yield* run(nodes);
}

export function countBlocks(blocks) {
  return blocks.filter((b) => b.type !== 'else').length;
}

export function starsFor(blocks, par) {
  const n = countBlocks(blocks);
  if (!par || n <= par) return 3;
  if (n <= par + 3) return 2;
  return 1;
}

/* ─── Progress (stars per level) ─── */
const key = (gameId) => `bb-arcade-${gameId}`;
export function loadProgress(gameId) {
  try { return JSON.parse(localStorage.getItem(key(gameId)) || '{}') || {}; } catch { return {}; }
}
export function saveStars(gameId, level, stars) {
  const p = loadProgress(gameId);
  p[level] = Math.max(p[level] || 0, stars);
  try { localStorage.setItem(key(gameId), JSON.stringify(p)); } catch { /* ignore */ }
  return p;
}
export function loadProgram(gameId, level) {
  try { return JSON.parse(localStorage.getItem(`${key(gameId)}-code-${level}`) || 'null'); } catch { return null; }
}
export function saveProgram(gameId, level, blocks) {
  try { localStorage.setItem(`${key(gameId)}-code-${level}`, JSON.stringify(blocks)); } catch { /* ignore */ }
}

/* ─── Drawing helpers shared by the games ─── */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function shade(hex, amt) {
  const h = String(hex || '#888888').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/** Top-down cartoon robot used by Sumo, Line and Paint. Faces +x before rotation. */
export function drawBot(ctx, x, y, angle, look, { r = 22, eyes = true, plough = false, pen = null, sensors = null } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(3, 4, r * 1.05, r * 0.95, 0, 0, Math.PI * 2); ctx.fill();
  // wheels
  ctx.fillStyle = '#1f2937';
  roundRect(ctx, -r * 0.7, -r - 5, r * 1.1, 9, 4); ctx.fill();
  roundRect(ctx, -r * 0.7, r - 4, r * 1.1, 9, 4); ctx.fill();
  if (plough) {
    ctx.fillStyle = look.accent;
    ctx.beginPath();
    ctx.moveTo(r * 0.6, -r * 1.05); ctx.lineTo(r * 1.35, -r * 0.6); ctx.lineTo(r * 1.35, r * 0.6); ctx.lineTo(r * 0.6, r * 1.05);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(look.accent, -0.25); ctx.lineWidth = 2; ctx.stroke();
  }
  // body
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, shade(look.primary, 0.15));
  g.addColorStop(1, shade(look.primary, -0.18));
  ctx.fillStyle = g;
  roundRect(ctx, -r, -r * 0.85, r * 1.9, r * 1.7, r * 0.55); ctx.fill();
  ctx.strokeStyle = shade(look.primary, -0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = look.accent;
  roundRect(ctx, -r * 0.55, -r * 0.5, r * 0.75, r, r * 0.3); ctx.fill();
  if (eyes) {
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, r * 0.2, -r * 0.55, r * 0.6, r * 1.1, r * 0.3); ctx.fill();
    ctx.fillStyle = look.led || '#5eead4';
    ctx.beginPath(); ctx.arc(r * 0.52, -r * 0.24, r * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.52, r * 0.24, r * 0.13, 0, Math.PI * 2); ctx.fill();
  }
  if (sensors) {
    sensors.forEach(([sx, sy, on]) => {
      ctx.fillStyle = on ? '#ef4444' : '#94a3b8';
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
  if (pen) {
    ctx.fillStyle = pen;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
}
