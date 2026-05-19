/**
 * CAMERA BLOCKS
 * Block definitions and runtime handlers for webcam control
 * Integrates with the visual block editor and runtime execution
 */

import { RenderPipeline, renderPipeline } from './RenderPipeline';
import { WebcamManager, webcamManager } from './WebcamManager';

export interface CameraBlockDef {
  type: string;
  label: string;
  category: string;
  color: string;
  icon: string;
  params: Record<string, string | number | boolean>;
}

export interface CameraBlockHandler {
  (params: Record<string, any>, context: any): Promise<any> | any;
}

/**
 * Standard camera block definitions (Scratch/PictoBlox style)
 */
export const CAMERA_BLOCKS: Record<string, CameraBlockDef> = {
  'camera-turn-on': {
    type: 'camera-turn-on',
    label: 'turn camera [on/off]',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {
      state: 'on',
    },
  },

  'camera-set-transparency': {
    type: 'camera-set-transparency',
    label: 'set video transparency to [transparency] %',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {
      transparency: '0',
    },
  },

  'camera-set-mirror': {
    type: 'camera-set-mirror',
    label: 'mirror video [on/off]',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {
      mirrored: 'off',
    },
  },

  'camera-get-width': {
    type: 'camera-get-width',
    label: 'video width',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {},
  },

  'camera-get-height': {
    type: 'camera-get-height',
    label: 'video height',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {},
  },

  'camera-get-transparency': {
    type: 'camera-get-transparency',
    label: 'video transparency',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {},
  },

  'camera-pause': {
    type: 'camera-pause',
    label: 'pause video',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {},
  },

  'camera-resume': {
    type: 'camera-resume',
    label: 'resume video',
    category: 'video',
    color: '#4C97FF',
    icon: '📹',
    params: {},
  },
};

/**
 * Block execution handlers
 */
export class CameraBlockExecutor {
  private pipeline: RenderPipeline;
  private webcam: WebcamManager;
  private handlers: Map<string, CameraBlockHandler>;

  constructor(pipeline?: RenderPipeline, webcam?: WebcamManager) {
    this.pipeline = pipeline || renderPipeline;
    this.webcam = webcam || webcamManager;
    this.handlers = this.createHandlers();
  }

  /**
   * Execute a camera block
   */
  async executeBlock(
    blockType: string,
    params: Record<string, any>,
    context?: any
  ): Promise<any> {
    const handler = this.handlers.get(blockType);
    if (!handler) {
      console.warn(`[CameraBlockExecutor] Unknown block type: ${blockType}`);
      return null;
    }

    try {
      return await handler(params, context);
    } catch (error) {
      console.error(`[CameraBlockExecutor] Block execution error (${blockType}):`, error);
      return null;
    }
  }

  /**
   * Create block handlers
   */
  private createHandlers(): Map<string, CameraBlockHandler> {
    const handlers = new Map<string, CameraBlockHandler>();

    // Turn camera on/off
    handlers.set('camera-turn-on', async (params) => {
      const state = String(params.state || 'on').toLowerCase();
      if (state === 'on') {
        return await this.pipeline.start();
      } else {
        this.pipeline.stop();
        return true;
      }
    });

    // Set transparency
    handlers.set('camera-set-transparency', (params) => {
      const transparency = parseInt(params.transparency, 10) || 0;
      const clamped = Math.max(0, Math.min(100, transparency));
      const opacity = (100 - clamped) / 100;
      this.pipeline.setWebcamOpacity(opacity);
      this.webcam.setTransparency(clamped);
      console.log(`[CameraBlockExecutor] Transparency set to ${clamped}% (opacity: ${opacity})`);
      return true;
    });

    // Set mirror
    handlers.set('camera-set-mirror', (params) => {
      const mirrored = String(params.mirrored || 'off').toLowerCase() === 'on';
      this.webcam.setMirrored(mirrored);
      console.log(`[CameraBlockExecutor] Mirror set to ${mirrored}`);
      return true;
    });

    // Get width
    handlers.set('camera-get-width', () => {
      const config = this.webcam.getConfig();
      return config.width;
    });

    // Get height
    handlers.set('camera-get-height', () => {
      const config = this.webcam.getConfig();
      return config.height;
    });

    // Get transparency
    handlers.set('camera-get-transparency', () => {
      const config = this.webcam.getConfig();
      return config.transparency;
    });

    // Pause
    handlers.set('camera-pause', () => {
      this.pipeline.pause();
      return true;
    });

    // Resume
    handlers.set('camera-resume', async () => {
      this.pipeline.resume();
      return true;
    });

    return handlers;
  }
}

/**
 * Singleton executor
 */
export const cameraBlockExecutor = new CameraBlockExecutor();

/**
 * Integration helper for GameBuilder
 * Call this in your game loop or block execution system
 */
export async function executeCAMERABlock(
  blockType: string,
  params: Record<string, any>,
  context?: any
): Promise<any> {
  return cameraBlockExecutor.executeBlock(blockType, params, context);
}

/**
 * Get all camera block definitions for the block palette
 */
export function getCameraBlockDefinitions(): Record<string, CameraBlockDef> {
  return { ...CAMERA_BLOCKS };
}

/**
 * Register camera block with block system
 * Call this during app initialization
 */
export function registerCameraBlocks(blockSystem: any): void {
  Object.entries(CAMERA_BLOCKS).forEach(([key, blockDef]) => {
    blockSystem.register(blockDef.type, blockDef);
  });
  console.log('[CameraBlocks] Registered', Object.keys(CAMERA_BLOCKS).length, 'camera blocks');
}
