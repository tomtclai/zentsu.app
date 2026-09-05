import { test, expect } from '@playwright/test';

const locales = ['en', 'de', 'ja', 'ar'];
const schemes = [
  { name: 'light', colorScheme: 'light' },
  { name: 'dark', colorScheme: 'dark' },
];

async function prepareDialPage(page, lang, colorScheme) {
  await page.emulateMedia({ colorScheme });
  await page.addInitScript((language) => {
    localStorage.setItem('zentsu-locale', language);
  }, lang);

  const path = lang === 'en' ? '/dial/' : `/${lang}/dial/`;
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = Math.max(window.innerHeight, 1);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

for (const lang of locales) {
  for (const scheme of schemes) {
    test(`@visual dial ${lang} ${scheme.name}`, async ({ page }) => {
      await prepareDialPage(page, lang, scheme.colorScheme);
      await expect(page).toHaveScreenshot(`${lang}-${scheme.name}.png`, { fullPage: true });
    });
  }
}

test('@visual dial en light support', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    localStorage.setItem('zentsu-locale', 'en');
  });
  await page.goto('/dial/support/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page).toHaveScreenshot('en-light-support.png', { fullPage: true });
});

test('@visual dial en light privacy', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    localStorage.setItem('zentsu-locale', 'en');
  });
  await page.goto('/dial/privacy/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page).toHaveScreenshot('en-light-privacy.png', { fullPage: true });
});
