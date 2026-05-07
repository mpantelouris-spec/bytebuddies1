/**
 * Game Runtime Engine
 * Manages game execution, events, timing, and block sequence execution
 */

export class GameRuntime {
  constructor(sprites, globalVars = {}) {
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
        // Physics
        vx: 0,
        vy: 0,
        gravity: 0,
        friction: 1,
        isJumping: false,
        isGrounded: true,
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
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push({ sprite, block, active: true });
  }

  triggerEvent(eventType, detail = {}) {
    const listeners = this.eventListeners[eventType] || [];
    listeners.forEach(({ sprite, block, active }) => {
      if (active && sprite) {
        this.executeBlockSequence(sprite, block.connectedBlocks || []);
      }
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

    // ═══ MOTION BLOCKS ═══
    if (block.type === 'sprite-move') {
      const steps = num(params.steps, 0);
      const rad = (state.direction || 90) * Math.PI / 180;
      sprite.x += Math.cos(rad) * steps;
      sprite.y -= Math.sin(rad) * steps;
    }
    else if (block.type === 'sprite-turn') {
      state.direction = (state.direction || 90) + num(params.degrees, 90);
      while (state.direction >= 360) state.direction -= 360;
      while (state.direction < 0) state.direction += 360;
    }
    else if (block.type === 'motion-point-dir') {
      state.direction = num(params.direction, 90) % 360;
    }
    else if (block.type === 'motion-point') {
      const dx = this.mouseX - sprite.x;
      const dy = this.mouseY - sprite.y;
      state.direction = Math.atan2(-dy, dx) * 180 / Math.PI;
    }
    else if (block.type === 'sprite-goto') {
      sprite.x = num(params.x, 0);
      sprite.y = num(params.y, 0);
    }
    else if (block.type === 'motion-setx') {
      sprite.x = num(params.x, 0);
    }
    else if (block.type === 'motion-sety') {
      sprite.y = num(params.y, 0);
    }
    else if (block.type === 'sprite-changex') {
      sprite.x += num(params.amount, 0);
    }
    else if (block.type === 'sprite-changey') {
      sprite.y += num(params.amount, 0);
    }
    else if (block.type === 'motion-glide') {
      sprite.x = num(params.x, sprite.x);
      sprite.y = num(params.y, sprite.y);
    }
    else if (block.type === 'motion-speed') {
      state.speed = num(params.speed, 5);
    }
    else if (block.type === 'motion-stop') {
      state.vx = 0;
      state.vy = 0;
    }
    else if (block.type === 'motion-rotation') {
      state.rotation = num(params.rotation, 0);
    }
    else if (block.type === 'motion-change-angle') {
      state.rotation = (state.rotation || 0) + num(params.angle, 15);
    }
    else if (block.type === 'motion-wrap') {
      // Handled in update loop
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
    else if (block.type === 'sprite-say' || block.type === 'looks-say') {
      state.sayText = str(params.text || params.message, '');
      state.sayUntil = Date.now() + (num(params.secs, 2) * 1000);
      state.thinkText = null;
    }
    else if (block.type === 'looks-think') {
      state.thinkText = str(params.text, '');
      state.thinkUntil = Date.now() + (num(params.secs, 2) * 1000);
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
    else if (block.type === 'looks-color-effect') {
      state.effects.color = Math.max(-200, Math.min(200, num(params.value, 0)));
    }
    else if (block.type === 'looks-ghost-effect') {
      state.effects.ghost = Math.max(0, Math.min(100, num(params.value, 0)));
    }
    else if (block.type === 'looks-clear-effects') {
      state.effects = { color: 0, fisheye: 0, whirl: 0, pixelate: 0, mosaic: 0, brightness: 0, ghost: 0 };
    }

    // ═══ PHYSICS BLOCKS ═══
    else if (block.type === 'physics-velocity') {
      state.vx = num(params.vx, 0);
      state.vy = num(params.vy, 0);
    }
    else if (block.type === 'physics-gravity') {
      state.gravity = num(params.amount, 0.5);
    }
    else if (block.type === 'physics-jump' || block.type === 'motion-jump') {
      if (!state.gravity) state.gravity = 0.5;
      state.vy = -Math.abs(num(params.power, 10));
      state.isJumping = true;
      state.isGrounded = false;
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
      this.triggerEvent('message', { message: params.message });
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
    else if (block.type === 'sound-play') {
      // Would integrate with audio manager
      this.globalVars._sound = params.sound;
    }
    else if (block.type === 'sound-stop') {
      this.globalVars._sound = null;
    }
    else if (block.type === 'sound-volume') {
      this.globalVars._volume = num(params.volume, 100);
    }

    // ═══ MUSIC BLOCKS (simplified) ═══
    else if (block.type === 'music-drum' || block.type === 'music-note') {
      // Would integrate with music system
    }

    // ═══ AI BLOCKS (simplified) ═══
    else if (block.type === 'ai-classify') {
      this.globalVars._ai = 'classification';
    }
    else if (block.type === 'ai-generate') {
      this.globalVars._ai = 'generated text';
    }
    else if (block.type === 'tts-speak') {
      // Would integrate with TTS
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
    if (this.gameState.gamePaused || !this.gameState.gameRunning) return;

    const now = Date.now();
    const deltaTime = (now - this.lastFrameTime) / 1000; // seconds
    this.lastFrameTime = now;

    // Update each sprite
    this.sprites.forEach(sprite => {
      if (sprite.destroyed) return;

      const state = this.spriteVars[sprite.id];
      if (!state) return;

      // Apply gravity
      if (state.gravity && state.gravity > 0) {
        state.vy = (state.vy || 0) + state.gravity;
      }

      // Apply velocity
      sprite.x += (state.vx || 0);
      sprite.y += (state.vy || 0);

      // Boundary handling
      if (sprite.x < 0) sprite.x = 0;
      if (sprite.x + sprite.w > STAGE_W) sprite.x = STAGE_W - sprite.w;

      // Collision with ground
      if (sprite.y + sprite.h >= STAGE_H) {
        sprite.y = STAGE_H - sprite.h;
        state.vy = 0;
        state.isJumping = false;
        state.isGrounded = true;

        // Check collision event
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
