// jest-environment-jsdom does not provide `fetch`, which firebase/auth
// requires at module-load time. Polyfill it before any test module imports run.
if (typeof globalThis.fetch === 'undefined') {
  const nodeFetch = require('node-fetch');
  globalThis.fetch = nodeFetch;
  globalThis.Headers = nodeFetch.Headers;
  globalThis.Request = nodeFetch.Request;
  globalThis.Response = nodeFetch.Response;
}

// jsdom has no Canvas ImageData implementation. Minimal polyfill matching the
// Web API constructor signatures used by visualEffectsOptimization.js.
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    constructor(dataOrWidth, widthOrHeight, height) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height;
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  };
}

// jsdom has no Web Audio API. Minimal OfflineAudioContext stub covering only
// the call surface mlTrainingEngine.js's extractAudioFeatures() uses.
if (typeof globalThis.OfflineAudioContext === 'undefined') {
  globalThis.OfflineAudioContext = class OfflineAudioContext {
    createBufferSource() {
      return { buffer: null, connect() {} };
    }
    createAnalyser() {
      return {
        fftSize: 2048,
        frequencyBinCount: 1024,
        connect() {},
        getByteFrequencyData(arr) {
          arr.fill(0);
        },
      };
    }
    get destination() {
      return {};
    }
  };
}
