import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const route = '/overload';
const html = read(`_site${route}.html`);

assert.ok(
  html.includes(`<link rel="canonical" href="https://zentsu.app${route}"`),
  `${route}: canonical`,
);
assert.ok(read('_site/sitemap.xml').includes(`<loc>https://zentsu.app${route}</loc>`), 'sitemap');
assert.ok(html.includes('/assets/overload-icon.png'), `${route}: app icon`);
assert.ok(html.includes('href="/privacy"'), `${route}: privacy policy link`);
assert.ok(!html.includes('apps.apple.com'), `${route}: no App Store link while review is on hold`);
assert.ok(!/\$\d/.test(html), `${route}: no price`);
assert.ok(!/coming soon/i.test(html), `${route}: no release promise`);

for (const file of ['_site/index.html', '_site/apps.html']) {
  const card = read(file).match(/<article\b[^>]*data-app="overload"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card, `${file}: Overload app card`);
  assert.ok(card.includes(`href="${route}"`), `${file}: product link`);
  assert.ok(card.includes('Not on the App Store'), `${file}: availability`);
  assert.ok(!card.includes('apps.apple.com'), `${file}: no App Store link`);
  assert.ok(!card.includes('product-price'), `${file}: no price`);
}

assert.ok(
  read('_site/privacy.html').includes('Overload'),
  'Company privacy policy covers Overload',
);
console.log('Validated the Overload product route, app listings and privacy coverage.');
