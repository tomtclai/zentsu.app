import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../../locale.js', import.meta.url), 'utf8');

for (const pathname of ['/dial/', '/es/dial/', '/es-es/dial/']) {
  test(`${pathname} never redirects for browser or saved language`, () => {
    let bound = false;
    runInNewContext(source, {
      document: { readyState: 'loading', addEventListener: () => { bound = true; } },
      navigator: { languages: ['es-ES'], userAgent: 'Browser' },
      localStorage: { getItem: () => 'ja' },
      location: { pathname, replace: () => assert.fail('automatic redirect') },
    });
    assert.ok(bound);
  });
}
