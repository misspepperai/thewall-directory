// Push every sitemap URL to IndexNow — instant crawl notification for Bing,
// Yandex, Seznam and Naver. (Google does NOT participate in IndexNow; Google
// discovery still depends on the GSC sitemap plus real backlinks.)
//
// Usage:
//   node submit-indexnow.mjs           # submit everything in sitemap.xml
//   node submit-indexnow.mjs --dry     # show what would be sent
//   node submit-indexnow.mjs --since 2026-08-04   # only URLs with lastmod >= date
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const HOST = 'hitthewall.net';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10000;              // IndexNow hard cap per request

// The key file must be served at the site root and contain exactly the key.
const keyFile = readdirSync(ROOT).find(f => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) { console.error('No IndexNow key file (<32-hex>.txt) at repo root.'); process.exit(1); }
const KEY = keyFile.replace('.txt', '');
const onDisk = readFileSync(join(ROOT, keyFile), 'utf8').trim();
if (onDisk !== KEY) { console.error(`Key file contents (${onDisk}) != filename (${KEY}).`); process.exit(1); }

const dry = process.argv.includes('--dry');
const sinceIdx = process.argv.indexOf('--since');
const since = sinceIdx > -1 ? process.argv[sinceIdx + 1] : null;

const xml = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => {
  const loc = (m[1].match(/<loc>(.*?)<\/loc>/) || [])[1];
  const lastmod = (m[1].match(/<lastmod>(.*?)<\/lastmod>/) || [])[1];
  return { loc, lastmod };
}).filter(e => e.loc);

let urls = entries.map(e => e.loc);
if (since) {
  urls = entries.filter(e => e.lastmod && e.lastmod >= since).map(e => e.loc);
  console.log(`filtered to lastmod >= ${since}`);
}

// Guard: IndexNow rejects the whole batch if any URL is off-host.
const offHost = urls.filter(u => !u.startsWith(`https://${HOST}/`));
if (offHost.length) { console.error(`${offHost.length} off-host URLs, e.g. ${offHost[0]}`); process.exit(1); }

console.log(`key       ${KEY}`);
console.log(`keyfile   https://${HOST}/${keyFile}`);
console.log(`urls      ${urls.length}`);

if (dry) {
  console.log('\n--dry, not submitting. First 5:');
  urls.slice(0, 5).forEach(u => console.log('  ' + u));
  process.exit(0);
}

// Verify the key file is actually reachable before submitting — IndexNow rejects
// the whole submission if it can't fetch it, and the error it returns is vague.
const check = await fetch(`https://${HOST}/${keyFile}`);
const body = (await check.text()).trim();
if (!check.ok || body !== KEY) {
  console.error(`\nKey file not serving correctly (HTTP ${check.status}, body "${body.slice(0, 40)}").`);
  console.error('Wait for the GitHub Pages deploy to finish, then re-run.');
  process.exit(1);
}
console.log('keyfile   verified reachable\n');

let sent = 0;
for (let i = 0; i < urls.length; i += BATCH) {
  const slice = urls.slice(i, i + BATCH);
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${keyFile}`, urlList: slice }),
  });
  const txt = await r.text();
  // 200 = accepted, 202 = accepted pending key validation. Both are success.
  console.log(`batch ${i / BATCH + 1}: ${slice.length} urls -> HTTP ${r.status} ${txt.slice(0, 120)}`);
  if (r.status === 200 || r.status === 202) sent += slice.length;
}
console.log(`\n${sent}/${urls.length} URLs accepted by IndexNow.`);
console.log('Bing/Yandex crawl on their own schedule — expect movement within days, not minutes.');
