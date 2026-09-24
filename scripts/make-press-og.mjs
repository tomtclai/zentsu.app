// Renders the Press 1200x630 social banner (assets/press-og.png) and the
// 512px assets/press-icon.png.
//   node scripts/make-press-og.mjs
//
// The banner reuses the hero's before/after file card from press/index.html
// (the markup between the press-hero-visual markers) and the site's own
// stylesheets and self-hosted fonts, rendered through Playwright's bundled
// Chromium, so the banner and the page cannot drift apart. The icon is a
// resized copy of the app's 1024px App Store icon.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(SITE, 'assets');
const APP_ICON = path.resolve(SITE, '..', 'Press', 'fastlane', 'metadata', 'app_icon.png');
const ORIGIN = 'https://press-og.local';
const W = 1200;
const H = 630;

const MIME = {
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.js': 'text/javascript',
};

function heroVisualMarkup() {
  const page = readFileSync(path.join(SITE, 'press', 'index.html'), 'utf8');
  const match = page.match(/<!-- press-hero-visual:start -->([\s\S]*?)<!-- press-hero-visual:end -->/);
  if (!match) throw new Error('press/index.html has no press-hero-visual markers');
  return match[1].replace('class="press-ba"', 'class="press-ba press-ba--stack"');
}

function bannerHtml() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="/assets/fonts.css" />
<link rel="stylesheet" href="/shared.css" />
<link rel="stylesheet" href="/press.css" />
<style>
  html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    display: block;
    min-height: 0;
    background: var(--bg);
    background-image: radial-gradient(circle at 1px 1px, rgba(20, 17, 15, 0.07) 1px, transparent 0);
    background-size: 26px 26px;
    position: relative;
  }
  .og { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 470px; gap: 40px; padding: 64px 80px 72px; }
  .og-copy { display: flex; flex-direction: column; justify-content: center; }
  .og-brand { display: flex; align-items: center; gap: 22px; margin-bottom: 26px; }
  .og-brand img { width: 108px; height: 108px; border-radius: 24px; box-shadow: 0 18px 36px -18px rgba(20, 17, 15, 0.45); }
  .og-brand h1 { font-size: 112px; font-weight: 800; letter-spacing: -0.045em; line-height: 1; color: var(--ink); margin: 0; }
  .og-tag { font-size: 38px; font-weight: 500; color: var(--ink-soft); letter-spacing: -0.015em; line-height: 1.2; margin: 0 0 22px; max-width: 12ch; }
  .og-url { font-family: 'JetBrains Mono', monospace; font-size: 22px; letter-spacing: 0.1em; color: var(--accent); margin: 0; }
  .og-visual { display: flex; align-items: center; }
  .og-visual .press-ba { max-width: none; }
  .og-visual .press-file { padding: 22px 24px 20px; }
  .og-visual .press-file-size { font-size: 44px; }
  .og-visual .press-file-name { font-size: 17px; }
  .og-visual .press-file-meta { font-size: 15px; }
  .og-visual .press-chip { font-size: 13px; }
  .og-visual .press-file-glyph { width: 50px; height: 50px; font-size: 13px; border-radius: 10px; }
  .og-visual .press-ba-arrow-label { font-size: 13px; }
  .og-visual .press-ba-arrow svg { width: 44px; height: 22px; }
  .og-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: var(--accent); }
</style>
</head>
<body>
  <div class="og">
    <div class="og-copy">
      <div class="og-brand">
        <img src="/assets/press-icon.png" alt="" />
        <h1>Press</h1>
      </div>
      <p class="og-tag">Video &amp; image converter for macOS</p>
      <p class="og-url">zentsu.app/press</p>
    </div>
    <div class="og-visual">${heroVisualMarkup()}</div>
  </div>
  <div class="og-bar"></div>
</body>
</html>`;
}

async function writeIcon() {
  if (!existsSync(APP_ICON)) throw new Error(`App icon not found at ${APP_ICON}`);
  await sharp(APP_ICON)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, 'press-icon.png'));
  console.log('[done] press-icon.png');
}

async function writeBanner() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  await page.route(`${ORIGIN}/**`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') {
      return route.fulfill({ status: 200, contentType: 'text/html', body: bannerHtml() });
    }
    const file = path.join(SITE, url.pathname);
    if (!file.startsWith(SITE) || !existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({
      status: 200,
      contentType: MIME[path.extname(file)] ?? 'application/octet-stream',
      body: readFileSync(file),
    });
  });
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ASSETS, 'press-og.png'), type: 'png' });
  await browser.close();
  console.log('[done] press-og.png');
}

await writeIcon();
await writeBanner();
