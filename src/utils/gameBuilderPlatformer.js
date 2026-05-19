/**
 * Game Builder — 2D platformer physics (per-sprite state, dt-based).
 * Separates integration from the React UI; GameBuilder drives each frame with delta time.
 */

export const DEFAULT_GRAVITY_PPS2 = 2400;
export const DEFAULT_MAX_FALL_PPS = 980;
/** Scratch/Pico-8 style: jump impulse is upward velocity (px/s); block "power" maps here. */
export const DEFAULT_JUMP_IMPULSE_PPS = 760;
const GROUND_EPS = 6;
/** Treat as "standing" for jump if moving down slowly or still (coyote / landing). */
export const JUMP_COYOTE_MAX_VY = 140;
const LEGACY_GRAVITY_THRESHOLD = 80;
const LEGACY_JUMP_THRESHOLD = 72;
const DEFAULT_SPRITE_WH = 48;

/** Coerce x,y,w,h so feet/overlap math never sees NaN (broken jumps / frozen sprites). */
export function normalizeSpriteMetrics(sprite) {
  if (!sprite || typeof sprite !== 'object') return;
  const x = Number(sprite.x);
  const y = Number(sprite.y);
  const w = Number(sprite.w);
  const h = Number(sprite.h);
  sprite.x = Number.isFinite(x) ? x : 0;
  sprite.y = Number.isFinite(y) ? y : 0;
  sprite.w = Number.isFinite(w) && w > 0 ? w : DEFAULT_SPRITE_WH;
  sprite.h = Number.isFinite(h) && h > 0 ? h : DEFAULT_SPRITE_WH;
}

/**
 * @typedef {Object} SpritePhysicsState
 * @property {number} vx
 * @property {number} vy
 * @property {number} gravityPps2
 * @property {number} maxFallPps
 * @property {boolean} grounded
 * @property {boolean} allowDoubleJump
 * @property {boolean} usedDoubleJump
 * @property {boolean} isJumping
 */

export function createPhysicsState() {
  return {
    vx: 0,
    vy: 0,
    // No implicit gravity: sprite stays still unless blocks set gravity/jump.
    gravityPps2: 0,
    maxFallPps: DEFAULT_MAX_FALL_PPS,
    grounded: true,
    allowDoubleJump: false,
    usedDoubleJump: false,
    isJumping: false,
    _vars: {},
  };
}

export function ensurePhysicsState(spriteVars, spriteId) {
  if (!spriteVars[spriteId]) {
    spriteVars[spriteId] = createPhysicsState();
  }
  return spriteVars[spriteId];
}

/** Normalize block param: small legacy per-frame-ish values → px/s² */
export function normalizeGravityPps2(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return DEFAULT_GRAVITY_PPS2;
  if (n <= LEGACY_GRAVITY_THRESHOLD) {
    return DEFAULT_GRAVITY_PPS2 * (n / 0.5);
  }
  return n;
}

/** Map block "power" to upward impulse (negative vy is applied as impulse in jump helper). */
export function normalizeJumpImpulse(power) {
  const n = Math.abs(Number(power));
  if (!Number.isFinite(n)) return DEFAULT_JUMP_IMPULSE_PPS;
  if (n <= LEGACY_JUMP_THRESHOLD) {
    return n * 55;
  }
  return n;
}

function horizOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x;
}

function feetY(sprite) {
  return sprite.y + sprite.h;
}

export function isSupportedOnSomething(sprite, platformRects, stageW, stageH) {
  normalizeSpriteMetrics(sprite);
  const b = feetY(sprite);
  const fx0 = sprite.x;
  const fx1 = sprite.x + sprite.w;
  const overlapsStageFloorX = fx1 > 0 && fx0 < stageW;
  if (overlapsStageFloorX && b >= stageH - GROUND_EPS && b <= stageH + GROUND_EPS) {
    return true;
  }
  for (const plat of platformRects) {
    if (!horizOverlap(sprite, plat)) continue;
    const top = plat.y;
    if (b >= top - GROUND_EPS && b <= top + GROUND_EPS) return true;
  }
  return false;
}

/**
 * @param {string} key
 * @returns {string[]}
 */
export function expandKeyAliases(key) {
  const raw = String(key ?? '').trim();
  const lower = raw.toLowerCase();
  const set = new Set([raw, lower]);

  if (lower === 'space' || raw === ' ') {
    set.add(' ');
    set.add('space');
    set.add('Space');
  }
  const arrows = {
    up: ['ArrowUp', 'up', 'Up'],
    down: ['ArrowDown', 'down', 'Down'],
    left: ['ArrowLeft', 'left', 'Left'],
    right: ['ArrowRight', 'right', 'Right'],
  };
  for (const [alias, variants] of Object.entries(arrows)) {
    if (lower === alias) variants.forEach((v) => set.add(v));
  }
  for (const [alias, variants] of Object.entries(arrows)) {
    if (variants.includes(raw)) {
      set.add(alias);
      variants.forEach((v) => set.add(v));
    }
  }
  if (lower === 'arrowup' || lower === 'arrowdown' || lower === 'arrowleft' || lower === 'arrowright') {
    const map = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
    const a = map[lower];
    if (a) arrows[a].forEach((v) => set.add(v));
  }
  if (lower === 'w' || lower === 'a' || lower === 's' || lower === 'd') {
    set.add(lower);
    set.add(lower.toUpperCase());
  }
  return [...set];
}

export function isKeyHeld(keysPressed, triggerKey) {
  if (!keysPressed) return false;
  for (const a of expandKeyAliases(triggerKey)) {
    if (keysPressed[a]) return true;
  }
  return false;
}

export function isKeyJustPressed(keysPressed, keysPressedPrev, triggerKey) {
  return isKeyHeld(keysPressed, triggerKey) && !isKeyHeld(keysPressedPrev, triggerKey);
}

/**
 * Collect solid top surfaces (other sprites marked as platforms).
 * @param {object[]} allSprites
 * @param {string|number} selfId
 * @returns {{ x:number, y:number, w:number, h:number }[]}
 */
export function getPlatformRects(allSprites, selfId) {
  const out = [];
  for (const s of allSprites) {
    if (!s || s.visible === false) continue;
    if (s.id === selfId) continue;
    if (s.physicsRole === 'platform' || s.isStaticPlatform) {
      normalizeSpriteMetrics(s);
      out.push({ x: s.x, y: s.y, w: s.w, h: s.h });
    }
  }
  return out;
}

function snapToPlatformTop(sprite, topY) {
  normalizeSpriteMetrics(sprite);
  sprite.y = topY - sprite.h;
}

/**
 * Single integration step for one sprite (actor). Platforms skip vertical physics.
 * @param {object} sprite
 * @param {SpritePhysicsState} state
 * @param {number} dt
 * @param {number} stageW
 * @param {number} stageH
 * @param {object[]} platformRects
 * @param {string} [physicsRole='actor']
 */
export function integratePlatformerSprite(sprite, state, dt, stageW, stageH, platformRects, physicsRole = 'actor') {
  normalizeSpriteMetrics(sprite);

  if (physicsRole === 'platform' || physicsRole === 'decoration') {
    state.vy = 0;
    state.grounded = true;
    state.isJumping = false;
    sprite.x = Math.max(0, Math.min(stageW - sprite.w, sprite.x));
    return;
  }

  const clampDt = Math.min(0.05, Math.max(0, dt));
  const prevY = sprite.y;
  const prevBottom = prevY + sprite.h;

  const g = Number(state.gravityPps2) || 0;
  // With gravity: accelerate when in air or moving upward; when resting on ground with vy≥0, clamp vy to 0.
  // With gravity off: do not zero vy here — otherwise jump impulses never move the sprite until gravity is set.
  if (g > 0) {
    if (!state.grounded || (state.vy || 0) < 0) {
      state.vy = Math.min(state.maxFallPps, (state.vy || 0) + g * clampDt);
    } else {
      state.vy = 0;
    }
  }

  sprite.x += (state.vx || 0) * clampDt;
  sprite.x = Math.max(0, Math.min(stageW - sprite.w, sprite.x));

  const proposedY = sprite.y + (state.vy || 0) * clampDt;
  const proposedBottom = proposedY + sprite.h;

  let landingTop = stageH;

  if (state.vy >= 0) {
    for (const plat of platformRects) {
      if (!horizOverlap({ ...sprite, y: proposedY }, plat)) continue;
      const top = plat.y;
      const crossedDown = prevBottom <= top + GROUND_EPS && proposedBottom >= top - GROUND_EPS;
      if (!crossedDown) continue;
      if (top < landingTop) landingTop = top;
    }
  }

  if (state.vy >= 0 && proposedBottom >= landingTop - GROUND_EPS) {
    snapToPlatformTop(sprite, landingTop);
    state.vy = 0;
    state.grounded = true;
    state.isJumping = false;
    state.usedDoubleJump = false;
  } else {
    sprite.y = proposedY;
    state.grounded = false;
  }

  if (sprite.y < 0 && state.vy < 0) {
    sprite.y = 0;
    state.vy = 0;
  }

  sprite.y = Math.max(-sprite.h * 2, Math.min(sprite.y, stageH + sprite.h));
}

/**
 * Apply a jump impulse to one sprite only.
 * When `world` is passed, "on ground" uses geometry (feet on floor/platform), not only `state.grounded`.
 * @param {SpritePhysicsState} state
 * @param {number} impulsePps upward positive magnitude (we set vy negative)
 * @param {{ force?: boolean }} [opts]
 * @param {{ sprite: object, platformRects: object[], stageW: number, stageH: number } | null} [world]
 */
export function applyJumpImpulse(state, impulsePps, opts = {}, world = null) {
  const force = !!opts.force;
  let onGround = !!state.grounded;
  if (world?.sprite != null && world.stageW != null && world.stageH != null) {
    const rects = world.platformRects || [];
    const vy = state.vy ?? 0;
    onGround =
      isSupportedOnSomething(world.sprite, rects, world.stageW, world.stageH) && vy <= JUMP_COYOTE_MAX_VY;
  }
  const canForce = force;
  const canNormal = onGround && !force;
  const canDouble = !force && state.allowDoubleJump && !state.usedDoubleJump && !onGround;

  if (!canForce && !canNormal && !canDouble) return false;

  if (canDouble) state.usedDoubleJump = true;

  state.vy = -Math.abs(impulsePps);
  state.grounded = false;
  state.isJumping = true;
  return true;
}
