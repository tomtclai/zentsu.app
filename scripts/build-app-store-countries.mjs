#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { pagesForLocales, REGION_ORDER } = require('../app-store-locales.js');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const RAW = [
  ['dz', 'DZA', 'africa_me_india', 'Algeria', ['en-GB', 'ar-SA', 'fr-FR']],
  ['ao', 'AGO', 'africa_me_india', 'Angola', ['en-GB']],
  ['bh', 'BHR', 'africa_me_india', 'Bahrain', ['en-GB', 'ar-SA']],
  ['bj', 'BEN', 'africa_me_india', 'Benin', ['en-GB', 'fr-FR']],
  ['bw', 'BWA', 'africa_me_india', 'Botswana', ['en-GB']],
  ['bf', 'BFA', 'africa_me_india', 'Burkina Faso', ['en-GB', 'fr-FR']],
  ['cm', 'CMR', 'africa_me_india', 'Cameroon', ['fr-FR', 'en-GB']],
  ['cv', 'CPV', 'africa_me_india', 'Cape Verde', ['en-GB']],
  ['td', 'TCD', 'africa_me_india', 'Chad', ['en-GB', 'fr-FR']],
  ['cd', 'COD', 'africa_me_india', 'Congo, Democratic Republic of the', ['en-GB', 'fr-FR']],
  ['cg', 'COG', 'africa_me_india', 'Congo, Republic of the', ['en-GB', 'fr-FR']],
  ['ci', 'CIV', 'africa_me_india', "Cote d'Ivoire", ['fr-FR', 'en-GB']],
  ['eg', 'EGY', 'africa_me_india', 'مصر', ['en-GB', 'ar-SA', 'fr-FR']],
  ['sz', 'SWZ', 'africa_me_india', 'Eswatini', ['en-GB']],
  ['ga', 'GAB', 'africa_me_india', 'Gabon', ['fr-FR', 'en-GB']],
  ['gm', 'GMB', 'africa_me_india', 'Gambia', ['en-GB']],
  ['gh', 'GHA', 'africa_me_india', 'Ghana', ['en-GB']],
  ['gw', 'GNB', 'africa_me_india', 'Guinea-Bissau', ['en-GB', 'fr-FR']],
  ['in', 'IND', 'africa_me_india', 'India', ['en-GB', 'hi', 'bn-BD', 'gu-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'or-IN', 'pa-IN', 'ta-IN', 'te-IN', 'ur-PK']],
  ['iq', 'IRQ', 'africa_me_india', 'Iraq', ['en-GB', 'ar-SA']],
  ['il', 'ISR', 'africa_me_india', 'ישראל', ['en-GB', 'he']],
  ['jo', 'JOR', 'africa_me_india', 'Jordan', ['en-GB', 'ar-SA']],
  ['ke', 'KEN', 'africa_me_india', 'Kenya', ['en-GB']],
  ['kw', 'KWT', 'africa_me_india', 'Kuwait', ['en-GB', 'ar-SA']],
  ['lb', 'LBN', 'africa_me_india', 'Lebanon', ['en-GB', 'ar-SA', 'fr-FR']],
  ['lr', 'LBR', 'africa_me_india', 'Liberia', ['en-GB']],
  ['ly', 'LBY', 'africa_me_india', 'Libya', ['en-GB', 'ar-SA']],
  ['mg', 'MDG', 'africa_me_india', 'Madagascar', ['en-GB', 'fr-FR']],
  ['mw', 'MWI', 'africa_me_india', 'Malawi', ['en-GB']],
  ['ml', 'MLI', 'africa_me_india', 'Mali', ['en-GB', 'fr-FR']],
  ['mr', 'MRT', 'africa_me_india', 'Mauritania', ['en-GB', 'ar-SA', 'fr-FR']],
  ['mu', 'MUS', 'africa_me_india', 'Mauritius', ['en-GB', 'fr-FR']],
  ['ma', 'MAR', 'africa_me_india', 'Morocco', ['en-GB', 'ar-SA', 'fr-FR']],
  ['mz', 'MOZ', 'africa_me_india', 'Mozambique', ['en-GB']],
  ['na', 'NAM', 'africa_me_india', 'Namibia', ['en-GB']],
  ['ne', 'NER', 'africa_me_india', 'Niger', ['en-GB', 'fr-FR']],
  ['ng', 'NGA', 'africa_me_india', 'Nigeria', ['en-GB']],
  ['om', 'OMN', 'africa_me_india', 'Oman', ['en-GB', 'ar-SA']],
  ['pk', 'PAK', 'africa_me_india', 'Pakistan', ['en-GB', 'ur-PK']],
  ['qa', 'QAT', 'africa_me_india', 'Qatar', ['en-GB', 'ar-SA']],
  ['rw', 'RWA', 'africa_me_india', 'Rwanda', ['en-GB', 'fr-FR']],
  ['st', 'STP', 'africa_me_india', 'Sao Tome and Principe', ['en-GB']],
  ['sa', 'SAU', 'africa_me_india', 'المملكة العربية السعودية', ['en-GB', 'ar-SA']],
  ['sn', 'SEN', 'africa_me_india', 'Senegal', ['en-GB', 'fr-FR']],
  ['sc', 'SYC', 'africa_me_india', 'Seychelles', ['en-GB', 'fr-FR']],
  ['sl', 'SLE', 'africa_me_india', 'Sierra Leone', ['en-GB']],
  ['za', 'ZAF', 'africa_me_india', 'South Africa', ['en-GB']],
  ['tz', 'TZA', 'africa_me_india', 'Tanzania', ['en-GB']],
  ['tn', 'TUN', 'africa_me_india', 'Tunisia', ['en-GB', 'ar-SA', 'fr-FR']],
  ['ug', 'UGA', 'africa_me_india', 'Uganda', ['en-GB']],
  ['ae', 'ARE', 'africa_me_india', 'الإمارات العربية المتحدة', ['en-GB', 'ar-SA']],
  ['ye', 'YEM', 'africa_me_india', 'Yemen', ['en-GB', 'ar-SA']],
  ['zm', 'ZMB', 'africa_me_india', 'Zambia', ['en-GB']],
  ['zw', 'ZWE', 'africa_me_india', 'Zimbabwe', ['en-GB']],

  ['af', 'AFG', 'asia_pacific', 'Afghanistan', ['en-GB']],
  ['au', 'AUS', 'asia_pacific', 'Australia', ['en-AU', 'en-GB']],
  ['bt', 'BTN', 'asia_pacific', 'Bhutan', ['en-GB']],
  ['bn', 'BRN', 'asia_pacific', 'Brunei', ['en-GB']],
  ['kh', 'KHM', 'asia_pacific', 'Cambodia', ['en-GB', 'fr-FR']],
  ['cn', 'CHN', 'asia_pacific', '中国大陆', ['zh-Hans', 'en-GB']],
  ['fj', 'FJI', 'asia_pacific', 'Fiji', ['en-GB']],
  ['hk', 'HKG', 'asia_pacific', '香港', ['zh-Hant', 'en-GB']],
  ['id', 'IDN', 'asia_pacific', 'Indonesia', ['en-GB', 'id']],
  ['jp', 'JPN', 'asia_pacific', '日本', ['ja', 'en-US']],
  ['la', 'LAO', 'asia_pacific', 'Laos', ['en-GB', 'fr-FR']],
  ['mo', 'MAC', 'asia_pacific', '澳門', ['zh-Hant', 'en-GB']],
  ['my', 'MYS', 'asia_pacific', 'Malaysia', ['en-GB', 'ms']],
  ['mv', 'MDV', 'asia_pacific', 'Maldives', ['en-GB']],
  ['fm', 'FSM', 'asia_pacific', 'Micronesia', ['en-GB']],
  ['mn', 'MNG', 'asia_pacific', 'Mongolia', ['en-GB']],
  ['mm', 'MMR', 'asia_pacific', 'Myanmar', ['en-GB']],
  ['nr', 'NRU', 'asia_pacific', 'Nauru', ['en-GB']],
  ['np', 'NPL', 'asia_pacific', 'Nepal', ['en-GB']],
  ['nz', 'NZL', 'asia_pacific', 'New Zealand', ['en-AU', 'en-GB']],
  ['pw', 'PLW', 'asia_pacific', 'Palau', ['en-GB']],
  ['pg', 'PNG', 'asia_pacific', 'Papua New Guinea', ['en-GB']],
  ['ph', 'PHL', 'asia_pacific', 'Philippines', ['en-GB']],
  ['kr', 'KOR', 'asia_pacific', '대한민국', ['ko', 'en-GB']],
  ['sg', 'SGP', 'asia_pacific', 'Singapore', ['en-GB', 'zh-Hans']],
  ['sb', 'SLB', 'asia_pacific', 'Solomon Islands', ['en-GB']],
  ['lk', 'LKA', 'asia_pacific', 'Sri Lanka', ['en-GB']],
  ['tw', 'TWN', 'asia_pacific', '台灣', ['zh-Hant', 'en-GB']],
  ['th', 'THA', 'asia_pacific', 'ประเทศไทย', ['en-GB', 'th']],
  ['to', 'TON', 'asia_pacific', 'Tonga', ['en-GB']],
  ['vu', 'VUT', 'asia_pacific', 'Vanuatu', ['en-GB', 'fr-FR']],
  ['vn', 'VNM', 'asia_pacific', 'Việt Nam', ['en-GB', 'vi']],

  ['al', 'ALB', 'europe', 'Albania', ['en-GB']],
  ['am', 'ARM', 'europe', 'Armenia', ['en-GB']],
  ['at', 'AUT', 'europe', 'Österreich', ['de-DE', 'en-GB']],
  ['az', 'AZE', 'europe', 'Azerbaijan', ['en-GB']],
  ['by', 'BLR', 'europe', 'Belarus', ['en-GB']],
  ['be', 'BEL', 'europe', 'Belgium', ['en-GB', 'nl-NL', 'fr-FR']],
  ['ba', 'BIH', 'europe', 'Bosnia and Herzegovina', ['en-GB', 'hr']],
  ['bg', 'BGR', 'europe', 'Bulgaria', ['en-GB']],
  ['hr', 'HRV', 'europe', 'Hrvatska', ['en-GB', 'hr']],
  ['cy', 'CYP', 'europe', 'Cyprus', ['en-GB', 'el', 'tr']],
  ['cz', 'CZE', 'europe', 'Česko', ['en-GB', 'cs']],
  ['dk', 'DNK', 'europe', 'Danmark', ['en-GB', 'da']],
  ['ee', 'EST', 'europe', 'Estonia', ['en-GB']],
  ['fi', 'FIN', 'europe', 'Suomi', ['en-GB', 'fi']],
  ['fr', 'FRA', 'europe', 'France', ['fr-FR', 'en-GB']],
  ['ge', 'GEO', 'europe', 'Georgia', ['en-GB']],
  ['de', 'DEU', 'europe', 'Deutschland', ['de-DE', 'en-GB']],
  ['gr', 'GRC', 'europe', 'Ελλάδα', ['en-GB', 'el']],
  ['hu', 'HUN', 'europe', 'Magyarország', ['en-GB', 'hu']],
  ['is', 'ISL', 'europe', 'Iceland', ['en-GB']],
  ['ie', 'IRL', 'europe', 'Ireland', ['en-GB']],
  ['it', 'ITA', 'europe', 'Italia', ['it', 'en-GB']],
  ['kz', 'KAZ', 'europe', 'Kazakhstan', ['en-GB']],
  ['xk', 'XKS', 'europe', 'Kosovo', ['en-GB']],
  ['kg', 'KGZ', 'europe', 'Kyrgyzstan', ['en-GB']],
  ['lv', 'LVA', 'europe', 'Latvia', ['en-GB']],
  ['lt', 'LTU', 'europe', 'Lithuania', ['en-GB']],
  ['lu', 'LUX', 'europe', 'Luxembourg', ['en-GB', 'fr-FR', 'de-DE']],
  ['mt', 'MLT', 'europe', 'Malta', ['en-GB']],
  ['md', 'MDA', 'europe', 'Moldova', ['en-GB']],
  ['me', 'MNE', 'europe', 'Montenegro', ['en-GB', 'hr']],
  ['nl', 'NLD', 'europe', 'Nederland', ['nl-NL', 'en-GB']],
  ['mk', 'MKD', 'europe', 'North Macedonia', ['en-GB']],
  ['no', 'NOR', 'europe', 'Norge', ['en-GB', 'no']],
  ['pl', 'POL', 'europe', 'Polska', ['en-GB', 'pl']],
  ['pt', 'PRT', 'europe', 'Portugal', ['pt-PT', 'en-GB']],
  ['ro', 'ROU', 'europe', 'România', ['en-GB', 'ro']],
  ['ru', 'RUS', 'europe', 'Россия', ['ru', 'en-GB', 'uk']],
  ['rs', 'SRB', 'europe', 'Serbia', ['en-GB', 'hr']],
  ['sk', 'SVK', 'europe', 'Slovensko', ['en-GB', 'sk']],
  ['si', 'SVN', 'europe', 'Slovenia', ['en-GB', 'sl-SI']],
  ['es', 'ESP', 'europe', 'España', ['es-ES', 'ca', 'en-GB']],
  ['se', 'SWE', 'europe', 'Sverige', ['sv', 'en-GB']],
  ['ch', 'CHE', 'europe', 'Schweiz', ['de-DE', 'en-GB', 'fr-FR', 'it']],
  ['tj', 'TJK', 'europe', 'Tajikistan', ['en-GB']],
  ['tm', 'TKM', 'europe', 'Turkmenistan', ['en-GB']],
  ['tr', 'TUR', 'europe', 'Türkiye', ['en-GB', 'tr']],
  ['ua', 'UKR', 'europe', 'Україна', ['en-GB', 'uk', 'ru']],
  ['gb', 'GBR', 'europe', 'United Kingdom', ['en-GB']],
  ['uz', 'UZB', 'europe', 'Uzbekistan', ['en-GB']],

  ['ai', 'AIA', 'latin_america', 'Anguilla', ['en-GB']],
  ['ag', 'ATG', 'latin_america', 'Antigua and Barbuda', ['en-GB']],
  ['ar', 'ARG', 'latin_america', 'Argentina', ['es-MX', 'en-GB']],
  ['bs', 'BHS', 'latin_america', 'Bahamas', ['en-GB']],
  ['bb', 'BRB', 'latin_america', 'Barbados', ['en-GB']],
  ['bz', 'BLZ', 'latin_america', 'Belize', ['en-GB', 'es-MX']],
  ['bm', 'BMU', 'latin_america', 'Bermuda', ['en-GB']],
  ['bo', 'BOL', 'latin_america', 'Bolivia', ['es-MX', 'en-GB']],
  ['br', 'BRA', 'latin_america', 'Brasil', ['pt-BR', 'en-GB']],
  ['vg', 'VGB', 'latin_america', 'British Virgin Islands', ['en-GB']],
  ['ky', 'CYM', 'latin_america', 'Cayman Islands', ['en-GB']],
  ['cl', 'CHL', 'latin_america', 'Chile', ['es-MX', 'en-GB']],
  ['co', 'COL', 'latin_america', 'Colombia', ['es-MX', 'en-GB']],
  ['cr', 'CRI', 'latin_america', 'Costa Rica', ['es-MX', 'en-GB']],
  ['dm', 'DMA', 'latin_america', 'Dominica', ['en-GB']],
  ['do', 'DOM', 'latin_america', 'Dominican Republic', ['es-MX', 'en-GB']],
  ['ec', 'ECU', 'latin_america', 'Ecuador', ['es-MX', 'en-GB']],
  ['sv', 'SLV', 'latin_america', 'El Salvador', ['es-MX', 'en-GB']],
  ['gd', 'GRD', 'latin_america', 'Grenada', ['en-GB']],
  ['gt', 'GTM', 'latin_america', 'Guatemala', ['es-MX', 'en-GB']],
  ['gy', 'GUY', 'latin_america', 'Guyana', ['en-GB', 'fr-FR']],
  ['hn', 'HND', 'latin_america', 'Honduras', ['es-MX', 'en-GB']],
  ['jm', 'JAM', 'latin_america', 'Jamaica', ['en-GB']],
  ['mx', 'MEX', 'latin_america', 'México', ['es-MX', 'en-GB']],
  ['ms', 'MSR', 'latin_america', 'Montserrat', ['en-GB']],
  ['ni', 'NIC', 'latin_america', 'Nicaragua', ['es-MX', 'en-GB']],
  ['pa', 'PAN', 'latin_america', 'Panama', ['es-MX', 'en-GB']],
  ['py', 'PRY', 'latin_america', 'Paraguay', ['es-MX', 'en-GB']],
  ['pe', 'PER', 'latin_america', 'Peru', ['es-MX', 'en-GB']],
  ['kn', 'KNA', 'latin_america', 'St. Kitts and Nevis', ['en-GB']],
  ['lc', 'LCA', 'latin_america', 'St. Lucia', ['en-GB']],
  ['vc', 'VCT', 'latin_america', 'St. Vincent and the Grenadines', ['en-GB']],
  ['sr', 'SUR', 'latin_america', 'Suriname', ['en-GB', 'nl-NL']],
  ['tt', 'TTO', 'latin_america', 'Trinidad and Tobago', ['en-GB', 'fr-FR']],
  ['tc', 'TCA', 'latin_america', 'Turks and Caicos Islands', ['en-GB']],
  ['uy', 'URY', 'latin_america', 'Uruguay', ['en-GB', 'es-MX']],
  ['ve', 'VEN', 'latin_america', 'Venezuela', ['es-MX', 'en-GB']],

  ['ca', 'CAN', 'us_canada', 'Canada', ['en-CA', 'fr-CA']],
  ['us', 'USA', 'us_canada', 'United States', ['en-US', 'es-MX', 'ar-SA', 'zh-Hans', 'zh-Hant', 'fr-FR', 'ko', 'pt-BR', 'ru', 'vi']],
];

function yamlScalar(value) {
  if (value === 'no' || value === 'on' || value === 'off' || value === 'yes') {
    return JSON.stringify(value);
  }
  if (/[:#{}[\],&*?|<>=!%@`']/.test(value) || /[\u0600-\u06FF\u0590-\u05FF]/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

function emit() {
  const countries = RAW.map(([id, territory, region, name, locales]) => ({
    id,
    territory,
    region,
    name,
    locales,
    pages: pagesForLocales(locales),
  }));

  if (countries.length !== 175) {
    throw new Error(`expected 175 countries, got ${countries.length}`);
  }

  const ids = new Set();
  const territories = new Set();
  for (const country of countries) {
    if (ids.has(country.id)) throw new Error(`duplicate id ${country.id}`);
    if (territories.has(country.territory)) throw new Error(`duplicate territory ${country.territory}`);
    ids.add(country.id);
    territories.add(country.territory);
    if (country.pages.length === 0) throw new Error(`${country.id} has no Dial pages`);
    if (!REGION_ORDER.includes(country.region)) throw new Error(`${country.id} has unknown region`);
  }

  const canada = countries.find((country) => country.id === 'ca');
  if (!canada || canada.territory !== 'CAN' || canada.pages.join() !== 'en,fr') {
    throw new Error('Canada must be id=ca with pages en,fr (Catalan stays /ca/)');
  }

  const byRegion = Object.fromEntries(REGION_ORDER.map((region) => [region, []]));
  for (const country of countries) {
    byRegion[country.region].push(country);
  }
  for (const region of REGION_ORDER) {
    byRegion[region].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }
  const ordered = REGION_ORDER.flatMap((region) => byRegion[region]);

  const lines = [
    '# App Store countries for the Dial country/region picker.',
    '# 175 storefronts. Locales follow Apple\'s App Store localizations table.',
    '# pages are those locales mapped onto existing Dial marketing pages.',
    '# Canada is id `ca`; the /ca/ URL remains Catalan, never Canada.',
    '# Generated by scripts/build-app-store-countries.mjs. Edit that file, then re-run.',
    '',
  ];

  for (const country of ordered) {
    lines.push(`- id: ${yamlScalar(country.id)}`);
    lines.push(`  territory: ${country.territory}`);
    lines.push(`  region: ${country.region}`);
    lines.push(`  name: ${yamlScalar(country.name)}`);
    lines.push('  locales:');
    for (const locale of country.locales) {
      lines.push(`    - ${yamlScalar(locale)}`);
    }
    lines.push('  pages:');
    for (const page of country.pages) {
      lines.push(`    - ${yamlScalar(page)}`);
    }
    lines.push('');
  }

  const out = join(root, '_data/app_store_countries.yml');
  writeFileSync(out, lines.join('\n'));
  console.log(`wrote ${out} (${ordered.length} countries)`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  emit();
}

export { RAW };
