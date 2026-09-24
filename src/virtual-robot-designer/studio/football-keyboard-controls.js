/**
 * FIFA striker keyboard — move with arrows/WASD, shoot/pass on edges.
 */
export const FOOTBALL_CONTROLS_HELP = '↑↓←→ / WASD move  ·  Space shoot  ·  E pass  ·  Shift sprint  ·  Esc stop';

export function emptyFootballKeys() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
    shootEdge: false,
    passEdge: false,
  };
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (el.closest?.('.blocklyWidgetDiv, .blocklyDropDownDiv, .blocklyHtmlInput, .blocklyMenu')) return true;
  return false;
}

export function attachFootballKeyboard(keysRef, { enabled = () => true } = {}) {
  if (!keysRef.current) keysRef.current = emptyFootballKeys();

  function onDown(e) {
    if (!enabled()) return;
    if (isTypingTarget(e.target)) return;
    const k = keysRef.current;
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        k.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        k.down = true;
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'KeyA':
        k.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        k.right = true;
        e.preventDefault();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        k.sprint = true;
        break;
      case 'Space':
        if (!e.repeat) k.shootEdge = true;
        e.preventDefault();
        break;
      case 'KeyE':
        if (!e.repeat) k.passEdge = true;
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  function onUp(e) {
    const k = keysRef.current;
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        k.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        k.down = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        k.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        k.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        k.sprint = false;
        break;
      default:
        break;
    }
  }

  function reset() {
    keysRef.current = emptyFootballKeys();
  }

  window.addEventListener('keydown', onDown, { capture: true });
  window.addEventListener('keyup', onUp, { capture: true });
  window.addEventListener('blur', reset);
  return () => {
    window.removeEventListener('keydown', onDown, { capture: true });
    window.removeEventListener('keyup', onUp, { capture: true });
    window.removeEventListener('blur', reset);
  };
}

export function footballKeysToInput(keys) {
  const k = keys || emptyFootballKeys();
  let dx = 0;
  let dz = 0;
  if (k.left) dx -= 1;
  if (k.right) dx += 1;
  if (k.up) dz += 1;
  if (k.down) dz -= 1;
  const mag = Math.hypot(dx, dz);
  if (mag > 1) {
    dx /= mag;
    dz /= mag;
  }
  return {
    dx,
    dz,
    sprint: !!k.sprint,
    shoot: !!k.shootEdge,
    pass: !!k.passEdge,
  };
}

export function clearFootballKeyEdges(keys) {
  if (!keys) return;
  keys.shootEdge = false;
  keys.passEdge = false;
}
