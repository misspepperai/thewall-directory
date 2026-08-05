# SEO QA — The Wall (hitthewall.net)

**Scope:** 2,591 built HTML files on disk — the bytes GitHub Pages serves, not the builders' intent.
**Date:** 2026-08-05
**Re-run:** `node audit-seo.mjs` (add `--json` for the full record). Exits non-zero on any broken internal link.

Every check below was run against the shipped HTML. Two of the four defects found this pass were
invisible in the builder source and only appeared in the output.

---

## Result

| | Before | After |
|---|---|---|
| Broken internal links | **60** | **0** |
| Pages with a corrupted meta tag | **1,372** | **0** |
| Duplicate meta descriptions | 52 groups (263 pages) | **0** |
| Duplicate titles | 2 pairs | **0** |
| Missing title / description / H1 | 1 | **0** |
| Multiple H1s | 1 | **0** |
| Missing canonical | 1 | **0** |
| Pages with no schema | 3 | **0** |
| Heading-level skips | 20 | **0** |
| Orphan pages | 1 | **0** |
| Images without alt | 0 | **0** |
| Pages without og:image / twitter card | 0 | **0** |
| JSON-LD that fails to parse | 0 | **0** |

Indexable pages: 2,589. Deliberately noindex: `admin.html` (private console), `partner.html`.

---

## Critical defects found and fixed

### 1. Sixty internal links pointed at pages that were never built

46 published pages linked to `pillars/marketing-automation.html`, `pillars/sales-automation.html`,
`pillars/analytics-attribution.html`, `pillars/social-media.html`, `pillars/paid-advertising.html`
and nine `entities/*` URLs. All returned the GitHub Pages 404. Nothing reported it.

**Root cause — two taxonomies.** The directory layer's ten disciplines are the vendor database's
`category` values: a pillar page exists because vendors are filed under it, so the set cannot be
extended without vendors to fill it. The editorial layer (questions, comparisons) was written
against the topic names buyers actually type. Five editorial topics had no matching pillar slug.

**Fix.** `slugs.mjs` is now the single place the two taxonomies reconcile, and link emission goes
through it. Three of the five mappings are exact renames; two are judgement calls, recorded in the
file so they are easy to revisit:

| editorial topic | resolves to | basis |
|---|---|---|
| `social-media` | `social-media-marketing` | rename |
| `marketing-automation` | `automation` | rename |
| `sales-automation` | `automation` | the firms doing this work are filed under Automation, not Sales |
| `paid-advertising` | `demand-gen` | Demand Gen is where paid-acquisition vendors sit |
| `analytics-attribution` | `marketing` | no measurement discipline exists; Marketing is broadest |

Anchor text now follows the destination. Rewriting only the href would have shipped links reading
"Sales Automation pillar" that land on a page titled Automation.

Four tools named in comparison copy — Airtable, Notion, RudderStack, Salesloft — have no entity
page. They now render as plain text rather than 404 links, and are listed in `ENTITY_MISSING` in
`slugs.mjs` as a content backlog item.

**Prevention:** `audit-seo.mjs` exits non-zero on any unresolvable internal link.

### 2. A JavaScript replacement-pattern bug corrupted meta tags on 1,372 pages

`inject-og.mjs` inserted its block with `html.replace(re, "$1\n" + block)`. In `String.replace`,
`$1` inside the *replacement string* is a backreference. Descriptions on this site quote prices —
`$1,500–$10,000+` — so `$1` was substituted with capture group 1, splicing the page's canonical
`<link>` tag into the middle of its own `og:description`:

```
<meta property="og:description" content="US Google Ads agency fees typically run <link rel="canonical" href="...">,500–...
```

Fixed with a replacement *function*, which takes its return value literally.

### 3. Double-escaped ampersands on 808 pages

The same post-processor read title and description back out of rendered HTML — already escaped —
and escaped them again, so `Eberly &amp; Collard` shipped as `Eberly &amp;amp; Collard` and
rendered as a literal `&amp;`. Values are now decoded to plain text and escaped exactly once.
The same defect in scraped body prose is fixed in the shared engine's `plain()`.

### 4. `badge/index.html` had a meta description that ended after four words

Raw double quotes inside a double-quoted attribute:

```
content="Grab the "Featured in The Wall" badge to display on your site."
```

A parser ends the attribute at the second quote, so the description a crawler read was
`Grab the `. Escaped as `&quot;`. The page also had no structured data; it now carries WebPage +
BreadcrumbList.

### 5. "Undisclosed" was being published as a fact on 1,264 pages

`Undisclosed` is Clutch's placeholder for a value a firm declined to give, stored verbatim in
`avg_hourly_rate` and `min_project_size`. Treated as present, it produced copy reading
*"an average rate band of Undisclosed"* and *"Minimum project Undisclosed"*.

The shared engine's `has()` now treats a set of placeholder strings as absent, so every downstream
clause, fact row and meta description inherits the fix at once. **Zero remaining.**

### 6. Meta descriptions were category templates

`description` is a category boilerplate — six firms shared *"Branding and identity agency based in
Chicago, IL."* — leaving 52 groups of byte-identical descriptions and 591 pages under 100
characters. Descriptions are now composed from each record's own stored columns (rate band,
minimum, team size, founding year, Clutch rating), appending whole clauses only. Every value is
read from the database; nothing is inferred or written. **52 duplicate groups → 0.**

### 7. Titles ran to 134 characters

Some vendors' stored `name` is a tagline. The overflow cut the discipline and the brand suffix —
the parts that tell a searcher which listing this is. The name is now shortened at its first
sentence or separator boundary.

---

## Resolved — duplicate vendor records

Five companies were listed twice under two domains, producing two byte-identical title pairs.
Consolidated **by canonical, not by merge** (operator decision, 2026-08-05): no records were
deleted, both URLs stay live, and the duplicate points search engines at the survivor. The
duplicate is excluded from `sitemap.xml`, and the breadcrumb leaf and `og:url` follow the canonical
so nothing on the page contradicts it.

Three further pairs the screen flagged were verified as **different companies that share a name**
and left alone — including `superpath.co` / `superpath.com`, which was on the merge shortlist until
the source records showed a content-marketing community and an SEO agency. Detail in
`CANNIBALIZATION-REPORT.md`.

Listing count unchanged at 2,286. Sitemap URLs: 2,584.

## Advisory — reported, not enforced

| Finding | Count | Assessment |
|---|---|---|
| Title over 70 chars | 78 | Now almost entirely editorial headlines in `news/`. Rewriting a headline to fit a SERP is a content decision, not a mechanical one. |
| Title under 30 chars | 37 | Short vendor names (`AdRoll — Ad Tech \| The Wall`). Accurate and unique; padding them would add nothing. |
| Description over 175 chars | 64 | Tail is trimmed at a clause boundary; the informative part is in the first 155. |
| Description under 100 chars | 496 | Firms with no published enrichment. 257 are 90-99 chars. Each is unique and factual — the alternative is invented filler. |

---

## Structured data

`Organization` 2,586 · `BreadcrumbList` 2,570 · `FAQPage` 2,407 · `WebPage` 2,288 ·
`ProfessionalService` 2,040 · `SoftwareApplication` 275 · `CollectionPage` 130 · `NewsArticle` 23 ·
`Article` 21 · `Dataset` 1 · `DefinedTermSet` 1 · `WebSite` 1 · `Report` 1 · `WebApplication` 1

All parse. All JSON-LD serialization sites escape `<` as `<` — see the structural note below.

## Sitemap

`sitemap.xml` is generated by `build-pages.mjs` on every run, so it regenerates with the site
rather than going stale. `sitemap.html` is the human-readable equivalent. Both were corrected this
pass to strip `index.html` from directory URLs, which had been disagreeing with the canonicals.

Canonicalised duplicates are excluded from `sitemap.xml`: a sitemap lists URLs asking to be
indexed, and those pages are explicitly asking not to be. 2,584 URLs from 2,589 indexable pages —
the five vendor duplicates. The three canonicalised `questions/` URLs are still listed; the
questions builder writes its own pages and does not feed this sitemap. Worth aligning on a later pass.

---

## Structural integrity — `check-html.mjs`

New and permanent. Inside a `<script>` element the HTML parser is not reading JavaScript; it scans
for the characters that close the tag, and knows nothing of strings or comments. A closing script
tag anywhere in a script body silently ends the element and dumps the rest of the file into the DOM
as text. The page still returns 200.

This bit twice this pass: three vendor records carried scraped markup containing one (destroying
`hugeinc.com`, `loom.com`, `obviouslee.com` — no `<main>`, no `<h1>`, served 200), and the code
comment written to document *that* quoted the tag literally and took the homepage atlas down.

`check-html.mjs` parses every inline script and every JSON-LD block on all 2,591 pages.
**2,591 files, 0 problems.**

## AI-tell audit

Not run this pass. The copy on this site is composed from stored database values by template rather
than generated prose, so the usual AI tells are not the failure mode here — publishing a
placeholder as a fact is, and that is defect 5 above. Worth a sample pass over the `news/` and
`hubs/` long-form pages, which are the only genuinely written surfaces.

## Not covered

Search Console, analytics, backlinks and press distribution are out of scope by instruction.
