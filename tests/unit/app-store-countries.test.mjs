import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const {
  localeToPage,
  pagesForLocales,
  hreflangForPage,
  urlForPage,
  rewriteStorePath,
} = createRequire(import.meta.url)('../../app-store-locales.js');

function loadYaml(path) {
  const result = spawnSync(
    'ruby',
    ['-ryaml', '-rjson', '-e', 'puts YAML.load_file(ARGV[0]).to_json', path],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('locale mapping uses closest Dial pages', () => {
  assert.equal(localeToPage('en-GB'), 'en');
  assert.equal(localeToPage('en-AU'), 'en');
  assert.equal(localeToPage('fr-CA'), 'fr');
  assert.equal(localeToPage('pt-PT'), 'pt');
  assert.equal(localeToPage('es-MX'), 'es');
  assert.equal(localeToPage('es-ES'), 'es-es');
  assert.equal(localeToPage('sl-SI'), null);
  assert.deepEqual(pagesForLocales(['en-GB', 'hi', 'ta-IN']), ['en', 'hi']);
  assert.deepEqual(pagesForLocales(['es-ES', 'ca', 'en-GB']), ['es-es', 'ca', 'en']);
  assert.equal(hreflangForPage('es'), 'es-MX');
  assert.equal(hreflangForPage('es-es'), 'es-ES');
  assert.equal(urlForPage('es-es', { es: '/es/dial/support/' }), '/es/dial/support/');
  assert.equal(urlForPage('es-es', { 'es-ES': '/es-es/dial/', es: '/es/dial/' }), '/es-es/dial/');
});

test('store path rewrite inserts the country code', () => {
  assert.equal(rewriteStorePath('/app/id6789408903', 'gb'), '/gb/app/id6789408903');
  assert.equal(rewriteStorePath('/us/app/id6789408903', 'gb'), '/gb/app/id6789408903');
  assert.equal(rewriteStorePath('/mx/app/id6789408903', 'ca'), '/ca/app/id6789408903');
});

test('app_store_countries.yml is 175 Apple storefronts', () => {
  const countries = loadYaml('_data/app_store_countries.yml');
  assert.equal(countries.length, 175);
  const ids = new Set(countries.map((row) => row.id));
  const territories = new Set(countries.map((row) => row.territory));
  assert.equal(ids.size, 175);
  assert.equal(territories.size, 175);
  assert.equal(ids.has('gb'), true);
  assert.equal(ids.has('uk'), false);

  const canada = countries.find((row) => row.id === 'ca');
  assert.equal(canada.territory, 'CAN');
  assert.deepEqual(canada.pages, ['en', 'fr']);

  const spain = countries.find((row) => row.id === 'es');
  assert.deepEqual(spain.pages, ['es-es', 'ca', 'en']);

  const us = countries.find((row) => row.id === 'us');
  assert.equal(us.pages[0], 'en');
  assert.equal(us.pages.includes('es'), true);
  assert.equal(us.pages.includes('ja'), false);

  const india = countries.find((row) => row.id === 'in');
  assert.deepEqual(india.pages, ['en', 'hi']);

  for (const country of countries) {
    assert.deepEqual(country.pages, pagesForLocales(country.locales));
    assert.ok(country.pages.length >= 1, `${country.id} needs a Dial page`);
  }
});

test('territory prices cover every storefront', () => {
  const countries = loadYaml('_data/app_store_countries.yml');
  const prices = loadYaml('_data/dial_territory_prices.yml');
  assert.equal(Object.keys(prices).length, 175);
  for (const country of countries) {
    assert.ok(prices[country.territory], `${country.territory} missing from dial_territory_prices.yml`);
  }
});

test('every Dial page locale has country picker chrome', () => {
  const i18n = loadYaml('_data/i18n.yml');
  const countries = loadYaml('_data/app_store_countries.yml');
  const pages = new Set(countries.flatMap((row) => row.pages));
  const regions = ['africa_me_india', 'asia_pacific', 'europe', 'latin_america', 'us_canada'];
  for (const page of pages) {
    const picker = i18n[page]?.country_picker;
    assert.ok(picker, `${page} missing country_picker`);
    for (const key of ['label', 'title', 'language_title', 'back', 'close']) {
      assert.ok(picker[key], `${page} missing country_picker.${key}`);
    }
    for (const region of regions) {
      assert.ok(picker.regions?.[region], `${page} missing region ${region}`);
    }
  }
});
