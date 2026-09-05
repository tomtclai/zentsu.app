import { test, expect } from '@playwright/test';
import { loadYaml } from '../support/yaml.mjs';
import { DialPage } from '../support/dial-page.mjs';

const campaign = loadYaml('_data/dial_campaign.yml');
const providerToken = String(campaign.provider_token ?? '').trim();

test('english App Store links and JSON-LD stay untagged', async ({ page }) => {
  const dial = new DialPage(page);
  await dial.goto('en');

  const storeLinks = page.locator(
    'main a[href*="apps.apple.com"], .dial-sticky-cta a[href*="apps.apple.com"]',
  );
  const hrefs = await storeLinks.evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.href,
      rel: node.getAttribute('rel') ?? '',
    })),
  );

  expect(hrefs.length).toBeGreaterThan(0);

  const ctValues = new Set();
  for (const { href, rel } of hrefs) {
    expect(href).toContain('id6789408903');
    expect(rel).toMatch(/noopener/);

    if (providerToken) {
      const url = new URL(href);
      expect(url.searchParams.get('pt')).toBe(providerToken);
      const ct = url.searchParams.get('ct');
      expect(ct).toMatch(/^site-dial-/);
      const suffix = ct.replace(/^site-dial-/, '').replace(/^plans-card$/, 'plans');
      ctValues.add(suffix);
    }
  }

  if (providerToken) {
    expect(ctValues).toEqual(new Set(['hero', 'sticky', 'watch', 'plans', 'faq', 'closer']));
  }

  const app = await dial.jsonLd('SoftwareApplication');
  for (const field of ['downloadUrl', 'installUrl']) {
    const url = new URL(app[field]);
    expect(url.searchParams.get('pt')).toBeNull();
    expect(url.searchParams.get('ct')).toBeNull();
  }

  for (const sameAs of app.sameAs) {
    const url = new URL(sameAs);
    expect(url.searchParams.get('pt')).toBeNull();
    expect(url.searchParams.get('ct')).toBeNull();
  }
});
