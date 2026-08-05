// Generates /questions/{slug}.html for each PAA question.
// Source: data/paa-consolidated.json (vendored in-repo so the build is reproducible;
// was previously read from a Windows scratchpad path that no longer exists).
// Each page: focused answer + 3 related questions in the same pillar + cross-links to pillar/hubs.
// Run: node build-questions.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';
const SRC = join(ROOT, 'data', 'paa-consolidated.json');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const pillarPage = ps => `../pillars/${ps === 'analytics-attribution' ? 'analytics-attribution' : ps}.html`;

const ORG_LD = { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' };

const rows = JSON.parse(readFileSync(SRC, 'utf8'));
console.log(`loaded ${rows.length} PAA rows`);

// Assign each row a slug + rank within its pillar
const byPillar = {};
for (const r of rows) {
  r.slug = slug(r.q);
  (byPillar[r.pillar] ||= []).push(r);
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
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#686D75;--chrome-dk:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:720px;margin:0 auto;padding:0 24px}a{color:var(--cobalt)}
  .topbar{border-bottom:1px solid var(--stone)}.topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink);display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .kicker{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);padding:34px 0 0;text-transform:uppercase}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(24px,4vw,34px);letter-spacing:-.02em;line-height:1.2;padding:10px 0 6px}
  h2{font-family:var(--serif);font-weight:600;font-size:18px;letter-spacing:-.01em;margin:26px 0 8px}
  p,li{font-size:15px;line-height:1.72;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .answer{padding:14px 0;border-top:1px solid var(--stone);border-bottom:1px solid var(--stone);margin:14px 0 22px}
  .answer p{font-family:var(--serif);font-size:17px;line-height:1.6;color:var(--ink)}
  .rel{margin:28px 0 0;border-top:1px solid var(--stone);padding-top:16px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:15px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:6px}
  .rel a:hover{color:var(--cobalt)}
  .meta{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--chrome);margin-top:20px;text-transform:uppercase}
  .meta a{color:var(--cobalt);text-decoration:none}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
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
<script src="/nav.js"></script>
</body>
</html>`;
}

mkdirSync(join(ROOT, 'questions'), { recursive: true });

let count = 0;
for (const r of rows) {
  const canonical = `${SITE}/questions/${r.slug}.html`;
  const related = (byPillar[r.pillar] || []).filter(x => x.slug !== r.slug).slice(0, 5);
  const answerHtml = r.a
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/<a href="\.\.\/\.\.\//g, '<a href="../').trim()}</p>`)
    .join('\n');
  const ld = [ORG_LD, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: { '@type': 'Question', name: r.q, acceptedAnswer: { '@type': 'Answer', text: r.a.replace(/<[^>]+>/g, '') } }
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Questions', item: `${SITE}/questions/` },
      { '@type': 'ListItem', position: 3, name: r.q }
    ]
  }];
  const body = `
<div class="kicker">Question · ${esc(r.pillar)}</div>
<h1>${esc(r.q)}</h1>
<div class="answer">
${answerHtml}
</div>
<h2>Why this matters</h2>
<p>This question shows up regularly in Google's People Also Ask for the "${esc(r.seed)}" query, which is a signal that buyers in this space are asking it constantly during their research phase. The answer above is written from ${BRAND}'s editorial position — we index ${'<strong>2,286 verified US growth-services vendors</strong>'} across ${'<a href="../pillars/">10 pillars</a>'} and see how these questions map to actual buying decisions.</p>
<p>If you're evaluating vendors in this category, the ${'<a href="' + pillarPage(r.pillarSlug) + '">' + esc(r.pillar) + ' pillar</a>'} page has the full US firm list with rates, team sizes, and headquarters filters.</p>
${related.length ? `<div class="rel"><h3>OTHER ${esc(r.pillar.toUpperCase())} QUESTIONS</h3>
${related.map(x => `<a href="${x.slug}.html">${esc(x.q)}</a>`).join('\n')}
</div>` : ''}
<p class="meta">Filed under: <a href="${pillarPage(r.pillarSlug)}">${esc(r.pillar)}</a> · <a href="./">All questions</a></p>`;
  writeFileSync(join(ROOT, 'questions', `${r.slug}.html`), shell({
    title: `${r.q} — ${BRAND}`,
    metaDesc: (r.a.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 150) + '…').trim(),
    canonical, ld, bodyHTML: body
  }));
  count++;
}

// Questions index
const indexLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: `Growth-Services Questions Answered — ${BRAND}`,
  url: `${SITE}/questions/`,
  description: `${count} questions US growth-services buyers ask most, answered editorially by ${BRAND}.`,
  mainEntity: { '@type': 'ItemList', itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/questions/${r.slug}.html`, name: r.q })) }
}];
writeFileSync(join(ROOT, 'questions', 'index.html'), shell({
  title: `Growth-Services Questions Answered — ${BRAND}`,
  metaDesc: `${count} questions US growth-services buyers ask most, answered editorially by ${BRAND}. Grouped by discipline.`,
  canonical: `${SITE}/questions/`,
  ld: indexLD,
  bodyHTML: `
<div class="kicker">Reference · Q&amp;A</div>
<h1>Questions US buyers ask</h1>
<p>${count} of the most-searched questions in the US growth-services market, harvested from Google People Also Ask and answered from ${BRAND}'s editorial position. Grouped by pillar.</p>
${Object.entries(byPillar).map(([p, list]) => `<h2>${esc(p)} — ${list.length}</h2>
<ul>
${list.map(r => `<li><a href="${r.slug}.html">${esc(r.q)}</a></li>`).join('\n')}
</ul>`).join('\n')}
`
}));

console.log(`question pages: ${count} + 1 index`);
