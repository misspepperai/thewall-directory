# The Wall — Vendor Affiliate Cold Email Pack
*Version 2 · 2026-08-04 · Matches Dan's "Email them, then tax them" playbook*

## The play, in one sentence

Blast a free-listing acknowledgment to every vendor in the directory. The non-competitors reply yes fastest. The second anyone replies, flip to the two-way affiliate deal (they keep 20%, we take 10%, their side bigger on purpose). Expect ~10% of yes-replies to actually send clients. Those are the easiest deals we'll ever close.

**The marketplace is just the wedge.** The prize is a network of vendors financially motivated to feed us leads.

---

## Prerequisites

1. **Contact enrichment.** Our DB has no vendor emails. See `docs/contact-enrichment-plan.md` — Apollo + Apify combo, ~$580 for 90-95% coverage. Nothing in this pack sends until enrichment lands.
2. **Sending infrastructure.** A dedicated sending domain (not misspepper.ai), warmed 2–4 weeks, SPF/DKIM/DMARC clean, replies forwarded to support@misspepper.ai. Instantly or Smartlead both handle this.
3. **Suppression rules ready.** See §Suppression at the bottom.

---

## Available mail-merge variables

| Variable | Example | Source |
|---|---|---|
| `{{ first_name }}` | Sarah | Enrichment |
| `{{ contact_email }}` | sarah@agency.com | Enrichment |
| `{{ company }}` | Agency Name Inc. | directory_companies.name |
| `{{ category }}` | Marketing | directory_companies.category |
| `{{ profile_url }}` | `https://hitthewall.net/c/agency.com.html` | Constructed: SITE + '/c/' + domain + '.html' |

Reference URLs to swap into copy:
- Partner page: `https://hitthewall.net/partner.html`
- Their listing: `{{ profile_url }}`
- (Optional deeper credibility) State of Market report: `https://hitthewall.net/report/state-of-the-us-growth-vendor-market-2026.html`

---

## Weapon 1 — First-touch email (BLAST WIDE, not picky)

### The email

**Subject:** {{ company }} is featured in The Wall

**Body:**

Hey {{ first_name }} — I'm building The Wall (hitthewall.net), a marketplace of US growth-services companies. {{ company }} is in it.

Your listing: {{ profile_url }}

It's completely free — I'm just making sure the best US firms are on it. Want me to update anything (bio, services, contact), or does it look good as-is?

Dan
Editor, The Wall

### Why this version

Dan's canonical Weapon 1 is *"I'd love to feature you. Free. Want me to add you?"* Our vendors are already listed (we scraped them without opting them in), so we lead with the fact rather than the offer. Same warmth, same free-listing hook, same low-friction opener — just adjusted for the reality that they already exist in the directory.

### One follow-up if no reply after 5 days

**Subject:** re: {{ company }} in The Wall

**Body:**

{{ first_name }} — quick nudge. Your listing at {{ profile_url }} needs a yes/no from you on whether the details look right. Two-second reply either way and I'll leave you alone.

Dan

### One more follow-up if still nothing after 5 more days

**Subject:** last note on The Wall listing

**Body:**

{{ first_name }} — closing out my list. If you want the listing at {{ profile_url }} kept as-is, no reply needed. If you want it pulled or updated, reply here.

Dan

Then stop. Three touches maximum per vendor for Weapon 1.

---

## Weapon 2 — The flip (SEND THE SECOND THEY REPLY YES)

Any positive reply — "looks good," "yes add me," "actually can you update X" — triggers Weapon 2. Send it as the reply to their reply, in the same thread. Automation-eligible: any Instantly / Smartlead workflow that detects a positive reply can fire this template.

### The email

**Subject:** re: [their subject]

**Body:**

Awesome, {{ first_name }} — let's make it official.

Two-way affiliate deal:
- Any customer you send us, **you keep 20%** of the retainer, monthly, for the life of the account.
- Any customer I send you, **I take 10%** — same terms, mirrored.

Your side is bigger on purpose. Easy yes?

Full one-pager if useful: https://hitthewall.net/partner.html

Just reply "in" and you're on the partner list today.

Dan

That's the whole flip. One email, one line of terms, one CTA.

---

## Reply handling

### "in" / "yes" / "let's do it"

**Subject:** re: [their reply]

**Body:**

You're in, {{ first_name }}. Two things to make it clean:

1. **When you have a client for us**, email me their name and what they're asking for. If they sign, you're on the pay list within a business day.
2. **When we have a client for you**, we email you the intro and note the 10%.

Payment is monthly by ACH or Stripe. First check within 30 days of the client's first payment. I'll grab your payment details once we have the first referral to route.

Anything else, just reply.

Dan

### "how does the payment actually work" / "when do I get paid"

**Subject:** re: [their reply]

**Body:**

{{ first_name }} — quick answer.

Monthly ACH or Stripe. First payment within 30 days of the client's first retainer payment to whichever of us is invoicing. Every month after, on the same cadence, for the life of that client relationship.

W-9 on file if you're US-based. That's the whole mechanic.

Ready to be on the list?

Dan

### "not interested" / "please remove" / "unsubscribe"

Suppress the address in the sending tool. Do not reply. Suppress the entire domain (if one person at a firm says no, everyone at that firm sees the answer).

### "not right now" / "maybe later"

**Subject:** re: [their reply]

**Body:**

Understood {{ first_name }}. Page stays live at hitthewall.net/partner.html when it becomes relevant. Reply any time and I'll add you.

Dan

### "What kind of clients do you actually work with?"

**Subject:** re: [their reply]

**Body:**

{{ first_name }} — quick summary.

Established US businesses past $5M in revenue, 25+ employees. Service industries — home services, IT/MSP, attorneys, B2B services, healthcare-adjacent. We're a systems company, not a channel specialist. Clients who want "please run our Facebook ads" are wrong fit for us; clients who want "please rebuild how our whole marketing function operates with AI running the compounding parts" are ours.

Typical retainer $8K–$18K/month. Your 20% on that is $1.6K–$3.6K/month per client, monthly, for as long as they stay.

Ready to be on the list?

Dan

### "what if we compete on something"

**Subject:** re: [their reply]

**Body:**

{{ first_name }} — good question. If we overlap on a piece of work, don't refer that piece. Refer the pieces you don't do. Most vendors in The Wall aren't in the AI-marketing-systems business we're in, so this rarely comes up. When it does, you decide what to send.

Ready?

Dan

---

## Suppression rules

Auto-suppress the domain and skip all future sends when:

- Anyone at that domain replies unsubscribe / not interested / please remove / stop.
- The primary contact email hard-bounces twice.
- A reply comes from a legal / privacy / DPO address (`legal@`, `dpo@`, `privacy@`, `abuse@`, `security@`).
- The listing was removed from The Wall directory (they asked to be de-listed — remove from outreach immediately).
- `hq_country` is not 'US' (belt-and-suspenders — the loader already filters).

Cross-reference `suppressed=true` in the sending-tool export query before every batch send.

---

## Sending pace

Standard cold-email warmup. On a fresh sending domain:

- Weeks 1–2: 20/day
- Weeks 3–4: 50/day
- Week 5+: up to 100/day per mailbox

At 100/day on 2 mailboxes = 200/day = ~11 weeks to blast Weapon 1 to the full 2,286 vendor list. Follow-ups add ~2 weeks. Weapon 2 fires on reply and doesn't consume batch capacity.

Never send >100/mailbox/day. Never send from `@misspepper.ai` for cold outreach — reserve that for real conversations and Weapon 2 replies.

---

## What to expect (Dan's numbers from the playbook)

- **Reply rate to Weapon 1:** targeting 8–12% positive replies on a warm-list, well-warmed sending infrastructure. Below 4% → something is broken (list quality, deliverability, subject line, or opener).
- **Sign-up rate on Weapon 2:** vast majority of positive Weapon 1 replies convert. This isn't a hard pitch; it's a no-brainer term structure. Expect >70% of Weapon 2 sends to result in "I'm in."
- **Actually-send-clients rate:** ~10% of signed partners will ever send an actual client. Which sounds low until you do the math: 2,286 sent → ~250 sign as partners → ~25 send at least one client → each of those clients is worth $1,600–$3,600/month in gross to us that we pay 20% out of. Those are the easiest deals we'll ever close.

---

## After Weapon 2 signs — the co-marketing hook

Per the playbook (step 4): once someone's a partner, they're the excuse for co-marketing. Small-scale tactics that convert dormant partners into active referrers:

- **Joint webinars** — 45 min, both logos on the slide, both audiences invited. Cheapest to produce, biggest halo.
- **Guest posts** — you write a piece for their newsletter (usually free), they write one for ours (also free). Traffic exchange.
- **Podcast swaps** — appear on their show, they appear on ours. Warm inbound both ways.
- **Data collaboration** — pull them into the next State of the Market report ("data contributed by 40 partner firms including..."). Their logo, our credibility, everyone wins.

Track partners → co-marketing activity → referrals sent in the same tracking sheet described below.

---

## Partner tracking (do this from day one)

Airtable / Notion / Google Sheets, one row per signed partner:

| Company | Contact | Email | Signed date | Referrals to Miss Pepper | Referrals from Miss Pepper | Total revenue generated | Last touched |

Every 6 weeks: send an active-partner check-in that leads with something useful (new hub, new report chapter, joint-webinar invite) and asks casually about any client conversations worth introducing. Passive partners → active referrers with almost zero prompting.

---

## Legal / compliance quick notes

- **CAN-SPAM** (US): every email needs a physical mailing address in the footer and a working unsubscribe.
- **GDPR** (EU): don't email EU addresses cold. The Wall's index is US-only so shouldn't come up, but if any enriched contact resolves to an EU country, suppress.
- **CASL** (Canada): treat `.ca` addresses as no-cold-email unless you have explicit consent.
- Deliverability score >9/10 on mail-tester.com before batch sends start.

---

*This is v2, matching Dan's "Email them, then tax them" playbook (OP 3/3). v1 (the 5-touch × 4-segment version) was over-engineered — this is the actual play. Iterate after the first 500 sends.*
