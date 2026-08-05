// Generates entity pages under entities/{slug}.html — mini-Wikipedia pages for the platforms
// that show up repeatedly in growth-vendor conversations. Each: SoftwareApplication + FAQPage
// + BreadcrumbList schema, plus internal links to related pillars/hubs/entities.
// Run: node build-entities.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hitthewall.net';
const BRAND = 'The Wall';
const TODAY = '2026-08-04';

const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: BRAND, url: `${SITE}/`, email: 'support@misspepper.ai',
  description: 'An operations atlas of US-based companies that solve sales, marketing, SEO, thought leadership, creative, automation, and demand generation problems for established businesses.'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- entities
const ENTITIES = [
{
  slug: 'hubspot', name: 'HubSpot', vendor: 'HubSpot, Inc.', url: 'https://www.hubspot.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The dominant all-in-one CRM + marketing + sales platform for the mid-market.',
  what: `HubSpot is a US-based (Cambridge, MA) publicly traded software company (NYSE: HUBS) whose flagship product is a unified CRM plus modular "Hubs" for marketing, sales, service, content, operations, and commerce. Founded in 2006 by Brian Halligan and Dharmesh Shah, HubSpot pioneered the term "inbound marketing" and built the platform that most defines the mid-market martech category in 2026.
<br><br>
The platform is sold in per-Hub tiers (Starter, Professional, Enterprise) that can be mixed and matched. The CRM itself is free indefinitely; every other capability starts at a paid tier. All Hubs share the same underlying contact database, which is the platform's structural advantage over point solutions.`,
  who: `HubSpot's center of gravity is companies from $2M to $200M in revenue with marketing teams of 3 to 30 people — the segment where a single unified platform meaningfully outperforms a stitched-together stack of point solutions. Above that scale, most enterprises graduate to Salesforce + Marketo or a Salesforce Marketing Cloud stack. Below it, dedicated tools like Mailchimp or ActiveCampaign often deliver more per dollar.`,
  cost: `Marketing Hub Starter begins at ~$20/month for basic email and forms; Marketing Hub Professional at ~$890/month unlocks real automation, reporting, and lifecycle marketing; Enterprise at ~$3,600+/month adds advanced permissions, hierarchical teams, and API-tier limits. Sales Hub and Service Hub follow similar three-tier pricing. Onboarding fees ($3K–$6K for Professional, $6K+ for Enterprise) are standard.`,
  faq: [
    { q: 'What is HubSpot used for?', a: 'HubSpot is used for managing customer relationships (CRM), marketing automation (email, landing pages, forms, lifecycle nurture), sales pipeline management, customer service ticketing, and content/knowledge-base hosting — all inside one unified contact database.' },
    { q: 'How much does HubSpot cost?', a: 'The CRM is free forever. Marketing Hub starts at ~$20/month (Starter), ~$890/month (Professional), or ~$3,600+/month (Enterprise). Sales Hub and Service Hub follow similar tiers. Real mid-market deployments typically end up in the $1,000–$5,000/month range after picking two or three Hubs and adding onboarding.' },
    { q: 'Is HubSpot better than Salesforce?', a: 'For companies from $2M–$200M in revenue with marketing-led motions, HubSpot is usually the better choice — it\'s unified, faster to deploy, and cheaper to operate. For larger enterprises with sales-led motions, complex territories, and deep customization needs, Salesforce\'s ecosystem is more powerful. It\'s a company-shape question, not a product-quality question.' },
    { q: 'What are the best HubSpot alternatives?', a: 'For small businesses and email-first companies: ActiveCampaign, Mailchimp, Brevo. For sales-led B2B: Salesforce with Marketo or Pardot. For e-commerce: Klaviyo with Shopify. For all-in-one solo/SMB: Keap. For agency-managed clients: GoHighLevel.' },
    { q: 'Do I need HubSpot certifications to use it?', a: 'No. HubSpot Academy certifications are free and useful for hiring/CV signaling but aren\'t required to operate the platform. Most competent marketing operators self-teach the basics in a week or two.' }
  ],
  alternatives: ['salesforce', 'active-campaign', 'mailchimp']
},
{
  slug: 'salesforce', name: 'Salesforce', vendor: 'Salesforce, Inc.', url: 'https://www.salesforce.com/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The dominant enterprise CRM platform and the anchor of most large B2B revenue stacks.',
  what: `Salesforce is the largest CRM company in the world (NYSE: CRM), headquartered in San Francisco. Founded in 1999 by Marc Benioff and Parker Harris, it pioneered the SaaS delivery model for enterprise software. The platform is a set of "Clouds" — Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, Data Cloud, Experience Cloud — each of which is a substantial product in its own right, sharing a common data model and metadata framework.
<br><br>
Salesforce's power is also its complexity: it is the most customizable enterprise CRM by a wide margin, and configuring it well is its own specialty (the "Salesforce ecosystem" of consultancies, certified admins, and AppExchange vendors is one of the largest software services markets on earth).`,
  who: `Salesforce dominates the enterprise CRM market — mid-market to Fortune 500 companies with sales-led motions, complex sales processes, or regulatory/data requirements that need heavy customization. Under about $50M in revenue with a marketing-led motion, HubSpot usually delivers more value per dollar; above it, the Salesforce ecosystem's depth becomes the deciding factor.`,
  cost: `Sales Cloud starts at $25/user/month (Starter, limited features) and scales through Professional ($100/user/mo), Enterprise ($165/user/mo), and Unlimited ($330+/user/mo). Add-on Clouds price separately. Real enterprise Salesforce deployments — with Marketing Cloud, Commerce Cloud, or CPQ — commonly reach seven-figure annual contracts. Implementation costs frequently exceed license costs.`,
  faq: [
    { q: 'What is Salesforce used for?', a: 'Salesforce is used for customer relationship management (Sales Cloud), customer service (Service Cloud), marketing automation (Marketing Cloud), e-commerce (Commerce Cloud), and any application built on the underlying Salesforce Platform. Roughly 150,000 companies use it globally.' },
    { q: 'How much does Salesforce cost?', a: 'Sales Cloud starts at $25/user/month (Starter) and reaches $330+/user/month (Unlimited). Marketing Cloud, Service Cloud, and other Clouds price separately. Enterprise deployments frequently exceed $500K/year in licenses alone; implementation costs often match or exceed licenses.' },
    { q: 'What is the difference between Salesforce and HubSpot?', a: 'Salesforce is the dominant enterprise CRM, most powerful and most customizable, best for sales-led B2B at scale. HubSpot is the dominant mid-market unified platform, faster to deploy, cheaper to operate, best for marketing-led companies from $2M–$200M in revenue. They compete at the mid-market seam but serve different center-of-gravity segments.' },
    { q: 'Do I need a Salesforce consultant to implement it?', a: 'For anything past a basic Sales Cloud deployment, effectively yes. The Salesforce partner ecosystem (Slalom, Deloitte Digital, Accenture, and thousands of specialist boutiques) exists because configuring Salesforce well is a full-time skill. DIY-ing an enterprise Salesforce build is one of the most expensive mistakes in B2B software.' },
    { q: 'What is Marketing Cloud?', a: 'Marketing Cloud (formerly ExactTarget, acquired by Salesforce in 2013) is Salesforce\'s enterprise marketing automation platform. It handles email, mobile messaging, journey orchestration, and cross-channel campaigns at scale. It is a distinct product from Salesforce\'s more recent "Account Engagement" (formerly Pardot), which is the mid-market B2B marketing automation option.' }
  ],
  alternatives: ['hubspot', 'marketo', 'outreach-io']
},
{
  slug: 'marketo', name: 'Marketo Engage', vendor: 'Adobe Inc.', url: 'https://business.adobe.com/products/marketo/adobe-marketo.html',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'Adobe\'s enterprise B2B marketing automation platform, historically the standard for lead management at scale.',
  what: `Marketo Engage is Adobe's enterprise marketing automation platform, originally founded in 2006 by Phil Fernandez and Jon Miller and acquired by Adobe in 2018 (via Vista Equity Partners) for $4.75B. The platform pioneered the "lead management" category — programmatic lead scoring, nurture streams, revenue attribution — and remains one of the standards for enterprise B2B marketing operations.
<br><br>
Marketo Engage integrates deeply with Salesforce (its historical center of gravity) and with the broader Adobe Experience Cloud (Analytics, Target, Real-Time CDP). For companies already committed to the Adobe Experience Cloud stack, Marketo Engage is the default marketing-automation choice.`,
  who: `Marketo Engage's core market is B2B enterprises with 500+ employees, complex product portfolios, long sales cycles, and existing Salesforce deployments. Below that scale, HubSpot Marketing Hub Professional/Enterprise usually delivers a better cost/value trade. Marketo's operational complexity — while powerful — is significant, and successful deployments almost always involve dedicated Marketo administrators.`,
  cost: `Marketo Engage does not publish list pricing. Real deployments typically range from $30,000/year (small B2B) to $200,000+/year (large enterprise), depending on database size, users, and add-on modules. Multi-year enterprise contracts are the norm. Implementation via an Adobe Partner adds significantly to first-year cost.`,
  faq: [
    { q: 'What is Marketo used for?', a: 'Marketo Engage is used for enterprise B2B marketing automation: email marketing, lead scoring, nurture programs, landing pages, event management, and revenue attribution — typically in coordination with Salesforce and other Adobe Experience Cloud products.' },
    { q: 'How much does Marketo cost?', a: 'Adobe does not publish Marketo Engage list pricing. Deployments typically range from ~$30,000/year (smaller B2B) to $200,000+/year (large enterprise), plus implementation costs of $20,000–$100,000+ via Adobe partners.' },
    { q: 'What is the difference between Marketo and HubSpot?', a: 'Marketo Engage is enterprise-first — most powerful, most complex, deeply integrated with Salesforce and Adobe. HubSpot is mid-market-first — faster to deploy, unified with its own CRM, easier to operate. Companies past ~$100M in revenue with B2B motions often choose Marketo; companies under that threshold usually choose HubSpot.' },
    { q: 'Do I need a Marketo administrator?', a: 'For any meaningful deployment, yes. Marketo Engage rewards dedicated operational expertise. Most enterprise Marketo users have at least one dedicated Marketo administrator or contract with a Marketo-specialist consultancy.' },
    { q: 'Is Marketo still competitive vs HubSpot in 2026?', a: 'For enterprise B2B use cases with complex data models, Salesforce anchoring, and existing Adobe stack investments — yes. For mid-market and companies that value unified platform simplicity, HubSpot has been winning the greenfield deployments consistently for the last decade.' }
  ],
  alternatives: ['hubspot', 'active-campaign', 'salesforce']
},
{
  slug: 'active-campaign', name: 'ActiveCampaign', vendor: 'ActiveCampaign, LLC', url: 'https://www.activecampaign.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The strongest all-in-one marketing automation platform for small and mid-market businesses.',
  what: `ActiveCampaign is a Chicago-based, privately held marketing automation platform founded in 2003 by Jason VandeBoom. The product combines email marketing, marketing automation (visual workflows), a CRM, and site/messaging tools in a single suite priced substantially below HubSpot and Marketo.
<br><br>
The platform is best known for the depth and flexibility of its automation builder — genuinely enterprise-grade workflow capabilities at SMB pricing — and for the fact that it does most of what HubSpot Marketing Hub does at roughly one-fifth to one-tenth the price for equivalent contact volumes.`,
  who: `ActiveCampaign's sweet spot is SMB to mid-market companies (typically 1–50 employees, $500K–$25M in revenue) that need real marketing automation but don't need a full CRM ecosystem or enterprise reporting. It's the platform of choice for many independent consultants, small e-commerce operators, coaching businesses, and B2B SMBs.`,
  cost: `ActiveCampaign is priced by contact volume and tier. Plus starts at ~$49/month for 1,000 contacts; Professional at ~$149/month unlocks more advanced features; Enterprise (custom) adds priority support and enterprise features. Real deployments typically end up at $50–$500/month depending on contact volume — a fraction of HubSpot-equivalent pricing.`,
  faq: [
    { q: 'What is ActiveCampaign used for?', a: 'ActiveCampaign is used for email marketing, marketing automation, CRM/sales pipeline, and site/messaging communication — all inside one unified platform. It is particularly strong at automation workflows: complex if/then/branching logic driven by contact behavior.' },
    { q: 'How much does ActiveCampaign cost?', a: 'Starter plans begin at ~$49/month for 1,000 contacts; Plus at ~$79/month; Professional at ~$149/month; Enterprise custom. Pricing scales with contact volume. Real deployments commonly land at $50–$500/month.' },
    { q: 'Is ActiveCampaign better than HubSpot?', a: 'For SMBs that need real marketing automation but not a full-scale CRM ecosystem, ActiveCampaign is usually the better choice — meaningfully cheaper and comparably capable at automation. For companies that need a unified CRM + marketing + sales + service platform with an ecosystem of add-ons, HubSpot wins.' },
    { q: 'What are the best ActiveCampaign alternatives?', a: 'Mailchimp (simpler, email-first), HubSpot (unified with CRM, more expensive), Brevo (cheapest all-in-one with SMS built in), ConvertKit/Kit (creator-focused), Klaviyo (e-commerce-focused).' },
    { q: 'Does ActiveCampaign have a CRM?', a: 'Yes — a full sales CRM with pipeline management, deal tracking, and task automation is included in Plus and above. It\'s notably lighter than Salesforce or HubSpot Sales Hub but perfectly adequate for SMBs whose sales process is simple.' }
  ],
  alternatives: ['hubspot', 'mailchimp', 'klaviyo']
},
{
  slug: 'klaviyo', name: 'Klaviyo', vendor: 'Klaviyo, Inc.', url: 'https://www.klaviyo.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The dominant marketing automation platform for e-commerce, deeply integrated with Shopify.',
  what: `Klaviyo is a publicly traded (NYSE: KVYO) email and marketing automation platform headquartered in Boston, founded in 2012 by Andrew Bialecki and Ed Hallen. Purpose-built for e-commerce, Klaviyo integrates deeply with Shopify (its dominant channel), plus WooCommerce, BigCommerce, Magento, and Salesforce Commerce Cloud.
<br><br>
The platform's differentiation is data: Klaviyo pulls order history, product-view behavior, cart abandonment, and lifetime-value signals directly from the connected commerce platform and uses that data to power segmentation and automation. For e-commerce operators, no other marketing platform gives you as much commercially-relevant data out of the box.`,
  who: `Klaviyo's core market is Shopify-based e-commerce brands from ~$500K in annual revenue up to enterprise ($100M+). Above roughly $100M in DTC revenue, Klaviyo competes with Bloomreach and Salesforce Marketing Cloud; below ~$500K, Shopify's built-in email tools or Mailchimp cover the basics adequately.`,
  cost: `Klaviyo is priced by active-profile count. Free up to 250 contacts and 500 email sends/month. Paid Email starts at ~$20/month for 500 contacts and scales with volume — a 10K-contact brand typically pays ~$150/month, 100K contacts ~$1,700/month. SMS is a separate add-on priced per message.`,
  faq: [
    { q: 'What is Klaviyo used for?', a: 'Klaviyo is used for e-commerce marketing: email campaigns, SMS marketing, automated flows (welcome series, abandoned cart, post-purchase, win-back), segmentation based on purchase behavior, and product-recommendation email content. Deeply integrated with the connected commerce platform.' },
    { q: 'How much does Klaviyo cost?', a: 'Free up to 250 contacts. Paid Email starts at ~$20/month for 500 contacts and scales with volume — approximately $150/month at 10K contacts, $1,700/month at 100K contacts. SMS is priced separately, typically per message sent.' },
    { q: 'Is Klaviyo better than Mailchimp for e-commerce?', a: 'For any serious e-commerce operator on Shopify, WooCommerce, or BigCommerce — yes, decisively. Klaviyo\'s e-commerce integration surfaces order history, product-view data, and behavior signals that Mailchimp does not. For non-e-commerce businesses, Mailchimp is often the better choice.' },
    { q: 'Does Klaviyo work with Shopify?', a: 'Yes — Shopify is Klaviyo\'s most-supported integration by a wide margin. Real-time sync of orders, customers, products, and behavior. Most Shopify brands that hit ~$500K in revenue eventually migrate from Shopify Email to Klaviyo.' },
    { q: 'What are the best Klaviyo alternatives?', a: 'For e-commerce specifically: Omnisend (cheaper, Shopify-focused), Attentive (SMS-first), Bloomreach (enterprise), Postscript (SMS-only for Shopify). For non-e-commerce: Mailchimp, ActiveCampaign, HubSpot.' }
  ],
  alternatives: ['mailchimp', 'active-campaign', 'hubspot']
},
{
  slug: 'mailchimp', name: 'Mailchimp', vendor: 'Intuit Inc.', url: 'https://mailchimp.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The oldest and most widely-deployed email marketing platform, now owned by Intuit.',
  what: `Mailchimp is an email marketing and light-touch marketing automation platform founded in Atlanta in 2001, acquired by Intuit in 2021 for $12B. It is the most widely-recognized email marketing brand globally, used by tens of millions of businesses ranging from solo entrepreneurs to Fortune 500 marketing departments (typically for tactical email use, not primary CRM).
<br><br>
Under Intuit's ownership, Mailchimp has evolved from a pure email tool into a broader "all-in-one marketing platform" including landing pages, forms, basic CRM, appointment booking, and website building. The email product remains its center of gravity and its strongest capability.`,
  who: `Mailchimp's largest install base is small businesses, freelancers, creators, non-profits, and small teams inside larger companies using it for specific campaigns. It's the default choice for businesses whose primary marketing need is email and who want the fastest possible path from "nothing" to "sending". Above ~50K contacts or with sophisticated automation needs, most operators graduate to ActiveCampaign, Klaviyo, or HubSpot.`,
  cost: `Free up to 500 contacts and 1,000 sends/month. Essentials starts at ~$13/month, Standard at ~$20/month, Premium at ~$350/month. Real deployments typically land $20–$150/month. Additional add-ons for transactional email (Mandrill), SMS, and Intuit Assist AI features.`,
  faq: [
    { q: 'What is Mailchimp used for?', a: 'Primarily email marketing — newsletters, campaign broadcasts, and basic automation (welcome series, birthday emails). Also includes landing pages, forms, basic CRM, appointment booking, and website building at higher tiers.' },
    { q: 'How much does Mailchimp cost?', a: 'Free up to 500 contacts and 1,000 sends/month. Essentials starts at ~$13/month, Standard at ~$20/month, Premium at ~$350/month. Pricing scales with contact volume. Real SMB use commonly at $20–$150/month.' },
    { q: 'Is Mailchimp still worth using in 2026?', a: 'For simple email marketing at small scale, yes — the product is excellent, the brand is trusted, and the price is competitive. For sophisticated automation, deep e-commerce integration, or CRM-anchored marketing, purpose-built alternatives (Klaviyo, ActiveCampaign, HubSpot) usually deliver more.' },
    { q: 'What is the difference between Mailchimp and Klaviyo?', a: 'Mailchimp is a general-purpose email marketing tool. Klaviyo is a purpose-built e-commerce marketing platform. For Shopify or WooCommerce stores past ~$500K in revenue, Klaviyo is meaningfully better. For most non-e-commerce SMBs, Mailchimp is simpler and cheaper.' },
    { q: 'What are the best Mailchimp alternatives?', a: 'For email-first SMB: Brevo, MailerLite, ConvertKit/Kit. For automation-first: ActiveCampaign. For e-commerce: Klaviyo. For unified CRM + marketing: HubSpot. For enterprise: Marketo Engage or Salesforce Marketing Cloud.' }
  ],
  alternatives: ['active-campaign', 'klaviyo', 'hubspot']
},
{
  slug: 'google-ads', name: 'Google Ads', vendor: 'Google LLC', url: 'https://ads.google.com/',
  category: 'BusinessApplication', pillar: 'demand-gen',
  tagline: 'The world\'s dominant paid-search platform and the anchor of most US B2B and B2C paid-media stacks.',
  what: `Google Ads (formerly Google AdWords, rebranded in 2018) is Google's paid advertising platform, spanning Search Ads (the sponsored results at the top of Google Search), Display Ads (image and video ads across the Google Display Network of 2M+ sites), YouTube Ads, Shopping Ads (Google Shopping), and Performance Max (automated cross-channel campaigns).
<br><br>
By revenue, Google Ads is the largest advertising business in history — roughly $250B/year in Google's advertising revenue. For most US businesses, some portion of Google Ads is table stakes: even brand-defensive campaigns bidding on the company's own name typically return positive ROAS.`,
  who: `Google Ads is used by essentially every US business that markets online, from local plumbers running $500/month Local Service Ads campaigns to Fortune 500 companies running eight-figure monthly programs. Its accessibility is the point: the platform is free to use; you only pay for the media placement, priced by auction.`,
  cost: `Free to use. Media costs are auction-priced and vary dramatically by category: from $0.50/click for low-competition keywords to $50+/click for high-value legal, insurance, and financial-services keywords. Typical US SMB campaigns run $1,000–$10,000/month in media spend; enterprise campaigns scale to seven figures monthly. Agency management fees typically add 10–20% of media spend, often with a floor.`,
  faq: [
    { q: 'What is Google Ads used for?', a: 'Google Ads is used for paid search advertising (sponsored results on Google Search), display advertising (banner ads across websites), YouTube advertising, and shopping ads (product-listing ads on Google Shopping). Almost every business that markets online uses some portion of it.' },
    { q: 'How much does Google Ads cost?', a: 'The platform is free to use. Media costs are auction-priced: from ~$0.50/click for low-competition terms to $50+/click for high-value legal or financial-services terms. Typical US SMBs run $1,000–$10,000/month in media spend; enterprise budgets reach seven figures monthly.' },
    { q: 'Should I hire a Google Ads agency?', a: 'For accounts under ~$5,000/month in media spend running simple campaigns, DIY is often the right call — the account setup takes a day and ongoing management is a few hours a week. Above $5,000/month, or when campaigns involve complex negative keyword lists, product feeds, or attribution across long sales cycles, a specialist agency usually pays for itself.' },
    { q: 'What is Performance Max?', a: 'Performance Max is Google\'s AI-driven campaign type that runs a single unified campaign across Search, Display, YouTube, Shopping, Gmail, and Maps. Google\'s algorithms decide the mix. Powerful for straightforward direct-response goals; a black box for advertisers who need channel-level visibility.' },
    { q: 'What is the difference between Google Ads and Google Local Service Ads?', a: 'Google Ads is pay-per-click across the web. Google Local Service Ads (LSAs) is a separate product limited to specific service categories, priced per qualified lead instead of per click, requiring background/license verification, running above traditional Search Ads. Full LSA breakdown at hitthewall.net/hubs/local-service-ads.html.' }
  ],
  alternatives: ['meta-ads-manager', 'linkedin-campaign-manager', 'the-trade-desk']
},
{
  slug: 'meta-ads-manager', name: 'Meta Ads Manager', vendor: 'Meta Platforms, Inc.', url: 'https://www.facebook.com/business/tools/ads-manager',
  category: 'BusinessApplication', pillar: 'demand-gen',
  tagline: 'The primary interface for paid advertising on Facebook and Instagram — the second-largest ad platform in the world.',
  what: `Meta Ads Manager is the campaign management platform for paid advertising on Facebook, Instagram, and Meta's broader ad inventory (Messenger, Audience Network, WhatsApp ads in some markets). Meta Platforms (NASDAQ: META) is the second-largest digital-advertising company after Google, generating ~$135B/year in advertising revenue.
<br><br>
The platform supports campaign objectives from awareness through conversions, granular audience targeting based on interests, behaviors, and lookalikes, and — critically for many advertisers — the option to upload custom audiences from CRM data for retargeting or exclusion.`,
  who: `Meta Ads Manager is used by essentially every US consumer brand, most B2C service businesses, and increasingly by B2B brands targeting individual decision-makers rather than accounts. Facebook Ads remains a workhorse for local businesses, e-commerce, and lead generation; Instagram Ads dominate for visually-driven consumer brands.`,
  cost: `Platform is free. Media costs are auction-priced — typical Meta CPMs (cost per thousand impressions) range from $5 for broad consumer audiences to $50+ for narrow B2B targeting. Most SMB campaigns run $500–$5,000/month; brand budgets reach seven figures monthly. Meta ads shops typically manage on a percentage-of-spend or fixed-retainer basis.`,
  faq: [
    { q: 'What is Meta Ads Manager?', a: 'Meta Ads Manager is the platform advertisers use to create, manage, and optimize paid ads on Facebook, Instagram, Messenger, and Meta\'s Audience Network. It is Meta\'s primary self-serve advertising interface.' },
    { q: 'How much do Facebook and Instagram ads cost?', a: 'The platform is free; media costs are auction-priced. Typical CPMs range $5–$50 depending on audience specificity. SMB campaigns commonly run $500–$5,000/month; brand campaigns run seven figures monthly.' },
    { q: 'Should I run ads myself or hire a Meta ads agency?', a: 'Under ~$3,000/month in ad spend, the founder or an in-house marketer can usually manage the account competently after a couple of weeks of learning. Above $10,000/month, or for campaigns with complex creative production needs (video, UGC), specialist agencies usually deliver stronger ROAS. In between, judgment call.' },
    { q: 'What is the difference between Meta Ads and Facebook Ads?', a: 'Same thing, different framing. Meta Ads is the umbrella term for advertising across all Meta properties (Facebook, Instagram, Messenger, Audience Network). "Facebook Ads" is often used colloquially to mean any of it, though technically refers just to the Facebook placements.' },
    { q: 'What are Meta Custom Audiences?', a: 'Custom Audiences let advertisers upload lists of existing customers or leads (matched by email, phone, or advertising ID) to target directly, exclude, or use as the seed for a Lookalike Audience. One of the platform\'s most-valuable capabilities for advertisers with meaningful first-party data.' }
  ],
  alternatives: ['google-ads', 'linkedin-campaign-manager', 'the-trade-desk']
},
{
  slug: 'linkedin-campaign-manager', name: 'LinkedIn Campaign Manager', vendor: 'LinkedIn Corporation (Microsoft)', url: 'https://business.linkedin.com/marketing-solutions/ads',
  category: 'BusinessApplication', pillar: 'demand-gen',
  tagline: 'The primary paid-advertising platform for reaching B2B buying committees at work.',
  what: `LinkedIn Campaign Manager is the paid advertising platform for the LinkedIn professional network, owned by Microsoft (LinkedIn was acquired for $26.2B in 2016). The platform's differentiator is not the ad formats — it supports the standard sponsored content, message ads, and video ads — but the targeting: LinkedIn allows advertisers to target by job title, company, industry, seniority, function, skills, and (via Matched Audiences) named account lists.
<br><br>
For most B2B advertisers, LinkedIn is the highest-intent paid channel for reaching working professionals in their professional context. It is also the most expensive: CPMs and CPCs are 3–5× typical Meta rates.`,
  who: `LinkedIn Campaign Manager's core market is B2B companies selling to knowledge workers — SaaS, professional services, enterprise software, consulting, financial services, healthcare technology. B2C brands rarely use it. Companies whose ICP is defined by job title or company (as most B2B ICPs are) get outsized value; companies targeting broad consumer demographics get value elsewhere for less.`,
  cost: `Platform is free. Media costs are auction-priced but structurally high: typical LinkedIn CPMs range $30–$120; CPCs $8–$25. Minimum daily campaign budget is $10 but real B2B campaigns typically start at $2,000+/month to generate meaningful reach. ABM campaigns targeting narrow account lists commonly run $10,000–$50,000+/month.`,
  faq: [
    { q: 'What is LinkedIn Campaign Manager?', a: 'LinkedIn Campaign Manager is LinkedIn\'s self-serve advertising platform, used to create and manage paid ads targeting professionals by job title, company, industry, seniority, and other work-based attributes.' },
    { q: 'How much do LinkedIn ads cost?', a: 'CPMs typically range $30–$120 and CPCs $8–$25 — meaningfully higher than Meta or Google. Minimum daily budget is $10, but real B2B campaigns start at $2,000+/month for meaningful reach. ABM programs commonly run $10,000–$50,000+/month.' },
    { q: 'Should I run LinkedIn ads for B2B?', a: 'For most B2B companies targeting knowledge workers by role — yes, LinkedIn is usually the single highest-intent paid channel. The cost is higher than Meta or Google but the targeting precision often produces better cost-per-qualified-lead in real terms.' },
    { q: 'What is LinkedIn Matched Audiences?', a: 'Matched Audiences lets you upload account lists (target companies), contact lists (specific people by email), or website visitors for retargeting. The account-list feature is the foundation of most LinkedIn-powered ABM campaigns.' },
    { q: 'What are the best LinkedIn Ads alternatives for B2B?', a: 'Meta Ads targeting by interest and lookalike (cheaper CPMs, less precise B2B targeting), Google Ads on high-intent B2B keywords (best for capturing active buyers), programmatic B2B platforms (StackAdapt, Metadata.io, RollWorks) for account-based targeting outside LinkedIn.' }
  ],
  alternatives: ['meta-ads-manager', 'google-ads', 'the-trade-desk']
},
{
  slug: 'the-trade-desk', name: 'The Trade Desk', vendor: 'The Trade Desk, Inc.', url: 'https://www.thetradedesk.com/',
  category: 'BusinessApplication', pillar: 'demand-gen',
  tagline: 'The dominant independent demand-side platform (DSP) for programmatic advertising across the open web.',
  what: `The Trade Desk (NASDAQ: TTD) is the largest independent DSP in programmatic advertising, headquartered in Ventura, CA. Founded in 2009 by Jeff Green and Dave Pickles, TTD lets advertisers buy display, video, connected TV (CTV), audio, and native ad inventory across the open web through real-time bidding auctions — rather than through Google's or Meta's walled gardens.
<br><br>
The platform's differentiation is scale, sophistication, and independence — TTD does not own media, which lets it be a neutral advocate for the buy-side against publishers and against Google's dominance. Its Kokai AI layer (launched 2023) automates much of the campaign optimization that historically required senior programmatic traders.`,
  who: `The Trade Desk's core market is mid-market to enterprise advertisers with $50,000+/month in programmatic media spend. Below that scale, self-serve alternatives (StackAdapt, DV360) usually offer better economics; above it, TTD's scale and CTV inventory access become decisive.`,
  cost: `TTD does not publish list pricing; agencies and in-house teams access the platform through TTD's seat agreements with typical setup minimums of ~$25,000/month in media commitment. Above that, TTD takes 10–20% of media spend as a platform fee.`,
  faq: [
    { q: 'What is The Trade Desk?', a: 'The Trade Desk is a demand-side platform (DSP) — software advertisers use to buy programmatic ad inventory across the open web through real-time bidding auctions. Distinct from Google\'s DV360 and Meta\'s Ads Manager, TTD does not own media and buys inventory from thousands of publishers and exchanges.' },
    { q: 'How much does The Trade Desk cost?', a: 'The Trade Desk does not publish list pricing. Typical seat agreements require $25,000+/month in media commitment. TTD takes 10–20% of media spend as a platform fee. Real deployments commonly total $50K–$5M+ per month all-in.' },
    { q: 'What is the difference between The Trade Desk and Google Ads?', a: 'Google Ads focuses on Google\'s own properties (Search, YouTube, Display Network). The Trade Desk is an independent DSP that buys programmatic inventory across the open web — display, video, CTV, audio, DOOH — from thousands of publishers and exchanges. TTD does not own media; that\'s the point.' },
    { q: 'Is The Trade Desk right for a small business?', a: 'No. TTD\'s minimum commitments and complexity mean the platform is not economical below roughly $50,000/month in programmatic media spend. Small businesses are better served by StackAdapt (lower minimum), Meta and Google direct, or hiring a small-business-focused programmatic agency.' },
    { q: 'What is Connected TV (CTV) advertising on The Trade Desk?', a: 'CTV advertising is programmatic buying of ads on internet-connected TV inventory — streaming services, smart TVs, streaming devices. TTD has become one of the primary buying platforms for CTV inventory, and CTV is the fastest-growing programmatic channel of the last five years.' }
  ],
  alternatives: ['google-ads', 'meta-ads-manager', 'linkedin-campaign-manager']
},
{
  slug: 'ahrefs', name: 'Ahrefs', vendor: 'Ahrefs Pte. Ltd.', url: 'https://ahrefs.com/',
  category: 'BusinessApplication', pillar: 'seo',
  tagline: 'The most-used all-in-one SEO toolset for keyword research, backlink analysis, and content strategy.',
  what: `Ahrefs is a Singapore-headquartered, privately held SEO toolset founded in 2010 by Dmitry Gerasimenko. The product has grown from its origin as a backlink-analysis tool into a comprehensive SEO suite covering keyword research, competitor analysis, technical SEO auditing, rank tracking, and content optimization.
<br><br>
Ahrefs' competitive edge is data quality: the platform crawls the web independently and maintains one of the largest indexes of web pages, backlinks, and keyword metrics available. For SEO professionals and content marketers, Ahrefs is one of the two default tool choices (the other being Semrush).`,
  who: `Ahrefs' core market is SEO professionals, content marketing teams, and agencies. From solo consultants and in-house SEOs at SMBs through enterprise SEO teams at Fortune 500 companies. It is not a self-serve tool for non-technical marketers; the interface rewards SEO fluency.`,
  cost: `Lite starts at ~$129/month, Standard at ~$249/month, Advanced at ~$449/month, Enterprise at ~$14,990/year. Additional user seats and higher API volume price separately. Most agencies and mid-market SEO teams run Standard or Advanced tiers.`,
  faq: [
    { q: 'What is Ahrefs used for?', a: 'Ahrefs is used for SEO research and analysis: keyword research (search volume, difficulty, competition), backlink analysis (who\'s linking to whom), competitor research, site audits (technical SEO issues), rank tracking, and content gap analysis.' },
    { q: 'How much does Ahrefs cost?', a: 'Lite starts at ~$129/month; Standard ~$249/month; Advanced ~$449/month; Enterprise ~$14,990/year. Most agencies and in-house SEO teams run Standard or Advanced. Individual freelancers often start with Lite.' },
    { q: 'Ahrefs vs Semrush — which is better?', a: 'Both are excellent and highly competitive. Ahrefs is generally considered stronger on backlink data and easier to navigate; Semrush is generally stronger on paid-search and competitor advertising data and has more all-in-one marketing features. Most serious SEO teams have used both.' },
    { q: 'Is Ahrefs worth it for a small business?', a: 'For a small business doing meaningful in-house SEO — yes, the Lite plan\'s data is genuinely useful. For a small business whose SEO is one of many marketing priorities and where a specialist agency handles it, the agency likely already has Ahrefs and the client doesn\'t need their own subscription.' },
    { q: 'What are the best Ahrefs alternatives?', a: 'Semrush (closest all-around competitor), Moz (long-standing alternative, smaller data set), Screaming Frog (technical auditing specialist, one-time license), Ubersuggest (cheaper), Sistrix (strong in European markets).' }
  ],
  alternatives: ['semrush', 'google-analytics-4', 'segment']
},
{
  slug: 'semrush', name: 'Semrush', vendor: 'Semrush Holdings, Inc.', url: 'https://www.semrush.com/',
  category: 'BusinessApplication', pillar: 'seo',
  tagline: 'The other dominant all-in-one SEO and digital-marketing toolset, spanning SEO, PPC, content, and social.',
  what: `Semrush (NYSE: SEMR) is a publicly traded digital marketing SaaS company, headquartered in Boston with substantial engineering operations globally. Founded in 2008, Semrush has expanded from an SEO-focused tool into an all-in-one platform covering SEO research, PPC intelligence, content marketing, social media management, and competitive intelligence.
<br><br>
Compared to Ahrefs, Semrush is broader (more product surface area, more use cases beyond SEO) but its SEO-specific data is generally considered slightly less deep. For agencies serving clients across multiple digital-marketing disciplines, Semrush's breadth often justifies the choice.`,
  who: `Semrush's core market is digital-marketing agencies (particularly those serving SEO + PPC clients from the same seat), in-house marketing teams at mid-market and enterprise, and freelance SEO/PPC specialists. Its Agency plan tier is unusually well-developed for a horizontal marketing tool.`,
  cost: `Pro starts at ~$140/month, Guru at ~$250/month, Business at ~$500/month. Additional users and specialized add-ons (Local, Semrush.Trends, Semrush Enterprise) price separately.`,
  faq: [
    { q: 'What is Semrush used for?', a: 'Semrush is used for SEO research, paid-search research (competitor keyword and ad copy analysis), content marketing (topic research, content optimization), social media management, and site auditing. Broader than a pure SEO tool.' },
    { q: 'How much does Semrush cost?', a: 'Pro starts at ~$140/month, Guru at ~$250/month, Business at ~$500/month. Additional user seats and add-ons (Local SEO, Semrush.Trends, Enterprise) price separately.' },
    { q: 'Semrush vs Ahrefs — which should I choose?', a: 'For pure SEO with a focus on backlink analysis and content gap research, Ahrefs is often preferred. For agencies or in-house teams needing SEO + PPC + content + competitive intelligence in one tool, Semrush\'s breadth usually wins. Both offer free trials; most teams settle on one within a few weeks.' },
    { q: 'Is Semrush good for PPC as well as SEO?', a: 'Yes — Semrush\'s PPC intelligence (what keywords competitors bid on, what ad copy they run, estimated spend) is one of its strongest features and one place it clearly outperforms Ahrefs. For agencies running both SEO and paid search for clients, Semrush\'s dual-purpose data is a real advantage.' },
    { q: 'What are the best Semrush alternatives?', a: 'Ahrefs (deepest SEO-focused alternative), Moz Pro (long-standing SEO alternative), SpyFu (specialized PPC competitive intelligence), Similarweb (deeper competitive traffic data), SE Ranking (cheaper).' }
  ],
  alternatives: ['ahrefs', 'google-analytics-4', 'segment']
},
{
  slug: 'segment', name: 'Segment', vendor: 'Twilio Inc.', url: 'https://segment.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The most widely-adopted customer data platform (CDP), owned by Twilio.',
  what: `Segment is a customer data platform (CDP) that collects, unifies, and routes customer data from a company's applications and websites to hundreds of downstream tools — analytics, marketing automation, CRM, data warehouses. Founded in 2011 at Y Combinator, Segment was acquired by Twilio (NYSE: TWLO) in 2020 for $3.2B.
<br><br>
The platform's core value proposition is instrumentation-once-send-everywhere: a single set of tracking code deployed once collects customer events that can then be routed to Google Analytics, Mixpanel, HubSpot, Salesforce, Snowflake, and hundreds of other destinations without additional developer work.`,
  who: `Segment's core market is digital-first companies with real product-analytics or personalization needs — SaaS, e-commerce, media, and mobile-first businesses. Deployment complexity and pricing scale with event volume, which puts Segment out of reach for many SMBs but delivers substantial engineering-time savings at mid-market and enterprise scale.`,
  cost: `Segment offers a free tier up to 1,000 visitors/month. Team plans start at ~$120/month for meaningful volume. Business tier is custom-priced and typically starts at ~$25K/year, scaling into hundreds of thousands based on event volume and destinations.`,
  faq: [
    { q: 'What is Segment used for?', a: 'Segment is used to collect customer data (page views, events, user attributes) from web and mobile applications, unify it into a single customer profile, and route it to downstream tools — analytics, marketing automation, CRM, data warehouses, personalization engines — without additional engineering per destination.' },
    { q: 'How much does Segment cost?', a: 'Free up to 1,000 visitors/month. Team plans start at ~$120/month. Business tier (custom-priced) typically starts at ~$25,000/year and scales with event volume and destination count.' },
    { q: 'What is a Customer Data Platform (CDP)?', a: 'A CDP is software that collects customer data from every source (web, mobile, CRM, email, product, support), unifies it into a persistent customer profile, and makes that unified data available to downstream marketing, analytics, and personalization tools. Segment is the best-known CDP; RudderStack, mParticle, and Adobe Real-Time CDP are its primary competitors.' },
    { q: 'What are the best Segment alternatives?', a: 'RudderStack (open-source-leaning alternative, often chosen for cost or data-warehouse-native architecture), mParticle (enterprise CDP with strong mobile focus), Adobe Real-Time CDP (for Adobe stack customers), Hightouch and Census (reverse-ETL — CDP-adjacent, warehouse-first).' },
    { q: 'Do I need a CDP if I already have Google Analytics?', a: 'For most SMBs, no — GA4 plus a few purpose-built integrations covers the need. A CDP is worth its cost when a company has (a) meaningful first-party data across multiple applications, (b) real personalization or downstream-tool routing needs, and (c) an engineering cost of custom-integrating each new tool that exceeds the CDP\'s cost. Below that threshold, GA4 plus HubSpot or ActiveCampaign is usually enough.' }
  ],
  alternatives: ['google-analytics-4', 'hubspot', 'salesforce']
},
{
  slug: 'google-analytics-4', name: 'Google Analytics 4', vendor: 'Google LLC', url: 'https://analytics.google.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The default web and app analytics platform for the internet, replacing Universal Analytics as of 2023.',
  what: `Google Analytics 4 (GA4) is Google's current-generation web and mobile-app analytics platform. It replaced Universal Analytics (the prior version, deprecated in July 2023) with a fundamentally different data model: event-based instead of session/hit-based, unified across web and app, and designed around Google's post-cookie privacy stack.
<br><br>
GA4 is free at nearly every use scale and installed on tens of millions of websites globally. Its adoption is essentially universal for SMBs and mid-market; enterprises often pair it with Google Analytics 360 (~$150K/year) for higher data limits and unsampled reporting.`,
  who: `GA4's install base includes essentially every website with any commercial intent. Small businesses use the free tier as-is; larger organizations either extend GA4 with BigQuery exports (for advanced analysis in their data warehouse) or upgrade to the paid Google Analytics 360 tier.`,
  cost: `Free for the standard tier (with generous but real event-volume and reporting limits). Google Analytics 360 — the paid enterprise tier — starts around $150,000/year with substantially higher event limits, unsampled reports, and enterprise SLA.`,
  faq: [
    { q: 'What is Google Analytics 4?', a: 'Google Analytics 4 is Google\'s current web and mobile-app analytics platform. It uses an event-based data model to measure user behavior across websites and apps, and provides free reporting on traffic sources, user acquisition, engagement, retention, and conversions.' },
    { q: 'How much does Google Analytics 4 cost?', a: 'Free for the standard tier. Google Analytics 360, the paid enterprise version, starts around $150,000/year and offers substantially higher event limits, unsampled data, and enterprise SLAs. Most businesses run entirely on the free tier.' },
    { q: 'What is the difference between GA4 and Universal Analytics?', a: 'Universal Analytics (the prior version) used a session/hit-based data model. GA4 uses an event-based model where every user interaction is an event. GA4 is unified across web and mobile, better handles cookieless measurement, and integrates natively with Google Ads and BigQuery. Universal Analytics stopped processing new data in July 2023.' },
    { q: 'Is GA4 as good as Universal Analytics was?', a: 'For most standard reporting tasks, yes — better in some ways (unified web + app, better mobile support). For advanced e-commerce and custom reports, many analysts consider GA4 more complex and less immediately readable than Universal Analytics. The transition period is largely complete in 2026.' },
    { q: 'What are the best Google Analytics alternatives?', a: 'Plausible and Fathom (privacy-focused, lightweight, subscription-based), Matomo (open-source, self-hostable), Adobe Analytics (enterprise alternative), Amplitude and Mixpanel (product-analytics-focused, complement rather than replace GA4), Simple Analytics (privacy-first alternative for small sites).' }
  ],
  alternatives: ['segment', 'ahrefs', 'semrush']
},
{
  slug: 'outreach-io', name: 'Outreach.io', vendor: 'Outreach, Inc.', url: 'https://www.outreach.io/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The dominant sales-engagement platform for B2B sales development and outbound teams.',
  what: `Outreach is a privately-held sales-engagement platform headquartered in Seattle, founded in 2014 by Manny Medina, Andrew Kinzer, and Gordon Hempton. The platform sits between the CRM (typically Salesforce) and the sales rep's day-to-day workflow, handling multi-step outbound sequences across email, phone, LinkedIn, and SMS with tracking, analytics, and AI-assisted content generation.
<br><br>
Outreach is one of the two dominant products in the sales-engagement category alongside Salesloft, with a combined market share above 60% in US B2B sales-development teams.`,
  who: `Outreach's core market is B2B sales organizations with dedicated outbound sales-development representative (SDR) teams — companies from ~$10M ARR through enterprise. Below that scale, the ROI on Outreach\'s per-seat pricing is thinner and simpler tools (Apollo.io, Instantly.ai) often suffice.`,
  cost: `Outreach does not publish list pricing. Typical seat pricing runs $100–$150/user/month billed annually with meaningful minimums (usually 10+ seats). Real deployments commonly total $30,000–$500,000+/year depending on team size and add-on modules.`,
  faq: [
    { q: 'What is Outreach.io used for?', a: 'Outreach is used by B2B sales-development and account-executive teams to run multi-step outbound sequences (email + phone + LinkedIn + SMS), track prospect engagement, automate follow-up tasks, and roll up sales-activity data into CRM (typically Salesforce) for reporting.' },
    { q: 'How much does Outreach.io cost?', a: 'Outreach does not publish list pricing. Typical seat pricing runs $100–$150/user/month billed annually, usually with 10+ seat minimums. Real deployments commonly total $30,000–$500,000+/year depending on team size and modules.' },
    { q: 'Outreach vs Salesloft — which is better?', a: 'Both are excellent and highly competitive; the choice is usually driven by specific integrations, contract terms, or individual team preferences rather than a clear product-quality winner. Most large sales orgs have evaluated both; the ~55% market-share leader shifts periodically.' },
    { q: 'What are the best Outreach alternatives?', a: 'Salesloft (closest peer), Apollo.io (all-in-one sales intelligence + engagement, cheaper and better for SMBs), Instantly.ai (cold email at scale, cheaper), Salesforce Sales Engagement (formerly High Velocity Sales, for Salesforce-native teams), HubSpot Sales Hub Sequences (bundled option for HubSpot customers).' },
    { q: 'Do I need Outreach if I have Salesforce?', a: 'Salesforce alone does not handle multi-touch outbound sequencing well. Companies with active outbound sales-development motions almost always need a dedicated sales-engagement platform on top of Salesforce — either Outreach, Salesloft, or a similar tool. Salesforce Sales Engagement is Salesforce\'s own competing product but has historically lagged Outreach and Salesloft in the market.' }
  ],
  alternatives: ['salesforce', 'hubspot']
},
// -------------------- batch 2 (2026-08-04) --------------------
{
  slug: 'pipedrive', name: 'Pipedrive', vendor: 'Pipedrive OÜ', url: 'https://www.pipedrive.com/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The visual, pipeline-first CRM built for small and mid-market sales teams.',
  what: `Pipedrive is a sales-focused CRM headquartered in Tallinn, Estonia, founded in 2010. Its differentiator is the drag-and-drop deal pipeline UI — sales-first rather than the marketing-first model of HubSpot or the enterprise complexity of Salesforce. Owned by Vista Equity Partners since 2020.`,
  who: `Small and mid-market sales teams (typically 3–50 reps) who want a CRM that reps actually update — because updating it is one click, not a form. Not the right choice for marketing-led motions (HubSpot wins) or enterprise complexity (Salesforce wins).`,
  cost: `Essential ~$15/user/month, Advanced ~$29, Professional ~$59, Enterprise ~$99. Most SMB sales orgs run Advanced or Professional. Add-ons for lead nurturing (LeadBooster), Web Visitors, Campaigns, Projects price separately.`,
  faq: [
    { q: 'What is Pipedrive?', a: 'Pipedrive is a CRM built visually around the sales pipeline — deals move through stages via drag-and-drop, and every feature is designed to reduce friction on reps updating their deals.' },
    { q: 'How much does Pipedrive cost?', a: 'From ~$15/user/month (Essential) to ~$99/user/month (Enterprise). Most mid-market sales teams run Advanced (~$29) or Professional (~$59).' },
    { q: 'Pipedrive vs HubSpot vs Salesforce?', a: 'Pipedrive is sales-first and cheapest. HubSpot is marketing-and-sales-unified and mid-market-optimized. Salesforce is enterprise-first and most customizable. Match the tool to your primary motion.' },
    { q: 'Is Pipedrive good for a small business?', a: 'Yes — Pipedrive is one of the two or three best-fit CRMs for SMB sales teams under 20 reps. Fast to deploy, cheap per seat, and reps actually use it.' },
    { q: 'What are Pipedrive alternatives?', a: 'HubSpot Sales Hub (unified with marketing), Close (calling-focused), Copper (Google Workspace-native), Zoho CRM (cheaper), Salesforce (enterprise).' }
  ],
  alternatives: ['hubspot', 'salesforce', 'zoho-crm']
},
{
  slug: 'zoho-crm', name: 'Zoho CRM', vendor: 'Zoho Corporation', url: 'https://www.zoho.com/crm/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The comprehensive CRM at a fraction of Salesforce or HubSpot pricing, part of the broader Zoho One suite.',
  what: `Zoho CRM is the flagship product of Zoho Corporation, a privately-held India-headquartered software company that runs a bootstrapped SaaS suite of 50+ business applications. Founded in 1996, Zoho competes on price and breadth: comparable CRM capabilities to HubSpot or Salesforce at roughly a quarter of the cost, with the trade-off being a busier UI and less polish on individual modules.`,
  who: `SMB and mid-market companies that want CRM + marketing + service + productivity from one vendor, and who care more about total cost of ownership than best-in-class per module. Also popular among global companies for India/APAC pricing advantages.`,
  cost: `Standard ~$14/user/mo, Professional ~$23, Enterprise ~$40, Ultimate ~$52. Zoho One (all 50+ apps bundled) at ~$37/user/mo is the most commonly-purchased option because the math works: CRM + email + docs + accounting + support + more for less than Salesforce charges for just CRM.`,
  faq: [
    { q: 'What is Zoho CRM?', a: 'Zoho CRM is a comprehensive customer-relationship-management platform including sales pipeline, marketing automation, customer service, and analytics — priced at a fraction of Salesforce or HubSpot for comparable feature depth.' },
    { q: 'How much does Zoho CRM cost?', a: 'Standard $14/user/month, Professional $23, Enterprise $40, Ultimate $52. Zoho One (50+ apps) at ~$37/user/month is the value play.' },
    { q: 'Zoho vs Salesforce?', a: 'Salesforce is more customizable, has the deepest ecosystem, and is the enterprise default. Zoho is 25–50% the cost, covers more ground per license, and is the small-and-mid-market value choice.' },
    { q: 'Is Zoho CRM any good in 2026?', a: 'Yes. The knock on Zoho for years was UI polish; the last two release cycles closed most of that gap. For a bootstrapped or capital-efficient business, Zoho is often the right call.' },
    { q: 'What are Zoho CRM alternatives?', a: 'HubSpot (unified, mid-market), Salesforce (enterprise), Pipedrive (SMB sales-first), Freshsales, Bitrix24.' }
  ],
  alternatives: ['hubspot', 'salesforce', 'pipedrive']
},
{
  slug: 'zoominfo', name: 'ZoomInfo', vendor: 'ZoomInfo Technologies Inc.', url: 'https://www.zoominfo.com/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The enterprise-scale B2B contact and company database, with intent data and workflow tools.',
  what: `ZoomInfo (NASDAQ: ZI) is a US B2B data platform providing verified contact information, company firmographics, technographics, and intent data on hundreds of millions of business professionals globally. Formed from the 2019 merger of ZoomInfo and DiscoverOrg; publicly listed 2020.`,
  who: `Enterprise B2B sales and marketing organizations with data-hungry outbound motions, ABM programs, and the budget to justify the platform's premium pricing. SMBs typically use Apollo or Lusha instead at 10–20% of the cost.`,
  cost: `ZoomInfo does not publish list pricing. Typical enterprise contracts start around $15,000–$30,000/year for a small team and scale into six figures for large deployments. Intent data (ZoomInfo Intent, formerly Bombora) and Workflows add-ons price separately.`,
  faq: [
    { q: 'What is ZoomInfo used for?', a: 'ZoomInfo is used for B2B prospecting (finding target contacts), account-based marketing (identifying in-market accounts via intent data), CRM enrichment (keeping records current), and outbound workflow automation.' },
    { q: 'How much does ZoomInfo cost?', a: 'Enterprise contracts typically start at $15,000–$30,000/year for smaller teams and reach six figures for large deployments. ZoomInfo does not publish list pricing.' },
    { q: 'ZoomInfo vs Apollo?', a: 'ZoomInfo has deeper data and stronger enterprise features but costs 5–10× more. Apollo is the SMB-through-mid-market alternative — most companies under 250 employees find Apollo\'s data quality sufficient at a fraction of the cost.' },
    { q: 'Is ZoomInfo worth the cost?', a: 'For enterprise sales orgs with formal outbound and ABM programs, generally yes. For small teams doing occasional prospecting, almost certainly not — Apollo or Lusha delivers 80% of the value at 10% of the cost.' },
    { q: 'What are ZoomInfo alternatives?', a: 'Apollo.io (SMB/mid-market default), Lusha (cheaper contact-first), Cognism (EU-strong), Clearbit (now HubSpot Breeze), LinkedIn Sales Navigator (people-first, no email direct).' }
  ],
  alternatives: ['salesforce', 'outreach-io', 'hubspot']
},
{
  slug: 'apollo-io', name: 'Apollo.io', vendor: 'Apollo.io, Inc.', url: 'https://www.apollo.io/',
  category: 'BusinessApplication', pillar: 'sales',
  tagline: 'The all-in-one sales intelligence + engagement platform that made ZoomInfo-level data affordable to SMBs.',
  what: `Apollo.io is a San Francisco-based sales technology company founded in 2015. The product combines a 275M+ B2B contact database with sales-engagement (sequences, dialer), meeting scheduling, and workflow automation — the categories previously served by ZoomInfo + Outreach + Salesloft, at a fraction of the cost.`,
  who: `SMB and mid-market sales teams that need enterprise-adjacent data quality without enterprise pricing. Especially strong for outbound SDR teams, founder-led sales, and B2B agencies running lead-gen for clients.`,
  cost: `Free tier includes 60 email credits/month. Basic ~$59/user/month, Professional ~$99, Organization ~$149. Enterprise pricing custom. Most SMB sales teams run Basic or Professional. Meaningfully cheaper than ZoomInfo or Outreach individually — let alone both combined.`,
  faq: [
    { q: 'What is Apollo.io?', a: 'Apollo.io is a unified sales-intelligence and engagement platform: contact database, sales sequences, dialer, meeting scheduler, and workflow automation in one product.' },
    { q: 'How much does Apollo.io cost?', a: 'Free tier (60 credits/month), Basic ~$59/user/month, Professional ~$99, Organization ~$149. Most SMB teams end up in the $59–$99 range per seat.' },
    { q: 'Apollo vs ZoomInfo?', a: 'Apollo has 90% of ZoomInfo\'s data quality at 10–20% of the price. For teams under 250 employees, Apollo is almost always the right first choice. Enterprises with existing ZoomInfo contracts and deep data-integration needs keep ZoomInfo.' },
    { q: 'Apollo vs Outreach?', a: 'Outreach is a specialist sales-engagement platform (best-in-class sequences, deep Salesforce integration). Apollo does sequences + everything else at lower quality on each piece but massively lower cost. Match to team maturity: mature enterprise = Outreach; SMB/scaling = Apollo.' },
    { q: 'What are the best Apollo alternatives?', a: 'ZoomInfo (enterprise, deeper data), Lusha (contact-first, cheaper for individuals), Clay (waterfall enrichment across sources), Salesforce Sales Engagement (Salesforce-native), Outreach + ZoomInfo combo (enterprise stack).' }
  ],
  alternatives: ['outreach-io', 'salesforce', 'zoominfo']
},
{
  slug: 'instantly-ai', name: 'Instantly.ai', vendor: 'Instantly.ai, Inc.', url: 'https://instantly.ai/',
  category: 'BusinessApplication', pillar: 'demand-gen',
  tagline: 'The cold-email automation platform built for high-volume outbound at low cost.',
  what: `Instantly.ai is a US SaaS company launched in 2021 that focuses on cold email at scale. The product handles unlimited sending accounts, deliverability warmup, inbox rotation, unified inbox, and sequence automation — designed for agencies, lead-gen shops, and B2B founders running high-volume outbound.`,
  who: `Cold-email operators: outbound-focused B2B agencies, lead-gen firms, sales-development teams at scaling companies, and founders running founder-led outbound. Not for teams doing warm sales at low volume.`,
  cost: `Growth ~$37/month for up to 5K contacts and unlimited email accounts. Hypergrowth ~$97/month (100K contacts). Light Speed ~$358/month (unlimited contacts). Meaningfully cheaper per active email account than Outreach or Salesloft (which charge per seat, not per volume).`,
  faq: [
    { q: 'What is Instantly.ai?', a: 'Instantly.ai is a cold-email automation platform: unlimited sending accounts, deliverability warmup, inbox rotation, unified inbox, and sequence automation — built for high-volume outbound.' },
    { q: 'How much does Instantly cost?', a: 'Growth ~$37/month (5K contacts), Hypergrowth ~$97/month (100K contacts), Light Speed ~$358/month (unlimited). Priced by contacts and features, not per seat.' },
    { q: 'Instantly vs Smartlead vs Lemlist?', a: 'All three do cold email at scale with warmup and inbox rotation. Instantly and Smartlead are the two most popular for pure high-volume outbound; Lemlist adds more personalization and video features. Test drives are cheap — try both before committing.' },
    { q: 'Is Instantly good for a founder doing their own outbound?', a: 'Yes, especially at the Growth tier. Founder-led outbound was a specific design target — the UI is faster to learn than enterprise sales-engagement tools.' },
    { q: 'Do I need Apollo AND Instantly?', a: 'They\'re complements, not alternatives. Apollo finds the contacts; Instantly sends the cold emails at scale. Most outbound stacks run both.' }
  ],
  alternatives: ['apollo-io', 'outreach-io']
},
{
  slug: 'zapier', name: 'Zapier', vendor: 'Zapier, Inc.', url: 'https://zapier.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The dominant no-code workflow automation platform, connecting 6,000+ apps.',
  what: `Zapier is a San Francisco-based, fully-remote SaaS company founded in 2011. The product connects 6,000+ apps via trigger-action workflows ("Zaps") that non-technical users can build without code. The category-defining product for no-code integration.`,
  who: `Marketing, sales, operations, and admin teams at essentially every SaaS-using company. Solo entrepreneurs use it for personal automation; enterprise teams use it for tactical glue between systems that don't have native integrations.`,
  cost: `Free (100 tasks/month), Starter ~$20/month, Professional ~$50, Team ~$70, Company ~$120. Priced by task volume (each step in a workflow = one task) and features. Most SMBs land at Starter or Professional.`,
  faq: [
    { q: 'What is Zapier?', a: 'Zapier is a no-code automation platform: connect 6,000+ apps via trigger-action workflows without writing code. When X happens in App A, do Y in App B.' },
    { q: 'How much does Zapier cost?', a: 'Free tier (100 tasks/month), Starter ~$20/month, Professional ~$50, Team ~$70, Company ~$120. Priced by task volume and features. Most SMBs land at Starter or Professional.' },
    { q: 'Zapier vs Make (formerly Integromat)?', a: 'Zapier has the largest integration catalog and the simplest UX. Make is meaningfully cheaper at high task volumes, has more complex workflow logic (branching, filtering, iteration), and appeals to more technical users. Start with Zapier; move to Make if task costs get expensive.' },
    { q: 'When do companies outgrow Zapier?', a: 'When task volume drives monthly cost above $500–$1,000/month, when workflow complexity exceeds Zapier\'s branching capabilities, or when technical teams want to move automation into a proper iPaaS (Workato, Boomi, MuleSoft) or into custom code.' },
    { q: 'What are Zapier alternatives?', a: 'Make (cheaper, more complex logic), n8n (open-source, self-hostable), Pipedream (developer-first), Workato (enterprise iPaaS), Boomi (enterprise iPaaS), native integrations where they exist.' }
  ],
  alternatives: ['hubspot', 'salesforce']
},
{
  slug: 'make', name: 'Make', vendor: 'Celonis SE', url: 'https://www.make.com/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The visual, branching-first automation platform — the technical alternative to Zapier.',
  what: `Make (formerly Integromat) is a workflow automation platform acquired by Celonis in 2020. Where Zapier prioritizes ease-of-use, Make prioritizes power: complex branching logic, iteration, filtering, error handling, and dramatically cheaper per-task pricing. The visual "scenario" builder appeals to technically-adjacent users who need more than linear if-then flows.`,
  who: `Marketing operations, RevOps, and technical teams building non-trivial automations. Also the default choice for cost-conscious operators running high-volume automations (10K+ tasks/month) where Zapier's pricing becomes prohibitive.`,
  cost: `Free (1,000 operations/month), Core ~$9/month (10K ops), Pro ~$16 (10K ops + more features), Teams ~$29, Enterprise custom. Operations are cheaper than Zapier tasks at high volumes — often 5–10× more automation per dollar at scale.`,
  faq: [
    { q: 'What is Make?', a: 'Make (formerly Integromat) is a visual workflow automation platform for building "scenarios" that connect apps and services with branching logic, iteration, filtering, and error handling.' },
    { q: 'How much does Make cost?', a: 'Free (1,000 ops/month), Core ~$9/month (10K ops), Pro ~$16, Teams ~$29, Enterprise custom. Significantly cheaper than Zapier at high volumes.' },
    { q: 'Make vs Zapier — which is better?', a: 'For simple linear workflows and non-technical users, Zapier is easier. For complex branching, high-volume, cost-sensitive, or technical users, Make wins. Most serious automation programs eventually run both.' },
    { q: 'Is Make hard to learn?', a: 'Harder than Zapier but not by much. Non-developers can build production workflows in Make with a few hours of learning. The complexity is opt-in — start simple, add branching only when needed.' },
    { q: 'What are Make alternatives?', a: 'Zapier (easier), n8n (open-source, self-hostable), Pipedream (developer-first), Workato (enterprise), custom code (Python/Node scripts on a scheduler).' }
  ],
  alternatives: ['hubspot', 'segment']
},
{
  slug: 'customer-io', name: 'Customer.io', vendor: 'Customer.io, Inc.', url: 'https://customer.io/',
  category: 'BusinessApplication', pillar: 'automation',
  tagline: 'The developer-friendly customer messaging platform for behavior-triggered email, SMS, and push.',
  what: `Customer.io is a Portland-based, fully-remote SaaS company founded in 2012. The product specializes in behavior-triggered messaging across email, SMS, push, and in-app — driven by event data (what users did) rather than static list membership. Popular in SaaS, e-commerce, and any product where user behavior varies enough to justify per-user messaging.`,
  who: `Product-led SaaS companies, mobile app operators, and e-commerce brands that need to trigger messages from product events. Requires event tracking (Segment, custom integration) to be useful — not a plug-and-play SMB tool like Mailchimp.`,
  cost: `Essentials ~$100/month for up to 5K profiles + email. Premium (custom pricing) adds SMS, push, in-app, and advanced features. Most real deployments end up in the $200–$2,000/month range depending on profile volume and channel mix.`,
  faq: [
    { q: 'What is Customer.io?', a: 'Customer.io is a customer messaging platform for behavior-triggered email, SMS, push, and in-app messages — driven by event data about what users actually do in your product.' },
    { q: 'How much does Customer.io cost?', a: 'Essentials starts at ~$100/month (5K profiles, email). Premium (custom) adds SMS/push/in-app. Real deployments typically $200–$2,000/month.' },
    { q: 'Customer.io vs Braze vs Iterable?', a: 'All three are behavior-triggered messaging platforms. Braze and Iterable are enterprise-first with heavier pricing and deeper mobile capabilities. Customer.io is mid-market-first, developer-friendly, and roughly a third the cost for equivalent volumes.' },
    { q: 'Do I need a CDP with Customer.io?', a: 'A CDP or clean event tracking makes Customer.io dramatically more valuable — the platform is only as good as the event data flowing in. Most Customer.io deployments run alongside Segment or RudderStack.' },
    { q: 'What are Customer.io alternatives?', a: 'Braze (enterprise), Iterable (enterprise), Klaviyo (e-commerce specific), OneSignal (mobile-first), Intercom (support-first), HubSpot Marketing Hub (if you\'re already on HubSpot).' }
  ],
  alternatives: ['hubspot', 'klaviyo', 'segment']
},
{
  slug: 'beehiiv', name: 'Beehiiv', vendor: 'beehiiv, Inc.', url: 'https://www.beehiiv.com/',
  category: 'BusinessApplication', pillar: 'content-marketing',
  tagline: 'The newsletter platform built for creators who want to grow, monetize, and treat their newsletter like a business.',
  what: `Beehiiv is a US SaaS company founded in 2021 by former Morning Brew operators. The product is a purpose-built newsletter platform combining ESP capability, built-in monetization (paid subscriptions, ad network), audience-growth tools (referral programs, recommendation network), and clean analytics. Positioned as the professional alternative to Substack for creators serious about growth.`,
  who: `Independent creators building serious newsletters (10K–1M+ subscribers), media brands, and companies using newsletters as their primary owned-audience channel. Not the right choice for transactional email or e-commerce lifecycle marketing.`,
  cost: `Free tier up to 2,500 subscribers. Scale ~$39/month (up to 10K), Grow ~$99/month (up to 100K), Enterprise custom. Beehiiv Ad Network shares revenue with publishers who opt in, materially subsidizing subscription cost for larger publishers.`,
  faq: [
    { q: 'What is Beehiiv?', a: 'Beehiiv is a newsletter platform: send emails, manage subscribers, run paid subscriptions, grow via a recommendation network, monetize via an integrated ad network, and see clean analytics — all in one product.' },
    { q: 'How much does Beehiiv cost?', a: 'Free up to 2,500 subscribers. Scale ~$39/month (10K), Grow ~$99/month (100K), Enterprise custom. Publishers can offset cost via the built-in ad network.' },
    { q: 'Beehiiv vs Substack?', a: 'Substack has the larger reader-side network and takes 10% of paid-subscription revenue. Beehiiv charges a flat SaaS fee (no revenue share), offers better analytics and audience-growth tools, but has a smaller reader network. Serious creators building an audience-and-business tend toward Beehiiv; solo creators optimizing for reader discovery tend toward Substack.' },
    { q: 'Is Beehiiv good for a business newsletter (vs a personal one)?', a: 'Yes — arguably the best-fit platform for a B2B or company-branded newsletter. Full custom domain, no visible platform branding on the reader end, integrations with segmentation and automation tools.' },
    { q: 'What are Beehiiv alternatives?', a: 'Substack (reader-network, cheaper for tiny lists), ConvertKit/Kit (creator-focused ESP), Ghost (open-source, self-hostable), Mailchimp (general-purpose ESP), Buttondown (developer-friendly minimalist).' }
  ],
  alternatives: ['substack', 'mailchimp', 'active-campaign']
},
{
  slug: 'substack', name: 'Substack', vendor: 'Substack, Inc.', url: 'https://substack.com/',
  category: 'BusinessApplication', pillar: 'content-marketing',
  tagline: 'The reader-network-first paid newsletter and podcast platform that defined the modern independent-publisher renaissance.',
  what: `Substack is a US publishing platform founded in 2017 by Chris Best, Hamish McKenzie, and Jairaj Sethi. The product combines newsletter hosting, paid subscriptions, podcasts, and — critically — a reader-side network (the Substack app + Substack Notes) that helps publications gain subscribers from other publications' readers. Category-defining for the independent-publisher renaissance.`,
  who: `Independent writers, journalists, opinion columnists, podcasters, and anyone building a paid-subscriber audience for their own voice. Increasingly used by publications and businesses too, though the platform's identity remains creator-first.`,
  cost: `Free to start. Substack takes 10% of paid-subscription revenue + Stripe processing fees. No monthly SaaS fee. That model appeals to creators launching a paid publication with no upfront cost; it becomes expensive at scale (a $100K/year Substack pays $10K/year to Substack — where Beehiiv's $99/month tier would be ~$1,200/year for the same volume).`,
  faq: [
    { q: 'What is Substack?', a: 'Substack is a publishing platform combining newsletter, paid subscription, podcast, and a reader-side discovery network — designed for independent creators to publish, monetize, and grow.' },
    { q: 'How much does Substack cost?', a: 'Free to start. Substack takes 10% of paid-subscription revenue + Stripe fees. No monthly SaaS fee. Free publications pay nothing.' },
    { q: 'Substack vs Beehiiv — which is better?', a: 'Substack has the stronger reader-side network (better organic growth for solo creators). Beehiiv has better analytics, monetization tools, and flat pricing that\'s cheaper at scale. Serious creators building a business tend toward Beehiiv; creators optimizing for reader discovery tend toward Substack.' },
    { q: 'Can I use Substack for a business newsletter?', a: 'Technically yes, but the platform\'s identity is creator-first and Substack branding is visible to readers (app, notifications, recommendations). Most companies choose Beehiiv or ConvertKit for a fully-branded business newsletter.' },
    { q: 'What are Substack alternatives?', a: 'Beehiiv (business-newsletter-friendly, flat pricing), Ghost (open-source, self-hostable), Buttondown (minimalist), Kit / ConvertKit (creator ESP), Medium Partner Program (article-first).' }
  ],
  alternatives: ['beehiiv', 'mailchimp', 'active-campaign']
},
{
  slug: 'openai-chatgpt', name: 'ChatGPT (OpenAI)', vendor: 'OpenAI, Inc.', url: 'https://openai.com/chatgpt',
  category: 'BusinessApplication', pillar: 'ai-marketing',
  tagline: 'The dominant general-purpose AI assistant and the catalyst for the generative-AI adoption wave in marketing.',
  what: `ChatGPT is the consumer-facing product of OpenAI, launched November 2022 as a research demo and now the largest AI assistant deployment in history (500M+ weekly users). Built on OpenAI's GPT model family. For marketers, ChatGPT is both a personal-productivity tool (drafting, brainstorming, editing) and — via the API — the underlying capability for most AI-marketing products in the market.`,
  who: `Essentially every knowledge worker with any exposure to writing, analysis, or research. In marketing specifically: content teams for drafting, strategy teams for brainstorming, analysts for data reasoning, ops teams for automation and coding. Enterprise adoption via ChatGPT Enterprise for teams needing SSO, admin, and data controls.`,
  cost: `Free tier (limited GPT-5 access, GPT-4o unlimited). Plus $20/user/month. Business $25/user/month (min 2 seats). Enterprise custom pricing. API pricing separate: pay-per-token, typically $2–$15 per million input/output tokens depending on model.`,
  faq: [
    { q: 'What is ChatGPT?', a: 'ChatGPT is OpenAI\'s consumer AI assistant — a conversational interface to their GPT family of large language models. Used for writing, brainstorming, coding, research, analysis, and countless other knowledge-work tasks.' },
    { q: 'How much does ChatGPT cost?', a: 'Free tier available. Plus $20/user/month, Business $25/user/month, Enterprise custom. API access separate (pay-per-token).' },
    { q: 'ChatGPT vs Claude vs Gemini?', a: 'ChatGPT has the largest user base and ecosystem, strongest at general-purpose tasks. Claude (Anthropic) is preferred for long-context analysis and by many for writing quality. Gemini (Google) integrates deeply with Google Workspace. Serious users often use all three depending on task.' },
    { q: 'Is ChatGPT worth paying for?', a: 'For anyone using AI daily for meaningful work, yes — the paid tiers unlock the latest models, higher rate limits, and features like image generation, data analysis, and custom GPTs. Free-tier limitations are meaningful once you use the product seriously.' },
    { q: 'Should marketers use ChatGPT for content generation?', a: 'For drafting, brainstorming, editing, and research — extremely useful. For fully-automated content publication — dangerous without human review, since AI content still misfires on facts, brand voice, and search-engine quality guidelines. Use it as an assistant, not a replacement for editorial judgment.' }
  ],
  alternatives: ['anthropic-claude', 'perplexity', 'jasper']
},
{
  slug: 'anthropic-claude', name: 'Claude (Anthropic)', vendor: 'Anthropic PBC', url: 'https://claude.ai/',
  category: 'BusinessApplication', pillar: 'ai-marketing',
  tagline: 'The AI assistant most-preferred for writing quality, long-context work, and coding by serious knowledge-work users.',
  what: `Claude is the flagship product of Anthropic, an AI safety company founded in 2021 by former OpenAI researchers including Dario and Daniela Amodei. The Claude model family (Fable, Opus, Sonnet, Haiku as of 2026) competes head-to-head with OpenAI's GPT models. Widely considered the best-in-class model for long-context reasoning, coding, and writing quality — with a smaller consumer footprint than ChatGPT but growing enterprise and developer adoption.`,
  who: `Knowledge workers who evaluated ChatGPT and Claude side-by-side and preferred Claude for their specific tasks (usually writing quality or long-context analysis). Also the dominant AI in the developer community for coding assistance. Enterprise adoption via Claude Enterprise for compliance-conscious industries.`,
  cost: `Free tier (limited). Pro $20/user/month. Max $100/user/month (higher limits + priority). Team $30/user/month (min 5). Enterprise custom. API pricing separate: pay-per-token, typically $3–$75 per million tokens depending on model tier.`,
  faq: [
    { q: 'What is Claude?', a: 'Claude is Anthropic\'s AI assistant — a conversational interface to their Claude model family. Used for writing, analysis, coding, research, and long-document reasoning. Widely preferred by users who care about writing quality or need to work with long documents.' },
    { q: 'How much does Claude cost?', a: 'Free tier available. Pro $20/user/month, Max $100/user/month, Team $30/user/month, Enterprise custom. API pricing separate.' },
    { q: 'Claude vs ChatGPT?', a: 'Both are excellent general-purpose AI assistants. Claude is generally preferred for writing quality (feels less formulaic), long-context work (larger useful context window), and coding. ChatGPT has the larger ecosystem, more integrations, and stronger multimodal features. Serious users often pay for both.' },
    { q: 'Is Claude the same company as OpenAI?', a: 'No. Anthropic was founded in 2021 by former OpenAI researchers who left over disagreements about AI safety and commercialization priorities. Anthropic operates independently and has raised billions in funding to compete directly with OpenAI.' },
    { q: 'What are the Claude models called?', a: 'Model tiers in 2026: Fable (fastest general-purpose), Opus (most capable), Sonnet (balanced), Haiku (smallest, cheapest). Older tiers include Claude 3 Opus/Sonnet/Haiku. The naming has evolved several times.' }
  ],
  alternatives: ['openai-chatgpt', 'perplexity', 'jasper']
},
{
  slug: 'perplexity', name: 'Perplexity', vendor: 'Perplexity AI, Inc.', url: 'https://www.perplexity.ai/',
  category: 'BusinessApplication', pillar: 'ai-marketing',
  tagline: 'The AI-native search engine that cites sources, competing directly with Google as a knowledge-work default.',
  what: `Perplexity is a US AI-search company founded in 2022 by Aravind Srinivas, Denis Yarats, Johnny Ho, and Andy Konwinski. The product is a conversational search interface that answers questions by combining LLM reasoning with live web-search + citations to source URLs. Widely adopted by knowledge workers as a Google alternative for research-first queries.`,
  who: `Knowledge workers doing research-heavy work: analysts, journalists, marketers, researchers. Also increasingly used inside sales and marketing teams for competitor and prospect research. Consumer adoption growing rapidly but still much smaller than Google.`,
  cost: `Free tier (limited). Pro $20/user/month (unlimited Pro searches, model choice including GPT-4o/Claude Opus, file uploads). Enterprise custom. API access separate via Perplexity Sonar.`,
  faq: [
    { q: 'What is Perplexity?', a: 'Perplexity is an AI-native search engine — you ask questions in plain language, and it returns answers synthesized from live web sources with inline citations. Positioned as a research-first alternative to Google.' },
    { q: 'How much does Perplexity cost?', a: 'Free tier available. Pro $20/user/month (unlimited Pro searches, choice of GPT/Claude/other models, file uploads). Enterprise custom.' },
    { q: 'Perplexity vs Google?', a: 'Google returns links; Perplexity returns answers. For research-first queries where you want a synthesized answer with citations, Perplexity is often faster than Google. For navigational queries or when you want to browse multiple sources, Google is still better.' },
    { q: 'Perplexity vs ChatGPT?', a: 'ChatGPT is a general-purpose AI assistant; Perplexity is a search-focused AI. For questions requiring current-web information with source citations, Perplexity is better. For general writing, coding, or reasoning tasks, ChatGPT is better.' },
    { q: 'Should marketers optimize for Perplexity results?', a: 'Yes — Perplexity is one of the emerging "AI answer surfaces" that marketers now optimize content for (alongside Google\'s AI Overview and ChatGPT\'s search). Getting cited as a source in Perplexity\'s answers matters for the growing segment of buyers who start their research there.' }
  ],
  alternatives: ['openai-chatgpt', 'anthropic-claude', 'ahrefs']
},
{
  slug: 'jasper', name: 'Jasper', vendor: 'Jasper AI, Inc.', url: 'https://www.jasper.ai/',
  category: 'BusinessApplication', pillar: 'ai-marketing',
  tagline: 'The enterprise-focused AI content platform built for marketing teams with brand guidelines and workflow needs.',
  what: `Jasper is a US SaaS company founded in 2021 (originally as Jarvis, then Conversion.ai). The product is an AI content platform built specifically for marketing use cases — brand voice enforcement, template-driven output, campaign workflows, and integrations with the marketing stack. Positioned as the enterprise-marketing alternative to general-purpose AI assistants like ChatGPT.`,
  who: `Mid-market and enterprise marketing teams that need AI content generation with brand-consistency guardrails, approval workflows, and integrations with tools like HubSpot, Salesforce, and Adobe. Not the right choice for individual creators or teams that prefer general-purpose AI tools.`,
  cost: `Creator ~$49/user/month (basic AI writing). Pro ~$69/user/month (brand voice, campaigns, more). Business custom pricing (typically $500+/month for teams needing SSO, custom brand voices, dedicated support).`,
  faq: [
    { q: 'What is Jasper?', a: 'Jasper is an AI content platform purpose-built for marketing teams — AI writing with brand voice enforcement, template-driven output for common marketing formats, and workflow features for team collaboration and approval.' },
    { q: 'How much does Jasper cost?', a: 'Creator ~$49/user/month, Pro ~$69/user/month, Business custom (typically $500+/month for teams).' },
    { q: 'Jasper vs ChatGPT?', a: 'ChatGPT is a general-purpose AI assistant, cheaper per user, more versatile. Jasper is marketing-specific, more expensive, with features (brand voice, campaigns, approval workflows) that only matter for teams. Solo marketers usually don\'t need Jasper. Marketing teams often do.' },
    { q: 'Is Jasper worth the price?', a: 'For enterprise marketing teams that need brand-voice enforcement and workflow features at scale — yes. For solo creators or small teams that can operate ChatGPT + Claude directly — no, Jasper\'s premium is hard to justify.' },
    { q: 'What are Jasper alternatives?', a: 'ChatGPT + Claude (general-purpose, cheaper), Copy.ai (marketing-focused, similar positioning), Writer (enterprise brand-voice AI), Anyword (ad-copy specialist), Frase (SEO-focused writing).' }
  ],
  alternatives: ['openai-chatgpt', 'anthropic-claude', 'hubspot']
}
];

// ---------------------------------------------------------------- shell
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
  .factbox{display:flex;flex-wrap:wrap;gap:22px;border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:18px 0}
  .factbox div{min-width:180px}
  .factbox div b{display:block;font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.14em;color:var(--chrome);margin-bottom:3px}
  .factbox div span{font-family:var(--sans);font-size:14px;color:var(--ink)}
  .factbox a{color:var(--cobalt);word-break:break-all}
  h2{font-family:var(--serif);font-weight:600;font-size:21px;letter-spacing:-.01em;margin:30px 0 10px}
  h3{font-family:var(--serif);font-weight:600;font-size:16.5px;margin:20px 0 6px}
  p,li{font-size:14.5px;line-height:1.75;color:var(--body);margin-bottom:12px}
  strong{color:var(--ink);font-weight:600}
  .faq-item{border:1px solid var(--stone);border-radius:10px;background:#fff;padding:16px 22px;margin:12px 0}
  .faq-item h3{margin:0 0 6px;font-size:15.5px}
  .faq-item p{margin:0;font-size:13.5px}
  .rel{margin:34px 0 0;border-top:1px solid var(--stone);padding-top:18px}
  .rel h3{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.16em;color:var(--oxblood);margin:0 0 10px}
  .rel a{display:block;font-family:var(--serif);font-size:16px;font-weight:600;color:var(--ink);text-decoration:none;margin-bottom:8px}
  .rel a:hover{color:var(--cobalt)}
  .fn{font-size:12px;color:var(--chrome);margin-top:16px}
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
mkdirSync(join(ROOT, 'entities'), { recursive: true });

// pull pillar cat display for internal links
const pillarsSrc = readFileSync(join(ROOT, 'build-pillars.mjs'), 'utf8');
const pillarLookup = {};
for (const m of pillarsSrc.matchAll(/slug: '([^']+)', cat: '([^']+)'/g)) pillarLookup[m[1]] = m[2];

function entityLink(slug) {
  const e = ENTITIES.find(x => x.slug === slug);
  return e ? `<a href="${e.slug}.html">${esc(e.name)}</a>` : null;
}

for (const e of ENTITIES) {
  const canonical = `${SITE}/entities/${e.slug}.html`;
  const title = `${e.name} — What It Is, Who Uses It, and What It Costs in 2026 — ${BRAND}`;
  const metaDesc = `${e.name}: ${e.tagline} What it does, who buys it, what it costs in 2026, and the alternatives that show up on real shortlists. From The Wall's growth-vendor reference.`;

  const bodyText = strip([e.what, e.who, e.cost, ...e.faq.map(f => f.q + ' ' + f.a)].join(' '));
  const ld = [ORG_LD,
    {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication',
      name: e.name,
      applicationCategory: e.category,
      operatingSystem: 'Web',
      url: e.url,
      description: `${e.tagline} ${strip(e.what).slice(0, 300)}`.trim(),
      publisher: { '@type': 'Organization', name: e.vendor },
      brand: { '@type': 'Brand', name: e.name },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', priceSpecification: { '@type': 'PriceSpecification', description: strip(e.cost) } }
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: e.faq.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BRAND, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Entities', item: `${SITE}/entities/` },
        { '@type': 'ListItem', position: 3, name: e.name }
      ]
    }];

  const altLinks = (e.alternatives || []).map(entityLink).filter(Boolean).join(', ');
  const pillarLink = pillarLookup[e.pillar] ? `<a href="../pillars/${e.pillar}.html">${esc(pillarLookup[e.pillar])} pillar</a>` : 'the directory';
  const relEntitiesHTML = (e.alternatives || []).length
    ? `<div class="rel"><h3>ALTERNATIVES</h3>
${(e.alternatives || []).map(s => {
  const alt = ENTITIES.find(x => x.slug === s);
  return alt ? `<a href="${alt.slug}.html">${esc(alt.name)} — ${esc(alt.tagline)}</a>` : '';
}).join('\n')}
</div>` : '';

  const body = `
<div class="kicker">ENTITY · PLATFORM REFERENCE</div>
<h1>${esc(e.name)}</h1>
<p class="dek">${esc(e.tagline)}</p>

<div class="factbox">
  <div><b>VENDOR</b><span>${esc(e.vendor)}</span></div>
  <div><b>WEBSITE</b><span><a href="${esc(e.url)}" rel="nofollow noopener" target="_blank">${esc(e.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></span></div>
  <div><b>CATEGORY IN THE WALL</b><span>${pillarLookup[e.pillar] ? `<a href="../pillars/${e.pillar}.html">${esc(pillarLookup[e.pillar])}</a>` : '—'}</span></div>
</div>

<h2>What ${e.name} is</h2>
<p>${e.what}</p>

<h2>Who uses ${e.name}</h2>
<p>${e.who}</p>

<h2>What ${e.name} costs</h2>
<p>${e.cost}</p>

<h2>Where ${e.name} sits in the growth-vendor context</h2>
<p>${e.name} shows up on shortlists in ${BRAND}'s ${pillarLink}. Buyers who consider ${e.name} typically also evaluate ${altLinks || 'alternative platforms in the same category'} — the shortlist question is usually not whether ${e.name} is a good product (it generally is, or it wouldn't be on the list), but whether its center of gravity fits the company's shape.</p>

<h2>Frequently asked</h2>
${e.faq.map(f => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('\n')}

${relEntitiesHTML}
<div class="rel"><h3>RELATED IN THE ATLAS</h3>
${pillarLookup[e.pillar] ? `<a href="../pillars/${e.pillar}.html">${esc(pillarLookup[e.pillar])} — the pillar this platform lives in</a>` : ''}
<a href="../glossary.html">The Wall glossary — 200+ growth-vendor terms defined</a>
<a href="../news/">Data briefings on the US growth-vendor market</a>
</div>
<p class="fn">${BRAND} is an independent directory. This page describes ${e.name} as a market entity for buyer reference; ${e.name} is not a paid inclusion, sponsor, or affiliate. Facts on this page are compiled from public sources including the vendor's own website, SEC filings where applicable, and industry references. Corrections: <a href="../contact.html">contact page</a>.</p>`;

  writeFileSync(join(ROOT, 'entities', `${e.slug}.html`),
    shell({ title, metaDesc, canonical, ld, bodyHTML: body, base: '../' }));
}

// entities index page
const idxLD = [ORG_LD, {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: `Platform Entity Reference — ${BRAND}`, url: `${SITE}/entities/`,
  description: `Reference pages for the platforms that show up most often in US growth-vendor conversations — CRMs, marketing automation, paid-ad platforms, SEO tools, CDPs.`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: ENTITIES.map((e, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: `${SITE}/entities/${e.slug}.html`, name: e.name
    }))
  }
}];
const groups = {};
for (const e of ENTITIES) (groups[e.pillar] ||= []).push(e);
const idxBody = `
<div class="kicker">REFERENCE / ENTITIES</div>
<h1>Platform reference</h1>
<p class="dek">The platforms that show up repeatedly in US growth-vendor conversations. ${ENTITIES.length} reference pages so far, grouped by the pillar each platform anchors. Facts, pricing bands, alternatives, and how the platform fits into a real vendor shortlist — same standards as the rest of the atlas.</p>

${Object.keys(groups).map(p => `<h2>${pillarLookup[p] || p}</h2>
<div>${groups[p].map(e => `<div class="faq-item"><h3><a href="${e.slug}.html">${esc(e.name)}</a></h3><p>${esc(e.tagline)}</p></div>`).join('\n')}</div>`).join('\n')}

<div class="rel">
<h3>KEEP GOING</h3>
<a href="../glossary.html">The Wall glossary — 200+ growth-vendor terms defined</a>
<a href="../news/">Data briefings on the US growth-vendor market</a>
<a href="../sitemap.html">The full atlas — all listings by category</a>
</div>`;
writeFileSync(join(ROOT, 'entities', 'index.html'),
  shell({
    title: `Platform Reference — ${ENTITIES.length} Growth-Vendor Platforms Defined — ${BRAND}`,
    metaDesc: `${ENTITIES.length} reference pages for the platforms that show up most often in US growth-vendor conversations — CRMs, marketing automation, paid-ad platforms, SEO tools, CDPs. From The Wall.`,
    canonical: `${SITE}/entities/`, ld: idxLD, bodyHTML: idxBody, base: '../'
  }));

console.log(`entity pages written: ${ENTITIES.length} + index`);
