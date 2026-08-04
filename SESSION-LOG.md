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
- ⏭ **Next:** Phase 3 catalyst distribution (the briefings are seed data studies — outreach and
  roundup pitching starts now); Phase 5 monetization (claimed listings). Additional hubs from
  keyword pipeline: paid-advertising-platforms, b2b-marketing-agency, digital-marketing-platform-
  for-small-businesses.
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
