/**
 * RENDER PIPELINE
 * Main rendering orchestrator
 * Coordinates stage renderer, layer compositor, and webcam system
 * Maintains stable FPS and handles all lifecycle events
 */

import { StageRenderer, stageRenderer } from './StageRenderer';
import { LayerCompositor, layerCompositor } from './LayerCompositor';
import { WebcamManager, webcamManager } from './WebcamManager';
import { StageConfig, RenderContext, FrameData, LayerType } from './Types';

export type FrameCallback = (ctx: CanvasRenderingContext2D, renderCtx: RenderContext) => void;

export class RenderPipeline {
  private stageRenderer: StageRenderer;
  private layerCompositor: LayerCompositor;
  private webcamManager: WebcamManager;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private frameCallbacks: Map<LayerType, FrameCallback> = new Map();
  private webcamOpacity = 1;
  private debugEnabled = false;
  private frameSkipCount = 0;
  private targetFps = 60;

  constructor(
    renderer?: StageRenderer,
    compositor?: LayerCompositor,
    camera?: WebcamManager
  ) {
    this.stageRenderer = renderer || stageRenderer;
    this.layerCompositor = compositor || layerCompositor;
    this.webcamManager = camera || webcamManager;

    this.setupLayers();
  }

  /**
   * Initialize the pipeline with canvas element
   */
  async initialize(canvasElement: HTMLCanvasElement, container?: HTMLElement): Promise<boolean> {
    try {
      // Initialize stage renderer
      if (!this.stageRenderer.initialize(canvasElement, container)) {
        throw new Error('Failed to initialize stage renderer');
      }

      // Initialize webcam
      const webcamReady = await this.webcamManager.initialize();
      if (!webcamReady) {
        console.warn('[RenderPipeline] Webcam initialization failed, continuing without camera');
      }

      console.log('[RenderPipeline] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[RenderPipeline] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Start rendering loop
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Start webcam if initialized
      if (this.webcamManager.getState().isInitialized) {
        await this.webcamManager.start();
      }

      this.isRunning = true;
      this.frameSkipCount = 0;
      this.startRenderLoop();

      console.log('[RenderPipeline] Started');
    } catch (error) {
      console.error('[RenderPipeline] Start failed:', error);
    }
  }

  /**
   * Stop rendering loop
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.webcamManager.stop();
    console.log('[RenderPipeline] Stopped');
  }

  /**
   * Pause rendering (keep stream running)
   */
  pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.webcamManager.pause();
  }

  /**
   * Resume rendering
   */
  resume(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.webcamManager.resume();
    this.startRenderLoop();
  }

  /**
   * Register frame render callback for a layer
   */
  onLayerFrame(layerType: LayerType, callback: FrameCallback): () => void {
    this.frameCallbacks.set(layerType, callback);
    return () => this.frameCallbacks.delete(layerType);
  }

  /**
   * Set webcam video opacity
   */
  setWebcamOpacity(opacity: number): void {
    this.webcamOpacity = Math.max(0, Math.min(1, opacity));
    this.layerCompositor.setLayerOpacity('webcam', this.webcamOpacity);
  }

  /**
   * Get webcam opacity
   */
  getWebcamOpacity(): number {
    return this.webcamOpacity;
  }

  /**
   * Enable/disable debug rendering
   */
  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
    this.layerCompositor.setLayerVisible('debug', enabled);
  }

  /**
   * Get webcam manager
   */
  getWebcamManager(): WebcamManager {
    return this.webcamManager;
  }

  /**
   * Get stage renderer
   */
  getStageRenderer(): StageRenderer {
    return this.stageRenderer;
  }

  /**
   * Get layer compositor
   */
  getLayerCompositor(): LayerCompositor {
    return this.layerCompositor;
  }

  /**
   * Resize stage
   */
  resizeStage(width: number, height: number): void {
    this.stageRenderer.resizeCanvas(width, height);
    this.layerCompositor.resizeLayers(width, height);
  }

  /**
   * Get render stats
   */
  getStats() {
    return {
      stage: this.stageRenderer.getStats(),
      webcam: this.webcamManager.getState(),
      layers: this.layerCompositor.getLayerStats(),
    };
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    this.stop();
    this.stageRenderer.destroy();
    this.layerCompositor.destroy();
    this.webcamManager.destroy();
    this.frameCallbacks.clear();
  }

  // Private methods

  private setupLayers(): void {
    // Background layer
    this.layerCompositor.registerLayer('background', { zIndex: 0 }, (ctx, deltaTime) => {
      // Background is cleared by stage renderer
    });

    // Webcam layer
    this.layerCompositor.registerLayer(
      'webcam',
      { zIndex: 10, opacity: this.webcamOpacity },
      (ctx, deltaTime) => {
        this.renderWebcamLayer(ctx, deltaTime);
      }
    );

    // Overlay layer
    this.layerCompositor.registerLayer('overlay', { zIndex: 20 }, (ctx, deltaTime) => {
      const callback = this.frameCallbacks.get('overlay');
      if (callback) {
        callback(ctx, deltaTime);
      }
    });

    // Sprites layer
    this.layerCompositor.registerLayer('sprites', { zIndex: 30 }, (ctx, deltaTime) => {
      const callback = this.frameCallbacks.get('sprites');
      if (callback) {
        callback(ctx, deltaTime);
      }
    });

    // Debug layer
    this.layerCompositor.registerLayer('debug', { zIndex: 100, visible: this.debugEnabled }, (ctx, deltaTime) => {
      if (this.debugEnabled) {
        this.renderDebugLayer(ctx);
      }
    });
  }

  private startRenderLoop(): void {
    if (!this.isRunning) return;

    const loop = () => {
      const frameStartTime = performance.now();

      const renderCtx = this.stageRenderer.beginFrame();
      if (!renderCtx) {
        this.animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // Clear stage
      this.stageRenderer.clear();

      // Render all layers
      this.layerCompositor.composite(renderCtx.mainCtx, renderCtx);

      // Measure frame time
      this.stageRenderer.endFrame(frameStartTime);

      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderWebcamLayer(ctx: CanvasRenderingContext2D, deltaTime: number): void {
    const frame = this.webcamManager.captureFrame();
    if (!frame) return;

    try {
      const imageData = frame.data;
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('[RenderPipeline] Failed to render webcam frame:', error);
    }
  }

  private renderDebugLayer(ctx: CanvasRenderingContext2D): void {
    const stats = this.getStats();

    // Render FPS counter
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.globalAlpha = 0.8;

    let yOffset = 20;
    const lineHeight = 16;

    ctx.fillText(`FPS: ${stats.stage.fps}`, 10, yOffset);
    yOffset += lineHeight;

    ctx.fillText(`Frame Time: ${stats.stage.frameTime.toFixed(2)}ms`, 10, yOffset);
    yOffset += lineHeight;

    ctx.fillText(`Render Time: ${stats.stage.renderTime.toFixed(2)}ms`, 10, yOffset);
    yOffset += lineHeight;

    ctx.fillText(`Frames: ${this.stageRenderer.getFrameCount()}`, 10, yOffset);
    yOffset += lineHeight;

    ctx.fillText(`Webcam: ${stats.webcam.isRunning ? 'ON' : 'OFF'}`, 10, yOffset);
    yOffset += lineHeight;

    ctx.fillText(`Opacity: ${(this.webcamOpacity * 100).toFixed(0)}%`, 10, yOffset);

    ctx.globalAlpha = 1;
  }
}

// Default singleton
export const renderPipeline = new RenderPipeline();
