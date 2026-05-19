/**
 * PictoBlox / Scratch-style motion engine for Game Builder.
 *
 * Coordinate system (logical / reporter values):
 *   - Origin (0, 0) at stage center
 *   - +X = right, +Y = up
 *   - Bounds roughly x: ±240, y: ±180 on a 480×360 stage
 *
 * Direction (degrees):
 *   - 0 = up, 90 = right, -90 = left, 180 = down
 *   - Clockwise turn increases direction
 *
 * Canvas storage: sprite.x / sprite.y are top-left (HTML canvas, Y down).
 * Motion math runs in logical space; helpers sync canvas ↔ logical each step.
 */

export const STAGE_W = 480;
export const STAGE_H = 360;
export const STAGE_HALF_W = STAGE_W / 2;
export const STAGE_HALF_H = STAGE_H / 2;

export const MOTION_BLOCK_TYPES = new Set([
  'sprite-move', 'sprite-turn', 'sprite-turn-right', 'sprite-turn-left',
  'sprite-goto', 'sprite-goto-sprite', 'sprite-goto-random-position', 'sprite-goto-mouse-pointer',
  'sprite-glide', 'sprite-changex', 'sprite-setx', 'sprite-changey', 'sprite-sety',
  'sprite-point-dir', 'sprite-point-towards', 'sprite-if-bounce', 'sprite-rotation-style',
  'motion-move', 'motion-turn', 'motion-turn-right', 'motion-turn-left',
  'motion-goto', 'motion-goto-xy', 'motion-goto-sprite', 'motion-goto-random-position', 'motion-goto-mouse-pointer',
  'motion-glide', 'motion-glide-to-xy', 'motion-glide-to-sprite', 'motion-glide-to-random-position', 'motion-glide-to-mouse-pointer',
  'motion-setx', 'motion-sety', 'motion-changex', 'motion-changey',
  'motion-point-dir', 'motion-point', 'motion-point-towards',
  'motion-if-on-edge-bounce', 'motion-set-rotation-style', 'motion-rotation', 'motion-change-angle',
  'motion_movesteps', 'motion_turnright', 'motion_turnleft',
  'motion_goto', 'motion_gotoxy', 'motion_glide', 'motion_glideto',
  'motion_pointindirection', 'motion_pointtowards',
  'motion_changex', 'motion_setx', 'motion_changey', 'motion_sety',
  'motion_ifonedgebounce', 'motion_setrotationstyle',
  'bb_sprite_if_bounce', 'bb_sprite_rotation_style',
  'bb_motion_if_bounce', 'bb_motion_set_rotation_style',
]);

const EDGE_BOUNCE_TYPE_RE = /if[-_]?bounce|ifonedgebounce|if_on_edge/i;
const ROTATION_STYLE_TYPE_RE = /rotation[-_]?style|setrotationstyle|set_rotation_style/i;

export function isEdgeBounceBlockType(type) {
  return EDGE_BOUNCE_TYPE_RE.test(String(type || ''));
}

export function isRotationStyleBlockType(type) {
  return ROTATION_STYLE_TYPE_RE.test(String(type || ''));
}

/** Canonical rotation styles (set rotation style block). */
export const ROTATION_STYLE_ALL_AROUND = 'all around';
export const ROTATION_STYLE_LEFT_RIGHT = 'left-right';
export const ROTATION_STYLE_NO_ROTATION = 'no rotation';

/** Upright until a script runs "set rotation style". */
export const DEFAULT_ROTATION_STYLE = ROTATION_STYLE_NO_ROTATION;

/** Canonical rotation style string for runtime + rendering. */
export function normalizeRotationStyle(raw) {
  if (raw == null || String(raw).trim() === '') return DEFAULT_ROTATION_STYLE;
  const key = String(raw).toLowerCase().replace(/_/g, '').replace(/\s/g, '');
  const styleMap = {
    leftright: ROTATION_STYLE_LEFT_RIGHT,
    'left-right': ROTATION_STYLE_LEFT_RIGHT,
    none: ROTATION_STYLE_NO_ROTATION,
    dontrotate: ROTATION_STYLE_NO_ROTATION,
    no: ROTATION_STYLE_NO_ROTATION,
    noration: ROTATION_STYLE_NO_ROTATION,
    'no-rotation': ROTATION_STYLE_NO_ROTATION,
    nrotation: ROTATION_STYLE_NO_ROTATION,
    allaround: ROTATION_STYLE_ALL_AROUND,
    all: ROTATION_STYLE_ALL_AROUND,
    'all-around': ROTATION_STYLE_ALL_AROUND,
    'all around': ROTATION_STYLE_ALL_AROUND,
  };
  if (styleMap[key]) return styleMap[key];
  const s = String(raw).trim();
  if (/left.?right/i.test(s)) return ROTATION_STYLE_LEFT_RIGHT;
  if (/don.?t rotate|no.?rotation|^none$/i.test(s)) return ROTATION_STYLE_NO_ROTATION;
  if (/all.?around/i.test(s)) return ROTATION_STYLE_ALL_AROUND;
  return DEFAULT_ROTATION_STYLE;
}

export function isNoRotationStyle(style) {
  const s = normalizeRotationStyle(style);
  return s === ROTATION_STYLE_NO_ROTATION;
}

/** Read STYLE/style from a game block or Blockly node. */
export function readRotationStyleParam(blockOrNode) {
  const p = blockOrNode?.params || {};
  const f = blockOrNode?.fields || {};
  return p.style ?? p.STYLE ?? p.rotation ?? f.STYLE ?? f.style ?? 'allaround';
}

export function setRotationStyle(sprite, rawStyle) {
  if (!sprite) return;
  const mapped = normalizeRotationStyle(rawStyle);
  sprite.rotationStyle = mapped;
  sprite._rotationStyle = mapped;
  sprite._rotationStyleFromScript = true;
}

/** Run "set rotation style" from a game or Blockly block. Returns true if applied. */
export function applyRotationStyleBlock(block, sprite) {
  if (!block || !sprite) return false;
  const t = block.type || block.blocklyType || '';
  if (!isRotationStyleBlockType(t)) return false;
  const rawStyle = readRotationStyleParam(block);
  setRotationStyle(sprite, rawStyle);
  return true;
}

/** Read "set rotation style" from this sprite's block list (after Blockly flush). Last block wins. */
export function applyRotationStyleFromBlocks(sprite) {
  if (!sprite?.blocks?.length) return false;
  let applied = false;
  for (const block of sprite.blocks) {
    const t = block?.type || block?.blocklyType;
    if (!isRotationStyleBlockType(t)) continue;
    setRotationStyle(sprite, readRotationStyleParam(block));
    applied = true;
  }
  return applied;
}

/** Read rotation style from raw Blockly flush nodes (before/without game-block conversion). */
export function applyRotationStyleFromBlocklyNodes(sprite, nodes) {
  if (!nodes?.length) return false;
  let applied = false;
  for (const node of nodes) {
    const t = node?.type;
    if (!isRotationStyleBlockType(t)) continue;
    setRotationStyle(sprite, readRotationStyleParam(node));
    applied = true;
  }
  return applied;
}

/** True when this sprite should use rotation-style rendering during Play. */
export function usesRotationStyleRender(sprite) {
  const style = getRotationStyle(sprite);
  return style === ROTATION_STYLE_ALL_AROUND || style === ROTATION_STYLE_LEFT_RIGHT;
}

/** Last "set rotation style" block on this sprite (if any). */
export function findRotationStyleBlock(sprite) {
  if (!sprite?.blocks?.length) return null;
  let found = null;
  for (const block of sprite.blocks) {
    const t = block?.type || block?.blocklyType;
    if (isRotationStyleBlockType(t)) found = block;
  }
  return found;
}

/** Active rotation style — only after "set rotation style" runs in a script. */
export function getRotationStyle(sprite) {
  if (!sprite || sprite._rotationStyleFromScript !== true) {
    return ROTATION_STYLE_NO_ROTATION;
  }
  if (sprite.rotationStyle != null && String(sprite.rotationStyle).trim() !== '') {
    return normalizeRotationStyle(sprite.rotationStyle);
  }
  if (sprite._rotationStyle != null && String(sprite._rotationStyle).trim() !== '') {
    return normalizeRotationStyle(sprite._rotationStyle);
  }
  return ROTATION_STYLE_NO_ROTATION;
}

/**
 * Left-right style: mirror when direction is between 90° and 270° (left semicircle).
 * Normal when 0°–90° or 270°–360° (right semicircle). Never rotates upside-down.
 */
export function isLeftRightFacingLeft(direction) {
  const d = normalizeDirection(direction);
  return d > 90 || d < -90;
}

export const MOTION_REPORTER_TYPES = new Set([
  'sprite-x-reporter', 'sprite-y-reporter', 'sprite-direction-reporter',
  'motion_xposition', 'motion_yposition', 'motion_direction',
]);

// ─── Helpers ───────────────────────────────────────────────────────────────

function num(v, d = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

function txt(v, d = '') {
  return String(v ?? d);
}

function spriteSize(sprite) {
  return {
    width: sprite.width ?? sprite.w ?? 48,
    height: sprite.height ?? sprite.h ?? 48,
  };
}

/** Normalize direction to (-180, 180] (PictoBlox style). */
export function normalizeDirection(angle) {
  let a = Number(angle) || 0;
  a = ((a % 360) + 360) % 360;
  if (a > 180) a -= 360;
  return a;
}

/** @deprecated use normalizeDirection */
export function normalizeAngle(angle) {
  return normalizeDirection(angle);
}

/** Ensure sprite has direction and velocity fields (does not set rotation style — see setRotationStyle). */
export function ensureSpriteMotionState(sprite) {
  if (!sprite) return;

  if (sprite.direction == null) {
    if (sprite.rotation != null) {
      // Legacy: rotation 0° = right → new direction 90° = right
      sprite.direction = normalizeDirection(90 - sprite.rotation);
    } else {
      sprite.direction = 90;
    }
  }
  sprite.rotation = sprite.direction;

  if (sprite.velocityX == null && sprite.vx != null) sprite.velocityX = sprite.vx;
  if (sprite.velocityY == null && sprite.vy != null) sprite.velocityY = sprite.vy;
  if (sprite.vx == null) sprite.vx = sprite.velocityX ?? 0;
  if (sprite.vy == null) sprite.vy = sprite.velocityY ?? 0;
}

export function getDirection(sprite) {
  ensureSpriteMotionState(sprite);
  return normalizeDirection(sprite.direction);
}

export function setDirection(sprite, angle) {
  const d = normalizeDirection(angle);
  sprite.direction = d;
  sprite.rotation = d;
}

/** Turn clockwise (Scratch/PictoBlox): add degrees to direction (0°=up, 90°=right). */
export function turnClockwise(sprite, degrees) {
  setDirection(sprite, getDirection(sprite) + num(degrees, 0));
}

/** Turn anticlockwise: subtract degrees from direction. */
export function turnAnticlockwise(sprite, degrees) {
  setDirection(sprite, getDirection(sprite) - num(degrees, 0));
}

/** Logical center from canvas top-left position. */
export function canvasToLogical(sprite) {
  const { width, height } = spriteSize(sprite);
  const cx = (sprite.x ?? 0) + width / 2;
  const cy = (sprite.y ?? 0) + height / 2;
  return {
    x: cx - STAGE_HALF_W,
    y: STAGE_HALF_H - cy,
  };
}

/** Keep logical center inside stage bounds. */
export function clampLogicalPosition(lx, ly, sprite) {
  const { width, height } = spriteSize(sprite);
  const hw = width / 2;
  const hh = height / 2;
  return {
    x: Math.max(-STAGE_HALF_W + hw, Math.min(STAGE_HALF_W - hw, lx)),
    y: Math.max(-STAGE_HALF_H + hh, Math.min(STAGE_HALF_H - hh, ly)),
  };
}

/** Apply logical center position to canvas top-left. */
export function applyLogicalPosition(sprite, lx, ly) {
  const { width, height } = spriteSize(sprite);
  const c = clampLogicalPosition(lx, ly, sprite);
  sprite.x = c.x + STAGE_HALF_W - width / 2;
  sprite.y = STAGE_HALF_H - c.y - height / 2;
}

/** Canvas point (top-left origin) → logical coords. */
export function canvasPointToLogical(canvasX, canvasY) {
  return {
    x: canvasX - STAGE_HALF_W,
    y: STAGE_HALF_H - canvasY,
  };
}

export function getLogicalPosition(sprite) {
  return canvasToLogical(sprite);
}

export function isMotionBlock(type) {
  return MOTION_BLOCK_TYPES.has(type);
}

export function isMotionReporter(type) {
  return MOTION_REPORTER_TYPES.has(type);
}

/** True if sprite's block list includes move/glide/position change (not bounce-only scripts). */
export function spriteUsesMotionBlocks(sprite) {
  return (sprite?.blocks || []).some((b) => {
    const t = String(b.type || b.blocklyType || '');
    if (isMotionReporter(t)) return false;
    if (isEdgeBounceBlockType(t)) return false;
    if (isRotationStyleBlockType(t)) return false;
    if (t.includes('point-dir') || t.includes('pointindirection')) return false;
    if (t.includes('point-towards') || t.includes('pointtowards')) return false;
    return (
      t === 'sprite-move' || t === 'motion-move' || t === 'motion_movesteps'
      || t.includes('glide') || t.includes('goto')
      || t === 'sprite-changex' || t === 'sprite-changey'
      || t === 'motion_changex' || t === 'motion_changey'
      || t === 'sprite-setx' || t === 'sprite-sety' || t === 'motion_setx' || t === 'motion_sety'
    );
  });
}

/** Move vector for direction (0=up, 90=right). */
export function directionToDelta(direction, distance) {
  const rad = (direction * Math.PI) / 180;
  return {
    dx: Math.sin(rad) * distance,
    dy: Math.cos(rad) * distance,
  };
}

/** Angle from (lx, ly) toward (tx, ty) in logical space. */
export function angleTowards(lx, ly, tx, ty) {
  const dx = tx - lx;
  const dy = ty - ly;
  return normalizeDirection((Math.atan2(dx, dy) * 180) / Math.PI);
}

export function findSpriteByName(sprites, name, excludeId) {
  const key = String(name || '').toLowerCase();
  if (!key || key === 'any') {
    return (sprites || []).find((s) => s.id !== excludeId) || null;
  }
  return (
    (sprites || []).find(
      (s) => s.id !== excludeId && String(s.name || '').toLowerCase() === key,
    ) || null
  );
}

/** Random valid logical center inside stage bounds. */
export function randomLogicalPosition(sprite) {
  const { width, height } = spriteSize(sprite);
  return {
    x: Math.random() * (STAGE_W - width) - STAGE_HALF_W + width / 2,
    y: STAGE_HALF_H - height / 2 - Math.random() * (STAGE_H - height),
  };
}

export function startGlide(sprite, endLx, endLy, secs) {
  ensureSpriteMotionState(sprite);
  const start = canvasToLogical(sprite);
  const duration = Math.max(0.01, num(secs, 1));
  sprite._glideStartLX = start.x;
  sprite._glideStartLY = start.y;
  sprite._glideEndLX = endLx;
  sprite._glideEndLY = endLy;
  sprite._glideDuration = duration;
  sprite._glideStartTime = Date.now();
}

/** Logical units per second for move-steps animation (~Scratch timing). */
export const MOVE_SPEED_PPS = 80;

export function isGliding(sprite) {
  return sprite._glideStartLX != null && sprite._glideEndLX != null;
}

export function isMoving(sprite) {
  return (sprite._moveAnim?.remaining ?? 0) > 0.001;
}

/** True while move-steps or glide is in progress (blocks should yield). */
export function isSpriteMotionBusy(sprite) {
  return isGliding(sprite) || isMoving(sprite);
}

/** Instant move (used in tests). */
function applyMoveSteps(sprite, steps, clearVelocity) {
  const dist = num(steps, 0);
  if (dist === 0) return;
  const dir = getDirection(sprite);
  const { dx, dy } = directionToDelta(dir, dist);
  const pos = canvasToLogical(sprite);
  applyLogicalPosition(sprite, pos.x + dx, pos.y + dy);
  if (clearVelocity) {
    sprite.velocityX = 0;
    sprite.velocityY = 0;
    sprite.vx = 0;
    sprite.vy = 0;
  }
}

/**
 * Start move-steps animation. Returns true if the block should yield (busy or just started).
 */
export function beginMoveSteps(sprite, steps, clearVelocity = true) {
  if (isMoving(sprite)) return true;
  const dist = Math.abs(num(steps, 0));
  if (dist < 0.001) return false;
  sprite._moveAnim = {
    remaining: dist,
    sign: Math.sign(num(steps, 1)) || 1,
    direction: getDirection(sprite),
    clearVelocity,
  };
  return true;
}

/** Advance move-steps animation; call once per frame before running scripts. */
export function tickMoveSteps(sprite, dtSec) {
  const anim = sprite._moveAnim;
  if (!anim || anim.remaining <= 0.001) {
    if (anim) sprite._moveAnim = null;
    return;
  }
  const dt = Math.max(0, Math.min(0.05, dtSec || 0));
  const delta = Math.min(anim.remaining, MOVE_SPEED_PPS * dt);
  const { dx, dy } = directionToDelta(anim.direction, delta * anim.sign);
  const pos = canvasToLogical(sprite);
  applyLogicalPosition(sprite, pos.x + dx, pos.y + dy);
  anim.remaining -= delta;
  if (anim.remaining <= 0.001) {
    if (anim.clearVelocity) {
      sprite.velocityX = 0;
      sprite.velocityY = 0;
      sprite.vx = 0;
      sprite.vy = 0;
    }
    sprite._moveAnim = null;
    sprite._moveJustFinished = true;
  }
}

/** Call each animation frame (~60 FPS). Returns true while gliding. */
export function updateGlide(sprite) {
  if (!isGliding(sprite)) return false;
  const elapsed = Date.now() - sprite._glideStartTime;
  const totalMs = sprite._glideDuration * 1000;
  if (elapsed >= totalMs) {
    applyLogicalPosition(sprite, sprite._glideEndLX, sprite._glideEndLY);
    sprite._glideStartLX = null;
    sprite._glideEndLX = null;
    sprite.velocityX = 0;
    sprite.velocityY = 0;
    sprite.vx = 0;
    sprite.vy = 0;
    sprite._glideJustFinished = true;
    return false;
  }
  const t = elapsed / totalMs;
  const lx = sprite._glideStartLX + (sprite._glideEndLX - sprite._glideStartLX) * t;
  const ly = sprite._glideStartLY + (sprite._glideEndLY - sprite._glideStartLY) * t;
  applyLogicalPosition(sprite, lx, ly);
  return true;
}

/**
 * Scratch-style edge bounce: when touching or past the stage edge, reflect direction
 * and nudge the sprite inside bounds.
 * @returns {boolean} true if a bounce was applied
 */
export function ifOnEdgeBounce(sprite) {
  ensureSpriteMotionState(sprite);
  const { width, height } = spriteSize(sprite);
  const hw = width / 2;
  const hh = height / 2;
  let { x: lx, y: ly } = canvasToLogical(sprite);
  let dir = getDirection(sprite);

  const minX = -STAGE_HALF_W + hw;
  const maxX = STAGE_HALF_W - hw;
  const minY = -STAGE_HALF_H + hh;
  const maxY = STAGE_HALF_H - hh;
  const eps = 1;
  let bounced = false;

  const touchL = sprite.x <= eps;
  const touchR = sprite.x + width >= STAGE_W - eps;
  const touchT = sprite.y <= eps;
  const touchB = sprite.y + height >= STAGE_H - eps;

  if (touchL || lx < minX - eps) {
    dir = normalizeDirection(-dir);
    lx = minX;
    bounced = true;
  } else if (touchR || lx > maxX + eps) {
    dir = normalizeDirection(-dir);
    lx = maxX;
    bounced = true;
  }
  if (touchT || ly < minY - eps) {
    dir = normalizeDirection(180 - dir);
    ly = minY;
    bounced = true;
  } else if (touchB || ly > maxY + eps) {
    dir = normalizeDirection(180 - dir);
    ly = maxY;
    bounced = true;
  }

  if (bounced) {
    applyLogicalPosition(sprite, lx, ly);
    setDirection(sprite, dir);
    sprite.velocityX = 0;
    sprite.velocityY = 0;
    sprite.vx = 0;
    sprite.vy = 0;
    if (sprite._moveAnim) sprite._moveAnim = null;
  }

  return bounced;
}

/** Advance glide + move animations (call before script execution each frame). */
export function tickSpriteMotions(sprite, dtSec) {
  tickMoveSteps(sprite, dtSec);
  updateGlide(sprite);

  // Bounce-only scripts (no move/glide): drift so "if on edge, bounce" can actually trigger
  if (
    sprite._autoDrift
    && sprite._edgeBounceEnabled
    && !isSpriteMotionBusy(sprite)
  ) {
    const dt = Math.max(0, Math.min(0.05, dtSec || 0));
    const step = MOVE_SPEED_PPS * dt;
    const { dx, dy } = directionToDelta(getDirection(sprite), step);
    const pos = canvasToLogical(sprite);
    applyLogicalPosition(sprite, pos.x + dx, pos.y + dy);
  }

  if (sprite._edgeBounceEnabled) {
    ifOnEdgeBounce(sprite);
  }
}

export function evaluateMotionReporter(block, sprite) {
  ensureSpriteMotionState(sprite);
  const pos = canvasToLogical(sprite);
  switch (block.type) {
    case 'sprite-x-reporter':
    case 'motion_xposition':
      return pos.x;
    case 'sprite-y-reporter':
    case 'motion_yposition':
      return pos.y;
    case 'sprite-direction-reporter':
    case 'motion_direction':
      return getDirection(sprite);
    default:
      return 0;
  }
}

function resolveMotionContext(ctx) {
  const canvasMx = ctx.mouseX ?? STAGE_HALF_W;
  const canvasMy = ctx.mouseY ?? STAGE_HALF_H;
  const mouse = canvasPointToLogical(canvasMx, canvasMy);
  return {
    sprites: ctx.sprites || [],
    mouseX: mouse.x,
    mouseY: mouse.y,
    clearVelocity: ctx.clearVelocity !== false,
  };
}

function getOtherLogicalCenter(other) {
  return canvasToLogical(other);
}

/**
 * Execute a motion block on a sprite.
 * @returns {boolean|number} true = yield (block not finished); number = reporter value; false/undefined = done
 */
export function executeSpriteMotion(block, sprite, ctx = {}) {
  if (!block || !sprite) return false;
  ensureSpriteMotionState(sprite);

  const p = block.params || {};
  const instant = ctx.instant === true;
  const { sprites, mouseX, mouseY, clearVelocity } = resolveMotionContext(ctx);
  let type = block.type || block.blocklyType;
  if (isEdgeBounceBlockType(type)) type = 'sprite-if-bounce';
  else if (isRotationStyleBlockType(type)) type = 'sprite-rotation-style';
  let pos = canvasToLogical(sprite);

  const glideBlocks = new Set([
    'sprite-glide', 'motion-glide', 'motion-glide-to-xy', 'motion_glideto',
    'motion-glide-to-random-position', 'motion_glide', 'motion-glide-to-mouse-pointer',
    'motion-glide-to-sprite',
  ]);
  if (!instant && glideBlocks.has(type)) {
    if (isGliding(sprite)) return true;
    if (sprite._glideJustFinished) {
      sprite._glideJustFinished = false;
      return false;
    }
  }
  if (!instant && (type === 'sprite-move' || type === 'motion-move' || type === 'motion_movesteps')) {
    if (isMoving(sprite)) return true;
    if (sprite._moveJustFinished) {
      sprite._moveJustFinished = false;
      return false;
    }
  }

  const resolveGoTarget = (targetKey) => {
    const t = String(targetKey || p.target || p.TARGET || 'random').toLowerCase();
    if (t === 'random' || t === 'random position') {
      return randomLogicalPosition(sprite);
    }
    if (t === 'mouse' || t === 'mouse-pointer') {
      return { x: mouseX, y: mouseY };
    }
    const other = findSpriteByName(sprites, t, sprite.id);
    if (other) return getOtherLogicalCenter(other);
    return { ...pos };
  };

  switch (type) {
    case 'sprite-move':
    case 'motion-move':
    case 'motion_movesteps': {
      const steps = num(p.steps ?? p.STEPS, 10);
      if (instant) {
        applyMoveSteps(sprite, steps, clearVelocity);
        return false;
      }
      return beginMoveSteps(sprite, steps, clearVelocity);
    }
    case 'sprite-turn-right':
    case 'motion-turn-right':
    case 'motion_turnright':
      turnClockwise(sprite, num(p.degrees ?? p.DEGREES, 15));
      break;
    case 'sprite-turn-left':
    case 'motion-turn-left':
    case 'motion_turnleft':
      turnAnticlockwise(sprite, num(p.degrees ?? p.DEGREES, 15));
      break;
    case 'sprite-turn':
    case 'motion-turn':
    case 'motion-change-angle':
      setDirection(sprite, getDirection(sprite) + num(p.degrees ?? p.angle ?? p.DEGREES, 0));
      break;
    case 'sprite-goto':
    case 'motion-goto':
    case 'motion-goto-xy':
    case 'motion_gotoxy':
      applyLogicalPosition(sprite, num(p.x ?? p.X, pos.x), num(p.y ?? p.Y, pos.y));
      break;
    case 'sprite-goto-random-position':
    case 'motion-goto-random-position': {
      const target = randomLogicalPosition(sprite);
      applyLogicalPosition(sprite, target.x, target.y);
      break;
    }
    case 'sprite-goto-mouse-pointer':
    case 'motion-goto-mouse-pointer':
      applyLogicalPosition(sprite, mouseX, mouseY);
      break;
    case 'sprite-goto-sprite':
    case 'motion-goto-sprite': {
      const other = findSpriteByName(sprites, p.sprite ?? p.SPRITE ?? p.target, sprite.id);
      if (other) {
        const t = getOtherLogicalCenter(other);
        applyLogicalPosition(sprite, t.x, t.y);
      }
      break;
    }
    case 'motion_goto': {
      const target = resolveGoTarget(p.TARGET ?? p.target);
      applyLogicalPosition(sprite, target.x, target.y);
      break;
    }
    case 'sprite-glide':
    case 'motion-glide':
    case 'motion-glide-to-xy':
    case 'motion_glideto':
      startGlide(sprite, num(p.x ?? p.X, pos.x), num(p.y ?? p.Y, pos.y), num(p.secs ?? p.SECS, 1));
      return instant ? false : true;
    case 'motion-glide-to-random-position': {
      const target = randomLogicalPosition(sprite);
      startGlide(sprite, target.x, target.y, num(p.secs ?? p.SECS, 1));
      return instant ? false : true;
    }
    case 'motion_glide': {
      const target = resolveGoTarget(p.TARGET ?? p.target);
      startGlide(sprite, target.x, target.y, num(p.secs ?? p.SECS, 1));
      return instant ? false : true;
    }
    case 'motion-glide-to-mouse-pointer':
      startGlide(sprite, mouseX, mouseY, num(p.secs ?? p.SECS, 1));
      return instant ? false : true;
    case 'motion-glide-to-sprite': {
      const other = findSpriteByName(sprites, p.sprite ?? p.SPRITE, sprite.id);
      const t = other ? getOtherLogicalCenter(other) : pos;
      startGlide(sprite, t.x, t.y, num(p.secs ?? p.SECS, 1));
      return instant ? false : true;
    }
    case 'sprite-changex':
    case 'motion-changex':
    case 'motion_changex':
      applyLogicalPosition(sprite, pos.x + num(p.amount ?? p.DX ?? p.dx, 10), pos.y);
      break;
    case 'sprite-setx':
    case 'motion-setx':
    case 'motion_setx':
      applyLogicalPosition(sprite, num(p.x ?? p.X, pos.x), pos.y);
      break;
    case 'sprite-changey':
    case 'motion-changey':
    case 'motion_changey':
      applyLogicalPosition(sprite, pos.x, pos.y + num(p.amount ?? p.DY ?? p.dy, 10));
      break;
    case 'sprite-sety':
    case 'motion-sety':
    case 'motion_sety':
      applyLogicalPosition(sprite, pos.x, num(p.y ?? p.Y, pos.y));
      break;
    case 'sprite-point-dir':
    case 'motion-point-dir':
    case 'motion_pointindirection':
      setDirection(sprite, num(p.degrees ?? p.direction ?? p.DIRECTION, 90));
      break;
    case 'motion-rotation':
      setDirection(sprite, num(p.rotation ?? p.ROTATION, 90));
      break;
    case 'sprite-point-towards':
    case 'motion-point-towards':
    case 'motion-point':
    case 'motion_pointtowards': {
      const target = txt(p.target ?? p.sprite ?? p.TOWARDS, 'mouse-pointer').toLowerCase();
      let tx = mouseX;
      let ty = mouseY;
      if (target !== 'mouse-pointer' && target !== 'mouse') {
        const other = findSpriteByName(sprites, target, sprite.id);
        if (other) {
          const t = getOtherLogicalCenter(other);
          tx = t.x;
          ty = t.y;
        }
      }
      setDirection(sprite, angleTowards(pos.x, pos.y, tx, ty));
      break;
    }
    case 'sprite-if-bounce':
    case 'motion-if-on-edge-bounce':
    case 'motion_ifonedgebounce':
      sprite._edgeBounceEnabled = true;
      ifOnEdgeBounce(sprite);
      if (!spriteUsesMotionBlocks(sprite)) {
        sprite._autoDrift = true;
      }
      break;
    case 'sprite-rotation-style':
    case 'motion-set-rotation-style':
    case 'motion_setrotationstyle':
      setRotationStyle(sprite, readRotationStyleParam(block));
      break;
    case 'sprite-x-reporter':
    case 'sprite-y-reporter':
    case 'sprite-direction-reporter':
    case 'motion_xposition':
    case 'motion_yposition':
    case 'motion_direction':
      return evaluateMotionReporter(block, sprite);
    default:
      return false;
  }
  return false;
}

/**
 * Set rotation style rendering (Scratch spec):
 * - all around: rotate canvas by sprite.direction°
 * - left-right: horizontal flip only when direction ∈ (90°, 270°)
 * - no rotation: no transform (direction still used for movement)
 */

/** @returns {1|-1} Horizontal mirror for left-right style. */
export function getRenderScaleX(sprite) {
  ensureSpriteMotionState(sprite);
  if (getRotationStyle(sprite) !== ROTATION_STYLE_LEFT_RIGHT) return 1;
  return isLeftRightFacingLeft(getDirection(sprite)) ? -1 : 1;
}

/** Radians to rotate for "all around" (0 = none). */
export function getRenderRotation(sprite) {
  ensureSpriteMotionState(sprite);
  const style = getRotationStyle(sprite);
  if (style !== ROTATION_STYLE_ALL_AROUND) return 0;
  const dir = getDirection(sprite);
  const rot = (dir * Math.PI) / 180;
  return rot;
}

/**
 * Apply rotation style when drawing a sprite (call after translate to sprite center).
 * Matches: translate → rotate/flip → drawImage → restore
 */
export function applyCanvasRotationStyle(ctx, sprite) {
  ensureSpriteMotionState(sprite);
  const rot = getRenderRotation(sprite);
  const scaleX = getRenderScaleX(sprite);
  if (rot) ctx.rotate(rot);
  if (scaleX !== 1) ctx.scale(scaleX, 1);
}

/** Reset rotation at play start — style applies only when the block runs. */
export function syncPlayRotationStyle(sprite, _blocklyNodes = null) {
  if (!sprite) return;
  delete sprite.rotationStyle;
  delete sprite._rotationStyle;
  sprite._rotationStyleFromScript = false;
}

/** Set velocity from direction + speed (logical → canvas velocity). */
export function setVelocityFromDirection(sprite, speed) {
  ensureSpriteMotionState(sprite);
  const dir = getDirection(sprite);
  const { dx, dy } = directionToDelta(dir, speed);
  sprite.velocityX = dx;
  sprite.velocityY = dy;
  sprite.vx = dx;
  sprite.vy = -dy;
}
