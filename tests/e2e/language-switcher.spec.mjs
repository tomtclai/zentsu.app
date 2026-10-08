import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';

const territoryPrices = loadYaml('_data/dial_territory_prices.yml');

const pickCountryLanguage = async (page, country, hreflang) => {
  const picker = page.locator('.nav-lang-picker');
  await picker.locator(':scope > summary').click();
  await expect(page.locator('.nav-lang-dialog')).toBeVisible();
  const grouped = page.locator(`details.nav-lang-country[data-country="${country}"]`);
  const link = page.locator(`a[data-country="${country}"][hreflang="${hreflang}"]`);
  if ((await grouped.count()) > 0) {
    const summary = grouped.locator(':scope > summary');
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
  }
  await expect(link).toBeVisible();
  const nextPath = new URL(await link.getAttribute('href'), page.url()).pathname;
  await Promise.all([page.waitForURL((url) => url.pathname === nextPath), link.click()]);
};

const stored = (page) =>
  page.evaluate(() => ({
    locale: localStorage.getItem('zentsu-locale'),
    country: localStorage.getItem('zentsu-dial-country'),
    currency: localStorage.getItem('zentsu-dial-currency'),
  }));

test.describe('country picker', () => {
  test.use({ locale: 'en-US' });

  test('an explicit choice survives a reload and a move to another Dial page', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/dial\/$/);

    await pickCountryLanguage(page, 'jp', 'ja');
    expect(await stored(page)).toMatchObject({ locale: 'ja', country: 'jp' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/ja\/dial\/$/);

    await page.goto('/ja/dial/support/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/ja\/dial\/support\/$/);

    await page.goto('/ja/dial/', { waitUntil: 'networkidle' });
    await pickCountryLanguage(page, 'de', 'de');
    expect(await stored(page)).toMatchObject({ locale: 'de', country: 'de' });

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/de\/dial\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('Canada offers English and French on the same storefront', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await pickCountryLanguage(page, 'ca', 'fr');
    await expect(page).toHaveURL(/\/fr\/dial\/$/);
    expect(await stored(page)).toMatchObject({ locale: 'fr', country: 'ca' });
    if (territoryPrices.CAN) {
      await expect(page.locator('[data-dial-price="lifetime"]').first()).toHaveText(
        territoryPrices.CAN.lifetime_display,
      );
    }
    await expect(page.locator('#hero-primary-cta')).toHaveAttribute('href', /apps\.apple\.com\/ca\//);
  });

  test('Switzerland offers German, English, French, and Italian', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    const picker = page.locator('.nav-lang-picker');
    await picker.locator(':scope > summary').click();
    await page.locator('details.nav-lang-country[data-country="ch"] > summary').click();
    await expect(picker.locator('a[data-country="ch"][hreflang="de"]')).toBeVisible();
    await expect(picker.locator('a[data-country="ch"][hreflang="en"]')).toBeVisible();
    await expect(picker.locator('a[data-country="ch"][hreflang="fr"]')).toBeVisible();
    await expect(picker.locator('a[data-country="ch"][hreflang="it"]')).toBeVisible();
  });

  test('United States extras keep the US storefront', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await pickCountryLanguage(page, 'us', 'es-MX');
    await expect(page).toHaveURL(/\/es\/dial\/$/);
    expect(await stored(page)).toMatchObject({ locale: 'es-MX', country: 'us' });
    if (territoryPrices.USA) {
      await expect(page.locator('[data-dial-price="lifetime"]').first()).toHaveText(
        territoryPrices.USA.lifetime_display,
      );
    }
    await expect(page.locator('#hero-primary-cta')).toHaveAttribute('href', /apps\.apple\.com\/us\//);
  });

  test('Catalan /ca/ is Spain, not Canada', async ({ page }) => {
    await page.goto('/ca/dial/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
    await expect(page.locator('a[data-country="es"][hreflang="ca"]')).toHaveCount(1);
    await page.locator('.nav-lang-picker > summary').click();
    await page.locator('details.nav-lang-country[data-country="ca"] > summary').click();
    await expect(page.locator('a[data-country="ca"][hreflang="en"]')).toBeVisible();
    await expect(page.locator('a[data-country="ca"][hreflang="fr"]')).toBeVisible();
    await expect(page.locator('a[data-country="ca"][hreflang="ca"]')).toHaveCount(0);
  });

  test('picking a country sets that storefront currency; a later currency click persists', async ({
    page,
  }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    await pickCountryLanguage(page, 'jp', 'ja');
    const afterCountry = await stored(page);
    expect(afterCountry.country).toBe('jp');
    expect(afterCountry.currency).toBe(territoryPrices.JPN?.currency || afterCountry.currency);

    await page.locator('.dial-currency details summary').click();
    await page.locator('[data-dial-currency="EUR"]').click();
    expect(await stored(page)).toMatchObject({ country: 'jp', currency: 'EUR' });
    await page.reload({ waitUntil: 'networkidle' });
    expect(await stored(page)).toMatchObject({ country: 'jp', currency: 'EUR' });
  });
});

test.describe('first visit without a stored choice', () => {
  test.use({ locale: 'de-DE' });

  test('a German browser keeps the requested English page', async ({ page }) => {
    await page.goto('/dial/', { waitUntil: 'networkidle' });
    expect(new URL(page.url()).pathname).toBe('/dial/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('explicit translated routes', () => {
  test.use({ locale: 'en-US' });

  for (const path of ['/dial/', '/de/dial/', '/ar/dial/', '/es/dial/', '/es-es/dial/', '/ca/dial/']) {
    const langs = {
      '/dial/': 'en',
      '/ar/dial/': 'ar',
      '/de/dial/': 'de',
      '/es/dial/': 'es-MX',
      '/es-es/dial/': 'es-ES',
      '/ca/dial/': 'ca',
    };
    test(`an explicit ${path} route stays localized with an English browser`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(new RegExp(`${path.replaceAll('/', '\\/')}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', langs[path]);
    });

    test(`an explicit ${path} route ignores a conflicting saved preference`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('zentsu-locale', 'ja'));
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(new RegExp(`${path.replaceAll('/', '\\/')}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', langs[path]);
    });
  }
});
