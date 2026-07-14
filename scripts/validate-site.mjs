import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
