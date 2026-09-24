/**
 * Enemy AI — state machine, decision tree, personalities, adaptation, difficulty.
 */
import { DISTANCE, resolvePunch, resolveGenericAttack } from './fighting-boxing-mechanics.js';

export const AI_STATES = {
  IDLE: 'idle',
  ASSESS: 'assess',
  ATTACK: 'attack',
  DEFEND: 'defend',
  COOLDOWN: 'cooldown',
  RETREAT: 'retreat',
  AGGRESSIVE: 'aggressive',
  DESPERATE: 'desperate',
};

export const DIFFICULTY = {
  easy: {
    id: 'easy', label: 'Easy', reactionTime: 0.8, adaptStartSec: 60,
    comboMax: 2, specialHpPct: 0.5, staminaEfficiency: 0.6,
  },
  medium: {
    id: 'medium', label: 'Medium', reactionTime: 0.5, adaptStartSec: 30,
    comboMax: 3, specialHpPct: 0.4, staminaEfficiency: 0.85,
  },
  hard: {
    id: 'hard', label: 'Hard', reactionTime: 0.3, adaptStartSec: 5,
    comboMax: 4, specialHpPct: 0.35, staminaEfficiency: 1.0,
  },
  expert: {
    id: 'expert', label: 'Expert', reactionTime: 0.1, adaptStartSec: 0,
    comboMax: 5, specialHpPct: 0.35, staminaEfficiency: 1.1, predictive: true,
  },
};

export const PERSONALITY_MAP = {
  striker: 'aggressive',
  tank: 'defensive',
  blaster: 'tactical',
  ninja: 'evasive',
  berserker: 'escalating',
  dummy: 'passive',
  boss: 'escalating',
};

const PERSONALITIES = {
  passive: {
    preferRange: 'any',
    attackWeight: 0.2,
    defendWeight: 0.1,
    retreatWeight: 0,
    comboPreference: ['jab', 'light_kick', 'cross'],
  },
  aggressive: {
    preferRange: 'close',
    attackWeight: 0.85,
    defendWeight: 0.15,
    retreatWeight: 0.05,
    comboPreference: ['jab', 'cross', 'hook', 'combo_3hit', 'light_kick', 'roundhouse'],
    onPlayerDodge: 'follow_up',
  },
  defensive: {
    preferRange: 'mid',
    attackWeight: 0.35,
    defendWeight: 0.65,
    retreatWeight: 0.2,
    comboPreference: ['jab', 'cross'],
    afterBlock: 'counter',
  },
  tactical: {
    preferRange: 'far',
    attackWeight: 0.5,
    defendWeight: 0.35,
    retreatWeight: 0.45,
    comboPreference: ['fire_blast', 'ice_beam', 'jab'],
    ifCornered: 'area_attack',
  },
  evasive: {
    preferRange: 'mid',
    attackWeight: 0.45,
    defendWeight: 0.55,
    retreatWeight: 0.3,
    comboPreference: ['swift_strike', 'hook', 'jab'],
    dodgeFirst: true,
  },
  escalating: {
    preferRange: 'close',
    attackWeight: 0.5,
    defendWeight: 0.3,
    retreatWeight: 0.1,
    comboPreference: ['jab', 'cross', 'hook', 'uppercut'],
    rageScale: true,
  },
};

export function getDifficulty(challenge = {}) {
  const key = challenge.aiDifficulty || challenge.difficulty || 'medium';
  if (challenge.fightMode === 'training') return DIFFICULTY.easy;
  if (challenge.fightMode === 'boss') return DIFFICULTY.hard;
  if (challenge.fightMode === 'survival') return DIFFICULTY.hard;
  return DIFFICULTY[key] || DIFFICULTY.medium;
}

export function createEnemyMemory() {
  return {
    fightTime: 0,
    playerAttacks: 0,
    playerBlocks: 0,
    playerDodges: 0,
    playerAdvances: 0,
    playerRetreats: 0,
    recentActions: [],
    patternHint: null,
    adaptationLevel: 0,
  };
}

function pushAction(memory, action) {
  memory.recentActions.push(action);
  if (memory.recentActions.length > 12) memory.recentActions.shift();
}

export function recordPlayerAction(memory, action) {
  pushAction(memory, action);
  if (['jab', 'cross', 'hook', 'uppercut', 'light_punch', 'heavy_punch', 'attack', 'attack_light', 'attack_heavy', 'combo_3hit', 'light_kick', 'low_kick', 'high_kick', 'heavy_kick', 'roundhouse', 'sweep', 'kick'].includes(action)) {
    memory.playerAttacks += 1;
  } else if (['block', 'defend', 'high_guard', 'mid_guard', 'low_guard', 'fortify'].includes(action)) {
    memory.playerBlocks += 1;
  } else if (['dodge', 'teleport', 'strafe_left', 'strafe_right'].includes(action)) {
    memory.playerDodges += 1;
  } else if (action === 'move_toward_enemy' || action === 'advance_step') {
    memory.playerAdvances += 1;
  } else if (action === 'move_away_enemy' || action === 'retreat_step') {
    memory.playerRetreats += 1;
  }
  analyzePattern(memory);
}

function analyzePattern(memory) {
  const total = memory.playerAttacks + memory.playerBlocks + memory.playerDodges || 1;
  const atkRate = memory.playerAttacks / total;
  const blkRate = memory.playerBlocks / total;
  const dogRate = memory.playerDodges / total;
  if (atkRate > 0.55) memory.patternHint = 'aggressive';
  else if (blkRate > 0.4) memory.patternHint = 'defensive';
  else if (dogRate > 0.35) memory.patternHint = 'evasive';
  else memory.patternHint = 'mixed';
}

export function updateAdaptation(memory, fightTimeSec, diff) {
  if (fightTimeSec < diff.adaptStartSec) {
    memory.adaptationLevel = 0;
    return;
  }
  const t = fightTimeSec - diff.adaptStartSec;
  memory.adaptationLevel = Math.min(1, t / 30);
}

export function createEnemyAI(archetype, difficulty, memory) {
  const personalityKey = PERSONALITY_MAP[archetype] || 'aggressive';
  const personality = PERSONALITIES[personalityKey] || PERSONALITIES.aggressive;

  return {
    state: AI_STATES.ASSESS,
    stateTimer: 2,
    actionCooldown: 0,
    personalityKey,
    personality,
    blocking: false,
    dodging: false,
    blockTimer: 0,
    dodgeTimer: 0,
    guard: 'mid',
    stamina: 100,
    consecutiveBlocks: 0,
    specialUsed: false,
    assessDone: false,
    lastAction: null,
    comboQueue: [],
    difficulty,
    memory,
  };
}

// ── Personality-specific attack selection ─────────────────────────────────────

function rangeOk(actionId, distance, archetypeAttacks) {
  const atk = resolvePunch(actionId) || resolveGenericAttack(actionId, archetypeAttacks || {});
  if (!atk) return false;
  return distance >= atk.rangeMin && distance <= atk.rangeMax;
}

function pickFromList(ids, distance, archetypeAttacks) {
  const valid = ids.filter((id) => rangeOk(id, distance, archetypeAttacks));
  if (!valid.length) return null;
  return valid[Math.floor(Math.random() * valid.length)];
}

function pickAttack(ai, ctx, enemyStats) {
  const { distance, playerHpPct, enemyHpPct, playerBlocking, playerDodging } = ctx;
  const attacks = enemyStats.attacks || {};
  const diff = ai.difficulty;
  const adapt = ai.memory.adaptationLevel;
  const pattern = ai.memory.patternHint;

  // Always advance if too far
  if (distance > DISTANCE.OPTIMAL_MAX + 1.0) return { action: 'advance_step', type: 'move' };
  // Retreat from clinch
  if (distance < DISTANCE.CLINCH) return { action: 'retreat_step', type: 'move' };

  switch (ai.personalityKey) {
    case 'aggressive': {
      // Constant pressure — jab-cross-hook combos, follow up on dodges
      if (pattern === 'defensive' && adapt > 0.3) {
        // Player blocks a lot → use hook to go around guard
        const pick = pickFromList(['hook', 'combo_3hit', 'cross'], distance, attacks);
        if (pick) return { action: pick, type: 'attack' };
      }
      if (playerHpPct < 0.4) {
        // Player is low — press advantage with heavy combo
        const pick = pickFromList(['combo_3hit', 'cross', 'hook', 'uppercut'], distance, attacks);
        if (pick) return { action: pick, type: 'attack' };
      }
      const pick = pickFromList(['jab', 'cross', 'hook', 'combo_3hit'], distance, attacks);
      return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
    }

    case 'defensive': {
      // Block-heavy, only counter after blocks; prefers retreating when healthy
      if (playerBlocking) {
        // Player is blocking → wait or go for body shot
        return Math.random() < 0.5
          ? { action: 'block', type: 'defense' }
          : { action: pickFromList(['hook', 'uppercut', 'cross'], distance, attacks) || 'jab', type: 'attack' };
      }
      if (pattern === 'aggressive' && adapt > 0.2) {
        // Player attacks a lot → block and counter
        return Math.random() < 0.55
          ? { action: 'block', type: 'defense' }
          : { action: pickFromList(['cross', 'hook'], distance, attacks) || 'jab', type: 'attack' };
      }
      // Default defensive: mostly block, occasional jab
      if (Math.random() < 0.4) return { action: 'block', type: 'defense' };
      const pick = pickFromList(['jab', 'cross'], distance, attacks);
      return pick ? { action: pick, type: 'attack' } : { action: 'block', type: 'defense' };
    }

    case 'tactical': {
      // Maintain distance, ranged attacks, retreat when player closes
      if (distance < DISTANCE.OPTIMAL_MIN + 0.5) {
        // Too close — retreat or dodge
        return Math.random() < 0.6
          ? { action: 'retreat_step', type: 'move' }
          : { action: 'dodge', type: 'defense' };
      }
      if (pattern === 'evasive' && adapt > 0.3) {
        // Player dodges a lot → slow heavy hits that cover wide range
        const pick = pickFromList(['cross', 'combo_3hit'], distance, attacks);
        if (pick) return { action: pick, type: 'attack' };
      }
      // Prefer ranged archetype attacks; fallback to cross
      const archetypeAttackIds = Object.keys(attacks);
      const rangePick = archetypeAttackIds.length
        ? pickFromList(archetypeAttackIds, distance, attacks)
        : null;
      if (rangePick && Math.random() < 0.6) return { action: rangePick, type: 'attack' };
      const pick = pickFromList(['cross', 'jab'], distance, attacks);
      return pick ? { action: pick, type: 'attack' } : { action: 'retreat_step', type: 'move' };
    }

    case 'evasive': {
      // Dodge then counter — never just stands and trades
      if (adapt < 0.2) {
        // Early fight: mostly dodge and feel out
        if (Math.random() < 0.45) return { action: 'dodge', type: 'defense' };
      }
      if (pattern === 'aggressive') {
        // Player attacks a lot → dodge and punish
        if (Math.random() < 0.4 + adapt * 0.3) return { action: 'dodge', type: 'defense' };
        const pick = pickFromList(['hook', 'cross', 'jab'], distance, attacks);
        return pick ? { action: pick, type: 'attack' } : { action: 'dodge', type: 'defense' };
      }
      // Balanced: dodge then counter with swift strikes
      const archetypeIds = Object.keys(attacks);
      const swiftPick = archetypeIds.length ? pickFromList(archetypeIds, distance, attacks) : null;
      const pick = swiftPick || pickFromList(['hook', 'jab', 'cross'], distance, attacks);
      if (Math.random() < 0.35) return { action: 'dodge', type: 'defense' };
      return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
    }

    case 'escalating': {
      // Weak at start, increasingly dangerous as HP drops
      const fury = 1 - enemyHpPct; // 0 when healthy, 1 when nearly dead
      const attackProb = 0.3 + fury * 0.65;

      if (Math.random() > attackProb) {
        return { action: 'block', type: 'defense' };
      }
      if (fury > 0.7) {
        // Berserk mode — heavy attacks, combos, rage moves
        const archetypeIds = Object.keys(attacks);
        const ragePick = archetypeIds.length ? pickFromList(archetypeIds, distance, attacks) : null;
        const pick = ragePick || pickFromList(['combo_3hit', 'uppercut', 'hook', 'cross'], distance, attacks);
        return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
      }
      if (fury > 0.4) {
        const pick = pickFromList(['cross', 'hook', 'combo_3hit', 'uppercut'], distance, attacks);
        return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
      }
      // Early phase: light attacks
      const pick = pickFromList(['jab', 'cross'], distance, attacks);
      return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
    }

    case 'passive':
    default: {
      if (Math.random() < 0.2) return { action: null, type: 'idle' };
      if (distance < DISTANCE.OPTIMAL_MAX && Math.random() < 0.25) {
        return { action: 'block', type: 'defense' };
      }
      const pick = pickFromList(['jab', 'light_kick', 'cross'], distance, attacks);
      return pick ? { action: pick, type: 'attack' } : { action: 'advance_step', type: 'move' };
    }
  }
}

function decideStateTransition(ai, ctx) {
  const { enemyHpPct, playerHpPct, distance, playerAttacking } = ctx;
  const fury = 1 - enemyHpPct;

  if (enemyHpPct <= 0.15) return AI_STATES.DESPERATE;
  if (playerHpPct <= 0.3 && enemyHpPct > 0.45) return AI_STATES.AGGRESSIVE;

  // Personality-specific state logic
  switch (ai.personalityKey) {
    case 'defensive':
      if (playerAttacking) return AI_STATES.DEFEND;
      if (enemyHpPct < 0.5) return AI_STATES.RETREAT;
      break;
    case 'tactical':
      if (distance < DISTANCE.CLINCH + 0.5) return AI_STATES.RETREAT;
      if (playerAttacking) return AI_STATES.DEFEND;
      break;
    case 'evasive':
      if (playerAttacking) return AI_STATES.DEFEND;
      break;
    case 'escalating':
      if (fury > 0.5) return AI_STATES.AGGRESSIVE;
      break;
    case 'aggressive':
    default:
      if (distance > DISTANCE.OPTIMAL_MAX) return AI_STATES.ATTACK; // advance
      if (playerAttacking && Math.random() < 0.35) return AI_STATES.DEFEND;
      break;
  }

  if (ai.actionCooldown > 0) return AI_STATES.COOLDOWN;
  if (!ai.assessDone) return AI_STATES.ASSESS;
  return AI_STATES.ATTACK;
}

export function tickEnemyAI(ai, ctx, dt, enemyStats) {
  ai.actionCooldown = Math.max(0, ai.actionCooldown - dt);
  ai.stateTimer = Math.max(0, ai.stateTimer - dt);

  // Training dummy: advance, block, and mix punches + kicks
  if (ctx.mode === 'training') {
    if (ai.actionCooldown > 0) return { action: null, type: 'idle' };
    if (ctx.distance > DISTANCE.OPTIMAL_MAX) {
      ai.actionCooldown = 0.65;
      return { action: 'advance_step', type: 'move' };
    }
    if (ctx.playerAttacking && ctx.distance < DISTANCE.OPTIMAL_MAX + 0.3 && Math.random() < 0.35) {
      ai.actionCooldown = 1.1;
      ai.blocking = true;
      ai.blockTimer = 0.8;
      return { action: 'block', type: 'defense' };
    }
    const attacks = ['jab', 'light_kick', 'cross', 'roundhouse'];
    const pick = pickFromList(attacks, ctx.distance, enemyStats.attacks) || 'jab';
    ai.actionCooldown = 1.6 + Math.random() * 0.9;
    return { action: pick, type: 'attack' };
  }

  const nextState = decideStateTransition(ai, ctx);
  if (ai.state !== nextState && ai.stateTimer <= 0) {
    ai.state = nextState;
    ai.stateTimer = nextState === AI_STATES.ASSESS ? 2.0 : ai.difficulty.reactionTime + 0.2;
  }

  if (ai.actionCooldown > 0) return { action: null, type: 'idle' };

  let decision = { action: null, type: 'idle' };

  switch (ai.state) {
    case AI_STATES.ASSESS:
      if (ai.stateTimer <= 0) {
        ai.assessDone = true;
        ai.state = AI_STATES.ATTACK;
      }
      break;

    case AI_STATES.DEFEND: {
      // Personality determines defense style
      let defAction = 'block';
      if (ai.personalityKey === 'evasive') defAction = Math.random() < 0.7 ? 'dodge' : 'block';
      else if (ai.personalityKey === 'aggressive') defAction = Math.random() < 0.25 ? 'dodge' : 'block';
      else if (ai.personalityKey === 'tactical') defAction = Math.random() < 0.5 ? 'dodge' : 'retreat_step';
      decision = { action: defAction, type: defAction === 'retreat_step' ? 'move' : 'defense' };
      ai.actionCooldown = ai.difficulty.reactionTime + 0.35;
      ai.state = AI_STATES.COOLDOWN;
      ai.stateTimer = 0.25;
      break;
    }

    case AI_STATES.RETREAT:
      decision = { action: 'retreat_step', type: 'move' };
      ai.actionCooldown = 0.55;
      if (ctx.enemyHpPct > 0.6) ai.state = AI_STATES.ATTACK;
      break;

    case AI_STATES.DESPERATE:
      if (!ai.specialUsed) {
        decision = { action: 'use_special', type: 'special' };
        ai.specialUsed = true;
      } else {
        decision = pickAttack(ai, { ...ctx, enemyHpPct: 0 }, enemyStats); // fury=1
      }
      ai.actionCooldown = ai.difficulty.reactionTime * 0.5 + 0.25;
      break;

    case AI_STATES.AGGRESSIVE:
      decision = pickAttack(ai, { ...ctx, playerHpPct: 0 }, enemyStats); // press hard
      ai.actionCooldown = ai.difficulty.reactionTime * 0.5 + 0.3;
      break;

    case AI_STATES.COOLDOWN:
      if (ai.stateTimer <= 0) ai.state = AI_STATES.ATTACK;
      // Occasionally footstep during cooldown
      if (Math.random() < 0.15 && ctx.distance > DISTANCE.OPTIMAL_MAX) {
        decision = { action: 'advance_step', type: 'move' };
        ai.actionCooldown = 0.3;
      }
      break;

    case AI_STATES.ATTACK:
    default:
      decision = pickAttack(ai, ctx, enemyStats);
      ai.actionCooldown = ai.difficulty.reactionTime + 0.3 + Math.random() * 0.25;
      ai.state = AI_STATES.COOLDOWN;
      ai.stateTimer = ai.difficulty.reactionTime * 0.5 + 0.15;
      break;
  }

  ai.lastAction = decision.action;
  return decision;
}
