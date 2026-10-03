import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const sitemap = read('_site/sitemap.xml');
// Linkinator's static server prefers the legacy-data directory over japanese2k.html.
// Playwright checks the product route and slash redirect using Cloudflare's runtime.
const routes = ['/japanese2k', '/japanese2k/support', '/japanese2k/privacy', '/japanese2k/data'];

for (const route of routes) {
  const html = read(`_site${route}.html`);
  assert.ok(
    html.includes(`<link rel="canonical" href="https://zentsu.app${route}"`),
    `${route}: canonical`,
  );
  assert.ok(sitemap.includes(`<loc>https://zentsu.app${route}</loc>`), `${route}: sitemap`);
  assert.ok(html.includes('/assets/japanese2k-icon.png'), `${route}: app icon`);
}

for (const file of ['_site/index.html', '_site/apps.html']) {
  const card = read(file).match(/<article\b[^>]*data-app="japanese2k"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card, `${file}: Japanese app card`);
  assert.ok(card.includes('href="/japanese2k"'), `${file}: product link`);
  assert.ok(card.includes('Coming soon'), `${file}: pending availability`);
  assert.ok(!card.includes('apps.apple.com'), `${file}: no premature App Store link`);
}

assert.ok(
  read('_site/_redirects').includes('/japanese2k/ /japanese2k 301'),
  'Product slash redirect',
);
assert.ok(read('_site/japanese2k/icons.json').length > 0, 'Legacy content remains published');
console.log('Validated Japanese product routes, app listings and legacy data availability.');
