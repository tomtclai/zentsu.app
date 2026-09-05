import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

const require = createRequire(import.meta.url);
const { localeFromLanguageTags } = require('../../locale.js');

const publishedDialLocales = {
  zh: '/zh/dial/',
  'zh-hant': '/zh-hant/dial/',
  es: '/es/dial/',
  en: '/dial/',
};

const cases = [
  [['zh-TW'], 'zh-hant'],
  [['zh-HK'], 'zh-hant'],
  [['zh-MO'], 'zh-hant'],
  [['zh-Hant'], 'zh-hant'],
  [['zh-Hant-TW'], 'zh-hant'],
  [['zh-CN'], 'zh'],
  [['zh-SG'], 'zh'],
  [['zh-Hans'], 'zh'],
  [['zh'], 'zh'],
  [['zh-TW', 'zh'], 'zh-hant'],
  [['es-MX'], 'es'],
  [['pt-PT'], null],
  [['zh-Hans-SG'], 'zh'],
  [['nb-NO'], null],
  [['nn'], null],
  [['sr'], null],
  [['en-GB'], 'en'],
  [[], null],
  [['fr-CA'], null],
];

describe('localeFromLanguageTags', () => {
  for (const [tags, expected] of cases) {
    test(`${JSON.stringify(tags)} resolves to ${JSON.stringify(expected)}`, () => {
      assert.equal(localeFromLanguageTags(tags, publishedDialLocales), expected);
    });
  }
});
