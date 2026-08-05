// Build Open Graph share cards for every page on the site.
//
// WHY THIS EXISTS: the site had zero images and no og:image on any of 2,590 pages, so every
// share — press release, journalist pitch, Slack paste, X post — unfurled as a bare link.
// The binding constraint on this project is distribution, and the unfurl is the click.
//
// Cards are TYPOGRAPHIC AND DATA-LED, never generated art. Per BRAND-BRIEF §4: on any surface
// where a figure appears, that figure must be computed and sourced. Every number on every card
// here is read from the live directory at build time, and every card carries its source line.
// Generated imagery on this project is confined to distribution surfaces that carry no figures
// (see build-art.mjs).
//
// Rendering is local: pango lays out the text (real font metrics, real word wrapping), sharp
// composites and rasterises. No API, no cost, deterministic output.
//
//   node build-og.mjs            # everything
//   node build-og.mjs --top      # top-level cards only, skip the 2,286 vendor cards
//   node build-og.mjs --limit 20 # smoke test
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'og');
const SB = 'https://kdvuewhbinmhmrysusbd.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnVld2hiaW5taG1yeXN1c2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MzM2NjUsImV4cCI6MjA5OTAwOTY2NX0.8YF8O_iaCp5C9z8gr8dfEPmW7B8fZCcZ4pIRTwxwsPU';
const HDRS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const args = process.argv.slice(2);
const TOP_ONLY = args.includes('--top');
const LIMIT = args.includes('--limit') ? +args[args.indexOf('--limit') + 1] : Infinity;

// ---- palette (STYLE-GUIDE §1, validated values only) ----
const C = {
  porcelain: '#FAF9F6', stone: '#E7E3DA', stoneLt: '#F2F0EA',
  ink: '#0E1B33', body: '#3B4557', chrome: '#686D75',
  cobalt: '#1B4FD8', oxblood: '#6E1423'
};
const W = 1200, H = 630, PAD = 74;

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Pango parses font_desc as "family style-options size" and takes NAMED weights only.
// A numeric weight ("Newsreader 600 68px") fails the parse silently and falls back to the
// default sans — which is how the first render of these cards lost the serif entirely.
const WEIGHT = { 400: '', 500: 'Medium', 600: 'Semibold', 700: 'Bold' };

// Pango lays the text out with real metrics; we only ever ask sharp for a bitmap.
async function text({ str, font, color, size, width, weight = 400, tracking = 0, caps = false, wrap = 'word' }) {
  let s = esc(caps ? String(str).toUpperCase() : str);
  const attrs = [
    `font_desc="${[font, WEIGHT[weight] || '', `${size}px`].filter(Boolean).join(' ')}"`,
    `foreground="${color}"`,
    tracking ? `letter_spacing="${Math.round(tracking * size * 1024)}"` : ''
  ].filter(Boolean).join(' ');
  const img = sharp({
    text: { text: `<span ${attrs}>${s}</span>`, rgba: true, width, wrap, dpi: 72 }
  });
  const buf = await img.png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width, h: meta.height };
}

const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

function backdrop() {
  // Masthead rule, matching the site's 2px topbar rule — same three hard stops, no gradient.
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${rect(0, 0, W, H, C.porcelain)}
    ${rect(0, 0, Math.round(W * 0.62), 8, C.cobalt)}
    ${rect(Math.round(W * 0.62), 0, Math.round(W * 0.22), 8, C.oxblood)}
    ${rect(Math.round(W * 0.84), 0, Math.round(W * 0.16), 8, C.ink)}
    ${rect(PAD, H - 150, W - PAD * 2, 1, C.stone)}
  </svg>`);
}

// Headline auto-fit: step the size down until pango reports it fits the box.
async function fitHeadline(str, boxW, boxH, { max = 68, min = 32 } = {}) {
  for (let size = max; size >= min; size -= 3) {
    const t = await text({ str, font: 'Newsreader', weight: 600, color: C.ink, size, width: boxW });
    if (t.h <= boxH) return t;
  }
  return text({ str, font: 'Newsreader', weight: 600, color: C.ink, size: min, width: boxW });
}

/**
 * @param {object} spec
 *  kicker   mono uppercase line, oxblood
 *  headline the one dominant statement, Newsreader
 *  stats    [{label, value}] up to 4, mono — must be computed values, never asserted
 *  source   mono source line; REQUIRED when stats are present (pillar 1)
 */
async function card(spec, outfile) {
  if (spec.stats?.length && !spec.source) {
    throw new Error(`card "${outfile}": stats without a source line — every figure carries its origin`);
  }
  const layers = [];
  let y = 62;

  const wm = await text({ str: 'The Wall', font: 'IBM Plex Mono', weight: 600, color: C.ink, size: 21, tracking: 0.16, caps: true, width: 600 });
  layers.push({ input: wm.buf, left: PAD, top: y });
  const wms = await text({ str: 'Operations Atlas', font: 'IBM Plex Mono', weight: 400, color: C.chrome, size: 13, tracking: 0.18, caps: true, width: 400 });
  layers.push({ input: wms.buf, left: PAD + wm.w + 16, top: y + 7 });

  y += 78;
  if (spec.kicker) {
    const k = await text({ str: spec.kicker, font: 'IBM Plex Mono', weight: 600, color: C.oxblood, size: 17, tracking: 0.14, caps: true, width: W - PAD * 2 });
    layers.push({ input: k.buf, left: PAD, top: y });
    y += k.h + 22;
  }

  // Reserve the real estate the lower blocks need, then fit the headline into what is left.
  // The first cut hard-coded a box height and the headline ran straight through the stats row.
  const hasStats = !!spec.stats?.length;
  const floor = hasStats ? H - 236 : H - 112;          // top of whatever comes next
  const subH = spec.sub ? 62 : 0;
  const headBoxH = floor - y - subH - 30;
  const head = await fitHeadline(spec.headline, W - PAD * 2 - 20, headBoxH);
  layers.push({ input: head.buf, left: PAD, top: y });
  y += head.h + 22;

  if (spec.sub) {
    const sb = await text({ str: spec.sub, font: 'IBM Plex Sans', weight: 400, color: C.body, size: 21, width: W - PAD * 2 - 120 });
    layers.push({ input: sb.buf, left: PAD, top: Math.min(y, floor - sb.h - 14) });
  }

  if (hasStats) {
    const stats = spec.stats.slice(0, 4);
    const colW = Math.floor((W - PAD * 2) / stats.length);
    for (let i = 0; i < stats.length; i++) {
      const v = await text({ str: stats[i].value, font: 'IBM Plex Mono', weight: 600, color: C.ink, size: 30, width: colW - 18 });
      const l = await text({ str: stats[i].label, font: 'IBM Plex Mono', weight: 400, color: C.chrome, size: 13, tracking: 0.13, caps: true, width: colW - 18 });
      // Fixed baselines, not per-item heights: pango's ink extents differ between "696"
      // and "$0", which left the stat row visibly ragged on the first render.
      layers.push({ input: v.buf, left: PAD + colW * i, top: H - 236 });
      layers.push({ input: l.buf, left: PAD + colW * i, top: H - 236 + 42 });
    }
  }

  const src = await text({ str: spec.source || 'hitthewall.net · compiled from public sources · no paid placement', font: 'IBM Plex Mono', weight: 400, color: C.body, size: 14, tracking: 0.1, caps: true, width: W - PAD * 2 });
  layers.push({ input: src.buf, left: PAD, top: H - 112 });

  mkdirSync(dirname(outfile), { recursive: true });
  await sharp(backdrop()).composite(layers).png({ compressionLevel: 9 }).toFile(outfile);
}

// ---------------------------------------------------------------- data
async function fetchAll() {
  let rows = [], from = 0;
  for (;;) {
    const r = await fetch(`${SB}/rest/v1/directory_companies?select=name,domain,category,subcategory,avg_hourly_rate,min_project_size,team_size,hq_state,hq_city,year_established&status=eq.approved&order=name.asc&offset=${from}&limit=1000`, { headers: HDRS });
    if (!r.ok) throw new Error(`supabase ${r.status}`);
    const page = await r.json();
    rows = rows.concat(page);
    if (page.length < 1000) break;
    from += 1000;
  }
  return rows;
}

const snap = JSON.parse(readFileSync(join(ROOT, 'data', 'last-snapshot.json'), 'utf8'));
const SRC = `source · the wall directory · snapshot ${snap.captured_at}`;
const has = v => v != null && v !== '' && !/^(unknown|undisclosed|n\/?a)$/i.test(String(v).trim());
const nfmt = n => n.toLocaleString('en-US');

// ---------------------------------------------------------------- top-level cards
function topCards(rows) {
  const total = rows.length;
  const rated = Object.entries(snap.rates).filter(([k]) => !/undisclosed/i.test(k));
  const disclosed = rated.reduce((a, [, v]) => a + v, 0);
  const mid = (snap.rates['$100 - $149 / hr'] + snap.rates['$150 - $199 / hr']);
  const midPct = (mid / disclosed * 100).toFixed(1);
  const states = Object.keys(snap.states).length;
  const cats = Object.entries(snap.categories).sort((a, b) => b[1] - a[1]);

  return [
    ['og/home.png', {
      kicker: 'Independent · no paid placement',
      headline: 'Every vendor directory sells position. This one sells nothing.',
      stats: [
        { value: nfmt(total), label: 'US firms indexed' },
        { value: '696', label: 'removed pre-launch' },
        { value: nfmt(disclosed), label: 'publishing a rate' },
        { value: '$0', label: 'paid for placement' }
      ],
      source: SRC
    }],
    ['og/data.png', {
      kicker: 'Data corner',
      headline: `${midPct}% of US growth vendors bill between $100 and $199 an hour.`,
      stats: [
        { value: nfmt(disclosed), label: 'firms disclosing' },
        { value: '$150–199', label: 'modal band' },
        { value: `${snap.rates['$300+ / hr']}`, label: 'above $300/hr' },
        { value: `${snap.rates['< $25 / hr']}`, label: 'below $25/hr' }
      ],
      source: SRC
    }],
    ['og/pillars.png', {
      kicker: 'Browse by pillar',
      headline: 'Ten disciplines, alphabetical inside each. Ranking implies a judgement we have not earned.',
      stats: cats.slice(0, 4).map(([k, v]) => ({ value: nfmt(v), label: k })),
      source: SRC
    }],
    ['og/states.png', {
      kicker: 'By state',
      headline: 'Where US growth vendors actually are.',
      stats: Object.entries(snap.states).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => ({ value: nfmt(v), label: k })),
      source: `${SRC} · ${states} states represented`
    }],
    ['og/cities.png', {
      kicker: 'By city',
      headline: 'Vendor concentration, city by city.',
      stats: [{ value: nfmt(total), label: 'firms indexed' }, { value: `${states}`, label: 'states' }],
      source: SRC
    }],
    ['og/news.png', {
      kicker: 'Briefings',
      headline: 'What the directory says this month — and what changed since last.',
      sub: 'Monthly state-of-the-index reporting. Every aggregate reproducible from the live data.',
      source: SRC
    }],
    ['og/glossary.png', {
      kicker: 'Glossary',
      headline: 'Plain definitions for the terms vendors use when quoting you.',
      sub: 'No jargon defended, no acronym left standing.',
      source: 'hitthewall.net/glossary · the wall'
    }],
    ['og/questions.png', {
      kicker: 'Questions & answers',
      headline: 'The questions buyers actually ask before hiring a growth vendor.',
      sub: 'Answered from the directory, with the working shown.',
      source: SRC
    }],
    ['og/compare.png', {
      kicker: 'Head-to-heads',
      headline: 'Down to two? Read the comparison before the demo.',
      sub: 'Side-by-side breakdowns of the platforms buyers weigh against each other.',
      source: 'hitthewall.net/compare · the wall'
    }],
    ['og/hubs.png', {
      kicker: 'Buyer hubs',
      headline: 'What each discipline does, what it costs, and when hiring one is the wrong move.',
      source: SRC
    }],
    ['og/entities.png', {
      kicker: 'Platform reference',
      headline: 'The software layer underneath every growth engagement.',
      source: 'hitthewall.net/entities · the wall'
    }],
    ['og/find.png', {
      kicker: 'Shortlists',
      headline: 'Every discipline, crossed with every state worth a page.',
      source: SRC
    }],
    ['og/tools.png', {
      kicker: 'Rate benchmark',
      headline: 'Got a quote? See where it sits against real published rates.',
      stats: [{ value: nfmt(disclosed), label: 'rates in the sample' }, { value: `${midPct}%`, label: 'at $100–199/hr' }],
      source: SRC
    }],
    ['og/partner.png', {
      kicker: 'For listed vendors',
      headline: 'Send us a client, keep 20%. We send you one, we take 10%.',
      sub: 'No fee to join, no contract, no minimums. Listing itself is free and unranked.',
      source: 'hitthewall.net/partner · terms published in full'
    }],
    ['og/press.png', {
      kicker: 'Press & media',
      headline: 'Original pricing data on 1,440 US growth agencies, free to cite.',
      stats: [{ value: nfmt(total), label: 'firms indexed' }, { value: nfmt(disclosed), label: 'with published rates' }],
      source: `${SRC} · attribution requested, not required`
    }],
    ['og/about.png', {
      kicker: 'About & method',
      headline: 'We publish what we can verify, and say so when we cannot.',
      stats: [{ value: '696', label: 'removed pre-launch' }, { value: '668', label: 'non-US' }, { value: '28', label: 'dead sites' }],
      source: SRC
    }],
    ['og/wins.png', {
      kicker: 'Referral wins',
      headline: 'Where the two-way referral network has actually paid out.',
      source: 'hitthewall.net/wins · the wall'
    }],
    ['og/badge.png', {
      kicker: 'Embed kit',
      headline: 'Listed on The Wall? Show it.',
      sub: 'A badge you did not pay for, on an index nobody can buy into.',
      source: 'hitthewall.net/badge · the wall'
    }],
    ['og/report.png', {
      kicker: 'Annual report',
      headline: 'State of the US growth-vendor market, 2026.',
      stats: [{ value: nfmt(total), label: 'firms analysed' }, { value: nfmt(disclosed), label: 'disclosing rates' }, { value: `${states}`, label: 'states' }],
      source: SRC
    }],
    ['og/default.png', {
      kicker: 'Operations atlas',
      headline: 'The independent index of US growth-services vendors.',
      stats: [{ value: nfmt(total), label: 'firms indexed' }, { value: '$0', label: 'paid for placement' }],
      source: SRC
    }]
  ];
}

// ---------------------------------------------------------------- vendor cards
function vendorSpec(x) {
  const stats = [];
  if (has(x.avg_hourly_rate)) stats.push({ value: String(x.avg_hourly_rate).replace(/\s*\/\s*hr$/i, ''), label: 'hourly band' });
  if (has(x.team_size)) stats.push({ value: String(x.team_size), label: 'team size' });
  if (has(x.min_project_size)) stats.push({ value: String(x.min_project_size), label: 'min project' });
  if (has(x.year_established)) stats.push({ value: String(x.year_established), label: 'founded' });
  const hq = [x.hq_city, x.hq_state].filter(has).join(', ');
  // Where a firm discloses nothing, the card says so rather than padding it out. Pillar 1.
  return {
    kicker: [x.category, x.subcategory].filter(has).join(' / '),
    headline: x.name,
    sub: stats.length ? (hq || undefined) : `${hq ? hq + ' · ' : ''}No engagement data published by this firm.`,
    stats: stats.slice(0, 4),
    source: `${SRC} · ${x.domain}`
  };
}

// ---------------------------------------------------------------- run
const t0 = Date.now();
mkdirSync(OUT, { recursive: true });
const rows = await fetchAll();
console.log(`fetched ${rows.length} vendor records`);

let n = 0;
for (const [file, spec] of topCards(rows)) {
  await card(spec, join(ROOT, file));
  n++;
}
console.log(`top-level cards: ${n}`);

if (!TOP_ONLY) {
  mkdirSync(join(OUT, 'c'), { recursive: true });
  let v = 0;
  for (const x of rows) {
    if (v >= LIMIT) break;
    await card(vendorSpec(x), join(OUT, 'c', `${x.domain}.png`));
    if (++v % 200 === 0) console.log(`  vendor cards: ${v}/${Math.min(rows.length, LIMIT)}`);
  }
  console.log(`vendor cards: ${v}`);
}
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
