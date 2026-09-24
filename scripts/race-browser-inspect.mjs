import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const URL = 'https://bytebuddies.technology/';
const CACHE_BUST = `cb=${Date.now()}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

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
await page.waitForTimeout(5000);

const pipeline = page.locator('button').filter({ hasText: /Code \+ Simulate/i }).first();
if (await pipeline.isVisible({ timeout: 8000 }).catch(() => false)) {
  await pipeline.click();
  await page.waitForTimeout(4000);
}

await page.waitForSelector('.ll-sim-canvas, canvas', { timeout: 60000 }).catch(() => null);
await page.screenshot({ path: '/tmp/bb-race-before-sim.png', timeout: 8000 }).catch(() => null);

const simBtn = page.locator('button').filter({ hasText: /^▶ Simulate$/ }).first();
if (await simBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
  await simBtn.click();
}

await page.waitForTimeout(12000);
await page.screenshot({ path: '/tmp/bb-race-after-sim.png', timeout: 8000 }).catch(() => null);

const debug = await page.evaluate(() => {
  const d = window.__bbRaceDebug;
  if (!d) return { ok: false, reason: 'no __bbRaceDebug' };
  return {
    ok: true,
    rsY: d.rs?.y,
    robotY: d.robot?.position?.y,
    wheelOffset: d.kartClearance ?? d.rs?._kartRoadClearance,
    wheelBottomY: d.wheelBottomY,
    roadY: d.roadY,
    bboxMinY: d.bboxMinY,
    sunkGap: (d.roadY != null && d.wheelBottomY != null) ? d.roadY - d.wheelBottomY : null,
    raceMode: d.scene?.userData?.raceMode,
    groundY: d.scene?.userData?.groundY,
    track3D: d.scene?.userData?.track3D,
    hasRoadMesh: !!d.scene?.userData?.raceRoadMesh,
    speed: d.rs?.raceSpeedKmh,
    lap: d.rs?.raceLap,
  };
}).catch((e) => ({ ok: false, reason: String(e) }));

writeFileSync('/tmp/bb-race-browser-report.json', JSON.stringify(debug, null, 2));
console.log(JSON.stringify(debug, null, 2));
await browser.close();
