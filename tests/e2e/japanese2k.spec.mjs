import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/japanese2k', '/japanese2k/support', '/japanese2k/privacy', '/japanese2k/data'];

for (const route of routes) {
  test(`Japanese page ${route} has metadata, images and working local links`, async ({
    page,
    request,
  }) => {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://zentsu.app${route}`,
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
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
    const links = await page
      .locator('a[href^="/japanese2k"]')
      .evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')))]);
    for (const link of links) expect((await request.get(link)).ok(), link).toBe(true);
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
}

test('Japanese product is pending availability and reachable from both app listings', async ({
  page,
}) => {
  await page.goto('/japanese2k', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Learn Japanese:\s*2,000 Words/);
  await expect(
    page.getByText('Not yet available on the App Store.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  for (const route of ['/japanese2k/support', '/japanese2k/privacy', '/japanese2k/data']) {
    await expect(page.locator(`main a[href="${route}"]`).first()).toBeVisible();
  }
  for (const route of ['/', '/apps']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const card = page.locator('[data-app="japanese2k"]');
    await expect(card).toContainText('Coming soon');
    await expect(card.locator('a[href="/japanese2k"]').first()).toBeVisible();
    await expect(card.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  }
});

test('Japanese product normalizes the slash variant to its canonical route', async ({ page }) => {
  const response = await page.goto('/japanese2k/', { waitUntil: 'networkidle' });
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/japanese2k$/);
});

for (const colorScheme of ['light', 'dark']) {
  test(`Japanese pages meet accessibility checks in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations,
        `${route}: ${JSON.stringify(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })))}`,
      ).toEqual([]);
    }
  });
}
