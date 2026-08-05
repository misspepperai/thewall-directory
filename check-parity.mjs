// Verify that a company rendered by the atlas (index.html, ?c=domain) and the same company
// rendered as a static page (/c/{domain}.html) are the same page.
//
// WHY: these are two renderings of one record, reached by two routes a real visitor mixes
// freely — search hits the static page, the atlas link hits the SPA. They diverged badly:
// the atlas was missing the Summary block and the entire claim CTA (the site's only
// conversion path), the static page was missing the related-vendors block, and the two
// disagreed about which six firms counted as "related" because one queried order=name.asc
// and the other order=domain.asc.
//
// Both renderings now call the same functions out of the engine block in index.html, so
// parity holds by construction. This checks that it stays true.
//
//   node check-parity.mjs                    # 30 records, spread across data completeness
//   node check-parity.mjs acme.com other.com # specific records
//   node check-parity.mjs --all              # every record (slow; ~2,286)
//   node check-parity.mjs --n 100            # sample size
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SB = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const N = args.includes('--n') ? +args[args.indexOf('--n') + 1] : 30;
const EXPLICIT = args.filter(a => a.includes('.') && !a.startsWith('--'));

// Fields whose absence changes the rendering, used to bias the sample toward sparse records —
// the conditional rows are where two templates drift apart.
const OPTIONAL = ['avg_hourly_rate', 'team_size', 'clutch_rating', 'hq_city', 'year_established', 'min_project_size'];

async function sample() {
  if (EXPLICIT.length) return EXPLICIT;
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  // PostgREST caps a response at 1,000 rows regardless of the limit asked for, so a single
  // query silently returned 1,000 of 2,286 and --all quietly checked 44% of the site while
  // reporting a clean sweep. Paginate until short.
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB}/rest/v1/directory_companies?select=domain,${OPTIONAL.join(',')}&status=eq.approved&order=domain.asc&offset=${from}&limit=1000`, { headers: h });
    const page = await r.json();
    if (!Array.isArray(page)) throw new Error(`sample query failed: ${JSON.stringify(page).slice(0, 200)}`);
    rows.push(...page);
    if (page.length < 1000) break;
  }
  if (ALL) return rows.map(x => x.domain);
  const missing = x => OPTIONAL.filter(k => !x[k]).length;
  const sorted = [...rows].sort((a, b) => missing(b) - missing(a));
  const third = Math.max(1, Math.floor(N / 3));
  const mid = Math.floor(sorted.length / 2);
  return [...new Set([
    ...sorted.slice(0, third).map(x => x.domain),                  // sparsest records
    ...sorted.slice(mid, mid + third).map(x => x.domain),          // typical
    ...sorted.slice(-third).map(x => x.domain)                     // fully populated
  ])];
}

const norm = s => (s || '').replace(/\s+/g, ' ').trim();

// Compared on both structure AND prose. Structure alone passed while the two sides were
// listing different companies as related, so the text has to be in the comparison.
function blocks(root) {
  const q = sel => !!root.querySelector(sel);
  return {
    h1: norm(root.querySelector('h1')?.textContent),
    desc: norm(root.querySelector('.d-desc, .desc')?.textContent),
    headings: [...root.querySelectorAll('h2')].map(h => norm(h.textContent)),
    quote: q('.d-quote, .quote, blockquote'),
    quoteText: norm(root.querySelector('.d-quote, .quote, blockquote')?.textContent),
    summary: q('.speak'),
    summaryText: norm(root.querySelector('.speak')?.textContent),
    about: q('.d-about, .about'),
    aboutText: norm(root.querySelector('.d-about, .about')?.textContent),
    quickFacts: q('.qf-wrap, dl.qf'),
    quickFactsText: norm(root.querySelector('.qf-wrap, dl.qf')?.textContent).replace(/^Quick facts/, ''),
    qa: root.querySelectorAll('details').length,
    qaText: [...root.querySelectorAll('details')].map(d => norm(d.textContent).replace(/^Q\.\d+/, '')),
    specRows: [...root.querySelectorAll('dl.spec dt')].map(d => norm(d.textContent)),
    specValues: [...root.querySelectorAll('dl.spec dd')].map(d => norm(d.textContent).toUpperCase()),
    claim: q('.claim'),
    claimText: norm(root.querySelector('.claim')?.textContent),
    related: root.querySelectorAll('.related-head, .grid .card, .rel-card').length > 0,
    relatedNames: [...root.querySelectorAll('.rel-nm, .grid .card .c-nm, .grid .card h3')].map(e => norm(e.textContent))
  };
}

const domains = await sample();
const vc = new VirtualConsole();
const dom = new JSDOM(readFileSync(join(ROOT, 'index.html'), 'utf8'), {
  runScripts: 'dangerously', url: 'https://hitthewall.net/', virtualConsole: vc,
  beforeParse(w) { w.fetch = (...a) => globalThis.fetch(...a); }
});
const w = dom.window;
w.eval(readFileSync(join(ROOT, 'nav.js'), 'utf8'));
// `all` is a top-level const in a classic script, so it lives in the global lexical scope
// and is NOT a property of window — w.all is always undefined. Ask the page instead.
const loaded = () => { try { return w.eval('typeof all !== "undefined" && all.length') || 0; } catch { return 0; } };
for (let i = 0; i < 60 && !loaded(); i++) await new Promise(r => setTimeout(r, 500));
if (!loaded()) { console.error('atlas failed to load — cannot compare'); process.exit(2); }
console.log(`atlas loaded: ${loaded()} records\n`);

let ok = 0, bad = 0, skipped = 0;
for (const domain of domains) {
  const file = join(ROOT, 'c', `${domain}.html`);
  if (!existsSync(file)) { console.log(`SKIP  ${domain} — no static page`); skipped++; continue; }

  await w.openDetail(domain, false);
  await new Promise(r => setTimeout(r, 250));

  const detail = w.document.getElementById('detail');
  // One JSDOM per static page, closed immediately. Left open, 2,286 of them exhaust the
  // heap and the run dies partway with a misleading null-reference error.
  const sdom = new JSDOM(readFileSync(file, 'utf8'));
  const main = sdom.window.document.querySelector('main');
  if (!detail || !main) {
    console.log(`FAIL  ${domain} — missing root (${!detail ? 'atlas #detail' : `static <main> in c/${domain}.html`})`);
    sdom.window.close();
    bad++;
    continue;
  }
  const atlas = blocks(detail);
  const stat = blocks(main);
  sdom.window.close();

  const diffs = Object.keys(atlas).filter(k => JSON.stringify(atlas[k]) !== JSON.stringify(stat[k]));
  if (diffs.length) {
    bad++;
    console.log(`FAIL  ${domain} — ${diffs.join(', ')}`);
    for (const k of diffs) {
      console.log(`        atlas : ${JSON.stringify(atlas[k]).slice(0, 160)}`);
      console.log(`        static: ${JSON.stringify(stat[k]).slice(0, 160)}`);
    }
  } else ok++;
}

console.log(`\nparity: ${ok} match · ${bad} mismatch${skipped ? ` · ${skipped} skipped` : ''} (of ${domains.length})`);
if (bad) process.exit(1);
