import { test, expect } from '@playwright/test';

for (const colorScheme of ['light', 'dark']) {
  test(`@visual overload ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/overload', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => {
          image.loading = 'eager';
          return image.decode();
        }),
      );
    });
    await expect(page).toHaveScreenshot(`overload-${colorScheme}.png`, { fullPage: true });
  });
}
