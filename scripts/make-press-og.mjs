// Renders the Press 1200x630 social banner (assets/press-og.png) and the
// 512px assets/press-icon.png.
//   node scripts/make-press-og.mjs
//
// The banner pairs the app icon and name with the app window cropped from
// the Discord marketing screenshot in Press/fastlane/screenshots/en-US/,
// laid out with the site's own stylesheets and self-hosted fonts and
// rendered through Playwright's bundled Chromium. The icon is a resized copy
// of the app's 1024px App Store icon.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(SITE, 'assets');
const APP_ICON = path.resolve(SITE, '..', 'Press', 'fastlane', 'metadata', 'app_icon.png');
const WINDOW_SCREENSHOT = path.resolve(
  SITE,
  '..',
  'Press',
  'fastlane',
  'screenshots',
  'en-US',
  '02-DiscordSized.png',
);
const WINDOW_CROP = { left: 360, top: 367, width: 2160, height: 1357 };
const WINDOW_ROUTE = '/og-window.png';
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

async function windowCrop() {
  if (!existsSync(WINDOW_SCREENSHOT))
    throw new Error(`Screenshot not found at ${WINDOW_SCREENSHOT}`);
  return sharp(WINDOW_SCREENSHOT).extract(WINDOW_CROP).resize({ width: 1200 }).png().toBuffer();
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
  .og { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 620px; gap: 36px; padding: 56px 56px 64px 72px; }
  .og-copy { display: flex; flex-direction: column; justify-content: center; }
  .og-brand { display: flex; align-items: center; gap: 22px; margin-bottom: 26px; }
  .og-brand img { width: 92px; height: 92px; border-radius: 21px; box-shadow: 0 18px 36px -18px rgba(20, 17, 15, 0.45); }
  .og-brand h1 { font-size: 96px; font-weight: 800; letter-spacing: -0.045em; line-height: 1; color: var(--ink); margin: 0; }
  .og-tag { font-size: 38px; font-weight: 500; color: var(--ink-soft); letter-spacing: -0.015em; line-height: 1.2; margin: 0 0 22px; max-width: 12ch; }
  .og-url { font-family: 'JetBrains Mono', monospace; font-size: 22px; letter-spacing: 0.1em; color: var(--accent); margin: 0; }
  .og-visual { display: flex; align-items: center; }
  .og-visual img { display: block; width: 620px; height: auto; border-radius: 12px; border: 1px solid var(--border-soft); box-shadow: 0 30px 60px -30px rgba(20, 17, 15, 0.45); }
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
    <div class="og-visual"><img src="${WINDOW_ROUTE}" alt="" /></div>
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
  const windowPng = await windowCrop();
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
    if (url.pathname === WINDOW_ROUTE) {
      return route.fulfill({ status: 200, contentType: 'image/png', body: windowPng });
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
