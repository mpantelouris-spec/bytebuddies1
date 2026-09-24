#!/usr/bin/env node
/**
 * FIFA proof pack — screenshots + 45s match recording.
 * Usage: node scripts/football-proof-pack.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BASE = process.argv[2] || 'https://bytebuddies.technology';
const outDir = path.join(process.cwd(), 'docs', 'football-proof-pack');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PW_CHROME ? 'chrome' : undefined,
});

const FOOTBALL_ROBOT = {
  chassisId: 'footballbot',
  name: 'Striker FC',
  teamColor: 'green',
  jerseyNumber: 9,
  footballFighter: false,
  primaryColor: '#22c55e',
  accentColor: '#16a34a',
  footballBuilderConfig: {
    chassisId: 'rover',
    name: 'My Robot',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
  },
};

async function prepFootball(page) {
  await page.addInitScript((robot) => {
    try {
      sessionStorage.setItem('vrd_welcome_done', '1');
      localStorage.setItem('bb_football_cinema', 'true');
      localStorage.setItem('bb-lab-active-course', 'football_fifa');
      localStorage.setItem('bb-studio-robot', JSON.stringify(robot));
    } catch { /* ignore */ }
  }, FOOTBALL_ROBOT);
}

async function openFifaLab(page) {
  const url = `${BASE}/?qa=${Date.now()}#studio?course=football_fifa`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__BYTEBUDDIES_BUILD, { timeout: 90000 });
  await page.waitForSelector('.bb-studio', { timeout: 60000 });
  const labBtn = page.locator('button').filter({ hasText: 'Code + Simulate' });
  await labBtn.first().click({ timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 120000 });
  await page.waitForFunction(() => typeof window.__bbFootballDiag === 'function', { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function openPenaltyLab(page) {
  const url = `${BASE}/?qa=${Date.now()}#studio`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__BYTEBUDDIES_BUILD, { timeout: 90000 });
  await page.waitForSelector('.bb-studio', { timeout: 60000 });
  await page.getByRole('button', { name: /Code \+ Simulate/i }).click({ timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.getByRole('button', { name: /Football Modes/i }).click({ timeout: 20000 });
  await page.waitForTimeout(800);
  await page.locator('.fight-hub-overlay button').filter({ hasText: 'Penalty Shootout' }).click({ timeout: 20000 });
  await page.waitForTimeout(4000);
}

const report = { base: BASE, shots: [], build: null, checks: {} };

// 1 — Wide FIFA 3v3 (cinema on)
const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await prepFootball(page1);
await openFifaLab(page1);
report.build = await page1.evaluate(() => window.__BYTEBUDDIES_BUILD);
const cinemaOn = await page1.evaluate(() => document.querySelector('.bb-football-cinema') != null);
report.checks.cinemaLayout = cinemaOn;
const wideShot = path.join(outDir, 'fifa_3v3_wide.png');
await page1.screenshot({ path: wideShot });
report.shots.push('fifa_3v3_wide.png');
await page1.close();

// 2 — Close-up (show code briefly then cinema for pitch framing)
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await prepFootball(page2);
await openFifaLab(page2);
await page2.waitForTimeout(2000);
const closeShot = path.join(outDir, 'fifa_builder_close.png');
await page2.screenshot({ path: closeShot });
report.shots.push('fifa_builder_close.png');
await page2.close();

// 3 — Penalty mode
const page3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page3.addInitScript((robot) => {
  try {
    sessionStorage.setItem('vrd_welcome_done', '1');
    localStorage.setItem('bb_football_cinema', 'true');
    localStorage.setItem('bb-studio-robot', JSON.stringify(robot));
  } catch { /* ignore */ }
}, FOOTBALL_ROBOT);
await openPenaltyLab(page3);
const penaltyShot = path.join(outDir, 'penalty_backdrop.png');
await page3.screenshot({ path: penaltyShot });
report.shots.push('penalty_backdrop.png');
report.checks.penaltyHint = await page3.locator('.football-arena-entry, .fight-arena-entry-hint').first().textContent().catch(() => '');
await page3.close();

// 4 — 45s match capture (screenshot burst — no ffmpeg dependency)
const page4 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await prepFootball(page4);
await openFifaLab(page4);
await page4.waitForFunction(() => typeof window.__bbFootballDiag === 'function', { timeout: 60000 });
const snap0 = await page4.evaluate(() => window.__bbFootballDiag());
report.checks.runtimeKeys = snap0?.runtimeKeys || [];
report.checks.simActiveAtStart = snap0?.simActive;
report.checks.fifaLive = snap0?.fifaLive;
await page4.waitForTimeout(5000);
const snap5 = await page4.evaluate(() => window.__bbFootballDiag());
const movedBots = (snap5?.bots || []).filter((b, i) => {
  const start = snap0?.bots?.find((s) => s.id === b.id);
  if (!start) return false;
  return Math.hypot(b.x - start.x, b.z - start.z) > 0.35;
});
report.checks.botsMoved5s = movedBots.map((b) => b.id);
report.checks.allGreenMoved = ['p0', 'p1', 'p2'].every((id) => report.checks.botsMoved5s.includes(id));
report.checks.passes5s = snap5?.score?.passes ?? 0;
report.checks.shots5s = snap5?.score?.shots ?? 0;
const startBtn = page4.locator('.football-sim-idle-banner, .bb-vp-run-btn').first();
if (await startBtn.isVisible().catch(() => false)) {
  await startBtn.click({ timeout: 15000 });
}
for (let i = 1; i <= 3; i += 1) {
  await page4.waitForTimeout(15000);
  const shot = path.join(outDir, `match_t${i * 15}s.png`);
  await page4.screenshot({ path: shot });
  report.shots.push(`match_t${i * 15}s.png`);
}
report.checks.goalMoments = await page4.locator('.fifa-goal-banner, .football-goal-flash').count();
const matchEndShot = path.join(outDir, 'match_after_45s.png');
await page4.screenshot({ path: matchEndShot });
report.shots.push('match_after_45s.png');
await page4.close();

await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log('Football proof pack saved to', outDir);
console.log('Build:', report.build);
console.log('Cinema layout:', report.checks.cinemaLayout);
console.log('Shots:', report.shots.join(', '));

console.log('Runtime keys:', report.checks.runtimeKeys?.join(', '));
console.log('Sim active:', report.checks.simActiveAtStart, 'FIFA live:', report.checks.fifaLive);
console.log('Green bots moved (5s):', report.checks.botsMoved5s?.join(', '));
console.log('All green moved:', report.checks.allGreenMoved);
console.log('Passes/shots (5s):', report.checks.passes5s, report.checks.shots5s);

const bad = !report.build?.includes('v111') && !report.build?.includes('fifa');
if (!report.checks.cinemaLayout) {
  console.warn('WARN: cinema layout class not detected');
}
if (!report.checks.allGreenMoved) {
  console.warn('WARN: not all green bots moved in first 5s');
}
if (bad) {
  console.warn('WARN: build stamp may be stale:', report.build);
}

await browser.close();
