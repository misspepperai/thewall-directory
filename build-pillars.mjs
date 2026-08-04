// Generates the Phase-2 topical layer: pillars/{slug}.html (10 discipline hubs with FAQPage
// schema; FAQ questions sourced from live Google People-Also-Ask harvests 2026-08-03, answers
// original) + glossary.html (DefinedTermSet hub). Index stats are real aggregates from
// directory_companies as of 2026-08-03. Run: node build-pillars.mjs
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

// ---------------------------------------------------------------- pillars
// stats = real index aggregates, 2026-08-03 snapshot
const PILLARS = [
{
  slug: 'sales', cat: 'Sales', no: '01',
  title: `US Sales Training, Enablement & RevOps Firms: 103 Verified Providers`,
  metaDesc:`103 verified US sales-capability providers — sales training, enablement software, CRM and sales-data platforms, and revenue-operations consulting for companies past $5M in revenue whose selling has outgrown the founder.`,
  mktH2: `The US sales-capability market at a glance`,
  dek: 'The selling-capability market: sales training, enablement software, CRM and data providers, recruiting, and revenue operations — for companies that have outgrown founder-led selling.',
  stats: { n: 103, rated: 0, reviews: 0, note: 'This pillar is compiled from curated industry sources rather than agency-review marketplaces, so listings here carry no review data.' },
  wall: `The sales wall looks like this: revenue plateaus while headcount grows, the founder is still the best closer in the building, win rates sag when anyone else runs the deal, and the CRM is a graveyard of half-entered opportunities nobody trusts for a forecast. A company at $5M+ with 25 or more employees usually hits it when the informal selling motion that got it there stops scaling.`,
  what: `The Sales category covers vendors that improve a company's ability to <em>sell</em> — as distinct from generating more pipeline to sell to, which is the separate <a href="demand-gen.html">Demand Gen</a> discipline. That means five solution shapes: sales training and coaching firms, sales-enablement and engagement software, CRM and sales-data providers, sales recruiting firms, and revenue-operations (RevOps) consultancies that align the whole go-to-market machine.`,
  vendors: `Engagements differ sharply by shape. Training firms sell programs and coaching retainers measured in quarters. Software providers sell per-seat subscriptions. Data vendors sell access to contact and intent databases. RevOps consultancies sell process work: pipeline definitions, CRM rebuilds, forecasting discipline, and the handoffs between marketing, sales, and customer success. The right starting point depends on which is actually broken — skill, tooling, data, staffing, or process.`,
  faq: [
    { q: 'What is revenue operations (RevOps)?', a: 'Revenue operations is the business function that aligns marketing, sales, and customer-success teams around one process, one data model, and one connected tool stack, so revenue becomes predictable rather than departmental. RevOps consultancies typically rebuild pipeline stages, clean up the CRM, define handoffs, and install forecasting discipline.' },
    { q: 'What is the difference between sales operations and revenue operations?', a: 'Sales operations optimizes the sales team alone — pipeline hygiene, rep productivity, sales tooling. Revenue operations is the broader frame: it connects marketing, sales, and customer success across the entire customer lifecycle, treating them as one revenue engine. Sales ops is effectively a subset of RevOps.' },
    { q: 'What is sales enablement?', a: 'Sales enablement is the practice of equipping salespeople with the content, coaching, training, and tools they need to sell effectively — from onboarding programs and playbooks to software that tracks which materials actually move deals. Enablement vendors in this category sell both the software platforms and the programs themselves.' },
    { q: 'What are the four pillars commonly cited in RevOps?', a: 'Most frameworks organize revenue operations into four pillars: strategy and alignment (shared goals across teams), process and governance (defined stages and handoffs), technology and automation (an integrated stack instead of disconnected tools), and data and insights (a single source of truth for reporting and forecasting).' },
    { q: 'When should a company hire a sales trainer or consultant?', a: 'The reliable trigger is founder dependence: when deals close at a healthy rate only when the founder or one senior seller runs them, the selling motion has not been transferred to the team. Training addresses skill gaps; a RevOps or sales consultant addresses process gaps; recruiting addresses staffing gaps. Diagnose which gap it is before buying, because the three engagements look nothing alike.' }
  ],
  relBriefings: ['sales-pillar-brief-2026', 'agencies-vs-software-mix-2026'],
  relPillars: ['demand-gen', 'automation']
},
{
  slug: 'marketing', cat: 'Marketing', no: '02',
  title: `US Marketing Agencies: 550 Verified Full-Service Firms`,
  metaDesc:`550 verified US marketing agencies — full-service strategy, campaigns, digital execution, and analytics for companies past $5M in revenue. Structured data on rates, minimum project sizes, team size, and specialties on every listing.`,
  mktH2: `The US marketing agency market at a glance`,
  dek: 'Full-service and specialist marketing agencies — strategy, campaigns, digital execution, and analytics — the index’s second-largest category at 550 US firms.',
  stats: { n: 550, rated: 416, reviews: 8714, rating: '4.91' },
  wall: `The marketing wall is rarely a lack of activity — it is activity without compounding. Campaigns run, content ships, budgets get spent, and the pipeline stays flat. Companies hit it when the generalist who ran marketing at $2M cannot orchestrate the specialist channels required at $10M, or when a first agency delivered deliverables instead of outcomes.`,
  what: `The Marketing category holds full-service and multi-channel agencies: firms that own strategy and execution across several channels at once — positioning, campaigns, paid media, email, web, and analytics — rather than specializing in a single discipline. Single-discipline specialists live in their own pillars (<a href="seo.html">SEO</a>, <a href="content-marketing.html">Content Marketing</a>, <a href="social-media-marketing.html">Social Media Marketing</a>, <a href="creative-strategy.html">Creative Strategy</a>).`,
  vendors: `Most firms here sell monthly retainers scoped to a channel mix, with project pricing for defined builds like a website or a rebrand. Across the index's engagement data, the most common hourly band among US agencies is $150–$199, the most common minimum project size is $5,000, and the typical firm runs a 10–49 person team — useful baselines for judging any specific quote.`,
  faq: [
    { q: 'What does a marketing agency do?', a: 'A marketing agency plans and executes the work that attracts and converts customers: strategy and positioning, campaign planning, paid and organic channel execution, creative production, and performance measurement. Full-service firms own several of these at once; specialist firms go deep on one.' },
    { q: 'Is it worth using a marketing agency?', a: 'It is worth it when three things are true: the product already sells (an agency amplifies what works — it cannot invent product-market fit), the budget can sustain a real engagement for at least a quarter or two, and the internal team lacks the time or specialist skill the channel requires. When any of those is false, fixing that first outperforms hiring anyone.' },
    { q: 'How do marketing agencies make money?', a: 'Four models dominate: monthly retainers for ongoing scope, fixed project fees for defined deliverables, a percentage of managed ad spend (commonly 10–20%), and performance pricing tied to leads or revenue. Retainers remain the default for ongoing multi-channel work; ad-spend percentage is standard where paid media is the core service.' },
    { q: 'How do I choose a marketing agency?', a: 'Define the outcome first, then filter structurally: specialty match, engagement data (rate band, minimum, team size), and evidence of work on companies your size. In conversations, weight the firms that diagnose before prescribing. Ratings will not narrow the field — across this index, category average ratings all sit between 4.88 and 4.94 — so structured facts and fit questions do the real filtering.' },
    { q: 'How many marketing agencies are there in the US?', a: 'Counts vary with the definition: industry trackers estimate roughly 41,000 dedicated marketing firms, and well over 100,000 businesses when advertising and digital agencies are included. The Wall’s Marketing category deliberately lists a vetted 550 — US-based, verified live, and structured for comparison — rather than attempting an exhaustive census.' }
  ],
  relBriefings: ['us-agency-hourly-rates-2026', 'clutch-ratings-compression-2026', 'agency-team-sizes-2026'],
  relPillars: ['seo', 'creative-strategy', 'demand-gen']
},
{
  slug: 'seo', cat: 'SEO', no: '03',
  title: `US SEO Agencies & SEO Services: 226 Verified Firms`,
  metaDesc:`226 verified US SEO agencies and SEO services firms — technical health, content, authority-building, and AI-search presence. Real hourly bands, minimum project sizes, and team data on every listing.`,
  mktH2: `The US SEO agency market at a glance`,
  dek: 'Search engine optimization agencies and consultancies: 226 US firms that build organic visibility — technical health, content, authority, and now AI-search presence.',
  stats: { n: 226, rated: 190, reviews: 4810, rating: '4.94' },
  wall: `The SEO wall announces itself quietly: organic traffic flat for six quarters, competitors outranking the company for its own category terms, a site that was rebuilt for looks and lost its rankings, and a blog nobody reads because it answers questions nobody asks. It compounds slowly — which is why it is usually noticed years late.`,
  what: `SEO firms build organic search visibility across four fronts: technical health (crawlability, speed, structure), on-page content matched to search intent, off-page authority (links and citations), and measurement. The discipline now extends past Google's blue links into AI-generated answers — optimizing so language-model search surfaces cite the company — sometimes labeled GEO (generative engine optimization) or AEO (answer engine optimization).`,
  vendors: `SEO is sold almost entirely on monthly retainers, because rankings are cumulative: audits and fixes early, then a compounding cadence of content and authority work. Within this index's engagement data, SEO is one of the most review-covered categories — 190 of its 226 firms carry public ratings — and its firms cluster in the same $100–$199 hourly bands as the broader agency market.`,
  faq: [
    { q: 'What does an SEO agency do?', a: 'An SEO agency improves how visibly a site appears when buyers search. The work spans technical fixes (site speed, crawlability, indexing), keyword and intent research, content creation and optimization, authority building through links and mentions, and reporting that ties rankings to revenue rather than vanity metrics.' },
    { q: 'How much does an SEO agency typically cost?', a: 'US retainers commonly run from roughly $1,500 to $10,000+ per month depending on scope and competitiveness, with hourly consulting typically $100–$250. Those figures are consistent with this index’s broader agency data, where the most common disclosed hourly band is $150–$199 and most minimum project sizes sit at $10,000 or below.' },
    { q: 'Is SEO still worth it, or is it being replaced?', a: 'The discipline is evolving, not dying: organic search remains one of the largest sources of commercial traffic, and the rise of AI-generated answers adds a new surface to optimize for rather than eliminating the old one. The practical shift is that content now has to earn citations in AI answers as well as rankings in traditional results.' },
    { q: 'Can a company do SEO on its own?', a: 'The basics, yes: clear titles and descriptions, helpful content that answers real questions, and a Google Business Profile for local visibility. Where in-house effort typically stalls is technical remediation, competitive national keywords, and authority building at scale — the three areas where specialist firms earn their retainers.' },
    { q: 'Is it worth hiring an SEO agency?', a: 'It pays off when organic search is a meaningful acquisition channel for the category, leadership can commit at least one to two quarters before judging results, and the site has real technical or authority gaps an internal team cannot close. For a company with no search demand in its category, the same budget usually does more in another pillar.' }
  ],
  relBriefings: ['us-agency-hourly-rates-2026', 'agency-minimum-project-sizes-2026'],
  relPillars: ['content-marketing', 'marketing', 'ai-marketing']
},
{
  slug: 'thought-leadership', cat: 'Thought Leadership', no: '04',
  title: `US Thought Leadership Agencies & Executive Branding Firms: 193 Verified`,
  metaDesc:`193 verified US thought-leadership vendors — executive ghostwriting, LinkedIn programs, PR placement, book programs, speaking-circuit development, and personal-brand agencies for named authorities.`,
  mktH2: `The US thought leadership market at a glance`,
  dek: 'Firms that turn executive expertise into market position: ghostwriting, PR, executive branding, books, and speaking — 193 US vendors in the index.',
  stats: { n: 193, rated: 118, reviews: 1636, rating: '4.92' },
  wall: `The thought-leadership wall: the company is genuinely good at what it does, and nobody outside its client list knows it. Competitors with weaker delivery get the podcast invitations, the conference slots, and the inbound deals, because their executives are visible and yours are not. Expertise without an audience is a wall that referrals alone cannot climb.`,
  what: `Thought-leadership vendors convert real expertise into public authority. The category spans executive ghostwriting and LinkedIn programs, public-relations firms that place executives in trade and business media, book programs, speaking-circuit development, and personal-brand agencies. The common thread: the asset being built is the credibility of a person or firm, not a product campaign.`,
  vendors: `Engagements are typically retainers built around a publishing cadence — articles, columns, social programs, media placements — or defined projects like a book or a speaking reel. Because the deliverable is credibility, sourcing discipline matters more here than anywhere else: programs grounded in an executive's actual experience compound, while manufactured opinions erode the exact trust they were bought to build.`,
  faq: [
    { q: 'What is thought leadership marketing?', a: 'Thought-leadership marketing positions a company or executive as a trusted authority by publishing genuinely useful expertise — original insight, data, and perspective — rather than promotional content. Done well, it shapes how a market thinks about a problem, which is what earns media invitations, speaking slots, and inbound deals.' },
    { q: 'What does thought-leadership content look like in practice?', a: 'The recognizable formats are original research and data studies, well-argued essays and op-eds that take a defensible position, executive LinkedIn programs with a steady cadence, trade-media bylines, books, and conference talks. What separates them from ordinary content marketing is authorship: a named person with real experience staking a claim.' },
    { q: 'Why is it called thought leadership?', a: 'Because the status is conferred, not claimed: a thought leader is someone a market treats as a reference point on a topic. The label describes an outcome — being the voice others cite — which is why self-declared thought leadership without published substance reads as marketing and fails.' },
    { q: 'How is thought leadership different from content marketing?', a: 'Content marketing answers the questions buyers already ask, at scale, to attract and convert them. Thought leadership argues for how buyers should think, from a named expert. They complement each other: content marketing captures demand, thought leadership creates preference and pricing power before the buyer ever compares vendors.' },
    { q: 'What does a business get out of funding thought leadership?', a: 'The commercial returns are inbound opportunities that arrive pre-sold, easier access to media and stages, recruiting pull, and pricing power — buyers negotiate less with the firm they consider the authority. Programs monetize indirectly through those effects, and directly through books, speaking fees, and training built on the platform.' }
  ],
  relBriefings: ['creative-strategy-largest-category-2026', 'the-wall-launches-2286-us-growth-vendors'],
  relPillars: ['content-marketing', 'marketing']
},
{
  slug: 'creative-strategy', cat: 'Creative Strategy', no: '05',
  title: `US Creative Agencies: 870 Verified Branding, Design & Video Firms`,
  metaDesc:`870 verified US creative agencies — branding and identity firms, design studios, video and production houses, and full-service creative shops. The largest category in The Wall's index; structured data makes the shortlist workable.`,
  mktH2: `The US creative agency market at a glance`,
  dek: 'The index’s largest pillar: 870 branding, design, video, and full-service creative firms — 38% of all listings, and the hardest selection problem in the market.',
  stats: { n: 870, rated: 716, reviews: 13478, rating: '4.94' },
  wall: `The creative wall: the product outgrew the brand. The website undersells the work, the deck looks like 2018, every channel has its own visual dialect, and enterprise buyers hesitate because the company looks smaller than it is. Creative debt behaves like technical debt — invisible day to day, expensive at exactly the moments that matter.`,
  what: `Creative Strategy is the index's largest category and spans branding and identity firms, design studios, video and production houses, and full-service creative agencies. What unifies them: they build the assets and the visual-verbal system through which every other marketing discipline speaks — positioning made visible.`,
  vendors: `Brand and identity work is typically sold as defined projects — research, strategy, identity system, guidelines — while production (video, design, content assets) runs as retainers or per-deliverable pricing. With 870 firms, this pillar is where structural filters earn their keep: within the index's engagement data its firms span every rate band and team size, and 716 of them carry public ratings averaging 4.94 — too uniform to differentiate on stars alone.`,
  faq: [
    { q: 'What is a creative agency?', a: 'A creative agency builds the expressive layer of a business: brand identity, design systems, websites, video, campaigns, and the storytelling that carries them. Where a marketing agency optimizes reach and conversion, a creative agency determines what the audience actually sees, hears, and remembers.' },
    { q: 'What is the difference between a creative agency and a marketing agency?', a: 'Creative agencies own the artistic and identity side — brand, design, story, production. Marketing agencies own the distribution and performance side — channels, media, measurement. The boundary blurs at full-service firms, but the purchase decision is usually clear: buy creative when the message and identity are the problem, marketing when reach and conversion are.' },
    { q: 'How do creative agencies charge?', a: 'Identity and strategy work is usually fixed-fee by project phase; production and ongoing design run as retainers or per-deliverable rates; advertising-led shops may take a percentage of media spend. Across this index’s disclosed data, US agency rates cluster at $100–$199 per hour, with $150–$199 the single most common band.' },
    { q: 'How much do creative agencies charge per hour?', a: 'Published US rates in this index concentrate between $100 and $199 per hour — 69.5% of all disclosed agency rates — with boutique shops below that range and senior specialist firms in the $200–$300 band. Only 1.5% of disclosing firms price above $300.' },
    { q: 'Will AI replace creative agencies?', a: 'AI is compressing production — drafts, variations, and routine assets now take hours instead of weeks — but the scarce work was never production. Judgment about what a brand should say, taste, and accountability for the outcome remain human, which is why the likelier outcome is smaller teams shipping more, not the disappearance of the discipline.' }
  ],
  relBriefings: ['creative-strategy-largest-category-2026', 'clutch-ratings-compression-2026', 'us-agency-hourly-rates-2026'],
  relPillars: ['thought-leadership', 'content-marketing', 'marketing']
},
{
  slug: 'automation', cat: 'Automation', no: '06',
  title: `US Marketing Automation Platforms & Implementation Firms: 59 Verified`,
  metaDesc:`59 verified US marketing-automation vendors — lifecycle email platforms, workflow and trigger systems, CRM integration, and the marketing-operations consultancies that install and run them.`,
  mktH2: `The US marketing automation market at a glance`,
  dek: 'Marketing-automation platforms and the implementation firms that make them work: 59 US vendors covering workflows, lifecycle email, CRM integration, and operations.',
  stats: { n: 59, rated: 18, reviews: 302, rating: '4.88' },
  wall: `The automation wall: growth created manual work faster than headcount can absorb it. Leads sit untouched for days, follow-up depends on memory, the email platform and the CRM disagree about who a customer is, and reporting means exporting spreadsheets. The company bought tools; nobody made them into a system.`,
  what: `The Automation category covers marketing-automation software and the consultancies and agencies that implement it: lifecycle and drip email, trigger-based workflows, lead scoring and routing, CRM integration, and the marketing-operations practice that keeps the machine coherent. It is the systems pillar — the connective tissue under every other discipline.`,
  vendors: `Software here is sold as subscriptions tiered by contacts or features; implementation partners sell setup projects and ongoing operations retainers. The pattern buyers should price in: platform license fees are usually the smaller half of the real cost, with configuration, integration, and ongoing management being where automation succeeds or quietly dies.`,
  faq: [
    { q: 'What is marketing automation in simple terms?', a: 'Marketing automation is software that executes repetitive marketing tasks by rule: when a prospect does X, the system does Y — sends the email, updates the CRM, alerts sales, adjusts the segment. It replaces memory and manual effort with triggers, so follow-up happens every time, at scale.' },
    { q: 'What is a common example of marketing automation?', a: 'The classic is the abandoned-action sequence: a prospect downloads a guide or leaves a signup half-finished, and the system automatically sends a timed follow-up series. Welcome sequences, lead-nurture tracks, post-purchase follow-ups, and lead scoring that alerts sales when interest spikes are equally standard.' },
    { q: 'Which platforms dominate marketing automation?', a: 'The market ranges from all-in-one suites (HubSpot, Salesforce Marketing Cloud, Adobe Marketo) to focused engines (ActiveCampaign, Klaviyo for e-commerce, Brevo at the budget tier). Platform choice matters less than fit with the CRM and the team’s capacity to run it — which is why implementation partners exist as a category.' },
    { q: 'Is marketing automation hard to implement?', a: 'The tools are approachable; the system design is not. Mapping lifecycle stages, defining triggers that reflect real buying behavior, integrating the CRM, and keeping data clean is operations work, and it is where most self-service implementations stall. Firms in this category exist mostly to do that design and integration work.' },
    { q: 'What is the difference between marketing automation and marketing operations?', a: 'Marketing operations is the discipline — the people and process that own systems, data quality, and measurement. Marketing automation is one of its instruments. An operations practice decides what should happen and why; the automation platform executes it.' }
  ],
  relBriefings: ['agencies-vs-software-mix-2026', 'ai-marketing-thinnest-category-2026'],
  relPillars: ['ai-marketing', 'sales', 'demand-gen']
},
{
  slug: 'demand-gen', cat: 'Demand Gen', no: '07',
  title: `US Demand Generation Agencies: 48 Verified Pipeline Specialists`,
  metaDesc:`48 verified US demand-generation vendors — outbound and cold-email agencies, ABM programs, intent-data services, and paid-acquisition specialists whose deliverable is qualified sales pipeline, not clicks.`,
  mktH2: `The US demand generation market at a glance`,
  dek: 'Pipeline-generation specialists: outbound agencies, ABM and intent-data services, and paid-acquisition firms — 48 US vendors whose product is qualified opportunity flow.',
  stats: { n: 48, rated: 15, reviews: 698, rating: '4.89' },
  wall: `The demand wall is the bluntest one: not enough qualified pipeline. Referrals and word of mouth carried the company to its current size and have flattened; the sales team is good but under-fed; growth has become a function of luck rather than a number that can be planned. This is the wall companies usually feel first and understand last.`,
  what: `Demand Gen covers vendors whose deliverable is pipeline: outbound and cold-email agencies, account-based marketing (ABM) programs, intent-data services that identify in-market buyers, and paid-acquisition specialists focused on lead flow. It is deliberately separated from the <a href="sales.html">Sales</a> pillar — generating opportunities and converting them are different capabilities, bought from different vendors.`,
  vendors: `Engagements are retainers scoped to activity and volume — sequences sent, accounts targeted, meetings booked — with performance pricing (per meeting, per qualified lead) common at the outbound end. The buyer's diligence question is qualification: volume is easy to manufacture, and the difference between vendors is almost entirely in whether the meetings they set are with buyers who match the ICP.`,
  faq: [
    { q: 'What is demand generation in simple terms?', a: 'Demand generation is the marketing work that creates awareness, interest, and ultimately qualified pipeline among buyers — educating the market that is not yet shopping and being findable to the part that is. In practice, vendors in this category are hired to convert a target market into a steady flow of sales conversations.' },
    { q: 'What is the difference between demand generation and lead generation?', a: 'Demand generation builds interest and trust across the whole future market; lead generation captures contact information from buyers showing intent now. One creates the demand, the other harvests it. Most engagements blend both, but the emphasis determines the tactics — education and air cover versus outbound and capture.' },
    { q: 'What does a demand-gen engagement actually include?', a: 'Typical components: defining the ideal customer profile and target account list, building outbound sequences across email and LinkedIn, running paid programs to create air cover, using intent data to prioritize in-market accounts, and reporting on opportunities created rather than clicks. Deliverables are pipeline metrics, not impressions.' },
    { q: 'What is B2B demand generation?', a: 'The B2B variant targets buying committees rather than individuals: most of the market is not actively shopping at any moment, so the work splits into demand creation (educating out-of-market buyers so the brand is on the list when they enter the market) and demand capture (winning the small in-market fraction now). ABM is this logic applied account by account.' },
    { q: 'Is demand generation the same as sales?', a: 'No — demand gen manufactures qualified opportunities; sales converts them into revenue. The disciplines fail in each other’s absence, which is why this index separates them: a company whose reps close well but starve needs this pillar, while a company drowning in leads it cannot convert needs the Sales pillar.' }
  ],
  relBriefings: ['the-wall-launches-2286-us-growth-vendors', 'rate-transparency-gap-2026'],
  relPillars: ['sales', 'marketing', 'automation']
},
{
  slug: 'content-marketing', cat: 'Content Marketing', no: '08',
  title: `US Content Marketing Agencies & Services: 113 Verified Firms`,
  metaDesc:`113 verified US content-marketing agencies — editorial strategy, article and video production, resource and pillar-content programs, and distribution. Structured data on rates and team sizes on every listing.`,
  mktH2: `The US content marketing services market at a glance`,
  dek: 'Editorial engines for demand: 113 US content agencies and studios producing the articles, video, and resources that earn attention and compound into organic growth.',
  stats: { n: 113, rated: 78, reviews: 1019, rating: '4.89' },
  wall: `The content wall: publishing happens, compounding does not. A blog with three years of posts and no rankings, videos with two-digit view counts, a newsletter written when someone has time. Content produced without a strategy for who it serves and how it gets found is cost, not asset — and the difference is invisible until the traffic report.`,
  what: `Content Marketing firms build editorial engines: strategy (what to cover, for whom, to what end), production (articles, video, podcasts, guides, tools), and distribution (search, social, email syndication). The discipline's premise is that consistently useful material attracts buyers more durably than interruption — and its craft is making "useful" specific enough to rank, get cited, and convert.`,
  vendors: `Engagements run as monthly retainers scoped to a publishing cadence, or as project builds (a resource hub, a pillar-content library). Pricing tracks the seniority of the people writing: subject-matter-expert-driven content commands more than volume production, and the market increasingly splits along exactly that line as AI compresses the cost of the commodity tier.`,
  faq: [
    { q: 'What is content marketing in simple words?', a: 'Content marketing is attracting customers by publishing material they actually want — articles, videos, guides, podcasts, tools — instead of buying their attention with ads. The content answers real questions and builds trust, so when the reader becomes a buyer, the publisher is already on the shortlist.' },
    { q: 'What does content marketing look like when it works?', a: 'Recognizable versions: an authoritative blog that owns its category’s search demand, a resource library sales teams actually send to prospects, a newsletter the market forwards, a video series that compounds subscribers. The common trait is an asset that keeps producing attention after the invoice is paid.' },
    { q: 'How does a company start content marketing seriously?', a: 'Four decisions before any writing: who exactly the content serves, which questions and searches it will own, what format the team can sustain at quality, and how success gets measured beyond traffic. Firms in this category are typically hired to make those decisions with data and then run the production cadence.' },
    { q: 'What are the "three P’s" of content marketing?', a: 'Planning, production, and promotion — strategy before creation, creation at a sustainable cadence, and deliberate distribution afterward. Most failed content programs skipped the first or third P: they produced material without a plan for who it serves or a mechanism for it to be found.' },
    { q: 'Is content marketing still worth it in the AI era?', a: 'More than before, with a caveat: generic content is now free to produce and therefore worthless, while original expertise, data, and perspective are what search engines and AI answer surfaces reward with rankings and citations. The bar moved up; the channel did not close.' }
  ],
  relBriefings: ['creative-strategy-largest-category-2026', 'agency-founding-years-2026'],
  relPillars: ['seo', 'thought-leadership', 'social-media-marketing']
},
{
  slug: 'social-media-marketing', cat: 'Social Media Marketing', no: '09',
  title: `US Social Media Marketing Agencies: 90 Verified Firms`,
  metaDesc:`90 verified US social media marketing agencies — organic presence, community management, creator and influencer programs, and paid social. Structured pricing and team-size data on every listing.`,
  mktH2: `The US social media marketing agency market at a glance`,
  dek: 'Social channel specialists: 90 US agencies running organic presence, community, creator programs, and paid social for brands that need to matter where audiences actually are.',
  stats: { n: 90, rated: 71, reviews: 1286, rating: '4.88' },
  wall: `The social wall: the company posts and nothing happens. Accounts updated out of obligation, engagement from employees and competitors, a feed that reads like a press-release archive — while competitors’ short-form video reaches the exact buyers the company wants. Presence without strategy is the most visible form of marketing debt because it is public.`,
  what: `Social Media Marketing firms own the social layer: channel strategy, content calendars and production tuned to each platform, community management, creator and influencer programs, and paid social amplification. The discipline’s center of gravity has moved to short-form video and creator-led formats — audiences increasingly treat social platforms as search engines and proof sources.`,
  vendors: `Management retainers scope by platform count and content volume; paid social is typically priced as a management fee plus a percentage of ad spend, billed separately from the media itself. Production-heavy programs (original video) price well above text-and-graphics management, which is the main variable behind the wide fee ranges buyers encounter.`,
  faq: [
    { q: 'What does a social media marketing agency do?', a: 'It runs a brand’s social presence end to end: platform strategy, content creation matched to each channel’s format, posting cadence, community management, creator partnerships, paid amplification, and reporting. The competent ones tie all of it to business outcomes rather than follower counts.' },
    { q: 'How much does a social media agency charge?', a: 'US retainers commonly run from roughly $1,000 to $10,000+ per month depending on platform count and how much original content — especially video — the scope includes, with paid-media management often priced as 10–20% of ad spend on top. Light single-platform management sits below that range; production-heavy programs sit above it.' },
    { q: 'What is the 80/20 rule as applied to social content?', a: 'Eighty percent of what a brand publishes should be genuinely valuable to the audience — useful, entertaining, or educational — and at most twenty percent overtly promotional. Feeds that invert the ratio train the algorithm and the audience to ignore them, which is the most common self-inflicted social failure.' },
    { q: 'What is the first step in a serious social media plan?', a: 'Deciding what business outcome social is for — awareness, demand, hiring, retention — and which one or two platforms the actual buyer uses. Strategy failures here are usually scope failures: five platforms run thinly instead of two run well.' },
    { q: 'Do social media agencies handle paid ads as well as organic?', a: 'Most full-service social firms run both, and the pairing is deliberate: organic content proves what resonates, and paid budget scales the proven material to cold audiences. Firms that only do one side typically partner across the line, so buyers should scope which halves they are actually purchasing.' }
  ],
  relBriefings: ['top-cities-us-growth-vendors-2026', 'agency-team-sizes-2026'],
  relPillars: ['content-marketing', 'creative-strategy', 'marketing']
},
{
  slug: 'ai-marketing', cat: 'AI Marketing', no: '10',
  title: `US AI Marketing Agencies: 34 Verified Firms`,
  metaDesc:`34 verified US AI-marketing vendors — AI-driven content systems, personalization and predictive analytics, and consultancies that install AI-first marketing operations. The index's newest and fastest-changing pillar.`,
  mktH2: `The US AI marketing agency market at a glance`,
  dek: 'The newest pillar: 34 US vendors applying AI to marketing execution — content systems, personalization, analytics, and automation — a young category the index expects to grow fastest.',
  stats: { n: 34, rated: 1, reviews: 1, note: 'Only one listing in this young pillar carries a public rating — too small a sample for a category average.' },
  wall: `The AI wall is new and already common: leadership knows AI should be compressing marketing cost and cycle time, a few tools got adopted, and nothing structural changed. Pilots without integration, content volume without quality control, and vendor claims impossible to evaluate from the outside. The capability gap is real; so is the noise.`,
  what: `AI Marketing covers vendors whose core offering is applying artificial intelligence to marketing work: AI-driven content systems, personalization and recommendation engines, predictive analytics, conversational and agent-based tools, and consultancies that implement AI-first marketing operations. Dedicated firms — as distinct from ordinary agencies that added AI language to old services — remain a small population, which is why this is the index’s thinnest pillar.`,
  vendors: `Software dominates the category’s economics — subscriptions priced by usage or seats — alongside implementation consultancies selling audits, tool selection, and workflow builds. Because the category is young, public engagement data is sparse: buyers here rely more on structured facts and direct evaluation than on review history, and should expect vendor turnover as the discipline consolidates.`,
  faq: [
    { q: 'What is AI marketing?', a: 'AI marketing is the use of machine learning and generative models to execute or optimize marketing work: producing and personalizing content, predicting which prospects convert, automating campaign decisions, and analyzing performance at a scale manual teams cannot match. Vendors package it as software, services, or both.' },
    { q: 'What are practical examples of AI in marketing?', a: 'The proven applications: recommendation and personalization engines that tailor what each visitor sees, predictive scoring that tells sales which leads to call first, generative systems drafting ad and email variants for testing, and analytics that surface which spend actually produces revenue. The pattern is scale — doing per-customer what used to be per-segment.' },
    { q: 'Will AI replace marketing teams and agencies?', a: 'It replaces tasks faster than roles: production, first drafts, reporting, and routine optimization are automating, while strategy, positioning, taste, and accountability are not. The realistic planning assumption is smaller teams with higher output — and a widening gap between companies that systematized AI and those that adopted tools piecemeal.' },
    { q: 'Can general-purpose AI tools cover a company’s marketing needs?', a: 'General assistants handle drafting, brainstorming, and analysis well, but they do not integrate with the CRM, enforce brand and compliance rules, or run unattended workflows. Vendors in this category exist precisely for that systems layer — connecting models to data, process, and quality control.' },
    { q: 'How should a buyer evaluate an AI-marketing vendor?', a: 'Ask what the system does unattended versus with a human in the loop, what data it needs and where that data goes, and what measurable outcome it changed for a comparable company. In a category this young, a vendor’s willingness to be concrete is itself the strongest available signal.' }
  ],
  relBriefings: ['ai-marketing-thinnest-category-2026', 'agencies-vs-software-mix-2026'],
  relPillars: ['automation', 'marketing', 'seo']
}
];

// ---------------------------------------------------------------- glossary
const G = (t, d, link) => ({ t, d, link });
const TERMS = [
G('A/B testing', 'Running two versions of an asset — a page, an email, an ad — against each other to learn which performs better before committing budget to either.'),
G('ABM (account-based marketing)', 'A demand strategy that targets named high-value accounts with tailored campaigns instead of broadcasting to a whole market.', 'pillars/demand-gen.html'),
G('AEO (answer engine optimization)', 'Structuring content so AI answer surfaces and voice assistants can quote it directly — schema, speakable markup, and question-shaped pages.'),
G('AI marketing', 'The use of machine learning and generative models to execute or optimize marketing work: content systems, personalization, prediction, and automation.', 'pillars/ai-marketing.html'),
G('Attribution', 'The practice of assigning credit for a sale to the marketing touches that produced it — the foundation of knowing which spend works.'),
G('Backlink', 'A link from another site to yours. Search engines read backlinks from credible sites as votes of authority, which is why link earning is a core SEO discipline.'),
G('Bottom of funnel', 'The stage where a buyer is actively comparing vendors and ready to purchase; content and campaigns here focus on proof and conversion.'),
G('Brand identity', 'The visual and verbal system a company presents — logo, typography, color, voice — and the consistency rules that make it recognizable.', 'pillars/creative-strategy.html'),
G('Brand positioning', 'The deliberate choice of what a company means in the buyer’s mind relative to alternatives — the strategic decision creative work expresses.'),
G('Buyer persona', 'A structured profile of a target buyer — role, goals, objections, buying triggers — used to keep campaigns aimed at a real person rather than a demographic.'),
G('CAC (customer acquisition cost)', 'Total sales and marketing cost divided by customers won in the period. The number every growth channel ultimately answers to.'),
G('Churn', 'The rate at which customers leave. High churn converts acquisition spend into a leaky bucket and is usually a retention problem, not a marketing one.'),
G('Cold outreach', 'Contacting prospects who have no prior relationship with the company, typically via email or LinkedIn sequences; the core motion of outbound demand generation.', 'pillars/demand-gen.html'),
G('Content calendar', 'The planning instrument of a content program: what publishes, where, when, and for which audience and keyword.'),
G('Content marketing', 'Attracting buyers by publishing material they actually want — articles, video, guides — rather than interrupting them with ads.', 'pillars/content-marketing.html'),
G('Conversion rate', 'The percentage of visitors or leads who take the desired action. Small conversion-rate changes compound across a funnel more than most budget changes.'),
G('CRM (customer relationship management)', 'The system of record for prospects and customers — contacts, deals, history. Every automation and sales process is only as good as the CRM data under it.', 'pillars/sales.html'),
G('CRO (conversion rate optimization)', 'The discipline of systematically testing pages and flows to raise the percentage of visitors who become leads or buyers.'),
G('Creative strategy', 'The plan for what marketing should say and how it should look and feel to move a specific audience — the thinking layer above design and production.', 'pillars/creative-strategy.html'),
G('Demand capture', 'Winning the buyers who are actively in-market right now — search ads, comparison content, retargeting. The harvest half of demand generation.'),
G('Demand creation', 'Educating buyers who are not yet shopping so the brand is on the shortlist when they enter the market. The patient half of demand generation.'),
G('Demand generation', 'The marketing work that converts a target market into qualified pipeline — combining demand creation and demand capture.', 'pillars/demand-gen.html'),
G('Domain authority', 'A third-party estimate of how much ranking power a site has accumulated through links and history. Directionally useful, not a Google metric.'),
G('Drip campaign', 'A pre-written email sequence delivered on a schedule or triggered by behavior — the workhorse format of marketing automation.', 'pillars/automation.html'),
G('E-E-A-T', 'Experience, Expertise, Authoritativeness, Trust — the qualities Google’s quality guidelines reward, and the reason credible authorship and sourcing affect rankings.'),
G('Email deliverability', 'Whether sent email actually reaches inboxes rather than spam folders — a function of domain reputation, authentication, and list hygiene.'),
G('First-party data', 'Data a company collects directly from its own audience — site behavior, purchase history, email engagement — increasingly valuable as third-party tracking erodes.'),
G('Funnel', 'The model of a buyer’s journey from awareness to purchase, used to diagnose where prospects stall and which discipline should fix it.'),
G('GEO (generative engine optimization)', 'Optimizing content to be cited by AI-generated answers in tools like ChatGPT and Google’s AI results — the emerging sibling of SEO.', 'pillars/seo.html'),
G('Go-to-market (GTM)', 'The complete plan for how a product reaches revenue: positioning, pricing, channels, sales motion, and the teams that run them.'),
G('Growth marketing', 'A testing-driven approach that treats the whole funnel — acquisition through retention — as one optimizable system rather than a set of channels.'),
G('ICP (ideal customer profile)', 'The definition of the company a vendor serves best — size, industry, situation. The Wall’s own ICP: US businesses past $5M revenue with 25+ employees whose leadership has hit a growth wall.'),
G('Inbound marketing', 'Earning the buyer’s attention with useful content and search visibility so prospects come to the company, rather than being pursued.'),
G('Intent data', 'Behavioral signals — research activity, content consumption — indicating an account is actively in-market, used to prioritize outbound effort.', 'pillars/demand-gen.html'),
G('Keyword research', 'Identifying the exact phrases buyers search, and their volume and difficulty, so content targets demand that actually exists.', 'pillars/seo.html'),
G('Landing page', 'A standalone page built for one campaign and one action, stripped of navigation and distraction to maximize conversion.'),
G('Lead generation', 'Capturing contact information from prospects showing interest — forms, gated content, demos — to hand qualified conversations to sales.'),
G('Lead nurturing', 'The automated sequence of useful touches that keeps not-yet-ready leads warm until they are — the patient middle of the funnel.', 'pillars/automation.html'),
G('Lead scoring', 'Ranking leads by fit and behavior so sales works the likeliest buyers first; typically automated from CRM and engagement data.'),
G('LTV (lifetime value)', 'The total revenue a customer generates over the relationship. LTV against CAC is the ratio that determines whether growth spend is sane.'),
G('Marketing automation', 'Software that executes marketing by rule — triggers, sequences, scoring, routing — replacing manual follow-up with a system.', 'pillars/automation.html'),
G('Marketing consultant', 'A senior independent advisor a company hires for strategy, diagnosis, or a defined engagement rather than ongoing execution — the alternative to hiring an agency when the wall is a decision problem, not a capacity problem.', 'hubs/marketing-consultant.html'),
G('Marketing operations', 'The discipline that owns marketing’s systems, data quality, and measurement — the function that keeps the stack coherent.', 'pillars/automation.html'),
G('Martech stack', 'The collection of software a marketing team runs — CRM, automation, analytics, content tools — and the integrations holding it together.'),
G('Media buying', 'Purchasing advertising placement — search, social, programmatic, traditional — at the best combination of audience and price.'),
G('MQL (marketing-qualified lead)', 'A lead marketing judges ready for sales attention based on fit and behavior; the definition itself is the classic sales-marketing alignment battleground.'),
G('Omnichannel', 'Coordinating every customer-facing channel so the experience is continuous — the buyer meets one brand, not five departments.'),
G('Organic traffic', 'Visitors who arrive from unpaid search results; the compounding return on SEO and content investment.', 'pillars/seo.html'),
G('Outbound marketing', 'Proactively contacting target buyers — cold email, calls, ads — rather than waiting to be found; the direct half of demand generation.'),
G('PAA (People Also Ask)', 'The question boxes in Google results revealing what buyers actually want to know — a primary research source for content and FAQ strategy.'),
G('Paid social', 'Advertising on social platforms with audience targeting; typically priced as media spend plus an agency management fee.', 'pillars/social-media-marketing.html'),
G('Pipeline', 'The dollar value of open sales opportunities. The number demand generation is accountable for creating and sales for converting.'),
G('PPC (pay-per-click)', 'Advertising bought per click, chiefly search ads — the fastest way to buy demand capture while organic programs compound.'),
G('Programmatic advertising', 'Automated buying of ad inventory through real-time auctions, targeting audiences across the web rather than specific sites.'),
G('Prospecting', 'The sales activity of finding and initiating contact with potential buyers — manual or increasingly data- and AI-assisted.', 'pillars/sales.html'),
G('Retainer', 'The standard agency pricing model: a fixed monthly fee for an agreed ongoing scope. In this index’s data, US agency retainers most commonly price at hourly bands of $100–$199.'),
G('Retargeting', 'Showing ads to people who already visited the site or engaged with content — inexpensive reach against the warmest cold audience there is.'),
G('RevOps (revenue operations)', 'The function that aligns marketing, sales, and customer success on one process, one data model, and one stack so revenue becomes forecastable.', 'pillars/sales.html'),
G('ROAS (return on ad spend)', 'Revenue attributed to advertising divided by its cost — the paid-media counterpart to CAC.'),
G('Sales enablement', 'Equipping sellers with the training, content, coaching, and tools to sell effectively; sold as both software platforms and programs.', 'pillars/sales.html'),
G('SEO (search engine optimization)', 'The discipline of earning visibility in search results through technical health, intent-matched content, and authority.', 'pillars/seo.html'),
G('SERP (search engine results page)', 'The page a search engine returns — organic results, ads, maps, AI answers — whose layout determines what visibility is worth for a given query.'),
G('Social listening', 'Monitoring social platforms for mentions of a brand, competitors, and category to catch sentiment shifts and opportunities early.'),
G('Social media marketing', 'Building brand presence and demand on social platforms through organic content, community, creators, and paid amplification.', 'pillars/social-media-marketing.html'),
G('SQL (sales-qualified lead)', 'A lead sales has accepted as a real opportunity after qualification — the handoff point where marketing’s pipeline becomes sales’ pipeline.'),
G('Technical SEO', 'The infrastructure half of SEO: crawlability, speed, indexing, structured data — everything that lets search engines read a site properly.', 'pillars/seo.html'),
G('Thought leadership', 'Building market authority by publishing genuine expertise from named people — the discipline of becoming the voice a market cites.', 'pillars/thought-leadership.html'),
G('Topical authority', 'Search credibility earned by covering a subject comprehensively — connected content that proves depth, not isolated posts.'),
G('UGC (user-generated content)', 'Content made by customers and creators rather than the brand — reviews, videos, posts — prized because audiences trust it more than ads.'),
G('UTM parameters', 'Tags appended to URLs that tell analytics exactly which campaign, channel, and ad produced each visit — the plumbing of attribution.'),
G('Workflow automation', 'Rule-based execution of multi-step processes across tools — the general case of which marketing automation is the marketing-specific instance.', 'pillars/automation.html'),
// --- expansion batch 2026-08-04 ---
G('Above the fold', 'The portion of a webpage visible without scrolling. What appears above the fold gets an outsized share of attention — the reason headline, offer, and primary CTA fight for it.'),
G('Account executive (AE)', 'The salesperson who owns closing a deal — running discovery, giving demos, negotiating contracts. Distinct from the SDR who books the meeting.'),
G('Account manager (AM)', 'The relationship owner post-sale, responsible for retention, expansion, and reference activity within a customer account.'),
G('Ad creative', 'The image, video, and copy an ad consists of. In paid social especially, creative — not targeting — is what most decides whether a campaign works.'),
G('Ad fatigue', 'The decline in an ad\'s performance as an audience sees it repeatedly. The signal to refresh creative before a channel stops working.'),
G('Ad Rank', 'Google Ads\' internal score that decides ad position — a function of bid, expected CTR, ad relevance, and landing-page experience.'),
G('AI Overview', 'The AI-generated answer Google places at the top of many search results. Content that gets cited inside it wins visibility that no longer requires the click.'),
G('AOV (average order value)', 'Total revenue divided by orders. Lifting AOV is often faster than lifting conversion rate and always cheaper than acquiring more traffic.'),
G('ARR (annual recurring revenue)', 'The annualized value of a subscription business\'s active contracts. The metric most SaaS is valued on.'),
G('Attribution model', 'The rule that decides how credit for a sale gets split across the marketing touches that led to it — first-touch, last-touch, linear, time-decay, data-driven. Every model tells a different story.'),
G('Audience', 'A defined group of people a message is aimed at. The unit paid platforms buy against, and the level marketing is planned at.'),
G('BANT', 'A four-part sales qualification framework — Budget, Authority, Need, Timeline. Older but still ubiquitous shorthand in enterprise sales.'),
G('Behavioral targeting', 'Serving ads or content based on what a user has done — pages visited, actions taken — rather than who they demographically are.'),
G('Bounce rate', 'The share of visitors who leave a page without interacting. Directional only in 2026 — high bounce on a well-answered informational page is fine.'),
G('Brand awareness', 'The share of a target market that can name a brand unaided. The metric brand marketing is accountable for.'),
G('Brand safety', 'Whether ad inventory or content adjacencies could damage the brand — the reason programmatic buys need placement controls, not just audience filters.'),
G('Brand voice', 'The consistent verbal style — tone, cadence, vocabulary — a brand uses across every channel. Enforced through guidelines, not by hoping.'),
G('Buyer journey', 'The path from a buyer\'s first awareness of a problem to purchase and beyond. Marketing programs mapped to it perform; ones that aren\'t don\'t.'),
G('Call-to-action (CTA)', 'The specific action a page or ad asks the visitor to take next. One CTA per page is a good rule; two competing CTAs is the fastest way to halve conversion.'),
G('Cannibalization', 'When a new campaign, page, or product steals traffic or sales from an existing one instead of adding to the total. Common failure mode of PPC targeting brand keywords.'),
G('Case study', 'A structured narrative of how a specific customer used a product to solve a specific problem, with numbers. The single most reliable middle-funnel asset in B2B.'),
G('Chatbot', 'A conversational interface — rule-based or AI-driven — that handles inbound questions or qualification without a human. Increasingly LLM-backed.'),
G('CLV (customer lifetime value)', 'Same measure as LTV; the term used more often in retail and e-commerce than in SaaS.'),
G('Cold email', 'Unsolicited direct email to a prospect with no prior relationship. The core mechanism of most outbound demand generation programs.'),
G('Competitor analysis', 'Systematic study of what competitors are doing across positioning, pricing, content, and channels. Continuous, not one-time.'),
G('Content audit', 'A structured inventory of existing content assets against performance and business goals. Almost always the first project a new content lead runs.'),
G('Content pillar', 'A comprehensive foundational piece of content on a broad topic, from which cluster of related pieces branch. The core of modern topical-authority strategy.'),
G('Conversion funnel', 'The staged path a visitor takes toward a desired action, with drop-off measured at each step. What CRO practitioners optimize.'),
G('Cookie', 'A small file a website stores in a browser to track state or identity across visits. Increasingly restricted by browsers and regulation; third-party cookies are functionally dead.'),
G('Copywriting', 'Writing whose purpose is to move the reader to action — an inquiry, a purchase, a click. Distinct from content writing, which is meant to inform or entertain.'),
G('CPA (cost per acquisition)', 'What it costs in ad spend to acquire one customer. The primary paid-media efficiency metric.'),
G('CPC (cost per click)', 'What an advertiser pays for one click on an ad. Set by auction on most platforms.'),
G('CPL (cost per lead)', 'What it costs in ad spend to generate one lead. Directional but easily gamed — a cheap lead sales won\'t work is worthless.'),
G('CPM (cost per mille)', 'Cost per thousand ad impressions. The unit brand and reach campaigns buy against.'),
G('CRM automation', 'Automated updates to CRM records triggered by activity — new lead created, task assigned, stage advanced. What makes a CRM useful vs a data graveyard.'),
G('Customer journey', 'The full experience a buyer has with a brand across every touchpoint, pre-purchase through advocacy. Broader than the buyer journey (which stops at purchase).'),
G('Customer success', 'The post-sale function whose job is making customers get value from the product so they renew and expand. In SaaS, second only to sales in importance.'),
G('Dark social', 'Sharing of content through channels analytics can\'t track — DMs, private messages, group chats. Larger than public social on most brands and largely invisible.'),
G('Dayparting', 'Scheduling ads to run only at specific hours or days when audience behavior justifies it. Underused; easy CPA improvement when done right.'),
G('Discovery call', 'The first substantive sales conversation with a qualified prospect. The interview that decides whether an opportunity is real.'),
G('Display advertising', 'Image, video, and rich-media ads bought across websites and apps — the classic banner-ad category. Now mostly bought programmatically.'),
G('DSP (demand-side platform)', 'Software that lets advertisers buy programmatic ad inventory across the open web through real-time auctions. The Trade Desk, DV360, StackAdapt.', 'hubs/paid-advertising-platforms.html'),
G('Dynamic creative', 'Ad creative that automatically assembles from modular parts — headline, image, CTA — matched to the audience and context in real time.'),
G('Email marketing', 'The discipline of using email to acquire, nurture, and retain customers. Highest ROI channel in most measurement studies for over a decade.'),
G('Email sequence', 'A pre-written series of emails delivered on a schedule or triggered by behavior. The atomic unit of lifecycle marketing.'),
G('Engagement rate', 'The share of an audience that interacts with a piece of content — likes, comments, shares, clicks. Platform-defined and mostly comparable within platforms only.'),
G('Enterprise sales', 'Selling to large organizations with complex buying committees, long cycles, and six- or seven-figure deal sizes. Materially different discipline from mid-market or SMB sales.'),
G('Evergreen content', 'Content that stays relevant and traffic-generating for years — the opposite of news or trend pieces. The core of compounding organic strategies.'),
G('Featured snippet', 'The Google result quoted in a box at the top of a SERP, above the standard organic results. Winning one displaces the traditional #1 rank.'),
G('First-touch attribution', 'Assigning all credit for a conversion to the first marketing touch. Overweights top-of-funnel channels; undervalues everything downstream.'),
G('Follow-up', 'Repeated outreach to a prospect who hasn\'t responded. Where most sales pipelines actually die — from insufficient follow-up, not insufficient discovery.'),
G('Freemium', 'A pricing model where the base product is free and paid tiers add features or limits. Turns marketing into a product-usage funnel.'),
G('Fresh feed', 'A steady cadence of new content designed to signal ongoing activity to search engines and to keep the site regularly re-crawled.'),
G('Fully-qualified lead (FQL)', 'A lead that meets both fit and intent criteria to justify sales attention. Stricter than an MQL, softer than an SQL.'),
G('Gated content', 'Content locked behind a form submission — ebooks, reports, webinars. Trades reach for lead capture; increasingly rare as content marketing moves toward ungated distribution.'),
G('Ghostwriting', 'Writing published under another person\'s name. The mechanism behind most executive content programs on LinkedIn and in trade press.', 'pillars/thought-leadership.html'),
G('Growth loop', 'A self-reinforcing acquisition mechanism where output from the product creates new inputs to acquisition — referrals, user-generated content, SEO content that scales with usage.'),
G('HARO / Connectively', 'The journalist-source matching service (Help A Reporter Out, now Connectively) — the primary channel most PR-driven backlink strategies use to earn media mentions.'),
G('Headline', 'The single most-read piece of copy on any asset. The one thing worth iterating five times before the rest of the copy exists.'),
G('Hook', 'The opening line, image, or three seconds that decide whether the audience keeps reading, watching, or listening. Everything after depends on the hook working.'),
G('Impressions', 'The count of times an ad or piece of content was displayed. Distinct from reach (unique people who saw it).'),
G('Inbound sales', 'Sales driven by leads who initiated contact — through search, referral, or content. Opposite of outbound.'),
G('In-house team', 'A marketing function staffed with employees rather than through agencies. Trade-off is control and continuity vs specialist depth and flexibility.'),
G('Journey mapping', 'The exercise of documenting every touchpoint in a customer\'s experience with a brand. Diagnostic tool; typically reveals two or three friction points doing outsized damage.'),
G('Kanban', 'A visual project-management method where work moves across columns (To Do → In Progress → Done). The default for most agile marketing teams.'),
G('Landing page optimization', 'The practice of iteratively improving a landing page\'s conversion rate — headline tests, form-length tests, offer tests, layout tests.'),
G('Last-touch attribution', 'Assigning all credit for a conversion to the final marketing touch. Overweights bottom-of-funnel channels; the default in Google Analytics for years.'),
G('Lead magnet', 'A high-value asset offered in exchange for contact information — an ebook, template, tool, checklist. The classic lead-capture mechanism.'),
G('Lead qualification', 'The process of scoring incoming leads for fit and intent to decide which get sales attention and which get nurture.'),
G('LinkedIn ABM', 'Running account-based marketing programs on LinkedIn — company-targeted ads, sponsored content, InMail — because it\'s the platform B2B buying committees are actually on.'),
G('Long-tail keyword', 'Search phrases with lower individual volume but often higher intent and much lower competition — the aggregate source of most compounding SEO traffic.'),
G('Lookalike audience', 'A paid-platform audience built by finding users similar to an existing customer list. Meta\'s lookalikes and Google\'s Similar Audiences are the workhorses.'),
G('Marketing funnel', 'The classic model of a buyer\'s progression from awareness to conversion. Real buying paths don\'t look like funnels but the language is useful shorthand.'),
G('Marketing mix', 'The set of channels and tactics a brand uses to reach customers. In 2026, most B2B marketing mixes involve six to twelve active channels.'),
G('Meta description', 'The short HTML tag that describes a page\'s content for search results. Doesn\'t affect ranking but heavily affects click-through rate from the SERP.'),
G('Middle of funnel', 'The consideration stage — buyers know they have a problem and are evaluating solutions. Where case studies, comparison content, and demos live.'),
G('Native advertising', 'Paid content designed to match the form and function of the platform it appears on — sponsored articles, in-feed ads, promoted posts.'),
G('Newsletter', 'A regularly-delivered email publication distinct from campaign or promotional email. The most durable form of owned audience in 2026.'),
G('Nurture campaign', 'A structured series of touches (usually email) designed to keep a not-yet-ready lead engaged until they are.'),
G('Offer', 'The specific value proposition being made at a purchase decision — what you get, at what price, with what guarantees. Most conversion problems are offer problems, not copy problems.'),
G('Open rate', 'The share of delivered emails that get opened. Increasingly noisy since Apple Mail Privacy Protection auto-fires opens; use with caution.'),
G('Owned media', 'Marketing channels the brand controls — the site, the newsletter list, owned social accounts. Distinct from paid and earned media.'),
G('Personalization', 'Tailoring content, offers, or product experience to the individual user based on their data. Effective at scale when built into the system, hollow when bolted on.'),
G('Pipeline velocity', 'How fast opportunities move from creation to close, and at what value and win-rate. The single best composite measure of sales health.'),
G('Podcast', 'Audio content published on a serialized schedule. Category of choice for building authority with a defined B2B audience in 2026.'),
G('Positioning', 'The deliberate choice of what a brand means in the buyer\'s mind relative to alternatives. Upstream of creative, product, and pricing decisions.'),
G('PPC agency', 'A specialist agency whose core service is running paid-search and paid-social campaigns — creative, bidding, targeting, and reporting.', 'hubs/paid-advertising-platforms.html'),
G('PR (public relations)', 'The practice of earning coverage in media the brand doesn\'t own or pay for. Best-in-class PR is largely thought-leadership distribution.'),
G('Product marketing', 'The function that sits between product and marketing, responsible for positioning, messaging, launches, and sales enablement for the product itself.'),
G('Programmatic advertising', 'Automated buying of ad inventory across the open web through real-time auction. Best for reach and audience-based buying outside walled gardens.'),
G('Prospect', 'A person or company identified as a potential customer but not yet an active opportunity.'),
G('Purchase intent', 'A prospect\'s readiness to buy, as inferred from behavior — pricing-page visits, competitor comparisons, direct outreach. Intent data services aggregate this at the account level.'),
G('Quality score', 'Google Ads\' rating of an ad\'s relevance and expected performance. High quality scores lower cost per click on the same bid.'),
G('Reach', 'The unique count of people who saw an ad or piece of content. Distinct from impressions (total displays).'),
G('Referral traffic', 'Visitors who arrive from links on other sites. Direct measurement of earned-media effectiveness.'),
G('Remarketing', 'Serving ads to people who have already interacted with a brand — website visitors, past customers, list uploads. Google\'s term for retargeting.'),
G('Response rate', 'The share of outbound messages that get a reply. The primary quality metric for cold-email programs.'),
G('Retention rate', 'The share of customers still active after a defined period. Second only to acquisition in most growth models; usually cheaper to move.'),
G('Rich snippet', 'An enhanced search result that includes extra visual elements — stars, images, prices — driven by structured data on the page.'),
G('Sales cycle', 'The elapsed time from first sales touch to close. Ranges from minutes (transactional e-commerce) to years (enterprise software).'),
G('Sales development representative (SDR)', 'The salesperson responsible for prospecting and qualifying leads before handing them to an account executive.', 'pillars/sales.html'),
G('Schema markup', 'Structured data added to a webpage in a format search engines can parse — Organization, Product, FAQPage, NewsArticle. What enables rich results and AI citations.'),
G('SEM (search engine marketing)', 'The paid side of search — Google Ads, Bing Ads. Distinct from SEO, which is the organic side.'),
G('Sentiment analysis', 'The classification of text as positive, negative, or neutral. Used in social listening and review mining; increasingly LLM-based.'),
G('SERP feature', 'Any element on a search results page that isn\'t a standard organic listing — featured snippets, People Also Ask, image packs, local packs, AI Overviews.'),
G('Service-level agreement (SLA)', 'A formal commitment between teams — usually sales and marketing — defining response times, quality thresholds, and handoff rules. What makes lead handoff work in practice.'),
G('Silo (SEO)', 'A tight cluster of internal-linked pages focused on one topic. Passes topical authority signals to search engines; also structures a site for humans.'),
G('Sitemap', 'A file (usually sitemap.xml) that lists a site\'s URLs for search engines to discover and crawl.'),
G('Slack community', 'A branded Slack workspace as an owned-audience play. The most durable community format in B2B in 2026, replacing older Facebook Groups.'),
G('SMB (small and medium business)', 'The market segment below enterprise, typically defined at under 250 employees or $50M revenue. Different buying dynamics from enterprise: shorter cycles, single decision-maker, price-sensitive.'),
G('SMS marketing', 'Marketing over text messaging. High open and response rates; matched by high unsubscribe rates if the brand overuses it.'),
G('SOP (standard operating procedure)', 'A documented process for a repeatable task. The mechanism that makes an in-house or agency team scale beyond individual heroics.'),
G('SOV (share of voice)', 'A brand\'s share of the total conversation or advertising in its category — organic mentions, paid impressions, or both.'),
G('Speakable schema', 'Structured data marking sections of a page as suitable for voice-assistant readout. Increasingly relevant for AI-Overview and voice-search inclusion.'),
G('SQL (structured query language)', 'The database language marketing operations teams actually need to know to work with the data warehouse. Not to be confused with SQL (sales-qualified lead) — same acronym, different meaning.'),
G('Substack', 'A hosted platform for paid newsletters and podcasts. Category-defining for the independent-publisher renaissance.'),
G('Target account list', 'The named companies a B2B marketing and sales program is focused on. The atomic unit of ABM.'),
G('Tech stack', 'The full set of software tools a marketing operation runs. Modern B2B marketing stacks average 40+ tools; consolidation is a perpetual conversation.'),
G('Test-and-learn', 'A structured experimentation practice where hypotheses are tested against control, results decide the next move, and the cycle repeats. The operating model good growth teams run.'),
G('Third-party data', 'Data purchased or licensed from external providers — not collected directly by the brand. Under pressure from privacy regulation and cookie restrictions.'),
G('Time on page', 'How long a visitor spends on a page before leaving. Directional; higher isn\'t always better and lower isn\'t always worse.'),
G('Tone of voice', 'The specific style, personality, and register a brand uses in its communication. Documented in brand guidelines; enforced through review.'),
G('Top of funnel', 'The awareness stage — prospects don\'t yet know they have a problem or a solution. Where thought leadership, category-education content, and brand campaigns live.'),
G('Traffic sources', 'The channels visitors arrive from — organic search, paid search, paid social, direct, referral, email. What analytics reports break down by default.'),
G('Trigger', 'A behavioral or time-based event that fires an automation — form submission, page visit, date reached, score threshold crossed.'),
G('UGC creator', 'A content creator hired to produce user-generated-content-style videos or posts for brands. A category that barely existed in 2020 and now underpins most paid social creative on Meta and TikTok.'),
G('Value proposition', 'The specific promise of value a product makes to a specific customer — what problem it solves, for whom, and why the buyer should care.'),
G('Voice search', 'Search initiated by voice through assistants like Google Assistant, Siri, or Alexa. A subset of the broader shift toward conversational search interfaces.'),
G('Warm outreach', 'Cold outreach with a real reason for the contact — mutual connection, recent trigger event, personalization based on specific research. Response rates are 3–5× cold outreach.'),
G('Webinar', 'A live or on-demand online presentation used for lead capture, education, or sales. Format has recovered in 2026 after a mid-decade slump.'),
G('White paper', 'A long-form authoritative document on a specific topic. Traditional B2B format; often used as a lead magnet.'),
G('Word of mouth', 'Organic recommendation of a brand from one buyer to another. The single most trusted acquisition channel; the least controllable.'),
G('YoY (year over year)', 'The comparison of a metric this period to the same period a year ago. The standard normalization for seasonality in most marketing reporting.'),
];

// ---------------------------------------------------------------- shell
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
  .dek{font-family:var(--serif);font-style:italic;font-size:17.5px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  h3{font-family:var(--serif);font-weight:600;font-size:16.5px;margin:20px 0 6px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  ul,ol{padding-left:22px;margin-bottom:12px}
  li{margin-bottom:6px}
  .statline{display:flex;gap:26px;flex-wrap:wrap;border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:18px 0}
  .statline div b{display:block;font-family:var(--mono);font-size:20px;font-weight:600;color:var(--ink)}
  .statline div span{font-family:var(--mono);font-size:8.5px;letter-spacing:.14em;color:var(--chrome)}
  .cta{display:inline-block;font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;color:#fff;background:var(--cobalt);border-radius:7px;padding:10px 16px;text-decoration:none;margin:6px 0 4px}
  .faq-item{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:12px 0}
  .faq-item h3{margin:0 0 6px;font-size:15.5px}
  .faq-item p{margin:0;font-size:13.5px}
  .fn{font-size:12px;color:var(--chrome)}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
  .gl-nav{font-family:var(--mono);font-size:11px;letter-spacing:.08em;margin:14px 0 6px}
  .gl-nav a{margin-right:10px;text-decoration:none}
  .gl-letter{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);border-bottom:1px solid var(--stone);padding:26px 0 6px;margin-bottom:4px}
  dl dt{font-family:var(--serif);font-weight:600;font-size:16px;margin-top:14px}
  dl dd{font-size:13.5px;line-height:1.7;color:var(--body);margin:3px 0 0}
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
</body>
</html>`;
}

// ---------------------------------------------------------------- pillar pages
import { readFileSync, existsSync as ex } from 'node:fs';
const newsHeadline = slug => {
  try {
    const h = readFileSync(join(ROOT, 'news', `${slug}.html`), 'utf8');
    return (h.match(/<title>(.*?) — /) || [])[1] || slug;
  } catch { return slug; }
};

mkdirSync(join(ROOT, 'pillars'), { recursive: true });
for (const p of PILLARS) {
  const canonical = `${SITE}/pillars/${p.slug}.html`;
  const ld = [ORG_LD,
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: p.faq.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Disciplines', item: `${SITE}/glossary.html` },
        { '@type': 'ListItem', position: 3, name: p.cat }
      ]
    }];
  const stats = p.stats;
  const statHTML = `<div class="statline">
    <div><b>${stats.n}</b><span>US LISTINGS</span></div>
    ${stats.rated ? `<div><b>${stats.rated}</b><span>PUBLICLY RATED</span></div>` : ''}
    ${stats.rating ? `<div><b>${stats.rating}</b><span>AVG RATING /5</span></div>` : ''}
    ${stats.reviews ? `<div><b>${stats.reviews.toLocaleString()}</b><span>CLIENT REVIEWS</span></div>` : ''}
  </div>${stats.note ? `<p class="fn">${stats.note}</p>` : ''}`;
  const body = `
<div class="kicker">DISCIPLINE · SECTOR ${p.no}</div>
<h1>${esc(p.cat)}</h1>
<p class="dek">${p.dek}</p>
<h2>The wall</h2>
<p>${p.wall}</p>
<h2>What the discipline is</h2>
<p>${p.what}</p>
<h2>How vendors in this category work</h2>
<p>${p.vendors}</p>
<h2>${p.mktH2 || 'The category in numbers'}</h2>
${statHTML}
<a class="cta" href="../?cat=${encodeURIComponent(p.cat)}">BROWSE ALL ${stats.n} ${esc(p.cat.toUpperCase())} LISTINGS →</a>
<h2>Questions buyers ask</h2>
<p class="fn">Questions sourced from live Google "People Also Ask" data for this discipline (harvested August 2026); answers are ${BRAND}'s own.</p>
${p.faq.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}
<div class="rel"><h3>RELATED BRIEFINGS</h3>
${p.relBriefings.map(s => `<a href="../news/${s}.html">${esc(newsHeadline(s))}</a>`).join('\n')}
</div>
<div class="rel"><h3>ADJACENT DISCIPLINES</h3>
${p.relPillars.map(s => { const t = PILLARS.find(x => x.slug === s); return `<a href="${s}.html">${esc(t.cat)} — ${t.stats.n} listings</a>`; }).join('\n')}
</div>
<div class="rel"><h3>REFERENCE</h3>
<a href="../glossary.html">The Wall glossary — ${TERMS.length} growth-vendor terms defined</a>
</div>`;
  writeFileSync(join(ROOT, 'pillars', `${p.slug}.html`),
    shell({
      title: p.title || `${p.cat} — vendors, pricing, and the wall they solve`,
      metaDesc: p.metaDesc || p.dek.replace(/<[^>]+>/g, ''),
      canonical, ld, bodyHTML: body, base: '../'
    }));
}

// ---------------------------------------------------------------- glossary
const sorted = [...TERMS].sort((a, b) => a.t.localeCompare(b.t));
const byLetter = {};
for (const t of sorted) (byLetter[t.t[0].toUpperCase()] ||= []).push(t);
const letters = Object.keys(byLetter).sort();
const glLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'DefinedTermSet',
  '@id': `${SITE}/glossary.html`,
  name: `${BRAND} Growth-Vendor Glossary`,
  description: `${TERMS.length} plain-English definitions of the terms used across the US growth-vendor market and throughout ${BRAND}'s listings and briefings.`,
  hasDefinedTerm: sorted.map(t => ({
    '@type': 'DefinedTerm', name: t.t, description: t.d.replace(/<[^>]+>/g, ''),
    inDefinedTermSet: `${SITE}/glossary.html`
  }))
}, {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Glossary' }
  ]
}];
const glBody = `
<div class="kicker">REFERENCE / GLOSSARY</div>
<h1>The growth-vendor glossary</h1>
<p class="dek">${TERMS.length} terms, defined in plain English — the working vocabulary of the ten disciplines this atlas indexes. Terms link into the discipline guides where one exists.</p>
<h2>The ten disciplines</h2>
<p>${PILLARS.map(p => `<a href="pillars/${p.slug}.html">${esc(p.cat)}</a>`).join(' · ')}</p>
<div class="gl-nav">${letters.map(l => `<a href="#gl-${l}">${l}</a>`).join('')}</div>
${letters.map(l => `<div class="gl-letter" id="gl-${l}">${l}</div>
<dl>
${byLetter[l].map(t => `<dt>${esc(t.t)}${t.link ? ` <a href="${t.link}" style="font-family:var(--mono);font-size:9px;letter-spacing:.1em">GUIDE →</a>` : ''}</dt><dd>${t.d}</dd>`).join('\n')}
</dl>`).join('\n')}
<div class="rel"><h3>KEEP GOING</h3>
<a href="news/">Briefings — original data on the US growth-vendor market</a>
<a href="sitemap.html">The full index — all listings by category</a>
</div>`;
writeFileSync(join(ROOT, 'glossary.html'),
  shell({ title: 'Growth-Vendor Glossary', metaDesc: `${TERMS.length} plain-English definitions of growth, marketing, and sales-vendor terms — the working vocabulary of The Wall's ten disciplines.`, canonical: `${SITE}/glossary.html`, ld: glLD, bodyHTML: glBody, base: '' }));

console.log(`pillar pages written: ${PILLARS.length} + glossary (${TERMS.length} terms)`);
