// Build static, schema-complete pages for every approved record: c/{domain}.html
// + sitemap.xml + robots.txt. Also persists per-record qa jsonb + speakable fields to Supabase.
// The Q&A/about engine is EXTRACTED from index.html at build time so the SPA stays the single source of truth.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SB = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const SITE = 'https://hitthewall.net';
const HDRS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
// Per-category accent colours retired 2026-08-04 (STYLE-GUIDE Fix 2): six of the ten
// were indistinguishable (validator: worst pair dE 5.0 normal vision), so the accent
// carried no information. Category identity is carried by the mono kicker text instead.

// ---- extract the enrichment engine from index.html (esc defined first; engine references it) ----
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
const start = idx.indexOf('/* ---------- enrichment content');
const end = idx.indexOf('/* ---------- detail route');
if (start < 0 || end < 0) throw new Error('engine markers not found in index.html');
const engine = idx.slice(start, end);
// eslint-disable-next-line no-eval
const engineExports = new Function('esc', `${engine}
  return { has, ownWords, ownWordsSrc, nounOf, hqLine, an, subNoun, aboutHTML, quoteHTML, quickFactsHTML, qaPairs, qaHTML };`)(esc);
const { has, ownWords, nounOf, hqLine, an, subNoun, aboutHTML, quoteHTML, quickFactsHTML, qaPairs, qaHTML } = engineExports;

// ---- speakable composition (Layer 4b, per-record, fact-fed) ----
function speakables(x) {
  const hq = hqLine(x);
  const hasFacts = has(x.min_project_size) || has(x.avg_hourly_rate) || has(x.clutch_rating);
  const what = `${x.name} is ${an(subNoun(x))} ${subNoun(x)} in The Wall's ${x.category} index. Executives can review its capabilities${hasFacts ? ', published engagement data,' : ''} and start contact directly through its website at ${x.domain}.`;
  const details = `${x.name}${hq ? `, based in ${hq},` : ''} serves companies past $5M in revenue with 25 or more employees, typically working with ${x.target_executive_icp || 'senior executives'} on ${(x.bottleneck_solved || 'growth bottlenecks').toLowerCase()}.`;
  const bits = [];
  if (has(x.year_established)) bits.push(`operating since ${x.year_established}`);
  if (has(x.team_size)) bits.push(`listed team size ${x.team_size}`);
  if (has(x.min_project_size)) bits.push(`minimum project ${x.min_project_size}`);
  if (has(x.avg_hourly_rate)) bits.push(`average rate ${x.avg_hourly_rate}`);
  if (has(x.clutch_rating) && has(x.clutch_reviews)) bits.push(`rated ${x.clutch_rating} out of 5 across ${x.clutch_reviews} Clutch reviews`);
  const facts = bits.length
    ? `Key facts about ${x.name}: ${bits.join('; ')}.`
    : `Key facts about ${x.name}: engagement structures in this category include monthly retainers, project contracts, and advisory arrangements.`;
  return { what, details, facts };
}

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'The Wall', url: `${SITE}/`, email: 'support@misspepper.ai',
  description: 'An operations atlas of US-based companies that solve sales, marketing, SEO, thought leadership, creative, automation, and demand generation problems for established businesses.',
  sameAs: []
};

// ---- JSON-LD (static: FULL 20-item FAQPage + speakable pointing at the three blocks) ----
function jsonld(x, pairs, sp) {
  return [
    ORG_LD,
    {
      '@context': 'https://schema.org', '@type': x.listing_type === 'Software Provider' ? 'SoftwareApplication' : 'ProfessionalService',
      name: x.name, url: `https://${x.domain}`, description: ownWords(x) || x.description,
      ...(x.listing_type === 'Software Provider' ? { applicationCategory: x.subcategory, operatingSystem: 'Web' } : {}),
      ...(has(x.phone_number) ? { telephone: x.phone_number } : {}),
      ...(has(x.year_established) && /^\d{4}$/.test(x.year_established) ? { foundingDate: x.year_established } : {}),
      ...(has(x.hq_city) ? { address: { '@type': 'PostalAddress', ...(has(x.street_address) ? { streetAddress: x.street_address } : {}), addressLocality: x.hq_city, ...(has(x.hq_state) ? { addressRegion: x.hq_state } : {}), ...(has(x.zip_code) ? { postalCode: x.zip_code } : {}), addressCountry: 'US' } } : {}),
      knowsAbout: [x.category, x.subcategory]
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    },
    {
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: `${x.name} — The Wall Directory`,
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.sp-what', '.sp-details', '.sp-facts'] }
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'The Wall', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: x.category, item: `${SITE}/?c=${encodeURIComponent(x.domain)}` },
        { '@type': 'ListItem', position: 3, name: x.name, item: `${SITE}/c/${x.domain}.html` }
      ]
    }
  ];
}

// ---- static page shell (trimmed atlas design system) ----
// "Is this your firm?" block — the only conversion path on a /c/ page.
// Vendors land here by self-searching; this turns that into a Weapon 1 reply.
function claimHTML(x) {
  const mail = (subject, body) =>
    `mailto:support@misspepper.ai?subject=${encodeURIComponent(subject)}&amp;body=${encodeURIComponent(body)}`;
  const claim = mail(
    `Claim listing: ${x.domain}`,
    `Hi — I'm with ${x.name} (${x.domain}).\n\n`
    + `I'd like to claim our listing on The Wall and I'm in on the two-way referral deal:\n`
    + `we keep 20% of what we send you, you take 10% of what you send us.\n\n`
    + `Name:\nRole:\nBest email:\nAnything on the listing that needs fixing:\n`
  );
  const fix = mail(
    `Correction: ${x.domain}`,
    `Hi — I'm with ${x.name} (${x.domain}).\n\n`
    + `Something on our listing at ${SITE}/c/${x.domain}.html needs correcting:\n\n`
    + `What's wrong:\nWhat it should say:\nSource we can verify it against:\n`
  );
  return `<section class="claim">
    <div class="claim-k">IS THIS YOUR FIRM?</div>
    <h2>Claim this listing — and keep 20% of every client you send us</h2>
    <p>${esc(x.name)} is listed here for free, compiled from public sources. There is no fee to
    claim it and no pay-to-play tier. Claiming lets you correct the record and opens a two-way
    referral arrangement that runs in your favour by design.</p>
    <div class="deal">
      <div><b>You keep 20%</b><span>Of any client you send to Miss Pepper AI.</span></div>
      <div><b>We take 10%</b><span>Of any client we send to ${esc(x.name)}.</span></div>
    </div>
    <div class="claim-acts">
      <a class="a-pri" href="${claim}">CLAIM &amp; COUNT ME IN →</a>
      <a class="a-sec" href="${fix}">CORRECT THIS LISTING</a>
      <a class="a-sec" href="../partner.html">READ THE FULL TERMS</a>
    </div>
    <p class="claim-fine">NO COST TO CLAIM · NO EXCLUSIVITY · CANCEL BY REPLYING &ldquo;STOP&rdquo; ·
    LISTING STAYS UP EITHER WAY &mdash; INCLUSION IS EDITORIAL, NOT PURCHASED</p>
  </section>`;
}

function pageHTML(x, pairs, sp) {
  const metaDesc = esc(((x.site_description || x.description) + '').slice(0, 158));
  const specRows = [
    ['DOMAIN', x.domain], ['CATEGORY', x.category.toUpperCase()], ['SPECIALTY', x.subcategory.toUpperCase()],
    ['TYPE', (x.listing_type || 'PROVIDER').toUpperCase()], ['SOLVES', (x.bottleneck_solved || '—').toUpperCase()],
    ['TYPICAL BUYER', (x.target_executive_icp || '—').toUpperCase()], ['CLIENT FIT', x.client_revenue_fit || '$5M-$50M+'],
    ...(has(x.hq_city) ? [['HQ', hqLine(x).toUpperCase()]] : []),
    ...(has(x.year_established) ? [['FOUNDED', x.year_established]] : []),
    ...(has(x.team_size) ? [['TEAM SIZE', x.team_size]] : []),
    ...(has(x.min_project_size) ? [['MIN PROJECT', x.min_project_size]] : []),
    ...(has(x.avg_hourly_rate) ? [['AVG RATE', x.avg_hourly_rate]] : []),
    ...(has(x.phone_number) ? [['PHONE', x.phone_number]] : []),
    ...(has(x.clutch_rating) ? [['CLUTCH RATING', `${x.clutch_rating}/5${has(x.clutch_reviews) ? ` · ${x.clutch_reviews} REVIEWS` : ''}`]] : []),
    ['STATUS', 'LISTED']
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(x.name)} — ${esc(x.subcategory)} | The Wall</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${SITE}/c/${esc(x.domain)}.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(jsonld(x, pairs, sp))}</script>
<style>
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#686D75;--chrome-dk:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:920px;margin:0 auto;padding:0 24px}
  a{color:inherit}
  .topbar{border-bottom:1px solid var(--stone)}
  .topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .crumb{font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--chrome);padding:26px 0 0}
  .crumb a{text-decoration:none;color:var(--chrome)} .crumb a:hover{color:var(--cobalt)}
  .head{display:flex;align-items:center;gap:18px;padding:18px 0 0}
  .logo{width:72px;height:72px;border-radius:13px;border:1px solid var(--stone);background:#fff;object-fit:contain;padding:9px}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(30px,5vw,42px);letter-spacing:-.02em;line-height:1.03}
  .sub{font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.12em;color:var(--cobalt);margin-top:4px;display:block}
  .desc{margin-top:20px;font-size:16px;line-height:1.7;color:var(--body)}
  .ownquote{margin-top:24px;position:relative;padding:4px 0 4px 24px;border-left:2px solid var(--oxblood)}
  .ownquote p{font-family:var(--serif);font-style:italic;font-weight:500;font-size:18.5px;line-height:1.5}
  .ownquote cite{display:block;margin-top:9px;font-family:var(--mono);font-style:normal;font-size:8.5px;font-weight:600;letter-spacing:.14em;color:var(--chrome)}
  .cta{display:inline-block;margin-top:26px;font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.12em;color:#fff;background:var(--cobalt);border-radius:5px;padding:13px 22px;text-decoration:none}
  .cta:hover{background:var(--oxblood)}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:34px 0 12px}
  .speak{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 20px;margin-top:8px}
  .speak p{font-size:13.5px;line-height:1.65;color:var(--body);padding:8px 0;border-bottom:1px solid var(--stone-lt)}
  .speak p:last-child{border-bottom:0}
  .about p{font-size:14.5px;line-height:1.7;color:var(--body);margin-bottom:12px}
  .qf{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:14px 20px 6px}
  .qf div{display:flex;gap:14px;padding:9px 0;border-bottom:1px solid var(--stone-lt)}
  .qf div:last-child{border-bottom:0}
  .qf dt{font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.12em;color:var(--chrome);min-width:110px;padding-top:3px}
  .qf dd{font-size:13px;line-height:1.55;color:var(--body)}
  details{border:1px solid var(--stone);border-radius:8px;background:#fff;margin-bottom:8px;overflow:hidden}
  summary{cursor:pointer;padding:12px 15px;font-size:13.5px;font-weight:600;list-style:none;display:flex;align-items:baseline;gap:11px}
  summary::-webkit-details-marker{display:none}
  summary .qno{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--chrome);letter-spacing:.08em}
  summary::after{content:'+';font-family:var(--mono);color:var(--cobalt);margin-left:auto}
  details[open] summary::after{content:'–'}
  details[open]{border-color:var(--cobalt)}
  details p{padding:11px 15px 13px 41px;font-size:13px;line-height:1.65;color:var(--body)}
  .spec{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:6px 18px;margin-top:8px}
  .spec div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--stone-lt)}
  .spec div:last-child{border-bottom:0}
  .spec dt{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:var(--chrome)}
  .spec dd{font-family:var(--mono);font-size:10px;font-weight:600;text-align:right;overflow-wrap:anywhere}
  footer{border-top:1px solid var(--stone);margin-top:44px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome)}
  .claim{margin-top:40px;border:1px solid var(--stone);border-left:3px solid var(--cobalt);border-radius:10px;background:#fff;padding:22px 24px}
  .claim-k{font-family:var(--mono);font-size:8.5px;font-weight:600;letter-spacing:.16em;color:var(--cobalt)}
  .claim h2{margin:8px 0 10px;font-size:22px}
  .claim p{font-size:14px;line-height:1.7;color:var(--body)}
  .deal{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 4px}
  .deal div{flex:1 1 220px;border:1px solid var(--stone);border-radius:8px;background:var(--stone-lt);padding:13px 15px}
  .deal b{display:block;font-family:var(--mono);font-size:19px;font-weight:600;color:var(--oxblood)}
  .deal span{display:block;margin-top:4px;font-size:12.5px;line-height:1.55;color:var(--body)}
  .claim-acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  .claim-acts a{font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-decoration:none;border-radius:5px;padding:12px 18px}
  .a-pri{color:#fff;background:var(--cobalt)} .a-pri:hover{background:var(--oxblood)}
  .a-sec{color:var(--ink);background:#fff;border:1px solid var(--stone)} .a-sec:hover{border-color:var(--cobalt);color:var(--cobalt)}
  .claim-fine{margin-top:14px;font-family:var(--mono);font-size:9px;letter-spacing:.06em;color:var(--chrome);line-height:1.7}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}
</style>
</head>
<body>
<nav class="topbar"><div class="wrap topbar-in">
  <a class="wordmark" href="../">The Wall <small>OPERATIONS ATLAS</small></a>
  <a class="back" href="../?c=${encodeURIComponent(x.domain)}">OPEN IN ATLAS →</a>
</div></nav>
<main class="wrap">
  <div class="crumb"><a href="../">INDEX</a> / <a href="../?c=${encodeURIComponent(x.domain)}">${esc(x.category.toUpperCase())}</a> / ${esc(x.name.toUpperCase())}</div>
  <div class="head">
    <img class="logo" alt="${esc(x.name)} logo" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(x.domain)}&sz=128">
    <div><h1>${esc(x.name)}</h1><span class="sub">${esc(x.category.toUpperCase())} / ${esc(x.subcategory.toUpperCase())}</span></div>
  </div>
  <p class="desc">${esc(x.description)}</p>
  ${quoteHTML(x)}
  <a class="cta" href="https://${esc(x.domain)}" target="_blank" rel="noopener nofollow">VISIT WEBSITE ↗</a>

  <h2>Summary</h2>
  <div class="speak">
    <p class="sp-what">${esc(sp.what)}</p>
    <p class="sp-details">${esc(sp.details)}</p>
    <p class="sp-facts">${esc(sp.facts)}</p>
  </div>

  ${aboutHTML(x).replace('class="d-about"', 'class="about"')}

  <h2>Quick facts</h2>
  ${quickFactsHTML(x).replace(/<div class="qf-wrap"><h2>Quick facts<\/h2><dl>/, '<dl class="qf">').replace(/<\/dl><\/div>$/, '</dl>').replaceAll('class="qf-row"', '')}

  <h2>Questions &amp; answers</h2>
  ${pairs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span class="qno">Q.${String(i+1).padStart(2,'0')}</span>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}

  <h2>Data sheet</h2>
  <dl class="spec">${specRows.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(String(d))}</dd></div>`).join('')}</dl>

  ${claimHTML(x)}
</main>
<footer><div class="wrap">
  <span>INDEPENDENT DIRECTORY · COMPILED FROM PUBLIC SOURCES · NOT AN ENDORSEMENT</span>
  <span><a href="../">ATLAS</a> · <a href="../about.html">ABOUT</a> · <a href="../editorial-policy.html">EDITORIAL</a> · <a href="../privacy.html">PRIVACY</a> · <a href="../terms.html">TERMS</a> · <a href="../contact.html">CONTACT</a></span>
</div></footer>
<script src="/nav.js"></script>
</body>
</html>`;
}

// ---- main ----
const run = async () => {
  let rows = [], from = 0;
  const FIELDS = 'name,domain,category,subcategory,description,listing_type,bottleneck_solved,target_executive_icp,client_revenue_fit,site_description,clutch_bio,services_list,year_established,min_project_size,avg_hourly_rate,team_size,hq_city,hq_state,street_address,zip_code,phone_number,clutch_rating,clutch_reviews,enriched_at';
  while (true) {
    const r = await fetch(`${SB}/rest/v1/directory_companies?select=${FIELDS}&status=eq.approved&order=domain.asc&offset=${from}&limit=1000`, { headers: HDRS });
    if (!r.ok) throw new Error(`fetch ${r.status}`);
    const page = await r.json();
    rows = rows.concat(page);
    if (page.length < 1000) break;
    from += 1000;
  }
  console.log(`rows: ${rows.length}`);

  mkdirSync(join(ROOT, 'c'), { recursive: true });
  const urls = [];
  const patches = [];
  for (const x of rows) {
    const pairs = qaPairs(x);
    const sp = speakables(x);
    writeFileSync(join(ROOT, 'c', `${x.domain}.html`), pageHTML(x, pairs, sp));
    urls.push(`${SITE}/c/${x.domain}.html`);
    patches.push({
      domain: x.domain,
      body: {
        qa: pairs.map(([q, a]) => ({ q, a })),
        speakable_what_you_find: sp.what,
        speakable_listing_details: sp.details,
        speakable_quick_facts: sp.facts
      }
    });
  }
  console.log(`pages written: ${urls.length}`);

  // sitemap.xml + HTML sitemap + robots + .nojekyll
  const today = new Date().toISOString().slice(0, 10);
  const TRUST = ['about','contact','editorial-policy','ai-policy','disclosures','privacy','terms','accessibility'];
  const NEWS = existsSync(join(ROOT, 'news')) ? readdirSync(join(ROOT, 'news')).filter(f => f.endsWith('.html')) : [];
  const PILLARS = existsSync(join(ROOT, 'pillars')) ? readdirSync(join(ROOT, 'pillars')).filter(f => f.endsWith('.html')) : [];
  const HUBS = existsSync(join(ROOT, 'hubs')) ? readdirSync(join(ROOT, 'hubs')).filter(f => f.endsWith('.html')) : [];
  const ENTITIES = existsSync(join(ROOT, 'entities')) ? readdirSync(join(ROOT, 'entities')).filter(f => f.endsWith('.html')) : [];
  const TOOLS = existsSync(join(ROOT, 'tools')) ? readdirSync(join(ROOT, 'tools')).filter(f => f.endsWith('.html')) : [];
  const UPDATES = existsSync(join(ROOT, 'news/updates')) ? readdirSync(join(ROOT, 'news/updates')).filter(f => f.endsWith('.html')) : [];
  const REPORT = existsSync(join(ROOT, 'report')) ? readdirSync(join(ROOT, 'report')).filter(f => f.endsWith('.html')) : [];
  const BADGE = existsSync(join(ROOT, 'badge')) ? readdirSync(join(ROOT, 'badge')).filter(f => f.endsWith('.html')) : [];
  const STATES = existsSync(join(ROOT, 'states')) ? readdirSync(join(ROOT, 'states')).filter(f => f.endsWith('.html')) : [];
  const CITIES = existsSync(join(ROOT, 'cities')) ? readdirSync(join(ROOT, 'cities')).filter(f => f.endsWith('.html')) : [];
  const COMPARE = existsSync(join(ROOT, 'compare')) ? readdirSync(join(ROOT, 'compare')).filter(f => f.endsWith('.html')) : [];
  const QUESTIONS = existsSync(join(ROOT, 'questions')) ? readdirSync(join(ROOT, 'questions')).filter(f => f.endsWith('.html')) : [];
  const WINS = existsSync(join(ROOT, 'wins')) ? readdirSync(join(ROOT, 'wins')).filter(f => f.endsWith('.html')) : [];
  const DATA_HAS_INDEX = existsSync(join(ROOT, 'data', 'index.html'));
  const FIND = existsSync(join(ROOT, 'find')) ? readdirSync(join(ROOT, 'find')).filter(f => f.endsWith('.html')) : [];
  const PRESS_HAS = existsSync(join(ROOT, 'press.html'));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `<url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq></url>\n` +
    `<url><loc>${SITE}/sitemap.html</loc><lastmod>${today}</lastmod></url>\n` +
    TRUST.map(s => `<url><loc>${SITE}/${s}.html</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    NEWS.map(f => `<url><loc>${SITE}/news/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod>${f === 'index.html' ? '<changefreq>weekly</changefreq>' : ''}</url>`).join('\n') + '\n' +
    (existsSync(join(ROOT, 'glossary.html')) ? `<url><loc>${SITE}/glossary.html</loc><lastmod>${today}</lastmod></url>\n` : '') +
    PILLARS.map(f => `<url><loc>${SITE}/pillars/${f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    HUBS.map(f => `<url><loc>${SITE}/hubs/${f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    ENTITIES.map(f => `<url><loc>${SITE}/entities/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    TOOLS.map(f => `<url><loc>${SITE}/tools/${f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    UPDATES.map(f => `<url><loc>${SITE}/news/updates/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq></url>`).join('\n') + '\n' +
    REPORT.map(f => `<url><loc>${SITE}/report/${f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    BADGE.map(f => `<url><loc>${SITE}/badge/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    STATES.map(f => `<url><loc>${SITE}/states/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    CITIES.map(f => `<url><loc>${SITE}/cities/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    COMPARE.map(f => `<url><loc>${SITE}/compare/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    QUESTIONS.map(f => `<url><loc>${SITE}/questions/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    WINS.map(f => `<url><loc>${SITE}/wins/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    (DATA_HAS_INDEX ? `<url><loc>${SITE}/data/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq></url>\n` : '') +
    FIND.map(f => `<url><loc>${SITE}/find/${f === 'index.html' ? '' : f}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n' +
    (PRESS_HAS ? `<url><loc>${SITE}/press.html</loc><lastmod>${today}</lastmod></url>\n` : '') +
    urls.map(u => `<url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>';
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  writeFileSync(join(ROOT, '.nojekyll'), '');

  // HTML sitemap (crawlable index page; passes internal PageRank)
  const CATS_ORDER = ['Sales','Marketing','SEO','Thought Leadership','Creative Strategy','Automation','Demand Gen','Content Marketing','Social Media Marketing','AI Marketing'];
  const byCat = Object.fromEntries(CATS_ORDER.map(c => [c, []]));
  for (const x of rows) (byCat[x.category] || (byCat[x.category] = [])).push(x);
  const secHTML = CATS_ORDER.filter(c => byCat[c]?.length).map((c, i) => `
  <h2><span class="no">${String(i+1).padStart(2,'0')}</span> ${esc(c)} <span class="ct">${byCat[c].length}</span></h2>
  <ul>${byCat[c].map(x => `<li><a href="c/${esc(x.domain)}.html">${esc(x.name)}</a></li>`).join('')}</ul>`).join('\n');
  writeFileSync(join(ROOT, 'sitemap.html'), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Site Index — The Wall</title>
<meta name="description" content="Complete index of all ${rows.length} companies listed in The Wall directory, by category.">
<link rel="canonical" href="${SITE}/sitemap.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,600;6..72,700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ORG_LD)}</script>
<style>
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#686D75;--chrome-dk:#85898F;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
  .topbar{border-bottom:1px solid var(--stone)}
  .topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  h1{font-family:var(--serif);font-weight:600;font-size:34px;letter-spacing:-.02em;padding:34px 0 4px}
  .sub{font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--chrome)}
  h2{font-family:var(--serif);font-weight:600;font-size:20px;margin:28px 0 10px;border-bottom:1px solid var(--stone);padding-bottom:8px}
  h2 .no{font-family:var(--mono);font-size:10px;color:var(--cobalt);letter-spacing:.12em;margin-right:6px}
  h2 .ct{font-family:var(--mono);font-size:10px;color:var(--chrome);margin-left:6px}
  ul{list-style:none;columns:3;column-gap:28px}
  li{margin-bottom:5px;break-inside:avoid}
  li a{font-size:13px;color:var(--ink);text-decoration:none}
  li a:hover{color:var(--cobalt);text-decoration:underline}
  footer{border-top:1px solid var(--stone);margin-top:44px;padding:20px 0 40px}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  @media(max-width:800px){ul{columns:2}}@media(max-width:520px){ul{columns:1}}
</style>
</head>
<body>
<nav class="topbar"><div class="wrap topbar-in"><a class="wordmark" href="./">The Wall</a><a class="back" href="./">BROWSE THE ATLAS →</a></div></nav>
<main class="wrap">
<h1>Site index</h1>
<p class="sub">ALL ${rows.length} LISTINGS BY SECTOR · <a href="about.html" style="color:var(--cobalt)">ABOUT</a> · <a href="editorial-policy.html" style="color:var(--cobalt)">EDITORIAL POLICY</a></p>
${secHTML}
</main>
<footer><div class="wrap"><span>© The Wall · <a href="privacy.html">PRIVACY</a> · <a href="terms.html">TERMS</a> · <a href="contact.html">CONTACT</a></span></div></footer>
<script src="/nav.js"></script>
</body>
</html>`);
  console.log('sitemap.xml + sitemap.html + robots + .nojekyll written');

  // persist qa + speakables to DB (concurrency 12) — skip with --pages-only
  if (process.argv.includes('--pages-only')) { console.log('pages-only: skipping DB persist'); return; }
  let ok = 0, fail = 0, i = 0;
  async function worker() {
    while (i < patches.length) {
      const p = patches[i++];
      try {
        const r = await fetch(`${SB}/rest/v1/directory_companies?domain=eq.${encodeURIComponent(p.domain)}`, {
          method: 'PATCH', headers: { ...HDRS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify(p.body)
        });
        r.ok ? ok++ : fail++;
      } catch { fail++; }
      if ((ok + fail) % 250 === 0) console.log(`patched ${ok + fail}/${patches.length}`);
    }
  }
  await Promise.all(Array.from({ length: 12 }, worker));
  console.log(`DB patched ok=${ok} fail=${fail}`);
};
run().catch(e => { console.error(e); process.exit(1); });
