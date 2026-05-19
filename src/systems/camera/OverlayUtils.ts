/**
 * OVERLAY UTILITIES
 * Coordinate conversion, drawing helpers, and overlay management
 * For AI/CV overlays and visualization
 */

import { OverlayDrawConfig, CoordinateConversion } from './Types';

export class OverlayUtils {
  /**
   * Draw bounding box
   */
  static drawBoundingBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    config: Partial<OverlayDrawConfig> = {}
  ): void {
    const {
      color = '#00FF00',
      lineWidth = 2,
      fillAlpha = 0,
      strokeAlpha = 1,
      labels = false,
    } = config;

    ctx.save();

    // Draw fill if specified
    if (fillAlpha > 0) {
      ctx.fillStyle = color;
      ctx.globalAlpha = fillAlpha;
      ctx.fillRect(x, y, width, height);
    }

    // Draw stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = strokeAlpha;
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
  }

  /**
   * Draw keypoints (circles)
   */
  static drawKeypoints(
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number; confidence?: number }>,
    config: Partial<OverlayDrawConfig> = {}
  ): void {
    const {
      color = '#FF00FF',
      lineWidth = 2,
      fillAlpha = 0.7,
      strokeAlpha = 1,
      labels = false,
    } = config;

    ctx.save();

    points.forEach((point, index) => {
      const radius = lineWidth * 2;
      const confidence = point.confidence ?? 1;

      if (confidence < 0.1) return; // Skip low confidence points

      ctx.globalAlpha = fillAlpha * confidence;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = strokeAlpha * confidence;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (labels) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.font = '10px monospace';
        ctx.fillText(String(index), point.x + radius + 2, point.y - radius);
      }
    });

    ctx.restore();
  }

  /**
   * Draw skeleton (connected keypoints)
   */
  static drawSkeleton(
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number; confidence?: number }>,
    connections: Array<[number, number]>,
    config: Partial<OverlayDrawConfig> = {}
  ): void {
    const {
      color = '#00FF00',
      lineWidth = 2,
      strokeAlpha = 0.8,
    } = config;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = strokeAlpha;

    connections.forEach(([startIdx, endIdx]) => {
      const start = points[startIdx];
      const end = points[endIdx];

      if (!start || !end) return;

      const startConfidence = start.confidence ?? 1;
      const endConfidence = end.confidence ?? 1;

      if (startConfidence < 0.1 || endConfidence < 0.1) return;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * Draw segmentation mask
   */
  static drawSegmentation(
    ctx: CanvasRenderingContext2D,
    maskCanvas: HTMLCanvasElement,
    color: string = '#FF00FF',
    alpha: number = 0.5
  ): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  }

  /**
   * Draw text label
   */
  static drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    config: Partial<OverlayDrawConfig> = {}
  ): void {
    const { color = '#FFFFFF', fillAlpha = 1 } = config;

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = fillAlpha;
    ctx.font = 'bold 14px sans-serif';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * Convert webcam coordinates to stage coordinates
   */
  static convertWebcamToStage(
    webcamX: number,
    webcamY: number,
    webcamWidth: number,
    webcamHeight: number,
    stageWidth: number,
    stageHeight: number,
    mirrored: boolean = false
  ): { x: number; y: number } {
    // Scale from webcam to stage
    const scaleX = stageWidth / webcamWidth;
    const scaleY = stageHeight / webcamHeight;

    let x = webcamX * scaleX;
    let y = webcamY * scaleY;

    // Apply mirror if needed
    if (mirrored) {
      x = stageWidth - x;
    }

    return { x, y };
  }

  /**
   * Convert stage coordinates to webcam coordinates
   */
  static convertStageToWebcam(
    stageX: number,
    stageY: number,
    stageWidth: number,
    stageHeight: number,
    webcamWidth: number,
    webcamHeight: number,
    mirrored: boolean = false
  ): { x: number; y: number } {
    // Apply mirror if needed
    let x = stageX;
    if (mirrored) {
      x = stageWidth - x;
    }

    // Scale from stage to webcam
    const scaleX = webcamWidth / stageWidth;
    const scaleY = webcamHeight / stageHeight;

    x = x * scaleX;
    const y = stageY * scaleY;

    return { x, y };
  }

  /**
   * Clear overlay canvas
   */
  static clearOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);
  }

  /**
   * Draw debug grid
   */
  static drawDebugGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: number = 50,
    color: string = '#333333'
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Calculate bounding box from keypoints
   */
  static getBoundingBox(
    points: Array<{ x: number; y: number; confidence?: number }>,
    minConfidence: number = 0
  ): { x: number; y: number; width: number; height: number } | null {
    const validPoints = points.filter(p => (p.confidence ?? 1) >= minConfidence);

    if (validPoints.length === 0) {
      return null;
    }

    const xs = validPoints.map(p => p.x);
    const ys = validPoints.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Create color from HSL
   */
  static hslToRgb(h: number, s: number, l: number): string {
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /**
   * Get random color
   */
  static getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
}

/**
 * Overlay manager for AI/CV visualizations
 */
export class OverlayManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isVisible = true;
  private overlayData: Map<string, any> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = ctx;
  }

  /**
   * Set overlay visibility
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;
  }

  /**
   * Store overlay data
   */
  setData(key: string, data: any): void {
    this.overlayData.set(key, data);
  }

  /**
   * Get overlay data
   */
  getData(key: string): any {
    return this.overlayData.get(key);
  }

  /**
   * Clear overlay
   */
  clear(): void {
    OverlayUtils.clearOverlay(this.ctx, this.canvas.width, this.canvas.height);
    this.overlayData.clear();
  }

  /**
   * Render all overlays
   */
  render(): void {
    if (!this.isVisible) return;

    this.overlayData.forEach((data, key) => {
      try {
        this.renderOverlay(key, data);
      } catch (error) {
        console.error(`[OverlayManager] Error rendering overlay ${key}:`, error);
      }
    });
  }

  private renderOverlay(key: string, data: any): void {
    if (data.type === 'boundingBox') {
      OverlayUtils.drawBoundingBox(
        this.ctx,
        data.x,
        data.y,
        data.width,
        data.height,
        data.config
      );
    } else if (data.type === 'keypoints') {
      OverlayUtils.drawKeypoints(this.ctx, data.points, data.config);
    } else if (data.type === 'skeleton') {
      OverlayUtils.drawSkeleton(this.ctx, data.points, data.connections, data.config);
    }
  }
}
