/**
 * ML Training Engine — Real TensorFlow.js integration for Image, Text, Audio classifiers
 * Provides model training, prediction, and persistence
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const MODELS = {
  imageClassifier: null,
  textClassifier: null,
  audioClassifier: null,
  poseClassifier: null,
};

const TRAINING_DATA = {
  image: {}, // { className: [tensor1, tensor2, ...] }
  text: {},
  audio: {},
  pose: {},
};

const MODEL_CONFIG = {
  image: {
    maxEpochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 0,
  },
  text: {
    maxEpochs: 20,
    batchSize: 8,
    validationSplit: 0.2,
    verbose: 0,
  },
  audio: {
    maxEpochs: 30,
    batchSize: 16,
    validationSplit: 0.2,
    verbose: 0,
  },
  pose: {
    maxEpochs: 25,
    batchSize: 16,
    validationSplit: 0.2,
    verbose: 0,
  },
};

// ─── IMAGE CLASSIFIER ───

export async function initImageClassifier() {
  if (MODELS.imageClassifier) return MODELS.imageClassifier;

  // MobileNetV2 for feature extraction
  const mobilenet = await tf.loadLayersModel(
    'https://tfhub.dev/google/tfjs-models/mobilenet_v2/classification/1',
  );

  // Build classification head
  const model = tf.model({
    inputs: mobilenet.inputs,
    outputs: tf.layers
      .dense({ units: 1024, activation: 'relu' })
      .apply(tf.layers.dropout({ rate: 0.3 }).apply(mobilenet.outputs[0])),
  });

  MODELS.imageClassifier = model;
  return model;
}

export async function addImageTrainingExample(className, imageTensor) {
  await tf.nextFrame();

  if (!TRAINING_DATA.image[className]) {
    TRAINING_DATA.image[className] = [];
  }

  // Use transfer learning — extract features from MobileNet
  const mobilenet = await tf.loadLayersModel(
    'https://tfhub.dev/google/tfjs-models/mobilenet_v2/classification/1',
  );
  const features = mobilenet.predict(imageTensor);

  TRAINING_DATA.image[className].push(features);

  return {
    status: 'success',
    message: `Added example for class "${className}"`,
    totalExamples: Object.values(TRAINING_DATA.image).reduce((sum, arr) => sum + arr.length, 0),
  };
}

export async function trainImageClassifier() {
  const classNames = Object.keys(TRAINING_DATA.image);

  if (classNames.length === 0) {
    return { status: 'error', message: 'No training data' };
  }

  // Convert training data to tensors
  const xs = [];
  const ys = [];

  classNames.forEach((className, idx) => {
    TRAINING_DATA.image[className].forEach((tensor) => {
      xs.push(tensor.dataSync());
      ys.push(idx);
    });
  });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.oneHot(tf.tensor1d(ys, 'int32'), classNames.length);

  // Build model
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [1280], units: 512, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: 256, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: classNames.length, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  const history = await model.fit(xsTensor, ysTensor, {
    ...MODEL_CONFIG.image,
    shuffle: true,
  });

  MODELS.imageClassifier = { model, classNames, history };

  // Save model
  await model.save(`indexeddb://bytebuddies-image-classifier-v1`);

  xsTensor.dispose();
  ysTensor.dispose();

  return {
    status: 'success',
    message: 'Model trained successfully',
    classes: classNames,
    accuracy: history.history.accuracy[history.history.accuracy.length - 1],
  };
}

export async function predictImage(imageTensor) {
  if (!MODELS.imageClassifier) {
    return { status: 'error', message: 'Model not trained' };
  }

  const { model, classNames } = MODELS.imageClassifier;
  const prediction = model.predict(imageTensor);
  const predictionArray = await prediction.data();

  let maxIdx = 0;
  let maxConfidence = 0;

  for (let i = 0; i < predictionArray.length; i++) {
    if (predictionArray[i] > maxConfidence) {
      maxConfidence = predictionArray[i];
      maxIdx = i;
    }
  }

  prediction.dispose();

  return {
    class: classNames[maxIdx],
    confidence: maxConfidence.toFixed(3),
    allPredictions: classNames.map((cls, i) => ({
      class: cls,
      confidence: predictionArray[i].toFixed(3),
    })),
  };
}

// ─── TEXT CLASSIFIER ───

export function initTextClassifier() {
  TRAINING_DATA.text = {};
  return { status: 'ready' };
}

export function addTextTrainingExample(className, text) {
  if (!TRAINING_DATA.text[className]) {
    TRAINING_DATA.text[className] = [];
  }

  // Simple TF-IDF vectorization
  const vector = vectorizeText(text);
  TRAINING_DATA.text[className].push(vector);

  return {
    status: 'success',
    message: `Added text example for class "${className}"`,
    totalExamples: Object.values(TRAINING_DATA.text).reduce((sum, arr) => sum + arr.length, 0),
  };
}

function vectorizeText(text) {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Float32Array(100); // Fixed 100-dim vector

  words.forEach((word) => {
    const hash = hashCode(word) % 100;
    vector[hash] += 1;
  });

  // Normalize
  const norm = Math.sqrt(Array.from(vector).reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function trainTextClassifier() {
  const classNames = Object.keys(TRAINING_DATA.text);

  if (classNames.length === 0) {
    return { status: 'error', message: 'No training data' };
  }

  const xs = [];
  const ys = [];

  classNames.forEach((className, idx) => {
    TRAINING_DATA.text[className].forEach((vector) => {
      xs.push(vector);
      ys.push(idx);
    });
  });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.oneHot(tf.tensor1d(ys, 'int32'), classNames.length);

  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dense({ units: classNames.length, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  const history = await model.fit(xsTensor, ysTensor, {
    ...MODEL_CONFIG.text,
    shuffle: true,
  });

  MODELS.textClassifier = { model, classNames, history };

  await model.save(`indexeddb://bytebuddies-text-classifier-v1`);

  xsTensor.dispose();
  ysTensor.dispose();

  return {
    status: 'success',
    message: 'Text model trained successfully',
    classes: classNames,
    accuracy: history.history.accuracy[history.history.accuracy.length - 1],
  };
}

export async function predictText(text) {
  if (!MODELS.textClassifier) {
    return { status: 'error', message: 'Model not trained' };
  }

  const { model, classNames } = MODELS.textClassifier;
  const vector = vectorizeText(text);
  const xsTensor = tf.tensor2d([vector]);

  const prediction = model.predict(xsTensor);
  const predictionArray = await prediction.data();

  let maxIdx = 0;
  let maxConfidence = 0;

  for (let i = 0; i < predictionArray.length; i++) {
    if (predictionArray[i] > maxConfidence) {
      maxConfidence = predictionArray[i];
      maxIdx = i;
    }
  }

  xsTensor.dispose();
  prediction.dispose();

  return {
    class: classNames[maxIdx],
    confidence: maxConfidence.toFixed(3),
    allPredictions: classNames.map((cls, i) => ({
      class: cls,
      confidence: predictionArray[i].toFixed(3),
    })),
  };
}

// ─── AUDIO CLASSIFIER ───

export function initAudioClassifier() {
  TRAINING_DATA.audio = {};
  return { status: 'ready' };
}

export function addAudioTrainingExample(className, audioBuffer) {
  if (!TRAINING_DATA.audio[className]) {
    TRAINING_DATA.audio[className] = [];
  }

  // Extract MFCC features from audio
  const features = extractAudioFeatures(audioBuffer);
  TRAINING_DATA.audio[className].push(features);

  return {
    status: 'success',
    message: `Added audio example for class "${className}"`,
    totalExamples: Object.values(TRAINING_DATA.audio).reduce((sum, arr) => sum + arr.length, 0),
  };
}

function extractAudioFeatures(audioBuffer) {
  // Simple energy and frequency features
  const data = audioBuffer.getChannelData(0);
  const features = new Float32Array(20);

  // Energy levels in 20 frequency bands
  const fftSize = 2048;
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    1,
    fftSize,
    audioBuffer.sampleRate,
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = fftSize;
  source.connect(analyser);
  analyser.connect(offlineCtx.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  // Normalize frequencies into 20 bands
  const bandSize = Math.ceil(dataArray.length / 20);
  for (let i = 0; i < 20; i++) {
    let sum = 0;
    for (let j = 0; j < bandSize; j++) {
      const idx = i * bandSize + j;
      if (idx < dataArray.length) {
        sum += dataArray[idx];
      }
    }
    features[i] = sum / bandSize / 255;
  }

  return Array.from(features);
}

export async function trainAudioClassifier() {
  const classNames = Object.keys(TRAINING_DATA.audio);

  if (classNames.length === 0) {
    return { status: 'error', message: 'No training data' };
  }

  const xs = [];
  const ys = [];

  classNames.forEach((className, idx) => {
    TRAINING_DATA.audio[className].forEach((features) => {
      xs.push(features);
      ys.push(idx);
    });
  });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.oneHot(tf.tensor1d(ys, 'int32'), classNames.length);

  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [20], units: 64, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ units: classNames.length, activation: 'softmax' }),
    ],
  });

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  const history = await model.fit(xsTensor, ysTensor, {
    ...MODEL_CONFIG.audio,
    shuffle: true,
  });

  MODELS.audioClassifier = { model, classNames, history };

  await model.save(`indexeddb://bytebuddies-audio-classifier-v1`);

  xsTensor.dispose();
  ysTensor.dispose();

  return {
    status: 'success',
    message: 'Audio model trained successfully',
    classes: classNames,
    accuracy: history.history.accuracy[history.history.accuracy.length - 1],
  };
}

export async function predictAudio(audioBuffer) {
  if (!MODELS.audioClassifier) {
    return { status: 'error', message: 'Model not trained' };
  }

  const { model, classNames } = MODELS.audioClassifier;
  const features = extractAudioFeatures(audioBuffer);
  const xsTensor = tf.tensor2d([features]);

  const prediction = model.predict(xsTensor);
  const predictionArray = await prediction.data();

  let maxIdx = 0;
  let maxConfidence = 0;

  for (let i = 0; i < predictionArray.length; i++) {
    if (predictionArray[i] > maxConfidence) {
      maxConfidence = predictionArray[i];
      maxIdx = i;
    }
  }

  xsTensor.dispose();
  prediction.dispose();

  return {
    class: classNames[maxIdx],
    confidence: maxConfidence.toFixed(3),
    allPredictions: classNames.map((cls, i) => ({
      class: cls,
      confidence: predictionArray[i].toFixed(3),
    })),
  };
}

// ─── MODEL PERSISTENCE ───

export async function saveModel(modelType) {
  if (!MODELS[modelType]) {
    return { status: 'error', message: `No ${modelType} model to save` };
  }

  const { model, classNames } = MODELS[modelType];
  await model.save(`indexeddb://bytebuddies-${modelType}-v1`);

  // Save metadata
  localStorage.setItem(
    `bytebuddies-${modelType}-classes`,
    JSON.stringify(classNames),
  );

  return { status: 'success', message: `${modelType} model saved` };
}

export async function loadModel(modelType) {
  try {
    const model = await tf.loadLayersModel(
      `indexeddb://bytebuddies-${modelType}-v1`,
    );
    const classNames = JSON.parse(
      localStorage.getItem(`bytebuddies-${modelType}-classes`) || '[]',
    );

    MODELS[modelType] = { model, classNames };

    return {
      status: 'success',
      message: `${modelType} model loaded`,
      classes: classNames,
    };
  } catch (e) {
    return { status: 'error', message: `Failed to load ${modelType} model` };
  }
}

export function clearTrainingData(modelType) {
  if (TRAINING_DATA[modelType]) {
    TRAINING_DATA[modelType] = {};
  }
  return { status: 'success', message: `${modelType} training data cleared` };
}

export function getModelStatus(modelType) {
  return {
    trained: !!MODELS[modelType],
    trainingExamples: Object.values(TRAINING_DATA[modelType] || {}).reduce(
      (sum, arr) => sum + arr.length,
      0,
    ),
    classes: MODELS[modelType]?.classNames || [],
  };
}
