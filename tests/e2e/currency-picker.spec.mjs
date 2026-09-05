import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';
import { DialPage } from '../support/dial-page.mjs';

const prices = loadYaml('_data/dial_prices.yml');
const storefronts = loadYaml('_data/dial_storefronts.yml');
const i18n = loadYaml('_data/i18n.yml');

test('currency picker switches, persists, and restores default note', async ({ page }) => {
  const dial = new DialPage(page);
  await dial.goto('en');

  const defaultCurrency = prices.en.currency;
  const defaultNote = storefronts.en.note;
  const usdLifetime = prices.en.lifetime_display;
  const eurLifetime = prices.de.lifetime_display;
  const overrideNote = i18n.en.price_shown_in.replace('{currency}', 'EUR');

  await expect(dial.priceText('lifetime')).toHaveText(usdLifetime);
  await expect(dial.priceText('annual')).toHaveText(prices.en.annual_display);
  await expect(dial.priceText('monthly')).toHaveText(prices.en.monthly_display);
  await expect(page.locator('[data-dial-price-note]')).toHaveText(defaultNote);

  await dial.currencyPicker.locator('summary').click();
  await page.locator('[data-dial-currency="EUR"]').click();

  await expect(dial.priceText('lifetime')).toHaveText(eurLifetime);
  await expect(dial.priceText('annual')).toHaveText(prices.de.annual_display);
  await expect(dial.priceText('monthly')).toHaveText(prices.de.monthly_display);
  await expect(page.locator('[data-dial-price-note]')).toHaveText(overrideNote);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(dial.priceText('lifetime')).toHaveText(eurLifetime);
  const stored = await page.evaluate(() => localStorage.getItem('zentsu-dial-currency'));
  expect(stored).toBe('EUR');

  await dial.currencyPicker.locator('summary').click();
  await page.locator(`[data-dial-currency="${defaultCurrency}"]`).click();
  await expect(dial.priceText('lifetime')).toHaveText(usdLifetime);
  await expect(page.locator('[data-dial-price-note]')).toHaveText(defaultNote);
});
