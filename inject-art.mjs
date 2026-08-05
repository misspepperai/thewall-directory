// Place the generated section mastheads on their pages, and produce the web-sized derivatives.
//
// Run after build-art.mjs, and after any build-*.mjs run that regenerates these pages.
// Idempotent: the managed block is stripped and rewritten, never stacked.
//
// PLACEMENT RULE (BRAND-BRIEF §4): generated art is a section masthead, never content-well
// imagery. data/, report/ and tools/ are excluded by design — figures are the subject on those
// pages, and a generated picture beside a sourced number undercuts the number. That exclusion
// is asserted below, not just documented, so it survives someone adding a route later.
//
//   node inject-art.mjs           # derive web images + inject
//   node inject-art.mjs --check   # verify only
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const BEGIN = '<!-- art:begin (managed by inject-art.mjs) -->';
const END = '<!-- art:end -->';
const rx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BLOCK_RE = new RegExp(`\\n?${rx(BEGIN)}[\\s\\S]*?${rx(END)}`, 'g');

// The masthead never renders wider than the site's content column (~1200 CSS px) and never
// taller than 240px. 1400 gives a comfortable retina margin; anything more is bytes the
// homepage pays for above the fold and nobody sees.
const WIDTH = 1400;
const QUALITY = 72;

// art key -> [pages it fronts], and the alt text describing the drawing.
// No visible caption: labelling every illustration "generated · carries no data" was
// housekeeping addressed to nobody. The alt text carries the description for screen
// readers; the AI disclosure lives on ai-policy.html where it belongs.
const PLACE = {
  home: [['index.html', 'An engraved elevation of a stone wall with a single narrow opening cut through it, light falling through the gap picked out in cobalt.']],
  pillars: [['pillars/index.html', 'Ten horizontal bars of stacked squares sorted longest to shortest against a common baseline, the longest picked out in cobalt.']],
  glossary: [['glossary.html', 'An engraved two-column index of ruled entry lines with leader dots and edge tabs.']],
  news: [['news/index.html', 'An engraved broadsheet sheet ruled into narrow columns, one column picked out in cobalt.'], ['news/updates/index.html', 'An engraved broadsheet sheet ruled into narrow columns, one column picked out in cobalt.']],
  questions: [['questions/index.html', 'An engraved decision tree branching left to right from a single origin, one path picked out in cobalt.']],
  compare: [['compare/index.html', 'Two identical columns of stacked measurement blocks either side of a central axis rule.']],
  entities: [['entities/index.html', 'An exploded stack of flat plates separated by vertical registration lines.']],
  hubs: [['hubs/index.html', 'A route map of straight lines radiating from a central junction to a ring of terminal points.']],
  find: [['find/index.html', 'A fine coordinate grid with a crosshair registration mark locating one cell.']],
  states: [['states/index.html', 'Rows of small squares stacked into horizontal bars of differing lengths, sorted longest to shortest against a common baseline.']],
  cities: [['cities/index.html', 'A concentric city plan of ruled block grids radiating from a dense core.']],
  wins: [['wins/index.html', 'A ruled ledger of paired entry marks in two columns.']],
  about: [['about.html', 'An engraved sieve with a mass of marks arriving above it and a smaller ordered set continuing below.']],
  partner: [['partner.html', 'Two opposing curved arrows forming a closed circuit between two squares.']],
  press: [['press.html', 'A flat elevation of a hand printing press platen with paper stock stacked beside it.']],
  badge: [['badge/index.html', 'An engraved bracket-and-rule frame enclosing an empty rectangular field.']]
};
for (const slug of ['seo', 'marketing', 'sales', 'content-marketing', 'creative-strategy', 'automation', 'thought-leadership', 'demand-gen', 'social-media-marketing', 'ai-marketing']) {
  PLACE[`pillars/${slug}`] = [[`pillars/${slug}.html`, `An abstract engraved diagram representing the ${slug.replace(/-/g, ' ')} discipline.`]];
}

// Pages where generated imagery is not permitted. Asserted, not merely intended.
const FORBIDDEN = [/^data\//, /^report\//, /^tools\//, /^c\//];
for (const [key, targets] of Object.entries(PLACE)) {
  for (const [page] of targets) {
    if (FORBIDDEN.some(re => re.test(page))) {
      throw new Error(`inject-art: "${key}" targets ${page}, where generated imagery is forbidden — figures are the subject there (BRAND-BRIEF §4)`);
    }
  }
}

const css = `<style>
.masthead{margin:0 0 26px;border:1px solid var(--stone,#E7E3DA);background:var(--porcelain,#FAF9F6);overflow:hidden}
.masthead img{display:block;width:100%;height:clamp(150px,20vw,240px);object-fit:cover;object-position:center}
</style>`;

let derived = 0, injected = 0, missingArt = [], missingPage = [];

for (const [key, targets] of Object.entries(PLACE)) {
  const src = join(ROOT, 'art', `${key}.png`);
  if (!existsSync(src)) { missingArt.push(key); continue; }

  const webRel = `art/web/${key}.webp`;
  const web = join(ROOT, webRel);
  if (!CHECK && !existsSync(web)) {
    mkdirSync(dirname(web), { recursive: true });
    await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(web);
    derived++;
  }

  for (const [page, alt] of targets) {
    const abs = join(ROOT, page);
    if (!existsSync(abs)) { missingPage.push(page); continue; }
    let html = readFileSync(abs, 'utf8');
    html = html.replace(BLOCK_RE, '');

    const depth = page.split('/').length - 1;
    const href = '../'.repeat(depth) + webRel;
    const block = `${BEGIN}${css}
<figure class="masthead">
  <img src="${href}" alt="${alt}" width="${WIDTH}" height="${Math.round(WIDTH * 1024 / 1536)}" loading="eager" decoding="async">
</figure>
${END}`;

    // Anchor to the opening <main>; every built page and hand-written page has one.
    // Built pages use <main class="wrap"> and are already width-constrained. The homepage
    // uses <main id="home"> with the constraint on each child, so the figure needs its own
    // .wrap there or it bleeds to the viewport edges with a 1px border floating off-screen.
    const mainTag = (html.match(/<main[^>]*>/i) || [''])[0];
    if (!mainTag) { missingPage.push(`${page} (no <main>)`); continue; }
    const wrapped = /class=["'][^"']*\bwrap\b/i.test(mainTag)
      ? block
      : block.replace('<figure class="masthead">', '<div class="wrap"><figure class="masthead">')
             .replace('</figure>', '</figure></div>');
    const next = html.replace(/(<main[^>]*>)/i, `$1\n${wrapped}`);

    if (!CHECK) writeFileSync(abs, next);
    injected++;
  }
}

console.log(`web derivatives : ${derived}`);
console.log(`pages injected  : ${injected}`);
if (missingArt.length) console.log(`missing art     : ${missingArt.join(', ')}`);
if (missingPage.length) console.log(`missing pages   : ${missingPage.join(', ')}`);
if (CHECK && (missingArt.length || missingPage.length)) process.exit(1);
