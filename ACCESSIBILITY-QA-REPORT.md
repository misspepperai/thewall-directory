# Accessibility QA — The Wall (hitthewall.net)

**Standard:** WCAG 2.1 Level AA
**Scope:** 2,591 built HTML files on disk
**Date:** 2026-08-05
**Re-run:** `node audit-a11y.mjs`

**What this audit is.** It checks what is decidable from static markup and the design tokens. It
does not claim WCAG coverage in full — several criteria need a human at a browser, and those are
listed as outstanding rather than counted as passes. No conformance claim should be made on the
strength of this document alone.

---

## Result

| Check | WCAG | Before | After |
|---|---|---|---|
| Skip-to-content link | 2.4.1 A | **0 of 2,591** | **2,591 of 2,591** |
| Form controls with an accessible name | 1.3.1 / 3.3.2 A | 14 unnamed | **0** |
| Images with alt | 1.1.1 A | 0 missing | **0 missing** |
| Exactly one H1 | 1.3.1 A | 1 page with two | **0** |
| No skipped heading levels | 1.3.1 A | 20 pages | **0** |
| `lang` on `<html>` | 3.1.1 A | 0 missing | **0 missing** |
| Link purpose from link text | 2.4.4 A | 0 vague, 0 empty | **0** |
| No positive `tabindex` | 2.4.3 A | 0 | **0** |
| ARIA references resolve | 4.1.2 A | 0 broken | **0 broken** |
| `<main>` landmark present | 1.3.1 A | 0 missing | **0 missing** |
| Visible focus indicator | 2.4.7 AA | inconsistent | declared site-wide |
| Text contrast | 1.4.3 AA | all pairs pass | all pairs pass |
| Images with intrinsic dimensions | 1.4.10 / CLS | 2,286 without | **0** |

Remaining flag: 2 duplicate page titles (2.4.2), caused by two duplicate vendor records. Tracked in
`CANNIBALIZATION-REPORT.md` — it needs a data decision, not a markup fix.

---

## What was fixed

### Skip-to-content link — was missing from every page (Level A)

Every page opens with the same masthead and navigation. Without a bypass, a keyboard or screen
reader user tabbed the entire menu on all 2,591 pages before reaching content.

Added by `inject-a11y.mjs`, a post-processor in the same managed-block pattern as `inject-og.mjs`.
Deliberately **not** in `nav.js`: a skip link that depends on JavaScript is missing exactly when
the page is degraded and the user most needs it.

Implementation details that matter:

- The link is positioned off-screen and returns on `:focus` — never `display:none` or
  `visibility:hidden`, either of which removes it from the tab order and defeats the purpose.
- Its target carries `tabindex="-1"` so activating it **moves focus**, not just the scroll
  position. Without that, the next Tab press returns to the top of the nav.
- The anchor is checked against a real element id on every page.

### Fourteen form controls had no accessible name (Level A)

Six on the public homepage (the submit-a-listing modal), eight on the admin console. The markup was
`<label>NAME</label><input>` — a label that neither wraps its control nor carries `for=""` is a
caption; nothing associates it, and a screen reader announces the field unnamed. A placeholder is
not an accessible name.

All labels are now associated by `for`/`id`. The two fields with no visible label by design — the
atlas search box and the admin filter — carry `aria-label`.

### Twenty pages skipped a heading level (Level A)

Card headings on index pages were `<h3>` sitting directly under the `<h1>`, so a user navigating
by heading hears a missing level. Promoted to `<h2>` in the six builders that emit them. No visual
change: the styling is carried by the `.catcell` / `.faq-item` / `.rel` classes, not the tag.

### `admin.html` had two H1s

The sign-in panel and the listings console are two states of one page, not two documents. The
console heading is now an `<h2>`.

### 2,286 images had no intrinsic dimensions

Vendor logos were sized only in CSS, so the heading and everything below it shifted when each
logo arrived. `width`/`height` now match the CSS box.

---

## Contrast — computed from the design tokens

Every pair below is one the stylesheets actually use, with the component it appears in. All pass
the 4.5:1 threshold for normal text.

| Ratio | Pair | Where |
|---|---|---|
| 16.31:1 | `--ink` on `--porcelain` | headings and body on the page background |
| 15.06:1 | `--ink` on `--stone-lt` | card headings on tinted panels |
| 13.41:1 | `--ink` on `--stone` | table header text |
| 11.16:1 | `--oxblood` on `--porcelain` | warnings, removed-listing notes |
| 9.17:1 | `--body` on `--porcelain` | paragraph text |
| 8.47:1 | `--body` on `--stone-lt` | card body on tinted panels |
| 6.32:1 | `--cobalt` on `--porcelain` | links and accents |
| 5.84:1 | `--cobalt` on `--stone-lt` | links inside tinted panels |
| 4.95:1 | `--chrome` on `--porcelain` | meta lines, kickers, footnotes |
| 4.88:1 | `--chrome-dk` on `--ink` | compare-bar labels (its only use) |
| 4.57:1 | `--chrome` on `--stone-lt` | card meta on tinted panels |

**A correction worth recording.** The first version of this audit tested an exhaustive
foreground × background matrix and reported `--chrome-dk` on `--stone` at 2.75:1 as an AA failure.
That combination appears nowhere in the CSS. `--chrome-dk` is used in exactly one component, the
compare bar, whose background is `--ink`, where it measures 4.88:1 and passes. The audit now tests
only pairs that exist, each annotated with where it is used, because reporting failures for pairs
that do not exist trains people to ignore the report.

The two lowest pairs (4.57:1 and 4.88:1) clear the threshold with little margin. If the palette is
ever adjusted, re-run this check before shipping.

---

## Outstanding — needs a human at a browser

These cannot be settled from markup and are **not** claimed as passing:

1. **Focus order matches visual order** (2.4.3) — keyboard pass required.
2. **No keyboard traps** (2.1.2) — keyboard pass required, especially the submit-listing modal
   and the compare bar.
3. **Reflow at 200% zoom / 320px** (1.4.10) — browser at width required. The wide data tables in
   `news/` and `data/` are the likeliest failure point.
4. **Alt text accuracy** (1.1.1) — presence is verified on all 2,313 images; whether each
   description is *correct* is a human judgement.
5. **Reduced motion** (2.3.3) — the `prefers-reduced-motion` guard is present on all 2,591 pages;
   confirm visually that it actually suppresses the transitions.

Browser-based verification was not possible in this environment: Puppeteer's Chrome is missing
`libnss3`. Installing it would let items 1-3 and 5 be automated.

---

## Conformance statement

**None is issued.** The markup-level Level A and AA criteria testable from static HTML all pass,
but five criteria above remain unverified. A conformance claim requires those to be checked first.
