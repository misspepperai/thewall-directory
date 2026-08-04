// Generates /wins/{slug}.html case studies for Miss Pepper referral-network results.
// Template designed to accept a filled-in WIN object per client win.
// Run: node build-wins.mjs
//
// Publishing a new win:
// 1. Add a WIN entry below (see the TEMPLATE example).
// 2. Node build-wins.mjs.
// 3. Node build-pages.mjs --pages-only.
// 4. Git commit & push.
// The first 3 fields (slug, date, client) are all that's required to publish; the rest degrade gracefully.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dateFmt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// ---- WINS ARRAY ----
// TEMPLATE — copy and fill for each new win. Remove the `_template: true` line to publish.
const WINS = [
  {
    _template: true,
    slug: 'template-vendor-name-win',
    date: '2026-08-04',
    client: {
      name: 'Client Company Name',
      domain: 'client-domain.com',
      pillar: 'Marketing', // one of the 10 pillar names
      pillarSlug: 'marketing',
      stage: '$5M–$25M revenue', // rough scale for context
      location: 'City, ST'
    },
    partner: {
      // The vendor that sent the referral (Weapon 1 → Weapon 2 flip)
      name: 'Partner Vendor Name',
      domain: 'partner-domain.com',
      profileUrl: 'https://hitthewall.net/c/partner-domain.com.html' // link to their Wall listing
    },
    engagement: {
      // What Miss Pepper delivered
      service: 'AI Thought Leadership Program', // the flagship service
      monthlyRetainer: 3500, // dollars per month (for schema; not shown as USD if you don't want it exact)
      startedAt: '2026-06-15',
      lengthMonths: 3, // months of engagement at time of write-up
      dealSize: 10500 // total gross at write-up ($retainer × months)
    },
    problem: `The problem Client had at intake — one paragraph. What wall they hit, why they came looking, what the alternative would have been. Concrete. No generic "wanted to grow marketing".`,
    solution: `What Miss Pepper actually delivered — one to two paragraphs. Which parts of the flagship service kicked in, what got produced, cadence, what integrated with what. Concrete artifacts (X blog posts, Y social threads, Z audio episodes). No process fluff.`,
    outcomes: [
      // 3–6 outcomes, each with a metric where possible
      { metric: 'Metric name', value: 'Value', context: 'Baseline / comparison / why-this-matters' },
      { metric: 'Metric name', value: 'Value', context: 'Baseline / comparison / why-this-matters' }
    ],
    quote: {
      text: `A direct client quote — one to three sentences. Real language, not marketing copy. If the client hasn't approved a quote yet, omit this block entirely.`,
      author: 'Client Name',
      role: 'Client Title, Client Company'
    },
    referralCredit: {
      // The partnership economics that made this happen — the whole point of the case study
      direction: 'partner_to_us', // partner_to_us OR us_to_partner
      partnerShare: 0.20, // 20% for partner_to_us direction, 0.10 for us_to_partner
      partnerPayout: 2100 // dollars — first payout to the partner from this deal
    },
    editorialNote: `Optional context — what The Wall directory-editorial team notes about this win. Why it's worth reading beyond the numbers. Under 100 words.`
  }
];
// ---- end WINS ARRAY ----

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
  .wrap{max-width:780px;margin:0 auto;padding:0 24px}a{color:var(--cobalt)}
  .topbar{border-bottom:1px solid var(--stone)}.topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink);display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .kicker{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);padding:34px 0 0;text-transform:uppercase}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,38px);letter-spacing:-.02em;line-height:1.15;padding:10px 0 6px}
  .dek{font-family:var(--serif);font-style:italic;font-size:17px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:700px}
  .meta{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.14em;color:var(--chrome);text-transform:uppercase;margin:16px 0 0;padding-bottom:14px;border-bottom:1px solid var(--stone)}
  h2{font-family:var(--serif);font-weight:600;font-size:22px;letter-spacing:-.01em;margin:32px 0 10px}
  p,li{font-size:15px;line-height:1.72;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .fact{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:22px 0;border:1px solid var(--stone);border-radius:10px;background:#fff;overflow:hidden}
  .fact-side{padding:18px 20px;border-right:1px solid var(--stone)}
  .fact-side:last-child{border-right:none}
  .fact-side h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);text-transform:uppercase;margin-bottom:8px}
  .fact-side dl{font-size:13px}
  .fact-side dt{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.12em;color:var(--chrome);margin-top:10px}
  .fact-side dd{font-size:13px;color:var(--body);line-height:1.5}
  .outcomes{margin:16px 0}
  .outcome{display:grid;grid-template-columns:140px 1fr;gap:14px;padding:14px 16px;border:1px solid var(--stone);border-radius:8px;background:#fff;margin-bottom:10px}
  .outcome .val{font-family:var(--serif);font-weight:600;font-size:26px;color:var(--cobalt);line-height:1.1}
  .outcome .val small{display:block;font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;color:var(--chrome);text-transform:uppercase;margin-top:6px}
  .outcome .why{font-size:14px;color:var(--body);line-height:1.55;padding-top:4px}
  blockquote{border-left:3px solid var(--oxblood);padding:12px 22px;margin:24px 0;background:#fff;font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.5;color:var(--ink)}
  blockquote footer{border:0;padding:0;margin-top:12px;font-family:var(--sans);font-style:normal;font-size:12px;color:var(--chrome);letter-spacing:.02em;background:transparent;display:block}
  .referral{border:1px solid var(--cobalt);border-radius:10px;background:#f4f7fe;padding:20px 22px;margin:24px 0}
  .referral h3{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.16em;color:var(--cobalt);text-transform:uppercase;margin-bottom:10px}
  .referral p{margin-bottom:0;font-size:14px}
  .editorial{border-top:1px solid var(--stone);padding-top:18px;margin-top:32px}
  .editorial h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin-bottom:8px}
  .editorial p{font-style:italic;color:var(--body)}
  .cta{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:24px;margin:32px 0;text-align:center}
  .cta h3{font-family:var(--serif);font-size:19px;font-weight:600;color:var(--ink);margin-bottom:10px}
  .cta a{display:inline-block;padding:12px 24px;background:var(--cobalt);color:#fff;text-decoration:none;font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.14em;border-radius:6px;margin:8px 6px 0}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  footer a:hover{color:var(--ink)}
  @media (max-width:640px){.fact{grid-template-columns:1fr}.fact-side{border-right:none;border-bottom:1px solid var(--stone)}.fact-side:last-child{border-bottom:none}.outcome{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav class="topbar"><div class="wrap topbar-in">
  <a class="wordmark" href="../">${BRAND} <small>OPERATIONS ATLAS</small></a>
  <a class="back" href="./">MORE WINS →</a>
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

mkdirSync(join(ROOT, 'wins'), { recursive: true });

const publishable = WINS.filter(w => !w._template);
console.log(`WINS loaded: ${WINS.length} total, ${publishable.length} publishable`);

for (const w of publishable) {
  const canonical = `${SITE}/wins/${w.slug}.html`;
  const title = `How ${w.client.name} grew via the ${BRAND} referral network — ${BRAND}`;
  const metaDesc = `Case study: ${w.client.name} (${w.client.pillar}, ${w.client.stage}) engaged Miss Pepper AI's ${w.engagement.service} through The Wall's two-way referral network. Results in ${w.engagement.lengthMonths} months.`;

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' },
    { '@context': 'https://schema.org', '@type': 'Article',
      headline: `How ${w.client.name} grew via the ${BRAND} referral network`,
      datePublished: w.date, dateModified: w.date,
      url: canonical,
      author: { '@type': 'Organization', name: `${BRAND} Editorial Team`, url: `${SITE}/about.html` },
      publisher: { '@type': 'Organization', name: BRAND, url: `${SITE}/` },
      about: [
        { '@type': 'Organization', name: w.client.name, url: w.client.domain ? `https://${w.client.domain}` : undefined },
        { '@type': 'Organization', name: w.partner.name, url: w.partner.domain ? `https://${w.partner.domain}` : undefined }
      ],
      mainEntityOfPage: canonical
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Wins', item: `${SITE}/wins/` },
        { '@type': 'ListItem', position: 3, name: w.client.name }
      ]
    }
  ];

  const body = `
<div class="kicker">Referral win · ${esc(w.client.pillar)}</div>
<h1>How ${esc(w.client.name)} grew via the ${BRAND} referral network</h1>
<p class="dek">${esc(w.client.name)} (${esc(w.client.stage)}, ${esc(w.client.pillar)}) engaged Miss Pepper AI's ${esc(w.engagement.service)} through a Wall-network referral from ${esc(w.partner.name)}. Results in ${w.engagement.lengthMonths} months.</p>
<div class="meta">Published ${esc(dateFmt(w.date))} · Engagement began ${esc(dateFmt(w.engagement.startedAt))}</div>

<div class="fact">
  <div class="fact-side">
    <h3>Client</h3>
    <dl>
      <dt>Company</dt><dd>${esc(w.client.name)}</dd>
      <dt>Scale</dt><dd>${esc(w.client.stage)}</dd>
      <dt>Discipline</dt><dd>${esc(w.client.pillar)}</dd>
      <dt>Location</dt><dd>${esc(w.client.location)}</dd>
    </dl>
  </div>
  <div class="fact-side">
    <h3>Referring partner</h3>
    <dl>
      <dt>Vendor</dt><dd><a href="${esc(w.partner.profileUrl)}">${esc(w.partner.name)}</a></dd>
      <dt>Referral direction</dt><dd>${w.referralCredit.direction === 'partner_to_us' ? 'Partner → Miss Pepper' : 'Miss Pepper → Partner'}</dd>
      <dt>Partner share</dt><dd>${(w.referralCredit.partnerShare * 100).toFixed(0)}% of monthly retainer</dd>
      <dt>First payout</dt><dd>$${w.referralCredit.partnerPayout.toLocaleString()}</dd>
    </dl>
  </div>
</div>

<h2>The problem</h2>
<p>${esc(w.problem)}</p>

<h2>What Miss Pepper delivered</h2>
<p>${esc(w.solution)}</p>

${w.outcomes.length ? `<h2>What changed</h2>
<div class="outcomes">
${w.outcomes.map(o => `<div class="outcome">
  <div class="val">${esc(o.value)}<small>${esc(o.metric)}</small></div>
  <div class="why">${esc(o.context)}</div>
</div>`).join('\n')}
</div>` : ''}

${w.quote?.text ? `<blockquote>
${esc(w.quote.text)}
<footer>— ${esc(w.quote.author)}${w.quote.role ? `, ${esc(w.quote.role)}` : ''}</footer>
</blockquote>` : ''}

<div class="referral">
  <h3>THE REFERRAL ECONOMICS</h3>
  <p>${w.referralCredit.direction === 'partner_to_us'
    ? `${esc(w.partner.name)} sent this client to Miss Pepper via the two-way Wall referral network. On every dollar of monthly retainer, <strong>${esc(w.partner.name)} keeps ${(w.referralCredit.partnerShare * 100).toFixed(0)}%</strong> for as long as ${esc(w.client.name)} stays. First payout on this deal: <strong>$${w.referralCredit.partnerPayout.toLocaleString()}</strong>. The whole reason The Wall exists.`
    : `Miss Pepper sent this client to ${esc(w.partner.name)} via the two-way Wall referral network. On every dollar of monthly retainer, <strong>Miss Pepper takes ${(w.referralCredit.partnerShare * 100).toFixed(0)}%</strong>. The other 90% stays with ${esc(w.partner.name)}. This is the "us → partner" direction; the "partner → us" direction pays partners 20%.`}</p>
</div>

${w.editorialNote ? `<div class="editorial">
  <h3>EDITORIAL NOTE</h3>
  <p>${esc(w.editorialNote)}</p>
</div>` : ''}

<div class="cta">
  <h3>Want to send a referral (or receive one)?</h3>
  <p style="font-size:14px;color:var(--body);margin-bottom:8px">The two-way Wall network splits 10/20: send us a client → you keep 20% for as long as they stay. We send you a client → we take 10%. Your side is bigger on purpose.</p>
  <a href="../partner.html">READ THE PARTNERSHIP TERMS</a>
</div>`;

  writeFileSync(join(ROOT, 'wins', `${w.slug}.html`), shell({ title, metaDesc, canonical, ld, bodyHTML: body }));
}

// Wins index — always present, even with zero wins yet.
const indexLD = [
  { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' },
  { '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `Referral-Network Wins — ${BRAND}`,
    url: `${SITE}/wins/`,
    description: `Case studies of Miss Pepper AI clients acquired through the two-way ${BRAND} referral network.`,
    mainEntity: { '@type': 'ItemList', itemListElement: publishable.map((w, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/wins/${w.slug}.html`, name: w.client.name })) }
  }
];
writeFileSync(join(ROOT, 'wins', 'index.html'), shell({
  title: `Referral-Network Wins — ${BRAND}`,
  metaDesc: `Case studies of Miss Pepper AI clients acquired through the two-way ${BRAND} referral network. Every win credits the referring partner and publishes the payout economics.`,
  canonical: `${SITE}/wins/`,
  ld: indexLD,
  bodyHTML: `
<div class="kicker">Reference · Referral Wins</div>
<h1>Referral-network wins</h1>
<p class="dek">Miss Pepper AI clients acquired through the two-way ${BRAND} referral network. Every win names the referring partner and publishes what they earned. Transparency is the point.</p>

${publishable.length ? `
<ul style="list-style:none;padding:0">
${publishable.map(w => `<li style="border-bottom:1px solid var(--stone);padding:16px 0"><a href="${w.slug}.html" style="text-decoration:none;color:var(--ink);font-family:var(--serif);font-weight:600;font-size:19px">${esc(w.client.name)}</a><br><span style="font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:var(--chrome);text-transform:uppercase">${esc(w.client.pillar)} · ${esc(dateFmt(w.date))} · Referred by ${esc(w.partner.name)}</span></li>`).join('\n')}
</ul>
` : `
<div style="border:1px solid var(--stone);border-radius:10px;background:#fff;padding:32px 28px;margin:20px 0">
  <p style="font-family:var(--serif);font-size:17px;color:var(--ink);margin-bottom:10px"><strong>The first referral wins are in flight.</strong></p>
  <p style="font-size:14px;color:var(--body)">${BRAND}'s referral network launched in ${dateFmt('2026-08-04')}. The first cohort of Weapon 1 (free listing acknowledgment) → Weapon 2 (two-way flip) outreach is running; the first case studies land here when clients cross their 90-day mark and can speak to results. Check back — or, better, <a href="../partner.html">become a partner</a> and be one of the first wins.</p>
</div>
`}

<div class="cta">
  <h3>The two-way deal, in a sentence</h3>
  <p style="font-size:14px;color:var(--body);margin-bottom:8px">Send Miss Pepper a client → you keep <strong>20%</strong>. We send you a client → we take <strong>10%</strong>. Your side is bigger on purpose. Both sides pay every month the client stays.</p>
  <a href="../partner.html">READ THE PARTNERSHIP TERMS</a>
</div>
`
}));

console.log(`wins pages: ${publishable.length} + 1 index`);
