import Blockly from 'blockly';
import { SIDEBAR_TO_TYPE, shortTypeToBlocklyType } from './blocks';
import {
  toolboxBlockJsonForLibraryEntry,
  resolveBlocklyTypeForLibraryLabel,
  blocklyTypeFromShort,
  SCRATCH_BLOCK_DEFAULT_FIELDS,
  libraryLabelFieldOverrides,
  isLibraryStubBlocklyType,
} from './blocklyToolboxEntries';

/** Attach default shadow/reporter blocks into empty value inputs so users can click and type. */
export function attachDefaultValueShadows(ws, block) {
  if (!ws || !block?.inputList) return;
  const shadows = {
    VALUE: { type: 'math_number', fields: { NUM: 0 } },
    STEPS: { type: 'math_number', fields: { NUM: 10 } },
    DEGREES: { type: 'math_number', fields: { NUM: 15 } },
    SECS: { type: 'math_number', fields: { NUM: 1 } },
    X: { type: 'math_number', fields: { NUM: 0 } },
    Y: { type: 'math_number', fields: { NUM: 0 } },
    DX: { type: 'math_number', fields: { NUM: 10 } },
    DY: { type: 'math_number', fields: { NUM: 10 } },
    CHANGE: { type: 'math_number', fields: { NUM: 10 } },
    SIZE: { type: 'math_number', fields: { NUM: 100 } },
    INDEX: { type: 'math_number', fields: { NUM: 1 } },
    ITEM: { type: 'text', fields: { TEXT: 'thing' } },
    MESSAGE: { type: 'text', fields: { TEXT: 'Hello!' } },
    QUESTION: { type: 'text', fields: { TEXT: "What's your name?" } },
    CONDITION: { type: 'operator_equals', fields: { OPERAND1: 0, OPERAND2: 0 } },
    OBJECT: { type: 'text', fields: { TEXT: 'mouse' } },
  };
  block.inputList.forEach((input) => {
    if (input.type !== Blockly.INPUT_VALUE) return;
    const conn = input.connection;
    if (!conn || conn.targetConnection) return;
    const spec = shadows[input.name];
    if (!spec?.type || !Blockly.Blocks[spec.type]) return;
    try {
      const shadow = ws.newBlock(spec.type);
      shadow.setShadow(true);
      shadow.initSvg();
      Object.entries(spec.fields || {}).forEach(([fname, fval]) => {
        if (shadow.getField(fname)) shadow.setFieldValue(String(fval), fname);
      });
      shadow.render();
      conn.connect(shadow.outputConnection);
    } catch (e) {
      /* ignore shadow attach errors */
    }
  });
}

/**
 * Create a fully configured Blockly block on a workspace from a sidebar/library label.
 * Returns the block, or null if creation failed.
 */
export function createBlockFromLibraryLabel(ws, blockLabel, options = {}) {
  if (!ws || !blockLabel) return null;
  const raw = String(blockLabel).trim();
  if (!raw) return null;

  const key = raw.toLowerCase();
  const short = SIDEBAR_TO_TYPE[key];
  const toolboxJson = toolboxBlockJsonForLibraryEntry(raw);
  let typeToCreate = resolveBlocklyTypeForLibraryLabel(raw, options.preferredType || toolboxJson?.type);
  if (!typeToCreate || !Blockly.Blocks[typeToCreate]) {
    typeToCreate = blocklyTypeFromShort(short);
  }
  if (!typeToCreate) typeToCreate = 'bb_generic_stack';
  if (!Blockly.Blocks[typeToCreate]) return null;

  let block;
  try {
    block = ws.newBlock(typeToCreate);
    block.initSvg();
  } catch (e) {
    console.warn('[createBlockFromLibraryLabel] failed', raw, typeToCreate, e);
    return null;
  }

  const sectionColor = options.color;
  if (sectionColor && typeof block.setColour === 'function') block.setColour(sectionColor);

  if (typeToCreate === 'bb_generic_stack') block.setFieldValue(raw, 'LABEL');
  if (isLibraryStubBlocklyType(typeToCreate)) {
    const nameField = block.getField('BLOCK_NAME') || block.getField('LABEL');
    if (nameField) nameField.setValue(raw);
  }

  const defaultFields = {
    ...(SCRATCH_BLOCK_DEFAULT_FIELDS[typeToCreate] || {}),
    ...(toolboxJson?.fields || {}),
    ...libraryLabelFieldOverrides(raw, typeToCreate, short),
  };
  if (typeToCreate === 'looks_gotofrontback') {
    const layerOverride = libraryLabelFieldOverrides(raw, typeToCreate, short).LAYER;
    defaultFields.LAYER = layerOverride || (short === 'looks-back' ? 'back' : 'front');
  }
  Object.entries(defaultFields).forEach(([fname, fval]) => {
    try {
      if (block.getField(fname)) block.setFieldValue(String(fval), fname);
    } catch (e) {
      /* ignore field mismatch */
    }
  });

  attachDefaultValueShadows(ws, block);
  block.render();
  const x = Number.isFinite(options.x) ? options.x : 24;
  const y = Number.isFinite(options.y) ? options.y : 24;
  block.moveBy(x, y);
  return block;
}
