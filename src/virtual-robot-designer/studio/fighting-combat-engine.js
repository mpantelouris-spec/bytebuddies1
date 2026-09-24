/**
 * Fighting combat engine — boxing mechanics, stamina, rounds, AI integration.
 * 
 * MASTER SYSTEM: REALISTIC 3D COMBAT & ANIMATION ENGINE
 * Integrates biomechanical motion, frame-accurate FSM, dynamic hitboxes,
 * hitstop, knockback physics, and camera "juice".
 */
import { getFightingStats, FIGHTING_ROBOT_TYPES } from '../data/fighting-robot-types.js';
import {
  DISTANCE, STAMINA, GUARD, IMPACT, ROUNDS, FIGHT_HEALTH,
  resolvePunch, resolveGenericAttack, getDistanceBand, getComboMultiplier,
  getFightPhase, staminaSpeedMult, staminaDamageMult, staminaStartupMult,
  isInRange, calculateContextDamage, getAttackTiming,
  attackBlockedByGuard, framesToSeconds, MK_MAX_COMBO, FIGHT_FPS,
  PRECISE_FRAME_DATA, HITSTOP, KNOCKBACK, getHitStopDuration,
} from '../data/fighting-boxing-mechanics.js';
import {
  createEnemyAI, createEnemyMemory, recordPlayerAction, updateAdaptation,
  tickEnemyAI, getDifficulty, AI_STATES,
} from '../data/fighting-enemy-ai.js';
import {
  playCombatActionSound, playHitSound, playKnockdownSound,
  playKickImpactSound,
  playRoundBellSound, playVictorySound, playDefeatSound, playBlockSound,
} from './fighting-combat-audio.js';
import {
  createCombatSkeleton,
  createCombatFSM,
  CombatState,
  executeCombatBlock,
} from './realistic-combat-animation.js';
import {
  createFighterCombatController,
  mapActionToFSM,
  defaultStrikeSide,
} from './combat-rig-bridge.js';

const PLAYER_X = -1.0; // inside the 6×6 ring (spec: fighters at ±1.5)
/** Start in optimal punching range (~2 m) — not 7 m where no attack lands */
const START_DISTANCE = 2.6;

const ATTACK_ANIM = {
  high_punch: 'jab', low_punch: 'low_punch', high_kick: 'roundhouse', low_kick: 'kick',
  heavy_punch: 'cross', heavy_kick: 'heavy_kick', throw: 'cross',
  energy_bolt: 'cross', energy_bolt_amplify: 'cross', uppercut_reversal: 'cross',
  jump_punch: 'jab', jump_kick: 'kick',
  jab: 'jab', cross: 'cross', hook: 'hook', uppercut: 'cross',
  strong: 'cross', fierce: 'cross', short_kick: 'kick', roundhouse: 'roundhouse',
  light_punch: 'jab', heavy_punch_alias: 'cross', attack: 'jab',
  attack_light: 'jab', attack_heavy: 'cross', combo_3hit: 'cross',
  slam: 'cross', kick: 'kick', kick_low: 'kick', light_kick: 'kick',
  sweep: 'sweep',
};

// Arcade mode uses actual attack timing — no artificial slowdown floor.
const MIN_VISUAL_ANIM = 0.1;
const MIN_VISUAL_ANIM_GAME = 0.06;

const KICK_ANIM_MIN = {
  kick: 0.62,
  roundhouse: 0.74,
  heavy_kick: 0.86,
  sweep: 0.58,
};

function visualAnimDuration(sec, challenge, animState) {
  const min = (challenge?.gameStyle || challenge?.boxingPointsMode) ? MIN_VISUAL_ANIM_GAME : MIN_VISUAL_ANIM;
  let dur = Math.max(min, sec);
  if (animState && KICK_ANIM_MIN[animState]) {
    dur = Math.max(dur, KICK_ANIM_MIN[animState]);
  }
  return dur;
}

const KICK_ACTION_IDS = new Set([
  'kick', 'low_kick', 'light_kick', 'high_kick', 'heavy_kick', 'roundhouse', 'sweep', 'sweep_kick',
  'short_kick', 'kick_low', 'b_kick', 'y_kick', 'jump_kick',
]);

function isKickAction(actionId, atk) {
  const id = actionId || atk?.id || '';
  return KICK_ACTION_IDS.has(id) || /kick|sweep/i.test(id);
}

function pickEnemyHitReaction(dmg, opts = {}) {
  const aid = opts.actionId || '';
  const atkId = opts.atk?.id || '';
  const kick = isKickAction(aid, opts.atk);
  if (opts.knockdown || atkId === 'sweep' || opts.atk?.knockdown) {
    return { anim: 'knockdown', dur: 1.8 };
  }
  if (dmg >= IMPACT.KNOCKDOWN_THRESHOLD) {
    return { anim: 'knockdown', dur: 1.8 };
  }
  if (kick && (dmg >= IMPACT.STAGGER_THRESHOLD || atkId === 'heavy_kick' || atkId === 'high_kick')) {
    return { anim: 'kick_heavy_hit', dur: 0.62 };
  }
  if (kick) {
    return { anim: 'kick_hit', dur: 0.42 };
  }
  if (dmg >= IMPACT.STAGGER_THRESHOLD) {
    return { anim: 'stagger', dur: 0.9 };
  }
  return { anim: 'hit', dur: 0.36 };
}

export function createCombatEngine({
  challenge = {},
  playerArchetype = 'striker',
  enemyMesh,
  enemyKey: initialEnemyKey,
  onCombatEvent = null,
}) {
  const mode = challenge.fightMode || 'sparring';
  const playerStats = getFightingStats(playerArchetype, playerArchetype);
  const difficulty = getDifficulty(challenge);
  const enemyKey = initialEnemyKey || (challenge.enemyType === 'dummy' ? 'dummy' : challenge.enemyType || 'striker');
  const enemyStats = FIGHTING_ROBOT_TYPES[enemyKey === 'dummy' ? 'striker' : enemyKey] || FIGHTING_ROBOT_TYPES.striker;

  let dmgId = 0;
  let playerMesh = null;
  let onEvent = onCombatEvent;
  const memory = createEnemyMemory();
  const ai = createEnemyAI(enemyKey === 'dummy' ? 'dummy' : enemyKey, difficulty, memory);

  // ═══════════════════════════════════════════════════════════════════════════
  // REALISTIC COMBAT ANIMATION SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Biomechanical joint animation controllers (skeleton → visible mesh rig)
  let playerCombat = null;
  let enemyCombat = null;
  let playerSkeleton = null;
  let enemySkeleton = null;
  let playerFSM = null;
  let enemyFSM = null;

  function resolveFighterMesh(mesh) {
    return mesh?.userData?.fighterCore || mesh;
  }

  function attachCombatController(mesh, isEnemy = false) {
    const fighter = resolveFighterMesh(mesh);
    if (!fighter?.userData?.rig) return null;
    const guardX = isEnemy ? 1.15 : -1.15;
    return createFighterCombatController(mesh, { guardX, fighter });
  }

  function syncCombatRefs(ctrl, isEnemy) {
    if (isEnemy) {
      enemyCombat = ctrl;
      enemySkeleton = ctrl?.skeleton ?? null;
      enemyFSM = ctrl?.fsm ?? null;
    } else {
      playerCombat = ctrl;
      playerSkeleton = ctrl?.skeleton ?? null;
      playerFSM = ctrl?.fsm ?? null;
    }
  }
  
  // Hitstop system - freezes both fighters on impact
  let hitStopTimer = 0;
  let hitStopTimeScale = 1;
  
  function triggerHitStop(heavy = false) {
    hitStopTimer = getHitStopDuration(heavy);
    hitStopTimeScale = 0.04;
    playerFSM?.triggerHitStop?.(heavy);
    enemyFSM?.triggerHitStop?.(heavy);
    playerMesh?.userData?.setTimeScale?.(0);
    enemyMesh?.userData?.setTimeScale?.(0);
  }

  function updateHitStop(dt) {
    if (hitStopTimer > 0) {
      hitStopTimer -= dt;
      if (hitStopTimer <= 0) {
        hitStopTimeScale = 1;
        playerMesh?.userData?.setTimeScale?.(1);
        enemyMesh?.userData?.setTimeScale?.(1);
      }
      return hitStopTimeScale;
    }
    return 1;
  }

  const makeInitialState = () => ({
    mode,
    modeLabel: challenge.shortName || challenge.name || 'Combat',
    difficulty: difficulty.label,
    aiState: AI_STATES.ASSESS,
    playerArchetype,
    enemyArchetype: enemyKey === 'dummy' ? 'dummy' : enemyKey,
    playerHp: challenge.playerHp || FIGHT_HEALTH,
    playerMax: challenge.playerHp || FIGHT_HEALTH,
    enemyHp: challenge.enemyHp || FIGHT_HEALTH,
    enemyMax: challenge.enemyHp || FIGHT_HEALTH,
    enemyColor: enemyStats.color,
    playerStamina: STAMINA.MAX,
    playerStaminaMax: STAMINA.MAX,
    enemyStamina: STAMINA.MAX,
    playerGuard: 'back',
    crouching: false,
    hitConfirmWindow: 0,
    lastHitConnected: false,
    jumping: false,
    jumpTimer: 0,
    guardBroken: false,
    guardBrokenTimer: 0,
    mkMode: true,
    cancelWindowTimer: 0,
    enemyHitStun: 0,
    playerHitStun: 0,
    enemyKnockdown: false,
    enemyKnockdownTimer: 0,
    poweredUp: false,
    poweredUpTimer: 0,
    amplifyNext: false,
    distance: START_DISTANCE,
    playerX: PLAYER_X,
    enemyX: PLAYER_X + START_DISTANCE,
    playerCombo: 0,
    bestCombo: 0,
    // Fight choreography — punch lunges, ring circling
    playerLunge: 0,
    enemyLunge: 0,
    circleT: 0,
    playerZ: 0,
    enemyZ: 0,
    playerFaceAngle: Math.PI / 2,
    _stepCooldown: 0,
    comboTimer: 0,
    comboLabel: null,
    comboPoints: 0,
    blocking: false,
    dodging: false,
    parrying: false,
    staggered: false,
    staggerTimer: 0,
    knockdown: false,
    knockdownTimer: 0,
    guardBreakHits: 0,
    exhausted: false,
    damageTaken: 0,
    trainingHits: 0,
    trainingGoal: 5,
    wave: mode === 'survival' ? 1 : 0,
    boxingRound: 1,
    roundWinsPlayer: 0,
    roundWinsEnemy: 0,
    roundTimeLeft: challenge.timeLimit || ROUNDS.DURATION,
    roundElapsed: 0,
    betweenRounds: false,
    restTimer: 0,
    round: mode === 'tournament' ? 1 : 0,
    totalRounds: challenge.rounds?.length || 4,
    rounds: challenge.rounds || [],
    phase: 1,
    boss: mode === 'boss',
    timeLeft: challenge.timeLimit || 0,
    fightPhase: getFightPhase(0),
    specialUsed: false,
    specialActive: false,
    specialTimer: 0,
    rageLevel: 0,
    specialMeter: 0,
    underAttack: false,
    over: false,
    won: false,
    feedback: null,
    feedbackTimer: 0,
    damageNumbers: [],
    statusEffects: [],
    playerScore: 0,
    enemyScore: 0,
    strategyScenario: 0,
    strategyScenarioGoal: challenge.strategyScenarios?.length || 3,
    strategyLabel: challenge.strategyScenarios?.[0]?.label || null,
    gameStatus: 'PLAYING',
    playerCanAct: true,
    playerAnimTimer: 0,
    playerCurrentAction: null,
    enemyCanAct: true,
    enemyAnimTimer: 0,
    enemyCurrentAction: null,
  });

  const state = makeInitialState();
  const pendingHits = [];
  const actorLock = { player: 0, enemy: 0 };

  function syncHealthVisuals() {
    const pPct = state.playerHp / state.playerMax;
    const ePct = state.enemyHp / state.enemyMax;
    playerMesh?.userData?.setHealthPct?.(pPct);
    enemyMesh?.userData?.setHealthPct?.(ePct);
  }

  function setGameStatus(status) {
    state.gameStatus = status;
    if (status === 'PLAYER_WIN' || status === 'PLAYER_LOSE') state.over = true;
  }

  function emitCombatEvent(type, data = {}) {
    onEvent?.({ type, ...data, state: { ...state } });
  }

  function playMeshAnim(mesh, anim, dur = 0.45) {
    if (mesh?.userData?.setAnimState) mesh.userData.setAnimState(anim, visualAnimDuration(dur, challenge, anim));
  }

  function syncMesh() {
    if (enemyMesh) enemyMesh.position.x = state.enemyX;
  }

  function addDamageNumber(amount, target, opts = {}) {
    state.damageNumbers.push({
      id: ++dmgId,
      amount,
      x: target === 'enemy' ? 55 + Math.random() * 10 : 25 + Math.random() * 10,
      y: 20 + Math.random() * 15,
      critical: !!opts.critical,
      blocked: !!opts.blocked,
      miss: !!opts.miss,
      combo: !!opts.combo,
    });
    if (state.damageNumbers.length > 10) state.damageNumbers.shift();
  }

  function setFeedback(text, type = 'hit') {
    state.feedback = { text, type };
    state.feedbackTimer = 1.2;
  }

  function spendPlayerStamina(cost) {
    state.playerStamina = Math.max(0, state.playerStamina - cost);
    if (state.playerStamina <= 0) {
      state.exhausted = true;
      state.statusEffects = [...new Set([...state.statusEffects, '💨 Exhausted'])];
      setFeedback('Exhausted!', 'hurt');
    }
  }

  function regenStamina(dt) {
    if (state.blocking && !state.guardBroken) {
      state.playerStamina = Math.max(0, state.playerStamina - STAMINA.BLOCK_PER_FRAME * dt * FIGHT_FPS);
      if (state.playerStamina <= 0) {
        state.guardBroken = true;
        state.guardBrokenTimer = framesToSeconds(STAMINA.GUARD_BREAK_FRAMES);
        state.blocking = false;
        setFeedback('GUARD BROKEN!', 'hurt');
      }
    } else if (!state.exhausted && actorLock.player <= 0 && !state.blocking) {
      state.playerStamina = Math.min(state.playerStaminaMax, state.playerStamina + STAMINA.REGEN_PER_SEC * dt);
    }
    state.enemyStamina = Math.min(STAMINA.MAX, state.enemyStamina + STAMINA.REGEN_PER_SEC * dt * difficulty.staminaEfficiency);
    if (state.playerStamina > STAMINA.EXHAUSTED_THRESHOLD) {
      state.exhausted = false;
      state.statusEffects = state.statusEffects.filter((s) => s !== '💨 Exhausted');
    }
  }

  // Ring bounds for both fighters (canvas edge ≈ ±2.7)
  const RING_MIN_X = -2.6;
  const RING_MAX_X = 2.6;
  const MIN_GAP = 0.6; // fighters can't occupy the same spot

  function refreshDistance() {
    state.distance = Math.max(0.5, state.enemyX - state.playerX);
  }

  /** Move the PLAYER along the x axis (positive = toward enemy). */
  function movePlayer(delta) {
    state.playerX = Math.max(RING_MIN_X, Math.min(state.enemyX - MIN_GAP, state.playerX + delta));
    refreshDistance();
  }

  /** Move the ENEMY along the x axis (negative = toward player). */
  function moveEnemy(delta) {
    state.enemyX = Math.max(state.playerX + MIN_GAP, Math.min(RING_MAX_X, state.enemyX + delta));
    refreshDistance();
  }

  /** Legacy distance nudge (knockback etc.) — pushes the enemy away/toward. */
  function adjustDistance(delta) {
    moveEnemy(delta);
  }

  function registerComboHit() {
    if (state.playerCombo >= MK_MAX_COMBO) return;
    state.comboTimer = 1.2;
    state.playerCombo += 1;
    state.bestCombo = Math.max(state.bestCombo || 0, state.playerCombo);
    state.playerStamina = Math.min(state.playerStaminaMax, state.playerStamina + STAMINA.ON_HIT_GAIN);
    const combo = getComboMultiplier(state.playerCombo);
    if (combo.label) {
      state.comboLabel = combo.label;
      state.comboPoints += combo.points;
      setFeedback(combo.label, 'special');
    }
  }

  function resetCombo() {
    state.playerCombo = 0;
    state.comboTimer = 0;
    state.comboLabel = null;
  }

  function applyDamageToEnemy(rawDmg, opts = {}) {
    if (state.over || state.knockdown) return 0;
    let dmg = rawDmg;
    if (opts.critical) dmg = Math.round(dmg * IMPACT.CRITICAL_MULT);
    if (state.poweredUp) {
      dmg = Math.round(dmg * 1.5);
      state.poweredUp = false;
      state.poweredUpTimer = 0;
    }
    registerComboHit();
    state.lastHitConnected = true;
    state.hitConfirmWindow = framesToSeconds(opts.hitStun || 4) + 0.08;
    state.enemyHp = Math.max(0, state.enemyHp - dmg);
    state.playerScore += dmg;
    state.specialMeter = Math.min(100, (state.specialMeter || 0) + dmg * 0.65);
    addDamageNumber(dmg, 'enemy', opts);
    setFeedback(`${opts.label || 'Hit'}! -${dmg} HP`, opts.critical ? 'critical' : 'hit');
    const kickHit = isKickAction(opts.actionId, opts.atk);
    playHitSound(dmg >= IMPACT.STAGGER_THRESHOLD);
    if (kickHit) playKickImpactSound(dmg >= IMPACT.STAGGER_THRESHOLD || opts.actionId?.includes('heavy'));
    emitCombatEvent('hit_enemy', {
      x: state.enemyX, z: 0, intensity: dmg / 25, heavy: dmg >= IMPACT.STAGGER_THRESHOLD,
      damage: dmg, critical: !!opts.critical, blocked: false,
    });

    // Hit stun — opponent locked in place (frame-based)
    const hitStunSec = framesToSeconds(opts.hitStun || 8);
    state.enemyHitStun = Math.max(state.enemyHitStun, hitStunSec);
    state.cancelWindowTimer = framesToSeconds(
      (opts.cancelWindowEnd || 8) - (opts.cancelWindowStart || 4),
    );

    const reaction = pickEnemyHitReaction(dmg, opts);
    if (reaction.anim === 'knockdown') {
      state.enemyKnockdown = true;
      state.enemyKnockdownTimer = framesToSeconds(IMPACT.KNOCKDOWN_STUN_FRAMES);
      setFeedback('KNOCKDOWN! 🔔', 'win');
      playKnockdownSound();
    } else if (reaction.anim === 'stagger' || reaction.anim === 'kick_heavy_hit') {
      setFeedback(reaction.anim === 'kick_heavy_hit' ? 'Heavy kick!' : 'Stagger!', 'hit');
    }
    if (enemyMesh?.userData.setAnimState) {
      enemyMesh.userData.setAnimState(reaction.anim, reaction.dur);
    }
    if (reaction.anim === 'knockdown') enemyCombat?.playKnockdown?.();
    else enemyCombat?.playHitStun?.();

    if (mode === 'training') {
      state.trainingHits += 1;
      if (state.trainingHits >= state.trainingGoal) {
        state.over = true;
        state.won = true;
        setFeedback('Training complete! 🎯', 'win');
      }
    } else if (state.enemyHp <= 0) {
      handleEnemyDefeated();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // REALISTIC KNOCKBACK PHYSICS (from spec)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Trigger hitstop freeze on impact
    const isHeavyHit = dmg >= IMPACT.STAGGER_THRESHOLD || opts.actionId?.includes('heavy');
    triggerHitStop(isHeavyHit);
    
    // Apply knockback based on attack type
    const isKick = isKickAction(opts.actionId, opts.atk);
    let knockbackAmount;
    
    if (isHeavyHit) {
      // Heavy hit: impulse displacement (0.85 units for kicks)
      knockbackAmount = isKick ? KNOCKBACK.HEAVY_KICK_DISPLACEMENT : 0.5;
    } else {
      // Light hit: linear displacement (0.25 units)
      knockbackAmount = isKick ? KNOCKBACK.LIGHT_KICK_DISPLACEMENT : 0.15;
    }
    
    // Apply knockback velocity for smooth sliding
    state._enemyKnockbackVel = (state._enemyKnockbackVel || 0) + knockbackAmount;
    
    return dmg;
  }

  function handleEnemyDefeated() {
    if (mode === 'strategy' && challenge.strategyScenarios?.length) {
      state.strategyScenario += 1;
      if (state.strategyScenario >= (challenge.strategyScenarios.length)) {
        state.over = true;
        state.won = true;
        playVictorySound();
        playMeshAnim(playerMesh, 'victory', 3);
        setFeedback('All scenarios cleared! 🏆', 'win');
        return;
      }
      const next = challenge.strategyScenarios[state.strategyScenario];
      state.enemyArchetype = next.enemy || 'striker';
      const ns = FIGHTING_ROBOT_TYPES[state.enemyArchetype] || FIGHTING_ROBOT_TYPES.striker;
      state.enemyHp = ns.health;
      state.enemyMax = ns.health;
      state.enemyColor = ns.color;
      state.strategyLabel = next.label;
      state.playerHp = Math.min(state.playerMax, state.playerHp + state.playerMax * 0.25);
      ai.personalityKey = ns.id === 'tank' ? 'defensive' : ns.id === 'ninja' ? 'evasive' : 'aggressive';
      emitCombatEvent('enemy_swap', { enemyKey: state.enemyArchetype });
      playRoundBellSound();
      setFeedback(`Scenario ${state.strategyScenario + 1}: ${next.label}`, 'special');
      return;
    }
    if (mode === 'tournament' && state.round < state.totalRounds) {
      state.round += 1;
      const next = state.rounds[state.round - 1] || 'blaster';
      state.enemyArchetype = next;
      const ns = FIGHTING_ROBOT_TYPES[next] || FIGHTING_ROBOT_TYPES.striker;
      state.enemyHp = ns.health;
      state.enemyMax = ns.health;
      state.enemyColor = ns.color;
      state.playerHp = Math.min(state.playerMax, state.playerHp + state.playerMax * 0.3);
      emitCombatEvent('enemy_swap', { enemyKey: next });
      playRoundBellSound();
      setFeedback(`Round ${state.round}! vs ${ns.name}`, 'win');
    } else if (mode === 'survival') {
      state.wave += 1;
      const ns = FIGHTING_ROBOT_TYPES[['striker', 'tank', 'blaster', 'ninja', 'berserker'][state.wave % 5]];
      state.enemyArchetype = ns.id;
      state.enemyHp = ns.health + state.wave * 10;
      state.enemyMax = state.enemyHp;
      state.enemyColor = ns.color;
      state.playerHp = Math.min(state.playerMax, state.playerHp + state.playerMax * 0.2);
      emitCombatEvent('enemy_swap', { enemyKey: ns.id });
      if (state.wave >= 10) { state.over = true; state.won = true; playVictorySound(); playMeshAnim(playerMesh, 'victory', 3); setFeedback('Survival champion! 🌊', 'win'); }
      else setFeedback(`Wave ${state.wave}!`, 'win');
    } else if (mode === 'boss' && state.phase < (challenge.phases || 3)) {
      state.phase += 1;
      state.enemyHp = Math.round(state.enemyMax * (1 - state.phase * 0.15));
      state.phaseLabel = state.phase === 2 ? 'Aggressive!' : 'Desperate!';
      setFeedback(`Boss Phase ${state.phase}!`, 'win');
    } else if (mode === 'sparring' || mode === 'strategy') {
      // First to 0 HP wins (course copy) — boxing rounds only when explicitly enabled
      if (challenge.useBoxingRounds) {
        state.roundWinsPlayer += 1;
        if (state.roundWinsPlayer >= ROUNDS.WINS_NEEDED) {
          state.over = true;
          state.won = true;
          playVictorySound();
          playMeshAnim(playerMesh, 'victory', 3);
          setFeedback('VICTORY! 🏆', 'win');
        } else {
          playRoundBellSound();
          startNextBoxingRound(true);
        }
      } else {
        state.over = true;
        state.won = true;
        playVictorySound();
        playMeshAnim(playerMesh, 'victory', 3);
        setFeedback('VICTORY! 🏆', 'win');
      }
    } else {
      state.over = true;
      state.won = true;
      playVictorySound();
      playMeshAnim(playerMesh, 'victory', 3);
      setFeedback('VICTORY! 🏆', 'win');
    }
  }

  function startNextBoxingRound(playerWon) {
    const maxRounds = challenge.totalRounds || ROUNDS.BEST_OF || 3;
    if (state.boxingRound >= maxRounds) {
      state.over = true;
      state.won = null;
      setFeedback('Final bell!', 'special');
      return;
    }
    state.betweenRounds = true;
    state.restTimer = challenge.restDuration ?? ROUNDS.REST;
    state.boxingRound += 1;
    playRoundBellSound();
    state.playerHp = Math.min(state.playerMax, state.playerHp + state.playerMax * (challenge.healBetweenRounds ?? ROUNDS.HEAL_BETWEEN));
    state.enemyHp = Math.min(state.enemyMax, state.enemyHp + state.enemyMax * (challenge.healBetweenRounds ?? ROUNDS.HEAL_BETWEEN));
    state.playerStamina = STAMINA.MAX;
    state.enemyStamina = STAMINA.MAX;
    state.playerScore = 0;
    state.enemyScore = 0;
    state.roundTimeLeft = challenge.timeLimit || ROUNDS.DURATION;
    state.roundElapsed = 0;
    state.enemyKnockdown = false;
    state.enemyKnockdownTimer = 0;
    state.playerCombo = 0;
    setFeedback(`Round ${state.boxingRound} — Rest!`, 'block');
  }

  function applyDamageToPlayer(rawDmg, opts = {}) {
    if (state.over || state.knockdown) return;
    let dmg = rawDmg;
    state.underAttack = true;

    // Ninja evasion passive — chance to fully dodge (not while blocking)
    if (!state.blocking && playerStats.evasionPassive && Math.random() < playerStats.evasionPassive) {
      addDamageNumber(0, 'player', { miss: true });
      setFeedback('Evaded!', 'dodge');
      playMeshAnim(playerMesh, 'dodge', 0.4);
      return;
    }

    if (state.dodging) {
      addDamageNumber(0, 'player', { miss: true });
      setFeedback('Dodged!', 'dodge');
      state.dodging = false;
      resetCombo();
      return;
    }
    if (state.parrying && opts.canParry) {
      addDamageNumber(0, 'player', { miss: true });
      setFeedback('PARRY! Counter window!', 'special');
      state.parrying = false;
      state.staggered = false;
      return;
    }
    if (state.blocking && opts.atk && !opts.atk.unblockable && attackBlockedByGuard(opts.atk, state.playerGuard, state.crouching)) {
      state.guardBreakHits += 1;
      dmg = Math.round(dmg * IMPACT.BLOCK_REDUCTION);
      playBlockSound();
      playMeshAnim(playerMesh, 'block', 0.35);
      addDamageNumber(dmg, 'player', { blocked: true });
      state.playerStamina = Math.min(state.playerStaminaMax, state.playerStamina + STAMINA.ON_BLOCK_GAIN);
      state.playerHitStun = Math.max(state.playerHitStun, framesToSeconds(opts.blockStun || 6));
      state._playerKnockbackVel = (state._playerKnockbackVel || 0) + IMPACT.BLOCK_PUSHBACK * 0.6;
      setFeedback(`Blocked! -${dmg}`, 'block');
      if (state.guardBreakHits >= IMPACT.GUARD_BREAK_HITS) {
        state.staggered = true;
        state.staggerTimer = framesToSeconds(IMPACT.EXHAUST_STUN_FRAMES || 30);
        state.blocking = false;
        state.guardBreakHits = 0;
      }
      const armor = playerStats.passiveArmor || 0;
      dmg = Math.round(dmg * (1 - armor));
      state.playerHp = Math.max(mode === 'training' ? 1 : 0, state.playerHp - dmg);
      state._playerKnockbackVel = (state._playerKnockbackVel || 0) + Math.min(0.35, (opts.knockback || 0.1) * 0.25);
      state.enemyScore += dmg;
      state.damageTaken += dmg;
      resetCombo();
      return;
    }
    if (state.blocking && opts.atk && !attackBlockedByGuard(opts.atk, state.playerGuard, state.crouching)) {
      setFeedback('Hit through guard!', 'hurt');
      state.blocking = false;
    }

    addDamageNumber(dmg, 'player');
    playHitSound(dmg >= IMPACT.STAGGER_THRESHOLD);
    playMeshAnim(playerMesh, dmg >= IMPACT.STAGGER_THRESHOLD ? 'stagger' : 'hit', 0.5);
    emitCombatEvent('hit_player', {
      x: state.playerX, z: 0, intensity: dmg / 20, heavy: dmg >= IMPACT.STAGGER_THRESHOLD,
      damage: dmg, critical: false, blocked: !!opts.blocked,
    });
    if (!opts.blocked) setFeedback(`Hit! -${dmg}`, 'hurt');
    state.playerHitStun = Math.max(state.playerHitStun, framesToSeconds(opts.hitStun || 8));
    if (dmg >= IMPACT.STAGGER_THRESHOLD) {
      state.staggered = true;
      state.staggerTimer = framesToSeconds(12);
    }
    if (dmg >= IMPACT.KNOCKDOWN_THRESHOLD || opts.knockdown) {
      state.knockdown = true;
      state.knockdownTimer = framesToSeconds(IMPACT.KNOCKDOWN_STUN_FRAMES);
      playKnockdownSound();
      playMeshAnim(playerMesh, 'knockdown', 1.5);
      playerCombat?.playKnockdown?.();
      setFeedback('KNOCKDOWN! Get up!', 'hurt');
    } else {
      playerCombat?.playHitStun?.();
    }

    const armor = playerStats.passiveArmor || 0;
    dmg = Math.round(dmg * (1 - armor));
    // Training: the dummy spars back but can never knock you out
    state.playerHp = Math.max(mode === 'training' ? 1 : 0, state.playerHp - dmg);
    state._playerKnockbackVel = (state._playerKnockbackVel || 0) + Math.min(0.4, 0.1 + dmg * 0.012);
    state.enemyScore += dmg;
    state.damageTaken += dmg;
    state.rageLevel = Math.floor(state.damageTaken / 20);
    resetCombo();

    if (state.playerHp <= 0) {
      if ((mode === 'sparring' || mode === 'strategy') && challenge.useBoxingRounds) {
        state.roundWinsEnemy += 1;
        if (state.roundWinsEnemy >= ROUNDS.WINS_NEEDED) {
          state.over = true;
          state.won = false;
          playDefeatSound();
          setFeedback('Defeat… Try again!', 'lose');
        } else {
          playRoundBellSound();
          startNextBoxingRound(false);
        }
      } else {
        state.over = true;
        state.won = false;
        playDefeatSound();
        setFeedback('Defeat… Try again!', 'lose');
      }
      // Enemy celebrates the win with a victory pose
      if (state.over && !state.won && enemyMesh?.userData.setAnimState) {
        enemyMesh.userData.setAnimState('victory', 3.0);
      }
    }

    triggerPlayerSpecial();
  }

  function triggerPlayerSpecial() {
    if (state.specialUsed) return;
    if (playerStats.special?.triggerDamage && state.damageTaken >= playerStats.special.triggerDamage) {
      state.specialActive = true;
      state.specialTimer = playerStats.special.duration || 5;
      state.specialUsed = true;
      state.statusEffects.push('⭐ SPECIAL');
      setFeedback(`${playerStats.special.id}!`, 'special');
    }
    if (playerStats.special?.triggerHpPct && state.playerHp / state.playerMax <= playerStats.special.triggerHpPct) {
      state.playerHp = Math.min(state.playerMax, state.playerHp + (playerStats.special.heal || 30));
      state.specialActive = true;
      state.specialTimer = playerStats.special.duration || 6;
      state.specialUsed = true;
      setFeedback('LAST STAND!', 'special');
    }
  }

  function prepareAttack(actionId, isEnemy = false) {
    const archetype = isEnemy ? state.enemyArchetype : state.playerArchetype;
    const stats = FIGHTING_ROBOT_TYPES[archetype === 'dummy' ? 'striker' : archetype] || FIGHTING_ROBOT_TYPES.striker;
    const atk = resolvePunch(actionId) || resolveGenericAttack(actionId, stats.attacks || {});
    if (!atk) return null;

    const staminaPct = isEnemy ? state.enemyStamina / STAMINA.MAX : state.playerStamina / state.playerStaminaMax;
    if (!isEnemy && state.playerStamina < (atk.stamina || 5)) {
      setFeedback('Too tired!', 'hurt');
      return null;
    }
    const inHitConfirm = !isEnemy && state.hitConfirmWindow > 0 && state.lastHitConnected;
    if (!isEnemy && (state.staggered || state.playerHitStun > 0 || state.knockdown || state.guardBroken)) return null;
    if (!isEnemy && state.playerCombo >= MK_MAX_COMBO && actorLock.player > 0) return null;
    if (!isEnemy && !state.playerCanAct && !inHitConfirm) return null;
    if (!isEnemy && actorLock.player > 0 && !inHitConfirm) return null;
    if (isEnemy && (!state.enemyCanAct || actorLock.enemy > 0 || fx.enemyStun > 0 || state.enemyHitStun > 0 || state.enemyKnockdown)) return null;

    if (!isEnemy) {
      spendPlayerStamina(atk.stamina || 5);
    } else {
      state.enemyStamina = Math.max(0, state.enemyStamina - (atk.stamina || 5));
    }

    const timing = getAttackTiming(atk, actionId);
    const startupMult = !isEnemy ? staminaStartupMult(staminaPct) : 1;
    timing.impactAt *= startupMult;
    timing.animDuration *= startupMult;

    return { atk, actionId, timing, stats, staminaPct, isEnemy };
  }

  function resolveImpact(prepared) {
    const { atk, actionId, stats, staminaPct, isEnemy } = prepared;
    if (!isInRange(atk, state.distance)) return { miss: true };

    const defenderBlocking = isEnemy ? state.blocking : ai.blocking;
    const enemyGuard = isEnemy ? state.playerGuard : 'back';
    const enemyCrouch = isEnemy ? state.crouching : false;
    const defenderIdle = isEnemy
      ? !state.blocking && !state.dodging && actorLock.player <= 0 && state.playerHitStun <= 0
      : !ai.blocking && !ai.dodging && actorLock.enemy <= 0 && state.enemyHitStun <= 0;
    const guardBlocks = defenderBlocking && attackBlockedByGuard(atk, enemyGuard, enemyCrouch);

    let specialMult = 1;
    if (state.specialActive && !isEnemy && playerStats.special?.damageMult) specialMult = playerStats.special.damageMult;
    if (isEnemy && stats.attacks?.[actionId]?.rageScale && ai.personalityKey === 'escalating') {
      const hpLost = 1 - state.enemyHp / state.enemyMax;
      specialMult *= 1 + hpLost * 0.5;
    }

    let dmg = calculateContextDamage(atk, {
      defenderBlocking,
      defenderIdle,
      comboHitIndex: isEnemy ? 0 : state.playerCombo,
      staminaPct,
      specialMult,
      guardBlocks,
      amplified: !!state.amplifyNext,
    });
    if (!isEnemy) state.amplifyNext = false;

    if (!isEnemy && stats.attacks?.[actionId]?.critChance && Math.random() < stats.attacks[actionId].critChance) {
      dmg = stats.attacks[actionId].critDamage || Math.round(dmg * 1.5);
    }

    return {
      miss: false,
      damage: dmg,
      knockback: atk.knockback || stats.attacks?.[actionId]?.knockback || 0,
      label: atk.label || actionId.replace(/_/g, ' '),
      critical: defenderIdle && !defenderBlocking && !guardBlocks,
      blocked: guardBlocks,
      burn: atk.burn || 0,
      slow: atk.slow || 0,
      stun: atk.stun || 0,
      hitStun: atk.hitStun || 8,
      blockStun: atk.blockStun || 10,
      knockdown: !!atk.knockdown,
      cancelWindowStart: atk.cancelWindowStart,
      cancelWindowEnd: atk.cancelWindowEnd,
      actionId,
      atk,
    };
  }

  function resolvePlayerAttack(actionId, isEnemy = false) {
    const prepared = prepareAttack(actionId, isEnemy);
    if (!prepared) return null;
    return resolveImpact(prepared);
  }

  // ── Status effects — burning (DoT), frozen (slow), stunned ─────────────────
  const fx = {
    enemyBurn: 0, enemyBurnDps: 0, enemySlow: 0, enemyStun: 0,
    playerBurn: 0, playerBurnDps: 0, playerSlow: 0, playerStun: 0,
    burnTick: 0,
  };

  function applyStatusEffects(target, opts) {
    if (opts.burn) {
      if (target === 'enemy') { fx.enemyBurn = 3; fx.enemyBurnDps = opts.burn; }
      else { fx.playerBurn = 3; fx.playerBurnDps = opts.burn; }
      setFeedback('Burning! 🔥', 'special');
    }
    if (opts.slow) {
      if (target === 'enemy') fx.enemySlow = 2;
      else fx.playerSlow = 2;
      setFeedback('Frozen! ❄️', 'special');
    }
    if (opts.stun) {
      if (target === 'enemy') { fx.enemyStun = opts.stun; }
      else { fx.playerStun = opts.stun; state.staggered = true; state.staggerTimer = opts.stun; }
      setFeedback('Stunned! ⚡', 'special');
    }
  }

  function tickStatusEffects(dt) {
    // Burn damage-over-time, applied once per second
    fx.burnTick += dt;
    if (fx.burnTick >= 1) {
      fx.burnTick = 0;
      if (fx.enemyBurn > 0 && !state.over) {
        state.enemyHp = Math.max(0, state.enemyHp - fx.enemyBurnDps);
        addDamageNumber(fx.enemyBurnDps, 'enemy');
        if (state.enemyHp <= 0 && mode !== 'training') handleEnemyDefeated();
      }
      if (fx.playerBurn > 0 && !state.over && mode !== 'training') {
        state.playerHp = Math.max(1, state.playerHp - fx.playerBurnDps);
        addDamageNumber(fx.playerBurnDps, 'player');
      }
    }
    fx.enemyBurn = Math.max(0, fx.enemyBurn - dt);
    fx.playerBurn = Math.max(0, fx.playerBurn - dt);
    fx.enemySlow = Math.max(0, fx.enemySlow - dt);
    fx.playerSlow = Math.max(0, fx.playerSlow - dt);
    fx.enemyStun = Math.max(0, fx.enemyStun - dt);
    fx.playerStun = Math.max(0, fx.playerStun - dt);

    // Surface active effects in the HUD status list
    const labels = [];
    if (fx.playerBurn > 0) labels.push('🔥 Burning');
    if (fx.playerSlow > 0) labels.push('❄️ Frozen');
    if (fx.playerStun > 0) labels.push('⚡ Stunned');
    const base = state.statusEffects.filter((s) => !['🔥 Burning', '❄️ Frozen', '⚡ Stunned'].includes(s));
    state.statusEffects = [...base, ...labels];
  }

  function doAction(actionId, params = {}, source = 'player') {
    if (state.over || state.betweenRounds) return;
    if (source === 'player') recordPlayerAction(memory, actionId);

    const mkPassive = ['block', 'crouch', 'advance_step', 'retreat_step', 'jump', 'back_dash',
      'detect_enemy', 'check_distance', 'check_health', 'check_enemy_health', 'detect_attack'];
    if (source === 'player' && !mkPassive.includes(actionId)) {
      state.underAttack = false;
      if (!['high_guard', 'mid_guard', 'low_guard', 'crouch_block', 'parry'].includes(actionId)) {
        state.blocking = false;
      }
      state.dodging = false;
      state.parrying = false;
    }

    if (actionId === 'energy_bolt_amplify') {
      actionId = 'energy_bolt';
      state.amplifyNext = true;
      spendPlayerStamina(STAMINA.AMPLIFY_COST);
    }

    if (['block', 'defend', 'fortify', 'prismatic_shield', 'rage_shield'].includes(actionId)) {
      if (source === 'enemy') {
        ai.blocking = true;
        ai.blockTimer = 0.6;
        return;
      }
      if (state.guardBroken) return;
      state.blocking = true;
      state.crouching = false;
      state.playerGuard = 'back';
      playMeshAnim(playerMesh, 'block', 0.4);
      return;
    }
    if (actionId === 'crouch') {
      state.crouching = true;
      state.playerGuard = 'crouch';
      return;
    }
    if (actionId === 'jump') {
      if (state.jumping || state.knockdown) return;
      spendPlayerStamina(STAMINA.JUMP);
      state.jumping = true;
      state.jumpTimer = framesToSeconds(IMPACT.JUMP_FRAMES);
      playMeshAnim(playerMesh, 'dodge', 0.35);
      return;
    }
    if (actionId === 'back_dash') {
      if (state.playerStamina < STAMINA.BACK_DASH) return;
      spendPlayerStamina(STAMINA.BACK_DASH);
      movePlayer(-DISTANCE.BACK_DASH);
      setFeedback('Back dash!', 'move');
      return;
    }
    if (['high_guard'].includes(actionId)) {
      if (source === 'enemy') { ai.blocking = true; ai.blockTimer = 0.6; return; }
      state.blocking = true; state.playerGuard = 'high'; setFeedback('High guard', 'block'); return;
    }
    if (['mid_guard'].includes(actionId)) {
      if (source === 'enemy') { ai.blocking = true; ai.blockTimer = 0.6; return; }
      state.blocking = true; state.playerGuard = 'mid'; setFeedback('Mid guard', 'block'); return;
    }
    if (['low_guard', 'crouch_block'].includes(actionId)) {
      if (source === 'enemy') { ai.blocking = true; ai.blockTimer = 0.6; return; }
      state.blocking = true; state.crouching = true; state.playerGuard = 'low';
      playMeshAnim(playerMesh, 'block', 0.55);
      setFeedback('Crouch block', 'block'); return;
    }
    if (['parry'].includes(actionId)) {
      state.parrying = true;
      spendPlayerStamina(STAMINA.PARRY);
      setFeedback('Parry stance…', 'block');
      return;
    }
    if (['dodge', 'teleport', 'wall_run'].includes(actionId)) {
      if (source === 'enemy') {
        ai.dodging = true;
        ai.dodgeTimer = 0.4;
        return;
      }
      if (state.playerStamina < STAMINA.DODGE) { setFeedback('Too tired to dodge!', 'hurt'); return; }
      spendPlayerStamina(STAMINA.DODGE);
      state.dodging = true;
      setFeedback('Dodge!', 'dodge');
      return;
    }
    if (['detect_enemy', 'check_distance', 'check_health', 'check_enemy_health', 'detect_attack'].includes(actionId)) return;

    if (actionId === 'move_toward_enemy' || actionId === 'advance_step') {
      const speedMult = staminaSpeedMult(state.playerStamina / state.playerStaminaMax);
      if (source === 'player') {
        if (state._stepCooldown > 0) return;
        state._stepCooldown = 0.32;
        spendPlayerStamina(STAMINA.STEP);
        movePlayer(DISTANCE.STEP * speedMult);
        playMeshAnim(playerMesh, 'advance', 0.38);
        playCombatActionSound('advance');
        setFeedback('Advance!', 'move');
      } else {
        state.enemyStamina = Math.max(0, state.enemyStamina - STAMINA.STEP);
        moveEnemy(-DISTANCE.STEP);
      }
      return;
    }
    if (actionId === 'move_away_enemy' || actionId === 'retreat_step') {
      const speedMult = staminaSpeedMult(state.playerStamina / state.playerStaminaMax);
      if (source === 'player') {
        if (state._stepCooldown > 0) return;
        state._stepCooldown = 0.32;
        spendPlayerStamina(STAMINA.STEP);
        movePlayer(-DISTANCE.STEP * speedMult);
        playMeshAnim(playerMesh, 'retreat', 0.38);
        setFeedback('Retreat!', 'move');
      } else {
        state.enemyStamina = Math.max(0, state.enemyStamina - STAMINA.STEP);
        moveEnemy(DISTANCE.STEP);
      }
      return;
    }
    if (['strafe_left', 'strafe_right'].includes(actionId)) {
      spendPlayerStamina(STAMINA.SIDE_STEP);
      setFeedback('Sidestep!', 'move');
      return;
    }
    if (actionId === 'use_special' || actionId.endsWith('_mode') || actionId.endsWith('_rage') || actionId.endsWith('_fusion') || actionId.endsWith('_assassination') || actionId === 'last_stand') {
      const meterReady = (state.specialMeter || 0) >= 80 || state.rageLevel >= 3;
      if (!meterReady && !state.specialUsed) {
        if (source === 'player') setFeedback('Special meter not full!', 'miss');
        return;
      }
      if (!state.specialUsed) {
        state.specialActive = true;
        state.specialTimer = playerStats.special?.duration || 5;
        state.specialUsed = true;
        setFeedback('SPECIAL ACTIVATED!', 'special');
      }
      return;
    }

    const prepared = prepareAttack(actionId, source === 'enemy');
    if (!prepared) {
      if (source === 'player') resetCombo();
      return;
    }

    const isHeavy = actionId.includes('heavy');
    const anim = ATTACK_ANIM[actionId] || 'jab';
    const { timing } = prepared;
    const isKickMove = ['kick', 'roundhouse', 'heavy_kick', 'sweep'].includes(anim);
    const lockKey = source === 'enemy' ? 'enemy' : 'player';
    const mesh = source === 'enemy' ? enemyMesh : playerMesh;
    const combatCtrl = source === 'enemy' ? enemyCombat : playerCombat;
    const strikeSide = params.side || defaultStrikeSide(actionId);
    const skelDur = combatCtrl?.getAnimDuration?.(actionId) || 0;
    const visDur = skelDur > 0
      ? skelDur
      : visualAnimDuration(timing.animDuration, challenge, anim);
    let hitConnected = false;

    actorLock[lockKey] = visDur;
    if (source === 'player') {
      state.playerCanAct = false;
      state.playerAnimTimer = visDur;
      state.playerCurrentAction = actionId;
    } else {
      state.enemyCanAct = false;
      state.enemyAnimTimer = visDur;
      state.enemyCurrentAction = actionId;
    }

    const skeletonAttack = combatCtrl?.tryAttack?.(actionId, strikeSide);
    if (!skeletonAttack) {
      playMeshAnim(mesh, anim, visDur);
    }
    if (source === 'player') playCombatActionSound(actionId);

    emitCombatEvent('attack_windup', {
      actionId, heavy: isHeavy, source,
      x: source === 'player' ? state.playerX : state.enemyX,
      z: 0,
    });

    // Kicks extend the leg — use a smaller body lunge than punches
    if (source === 'player') state.playerLunge = isKickMove ? (isHeavy ? 0.14 : 0.09) : (isHeavy ? 0.18 : 0.1);
    else state.enemyLunge = isKickMove ? (isHeavy ? 0.14 : 0.09) : (isHeavy ? 0.18 : 0.1);

    pendingHits.push({
      t: timing.impactAt,
      fn: () => {
        if (state.over) return;
        const resolved = resolveImpact(prepared);
        if (resolved.miss) {
          if (source === 'player') {
            setFeedback('Miss!', 'miss');
            addDamageNumber(0, 'enemy', { miss: true });
          }
          return;
        }
        if (source === 'enemy') {
          state.underAttack = true;
          if (resolved.blocked && state.blocking) {
            addDamageNumber(resolved.damage, 'player', { blocked: true });
            setFeedback(`Blocked! -${resolved.damage}`, 'block');
            state.playerHitStun = Math.max(state.playerHitStun, framesToSeconds(resolved.blockStun || 10));
            playBlockSound();
            playMeshAnim(playerMesh, 'block', 0.35);
          } else {
            applyDamageToPlayer(resolved.damage, {
              canParry: true, label: resolved.label, critical: resolved.critical,
              atk: resolved.atk, blockStun: resolved.blockStun, hitStun: resolved.hitStun,
              knockdown: resolved.knockdown, actionId: resolved.actionId,
            });
            if (!state.dodging && !state.parrying) applyStatusEffects('player', resolved);
          }
        } else {
          if (resolved.blocked && ai.blocking) {
            hitConnected = true;
            addDamageNumber(resolved.damage, 'enemy', { blocked: true });
            setFeedback(`Blocked! -${resolved.damage}`, 'block');
            state.enemyHitStun = Math.max(state.enemyHitStun, framesToSeconds(resolved.blockStun || 10));
            playBlockSound();
            if (enemyMesh?.userData.setAnimState) {
              enemyMesh.userData.setAnimState(isKickAction(resolved.actionId, resolved.atk) ? 'block_kick' : 'block', 0.35);
            }
          } else {
            hitConnected = true;
            applyDamageToEnemy(resolved.damage, resolved);
            applyStatusEffects('enemy', resolved);
          }
        }
        syncHealthVisuals();
      },
    });

    pendingHits.push({
      t: visDur,
      fn: () => {
        if (source === 'player' && !hitConnected) {
          state.lastHitConnected = false;
          state.hitConfirmWindow = 0;
          resetCombo();
        }
        actorLock[lockKey] = 0;
        if (source === 'player') {
          state.playerCanAct = true;
          state.playerAnimTimer = 0;
          state.playerCurrentAction = null;
        } else {
          state.enemyCanAct = true;
          state.enemyAnimTimer = 0;
          state.enemyCurrentAction = null;
        }
      },
    });
  }

  function getAiContext() {
    return {
      mode,
      distance: state.distance,
      enemyHpPct: state.enemyHp / state.enemyMax,
      playerHpPct: state.playerHp / state.playerMax,
      playerBlocking: state.blocking,
      playerDodging: state.dodging,
      playerAttacking: ['jab', 'cross', 'hook', 'uppercut', 'attack', 'attack_light', 'attack_heavy', 'light_punch', 'heavy_punch', 'light_kick', 'low_kick', 'high_kick', 'heavy_kick', 'roundhouse', 'sweep', 'kick'].includes(memory.recentActions.slice(-1)[0]),
    };
  }

  const combat = {
    // ═══════════════════════════════════════════════════════════════════════════
    // REALISTIC COMBAT FSM ACCESS (for block code integration)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /** Get player's combat FSM for direct state transitions */
    getPlayerFSM() {
      return playerFSM;
    },
    
    /** Get enemy's combat FSM */
    getEnemyFSM() {
      return enemyFSM;
    },
    
    /** Get player skeleton for animation */
    getPlayerSkeleton() {
      return playerSkeleton;
    },
    
    /** Get enemy skeleton for animation */
    getEnemySkeleton() {
      return enemySkeleton;
    },
    
    /**
     * Execute a block code combat command
     * Maps block names to FSM state transitions
     */
    executeBlockCommand(blockCommand, side = 'right') {
      const context = {
        side,
        distance: state.distance,
      };
      
      const result = (typeof executeCombatBlock === 'function' && playerFSM)
        ? executeCombatBlock(playerFSM, blockCommand, context)
        : null;
      
      // If it's a movement command, handle it
      if (result?.action === 'move') {
        if (result.direction > 0) {
          movePlayer(result.distance);
        } else {
          movePlayer(-result.distance);
        }
      }
      
      // If FSM transition succeeded, also trigger the legacy animation
      if (result === true) {
        // Map FSM states to legacy actions
        const fsmToAction = {
          [CombatState.LIGHT_KICK]: 'low_kick',
          [CombatState.HEAVY_KICK]: 'heavy_kick',
          [CombatState.LIGHT_PUNCH]: 'jab',
          [CombatState.HEAVY_PUNCH]: 'cross',
        };
        const actionId = playerFSM ? fsmToAction[playerFSM.currentState] : null;
        if (actionId) {
          doAction(actionId, { side }, 'player');
        }
      }
      
      return result;
    },
    
    /** Restart the fight from scratch — called on every Simulate/Restart press */
    reset() {
      Object.assign(state, makeInitialState());
      pendingHits.length = 0;
      actorLock.player = 0;
      actorLock.enemy = 0;
      Object.assign(fx, {
        enemyBurn: 0, enemyBurnDps: 0, enemySlow: 0, enemyStun: 0,
        playerBurn: 0, playerBurnDps: 0, playerSlow: 0, playerStun: 0,
        burnTick: 0,
      });
      ai.state = AI_STATES.ASSESS;
      ai.actionCooldown = 0;
      ai.stateTimer = 0;
      ai.blocking = false;
      ai.blockTimer = 0;
      ai.dodging = false;
      ai.dodgeTimer = 0;
      memory.fightTime = 0;
      memory.recentActions.length = 0;
      memory.adaptationLevel = 0;
      
      playerCombat?.reset?.();
      enemyCombat?.reset?.();
      hitStopTimer = 0;
      hitStopTimeScale = 1;
      playerMesh?.userData?.setTimeScale?.(1);
      enemyMesh?.userData?.setTimeScale?.(1);
      
      syncMesh();
      if (enemyMesh?.userData.setAnimState) enemyMesh.userData.setAnimState('idle', 0.1);
    },
    setPlayerMesh(mesh) {
      playerMesh = mesh;
      const ctrl = attachCombatController(mesh, false);
      syncCombatRefs(ctrl, false);
    },
    setEnemyMesh(mesh) {
      enemyMesh = mesh;
      const ctrl = attachCombatController(mesh, true);
      syncCombatRefs(ctrl, true);
    },
    setOnCombatEvent(fn) {
      onEvent = fn;
    },
    getSensors() {
      const band = getDistanceBand(state.distance);
      return {
        enemyClose: state.distance <= DISTANCE.OPTIMAL_MAX,
        enemyFar: state.distance > DISTANCE.OPTIMAL_MAX,
        inRange: state.distance >= DISTANCE.OPTIMAL_MIN && state.distance <= DISTANCE.OPTIMAL_MAX,
        underAttack: state.underAttack,
        healthLow: state.playerHp / state.playerMax < 0.3,
        healthPct: state.playerHp / state.playerMax,
        enemyHealthPct: state.enemyHp / state.enemyMax,
        distance: state.distance,
        distanceLabel: band.label,
        distanceBand: band.id,
        staminaPct: state.playerStamina / state.playerStaminaMax,
        staminaLow: state.playerStamina / state.playerStaminaMax < 0.3,
        comboCount: state.playerCombo,
        aiState: ai.state,
        inClinch: state.distance < DISTANCE.CLINCH,
      };
    },
    isOver: () => state.over,
    getState: () => ({
      active: true,
      ...state,
      useBoxingRounds: !!challenge.useBoxingRounds,
      distanceBand: getDistanceBand(state.distance),
      fightPhase: state.fightPhase,
      aiPersonality: ai.personalityKey,
      adaptationLevel: memory.adaptationLevel,
      patternHint: memory.patternHint,
      specialMeterPct: Math.min(1, (state.specialMeter || 0) / 100),
      specialReady: (state.specialMeter || 0) >= 80 || state.rageLevel >= 3,
      energyPct: state.specialActive
        ? Math.max(0, state.specialTimer / (playerStats.special?.duration || 5))
        : Math.min(1, (state.specialMeter || 0) / 100),
      enemyStaminaPct: state.enemyStamina / STAMINA.MAX,
    }),
    releaseBlock() {
      state.blocking = false;
      state.playerGuard = 'back';
    },
    releaseCrouch() {
      state.crouching = false;
      if (!state.blocking) state.playerGuard = 'back';
    },
    doAction: (actionId, params) => doAction(actionId, params, 'player'),
    tick(dt) {
      // ═══════════════════════════════════════════════════════════════════════════
      // HITSTOP SYSTEM - Freeze frame on impact for weight/impact feel
      // ═══════════════════════════════════════════════════════════════════════════
      const timeScale = updateHitStop(dt);
      const scaledDt = dt * timeScale;
      
      // Biomechanical skeleton → mesh rig animation
      if (timeScale > 0.1) {
        playerCombat?.tick?.(scaledDt);
        enemyCombat?.tick?.(scaledDt);
      }
      
      memory.fightTime += scaledDt;
      updateAdaptation(memory, memory.fightTime, difficulty);
      state.aiState = ai.state;

      // Process scheduled impact frames + recovery unlocks
      for (let i = pendingHits.length - 1; i >= 0; i--) {
        pendingHits[i].t -= dt;
        if (pendingHits[i].t <= 0) {
          pendingHits[i].fn();
          pendingHits.splice(i, 1);
        }
      }
      if (actorLock.player > 0) {
        actorLock.player = Math.max(0, actorLock.player - dt);
        state.playerAnimTimer = actorLock.player;
        if (actorLock.player <= 0) state.playerCanAct = true;
      }
      if (actorLock.enemy > 0) {
        actorLock.enemy = Math.max(0, actorLock.enemy - dt);
        state.enemyAnimTimer = actorLock.enemy;
        if (actorLock.enemy <= 0) state.enemyCanAct = true;
      }

      syncHealthVisuals();

      if (state.feedbackTimer > 0) {
        state.feedbackTimer -= dt;
        if (state.feedbackTimer <= 0) state.feedback = null;
      }
      if (state.specialTimer > 0) {
        state.specialTimer -= dt;
        if (state.specialTimer <= 0) state.specialActive = false;
      }
      if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) resetCombo();
      }
      if (state.hitConfirmWindow > 0) {
        state.hitConfirmWindow -= dt;
        if (state.hitConfirmWindow <= 0) state.lastHitConnected = false;
      }
      if (state.guardBrokenTimer > 0) {
        state.guardBrokenTimer -= dt;
        if (state.guardBrokenTimer <= 0) state.guardBroken = false;
      }
      if (state.jumpTimer > 0) {
        state.jumpTimer -= dt;
        if (state.jumpTimer <= 0) state.jumping = false;
      }
      if (state.cancelWindowTimer > 0) {
        state.cancelWindowTimer -= dt;
      }
      if (state.enemyHitStun > 0) {
        state.enemyHitStun = Math.max(0, state.enemyHitStun - dt);
      }
      if (state.playerHitStun > 0) {
        state.playerHitStun = Math.max(0, state.playerHitStun - dt);
      }
      if (state.enemyKnockdownTimer > 0) {
        state.enemyKnockdownTimer -= dt;
        if (state.enemyKnockdownTimer <= 0) {
          state.enemyKnockdown = false;
          if (enemyMesh?.userData.setAnimState) enemyMesh.userData.setAnimState('idle', 0.2);
        }
      }
      if (state.staggerTimer > 0) {
        state.staggerTimer -= dt;
        if (state.staggerTimer <= 0) state.staggered = false;
      }
      if (state.knockdownTimer > 0) {
        state.knockdownTimer -= dt;
        if (state.knockdownTimer <= 0) {
          state.knockdown = false;
          // No automatic HP tax for standing up — real MK wake-up is a free
          // strategic choice (block/attack/roll), not a damage-over-time drain.
          setFeedback('Back up!', 'move');
        }
      }

      state.damageNumbers = state.damageNumbers.filter((d) => {
        d.y -= dt * 8;
        return d.y > 5;
      });

      if (state.betweenRounds) {
        state.restTimer -= dt;
        if (state.restTimer <= 0) {
          state.betweenRounds = false;
          setFeedback(`Round ${state.boxingRound} — Fight!`, 'special');
        }
        return;
      }

      regenStamina(dt);
      tickStatusEffects(dt);

      // Berserker passive regen out of combat pressure
      if (playerStats.regenPassive && !state.blocking && !state.staggered && state.playerHp < state.playerMax) {
        state.playerHp = Math.min(state.playerMax, state.playerHp + playerStats.regenPassive * dt * 0.15);
      }

      // Match time limit — skip when boxing rounds handle timing separately
      if (!state.over && (challenge.timeLimit || 0) > 0 && mode !== 'training' && !challenge.useBoxingRounds) {
        state.roundElapsed += dt;
        state.roundTimeLeft = Math.max(0, challenge.timeLimit - state.roundElapsed);
        state.fightPhase = getFightPhase(state.roundElapsed, challenge.timeLimit);
        if (state.roundTimeLeft <= 0) {
          state.over = true;
          state.won = state.playerScore >= state.enemyScore;
          if (state.won) { playVictorySound(); playMeshAnim(playerMesh, 'victory', 3); }
          else playDefeatSound();
          setFeedback(state.won ? 'Win on points! 🏆' : 'Time up!', state.won ? 'win' : 'lose');
        }
      }

      if (!state.over && challenge.useBoxingRounds && (mode === 'sparring' || mode === 'strategy')) {
        state.roundElapsed += dt;
        state.roundTimeLeft = Math.max(0, (challenge.timeLimit || ROUNDS.DURATION) - state.roundElapsed);
        state.fightPhase = getFightPhase(state.roundElapsed, challenge.timeLimit || ROUNDS.DURATION);
        if (state.roundTimeLeft <= 0 && state.enemyHp > 0 && !state.over) {
          if (challenge.boxingPointsMode) {
            startNextBoxingRound(null);
          } else if (state.playerScore > state.enemyScore) {
            state.roundWinsPlayer += 1;
            if (state.roundWinsPlayer >= ROUNDS.WINS_NEEDED) { state.over = true; state.won = true; setFeedback('Win by points! 🏆', 'win'); }
            else startNextBoxingRound(true);
          } else {
            state.roundWinsEnemy += 1;
            if (state.roundWinsEnemy >= ROUNDS.WINS_NEEDED) { state.over = true; state.won = false; setFeedback('Lost on points!', 'lose'); }
            else startNextBoxingRound(false);
          }
        }
      }

      // Training still runs the AI — the dummy advances and throws slow jabs
      // (tickEnemyAI's training branch) so both robots actually fight.
      if (state.over) return;

      if (ai.blockTimer > 0) { ai.blockTimer -= dt; if (ai.blockTimer <= 0) ai.blocking = false; }
      if (ai.dodgeTimer > 0) { ai.dodgeTimer -= dt; if (ai.dodgeTimer <= 0) ai.dodging = false; }

      // Stunned enemies can't act; frozen enemies act at half speed
      if (fx.enemyStun > 0) return;
      const decision = tickEnemyAI(ai, getAiContext(), fx.enemySlow > 0 ? dt * 0.5 : dt, enemyStats);
      if (decision?.action) {
        // Animate block/dodge on enemy mesh
        if (enemyMesh?.userData.setAnimState) {
          if (decision.type === 'defense') {
            enemyMesh.userData.setAnimState(decision.action === 'dodge' ? 'dodge' : 'block', 0.55);
          } else if (decision.type === 'move') {
            enemyMesh.userData.setAnimState(decision.action === 'advance_step' ? 'advance' : 'retreat', 0.4);
          }
        }
        doAction(decision.action, {}, 'enemy');
      }

      // Stagger/knockdown animations when player hits enemy
      if (enemyMesh?.userData.setAnimState) {
        if (state.enemyHp <= 0) enemyMesh.userData.setAnimState('knockdown', 2.0);
      }

      if (state._stepCooldown > 0) state._stepCooldown = Math.max(0, state._stepCooldown - dt);

      // Fight choreography — decay lunges, no constant circling
      state.playerLunge = Math.max(0, state.playerLunge - dt * 2.2);
      state.enemyLunge = Math.max(0, state.enemyLunge - dt * 2.2);
      state.playerZ *= Math.max(0, 1 - dt * 4);
      state.enemyZ *= Math.max(0, 1 - dt * 4);

      // Smooth knockback velocity
      if (state._enemyKnockbackVel > 0.001) {
        const step = state._enemyKnockbackVel * dt * 3.5;
        moveEnemy(step);
        state._enemyKnockbackVel *= Math.max(0, 1 - dt * 5);
      }
      if (state._playerKnockbackVel > 0.001) {
        const step = state._playerKnockbackVel * dt * 3.5;
        movePlayer(-step);
        state._playerKnockbackVel *= Math.max(0, 1 - dt * 5);
      }

      // Sustained block pose (only when not mid-attack)
      if (state.blocking && actorLock.player <= 0 && playerMesh?.userData?.setAnimState) {
        playerMesh.userData.setAnimState('block', 0.5);
      }

      // Visual distance — fighters close enough for gloves to connect
      const visMid = (state.playerX + state.enemyX) / 2;
      const VIS_GAP = 0.78;
      state.playerMeshX = visMid + (state.playerX - visMid) * VIS_GAP + state.playerLunge;
      const enemyMeshTargetX = visMid + (state.enemyX - visMid) * VIS_GAP - state.enemyLunge;
      state.enemyMeshX = enemyMeshTargetX; // exposed so the camera can frame the true visual midpoint

      // Keep enemy mesh grounded and GLIDE toward its logical position —
      // instant snapping is what made movement look unnatural.
      if (enemyMesh) {
        // Preserve the arena's ground alignment (feet on the ring canvas) —
        // forcing y=0 buried the fighter waist-deep in the platform.
        if (enemyMesh.userData.groundY != null) enemyMesh.position.y = enemyMesh.userData.groundY;
        enemyMesh.position.x += (enemyMeshTargetX - enemyMesh.position.x) * Math.min(1, dt * 4.5);
        enemyMesh.position.z += (state.enemyZ - enemyMesh.position.z) * Math.min(1, dt * 3);
        enemyMesh.rotation.y = -Math.PI / 2;
      }
      state.playerFaceAngle = Math.PI / 2;
    },
  };

  syncMesh();
  if (enemyMesh) {
    const ctrl = attachCombatController(enemyMesh, true);
    syncCombatRefs(ctrl, true);
  }
  return combat;
}
