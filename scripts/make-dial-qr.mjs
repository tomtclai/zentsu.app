import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'assets', 'dial-qr.svg');
const campaignYaml = fs.readFileSync(path.join(root, '_data', 'dial_campaign.yml'), 'utf8');
const yamlValue = (key) => campaignYaml.match(new RegExp(`^\\s*${key}:\\s*"?([^"\\n]+)"?`, 'm'))[1];
const url = `https://apps.apple.com/app/id6789408903?pt=${yamlValue('provider_token')}&ct=${yamlValue('landing')}&mt=${yamlValue('media_type')}`;

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
