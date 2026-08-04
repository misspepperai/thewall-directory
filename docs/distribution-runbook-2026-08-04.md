# Distribution runbook — fixing the zero-backlink problem

**Verified 2026-08-04 via DataForSEO: `hitthewall.net` has ZERO backlinks.**

That is the binding constraint, not page count. A 2-day-old domain with no external
signal will not get 2,588 URLs crawled deeply on any useful timeline. Until links exist:
no crawl → no index → no vendor traffic → nothing for the claim CTA to convert.

Nothing in this runbook is content creation. It is all last-mile delivery of things that
are already built and sitting unused.

---

## ✅ DONE — IndexNow (2,588 URLs, accepted HTTP 200)

Key `b04f72ccaa73fcf7c56cfc1d09ca564e`, file live at the site root, all 2,588 sitemap URLs
submitted and accepted.

Notifies **Bing, Yandex, Seznam, Naver** directly — these engines crawl on notification
rather than requiring authority signals first, so this sidesteps the backlink problem
entirely for them. **Google does not participate in IndexNow**; Google discovery still
depends on the GSC sitemap plus real links, which is what the rest of this document is for.

Re-run after any build that adds URLs:

```bash
node submit-indexnow.mjs                     # everything
node submit-indexnow.mjs --since 2026-08-10  # only URLs changed since a date
```

---

## ⚠️ BLOCKER — verify the press-release dateline before submitting

Both press releases carried the dateline **`AUSTIN, TX`**. There is **no address anywhere on
the site**, no NAP was ever supplied, and I could not verify it — so it appears to have been
invented in an earlier session. I have replaced it with `[CITY, STATE]` in both files.

This matters more here than it normally would. The Wall's entire pitch is *"we publish what we
can verify and we don't publish what we can't."* A fabricated dateline in the launch
announcement, sent to journalists, is the one error that discredits the whole positioning —
and press releases are permanently archived and syndicated.

**Fill in the real city and state before submitting either release.**

---

## Task 1 — Press release syndication (~20 min, free, real backlinks)

Two releases are written and submission-ready in `docs/press-releases/`:

| File | Send when |
|---|---|
| `01-launch-2026-08.md` | Now |
| `02-reference-library-2026-08.md` | T+10 days (dated Aug 14) |

Free tiers, in priority order. Submit the launch release to **all three** — syndication
overlap is the point, and each gives a followed or unfollowed link plus indexable brand
mentions:

1. **OpenPR** — <https://www.openpr.com> — free, fast approval, reliably indexed.
   Headline must be ≤100 characters; the release is already written to that limit.
2. **PRLog** — <https://www.prlog.org> — free, allows links in the body.
3. **PR.com** — <https://www.pr.com> — free tier, slower editorial review.

Each needs an account (email + confirm). Budget ~7 minutes per site the first time.

**Before submitting, confirm these are still accurate** — they were computed on 2026-08-03
and are stated as fact in the release:
- 2,286 vendors · 22 briefings · 1,440 firms disclosing an hourly rate · 69.5% at $100–199
- 696 removed pre-launch (668 non-US, 28 dead)

Re-run the aggregates if more than a couple of weeks pass before you send.

---

## Task 2 — HARO / journalist response (~15 min/day, highest-quality links available)

`docs/outreach-kit-2026-08-04.md` already contains a response bank keyed to each of the 22
briefings, plus a per-briefing angle sheet and a Tier 1–3 reporter list. It has never been used.

This is the single best link source available to a new site: a HARO/Connectively placement
lands a genuine editorial link from a real publication, which is worth more for crawl
authority than any number of directory submissions.

- **Connectively** (ex-HARO) — <https://connectively.us>
- **Qwoted** — <https://www.qwoted.com>
- **X/Twitter** — monitor `#journorequest`, `#prrequest`

The angle that works: The Wall holds original pricing data on 1,440 US agencies. Journalists
writing about marketing spend, agency pricing, or the state of the services market have no
other public source for that. Lead with the data, not the directory.

---

## Task 3 — Badge distribution (unblocked, but low volume until traffic exists)

`/badge/` is live and has never been shown to a vendor. Each embed is a followed backlink
from a real agency site, and agency sites tend to have decent authority.

The honest constraint: this converts vendors who already know they're listed. Right now
almost none do. It gets strong **after** Task 1 and 2 create initial traffic, and it becomes
the natural second ask in the cold-email sequence (Weapon 1 → claim → badge → referral deal).

Sequence it third. Don't lead with it.

---

## What NOT to do next

**Do not build more pages.** Three hub opportunities remain unbuilt in
`docs/keyword-pipeline-2026-08-03.md` and they should stay unbuilt. The site has 2,588 URLs
and zero backlinks — the problem is not insufficient surface area. Adding a 2,589th URL that
also cannot be crawled changes nothing.

Revisit hubs once GSC shows what is actually indexing and GA4 shows which `page_type`
converts. That data is 3–7 days out.
