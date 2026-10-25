import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

function loadYaml(path) {
  const result = spawnSync(
    'ruby',
    ['-ryaml', '-rjson', '-e', 'puts YAML.load_file(ARGV[0]).to_json', path],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, `Failed to parse ${path}: ${result.stderr}`);
  return JSON.parse(result.stdout);
}

const route = '/overload';
const html = read(`_site${route}.html`);
const overload = loadYaml('_data/apps.yml').apps.find((app) => app.slug === 'overload');
const config = loadYaml('_config.yml');
const storeUrl = overload.app_store_url;
const price = config[overload.price_key];
const isOnStore = Boolean(storeUrl);

assert.ok(
  html.includes(`<link rel="canonical" href="https://zentsu.app${route}"`),
  `${route}: canonical`,
);
assert.ok(read('_site/sitemap.xml').includes(`<loc>https://zentsu.app${route}</loc>`), 'sitemap');
assert.ok(read('_site/llms.txt').includes(`(https://zentsu.app${route})`), 'llms.txt entry');
assert.ok(html.includes('/assets/overload-icon.png'), `${route}: app icon`);
assert.ok(html.includes('href="/privacy"'), `${route}: privacy policy link`);
assert.ok(!/coming soon/i.test(html), `${route}: no release promise`);
assert.ok(!/[—–]/.test(html), `${route}: no em or en dashes`);

const title = html
  .match(/<title>([\s\S]*?)<\/title>/)[1]
  .trim()
  .replace(/&amp;/g, '&');
assert.ok(title.length <= 60, `${route}: title is ${title.length} characters`);
assert.ok(/Apple Watch/.test(title), `${route}: title names Apple Watch`);
const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
assert.ok(description.length <= 160, `${route}: description is ${description.length} characters`);

const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
  (match) => JSON.parse(match[1]),
);
const software = jsonLd.find((block) => block['@type'] === 'SoftwareApplication');
assert.ok(software, `${route}: SoftwareApplication JSON-LD`);
assert.equal(software.url, `https://zentsu.app${route}`, `${route}: JSON-LD url`);
assert.ok(!('aggregateRating' in software), `${route}: no rating without real App Store ratings`);

const banner = html.match(/<meta name="apple-itunes-app" content="([^"]*)"/)?.[1];
if (isOnStore) {
  const appId = storeUrl.match(/\/id(\d+)/)?.[1];
  assert.ok(appId, `apps.yml: Overload app_store_url has no numeric id`);
  assert.equal(banner, `app-id=${appId}`, `${route}: Smart App Banner`);
  assert.ok(html.includes(`href="${storeUrl}"`), `${route}: App Store link`);
  assert.ok(price && html.includes(`$${price}`), `${route}: price`);
  assert.equal(software.offers?.price, price, `${route}: Offer price`);
  assert.equal(software.offers?.url, storeUrl, `${route}: Offer url`);
} else {
  assert.equal(banner, undefined, `${route}: no Smart App Banner before release`);
  assert.ok(!html.includes('apps.apple.com'), `${route}: no App Store link before release`);
  assert.ok(!/\$\d/.test(html), `${route}: no price before release`);
  assert.ok(!('offers' in software), `${route}: no Offer before release`);
}

for (const file of ['_site/index.html', '_site/apps.html']) {
  const card = read(file).match(/<article\b[^>]*data-app="overload"[\s\S]*?<\/article>/)?.[0];
  assert.ok(card, `${file}: Overload app card`);
  assert.ok(card.includes(`href="${route}"`), `${file}: product link`);
  assert.ok(card.includes('Apple Watch'), `${file}: Apple Watch platform`);
  if (overload.status === 'not_on_store') {
    assert.ok(card.includes('Not on the App Store'), `${file}: availability`);
    assert.ok(!card.includes('apps.apple.com'), `${file}: no App Store link`);
    assert.ok(!card.includes('product-price'), `${file}: no price`);
  }
}

const privacy = read('_site/privacy.html');
assert.ok(privacy.includes('Overload'), 'Company privacy policy covers Overload');
assert.ok(
  privacy.includes('Overload Apple Watch app saves each strength training workout'),
  'Company privacy policy covers the Overload Apple Health workout',
);
console.log('Validated the Overload product route, app listings and privacy coverage.');
