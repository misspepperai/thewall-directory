// SEO audit over the built HTML. Reads the files that actually ship — not the builders'
// intent — because every defect found on this site so far was a gap between the two.
//
//   node audit-seo.mjs            # human summary
//   node audit-seo.mjs --json     # machine-readable, for the report generator
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const JSON_OUT = process.argv.includes('--json');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (['.git', 'node_modules', 'og', 'art', '.secrets'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const txt = h => h.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

const files = walk(ROOT);
const pages = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const html = readFileSync(abs, 'utf8');
  const head = html.slice(0, html.search(/<\/head>/i) + 1 || html.length);
  // The body is what a crawler indexes; strip script/style so their contents never
  // masquerade as headings or link text.
  const body = html.slice(html.search(/<body/i)).replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');

  const meta = (n, attr = 'name') =>
    (head.match(new RegExp(`<meta\\s+${attr}=["']${n}["']\\s+content=["']([\\s\\S]*?)["']`, 'i')) || [, null])[1];

  const headings = [...body.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => ({ level: +m[1][1], text: txt(m[2]) }));

  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);

  pages.push({
    rel,
    url: `${SITE}/${rel === 'index.html' ? '' : rel.replace(/\/index\.html$/, '/')}`,
    title: (head.match(/<title>([\s\S]*?)<\/title>/i) || [, null])[1]?.replace(/\s+/g, ' ').trim() ?? null,
    desc: meta('description'),
    robots: meta('robots'),
    canonical: (head.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [, null])[1],
    h1s: headings.filter(h => h.level === 1).map(h => h.text),
    headings,
    ld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap(m => { try { const p = JSON.parse(m[1]); return Array.isArray(p) ? p : [p]; } catch { return ['PARSE_ERROR']; } }),
    og: { title: meta('og:title', 'property'), desc: meta('og:description', 'property'), image: meta('og:image', 'property') },
    twitter: meta('twitter:card'),
    imgs: imgs.length,
    imgsNoAlt: imgs.filter(t => !/\salt=/i.test(t)).length,
    imgsEmptyAlt: imgs.filter(t => /\salt=["']\s*["']/i.test(t)).length,
    links: [...body.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)].map(m => m[1])
  });
}

// Pages marked noindex are excluded from the ranking checks below. They cannot rank, so a
// missing canonical or a second H1 on one is not a defect — admin.html is a private console
// and partner.html is deliberately withheld from the index. They are still parsed, still
// link-checked, and still listed in the report so the exclusion is visible rather than silent.
const indexable = pages.filter(p => !/noindex/i.test(p.robots || ''));
const excluded = pages.filter(p => /noindex/i.test(p.robots || '')).map(p => p.rel);

// ---- site-wide aggregation ----
// A page that canonicals to a DIFFERENT url has already conceded the duplicate — it is telling
// search engines which version to index, which is the fix, not the defect. Counting it as a
// duplicate would mean the count never drops after the problem is solved.
const selfCanonical = p => {
  if (!p.canonical) return true;
  const want = `${SITE}/${p.rel === 'index.html' ? '' : p.rel}`;
  return p.canonical === want || p.canonical === want.replace(/\/index\.html$/, '/');
};
const dupe = key => {
  const m = new Map();
  for (const p of indexable) {
    if (!selfCanonical(p)) continue;
    const v = p[key]; if (!v) continue;
    (m.get(v) || m.set(v, []).get(v)).push(p.rel);
  }
  return [...m].filter(([, v]) => v.length > 1).sort((a, b) => b[1].length - a[1].length);
};

// A page is orphaned if no other page links to it. Resolve every internal href to a repo path.
const resolve = (fromRel, href) => {
  if (/^(https?:|mailto:|tel:|#|javascript:|data:)/i.test(href)) return null;
  let p = href.split('#')[0].split('?')[0];
  if (!p) return null;
  p = p.startsWith('/') ? p.slice(1) : join(dirname(fromRel), p).replace(/\\/g, '/');
  if (p.endsWith('/') || p === '') p += 'index.html';
  if (!/\.[a-z0-9]+$/i.test(p)) p += '.html';
  return p.replace(/^\.\//, '');
};

const known = new Set(pages.map(p => p.rel));
const inbound = new Map(pages.map(p => [p.rel, 0]));
const broken = [];
for (const p of pages) {
  for (const href of new Set(p.links)) {
    const t = resolve(p.rel, href);
    if (t === null) continue;
    if (known.has(t)) { if (t !== p.rel) inbound.set(t, inbound.get(t) + 1); }
    else if (!existsSync(join(ROOT, t))) broken.push({ from: p.rel, href, resolved: t });
  }
}

const skips = [];
for (const p of pages) {
  let prev = 0;
  for (const h of p.headings) {
    if (prev && h.level > prev + 1) skips.push({ rel: p.rel, from: prev, to: h.level, text: h.text.slice(0, 50) });
    prev = h.level;
  }
}

const report = {
  scanned: pages.length,
  indexable: indexable.length,
  canonicalizedAway: pages.filter(p => !selfCanonical(p)).map(p => ({ from: p.rel, to: p.canonical })),
  excludedNoindex: excluded,
  critical: {
    missingTitle: indexable.filter(p => !p.title).map(p => p.rel),
    missingDesc: indexable.filter(p => !p.desc).map(p => p.rel),
    missingH1: indexable.filter(p => p.h1s.length === 0).map(p => p.rel),
    multiH1: indexable.filter(p => p.h1s.length > 1).map(p => ({ rel: p.rel, n: p.h1s.length, h1s: p.h1s })),
    dupeTitles: dupe('title'),
    dupeDescs: dupe('desc'),
    brokenLinks: broken,
    ldParseErrors: pages.filter(p => p.ld.includes('PARSE_ERROR')).map(p => p.rel)
  },
  important: {
    missingCanonical: indexable.filter(p => !p.canonical).map(p => p.rel),
    noSchema: indexable.filter(p => p.ld.length === 0).map(p => p.rel),
    imgsNoAlt: pages.filter(p => p.imgsNoAlt > 0).map(p => ({ rel: p.rel, n: p.imgsNoAlt })),
    headingSkips: skips,
    orphans: [...inbound].filter(([, n]) => n === 0).map(([r]) => r),
    titleTooLong: indexable.filter(p => p.title && p.title.length > 70).map(p => ({ rel: p.rel, len: p.title.length })),
    titleTooShort: indexable.filter(p => p.title && p.title.length < 30).map(p => ({ rel: p.rel, len: p.title.length })),
    descTooLong: indexable.filter(p => p.desc && p.desc.length > 175).map(p => ({ rel: p.rel, len: p.desc.length })),
    descTooShort: indexable.filter(p => p.desc && p.desc.length < 100).map(p => ({ rel: p.rel, len: p.desc.length }))
  },
  nice: {
    missingOgImage: indexable.filter(p => !p.og.image).map(p => p.rel),
    missingOgTitle: indexable.filter(p => !p.og.title).map(p => p.rel),
    missingTwitter: indexable.filter(p => !p.twitter).map(p => p.rel),
    noindex: pages.filter(p => /noindex/i.test(p.robots || '')).map(p => p.rel)
  },
  schemaTypes: Object.entries(pages.flatMap(p => p.ld).filter(x => x && x !== 'PARSE_ERROR')
    .reduce((a, o) => { const t = o['@type']; if (t) a[t] = (a[t] || 0) + 1; return a; }, {}))
    .sort((a, b) => b[1] - a[1]),
  totals: {
    images: pages.reduce((a, p) => a + p.imgs, 0),
    internalLinks: pages.reduce((a, p) => a + p.links.length, 0),
    distinctTitles: new Set(pages.map(p => p.title)).size
  }
};

if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

const n = v => Array.isArray(v) ? v.length : v;
console.log(`scanned: ${report.scanned} pages · ${report.indexable} indexable · ${report.excludedNoindex.length} noindex (${report.excludedNoindex.join(', ') || 'none'})\n`);
console.log('CRITICAL');
for (const [k, v] of Object.entries(report.critical)) console.log(`  ${n(v) ? '🔴' : '  '} ${k.padEnd(18)} ${n(v)}`);
console.log('IMPORTANT');
for (const [k, v] of Object.entries(report.important)) console.log(`  ${n(v) ? '🟡' : '  '} ${k.padEnd(18)} ${n(v)}`);
console.log('NICE-TO-HAVE');
for (const [k, v] of Object.entries(report.nice)) console.log(`  ${n(v) ? '🟢' : '  '} ${k.padEnd(18)} ${n(v)}`);
console.log(`\nschema types: ${report.schemaTypes.map(([t, c]) => `${t} ${c}`).join(' · ')}`);
console.log(`images ${report.totals.images} · internal links ${report.totals.internalLinks} · distinct titles ${report.totals.distinctTitles}`);

// A broken internal link is the one defect here that is unambiguous, always wrong, and
// invisible in production — GitHub Pages serves a 404 and nothing reports it. It fails the
// run so it cannot accumulate. Everything else is reported for judgement, not enforced.
if (report.critical.brokenLinks.length) {
  console.log(`\nFAIL — ${report.critical.brokenLinks.length} broken internal links:`);
  for (const b of report.critical.brokenLinks.slice(0, 20)) console.log(`  ${b.from} -> ${b.href}`);
  process.exit(1);
}
