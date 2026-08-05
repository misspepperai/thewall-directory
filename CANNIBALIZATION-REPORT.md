# Cannibalization Screen — The Wall (hitthewall.net)

**Scope:** 2,589 indexable pages
**Date:** 2026-08-05
**Re-run:** `node audit-cannibal.mjs` (`--json` for the full record)

**What this is.** A structural prediction made at delivery. The site has no ranking history, so
nothing here is evidence that two URLs are actually competing for a query — that is post-launch
monitoring against real search data. What this checks is whether the architecture held: each tier
is supposed to own a distinct slice of intent, and this looks for pages that have drifted onto the
same job.

All pairs were screened in code. Only the resulting shortlist was judged.

---

## Result

| | |
|---|---|
| Pages scanned | 2,589 |
| Pairs screened | 14,777 lexical, plus identity screens on 2,386 grid and listing pages |
| Confirmed same-intent | 8 |
| **Resolved by canonical** | **8** |
| Verified distinct (same name, different companies) | 3 |
| Judged distinct (false positives) | 123 |
| **HIGH severity remaining** | **0** |

Tiers: listing 2,286 · find 84 · question 76 · entity 30 · news 25 · state 21 · core 17 ·
city 16 · compare 16 · pillar 11 · hub 7

---

## Resolved — three duplicate questions consolidated

Each pair is one question asked twice. Both URLs stay published: they are real phrasings people
search, and unpublishing a live URL trades a duplicate for a 404. The duplicate self-canonicals to
the survivor, so the pair consolidates onto one URL while both keep working.

| Duplicate | Canonicals to | Evidence |
|---|---|---|
| `what-skills-do-you-need-for-marketing-automation` | `what-skills-are-needed-for-marketing-automation` | byte-identical meta description |
| `what-is-the-5-5-5-rule-on-social-media` | `what-is-the-5-5-5-rule-for-social-media` | differ by one preposition |
| `is-it-worth-it-to-hire-a-marketing-agency` | `is-a-marketing-agency-worth-it` | same argument, 428 vs 432 chars |

Merging the underlying rows in `data/paa-consolidated.json` is the cleaner long-term fix. Canonical
is the correct move for a static host with no redirect layer.

---

## Resolved — five duplicate vendor records consolidated by canonical

One company listed twice under two domains. Both URLs targeted the same brand query, splitting its
signals. Per operator decision (2026-08-05), these were consolidated **by canonical rather than by
merge** — no records were deleted.

Both pages stay published and working; the duplicate tells search engines to index the survivor
instead. The survivor is the domain carrying the HQ and phone number, or the parent of a subdomain.
The duplicate is also excluded from `sitemap.xml`, since a sitemap is a list of URLs asking to be
indexed and this one is explicitly asking not to be. The breadcrumb leaf and `og:url` follow the
canonical, so nothing on the page contradicts it.

| # | Duplicate | Canonicals to | Basis |
|---|---|---|---|
| 1 | `flow.ninja` | `flowninja.com` | identical titles; survivor carries HQ and phone |
| 2 | `fun.qck.co` | `qck.co` | identical titles; duplicate is a subdomain of the survivor |
| 3 | `getresults.interodigital.com` | `interodigital.com` | same name; duplicate is a subdomain |
| 4 | `victoriousseo.com` | `victorious.com` | both "Victorious"; survivor carries San Francisco HQ and phone |
| 5 | `elevationb2b.com` | `elevmarketing.com` | both "Elevation Marketing"; survivor carries Littleton CO and phone |

The map lives in the shared engine block in `index.html` and is consumed by `build-pages.mjs`, so
the atlas and the static page cannot disagree about which URL is canonical. Fully reversible:
delete an entry from `CANONICAL_OF` and rebuild.

Listing count is unchanged at **2,286**. Sitemap URLs: 2,584.

### Three pairs verified as different companies — not duplicates

Checked against source records on name, city, phone and business description. Recorded in
`VERIFIED_DISTINCT` in `audit-cannibal.mjs` so they stop flagging on every run.

| Pair | Why they are distinct |
|---|---|
| `agencyelevation.com` / `elevationweb.org` | "Agency Elevation" (Freedom, WI) vs "Elevation" (Washington, DC) — different names, cities and phone numbers |
| `superpath.co` / `superpath.com` | A content-marketing **community** vs an **SEO agency** for home-services businesses in West Bloomfield, MI — different categories, different listing types, different copy |
| `clay.com` / `clay.global` | Sales data and intelligence platform vs a San Francisco design studio |

`superpath` was flagged for verification in the first draft of this report and the check changed
the outcome: it was on the merge shortlist, and merging it would have removed a real listing.

## Judged distinct — 123 pairs

**Comparisons (103).** Pairs sharing one product: `google-ads-vs-meta-ads` and
`linkedin-ads-vs-meta-ads`. Each targets its own "X vs Y" query. A shared entity is the format, not
a collision.

**Entities (9).** Two different tool pages sharing template vocabulary. Each owns its product name.

**Questions (11).** Distinct questions sharing a topic — `what-is-sales-automation` and
`what-is-an-example-of-sales-automation` are different queries with different answers.

**Hubs (1).** `b2b-marketing-agency` and `marketing-consultant` — adjacent, distinct jobs.

---

## Two screening corrections worth recording

The first two runs of this screen produced 47,338 and then 3,855 flags. Both numbers were wrong,
in ways that matter for anyone re-running it.

**Listings cannot be screened lexically.** A listing's primary keyword is the vendor's own brand
name — the query is navigational, and every listing owns a different brand. Their titles all share
the shape `{Name} — {Subcategory} | The Wall`, so a token screen flagged every pair of web-design
agencies in the country. The real risk in this tier is a duplicate *company*, which is now checked
on identity rather than vocabulary.

**Grid tiers cannot be screened lexically either.** `find/`, `states/` and `cities/` are
programmatic category × geography pages. A shared template *is* the design, so whole-string overlap
flagged 3,217 of the 3,486 possible `find/` pairs. What actually competes is two URLs resolving to
the same category and geography, including token reorderings ("roof repair tampa" / "tampa roof
repair"). The slug carries that keyword exactly, so it is compared directly. **Zero collisions
found** — the grid is clean.

Two smaller fixes: the tokenizer was discarding numerals, so `5-5-5 rule` and `50-30-20 rule`
both reduced to `rule` and scored a perfect title match; and HIGH severity now requires agreement
from both title and body overlap, because title tokens alone promoted "what does a Google Ads
agency do" and "which Google Ads agency is the best" to HIGH on a body overlap of 0.06.

---

## Standing rules for this site

- One primary keyword per page; no two pages on a tier share one.
- The exact-match internal anchor for a keyword points at one page, site-wide. `slugs.mjs` is now
  the single place link targets resolve, which enforces this for pillar and entity anchors.
- Never fix by stripping keywords into vagueness — differentiate toward each page's real job.

Post-launch, ranking-based detection — two URLs trading places for one query in live search data —
is a monitoring job, not a delivery-time check. This report does not attempt it.
