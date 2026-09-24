/**
 * CodeRacer keyboard — drive with arrows / WASD, boost with Space.
 */
export const RACE_CONTROLS_HELP = '↑/W drive  ·  ← → steer  ·  Space boost';

export function emptyRacingKeys() {
  return { up: false, down: false, left: false, right: false, boost: false };
}

export function racingKeysHeld(keys) {
  return !!(keys && (keys.up || keys.down || keys.left || keys.right));
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (el.closest?.('.blocklyWidgetDiv, .blocklyDropDownDiv, .blocklyHtmlInput, .blocklyMenu')) return true;
  return false;
}

export function attachRacingKeyboard(keysRef, { enabled = () => true } = {}) {
  if (!keysRef.current) keysRef.current = emptyRacingKeys();

  function apply(code, down, e) {
    const k = keysRef.current;
    switch (code) {
      case 'ArrowUp':
      case 'KeyW':
        k.up = down;
        e.preventDefault();
        return true;
      case 'ArrowDown':
      case 'KeyS':
        k.down = down;
        e.preventDefault();
        return true;
      case 'ArrowLeft':
      case 'KeyA':
        k.left = down;
        e.preventDefault();
        return true;
      case 'ArrowRight':
      case 'KeyD':
        k.right = down;
        e.preventDefault();
        return true;
      case 'Space':
        k.boost = down;
        e.preventDefault();
        return true;
      default:
        return false;
    }
  }

  function onDown(e) {
    if (!enabled()) return;
    if (e.repeat && e.code !== 'Space') {
      apply(e.code, true, e);
      return;
    }
    if (isTypingTarget(e.target)) return;
    apply(e.code, true, e);
  }

  function onUp(e) {
    apply(e.code, false, e);
  }

  function reset() {
    keysRef.current = emptyRacingKeys();
  }

  window.addEventListener('keydown', onDown, { capture: true });
  window.addEventListener('keyup', onUp, { capture: true });
  window.addEventListener('blur', reset);
  return () => {
    window.removeEventListener('keydown', onDown, { capture: true });
    window.removeEventListener('keyup', onUp, { capture: true });
    window.removeEventListener('blur', reset);
    reset();
  };
}
