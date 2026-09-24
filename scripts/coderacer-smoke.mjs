#!/usr/bin/env node
/**
 * CodeRacer smoke — one cup track loads in studio without console fatals.
 * Usage: node scripts/coderacer-smoke.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'https://bytebuddies.technology';
const TRACK = 'sunset_cove_01';
const failures = [];
function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PW_CHROME ? 'chrome' : undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('pageerror', (e) => failures.push(`PAGE: ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  if (/404|GLTFLoader|colormap\.png|favicon/i.test(text)) return;
  failures.push(`CONSOLE: ${text}`);
});

await page.addInitScript(() => {
  try {
    sessionStorage.setItem('vrd_welcome_done', '1');
    localStorage.setItem('bb-studio-robot', JSON.stringify({ chassisId: 'rover', name: 'Rover' }));
  } catch { /* ignore */ }
});

const url = `${BASE}/?qa=${Date.now()}#studio?track=${TRACK}`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(8000);

const build = await page.evaluate(() => window.__BYTEBUDDIES_BUILD);
const canvasCount = await page.locator('canvas').count();
const active = await page.locator('.bb-track-cup-btn--active .bb-track-cup-name').textContent().catch(() => '');

assert(canvasCount >= 1, 'canvas present');
assert(build && build.includes('2026'), `build stamp: ${build}`);
assert((active || '').includes('Sunset') || (active || '').includes('Cove'), `track tab: ${active}`);

await browser.close();

if (failures.length) {
  console.error('CodeRacer smoke FAILED:\n', failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`CodeRacer smoke OK — ${TRACK} build=${build}`);
