import { test, expect } from '@playwright/test';

const pickLanguage = async (page, hreflang) => {
  await page.locator('.nav-lang details summary').click();
  await Promise.all([
    page.waitForURL(new RegExp(`/${hreflang}/dial/$`)),
    page.locator(`.nav-lang details a[hreflang="${hreflang}"]`).click(),
  ]);
};

const storedLocale = (page) => page.evaluate(() => localStorage.getItem('zentsu-locale'));

test.describe('language switcher', () => {
  test.use({ locale: 'en-US' });

  test('an explicit choice survives a reload and a move to another Dial page', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/dial\/$/);

    await pickLanguage(page, 'ja');
    expect(await storedLocale(page)).toBe('ja');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/ja\/dial\/$/);

    await page.goto('/ja/dial/support/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/ja\/dial\/support\/$/);

    await page.goto('/ja/dial/', { waitUntil: 'networkidle' });
    await pickLanguage(page, 'de');
    expect(await storedLocale(page)).toBe('de');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/de\/dial\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('the picker writes the locale key and leaves the currency key alone', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await pickLanguage(page, 'ja');

    const keys = await page.evaluate(() => ({
      locale: localStorage.getItem('zentsu-locale'),
      currency: localStorage.getItem('zentsu-dial-currency'),
    }));
    expect(keys).toEqual({ locale: 'ja', currency: null });
  });
});

test.describe('first visit without a stored choice', () => {
  test.use({ locale: 'de-DE' });

  test('a German browser lands on the German page', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/de\/dial\/$/);
  });
});
