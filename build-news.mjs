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
  <span><a href="${base}about.html">ABOUT</a> · <a href="index.html">BRIEFINGS</a> · <a href="${base}editorial-policy.html">EDITORIAL</a> · <a href="${base}privacy.html">PRIVACY</a> · <a href="${base}contact.html">CONTACT</a></span>
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
