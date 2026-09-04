import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'assets', 'dial-qr.svg');
const url =
  'https://apps.apple.com/app/id6789408903?pt=117700894&ct=site-dial-qr&mt=8';

const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: {
    dark: '#0b1423',
    light: '#0000',
  },
});

fs.writeFileSync(outPath, svg);
