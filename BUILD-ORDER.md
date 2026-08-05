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
