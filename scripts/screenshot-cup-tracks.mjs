/**
 * Headless screenshots of all 10 CodeRacer cup tracks.
 * Full page load per track so SPA tab state cannot leak Sunset Cove.
 * Usage: node scripts/screenshot-cup-tracks.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BASE = process.argv[2] || 'https://bytebuddies.technology';
const TRACKS = [
  ['sunset_cove_01', 'Sunset Cove'],
  ['candy_carnival_01', 'Candy Carnival'],
  ['neon_metro_01', 'Neon Metro'],
  ['cloud_citadel_01', 'Cloud Citadel'],
  ['jungle_ruins_01', 'Jungle Ruins'],
  ['frost_peak_01', 'Frost Peak'],
  ['lava_foundry_01', 'Lava Foundry'],
  ['star_station_01', 'Star Station'],
  ['fairy_glen_01', 'Fairy Glen'],
  ['thunder_ridge_01', 'Thunder Ridge'],
];

const outDir = path.join(process.cwd(), 'docs', 'cup-track-screenshots');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PW_CHROME ? 'chrome' : undefined,
});

function waitForWorldLog(page, trackId, timeoutMs = 28000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (text) => {
      if (done) return;
      done = true;
      page.off('console', onMsg);
      resolve(text);
    };
    const timer = setTimeout(() => finish(''), timeoutMs);
    const onMsg = (msg) => {
      const t = msg.text();
      if (t.includes('[TrackWorld]') && t.includes(trackId) && /scenery-populated|props/.test(t)) {
        clearTimeout(timer);
        finish(t);
      }
    };
    page.on('console', onMsg);
  });
}

const report = [];

for (const [trackId, shortName] of TRACKS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on('console', (msg) => {
    const t = msg.text();
    if (/\[TrackWorld]|\[TrackGltf]|\[TrackStartHero]|\[RealGameWorld]/.test(t)) logs.push(t);
  });
  const worldWait = waitForWorldLog(page, trackId);
  const url = `${BASE}/?qa=${Date.now()}#studio?track=${trackId}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const worldLog = (await worldWait) || logs.find((l) => l.includes('[TrackWorld]') && l.includes(trackId)) || '';
  await page.waitForFunction(
    (name) => {
      const el = document.querySelector('.bb-viewport-toolbar .bb-track-cup-btn--active .bb-track-cup-name');
      return el && el.textContent.includes(name);
    },
    shortName,
    { timeout: 20000 },
  ).catch(() => null);
  await page.waitForTimeout(3500);
  const build = await page.evaluate(() => window.__BYTEBUDDIES_BUILD);
  const active = await page.locator('.bb-viewport-toolbar .bb-track-cup-btn--active .bb-track-cup-name')
    .textContent()
    .catch(() => '');
  const gltfLog = logs.find((l) => l.includes('[TrackGltf]') && l.includes(trackId)) || '';
  const minimap = await page.locator('.rc-minimap, [class*="minimap"]').first().textContent().catch(() => '');
  const shot = path.join(outDir, `${trackId}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  const tabOk = (active || '').replace(/\s+/g, ' ').includes(shortName);
  console.log(`${trackId} active="${(active || '').trim()}" tabOk=${tabOk} build=${build}`);
  console.log(' ', worldLog || '(no TrackWorld)');
  console.log(' ', gltfLog || '(no TrackGltf)');
  report.push({
    trackId,
    shortName,
    active: (active || '').trim(),
    tabOk,
    build,
    worldLog,
    gltfLog,
    minimap: (minimap || '').slice(0, 180),
    shot: `docs/cup-track-screenshots/${trackId}.png`,
  });
  await page.close();
}

await writeFile(path.join(outDir, 'console-dump.json'), JSON.stringify(report, null, 2));
console.log(`Screenshots saved to ${outDir}`);
const bad = report.filter((r) => !r.tabOk);
if (bad.length) {
  console.error('TAB MISMATCH:', bad.map((r) => `${r.trackId}→${r.active}`).join(', '));
  process.exitCode = 1;
}
await browser.close();
