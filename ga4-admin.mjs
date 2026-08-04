// GA4 Admin + Data API client for The Wall.
//
// Dependency-free: signs its own service-account JWT with node:crypto, so there is
// no npm install and no package.json in this repo.
//
// Credential: .secrets/ga4-service-account.json  (gitignored — never commit it)
// Property ID: numeric, from GA4 Admin > Property details. NOT the G-XXXX id.
//
// Usage:
//   node ga4-admin.mjs whoami        # verify auth + show property
//   node ga4-admin.mjs diagnose      # realtime events, streams, data filters
//   node ga4-admin.mjs dimensions    # list registered custom dimensions
//   node ga4-admin.mjs create-dims   # create the 14 dimensions (idempotent)
//   node ga4-admin.mjs keyevents     # list key events
import { readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(ROOT, '.secrets', 'ga4-service-account.json');
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';   // e.g. 123456789

// The 14 custom dimensions the tracking layer in nav.js emits.
const DIMENSIONS = [
  ['Page type', 'page_type', 'Which kind of page — listing, pillar, hub, briefing…'],
  ['Vendor domain', 'vendor_domain', 'Which vendor listing was engaged with'],
  ['Vendor name', 'vendor_name', 'Vendor name, human readable'],
  ['Vendor category', 'vendor_category', 'Discipline of the vendor'],
  ['Link location', 'link_location', 'Where a partner click originated'],
  ['Nav group', 'nav_group', 'Which nav dropdown was used'],
  ['Nav label', 'nav_label', 'Which nav item was clicked'],
  ['Filter name', 'filter_name', 'Which atlas filter was changed'],
  ['Filter value', 'filter_value', 'What it was filtered to'],
  ['Search term', 'search_term', 'On-site search query'],
  ['Question', 'question', 'Which FAQ question was opened'],
  ['Chart', 'chart', 'Which Data Corner chart was cited'],
  ['Tool name', 'tool_name', 'Which interactive tool was used'],
  ['Tool category', 'tool_category', 'Category selected in the tool'],
];

const b64url = b => Buffer.from(b).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function token() {
  if (!existsSync(KEY_PATH)) {
    console.error(`\nNo credential at ${KEY_PATH}`);
    console.error('See docs/ga4-api-access.md for the 5-minute setup.\n');
    process.exit(1);
  }
  const sa = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.edit https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  };
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(claim));
  const sig = createSign('RSA-SHA256').update(`${head}.${body}`).sign(sa.private_key);
  const jwt = `${head}.${body}.${b64url(sig)}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await r.json();
  if (!j.access_token) { console.error('Auth failed:', j); process.exit(1); }
  return { tok: j.access_token, email: sa.client_email };
}

async function api(tok, url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await r.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
  return { ok: r.ok, status: r.status, j };
}

function needProperty() {
  if (!PROPERTY_ID) {
    console.error('\nSet GA4_PROPERTY_ID first (numeric id from GA4 Admin > Property details):');
    console.error('  GA4_PROPERTY_ID=123456789 node ga4-admin.mjs <cmd>\n');
    process.exit(1);
  }
}

const ADMIN = 'https://analyticsadmin.googleapis.com/v1beta';
// v1alpha kept for reference; dataFilters are not exposed in any version.
const DATA = 'https://analyticsdata.googleapis.com/v1beta';

const cmd = process.argv[2] || 'whoami';
const { tok, email } = await token();
console.log(`auth OK as ${email}\n`);

if (cmd === 'whoami') {
  const r = await api(tok, `${ADMIN}/accountSummaries`);
  if (!r.ok) { console.error('Cannot list accounts:', r.status, r.j); process.exit(1); }
  for (const a of r.j.accountSummaries || []) {
    console.log(`account: ${a.displayName}`);
    for (const p of a.propertySummaries || []) {
      console.log(`   property: ${p.displayName}  →  ${p.property}  (id ${p.property.split('/')[1]})`);
    }
  }
  if (!(r.j.accountSummaries || []).length) {
    console.log('No properties visible. Add this service account under');
    console.log('GA4 Admin > Property access management with the Editor role:');
    console.log(`   ${email}`);
  }
}

if (cmd === 'diagnose') {
  needProperty();
  console.log('--- data streams ---');
  const s = await api(tok, `${ADMIN}/properties/${PROPERTY_ID}/dataStreams`);
  if (!s.ok) {
    console.log(`  ERROR ${s.status}: ${(s.j.error && s.j.error.message) || JSON.stringify(s.j).slice(0, 200)}`);
    if (s.status === 403) {
      console.log('\n  >> The service account has no access to this property yet.');
      console.log('  >> GA4 > Admin > Property access management > + > Add users');
      console.log(`  >> ${email}  — role: Editor`);
      process.exit(1);
    }
  } else if (!(s.j.dataStreams || []).length) {
    console.log('  (no streams returned)');
  } else for (const st of s.j.dataStreams) {
    const mid = st.webStreamData && st.webStreamData.measurementId;
    console.log(`  ${st.displayName}  measurementId=${mid}  uri=${st.webStreamData && st.webStreamData.defaultUri}`);
    if (mid && mid !== 'G-7EVW8MX8Z9') {
      console.log(`     ^^ MISMATCH — nav.js sends to G-7EVW8MX8Z9, this stream is ${mid}`);
    }
  }

  // Data filters (internal / developer traffic exclusions) are NOT exposed by the
  // GA4 Admin API in any version — checked against the REST reference. They can only
  // be inspected in the UI, so point there rather than silently 404.
  console.log('\n--- data filters ---');
  console.log('  Not available via API (Google does not expose dataFilters). Check by hand:');
  console.log('  Admin > Data Settings > Data Filters — look for an ACTIVE "Internal Traffic"');
  console.log('  or "Developer Traffic" filter. An ACTIVE filter excludes matching traffic');
  console.log('  from ALL reporting, which looks exactly like "tracking is broken".');
  console.log('  Also: Admin > Data Streams > [stream] > Configure tag settings >');
  console.log('  Define internal traffic — check whether your own IP is listed.');

  console.log('\n--- realtime: events in the last 30 minutes ---');
  const rt = await api(tok, `${DATA}/properties/${PROPERTY_ID}:runRealtimeReport`, {
    method: 'POST',
    body: JSON.stringify({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }] }),
  });
  if (!rt.ok) console.log('  error:', rt.status, JSON.stringify(rt.j).slice(0, 300));
  else if (!(rt.j.rows || []).length) console.log('  NO events in the last 30 min');
  else for (const row of rt.j.rows) {
    console.log(`  ${row.dimensionValues[0].value.padEnd(28)} ${row.metricValues[0].value}`);
  }
}

if (cmd === 'dimensions') {
  needProperty();
  const r = await api(tok, `${ADMIN}/properties/${PROPERTY_ID}/customDimensions`);
  if (!r.ok) { console.error(r.status, r.j); process.exit(1); }
  const have = r.j.customDimensions || [];
  console.log(`${have.length} registered:`);
  for (const d of have) console.log(`  ${d.parameterName.padEnd(20)} ${d.scope.padEnd(8)} ${d.displayName}`);
  const missing = DIMENSIONS.filter(([, p]) => !have.some(d => d.parameterName === p));
  if (missing.length) {
    console.log(`\n${missing.length} MISSING: ${missing.map(m => m[1]).join(', ')}`);
    console.log('Run: node ga4-admin.mjs create-dims');
  } else console.log('\nAll 14 tracking dimensions are registered.');
}

if (cmd === 'create-dims') {
  needProperty();
  const cur = await api(tok, `${ADMIN}/properties/${PROPERTY_ID}/customDimensions`);
  const have = (cur.j.customDimensions || []).map(d => d.parameterName);
  let made = 0, skipped = 0;
  for (const [displayName, parameterName, description] of DIMENSIONS) {
    if (have.includes(parameterName)) { console.log(`  skip (exists)  ${parameterName}`); skipped++; continue; }
    const r = await api(tok, `${ADMIN}/properties/${PROPERTY_ID}/customDimensions`, {
      method: 'POST',
      body: JSON.stringify({ parameterName, displayName, description, scope: 'EVENT' }),
    });
    if (r.ok) { console.log(`  created        ${parameterName}`); made++; }
    else console.log(`  FAILED         ${parameterName}: ${r.status} ${JSON.stringify(r.j).slice(0, 200)}`);
  }
  console.log(`\n${made} created, ${skipped} already existed.`);
}

if (cmd === 'keyevents') {
  needProperty();
  const r = await api(tok, `${ADMIN}/properties/${PROPERTY_ID}/keyEvents`);
  if (!r.ok) { console.error(r.status, JSON.stringify(r.j).slice(0, 300)); process.exit(1); }
  const ke = r.j.keyEvents || [];
  if (!ke.length) console.log('no key events yet');
  for (const k of ke) console.log(`  ${k.eventName}`);
}
