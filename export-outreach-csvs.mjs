// Export segmented CSVs for cold-email outreach, matching the segments defined in
// docs/cold-email-vendor-referral-pack.md.
//
// Segments:
//   A — Marketing (highest volume, primary sequence)
//   B — SEO + Content Marketing + Social Media Marketing (channel specialists)
//   C — Creative Strategy (lower-fit, lower priority)
//   D — Sales + Automation + Demand Gen + AI Marketing + Thought Leadership (highest fit)
//
// Rows without enriched contact_email are excluded from the outreach CSVs (they can't be sent to);
// they're written to `pending-enrichment.csv` for tracking. Suppressed rows are never included.
//
// Run: node export-outreach-csvs.mjs [--include-unenriched]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'exports');
mkdirSync(OUT, { recursive: true });

const URL = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const hdrs = { apikey: ANON, Authorization: 'Bearer ' + ANON };

const SEGMENTS = {
  'A-marketing':      ['Marketing'],
  'B-seo-content-social': ['SEO', 'Content Marketing', 'Social Media Marketing'],
  'C-creative':       ['Creative Strategy'],
  'D-sales-auto-demand-ai-tl': ['Sales', 'Automation', 'Demand Gen', 'AI Marketing', 'Thought Leadership'],
};

const includeUnenriched = process.argv.includes('--include-unenriched');

const SELECT = [
  'name', 'domain', 'category', 'subcategory',
  'contact_email', 'contact_first_name', 'contact_last_name', 'contact_title', 'contact_linkedin', 'contact_seniority', 'contact_function',
  'avg_hourly_rate', 'min_project_size', 'team_size',
  'hq_city', 'hq_state', 'year_established',
  'suppressed'
].join(',');

const SITE = 'https://hitthewall.net';
const profileUrl = d => `${SITE}/c/${d}.html`;

// Simple CSV writer — RFC 4180 style, no dependencies.
function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => csvCell(r[h])).join(','));
  return lines.join('\r\n') + '\r\n';
}

async function fetchApproved() {
  let all = [], from = 0;
  while (true) {
    const r = await fetch(`${URL}/rest/v1/directory_companies?select=${SELECT}&status=eq.approved&order=category.asc,name.asc&offset=${from}&limit=1000`, { headers: hdrs });
    if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
    const page = await r.json();
    all = all.concat(page);
    if (page.length < 1000) break;
    from += 1000;
  }
  return all;
}

function shape(row) {
  return {
    contact_email:  row.contact_email || '',
    first_name:     row.contact_first_name || '',
    last_name:      row.contact_last_name || '',
    company:        row.name,
    domain:         row.domain,
    profile_url:    profileUrl(row.domain),
    category:       row.category,
    subcategory:    row.subcategory || '',
    contact_title:  row.contact_title || '',
    contact_seniority: row.contact_seniority || '',
    contact_function:  row.contact_function || '',
    contact_linkedin:  row.contact_linkedin || '',
    hq_city:        row.hq_city || '',
    hq_state:       row.hq_state || '',
    avg_hourly_rate: row.avg_hourly_rate || '',
    min_project_size: row.min_project_size || '',
    team_size:      row.team_size || '',
    year_established: row.year_established || '',
  };
}

const HEADERS = [
  'contact_email','first_name','last_name','company','domain','profile_url',
  'category','subcategory','contact_title','contact_seniority','contact_function','contact_linkedin',
  'hq_city','hq_state','avg_hourly_rate','min_project_size','team_size','year_established'
];

const rows = await fetchApproved();
const suppressed = rows.filter(r => r.suppressed);
const active = rows.filter(r => !r.suppressed);
const withEmail = active.filter(r => r.contact_email);
const withoutEmail = active.filter(r => !r.contact_email);

console.log(`\n--- Export snapshot ---`);
console.log(`Total approved:       ${rows.length}`);
console.log(`Suppressed (skipped): ${suppressed.length}`);
console.log(`Active w/ email:      ${withEmail.length}`);
console.log(`Active w/o email:     ${withoutEmail.length} (pending enrichment)\n`);

const outSummary = [];
for (const [segId, cats] of Object.entries(SEGMENTS)) {
  const inSeg = (includeUnenriched ? active : withEmail).filter(r => cats.includes(r.category));
  const csv = toCsv(inSeg.map(shape), HEADERS);
  const path = join(OUT, `segment-${segId}.csv`);
  writeFileSync(path, csv);
  outSummary.push({ segment: segId, categories: cats.join(' + '), rows: inSeg.length, path });
}

// Pending-enrichment tracking file (all active rows w/o email)
writeFileSync(join(OUT, 'pending-enrichment.csv'), toCsv(withoutEmail.map(shape), HEADERS));

// Suppression log
writeFileSync(join(OUT, 'suppressed.csv'), toCsv(suppressed.map(r => ({
  company: r.name, domain: r.domain, category: r.category,
  contact_email: r.contact_email || ''
})), ['company','domain','category','contact_email']));

console.log('--- Per-segment output ---');
for (const s of outSummary) console.log(`${s.segment.padEnd(30)} ${String(s.rows).padStart(5)} rows  → ${s.path}`);
console.log(`\npending-enrichment.csv   ${String(withoutEmail.length).padStart(5)} rows (re-run this script after each enrichment pass)`);
console.log(`suppressed.csv           ${String(suppressed.length).padStart(5)} rows`);
console.log(`\nDone. Load segment CSVs into Instantly/Smartlead. Mail-merge fields match cold-email-vendor-referral-pack.md.`);
