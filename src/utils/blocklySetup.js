import Blockly from 'blockly';
import 'blockly/blocks';
import * as BlocklyJS from 'blockly/javascript';
import { getCategoryColorForBlockLabel } from '../data/blockLibraryCategories';
import {
  COSTUME_BLOCKLY_DROPDOWN,
  BACKDROP_BLOCKLY_DROPDOWN,
} from '../data/stageLookOptions';
import { SOUND_BLOCKLY_DROPDOWN } from '../data/soundOptions';
import {
  CLONE_TARGET_BLOCKLY_DROPDOWN,
  STOP_OPTION_BLOCKLY_DROPDOWN,
} from '../data/stageCloneOptions';

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

    // =============== MOTION BLOCKS (PictoBlox Official Spec) ===============
    // 1. move () steps
    Blockly.Blocks['motion_movesteps'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("move")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "STEPS")
            .appendField("steps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Move forward by the specified number of steps");
      }
    };

    // 2. turn clockwise () degrees — adds to direction (0°=up, 90°=right, 180°=down)
    Blockly.Blocks['motion_turnright'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("turn clockwise")
            .appendField(new Blockly.FieldNumber(15, -Infinity, Infinity), "DEGREES")
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Adds degrees to the sprite direction (clockwise). 0°=up, 90°=right, 180°=down.");
      }
    };

    // 3. turn anticlockwise () degrees — subtracts from direction
    Blockly.Blocks['motion_turnleft'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("turn anticlockwise")
            .appendField(new Blockly.FieldNumber(15, -Infinity, Infinity), "DEGREES")
            .appendField("degrees");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Subtracts degrees from the sprite direction (anticlockwise). 0°=up, -90°=left.");
      }
    };

    // 4-6. go to [random position] / [mouse-pointer] / [sprite]
    Blockly.Blocks['motion_goto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go to")
            .appendField(new Blockly.FieldDropdown([
              ["random position", "random"],
              ["mouse-pointer", "mouse"],
              ["Sprite1", "sprite"]
            ]), "TARGET");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Go to the specified target");
      }
    };

    // 7. go to x: () y: ()
    Blockly.Blocks['motion_gotoxy'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go to x:")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "X")
            .appendField("y:")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Go to the specified coordinates");
      }
    };

    // 8-10. glide () secs to [random position] / [mouse-pointer] / [sprite]
    Blockly.Blocks['motion_glide'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("glide")
            .appendField(new Blockly.FieldNumber(1, 0, Infinity), "SECS")
            .appendField("secs to")
            .appendField(new Blockly.FieldDropdown([
              ["random position", "random"],
              ["mouse-pointer", "mouse"],
              ["Sprite1", "sprite"]
            ]), "TARGET");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Glide to target over specified seconds");
      }
    };

    // 11. glide () secs to x: () y: ()
    Blockly.Blocks['motion_glideto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("glide")
            .appendField(new Blockly.FieldNumber(1, 0, Infinity), "SECS")
            .appendField("secs to x:")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "X")
            .appendField("y:")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Glide to coordinates over specified seconds");
      }
    };

    // 12. point in direction ()
    Blockly.Blocks['motion_pointindirection'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("point in direction")
            .appendField(new Blockly.FieldNumber(90, -Infinity, Infinity), "DIRECTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Point toward the specified direction (0-360 degrees)");
      }
    };

    // 13-14. point towards [mouse-pointer] / [sprite]
    Blockly.Blocks['motion_pointtowards'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("point towards")
            .appendField(new Blockly.FieldDropdown([
              ["mouse-pointer", "mouse"],
              ["Sprite1", "sprite"]
            ]), "TARGET");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Point towards the specified target");
      }
    };

    // 15. change x by ()
    Blockly.Blocks['motion_changex'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change x by")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "DX");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Change x position by the specified amount");
      }
    };

    // 16. set x to ()
    Blockly.Blocks['motion_setx'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set x to")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "X");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Set x position to the specified value");
      }
    };

    // 17. change y by ()
    Blockly.Blocks['motion_changey'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change y by")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "DY");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Change y position by the specified amount");
      }
    };

    // 18. set y to ()
    Blockly.Blocks['motion_sety'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set y to")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Set y position to the specified value");
      }
    };

    // 19. if on edge, bounce
    Blockly.Blocks['motion_ifonedgebounce'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("if on edge, bounce");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("Bounce off the edge if touching it");
      }
    };

    // 20. set rotation style [left-right] / [don't rotate] / [all around]
    Blockly.Blocks['motion_setrotationstyle'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set rotation style")
            .appendField(new Blockly.FieldDropdown([
              ["all around", "allaround"],
              ["left-right", "leftright"],
              ["don't rotate", "none"],
            ]), "STYLE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip("All around: costume spins with direction. Left-right: flip only. Don't rotate: stay upright.");
      }
    };

    // 21-23. Reporters: (x position), (y position), (direction)
    Blockly.Blocks['motion_xposition'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("x position");
        this.setOutput(true, 'Number');
        this.setColour('#4C97FF');
        this.setTooltip("Returns the x position of the sprite");
      }
    };

    Blockly.Blocks['motion_yposition'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("y position");
        this.setOutput(true, 'Number');
        this.setColour('#4C97FF');
        this.setTooltip("Returns the y position of the sprite");
      }
    };

    Blockly.Blocks['motion_direction'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("direction");
        this.setOutput(true, 'Number');
        this.setColour('#4C97FF');
        this.setTooltip("Returns the direction the sprite is pointing");
      }
    };

    // Legacy blocks for backward compatibility
    Blockly.Blocks['bb_sprite_move'] = Blockly.Blocks['motion_movesteps'];
    Blockly.Blocks['bb_sprite_turn'] = Blockly.Blocks['motion_turnright'];
    Blockly.Blocks['bb_sprite_turn_right'] = Blockly.Blocks['motion_turnright'];
    Blockly.Blocks['bb_sprite_turn_left'] = Blockly.Blocks['motion_turnleft'];
    Blockly.Blocks['bb_sprite_goto'] = Blockly.Blocks['motion_gotoxy'];
    Blockly.Blocks['bb_sprite_changex'] = Blockly.Blocks['motion_changex'];
    Blockly.Blocks['bb_sprite_changey'] = Blockly.Blocks['motion_changey'];

    Blockly.Blocks['bb_sprite_glide'] = {
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

    Blockly.Blocks['bb_sprite_point_dir'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('point in direction')
          .appendField(new Blockly.FieldNumber(90, -180, 180), 'DEGREES')
          .appendField('°');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Point in direction');
      },
    };

    Blockly.Blocks['bb_sprite_point_towards'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('point towards')
          .appendField(new Blockly.FieldDropdown([
            ['mouse-pointer', 'mouse-pointer'],
            ['random', 'random']
          ]), 'TARGET');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Point towards target');
      },
    };

    Blockly.Blocks['bb_sprite_setx'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set x to')
          .appendField(new Blockly.FieldNumber(0, -480, 480), 'X');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set X position');
      },
    };

    Blockly.Blocks['bb_sprite_sety'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set y to')
          .appendField(new Blockly.FieldNumber(0, -360, 360), 'Y');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set Y position');
      },
    };

    Blockly.Blocks['bb_sprite_goto_sprite'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('go to')
          .appendField(new Blockly.FieldDropdown([['any', 'any']]), 'SPRITE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Go to sprite');
      },
    };

    Blockly.Blocks['bb_sprite_if_bounce'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('if on edge, bounce');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Bounce off edges');
      },
    };

    Blockly.Blocks['bb_sprite_rotation_style'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set rotation style')
          .appendField(new Blockly.FieldDropdown([
            ['all around', 'allaround'],
            ['left-right', 'leftright'],
            ["don't rotate", 'none'],
          ]), 'STYLE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set rotation style');
      },
    };

    Blockly.Blocks['bb_motion_point'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('point towards mouse');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Point towards mouse');
      },
    };

    Blockly.Blocks['bb_motion_point_dir'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('point in direction')
          .appendField(new Blockly.FieldNumber(90, -180, 180), 'DIRECTION')
          .appendField('°');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Point in direction');
      },
    };

    Blockly.Blocks['bb_motion_stop'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('stop motion');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Stop all motion');
      },
    };

    Blockly.Blocks['bb_motion_wrap'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('wrap around edges');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Wrap sprite around edges');
      },
    };

    Blockly.Blocks['bb_sprite_setsize'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set size to')
          .appendField(new Blockly.FieldNumber(100, 5, 500), 'SIZE')
          .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Set sprite size as % of current');
      },
    };

    Blockly.Blocks['bb_sprite_show'] = {
      init: function() {
        this.appendDummyInput().appendField('show');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Show sprite');
      },
    };

    Blockly.Blocks['bb_sprite_hide'] = {
      init: function() {
        this.appendDummyInput().appendField('hide');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Hide sprite');
      },
    };

    // =============== LOOKS BLOCKS (PictoBlox Official Spec) ===============
    // 1. say [] for () seconds
    Blockly.Blocks['looks_sayforsecs'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("say")
            .appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(2, 0, Infinity), "SECS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Say a message for specified seconds");
      }
    };

    // 2. say []
    Blockly.Blocks['looks_say'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("say")
            .appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Say a message");
      }
    };

    // 3. think [] for () seconds
    Blockly.Blocks['looks_thinkforsecs'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("think")
            .appendField(new Blockly.FieldTextInput("Hmm..."), "MESSAGE")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(2, 0, Infinity), "SECS")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Think a message for specified seconds");
      }
    };

    // 4. think []
    Blockly.Blocks['looks_think'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("think")
            .appendField(new Blockly.FieldTextInput("Hmm..."), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Think a message");
      }
    };

    // 5. switch costume to []
    Blockly.Blocks['looks_costumename'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("switch costume to")
            .appendField(new Blockly.FieldDropdown(COSTUME_BLOCKLY_DROPDOWN), "COSTUME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Switch to a costume");
      }
    };

    // 6. next costume
    Blockly.Blocks['looks_nextcostume'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("next costume");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Switch to next costume");
      }
    };

    // 7. switch backdrop to []
    Blockly.Blocks['looks_backdropname'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("switch backdrop to")
            .appendField(new Blockly.FieldDropdown(BACKDROP_BLOCKLY_DROPDOWN), "BACKDROP");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Switch to a backdrop");
      }
    };

    // 8. next backdrop
    Blockly.Blocks['looks_nextbackdrop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("next backdrop");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Switch to next backdrop");
      }
    };

    // 9. change size by ()
    Blockly.Blocks['looks_changeSizeBy'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change size by")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "CHANGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Change size by a percentage");
      }
    };

    // 10. set size to () %
    Blockly.Blocks['looks_setSizeTo'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set size to")
            .appendField(new Blockly.FieldNumber(100, 0, Infinity), "SIZE")
            .appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Set size as percentage");
      }
    };

    // 11. change [color v] effect by ()
    Blockly.Blocks['looks_changeEffectBy'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change")
            .appendField(new Blockly.FieldDropdown([
              ["color", "color"],
              ["fisheye", "fisheye"],
              ["whirl", "whirl"],
              ["pixelate", "pixelate"],
              ["mosaic", "mosaic"],
              ["brightness", "brightness"],
              ["ghost", "ghost"]
            ]), "EFFECT")
            .appendField("effect by")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "CHANGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Change visual effect");
      }
    };

    // 12. set [color v] effect to ()
    Blockly.Blocks['looks_setEffectTo'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldDropdown([
              ["color", "color"],
              ["fisheye", "fisheye"],
              ["whirl", "whirl"],
              ["pixelate", "pixelate"],
              ["mosaic", "mosaic"],
              ["brightness", "brightness"],
              ["ghost", "ghost"]
            ]), "EFFECT")
            .appendField("effect to")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Set visual effect value");
      }
    };

    // 13. clear graphic effects
    Blockly.Blocks['looks_clearEffects'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("clear graphic effects");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Remove all graphic effects");
      }
    };

    // 14. show
    Blockly.Blocks['looks_show'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Show the sprite");
      }
    };

    // 15. hide
    Blockly.Blocks['looks_hide'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("hide");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Hide the sprite");
      }
    };

    // 16. go to [front v] layer
    Blockly.Blocks['looks_gotofrontback'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go to")
            .appendField(new Blockly.FieldDropdown([
              ["front", "front"],
              ["back", "back"]
            ]), "LAYER")
            .appendField("layer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Move to front or back layer");
      }
    };

    // 17. go [forward v] () layers
    Blockly.Blocks['looks_goforwardbackwardlayers'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go")
            .appendField(new Blockly.FieldDropdown([
              ["forward", "forward"],
              ["backward", "backward"]
            ]), "DIRECTION")
            .appendField(new Blockly.FieldNumber(1, -Infinity, Infinity), "NUM")
            .appendField("layers");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9B59B6');
        this.setTooltip("Move forward or backward by layers");
      }
    };

    // 18. (costume [number v])
    Blockly.Blocks['looks_costumenumbername'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("costume")
            .appendField(new Blockly.FieldDropdown([
              ["number", "number"],
              ["name", "name"]
            ]), "NUMBER_NAME");
        this.setOutput(true, 'String');
        this.setColour('#9B59B6');
        this.setTooltip("Get costume number or name");
      }
    };

    // 19. (backdrop [number v])
    Blockly.Blocks['looks_backdropnumbername'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("backdrop")
            .appendField(new Blockly.FieldDropdown([
              ["number", "number"],
              ["name", "name"]
            ]), "NUMBER_NAME");
        this.setOutput(true, 'String');
        this.setColour('#9B59B6');
        this.setTooltip("Get backdrop number or name");
      }
    };

    // 20. (size)
    Blockly.Blocks['looks_size'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("size");
        this.setOutput(true, 'Number');
        this.setColour('#9B59B6');
        this.setTooltip("Get sprite size");
      }
    };

    // Legacy compatibility
    Blockly.Blocks['bb_sprite_setsize'] = Blockly.Blocks['looks_setSizeTo'];
    Blockly.Blocks['bb_sprite_show'] = Blockly.Blocks['looks_show'];
    Blockly.Blocks['bb_sprite_hide'] = Blockly.Blocks['looks_hide'];

    // =============== SOUND BLOCKS (PictoBlox Official Spec) ===============
    // 1. play sound [] until done
    Blockly.Blocks['sound_playuntildone'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("play sound")
            .appendField(new Blockly.FieldDropdown(SOUND_BLOCKLY_DROPDOWN), "SOUND")
            .appendField("until done");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Play a sound and wait until finished");
      }
    };

    // 2. start sound []
    Blockly.Blocks['sound_play'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("start sound")
            .appendField(new Blockly.FieldDropdown(SOUND_BLOCKLY_DROPDOWN), "SOUND");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Start playing a sound");
      }
    };

    // 3. stop all sounds
    Blockly.Blocks['sound_stopallsounds'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("stop all sounds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Stop all sounds");
      }
    };

    // 4. change [pitch v] effect by ()
    Blockly.Blocks['sound_changeeffectby'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change")
            .appendField(new Blockly.FieldDropdown([
              ["pitch", "pitch"],
              ["pan", "pan"]
            ]), "EFFECT")
            .appendField("effect by")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Change sound effect");
      }
    };

    // 5. set [pitch v] effect to ()
    Blockly.Blocks['sound_seteffectto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldDropdown([
              ["pitch", "pitch"],
              ["pan", "pan"]
            ]), "EFFECT")
            .appendField("effect to")
            .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity), "VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Set sound effect value");
      }
    };

    // 6. clear sound effects
    Blockly.Blocks['sound_cleareffects'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("clear sound effects");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Clear all sound effects");
      }
    };

    // 7. change volume by ()
    Blockly.Blocks['sound_changevolumeby'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change volume by")
            .appendField(new Blockly.FieldNumber(-10, -Infinity, Infinity), "VOLUME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Change volume");
      }
    };

    // 8. set volume to () %
    Blockly.Blocks['sound_setvolumeto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set volume to")
            .appendField(new Blockly.FieldNumber(100, 0, 100), "VOLUME")
            .appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#CF63CF');
        this.setTooltip("Set volume to percentage");
      }
    };

    // 9. (volume)
    Blockly.Blocks['sound_volume'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("volume");
        this.setOutput(true, 'Number');
        this.setColour('#CF63CF');
        this.setTooltip("Get current volume");
      }
    };

    // =============== EVENTS BLOCKS (PictoBlox Official Spec) ===============
    // 1. when green flag clicked
    Blockly.Blocks['event_whenflagclicked'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when")
            .appendField(new Blockly.FieldColour("#FF8C00"), "COLOR")
            .appendField("flag clicked");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when green flag is clicked");
      }
    };

    // 2. when [space v] key pressed
    Blockly.Blocks['event_whenkeypressed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when")
            .appendField(new Blockly.FieldDropdown([
              ["space", "space"],
              ["up arrow", "up"],
              ["down arrow", "down"],
              ["left arrow", "left"],
              ["right arrow", "right"],
              ["a", "a"],
              ["b", "b"],
              ["c", "c"]
            ]), "KEY")
            .appendField("key pressed");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when key is pressed");
      }
    };

    // 3. when this sprite clicked
    Blockly.Blocks['event_whenthisspriteclicked'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when this sprite clicked");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when sprite is clicked");
      }
    };

    // 4. when backdrop switches to []
    Blockly.Blocks['event_whenbackdropswitchesto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when backdrop switches to")
            .appendField(new Blockly.FieldDropdown(BACKDROP_BLOCKLY_DROPDOWN), "BACKDROP");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when backdrop changes");
      }
    };

    // 5. when [loudness v] > ()
    Blockly.Blocks['event_whengreaterthan'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when")
            .appendField(new Blockly.FieldDropdown([
              ["loudness", "loudness"],
              ["timer", "timer"]
            ]), "CONDITION")
            .appendField(">")
            .appendField(new Blockly.FieldNumber(10, -Infinity, Infinity), "VALUE");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when value exceeds threshold");
      }
    };

    // 6. when I receive [message1 v]
    Blockly.Blocks['event_whenreceivemessage'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when I receive")
            .appendField(new Blockly.FieldTextInput("message1"), "MESSAGE");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Triggers when message is received");
      }
    };

    // 7. broadcast [message1 v]
    Blockly.Blocks['event_broadcast'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("broadcast")
            .appendField(new Blockly.FieldTextInput("message1"), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Send a message to all sprites");
      }
    };

    // 8. broadcast [message1 v] and wait
    Blockly.Blocks['event_broadcastandwait'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("broadcast")
            .appendField(new Blockly.FieldTextInput("message1"), "MESSAGE")
            .appendField("and wait");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFBF00');
        this.setTooltip("Send a message and wait for response");
      }
    };

    // =============== CONTROL BLOCKS (PictoBlox Official Spec) ===============
    // 1. wait () seconds
    Blockly.Blocks['control_wait'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("wait")
            .appendField(new Blockly.FieldNumber(1, 0, Infinity), "DURATION")
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Wait for specified seconds");
      }
    };

    // 2. repeat ()
    Blockly.Blocks['control_repeat'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("repeat")
            .appendField(new Blockly.FieldNumber(10, 0, Infinity), "TIMES");
        this.appendStatementInput("SUBSTACK")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Repeat block N times");
      }
    };

    // 3. forever
    Blockly.Blocks['control_forever'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("forever");
        this.appendStatementInput("SUBSTACK")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(false, null);
        this.setColour('#FF7043');
        this.setTooltip("Loop forever");
      }
    };

    // End marker for repeat/forever blocks
    Blockly.Blocks['loop-end-loop'] = {
      init: function() {
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
      }
    };

    // 4. if <> then
    Blockly.Blocks['control_if'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("SUBSTACK")
            .appendField("then");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("If condition is true, do something");
      }
    };

    // 5. if <> then else
    Blockly.Blocks['control_if_else'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("if");
        this.appendStatementInput("SUBSTACK")
            .appendField("then");
        this.appendStatementInput("SUBSTACK2")
            .appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("If-else conditional");
      }
    };

    // 6. wait until <>
    Blockly.Blocks['control_waituntil'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("wait until");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Wait until condition is true");
      }
    };

    // 7. repeat until <>
    Blockly.Blocks['control_repeatuntil'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck("Boolean")
            .appendField("repeat until");
        this.appendStatementInput("SUBSTACK")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Repeat until condition is true");
      }
    };

    // 8. stop [all v]
    Blockly.Blocks['control_stop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("stop")
            .appendField(new Blockly.FieldDropdown(STOP_OPTION_BLOCKLY_DROPDOWN), "STOP_OPTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(false, null);
        this.setColour('#FF7043');
        this.setTooltip("Stop execution");
      }
    };

    // 9. when I start as a clone
    Blockly.Blocks['control_start_as_clone'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when I start as a clone");
        this.setPreviousStatement(false, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Triggers when clone is created");
      }
    };

    // 10. create clone of [myself v]
    Blockly.Blocks['control_create_clone'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("create clone of")
            .appendField(new Blockly.FieldDropdown(CLONE_TARGET_BLOCKLY_DROPDOWN), "CLONE_OPTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF7043');
        this.setTooltip("Create a clone");
      }
    };

    // 11. delete this clone
    Blockly.Blocks['control_delete_this_clone'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("delete this clone");
        this.setPreviousStatement(true, null);
        this.setNextStatement(false, null);
        this.setColour('#FF7043');
        this.setTooltip("Delete this clone");
      }
    };

    // =============== SENSING BLOCKS (Scratch-style light cyan) ===============
    const SENSING_COLOUR = '#00BCD4';
    const SENSING_TOUCH_OPTIONS = [
      ['mouse-pointer', 'mouse'],
      ['edge', 'edge'],
      ['Sprite1', 'Sprite1'],
      ['Sprite2', 'Sprite2'],
    ];
    const SENSING_DISTANCE_OPTIONS = [
      ['mouse-pointer', 'mouse'],
      ['Sprite1', 'Sprite1'],
      ['Sprite2', 'Sprite2'],
    ];
    const SENSING_KEY_OPTIONS = [
      ['space', 'space'],
      ['up arrow', 'up'],
      ['down arrow', 'down'],
      ['left arrow', 'left'],
      ['right arrow', 'right'],
      ['enter', 'enter'],
      ['shift', 'shift'],
      ['control', 'control'],
      ['alt', 'alt'],
      ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => [c, c]),
      ...'0123456789'.split('').map((c) => [c, c]),
    ];

    Blockly.Blocks['sensing_touchingobject'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('touching')
            .appendField(new Blockly.FieldDropdown(SENSING_TOUCH_OPTIONS), 'OBJECT')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('True if touching the chosen object or edge');
      },
    };

    Blockly.Blocks['sensing_touchingcolor'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('touching color')
            .appendField(new Blockly.FieldColour('#4a4a4a'), 'COLOR')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('True if touching the chosen color on the stage');
      },
    };

    Blockly.Blocks['sensing_coloristouchingcolor'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('color')
            .appendField(new Blockly.FieldColour('#8b4513'), 'COLOR')
            .appendField('is touching')
            .appendField(new Blockly.FieldColour('#ff69b4'), 'COLOR2')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('True if the two colors touch on the stage');
      },
    };

    Blockly.Blocks['sensing_distanceto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('distance to')
            .appendField(new Blockly.FieldDropdown(SENSING_DISTANCE_OPTIONS), 'OBJECT');
        this.setOutput(true, 'Number');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('Distance in pixels to the target');
      },
    };

    Blockly.Blocks['sensing_askandwait'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('ask')
            .appendField(new Blockly.FieldTextInput("What's your name?"), 'QUESTION')
            .appendField('and wait');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(SENSING_COLOUR);
        this.setTooltip('Ask a question and wait for the answer');
      },
    };

    Blockly.Blocks['sensing_ask'] = {
      init: function() {
        this.appendValueInput('QUESTION')
            .setCheck('String')
            .appendField('ask');
        this.appendDummyInput().appendField('and wait');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(SENSING_COLOUR);
        this.setTooltip('Ask a question and wait for the answer');
      },
    };

    Blockly.Blocks['sensing_answer'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('answer');
        this.setOutput(true, 'String');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('Answer from the last ask block');
      },
    };

    Blockly.Blocks['sensing_keypressed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('key')
            .appendField(new Blockly.FieldDropdown(SENSING_KEY_OPTIONS), 'KEY')
            .appendField('pressed?');
        this.setOutput(true, 'Boolean');
        this.setColour(SENSING_COLOUR);
        this.setTooltip('True if that key is held down');
      },
    };

    // 8. mouse down?
    Blockly.Blocks['sensing_mousedown'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("mouse down?");
        this.setOutput(true, 'Boolean');
        this.setColour('#00BCD4');
        this.setTooltip("Check if mouse button is pressed");
      }
    };

    // 9. (mouse x)
    Blockly.Blocks['sensing_mousex'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("mouse x");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get mouse X position");
      }
    };

    // 10. (mouse y)
    Blockly.Blocks['sensing_mousey'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("mouse y");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get mouse Y position");
      }
    };

    // 11. set drag mode [draggable v]
    Blockly.Blocks['sensing_setdragmode'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set drag mode")
            .appendField(new Blockly.FieldDropdown([
              ["draggable", "draggable"],
              ["not draggable", "not draggable"]
            ]), "DRAG_MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#00BCD4');
        this.setTooltip("Set drag mode for sprite");
      }
    };

    // 12. (loudness)
    Blockly.Blocks['sensing_loudness'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("loudness");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get loudness level");
      }
    };

    // 13. (timer)
    Blockly.Blocks['sensing_timer'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("timer");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get timer value");
      }
    };

    // 14. reset timer
    Blockly.Blocks['sensing_resettimer'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("reset timer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#00BCD4');
        this.setTooltip("Reset the timer");
      }
    };

    Blockly.Blocks['sensing_of'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('(')
            .appendField(new Blockly.FieldDropdown([
              ['backdrop #', 'backdrop'],
              ['costume #', 'costume'],
              ['x position', 'x'],
              ['y position', 'y'],
              ['direction', 'direction'],
              ['size', 'size'],
            ]), 'PROPERTY')
            .appendField('of')
            .appendField(new Blockly.FieldDropdown([
              ['Stage', 'Stage'],
              ['Sprite1', 'Sprite1'],
              ['Sprite2', 'Sprite2'],
            ]), 'OBJECT')
            .appendField(')');
        this.setOutput(true, null);
        this.setColour(SENSING_COLOUR);
        this.setTooltip('Property of the stage or a sprite');
      },
    };

    // 16. (current [year v])
    Blockly.Blocks['sensing_current'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("(current")
            .appendField(new Blockly.FieldDropdown([
              ["year", "year"],
              ["month", "month"],
              ["date", "date"],
              ["day of week", "dayofweek"],
              ["hour", "hour"],
              ["minute", "minute"],
              ["second", "second"]
            ]), "CURRENTMENU")
            .appendField(")");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get current date/time");
      }
    };

    // 17. (days since 2000)
    Blockly.Blocks['sensing_dayssince2000'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("(days since 2000)");
        this.setOutput(true, 'Number');
        this.setColour('#00BCD4');
        this.setTooltip("Get days since 2000");
      }
    };

    // 18. (username)
    Blockly.Blocks['sensing_username'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("(username)");
        this.setOutput(true, 'String');
        this.setColour('#00BCD4');
        this.setTooltip("Get username");
      }
    };

    // =============== OPERATORS BLOCKS (Scratch-style: one row, white number/text fields) ===============
    const BOOL_MENU = [['true', 'TRUE'], ['false', 'FALSE']];

    Blockly.Blocks['operator_add'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(1), 'NUM1')
            .appendField(new Blockly.FieldDropdown([['+', 'add'], ['-', 'subtract']]), 'OP')
            .appendField(new Blockly.FieldNumber(1), 'NUM2');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Add or subtract two numbers');
      },
    };

    Blockly.Blocks['operator_multiply'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(2), 'NUM1')
            .appendField(new Blockly.FieldDropdown([['×', 'multiply'], ['÷', 'divide']]), 'OP')
            .appendField(new Blockly.FieldNumber(3), 'NUM2');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Multiply or divide two numbers');
      },
    };

    Blockly.Blocks['operator_random'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('pick random')
            .appendField(new Blockly.FieldNumber(1), 'FROM')
            .appendField('to')
            .appendField(new Blockly.FieldNumber(100), 'TO');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Pick a random integer in range');
      },
    };

    Blockly.Blocks['operator_compare'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'OPERAND1')
            .appendField(new Blockly.FieldDropdown([[">", "gt"], ["<", "lt"], ["=", "eq"]]), 'OPERATOR')
            .appendField(new Blockly.FieldNumber(0), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Compare two numbers');
      },
    };

    Blockly.Blocks['operator_gt'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'OPERAND1')
            .appendField('>')
            .appendField(new Blockly.FieldNumber(0), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Greater than');
      },
    };

    Blockly.Blocks['operator_lt'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'OPERAND1')
            .appendField('<')
            .appendField(new Blockly.FieldNumber(0), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Less than');
      },
    };

    Blockly.Blocks['operator_equals'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'OPERAND1')
            .appendField('=')
            .appendField(new Blockly.FieldNumber(0), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Equals');
      },
    };

    Blockly.Blocks['operator_or'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(BOOL_MENU), 'OPERAND1')
            .appendField('or')
            .appendField(new Blockly.FieldDropdown(BOOL_MENU), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Logical OR');
      },
    };

    Blockly.Blocks['operator_and'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(BOOL_MENU), 'OPERAND1')
            .appendField(new Blockly.FieldDropdown([['and', 'and'], ['or', 'or']]), 'OPERATOR')
            .appendField(new Blockly.FieldDropdown(BOOL_MENU), 'OPERAND2');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Logical AND or OR');
      },
    };

    Blockly.Blocks['operator_not'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('not')
            .appendField(new Blockly.FieldDropdown(BOOL_MENU), 'OPERAND');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Logical NOT');
      },
    };

    Blockly.Blocks['operator_join'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('join')
            .appendField(new Blockly.FieldTextInput('hello'), 'STRING1')
            .appendField(new Blockly.FieldTextInput('world'), 'STRING2');
        this.setOutput(true, 'String');
        this.setColour('#59C059');
        this.setTooltip('Join two strings');
      },
    };

    Blockly.Blocks['operator_letterof'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('letter')
            .appendField(new Blockly.FieldNumber(1), 'LETTER')
            .appendField('of')
            .appendField(new Blockly.FieldTextInput('text'), 'STRING');
        this.setOutput(true, 'String');
        this.setColour('#59C059');
        this.setTooltip('Letter at position in string');
      },
    };

    Blockly.Blocks['operator_length'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('length of')
            .appendField(new Blockly.FieldTextInput('hello'), 'STRING');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Length of string');
      },
    };

    Blockly.Blocks['operator_contains'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('hello'), 'STRING1')
            .appendField('contains')
            .appendField(new Blockly.FieldTextInput('ll'), 'STRING2')
            .appendField('?');
        this.setOutput(true, 'Boolean');
        this.setColour('#59C059');
        this.setTooltip('Does string contain text?');
      },
    };

    Blockly.Blocks['operator_mod'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0), 'NUM1')
            .appendField('mod')
            .appendField(new Blockly.FieldNumber(1), 'NUM2');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Remainder after division');
      },
    };

    Blockly.Blocks['operator_round'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ['round', 'round'],
              ['abs', 'abs'],
              ['floor', 'floor'],
              ['ceiling', 'ceiling'],
            ]), 'OP')
            .appendField(new Blockly.FieldNumber(0), 'NUM');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Round or truncate a number');
      },
    };

    Blockly.Blocks['operator_mathop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('(')
            .appendField(new Blockly.FieldDropdown([
              ['abs', 'abs'],
              ['floor', 'floor'],
              ['ceiling', 'ceiling'],
              ['sqrt', 'sqrt'],
              ['sin', 'sin'],
              ['cos', 'cos'],
              ['tan', 'tan'],
            ]), 'OPERATOR')
            .appendField('of')
            .appendField(new Blockly.FieldNumber(0), 'NUM')
            .appendField(')');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Math function of a number');
      },
    };

    // =============== VARIABLES BLOCKS (PictoBlox Official Spec) ===============
    // 1. set [my variable v] to ()
    Blockly.Blocks['data_setvariableto'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set")
            .appendField(new Blockly.FieldTextInput("my variable"), "VARIABLE");
        this.appendValueInput("VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Set variable to value");
      }
    };

    // 2. change [my variable v] by ()
    Blockly.Blocks['data_changevariableby'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("change")
            .appendField(new Blockly.FieldTextInput("my variable"), "VARIABLE")
            .appendField("by");
        this.appendValueInput("VALUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Change variable value");
      }
    };

    // 3. show variable [my variable v]
    Blockly.Blocks['data_showvariable'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show variable")
            .appendField(new Blockly.FieldTextInput("my variable"), "VARIABLE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Display variable");
      }
    };

    // 4. hide variable [my variable v]
    Blockly.Blocks['data_hidevariable'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("hide variable")
            .appendField(new Blockly.FieldTextInput("my variable"), "VARIABLE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Hide variable");
      }
    };

    // =============== LISTS BLOCKS (PictoBlox Official Spec) ===============
    // 5. add [] to [list v]
    Blockly.Blocks['data_addtolist'] = {
      init: function() {
        this.appendValueInput("ITEM")
            .appendField("add");
        this.appendDummyInput()
            .appendField("to")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Add item to list");
      }
    };

    // 6. delete () of [list v]
    Blockly.Blocks['data_deleteoflist'] = {
      init: function() {
        this.appendValueInput("INDEX")
            .appendField("delete");
        this.appendDummyInput()
            .appendField("of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Delete item from list");
      }
    };

    // 7. delete all of [list v]
    Blockly.Blocks['data_deletealloflist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("delete all of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Delete all items from list");
      }
    };

    // 8. insert [] at () of [list v]
    Blockly.Blocks['data_insertatlist'] = {
      init: function() {
        this.appendValueInput("ITEM")
            .appendField("insert");
        this.appendValueInput("INDEX")
            .appendField("at");
        this.appendDummyInput()
            .appendField("of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Insert item into list");
      }
    };

    // 9. replace item () of [list v] with []
    Blockly.Blocks['data_replaceitemoflist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("replace item");
        this.appendValueInput("INDEX");
        this.appendDummyInput()
            .appendField("of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST")
            .appendField("with");
        this.appendValueInput("ITEM");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Replace item in list");
      }
    };

    // 10. (item () of [list v])
    Blockly.Blocks['data_itemoflist'] = {
      init: function() {
        this.appendValueInput("INDEX")
            .appendField("(item");
        this.appendDummyInput()
            .appendField("of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST")
            .appendField(")");
        this.setOutput(true);
        this.setColour('#3498db');
        this.setTooltip("Get item from list");
      }
    };

    // 11. (item # of [] in [list v])
    Blockly.Blocks['data_itemnumoflist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("(item # of");
        this.appendValueInput("ITEM");
        this.appendDummyInput()
            .appendField("in")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST")
            .appendField(")");
        this.setOutput(true, 'Number');
        this.setColour('#3498db');
        this.setTooltip("Get index of item in list");
      }
    };

    // 12. (length of [list v])
    Blockly.Blocks['data_lengthoflist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("(length of")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST")
            .appendField(")");
        this.setOutput(true, 'Number');
        this.setColour('#3498db');
        this.setTooltip("Get list length");
      }
    };

    // 13. [list v] contains []?
    Blockly.Blocks['data_listcontainsitem'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("my list"), "LIST")
            .appendField("contains");
        this.appendValueInput("ITEM");
        this.appendDummyInput()
            .appendField("?");
        this.setOutput(true, 'Boolean');
        this.setColour('#3498db');
        this.setTooltip("Check if list contains item");
      }
    };

    // 14. show list [list v]
    Blockly.Blocks['data_showlist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show list")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Display list");
      }
    };

    // 15. hide list [list v]
    Blockly.Blocks['data_hidelist'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("hide list")
            .appendField(new Blockly.FieldTextInput("my list"), "LIST");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip("Hide list");
      }
    };

    Blockly.Blocks['bb_var_set'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set')
          .appendField(new Blockly.FieldTextInput('myVar'), 'NAME')
          .appendField('to')
          .appendField(new Blockly.FieldTextInput('0'), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#ff9800');
        this.setTooltip('Set a variable to a value');
      },
    };

    Blockly.Blocks['bb_looks_grow'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('grow by')
          .appendField(new Blockly.FieldNumber(10, 1, 200), 'AMOUNT')
          .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Grow costume size');
      },
    };

    Blockly.Blocks['bb_looks_shrink'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('shrink by')
          .appendField(new Blockly.FieldNumber(10, 1, 200), 'AMOUNT')
          .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Shrink costume size');
      },
    };

    Blockly.Blocks['bb_looks_costume'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('switch costume to')
          .appendField(new Blockly.FieldDropdown(COSTUME_BLOCKLY_DROPDOWN), 'COSTUME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Switch costume');
      },
    };

    Blockly.Blocks['bb_looks_next_costume'] = {
      init: function() {
        this.appendDummyInput().appendField('next costume');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Next costume');
      },
    };

    Blockly.Blocks['bb_looks_color_effect'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set color effect')
          .appendField(new Blockly.FieldNumber(0, 0, 100), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Color effect');
      },
    };

    Blockly.Blocks['bb_looks_ghost_effect'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set ghost effect')
          .appendField(new Blockly.FieldNumber(0, 0, 100), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Transparency effect');
      },
    };

    Blockly.Blocks['bb_looks_clear_effects'] = {
      init: function() {
        this.appendDummyInput().appendField('clear graphic effects');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Clear effects');
      },
    };

    Blockly.Blocks['bb_looks_front'] = {
      init: function() {
        this.appendDummyInput().appendField('go to front layer');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Draw in front');
      },
    };

    Blockly.Blocks['bb_looks_back'] = {
      init: function() {
        this.appendDummyInput().appendField('go to back layer');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Draw behind');
      },
    };

    Blockly.Blocks['bb_looks_think'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('think')
          .appendField(new Blockly.FieldTextInput('Hmm...'), 'TEXT')
          .appendField('for')
          .appendField(new Blockly.FieldNumber(2, 1, 10), 'SECONDS')
          .appendField('seconds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9b59b6');
        this.setTooltip('Thought bubble');
      },
    };

    Blockly.Blocks['bb_motion_setx'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set x to')
          .appendField(new Blockly.FieldNumber(0, -480, 480), 'X');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set X position');
      },
    };

    Blockly.Blocks['bb_motion_sety'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set y to')
          .appendField(new Blockly.FieldNumber(0, -360, 360), 'Y');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set Y position');
      },
    };

    Blockly.Blocks['bb_motion_rotation'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set rotation to')
          .appendField(new Blockly.FieldNumber(0, -180, 180), 'ROTATION')
          .appendField('°');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set angle');
      },
    };

    Blockly.Blocks['bb_motion_change_angle'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('change angle by')
          .appendField(new Blockly.FieldNumber(15, -360, 360), 'ANGLE')
          .appendField('°');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Turn sprite');
      },
    };

    Blockly.Blocks['bb_motion_speed'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set speed to')
          .appendField(new Blockly.FieldNumber(5, 0, 100, 0.5), 'SPEED');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Set movement speed from heading');
      },
    };

    Blockly.Blocks['bb_physics_velocity'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set velocity vx')
          .appendField(new Blockly.FieldNumber(0, -500, 500), 'VX')
          .appendField('vy')
          .appendField(new Blockly.FieldNumber(0, -500, 500), 'VY');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Set physics velocity');
      },
    };

    Blockly.Blocks['bb_physics_gravity'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set gravity')
          .appendField(new Blockly.FieldNumber(2400, 0, 8000), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Gravity px/s²');
      },
    };

    Blockly.Blocks['bb_physics_jump'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('physics jump power')
          .appendField(new Blockly.FieldNumber(560, 50, 1200), 'POWER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Jump');
      },
    };

    Blockly.Blocks['bb_physics_allow_double_jump'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('allow double jump')
          .appendField(new Blockly.FieldDropdown([['yes', 'true'], ['no', 'false']]), 'ENABLE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Double jump');
      },
    };

    Blockly.Blocks['bb_physics_friction'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set friction')
          .appendField(new Blockly.FieldNumber(0.9, 0, 1, 0.05), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Velocity multiplier');
      },
    };

    Blockly.Blocks['bb_physics_push'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('push direction')
          .appendField(new Blockly.FieldNumber(0, 0, 360), 'DIRECTION')
          .appendField('° force')
          .appendField(new Blockly.FieldNumber(5, 0, 50), 'FORCE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Push sprite');
      },
    };

    Blockly.Blocks['bb_physics_bounce'] = {
      init: function() {
        this.appendDummyInput().appendField('bounce if on edge');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f59e0b');
        this.setTooltip('Bounce off walls');
      },
    };

    Blockly.Blocks['bb_game_score_add'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('change score by')
          .appendField(new Blockly.FieldNumber(10, -999, 999), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#eab308');
        this.setTooltip('Add score');
      },
    };

    Blockly.Blocks['bb_game_score_set'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set score to')
          .appendField(new Blockly.FieldNumber(0, 0, 999999), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#eab308');
        this.setTooltip('Set score');
      },
    };

    Blockly.Blocks['bb_game_set_lives'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set lives to')
          .appendField(new Blockly.FieldNumber(3, 0, 99), 'VALUE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#eab308');
        this.setTooltip('Set lives');
      },
    };

    Blockly.Blocks['bb_motion_move'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('move')
          .appendField(new Blockly.FieldNumber(10, -1000, 1000), 'STEPS')
          .appendField('steps');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Move forward by steps');
      },
    };

    Blockly.Blocks['bb_motion_turn'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('turn')
          .appendField(new Blockly.FieldNumber(15, -360, 360), 'DEGREES')
          .appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Turn clockwise');
      },
    };

    Blockly.Blocks['bb_motion_turn_right'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('turn right')
          .appendField(new Blockly.FieldNumber(15, -360, 360), 'DEGREES')
          .appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Turn clockwise');
      },
    };

    Blockly.Blocks['bb_motion_turn_left'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('turn left')
          .appendField(new Blockly.FieldNumber(15, -360, 360), 'DEGREES')
          .appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Turn anticlockwise');
      },
    };

    Blockly.Blocks['bb_motion_goto_xy'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('go to x:')
          .appendField(new Blockly.FieldNumber(0, -480, 480), 'X')
          .appendField('y:')
          .appendField(new Blockly.FieldNumber(0, -360, 360), 'Y');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Go to position');
      },
    };

    Blockly.Blocks['bb_motion_goto_sprite'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('go to')
          .appendField(new Blockly.FieldDropdown([['mouse-pointer', 'mouse-pointer']]), 'SPRITE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Go to sprite');
      },
    };

    Blockly.Blocks['bb_motion_goto_random'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('go to random position');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Go to random position');
      },
    };

    Blockly.Blocks['bb_motion_goto_mouse'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('go to mouse-pointer');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Go to mouse position');
      },
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

    Blockly.Blocks['bb_motion_glide_sprite'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('glide')
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECS')
          .appendField('secs to')
          .appendField(new Blockly.FieldDropdown([['mouse-pointer', 'mouse-pointer']]), 'SPRITE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Glide to sprite');
      },
    };

    Blockly.Blocks['bb_motion_glide_random'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('glide')
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECS')
          .appendField('secs to random position');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Glide to random position');
      },
    };

    Blockly.Blocks['bb_motion_glide_mouse'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('glide')
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), 'SECS')
          .appendField('secs to mouse-pointer');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Glide to mouse');
      },
    };

    Blockly.Blocks['bb_motion_changex'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('change x by')
          .appendField(new Blockly.FieldNumber(10, -1000, 1000), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Change x position');
      },
    };

    Blockly.Blocks['bb_motion_changey'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('change y by')
          .appendField(new Blockly.FieldNumber(10, -1000, 1000), 'AMOUNT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Change y position');
      },
    };

    Blockly.Blocks['bb_motion_point_towards'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('point towards')
          .appendField(new Blockly.FieldDropdown([['mouse-pointer', 'mouse-pointer']]), 'SPRITE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Point towards sprite');
      },
    };

    Blockly.Blocks['bb_motion_if_bounce'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('if on edge, bounce');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Bounce off edges');
      },
    };

    Blockly.Blocks['bb_motion_set_rotation_style'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('set rotation style')
          .appendField(new Blockly.FieldDropdown([
            ['all around', 'allaround'],
            ['left-right', 'leftright'],
            ["don't rotate", 'none'],
          ]), 'STYLE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('All around: spin with direction. Left-right: flip only.');
      },
    };

    Blockly.Blocks['bb_motion_jump'] = {
      init: function() {
        this.appendDummyInput()
          .appendField('⬆️ jump with power')
          .appendField(new Blockly.FieldNumber(15, 1, 100), 'POWER');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4a9eff');
        this.setTooltip('Make the sprite jump');
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

    Blockly.Blocks['bb_action_alert'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('alert')
            .appendField(new Blockly.FieldTextInput('Notice'), 'MESSAGE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#607d8b');
        this.setTooltip('Show alert text');
      },
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

    Blockly.Blocks['bb_list_create'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('create list')
            .appendField(new Blockly.FieldTextInput('myList'), 'NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip('Create or clear a list');
      },
    };

    Blockly.Blocks['bb_list_add'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('add')
            .appendField(new Blockly.FieldTextInput('item'), 'ITEM')
            .appendField('to list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip('Add item to list');
      },
    };

    Blockly.Blocks['bb_list_get'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('item')
            .appendField(new Blockly.FieldNumber(1, 1, 9999, 1), 'INDEX')
            .appendField('of list')
            .appendField(new Blockly.FieldTextInput('myList'), 'LIST');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498db');
        this.setTooltip('Get list item (1-based index)');
      },
    };

    // =============== LOGIC ===============
    Blockly.Blocks['bb_logic_if'] = {
      init: function() {
        this.appendValueInput("CONDITION")
            .setCheck(["Boolean", "Number"])
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
    Blockly.Blocks['bb_sound_play'] = Blockly.Blocks['sound_play'];
    Blockly.Blocks['bb_sound_stop'] = Blockly.Blocks['sound_stopallsounds'];
    Blockly.Blocks['bb_sound_volume'] = Blockly.Blocks['sound_setvolumeto'];

    Blockly.Blocks['bb_sense_timer'] = {
      init: function() {
        this.appendDummyInput().appendField('timer');
        this.setOutput(true, 'Number');
        this.setColour('#00bcd4');
        this.setTooltip('Seconds since timer started');
      },
    };

    // =============== MUSIC BLOCKS ===============
    Blockly.Blocks['bb_music_drum'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Play drum")
            .appendField(new Blockly.FieldDropdown([
              ["Snare Drum", "0"], ["Kick Drum", "1"], ["Tom", "2"], ["Cymbal", "3"]
            ]), "DRUM")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "BEATS")
            .appendField("beat(s)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Play a drum sound");
      }
    };

    Blockly.Blocks['bb_music_rest'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Rest for")
            .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "BEATS")
            .appendField("beat(s)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Rest/silence");
      }
    };

    Blockly.Blocks['bb_music_note'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Play note")
            .appendField(new Blockly.FieldNumber(60, 0, 127), "NOTE")
            .appendField("for")
            .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "BEATS")
            .appendField("beat(s)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Play a musical note (0-127)");
      }
    };

    Blockly.Blocks['bb_music_instrument'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Set instrument to")
            .appendField(new Blockly.FieldDropdown([
              ["Piano", "0"], ["Guitar", "1"], ["Violin", "2"], ["Flute", "3"], ["Trumpet", "4"], ["Drums", "5"]
            ]), "INSTRUMENT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Set the instrument");
      }
    };

    Blockly.Blocks['bb_music_tempo'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Set tempo to")
            .appendField(new Blockly.FieldNumber(60, 10, 500), "TEMPO")
            .appendField("BPM");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Set tempo in beats per minute (10-500)");
      }
    };

    Blockly.Blocks['bb_music_tempo_change'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Change tempo by")
            .appendField(new Blockly.FieldNumber(10, -100, 100), "CHANGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#d946ef');
        this.setTooltip("Adjust tempo");
      }
    };

    Blockly.Blocks['bb_music_get_tempo'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Music] Tempo");
        this.setOutput(true, "Number");
        this.setColour('#d946ef');
        this.setTooltip("Get current tempo");
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
            .appendField(new Blockly.FieldNumber(1), 'A')
            .appendField(new Blockly.FieldDropdown([['+', '+'], ['-', '-']]), 'OP')
            .appendField(new Blockly.FieldNumber(1), 'B');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Add or subtract two numbers');
      },
    };

    Blockly.Blocks['bb_math_mult'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(2), 'A')
            .appendField(new Blockly.FieldDropdown([['×', '*'], ['÷', '/']]), 'OP')
            .appendField(new Blockly.FieldNumber(3), 'B');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Multiply or divide two numbers');
      },
    };

    Blockly.Blocks['bb_math_random'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('pick random')
            .appendField(new Blockly.FieldNumber(1), 'MIN')
            .appendField('to')
            .appendField(new Blockly.FieldNumber(100), 'MAX');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Random integer in range');
      },
    };

    Blockly.Blocks['bb_math_round'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ['round', 'round'],
              ['abs', 'abs'],
              ['floor', 'floor'],
              ['ceiling', 'ceiling'],
            ]), 'MOP')
            .appendField(new Blockly.FieldNumber(3.7), 'VALUE');
        this.setOutput(true, 'Number');
        this.setColour('#59C059');
        this.setTooltip('Round or math function');
      },
    };

    // =============== HUMAN BODY DETECTION ===============
    Blockly.Blocks['bb_body_video_on'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[body] turn")
            .appendField(new Blockly.FieldDropdown([["on", "on"], ["off", "off"]]), "STATE")
            .appendField("video on stage with")
            .appendField(new Blockly.FieldNumber(0, 0, 100), "TRANSPARENCY")
            .appendField("% transparency");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Turn video on/off for body detection with transparency control");
      }
    };

    // Backward compatibility alias for old block IDs
    Blockly.Blocks['body-video-on'] = Blockly.Blocks['bb_body_video_on'];

    Blockly.Blocks['bb_body_show_detections'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("show")
            .appendField(new Blockly.FieldDropdown([["detections", "detections"], ["off", "off"]]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#C1272D');
        this.setTooltip("Show or hide detection overlays");
      }
    };

    Blockly.Blocks['bb_body_analyse'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Body] Analyse image for human pose from")
            .appendField(new Blockly.FieldDropdown([["camera", "camera"], ["stage", "stage"]]), "SOURCE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Analyze image for body pose");
      }
    };

    Blockly.Blocks['bb_body_get_count'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Body] Get # of people");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Get number of people detected");
      }
    };

    Blockly.Blocks['bb_body_x_position'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Body] X position of")
            .appendField(new Blockly.FieldDropdown([
              ["nose", "nose"], ["shoulder", "shoulder"], ["elbow", "elbow"], ["wrist", "wrist"],
              ["hip", "hip"], ["knee", "knee"], ["ankle", "ankle"], ["eye", "eye"], ["ear", "ear"]
            ]), "KEYPOINT")
            .appendField("of person")
            .appendField(new Blockly.FieldNumber(1), "PERSON");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Get X position of keypoint");
      }
    };

    Blockly.Blocks['bb_body_y_position'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Body] Y position of")
            .appendField(new Blockly.FieldDropdown([
              ["nose", "nose"], ["shoulder", "shoulder"], ["elbow", "elbow"], ["wrist", "wrist"],
              ["hip", "hip"], ["knee", "knee"], ["ankle", "ankle"], ["eye", "eye"], ["ear", "ear"]
            ]), "KEYPOINT")
            .appendField("of person")
            .appendField(new Blockly.FieldNumber(1), "PERSON");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Get Y position of keypoint");
      }
    };

    Blockly.Blocks['bb_body_is_detected'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Body] Is")
            .appendField(new Blockly.FieldDropdown([
              ["nose", "nose"], ["shoulder", "shoulder"], ["elbow", "elbow"], ["wrist", "wrist"],
              ["hip", "hip"], ["knee", "knee"], ["ankle", "ankle"], ["eye", "eye"], ["ear", "ear"]
            ]), "KEYPOINT")
            .appendField("of person")
            .appendField(new Blockly.FieldNumber(1), "PERSON")
            .appendField("detected?");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Check if keypoint is detected");
      }
    };

    // =============== HAND DETECTION ===============
    Blockly.Blocks['bb_hand_analyze'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Hand] Analyse image for hand from")
            .appendField(new Blockly.FieldDropdown([["camera", "camera"], ["stage", "stage"]]), "SOURCE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Analyze image for hands");
      }
    };

    Blockly.Blocks['bb_hand_detected'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Hand] Is hand detected");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Check if hand is detected");
      }
    };

    Blockly.Blocks['bb_hand_position_x'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("[Hand] X position of")
            .appendField(new Blockly.FieldDropdown([
              ["thumb", "thumb"], ["index finger", "index"], ["middle finger", "middle"],
              ["ring finger", "ring"], ["pinky", "pinky"], ["palm", "palm"]
            ]), "PART")
            .appendField("of")
            .appendField(new Blockly.FieldDropdown([["thumb", "thumb"], ["hand", "hand"]]), "WHICH");
        this.setOutput(true, null);
        this.setColour('#8b5cf6');
        this.setTooltip("Get X position of hand part");
      }
    };

    // ═══ BACKWARD COMPATIBILITY ALIASES ═══
    Blockly.Blocks['body-show-detections'] = Blockly.Blocks['bb_body_show_detections'];
    Blockly.Blocks['body-analyse'] = Blockly.Blocks['bb_body_analyse'];
    Blockly.Blocks['body-get-count'] = Blockly.Blocks['bb_body_get_count'];
    Blockly.Blocks['body-x-position'] = Blockly.Blocks['bb_body_x_position'];
    Blockly.Blocks['body-y-position'] = Blockly.Blocks['bb_body_y_position'];
    Blockly.Blocks['body-is-detected'] = Blockly.Blocks['bb_body_is_detected'];
    Blockly.Blocks['hand-analyze'] = Blockly.Blocks['bb_hand_analyze'];
    Blockly.Blocks['hand-detected'] = Blockly.Blocks['bb_hand_detected'];
    Blockly.Blocks['hand-position-x'] = Blockly.Blocks['bb_hand_position_x'];


    // Looks blocks: keep PictoBlox-style definitions above (editable MESSAGE/SECS fields).
    Blockly.Blocks['looks_switchcostume'] = Blockly.Blocks['looks_costumename'];

    // ═══ EVENT BLOCKS ═══
    Blockly.Blocks['event_whenflagclicked'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('when')
            .appendField(new Blockly.FieldImage('data:image/svg+xml;utf8,<svg></svg>', 24, 24))
            .appendField('clicked');
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Start when green flag clicked');
      }
    };

    Blockly.Blocks['event_whenkeypressed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('when')
            .appendField(new Blockly.FieldDropdown([
              ['space', 'space'],
              ['up arrow', 'up'],
              ['down arrow', 'down'],
              ['right arrow', 'right'],
              ['left arrow', 'left'],
              ['a', 'a'],
              ['b', 'b']
            ]), 'KEY_OPTION')
            .appendField('key pressed');
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Start when key pressed');
      }
    };

    Blockly.Blocks['event_whenthisspriteclicked'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('when this sprite clicked');
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Start when sprite clicked');
      }
    };

    Blockly.Blocks['event_broadcast'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('broadcast')
            .appendField(new Blockly.FieldTextInput('message'), 'BROADCAST_INPUT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Send message to other sprites');
      }
    };

    Blockly.Blocks['event_broadcastandwait'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('broadcast')
            .appendField(new Blockly.FieldTextInput('message'), 'BROADCAST_INPUT')
            .appendField('and wait');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Send message and wait for response');
      }
    };

    Blockly.Blocks['event_whenbroadcastreceived'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('when I receive')
            .appendField(new Blockly.FieldTextInput('message'), 'BROADCAST_OPTION');
        this.setNextStatement(true, null);
        this.setColour(324);
        this.setTooltip('Start when message received');
      }
    };

    // (Sensing blocks defined once above — duplicate purple definitions removed)

    // ═══ VARIABLES BLOCKS ═══
    Blockly.Blocks['data_setvariableto'] = {
      init: function() {
        this.appendValueInput('VALUE')
            .appendField('set')
            .appendField(new Blockly.FieldVariable('my variable'), 'VARIABLE')
            .appendField('to');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(268);
        this.setTooltip('Set variable value');
      }
    };

    Blockly.Blocks['data_changevariableby'] = {
      init: function() {
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('change')
            .appendField(new Blockly.FieldVariable('my variable'), 'VARIABLE')
            .appendField('by');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(268);
        this.setTooltip('Change variable by amount');
      }
    };

    Blockly.Blocks['data_variable'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldVariable('my variable'), 'VARIABLE');
        this.setOutput(true, null);
        this.setColour(268);
        this.setTooltip('Get variable value');
      }
    };

    // (Operator blocks defined once above — duplicate definitions removed)

    // ═══ AI/ML EXTENSION BLOCKS ═══
    // Face Detection
    Blockly.Blocks['face_turn_video_on'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('[Face] Turn on video on stage with')
            .appendField(new Blockly.FieldNumber(0, 0, 100), 'TRANSPARENCY')
            .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#e91e63');
        this.setTooltip('Turn on face detection camera with transparency');
      }
    };

    Blockly.Blocks['face_turn_video_off'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('turn video off');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Turn off face detection');
      }
    };

    Blockly.Blocks['face_show_bounding'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('show bounding box');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Show face detection boxes');
      }
    };

    Blockly.Blocks['face_hide_bounding'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('hide bounding box');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Hide detection boxes');
      }
    };

    Blockly.Blocks['face_set_threshold'] = {
      init: function() {
        this.appendValueInput('THRESHOLD')
            .setCheck('Number')
            .appendField('set detection threshold');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Set confidence threshold (0-1)');
      }
    };

    Blockly.Blocks['face_analyse_camera'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('analyse from camera');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Detect faces in camera');
      }
    };

    Blockly.Blocks['face_analyse_stage'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('analyse from stage');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Detect faces in stage');
      }
    };

    Blockly.Blocks['face_number_of'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('number of faces');
        this.setOutput(true, 'Number');
        this.setColour('#fbbf24');
        this.setTooltip('Get face count');
      }
    };

    Blockly.Blocks['face_visible'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('face visible?');
        this.setOutput(true, 'Boolean');
        this.setColour('#fbbf24');
        this.setTooltip('Check if face detected');
      }
    };

    Blockly.Blocks['face_expression'] = {
      init: function() {
        this.appendValueInput('FACE')
            .setCheck('Number')
            .appendField('expression of face');
        this.setOutput(true, null);
        this.setColour('#fbbf24');
        this.setTooltip('Get face expression');
      }
    };

    Blockly.Blocks['face_x'] = {
      init: function() {
        this.appendValueInput('FACE')
            .setCheck('Number')
            .appendField('x of face');
        this.setOutput(true, 'Number');
        this.setColour('#fbbf24');
        this.setTooltip('Get face x position');
      }
    };

    Blockly.Blocks['face_y'] = {
      init: function() {
        this.appendValueInput('FACE')
            .setCheck('Number')
            .appendField('y of face');
        this.setOutput(true, 'Number');
        this.setColour('#fbbf24');
        this.setTooltip('Get face y position');
      }
    };

    Blockly.Blocks['face_size'] = {
      init: function() {
        this.appendValueInput('FACE')
            .setCheck('Number')
            .appendField('size of face');
        this.setOutput(true, 'Number');
        this.setColour('#fbbf24');
        this.setTooltip('Get face size');
      }
    };

    Blockly.Blocks['face_happy'] = {
      init: function() {
        this.appendValueInput('FACE')
            .setCheck('Number')
            .appendField('is face');
        this.appendField('happy?');
        this.setOutput(true, 'Boolean');
        this.setColour('#fbbf24');
        this.setTooltip('Check if face is happy');
      }
    };

    // Object Detection
    Blockly.Blocks['object_turn_video_on'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('[Object] Turn on video on stage with')
            .appendField(new Blockly.FieldNumber(0, 0, 100), 'TRANSPARENCY')
            .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#ff9800');
        this.setTooltip('Turn on object detection with transparency');
      }
    };

    Blockly.Blocks['object_turn_video_off'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('turn video off');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Turn off object detection');
      }
    };

    Blockly.Blocks['object_show_bounding'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('show bounding box');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Show detection boxes');
      }
    };

    Blockly.Blocks['object_hide_bounding'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('hide bounding box');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Hide detection boxes');
      }
    };

    Blockly.Blocks['object_set_threshold'] = {
      init: function() {
        this.appendValueInput('THRESHOLD')
            .setCheck('Number')
            .appendField('set detection threshold');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Set confidence threshold');
      }
    };

    Blockly.Blocks['object_analyse_camera'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('analyse image from camera');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Detect objects in camera');
      }
    };

    Blockly.Blocks['object_analyse_stage'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('analyse image from stage');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Detect objects in stage');
      }
    };

    Blockly.Blocks['object_number_of'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('number of objects');
        this.setOutput(true, 'Number');
        this.setColour('#9f1239');
        this.setTooltip('Get object count');
      }
    };

    Blockly.Blocks['object_class_of'] = {
      init: function() {
        this.appendValueInput('INDEX')
            .setCheck('Number')
            .appendField('class of object');
        this.setOutput(true, null);
        this.setColour('#9f1239');
        this.setTooltip('Get object class label');
      }
    };

    Blockly.Blocks['object_person_detected'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('is person detected?');
        this.setOutput(true, 'Boolean');
        this.setColour('#9f1239');
        this.setTooltip('Check if person found');
      }
    };

    Blockly.Blocks['object_person_count'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('number of person detected');
        this.setOutput(true, 'Number');
        this.setColour('#9f1239');
        this.setTooltip('Count people detected');
      }
    };

    // Speech Recognition
    Blockly.Blocks['speech_listen'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('listen once');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#34d399');
        this.setTooltip('Listen for speech input');
      }
    };

    Blockly.Blocks['speech_last_heard'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('last heard');
        this.setOutput(true, null);
        this.setColour('#34d399');
        this.setTooltip('Get last recognized speech');
      }
    };

    // Text-to-Speech
    Blockly.Blocks['tts_speak'] = {
      init: function() {
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField('speak');
        this.appendField('with voice');
        this.appendField(new Blockly.FieldDropdown([
          ['default', 'default'],
          ['female', 'female'],
          ['male', 'male']
        ]), 'VOICE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#a78bfa');
        this.setTooltip('Speak text aloud');
      }
    };

    // NLP (Natural Language Processing)
    Blockly.Blocks['nlp_analyse_sentiment'] = {
      init: function() {
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField('analyse sentiment');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#60a5fa');
        this.setTooltip('Analyze text sentiment');
      }
    };

    Blockly.Blocks['nlp_sentiment_value'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('sentiment (0-1)');
        this.setOutput(true, 'Number');
        this.setColour('#60a5fa');
        this.setTooltip('Get sentiment score');
      }
    };

    Blockly.Blocks['nlp_is_positive'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('is positive?');
        this.setOutput(true, 'Boolean');
        this.setColour('#60a5fa');
        this.setTooltip('Check if positive sentiment');
      }
    };

    // Text Recognition (OCR)
    Blockly.Blocks['ocr_scan'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('scan text');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fcd34d');
        this.setTooltip('Scan and recognize text');
      }
    };

    Blockly.Blocks['ocr_recognized_text'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('recognized text');
        this.setOutput(true, null);
        this.setColour('#fcd34d');
        this.setTooltip('Get recognized text');
      }
    };

    // Translate
    Blockly.Blocks['translate_text'] = {
      init: function() {
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField('translate');
        this.appendField('from');
        this.appendField(new Blockly.FieldDropdown([
          ['English', 'en'],
          ['Spanish', 'es'],
          ['French', 'fr'],
          ['German', 'de'],
          ['Chinese', 'zh']
        ]), 'FROM');
        this.appendField('to');
        this.appendField(new Blockly.FieldDropdown([
          ['English', 'en'],
          ['Spanish', 'es'],
          ['French', 'fr'],
          ['German', 'de'],
          ['Chinese', 'zh']
        ]), 'TO');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#22d3ee');
        this.setTooltip('Translate text between languages');
      }
    };

    Blockly.Blocks['translate_result'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('translation result');
        this.setOutput(true, null);
        this.setColour('#22d3ee');
        this.setTooltip('Get translation result');
      }
    };

    // Chat & prompts
    Blockly.Blocks['chat_ask'] = {
      init: function() {
        this.appendValueInput('PROMPT')
            .setCheck('String')
            .appendField('ask coding helper');
        this.setOutput(true, null);
        this.setColour('#fb7185');
        this.setTooltip('Ask AI assistant');
      }
    };

    // Image Classifier
    Blockly.Blocks['ic_turn_camera_on'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('turn classifier camera on');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#c084fc');
        this.setTooltip('Turn on image classifier');
      }
    };

    Blockly.Blocks['ic_analyse_frame'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('analyse frame');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#c084fc');
        this.setTooltip('Analyze current frame');
      }
    };

    Blockly.Blocks['ic_top_class'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('top class');
        this.setOutput(true, null);
        this.setColour('#c084fc');
        this.setTooltip('Get top predicted class');
      }
    };

    Blockly.Blocks['ic_confidence'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('confidence score');
        this.setOutput(true, 'Number');
        this.setColour('#c084fc');
        this.setTooltip('Get confidence score');
      }
    };

    // Pose Classifier
    Blockly.Blocks['pc_turn_camera_on'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('turn pose camera on with')
            .appendField(new Blockly.FieldNumber(0, 0, 100), "TRANSPARENCY")
            .appendField('%');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fb923c');
        this.setTooltip('Turn on pose classifier with transparency');
      }
    };

    Blockly.Blocks['pc_turn_camera_off'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('turn pose camera off');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fb923c');
        this.setTooltip('Turn off pose classifier');
      }
    };

    Blockly.Blocks['pc_capture_pose'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('capture pose sample');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#fb923c');
        this.setTooltip('Capture pose training sample');
      }
    };

    Blockly.Blocks['pc_pose_name'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('pose name');
        this.setOutput(true, null);
        this.setColour('#fb923c');
        this.setTooltip('Get recognized pose name');
      }
    };

    Blockly.Blocks['pc_pose_confidence'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('pose confidence');
        this.setOutput(true, 'Number');
        this.setColour('#fb923c');
        this.setTooltip('Get pose confidence');
      }
    };

    // Audio Classifier
    Blockly.Blocks['ac_classify'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('classify sound');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#f472b6');
        this.setTooltip('Classify audio input');
      }
    };

    Blockly.Blocks['ac_sound_label'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('sound label');
        this.setOutput(true, null);
        this.setColour('#f472b6');
        this.setTooltip('Get classified sound label');
      }
    };

    // Text Classifier
    Blockly.Blocks['tc_add_training'] = {
      init: function() {
        this.appendValueInput('CATEGORY')
            .setCheck('String')
            .appendField('add training example category');
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField('text');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#818cf8');
        this.setTooltip('Add text training example');
      }
    };

    Blockly.Blocks['tc_classify'] = {
      init: function() {
        this.appendValueInput('TEXT')
            .setCheck('String')
            .appendField('classify sentence');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#818cf8');
        this.setTooltip('Classify text');
      }
    };

    Blockly.Blocks['tc_prediction_label'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('prediction label');
        this.setOutput(true, null);
        this.setColour('#818cf8');
        this.setTooltip('Get classification label');
      }
    };

    Blockly.Blocks['tc_prediction_confidence'] = {
      init: function() {
        this.appendDummyInput()
            .appendField('prediction confidence');
        this.setOutput(true, 'Number');
        this.setColour('#818cf8');
        this.setTooltip('Get classification confidence');
      }
    };

    Blockly.Blocks.bb_generic_stack = {
      init: function init() {
        this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput('block'), 'LABEL');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#4C97FF');
        this.setTooltip('Generic sidebar block');
      },
    };

    Blockly.Blocks.bb_func_define = {
      init: function init() {
        this.appendDummyInput()
          .appendField('define')
          .appendField(new Blockly.FieldTextInput('my block'), 'NAME');
        this.appendStatementInput('STACK');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
        this.setColour('#ff6680');
        this.setTooltip('Define a custom block');
      },
    };

    Blockly.Blocks.bb_func_call = {
      init: function init() {
        this.appendDummyInput()
          .appendField('run')
          .appendField(new Blockly.FieldTextInput('my block'), 'NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#ff6680');
        this.setTooltip('Run a custom block');
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
            .appendField(new Blockly.FieldTextInput('block'), 'BLOCK_NAME');
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setTooltip('Block');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_hat: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('block'), 'BLOCK_NAME');
          this.setPreviousStatement(false, null);
          this.setNextStatement(true, null);
          this.setTooltip('Event');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_c: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('block'), 'BLOCK_NAME');
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
            .appendField(new Blockly.FieldTextInput('block'), 'BLOCK_NAME');
          this.setOutput(true, 'Boolean');
          this.setTooltip('Boolean');
        },
        extensions: ['bb_lib_style_ext'],
      },
      bb_lib_reporter: {
        init: function init() {
          this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput('block'), 'BLOCK_NAME');
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

      const rotationStyleGen = function(block) {
        const style = block.getFieldValue('STYLE') || 'allaround';
        return `set_rotation_style(${JSON.stringify(style)});\n`;
      };
      BlocklyJS.javascriptGenerator.forBlock['motion_setrotationstyle'] = rotationStyleGen;
      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_rotation_style'] = rotationStyleGen;
      BlocklyJS.javascriptGenerator.forBlock['bb_motion_set_rotation_style'] = rotationStyleGen;

      BlocklyJS.javascriptGenerator.forBlock['motion_turnright'] = function(block) {
        const deg = block.getFieldValue('DEGREES') || 15;
        return `turn_right(${deg});\n`;
      };
      BlocklyJS.javascriptGenerator.forBlock['motion_turnleft'] = function(block) {
        const deg = block.getFieldValue('DEGREES') || 15;
        return `turn_left(${deg});\n`;
      };
      BlocklyJS.javascriptGenerator.forBlock['motion_movesteps'] = function(block) {
        const steps = block.getFieldValue('STEPS') || 10;
        return `move_steps(${steps});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_motion_jump'] = function(block) {
        const power = block.getFieldValue('POWER');
        return `jump(${power});\n`;
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

      BlocklyJS.javascriptGenerator.forBlock['bb_sound_volume'] = function(block) {
        const v = block.getFieldValue('VOLUME') || 100;
        return `set_volume(${v});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_motion_speed'] = function(block) {
        const s = block.getFieldValue('SPEED') || 5;
        return `set_speed(${s});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_action_alert'] = function(block) {
        const message = block.getFieldValue('MESSAGE') || 'Notice';
        return `alert(${JSON.stringify(message)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_list_create'] = function(block) {
        const name = block.getFieldValue('NAME') || 'myList';
        return `list_create(${JSON.stringify(name)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_list_add'] = function(block) {
        const item = block.getFieldValue('ITEM') || '';
        const list = block.getFieldValue('LIST') || 'myList';
        return `list_add(${JSON.stringify(list)}, ${JSON.stringify(item)});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_list_get'] = function(block) {
        const idx = block.getFieldValue('INDEX') || 1;
        const list = block.getFieldValue('LIST') || 'myList';
        return `list_get(${JSON.stringify(list)}, ${idx});\n`;
      };

      BlocklyJS.javascriptGenerator.forBlock['bb_sense_timer'] = function() {
        return ['timer()', BlocklyJS.javascriptGenerator.ORDER_FUNCTION_CALL];
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

      const stub = (name) => function () {
        return `// ${name}\n`;
      };
      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_setsize'] = stub('set size');
      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_show'] = stub('show');
      BlocklyJS.javascriptGenerator.forBlock['bb_sprite_hide'] = stub('hide');
      BlocklyJS.javascriptGenerator.forBlock['bb_var_set'] = function (block) {
        const name = block.getFieldValue('NAME') || 'v';
        const value = block.getFieldValue('VALUE') || '0';
        return `${name} = ${value};\n`;
      };
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_grow'] = stub('grow');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_shrink'] = stub('shrink');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_costume'] = stub('costume');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_next_costume'] = stub('next costume');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_color_effect'] = stub('color effect');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_ghost_effect'] = stub('ghost');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_clear_effects'] = stub('clear effects');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_front'] = stub('front');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_back'] = stub('back');
      BlocklyJS.javascriptGenerator.forBlock['bb_looks_think'] = stub('think');
      BlocklyJS.javascriptGenerator.forBlock['bb_motion_setx'] = stub('set x');
      BlocklyJS.javascriptGenerator.forBlock['bb_motion_sety'] = stub('set y');
      BlocklyJS.javascriptGenerator.forBlock['bb_motion_rotation'] = stub('rotation');
      BlocklyJS.javascriptGenerator.forBlock['bb_motion_change_angle'] = stub('angle');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_velocity'] = stub('velocity');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_gravity'] = stub('gravity');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_jump'] = stub('jump');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_allow_double_jump'] = stub('double jump');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_friction'] = stub('friction');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_push'] = stub('push');
      BlocklyJS.javascriptGenerator.forBlock['bb_physics_bounce'] = stub('bounce');
      BlocklyJS.javascriptGenerator.forBlock['bb_game_score_add'] = stub('score+');
      BlocklyJS.javascriptGenerator.forBlock['bb_game_score_set'] = stub('score=');
      BlocklyJS.javascriptGenerator.forBlock['bb_game_set_lives'] = stub('lives');

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
      <category name="Events" colour="324">
        <block type="event_whenflagclicked"></block>
        <block type="event_whenkeypressed"></block>
        <block type="event_whenthisspriteclicked"></block>
        <block type="event_broadcast"></block>
        <block type="event_broadcastandwait"></block>
        <block type="event_whenbroadcastreceived"></block>
      </category>
      <category name="Motion" colour="4">
        <block type="motion_movesteps"></block>
        <block type="motion_turnright"></block>
        <block type="motion_turnleft"></block>
        <block type="motion_goto"></block>
        <block type="motion_glide"></block>
        <block type="motion_pointindirection"></block>
        <block type="motion_pointtowards"></block>
        <block type="motion_changex"></block>
        <block type="motion_setx"></block>
        <block type="motion_changey"></block>
        <block type="motion_sety"></block>
        <block type="motion_ifonedgebounce"></block>
        <block type="motion_setrotationstyle"></block>
        <block type="motion_xposition"></block>
        <block type="motion_yposition"></block>
        <block type="motion_direction"></block>
      </category>
      <category name="Looks" colour="160">
        <block type="looks_sayforsecs"></block>
        <block type="looks_say"></block>
        <block type="looks_think"></block>
        <block type="looks_show"></block>
        <block type="looks_hide"></block>
        <block type="looks_switchcostume"></block>
        <block type="looks_nextcostume"></block>
        <block type="looks_costumenumbername"></block>
      </category>
      <category name="Sound" colour="268">
        <block type="sound_play"></block>
        <block type="sound_playuntildone"></block>
        <block type="sound_stopallsounds"></block>
      </category>
      <category name="Control" colour="212">
        <block type="control_wait"></block>
        <block type="control_repeat"></block>
        <block type="control_forever"></block>
        <block type="control_if"></block>
        <block type="control_if_else"></block>
        <block type="control_stop"></block>
      </category>
      <category name="Sensing" colour="#00BCD4">
        <block type="sensing_touchingobject"></block>
        <block type="sensing_touchingcolor"></block>
        <block type="sensing_coloristouchingcolor"></block>
        <block type="sensing_distanceto"></block>
        <block type="sensing_askandwait"></block>
        <block type="sensing_answer"></block>
        <block type="sensing_keypressed"></block>
        <block type="sensing_mousedown"></block>
        <block type="sensing_mousex"></block>
        <block type="sensing_mousey"></block>
        <block type="sensing_setdragmode"></block>
        <block type="sensing_loudness"></block>
        <block type="sensing_timer"></block>
        <block type="sensing_resettimer"></block>
        <block type="sensing_of"></block>
        <block type="sensing_current"></block>
        <block type="sensing_dayssince2000"></block>
        <block type="sensing_username"></block>
      </category>
      <category name="Variables" colour="268">
        <block type="data_setvariableto"></block>
        <block type="data_changevariableby"></block>
        <block type="data_variable"></block>
      </category>
      <category name="Operators" colour="#59C059">
        <block type="operator_add"></block>
        <block type="operator_multiply"></block>
        <block type="operator_random"></block>
        <block type="operator_compare"></block>
        <block type="operator_and"></block>
        <block type="operator_not"></block>
        <block type="operator_join"></block>
        <block type="operator_letterof"></block>
        <block type="operator_length"></block>
        <block type="operator_contains"></block>
        <block type="operator_mod"></block>
        <block type="operator_round"></block>
        <block type="operator_mathop"></block>
        <block type="operator_gt"></block>
        <block type="operator_lt"></block>
        <block type="operator_equals"></block>
        <block type="operator_or"></block>
      </category>
      <category name="Human Body" colour="351">
        <block type="body-video-on"></block>
        <block type="body-show-detections"></block>
        <block type="body-analyse"></block>
        <block type="body-get-count"></block>
        <block type="body-x-position"></block>
        <block type="body-y-position"></block>
        <block type="body-is-detected"></block>
        <block type="hand-analyse"></block>
        <block type="hand-is-detected"></block>
        <block type="hand-x-position"></block>
      </category>
      <category name="Face Detection" colour="#fbbf24">
        <block type="face_turn_video_on"></block>
        <block type="face_turn_video_off"></block>
        <block type="face_show_bounding"></block>
        <block type="face_hide_bounding"></block>
        <block type="face_set_threshold"></block>
        <block type="face_analyse_camera"></block>
        <block type="face_analyse_stage"></block>
        <block type="face_number_of"></block>
        <block type="face_visible"></block>
        <block type="face_expression"></block>
        <block type="face_x"></block>
        <block type="face_y"></block>
        <block type="face_size"></block>
        <block type="face_happy"></block>
      </category>
      <category name="Object Detection" colour="#9f1239">
        <block type="object_turn_video_on"></block>
        <block type="object_turn_video_off"></block>
        <block type="object_show_bounding"></block>
        <block type="object_hide_bounding"></block>
        <block type="object_set_threshold"></block>
        <block type="object_analyse_camera"></block>
        <block type="object_analyse_stage"></block>
        <block type="object_number_of"></block>
        <block type="object_class_of"></block>
        <block type="object_person_detected"></block>
        <block type="object_person_count"></block>
      </category>
      <category name="Speech Recognition" colour="#34d399">
        <block type="speech_listen"></block>
        <block type="speech_last_heard"></block>
      </category>
      <category name="Text-to-Speech" colour="#a78bfa">
        <block type="tts_speak"></block>
      </category>
      <category name="NLP" colour="#60a5fa">
        <block type="nlp_analyse_sentiment"></block>
        <block type="nlp_sentiment_value"></block>
        <block type="nlp_is_positive"></block>
      </category>
      <category name="Text Recognition" colour="#fcd34d">
        <block type="ocr_scan"></block>
        <block type="ocr_recognized_text"></block>
      </category>
      <category name="Translate" colour="#22d3ee">
        <block type="translate_text"></block>
        <block type="translate_result"></block>
      </category>
      <category name="Chat" colour="#fb7185">
        <block type="chat_ask"></block>
      </category>
      <category name="Image Classifier" colour="#c084fc">
        <block type="ic_turn_camera_on"></block>
        <block type="ic_analyse_frame"></block>
        <block type="ic_top_class"></block>
        <block type="ic_confidence"></block>
      </category>
      <category name="Pose Classifier" colour="#fb923c">
        <block type="pc_turn_camera_on"></block>
        <block type="pc_turn_camera_off"></block>
        <block type="pc_capture_pose"></block>
        <block type="pc_pose_name"></block>
        <block type="pc_pose_confidence"></block>
      </category>
      <category name="Audio Classifier" colour="#f472b6">
        <block type="ac_classify"></block>
        <block type="ac_sound_label"></block>
      </category>
      <category name="Text Classifier" colour="#818cf8">
        <block type="tc_add_training"></block>
        <block type="tc_classify"></block>
        <block type="tc_prediction_label"></block>
        <block type="tc_prediction_confidence"></block>
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
