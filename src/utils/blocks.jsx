
import React from 'react';
import {
  COSTUME_SELECT_OPTIONS,
  BACKDROP_SELECT_OPTIONS,
} from '../data/stageLookOptions';
import { EXTENSION_BLOCKLY_TO_GAME, extensionBlocklyForShort, extensionGameTypeForBlockly } from './extensionBlockMaps';

/* ─── Block type definitions ─── */
export const BLOCK_DEFS = {
  'event-start':      { label: 'When ▶ clicked', icon: '🚩', color: '#f59e0b', category: 'event', params: {} },
  'event-clone':      { label: 'When I start as a clone', icon: '🧬', color: '#f59e0b', category: 'event', params: {} },
  'event-keypress':   { label: 'On key press', icon: '🎯', color: '#f59e0b', category: 'event', params: { key: 'space' } },
  'event-click':      { label: 'On click', icon: '🖱️', color: '#f59e0b', category: 'event', params: {} },
  'event-collision':  { label: 'On collision', icon: '💥', color: '#f59e0b', category: 'event', params: { with: 'any' } },
  'event-message':    { label: 'On message', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'event-broadcast':  { label: 'Broadcast', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'var-create':       { label: 'Create variable', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-set':          { label: 'Set', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-change':       { label: 'Change', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', amount: '1' } },
  'var-show':         { label: 'Show variable', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar' } },
  'logic-if':         { label: 'If', icon: '🧠', color: '#f59e0b', category: 'logic', params: { condition: 'x > 5' } },
  'logic-and':        { label: 'And / Or', icon: '🧠', color: '#f59e0b', category: 'logic', params: { left: 'a', op: 'and', right: 'b' } },
  'logic-compare':    { label: 'Compare', icon: '🧠', color: '#f59e0b', category: 'logic', params: { left: 'a', op: '=', right: 'b' } },
  'logic-bool':       { label: 'Boolean', icon: '🧠', color: '#f59e0b', category: 'logic', params: { value: 'true' } },
  'loop-repeat':      { label: 'Repeat', icon: '🔁', color: '#f59e0b', category: 'loop', params: { times: '10' } },
  'loop-forever':     { label: 'Forever', icon: '🔁', color: '#f59e0b', category: 'loop', params: {} },
  'loop-while':       { label: 'While', icon: '🔁', color: '#f59e0b', category: 'loop', params: { condition: 'true' } },
  'loop-foreach':     { label: 'For each', icon: '🔁', color: '#f59e0b', category: 'loop', params: { item: 'item', list: 'myList' } },
  'loop-break':       { label: 'Break', icon: '🔁', color: '#f59e0b', category: 'loop', params: {} },
  'func-define':      { label: 'Define function', icon: '⚡', color: '#f59e0b', category: 'function', params: { name: 'myFunc' } },
  'func-call':        { label: 'Call', icon: '⚡', color: '#f59e0b', category: 'function', params: { name: 'myFunc' } },
  'func-return':      { label: 'Return', icon: '⚡', color: '#f59e0b', category: 'function', params: { value: '0' } },
  'func-params':      { label: 'With parameters', icon: '⚡', color: '#f59e0b', category: 'function', params: { params: 'a, b' } },
  'action-print':     { label: 'Print', icon: '💬', color: '#f59e0b', category: 'action', params: { message: '"Hello!"' } },
  'action-ask':       { label: 'Ask and wait', icon: '💬', color: '#f59e0b', category: 'action', params: { prompt: '"What is your name?"' } },
  'action-alert':     { label: 'Alert', icon: '💬', color: '#f59e0b', category: 'action', params: { message: '"Notice"' } },
  'math-add':         { label: 'Add / Subtract', icon: '🔢', color: '#59c059', category: 'math', params: { a: '1', op: '+', b: '1' } },
  'math-subtract':    { label: 'Subtract', icon: '🔢', color: '#59c059', category: 'math', params: { a: '1', b: '1' } },
  'math-mult':        { label: 'Multiply / Divide', icon: '🔢', color: '#59c059', category: 'math', params: { a: '2', op: '×', b: '3' } },
  'math-divide':      { label: 'Divide', icon: '🔢', color: '#59c059', category: 'math', params: { a: '2', b: '2' } },
  'math-modulo':      { label: 'Mod', icon: '🔢', color: '#59c059', category: 'math', params: { a: '0', b: '1' } },
  'math-random':      { label: 'Random number', icon: '🔢', color: '#59c059', category: 'math', params: { min: '1', max: '100' } },
  'math-round':       { label: 'Round / Abs', icon: '🔢', color: '#59c059', category: 'math', params: { op: 'round', value: '3.7' } },
  'text-create':      { label: 'Create text', icon: '📝', color: '#f59e0b', category: 'text', params: { text: '"hello"' } },
  'text-join':        { label: 'Join text', icon: '📝', color: '#59c059', category: 'text', params: { a: '"hello"', b: '" world"' } },
  'text-length':      { label: 'Length of', icon: '📝', color: '#59c059', category: 'text', params: { text: '"hello"' } },
  'text-letter':      { label: 'Letter of', icon: '📝', color: '#59c059', category: 'text', params: { letter: '1', text: '"text"' } },
  'text-contains':    { label: 'Contains', icon: '📝', color: '#59c059', category: 'text', params: { text: '""', search: '""' } },
  'logic-or':         { label: 'Or', icon: '➕', color: '#59c059', category: 'logic', params: { left: 'true', right: 'true' } },
  'logic-not':        { label: 'Not', icon: '➕', color: '#59c059', category: 'logic', params: { value: 'false' } },
  'list-create':      { label: 'Create list', icon: '📋', color: '#3498db', category: 'list', params: { name: 'myList' } },
  'list-add':         { label: 'Add to list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', item: 'thing' } },
  'list-delete':      { label: 'Delete of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', index: '1' } },
  'list-delete-all':  { label: 'Delete all of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList' } },
  'list-insert':      { label: 'Insert at of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', index: '1', item: 'thing' } },
  'list-replace':     { label: 'Replace item of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', index: '1', item: 'thing' } },
  'list-item':        { label: 'Item of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', index: '1' } },
  'list-index':       { label: 'Item # in list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', item: 'thing' } },
  'list-length':      { label: 'Length of list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList' } },
  'list-contains':    { label: 'List contains', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', item: 'thing' } },
  'list-show':        { label: 'Show list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList' } },
  'list-hide':        { label: 'Hide list', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList' } },
  'list-get':         { label: 'Get item #', icon: '📋', color: '#3498db', category: 'list', params: { list: 'myList', index: '1' } },
  // MOTION BLOCKS
  'sprite-move':      { label: 'Move () steps', icon: '🎭', color: '#4a9eff', category: 'motion', params: { steps: '10' } },
  'sprite-turn-right':{ label: 'Turn clockwise () degrees', icon: '🎭', color: '#4a9eff', category: 'motion', params: { degrees: '15' } },
  'sprite-turn-left': { label: 'Turn anticlockwise () degrees', icon: '🎭', color: '#4a9eff', category: 'motion', params: { degrees: '15' } },
  'sprite-point-towards': { label: 'Point towards [mouse-pointer v]', icon: '🧭', color: '#4a9eff', category: 'motion', params: { target: 'mouse-pointer' } },
  'sprite-point-dir': { label: 'Point in direction ()', icon: '🧭', color: '#4a9eff', category: 'motion', params: { degrees: '90' } },
  'sprite-goto':      { label: 'Go to x: () y: ()', icon: '🎯', color: '#4a9eff', category: 'motion', params: { x: '0', y: '0' } },
  'sprite-goto-sprite': { label: 'Go to [sprite v]', icon: '🎯', color: '#4a9eff', category: 'motion', params: { sprite: 'any' } },
  'sprite-goto-random-position': { label: 'Go to random position', icon: '🎯', color: '#4a9eff', category: 'motion', params: {} },
  'sprite-goto-mouse-pointer': { label: 'Go to mouse-pointer', icon: '🎯', color: '#4a9eff', category: 'motion', params: {} },
  'sprite-glide':     { label: 'Glide () secs to x: () y: ()', icon: '🌊', color: '#4a9eff', category: 'motion', params: { secs: '1', x: '0', y: '0' } },
  'motion-goto-random-position': { label: 'Go to random position', icon: '🎯', color: '#4a9eff', category: 'motion', params: {} },
  'motion-goto-mouse-pointer': { label: 'Go to mouse-pointer', icon: '🎯', color: '#4a9eff', category: 'motion', params: {} },
  'motion-goto-sprite': { label: 'Go to sprite', icon: '🎯', color: '#4a9eff', category: 'motion', params: { sprite: 'any' } },
  'motion-goto-xy': { label: 'Go to x,y', icon: '🎯', color: '#4a9eff', category: 'motion', params: { x: '0', y: '0' } },
  'motion-glide-to-random-position': { label: 'Glide secs to random position', icon: '🌊', color: '#4a9eff', category: 'motion', params: { secs: '1' } },
  'motion-glide-to-mouse-pointer': { label: 'Glide secs to mouse-pointer', icon: '🌊', color: '#4a9eff', category: 'motion', params: { secs: '1' } },
  'motion-glide-to-sprite': { label: 'Glide secs to sprite', icon: '🌊', color: '#4a9eff', category: 'motion', params: { secs: '1', sprite: 'any' } },
  'motion-glide-to-xy': { label: 'Glide secs to x,y', icon: '🌊', color: '#4a9eff', category: 'motion', params: { secs: '1', x: '0', y: '0' } },
  'motion-changex': { label: 'Change x by', icon: '📍', color: '#4a9eff', category: 'motion', params: { amount: '10' } },
  'motion-changey': { label: 'Change y by', icon: '📍', color: '#4a9eff', category: 'motion', params: { amount: '10' } },
  'motion-if-on-edge-bounce': { label: 'If on edge, bounce', icon: '↩️', color: '#4a9eff', category: 'motion', params: {} },
  'motion-set-rotation-style': { label: 'Set rotation style', icon: '🔄', color: '#4a9eff', category: 'motion', params: { style: 'all around' } },
  'sprite-changex':   { label: 'Change x by ()', icon: '📍', color: '#4a9eff', category: 'motion', params: { amount: '10' } },
  'sprite-setx':      { label: 'Set x to ()', icon: '📍', color: '#4a9eff', category: 'motion', params: { x: '0' } },
  'sprite-changey':   { label: 'Change y by ()', icon: '📍', color: '#4a9eff', category: 'motion', params: { amount: '10' } },
  'sprite-sety':      { label: 'Set y to ()', icon: '📍', color: '#4a9eff', category: 'motion', params: { y: '0' } },
  'sprite-turn':      { label: 'Turn () degrees', icon: '🎭', color: '#4a9eff', category: 'motion', params: { degrees: '90' } },
  'sprite-if-bounce': { label: 'If on edge, bounce', icon: '↩️', color: '#4a9eff', category: 'motion', params: {} },
  'sprite-rotation-style': { label: 'Set rotation style [all around v]', icon: '🔄', color: '#4a9eff', category: 'motion', params: { style: 'all around' } },
  'sprite-show':      { label: 'Show', icon: '👁️', color: '#9b59b6', category: 'looks', params: {} },
  'sprite-hide':      { label: 'Hide', icon: '🙈', color: '#9b59b6', category: 'looks', params: {} },
  'sprite-say':       { label: 'Say () for () seconds', icon: '💬', color: '#9b59b6', category: 'looks', params: { text: '"Hi!"', secs: '2' } },
  'sprite-think':     { label: 'Think () for () seconds', icon: '💭', color: '#9b59b6', category: 'looks', params: { text: '"Hmm..."', secs: '2' } },
  'looks-change-size': { label: 'Change size by ()', icon: '🔼', color: '#9b59b6', category: 'looks', params: { amount: '10' } },
  'looks-change-effect': { label: 'Change [color v] effect by ()', icon: '🎨', color: '#9b59b6', category: 'looks', params: { effect: 'color', value: '25' } },
  'looks-set-effect': { label: 'Set [color v] effect to ()', icon: '🎨', color: '#9b59b6', category: 'looks', params: { effect: 'color', value: '0' } },
  'looks-clear-effects': { label: 'Clear graphic effects', icon: '✨', color: '#9b59b6', category: 'looks', params: {} },
  'sound-change-effect': { label: 'Change [pitch v] effect by ()', icon: '🎼', color: '#f59e0b', category: 'sound', params: { effect: 'pitch', value: '10' } },
  'sound-set-effect': { label: 'Set [pitch v] effect to ()', icon: '🎼', color: '#f59e0b', category: 'sound', params: { effect: 'pitch', value: '0' } },
  'sound-clear-effects': { label: 'Clear sound effects', icon: '🔇', color: '#f59e0b', category: 'sound', params: {} },
  'sound-play-until-done': { label: 'Play sound until done', icon: '🔊', color: '#f59e0b', category: 'sound', params: { sound: 'pop' } },
  'sound-set-volume': { label: 'Set volume to', icon: '🔊', color: '#f59e0b', category: 'sound', params: { volume: '100' } },
  'sound-get-volume': { label: 'Volume', icon: '🔊', color: '#f59e0b', category: 'sound', params: {} },
  'event-backdropswitch': { label: 'When backdrop switches to [backdrop1 v]', icon: '🎬', color: '#f59e0b', category: 'event', params: { backdrop: 'backdrop1' } },
  'event-loudness':   { label: 'When [loudness v] > ()', icon: '🔊', color: '#f59e0b', category: 'event', params: { threshold: '10' } },
  'event-broadcast-wait': { label: 'Broadcast [message1 v] and wait', icon: '📢', color: '#f59e0b', category: 'event', params: { message: 'message1' } },
  'sense-loudness':   { label: 'Loudness', icon: '🔊', color: '#00bcd4', category: 'sensing', params: {} },
  // ═══ MOTION REPORTERS ═══
  'sprite-x-reporter': { label: 'X Position', icon: '📍', color: '#4a9eff', category: 'motion', params: {} },
  'sprite-y-reporter': { label: 'Y Position', icon: '📍', color: '#4a9eff', category: 'motion', params: {} },
  'sprite-direction-reporter': { label: 'Direction', icon: '🧭', color: '#4a9eff', category: 'motion', params: {} },
  // ═══ LOOKS BLOCKS & REPORTERS ═══
  'looks-backdrop':      { label: 'Switch backdrop', icon: '🎬', color: '#9b59b6', category: 'looks', params: { backdrop: '1' } },
  'looks-next-backdrop': { label: 'Next backdrop', icon: '🎬', color: '#9b59b6', category: 'looks', params: {} },
  'looks-forward-layers': { label: 'Go forward layers', icon: '📚', color: '#9b59b6', category: 'looks', params: { layers: '1' } },
  'looks-goto-layer': { label: 'Go to front/back layer', icon: '📚', color: '#9b59b6', category: 'looks', params: { layer: 'front' } },
  'looks-layer-step': { label: 'Go forward/backward layers', icon: '📚', color: '#9b59b6', category: 'looks', params: { direction: 'forward', layers: '1' } },
  'looks-costume-reporter': { label: 'Costume Number', icon: '👗', color: '#9b59b6', category: 'looks', params: {} },
  'looks-backdrop-reporter': { label: 'Backdrop Number', icon: '🎬', color: '#9b59b6', category: 'looks', params: {} },
  'sprite-size-reporter': { label: 'Size', icon: '📏', color: '#9b59b6', category: 'looks', params: {} },
  'control-wait':     { label: 'Wait', icon: '⏱', color: '#f59e0b', category: 'control', params: { secs: '1' } },
  'control-wait-until': { label: 'Wait until', icon: '⏱', color: '#f59e0b', category: 'control', params: {} },
  'control-repeat-until': { label: 'Repeat until', icon: '🔁', color: '#f59e0b', category: 'control', params: {} },
  'control-stop':     { label: 'Stop', icon: '⏹', color: '#f59e0b', category: 'control', params: { stopOption: 'all' } },
  'control-create-clone': { label: 'Create clone of', icon: '🧬', color: '#f59e0b', category: 'control', params: { sprite: 'myself' } },
  'control-delete-clone': { label: 'Delete this clone', icon: '💥', color: '#f59e0b', category: 'control', params: {} },
  'sound-play':       { label: 'Start sound', icon: '🔊', color: '#f59e0b', category: 'sound', params: { sound: 'pop' } },
  'sound-stop':       { label: 'Stop sounds', icon: '🔇', color: '#f59e0b', category: 'sound', params: {} },
  /** @deprecated use sound-set-volume */
  'sound-volume':     { label: 'Set volume', icon: '🔊', color: '#f59e0b', category: 'sound', params: { volume: '100' } },
  'music-drum':       { label: '[Music] Play drum', icon: '🥁', color: '#d946ef', category: 'music', params: { drum: '0', beats: '0.5' } },
  'music-rest':       { label: '[Music] Rest for beats', icon: '⏸', color: '#d946ef', category: 'music', params: { beats: '0.5' } },
  'music-note':       { label: '[Music] Play note for beats', icon: '🎵', color: '#d946ef', category: 'music', params: { note: '60', beats: '0.5' } },
  'music-instrument': { label: '[Music] Set instrument to', icon: '🎸', color: '#d946ef', category: 'music', params: { instrument: '0' } },
  'music-tempo':      { label: '[Music] Set tempo to', icon: '🎶', color: '#d946ef', category: 'music', params: { tempo: '60' } },
  'music-tempo-change': { label: '[Music] Change tempo by', icon: '📈', color: '#d946ef', category: 'music', params: { change: '10' } },
  'music-get-tempo':  { label: '[Music] Tempo', icon: '🎵', color: '#d946ef', category: 'music', params: {} },
  'ai-classify':      { label: 'AI classify', icon: '🤖', color: '#f59e0b', category: 'ai', params: { input: '"text"' } },
  'ai-generate':      { label: 'AI generate text', icon: '🤖', color: '#f59e0b', category: 'ai', params: { prompt: '"Write a poem"' } },
  // VIDEO/CAMERA ACTIVATION BLOCKS
  'pose-video-on':    { label: 'Turn on video on stage with transparency ()', icon: '📹', color: '#9c27b0', category: 'pose', params: { transparency: '0' } },
  'pose-video-off':   { label: 'Turn off video', icon: '📹', color: '#9c27b0', category: 'pose', params: {} },
  'pose-show-detections': { label: 'Show detections', icon: '🎯', color: '#9c27b0', category: 'pose', params: {} },
  'pose-analyze':     { label: 'Analyse image for human pose from [camera v]', icon: '🧘', color: '#9c27b0', category: 'pose', params: { source: 'camera' } },
  'pose-count-people': { label: 'Get # of people', icon: '👥', color: '#9c27b0', category: 'pose', params: {} },
  'pose-position-x':  { label: 'X position of [0 v]', icon: '👆', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-position-y':  { label: 'Y position of [0 v]', icon: '👆', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-angle':       { label: 'Angle of [0 v]', icon: '🔄', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-confidence':  { label: 'Confidence of [0 v]', icon: '📊', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-distance':    { label: 'Distance between [0 v] and [1 v]', icon: '📐', color: '#9c27b0', category: 'pose', params: { landmark1: '0', landmark2: '1' } },
  'pose-movement':    { label: 'Movement speed of [0 v]', icon: '💨', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-gesture':     { label: 'Is gesture [thumbs up v]', icon: '✋', color: '#9c27b0', category: 'pose', params: { gesture: 'thumbs up' } },
  'pose-rep-count':   { label: 'Rep counter for [0 v]', icon: '🔢', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-posture':     { label: 'Posture quality score', icon: '📈', color: '#9c27b0', category: 'pose', params: {} },
  'face-video-on':    { label: 'Turn on video on stage with transparency ()', icon: '📹', color: '#e91e63', category: 'face', params: { transparency: '0' } },
  'face-video-off':   { label: 'Turn off video', icon: '📹', color: '#e91e63', category: 'face', params: {} },
  'face-show-box':    { label: 'Show bounding box', icon: '📦', color: '#e91e63', category: 'face', params: {} },
  'face-hide-box':    { label: 'Hide bounding box', icon: '📦', color: '#e91e63', category: 'face', params: {} },
  'face-threshold':   { label: 'Set detection threshold', icon: '😊', color: '#e91e63', category: 'face', params: { threshold: '0.5' } },
  'face-analyse-camera': { label: 'Analyse from camera', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-analyse-stage': { label: 'Analyse from stage', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-visible':     { label: 'Face visible?', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-expression':  { label: 'Expression of face', icon: '😊', color: '#e91e63', category: 'face', params: { index: '1' } },
  'face-size':        { label: 'Size of face', icon: '😊', color: '#e91e63', category: 'face', params: { index: '1' } },
  'face-happy':       { label: 'Is face happy?', icon: '😊', color: '#e91e63', category: 'face', params: { index: '1' } },
  'object-video-on':  { label: 'Turn on video on stage with transparency ()', icon: '📹', color: '#ff9800', category: 'detection', params: { transparency: '0' } },
  'object-video-off': { label: 'Turn off video', icon: '📹', color: '#ff9800', category: 'detection', params: {} },
  'object-show-box':  { label: 'Show bounding box', icon: '📦', color: '#ff9800', category: 'detection', params: {} },
  'object-hide-box':  { label: 'Hide bounding box', icon: '📦', color: '#ff9800', category: 'detection', params: {} },
  'object-threshold': { label: 'Set detection threshold', icon: '🎯', color: '#ff9800', category: 'detection', params: { threshold: '0.5' } },
  'object-analyse-camera': { label: 'Analyse image from camera', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'object-analyse-stage': { label: 'Analyse image from stage', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'object-count':     { label: 'Number of objects', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'object-class':     { label: 'Class of object', icon: '🎯', color: '#ff9800', category: 'detection', params: { index: '1' } },
  'object-person-detected': { label: 'Is person detected?', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'object-person-count': { label: 'Number of persons', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'qr-video-on':        { label: 'Turn video on stage with transparency', icon: '📱', color: '#b91c1c', category: 'qr', params: { state: 'on', transparency: '0' } },
  'qr-bounding-box':    { label: 'Show bounding box', icon: '📱', color: '#b91c1c', category: 'qr', params: { mode: 'show' } },
  'qr-analyse-camera':  { label: 'Analyse image for QR code from camera', icon: '📱', color: '#b91c1c', category: 'qr', params: {} },
  'qr-detected':        { label: 'Is QR code detected?', icon: '📱', color: '#b91c1c', category: 'qr', params: {} },
  'qr-data':            { label: 'Get QR code data', icon: '📱', color: '#b91c1c', category: 'qr', params: {} },
  'qr-position':        { label: 'Position of center', icon: '📱', color: '#b91c1c', category: 'qr', params: { axis: 'x', point: 'center' } },
  'qr-angle':           { label: 'Get angle', icon: '📱', color: '#b91c1c', category: 'qr', params: {} },
  'body-show-detections': { label: 'Show detections', icon: '🧍', color: '#8b5cf6', category: 'body', params: {} },
  'body-analyse':     { label: 'Analyse human pose', icon: '🧍', color: '#8b5cf6', category: 'body', params: { source: 'camera' } },
  'body-get-count':   { label: 'Get # of people', icon: '🧍', color: '#8b5cf6', category: 'body', params: {} },
  'body-x-position':  { label: 'Body X position', icon: '🧍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'body-y-position':  { label: 'Body Y position', icon: '🧍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'body-is-detected': { label: 'Body joint detected?', icon: '🧍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'speech-listen':    { label: 'Listen once', icon: '🎤', color: '#34d399', category: 'speech', params: {} },
  'speech-heard':     { label: 'Last heard', icon: '🎤', color: '#34d399', category: 'speech', params: {} },
  'translate-text':   { label: 'Translate text', icon: '🌐', color: '#22d3ee', category: 'translate', params: { text: 'Hello', lang: 'es' } },
  'translate-result': { label: 'Translation result', icon: '🌐', color: '#22d3ee', category: 'translate', params: {} },
  'ocr-scan':         { label: 'Scan text', icon: '📄', color: '#fcd34d', category: 'ocr', params: {} },
  'ocr-text':         { label: 'Recognized text', icon: '📄', color: '#fcd34d', category: 'ocr', params: {} },
  'ic-camera-on':     { label: 'Turn classifier camera on', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  'ic-analyse':       { label: 'Analyse frame', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  'ic-top-class':     { label: 'Top class', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  'ic-confidence':    { label: 'Confidence score', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  'pc-camera-on':     { label: 'Turn pose camera on', icon: '🤸', color: '#fb923c', category: 'pose', params: {} },
  'pc-camera-off':    { label: 'Turn pose camera off', icon: '🤸', color: '#fb923c', category: 'pose', params: {} },
  'pc-capture':       { label: 'Capture pose sample', icon: '🤸', color: '#fb923c', category: 'pose', params: {} },
  'pc-pose-name':     { label: 'Pose name', icon: '🤸', color: '#fb923c', category: 'pose', params: {} },
  'pc-confidence':    { label: 'Pose confidence', icon: '🤸', color: '#fb923c', category: 'pose', params: {} },
  'ac-classify':      { label: 'Classify sound', icon: '🎙️', color: '#f472b6', category: 'ml', params: {} },
  'ac-label':         { label: 'Sound label', icon: '🎙️', color: '#f472b6', category: 'ml', params: {} },
  'tc-add':           { label: 'Add training example', icon: '📝', color: '#818cf8', category: 'ml', params: { text: 'example', label: 'class1' } },
  'tc-classify':      { label: 'Classify sentence', icon: '📝', color: '#818cf8', category: 'ml', params: { text: 'Hello' } },
  'tc-label':         { label: 'Prediction label', icon: '📝', color: '#818cf8', category: 'ml', params: {} },
  'tc-confidence':    { label: 'Prediction confidence', icon: '📝', color: '#818cf8', category: 'ml', params: {} },
  'chat-ask':         { label: 'Ask coding helper', icon: '✨', color: '#fb7185', category: 'chat', params: { question: 'How do I move the sprite?' } },
  'nlp-sentiment-val': { label: 'Sentiment (0–1)', icon: '💬', color: '#60a5fa', category: 'nlp', params: { text: 'I love coding' } },
  'nlp-positive':     { label: 'Is positive?', icon: '💬', color: '#60a5fa', category: 'nlp', params: { text: 'Great job!' } },
  // PEN EXTENSION
  'pen-erase':        { label: 'Erase all', icon: '🗑️', color: '#e74c3c', category: 'pen', params: {} },
  'pen-stamp':        { label: 'Stamp', icon: '📍', color: '#e74c3c', category: 'pen', params: {} },
  'pen-down':         { label: 'Pen down', icon: '✏️', color: '#e74c3c', category: 'pen', params: {} },
  'pen-up':           { label: 'Pen up', icon: '📄', color: '#e74c3c', category: 'pen', params: {} },
  'pen-color':        { label: 'Set pen color', icon: '🎨', color: '#e74c3c', category: 'pen', params: { color: '#000000' } },
  'pen-size':         { label: 'Set pen size', icon: '📏', color: '#e74c3c', category: 'pen', params: { size: '1' } },
  // TEXT TO SPEECH
  'tts-set-voice':    { label: 'Set voice', icon: '🎙️', color: '#3498db', category: 'tts', params: { voice: 'default' } },
  'tts-set-language': { label: 'Set language', icon: '🌍', color: '#3498db', category: 'tts', params: { lang: 'en' } },
  // FACE DETECTION
  'face-detect':      { label: 'Detect face', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-x':           { label: 'Face X position', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-y':           { label: 'Face Y position', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-width':       { label: 'Face width', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-height':      { label: 'Face height', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  'face-count':       { label: 'Number of faces', icon: '😊', color: '#e91e63', category: 'face', params: {} },
  // OBJECT DETECTION
  'object-detect':    { label: 'Detect objects', icon: '🎯', color: '#ff9800', category: 'detection', params: {} },
  'object-label':     { label: 'Object label', icon: '🎯', color: '#ff9800', category: 'detection', params: { index: '0' } },
  'object-confidence':{ label: 'Object confidence', icon: '🎯', color: '#ff9800', category: 'detection', params: { index: '0' } },
  // POSE DETECTION
  'pose-detect':      { label: 'Detect pose', icon: '🧘', color: '#9c27b0', category: 'pose', params: {} },
  'pose-landmark-x':  { label: 'Pose landmark X', icon: '🧘', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  'pose-landmark-y':  { label: 'Pose landmark Y', icon: '🧘', color: '#9c27b0', category: 'pose', params: { landmark: '0' } },
  // HAND DETECTION
  'hand-detect':      { label: 'Hand detected', icon: '✋', color: '#2196f3', category: 'hand', params: {} },
  'hand-gesture':     { label: 'Gesture name', icon: '✋', color: '#2196f3', category: 'hand', params: {} },
  // EMOTION DETECTION
  'emotion-detect':   { label: 'Detect emotion', icon: '😄', color: '#ff5722', category: 'emotion', params: {} },
  'emotion-label':    { label: 'Emotion label', icon: '😄', color: '#ff5722', category: 'emotion', params: {} },
  // IMAGE CLASSIFICATION
  'img-classify':     { label: 'Classify image', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  'img-class-label':  { label: 'Image class label', icon: '🖼️', color: '#c084fc', category: 'ml', params: {} },
  // MACHINE LEARNING
  'ml-train':         { label: 'Train classifier (sim)', icon: '🧠', color: '#5eead4', category: 'ml', params: {} },
  'ml-training-open': { label: 'Training window open', icon: '🧠', color: '#5eead4', category: 'ml', params: {} },
  'ml-predict':       { label: 'Predict', icon: '🤖', color: '#673ab7', category: 'ml', params: { input: 'data' } },
  // CHATBOT
  'chatbot-ask':      { label: 'Chatbot ask', icon: '💬', color: '#00bcd4', category: 'chat', params: { question: 'Hello' } },
  'chatbot-response': { label: 'Chatbot response', icon: '💬', color: '#00bcd4', category: 'chat', params: {} },
  // NLP
  'nlp-sentiment':    { label: 'Sentiment analysis', icon: '📊', color: '#8bc34a', category: 'nlp', params: { text: 'text' } },
  'nlp-keywords':     { label: 'Extract keywords', icon: '📊', color: '#8bc34a', category: 'nlp', params: { text: 'text' } },
  'nlp-language':     { label: 'Detect language', icon: '📊', color: '#8bc34a', category: 'nlp', params: { text: 'text' } },
  // ARDUINO BLOCKS
  'arduino-digital':  { label: 'Digital write pin', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: '13', value: '1' } },
  'arduino-analog':   { label: 'Analog write pin', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: 'A0', value: '128' } },
  'arduino-read-digital': { label: 'Read digital pin', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: '2' } },
  'arduino-read-analog':  { label: 'Read analog pin', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: 'A0' } },
  'arduino-servo':    { label: 'Servo write angle', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: '9', angle: '90' } },
  'arduino-buzzer':   { label: 'Buzzer tone', icon: '🎛️', color: '#607d8b', category: 'arduino', params: { pin: '10', freq: '1000' } },
  // MICRO:BIT BLOCKS
  'microbit-display': { label: 'Display text', icon: '🔷', color: '#0066cc', category: 'microbit', params: { text: 'Hello' } },
  'microbit-button':  { label: 'Button pressed', icon: '🔷', color: '#0066cc', category: 'microbit', params: { button: 'A' } },
  'microbit-accel-x': { label: 'Accelerometer X', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  'microbit-accel-y': { label: 'Accelerometer Y', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  'microbit-accel-z': { label: 'Accelerometer Z', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  'microbit-compass': { label: 'Compass heading', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  'microbit-temp':    { label: 'Temperature', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  'microbit-radio-send': { label: 'Radio send', icon: '🔷', color: '#0066cc', category: 'microbit', params: { message: 'hello' } },
  'microbit-radio-recv': { label: 'Radio receive', icon: '🔷', color: '#0066cc', category: 'microbit', params: {} },
  // ESP32 BLOCKS
  'esp32-wifi':       { label: 'Connect WiFi', icon: '📡', color: '#e8761a', category: 'esp32', params: { ssid: 'network', pwd: 'password' } },
  'esp32-http-get':   { label: 'HTTP GET', icon: '📡', color: '#e8761a', category: 'esp32', params: { url: 'http://example.com' } },
  'esp32-http-post':  { label: 'HTTP POST', icon: '📡', color: '#e8761a', category: 'esp32', params: { url: 'http://example.com', data: 'data' } },
  'esp32-mqtt-pub':   { label: 'MQTT publish', icon: '📡', color: '#e8761a', category: 'esp32', params: { topic: 'topic', msg: 'message' } },
  'esp32-mqtt-sub':   { label: 'MQTT subscribe', icon: '📡', color: '#e8761a', category: 'esp32', params: { topic: 'topic' } },
  // MOTOR CONTROL
  'motor-forward':    { label: 'Move forward', icon: '⚙️', color: '#795548', category: 'motor', params: { speed: '100' } },
  'motor-backward':   { label: 'Move backward', icon: '⚙️', color: '#795548', category: 'motor', params: { speed: '100' } },
  'motor-stop':       { label: 'Stop motor', icon: '⚙️', color: '#795548', category: 'motor', params: {} },
  'motor-turn-left':  { label: 'Turn left', icon: '⚙️', color: '#795548', category: 'motor', params: { speed: '100' } },
  'motor-turn-right': { label: 'Turn right', icon: '⚙️', color: '#795548', category: 'motor', params: { speed: '100' } },
  // SERVO CONTROL
  'servo-rotate':     { label: 'Rotate servo', icon: '🔄', color: '#f1c40f', category: 'servo', params: { angle: '90' } },
  'servo-cont-rot':   { label: 'Continuous rotate', icon: '🔄', color: '#f1c40f', category: 'servo', params: { speed: '50' } },
  // SENSOR BLOCKS
  'sensor-line':      { label: 'Line sensor', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  'sensor-obstacle':  { label: 'Obstacle detected', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  'sensor-distance':  { label: 'Distance (cm)', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  'sensor-temperature': { label: 'Temperature', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  'sensor-humidity':  { label: 'Humidity', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  'sensor-light':     { label: 'Light level', icon: '🔌', color: '#34495e', category: 'sensor', params: {} },
  // DISPLAY BLOCKS
  'lcd-print':        { label: 'LCD print', icon: '📺', color: '#1abc9c', category: 'display', params: { text: 'Hello' } },
  'oled-print':       { label: 'OLED print', icon: '📺', color: '#16a085', category: 'display', params: { text: 'Hello' } },
  'lcd-clear':        { label: 'Clear display', icon: '📺', color: '#1abc9c', category: 'display', params: {} },
  // SMART HOME / IOT
  'iot-relay-on':     { label: 'Relay ON', icon: '🔌', color: '#2c3e50', category: 'iot', params: {} },
  'iot-relay-off':    { label: 'Relay OFF', icon: '🔌', color: '#2c3e50', category: 'iot', params: {} },
  'iot-send-data':    { label: 'Send data', icon: '🔌', color: '#2c3e50', category: 'iot', params: { data: 'data' } },
  'iot-recv-data':    { label: 'Receive data', icon: '🔌', color: '#2c3e50', category: 'iot', params: {} },
  // GAMEPAD
  'gamepad-button':   { label: 'Gamepad button', icon: '🎮', color: '#e74c3c', category: 'gamepad', params: { button: 'A' } },
  'gamepad-stick-x':  { label: 'Gamepad stick X', icon: '🎮', color: '#e74c3c', category: 'gamepad', params: {} },
  'gamepad-stick-y':  { label: 'Gamepad stick Y', icon: '🎮', color: '#e74c3c', category: 'gamepad', params: {} },
  // CLOUD VARIABLES
  'cloud-set':        { label: 'Set cloud variable', icon: '☁️', color: '#3498db', category: 'cloud', params: { var: 'myVar', value: '0' } },
  'cloud-get':        { label: 'Get cloud variable', icon: '☁️', color: '#3498db', category: 'cloud', params: { var: 'myVar' } },
  // Sensing (Scratch cyan #00bcd4)
  'sense-touching':     { label: 'Touching?', icon: '🔍', color: '#00bcd4', category: 'sensing', params: { target: 'mouse-pointer' } },
  'sense-touching-sprite': { label: 'Touching sprite?', icon: '🔍', color: '#00bcd4', category: 'sensing', params: { sprite: 'any' } },
  'sense-touching-color': { label: 'Touching color?', icon: '🔍', color: '#00bcd4', category: 'sensing', params: { color: '#4a4a4a' } },
  'sense-color-touching-color': { label: 'Color is touching color?', icon: '🔍', color: '#00bcd4', category: 'sensing', params: { color1: '#8b4513', color2: '#ff69b4' } },
  'sense-answer':       { label: 'Answer', icon: '💬', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-mouse-down':   { label: 'Mouse down?', icon: '🖱️', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-set-drag-mode': { label: 'Set drag mode', icon: '🖱️', color: '#00bcd4', category: 'sensing', params: { mode: 'draggable' } },
  'sense-key':          { label: 'Key pressed?', icon: '⌨️', color: '#00bcd4', category: 'sensing', params: { key: 'space' } },
  'sense-mouse-x':      { label: 'Mouse X', icon: '🖱️', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-mouse-y':      { label: 'Mouse Y', icon: '🖱️', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-distance':     { label: 'Distance to', icon: '📏', color: '#00bcd4', category: 'sensing', params: { target: 'mouse-pointer' } },
  'sense-timer':        { label: 'Timer', icon: '⏱️', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-reset-timer':  { label: 'Reset timer', icon: '⏱️', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-of':           { label: 'Property of', icon: '🔍', color: '#00bcd4', category: 'sensing', params: { property: 'backdrop', object: 'Stage' } },
  'sense-current':      { label: 'Current date/time', icon: '📅', color: '#00bcd4', category: 'sensing', params: { unit: 'year' } },
  'sense-days-since-2000': { label: 'Days since 2000', icon: '📅', color: '#00bcd4', category: 'sensing', params: {} },
  'sense-username':     { label: 'Username', icon: '👤', color: '#00bcd4', category: 'sensing', params: {} },
  // Looks
  'looks-say':          { label: 'Say', icon: '💬', color: '#f59e0b', category: 'looks', params: { text: 'Hello!', secs: '2' } },
  'looks-think':        { label: 'Think', icon: '💭', color: '#f59e0b', category: 'looks', params: { text: 'Hmm...', secs: '2' } },
  'looks-costume':      { label: 'Switch costume to', icon: '👗', color: '#f59e0b', category: 'looks', params: { costume: '1' } },
  'looks-next-costume': { label: 'Next costume', icon: '👗', color: '#f59e0b', category: 'looks', params: {} },
  'looks-color-effect': { label: 'Set color effect', icon: '🎨', color: '#f59e0b', category: 'looks', params: { value: '0' } },
  'looks-ghost-effect': { label: 'Set ghost effect', icon: '👻', color: '#f59e0b', category: 'looks', params: { value: '0' } },
  'looks-clear-effects':{ label: 'Clear all effects', icon: '✨', color: '#f59e0b', category: 'looks', params: {} },
  'looks-grow':         { label: 'Grow by', icon: '🔼', color: '#f59e0b', category: 'looks', params: { amount: '10' } },
  'looks-shrink':       { label: 'Shrink by', icon: '🔽', color: '#f59e0b', category: 'looks', params: { amount: '10' } },
  'looks-front':        { label: 'Go to front layer', icon: '🎨', color: '#f59e0b', category: 'looks', params: {} },
  'looks-back':         { label: 'Go to back layer', icon: '🎨', color: '#f59e0b', category: 'looks', params: {} },
  // Physics
  'physics-velocity':   { label: 'Set velocity', icon: '💨', color: '#f59e0b', category: 'physics', params: { vx: '5', vy: '0' } },
  'physics-gravity':    { label: 'Set gravity', icon: '⬇️', color: '#f59e0b', category: 'physics', params: { amount: '2400' } },
  'physics-bounce':     { label: 'Bounce off edges', icon: '↩️', color: '#f59e0b', category: 'physics', params: {} },
  'physics-friction':   { label: 'Set friction', icon: '🔄', color: '#f59e0b', category: 'physics', params: { amount: '0.9' } },
  'physics-jump':       { label: 'Physics jump', icon: '⬆️', color: '#f59e0b', category: 'physics', params: { power: '560' } },
  'physics-allow-double-jump': { label: 'Allow double jump', icon: '⏫', color: '#f59e0b', category: 'physics', params: { enable: 'true' } },
  'physics-push':       { label: 'Push in direction', icon: '➡️', color: '#f59e0b', category: 'physics', params: { direction: '0', force: '5' } },
  // Game
  'game-score-add':     { label: 'Add to score', icon: '🏆', color: '#f59e0b', category: 'game', params: { amount: '10' } },
  'game-score-set':     { label: 'Set score to', icon: '🏆', color: '#f59e0b', category: 'game', params: { value: '0' } },
  'game-lose-life':     { label: 'Lose a life', icon: '❤️', color: '#f59e0b', category: 'game', params: {} },
  'game-set-lives':     { label: 'Set lives to', icon: '❤️', color: '#f59e0b', category: 'game', params: { value: '3' } },
  'game-over':          { label: 'Game Over', icon: '💀', color: '#f59e0b', category: 'game', params: {} },
  'game-win':           { label: 'You Win!', icon: '🎉', color: '#f59e0b', category: 'game', params: {} },
  'game-next-level':    { label: 'Next Level', icon: '⬆️', color: '#f59e0b', category: 'game', params: {} },
  'game-spawn':         { label: 'Spawn clone of', icon: '✨', color: '#f59e0b', category: 'game', params: { sprite: 'this' } },
  'game-destroy':       { label: 'Destroy this', icon: '💥', color: '#f59e0b', category: 'game', params: {} },
  'game-pause':         { label: 'Pause game', icon: '⏸️', color: '#f59e0b', category: 'game', params: {} },
  // Motion extras
  'motion-glide':       { label: 'Glide to', icon: '🕊️', color: '#f59e0b', category: 'motion', params: { x: '0', y: '0', secs: '1' } },
  'motion-point':       { label: 'Point toward mouse', icon: '🎯', color: '#f59e0b', category: 'motion', params: {} },
  'motion-point-dir':   { label: 'Point in direction', icon: '🎯', color: '#f59e0b', category: 'motion', params: { direction: '90' } },
  'motion-setx':        { label: 'Set X to', icon: '🎭', color: '#f59e0b', category: 'motion', params: { x: '0' } },
  'motion-sety':        { label: 'Set Y to', icon: '🎭', color: '#f59e0b', category: 'motion', params: { y: '0' } },
  'motion-speed':       { label: 'Set speed to', icon: '⚡', color: '#f59e0b', category: 'motion', params: { speed: '5' } },
  'motion-stop':        { label: 'Stop motion', icon: '⏹', color: '#f59e0b', category: 'motion', params: {} },
  'motion-rotation':    { label: 'Set rotation to', icon: '🔄', color: '#f59e0b', category: 'motion', params: { rotation: '0' } },
  'motion-change-angle':{ label: 'Change angle by', icon: '↻', color: '#f59e0b', category: 'motion', params: { angle: '15' } },
  'motion-wrap':        { label: 'Wrap around edges', icon: '🔁', color: '#f59e0b', category: 'motion', params: {} },
  'motion-jump':        { label: 'Jump with power', icon: '⬆️', color: '#f59e0b', category: 'motion', params: { power: '560' } },
  // My Blocks
  'myblock-define':     { label: 'Define my block', icon: '🧩', color: '#f59e0b', category: 'myblocks', params: { name: 'my block' } },
  'myblock-run':        { label: 'Run my block', icon: '🧩', color: '#f59e0b', category: 'myblocks', params: { name: 'my block' } },
  'tts-speak':          { label: 'TTS Speak', icon: '🔊', color: '#f59e0b', category: 'ai', params: { voice: 'auto', text: 'Hello from ByteBuddies' } },
  // HUMAN BODY / POSE DETECTION (using pose-video-on from line 100)
  'body-video-on':      { label: '[body] turn [box v] video on stage with () % transparency', icon: '📹', color: '#8b5cf6', category: 'body', params: { state: 'on', transparency: '0' } },
  'pose-show-detections': { label: 'Show detections', icon: '🧍', color: '#8b5cf6', category: 'body', params: {} },
  'pose-analyze':       { label: 'Analyse image for human pose from', icon: '🧍', color: '#8b5cf6', category: 'body', params: { source: 'camera' } },
  'pose-count-people':  { label: 'Get # of people', icon: '👥', color: '#8b5cf6', category: 'body', params: {} },
  'pose-position-x':    { label: 'X position of', icon: '📍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'pose-position-y':    { label: 'Y position of', icon: '📍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'pose-detected':      { label: 'Is', icon: '🔍', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1', check: 'detected?' } },
  'pose-position-z':    { label: 'Z position of', icon: '📏', color: '#8b5cf6', category: 'body', params: { joint: 'nose', person: '1' } },
  'pose-angle':         { label: 'Angle of', icon: '∠', color: '#8b5cf6', category: 'body', params: { joint: 'elbow', side: 'left' } },
  'pose-confidence':    { label: 'Confidence of', icon: '📊', color: '#8b5cf6', category: 'body', params: { joint: 'nose' } },
  'pose-distance':      { label: 'Distance between', icon: '📐', color: '#8b5cf6', category: 'body', params: { joint1: 'nose', joint2: 'chin' } },
  'pose-movement':      { label: 'Movement speed of', icon: '⚡', color: '#8b5cf6', category: 'body', params: { joint: 'body' } },
  'pose-gesture':       { label: 'Is gesture', icon: '🤚', color: '#8b5cf6', category: 'body', params: { gesture: 'hands raised', person: '1' } },
  'pose-rep-count':     { label: 'Rep counter for', icon: '📊', color: '#8b5cf6', category: 'body', params: { exercise: 'squats' } },
  'pose-posture':       { label: 'Posture quality score', icon: '📈', color: '#8b5cf6', category: 'body', params: {} },
  'hand-analyze':       { label: 'Analyse image for hand from', icon: '✋', color: '#f472b6', category: 'hand', params: { source: 'camera' } },
  'hand-detected':      { label: 'Is hand detected', icon: '✋', color: '#f472b6', category: 'hand', params: {} },
  'hand-position-x':    { label: 'X position of', icon: '👆', color: '#f472b6', category: 'hand', params: { point: 'top of thumb' } },
  'hand-position-y':    { label: 'Y position of', icon: '👆', color: '#f472b6', category: 'hand', params: { point: 'top of thumb' } },
  'hand-gesture':       { label: 'Hand gesture is', icon: '✋', color: '#f472b6', category: 'hand', params: { gesture: 'thumbs up' } },
  'hand-pinch':         { label: 'Is pinching detected', icon: '🤏', color: '#f472b6', category: 'hand', params: {} },
  'hand-distance':      { label: 'Distance between fingers', icon: '📐', color: '#f472b6', category: 'hand', params: { finger1: 'thumb', finger2: 'index' } },
};

/** Lowercase keys for case-insensitive palette lookup ([Body] vs [body]). */
let _sidebarTypeByLc = null;
function sidebarTypeByLc() {
  if (!_sidebarTypeByLc) {
    _sidebarTypeByLc = {};
    for (const [key, value] of Object.entries(SIDEBAR_TO_TYPE)) {
      _sidebarTypeByLc[key.toLowerCase()] = value;
    }
  }
  return _sidebarTypeByLc;
}

/** Case-insensitive palette label → short type key. */
export function lookupSidebarType(label) {
  const k = String(label || '').trim().toLowerCase();
  if (!k) return null;
  return sidebarTypeByLc()[k] || null;
}

/* Map sidebar block names to block type keys */
export const SIDEBAR_TO_TYPE = {
  // MOTION
  'move steps': 'sprite-move', 'move () steps': 'sprite-move',
  'turn right () degrees': 'sprite-turn-right', 'turn left () degrees': 'sprite-turn-left', 'turn clockwise degrees': 'sprite-turn-right', 'turn anticlockwise degrees': 'sprite-turn-left',
  'point in direction ()': 'sprite-point-dir', 'point in direction': 'sprite-point-dir',
  'point towards [mouse-pointer v]': 'sprite-point-towards', 'point towards': 'sprite-point-towards', 'point towards mouse-pointer': 'sprite-point-towards',
  'go to x: () y: ()': 'sprite-goto', 'go to x,y': 'sprite-goto', 'go to': 'sprite-goto-sprite',
  'go to [sprite v]': 'sprite-goto-sprite', 'go to sprite': 'sprite-goto-sprite',
  'go to random position': 'sprite-goto-random-position',
  'go to mouse-pointer': 'sprite-goto-mouse-pointer',
  'glide () secs to x: () y: ()': 'sprite-glide', 'glide secs to x,y': 'sprite-glide',
  'glide secs to': 'motion-glide-to-sprite',
  'glide secs to random position': 'motion-glide-to-random-position',
  'change x by ()': 'sprite-changex', 'change x by': 'sprite-changex',
  'set x to ()': 'sprite-setx', 'set x to': 'sprite-setx',
  'change y by ()': 'sprite-changey', 'change y by': 'sprite-changey',
  'set y to ()': 'sprite-sety', 'set y to': 'sprite-sety',
  'if on edge, bounce': 'sprite-if-bounce',
  'set rotation style [all around v]': 'sprite-rotation-style', 'set rotation style': 'sprite-rotation-style',
  'x position': 'sprite-x-reporter', 'y position': 'sprite-y-reporter', 'direction': 'sprite-direction-reporter',
  // LOOKS
  'say () for () seconds': 'sprite-say', 'say for seconds': 'sprite-say', 'say': 'looks-say',
  'think () for () seconds': 'sprite-think', 'think for seconds': 'sprite-think', 'think': 'looks-think',
  'show': 'sprite-show', 'hide': 'sprite-hide',
  'switch costume to': 'looks-costume', 'switch costume to [costume1 v]': 'looks-costume',
  'next costume': 'looks-next-costume',
  'change size by ()': 'looks-change-size', 'change size by': 'looks-change-size',
  'set size to ()': 'sprite-setsize', 'set size to': 'sprite-setsize',
  'switch backdrop to [backdrop1 v]': 'looks-backdrop', 'switch backdrop to': 'looks-backdrop',
  'next backdrop': 'looks-next-backdrop',
  'go to front layer': 'looks-front', 'go to back layer': 'looks-back', 'go forward layers': 'looks-forward-layers',
  'change backdrop by ()': 'looks-change-backdrop', 'change backdrop by': 'looks-change-backdrop',
  'change [color v] effect by ()': 'looks-change-effect', 'change color effect by': 'looks-change-effect',
  'set [color v] effect to ()': 'looks-set-effect', 'set color effect to': 'looks-set-effect',
  'clear graphic effects': 'looks-clear-effects',
  'costume number': 'looks-costume-reporter', 'backdrop number': 'looks-backdrop-reporter', 'size': 'sprite-size-reporter',
  // SOUND
  'play sound until done': 'sound-play-until-done',
  'play sound [pop v] until done': 'sound-play-until-done',
  'start sound': 'sound-play',
  'play sound': 'sound-play',
  'stop all sounds': 'sound-stop',
  'stop sounds': 'sound-stop',
  'set volume to ()': 'sound-set-volume',
  'set volume to': 'sound-set-volume',
  'volume': 'sound-get-volume',
  'change [pitch v] effect by ()': 'sound-change-effect', 'change pitch effect by': 'sound-change-effect',
  'set [pitch v] effect to ()': 'sound-set-effect', 'set pitch effect to': 'sound-set-effect',
  'clear sound effects': 'sound-clear-effects',
  // EVENTS
  'when green flag clicked': 'event-start', 'when ▶ clicked': 'event-start',
  'when [space v] key pressed': 'event-keypress', 'when key pressed': 'event-keypress',
  'when this sprite clicked': 'event-click', 'when clicked': 'event-click',
  'when backdrop switches to [backdrop1 v]': 'event-backdropswitch', 'when backdrop switches to': 'event-backdropswitch',
  'when [loudness v] > ()': 'event-loudness', 'when loudness greater than': 'event-loudness', 'when greater than': 'event-loudness',
  'broadcast [message1 v] and wait': 'event-broadcast-wait', 'broadcast and wait': 'event-broadcast-wait',
  'broadcast [message1 v]': 'event-broadcast', 'broadcast': 'event-broadcast',
  'when I receive [message1 v]': 'event-message', 'when I receive message': 'event-message',
  // CONTROL
  'wait seconds': 'control-wait', 'repeat': 'loop-repeat', 'forever': 'loop-forever',
  'if then': 'logic-if', 'if then else': 'logic-if-else',
  'wait until': 'control-wait-until', 'repeat until': 'control-repeat-until',
  'stop': 'control-stop',
  'when I start as a clone': 'event-clone',
  'create clone of': 'control-create-clone',
  'delete this clone': 'control-delete-clone',
  // SENSING
  'touching': 'sense-touching', 'touching color': 'sense-touching-color', 'color is touching': 'sense-color-touching-color',
  'distance to': 'sense-distance', 'ask and wait': 'action-ask', 'answer': 'sense-answer', 'key pressed': 'sense-key',
  'mouse down': 'sense-mouse-down', 'mouse x': 'sense-mouse-x', 'mouse y': 'sense-mouse-y', 'set drag mode': 'sense-set-drag-mode',
  'loudness': 'sense-loudness', 'timer': 'sense-timer', 'reset timer': 'sense-reset-timer',
  'current year': 'sense-current', 'days since 2000': 'sense-days-since-2000', 'username': 'sense-username',
  'touching [mouse-pointer v]?': 'sense-touching', 'touching color []?': 'sense-touching-color', 'color [] is touching []?': 'sense-color-touching-color',
  'distance to [mouse-pointer v]': 'sense-distance', 'ask [] and wait': 'action-ask', 'key [space v] pressed?': 'sense-key',
  'mouse down?': 'sense-mouse-down', 'set drag mode [draggable v]': 'sense-set-drag-mode',
  'backdrop # of [Stage v]': 'sense-of', '[backdrop # v] of [Stage v]': 'sense-of',
  // OPERATORS
  'add': 'math-add', 'subtract': 'math-add', 'multiply': 'math-mult', 'divide': 'math-mult',
  'pick random to': 'math-random', 'greater than': 'logic-compare', 'less than': 'logic-compare', 'equals': 'logic-compare',
  'and': 'logic-and', 'or': 'logic-or', 'not': 'logic-not', 'join': 'text-join', 'letter of': 'text-letter',
  'length of': 'text-length', 'contains': 'text-contains', 'mod': 'math-modulo', 'round': 'math-round', 'math operation of': 'math-round',
  // VARIABLES
  'set variable to': 'var-set', 'change variable by': 'var-change', 'show variable': 'var-show', 'hide variable': 'var-hide',
  // LISTS
  'add to list': 'list-add', 'delete of list': 'list-delete', 'delete all of list': 'list-delete-all',
  'insert at of list': 'list-insert', 'replace item of list with': 'list-replace',
  'item of list': 'list-item', 'item # of in list': 'list-index',
  'length of list': 'list-length', 'list contains': 'list-contains', 'show list': 'list-show', 'hide list': 'list-hide',
  // TEXT
  // MY BLOCKS
  'define': 'func-define', 'run custom block': 'func-call',
  // LEGACY MAPPINGS (for backwards compatibility)
  'create variable': 'var-create', 'set variable': 'var-set', 'change by': 'var-change', 'show variable': 'var-show',
  'wait': 'control-wait',
  'if / else': 'logic-if', 'and / or / not': 'logic-and', 'compare (=, <, >)': 'logic-compare', 'true / false': 'logic-bool',
  'repeat n times': 'loop-repeat', 'forever': 'loop-forever', 'while condition': 'loop-while', 'for each in list': 'loop-foreach', 'break / continue': 'loop-break',
  'define function': 'func-define', 'call function': 'func-call', 'return value': 'func-return', 'with parameters': 'func-params',
  'on start': 'event-start', 'on key press': 'event-keypress', 'on click': 'event-click', 'on collision': 'event-collision', 'on message': 'event-message',
  'add / subtract': 'math-add', 'multiply / divide': 'math-mult', 'random number': 'math-random', 'round / abs': 'math-round', 'modulo': 'math-round',
  'create text': 'text-create', 'join text': 'text-join', 'letter # of': 'text-length',
  'create list': 'list-create', 'get item #': 'list-get', 'sort list': 'list-get',
  'print': 'action-print', 'alert': 'action-alert', 'prompt': 'action-ask',
  'turn degrees': 'sprite-turn',
  'show / hide': 'sprite-show', 'say text': 'sprite-say', 'set size': 'sprite-setsize',
  'play sound': 'sound-play', 'stop sounds': 'sound-stop', 'set volume': 'sound-set-volume', 'play note': 'sound-play',
  '[music] play drum': 'music-drum', '[music] rest for beats': 'music-rest', '[music] play note for beats': 'music-note',
  '[music] set instrument to': 'music-instrument', '[music] set tempo to': 'music-tempo', '[music] change tempo by': 'music-tempo-change', '[music] tempo': 'music-get-tempo',
  'ai classify': 'ai-classify', 'ai generate text': 'ai-generate', 'ai detect object': 'ai-classify', 'ai translate': 'ai-generate',
  'touching edge?': 'sense-touching', 'touching sprite?': 'sense-touching-sprite',
  'key pressed?': 'sense-key', 'distance to mouse': 'sense-distance',
  'color effect': 'looks-color-effect', 'ghost effect': 'looks-ghost-effect', 'clear effects': 'looks-clear-effects',
  'grow by': 'looks-grow', 'shrink by': 'looks-shrink', 'go to front': 'looks-front', 'go to back': 'looks-back',
  'set velocity': 'physics-velocity', 'set gravity': 'physics-gravity',
  'bounce off edges': 'physics-bounce', 'set friction': 'physics-friction',
  'physics jump': 'physics-jump', 'allow double jump': 'physics-allow-double-jump',
  'jump': 'motion-jump', 'jump with power': 'motion-jump', 'push': 'physics-push',
  'add to score': 'game-score-add', 'set score': 'game-score-set',
  'lose a life': 'game-lose-life', 'set lives': 'game-set-lives',
  'game over': 'game-over', 'you win': 'game-win', 'next level': 'game-next-level',
  'spawn clone': 'game-spawn', 'destroy': 'game-destroy', 'pause game': 'game-pause',
  'point toward mouse': 'motion-point',
  'set rotation': 'motion-rotation', 'change angle by': 'motion-change-angle', 'wrap around': 'motion-wrap', 'stop motion': 'motion-stop',
  'define my block': 'myblock-define', 'run my block': 'myblock-run',
  '[tts] speak': 'tts-speak',
  // PEN EXTENSION
  'erase all': 'pen-erase', 'stamp': 'pen-stamp', 'pen down': 'pen-down', 'pen up': 'pen-up',
  'set pen color': 'pen-color', 'set pen size': 'pen-size',
  // TTS
  'set voice': 'tts-set-voice', 'set language': 'tts-set-language',
  // FACE DETECTION
  'detect face': 'face-detect', 'face x': 'face-x', 'face y': 'face-y',
  'face width': 'face-width', 'face height': 'face-height', 'number of faces': 'face-count',
  // OBJECT DETECTION
  'detect objects': 'object-detect', 'object label': 'object-label', 'object confidence': 'object-confidence',
  // POSE DETECTION
  'detect pose': 'pose-detect', 'pose landmark x': 'pose-landmark-x', 'pose landmark y': 'pose-landmark-y',
  // HAND DETECTION
  'hand detected': 'hand-detect', 'gesture name': 'hand-gesture',
  // EMOTION
  'detect emotion': 'emotion-detect', 'emotion label': 'emotion-label',
  // IMAGE CLASSIFICATION
  'classify image': 'img-classify', 'image class label': 'img-class-label',
  // ML
  'train model': 'ml-train', 'predict': 'ml-predict',
  // CHATBOT
  'chatbot ask': 'chatbot-ask', 'chatbot response': 'chatbot-response',
  // NLP
  'sentiment analysis': 'nlp-sentiment', 'extract keywords': 'nlp-keywords', 'detect language': 'nlp-language',
  // ARDUINO
  'digital write': 'arduino-digital', 'analog write': 'arduino-analog', 'read digital': 'arduino-read-digital',
  'read analog': 'arduino-read-analog', 'servo angle': 'arduino-servo', 'buzzer tone': 'arduino-buzzer',
  // MICROBIT
  'display text': 'microbit-display', 'button pressed': 'microbit-button', 'accelerometer x': 'microbit-accel-x',
  'accelerometer y': 'microbit-accel-y', 'accelerometer z': 'microbit-accel-z', 'compass heading': 'microbit-compass',
  'temperature': 'microbit-temp', 'radio send': 'microbit-radio-send', 'radio receive': 'microbit-radio-recv',
  // ESP32
  'connect wifi': 'esp32-wifi', 'http get': 'esp32-http-get', 'http post': 'esp32-http-post',
  'mqtt publish': 'esp32-mqtt-pub', 'mqtt subscribe': 'esp32-mqtt-sub',
  // MOTOR
  'move forward': 'motor-forward', 'move backward': 'motor-backward', 'turn left': 'motor-turn-left',
  'turn right': 'motor-turn-right',
  // SERVO
  'rotate servo': 'servo-rotate', 'continuous rotate': 'servo-cont-rot',
  // SENSORS
  'line sensor': 'sensor-line', 'obstacle detected': 'sensor-obstacle', 'distance': 'sensor-distance',
  'light level': 'sensor-light', 'humidity': 'sensor-humidity',
  // DISPLAY
  'lcd print': 'lcd-print', 'oled print': 'oled-print', 'clear display': 'lcd-clear',
  // IOT
  'relay on': 'iot-relay-on', 'relay off': 'iot-relay-off', 'send data': 'iot-send-data', 'receive data': 'iot-recv-data',
  // GAMEPAD
  'gamepad button': 'gamepad-button', 'gamepad stick x': 'gamepad-stick-x', 'gamepad stick y': 'gamepad-stick-y',
  // CLOUD
  'set cloud variable': 'cloud-set', 'get cloud variable': 'cloud-get',
  // HUMAN BODY / POSE DETECTION
  'turn on video on stage with': 'pose-video-on', 'show detections': 'pose-show-detections',
  'analyse image for human pose from': 'pose-analyze', 'get # of people': 'pose-count-people',
  'x position of': 'pose-position-x', 'y position of': 'pose-position-y', 'is': 'pose-detected',
  'z position of': 'pose-position-z', 'angle of': 'pose-angle', 'confidence of': 'pose-confidence',
  'distance between': 'pose-distance', 'movement speed of': 'pose-movement', 'is gesture': 'pose-gesture',
  'rep counter for': 'pose-rep-count', 'posture quality score': 'pose-posture',
  'analyse image for hand from': 'hand-analyze', 'is hand detected': 'hand-detected',
  'x position of': 'hand-position-x', 'y position of': 'hand-position-y', 'hand gesture is': 'hand-gesture',
  'is pinching detected': 'hand-pinch', 'distance between fingers': 'hand-distance',

  // BRACKETED EXTENSION BLOCKS (from PictoBlox documentation)
  // Face Detection
  '[Face] Turn video on (camera)': 'face-video-on', '[Face] Turn video on (mirrored)': 'face-video-on',
  '[Face] Turn video off': 'face-video-off', '[Face] Show bounding box': 'face-show-box',
  '[Face] Hide bounding box': 'face-hide-box', '[Face] Set detection threshold': 'face-threshold',
  '[Face] Analyse from camera': 'face-analyse-camera', '[Face] Analyse from stage': 'face-analyse-stage',
  '[Face] Number of faces': 'face-count', '[Face] Face visible?': 'face-visible',
  '[Face] Expression of face 1': 'face-expression', '[Face] X of face 1': 'face-x',
  '[Face] Y of face 1': 'face-y', '[Face] Size of face 1': 'face-size',
  '[Face] Is face 1 happy?': 'face-happy',
  '[face] turn video on (camera) with transparency 0': 'face-video-on', '[face] turn video on (mirrored) with transparency 0': 'face-video-on',
  '[face] turn video off': 'face-video-off', '[face] show bounding box': 'face-show-box',
  '[face] hide bounding box': 'face-hide-box', '[face] turn video on (camera)': 'face-video-on', '[face] turn video on (mirrored)': 'face-video-on',
  '[face] turn video on': 'face-video-on', '[face] turn video on camera': 'face-video-on', '[face] turn video on mirrored': 'face-video-on',
  '[face] set detection threshold': 'face-threshold', '[face] analyse from camera': 'face-analyse-camera', '[face] analyse from stage': 'face-analyse-stage',
  '[face] number of faces': 'face-count', '[face] face visible?': 'face-visible',
  '[face] expression of face 1': 'face-expression', '[face] x of face 1': 'face-x',
  '[face] y of face 1': 'face-y', '[face] size of face 1': 'face-size',
  '[face] is face 1 happy?': 'face-happy',

  // Object Detection
  '[object] turn video on (on) with transparency 0': 'object-video-on', '[object] turn video on with transparency 0': 'object-video-on',
  '[object] turn video on': 'object-video-on', '[object] turn video off': 'object-video-off',
  '[object] show bounding box': 'object-show-box', '[object] hide bounding box': 'object-hide-box',
  '[object] set detection threshold': 'object-threshold', '[object] analyse image from camera': 'object-analyse-camera',
  '[object] analyse image from stage': 'object-analyse-stage', '[object] number of objects': 'object-count',
  '[object] class of object 1': 'object-class', '[object] is person detected?': 'object-person-detected',
  '[object] number of person detected': 'object-person-count',

  // Human Body / Pose Detection
  '[pose] turn video on with transparency 0': 'pose-video-on', '[pose] turn video on': 'pose-video-on',
  '[pose] turn video off': 'pose-video-off', '[pose] show detections': 'pose-show-detections',
  '[pose] hide detections': 'pose-video-off',
  '[body] turn [box v] video on stage with () % transparency': 'body-video-on',
  '[Body] Analyse from face': 'body-analyse',
  '[Body] Keypoint x': 'body-x-position', '[Body] Keypoint y': 'body-y-position',
  '[Body] Body visible?': 'body-is-detected', '[Body] Nose x': 'body-x-position', '[Body] Nose y': 'body-y-position',
  '[Body] Show detections': 'body-show-detections',
  '[Body] Analyse image for human pose from': 'body-analyse', '[Body] Get # of people': 'body-get-count',
  '[Body] X position of': 'body-x-position', '[Body] Y position of': 'body-y-position', '[Body] Is': 'body-is-detected',
  '[Hand] Analyse image for hand from': 'hand-analyze', '[Hand] Is hand detected': 'hand-detected',
  '[Hand] X position of': 'hand-position-x', '[Hand] Y position of': 'hand-position-y',
  '[body] show [detections v]': 'body-show-detections', '[body] analyse image for human pose from [camera v]': 'body-analyse',
  '[body] get # of people': 'body-people-count', '[body] ([x position v] of [nose v] of person ())': 'body-position-x',
  '[body] ([y position v] of [nose v] of person ())': 'body-position-y', '[body] <is [nose v] of person () detected?>': 'body-detected',
  '[body] analyse image for hand from camera': 'hand-analyse-camera', '[body] <is hand detected>': 'hand-detected-check',
  '[body] ([x v] position of [top v] of [thumb v])': 'hand-position-x', '[body] ([y v] position of [top v] of [thumb v])': 'hand-position-y',

  // Speech & TTS
  '[speech] listen once': 'speech-listen', '[speech] last heard': 'speech-heard',
  '[tts] speak': 'tts-speak',

  // Translate
  '[tr] translate text': 'translate-text', '[tr] translation result': 'translate-result',

  // OCR
  '[ocr] scan text (sim)': 'ocr-scan', '[ocr] recognized text': 'ocr-text',

  // Image Classifier
  '[ic] turn classifier camera on': 'ic-camera-on', '[ic] analyse frame': 'ic-analyse',
  '[ic] top class': 'ic-top-class', '[ic] confidence score': 'ic-confidence',

  // Pose Classifier
  '[pc] turn pose camera on': 'pc-camera-on', '[pc] turn pose camera off': 'pc-camera-off',
  '[pc] capture pose sample': 'pc-capture', '[pc] pose name': 'pc-pose-name',
  '[pc] pose confidence': 'pc-confidence',

  // Audio Classifier
  '[ac] classify sound': 'ac-classify', '[ac] sound label': 'ac-label',

  // Text classifier
  '[tc] add training example': 'tc-add', '[tc] classify sentence': 'tc-classify',
  '[tc] prediction label': 'tc-label', '[tc] prediction confidence': 'tc-confidence',

  // ML environment
  '[ml] train classifier (sim)': 'ml-train', '[ml] training window open': 'ml-training-open',
  '[tts] speak': 'tts-speak',

  // Recognition cards
  '[rc] scan card (sim)': 'img-classify', '[rc] card label': 'img-class-label',

  // Chat
  '[chat] ask coding helper': 'chat-ask',

  // NLP
  '[nlp] analyse sentiment': 'nlp-sentiment', '[nlp] sentiment (0–1)': 'nlp-sentiment-val',
  '[nlp] is positive?': 'nlp-positive',

  // Pose classifier sample
  '[pose] sample pose': 'pc-capture',

  // Pen
  '[pen] down': 'pen-down', '[pen] up': 'pen-up', '[pen] clear': 'pen-clear',
  '[pen] set color': 'pen-set-color', '[pen] set size': 'pen-set-size',

  // Music
  '[music] play drum': 'music-drum', '[music] rest for beats': 'music-rest',
  '[music] play note for beats': 'music-note', '[music] set instrument to': 'music-instrument',
  '[music] set tempo to': 'music-tempo', '[music] change tempo by': 'music-tempo-change',
  '[music] tempo': 'music-get-tempo',

  // Video Sensing
  '[video] motion amount': 'video-motion', '[video] stage mirror': 'video-mirror',
  '[video] play clip': 'video-motion', '[video] pause': 'control-wait', '[video] seek sec': 'control-wait',

  // IoT / WiFi / ThingSpeak / HTTP / Weather / Webhook / QR / Log (stubs map to closest runtime blocks)
  '[wifi] connect to wi-fi': 'esp32-wifi', '[wifi] is wifi connected?': 'esp32-wifi',
  '[ts] create thingspeak channel': 'iot-send-data', '[ts] connect to thingspeak channel': 'iot-send-data',
  '[ts] send data to cloud': 'iot-send-data', '[ts] send multiple data to cloud': 'iot-send-data',
  '[ts] get data from thingspeak': 'iot-recv-data', '[ts] read data from field': 'iot-recv-data',
  '[http] make request': 'esp32-http-get', '[http] set body to': 'esp32-http-post',
  '[http] set content type to': 'esp32-http-post', '[http] get api response code': 'esp32-http-get',
  '[http] get body': 'esp32-http-get',
  '[weather] city': 'action-ask', '[weather] temperature': 'sense-answer', '[weather] condition': 'sense-answer',
  '[webhook] post json': 'esp32-http-post', '[webhook] get text': 'esp32-http-get',
  '[QR] Turn video on stage with () % transparency': 'qr-video-on',
  '[QR] Turn video on stage with': 'qr-video-on',
  '[QR] Show bounding box': 'qr-bounding-box',
  '[QR] Hide bounding box': 'qr-bounding-box',
  '[QR] Analyse image for QR code from camera': 'qr-analyse-camera',
  '[QR] Analyse image for QR from camera': 'qr-analyse-camera',
  '[QR] Is QR code detected?': 'qr-detected',
  '[QR] Get QR code data': 'qr-data',
  '[QR] Position of center': 'qr-position',
  '[QR] Get angle': 'qr-angle',
  '[qr] turn video on stage with': 'qr-video-on',
  '[qr] show bounding box': 'qr-bounding-box',
  '[qr] hide bounding box': 'qr-bounding-box',
  '[qr] analyse image for qr code from camera': 'qr-analyse-camera',
  '[qr] analyse image for qr from camera': 'qr-analyse-camera',
  '[qr] is qr code detected?': 'qr-detected',
  '[qr] get qr code data': 'qr-data',
  '[qr] x position of center': 'qr-position',
  '[qr] y position of center': 'qr-position',
  '[qr] get angle': 'qr-angle',
  '[qr] scan camera': 'qr-analyse-camera',
  '[qr] last payload': 'qr-data',
  '[log] add row': 'action-print', '[log] clear': 'action-print', '[log] row count': 'sense-answer',

  // Quarky Robot
  '[quarky] move [forward v] at () % speed': 'quarky-move', '[quarky] turn [left v] by () degrees': 'quarky-turn',
  '[quarky] stop': 'quarky-stop', '[quarky] set motor [left v] speed to () %': 'quarky-motor',
  '<is [quarky] button [a v] pressed?>': 'quarky-button', '(get [quarky] [obstacle v] sensor reading)': 'quarky-sensor',

  // Arduino
  'set digital pin () output [high v]': 'arduino-digital', 'read digital pin ()': 'arduino-read-digital',
  'read analog pin ()': 'arduino-read-analog', 'set pwm pin () output ()': 'arduino-pwm',
  'play tone on pin () with note [c4 v] for () beats': 'arduino-tone', 'set servo pin () degree ()': 'arduino-servo',

  // 3D Studio
  'add 3d object [cube v] name []': '3d-add', 'move 3d object [] along [x axis v] by ()': '3d-move',
  'set position of 3d object [] to x: () y: () z: ()': '3d-position', 'rotate 3d object [] on [y axis v] by () degrees': '3d-rotate',
  'scale 3d object [] to () %': '3d-scale', 'enable physics on 3d object []': '3d-physics',
  'when 3d object [] collides with 3d object []': '3d-collision', 'set 3d camera view mode to [orbit v]': '3d-camera',
};

/** e.g. event-start → bb_event_start (Blockly block type id). */
export function shortTypeToBlocklyType(short) {
  if (!short || typeof short !== 'string') return null;
  return `bb_${short.replace(/-/g, '_')}`;
}

/** Blockly block type id → Game Builder runtime type (BLOCK_DEFS key). */
export const BLOCKLY_TO_GAME_TYPE = {
  bb_event_start: 'event-start',
  bb_event_keypress: 'event-keypress',
  event_whenflagclicked: 'event-start',
  event_whenkeypressed: 'event-keypress',
  event_whenthisspriteclicked: 'event-click',
  control_forever: 'loop-forever',
  control_repeat: 'loop-repeat',
  control_wait: 'control-wait',
  motion_movesteps: 'sprite-move',
  motion_turnright: 'sprite-turn-right',
  motion_turnleft: 'sprite-turn-left',
  motion_gotoxy: 'sprite-goto',
  motion_glideto: 'sprite-glide',
  motion_pointindirection: 'sprite-point-dir',
  motion_pointtowards: 'sprite-point-towards',
  motion_changex: 'sprite-changex',
  motion_setx: 'sprite-setx',
  motion_changey: 'sprite-changey',
  motion_sety: 'sprite-sety',
  motion_ifonedgebounce: 'sprite-if-bounce',
  motion_setrotationstyle: 'sprite-rotation-style',
  motion_xposition: 'sprite-x-reporter',
  motion_yposition: 'sprite-y-reporter',
  motion_direction: 'sprite-direction-reporter',
  looks_sayforsecs: 'sprite-say',
  looks_say: 'looks-say',
  looks_thinkforsecs: 'sprite-think',
  looks_think: 'looks-think',
  looks_costumename: 'looks-costume',
  looks_nextcostume: 'looks-next-costume',
  looks_backdropname: 'looks-backdrop',
  looks_nextbackdrop: 'looks-next-backdrop',
  looks_changeSizeBy: 'looks-change-size',
  looks_setSizeTo: 'sprite-setsize',
  looks_changeEffectBy: 'looks-change-effect',
  looks_setEffectTo: 'looks-set-effect',
  looks_clearEffects: 'looks-clear-effects',
  looks_show: 'sprite-show',
  looks_hide: 'sprite-hide',
  looks_gotofrontback: 'looks-goto-layer',
  looks_goforwardbackwardlayers: 'looks-layer-step',
  looks_costumenumbername: 'looks-costume-reporter',
  looks_backdropnumbername: 'looks-backdrop-reporter',
  looks_size: 'sprite-size-reporter',
  sound_play: 'sound-play',
  sound_playuntildone: 'sound-play-until-done',
  sound_stopallsounds: 'sound-stop',
  sound_changeeffectby: 'sound-change-effect',
  sound_seteffectto: 'sound-set-effect',
  sound_cleareffects: 'sound-clear-effects',
  sound_setvolumeto: 'sound-set-volume',
  sound_volume: 'sound-get-volume',
  bb_sound_play: 'sound-play',
  bb_sound_stop: 'sound-stop',
  bb_sound_volume: 'sound-set-volume',
  control_wait: 'control-wait',
  control_repeat: 'loop-repeat',
  control_forever: 'loop-forever',
  control_if: 'logic-if',
  control_if_else: 'logic-if',
  control_waituntil: 'control-wait-until',
  control_repeatuntil: 'control-repeat-until',
  control_stop: 'control-stop',
  control_start_as_clone: 'event-clone',
  control_create_clone: 'control-create-clone',
  control_delete_this_clone: 'control-delete-clone',
  bb_control_wait: 'control-wait',
  bb_loop_repeat: 'loop-repeat',
  bb_loop_forever: 'loop-forever',
  bb_logic_if: 'logic-if',
  sensing_touchingobject: 'sense-touching',
  sensing_touchingcolor: 'sense-touching-color',
  sensing_coloristouchingcolor: 'sense-color-touching-color',
  sensing_distanceto: 'sense-distance',
  sensing_askandwait: 'action-ask',
  sensing_ask: 'action-ask',
  sensing_answer: 'sense-answer',
  sensing_keypressed: 'sense-key',
  sensing_mousedown: 'sense-mouse-down',
  sensing_mousex: 'sense-mouse-x',
  sensing_mousey: 'sense-mouse-y',
  sensing_setdragmode: 'sense-set-drag-mode',
  sensing_loudness: 'sense-loudness',
  sensing_timer: 'sense-timer',
  sensing_resettimer: 'sense-reset-timer',
  sensing_of: 'sense-of',
  sensing_current: 'sense-current',
  sensing_dayssince2000: 'sense-days-since-2000',
  sensing_username: 'sense-username',
  bb_sense_timer: 'sense-timer',
  bb_action_print: 'action-print',
  bb_math_add: 'math-add',
  bb_math_mult: 'math-mult',
  bb_math_random: 'math-random',
  bb_math_round: 'math-round',
  operator_add: 'math-add',
  operator_subtract: 'math-subtract',
  operator_multiply: 'math-mult',
  operator_divide: 'math-divide',
  operator_random: 'math-random',
  operator_round: 'math-round',
  operator_mathop: 'math-round',
  operator_mod: 'math-modulo',
  operator_compare: 'logic-compare',
  operator_gt: 'logic-compare',
  operator_lt: 'logic-compare',
  operator_equals: 'logic-compare',
  operator_and: 'logic-and',
  operator_or: 'logic-or',
  operator_not: 'logic-not',
  operator_join: 'text-join',
  operator_length: 'text-length',
  operator_letterof: 'text-letter',
  operator_contains: 'text-contains',
  data_setvariableto: 'var-set',
  data_changevariableby: 'var-change',
  data_showvariable: 'var-show',
  data_hidevariable: 'var-hide',
  bb_var_set: 'var-set',
  bb_var_change: 'var-change',
  data_addtolist: 'list-add',
  data_deleteoflist: 'list-delete',
  data_deletealloflist: 'list-delete-all',
  data_insertatlist: 'list-insert',
  data_replaceitemoflist: 'list-replace',
  data_itemoflist: 'list-item',
  data_itemnumoflist: 'list-index',
  data_lengthoflist: 'list-length',
  data_listcontainsitem: 'list-contains',
  data_showlist: 'list-show',
  data_hidelist: 'list-hide',
  bb_list_add: 'list-add',
  bb_func_define: 'func-define',
  bb_func_call: 'func-call',
  ...EXTENSION_BLOCKLY_TO_GAME,
};

/**
 * Resolve a Blockly type id to a runtime block type in BLOCK_DEFS.
 * Handles bb_lib_* stubs (via resolveBlocklyNodeType), bb_*, and motion_* ids.
 */
/**
 * Read a Blockly field or nested value block (e.g. math_number shadow) into a string/number.
 */
export function readBlocklyFieldOrValue(node, fields, key, fallback = undefined) {
  const f = fields || {};
  const keys = [key, String(key).toUpperCase(), String(key).toLowerCase()];
  for (const k of keys) {
    if (f[k] != null && String(f[k]).trim() !== '') return f[k];
  }
  const valNode = node?.values?.[key] ?? node?.values?.[String(key).toUpperCase()];
  if (!valNode) return fallback;
  const nested = valNode.fields || {};
  if (nested.NUM != null && String(nested.NUM).trim() !== '') return nested.NUM;
  if (nested.NUMBER != null && String(nested.NUMBER).trim() !== '') return nested.NUMBER;
  if (nested.TEXT != null && String(nested.TEXT).trim() !== '') return nested.TEXT;
  if (valNode.type === 'math_number' || valNode.type === 'math_positive_number') {
    return nested.NUM ?? nested.NUMBER ?? fallback;
  }
  return fallback;
}

export function blocklyTypeToGameType(blocklyType) {
  if (!blocklyType) return null;
  if (BLOCKLY_TO_GAME_TYPE[blocklyType]) return BLOCKLY_TO_GAME_TYPE[blocklyType];
  const extGame = extensionGameTypeForBlockly(blocklyType);
  if (extGame) return extGame;
  if (BLOCK_DEFS[blocklyType]) return blocklyType;
  if (typeof blocklyType === 'string' && blocklyType.startsWith('bb_')) {
    const internal = blocklyType.slice(3).replace(/_/g, '-');
    if (BLOCK_DEFS[internal]) return internal;
  }
  return null;
}

/** Library flyout nodes (bb_sidebar_item / bb_lib_* / bb_generic_stack) carry BLOCK_NAME or LABEL; map to real bb_* when possible. */
function blocklyTypeForShort(short) {
  if (!short) return null;
  return extensionBlocklyForShort(short) || shortTypeToBlocklyType(short);
}

export function resolveBlocklyNodeType(node) {
  if (!node?.type) return null;
  const t = node.type;
  const extDirect = extensionGameTypeForBlockly(t);
  if (extDirect) return t;

  if (t === 'bb_generic_stack') {
    const label = String(node.fields?.LABEL || node.fields?.BLOCK_NAME || '').trim().toLowerCase();
    const short = SIDEBAR_TO_TYPE[label];
    return short ? blocklyTypeForShort(short) : null;
  }
  if (t !== 'bb_sidebar_item' && !(typeof t === 'string' && t.startsWith('bb_lib_'))) {
    if (typeof t === 'string' && t.startsWith('bb_')) {
      const converted = t.slice(3).replace(/_/g, '-');
      if (BLOCK_DEFS[converted]) return t;
    }
    return t;
  }
  const label = String(node.fields?.BLOCK_NAME || node.fields?.LABEL || '').trim().toLowerCase();
  const short = SIDEBAR_TO_TYPE[label];
  return short ? blocklyTypeForShort(short) : null;
}

// Extension block parameter definitions
const EXTENSION_BLOCK_PARAMS = {
  '[tc] add training example': { category: 'text', label: 'text' },
  '[tc] classify sentence': { sentence: 'hello' },
  '[ic] analyse frame': {},
  '[pc] capture pose sample': {},
  '[ac] classify sound': {},
};

export function createBlockFromDrop(text, x, y) {
  const key = SIDEBAR_TO_TYPE[text.toLowerCase()] || null;
  const def = key ? BLOCK_DEFS[key] : null;
  if (def) {
    return { id: Date.now() + Math.random(), type: key, ...def, params: { ...def.params }, x, y };
  }
  // Extension blocks from sidebar (contain brackets like [TC])
  if (text.includes('[') && text.includes(']')) {
    const extParams = EXTENSION_BLOCK_PARAMS[text.toLowerCase()] || {};
    return { id: Date.now() + Math.random(), type: 'bb_extension_block', label: text, icon: '⚡', color: '#ec4899', x, y, params: { ...extParams } };
  }
  return { id: Date.now() + Math.random(), type: 'custom', label: text, icon: '⚡', color: '#f59e0b', category: 'custom', x, y, params: {} };
}

/* ─── SVG chrome for embedded inputs (pill / hex), Blockly-style ─── */
function pathInputPill(pw, ph) {
  const r = Math.min(ph / 2, 9);
  return `M ${r},0 H ${pw - r} A ${r},${r} 0 0 1 ${pw},${r} V ${ph - r} A ${r},${r} 0 0 1 ${pw - r},${ph} H ${r} A ${r},${r} 0 0 1 0,${ph - r} V ${r} A ${r},${r} 0 0 1 ${r},0 Z`;
}
function pathInputHex(pw, ph) {
  const inset = ph * 0.28;
  return `M ${inset},0 L ${pw - inset},0 L ${pw},${ph / 2} L ${pw - inset},${ph} L ${inset},${ph} L 0,${ph / 2} Z`;
}

/* ─── Inline editable param field ─── */
export function ParamInput({ value, onChange, width, color, fieldShape = 'pill' }) {
  const iw = Math.max(24, Number(width) || 50);
  const ph = 22;
  const pw = iw + 12;
  const d = fieldShape === 'hex' ? pathInputHex(pw, ph) : pathInputPill(pw, ph);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'middle',
        width: pw,
        height: ph,
        margin: '0 2px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={pw} height={ph} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
        <path d={d} fill="#ffffff" fillOpacity="0.96" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          border: 'none',
          padding: '2px 6px',
          color: '#575E75',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          width: iw,
          outline: 'none',
          textAlign: 'center',
          minHeight: '18px',
        }}
      />
    </span>
  );
}

export function ParamSelect({ value, onChange, options, width, fieldShape = 'pill' }) {
  const iw = Math.max(36, Number(width) || 64);
  const ph = 22;
  const pw = iw + 12;
  const d = fieldShape === 'hex' ? pathInputHex(pw, ph) : pathInputPill(pw, ph);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'middle',
        width: pw,
        height: ph,
        margin: '0 2px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={pw} height={ph} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
        <path d={d} fill="#ffffff" fillOpacity="0.96" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      <select
        value={String(value ?? options?.[0] ?? '')}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          border: 'none',
          padding: '2px 6px',
          color: '#575E75',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          width: iw,
          outline: 'none',
          textAlign: 'center',
          minHeight: '18px',
          appearance: 'none',
          cursor: 'pointer',
        }}
      >
        {(options || []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </span>
  );
}

/* ─── Render block content with inline inputs ─── */
export function BlockContent({ block, onParamChange, context = {} }) {
  const p = block.params || {};
  const keyOptions = ['space', 'up', 'down', 'left', 'right', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'a', 'b', 'w', 's', 'd'];
  const messageOptions = context.messageNames?.length ? context.messageNames : ['go', 'message1', 'start'];
  const variableOptions = context.variableNames?.length ? context.variableNames : ['myVar', 'score'];
  const PI = (paramKey, w) => (
    (paramKey === 'key' || paramKey === 'message' || paramKey === 'name' || paramKey === 'list'
      || paramKey === 'costume' || paramKey === 'backdrop' || paramKey === 'sound' || paramKey === 'effect')
      ? (
        <ParamSelect
          value={p[paramKey] || ''}
          onChange={(v) => onParamChange(block.id, paramKey, v)}
          width={w}
          options={
            paramKey === 'key'
              ? keyOptions
              : paramKey === 'message'
                ? messageOptions
                : paramKey === 'costume'
                  ? COSTUME_SELECT_OPTIONS
                  : paramKey === 'backdrop'
                    ? BACKDROP_SELECT_OPTIONS
                    : paramKey === 'sound'
                      ? ['pop', 'click', 'coin', 'laser', 'jump', 'win', 'lose', 'drum', 'bell', 'boing', 'zap', 'whoosh', 'meow']
                      : paramKey === 'effect'
                        ? ['pitch', 'pan']
                        : variableOptions
          }
        />
      )
      : (
        <ParamInput
          value={p[paramKey] || ''}
          onChange={(v) => onParamChange(block.id, paramKey, v)}
          width={w}
          color={block.color}
        />
      )
  );

  switch (block.type) {
    case 'var-create':  return <>{block.icon} Create{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-set':     return <>{block.icon} Set{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-change':  return <>{block.icon} Change{PI('name', 70)}by{PI('amount', 40)}</>;
    case 'var-show':    return <>{block.icon} Show{PI('name', 80)}</>;
    case 'logic-if':    return <>{block.icon} If{PI('condition', 120)}</>;
    case 'logic-and':   return <>{block.icon}{PI('left', 50)}{PI('op', 35)}{PI('right', 50)}</>;
    case 'logic-compare': return <>{block.icon}{PI('left', 50)}{PI('op', 30)}{PI('right', 50)}</>;
    case 'logic-bool': return (
      <>
        {block.icon}
        <ParamSelect
          value={p.value || 'true'}
          onChange={(v) => onParamChange(block.id, 'value', v)}
          width={56}
          fieldShape="hex"
          options={['true', 'false']}
        />
      </>
    );
    case 'loop-repeat': return <>{block.icon} Repeat{PI('times', 40)}times</>;
    case 'loop-forever': return <>{block.icon} Forever</>;
    case 'loop-while':  return <>{block.icon} While{PI('condition', 120)}</>;
    case 'loop-foreach': return <>{block.icon} For{PI('item', 50)}in{PI('list', 60)}</>;
    case 'loop-break':  return <>{block.icon} Break</>;
    case 'func-define': return <>{block.icon} Define{PI('name', 80)}</>;
    case 'func-call':   return <>{block.icon} Call{PI('name', 80)}</>;
    case 'func-return': return <>{block.icon} Return{PI('value', 60)}</>;
    case 'func-params': return <>{block.icon} Params{PI('params', 100)}</>;
    case 'action-print': return <>{block.icon} Print{PI('message', 120)}</>;
    case 'action-ask':  return <>{block.icon} Ask{PI('prompt', 130)}</>;
    case 'action-alert': return <>{block.icon} Alert{PI('message', 120)}</>;
    case 'math-add':
    case 'math-subtract':
      return <>{PI('a', 36)}{PI('op', 28)}{PI('b', 36)}</>;
    case 'math-mult':
    case 'math-divide':
      return <>{PI('a', 36)}{PI('op', 28)}{PI('b', 36)}</>;
    case 'math-modulo':
      return <>{PI('a', 36)}mod{PI('b', 36)}</>;
    case 'math-random':
      return <>pick random{PI('min', 32)}to{PI('max', 32)}</>;
    case 'math-round':
      return <>{PI('op', 56)}{PI('value', 40)}</>;
    case 'logic-or':
      return <>{PI('left', 44)}or{PI('right', 44)}</>;
    case 'logic-not':
      return <>not{PI('value', 44)}</>;
    case 'text-letter':
      return <>letter{PI('letter', 28)}of{PI('text', 72)}</>;
    case 'text-contains':
      return <>{PI('text', 64)}contains{PI('search', 48)}?</>;
    case 'text-create': return <>{block.icon} Text{PI('text', 100)}</>;
    case 'text-join':   return <>{block.icon} Join{PI('a', 60)}+{PI('b', 60)}</>;
    case 'text-length': return <>{block.icon} Length of{PI('text', 80)}</>;
    case 'list-create': return <>{block.icon} Create list{PI('name', 70)}</>;
    case 'list-add': return <>{block.icon} add{PI('item', 60)}to list{PI('list', 60)}</>;
    case 'list-delete': return <>{block.icon} delete{PI('index', 30)}of list{PI('list', 60)}</>;
    case 'list-delete-all': return <>{block.icon} delete all of{PI('list', 70)}</>;
    case 'list-insert': return <>{block.icon} insert{PI('item', 50)}at{PI('index', 28)}of list{PI('list', 55)}</>;
    case 'list-replace': return <>{block.icon} replace item{PI('index', 28)}of list{PI('list', 50)}with{PI('item', 50)}</>;
    case 'list-item': return <>( item{PI('index', 28)}of list{PI('list', 60)} )</>;
    case 'list-index': return <>( item # of{PI('item', 50)}in list{PI('list', 60)} )</>;
    case 'list-length': return <>( length of list{PI('list', 70)} )</>;
    case 'list-contains': return <>{PI('list', 60)}contains{PI('item', 50)}?</>;
    case 'list-show': return <>{block.icon} show list{PI('list', 70)}</>;
    case 'list-hide': return <>{block.icon} hide list{PI('list', 70)}</>;
    case 'list-get': return <>{block.icon} Get #{PI('index', 30)}from{PI('list', 60)}</>;
    case 'sprite-move': return <>{block.icon} Move{PI('steps', 40)}steps</>;
    case 'sprite-turn': return <>{block.icon} Turn{PI('degrees', 40)}°</>;
    case 'sprite-turn-right': return <>{block.icon} Turn clockwise{PI('degrees', 40)}°</>;
    case 'sprite-turn-left': return <>{block.icon} Turn anticlockwise{PI('degrees', 40)}°</>;
    case 'sprite-goto': return <>{block.icon} Go to x{PI('x', 35)}y{PI('y', 35)}</>;
    case 'sprite-changex': return <>{block.icon} Change X by{PI('amount', 40)}</>;
    case 'sprite-changey': return <>{block.icon} Change Y by{PI('amount', 40)}</>;
    case 'sprite-setsize': return <>{block.icon} Set size to{PI('size', 40)}%</>;
    case 'sprite-show': return <>{block.icon} Show</>;
    case 'sprite-hide': return <>{block.icon} Hide</>;
    case 'sprite-say':  return <>{block.icon} Say{PI('text', 80)}for{PI('secs', 25)}s</>;
    case 'control-wait': return <><span>⏱</span> Wait{PI('secs', 35)} seconds</>;
    case 'control-wait-until': return <><span>⏱</span> Wait until <span style={{ opacity: 0.5 }}>(condition)</span></>;
    case 'control-repeat-until': return <><span>🔁</span> Repeat until <span style={{ opacity: 0.5 }}>(condition)</span></>;
    case 'control-stop': return <><span>⏹</span> Stop{ParamSelect({ value: p.stopOption || 'all', onChange: (v) => onParamChange(block.id, 'stopOption', v), width: 120, options: ['all', 'this script', 'other scripts in sprite'] })}</>;
    case 'control-create-clone': return <><span>🧬</span> Create clone of{ParamSelect({ value: p.sprite || 'myself', onChange: (v) => onParamChange(block.id, 'sprite', v), width: 72, options: ['myself', 'Sprite1'] })}</>;
    case 'control-delete-clone': return <><span>💥</span> Delete this clone</>;
    case 'event-clone': return <><span>🧬</span> When I start as a clone</>;
    case 'sound-play': return <>{block.icon} Start sound{PI('sound', 72)}</>;
    case 'sound-play-until-done': return <>{block.icon} Play sound{PI('sound', 72)} until done</>;
    case 'sound-stop': return <>{block.icon} Stop all sounds</>;
    case 'sound-set-volume':
    case 'sound-volume': return <>{block.icon} Set volume to{PI('volume', 40)}%</>;
    case 'sound-get-volume': return <>{block.icon} volume</>;
    case 'sound-change-effect': return <>Change{PI('effect', 52)} effect by{PI('value', 40)}</>;
    case 'sound-set-effect': return <>Set{PI('effect', 52)} effect to{PI('value', 40)}</>;
    case 'sound-clear-effects': return <>{block.icon} Clear sound effects</>;
    case 'ai-classify': return <>{block.icon} Classify{PI('input', 100)}</>;
    case 'ai-generate': return <>{block.icon} Generate{PI('prompt', 120)}</>;
    case 'event-start': return <>{block.icon} When ▶ clicked</>;
    case 'event-keypress': return <>{block.icon} On key{PI('key', 55)}press</>;
    case 'event-click': return <>{block.icon} On this sprite clicked</>;
    case 'event-collision': return <>{block.icon} On collision with {PI('with', 70)}</>;
    case 'event-message': return <>{block.icon} On message{PI('message', 60)}</>;
    case 'event-broadcast': return <>{block.icon} Broadcast{PI('message', 60)}</>;
    case 'sense-touching': return <>{block.icon} Touching edge?</>;
    case 'sense-touching-sprite': return <>{block.icon} Touching{PI('sprite', 70)}?</>;
    case 'sense-key': return <>{block.icon} Key{PI('key', 60)}pressed?</>;
    case 'sense-mouse-x': return <>{block.icon} Mouse X</>;
    case 'sense-mouse-y': return <>{block.icon} Mouse Y</>;
    case 'sense-distance': return <>{block.icon} Distance to mouse</>;
    case 'sense-timer': return <>{block.icon} Timer</>;
    case 'sense-reset-timer': return <>{block.icon} Reset timer</>;
    case 'sprite-x-reporter': return <>{block.icon} X position</>;
    case 'sprite-y-reporter': return <>{block.icon} Y position</>;
    case 'sprite-direction-reporter': return <>{block.icon} Direction</>;
    case 'looks-say': return <>{block.icon} Say{PI('text', 80)}</>;
    case 'sprite-think': return <>{block.icon} Think{PI('text', 80)}for{PI('secs', 25)}s</>;
    case 'looks-think': return <>{block.icon} Think{PI('text', 80)}</>;
    case 'looks-costume': return <>{block.icon} Switch costume to{PI('costume', 50)}</>;
    case 'looks-change-size': return <>{block.icon} Change size by{PI('amount', 40)}</>;
    case 'looks-change-effect': return <>{block.icon} Change{PI('effect', 55)}effect by{PI('value', 40)}</>;
    case 'looks-set-effect': return <>{block.icon} Set{PI('effect', 55)}effect to{PI('value', 40)}</>;
    case 'looks-goto-layer': return <>{block.icon} Go to{PI('layer', 50)}layer</>;
    case 'looks-layer-step': return <>{block.icon} Go{PI('direction', 55)}{PI('layers', 30)}layers</>;
    case 'looks-next-costume': return <>{block.icon} Next costume</>;
    case 'looks-color-effect': return <>{block.icon} Color effect{PI('value', 40)}</>;
    case 'looks-ghost-effect': return <>{block.icon} Ghost effect{PI('value', 40)}</>;
    case 'looks-clear-effects': return <>{block.icon} Clear effects</>;
    case 'looks-grow': return <>{block.icon} Grow by{PI('amount', 40)}</>;
    case 'looks-shrink': return <>{block.icon} Shrink by{PI('amount', 40)}</>;
    case 'looks-front': return <>{block.icon} Go to front</>;
    case 'looks-back': return <>{block.icon} Go to back</>;
    case 'looks-backdrop': return <>{block.icon} Switch backdrop to{PI('backdrop', 72)}</>;
    case 'looks-next-backdrop': return <>{block.icon} Next backdrop</>;
    case 'looks-forward-layers': return <>{block.icon} Go forward{PI('layers', 40)}layers</>;
    case 'looks-costume-reporter': return <>{block.icon} Costume number</>;
    case 'looks-backdrop-reporter': return <>{block.icon} Backdrop number</>;
    case 'sprite-size-reporter': return <>{block.icon} Size</>;
    case 'physics-velocity': return <>{block.icon} Velocity X{PI('vx', 35)}Y{PI('vy', 35)}</>;
    case 'physics-gravity': return <>{block.icon} Gravity{PI('amount', 40)}</>;
    case 'physics-bounce': return <>{block.icon} Bounce off edges</>;
    case 'physics-friction': return <>{block.icon} Friction{PI('amount', 40)}</>;
    case 'physics-jump': return <>{block.icon} Physics jump{PI('power', 40)}</>;
    case 'physics-allow-double-jump': return (
      <>
        {block.icon}
        Allow double jump
        <ParamSelect
          value={p.enable === 'false' ? 'false' : 'true'}
          onChange={(v) => onParamChange(block.id, 'enable', v)}
          width={56}
          fieldShape="hex"
          options={['true', 'false']}
        />
      </>
    );
    case 'motion-jump': return <>{block.icon} Jump with power{PI('power', 40)}</>;
    case 'physics-push': return <>{block.icon} Push dir{PI('direction', 35)}force{PI('force', 35)}</>;
    case 'game-score-add': return <>{block.icon} Add{PI('amount', 40)}to score</>;
    case 'game-score-set': return <>{block.icon} Set score to{PI('value', 40)}</>;
    case 'game-lose-life': return <>{block.icon} Lose a life</>;
    case 'game-set-lives': return <>{block.icon} Set lives to{PI('value', 35)}</>;
    case 'game-over': return <>{block.icon} Game Over</>;
    case 'game-win': return <>{block.icon} You Win!</>;
    case 'game-next-level': return <>{block.icon} Next Level</>;
    case 'game-spawn': return <>{block.icon} Spawn clone of{PI('sprite', 60)}</>;
    case 'game-destroy': return <>{block.icon} Destroy this</>;
    case 'game-pause': return <>{block.icon} Pause game</>;
    case 'motion-glide': return <>{block.icon} Glide{PI('secs', 30)}s to x{PI('x', 35)}y{PI('y', 35)}</>;
    case 'motion-point': return <>{block.icon} Point toward mouse</>;
    case 'motion-point-dir': return <>{block.icon} Point dir{PI('direction', 40)}</>;
    case 'motion-setx': return <>{block.icon} Set X to{PI('x', 40)}</>;
    case 'motion-sety': return <>{block.icon} Set Y to{PI('y', 40)}</>;
    case 'motion-speed': return <>{block.icon} Speed{PI('speed', 40)}</>;
    case 'motion-rotation': return <>{block.icon} Set rotation to{PI('rotation', 40)}°</>;
    case 'motion-change-angle': return <>{block.icon} Change angle by{PI('angle', 40)}°</>;
    case 'motion-wrap': return <>{block.icon} Wrap around</>;
    case 'motion-stop': return <>{block.icon} Stop motion</>;
    case 'myblock-define': return <>{block.icon} Define{PI('name', 100)}</>;

    case 'myblock-run': return <>{block.icon} Run{PI('name', 100)}</>;
    // PEN
    case 'pen-erase': return <>{block.icon} Erase all</>;
    case 'pen-stamp': return <>{block.icon} Stamp</>;
    case 'pen-down': return <>{block.icon} Pen down</>;
    case 'pen-up': return <>{block.icon} Pen up</>;
    case 'pen-color': return <>{block.icon} Pen color{PI('color', 60)}</>;
    case 'pen-size': return <>{block.icon} Pen size{PI('size', 40)}</>;
    // TTS
    case 'tts-set-voice': return <>{block.icon} Voice{PI('voice', 80)}</>;
    case 'tts-set-language': return <>{block.icon} Language{PI('lang', 50)}</>;
    // FACE
    case 'face-detect': return <>{block.icon} Detect face</>;
    case 'face-x': return <>{block.icon} Face X</>;
    case 'face-y': return <>{block.icon} Face Y</>;
    case 'face-width': return <>{block.icon} Face width</>;
    case 'face-height': return <>{block.icon} Face height</>;
    case 'face-count': return <>{block.icon} Faces count</>;
    // OBJECT
    case 'object-detect': return <>{block.icon} Detect objects</>;
    case 'object-label': return <>{block.icon} Object label{PI('index', 35)}</>;
    case 'object-confidence': return <>{block.icon} Confidence{PI('index', 35)}</>;
    // POSE
    case 'pose-detect': return <>{block.icon} Detect pose</>;
    case 'pose-landmark-x': return <>{block.icon} Landmark X{PI('landmark', 35)}</>;
    case 'pose-landmark-y': return <>{block.icon} Landmark Y{PI('landmark', 35)}</>;
    // HAND
    case 'hand-detect': return <>{block.icon} Hand detected</>;
    case 'hand-gesture': return <>{block.icon} Gesture</>;
    // EMOTION
    case 'emotion-detect': return <>{block.icon} Emotion</>;
    case 'emotion-label': return <>{block.icon} Label</>;
    // ML
    case 'img-classify': return <>{block.icon} Classify</>;
    case 'img-class-label': return <>{block.icon} Class</>;
    case 'ml-train': return <>{block.icon} Train classifier (sim)</>;
    case 'ml-training-open': return <>{block.icon} Training window open</>;
    case 'ml-predict': return <>{block.icon} Predict{PI('input', 70)}</>;
    // CHATBOT
    case 'chatbot-ask': return <>{block.icon} Ask{PI('question', 100)}</>;
    case 'chatbot-response': return <>{block.icon} Response</>;
    // NLP
    case 'nlp-sentiment': return <>{block.icon} Sentiment{PI('text', 80)}</>;
    case 'nlp-keywords': return <>{block.icon} Keywords{PI('text', 80)}</>;
    case 'nlp-language': return <>{block.icon} Language{PI('text', 80)}</>;
    // ARDUINO
    case 'arduino-digital': return <>{block.icon} Digital{PI('pin', 35)}{PI('value', 30)}</>;
    case 'arduino-analog': return <>{block.icon} Analog{PI('pin', 35)}{PI('value', 30)}</>;
    case 'arduino-read-digital': return <>{block.icon} Read digital{PI('pin', 35)}</>;
    case 'arduino-read-analog': return <>{block.icon} Read analog{PI('pin', 35)}</>;
    case 'arduino-servo': return <>{block.icon} Servo{PI('pin', 35)}@{PI('angle', 40)}°</>;
    case 'arduino-buzzer': return <>{block.icon} Buzzer{PI('pin', 35)}{PI('freq', 40)}Hz</>;
    // MICROBIT
    case 'microbit-display': return <>{block.icon} Display{PI('text', 80)}</>;
    case 'microbit-button': return <>{block.icon} Button{PI('button', 50)}</>;
    case 'microbit-accel-x': return <>{block.icon} Accel X</>;
    case 'microbit-accel-y': return <>{block.icon} Accel Y</>;
    case 'microbit-accel-z': return <>{block.icon} Accel Z</>;
    case 'microbit-compass': return <>{block.icon} Compass</>;
    case 'microbit-temp': return <>{block.icon} Temp</>;
    case 'microbit-radio-send': return <>{block.icon} Radio send{PI('message', 70)}</>;
    case 'microbit-radio-recv': return <>{block.icon} Radio recv</>;
    // ESP32
    case 'esp32-wifi': return <>{block.icon} WiFi{PI('ssid', 70)}</>;
    case 'esp32-http-get': return <>{block.icon} GET{PI('url', 100)}</>;
    case 'esp32-http-post': return <>{block.icon} POST{PI('url', 80)}</>;
    case 'esp32-mqtt-pub': return <>{block.icon} Publish{PI('topic', 70)}</>;
    case 'esp32-mqtt-sub': return <>{block.icon} Subscribe{PI('topic', 70)}</>;
    // MOTOR
    case 'motor-forward': return <>{block.icon} Forward{PI('speed', 50)}</>;
    case 'motor-backward': return <>{block.icon} Backward{PI('speed', 50)}</>;
    case 'motor-stop': return <>{block.icon} Stop</>;
    case 'motor-turn-left': return <>{block.icon} Left{PI('speed', 50)}</>;
    case 'motor-turn-right': return <>{block.icon} Right{PI('speed', 50)}</>;
    // SERVO
    case 'servo-rotate': return <>{block.icon} Rotate{PI('angle', 50)}°</>;
    case 'servo-cont-rot': return <>{block.icon} Continuous{PI('speed', 50)}</>;
    // SENSORS
    case 'sensor-line': return <>{block.icon} Line sensor</>;
    case 'sensor-obstacle': return <>{block.icon} Obstacle</>;
    case 'sensor-distance': return <>{block.icon} Distance</>;
    case 'sensor-temperature': return <>{block.icon} Temperature</>;
    case 'sensor-humidity': return <>{block.icon} Humidity</>;
    case 'sensor-light': return <>{block.icon} Light</>;
    // DISPLAY
    case 'lcd-print': return <>{block.icon} LCD{PI('text', 80)}</>;
    case 'oled-print': return <>{block.icon} OLED{PI('text', 80)}</>;
    case 'lcd-clear': return <>{block.icon} Clear</>;
    // IOT
    case 'iot-relay-on': return <>{block.icon} Relay ON</>;
    case 'iot-relay-off': return <>{block.icon} Relay OFF</>;
    case 'iot-send-data': return <>{block.icon} Send{PI('data', 70)}</>;
    case 'iot-recv-data': return <>{block.icon} Receive</>;
    // GAMEPAD
    case 'gamepad-button': return <>{block.icon} Button{PI('button', 50)}</>;
    case 'gamepad-stick-x': return <>{block.icon} Stick X</>;
    case 'gamepad-stick-y': return <>{block.icon} Stick Y</>;
    // CLOUD
    case 'cloud-set': return <>{block.icon} Cloud{PI('var', 60)}={PI('value', 50)}</>;
    case 'cloud-get': return <>{block.icon} Cloud{PI('var', 60)}</>;
    default:            return <>{block.icon} {block.label}</>;
  }
}
