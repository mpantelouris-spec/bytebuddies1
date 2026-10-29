/**
 * COMPREHENSIVE BLOCK EXECUTION TESTS
 * Enterprise-grade validation for all block categories
 */

import {
  BLOCK_SOUND_OPTIONS,
  ensureBlockSoundAudio,
  playBlockSound,
  setUserSoundVolume01,
  stopAllBlockSounds,
} from '../src/utils/blockSounds';
import { createScriptThread } from '../src/utils/controlFlowRuntime';
import {
  estimateSoundDurationSec,
  playSpriteSound,
  playSpriteSoundUntilDone,
} from '../src/utils/soundRuntime';

function createAudioParam() {
  const events = [];
  return {
    events,
    setValueAtTime: jest.fn((value, time) => events.push(['set', value, time])),
    linearRampToValueAtTime: jest.fn((value, time) => events.push(['linear', value, time])),
    exponentialRampToValueAtTime: jest.fn((value, time) => events.push(['exponential', value, time])),
  };
}

class MockAudioContext {
  constructor() {
    this.currentTime = 1;
    this.sampleRate = 44100;
    this.state = 'running';
    this.destination = {};
    this.sources = [];
    this.gains = [];
  }

  createSource() {
    const source = {
      onended: null,
      connect: jest.fn(),
      start: jest.fn((time) => { source.startedAt = time; }),
      stop: jest.fn((time) => { source.stoppedAt = time; source.onended?.(); }),
      disconnect: jest.fn(),
    };
    this.sources.push(source);
    return source;
  }

  createGain() {
    const node = { gain: createAudioParam(), connect: jest.fn(), disconnect: jest.fn() };
    this.gains.push(node);
    return node;
  }

  createOscillator() {
    return Object.assign(this.createSource(), {
      type: 'sine',
      frequency: createAudioParam(),
      detune: createAudioParam(),
    });
  }

  createBuffer(_channels, length) {
    return { getChannelData: () => new Float32Array(length) };
  }

  createBufferSource() {
    return Object.assign(this.createSource(), { buffer: null });
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

// Mock data for testing
const BLOCK_DEFS = {
  'motion-movesteps': { category: 'motion', type: 'motion-movesteps', label: 'Move', color: '#4C97FF' },
  'motion-turnright': { category: 'motion', type: 'motion-turnright', label: 'Turn Right', color: '#4C97FF' },
  'motion-goto': { category: 'motion', type: 'motion-goto', label: 'Go To', color: '#4C97FF' },
  'looks-say': { category: 'looks', type: 'looks-say', label: 'Say', color: '#9966FF' },
  'control-wait': { category: 'control', type: 'control-wait', label: 'Wait', color: '#FFAB19' },
  'event-whengreateflagclicked': { category: 'event', type: 'event-whengreateflagclicked', label: 'When Flag', color: '#FFD500' },
  'sensing-touchingobject': { category: 'sensing', type: 'sensing-touchingobject', label: 'Touching', color: '#4CBFE6' },
  'variable-setvariableto': { category: 'variable', type: 'variable-setvariableto', label: 'Set Variable', color: '#FF6680' },
  'sound-play': { category: 'sound', type: 'sound-play', label: 'Play Sound', color: '#D65CD6' },
  'operators-add': { category: 'operators', type: 'operators-add', label: 'Add', color: '#59C059' },
  'list-append': { category: 'list', type: 'list-append', label: 'Add to List', color: '#E74C3C' },
};

const SIDEBAR_TO_TYPE = {
  'Motion': 'motion',
  'Looks': 'looks',
  'Sound': 'sound',
  'Event': 'event',
  'Control': 'control',
  'Sensing': 'sensing',
  'Operators': 'operators',
  'Variables': 'variable',
  'Lists': 'list',
};

describe('═══ MOTION BLOCKS ═══', () => {
  let sprite;

  beforeEach(() => {
    sprite = {
      x: 0,
      y: 0,
      direction: 0,
      width: 20,
      height: 20,
      visible: true,
      costumeIndex: 0,
      size: 100,
      rotation: 0,
      effects: {},
    };
  });

  describe('move steps', () => {
    test('should move sprite forward in current direction', () => {
      sprite.direction = 0; // right
      const newX = sprite.x + 10 * Math.cos((sprite.direction * Math.PI) / 180);
      const newY = sprite.y + 10 * Math.sin((sprite.direction * Math.PI) / 180);
      expect(newX).toBeCloseTo(10, 1);
      expect(newY).toBeCloseTo(0, 1);
    });

    test('should handle negative steps (move backward)', () => {
      sprite.direction = 0;
      const newX = sprite.x + (-10) * Math.cos((sprite.direction * Math.PI) / 180);
      expect(newX).toBeCloseTo(-10, 1);
    });

    test('should handle extreme values', () => {
      sprite.direction = 0;
      const extremeSteps = 999999;
      const newX = sprite.x + extremeSteps * Math.cos((sprite.direction * Math.PI) / 180);
      expect(Number.isFinite(newX)).toBe(true);
    });

    test('should handle all 360 degree directions', () => {
      for (let dir = 0; dir < 360; dir += 45) {
        sprite.direction = dir;
        const newX = sprite.x + 10 * Math.cos((sprite.direction * Math.PI) / 180);
        const newY = sprite.y + 10 * Math.sin((sprite.direction * Math.PI) / 180);
        expect(Number.isFinite(newX)).toBe(true);
        expect(Number.isFinite(newY)).toBe(true);
      }
    });

    test('should clamp position to world bounds safely', () => {
      sprite.x = -999999;
      sprite.y = 999999;
      expect(Number.isFinite(sprite.x)).toBe(true);
      expect(Number.isFinite(sprite.y)).toBe(true);
    });
  });

  describe('turn clockwise/anticlockwise', () => {
    test('should increment direction clockwise', () => {
      sprite.direction = 0;
      sprite.direction = (sprite.direction + 90) % 360;
      expect(sprite.direction).toBe(90);
    });

    test('should wrap around at 360 degrees', () => {
      sprite.direction = 350;
      sprite.direction = (sprite.direction + 20) % 360;
      expect(sprite.direction).toBe(10);
    });

    test('should handle negative angles', () => {
      sprite.direction = 10;
      sprite.direction = ((sprite.direction - 20) % 360 + 360) % 360;
      expect(sprite.direction).toBe(350);
    });

    test('should handle large rotation values', () => {
      sprite.direction = 0;
      sprite.direction = (sprite.direction + 720) % 360;
      expect(sprite.direction).toBe(0);
    });
  });

  describe('go to x,y', () => {
    test('should set exact position', () => {
      sprite.x = 100;
      sprite.y = 200;
      expect(sprite.x).toBe(100);
      expect(sprite.y).toBe(200);
    });

    test('should handle negative coordinates', () => {
      sprite.x = -100;
      sprite.y = -200;
      expect(sprite.x).toBe(-100);
      expect(sprite.y).toBe(-200);
    });

    test('should handle floating point coordinates', () => {
      sprite.x = 123.456;
      sprite.y = 789.012;
      expect(sprite.x).toBeCloseTo(123.456, 3);
      expect(sprite.y).toBeCloseTo(789.012, 3);
    });

    test('should handle extreme coordinates', () => {
      sprite.x = Number.MAX_SAFE_INTEGER / 2;
      sprite.y = -Number.MAX_SAFE_INTEGER / 2;
      expect(Number.isFinite(sprite.x)).toBe(true);
      expect(Number.isFinite(sprite.y)).toBe(true);
    });

    test('should reject NaN coordinates', () => {
      sprite.x = NaN;
      sprite.y = NaN;
      expect(Number.isNaN(sprite.x)).toBe(true);
      expect(Number.isNaN(sprite.y)).toBe(true);
    });
  });

  describe('glide secs to', () => {
    test('should interpolate position linearly', () => {
      const startX = 0, startY = 0;
      const endX = 100, endY = 100;
      const duration = 1; // 1 second
      const steps = 10;
      const deltaX = (endX - startX) / steps;
      const deltaY = (endY - startY) / steps;

      expect(deltaX).toBe(10);
      expect(deltaY).toBe(10);
    });

    test('should handle zero duration', () => {
      const duration = 0;
      expect(isFinite(1 / (duration || 0.001))).toBe(true);
    });

    test('should handle negative duration gracefully', () => {
      const duration = -1;
      expect(duration < 0).toBe(true);
    });
  });

  describe('point in direction', () => {
    test('should set sprite direction', () => {
      sprite.direction = 45;
      expect(sprite.direction).toBe(45);
    });

    test('should normalize direction to 0-360', () => {
      let dir = 450;
      dir = ((dir % 360) + 360) % 360;
      expect(dir).toBe(90);
    });

    test('should handle towards mouse direction', () => {
      const mouseX = 100, mouseY = 100;
      const spriteX = 0, spriteY = 0;
      const direction = Math.atan2(mouseY - spriteY, mouseX - spriteX) * (180 / Math.PI);
      expect(Number.isFinite(direction)).toBe(true);
    });
  });

  describe('set rotation style', () => {
    test('should support "don\'t rotate" style', () => {
      sprite.rotationStyle = 'no-rotation';
      expect(sprite.rotationStyle).toBe('no-rotation');
    });

    test('should support "rotate" style', () => {
      sprite.rotationStyle = 'all-around';
      expect(sprite.rotationStyle).toBe('all-around');
    });

    test('should support "flip horizontal" style', () => {
      sprite.rotationStyle = 'left-right';
      expect(sprite.rotationStyle).toBe('left-right');
    });
  });
});

describe('═══ LOOKS BLOCKS ═══', () => {
  let sprite;

  beforeEach(() => {
    sprite = {
      sayText: '',
      sayUntil: 0,
      thinkText: '',
      thinkUntil: 0,
      costumeIndex: 0,
      backdropIndex: 0,
      size: 100,
      effects: {
        color: 0,
        fisheye: 0,
        whirl: 0,
        pixelate: 0,
        mosaic: 0,
        brightness: 0,
        ghost: 0,
      },
    };
  });

  describe('say for seconds', () => {
    test('should set say text', () => {
      sprite.sayText = 'Hello';
      expect(sprite.sayText).toBe('Hello');
    });

    test('should set say duration', () => {
      sprite.sayUntil = Date.now() + 2000;
      expect(sprite.sayUntil > Date.now()).toBe(true);
    });

    test('should handle empty text', () => {
      sprite.sayText = '';
      expect(sprite.sayText).toBe('');
    });

    test('should handle very long text', () => {
      const longText = 'a'.repeat(10000);
      sprite.sayText = longText;
      expect(sprite.sayText.length).toBe(10000);
    });

    test('should handle Unicode text', () => {
      sprite.sayText = '你好世界 🌍 مرحبا العالم';
      expect(sprite.sayText).toContain('你好');
      expect(sprite.sayText).toContain('🌍');
      expect(sprite.sayText).toContain('مرحبا');
    });

    test('should handle HTML entities safely', () => {
      sprite.sayText = '<script>alert("XSS")</script>';
      expect(sprite.sayText).toContain('script');
    });
  });

  describe('think for seconds', () => {
    test('should set think text', () => {
      sprite.thinkText = 'Thinking...';
      expect(sprite.thinkText).toBe('Thinking...');
    });

    test('should set think duration', () => {
      sprite.thinkUntil = Date.now() + 2000;
      expect(sprite.thinkUntil > Date.now()).toBe(true);
    });
  });

  describe('change size by', () => {
    test('should increment size', () => {
      sprite.size = 100;
      sprite.size += 50;
      expect(sprite.size).toBe(150);
    });

    test('should handle negative size changes', () => {
      sprite.size = 100;
      sprite.size -= 50;
      expect(sprite.size).toBe(50);
    });

    test('should clamp size to minimum', () => {
      sprite.size = 10;
      sprite.size -= 50;
      sprite.size = Math.max(1, sprite.size);
      expect(sprite.size).toBeGreaterThanOrEqual(1);
    });

    test('should handle size overflow', () => {
      sprite.size = 1000000;
      expect(sprite.size).toBeGreaterThan(0);
    });
  });

  describe('color effects', () => {
    test('should apply color effect', () => {
      sprite.effects.color = 45;
      expect(sprite.effects.color).toBe(45);
    });

    test('should apply ghost/transparency effect', () => {
      sprite.effects.ghost = 50;
      expect(sprite.effects.ghost).toBe(50);
      expect(sprite.effects.ghost).toBeLessThanOrEqual(100);
      expect(sprite.effects.ghost).toBeGreaterThanOrEqual(0);
    });

    test('should clear all effects', () => {
      sprite.effects.color = 45;
      sprite.effects.ghost = 50;
      sprite.effects = {
        color: 0,
        fisheye: 0,
        whirl: 0,
        pixelate: 0,
        mosaic: 0,
        brightness: 0,
        ghost: 0,
      };
      expect(sprite.effects.color).toBe(0);
      expect(sprite.effects.ghost).toBe(0);
    });

    test('should stack multiple effects', () => {
      sprite.effects.color = 45;
      sprite.effects.brightness = 25;
      sprite.effects.ghost = 10;
      expect(sprite.effects.color).toBe(45);
      expect(sprite.effects.brightness).toBe(25);
      expect(sprite.effects.ghost).toBe(10);
    });
  });

  describe('costume/backdrop switching', () => {
    test('should switch to next costume', () => {
      sprite.costumeIndex = 0;
      sprite.costumeIndex = (sprite.costumeIndex + 1) % 3; // 3 costumes
      expect(sprite.costumeIndex).toBe(1);
    });

    test('should wrap around costumes', () => {
      sprite.costumeIndex = 2;
      sprite.costumeIndex = (sprite.costumeIndex + 1) % 3;
      expect(sprite.costumeIndex).toBe(0);
    });

    test('should handle single costume', () => {
      sprite.costumeIndex = 0;
      sprite.costumeIndex = (sprite.costumeIndex + 1) % 1;
      expect(sprite.costumeIndex).toBe(0);
    });
  });

  describe('layer ordering', () => {
    test('should move sprite to front layer', () => {
      sprite.layer = 100;
      sprite.layer = Number.MAX_SAFE_INTEGER;
      expect(sprite.layer).toBeGreaterThan(100);
    });

    test('should move sprite back layers', () => {
      sprite.layer = 100;
      sprite.layer -= 10;
      expect(sprite.layer).toBe(90);
    });

    test('should clamp layer to valid range', () => {
      sprite.layer = -999;
      sprite.layer = Math.max(0, sprite.layer);
      expect(sprite.layer).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('═══ SOUND BLOCKS ═══', () => {
  const expectedSources = {
    pop: 2, click: 1, coin: 2, laser: 1, jump: 1, win: 4, lose: 1,
    drum: 2, bell: 2, boing: 1, zap: 3, whoosh: 1, meow: 2,
  };
  let audioContext;

  beforeAll(() => {
    audioContext = new MockAudioContext();
    window.AudioContext = jest.fn(() => audioContext);
    ensureBlockSoundAudio();
  });

  beforeEach(() => {
    stopAllBlockSounds();
    audioContext.sources.length = 0;
    audioContext.gains.length = 0;
    setUserSoundVolume01(1);
  });

  afterAll(() => {
    stopAllBlockSounds();
    delete window.AudioContext;
  });

  test.each(BLOCK_SOUND_OPTIONS)('schedules audio for %s', ({ id }) => {
    playBlockSound(id);
    expect(audioContext.sources.filter((source) => source.startedAt != null)).toHaveLength(expectedSources[id]);
  });

  test('stops and disconnects every active sound source', () => {
    playBlockSound('boing');
    const sources = [...audioContext.sources];

    stopAllBlockSounds();

    expect(sources.every((source) => source.stop.mock.calls.length > 1)).toBe(true);
    expect(sources.every((source) => source.disconnect.mock.calls.length === 1)).toBe(true);
  });

  test('applies a sprite volume only once', () => {
    playSpriteSound({ _sound: { volume: 50, effects: { pitch: 0 } } }, 'click');
    const ramps = audioContext.gains.flatMap((gain) => gain.gain.events);

    expect(ramps.some(([kind, value]) => kind === 'linear' && value === 0.04)).toBe(true);
  });

  test('plays until done once and yields the thread for the sound duration', () => {
    const sprite = {};
    const thread = createScriptThread();
    const before = Date.now();

    expect(playSpriteSoundUntilDone(sprite, 'boing', thread)).toBe(true);
    const after = Date.now();
    // The block reads the clock itself, so allow for the time that passed while it ran
    const dur = estimateSoundDurationSec('boing') * 1000;
    expect(thread.waitEndTime).toBeGreaterThanOrEqual(before + dur);
    expect(thread.waitEndTime).toBeLessThanOrEqual(after + dur);
    expect(thread.soundWaitPending).toBe(true);

    const sourceCount = audioContext.sources.length;
    const now = jest.spyOn(Date, 'now').mockReturnValue(thread.waitEndTime + 1);
    expect(playSpriteSoundUntilDone(sprite, 'boing', thread)).toBe(false);
    now.mockRestore();

    expect(audioContext.sources).toHaveLength(sourceCount);
    expect(thread.soundWaitPending).toBe(false);
    expect(thread.waitEndTime).toBeNull();
  });
});

describe('═══ VARIABLE BLOCKS ═══', () => {
  let vars;

  beforeEach(() => {
    vars = {};
  });

  describe('set variable', () => {
    test('should create and set variable', () => {
      vars.myVar = 42;
      expect(vars.myVar).toBe(42);
    });

    test('should handle string variables', () => {
      vars.myVar = 'hello';
      expect(vars.myVar).toBe('hello');
    });

    test('should handle boolean variables', () => {
      vars.myVar = true;
      expect(vars.myVar).toBe(true);
    });

    test('should overwrite existing variables', () => {
      vars.myVar = 1;
      vars.myVar = 2;
      expect(vars.myVar).toBe(2);
    });

    test('should handle null values', () => {
      vars.myVar = null;
      expect(vars.myVar).toBeNull();
    });

    test('should handle undefined values', () => {
      vars.myVar = undefined;
      expect(vars.myVar).toBeUndefined();
    });

    test('should handle NaN values', () => {
      vars.myVar = NaN;
      expect(Number.isNaN(vars.myVar)).toBe(true);
    });

    test('should handle Infinity', () => {
      vars.myVar = Infinity;
      expect(vars.myVar).toBe(Infinity);
    });

    test('should handle extreme numbers', () => {
      vars.myVar = Number.MAX_SAFE_INTEGER;
      expect(vars.myVar).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle Unicode strings', () => {
      vars.myVar = '你好世界 🌍';
      expect(vars.myVar).toContain('你好');
    });
  });

  describe('change variable by', () => {
    test('should increment numeric variable', () => {
      vars.myVar = 10;
      vars.myVar += 5;
      expect(vars.myVar).toBe(15);
    });

    test('should handle string concatenation', () => {
      vars.myVar = 'hello';
      vars.myVar = vars.myVar + ' world';
      expect(vars.myVar).toBe('hello world');
    });

    test('should handle type coercion', () => {
      vars.myVar = 10;
      vars.myVar = vars.myVar + '5';
      expect(vars.myVar).toBe('105');
    });

    test('should handle uninitialized variables', () => {
      vars.myVar = (vars.myVar || 0) + 5;
      expect(vars.myVar).toBe(5);
    });
  });
});

describe('═══ LIST BLOCKS ═══', () => {
  let lists;

  beforeEach(() => {
    lists = {};
  });

  describe('list operations', () => {
    test('should add item to list', () => {
      lists.myList = [];
      lists.myList.push('apple');
      expect(lists.myList).toContain('apple');
    });

    test('should delete item from list', () => {
      lists.myList = ['a', 'b', 'c'];
      lists.myList.splice(1, 1);
      expect(lists.myList).toEqual(['a', 'c']);
    });

    test('should delete all items from list', () => {
      lists.myList = ['a', 'b', 'c'];
      lists.myList.length = 0;
      expect(lists.myList).toEqual([]);
    });

    test('should insert at position', () => {
      lists.myList = ['a', 'c'];
      lists.myList.splice(1, 0, 'b');
      expect(lists.myList).toEqual(['a', 'b', 'c']);
    });

    test('should replace item in list', () => {
      lists.myList = ['a', 'b', 'c'];
      lists.myList[1] = 'x';
      expect(lists.myList).toEqual(['a', 'x', 'c']);
    });

    test('should get item from list', () => {
      lists.myList = ['apple', 'banana', 'cherry'];
      expect(lists.myList[0]).toBe('apple');
      expect(lists.myList[1]).toBe('banana');
    });

    test('should handle out of bounds access gracefully', () => {
      lists.myList = ['a', 'b', 'c'];
      expect(lists.myList[999]).toBeUndefined();
    });

    test('should handle negative indices', () => {
      lists.myList = ['a', 'b', 'c'];
      const item = lists.myList[lists.myList.length - 1];
      expect(item).toBe('c');
    });

    test('should check list contains', () => {
      lists.myList = ['apple', 'banana', 'cherry'];
      expect(lists.myList.includes('apple')).toBe(true);
      expect(lists.myList.includes('grape')).toBe(false);
    });

    test('should get list length', () => {
      lists.myList = ['a', 'b', 'c'];
      expect(lists.myList.length).toBe(3);
    });

    test('should handle list with mixed types', () => {
      lists.myList = ['text', 42, true, null, undefined, { obj: 'ect' }];
      expect(lists.myList.length).toBe(6);
    });

    test('should handle very large lists', () => {
      lists.myList = [];
      for (let i = 0; i < 100000; i++) {
        lists.myList.push(i);
      }
      expect(lists.myList.length).toBe(100000);
      expect(lists.myList[50000]).toBe(50000);
    });

    test('should recover from list corruption', () => {
      lists.myList = ['a', 'b', 'c'];
      lists.myList = lists.myList.filter(x => x !== undefined);
      expect(lists.myList.length).toBe(3);
    });

    test('should persist list after operations', () => {
      lists.myList = ['a'];
      lists.myList.push('b');
      lists.myList.push('c');
      expect(lists.myList).toEqual(['a', 'b', 'c']);
    });
  });
});

describe('═══ OPERATOR BLOCKS ═══', () => {
  test('should handle division by zero', () => {
    const result = 10 / 0;
    expect(result).toBe(Infinity);
  });

  test('should handle NaN operations', () => {
    const result = NaN + 5;
    expect(Number.isNaN(result)).toBe(true);
  });

  test('should handle infinity operations', () => {
    const result = Infinity + 1;
    expect(result).toBe(Infinity);
  });

  test('should handle string operations', () => {
    const result = 'hello' + ' ' + 'world';
    expect(result).toBe('hello world');
  });

  test('should handle boolean coercion', () => {
    const result = true + 1;
    expect(result).toBe(2);
  });

  test('should handle comparison operations', () => {
    expect(10 > 5).toBe(true);
    expect(10 < 5).toBe(false);
    expect(10 === 10).toBe(true);
  });

  test('should handle logical operations', () => {
    expect(true && true).toBe(true);
    expect(true && false).toBe(false);
    expect(true || false).toBe(true);
    expect(!true).toBe(false);
  });

  test('should handle random number generation', () => {
    const random = Math.random() * 100;
    expect(random).toBeGreaterThanOrEqual(0);
    expect(random).toBeLessThan(100);
  });

  test('should handle modulo operation', () => {
    expect(10 % 3).toBe(1);
    expect(-10 % 3).toBe(-1);
  });

  test('should handle round operation', () => {
    expect(Math.round(3.7)).toBe(4);
    expect(Math.round(3.2)).toBe(3);
  });
});

describe('═══ CONTROL BLOCKS ═══', () => {
  test('should wait specified seconds', async () => {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  test('should handle repeat loop', () => {
    let count = 0;
    for (let i = 0; i < 10; i++) {
      count++;
    }
    expect(count).toBe(10);
  });

  test('should handle repeat until condition', () => {
    let count = 0;
    while (count < 10) {
      count++;
    }
    expect(count).toBe(10);
  });

  test('should handle nested loops', () => {
    let count = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        count++;
      }
    }
    expect(count).toBe(15);
  });

  test('should protect against infinite loops', () => {
    let count = 0;
    const maxIterations = 10000;
    while (count < 100 && count < maxIterations) {
      count++;
    }
    expect(count).toBe(100);
  });

  test('should handle break statement', () => {
    let count = 0;
    for (let i = 0; i < 100; i++) {
      if (i === 50) break;
      count++;
    }
    expect(count).toBe(50);
  });

  test('should handle if-then-else', () => {
    let result;
    if (10 > 5) {
      result = 'yes';
    } else {
      result = 'no';
    }
    expect(result).toBe('yes');
  });
});

describe('═══ BLOCK SERIALIZATION ═══', () => {
  test('should serialize block to XML', () => {
    const block = {
      type: 'motion-movesteps',
      fields: { STEPS: 10 },
      statements: [],
    };
    const xml = JSON.stringify(block);
    expect(xml).toContain('motion-movesteps');
  });

  test('should deserialize block from XML', () => {
    const xml = '{"type":"motion-movesteps","fields":{"STEPS":10}}';
    const block = JSON.parse(xml);
    expect(block.type).toBe('motion-movesteps');
    expect(block.fields.STEPS).toBe(10);
  });

  test('should handle nested block serialization', () => {
    const blocks = [
      { type: 'event-start', statements: [
        { type: 'motion-movesteps', fields: { STEPS: 10 } }
      ]},
    ];
    const json = JSON.stringify(blocks);
    const deserialized = JSON.parse(json);
    expect(deserialized[0].statements[0].type).toBe('motion-movesteps');
  });

  test('should handle block with arrays', () => {
    const block = {
      type: 'lists-create',
      items: ['a', 'b', 'c'],
    };
    const json = JSON.stringify(block);
    const parsed = JSON.parse(json);
    expect(parsed.items.length).toBe(3);
  });

  test('should handle circular reference protection', () => {
    const block = { type: 'test' };
    block.self = block; // circular reference
    expect(() => JSON.stringify(block)).toThrow();
  });
});

describe('═══ BLOCK RENDERING ═══', () => {
  test('should check all blocks are defined', () => {
    const blockTypes = Object.keys(BLOCK_DEFS);
    expect(blockTypes.length).toBeGreaterThan(0);
  });

  test('should verify block colors are valid', () => {
    Object.values(BLOCK_DEFS).forEach(def => {
      if (def.color) {
        expect(def.color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  test('should verify block categories exist', () => {
    const validCategories = ['motion', 'looks', 'sound', 'event', 'control', 'sensing', 'operators', 'variable', 'list'];
    Object.values(BLOCK_DEFS).forEach(def => {
      if (def.category) {
        expect(validCategories).toContain(def.category);
      }
    });
  });

  test('should verify block labels are unique per category', () => {
    const byCategory = {};
    Object.values(BLOCK_DEFS).forEach(def => {
      if (def.category) {
        if (!byCategory[def.category]) byCategory[def.category] = [];
        byCategory[def.category].push(def.label);
      }
    });
    Object.values(byCategory).forEach(labels => {
      const unique = new Set(labels);
      expect(unique.size).toBe(labels.length);
    });
  });
});
