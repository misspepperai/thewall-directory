// Generates the trust-foundation pages (about, contact, policies) in the atlas design.
// Single SITE constant for domain retrofit. Run: node build-trust.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';
const CONTACT_EMAIL = 'support@misspepper.ai';
const EFFECTIVE = '2026-08-03';

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: BRAND, url: `${SITE}/`, email: CONTACT_EMAIL,
  description: 'An operations atlas of US-based companies that solve sales, marketing, SEO, thought leadership, creative, automation, and demand generation problems for established businesses.',
  logo: `${SITE}/`, sameAs: []
};

function shell(title, metaDesc, slug, bodyHTML) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ${BRAND}</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${SITE}/${slug}.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ORG_LD)}</script>
<style>
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
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
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,40px);letter-spacing:-.02em;padding:10px 0 6px}
  .eff{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;color:var(--chrome)}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  ul,ol{padding-left:22px;margin-bottom:12px}
  li{margin-bottom:6px}
  .card{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:18px 22px;margin:18px 0}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:820px}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  footer a:hover{color:var(--ink)}
</style>
</head>
<body>
<nav class="topbar"><div class="wrap topbar-in">
  <a class="wordmark" href="./">${BRAND} <small>OPERATIONS ATLAS</small></a>
  <a class="back" href="./">BROWSE THE ATLAS →</a>
</div></nav>
<main class="wrap">
${bodyHTML}
</main>
<footer><div class="wrap">
  <span>© ${BRAND} · INDEPENDENT DIRECTORY · NOT AN ENDORSEMENT ENGINE</span>
  <span><a href="about.html">ABOUT</a> · <a href="editorial-policy.html">EDITORIAL</a> · <a href="privacy.html">PRIVACY</a> · <a href="terms.html">TERMS</a> · <a href="contact.html">CONTACT</a></span>
</div></footer>
</body>
</html>`;
}

const eff = `<div class="eff">EFFECTIVE ${EFFECTIVE} · LAST REVIEWED ${EFFECTIVE}</div>`;

const PAGES = {
  'about': ['About', 'What The Wall is, who runs it, and how the directory is compiled.', `
<div class="kicker">TRUST / 01</div>
<h1>About ${BRAND}</h1>
<p>${BRAND} is an independent operations atlas: a structured directory of United States–based companies that solve growth problems for established businesses — sales, marketing, SEO, thought leadership, creative, automation, and demand generation. It is built for executives and operators at companies past roughly $5M in revenue with 25 or more employees who have hit a wall and want it handled.</p>
<h2>What makes it different</h2>
<p>Most vendor lists are pay-to-play rankings with shallow profiles. ${BRAND} is a data product: every listing is a structured record — category, specialty, buyer profile, published engagement data where available, and a per-company Q&amp;A — compiled from public sources and refreshed programmatically. Listings are never rankings and never endorsements.</p>
<h2>Who runs it</h2>
<p>${BRAND} is operated by the team behind Miss Pepper AI, a US-based marketing systems company. The directory is editorially independent from any listed provider: inclusion cannot be bought, and no provider paid to be listed in the seed index.</p>
<h2>How to reach us</h2>
<p>Corrections, removal requests, and submissions: <a href="contact.html">contact page</a> or <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`],

  'contact': ['Contact', 'Contact The Wall directory for corrections, submissions, and removal requests.', `
<div class="kicker">TRUST / 02</div>
<h1>Contact</h1>
<p>The fastest channel for anything directory-related is email. We read everything.</p>
<div class="card">
<p><strong>${BRAND}</strong> — operated by Miss Pepper AI<br>
Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br>
Response window: 2 business days for corrections and removals.</p>
</div>
<h2>What to use this for</h2>
<ul>
<li><strong>Corrections</strong> — any listing fact that is wrong or stale. See our <a href="editorial-policy.html">editorial &amp; corrections policy</a>.</li>
<li><strong>Submissions</strong> — add a company via the Submit a Listing button on the <a href="./">atlas</a>; submissions are reviewed before publication.</li>
<li><strong>Removals</strong> — companies may request de-listing at any time; verified requests are honored.</li>
<li><strong>Claiming a listing</strong> — provider claiming is coming; email to get on the early list.</li>
</ul>`],

  'editorial-policy': ['Editorial & Corrections Policy', 'How The Wall selects, compiles, verifies, and corrects directory listings.', `
<div class="kicker">TRUST / 03</div>
<h1>Editorial &amp; Corrections Policy</h1>
${eff}
<h2>Selection standards</h2>
<p>Listings are selected editorially. Criteria: the company is US-based, its website is live, and it provides services or software in the directory's categories to established businesses. Inclusion cannot be purchased. Listings are alphabetical within categories — position is never sold or ranked.</p>
<h2>Sourcing</h2>
<p>Profiles are compiled from public sources: the provider's own website (titles and published descriptions), public business directories including Clutch (provider-declared data such as founding year, team size, minimum project size, rate bands, ratings, and locations), and curated industry research. Every fact on a profile is attributed to its source in plain language on the page.</p>
<h2>Verification</h2>
<p>Every listed domain is machine-verified as live before publication and re-verified in periodic sweeps; dead sites are removed. Non-US providers are excluded by policy. Removed domains are barred from automated re-entry.</p>
<h2>Corrections</h2>
<p>If a listing contains an error, email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> with the listing URL and the correction. We correct verified errors within two business days and note material corrections on the affected profile. Providers may request removal at any time.</p>
<h2>Independence</h2>
<p>No listed provider has editorial input into its default profile. Future paid features (claimed listings) will be visibly labeled and will never alter category placement or search results ordering.</p>`],

  'ai-policy': ['AI & Automation Disclosure', 'How The Wall uses automation and AI in compiling directory profiles.', `
<div class="kicker">TRUST / 04</div>
<h1>AI &amp; Automation Disclosure</h1>
${eff}
<p>${BRAND} is a database-driven directory, and we are direct about how it is made:</p>
<ul>
<li><strong>Profile text is machine-composed from verified data.</strong> The About sections, quick facts, and Q&amp;A on each profile are generated from that company's stored record — its own published descriptions, its provider-declared directory data, and its category classification. Templates assemble facts; they do not invent them.</li>
<li><strong>No fabricated specifics.</strong> Where a fact (pricing, address, founding year) is not published in our sources, profiles say so plainly rather than guessing. Case studies, client results, and certifications are never AI-generated and remain empty until a provider supplies them through a claimed listing.</li>
<li><strong>Quoted material is attributed.</strong> When a profile quotes a company's own words, the quote's source (its website or its Clutch profile) is stated on the page.</li>
<li><strong>Automation in curation.</strong> Site liveness checks, US-location checks, deduplication, and data refreshes are automated. Selection standards and category taxonomy are human decisions.</li>
</ul>
<p>Questions about how a specific profile was compiled: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`],

  'disclosures': ['Advertising & Affiliate Disclosure', 'How The Wall makes money now and how paid placements will be labeled.', `
<div class="kicker">TRUST / 05</div>
<h1>Advertising &amp; Affiliate Disclosure</h1>
${eff}
<h2>Current state</h2>
<p>As of the effective date above, ${BRAND} carries no advertising, no affiliate links, and no paid listings. No provider has paid for inclusion, placement, or wording.</p>
<h2>Planned revenue, and how it will be labeled</h2>
<ul>
<li><strong>Claimed listings.</strong> Providers will be able to claim and enhance their profile (verified details, case studies, contact routing). Claimed profiles will be visibly labeled and will not change category placement or ordering.</li>
<li><strong>Affiliate links.</strong> If a profile link ever becomes an affiliate link, the profile will carry a plain-language disclosure on that page.</li>
<li><strong>Sponsored content.</strong> Any sponsored page will be labeled "Sponsored" at the top of the page.</li>
</ul>
<p>Our default profiles remain free, and editorial standards in the <a href="editorial-policy.html">editorial policy</a> apply regardless of any commercial relationship.</p>`],

  'privacy': ['Privacy Policy', 'What data The Wall collects (very little) and how it is handled.', `
<div class="kicker">TRUST / 06</div>
<h1>Privacy Policy</h1>
${eff}
<h2>What we collect</h2>
<ul>
<li><strong>Browsing:</strong> the site sets no cookies and runs no advertising trackers. Pages are served by GitHub Pages and listing data by Supabase; both process standard server logs (IP address, user agent) to deliver the service.</li>
<li><strong>Submissions:</strong> if you submit a listing, we store the business information you provide (company name, website, category, description). Submit only business information.</li>
<li><strong>Email:</strong> if you email us, we retain the correspondence to handle your request.</li>
</ul>
<h2>What we do not do</h2>
<ul>
<li>No sale of personal data. No ad-tech data sharing. No marketing lists from correspondence.</li>
</ul>
<h2>Listing data</h2>
<p>Directory profiles describe businesses, not private individuals, and are compiled from public sources. Business contact details shown (office phone, office address) are those the business publishes publicly. Businesses may request corrections or removal via the <a href="contact.html">contact page</a>.</p>
<h2>Your rights</h2>
<p>To access, correct, or delete information you have sent us, email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. If analytics are added in the future, this policy will be updated first and the change noted here.</p>`],

  'terms': ['Terms of Use', 'The terms that govern use of The Wall directory.', `
<div class="kicker">TRUST / 07</div>
<h1>Terms of Use</h1>
${eff}
<p>By using ${BRAND} you agree to these terms.</p>
<h2>What the directory is</h2>
<p>${BRAND} is an informational directory compiled from public sources. Listings are <strong>not endorsements, recommendations, or rankings</strong>. Engagement decisions, pricing, and outcomes are strictly between you and any provider you contact.</p>
<h2>Accuracy</h2>
<p>We verify what we can (site liveness, US location, published data at time of compilation) and correct errors under our <a href="editorial-policy.html">corrections policy</a>, but information can go stale and providers change. The provider's own website is always the authoritative source. The directory is provided "as is" without warranties.</p>
<h2>Acceptable use</h2>
<ul>
<li>No scraping at volumes that degrade the service; contact us for data access instead.</li>
<li>No submitting listings you are not authorized to submit, and no false information.</li>
<li>No use of listed contact details for spam.</li>
</ul>
<h2>Intellectual property</h2>
<p>Directory structure, profile text, and site design are © ${BRAND}. Company names, logos, and quoted descriptions belong to their respective owners and appear nominatively. To report an IP concern, see the <a href="contact.html">contact page</a> — takedown requests are honored per our removal policy.</p>
<h2>Liability</h2>
<p>To the maximum extent permitted by law, ${BRAND} is not liable for outcomes arising from engagements with listed providers or from reliance on directory information.</p>`],

  'accessibility': ['Accessibility Statement', 'The Wall’s accessibility practices and how to report an issue.', `
<div class="kicker">TRUST / 08</div>
<h1>Accessibility Statement</h1>
${eff}
<p>${BRAND} aims to be usable by everyone. Current practices:</p>
<ul>
<li>Semantic HTML structure with proper landmarks, headings, and lists on all pages.</li>
<li>Visible keyboard focus states and full keyboard operability of search, filters, and Q&amp;A disclosures.</li>
<li>Reduced-motion support: all animation is disabled when your system requests reduced motion.</li>
<li>Text alternatives on informational images; decorative logos are marked appropriately.</li>
<li>Color contrast checked against WCAG 2.1 AA targets for body text and interactive elements.</li>
</ul>
<p>If you hit an accessibility barrier anywhere on the site, email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> with the page URL — accessibility reports are prioritized ahead of other correction requests.</p>`]
};

let count = 0;
for (const [slug, [title, desc, body]] of Object.entries(PAGES)) {
  writeFileSync(join(ROOT, `${slug}.html`), shell(title, desc, slug, body));
  count++;
}
console.log(`trust pages written: ${count}`);
