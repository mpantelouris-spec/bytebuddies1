/**
 * Per-Sprite Physics and Variable Management
 * Ensures each sprite has independent physics calculations
 */

export function initializeSpriteState(sprites) {
  /**
   * Create a variable scope per sprite that includes:
   * - Local variables (sprite-specific)
   * - Physics state (velocity, gravity, etc.)
   */
  const spriteVars = {};
  sprites.forEach(sprite => {
    spriteVars[sprite.id] = {
      // Physics
      vx: 0,
      vy: 0,
      gravity: 0.5,

      // Jump state
      isJumping: false,
      jumpVelocity: 0,
      isGrounded: true,
      
      // Display
      _sayText: null,
      _sayUntil: 0,
      
      // Custom variables (user-created)
      _vars: {},
    };
  });
  return spriteVars;
}

export function updateSpritePhysics(sprite, spriteVars, STAGE_W, STAGE_H) {
  const state = spriteVars[sprite.id];
  if (!state) return;

  // Apply gravity if enabled
  if (state.gravity && state.gravity > 0) {
    state.vy = (state.vy || 0) + state.gravity;
  }

  // Update position based on velocity
  sprite.x += state.vx || 0;
  sprite.y += state.vy || 0;

  // Keep sprite in bounds (X always, Y only if not jumping/falling)
  sprite.x = Math.max(0, Math.min(STAGE_W - sprite.w, sprite.x));

  // Allow sprites to go above the screen for jumping
  if (sprite.y + sprite.h > STAGE_H) {
    sprite.y = STAGE_H - sprite.h;
    state.vy = 0;
    state.isJumping = false;
    state.isGrounded = true;
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
      sprite._sayUntil = Date.now() + (num(params.secs, 2) * 1000);
      break;

    // Physics blocks - PER SPRITE
    case 'physics-velocity':
      state.vx = num(params.vx, state.vx || 0);
      state.vy = num(params.vy, state.vy || 0);
      break;
    case 'physics-gravity':
      state.gravity = num(params.amount, 0.5);
      break;
    case 'physics-jump':
      state.vy = -Math.abs(num(params.power, 10));
      state.isJumping = true;
      state.isGrounded = false;
      break;
    case 'motion-jump': {
      if (!state.gravity) state.gravity = 0.5;
      state.vy = -Math.abs(num(params.power, 10));
      state.isJumping = true;
      state.isGrounded = false;
      break;
    }
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
      if (sprite.x <= 0 || sprite.x >= STAGE_W - sprite.w) state.vx = -(state.vx || 0);
      if (sprite.y <= 0 || sprite.y >= STAGE_H - sprite.h) state.vy = -(state.vy || 0);
      break;

    // Variables
    case 'var-create':
    case 'var-set':
      state._vars[params.name] = num(params.value, 0);
      break;
    case 'var-change':
      state._vars[params.name] = (state._vars[params.name] || 0) + (num(params.amount, 0));
      break;
    case 'var-show':
      sprite._sayText = `${params.name || 'var'}=${state._vars[params.name] ?? 0}`;
      sprite._sayUntil = Date.now() + 1500;
      break;

    // Global variables (if needed)
    case 'math-add':
      globalVars._math = num(params.a, 0) + num(params.b, 0);
      break;
    case 'math-mult':
      globalVars._math = num(params.a, 0) * num(params.b, 0);
      break;
    case 'math-random':
      globalVars._math = Math.floor(Math.random() * (num(params.max, 100) - num(params.min, 1) + 1)) + num(params.min, 1);
      break;
  }
}

export function getSpriteSayText(sprite) {
  if (!sprite._sayText || Date.now() > sprite._sayUntil) {
    return null;
  }
  return sprite._sayText;
}
