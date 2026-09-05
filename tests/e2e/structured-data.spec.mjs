import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';
import { DialPage } from '../support/dial-page.mjs';

const prices = loadYaml('_data/dial_prices.yml');
const faqCopy = loadYaml('_data/dial_faq.yml');
const locales = ['en', 'de', 'ar', 'ja'];

for (const lang of locales) {
  test(`structured data on ${lang}`, async ({ page }) => {
    const dial = new DialPage(page);
    await dial.goto(lang);

    const faq = await dial.jsonLd('FAQPage');
    const expectedCount = (faqCopy[lang] ?? faqCopy.en).items.length;
    expect(faq.mainEntity).toHaveLength(expectedCount);
    for (const item of faq.mainEntity) {
      expect(String(item.acceptedAnswer?.text ?? '').trim().length).toBeGreaterThan(0);
    }

    const app = await dial.jsonLd('SoftwareApplication');
    const offerBlock = app.offers;
    expect(offerBlock).toBeTruthy();

    const aggregate =
      offerBlock['@type'] === 'AggregateOffer'
        ? offerBlock
        : Array.isArray(offerBlock)
          ? offerBlock.find((entry) => entry['@type'] === 'AggregateOffer')
          : null;

    if (aggregate) {
      expect(aggregate.priceCurrency).toBe(prices[lang].currency);
      return;
    }

    const offers = Array.isArray(offerBlock) ? offerBlock : [offerBlock];
    expect(offers.length).toBeGreaterThan(0);
    for (const offer of offers) {
      expect(offer.priceCurrency).toBe(prices[lang].currency);
    }
  });
}
