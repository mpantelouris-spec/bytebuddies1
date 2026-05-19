/**
 * Per-sprite physics helpers (shared with Game Builder runtime).
 */

import {
  createPhysicsState,
  DEFAULT_GRAVITY_PPS2,
  normalizeGravityPps2,
  normalizeJumpImpulse,
  applyJumpImpulse,
  getPlatformRects,
} from './gameBuilderPlatformer';

const DEFAULT_STAGE_W = 480;
const DEFAULT_STAGE_H = 360;

export function initializeSpriteState(sprites) {
  const spriteVars = {};
  sprites.forEach((sprite) => {
    spriteVars[sprite.id] = createPhysicsState();
  });
  return spriteVars;
}

/** @deprecated Use gameBuilderPlatformer.integratePlatformerSprite from the game loop */
export function updateSpritePhysics(sprite, spriteVars, STAGE_W, STAGE_H) {
  const state = spriteVars[sprite.id];
  if (!state) return;
  const supported =
    sprite.y + sprite.h >= STAGE_H - 1.5 &&
    sprite.x >= 0 &&
    sprite.x + sprite.w <= STAGE_W;
  if (!supported || state.vy < 0) {
    state.vy = (state.vy || 0) + (state.gravityPps2 || 2400) * (1 / 60);
  } else {
    state.vy = 0;
  }
  sprite.x += (state.vx || 0) * (1 / 60);
  sprite.y += (state.vy || 0) * (1 / 60);
  sprite.x = Math.max(0, Math.min(STAGE_W - sprite.w, sprite.x));
  if (sprite.y + sprite.h > STAGE_H) {
    sprite.y = STAGE_H - sprite.h;
    state.vy = 0;
    state.isJumping = false;
    state.grounded = true;
    state.usedDoubleJump = false;
  }
  sprite.y = Math.max(-sprite.h, sprite.y);
}

export function applySpriteBlockEffect(block, sprite, spriteVars, allSprites, globalVars) {
  const params = block.params || {};
  const state = spriteVars[sprite.id];

  if (!state) return;

  const num = (v, d = 0) => {
    const n = parseFloat(v);
    return isNaN(n) ? d : n;
  };

  switch (block.type) {
    case 'sprite-move':
      sprite.x += num(params.steps, 0);
      break;
    case 'sprite-changex':
      sprite.x += num(params.amount, 0);
      break;
    case 'sprite-changey':
      sprite.y += num(params.amount, 0);
      break;
    case 'sprite-show':
      sprite.visible = true;
      break;
    case 'sprite-hide':
      sprite.visible = false;
      break;
    case 'sprite-setsize': {
      const scale = num(params.size, 100) / 100;
      const oldW = sprite.w;
      sprite.w = Math.max(8, Math.round(oldW * scale));
      sprite.h = Math.max(8, Math.round(sprite.h * scale));
      break;
    }
    case 'sprite-say':
      sprite._sayText = (params.text || '').replace(/"/g, '');
      sprite._sayUntil = Date.now() + num(params.secs, 2) * 1000;
      break;

    case 'physics-velocity':
      state.vx = num(params.vx, state.vx || 0);
      state.vy = num(params.vy, state.vy || 0);
      break;
    case 'physics-gravity':
      state.gravityPps2 = normalizeGravityPps2(params.amount);
      break;
    case 'physics-jump':
      if ((state.gravityPps2 || 0) <= 0) state.gravityPps2 = DEFAULT_GRAVITY_PPS2;
      applyJumpImpulse(state, normalizeJumpImpulse(params.power), { force: true }, {
        sprite,
        platformRects: getPlatformRects(allSprites, sprite.id),
        stageW: DEFAULT_STAGE_W,
        stageH: DEFAULT_STAGE_H,
      });
      break;
    case 'motion-jump':
      if ((state.gravityPps2 || 0) <= 0) state.gravityPps2 = DEFAULT_GRAVITY_PPS2;
      applyJumpImpulse(state, normalizeJumpImpulse(params.power), { force: true }, {
        sprite,
        platformRects: getPlatformRects(allSprites, sprite.id),
        stageW: DEFAULT_STAGE_W,
        stageH: DEFAULT_STAGE_H,
      });
      break;
    case 'physics-push': {
      const rad = (num(params.direction, 0) * Math.PI) / 180;
      const force = num(params.force, 5);
      state.vx = (state.vx || 0) + Math.cos(rad) * force;
      state.vy = (state.vy || 0) + Math.sin(rad) * force;
      break;
    }
    case 'physics-friction':
      state.vx = (state.vx || 0) * num(params.amount, 0.9);
      state.vy = (state.vy || 0) * num(params.amount, 0.9);
      break;
    case 'physics-bounce':
      if (sprite.x <= 0 || sprite.x >= DEFAULT_STAGE_W - sprite.w) state.vx = -(state.vx || 0);
      if (sprite.y <= 0) state.vy = -(state.vy || 0);
      break;
    case 'physics-allow-double-jump':
      state.allowDoubleJump = params.enable !== 'false' && params.enable !== false;
      if (!state.allowDoubleJump) state.usedDoubleJump = false;
      break;

    case 'var-create':
    case 'var-set':
      state._vars[params.name] = num(params.value, 0);
      break;
    case 'var-change':
      state._vars[params.name] = (state._vars[params.name] || 0) + num(params.amount, 0);
      break;
    case 'var-show':
      sprite._sayText = `${params.name || 'var'}=${state._vars[params.name] ?? 0}`;
      sprite._sayUntil = Date.now() + 1500;
      break;

    case 'math-add':
      globalVars._math = num(params.a, 0) + num(params.b, 0);
      break;
    case 'math-mult':
      globalVars._math = num(params.a, 0) * num(params.b, 0);
      break;
    case 'math-random':
      globalVars._math =
        Math.floor(Math.random() * (num(params.max, 100) - num(params.min, 1) + 1)) + num(params.min, 1);
      break;
    default:
      break;
  }
}

export function getSpriteSayText(sprite) {
  if (!sprite._sayText || Date.now() > sprite._sayUntil) {
    return null;
  }
  return sprite._sayText;
}
