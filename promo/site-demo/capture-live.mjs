import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'live-stills');
fs.mkdirSync(out, { recursive: true });

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
  lastActiveDate: '2026-10-10',
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
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});
page.setDefaultTimeout(35000);

async function login() {
  await page.evaluate((user) => {
    localStorage.setItem('cv-loggedin', 'true');
    localStorage.setItem('cv-user', JSON.stringify(user));
    localStorage.setItem('bb_learn_role', 'teacher');
  }, teacher);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
}

async function shot(name) {
  const file = path.join(out, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('shot', name);
}

await page.goto('https://bytebuddies.technology/', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(2500);
await shot('01-landing');
await page.evaluate(() => window.scrollTo(0, 780));
await page.waitForTimeout(700);
await shot('01b-landing-mid');

await login();
await shot('03-dashboard');

await page.goto('https://bytebuddies.technology/#learn', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3200);
await shot('02-learn');

await page.goto('https://bytebuddies.technology/#gamebuilder', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.getByText(/^Costumes$/i).first().click().catch(() => {});
await page.waitForTimeout(800);
await shot('04-gamebuilder');

await page.goto('https://bytebuddies.technology/#workspace', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);
await page.getByText(/Space Invaders/i).first().click().catch(() => {});
await page.waitForTimeout(1500);
await shot('05-python');

await page.goto('https://bytebuddies.technology/#studio', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await shot('06-studio');

await page.goto('https://bytebuddies.technology/#missions', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800);
await shot('07-missions');

await page.goto('https://bytebuddies.technology/#classroom', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2800);
await shot('08-classroom');

await page.goto('https://bytebuddies.technology/#robot', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await page.getByText(/Recipe/i).first().click().catch(() => {});
await page.waitForTimeout(400);
await page.getByText(/Load onto canvas/i).first().click().catch(() => {});
await page.waitForTimeout(800);
await shot('09-robot');

await browser.close();
console.log('done', out);
