/**
 * Browser E2E — Virtual Robot Designer (Invention Workshop).
 * @tags vrd e2e
 */
import { test, expect } from '@playwright/test';

async function openDesigner(page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('vrd_welcome_done', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/#vrd', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.iw-app, .iw-welcome', { timeout: 30_000 });
}

async function dismissWelcome(page) {
  const skip = page.locator('.iw-welcome-skip');
  const go = page.locator('.iw-welcome-go');
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skip.click();
  } else if (await go.isVisible({ timeout: 2000 }).catch(() => false)) {
    await go.click();
  }
  await page.waitForSelector('.iw-app', { timeout: 20_000 });
}

test.describe('VRD E2E', () => {
  test('CF-001 app loads at #vrd without fatal console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.iw-palette').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.iw-hero-stage').first()).toBeVisible();
    const fatal = errors.filter((m) => !/ResizeObserver|Non-Error/i.test(m));
    expect(fatal).toEqual([]);
  });

  test('FT-001 tank chassis chip is clickable', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    const tank = page.locator('.iw-part-chip').filter({ hasText: /tank/i }).first();
    await expect(tank).toBeVisible({ timeout: 15_000 });
    await tank.click();
    await expect(tank).toHaveClass(/mounted/);
  });

  test('FT-013 save modal validates empty name', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    await page.getByRole('button', { name: /save design/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const nameInput = page.locator('#vrd-save-name');
    await nameInput.fill('');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByRole('alert')).toContainText(/name/i);
  });

  test('AT-002 escape closes save dialog', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    await page.getByRole('button', { name: /save design/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('FT-014 load design modal opens', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    await page.getByRole('button', { name: /load design/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('RT-001 desktop layout shows three columns', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.iw-palette')).toBeVisible();
    await expect(page.locator('.iw-hero-stage')).toBeVisible();
    await expect(page.locator('.iw-robot-panel')).toBeVisible();
  });

  test('RT-006 mobile viewport shows workshop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.iw-app')).toBeVisible();
  });

  test('CS-001 code studio shows bright unlock panel', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    await page.getByRole('button', { name: /code my robot/i }).click();
    await expect(page.locator('.al-code-studio')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.al-unlock-panel')).toBeVisible();
  });

  test('SIM-001 simulator shows bright test arena', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    await page.getByRole('button', { name: /test my robot/i }).click();
    await expect(page.locator('.al-simulator')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /run my robot/i })).toBeVisible();
  });
});
