/**
 * Numbers from an arcade level's own map, for its coding objective: how far the first apple is,
 * how many dots, lanes, raiders or coins there are. Each fact becomes a checklist goal like
 * "Cross 8 lanes — hop forward at least 8 times".
 */
const size = (v) => (v == null ? 0 : typeof v.size === 'number' ? v.size : Array.isArray(v) ? v.length : typeof v === 'object' ? Object.keys(v).length : 0);
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

export function arcadeLevelFacts(game, levelIdx) {
  let w;
  try { w = game.init(levelIdx, { primary: '#888888', accent: '#888888' }); } catch { return { facts: [], text: '' }; }
  if (!w) return { facts: [], text: '' };
  switch (game.id) {
    case 'snakebot': {
      const head = w.body?.[0] || [0, 0];
      const first = w.apples?.[0];
      const dist = first ? Math.abs(first[0] - head[0]) + Math.abs(first[1] - head[1]) : 0;
      const rocks = size(w.walls);
      return {
        facts: dist ? [{ ids: ['move'], n: dist, label: `The first apple is ${plural(dist, 'square')} away — move forward at least ${dist} times` }] : [],
        text: `${plural(w.need || 1, 'apple')}${rocks ? `, ${plural(rocks, 'rock')}` : ''}`,
      };
    }
    case 'pacbot': {
      const dots = w.total || size(w.dots);
      const bugs = size(w.bugs);
      const power = size(w.power);
      // Corners and junctions in the maze: a corner needs one turn, a junction needs a choice
      let corners = 0, junctions = 0;
      const open = w.open instanceof Set ? w.open : new Set();
      open.forEach((k) => {
        const [x, y] = k.split(',').map(Number);
        const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => open.has(`${x + dx},${y + dy}`));
        const count = n.filter(Boolean).length;
        if (count >= 3) junctions += 1;
        else if (count === 2 && !((n[0] && n[1]) || (n[2] && n[3]))) corners += 1;
      });
      const facts = [{ ids: ['move'], n: Math.min(dots, 40), label: `${plural(dots, 'dot')}${bugs ? ` and ${plural(bugs, 'bug')}` : ''}${power ? `, ${plural(power, 'battery', 'batteries')}` : ''} — move at least ${Math.min(dots, 40)} times (a loop counts)` }];
      if (corners && !junctions) facts.push({ ids: ['turn_left', 'turn_right'], n: corners, label: `The corridor has ${plural(corners, 'corner')} — turn at each one` });
      return { facts, text: `${plural(dots, 'dot')}, ${plural(corners, 'corner')}${junctions ? `, ${plural(junctions, 'junction')}` : ''}` };
    }
    case 'brickbot': {
      const bricks = w.breakable || size(w.bricks);
      return {
        facts: [{ ids: ['serve'], n: 1, label: `Serve, then break all ${plural(bricks, 'brick')} (ball speed ${Math.round(w.speed || 0)})` }],
        text: plural(bricks, 'brick'),
      };
    }
    case 'hopbot': {
      const lanes = (w.lanes || []).filter((l) => l.type !== 'goal');
      const kinds = {};
      lanes.forEach((l) => { kinds[l.type] = (kinds[l.type] || 0) + 1; });
      const trees = lanes.reduce((a, l) => a + size(l.trees), 0);
      const mix = Object.entries(kinds).map(([k, n]) => plural(n, k === 'grass' ? 'grass lane' : k)).join(', ');
      return {
        facts: [{ ids: ['hop_forward'], n: lanes.length, label: `Cross ${plural(lanes.length, 'lane')} (${mix}${trees ? `, ${plural(trees, 'tree')}` : ''}) — hop forward at least ${lanes.length} times` }],
        text: mix,
      };
    }
    case 'raiderbot': {
      const total = w.total || size(w.raiders);
      const shields = size(w.shields);
      const hits = (w.raiders || []).reduce((a, r) => a + (r.hp || 1), 0) || total;
      const rows = new Set((w.raiders || []).map((r) => r.row)).size;
      return {
        facts: [{ ids: ['zap'], n: hits, label: `Zap all ${plural(total, 'raider')} in ${plural(rows || 1, 'row')} — ${plural(hits, 'hit')}${w.mother ? ' plus the mothership' : ''}${shields ? ` (${plural(shields, 'shield')} to hide behind)` : ''}` }],
        text: plural(total, 'raider'),
      };
    }
    case 'jumpbot': {
      const L = game.levels[levelIdx] || {};
      const coins = size(w.coins), keys = size(w.keys), enemies = size(w.enemies);
      const gaps = Math.max(0, size(L.platforms) - 1);
      const hazards = size(L.hazards);
      const bits = [`reach the flag ${L.goalX || '?'} tiles away`, gaps && `cross ${plural(gaps, 'gap')}`, coins && `collect ${plural(coins, 'coin')}`, keys && `find ${plural(keys, 'key')}`, enemies && `jump ${plural(enemies, 'beetle')}`, hazards && `avoid ${plural(hazards, 'hazard')}`].filter(Boolean);
      const facts = [{ ids: ['walk_forward', 'jump'], n: Math.max(1, gaps + 1), label: `${bits.join(', ')} — make at least ${Math.max(1, gaps + 1)} moves`.replace(/^./, (c) => c.toUpperCase()) }];
      if (gaps + enemies) facts.push({ ids: ['jump'], n: gaps + enemies, label: `Jump ${gaps + enemies === 1 ? 'once' : `${gaps + enemies} times`} — once for each gap or beetle` });
      return { facts, text: bits.join(', ') };
    }
    default: return { facts: [], text: '' };
  }
}
