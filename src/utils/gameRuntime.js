/**
 * Game Runtime Engine
 * Manages game execution, events, timing, and block sequence execution
 */

import { runExtensionGame } from './extensionEngine';
import { normalizeRotationStyle, readRotationStyleParam, setRotationStyle } from './spriteMotion';

export class GameRuntime {
  constructor(sprites, globalVars = {}) {
      // Simulated loudness value (replace with real mic input if available)
      this.loudness = 0;
    this.sprites = sprites;
    this.globalVars = { ...globalVars };
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      time: 0,
      gameRunning: true,
      gamePaused: false,
    };

    // Sprite-specific state
    this.spriteVars = {};
    this.initializeSpriteState();

    // Event system
    this.eventListeners = {
      keyPress: [],
      collision: [],
      gameStart: [],
      message: [],
      click: [],
      backdropSwitch: [], // New event type for backdrop switches
      loudness: [], // New event type for loudness threshold
    };

    // Timing
    this.startTime = Date.now();
    this.lastFrameTime = this.startTime;

    // Input state
    this.keysPressed = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseClicked = false;

    // Execution tracking
    this.blocksExecutedThisFrame = 0;
    this.maxBlocksPerFrame = 1000; // Prevent infinite loops
  }

  // ─── Initialization ───
  initializeSpriteState() {
    this.sprites.forEach(sprite => {
      this.spriteVars[sprite.id] = {
        // Physics (aligned with gameBuilderPlatformer)
        vx: 0,
        vy: 0,
        gravityPps2: 2400,
        maxFallPps: 980,
        friction: 1,
        isJumping: false,
        grounded: true,
        allowDoubleJump: false,
        usedDoubleJump: false,
        rotation: 0,
        direction: 90,

        // Display
        sayText: null,
        sayUntil: 0,
        thinkText: null,
        thinkUntil: 0,
        costumeIndex: 0,
        effects: {
          color: 0,
          fisheye: 0,
          whirl: 0,
          pixelate: 0,
          mosaic: 0,
          brightness: 0,
          ghost: 0,
        },

        // Variables (user-created)
        _vars: {},

        // Clones
        isClone: false,
        cloneOf: null,
      };
    });
  }

  // ─── Event Registration ───
  registerEventListener(eventType, sprite, block) {
        // Special handling for 'when [loudness v] > ()'
        if (eventType === 'loudness' && block && block.params && block.params.threshold) {
          block._loudnessThreshold = parseFloat(block.params.threshold);
        }
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    // Special handling for 'when backdrop switches to [backdrop1 v]'
    if (eventType === 'backdropSwitch' && block && block.params && block.params.backdrop) {
      // Store the backdrop index to listen for
      block._listenBackdropIndex = parseInt(block.params.backdrop, 10) - 1;
    }
    this.eventListeners[eventType].push({ sprite, block, active: true });
  }

  triggerEvent(eventType, detail = {}) {
        // For loudness, only trigger if the current loudness exceeds the threshold
        if (eventType === 'loudness') {
          const listeners = this.eventListeners[eventType] || [];
          listeners.forEach(({ sprite, block, active }) => {
            if (!active || !sprite) return;
            if (block && typeof block._loudnessThreshold === 'number') {
              if (this.loudness > block._loudnessThreshold) {
                this.executeBlockSequence(sprite, block.connectedBlocks || []);
              }
            }
          });
          return;
        }
    const listeners = this.eventListeners[eventType] || [];
    listeners.forEach(({ sprite, block, active }) => {
      if (!active || !sprite) return;
      // For backdropSwitch, only trigger if the backdrop matches
      if (eventType === 'backdropSwitch' && block && typeof block._listenBackdropIndex === 'number') {
        if (detail.backdropIndex !== block._listenBackdropIndex) return;
      }
      this.executeBlockSequence(sprite, block.connectedBlocks || []);
    });
  }

  // ─── Game State ───
  addScore(amount) {
    this.gameState.score += amount;
  }

  setScore(value) {
    this.gameState.score = value;
  }

  loseLife() {
    this.gameState.lives--;
    if (this.gameState.lives <= 0) {
      this.endGame(false);
    }
  }

  setLives(value) {
    this.gameState.lives = value;
  }

  endGame(won = false) {
    this.gameState.gameRunning = false;
    return { won, score: this.gameState.score, level: this.gameState.level };
  }

  nextLevel() {
    this.gameState.level++;
  }

  // ─── Block Execution ───
  executeBlockSequence(sprite, blocks = [], depth = 0) {
    if (depth > 100) {
      console.warn('Block recursion depth exceeded');
      return;
    }

    const state = this.spriteVars[sprite.id];
    if (!state) return;

    for (let block of blocks) {
      if (!this.gameState.gameRunning) break;
      if (this.blocksExecutedThisFrame++ > this.maxBlocksPerFrame) {
        console.warn('Block execution limit exceeded - possible infinite loop');
        break;
      }

      this.executeBlockWithChildren(block, sprite, state, depth);
    }
  }

  executeBlockWithChildren(block, sprite, state, depth = 0) {
    const params = block.params || {};
    const num = (v, d = 0) => {
      const n = parseFloat(v);
      return isNaN(n) ? d : n;
    };

    // Handle control flow blocks that have child blocks
    if (block.type === 'loop-repeat') {
      const times = num(params.times, 10);
      for (let i = 0; i < times; i++) {
        if (!this.gameState.gameRunning) break;
        this.executeBlockSequence(sprite, block.childBlocks || [], depth + 1);
      }
    } else if (block.type === 'loop-forever') {
      while (this.gameState.gameRunning) {
        this.executeBlockSequence(sprite, block.childBlocks || [], depth + 1);
        if (this.blocksExecutedThisFrame > this.maxBlocksPerFrame) break;
      }
    } else if (block.type === 'logic-if') {
      const condition = this.evaluateCondition(params.condition, sprite, state);
      if (condition) {
        this.executeBlockSequence(sprite, block.thenBlocks || [], depth + 1);
      } else {
        this.executeBlockSequence(sprite, block.elseBlocks || [], depth + 1);
      }
    } else if (block.type === 'control-wait') {
      // Simplified wait - in full implementation would need async
      const ms = num(params.secs, 1) * 1000;
      const startTime = Date.now();
      while (Date.now() - startTime < ms && this.gameState.gameRunning) {
        // Busy wait (not ideal, but works for simple cases)
      }
    } else if (block.type === 'motion-if-on-edge-bounce') {
      // If on edge, bounce logic
      // Assume stage size 480x360, sprite has x, y, w, h, direction
      let bounced = false;
      if (sprite.x <= 0 || sprite.x + sprite.w >= 480) {
        state.direction = 180 - state.direction;
        bounced = true;
      }
      if (sprite.y <= 0 || sprite.y + sprite.h >= 360) {
        state.direction = 360 - state.direction;
        bounced = true;
      }
      if (bounced) {
        // Clamp direction to [0, 360)
        state.direction = ((state.direction % 360) + 360) % 360;
      }
    } else {
      // Regular block execution
      this.executeBlock(block, sprite, state);
    }
  }

  evaluateCondition(condition, sprite, state) {
    if (!condition) return false;

    const state_vars = state._vars;
    const condition_str = String(condition);

    // Simple condition evaluator
    try {
      // Replace variable names with values
      let expr = condition_str;
      Object.keys(state_vars).forEach(varName => {
        expr = expr.replace(new RegExp('\\b' + varName + '\\b', 'g'), state_vars[varName]);
      });

      // Evaluate
      return Function('"use strict"; return (' + expr + ')')();
    } catch (e) {
      console.warn('Condition evaluation error:', e);
      return false;
    }
  }

  executeBlock(block, sprite, state) {
    if (!block || !block.type) return;

    const params = block.params || {};
    const num = (v, d = 0) => {
      const n = parseFloat(v);
      return isNaN(n) ? d : n;
    };
    const str = (v, d = '') => String(v || d);

    // ═══ MOTION BLOCKS (Scratch-accurate) ═══
    const normalizeAngle = (angle) => {
      let a = angle % 360;
      if (a < 0) a += 360;
      return a;
    };
    const STAGE_W = 480;
    const STAGE_H = 360;

    // 1. move (steps)
    if (block.type === 'motion_movesteps') {
      const steps = num(params.STEPS || params.steps, 10);
      const dir = normalizeAngle(state.direction ?? 90);
      const rad = dir * Math.PI / 180;
      sprite.x += Math.cos(rad) * steps;
      sprite.y -= Math.sin(rad) * steps;
      state.vx = 0; state.vy = 0;
    }
    // 2. turn clockwise (degrees)
    else if (block.type === 'motion_turnright') {
      const deg = num(params.DEGREES || params.degrees, 15);
      state.direction = normalizeAngle((state.direction ?? 90) + deg);
    }
    // 3. turn anticlockwise (degrees)
    else if (block.type === 'motion_turnleft') {
      const deg = num(params.DEGREES || params.degrees, 15);
      state.direction = normalizeAngle((state.direction ?? 90) - deg);
    }
    // 4/5/6. go to [random/mouse/sprite]
    else if (block.type === 'motion_goto') {
      const target = params.TARGET || params.target;
      if (target === 'random') {
        sprite.x = Math.random() * (STAGE_W - sprite.w) + sprite.w / 2;
        sprite.y = Math.random() * (STAGE_H - sprite.h) + sprite.h / 2;
      } else if (target === 'mouse' || target === 'mouse-pointer') {
        sprite.x = this.mouseX;
        sprite.y = this.mouseY;
      } else if (target) {
        const targetSprite = this.sprites.find(s => s.name === target);
        if (targetSprite) {
          sprite.x = targetSprite.x;
          sprite.y = targetSprite.y;
        }
      }
      state.vx = 0; state.vy = 0;
    }
    // 7. go to x: () y: ()
    else if (block.type === 'motion_gotoxy') {
      sprite.x = num(params.X || params.x, sprite.x);
      sprite.y = num(params.Y || params.y, sprite.y);
      state.vx = 0; state.vy = 0;
    }
    // 8/9/10. glide (secs) to [random/mouse/sprite/x,y]
    else if (block.type === 'motion_glide') {
      const secs = Math.max(0.1, num(params.SECS || params.secs, 1));
      const target = params.TARGET || params.target;
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
      if (target === 'random') {
        state.glideEndX = Math.random() * (STAGE_W - sprite.w) + sprite.w / 2;
        state.glideEndY = Math.random() * (STAGE_H - sprite.h) + sprite.h / 2;
      } else if (target === 'mouse' || target === 'mouse-pointer') {
        state.glideEndX = this.mouseX;
        state.glideEndY = this.mouseY;
      } else if (target) {
        const targetSprite = this.sprites.find(s => s.name === target);
        if (targetSprite) {
          state.glideEndX = targetSprite.x;
          state.glideEndY = targetSprite.y;
        } else {
          state.glideEndX = sprite.x;
          state.glideEndY = sprite.y;
        }
      } else {
        state.glideEndX = num(params.X || params.x, sprite.x);
        state.glideEndY = num(params.Y || params.y, sprite.y);
      }
    }
    // 11. point in direction ()
    else if (block.type === 'motion_pointindirection') {
      const deg = num(params.DIRECTION || params.degrees || params.direction, 90);
      state.direction = normalizeAngle(deg);
    }
    // 12. point towards [mouse/sprite]
    else if (block.type === 'motion_pointtowards') {
      let targetSprite = null;
      const target = params.TARGET || params.sprite;
      if (target && target !== 'mouse' && target !== 'mouse-pointer') {
        targetSprite = this.sprites.find(s => s.name === target);
      }
      const targetX = targetSprite ? targetSprite.x : this.mouseX;
      const targetY = targetSprite ? targetSprite.y : this.mouseY;
      const dx = targetX - sprite.x;
      const dy = targetY - sprite.y;
      state.direction = normalizeAngle(Math.atan2(-dy, dx) * 180 / Math.PI);
    }
    // 13. change x by ()
    else if (block.type === 'motion_changex') {
      sprite.x += num(params.DX || params.amount, 10);
    }
    // 14. set x to ()
    else if (block.type === 'motion_setx') {
      sprite.x = num(params.X || params.x, sprite.x);
    }
    // 15. change y by ()
    else if (block.type === 'motion_changey') {
      sprite.y += num(params.DY || params.amount, 10);
    }
    // 16. set y to ()
    else if (block.type === 'motion_sety') {
      sprite.y = num(params.Y || params.y, sprite.y);
    }
    // 17. if on edge, bounce
    else if (block.type === 'motion_ifonedgebounce') {
      const left = sprite.x - sprite.w / 2;
      const right = sprite.x + sprite.w / 2;
      const top = sprite.y - sprite.h / 2;
      const bottom = sprite.y + sprite.h / 2;
      let bounced = false;
      if (left < 0) {
        state.direction = normalizeAngle(180 - state.direction);
        sprite.x = sprite.w / 2;
        bounced = true;
      } else if (right > STAGE_W) {
        state.direction = normalizeAngle(180 - state.direction);
        sprite.x = STAGE_W - sprite.w / 2;
        bounced = true;
      }
      if (top < 0) {
        state.direction = normalizeAngle(-state.direction);
        sprite.y = sprite.h / 2;
        bounced = true;
      } else if (bottom > STAGE_H) {
        state.direction = normalizeAngle(-state.direction);
        sprite.y = STAGE_H - sprite.h / 2;
        bounced = true;
      }
    }
    // 18. set rotation style
    else if (block.type === 'motion_setrotationstyle') {
      setRotationStyle(sprite, readRotationStyleParam(block));
    }
    // 19. x position (reporter)
    else if (block.type === 'motion_xposition') {
      return sprite.x;
    }
    // 20. y position (reporter)
    else if (block.type === 'motion_yposition') {
      return sprite.y;
    }
    // 21. direction (reporter)
    else if (block.type === 'motion_direction') {
      return state.direction ?? 90;
    }
    else if (block.type === 'motion_glide' || block.type === 'sprite-glide') {
      const secs = Math.max(0.1, num(params.SECS || params.secs, 1));
      const target = params.TARGET || params.target;
      
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
      
      if (target === 'random') {
        const STAGE_W = 480;
        const STAGE_H = 360;
        state.glideEndX = Math.random() * (STAGE_W - sprite.w) + sprite.w / 2;
        state.glideEndY = Math.random() * (STAGE_H - sprite.h) + sprite.h / 2;
      } else if (target === 'mouse' || target === 'mouse-pointer') {
        state.glideEndX = this.mouseX;
        state.glideEndY = this.mouseY;
      } else if (target) {
        const targetSprite = this.sprites.find(s => s.name === target);
        if (targetSprite) {
          state.glideEndX = targetSprite.x;
          state.glideEndY = targetSprite.y;
        } else {
          state.glideEndX = sprite.x;
          state.glideEndY = sprite.y;
        }
      } else {
        state.glideEndX = sprite.x;
        state.glideEndY = sprite.y;
      }
    }
    else if (block.type === 'motion_glideto' || block.type === 'motion-glide-to-xy') {
      const secs = Math.max(0.1, num(params.SECS || params.secs, 1));
      state.glideEndX = num(params.X || params.x, sprite.x);
      state.glideEndY = num(params.Y || params.y, sprite.y);
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
    }
    else if (block.type === 'motion_changex' || block.type === 'sprite-changex' || block.type === 'motion-changex') {
      sprite.x += num(params.DX || params.amount, 10);
    }
    else if (block.type === 'motion_setx' || block.type === 'sprite-setx' || block.type === 'motion-setx') {
      sprite.x = num(params.X || params.x, sprite.x);
    }
    else if (block.type === 'motion_changey' || block.type === 'sprite-changey' || block.type === 'motion-changey') {
      sprite.y += num(params.DY || params.amount, 10);
    }
    else if (block.type === 'motion_sety' || block.type === 'sprite-sety' || block.type === 'motion-sety') {
      sprite.y = num(params.Y || params.y, sprite.y);
    }
    else if (block.type === 'motion_ifonedgebounce' || block.type === 'sprite-if-bounce' || block.type === 'motion-if-on-edge-bounce') {
      const STAGE_W = 480;
      const STAGE_H = 360;
      const left = sprite.x - sprite.w / 2;
      const right = sprite.x + sprite.w / 2;
      const top = sprite.y - sprite.h / 2;
      const bottom = sprite.y + sprite.h / 2;

      if (left < 0) {
        state.direction = normalizeAngle(180 - state.direction);
        sprite.x = sprite.w / 2;
      } else if (right > STAGE_W) {
        state.direction = normalizeAngle(180 - state.direction);
        sprite.x = STAGE_W - sprite.w / 2;
      }

      if (top < 0) {
        state.direction = normalizeAngle(-state.direction);
        sprite.y = sprite.h / 2;
      } else if (bottom > STAGE_H) {
        state.direction = normalizeAngle(-state.direction);
        sprite.y = STAGE_H - sprite.h / 2;
      }
    }
    else if (block.type === 'motion_setrotationstyle' || block.type === 'sprite-rotation-style' || block.type === 'motion-set-rotation-style') {
      setRotationStyle(sprite, readRotationStyleParam(block));
    }
    else if (block.type === 'motion_xposition' || block.type === 'sprite-x-reporter') {
      return sprite.x;
    }
    else if (block.type === 'motion_yposition' || block.type === 'sprite-y-reporter') {
      return sprite.y;
    }
    else if (block.type === 'motion_direction' || block.type === 'sprite-direction-reporter') {
      return state.direction || 90;
    }
    else if (block.type === 'motion-rotation') {
      const degrees = num(params.rotation, 0);
      state.direction = normalizeAngle(degrees);
    }
    else if (block.type === 'motion-change-angle') {
      const angle = num(params.angle, 15);
      state.direction = normalizeAngle((state.direction || 0) + angle);
    }
    else if (block.type === 'motion-speed') {
      const speed = num(params.speed, 5);
      state.speed = speed;
      const dir = normalizeAngle(state.direction || 0);
      const rad = dir * Math.PI / 180;
      state.vx = Math.cos(rad) * speed;
      state.vy = -Math.sin(rad) * speed;
    }
    else if (block.type === 'motion-stop') {
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
    }
    else if (block.type === 'motion-wrap') {
      const STAGE_W = 480;
      const STAGE_H = 360;
      if (sprite.x + sprite.w < 0) sprite.x = STAGE_W;
      if (sprite.x > STAGE_W) sprite.x = -sprite.w;
      if (sprite.y + sprite.h < 0) sprite.y = STAGE_H;
      if (sprite.y > STAGE_H) sprite.y = -sprite.h;
    }
    else if (block.type === 'motion-glide' || block.type === 'sprite-glide') {
      const secs = Math.max(0.1, num(params.secs, 1));
      state.glideEndX = num(params.x, sprite.x);
      state.glideEndY = num(params.y, sprite.y);
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
    }
    else if (block.type === 'motion-glide-to-xy') {
      const secs = Math.max(0.1, num(params.secs, 1));
      state.glideEndX = num(params.x, sprite.x);
      state.glideEndY = num(params.y, sprite.y);
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
    }
    else if (block.type === 'motion-glide-to-sprite') {
      const secs = Math.max(0.1, num(params.secs, 1));
      const targetSprite = this.sprites.find(s => s.name === params.sprite);
      if (targetSprite) {
        state.glideEndX = targetSprite.x;
        state.glideEndY = targetSprite.y;
        state.glideStartX = sprite.x;
        state.glideStartY = sprite.y;
        state.glideProgress = 0;
        state.glideDuration = secs;
      }
    }
    else if (block.type === 'motion-glide-to-random-position') {
      const secs = Math.max(0.1, num(params.secs, 1));
      const STAGE_W = 480;
      const STAGE_H = 360;
      // Random position within stage bounds, accounting for sprite size
      state.glideEndX = Math.random() * (STAGE_W - sprite.w) + sprite.w / 2;
      state.glideEndY = Math.random() * (STAGE_H - sprite.h) + sprite.h / 2;
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
    }
    else if (block.type === 'motion-glide-to-mouse-pointer') {
      const secs = Math.max(0.1, num(params.secs, 1));
      state.glideEndX = this.mouseX;
      state.glideEndY = this.mouseY;
      state.glideStartX = sprite.x;
      state.glideStartY = sprite.y;
      state.glideProgress = 0;
      state.glideDuration = secs;
    }

    // ═══ LOOKS BLOCKS ═══
    else if (block.type === 'sprite-show' || block.type === 'looks-show') {
      sprite.visible = true;
    }
    else if (block.type === 'sprite-hide' || block.type === 'looks-hide') {
      sprite.visible = false;
    }
    else if (block.type === 'sprite-setsize') {
      const scale = num(params.size, 100) / 100;
      sprite.w = sprite.baseW ? sprite.baseW * scale : sprite.w * scale;
      sprite.h = sprite.baseH ? sprite.baseH * scale : sprite.h * scale;
    }
    else if (block.type === 'looks-change-size') {
      const factor = 1 + (num(params.amount, 10) / 100);
      sprite.w *= factor;
      sprite.h *= factor;
    }
    else if (block.type === 'sprite-say' || block.type === 'looks-say') {
      state.sayText = str(params.text || params.message, '');
      state.sayUntil = Date.now() + (num(params.secs, 2) * 1000);
      state.thinkText = null;
    }
    else if (block.type === 'sprite-think' || block.type === 'looks-think') {
      state.thinkText = str(params.text, '');
      state.thinkUntil = Date.now() + (num(params.secs, 2) * 1000);
      state.sayText = null;
    }
    else if (block.type === 'looks-grow') {
      const factor = 1 + (num(params.amount, 10) / 100);
      sprite.w *= factor;
      sprite.h *= factor;
    }
    else if (block.type === 'looks-shrink') {
      const factor = 1 - (num(params.amount, 10) / 100);
      sprite.w *= Math.max(0.1, factor);
      sprite.h *= Math.max(0.1, factor);
    }
    else if (block.type === 'looks-front') {
      sprite.z = 999;
    }
    else if (block.type === 'looks-back') {
      sprite.z = -999;
    }
    else if (block.type === 'looks-costume') {
      state.costumeIndex = Math.max(0, num(params.costume, 1) - 1);
    }
    else if (block.type === 'looks-next-costume') {
      state.costumeIndex = (state.costumeIndex + 1) % (sprite.costumes?.length || 1);
    }
    else if (block.type === 'looks-change-effect') {
      const effect = params.effect || 'color';
      state.effects = state.effects || {};
      state.effects[effect] = (state.effects[effect] || 0) + num(params.value, 25);
    }
    else if (block.type === 'looks-set-effect') {
      const effect = params.effect || 'color';
      state.effects = state.effects || {};
      state.effects[effect] = num(params.value, 0);
    }
    else if (block.type === 'looks-color-effect') {
      state.effects = state.effects || {};
      state.effects.color = Math.max(-200, Math.min(200, num(params.value, 0)));
    }
    else if (block.type === 'looks-ghost-effect') {
      state.effects = state.effects || {};
      state.effects.ghost = Math.max(0, Math.min(100, num(params.value, 0)));
    }
    else if (block.type === 'looks-clear-effects') {
      state.effects = { color: 0, fisheye: 0, whirl: 0, pixelate: 0, mosaic: 0, brightness: 0, ghost: 0 };
    }
    else if (block.type === 'looks-backdrop') {
      const oldBackdrop = state.backdropIndex;
      state.backdropIndex = Math.max(0, num(params.backdrop, 1) - 1);
      if (oldBackdrop !== state.backdropIndex) {
        this.triggerEvent('backdropSwitch', { backdropIndex: state.backdropIndex });
      }
    }
    else if (block.type === 'looks-next-backdrop') {
      const oldBackdrop = state.backdropIndex || 0;
      state.backdropIndex = (state.backdropIndex || 0) + 1;
      if (oldBackdrop !== state.backdropIndex) {
        this.triggerEvent('backdropSwitch', { backdropIndex: state.backdropIndex });
      }
    }
    else if (block.type === 'looks-change-backdrop') {
      const oldBackdrop = state.backdropIndex || 0;
      state.backdropIndex = (state.backdropIndex || 0) + num(params.amount, 1);
      if (oldBackdrop !== state.backdropIndex) {
        this.triggerEvent('backdropSwitch', { backdropIndex: state.backdropIndex });
      }
    }
    else if (block.type === 'looks-forward-layers') {
      const layerAmount = num(params.layers, 1);
      sprite.z = (sprite.z || 0) + layerAmount;
    }

    // ═══ PHYSICS BLOCKS ═══
    else if (block.type === 'physics-velocity') {
      state.vx = num(params.vx, 0);
      state.vy = num(params.vy, 0);
    }
    else if (block.type === 'physics-gravity') {
      const a = num(params.amount, 2400);
      state.gravityPps2 = a <= 80 ? 2400 * (a / 0.5) : a;
    }
    else if (block.type === 'physics-jump' || block.type === 'motion-jump') {
      const p = Math.abs(num(params.power, 560));
      const impulse = p <= 72 ? p * 38 : p;
      const force = block.type === 'physics-jump';
      const grounded = !!state.grounded;
      const canForce = force;
      const canNormal = grounded && !force;
      const canDouble = !force && state.allowDoubleJump && !state.usedDoubleJump && !grounded;
      if (canForce || canNormal || canDouble) {
        if (canDouble) state.usedDoubleJump = true;
        state.vy = -impulse;
        state.isJumping = true;
        state.grounded = false;
      }
    }
    else if (block.type === 'physics-push') {
      const rad = (num(params.direction, 0) * Math.PI) / 180;
      const force = num(params.force, 5);
      state.vx = (state.vx || 0) + Math.cos(rad) * force;
      state.vy = (state.vy || 0) + Math.sin(rad) * force;
    }
    else if (block.type === 'physics-friction') {
      state.friction = num(params.amount, 0.9);
      state.vx = (state.vx || 0) * state.friction;
      state.vy = (state.vy || 0) * state.friction;
    }
    else if (block.type === 'physics-bounce') {
      // Handled in update loop
    }

    // ═══ VARIABLES ═══
    else if (block.type === 'var-create' || block.type === 'var-set') {
      state._vars[params.name] = num(params.value, 0);
    }
    else if (block.type === 'var-change') {
      state._vars[params.name] = (state._vars[params.name] || 0) + num(params.amount, 1);
    }
    else if (block.type === 'var-show') {
      state.sayText = `${params.name}=${state._vars[params.name] ?? 0}`;
      state.sayUntil = Date.now() + 2000;
    }

    // ═══ GAME STATE BLOCKS ═══
    else if (block.type === 'game-score-add') {
      this.gameState.score += num(params.amount, 10);
    }
    else if (block.type === 'game-score-set') {
      this.gameState.score = num(params.value, 0);
    }
    else if (block.type === 'game-lose-life') {
      this.loseLife();
    }
    else if (block.type === 'game-set-lives') {
      this.setLives(num(params.value, 3));
    }
    else if (block.type === 'game-over') {
      this.endGame(false);
    }
    else if (block.type === 'game-win') {
      this.endGame(true);
    }
    else if (block.type === 'game-next-level') {
      this.nextLevel();
    }
    else if (block.type === 'game-pause') {
      this.gameState.gamePaused = true;
    }
    else if (block.type === 'game-spawn') {
      this.spawnClone(sprite, params.sprite);
    }
    else if (block.type === 'game-destroy') {
      sprite.destroyed = true;
    }

    // ═══ MATH BLOCKS ═══
    else if (block.type === 'math-add') {
      this.globalVars._math = num(params.a, 0) + num(params.b, 0);
    }
    else if (block.type === 'math-mult') {
      this.globalVars._math = num(params.a, 0) * num(params.b, 0);
    }
    else if (block.type === 'math-random') {
      const min = num(params.min, 1);
      const max = num(params.max, 100);
      this.globalVars._math = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ═══ SENSING BLOCKS ═══
    else if (block.type === 'sense-key') {
      this.globalVars._sensing = this.isKeyPressed(params.key || 'space');
    }
    else if (block.type === 'sense-mouse-x') {
      this.globalVars._sensing = this.mouseX;
    }
    else if (block.type === 'sense-mouse-y') {
      this.globalVars._sensing = this.mouseY;
    }
    else if (block.type === 'sense-distance') {
      const dx = this.mouseX - sprite.x;
      const dy = this.mouseY - sprite.y;
      this.globalVars._sensing = Math.sqrt(dx * dx + dy * dy);
    }
    else if (block.type === 'sense-timer') {
      this.globalVars._sensing = (Date.now() - this.startTime) / 1000;
    }
    else if (block.type === 'sense-reset-timer') {
      this.startTime = Date.now();
    }
    else if (block.type === 'sense-touching') {
      // Simplified: check if touching edge
      const touching = sprite.x <= 0 ||
                      sprite.x + sprite.w >= 480 ||
                      sprite.y <= 0 ||
                      sprite.y + sprite.h >= 360;
      this.globalVars._sensing = touching;
    }
    else if (block.type === 'sense-touching-sprite') {
      // Would need sprite collision detection
      this.globalVars._sensing = false;
    }

    // ═══ BROADCAST/MESSAGE BLOCKS ═══
    else if (block.type === 'event-broadcast') {
      // If this is a 'broadcast and wait', we need to wait for all listeners to finish
      if (block.wait) {
        // Find all listeners for this message
        const listeners = (this.eventListeners['message'] || []).filter(({ block: listenerBlock }) => {
          return listenerBlock && listenerBlock.params && listenerBlock.params.message === params.message;
        });
        // Execute all listeners synchronously (sequentially)
        for (const { sprite, block: listenerBlock } of listeners) {
          this.executeBlockSequence(sprite, listenerBlock.connectedBlocks || []);
        }
      } else {
        this.triggerEvent('message', { message: params.message });
      }
    }
    else if (block.type === 'event-message') {
      // Handled by listener registration
    }

    // ═══ CONTROL BLOCKS ═══
    else if (block.type === 'control-stop') {
      this.gameState.gameRunning = false;
    }

    // ═══ TEXT/LIST BLOCKS (simplified) ═══
    else if (block.type === 'text-create') {
      this.globalVars._text = str(params.text, '');
    }
    else if (block.type === 'text-join') {
      this.globalVars._text = str(params.a, '') + str(params.b, '');
    }
    else if (block.type === 'text-length') {
      this.globalVars._text = str(params.text, '').length;
    }
    else if (block.type === 'list-create') {
      this.globalVars._list = [];
    }
    else if (block.type === 'list-add') {
      if (!this.globalVars._list) this.globalVars._list = [];
      this.globalVars._list.push(params.item);
    }
    else if (block.type === 'list-get') {
      if (!this.globalVars._list) this.globalVars._list = [];
      const idx = num(params.index, 0);
      this.globalVars._text = this.globalVars._list[idx] || null;
    }

    // ═══ SOUND BLOCKS (simplified) ═══
    else if (block.type === 'sound-play' || block.type === 'sound-play-looping') {
      // Would integrate with audio manager
      this.globalVars._sound = params.sound;
    }
    else if (block.type === 'sound-stop') {
      this.globalVars._sound = null;
    }
    else if (block.type === 'sound-volume') {
      this.globalVars._volume = num(params.volume, 100);
    }
    else if (block.type === 'sound-change-volume') {
      this.globalVars._volume = (this.globalVars._volume || 100) + num(params.amount, -10);
    }
    else if (block.type === 'sound-get-volume') {
      return this.globalVars._volume || 100;
    }
    else if (block.type === 'sound-pitch') {
      this.globalVars._pitch = num(params.pitch, 100);
    }
    else if (block.type === 'sound-change-pitch') {
      this.globalVars._pitch = (this.globalVars._pitch || 100) + num(params.amount, 10);
    }
    else if (block.type === 'sound-change-effect') {
      const effect = params.effect || 'pitch';
      state.soundEffects = state.soundEffects || {};
      state.soundEffects[effect] = (state.soundEffects[effect] || 0) + num(params.value, 10);
    }
    else if (block.type === 'sound-set-effect') {
      const effect = params.effect || 'pitch';
      state.soundEffects = state.soundEffects || {};
      state.soundEffects[effect] = num(params.value, 0);
    }
    else if (block.type === 'sound-clear-effects') {
      state.soundEffects = {};
    }

    // ═══ MUSIC BLOCKS (simplified) ═══
    else if (block.type === 'music-drum' || block.type === 'music-note') {
      // Would integrate with music system
    }

    // ═══ AI BLOCKS ═══
    else if (block.type === 'ai-classify') {
      this.globalVars._ai = { type: 'classification', input: params.input || 'text' };
    }
    else if (block.type === 'ai-generate') {
      this.globalVars._ai = { type: 'generation', prompt: params.prompt || 'Write text' };
    }
    // ═══ FACE DETECTION BLOCKS ═══
    else if (block.type === 'face-video-on') {
      const transparency = num(params.transparency, 0);
      this.globalVars._faceVideo = { enabled: true, transparency: Math.max(0, Math.min(100, transparency)) };
    }
    else if (block.type === 'face-video-off') {
      this.globalVars._faceVideo = { enabled: false };
    }
    else if (block.type === 'face-show-box') {
      this.globalVars._faceVideo = { ...this.globalVars._faceVideo, showBox: true };
    }
    else if (block.type === 'face-hide-box') {
      this.globalVars._faceVideo = { ...this.globalVars._faceVideo, showBox: false };
    }
    else if (block.type === 'face-detect') {
      this.globalVars._faceData = { detected: true, count: 1, faces: [{ x: 100, y: 100, width: 80, height: 80 }] };
    }
    else if (block.type === 'face-x') {
      return this.globalVars._faceData?.faces?.[0]?.x || 0;
    }
    else if (block.type === 'face-y') {
      return this.globalVars._faceData?.faces?.[0]?.y || 0;
    }
    else if (block.type === 'face-width') {
      return this.globalVars._faceData?.faces?.[0]?.width || 0;
    }
    else if (block.type === 'face-height') {
      return this.globalVars._faceData?.faces?.[0]?.height || 0;
    }
    else if (block.type === 'face-count') {
      return this.globalVars._faceData?.count || 0;
    }
    // ═══ OBJECT DETECTION BLOCKS ═══
    else if (block.type === 'object-video-on') {
      const transparency = num(params.transparency, 0);
      this.globalVars._objectVideo = { enabled: true, transparency: Math.max(0, Math.min(100, transparency)) };
    }
    else if (block.type === 'object-video-off') {
      this.globalVars._objectVideo = { enabled: false };
    }
    else if (block.type === 'object-show-box') {
      this.globalVars._objectVideo = { ...this.globalVars._objectVideo, showBox: true };
    }
    else if (block.type === 'object-hide-box') {
      this.globalVars._objectVideo = { ...this.globalVars._objectVideo, showBox: false };
    }
    else if (block.type === 'object-detect') {
      this.globalVars._objectData = { detected: true, objects: [{ label: 'person', confidence: 0.95, x: 100, y: 100 }] };
    }
    else if (block.type === 'object-label') {
      const idx = num(params.index, 0);
      return this.globalVars._objectData?.objects?.[idx]?.label || 'unknown';
    }
    else if (block.type === 'object-confidence') {
      const idx = num(params.index, 0);
      return (this.globalVars._objectData?.objects?.[idx]?.confidence || 0) * 100;
    }
    // ═══ POSE DETECTION BLOCKS ═══
    else if (block.type === 'pose-video-on') {
      const transparency = num(params.transparency, 0);
      this.globalVars._poseVideo = { enabled: true, transparency: Math.max(0, Math.min(100, transparency)) };
    }
    else if (block.type === 'pose-video-off') {
      this.globalVars._poseVideo = { enabled: false };
    }
    else if (block.type === 'pose-show-detections') {
      this.globalVars._poseVideo = { ...this.globalVars._poseVideo, showDetections: true };
    }
    else if (block.type === 'pose-analyze') {
      const source = params.source || 'camera';
      this.globalVars._poseData = { 
        detected: true, 
        landmarks: Array(17).fill({ x: 100, y: 100, confidence: 0.9 }),
        people: [{ id: 0, landmarks: Array(17).fill({ x: 100, y: 100, confidence: 0.9 }) }]
      };
    }
    else if (block.type === 'pose-count-people') {
      return this.globalVars._poseData?.people?.length || 0;
    }
    else if (block.type === 'pose-position-x') {
      const landmark = num(params.landmark, 0);
      return this.globalVars._poseData?.landmarks?.[landmark]?.x || 0;
    }
    else if (block.type === 'pose-position-y') {
      const landmark = num(params.landmark, 0);
      return this.globalVars._poseData?.landmarks?.[landmark]?.y || 0;
    }
    else if (block.type === 'pose-landmark-x') {
      const landmark = num(params.landmark, 0);
      return this.globalVars._poseData?.landmarks?.[landmark]?.x || 0;
    }
    else if (block.type === 'pose-landmark-y') {
      const landmark = num(params.landmark, 0);
      return this.globalVars._poseData?.landmarks?.[landmark]?.y || 0;
    }
    else if (block.type === 'pose-angle') {
      const landmark = num(params.landmark, 0);
      return this.globalVars._poseData?.landmarks?.[landmark]?.angle || 0;
    }
    else if (block.type === 'pose-confidence') {
      const landmark = num(params.landmark, 0);
      return (this.globalVars._poseData?.landmarks?.[landmark]?.confidence || 0) * 100;
    }
    else if (block.type === 'pose-distance') {
      const l1 = num(params.landmark1, 0);
      const l2 = num(params.landmark2, 1);
      const p1 = this.globalVars._poseData?.landmarks?.[l1];
      const p2 = this.globalVars._poseData?.landmarks?.[l2];
      if (!p1 || !p2) return 0;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    else if (block.type === 'pose-movement') {
      return this.globalVars._poseData?.movement || 0;
    }
    else if (block.type === 'pose-gesture') {
      return this.globalVars._poseData?.gesture === params.gesture;
    }
    else if (block.type === 'pose-rep-count') {
      return this.globalVars._poseData?.repCount || 0;
    }
    else if (block.type === 'pose-posture') {
      return this.globalVars._poseData?.postureScore || 0;
    }
    else if (block.type === 'pose-detect') {
      this.globalVars._poseData = { detected: true, landmarks: Array(17).fill({ x: 100, y: 100, confidence: 0.9 }) };
    }
    // ═══ HAND DETECTION BLOCKS ═══
    else if (block.type === 'hand-detect') {
      this.globalVars._handData = { detected: true, hands: [{ landmarks: Array(21).fill({ x: 100, y: 100 }) }] };
    }
    else if (block.type === 'hand-gesture') {
      return this.globalVars._handData?.gesture || 'none';
    }
    else if (block.type === 'hand-pinch') {
      return this.globalVars._handData?.pinch || false;
    }
    // ═══ BODY DETECTION BLOCKS ═══
    else if (block.type === 'body-video-on') {
      const state = String(params.state || 'on').toLowerCase();
      const transparency = num(params.transparency, 0);
      this.globalVars._bodyVideo = { enabled: state === 'on', transparency: Math.max(0, Math.min(100, transparency)) };

      // Actually turn on/off the camera
      console.log('[GameRuntime] body-video-on block: state=' + state + ' transparency=' + transparency);
      if (typeof runExtensionGame === 'function') {
        runExtensionGame(`body|camera|${state}|${transparency}`, this.currentSprite);
        console.log('[GameRuntime] Called runExtensionGame');
      } else {
        console.log('[GameRuntime] runExtensionGame not available');
      }
    }
    else if (block.type === 'body-show-detections') {
      this.globalVars._bodyVideo = { ...this.globalVars._bodyVideo, showDetections: true };
    }
    else if (block.type === 'body-analyse') {
      this.globalVars._bodyData = { detected: true, people: Array(1).fill({ keypoints: Array(17).fill({ x: 100, y: 100, confidence: 0.9 }) }) };
    }
    else if (block.type === 'body-get-count') {
      return this.globalVars._bodyData?.people?.length || 0;
    }
    else if (block.type === 'body-x-position') {
      const keypoint = params.keypoint || 'nose';
      return this.globalVars._bodyData?.people?.[0]?.keypoints?.[0]?.x || 0;
    }
    else if (block.type === 'body-y-position') {
      const keypoint = params.keypoint || 'nose';
      return this.globalVars._bodyData?.people?.[0]?.keypoints?.[0]?.y || 0;
    }
    else if (block.type === 'body-is-detected') {
      const keypoint = params.keypoint || 'nose';
      return this.globalVars._bodyData?.detected || false;
    }
    else if (block.type === 'hand-analyze') {
      this.globalVars._handData = { detected: true, hands: [{ landmarks: Array(21).fill({ x: 100, y: 100 }) }] };
    }
    else if (block.type === 'hand-detected') {
      return this.globalVars._handData?.detected || false;
    }
    else if (block.type === 'hand-position-x') {
      return this.globalVars._handData?.hands?.[0]?.landmarks?.[0]?.x || 0;
    }
    // ═══ EMOTION DETECTION BLOCKS ═══
    else if (block.type === 'emotion-detect') {
      this.globalVars._emotionData = { emotion: 'happy', confidence: 0.95 };
    }
    else if (block.type === 'emotion-label') {
      return this.globalVars._emotionData?.emotion || 'neutral';
    }
    // ═══ TEXT RECOGNITION BLOCKS ═══
    else if (block.type === 'text-recognize') {
      this.globalVars._textData = { text: 'recognized text', confidence: 0.92 };
    }
    else if (block.type === 'text-recognize-label') {
      return this.globalVars._textData?.text || '';
    }
    // ═══ PEN EXTENSION BLOCKS ═══
    else if (block.type === 'pen-erase') {
      this.globalVars._penState = { erased: true };
    }
    else if (block.type === 'pen-stamp') {
      this.globalVars._penState = { stamped: true, x: sprite.x, y: sprite.y };
    }
    else if (block.type === 'pen-down') {
      this.globalVars._penState = { down: true };
    }
    else if (block.type === 'pen-up') {
      this.globalVars._penState = { down: false };
    }
    else if (block.type === 'pen-color') {
      this.globalVars._penState = { ...this.globalVars._penState, color: params.color || '#000000' };
    }
    else if (block.type === 'pen-size') {
      this.globalVars._penState = { ...this.globalVars._penState, size: num(params.size, 1) };
    }
    // ═══ TEXT-TO-SPEECH BLOCKS ═══
    else if (block.type === 'tts-speak') {
      this.globalVars._ttsState = { speaking: true, text: params.text || 'hello' };
    }
    else if (block.type === 'tts-set-voice') {
      this.globalVars._ttsState = { ...this.globalVars._ttsState, voice: params.voice || 'default' };
    }
    else if (block.type === 'tts-set-language') {
      this.globalVars._ttsState = { ...this.globalVars._ttsState, language: params.lang || 'en' };
    }
    // ═══ ARDUINO BLOCKS ═══
    else if (block.type === 'arduino-digital') {
      this.globalVars._arduinoState = { ...this.globalVars._arduinoState, pin: params.pin, value: num(params.value, 0) };
    }
    else if (block.type === 'arduino-analog') {
      this.globalVars._arduinoState = { ...this.globalVars._arduinoState, pin: params.pin, analog: num(params.value, 128) };
    }
    else if (block.type === 'arduino-read-digital') {
      return this.globalVars._arduinoState?.[`pin_${params.pin}`] || 0;
    }
    else if (block.type === 'arduino-read-analog') {
      return this.globalVars._arduinoState?.[`analog_${params.pin}`] || 512;
    }
    else if (block.type === 'arduino-servo') {
      this.globalVars._servoState = { pin: params.pin, angle: num(params.angle, 90) };
    }
    else if (block.type === 'arduino-buzzer') {
      this.globalVars._buzzerState = { pin: params.pin, frequency: num(params.freq, 1000) };
    }
    // ═══ MICRO:BIT BLOCKS ═══
    else if (block.type === 'microbit-display') {
      this.globalVars._microbitDisplay = params.text || 'Hi';
    }
    else if (block.type === 'microbit-button') {
      this.globalVars._microbitButton = params.button || 'A';
    }
    else if (block.type === 'microbit-accel-x') {
      return this.globalVars._microbitAccel?.x || 0;
    }
    else if (block.type === 'microbit-accel-y') {
      return this.globalVars._microbitAccel?.y || 0;
    }
    else if (block.type === 'microbit-accel-z') {
      return this.globalVars._microbitAccel?.z || 0;
    }
    else if (block.type === 'microbit-compass') {
      return this.globalVars._microbitCompass || 0;
    }
    else if (block.type === 'microbit-temp') {
      return this.globalVars._microbitTemp || 20;
    }
    else if (block.type === 'microbit-radio-send') {
      this.globalVars._microbitRadio = { tx: params.message || 'hello' };
    }
    else if (block.type === 'microbit-radio-recv') {
      return this.globalVars._microbitRadio?.rx || '';
    }
    // ═══ ESP32/IOT BLOCKS ═══
    else if (block.type === 'esp32-wifi') {
      this.globalVars._wifiState = { connected: true, ssid: params.ssid || 'network' };
    }
    else if (block.type === 'esp32-http-get') {
      this.globalVars._httpResponse = { url: params.url, data: 'response data' };
    }
    else if (block.type === 'esp32-http-post') {
      this.globalVars._httpResponse = { url: params.url, data: params.data, status: 200 };
    }
    else if (block.type === 'esp32-mqtt-pub') {
      this.globalVars._mqttState = { topic: params.topic, message: params.msg };
    }
    else if (block.type === 'esp32-mqtt-sub') {
      this.globalVars._mqttState = { subscribed: params.topic };
    }
    // ═══ MOTOR & SERVO BLOCKS ═══
    else if (block.type === 'motor-forward') {
      this.globalVars._motorState = { direction: 'forward', speed: num(params.speed, 100) };
    }
    else if (block.type === 'motor-backward') {
      this.globalVars._motorState = { direction: 'backward', speed: num(params.speed, 100) };
    }
    else if (block.type === 'motor-stop') {
      this.globalVars._motorState = { direction: 'stop', speed: 0 };
    }
    else if (block.type === 'motor-turn-left') {
      this.globalVars._motorState = { direction: 'left', speed: num(params.speed, 100) };
    }
    else if (block.type === 'motor-turn-right') {
      this.globalVars._motorState = { direction: 'right', speed: num(params.speed, 100) };
    }
    else if (block.type === 'servo-rotate') {
      this.globalVars._servoState = { angle: num(params.angle, 90), mode: 'single' };
    }
    else if (block.type === 'servo-cont-rot') {
      this.globalVars._servoState = { speed: num(params.speed, 50), mode: 'continuous' };
    }
    // ═══ SENSOR BLOCKS ═══
    else if (block.type === 'sensor-line') {
      return this.globalVars._sensorState?.line || false;
    }
    else if (block.type === 'sensor-obstacle') {
      return this.globalVars._sensorState?.obstacle || false;
    }
    else if (block.type === 'sensor-distance') {
      return this.globalVars._sensorState?.distance || 0;
    }
    else if (block.type === 'sensor-temperature') {
      return this.globalVars._sensorState?.temperature || 25;
    }
    else if (block.type === 'sensor-humidity') {
      return this.globalVars._sensorState?.humidity || 50;
    }
    else if (block.type === 'sensor-light') {
      return this.globalVars._sensorState?.light || 50;
    }
    // ═══ DISPLAY BLOCKS ═══
    else if (block.type === 'lcd-print') {
      this.globalVars._displayState = { text: params.text || 'Hello', type: 'lcd' };
    }
    else if (block.type === 'oled-print') {
      this.globalVars._displayState = { text: params.text || 'Hello', type: 'oled' };
    }
    else if (block.type === 'lcd-clear') {
      this.globalVars._displayState = { cleared: true };
    }
    // ═══ IOT/SMART HOME BLOCKS ═══
    else if (block.type === 'iot-relay-on') {
      this.globalVars._relayState = { on: true };
    }
    else if (block.type === 'iot-relay-off') {
      this.globalVars._relayState = { on: false };
    }
    else if (block.type === 'iot-send-data') {
      this.globalVars._iotData = { sent: true, data: params.data || 'data' };
    }
    else if (block.type === 'iot-recv-data') {
      return this.globalVars._iotData?.received || '';
    }
    // ═══ GAMEPAD BLOCKS ═══
    else if (block.type === 'gamepad-button') {
      this.globalVars._gamepadState = { button: params.button || 'A', pressed: true };
    }
    else if (block.type === 'gamepad-stick-x') {
      return this.globalVars._gamepadState?.stickX || 0;
    }
    else if (block.type === 'gamepad-stick-y') {
      return this.globalVars._gamepadState?.stickY || 0;
    }
    // ═══ CLOUD VARIABLES ═══
    else if (block.type === 'cloud-set') {
      this.globalVars[`_cloud_${params.var}`] = params.value || 0;
    }
    else if (block.type === 'cloud-get') {
      return this.globalVars[`_cloud_${params.var}`] || 0;
    }
    // ═══ 3D/XR BLOCKS ═══
    else if (block.type === 'object3d-add') {
      this.globalVars._3dObjects = this.globalVars._3dObjects || [];
      this.globalVars._3dObjects.push({ type: params.object || 'cube', x: 0, y: 0, z: 0 });
    }
    else if (block.type === 'object3d-move') {
      if (this.globalVars._3dObjects?.length > 0) {
        this.globalVars._3dObjects[0].x = num(params.x, 0);
        this.globalVars._3dObjects[0].y = num(params.y, 0);
        this.globalVars._3dObjects[0].z = num(params.z, 0);
      }
    }
    else if (block.type === 'object3d-rotate') {
      if (this.globalVars._3dObjects?.length > 0) {
        this.globalVars._3dObjects[0].rotX = num(params.rotX, 0);
        this.globalVars._3dObjects[0].rotY = num(params.rotY, 0);
        this.globalVars._3dObjects[0].rotZ = num(params.rotZ, 0);
      }
    }
    else if (block.type === 'object3d-scale') {
      if (this.globalVars._3dObjects?.length > 0) {
        this.globalVars._3dObjects[0].scale = num(params.scale, 1);
      }
    }
    else if (block.type === 'object3d-physics') {
      if (this.globalVars._3dObjects?.length > 0) {
        this.globalVars._3dObjects[0].physics = { enabled: true, mass: num(params.mass, 1) };
      }
    }

    // ═══ EFFECT BLOCKS ═══
    else if (block.type === 'looks-change-effect') {
      // Supported effects: color, fisheye, whirl, pixelate, mosaic, brightness, ghost
      const effect = params.effect || 'color';
      const value = num(params.value, 0);
      if (state.effects && effect in state.effects) {
        state.effects[effect] += value;
      }
    }
    else if (block.type === 'looks-set-effect') {
      const effect = params.effect || 'color';
      const value = num(params.value, 0);
      if (state.effects && effect in state.effects) {
        state.effects[effect] = value;
      }
    }
    else if (block.type === 'looks-clear-effects') {
      if (state.effects) {
        Object.keys(state.effects).forEach(e => state.effects[e] = 0);
      }
    }

    // ═══ SOUND EFFECT BLOCKS ═══
    else if (block.type === 'sound-change-effect') {
      const effect = params.effect || 'pitch';
      const value = num(params.value, 0);
      if (!this.globalVars._soundEffects) this.globalVars._soundEffects = { pitch: 0, pan: 0 };
      if (effect in this.globalVars._soundEffects) {
        this.globalVars._soundEffects[effect] += value;
      }
    }
    else if (block.type === 'sound-set-effect') {
      const effect = params.effect || 'pitch';
      const value = num(params.value, 0);
      if (!this.globalVars._soundEffects) this.globalVars._soundEffects = { pitch: 0, pan: 0 };
      if (effect in this.globalVars._soundEffects) {
        this.globalVars._soundEffects[effect] = value;
      }
    }
    else if (block.type === 'sound-clear-effects') {
      if (this.globalVars._soundEffects) {
        this.globalVars._soundEffects.pitch = 0;
        this.globalVars._soundEffects.pan = 0;
      }
    }

    // ═══ MOTION BLOCKS ═══
    else if (block.type === 'motion-set-rotation-style') {
      setRotationStyle(sprite, readRotationStyleParam(block));
    }

    // ═══ EVENT BROADCASTER BLOCKS ═══
    else if (block.type === 'event-broadcast' || block.type === 'event-broadcast-wait') {
      const message = params.message || 'message1';
      this.triggerEvent('message', { message });
    }
    else if (block.type === 'event-backdropswitch') {
      const backdrop = params.backdrop || 'backdrop1';
      state.backdropIndex = num(params.backdropIndex, 0);
      this.triggerEvent('backdropSwitch', { backdrop });
    }
    else if (block.type === 'event-loudness') {
      const threshold = num(params.threshold, 10);
      if (this.loudness > threshold) {
        this.triggerEvent('loudness', { threshold });
      }
    }

    // ═══ REPORTER BLOCKS ═══
    else if (block.type === 'sense-timer') {
      this.globalVars._sensing = (Date.now() - this.startTime) / 1000;
    }
    else if (block.type === 'sense-reset-timer') {
      this.startTime = Date.now();
      this.globalVars._sensing = 0;
    }
    else if (block.type === 'sense-loudness') {
      this.globalVars._sensing = this.loudness;
    }
    else if (block.type === 'looks-backdrop-reporter') {
      this.globalVars._sensing = this.globalVars.backdropIndex || 0;
    }
    else if (block.type === 'sprite-x-reporter') {
      return sprite.x;
    }
    else if (block.type === 'sprite-y-reporter') {
      return sprite.y;
    }
    else if (block.type === 'sprite-direction-reporter') {
      return state.direction || 90;
    }
    else if (block.type === 'sprite-size-reporter') {
      return 100; // Default size representation
    }
    else if (block.type === 'looks-costume-reporter') {
      return (state.costumeIndex || 0) + 1;
    }
  }

  spawnClone(sprite, cloneOf = 'this') {
    const templateSprite = cloneOf === 'this'
      ? sprite
      : this.sprites.find(s => s.name === cloneOf || s.id == cloneOf);

    if (!templateSprite) return;

    const clone = { ...templateSprite, id: Date.now() + Math.random() };
    clone.isClone = true;
    clone.cloneOf = templateSprite.id;
    this.sprites.push(clone);
    this.spriteVars[clone.id] = { ...this.spriteVars[templateSprite.id] };
  }

  // ─── Input Handling ───
  onKeyDown(key) {
    this.keysPressed.add(key.toLowerCase());
    this.triggerEvent('keyPress', { key });
  }

  onKeyUp(key) {
    this.keysPressed.delete(key.toLowerCase());
  }

  isKeyPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }

  onMouseMove(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  onClick(x, y) {
    this.mouseX = x;
    this.mouseY = y;
    this.triggerEvent('click', { x, y });
  }

  // ─── Game Loop Update ───
  update(STAGE_W, STAGE_H) {
        // Simulate loudness value (replace with real mic input if available)
        this.loudness = Math.random() * 100;
        // Trigger loudness event if any listeners are registered
        if ((this.eventListeners.loudness || []).length > 0) {
          this.triggerEvent('loudness');
        }
    if (this.gameState.gamePaused || !this.gameState.gameRunning) return;

    const now = Date.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = now;

    // Update each sprite
    this.sprites.forEach(sprite => {
      if (sprite.destroyed) return;

      const state = this.spriteVars[sprite.id];
      if (!state) return;

      // Handle glide animation
      let isGliding = false;
      if (state.glideDuration && state.glideDuration > 0) {
        isGliding = true;
        state.glideProgress = Math.min(1, state.glideProgress + deltaTime / state.glideDuration);
        const t = state.glideProgress;
        sprite.x = state.glideStartX + (state.glideEndX - state.glideStartX) * t;
        sprite.y = state.glideStartY + (state.glideEndY - state.glideStartY) * t;
        if (state.glideProgress >= 1) {
          state.glideDuration = 0;
          state.glideProgress = 0;
          isGliding = false;
        }
      }

      // Only apply physics if not gliding
      if (!isGliding) {
        const g = state.gravityPps2 ?? 2400;
        const dt = Math.max(0, Math.min(0.05, deltaTime));
        const supported =
          sprite.y + sprite.h >= STAGE_H - 1.5 &&
          sprite.x >= 0 &&
          sprite.x + sprite.w <= STAGE_W;
        if (!supported || state.vy < 0) {
          state.vy = Math.min(state.maxFallPps ?? 980, (state.vy || 0) + g * dt);
        } else {
          state.vy = 0;
        }

        sprite.x += (state.vx || 0) * dt;
        sprite.y += (state.vy || 0) * dt;
      }

      if (sprite.x < 0) sprite.x = 0;
      if (sprite.x + sprite.w > STAGE_W) sprite.x = STAGE_W - sprite.w;

      if (sprite.y + sprite.h >= STAGE_H) {
        sprite.y = STAGE_H - sprite.h;
        state.vy = 0;
        state.isJumping = false;
        state.grounded = true;
        state.usedDoubleJump = false;

        this.triggerEvent('collision', { sprite, type: 'ground' });
      }

      // Check say/think text expiration
      if (state.sayText && now > state.sayUntil) {
        state.sayText = null;
      }
      if (state.thinkText && now > state.thinkUntil) {
        state.thinkText = null;
      }
    });

    // Remove destroyed sprites
    this.sprites = this.sprites.filter(s => !s.destroyed);
  }

  // ─── Getter functions ───
  getGameState() {
    return { ...this.gameState };
  }

  getSpriteState(spriteId) {
    return this.spriteVars[spriteId];
  }

  getSayText(spriteId) {
    return this.spriteVars[spriteId]?.sayText || null;
  }

  getThinkText(spriteId) {
    return this.spriteVars[spriteId]?.thinkText || null;
  }
}

export default GameRuntime;
