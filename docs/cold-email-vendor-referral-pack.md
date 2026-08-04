# The Wall × Miss Pepper AI — Vendor Referral Cold Email Pack
*Version 1 · 2026-08-04 · For Dan or whoever runs the sends*

## What this is

The outreach playbook for cold-emailing the 2,286 US growth-vendor firms listed in The Wall (hitthewall.net) with the referral partnership offer described at hitthewall.net/partner.html.

The whole thesis: **The Wall listing is the icebreaker.** The cold email doesn't lead with the offer — it leads with "you appear in this report" or "you're listed in this directory." The offer comes on touch 2 or 3, after the recipient has already engaged with something useful.

This pack is tool-agnostic (works in Instantly, Smartlead, Apollo, Lemlist, Woodpecker). All templates use `{{ variable }}` mail-merge syntax; adjust to your platform's convention.

---

## Prerequisites before you send

1. **Contact enrichment.** Our DB has no vendor emails yet. Before running this pack you need:
   - An enrichment pass to append `contact_email`, `first_name`, and (ideally) `linkedin_url` to each listing.
   - See `docs/contact-enrichment-plan.md` for options and cost estimates.
2. **Sending infrastructure.** A dedicated sending domain (not misspepper.ai — protect the primary domain), warmed up for 2–4 weeks minimum, with proper SPF/DKIM/DMARC. Instantly and Smartlead both handle this in-tool.
3. **List segmentation.** Split the 2,286 listings into at least four sequences to run in parallel:
   - **Segment A — Marketing pillar** (550 firms). Broadest pool, primary sequence.
   - **Segment B — SEO + Content + Social** (429 firms). Channel-specialist framing.
   - **Segment C — Creative Strategy** (870 firms). Different pitch angle — creative firms rarely refer marketing-systems work directly, so this segment goes lower-priority and lower-volume.
   - **Segment D — Sales + Automation + Demand Gen + AI Marketing + Thought Leadership** (437 firms). Highest-fit for referrals; these disciplines routinely encounter clients wanting AI-systems work they don't build.
4. **CSV export ready.** Filter directory_companies WHERE status='approved' AND category IN (segment categories), plus the enriched contact fields. Example command:
   ```
   COPY (SELECT contact_email, first_name, name AS company, category, hq_city, hq_state, avg_hourly_rate, team_size, domain FROM directory_companies WHERE status='approved' AND category='Marketing') TO STDOUT WITH CSV HEADER;
   ```

---

## Available mail-merge variables

Structured data available per row from the directory:

| Variable | Example | Source |
|---|---|---|
| `{{ first_name }}` | Sarah | Enrichment pass |
| `{{ contact_email }}` | sarah@agency.com | Enrichment pass |
| `{{ company }}` | Agency Name Inc. | directory_companies.name |
| `{{ category }}` | Marketing | directory_companies.category |
| `{{ subcategory }}` | Full-Service Marketing | directory_companies.subcategory |
| `{{ hq_city }}` | Austin | directory_companies.hq_city |
| `{{ hq_state }}` | TX | directory_companies.hq_state |
| `{{ team_size }}` | 10 - 49 | directory_companies.team_size |
| `{{ avg_hourly_rate }}` | $150 - $199 / hr | directory_companies.avg_hourly_rate |
| `{{ min_project_size }}` | $10,000+ | directory_companies.min_project_size |
| `{{ year_established }}` | 2015 | directory_companies.year_established |
| `{{ profile_url }}` | https://hitthewall.net/c/agency.com.html | Constructed: SITE + '/c/' + domain + '.html' |

Reference URLs to swap into copy:

- Report: `https://hitthewall.net/report/state-of-the-us-growth-vendor-market-2026.html`
- Partner page: `https://hitthewall.net/partner.html`
- Their listing: `{{ profile_url }}`

---

## Sequence A — Marketing pillar (550 firms) — 5 touches over 14 days

### Touch 1 — Day 0: The icebreaker (report notification)

**Subject:** {{ company }} appears in our 2026 State of the Market report

**Body:**

Hi {{ first_name }},

We just published *The 2026 State of the US Growth-Vendor Market* — a data-driven report on the 2,286 US growth-services firms we track in The Wall (hitthewall.net). {{ company }} is one of them.

The report covers what the US market actually charges by discipline, what firm sizes cluster where, why category ratings have compressed to the sixth decimal, and how the mid-market has moved (Austin, Denver, and Miami now punch above their weight on the vendor map).

Free to read, share, cite, and embed figures from — no paywall, no gated form: [https://hitthewall.net/report/state-of-the-us-growth-vendor-market-2026.html](https://hitthewall.net/report/state-of-the-us-growth-vendor-market-2026.html)

Your listing lives at [{{ profile_url }}]({{ profile_url }}). Corrections or updates: just reply here or use the contact page.

Best,
Dan Kurtz
Founder, Miss Pepper AI
Editor, The Wall

---

### Touch 2 — Day 3: Soft follow (reply-bait)

**Subject:** re: {{ company }} in our report

**Body:**

{{ first_name }} — quick follow. Two things you might not have caught in the report:

- The US agency rate distribution: two-thirds of firms price in the $100–$199/hr band. {{ company }} sits at {{ avg_hourly_rate }} — worth knowing what percentile that is against the disclosed market. There's an interactive tool at [hitthewall.net/tools/rate-benchmark.html](https://hitthewall.net/tools/rate-benchmark.html) if useful.
- The transparency map: SEO firms publish rates 87% of the time, Demand Gen firms only 60%. Marketing sits at 80.9%.

Reply "not interested" and I'll take you off the list — no offense taken.

Dan

---

### Touch 3 — Day 7: The offer (the actual pitch)

**Subject:** A partner offer for {{ company }}

**Body:**

Hi {{ first_name }},

Different email this time — an offer, not a report update.

Miss Pepper AI (the company behind The Wall) is a US AI-marketing systems company. We frequently get inbound leads that {{ company }} would be a better fit for, and I'd wager you get leads that would be a better fit for us — the ones wanting an AI-native marketing system built and run for them, not a channel service.

We'd like to route the mismatches to each other. We pay **20% of every retainer** from a client you refer, monthly, for the life of the account. Zero cost to sign up, no exclusivity, no minimum volume.

Full terms in plain language: [https://hitthewall.net/partner.html](https://hitthewall.net/partner.html)

If you're open to it, reply "in" and I'll add you to the referral partner list today.

Dan
Founder, Miss Pepper AI

---

### Touch 4 — Day 10: The economic reframe

**Subject:** The math on the referral offer

**Body:**

{{ first_name }} — one more note in case the last email felt abstract.

A typical Miss Pepper AI client retainer is $8,000–$18,000/month. On the low end, one referred client at $8,000/mo pays you $1,600/mo — every month, for the life of the account. If that client stays two years, that's ~$38,400. From one intro email.

If you're already turning down clients that wanted AI-systems work — the ones where you'd say "that's not really what we do" — this converts those declined conversations into recurring revenue. That's the whole thesis.

Reply "in" if you'd like to be added. If it's a no, one more email from me and I'll stop.

Dan

---

### Touch 5 — Day 14: The polite exit

**Subject:** last note

**Body:**

Hi {{ first_name }} — I'll stop after this one. If the partner offer is a fit at some point, the page will stay at [hitthewall.net/partner.html](https://hitthewall.net/partner.html) and my inbox is open.

If your {{ company }} listing in The Wall needs a correction, that link still works too. Otherwise, no further follow-up.

Best,
Dan

---

## Sequence B — SEO + Content + Social specialists (429 firms) — Touch 1 variant

Use Sequence A for touches 2–5. Only touch 1 changes to a more specialist-flattering opener:

**Subject:** {{ company }} in our 2026 category data — {{ category }} pricing distribution

**Body:**

Hi {{ first_name }},

We published a chapter this week on how {{ category }} firms specifically differ from the broader US growth-vendor market — rate-disclosure percentages, minimum-project distribution, category age cohorts. {{ company }} is one of the {{ team_size }} firms we track in the {{ category }} pillar.

Full data and category ranking: [hitthewall.net/pillars/{{ category | slugify }}.html](https://hitthewall.net/pillars/)

Your listing: [{{ profile_url }}]({{ profile_url }})

Best,
Dan Kurtz
Editor, The Wall

*(Note: the pillar URL uses lowercased-hyphenated category — "seo" for SEO, "content-marketing" for Content Marketing, etc. Compute the slug in your mail-merge tool or pre-render per row.)*

---

## Sequence C — Creative Strategy (870 firms) — lower-fit, different pitch

Creative agencies rarely refer marketing-systems work; they refer strategy work. Sequence C uses a modified partner-offer angle. Send in smaller batches (~50/week) since fit is weaker.

### Touch 1 (same as Sequence B pattern):

**Subject:** {{ company }} in our creative-agency category data

**Body:** [Same as Sequence B, replace {{ category }} with "Creative Strategy"]

### Touch 3 (the offer, reframed for creative firms):

**Subject:** A partner offer for creative firms specifically

**Body:**

{{ first_name }} — different offer than the last email.

We routinely see creative agencies pass on clients whose ask is really an *operations* question — marketing systems, automation, AI-driven content pipelines. It's not creative work; it's plumbing. When those clients land in your inbox and aren't your fit, we'd like to be who you introduce them to.

Miss Pepper AI (the company behind The Wall) builds and runs those AI-native marketing systems. We pay 20% of every retainer from a client you introduce us to, monthly, for the life of the account.

Full terms: [https://hitthewall.net/partner.html](https://hitthewall.net/partner.html)

Reply "in" if you'd like on the referral partner list. It costs nothing.

Dan

*(Skip touch 4 for Sequence C; go straight to touch 5 exit.)*

---

## Sequence D — Sales + Automation + Demand Gen + AI Marketing + Thought Leadership (437 firms) — highest fit

These disciplines encounter Miss Pepper's ICP most often. Use Sequence A copy with two adjustments:

**Touch 3 opener:** Replace the generic mismatch language with:

> Miss Pepper AI builds AI-native marketing systems for the exact operator profile {{ category }} vendors most often meet — established US businesses past $5M in revenue who want an integrated stack, not a channel specialist. When those conversations aren't a fit for {{ company }} specifically, we're likely who they end up needing.

**Prioritize this segment first.** Highest conversion probability of the four sequences.

---

## Reply handling — templates for the responses you'll actually get

### "in" / "yes" / "sounds interesting"

**Subject:** re: [same subject as their reply]

**Body:**

{{ first_name }} — great, you're on the partner list.

Two things to make this work smoothly:

1. **When you have a referral**, just email me at support@misspepper.ai with two lines: (1) who to reach out to (name + email) and (2) what the client is asking for. That's the entire process. I'll take it from there.

2. **First check within 30 days** of the client's first payment to us. Monthly thereafter. ACH or Stripe. I'll grab your payment details once we have the first referral to route.

Anything else, just reply here.

Dan

### "not interested" / "please remove" / "unsubscribe"

Suppress the address in the sending tool. Do not reply. Don't send anything else to that domain either — if the person handling their inbox said no, everyone at that firm sees the answer.

### "not right now" / "maybe later" / "who is this"

**Subject:** re: [same]

**Body:**

Understood {{ first_name }} — I'll leave you alone. The partner page stays live at [hitthewall.net/partner.html](https://hitthewall.net/partner.html) if it becomes relevant later.

If you want your {{ company }} listing updated in the meantime, just reply here.

Dan

### "What kind of clients do you serve?"

**Subject:** re: [same]

**Body:**

{{ first_name }} — quick summary.

Established US businesses past $5M in revenue with 25+ employees, in service industries where AI-native marketing systems compound — home services, IT/MSP, attorneys, B2B services, healthcare-adjacent.

We're not a channel specialist. If a client wants "please run our Facebook ads" we're the wrong fit; if a client wants "please rebuild how our marketing function operates, with AI running the compounding parts," that's us.

Typical retainer is $8,000–$18,000/month. Sign-on cycle is 3–6 weeks depending on scope.

Reply "in" any time.

Dan

### "Do you white-label?"

**Subject:** re: [same]

**Body:**

Not currently — direct referrals only. You introduce us, the client signs with Miss Pepper AI directly, we pay you 20% of what they pay us for as long as they're a client. Cleaner than white-label and pays the same or better once you factor in that we own the operational risk.

Dan

### "How do I know you'll actually pay?"

**Subject:** re: [same]

**Body:**

Fair question, {{ first_name }}. Three things:

1. First payment happens within 30 days of the referred client's first payment to us — meaning we've already been paid before you are. No float risk on our end.
2. ACH or Stripe Connect — auditable payment rail, not "we'll cut you a check when we remember."
3. We're a US company operating a public directory that will keep operating whether or not we pay you. Reputation is the enforcement mechanism.

If you want the terms in a signed one-pager, I can send that too.

Dan

---

## Do-not-send rules

Suppress a domain from all future sends when:

- Anyone at that domain replies "unsubscribe," "not interested," "please remove," "stop," or any variant.
- The primary contact email hard-bounces twice.
- A reply comes from a legal or DPO-style address (`legal@`, `dpo@`, `privacy@`) — even without a formal request, treat it as a stop.
- The listing has been marked for removal in The Wall (i.e., the vendor asked to be de-listed) — remove from outreach immediately.

Keep a running suppression list in your sending tool. Cross-reference against directory_companies before every batch send to catch newly-removed listings.

---

## Sending pace and warmup

- **Weeks 1–2 of a fresh sending domain:** 20 emails/day, 5 sends/hour, only to verified deliverable addresses.
- **Weeks 3–4:** 50 emails/day.
- **Week 5 onward:** up to 100/day per mailbox, multiple mailboxes if you need volume.
- Never send >100/mailbox/day; deliverability drops off a cliff above that on cold outreach.
- Do not send from support@misspepper.ai or any @misspepper.ai address for cold outreach — reserve those for real conversations. Use a fresh sending domain (e.g. `hello.thewalldirectory.com`) with its own SPF/DKIM/DMARC, forwarding replies back to support@.

At 100/day on 2 mailboxes = 200/day = 1,000/week. The full 2,286-vendor list finishes touch 1 in ~11 weeks. Each touch adds ~2 weeks. Full 5-touch sequence completes in ~13 weeks per full list run.

---

## Success metrics to track

Track these per sequence, per week:

| Metric | Green | Yellow | Red |
|---|---|---|---|
| Delivery rate | >97% | 95–97% | <95% |
| Open rate | >45% | 30–45% | <30% |
| Reply rate | >8% | 4–8% | <4% |
| Positive reply rate | >2% | 1–2% | <1% |
| Partner sign-up rate | >0.5% (~10 signups per 2,000 sends) | 0.2–0.5% | <0.2% |
| Complaint rate | 0% | 0.01–0.05% | >0.05% |

Red numbers → pause the sequence and iterate on the underlying subject line, opening line, or list quality before sending more. Yellow → tune. Green → scale.

---

## What to do with a partner once they say yes

1. Reply within 4 business hours with the "you're on the list" template.
2. Add them to a partner tracking sheet (Airtable, Notion, or Google Sheets) with columns: partner company, primary contact, email, sign-up date, referrals-to-date, revenue-generated, last-touched.
3. Send a "welcome to the program" email 2–3 days later with a plain-English one-pager and payment details request.
4. Every 6 weeks: send a check-in email that leads with something useful (new report chapter, new hub, new entity page) and asks casually if they've had any client conversations worth introducing.
5. When a referral converts: notify them same day with retainer amount and payment schedule.

---

## Legal / compliance notes

- **CAN-SPAM** (US): every email must include a physical mailing address and an unsubscribe mechanism. Add a footer with Miss Pepper AI's business address and an unsubscribe link that actually works.
- **GDPR** (do not email EU addresses cold under this pack). The Wall's index is US-only, so this shouldn't come up — but if any enriched contact resolves to an EU country, suppress.
- **CASL** (Canada): treat any @.ca address as no-cold-email unless you have explicit consent.
- **Sending domain SPF/DKIM/DMARC**: essential. Verify with mail-tester.com scoring >9/10 before batch sends start.

---

*Questions, edits, additional variants — reply to Dan or edit this file directly. This is v1; expect a v2 once the first 500 sends give us real reply-rate data to iterate against.*
