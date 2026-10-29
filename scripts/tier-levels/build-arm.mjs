/**
 * Robot Arm workshops 11–50. Same bench and rules as the original ten
 * (ArmWorkshop.js): everything sits on the claw's circle, and the solver turns
 * each task into the exact block program, so every task is checked solvable.
 *
 * Harder tiers mean more jobs, finer angles (45° → 30° → 15° steps), jobs that
 * repeat (loops) and several kinds of job in one workshop.
 */
import { rng, writeData, TIERS } from './common.mjs';

const P = (name, jobs) => ({ name, jobs });
// job: [type, count]. Types: sort, tower, paint, recycle, cherry, bells, seeds, marble, car
const PLANS = [
  // Easy
  P('Two Cube Sort', [['sort', 2]]), P('Little Tower', [['tower', 2]]), P('Paint Pot Pair', [['paint', 2]]),
  P('Bottle and Can Bins', [['recycle', 2]]), P('Cherry Topper', [['cherry', 2]]), P('Three Bell Tune', [['bells', 3]]),
  P('Seed Starter', [['seeds', 2]]), P('Marble Move', [['marble', 2]]), P('Wheel Fitter', [['car', 2]]),
  P('Three Cube Sort', [['sort', 3]]),
  // Medium
  P('Rainbow Cube Sort', [['sort', 4]]), P('Four Block Tower', [['tower', 4]]), P('Gallery Paints', [['paint', 3], ['bells', 1]]),
  P('Recycling Rush', [['recycle', 3]]), P('Cupcake Party', [['cherry', 4]]), P('Bell Scale', [['bells', 5]]),
  P('Flower Bed Row', [['seeds', 4]]), P('Marble Relay', [['marble', 4]]), P('Toy Car Kit', [['car', 3]]),
  P('Sort and Signal', [['sort', 3], ['bells', 2]]),
  // Hard
  P('Five Colour Sorter', [['sort', 5]]), P('Tall Tower Challenge', [['tower', 5]]), P('Art Class Delivery', [['paint', 4], ['bells', 2]]),
  P('Recycling Plant', [['recycle', 5]]), P('Bakery Rush', [['cherry', 5], ['bells', 1]]), P('Bell Melody', [['bells', 7]]),
  P('Greenhouse Planting', [['seeds', 5], ['sort', 1]]), P('Marble Machine', [['marble', 5], ['bells', 1]]),
  P('Race Car Workshop', [['car', 3], ['tower', 2]]), P('Factory Shift', [['sort', 3], ['tower', 2], ['bells', 1]]),
  // Advanced
  P('Warehouse Sorter', [['sort', 5], ['bells', 1]]), P('Skyscraper Stack', [['tower', 6], ['bells', 1]]),
  P('Studio Masterpiece', [['paint', 3], ['sort', 2], ['bells', 1]]), P('Zero Waste Line', [['recycle', 6], ['bells', 1]]),
  P('Wedding Cake Line', [['cherry', 6], ['tower', 2]]), P('Bell Symphony', [['bells', 8]]),
  P('Garden Centre', [['seeds', 5], ['paint', 2], ['bells', 1]]), P('Marble Fountain', [['marble', 6], ['sort', 2]]),
  P('Car Factory Line', [['car', 3], ['sort', 3], ['bells', 1]]), P('Robot Arm Grand Finale', [['sort', 2], ['tower', 2], ['cherry', 2], ['bells', 1]]),
];

const COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
const GRID = [45, 30, 15, 15];
const MIN_SEP = 30; // claw grabs within 0.9 of its tip: 30° apart on the 2.0 circle is 1.04

function angleSlots(r, n, grid) {
  // Free angles on the circle, at least MIN_SEP apart
  const all = [];
  for (let a = -180 + grid; a <= 180; a += grid) all.push(a);
  for (let attempt = 0; attempt < 2000; attempt++) {
    const pool = [...all].sort(() => r() - 0.5);
    const got = [];
    for (const a of pool) {
      if (got.every((b) => Math.abs((((a - b) % 360) + 540) % 360 - 180) >= MIN_SEP)) got.push(a);
      if (got.length === n) return got;
    }
  }
  return null;
}

function buildTask(plan, r, grid) {
  // How many places on the bench each job needs
  const need = plan.jobs.reduce((s, [type, n]) => s + ({
    sort: n * 2, paint: n * 2, tower: n + 1, recycle: n + Math.min(3, n), cherry: n + 1, seeds: n + 1,
    marble: 2, car: n + 1, bells: n,
  }[type]), 0);
  const slots = angleSlots(r, need, grid);
  if (!slots) return null;
  let k = 0; const take = () => slots[k++];
  const task = { items: [], targets: [], sources: [], bells: [] };
  let colorAt = r.int(0, COLORS.length - 1);
  const nextColor = () => COLORS[(colorAt++) % COLORS.length];
  let bellN = 1;
  plan.jobs.forEach(([type, n], j) => {
    const id = (s) => `j${j}_${s}`;
    if (type === 'sort' || type === 'paint') {
      for (let i = 0; i < n; i++) {
        const color = nextColor();
        task.items.push({ id: id(`i${i}`), kind: type === 'sort' ? 'cube' : 'pot', angle: take(), color });
        task.targets.push({ id: id(`t${i}`), kind: type === 'sort' ? 'tray' : 'easel', angle: take(), accepts: [id(`i${i}`)], cap: 1, color });
      }
    } else if (type === 'tower') {
      const ids = [];
      for (let i = 0; i < n; i++) { ids.push(id(`b${i}`)); task.items.push({ id: id(`b${i}`), kind: 'block', angle: take(), color: nextColor(), letter: String.fromCharCode(65 + i) }); }
      task.targets.push({ id: id('tower'), kind: 'towerBase', angle: take(), accepts: ids, cap: n, stack: true });
    } else if (type === 'recycle') {
      const bins = [['paper', 'blue', 'PAPER'], ['bottle', 'yellow', 'PLASTIC'], ['can', 'red', 'METAL']].slice(0, Math.min(3, n));
      const accepts = bins.map(() => []);
      for (let i = 0; i < n; i++) {
        const b = i % bins.length;
        task.items.push({ id: id(`r${i}`), kind: bins[b][0], angle: take() });
        accepts[b].push(id(`r${i}`));
      }
      bins.forEach(([, color, label], b) => task.targets.push({ id: id(`bin${b}`), kind: 'bin', angle: take(), accepts: accepts[b], cap: accepts[b].length, color, label }));
    } else if (type === 'cherry' || type === 'seeds') {
      task.sources.push({ id: id('src'), kind: type === 'cherry' ? 'bowl' : 'seedBag', angle: take(), give: type === 'cherry' ? 'cherry' : 'seed', count: type === 'cherry' ? n : 99 });
      for (let i = 0; i < n; i++) task.targets.push({ id: id(`k${i}`), kind: type === 'cherry' ? 'cupcake' : 'flowerPot', angle: take(), accepts: [type === 'cherry' ? 'cherry' : 'seed'], cap: 1 });
    } else if (type === 'marble') {
      task.sources.push({ id: id('cupA'), kind: 'cup', angle: take(), give: 'marble', count: n, color: 'blue' });
      task.targets.push({ id: id('cupB'), kind: 'cup', angle: take(), accepts: ['marble'], cap: n, color: 'green' });
    } else if (type === 'car') {
      const ids = [];
      for (let i = 0; i < n; i++) { const kind = i === n - 1 && n > 2 ? 'sticker' : 'wheel'; ids.push(id(`p${i}`)); task.items.push({ id: id(`p${i}`), kind, angle: take() }); }
      task.targets.push({ id: id('car'), kind: 'car', angle: take(), accepts: ids, cap: n });
    } else if (type === 'bells') {
      const order = Array.from({ length: n }, (_, i) => i + bellN).sort(() => r() - 0.5);
      for (let i = 0; i < n; i++) task.bells.push({ id: id(`bell${i}`), angle: take(), n: order[i], color: nextColor(), ...(plan.jobs.length > 1 ? { last: true } : {}) });
      bellN += n;
    }
  });
  // Two sources giving the same thing would make a target accept either: keep one per kind
  const gives = task.sources.map((s) => s.give);
  if (new Set(gives).size !== gives.length) return null;
  for (const key of ['items', 'targets', 'sources', 'bells']) if (!task[key].length) delete task[key];
  return task;
}

/** Same plan as ArmWorkshop.solveArmTask: the moves a correct program makes. */
function countMoves(task) {
  let n = 0;
  (task.items || []).forEach(() => { n += 1; });
  (task.sources || []).forEach((src) => (task.targets || []).filter((t) => t.accepts.includes(src.give)).forEach((t) => { n += Math.min(t.cap, src.count); }));
  n += (task.bells || []).length;
  return n;
}

export function buildArm() {
  const out = []; const seen = new Set();
  PLANS.forEach((plan, i) => {
    const tierIndex = Math.floor(i / 10);
    for (let attempt = 0; attempt < 3000; attempt++) {
      const r = rng(`arm:${i}:${attempt}`);
      const task = buildTask(plan, r, GRID[tierIndex]);
      if (!task) continue;
      const key = JSON.stringify(task);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ mode: 11 + i, name: plan.name, tier: TIERS[tierIndex], jobs: plan.jobs.map(([t, n]) => `${t}×${n}`).join(', '), moves: countMoves(task), task });
      return;
    }
    throw new Error(`No arm layout for ${plan.name}`);
  });
  const size = writeData('arm-tiers.js', 'Robot Arm workshops for modes 11–50. Same task format as ARM_TASKS in ArmWorkshop.js.', { ARM_TIER_TASKS: out });
  return { report: out.map((l) => `${l.mode} ${l.tier} ${l.name} [${l.jobs}] moves=${l.moves}`), size };
}

if (process.argv[1]?.endsWith('build-arm.mjs')) {
  const { report, size } = buildArm();
  console.log(report.join('\n'), '\nbytes', size);
}
