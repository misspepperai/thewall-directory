// Structural cannibalization screen over the built HTML.
//
// IMPORTANT FRAMING: this predicts competition from page structure. It cannot observe it.
// The site has no ranking history, so nothing here is evidence that two URLs are actually
// trading places for a query — that is post-launch monitoring against real search data.
// What this does is verify the architecture held: each tier is supposed to own a distinct
// slice of intent, and this checks that two pages on the same tier have not drifted onto the
// same job.
//
// All pairs are screened in code. The model only ever looks at the shortlist this produces.
//
//   node audit-cannibal.mjs
//   node audit-cannibal.mjs --json
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
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

// Each tier owns a different slice of intent by design: pillars take broad commercial queries,
// hubs take mid-tail informational, questions take long-tail specifics, listings take brand
// navigational. Vocabulary overlap ACROSS tiers is expected and healthy — a pillar should
// share words with its spokes. Only unusually high cross-tier overlap is worth surfacing.
const tierOf = rel =>
  rel.startsWith('c/') ? 'listing' :
  rel.startsWith('pillars/') ? 'pillar' :
  rel.startsWith('hubs/') ? 'hub' :
  rel.startsWith('questions/') ? 'question' :
  rel.startsWith('compare/') ? 'compare' :
  rel.startsWith('entities/') ? 'entity' :
  rel.startsWith('states/') ? 'state' :
  rel.startsWith('cities/') ? 'city' :
  rel.startsWith('find/') ? 'find' :
  rel.startsWith('news/') ? 'news' : 'core';

const STOP = new Set(('the a an of for in on at to and or vs with by from best top near your our '
  + 'what how why when where which who is are do does can should you it this that these those '
  + 'wall thewall guide 2026 us usa list agency agencies company companies firm firms').split(' '));

// Numerals are kept regardless of length, and digit runs are NOT split apart: "5-5-5 rule"
// and "50-30-20 rule" are different questions, but a >2-character filter erased both numbers
// and left each as the single token "rule", scoring them a perfect title match.
const tok = s => [...new Set(String(s).toLowerCase()
  .replace(/&[a-z]+;|&#\d+;/g, ' ')
  .replace(/(\d)[-\/.](?=\d)/g, '$1_')      // keep 5-5-5 and 80/20 as single tokens
  .replace(/[^a-z0-9_ ]+/g, ' ').split(/\s+/)
  .filter(w => w && !STOP.has(w) && (w.length > 2 || /\d/.test(w))))];

const pages = [];
for (const abs of walk(ROOT)) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const html = readFileSync(abs, 'utf8');
  if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) continue;
  const body = html.slice(html.search(/<body/i)).replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1].replace(/\s+/g, ' ').trim();
  const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i) || [, ''])[1];
  const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  pages.push({ rel, tier: tierOf(rel), title, h1, desc,
    tTok: tok(title), aTok: tok(`${title} ${h1} ${desc}`) });
}

const jac = (a, b) => {
  if (!a.length || !b.length) return 0;
  const A = new Set(a); let inter = 0;
  for (const w of b) if (A.has(w)) inter++;
  return inter / (A.size + b.length - inter);
};

// Screening every pair on this site is 3.3M comparisons. An inverted index cuts it to only
// the pairs that share at least one meaningful token, which is the only way a pair can clear
// any threshold — the rest are provably zero and never need comparing.
const byTok = new Map();
pages.forEach((p, i) => { for (const w of p.aTok) (byTok.get(w) || byTok.set(w, []).get(w)).push(i); });

const seen = new Set();
const flagged = [];
let compared = 0;

// LISTINGS ARE NOT SCREENED LEXICALLY, AND THAT IS DELIBERATE.
//
// A listing's primary keyword is the vendor's own brand name — the query is navigational
// ("orbit media"), and every listing owns a different brand. Their titles all share the same
// two-part shape, "{Name} — {Subcategory} | The Wall", so a token screen flags every pair of
// web-design agencies in the country: 47,338 pairs on the first run, none of them real.
// Reporting those would bury the handful of findings that matter.
//
// The genuine cannibalization risk in this tier is a DUPLICATE COMPANY — one firm listed
// twice under two domains, where both pages do target the same brand query. That is checked
// directly below, on identity rather than vocabulary.
const listings = pages.filter(p => p.tier === 'listing');
const normName = t => String(t).split('—')[0].toLowerCase()
  .replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/\b(inc|llc|ltd|co|corp|group|agency|studio|media|the)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, '');
// The 4-character floor exists so generic stubs do not group, but it also silently dropped
// "QCK" — a real duplicate pair with byte-identical titles. An exact title match is grouped
// regardless of length; only the fuzzy normalised match needs the floor.
const byName = new Map();
for (const p of listings) {
  const k = normName(p.title);
  const key = k.length >= 4 ? k : (p.title ? `exact:${p.title}` : null);
  if (!key) continue;
  (byName.get(key) || byName.set(key, []).get(key)).push(p);
}
for (const [, group] of byName) {
  if (group.length < 2) continue;
  for (let a = 0; a < group.length; a++) for (let b = a + 1; b < group.length; b++) {
    const p = group[a], q = group[b];
    flagged.push({ severity: 'HIGH', a: p.rel, b: q.rel, tierA: 'listing', tierB: 'listing',
      sameTier: true, reason: 'same company listed under two domains',
      titleJaccard: +jac(p.tTok, q.tTok).toFixed(2), allJaccard: +jac(p.aTok, q.aTok).toFixed(2),
      dupTitle: p.title === q.title, dupDesc: !!p.desc && p.desc === q.desc,
      titleA: p.title, titleB: q.title });
  }
}

// GRID TIERS (find / state / city) ARE SCREENED ON THEIR KEYWORD, NOT THEIR VOCABULARY.
//
// These are programmatic category x geography pages: "content marketing agencies california",
// "creative agencies california". A shared template IS the design, so whole-string overlap
// flags nearly every pair — 3,217 of the 3,486 possible find/ pairs on the previous run.
// What actually competes is two URLs resolving to the SAME category and the SAME geography,
// including token reorderings ("roof repair tampa" vs "tampa roof repair"). The slug carries
// that keyword exactly, so it is compared directly and the prose is left out of it.
const GRID = new Set(['find', 'state', 'city']);
const slugKey = rel => rel.replace(/^.*\//, '').replace(/\.html$/, '')
  .split('-').filter(w => w && !['agencies', 'agency', 'firms', 'companies', 'in', 'the'].includes(w))
  .sort().join('-');
const byGrid = new Map();
for (const p of pages) {
  if (!GRID.has(p.tier)) continue;
  const k = `${p.tier}|${slugKey(p.rel)}`;
  (byGrid.get(k) || byGrid.set(k, []).get(k)).push(p);
}
for (const [, group] of byGrid) {
  if (group.length < 2) continue;
  for (let a = 0; a < group.length; a++) for (let b = a + 1; b < group.length; b++) {
    const p = group[a], q = group[b];
    flagged.push({ severity: 'HIGH', a: p.rel, b: q.rel, tierA: p.tier, tierB: q.tier, sameTier: true,
      reason: 'same category and geography, different URL',
      titleJaccard: +jac(p.tTok, q.tTok).toFixed(2), allJaccard: +jac(p.aTok, q.aTok).toFixed(2),
      dupTitle: p.title === q.title, dupDesc: !!p.desc && p.desc === q.desc,
      titleA: p.title, titleB: q.title });
  }
}

// Everything else is screened lexically, listings excluded from both sides.
for (const [, idxs] of byTok) {
  if (idxs.length > 400) continue; // a token on 400+ pages carries no discriminating signal
  for (let a = 0; a < idxs.length; a++) for (let b = a + 1; b < idxs.length; b++) {
    const i = idxs[a], j = idxs[b];
    const p = pages[i], q = pages[j];
    if (p.tier === 'listing' || q.tier === 'listing') continue;
    if (GRID.has(p.tier) && GRID.has(q.tier)) continue;  // handled above, on the keyword
    const key = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (seen.has(key)) continue;
    seen.add(key); compared++;
    const sameTier = p.tier === q.tier;
    const tJ = jac(p.tTok, q.tTok), aJ = jac(p.aTok, q.aTok);
    const dupTitle = p.title && p.title === q.title;
    const dupDesc = p.desc && p.desc === q.desc;

    // HIGH needs agreement from both signals. Title tokens alone promoted "what does a Google
    // Ads agency do" and "which Google Ads agency is the best" to HIGH — after stopword removal
    // both reduce to {google, ads}, a perfect title match between two plainly different
    // questions. The body overlap of 0.06 is the signal that says so.
    let sev = null;
    if (dupTitle || dupDesc) sev = 'HIGH';
    else if (sameTier && tJ >= 0.8 && aJ >= 0.4) sev = 'HIGH';
    else if (sameTier && (tJ >= 0.6 || aJ >= 0.5)) sev = 'MEDIUM';
    else if (!sameTier && aJ >= 0.75) sev = 'MEDIUM';
    if (!sev) continue;

    flagged.push({ severity: sev, a: p.rel, b: q.rel, tierA: p.tier, tierB: q.tier, sameTier,
      reason: dupTitle ? 'identical title' : dupDesc ? 'identical meta description' : 'high term overlap on the same tier',
      titleJaccard: +tJ.toFixed(2), allJaccard: +aJ.toFixed(2), dupTitle: !!dupTitle, dupDesc: !!dupDesc,
      titleA: p.title, titleB: q.title });
  }
}

const rank = { HIGH: 0, MEDIUM: 1 };
flagged.sort((x, y) => rank[x.severity] - rank[y.severity] || y.allJaccard - x.allJaccard);

const report = { scanned: pages.length, pairsCompared: compared, flagged: flagged.length,
  byTier: Object.entries(pages.reduce((a, p) => (a[p.tier] = (a[p.tier] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]),
  pairs: flagged };

if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

console.log(`pages scanned  : ${report.scanned} (indexable)`);
console.log(`pairs screened : ${report.pairsCompared.toLocaleString()} lexical (listings screened by company identity instead — see comment)`);
console.log(`flagged        : ${report.flagged}\n`);
console.log(`tiers: ${report.byTier.map(([t, n]) => `${t} ${n}`).join(' · ')}\n`);
for (const f of flagged.slice(0, 40)) {
  console.log(`${f.severity.padEnd(6)} ${f.sameTier ? f.tierA : `${f.tierA}→${f.tierB}`}  ${f.reason}  (title J=${f.titleJaccard}, all J=${f.allJaccard})`);
  console.log(`       ${f.a}`);
  console.log(`       ${f.b}`);
}
if (flagged.length > 40) console.log(`… and ${flagged.length - 40} more`);
