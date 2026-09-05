import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const siteOrigin = 'https://zentsu.app';
const repoRoot = join(dirname(new URL(import.meta.url).pathname), '..');
const siteDir = process.env.SITE_DIR ?? '_site';
const jsonOutput = process.argv.includes('--json');

const allowlistPath = join(repoRoot, 'scripts/dial-locale-allowlist.json');
const allowlist = JSON.parse(readFileSync(allowlistPath, 'utf8'));
const optionalKeys = new Set(allowlist.optionalKeys ?? []);
const dashAllowlist = allowlist.dashAllowlist ?? {};

const rtlLocales = new Set(['ar', 'he']);
const dashPattern = /[—]|\s–\s/g;

const imageSuffixes = ['@1x.png', '@2x.png', '.avif', '.webp', '-640.avif', '-640.webp'];

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

function loadDialValidationData() {
  const ruby = `
    require 'yaml'
    require 'json'
    root = ARGV[0]
    dial_dir = File.join(root, '_data/dial')
    copies = Dir[File.join(dial_dir, '*.yml')].to_h do |path|
      [File.basename(path, '.yml'), YAML.load_file(path)]
    end
    data = {
      routes: YAML.load_file(File.join(root, '_data/alternates.yml'))['dial'],
      prices: YAML.load_file(File.join(root, '_data/dial_prices.yml')),
      storefronts: YAML.load_file(File.join(root, '_data/dial_storefronts.yml')),
      faq: YAML.load_file(File.join(root, '_data/dial_faq.yml')),
      copies: copies,
    }
    puts JSON.generate(data)
  `;
  const result = spawnSync('ruby', ['-e', ruby, repoRoot], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Failed to load Dial validation data: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function read(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

export function outputPathFor(url, outputDirectory = siteDir) {
  const { pathname } = new URL(url);
  if (pathname === '/') return join(outputDirectory, 'index.html');
  if (pathname.endsWith('/')) return join(outputDirectory, pathname, 'index.html');

  const filePath = join(outputDirectory, `${pathname}.html`);
  if (existsSync(filePath)) return filePath;
  return join(outputDirectory, pathname, 'index.html');
}

function flattenKeys(value, prefix = '') {
  const keys = [];
  for (const [key, nested] of Object.entries(value ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      keys.push(...flattenKeys(nested, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function filterOptionalKeys(keys) {
  return keys.filter((key) => !optionalKeys.has(key)).sort();
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function normalizeWhitespace(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

export function expectedCopySnippet(text) {
  return normalizeWhitespace(escapeHtml(text ?? ''));
}

export function parseJsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map(
    (match) => JSON.parse(match[1]),
  );
}

export function imageAssetPaths(base) {
  return imageSuffixes.map((suffix) => join('assets', `${base}${suffix}`));
}

export function countEmDashes(html) {
  return [...html.matchAll(dashPattern)].length;
}

export function failure(locale, check, detail) {
  return { locale, check, detail };
}

export function checkPageExists({ locale, route, outputDirectory = siteDir }) {
  const failures = [];
  const url = `${siteOrigin}${route}`;
  const path = outputPathFor(url, outputDirectory);
  if (!existsSync(path)) {
    failures.push(failure(locale, 'page-exists', `Missing built page at ${path}`));
    return { failures, html: '', path };
  }
  return { failures, html: read(path), path };
}

export function checkHtmlLangAndDir({ locale, html }) {
  const failures = [];
  const langMatch = html.match(/<html\b[^>]*\slang="([^"]+)"/);
  if (!langMatch) {
    failures.push(failure(locale, 'html-lang', 'Missing html lang attribute'));
  } else if (langMatch[1] !== locale) {
    failures.push(
      failure(locale, 'html-lang', `Expected lang="${locale}", found lang="${langMatch[1]}"`),
    );
  }

  const dirMatch = html.match(/<html\b[^>]*\sdir="([^"]+)"/);
  const dir = dirMatch?.[1] ?? 'ltr';
  if (rtlLocales.has(locale)) {
    if (dir !== 'rtl') {
      failures.push(failure(locale, 'html-dir', `Expected dir="rtl", found dir="${dir}"`));
    }
  } else if (dir === 'rtl') {
    failures.push(failure(locale, 'html-dir', `Expected ltr page, found dir="rtl"`));
  }
  return failures;
}

export function checkAppleItunesMeta({ locale, html }) {
  const matches = [...html.matchAll(/<meta name="apple-itunes-app"[^>]*>/g)];
  if (matches.length !== 1) {
    return [
      failure(
        locale,
        'apple-itunes-app',
        `Expected exactly one apple-itunes-app meta tag, found ${matches.length}`,
      ),
    ];
  }
  return [];
}

export function checkJsonLd({ locale, html, prices, storefront, expectedFaqCount = 6 }) {
  const failures = [];
  let blocks;
  try {
    blocks = parseJsonLdBlocks(html);
  } catch (error) {
    return [failure(locale, 'json-ld-parse', error.message)];
  }

  if (blocks.length !== 2) {
    failures.push(
      failure(locale, 'json-ld-count', `Expected 2 JSON-LD blocks, found ${blocks.length}`),
    );
  }

  const faq = blocks.find((block) => block['@type'] === 'FAQPage');
  const app = blocks.find((block) => block['@type'] === 'SoftwareApplication');

  if (!faq) {
    failures.push(failure(locale, 'json-ld-faq', 'Missing FAQPage JSON-LD block'));
  } else {
    if (faq.inLanguage !== locale) {
      failures.push(
        failure(
          locale,
          'json-ld-faq-language',
          `FAQPage inLanguage is ${JSON.stringify(faq.inLanguage)}, expected ${JSON.stringify(locale)}`,
        ),
      );
    }
    const items = faq.mainEntity ?? [];
    if (items.length !== expectedFaqCount) {
      failures.push(
        failure(
          locale,
          'json-ld-faq-count',
          `FAQPage must have ${expectedFaqCount} items, found ${items.length}`,
        ),
      );
    }
    for (const [index, item] of items.entries()) {
      const answer = item?.acceptedAnswer?.text;
      if (answer === null || answer === undefined || String(answer).trim() === '') {
        failures.push(
          failure(locale, 'json-ld-faq-answer', `FAQ item ${index + 1} has an empty answer`),
        );
      }
    }
  }

  if (!app) {
    failures.push(failure(locale, 'json-ld-app', 'Missing SoftwareApplication JSON-LD block'));
  } else {
    const offers = app.offers ?? [];
    for (const offer of offers) {
      if (offer.priceCurrency !== prices.currency) {
        failures.push(
          failure(
            locale,
            'json-ld-offer-currency',
            `Offer ${offer.name ?? '(unnamed)'} priceCurrency is ${offer.priceCurrency}, expected ${prices.currency}`,
          ),
        );
      }
    }
  }

  if (prices.territory !== storefront.territory) {
    failures.push(
      failure(
        locale,
        'storefront-territory',
        `dial_prices territory ${prices.territory} does not match dial_storefronts territory ${storefront.territory}`,
      ),
    );
  }

  return failures;
}

export function checkImageAssets({ locale, copy, assetsRoot = repoRoot }) {
  const failures = [];
  const images = copy?.images ?? {};
  for (const [name, image] of Object.entries(images)) {
    const base = image?.base;
    if (!base) {
      failures.push(failure(locale, 'image-base', `images.${name} is missing base`));
      continue;
    }
    for (const relativePath of imageAssetPaths(base)) {
      const absolutePath = join(assetsRoot, relativePath);
      if (!existsSync(absolutePath)) {
        failures.push(failure(locale, 'image-asset', `Missing image asset: ${relativePath}`));
      }
    }
  }
  return failures;
}

export function checkAppStoreBadges({ locale, html, assetsRoot = repoRoot }) {
  const failures = [];
  const badges = [...html.matchAll(/<img\b[^>]*src="(\/assets\/badges\/[^"]+)"[^>]*>/g)];
  if (badges.length === 0) {
    failures.push(failure(locale, 'app-store-badge', 'No App Store badge images found'));
    return failures;
  }
  for (const match of badges) {
    const tag = match[0];
    const src = match[1];
    if (!/\bwidth="[^"]+"/.test(tag) || !/\bheight="[^"]+"/.test(tag)) {
      failures.push(
        failure(locale, 'app-store-badge-dimensions', `Badge missing width/height: ${src}`),
      );
    }
    const assetPath = join(assetsRoot, src.replace(/^\//, ''));
    if (!existsSync(assetPath)) {
      failures.push(failure(locale, 'app-store-badge-asset', `Missing badge asset: ${src}`));
    }
  }
  return failures;
}

export function checkKeyParity({ locale, copy, enCopy = null }) {
  const failures = [];
  const reference = enCopy ?? loadYaml(join(repoRoot, '_data/dial/en.yml'));
  const localeKeys = new Set(filterOptionalKeys(flattenKeys(copy)));
  const referenceKeys = new Set(filterOptionalKeys(flattenKeys(reference)));
  for (const key of referenceKeys) {
    if (!localeKeys.has(key)) {
      failures.push(failure(locale, 'key-parity-missing', `Missing key ${key}`));
    }
  }
  for (const key of localeKeys) {
    if (!referenceKeys.has(key)) {
      failures.push(failure(locale, 'key-parity-extra', `Unexpected key ${key}`));
    }
  }
  return failures;
}

export function checkCopyPresence({ locale, html, copy }) {
  const failures = [];
  const fields = [
    ['hero.legal', copy?.hero?.legal],
    ['plans.lifetime_terms', copy?.plans?.lifetime_terms],
    ['plans.annual_terms', copy?.plans?.annual_terms],
    ['plans.monthly_terms', copy?.plans?.monthly_terms],
    ['privacy.body', copy?.privacy?.body],
    ['logging.body', copy?.logging?.body],
    ['app_store_badge_alt', copy?.app_store_badge_alt],
  ];
  const normalizedHtml = normalizeWhitespace(html);
  for (const [label, value] of fields) {
    if (value === null || value === undefined || String(value).trim() === '') {
      failures.push(failure(locale, 'copy-source', `${label} is empty in locale YAML`));
      continue;
    }
    const snippet = expectedCopySnippet(value);
    if (!normalizedHtml.includes(snippet)) {
      failures.push(
        failure(locale, 'copy-presence', `${label} from locale YAML is missing in built HTML`),
      );
    }
  }
  return failures;
}

export function checkEmDash({ locale, html, allowlistCounts = dashAllowlist }) {
  const count = countEmDashes(html);
  const allowed = allowlistCounts[locale];
  if (allowed === undefined) {
    if (count > 0) {
      return [
        failure(
          locale,
          'em-dash',
          `Found ${count} em-dash or spaced en-dash occurrence(s); add to dashAllowlist if intentional`,
        ),
      ];
    }
    return [];
  }
  if (count > allowed) {
    return [failure(locale, 'em-dash', `Em-dash count grew from ${allowed} to ${count}`)];
  }
  return [];
}

export function checkLanguageSwitcher({ locale, html, expectedLanguages }) {
  const failures = [];
  const picker =
    html.match(/<ul class="nav-lang-menu">[\s\S]*?<\/ul>/)?.[0] ??
    html.match(/<li class="nav-lang">[\s\S]*?<\/details>\s*<\/li>/)?.[0] ??
    '';
  if (!picker) {
    return [failure(locale, 'language-switcher', 'Missing nav language switcher')];
  }
  for (const language of expectedLanguages) {
    if (!picker.includes(`hreflang="${language}"`)) {
      failures.push(
        failure(locale, 'language-switcher', `Missing hreflang="${language}" in language switcher`),
      );
    }
  }
  return failures;
}

const localeCheckCount = 10;

export function validateLocale({
  locale,
  route,
  copy,
  prices,
  storefront,
  outputDirectory = siteDir,
  assetsRoot = repoRoot,
  enCopy = null,
  expectedLanguages,
  dashAllowlistCounts = dashAllowlist,
  expectedFaqCount = 6,
}) {
  const { failures: pageFailures, html } = checkPageExists({ locale, route, outputDirectory });
  if (pageFailures.length > 0) {
    return { failures: pageFailures, checks: localeCheckCount };
  }

  const failures = [
    ...checkHtmlLangAndDir({ locale, html }),
    ...checkAppleItunesMeta({ locale, html }),
    ...checkJsonLd({ locale, html, prices, storefront, expectedFaqCount }),
    ...checkImageAssets({ locale, copy, assetsRoot }),
    ...checkAppStoreBadges({ locale, html, assetsRoot }),
    ...checkKeyParity({ locale, copy, enCopy }),
    ...checkCopyPresence({ locale, html, copy }),
    ...checkEmDash({ locale, html, allowlistCounts: dashAllowlistCounts }),
    ...checkLanguageSwitcher({ locale, html, expectedLanguages }),
  ];
  return { failures, checks: localeCheckCount };
}

export function validateAllDialLocales({
  outputDirectory = siteDir,
  assetsRoot = repoRoot,
  routes = null,
  dashAllowlistCounts = dashAllowlist,
  validationData = null,
} = {}) {
  const data = validationData ?? loadDialValidationData();
  const dialRoutes = routes ?? data.routes ?? {};
  const dialPrices = data.prices ?? {};
  const dialStorefronts = data.storefronts ?? {};
  const dialFaq = data.faq ?? {};
  const dialCopies = data.copies ?? {};
  const enCopy = dialCopies.en ?? loadYaml(join(repoRoot, '_data/dial/en.yml'));
  const enFaqCount = dialFaq.en?.items?.length ?? 6;
  const expectedLanguages = Object.keys(dialRoutes);
  const locales = expectedLanguages;
  const failures = [];
  let totalChecks = 0;

  for (const locale of locales) {
    const route = dialRoutes[locale];
    const copy = dialCopies[locale] ?? loadYaml(join(repoRoot, '_data/dial', `${locale}.yml`));
    const prices = dialPrices[locale];
    const storefront = dialStorefronts[locale];
    const result = validateLocale({
      locale,
      route,
      copy,
      prices,
      storefront,
      outputDirectory,
      assetsRoot,
      enCopy,
      expectedLanguages,
      dashAllowlistCounts,
      expectedFaqCount: dialFaq[locale]?.items?.length ?? enFaqCount,
    });
    totalChecks += result.checks;
    failures.push(...result.failures);
  }

  return {
    locales: locales.length,
    checks: totalChecks,
    failures,
  };
}

function printFailures(failures) {
  for (const item of failures) {
    console.error(`${item.locale}\t${item.check}\t${item.detail}`);
  }
}

function main() {
  const report = validateAllDialLocales();
  const summary = `${report.locales} locales, ${report.checks} checks, ${report.failures.length} failures`;
  if (jsonOutput) {
    console.log(JSON.stringify({ ...report, summary }, null, 2));
  } else {
    printFailures(report.failures);
    console.log(summary);
  }
  process.exit(report.failures.length > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
