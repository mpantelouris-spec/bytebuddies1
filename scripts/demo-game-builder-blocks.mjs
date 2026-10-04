/**
 * Visible Chrome walkthrough of Game Builder palettes + Play.
 * Usage: node scripts/demo-game-builder-blocks.mjs
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BB_DEMO_URL || 'http://127.0.0.1:4173';
const CATEGORIES = [
  'Motion', 'Looks', 'Sound', 'Events', 'Control', 'Sensing',
  'Operators', 'Variables', 'Lists', 'Text', 'My Blocks',
];

const browser = await chromium.launch({
  headless: false,
  channel: process.env.PW_CHANNEL || 'chrome',
  slowMo: Number(process.env.BB_SLOWMO || 280),
  args: ['--disable-gpu', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
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

console.log('Opening Game Builder…');
await page.goto(`${BASE}/#gamebuilder`, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: /Play/i }).waitFor({ timeout: 60_000 });
await page.locator('.blocklyToolboxDiv').first().waitFor({ state: 'attached', timeout: 60_000 });
await page.waitForTimeout(800);

async function clickCategory(page, name) {
  return page.evaluate((label) => {
    const nodes = [...document.querySelectorAll('.blocklyToolboxCategory')];
    const visible = nodes.filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && n.innerText.toLowerCase().includes(label.toLowerCase());
    });
    const el = visible[0] || nodes.find((n) => n.innerText.toLowerCase().includes(label.toLowerCase()));
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.click();
    return true;
  }, name);
}

for (const name of CATEGORIES) {
  const ok = await clickCategory(page, name);
  console.log(`  category: ${name} ${ok ? 'ok' : 'MISSING'}`);
  await page.waitForTimeout(450);
}

await clickCategory(page, 'Motion');
await page.evaluate(() => {
  const block = document.querySelector('.blocklyFlyout .blocklyDraggable');
  block?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  block?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  block?.click();
});
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Play/i }).click();
console.log('Pressed Play');
await page.waitForTimeout(1800);
if (await page.getByRole('button', { name: /Stop/i }).count()) {
  await page.getByRole('button', { name: /Stop/i }).click();
}
console.log('Demo finished — leaving browser open 8s');
await page.waitForTimeout(8000);
await browser.close();
