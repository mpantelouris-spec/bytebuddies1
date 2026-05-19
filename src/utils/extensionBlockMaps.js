/**
 * Maps extension palette short types ↔ Blockly block types ↔ Game Builder runtime types.
 * Kept in a standalone module to avoid circular imports between blocks.jsx and blocklyToolboxEntries.js.
 */

/** Game short type (BLOCK_DEFS key) → Blockly block type id. */
export const EXTENSION_SHORT_TO_BLOCKLY = {
  // Face detection
  'face-video-on': 'face_turn_video_on',
  'face-video-off': 'face_turn_video_off',
  'face-show-box': 'face_show_bounding',
  'face-hide-box': 'face_hide_bounding',
  'face-threshold': 'face_set_threshold',
  'face-analyse-camera': 'face_analyse_camera',
  'face-analyse-stage': 'face_analyse_stage',
  'face-count': 'face_number_of',
  'face-visible': 'face_visible',
  'face-expression': 'face_expression',
  'face-x': 'face_x',
  'face-y': 'face_y',
  'face-size': 'face_size',
  'face-happy': 'face_happy',

  // Object detection
  'object-video-on': 'object_turn_video_on',
  'object-video-off': 'object_turn_video_off',
  'object-show-box': 'object_show_bounding',
  'object-hide-box': 'object_hide_bounding',
  'object-threshold': 'object_set_threshold',
  'object-analyse-camera': 'object_analyse_camera',
  'object-analyse-stage': 'object_analyse_stage',
  'object-count': 'object_number_of',
  'object-class': 'object_class_of',
  'object-person-detected': 'object_person_detected',
  'object-person-count': 'object_person_count',

  // Human body / pose (Blockly aliases use hyphens)
  'body-video-on': 'bb_body_video_on',
  'body-show-detections': 'body-show-detections',
  'body-analyse': 'body-analyse',
  'body-get-count': 'body-get-count',
  'body-x-position': 'body-x-position',
  'body-y-position': 'body-y-position',
  'body-is-detected': 'body-is-detected',

  // Speech & TTS
  'speech-listen': 'speech_listen',
  'speech-heard': 'speech_last_heard',
  'tts-speak': 'tts_speak',

  // Translate & OCR
  'translate-text': 'translate_text',
  'translate-result': 'translate_result',
  'ocr-scan': 'ocr_scan',
  'ocr-text': 'ocr_recognized_text',

  // Image classifier
  'ic-camera-on': 'ic_turn_camera_on',
  'ic-analyse': 'ic_analyse_frame',
  'ic-top-class': 'ic_top_class',
  'ic-confidence': 'ic_confidence',

  // Pose classifier
  'pc-camera-on': 'pc_turn_camera_on',
  'pc-camera-off': 'pc_turn_camera_off',
  'pc-capture': 'pc_capture_pose',
  'pc-pose-name': 'pc_pose_name',
  'pc-confidence': 'pc_pose_confidence',

  // Audio classifier
  'ac-classify': 'ac_classify',
  'ac-label': 'ac_sound_label',

  // Text classifier
  'tc-add': 'tc_add_training',
  'tc-classify': 'tc_classify',
  'tc-label': 'tc_prediction_label',
  'tc-confidence': 'tc_prediction_confidence',

  // Chat & NLP
  'chat-ask': 'chat_ask',
  'nlp-sentiment': 'nlp_analyse_sentiment',
  'nlp-sentiment-val': 'nlp_sentiment_value',
  'nlp-positive': 'nlp_is_positive',

  // Music
  'music-drum': 'bb_music_drum',
  'music-rest': 'bb_music_rest',
  'music-note': 'bb_music_note',
  'music-instrument': 'bb_music_instrument',
  'music-tempo': 'bb_music_tempo',
  'music-tempo-change': 'bb_music_tempo_change',
  'music-get-tempo': 'bb_music_get_tempo',

  // Physics
  'physics-velocity': 'bb_physics_velocity',
  'physics-gravity': 'bb_physics_gravity',
  'physics-jump': 'bb_physics_jump',
  'physics-allow-double-jump': 'bb_physics_allow_double_jump',
  'physics-friction': 'bb_physics_friction',
  'physics-push': 'bb_physics_push',
  'physics-bounce': 'bb_physics_bounce',

  // Game
  'game-score-add': 'bb_game_score_add',
  'game-score-set': 'bb_game_score_set',
  'game-set-lives': 'bb_game_set_lives',
};

/** Blockly block type id → Game Builder runtime type (BLOCK_DEFS key). */
export const EXTENSION_BLOCKLY_TO_GAME = {
  face_turn_video_on: 'face-video-on',
  face_turn_video_off: 'face-video-off',
  face_show_bounding: 'face-show-box',
  face_hide_bounding: 'face-hide-box',
  face_set_threshold: 'face-threshold',
  face_analyse_camera: 'face-analyse-camera',
  face_analyse_stage: 'face-analyse-stage',
  face_number_of: 'face-count',
  face_visible: 'face-visible',
  face_expression: 'face-expression',
  face_x: 'face-x',
  face_y: 'face-y',
  face_size: 'face-size',
  face_happy: 'face-happy',

  object_turn_video_on: 'object-video-on',
  object_turn_video_off: 'object-video-off',
  object_show_bounding: 'object-show-box',
  object_hide_bounding: 'object-hide-box',
  object_set_threshold: 'object-threshold',
  object_analyse_camera: 'object-analyse-camera',
  object_analyse_stage: 'object-analyse-stage',
  object_number_of: 'object-count',
  object_class_of: 'object-class',
  object_person_detected: 'object-person-detected',
  object_person_count: 'object-person-count',

  bb_body_video_on: 'body-video-on',
  'body-show-detections': 'body-show-detections',
  'body-analyse': 'body-analyse',
  'body-get-count': 'body-get-count',
  'body-x-position': 'body-x-position',
  'body-y-position': 'body-y-position',
  'body-is-detected': 'body-is-detected',

  speech_listen: 'speech-listen',
  speech_last_heard: 'speech-heard',
  tts_speak: 'tts-speak',
  bb_tts_speak: 'tts-speak',

  translate_text: 'translate-text',
  translate_result: 'translate-result',
  ocr_scan: 'ocr-scan',
  ocr_recognized_text: 'ocr-text',

  ic_turn_camera_on: 'ic-camera-on',
  ic_analyse_frame: 'ic-analyse',
  ic_top_class: 'ic-top-class',
  ic_confidence: 'ic-confidence',

  pc_turn_camera_on: 'pc-camera-on',
  pc_turn_camera_off: 'pc-camera-off',
  pc_capture_pose: 'pc-capture',
  pc_pose_name: 'pc-pose-name',
  pc_pose_confidence: 'pc-confidence',

  ac_classify: 'ac-classify',
  ac_sound_label: 'ac-label',

  tc_add_training: 'tc-add',
  tc_classify: 'tc-classify',
  tc_prediction_label: 'tc-label',
  tc_prediction_confidence: 'tc-confidence',

  chat_ask: 'chat-ask',
  nlp_analyse_sentiment: 'nlp-sentiment',
  nlp_sentiment_value: 'nlp-sentiment-val',
  nlp_is_positive: 'nlp-positive',

  bb_music_drum: 'music-drum',
  bb_music_rest: 'music-rest',
  bb_music_note: 'music-note',
  bb_music_instrument: 'music-instrument',
  bb_music_tempo: 'music-tempo',
  bb_music_tempo_change: 'music-tempo-change',
  bb_music_get_tempo: 'music-get-tempo',

  bb_physics_velocity: 'physics-velocity',
  bb_physics_gravity: 'physics-gravity',
  bb_physics_jump: 'physics-jump',
  bb_physics_allow_double_jump: 'physics-allow-double-jump',
  bb_physics_friction: 'physics-friction',
  bb_physics_push: 'physics-push',
  bb_physics_bounce: 'physics-bounce',

  bb_game_score_add: 'game-score-add',
  bb_game_score_set: 'game-score-set',
  bb_game_set_lives: 'game-set-lives',
};

export function extensionBlocklyForShort(short) {
  if (!short || typeof short !== 'string') return null;
  return EXTENSION_SHORT_TO_BLOCKLY[short] || null;
}

export function extensionGameTypeForBlockly(blocklyType) {
  if (!blocklyType || typeof blocklyType !== 'string') return null;
  return EXTENSION_BLOCKLY_TO_GAME[blocklyType] || null;
}
