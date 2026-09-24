/**
 * Live Lab + Game Builder — coding block execution (preview e2e).
 */
import { test, expect } from '@playwright/test';

async function openLiveLab(page, robot = {
  name: 'Rover X1',
  chassisId: 'rover',
  primaryColor: '#FF8C00',
  movementId: 'wheels',
  sensors: ['camera'],
  tools: [],
}) {
  await page.addInitScript((r) => {
    try { localStorage.setItem('bb-studio-robot', JSON.stringify(r)); } catch { /* ignore */ }
  }, robot);
  await page.goto('/#studio', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Code \+ Simulate/i }).click();
  await page.waitForSelector('.bb-game-root', { timeout: 30_000 });
}

async function addBlockAndSimulate(page, category, blockLabel) {
  await page.getByRole('button', { name: new RegExp(category, 'i') }).click();
  await page.locator('.scratch-pal-block').filter({ hasText: new RegExp(blockLabel, 'i') }).first().click();
  await page.getByRole('button', { name: /Simulate/i }).click();
  await expect(page.locator('.ll-countdown-overlay')).toBeHidden({ timeout: 20_000 });
  await expect(page.locator('.scratch-script-block.executing, .bb-exec-pill, .bb-exec-block')).toBeVisible({ timeout: 15_000 });
}

test.describe('Live Lab block execution', () => {
  test('BLK-001 flappy starter script runs', async ({ page }) => {
    await openLiveLab(page, {
      name: 'Sling-B', chassisId: 'birdbot', primaryColor: '#FF8C00', accentColor: '#FFD700',
      movementId: 'flying', sensors: ['camera'], tools: [],
    });
    await page.locator('.scratch-mission-btn').click();
    await page.waitForSelector('.gls-overlay', { timeout: 10_000 });
    await page.getByText(/Flappy Bird/i).first().click();
    await expect(page.locator('.blockly-inject-root')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Simulate/i }).click();
    await expect(page.locator('.ll-countdown-overlay')).toBeHidden({ timeout: 20_000 });
    await expect(page.locator('.bb-exec-block, .bb-exec-pill')).toBeVisible({ timeout: 12_000 });
  });

  test('BLK-002 move_forward advances rover', async ({ page }) => {
    await openLiveLab(page);
    await addBlockAndSimulate(page, 'Movement', 'Move forward');
  });

  test('BLK-003 turn_left executes', async ({ page }) => {
    await openLiveLab(page);
    await addBlockAndSimulate(page, 'Movement', 'Turn left');
  });

  test('BLK-004 set_speed executes', async ({ page }) => {
    await openLiveLab(page);
    await addBlockAndSimulate(page, 'Movement', 'Set speed');
  });

  test('BLK-005 repeat + move stack executes', async ({ page }) => {
    await openLiveLab(page);
    await page.getByRole('button', { name: /Loops/i }).click();
    await page.locator('.scratch-pal-block').filter({ hasText: /Repeat/i }).first().click();
    await page.getByRole('button', { name: /Movement/i }).click();
    await page.locator('.scratch-pal-block').filter({ hasText: /Move forward/i }).first().click();
    await page.getByRole('button', { name: /Simulate/i }).click();
    await expect(page.locator('.ll-countdown-overlay')).toBeHidden({ timeout: 20_000 });
    await expect(page.locator('.scratch-script-block.executing, .bb-exec-pill')).toBeVisible({ timeout: 15_000 });
  });

  test('BLK-006 hover robot fly_up block', async ({ page }) => {
    await openLiveLab(page, {
      name: 'Hover-1', chassisId: 'hover', primaryColor: '#a855f7', movementId: 'hover', sensors: [], tools: [],
    });
    await addBlockAndSimulate(page, 'Movement', 'Fly up');
  });

  test('BLK-007 walker jump block', async ({ page }) => {
    await openLiveLab(page, {
      name: 'Walker', chassisId: 'humanoid', primaryColor: '#22c55e', movementId: 'legs', sensors: [], tools: [],
    });
    await addBlockAndSimulate(page, 'Movement', 'Jump');
  });
});

test.describe('Game Builder route', () => {
  test('GB-001 game builder page loads block workspace', async ({ page }) => {
    await page.goto('/#game-builder', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/Game Builder|Blocks|Sprite/i, { timeout: 15_000 });
  });
});
