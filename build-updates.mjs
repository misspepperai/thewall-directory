// Generates the "fresh feed" — news/updates/state-of-the-index-YYYY-MM.html briefings.
// Monthly cadence. Feeds Google News fresh-content signals + serves as a running changelog.
// UPDATES array lives in this file so historical briefings persist even after the DB moves on.
// Run: node build-updates.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const dateFmt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// Snapshot each month. Add a new entry at the top for each monthly briefing.
const UPDATES = [
{
  slug: 'state-of-the-index-2026-08', date: '2026-08-04',
  h: 'State of the index — August 2026: 2,286 US listings, 151 blocked domains, first month of public operation',
  dek: 'The Wall opened to the public on August 3, 2026 with 2,286 verified US growth-vendor listings across 10 disciplines. Here is what the index looks like on day one, what changed during pre-launch verification, and what buyers should expect from the monthly cadence going forward.',
  metrics: [
    { label: 'US LISTINGS (APPROVED)', value: '2,286' },
    { label: 'PENDING SUBMISSIONS', value: '0' },
    { label: 'BLOCKED DOMAINS', value: '151' },
    { label: 'DISCIPLINES COVERED', value: '10' },
    { label: 'REFERENCE PAGES', value: '18 briefings · 6 hubs · 15 entities · 204 glossary terms' }
  ],
  body: `
<h2>What the index looks like on day one</h2>
<p>${BRAND} launched with 2,286 US-based, machine-verified-live growth-services listings across ten disciplines: Sales, Marketing, SEO, Thought Leadership, Creative Strategy, Automation, Demand Gen, Content Marketing, Social Media Marketing, and AI Marketing. Every listing was live-verified before publication; every domain that failed was removed and blocklisted.</p>
<p>The distribution across pillars: Creative Strategy is the largest at 870 listings (38%); Marketing second at 550; SEO third at 226; Thought Leadership 193; Content Marketing 113; Sales 103; Social Media Marketing 90; Automation 59; Demand Gen 48; AI Marketing 34. Full breakdown in the <a href="../the-wall-launches-2286-us-growth-vendors.html">launch briefing</a>.</p>

<h2>What changed during pre-launch verification</h2>
<p>The index is defined as much by what was removed as by what was published. 696 candidate listings failed the verification pipeline before launch: 668 companies headquartered outside the United States and 28 whose websites failed liveness checks. All 696 domains are on the <em>blocked_domains</em> table — an automated re-scrape cannot silently reintroduce a domain removed for cause. Restoration requires deliberate editorial action.</p>
<p>The blocklist total now stands at 151 entries (some prior removals combined). This number will grow as periodic liveness sweeps catch domains that go dark post-launch.</p>

<h2>What's shipped alongside the listings</h2>
<p>The reference layer around the directory is deeper than the listings alone:</p>
<ul>
<li><strong>18 data briefings</strong> — original data journalism computed from the index itself. Rate distributions, minimum project sizes, team-size distributions, category age cohorts, geographic concentration, agency-vs-software mix, rate transparency by discipline. All in the <a href="../">Briefings section</a>.</li>
<li><strong>10 discipline pillar pages</strong> — one per category. What the wall is, what the discipline covers, how vendors work, real numbers, and questions buyers actually ask. Sourced from live Google PAA data with original answers.</li>
<li><strong>6 topic hub pages</strong> — buyer references on high-intent queries: marketing consultants, paid advertising platforms, B2B marketing agencies, social media management platforms, Google Local Service Ads, and the "digital marketing platform for small businesses" trend.</li>
<li><strong>15 platform entity pages</strong> — reference pages for the platforms that appear repeatedly in growth-vendor shortlists: HubSpot, Salesforce, Marketo, ActiveCampaign, Klaviyo, Mailchimp, Google Ads, Meta Ads, LinkedIn Campaign Manager, The Trade Desk, Ahrefs, Semrush, Segment, GA4, Outreach.</li>
<li><strong>Rate-benchmarking calculator</strong> — interactive tool showing where any hourly rate falls in the real distribution for a given discipline. At <a href="../../tools/rate-benchmark.html">tools/rate-benchmark.html</a>.</li>
<li><strong>204-term glossary</strong> — plain-English definitions of the working vocabulary of the growth-vendor market. DefinedTermSet schema; internal-linked from pillars, hubs, and entities.</li>
<li><strong>8 trust-foundation pages</strong> — about, contact, editorial policy, corrections process, AI disclosure, privacy, terms, accessibility. All truthful to actual site operation.</li>
</ul>

<h2>The monthly cadence going forward</h2>
<p>This is the first entry in what will be a monthly "state of the index" briefing published in the first week of each month. Each subsequent edition will report new listings added, listings removed for cause, notable data changes (major rate shifts, new categories reaching threshold), and what new reference material shipped since the last briefing.</p>
<p>The cadence exists for two reasons. First, buyers using the directory to build shortlists benefit from knowing what changed — the market moves and the reference should reflect it. Second, Google News eligibility (which ${BRAND} is submitting for in August) is easier to maintain when the publisher has a demonstrated regular publishing cadence, not sporadic activity.</p>

<h2>What to expect in September's edition</h2>
<p>Data points the September 2026 state-of-the-index will report on, once the numbers exist:</p>
<ul>
<li>Net listings added, removed, and enriched in August</li>
<li>Domain-blocklist growth (from periodic liveness sweeps)</li>
<li>New reference pages published (additional entity references, new hubs from the keyword pipeline)</li>
<li>First month of Google Search Console impression and click data if verification lands on schedule</li>
</ul>
<p>Companies wanting to submit for inclusion can do so through the <a href="../../">Submit a Listing</a> form on the atlas. Corrections and removal requests go through the <a href="../../contact.html">contact page</a> — verified requests are honored within two business days per the <a href="../../editorial-policy.html">editorial policy</a>.</p>`,
  rel: [
    ['/news/the-wall-launches-2286-us-growth-vendors.html', 'The launch briefing — 2,286 verified US growth vendors'],
    ['/news/how-the-wall-verifies-listings.html', 'How The Wall verified 2,286 listings and removed 696'],
    ['/entities/', 'The 15-platform entity reference'],
    ['/tools/rate-benchmark.html', 'Rate-benchmarking calculator']
  ]
}
];

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
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#686D75;--chrome-dk:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:820px;margin:0 auto;padding:0 24px}
  a{color:var(--cobalt)}
  .topbar{border-bottom:1px solid var(--stone)}
  .topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink);display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .kicker{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);padding:34px 0 0}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,40px);letter-spacing:-.02em;line-height:1.15;padding:10px 0 6px}
  .byline{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;color:var(--chrome);padding-bottom:4px}
  .byline b{color:var(--ink);font-weight:600}
  .dek{font-family:var(--serif);font-style:italic;font-size:17.5px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  ul{padding-left:22px;margin-bottom:12px}
  li{margin-bottom:6px}
  strong{color:var(--ink);font-weight:600}
  .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;border:1px solid var(--stone);border-radius:10px;background:#fff;padding:18px 22px;margin:18px 0}
  .metrics .m b{display:block;font-family:var(--mono);font-size:22px;font-weight:600;color:var(--ink);line-height:1.2}
  .metrics .m span{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:var(--chrome);margin-top:4px;display:block}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
  .idx-item{border-bottom:1px solid var(--stone);padding:20px 0}
  .idx-item .d{font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--chrome);margin-bottom:6px}
  .idx-item a{font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink);text-decoration:none;line-height:1.3}
  .idx-item a:hover{color:var(--cobalt)}
  .idx-item p{margin:8px 0 0;font-size:13.5px}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:820px}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  footer a:hover{color:var(--ink)}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}
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

mkdirSync(join(ROOT, 'news', 'updates'), { recursive: true });

for (const u of UPDATES) {
  const canonical = `${SITE}/news/updates/${u.slug}.html`;
  const bodyText = strip([u.dek, u.body].join(' '));
  const ld = [ORG_LD, {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: u.h, description: u.dek,
    datePublished: u.date, dateModified: u.date,
    author: [{ '@type': 'Organization', name: `${BRAND} Editorial Team`, url: `${SITE}/about.html` }],
    publisher: { '@type': 'Organization', name: BRAND, url: `${SITE}/` },
    mainEntityOfPage: canonical, url: canonical,
    articleSection: 'Fresh Feed', isAccessibleForFree: true,
    articleBody: bodyText.slice(0, 5000)
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Briefings', item: `${SITE}/news/` },
      { '@type': 'ListItem', position: 3, name: 'Updates', item: `${SITE}/news/updates/` },
      { '@type': 'ListItem', position: 4, name: u.h }
    ]
  }];

  const metricsHTML = `<div class="metrics">
${u.metrics.map(m => `<div class="m"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join('\n')}
</div>`;
  const relHTML = u.rel?.length
    ? `<div class="rel"><h3>RELATED</h3>${u.rel.map(([href, label]) => `<a href="${base(href, '../../')}">${esc(label)}</a>`).join('\n')}</div>` : '';

  function base(href, prefix) { return href.startsWith('http') ? href : prefix + href.replace(/^\//, ''); }

  const body = `
<div class="kicker">STATE OF THE INDEX</div>
<h1>${esc(u.h)}</h1>
<div class="byline">The Wall editorial team · ${dateFmt(u.date)}</div>
<p class="dek">${esc(u.dek)}</p>
${metricsHTML}
${u.body}
${relHTML}`;

  writeFileSync(join(ROOT, 'news', 'updates', `${u.slug}.html`),
    shell({ title: `${u.h} — ${BRAND}`, metaDesc: u.dek, canonical, ld, bodyHTML: body, base: '../../' }));
}

// updates index (feed of all monthly editions, newest first)
const idxLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: `Fresh Feed — Monthly Index Updates — ${BRAND}`,
  url: `${SITE}/news/updates/`,
  description: `Monthly state-of-the-index briefings from The Wall — what's been added, removed, and updated in the US growth-vendor directory.`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: UPDATES.map((u, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: `${SITE}/news/updates/${u.slug}.html`, name: u.h
    }))
  }
}];
const idxBody = `
<div class="kicker">BRIEFINGS</div>
<h1>Fresh Feed</h1>
<p class="dek">Monthly briefings on what changed in ${BRAND}'s index of US growth vendors — new listings, removals, data updates, and new reference material shipped. First-week-of-the-month cadence. ${UPDATES.length} edition${UPDATES.length === 1 ? '' : 's'} so far.</p>
${UPDATES.map(u => `<div class="idx-item">
  <div class="d">${dateFmt(u.date)}</div>
  <a href="${u.slug}.html">${esc(u.h)}</a>
  <p>${esc(u.dek)}</p>
</div>`).join('\n')}`;

writeFileSync(join(ROOT, 'news', 'updates', 'index.html'),
  shell({
    title: `Fresh Feed — Monthly Updates — ${BRAND}`,
    metaDesc: `Monthly state-of-the-index briefings from ${BRAND} — what's been added, removed, and updated in the US growth-vendor directory. ${UPDATES.length} edition${UPDATES.length === 1 ? '' : 's'} published.`,
    canonical: `${SITE}/news/updates/`,
    ld: idxLD, bodyHTML: idxBody, base: '../../'
  }));

console.log(`updates written: ${UPDATES.length} + index`);
