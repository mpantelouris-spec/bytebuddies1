/**
 * funActivities.js — picks three fun, topic-matched games for each lesson.
 *
 * Coding games (predict, bug squash, painter, number crunch, logic lamps,
 * networks, guess-my-number, charts) are generated fresh every play, scaled
 * by year. Topic games (true/false, sorting, scenarios, ordering) use the
 * written packs in funPacks.js.
 */
import { COURSES } from './learnKs2Courses.js';
import { TF, SORTS, SCENARIOS, ORDERS } from './funPacks.js';
import { getTeaching } from './teaching/index.js';

const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
let uid = 0;
const id = () => `r${++uid}`;

// ── Grid simulation ──────────────────────────────────────────────────────────
const STEP = { 0: [1, 0], 90: [0, -1], 180: [-1, 0], 270: [0, 1] };
const norm = (d) => ((d % 360) + 360) % 360;
const DIRWORD = { 0: 'right', 90: 'up', 180: 'left', 270: 'down' };

/** ops: { move n } | { turn 'left'|'right' } | { paint } | { repeat n, body: ops } */
function simulate(ops, start, dir, cols, rows) {
  let [c, r] = start; let d = dir; const painted = new Set(); let ok = true;
  const run = (list) => {
    for (const op of list) {
      if (!ok) return;
      if (op.repeat) { for (let k = 0; k < op.repeat; k++) run(op.body); continue; }
      if (op.turn) d = norm(d + (op.turn === 'left' ? 90 : -90));
      if (op.paint) painted.add(`${c},${r}`);
      if (op.move) {
        for (let s = 0; s < op.move; s++) {
          c += STEP[d][0]; r += STEP[d][1];
          if (c < 0 || r < 0 || c >= cols || r >= rows) { ok = false; return; }
        }
      }
    }
  };
  run(ops);
  return { ok, end: [c, r], dir: d, painted: [...painted].map((k) => k.split(',').map(Number)) };
}

function toBlocks(ops, depth = 0) {
  const pad = '  '.repeat(depth);
  const out = [];
  for (const op of ops) {
    if (op.repeat) { out.push(`${pad}repeat ${op.repeat}`); out.push(...toBlocks(op.body, depth + 1)); out.push(`${pad}end`); }
    else if (op.move) out.push(`${pad}move ${op.move}`);
    else if (op.turn) out.push(`${pad}turn ${op.turn}`);
    else if (op.paint) out.push(`${pad}pen: paint square`);
  }
  return out;
}

function randomOps(year) {
  const t = () => ({ turn: pick(['left', 'right']) });
  const m = (max = 3) => ({ move: 1 + rand(max) });
  if (year <= 3) return pick([[m(), t(), m()], [m(), t(), m(2), t(), m(2)], [m(4)], [t(), m(), t(), m()]]);
  if (year === 4) return pick([[{ repeat: 2, body: [m(2), t()] }], [m(), { repeat: 2, body: [m(1), t()] }, m()], [m(2), t(), m(2), t(), m(1)]]);
  return pick([
    [{ repeat: 3, body: [m(1), t()] }, m(2)],
    [{ repeat: 2, body: [m(2), { turn: 'right' }, m(1), { turn: 'left' }] }],
    [m(1), { repeat: 2, body: [{ repeat: 2, body: [m(1)] }, t()] }],
  ]);
}

function predictRound(year) {
  for (let tries = 0; tries < 200; tries++) {
    const cols = year <= 3 ? 5 : 6; const rows = year <= 3 ? 4 : 5;
    const dir = year >= 5 ? pick([0, 90, 180, 270]) : 0;
    const start = [rand(cols), rand(rows)];
    const ops = randomOps(year);
    const s = simulate(ops, start, dir, cols, rows);
    if (s.ok && (s.end[0] !== start[0] || s.end[1] !== start[1])) {
      return { id: id(), cols, rows, start, dir, blocks: ['when ▶ clicked', ...toBlocks(ops)], end: s.end };
    }
  }
  return null;
}

export function genPredict(year, n = 5) {
  const make = () => Array.from({ length: n }, () => predictRound(year)).filter(Boolean);
  return { engine: 'predict', title: 'Where will Dot stop?', rounds: make(), regen: make };
}

// ── Bug squash ───────────────────────────────────────────────────────────────
function bugRound(year) {
  for (let tries = 0; tries < 300; tries++) {
    const cols = 6; const rows = 5;
    const start = [0, 1 + rand(3)];
    const ops = year >= 4 && Math.random() < 0.5
      ? [{ repeat: 2 + rand(2), body: [{ move: 1 }] }, { turn: pick(['left', 'right']) }, { move: 1 + rand(2) }]
      : [{ move: 1 + rand(3) }, { turn: pick(['left', 'right']) }, { move: 1 + rand(2) }];
    const good = simulate(ops, start, 0, cols, rows);
    if (!good.ok) continue;
    const blocks = ['when ▶ clicked', ...toBlocks(ops)];
    const lines = blocks.map((b) => b.trim());
    const candidates = lines.map((b, k) => ({ b, k })).filter(({ b }) => /^(move|turn|repeat)/.test(b));
    const { b, k } = pick(candidates);
    let wrong; let fixes;
    if (b.startsWith('turn')) {
      wrong = b.includes('left') ? 'turn right' : 'turn left';
      fixes = [b, wrong, `move ${1 + rand(3)}`];
    } else {
      const [word, num] = b.split(' ');
      const n = Number(num);
      const w = n > 1 && Math.random() < 0.5 ? n - 1 : n + 1;
      wrong = `${word} ${w}`;
      fixes = [b, wrong, `${word} ${w === n + 1 ? n + 2 : Math.max(1, n - 2) === n ? n + 2 : Math.max(1, n - 2)}`];
    }
    fixes = [...new Set(fixes)];
    if (fixes.length < 2) continue;
    const buggy = blocks.map((x, j) => (j === k ? x.replace(b, wrong) : x));
    const order = shuffle(fixes.map((f, i) => ({ f, i })));
    return {
      id: id(), goal: 'Dot should reach the ⭐', blocks: buggy, bug: k,
      fixes: order.map((o) => o.f), fix: order.findIndex((o) => o.i === 0),
      why: b.startsWith('turn') ? 'Check which way Dot is facing before the turn.' : 'Count the squares to the star.',
      grid: { cols, rows, start, star: good.end },
    };
  }
  return null;
}

export function genBugs(year, n = 4) {
  const make = () => Array.from({ length: n }, () => bugRound(year)).filter(Boolean);
  return { engine: 'bugs', title: 'Bug Squash 🐞', rounds: make(), regen: make };
}

// ── Code painter ─────────────────────────────────────────────────────────────
function painterRound(year) {
  const P = { paint: true }; const F = (n = 1) => ({ move: n });
  const templates = year <= 3 ? [
    () => [{ repeat: 3 + rand(2), body: [P, F()] }],
    () => [{ repeat: 3, body: [P, F(2)] }],
    () => [P, F(), P, { turn: 'right' }, F(), P],
  ] : year === 4 ? [
    () => [{ repeat: 4, body: [P, F(), { turn: 'right' }] }],
    () => [{ repeat: 2, body: [{ repeat: 3, body: [P, F()] }, { turn: 'right' }, F(), { turn: 'right' }] }],
    () => [{ repeat: 4, body: [P, F(2)] }],
  ] : [
    () => [{ repeat: 2, body: [{ repeat: 3, body: [P, F()] }, { turn: 'right' }, F(), { turn: 'right' }, F(), { turn: 'left' }, { turn: 'left' }] }],
    () => [{ repeat: 3, body: [P, F(), P, { turn: 'right' }, F(), { turn: 'left' }] }],
    () => [{ repeat: 4, body: [{ repeat: 2, body: [P, F()] }, { turn: 'right' }] }],
  ];
  for (let tries = 0; tries < 300; tries++) {
    const ops = pick(templates)();
    const cols = 6; const rows = 5; const start = [rand(3), rand(rows)];
    const s = simulate(ops, start, 0, cols, rows);
    if (s.ok && s.painted.length >= 3) return { id: id(), cols, rows, start, dir: 0, blocks: ['when ▶ clicked', ...toBlocks(ops)], paint: s.painted };
  }
  return null;
}

export function genPainter(year, n = 3) {
  const make = () => Array.from({ length: n }, () => painterRound(year)).filter(Boolean);
  return { engine: 'painter', title: 'Code Painter 🎨', rounds: make(), regen: make };
}

// ── Number crunch (multiple choice with code) ───────────────────────────────
function numOptions(ans, spread = 3) {
  const s = new Set([ans]);
  while (s.size < 4) { const d = 1 + rand(spread); s.add(Math.random() < 0.5 ? ans + d : Math.max(0, ans - d)); if (s.size < 4 && Math.random() < 0.2) s.add(ans * 2); }
  const opts = [...s].slice(0, 4);
  return { options: opts.map(String), answer: opts.indexOf(ans) };
}

const CRUNCH = {
  loops(year) {
    if (year <= 3 || Math.random() < 0.4) {
      const n = 2 + rand(5); const m = 1 + rand(3);
      const ans = n * m;
      return { q: `How many squares does Dot move altogether?`, blocks: ['when ▶ clicked', `repeat ${n}`, `  move ${m}`, 'end'], ...numOptions(ans), why: `${n} × ${m} = ${ans}` };
    }
    const a = 2 + rand(3); const b = 2 + rand(4);
    return { q: 'How many times does Dot clap?', blocks: ['when ▶ clicked', `repeat ${a}`, `  repeat ${b}`, '    play sound clap', '  end', 'end'], ...numOptions(a * b), why: `The inner loop runs ${b} times for each of the ${a} outer loops: ${a} × ${b} = ${a * b}.` };
  },
  variables(year) {
    const start = rand(4); const k = 2 + rand(3); const step = 1 + rand(year >= 5 ? 5 : 2); const minus = rand(3);
    const ans = start + k * step - minus;
    return {
      q: 'What is the score at the end?',
      blocks: ['when ▶ clicked', `set score to ${start}`, `repeat ${k}`, `  change score by ${step}`, 'end', ...(minus ? [`change score by -${minus}`] : [])],
      ...numOptions(ans), why: `${start} + ${k} × ${step}${minus ? ` − ${minus}` : ''} = ${ans}`,
    };
  },
  conditions(year) {
    const score = rand(15); const lim = 5 + rand(6);
    const win = score > lim;
    const r = {
      q: `score is ${score}. What does Dot say?`,
      blocks: [`if score > ${lim} then`, '  say You win!', 'else', '  say Keep going!', 'end'],
      options: ['You win!', 'Keep going!', 'Nothing'], answer: win ? 0 : 1,
      why: `${score} > ${lim} is ${win ? 'true' : 'false'}, so the ${win ? 'then' : 'else'} part runs.`,
    };
    if (year >= 5 && Math.random() < 0.5) {
      const a = Math.random() < 0.5; const b = Math.random() < 0.5; const op = pick(['and', 'or']);
      const res = op === 'and' ? a && b : a || b;
      return { q: `raining = ${a}, cold = ${b}. Does Dot wear a coat?`, blocks: [`if raining ${op} cold then`, '  say Coat on!', 'else', '  say No coat', 'end'], options: ['Coat on!', 'No coat'], answer: res ? 0 : 1, why: `${a} ${op.toUpperCase()} ${b} is ${res}.` };
    }
    return r;
  },
  lists() {
    const items = shuffle(['apple', 'pear', 'plum', 'fig', 'kiwi', 'lime']).slice(0, 4 + rand(2));
    if (Math.random() < 0.5) {
      const k = 1 + rand(items.length);
      return { q: `backpack = [${items.join(', ')}]. What is item ${k}?`, options: shuffle(items).slice(0, 3).concat(items[k - 1]).filter((x, i, a) => a.indexOf(x) === i).slice(0, 4), answer: -1, _ans: items[k - 1], why: `Count from the start: item ${k} is ${items[k - 1]}.` };
    }
    return { q: `backpack = [${items.join(', ')}]. What is the length of backpack?`, ...numOptions(items.length, 2), why: `There are ${items.length} items.` };
  },
  python() {
    const kind = rand(4);
    if (kind === 0) { const n = 2 + rand(4); return { q: 'How many lines does this print?', visual: { type: 'code', code: `for i in range(${n}):\n    print("Beep")` }, ...numOptions(n, 2), why: `range(${n}) gives ${n} numbers: 0 to ${n - 1}.` }; }
    if (kind === 1) { const a = 2 + rand(8); const b = 2 + rand(5); return { q: 'What does this print?', visual: { type: 'code', code: `coins = ${a}\ncoins = coins * ${b}\nprint(coins)` }, ...numOptions(a * b, 4), why: `${a} × ${b} = ${a * b}` }; }
    if (kind === 2) { const n = 3 + rand(4); return { q: 'What is the LAST number printed?', visual: { type: 'code', code: `for i in range(${n}):\n    print(i)` }, ...numOptions(n - 1, 2), why: `range(${n}) stops before ${n}, so the last is ${n - 1}.` }; }
    const age = 8 + rand(5);
    return { q: 'What does this print?', visual: { type: 'code', code: `age = ${age}\nif age >= 10:\n    print("Year 5 or 6")\nelse:\n    print("Younger")` }, options: ['Year 5 or 6', 'Younger', 'Nothing'], answer: age >= 10 ? 0 : 1, why: `${age} >= 10 is ${age >= 10 ? 'True' : 'False'}.` };
  },
  angles() {
    const sides = pick([3, 4, 5, 6, 8, 9, 10]);
    const names = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon' };
    const ans = 360 / sides;
    const opts = [...new Set([ans, 180 - ans, ans * 2, 90])].slice(0, 4);
    return { q: `To draw a regular ${names[sides]}: repeat ${sides} { move 50, turn ? }. What is the turn?`, options: opts.map((o) => `${o}°`), answer: opts.indexOf(ans), why: `360 ÷ ${sides} = ${ans}°` };
  },
  stats() {
    const data = Array.from({ length: 5 }, () => 2 + rand(10)).sort((a, b) => a - b);
    const which = pick(['mean', 'median', 'range']);
    let ans;
    if (which === 'median') ans = data[2];
    else if (which === 'range') ans = data[4] - data[0];
    else { const sum = data.reduce((a, b) => a + b, 0); ans = Math.round((sum / 5) * 10) / 10; }
    const o = numOptions(Math.round(ans), 3);
    if (which === 'mean' && !Number.isInteger(ans)) { o.options[o.answer] = String(ans); }
    return { q: `Data: ${data.join(', ')}. What is the ${which}?`, ...o, why: which === 'mean' ? `Add them (${data.reduce((a, b) => a + b, 0)}) and divide by 5 = ${ans}.` : which === 'median' ? 'The middle value when sorted.' : `${data[4]} − ${data[0]} = ${ans}` };
  },
  spreadsheet() {
    const p = 2 + rand(8); const q = 2 + rand(9); const kind = rand(2);
    if (kind === 0) return { q: `B2 = ${p} and C2 = ${q}. What does =B2*C2 show?`, ...numOptions(p * q, 5), why: `${p} × ${q} = ${p * q}` };
    const v = [p, q, 1 + rand(9)];
    return { q: `D2 = ${v[0]}, D3 = ${v[1]}, D4 = ${v[2]}. What does =SUM(D2:D4) show?`, ...numOptions(v[0] + v[1] + v[2], 4), why: `${v.join(' + ')} = ${v[0] + v[1] + v[2]}` };
  },
  cipher() {
    const w = pick(['CODE', 'BYTE', 'LOOP', 'DATA', 'ROBOT', 'PIXEL', 'DEBUG', 'CLOUD']);
    const shift = pick([1, 2, 3]);
    const enc = w.split('').map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65)).join('');
    const others = shuffle(['CODE', 'BYTE', 'LOOP', 'DATA', 'ROBOT', 'PIXEL', 'DEBUG', 'CLOUD'].filter((x) => x !== w)).slice(0, 3);
    const opts = shuffle([w, ...others]);
    return { q: `Each letter was shifted forward by ${shift}. Decode it!`, big: enc, options: opts, answer: opts.indexOf(w), why: `Shift every letter back by ${shift}: ${enc} → ${w}.` };
  },
  efficiency() {
    const n = 2 + rand(4);
    return { q: `Which program is the most efficient way to move ${n * 2} squares?`, options: [`repeat ${n} { move 2 }`, Array(n * 2).fill('move 1').join(', ').slice(0, 40) + '…', `move ${n * 2}`], answer: 2, why: `One block does it all: move ${n * 2}.` };
  },
};

export function genCrunch(kind, year, n = 5, title = 'Number Crunch 🔢') {
  const make = () => Array.from({ length: n }, () => {
    const r = CRUNCH[kind](year);
    if (r._ans) { r.options = [...new Set(r.options.concat(r._ans))].slice(-4); r.answer = r.options.indexOf(r._ans); }
    return { ...r, id: id() };
  });
  return { engine: 'choice', title, how: 'Read the code carefully, then choose.', rounds: make(), regen: make };
}

// ── Chart detective ─────────────────────────────────────────────────────────
const CHART_SETS = [
  { title: 'Favourite fruit', labels: ['Apple', 'Banana', 'Grapes', 'Mango', 'Kiwi'] },
  { title: 'How we travel to school', labels: ['Walk', 'Car', 'Bus', 'Bike', 'Scooter'] },
  { title: 'Favourite sport', labels: ['Football', 'Netball', 'Swimming', 'Tennis', 'Gym'] },
  { title: 'Books read this week', labels: ['3A', '3B', '4A', '4B', '5A'] },
];
function chartRound(year) {
  const set = pick(CHART_SETS);
  const k = year <= 3 ? 4 : 5;
  const labels = set.labels.slice(0, k);
  const vals = labels.map(() => 2 + rand(year <= 3 ? 10 : 18));
  const data = labels.map((l, i) => [l, vals[i]]);
  const max = Math.max(...vals); const min = Math.min(...vals);
  const top = labels[vals.indexOf(max)]; const bot = labels[vals.indexOf(min)];
  const kind = rand(3);
  const visual = { type: 'bars', data };
  if (kind === 0 || vals.filter((v) => v === max).length > 1) {
    if (vals.filter((v) => v === max).length > 1) vals[vals.indexOf(max)] += 1;
    data.forEach((d, i) => { d[1] = vals[i]; });
    const m2 = Math.max(...vals);
    return { id: id(), q: `${set.title}: which is the most popular?`, visual, options: labels.slice(0, 4).includes(labels[vals.indexOf(m2)]) ? labels.slice(0, 4) : [...labels.slice(0, 3), labels[vals.indexOf(m2)]], _ans: labels[vals.indexOf(m2)], why: `${labels[vals.indexOf(m2)]} has the tallest bar (${m2}).` };
  }
  if (kind === 1) return { id: id(), q: `${set.title}: how many more for ${top} than ${bot}?`, visual, ...numOptions(max - min, 3), why: `${max} − ${min} = ${max - min}` };
  const total = vals.reduce((a, b) => a + b, 0);
  return { id: id(), q: `${set.title}: how many altogether?`, visual, ...numOptions(total, 5), why: `${vals.join(' + ')} = ${total}` };
}
export function genChart(year, n = 4) {
  const make = () => Array.from({ length: n }, () => {
    const r = chartRound(year);
    if (r._ans) { r.answer = r.options.indexOf(r._ans); }
    return r;
  });
  return { engine: 'choice', title: 'Chart Detective 🔍', how: 'Read the chart, then answer.', rounds: make(), regen: make };
}

// ── Guess my number ─────────────────────────────────────────────────────────
export function genGuess() {
  const make = () => [20, 50, 100].map((max) => ({ id: id(), max, target: 1 + rand(max), limit: Math.ceil(Math.log2(max + 1)) }));
  return { engine: 'guess', title: 'Binary Search Challenge 🎯', how: 'Guess the middle each time to halve what’s left!', rounds: make(), regen: make };
}

// ── Networks ────────────────────────────────────────────────────────────────
const NETS = [
  {
    nodes: [{ id: 'A', x: 10, y: 31, label: 'Your tablet' }, { id: 'R1', x: 32, y: 14, label: 'Router', icon: '📡' }, { id: 'R2', x: 32, y: 48, label: 'Router', icon: '📡' },
      { id: 'R3', x: 60, y: 14, label: 'Router', icon: '📡' }, { id: 'R4', x: 60, y: 48, label: 'Router', icon: '📡' }, { id: 'B', x: 88, y: 31, label: 'Friend' }],
    links: [['A', 'R1'], ['A', 'R2'], ['R1', 'R3'], ['R2', 'R4'], ['R1', 'R4'], ['R3', 'B'], ['R4', 'B']],
  },
  {
    nodes: [{ id: 'A', x: 8, y: 14, label: 'School' }, { id: 'S', x: 30, y: 31, label: 'Switch', icon: '🔀' }, { id: 'R1', x: 52, y: 12, label: 'Router', icon: '📡' },
      { id: 'R2', x: 52, y: 50, label: 'Router', icon: '📡' }, { id: 'SV', x: 74, y: 31, label: 'Server', icon: '🗄️' }, { id: 'B', x: 92, y: 50, label: 'Museum' }],
    links: [['A', 'S'], ['S', 'R1'], ['S', 'R2'], ['R1', 'SV'], ['R2', 'SV'], ['R2', 'B'], ['SV', 'B']],
  },
  {
    nodes: [{ id: 'A', x: 8, y: 48, label: 'Home' }, { id: 'R1', x: 26, y: 20, label: 'Router', icon: '📡' }, { id: 'R2', x: 44, y: 48, label: 'Router', icon: '📡' },
      { id: 'R3', x: 62, y: 20, label: 'Router', icon: '📡' }, { id: 'R4', x: 78, y: 48, label: 'Router', icon: '📡' }, { id: 'B', x: 93, y: 20, label: 'Grandma' }],
    links: [['A', 'R1'], ['A', 'R2'], ['R1', 'R2'], ['R1', 'R3'], ['R2', 'R4'], ['R3', 'R4'], ['R3', 'B'], ['R4', 'B']],
  },
];
function connected(net, broken) {
  const k = (a, b) => [a, b].sort().join('-');
  const br = new Set(broken.map(([a, b]) => k(a, b)));
  const seen = new Set(['A']); const q = ['A'];
  while (q.length) { const n = q.shift(); net.links.forEach(([x, y]) => { if (br.has(k(x, y))) return; const o = x === n ? y : y === n ? x : null; if (o && !seen.has(o)) { seen.add(o); q.push(o); } }); }
  return seen.has('B');
}
export function genNetwork() {
  const rounds = NETS.map((net) => {
    let broken;
    for (let t = 0; t < 50; t++) { broken = [pick(net.links)]; if (connected(net, broken)) break; }
    return { id: id(), ...net, from: 'A', to: 'B', broken };
  });
  return { engine: 'network', title: 'Message Mission 📨', rounds };
}

// ── Logic lamps ─────────────────────────────────────────────────────────────
export function genLogic(year) {
  const easy = [
    { expr: 'it is dark', inputs: [{ id: 'd', label: '🌙 It is dark' }], test: (v) => v.d, why: 'The night light only turns on when it is dark.' },
    { expr: 'button pressed', inputs: [{ id: 'b', label: '🔴 Button pressed' }], test: (v) => v.b, why: 'The condition is just “button pressed”.' },
    { expr: 'someone is near the door', inputs: [{ id: 'n', label: '🚶 Someone near the door' }, { id: 'c', label: '🐈 Cat asleep' }], test: (v) => v.n, why: 'Only “someone near the door” matters here.' },
  ];
  const mid = [
    { expr: 'dark AND someone moving', inputs: [{ id: 'd', label: '🌙 It is dark' }, { id: 'm', label: '🚶 Someone moving' }], test: (v) => v.d && v.m, why: 'AND needs both to be true.' },
    { expr: 'doorbell OR knock', inputs: [{ id: 'b', label: '🔔 Doorbell pressed' }, { id: 'k', label: '✊ Knock on door' }], test: (v) => v.b || v.k, why: 'OR needs at least one to be true.' },
    { expr: 'NOT raining', inputs: [{ id: 'r', label: '🌧️ It is raining' }], test: (v) => !v.r, why: 'NOT flips it: the lamp is on when it is NOT raining.' },
  ];
  const hard = [
    { expr: '(sunny OR warm) AND NOT windy', inputs: [{ id: 's', label: '☀️ Sunny' }, { id: 'w', label: '🌡️ Warm' }, { id: 'x', label: '💨 Windy' }], test: (v) => (v.s || v.w) && !v.x, why: 'Sunny or warm — and it must not be windy.' },
    { expr: 'hasTicket AND (age >= 12 OR withAdult)', inputs: [{ id: 't', label: '🎟️ Has ticket' }, { id: 'a', label: '🎂 Age 12 or over' }, { id: 'p', label: '🧑 With an adult' }], test: (v) => v.t && (v.a || v.p), why: 'A ticket is always needed, plus being 12+ or with an adult.' },
    { expr: 'NOT (lowBattery OR raining)', inputs: [{ id: 'l', label: '🪫 Low battery' }, { id: 'r', label: '🌧️ Raining' }], test: (v) => !(v.l || v.r), why: 'The robot goes out only if neither is true.' },
  ];
  const list = year <= 4 ? [...easy, mid[0], mid[1]] : year === 5 ? mid.concat(hard[0]) : [...mid.slice(0, 1), ...hard];
  return { engine: 'logic', title: 'Logic Lamps 💡', rounds: list.map((r) => ({ ...r, id: id() })) };
}

// ── Packs ───────────────────────────────────────────────────────────────────
export function tfGame(topic, n = 7, title = 'True or False? ⚡') {
  const pool = TF[topic] || TF.algorithms;
  const make = () => shuffle(pool).slice(0, n).map((x) => ({ ...x, id: id() }));
  return { engine: 'truefalse', title, rounds: make() };
}
export function sortGame(key) {
  const s = SORTS[key];
  return { engine: 'sort', title: `${s.title} 🗂️`, how: s.how, bins: s.bins, items: shuffle(s.items) };
}
export function scenarioGame(topic) {
  const pool = SCENARIOS[topic] || SCENARIOS.safety;
  return { engine: 'choice', title: 'What should you do? 🤔', how: 'Choose the best thing to do.', rounds: shuffle(pool).map((r) => ({ ...r, id: id() })) };
}
export function orderGame(keys, title) {
  const rounds = keys.map((k) => ORDERS[k] || k).filter(Boolean).map((o) => ({ ...o, pool: shuffle(o.steps) }));
  return { engine: 'order', title: title || 'Order Up! 🔢', rounds };
}

// ── Lesson → games ──────────────────────────────────────────────────────────
export function topicFor(lesson) {
  const t = `${lesson?.title || ''}`.toLowerCase();
  if (lesson?.kind === 'review') return 'review';
  if (/python/.test(t)) return 'python';
  if (/algorithm patterns/.test(t)) return 'search-algo';
  if (/evaluate ai|ai-generated|ai, bias|ethics/.test(t)) return 'ai';
  if (/networks and searching/.test(t)) return 'network';
  if (/search|website|sources|sceptical/.test(t)) return 'search';
  if (/welcome|safe|kindness|privacy|footprint|cyber|citizenship|security|accounts|files, apps/.test(t)) return 'safety';
  if (/connect|internet|network|communication/.test(t)) return 'network';
  if (/collaborat|pair|team roles|version control|peer review|rubric|user testing/.test(t)) return 'collab';
  if (/spreadsheet/.test(t)) return 'spreadsheet';
  if (/in your program|data structures|lists/.test(t)) return 'lists';
  if (/database|data|survey|chart|information|analyse|interpret|structured/.test(t)) return 'data';
  if (/\bweb\b|micro-site|app inventor|app prototype|user experience/.test(t)) return 'web';
  if (/routine|storyboard|adventure game|capstone|showcase|decompos|break it down|modular|plan before|game design/.test(t)) return 'project';
  if (/movement and bounds/.test(t)) return 'predict';
  if (/nested|loop|repeat/.test(t)) return 'loops';
  if (/\bart\b|pattern|\bpen\b|media|animate|vector|video|\b3d\b|poster/.test(t)) return 'media';
  if (/shape/.test(t)) return 'loops';
  if (/event|green flag|keyboard|interaction/.test(t)) return 'events';
  if (/variable|score|counter|collector|game state|mechanics/.test(t)) return 'variables';
  if (/decision|\bif\b|else|selection|boolean|conditional/.test(t)) return 'conditions';
  if (/sensor|sensing|input|output|robot|autonomous/.test(t)) return 'sensors';
  if (/debug|test|bug/.test(t)) return 'debug';
  if (/predict|trace|explain and justify|logical reasoning/.test(t)) return 'predict';
  if (/efficien/.test(t)) return 'efficiency';
  return 'algorithms';
}

function teachingSteps(yr, idx) {
  const ex = getTeaching(yr, idx)?.example;
  if (ex?.type === 'steps' && ex.items.length >= 3 && ex.items.length <= 7 && ex.items.every((x) => x.length < 70)) return { title: ex.title, steps: ex.items };
  return null;
}

function recipe(topic, year, yr, idx, lesson) {
  const T = (topicKey, n) => tfGame(topicKey, n);
  switch (topic) {
    case 'safety': return year >= 5
      ? [sortGame(/security|accounts/.test(lesson.title.toLowerCase()) ? 'passwords' : 'phishing'), scenarioGame('safety'), T('safety')]
      : [sortGame(/kind/.test(lesson.title.toLowerCase()) ? 'kindness' : 'privacy'), scenarioGame('safety'), orderGame(['worried'])];
    case 'search': return [sortGame(year >= 5 ? 'factOpinion' : 'adverts'), T('search'), year >= 4 ? scenarioGame('search') : orderGame(['search'])];
    case 'ai': return [T('ai'), year >= 6 && /bias|ethics/.test(lesson.title.toLowerCase()) ? sortGame('fairData') : scenarioGame('ai'), /bias|ethics/.test(lesson.title.toLowerCase()) ? scenarioGame('ai') : sortGame('fairData')];
    case 'network': return [genNetwork(), T(/search/.test(lesson.title.toLowerCase()) ? 'search' : 'network'), year >= 6 ? genCrunch('cipher', year, 5, 'Code Cracker 🔐') : year >= 4 ? orderGame([/search/.test(lesson.title.toLowerCase()) ? 'search' : 'packet']) : sortGame('online')];
    case 'collab': return [sortGame('comments'), T('collab'), orderGame([/version/.test(lesson.title.toLowerCase()) ? 'version' : 'pair'])];
    case 'spreadsheet': return [genCrunch('spreadsheet', year, 5, 'Spreadsheet Sums 🧮'), sortGame('formulaValue'), genChart(year)];
    case 'lists': return [genCrunch('lists', year, 5, 'List Lab 📋'), genCrunch('variables', year, 4, 'Variable Tracker 📦'), genPredict(year, 4)];
    case 'data': return [genChart(year), year >= 4 ? sortGame('surveyQ') : orderGame(['data']), year >= 6 ? genCrunch('stats', year, 5, 'Average Attack 📊') : T('data')];
    case 'web': return [year >= 6 ? sortGame('htmlCss') : sortGame('comments'), T('web'), orderGame(['web'])];
    case 'media': {
      const t = lesson.title.toLowerCase();
      if (/animate/.test(t)) return [orderGame(['animation'], 'Animation Studio 🎬'), sortGame('events'), T('media')];
      if (/photo and audio/.test(t)) return [sortGame('events'), genPainter(year), T('media')];
      return [genPainter(year), year >= 5 ? sortGame('vectorBitmap') : genCrunch('angles', year, 5, 'Shape Spinner 🔷'), T('media')];
    }
    case 'loops': return [genCrunch('loops', year, 5, 'Loop Counter 🔁'), genPainter(year), genPredict(year, 4)];
    case 'events': return [sortGame('events'), genPredict(year, 4), T('events')];
    case 'variables': return [genCrunch('variables', year, 5, 'Variable Tracker 📦'), sortGame('varNames'), genPredict(year, 4)];
    case 'conditions': return [genLogic(year), genCrunch('conditions', year, 5, 'If-Then Challenge 🔀'), sortGame('constructs')];
    case 'sensors': return [sortGame('io'), genLogic(year), genPredict(year, 4)];
    case 'debug': return [genBugs(year), sortGame('goodDebug'), genPredict(year, 4)];
    case 'predict': return [genPredict(year, 5), genBugs(year, 3), genCrunch(year >= 4 ? 'loops' : 'variables', year, 4, 'Number Crunch 🔢')];
    case 'efficiency': return [genCrunch('efficiency', year, 4, 'Efficiency Expert ⚡'), genBugs(year, 3), genPredict(year, 4)];
    case 'search-algo': return [genGuess(), T('algorithms'), genPredict(year, 4)];
    case 'python': return [genCrunch('python', year, 6, 'Python Predictor 🐍'), T('python'), genCrunch(/function/.test(lesson.title.toLowerCase()) ? 'variables' : 'conditions', year, 4)];
    case 'project': {
      const t = lesson.title.toLowerCase();
      const steps = teachingSteps(yr, idx);
      if (/showcase/.test(t)) return [tfGame(pick(['algorithms', 'events', 'debug']), 8, 'Quiz Show ⚡'), genPredict(year, 4), genCrunch(year >= 4 ? 'loops' : 'variables', year, 4, 'Code Champions 🏆')];
      if (/build|debug/.test(t)) return [genBugs(year), genPredict(year, 4), sortGame('goodDebug')];
      if (/present|launch|portfolio|peer/.test(t)) return [sortGame('comments'), T('project'), orderGame([steps || 'project'])];
      if (/physical computing|storyboard/.test(t)) return [sortGame('io'), genLogic(year), orderGame([steps || 'project'])];
      if (/adventure game|game design/.test(t)) return [orderGame([steps || 'project']), genLogic(year), sortGame('mustNice')];
      if (/modular/.test(t)) return [orderGame([steps || 'project']), genPredict(year, 4), sortGame('constructs')];
      return [orderGame([steps || 'project']), sortGame('mustNice'), T('project')];
    }
    case 'review': return [T(pick(['algorithms', 'debug', 'events'])), genPredict(year, 4), genCrunch(year >= 4 ? 'loops' : 'variables', year, 4, 'Quick-Fire Code 🔢')];
    default: {
      const steps = teachingSteps(yr, idx);
      return [orderGame([steps || pick(['toast', 'teeth'])]), genPredict(year, 4), genBugs(year, 3)];
    }
  }
}

const XP = [15, 20, 25];
export function funGamesFor(yr, idx) {
  const lesson = COURSES[yr]?.lessons?.[idx];
  if (!lesson) return [];
  const year = parseInt(String(yr).replace('y', ''), 10) || 3;
  const topic = topicFor(lesson);
  const games = recipe(topic, year, yr, idx, lesson).filter(Boolean);
  return games.map((g, i) => ({
    type: 'game',
    title: g.title,
    description: g.how || '',
    xp: XP[i] || 20,
    duration: '4 min',
    topic,
    game: g,
  }));
}
