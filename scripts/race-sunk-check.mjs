import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const URL = process.env.BB_URL || 'https://bytebuddies.technology/';
const CACHE_BUST = `cb=${Date.now()}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const logs = [];
page.on('console', (m) => logs.push(m.text()));
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${e.message}`));

await page.addInitScript(() => {
  try {
    sessionStorage.setItem('vrd_welcome_done', '1');
    localStorage.setItem('bb-studio-robot', JSON.stringify({
      chassisId: 'rover',
      movementId: 'wheels',
      name: 'Rover X1',
      primaryColor: '#FF8C00',
      accentColor: '#FFD700',
    }));
    localStorage.setItem('bb-lab-active-course', 'rover_rover_obstacle_course');
  } catch { /* ignore */ }
});

await page.goto(`${URL}?${CACHE_BUST}#studio?course=rover_rover_obstacle_course`, {
  waitUntil: 'domcontentloaded',
  timeout: 120000,
});
await page.waitForTimeout(4000);

// Open Code + Simulate pipeline step
const pipeline = page.locator('button').filter({ hasText: /Code \+ Simulate/i }).first();
if (await pipeline.isVisible({ timeout: 8000 }).catch(() => false)) {
  await pipeline.click();
  await page.waitForTimeout(3000);
}

// Wait for canvas
await page.waitForSelector('.ll-sim-canvas, canvas', { timeout: 60000 }).catch(() => null);
await page.waitForTimeout(2000);

const simBtn = page.locator('button').filter({ hasText: /^▶ Simulate$/ }).first();
if (await simBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
  await simBtn.click();
  await page.waitForTimeout(10000);
}

const debug = await page.evaluate(() => {
  const d = window.__bbRaceDebug;
  if (!d) return { ok: false, reason: 'no __bbRaceDebug' };
  const robot = d.robot;
  const rs = d.rs;
  const scene = d.scene;
  return {
    ok: true,
    rsY: rs?.y,
    robotY: robot?.position?.y,
    wheelOffset: d.kartClearance ?? rs?._kartRoadClearance ?? rs?._originAboveRoad,
    wheelBottomY: d.wheelBottomY,
    roadY: d.roadY ?? robot?.userData?._lastRoadY,
    bboxMinY: d.bboxMinY,
    bboxMaxY: d.bboxMaxY,
    sunkGap: (d.roadY != null && d.wheelBottomY != null) ? d.roadY - d.wheelBottomY : null,
    raceMode: scene?.userData?.raceMode,
    track3D: scene?.userData?.track3D,
    groundY: scene?.userData?.groundY,
    hasRoadMesh: !!scene?.userData?.raceRoadMesh,
  };
}).catch((e) => ({ ok: false, reason: String(e) }));

await page.screenshot({ path: '/tmp/bb-race-sunk.png', fullPage: false, timeout: 5000 }).catch(() => null);
writeFileSync('/tmp/bb-race-debug.json', JSON.stringify({ debug, logs: logs.slice(-30) }, null, 2));
console.log(JSON.stringify({ debug, logTail: logs.slice(-8) }, null, 2));
await browser.close();
