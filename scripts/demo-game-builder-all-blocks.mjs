/**
 * Add every Game Builder coding-block palette entry onto the workspace, then Play.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BB_DEMO_URL || 'http://127.0.0.1:4173';
const CATEGORIES = [
  { name: 'Motion', blocks: ['move steps', 'turn clockwise degrees', 'turn anticlockwise degrees', 'go to random position', 'go to mouse-pointer', 'go to', 'go to x,y', 'glide secs to random position', 'glide secs to', 'glide secs to x,y', 'point in direction', 'point towards', 'change x by', 'set x to', 'change y by', 'set y to', 'if on edge, bounce', 'set rotation style', 'x position', 'y position', 'direction'] },
  { name: 'Looks', blocks: ['say for seconds', 'say', 'think for seconds', 'think', 'switch costume to', 'next costume', 'switch backdrop to', 'next backdrop', 'change color effect by', 'set color effect to', 'clear graphic effects', 'change size by', 'set size to', 'show', 'hide', 'go to front layer', 'go to back layer', 'go forward layers', 'costume number', 'backdrop number', 'size'] },
  { name: 'Sound', blocks: ['start sound', 'play sound until done', 'stop all sounds', 'change pitch effect by', 'set pitch effect to', 'clear sound effects', 'set volume to', 'volume'] },
  { name: 'Events', blocks: ['when green flag clicked', 'when key pressed', 'when this sprite clicked', 'when backdrop switches to', 'when greater than', 'when I receive message', 'broadcast', 'broadcast and wait'] },
  { name: 'Control', blocks: ['wait seconds', 'repeat', 'forever', 'if then', 'if then else', 'wait until', 'repeat until', 'stop', 'when I start as a clone', 'create clone of', 'delete this clone'] },
  { name: 'Sensing', blocks: ['touching', 'touching color', 'color is touching', 'distance to', 'ask and wait', 'answer', 'key pressed', 'mouse down', 'mouse x', 'mouse y', 'set drag mode', 'loudness', 'timer', 'reset timer', 'current year', 'days since 2000', 'username'] },
  { name: 'Operators', blocks: ['add', 'subtract', 'multiply', 'divide', 'pick random to', 'greater than', 'less than', 'equals', 'and', 'or', 'not', 'join', 'letter of', 'length of', 'contains', 'mod', 'round', 'math operation of'] },
  { name: 'Variables', blocks: ['set variable to', 'change variable by', 'show variable', 'hide variable'] },
  { name: 'Lists', blocks: ['add to list', 'delete of list', 'delete all of list', 'insert at of list', 'replace item of list with', 'item of list', 'item # of in list', 'length of list', 'list contains', 'show list', 'hide list'] },
  { name: 'Text', blocks: ['letter of', 'length of', 'contains'] },
  { name: 'My Blocks', blocks: ['define', 'run custom block'] },
];
const ALL_LABELS = CATEGORIES.flatMap((c) => c.blocks);

const browser = await chromium.launch({
  headless: false,
  channel: process.env.PW_CHANNEL || 'chrome',
  slowMo: Number(process.env.BB_SLOWMO || 80),
  args: ['--disable-gpu', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
await page.addInitScript(() => {
  localStorage.setItem('cv-loggedin', 'true');
  localStorage.setItem('cv-user', JSON.stringify({
    name: 'Block Tester',
    avatarEmoji: '🧑‍💻',
    level: 1,
    xp: 0,
    xpToNext: 500,
    badges: [],
    streak: 0,
    projectCount: 0,
    completedLessons: 0,
    joinDate: '2026-09-01',
    role: 'student',
    ageMode: 'standard',
  }));
});

async function clickToolbox(name) {
  await page.evaluate((label) => {
    const nodes = [...document.querySelectorAll('.blocklyToolboxCategory')];
    const el = nodes.find((n) => n.innerText.toLowerCase().includes(label.toLowerCase()));
    el?.click();
  }, name);
}

console.log(`Opening Game Builder — ${ALL_LABELS.length} coding blocks…`);
await page.goto(`${BASE}/#gamebuilder`, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: /Play/i }).waitFor({ timeout: 60_000 });
await page.waitForTimeout(600);

if (await page.getByText(/Select a sprite/i).count()) {
  await page.getByRole('button', { name: /New sprite/i }).click();
  await page.waitForTimeout(400);
}

for (const cat of CATEGORIES) {
  console.log(`  toolbox: ${cat.name} (${cat.blocks.length})`);
  await clickToolbox(cat.name);
  await page.waitForTimeout(180);
  const n = await page.locator('.blocklyFlyout .blocklyDraggable').count();
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => {
      const blocks = [...document.querySelectorAll('.blocklyFlyout .blocklyDraggable')];
      const el = blocks[idx];
      if (!el) return;
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      el.click();
    }, i);
    await page.waitForTimeout(70);
  }
}

console.log('  adding any palette labels still missing…');
await page.evaluate((labels) => {
  for (const name of labels) {
    window.dispatchEvent(new CustomEvent('bb-add-sidebar-block', { detail: { name } }));
  }
}, ALL_LABELS);
await page.waitForTimeout(800);

console.log('Pressing Play…');
await page.getByRole('button', { name: /Play/i }).click();
await page.screenshot({ path: '/tmp/bb-gb/all-coding-blocks.png' });
console.log('Leaving the window open…');
await page.waitForTimeout(18000);
await browser.close();
