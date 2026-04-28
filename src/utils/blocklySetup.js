import Blockly from 'blockly';
import 'blockly/blocks';
import * as BlocklyJS from 'blockly/javascript';
import { getCategoryColorForBlockLabel } from '../data/blockLibraryCategories';

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
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#f1c40f');
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
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#f1c40f');
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
        this.setColour('#4a9eff');
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
        this.setColour('#4a9eff');
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
        this.setColour('#4a9eff');
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
        this.setColour('#4a9eff');
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
        this.setColour('#4a9eff');
        this.setTooltip("Change Y position");
      }
    };

    Blockly.Blocks['bb_motion_glide'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('glide')
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECS')
          .appendField('secs to x:')
          .appendField(new Blockly.FieldNumber(0, -480, 480), 'X')
          .appendField('y:')
          .appendField(new Blockly.FieldNumber(0, -360, 360), 'Y');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Glide to position');
      },
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
        this.setColour('#ff7043');
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
        this.setColour('#8d6e63');
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
        this.setColour('#8d6e63');
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
        this.setColour('#607d8b');
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
        this.setColour('#9b59b6');
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
        this.setColour('#ff9800');
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
        this.setColour('#ff9800');
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
        this.appendStatementInput("ELSE")
            .setCheck(null)
            .appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5c6bc0');
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
        this.setColour('#e91e8c');
        this.setTooltip("Play a sound effect");
      }
    };

    Blockly.Blocks['bb_sound_stop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("stop sounds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#e91e8c');
        this.setTooltip("Stop all sounds");
      }
    };

    Blockly.Blocks['bb_tts_speak'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("TTS speak")
            .appendField(new Blockly.FieldTextInput("Hello from ByteBuddies"), "TEXT")
            .appendField("voice")
            .appendField(new Blockly.FieldDropdown([
              ["auto", "auto"],
              ["female", "female"],
              ["male", "male"],
              ["UK English", "uk"],
              ["US English", "us"],
              ["Google US English", "google_us"],
              ["Google UK English Female", "google_uk_female"],
              ["Google UK English Male", "google_uk_male"],
              ["Google Australian English", "google_au"],
              ["Google Indian English", "google_india"],
              ["English (Natural/Neural)", "en_natural"],
              ["Heart (US, F)", "heart"],
              ["Bella (US, F)", "bella"],
              ["Nicole (US, F)", "nicole"],
              ["Sarah (US, F)", "sarah"],
              ["Sky (US, F)", "sky"],
              ["Adam (US, M)", "adam"],
              ["Michael (US, M)", "michael"],
              ["Liam (US, M)", "liam"],
              ["Eric (US, M)", "eric"],
              ["Emma (UK, F)", "emma"],
              ["Isabella (UK, F)", "isabella"],
              ["Alice (UK, F)", "alice"],
              ["George (UK, M)", "george"],
              ["Daniel (UK, M)", "daniel"],
              ["Lewis (UK, M)", "lewis"],
            ]), "VOICE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#a78bfa');
        this.setTooltip("Speak text out loud");
      }
    };

    Blockly.Blocks['bb_robot_buzz'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("buzzer for")
            .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "SECS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#e91e8c');
        this.setTooltip("Play buzzer tone");
      }
    };

    Blockly.Blocks['bb_robot_play_note'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("play note")
            .appendField(new Blockly.FieldDropdown([
              ["C3", "C3"], ["D3", "D3"], ["E3", "E3"], ["F3", "F3"], ["G3", "G3"], ["A3", "A3"], ["B3", "B3"],
              ["C4", "C4"], ["D4", "D4"], ["E4", "E4"], ["F4", "F4"], ["G4", "G4"], ["A4", "A4"], ["B4", "B4"], ["C5", "C5"],
            ]), "NOTE")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "SECS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#e91e8c');
        this.setTooltip("Play musical note");
      }
    };

    Blockly.Blocks['bb_robot_play_melody'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("play melody")
            .appendField(new Blockly.FieldDropdown([
              ["happy", "happy"], ["sad", "sad"], ["power_up", "power_up"],
              ["siren", "siren"], ["birthday", "birthday"], ["twinkle", "twinkle"],
            ]), "MELODY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#e91e8c');
        this.setTooltip("Play melody");
      }
    };

    Blockly.Blocks['bb_robot_if_dist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("if distance <")
            .appendField(new Blockly.FieldNumber(20, 0, 500, 1), "CM")
            .appendField("cm");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#06b6d4');
        this.setTooltip("Distance threshold condition");
      }
    };

    Blockly.Blocks['bb_robot_led_color'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("LED colour")
            .appendField(new Blockly.FieldDropdown([
              ["red", "red"], ["green", "green"], ["blue", "blue"], ["yellow", "yellow"],
              ["cyan", "cyan"], ["magenta", "magenta"], ["white", "white"], ["off", "off"],
            ]), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Set LED colour");
      }
    };

    Blockly.Blocks['bb_robot_led_brightness'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("LED brightness")
            .appendField(new Blockly.FieldNumber(100, 0, 100, 1), "PCT")
            .appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Set LED brightness");
      }
    };

    Blockly.Blocks['bb_robot_led_rgb'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("LED RGB")
            .appendField("R").appendField(new Blockly.FieldNumber(255, 0, 255, 1), "R")
            .appendField("G").appendField(new Blockly.FieldNumber(0, 0, 255, 1), "G")
            .appendField("B").appendField(new Blockly.FieldNumber(0, 0, 255, 1), "B");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Set LED RGB");
      }
    };

    Blockly.Blocks['bb_robot_show_text'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show text")
            .appendField(new Blockly.FieldTextInput("Hi!"), "TEXT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Show text on display");
      }
    };

    Blockly.Blocks['bb_robot_show_number'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show number")
            .appendField(new Blockly.FieldNumber(42), "NUM");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Show number on display");
      }
    };

    Blockly.Blocks['bb_robot_show_icon'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show icon")
            .appendField(new Blockly.FieldDropdown([
              ["HAPPY", "HAPPY"], ["SAD", "SAD"], ["HEART", "HEART"], ["SURPRISED", "SURPRISED"],
              ["ANGRY", "ANGRY"], ["YES", "YES"], ["NO", "NO"], ["ARROW_N", "ARROW_N"], ["ARROW_S", "ARROW_S"],
              ["ARROW_E", "ARROW_E"], ["ARROW_W", "ARROW_W"], ["ASLEEP", "ASLEEP"], ["CONFUSED", "CONFUSED"],
              ["SKULL", "SKULL"], ["DIAMOND", "DIAMOND"],
            ]), "ICON");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Show icon on display");
      }
    };

    Blockly.Blocks['bb_robot_generic'] = {
      init: function() {
        this.appendDummyInput('HEAD')
            .appendField(new Blockly.FieldLabelSerializable('robot block'), 'CMD');
        for (let i = 1; i <= 6; i += 1) {
          this.appendDummyInput(`P${i}`)
              .appendField(new Blockly.FieldLabelSerializable(`p${i}`), `K${i}`)
              .appendField(new Blockly.FieldTextInput(''), `V${i}`);
        }
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Robot command with editable values");
      }
    };

    // =============== MATH ===============
    Blockly.Blocks['bb_math_add'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("math")
            .appendField(new Blockly.FieldNumber(1), "A")
            .appendField(new Blockly.FieldDropdown([["+", "+"], ["-", "-"]]), "OP")
            .appendField(new Blockly.FieldNumber(1), "B");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#59c059');
        this.setTooltip("Add or subtract values");
      }
    };

    Blockly.Blocks['bb_math_mult'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("math")
            .appendField(new Blockly.FieldNumber(2), "A")
            .appendField(new Blockly.FieldDropdown([["×", "*"], ["÷", "/"]]), "OP")
            .appendField(new Blockly.FieldNumber(3), "B");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#59c059');
        this.setTooltip("Multiply or divide values");
      }
    };

    Blockly.Blocks['bb_math_random'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("random")
            .appendField(new Blockly.FieldNumber(1), "MIN")
            .appendField("to")
            .appendField(new Blockly.FieldNumber(100), "MAX");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#59c059');
        this.setTooltip("Generate random number");
      }
    };

    Blockly.Blocks['bb_math_round'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["round", "round"], ["abs", "abs"]]), "MOP")
            .appendField(new Blockly.FieldNumber(3.7), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#59c059');
        this.setTooltip("Round or absolute value");
      }
    };

    Blockly.Blocks.bb_generic_stack = {
      init: function init() {
        this.appendDummyInput()
          .appendField(new Blockly.FieldLabelSerializable('block'), 'LABEL');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip('Generic sidebar block');
      },
    };

    if (!Blockly.Blocks.bb_sidebar_item) {
      Blockly.Blocks.bb_sidebar_item = {
        init: function init() {
          this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour('#4C97FF');
          this.setTooltip('Block from library');
        },
      };
    }

    try {
      Blockly.Extensions.register('bb_lib_style_ext', function bbLibStyleExt() {
        const hex = getCategoryColorForBlockLabel(this.getFieldValue('BLOCK_NAME'));
        this.setColour(hex);
      });
    } catch (e) {
      /* extension already registered (HMR / double define) */
    }

    const libDefs = {
      bb_lib_stack: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Block');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_hat: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.setPreviousStatement(false, null);
          this.setNextStatement(true, null);
          this.setTooltip('Event');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_c: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.appendStatementInput('DO').appendField(' ');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Loop / condition');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_boolean: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.setOutput(true, 'Boolean');
          this.setTooltip('Boolean');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_reporter: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
          this.setOutput(true, null);
          this.setTooltip('Reporter');
        },
        extensions: ['bb_lib_style_ext'],
      },
    };
    Object.entries(libDefs).forEach(([id, def]) => {
      Blockly.Blocks[id] = def;
    });

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

      BlocklyJS.javascriptGenerator.forBlock['bb_motion_glide'] = function(block) {
        const s = block.getFieldValue('SECS');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `glide_to(${s}, ${x}, ${y});\n`;
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
        const elseStatements = BlocklyJS.javascriptGenerator.statementToCode(block, 'ELSE');
        return `if (${condition}) {\n${statements}}\n${elseStatements ? `else {\n${elseStatements}}\n` : ''}`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sound_play'] = function(block) {
        const sound = block.getFieldValue('SOUND');
        return `play_sound("${sound}");\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sound_stop'] = function() {
        return 'stop_sounds();\n';
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_tts_speak'] = function(block) {
        const txt = block.getFieldValue('TEXT') || 'Hello from ByteBuddies';
        const voice = block.getFieldValue('VOICE') || 'auto';
        return `run_extension_block(${JSON.stringify(`tts|speak|${voice}|${txt}`)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_buzz'] = function(block) {
        const secs = Number(block.getFieldValue('SECS') || 0.5);
        return `play_sound("beep"); wait(${secs});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_play_note'] = function(block) {
        const note = block.getFieldValue('NOTE') || 'C4';
        const secs = Number(block.getFieldValue('SECS') || 0.5);
        return `play_note("${note}", ${secs});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_play_melody'] = function(block) {
        const melody = block.getFieldValue('MELODY') || 'happy';
        return `play_melody("${melody}");\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_if_dist'] = function(block) {
        const cm = Number(block.getFieldValue('CM') || 20);
        return `if_distance_less_than(${cm});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_led_color'] = function(block) {
        const color = block.getFieldValue('COLOR') || 'red';
        return `set_led_color("${color}");\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_led_brightness'] = function(block) {
        const pct = Number(block.getFieldValue('PCT') || 100);
        return `set_led_brightness(${pct});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_led_rgb'] = function(block) {
        const r = Number(block.getFieldValue('R') || 255);
        const g = Number(block.getFieldValue('G') || 0);
        const b = Number(block.getFieldValue('B') || 0);
        return `set_led_rgb(${r}, ${g}, ${b});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_show_text'] = function(block) {
        const text = block.getFieldValue('TEXT') || 'Hi!';
        return `show_text(${JSON.stringify(text)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_show_number'] = function(block) {
        const num = Number(block.getFieldValue('NUM') || 42);
        return `show_number(${num});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_robot_show_icon'] = function(block) {
        const icon = block.getFieldValue('ICON') || 'HAPPY';
        return `show_icon("${icon}");\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_math_add'] = function(block) {
        const a = Number(block.getFieldValue('A') || 0);
        const op = block.getFieldValue('OP') || '+';
        const b = Number(block.getFieldValue('B') || 0);
        return `_math = (${a}) ${op} (${b});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_math_mult'] = function(block) {
        const a = Number(block.getFieldValue('A') || 0);
        const op = block.getFieldValue('OP') || '*';
        const b = Number(block.getFieldValue('B') || 1);
        return `_math = (${a}) ${op} (${b});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_math_random'] = function(block) {
        const min = Number(block.getFieldValue('MIN') || 1);
        const max = Number(block.getFieldValue('MAX') || 100);
        return `_math = random_int(${min}, ${max});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_math_round'] = function(block) {
        const op = block.getFieldValue('MOP') || 'round';
        const v = Number(block.getFieldValue('VALUE') || 0);
        return op === 'abs' ? `_math = abs(${v});\n` : `_math = round(${v});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock.bb_generic_stack = function(block) {
        const label = block.getFieldValue('LABEL') || 'block';
        return `// ${label}\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock.bb_sidebar_item = function(block) {
        const name = block.getFieldValue('BLOCK_NAME') || 'block';
        return `// ${name}\n`;
      };

      const libGen = function(block) {
        const name = block.getFieldValue('BLOCK_NAME') || 'block';
        return `// ${name}\n`;
      };
      ['bb_lib_stack', 'bb_lib_hat', 'bb_lib_c', 'bb_lib_boolean', 'bb_lib_reporter'].forEach((id) => {
        BlocklyJS.javascriptGenerator.forBlock[id] = libGen;
      });
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
