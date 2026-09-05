import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';
import { DialPage } from '../support/dial-page.mjs';

const alternates = loadYaml('_data/alternates.yml').dial;
const locales = ['en', 'de', 'ar', 'ja'];

for (const lang of locales) {
  test(`layout on ${lang} mobile`, async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'layout checks run on mobile-webkit only');

    const dial = new DialPage(page);
    await dial.goto(lang);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    if (lang === 'ar') {
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    }

    const hreflangLinks = page.locator('.nav-lang a[hreflang]');
    await expect(hreflangLinks).toHaveCount(Object.keys(alternates).length);
  });
}
