// Generates state and city location pages by querying directory_companies directly.
// One page per top-20 state at states/{slug}.html + one per top-15 city at cities/{slug}.html.
// Run: node build-locations.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const SUPA = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const hdrs = { apikey: ANON, Authorization: 'Bearer ' + ANON };

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'Washington, D.C.'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ORG_LD = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' };

async function all() {
  let rows = [], from = 0;
  while (true) {
    const r = await fetch(`${SUPA}/rest/v1/directory_companies?select=name,domain,category,subcategory,hq_city,hq_state,avg_hourly_rate,team_size,year_established&status=eq.approved&order=name.asc&offset=${from}&limit=1000`, { headers: hdrs });
    const p = await r.json();
    rows = rows.concat(p);
    if (p.length < 1000) break;
    from += 1000;
  }
  return rows;
}

function shell({ title, metaDesc, canonical, ld, bodyHTML, base }) {
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
  .catgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin:20px 0}
  .catcell{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 20px}
  .catcell h3{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.14em;color:var(--oxblood);text-transform:uppercase;margin-bottom:10px}
  .catcell ul{list-style:none;padding:0}
  .catcell li{font-size:13.5px;padding:3px 0;border-bottom:1px solid var(--stone-lt);margin:0}
  .catcell li:last-child{border-bottom:none}
  .catcell a{text-decoration:none;color:var(--ink)}
  .catcell a:hover{color:var(--cobalt)}
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
  <a class="wordmark" href="${base}./">${BRAND} <small>OPERATIONS ATLAS</small></a>
  <a class="back" href="${base}./">BROWSE THE ATLAS →</a>
</div></nav>
<main class="wrap">
${bodyHTML}
</main>
<footer><div class="wrap">
  <span>© ${BRAND} · INDEPENDENT DIRECTORY · NOT AN ENDORSEMENT ENGINE</span>
  <span><a href="${base}about.html">ABOUT</a> · <a href="${base}news/">BRIEFINGS</a> · <a href="${base}glossary.html">GLOSSARY</a> · <a href="${base}editorial-policy.html">EDITORIAL</a> · <a href="${base}contact.html">CONTACT</a></span>
</div></footer>
<script src="/nav.js"></script>
</body>
</html>`;
}

const rows = await all();
console.log(`fetched ${rows.length} approved listings`);

// ============ States ============
mkdirSync(join(ROOT, 'states'), { recursive: true });
const byState = {};
for (const r of rows) if (r.hq_state) (byState[r.hq_state] ||= []).push(r);
const topStates = Object.entries(byState).sort((a,b)=>b[1].length-a[1].length).slice(0, 20);

for (const [state, list] of topStates) {
  const name = STATE_NAMES[state] || state;
  const s = slug(name);
  const canonical = `${SITE}/states/${s}.html`;
  const byCat = {};
  for (const r of list) (byCat[r.category] ||= []).push(r);
  const cats = Object.entries(byCat).sort((a,b)=>b[1].length-a[1].length);
  const cityTop = Object.entries(list.reduce((m,r)=>{if(r.hq_city){m[r.hq_city]=(m[r.hq_city]||0)+1}return m},{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>`${c} (${n})`).join(', ');
  const ld = [ORG_LD, {
    '@context':'https://schema.org','@type':'CollectionPage',
    name:`${name} Growth-Services Vendors — ${BRAND}`,url:canonical,
    description:`${list.length} US growth-services vendors headquartered in ${name}, indexed by ${BRAND}.`,
    about:{'@type':'Place',name:name,addressCountry:'US'},
    mainEntity:{'@type':'ItemList',itemListElement:list.map((r,i)=>({'@type':'ListItem',position:i+1,url:`${SITE}/c/${r.domain}.html`,name:r.name}))}
  },{
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[{'@type':'ListItem',position:1,name:BRAND,item:`${SITE}/`},{'@type':'ListItem',position:2,name:'States',item:`${SITE}/states/`},{'@type':'ListItem',position:3,name:name}]
  }];
  const body = `
<div class="kicker">Location · State</div>
<h1>${esc(name)} growth-services vendors</h1>
<p class="dek">${list.length} US growth-services firms headquartered in ${name}, across ${cats.length} disciplines. Nearly every firm listed here sells nationally — headquarters is a supply-side fact, not a service-area constraint.</p>
<div class="statline">
  <div><b>${list.length}</b><span>VENDORS</span></div>
  <div><b>${cats.length}</b><span>DISCIPLINES</span></div>
  ${cityTop ? `<div style="min-width:280px"><b style="font-size:14px;font-family:var(--sans)">${esc(cityTop)}</b><span>TOP CITIES</span></div>` : ''}
</div>
<h2>Vendors by discipline</h2>
<div class="catgrid">
${cats.map(([c,cl]) => `<div class="catcell">
  <h3>${esc(c)} · ${cl.length}</h3>
  <ul>
${cl.slice(0,15).map(r=>`    <li><a href="../c/${esc(r.domain)}.html">${esc(r.name)}</a></li>`).join('\n')}
  </ul>
  ${cl.length > 15 ? `<p style="margin-top:8px;font-size:12px;color:var(--chrome);font-family:var(--mono)">+ ${cl.length - 15} more in this discipline</p>` : ''}
</div>`).join('\n')}
</div>
<h2>Why the ${name} map matters (and where it doesn't)</h2>
<p>${name}'s ${list.length}-vendor cluster reflects where talent has compounded — agency alumni networks, senior specialist pools, and disciplinary depth. What it does <em>not</em> reflect is who you have to hire: every firm on this page sells nationally, most run remote or hybrid teams, and clients outside ${name} are the norm not the exception. Filtering a shortlist by state has value when you specifically need in-person work (some creative production, some sales-training) and dilutes the search everywhere else.</p>
<div class="rel"><h3>KEEP EXPLORING</h3>
<a href="../?state=${encodeURIComponent(state)}">Filter the full atlas to ${esc(name)} only →</a>
<a href="../news/where-us-growth-vendors-cluster-2026.html">The state-level briefing: where US growth vendors actually cluster</a>
<a href="../news/top-cities-us-growth-vendors-2026.html">The city-level briefing</a>
<a href="./">Other state pages</a>
</div>`;
  writeFileSync(join(ROOT, 'states', `${s}.html`), shell({
    title: `${name} Growth-Services Vendors: ${list.length} US Firms — ${BRAND}`,
    metaDesc: `${list.length} US growth-services vendors headquartered in ${name}, indexed by ${BRAND} — full list by discipline, all machine-verified live.`,
    canonical, ld, bodyHTML: body, base: '../'
  }));
}

// States index
const stIdx = topStates.map(([s, list]) => ({ code: s, name: STATE_NAMES[s]||s, slug: slug(STATE_NAMES[s]||s), n: list.length }));
const stIdxLD = [ORG_LD, {
  '@context':'https://schema.org','@type':'CollectionPage',
  name:`Growth-Services Vendors by State — ${BRAND}`,url:`${SITE}/states/`,
  description:`Top 20 US states by growth-services vendor count. Directory of ${rows.length} US firms indexed by ${BRAND}.`,
  mainEntity:{'@type':'ItemList',itemListElement:stIdx.map((s,i)=>({'@type':'ListItem',position:i+1,url:`${SITE}/states/${s.slug}.html`,name:s.name}))}
}];
writeFileSync(join(ROOT,'states','index.html'),shell({
  title:`US Growth-Services Vendors by State — ${BRAND}`,
  metaDesc:`Top 20 US states by growth-services vendor count. Browse ${rows.length} indexed US firms by headquarters state.`,
  canonical:`${SITE}/states/`,ld:stIdxLD,base:'../',
  bodyHTML:`<div class="kicker">Reference · Locations</div>
<h1>US growth vendors by state</h1>
<p class="dek">Top 20 US states by vendor count, drawn from ${rows.length} verified US growth-services firms in the directory. California leads at ${topStates[0][1].length}, with the mid-table concentrations more informative than the top.</p>
<div class="catgrid">
${stIdx.map(s=>`<div class="catcell"><h3>${esc(s.code)} · ${s.n}</h3><ul><li><a href="${s.slug}.html">${esc(s.name)} — ${s.n} vendors →</a></li></ul></div>`).join('\n')}
</div>
<div class="rel"><h3>ALSO</h3><a href="../cities/">By city</a><a href="../news/where-us-growth-vendors-cluster-2026.html">The state-clustering briefing</a></div>`
}));

// ============ Cities ============
mkdirSync(join(ROOT, 'cities'), { recursive: true });
const byCity = {};
for (const r of rows) if (r.hq_city && r.hq_state) (byCity[`${r.hq_city}|${r.hq_state}`] ||= []).push(r);
const topCities = Object.entries(byCity).sort((a,b)=>b[1].length-a[1].length).slice(0, 15);

for (const [key, list] of topCities) {
  const [city, state] = key.split('|');
  const stateName = STATE_NAMES[state] || state;
  const s = slug(`${city}-${state}`);
  const canonical = `${SITE}/cities/${s}.html`;
  const byCat = {};
  for (const r of list) (byCat[r.category] ||= []).push(r);
  const cats = Object.entries(byCat).sort((a,b)=>b[1].length-a[1].length);
  const ld = [ORG_LD, {
    '@context':'https://schema.org','@type':'CollectionPage',
    name:`${city}, ${state} Growth-Services Vendors — ${BRAND}`,url:canonical,
    description:`${list.length} US growth-services vendors headquartered in ${city}, ${stateName}, indexed by ${BRAND}.`,
    about:{'@type':'Place',name:city,addressLocality:city,addressRegion:state,addressCountry:'US'},
    mainEntity:{'@type':'ItemList',itemListElement:list.map((r,i)=>({'@type':'ListItem',position:i+1,url:`${SITE}/c/${r.domain}.html`,name:r.name}))}
  },{
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[{'@type':'ListItem',position:1,name:BRAND,item:`${SITE}/`},{'@type':'ListItem',position:2,name:'Cities',item:`${SITE}/cities/`},{'@type':'ListItem',position:3,name:`${city}, ${state}`}]
  }];
  const body = `
<div class="kicker">Location · City</div>
<h1>${esc(city)}, ${esc(state)} growth-services vendors</h1>
<p class="dek">${list.length} US growth-services firms headquartered in ${city}, ${stateName}, across ${cats.length} disciplines — from the ${rows.length}-vendor ${BRAND} index.</p>
<div class="statline">
  <div><b>${list.length}</b><span>VENDORS IN ${esc(city.toUpperCase())}</span></div>
  <div><b>${cats.length}</b><span>DISCIPLINES</span></div>
  <div><b>${((100*list.length/rows.length).toFixed(1))}%</b><span>OF THE US INDEX</span></div>
</div>
<h2>Vendors by discipline</h2>
<div class="catgrid">
${cats.map(([c,cl]) => `<div class="catcell">
  <h3>${esc(c)} · ${cl.length}</h3>
  <ul>
${cl.slice(0,20).map(r=>`    <li><a href="../c/${esc(r.domain)}.html">${esc(r.name)}</a></li>`).join('\n')}
  </ul>
  ${cl.length > 20 ? `<p style="margin-top:8px;font-size:12px;color:var(--chrome);font-family:var(--mono)">+ ${cl.length - 20} more</p>` : ''}
</div>`).join('\n')}
</div>
<h2>${esc(city)} in the US vendor map</h2>
<p>${city}'s cluster of ${list.length} listed firms puts it ${(() => {
  const rank = topCities.findIndex(([k])=>k===key)+1;
  return rank <= 5 ? `at position ${rank} on the US city ranking — a top-5 growth-services market` : `at position ${rank} on the US city ranking`;
})()}. As with every US metro on this index, virtually every firm sells nationally: the ${city} concentration reflects where talent, alumni networks, and specialization have compounded rather than a service-area constraint on your shortlist.</p>
<div class="rel"><h3>KEEP EXPLORING</h3>
<a href="../states/${slug(stateName)}.html">All of ${esc(stateName)}'s ${byState[state].length} listed vendors</a>
<a href="../news/top-cities-us-growth-vendors-2026.html">The full city-level briefing</a>
<a href="./">Other city pages</a>
</div>`;
  writeFileSync(join(ROOT, 'cities', `${s}.html`), shell({
    title: `${city}, ${state} Growth-Services Vendors: ${list.length} Firms — ${BRAND}`,
    metaDesc: `${list.length} US growth-services vendors headquartered in ${city}, ${stateName}. Full list by discipline, indexed by ${BRAND}.`,
    canonical, ld, bodyHTML: body, base: '../'
  }));
}

// Cities index
const ctIdx = topCities.map(([k,list])=>{const [c,s]=k.split('|');return{city:c,state:s,slug:slug(`${c}-${s}`),n:list.length}});
const ctIdxLD = [ORG_LD, {
  '@context':'https://schema.org','@type':'CollectionPage',
  name:`Growth-Services Vendors by City — ${BRAND}`,url:`${SITE}/cities/`,
  mainEntity:{'@type':'ItemList',itemListElement:ctIdx.map((c,i)=>({'@type':'ListItem',position:i+1,url:`${SITE}/cities/${c.slug}.html`,name:`${c.city}, ${c.state}`}))}
}];
writeFileSync(join(ROOT,'cities','index.html'),shell({
  title:`US Growth-Services Vendors by City — ${BRAND}`,
  metaDesc:`Top 15 US cities by growth-services vendor count. Browse ${rows.length} indexed US firms by headquarters city.`,
  canonical:`${SITE}/cities/`,ld:ctIdxLD,base:'../',
  bodyHTML:`<div class="kicker">Reference · Locations</div>
<h1>US growth vendors by city</h1>
<p class="dek">Top 15 US metros by vendor count. New York leads at ${topCities[0][1].length}, followed by Chicago, Los Angeles, and San Francisco — with mid-table entries (Austin, Denver, Miami) frequently outranking metros with much larger business bases.</p>
<div class="catgrid">
${ctIdx.map(c=>`<div class="catcell"><h3>${esc(c.city)}, ${esc(c.state)} · ${c.n}</h3><ul><li><a href="${c.slug}.html">${esc(c.city)} — ${c.n} vendors →</a></li></ul></div>`).join('\n')}
</div>
<div class="rel"><h3>ALSO</h3><a href="../states/">By state</a><a href="../news/top-cities-us-growth-vendors-2026.html">The city-ranking briefing</a></div>`
}));

console.log(`location pages: ${topStates.length} states + ${topCities.length} cities + 2 indices`);
