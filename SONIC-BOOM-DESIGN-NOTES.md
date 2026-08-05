# Sonic Boom — Design Notes

*Stage 3.5. Applied 2026-08-04 to `index.html` (homepage) and `nav.js` (tracking).*
*Reads `BRAND-BRIEF.md`, `STYLE-GUIDE.md`, `MOTION-PROFILE.md`.*

---

## The audit finding that drove everything

**The homepage had no buyer conversion path at all.**

Before this stage, every call-to-action on the page pointed at vendors: a dark referral
strip above the headline, a partner CTA at the bottom, and "Submit a listing" in the nav.
The brief's target customer — a COO or RevOps lead with a $50k–$500k external services
budget who has hit a specific wall — arrived, browsed an alphabetical index, and left with
no next step offered.

That is a conversion failure and a brand failure at the same time. The brief's target
feeling for the first ten seconds is *"finally, someone isn't selling me,"* and the first
thing on the page was a revenue-share pitch.

Score against the Sonic Boom rubric before this stage: **48/100.** After: **81/100.**
Full breakdown at the bottom.

---

## Where the standard playbook was followed

**The 6-section scroll arc is now complete and in order.** It was missing sections 2 and 6.

| # | Section | What carries it |
|---|---|---|
| 1 | **Hook** | Hero — "Hit a wall? Find who gets you over it." Outcome, not feature. |
| 2 | **Problem** | **NEW** — the buyer's actual fear, stated in their words, then answered structurally. |
| 3 | **Proof** | Evidence band (Stage 3) — 2,286 indexed, 696 removed, 1,440 rates, $0 for placement. |
| 4 | **Solution** | The atlas itself. The product is the proof. |
| 5 | **Evidence** | Rate distribution chart (Stage 3) — the number nobody else publishes. |
| 6 | **Action** | **NEW** — four buyer paths, ordered by how far along the buyer is. |

**Proof placed before solution**, per the playbook's reversal. The evidence band sits above
the atlas, so the reader knows the ordering means nothing before they read the ordering.

**Buyer action precedes vendor action.** The action band sits above the partner CTA. Both
audiences get a close; the one the brief names as the target customer gets it first.

**Friction reduced to zero.** No form, no gate, no email capture anywhere on the homepage —
and that fact is now stated on the page, because for this audience the absence *is* the
offer.

**Trust closer at the decision moment**, immediately under the action cards: nothing here
is a recommendation, and corrections are made in public with a link to the policy.

---

## Where the playbook was refused, and why

Sonic Boom is written for local service businesses selling a call. This site sells nothing
to the person reading it. Several standard patterns are not neutral here — they would
actively destroy the asset. Each refusal traces to a named anti-position in `BRAND-BRIEF.md`
§6 or a line in `STYLE-GUIDE.md` §7.

| Standard pattern | Refused because |
|---|---|
| **Sticky mobile phone CTA** | There is no phone number and no sales call to book. A floating button with nowhere to go is the SaaS tell the brief bans, and it would cover the data at the density this site runs. |
| **Trust badge row** (★4.9, BBB, certifications) | Badge and star iconography is *forbidden* — it is the exact visual grammar of the pay-to-play listicle this brand refutes. The trust chips that exist are text, no marks. |
| **Numerical proof in a counter animation** | Pillar 1 holds that numbers are evidence, not rhetoric. Counting a figure up from zero converts a sourced fact into a flourish. `MOTION-PROFILE.md` bans it explicitly. |
| **Featured testimonial with photo** | There are no customers to quote. Fabricating or soliciting one would break pillar 1 on the page whose entire job is proving pillar 1. |
| **Press mentions band** | Zero backlinks today. A "featured in" row would be a lie. It goes up the day it is true. |
| **Pain points as a 2×2 icon grid** | Listicle convention plus decorative icons — two bans. The same content ships as one editorial pull-quote and three paragraphs, which is denser and reads as analysis rather than a landing page. |
| **Named proprietary method** ("The Wall Standard™") | The brief's positioning is that the method is *published and reproducible*, not branded. Trademarking the methodology would undercut "every aggregate is reproducible from the live directory." |
| **Reveal-on-scroll / hover lift / card shadows** | `MOTION-PROFILE.md` is `motion_enabled: false`. Cards get a 1px border and a background shift on hover — affordance, not motion design. |
| **"At least one unexpected accent colour"** | The palette was cut to a single accent in Stage 2 *because* the validator failed the multi-hue version. Adding an unexpected hue would re-break a fixed accessibility defect. |

**The pattern behind the refusals:** every one of them is a way of *asserting* trust. This
brand's entire mechanism is that it *demonstrates* trust instead — by publishing what it
removed, admitting what it doesn't know, and refusing the money. Bolting on assertion
patterns would read as a directory protesting its independence, which is what the paid ones
do.

---

## What shipped

### Section 2 — Problem
Two columns. Left: the buyer's fear as a pull-quote in Newsreader italic against an oxblood
rule — *"I'm going to pick from a list somebody paid to be on, overpay by 40%, and not find
out for six months."* Right: three paragraphs naming the mechanism (sponsored tiers, paid
badges, reorderable Top-10s), then the structural answer, then an honest boundary — *"you
can trust the ordering means nothing, and read the data instead."*

The claim is deliberately narrow. The brand does not promise good vendors; it promises an
uncorrupted index. Overclaiming here would be the first crack.

### Section 6 — Action band
Four cards on a 1px hairline grid, ordered by buyer stage rather than by what The Wall wants:

| Buyer job | Destination | Live count |
|---|---|---|
| You have a quote | `tools/rate-benchmark.html` | checked against 1,440 published rates |
| You're down to two | `compare/` | 15 comparisons |
| You want local | `find/` | 83 shortlists |
| You're still scoping | `hubs/` | 6 buyer guides |

Every count is read off disk, not asserted — the validator recomputes all three from
`readdirSync` and fails the build if the page drifts.

Closer: *"No form, no gate, no sales call."* Plus the corrections link.

### Tracking — `buyer_path_click`
New GA4 event on the action cards, firing `buyer_job` and `path_destination`.

This is the only signal on the site that reveals **why** a buyer came. The homepage
deliberately asks them nothing, so the card they choose is the answer. Within a few weeks
the distribution across those four jobs decides which of the three unbuilt hubs gets built —
that decision is currently being made on instinct.

Verified by executing the handler in jsdom, not by reading it:
`{"buyer_job":"You have a quote","path_destination":"tools/rate-benchmark.html"}`

---

## Validation

24/24 automated checks pass (`scratchpad/s35check.mjs`), covering:

- all six arc sections present, and in order
- buyer action band precedes the vendor CTA
- every new link resolves to a file that exists on disk
- the three stated counts equal the actual directory contents
- no soft gradients (the one `linear-gradient` on the site is a 2px masthead rule with hard
  stops — a segmented fill, asserted to be used only at 1–2px height)
- no icon library, no reveal-on-scroll classes, no email input, no sticky bottom CTA
- `prefers-reduced-motion` guard intact

---

## Score

| Rubric line | Before | After | Note |
|---|---:|---:|---|
| Above-fold clarity | 12/15 | 14/15 | Hero was already strong; removing the vendor pitch above it cleared the read. |
| Trust signal placement | 6/15 | 14/15 | Evidence band + on-page source lines + corrections link at the close. |
| Scroll-telling structure | 5/15 | 14/15 | Sections 2 and 6 added; proof moved ahead of solution. |
| Mobile conversion patterns | 7/15 | 10/15 | Responsive down to 1 column. Capped deliberately — sticky CTA and click-to-call don't apply. |
| Anti-generic design | 13/15 | 14/15 | Was already the site's strength. |
| Form / CTA friction | 3/15 | 13/15 | Buyer had no CTA at all. Now four, all zero-commitment. |
| Niche-specific patterns | 2/10 | 2/10 | **Unchanged — see below.** |
| **Total** | **48/100** | **81/100** | |

**The 19 points not taken are a deliberate stop, not an oversight.** Reaching 100 on this
rubric requires testimonials, badges, press logos, a named method and a sticky CTA. Every
one of those is banned by the brief, and three of them would require inventing facts. A
directory that scores 100 on a local-services conversion rubric is a directory that has
started selling — which is the exact thing this brand exists to refute.

The remaining honest lift is not on this page. It is the zero-backlink problem: the
conversion path now works, and almost nobody can reach it.
