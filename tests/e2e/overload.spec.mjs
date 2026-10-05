import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/overload';

test('Overload page has metadata, images and no horizontal overflow', async ({ page }) => {
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://zentsu.app${route}`,
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Overload');
  await expect(page.locator('main')).toHaveCount(1);
  const images = await page.locator('img').evaluateAll(async (nodes) => {
    await Promise.all(
      nodes.map((image) => {
        image.loading = 'eager';
        return image.decode();
      }),
    );
    return nodes.map((image) => ({ width: image.naturalWidth, alt: image.getAttribute('alt') }));
  });
  for (const image of images) {
    expect(image.width).toBeGreaterThan(0);
    expect(image.alt).not.toBeNull();
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const enlargedOverflow = await page.evaluate(async () => {
    document.documentElement.style.fontSize = '200%';
    await document.fonts.ready;
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  expect(enlargedOverflow, `${route}: 200% text size`).toBeLessThanOrEqual(0);
});

test('Overload is off the App Store and reachable from both app listings', async ({ page }) => {
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(page.getByText('Not available on the App Store', { exact: true })).toBeVisible();
  await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  await expect(page.locator('main a[href="/privacy"]')).toBeVisible();
  for (const listing of ['/', '/apps']) {
    await page.goto(listing, { waitUntil: 'networkidle' });
    const card = page.locator('[data-app="overload"]');
    await expect(card).toContainText('Not on the App Store');
    await expect(card.locator(`a[href="${route}"]`).first()).toBeVisible();
    await expect(card.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  }
});

for (const colorScheme of ['light', 'dark']) {
  test(`Overload page meets accessibility checks in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto(route, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
      ),
    ).toEqual([]);
  });
}
