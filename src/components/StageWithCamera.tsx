/**
 * STAGE WITH CAMERA - React Component
 * Integrates the production-ready camera system with the game stage
 * Manages initialization, lifecycle, and block execution
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  RenderPipeline,
  WebcamManager,
  LayerCompositor,
  StageRenderer,
  OverlayManager,
  executeCAMERABlock,
} from '../systems/camera';

interface StageWithCameraProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  responsive?: boolean;
  onReady?: (pipeline: RenderPipeline) => void;
  onFrameRender?: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
  debugEnabled?: boolean;
}

export const StageWithCamera: React.FC<StageWithCameraProps> = ({
  width = 480,
  height = 360,
  backgroundColor = '#000000',
  responsive = true,
  onReady,
  onFrameRender,
  debugEnabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<RenderPipeline | null>(null);
  const overlayManagerRef = useRef<OverlayManager | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize camera system
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas ref not found');
        }

        // Create render pipeline with custom config
        const stageRenderer = new StageRenderer({
          width,
          height,
          backgroundColor,
          responsiveScale: responsive,
          fps: 60,
        });

        const layerCompositor = new LayerCompositor();
        const webcamManager = new WebcamManager({
          width: 1280,
          height: 720,
          mirrored: false,
          transparency: 0,
        });

        const pipeline = new RenderPipeline(stageRenderer, layerCompositor, webcamManager);

        // Initialize pipeline
        const initialized = await pipeline.initialize(canvasRef.current, containerRef.current || undefined);

        if (!initialized) {
          console.warn('[StageWithCamera] Pipeline initialization failed, but continuing');
        }

        // Set up sprite rendering layer callback
        if (onFrameRender) {
          pipeline.onLayerFrame('sprites', onFrameRender);
        }

        // Set up overlay manager
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        overlayManagerRef.current = new OverlayManager(overlayCanvas);

        pipelineRef.current = pipeline;
        setIsReady(true);

        // Start rendering
        await pipeline.start();

        // Update stats periodically
        statsIntervalRef.current = setInterval(() => {
          setStats(pipeline.getStats());
        }, 1000);

        // Call ready callback
        if (onReady) {
          onReady(pipeline);
        }

        console.log('[StageWithCamera] Initialized successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error('[StageWithCamera] Initialization error:', message);
      }
    };

    initialize();

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (pipelineRef.current) {
        pipelineRef.current.stop();
        pipelineRef.current.destroy();
      }
    };
  }, [width, height, backgroundColor, responsive, onFrameRender, onReady]);

  /**
   * Update debug mode
   */
  useEffect(() => {
    if (pipelineRef.current) {
      pipelineRef.current.setDebugEnabled(debugEnabled);
    }
  }, [debugEnabled]);

  return (
    <div ref={containerRef} className="stage-with-camera" style={{ position: 'relative', width, height }}>
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '10px',
            backgroundColor: '#FF4444',
            color: '#FFFFFF',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor,
          cursor: 'default',
        }}
      />

      {stats && debugEnabled && (
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            right: 5,
            padding: '5px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#00FF00',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 999,
          }}
        >
          <div>FPS: {stats.stage?.fps || 0}</div>
          <div>Frame: {Math.round(stats.stage?.frameTime || 0)}ms</div>
          <div>Webcam: {stats.webcam?.isRunning ? 'ON' : 'OFF'}</div>
        </div>
      )}

      {!isReady && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#CCCCCC',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          Initializing camera system...
        </div>
      )}
    </div>
  );
};

/**
 * Hook for accessing the render pipeline in child components
 */
export const useCameraPipeline = (): RenderPipeline | null => {
  // This would be implemented with Context in a real app
  // For now, components can access the pipeline through props
  return null;
};

/**
 * Hook for executing camera blocks
 */
export const useCameraBlocks = () => {
  return {
    executeBlock: executeCAMERABlock,
  };
};

/**
 * Example usage:
 *
 * <StageWithCamera
 *   width={480}
 *   height={360}
 *   responsive={true}
 *   debugEnabled={process.env.NODE_ENV === 'development'}
 *   onReady={(pipeline) => {
 *     // Store pipeline reference
 *     window.gamePipeline = pipeline;
 *   }}
 *   onFrameRender={(ctx, deltaTime) => {
 *     // Render sprites and game content here
 *     // This is called every frame
 *   }}
 * />
 */

export default StageWithCamera;
