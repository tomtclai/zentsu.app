import { test as base, expect } from '@playwright/test';

const motionFreezeCss = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
`;

const maxSettleRounds = 10;

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((css) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }, motionFreezeCss);
    await use(page);
  },
});

/** @param {import('@playwright/test').Page} page */
export async function settle(page) {
  await page.evaluate(async (rounds) => {
    const nextTwoFrames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let round = 0; round < rounds; round += 1) {
      await document.fonts.ready;
      await nextTwoFrames();
      if (document.fonts.status === 'loaded') return;
    }
  }, maxSettleRounds);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
export async function expectFullPageScreenshot(page, name) {
  await settle(page);
  await expect(page).toHaveScreenshot(name, { fullPage: true });
}

export { expect };
