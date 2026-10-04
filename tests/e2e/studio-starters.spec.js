import { test, expect } from '@playwright/test';

test('Studio Build shows eight pre-built starters, not the full wall', async ({ page }) => {
  await page.goto('/#studio', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.bb-chassis-card', { timeout: 30_000 });

  const names = page.locator('.bb-chassis-card .bb-chassis-name');
  await expect(names).toHaveCount(11);
  await expect(page.getByText('Rover', { exact: true })).toBeVisible();
  await expect(page.getByText('Humanoid', { exact: true })).toBeVisible();
  await expect(page.getByText('Create Custom', { exact: true })).toBeVisible();
  await expect(page.getByText('Scout Rover', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: /More robots/ }).click();
  await expect(page.getByText('Scout Rover', { exact: true })).toBeVisible();
});
