/**
 * STAGE RENDERER
 * Manages canvas setup, scaling, and main rendering surface
 * Handles responsive scaling and pixel-perfect rendering
 */

import { StageConfig, RenderContext, StageRenderStats } from './Types';

export class StageRenderer {
  private config: StageConfig;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private containerElement: HTMLElement | null = null;
  private frameStats: StageRenderStats;
  private frameTimings: number[] = [];
  private maxTimingSamples = 60;
  private lastFrameTime = performance.now();
  private totalTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private targetFrameTime = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: Partial<StageConfig> = {}) {
    this.config = {
      width: 480,
      height: 360,
      fps: 60,
      pixelRatio: window.devicePixelRatio || 1,
      backgroundColor: '#000000',
      responsiveScale: true,
      ...config,
    };

    this.targetFrameTime = 1000 / this.config.fps;

    this.frameStats = {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      layerRenderTimes: new Map(),
      memoryUsage: 0,
      droppedFrames: 0,
    };
  }

  /**
   * Initialize renderer with canvas element
   */
  initialize(canvasElement: HTMLCanvasElement, container?: HTMLElement): boolean {
    try {
      this.canvas = canvasElement;
      this.containerElement = container || canvasElement.parentElement;

      this.ctx = this.canvas.getContext('2d', {
        alpha: true,
        antialias: true,
        willReadFrequently: true,
      });

      if (!this.ctx) {
        throw new Error('Failed to get 2D context');
      }

      // Set up canvas sizing
      this.applyResponsiveResize();

      // Set up responsive scaling
      if (this.config.responsiveScale && this.containerElement) {
        this.setupResizeObserver();
      }

      console.log('[StageRenderer] Initialized:', {
        stageSize: `${this.config.width}x${this.config.height}`,
        pixelRatio: this.config.pixelRatio,
        responsiveScale: this.config.responsiveScale,
      });

      return true;
    } catch (error) {
      console.error('[StageRenderer] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Begin rendering frame
   */
  beginFrame(): RenderContext | null {
    if (!this.canvas || !this.ctx) {
      console.warn('[StageRenderer] Canvas not initialized');
      return null;
    }

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    // Track dropped frames
    if (deltaTime > this.targetFrameTime * 1.5) {
      this.droppedFrames++;
    }

    this.lastFrameTime = now;
    this.totalTime += deltaTime;
    this.frameCount++;

    // Update stats
    this.frameTimings.push(deltaTime);
    if (this.frameTimings.length > this.maxTimingSamples) {
      this.frameTimings.shift();
    }

    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;
    this.frameStats.frameTime = avgFrameTime;
    this.frameStats.fps = Math.round(1000 / avgFrameTime);
    this.frameStats.droppedFrames = this.droppedFrames;

    return {
      mainCanvas: this.canvas,
      mainCtx: this.ctx,
      stageWidth: this.config.width,
      stageHeight: this.config.height,
      displayWidth: this.canvas.width,
      displayHeight: this.canvas.height,
      pixelRatio: this.config.pixelRatio,
      deltaTime,
      totalTime: this.totalTime,
      frameCount: this.frameCount,
    };
  }

  /**
   * Clear canvas
   */
  clear(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * End frame and measure timing
   */
  endFrame(renderStartTime: number): void {
    const renderTime = performance.now() - renderStartTime;
    this.frameStats.renderTime = renderTime;

    // Log performance warning if frame took too long
    if (renderTime > this.targetFrameTime * 1.2) {
      console.warn(`[StageRenderer] Slow frame: ${renderTime.toFixed(2)}ms (target: ${this.targetFrameTime.toFixed(2)}ms)`);
    }
  }

  /**
   * Get rendering context
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Resize canvas to fit container or specified dimensions
   */
  resizeCanvas(width?: number, height?: number): void {
    if (!this.canvas) return;

    const targetWidth = width || this.config.width;
    const targetHeight = height || this.config.height;

    // Calculate display size (with pixel ratio)
    const displayWidth = Math.round(targetWidth * this.config.pixelRatio);
    const displayHeight = Math.round(targetHeight * this.config.pixelRatio);

    // Set canvas resolution
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;

    // Set CSS size (actual displayed size)
    this.canvas.style.width = `${targetWidth}px`;
    this.canvas.style.height = `${targetHeight}px`;

    // Scale context for pixel ratio
    if (this.ctx && this.config.pixelRatio !== 1) {
      this.ctx.scale(this.config.pixelRatio, this.config.pixelRatio);
    }

    console.log('[StageRenderer] Canvas resized:', {
      canvasSize: `${displayWidth}x${displayHeight}`,
      displaySize: `${targetWidth}x${targetHeight}`,
    });
  }

  /**
   * Set background color
   */
  setBackgroundColor(color: string): void {
    this.config.backgroundColor = color;
  }

  /**
   * Get current stats
   */
  getStats(): Readonly<StageRenderStats> {
    return Object.freeze({ ...this.frameStats });
  }

  /**
   * Get frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Get total elapsed time
   */
  getTotalTime(): number {
    return this.totalTime;
  }

  /**
   * Reset stats
   */
  resetStats(): void {
    this.frameTimings = [];
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.totalTime = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.canvas = null;
    this.ctx = null;
  }

  // Private methods

  private applyResponsiveResize(): void {
    if (!this.canvas) return;

    let width = this.config.width;
    let height = this.config.height;

    // Calculate responsive size if enabled
    if (this.config.responsiveScale && this.containerElement) {
      const containerWidth = this.containerElement.clientWidth;
      const containerHeight = this.containerElement.clientHeight;

      const scale = Math.min(containerWidth / width, containerHeight / height);
      width = Math.round(containerWidth / scale);
      height = Math.round(containerHeight / scale);

      // Maintain aspect ratio
      const aspectRatio = this.config.width / this.config.height;
      if (width / height !== aspectRatio) {
        height = Math.round(width / aspectRatio);
      }
    }

    this.resizeCanvas(width, height);
  }

  private setupResizeObserver(): void {
    if (!this.containerElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.applyResponsiveResize();
    });

    this.resizeObserver.observe(this.containerElement);
  }
}

export const stageRenderer = new StageRenderer();
