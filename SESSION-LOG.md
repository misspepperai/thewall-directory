# The Wall Directory — Build Log & Resume State

*Last updated: 2026-08-03 (end of build session 1). This file is the canonical resume point —
read it fully before continuing work in a fresh session.*

**Live site:** http://hitthewall.net (HTTPS cert pending — see "In flight" below; old github.io URLs 301 here)
**Repo:** github.com/misspepperai/thewall-directory · **Local:** `C:\Users\danku\Documents\directory-thewall`

---

## What this is

An "operations atlas": a US-only directory of **2,286 verified-live companies** that solve growth
problems (Sales, Marketing, SEO, Thought Leadership, Creative Strategy, Automation, Demand Gen,
Content Marketing, Social Media Marketing, AI Marketing — 10 pillars) for the ICP: US businesses at
$5M+ revenue, 25+ employees, C-suite/upper-management buyers aged 40–65 who hit a growth wall.

Revenue model (per Dan's strategic brief, Phase 2): claimed listings, email capture, affiliates,
lead gen. Monetization DB fields exist and ship empty (`featured`, `listing_tier`,
`advertiser_cta_url`, `affiliate_hook_category`, `email_optin_hook`).

## Architecture

- **Front end:** static, no build step. `index.html` = SPA atlas (radial dial, search, detail views,
  submit modal). `admin.html` = console (supabase-js, email-gated). Design: "Product Hunt × a16z,
  operations atlas / radial instrument" — porcelain/stone/cobalt/oxblood/ink/chrome palette,
  Newsreader serif + IBM Plex Sans/Mono. Design spec was Dan's; shipped and approved direction.
- **Backend:** Supabase project **"Pepper Agency Data"** (`kdvuewhbinmhmrysusbd`) — shared with other
  Miss Pepper infra; a 3rd project would bill $10/mo, so this one hosts the tables. Table:
  `public.directory_companies`. Guard table: `public.blocked_domains` (+ BEFORE INSERT trigger
  `trg_reject_blocked` — removed domains can never re-enter via scrape or submission).
- **Hosting:** GitHub Pages from `main` (repo `misspepperai/thewall-directory`, gh CLI authed as
  `misspepperai`). Vercel was abandoned (MCP scoped to pepper-os only → new projects strand behind
  SSO); Supabase can't serve HTML (platform rewrites to text/plain — both storage AND edge functions).
- **Static AEO layer:** `c/{domain}.html` per company (2,286 pages) with full JSON-LD
  (Org + ProfessionalService/SoftwareApplication + 20-question FAQPage + speakable + Breadcrumb),
  per-record meta descriptions, canonicals. Plus `sitemap.xml`, `sitemap.html` (HTML sitemap),
  `robots.txt`, `.nojekyll`.
- **RLS:** public SELECT only `status='approved'`; anon INSERT only `status='pending'` (submit flow);
  full CRUD only for authenticated email `support@misspepper.ai` (`admin_full_access`).
  **Admin account not yet created** — Dan signs up once at /admin.html with that email.
  Enrichment scripts require a temp policy: `create policy "temp_anon_enrich" on
  public.directory_companies for update to anon using (true) with check (true);` — create before
  running clutch_facts/site_meta/build-pages persist, **drop after**.

## Data schema (directory_companies)

Core: name, domain (unique), category (10-pillar check constraint), subcategory, description, status.
Classification: listing_type (Marketing Agency/Software Provider/Business Service), bottleneck_solved,
target_executive_icp, client_revenue_fit. Facts: site_title, site_description (homepage meta),
clutch_bio, services_list, year_established (4-digit), min_project_size, avg_hourly_rate, team_size,
hq_city, hq_state, hq_country ('US' ISO), street_address, zip_code, phone_number (normalized
"+1 (XXX) XXX-XXXX"), clutch_rating, clutch_reviews. AEO: qa (jsonb, 20 {q,a}), speakable_what_you_find,
speakable_listing_details, speakable_quick_facts. Provenance: data_source, enriched_at.

**Data provenance:** Clutch.co via Apify `memo23/apify-clutch-cheerio` (~$17 total, 8 datasets) +
curated knowledge batches + SERP harvests (mcp-scraper, ~1.21M credits balance) + homepage meta
harvest. Every domain HTTP-verified live before insert; US-only enforced by loader country gate +
blocklist. All removed rows backed up in session scratchpad (`nonus_backup.json`, `dead_backup*.json`).

## Build scripts (repo root)

- **`build-pages.mjs`** — regenerates all 2,286 static pages + sitemaps + robots from DB, and
  persists qa/speakables to DB (skip persist with `--pages-only`). **Extracts the Q&A engine from
  index.html at build time** via markers `/* ---------- enrichment content` → `/* ---------- detail
  route` — NEVER rename those marker comments. `SITE` constant at top = domain (retrofit point).
- **`build-trust.mjs`** — generates the 8 trust pages. Same `SITE` constant.
- Session scratchpad scripts (liveness sweep `dead_sweep.ps1`, Clutch loader `clutch_load3.ps1`
  US-gated, facts `clutch_facts.ps1`, meta `site_meta.ps1`) live in the session scratchpad dir —
  regenerate from this log's descriptions if lost; patterns are simple (paginate REST with
  offset/limit; PostgREST caps 1000/request; write via legacy anon JWT, NOT sb_publishable key;
  plain INSERTs not upserts — PostgREST upsert trips RLS).

## Rebuild-after-data-change runbook

1. `create policy "temp_anon_enrich" ...` (above)
2. (if new scrape) run loader → approve pendings → clutch_facts → site_meta → phone/year normalize SQL
3. `node build-pages.mjs` (persists qa/speakables)
4. prune orphan `c/*.html` not in approved domains
5. `drop policy "temp_anon_enrich" ...`
6. commit + push (Pages redeploys)

## Authority Amplifier status (site type: Directory; stack: static+Supabase, Dan chose "adapt AA")

- ✅ **Trust foundation SHIPPED:** about, contact, editorial-policy (selection/sourcing/corrections),
  ai-policy (honest automation disclosure), disclosures (ads/affiliate pre-labeling), privacy
  (truthful: no cookies), terms, accessibility. HTML sitemap. Organization+WebSite schema sitewide.
  Footer trust column. Wayback fingerprints on core pages.
- ✅ **Authorship decision (Dan, 2026-08-03): option 2 — NO persona.** Byline everywhere is
  "The Wall Editorial Team" as an Organization (never a Person). Do not create personas later
  without a new decision from Dan.
- ✅ **Phase 1 site-side SHIPPED (commit c851771):** `news/` Briefings section — 14 original
  data-journalism articles (all figures computed live from directory_companies via Supabase MCP
  execute_sql; no fabricated numbers), each with NewsArticle + Breadcrumb JSON-LD, Editorial Team
  org byline, method card, related links. `build-news.mjs` generates (articles hardcoded in file —
  dated snapshots, correct to freeze). Wired: sitemap.xml (build-pages.mjs globs news/*.html),
  index.html footer OPERATIONS → Briefings, trust-page footers → BRIEFINGS (build-trust regen).
- ⏭ **Phase 1 Dan-side:** submit at publishercenter.google.com (needs his Google login + GSC
  domain verification first). Post-approval: keep publishing cadence (weekly briefing runbook —
  re-run aggregates, add article object to build-news.mjs ARTICLES, rebuild, push).
- ✅ **Phase 2 topical SHIPPED (commit 98db169):** `pillars/{slug}.html` — 10 discipline hub pages
  (the wall / what it is / how vendors work / real index stats / 5-question FAQ with FAQPage
  schema). FAQ questions harvested from LIVE Google People-Also-Ask via mcp-scraper harvest_paa
  (10 queries, 2026-08-03; service flaky — retry on service_unavailable); answers are original
  prose. `glossary.html` — 70 terms, DefinedTermSet/DefinedTerm schema, links into pillar pages.
  Generator: `build-pillars.mjs` (PILLARS + TERMS arrays hardcoded; stats are 2026-08-03 index
  snapshots — refresh numbers if regenerating much later). Wiring: index.html footer INDEX column
  now links pillar pages (slug = category lowercased, spaces→hyphens); `?cat=<Category>` SPA deep
  links added to route() (verified: ?cat=SEO renders exactly the 226 SEO cards); glossary link in
  all footers; sitemap globs pillars/ + glossary.
- ✅ **DataForSEO-driven retrofit SHIPPED (commit 59affdd, 2026-08-03):** switched primary
  PAA/SERP tool from mcp-scraper to **DataForSEO MCP** (memory: `dataforseo-primary-harvest`).
  Four coordinated changes:
  1. **Task 4 sweep**: 10 pillar seed queries → keyword_ideas (KD ≤ 30, volume ≥ 500) →
     171 qualifying keywords, distilled into `docs/keyword-pipeline-2026-08-03.md` + .json
     (durable planning asset in repo). Lesson: `keyword_ideas` semantic-drifts hard (dictionary
     lookups, "video editing tips", "smart synonym"); for tighter recall use
     `dataforseo_labs_google_keyword_suggestions` (seed must appear literally).
  2. **Task 1 — pillar head-term retrofit**: added `title`, `metaDesc`, `mktH2` optional fields
     to each PILLARS entry in build-pillars.mjs. All 10 pillars now carry commercial buyer terms
     in title/meta ("US SEO Agencies & SEO Services: 226 Verified Firms", "US Marketing
     Agencies: 550 Verified Full-Service Firms", etc.). Shell falls back to old title if a pillar
     doesn't set the new fields.
  3. **Task 2 — Marketing Consultant hub**: new `build-hubs.mjs` generates `hubs/{slug}.html`.
     First hub is `hubs/marketing-consultant.html` targeting "marketing consultant"
     (18,100/mo, KD 4, $19.15 CPC). Article + FAQPage + Breadcrumb JSON-LD. Glossary term
     added, points to it. Sitemap in build-pages.mjs now globs hubs/. Pattern is ready for
     paid-advertising-platforms, b2b-marketing-agency, and small-business-platform hubs next.
  4. **Task 3 — briefing**: `news/small-business-platform-search-1015-percent-2026.html` on the
     40,500/mo +1,015% YoY trend for "digital marketing platform for small businesses".
     DataForSEO cited as source. No fabricated platform data — trend is the story.
- ✅ **Option B+C SHIPPED (commit 97e25c5, 2026-08-04):**
  - **B1**: 2 more hubs — `hubs/paid-advertising-platforms.html` (KD 6, $81 CPC) and
    `hubs/b2b-marketing-agency.html` (KD 18, $63 CPC). HUBS array now has `ctaCat` + `ctaSlug`
    fields so each hub's CTA browses the right pillar.
  - **B2**: 3 more briefings (18 total now) — rate-transparency-by-category, agency-age-by-
    category, three-software-first-pillars. All from fresh SQL against directory_companies.
  - **B3**: Glossary expanded 71 → 204 terms. New terms link into hubs where relevant.
  - **C**: `docs/outreach-kit-2026-08-04.md` — cold/follow-up/podcast pitch templates, HARO/
    Connectively response bank keyed to briefings, per-briefing angle sheet (18), Tier 1-3
    target reporter list, weekly cadence. Ready for Dan or a hired outreach person.
- ✅ **Teamwork project set up (2026-08-04):** "The Wall — Authority Amplifier Launch"
  (ID 1305672, deadline 8/15). 8 tasks under tasklist 3918852 with Dan-side blockers:
  GSC verify + sitemap, GA4, Google Publisher Center, admin account create, social fortress,
  DMCA/ScoreDetect signups, NAP data, Phase 3 outreach channel decision.
- ⏭ **Next:** wait for Dan-side unblocks (GSC especially — master gate for Google News),
  then Phase 5 monetization (claimed listings). More hubs available from keyword pipeline:
  digital-marketing-platform-for-small-businesses (40,500/mo, KD 13), social-media-management-
  platforms (22,200/mo, KD 39), local-service-ads (40,500/mo, KD 15).
- **Sitemap: 2,329 URLs** (10 pillars + 3 hubs + 19 news + glossary + trust + 2,286 listings).
- ✅ **Tier 1 AA SHIPPED (commit 15b3c65, 2026-08-04):**
  - **6 hubs total** (+3): social-media-management-platforms, local-service-ads,
    digital-marketing-platform-for-small-businesses. Plus a hubs/index.html.
  - **Rate-benchmarking calculator** at `tools/rate-benchmark.html` — interactive JS widget with
    real per-category distribution data, percentile lookup, and WebApplication schema. First
    interactive tool on the site; textbook Phase 3 catalyst content (linkable asset).
  - **15 entity pages** at `entities/` via `build-entities.mjs` — HubSpot, Salesforce, Marketo,
    ActiveCampaign, Klaviyo, Mailchimp, Google Ads, Meta Ads, LinkedIn Ads, The Trade Desk, Ahrefs,
    Semrush, Segment, GA4, Outreach. SoftwareApplication + FAQPage + Breadcrumb schema; per-entity
    factbox, pricing, alternatives cross-linking, editorial disclaimer.
  - **Fresh feed** at `news/updates/` via `build-updates.mjs` — monthly "state of the index"
    briefings. First edition published (August 2026). Pattern: UPDATES array in the script (not
    DB-derived) so historical briefings persist. Monthly cadence unlocks Google News eligibility
    freshness signal.
  - Sitemap wired: entities/, tools/, news/updates/ now globbed. Homepage footer updated.
- **Sitemap: 2,352 URLs** (10 pillars + 7 hubs + 16 entities + 1 tool + 21 news + 2 updates + 2,286 listings + trust + glossary).
- ⏭ **Waiting on Dan (Teamwork project 1305672, due 8/15):** GSC verify + sitemap submit,
  GA4 setup, Publisher Center submission, admin account, socials, DMCA/ScoreDetect, NAP,
  Phase 3 outreach channel decision.
- 🎯 **Business model clarified (2026-08-04, updated with Dan's actual playbook OP 3/3):**
  The Wall is a **wedge** — not a directory. Play: blast free-listing acknowledgment to
  every vendor (Weapon 1). Non-competitors reply yes fastest. Auto-flip on reply to a two-way
  affiliate deal: **they keep 20% of what they send us; we take 10% of what we send them.**
  Their side is bigger on purpose so signing takes 10 seconds. Expect ~10% of signed partners
  to actually send clients — those are the easiest deals we'll ever close. Memory:
  `thewall-partnership-playbook.md`.
- ✅ **Tier 2 pivot SHIPPED (commit ce43b... approx, 2026-08-04):**
  - `partner.html` — noindex landing page. **Rewritten v2 (commit after 81eedeb) to match
    two-way 10/20 playbook** — visual 10↔20 deal card as hero, terms collapsed to 4 bullets,
    one-click "I'm in" mailto. Public URL but excluded from sitemap.
  - `report/state-of-the-us-growth-vendor-market-2026.html` — 14-chapter compilation of the
    18 briefings, print CSS for save-as-PDF. Sendable as cold-email icebreaker.
  - `docs/cold-email-vendor-referral-pack.md` — **v2 rewrite matches Dan's playbook**:
    Weapon 1 (free-listing acknowledgment + 2 follow-ups max) + Weapon 2 (reply-triggered
    two-way affiliate flip). Reply-handling templates, co-marketing hooks, deliverability.
    Blast wide, not picky. Expected: 8-12% Weapon 1 replies → 70%+ Weapon 2 conversion → ~10%
    of signed partners send actual clients.
  - `docs/contact-enrichment-plan.md` — the missing piece: DB has no email column. Recommends
    Apollo + Apify combo (~$580 for 90-95% coverage). Needs Dan's green-light + Apollo signup.
  - Compare tool in atlas — checkbox per card, floating bar, side-by-side view.
  - Advanced filtering — rate band, team size, min, state, listing type. URL-synced.
- ⏭ **Sitemap: 2,353 URLs** (report added; partner deliberately excluded).
- ⏭ **Cold-email play kickoff sequence:**
  1. Dan approves contact-enrichment plan + signs up for Apollo
  2. Claude applies DB migration + runs Apollo enrichment (~1 week end-to-end)
  3. Dan sets up cold-email sending infrastructure (dedicated domain, warmed for 2-4 weeks)
  4. First 200-vendor batch of Sequence D (highest-fit) begins
- **Dan's checklist:** GSC + GA setup & sitemap submit (post-domain), social fortress accounts
  (X/LinkedIn/FB/YT → schema sameAs), DMCA badge account, ScoreDetect account, optional NAP
  address/phone for contact page.

## In flight RIGHT NOW (domain cutover — mostly DONE)

1. **Domain cutover to hitthewall.net — deployed 2026-08-03:**
   - PR #1 MERGED (squash commit `4d4b8a2`) — SITE constants flipped, all 2,286 pages rebuilt on
     hitthewall.net canonicals, CNAME file live. Pages shows `cname: hitthewall.net`, status built.
   - DNS CONFIRMED globally: authoritative (dns1.registrar-servers.com), Cloudflare 1.1.1.1, and
     Google 8.8.8.8 all return the 4 GitHub A records. Apex verified serving The Wall (HTTP 200,
     `curl --resolve hitthewall.net:80:185.199.108.153`). github.io and www both 301 → hitthewall.net.
   - **Gotcha:** some resolvers still cache Namecheap parking `162.255.119.20` (TTL lag, ≤~30 min) —
     symptom is a 404 with `X-Served-By: Namecheap URL Forward`. Harmless; expires on its own.
     `Clear-DnsClientCache` doesn't fix it (upstream resolver cache, not local).
   - **REMAINING:** cert state `approved` → waiting for `issued` (background poll armed, 90 min max).
     On issued: `gh api -X PUT repos/misspepperai/thewall-directory/pages -F https_enforced=true`,
     verify https end to end (homepage + /c/ page + sitemap.xml + www + github.io 301), re-stamp
     Wayback fingerprints on new-domain core URLs, update this log + memory, report to Dan.

## Session ledger

- Costs: ~$17 Apify total; mcp-scraper ~250 credits of 1.21M; heavy token day (flagged to Dan twice).
- Data journey: 175 seed → 1,417 → 2,006 → cull 668 non-US + 28 dead → +956 US → **2,286**.
- Key gotchas learned (also in Claude memory): Supabase blocks HTML on shared domains;
  sb_publishable keys fail writes; PostgREST upsert trips RLS (plain INSERT works); PostgREST
  1000-row response cap (paginate!); Clutch actor ignores ?page= params (use base URLs + high
  maxItems, its own pagination digs); Clutch country = ISO codes; Vercel MCP is project-scoped
  to pepper-os.

## Emergency restores

- Removed listings: scratchpad `nonus_backup.json` / `dead_backup*.json` — reinsert row + delete
  from `blocked_domains` first (trigger blocks otherwise).
- Static pages: fully regenerable — `node build-pages.mjs --pages-only` needs only the DB.
- The DB is the single source of truth for data; index.html is the single source for the Q&A engine.

## Tier 3 SHIPPED (2026-08-04, commit 2aaa9e2)

- 14 additional entity pages (29 total): Pipedrive, Zoho, ZoomInfo, Apollo.io, Instantly, Zapier,
  Make, Customer.io, Beehiiv, Substack, OpenAI/ChatGPT, Anthropic/Claude, Perplexity, Jasper.
- `badge/index.html` — "Featured in The Wall" embed kit. Vendor search → light/dark HTML +
  Markdown + text snippets, UTM-tagged reciprocal backlink.
- DB schema: `partners`, `referrals`, `referral_payments` + `partner_stats` view, admin-RLS.
- `export-outreach-csvs.mjs` — 4 segmented CSVs + pending-enrichment + suppressed. Ready for
  Instantly/Smartlead the moment enrichment lands. `.gitignore` excludes `exports/`.
- Contact enrichment BLOCKED on Dan's Apify actor rental (Teamwork task 48628058, $29/mo).
  All infra + probe input prepared; enrichment runs end-to-end in ~1 hour after "actor rented".

**Sitemap: 2,368 URLs.**

## Contact enrichment SHIPPED (2026-08-04)

- Actor: `pipelinelabs/lead-scraper-apollo-zoominfo-lusha-ppe` (**pay-per-event**, $0.001/lead, 250M+ verified contact DB).
- **Two passes, ~$7 total spend, 1,159 of 2,286 companies enriched (50.7%).**
- Pass 1 (strict — c_suite/owner/partner/vp/director × marketing/sales/bizdev × verified): 6,000 leads → 652 companies.
- Pass 2 (widened — added 'manager' seniority, dropped function filter, verified only): 1,396 leads → 507 new companies.
- Per-category coverage: Sales 77%, Demand Gen 63%, Thought Leadership 62%, Automation 56%, Marketing 53%, Content 50%, Social 50%, Creative 49%, SEO 32%, AI Marketing 18%.
- Data quality: verified deliverable emails, real names + titles + LinkedIn URLs + seniority. Bounce risk ~5% (industry standard for verified).
- Raw datasets cached: `scratchpad/apollo-raw-ifActaoKYij2PaFyz.json` + `-HIRkKMC6JSbHTZoTW.json`.
- Segment CSVs (`exports/`): A-marketing 291 rows, B-seo-content-social 174, C-creative 426, D-sales-auto-demand-ai-tl 268. `exports/` is gitignored (PII).
- `temp_anon_enrich` policy DROPPED (2026-08-04) — recreate before next enrichment pass.
- To lift coverage above 65%: pass 3 with `emailStatusIncludes: ['verified','unverified']` OR contract with a manual-verification service on the remaining 1,127 domains. Neither shipped yet.
- **Blocker for cold-email launch: Dan's sending-domain infrastructure warmup (2-4 weeks) + GSC verification.**

## Tier A shipped (2026-08-04, commit ac1cd2c)

**+128 new indexable URLs across 4 new sections. Sitemap now 2,497 URLs.**

- **`build-locations.mjs`** → `/states/{slug}.html` × 20 + `/cities/{slug}.html` × 15 + 2 indexes.
  Top-20 US states by vendor count (CA leads at 313, then NY, TX, FL). Top-15 metros
  (New York 105, Chicago, LA, San Francisco). Each page: category breakdown, top 15-20 firms per
  discipline, city breakdown within state, cross-link to atlas `?state=CA` deep-link.
  `CollectionPage` + `BreadcrumbList` + `ItemList` JSON-LD per page. Local-SEO play.

- **`build-compare.mjs`** → `/compare/{a-vs-b}.html` × 15 head-to-heads + 1 index.
  HubSpot vs Salesforce, Ahrefs vs Semrush, Apollo vs ZoomInfo, Beehiiv vs Substack,
  Outreach vs Salesloft, Zapier vs Make, Klaviyo vs Mailchimp, ChatGPT vs Claude,
  Marketo vs HubSpot, Google Ads vs Meta Ads, Segment vs RudderStack, LinkedIn Ads vs Meta Ads,
  ActiveCampaign vs HubSpot, Notion vs Airtable, Perplexity vs ChatGPT.
  Each: 6-part factbox per side, 7-dimension comparison table, verdict ("PICK A" / "PICK B") card,
  cross-links back to entity + pillar. `Article` + `SoftwareApplication` × 2 + `BreadcrumbList` JSON-LD.
  High-intent "X vs Y" queries — one of the highest-ROI SEO plays in software directories.

- **`build-questions.mjs`** → `/questions/{slug}.html` × 76 + index.
  PAA silo. Harvested via DataForSEO `serp_organic_live_advanced` (10 pillar seed keywords,
  `people_also_ask_click_depth: 4`). 92 raw PAA → 76 unique after dedup. Google-provided answers
  used where available (28); the other 48 answered editorially from the directory position.
  Each page: focused answer, "why this matters" section, 5 sibling questions in same pillar,
  cross-links to pillar. `FAQPage` + `BreadcrumbList` JSON-LD. Long-tail SEO play.

- **`build-pages.mjs`** — sitemap globs added for `/states/`, `/cities/`, `/compare/`, `/questions/`.
- **`index.html`** — footer OPERATIONS nav adds: Head-to-heads, Q&A silo, By state, By city.

**PAA data cached:** `scratchpad/paa-consolidated.json` (76 rows, all with answers). Rebuildable
via `node build-questions.mjs` without re-harvesting.

**Total site surface: 2,497 indexable URLs** — 2,286 c/{domain}.html + 21 news + 4 updates +
1 report + 2 badge + 10 pillars + 6 hubs + 30 entities + 21 states + 16 cities + 16 compare +
77 questions + trust/glossary/sitemap/root.

**Next AA moves (unstarted):** author-persona shift (Dan blocked), Phase 3 catalyst-content
outreach (blocked on Dan's Publisher Center + sending-domain), fresh-feed automation, monetization
layer (skipped per Dan — this is a referral engine, not a directory business).

## Tier B shipped (2026-08-04, commit 2406cc2)

**Phase 4 cadence upkeep — 4 new briefings + automated monthly briefing pipeline.**

**4 new briefings** (all real DB aggregates, no fabricated figures):
- `the-single-founder-tail-agencies-pre-2000-2026` — 182 pre-2000 survivors
- `seo-rate-spread-inside-one-discipline-2026` — SEO's $275 spread ($25→$300+)
- `sales-pillar-hourly-blackout-2026` — 0 of 103 US Sales firms disclose hourly
- `category-leaders-thirty-entities-2026` — 30 entity-reference platforms by pillar

**Total briefings: 22** (was 18) + 1 update + 1 report + 2 badge = 26 editorial URLs.

**Monthly briefing pipeline** (`generate-monthly-briefing.mjs`):
- Queries `directory_companies` for total, category, state, rate, listing_type breakdowns
- Baselines against `data/last-snapshot.json` — first run captures snapshot, subsequent runs
  diff (added/removed/category shifts)
- Drafts a code-block for `build-updates.mjs` at `data/draft-briefing-YYYY-MM.txt`
  (gitignored — ephemeral)
- **Runbook:** `node generate-monthly-briefing.mjs [YYYY-MM]` → review draft → paste into
  `build-updates.mjs` UPDATES array → edit the TODO editorial paragraph → `node build-updates.mjs`
  → `node build-pages.mjs --pages-only` → commit
- **Google News cadence:** 12 automated briefings/year minimum with no manual data pulls.
- **First-run baseline captured today (2026-08-04):** 2286 approved listings, 10 pillars, 47 states.

**Sitemap: 2,501 URLs.**

## Tier C shipped (2026-08-04, commit a2d14fd)

**Prep for the referral win-cycle — case-study template + interactive data explorer.**

**Case-study template** (`build-wins.mjs` + `/wins/`):
- WIN object with slug/date/client/partner/engagement/problem/solution/outcomes/quote/
  referralCredit/editorialNote fields. Fill and rebuild = published case study.
- `/wins/{slug}.html` template: kicker, headline, dek, meta date-line, two-side
  factbox (Client | Referring partner), problem, solution, 3–6 outcome cards
  with big-number values, blockquote, blue referral-economics call-out that
  publishes the partner's cut + first payout, editorial-note slot, standing
  "become a partner" CTA at bottom.
- `/wins/index.html` always renders — currently in "first wins in flight" state
  with copy about the referral network having launched today.
- Article + Organization + BreadcrumbList JSON-LD per win.
- **Publish path when first win arrives:** add entry to WINS array →
  `node build-wins.mjs` → `node build-pages.mjs --pages-only` → commit + push.
  30-minute publish time, not a week.

**Data corner** (`/data/index.html` — 303 lines, self-contained):
- Client-side single-page interactive explorer over all 2,286 approved US vendors.
- Loads via Supabase REST (anon JWT + status=approved filter, same public read
  pattern as index.html), no server. Live data, cache-friendly.
- **Filter dimensions (multi-select within, AND across):** pillar, listing type,
  rate band, team size, HQ state (top 15), founding decade. Each shows count in
  chip label. Clear-all button.
- **8 chart panels** (all pure CSS bars — no external libs):
  1. Composition by pillar
  2. Hourly-rate distribution (excludes undisclosed)
  3. Team-size distribution
  4. Minimum-project-size distribution
  5. Top 15 US states by count
  6. Top 15 US cities by count
  7. Founding-year distribution (decade cohorts)
  8. Listing-type composition (agency / software / business_services)
- Top stats bar (5 counters): matching firms, with-rate, with-team, distinct
  states, distinct cities. All respect active filters. Recompute in browser.
- **Per-chart CITE button** copies a citation string with the active filter
  context and access-date auto-embedded. Journalist-first design.
- `Dataset` + `BreadcrumbList` JSON-LD (schema-org Dataset type — helps Google
  Dataset Search find it).

**Wired both into sitemap** (build-pages.mjs) + footer nav (index.html).
**Sitemap now 2,503 URLs.**

**When first Miss Pepper referral win lands:** publish takes 30 min not a week.
**When a journalist wants a stat:** they cite the Data Corner not a competitor.

## Tier D shipped (2026-08-04, commit 4e2430e)

**Category × State programmatic (83 pages) + Press page + 2 syndication-ready releases.**

**`/find/` — category × state programmatic** (`build-find.mjs`):
- 83 pages combining 7 commercially-searched pillars × top 20 US states
- Skips (pillar, state) combos with < 3 in-state vendors
- Pillar slug map matches actual buyer search phrases:
  - Marketing → `marketing-agencies`
  - SEO → `seo-agencies`
  - Creative Strategy → `creative-agencies`
  - Content Marketing → `content-marketing-agencies`
  - Social Media Marketing → `social-media-marketing-agencies`
  - Thought Leadership → `pr-agencies` (search-term match)
  - Automation → `marketing-automation-services`
- Each page: kicker, statline (count / modal rate / disclosure rate), full vendor
  table with rate + city, in-state city clustering breakdown, editorial "how to
  read a state-scoped shortlist" section, cross-links to pillar / state / atlas
  filter deep-link (`?cat=X&state=Y`)
- `CollectionPage` + `BreadcrumbList` + `ItemList` JSON-LD per page
- `/find/index.html` grouped by category, states ordered by vendor count

**`/press.html` — media kit** (single root file):
- Positioning one-liner (ink-black call-out card)
- 8-tile key-stats grid (2,286 vendors / 10 pillars / 47 states / etc.)
- What The Wall is / what it isn't
- Publisher (Miss Pepper AI) + byline (Editorial Team) + editorial policy +
  AI disclosure + independence disclosure
- Data licensing terms + canonical citation string (free with attribution)
- "Available for comment" topic list (6 domains) with 24-hour turnaround pledge
- Editorial-resources index (report + 22 briefings + Data Corner + entities + compare)
- Downloadable assets (SVG favicon, badge kit) + press contact + "recent coverage" placeholder
- `Organization` + `BreadcrumbList` JSON-LD

**`docs/press-releases/` — syndication-ready** (Markdown, submission-safe):
- `01-launch-2026-08.md` — launch announcement, Dan quote, boilerplate
- `02-reference-library-2026-08.md` — reference-library expansion (send T+10)
- Both formatted for OpenPR / PRLog / PR.com free-tier submission

**Sitemap: 2,588 URLs.** Footer nav adds "Find by state" and "Press & media".
