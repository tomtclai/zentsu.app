import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(path.resolve(__dirname, '..'), '_data', 'dial_rating.yml');
const lookupUrl = 'https://itunes.apple.com/lookup?id=6789408903&country=us';
const minCount = 20;

const response = await fetch(lookupUrl);
if (!response.ok) {
  throw new Error(`lookup failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const result = payload.results?.[0];
if (!result) {
  throw new Error('lookup returned no results');
}

const count = Number(result.userRatingCount ?? 0);
const averageRaw = Number(result.averageUserRating ?? 0);
const average = count > 0 ? averageRaw.toFixed(1) : '';
const enabled = count >= minCount;

const lines = [
  `enabled: ${enabled}`,
  `average: "${enabled ? average : ''}"`,
  `count: "${enabled ? String(count) : ''}"`,
  `updated: "${new Date().toISOString().slice(0, 10)}"`,
  '',
];

fs.writeFileSync(outPath, lines.join('\n'));

console.log(
  enabled
    ? `dial_rating.yml updated: ${average} (${count} ratings)`
    : `dial_rating.yml kept disabled (${count} ratings, need ${minCount})`,
);
