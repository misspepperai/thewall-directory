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

console.log(`hub pages written: ${HUBS.length}`);
