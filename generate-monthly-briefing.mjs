// Monthly briefing pipeline. Run once per month to draft the next state-of-the-index briefing.
// - Queries directory_companies for current aggregates
// - Compares against data/last-snapshot.json if present; computes diffs
// - Drafts news/updates/state-of-the-index-YYYY-MM.html (editorially reviewable)
// - Writes the new snapshot to data/last-snapshot.json
//
// Usage: node generate-monthly-briefing.mjs [YYYY-MM]  (defaults to next calendar month)
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';
const SUPA = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const hdrs = { apikey: ANON, Authorization: 'Bearer ' + ANON };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------- Month parsing
const now = new Date();
const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
const targetMonth = process.argv[2] || `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, '0')}`;
const [YEAR, MONTH] = targetMonth.split('-').map(Number);
const monthName = new Date(Date.UTC(YEAR, MONTH - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
console.log(`target briefing month: ${monthName} ${YEAR}`);

// ------- Fetch current aggregate state
async function all() {
  let rows = [], from = 0;
  while (true) {
    const r = await fetch(`${SUPA}/rest/v1/directory_companies?select=domain,name,category,listing_type,avg_hourly_rate,min_project_size,team_size,hq_state,hq_city,year_established,status&status=eq.approved&order=domain.asc&offset=${from}&limit=1000`, { headers: hdrs });
    const p = await r.json();
    rows = rows.concat(p);
    if (p.length < 1000) break;
    from += 1000;
  }
  return rows;
}
const rows = await all();
console.log(`current approved listings: ${rows.length}`);

// ------- Aggregate function
function aggregate(rows) {
  const byCat = {}, byState = {}, byRate = {}, byType = {};
  const domains = new Set();
  for (const r of rows) {
    domains.add(r.domain);
    byCat[r.category] = (byCat[r.category] || 0) + 1;
    if (r.hq_state) byState[r.hq_state] = (byState[r.hq_state] || 0) + 1;
    if (r.avg_hourly_rate) byRate[r.avg_hourly_rate] = (byRate[r.avg_hourly_rate] || 0) + 1;
    if (r.listing_type) byType[r.listing_type] = (byType[r.listing_type] || 0) + 1;
  }
  return {
    total: rows.length,
    categories: byCat,
    states: byState,
    rates: byRate,
    types: byType,
    domains: Array.from(domains)
  };
}
const current = aggregate(rows);
console.log(`categories: ${Object.keys(current.categories).length}, states: ${Object.keys(current.states).length}`);

// ------- Load prior snapshot
mkdirSync(join(ROOT, 'data'), { recursive: true });
const SNAP_PATH = join(ROOT, 'data', 'last-snapshot.json');
const prior = existsSync(SNAP_PATH) ? JSON.parse(readFileSync(SNAP_PATH, 'utf8')) : null;

let diffSection;
if (!prior) {
  diffSection = `<p><strong>This is the first snapshot in the monthly cadence.</strong> Next month's briefing will report the month-over-month changes: new listings, removals, rate-band shifts, and category-mix drift. Baseline established today: ${current.total} approved US growth-services listings across ${Object.keys(current.categories).length} pillars and ${Object.keys(current.states).length} US states.</p>`;
} else {
  const priorDomains = new Set(prior.domains);
  const currDomains = new Set(current.domains);
  const added = [...currDomains].filter(d => !priorDomains.has(d));
  const removed = [...priorDomains].filter(d => !currDomains.has(d));
  const netDelta = current.total - prior.total;
  const catShifts = Object.keys({ ...prior.categories, ...current.categories })
    .map(c => ({ c, prior: prior.categories[c] || 0, curr: current.categories[c] || 0 }))
    .filter(x => x.curr - x.prior !== 0)
    .sort((a, b) => Math.abs(b.curr - b.prior) - Math.abs(a.curr - a.prior))
    .slice(0, 5);
  diffSection = `
<h2>Since the ${prior.month} snapshot</h2>
<p>${current.total} approved listings this month (net ${netDelta >= 0 ? '+' : ''}${netDelta} vs. ${prior.total}). ${added.length} new listings added, ${removed.length} removed.</p>
${catShifts.length ? `<h3>Biggest pillar shifts</h3>
<table><thead><tr><th>Pillar</th><th>Prior</th><th>Current</th><th>Δ</th></tr></thead><tbody>
${catShifts.map(x => `<tr><td>${esc(x.c)}</td><td>${x.prior}</td><td>${x.curr}</td><td>${x.curr - x.prior >= 0 ? '+' : ''}${x.curr - x.prior}</td></tr>`).join('')}
</tbody></table>` : ''}
${added.length ? `<h3>Sample new listings</h3><ul>${added.slice(0, 10).map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
${removed.length ? `<h3>Sample removed listings</h3><p>${removed.slice(0, 5).map(d => esc(d)).join(', ')}</p>` : ''}`;
}

// ------- Draft the briefing HTML
const dek = prior
  ? `${current.total} approved US growth-services vendors this month (net ${current.total - prior.total >= 0 ? '+' : ''}${current.total - prior.total} vs. ${prior.month}). Category breakdown, rate-band distribution, and the ${new Date(Date.UTC(YEAR, MONTH - 1, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })} snapshot.`
  : `The baseline snapshot: ${current.total} approved US growth-services vendors across ${Object.keys(current.categories).length} pillars, published as of ${monthName} ${YEAR}. Future monthly updates will report month-over-month changes.`;

const catRows = Object.entries(current.categories).sort((a, b) => b[1] - a[1]);
const stateRows = Object.entries(current.states).sort((a, b) => b[1] - a[1]).slice(0, 10);
const rateRows = Object.entries(current.rates).sort((a, b) => b[1] - a[1]);

const draft = `<!-- DRAFT — review before publishing.
     Fill in narrative sections where marked TODO, then rename or move to news/updates/. -->
{
  slug: 'state-of-the-index-${YEAR}-${String(MONTH).padStart(2, '0')}',
  date: '${YEAR}-${String(MONTH).padStart(2, '0')}-01',
  h: 'State of the index — ${monthName} ${YEAR}: ${current.total} vendors across ${Object.keys(current.categories).length} pillars',
  dek: \`${dek}\`,
  body: \`
<p>${BRAND}'s index holds ${current.total} approved US growth-services vendors this month, distributed across ${Object.keys(current.categories).length} pillars and ${Object.keys(current.states).length} US states.</p>

${diffSection}

<h2>Current pillar breakdown</h2>
<table><thead><tr><th>Pillar</th><th>Firms</th></tr></thead><tbody>
${catRows.map(([c, n]) => `<tr><td>${esc(c)}</td><td>${n}</td></tr>`).join('\n')}
</tbody></table>

<h2>Top 10 US states by vendor count</h2>
<table><thead><tr><th>State</th><th>Firms</th></tr></thead><tbody>
${stateRows.map(([s, n]) => `<tr><td>${esc(s)}</td><td>${n}</td></tr>`).join('\n')}
</tbody></table>

<h2>Rate-band distribution across the index</h2>
<table><thead><tr><th>Band</th><th>Firms</th></tr></thead><tbody>
${rateRows.map(([r, n]) => `<tr><td>${esc(r)}</td><td>${n}</td></tr>`).join('\n')}
</tbody></table>

<h2>Editorial note (TODO)</h2>
<p><em>TODO: One paragraph of context on what shifted this month, what the shift means for buyers, or what the editorial team is watching next. Do not ship the "TODO" placeholder.</em></p>

<p>Browse the full atlas at ${'<a href="../..\/">' + BRAND + '</a>'}. Historical monthly briefings live under ${'<a href="../">news/updates</a>'}.</p>
\`,
  rel: ['state-of-the-index-2026-08', 'us-agency-hourly-rates-2026', 'where-us-growth-vendors-cluster-2026']
},
`;

const DRAFT_PATH = join(ROOT, 'data', `draft-briefing-${YEAR}-${String(MONTH).padStart(2, '0')}.txt`);
writeFileSync(DRAFT_PATH, draft);
console.log(`draft briefing written: ${DRAFT_PATH}`);
console.log(`\nTo publish: copy the block above into build-updates.mjs UPDATES array, edit the TODO paragraph, run 'node build-updates.mjs && node build-pages.mjs --pages-only', then commit.`);

// ------- Write new snapshot
const newSnapshot = {
  month: `${YEAR}-${String(MONTH).padStart(2, '0')}`,
  captured_at: new Date().toISOString().slice(0, 10),
  total: current.total,
  categories: current.categories,
  states: current.states,
  rates: current.rates,
  types: current.types,
  domains: current.domains
};
writeFileSync(SNAP_PATH, JSON.stringify(newSnapshot, null, 2));
console.log(`snapshot updated: ${SNAP_PATH}`);
