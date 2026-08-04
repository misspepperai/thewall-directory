# The Wall Directory — Build Log & Resume State

*Last updated: 2026-08-03 (end of build session 1). This file is the canonical resume point —
read it fully before continuing work in a fresh session.*

**Live site:** https://misspepperai.github.io/thewall-directory/ (cutover to **hitthewall.net** in flight — see "In flight" below)
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
- ⏭ **Next:** authorship decision (recommended: single curator/editor persona, Calvin-Whitlock-style,
  light per directory profile — Dan hasn't answered), then **aa-google-news** (Phase 1 master gate,
  unblocked once domain live), then Phase 2 topical (category glossary/entity pages into the static
  pipeline), Phase 3 catalyst, Phase 5 monetization (claimed listings = "listing upgrades").
- **Dan's checklist:** GSC + GA setup & sitemap submit (post-domain), social fortress accounts
  (X/LinkedIn/FB/YT → schema sameAs), DMCA badge account, ScoreDetect account, optional NAP
  address/phone for contact page.

## In flight RIGHT NOW (session end state)

1. **Domain cutover to hitthewall.net** (bought at Namecheap, DNS records being set by Dan):
   - Required records: A @ → 185.199.108.153 / .109.153 / .110.153 / .111.153; CNAME www →
     misspepperai.github.io. (As of last check: still Namecheap parking 162.255.119.20.)
   - **PR #1 open:** https://github.com/misspepperai/thewall-directory/pull/1 — branch
     `domain-retrofit` holds the ENTIRE cutover (SITE constants flipped, all pages rebuilt on
     hitthewall.net, CNAME file). **Merging the PR = deploying the domain binding. Do not merge
     before DNS resolves to GitHub IPs.**
   - **DNS watcher armed** in session (Monitor task): fires when nslookup shows 185.199.*.
   - **On DNS live:** merge PR #1 → confirm Pages custom domain (gh api repos/misspepperai/
     thewall-directory/pages shows cname) → wait for cert → enforce HTTPS (`gh api -X PUT ...
     -F https_enforced=true`) → verify https://hitthewall.net end to end → re-stamp Wayback on new
     URLs → update this log + memory. Old github.io URLs 301 automatically.
2. **main branch** still serves github.io version — correct until merge.

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
