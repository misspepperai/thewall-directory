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
| Flagged | 134 |
| **Confirmed same-intent** | **9** |
| Judged distinct (false positives) | 125 |
| **Fixed this pass** | **3** |
| **Open — needs your decision** | **6** |

Tiers: listing 2,286 · find 84 · question 76 · entity 30 · news 25 · state 21 · core 17 ·
city 16 · compare 16 · pillar 11 · hub 7

---

## Fixed — three duplicate questions consolidated

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

## Open — six duplicate vendor records

One company listed twice under two domains. Both pages target the same brand query, so they do
genuinely compete. **Resolving these means deleting or merging database records, so nothing has
been changed.** Recommended survivor in bold.

| # | Pair | Evidence they are one company | Recommendation |
|---|---|---|---|
| 1 | **`flowninja.com`** / `flow.ninja` | Byte-identical titles. `flowninja.com` carries the HQ and phone; `flow.ninja` has neither. | Merge into `flowninja.com` |
| 2 | **`qck.co`** / `fun.qck.co` | Byte-identical titles. `fun.qck.co` is a subdomain of the other. | Merge into `qck.co` |
| 3 | **`interodigital.com`** / `getresults.interodigital.com` | Same name, one is a subdomain of the other. | Merge into `interodigital.com` |
| 4 | **`victorious.com`** / `victoriousseo.com` | Both "Victorious". `victorious.com` carries San Francisco HQ and phone. | Merge into `victorious.com` |
| 5 | **`elevmarketing.com`** / `elevationb2b.com` | Both "Elevation Marketing". `elevmarketing.com` carries Littleton CO and phone. | Merge into `elevmarketing.com` |
| 6 | **`superpath.com`** / `superpath.co` | Both "Superpath". `superpath.com` carries HQ and phone. | Merge into `superpath.com` — **verify first**, the two are filed under different subcategories (Content Community vs SEO Agency), which may mean two products rather than two domains. |

Merging costs one listing each: **2,286 → 2,280**.

If you would rather not remove records, the alternative is a canonical from the weaker domain to
the stronger. That keeps the count but tells search engines to index only one — most of the SEO
benefit, none of the data loss. Say which and I will apply it.

### Two pairs the screen flagged that are NOT duplicates

Checked against source records and rejected — recorded so they are not re-raised:

- `agencyelevation.com` ("Agency Elevation", Freedom WI) and `elevationweb.org` ("Elevation",
  Washington DC) — different names, cities and phone numbers.
- `clay.com` ("Clay", sales data and intelligence) and `clay.global` ("Clay", San Francisco design
  studio) — two companies that share a name.

---

## Judged distinct — 125 pairs

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
