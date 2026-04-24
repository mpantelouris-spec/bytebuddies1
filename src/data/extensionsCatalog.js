/**
 * Block extensions catalog — categories and blocks inspired by common
 * visual-coding “extension” offerings (AI/ML, hardware, IoT, robots, media).
 * Descriptions are original; official product docs are linked where helpful.
 */

export const EXTENSION_DOC_HUB = 'https://ai.thestempedia.com/pictoblox-block/';

export const EXTENSION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'robots', label: 'Robots' },
  { id: 'iot', label: 'IoT' },
  { id: 'games', label: 'Games & animation' },
];

/** @type {Array<{ id: string, title: string, description: string, filter: string, icon: string, accent: string, docsUrl?: string, blocks: string[], isNew?: boolean }>} */
export const EXTENSIONS = [
  // —— AI & ML ——
  {
    id: 'face-detection',
    title: 'Face Detection',
    description: 'Find faces in the camera view and react in your program.',
    filter: 'ai',
    icon: '😀',
    accent: '#fbbf24',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[Face] Turn video on (camera)',
      '[Face] Turn video on (mirrored)',
      '[Face] Turn video off',
      '[Face] Show bounding box',
      '[Face] Hide bounding box',
      '[Face] Set detection threshold',
      '[Face] Analyse from camera',
      '[Face] Analyse from stage',
      '[Face] Number of faces',
      '[Face] Face visible?',
      '[Face] Expression of face 1',
      '[Face] X of face 1',
      '[Face] Y of face 1',
      '[Face] Size of face 1',
      '[Face] Is face 1 happy?',
    ],
    isNew: true,
  },
  {
    id: 'object-detection',
    title: 'Object Detection',
    description: 'Turn on the camera, detect objects (COCO-SSD), and read labels in your program.',
    filter: 'ai',
    icon: '🐱',
    accent: '#9f1239',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[Object] Turn video on (on) with transparency 0',
      '[Object] Turn video off',
      '[Object] Show bounding box',
      '[Object] Hide bounding box',
      '[Object] Set detection threshold',
      '[Object] Analyse image from camera',
      '[Object] Analyse image from stage',
      '[Object] Number of objects',
      '[Object] Class of object 1',
      '[Object] Is person detected?',
      '[Object] Number of person detected',
    ],
  },
  {
    id: 'human-body',
    title: 'Human Body Detection',
    description: 'Pose and body landmarks for games and fitness-style projects.',
    filter: 'ai',
    icon: '🧍',
    accent: '#94a3b8',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[Body] Analyse from face',
      '[Body] Keypoint x',
      '[Body] Keypoint y',
      '[Body] Body visible?',
      '[Body] Nose x',
      '[Body] Nose y',
    ],
    isNew: true,
  },
  {
    id: 'ml-environment',
    title: 'Machine Learning Environment',
    description: 'Train classifiers on images, poses, text, audio, or numbers.',
    filter: 'ai',
    icon: '🧠',
    accent: '#5eead4',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[ML] Train classifier (sim)',
      '[ML] Training window open',
      '[Chat] Ask coding helper',
      '[TTS] Speak',
      'print',
    ],
  },
  {
    id: 'text-classifier',
    title: 'Text Classifier (ML)',
    description: 'Sort sentences into buckets you define with examples.',
    filter: 'ai',
    icon: '📝',
    accent: '#818cf8',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[TC] Add training example',
      '[TC] Classify sentence',
      '[TC] Prediction label',
      '[TC] Prediction confidence',
      'create text',
      'join text',
    ],
  },
  {
    id: 'image-classifier',
    title: 'Image Classifier (ML)',
    description: 'Train a model on your own image classes.',
    filter: 'ai',
    icon: '🖼️',
    accent: '#c084fc',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[IC] Turn classifier camera on',
      '[IC] Analyse frame',
      '[IC] Top class',
      '[IC] Confidence score',
      '[Object] Analyse image from camera',
      'create text',
    ],
  },
  {
    id: 'pose-classifier',
    title: 'Pose Classifier (ML)',
    description: 'Recognize body poses from the camera.',
    filter: 'ai',
    icon: '🤸',
    accent: '#fb923c',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[PC] Capture pose sample',
      '[PC] Pose name',
      '[PC] Pose confidence',
      '[Pose] Sample pose',
    ],
  },
  {
    id: 'audio-classifier',
    title: 'Audio Classifier (ML)',
    description: 'Train on short sounds: clap, snap, word, and more.',
    filter: 'ai',
    icon: '🎙️',
    accent: '#f472b6',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[AC] Classify sound', '[AC] Sound label', 'play sound', 'stop sounds'],
  },
  {
    id: 'number-regression',
    title: 'Numbers (ML)',
    description: 'Predict a number from examples (simple regression ideas).',
    filter: 'ai',
    icon: '🔢',
    accent: '#38bdf8',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[NR] Train numbers (sim)', '[NR] Predicted value', 'add / subtract', 'random number'],
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech',
    description: 'Speak text aloud with different voices and speeds.',
    filter: 'ai',
    icon: '🔊',
    accent: '#a78bfa',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[TTS] Speak', 'say', 'think', 'play sound'],
    isNew: true,
  },
  {
    id: 'speech-recognition',
    title: 'Speech Recognition',
    description: 'Listen for words and phrases and branch your code.',
    filter: 'ai',
    icon: '🎤',
    accent: '#34d399',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Speech] Listen once', '[Speech] Last heard', 'ask and wait', 'if / else', 'print'],
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: 'Tokenize, sentiment, and simple language understanding.',
    filter: 'ai',
    icon: '💬',
    accent: '#60a5fa',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: [
      '[NLP] Analyse sentiment',
      '[NLP] Sentiment (0–1)',
      '[NLP] Is positive?',
      'contains',
      'length of',
    ],
  },
  {
    id: 'translate',
    title: 'Translate',
    description: 'Translate between languages in your project.',
    filter: 'ai',
    icon: '🌐',
    accent: '#22d3ee',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[TR] Translate text', '[TR] Translation result', 'create text'],
  },
  {
    id: 'text-recognition',
    title: 'Text Recognition (OCR)',
    description: 'Read printed or handwritten text from an image.',
    filter: 'ai',
    icon: '📄',
    accent: '#fcd34d',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[OCR] Scan text (sim)', '[OCR] Recognized text', '[Object] Analyse image from camera', 'create text'],
  },
  {
    id: 'recognition-cards',
    title: 'Recognition Cards',
    description: 'Train on printed cards or markers for quick demos.',
    filter: 'ai',
    icon: '🃏',
    accent: '#f87171',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[RC] Scan card (sim)', '[RC] Card label'],
  },
  {
    id: 'chat-assistant',
    title: 'Chat & prompts',
    description: 'Large-model style prompts and chat-style answers.',
    filter: 'ai',
    icon: '✨',
    accent: '#fb7185',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Chat] Ask coding helper', 'ask and wait', 'print'],
  },
  // —— Hardware ——
  {
    id: 'arduino',
    title: 'Arduino (Uno / Nano / Mega)',
    description: 'Digital and analog pins, serial, and timing with classic boards.',
    filter: 'hardware',
    icon: '🔌',
    accent: '#0891b2',
    docsUrl: 'https://ai.thestempedia.com/extension/arduino-uno-nano-mega/',
    blocks: ['[Arduino] Set pin mode', '[Arduino] Digital write', '[Arduino] Analog read', '[Arduino] Delay ms'],
  },
  {
    id: 'microbit',
    title: 'micro:bit',
    description: 'LED matrix, buttons, accelerometer, radio — great first device.',
    filter: 'hardware',
    icon: '💠',
    accent: '#2563eb',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[micro:bit] Show string', '[micro:bit] Button A', '[micro:bit] Accelerometer', 'play sound'],
  },
  {
    id: 'evive',
    title: 'evive / STEM console',
    description: 'Motors, sliders, and plug-and-play robotics I/O.',
    filter: 'hardware',
    icon: '🎛️',
    accent: '#ea580c',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[evive] Motor speed', '[evive] Read pot', '[evive] Tactile switch'],
  },
  // —— Robots (STEM / Quarky-style families) ——
  {
    id: 'robot-line-follow',
    title: 'Robot: line follower',
    description: 'Follow a line with sensors and motor corrections.',
    filter: 'robots',
    icon: '🛤️',
    accent: '#10b981',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Robot] Read line sensors', '[Robot] Set motor L', '[Robot] Set motor R', 'if / else'],
  },
  {
    id: 'robot-arm',
    title: 'Robot: pick & place arm',
    description: 'Joint angles or timed grabs for a small arm.',
    filter: 'robots',
    icon: '🦾',
    accent: '#6366f1',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Arm] Servo angle', '[Arm] Gripper open', '[Arm] Gripper close', 'wait'],
  },
  {
    id: 'robot-mecanum',
    title: 'Robot: mecanum drive',
    description: 'Omni wheels — strafe and spin in place.',
    filter: 'robots',
    icon: '🛞',
    accent: '#8b5cf6',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Drive] Strafe', '[Drive] Forward', '[Drive] Rotate', 'set velocity'],
  },
  {
    id: 'robot-humanoid',
    title: 'Robot: humanoid walk',
    description: 'Gait steps and balance-style motion blocks.',
    filter: 'robots',
    icon: '🤖',
    accent: '#64748b',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Humanoid] Step forward', '[Humanoid] Wave', '[Humanoid] Bow', 'wait'],
  },
  {
    id: 'robot-rover',
    title: 'Robot: rover / Mars style',
    description: 'Rocker-bogie ideas and terrain-style moves.',
    filter: 'robots',
    icon: '🛰️',
    accent: '#f97316',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Rover] Drive', '[Rover] Turn in place', '[Rover] Rock obstacle', 'bounce off edges'],
  },
  // —— IoT ——
  {
    id: 'iot-core',
    title: 'Internet of Things',
    description: 'Cloud data, dashboards, and simple device messaging.',
    filter: 'iot',
    icon: '📡',
    accent: '#0ea5e9',
    docsUrl: 'https://ai.thestempedia.com/extension/internet-of-things-iot/',
    blocks: ['[IoT] Publish value', '[IoT] Read feed', '[IoT] Timestamp', 'print'],
  },
  {
    id: 'weather',
    title: 'Weather data',
    description: 'Pull temperature, conditions, or forecasts for a city.',
    filter: 'iot',
    icon: '🌤️',
    accent: '#38bdf8',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Weather] City', '[Weather] Temperature', '[Weather] Condition', 'create variable'],
  },
  {
    id: 'ifttt',
    title: 'IFTTT / webhooks',
    description: 'Trigger applets or HTTP hooks from your project.',
    filter: 'iot',
    icon: '🔗',
    accent: '#f59e0b',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Webhook] POST JSON', '[Webhook] GET text', 'print'],
  },
  {
    id: 'qr-scanner',
    title: 'QR & barcodes',
    description: 'Scan codes and branch on the payload.',
    filter: 'iot',
    icon: '📱',
    accent: '#14b8a6',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[QR] Scan camera', '[QR] Last payload', 'if / else'],
  },
  {
    id: 'data-logger',
    title: 'Data logger',
    description: 'Record samples over time and export or chart them.',
    filter: 'iot',
    icon: '📈',
    accent: '#22c55e',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Log] Add row', '[Log] Clear', '[Log] Row count', 'create list'],
  },
  // —— Games & animation ——
  {
    id: 'video-sensing',
    title: 'Video sensing',
    description: 'Motion amount and direction from the webcam.',
    filter: 'games',
    icon: '📹',
    accent: '#ec4899',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Video] Motion amount', '[Video] Stage mirror', 'if / else', 'key pressed?'],
    isNew: true,
  },
  {
    id: 'pen',
    title: 'Pen',
    description: 'Draw trails, stamps, and geometric patterns on the stage.',
    filter: 'games',
    icon: '✏️',
    accent: '#a3e635',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Pen] Down', '[Pen] Up', '[Pen] Clear', '[Pen] Set color', 'move steps'],
  },
  {
    id: 'music',
    title: 'Music & notes',
    description: 'Play notes, drums, and tempo for soundtracks.',
    filter: 'games',
    icon: '🎵',
    accent: '#d946ef',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['play note', 'play sound', 'set volume', 'wait'],
  },
  {
    id: 'video-player',
    title: 'Video player',
    description: 'Load and control short clips alongside your code.',
    filter: 'games',
    icon: '🎬',
    accent: '#7c3aed',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['[Video] Play clip', '[Video] Pause', '[Video] Seek sec', 'wait'],
  },
  {
    id: 'physics-engine',
    title: 'Physics engine',
    description: 'Gravity, velocity, collisions, and impulses.',
    filter: 'games',
    icon: '🌪️',
    accent: '#2dd4bf',
    docsUrl: EXTENSION_DOC_HUB,
    blocks: ['set velocity', 'set gravity', 'bounce off edges', 'jump', 'set friction'],
  },
];

const LS_KEY = 'bb_enabled_extensions_v1';

export function readEnabledExtensionIds() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeEnabledExtensionIds(ids) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...new Set(ids)]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bb-extensions-changed'));
    }
    return true;
  } catch {
    return false;
  }
}

/** Sidebar category rows for enabled extensions */
export function getExtensionSidebarCategories(enabledIds) {
  const set = new Set(enabledIds);
  const out = [];
  for (const ex of EXTENSIONS) {
    if (!set.has(ex.id)) continue;
    out.push({
      name: ex.title,
      icon: ex.icon,
      color: ex.accent,
      blocks: [...ex.blocks],
      extensionId: ex.id,
    });
  }
  return out;
}
