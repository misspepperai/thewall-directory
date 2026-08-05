# Build order

Run in this sequence. The two injectors are post-processors — any `build-*.mjs` run
overwrites the HTML they touch, so they must follow, not lead.

```bash
node build-pages.mjs      # + the other 11 build-*.mjs as needed
node build-og.mjs         # share cards   (local, sharp+pango, no API, ~100s for 2,286)
node build-art.mjs        # section art   (gpt-image-2; skips anything already on disk)
node inject-og.mjs        # og:image + twitter meta on all 2,590 pages
node inject-art.mjs       # mastheads on the 26 section pages + web derivatives
node submit-indexnow.mjs  # notify Bing/Yandex/Seznam/Naver
```

Both injectors are idempotent — they strip their managed block before rewriting it, so
re-running never stacks duplicates. Verify without writing:

```bash
node inject-og.mjs --check
node inject-art.mjs --check
```

## Where imagery is and is not allowed

`build-og.mjs` cards carry figures, so every figure is computed from the live directory and
every card carries a source line. The renderer throws if a card declares stats without one.

`build-art.mjs` output is generated, so it carries no figures and never sits beside one.
`data/`, `report/`, `tools/` and `c/` are on a FORBIDDEN list that `inject-art.mjs` asserts at
startup — adding a route into one of them fails the build rather than shipping quietly.

## QA checks (Stage 6)

These read the built HTML on disk — the bytes that ship, not the builders' intent. Every defect
found in the 2026-08-05 pass that was invisible in the source showed up here.

```bash
node check-html.mjs        # inline scripts + JSON-LD parse; catches early <script> termination
node audit-seo.mjs         # titles, meta, schema, links, orphans. EXITS 1 ON A BROKEN LINK
node audit-a11y.mjs        # WCAG 2.1 AA, markup-decidable checks + contrast of real token pairs
node audit-cannibal.mjs    # structural cannibalization screen (prediction, not observation)
node check-parity.mjs --all  # atlas detail vs static page, all 2,286 records
```

`inject-a11y.mjs` joins the post-processors and follows the builders like the other two:

```bash
node inject-og.mjs
node inject-art.mjs
node inject-a11y.mjs      # skip-to-content link + focus styles, all 2,591 pages
```

Reports: `SEO-QA-REPORT.md`, `ACCESSIBILITY-QA-REPORT.md`, `CANNIBALIZATION-REPORT.md`.
