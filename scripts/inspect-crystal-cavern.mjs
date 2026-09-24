/**
 * Headless browser inspection — Crystal Cavern Run on production.
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const OUT = '/tmp/bb-crystal-inspect';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const logs = [];
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

await page.addInitScript(() => {
  localStorage.setItem('bb-studio-robot', JSON.stringify({
    name: 'Rover X1',
    chassisId: 'rover',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    movementId: 'wheels',
    sensors: ['camera'],
  }));
  localStorage.setItem('bb-lab-active-course', 'rover_balanced_sprint');
});

const urls = [
  'https://bytebuddies.technology/#studio?course=rover_balanced_sprint',
  'https://bytebuddies.technology/#academy',
  'https://bytebuddies.technology/#robot',
];

const report = [];

for (const url of urls) {
  logs.length = 0;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(8000);

  const slug = url.split('#')[1].replace(/[?=&]/g, '_');
  await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: false });

  const dom = await page.evaluate(() => ({
    hash: location.hash,
    build: window.__BYTEBUDDIES_BUILD || null,
    badge: !!document.querySelector('.bb-biome-debug-badge'),
    badgeText: document.querySelector('.bb-biome-debug-badge')?.textContent?.trim() || null,
    skyPlate: !!document.querySelector('.bb-biome-sky-plate'),
    skyBg: document.querySelector('.bb-biome-sky-plate')?.style?.backgroundImage?.slice(0, 80) || null,
    gameRoot: !!document.querySelector('.bb-game-root'),
    studio: !!document.querySelector('.bb-studio'),
    academy: !!document.querySelector('.vrd-app--academy'),
    robotPanel: !!document.querySelector('.robot-block-canvas'),
    canvasCount: document.querySelectorAll('canvas').length,
    wrongCourse: !!document.querySelector('.bb-biome-wrong-course'),
  }));

  const relevantLogs = logs.filter((l) =>
    /CrystalCavern|arenaType|crystal_cavern|biome|DEBUG.*SimCanvas|buildRacingCourse/i.test(l),
  );

  report.push({ url, dom, relevantLogs: relevantLogs.slice(0, 15) });
}

await browser.close();

console.log(JSON.stringify(report, null, 2));
console.log(`Screenshots: ${OUT}`);
