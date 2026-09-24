/**
 * Live Lab fighting keyboard — punches (X/Z), kicks (A/D/Y/B), sweep (↓+A).
 */
export const FIGHT_CONTROLS_HELP = [
  { keys: 'A', action: 'Light Kick' },
  { keys: 'D', action: 'Roundhouse' },
  { keys: 'Hold D', action: 'Heavy Kick' },
  { keys: '↓ + A', action: 'Sweep (knockdown)' },
  { keys: 'X', action: 'High Punch' },
  { keys: 'Z', action: 'Low Punch' },
  { keys: 'Y', action: 'High Kick (alt)' },
  { keys: 'B', action: 'Low Kick (alt)' },
  { keys: 'Hold X 0.5s', action: 'Heavy Punch' },
  { keys: 'Hold Y 0.5s', action: 'Heavy Kick (alt)' },
  { keys: '← (hold)', action: 'Block' },
  { keys: '→', action: 'Walk Forward' },
  { keys: '↑', action: 'Jump' },
  { keys: '↓', action: 'Crouch' },
  { keys: 'Space', action: 'Energy Bolt' },
  { keys: 'Q (hold)', action: 'Amplify Special' },
];

const PUNCH_MAP = {
  KeyX: 'high_punch',
  KeyZ: 'low_punch',
  KeyY: 'high_kick',
  KeyB: 'low_kick',
};

const HEAVY_HOLD_MS = 500;

export function attachFightingKeyboard(combatRef, { enabled = () => true } = {}) {
  const keysDown = new Set();
  const holdStart = {};
  let blockHeld = false;
  let lastLeftTap = 0;
  let amplifyHeld = false;

  function onKeyDown(e) {
    if (!enabled()) return;
    const combat = combatRef.current;
    if (!combat?.doAction) return;

    keysDown.add(e.code);

    if (e.code === 'ArrowLeft') {
      if (!blockHeld) {
        combat.doAction('block');
        blockHeld = true;
      }
      const now = Date.now();
      if (now - lastLeftTap < 250) {
        combat.doAction('back_dash');
      }
      lastLeftTap = now;
      e.preventDefault();
      return;
    }

    if (e.code === 'ArrowRight') {
      if (!e.repeat) combat.doAction('advance_step');
      e.preventDefault();
      return;
    }

    if (e.code === 'ArrowUp') {
      combat.doAction('jump');
      e.preventDefault();
      return;
    }

    if (e.code === 'ArrowDown') {
      combat.doAction('crouch');
      e.preventDefault();
      return;
    }

    if (e.code === 'Space') {
      if (keysDown.has('ArrowDown') && keysDown.has('ArrowRight')) {
        combat.doAction('uppercut_reversal');
      } else {
        combat.doAction(amplifyHeld ? 'energy_bolt_amplify' : 'energy_bolt');
      }
      e.preventDefault();
      return;
    }

    if (e.code === 'KeyQ') {
      amplifyHeld = true;
      e.preventDefault();
      return;
    }

    if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey) {
      if (keysDown.has('ArrowDown')) {
        if (!e.repeat) combat.doAction('sweep');
      } else {
        if (!holdStart[e.code]) holdStart[e.code] = Date.now();
        if (!e.repeat) combat.doAction('light_kick');
      }
      e.preventDefault();
      return;
    }

    if (e.code === 'KeyD') {
      if (!holdStart[e.code]) holdStart[e.code] = Date.now();
      e.preventDefault();
      return;
    }

    if (PUNCH_MAP[e.code]) {
      if (!holdStart[e.code]) holdStart[e.code] = Date.now();
      if (keysDown.has('ArrowUp')) {
        combat.doAction(e.code === 'KeyY' || e.code === 'KeyB' ? 'jump_kick' : 'jump_punch');
        e.preventDefault();
        return;
      }
      if (!e.repeat) {
        combat.doAction(PUNCH_MAP[e.code]);
      }
      e.preventDefault();
      return;
    }

    if (e.repeat) return;

    if (e.code === 'KeyW') combat.doAction('advance_step');
    if (e.code === 'KeyS') combat.doAction('retreat_step');
    if (e.code === 'KeyJ') combat.doAction('high_punch');
    if (e.code === 'KeyK') combat.doAction('heavy_kick');
    if (e.code === 'KeyI') combat.doAction('heavy_punch');
  }

  function onKeyUp(e) {
    keysDown.delete(e.code);

    if (e.code === 'ArrowLeft') {
      blockHeld = false;
      combatRef.current?.releaseBlock?.();
    }

    if (e.code === 'ArrowDown') {
      combatRef.current?.releaseCrouch?.();
    }

    if (e.code === 'KeyQ') {
      amplifyHeld = false;
    }

    if (holdStart[e.code]) {
      const held = Date.now() - holdStart[e.code];
      delete holdStart[e.code];
      if (held >= HEAVY_HOLD_MS) {
        if (e.code === 'KeyX') combatRef.current?.doAction?.('heavy_punch');
        if (e.code === 'KeyY') combatRef.current?.doAction?.('heavy_kick');
        if (e.code === 'KeyD') combatRef.current?.doAction?.('heavy_kick');
      } else if (e.code === 'KeyD') {
        combatRef.current?.doAction?.('roundhouse');
      }
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    keysDown.clear();
    Object.keys(holdStart).forEach((k) => delete holdStart[k]);
    blockHeld = false;
    amplifyHeld = false;
  };
}
