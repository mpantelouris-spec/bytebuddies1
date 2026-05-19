/**
 * CAMERA SYSTEM - Type Definitions
 * Production-ready types for stage rendering, webcam management, and layer compositing
 */

export type LayerType = 'background' | 'webcam' | 'overlay' | 'sprites' | 'debug';

export interface LayerConfig {
  type: LayerType;
  zIndex: number;
  opacity: number;
  visible: boolean;
  canvas?: HTMLCanvasElement;
  renderFn?: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
}

export interface StageConfig {
  width: number;
  height: number;
  fps: number;
  pixelRatio: number;
  backgroundColor: string;
  responsiveScale: boolean;
}

export interface WebcamConfig {
  width: number;
  height: number;
  fps: number;
  facingMode: 'user' | 'environment';
  mirrored: boolean;
  transparency: number;
}

export interface WebcamState {
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  hasPermission: boolean;
  error: string | null;
  stream: MediaStream | null;
  device: MediaDeviceInfo | null;
  frameCount: number;
  fps: number;
  lastFrameTime: number;
}

export interface FrameData {
  timestamp: number;
  width: number;
  height: number;
  data: ImageData;
  canvas: HTMLCanvasElement;
  mirrored: boolean;
}

export interface RenderContext {
  mainCanvas: HTMLCanvasElement;
  mainCtx: CanvasRenderingContext2D;
  stageWidth: number;
  stageHeight: number;
  displayWidth: number;
  displayHeight: number;
  pixelRatio: number;
  deltaTime: number;
  totalTime: number;
  frameCount: number;
}

export interface LayerCompositeConfig {
  layerStack: Map<LayerType, LayerConfig>;
  renderOrder: LayerType[];
  finalComposite: boolean;
  doClear: boolean;
  preserveDrawingBuffer: boolean;
}

export interface CameraBlockParams {
  state: 'on' | 'off';
  transparency: number;
  mirrored: boolean;
  deviceId?: string;
}

export interface StageRenderStats {
  fps: number;
  frameTime: number;
  renderTime: number;
  layerRenderTimes: Map<LayerType, number>;
  memoryUsage: number;
  droppedFrames: number;
}

export interface WebcamPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error: string | null;
}

export interface OverlayDrawConfig {
  type: 'boundingBox' | 'keypoints' | 'skeleton' | 'segmentation' | 'custom';
  color: string;
  lineWidth: number;
  fillAlpha: number;
  strokeAlpha: number;
  labels: boolean;
}

export interface CoordinateConversion {
  stageX: number;
  stageY: number;
  webcamX: number;
  webcamY: number;
  displayX: number;
  displayY: number;
}
