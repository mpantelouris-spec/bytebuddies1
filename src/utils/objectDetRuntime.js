/**
 * Lazy-loaded COCO-SSD for workspace Object Detection extension.
 */

let cocoModel = null;
let cocoPromise = null;
let cocoFailed = false;

export async function ensureCocoSsd() {
  if (cocoModel) return cocoModel;
  if (cocoFailed) return null;
  cocoPromise ||= (async () => {
    try {
      const tf = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      cocoModel = await cocoSsd.load({ base: 'mobilenet_v2' });
      return cocoModel;
    } catch (e) {
      console.warn('[ObjectDet] COCO-SSD failed to load', e);
      cocoFailed = true;
      cocoModel = null;
      return null;
    } finally {
      cocoPromise = null;
    }
  })();
  await cocoPromise;
  return cocoModel;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} minScore 0–1
 * @returns {Promise<Array<{ label: string, score: number, x: number, y: number, w: number, h: number }>>}
 */
export async function cocoDetectOnCanvas(canvas, minScore) {
  const model = await ensureCocoSsd();
  if (!model || !canvas?.width) return [];
  const thr = Math.max(0.05, Math.min(0.95, minScore));
  const preds = await model.detect(canvas, 24, thr).catch(() => []);
  if (!Array.isArray(preds)) return [];
  return preds.map((p) => ({
    label: String(p.class || 'object').toLowerCase(),
    score: typeof p.score === 'number' ? p.score : 0,
    x: p.bbox[0],
    y: p.bbox[1],
    w: p.bbox[2],
    h: p.bbox[3],
  }));
}
