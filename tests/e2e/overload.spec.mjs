import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawnSync } from 'node:child_process';

const route = '/overload';
const appsYaml = spawnSync(
  'ruby',
  ['-ryaml', '-rjson', '-e', 'puts YAML.load_file(ARGV[0]).to_json', '_data/apps.yml'],
  { encoding: 'utf8' },
);
const overload = JSON.parse(appsYaml.stdout).apps.find((app) => app.slug === 'overload');

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

test('Overload availability follows its App Store URL and both listings link it', async ({
  page,
}) => {
  await page.goto(route, { waitUntil: 'networkidle' });
  await expect(page.locator('main')).toContainText('Apple Watch');
  if (overload.app_store_url) {
    await expect(page.locator(`main a[href="${overload.app_store_url}"]`)).toBeVisible();
    await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveCount(1);
  } else {
    await expect(page.getByText('In App Store review', { exact: true })).toBeVisible();
    await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
    await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveCount(0);
  }
  await expect(page.locator('main a[href="/privacy"]')).toBeVisible();
  for (const listing of ['/', '/apps']) {
    await page.goto(listing, { waitUntil: 'networkidle' });
    const card = page.locator('[data-app="overload"]');
    await expect(card.locator(`a[href="${route}"]`).first()).toBeVisible();
    if (overload.status === 'not_on_store') {
      await expect(card).toContainText('Not on the App Store');
      await expect(card.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
    }
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
