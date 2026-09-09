import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';

const prices = loadYaml('_data/dial_prices.yml');
const alternates = loadYaml('_data/alternates.yml').dial;
const regions = [
  { path: '/es/dial/', lang: 'es-MX', key: 'es', territory: 'MEX', currency: 'MXN' },
  { path: '/es-es/dial/', lang: 'es-ES', key: 'es-es', territory: 'ESP', currency: 'EUR' },
];

for (const region of regions) {
  test(`${region.lang} has regional metadata, prices, shared resources`, async ({ page }) => {
    await page.goto(region.path);
    await expect(page.locator('html')).toHaveAttribute('lang', region.lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://zentsu.app${region.path}`);
    for (const [lang, path] of Object.entries({ ...alternates, 'x-default': '/dial/' })) {
      await expect(page.locator(`link[hreflang="${lang}"]`)).toHaveAttribute('href', `https://zentsu.app${path}`);
    }
    await expect(page.locator('.nav-lang a[hreflang="es"]')).toHaveCount(0);
    await expect(page.locator('.nav-lang a[hreflang="es-MX"]')).toHaveText('Español (México)');
    await expect(page.locator('.nav-lang a[hreflang="es-ES"]')).toHaveText('Español (España)');
    await expect(page.locator('.nav-lang a[aria-current="page"]')).toHaveAttribute('hreflang', region.lang);
    expect(prices[region.key].territory).toBe(region.territory);
    expect(prices[region.key].currency).toBe(region.currency);
    for (const plan of ['monthly', 'annual', 'lifetime']) {
      await expect(page.locator(`[data-dial-price="${plan}"]`).first()).toHaveText(prices[region.key][`${plan}_display`]);
    }
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(n => JSON.parse(n.textContent)));
    expect(blocks.every(block => block.inLanguage === region.lang)).toBe(true);
    const app = blocks.find(block => block['@type'] === 'SoftwareApplication');
    expect(app.offers.every(offer => offer.priceCurrency === region.currency)).toBe(true);
    expect(app.offers).toHaveLength(1);
    expect(app.offers[0].price).toBe(0);
    await expect(page.locator('#hero-primary-cta img')).toHaveAttribute('src', '/assets/badges/download-on-the-app-store-es.svg');
    await expect(page.locator('.dial-privacy a')).toHaveAttribute('href', '/es/dial/privacy/');
    await expect(page.locator('footer a[href="/es/dial/support/"]')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('regional selection preserves query and fragment; Escape restores focus', async ({ page }) => {
  await page.goto('/es/dial/?source=regional#plans-title');
  const picker = page.locator('.nav-lang details');
  await picker.locator('summary').click();
  await page.keyboard.press('Escape');
  await expect(picker.locator('summary')).toBeFocused();
  await picker.locator('summary').click();
  await picker.locator('a[hreflang="es-ES"]').click();
  await expect(page).toHaveURL(/\/es-es\/dial\/\?source=regional#plans-title$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES');
});

test('regional links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL + '/es/dial/');
  await page.locator('.nav-lang summary').click();
  await page.locator('.nav-lang a[hreflang="es-ES"]').click();
  await expect(page).toHaveURL(/\/es-es\/dial\/$/);
  await expect(page.locator('[data-dial-price="lifetime"]').first()).toHaveText(prices['es-es'].lifetime_display);
  await context.close();
});
