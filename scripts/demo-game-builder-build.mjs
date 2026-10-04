/**
 * Headed walkthrough: add sprites, a backdrop, coding blocks, then Play.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BB_DEMO_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({
  headless: false,
  channel: process.env.PW_CHANNEL || 'chrome',
  slowMo: Number(process.env.BB_SLOWMO || 350),
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

async function clickFlyout(index = 0) {
  await page.evaluate((i) => {
    const blocks = [...document.querySelectorAll('.blocklyFlyout .blocklyDraggable')];
    const el = blocks[i];
    if (!el) return;
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.click();
  }, index);
}

console.log('Opening Game Builder…');
await page.goto(`${BASE}/#gamebuilder`, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: /Play/i }).waitFor({ timeout: 60_000 });
await page.waitForTimeout(800);

console.log('Adding sprites from the library…');
await page.getByRole('button', { name: /^Library$/ }).click();
await page.getByRole('button', { name: /^Adventurer$/ }).first().click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /^Library$/ }).click();
const animals = page.getByRole('button', { name: /^Animals$/ });
if (await animals.count()) await animals.click();
await page.waitForTimeout(300);
const fox = page.getByRole('button', { name: /^Fox$/ }).first();
if (await fox.count()) await fox.click();
else await page.getByRole('button', { name: /^New sprite$/ }).click();

console.log('Picking a backdrop…');
await page.getByRole('button', { name: /Backdrop/ }).click();
await page.waitForTimeout(400);
const forest = page.locator('button').filter({ hasText: /^Forest$/ }).first();
if (await forest.count()) await forest.click({ force: true });
else {
  const beach = page.locator('button').filter({ hasText: /^Beach$/ }).first();
  if (await beach.count()) await beach.click({ force: true });
}

console.log('Adding code blocks…');
await clickToolbox('Events');
await page.waitForTimeout(400);
await clickFlyout(0);
await clickToolbox('Looks');
await page.waitForTimeout(400);
await clickFlyout(0);
await clickToolbox('Motion');
await page.waitForTimeout(400);
await clickFlyout(0);

await page.evaluate(() => {
  const names = ['when green flag clicked', 'say for seconds', 'move steps', 'turn clockwise degrees'];
  for (const name of names) {
    window.dispatchEvent(new CustomEvent('bb-add-sidebar-block', { detail: { name } }));
  }
});
await page.waitForTimeout(600);

console.log('Pressing Play…');
await page.getByRole('button', { name: /Play/i }).click();
await page.waitForTimeout(4000);
await page.screenshot({ path: '/tmp/bb-gb/built-project.png' });
console.log('Leaving the window open so you can watch…');
await page.waitForTimeout(20000);
await browser.close();
