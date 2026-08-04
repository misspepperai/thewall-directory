// Generates /find/{category-slug}-{state-slug}.html pages for high-commercial-intent
// "marketing agencies in california" / "seo agencies texas" type queries.
// Skips combos with < 3 vendors. Run: node build-find.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const SUPA = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const hdrs = { apikey: ANON, Authorization: 'Bearer ' + ANON };

// Category slug + display + pillar-page mapping (uses the search phrases buyers actually type)
const CAT_MAP = {
  'Marketing': { slug: 'marketing-agencies', display: 'marketing agencies', pillarSlug: 'marketing', short: 'marketing' },
  'SEO': { slug: 'seo-agencies', display: 'SEO agencies', pillarSlug: 'seo', short: 'SEO' },
  'Creative Strategy': { slug: 'creative-agencies', display: 'creative agencies', pillarSlug: 'creative-strategy', short: 'creative' },
  'Content Marketing': { slug: 'content-marketing-agencies', display: 'content marketing agencies', pillarSlug: 'content-marketing', short: 'content marketing' },
  'Social Media Marketing': { slug: 'social-media-marketing-agencies', display: 'social media marketing agencies', pillarSlug: 'social-media-marketing', short: 'social media marketing' },
  'Thought Leadership': { slug: 'pr-agencies', display: 'PR and thought-leadership agencies', pillarSlug: 'thought-leadership', short: 'PR / thought-leadership' },
  'Automation': { slug: 'marketing-automation-services', display: 'marketing automation providers', pillarSlug: 'automation', short: 'marketing automation' }
};

const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'Washington, D.C.' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stateSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ORG_LD = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' };

async function all() {
  let rows = [], from = 0;
  while (true) {
    const r = await fetch(`${SUPA}/rest/v1/directory_companies?select=name,domain,category,hq_city,hq_state,avg_hourly_rate,team_size,year_established&status=eq.approved&order=name.asc&offset=${from}&limit=1000`, { headers: hdrs });
    const p = await r.json();
    rows = rows.concat(p);
    if (p.length < 1000) break;
    from += 1000;
  }
  return rows;
}

function shell({ title, metaDesc, canonical, ld, bodyHTML }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<style>
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:820px;margin:0 auto;padding:0 24px}a{color:var(--cobalt)}
  .topbar{border-bottom:1px solid var(--stone)}.topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink);display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .kicker{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);padding:34px 0 0;text-transform:uppercase}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,40px);letter-spacing:-.02em;line-height:1.15;padding:10px 0 6px}
  .dek{font-family:var(--serif);font-style:italic;font-size:17px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .statline{display:flex;gap:26px;flex-wrap:wrap;border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:18px 0}
  .statline div b{display:block;font-family:var(--mono);font-size:20px;font-weight:600;color:var(--ink)}
  .statline div span{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:var(--chrome)}
  .firmlist{border:1px solid var(--stone);border-radius:10px;background:#fff;overflow:hidden;margin:16px 0}
  .firmlist table{width:100%;border-collapse:collapse}
  .firmlist th,.firmlist td{padding:11px 16px;border-bottom:1px solid var(--stone-lt);text-align:left;font-size:13.5px}
  .firmlist th{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;color:var(--chrome);text-transform:uppercase;background:var(--stone-lt)}
  .firmlist td a{color:var(--ink);text-decoration:none;font-weight:600}
  .firmlist td a:hover{color:var(--cobalt)}
  .firmlist td.rate{color:var(--body);font-family:var(--mono);font-size:11.5px}
  .firmlist td.city{color:var(--chrome);font-size:12px}
  .firmlist tr:last-child td{border-bottom:none}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:820px}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  footer a:hover{color:var(--ink)}
</style>
</head>
<body>
<nav class="topbar"><div class="wrap topbar-in">
  <a class="wordmark" href="../">${BRAND} <small>OPERATIONS ATLAS</small></a>
  <a class="back" href="../">BROWSE THE ATLAS →</a>
</div></nav>
<main class="wrap">
${bodyHTML}
</main>
<footer><div class="wrap">
  <span>© ${BRAND} · INDEPENDENT DIRECTORY · NOT AN ENDORSEMENT ENGINE</span>
  <span><a href="../about.html">ABOUT</a> · <a href="../news/">BRIEFINGS</a> · <a href="../glossary.html">GLOSSARY</a> · <a href="../editorial-policy.html">EDITORIAL</a> · <a href="../contact.html">CONTACT</a></span>
</div></footer>
</body>
</html>`;
}

const rows = await all();
console.log(`fetched ${rows.length} approved listings`);

// Group by (category, state)
const grouped = {};
for (const r of rows) {
  if (!r.hq_state || !CAT_MAP[r.category]) continue;
  const key = `${r.category}|${r.hq_state}`;
  (grouped[key] ||= []).push(r);
}

// Only combos with 3+ vendors
const combos = Object.entries(grouped).filter(([, list]) => list.length >= 3);
console.log(`viable combos: ${combos.length}`);

// Top-20 state whitelist
const topStates = Object.entries(rows.reduce((m, r) => { if (r.hq_state) m[r.hq_state] = (m[r.hq_state] || 0) + 1; return m; }, {}))
  .sort((a, b) => b[1] - a[1]).slice(0, 20).map(([s]) => s);

const filtered = combos.filter(([key]) => topStates.includes(key.split('|')[1]));
console.log(`combos in top-20 states: ${filtered.length}`);

mkdirSync(join(ROOT, 'find'), { recursive: true });

const built = [];
for (const [key, list] of filtered) {
  const [category, state] = key.split('|');
  const cat = CAT_MAP[category];
  const stateName = STATE_NAMES[state] || state;
  const sSlug = stateSlug(stateName);
  const fileSlug = `${cat.slug}-${sSlug}`;
  const canonical = `${SITE}/find/${fileSlug}.html`;

  // Rate distribution for this slice
  const withRate = list.filter(r => r.avg_hourly_rate && r.avg_hourly_rate !== 'Undisclosed');
  const modalRate = (() => {
    if (!withRate.length) return null;
    const c = {};
    for (const r of withRate) c[r.avg_hourly_rate] = (c[r.avg_hourly_rate] || 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
  })();
  const cityBreakdown = Object.entries(list.reduce((m, r) => { if (r.hq_city) m[r.hq_city] = (m[r.hq_city] || 0) + 1; return m; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  const ld = [
    ORG_LD,
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: `${cat.display.charAt(0).toUpperCase() + cat.display.slice(1)} in ${stateName} — ${BRAND}`,
      url: canonical,
      description: `${list.length} US ${cat.display} headquartered in ${stateName}, indexed by ${BRAND}.`,
      about: { '@type': 'Place', name: stateName, addressCountry: 'US' },
      mainEntity: { '@type': 'ItemList', itemListElement: list.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/c/${r.domain}.html`, name: r.name })) }
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Find vendors', item: `${SITE}/find/` },
        { '@type': 'ListItem', position: 3, name: `${cat.display} in ${stateName}` }
      ]
    }
  ];

  const body = `
<div class="kicker">Find · ${esc(category)} · ${esc(stateName)}</div>
<h1>${esc(cat.display.charAt(0).toUpperCase() + cat.display.slice(1))} in ${esc(stateName)}</h1>
<p class="dek">${list.length} US ${esc(cat.display)} headquartered in ${esc(stateName)}, indexed by ${BRAND}. Every listed firm is US-based and machine-verified live — no expired links, no international dilution.</p>
<div class="statline">
  <div><b>${list.length}</b><span>${esc(cat.short.toUpperCase())} FIRMS IN ${esc(stateName.toUpperCase())}</span></div>
  ${modalRate ? `<div><b>${esc(modalRate.replace(' / hr', ''))}</b><span>MOST-COMMON RATE</span></div>` : ''}
  <div><b>${withRate.length}</b><span>DISCLOSE HOURLY</span></div>
</div>

<h2>All ${list.length} ${esc(cat.display)} in ${esc(stateName)}</h2>
<div class="firmlist"><table>
  <thead><tr><th>Firm</th><th>City</th><th>Rate</th></tr></thead>
  <tbody>
${list.map(r => `    <tr><td><a href="../c/${esc(r.domain)}.html">${esc(r.name)}</a></td><td class="city">${esc(r.hq_city || '—')}</td><td class="rate">${esc((r.avg_hourly_rate || 'n/a').replace(' / hr', ''))}</td></tr>`).join('\n')}
  </tbody>
</table></div>

${cityBreakdown.length ? `<h2>Where in ${esc(stateName)} they cluster</h2>
<p>${cityBreakdown.map(([c, n]) => `<strong>${esc(c)}</strong> (${n})`).join(' · ')}${list.length > cityBreakdown.reduce((s, [, n]) => s + n, 0) ? `. Remaining firms are distributed across other ${stateName} cities.` : '.'}</p>` : ''}

<h2>Reading a ${esc(stateName)} ${esc(cat.short)} shortlist</h2>
<p>${stateName}'s cluster of ${list.length} ${cat.display} reflects where talent, alumni networks, and category specialization have compounded — not a service-area constraint on your shortlist. Virtually every firm on this page sells nationally, most run remote or hybrid teams, and clients outside ${stateName} are the norm not the exception. Filter your shortlist by state when you specifically need in-person work; dilute it everywhere else.</p>
<p>The most-common hourly rate in this slice is <strong>${modalRate ? esc(modalRate) : 'undisclosed'}</strong>, which sits ${modalRate && (modalRate.includes('$100') || modalRate.includes('$150')) ? 'squarely at the US market center' : 'outside the modal $100–$199 band that most US ' + cat.display + ' price to'}. A quote well outside this band should come with a reason: senior-only teams on the high side, offshore delivery or junior-heavy staffing on the low side.</p>

<div class="rel"><h3>KEEP EXPLORING</h3>
<a href="../pillars/${cat.pillarSlug}.html">The full ${esc(category)} pillar (all US firms, not just ${esc(stateName)})</a>
<a href="../states/${sSlug}.html">All ${esc(stateName)} vendors across every discipline</a>
<a href="../?cat=${encodeURIComponent(category)}&state=${state}">Filter the atlas to ${esc(cat.short)} + ${esc(stateName)}</a>
<a href="./">Other category × state pages</a>
</div>`;

  writeFileSync(join(ROOT, 'find', `${fileSlug}.html`), shell({
    title: `${cat.display.charAt(0).toUpperCase() + cat.display.slice(1)} in ${stateName}: ${list.length} US Firms — ${BRAND}`,
    metaDesc: `${list.length} US ${cat.display} headquartered in ${stateName}. Full list with hourly rates, cities, and links to each firm's profile.`,
    canonical, ld, bodyHTML: body
  }));
  built.push({ slug: fileSlug, category, state, stateName, n: list.length });
}

// Index page — grouped by category
const byCat = built.reduce((m, x) => { (m[x.category] ||= []).push(x); return m; }, {});
const indexLD = [
  ORG_LD,
  {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `Find US Growth Agencies by Discipline and State — ${BRAND}`,
    url: `${SITE}/find/`,
    description: `${built.length} pages combining ${Object.keys(byCat).length} disciplines × top US states, from ${BRAND}'s directory of 2,286 verified US growth-services vendors.`,
    mainEntity: { '@type': 'ItemList', itemListElement: built.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/find/${b.slug}.html`, name: `${CAT_MAP[b.category].display} in ${b.stateName}` })) }
  }
];
writeFileSync(join(ROOT, 'find', 'index.html'), shell({
  title: `Find US Growth Agencies by Discipline and State — ${BRAND}`,
  metaDesc: `${built.length} focused shortlists combining discipline × US state. Marketing agencies in California, SEO agencies in Texas, and 78 more.`,
  canonical: `${SITE}/find/`,
  ld: indexLD,
  bodyHTML: `
<div class="kicker">Reference · Find by state</div>
<h1>Find US growth agencies by discipline + state</h1>
<p class="dek">${built.length} focused shortlists combining ${Object.keys(byCat).length} disciplines × top US states, from ${BRAND}'s directory of 2,286 verified US growth-services vendors. Every combo with at least 3 in-state firms gets its own page.</p>
${Object.entries(byCat).map(([cat, items]) => `
<h2>${esc(CAT_MAP[cat].display.charAt(0).toUpperCase() + CAT_MAP[cat].display.slice(1))} — ${items.length} states</h2>
<div class="firmlist"><table><thead><tr><th>State</th><th>Firms</th></tr></thead><tbody>
${items.sort((a, b) => b.n - a.n).map(x => `<tr><td><a href="${x.slug}.html">${esc(x.stateName)}</a></td><td class="rate">${x.n}</td></tr>`).join('\n')}
</tbody></table></div>`).join('\n')}
<div class="rel"><h3>ALSO</h3>
<a href="../states/">All state pages (every discipline combined)</a>
<a href="../pillars/">Full pillar pages (every state combined)</a>
</div>`
}));

console.log(`find pages: ${built.length} + 1 index`);
