import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const sharedCss = read('shared.css');
const benchCss = read('bench.css');
const benchHtml = read('bench.html');
const toolIndex = read('_includes/tool-index.html');
const benchJs = read('bench.js');

function firstHexToken(css, name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert(match, `Missing --${name} token`);
  return match[1];
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function assertTextContrast(label, foreground, background) {
  const ratio = contrast(foreground, background);
  assert(ratio >= 4.5, `${label} contrast is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
}

for (const [name, css, softName] of [
  ['shared', sharedCss, 'accent-light'],
  ['bench', benchCss, 'accent-soft'],
]) {
  const accent = firstHexToken(css, 'accent');
  const spot = firstHexToken(css, 'spot');
  assertTextContrast(`${name} accent on page`, accent, firstHexToken(css, 'bg'));
  assertTextContrast(`${name} accent on card`, accent, firstHexToken(css, 'surface'));
  assertTextContrast(`${name} page label`, accent, firstHexToken(css, softName));
  assertTextContrast(`${name} coming-soon label`, spot, firstHexToken(css, 'bg-alt'));
}

const pillBackground = benchCss.match(/\.bp-pill\s*{[\s\S]*?background:\s*(#[0-9a-fA-F]{6})/)[1];
const pillSubtitle = benchCss.match(/\.bp-pill-sub\s*{[\s\S]*?color:\s*(#[0-9a-fA-F]{6})/)[1];
assertTextContrast('Smart Detection title', '#ffffff', pillBackground);
assertTextContrast('Smart Detection subtitle', pillSubtitle, pillBackground);

assert.equal((benchHtml.match(/<div class="bp-pill">/g) || []).length, 4);
assert(
  !/<button[^>]*class="bp-pill"/.test(benchHtml),
  'Smart Detection results must not be buttons',
);
assert(!/bp-pill-enter/.test(benchHtml), 'Smart Detection results must not imply keyboard action');
assert(
  !/\.bp-pill:hover/.test(benchCss),
  'Static Smart Detection results must not have hover affordance',
);

assert(/id="tool-filter-results"[^>]*role="status"/.test(toolIndex));
assert(/aria-live="polite"/.test(toolIndex));
assert(/cat\.hidden\s*=/.test(benchJs), 'Filtered categories must use the hidden state');
assert(/setAttribute\('aria-pressed', 'false'\)/.test(benchJs));
assert(/setAttribute\('aria-pressed', 'true'\)/.test(benchJs));
assert(/Showing all /.test(benchJs));
assert(/tools in /.test(benchJs));

assert(/nav\.setAttribute\('inert', ''\)/.test(benchJs));
assert(/nav\.setAttribute\('aria-hidden', 'true'\)/.test(benchJs));
assert(/nav\.removeAttribute\('inert'\)/.test(benchJs));
assert(/nav\.removeAttribute\('aria-hidden'\)/.test(benchJs));
assert(/prefers-reduced-motion: no-preference/.test(benchJs));

function generatedHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return generatedHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}

const generatedPages = generatedHtmlFiles(join(root, '_site'));
assert(generatedPages.length > 0, 'Build the site before running accessibility validation');
generatedPages.forEach((path) => {
  const html = readFileSync(path, 'utf8');
  const label = path.slice(root.length + 1);
  const skipLinks = html.match(/class="[^"]*\bskip-link\b[^"]*"/g) || [];
  const mainTargets = html.match(/id="main-content"/g) || [];
  assert.equal(skipLinks.length, 1, `${label} must contain one skip link`);
  assert.equal(mainTargets.length, 1, `${label} must contain one main-content target`);
  assert(/<a[^>]*class="skip-link"[^>]*href="#main-content"/.test(html), `${label} skip link`);
  assert(
    /<main[^>]*id="main-content"[^>]*tabindex="-1"/.test(html),
    `${label} main target must accept focus`,
  );
  const skipOffset = html.indexOf('class="skip-link"');
  const mainOffset = html.indexOf('id="main-content"');
  assert(skipOffset < mainOffset, `${label} skip link must precede main content`);
  const navOffset = html.indexOf('<nav>');
  if (navOffset !== -1)
    assert(skipOffset < navOffset, `${label} skip link must precede navigation`);
});

const builtBench = read('_site/bench.html');
const toolRows = builtBench.match(/<li data-tool="[^"]+"[\s\S]*?<\/li>/g) || [];
assert(toolRows.length > 0, 'Generated Bench page must contain tool rows');
toolRows.forEach((row) => {
  const tool = row.match(/data-tool="([^"]+)"/)[1];
  const describedBy = row.match(/<a[^>]*aria-describedby="([^"]+)"/);
  assert(describedBy, `${tool} link must reference its benefit`);
  const benefitId = describedBy[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tooltip = row.match(
    new RegExp(`<span class="tool-benefit" id="${benefitId}" role="tooltip">([^<]+)</span>`),
  );
  assert(tooltip?.[1].trim(), `${tool} must have real benefit text`);
});
assert(
  !/data-benefit=/.test(builtBench),
  'Benefits must not rely on generated pseudo-element text',
);
assert(/\.tool-cat li:hover \.tool-benefit/.test(benchCss));
assert(/\.tool-cat li:focus-within \.tool-benefit/.test(benchCss));
assert(/\.tool-benefit\s*{[\s\S]*?pointer-events:\s*auto/.test(benchCss));
assert(!/data-benefit[^\n]*::after/.test(benchCss));
assert(/querySelector\('\.tool-benefit'\)\?\.textContent\.trim\(\)/.test(benchJs));
assert(!/getAttribute\('data-benefit'\)/.test(benchJs));

console.log('Bench accessibility validation passed.');
