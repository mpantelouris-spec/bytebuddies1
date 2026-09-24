import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
const page = await browser.newPage();
const errors = [];
const logs = [];
const warns = [];

page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', (msg) => {
  const t = msg.type();
  const text = msg.text();
  if (t === 'error') errors.push(`CONSOLE: ${text}`);
  else if (t === 'warning') warns.push(text);
  else if (
    text.includes('TrackBuild') ||
    text.includes('TrackBuilt') ||
    text.includes('Error') ||
    text.includes('skipped') ||
    text.includes('BiomeAAA')
  ) {
    logs.push(text);
  }
});

await page.addInitScript(() => {
  try {
    sessionStorage.setItem('vrd_welcome_done', '1');
    localStorage.setItem('bb-studio-robot', JSON.stringify({ chassisId: 'rover', name: 'Rover' }));
  } catch {
    /* ignore */
  }
});

const urls = [
  'http://127.0.0.1:5173/#studio?track=garden_01&mode=1',
  'http://127.0.0.1:5173/#studio?course=rover_rover_obstacle_course',
];

for (const url of urls) {
  console.log('\n=== Navigating to', url, '===');
  errors.length = 0;
  logs.length = 0;
  warns.length = 0;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(12000);
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 3000));
  const hasRuntimeError = bodyText.includes('Runtime Error') || bodyText.includes('⚠️');
  const canvasCount = await page.locator('canvas').count();
  console.log('HAS RUNTIME ERROR:', hasRuntimeError);
  console.log('CANVAS COUNT:', canvasCount);
  console.log('BODY SNIPPET:', bodyText.slice(0, 600).replace(/\n/g, ' | '));
  console.log('ERRORS (' + errors.length + '):');
  errors.forEach((e) => console.log('  ', e));
  console.log('TRACK LOGS:');
  logs.forEach((l) => console.log('  ', l));
  console.log('WARNS (' + warns.length + '):');
  warns.slice(0, 10).forEach((w) => console.log('  ', w));
}

await page.screenshot({ path: '/tmp/bb-live-lab.png', fullPage: false });
console.log('\nScreenshot: /tmp/bb-live-lab.png');
await browser.close();
