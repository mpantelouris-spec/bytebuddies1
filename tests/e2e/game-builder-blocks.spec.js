/**
 * Headed Game Builder walkthrough: log in locally, open every palette category,
 * drop a move-steps script, press Play.
 */
import { test, expect } from '@playwright/test';

const CATEGORIES = [
  'Motion', 'Looks', 'Sound', 'Events', 'Control', 'Sensing',
  'Operators', 'Variables', 'Lists', 'Text', 'My Blocks',
];

async function loginAsStudent(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cv-loggedin', 'true');
    localStorage.setItem('cv-user', JSON.stringify({
      name: 'Block Tester',
      avatar: '?',
      avatarEmoji: '🧑‍💻',
      level: 1,
      xp: 0,
      xpToNext: 500,
      badges: [],
      streak: 0,
      projectCount: 0,
      completedLessons: 0,
      joinDate: '2026-09-01',
      role: 'student',
      ageMode: 'standard',
    }));
  });
}

test.describe('Game Builder coding blocks (browser)', () => {
  test('open every category, add motion, play', async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsStudent(page);
    await page.goto('/#gamebuilder', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /Play/i })).toBeVisible({ timeout: 45_000 });
    await page.locator('.blocklyToolboxDiv').first().waitFor({ state: 'attached', timeout: 45_000 });

    const clickCategory = async (name) => page.evaluate((label) => {
      const nodes = [...document.querySelectorAll('.blocklyToolboxCategory')];
      const el = nodes.find((n) => n.innerText.toLowerCase().includes(label.toLowerCase()));
      el?.click();
      return Boolean(el);
    }, name);

    for (const name of CATEGORIES) {
      expect(await clickCategory(name)).toBe(true);
      await page.waitForTimeout(200);
    }

    await clickCategory('Motion');
    await page.evaluate(() => document.querySelector('.blocklyFlyout .blocklyDraggable')?.click());
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /^\s*▶?\s*Play\s*$/ }).click();
    await expect(page.getByRole('button', { name: /Stop/i })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: /Stop/i }).click();
  });
});
