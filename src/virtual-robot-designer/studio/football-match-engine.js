/**
 * Football match engine — FIFA-style team matches with AI teammates & opponents.
 */
import {
  createBallState, applyKickToBall, tickBallPhysics, distanceToBall, directionTo, BALL_CONFIG,
} from './football-physics.js';
import { calculateKickForce, getFootballStats } from '../data/football-robot-types.js';
import { computeKickRigPose, applyKickPoseToRig } from './kick-rig-animation.js';
import { DRILL_STYLES, resolveFootballModeProfile, pitchBoundsFromProfile } from './football/FootballModeConfig.js';

export const PITCH_HALF_X = 20;
export const PITCH_HALF_Z = 12.5;
export const PLAYER_START_X = -8;
export const ENEMY_START_X = 8;
export const GOAL_Z = 12.5;
export const GOAL_WIDTH = 4.2;
export const POSSESSION_RADIUS = 0.42;
export const SHOOT_RANGE = 7.2;
export const DRIBBLE_RANGE = 0.45;
const CODE_SPEED = 6.6;
const DRIBBLE_SPEED = 4.8;
const GUARD_SPEED = 5.4;
const MOVE_INTENTS = new Set([
  'chase_ball', 'face_ball', 'move_to_position', 'dribble',
  'guard_goal', 'dive_save', 'catch_ball', 'user_drive',
]);

const FORMATIONS = {
  '1v1': {
    player: [[-6, 0, 'striker']],
    enemy: [[6, 0, 'striker']],
  },
  '3v3': {
    // Pitch length is Z (goals at ±12.5). Green attacks +Z.
    player: [[0, -7.8, 'defender'], [0.8, -2.2, 'striker'], [-4.8, -4.2, 'midfielder']],
    enemy: [[0, 7.8, 'defender'], [-0.8, 2.2, 'striker'], [4.8, 4.2, 'midfielder']],
    kickoff: {
      player: [[0, -0.35, 'striker'], [-5.2, -5.8, 'midfielder'], [0, -7.2, 'defender']],
      enemy: [[0, 6.8, 'defender'], [-4.5, 5.2, 'midfielder'], [4.5, 5.2, 'striker']],
    },
  },
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function lerpAngle(current, target, t) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * t;
}

function makeBot(id, team, x, z, role, isPlayer = false, extra = {}) {
  return {
    id, team, role, isPlayer,
    x, z,
    anchorX: x,
    anchorZ: z,
    facing: extra.facing != null ? extra.facing : (team === 'player' ? 0 : Math.PI),
    moveSpeed: 0,
    visualX: x,
    visualZ: z,
    visualFacing: extra.facing != null ? extra.facing : (team === 'player' ? 0 : Math.PI),
    action: null,
    actionTimer: 0,
    canAct: true,
    mesh: null,
    lastX: x,
    lastZ: z,
    frozen: !!extra.frozen,
    isKeeper: !!extra.isKeeper,
    isShooter: !!extra.isShooter,
    intent: null,
  };
}

export function resolveFootballLayout(challenge = {}) {
  const profile = resolveFootballModeProfile(challenge);
  const bounds = pitchBoundsFromProfile(profile);
  const teamSize = Number(challenge.teamSize) || profile.teamSize || 1;
  const kind = profile.kind;
  const goalZ = bounds.goalZ;

  const layout = {
    ...profile,
    teamSize: kind === 'fifa' ? 3 : teamSize,
    drill: profile.drill || profile.drillStyle !== DRILL_STYLES.FULL_MATCH,
    pitchHalfX: bounds.halfX,
    pitchHalfZ: bounds.halfZ,
    goalZ,
    pitchScale: bounds.scale,
  };

  if (kind === 'penalty') {
    const ballZ = goalZ - 4.2;
    layout.ball = { x: 0, z: ballZ };
    layout.player = { x: 0, z: ballZ - 2.1, role: 'striker' };
    layout.keeper = { x: 0, z: goalZ - 0.55, role: 'defender' };
    return layout;
  }
  if (kind === 'freekick') {
    const ballZ = goalZ - 8.5;
    layout.ball = { x: -2.4, z: ballZ };
    layout.player = { x: -2.4, z: ballZ - 2.0, role: 'striker' };
    layout.keeper = { x: 0, z: goalZ - 0.55, role: 'defender' };
    layout.wall = [[-1.4, goalZ - 6.4], [0, goalZ - 6.4], [1.4, goalZ - 6.4]];
    return layout;
  }
  if (kind === 'keeper') {
    layout.ball = { x: 0, z: -2 };
    layout.player = { x: 0, z: -goalZ + 0.7, role: 'defender' };
    layout.shooter = { x: 0, z: 3.5, role: 'striker' };
    return layout;
  }
  if (kind === 'training') {
    layout.ball = { x: 0, z: 0 };
    layout.player = { x: -bounds.halfX * 0.32, z: 0, role: 'striker' };
    return layout;
  }
  if (kind === 'fifa') {
    layout.ball = { x: 0, z: 0 };
    layout.player = { x: 0, z: -0.35, role: 'striker' };
    return layout;
  }
  if (kind === 'street') {
    layout.ball = { x: 0, z: 0 };
    layout.player = { x: -bounds.halfX * 0.35, z: 0, role: 'striker' };
    return layout;
  }
  if (kind === 'arcade') {
    layout.ball = { x: 0, z: 0 };
    layout.player = { x: -bounds.halfX * 0.38, z: 0, role: 'striker' };
    return layout;
  }
  // 1v1 skills / championship
  layout.ball = { x: 0, z: 0 };
  layout.player = { x: -bounds.halfX * 0.32, z: 0, role: 'striker' };
  return layout;
}

function resolveTeamSize(challenge) {
  return resolveFootballLayout(challenge).teamSize;
}

export function createFootballEngine({
  challenge = {},
  playerConfig = {},
  onMatchEvent = null,
}) {
  const stats = getFootballStats(playerConfig);
  const layout = resolveFootballLayout(challenge);
  const goalsToWin = challenge.goalsToWin ?? 3;
  const timeLimit = challenge.timeLimit ?? 90;
  const difficulty = challenge.aiDifficulty || 'medium';
  const drillStyle = layout.drillStyle || DRILL_STYLES.FULL_MATCH;
  const isDrill = drillStyle !== DRILL_STYLES.FULL_MATCH;
  const isTraining = isDrill;
  const teamSize = layout.teamSize;
  const pitchHalfX = layout.pitchHalfX ?? PITCH_HALF_X;
  const pitchHalfZ = layout.pitchHalfZ ?? PITCH_HALF_Z;
  const goalZ = layout.goalZ ?? GOAL_Z;
  const ballSpeedMult = layout.ballSpeedMult ?? 1;
  const aiProfileMult = layout.aiSpeedMult ?? 1;
  const formationKey = teamSize >= 3 ? '3v3' : '1v1';
  const formation = FORMATIONS[formationKey];
  const pitchBounds = () => ({
    halfX: pitchHalfX,
    halfZ: pitchHalfZ,
    goalWidth: GOAL_WIDTH,
    netDepth: 1.6,
  });

  const bots = [];
  const isTeamMatch = layout.kind === 'fifa';
  const isScaledDuel = ['1v1', 'street', 'arcade'].includes(layout.kind);
  if (isTeamMatch) {
    formation.player.forEach(([x, z, role], i) => {
      bots.push(makeBot(`p${i}`, 'player', x, z, role, i === 1));
    });
    formation.enemy.forEach(([x, z, role], i) => {
      bots.push(makeBot(`e${i}`, 'enemy', x, z, role, false));
    });
  } else if (isScaledDuel) {
    const spawnX = pitchHalfX * 0.32;
    bots.push(makeBot('p0', 'player', -spawnX, 0, 'striker', true));
    bots.push(makeBot('e0', 'enemy', spawnX, 0, 'striker', false));
  } else {
    const p = layout.player || { x: PLAYER_START_X, z: 0, role: 'striker' };
    bots.push(makeBot('p0', 'player', p.x, p.z, p.role || 'striker', true));
    if (layout.keeper) {
      bots.push(makeBot('e0', 'enemy', layout.keeper.x, layout.keeper.z, 'defender', false, { isKeeper: true }));
    }
    if (layout.shooter) {
      bots.push(makeBot('e1', 'enemy', layout.shooter.x, layout.shooter.z, 'striker', false, { isShooter: true }));
    }
    (layout.wall || []).forEach(([x, z], i) => {
      bots.push(makeBot(`w${i}`, 'enemy', x, z, 'wall', false, { frozen: true }));
    });
  }

  const playerBot = bots.find((b) => b.isPlayer) || bots[0];
  let actionDt = 1 / 60;

  function resolvePlayerBot(botId) {
    if (botId) {
      const hit = bots.find((b) => b.id === botId && b.team === 'player');
      if (hit) return hit;
    }
    return playerBot;
  }

  function goalThreat(bot) {
    const attackGoalZ = bot.team === 'player' ? goalZ : -goalZ;
    const dz = Math.abs(attackGoalZ - bot.z);
    const dx = Math.abs(bot.x);
    return {
      dz,
      dx,
      dist: Math.hypot(dx * 0.42, dz),
      inBox: dz < SHOOT_RANGE && dx < GOAL_WIDTH * 0.95,
    };
  }

  function buildBotSensors(bot) {
    if (!bot) return {};
    const ballD = botDistToBall(bot);
    const threat = goalThreat(bot);
    return {
      playerX: bot.x,
      playerZ: bot.z,
      playerFacing: bot.facing,
      ballX: ball.x,
      ballZ: ball.z,
      ballY: ball.y,
      ballDist: ballD,
      goalDist: threat.dist,
      haveBall: botHasBall(bot),
      ballClose: ballD < 3,
      ballFar: ballD > 6,
      shootingRange: botHasBall(bot) && threat.inBox,
      role: bot.role,
      botId: bot.id,
    };
  }

  const state = {
    over: false,
    won: false,
    playerGoals: 0,
    enemyGoals: 0,
    goalsToWin,
    timeLeft: timeLimit,
    matchTime: 0,
    possession: null,
    possessionBotId: null,
    feedback: null,
    feedbackTimer: 0,
    passes: 0,
    shots: 0,
    missionProgress: 0,
    celebrating: false,
    celebrateTimer: 0,
    kickoffDone: isDrill,
    kickoffTimer: isDrill ? 0 : (layout.kind === 'fifa' && teamSize >= 3 ? 0.35 : 1.4),
    kickoffBanner: !isDrill,
    goalFlash: 0,
    lastActBotId: null,
    ballOut: false,
    lastScorer: '',
    pendingReset: 0,
    pendingWin: null,
    actionHint: null,
    drillStyle,
    awaitingKick: drillStyle === DRILL_STYLES.TURN_KICK,
    kickInFlight: false,
    drillAttempt: 0,
    saves: 0,
    shotsFaced: 0,
    drillHint: null,
    teamSize,
    matchLabel: layout.label,
    layoutKind: layout.kind,
    kickoffPassTimer: 0,
    kickoffTeam: 'player',
    lastScoredTeam: null,
    codedActionLabel: '',
    codedActionTimer: 0,
    userDriving: false,
    userInput: { dx: 0, dz: 0, shoot: false, pass: false, sprint: false },
    playerStamina: 1,
  };

  const ball = createBallState(layout.ball?.x ?? 0, layout.ball?.z ?? 0);
  let kickFrame = 0;
  let kickType = null;
  let kickSide = 'right';
  let kickingBot = null;

  const ai = {
    reactionDelay: difficulty === 'hard' ? 0.12 : difficulty === 'easy' ? 0.5 : 0.28,
    actionCooldown: 0,
    warmupTimer: drillStyle === DRILL_STYLES.KEEPER_WAVES ? 0.8
      : layout.kind === 'fifa' ? 0.12
        : difficulty === 'hard' ? 0.8 : difficulty === 'easy' ? 1.2 : 0.5,
    shooterTimer: drillStyle === DRILL_STYLES.KEEPER_WAVES ? 2.8 : 0,
    greenKickCd: {},
  };

  function emit(type, data = {}) {
    onMatchEvent?.({ type, ...data });
  }

  function setFeedback(text, type = 'info') {
    state.feedback = { text, type };
    state.feedbackTimer = 2.5;
  }

  function botDistToBall(bot) {
    return distanceToBall(bot.x, bot.z, ball);
  }

  function nearestBotToBall(team = null) {
    let best = null;
    let bestD = Infinity;
    for (const b of bots) {
      if (team && b.team !== team) continue;
      if (b.frozen) continue;
      const d = botDistToBall(b);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  function ballRankOnTeam(bot) {
    return bots
      .filter((b) => b.team === bot.team && !b.frozen)
      .sort((a, b) => botDistToBall(a) - botDistToBall(b))
      .findIndex((b) => b.id === bot.id);
  }

  function mateInPassCone(bot, mate) {
    if (!mate) return false;
    const dx = mate.x - bot.x;
    const dz = mate.z - bot.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.4 || dist > 13) return false;
    const fwdX = Math.sin(bot.facing);
    const fwdZ = Math.cos(bot.facing);
    return ((fwdX * dx + fwdZ * dz) / dist) > 0.18;
  }

  function preferredPassMate(bot) {
    const mates = bots.filter((b) => b.team === bot.team && b.id !== bot.id);
    if (!mates.length) return null;
    const userStriker = mates.find((b) => b.isPlayer);
    if (userStriker && mateInPassCone(bot, userStriker)) return userStriker;
    if (bot.role === 'midfielder') {
      const striker = mates.find((b) => b.role === 'striker');
      if (mateInPassCone(bot, striker)) return striker;
    }
    if (bot.role === 'defender') {
      const mid = mates.find((b) => b.role === 'midfielder');
      if (mid) return mid;
    }
    return nearestTeammateInCone(bot) || mates[0];
  }

  function nearestTeammateInCone(bot) {
    const fwdX = Math.sin(bot.facing);
    const fwdZ = Math.cos(bot.facing);
    let best = null;
    let bestScore = Infinity;
    for (const b of bots) {
      if (b.team !== bot.team || b.id === bot.id) continue;
      const dx = b.x - bot.x;
      const dz = b.z - bot.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 1.4) continue;
      const dot = (fwdX * dx + fwdZ * dz) / dist;
      const forwardBias = bot.team === 'player' ? (b.z > bot.z ? 0.85 : 1.25) : (b.z < bot.z ? 0.85 : 1.25);
      const score = dist * (dot > 0.12 ? 1 : 2.4) * forwardBias;
      if (score < bestScore) {
        bestScore = score;
        best = b;
      }
    }
    return best;
  }

  function resolveBallCarrier() {
    let best = null;
    let bestD = POSSESSION_RADIUS + 0.35;
    for (const b of bots) {
      if (b.frozen) continue;
      const d = botDistToBall(b);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    if (!best) return null;
    const contenders = bots.filter((b) => !b.frozen && botDistToBall(b) < POSSESSION_RADIUS + 0.2);
    if (contenders.length <= 1) return best;
    const last = contenders.find((b) => b.id === ball.lastTouch);
    if (last && botDistToBall(last) < POSSESSION_RADIUS + 0.12) return last;
    const presser = teamPressLeader(best.team);
    if (presser && contenders.some((b) => b.id === presser.id)) return presser;
    return contenders.reduce((a, b) => (botDistToBall(b) < botDistToBall(a) ? b : a));
  }

  function botHasBall(bot) {
    const carrier = resolveBallCarrier();
    return carrier?.id === bot.id;
  }

  function moveBot(bot, tx, tz, speed, dt) {
    const dx = tx - bot.x;
    const dz = tz - bot.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.08) {
      bot.moveSpeed *= Math.max(0, 1 - dt * 6);
      return;
    }
    bot.moveSpeed += (speed - bot.moveSpeed) * Math.min(1, dt * 4.8);
    const step = bot.moveSpeed * dt;
    bot.x += (dx / dist) * Math.min(step, dist);
    bot.z += (dz / dist) * Math.min(step, dist);
    for (const other of bots) {
      if (other.id === bot.id) continue;
      const ox = bot.x - other.x;
      const oz = bot.z - other.z;
      const od = Math.hypot(ox, oz);
      if (od > 0.01 && od < 1.15) {
        const push = (1.15 - od) * 0.28;
        bot.x += (ox / od) * push;
        bot.z += (oz / od) * push;
      }
    }
    bot.x = clamp(bot.x, -pitchHalfX + 0.8, pitchHalfX - 0.8);
    bot.z = clamp(bot.z, -pitchHalfZ + 0.8, pitchHalfZ - 0.8);
    bot.facing = lerpAngle(bot.facing, Math.atan2(dx, dz), Math.min(1, dt * 8.5));
  }

  function scorerLabel() {
    const b = bots.find((x) => x.id === ball.lastTouch);
    return botLabel(b);
  }

  function botLabel(b) {
    const nums = (team) => (team === 'player'
      ? { defender: 4, striker: 9, midfielder: 8, goalkeeper: 1 }
      : { defender: 5, striker: 7, midfielder: 6, goalkeeper: 1 });
    const tags = { defender: 'DEFENDER', striker: 'STRIKER', midfielder: 'MIDFIELDER', goalkeeper: 'KEEPER' };
    if (!b) return '#9 STRIKER';
    return `#${nums(b.team)[b.role] || 9} ${tags[b.role] || 'PLAYER'}`;
  }

  function checkGoal() {
    if (state.pendingReset > 0) return false;
    const inGoalMouth = Math.abs(ball.x) < GOAL_WIDTH / 2;
    if (ball.z >= goalZ && inGoalMouth && ball.y < 2.8) {
      state.playerGoals += 1;
      state.missionProgress = state.playerGoals;
      state.kickInFlight = false;
      if (drillStyle === DRILL_STYLES.GOLDEN_GOAL) {
        setFeedback('GOLDEN GOAL! ⚡', 'goal');
      } else if (drillStyle === DRILL_STYLES.SOLO_SHOOT) {
        setFeedback(`Nice shot! ${state.playerGoals}/${goalsToWin}`, 'goal');
      } else {
        setFeedback('GOAL! ⚽ Your team scores!', 'goal');
      }
      state.celebrating = true;
      state.celebrateTimer = 1.8;
      state.goalFlash = 2.0;
      state.lastScorer = scorerLabel();
      state.lastScoredTeam = 'player';
      state.pendingReset = 2.0;
      emit('goal_scored', { scorer: 'player', x: ball.x, z: ball.z, label: state.lastScorer });
      ball.vx = 0; ball.vz = 0; ball.vy = 0;
      if (state.playerGoals >= goalsToWin) state.pendingWin = true;
      return true;
    }
    if (ball.z <= -goalZ && inGoalMouth && ball.y < 2.8) {
      state.enemyGoals += 1;
      if (drillStyle === DRILL_STYLES.KEEPER_WAVES) {
        setFeedback('They scored! Clean sheet lost.', 'lose');
        state.goalFlash = 2.0;
        ball.vx = 0; ball.vz = 0; ball.vy = 0;
        endMatch(false);
        return true;
      }
      setFeedback('Opponent scores! 😞', 'concede');
      state.goalFlash = 2.0;
      state.lastScorer = scorerLabel();
      state.lastScoredTeam = 'enemy';
      state.pendingReset = 2.0;
      emit('goal_conceded', { x: ball.x, z: ball.z, label: state.lastScorer });
      ball.vx = 0; ball.vz = 0; ball.vy = 0;
      if (!isTraining && state.enemyGoals >= goalsToWin) state.pendingWin = false;
      return true;
    }
    return false;
  }

  function resetBall(scoringTeam = null) {
    ball.vx = ball.vy = ball.vz = 0;
    ball.grounded = true;
    ball.lastTouch = null;
    ball.kickCooldown = 0.35;
    state.possession = null;
    state.possessionBotId = null;
    state.kickoffPassTimer = 0;

    const isFifaLive = layout.kind === 'fifa' && teamSize >= 3 && !isTraining;

    if (isFifaLive && state.kickoffDone && scoringTeam) {
      state.kickoffDone = true;
      state.kickoffTimer = 0;
      const kickTeam = scoringTeam === 'player' ? 'enemy' : 'player';
      state.kickoffTeam = kickTeam;
      const kicker = bots.find((b) => b.team === kickTeam && b.role === 'striker')
        || bots.find((b) => b.team === kickTeam);
      for (const b of bots) {
        b.x = b.anchorX;
        b.z = b.anchorZ;
        b.visualX = b.anchorX;
        b.visualZ = b.anchorZ;
        b.moveSpeed = 0;
        b.intent = null;
        b.facing = b.team === 'player' ? 0 : Math.PI;
        b.visualFacing = b.facing;
      }
      if (kicker) {
        ball.x = kicker.x;
        ball.z = kicker.z + (kickTeam === 'player' ? 0.2 : -0.2);
        kicker.facing = kickTeam === 'player' ? 0 : Math.PI;
      } else {
        ball.x = 0;
        ball.z = kickTeam === 'player' ? -0.3 : 0.3;
      }
      ball.y = BALL_CONFIG.groundY;
      state.kickoffPassTimer = 0.55;
      return;
    }

    ball.x = layout.ball?.x ?? 0;
    ball.z = layout.ball?.z ?? 0;
    ball.y = BALL_CONFIG.groundY;
    state.kickoffDone = isDrill;
    state.kickoffTimer = isDrill ? 0 : 1.4;
    state.kickoffTeam = 'player';
    const kickoff = formation.kickoff;
    if (kickoff && teamSize >= 3 && !isTraining) {
      const placeKickoff = (spots, team) => {
        spots.forEach(([x, z, role], i) => {
          const bot = bots.find((b) => b.team === team && b.role === role)
            || bots.find((b) => b.team === team && !b.isPlayer && b.id === `${team === 'player' ? 'p' : 'e'}${i}`);
          if (!bot) return;
          bot.x = x;
          bot.z = z;
          bot.visualX = x;
          bot.visualZ = z;
          bot.moveSpeed = 0;
          bot.intent = null;
          bot.facing = team === 'player' ? 0 : Math.PI;
          bot.visualFacing = bot.facing;
        });
      };
      placeKickoff(kickoff.player, 'player');
      placeKickoff(kickoff.enemy, 'enemy');
    } else {
      for (const b of bots) {
        b.x = b.anchorX;
        b.z = b.anchorZ;
        b.visualX = b.anchorX;
        b.visualZ = b.anchorZ;
        b.moveSpeed = 0;
        b.intent = null;
      }
    }
    if (drillStyle === DRILL_STYLES.TURN_KICK) {
      state.awaitingKick = true;
      state.kickInFlight = false;
      state.drillHint = layout.kind === 'freekick'
        ? `Free kick ${state.playerGoals + 1}/${goalsToWin} — Shoot or Lob!`
        : `Penalty ${state.playerGoals + 1}/${goalsToWin} — Shoot!`;
    } else if (drillStyle === DRILL_STYLES.KEEPER_WAVES) {
      ai.shooterTimer = 2.6;
      state.drillHint = `Block ${goalsToWin} shots — Dive save!`;
    } else if (drillStyle === DRILL_STYLES.SOLO_SHOOT) {
      state.drillHint = `Training: score ${goalsToWin} goals`;
    } else if (drillStyle === DRILL_STYLES.GOLDEN_GOAL) {
      state.drillHint = 'First goal wins — 60 second rush!';
    }
  }

  function tickTurnKickDrill(dt) {
    if (drillStyle !== DRILL_STYLES.TURN_KICK || state.pendingReset > 0) return;
    if (state.awaitingKick) {
      ball.x = layout.ball?.x ?? 0;
      ball.z = layout.ball?.z ?? 0;
      ball.y = BALL_CONFIG.groundY;
      ball.vx = ball.vy = ball.vz = 0;
      return;
    }
    if (!state.kickInFlight) return;
    const speed = Math.hypot(ball.vx, ball.vz);
    const missed = (ball.z > goalZ + 0.45 && state.goalFlash <= 0)
      || (speed < 0.09 && ball.grounded && ball.z < goalZ - 1.2)
      || (Math.abs(ball.x) > GOAL_WIDTH * 0.82 && ball.z > goalZ - 2.5);
    if (missed && state.pendingReset <= 0) {
      state.kickInFlight = false;
      state.drillAttempt += 1;
      setFeedback('Missed! Keeper saves it.', 'concede');
      state.pendingReset = 1.5;
    }
  }

  function tickKeeperWaves(dt) {
    if (drillStyle !== DRILL_STYLES.KEEPER_WAVES || state.pendingReset > 0 || state.over) return;
    ai.shooterTimer -= dt;
    if (ai.shooterTimer > 0) return;
    const shooter = bots.find((b) => b.isShooter);
    const keeper = bots.find((b) => b.isPlayer);
    if (!shooter) return;
    const shotX = layout.shooter?.x ?? shooter.anchorX ?? 0;
    const shotZ = layout.shooter?.z ?? shooter.anchorZ ?? 6;
    ball.x = shotX;
    ball.z = shotZ;
    ball.y = BALL_CONFIG.groundY;
    ball.vx = 0;
    ball.vz = 0;
    ball.vy = 0;
    shooter.x = shotX;
    shooter.z = shotZ;
    moveBot(shooter, shotX, shotZ - 0.4, 5.2, dt);
    if (botDistToBall(shooter) < POSSESSION_RADIUS + 0.2) {
      doKick('shot', shooter);
    }
    if (keeper) {
      moveBot(keeper, clamp(ball.x * 0.85, -GOAL_WIDTH * 0.42, GOAL_WIDTH * 0.42), -goalZ + 1.1, 5.4, dt);
    }
    ai.shooterTimer = 2.2 + Math.random() * 0.9;
    state.shotsFaced += 1;
  }

  function endMatch(won) {
    state.over = true;
    state.won = won;
    emit('match_end', { won, playerGoals: state.playerGoals, enemyGoals: state.enemyGoals });
    setFeedback(won ? '🏆 YOUR TEAM WINS!' : 'Full time — opponent wins', won ? 'win' : 'lose');
  }

  function doKick(kickTypeId, bot, codedBoost = false) {
    const dist = botDistToBall(bot);
    const kickReach = drillStyle === DRILL_STYLES.TURN_KICK ? POSSESSION_RADIUS + 1.4 : POSSESSION_RADIUS + 0.18;
    if (dist > kickReach) return false;

    const contactTiming = bot.actionTimer > 0 ? 0.75 : 1;
    const force = calculateKickForce(kickTypeId, contactTiming, stats);
    force.power *= ballSpeedMult;
    if (codedBoost) force.power *= 1.14;
    const attackZ = bot.team === 'player' ? goalZ : -goalZ;
    let targetX = 0;
    let targetZ = attackZ;
    if (kickTypeId === 'passShort' || kickTypeId === 'passLong') {
      const mate = preferredPassMate(bot);
      if (mate) {
        const lead = Math.min(2.2, (mate.moveSpeed || 0) * 0.22);
        const fwdX = Math.sin(mate.facing || 0);
        const fwdZ = Math.cos(mate.facing || 0);
        targetX = mate.x + fwdX * lead;
        targetZ = mate.z + fwdZ * lead + (bot.team === 'player' ? 1.0 : -1.0);
      } else {
        targetX = bot.x;
        targetZ = bot.z + (bot.team === 'player' ? 6 : -6);
      }
    } else if (kickTypeId === 'clear') {
      const mate = preferredPassMate(bot);
      targetX = mate ? mate.x : 0;
      targetZ = mate ? mate.z : (bot.team === 'player' ? 4 : -4);
    }
    const dir = directionTo(bot.x, bot.z, targetX, targetZ);
    applyKickToBall(ball, force, dir);
    ball.lastTouch = bot.id;
    ball.kickCooldown = kickTypeId === 'shot' ? 0.42 : 0.28;
    state.possession = null;
    state.possessionBotId = null;
    kickType = kickTypeId;
    kickFrame = 0;
    kickSide = 'right';
    kickingBot = bot;

    if (bot.team === 'player' && drillStyle === DRILL_STYLES.TURN_KICK) {
      state.awaitingKick = false;
      state.kickInFlight = true;
      state.drillHint = null;
    }

    bot.canAct = false;
    bot.action = kickTypeId;
    bot.actionTimer = kickTypeId === 'shot' ? 0.32 : 0.22;

    if (kickTypeId === 'shot') {
      state.shots += 1;
    } else {
      if (bot.team === 'player') {
        state.passes += 1;
        setFeedback('PASS!', 'pass');
      }
    }
    emit('kick', {
      kickType: kickTypeId,
      x: bot.x,
      z: bot.z,
      targetX,
      targetZ,
      botId: bot.id,
      team: bot.team,
      heavy: kickTypeId === 'shot',
    });
    return true;
  }

  function roleHome(bot) {
    const attack = bot.team === 'player' ? 1 : -1;
    const bx = ball.x;
    const bz = ball.z;
    if (bot.role === 'defender') {
      return {
        x: clamp(bx * 0.32, -6.2, 6.2),
        z: clamp(-attack * 7.6 + bz * 0.16, attack > 0 ? -10.4 : -2.2, attack > 0 ? 2.2 : 10.4),
      };
    }
    if (bot.role === 'midfielder') {
      const side = bot.anchorX >= 0 ? 4.4 : -4.4;
      const shift = bot.team === 'player' ? 0.42 : -0.42;
      return {
        x: clamp(side + bx * 0.28, -8.5, 8.5),
        z: clamp(bz * 0.62 + shift, -7.5, 7.5),
      };
    }
    return {
      x: clamp(bx * 0.38, -5.4, 5.4),
      z: clamp(bz * 0.28 + attack * 5.4, -9.2, 9.2),
    };
  }

  function roleWantsChase(bot) {
    return shouldCodedChase(bot);
  }

  /** Per-role chase zones for coded + backup AI — each bot can chase in their lane, not nearest-only. */
  function shouldCodedChase(bot) {
    const ballD = botDistToBall(bot);
    if (bot.role === 'defender') {
      const ownHalf = bot.team === 'player' ? ball.z < 2.8 : ball.z > -2.8;
      return ownHalf && ballD < 8;
    }
    if (bot.role === 'midfielder') {
      const inLane = bot.team === 'player'
        ? ball.z > -9.5 && ball.z < 7.5
        : ball.z < 9.5 && ball.z > -7.5;
      const teammateHasBall = state.possessionBotId
        && bots.find((b) => b.id === state.possessionBotId && b.team === bot.team && b.id !== bot.id);
      return (inLane && ballD < 8) || (!teammateHasBall && ballD < 6.5);
    }
    if (bot.role === 'striker') {
      const attackHalf = bot.team === 'player' ? ball.z > -4.5 : ball.z < 4.5;
      const mateAhead = bots.some((b) => {
        if (b.team !== bot.team || b.id === bot.id) return false;
        return botDistToBall(b) < 3.2 && (bot.team === 'player' ? b.z > bot.z - 1.2 : b.z < bot.z + 1.2);
      });
      return ballD < 8.5 || attackHalf || mateAhead;
    }
    return ballD < 7;
  }

  function teamPressLeader(team) {
    const teamBots = bots.filter((b) => b.team === team && !b.frozen);
    const midfielder = teamBots.find((b) => b.role === 'midfielder');
    const striker = teamBots.find((b) => b.role === 'striker');
    const defender = teamBots.find((b) => b.role === 'defender');
    if (midfielder && roleWantsChase(midfielder)) return midfielder;
    if (striker && roleWantsChase(striker)) return striker;
    if (defender && roleWantsChase(defender)) return defender;
    return null;
  }

  function roleDefaultMove(bot, dt, speed = CODE_SPEED) {
    if (bot.role === 'defender') {
      applyMoveIntent(bot, 'guard_goal', {}, dt);
      return;
    }
    if (shouldCodedChase(bot) && botDistToBall(bot) < 8) {
      moveBot(bot, ball.x, ball.z, speed * (bot.role === 'striker' ? 1.04 : 0.96), dt);
      return;
    }
    const home = roleHome(bot);
    moveBot(bot, home.x, home.z, speed * 0.9, dt);
  }

  function runRoleBackupAI(bot, dt) {
    if (botHasBall(bot)) {
      if (bot.role === 'striker') applyMoveIntent(bot, 'dribble', {}, dt);
      else if (bot.role === 'midfielder' && bot.canAct) doKick('passShort', bot);
      else if (bot.role === 'defender' && bot.canAct) doKick('clear', bot);
      return;
    }
    if (bot.role === 'defender') {
      applyMoveIntent(bot, 'guard_goal', {}, dt);
      return;
    }
    if (bot.role === 'midfielder') {
      if (roleWantsChase(bot) && teamPressLeader(bot.team)?.id === bot.id) {
        moveBot(bot, ball.x, ball.z, CODE_SPEED * 0.95, dt);
      } else {
        const home = roleHome(bot);
        moveBot(bot, home.x, home.z, CODE_SPEED * 0.88, dt);
      }
      return;
    }
    moveBot(bot, ball.x, ball.z, CODE_SPEED, dt);
  }

  function aiTargetForBot(bot) {
    const ballD = botDistToBall(bot);
    const pressRank = ballRankOnTeam(bot);
    const ownHalf = bot.team === 'player' ? ball.z < 0.6 : ball.z > -0.6;
    const shouldPress = pressRank === 0 || (bot.team === 'enemy' && teamSize >= 3 && pressRank === 1);
    if (shouldPress) {
      if (bot.role === 'defender' && !ownHalf && ballD > 5.5) return roleHome(bot);
      if (pressRank === 1) {
        const side = bot.anchorX >= 0 ? 1 : -1;
        return { x: ball.x + side * 1.7, z: ball.z + (bot.team === 'player' ? -1.1 : 1.1) };
      }
      return { x: ball.x, z: ball.z };
    }
    return roleHome(bot);
  }

  function decideKick(bot) {
    const threat = goalThreat(bot);
    const goalDist = threat.dist;
    const inBox = threat.inBox;
    const mate = preferredPassMate(bot);
    const underPressure = bots.some((b) => {
      if (b.team === bot.team || b.frozen) return false;
      return Math.hypot(b.x - bot.x, b.z - bot.z) < 2.4;
    });

    if (inBox || goalDist < SHOOT_RANGE * 1.05) return doKick('shot', bot);
    if (bot.team === 'player' && threat.dz < SHOOT_RANGE * 1.2 && threat.dx < GOAL_WIDTH * 1.1) {
      return doKick('shot', bot);
    }
    if (bot.role === 'striker' && mate && mateInPassCone(bot, mate) && goalDist > 7 && underPressure && Math.random() < 0.38) {
      return doKick('passShort', bot);
    }
    if (mate && mateInPassCone(bot, mate) && bot.role === 'midfielder' && goalDist > 6 && Math.random() < 0.48) {
      return doKick('passShort', bot);
    }
    if (mate && mateInPassCone(bot, mate) && bot.role === 'defender' && goalDist > 8) return doKick('passLong', bot);
    if (underPressure && bot.role === 'defender') return doKick('clear', bot);
    if (mate && goalDist > 8 && bot.role === 'midfielder') return doKick('passLong', bot);
    bot.intent = { type: 'dribble', params: {} };
    return false;
  }

  function tickTeamAI(dt) {
    if (state.over) return;

    if (isTraining) {
      for (const bot of bots) {
        if (bot.isPlayer || bot.frozen || bot.actionTimer > 0) continue;
        if (bot.isKeeper) {
          moveBot(bot, clamp(ball.x * 0.9, -GOAL_WIDTH * 0.42, GOAL_WIDTH * 0.42), bot.anchorZ, 5.2, dt);
          continue;
        }
        if (bot.isShooter) {
          const ballD = botDistToBall(bot);
          if (ballD < POSSESSION_RADIUS && ai.actionCooldown <= 0) {
            doKick('shot', bot);
            ai.actionCooldown = 1.8;
          } else {
            moveBot(bot, ball.x, ball.z, 5.4, dt);
          }
        }
      }
      ai.actionCooldown = Math.max(0, ai.actionCooldown - dt);
      return;
    }

    const warmingUp = ai.warmupTimer > 0;
    if (warmingUp) ai.warmupTimer = Math.max(0, ai.warmupTimer - dt);

    const canKick = state.kickoffDone && !warmingUp;
    ai.actionCooldown = Math.max(0, ai.actionCooldown - dt);

    const speedMult = difficulty === 'hard' ? 1.12 : difficulty === 'easy' ? 0.82 : 1;
    const enemySpeedBoost = layout.kind === 'fifa' ? 0.9 : 1;
    const baseSpeed = 5.65 * speedMult * aiProfileMult * (warmingUp ? 0.75 : 1)
      * (layout.kind === 'fifa' ? 1.02 : 1);

    for (const bot of bots) {
      if (bot.isPlayer || bot.frozen) continue;
      if (bot.team === 'player') continue;
      if (bot.actionTimer > 0) continue;

      const ballD = botDistToBall(bot);
      const leader = teamPressLeader(bot.team);
      const isChaser = leader?.id === bot.id;
      const isPressing = isChaser;

      if (canKick && isChaser && ballD < POSSESSION_RADIUS + 0.15 && ai.actionCooldown <= 0) {
        decideKick(bot);
        ai.actionCooldown = 0.45 + ai.reactionDelay;
        continue;
      }

      const target = aiTargetForBot(bot);
      const speed = isPressing ? baseSpeed * enemySpeedBoost * 1.12 : baseSpeed * enemySpeedBoost * 0.86;
      moveBot(bot, target.x, target.z, speed, dt);
    }
  }

  function applyUserInput(dt) {
    const inp = state.userInput;
    if (!inp || !playerBot || state.over || !state.kickoffDone) return;
    const bot = playerBot;

    if (inp.shoot && bot.canAct) {
      state.userDriving = false;
      doAction('shoot', {}, bot.id);
      inp.shoot = false;
    }
    if (inp.pass && bot.canAct) {
      state.userDriving = false;
      doAction('short_pass', {}, bot.id);
      inp.pass = false;
    }

    const mag = Math.hypot(inp.dx || 0, inp.dz || 0);
    if (inp.sprint && mag > 0.08) {
      state.playerStamina = Math.max(0.06, state.playerStamina - 0.48 * dt);
    } else {
      state.playerStamina = Math.min(1, state.playerStamina + 0.32 * dt);
    }
    const canSprint = state.playerStamina > 0.14;
    if (mag > 0.08) {
      state.userDriving = true;
      bot.intent = {
        type: 'user_drive',
        params: {
          dx: inp.dx / mag,
          dz: inp.dz / mag,
          sprint: inp.sprint && canSprint,
        },
      };
    } else if (!inp.shoot && !inp.pass) {
      state.userDriving = false;
      if (bot.intent?.type === 'user_drive') bot.intent = null;
    }
  }

  function tickGreenTeamAI(dt, speedMult, warmingUp) {
    if (teamSize < 3 || isTraining || !state.kickoffDone || warmingUp) return;
    const baseSpeed = 5.65 * speedMult;
    const canKick = !warmingUp;

    for (const bot of bots) {
      if (bot.team !== 'player' || bot.frozen || bot.actionTimer > 0) continue;
      if (bot.isPlayer && state.userDriving) continue;
      const codedMove = bot.intent && MOVE_INTENTS.has(bot.intent.type);
      const kickCd = ai.greenKickCd[bot.id] || 0;
      if (kickCd > 0) ai.greenKickCd[bot.id] = kickCd - dt;

      if (codedMove) continue;
      if (botHasBall(bot) && canKick && bot.canAct && kickCd <= 0) {
        decideKick(bot);
        ai.greenKickCd[bot.id] = 0.38 + Math.random() * 0.25;
        continue;
      }

      roleDefaultMove(bot, dt, baseSpeed);
    }
  }

  function applyMoveIntent(bot, actionId, params, dt) {
    switch (actionId) {
      case 'chase_ball': {
        if (!shouldCodedChase(bot)) {
          roleDefaultMove(bot, dt);
          break;
        }
        moveBot(bot, ball.x, ball.z, CODE_SPEED, dt);
        break;
      }
      case 'face_ball': {
        const dir = directionTo(bot.x, bot.z, ball.x, ball.z);
        bot.facing = Math.atan2(dir.x, dir.z);
        break;
      }
      case 'move_to_position': {
        let tx = Number(params.x);
        let tz = Number(params.z);
        if (teamSize >= 3 && bot.role === 'midfielder') {
          const home = roleHome(bot);
          const blend = 0.45;
          tx = tx * blend + home.x * (1 - blend);
          tz = tz * blend + home.z * (1 - blend);
        }
        moveBot(bot, tx || 0, tz || 0, CODE_SPEED * 0.9, dt);
        break;
      }
      case 'dribble':
        if (botHasBall(bot)) {
          const attackZ = bot.team === 'player' ? goalZ : -goalZ;
          const toGoal = directionTo(bot.x, bot.z, clamp(ball.x * 0.15, -2.5, 2.5), attackZ);
          bot.facing = lerpAngle(bot.facing, Math.atan2(toGoal.x, toGoal.z), Math.min(1, dt * 12));
          const step = DRIBBLE_SPEED * (bot.team === 'player' && bot.z < 0 ? 1.08 : 1);
          moveBot(bot, bot.x + toGoal.x * 3.6, bot.z + toGoal.z * 3.6, step, dt);
          dribbleNudge(bot);
        } else {
          if (!shouldCodedChase(bot)) {
            roleDefaultMove(bot, dt);
          } else {
            moveBot(bot, ball.x, ball.z, CODE_SPEED, dt);
          }
        }
        break;
      case 'guard_goal': {
        const ownZ = bot.team === 'player' ? -goalZ + 2.2 : goalZ - 2.2;
        const ballD = botDistToBall(bot);
        if (ballD < 6) {
          moveBot(bot, clamp(ball.x * 0.55, -3.2, 3.2), ownZ + (ball.z - ownZ) * 0.12, GUARD_SPEED, dt);
        } else {
          moveBot(bot, clamp(ball.x * 0.22, -2.6, 2.6), ownZ, GUARD_SPEED * 0.75, dt);
        }
        break;
      }
      case 'user_drive': {
        const mx = Number(params.dx) || 0;
        const mz = Number(params.dz) || 0;
        const sp = (params.sprint ? 1.22 : 1.05) * CODE_SPEED * 1.12;
        const tx = bot.x + mx * 4.2;
        const tz = bot.z + mz * 4.2;
        moveBot(bot, tx, tz, sp, dt);
        if (botHasBall(bot)) dribbleNudge(bot);
        break;
      }
      case 'dive_save':
      case 'catch_ball':
        moveBot(bot, clamp(ball.x, -GOAL_WIDTH * 0.45, GOAL_WIDTH * 0.45), bot.team === 'player' ? -goalZ + 1 : goalZ - 1, CODE_SPEED * 1.05, dt);
        break;
      default:
        break;
    }
  }

  function applyCodedIntents(dt) {
    for (const bot of bots) {
      if (bot.team !== 'player' || bot.frozen) continue;
      const moveIntent = bot.intent && MOVE_INTENTS.has(bot.intent.type);
      if (!bot.canAct && !moveIntent) continue;
      if (!state.kickoffDone && bot.intent && !MOVE_INTENTS.has(bot.intent.type)) continue;
      if (!bot.intent) continue;
      applyMoveIntent(bot, bot.intent.type, bot.intent.params || {}, dt);
    }
  }

  function dribbleNudge(bot) {
    const attackZ = bot.team === 'player' ? goalZ : -goalZ;
    const dir = directionTo(bot.x, bot.z, bot.x, attackZ);
    const pace = Math.min(1.35, 0.65 + (bot.moveSpeed || 0) * 0.1);
    ball.vx += dir.x * pace;
    ball.vz += dir.z * pace;
    ball.lastTouch = bot.id;
  }

  function recoverStuckBall(dt) {
    if (!state.kickoffDone || state.pendingReset > 0) return;
    const spd = Math.hypot(ball.vx, ball.vz);
    const nearEdge = Math.abs(ball.x) > pitchHalfX - 2.8 || Math.abs(ball.z) > pitchHalfZ - 2.8;
    const clustered = spd < 0.14 && nearEdge;
    if (clustered) {
      state.stuckBallTimer = (state.stuckBallTimer || 0) + dt;
    } else {
      state.stuckBallTimer = Math.max(0, (state.stuckBallTimer || 0) - dt * 2);
    }
    if ((state.stuckBallTimer || 0) < 1.4) return;
    state.stuckBallTimer = 0;
    ball.x = clamp(ball.x * 0.4, -6, 6);
    ball.z = clamp(ball.z * 0.35, -6, 6);
    const towardCenter = directionTo(ball.x, ball.z, 0, 0);
    ball.vx = towardCenter.x * 3.2;
    ball.vz = towardCenter.z * 3.2;
    ball.kickCooldown = 0.15;
    state.possession = null;
    state.possessionBotId = null;
  }

  function coupleBallToBot(bot, dt) {
    if (ball.kickCooldown > 0) return;
    if (!botHasBall(bot)) return;
    const ballSpd = Math.hypot(ball.vx, ball.vz);
    if (ballSpd > 4.2) return;
    const fwdX = Math.sin(bot.facing);
    const fwdZ = Math.cos(bot.facing);
    const footX = bot.x + fwdX * 0.28;
    const footZ = bot.z + fwdZ * 0.28;
    const dx = footX - ball.x;
    const dz = footZ - ball.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    const moveSpd = Math.hypot(bot.x - bot.lastX, bot.z - bot.lastZ) / Math.max(dt, 0.001);
    if (moveSpd < 0.18 && dist < 0.35) return;
    const pull = Math.min(dist, 0.09) * 2.6 * dt;
    ball.x += (dx / dist) * pull;
    ball.z += (dz / dist) * pull;
    ball.vx = ball.vx * 0.9 + (dx / dist) * pull * 1.4;
    ball.vz = ball.vz * 0.9 + (dz / dist) * pull * 1.4;
    ball.lastTouch = bot.id;
    if (moveSpd > 0.35) dribbleNudge(bot);
  }

  function syncBotMeshes(dt) {
    const frameDt = Math.max(dt, 1 / 120);
    for (const bot of bots) {
      if (!bot.mesh) continue;
      if (bot.isPlayer) {
        bot.visualX = bot.x;
        bot.visualZ = bot.z;
        bot.visualFacing = bot.facing;
      } else {
        const posLerp = Math.min(1, frameDt * 14);
        bot.visualX += (bot.x - bot.visualX) * posLerp;
        bot.visualZ += (bot.z - bot.visualZ) * posLerp;
        bot.visualFacing = lerpAngle(bot.visualFacing, bot.facing, Math.min(1, frameDt * 11));
      }

      bot.mesh.position.x = bot.visualX;
      bot.mesh.position.z = bot.visualZ;
      if (bot.mesh.userData.groundY != null) bot.mesh.position.y = bot.mesh.userData.groundY;
      bot.mesh.rotation.y = bot.visualFacing;

      const moved = Math.abs(bot.x - bot.lastX) + Math.abs(bot.z - bot.lastZ);
      const moveSpeed = moved / Math.max(frameDt, 0.001);
      bot.lastX = bot.x;
      bot.lastZ = bot.z;

      const ring = bot.mesh.userData?.teamRing;
      const arrow = bot.mesh.userData?.actArrow;
      if (ring?.material) {
        const hasBall = state.possessionBotId === bot.id;
        const executing = state.lastActBotId === bot.id;
        ring.material.opacity = hasBall ? 0.88 : executing ? 0.72 : 0.32;
        ring.scale.setScalar(hasBall || executing ? 1.12 + Math.sin(state.matchTime * 6) * 0.06 : 1);
        if (arrow) {
          arrow.visible = executing;
          arrow.position.y = 2.22 + (executing ? Math.sin(state.matchTime * 8) * 0.05 : 0);
        }
      }

      if (bot.mesh.userData?.footballRig?.setRunSpeed) {
        bot.mesh.userData.footballRig.setRunSpeed(moveSpeed);
      }

      if (state.celebrating && bot.mesh.userData?.setAnimState && bot.team === 'player') {
        bot.mesh.userData.setAnimState('celebrate', frameDt);
      } else if (kickingBot?.id === bot.id && kickType && bot.mesh.userData?.rig) {
        kickFrame += 1;
        const pose = computeKickRigPose(
          kickType === 'shot' ? 'heavy_kick' : 'light_kick',
          kickFrame,
          kickSide,
        );
        applyKickPoseToRig(pose, bot.mesh.userData.rig, -1.15, bot.mesh);
        const maxFrames = kickType === 'shot' ? 36 : 24;
        if (kickFrame >= maxFrames) { kickType = null; kickingBot = null; }
      } else if (bot.mesh.userData?.setAnimState) {
        const hasBall = state.possessionBotId === bot.id;
        const anim = moveSpeed > 0.06
          ? (hasBall ? 'dribble' : 'run')
          : 'idle';
        bot.mesh.userData.setAnimState(anim, frameDt);
      }
      bot.mesh.userData.animate?.(state.matchTime, frameDt);
    }
  }

  const engine = {
    getBall: () => ball,
    getBots: () => bots,
    getLayout: () => layout,
    getState: () => {
      const pb = playerBot;
      return {
        ...state,
        active: true,
        mode: layout.kind,
        modeLabel: state.matchLabel,
        trainingGoals: state.playerGoals,
        trainingGoal: goalsToWin,
        playerX: pb?.x ?? 0,
        playerZ: pb?.z ?? 0,
        playerFacing: pb?.facing ?? 0,
        enemyX: bots.find((b) => b.team === 'enemy')?.x ?? ENEMY_START_X,
        enemyZ: bots.find((b) => b.team === 'enemy')?.z ?? 0,
        ballX: ball.x, ballZ: ball.z, ballY: ball.y,
        ballDist: pb ? botDistToBall(pb) : 0,
        goalDist: pb ? Math.sqrt((goalZ - pb.z) ** 2 + pb.x ** 2) : 0,
        haveBall: pb ? botHasBall(pb) : false,
        enemyHasBall: bots.some((b) => b.team === 'enemy' && botHasBall(b)),
        shootingRange: pb ? !!(buildBotSensors(pb).shootingRange) : false,
        ballClose: pb ? botDistToBall(pb) < 3 : false,
        ballFar: pb ? botDistToBall(pb) > 6 : false,
        passes: state.passes,
        shots: state.shots,
        timeLeft: state.timeLeft,
        goalsToWin,
        teamSize,
        kickoffDone: state.kickoffDone,
        kickoffBanner: !state.kickoffDone && !isTraining,
        goalFlash: state.goalFlash,
        lastActBotId: state.lastActBotId,
        ballOut: Math.abs(ball.x) > pitchHalfX + 0.4 || Math.abs(ball.z) > pitchHalfZ + 0.4,
        saves: state.saves,
        shotsFaced: state.shotsFaced,
        drillHint: state.drillHint,
        drillStyle: state.drillStyle,
        enemyGoals: state.enemyGoals,
        radar: bots.map((b) => ({ id: b.id, x: b.x, z: b.z, team: b.team, role: b.role, isPlayer: !!b.isPlayer })),
        lastScorer: state.lastScorer || '',
        matchMinute: Math.min(90, Math.floor((state.matchTime / Math.max(1, timeLimit)) * 90)),
        matchTime: state.matchTime,
        possessionLabel: state.possessionBotId
          ? botLabel(bots.find((b) => b.id === state.possessionBotId))
          : '',
        codedActionLabel: state.codedActionLabel || '',
        userDriving: state.userDriving,
        lastScoredTeam: state.lastScoredTeam || null,
        playerStamina: state.playerStamina,
        playerLabel: botLabel(pb),
        playerRole: pb?.role || 'striker',
        userSprinting: !!(state.userInput?.sprint && state.userDriving && state.playerStamina > 0.14),
      };
    },
    getSensors: (botId = null) => {
      const bot = resolvePlayerBot(botId);
      const per = buildBotSensors(bot);
      return {
        ...engine.getState(),
        ...per,
        haveBall: per.haveBall,
        shootingRange: per.shootingRange,
        ballClose: per.ballClose,
        ballFar: per.ballFar,
        ballDist: per.ballDist,
        goalDist: per.goalDist,
        playerX: per.playerX,
        playerZ: per.playerZ,
        playerFacing: per.playerFacing,
        botId: per.botId,
        role: per.role,
      };
    },
    isOver: () => state.over,
    syncPresentation(dt = 0) {
      syncBotMeshes(dt);
    },
    setPlayerMesh(m) {
      if (playerBot) playerBot.mesh = m;
    },
    setEnemyMesh(m) {
      const e = bots.find((b) => b.team === 'enemy');
      if (e) e.mesh = m;
    },
    setBotMesh(id, mesh) {
      const b = bots.find((x) => x.id === id);
      if (b) b.mesh = mesh;
    },
    setUserInput(inp = {}) {
      Object.assign(state.userInput, inp);
    },
    reset() {
      Object.assign(state, {
        over: false, won: false, playerGoals: 0, enemyGoals: 0,
        timeLeft: timeLimit, matchTime: 0, possession: null, possessionBotId: null,
        feedback: null, feedbackTimer: 0, passes: 0, shots: 0,
        missionProgress: 0, celebrating: false, celebrateTimer: 0,
        kickoffDone: isTraining, kickoffTimer: isTraining ? 0 : 1.4, kickoffBanner: !isTraining,
        goalFlash: 0, lastActBotId: null, ballOut: false, lastScorer: '', pendingReset: 0, pendingWin: null,
        codedActionLabel: '', codedActionTimer: 0, userDriving: false,
        userInput: { dx: 0, dz: 0, shoot: false, pass: false, sprint: false },
        playerStamina: 1,
      });
      ai.warmupTimer = difficulty === 'hard' ? 0.8 : difficulty === 'easy' ? 1.2 : 0.5;
      for (const b of bots) { b.x = b.anchorX; b.z = b.anchorZ; b.visualX = b.anchorX; b.visualZ = b.anchorZ; b.moveSpeed = 0; b.canAct = true; b.action = null; b.actionTimer = 0; b.intent = null; }
      resetBall();
    },
    doAction(actionId, params = {}, botId = null, fromCoded = false) {
      const bot = botId ? bots.find((b) => b.id === botId && b.team === 'player') : playerBot;
      if (!bot || state.over) return;
      const movementOnly = MOVE_INTENTS.has(actionId);
      if (!movementOnly && !bot.canAct) return;
      state.lastActBotId = bot.id;
      if (fromCoded) {
        const labels = {
          short_pass: 'PASS', long_pass: 'LONG PASS', shoot: 'SHOOT', lob_pass: 'LOB',
          dribble: 'DRIBBLE', chase_ball: 'CHASE', guard_goal: 'GUARD', clear_ball: 'CLEAR',
        };
        state.codedActionLabel = `${botLabel(bot)} → ${labels[actionId] || actionId}`;
        state.codedActionTimer = 2.4;
      }
      if (!state.kickoffDone && !movementOnly) return;
      if (movementOnly) {
        bot.intent = { type: actionId, params: params || {} };
        return;
      }

      switch (actionId) {
        case 'short_pass': doKick('passShort', bot, fromCoded); break;
        case 'long_pass': doKick('passLong', bot, fromCoded); break;
        case 'shoot': {
          const attackGoalZ = bot.team === 'player' ? goalZ : -goalZ;
          const goalDist = Math.hypot(bot.x, attackGoalZ - bot.z);
          const nearBall = botDistToBall(bot) < POSSESSION_RADIUS + 1.4;
          if (drillStyle === DRILL_STYLES.TURN_KICK && nearBall) {
            doKick('shot', bot, fromCoded);
          } else if (botHasBall(bot) && goalDist < SHOOT_RANGE) doKick('shot', bot, fromCoded);
          else if (botHasBall(bot)) {
            bot.intent = { type: 'dribble', params: {} };
            setFeedback('Striker #9 — too far to shoot!', 'info');
          } else {
            bot.intent = { type: 'chase_ball', params: {} };
          }
          break;
        }
        case 'lob_pass': doKick('lob', bot, fromCoded); break;
        case 'celebrate':
          state.celebrating = true;
          state.celebrateTimer = 1.8;
          break;
        case 'clear_ball':
          if (botHasBall(bot)) doKick('clear', bot, fromCoded);
          else bot.intent = { type: 'guard_goal', params: {} };
          break;
        default: break;
      }
    },
    tick(dt) {
      if (state.over) return;
      actionDt = dt;

      for (const bot of bots) {
        if (bot.actionTimer > 0) {
          bot.actionTimer -= dt;
          if (bot.actionTimer <= 0) {
            bot.canAct = true;
            bot.action = null;
          }
        }
      }

      if (!state.kickoffDone) {
        state.kickoffTimer -= dt;
        tickBallPhysics(ball, dt * 0.08, pitchBounds());
        applyCodedIntents(dt);
        if (state.kickoffTimer <= 0) {
          state.kickoffDone = true;
          setFeedback('Kick off!', 'info');
          if (teamSize >= 3 && layout.kind === 'fifa' && !isTraining) {
            const striker = bots.find((b) => b.team === 'player' && b.role === 'striker');
            if (striker) {
              ball.x = striker.x + Math.sin(striker.facing) * 0.15;
              ball.z = striker.z + Math.cos(striker.facing) * 0.15;
              ball.vx = 0;
              ball.vz = 0;
              state.kickoffPassTimer = 0.4;
            }
          }
        }
        syncBotMeshes(dt);
        return;
      }

      if (state.kickoffPassTimer > 0) {
        state.kickoffPassTimer -= dt;
        const kickTeam = state.kickoffTeam || 'player';
        const kicker = bots.find((b) => b.team === kickTeam && b.role === 'striker')
          || bots.find((b) => b.team === kickTeam);
        if (kicker) {
          coupleBallToBot(kicker, dt);
          kicker.intent = null;
        }
        if (state.kickoffPassTimer <= 0) {
          if (kicker && botDistToBall(kicker) < POSSESSION_RADIUS + 0.4) {
            doKick('passShort', kicker);
          }
        }
        syncBotMeshes(dt);
        if (state.feedbackTimer > 0) state.feedbackTimer -= dt;
        if (state.goalFlash > 0) state.goalFlash = Math.max(0, state.goalFlash - dt);
        return;
      }

      if (ball.kickCooldown > 0) ball.kickCooldown = Math.max(0, ball.kickCooldown - dt);

      if (state.pendingReset > 0) {
        state.pendingReset -= dt;
        if (state.goalFlash > 0) state.goalFlash = Math.max(0, state.goalFlash - dt);
        syncBotMeshes(dt);
        if (state.pendingReset <= 0) {
        const win = state.pendingWin;
        state.pendingWin = null;
        resetBall(state.lastScoredTeam);
        if (win === true) endMatch(true);
        if (win === false) endMatch(false);
      }
        return;
      }

      tickTurnKickDrill(dt);
      tickKeeperWaves(dt);

      if (state.awaitingKick && drillStyle === DRILL_STYLES.TURN_KICK) {
        tickTeamAI(dt);
        applyCodedIntents(dt);
        syncBotMeshes(dt);
        return;
      }

      state.matchTime += dt;
      state.timeLeft = Math.max(0, timeLimit - state.matchTime);
      if (state.timeLeft <= 0 && !isTraining) {
        endMatch(state.playerGoals > state.enemyGoals);
        return;
      }

      tickBallPhysics(ball, dt, pitchBounds());

      if (drillStyle === DRILL_STYLES.KEEPER_WAVES) {
        applyCodedIntents(dt);
        syncBotMeshes(dt);
        checkGoal();
        const nearest = nearestBotToBall();
        const holder = nearest && botDistToBall(nearest) < POSSESSION_RADIUS ? nearest : null;
        if (holder) {
          state.possession = holder.team;
          state.possessionBotId = holder.id;
        } else {
          state.possession = null;
          state.possessionBotId = null;
        }
        state.ballOut = Math.abs(ball.x) > pitchHalfX + 0.4 || Math.abs(ball.z) > pitchHalfZ + 0.4;
        return;
      }

      applyUserInput(dt);
      if (state.codedActionTimer > 0) {
        state.codedActionTimer = Math.max(0, state.codedActionTimer - dt);
        if (state.codedActionTimer <= 0) state.codedActionLabel = '';
      }

      tickTeamAI(dt);
      applyCodedIntents(dt);
      tickGreenTeamAI(dt, difficulty === 'hard' ? 1.12 : difficulty === 'easy' ? 0.82 : 1, ai.warmupTimer > 0);
      const onBall = resolveBallCarrier();
      if (onBall) coupleBallToBot(onBall, dt);
      recoverStuckBall(dt);
      checkGoal();

      const holder = resolveBallCarrier();
      if (holder && botDistToBall(holder) < POSSESSION_RADIUS + 0.15) {
        state.possession = holder.team;
        state.possessionBotId = holder.id;
      } else {
        state.possession = null;
        state.possessionBotId = null;
      }

      if (state.feedbackTimer > 0) state.feedbackTimer -= dt;
      if (state.goalFlash > 0) state.goalFlash = Math.max(0, state.goalFlash - dt);
      state.ballOut = Math.abs(ball.x) > pitchHalfX + 0.4 || Math.abs(ball.z) > pitchHalfZ + 0.4;
      if (state.celebrateTimer > 0) {
        state.celebrateTimer -= dt;
        if (state.celebrateTimer <= 0) state.celebrating = false;
      }

      syncBotMeshes(dt);
    },
  };

  return engine;
}
