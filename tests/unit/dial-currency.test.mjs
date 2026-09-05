import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

const require = createRequire(import.meta.url);
const { catalogByCurrency, resolvePrices } = require('../../dial-currency.js');

const samplePrices = {
  en: {
    currency: 'USD',
    lifetime_display: '$49.99',
    annual_display: '$19.99',
    monthly_display: '$3.99',
  },
  uk: {
    currency: 'USD',
    lifetime_display: '$59.99',
    annual_display: '$29.99',
    monthly_display: '$4.99',
  },
  de: {
    currency: 'EUR',
    lifetime_display: '59,99 €',
    annual_display: '22,99 €',
    monthly_display: '3,99 €',
  },
  ja: {
    currency: 'JPY',
    lifetime_display: '¥8,000',
    annual_display: '¥3,000',
    monthly_display: '¥600',
  },
  noCurrency: {
    lifetime_display: 'missing',
  },
};

describe('catalogByCurrency', () => {
  test('dedupes storefronts sharing a currency and keeps the first', () => {
    const catalog = catalogByCurrency(samplePrices);
    assert.equal(catalog.USD.lang, 'en');
    assert.equal(catalog.USD.lifetime_display, '$49.99');
    assert.equal(catalog.EUR.lifetime_display, '59,99 €');
    assert.equal(catalog.JPY.lifetime_display, '¥8,000');
  });

  test('preserves catalog order for the first row per currency', () => {
    const ordered = {
      ja: { currency: 'JPY', lifetime_display: '¥8,000' },
      en: { currency: 'USD', lifetime_display: '$49.99' },
      uk: { currency: 'USD', lifetime_display: '$59.99' },
    };
    const catalog = catalogByCurrency(ordered);
    assert.deepEqual(Object.keys(catalog), ['JPY', 'USD']);
    assert.equal(catalog.USD.lifetime_display, '$49.99');
  });

  test('ignores rows without a currency', () => {
    const catalog = catalogByCurrency(samplePrices);
    assert.equal(catalog.noCurrency, undefined);
  });
});

describe('resolvePrices', () => {
  const data = {
    lang: 'uk',
    defaultCurrency: 'USD',
    defaultNote: 'Ukraine note',
    overrideNote: 'Shown in {currency}.',
    prices: samplePrices,
  };

  test('returns the page default when no override is set', () => {
    const resolved = resolvePrices(data, 'USD');
    assert.equal(resolved.currency, 'USD');
    assert.equal(resolved.row.lifetime_display, '$59.99');
    assert.equal(resolved.note, 'Ukraine note');
  });

  test('returns the override row and note when a known currency is chosen', () => {
    const resolved = resolvePrices(data, 'JPY');
    assert.equal(resolved.currency, 'JPY');
    assert.equal(resolved.row.lifetime_display, '¥8,000');
    assert.equal(resolved.note, 'Shown in JPY.');
  });

  test('falls back to the default when the stored currency is unknown', () => {
    const resolved = resolvePrices(data, 'GBP');
    assert.equal(resolved.currency, 'USD');
    assert.equal(resolved.row.lifetime_display, '$59.99');
    assert.equal(resolved.note, 'Ukraine note');
  });
});
