// Generate the section header art for top-level pages via gpt-image-2.
//
// SCOPE RULE (BRAND-BRIEF §4, operator decision 2026-08-04): generated imagery is allowed on
// DISTRIBUTION surfaces and section mastheads only. It never appears beside a sourced number.
// On a brand whose first pillar is "publish only what's verifiable," a generated picture next
// to a computed figure is an unsourceable claim sitting on top of a sourced one.
//   - Share cards, which carry figures  -> build-og.mjs, typographic, computed, sourced.
//   - Section mastheads, which carry none -> here.
// Nothing produced by this script may be placed inside a content well, beside a chart, or on
// data/, report/ or tools/ where figures are the subject.
//
// NO TEXT IN ANY IMAGE. Generated lettering comes out malformed, and malformed type on a
// newspaper-of-record brand is worse than no image at all. Every prompt bans it explicitly and
// the output is spot-checked before shipping.
//
//   node build-art.mjs              # generate everything missing
//   node build-art.mjs --only seo   # one key
//   node build-art.mjs --force      # re-generate even if the file exists
//   node build-art.mjs --list       # print the registry and exit
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'art');
const MODEL = 'gpt-image-2';
const SIZE = '1536x1024';
const QUALITY = 'medium';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LIST = args.includes('--list');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

// Credentials stay outside the repo. Never inline a key here — this file is committed.
function apiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const p = join(homedir(), '.sonic', '.api-keys.json');
  const m = readFileSync(p, 'utf8').match(/"openai_api_key"\s*:\s*"([^"]+)"/);
  if (!m) throw new Error(`no openai_api_key in ${p} and OPENAI_API_KEY unset`);
  return m[1];
}

// STYLE-GUIDE §4 prompt prefix, plus the hard bans. Every prompt is this + one subject line.
const STYLE = `Editorial letterpress composition printed on warm off-white paper (#FAF9F6).
Deep navy ink (#0E1B33) engraved line work with exactly one cobalt blue (#1B4FD8) accent element.
Style: 19th-century technical engraving meets Swiss editorial print. Flat and two-dimensional,
ink on paper, fine hairline rules, tick marks, precise geometry, generous margins.
Restrained newspaper-of-record register — quiet and analytical, never decorative or promotional.
ABSOLUTELY NO text, letters, numerals, words, labels, captions, signage or handwriting anywhere.
No photography, no people, no faces, no logos, no brand marks, no badges, stars, seals, ribbons
or award iconography. No gradients, no 3D rendering, no drop shadows, no glow, no neon.
Subject: `;

// One entry per top-level surface. Subjects are abstract diagrams of what the section DOES.
const ART = {
  home: 'a wall of stacked masonry courses seen flat-on, with a single narrow opening cut clean through it; fine measurement rules run along the opening, and the light falling through the gap is picked out in cobalt.',

  // --- the ten disciplines (silos) ---
  'pillars/seo': 'an engraved diagram of a branching root system beneath a horizontal ground rule, roots spreading and dividing into ever finer threads, one deep taproot picked out in cobalt.',
  'pillars/marketing': 'concentric rings radiating outward from a small dense centre, each ring marked with regular tick divisions, one outer arc picked out in cobalt.',
  'pillars/sales': 'a narrowing sequence of horizontal registers stepping down the page, each narrower than the one above, the final smallest register picked out in cobalt.',
  'pillars/content-marketing': 'a stack of ruled paper sheets seen edge-on in slight perspective-free elevation, uniform column rules across each sheet, one sheet picked out in cobalt.',
  'pillars/creative-strategy': 'an engraved compass-and-straightedge construction — overlapping arcs and intersecting guide lines resolving into one clean geometric figure, that resolved figure in cobalt.',
  'pillars/automation': 'a mechanical linkage of interlocking gear profiles and connecting rods drawn as a flat technical elevation, one gear picked out in cobalt.',
  'pillars/thought-leadership': 'a lectern-like plinth rendered as flat engraved geometry with concentric sound rings expanding outward from it, the outermost ring in cobalt.',
  'pillars/demand-gen': 'a field of small uniform marks on the left flowing along fine curved channels into a single collecting funnel on the right, the funnel outlined in cobalt.',
  'pillars/social-media-marketing': 'a lattice of nodes connected by fine straight edges, evenly distributed, with one node and its immediate edges picked out in cobalt.',
  'pillars/ai-marketing': 'an engraved punch-card grid of regular rectangular perforations with fine routing lines threading between them, one routed path in cobalt.',

  // --- reference and editorial surfaces ---
  glossary: 'an engraved index of ruled entry lines of varying length arranged in two columns, with fine leader dots and a row of edge tabs down the right margin, one tab picked out in cobalt.',
  news: 'a broadsheet newspaper sheet drawn flat with a single vertical fold, ruled into narrow columns of blank text-block hatching, one column picked out in cobalt.',
  questions: 'a branching decision tree opening left to right from a single origin point, each fork drawn with fine engraved rules and small terminal nodes, one complete path in cobalt.',
  compare: 'two identical vertical columns of stacked measurement blocks standing side by side with a fine central axis rule between them, one block in the left column picked out in cobalt.',
  entities: 'an exploded stack of flat rectangular plates separated vertically with fine registration lines running through all of them, one plate picked out in cobalt.',
  hubs: 'a route map of straight engraved lines radiating from one central junction to a ring of terminal points, each terminus marked with a small square, one route in cobalt.',
  find: 'a fine rectangular coordinate grid with a crosshair registration mark locating one cell, that cell filled in cobalt.',
  // Deliberately NOT a map. The first pass produced a continental outline that did not read
  // as the United States, and an inaccurate-looking map on a brand whose claim is accuracy is
  // a bad trade for decoration. Sorted magnitude says the same thing and cannot be wrong.
  states: 'rows of small uniform squares stacked into horizontal bars of steeply differing lengths, sorted longest at the top to shortest at the bottom, aligned to a common left baseline rule with fine tick divisions, the longest bar picked out in cobalt.',
  cities: 'a dense concentric city plan of ruled block grids radiating from a small dark core, outer blocks thinning toward the margins, one central block in cobalt.',
  wins: 'a ledger of horizontal ruled lines with paired entry marks in two columns, a running rule down the centre, one completed pair picked out in cobalt.',
  about: 'a sieve or filter drawn as a flat engraved screen, a mass of small uniform marks arriving above it and a smaller ordered set continuing below, the marks rejected at the screen picked out in cobalt.',
  partner: 'two opposing curved arrows forming a closed circuit between two small squares, drawn as fine engraved line work, one arrow in cobalt.',
  press: 'a flat elevation of a hand printing press platen with paper stock stacked beside it and fine registration crosses at the corners, the platen edge picked out in cobalt.',
  badge: 'an engraved bracket-and-rule frame enclosing an empty rectangular field, with corner registration marks and a fine hairline border, the frame in cobalt.'
};

if (LIST) {
  for (const k of Object.keys(ART)) console.log(k);
  process.exit(0);
}

const KEY = apiKey();
const keys = ONLY ? [ONLY] : Object.keys(ART);
let made = 0, skipped = 0, failed = 0, tokens = 0;

for (const k of keys) {
  if (!ART[k]) { console.log(`no such key: ${k}`); failed++; continue; }
  const file = join(OUT, `${k}.png`);
  if (existsSync(file) && !FORCE) { skipped++; continue; }

  const prompt = STYLE + ART[k];
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 200)}`);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, Buffer.from(j.data[0].b64_json, 'base64'));
      tokens += j.usage?.output_tokens || 0;
      console.log(`  ok   ${k}`);
      made++; ok = true;
    } catch (e) {
      console.log(`  retry ${attempt}/3 ${k}: ${e.message.slice(0, 120)}`);
      if (attempt === 3) { failed++; }
      else await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}

console.log(`\ngenerated ${made} · skipped ${skipped} · failed ${failed} · image tokens ${tokens}`);
if (failed) process.exitCode = 1;
