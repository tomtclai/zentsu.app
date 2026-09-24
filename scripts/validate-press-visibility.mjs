// Asserts Press stays dark on the production build until it is meant to be
// live. Wired into `npm test` after `validate:app-visibility` (package.json).
//
// Reads `press_live` from _config.yml, the single flag SITE-PLAN.md section 7
// flips at go-live. Below that, an explicit allowlist of routes lets a subset
// go live independently while press_live stays false: '/press/privacy' and
// '/press/support' are allowlisted here (each carries its own front-matter
// `published: true` override) so App Review has working privacy and support
// URLs before the rest of Press, or the store listing, exists.
//
// - press_live true: every Press route must be built, self-canonical, and in
//   the sitemap; the homepage and /apps must list Press.
// - press_live false: only the allowlisted routes may be built (each must
//   still be self-canonical and in the sitemap); every other Press route,
//   and the rest of _site/press/, must not exist; the homepage and /apps
//   must not mention Press.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outputDirectory = '_site';
const siteOrigin = 'https://zentsu.app';

const LIVE_ROUTES_WHILE_DARK = ['/press/privacy', '/press/support'];

const errors = [];
function check(condition, message) {
  if (!condition) errors.push(message);
}

function loadYaml(path) {
  const result = spawnSync(
    'ruby',
    ['-ryaml', '-rjson', '-e', 'puts YAML.load_file(ARGV[0]).to_json', path],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to parse ${path}: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function outputPathFor(route) {
  return route.endsWith('/')
    ? join(outputDirectory, route, 'index.html')
    : join(outputDirectory, `${route}.html`);
}

const config = loadYaml('_config.yml');
const pressLive = config.press_live === true;

const pairSlugs = loadYaml('_data/press_pairs.yml').map((pair) => pair.slug);
const allRoutes = [
  '/press/',
  '/press/privacy',
  '/press/support',
  ...pairSlugs.map((slug) => `/press/convert/${slug}`),
];

const expectedLiveRoutes = allRoutes.filter(
  (route) => pressLive || LIVE_ROUTES_WHILE_DARK.includes(route),
);
const expectedLivePaths = new Set(expectedLiveRoutes.map(outputPathFor));

const sitemap = readIfExists(join(outputDirectory, 'sitemap.xml'));

for (const route of allRoutes) {
  const path = outputPathFor(route);
  const url = `${siteOrigin}${route}`;
  const shouldBeLive = expectedLivePaths.has(path);

  if (shouldBeLive) {
    check(existsSync(path), `Expected ${route} to be live, but ${path} was not built`);
    if (existsSync(path)) {
      const html = readFileSync(path, 'utf8');
      check(
        html.includes(`<link rel="canonical" href="${url}"`),
        `${route} is live but has no self-canonical to ${url}`,
      );
    }
    check(sitemap.includes(`<loc>${url}</loc>`), `${route} is live but missing from the sitemap`);
  } else {
    check(!existsSync(path), `${route} must stay dark, but ${path} was built`);
    check(!sitemap.includes(`<loc>${url}</loc>`), `${route} must stay dark but is in the sitemap`);
  }
}

// Belt-and-suspenders: nothing under _site/press/ beyond the routes above
// know about, so a stray file (a bad merge, a forgotten `published: false`
// on a new page) fails loudly instead of shipping unnoticed.
for (const file of filesUnder(join(outputDirectory, 'press'))) {
  check(expectedLivePaths.has(file), `Unexpected file under _site/press/ while dark: ${file}`);
}

const indexHtml = readIfExists(join(outputDirectory, 'index.html'));
const appsHtml = readIfExists(join(outputDirectory, 'apps.html'));
if (pressLive) {
  check(indexHtml.includes('data-app="press"'), 'index.html should list Press once press_live is true');
  check(appsHtml.includes('data-app="press"'), 'apps.html should list Press once press_live is true');
} else {
  check(!indexHtml.includes('data-app="press"'), 'index.html must not mention Press while press_live is false');
  check(!appsHtml.includes('data-app="press"'), 'apps.html must not mention Press while press_live is false');
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Press visibility OK (press_live=${pressLive}, ${LIVE_ROUTES_WHILE_DARK.length} route(s) allowlisted while dark, ${allRoutes.length} routes checked).`,
);
