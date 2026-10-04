/**
 * labEngine.js — runs a blocks program on the Coding Lab grid and judges it.
 *
 * Directions are in degrees: 0 = right, 90 = up, 180 = left, 270 = down.
 * Turn Left adds 90, Turn Right takes 90 away (as if you were sitting in Dot).
 *
 * Repeat is a C-block: `repeat` … `end_repeat`. Older saved programs used a
 * Repeat that only repeated the very next block, so a Repeat without an
 * End still works that way.
 */

const MAX_STEPS = 400;

/** Pair each repeat with its end (or null for old-style "repeat next block"). */
function matchRepeats(blocks) {
  const ends = new Map();
  const stack = [];
  blocks.forEach((b, i) => {
    if (b.id === 'repeat') stack.push(i);
    else if (b.id === 'end_repeat' && stack.length) ends.set(stack.pop(), i);
  });
  return ends;
}

/** Flatten loops into a list of { block, index } in run order. */
export function expandProgram(blocks) {
  const ends = matchRepeats(blocks);
  const out = [];
  const walk = (from, to) => {
    for (let i = from; i < to && out.length < MAX_STEPS; i++) {
      const b = blocks[i];
      if (b.id === 'end_repeat') continue;
      if (b.id === 'repeat') {
        const n = Math.max(1, Math.min(20, b.param || 2));
        const end = ends.get(i);
        if (end != null) {
          for (let k = 0; k < n; k++) walk(i + 1, end);
          i = end;
        } else if (i + 1 < to) {
          for (let k = 0; k < n; k++) out.push({ block: blocks[i + 1], index: i + 1 });
          i += 1;
        }
        continue;
      }
      out.push({ block: b, index: i });
    }
  };
  walk(0, blocks.length);
  return out;
}

const k = (c, r) => `${c},${r}`;

/**
 * Run a program. Returns every animation frame plus the final state and what
 * went wrong (if anything).
 */
export function runProgram(blocks, mission) {
  const cols = mission.gridCols || 8;
  const rows = mission.gridRows || 6;
  const walls = new Set((mission.obstacles || []).map((o) => k(o.col, o.row)));
  const gems = new Set((mission.gems || []).map((g) => k(g.col, g.row)));
  const cps = mission.checkpoints || [];
  const start = mission.start || { col: 0, row: Math.floor(rows / 2), dir: 0 };

  const st = {
    col: start.col, row: start.row, dir: start.dir ?? 0,
    painted: {}, collected: [], cpNext: 0, carrying: false, delivered: false, grabbed: false,
  };
  const snap = (blk, extra = {}) => ({
    col: st.col, row: st.row, dir: st.dir, blk,
    painted: { ...st.painted }, collected: [...st.collected], cpNext: st.cpNext,
    carrying: st.carrying, delivered: st.delivered, ...extra,
  });
  const frames = [snap(-1)];
  let problem = null;

  const land = () => {
    const here = k(st.col, st.row);
    if (gems.has(here) && !st.collected.includes(here)) st.collected.push(here);
    const cp = cps[st.cpNext];
    if (cp && cp.col === st.col && cp.row === st.row) st.cpNext += 1;
  };

  for (const { block: b, index } of expandProgram(blocks)) {
    if (b.id === 'forward' || b.id === 'backward') {
      const sign = b.id === 'forward' ? 1 : -1;
      const n = Math.max(1, b.param || 1);
      const d = ((st.dir % 360) + 360) % 360;
      const dx = d === 0 ? 1 : d === 180 ? -1 : 0;
      const dy = d === 90 ? -1 : d === 270 ? 1 : 0;
      for (let s = 0; s < n; s++) {
        const nc = st.col + dx * sign;
        const nr = st.row + dy * sign;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) { problem = { type: 'edge', index }; break; }
        if (walls.has(k(nc, nr))) { problem = { type: 'wall', index }; break; }
        st.col = nc; st.row = nr;
        land();
        frames.push(snap(index));
      }
      if (problem) { frames.push(snap(index, { bump: true })); break; }
    } else if (b.id === 'turn_left' || b.id === 'turn_right') {
      st.dir += b.id === 'turn_left' ? 90 : -90;
      frames.push(snap(index));
    } else if (b.id === 'paint') {
      st.painted[k(st.col, st.row)] = b.param || 'red';
      frames.push(snap(index));
    } else if (b.id === 'grab') {
      const p = mission.parcel;
      if (p && p.col === st.col && p.row === st.row && !st.carrying && !st.delivered) { st.carrying = true; st.grabbed = true; }
      else problem = problem || { type: 'grab-miss', index };
      frames.push(snap(index));
      if (problem) break;
    } else if (b.id === 'release') {
      const h = mission.house;
      if (st.carrying) {
        st.carrying = false;
        if (h && h.col === st.col && h.row === st.row) st.delivered = true;
        else { problem = { type: 'release-miss', index }; frames.push(snap(index)); break; }
      }
      frames.push(snap(index));
    } else if (b.id === 'wait') {
      frames.push(snap(index));
    }
  }
  return { frames, final: frames[frames.length - 1], problem };
}

/** Count the blocks a pupil placed (End markers don't count). */
export function blockCount(blocks) {
  return blocks.filter((b) => b.id !== 'end_repeat').length;
}

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/**
 * Judge a finished run. Returns { ok, message, tip }.
 * Messages talk about the grid, never coordinates.
 */
export function judgeRun(result, blocks, mission) {
  const { final, problem } = result;
  const target = mission.target;
  const gems = mission.gems || [];
  const paintTargets = mission.paintTargets || [];
  const cps = mission.checkpoints || [];
  const count = blockCount(blocks);
  const step = problem ? `block ${problem.index + 1}` : '';

  if (problem?.type === 'wall') return { ok: false, message: `Bump! Dot hit a wall during ${step}.`, tip: 'Turn before the wall, or move fewer squares.' };
  if (problem?.type === 'edge') return { ok: false, message: `Whoa! ${step[0].toUpperCase() + step.slice(1)} would drive Dot off the edge of the map.`, tip: 'Check the number on that Move block.' };
  if (problem?.type === 'grab-miss') return { ok: false, message: 'Dot tried to grab, but the parcel isn’t there.', tip: 'Grab only works when Dot is standing on the 📦.' };
  if (problem?.type === 'release-miss') return { ok: false, message: 'Dot dropped the parcel before reaching the house.', tip: 'Release only on the 🏠 square.' };

  if (mission.parcel) {
    if (!final.carrying && !final.delivered && !result.frames.some((f) => f.carrying)) return { ok: false, message: 'Dot never picked up the 📦 parcel.', tip: 'Drive onto the parcel, then use Grab.' };
    if (!final.delivered) return { ok: false, message: 'Dot has the parcel — now take it to the 🏠 and Release it.', tip: 'Add the route to the house, then Release.' };
  }

  if (paintTargets.length) {
    const missing = paintTargets.filter((p) => !final.painted[`${p.col},${p.row}`]);
    const wrong = paintTargets.filter((p) => final.painted[`${p.col},${p.row}`] && final.painted[`${p.col},${p.row}`] !== p.color);
    if (missing.length) return { ok: false, message: `${plural(missing.length, 'glowing square')} still ${missing.length === 1 ? 'needs' : 'need'} painting.`, tip: 'Move onto each glowing square and use Paint.' };
    if (wrong.length) return { ok: false, message: `${plural(wrong.length, 'square')} ${wrong.length === 1 ? 'is' : 'are'} the wrong colour.`, tip: 'Tap the colour on a Paint block to change it.' };
  }

  if (cps.length && final.cpNext < cps.length) {
    return { ok: false, message: `Dot reached ${final.cpNext} of ${cps.length} flags. Flag ${final.cpNext + 1} is next.`, tip: 'Solve one part at a time — get to the next flag first.' };
  }

  if (gems.length && final.collected.length < gems.length) {
    const left = gems.length - final.collected.length;
    return { ok: false, message: `Score: ${final.collected.length}. ${plural(left, 'gem')} still to collect!`, tip: 'Plan a route that passes over every 💎.' };
  }

  if (target && !(final.col === target.col && final.row === target.row)) {
    const away = Math.abs(final.col - target.col) + Math.abs(final.row - target.row);
    return {
      ok: false,
      message: `So close! Dot stopped ${plural(away, 'square')} away from the ⭐.`,
      tip: away === 1 ? 'Just one square out — check your numbers.' : 'Trace the route with your finger and count the squares.',
    };
  }

  if (mission.requireBlock === 'repeat' && !blocks.some((b) => b.id === 'repeat')) {
    return { ok: false, message: 'Dot got there — but this challenge is about loops!', tip: 'Use a Repeat block so you don’t write the same block again and again.' };
  }
  if (mission.maxBlocks && count > mission.maxBlocks && mission.requireBlock) {
    return { ok: false, message: `It works, but uses ${count} blocks. Can you do it in ${mission.maxBlocks}?`, tip: 'A Repeat can replace lots of the same block.' };
  }
  return { ok: true, message: 'Mission complete!', tip: '' };
}

/** 1–3 stars: fewer hints and tidier programs earn more. */
export function starsFor({ blocks, mission, hintsUsed, sawSolution, bestCount }) {
  if (sawSolution) return 1;
  let s = 3;
  if (hintsUsed >= 2) s -= 1;
  const count = blockCount(blocks);
  const par = mission.maxBlocks || bestCount;
  if (par && count > par + 1) s -= 1;
  return Math.max(1, s);
}
