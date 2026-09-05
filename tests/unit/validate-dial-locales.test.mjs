import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  checkAppStoreBadges,
  checkAppleItunesMeta,
  checkCopyPresence,
  checkEmDash,
  checkHtmlLangAndDir,
  checkImageAssets,
  checkJsonLd,
  checkKeyParity,
  checkLanguageSwitcher,
  checkPageExists,
  outputPathFor,
} from '../../scripts/validate-dial-locales.mjs';

const fixtureRoot = join(import.meta.dirname, '../fixtures/site-min');

function readFixture(relativePath) {
  return readFileSync(join(fixtureRoot, relativePath), 'utf8');
}

const enHtml = readFixture('dial/index.html');
const arHtml = readFixture('ar/dial/index.html');

const enCopy = {
  hero: { legal: 'Hero legal copy for English.' },
  plans: {
    lifetime_terms: 'once',
    annual_terms: 'per year',
    monthly_terms: 'per month',
  },
  privacy: { body: 'Privacy body copy for English.' },
  logging: { body: 'Logging body copy for English.' },
  app_store_badge_alt: 'Download Dial on the App Store',
  images: {
    today: { base: 'fixture-shot' },
  },
};

const arCopy = {
  ...enCopy,
  hero: { legal: 'Hero legal copy for Arabic.' },
  privacy: { body: 'Privacy body copy for Arabic.' },
  logging: { body: 'Logging body copy for Arabic.' },
  app_store_badge_alt: 'Download Dial on the App Store in Arabic',
};

const enPrices = { currency: 'USD', territory: 'USA' };
const enStorefront = { territory: 'USA' };
const expectedLanguages = ['en', 'ar'];

describe('validate-dial-locales checks against site-min fixtures', () => {
  test('checkPageExists finds built pages', () => {
    assert.deepEqual(
      checkPageExists({ locale: 'en', route: '/dial/', outputDirectory: fixtureRoot }).failures,
      [],
    );
    assert.deepEqual(
      checkPageExists({ locale: 'ar', route: '/ar/dial/', outputDirectory: fixtureRoot }).failures,
      [],
    );
    assert.equal(
      checkPageExists({ locale: 'en', route: '/missing/', outputDirectory: fixtureRoot })
        .failures[0].check,
      'page-exists',
    );
  });

  test('outputPathFor resolves extensionless routes', () => {
    assert.equal(
      outputPathFor('https://zentsu.app/dial/', fixtureRoot),
      join(fixtureRoot, 'dial/index.html'),
    );
  });

  test('checkHtmlLangAndDir accepts valid en and ar pages', () => {
    assert.deepEqual(checkHtmlLangAndDir({ locale: 'en', html: enHtml }), []);
    assert.deepEqual(checkHtmlLangAndDir({ locale: 'ar', html: arHtml }), []);
    assert.equal(
      checkHtmlLangAndDir({ locale: 'ar', html: arHtml.replace('dir="rtl"', 'dir="ltr"') })[0]
        .check,
      'html-dir',
    );
  });

  test('checkAppleItunesMeta requires exactly one tag', () => {
    assert.deepEqual(checkAppleItunesMeta({ locale: 'en', html: enHtml }), []);
    const duplicateMeta =
      enHtml.replace('<meta name="apple-itunes-app"', '<meta name="apple-itunes-app" data-dup') +
      enHtml.match(/<meta name="apple-itunes-app"[^>]*>/)[0];
    assert.equal(
      checkAppleItunesMeta({ locale: 'en', html: duplicateMeta })[0].check,
      'apple-itunes-app',
    );
  });

  test('checkJsonLd validates FAQ and offer currency', () => {
    assert.deepEqual(
      checkJsonLd({
        locale: 'en',
        html: enHtml,
        prices: enPrices,
        storefront: enStorefront,
        expectedFaqCount: 6,
      }),
      [],
    );
    const nullFaq = enHtml.replace('"FAQ answer six."', 'null');
    assert.equal(
      checkJsonLd({
        locale: 'en',
        html: nullFaq,
        prices: enPrices,
        storefront: enStorefront,
        expectedFaqCount: 6,
      })[0].check,
      'json-ld-faq-answer',
    );
  });

  test('checkImageAssets fails on a missing avif asset', () => {
    assert.deepEqual(checkImageAssets({ locale: 'en', copy: enCopy, assetsRoot: fixtureRoot }), []);
    assert.equal(
      checkImageAssets({
        locale: 'en',
        copy: { images: { today: { base: 'missing-shot' } } },
        assetsRoot: fixtureRoot,
      })[0].check,
      'image-asset',
    );
  });

  test('checkAppStoreBadges requires dimensions and existing assets', () => {
    assert.deepEqual(
      checkAppStoreBadges({ locale: 'en', html: enHtml, assetsRoot: fixtureRoot }),
      [],
    );
    const noSize = enHtml.replace(
      '<img\n          src="/assets/badges/download-on-the-app-store-en.svg"\n          alt="Download Dial on the App Store"\n          width="120"\n          height="40"\n        />',
      '<img\n          src="/assets/badges/download-on-the-app-store-en.svg"\n          alt="Download Dial on the App Store"\n        />',
    );
    assert.equal(
      checkAppStoreBadges({ locale: 'en', html: noSize, assetsRoot: fixtureRoot })[0].check,
      'app-store-badge-dimensions',
    );
  });

  test('checkKeyParity catches extra YAML keys', () => {
    const reference = { hero: { legal: 'x' }, plans: { lifetime_terms: 'once' } };
    assert.deepEqual(checkKeyParity({ locale: 'en', copy: reference, enCopy: reference }), []);
    assert.equal(
      checkKeyParity({ locale: 'en', copy: { ...reference, extra: 'key' }, enCopy: reference })[0]
        .check,
      'key-parity-extra',
    );
  });

  test('checkCopyPresence catches missing rendered copy', () => {
    assert.deepEqual(checkCopyPresence({ locale: 'en', html: enHtml, copy: enCopy }), []);
    assert.equal(
      checkCopyPresence({
        locale: 'en',
        html: enHtml.replace('Hero legal copy for English.', ''),
        copy: enCopy,
      })[0].check,
      'copy-presence',
    );
  });

  test('checkEmDash catches em dashes unless allowlisted', () => {
    assert.deepEqual(checkEmDash({ locale: 'en', html: enHtml }), []);
    const dashed = `${enHtml} —`;
    assert.equal(checkEmDash({ locale: 'en', html: dashed })[0].check, 'em-dash');
    assert.deepEqual(checkEmDash({ locale: 'en', html: dashed, allowlistCounts: { en: 1 } }), []);
  });

  test('checkLanguageSwitcher lists every expected hreflang code', () => {
    assert.deepEqual(checkLanguageSwitcher({ locale: 'en', html: enHtml, expectedLanguages }), []);
    assert.equal(
      checkLanguageSwitcher({
        locale: 'en',
        html: enHtml.replace('hreflang="ar"', 'hreflang="ar-x"'),
        expectedLanguages,
      })[0].check,
      'language-switcher',
    );
  });
});
