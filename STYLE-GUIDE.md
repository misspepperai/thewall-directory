# STYLE GUIDE — The Wall

*Stage 2 output. Referenced by `frontend-design`, the 12 `build-*.mjs` templates, and every
chart. Derived from `BRAND-BRIEF.md` — every choice traces to a pillar.*
*Created 2026-08-04. All colour claims validated by script, not by eye.*

---

## Verdict on the existing system: KEEP, with two evidence-based fixes

The site already had a palette and type stack chosen before any brief existed. Tested against
the brief rather than replaced on principle — **it holds up.** Newsreader on warm off-white
with IBM Plex Mono data labels *is* the correct answer to "Bloomberg's density, Consumer
Reports' independence, none of the coldness." Replacing it would have been change for the
sake of completing a stage.

Two things genuinely failed and are fixed below: a site-wide contrast failure, and a
categorical chart palette that is not distinguishable.

---

## 1. Colour Palette

### Core (unchanged — validated as correct for the brief)

| Token | Hex | Role | Why |
|---|---|---|---|
| `--porcelain` | `#FAF9F6` | Page ground | Warm off-white, not `#FFF`. **This is where warmth comes from** — pillar: not a corporate database. |
| `--stone` | `#E7E3DA` | Borders, rules | Warm neutral. Keeps density from reading as a spreadsheet grid. |
| `--stone-lt` | `#F2F0EA` | Fills, zebra | Section separation without boxes. |
| `--ink` | `#0E1B33` | Headlines | Near-black with navy cast. 16.3:1 on porcelain. |
| `--body` | `#3B4557` | Body copy | Slate, not black. 9.2:1. Long-form readable at density. |
| `--cobalt` | `#1B4FD8` | Primary / links | 6.3:1. Confident, not decorative. |
| `--oxblood` | `#6E1423` | Editorial accent | 11.2:1. Section kickers, rules. Newspaper-of-record signal. |

### 🔴 FIX 1 — `--chrome` fails WCAG AA site-wide

`#85898F` scores **3.34:1** on porcelain. It carries every mono label, kicker, footer and
data caption at 8.5–9px — small text, which requires 4.5:1. This is a real accessibility
failure on all 2,588 pages and Stage 6 would have flagged it.

**The token had to split.** `--chrome` is used on *both* porcelain and ink grounds. A single
value cannot serve both: darkening it to pass on light backgrounds makes it fail on dark ones
(`#686D75` on ink scores only 3.30:1). Two tokens:

| Token | Hex | Ground | Ratio | |
|---|---|---|---|---|
| `--chrome` | **`#686D75`** | porcelain | **4.95:1** | ✅ |
| `--chrome` | `#686D75` | stone-lt | **4.57:1** | ✅ |
| `--chrome-dk` | `#85898F` | ink | **4.88:1** | ✅ |

`#686D75` is the *lightest* value in the same cool-neutral family that clears AA on light
grounds — chosen deliberately so the muted character survives; anything darker starts
competing with body copy. `--chrome-dk` keeps the original value, which already passed on
ink, so dark bars are visually unchanged.

**Applied 2026-08-04** across all 12 build scripts, `index.html`, and the 7 hand-written
pages. All 2,601 HTML files verified on the new tokens; zero remaining on the failing value.

### Semantic

| Token | Hex | Use |
|---|---|---|
| `--good` | `#15803D` | Verified, disclosed, live |
| `--warn` | `#A16207` | Unverified, stale, missing data |
| `--bad` | `#B91C1C` | Removed, dead, failed check |

Reserved. **Never reused as a chart series.** Always ship with an icon or word — never
colour alone.

---

## 2. Typography (unchanged — it was already right)

| Role | Font | Reasoning |
|---|---|---|
| **Display** | **Newsreader** 600 | Editorial serif. Carries authority without corporate coldness — the single biggest reason this doesn't read as a records portal. |
| **Body** | **IBM Plex Sans** 400/500/600 | Neutral, high legibility at 13–15px. Holds up at the density the brief demands. |
| **Data / labels** | **IBM Plex Mono** 500/600, uppercase, `.12–.16em` tracking | Tabular alignment for figures. The terminal register that signals Bloomberg. |

**Why the pairing works here:** the serif says *published*, the mono says *computed*. Together
they state the brand's core claim — editorial judgement applied to real data — before a word
is read. Plex Sans mediates so the two never collide.

**Rules**
- Numbers always Mono, always tabular. A figure in the serif reads as rhetoric, not data.
- Source lines and refresh dates set in Mono at `--chrome`, adjacent to the claim. Pillar 3:
  show the work — visible on the page, never behind a link.
- Never set body copy in the serif. It's for headlines and pull-quotes only.

---

## 3. Data Visualisation

Per Stage 1, **charts are this brand's on-page imagery.** So the palette is load-bearing, and
it was broken.

### 🔴 FIX 2 — the 10 pillar colours are not distinguishable

The existing per-category colours (`build-pages.mjs`) are six near-identical blues plus two
reds and two greys. Run through the validator, **4 of 5 checks fail**:

```
[FAIL] Chroma floor       #0E1B33, #5A6472, #43506B, #3B4C7A read as grey
[FAIL] CVD separation     worst #3B4C7A↔#274690 ΔE 4.9 (protan)
[FAIL] Normal-vision      worst ΔE 5.0 — hard to tell apart even with full colour vision
```

`#1B4FD8` Marketing, `#4A6BD8` Content Marketing and `#16389B` SEO are effectively the same
colour. Any chart encoding pillar by hue is unreadable.

### The resolution: colour was the wrong tool

Testing every size, the honest ceiling under all-pairs CVD is:

| Series | Result |
|---|---|
| **3** | ✅ clean pass — worst pair ΔE 13.2 CVD / 25.0 normal |
| 4 | ⚠️ pass with WARN (ΔE 7.1) — legal *only* with direct labels or texture |
| 5+ | ❌ fail |

**Ten distinguishable categorical hues do not exist.** But the site doesn't need them —
because "vendors per pillar" is a **magnitude** question, not an identity one. The form
heuristic answers it: a sorted single-hue bar chart with direct labels, not ten colours.

### Palette

**Categorical — max 3 series, fixed order, never cycled:**

| Slot | Hex | |
|---|---|---|
| 1 | `#1B4FD8` | cobalt (ties to brand primary) |
| 2 | `#C2410C` | rust |
| 3 | `#0E9384` | teal |

A 4th series folds into "Other," facets into small multiples, or the chart becomes sequential.

**Sequential (magnitude — the default for pillar/state/city counts):** single cobalt ramp,
light→dark, sorted by value, direct-labelled. This is the correct form for almost every chart
on this site.

**Diverging (above/below a benchmark — e.g. rate vs category median):** `#C2410C` ← `#E7E3DA`
neutral → `#1B4FD8`. Never a hue at the midpoint.

### Chart rules
- Text wears text tokens (`--ink`, `--body`, `--chrome`) — **never the series colour**.
- Grid and axes recessive: `--stone`, 1px. Data is the loudest thing on screen.
- 2px surface gap between adjacent fills; 4px rounded data-ends anchored to baseline.
- Legend whenever ≥2 series; ≤4 series also direct-labelled. Identity is never colour-alone.
- Every chart has a table view. Every chart carries its source line and access date.
- **Never a dual-axis chart.** Two measures → two charts or index to a common base.

### Per-category page accent — retired

The 10 pillar hues were also used as a per-page accent on `/c/` pages. Retired: if six of them
are indistinguishable, the accent communicates nothing. **Category identity is carried by
type** — the mono kicker already states `AUTOMATION / EMAIL & LIFECYCLE`. Single accent
`--cobalt` throughout. Consistent with the brief: warmth and hierarchy from typography and
restraint, never decoration.

---

## 4. Image Style

Two surfaces, two rules (per the Stage 1 operator decision — tooling is GPT Image 2 / Kie).

### On-page, in the content well: **no generated imagery**
Charts and tables only, computed from the live directory. A generated photograph sitting
beside a sourced number is an unsourceable claim — it undercuts pillar 1 rather than
decorating it.

### Off-page, distribution surfaces: **generate** (OG cards, social, press kit)
These are how the site travels — the current binding constraint is zero backlinks, and a
briefing with no share card loses reach.

- **Type:** typographic/data-led composition. The headline figure set in Newsreader over
  porcelain, with a mono source line. Effectively a poster of the finding.
- **Photography:** avoid entirely. If ever unavoidable — documentary, available light,
  desaturated, no eye contact with camera.
- **Avoid absolutely:** smiling stock teams · handshakes · glowing-blue "AI" abstractions ·
  gradient meshes · skyscraper-at-dusk · anything implying an office The Wall doesn't have.
- **Prompt prefix for all generated assets:**
  > *Editorial poster composition, warm off-white paper ground (#FAF9F6), deep navy ink
  > (#0E1B33), single cobalt accent (#1B4FD8). Typographic and data-led — no photography, no
  > people, no gradients, no 3D. Restrained newspaper-of-record aesthetic. Generous margins,
  > one dominant figure.*

---

## 5. Iconography

**Near-zero.** Icons are a listicle convention and the primary anti-position.

- **Allowed:** directional arrows (`→ ↗`), the `+/–` accordion mark, external-link glyph.
  Text characters, not an icon library.
- **Not used:** Lucide/Heroicons/Font Awesome decorative sets, category pictograms, "feature"
  icons, badge/shield/star marks of any kind.
- **Size ceiling:** 20px UI, 24px inline. **Nothing above 24px anywhere.** This site has no
  hero icons, no service-card icons, no illustrative spots.
- Rank/award/star iconography is **forbidden** — it's the exact visual grammar of the
  pay-to-play listicle the brand refutes.

---

## 6. Mood Board

| Reference | Take this | Not this |
|---|---|---|
| **Consumer Reports / Wirecutter** | Independence stated constantly; methodology as a feature; "we take no money" repeated without embarrassment | Consumer-y warmth, product beauty shots |
| **Bloomberg / Reuters** | Information density as respect for the reader; mono figures; terminal tables | Terminal darkness, ticker chrome, urgency |
| **The Economist** (secondary) | Serif authority; charts as the article's spine; confident restraint | Illustration, wit, cover art |
| **Existing site** | The porcelain/Newsreader/Plex-Mono base — already correct | The 10-colour category accent (retired above) |

---

## 7. Don't-Do List

- ❌ **Pure white `#FFFFFF` page ground** — kills the paper warmth that separates this from a records portal
- ❌ **Adding whitespace to feel premium** — density is a virtue here; the reader wants more per screen
- ❌ **Any badge, star, shield, ribbon, "Top 10," "Featured," or rank numeral**
- ❌ **Gradient anything** — hero, button, card, text
- ❌ **Generated photography in the content well**
- ❌ **A number without a source line beside it**
- ❌ **Colour as the sole carrier of meaning** — always a label or word too
- ❌ **`--chrome` on anything below 12px** even at the new value — use `--body`
- ❌ **More than 3 categorical series in one chart** — facet or go sequential
- ❌ **Dual-axis charts** — two scales, two charts
- ❌ **Sentence-case mono labels** — mono is uppercase + tracked, or it isn't mono
- ❌ **Rounded corners above 10px** — soft cards read SaaS
- ❌ **Drop shadows for depth** — 1px `--stone` borders instead

---

## Implementation notes (hand-off to Stage 3)

1. `--chrome: #85898F` → `#686D75` in **all 12 `build-*.mjs` files**, `index.html`, and
   `nav.js`. Site-wide accessibility fix; regenerate all 2,588 pages.
2. Retire the `COLORS` category map in `build-pages.mjs`; single `--cobalt` accent.
3. Data Corner charts re-palette to the 3-hue categorical + cobalt sequential ramp.
4. No dark mode currently exists. If added later, re-validate every palette against the dark
   surface — an automatic inversion is not a dark theme.
