import Blockly from 'blockly';
import 'blockly/blocks';
import * as BlocklyJS from 'blockly/javascript';

/**
 * Shared Blockly Setup Utility
 * Defines custom blocks and provides initialization functions for Blockly workspaces
 */

/**
 * Define all custom Blockly blocks for ByteBuddies
 */
export const defineBytebuddiesBlocks = () => {
  if (!Blockly || !Blockly.Blocks) {
    console.warn('Blockly not ready yet');
    return false;
  }

  try {
    // =============== EVENTS ===============
    Blockly.Blocks['bb_event_start'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("🚩 when program starts");
        this.setNextStatement(true, null);
        this.setColour(60);
        this.setTooltip("Starts the program");
      }
    };

    Blockly.Blocks['bb_event_keypress'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("⌨️ when key")
            .appendField(new Blockly.FieldDropdown([
              ["space", "space"], ["up arrow", "up"], ["down arrow", "down"],
              ["left arrow", "left"], ["right arrow", "right"],
              ["a", "a"], ["s", "s"], ["d", "d"], ["w", "w"]
            ]), "KEY")
            .appendField("pressed");
        this.setNextStatement(true, null);
        this.setColour(60);
        this.setTooltip("Triggers when a key is pressed");
      }
    };

    // =============== MOTION/SPRITE ===============
    Blockly.Blocks['bb_sprite_move'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("move")
            .appendField(new Blockly.FieldNumber(10, -1000, 1000), "STEPS")
            .appendField("steps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Move forward");
      }
    };

    Blockly.Blocks['bb_sprite_turn'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("turn")
            .appendField(new Blockly.FieldDropdown([
              ["left ↶", "left"], ["right ↷", "right"]
            ]), "DIRECTION")
            .appendField(new Blockly.FieldNumber(15, 0, 360), "DEGREES")
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Turn left or right");
      }
    };

    Blockly.Blocks['bb_sprite_goto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go to x:")
            .appendField(new Blockly.FieldNumber(0, -480, 480), "X")
            .appendField("y:")
            .appendField(new Blockly.FieldNumber(0, -360, 360), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Go to position");
      }
    };

    Blockly.Blocks['bb_sprite_changex'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change x by")
            .appendField(new Blockly.FieldNumber(10, -1000, 1000), "AMOUNT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Change X position");
      }
    };

    Blockly.Blocks['bb_sprite_changey'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change y by")
            .appendField(new Blockly.FieldNumber(10, -1000, 1000), "AMOUNT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("Change Y position");
      }
    };

    // =============== CONTROL/LOOPS ===============
    Blockly.Blocks['bb_control_wait'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("wait")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECONDS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(30);
        this.setTooltip("Pause for seconds");
      }
    };

    Blockly.Blocks['bb_loop_repeat'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("repeat")
            .appendField(new Blockly.FieldNumber(10, 1, 1000), "TIMES")
            .appendField("times");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(30);
        this.setTooltip("Repeat commands");
      }
    };

    Blockly.Blocks['bb_loop_forever'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("forever");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setColour(30);
        this.setTooltip("Repeat forever");
      }
    };

    // =============== ACTIONS ===============
    Blockly.Blocks['bb_action_print'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("print")
            .appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Print a message");
      }
    };

    Blockly.Blocks['bb_sprite_say'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("say")
            .appendField(new Blockly.FieldTextInput("Hi!"), "TEXT")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(2, 1, 10), "SECONDS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(270);
        this.setTooltip("Display speech bubble");
      }
    };

    // =============== VARIABLES ===============
    Blockly.Blocks['bb_var_create'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldTextInput("myVar"), "NAME")
            .appendField("to")
            .appendField(new Blockly.FieldTextInput("0"), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Create or set variable");
      }
    };

    Blockly.Blocks['bb_var_change'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change")
            .appendField(new Blockly.FieldTextInput("myVar"), "NAME")
            .appendField("by")
            .appendField(new Blockly.FieldNumber(1, -1000, 1000), "AMOUNT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
        this.setTooltip("Change variable by amount");
      }
    };

    // =============== LOGIC ===============
    Blockly.Blocks['bb_logic_if'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("then");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(200);
        this.setTooltip("If condition is true");
      }
    };

    // =============== SOUND ===============
    Blockly.Blocks['bb_sound_play'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("play sound")
            .appendField(new Blockly.FieldDropdown([
              ["pop", "pop"], ["beep", "beep"], ["coin", "coin"],
              ["jump", "jump"], ["success", "success"], ["error", "error"]
            ]), "SOUND");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(300);
        this.setTooltip("Play a sound effect");
      }
    };

    // =============== CODE GENERATORS ===============
    if (BlocklyJS) {
      BlocklyJS.javascriptGenerator.forBlock['bb_event_start'] = function(block) {
        return '// When program starts\n';
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_event_keypress'] = function(block) {
        const key = block.getFieldValue('KEY');
        return `// On key press: ${key}\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_move'] = function(block) {
        const steps = block.getFieldValue('STEPS');
        return `move_steps(${steps});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_turn'] = function(block) {
        const direction = block.getFieldValue('DIRECTION');
        const degrees = block.getFieldValue('DEGREES');
        return `turn_${direction}(${degrees});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_goto'] = function(block) {
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `goto(${x}, ${y});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_changex'] = function(block) {
        const amount = block.getFieldValue('AMOUNT');
        return `change_x(${amount});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_changey'] = function(block) {
        const amount = block.getFieldValue('AMOUNT');
        return `change_y(${amount});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_control_wait'] = function(block) {
        const seconds = block.getFieldValue('SECONDS');
        return `wait(${seconds});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_loop_repeat'] = function(block) {
        const times = block.getFieldValue('TIMES');
        const statements = BlocklyJS.javascriptGenerator.statementToCode(block, 'DO');
        return `for(let i = 0; i < ${times}; i++) {\n${statements}}\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_loop_forever'] = function(block) {
        const statements = BlocklyJS.javascriptGenerator.statementToCode(block, 'DO');
        return `while(true) {\n${statements}}\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_action_print'] = function(block) {
        const message = block.getFieldValue('MESSAGE');
        return `print(${JSON.stringify(message)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_say'] = function(block) {
        const text = block.getFieldValue('TEXT');
        const seconds = block.getFieldValue('SECONDS');
        return `say(${JSON.stringify(text)}, ${seconds});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_var_create'] = function(block) {
        const name = block.getFieldValue('NAME');
        const value = block.getFieldValue('VALUE');
        return `${name} = ${value};\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_var_change'] = function(block) {
        const name = block.getFieldValue('NAME');
        const amount = block.getFieldValue('AMOUNT');
        return `${name} += ${amount};\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_logic_if'] = function(block) {
        const condition = BlocklyJS.javascriptGenerator.valueToCode(block, 'CONDITION', BlocklyJS.javascriptGenerator.ORDER_NONE) || 'false';
        const statements = BlocklyJS.javascriptGenerator.statementToCode(block, 'DO');
        return `if (${condition}) {\n${statements}}\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sound_play'] = function(block) {
        const sound = block.getFieldValue('SOUND');
        return `play_sound("${sound}");\n`;
      };
    }

    return true;
  } catch (error) {
    console.error('Error defining Blockly blocks:', error);
    return false;
  }
};

/**
 * Initialize a Blockly workspace
 * @param {HTMLElement} container - The DOM element to inject Blockly into
 * @param {Object} options - Blockly configuration options
 * @returns {Blockly.WorkspaceSvg} The initialized workspace
 */
export const initializeBlocklyWorkspace = (container, options = {}) => {
  const defaultOptions = {
    toolbox: generateToolbox(),
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: '/blockly-media/',
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true,
    grid: {
      spacing: 20,
      length: 1,
      colour: '#888',
      snap: false
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    ...options
  };

  const workspace = Blockly.inject(container, defaultOptions);
  
  // Resize Blockly when window resizes
  const resizeHandler = () => {
    Blockly.svgResize(workspace);
  };
  window.addEventListener('resize', resizeHandler);

  // Store resize handler for cleanup
  workspace._resizeHandler = resizeHandler;

  return workspace;
};

/**
 * Generate toolbox XML for Blockly
 * @returns {string} XML string defining the toolbox
 */
export const generateToolbox = () => {
  return `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <category name="Events" colour="60">
        <block type="bb_event_start"></block>
        <block type="bb_event_keypress"></block>
      </category>
      <category name="Motion" colour="210">
        <block type="bb_sprite_move"></block>
        <block type="bb_sprite_turn"></block>
        <block type="bb_sprite_goto"></block>
        <block type="bb_sprite_changex"></block>
        <block type="bb_sprite_changey"></block>
      </category>
      <category name="Control" colour="30">
        <block type="bb_control_wait"></block>
        <block type="bb_loop_repeat"></block>
        <block type="bb_loop_forever"></block>
      </category>
      <category name="Actions" colour="160">
        <block type="bb_action_print"></block>
        <block type="bb_sprite_say"></block>
      </category>
      <category name="Variables" colour="330">
        <block type="bb_var_create"></block>
        <block type="bb_var_change"></block>
      </category>
      <category name="Logic" colour="200">
        <block type="bb_logic_if"></block>
      </category>
      <category name="Sound" colour="300">
        <block type="bb_sound_play"></block>
      </category>
    </xml>
  `;
};

/**
 * Generate code from workspace
 * @param {Blockly.WorkspaceSvg} workspace - The Blockly workspace
 * @returns {string} Generated code
 */
export const generateCode = (workspace) => {
  return BlocklyJS.javascriptGenerator.workspaceToCode(workspace);
};

/**
 * Clean up Blockly workspace
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to clean up
 */
export const cleanupWorkspace = (workspace) => {
  if (workspace && workspace._resizeHandler) {
    window.removeEventListener('resize', workspace._resizeHandler);
  }
  if (workspace) {
    workspace.dispose();
  }
};
