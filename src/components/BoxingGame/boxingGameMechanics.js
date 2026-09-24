/**
 * BoxingGameMechanics — scoring, knockdowns, rounds, judge decisions, combat sync.
 */
import { ATTACKS, MATCH, getComboMultiplier, COMBAT_TO_ATTACK } from './boxingGameConstants.js';

export function calcHitPoints(attackKey, { comboHits = 1, blocked = false } = {}) {
  const atk = ATTACKS[attackKey] || ATTACKS.JAB;
  let pts = atk.points;
  if (blocked) pts = Math.round(pts * MATCH.BLOCK_CHIP);
  pts = Math.round(pts * getComboMultiplier(comboHits));
  return { points: pts, attack: atk, blocked };
}

export function resolveRoundWinner(playerScore, opponentScore) {
  if (playerScore > opponentScore) return 'player';
  if (opponentScore > playerScore) return 'opponent';
  return 'draw';
}

export function tallyJudgeCard(roundWinners) {
  let playerRounds = 0;
  let opponentRounds = 0;
  roundWinners.forEach((w) => {
    if (w === 'player') playerRounds += 1;
    if (w === 'opponent') opponentRounds += 1;
  });
  if (playerRounds >= MATCH.ROUNDS_TO_WIN) return { winner: 'player', method: 'DECISION' };
  if (opponentRounds >= MATCH.ROUNDS_TO_WIN) return { winner: 'opponent', method: 'DECISION' };
  if (playerRounds > opponentRounds) return { winner: 'player', method: 'DECISION' };
  if (opponentRounds > playerRounds) return { winner: 'opponent', method: 'DECISION' };
  return { winner: 'draw', method: 'DECISION' };
}

export function buildJudgeCardEntry(round, playerScore, opponentScore) {
  return { round, winner: resolveRoundWinner(playerScore, opponentScore), playerScore, opponentScore };
}

export function mapCombatActionToAttack(combatActionId) {
  return COMBAT_TO_ATTACK[combatActionId] || 'JAB';
}

export function shouldCauseKnockdown(attackKey) {
  return !!ATTACKS[attackKey]?.causesKnockdown;
}

export function getStateLabel(state) {
  const labels = {
    IDLE: 'READY', WALKING: 'MOVING', ATTACKING: 'ATTACKING',
    BLOCKING: 'DEFENDING', KNOCKDOWN: 'KNOCKED DOWN', STUNNED: 'STUNNED',
  };
  return labels[state] || state;
}

export function getStateColor(state) {
  if (state === 'BLOCKING') return '#00bfff';
  if (state === 'ATTACKING') return '#ff3333';
  if (state === 'KNOCKDOWN') return '#ff0000';
  if (state === 'WALKING') return '#ffd700';
  return '#aaaaaa';
}

export function getHealthColor(pct) {
  if (pct > 0.75) return '#00ff00';
  if (pct > 0.5) return '#ffff00';
  if (pct > 0.25) return '#ff6600';
  return '#ff0000';
}

export function validateAttack({ stamina, isAttacking }) {
  if (stamina < 8) return { ok: false, reason: 'exhausted' };
  if (isAttacking) return { ok: false, reason: 'busy' };
  return { ok: true };
}

export function syncFromCombatState(combat, prev = {}) {
  if (!combat?.active) return null;

  let playerState = 'IDLE';
  if (combat.blocking) playerState = 'BLOCKING';
  else if (combat.playerCurrentAction) playerState = 'ATTACKING';
  else if (combat.knockdown) playerState = 'KNOCKDOWN';
  else if (combat.staggered) playerState = 'STUNNED';

  let opponentState = 'IDLE';
  if (combat.enemyKnockdown) opponentState = 'KNOCKDOWN';
  else if (combat.enemyCurrentAction) opponentState = 'ATTACKING';

  const roundTimeRemaining = combat.roundTimeLeft ?? MATCH.ROUND_DURATION;
  const currentRound = combat.boxingRound ?? combat.round ?? 1;
  const isResting = !!combat.betweenRounds;

  let matchState = 'ROUND_ACTIVE';
  if (combat.over) matchState = 'MATCH_OVER';
  else if (isResting) matchState = 'REST';
  else if (roundTimeRemaining <= 0 && !isResting) matchState = 'ROUND_END';

  const out = {
    playerHealth: combat.playerHp ?? MATCH.MAX_HEALTH,
    opponentHealth: combat.enemyHp ?? MATCH.MAX_HEALTH,
    playerStamina: combat.playerStamina ?? MATCH.MAX_STAMINA,
    opponentStamina: Math.round(combat.enemyStamina ?? MATCH.MAX_STAMINA),
    playerPosition: { x: combat.playerMeshX ?? combat.playerX ?? -1.5, y: 0, z: combat.playerZ ?? 0 },
    opponentPosition: { x: combat.enemyMeshX ?? combat.enemyX ?? 1.5, y: 0, z: combat.enemyZ ?? 0 },
    playerRotation: { y: combat.playerFaceAngle ?? Math.PI / 2 },
    opponentRotation: { y: -Math.PI / 2 },
    playerState, opponentState,
    playerAnimation: combat.playerCurrentAction || 'idle',
    opponentAnimation: combat.enemyCurrentAction || 'idle',
    playerCombo: combat.playerCombo ?? 0,
    currentRound, roundTimeRemaining,
    isRoundActive: !combat.over && !isResting && roundTimeRemaining > 0,
    isResting, matchState,
    combatWon: !!combat.won,
    combatOver: !!combat.over,
  };

  if (combat.enemyKnockdown && !prev._enemyWasDown) out._triggerOpponentKnockdown = true;
  if (combat.knockdown && !prev._playerWasDown) out._triggerPlayerKnockdown = true;
  out._enemyWasDown = !!combat.enemyKnockdown;
  out._playerWasDown = !!combat.knockdown;
  return out;
}

export function processCombatHit({ actionId, blocked = false, comboHits = 1, attacker = 'player' }) {
  const attackKey = mapCombatActionToAttack(actionId);
  const { points, attack } = calcHitPoints(attackKey, { comboHits, blocked });
  return {
    attackKey, attackName: attack.name, points,
    damage: attack.damage, knockdown: !blocked && shouldCauseKnockdown(attackKey),
    blocked, attacker,
  };
}
