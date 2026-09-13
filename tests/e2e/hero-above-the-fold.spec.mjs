import { test, expect } from '@playwright/test';
import { DialPage } from '../support/dial-page.mjs';

// The hero is a flex column with explicit `order` on every child, so a child
// that loses its order rule silently jumps to the top of the hero.
const mobileOrder = [
  '.dial-brandline',
  '#dial-title',
  '.dial-category',
  '.dial-actions-primary',
  '.dial-hero-free',
  '.dial-phone-hero',
  '.dial-quick-answer',
  '.dial-hero-detail',
  '.dial-platforms',
  '.dial-hero-legal',
];

const desktopOrder = [
  '.dial-brandline',
  '#dial-title',
  '.dial-category',
  '.dial-quick-answer',
  '.dial-hero-free',
  '.dial-actions-primary',
  '.dial-hero-detail',
  '.dial-platforms',
  '.dial-hero-legal',
];

async function heroTops(page, selectors) {
  const tops = [];
  for (const selector of selectors) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box, `${selector} is rendered`).toBeTruthy();
    tops.push([selector, Math.round(box.y)]);
  }
  return tops;
}

function assertAscending(tops) {
  for (let index = 1; index < tops.length; index += 1) {
    const [previousSelector, previousTop] = tops[index - 1];
    const [selector, top] = tops[index];
    expect(top, `${selector} renders below ${previousSelector}`).toBeGreaterThan(previousTop);
  }
}

test('@mobile-only hero screenshot sits below CTA row', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'hero above-the-fold check runs on mobile-webkit only');

  await page.setViewportSize({ width: 375, height: 812 });
  const dial = new DialPage(page);
  await dial.goto('en');

  const ctaRow = page.locator('.dial-actions-primary');
  const heroShot = page.locator('.dial-phone-hero');

  const ctaBox = await ctaRow.boundingBox();
  const shotBox = await heroShot.boundingBox();
  const viewport = page.viewportSize();

  expect(ctaBox).toBeTruthy();
  expect(shotBox).toBeTruthy();
  expect(viewport).toBeTruthy();

  expect(shotBox.y).toBeGreaterThanOrEqual(ctaBox.y + ctaBox.height - 1);
  expect(shotBox.y).toBeLessThan(viewport.height);
});

for (const lang of ['en', 'de', 'ar', 'ja']) {
  test(`@mobile-only hero reads in order on ${lang}`, async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'hero order check runs on mobile-webkit only');

    await page.setViewportSize({ width: 375, height: 812 });
    const dial = new DialPage(page);
    await dial.goto(lang);

    assertAscending(await heroTops(page, mobileOrder));
  });
}

test('desktop hero keeps the quick answer between the headline and the download', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'desktop hero order check runs on desktop-chromium only');

  const dial = new DialPage(page);
  await dial.goto('en');

  assertAscending(await heroTops(page, desktopOrder));
});
