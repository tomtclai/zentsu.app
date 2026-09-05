import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const landing = read('dial.html') + read('_includes/dial/guide.html');
const guide = read('dial/medication-log.html');
const copy = read('_data/dial/en.yml');

test('the medication log guide has a stable public route and links back to Dial support', () => {
  assert.match(guide, /permalink: \/dial\/medication-log\//);
  assert.match(guide, /canonical: https:\/\/zentsu\.app\/dial\/medication-log\//);
  assert.match(guide, /href="\/dial\/support\/"/);
  assert.match(guide, /href="\/dial\/privacy\/"/);
});

test('the landing guide points to the article and states the product boundary', () => {
  assert.match(landing, /href="\/dial\/medication-log\/"/);
  assert.match(landing, /free phone log/);
  assert.match(landing, /Apple Watch logging/);
  assert.match(guide, /does not calculate a\s+dose/);
  assert.match(guide, /not a medical record or treatment\s+plan/);
});

test('English plan copy keeps the free phone log separate from Pro tools', () => {
  const freeSummary = copy.match(/free_summary: (.+)/)?.[1] ?? '';
  const proSummary = copy.match(/pro_summary: (.+)/)?.[1] ?? '';
  assert.match(freeSummary, /phone log/);
  assert.doesNotMatch(freeSummary, /Watch|chart|export/i);
  assert.match(proSummary, /wrist|chart|export/i);
});
