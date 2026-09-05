import { expect } from '@playwright/test';

export class DialPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.heroPrimaryCta = page.locator('#hero-primary-cta');
    this.watchCta = page.locator('#watch-cta');
    this.plansCta = page.locator('#plans-cta');
    this.closerPrimaryCta = page.locator('#closer-primary-cta');
    this.priceData = page.locator('#dial-price-data');
    this.dialTitle = page.locator('#dial-title');
    this.plansTitle = page.locator('#plans-title');
    this.faqTitle = page.locator('#faq-title');
    this.stickyBar = page.locator('.dial-sticky-cta');
    this.currencyPicker = page.locator('.dial-currency details');
  }

  /** @param {string} [lang='en'] */
  async goto(lang = 'en') {
    await this.page.addInitScript((language) => {
      localStorage.setItem('zentsu-locale', language);
    }, lang);
    const path = lang === 'en' ? '/dial/' : `/${lang}/dial/`;
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  /** @param {'lifetime' | 'annual' | 'monthly'} plan */
  priceText(plan) {
    return this.page.locator(`[data-dial-price="${plan}"]`).first();
  }

  /** @param {string} type */
  async jsonLd(type) {
    const blocks = await this.page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          try {
            return JSON.parse(node.textContent ?? '');
          } catch {
            return null;
          }
        }),
      );

    const match = blocks.find((block) => block && block['@type'] === type);
    expect(match, `JSON-LD block with @type=${type}`).toBeTruthy();
    return match;
  }
}
