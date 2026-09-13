import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = 'zentsu.app';
const sitemapUrl = `https://${host}/sitemap.xml`;
const indexNowEndpoint = 'https://api.indexnow.org/indexnow';
const keyFilePattern = /^[0-9a-f]{32}\.txt$/;

function readKey() {
  const keyFiles = fs.readdirSync(siteRoot).filter((name) => keyFilePattern.test(name));
  if (keyFiles.length !== 1) {
    throw new Error(`expected exactly one IndexNow key file at the site root, found ${keyFiles.length}`);
  }
  return path.basename(keyFiles[0], '.txt');
}

async function assertKeyIsLive(key) {
  const response = await fetch(`https://${host}/${key}.txt`);
  const body = response.ok ? (await response.text()).trim() : '';
  if (body !== key) {
    throw new Error(`https://${host}/${key}.txt is not serving the key yet (status ${response.status}); deploy first`);
  }
}

async function fetchSitemapUrls() {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`sitemap fetch failed: ${response.status} ${response.statusText}`);
  }
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function selectUrls(allUrls, filters) {
  if (filters.length === 0) return allUrls;
  return allUrls.filter((url) => filters.some((filter) => url.includes(filter)));
}

const key = readKey();
await assertKeyIsLive(key);

const urlList = selectUrls(await fetchSitemapUrls(), process.argv.slice(2));
if (urlList.length === 0) {
  throw new Error('no sitemap URLs matched');
}

const response = await fetch(indexNowEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
});

console.log(`Submitted ${urlList.length} URLs to IndexNow: HTTP ${response.status}`);
if (response.status !== 200 && response.status !== 202) {
  console.error(await response.text());
  process.exit(1);
}
