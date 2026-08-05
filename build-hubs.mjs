// Generates target-keyword landing pages under hubs/{slug}.html.
// Each hub is a definitional/editorial page optimized for one commercial search term,
// with FAQPage + Article + Breadcrumb JSON-LD, funneling to the atlas.
// Run: node build-hubs.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';
const TODAY = '2026-08-03';

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai',
  description: 'An operations atlas of US-based companies that solve sales, marketing, SEO, thought leadership, creative, automation, and demand generation problems for established businesses.'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- hubs
const HUBS = [
{
  slug: 'marketing-consultant',
  headTerm: 'marketing consultant',
  title: `Marketing Consultants: How They Work, What They Cost, When to Hire One — The Wall`,
  metaDesc: `What a marketing consultant does, how they differ from a marketing agency, when to hire one, and what independent US marketing consultants charge — grounded in The Wall's directory data on 550 US marketing firms.`,
  h1: `Marketing Consultant`,
  dek: `A marketing consultant is a senior independent advisor a company hires for strategy, diagnosis, or a defined engagement — the alternative to hiring an agency when the wall is a decision problem, not a capacity problem. Here is when that trade actually works, what to expect it to cost, and how the choice fits into a broader vendor shortlist.`,
  sections: [
    {
      h2: `The difference between a marketing consultant and a marketing agency`,
      body: `A <strong>marketing consultant</strong> sells expertise, judgment, and a defined deliverable — a strategy, an audit, a decision framework, a two-week engagement, a monthly advisory retainer. A <strong>marketing agency</strong> sells ongoing execution — the team that runs the campaigns, produces the content, manages the media, ships the work. Consultants are typically one to three senior people; agencies are typically ten to fifty. The wrong choice is the common failure mode: buying execution when the real problem was that nobody had decided what to execute, or buying strategy when the real problem was that nothing was getting shipped.
<br><br>
A consultant is the right hire when the diagnosis is unclear, when leadership can't agree on positioning or channel priority, when an existing agency is delivering activity without outcomes, or when the company is between agencies and needs a plan before hiring the next one. An agency is the right hire when the strategy is settled and the wall is capacity: the plan exists, and nobody has the hours or the specialized skill to run it.`
    },
    {
      h2: `When companies actually hire a marketing consultant`,
      body: `Four situations account for the majority of independent-consultant engagements at the operator level ${BRAND} serves — US companies past $5M in revenue with 25+ employees:
<br><br>
<strong>1. The founder handed off marketing and the new leader inherited a mess.</strong> A consultant runs a diagnostic — reviews the funnel, the tech stack, the campaigns in flight, the agency contracts — and produces a one-page current-state and a prioritized rework plan. The engagement is measured in weeks, not quarters, and the deliverable is a decision document, not a campaign.
<br><br>
<strong>2. Growth flattened and nobody agrees why.</strong> A consultant runs a channel and offer audit, interviews sales, and returns with a defensible position on where the leaks are. Because the consultant is outside the room, they can say the things internal marketers can't.
<br><br>
<strong>3. The company is about to spend seven figures on an agency and wants a second opinion.</strong> A consultant reviews the shortlist, sits in on pitches, and delivers a vendor-selection memo. The fee is a fraction of what a bad twelve-month contract would cost.
<br><br>
<strong>4. Leadership wants a permanent CMO but not yet.</strong> A fractional CMO — a consultant on a fixed monthly retainer, one to two days a week — carries the function until the hiring decision is right to make.`
    },
    {
      h2: `What US marketing consultants actually cost`,
      body: `Independent marketing consultants at the seniority mid-market operators need typically price at the upper end of the US agency market. Across the ${BRAND} directory's 1,440 US agencies that publish an hourly rate, two-thirds cluster between $100 and $199 per hour; senior specialists reach $200–$300, and the top few percent price above $300. Independent consultants working with $5M+ companies commonly quote in the $200–$400 hourly range for defined project work, or $8,000–$25,000 per month for a fractional advisory retainer scoped to a specific outcome.
<br><br>
Project fees are the more common structure: a strategy diagnostic runs $10,000–$30,000; a full brand or positioning engagement, $25,000–$75,000; a vendor-selection or agency-review memo, $5,000–$15,000. The right question isn't "what does a consultant cost" but "what does this specific engagement cost, and what would getting the decision wrong cost more".`
    },
    {
      h2: `How to shortlist a marketing consultant`,
      body: `Three filters do most of the work:
<br><br>
<strong>Specialty match.</strong> A consultant whose last five engagements looked like yours is worth several with impressive but adjacent resumes. Ask for three references at your company size and stage — not their biggest logos.
<br><br>
<strong>Diagnosis before prescription.</strong> A consultant who arrives at the first call with "what I usually recommend" is selling a template. The competent ones ask questions for the first hour and don't commit to an approach until they understand the situation.
<br><br>
<strong>A scoped exit.</strong> The best consulting engagements have a defined end: a deliverable, a decision, a hire. If the pitch is an open-ended retainer with no exit condition, you're being sold an agency in consultant packaging.
<br><br>
Once the shortlist is real, <a href="../?cat=Marketing">browse the 550 US marketing agencies in The Wall's directory</a> — a consultant's post-engagement recommendation is usually to hire one of these next, and the same structured data (rate band, minimum, team size, specialty) that helps evaluate a consultant helps evaluate the firm they hand off to.`
    }
  ],
  faq: [
    {
      q: `What does a marketing consultant do?`,
      a: `A marketing consultant advises on strategy, diagnoses what's wrong with an existing marketing operation, and produces defined deliverables — audits, positioning documents, channel plans, vendor recommendations, fractional-CMO oversight. They do not typically execute the work themselves; that's what a marketing agency is for.`
    },
    {
      q: `How much does a marketing consultant cost?`,
      a: `US marketing consultants at the seniority mid-market operators typically hire quote $200–$400 per hour for project work, or $8,000–$25,000 per month for a fractional retainer. Defined projects run $10,000–$75,000 depending on scope. Pricing sits at the upper end of the agency market because you're paying for judgment, not team hours.`
    },
    {
      q: `Should I hire a marketing consultant or a marketing agency?`,
      a: `A consultant when the wall is a decision problem — you don't know what to do, or an agency is executing without outcomes. An agency when the wall is a capacity problem — the plan exists and nobody has the hours or the specialty to run it. Buying execution before the decision is made is the most common way marketing budgets get wasted.`
    },
    {
      q: `What is a fractional CMO?`,
      a: `A fractional CMO is a marketing consultant on a fixed retainer who serves as the company's marketing leader for one or two days a week. It's the standard bridge between "we need real marketing leadership" and "we're ready to hire a full-time CMO" — typically a 6–18 month arrangement.`
    },
    {
      q: `How is a marketing consultant different from a fractional CMO?`,
      a: `A marketing consultant is usually engaged for a defined project — a diagnostic, a plan, a decision. A fractional CMO is engaged as an ongoing part-time executive who owns the marketing function's outcomes for the duration. Same person often does both; different engagement shapes.`
    }
  ],
  relPillars: ['marketing', 'demand-gen', 'thought-leadership'],
  ctaCat: 'Marketing', ctaSlug: 'marketing'
},
{
  slug: 'paid-advertising-platforms',
  headTerm: 'paid advertising platforms',
  title: `Paid Advertising Platforms: The 2026 Buyer's Reference — The Wall`,
  metaDesc: `What paid-advertising platforms actually cover in 2026 — Google Ads, Meta, LinkedIn, TikTok, programmatic — how to shortlist them, what they cost to run, and when to buy the platform vs hire an agency. Grounded in The Wall's directory of US automation and demand-gen vendors.`,
  h1: `Paid Advertising Platforms`,
  dek: `A "paid advertising platform" is the software layer where a company defines its audience, buys the placement, sets the budget, and measures what came back — Google Ads, Meta, LinkedIn, TikTok, programmatic DSPs, retail-media networks, and the increasingly-consequential AI-search ad surfaces. Here is what the category actually contains in 2026, what the platforms cost to run at each budget tier, and the two questions that decide whether you should be operating one in-house or paying a specialist to.`,
  sections: [
    {
      h2: `What actually counts as a paid advertising platform in 2026`,
      body: `The category has fragmented into four bands that behave very differently at buy-time:
<br><br>
<strong>Search and social platforms</strong> — Google Ads (search, YouTube, Performance Max, Demand Gen), Meta Ads Manager (Facebook + Instagram), LinkedIn Campaign Manager, TikTok Ads Manager, X Ads, Reddit Ads, Pinterest Ads. This is where roughly two-thirds of US B2B and B2C paid spend actually lands. Self-serve UIs; the platform is free, the media is what you're buying.
<br><br>
<strong>Programmatic DSPs</strong> — The Trade Desk, DV360, StackAdapt, Amazon DSP. Buy display, video, CTV, and audio inventory across the open web through real-time auctions. Meaningful minimums (usually $10K–$50K/month in media spend). The platform is what you pay for as much as the media.
<br><br>
<strong>Retail media networks</strong> — Amazon Ads, Walmart Connect, Instacart Ads, Kroger Precision Marketing, Target Roundel. Fastest-growing paid channel of the last three years. Buy ad placement on retailer sites where the buyer is one click from purchase.
<br><br>
<strong>AI-search ad surfaces</strong> — Google AI Overview ads (rolling out), Perplexity's advertising layer, and the ad formats OpenAI has started testing inside ChatGPT. Early, thin, and inevitable. Worth learning now for the same reason knowing Google Ads in 2004 mattered.`
    },
    {
      h2: `What the platforms cost to actually run`,
      body: `Every paid platform has three cost layers, and buyers routinely underestimate at least one:
<br><br>
<strong>1. Media spend</strong> — what you pay the platform for the placement. Ranges from a few hundred dollars a month (a small local Google Ads campaign) to seven figures a month (an enterprise programmatic buy).
<br><br>
<strong>2. Platform fees or minimums</strong> — self-serve platforms (Google, Meta, LinkedIn) charge no platform fee; programmatic DSPs typically take 10–20% of media spend or a monthly seat fee; retail media networks vary.
<br><br>
<strong>3. Management cost</strong> — either an internal media buyer's salary and time, or an agency management fee. Agency fees typically price as 10–20% of media spend, occasionally with a floor for accounts under $10K/month in spend. Across ${BRAND}'s directory of 1,440 disclosing US agencies, hourly bands cluster $100–$199, and full-service digital agencies commonly quote $2,000–$5,000/month minimum to manage paid media on top of the media spend itself.
<br><br>
The undercounted line is usually (3): a self-serve platform is not the same as a competent campaign, and the cost of running an underoptimized $10K/month spend for six months easily exceeds what a specialist would have charged to make it work in month one.`
    },
    {
      h2: `Buy the platform, hire an agency, or build the team — the decision matrix`,
      body: `Three questions do most of the work:
<br><br>
<strong>1. Is paid media a permanent capability or a temporary need?</strong> If you'll be spending on paid channels for years, the return on building the in-house function eventually beats the ongoing agency fee — assuming you can hire well enough. If the paid push is tied to a specific launch or a seasonal window, an agency is almost always the right call.
<br><br>
<strong>2. Which platforms, at what depth?</strong> A team that's excellent at Google Ads is not the same team that's excellent at Meta creative, LinkedIn ABM, or programmatic. A single generalist agency can cover the majors reasonably well; going deep on any one channel usually means specialists. Buyers who insist on "one team that does everything" typically get average performance on all channels.
<br><br>
<strong>3. What's the operator's time worth?</strong> A founder-run business at $2M revenue with strong margins may correctly decide the CEO's time buying Google Ads is the highest-leverage use of two hours a week. That math flips somewhere between $5M and $15M in revenue, and it flips hard.`
    },
    {
      h2: `Where paid-advertising specialists show up in the directory`,
      body: `${BRAND} indexes paid-advertising vendors across three of its ten pillars, because "paid ads" is bought in three quite different shapes:
<br><br>
<strong>Full-service marketing agencies</strong> that manage paid alongside SEO, content, and creative — the majority of the 550 firms in the <a href="../pillars/marketing.html">Marketing pillar</a>. Best fit when paid is one channel of many.
<br><br>
<strong>Paid-media specialists</strong> — often deep on a single platform (Google Ads shops, Meta specialists, LinkedIn ABM shops, TikTok creative agencies). Concentrated in the <a href="../pillars/demand-gen.html">Demand Gen pillar</a> alongside outbound and intent-data vendors. Best fit when paid is the primary channel and depth matters more than breadth.
<br><br>
<strong>Marketing-automation and platform-implementation firms</strong> — vendors who install, integrate, and operate the platform stack (attribution, CRM sync, audience-building tooling) rather than running the media. Concentrated in the <a href="../pillars/automation.html">Automation pillar</a>. Best fit when the wall is technical: the platforms exist, nobody is making them talk to the CRM.
<br><br>
Every listing carries structured engagement data — hourly band, minimum project size, team size, specialty — so a paid-media shortlist can be built against the criteria that actually matter before the first sales call.`
    }
  ],
  faq: [
    {
      q: `What are the best paid advertising platforms for a US business in 2026?`,
      a: `For most US businesses, the answer is a portfolio, not a single platform: Google Ads (search + YouTube) for demand capture; Meta Ads (Facebook + Instagram) for demand creation at consumer targets; LinkedIn Campaign Manager for B2B; TikTok Ads for younger audiences and short-form creative testing. Above roughly $10K/month in total spend, a programmatic DSP like The Trade Desk or StackAdapt adds reach across the open web that the walled gardens can't sell.`
    },
    {
      q: `How much do paid advertising platforms cost?`,
      a: `The platforms themselves are usually free to use (self-serve Google, Meta, LinkedIn, TikTok); you pay for the media placement, which starts from a few dollars a day and scales to enterprise budgets. Programmatic DSPs additionally take 10–20% of media spend as a platform fee. Agency management on top typically adds 10–20% of media spend, often with a monthly floor.`
    },
    {
      q: `Should I use a paid ads agency or run campaigns in-house?`,
      a: `Agency if paid is one of several priorities, if you can't hire a specialist you'd trust, or if the push is time-bound. In-house if paid is a permanent core capability and you're spending enough (usually $30K+/month in media) to justify a real hire — a bad in-house media buyer is more expensive than any agency, and a great one pays for themselves quickly.`
    },
    {
      q: `What is the difference between paid search, paid social, and programmatic?`,
      a: `Paid search (Google, Bing) targets people actively searching for something specific — highest intent, highest cost per click, most predictable ROI. Paid social (Meta, LinkedIn, TikTok) targets people by profile and behavior in-feed — lower intent, powerful for building demand and audience. Programmatic buys display, video, CTV, and audio inventory across the open web via real-time auction — best for reach and audience-based buying outside the walled gardens.`
    },
    {
      q: `Are AI-search ads worth investing in yet?`,
      a: `For most operators, not yet — the inventory is thin and the measurement is immature. But the platforms buyers are learning on now are the ones they'll be spending seven-figure budgets on in three years, and the cost of experimenting at 2026 rates is minimal. Treat AI-search ad inventory as an R&D line item, not a growth line.`
    }
  ],
  relPillars: ['automation', 'demand-gen', 'marketing'],
  ctaCat: 'Automation', ctaSlug: 'automation'
},
{
  slug: 'b2b-marketing-agency',
  headTerm: 'b2b marketing agency',
  title: `B2B Marketing Agency: How They Work, What They Cost, and When to Hire One — The Wall`,
  metaDesc: `What a B2B marketing agency actually does differently from a general marketing agency — pipeline focus, longer cycles, ABM, sales alignment — plus real rate ranges from The Wall's data on 550 US marketing firms.`,
  h1: `B2B Marketing Agency`,
  dek: `A B2B marketing agency is a marketing firm whose entire operating model — target research, messaging, channel mix, measurement — is built for selling to other businesses rather than consumers. The difference is not surface-level. Here is what a real B2B agency actually delivers, what US B2B agencies cost, and the three questions that decide whether a general marketing agency will do or you need a B2B specialist.`,
  sections: [
    {
      h2: `What makes a B2B marketing agency actually different`,
      body: `The word "B2B" gets applied loosely, but the operational differences from a consumer marketing agency are real and load-bearing:
<br><br>
<strong>Longer, multi-touch buying cycles.</strong> A consumer campaign optimizes for a purchase decision that happens in minutes; a B2B campaign supports a decision that plays out over months across a buying committee of five to eleven people. Content, nurture, and attribution are all built differently.
<br><br>
<strong>Account-based, not audience-based.</strong> Where consumer marketing targets audience segments defined by demographics and interest, B2B increasingly targets named accounts — specific companies where the ICP fits. This is ABM (account-based marketing), and it changes how ads are bought, how content is personalized, and how sales and marketing coordinate.
<br><br>
<strong>Sales alignment is the whole game.</strong> A consumer marketing agency is measured on conversion; a B2B agency is measured on qualified pipeline that sales actually converts. The good ones own service-level agreements with the sales team on lead volume, quality, and follow-up.
<br><br>
<strong>Channel mix is inverted.</strong> B2B agencies over-invest in LinkedIn, industry publications, webinars, podcasts, direct outbound, and paid search on high-intent queries — and under-invest in the Meta/TikTok mix that dominates consumer work. The creative craft rewarded on each side barely translates.`
    },
    {
      h2: `What US B2B marketing agencies cost`,
      body: `B2B agencies price at the upper half of the general US marketing agency market, for two reasons: the work is more strategic per hour, and the buying cycle length forces retainer engagements (12+ months) that agencies underwrite by pricing the ramp period into the ongoing rate.
<br><br>
Across the ${BRAND} directory's 1,440 disclosing US agencies, the most common hourly band is $150–$199 (36.9% of firms), and 82.5% of firms set minimum project sizes at $10,000 or below. B2B specialists cluster at the higher end of both: hourly bands of $200–$300 are common at senior B2B shops, and monthly retainers typically start at $10,000–$25,000 for a real engagement (strategy + channel execution + reporting), scaling to $50,000+/month for ABM programs with dedicated pods.
<br><br>
A useful benchmark for buyers at the $10M–$50M revenue range: expect to invest 4–8% of new-business-development budget in agency fees, on top of media spend. Below that ratio, the engagement is usually under-resourced and won't produce the pipeline it's being asked to.`
    },
    {
      h2: `The three questions that decide B2B specialist vs general agency`,
      body: `<strong>1. Is the buying committee actually complex?</strong> A B2B sale with a single decision-maker (a solo consultant, a small business owner) can often be marketed to like a considered consumer purchase. A general agency will do fine. If the buying committee is 5+ people across roles, if procurement is involved, if the sales cycle runs multiple quarters — that's where a specialist earns their premium.
<br><br>
<strong>2. Is the ICP a defined list, or a broad market?</strong> If growth requires reaching 500 named target accounts, that's ABM territory and requires B2B specialist capabilities (intent data, personalized landing pages, sales-team coordination) that general agencies don't operate. If growth requires reaching a broad ICP definable by industry + size, a competent general agency running B2B-appropriate channels can work.
<br><br>
<strong>3. Is sales-marketing alignment the actual wall?</strong> The most common reason B2B companies hire specialists is that their existing marketing generates leads sales won't work. A B2B specialist rebuilds the lead-scoring, hand-off, and follow-up mechanics as part of the engagement — a general agency typically won't.`
    },
    {
      h2: `Where B2B agencies live in the directory`,
      body: `B2B marketing agencies concentrate in three of ${BRAND}'s ten pillars:
<br><br>
The <a href="../pillars/marketing.html">Marketing pillar</a> (550 US firms) includes the majority of full-service B2B agencies — the shops that own strategy, campaigns, content, paid, and reporting across the whole marketing function. Filter for "B2B" in the search bar or scan for firms whose bios reference enterprise, SaaS, industrial, or professional-services clients.
<br><br>
The <a href="../pillars/demand-gen.html">Demand Gen pillar</a> (48 firms) holds pipeline-specialist B2B agencies — outbound shops, ABM programs, intent-data services, and paid-media specialists whose entire deliverable is qualified sales opportunities. Best for companies where lead volume, not brand, is the wall.
<br><br>
The <a href="../pillars/sales.html">Sales pillar</a> (103 firms) holds RevOps consultancies and sales-enablement firms that partner with marketing agencies on the operational plumbing — CRM builds, lead-scoring frameworks, sales-marketing SLAs. Rarely the primary hire, often the second one.
<br><br>
Structured data — hourly band, minimum, team size, review count — is published on every listing, so a B2B shortlist can be built and priced before any sales conversations start.`
    }
  ],
  faq: [
    {
      q: `What does a B2B marketing agency do?`,
      a: `A B2B marketing agency plans and runs the demand-generation, brand, and sales-support work needed to sell to other businesses — target research, positioning, LinkedIn and paid-search campaigns, content and thought leadership, ABM programs, and reporting tied to pipeline rather than to leads or clicks. The good ones own accountability for qualified pipeline created, not activity delivered.`
    },
    {
      q: `How much does a B2B marketing agency cost?`,
      a: `US B2B agencies typically price monthly retainers between $10,000 and $50,000 for real engagements (strategy + execution + reporting), with senior specialist hourly bands at $200–$300. ABM programs with dedicated pods can exceed $50,000/month. Underneath about $10,000/month, most B2B engagements are under-resourced for the multi-quarter buying cycles the work has to support.`
    },
    {
      q: `What is the difference between a B2B and a B2C marketing agency?`,
      a: `A B2C agency optimizes for individual purchase decisions, typically short cycles, audience-based targeting, and channel mix skewed to consumer platforms (Meta, TikTok, retail media). A B2B agency operates for multi-month multi-person buying cycles, account-based targeting, and channel mix skewed to LinkedIn, search, industry media, webinars, and direct outbound. The creative and measurement disciplines look almost nothing alike day-to-day.`
    },
    {
      q: `What is B2B account-based marketing (ABM)?`,
      a: `ABM is the practice of marketing to a named list of target accounts rather than to a broad audience segment. It combines intent data (which accounts are actively researching a solution now), personalized content and landing pages, coordinated paid media targeting people at those companies, and tight sales-team coordination so an account showing engagement gets human follow-up while it's still warm. Most credible B2B agencies now offer some form of ABM.`
    },
    {
      q: `Should a small B2B company hire an agency or an in-house marketer first?`,
      a: `Below roughly $3M in revenue, a strong in-house generalist marketer usually delivers more than an equivalently-priced agency retainer — the founder needs someone in the building making decisions. Between $3M and $10M, agencies become valuable as force-multipliers for that generalist. Past $10M with more than one growth channel that matters, agency specialization on individual channels often outperforms trying to hire multiple in-house specialists at once.`
    }
  ],
  relPillars: ['marketing', 'demand-gen', 'sales'],
  ctaCat: 'Marketing', ctaSlug: 'marketing'
},
{
  slug: 'social-media-management-platforms',
  headTerm: 'social media management platforms',
  title: `Social Media Management Platforms: The 2026 Buyer's Reference — The Wall`,
  metaDesc: `The real US social media management platform market in 2026 — Sprout Social, Hootsuite, Later, Buffer, Loomly, HubSpot Social, Brandwatch, Zoho Social — what each is actually built for, what they cost, and when the platform is the answer vs when the answer is an agency.`,
  h1: `Social Media Management Platforms`,
  dek: `A social media management platform is the software layer that lets a marketing team plan, schedule, publish, moderate, and measure content across the social channels a business actually uses — usually Instagram, LinkedIn, Facebook, TikTok, X, and increasingly YouTube Shorts. In 2026 the category has fragmented into four buyer-shapes with very different platforms winning each one. Here is what actually differentiates them and how to decide whether the platform is the answer or the answer is an agency.`,
  sections: [
    {
      h2: `The four buyer-shapes the platform market has fragmented into`,
      body: `<strong>1. Enterprise-scale multi-brand management.</strong> Twenty brand handles across four regions, ten users, approval workflows, compliance archiving, integration with the CRM and DAM. This is where <em>Sprout Social</em>, <em>Hootsuite Enterprise</em>, and <em>Sprinklr</em> compete. Pricing is per-user + per-social-profile, typically $500–$5,000+ per month all-in.
<br><br>
<strong>2. Mid-market single-brand teams.</strong> Two to five people running one brand's social presence across four to six channels. This is <em>HubSpot Social</em> (bundled), <em>Zoho Social</em>, <em>Loomly</em>, <em>Sendible</em>. $50–$300/month, integrated calendars, decent analytics, easier learning curve than the enterprise tier.
<br><br>
<strong>3. Creator-and-small-business scheduling.</strong> One person, three channels, publish-and-forget. <em>Later</em>, <em>Buffer</em>, <em>Planoly</em>, <em>Metricool</em>. $10–$50/month, visual calendar first, Instagram-native, sometimes-clumsy on LinkedIn or TikTok.
<br><br>
<strong>4. Social listening and monitoring.</strong> Distinct category — <em>Brandwatch</em>, <em>Talkwalker</em>, <em>Meltwater</em>, <em>Sprout Listening</em>. Not primarily about publishing; about knowing what the market is saying about you and your competitors. Priced $1,000–$10,000+/month.
<br><br>
Most buyers who assume they need "one platform" actually need two: a publishing tool for their own posts, and a listening tool if they're brand-defensive. Trying to force one platform to do both usually results in doing both badly.`
    },
    {
      h2: `What social media management platforms actually cost in 2026`,
      body: `Pricing has fragmented as sharply as capability. A rough map of the 2026 US market:
<br><br>
<strong>Under $50/month</strong> — Buffer, Later starter, Planoly free tier, Hootsuite Professional (single user). Good enough for a founder or a one-person marketing team on two or three channels. Meaningful analytics start above this tier.
<br><br>
<strong>$50–$300/month</strong> — Hootsuite Team, Sprout Social Standard, Loomly, Zoho Social Professional, HubSpot Marketing Hub Starter. The center of gravity of the US SMB and mid-market segment. Multi-user, approval workflows, real reporting.
<br><br>
<strong>$300–$1,000/month</strong> — Sprout Social Advanced, Hootsuite Business, Sprinklr Standard. Enterprise-adjacent — multi-brand, role-based permissions, competitive benchmarking, ad-integration.
<br><br>
<strong>$1,000+/month</strong> — Sprinklr Enterprise, Brandwatch, Hootsuite Enterprise, Sprout Enterprise, Meltwater. Custom pricing, contract minimums, dedicated CSMs. Almost never the right first-time purchase for a company under $50M in revenue.
<br><br>
Buyers routinely overshoot the tier they need — because the enterprise sales motion sells better than the starter tier, not because the enterprise capabilities are actually being used. A useful test: if fewer than three people will ever log in, no tier above $300/month is worth its money.`
    },
    {
      h2: `Platform vs agency: the honest decision`,
      body: `The platform decision is only half the question. The other half is who actually operates it.
<br><br>
<strong>Buy the platform, run it in-house</strong> when: social is a permanent core capability, you can hire a full-time social lead (or already have one), and the volume of publishing justifies the ongoing seat cost of the enterprise features you'll actually use.
<br><br>
<strong>Buy the platform, hire a specialist to run it</strong> when: you want your data and audience under your control, but don't have (or don't want to hire) the in-house expertise. Common at the $10M–$50M revenue range where paying an agency $3–8K/month is cheaper than a $95–140K senior social hire.
<br><br>
<strong>Skip the platform, hire an agency that brings its own</strong> when: social is one channel of several the agency is already running, and you'd rather pay a bundled fee than manage two vendor relationships. Common at earlier-stage companies where the marketing lead doesn't want a social tool sitting mostly unused.
<br><br>
${BRAND}'s directory includes 90 US <a href="../pillars/social-media-marketing.html">social media marketing specialists</a>, of which 13 are software providers and 77 are agencies. Most of the agencies bring their own tooling — meaning for many buyers, the platform decision goes away entirely when the agency decision gets made.`
    },
    {
      h2: `Where social platforms show up in the directory`,
      body: `Social platforms sit at the intersection of two of ${BRAND}'s pillars. The <a href="../pillars/social-media-marketing.html">Social Media Marketing pillar</a> holds the 90 US firms whose primary discipline is social — 77 agencies and 13 software providers. The <a href="../pillars/automation.html">Automation pillar</a> holds broader marketing automation platforms with social modules, plus the CRM-integrated platforms (HubSpot, Salesforce Marketing Cloud) whose social capabilities are part of a larger suite.
<br><br>
The category deep-dive that matters most for buyers is the platform-vs-service split: 14.4% of the Social Media Marketing pillar is software vs 85.6% services. Compare to Automation at 53% software, or AI Marketing at 74%, and the takeaway is clear — social remains a services-led discipline. Platforms enable good work; they rarely substitute for it.`
    }
  ],
  faq: [
    {
      q: `What is the best social media management platform for a small business?`,
      a: `For most small businesses running one brand across two or three channels, Later, Buffer, or Metricool at the $15–$40/month tier does the job. If Instagram is the primary channel, Later's visual calendar is the strongest starting point. If LinkedIn is primary, Buffer or Metricool. Hootsuite Professional at ~$99/month is worth the upgrade only when a second person needs to log in.`
    },
    {
      q: `How much does an enterprise social media management platform cost?`,
      a: `Enterprise tiers of Sprout Social, Hootsuite, and Sprinklr typically start at $500–$1,000/month for smaller multi-brand teams and scale past $5,000/month for large deployments with listening, competitive intelligence, and CRM integration. Below about $10M in revenue with fewer than three social users, enterprise tiers are almost always over-buying.`
    },
    {
      q: `Do I need a social media management platform if I use Buffer or Later?`,
      a: `Buffer and Later are social media management platforms — they just occupy the entry tier. The upgrade question is whether you need capabilities that require paying more: real approval workflows, deeper analytics, listening, multi-brand support, or CRM integration. If none of those, staying on Buffer or Later is the right answer indefinitely.`
    },
    {
      q: `What is the difference between social publishing and social listening?`,
      a: `Social publishing is scheduling and posting your own content — the primary job of Sprout Social, Hootsuite, Buffer, Later. Social listening is monitoring what other people are saying about your brand, competitors, and category — the primary job of Brandwatch, Talkwalker, Meltwater. Some enterprise suites do both; most buyers who need both end up with two tools.`
    },
    {
      q: `Are AI features on social platforms worth paying for in 2026?`,
      a: `The AI features that matter are caption generation, image resizing/reformatting across channels, and post-time optimization. All meaningfully save time. The AI features that don't yet matter: fully-automated content generation and AI-driven strategy recommendations, which produce output that reads generically and rarely outperforms a competent human. Pay for the workflow AI, be skeptical of the strategy AI.`
    }
  ],
  relPillars: ['social-media-marketing', 'automation', 'marketing'],
  ctaCat: 'Social Media Marketing', ctaSlug: 'social-media-marketing'
},
{
  slug: 'local-service-ads',
  headTerm: 'local service ads',
  title: `Local Service Ads: How They Work, What They Cost, and Whether They Fit Your Business — The Wall`,
  metaDesc: `What Google's Local Service Ads are, how they differ from Google Search Ads, what businesses qualify, what leads actually cost in 2026, and when hiring an agency to manage them makes financial sense — grounded in The Wall's directory of US SEO and Marketing firms.`,
  h1: `Local Service Ads`,
  dek: `Local Service Ads (LSAs) are Google's pay-per-lead ad format for service businesses — the ads that show at the very top of local search results with a "Google Guaranteed" badge, a review score, and a phone number. They are not the same product as Google Search Ads, and they behave differently at every stage from qualifying to billing. Here is exactly what they are, what a lead actually costs in 2026, and when they belong in the mix.`,
  sections: [
    {
      h2: `What Local Service Ads actually are (and are not)`,
      body: `LSAs are a distinct Google ad product from Google Search Ads. Three defining differences:
<br><br>
<strong>1. Pay-per-lead, not pay-per-click.</strong> Google charges the advertiser only when a qualified lead contacts the business through the ad — a phone call, a message, or a booking. Random clicks are free. This alone is a material shift from search-ads economics.
<br><br>
<strong>2. Ads run above Search Ads.</strong> On mobile especially, LSAs occupy the top 2–3 slots of the results, above the traditional Google Ads block, above the map pack, above organic. Prime real estate for local intent queries.
<br><br>
<strong>3. Requires background check, license verification, and insurance disclosure.</strong> Google runs (or contracts) verification of the business's licenses, insurance, and (for many categories) employee background checks. The "Google Guaranteed" or "Google Screened" badge that appears on the ad is the visible artifact of this vetting. Not all businesses qualify.`
    },
    {
      h2: `Which businesses qualify — and what "qualify" means`,
      body: `LSAs are only available for specific service categories that Google has approved for the format. As of 2026, the largest categories include:
<br><br>
<strong>Home services</strong> — HVAC, plumbing, electricians, roofers, garage door, appliance repair, house cleaning, lawn care, movers, pest control, tree service, locksmiths.
<br><br>
<strong>Professional services</strong> — real estate agents, lawyers (several practice areas), financial planners, tax professionals, accountants.
<br><br>
<strong>Health and personal care</strong> — dentists, chiropractors, veterinarians, pet grooming.
<br><br>
<strong>Event and lifestyle</strong> — photographers, event planners, tutors, personal trainers.
<br><br>
"Qualify" means: the business is verifiably in one of those categories, holds current licenses in every service state, carries appropriate liability insurance, and (in most categories) passes employee background checks Google contracts through third-party vendors. The verification takes 1–3 weeks and needs to be re-run periodically.`
    },
    {
      h2: `What LSA leads actually cost in 2026`,
      body: `Cost-per-lead varies wildly by category, geography, and competition. A rough map from what US operators are actually paying in 2026:
<br><br>
<strong>$8–$30 per lead</strong> — home services outside dense metros, lower-competition categories (some pest, some appliance repair).
<br><br>
<strong>$30–$100 per lead</strong> — home services in mid-size metros, tax professionals, financial planners.
<br><br>
<strong>$100–$300 per lead</strong> — legal (personal injury especially), high-value home services in top-10 metros, elective dental, some real estate.
<br><br>
<strong>$300+ per lead</strong> — mass-tort legal, some financial-services categories in top-3 metros.
<br><br>
Google's bidding model lets advertisers set a monthly budget and either "maximize leads" (let Google set the bid) or "set max per lead" (fixed cap). The important economic reality: LSA leads are exclusive to the advertiser who won them, and lead quality is generally higher than pay-per-click clicks because the buyer took a phone action, not a passive click. Effective cost-per-customer is often <em>lower</em> than search ads at nominally higher cost-per-lead.`
    },
    {
      h2: `When to hire an agency to manage LSAs (and when not to)`,
      body: `LSAs have a lower operator burden than Google Search Ads — no keywords to manage, no ad copy to write, no landing pages to optimize. Which means: for a small local service business under about $2M in revenue, running LSAs in-house is almost always the right call. The account takes 30 minutes a week once set up.
<br><br>
Agencies earn their fee at higher scale, or across specific problem shapes: multi-location businesses running LSAs across 10+ markets; businesses with poor review flow whose LSA performance is capped by their Google review score; businesses whose lead-response time is broken (LSAs punish slow response); and businesses in disputed-lead-heavy categories where Google's lead-quality complaints need active management.
<br><br>
Across ${BRAND}'s directory of 550 US <a href="../pillars/marketing.html">Marketing firms</a> and 226 US <a href="../pillars/seo.html">SEO firms</a>, a growing subset specialize in LSAs — often as part of a broader local-marketing service including Google Business Profile optimization, review generation, and traditional local SEO. Rate bands for these specialists sit in the standard $100–$199 hourly range with monthly management fees typically $500–$3,000 depending on number of markets and lead volume.`
    }
  ],
  faq: [
    {
      q: `What are Local Service Ads?`,
      a: `Local Service Ads are Google's pay-per-lead ad format for service businesses. They appear at the top of local search results with a "Google Guaranteed" or "Google Screened" badge, a review score, and a phone number. Google charges the advertiser only when a qualified lead contacts them, not per click.`
    },
    {
      q: `How much do Google Local Service Ads cost per lead?`,
      a: `Cost per lead in 2026 ranges from about $8 for low-competition home services outside major metros to $300+ for legal categories in top metros. Most home-services and mid-market professional-services categories fall between $30 and $100 per lead. Google's system lets advertisers set monthly budgets and either automatic or capped bids.`
    },
    {
      q: `What is the difference between Local Service Ads and Google Ads?`,
      a: `Google Ads (formerly AdWords) is pay-per-click across the web and Google Search results. Local Service Ads is a separate, newer product limited to specific service categories, priced per qualified lead instead of per click, requiring background/license/insurance verification, and running above traditional Search Ads on the results page.`
    },
    {
      q: `Which businesses qualify for Local Service Ads?`,
      a: `Home services (HVAC, plumbing, electrical, cleaning, pest, roofing, garage, etc.), professional services (lawyers, real estate, financial, tax), health services (dentists, chiropractors, vets), and event/lifestyle services (photographers, event planners, tutors, trainers). Each business must hold current licenses, carry insurance, and pass the required background checks — a 1–3 week process managed through Google's verification vendor.`
    },
    {
      q: `Should I hire an agency for Local Service Ads?`,
      a: `For small local businesses running LSAs in a single market, in-house management is usually the right call — the ongoing time commitment is about 30 minutes a week once set up. Agencies earn their fees at higher scale (multi-location, multi-market), or when the business needs help with adjacent problems: Google review flow, lead-response speed, dispute management. Monthly management fees typically $500–$3,000.`
    }
  ],
  relPillars: ['seo', 'marketing', 'demand-gen'],
  ctaCat: 'SEO', ctaSlug: 'seo'
},
{
  slug: 'digital-marketing-platform-for-small-businesses',
  headTerm: 'digital marketing platform for small businesses',
  title: `Digital Marketing Platforms for Small Businesses: The 2026 Buyer's Reference — The Wall`,
  metaDesc: `Google search for "digital marketing platform for small businesses" is up 1,015% YoY. Here's what the category actually contains in 2026 — HubSpot, Mailchimp, ActiveCampaign, Constant Contact, Brevo, GoDaddy, Wix, Squarespace, Vendasta — what they cost, and how to pick.`,
  h1: `Digital Marketing Platforms for Small Businesses`,
  dek: `Search for "digital marketing platform for small businesses" is up 1,015% year-over-year to 40,500 monthly Google searches — a signal the sub-$5M operator segment is shopping for tooling explicitly framed for them, not tolerating enterprise pricing anymore. The category is broader than most buyers realize and clusters into four distinct buyer shapes. Here is what actually differentiates them and how to pick.`,
  sections: [
    {
      h2: `What "digital marketing platform for small businesses" actually contains`,
      body: `The phrase covers four different product categories that behave nothing alike at buy-time:
<br><br>
<strong>1. All-in-one marketing suites</strong> — HubSpot Marketing Hub Starter, ActiveCampaign, Brevo (formerly Sendinblue), Keap. Email + basic CRM + landing pages + automation + reporting in one login. $30–$150/month at the SMB tier. Deep by SMB standards, shallow by enterprise. The category most buyers actually mean when they search this phrase.
<br><br>
<strong>2. Email-first platforms with add-ons</strong> — Mailchimp, Constant Contact, MailerLite, Klaviyo (for e-commerce). Started as email, grew into modest CRM, landing pages, and automation. $20–$100/month. Excellent at email; adequate at the rest.
<br><br>
<strong>3. Website-plus-marketing platforms</strong> — Squarespace + Marketing, Wix Business, GoDaddy Digital Marketing Suite, Duda. Website builder that added marketing tools rather than a marketing platform that added a website. $30–$100/month. Best for businesses that primarily need a site and want the marketing to piggyback.
<br><br>
<strong>4. Agency-in-a-box platforms</strong> — Vendasta, DashClicks, GoHighLevel. Not primarily sold to SMBs directly — sold to agencies and consultants who then resell the platform bundled with their services. If you're seeing these while searching, you're being marketed to by a small local agency that runs them under the hood.`
    },
    {
      h2: `What each shape actually costs`,
      body: `The category's pricing sits in a narrower band than the enterprise martech market — $20 to $300/month covers almost everything an SMB would encounter — but the ceiling matters:
<br><br>
<strong>Under $50/month</strong> — Mailchimp Standard, Brevo Business, MailerLite Advanced, Constant Contact Standard, Squarespace Basic. Real capability at this tier if the business needs email + a website + a light CRM.
<br><br>
<strong>$50–$150/month</strong> — HubSpot Marketing Hub Starter, ActiveCampaign Plus, Keap Grow, Klaviyo mid-tier. Where automation gets real, deeper CRM integration, better reporting.
<br><br>
<strong>$150–$500/month</strong> — HubSpot Marketing Hub Professional, ActiveCampaign Professional, Keap Pro, enterprise-adjacent Klaviyo. Above the SMB sweet spot; usually overbuying for under-$5M businesses.
<br><br>
<strong>$500+/month</strong> — HubSpot Marketing Hub Enterprise and equivalents. Almost never worth it for genuine SMBs. If a business is spending this on marketing platforms, the money is almost always better spent on a fractional-CMO or an agency (see: <a href="marketing-consultant.html">marketing consultant hub</a>).`
    },
    {
      h2: `How to pick — the three questions that matter`,
      body: `<strong>1. What does the business actually do first — email, content, ads, or ecommerce?</strong>
Email-first: Mailchimp, Brevo, MailerLite. Content + inbound: HubSpot. Paid ads with landing pages: Unbounce or the ads platforms directly. E-commerce: Klaviyo. Trying to make one platform serve every need equally usually results in decent-at-all-mediocre-at-each.
<br><br>
<strong>2. Is there a CRM already in use?</strong>
If yes, pick a marketing platform that integrates cleanly (Zapier at minimum, native at best). If no, pick a suite that includes a CRM (HubSpot, ActiveCampaign, Keap) rather than bolting one on later.
<br><br>
<strong>3. Who will actually run it?</strong>
Founder or founding team member with 5 hrs/week: pick simple. Dedicated marketing hire with 20+ hrs/week: pick capable. Small local agency: they'll bring their preferred stack (often GoHighLevel or Vendasta), and the discussion shifts from platform to agency.
<br><br>
The single most expensive mistake in this category is buying the platform for the vision (what the business hopes to do in year two) rather than the reality (what someone will actually operate this quarter).`
    },
    {
      h2: `Where these platforms live in the directory`,
      body: `${BRAND}'s core reader is US operators past $5M in revenue — larger than the segment most of these platforms target. But: the directory does list many of the agencies that operate these platforms on behalf of smaller clients, and the underlying platforms themselves surface in the <a href="../pillars/automation.html">Automation</a> and <a href="../pillars/ai-marketing.html">AI Marketing</a> pillars.
<br><br>
For an operator whose current spend on marketing is under $5,000/month, the honest guidance is: buy the platform yourself, run it in-house, and consider an agency only when the operational overhead of running it exceeds the marketing benefit you're getting. For an operator whose spend is $5,000–$15,000/month, an agency running one of the mid-tier platforms on your behalf usually beats DIY. Above $15,000/month monthly spend, custom engagements with a proper marketing agency (see the <a href="../pillars/marketing.html">Marketing pillar</a>) usually beats platform + generalist agency.`
    }
  ],
  faq: [
    {
      q: `What is the best digital marketing platform for a small business in 2026?`,
      a: `There is no single "best" — the answer depends on what the business does first. For email-driven businesses: Mailchimp, Brevo, or MailerLite at $20–$50/month. For content and inbound: HubSpot Marketing Hub Starter at $20/month, upgrading as you grow. For e-commerce: Klaviyo. For businesses that primarily need a website: Squarespace, Wix, or Duda with marketing add-ons.`
    },
    {
      q: `How much does a digital marketing platform cost for a small business?`,
      a: `The SMB sweet spot is $30–$150/month per month. Under $50 covers email-first platforms with modest CRM and automation; $50–$150 gets you real automation, deeper CRM, and better reporting from HubSpot, ActiveCampaign, or Klaviyo mid-tiers. Above $500/month is almost always overbuying for a genuine SMB.`
    },
    {
      q: `What is the difference between HubSpot and Mailchimp for a small business?`,
      a: `Mailchimp is email-first with modest CRM, landing pages, and automation added on. HubSpot is a full marketing suite (email + CRM + landing pages + automation + reporting) that scales into enterprise. For a business that primarily wants email marketing, Mailchimp is simpler and cheaper. For a business that wants a unified CRM + marketing system with room to grow, HubSpot's starter tier is worth the extra $10/month.`
    },
    {
      q: `Do I need a digital marketing platform if I already have a website?`,
      a: `Yes — the website is where marketing lands, not what runs marketing. A digital marketing platform handles the email sends, the automation, the CRM, the lead capture, and the reporting. Some website builders (Wix, Squarespace, Duda) include a marketing suite that covers the basics; a dedicated marketing platform does the job better once volume justifies it.`
    },
    {
      q: `Should a small business use a digital marketing platform or hire an agency?`,
      a: `Under about $5,000/month in total marketing spend: buy the platform, run it yourself or with a part-time contractor. $5,000–$15,000/month: an agency running the platform for you usually beats DIY. Above $15,000/month: a full-service marketing agency (not tied to a specific platform) typically outperforms platform+generalist.`
    }
  ],
  relPillars: ['automation', 'marketing', 'ai-marketing'],
  ctaCat: 'Automation', ctaSlug: 'automation'
}
];

// ---------------------------------------------------------------- shell (mirrors build-pillars.mjs styling)
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
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join('\n')}
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
  .dek{font-family:var(--serif);font-style:italic;font-size:17.5px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  h3{font-family:var(--serif);font-weight:600;font-size:16.5px;margin:20px 0 6px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .cta{display:inline-block;font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;color:#fff;background:var(--cobalt);border-radius:7px;padding:10px 16px;text-decoration:none;margin:14px 0 8px}
  .faq-item{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:12px 0}
  .faq-item h3{margin:0 0 6px;font-size:15.5px}
  .faq-item p{margin:0;font-size:13.5px}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
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

// ---------------------------------------------------------------- render
mkdirSync(join(ROOT, 'hubs'), { recursive: true });

// need pillar cat/n for the "related" section — pull from build-pillars.mjs
const pillarsSrc = readFileSync(join(ROOT, 'build-pillars.mjs'), 'utf8');
const pillarLookup = {};
for (const m of pillarsSrc.matchAll(/slug: '([^']+)', cat: '([^']+)'/g)) pillarLookup[m[1]] = m[2];
const pillarN = {};
for (const m of pillarsSrc.matchAll(/slug: '([^']+)'[^}]*?stats: \{ n: (\d+)/gs)) pillarN[m[1]] = m[2];

for (const h of HUBS) {
  const canonical = `${SITE}/hubs/${h.slug}.html`;
  const bodyText = [h.dek, ...h.sections.map(s => `${s.h2}. ${strip(s.body)}`), ...h.faq.map(f => `${f.q} ${f.a}`)].join(' ');

  const ld = [ORG_LD,
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: h.h1, description: h.metaDesc,
      datePublished: TODAY, dateModified: TODAY,
      author: { '@type': 'Organization', name: `${BRAND} Editorial Team`, url: `${SITE}/about.html` },
      publisher: { '@type': 'Organization', name: BRAND, url: `${SITE}/` },
      mainEntityOfPage: canonical, url: canonical, articleBody: bodyText.slice(0, 5000)
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: h.faq.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Reference', item: `${SITE}/glossary.html` },
        { '@type': 'ListItem', position: 3, name: h.h1 }
      ]
    }];

  const relPillarsHTML = h.relPillars?.length
    ? `<div class="rel"><h3>RELATED DISCIPLINES</h3>
${h.relPillars.map(s => pillarLookup[s] ? `<a href="../pillars/${s}.html">${esc(pillarLookup[s])}${pillarN[s] ? ` — ${pillarN[s]} listings` : ''}</a>` : '').join('\n')}
</div>` : '';

  const body = `
<div class="kicker">REFERENCE · HUB</div>
<h1>${esc(h.h1)}</h1>
<p class="dek">${h.dek}</p>
${h.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${s.body}</p>`).join('\n')}
<a class="cta" href="../?cat=${encodeURIComponent(h.ctaCat || 'Marketing')}">BROWSE ${pillarN[h.ctaSlug || 'marketing'] || ''} US ${esc((h.ctaCat || 'Marketing').toUpperCase())} FIRMS →</a>
<h2>Frequently asked</h2>
${h.faq.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}
${relPillarsHTML}
<div class="rel"><h3>REFERENCE</h3>
<a href="../glossary.html">The Wall glossary — growth-vendor terms defined</a>
<a href="../news/">Data briefings on the US growth-vendor market</a>
</div>`;

  writeFileSync(join(ROOT, 'hubs', `${h.slug}.html`),
    shell({ title: h.title, metaDesc: h.metaDesc, canonical, ld, bodyHTML: body, base: '../' }));
}

// hubs index
const idxLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: `Buyer Hubs — ${BRAND}`, url: `${SITE}/hubs/`,
  description: `Reference pages for the high-intent buyer questions in the US growth-vendor market — marketing consultants, paid advertising platforms, B2B marketing agencies, and more.`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: HUBS.map((h, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: `${SITE}/hubs/${h.slug}.html`, name: h.h1
    }))
  }
}];
const idxBody = `
<div class="kicker">REFERENCE / BUYER HUBS</div>
<h1>Buyer hubs</h1>
<p class="dek">Reference pages for the questions buyers most often bring to ${BRAND} — what a marketing consultant costs, when to hire a B2B agency, how paid-ad platforms actually price. Each hub grounds the answer in real data from the directory.</p>
${HUBS.map(h => `<div class="faq-item"><h2><a href="${h.slug}.html">${esc(h.h1)}</a></h2><p>${esc(h.dek).slice(0, 220)}${h.dek.length > 220 ? '…' : ''}</p></div>`).join('\n')}
<div class="rel"><h3>KEEP GOING</h3>
<a href="../entities/">Platform reference — the tools that show up on shortlists</a>
<a href="../glossary.html">The Wall glossary — 200+ growth-vendor terms defined</a>
<a href="../news/">Data briefings on the US growth-vendor market</a>
</div>`;
writeFileSync(join(ROOT, 'hubs', 'index.html'),
  shell({
    title: `Buyer Hubs — Reference Pages on High-Intent Growth-Vendor Questions — ${BRAND}`,
    metaDesc: `${HUBS.length} reference pages for the high-intent buyer questions in the US growth-vendor market — marketing consultants, paid advertising platforms, B2B marketing agencies, social media management platforms, Google Local Service Ads, and more. From The Wall.`,
    canonical: `${SITE}/hubs/`, ld: idxLD, bodyHTML: idxBody, base: '../'
  }));

console.log(`hub pages written: ${HUBS.length} + index`);
