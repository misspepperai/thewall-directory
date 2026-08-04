# GSC + GA4 unblock — Dan-side, ~12 minutes total

**Why this is the priority:** `hitthewall.net` is not in Search Console at all. I checked —
26 other properties are there, this one isn't. Everything built since 2026-08-03 (2,588 URLs,
all the schema, all the head-term retrofits) is currently unmeasurable. No index coverage, no
query data, no way to tell whether any of it is working. It is also the hard prerequisite for
Google Publisher Center / Google News.

Three tasks. Task 1 is the one that matters; 2 and 3 are cheap follow-ons.

---

## Task 1 — Verify hitthewall.net in Search Console (~5 min)

Use a **Domain property**, not a URL-prefix property. It covers http, https, www, non-www and
every subdomain in one shot, and it survives any future protocol or host change.

### 1a. Get the token

1. Go to https://search.google.com/search-console
2. Property dropdown (top left) → **+ Add property**
3. Left card, **Domain** → type `hitthewall.net` → **Continue**
4. Google shows a TXT record like `google-site-verification=AbC123...`
   **Copy the whole string.** Leave this tab open — you'll come back to click Verify.

### 1b. Add the record at Namecheap

DNS is on Namecheap BasicDNS (confirmed: nameservers are `dns1/dns2.registrar-servers.com`).

1. https://ap.www.namecheap.com → **Domain List** → `hitthewall.net` → **Manage**
2. **Advanced DNS** tab
3. **Add New Record** →
   - Type: **TXT Record**
   - Host: **@**
   - Value: the `google-site-verification=...` string from step 1a
   - TTL: **Automatic**
4. Save (green checkmark).

**Do not delete or edit the existing TXT record** — there's already an SPF record
(`v=spf1 include:spf.efwd.registrar-servers.com ~all`) for email forwarding. Multiple TXT
records at `@` are legal and expected. Adding a second one is correct; replacing the first
one breaks email forwarding.

### 1c. Verify

Back in the Search Console tab → **Verify**. Namecheap usually propagates in 5–30 minutes.
If it fails, wait 15 minutes and hit Verify again — the record is right, the resolver is stale.

### 1d. Submit the sitemap

Once verified: Search Console → **Sitemaps** (left nav) → enter `sitemap.xml` → **Submit**.
Full URL is `https://hitthewall.net/sitemap.xml` — 2,588 URLs, already live and valid.

**Then tell me it's done.** I'll pull coverage and query data via the SEO Gets MCP and we'll
find out what's actually indexing. Expect the first useful numbers 3–7 days after submission.

---

## Task 2 — GA4 (~5 min)

The site side is already built. `nav.js` loads on all ~2,590 pages, so it carries the tag
with no rebuild — I just need the Measurement ID.

1. https://analytics.google.com → **Admin** (bottom left gear)
2. **Create** → **Property** → name it `The Wall` → set timezone/currency → **Next**
3. Business details → **Create**
4. Platform → **Web** → Website URL `https://hitthewall.net`, stream name `The Wall` →
   **Create stream**
5. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`.

**Send me that ID.** I set it in `nav.js` and push — the whole site is tagged in one commit.

⚠️ **One thing to know before you say go.** `privacy.html` currently states, truthfully,
that "the site sets no cookies and runs no advertising trackers." GA4 sets first-party
`_ga` cookies, so that sentence stops being true the moment the tag goes live. When you
send the ID I will edit the privacy page in the same commit — the tag and the honest
disclosure ship together or not at all. If you'd rather keep the zero-cookie claim as a
trust asset, say so and we skip GA4; Search Console alone still gives us query and coverage
data, which is the bigger half of what we're missing.

---

## Task 3 — Google Publisher Center (~2 min, gated on Task 1)

Cannot be started until Search Console verification is green.

1. https://publishercenter.google.com → **Add publication**
2. Name `The Wall`, site `https://hitthewall.net`
3. Fill the basics; point the required policy links at:
   - Editorial policy → `https://hitthewall.net/editorial-policy.html`
   - AI disclosure → `https://hitthewall.net/ai-policy.html`
   - Ownership/about → `https://hitthewall.net/about.html`
   - Contact → `https://hitthewall.net/contact.html`
4. Submit.

All required policy pages already exist and are live. The 25 briefings under `/news/` carry
`NewsArticle` schema with the Editorial Team org byline, and `/news/updates/` publishes
monthly — which covers the freshness signal Google looks for.

---

## What I do the moment each lands

| You finish | I do |
|---|---|
| Task 1 (GSC verified + sitemap submitted) | Pull index coverage + query data, report what's indexing and what isn't, fix whatever's excluded |
| Task 2 (Measurement ID sent) | Set it in `nav.js` + update `privacy.html` in one commit, verify the tag fires |
| Task 3 (Publisher Center submitted) | Hold the weekly briefing cadence so the news eligibility signal keeps building |
