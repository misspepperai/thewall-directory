// Inject Open Graph / Twitter card meta into every HTML file on the site.
//
// Run AFTER any build-*.mjs run and after build-og.mjs. Idempotent: re-running replaces the
// managed block rather than stacking duplicates, so it is safe to run on every deploy.
//
// This is a post-processor rather than 12 edits across 12 builders on purpose — the builders
// name their title/description variables differently, and seven pages have no builder at all.
// One pass over the rendered HTML covers all 2,590 URLs with one code path.
//
//   node inject-og.mjs          # write
//   node inject-og.mjs --check  # report only, exit 1 if any page is missing a card
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const CHECK = process.argv.includes('--check');

const BEGIN = '<!-- og:begin (managed by inject-og.mjs) -->';
const END = '<!-- og:end -->';
// The markers contain regex metacharacters — "(", ")" and "." — so they must be escaped
// before use in a pattern. Unescaped, the strip silently matched nothing and every run
// stacked another copy of the block onto every page.
const rx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BLOCK_RE = new RegExp(`\\n?${rx(BEGIN)}[\\s\\S]*?${rx(END)}`, 'g');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '.git' || e === 'node_modules' || e === 'og' || e === '.secrets') continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

// Which card fronts which section. Order matters — first match wins.
const ROUTES = [
  [/^c\//, f => `og/c/${f.slice(2).replace(/\.html$/, '')}.png`],
  [/^index\.html$/, () => 'og/home.png'],
  [/^data\//, () => 'og/data.png'],
  [/^pillars\//, () => 'og/pillars.png'],
  [/^states\//, () => 'og/states.png'],
  [/^cities\//, () => 'og/cities.png'],
  [/^news\//, () => 'og/news.png'],
  [/^questions\//, () => 'og/questions.png'],
  [/^compare\//, () => 'og/compare.png'],
  [/^hubs\//, () => 'og/hubs.png'],
  [/^entities\//, () => 'og/entities.png'],
  [/^find\//, () => 'og/find.png'],
  [/^tools\//, () => 'og/tools.png'],
  [/^wins\//, () => 'og/wins.png'],
  [/^badge\//, () => 'og/badge.png'],
  [/^report\//, () => 'og/report.png'],
  [/^glossary\.html$/, () => 'og/glossary.png'],
  [/^partner\.html$/, () => 'og/partner.png'],
  [/^press\.html$/, () => 'og/press.png'],
  [/^(about|editorial-policy|ai-policy|disclosures|privacy|terms|accessibility|contact)\.html$/, () => 'og/about.png']
];

function cardFor(rel) {
  for (const [re, fn] of ROUTES) {
    if (re.test(rel)) {
      const card = fn(rel);
      // A per-vendor card that failed to render must fall back, never 404 into a dead unfurl.
      if (existsSync(join(ROOT, card))) return card;
      return 'og/default.png';
    }
  }
  return 'og/default.png';
}

const attr = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const files = walk(ROOT);
let written = 0, skipped = 0, fallback = 0;
const missing = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  let html = readFileSync(abs, 'utf8');

  // Strip any previously managed block so this stays idempotent.
  html = html.replace(BLOCK_RE, '');

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]
    .replace(/\s+/g, ' ').trim();
  const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i) || [, ''])[1]
    .replace(/\s+/g, ' ').trim();
  const canonical = (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [, ''])[1]
    || `${SITE}/${rel === 'index.html' ? '' : rel}`;

  // Titles already end in "| The Wall"; repeating the brand in alt text read as
  // "… | The Wall — The Wall, the independent index of…".
  const bare = title.replace(/\s*[|\u2014-]\s*The Wall\s*$/i, '').trim() || title;

  const card = cardFor(rel);
  if (card === 'og/default.png' && !/^(index\.html)$/.test(rel)) fallback++;
  if (!title) missing.push(`${rel} (no <title>)`);

  const block = [
    BEGIN,
    `<meta property="og:site_name" content="The Wall">`,
    `<meta property="og:type" content="${rel === 'index.html' ? 'website' : 'article'}">`,
    `<meta property="og:title" content="${attr(title)}">`,
    desc ? `<meta property="og:description" content="${attr(desc)}">` : '',
    `<meta property="og:url" content="${attr(canonical)}">`,
    `<meta property="og:image" content="${SITE}/${card}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${attr(bare)} — share card from The Wall, the independent index of US growth-services vendors">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${attr(title)}">`,
    desc ? `<meta name="twitter:description" content="${attr(desc)}">` : '',
    `<meta name="twitter:image" content="${SITE}/${card}">`,
    END
  ].filter(Boolean).join('\n');

  // Anchor to canonical when present, otherwise to </title>, otherwise <head>.
  let next;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    next = html.replace(/(<link\s+rel=["']canonical["'][^>]*>)/i, `$1\n${block}`);
  } else if (/<\/title>/i.test(html)) {
    next = html.replace(/(<\/title>)/i, `$1\n${block}`);
  } else if (/<head[^>]*>/i.test(html)) {
    next = html.replace(/(<head[^>]*>)/i, `$1\n${block}`);
  } else {
    missing.push(`${rel} (no <head>)`);
    skipped++;
    continue;
  }

  if (!CHECK && next !== readFileSync(abs, 'utf8')) writeFileSync(abs, next);
  written++;
}

console.log(`html files      : ${files.length}`);
console.log(`og block written: ${written}`);
console.log(`skipped         : ${skipped}`);
console.log(`on fallback card: ${fallback}`);
if (missing.length) {
  console.log(`\nissues (${missing.length}):`);
  for (const m of missing.slice(0, 20)) console.log('  ' + m);
}
if (CHECK && (skipped || missing.length)) process.exit(1);
