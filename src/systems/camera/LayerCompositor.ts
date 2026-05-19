/**
 * LAYER COMPOSITOR
 * Manages rendering layers, compositing, and layer stack ordering
 * Ensures proper z-index and rendering order for all visual elements
 */

import { LayerType, LayerConfig, RenderContext, LayerCompositeConfig } from './Types';

export class LayerCompositor {
  private layerStack: Map<LayerType, LayerConfig> = new Map();
  private renderOrder: LayerType[] = ['background', 'webcam', 'overlay', 'sprites', 'debug'];
  private layerCanvases: Map<LayerType, HTMLCanvasElement> = new Map();
  private layerContexts: Map<LayerType, CanvasRenderingContext2D> = new Map();

  constructor() {
    this.initializeLayers();
  }

  /**
   * Initialize default layers
   */
  private initializeLayers(): void {
    const defaultLayers: Record<LayerType, LayerConfig> = {
      background: { type: 'background', zIndex: 0, opacity: 1, visible: true },
      webcam: { type: 'webcam', zIndex: 10, opacity: 1, visible: true },
      overlay: { type: 'overlay', zIndex: 20, opacity: 1, visible: true },
      sprites: { type: 'sprites', zIndex: 30, opacity: 1, visible: true },
      debug: { type: 'debug', zIndex: 100, opacity: 1, visible: false },
    };

    Object.values(defaultLayers).forEach(layer => {
      this.layerStack.set(layer.type, { ...layer });
    });
  }

  /**
   * Register a layer with render function
   */
  registerLayer(
    type: LayerType,
    config: Partial<LayerConfig>,
    renderFn: (ctx: CanvasRenderingContext2D, deltaTime: number) => void
  ): void {
    const existing = this.layerStack.get(type) || { type, zIndex: 50, opacity: 1, visible: true };
    const updated = { ...existing, ...config, renderFn };
    this.layerStack.set(type, updated);
  }

  /**
   * Update layer configuration
   */
  updateLayer(type: LayerType, config: Partial<LayerConfig>): void {
    const layer = this.layerStack.get(type);
    if (layer) {
      Object.assign(layer, config);
    }
  }

  /**
   * Set layer visibility
   */
  setLayerVisible(type: LayerType, visible: boolean): void {
    const layer = this.layerStack.get(type);
    if (layer) {
      layer.visible = visible;
    }
  }

  /**
   * Set layer opacity
   */
  setLayerOpacity(type: LayerType, opacity: number): void {
    const layer = this.layerStack.get(type);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  /**
   * Get layer configuration
   */
  getLayer(type: LayerType): LayerConfig | undefined {
    return this.layerStack.get(type);
  }

  /**
   * Composite all layers onto main canvas
   */
  composite(ctx: CanvasRenderingContext2D, renderCtx: RenderContext): void {
    // Clear main canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, renderCtx.displayWidth, renderCtx.displayHeight);

    // Render each layer in order
    for (const layerType of this.renderOrder) {
      const layer = this.layerStack.get(layerType);
      if (!layer || !layer.visible) continue;

      this.renderLayer(ctx, layer, renderCtx);
    }
  }

  /**
   * Render single layer
   */
  private renderLayer(
    mainCtx: CanvasRenderingContext2D,
    layer: LayerConfig,
    renderCtx: RenderContext
  ): void {
    try {
      // Get or create layer canvas
      let layerCanvas = this.layerCanvases.get(layer.type);
      let layerCtx = this.layerContexts.get(layer.type);

      if (!layerCanvas) {
        layerCanvas = document.createElement('canvas');
        layerCanvas.width = renderCtx.stageWidth;
        layerCanvas.height = renderCtx.stageHeight;
        this.layerCanvases.set(layer.type, layerCanvas);

        layerCtx = layerCanvas.getContext('2d');
        if (!layerCtx) {
          console.error(`[LayerCompositor] Failed to create context for layer ${layer.type}`);
          return;
        }
        this.layerContexts.set(layer.type, layerCtx);
      }

      // Clear layer canvas
      layerCtx.clearRect(0, 0, renderCtx.stageWidth, renderCtx.stageHeight);

      // Render layer content
      if (layer.renderFn) {
        layer.renderFn(layerCtx, renderCtx.deltaTime);
      }

      // Composite layer onto main canvas with opacity
      mainCtx.save();
      mainCtx.globalAlpha = layer.opacity;

      // Scale to display size if different from stage size
      if (renderCtx.displayWidth !== renderCtx.stageWidth || renderCtx.displayHeight !== renderCtx.stageHeight) {
        const scaleX = renderCtx.displayWidth / renderCtx.stageWidth;
        const scaleY = renderCtx.displayHeight / renderCtx.stageHeight;
        mainCtx.scale(scaleX, scaleY);
      }

      mainCtx.drawImage(layerCanvas, 0, 0);
      mainCtx.restore();
    } catch (error) {
      console.error(`[LayerCompositor] Error rendering layer ${layer.type}:`, error);
    }
  }

  /**
   * Set render order
   */
  setRenderOrder(order: LayerType[]): void {
    this.renderOrder = order;
  }

  /**
   * Get render order
   */
  getRenderOrder(): LayerType[] {
    return [...this.renderOrder];
  }

  /**
   * Resize all layers
   */
  resizeLayers(width: number, height: number): void {
    this.layerCanvases.forEach(canvas => {
      canvas.width = width;
      canvas.height = height;
    });
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    this.layerContexts.forEach(ctx => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.layerCanvases.clear();
    this.layerContexts.clear();
    this.layerStack.clear();
  }

  /**
   * Get layer stats for debugging
   */
  getLayerStats(): Record<LayerType, { visible: boolean; opacity: number; zIndex: number }> {
    const stats: Record<string, any> = {};
    this.layerStack.forEach((layer, type) => {
      stats[type] = {
        visible: layer.visible,
        opacity: layer.opacity,
        zIndex: layer.zIndex,
      };
    });
    return stats as Record<LayerType, any>;
  }
}

export const layerCompositor = new LayerCompositor();
