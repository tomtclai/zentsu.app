import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const outputDirectory = '_site';
const siteOrigin = 'https://zentsu.app';
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function read(path) {
  check(existsSync(path), `Missing required file: ${path}`);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function outputPathFor(url) {
  const { pathname } = new URL(url);
  if (pathname === '/') return join(outputDirectory, 'index.html');
  if (pathname.endsWith('/')) return join(outputDirectory, pathname, 'index.html');

  const filePath = join(outputDirectory, `${pathname}.html`);
  if (existsSync(filePath)) return filePath;
  return join(outputDirectory, pathname, 'index.html');
}

const htmlFiles = filesUnder(outputDirectory).filter((path) => path.endsWith('.html'));
const generatedHtml = htmlFiles.map((path) => read(path)).join('\n');
const sitemap = read(join(outputDirectory, 'sitemap.xml'));
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

check(sitemapUrls.length > 0, 'Sitemap contains no URLs');
check(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate URLs');

for (const url of sitemapUrls) {
  const parsed = new URL(url);
  check(parsed.origin === siteOrigin, `Sitemap URL uses the wrong origin: ${url}`);
  check(!parsed.pathname.endsWith('.html'), `Sitemap URL is not extensionless: ${url}`);

  const outputPath = outputPathFor(url);
  const html = read(outputPath);
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"\s*\/?>/g)].map(
    (match) => match[1],
  );
  check(canonicals.length === 1, `${url} must have exactly one canonical URL`);
  check(canonicals[0] === url, `${url} has mismatched canonical ${canonicals[0] ?? '(missing)'}`);
}

for (const path of htmlFiles) {
  const html = read(path);
  const legacyLinks = [...html.matchAll(/href="(\/[^"?#]*\.html)(?:[?#][^"]*)?"/g)].map(
    (match) => match[1],
  );
  check(legacyLinks.length === 0, `${path} links to legacy HTML URLs: ${legacyLinks.join(', ')}`);

  const relativeResourceUrls = [
    ...[...html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/\bsrcset="([^"]+)"/g)].flatMap((match) =>
      match[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0]),
    ),
  ].filter(
    (url) =>
      url &&
      !url.startsWith('/') &&
      !url.startsWith('#') &&
      !url.startsWith('https://') &&
      !url.startsWith('http://') &&
      !url.startsWith('mailto:') &&
      !url.startsWith('tel:') &&
      !url.startsWith('data:'),
  );
  check(
    relativeResourceUrls.length === 0,
    `${path} uses route-relative resource URLs: ${relativeResourceUrls.join(', ')}`,
  );
}

const notFound = read(join(outputDirectory, '404.html'));
check(
  /<meta name="robots" content="noindex, nofollow"\s*\/>/.test(notFound),
  '404 page must be noindex',
);
check(!sitemapUrls.includes(`${siteOrigin}/404.html`), '404 page must not appear in the sitemap');

check(
  !generatedHtml.includes('fonts.googleapis.com'),
  'Generated HTML requests fonts.googleapis.com',
);
check(!generatedHtml.includes('fonts.gstatic.com'), 'Generated HTML requests fonts.gstatic.com');
for (const fontAsset of [
  'assets/fonts.css',
  'assets/fonts/inter-tight-latin-v9.woff2',
  'assets/fonts/jetbrains-mono-latin-v24.woff2',
]) {
  check(existsSync(fontAsset), `Missing self-hosted font asset: ${fontAsset}`);
}

const bench = read(join(outputDirectory, 'bench.html'));
const benchBadgeAsset = 'assets/download-on-the-mac-app-store.svg';
const benchBadgeUrl = 'https://apps.apple.com/app/bench-dev-toolbox/id6763368925?mt=12';
const benchBadgeHash = '15111cd04380b58d95307dcb07f0b6b06304dbc7504c57fd9cdbf0a2f78e3a92';
check(existsSync(benchBadgeAsset), `Missing official Mac App Store badge: ${benchBadgeAsset}`);
if (existsSync(benchBadgeAsset)) {
  const actualHash = createHash('sha256').update(readFileSync(benchBadgeAsset)).digest('hex');
  check(actualHash === benchBadgeHash, 'Official Mac App Store badge must remain unmodified');
}
const benchBadgeLinks =
  bench.match(/<a[^>]*class="app-store-badge-link"[^>]*>[\s\S]*?<\/a>/g) ?? [];
check(
  benchBadgeLinks.length === 1,
  `Bench must contain exactly one official App Store badge, found ${benchBadgeLinks.length}`,
);
const benchBadgeLink = benchBadgeLinks[0] ?? '';
check(
  benchBadgeLink.includes(`href="${benchBadgeUrl}"`),
  'Official Mac App Store badge must link directly to the Bench product page',
);
check(
  benchBadgeLink.includes(`src="/${benchBadgeAsset}"`),
  'Official Mac App Store badge must use the root-relative self-hosted asset',
);
check(
  benchBadgeLink.includes('alt="Download Bench on the Mac App Store"'),
  'Official Mac App Store badge must have an accessible link description',
);
const benchCss = read('bench.css');
check(
  /\.app-store-badge-link img\s*{[\s\S]*?height:\s*40px;/.test(benchCss),
  'Official Mac App Store badge must render at least 40 CSS pixels high',
);
check(
  /\.app-store-badge-link\s*{[\s\S]*?padding:\s*10px;/.test(benchCss),
  'Official Mac App Store badge must preserve one-quarter-height clear space',
);
check(
  bench.includes('Apple, the Apple logo, Mac, and macOS are trademarks of Apple Inc.'),
  'Bench footer must include the Apple trademark credit required with the badge',
);
const benchToolNames = [...bench.matchAll(/<li data-tool="([^"]+)"/g)].map((match) => match[1]);
check(
  benchToolNames.length === 17,
  `Bench index must contain 17 tools, found ${benchToolNames.length}`,
);
check(
  /id="spec-tool-count">\s*17\s*</.test(bench),
  'Bench specification strip must report 17 tools',
);
for (const [name, href] of [
  ['Lorem Ipsum', '/tools/lorem-ipsum'],
  ['MOV to MP4', '/tools/mov-to-mp4'],
  ['MOV to GIF', '/tools/mov-to-gif'],
]) {
  check(benchToolNames.includes(name), `Bench index is missing ${name}`);
  check(new RegExp(`href="${href}"[^>]*>${name}</a>`).test(bench), `${name} must link to ${href}`);
}

function benchCategoryMarkup(category) {
  const marker = `<div class="tool-cat" data-cat="${category}">`;
  const start = bench.indexOf(marker);
  check(start !== -1, `Bench index is missing the ${category} category`);
  if (start === -1) return '';

  const nextCategory = bench.indexOf('<div class="tool-cat"', start + marker.length);
  return bench.slice(start, nextCategory === -1 ? bench.length : nextCategory);
}

const mediaCategory = benchCategoryMarkup('Media');
const convertersCategory = benchCategoryMarkup('Converters');
for (const name of ['MOV to MP4', 'MOV to GIF']) {
  check(mediaCategory.includes(`data-tool="${name}"`), `${name} must be listed under Media`);
  check(
    !convertersCategory.includes(`data-tool="${name}"`),
    `${name} must not be listed under Converters`,
  );
}
check(
  bench.includes('value="bench-product-notes"'),
  'Bench signup must use the bench-product-notes tag',
);
check(
  !generatedHtml.includes('Once Bench ships'),
  'Generated HTML contains stale Bench launch copy',
);
check(
  !generatedHtml.includes('Once the app ships'),
  'Generated HTML contains stale app launch copy',
);

const redirects = read(join(outputDirectory, '_redirects'));
for (const line of redirects.split('\n')) {
  const [, destination] = line.trim().split(/\s+/);
  if (destination)
    check(!destination.endsWith('.html'), `Redirect destination is not extensionless: ${line}`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Validated ${sitemapUrls.length} canonical URLs, ${htmlFiles.length} HTML files, and the custom 404.`,
);
