/**
 * CAMERA SYSTEM - Main Exports
 * Production-ready camera/video system for visual game builders
 */

// Types
export * from './Types';

// Core systems
export { StageRenderer, stageRenderer } from './StageRenderer';
export { WebcamManager, webcamManager } from './WebcamManager';
export { LayerCompositor, layerCompositor } from './LayerCompositor';
export { RenderPipeline, renderPipeline } from './RenderPipeline';

// Blocks and execution
export {
  CameraBlockExecutor,
  cameraBlockExecutor,
  executeCAMERABlock,
  getCameraBlockDefinitions,
  registerCameraBlocks,
  type CameraBlockDef,
  type CameraBlockHandler,
} from './CameraBlocks';

// Utilities
export { OverlayUtils, OverlayManager } from './OverlayUtils';

// Pre-configured singleton
export { renderPipeline as defaultRenderPipeline, webcamManager as defaultWebcamManager };
