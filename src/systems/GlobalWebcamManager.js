/**
 * GlobalWebcamManager - Single shared webcam stream for all camera blocks
 * Handles: stream management, video element injection, motion detection
 */
class GlobalWebcamManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.previousFrameData = null;
    this.isOn = false;
    this.motionPercentage = 0;
    this.motionDirection = 'none'; // 'up', 'down', 'left', 'right', 'none'
    this.motionThresholdExceeded = false;
    this.motionThreshold = 5; // % of pixels changed to trigger threshold
    this.animationFrameId = null;
    this.stageElement = null;
    this.videoOverlay = null;
    this.transparency = 0; // 0-100
    this.referenceCount = 0; // Track how many blocks are using the camera
  }

  /**
   * Initialize the webcam and set up motion detection loop
   */
  async initialize(stageElement) {
    if (this.isOn) return; // Already initialized

    try {
      this.stageElement = stageElement;

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false,
      });

      // Create and configure video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;  // Mute audio
      this.videoElement.setAttribute('autoplay', 'autoplay');
      this.videoElement.setAttribute('playsinline', 'playsinline');
      this.videoElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 10;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #000;
        border: none;
        padding: 0;
        margin: 0;
      `;

      console.log('[GlobalWebcamManager] Video element created, srcObject set');

      // Create overlay container for video with transparency control
      this.videoOverlay = document.createElement('div');
      this.videoOverlay.id = 'webcam-video-overlay';
      this.videoOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        overflow: hidden;
        pointer-events: none;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        background: #000;
        border: none;
        padding: 0;
        margin: 0;
      `;
      this.videoOverlay.appendChild(this.videoElement);

      // Inject into stage
      if (this.stageElement) {
        console.log('[GlobalWebcamManager] Stage element found, position:', this.stageElement.style.position);
        console.log('[GlobalWebcamManager] Stage element dimensions:', this.stageElement.offsetWidth, 'x', this.stageElement.offsetHeight);
        this.stageElement.style.position = 'relative';
        this.stageElement.style.overflow = 'hidden';
        this.stageElement.insertBefore(this.videoOverlay, this.stageElement.firstChild);
        console.log('[GlobalWebcamManager] Video overlay injected into stage');
        console.log('[GlobalWebcamManager] Video element opacity:', this.videoElement.style.opacity);
        console.log('[GlobalWebcamManager] Video overlay opacity:', this.videoOverlay.style.opacity);
        console.log('[GlobalWebcamManager] Video overlay z-index:', this.videoOverlay.style.zIndex);
        console.log('[GlobalWebcamManager] Stage children count:', this.stageElement.children.length);
      } else {
        console.error('[GlobalWebcamManager] Stage element is null!');
        throw new Error('Stage element not found');
      }

      // Create hidden canvas for motion detection
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 320; // Reduced resolution for performance
      this.canvasElement.height = 240;
      this.canvasElement.style.display = 'none';
      document.body.appendChild(this.canvasElement);
      this.canvasContext = this.canvasElement.getContext('2d');

      this.isOn = true;

      // Wait for video to load and start playing
      await new Promise(resolve => {
        let resolved = false;
        
        const onLoadedMetadata = () => {
          console.log('[GlobalWebcamManager] Video loaded metadata, dimensions:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve();
          }
        };
        
        const onPlaying = () => {
          console.log('[GlobalWebcamManager] Video is now playing');
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve();
          }
        };
        
        const onCanPlay = () => {
          console.log('[GlobalWebcamManager] Video can play');
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve();
          }
        };
        
        const cleanup = () => {
          this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          this.videoElement.removeEventListener('playing', onPlaying);
          this.videoElement.removeEventListener('canplay', onCanPlay);
          clearTimeout(timeout);
        };
        
        this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        this.videoElement.addEventListener('playing', onPlaying);
        this.videoElement.addEventListener('canplay', onCanPlay);
        
        const timeout = setTimeout(() => {
          console.warn('[GlobalWebcamManager] Video loading timeout, proceeding anyway');
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve();
          }
        }, 3000);
      });

      // Start motion detection loop
      this.startMotionDetection();

      console.log('[GlobalWebcamManager] Camera initialized successfully');
      return true;
    } catch (error) {
      console.error('[GlobalWebcamManager] Failed to initialize camera:', error.message);
      this.isOn = false;
      return false;
    }
  }

  /**
   * Start continuous motion detection
   */
  startMotionDetection() {
    if (this.animationFrameId) return;

    const detectMotion = () => {
      if (!this.isOn || !this.videoElement || !this.canvasContext) {
        this.animationFrameId = requestAnimationFrame(detectMotion);
        return;
      }

      try {
        // Draw current frame to canvas
        this.canvasContext.drawImage(
          this.videoElement,
          0, 0,
          this.canvasElement.width,
          this.canvasElement.height
        );

        const imageData = this.canvasContext.getImageData(
          0, 0,
          this.canvasElement.width,
          this.canvasElement.height
        );
        const data = imageData.data;

        if (this.previousFrameData) {
          // Calculate motion percentage by comparing pixels
          let pixelsChanged = 0;
          const threshold = 30; // Pixel value change threshold
          
          for (let i = 0; i < data.length; i += 4) {
            const r = Math.abs(data[i] - this.previousFrameData[i]);
            const g = Math.abs(data[i + 1] - this.previousFrameData[i + 1]);
            const b = Math.abs(data[i + 2] - this.previousFrameData[i + 2]);
            
            if (r > threshold || g > threshold || b > threshold) {
              pixelsChanged++;
            }
          }

          const totalPixels = this.canvasElement.width * this.canvasElement.height;
          this.motionPercentage = Math.round((pixelsChanged / totalPixels) * 100);
          
          // Check if motion exceeds threshold
          this.motionThresholdExceeded = this.motionPercentage > this.motionThreshold;

          // Detect motion direction (simplified: check quadrants)
          this.detectMotionDirection(data, this.previousFrameData);
        }

        // Store current frame for next comparison
        this.previousFrameData = new Uint8ClampedArray(data);
      } catch (e) {
        console.error('[GlobalWebcamManager] Motion detection error:', e);
      }

      this.animationFrameId = requestAnimationFrame(detectMotion);
    };

    detectMotion();
  }

  /**
   * Detect motion direction by comparing image quadrants
   */
  detectMotionDirection(currentData, previousData) {
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    const midX = width / 2;
    const midY = height / 2;
    const threshold = 30;

    // Calculate motion in each quadrant
    let topMotion = 0, bottomMotion = 0, leftMotion = 0, rightMotion = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dr = Math.abs(currentData[idx] - previousData[idx]);
        const dg = Math.abs(currentData[idx + 1] - previousData[idx + 1]);
        const db = Math.abs(currentData[idx + 2] - previousData[idx + 2]);

        if (dr > threshold || dg > threshold || db > threshold) {
          if (y < midY) topMotion++;
          if (y > midY) bottomMotion++;
          if (x < midX) leftMotion++;
          if (x > midX) rightMotion++;
        }
      }
    }

    // Determine primary direction
    const motions = { top: topMotion, bottom: bottomMotion, left: leftMotion, right: rightMotion };
    const maxDir = Object.keys(motions).reduce((a, b) => motions[a] > motions[b] ? a : b);
    const maxVal = motions[maxDir];

    if (maxVal > 100) { // Threshold for direction detection
      this.motionDirection = maxDir;
    } else {
      this.motionDirection = 'none';
    }
  }

  /**
   * Set camera transparency (0-100)
   */
  setTransparency(value) {
    this.transparency = Math.max(0, Math.min(100, value));
    if (this.videoOverlay) {
      const opacity = (100 - this.transparency) / 100;
      this.videoOverlay.style.setProperty('opacity', String(opacity), 'important');
      this.videoOverlay.style.setProperty('visibility', 'visible', 'important');
      this.videoOverlay.style.setProperty('display', 'block', 'important');
    }
  }

  /**
   * Get current motion percentage
   */
  getMotion() {
    return this.motionPercentage;
  }

  /**
   * Get motion direction
   */
  getMotionDirection() {
    return this.motionDirection;
  }

  /**
   * Check if motion exceeds threshold
   */
  isMotionAboveThreshold() {
    return this.motionThresholdExceeded;
  }

  /**
   * Set motion detection threshold
   */
  setMotionThreshold(percentage) {
    this.motionThreshold = Math.max(0, Math.min(100, percentage));
  }

  /**
   * Increment reference count (when a block starts using camera)
   */
  addReference() {
    this.referenceCount++;
  }

  /**
   * Decrement reference count (when a block stops using camera)
   */
  removeReference() {
    this.referenceCount = Math.max(0, this.referenceCount - 1);
    if (this.referenceCount === 0) {
      // Optional: auto-shutdown when no blocks reference it
      // this.shutdown();
    }
  }

  /**
   * Turn off the camera and clean up
   */
  async shutdown() {
    if (!this.isOn) return;

    try {
      // Stop motion detection loop
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Stop stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Remove video overlay from DOM
      if (this.videoOverlay && this.videoOverlay.parentNode) {
        this.videoOverlay.parentNode.removeChild(this.videoOverlay);
        this.videoOverlay = null;
      }

      // Remove canvas
      if (this.canvasElement && this.canvasElement.parentNode) {
        this.canvasElement.parentNode.removeChild(this.canvasElement);
        this.canvasElement = null;
        this.canvasContext = null;
      }

      this.videoElement = null;
      this.previousFrameData = null;
      this.isOn = false;
      this.referenceCount = 0;

      console.log('[GlobalWebcamManager] Camera shut down');
      return true;
    } catch (error) {
      console.error('[GlobalWebcamManager] Error during shutdown:', error);
      return false;
    }
  }

  /**
   * Check if camera is currently on
   */
  isRunning() {
    return this.isOn;
  }

  /**
   * Get the video element (for advanced usage)
   */
  getVideoElement() {
    return this.videoElement;
  }
}

// Export singleton instance
export const webcamManager = new GlobalWebcamManager();
