/**
 * Football (Striker FC), Boxing and Flappy Bird modes 11–50. Each uses the same
 * game as the original ten — the same pitches, rings and pipes — with harder
 * settings each tier: smarter, faster opponents, more goals or pipes needed and
 * less time.
 */
import { writeData, TIERS } from './common.mjs';
import { FIGHTING_COURSES } from '../../src/virtual-robot-designer/data/fighting-courses.js';

const FIGHT_MODE = Object.fromEntries(FIGHTING_COURSES.map((c) => [c.id, c.fightMode]));

/* ─── Football ─────────────────────────────────────────────────────────── */
// [name, football course (one of the ten original game types)]
const FOOTBALL = [
  ['First Touch Training', 'football_training'], ['Spot Kick Starter', 'football_penalties'], ['Free Kick Fun', 'football_free_kick'],
  ['Little Keeper', 'football_keeper'], ['Park Kickabout', 'football_skills'], ['Street Kickabout', 'football_street'],
  ['Arcade Warm-Up', 'football_arcade'], ['Friendly Team Match', 'football_fifa'], ['Mini Championship', 'football_championship'],
  ['Junior Cup Final', 'football_cup_final'],
  ['Shooting Drills', 'football_training'], ['Penalty Pressure', 'football_penalties'], ['Curling Free Kicks', 'football_free_kick'],
  ['Keeper Reflexes', 'football_keeper'], ['One-on-One Duel', 'football_skills'], ['Street Skills', 'football_street'],
  ['Arcade Rush Hour', 'football_arcade'], ['League Match', 'football_fifa'], ['Championship Round', 'football_championship'],
  ['County Cup Final', 'football_cup_final'],
  ['Sharpshooter Drills', 'football_training'], ['Sudden Death Penalties', 'football_penalties'], ['Top Corner Free Kicks', 'football_free_kick'],
  ['Keeper Under Fire', 'football_keeper'], ['Skills Showdown', 'football_skills'], ['Street Legends', 'football_street'],
  ['Arcade Blitz', 'football_arcade'], ['Derby Day', 'football_fifa'], ['Championship Semi-Final', 'football_championship'],
  ['National Cup Final', 'football_cup_final'],
  ['Pro Training Camp', 'football_training'], ['Penalty Masters', 'football_penalties'], ['Free Kick Legend', 'football_free_kick'],
  ['Wall of Steel Keeper', 'football_keeper'], ['Ultimate 1v1', 'football_skills'], ['Street World Tour', 'football_street'],
  ['Arcade Golden Goal', 'football_arcade'], ['Title Decider', 'football_fifa'], ['Championship Final', 'football_championship'],
  ['Robot World Cup Final', 'football_cup_final'],
];
const FOOT_TIER = [
  { ai: 'easy', goals: [1, 2], time: 150 },
  { ai: 'medium', goals: [2, 3], time: 120 },
  { ai: 'hard', goals: [3, 4], time: 105 },
  { ai: 'hard', goals: [4, 5], time: 90 },
];
const DRILLS = new Set(['football_training', 'football_penalties', 'football_free_kick', 'football_keeper']);

function buildFootball() {
  return FOOTBALL.map(([name, course], i) => {
    const t = Math.floor(i / 10); const slot = i % 10; const tier = FOOT_TIER[t];
    const goals = tier.goals[slot < 5 ? 0 : 1] + (DRILLS.has(course) ? 1 : 0);
    const keeper = course === 'football_keeper';
    const verb = keeper ? `Save ${goals} shots` : `Score ${goals} ${goals === 1 ? 'goal' : 'goals'}`;
    const rival = DRILLS.has(course) ? '' : ` against ${tier.ai === 'easy' ? 'a relaxed' : tier.ai === 'medium' ? 'a quick' : 'a sharp'} rival team`;
    return {
      mode: 11 + i, name, tier: TIERS[t], course, aiDifficulty: tier.ai, goalsToWin: goals, missionTarget: goals,
      timeLimit: tier.time - (slot >= 5 ? 10 : 0),
      goal: `${verb}${rival} within ${Math.floor((tier.time - (slot >= 5 ? 10 : 0)) / 60)}:${String((tier.time - (slot >= 5 ? 10 : 0)) % 60).padStart(2, '0')}.`,
    };
  });
}

/* ─── Boxing ───────────────────────────────────────────────────────────── */
const BOXING = [
  ['Pad Work Warm-Up', 'fight_training'], ['First Spar', 'fight_sparring'], ['Speed Bag Rhythm', 'fight_speed_rumble'],
  ['Guard Practice', 'fight_iron_wall'], ['Footwork Friendly', 'fight_sparring'], ['Combo Starter', 'fight_strategies'],
  ['Rookie Round', 'fight_championship'], ['Gym Challenge', 'fight_tournament'], ['Steady Stamina', 'fight_sparring'],
  ['Rookie Title', 'fight_final_gauntlet'],
  ['Jab and Move', 'fight_sparring'], ['Counter Punch Class', 'fight_strategies'], ['Fast Hands', 'fight_speed_rumble'],
  ['Tank Buster', 'fight_iron_wall'], ['Club Contender', 'fight_championship'], ['Ninja Footwork', 'fight_sparring'],
  ['Three-Round Bout', 'fight_tournament'], ['Big Bot Challenge', 'fight_championship'], ['Stamina Test', 'fight_tournament'],
  ['Club Title', 'fight_final_gauntlet'],
  ['Smart Defence', 'fight_strategies'], ['Speed Duel', 'fight_speed_rumble'], ['Iron Guard Breaker', 'fight_iron_wall'],
  ['Regional Contender', 'fight_championship'], ['Blaster Bout', 'fight_sparring'], ['Five-Round Tournament', 'fight_tournament'],
  ['Heavyweight Challenge', 'fight_boss'], ['Endurance Rounds', 'fight_survival'], ['Power Bot Bout', 'fight_sparring'],
  ['Regional Title', 'fight_final_gauntlet'],
  ['Master Tactics', 'fight_strategies'], ['Lightning Hands', 'fight_speed_rumble'], ['Fortress Breaker', 'fight_iron_wall'],
  ['National Contender', 'fight_championship'], ['Champion Sparring', 'fight_sparring'], ['Grand Tournament', 'fight_tournament'],
  ['Giant Slayer', 'fight_boss'], ['Last Bot Standing', 'fight_survival'], ['Rematch of Champions', 'fight_sparring'],
  ['World Boxing Final', 'fight_final_gauntlet'],
];
const BOX_TIER = [
  { ai: 'easy', foes: ['striker'], enemyHp: 80, playerHp: 120, time: 180 },
  { ai: 'medium', foes: ['striker', 'tank', 'ninja'], enemyHp: 100, playerHp: 110, time: 150 },
  { ai: 'hard', foes: ['tank', 'ninja', 'blaster'], enemyHp: 130, playerHp: 100, time: 130 },
  { ai: 'hard', foes: ['blaster', 'berserker', 'ninja'], enemyHp: 160, playerHp: 90, time: 110 },
];
const FOE = { striker: 'a Striker', tank: 'a Tank', ninja: 'a Ninja', blaster: 'a Blaster', berserker: 'a Power Bot' };

function buildBoxing() {
  return BOXING.map(([name, course], i) => {
    const t = Math.floor(i / 10); const slot = i % 10; const tier = BOX_TIER[t];
    const enemyType = course === 'fight_training' ? 'dummy' : tier.foes[slot % tier.foes.length];
    const enemyHp = tier.enemyHp + (slot >= 5 ? 10 : 0);
    const goal = enemyType === 'dummy'
      ? 'Land 5 punches on the training pads and practise your guard.'
      : `Beat ${FOE[enemyType]} (${enemyHp} health) before ${Math.floor(tier.time / 60)}:${String(tier.time % 60).padStart(2, '0')} is up.`;
    return {
      mode: 11 + i, name, tier: TIERS[t], course, fightMode: FIGHT_MODE[course] || 'sparring', aiDifficulty: tier.ai, enemyType,
      enemyHp: enemyType === 'dummy' ? 999 : enemyHp, playerHp: tier.playerHp, timeLimit: tier.time, goal,
    };
  });
}

/* ─── Flappy Bird ──────────────────────────────────────────────────────── */
// [name, look (one of the ten original flappy worlds, 0–9)]
const FLAPPY = [
  ['Nest Hop', 6], ['First Flight', 0], ['Sunny Pipes', 1], ['Breezy Skies', 2], ['Berry Run', 3],
  ['Puffy Clouds', 4], ['Purple Dusk', 5], ['Balloon Meadow', 7], ['Stone Tower', 8], ['Golden Morning', 9],
  ['Treetop Dash', 6], ['Pipe Parade', 0], ['Sunset Slalom', 1], ['Blue Sky Sprint', 2], ['Egg Hunt Flight', 3],
  ['Gusty Afternoon', 4], ['Twilight Pipes', 5], ['Balloon Festival', 7], ['Castle Walls', 8], ['Golden Run', 9],
  ['Forest Squeeze', 6], ['Pipe Maze', 0], ['Desert Heat', 1], ['High Wind', 2], ['Golden Egg Rescue', 3],
  ['Storm Clouds', 4], ['Night Flight', 5], ['Balloon Storm', 7], ['Fortress Gauntlet', 8], ['Golden Gauntlet', 9],
  ['Deep Forest Dash', 6], ['Pipe Master', 0], ['Sandstorm', 1], ['Hurricane Skies', 2], ['Treasure Flight', 3],
  ['Thunder Run', 4], ['Midnight Master', 5], ['Balloon Blitz', 7], ['Fortress Finale', 8], ['Flappy Bird Legend', 9],
];
const FLAP_TIER = [
  { t: [0, 0.25], target: [5, 10] },
  { t: [0.3, 0.55], target: [10, 15] },
  { t: [0.6, 0.85], target: [15, 22] },
  { t: [0.9, 1.15], target: [22, 30] },
];

function buildFlappy() {
  return FLAPPY.map(([name, look], i) => {
    const tIdx = Math.floor(i / 10); const slot = i % 10; const tier = FLAP_TIER[tIdx];
    const k = slot / 9;
    const t = Math.round((tier.t[0] + (tier.t[1] - tier.t[0]) * k) * 100) / 100;
    const target = Math.round(tier.target[0] + (tier.target[1] - tier.target[0]) * k);
    // Same formula as the original ten (FlappyBirdArena getModeDifficulty), continued past mode 10
    const r = (n) => Math.round(n * 100) / 100;
    return {
      mode: 11 + i, name, tier: TIERS[tIdx], look, target,
      difficulty: {
        speedScale: r(0.94 + t * 0.34), pipeSpacing: r(12 - t * 2.25), gapMin: r(3.8 - t * 0.6),
        gapMax: r(5.9 - t * 1.25), gapStart: r(5.25 - t * 1.35), verticalDrift: r(1.55 + t * 0.8),
      },
      goal: `Flap through ${target} pipes without crashing.`,
    };
  });
}

export function buildSports() {
  const football = buildFootball(); const boxing = buildBoxing(); const flappy = buildFlappy();
  const size = writeData('sports-tiers.js', 'Football, Boxing and Flappy Bird modes 11–50: the original games with harder settings each tier.', {
    FOOTBALL_TIER_LEVELS: football, BOXING_TIER_LEVELS: boxing, FLAPPY_TIER_LEVELS: flappy,
  });
  return {
    report: [
      ...football.filter((_, i) => i % 5 === 0).map((l) => `F ${l.mode} ${l.tier} ${l.name}: ${l.goal}`),
      ...boxing.filter((_, i) => i % 5 === 0).map((l) => `B ${l.mode} ${l.tier} ${l.name}: ${l.goal}`),
      ...flappy.filter((_, i) => i % 5 === 0).map((l) => `P ${l.mode} ${l.tier} ${l.name}: ${l.goal} gap ${l.difficulty.gapMin}-${l.difficulty.gapMax} speed ${l.difficulty.speedScale}`),
    ],
    size,
  };
}

if (process.argv[1]?.endsWith('build-sports.mjs')) {
  const { report, size } = buildSports();
  console.log(report.join('\n'), '\nbytes', size);
}
