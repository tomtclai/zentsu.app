import { test, expect } from '@playwright/test';
import { DialPage } from '../support/dial-page.mjs';

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
