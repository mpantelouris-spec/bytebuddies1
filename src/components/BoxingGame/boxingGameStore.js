/**
 * Zustand store — professional boxing match state.
 */
import { create } from 'zustand';
import {
  MATCH, PLAYER_START, OPPONENT_START, ATTACKS,
} from './boxingGameConstants.js';
import {
  buildJudgeCardEntry, tallyJudgeCard, getStateLabel, processCombatHit,
} from './boxingGameMechanics.js';
import { getComboMultiplier } from './boxingGameConstants.js';

const initialRound = () => ({
  currentRound: 1,
  roundTimeRemaining: MATCH.ROUND_DURATION,
  isRoundActive: false,
  isResting: false,
  restTimeRemaining: 0,
  roundWinners: [],
  judgeCard: [],
});

const initialFighter = (side) => ({
  score: 0,
  totalScore: 0,
  health: MATCH.MAX_HEALTH,
  stamina: MATCH.MAX_STAMINA,
  position: side === 'player' ? { ...PLAYER_START } : { ...OPPONENT_START },
  rotation: { y: side === 'player' ? PLAYER_START.rotationY : OPPONENT_START.rotationY },
  state: 'IDLE',
  combo: 0,
  comboTime: 0,
  hitsDuringRound: [],
});

export const useBoxingGameStore = create((set, get) => ({
  ...initialRound(),
  playerScore: 0,
  playerTotalScore: 0,
  playerHealth: MATCH.MAX_HEALTH,
  playerStamina: MATCH.MAX_STAMINA,
  playerPosition: { ...PLAYER_START },
  playerRotation: { y: PLAYER_START.rotationY },
  playerState: 'IDLE',
  playerCombo: 0,
  playerComboTime: 0,
  playerHitsDuringRound: [],

  opponentScore: 0,
  opponentTotalScore: 0,
  opponentHealth: MATCH.MAX_HEALTH,
  opponentStamina: MATCH.MAX_STAMINA,
  opponentPosition: { ...OPPONENT_START },
  opponentRotation: { y: OPPONENT_START.rotationY },
  opponentState: 'IDLE',
  opponentCombo: 0,
  opponentComboTime: 0,
  opponentHitsDuringRound: [],

  isPlayerKnockedDown: false,
  playerKnockdownCount: 0,
  playerKnockdownTime: 0,
  isOpponentKnockedDown: false,
  opponentKnockdownCount: 0,
  opponentKnockdownTime: 0,

  matchState: 'LOADING',
  winner: null,
  winMethod: null,
  judgeCard: [],

  lastHitPoints: 0,
  lastComboMult: 1,
  lastHitLabel: '',
  centerMessage: '',
  stateLabel: 'READY',
  screenShake: 0,
  floatingHits: [],

  _combatBridge: null,
  _countAccumulator: 0,
  _lastCombatRound: 1,
  _wasBetweenRounds: false,
  _roundEndHandled: false,
  _aggressionTimer: 0,
  _defenseTimer: 0,
  roundSummary: null,

  setCombatBridge(ref) {
    set({ _combatBridge: ref });
  },

  setPlayerPosition(x, y, z) {
    set({ playerPosition: { x, y, z } });
  },

  setOpponentPosition(x, y, z) {
    set({ opponentPosition: { x, y, z } });
  },

  dealDamage(target, amount) {
    if (target === 'player') {
      set((s) => ({ playerHealth: Math.max(0, s.playerHealth - amount) }));
    } else {
      set((s) => ({ opponentHealth: Math.max(0, s.opponentHealth - amount) }));
    }
  },

  addScore(target, amount, meta = {}) {
    const pts = Math.max(0, Math.round(amount));
    if (target === 'player') {
      set((s) => ({
        playerScore: s.playerScore + pts,
        playerTotalScore: s.playerTotalScore + pts,
        lastHitPoints: pts,
        lastHitLabel: meta.label || `+${pts} PTS!`,
        floatingHits: [
          ...s.floatingHits.slice(-4),
          { id: Date.now(), amount: pts, blocked: !!meta.blocked, critical: !!meta.critical },
        ],
      }));
    } else {
      set((s) => ({
        opponentScore: s.opponentScore + pts,
        opponentTotalScore: s.opponentTotalScore + pts,
      }));
    }
  },

  startCombo(target) {
    if (target === 'player') set({ playerCombo: 1, playerComboTime: 0 });
    else set({ opponentCombo: 1, opponentComboTime: 0 });
  },

  extendCombo(target, points) {
    const s = get();
    if (target === 'player') {
      const combo = s.playerCombo + 1;
      const mult = combo >= 5 ? 1.8 : combo >= 4 ? 1.6 : combo >= 3 ? 1.4 : combo >= 2 ? 1.2 : 1;
      set({
        playerCombo: combo,
        playerComboTime: 0,
        lastComboMult: mult,
      });
      get().addScore('player', points, { label: `COMBO x${combo}` });
    } else {
      set({ opponentCombo: s.opponentCombo + 1, opponentComboTime: 0 });
      get().addScore('opponent', points);
    }
  },

  breakCombo(target) {
    if (target === 'player') set({ playerCombo: 0, lastComboMult: 1 });
    else set({ opponentCombo: 0 });
  },

  recordHit({ actionId, blocked = false, attacker = 'player' }) {
    const s = get();
    const target = attacker === 'player' ? 'player' : 'opponent';
    const prevCombo = target === 'player' ? s.playerCombo : s.opponentCombo;
    const comboHits = prevCombo + 1;
    const result = processCombatHit({ actionId, blocked, comboHits, attacker });

    if (comboHits === 1) get().startCombo(target);
    get().addScore(target, result.points, { label: result.attackName, blocked });
    if (comboHits > 1) {
      set(target === 'player'
        ? { playerCombo: comboHits, lastComboMult: getComboMultiplier(comboHits) }
        : { opponentCombo: comboHits });
    }

    const hitRecord = { actionId, points: result.points, blocked, time: Date.now() };
    const isHeavy = result.points >= 8;
    if (target === 'player') {
      set((st) => ({
        playerHitsDuringRound: [...st.playerHitsDuringRound, hitRecord],
        screenShake: result.knockdown ? 0.3 : isHeavy ? 0.22 : result.points >= 5 ? 0.12 : 0.06,
        stateLabel: blocked ? 'DEFENDING' : 'ATTACKING',
        floatingHits: blocked ? st.floatingHits : [
          ...st.floatingHits.slice(-4),
          { id: Date.now(), amount: result.points, blocked: false, critical: isHeavy },
        ],
      }));
      if (result.knockdown) { /* knockdown handled via combat sync */ }
    } else {
      set((st) => ({
        opponentHitsDuringRound: [...st.opponentHitsDuringRound, hitRecord],
      }));
      if (result.knockdown) { /* knockdown handled via combat sync */ }
    }
  },

  knockDown(target) {
    if (target === 'player') {
      set({
        isPlayerKnockedDown: true,
        playerKnockdownCount: 0,
        playerKnockdownTime: 0,
        playerState: 'KNOCKDOWN',
        centerMessage: 'KNOCKDOWN!',
        screenShake: 0.3,
        _countAccumulator: 0,
      });
    } else {
      set({
        isOpponentKnockedDown: true,
        opponentKnockdownCount: 0,
        opponentKnockdownTime: 0,
        opponentState: 'KNOCKDOWN',
        centerMessage: 'KNOCKDOWN!',
        screenShake: 0.3,
        _countAccumulator: 0,
      });
      get().addScore('player', MATCH.KNOCKDOWN_BONUS, { label: 'KNOCKDOWN +50' });
    }
  },

  countKnockdown(target) {
    const s = get();
    if (target === 'opponent' && s.isOpponentKnockedDown) {
      const count = Math.min(10, s.opponentKnockdownCount + 1);
      set({
        opponentKnockdownCount: count,
        centerMessage: String(count),
        opponentKnockdownTime: s.opponentKnockdownTime + 1,
      });
      get().addScore('player', MATCH.COUNT_POINT_EACH, { label: `COUNT ${count}` });
      if (count >= 10) {
        get().addScore('player', MATCH.KO_BONUS, { label: 'KO!' });
        get().endMatch('player', 'KO');
      }
    }
    if (target === 'player' && s.isPlayerKnockedDown) {
      const count = Math.min(10, s.playerKnockdownCount + 1);
      set({
        playerKnockdownCount: count,
        centerMessage: String(count),
        playerKnockdownTime: s.playerKnockdownTime + 1,
      });
      get().addScore('opponent', MATCH.COUNT_POINT_EACH);
      if (count >= 10) {
        get().endMatch('opponent', 'KO');
      }
    }
  },

  standUp(target) {
    if (target === 'player') {
      set({
        isPlayerKnockedDown: false,
        playerState: 'BLOCKING',
        centerMessage: '',
        stateLabel: 'DEFENDING',
      });
    } else {
      set({
        isOpponentKnockedDown: false,
        opponentState: 'IDLE',
        centerMessage: '',
      });
    }
    set({ _countAccumulator: 0 });
  },

  tryStandUpFromKnockdown() {
    const s = get();
    if (s.isPlayerKnockedDown && s.playerKnockdownCount < 10) {
      get().standUp('player');
      s._combatBridge?.current?.resetKnockdown?.();
    }
    if (s.isOpponentKnockedDown && s.opponentKnockdownCount < 10) {
      get().standUp('opponent');
    }
  },

  nextRoundFromCombat(boxingRound) {
    const s = get();
    set({
      currentRound: boxingRound,
      playerScore: 0,
      opponentScore: 0,
      playerCombo: 0,
      opponentCombo: 0,
      playerHitsDuringRound: [],
      opponentHitsDuringRound: [],
      isOpponentKnockedDown: false,
      isPlayerKnockedDown: false,
      opponentKnockdownCount: 0,
      playerKnockdownCount: 0,
      roundTimeRemaining: MATCH.ROUND_DURATION,
      isRoundActive: true,
      isResting: false,
      matchState: 'ROUND_ACTIVE',
      centerMessage: `ROUND ${boxingRound}/3`,
      stateLabel: 'FIGHT!',
      roundSummary: null,
      _roundEndHandled: false,
    });
  },

  /** @deprecated use combat-driven round flow */
  nextRound() {
    get().nextRoundFromCombat(get().currentRound + 1);
  },

  endRound() {
    const s = get();
    if (s._roundEndHandled) return;
    const entry = buildJudgeCardEntry(s.currentRound, s.playerScore, s.opponentScore);
    const winners = [...s.roundWinners];
    if (entry.winner !== 'draw') winners.push(entry.winner);

    const playerWins = winners.filter((w) => w === 'player').length;
    const opponentWins = winners.filter((w) => w === 'opponent').length;

    set({
      judgeCard: [...s.judgeCard, entry],
      roundWinners: winners,
      isRoundActive: false,
      matchState: 'ROUND_END',
      _roundEndHandled: true,
      roundSummary: {
        round: s.currentRound,
        playerScore: s.playerScore,
        opponentScore: s.opponentScore,
        winner: entry.winner,
      },
      centerMessage: `ROUND ${s.currentRound} OVER`,
      stateLabel: entry.winner === 'player'
        ? `YOU WIN ROUND ${s.currentRound} (${s.playerScore}–${s.opponentScore})`
        : entry.winner === 'opponent'
          ? `OPPONENT WINS ROUND ${s.currentRound} (${s.opponentScore}–${s.playerScore})`
          : `ROUND ${s.currentRound} DRAW`,
    });

    if (playerWins >= MATCH.ROUNDS_TO_WIN) {
      get().endMatch('player', 'DECISION');
      return;
    }
    if (opponentWins >= MATCH.ROUNDS_TO_WIN) {
      get().endMatch('opponent', 'DECISION');
      return;
    }
    if (s.currentRound >= MATCH.ROUNDS) {
      get().endMatchByDecision();
    }
  },

  endMatch(winner, method = 'KO') {
    set({
      matchState: 'MATCH_OVER',
      winner,
      winMethod: method,
      isRoundActive: false,
      centerMessage: method === 'KO' ? 'KNOCKOUT!' : 'MATCH OVER',
      stateLabel: winner === 'player' ? 'YOU WIN!' : winner === 'opponent' ? 'YOU LOSE' : 'DRAW',
    });
  },

  endMatchByDecision() {
    const s = get();
    const { winner, method } = tallyJudgeCard(s.roundWinners);
    get().endMatch(winner, method);
  },

  startMatch() {
    set({
      ...initialRound(),
      playerScore: 0,
      opponentScore: 0,
      playerTotalScore: 0,
      opponentTotalScore: 0,
      playerHealth: MATCH.MAX_HEALTH,
      opponentHealth: MATCH.MAX_HEALTH,
      playerStamina: MATCH.MAX_STAMINA,
      opponentStamina: MATCH.MAX_STAMINA,
      playerState: 'IDLE',
      opponentState: 'IDLE',
      isPlayerKnockedDown: false,
      isOpponentKnockedDown: false,
      playerKnockdownCount: 0,
      opponentKnockdownCount: 0,
      matchState: 'ROUND_ACTIVE',
      winner: null,
      winMethod: null,
      judgeCard: [],
      roundWinners: [],
      centerMessage: 'ROUND 1/3',
      stateLabel: 'FIGHT!',
      isRoundActive: true,
      roundTimeRemaining: MATCH.ROUND_DURATION,
      currentRound: 1,
      roundSummary: null,
      _lastCombatRound: 1,
      _wasBetweenRounds: false,
      _roundEndHandled: false,
      _aggressionTimer: 0,
      _defenseTimer: 0,
    });
  },

  updateTime(deltaTime) {
    const s = get();
    if (s.matchState === 'MATCH_OVER') return;

    if (s.playerCombo > 0) {
      const t = s.playerComboTime + deltaTime;
      if (t > 1.2) set({ playerCombo: 0, playerComboTime: 0, lastComboMult: 1 });
      else set({ playerComboTime: t });
    }

    if (s.screenShake > 0) {
      set({ screenShake: Math.max(0, s.screenShake - deltaTime * 2) });
    }

    // Knockdown 10-count (1 per second)
    if (s.isOpponentKnockedDown || s.isPlayerKnockedDown) {
      const acc = s._countAccumulator + deltaTime;
      if (acc >= 1) {
        if (s.isOpponentKnockedDown) get().countKnockdown('opponent');
        if (s.isPlayerKnockedDown) get().countKnockdown('player');
        set({ _countAccumulator: 0 });
      } else {
        set({ _countAccumulator: acc });
      }
    }

    // Aggression / defense bonus timers
    if (s.playerState === 'ATTACKING' || s.playerState === 'WALKING') {
      const ag = s._aggressionTimer + deltaTime;
      if (ag >= MATCH.AGGRESSION_INTERVAL) {
        get().addScore('player', MATCH.AGGRESSION_BONUS, { label: 'Aggression +10' });
        set({ _aggressionTimer: 0 });
      } else set({ _aggressionTimer: ag });
    } else if (s.playerState === 'BLOCKING') {
      const df = s._defenseTimer + deltaTime;
      if (df >= MATCH.AGGRESSION_INTERVAL) {
        get().addScore('player', MATCH.DEFENSE_BONUS, { label: 'Defense +5' });
        set({ _defenseTimer: 0 });
      } else set({ _defenseTimer: df });
    }
  },

  syncCombat(combatSnap, combatRaw = {}) {
    if (!combatSnap) return;
    const prev = get();
    const boxingRound = combatSnap.currentRound ?? prev.currentRound;
    const betweenRounds = !!combatRaw.betweenRounds;
    const restLeft = combatRaw.restTimer ?? 0;

    // Round ended → tally judge card once
    if (betweenRounds && !prev._wasBetweenRounds && !prev._roundEndHandled) {
      get().endRound();
    }

    // Rest period display (combat engine drives timing)
    if (betweenRounds) {
      set({
        isResting: true,
        matchState: 'REST',
        restTimeRemaining: restLeft,
        centerMessage: restLeft > 0 ? `REST ${Math.ceil(restLeft)}` : 'REST',
        isRoundActive: false,
      });
    }

    // New round started after rest
    if (!betweenRounds && prev._wasBetweenRounds && boxingRound > prev._lastCombatRound) {
      get().nextRoundFromCombat(boxingRound);
    }

    // Match over from combat (3 rounds complete or KO)
    if (combatSnap.combatOver && prev.matchState !== 'MATCH_OVER') {
      if (!prev._roundEndHandled && prev.isRoundActive) {
        get().endRound();
      }
      const afterRound = get();
      if (afterRound.matchState !== 'MATCH_OVER') {
        if (afterRound.judgeCard.length >= MATCH.ROUNDS || combatRaw.won === null) {
          get().endMatchByDecision();
        } else if (combatSnap.combatWon) {
          get().endMatch('player', combatRaw.enemyHp <= 0 ? 'KO' : 'DECISION');
        } else {
          get().endMatch('opponent', combatRaw.playerHp <= 0 ? 'KO' : 'DECISION');
        }
      }
    }

    // TKO at 0 HP
    if (combatSnap.opponentHealth <= 0 && prev.matchState !== 'MATCH_OVER') {
      get().endMatch('player', 'TKO');
    } else if (combatSnap.playerHealth <= 0 && prev.matchState !== 'MATCH_OVER') {
      get().endMatch('opponent', 'TKO');
    }

    const updates = {
      playerHealth: combatSnap.playerHealth,
      opponentHealth: combatSnap.opponentHealth,
      playerStamina: combatSnap.playerStamina,
      opponentStamina: combatSnap.opponentStamina,
      playerPosition: combatSnap.playerPosition,
      opponentPosition: combatSnap.opponentPosition,
      playerRotation: combatSnap.playerRotation,
      opponentRotation: combatSnap.opponentRotation,
      playerState: combatSnap.playerState,
      opponentState: combatSnap.opponentState,
      roundTimeRemaining: combatSnap.roundTimeRemaining ?? prev.roundTimeRemaining,
      currentRound: boxingRound,
      _wasBetweenRounds: betweenRounds,
      _lastCombatRound: boxingRound,
    };

    if (combatSnap._triggerOpponentKnockdown && !prev.isOpponentKnockedDown) {
      get().knockDown('opponent');
    }
    if (combatSnap._triggerPlayerKnockdown && !prev.isPlayerKnockedDown) {
      get().knockDown('player');
    }

    set(updates);
    set({ stateLabel: getStateLabel(updates.playerState) });
  },

  reset() {
    get().startMatch();
  },
}));

export default useBoxingGameStore;
