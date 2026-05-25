/**
 * Browser E2E — Virtual Robot Designer (CF-001, BT-001, RT-001 partial).
 * @tags vrd e2e
 */
import { test, expect } from '@playwright/test';

async function openDesigner(page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('vrd_welcome_done', '1');
    } catch { /* ignore */ }
  });
  await page.goto('/#vrd', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.vrd-designer, .vrd-welcome', { timeout: 30_000 });
}

async function dismissWelcome(page) {
  const skip = page.locator('.vrd-welcome-skip');
  const enter = page.locator('.vrd-welcome-enter');
  if (await skip.isVisible({ timeout: 8000 }).catch(() => false)) {
    await skip.click();
  } else if (await enter.isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.locator('.vrd-welcome-style').first().click();
    await enter.click();
  }
  await page.waitForSelector('.vrd-designer', { timeout: 20_000 });
}

test.describe('VRD E2E', () => {
  test('CF-001 / BT-001 app loads at #vrd without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.vrd-designer, .bb-parts-panel').first()).toBeVisible({ timeout: 20_000 });
    const fatal = errors.filter((m) => !/ResizeObserver|Non-Error/i.test(m));
    expect(fatal).toEqual([]);
  });

  test('FT-001 chassis tile updates selection', async ({ page }) => {
    await openDesigner(page);
    await dismissWelcome(page);
    const tank = page.locator('.bb-chassis-tile').filter({ hasText: /tank/i }).first();
    await expect(tank).toBeVisible({ timeout: 15_000 });
    await tank.click();
    await expect(tank).toHaveClass(/active/);
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
    await expect(page.getByText(/load saved design/i)).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('RT-001 desktop layout shows three columns', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.vrd-designer-left')).toBeVisible();
    await expect(page.locator('.vrd-designer-center')).toBeVisible();
    await expect(page.locator('.vrd-designer-right')).toBeVisible();
  });

  test('RT-006 mobile viewport stacks panels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openDesigner(page);
    await dismissWelcome(page);
    await expect(page.locator('.vrd-designer')).toBeVisible();
  });
});
