import { test, expectFullPageScreenshot } from '../support/visual.mjs';

for (const colorScheme of ['light', 'dark']) {
  test(`@visual japanese2k ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/japanese2k', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => {
          image.loading = 'eager';
          return image.decode();
        }),
      );
    });
    await expectFullPageScreenshot(page, `japanese2k-${colorScheme}.png`);
  });
}
