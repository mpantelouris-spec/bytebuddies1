/**
 * WEBCAM MANAGER
 * Handles all webcam initialization, frame capture, permissions, and lifecycle
 */

import { WebcamConfig, WebcamState, FrameData, WebcamPermissionState } from './Types';

export class WebcamManager {
  private config: WebcamConfig;
  private state: WebcamState;
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private frameCanvas: HTMLCanvasElement | null = null;
  private frameCtx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private frameCallbacks: Set<(frame: FrameData) => void> = new Set();
  private permissionState: WebcamPermissionState = { granted: false, denied: false, prompt: true, error: null };

  constructor(config: Partial<WebcamConfig> = {}) {
    this.config = {
      width: 1280,
      height: 720,
      fps: 30,
      facingMode: 'user',
      mirrored: false,
      transparency: 0,
      ...config,
    };

    this.state = {
      isInitialized: false,
      isRunning: false,
      isPaused: false,
      hasPermission: false,
      error: null,
      stream: null,
      device: null,
      frameCount: 0,
      fps: 0,
      lastFrameTime: 0,
    };
  }

  /**
   * Initialize webcam and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.state.isInitialized) return true;

      console.log('[WebcamManager] Initializing...');

      // Check permissions
      const permStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      this.permissionState.granted = permStatus.status === 'granted';
      this.permissionState.denied = permStatus.status === 'denied';
      this.permissionState.prompt = permStatus.status === 'prompt';

      if (this.permissionState.denied) {
        throw new Error('Camera permission denied by user');
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
          facingMode: this.config.facingMode,
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create hidden video element for frame capture
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.style.display = 'none';
      document.body.appendChild(this.videoElement);

      // Create canvas for frame capture
      this.frameCanvas = document.createElement('canvas');
      this.frameCanvas.width = this.config.width;
      this.frameCanvas.height = this.config.height;
      this.frameCtx = this.frameCanvas.getContext('2d');

      if (!this.frameCtx) {
        throw new Error('Failed to get canvas 2D context');
      }

      this.state.isInitialized = true;
      this.state.hasPermission = true;
      this.permissionState.granted = true;

      // Wait for video to start playing
      await this.waitForVideoReady();

      console.log('[WebcamManager] Initialized successfully');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.state.error = message;
      this.permissionState.error = message;
      console.error('[WebcamManager] Initialization failed:', message);
      return false;
    }
  }

  /**
   * Start webcam capture
   */
  async start(): Promise<boolean> {
    if (!this.state.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    if (this.state.isRunning) return true;

    if (this.videoElement) {
      this.videoElement.play().catch(e => console.warn('[WebcamManager] Play failed:', e));
    }

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.startFrameCapture();

    console.log('[WebcamManager] Started');
    return true;
  }

  /**
   * Stop webcam capture
   */
  stop(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    this.state.isPaused = false;
    this.stopFrameCapture();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
      this.videoElement = null;
    }

    this.frameCallbacks.clear();
    console.log('[WebcamManager] Stopped');
  }

  /**
   * Pause video without stopping stream
   */
  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    if (this.videoElement) {
      this.videoElement.pause();
    }
    this.stopFrameCapture();
  }

  /**
   * Resume paused video
   */
  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    this.state.isPaused = false;
    if (this.videoElement) {
      this.videoElement.play().catch(e => console.warn('[WebcamManager] Play failed:', e));
    }
    this.startFrameCapture();
  }

  /**
   * Capture current frame
   */
  captureFrame(): FrameData | null {
    if (!this.state.isRunning || !this.videoElement || !this.frameCtx || !this.frameCanvas) {
      return null;
    }

    try {
      // Draw video frame to canvas
      if (this.config.mirrored) {
        this.frameCtx.scale(-1, 1);
        this.frameCtx.drawImage(this.videoElement, -this.config.width, 0);
        this.frameCtx.scale(-1, 1);
      } else {
        this.frameCtx.drawImage(this.videoElement, 0, 0);
      }

      const imageData = this.frameCtx.getImageData(0, 0, this.config.width, this.config.height);

      return {
        timestamp: performance.now(),
        width: this.config.width,
        height: this.config.height,
        data: imageData,
        canvas: this.frameCanvas,
        mirrored: this.config.mirrored,
      };
    } catch (error) {
      console.error('[WebcamManager] Frame capture failed:', error);
      return null;
    }
  }

  /**
   * Register callback for frame events
   */
  onFrame(callback: (frame: FrameData) => void): () => void {
    this.frameCallbacks.add(callback);
    return () => this.frameCallbacks.delete(callback);
  }

  /**
   * Set transparency (0-100)
   */
  setTransparency(value: number): void {
    this.config.transparency = Math.max(0, Math.min(100, value));
  }

  /**
   * Set mirrored state
   */
  setMirrored(mirrored: boolean): void {
    this.config.mirrored = mirrored;
  }

  /**
   * Get current state
   */
  getState(): Readonly<WebcamState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get permission state
   */
  getPermissionState(): Readonly<WebcamPermissionState> {
    return Object.freeze({ ...this.permissionState });
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<WebcamConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * List available cameras
   */
  async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('[WebcamManager] Failed to enumerate devices:', error);
      return [];
    }
  }

  /**
   * Switch camera
   */
  async switchDevice(deviceId: string): Promise<boolean> {
    try {
      this.stop();
      this.config.width = 1280;
      this.config.height = 720;
      this.state.isInitialized = false;

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
      }

      this.state.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[WebcamManager] Device switch failed:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    if (this.frameCanvas) {
      this.frameCanvas = null;
      this.frameCtx = null;
    }
  }

  // Private methods

  private startFrameCapture(): void {
    if (this.animationFrameId !== null) return;

    const capture = () => {
      if (!this.state.isRunning || this.state.isPaused) {
        this.animationFrameId = null;
        return;
      }

      const frame = this.captureFrame();
      if (frame) {
        this.state.frameCount++;
        const now = performance.now();
        const deltaTime = now - this.state.lastFrameTime;
        if (deltaTime > 0) {
          this.state.fps = Math.round(1000 / deltaTime);
        }
        this.state.lastFrameTime = now;

        this.frameCallbacks.forEach(cb => {
          try {
            cb(frame);
          } catch (error) {
            console.error('[WebcamManager] Frame callback error:', error);
          }
        });
      }

      this.animationFrameId = requestAnimationFrame(capture);
    };

    this.animationFrameId = requestAnimationFrame(capture);
  }

  private stopFrameCapture(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private waitForVideoReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.videoElement) {
        reject(new Error('Video element not created'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Video metadata timeout'));
      }, 5000);

      const onLoadedMetadata = () => {
        clearTimeout(timeout);
        this.videoElement?.removeEventListener('loadedmetadata', onLoadedMetadata);
        resolve();
      };

      this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    });
  }
}

// Singleton instance
export const webcamManager = new WebcamManager();
