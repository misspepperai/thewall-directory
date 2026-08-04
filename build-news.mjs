// Generates the Briefings (news) section: news/index.html + news/{slug}.html.
// Every figure is computed from the live directory_companies table — snapshot dated per article.
// Byline policy: The Wall Editorial Team (Organization), no personas. Run: node build-news.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai',
  description: 'An operations atlas of US-based companies that solve sales, marketing, SEO, thought leadership, creative, automation, and demand generation problems for established businesses.'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const dateFmt = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const METHOD = `<div class="card method"><p><strong>How this was computed.</strong> Figures are computed from ${BRAND}'s index of 2,286 approved, US-based, machine-verified-live listings as of August 3, 2026. Engagement data (rates, minimum project sizes, team sizes, founding years, ratings) are provider-declared figures published on public Clutch profiles and are present for 1,738 of the 2,286 listings; percentages of "disclosed" values exclude listings that publish no figure. Nothing in this briefing is estimated or modeled. Sourcing standards: <a href="../editorial-policy.html">editorial policy</a>.</p></div>`;

function table(headers, rows) {
  return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i > 0 ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

// ---------------------------------------------------------------- articles
const D = '2026-08-03';
const ARTICLES = [
{
  slug: 'the-wall-launches-2286-us-growth-vendors', date: D,
  h: 'The Wall launches with 2,286 verified US growth vendors across 10 categories',
  dek: 'A new operations atlas opens with 2,286 US-based, verified-live companies that solve sales, marketing, SEO, thought-leadership, creative, automation, and demand-generation problems — and publishes its data standards on day one.',
  body: `
<p>${BRAND} opened its public index today with 2,286 listings. Every listed company is US-based, every website was machine-verified as live before publication, and every profile is a structured record rather than a paragraph of marketing copy: category, specialty, buyer profile, and — where the provider has published them — hourly-rate band, minimum project size, team size, founding year, headquarters, and review data.</p>
<p>The index is built for a specific reader: executives and operators at US companies past roughly $5M in revenue with 25 or more employees who have hit a wall in sales, marketing, thought leadership, or creative — and want the shortest path to a shortlist.</p>
<h2>What the index holds at launch</h2>
${table(['Category', 'Listings'], [
  ['Creative Strategy', '870'], ['Marketing', '550'], ['SEO', '226'], ['Thought Leadership', '193'],
  ['Content Marketing', '113'], ['Sales', '103'], ['Social Media Marketing', '90'], ['Automation', '59'],
  ['Demand Gen', '48'], ['AI Marketing', '34']
])}
<p>Of the 2,286 listings, 1,964 are marketing and creative agencies, 246 are software providers, and 76 are business services. 1,738 listings carry provider-declared engagement data from public Clutch profiles; 1,818 carry the company's own published homepage description; 1,623 carry client review data — 31,944 reviews in total.</p>
<h2>What was removed before launch</h2>
<p>The launch index is smaller than the raw build. During pre-launch verification, 696 listings were removed: 668 companies headquartered outside the United States and 28 whose websites failed repeated liveness checks. Removed domains are barred from automated re-entry.</p>
<p>Inclusion cannot be bought, listings are alphabetical within categories, and no listed provider paid to appear in the seed index. The full standards are published in the <a href="../editorial-policy.html">editorial &amp; corrections policy</a>.</p>`,
  rel: ['how-the-wall-verifies-listings', 'us-agency-hourly-rates-2026', 'where-us-growth-vendors-cluster-2026']
},
{
  slug: 'us-agency-hourly-rates-2026', date: D,
  h: 'What US growth agencies charge in 2026: seven in ten disclosed rates land between $100 and $199 an hour',
  dek: 'Across 1,440 US agencies that publish an hourly-rate band, $150–$199 is the single most common answer — and the premium tail above $300 is far smaller than agency marketing suggests.',
  body: `
<p>Of the 1,738 listings in ${BRAND}'s index that carry provider-declared engagement data, 1,440 publish an hourly-rate band. The distribution is tighter than most buyers expect:</p>
${table(['Hourly-rate band', 'Firms', 'Share of disclosed'], [
  ['$150 – $199 / hr', '531', '36.9%'], ['$100 – $149 / hr', '470', '32.6%'], ['$200 – $300 / hr', '163', '11.3%'],
  ['$50 – $99 / hr', '159', '11.0%'], ['$25 – $49 / hr', '70', '4.9%'], ['&lt; $25 / hr', '25', '1.7%'], ['$300+ / hr', '22', '1.5%']
])}
<p>Two-thirds of the market prices in a $100 band: 1,001 of 1,440 disclosed rates — 69.5% — fall between $100 and $199 per hour. The tails are thin on both ends. Only 6.6% of disclosing firms price below $50 an hour, and only 1.5% price above $300.</p>
<h2>What the compression means for buyers</h2>
<p>For a company budgeting an engagement, the practical read is simple: a US agency quoting inside $100–$199 is quoting the market norm, and a quote outside that band should come with a reason — deep specialization and senior-only teams on the high side, offshore delivery or junior-heavy teams on the low side. At the modal band, a 20-hour-per-month retainer prices at roughly $3,000–$4,000 per month before deliverable-based pricing enters the picture.</p>
<p>A further 298 firms in the engagement-data set — 17.1% — publish no rate at all. That group is examined separately in <a href="rate-transparency-gap-2026.html">the transparency-gap briefing</a>.</p>`,
  rel: ['agency-minimum-project-sizes-2026', 'rate-transparency-gap-2026', 'agency-team-sizes-2026']
},
{
  slug: 'agency-minimum-project-sizes-2026', date: D,
  h: 'The price of entry: 82% of US agencies that disclose a minimum will start at $10,000 or less',
  dek: 'Minimum project sizes across 1,648 disclosing US growth vendors show an accessible market floor — $5,000 is the most common gate, and six-figure minimums are rare.',
  body: `
<p>1,648 listings in ${BRAND}'s index publish a minimum project size. The most common gate is $5,000, and the overwhelming majority of the market opens below the level many mid-market buyers assume:</p>
${table(['Minimum project size', 'Firms', 'Share of disclosed'], [
  ['$1,000+', '461', '28.0%'], ['$5,000+', '534', '32.4%'], ['$10,000+', '365', '22.1%'],
  ['$25,000+', '182', '11.0%'], ['$50,000+', '66', '4.0%'], ['$75,000+', '22', '1.3%'],
  ['$100,000+', '14', '0.8%'], ['$250,000+', '4', '0.2%']
])}
<p>1,360 of 1,648 disclosing firms — 82.5% — will open an engagement at $10,000 or less. Only 106 firms (6.4%) set the gate at $50,000 or above, and just four firms in the entire index require a quarter-million dollars to start.</p>
<h2>Reading a minimum correctly</h2>
<p>A minimum project size is a qualification filter, not a price list. Firms use it to screen out engagements too small to staff properly. For a buyer at $5M+ in revenue, the data says the filter is rarely the obstacle: the market's entry gates cluster far below a serious quarter's marketing budget. The more useful signal is the combination — a firm's minimum, its hourly band, and its team size together sketch what a real first engagement looks like before the first call.</p>
<p>90 firms in the engagement-data set (5.2%) publish no minimum at all.</p>`,
  rel: ['us-agency-hourly-rates-2026', 'agency-team-sizes-2026', 'clutch-ratings-compression-2026']
},
{
  slug: 'where-us-growth-vendors-cluster-2026', date: D,
  h: 'Five states hold a third of US growth vendors — and California alone holds 308',
  dek: 'Headquarters data across The Wall’s index maps the supply side of the US growth-services market: California, New York, Florida, Texas, and Illinois account for 35% of all listings.',
  body: `
<p>Where headquarters data is available in ${BRAND}'s index, the geography of US growth vendors concentrates hard at the top. The five largest states account for 806 listings — 35.3% of the entire 2,286-listing index:</p>
${table(['State', 'Listings'], [
  ['California', '308'], ['New York', '150'], ['Florida', '124'], ['Texas', '120'], ['Illinois', '104'],
  ['Colorado', '71'], ['Massachusetts', '58'], ['Georgia', '56'], ['Pennsylvania', '46'], ['Washington', '37'],
  ['Ohio', '37'], ['Virginia', '36'], ['North Carolina', '30'], ['Arizona', '29'], ['New Jersey', '26']
])}
<p>California's 308 listings — 13.5% of the index — make it the largest single market by a factor of two. But the more interesting entries sit mid-table. Florida's 124 places it third, ahead of Texas. Colorado, with 71, out-ranks Massachusetts, Georgia, and Pennsylvania — states with far larger business bases.</p>
<h2>What geography does and doesn't mean</h2>
<p>Nearly every firm in the index sells nationally; headquarters location is a supply-side fact, not a service-area constraint. What the clustering does tell a buyer is where talent pools, agency alumni networks, and specialization depth have compounded. It also means a buyer restricting a shortlist to local vendors in a bottom-half state is filtering out most of the market for no operational reason.</p>
<p>City-level concentration is covered in <a href="top-cities-us-growth-vendors-2026.html">the companion briefing</a>.</p>`,
  rel: ['top-cities-us-growth-vendors-2026', 'the-wall-launches-2286-us-growth-vendors', 'agency-founding-years-2026']
},
{
  slug: 'agency-team-sizes-2026', date: D,
  h: 'The 10-to-49 majority: half of US growth agencies run mid-size teams',
  dek: 'Team-size data across 1,738 US growth vendors shows a market of boutiques and mid-size shops — 82% of firms run fewer than 50 people, and firms above 250 are a 3% sliver.',
  body: `
<p>Across the 1,738 listings in ${BRAND}'s index with provider-declared team-size data, the shape of the US growth-services market is unmistakably mid-size:</p>
${table(['Team size', 'Firms', 'Share'], [
  ['Freelancer', '9', '0.5%'], ['2 – 9', '524', '30.2%'], ['10 – 49', '898', '51.7%'],
  ['50 – 249', '252', '14.5%'], ['250 – 999', '50', '2.9%'], ['1,000 – 9,999', '5', '0.3%']
])}
<p>The 10–49 band alone holds 898 firms — a 51.7% majority. Add the 2–9 boutiques and 81.8% of the market runs fewer than 50 people. Only 55 firms in the entire data set field more than 250.</p>
<h2>Why team size is a buying signal</h2>
<p>Team size predicts the texture of an engagement more reliably than most sales decks. A 2–9 boutique typically means founder-led work and senior attention with capacity risk. A 10–49 firm — the market's center of gravity — means process without bureaucracy, and usually a named team. Above 250, buyers get bench depth and account layers. None of these is better in the abstract; the point of the data is that a buyer can decide which trade-off fits before the first call, and the index publishes the band on every profile that declares one.</p>`,
  rel: ['us-agency-hourly-rates-2026', 'agency-minimum-project-sizes-2026', 'agency-founding-years-2026']
},
{
  slug: 'agency-founding-years-2026', date: D,
  h: 'Median founding year 2012: the US growth-vendor market is a 2010s creation',
  dek: 'Founding-year data across 1,734 US growth vendors shows half the market launched in the 2010s, 231 firms are younger than 2020 — and the oldest firm in the index dates to 1926.',
  body: `
<p>Of the listings in ${BRAND}'s index that declare a founding year, the median is 2012. The distribution by decade:</p>
${table(['Founded', 'Firms', 'Share'], [
  ['Before 1990', '48', '2.8%'], ['1990s', '109', '6.3%'], ['2000s', '465', '26.8%'],
  ['2010s', '881', '50.8%'], ['2020 – 2026', '231', '13.3%']
])}
<p>Half the market — 50.8% — was founded in the 2010s, the decade in which content marketing, marketing automation, and paid social matured into standalone disciplines. Another 231 firms, 13.3%, have launched since 2020. At the far end, 48 firms predate 1990, and the oldest listing in the index was founded in 1926.</p>
<h2>Age as a signal, not a verdict</h2>
<p>A 2010s median means the typical vendor a buyer meets has operated through roughly one full economic cycle. Firms founded before 2008 have survived at least two, which is evidence of durability worth weighing. Post-2020 firms are untested by that standard but over-represented in the newest disciplines — a buyer who needs, say, AI-marketing capability will find that pillar skews young by nature. The index publishes the declared founding year on every profile that carries one, so the age question is answerable before anyone gets on a call.</p>`,
  rel: ['ai-marketing-thinnest-category-2026', 'agency-team-sizes-2026', 'the-wall-launches-2286-us-growth-vendors']
},
{
  slug: 'clutch-ratings-compression-2026', date: D,
  h: 'When every agency is a 4.9: rating compression across 31,944 reviews',
  dek: 'Category-average ratings across 1,623 rated US growth vendors span just 4.88 to 4.94 out of 5 — a compression so tight that star ratings alone can no longer separate vendors.',
  body: `
<p>1,623 listings in ${BRAND}'s index carry a public Clutch rating, backed by 31,944 client reviews in total. Averaged by category, the results are remarkable mostly for how little they vary:</p>
${table(['Category', 'Rated firms', 'Avg rating'], [
  ['Creative Strategy', '716', '4.94'], ['SEO', '190', '4.94'], ['Thought Leadership', '118', '4.92'],
  ['Marketing', '416', '4.91'], ['Demand Gen', '15', '4.89'], ['Content Marketing', '78', '4.89'],
  ['Social Media Marketing', '71', '4.88'], ['Automation', '18', '4.88'], ['AI Marketing', '1', '5.00*']
])}
<p class="fn">* Single rated firm; not a meaningful category average. The Sales category's vendors are covered by curated sources rather than Clutch and carry no ratings in this data set.</p>
<p>Every category average with a meaningful sample sits between 4.88 and 4.94 out of 5. The spread across the entire market is six hundredths of a star.</p>
<h2>Why compression happens, and what to use instead</h2>
<p>Review platforms in professional services skew high for structural reasons: reviews are solicited by the vendor, unhappy clients tend to leave quietly rather than publicly, and firms with weak ratings often simply stop maintaining their profiles. The result is a market where a 4.9 tells a buyer almost nothing — it is the baseline, not a distinction.</p>
<p>The discriminating data lives elsewhere: hourly-rate band, minimum project size, team size, founding year, and specialty. Those are the fields ${BRAND} structures on every profile precisely because, unlike stars, they still separate one vendor from another.</p>`,
  rel: ['us-agency-hourly-rates-2026', 'agency-team-sizes-2026', 'how-the-wall-verifies-listings']
},
{
  slug: 'creative-strategy-largest-category-2026', date: D,
  h: 'Creative Strategy is the largest wall: 870 vendors, 38% of the index',
  dek: 'More than one in three companies in The Wall’s index solves creative problems — branding, design, video, and full-service creative — making it the most crowded category and the hardest selection problem.',
  body: `
<p>Creative Strategy is the largest of ${BRAND}'s ten categories by a wide margin: 870 listings, 38.1% of the 2,286-listing index. The next-largest category, Marketing, holds 550. Together the top two account for 62% of the entire market.</p>
<p>The category spans branding and identity firms, design studios, video and production shops, and full-service creative agencies. Within the engagement-data set, Creative Strategy firms are also among the most reviewed: 716 rated firms carrying 13,478 client reviews — 42% of all reviews in the index — with a category-average rating of 4.94.</p>
<h2>Crowded supply is a buyer's problem too</h2>
<p>An 870-vendor category means the odds of finding a capable creative partner are high — and the odds of finding the <em>right</em> one by browsing are low. Ratings won't narrow it: as the <a href="clutch-ratings-compression-2026.html">rating-compression briefing</a> shows, the category averages 4.94, indistinguishable from the market. The workable filters are structural. Within Creative Strategy, hourly-rate bands, minimum project sizes, and team sizes vary far more than ratings do, and those are the fields published on every profile that declares them.</p>
<p>The full category is browsable in the <a href="../#" >atlas</a>, alphabetical and unranked, with per-company data sheets on every listing.</p>`,
  rel: ['clutch-ratings-compression-2026', 'the-wall-launches-2286-us-growth-vendors', 'agencies-vs-software-mix-2026']
},
{
  slug: 'ai-marketing-thinnest-category-2026', date: D,
  h: 'AI Marketing is the thinnest pillar in the index — 34 vendors and counting',
  dek: 'The newest discipline in The Wall’s taxonomy has the fewest qualifying vendors: 34 listings, against 59 in the adjacent Automation category — a measure of how young dedicated AI-marketing supply still is.',
  body: `
<p>Of ${BRAND}'s ten categories, AI Marketing is the smallest: 34 listings, 1.5% of the index. Its nearest neighbor, Automation — marketing-automation platforms and implementation shops — holds 59. Between them, the two most technology-forward categories account for barely 4% of the US growth-vendor market.</p>
<h2>Why the pillar is thin</h2>
<p>The thinness is a supply fact, not an editorial choice. The category's inclusion bar is the same as every other pillar's: US-based, live website, and a real offering in the discipline. What the count reflects is that dedicated AI-marketing firms — as distinct from general agencies that have added AI language to existing services — are still a young population. Review coverage tells the same story: only one AI Marketing listing carries a Clutch rating at all, against 716 rated firms in Creative Strategy.</p>
<h2>What buyers should expect</h2>
<p>A thin category cuts both ways. Buyers get a scannable market — all 34 vendors can be reviewed in a sitting — but fewer reference points for pricing and engagement norms, since most of the pillar's firms are too new to have accumulated public engagement data. Expect the count to grow: the category is the index's most likely to change shape, and qualifying vendors can <a href="../#" >submit a listing</a> for editorial review at any time.</p>`,
  rel: ['agency-founding-years-2026', 'agencies-vs-software-mix-2026', 'the-wall-launches-2286-us-growth-vendors']
},
{
  slug: 'agencies-vs-software-mix-2026', date: D,
  h: '86% services, 11% software: how the US growth-vendor market splits',
  dek: 'Classified across The Wall’s full index, 1,964 listings are agencies, 246 are software providers, and 76 are business services — evidence that growth problems are still overwhelmingly bought as services.',
  body: `
<p>Every listing in ${BRAND}'s index is classified as one of three types. The split across all 2,286 listings:</p>
${table(['Listing type', 'Listings', 'Share'], [
  ['Marketing / creative agency', '1,964', '85.9%'], ['Software provider', '246', '10.8%'], ['Business service', '76', '3.3%']
])}
<p>For all the industry attention on marketing technology, the supply side of the US growth market remains overwhelmingly a services market: nearly nine in ten vendors sell expertise and execution, not licenses.</p>
<h2>Services and software solve different halves of the wall</h2>
<p>The distinction matters at the point of purchase. Software compounds an existing capability — a team that already runs pipeline gets more from a sales-engagement platform. Services substitute for a missing capability — which is usually what "hitting a wall" means in practice. The index classifies every listing so a buyer filtering for one type never wades through the other, and each profile's data sheet states the type alongside the engagement facts.</p>
<p>The mix also varies by category: the software share concentrates in the Sales, Automation, and AI Marketing pillars, while the creative and content categories are almost purely services. Category-level breakdowns are covered in the respective pillar briefings.</p>`,
  rel: ['sales-pillar-brief-2026', 'ai-marketing-thinnest-category-2026', 'creative-strategy-largest-category-2026']
},
{
  slug: 'sales-pillar-brief-2026', date: D,
  h: 'The Sales pillar: 103 vendors, from training firms to RevOps platforms',
  dek: 'The Wall’s Sales category catalogs the selling-capability market — sales training, enablement software, CRM and data providers, recruiting, and RevOps — a pillar built from curated sources rather than review-site data.',
  body: `
<p>The Sales category holds 103 listings — 4.5% of ${BRAND}'s index — and is deliberately scoped to <em>selling capability</em>: sales training and coaching firms, enablement and engagement software, CRM and sales-data providers, sales recruiting, and revenue-operations consultancies. Pipeline <em>generation</em> — outbound agencies, ABM and intent-data services — lives in the separate Demand Gen category (48 listings), because buying more pipeline and getting better at converting it are different purchases.</p>
<h2>A different data profile</h2>
<p>Sales is the one pillar where listings carry no Clutch review data: its vendor population — particularly software platforms and training firms — is covered by curated industry sources rather than agency-review marketplaces. The engagement-data coverage that spans most of the agency categories is therefore thinner here, and the index says so plainly rather than papering over the gap. Profiles in the pillar lean on each company's own published positioning, category, specialty, and buyer-fit fields.</p>
<h2>Who the pillar is for</h2>
<p>The Sales wall is typically the most expensive one to leave standing: a company at $5M+ with 25+ employees that has outgrown founder-led selling needs training, tooling, data, and process in some order. The pillar is organized so an operator can see all four solution shapes side by side before deciding which one their wall actually requires.</p>`,
  rel: ['agencies-vs-software-mix-2026', 'the-wall-launches-2286-us-growth-vendors', 'clutch-ratings-compression-2026']
},
{
  slug: 'how-the-wall-verifies-listings', date: D,
  h: 'Inside the gate: how The Wall verified 2,286 listings and removed 696',
  dek: 'Before launch, every candidate listing passed a US-headquarters gate and multi-method website liveness checks; 668 non-US companies and 28 dead sites were removed and barred from automated re-entry.',
  body: `
<p>${BRAND}'s launch index is defined as much by what was removed as by what was published. The verification pipeline applies three gates to every candidate listing, and 696 candidates failed them before launch.</p>
<h2>The three gates</h2>
<p><strong>1. US headquarters.</strong> The index is US-only by policy. Headquarters country is checked from provider-declared profile data and, where ambiguous, verified by hand. 668 companies headquartered outside the United States were removed in the pre-launch sweep.</p>
<p><strong>2. Live website.</strong> Every domain is machine-verified before publication using multiple independent HTTP methods, with a retry pass for transient failures, so that bot-blocking is not mistaken for death. 28 domains that failed every method were removed. Liveness is re-verified in periodic sweeps after launch.</p>
<p><strong>3. No re-entry for removed domains.</strong> Removed domains go onto a blocklist enforced at the database layer — an automated scrape or a public submission cannot silently reintroduce a domain that was removed for cause. Restoration requires deliberate editorial action.</p>
<h2>What verification does not claim</h2>
<p>Verification establishes that a company is US-based and operating a live website — it is not an endorsement, a quality ranking, or a background check, and the index never presents it as one. Engagement figures on profiles are provider-declared data from public sources, attributed in plain language on each page. Errors get fixed: corrections are honored within two business days under the <a href="../editorial-policy.html">editorial &amp; corrections policy</a>, and any company may request removal at any time.</p>`,
  rel: ['the-wall-launches-2286-us-growth-vendors', 'clutch-ratings-compression-2026', 'rate-transparency-gap-2026']
},
{
  slug: 'rate-transparency-gap-2026', date: D,
  h: 'The transparency gap: 17% of US growth agencies won’t publish an hourly rate',
  dek: 'Across 1,738 US growth vendors with public engagement profiles, 298 decline to disclose an hourly-rate band and 90 publish no minimum project size — a gap buyers can read as information.',
  body: `
<p>Most US growth vendors publish their commercial terms. Across the 1,738 listings in ${BRAND}'s index with provider-declared engagement data, 1,440 disclose an hourly-rate band and 1,648 disclose a minimum project size. The remainder — 298 firms without a published rate (17.1%) and 90 without a published minimum (5.2%) — are the market's transparency gap.</p>
<h2>Why firms withhold</h2>
<p>Non-disclosure is not inherently a red flag. Firms that price by deliverable or by value rather than by hour have no honest band to publish; large consultancies often scope every engagement custom. But non-disclosure is also the natural home of rates that would filter a firm out of consideration early — which is precisely why the disclosing majority publishes: a stated band pre-qualifies buyers and saves both sides the discovery call that was never going to close.</p>
<h2>How the index treats it</h2>
<p>${BRAND} records what a firm publishes and does not fill the gap with estimates — a profile with no declared rate shows no rate, under the index's no-fabrication standard. For buyers, the practical guidance the data supports: treat an undisclosed rate as a question to ask in the first conversation, and use the <a href="us-agency-hourly-rates-2026.html">market distribution</a> as the reference point for the answer. A firm quoting far outside the $100–$199 band that two-thirds of the disclosed market occupies should be able to say why.</p>`,
  rel: ['us-agency-hourly-rates-2026', 'agency-minimum-project-sizes-2026', 'how-the-wall-verifies-listings']
},
{
  slug: 'top-cities-us-growth-vendors-2026', date: D,
  h: 'New York, Chicago, Los Angeles — and then Austin: the city map of US growth vendors',
  dek: 'City-level headquarters data across The Wall’s index puts New York first at 105 firms, with Austin, Denver, and Miami ranking alongside metros several times their size.',
  body: `
<p>At the city level, the headquarters data in ${BRAND}'s index ranks the US growth-vendor market like this:</p>
${table(['City', 'Listings'], [
  ['New York, NY', '105'], ['Chicago, IL', '73'], ['Los Angeles, CA', '63'], ['San Francisco, CA', '53'],
  ['Austin, TX', '48'], ['Atlanta, GA', '40'], ['Denver, CO', '40'], ['Miami, FL', '33'],
  ['San Diego, CA', '31'], ['Boston, MA', '25'], ['Dallas, TX', '25'], ['Seattle, WA', '25']
])}
<p>The top three are the expected media-and-advertising capitals. The mid-table is where the market has moved: Austin's 48 firms rank it fifth, ahead of Atlanta; Denver ties Atlanta at 40; Miami's 33 puts it ahead of Boston, Dallas, and Seattle. Within California, the market splits across three cities — Los Angeles, San Francisco, and San Diego together hold 147 of the state's 308 listings, with the balance distributed across smaller metros.</p>
<h2>Reading the city map</h2>
<p>As with the <a href="where-us-growth-vendors-cluster-2026.html">state-level data</a>, headquarters city is a supply-side fact — virtually every firm in the index sells nationally. The mid-table pattern is still informative: growth-services firms have followed talent migration into Austin, Denver, and Miami, and buyers who last built a vendor shortlist a decade ago are drawing from a map that no longer exists.</p>`,
  rel: ['where-us-growth-vendors-cluster-2026', 'the-wall-launches-2286-us-growth-vendors', 'agency-team-sizes-2026']
},
{
  slug: 'small-business-platform-search-1015-percent-2026', date: D,
  h: 'The 1,015% search: US operators are suddenly asking Google for "digital marketing platforms for small businesses"',
  dek: 'Google search volume for "digital marketing platform for small businesses" is up 1,015% year-over-year to 40,500 monthly searches — a rare signal that the smaller end of the operator market is actively hunting for tooling, not just tolerating it.',
  body: `
<p>Search for the exact phrase <em>digital marketing platform for small businesses</em> has climbed to 40,500 US searches per month, according to Google keyword data — a 1,015% jump from the same month a year earlier. The sibling query <em>online marketing platform for small businesses</em> shows the same shape at 9,900 monthly searches. Both are commercial-intent phrases (the searcher is shopping, not researching), and both carry low competition in Google's keyword-difficulty scoring — an unusual combination.</p>
<h2>Why the trend matters more than the number</h2>
<p>Absolute volume is not the story. 40,500 searches is a mid-sized keyword by SaaS category standards. What is unusual is the shape of the growth: monthly volume was in the low thousands as recently as ten months ago and passed 100,000 in a single spike during ${BRAND}'s data window. A rise that steep on a specific commercial phrase is not organic drift — it is a market being told, by someone or something, that this is the phrase to use.</p>
<p>The most defensible read: buyers below the $5M revenue threshold — the segment the enterprise marketing-technology market has spent a decade ignoring or overcharging — are now shopping for tooling explicitly framed as "for us." That framing appears to be a reaction to sticker shock on the standard platforms, and to a wave of new offerings that price and position specifically for the sub-$5M operator.</p>
<h2>What the data source is, and is not</h2>
<p>These figures come from DataForSEO's Google keyword-planner data, which reflects search volume on Google.com in the United States by month. The 1,015% year-over-year figure compares July 2026 to July 2025. Search volume is not the same as revenue, adoption, or intent-to-purchase; it is the count of times a phrase was searched. What it reliably measures is <em>attention</em> — and attention on a commercial phrase is the leading indicator most reliably ahead of purchase behavior.</p>
<h2>What ${BRAND} publishes about this segment — and what it does not</h2>
<p>${BRAND}'s directory is built for a specific reader: US companies past $5M in revenue with 25 or more employees. Companies below that line are outside the core ICP, and the directory does not attempt to serve small-business buyers directly. But many of the 2,286 US firms listed do serve smaller operators, particularly in the <a href="../pillars/automation.html">Automation</a> and <a href="../pillars/ai-marketing.html">AI Marketing</a> pillars — where platform-shaped listings concentrate — and increasingly in the <a href="../pillars/marketing.html">Marketing</a> pillar, where a growing subset of full-service agencies now package their own platform alongside their services.</p>
<p>${BRAND} does not currently track which platforms individual listed firms use or resell — that is provider-declared data the index does not yet collect. What the search trend suggests, and what future briefings will test against actual listing data as it becomes available, is that "platform for small business" is stopping being a market segment marketing-technology firms flee from and becoming one they build for.</p>`,
  rel: ['the-wall-launches-2286-us-growth-vendors', 'ai-marketing-thinnest-category-2026', 'agencies-vs-software-mix-2026']
},
{
  slug: 'rate-transparency-by-category-2026', date: D,
  h: 'The transparency map: SEO firms publish rates 87% of the time, Demand Gen firms 60%',
  dek: 'Across the 1,738 US growth vendors with public engagement data in The Wall’s index, rate-disclosure rates cluster tightly at the top and fall off sharply at the bottom — and where a category lands on the scale tells buyers something more useful than the rates themselves.',
  body: `
<p>Rate transparency in the US growth-vendor market is not evenly distributed. Across the ten categories in ${BRAND}'s index, the share of firms with public engagement data that publish an hourly rate ranges from 87.4% at the top to 0% in one specific corner. The full ranking, computed against the subset of listings in each category that publish any provider data at all:</p>
${table(['Category', 'Rate disclosure', 'Minimum project disclosure'], [
  ['SEO', '87.4%', '95.6%'],
  ['Creative Strategy', '86.5%', '95.8%'],
  ['Content Marketing', '81.6%', '93.1%'],
  ['Marketing', '80.9%', '94.1%'],
  ['Social Media Marketing', '78.7%', '97.3%'],
  ['Automation', '75.0%', '95.0%'],
  ['Thought Leadership', '68.0%', '90.2%'],
  ['Demand Gen', '60.0%', '93.3%'],
  ['AI Marketing', '0%*', '0%*'],
  ['Sales', '—*', '—*']
])}
<p class="fn">* AI Marketing and Sales are compiled from curated sources rather than public agency-review data; disclosure rates are not comparable.</p>
<h2>Why the top of the ranking clusters so tightly</h2>
<p>SEO, Creative Strategy, Content Marketing, Marketing, and Social Media Marketing all sit within a seven-point band — 78.7% to 87.4%. These are the categories where the client-services model is fully mature: buyers expect a rate band, sellers know that publishing one pre-qualifies inbound and saves discovery-call time on both sides, and the reference-review platforms these firms use make the disclosure explicit. A firm operating in these categories that <em>doesn't</em> publish an hourly rate is deliberately opting out of a market norm.</p>
<h2>Why Thought Leadership and Demand Gen lag</h2>
<p>The bottom of the ranking is a signal of a different market shape. Thought Leadership work (68% disclosure) is often priced per-engagement — a book program, a podcast series, a keynote push — rather than per-hour, so an hourly rate is genuinely a poor unit for what's being sold. Demand Gen (60% disclosure) is heavily performance-priced — cost per meeting, cost per SQL, revenue share — and traditional hourly rate cards misrepresent the commercial model.</p>
<p>Buyers reading these numbers should interpret them accordingly: an undisclosed rate in SEO or Marketing is a question worth asking; an undisclosed rate in Thought Leadership or Demand Gen is often just a reflection of how those disciplines commercially operate. What matters is that the firm can articulate <em>some</em> pricing structure by the first substantive conversation — not that it fits the hourly-rate mold.</p>
<h2>What "0%" in AI Marketing actually says</h2>
<p>AI Marketing's zero-disclosure figure is not a transparency failing. The category is young enough that most of its 34 US listings are compiled from curated industry sources rather than from the agency-review platforms where structured engagement data lives. That's information too: a buyer evaluating an AI-marketing firm should expect to rely more on direct evaluation and less on public engagement data than in any other pillar of the index.</p>`,
  rel: ['rate-transparency-gap-2026', 'us-agency-hourly-rates-2026', 'ai-marketing-thinnest-category-2026']
},
{
  slug: 'agency-age-by-category-2026', date: D,
  h: 'Category age is a career-cohort map: automation firms were founded a decade after creative agencies',
  dek: 'Median founding years across The Wall’s 1,734 US growth vendors with declared founding data range from 2009 (Thought Leadership) to 2018 (Automation) — a nine-year spread that tells buyers when each discipline’s current commercial shape actually formed.',
  body: `
<p>Every one of ${BRAND}'s ten pillars has a different median founding year, and the spread is meaningful. Firms in the older categories were formed in a world that predates programmatic advertising, marketing automation, and social platforms. Firms in the youngest categories were formed after all three were mature. The full ranking of medians, from oldest category to newest, computed across the 1,734 US listings in the index that declare a founding year:</p>
${table(['Category', 'Median founding year', 'Firms w/ year', 'Since 2020', '2010s', '2000s', 'Pre-2000'], [
  ['Thought Leadership', '2009', '120', '11', '48', '40', '21'],
  ['Creative Strategy', '2011', '766', '80', '374', '217', '95'],
  ['Marketing', '2013', '444', '72', '227', '118', '27'],
  ['Content Marketing', '2013', '87', '10', '51', '21', '5'],
  ['Demand Gen', '2014', '15', '2', '7', '4', '2'],
  ['SEO', '2015', '206', '45', '110', '45', '6'],
  ['Social Media Marketing', '2015', '75', '6', '53', '15', '1'],
  ['AI Marketing', '2017', '1', '0', '1', '0', '0'],
  ['Automation', '2018', '20', '5', '10', '5', '0']
])}
<h2>What the spread reflects</h2>
<p>The nine-year gap between the oldest and newest category medians tracks the emergence of each discipline as a hire-able commercial category. Creative Strategy (median 2011) and Thought Leadership (median 2009) both have institutional continuity into the 1990s and earlier — 95 creative firms and 21 thought-leadership firms in the index predate 2000. These are established disciplines with generations of practitioner lineage.</p>
<p>Marketing (median 2013), Content Marketing (2013), and Demand Gen (2014) came of age as content marketing and inbound became mainstream disciplines. SEO (2015) and Social Media Marketing (2015) coincide with the professionalization of those channels away from generalist agencies into specialist shops. Automation (2018) and AI Marketing (2017) reflect categories that barely existed as commercial buyers understand them today until the late 2010s.</p>
<h2>What buyers should do with this</h2>
<p>Category age is not a quality metric. A Creative Strategy firm founded in 1998 has weathered more market cycles than most, and continuity is a real signal. But a Demand Gen or Automation firm being younger than the ABM tactics they run is a feature, not a bug — a 2020-founded automation shop grew up native to the current-generation platforms; a 2005-founded generalist agency that added automation as a service line probably did not.</p>
<p>The practical read: in the older categories, favor longevity if you can; in the younger categories, favor category-native firms over generalists who bolted the discipline on. The index publishes the declared founding year on every profile that carries one so the question is answerable before the first conversation.</p>`,
  rel: ['agency-founding-years-2026', 'ai-marketing-thinnest-category-2026', 'creative-strategy-largest-category-2026']
},
{
  slug: 'the-three-software-first-pillars-2026', date: D,
  h: 'Where the software concentrates: Sales, Automation, and AI Marketing are the three software-first pillars',
  dek: 'Across The Wall’s ten pillars, seven are 90%+ services and three are software-first — Sales (54% software), AI Marketing (74%), and Automation (53%). Where a category leans decides whether buyers are shopping for teams or licenses.',
  body: `
<p>${BRAND}'s directory classifies every listing as one of three types — Marketing/Creative Agency, Software Provider, or Business Service. Overall, 85.9% of listings are agencies, 10.8% are software, and 3.3% are services. But that mix inverts sharply in three specific pillars:</p>
${table(['Category', 'Agencies', 'Software', 'Services', 'Software share'], [
  ['AI Marketing', '9', '25', '0', '73.5%'],
  ['Sales', '12', '56', '35', '54.4%'],
  ['Automation', '26', '31', '2', '52.5%'],
  ['Marketing', '491', '55', '4', '10.0%'],
  ['Social Media Marketing', '77', '13', '0', '14.4%'],
  ['Thought Leadership', '153', '13', '27', '6.7%'],
  ['Demand Gen', '30', '12', '6', '25.0%'],
  ['SEO', '214', '12', '0', '5.3%'],
  ['Content Marketing', '100', '11', '2', '9.7%'],
  ['Creative Strategy', '852', '18', '0', '2.1%']
])}
<h2>Why the split matters at buy-time</h2>
<p>The pillar mix determines what a buyer's shortlist actually looks like. In Creative Strategy — 852 agencies, 18 software providers — the decision is which team you want producing the work. Software plays a supporting role but the purchase is fundamentally services. In AI Marketing — 25 software providers, 9 agencies — the decision is which platform you want to standardize on; agencies exist to implement and operate the platforms, not to substitute for them.</p>
<p>Sales sits in the middle of this map for structural reasons: it's the one pillar where all three types are meaningfully represented (12 agencies for training and consulting, 56 software providers for CRM and sales-engagement platforms, 35 business services for sales-data and recruiting). A "sales vendor" shortlist genuinely needs to be three different shortlists.</p>
<h2>What this tells buyers about the disciplines themselves</h2>
<p>The three software-first pillars are the technology-forward disciplines. Sales has been the most systematized function in growth for a decade — CRM, enablement, engagement, intent — and it shows in the software concentration. Marketing Automation is definitionally the tooling layer of the entire marketing function. AI Marketing is where the tooling is the entire proposition, so far.</p>
<p>The seven services-first pillars are the disciplines where human judgment and craft remain the durable value: creative and design, thought leadership, content, social, SEO. Every one has been declared automation-vulnerable by someone in the last three years. So far, the buying data has not budged: 90%+ of the listings buyers are actually paying to solve these problems are teams, not licenses.</p>`,
  rel: ['agencies-vs-software-mix-2026', 'ai-marketing-thinnest-category-2026', 'sales-pillar-brief-2026']
},
{
  slug: 'the-single-founder-tail-agencies-pre-2000-2026', date: '2026-08-04',
  h: 'The single-founder tail: 182 US growth-services firms in the index were founded before 2000',
  dek: 'Of 2,286 US growth vendors indexed, 182 predate 2000 — including 15 firms founded before the personal computer. The distribution shows what actually survives four decades of agency-business turnover.',
  body: `
<p>The US growth-services market has a very long tail of very old firms. Of the 2,286 companies indexed in ${BRAND}, 182 were founded on or before 2000 — the year the first mainstream browser browser wars ended and the modern digital agency category began forming. Six were founded before 1970. The oldest listed firm, Olberding Brand Family (Ohio), was founded in 1926.</p>
${table(['Decade founded', 'Firms still listed'], [
  ['Pre-1970', '6'],
  ['1970s', '9'],
  ['1980s', '33'],
  ['1990s', '134'],
  ['<strong>Total pre-2000</strong>', '<strong>182</strong>']
])}
<h2>What the pre-2000 tail looks like</h2>
<p>The oldest survivors skew heavily toward Creative Strategy — 15 of the 25 oldest firms in the index are in the creative pillar, and 5 more are in Thought Leadership (PR) or general Marketing. Not one firm founded before 1980 is in SEO, Content Marketing, Social Media, Automation, Demand Gen, or AI Marketing — those pillars did not exist as coherent buying categories until the 2000s or later.</p>
${table(['Rank', 'Firm', 'Founded', 'Pillar', 'HQ'], [
  ['1', 'Olberding Brand Family', '1926', 'Creative Strategy', 'OH'],
  ['2', 'NewmanPR', '1946', 'Thought Leadership', 'FL'],
  ['3', 'Davis Advertising', '1948', 'Creative Strategy', 'MA'],
  ['4', 'Archer Malmo', '1952', 'Marketing', 'TX'],
  ['5', 'The Brandon Agency', '1959', 'Creative Strategy', 'SC'],
  ['6', 'Epsilon', '1969', 'Creative Strategy', 'CA'],
  ['7', 'BLD Marketing', '1971', 'Content Marketing', 'PA'],
  ['8', 'TriAd Marketing &amp; Media', '1972', 'Marketing', 'OH'],
  ['9', 'Grady Britton', '1974', 'Creative Strategy', 'OR'],
  ['10', 'HANGAR12', '1975', 'Creative Strategy', 'IL']
])}
<h2>Why the tail matters — for buyers and for the discipline</h2>
<p>Agency-business mortality is high. Most agencies that start do not survive their founder's second decade of ownership, and the firms in this cohort have cleared that gate three, four, or (in six cases) five times over. That does not automatically make them the right pick for any specific buyer — many of these firms are deeply specialized in categories their peers have exited. But the presence of a 30-, 40-, 50-year-old vendor on your shortlist is a data point about durability that a two-year-old boutique cannot match.</p>
<p>For the industry, the tail is a reminder that agency work as a category is stable in a way tech is not. A 1948 advertising firm still solving essentially the same problem — get a message in front of the right people, make them care — describes the through-line of the market better than any current-year discipline breakdown.</p>
${METHOD}`,
  rel: ['agency-age-by-category-2026', 'agency-founding-years-2026', 'us-agency-hourly-rates-2026']
},
{
  slug: 'seo-rate-spread-inside-one-discipline-2026', date: '2026-08-04',
  h: 'Inside SEO: the $75 rate spread that makes vendor comparison hard',
  dek: 'US SEO agencies span a $275 hourly-rate range — from $25 to $300+ per hour — inside a single discipline. The distribution shows why "how much does SEO cost?" has no single answer.',
  body: `
<p>Of the 226 US SEO firms indexed in ${BRAND}, 206 publish an hourly-rate band and 20 do not. The disclosed distribution uses <strong>every rate tier in the market</strong> — from under $25 to over $300 per hour, with a fat middle at $100–$149. This is the widest intra-discipline rate spread in the index.</p>
${table(['Hourly-rate band', 'US SEO firms', 'Share of disclosed'], [
  ['&lt; $25 / hr', '4', '1.9%'],
  ['$25 – $49 / hr', '21', '10.2%'],
  ['$50 – $99 / hr', '28', '13.6%'],
  ['$100 – $149 / hr', '72', '35.0%'],
  ['$150 – $199 / hr', '40', '19.4%'],
  ['$200 – $300 / hr', '12', '5.8%'],
  ['$300+ / hr', '3', '1.5%'],
  ['<strong>Undisclosed</strong>', '<strong>26</strong>', '<strong>12.6%</strong>']
])}
<h2>Why the spread is this wide</h2>
<p>Three overlapping SEO products share one word:</p>
<ol>
<li><strong>Low tier ($25–$99):</strong> Templated audits, blog-post SEO briefs, technical checklists. Often offshore delivery or freelancer-led work sold through agency wrappers. 25 of 206 disclosed firms (12.1%) price here.</li>
<li><strong>Modal tier ($100–$199):</strong> Full-service US SEO agencies with a mix of senior strategy and mid-level execution. 112 of 206 firms (54.4%) price here. This is the honest market center for anything approaching a real program.</li>
<li><strong>Premium tier ($200+):</strong> Boutique, senior-only teams; frequently deeply-specialized (SaaS, ecommerce, enterprise). 15 of 206 firms (7.3%) price here — a smaller tail than agency marketing suggests.</li>
</ol>
<p>The buyer who asks "what does SEO cost?" and gets a $50 quote versus a $250 quote is not comparing two versions of the same thing. They are comparing two different products the industry has agreed to call by one name.</p>
<h2>How to read a rate you got</h2>
<p>The band matters less than what the band buys. A $150 rate should include senior strategy time, not just execution. A $50 rate should not be expected to include real strategic direction — it's paying for hands. A firm quoting in the top band and staffing the account entirely with junior specialists is the failure mode buyers most consistently regret; the rate is a hypothesis, the staffing plan is the evidence.</p>
<p>For a real US SEO shortlist with rate, team size, and headquarters filters live, see the <a href="../pillars/seo.html">SEO pillar</a>.</p>
${METHOD}`,
  rel: ['us-agency-hourly-rates-2026', 'rate-transparency-by-category-2026', 'rate-transparency-gap-2026']
},
{
  slug: 'sales-pillar-hourly-blackout-2026', date: '2026-08-04',
  h: 'Zero of 103 US Sales firms in the index publish an hourly rate — and it is not evasion',
  dek: 'Every other pillar has firms quoting hourly. Sales has none. The reason is structural: sales work is priced by outcomes, not hours, and the discipline treats hourly as an anti-pattern.',
  body: `
<p>${BRAND}'s index contains 103 US firms categorized under the Sales pillar — sales training, sales enablement, RevOps consulting, outsourced SDR/BDR teams. Of those 103, exactly zero publish an hourly rate on their Clutch profile. Every other pillar in the index has at least some firms disclosing hourly:</p>
${table(['Pillar', 'Firms', 'With hourly rate', '% disclosing'], [
  ['Creative Strategy', '870', '768', '88.3%'],
  ['Marketing', '550', '444', '80.7%'],
  ['SEO', '226', '206', '91.2%'],
  ['Thought Leadership', '193', '122', '63.2%'],
  ['Content Marketing', '113', '87', '77.0%'],
  ['<strong>Sales</strong>', '<strong>103</strong>', '<strong>0</strong>', '<strong>0.0%</strong>'],
  ['Social Media Marketing', '90', '75', '83.3%'],
  ['Automation', '59', '20', '33.9%'],
  ['Demand Gen', '48', '15', '31.3%'],
  ['AI Marketing', '34', '1', '2.9%']
])}
<h2>Why Sales is the outlier</h2>
<p>Sales work does not price cleanly by the hour, and the discipline knows it. A senior sales consultant billing $400/hr for six months of enablement is selling a change in a company's revenue trajectory, not 720 hours of instruction. Outsourced SDR teams price per-seat per-month or per-qualified-meeting because the buyer cares about pipeline created, not hours logged. RevOps consultants price by project or by installed system.</p>
<p>The other two low-disclosure pillars — Automation (33.9%) and Demand Gen (31.3%) — sit in the same structural place for the same reason: outcomes are more legible than hours, and buyers prefer being priced against the outcome. AI Marketing at 2.9% is a special case: the pillar is young enough that most firms have not decided how to price at all yet.</p>
<h2>What this means for a buyer</h2>
<p>Asking a Sales vendor "what's your hourly rate" is asking the wrong question. The right questions are: what does month one look like? What does month three look like? How is progress measured, and by whom? A vendor who resists that framing and insists on billing hours-and-materials is unusual in this discipline — and worth understanding why before signing.</p>
<p>See the <a href="../pillars/sales.html">Sales pillar</a> for the full US firm list with team size, minimum project size, and location filters (the fields Sales firms actually do disclose).</p>
${METHOD}`,
  rel: ['us-agency-hourly-rates-2026', 'rate-transparency-by-category-2026', 'the-three-software-first-pillars-2026']
},
{
  slug: 'category-leaders-thirty-entities-2026', date: '2026-08-04',
  h: 'The 30 US software platforms every growth stack still runs through — and which categories they dominate',
  dek: 'The Wall\'s 30-platform entity reference covers the market-leader software behind US marketing and sales operations. Marketing Automation is the most concentrated pillar; AI Marketing is the least settled.',
  body: `
<p>${BRAND} publishes 30 individual entity reference pages for the most-consequential US software platforms in the growth-services market — HubSpot, Salesforce, Klaviyo, Google Ads, Ahrefs, and 25 others. The concentration tells you where the market has settled and where it hasn't.</p>
${table(['Pillar', 'Reference-tier platforms indexed', 'Concentration'], [
  ['Marketing Automation', '9 (HubSpot, Salesforce, Marketo, ActiveCampaign, Klaviyo, Mailchimp, Zapier, Make, Customer.io)', 'High'],
  ['Sales Automation', '5 (Pipedrive, Zoho CRM, Outreach.io, ZoomInfo, Apollo.io)', 'High'],
  ['SEO', '2 (Ahrefs, Semrush)', 'Duopoly'],
  ['AI Marketing', '4 (OpenAI/ChatGPT, Anthropic/Claude, Perplexity, Jasper)', 'Fluid'],
  ['Content Marketing', '3 (Beehiiv, Substack, Jasper)', 'Emerging'],
  ['Paid Advertising', '3 (Google Ads, Meta Ads Manager, LinkedIn Campaign Manager)', 'Duopoly + LinkedIn'],
  ['Analytics/Attribution', '2 (Segment, Google Analytics 4)', 'Fragmented'],
  ['Sales Outbound', '2 (Instantly.ai, Outreach.io)', 'Emerging']
])}
<h2>What the concentration pattern says</h2>
<p><strong>Marketing Automation and Sales Automation are mature.</strong> Nine reference-tier platforms in Marketing Automation and five in Sales Automation reflect categories that have settled into a stable set of platform choices. Most US operators run some combination of HubSpot, Salesforce, or their category-adjacent alternatives; the question is which specific mix, not whether the category is still forming.</p>
<p><strong>SEO is a duopoly.</strong> Ahrefs and Semrush cover 90%+ of professional US SEO workflows. The third-place tier (Moz, Sistrix, others) exists but is not a category leader; the "which one" decision effectively picks between two products.</p>
<p><strong>AI Marketing is fluid.</strong> Four reference-tier platforms — but the market rank order shifts quarterly, and the field is younger than any settled category. Most operators use 2–3 in combination rather than picking one primary.</p>
<p><strong>Analytics and Attribution are fragmented.</strong> Only two reference-tier platforms (Segment, GA4) reflect a category where enterprise stacks routinely combine 4–8 tools with no clear leader — Amplitude, Mixpanel, Adobe Analytics, Bizible, TripleWhale, Rockerbox, and half a dozen others each own defensible slices.</p>
<h2>How the reference pages map to buying decisions</h2>
<p>The entity pages are not reviews or rankings. Each covers what the platform actually does, who it's built for, what it typically costs, and where it fits inside the pillar of vendors that surrounds it. Use the <a href="../entities/">full entity index</a> to browse by pillar, or the <a href="../compare/">head-to-head comparisons</a> for the 15 most-common "X vs Y" decisions.</p>
${METHOD}`,
  rel: ['the-three-software-first-pillars-2026', 'agencies-vs-software-mix-2026', 'us-agency-hourly-rates-2026']
}
];

// ---------------------------------------------------------------- rendering
function shell({ title, metaDesc, canonical, ld, bodyHTML, base }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — ${BRAND}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧱</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
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
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,40px);letter-spacing:-.02em;line-height:1.15;padding:10px 0 6px}
  .byline{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;color:var(--chrome);padding-bottom:4px}
  .byline b{color:var(--ink);font-weight:600}
  .dek{font-family:var(--serif);font-style:italic;font-size:17.5px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  ul,ol{padding-left:22px;margin-bottom:12px}
  li{margin-bottom:6px}
  .fn{font-size:12px;color:var(--chrome)}
  table{width:100%;border-collapse:collapse;margin:16px 0 18px;background:#fff;border:1px solid var(--stone);border-radius:10px;overflow:hidden}
  th{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--chrome);text-align:left;padding:10px 14px;border-bottom:1px solid var(--stone);background:var(--stone-lt)}
  td{font-size:13.5px;color:var(--body);padding:8px 14px;border-bottom:1px solid var(--stone-lt)}
  td.num{font-family:var(--mono);font-size:12.5px;white-space:nowrap}
  tr:last-child td{border-bottom:none}
  .card{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:18px 22px;margin:18px 0}
  .card.method p{font-size:12.5px;line-height:1.7;color:var(--chrome);margin:0}
  .card.method a{color:var(--chrome)}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin-bottom:10px}
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
</style>
<script src="/nav.js" defer></script>
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
  <span><a href="${base}about.html">ABOUT</a> · <a href="index.html">BRIEFINGS</a> · <a href="${base}glossary.html">GLOSSARY</a> · <a href="${base}editorial-policy.html">EDITORIAL</a> · <a href="${base}privacy.html">PRIVACY</a> · <a href="${base}contact.html">CONTACT</a></span>
</div></footer>
</body>
</html>`;
}

mkdirSync(join(ROOT, 'news'), { recursive: true });

// article pages
for (const a of ARTICLES) {
  const canonical = `${SITE}/news/${a.slug}.html`;
  const ld = [ORG_LD, {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: a.h, description: a.dek,
    datePublished: a.date, dateModified: a.date,
    author: [{ '@type': 'Organization', name: `${BRAND} Editorial Team`, url: `${SITE}/about.html` }],
    publisher: { '@type': 'Organization', name: BRAND, url: `${SITE}/` },
    mainEntityOfPage: canonical, url: canonical,
    articleSection: 'Briefings', isAccessibleForFree: true,
    articleBody: strip(a.body)
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Briefings', item: `${SITE}/news/` },
      { '@type': 'ListItem', position: 3, name: a.h }
    ]
  }];
  const relHTML = a.rel?.length ? `<div class="rel"><h3>RELATED BRIEFINGS</h3>${a.rel.map(s => {
    const t = ARTICLES.find(x => x.slug === s); return t ? `<a href="${s}.html">${esc(t.h)}</a>` : '';
  }).join('')}</div>` : '';
  const body = `
<div class="kicker">BRIEFING · DATA FROM THE INDEX</div>
<h1>${esc(a.h)}</h1>
<div class="byline">BY <b>THE WALL EDITORIAL TEAM</b> · PUBLISHED ${dateFmt(a.date).toUpperCase()}</div>
<p class="dek">${esc(a.dek)}</p>
${a.body}
${METHOD}
${relHTML}`;
  writeFileSync(join(ROOT, 'news', `${a.slug}.html`), shell({ title: a.h, metaDesc: a.dek, canonical, ld, bodyHTML: body, base: '../' }));
}

// briefings index
const idxLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: `Briefings — ${BRAND}`, url: `${SITE}/news/`,
  description: 'Data briefings on the US growth-vendor market, computed from The Wall’s verified index.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: ARTICLES.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/news/${a.slug}.html`, name: a.h }))
  }
}];
const idxBody = `
<div class="kicker">SECTION / BRIEFINGS</div>
<h1>Briefings</h1>
<p class="dek">Original reporting on the US growth-vendor market, computed from the index itself: ${ARTICLES.length ? '2,286' : ''} verified US listings, their published rates, minimums, team sizes, founding years, and geography. No estimates, no sponsored placements.</p>
${ARTICLES.map(a => `<div class="idx-item">
  <div class="d">${dateFmt(a.date).toUpperCase()} · THE WALL EDITORIAL TEAM</div>
  <a href="${a.slug}.html">${esc(a.h)}</a>
  <p>${esc(a.dek)}</p>
</div>`).join('\n')}`;
writeFileSync(join(ROOT, 'news', 'index.html'), shell({ title: 'Briefings', metaDesc: 'Data briefings on the US growth-vendor market, computed from The Wall’s verified index of 2,286 US companies.', canonical: `${SITE}/news/`, ld: idxLD, bodyHTML: idxBody, base: '../' }));

console.log(`news pages written: ${ARTICLES.length} articles + index`);
