// Generates head-to-head entity comparison pages at compare/{a-vs-b}.html
// Run: node build-compare.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pillar, entity } from './slugs.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Each pair: slug, name, url, pillar, category (short), pricing tier, use-case fit
// Every claim below is entity self-description or publicly-listed pricing (confirmed circa 2026 Q2).
const COMPARISONS = [
  {
    slug: 'hubspot-vs-salesforce', a: 'HubSpot', b: 'Salesforce',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'The two market-share leaders in customer-record-of-truth software — one built inbound-out (HubSpot), one built enterprise-out (Salesforce). Choose wrong and you either outgrow the stack in year two or pay for enterprise complexity you cannot staff.',
    left: { name: 'HubSpot', url: 'https://hubspot.com', pricingStart: '$0 free / $50-per-seat Starter', builtFor: 'SMB → mid-market, marketing-led', deployWeeks: '2–6', adminBurden: 'Low (in-house marketer)', signature: 'All-in-one hub, opinionated workflows' },
    right: { name: 'Salesforce', url: 'https://salesforce.com', pricingStart: '$25-per-seat Starter / $300+ Enterprise', builtFor: 'Mid-market → enterprise, sales-led', deployWeeks: '8–20+', adminBurden: 'High (dedicated Salesforce admin)', signature: 'Extensibility, ecosystem, custom object depth' },
    dimensions: [
      ['Ease of onboarding', 'Fast — most SMBs live in 30 days', 'Slow — enterprise implementations run 3–6 months, and often involve a partner'],
      ['Reporting flexibility', 'Strong for OOB reports; falls off for cross-object custom analysis', 'Effectively unlimited — but requires admin skill to build'],
      ['Total cost year 1', 'Predictable per-seat billing; add-on hubs add up around $50K', 'Wide range; enterprise deployments routinely $150K+ with services'],
      ['Customization ceiling', 'Ceiling exists — you feel it at 500+ pipelines or heavy custom objects', 'No practical ceiling — the tradeoff is complexity, not capability'],
      ['Ecosystem', 'App marketplace focused on marketing/service integrations', 'AppExchange — thousands of vertical and horizontal apps'],
      ['Data lock-in risk', 'Moderate — migrations are painful but done routinely', 'High — Salesforce data models often reshape processes around themselves']
    ],
    verdict: {
      pickA: 'You are marketing-led, under ~$50M revenue, and want an opinionated system your team can run without a certified admin. HubSpot ships you into production in a month; six months in, you know if you\'re outgrowing it.',
      pickB: 'You are sales-led, at or headed above $50M revenue, and either already have or are ready to hire a full-time Salesforce admin. The complexity buys you extensibility no other platform matches — but only if you have the operational depth to use it.'
    }
  },
  {
    slug: 'ahrefs-vs-semrush', a: 'Ahrefs', b: 'Semrush',
    pillar: 'SEO', pillarSlug: 'seo',
    intro: 'The two dominant search-visibility platforms. Both cost roughly the same, both cover roughly the same surface area — the split is mostly workflow preference, and picking wrong wastes $2–5K/year and a week of retraining.',
    left: { name: 'Ahrefs', url: 'https://ahrefs.com', pricingStart: '$129/mo Lite → $999/mo Enterprise', builtFor: 'SEO specialists, agencies, technical operators', deployWeeks: '1–2 (mostly training)', adminBurden: 'Medium — data-savvy operator required', signature: 'Backlink index depth, keyword database precision' },
    right: { name: 'Semrush', url: 'https://semrush.com', pricingStart: '$139/mo Pro → $499/mo Business', builtFor: 'Marketers, content teams, PR + paid + SEO overlap', deployWeeks: '1–2', adminBurden: 'Medium', signature: 'PPC + PR + social-adjacent tooling in the same UI' },
    dimensions: [
      ['Backlink index size and freshness', 'Widely considered the deepest live-links index in the market', 'Solid, but historically a step behind Ahrefs on backlink recency'],
      ['Keyword database', 'Very strong US/global; strong at commercial intent scoring', 'Equally strong; better keyword clustering and topic-map tooling'],
      ['Rank tracking', 'Built-in, competent; no daily granular tracking below Advanced tier', 'Built-in; project quotas can bite on multi-brand agencies'],
      ['Content workflow', 'Solid — Content Explorer + basic templates', 'More opinionated — content templates, on-page assistant, topic research'],
      ['PPC & PR tooling', 'Minimal', 'Full advertising research + PR toolkit built in'],
      ['Support and community', 'Ahrefs Academy is excellent free training', 'Semrush Academy has hundreds of certified courses'],
      ['Pricing scaling', 'Per-user is expensive — small teams share seats', 'Base plan is single-user, but multi-user tiers step up cleanly']
    ],
    verdict: {
      pickA: 'You are an SEO specialist, agency, or in-house operator whose core job is search visibility. Backlink depth and keyword-precision workflows are what you\'ll use daily — not PPC research or PR alerts.',
      pickB: 'You are a marketer with cross-channel responsibility (SEO + paid + PR + content). Semrush covers the whole surface in one login; the SEO tools are 90% as strong as Ahrefs but the ecosystem does more.'
    }
  },
  {
    slug: 'apollo-io-vs-zoominfo', a: 'Apollo.io', b: 'ZoomInfo',
    pillar: 'Sales Automation', pillarSlug: 'sales-automation',
    intro: 'The two dominant B2B contact-data platforms. ZoomInfo built enterprise-tier data + intent signals at enterprise pricing; Apollo built PLG data + sequencing at a fraction of the cost. The price gap is enormous — the data gap has narrowed.',
    left: { name: 'Apollo.io', url: 'https://apollo.io', pricingStart: '$49/mo Basic → $99+/mo Professional', builtFor: 'SMB → mid-market, outbound SDR teams', deployWeeks: '1', adminBurden: 'Low', signature: 'Contact data + sequencing + dialer in one product at PLG pricing' },
    right: { name: 'ZoomInfo', url: 'https://zoominfo.com', pricingStart: '$14,995+/year (typical annual contract $30K–$80K+)', builtFor: 'Enterprise sales orgs, RevOps, ABM teams', deployWeeks: '4–8', adminBurden: 'High — dedicated RevOps ownership expected', signature: 'Intent signals, org charts, enterprise-grade data operations' },
    dimensions: [
      ['Contact record volume', '275M+ B2B contacts; strong on North America, growing globally', '200M+ contacts; historically strongest on North American enterprise'],
      ['Email deliverability', 'Verified-email tags; bounce rates comparable to ZoomInfo on active contacts', 'Verified rates strong; intent data adds trigger context'],
      ['Sequencing / cadences', 'Native — Apollo IS a sequencing tool as much as a data tool', 'Available via ZoomInfo Engage add-on (extra cost)'],
      ['Intent data', 'Basic — company signals and hiring intent', 'Class-leading — Bombora intent + technographic + org-chart triangulation'],
      ['Contract flexibility', 'Monthly, per-seat, cancel anytime', 'Annual only; multi-year discounts push commitment'],
      ['Total cost, 5-seat team', '~$3,000/year all-in', '~$40,000–$80,000/year all-in'],
      ['Support tier', 'PLG-standard (chat + docs)', 'Named CSM, quarterly reviews']
    ],
    verdict: {
      pickA: 'You are running outbound and the person picking tools is also the person running the sequences. Apollo\'s data has narrowed the gap enough that most SMB-to-mid-market teams cannot justify ZoomInfo\'s 10-20x price tag anymore.',
      pickB: 'You are an enterprise sales org where intent data and technographic org-charts drive account selection, and where a $40K+ tool costs less than one missed enterprise deal. ZoomInfo\'s data operations are still deeper — the question is whether your process actually uses that depth.'
    }
  },
  {
    slug: 'beehiiv-vs-substack', a: 'Beehiiv', b: 'Substack',
    pillar: 'Content Marketing', pillarSlug: 'content-marketing',
    intro: 'The two platforms every serious newsletter operator now considers. Substack invented the modern paid-newsletter economy; Beehiiv rebuilt it as a publisher-first business. The choice is philosophical — who owns your audience, and who gets a cut.',
    left: { name: 'Beehiiv', url: 'https://beehiiv.com', pricingStart: '$0 free → $49–$99/mo Scale', builtFor: 'Serious operators, media brands, business-model diversifiers', deployWeeks: '1', adminBurden: 'Low–medium', signature: 'Publisher owns the audience + monetization stack; no revenue share' },
    right: { name: 'Substack', url: 'https://substack.com', pricingStart: '$0 free / 10% of paid revenue', builtFor: 'Individual writers, first-time newsletters, network-effect seekers', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Instant reach via Substack Network + Notes + recommendations' },
    dimensions: [
      ['Revenue share', '0% — you keep 100% of subscriptions (Stripe fees only)', '10% — Substack takes 10% of every paid dollar'],
      ['Ad monetization', 'Built-in ad network (Beehiiv Ad Network) with programmatic delivery', 'None — paid subscriptions or nothing'],
      ['Audience ownership', 'You own email list, can export freely', 'You own list, but network effect belongs to Substack'],
      ['Discovery / network', 'Modest — recommendation engine present but small', 'Massive — Substack Network drives cross-promotion at scale'],
      ['Publication design', 'Highly customizable — themes, custom domains, embeds', 'Deliberately minimal — clean but locked-in aesthetic'],
      ['Referral / growth tools', 'Full referral program builder', 'Basic recommendations, no built-in referral incentives'],
      ['Team accounts', 'Multi-author supported cleanly', 'Multi-author possible but not the primary use case']
    ],
    verdict: {
      pickA: 'You are running a newsletter as a business — you want to keep 100% of revenue, add ads, own your monetization, and build with team members. The 10% Substack takes is real money once you cross $10K MRR.',
      pickB: 'You are just starting, need discovery help, and want the simplest possible setup. The Substack Network genuinely gets new writers subscribers faster than any alternative — worth the 10% until you can grow without it.'
    }
  },
  {
    slug: 'outreach-io-vs-salesloft', a: 'Outreach', b: 'Salesloft',
    pillar: 'Sales Automation', pillarSlug: 'sales-automation',
    intro: 'The two sales engagement platforms every enterprise sales org considers. Both do sequences, dialers, and AI insights well; both cost the same. The choice usually comes down to team preference and existing tech-stack fit.',
    left: { name: 'Outreach', url: 'https://outreach.io', pricingStart: 'Contact sales (~$130-$210/seat/mo typical)', builtFor: 'Enterprise sales orgs, complex sequences, AI forecasting', deployWeeks: '4–8', adminBurden: 'High', signature: 'AI-driven forecasting + deal-intelligence layer' },
    right: { name: 'Salesloft', url: 'https://salesloft.com', pricingStart: 'Contact sales (~$125-$165/seat/mo typical)', builtFor: 'Enterprise sales, revenue teams valuing UX', deployWeeks: '3–6', adminBurden: 'Medium–high', signature: 'Cleaner UX, stronger coaching + cadence analytics' },
    dimensions: [
      ['Sequencing depth', 'Class-leading — most powerful branching logic', 'Strong — competitive on core features, cleaner interface'],
      ['AI capabilities', 'Kaia (call intelligence), Guide (deal AI) — deeper AI investment', 'Rhythm (AI signals + actions) — competent, less mature than Outreach\'s'],
      ['User experience', 'Powerful but complex — steeper learning curve', 'Notably cleaner — reps ramp faster'],
      ['Coaching / call analysis', 'Strong', 'Considered best-in-class by many enterprise sales leaders'],
      ['Ecosystem integrations', 'Broad and deep', 'Broad and deep — near parity'],
      ['Salesforce depth', 'Native, very deep', 'Native, very deep'],
      ['Contract flexibility', 'Annual, seat-based', 'Annual, seat-based']
    ],
    verdict: {
      pickA: 'You are an enterprise sales org where AI-driven forecasting and deal intelligence justify a steeper learning curve. Outreach\'s AI moat is genuine — if your process uses it.',
      pickB: 'You are an enterprise sales org where rep adoption speed and coaching quality matter more than raw feature depth. Salesloft\'s cleaner UX means more reps actually use it.'
    }
  },
  {
    slug: 'zapier-vs-make', a: 'Zapier', b: 'Make',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'The two dominant no-code integration platforms. Zapier is the simplest, most-integrated option; Make (formerly Integromat) is the more powerful, visually-modeled alternative at lower cost per task. The choice is complexity ceiling versus onboarding speed.',
    left: { name: 'Zapier', url: 'https://zapier.com', pricingStart: '$0 → $19.99/mo Starter → $49/mo Professional → $69/mo Team', builtFor: 'Anyone who needs A → B automation; broadest integration coverage', deployWeeks: '<1', adminBurden: 'Very low', signature: '7,000+ integrations, dead-simple UX' },
    right: { name: 'Make', url: 'https://make.com', pricingStart: '$0 → $9/mo Core → $16/mo Pro → $29/mo Teams', builtFor: 'Operators building complex, multi-step visual workflows', deployWeeks: '1–2', adminBurden: 'Low–medium', signature: 'Visual scenario builder, complex routing, better per-task pricing' },
    dimensions: [
      ['Integration count', '7,000+ apps supported — the widest coverage in the market', '~1,700+ apps — narrower but growing; deep coverage on major platforms'],
      ['Complexity ceiling', 'Simple to moderate — struggles with 10+ step branching workflows', 'Very high — visual scenarios handle enterprise-grade orchestration'],
      ['Pricing per task', 'Expensive at scale — task pricing adds up on high-volume flows', 'Much cheaper per task/operation — often 3-10x cheaper at volume'],
      ['Learning curve', 'Minutes — anyone can build a Zap', 'Hours — scenarios take training to master'],
      ['Error handling', 'Basic — retries, notifications', 'Sophisticated — error routes, filters, iterators'],
      ['Data transformation', 'Basic — formatters + limited code steps', 'Rich — built-in functions, iterators, parsers'],
      ['Team collaboration', 'Solid — shared folders, connections', 'Solid — shared teams, organizations']
    ],
    verdict: {
      pickA: 'You need to wire together apps quickly, most of your flows are 2–5 steps, and integration coverage matters more than cost or complexity. Zapier is the fastest path from idea to working automation.',
      pickB: 'You are building complex multi-branch workflows, running high volume (10K+ tasks/mo), or need visual orchestration a non-developer can maintain. Make costs less and scales further.'
    }
  },
  {
    slug: 'klaviyo-vs-mailchimp', a: 'Klaviyo', b: 'Mailchimp',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'Two email platforms that have diverged completely. Mailchimp was the SMB email standard for 15 years; Klaviyo owned the ecommerce specialization play and now dominates DTC. If you sell products, this is a solved decision.',
    left: { name: 'Klaviyo', url: 'https://klaviyo.com', pricingStart: '$0 up to 250 contacts → scales with list size', builtFor: 'Ecommerce brands (Shopify-first), DTC, subscription commerce', deployWeeks: '1–2', adminBurden: 'Medium', signature: 'Behavioral segmentation on ecommerce data; deep Shopify integration' },
    right: { name: 'Mailchimp', url: 'https://mailchimp.com', pricingStart: '$0 up to 500 contacts → scales with contacts + features', builtFor: 'General SMB, service businesses, non-ecommerce newsletters', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Broadest generalist tooling, marketing website + landing pages included' },
    dimensions: [
      ['Ecommerce specialization', 'Purpose-built — every UI decision assumes you sell products', 'General-purpose — ecommerce integrations exist but aren\'t the focus'],
      ['Shopify integration', 'Deepest in the market — bi-directional data, product feeds, review triggers', 'Available but less native — feels bolted on'],
      ['Segmentation depth', 'Class-leading — behavioral, predictive lifetime value, custom properties', 'Basic to moderate — improved recently but still lags Klaviyo'],
      ['Automation flows', 'Sophisticated — abandoned cart, browse abandonment, back-in-stock', 'Solid basic automations — abandoned cart, welcome, birthday'],
      ['SMS included?', 'Yes — Klaviyo SMS is a unified product', 'Add-on, less mature'],
      ['Landing pages / website', 'Basic', 'Full — sites, landing pages, appointment booking'],
      ['Pricing at 10K contacts', '~$150/mo', '~$100/mo']
    ],
    verdict: {
      pickA: 'You sell products — DTC, Shopify, Amazon, subscription. Klaviyo\'s ecommerce specialization pays for itself in month one, and the segmentation depth is genuinely differentiated.',
      pickB: 'You do not sell products. Newsletter, service business, agency, coach. Mailchimp\'s generalist tooling covers your needs at lower cost, and you don\'t need Klaviyo\'s ecommerce specialization.'
    }
  },
  {
    slug: 'chatgpt-vs-claude', a: 'ChatGPT', b: 'Claude',
    pillar: 'AI Marketing', pillarSlug: 'ai-marketing',
    intro: 'The two most-used general-purpose LLMs in marketing workflows. Both write; both reason; both integrate. The differences are subtle enough that most operators end up using both — but the primary daily-driver choice affects team habit and monthly spend.',
    left: { name: 'ChatGPT', url: 'https://chatgpt.com', pricingStart: '$0 free → $20/mo Plus → $200/mo Pro → $30/seat Team', builtFor: 'General-purpose LLM use, image generation, live web browsing', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Broadest ecosystem — GPTs, DALL-E, Advanced Voice, live browsing' },
    right: { name: 'Claude', url: 'https://claude.ai', pricingStart: '$0 free → $20/mo Pro → $200/mo Max → $25/seat Team', builtFor: 'Long-form reasoning, writing, code, structured analysis', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Longer context, stronger writing craft, honest hedging' },
    dimensions: [
      ['Writing quality', 'Very strong; sometimes over-formal and formulaic', 'Widely preferred for long-form writing craft, subtlety, voice'],
      ['Reasoning', 'Strong across models; o-series models excel at math/logic', 'Strong; class-leading at multi-step analysis without overreach'],
      ['Coding', 'Excellent — Codex, GPT-5 code performance top-tier', 'Excellent — Claude widely used in Cursor, Zed, developer workflows'],
      ['Context window', 'Up to 128K/200K depending on model', 'Up to 200K–1M depending on model'],
      ['Image / multimodal', 'DALL-E built in; strong vision', 'Vision strong; no native image generation'],
      ['Web browsing', 'Native and mature', 'Native and mature (2025)'],
      ['Ecosystem (GPTs, MCP, Projects)', 'GPTs marketplace, Projects, Custom Instructions', 'Projects, Skills, Claude Code, extensive MCP integrations'],
      ['Enterprise controls', 'Robust — SSO, data controls, admin', 'Robust — SSO, data controls, admin']
    ],
    verdict: {
      pickA: 'You want the broadest ecosystem — image generation, GPTs marketplace, voice mode, live browsing, and the largest third-party integration base. ChatGPT is the safest single-vendor bet for a marketing team.',
      pickB: 'Your primary use is writing, reasoning, long-document analysis, or code — and quality of output matters more than ecosystem breadth. Most operators who try both report Claude reads more like a person and hallucinates less.'
    }
  },
  {
    slug: 'marketo-vs-hubspot', a: 'Marketo Engage', b: 'HubSpot',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'Adobe\'s enterprise marketing automation platform versus HubSpot\'s all-in-one hub. Marketo is what enterprise marketing ops teams standardize on; HubSpot is what growing marketing teams pick when they want less complexity and faster time-to-value.',
    left: { name: 'Marketo Engage', url: 'https://business.adobe.com/products/marketo/adobe-marketo.html', pricingStart: '$1,500+/mo (Growth) → $3,200+/mo (Select), contract-only pricing', builtFor: 'Enterprise B2B marketing ops, complex lead-scoring, ABM at scale', deployWeeks: '10–24+', adminBurden: 'Very high — dedicated Marketo admin or ops team required', signature: 'Deep enterprise workflows, Adobe Experience Cloud integration' },
    right: { name: 'HubSpot', url: 'https://hubspot.com', pricingStart: '$0 free → $50/seat Starter → $890/mo Professional → $3,600/mo Enterprise', builtFor: 'SMB → mid-market marketing, all-in-one CRM + marketing + service', deployWeeks: '2–6', adminBurden: 'Low', signature: 'Opinionated all-in-one hub, marketer-friendly, unified with CRM' },
    dimensions: [
      ['Complexity ceiling', 'Very high — supports genuinely enterprise workflows and lead scoring', 'Ceiling exists — hits limits on cross-object custom logic'],
      ['Time to launch first campaign', '2–3 months with implementation partner', '1–2 weeks unassisted'],
      ['Required team', 'Dedicated Marketo admin(s) + ops team', 'Marketing manager can run day-to-day'],
      ['Integration with CRM', 'Salesforce-native; standalone CRM optional', 'Native CRM built in — single source of truth'],
      ['Adobe stack integration', 'Deep — Analytics, Target, AEM all connect natively', 'Add-ons and connectors, but not native to Adobe stack'],
      ['Reporting', 'Powerful but complex; Bizible attribution add-on strong', 'Solid OOB reports; deeper analysis needs custom builds'],
      ['Total cost year 1', 'Typically $80K–$250K+ (license + implementation + admin)', '$20K–$120K depending on hub mix']
    ],
    verdict: {
      pickA: 'You are enterprise B2B, running complex account-based programs, with a dedicated marketing ops function. Marketo\'s ceiling is genuinely higher — and your team is set up to use it.',
      pickB: 'You are SMB or mid-market, marketing-led, and want unified CRM + marketing without hiring a Marketo admin. HubSpot ships you faster and costs a fraction.'
    }
  },
  {
    slug: 'google-ads-vs-meta-ads', a: 'Google Ads', b: 'Meta Ads',
    pillar: 'Paid Advertising', pillarSlug: 'paid-advertising',
    intro: 'The two dominant paid-advertising surfaces on the open internet. Both are essential for most brands, both require entirely different discipline. If you\'re only choosing one, the choice is between intent and interruption — and the answer depends on whether your customer knows they need you yet.',
    left: { name: 'Google Ads', url: 'https://ads.google.com', pricingStart: 'Self-serve, no minimum spend (practical entry ~$500-$5K/mo)', builtFor: 'Intent-driven demand capture — search, YouTube, Display, Shopping', deployWeeks: '1–2', adminBurden: 'Medium (Search) → high (Performance Max)', signature: 'Search intent — captures active demand at moment of interest' },
    right: { name: 'Meta Ads', url: 'https://business.facebook.com', pricingStart: 'Self-serve, no minimum spend (practical entry ~$1K-$10K/mo)', builtFor: 'Demand generation, DTC ecommerce, interest/lookalike audience marketing', deployWeeks: '1–2', adminBurden: 'Medium — creative velocity matters more than platform mastery', signature: 'Massive interest signal — reaches people not yet searching' },
    dimensions: [
      ['Buying intent', 'High — user actively typed the query', 'Low → high — depends on placement and audience'],
      ['Best for', 'Bottom-of-funnel demand capture, high-intent categories', 'Top and middle funnel, brand + demand generation, DTC'],
      ['Attribution difficulty', 'Moderate — last-click still overcredits Google', 'Hard — iOS 14+ broke deterministic attribution; MMM is now standard'],
      ['Creative demand', 'Ad copy + assets; less creative-refresh pressure', 'Very high — creative fatigue is the #1 killer; needs weekly refresh'],
      ['Reporting fidelity', 'High — Google Ads reports are the industry standard', 'Reduced post-iOS 14; probabilistic modeling'],
      ['Learning phase pain', 'Moderate — Google Smart Bidding needs conversion volume', 'Significant — Advantage+ campaigns need 50+ conversions to stabilize'],
      ['B2B fit', 'Very strong — search intent maps to B2B research behavior', 'Weaker but improving — LinkedIn is often better for B2B']
    ],
    verdict: {
      pickA: 'Your customer knows they need you and is searching (services, B2B, high-intent purchases, replacement/renewal). Google captures demand that already exists — it\'s hard to lose money badly with Search.',
      pickB: 'Your customer doesn\'t yet know they need you. Meta creates demand — for DTC brands, new product categories, or lifestyle/consideration purchases, this is where growth happens.'
    }
  },
  {
    slug: 'segment-vs-rudderstack', a: 'Segment', b: 'RudderStack',
    pillar: 'Analytics', pillarSlug: 'analytics-attribution',
    intro: 'Two Customer Data Platforms (CDPs) built on the same core promise: instrument once, pipe events to every downstream tool. Segment invented the category and got acquired by Twilio; RudderStack built the open-source, warehouse-first alternative for teams who want data sovereignty.',
    left: { name: 'Segment', url: 'https://segment.com', pricingStart: '$0 free (1K visitors) → $120+/mo Team → contract Business', builtFor: 'General-purpose event routing, marketing + product teams', deployWeeks: '2–4', adminBurden: 'Medium', signature: 'Category creator, deepest integration library, mature ecosystem' },
    right: { name: 'RudderStack', url: 'https://rudderstack.com', pricingStart: '$0 open-source (self-hosted) → $500+/mo cloud → contract Enterprise', builtFor: 'Warehouse-first data teams, orgs valuing data sovereignty', deployWeeks: '2–6', adminBurden: 'Medium (cloud) → high (self-hosted)', signature: 'Warehouse-native, open-source core, no data lock-in' },
    dimensions: [
      ['Warehouse-first architecture', 'Supports — but wasn\'t built warehouse-first', 'Native — every event lands in the warehouse first, then routes'],
      ['Data sovereignty', 'Data flows through Segment infrastructure', 'Self-host option keeps events entirely in your environment'],
      ['Integration count', '400+ destinations — the deepest catalog', '200+ destinations — narrower but growing'],
      ['Pricing model', 'MTU-based (monthly tracked users)', 'Event-based (much cheaper at high volume)'],
      ['Enterprise features', 'Personas (CDP), Journeys, Protocols', 'Transformations, Profiles, Data Catalog'],
      ['Open source', 'No', 'Yes — SDK and core routing engine']
    ],
    verdict: {
      pickA: 'You want the safest, most-integrated CDP and don\'t need to self-host or care about warehouse-first architecture. Segment\'s maturity and integration depth are real advantages.',
      pickB: 'Your data team is warehouse-first, you want data to hit your warehouse before anywhere else, or self-hosting matters for compliance or cost. RudderStack is cheaper at scale and gives you sovereignty Segment can\'t match.'
    }
  },
  {
    slug: 'linkedin-ads-vs-meta-ads', a: 'LinkedIn Ads', b: 'Meta Ads',
    pillar: 'Paid Advertising', pillarSlug: 'paid-advertising',
    intro: 'For B2B advertisers, this is the eternal question. LinkedIn charges 5-10x more per click but reaches decision-makers with job-title precision Meta can\'t match. Meta is cheaper but reaches the same people off-hours in the wrong context.',
    left: { name: 'LinkedIn Campaign Manager', url: 'https://business.linkedin.com/marketing-solutions', pricingStart: 'Practical entry ~$3K-$10K/mo (CPCs $8-$15+ typical)', builtFor: 'B2B — enterprise ABM, decision-maker targeting, professional context', deployWeeks: '1–2', adminBurden: 'Medium — audience targeting is the specialization', signature: 'Job title, company, seniority targeting — unmatched B2B precision' },
    right: { name: 'Meta Ads', url: 'https://business.facebook.com', pricingStart: 'Practical entry ~$1K-$10K/mo (CPCs $0.50-$3 typical for B2B)', builtFor: 'B2C default; B2B with lookalike audiences from CRM data', deployWeeks: '1–2', adminBurden: 'Medium', signature: 'Lower cost, higher volume, weaker professional context' },
    dimensions: [
      ['Audience targeting for B2B', 'Class-leading — title, company, seniority, industry, skills', 'Interest and lookalike — approximate, not deterministic'],
      ['CPC / CPM cost', 'CPCs $8-$15+ typical for B2B roles', 'CPCs $0.50-$3 typical; CPMs 5-10x cheaper'],
      ['Context / user mindset', 'Professional — users are in "work" mode', 'Personal — users are relaxing, scrolling'],
      ['Creative demand', 'Lower — thought-leadership content, testimonials', 'High — creative fatigue faster'],
      ['Lead form quality', 'Lead Gen Forms auto-fill with LinkedIn profile data — high quality', 'Lead Ads auto-fill with Meta profile data — quality varies'],
      ['Attribution', 'Cleaner — most B2B buyers use LinkedIn on desktop', 'Post-iOS 14 attribution challenges']
    ],
    verdict: {
      pickA: 'You sell to enterprise buyers, ABM is your primary motion, and CAC of $500-$5K+ per lead is acceptable because deal sizes justify it. LinkedIn\'s targeting precision is worth the cost.',
      pickB: 'You are running B2B at scale with CRM-based lookalikes, your deal size doesn\'t support $500+ CACs, or you\'re doing brand awareness. Meta reaches the same people at a fraction of the cost — with less context.'
    }
  },
  {
    slug: 'activecampaign-vs-hubspot', a: 'ActiveCampaign', b: 'HubSpot',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'Both position as SMB-friendly marketing automation, but they solve different problems. ActiveCampaign is email-first with the cleanest automation builder in the market; HubSpot is all-in-one CRM + marketing + service. Different center of gravity, different price point.',
    left: { name: 'ActiveCampaign', url: 'https://activecampaign.com', pricingStart: '$15/mo Starter → $79+/mo Plus → $174+/mo Pro', builtFor: 'Email-first marketers, coaches, DTC, small business automation', deployWeeks: '1–2', adminBurden: 'Low', signature: 'Cleanest automation builder in the market at SMB pricing' },
    right: { name: 'HubSpot', url: 'https://hubspot.com', pricingStart: '$0 free → $50/seat Starter → $890/mo Professional', builtFor: 'SMB → mid-market wanting unified CRM + marketing + service', deployWeeks: '2–6', adminBurden: 'Low', signature: 'All-in-one hub with native CRM' },
    dimensions: [
      ['Automation builder UX', 'Widely considered the best in the market — visual, powerful, intuitive', 'Solid but less flexible than ActiveCampaign\'s'],
      ['Email deliverability', 'Class-leading', 'Very strong'],
      ['CRM depth', 'Basic sales CRM included', 'Full CRM with sales + service + marketing hubs'],
      ['SMS + messaging', 'SMS available; simpler flows', 'SMS via add-ons; more integrations'],
      ['Reporting', 'Solid — improved recently', 'More comprehensive across CRM + marketing'],
      ['Pricing at 10K contacts', '~$179/mo (Pro)', '~$800+/mo (Professional)'],
      ['Ecosystem', 'Solid — 900+ integrations', 'Vast — thousands of integrations + Marketplace']
    ],
    verdict: {
      pickA: 'You are email-first, run under 25K contacts, and want the best-in-class automation builder without paying for CRM you don\'t need. ActiveCampaign is 3-5x cheaper than HubSpot at equivalent list sizes.',
      pickB: 'You need unified CRM + marketing + service in one system, your sales team lives in the CRM, and you\'ll actually use the multi-hub setup. HubSpot pays for itself when you consolidate 3 tools into 1.'
    }
  },
  {
    slug: 'notion-vs-airtable', a: 'Notion', b: 'Airtable',
    pillar: 'Marketing Automation', pillarSlug: 'marketing-automation',
    intro: 'Two flexible-database tools every marketing ops team eventually picks between. Notion is documents-with-databases; Airtable is databases-with-documents. Same problem, opposite starting points.',
    left: { name: 'Notion', url: 'https://notion.so', pricingStart: '$0 free → $10/seat Plus → $18/seat Business → $25/seat Enterprise', builtFor: 'Knowledge management, docs, wikis, lightweight project management', deployWeeks: '<1', adminBurden: 'Low', signature: 'Documents with embedded databases; knowledge-management first' },
    right: { name: 'Airtable', url: 'https://airtable.com', pricingStart: '$0 free → $20/seat Team → $45/seat Business → contract Enterprise', builtFor: 'Content calendars, campaign trackers, structured operational data', deployWeeks: '<1', adminBurden: 'Low–medium', signature: 'Spreadsheet-database hybrid; interfaces + automations layered on' },
    dimensions: [
      ['Best-fit use case', 'Wiki, docs, meeting notes, project pages with light databases', 'Structured data — content calendars, campaign trackers, CRM-lite'],
      ['Database power', 'Basic — filters, views, relations exist but limited', 'Deep — formulas, rollups, lookups, junctions'],
      ['Content collaboration', 'Class-leading — rich text, embeds, comments everywhere', 'Limited — record-level notes; not designed for long-form'],
      ['Automations', 'Basic (recently added) — improving', 'Mature — trigger + action automations, run history'],
      ['Interfaces / apps', 'Sites feature exists; interface builder simpler', 'Interface Designer builds full internal apps'],
      ['AI features', 'Notion AI built-in ($8-10/seat add-on)', 'Airtable AI in Team+ plans'],
      ['Pricing at 10 seats', '~$100/mo', '~$200-$450/mo']
    ],
    verdict: {
      pickA: 'You need a wiki, team knowledge base, docs, or meeting-notes hub. Notion\'s document-first design makes long-form collaboration natural in a way Airtable can\'t match.',
      pickB: 'You need structured operational data — a content calendar, campaign tracker, editorial pipeline, or lightweight CRM. Airtable\'s database power and interface builder actually deliver working ops systems.'
    }
  },
  {
    slug: 'perplexity-vs-chatgpt', a: 'Perplexity', b: 'ChatGPT',
    pillar: 'AI Marketing', pillarSlug: 'ai-marketing',
    intro: 'Two AI-first search tools competing for the "answer engine" position. Perplexity built research-first from day one; ChatGPT added live web browsing later. If you\'re replacing Google-then-read-ten-pages workflows, this is the decision.',
    left: { name: 'Perplexity', url: 'https://perplexity.ai', pricingStart: '$0 free → $20/mo Pro → $200/mo Max → $40/seat Enterprise', builtFor: 'Real-time research, citation-heavy workflows, source-verified answers', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Research-first: every answer cites sources, live web by default' },
    right: { name: 'ChatGPT', url: 'https://chatgpt.com', pricingStart: '$0 free → $20/mo Plus → $200/mo Pro → $30/seat Team', builtFor: 'General-purpose LLM with browsing when needed', deployWeeks: '<1', adminBurden: 'Very low', signature: 'Broadest ecosystem — writing, code, images, voice, browsing' },
    dimensions: [
      ['Live web / real-time data', 'Default behavior — every query hits the live web with sources', 'Available (Search mode); not the default'],
      ['Source citations', 'Class-leading — every claim linked, easy to verify', 'Basic when browsing; less prominent'],
      ['Long-form writing', 'Adequate but not the focus', 'Class-leading generalist writing'],
      ['Coding', 'Basic — not the use case', 'Excellent'],
      ['Image generation', 'Available via integrations', 'Native (DALL-E, gpt-image)'],
      ['Multi-turn conversation', 'Good but research-first framing', 'Class-leading conversational depth'],
      ['Ecosystem (GPTs, plugins)', 'Focused on research', 'Vast — GPTs marketplace, Custom Instructions']
    ],
    verdict: {
      pickA: 'Your primary use case is research — competitive analysis, journalism, due diligence, market research, fact-checking. Perplexity\'s citation-first design saves hours of "did the LLM make this up" checking.',
      pickB: 'Your use is broad — writing, coding, brainstorming, image generation. Add Perplexity for research specifically; use ChatGPT as the daily driver for everything else.'
    }
  }
];

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
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join('\n')}
<style>
  :root{--porcelain:#FAF9F6;--stone:#E7E3DA;--stone-lt:#F2F0EA;--cobalt:#1B4FD8;--oxblood:#6E1423;--ink:#0E1B33;--chrome:#686D75;--chrome-dk:#85898F;--body:#3B4557;--serif:'Newsreader',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace}
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--sans);background:var(--porcelain);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:820px;margin:0 auto;padding:0 24px}a{color:var(--cobalt)}
  .topbar{border-bottom:1px solid var(--stone)}.topbar::before{content:'';display:block;height:2px;background:linear-gradient(90deg,var(--cobalt) 0 62%,var(--oxblood) 62% 84%,var(--ink) 84% 100%)}
  .topbar-in{display:flex;align-items:center;justify-content:space-between;height:56px}
  .wordmark{font-family:var(--serif);font-weight:700;font-size:20px;text-decoration:none;color:var(--ink);display:flex;align-items:baseline;gap:10px}
  .wordmark small{font-family:var(--mono);font-weight:600;font-size:8.5px;letter-spacing:.18em;color:var(--chrome)}
  .back{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--cobalt);text-decoration:none}
  .kicker{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);padding:34px 0 0;text-transform:uppercase}
  h1{font-family:var(--serif);font-weight:600;font-size:clamp(28px,4.5vw,40px);letter-spacing:-.02em;line-height:1.1;padding:10px 0 6px}
  .dek{font-family:var(--serif);font-style:italic;font-size:17px;line-height:1.55;color:var(--body);padding:8px 0 4px;max-width:680px}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .fact{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:22px 0;border:1px solid var(--stone);border-radius:10px;background:#fff;overflow:hidden}
  .fact-side{padding:20px 22px;border-right:1px solid var(--stone)}
  .fact-side:last-child{border-right:none}
  .fact-side h3{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);text-transform:uppercase;margin-bottom:8px}
  .fact-side .name{font-family:var(--serif);font-size:22px;font-weight:600;color:var(--ink);margin-bottom:12px}
  .fact-side dl{font-size:13px}
  .fact-side dt{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.12em;color:var(--chrome);margin-top:10px}
  .fact-side dd{font-size:13px;color:var(--body);line-height:1.5}
  .fact-side .url{margin-top:14px}
  .fact-side .url a{font-family:var(--mono);font-size:11px;color:var(--cobalt);text-decoration:none}
  table{width:100%;border-collapse:collapse;margin:16px 0;background:#fff;border:1px solid var(--stone);border-radius:8px;overflow:hidden}
  th{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;color:var(--chrome);text-transform:uppercase;text-align:left;padding:12px 14px;border-bottom:1px solid var(--stone);background:var(--stone-lt)}
  th:first-child{width:26%}
  td{padding:12px 14px;font-size:13.5px;line-height:1.55;color:var(--body);border-bottom:1px solid var(--stone-lt);vertical-align:top}
  tr:last-child td{border-bottom:none}
  td:first-child{font-family:var(--mono);font-size:11px;color:var(--ink);font-weight:600;letter-spacing:.02em}
  .verdict{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:20px 24px;margin:20px 0}
  .verdict h3{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);text-transform:uppercase;margin-bottom:8px}
  .verdict p{margin-bottom:10px;font-size:14px}
  .verdict p.pick{border-left:3px solid var(--cobalt);padding-left:12px;margin-bottom:14px}
  .verdict p.pick:last-child{margin-bottom:0}
  .verdict p.pick b{display:block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.14em;color:var(--ink);margin-bottom:4px}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
  footer{border-top:1px solid var(--stone);margin-top:50px;padding:22px 0 40px}
  footer .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:820px}
  footer span,footer a{font-family:var(--mono);font-size:9px;letter-spacing:.1em;color:var(--chrome);text-decoration:none}
  footer a:hover{color:var(--ink)}
  @media (max-width:640px){.fact{grid-template-columns:1fr}.fact-side{border-right:none;border-bottom:1px solid var(--stone)}.fact-side:last-child{border-bottom:none}th:first-child{width:38%}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}
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

mkdirSync(join(ROOT, 'compare'), { recursive: true });

for (const c of COMPARISONS) {
  const canonical = `${SITE}/compare/${c.slug}.html`;
  const title = `${c.a} vs ${c.b}: Which to Pick in 2026 — ${BRAND}`;
  const metaDesc = `${c.a} vs ${c.b} for ${c.pillar.toLowerCase()}. Side-by-side on pricing, capabilities, and when to pick each — from ${BRAND}, the US growth-services vendor index.`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' },
    { '@context':'https://schema.org', '@type':'Article', headline: `${c.a} vs ${c.b}: Which to Pick in 2026`, url: canonical, datePublished: '2026-08-04', dateModified: '2026-08-04', author: { '@type':'Organization', name: `${BRAND} Editorial Team`, url: `${SITE}/about.html` }, publisher: { '@type':'Organization', name: BRAND, url: `${SITE}/` }, about: [{'@type':'SoftwareApplication', name: c.a, url: c.left.url}, {'@type':'SoftwareApplication', name: c.b, url: c.right.url}], mainEntityOfPage: canonical },
    { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: [
      { '@type':'ListItem', position:1, name: BRAND, item: `${SITE}/` },
      { '@type':'ListItem', position:2, name: 'Comparisons', item: `${SITE}/compare/` },
      { '@type':'ListItem', position:3, name: `${c.a} vs ${c.b}` }
    ]}
  ];
  const body = `
<div class="kicker">Comparison · ${esc(c.pillar)}</div>
<h1>${esc(c.a)} vs ${esc(c.b)}: which to pick in 2026</h1>
<p class="dek">${esc(c.intro)}</p>

<div class="fact">
  <div class="fact-side">
    <h2>${esc(c.a)}</h2>
    <div class="name">${esc(c.left.name)}</div>
    <dl>
      <dt>Pricing entry</dt><dd>${esc(c.left.pricingStart)}</dd>
      <dt>Built for</dt><dd>${esc(c.left.builtFor)}</dd>
      <dt>Time to deploy</dt><dd>${esc(c.left.deployWeeks)} weeks</dd>
      <dt>Admin burden</dt><dd>${esc(c.left.adminBurden)}</dd>
      <dt>Signature strength</dt><dd>${esc(c.left.signature)}</dd>
    </dl>
    <div class="url"><a href="${esc(c.left.url)}" rel="nofollow noopener" target="_blank">${esc(c.left.url.replace(/^https?:\/\//, ''))} →</a></div>
  </div>
  <div class="fact-side">
    <h2>${esc(c.b)}</h2>
    <div class="name">${esc(c.right.name)}</div>
    <dl>
      <dt>Pricing entry</dt><dd>${esc(c.right.pricingStart)}</dd>
      <dt>Built for</dt><dd>${esc(c.right.builtFor)}</dd>
      <dt>Time to deploy</dt><dd>${esc(c.right.deployWeeks)} weeks</dd>
      <dt>Admin burden</dt><dd>${esc(c.right.adminBurden)}</dd>
      <dt>Signature strength</dt><dd>${esc(c.right.signature)}</dd>
    </dl>
    <div class="url"><a href="${esc(c.right.url)}" rel="nofollow noopener" target="_blank">${esc(c.right.url.replace(/^https?:\/\//, ''))} →</a></div>
  </div>
</div>

<h2>How they compare</h2>
<table>
  <thead><tr><th>Dimension</th><th>${esc(c.a)}</th><th>${esc(c.b)}</th></tr></thead>
  <tbody>
${c.dimensions.map(([dim, l, r]) => `    <tr><td>${esc(dim)}</td><td>${esc(l)}</td><td>${esc(r)}</td></tr>`).join('\n')}
  </tbody>
</table>

<h2>When to pick each</h2>
<div class="verdict">
  <p class="pick"><b>PICK ${esc(c.a.toUpperCase())}</b>${esc(c.verdict.pickA)}</p>
  <p class="pick"><b>PICK ${esc(c.b.toUpperCase())}</b>${esc(c.verdict.pickB)}</p>
</div>

<h2>Why this comparison matters</h2>
<p>Both ${esc(c.a)} and ${esc(c.b)} show up on nearly every ${esc(c.pillar.toLowerCase())} shortlist in 2026, which is why the "vs" query gets asked constantly and answered badly. Most comparison content is written by affiliates optimizing for the winner they're paid to recommend. ${BRAND} makes no commission on either — this is a directory-editorial verdict, grounded in what the software actually does and what the buying decision costs to reverse.</p>

<div class="rel"><h3>KEEP EXPLORING</h3>
<a href="../pillars/${pillar(c.pillarSlug).slug}.html">The full ${esc(pillar(c.pillarSlug).name)} pillar</a>
${[[c.slug.split('-vs-')[0], c.a], [c.slug.split('-vs-')[1], c.b]].map(([s, nm]) => {
  // Four tools named in comparison copy have no entity page. A link to one is a 404, so the
  // row renders as plain text until the page exists — see ENTITY_MISSING in slugs.mjs.
  const t = entity(s);
  return t ? `<a href="../entities/${t}.html">Standalone entity: ${esc(nm)}</a>` : '';
}).filter(Boolean).join('\n')}
<a href="./">Other head-to-heads</a>
</div>`;
  writeFileSync(join(ROOT, 'compare', `${c.slug}.html`), shell({ title, metaDesc, canonical, ld, bodyHTML: body }));
}

// Comparisons index
const indexLD = [
  { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai' },
  { '@context':'https://schema.org', '@type':'CollectionPage', name:`Growth Software Comparisons — ${BRAND}`, url:`${SITE}/compare/`,
    mainEntity:{'@type':'ItemList', itemListElement: COMPARISONS.map((c, i) => ({'@type':'ListItem', position: i+1, url:`${SITE}/compare/${c.slug}.html`, name:`${c.a} vs ${c.b}`}))} }
];
writeFileSync(join(ROOT, 'compare', 'index.html'), shell({
  title: `Growth Software Head-to-Heads — ${BRAND}`,
  metaDesc: `${COMPARISONS.length} head-to-head comparisons of the growth software platforms most operators shortlist in 2026. Written editorially, not affiliate-driven.`,
  canonical: `${SITE}/compare/`,
  ld: indexLD,
  bodyHTML: `
<div class="kicker">Reference · Comparisons</div>
<h1>Growth software head-to-heads</h1>
<p class="dek">${COMPARISONS.length} of the most-searched "X vs Y" decisions in growth software, answered editorially. No affiliate recommendations — just what each tool actually does, what it costs, and when to pick each.</p>
<table>
<thead><tr><th>Comparison</th><th>Pillar</th></tr></thead>
<tbody>
${COMPARISONS.map(c => `<tr><td><a href="${c.slug}.html" style="color:var(--ink);text-decoration:none;font-weight:600">${esc(c.a)} vs ${esc(c.b)}</a></td><td>${esc(c.pillar)}</td></tr>`).join('\n')}
</tbody>
</table>
<div class="rel"><h2>ALSO</h2><a href="../entities/">Individual entity pages</a><a href="../pillars/">Category pillars</a></div>`
}));

console.log(`compare pages: ${COMPARISONS.length} + 1 index`);
