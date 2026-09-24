/**
 * Register every Flappy block type with Blockly and report failures.
 */
import { JSDOM } from 'jsdom';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { getAllFlappyBlockTypes, buildFlappyBirdToolbox } from '../src/virtual-robot-designer/data/flappy-blockly-toolbox.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const liveLabSrc = fs.readFileSync(path.join(__dirname, '../src/virtual-robot-designer/studio/LiveLabPage.jsx'), 'utf8');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="mount" style="width:800px;height:600px"></div></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.SVGElement = dom.window.SVGElement;

// Minimal block defs extracted — register all robot_* from LiveLab (eval-free: manual import not possible)
// Instead duplicate critical defs inline for types we need to test
const STYLE = 'move_blocks';
const defs = [];
for (const m of liveLabSrc.matchAll(/\{\s*type\s*:\s*'(robot_[^']+)'[\s\S]*?\n\s*\}/g)) {
  const chunk = m[0];
  if (!getAllFlappyBlockTypes().some((t) => chunk.includes(`type:'${t}'`) || chunk.includes(`type:'${t}'`))) continue;
  try {
    // eslint-disable-next-line no-eval
    defs.push(eval(`(${chunk})`));
  } catch { /* skip malformed */ }
}

const typesNeeded = new Set(getAllFlappyBlockTypes());
const registered = new Set();
for (const def of defs) {
  if (!def?.type || registered.has(def.type)) continue;
  registered.add(def.type);
  try { Blockly.defineBlocksWithJsonArray([def]); } catch (e) {
    console.error('REG FAIL', def.type, e.message);
  }
}

const missingReg = [...typesNeeded].filter((t) => t !== 'math_number' && !Blockly.Blocks[t]);
if (missingReg.length) {
  console.error('Not registered:', missingReg.join(', '));
  process.exit(1);
}

const mount = document.getElementById('mount');
const ws = Blockly.inject(mount, {
  toolbox: buildFlappyBirdToolbox(),
  renderer: 'zelos',
  sounds: false,
});

const tb = ws.getToolbox();
const items = tb.getToolboxItems();
console.log('Categories:', items.length);
for (const item of items) {
  const name = item.getName?.() || '?';
  tb.setSelectedItem(item);
  const flyout = tb.getFlyout();
  const contents = flyout?.getContents?.() || flyout?.contents_ || [];
  const blockCount = Array.isArray(contents) ? contents.filter((c) => c?.kind === 'block').length : '?';
  console.log(`  ${name}: flyout blocks=${blockCount}`);
}

ws.dispose();
console.log('OK blockly flyout category test');
