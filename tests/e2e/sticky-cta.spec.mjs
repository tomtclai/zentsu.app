import { test, expect } from '@playwright/test';
import { DialPage } from '../support/dial-page.mjs';

async function scrollPastHeroAndCloser(page, dial) {
  await dial.closerPrimaryCta.scrollIntoViewIfNeeded();
  await expect(dial.closerPrimaryCta).toBeInViewport();
  await page.evaluate(() => window.scrollBy(0, -window.innerHeight * 0.6));
  await page.waitForTimeout(150);
}

async function expectStickyVisible(dial) {
  await expect(dial.stickyBar).toBeVisible();
  await expect(dial.stickyBar).not.toHaveAttribute('hidden', '');
}

async function expectStickyHidden(dial) {
  await expect(dial.stickyBar).toBeHidden();
}

test('sticky CTA visibility tracks hero and closer', async ({ page }) => {
  const dial = new DialPage(page);
  await dial.goto('en');

  await expectStickyHidden(dial);

  await scrollPastHeroAndCloser(page, dial);
  await expectStickyVisible(dial);

  await dial.closerPrimaryCta.scrollIntoViewIfNeeded();
  await expect(dial.closerPrimaryCta).toBeInViewport();
  await expectStickyHidden(dial);
});

test('sticky CTA respects reduced motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const dial = new DialPage(page);
  await dial.goto('en');

  await expectStickyHidden(dial);
  await scrollPastHeroAndCloser(page, dial);
  await expectStickyVisible(dial);
  await dial.closerPrimaryCta.scrollIntoViewIfNeeded();
  await expectStickyHidden(dial);
});

test('mobile sticky bar stays in viewport and clears footer', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'mobile layout check runs on mobile-webkit only');

  const dial = new DialPage(page);
  await dial.goto('en');
  await scrollPastHeroAndCloser(page, dial);
  await expectStickyVisible(dial);

  const barBox = await dial.stickyBar.boundingBox();
  const viewport = page.viewportSize();
  expect(barBox).toBeTruthy();
  expect(viewport).toBeTruthy();
  expect(barBox.y + barBox.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(barBox.y).toBeGreaterThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);

  await expect(dial.stickyBar).toBeHidden();

  const footer = page.locator('footer');
  const footerBox = await footer.boundingBox();
  expect(footerBox).toBeTruthy();
  expect(footerBox.y).toBeLessThanOrEqual((page.viewportSize()?.height ?? 0) + 1);
});

test('mobile sticky bar keeps every control inside the viewport', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'mobile layout check runs on mobile-webkit only');

  const dial = new DialPage(page);
  await dial.goto('en');
  await scrollPastHeroAndCloser(page, dial);
  await expectStickyVisible(dial);

  const viewportWidth = page.viewportSize().width;
  const controls = dial.stickyBar.locator(
    '.dial-sticky-get, .dial-sticky-badge, .dial-sticky-icon',
  );

  for (const control of await controls.all()) {
    if (!(await control.isVisible())) continue;
    const box = await control.boundingBox();
    expect(box).toBeTruthy();
    expect(box.x).toBeGreaterThanOrEqual(-0.5);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 0.5);
  }

  const documentOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(documentOverflow).toBeLessThanOrEqual(0);
});

test('mobile sticky badge keeps its aspect ratio', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'mobile layout check runs on mobile-webkit only');

  const dial = new DialPage(page);
  await dial.goto('en');
  await scrollPastHeroAndCloser(page, dial);
  await expectStickyVisible(dial);

  const badge = dial.stickyBar.locator('.dial-sticky-badge img');
  const ratios = await badge.evaluate((img) => ({
    rendered: img.getBoundingClientRect().width / img.getBoundingClientRect().height,
    intrinsic: Number(img.getAttribute('width')) / Number(img.getAttribute('height')),
  }));

  expect(Math.abs(ratios.rendered - ratios.intrinsic)).toBeLessThan(0.02);
});
