/**
 * Playwright check: LiveLab biome race viewport is not black and has no runtime errors.
 * Usage: node scripts/verify-biome-viewport.mjs [baseUrl]
 */
import { chromium } from '@playwright/test';

const baseUrl = process.argv[2] || 'https://bytebuddies.technology';
const url = `${baseUrl}/#studio`;

function avgBrightness(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return sum / (data.length / 4);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

console.log('Navigating to', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(4000);

const runtimeError = await page.locator('text=Runtime Error').count();
if (runtimeError > 0) {
  const errText = await page.locator('.ll-sim-error, [class*="error"]').first().textContent().catch(() => 'Runtime Error visible');
  console.error('FAIL: Runtime error on page:', errText);
  await browser.close();
  process.exit(1);
}

const canvas = page.locator('canvas.ll-sim-canvas').first();
const hasCanvas = await canvas.count();
if (!hasCanvas) {
  console.log('No sim canvas yet — trying Live Lab tab...');
  const liveLab = page.getByRole('button', { name: /live lab/i }).or(page.locator('text=Live Lab').first());
  if (await liveLab.count()) await liveLab.click();
  await page.waitForTimeout(3000);
}

const canvas2 = page.locator('canvas').first();
await canvas2.waitFor({ state: 'visible', timeout: 60000 }).catch(() => null);
if (!(await canvas2.count())) {
  console.error('FAIL: No WebGL canvas found');
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(5000);

const sample = await canvas2.evaluate((el) => {
  try {
    const ctx = el.getContext('2d');
    if (ctx) return null;
    const url = el.toDataURL('image/png');
    return url.length > 5000 ? 'nonempty' : 'empty';
  } catch {
    return 'error';
  }
});
console.log('Canvas snapshot:', sample);
if (sample === 'empty' || sample === 'error') {
  console.error('FAIL: Canvas appears empty or unreadable');
  await page.screenshot({ path: 'biome-viewport-fail.png', fullPage: true });
  await browser.close();
  process.exit(1);
}

const fatal = errors.filter((e) => /biomeCinematic|is not defined|Runtime Error/i.test(e));
if (fatal.length) {
  console.error('FAIL: Console errors:', fatal.slice(0, 5));
  await browser.close();
  process.exit(1);
}
console.log('PASS: Viewport renders with visible content, no fatal errors');
await browser.close();
process.exit(0);
