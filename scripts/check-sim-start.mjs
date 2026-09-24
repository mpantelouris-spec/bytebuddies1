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
  if (text.includes('[SimCanvas') || text.includes('TrackBuilt') || text.includes('couldn') || text.includes('failed')) {
    logs.push(`[${t}] ${text}`);
  }
});
page.on('pageerror', (err) => errors.push(`PAGE: ${err.message}`));

try {
  await page.goto('https://bytebuddies.technology/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  console.log('TITLE:', await page.title());
  console.log('BODY snippet:', (await page.textContent('body'))?.slice(0, 200));
} catch (e) {
  console.error('NAV FAIL:', e.message);
}

console.log('--- logs ---');
logs.forEach((l) => console.log(l));
console.log('--- errors ---');
errors.slice(0, 20).forEach((e) => console.log(e));

await browser.close();
