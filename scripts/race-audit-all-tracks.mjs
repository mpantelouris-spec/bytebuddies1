/**
 * Audit all 10 rover biome tracks on production.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const URL = 'https://bytebuddies.technology/';
const OUT = '/tmp/bb-track-audit';

const TRACKS = [
  { id: 'rover_rover_obstacle_course', arena: 'sunset_coast_circuit', mode: 1 },
  { id: 'rover_balanced_sprint', arena: 'crystal_cavern_run', mode: 2 },
  { id: 'rover_cargo_delivery_relay', arena: 'sky_garden_ascent', mode: 3 },
  { id: 'rover_precision_parking_trial', arena: 'volcanic_inferno_pass', mode: 4 },
  { id: 'rover_reverse_driving_challenge', arena: 'cyber_city_circuit', mode: 5 },
  { id: 'rover_slalom_weave', arena: 'frost_peak_rally', mode: 6 },
  { id: 'rover_fuel_efficiency_cruise', arena: 'ancient_ruins_raceway', mode: 7 },
  { id: 'rover_tow_truck_pull', arena: 'stardust_galaxy_drift', mode: 8 },
  { id: 'rover_stop_and_go_traffic_drill', arena: 'meadow_valley_sprint', mode: 9 },
  { id: 'rover_rover_grand_tour', arena: 'shadow_metro_underpass', mode: 10 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const results = [];

for (const track of TRACKS) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.addInitScript((courseId) => {
    try {
      sessionStorage.setItem('vrd_welcome_done', '1');
      localStorage.setItem('bb-studio-robot', JSON.stringify({
        chassisId: 'rover', movementId: 'wheels', name: 'Rover X1',
        primaryColor: '#FF8C00', accentColor: '#FFD700',
      }));
      localStorage.setItem('bb-lab-active-course', courseId);
    } catch { /* ignore */ }
  }, track.id);

  const cb = Date.now();
  await page.goto(`${URL}?cb=${cb}#studio?course=${track.id}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await page.waitForTimeout(4000);

  const pipeline = page.locator('button').filter({ hasText: /Code \+ Simulate/i }).first();
  if (await pipeline.isVisible({ timeout: 6000 }).catch(() => false)) {
    await pipeline.click();
    await page.waitForTimeout(3000);
  }

  await page.waitForSelector('canvas', { timeout: 60000 }).catch(() => null);
  await page.screenshot({ path: `${OUT}/mode${track.mode}-before.png` }).catch(() => null);

  const simBtn = page.locator('button').filter({ hasText: /^▶ Simulate$/ }).first();
  if (await simBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    await simBtn.click();
  }
  await page.waitForTimeout(10000);

  await page.screenshot({ path: `${OUT}/mode${track.mode}-driving.png` }).catch(() => null);

  const debug = await page.evaluate(() => {
    const d = window.__bbRaceDebug;
    const canvas = document.querySelector('canvas');
    const rect = canvas?.getBoundingClientRect?.();
    return {
      hasDebug: !!d,
      rsY: d?.rs?.y,
      roadY: d?.roadY,
      wheelBottomY: d?.wheelBottomY,
      sunkGap: (d?.roadY != null && d?.wheelBottomY != null) ? d?.roadY - d?.wheelBottomY : null,
      track3D: d?.scene?.userData?.track3D,
      speed: d?.rs?.raceSpeedKmh,
      lap: d?.rs?.raceLap,
      raceMode: d?.scene?.userData?.raceMode,
      canvasW: rect?.width,
      canvasH: rect?.height,
    };
  }).catch((e) => ({ evalError: String(e) }));

  const entry = { ...track, ...debug, errors };
  results.push(entry);
  console.log(JSON.stringify(entry));
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 2));
await browser.close();
console.log(`\nWrote ${OUT}/report.json`);
