/**
 * BoxingGameInput — keyboard handling with attack queue.
 */
import { useEffect, useRef } from 'react';
import { KEY_TO_ATTACK, HEAVY_HOLD_MS, ATTACKS } from './boxingGameConstants.js';

export const BOXING_CONTROLS_HELP = [
  { keys: 'J', action: 'Jab' },
  { keys: 'K', action: 'Straight' },
  { keys: 'Hold K', action: 'Hook' },
  { keys: 'A', action: 'Kick' },
  { keys: 'D', action: 'Roundhouse' },
  { keys: 'Hold D', action: 'Haymaker' },
  { keys: '↓ + A', action: 'Sweep' },
  { keys: '← / B', action: 'Block' },
  { keys: '→', action: 'Forward' },
  { keys: 'Space', action: 'Special' },
];

export function createInputQueue() {
  return {
    queue: [],
    push(action) {
      if (this.queue.length < 3) this.queue.push(action);
    },
    pop() {
      return this.queue.shift();
    },
    clear() { this.queue.length = 0; },
  };
}

export function attachBoxingInput(combatRef, stateStore, { enabled = () => true, onAttack = null } = {}) {
  const keysDown = new Set();
  const holdStart = {};
  let blockHeld = false;
  const inputQueue = createInputQueue();

  function doAttack(attackKey) {
    const atk = ATTACKS[attackKey];
    if (!atk) return;
    inputQueue.push(atk.combatId);
    stateStore.getState?.()?.tryStandUpFromKnockdown?.();
    onAttack?.(attackKey);
  }

  function flushQueue() {
    const c = combatRef.current;
    if (!c?.doAction) return;
    while (inputQueue.queue.length) {
      c.doAction(inputQueue.pop());
    }
  }

  function onKeyDown(e) {
    if (!enabled()) return;
    const combat = combatRef.current;
    if (!combat?.doAction) return;
    keysDown.add(e.code);

    if (e.code === 'ArrowLeft' || e.code === 'KeyB') {
      if (!blockHeld) { combat.doAction('block'); blockHeld = true; }
      e.preventDefault();
      return;
    }
    if (e.code === 'ArrowRight') {
      if (!e.repeat) combat.doAction('advance_step');
      e.preventDefault();
      return;
    }
    if (e.code === 'ArrowUp') { combat.doAction('jump'); e.preventDefault(); return; }
    if (e.code === 'ArrowDown') { combat.doAction('crouch'); e.preventDefault(); return; }

    if (e.code === 'Space') {
      combat.doAction('energy_bolt');
      e.preventDefault();
      return;
    }

    if (KEY_TO_ATTACK[e.code]) {
      if (!holdStart[e.code]) holdStart[e.code] = Date.now();
      if (keysDown.has('ArrowDown') && e.code === 'KeyA') { doAttack('SWEEP'); e.preventDefault(); return; }
      if (keysDown.has('ArrowRight') && e.code === 'KeyD') { doAttack('HAYMAKER'); e.preventDefault(); return; }
      if (keysDown.has('ArrowUp')) {
        combat.doAction(e.code === 'KeyD' ? 'jump_kick' : 'jump_punch');
        e.preventDefault();
        return;
      }
      if (!e.repeat) doAttack(KEY_TO_ATTACK[e.code]);
      e.preventDefault();
      return;
    }

    if (e.repeat) return;
    if (e.code === 'KeyW') combat.doAction('advance_step');
    if (e.code === 'KeyS') combat.doAction('retreat_step');
  }

  function onKeyUp(e) {
    keysDown.delete(e.code);
    if (e.code === 'ArrowLeft' || e.code === 'KeyB') {
      blockHeld = false;
      combatRef.current?.releaseBlock?.();
    }
    if (e.code === 'ArrowDown') combatRef.current?.releaseCrouch?.();
    if (KEY_TO_ATTACK[e.code] && holdStart[e.code]) {
      const held = Date.now() - holdStart[e.code];
      delete holdStart[e.code];
      if (held >= HEAVY_HOLD_MS) {
        if (e.code === 'KeyK') doAttack('HOOK');
        if (e.code === 'KeyD') doAttack('HAYMAKER');
        if (e.code === 'KeyJ') doAttack('POWER_PUNCH');
      }
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  const flushInterval = setInterval(flushQueue, 50);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    clearInterval(flushInterval);
    inputQueue.clear();
    keysDown.clear();
    blockHeld = false;
  };
}

export function useBoxingGameInput(combatRef, stateStore, options = {}) {
  const enabledRef = useRef(options.enabled || (() => true));
  enabledRef.current = options.enabled || (() => true);

  useEffect(() => {
    return attachBoxingInput(combatRef, stateStore, {
      ...options,
      enabled: () => enabledRef.current?.() !== false,
    });
  }, [combatRef, stateStore, options.onAttack]);
}
