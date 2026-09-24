import { chromium } from 'playwright';

const errors = [];
const logs = [];

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
page.on('console', (msg) => {
  const t = msg.type();
  const text = msg.text();
  if (t === 'error') errors.push(text);
  if (/SimCanvas|TrackBuilt|couldn|failed|ReferenceError|TypeError/i.test(text)) {
    logs.push(`[${t}] ${text}`);
  }
});
page.on('pageerror', (err) => errors.push(`PAGE: ${err.message}`));

await page.goto('https://bytebuddies.technology/#studio', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5000);

// Click Live Lab tab if present
const labTab = page.locator('button, [role="tab"]').filter({ hasText: /Live Lab|Invention Lab|Lab/i }).first();
if (await labTab.count()) {
  await labTab.click();
  await page.waitForTimeout(8000);
}

const simError = page.getByText('Simulator couldn', { exact: false });
const hasSimError = await simError.count() > 0;
if (hasSimError) {
  const txt = await simError.textContent();
  console.log('SIM ERROR UI:', txt?.slice(0, 500));
}

const canvas = page.locator('.ll-sim-canvas');
console.log('Canvas count:', await canvas.count());

console.log('--- logs ---');
logs.slice(0, 30).forEach((l) => console.log(l));
console.log('--- errors ---');
errors.slice(0, 15).forEach((e) => console.log(e));

await browser.close();
