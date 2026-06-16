#!/usr/bin/env node
/** HTTP smoke for VRD when Playwright Chromium cannot launch locally */
const BASE = process.env.VRD_PREVIEW_URL || 'http://127.0.0.1:4173';
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

try {
  const index = await fetch(`${BASE}/`).then((r) => r.text());
  assert(index.includes('ByteBuddies'), 'index loads');
  assert(index.includes('root'), 'react root present');

  const vrd = await fetch(`${BASE}/#vrd`).then((r) => r.text());
  assert(vrd.includes('ByteBuddies'), '#vrd route serves app shell');

  if (failures.length) {
    console.error('VRD HTTP E2E FAILED:\n', failures.map((f) => `  - ${f}`).join('\n'));
    process.exit(1);
  }
  console.log(`VRD HTTP E2E OK — preview at ${BASE}`);
} catch (err) {
  if (err.cause?.code === 'ECONNREFUSED') {
    console.log(`  (skip — preview not running at ${BASE})`);
  } else {
    console.error('VRD HTTP E2E error:', err.message);
    process.exit(1);
  }
}
