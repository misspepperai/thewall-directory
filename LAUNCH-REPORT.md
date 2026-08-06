# Launch Report — The Wall (hitthewall.net)

**Date:** 2026-08-05
**Pipeline:** sonic-build, Stage 6 closed
**Status:** live, indexed-submitted, no known blockers

---

## What shipped

| | |
|---|---|
| HTML files built | 2,591 |
| Vendor listings | 2,286 |
| URLs in `sitemap.xml` | 2,581 |
| Internal links | 57,430 |
| Images | 2,313 |
| Distinct page titles | 2,589 |

Tiers: listing 2,286 · find 84 · question 76 · entity 30 · news 25 · state 21 · core 17 ·
city 16 · compare 16 · pillar 11 · hub 7.

---

## Gate results

Every check reads built HTML on disk — the bytes that ship, not the builders' intent.

| Check | Result |
|---|---|
| `check-html` | 2,591 files, 0 problems |
| `audit-seo` | 0 critical — 0 broken links, 0 missing canonical, 0 orphans, 0 JSON-LD parse errors |
| `audit-a11y` | 0 markup findings, 11/11 contrast pairs pass |
| `audit-cannibal` | 0 HIGH · 8 resolved by canonical · 3 verified distinct |
| `audit-aitell` | 0 content-level tells across 30,203 words |
| `check-parity` | 2,286 match · 0 mismatch |

Lighthouse 13.4.0, live, desktop:

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| Homepage | 93 | 100 (86 before this session's fixes) | 100 | 100 |
| Listing template | 98 | 100 | 100 | 100 |

Homepage LCP 1.24s / CLS 0.012. Listing LCP 0.90s / CLS 0.001. Both well inside Core Web Vitals.

---

## What this session changed

**1. Sitemap contradiction.** Three `questions/` URLs asked to be indexed while their pages
canonical elsewhere. Fixed generally: `build-pages.mjs` reads the canonical back out of each built
file and drops any page pointing elsewhere. That covers every builder, including ones written
later, instead of copying one builder's map into another.

**2. Three accessibility defects a static audit could not see.** A browser found what file-reading
could not:

- Five unlabelled `<select>` in the atlas filter bar, plus five more in the admin row editor
  (1.3.1 / 3.3.2, **Level A**) — the markup is built by JavaScript and never exists on disk.
- `.dial-hub small` at 2.81:1 against `--cobalt` (1.4.3, **Level AA**) — a translucent white over a
  *state* colour, so a token-pair matrix never formed the pair.
- 34 footer tap targets at 21.3px (2.5.8, WCAG 2.2 — outside our 2.1 bar, fixed anyway).

`audit-a11y.mjs` now scans inline script bodies as well, understanding both wrapping and
`for`-linked labels. It is a heuristic and is commented as one.

**3. IndexNow resubmitted** — 2,581 URLs, HTTP 200. The previous run predated the canonical
consolidation, 1,372 corrected meta tags and 808 corrected titles, so Bing/Yandex/Seznam/Naver were
holding a stale copy until now.

---

## Honest limits

Three things are **not** verified, and none should be described as passing:

1. **Two pages fail mobile Core Web Vitals.** Homepage (LCP 4.8s, CLS 0.352) and `data/`
   (CLS 0.312). Every other template passes comfortably — the listing template, 2,286 of the
   2,591 pages, posts 518ms LCP and 0.022 CLS. Causes are diagnosed in `SEO-QA-REPORT.md`; the
   fix is a decision about type loading, not a bug fix.
2. **One WCAG criterion still needs a human** — alt-text accuracy (1.1.1). The four behavioural
   criteria that needed a browser now pass, verified by `audit-browser.mjs` on six pages.
   **No conformance statement is issued yet**, but it is one sign-off away rather than five.
3. **Cannibalization is a structural prediction, not an observation.** The site has no ranking
   history. Live detection is post-launch monitoring against Search Console data.

Two content gaps remain open, both logged rather than fixed: four tools named in comparison copy
(Airtable, Notion, RudderStack, Salesloft) have no entity page behind them, and the em-dash density
across the written pages (13.7 per 1,000 words) is an editorial voice call that was deliberately
not made unilaterally.

---

## Next actions

1. **Confirm the sitemap is submitted in Search Console** — the property is verified, but Google
   does not participate in IndexNow, so the sitemap is its only discovery signal besides links.
2. **Decide the type-loading strategy** — the one open item behind both Core Web Vitals failures.
3. **Sample the alt text** and sign off, which is all that stands between here and a defensible
   WCAG 2.1 AA conformance statement.
4. **Post-launch monitoring** — cannibalization becomes observable once Search Console has query
   data. Re-run `audit-cannibal.mjs` against real rankings rather than structure.
