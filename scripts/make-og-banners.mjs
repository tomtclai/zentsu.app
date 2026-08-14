// Render the 1200x630 social-share banners into assets/.
//   node scripts/make-og-banners.mjs
//
// Requires the brand fonts (Inter Tight, JetBrains Mono) to be discoverable by
// fontconfig. If they are not installed system-wide, point fontconfig at a
// directory that holds them:
//   FONTCONFIG_FILE=/path/to/fonts.conf node scripts/make-og-banners.mjs
// The fonts match the webfonts loaded in _includes/head-common.html.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(__dirname, '..', 'assets');
const BENCH_ICON = path.join(ASSETS, 'bench-icon.png');
const DIAL_ICON = path.join(ASSETS, 'dial-icon.png');

const W = 1200;
const H = 630;

// Shared warm-paper backdrop with a faded pegboard dot grid, matched to bench.css.
const defs = `
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.4" cy="1.4" r="1.4" fill="#14110f" opacity="0.06"/>
    </pattern>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5f3ee" stop-opacity="0"/>
      <stop offset="1" stop-color="#f5f3ee" stop-opacity="0.55"/>
    </linearGradient>
  </defs>`;

const backdrop = `
  <rect width="${W}" height="${H}" fill="#f5f3ee"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#4a7c6f"/>`;

async function roundedIcon(iconPath, size, radius) {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
  return sharp(iconPath)
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function benchBanner() {
  const s = 300;
  const x = 800;
  const y = 165;
  const r = 66;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs}
  ${backdrop}
  <rect x="${x}" y="${y + 20}" width="${s}" height="${s}" rx="${r}" fill="#14110f" opacity="0.30" filter="url(#shadow)"/>
  <text x="90" y="340" font-family="Inter Tight" font-weight="800" font-size="150" letter-spacing="-6" fill="#14110f">Bench</text>
  <text x="96" y="406" font-family="Inter Tight" font-weight="500" font-size="46" fill="#2a2622">Dev Toolbox for macOS</text>
  <text x="98" y="486" font-family="JetBrains Mono" font-weight="500" font-size="25" letter-spacing="2" fill="#4a7c6f">zentsu.app</text>
</svg>`;
  const icon = await roundedIcon(BENCH_ICON, s, r);
  await sharp(Buffer.from(svg))
    .composite([{ input: icon, left: x, top: y }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, 'bench-og.png'));
  console.log('[done] bench-og.png');
}

async function zentsuBanner() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs}
  ${backdrop}
  <g stroke="#4a7c6f" stroke-width="3" opacity="0.5" fill="none">
    <path d="M90 96 h34 M90 96 v34"/>
    <path d="M${W - 90} 96 h-34 M${W - 90} 96 v34"/>
  </g>
  <text x="90" y="300" font-family="Inter Tight" font-weight="800" font-size="128" letter-spacing="-4" fill="#14110f">Zentsu LLC</text>
  <text x="96" y="372" font-family="Inter Tight" font-weight="500" font-size="46" fill="#2a2622">Software for Apple platforms</text>
  <text x="98" y="452" font-family="JetBrains Mono" font-weight="500" font-size="25" letter-spacing="2" fill="#4a7c6f">zentsu.app</text>
</svg>`;
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, 'zentsu-og.png'));
  console.log('[done] zentsu-og.png');
}

// One banner per Dial locale. `tagline` is the only translated string; the
// tagline font size shrinks for longer translations so the text clears the icon.
const DIAL_BANNERS = [
  { file: 'dial-og.png', tagline: 'Private GLP-1 medication tracker', taglineSize: 42 },
  { file: 'dial-og-es.png', tagline: 'Registro privado de medicamentos GLP-1', taglineSize: 33 },
  // Hiragino: Inter Tight has no CJK glyphs.
  {
    file: 'dial-og-ja.png',
    tagline: '非公開のGLP-1記録',
    taglineSize: 42,
    taglineFont: 'Hiragino Sans, Hiragino Kaku Gothic ProN',
  },
  {
    file: 'dial-og-he.png',
    tagline: 'יומן תרופות GLP-1 פרטי',
    taglineSize: 36,
    taglineFont: 'Arial Hebrew, Arial',
  },
  {
    file: 'dial-og-ar.png',
    tagline: 'سجل أدوية GLP-1 خاص',
    taglineSize: 36,
    taglineFont: 'Geeza Pro, Arial',
  },
];

async function dialBanner({ file, tagline, taglineSize, taglineFont = 'Inter Tight' }) {
  const s = 300;
  const x = 800;
  const y = 165;
  const r = 66;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dial-dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.4" cy="1.4" r="1.4" fill="#ef705f" opacity="0.12"/>
    </pattern>
    <filter id="dial-shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#fffaf6"/>
  <rect width="${W}" height="${H}" fill="url(#dial-dots)"/>
  <circle cx="970" cy="315" r="230" fill="none" stroke="#ef705f" stroke-width="18" opacity="0.12"/>
  <rect x="${x}" y="${y + 20}" width="${s}" height="${s}" rx="${r}" fill="#4c211c" opacity="0.28" filter="url(#dial-shadow)"/>
  <text x="90" y="300" font-family="Inter Tight" font-weight="800" font-size="150" letter-spacing="-6" fill="#14110f">Dial</text>
  <text x="96" y="375" font-family="${taglineFont}" font-weight="600" font-size="${taglineSize}" fill="#2a2622">${tagline}</text>
  <text x="98" y="448" font-family="JetBrains Mono" font-weight="500" font-size="23" letter-spacing="1.5" fill="#b9463b">iPhone · Apple Watch</text>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#ef705f"/>
</svg>`;
  const icon = await roundedIcon(DIAL_ICON, s, r);
  await sharp(Buffer.from(svg))
    .composite([{ input: icon, left: x, top: y }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, file));
  console.log(`[done] ${file}`);
}

await benchBanner();
for (const banner of DIAL_BANNERS) await dialBanner(banner);
await zentsuBanner();
