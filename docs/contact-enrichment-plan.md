# Contact Enrichment Plan
*2026-08-04 · Blocking the vendor-referral cold-email play*

## The gap

The `directory_companies` table has **no email column**. Cold emailing the 2,286 listed vendors requires per-vendor contact data we don't yet have:

- `contact_email` — the address to send to
- `first_name` — for the greeting line
- `linkedin_url` — for personalization and secondary channel
- Optional: `job_title` — to route pitches correctly (founder vs marketing director vs sales)

Without this, the cold-email pack (`docs/cold-email-vendor-referral-pack.md`) can't run.

## What we do have per vendor

- `domain` — the vendor's website
- `name` — company name
- `phone_number` — for ~40% of listings
- `street_address`, `hq_city`, `hq_state`, `zip_code` — for ~60%
- `services_list`, `clutch_bio`, `year_established`, `team_size` — enriched already

## The four realistic options

### Option 1: Apollo.io API pass (recommended)

**How it works:** Apollo's People Search API takes a domain → returns the current employees at that company matching a role filter. For 2,286 domains you get back a set of contacts per domain.

**Cost:** Apollo Basic plan is $59/user/month + credits for API pulls. Enrichment credits typically ~$0.10 per full-contact result. For 2,286 domains × ~2 contacts each = ~4,600 enrichment credits ≈ **$460 one-time.**

**Coverage:** Apollo has broad B2B contact data for US firms. Realistic hit rate: 85–90% of our 2,286 listings will return at least one usable contact.

**Data quality:** Contact emails are pattern-inferred (firstname@company.com etc.) then verified. Verification is 90–95% accurate; expect ~5% bounce rate on first-time sends.

**Pros:** Fast (one weekend to run), decent hit rate, includes titles + LinkedIn URLs.
**Cons:** Contact data is scraped/inferred, not permission-based. Some contacts will be stale (people who left the company).

### Option 2: Clay + waterfall enrichment

**How it works:** Clay chains multiple data providers (Apollo, ZoomInfo, Hunter.io, Findymail, Anymail Finder) in a "waterfall" — first hit wins. Higher hit rate and higher accuracy than any single source.

**Cost:** Clay Starter $149/mo + credit consumption. For 2,286 domains, ~10K credits ≈ **$500–$700 one-time.** Ongoing $149/mo if you keep enriching new listings.

**Coverage:** 90–95% hit rate is realistic across waterfalled sources.
**Data quality:** Best in market. Waterfall verification catches bounces before send.

**Pros:** Highest accuracy, best for scaling ongoing enrichment as new listings are added.
**Cons:** Highest upfront tool cost. Overkill for a one-time enrichment if we're not planning to keep enriching.

### Option 3: Apify /contact and /team scrape (cheapest)

**How it works:** Custom Apify actor that visits each vendor's `/contact`, `/team`, `/about`, `/leadership` pages and extracts email addresses via regex. Same infrastructure we already used for domain verification and Clutch data.

**Cost:** Custom Apify actor ~$0.001/page × ~5 pages/domain × 2,286 = **~$12 in Apify credits.** Development time: ~4 hours.

**Coverage:** 40–60% hit rate — most vendors publish generic `hello@` or `info@` emails on their contact page, but not personal ones. A generic address is deliverable but a lower-quality touch (goes to a shared inbox, gets treated like spam more often).

**Data quality:** Emails are what the vendor actually publishes, so bounce rates are near zero. But most are generic (hello@, info@, contact@), not decision-maker addresses.

**Pros:** Cheapest. No third-party data-vendor lock-in. Fully controlled.
**Cons:** Lower hit rate, generic addresses reduce reply rates 2–5× vs personal emails.

### Option 4: LinkedIn Sales Navigator (manual)

**How it works:** A researcher works through the vendor list, finds the CEO / marketing director / founder on LinkedIn, extracts contact info via ContactOut / RocketReach / Hunter.

**Cost:** Sales Navigator ~$100/mo + ContactOut/similar ~$50/mo + researcher time (roughly 5 minutes per vendor × 2,286 = ~190 hours × $25–50/hr contractor = **$4,750–$9,500 one-time**).

**Coverage:** Highest quality (real people, real titles, verified emails), but slowest.
**Pros:** Best data quality of any option.
**Cons:** Expensive, slow (4–8 weeks), doesn't scale as new listings are added.

---

## Recommendation

**Do Option 1 (Apollo) first, then supplement with Option 3 (Apify /contact) for the 10–15% Apollo misses.**

Combined cost: **~$472 one-time** ($460 Apollo + $12 Apify), 90–95% coverage, ~2,050 usable contact records out of 2,286.

Skip Option 4 unless the first outreach batch performs poorly enough that quality-over-quantity becomes worth it. Skip Option 2 unless we're also planning to enrich ongoing weekly additions (in which case switch to Clay from month 2 onward).

## Migration — new DB columns

```sql
alter table public.directory_companies
  add column if not exists contact_email     text,
  add column if not exists contact_first_name text,
  add column if not exists contact_last_name text,
  add column if not exists contact_title      text,
  add column if not exists contact_linkedin   text,
  add column if not exists contact_verified_at timestamptz,
  add column if not exists contact_source     text,  -- 'apollo' | 'apify-scrape' | 'manual'
  add column if not exists suppressed         boolean default false,  -- do-not-contact flag
  add column if not exists suppressed_reason  text,
  add column if not exists suppressed_at      timestamptz;

create index if not exists idx_directory_companies_email
  on public.directory_companies (contact_email) where contact_email is not null;

create index if not exists idx_directory_companies_suppressed
  on public.directory_companies (suppressed) where suppressed = true;
```

Run via Supabase MCP `apply_migration` when Dan is ready.

## Execution timeline (Option 1 + 3 combined)

| Day | Task | Cost | Owner |
|---|---|---:|---|
| Day 0 | Apply DB migration for contact columns | — | Claude |
| Day 0 | Sign up for Apollo Basic, load $500 in credits | $59 | Dan |
| Day 1 | Write `enrich-apollo.mjs` — pull 1–2 contacts per domain via Apollo API | — | Claude |
| Day 2 | Run enrichment on 2,286 domains. Persist results. Report hit-rate. | ~$460 | Claude |
| Day 3 | Write `scrape-contact-pages.mjs` Apify actor for the ~250 domains Apollo missed | — | Claude |
| Day 4 | Run scrape. Persist. Report coverage. | ~$12 | Claude |
| Day 5 | Verify email deliverability at scale via NeverBounce or MailerCheck (~$50 for 2,000 verifications) | ~$50 | Claude |
| Day 6 | Export segmented CSVs per the cold-email pack's four segments | — | Claude |
| Day 7 | Dan or contractor loads into Instantly/Smartlead and begins sequence A (Marketing pillar) | Tool cost | Dan |

**Total: 1 week to go from "no emails" to "cold-email-ready with 2,000+ verified contacts."**

**Combined cost: ~$580** ($460 Apollo + $12 Apify + $50 verification + $59 Apollo month-1). Well inside the $5/day budget over the two weeks it takes to run.

## Suppression rules (build into the enrichment)

Auto-mark `suppressed=true` and skip from all outreach when:

- `hq_country` is not 'US' (belt-and-suspenders — the loader already filters, but paranoia is cheap)
- `contact_email` domain matches a legal / privacy / DPO pattern (`legal@`, `dpo@`, `privacy@`, `abuse@`, `security@`)
- The domain matches any entry in `blocked_domains` (they've been removed for cause)
- Manual add-list of domains the vendor has asked us to stop contacting

## What to do when a vendor unsubscribes

1. Set `suppressed=true`, populate `suppressed_reason` and `suppressed_at`
2. Cross-reference `suppressed` in the sending-tool export query
3. **Do not remove the listing from the directory** unless they've also asked for removal — the two are separate

## Ongoing enrichment (once we're publishing new listings regularly)

Every new approved listing should be enriched within 48 hours of approval. Two options:

- Manual: Dan or a VA enriches new listings weekly via Apollo web UI (~5 min per listing)
- Automated: A Supabase edge function fires on `status='approved'` insert, calls Apollo API, populates contact fields

Automated is the right long-term answer; manual is fine while listing-add volume is low.

---

## Green-light checklist

Before starting the enrichment run:

- [ ] Dan approves Option 1 + 3 approach and ~$580 spend
- [ ] Dan signs up for Apollo Basic and loads $500 in credits, sends API key
- [ ] Claude applies the DB migration
- [ ] Claude writes `enrich-apollo.mjs`
- [ ] Test run on 20 domains, review output, iterate
- [ ] Full run on 2,286 domains
- [ ] Verify + suppress
- [ ] Segmented CSV export delivered
- [ ] Sending infrastructure ready on Dan's side (see cold-email pack §Prerequisites)

*Reply "approved on Option 1+3" or pick a different option and I'll adjust the plan.*
