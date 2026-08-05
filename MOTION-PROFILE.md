# Motion Profile — The Wall

```yaml
motion_enabled: false
mood: subtle
scope: functional_feedback_only
scroll_behavior: none
elements: []
library: none
library_version: null
weight_estimate_kb: 0
performance_target: lighthouse_95plus
decided: 2026-08-04
decided_by: inferred_from_brand_brief
```

## The decision: no animation library, no scroll reveals

`motion_enabled: false` is a deliberate brand decision, not a skipped stage. **Do not enqueue
anime.js.** Stage 3 builds without an animation library.

### Why

1. **Reveal-on-scroll is the SaaS-marketing tell.** `BRAND-BRIEF.md` names "not a SaaS
   marketing site" as an explicit anti-position. Fade-up-on-scroll is the single most
   recognisable signature of that genre.
2. **The vibe references have none.** Bloomberg, Reuters, Consumer Reports and Wirecutter
   ship essentially zero decorative motion. Density and speed *are* the aesthetic.
3. **It fights all three audiences.** Executives scanning for a rate band, journalists
   hunting a citable stat, and crawlers all want content present on load. Content that
   materialises on scroll is slower to scan and worse to Ctrl+F.
4. **Animated counters contradict pillar 1.** The brief holds that numbers are *evidence*,
   not rhetoric. Counting a figure up from zero makes it perform — it converts a sourced fact
   into a flourish. Wrong register for this brand.
5. **The brief's own words:** "unhurried," "quietly confident," "warmth from typography and
   restraint, never decoration."

## What DOES move — functional feedback, already implemented in CSS

These are interface affordances, not motion design. They stay, and they need no library:

| Interaction | Behaviour | Why it earns its place |
|---|---|---|
| Link / button hover | Colour transition, cobalt → oxblood | Affordance. Tells you it's clickable. |
| Nav dropdown | Open on hover (desktop) / tap (mobile) | Required for the control to work at all. |
| Q&A accordion | Native `<details>` open/close | Browser-native disclosure. |
| Compare bar | Slides in when ≥1 vendor selected | **Communicates a state change** the user caused. |
| Atlas filter | Card set repaints on filter change | Feedback that the query was applied. |

The distinction that governs any future addition:

> **Motion may communicate a state change the user caused. It may not decorate content that
> was always there.**

## Accessibility

Add this guard to the theme regardless — it costs nothing and covers the CSS transitions
above for visitors who opt out:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## If this is reversed

Should the operator want motion later, the brand-compatible subset is narrow:

- **Allowed:** opacity-only fade on *route change* in the atlas SPA (state change, ≤120ms);
  a 2px underline draw on nav hover.
- **Still forbidden regardless of mood setting:** scroll-triggered reveals, counter
  animations, staggered card entrances, hero text letter-reveal, parallax, CTA scale/glow.
  Each one contradicts a named anti-position.

Re-run `/sonic-agent:sonic-motion` to change this, and archive this file to
`MOTION-PROFILE.previous.md` first.

## Hand-off to Stage 3

- **Do not** enqueue anime.js or create `sonic-motion.js`.
- **Do not** add `.sonic-fade-on-scroll`, `.sonic-stagger-children`, `.sonic-counter`, or
  `.sonic-cta-hover` classes to generated HTML.
- **Do** add the `prefers-reduced-motion` block above to the shared CSS in all 12
  `build-*.mjs` shells and `index.html`.
- Performance upside: 0KB of animation JS on 2,588 pages.
