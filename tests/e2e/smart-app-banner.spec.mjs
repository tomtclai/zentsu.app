import { test, expect } from '@playwright/test';

const locales = ['en', 'de', 'ja'];

for (const lang of locales) {
  test(`apple-itunes-app meta on ${lang}`, async ({ page }) => {
    const path = lang === 'en' ? '/dial/' : `/${lang}/dial/`;
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    const meta = page.locator('meta[name="apple-itunes-app"]');
    await expect(meta).toHaveCount(1);
    await expect(meta).toHaveAttribute('content', /app-id=6789408903/);
  });
}
