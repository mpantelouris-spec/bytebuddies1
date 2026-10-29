/**
 * robotProfiles.js — Robot Lab block definitions and the code each robot
 * (micro:bit, mBot, Arduino, Quarky) runs for every block. Kept separate from
 * the RobotPanel UI so it can be tested without hardware.
 */

/* ─── Robot command definitions ─── */
export const ROBOT_COMMANDS = [
  // Movement
  { cat: 'Movement', id: 'forward',    icon: '⬆️',  label: 'Forward',        color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'back',       icon: '⬇️',  label: 'Backward',       color: '#f59e0b', params: [{ key: 'amount',  label: 'steps', default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'move_left',  icon: '⬅️',  label: 'Move Left',      color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'move_right', icon: '➡️',  label: 'Move Right',     color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'left',       icon: '↺',   label: 'Turn Left',      color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '90',   type: 'number' }] },
  { cat: 'Movement', id: 'right',      icon: '↻',   label: 'Turn Right',     color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '90',   type: 'number' }] },
  { cat: 'Movement', id: 'spin_left',  icon: '↺',   label: 'Spin Left',      color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '360',  type: 'number' }] },
  { cat: 'Movement', id: 'spin_right', icon: '↻',   label: 'Spin Right',     color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '360',  type: 'number' }] },
  { cat: 'Movement', id: 'stop',       icon: '⏹️',  label: 'Stop',           color: '#f59e0b', params: [] },
  { cat: 'Movement', id: 'coast',      icon: '🌊',  label: 'Coast Stop',     color: '#f59e0b', params: [] },
  { cat: 'Movement', id: 'speed',      icon: '⚡',  label: 'Set Speed',      color: '#f59e0b', params: [{ key: 'pct',     label: '%',   default: '75',   type: 'number' }] },
  { cat: 'Movement', id: 'motor_l',    icon: '◀',   label: 'Motor Left',     color: '#f59e0b', params: [{ key: 'power',   label: '%',   default: '50',   type: 'number' }] },
  { cat: 'Movement', id: 'motor_r',    icon: '▶',   label: 'Motor Right',    color: '#f59e0b', params: [{ key: 'power',   label: '%',   default: '50',   type: 'number' }] },
  { cat: 'Movement', id: 'motors',     icon: '⚙️',  label: 'Both Motors',    color: '#f59e0b', params: [{ key: 'left',    label: 'L%',  default: '50',   type: 'number' }, { key: 'right', label: 'R%', default: '50', type: 'number' }] },

  // Sensors
  { cat: 'Sensors', id: 'if_dist',     icon: '📡',  label: 'If Distance <',  color: '#f59e0b', params: [{ key: 'cm',      label: 'cm',  default: '20',   type: 'number' }] },
  { cat: 'Sensors', id: 'if_line',     icon: '〰️',  label: 'If Line Found',  color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_btn_a',    icon: '🔘',  label: 'If Button A',    color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_btn_b',    icon: '🔘',  label: 'If Button B',    color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_touch',    icon: '👆',  label: 'If Touch Pin',   color: '#f59e0b', params: [{ key: 'pin',     label: 'pin', default: '0',    type: 'number' }] },
  { cat: 'Sensors', id: 'if_shake',    icon: '📳',  label: 'If Shaken',      color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_tilt',     icon: '📐',  label: 'If Tilted',      color: '#f59e0b', params: [{ key: 'dir', label: 'dir', default: 'left', type: 'select', options: ['left','right','forward','back'] }] },
  { cat: 'Sensors', id: 'if_light',    icon: '☀️',  label: 'If Light <',     color: '#f59e0b', params: [{ key: 'val',     label: 'lux', default: '100',  type: 'number' }] },
  { cat: 'Sensors', id: 'wait_dist',   icon: '⏳',  label: 'Wait Until Dist <', color: '#f59e0b', params: [{ key: 'cm',   label: 'cm',  default: '20',   type: 'number' }] },
  { cat: 'Sensors', id: 'wait_line',   icon: '⏳',  label: 'Wait for Line',  color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'read_dist',   icon: '📏',  label: 'Read Distance → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'dist', type: 'text' }] },
  { cat: 'Sensors', id: 'read_light',  icon: '💡',  label: 'Read Light → var',   color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'light', type: 'text' }] },
  { cat: 'Sensors', id: 'follow_line', icon: '🛤️',  label: 'Follow Line',    color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '3',    type: 'number' }] },
  { cat: 'Sensors', id: 'avoid_wall',  icon: '🧱',  label: 'Avoid Walls',    color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '5',    type: 'number' }] },
  { cat: 'Sensors', id: 'read_temp',   icon: '🌡️',  label: 'Read Temp → var',    color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'temp', type: 'text' }] },
  { cat: 'Sensors', id: 'read_compass',icon: '🧭',  label: 'Read Compass → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'heading', type: 'text' }] },
  { cat: 'Sensors', id: 'read_accel',  icon: '📐',  label: 'Read Accel → var',   color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'ax', type: 'text' }, { key: 'axis', label: 'axis', default: 'x', type: 'select', options: ['x','y','z'] }] },
  { cat: 'Sensors', id: 'read_btn_a',  icon: '🔘',  label: 'Read Button A → var',color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'btnA', type: 'text' }] },
  { cat: 'Sensors', id: 'read_btn_b',  icon: '🔘',  label: 'Read Button B → var',color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'btnB', type: 'text' }] },
  { cat: 'Sensors', id: 'if_temp',     icon: '🌡️',  label: 'If Temp >',      color: '#f59e0b', params: [{ key: 'val', label: '°C', default: '25', type: 'number' }] },
  { cat: 'Sensors', id: 'if_compass',  icon: '🧭',  label: 'If Heading >',   color: '#f59e0b', params: [{ key: 'val', label: '°', default: '180', type: 'number' }] },

  // Math
  { cat: 'Math', id: 'math_random',    icon: '🎲',  label: 'Random Number',  color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'n', type: 'text' }, { key: 'min', label: 'min', default: '1', type: 'number' }, { key: 'max', label: 'max', default: '10', type: 'number' }] },
  { cat: 'Math', id: 'math_abs',       icon: '±',   label: 'Abs Value',      color: '#f59e0b', params: [{ key: 'var', label: 'result', default: 'x', type: 'text' }, { key: 'src', label: 'of', default: 'x', type: 'text' }] },
  { cat: 'Math', id: 'math_map',       icon: '🗺️',  label: 'Map Value',      color: '#f59e0b', params: [{ key: 'var', label: 'result', default: 'mapped', type: 'text' }, { key: 'src', label: 'from', default: 'x', type: 'text' }, { key: 'low1', label: 'lo1', default: '0', type: 'number' }, { key: 'hi1', label: 'hi1', default: '100', type: 'number' }, { key: 'low2', label: 'lo2', default: '0', type: 'number' }, { key: 'hi2', label: 'hi2', default: '1023', type: 'number' }] },
  { cat: 'Math', id: 'math_constrain', icon: '📏',  label: 'Constrain',      color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'x', type: 'text' }, { key: 'min', label: 'min', default: '0', type: 'number' }, { key: 'max', label: 'max', default: '100', type: 'number' }] },
  { cat: 'Math', id: 'math_expr',      icon: '🧮',  label: 'Set var = expr', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'x', type: 'text' }, { key: 'expr', label: '=', default: 'x + 1', type: 'text' }] },

  // Control
  { cat: 'Control', id: 'on_start',    icon: '🚀',  label: 'On Start',       color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'wait',        icon: '⏱️',  label: 'Wait',           color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '1',    type: 'number' }] },
  { cat: 'Control', id: 'forever',     icon: '♾️',  label: 'Forever',        color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'repeat',      icon: '🔁',  label: 'Repeat',         color: '#f59e0b', params: [{ key: 'times',  label: 'x',   default: '3',    type: 'number' }] },
  { cat: 'Control', id: 'repeat_end',  icon: '🔚',  label: 'End Repeat',     color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'while_do',    icon: '🔄',  label: 'While',          color: '#f59e0b', params: [{ key: 'cond', label: 'var', default: 'x', type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '10', type: 'number' }] },
  { cat: 'Control', id: 'while_end',   icon: '🔚',  label: 'End While',      color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'for_range',   icon: '🔢',  label: 'Count',          color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'i', type: 'text' }, { key: 'from', label: 'from', default: '0', type: 'number' }, { key: 'to', label: 'to', default: '5', type: 'number' }] },
  { cat: 'Control', id: 'for_end',     icon: '🔚',  label: 'End Count',      color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'if_then',     icon: '🔀',  label: 'If / Then',      color: '#f59e0b', params: [{ key: 'cond',   label: 'var', default: 'dist',  type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '20', type: 'number' }] },
  { cat: 'Control', id: 'else_branch', icon: '↔️',  label: 'Else',           color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'else_if',     icon: '↔️',  label: 'Else If',        color: '#f59e0b', params: [{ key: 'cond', label: 'var', default: 'x', type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '0', type: 'number' }] },
  { cat: 'Control', id: 'if_end',      icon: '🔚',  label: 'End If',         color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'break',       icon: '✋',  label: 'Break Loop',     color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'stop_all',    icon: '🛑',  label: 'Stop Program',   color: '#f59e0b', params: [] },

  // Outputs
  { cat: 'Outputs', id: 'led',         icon: '💡',  label: 'LED Colour',     color: '#f59e0b', params: [{ key: 'color',  label: 'col', default: 'red',  type: 'select', options: ['red','green','blue','yellow','cyan','magenta','white','off'] }] },
  { cat: 'Outputs', id: 'led_bright',  icon: '🔆',  label: 'LED Brightness', color: '#f59e0b', params: [{ key: 'pct',    label: '%',   default: '100',  type: 'number' }] },
  { cat: 'Outputs', id: 'led_rgb',     icon: '🌈',  label: 'LED RGB',        color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Outputs', id: 'buzz',        icon: '🔔',  label: 'Buzzer',         color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '0.5',  type: 'number' }] },
  { cat: 'Outputs', id: 'play_note',   icon: '🎵',  label: 'Play Note',      color: '#f59e0b', params: [{ key: 'note', label: 'note', default: 'C4', type: 'select', options: ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'] }, { key: 'secs', label: 's', default: '0.5', type: 'number' }] },
  { cat: 'Outputs', id: 'play_melody', icon: '🎶',  label: 'Play Melody',    color: '#f59e0b', params: [{ key: 'melody', label: 'tune', default: 'happy', type: 'select', options: ['happy','sad','power_up','siren','birthday','twinkle'] }] },
  { cat: 'Outputs', id: 'display',     icon: '📟',  label: 'Show Text',      color: '#f59e0b', params: [{ key: 'text',   label: 'text', default: 'Hi!',  type: 'text' }] },
  { cat: 'Outputs', id: 'show_num',    icon: '🔢',  label: 'Show Number',    color: '#f59e0b', params: [{ key: 'num',    label: 'val',  default: '42',   type: 'number' }] },
  { cat: 'Outputs', id: 'show_icon',   icon: '😀',  label: 'Show Icon',      color: '#f59e0b', params: [{ key: 'icon', label: 'icon', default: 'HAPPY', type: 'select', options: ['HAPPY','SAD','HEART','SURPRISED','ANGRY','YES','NO','ARROW_N','ARROW_S','ARROW_E','ARROW_W','ASLEEP','CONFUSED','SKULL','DIAMOND'] }] },
  { cat: 'Outputs', id: 'clear_disp',  icon: '🧹',  label: 'Clear Display',  color: '#f59e0b', params: [] },

  // Servo & Actuators
  { cat: 'Servo', id: 'servo',         icon: '🔧',  label: 'Servo Angle',    color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'angle', label: '°', default: '90', type: 'number' }] },
  { cat: 'Servo', id: 'servo_sweep',   icon: '↔️',  label: 'Servo Sweep',    color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'from', label: 'from°', default: '0', type: 'number' }, { key: 'to', label: 'to°', default: '180', type: 'number' }] },
  { cat: 'Servo', id: 'servo_stop',    icon: '🔧',  label: 'Servo Stop',     color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pin_high',      icon: '⬆️',  label: 'Pin HIGH',       color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pin_low',       icon: '⬇️',  label: 'Pin LOW',        color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pwm',           icon: '〰️',  label: 'Set PWM',        color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'val', label: '0-255', default: '128', type: 'number' }] },

  // Variables
  { cat: 'Variables', id: 'var_set',   icon: '📦',  label: 'Set Variable',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'val', default: '0', type: 'number' }] },
  { cat: 'Variables', id: 'var_inc',   icon: '📈',  label: 'Increase Var',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'by',  default: '1', type: 'number' }] },
  { cat: 'Variables', id: 'var_dec',   icon: '📉',  label: 'Decrease Var',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'by',  default: '1', type: 'number' }] },
  { cat: 'Variables', id: 'var_show',  icon: '📊',  label: 'Show Variable',  color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }] },

  // Communication
  { cat: 'Comms', id: 'send_msg',      icon: '📤',  label: 'Send Message',   color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'hello', type: 'text' }] },
  { cat: 'Comms', id: 'radio_send',    icon: '📻',  label: 'Radio Send',     color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'go',    type: 'text' }] },
  { cat: 'Comms', id: 'radio_group',   icon: '📡',  label: 'Radio Group',    color: '#f59e0b', params: [{ key: 'grp', label: 'grp',  default: '1',     type: 'number' }] },
  { cat: 'Comms', id: 'radio_recv',    icon: '📥',  label: 'Read Radio → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'msg', type: 'text' }] },
  { cat: 'Comms', id: 'log',           icon: '🖨️',  label: 'Log to Serial',  color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'hello', type: 'text' }] },

  // Lights — NeoPixel / WS2812B strips and robot headlights
  { cat: 'Lights', id: 'neo_init',     icon: '💡',  label: 'NeoPixel Setup', color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'n', label: 'LEDs', default: '8', type: 'number' }] },
  { cat: 'Lights', id: 'neo_color',    icon: '🎨',  label: 'Set LED Color',  color: '#f59e0b', params: [{ key: 'idx', label: 'LED#', default: '0', type: 'number' }, { key: 'color', label: 'colour', default: 'red', type: 'select', options: ['red','green','blue','yellow','cyan','magenta','white','off'] }] },
  { cat: 'Lights', id: 'neo_rgb',      icon: '🌈',  label: 'Set LED RGB',    color: '#f59e0b', params: [{ key: 'idx', label: 'LED#', default: '0', type: 'number' }, { key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'neo_all',      icon: '✨',  label: 'Set All LEDs',   color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '0', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'neo_show',     icon: '▶️',  label: 'NeoPixel Show',  color: '#f59e0b', params: [] },
  { cat: 'Lights', id: 'neo_clear',    icon: '🗑️',  label: 'NeoPixel Off',   color: '#f59e0b', params: [] },
  { cat: 'Lights', id: 'neo_bright',   icon: '🔆',  label: 'NeoPixel Brightness', color: '#f59e0b', params: [{ key: 'pct', label: '%', default: '50', type: 'number' }] },
  { cat: 'Lights', id: 'headlight',    icon: '🔦',  label: 'Headlights Color', color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '255', type: 'number' }, { key: 'b', label: 'B', default: '255', type: 'number' }] },
  { cat: 'Lights', id: 'headlight_l',  icon: '◀️',  label: 'Left Headlight', color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'headlight_r',  icon: '▶️',  label: 'Right Headlight',color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '0', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '255', type: 'number' }] },
  { cat: 'Lights', id: 'disp_pixel',   icon: '🔲',  label: 'Set Pixel',      color: '#f59e0b', params: [{ key: 'x', label: 'x', default: '2', type: 'number' }, { key: 'y', label: 'y', default: '2', type: 'number' }, { key: 'bright', label: 'brightness', default: '9', type: 'number' }] },
  { cat: 'Lights', id: 'disp_image',   icon: '🖼️',  label: 'Show Image',     color: '#f59e0b', params: [{ key: 'icon', label: 'icon', default: 'HAPPY', type: 'select', options: ['HAPPY','SAD','HEART','SURPRISED','ANGRY','ASLEEP','CONFUSED','YES','NO','ARROW_N','ARROW_S','ARROW_E','ARROW_W','SKULL','DIAMOND','SNAKE','RABBIT','COW','DUCK','TORTOISE','BUTTERFLY','STICKFIGURE','GHOST','SWORD','TARGET','PITCHFORK','PACMAN','ROLLERSKATE','HOUSE','TSHIRT','CHESSBOARD','XMAS','UMBRELLA'], labels: ['😊 Happy','😢 Sad','❤️ Heart','😲 Surprised','😠 Angry','😴 Asleep','😕 Confused','✅ Yes','❌ No','⬆️ Arrow Up','⬇️ Arrow Down','➡️ Arrow Right','⬅️ Arrow Left','💀 Skull','💎 Diamond','🐍 Snake','🐰 Rabbit','🐮 Cow','🦆 Duck','🐢 Tortoise','🦋 Butterfly','🧍 Stick Figure','👻 Ghost','⚔️ Sword','🎯 Target','🔱 Pitchfork','👾 Pac-Man','⛸️ Rollerskate','🏠 House','👕 T-Shirt','♟️ Chessboard','🎄 Xmas','☂️ Umbrella'] }] },
  { cat: 'Lights', id: 'disp_scroll',  icon: '📜',  label: 'Scroll Text',    color: '#f59e0b', params: [{ key: 'text', label: 'text', default: 'Hello!', type: 'text' }] },
  { cat: 'Lights', id: 'disp_show',    icon: '📟',  label: 'Show Value',     color: '#f59e0b', params: [{ key: 'val', label: 'value', default: '42', type: 'text' }] },
  { cat: 'Lights', id: 'disp_clear',   icon: '🧹',  label: 'Clear Screen',   color: '#f59e0b', params: [] },

  // Sensors extras — line following, sonar read
  { cat: 'Sensors', id: 'read_line_l', icon: '◀️',  label: 'Read Left Line Sensor', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'lineL', type: 'text' }] },
  { cat: 'Sensors', id: 'read_line_r', icon: '▶️',  label: 'Read Right Line Sensor', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'lineR', type: 'text' }] },
  { cat: 'Sensors', id: 'read_sonar',  icon: '📡',  label: 'Read Sonar (cm) → var',  color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'dist', type: 'text' }] },
];

/** Board extensions are selected automatically with the board picker. Each profile
 * supplies the matching command/code generator; this metadata drives the palette UI. */
export const ROBOT_BOARD_EXTENSIONS = {
  microbit: { name: 'micro:bit', summary: 'Micro:bit sensors, display, radio, and robot-kit controls.' },
  quarky: { name: 'Quarky', summary: 'Quarky motors, line sensors, touch inputs, LEDs, and servos.' },
  mbot: { name: 'mBot', summary: 'mBot motor, light, sound, servo, and sketch commands.' },
  arduino: { name: 'Arduino', summary: 'Arduino motor-shield, pin, PWM, light, sound, and servo commands.' },
};

const QUARKY_UNSUPPORTED_BLOCKS = new Set([
  'if_dist', 'wait_dist', 'read_dist', 'read_sonar', 'avoid_wall',
  'if_shake', 'if_tilt', 'if_light', 'read_light', 'read_temp', 'read_compass',
  'read_accel', 'if_temp', 'if_compass', 'buzz', 'play_note', 'play_melody',
  'radio_send', 'radio_group', 'radio_recv',
]);

const APP_EXECUTED_BLOCKS = new Set([
  'if_dist', 'if_line', 'if_btn_a', 'if_btn_b', 'if_touch', 'if_light',
  'wait_dist', 'wait_line', 'read_dist', 'read_sonar', 'read_light',
  'read_line_l', 'read_line_r', 'read_btn_a', 'read_btn_b', 'follow_line', 'avoid_wall',
  'math_random', 'math_abs', 'math_map', 'math_constrain', 'math_expr',
  'var_set', 'var_inc', 'var_dec', 'var_show', 'on_start', 'forever', 'repeat',
  'repeat_end', 'while_do', 'while_end', 'for_range', 'for_end', 'if_then',
  'else_branch', 'else_if', 'if_end', 'break',
]);

/** Only show blocks that this board extension can generate or execute. */
export function getRobotCommandsForBoard(board) {
  const profile = ROBOT_PROFILES[board];
  if (!profile) return [];
  return ROBOT_COMMANDS.filter((command) => {
    if (board === 'quarky' && QUARKY_UNSUPPORTED_BLOCKS.has(command.id)) return false;
    const params = Object.fromEntries((command.params || []).map((param) => [param.key, param.default]));
    return Boolean(profile.buildCmd(command.id, params)) || APP_EXECUTED_BLOCKS.has(command.id);
  });
}

export const ROBOT_CATEGORY_COLORS = {
  Movement: '#3b82f6',
  Sensors: '#06b6d4',
  Control: '#f59e0b',
  Math: '#ef4444',
  Outputs: '#8b5cf6',
  Servo: '#f97316',
  Variables: '#22c55e',
  Comms: '#ec4899',
  Lights: '#eab308',
};

export function darkenHex(hex, amt = 34) {
  const v = String(hex || '').replace('#', '');
  if (v.length !== 6) return '#1f3f8a';
  const n = parseInt(v, 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 255) - amt);
  const b = Math.max(0, (n & 255) - amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Keep every block color aligned with its section.
ROBOT_COMMANDS.forEach((cmd) => {
  cmd.color = ROBOT_CATEGORY_COLORS[cmd.cat] || cmd.color;
});

/* ─── Sound helpers shared by the MicroPython boards ─── */
const NOTE_HZ = { C3: 131, D3: 147, E3: 165, F3: 175, G3: 196, A3: 220, B3: 247, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523 };
export const noteHz = (n) => NOTE_HZ[n] || 440;
// micro:bit MicroPython only has built-in tunes like music.POWER_UP; the rest are note lists.
const MICROBIT_MELODY = {
  happy: 'music.JUMP_UP',
  sad: 'music.WAWAWAWAA',
  power_up: 'music.POWER_UP',
  birthday: 'music.BIRTHDAY',
  siren: "['C5:2','G4:2','C5:2','G4:2','C5:2','G4:2']",
  twinkle: "['C4:2','C4:2','G4:2','G4:2','A4:2','A4:2','G4:4']",
};
export const microbitMelody = (m) => MICROBIT_MELODY[m] || MICROBIT_MELODY.happy;

/** Kits that lack a sensor or lights still get safe stand-ins, so every block runs. */
export const MICROBIT_FALLBACKS = [
  'import music',
  'import random',
  'import radio',
  'from neopixel import NeoPixel',
  'try:\n sonar\nexcept NameError:\n def sonar(): return 400',
  'try:\n ls\nexcept NameError:\n def ls(): return (0,0)',
  'try:\n hl\nexcept NameError:\n def hl(r,g,b): pass',
  'try:\n hl_l\nexcept NameError:\n def hl_l(r,g,b): hl(r,g,b)',
  'try:\n hl_r\nexcept NameError:\n def hl_r(r,g,b): hl(r,g,b)',
];

export const SERIAL_MELODY = {
  happy: 'NTE:523:150\nNTE:659:150\nNTE:784:300\n',
  sad: 'NTE:392:300\nNTE:330:300\nNTE:262:500\n',
  power_up: 'NTE:262:100\nNTE:330:100\nNTE:392:100\nNTE:523:300\n',
  siren: 'NTE:523:250\nNTE:392:250\nNTE:523:250\nNTE:392:250\n',
  birthday: 'NTE:262:300\nNTE:262:300\nNTE:294:600\nNTE:262:600\nNTE:349:600\nNTE:330:900\n',
  twinkle: 'NTE:262:300\nNTE:262:300\nNTE:392:300\nNTE:392:300\nNTE:440:300\nNTE:440:300\nNTE:392:600\n',
};

/**
 * mBot / Arduino serial commands — must match public/bytebuddies-mbot.ino and
 * public/bytebuddies-arduino.ino. Loops, ifs, variables and sensor checks run in
 * the app (which asks the robot for readings), so they send nothing here.
 */
const LED_RGB = { red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], yellow: [255, 255, 0], cyan: [0, 255, 255], magenta: [255, 0, 255], white: [255, 255, 255], off: [0, 0, 0] };
export function serialBuildCmd(cmd, params) {
  const p = params || {};
  const n = (v, d) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
  const rgb = (r, g, b) => `LDC:${n(r, 0)}:${n(g, 0)}:${n(b, 0)}\n`;
  switch (cmd) {
    case 'forward':     return `FWD:${n(p.amount, 20)}\n`;
    case 'back':        return `BWD:${n(p.amount, 20)}\n`;
    case 'left':        return `LFT:${n(p.degrees, 90)}\n`;
    case 'right':       return `RGT:${n(p.degrees, 90)}\n`;
    case 'spin_left':   return `SPL:${n(p.degrees, 360)}\n`;
    case 'spin_right':  return `SPR:${n(p.degrees, 360)}\n`;
    case 'move_left':   return `LFT:90\nFWD:${n(p.amount, 20)}\nRGT:90\n`;
    case 'move_right':  return `RGT:90\nFWD:${n(p.amount, 20)}\nLFT:90\n`;
    case 'stop':        return 'STP\n';
    case 'coast':       return 'CST\n';
    case 'stop_all':    return 'STP\n';
    case 'speed':       return `SPD:${n(p.pct, 75)}\n`;
    case 'motor_l':     return `ML:${n(p.power, 50)}\n`;
    case 'motor_r':     return `MR:${n(p.power, 50)}\n`;
    case 'motors':      return `MV:${n(p.left, 50)}:${n(p.right, 50)}\n`;
    case 'wait':        return `DLY:${Math.round((Number(p.secs) || 1) * 1000)}\n`;
    case 'led':         return `LED:${p.color || 'off'}\n`;
    case 'led_bright':  return `LDB:${n(p.pct, 100)}\n`;
    case 'led_rgb':     return rgb(p.r, p.g, p.b);
    case 'headlight': case 'headlight_l': case 'headlight_r': case 'neo_all': return rgb(p.r, p.g, p.b);
    case 'neo_rgb':     return rgb(p.r, p.g, p.b);
    case 'neo_color':   return `LED:${p.color || 'red'}\n`;
    case 'neo_clear':   return 'LED:off\n';
    case 'neo_bright':  return `LDB:${n(p.pct, 50)}\n`;
    case 'buzz':        return `BZZ:${Math.round((Number(p.secs) || 0.5) * 1000)}\n`;
    case 'play_note':   return `NTE:${noteHz(p.note)}:${Math.round((Number(p.secs) || 0.5) * 1000)}\n`;
    case 'play_melody': return SERIAL_MELODY[p.melody] || SERIAL_MELODY.happy;
    case 'servo':       return `SRV:${n(p.pin, 9)}:${n(p.angle, 90)}\n`;
    case 'servo_sweep': return `SWP:${n(p.pin, 9)}:${n(p.from, 0)}:${n(p.to, 180)}\n`;
    case 'servo_stop':  return `SRS:${n(p.pin, 9)}\n`;
    case 'pin_high':    return `PHI:${n(p.pin, 13)}\n`;
    case 'pin_low':     return `PLO:${n(p.pin, 13)}\n`;
    case 'pwm':         return `PWM:${n(p.pin, 6)}:${n(p.val, 128)}\n`;
    default:            return '';
  }
}

/* ─── Supported robot profiles ─── */
export const ROBOT_PROFILES = {
  microbit: {
    name: 'micro:bit',
    icon: '🔬',
    baud: 115200,
    buildCmd: (cmd, params) => {
      // Short commands sent to REPL — helper functions defined at connect time
      const p = params || {};
      const ms = (steps) => Math.round((steps||20)*10);
      const tms = (deg) => Math.round((deg||90)*5);
      switch (cmd) {
        case 'forward':    return `fw(${ms(p.amount)})\r\n`;
        case 'back':       return `bk(${ms(p.amount)})\r\n`;
        case 'left':       return `lt(${tms(p.degrees)})\r\n`;
        case 'right':      return `rt(${tms(p.degrees)})\r\n`;
        case 'spin_left':  return `lt(${tms(p.degrees)})\r\n`;
        case 'spin_right': return `rt(${tms(p.degrees)})\r\n`;
        case 'move_left':  return `lt(${ms(p.amount)})\r\n`;
        case 'move_right': return `rt(${ms(p.amount)})\r\n`;
        case 'stop':       return `sp()\r\n`;
        case 'coast':      return `sp()\r\n`;
        case 'speed':      return `# speed ${p.pct||75}%\r\n`;
        case 'motor_l':    return `pin0.write_analog(${Math.round((p.power||50)*10.23)})\r\n`;
        case 'motor_r':    return `pin2.write_analog(${Math.round((p.power||50)*10.23)})\r\n`;
        case 'motors':     return `pin0.write_analog(${Math.round((p.left||50)*10.23)});pin2.write_analog(${Math.round((p.right||50)*10.23)})\r\n`;
        case 'if_dist':    return `if sonar() < ${p.cm||20}:\r\n    `;
        case 'if_line':    return `if ls()[0] == 1:\r\n    `;
        case 'if_btn_a':   return `if button_a.is_pressed():\r\n    `;
        case 'if_btn_b':   return `if button_b.is_pressed():\r\n    `;
        case 'if_touch':   return `if pin${p.pin||0}.is_touched():\r\n    `;
        case 'if_shake':   return `if accelerometer.is_gesture('shake'):\r\n    `;
        case 'if_tilt':    return `if accelerometer.is_gesture('${p.dir||'left'}'):\r\n    `;
        case 'if_light':   return `if display.read_light_level() < ${p.val||100}:\r\n    `;
        case 'wait_dist':  return `while sonar() >= ${p.cm||20}: sleep(50)\r\n`;
        case 'wait_line':  return `while ls()[0] == 0: sleep(50)\r\n`;
        case 'read_dist':  return `${p.var||'dist'} = sonar()\r\n`;
        case 'read_light': return `${p.var||'light'} = display.read_light_level()\r\n`;
        case 'follow_line':return `fw(${Math.round((p.secs||3)*1000)})\r\n`;
        case 'avoid_wall': return `sp()\r\n`;
        case 'wait':       return `sleep(${Math.round((p.secs||1)*1000)})\r\n`;
        case 'repeat':     return `for _i in range(${p.times||3}):\r\n`;
        case 'repeat_end': return `pass\r\n`;
        case 'if_then':    { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `if ${p.cond||'dist'} ${op} ${p.val||20}:\r\n`; }
        case 'if_end':     return `pass\r\n`;
        case 'forever':    return `while True:\r\n`;
        case 'break':      return `break\r\n`;
        case 'stop_all':   return `sp()\r\n`;
        case 'led':        return `display.set_pixel(2,2,${(p.color||'off')!=='off'?9:0})\r\n`;
        case 'led_bright': return `# brightness ${p.pct}\r\n`;
        case 'led_rgb':    return `display.set_pixel(2,2,9)\r\n`;
        case 'buzz':       return `music.pitch(440,${Math.round((p.secs||0.5)*1000)})\r\n`;
        case 'play_note':  return `music.pitch(${noteHz(p.note)},${Math.round((p.secs||0.5)*1000)})\r\n`;
        case 'play_melody':return `music.play(${microbitMelody(p.melody)})\r\n`;
        case 'display':    return `display.scroll('${p.text||'Hi!'}')\r\n`;
        case 'show_num':   return `display.show(str(${p.num||42}))\r\n`;
        case 'show_icon':  return `display.show(Image.${p.icon||'HAPPY'})\r\n`;
        case 'clear_disp': return `display.clear()\r\n`;
        case 'servo':      return `pin${p.pin||0}.write_analog(int(${p.angle||90}/180*1023))\r\n`;
        case 'servo_sweep':return `pin${p.pin||0}.write_analog(int(${p.to||180}/180*1023))\r\n`;
        case 'servo_stop': return `pin${p.pin||0}.write_digital(0)\r\n`;
        case 'pin_high':   return `pin${p.pin||0}.write_digital(1)\r\n`;
        case 'pin_low':    return `pin${p.pin||0}.write_digital(0)\r\n`;
        case 'pwm':        return `pin${p.pin||0}.write_analog(${p.val||128})\r\n`;
        case 'var_set':    return `${p.name||'x'} = ${p.val||0}\r\n`;
        case 'var_inc':    return `${p.name||'x'} += ${p.val||1}\r\n`;
        case 'var_dec':    return `${p.name||'x'} -= ${p.val||1}\r\n`;
        case 'var_show':   return `display.scroll(str(${p.name||'x'}))\r\n`;
        case 'send_msg':   return `uart.write('${p.msg||'hello'}\\n')\r\n`;
        case 'radio_send': return `radio.on();radio.send('${p.msg||'go'}')\r\n`;
        case 'radio_group':return `radio.config(group=${p.grp||1})\r\n`;
        case 'radio_recv': return `${p.var||'msg'} = radio.receive()\r\n`;
        case 'log':        return `print('${p.msg||'hello'}')\r\n`;
        // Lights — NeoPixel / display / headlights
        case 'neo_init':    return `_np = NeoPixel(pin${p.pin||0}, ${p.n||8})\r\n`;
        case 'neo_color':   { const cols = {red:'(255,0,0)',green:'(0,255,0)',blue:'(0,0,255)',yellow:'(255,255,0)',cyan:'(0,255,255)',magenta:'(255,0,255)',white:'(255,255,255)',off:'(0,0,0)'}; return `_np[${p.idx||0}] = ${cols[p.color||'red']||'(255,0,0)'}\r\n`; }
        case 'neo_rgb':     return `_np[${p.idx||0}] = (${p.r||255}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'neo_all':     return `for _i in range(len(_np)): _np[_i] = (${p.r||0}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'neo_show':    return `_np.show()\r\n`;
        case 'neo_clear':   return `_np.clear()\r\n`;
        case 'neo_bright':  return `# brightness ${p.pct||50}% (set per-pixel: multiply values by ${p.pct||50}/100)\r\n`;
        case 'headlight':   return `hl(${p.r||255}, ${p.g||255}, ${p.b||255})\r\n`;
        case 'headlight_l': return `hl_l(${p.r||255}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'headlight_r': return `hl_r(${p.r||0}, ${p.g||0}, ${p.b||255})\r\n`;
        case 'disp_pixel':  return `display.set_pixel(${p.x||2}, ${p.y||2}, ${p.bright||9})\r\n`;
        case 'disp_image':  return `display.show(Image.${p.icon||'HAPPY'})\r\n`;
        case 'disp_scroll': return `display.scroll('${p.text||'Hello!'}')\r\n`;
        case 'disp_show':   return `display.show(str(${p.val||42}))\r\n`;
        case 'disp_clear':  return `display.clear()\r\n`;
        // Extra sensors
        case 'read_line_l': return `${p.var||'lineL'}, _ = ls()\r\n`;
        case 'read_line_r': return `_, ${p.var||'lineR'} = ls()\r\n`;
        case 'read_sonar':  return `${p.var||'dist'} = sonar()\r\n`;
        // New control flow
        case 'on_start':      return `# --- on start ---\r\n`;
        case 'while_do':      { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `while ${p.cond||'x'} ${op} ${p.val||10}:\r\n`; }
        case 'while_end':     return `pass\r\n`;
        case 'for_range':     return `for ${p.var||'i'} in range(${p.from||0}, ${parseInt(p.to||5)+1}):\r\n`;
        case 'for_end':       return `pass\r\n`;
        case 'else_branch':   return `else:\r\n`;
        case 'else_if':       { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `elif ${p.cond||'x'} ${op} ${p.val||0}:\r\n`; }
        // New sensors
        case 'read_temp':     return `${p.var||'temp'} = temperature()\r\n`;
        case 'read_compass':  return `${p.var||'heading'} = compass.heading()\r\n`;
        case 'read_accel':    return `${p.var||'ax'} = accelerometer.get_${p.axis||'x'}()\r\n`;
        case 'read_btn_a':    return `${p.var||'btnA'} = button_a.is_pressed()\r\n`;
        case 'read_btn_b':    return `${p.var||'btnB'} = button_b.is_pressed()\r\n`;
        case 'if_temp':       return `if temperature() > ${p.val||25}:\r\n`;
        case 'if_compass':    return `if compass.heading() > ${p.val||180}:\r\n`;
        // Math
        case 'math_random':   return `${p.var||'n'} = random.randint(${p.min||1}, ${p.max||10})\r\n`;
        case 'math_abs':      return `${p.var||'x'} = abs(${p.src||p.var||'x'})\r\n`;
        case 'math_map':      return `${p.var||'mapped'} = int((${p.src||'x'} - ${p.low1||0}) * (${p.hi2||1023} - ${p.low2||0}) / max(1, ${p.hi1||100} - ${p.low1||0}) + ${p.low2||0})\r\n`;
        case 'math_constrain':return `${p.var||'x'} = max(${p.min||0}, min(${p.max||100}, ${p.var||'x'}))\r\n`;
        case 'math_expr':     return `${p.var||'x'} = ${p.expr||'x + 1'}\r\n`;
        default: return '';
      }
    },
    codeHeader: '# micro:bit MicroPython\nfrom microbit import *\nimport music, radio\n\n',
    setupCode: `# ✅ No flashing needed!\n# ByteBuddies connects directly to the micro:bit MicroPython REPL via USB.\n# Just plug in your micro:bit, click "Connect Robot", select the USB serial port, and press Run.\n#\n# The Robot class below is sent automatically at connect time.\n# For reference, here is what gets defined on the micro:bit:\n\nfrom microbit import *\nimport utime\n\nclass Robot:\n    def __init__(self): self.speed = 75\n    def drive(self, dist):\n        pin0.write_digital(1); pin1.write_digital(0 if dist>0 else 1)\n        pin2.write_digital(1); pin3.write_digital(1 if dist>0 else 0)\n        utime.sleep_ms(abs(dist)); self.stop()\n    def turn(self, deg):\n        pin0.write_digital(1); pin1.write_digital(1 if deg<0 else 0)\n        pin2.write_digital(1); pin3.write_digital(0 if deg<0 else 1)\n        utime.sleep_ms(abs(int(deg*5))); self.stop()\n    def stop(self): pin0.write_digital(0); pin2.write_digital(0)\n    def set_speed(self, pct): self.speed = pct\n\nrobot = Robot()\ndisplay.show(Image.HAPPY)\n`,
  },
  mbot: {
    name: 'mBot',
    icon: '🤖',
    baud: 9600,
    buildCmd: serialBuildCmd,
    codeHeader: '// mBot commands (one per line — the robot replies OK when done)\n\n',
    sketchUrl: '/bytebuddies-mbot.ino',
  },
  arduino: {
    name: 'Arduino',
    icon: '⚙️',
    baud: 9600,
    buildCmd: serialBuildCmd,
    codeHeader: '// Arduino commands (one per line — the robot replies OK when done)\n\n',
    sketchUrl: '/bytebuddies-arduino.ino',
  },
  quarky: {
    name: 'Quarky',
    icon: '🤖',
    baud: 115200,
    buildCmd: (cmd, params) => {
      // ESP32 MicroPython commands for Quarky
      const p = params || {};
      const ms  = (steps) => Math.round((steps||20)*10);
      const tms = (deg)   => Math.round((deg||90)*5);
      const colMap = { red:'255,0,0', green:'0,255,0', blue:'0,0,255', yellow:'255,255,0',
                       cyan:'0,255,255', magenta:'255,0,255', white:'255,255,255', off:'0,0,0' };
      const iconCol = { HAPPY:'0,255,0', SAD:'255,0,0', HEART:'255,0,100', ANGRY:'255,80,0',
                        YES:'0,255,0', NO:'255,0,0', ARROW_N:'0,0,255' };
      switch (cmd) {
        case 'forward':    return `fw(${ms(p.amount)})\r\n`;
        case 'back':       return `bk(${ms(p.amount)})\r\n`;
        case 'left':       return `lt(${tms(p.degrees)})\r\n`;
        case 'right':      return `rt(${tms(p.degrees)})\r\n`;
        case 'spin_left':  return `lt(${tms(p.degrees)})\r\n`;
        case 'spin_right': return `rt(${tms(p.degrees)})\r\n`;
        case 'move_left':  return `lt(${ms(p.amount)})\r\n`;
        case 'move_right': return `rt(${ms(p.amount)})\r\n`;
        case 'stop':       return `sp()\r\n`;
        case 'coast':      return `sp()\r\n`;
        case 'speed':      return `# speed ${p.pct||75}%\r\n`;
        case 'motor_l':    return `_d(_LA,${Math.round((p.power||50)*10.23)});_d(_LB,0)\r\n`;
        case 'motor_r':    return `_d(_RA,${Math.round((p.power||50)*10.23)});_d(_RB,0)\r\n`;
        case 'motors':     return `_d(_LA,${Math.round((p.left||50)*10.23)});_d(_LB,0);_d(_RA,${Math.round((p.right||50)*10.23)});_d(_RB,0)\r\n`;
        case 'if_dist':    return `if ls()[0]==1 or ls()[1]==1:\r\n    `;
        case 'if_line':    return `if ls()[0]==1:\r\n    `;
        case 'if_btn_a':   return `if not Pin(0,Pin.IN,Pin.PULL_UP).value():\r\n    `;
        case 'if_btn_b':   return `if not Pin(35,Pin.IN,Pin.PULL_UP).value():\r\n    `;
        case 'if_touch':   return `if Pin(${p.pin||4},Pin.IN).value():\r\n    `;
        case 'if_shake':   return `if True:  # shake gesture not available on Quarky\r\n    `;
        case 'if_tilt':    return `if True:  # tilt gesture not available on Quarky\r\n    `;
        case 'if_light':   return `if True:  # light sensor not available on Quarky\r\n    `;
        case 'wait_dist':  return `while ls()[0]==0 and ls()[1]==0: time.sleep_ms(50)\r\n`;
        case 'wait_line':  return `while ls()[0]==0: time.sleep_ms(50)\r\n`;
        case 'read_dist':  return `${p.var||'dist'} = 0  # no sonar on Quarky\r\n`;
        case 'read_light': return `${p.var||'light'} = 0  # no light sensor\r\n`;
        case 'follow_line':return `fw(${Math.round((p.secs||3)*1000)})\r\n`;
        case 'avoid_wall': return `sp()\r\n`;
        case 'wait':       return `time.sleep_ms(${Math.round((p.secs||1)*1000)})\r\n`;
        case 'repeat':     return `for _i in range(${p.times||3}):\r\n`;
        case 'repeat_end': return `pass\r\n`;
        case 'if_then':    { const op=(p.op||'<')==='='?'==':(p.op||'<'); return `if ${p.cond||'x'} ${op} ${p.val||20}:\r\n`; }
        case 'if_end':     return `pass\r\n`;
        case 'forever':    return `while True:\r\n`;
        case 'break':      return `break\r\n`;
        case 'stop_all':   return `sp()\r\n`;
        case 'led':        return `hl(${colMap[p.color||'red']||'255,0,0'})\r\n`;
        case 'led_bright': return `# brightness ${p.pct||100}%\r\n`;
        case 'led_rgb':    return `hl(${p.r||255},${p.g||0},${p.b||0})\r\n`;
        case 'buzz':       return `# buzzer: ${p.secs||0.5}s (not available on Quarky)\r\n`;
        case 'play_note':  return `# note (not available on Quarky)\r\n`;
        case 'play_melody':return `# melody (not available on Quarky)\r\n`;
        case 'display':    return `print('${(p.text||'Hi!').replace(/'/g,"\\'")}' )\r\n`;
        case 'show_num':   return `print(${p.num||42})\r\n`;
        case 'show_icon':  return `hl(${iconCol[p.icon||'HAPPY']||'0,255,0'})\r\n`;
        case 'clear_disp': return `hl(0,0,0)\r\n`;
        case 'servo':      return `_s${p.pin||1}=PWM(Pin(${p.pin===2?17:16}),freq=50,duty=int(40+${p.angle||90}/180*102));time.sleep_ms(300);_s${p.pin||1}.deinit()\r\n`;
        case 'servo_sweep':return `_s${p.pin||1}=PWM(Pin(${p.pin===2?17:16}),freq=50,duty=int(40+${p.to||180}/180*102));time.sleep_ms(300);_s${p.pin||1}.deinit()\r\n`;
        case 'servo_stop': return `Pin(${p.pin===2?17:16},Pin.OUT).value(0)\r\n`;
        case 'pin_high':   return `Pin(${p.pin||0},Pin.OUT).value(1)\r\n`;
        case 'pin_low':    return `Pin(${p.pin||0},Pin.OUT).value(0)\r\n`;
        case 'pwm':        return `PWM(Pin(${p.pin||0}),freq=1000,duty=${p.val||128})\r\n`;
        case 'var_set':    return `${p.name||'x'} = ${p.val||0}\r\n`;
        case 'var_inc':    return `${p.name||'x'} += ${p.val||1}\r\n`;
        case 'var_dec':    return `${p.name||'x'} -= ${p.val||1}\r\n`;
        case 'var_show':   return `print(${p.name||'x'})\r\n`;
        case 'send_msg':   return `print('${(p.msg||'hello').replace(/'/g,"\\'")}' )\r\n`;
        case 'radio_send': return `print('radio:${(p.msg||'go').replace(/'/g,"\\'")}' )\r\n`;
        case 'radio_group':return `# radio group ${p.grp||1} (WiFi/BLE not set up here)\r\n`;
        case 'radio_recv': return `${p.var||'msg'} = None  # radio not available\r\n`;
        case 'log':        return `print('${(p.msg||'hello').replace(/'/g,"\\'")}' )\r\n`;
        case 'neo_init':   return `_NP2=neopixel.NeoPixel(Pin(${p.pin||0}),${p.n||8})\r\n`;
        case 'neo_color':  { const c=colMap[p.color||'red']||'255,0,0'; return `_NP[${p.idx||0}]=(${c});_NP.write()\r\n`; }
        case 'neo_rgb':    return `_NP[${p.idx||0}]=(${p.r||255},${p.g||0},${p.b||0});_NP.write()\r\n`;
        case 'neo_all':    return `hl(${p.r||0},${p.g||0},${p.b||0})\r\n`;
        case 'neo_show':   return `_NP.write()\r\n`;
        case 'neo_clear':  return `hl(0,0,0)\r\n`;
        case 'neo_bright': return `# brightness ${p.pct||50}%\r\n`;
        case 'headlight':  return `hl(${p.r||255},${p.g||255},${p.b||255})\r\n`;
        case 'headlight_l':return `_NP[0]=(${p.r||255},${p.g||0},${p.b||0});_NP.write()\r\n`;
        case 'headlight_r':return `_NP[34]=(${p.r||0},${p.g||0},${p.b||255});_NP.write()\r\n`;
        case 'disp_pixel': return `_NP[${p.x||0}+${p.y||0}*7]=(255,255,255);_NP.write()\r\n`;
        case 'disp_image': return `hl(${iconCol[p.icon||'HAPPY']||'0,255,0'})\r\n`;
        case 'disp_scroll':return `print('${(p.text||'Hello!').replace(/'/g,"\\'")}' )\r\n`;
        case 'disp_show':  return `print(${p.val||42})\r\n`;
        case 'disp_clear': return `hl(0,0,0)\r\n`;
        case 'read_line_l':return `${p.var||'lineL'},_ = ls()\r\n`;
        case 'read_line_r':return `_,${p.var||'lineR'} = ls()\r\n`;
        case 'read_sonar': return `${p.var||'dist'} = 0  # no sonar on Quarky\r\n`;
        case 'on_start':   return `# --- on start ---\r\n`;
        case 'while_do':   { const op=(p.op||'<')==='='?'==':(p.op||'<'); return `while ${p.cond||'x'} ${op} ${p.val||10}:\r\n`; }
        case 'while_end':  return `pass\r\n`;
        case 'for_range':  return `for ${p.var||'i'} in range(${p.from||0}, ${parseInt(p.to||5)+1}):\r\n`;
        case 'for_end':    return `pass\r\n`;
        case 'else_branch':return `else:\r\n`;
        case 'else_if':    { const op=(p.op||'<')==='='?'==':(p.op||'<'); return `elif ${p.cond||'x'} ${op} ${p.val||0}:\r\n`; }
        case 'read_temp':  return `${p.var||'temp'} = 0  # temp sensor not available\r\n`;
        case 'read_compass':return `${p.var||'heading'} = 0  # compass not available\r\n`;
        case 'read_accel': return `${p.var||'ax'} = 0  # accelerometer not available\r\n`;
        case 'read_btn_a': return `${p.var||'btnA'} = not Pin(0,Pin.IN,Pin.PULL_UP).value()\r\n`;
        case 'read_btn_b': return `${p.var||'btnB'} = not Pin(35,Pin.IN,Pin.PULL_UP).value()\r\n`;
        case 'if_temp':    return `if True:  # temp sensor not available\r\n`;
        case 'if_compass': return `if True:  # compass not available\r\n`;
        case 'math_random':return `${p.var||'n'} = random.randint(${p.min||1}, ${p.max||10})\r\n`;
        case 'math_abs':   return `${p.var||'x'} = abs(${p.src||p.var||'x'})\r\n`;
        case 'math_map':   return `${p.var||'mapped'} = int((${p.src||'x'} - ${p.low1||0}) * (${p.hi2||1023} - ${p.low2||0}) / max(1, ${p.hi1||100} - ${p.low1||0}) + ${p.low2||0})\r\n`;
        case 'math_constrain':return `${p.var||'x'} = max(${p.min||0}, min(${p.max||100}, ${p.var||'x'}))\r\n`;
        case 'math_expr':  return `${p.var||'x'} = ${p.expr||'x + 1'}\r\n`;
        default: return '';
      }
    },
    codeHeader: '# Quarky (ESP32 MicroPython)\nfrom machine import Pin, PWM\nimport time, neopixel, random\n\n',
    setupCode: `# Quarky — ByteBuddies Setup\n# Flash MicroPython to your Quarky first (see setup guide below)\n\nfrom machine import Pin, PWM\nimport time, neopixel\n\n# Motor driver pins — Left: GPIO26/27, Right: GPIO14/12\n_LA = PWM(Pin(26), freq=1000, duty=0)  # Left forward\n_LB = PWM(Pin(27), freq=1000, duty=0)  # Left backward\n_RA = PWM(Pin(14), freq=1000, duty=0)  # Right forward\n_RB = PWM(Pin(12), freq=1000, duty=0)  # Right backward\n_NP = neopixel.NeoPixel(Pin(5), 35)   # 35-LED matrix\n\ndef sp(): _LA.duty(0); _LB.duty(0); _RA.duty(0); _RB.duty(0)\ndef fw(ms): _LA.duty(800); _LB.duty(0); _RA.duty(800); _RB.duty(0); time.sleep_ms(ms); sp()\ndef bk(ms): _LA.duty(0); _LB.duty(800); _RA.duty(0); _RB.duty(800); time.sleep_ms(ms); sp()\ndef lt(ms): _LA.duty(0); _LB.duty(600); _RA.duty(800); _RB.duty(0); time.sleep_ms(ms); sp()\ndef rt(ms): _LA.duty(800); _LB.duty(0); _RA.duty(0); _RB.duty(600); time.sleep_ms(ms); sp()\ndef hl(r, g, b):\n    for i in range(35): _NP[i] = (r, g, b)\n    _NP.write()\ndef ls(): return Pin(34, Pin.IN).value(), Pin(35, Pin.IN).value()\n\nhl(0, 255, 0)\ntime.sleep_ms(300)\nhl(0, 0, 0)\nprint("Quarky ready!")\n`,
  },
};

/* ─── micro:bit kit setup code (sent at connect via raw REPL) ─── */
export const MICROBIT_KIT_SETUPS = {
  generic: [
    'from microbit import *',
    'def fw(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(1);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def bk(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def lt(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(1);pin3.write_digital(0);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def rt(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def sp(): pin0.write_digital(0);pin2.write_digital(0)',
    'display.show(Image.HAPPY)',
  ],
  bitbot: [
    'from microbit import *',
    'def fw(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def bk(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def lt(ms): pin0.write_analog(0);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def rt(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(0);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def sp(): pin0.write_digital(0);pin1.write_digital(0)',
    'display.show(Image.HAPPY)',
  ],
  maqueen: [
    'from microbit import *',
    // Maqueen I2C addr 0x10: [REG, DIR, SPD]  REG: 0=M1-left, 2=M2-right  DIR: 0=fwd 1=bck
    'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
    'def sp(): _m(0,0,0);_m(2,0,0)',
    'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
    'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
    'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
    'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
    // Line sensors: i2c.write(0x10,bytes([0x1D])); d=i2c.read(0x10,1); left=(d[0]>>1)&1; right=d[0]&1
    'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
    'display.show(Image.HAPPY)',
  ],
  move: [
    'from microbit import *',
    'i2c.write(0x62,bytes([0x00,0x00]))',
    'i2c.write(0x62,bytes([0x01,0x0D]))',
    'i2c.write(0x62,bytes([0x08,0xAA]))',
    'def _pw(a,b,c,d): i2c.write(0x62,bytes([0xA2,a,b,c,d]))',
    'def sp(): _pw(0,0,0,0)',
    'def fw(ms): _pw(150,0,150,0);sleep(ms);sp()',
    'def bk(ms): _pw(0,150,0,150);sleep(ms);sp()',
    'def lt(ms): _pw(0,120,150,0);sleep(ms);sp()',
    'def rt(ms): _pw(150,0,0,120);sleep(ms);sp()',
    'display.show(Image.HAPPY)',
  ],
  cutebot: [
    'from microbit import *',
    // micro:bit v2 defaults to 400kHz I2C; Cutebot STM8 needs 100kHz
    'i2c.init(freq=100000,sda=pin20,scl=pin19)',
    // Reuse a single bytearray to avoid heap churn in forever loops
    '_B=bytearray(4)',
    'def _cb4(r,a,b,c):\n try:\n  _B[0]=r;_B[1]=a;_B[2]=b;_B[3]=c\n  i2c.write(0x10,_B)\n except: pass',
    'def sp():\n _cb4(0x01,2,0,0)\n sleep(50)\n _cb4(0x02,2,0,0)',
    'def fw(ms):\n _cb4(0x01,2,80,0)\n sleep(50)\n _cb4(0x02,2,80,0)\n sleep(ms)\n sp()',
    'def bk(ms):\n _cb4(0x01,1,80,0)\n sleep(50)\n _cb4(0x02,1,80,0)\n sleep(ms)\n sp()',
    'def lt(ms):\n _cb4(0x01,1,60,0)\n sleep(50)\n _cb4(0x02,2,60,0)\n sleep(ms)\n sp()',
    'def rt(ms):\n _cb4(0x01,2,60,0)\n sleep(50)\n _cb4(0x02,1,60,0)\n sleep(ms)\n sp()',
    // Headlights: reg 0x04=left, 0x08=right (NOT 0x05), format [reg, R, G, B]
    'def hl(r,g,b):\n _cb4(0x04,r,g,b)\n sleep(10)\n _cb4(0x08,r,g,b)',
    'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
    'def hl_r(r,g,b): _cb4(0x08,r,g,b)',
    // Sonar: P1=trig, P2=echo (same as MakeCode pxt-cutebot)
    'def sonar():\n pin1.write_digital(0);pin1.write_digital(1);pin1.write_digital(0)\n t=running_time()\n while pin2.read_digital()==0:\n  if running_time()-t>50:return 400\n t=running_time()\n while pin2.read_digital()==1:\n  if running_time()-t>50:return 400\n return (running_time()-t)*17',
    // Line sensors: P14=left, P13=right (1=on line, 0=no line)
    'def ls(): return pin14.read_digital(),pin13.read_digital()',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  cutebotpro: [
    'from microbit import *',
    // Cutebot Pro I2C addr 0x10: 5-byte packet [0x01, leftDir, leftSpd, rightDir, rightSpd]
    // DIR: 0x01=forward, 0x02=backward for BOTH motors (symmetric convention)
    'def _cbp(ld,ls,rd,rs): i2c.write(0x10,bytes([0x01,ld,ls,rd,rs]))',
    'def _cb4(r,a,b,c): i2c.write(0x10,bytes([r,a,b,c]))',
    'def sp(): _cbp(0,0,0,0)',
    'def fw(ms): _cbp(0x01,80,0x01,80);sleep(ms);sp()',
    'def bk(ms): _cbp(0x02,80,0x02,80);sleep(ms);sp()',
    'def lt(ms): _cbp(0x02,60,0x01,60);sleep(ms);sp()',
    'def rt(ms): _cbp(0x01,60,0x02,60);sleep(ms);sp()',
    'def hl(r,g,b): _cb4(0x04,r,g,b);_cb4(0x05,r,g,b)',
    'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
    'def hl_r(r,g,b): _cb4(0x05,r,g,b)',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  maqueenplus: [
    'from microbit import *',
    // Maqueen Plus I2C addr 0x10 — same protocol as Maqueen for drive motors
    'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
    'def sp(): _m(0,0,0);_m(2,0,0)',
    'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
    'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
    'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
    'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
    'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
    // Headlights via I2C register 0x0B (right RGB) and 0x0F (left RGB)
    'def hl(r,g,b): i2c.write(0x10,bytes([0x0B,r,g,b]));i2c.write(0x10,bytes([0x0F,r,g,b]))',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  ringbitcar: [
    'from microbit import *',
    // Ring:bit Car v2 uses continuous-rotation servos on P1 (right) and P2 (left)
    // Servo: 75=stopped, 30=one dir, 120=other dir  (period=20ms for 50Hz)
    'pin1.set_analog_period(20);pin2.set_analog_period(20)',
    'def sp(): pin1.write_analog(75);pin2.write_analog(75)',
    'def fw(ms): pin1.write_analog(30);pin2.write_analog(120);sleep(ms);sp()',
    'def bk(ms): pin1.write_analog(120);pin2.write_analog(30);sleep(ms);sp()',
    'def lt(ms): pin1.write_analog(75);pin2.write_analog(120);sleep(ms);sp()',
    'def rt(ms): pin1.write_analog(30);pin2.write_analog(75);sleep(ms);sp()',
    'display.show(Image.HAPPY)',
  ],
};

/* ─── USB serial pickers (micro:bit DAPLink ≠ Arduino CH340 ≠ ESP32 Quarky) ─── */
export const USB_SERIAL_FILTERS = {
  microbit: [{ usbVendorId: 0x0D28 }],
  quarky: [
    { usbVendorId: 0x10C4 }, // Silicon Labs CP210x
    { usbVendorId: 0x1A86 }, // WCH CH340
    { usbVendorId: 0x303A }, // Espressif USB-JTAG / USB-serial
    { usbVendorId: 0x0403 }, // FTDI
    { usbVendorId: 0x1A86 },
  ],
  arduino: [
    { usbVendorId: 0x2341 }, // Arduino LLC
    { usbVendorId: 0x2A03 }, // Arduino.org
    { usbVendorId: 0x1A86 }, // CH340 clones
    { usbVendorId: 0x0403 }, // FTDI
    { usbVendorId: 0x10C4 }, // CP210x
    { usbVendorId: 0x16C0 }, // Teensy / some clones
    { usbVendorId: 0x239A }, // Adafruit
  ],
};
USB_SERIAL_FILTERS.mbot = USB_SERIAL_FILTERS.arduino;

export async function requestRobotSerialPort(robotType) {
  const filters = USB_SERIAL_FILTERS[robotType];
  try {
    if (filters?.length) return await navigator.serial.requestPort({ filters });
  } catch (e) {
    if (e.name !== 'NotFoundError') throw e;
  }
  return navigator.serial.requestPort();
}

/* ─── Quarky (ESP32 MicroPython) helper — one REPL exec, duty_u16-safe ─── */
export const QUARKY_HELPER_SCRIPT = [
  'from machine import Pin, PWM',
  'import time',
  'try:',
  ' import neopixel',
  'except:',
  ' neopixel=None',
  'def _d(p,v):',
  ' v=int(v)',
  ' try:',
  '  p.duty_u16(max(0,min(65535,v*64)))',
  ' except:',
  '  try:',
  '   p.duty(max(0,min(1023,v)))',
  '  except:',
  '   pass',
  'try:',
  ' _LA=PWM(Pin(26),freq=1000);_LB=PWM(Pin(27),freq=1000)',
  ' _RA=PWM(Pin(14),freq=1000);_RB=PWM(Pin(12),freq=1000)',
  'except:',
  ' _LA=PWM(Pin(26));_LB=PWM(Pin(27));_RA=PWM(Pin(14));_RB=PWM(Pin(12))',
  '_d(_LA,0);_d(_LB,0);_d(_RA,0);_d(_RB,0)',
  '_NP=neopixel.NeoPixel(Pin(5),35) if neopixel else None',
  'def sp():',
  ' _d(_LA,0);_d(_LB,0);_d(_RA,0);_d(_RB,0)',
  'def fw(ms):',
  ' _d(_LA,800);_d(_LB,0);_d(_RA,800);_d(_RB,0);time.sleep_ms(int(ms));sp()',
  'def bk(ms):',
  ' _d(_LA,0);_d(_LB,800);_d(_RA,0);_d(_RB,800);time.sleep_ms(int(ms));sp()',
  'def lt(ms):',
  ' _d(_LA,0);_d(_LB,600);_d(_RA,800);_d(_RB,0);time.sleep_ms(int(ms));sp()',
  'def rt(ms):',
  ' _d(_LA,800);_d(_LB,0);_d(_RA,0);_d(_RB,600);time.sleep_ms(int(ms));sp()',
  'def hl(r,g,b):',
  ' if not _NP: return',
  ' for i in range(35): _NP[i]=(int(r),int(g),int(b))',
  ' _NP.write()',
  'def ls():',
  ' return Pin(34,Pin.IN).value(),Pin(35,Pin.IN).value()',
  'hl(0,255,0)',
  'time.sleep_ms(200)',
  'hl(0,0,0)',
  'print("Quarky ready!")',
].join('\n');


/* ─── Generate a complete MicroPython program from block list ─── */
export function generateFullProgram(blocks, kit) {
  const kitLines = {
    generic: [
      'def fw(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(1);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def bk(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def lt(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(1);pin3.write_digital(0);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def rt(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def sp(): pin0.write_digital(0);pin2.write_digital(0)',
    ],
    bitbot: [
      'def fw(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def bk(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def lt(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def rt(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def sp(): pin0.write_digital(0);pin1.write_digital(0)',
    ],
    maqueen: [
      'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
      'def sp(): _m(0,0,0);_m(2,0,0)',
      'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
      'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
      'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
      'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
      'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
      'def sonar():\n pin1.write_digital(0);pin1.write_digital(1);pin1.write_digital(0)\n t=running_time()\n while pin2.read_digital()==0:\n  if running_time()-t>50:return 400\n t=running_time()\n while pin2.read_digital()==1:\n  if running_time()-t>50:return 400\n return (running_time()-t)*17',
    ],
    move: [
      'i2c.write(0x62,bytes([0x00,0x00]))',
      'i2c.write(0x62,bytes([0x01,0x0D]))',
      'i2c.write(0x62,bytes([0x08,0xAA]))',
      'def _pw(a,b,c,d): i2c.write(0x62,bytes([0xA2,a,b,c,d]))',
      'def sp(): _pw(0,0,0,0)',
      'def fw(ms): _pw(150,0,150,0);sleep(ms);sp()',
      'def bk(ms): _pw(0,150,0,150);sleep(ms);sp()',
      'def lt(ms): _pw(0,120,150,0);sleep(ms);sp()',
      'def rt(ms): _pw(150,0,0,120);sleep(ms);sp()',
    ],
    cutebot: [
      // micro:bit v2 defaults to 400kHz I2C; Cutebot STM8 needs 100kHz
      'i2c.init(freq=100000,sda=pin20,scl=pin19)',
      // Reuse a single bytearray to avoid heap churn in forever loops
      '_B=bytearray(4)',
      'def _cb4(r,a,b,c):\n try:\n  _B[0]=r;_B[1]=a;_B[2]=b;_B[3]=c\n  i2c.write(0x10,_B)\n except: pass',
      'def sp():\n _cb4(0x01,2,0,0)\n sleep(50)\n _cb4(0x02,2,0,0)',
      'def fw(ms):\n _cb4(0x01,2,80,0)\n sleep(50)\n _cb4(0x02,2,80,0)\n sleep(ms)\n sp()',
      'def bk(ms):\n _cb4(0x01,1,80,0)\n sleep(50)\n _cb4(0x02,1,80,0)\n sleep(ms)\n sp()',
      'def lt(ms):\n _cb4(0x01,1,60,0)\n sleep(50)\n _cb4(0x02,2,60,0)\n sleep(ms)\n sp()',
      'def rt(ms):\n _cb4(0x01,2,60,0)\n sleep(50)\n _cb4(0x02,1,60,0)\n sleep(ms)\n sp()',
      // Headlights: reg 0x04=left, 0x08=right (NOT 0x05), format [reg, R, G, B]
      'def hl(r,g,b):\n _cb4(0x04,r,g,b)\n sleep(10)\n _cb4(0x08,r,g,b)',
      'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
      'def hl_r(r,g,b): _cb4(0x08,r,g,b)',
      'def sonar():\n pin1.write_digital(0);pin1.write_digital(1);pin1.write_digital(0)\n t=running_time()\n while pin2.read_digital()==0:\n  if running_time()-t>50:return 400\n t=running_time()\n while pin2.read_digital()==1:\n  if running_time()-t>50:return 400\n return (running_time()-t)*17',
      'def ls(): return pin14.read_digital(),pin13.read_digital()',
    ],
    cutebotpro: [
      'def _cbp(ld,ls,rd,rs): i2c.write(0x10,bytes([0x01,ld,ls,rd,rs]))',
      'def _cb4(r,a,b,c): i2c.write(0x10,bytes([r,a,b,c]))',
      'def sp(): _cbp(0,0,0,0)',
      'def fw(ms): _cbp(0x01,80,0x01,80);sleep(ms);sp()',
      'def bk(ms): _cbp(0x02,80,0x02,80);sleep(ms);sp()',
      'def lt(ms): _cbp(0x02,60,0x01,60);sleep(ms);sp()',
      'def rt(ms): _cbp(0x01,60,0x02,60);sleep(ms);sp()',
      'def hl(r,g,b): _cb4(0x04,r,g,b);_cb4(0x05,r,g,b)',
    ],
    maqueenplus: [
      'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
      'def sp(): _m(0,0,0);_m(2,0,0)',
      'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
      'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
      'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
      'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
      'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
      'def hl(r,g,b): i2c.write(0x10,bytes([0x0B,r,g,b]));i2c.write(0x10,bytes([0x0F,r,g,b]))',
    ],
    ringbitcar: [
      'pin1.set_analog_period(20);pin2.set_analog_period(20)',
      'def sp(): pin1.write_analog(75);pin2.write_analog(75)',
      'def fw(ms): pin1.write_analog(30);pin2.write_analog(120);sleep(ms);sp()',
      'def bk(ms): pin1.write_analog(120);pin2.write_analog(30);sleep(ms);sp()',
      'def lt(ms): pin1.write_analog(75);pin2.write_analog(120);sleep(ms);sp()',
      'def rt(ms): pin1.write_analog(30);pin2.write_analog(75);sleep(ms);sp()',
    ],
  };

  const profile = ROBOT_PROFILES.microbit;
  const ordered = [...blocks].sort((a, b) => a.y - b.y);
  let indent = 0;
  const bodyLines = [];
  const needsRandom = blocks.some(b => b.id === 'math_random');
  const needsRadio  = blocks.some(b => ['radio_send', 'radio_group', 'radio_recv', 'send_msg'].includes(b.id));
  const needsNeo    = blocks.some(b => b.id.startsWith('neo_'));

  // Blocks that open an indented body
  const INDENT_OPENERS = new Set([
    'repeat', 'forever', 'while_do', 'for_range',
    'if_then', 'if_temp', 'if_compass',
    'if_dist', 'if_line', 'if_btn_a', 'if_btn_b',
    'if_touch', 'if_shake', 'if_tilt', 'if_light',
  ]);

  for (const block of ordered) {
    // Strip trailing \r\n (and optional indent spaces) from the raw command string
    const raw = profile.buildCmd(block.id, block.params)
      .replace(/\r\n\s*$/, '')
      .replace(/\n\s*$/, '');

    // Visual marker — no code
    if (block.id === 'on_start') { bodyLines.push(''); bodyLines.push('# --- on start ---'); continue; }

    // End blocks: emit pass at CURRENT (inner) indent FIRST, then decrement
    if (['repeat_end', 'if_end', 'while_end', 'for_end'].includes(block.id)) {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      continue;
    }

    // Else / elif: guard previous body with pass, close it, emit else/elif, reopen
    if (block.id === 'else_branch') {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + 'else:');
      indent += 4;
      continue;
    }
    if (block.id === 'else_if') {
      const op = block.params?.op === '=' ? '==' : (block.params?.op || '<');
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + `elif ${block.params?.cond||'x'} ${op} ${block.params?.val||0}:`);
      indent += 4;
      continue;
    }

    if (!raw) continue;
    bodyLines.push(' '.repeat(indent) + raw);

    if (INDENT_OPENERS.has(block.id)) indent += 4;
  }

  const setup = kitLines[kit] || kitLines.generic;
  return [
    'from microbit import *',
    'display.show(Image.YES)',
    'sleep(400)',
    ...(needsRandom ? ['import random'] : []),
    ...(needsRadio  ? ['import radio', 'radio.on()'] : []),
    ...(needsNeo    ? ['from neopixel import NeoPixel'] : []),
    '',
    '# Robot helpers',
    ...setup,
    ...MICROBIT_FALLBACKS,
    '',
    'display.show(Image.HAPPY)',
    'sleep(500)',
    '',
    '# Your program',
    ...bodyLines,
  ].join('\n') + '\n';
}

/* ─── Quarky full-program generator (ESP32 MicroPython) ─── */
export function generateQuarkyProgram(blocks) {
  const profile = ROBOT_PROFILES.quarky;
  const ordered = [...blocks].sort((a, b) => a.y - b.y);
  let indent = 0;
  const bodyLines = [];
  const needsRandom = blocks.some(b => b.id === 'math_random');

  const INDENT_OPENERS = new Set([
    'repeat', 'forever', 'while_do', 'for_range',
    'if_then', 'if_temp', 'if_compass',
    'if_dist', 'if_line', 'if_btn_a', 'if_btn_b',
    'if_touch', 'if_shake', 'if_tilt', 'if_light',
  ]);

  for (const block of ordered) {
    const raw = profile.buildCmd(block.id, block.params)
      .replace(/\r\n\s*$/, '').replace(/\n\s*$/, '');

    if (block.id === 'on_start') { bodyLines.push(''); bodyLines.push('# --- on start ---'); continue; }

    if (['repeat_end','if_end','while_end','for_end'].includes(block.id)) {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      continue;
    }
    if (block.id === 'else_branch') {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + 'else:');
      indent += 4;
      continue;
    }
    if (block.id === 'else_if') {
      const op = block.params?.op === '=' ? '==' : (block.params?.op || '<');
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + `elif ${block.params?.cond||'x'} ${op} ${block.params?.val||0}:`);
      indent += 4;
      continue;
    }
    if (!raw) continue;
    bodyLines.push(' '.repeat(indent) + raw);
    if (INDENT_OPENERS.has(block.id)) indent += 4;
  }

  return [
    '# Quarky — ESP32 MicroPython (generated by ByteBuddies)',
    'from machine import Pin, PWM',
    'import time',
    ...(needsRandom ? ['import random'] : []),
    '',
    '# Motor driver (DRV8833) — left: GPIO26/27, right: GPIO14/12',
    'def _d(p,v):',
    ' v=int(v)',
    ' try: p.duty_u16(max(0,min(65535,v*64)))',
    ' except:',
    '  try: p.duty(max(0,min(1023,v)))',
    '  except: pass',
    'try:',
    ' _LA=PWM(Pin(26),freq=1000);_LB=PWM(Pin(27),freq=1000)',
    ' _RA=PWM(Pin(14),freq=1000);_RB=PWM(Pin(12),freq=1000)',
    'except:',
    ' _LA=PWM(Pin(26));_LB=PWM(Pin(27));_RA=PWM(Pin(14));_RB=PWM(Pin(12))',
    '_d(_LA,0);_d(_LB,0);_d(_RA,0);_d(_RB,0)',
    'try:',
    ' import neopixel',
    ' _NP=neopixel.NeoPixel(Pin(5),35)',
    'except:',
    ' _NP=None',
    '',
    'def sp(): _d(_LA,0);_d(_LB,0);_d(_RA,0);_d(_RB,0)',
    'def fw(ms): _d(_LA,800);_d(_LB,0);_d(_RA,800);_d(_RB,0);time.sleep_ms(int(ms));sp()',
    'def bk(ms): _d(_LA,0);_d(_LB,800);_d(_RA,0);_d(_RB,800);time.sleep_ms(int(ms));sp()',
    'def lt(ms): _d(_LA,0);_d(_LB,600);_d(_RA,800);_d(_RB,0);time.sleep_ms(int(ms));sp()',
    'def rt(ms): _d(_LA,800);_d(_LB,0);_d(_RA,0);_d(_RB,600);time.sleep_ms(int(ms));sp()',
    'def hl(r,g,b):',
    '    if not _NP: return',
    '    for i in range(35): _NP[i]=(int(r),int(g),int(b))',
    '    _NP.write()',
    'def ls(): return Pin(34,Pin.IN).value(),Pin(35,Pin.IN).value()',
    '',
    '# Startup: flash green',
    'hl(0,255,0)',
    'time.sleep_ms(300)',
    'hl(0,0,0)',
    '',
    '# Your program',
    ...bodyLines,
  ].join('\n') + '\n';
}

/**
 * Export the supported Robot Lab blocks to STEMpedia's Quarky API for
 * PictoBlox Upload Mode. This keeps Quarky motor control on its documented
 * left/right motor API instead of assuming generic ESP32 GPIO wiring.
 */
export function generateQuarkyPictoBloxProgram(blocks) {
  const ordered = [...blocks].sort((a, b) => a.y - b.y);
  const lines = [
    '# ByteBuddies program for Quarky in PictoBlox Python Upload Mode',
    '# In PictoBlox: select Board > Quarky, connect by USB, then Upload Code.',
    'import time',
    "sprite = Sprite('Tobi')",
    'quarky = Quarky()',
    '',
  ];
  const warnings = new Set();
  let indent = 0;
  let speed = 60;
  const emit = (code) => lines.push(`${' '.repeat(indent)}${code}`);
  const duration = (amount) => Math.max(0.05, Number(amount || 20) * 0.01);
  const stop = () => {
    emit('quarky.stopmotor("L")');
    emit('quarky.stopmotor("R")');
  };
  const drive = (left, right, seconds) => {
    emit(`quarky.runmotor("L", "${left[0]}", ${left[1]})`);
    emit(`quarky.runmotor("R", "${right[0]}", ${right[1]})`);
    emit(`time.sleep(${seconds})`);
    stop();
  };

  for (const block of ordered) {
    const p = block.params || {};
    const amount = duration(p.amount);
    const leftSpeed = Math.min(100, Math.max(0, Math.round(Number(p.left ?? speed))));
    const rightSpeed = Math.min(100, Math.max(0, Math.round(Number(p.right ?? speed))));
    switch (block.id) {
      case 'on_start': emit('# Start'); break;
      case 'forward': drive(['FORWARD', speed], ['FORWARD', speed], amount); break;
      case 'back': drive(['BACKWARD', speed], ['BACKWARD', speed], amount); break;
      case 'left': case 'spin_left': drive(['BACKWARD', speed], ['FORWARD', speed], duration(p.degrees || 90)); break;
      case 'right': case 'spin_right': drive(['FORWARD', speed], ['BACKWARD', speed], duration(p.degrees || 90)); break;
      case 'move_left': drive(['BACKWARD', speed], ['FORWARD', speed], amount); break;
      case 'move_right': drive(['FORWARD', speed], ['BACKWARD', speed], amount); break;
      case 'stop': case 'coast': case 'stop_all': stop(); break;
      case 'speed': speed = Math.min(100, Math.max(0, Math.round(Number(p.pct ?? 75)))); emit(`# Speed set to ${speed}%`); break;
      case 'motor_l': emit(`quarky.runmotor("L", "${Number(p.power || 50) < 0 ? 'BACKWARD' : 'FORWARD'}", ${Math.min(100, Math.abs(Math.round(Number(p.power || 50))))})`); break;
      case 'motor_r': emit(`quarky.runmotor("R", "${Number(p.power || 50) < 0 ? 'BACKWARD' : 'FORWARD'}", ${Math.min(100, Math.abs(Math.round(Number(p.power || 50))))})`); break;
      case 'motors':
        emit(`quarky.runmotor("L", "${Number(p.left ?? 50) < 0 ? 'BACKWARD' : 'FORWARD'}", ${leftSpeed})`);
        emit(`quarky.runmotor("R", "${Number(p.right ?? 50) < 0 ? 'BACKWARD' : 'FORWARD'}", ${rightSpeed})`);
        break;
      case 'wait': emit(`time.sleep(${Math.max(0, Number(p.secs ?? 1))})`); break;
      case 'repeat': emit(`for _ in range(${Math.max(0, Math.round(Number(p.times ?? 3)))}):`); indent += 4; break;
      case 'forever': emit('while True:'); indent += 4; break;
      case 'if_then': {
        const cond = /^[A-Za-z_]\w*$/.test(String(p.cond || '')) || /^-?\d+(\.\d+)?$/.test(String(p.cond || '')) ? p.cond : '0';
        const value = /^-?\d+(\.\d+)?$/.test(String(p.val ?? '')) || /^[A-Za-z_]\w*$/.test(String(p.val ?? '')) ? p.val : '0';
        const op = ({ '=': '==', '==': '==', '!=': '!=', '<': '<', '>': '>', '<=': '<=', '>=': '>=' })[p.op] || '==';
        emit(`if ${cond} ${op} ${value}:`); indent += 4; break;
      }
      case 'if_end': case 'for_end': case 'while_end': case 'repeat_end':
        if (indent) {
          if (lines[lines.length - 1]?.trim().endsWith(':')) lines.push(`${' '.repeat(indent)}pass`);
          indent = Math.max(0, indent - 4);
        }
        break;
      case 'else_branch': {
        if (lines[lines.length - 1]?.trim().endsWith(':')) lines.push(`${' '.repeat(indent)}pass`);
        if (indent) indent = Math.max(0, indent - 4);
        emit('else:'); indent += 4; break;
      }
      case 'else_if': {
        if (lines[lines.length - 1]?.trim().endsWith(':')) lines.push(`${' '.repeat(indent)}pass`);
        if (indent) indent = Math.max(0, indent - 4);
        const cond = /^[A-Za-z_]\w*$/.test(String(p.cond || '')) || /^-?\d+(\.\d+)?$/.test(String(p.cond || '')) ? p.cond : '0';
        const value = /^-?\d+(\.\d+)?$/.test(String(p.val ?? '')) || /^[A-Za-z_]\w*$/.test(String(p.val ?? '')) ? p.val : '0';
        const op = ({ '=': '==', '==': '==', '!=': '!=', '<': '<', '>': '>', '<=': '<=', '>=': '>=' })[p.op] || '==';
        emit(`elif ${cond} ${op} ${value}:`); indent += 4; break;
      }
      case 'if_dist': case 'if_line': case 'if_btn_a': case 'if_btn_b': case 'if_touch':
      case 'if_shake': case 'if_tilt': case 'if_light': case 'if_temp': case 'if_compass':
      case 'while_do': case 'for_range': {
        warnings.add('Sensor and advanced control blocks need manual setup in PictoBlox; the export marks them with TODO comments.');
        emit('if False:  # TODO: set up this condition with Quarky blocks in PictoBlox');
        indent += 4;
        break;
      }
      default:
        warnings.add('Some blocks are not part of the Quarky export yet; see TODO comments in the file.');
        emit(`# TODO: ByteBuddies block “${String(block.id || 'unknown').replace(/[^\w-]/g, '')}” is not mapped to the Quarky API yet.`);
    }
  }
  return { source: lines.join('\n') + '\n', warnings: [...warnings] };
}
