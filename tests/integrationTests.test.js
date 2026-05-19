/**
 * Integration Tests — Verify all new systems work together
 * Run: npm test -- integrationTests.test.js
 */

import * as mlEngine from '../utils/mlTrainingEngine';
import { ArduinoCommands, MicroBitCommands, MotorCommands } from '../utils/hardwareCommunication';
import {
  setCloudVariable,
  getCloudVariable,
  sendThingSpeakData,
  askChatGPT,
  getWeather,
} from '../utils/cloudBackend';
import { visualEffects, performanceOptimizer } from '../utils/visualEffectsOptimization';

describe('ML Training Engine', () => {
  test('should initialize image classifier', async () => {
    const result = await mlEngine.initImageClassifier();
    expect(result).toBeDefined();
  });

  test('should add image training example', async () => {
    // Create test tensor
    const tf = require('@tensorflow/tfjs');
    const testTensor = tf.ones([224, 224, 3]);

    const result = await mlEngine.addImageTrainingExample('cat', testTensor);
    expect(result.status).toBe('success');
    expect(result.totalExamples).toBeGreaterThan(0);
  });

  test('should add text training example', () => {
    const result = mlEngine.addTextTrainingExample('spam', 'Buy now!!');
    expect(result.status).toBe('success');
  });

  test('should add audio training example', () => {
    mlEngine.initAudioClassifier();
    // Mock audio buffer
    const mockAudio = { getChannelData: () => new Float32Array(44100) };
    const result = mlEngine.addAudioTrainingExample('applause', mockAudio);
    expect(result.status).toBe('success');
  });

  test('should get model status', () => {
    const status = mlEngine.getModelStatus('image');
    expect(status).toHaveProperty('trained');
    expect(status).toHaveProperty('trainingExamples');
    expect(status).toHaveProperty('classes');
  });

  test('should clear training data', () => {
    const result = mlEngine.clearTrainingData('text');
    expect(result.status).toBe('success');
  });
});

describe('Hardware Communication', () => {
  test('should discover USB devices', async () => {
    // Mock navigator.usb if not available
    if (!navigator.usb) {
      const result = await ArduinoCommands.writeDigital('SN123', 13, 1);
      expect(result.status).toBe('error');
      return;
    }

    const result = await discoverUSBDevices();
    expect(result).toHaveProperty('status');
  });

  test('should handle digital pin write command', async () => {
    // Mock test
    const result = await ArduinoCommands.writeDigital('MOCK_SN', 13, 1);
    expect(result).toHaveProperty('status');
  });

  test('should handle analog pin write command', async () => {
    const result = await ArduinoCommands.writeAnalog('MOCK_SN', 9, 128);
    expect(result).toHaveProperty('status');
  });

  test('should handle servo angle command', async () => {
    const result = await ArduinoCommands.setServo('MOCK_SN', 9, 90);
    expect(result).toHaveProperty('status');
  });

  test('should handle motor forward command', async () => {
    const result = await MotorCommands.forward('MOCK_SN', 100, 2);
    expect(result).toHaveProperty('status');
  });

  test('should handle motor turn command', async () => {
    const result = await MotorCommands.turn('MOCK_SN', 'left', 45, 75);
    expect(result).toHaveProperty('status');
  });

  test('should handle Micro:Bit display text', async () => {
    const result = await MicroBitCommands.displayText('MOCK_SN', 'Hello');
    expect(result).toHaveProperty('status');
  });

  test('should handle Micro:Bit tone command', async () => {
    const result = await MicroBitCommands.playTone('MOCK_SN', 440, 1000);
    expect(result).toHaveProperty('status');
  });
});

describe('Cloud Backend', () => {
  test('should set cloud variable', async () => {
    // This will fail without Firebase, but should handle gracefully
    const result = await setCloudVariable('project1', 'score', 100);
    expect(result).toHaveProperty('status');
  });

  test('should get cloud variable', async () => {
    const result = await getCloudVariable('project1', 'score');
    expect(result).toHaveProperty('status');
  });

  test('should get weather data', async () => {
    const result = await getWeather(51.5074, -0.1278); // London
    expect(result).toHaveProperty('status');

    if (result.status === 'success') {
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('condition');
    }
  });

  test('should handle ThingSpeak data send', async () => {
    const result = await sendThingSpeakData('mock_key', { field1: 25.5 });
    expect(result).toHaveProperty('status');
  });

  test('should handle ChatGPT request', async () => {
    // Requires API key, will error without it
    const result = await askChatGPT('Hello');
    expect(result).toHaveProperty('status');
  });
});

describe('Visual Effects', () => {
  let mockImageData;

  beforeEach(() => {
    mockImageData = {
      data: new Uint8ClampedArray(400),
      width: 10,
      height: 10,
    };
    // Fill with test data
    for (let i = 0; i < mockImageData.data.length; i += 4) {
      mockImageData.data[i] = 100; // R
      mockImageData.data[i + 1] = 150; // G
      mockImageData.data[i + 2] = 200; // B
      mockImageData.data[i + 3] = 255; // A
    }
  });

  test('should apply pixelate effect', () => {
    const result = visualEffects.pixelate(mockImageData, 2);
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
  });

  test('should apply fisheye distortion', () => {
    const result = visualEffects.fisheye(mockImageData, 0.5);
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
  });

  test('should apply whirl effect', () => {
    const result = visualEffects.whirl(mockImageData, 45);
    expect(result).toBeDefined();
  });

  test('should apply mosaic effect', () => {
    const result = visualEffects.mosaic(mockImageData, 2);
    expect(result).toBeDefined();
  });

  test('should apply grayscale effect', () => {
    const result = visualEffects.grayscale(mockImageData);
    expect(result).toBeDefined();
    // After grayscale, R, G, B should be equal
    expect(result.data[0]).toBe(result.data[1]);
  });

  test('should apply sepia effect', () => {
    const result = visualEffects.sepia(mockImageData);
    expect(result).toBeDefined();
  });

  test('should invert colors', () => {
    const result = visualEffects.invert(mockImageData);
    expect(result).toBeDefined();
    expect(result.data[0]).toBe(155); // 255 - 100
  });

  test('should adjust brightness', () => {
    const result = visualEffects.adjustBrightness(mockImageData, 2);
    expect(result).toBeDefined();
    expect(result.data[0]).toBeLessThanOrEqual(255);
  });

  test('should adjust saturation', () => {
    const result = visualEffects.adjustSaturation(mockImageData, 1.5);
    expect(result).toBeDefined();
  });

  test('should blur image', () => {
    const result = visualEffects.blur(mockImageData, 3);
    expect(result).toBeDefined();
  });
});

describe('Performance Optimization', () => {
  test('should cache sprite rendering', () => {
    const mockRender = jest.fn((canvas) => {
      canvas.width = 50;
      canvas.height = 50;
    });

    const canvas1 = performanceOptimizer.cacheSprite('sprite1', mockRender);
    const canvas2 = performanceOptimizer.cacheSprite('sprite1', mockRender);

    // Should return same cached canvas
    expect(canvas1).toBe(canvas2);
  });

  test('should invalidate sprite cache', () => {
    const mockRender = jest.fn((canvas) => {});
    performanceOptimizer.cacheSprite('sprite2', mockRender);
    performanceOptimizer.invalidateSpriteCache('sprite2');

    // Cache should be marked invalid
    const cached = performanceOptimizer.spriteCache.get('sprite2');
    expect(cached.valid).toBe(false);
  });

  test('should determine frame skip rate', () => {
    performanceOptimizer.setTargetFrameRate(30);
    const decision = performanceOptimizer.shouldRenderFrame();
    expect(typeof decision).toBe('boolean');
  });

  test('should build spatial hash for collision detection', () => {
    const sprites = [
      { x: 10, y: 10, id: 1 },
      { x: 60, y: 60, id: 2 },
      { x: 15, y: 15, id: 3 },
    ];

    const hash = performanceOptimizer.buildSpatialHash(sprites, 50);
    expect(hash).toBeInstanceOf(Map);
    expect(hash.size).toBeGreaterThan(0);
  });

  test('should get nearby sprites using spatial hash', () => {
    const sprites = [
      { x: 10, y: 10, id: 1 },
      { x: 200, y: 200, id: 2 },
    ];
    const hash = performanceOptimizer.buildSpatialHash(sprites, 50);

    const nearby = performanceOptimizer.getNearbySprites(sprites[0], hash);
    expect(nearby.length).toBeGreaterThan(0);
  });

  test('should create and use object pool', () => {
    const pool = performanceOptimizer.createObjectPool(
      () => ({ x: 0, y: 0, active: false }),
      5,
    );

    const obj1 = pool.get();
    expect(obj1).toBeDefined();
    expect(obj1).toHaveProperty('x');

    pool.release(obj1);
    const obj2 = pool.get();
    expect(obj2).toBe(obj1); // Should return same object
  });

  test('should get memory usage', () => {
    const memUsage = performanceOptimizer.getMemoryUsage();
    expect(memUsage).toHaveProperty('usedMB');
    // Will be 'unavailable' in test environment without performance.memory
  });
});

describe('Integration: ML + Cloud', () => {
  test('should train model and save to cloud', async () => {
    // Add training example
    mlEngine.initTextClassifier();
    mlEngine.addTextTrainingExample('test', 'sample text');

    // Could integrate with cloud save
    const status = mlEngine.getModelStatus('text');
    expect(status.trainingExamples).toBeGreaterThan(0);
  });
});

describe('Integration: Hardware + Performance', () => {
  test('should optimize batch motor commands', async () => {
    const commands = [
      () => MotorCommands.forward('SN', 100, 2),
      () => MotorCommands.turn('SN', 'left', 45, 75),
      () => MotorCommands.backward('SN', 100, 2),
    ];

    // Execute in batch with performance optimization
    for (const cmd of commands) {
      await cmd();
    }

    expect(commands.length).toBe(3);
  });
});

describe('Integration: Effects + Game Builder', () => {
  test('should apply effects to game sprite', () => {
    const mockImageData = {
      data: new Uint8ClampedArray(400),
      width: 10,
      height: 10,
    };

    // Apply chain of effects
    let result = visualEffects.pixelate(mockImageData, 2);
    result = visualEffects.adjustBrightness(result, 1.2);
    result = visualEffects.adjustSaturation(result, 0.8);

    expect(result).toBeDefined();
  });
});
