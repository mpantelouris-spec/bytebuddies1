import Blockly from 'blockly';
import 'blockly/blocks';
import { getAvailableBlocks } from '../services/program-executor.js';

let defined = false;

const BLOCK_COLORS = {
  motion: '#00D9FF',
  sensor: '#8B00FF',
  tool: '#94a3b8',
  control: '#fbbf24',
};

export function defineVrdBlocks() {
  if (defined) return;
  defined = true;

  Blockly.Blocks.vrd_forward = {
    init() {
      this.appendDummyInput().appendField('▶ Move forward');
      this.appendValueInput('DIST').setCheck('Number').appendField('cm');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.motion);
      this.setTooltip('Drive forward a distance in centimeters');
    },
  };

  Blockly.Blocks.vrd_back = {
    init() {
      this.appendDummyInput().appendField('◀ Move back');
      this.appendValueInput('DIST').setCheck('Number').appendField('cm');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.motion);
    },
  };

  Blockly.Blocks.vrd_turn_left = {
    init() {
      this.appendDummyInput()
        .appendField('↺ Turn left')
        .appendField(new Blockly.FieldNumber(45, 1, 360), 'DEG');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.motion);
    },
  };

  Blockly.Blocks.vrd_turn_right = {
    init() {
      this.appendDummyInput()
        .appendField('↻ Turn right')
        .appendField(new Blockly.FieldNumber(45, 1, 360), 'DEG');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.motion);
    },
  };

  Blockly.Blocks.vrd_wait = {
    init() {
      this.appendDummyInput()
        .appendField('⏱ Wait')
        .appendField(new Blockly.FieldNumber(1, 0.1, 30, 0.1), 'SECS')
        .appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.control);
    },
  };

  Blockly.Blocks.vrd_stop = {
    init() {
      this.appendDummyInput().appendField('⏹ Stop motors');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ef4444');
    },
  };

  Blockly.Blocks.vrd_scan = {
    init() {
      this.appendDummyInput().appendField('📡 Ultrasonic scan');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.sensor);
    },
  };

  Blockly.Blocks.vrd_lidar = {
    init() {
      this.appendDummyInput().appendField('🔦 LIDAR sweep');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.sensor);
    },
  };

  Blockly.Blocks.vrd_if_obstacle = {
    init() {
      this.appendDummyInput().appendField('⚠️ If obstacle ahead');
      this.appendStatementInput('DO').appendField('then');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.sensor);
    },
  };

  Blockly.Blocks.vrd_grab = {
    init() {
      this.appendDummyInput().appendField('🦀 Grab');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.tool);
    },
  };

  Blockly.Blocks.vrd_release = {
    init() {
      this.appendDummyInput().appendField('✋ Release');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLORS.tool);
    },
  };

  Blockly.Blocks.vrd_lights_on = {
    init() {
      this.appendDummyInput().appendField('💡 Lights on');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00FF41');
    },
  };

  Blockly.Blocks.vrd_lights_off = {
    init() {
      this.appendDummyInput().appendField('🌑 Lights off');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#64748b');
    },
  };

  Blockly.Blocks.vrd_number = {
    init() {
      this.appendDummyInput().appendField(new Blockly.FieldNumber(50, 1, 500), 'NUM');
      this.setOutput(true, 'Number');
      this.setColour('#5A2E8F');
    },
  };
}

function numFromInput(block, name, fallback) {
  const target = block.getInputTargetBlock(name);
  if (target?.type === 'vrd_number') return Number(target.getFieldValue('NUM')) || fallback;
  if (target?.type === 'math_number') return Number(target.getFieldValue('NUM')) || fallback;
  return fallback;
}

function stepsFromBlockChain(startBlock) {
  const steps = [];
  let block = startBlock;
  while (block) {
    steps.push(...stepsFromSingleBlock(block));
    block = block.getNextBlock();
  }
  return steps;
}

function stepsFromSingleBlock(block) {
  const type = block.type;
  switch (type) {
    case 'vrd_forward':
      return [{ id: 'forward', params: { amount: numFromInput(block, 'DIST', 50) } }];
    case 'vrd_back':
      return [{ id: 'back', params: { amount: numFromInput(block, 'DIST', 30) } }];
    case 'vrd_turn_left':
      return [{ id: 'left', params: { degrees: Number(block.getFieldValue('DEG')) || 45 } }];
    case 'vrd_turn_right':
      return [{ id: 'right', params: { degrees: Number(block.getFieldValue('DEG')) || 45 } }];
    case 'vrd_wait':
      return [{ id: 'wait', params: { secs: Number(block.getFieldValue('SECS')) || 1 } }];
    case 'vrd_stop':
      return [{ id: 'stop', params: {} }];
    case 'vrd_scan':
      return [{ id: 'scan', params: {} }];
    case 'vrd_lidar':
      return [{ id: 'lidar_sweep', params: {} }];
    case 'vrd_grab':
      return [{ id: 'grab', params: {} }];
    case 'vrd_release':
      return [{ id: 'release', params: {} }];
    case 'vrd_lights_on':
      return [{ id: 'lights_on', params: {} }];
    case 'vrd_lights_off':
      return [{ id: 'lights_off', params: {} }];
    case 'vrd_if_obstacle': {
      const inner = block.getInputTargetBlock('DO');
      const body = inner ? stepsFromBlockChain(inner) : [];
      return [{ id: 'if_obstacle', params: { degrees: 45 }, body }];
    }
    default:
      return [];
  }
}

/** Convert Blockly workspace → executable step list */
export function workspaceToSteps(workspace) {
  if (!workspace) return [];
  const tops = workspace.getTopBlocks(true);
  return tops.flatMap((b) => stepsFromBlockChain(b));
}

const BLOCKLY_TYPE_MAP = {
  forward: 'vrd_forward',
  back: 'vrd_back',
  left: 'vrd_turn_left',
  right: 'vrd_turn_right',
  wait: 'vrd_wait',
  stop: 'vrd_stop',
  scan: 'vrd_scan',
  lidar_sweep: 'vrd_lidar',
  if_obstacle: 'vrd_if_obstacle',
  grab: 'vrd_grab',
  release: 'vrd_release',
  lights_on: 'vrd_lights_on',
  lights_off: 'vrd_lights_off',
};

/** Build toolbox JSON filtered by parts mounted on the robot */
export function buildVrdToolbox(design) {
  const avail = getAvailableBlocks(design || {});
  const motion = avail.motion
    .map((b) => BLOCKLY_TYPE_MAP[b.id])
    .filter(Boolean)
    .map((type) => ({ kind: 'block', type }));

  const sensors = avail.sensor
    .map((b) => BLOCKLY_TYPE_MAP[b.id])
    .filter(Boolean)
    .map((type) => ({ kind: 'block', type }));

  const tools = avail.tools
    .map((b) => BLOCKLY_TYPE_MAP[b.id])
    .filter(Boolean)
    .map((type) => ({ kind: 'block', type }));

  const lights = avail.lights
    .map((b) => BLOCKLY_TYPE_MAP[b.id])
    .filter(Boolean)
    .map((type) => ({ kind: 'block', type }));

  const contents = [
    { kind: 'category', name: 'Move', colour: BLOCK_COLORS.motion, contents: motion.length ? motion : [{ kind: 'block', type: 'vrd_forward' }] },
    { kind: 'category', name: 'Numbers', colour: '#5A2E8F', contents: [{ kind: 'block', type: 'vrd_number' }] },
  ];
  if (sensors.length) contents.push({ kind: 'category', name: 'Sensors', colour: BLOCK_COLORS.sensor, contents: sensors });
  if (tools.length) contents.push({ kind: 'category', name: 'Tools', colour: BLOCK_COLORS.tool, contents: tools });
  if (lights.length) contents.push({ kind: 'category', name: 'Lights', colour: '#00FF41', contents: lights });

  return { kind: 'categoryToolbox', contents };
}

/** Load steps into workspace as block chain */
export function stepsToWorkspace(workspace, steps = []) {
  if (!workspace) return;
  workspace.clear();
  defineVrdBlocks();

  let prev = null;
  steps.forEach((step) => {
    const typeMap = {
      forward: 'vrd_forward',
      back: 'vrd_back',
      left: 'vrd_turn_left',
      right: 'vrd_turn_right',
      wait: 'vrd_wait',
      stop: 'vrd_stop',
      scan: 'vrd_scan',
      lidar_sweep: 'vrd_lidar',
      grab: 'vrd_grab',
      release: 'vrd_release',
      lights_on: 'vrd_lights_on',
      lights_off: 'vrd_lights_off',
      if_obstacle: 'vrd_if_obstacle',
    };
    const bType = typeMap[step.id];
    if (!bType) return;
    const block = workspace.newBlock(bType);
    block.initSvg();
    block.render();

    if (step.id === 'forward' || step.id === 'back') {
      const num = workspace.newBlock('vrd_number');
      num.setFieldValue(String(step.params?.amount ?? 50), 'NUM');
      num.initSvg();
      num.render();
      block.getInput('DIST').connection.connect(num.outputConnection);
    }
    if (step.id === 'left' || step.id === 'right') {
      block.setFieldValue(String(step.params?.degrees ?? 45), 'DEG');
    }
    if (step.id === 'wait') {
      block.setFieldValue(String(step.params?.secs ?? 1), 'SECS');
    }

    block.moveBy(40, prev ? prev.getRelativeToSurfaceXY().y + 60 : 40);
    if (prev) prev.nextConnection.connect(block.previousConnection);
    prev = block;
  });
}

export function stepsToPython(steps) {
  const lines = ['from robot import ByteBuddy', '', 'bot = ByteBuddy()'];
  steps.forEach((s) => {
    if (s.id === 'forward') lines.push(`bot.forward(${s.params?.amount ?? 50})`);
    else if (s.id === 'back') lines.push(`bot.backward(${s.params?.amount ?? 30})`);
    else if (s.id === 'left') lines.push(`bot.turn_left(${s.params?.degrees ?? 45})`);
    else if (s.id === 'right') lines.push(`bot.turn_right(${s.params?.degrees ?? 45})`);
    else if (s.id === 'wait') lines.push(`bot.wait(${s.params?.secs ?? 1})`);
    else if (s.id === 'stop') lines.push('bot.stop()');
    else if (s.id === 'scan') lines.push('bot.scan()');
    else if (s.id === 'lidar_sweep') lines.push('bot.lidar_sweep()');
    else if (s.id === 'grab') lines.push('bot.grab()');
    else if (s.id === 'release') lines.push('bot.release()');
    else if (s.id === 'lights_on') lines.push('bot.lights_on()');
    else if (s.id === 'lights_off') lines.push('bot.lights_off()');
    else if (s.id === 'if_obstacle') {
      lines.push('if bot.obstacle_ahead():');
      (s.body || [{ id: 'left', params: { degrees: 45 } }]).forEach((inner) => {
        if (inner.id === 'left') lines.push(`    bot.turn_left(${inner.params?.degrees ?? 45})`);
        else if (inner.id === 'forward') lines.push(`    bot.forward(${inner.params?.amount ?? 30})`);
      });
    }
  });
  return lines.join('\n');
}

export function stepsToJavaScript(steps) {
  const lines = ['const bot = new ByteBuddy();', ''];
  steps.forEach((s) => {
    if (s.id === 'forward') lines.push(`await bot.forward(${s.params?.amount ?? 50});`);
    else if (s.id === 'back') lines.push(`await bot.backward(${s.params?.amount ?? 30});`);
    else if (s.id === 'left') lines.push(`await bot.turnLeft(${s.params?.degrees ?? 45});`);
    else if (s.id === 'right') lines.push(`await bot.turnRight(${s.params?.degrees ?? 45});`);
    else if (s.id === 'wait') lines.push(`await bot.wait(${s.params?.secs ?? 1});`);
    else if (s.id === 'stop') lines.push('await bot.stop();');
    else if (s.id === 'scan') lines.push('await bot.scan();');
    else if (s.id === 'lidar_sweep') lines.push('await bot.lidarSweep();');
    else if (s.id === 'grab') lines.push('await bot.grab();');
    else if (s.id === 'release') lines.push('await bot.release();');
    else if (s.id === 'lights_on') lines.push('await bot.lightsOn();');
    else if (s.id === 'lights_off') lines.push('await bot.lightsOff();');
  });
  return lines.join('\n');
}
