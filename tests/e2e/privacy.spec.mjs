import { test, expect } from '@playwright/test';

const locales = ['en', 'de'];

for (const lang of locales) {
  test(`no third-party requests on ${lang} dial page`, async ({ page }) => {
    const requests = [];
    page.on('request', (request) => {
      requests.push(new URL(request.url()));
    });

    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    const path = lang === 'en' ? '/dial/' : `/${lang}/dial/`;
    await page.goto(path, { waitUntil: 'networkidle' });
    const origin = new URL(page.url()).origin;

    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight, 1);
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(250);

    for (const url of requests) {
      expect(url.origin, url.href).toBe(origin);
    }

    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).toBe('');
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
}
