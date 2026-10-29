import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'raw-record');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const teacher = {
  name: 'Ms Taylor',
  avatar: 'MT',
  avatarEmoji: '👩‍🏫',
  role: 'teacher',
  level: 4,
  xp: 120,
  xpToNext: 500,
  badges: [],
  streak: 3,
  projectCount: 2,
  completedLessons: 8,
  joinDate: '2026-09-01',
  ageMode: 'standard',
  quizScores: {},
  weeklyXP: [10, 20, 15, 0, 0, 0, 0],
  timeSpent: 40,
  streakProtected: false,
  lastActiveDate: '2026-10-12',
  dailyQuestsCompleted: [],
  questProgress: {},
  unlockedThemes: ['default'],
  selectedBlockTheme: 'default',
  classroomId: null,
  leveledUp: false,
  email: 'teacher@bytebuddies.technology',
};

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({
  executablePath: fs.existsSync(chrome) ? chrome : undefined,
  headless: false,
  args: ['--hide-scrollbars', '--window-size=1920,1080'],
});
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
page.setDefaultTimeout(40000);

const sleep = (ms) => page.waitForTimeout(ms);

async function login() {
  await page.evaluate((user) => {
    localStorage.setItem('cv-loggedin', 'true');
    localStorage.setItem('cv-user', JSON.stringify(user));
    localStorage.setItem('bb_learn_role', 'teacher');
  }, teacher);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(1800);
}

await page.goto('https://bytebuddies.technology/', { waitUntil: 'domcontentloaded' });
await sleep(2200);
for (const y of [280, 560, 820, 1100]) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'smooth' }), y);
  await sleep(700);
}
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
await sleep(800);

await login();
await sleep(2200);

await page.goto('https://bytebuddies.technology/#learn', { waitUntil: 'domcontentloaded' });
await sleep(2800);
await page.evaluate(() => window.scrollBy({ top: 420, behavior: 'smooth' }));
await sleep(1400);

await page.goto('https://bytebuddies.technology/#studio', { waitUntil: 'domcontentloaded' });
await sleep(8000);
const canvas = page.locator('canvas').first();
if (await canvas.count()) {
  const box = await canvas.boundingBox();
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 160, y - 40, { steps: 24 });
    await page.mouse.move(x + 40, y + 80, { steps: 18 });
    await page.mouse.up();
  }
}
await sleep(1200);

await page.goto('https://bytebuddies.technology/#workspace', { waitUntil: 'domcontentloaded' });
await sleep(3500);
await page.getByText(/Space Invaders/i).first().click().catch(() => {});
await sleep(1800);

await page.goto('https://bytebuddies.technology/#missions', { waitUntil: 'domcontentloaded' });
await sleep(2500);
await page.evaluate(() => window.scrollBy({ top: 280, behavior: 'smooth' }));
await sleep(1200);

await page.goto('https://bytebuddies.technology/#classroom', { waitUntil: 'domcontentloaded' });
await sleep(2500);

await context.close();
await browser.close();
const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.webm'));
console.log('recorded', files.map((f) => path.join(outDir, f)));
