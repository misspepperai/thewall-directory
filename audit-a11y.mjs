// WCAG 2.1 AA audit over the built HTML.
//
// Checks what is decidable from static markup and the design tokens: alt text, heading
// structure, form labelling, language, skip links, focus styles, link purpose, ARIA
// references, and the contrast of every colour pair the stylesheets actually use.
//
// It does NOT claim to cover WCAG in full. Focus order, keyboard traps, zoom reflow and
// "does the alt text describe the image" need a human at a browser, and are listed as
// manual items in the report rather than silently counted as passes.
//
//   node audit-a11y.mjs           # summary
//   node audit-a11y.mjs --json
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (['.git', 'node_modules', 'og', 'art', '.secrets'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const txt = h => h.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const attrOf = (tag, name) =>
  (tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i')) || [, null])[1];

// ---- contrast ----
const hex2rgb = h => { const s = h.replace('#', ''); const v = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16)); };
const lum = rgb => { const [r, g, b] = rgb.map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const l1 = lum(hex2rgb(a)), l2 = lum(hex2rgb(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

// The palette as declared in the stylesheets, read from index.html's :root so the audit
// tracks the tokens rather than a copy of them that can drift.
const idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
const rootBlock = (idx.match(/:root\s*\{([^}]*)\}/) || [, ''])[1];
const TOKENS = Object.fromEntries([...rootBlock.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)].map(m => [m[1], m[2]]));

// Foreground/background pairs AS THE STYLESHEETS ACTUALLY USE THEM.
//
// An exhaustive fg x bg matrix is misleading: it reported --chrome-dk on --stone at 2.75:1 as
// an AA failure, but that combination appears nowhere. --chrome-dk is used in exactly one
// place, the compare bar, whose background is --ink, where it measures 4.88:1 and passes.
// Reporting failures for pairs that do not exist trains people to ignore the report.
//
// Each entry records where the pair is used so the claim can be checked against the CSS.
const PAIRS = [
  { fg: 'ink',       bg: 'porcelain', use: 'headings, body on page background',        large: false },
  { fg: 'body',      bg: 'porcelain', use: 'paragraph text',                            large: false },
  { fg: 'chrome',    bg: 'porcelain', use: 'meta lines, kickers, footnotes',            large: false },
  { fg: 'cobalt',    bg: 'porcelain', use: 'links and accents',                         large: false },
  { fg: 'oxblood',   bg: 'porcelain', use: 'warnings, removed-listing notes',           large: false },
  { fg: 'ink',       bg: 'stone-lt',  use: 'card headings on tinted panels',            large: false },
  { fg: 'body',      bg: 'stone-lt',  use: 'card body on tinted panels',                large: false },
  { fg: 'chrome',    bg: 'stone-lt',  use: 'card meta on tinted panels',                large: false },
  { fg: 'cobalt',    bg: 'stone-lt',  use: 'links inside tinted panels',                large: false },
  { fg: 'ink',       bg: 'stone',     use: 'table header text on rules',                large: false },
  { fg: 'chrome-dk', bg: 'ink',       use: 'compare-bar labels and links (only use)',   large: false }
];
const contrast = PAIRS.map(p => {
  const hexFg = p.fg.startsWith('#') ? p.fg : TOKENS[p.fg];
  const hexBg = p.bg.startsWith('#') ? p.bg : TOKENS[p.bg];
  const r = ratio(hexFg, hexBg);
  return { fg: `--${p.fg}`, bg: `--${p.bg}`, use: p.use, hexFg, hexBg,
           ratio: +r.toFixed(2), required: p.large ? 3 : 4.5, pass: r >= (p.large ? 3 : 4.5) };
});

const files = walk(ROOT);
const F = {
  missingAlt: [], emptyTitleAlt: [], noH1: [], multiH1: [], headingSkip: [],
  unlabeledInput: [], unlabeledInputInScript: [], noLang: [], noSkipLink: [], vagueLink: [], emptyLink: [],
  positiveTabindex: [], badAriaRef: [], dupeTitle: [], noMainLandmark: [], imgNoDims: []
};
const titles = new Map();
const VAGUE = /^(click here|here|read more|more|learn more|link|this|details|go|view|continue|see more|click)$/i;

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const html = readFileSync(abs, 'utf8');
  const body = html.slice(html.search(/<body/i)).replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  const push = (k, extra = {}) => F[k].push({ rel, ...extra });

  if (!/<html[^>]*\slang=/i.test(html)) push('noLang');
  if (!/<main[\s>]/i.test(html)) push('noMainLandmark');

  // SC 2.4.2 asks for a descriptive title; duplicate titles are only a defect when both pages
  // are competing to be indexed. A page that canonicals to a sibling has already conceded.
  const canonical = (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [, ''])[1];
  const selfCanonical = !canonical || canonical.endsWith(`/${rel}`) || canonical.endsWith(`/${rel.replace(/index\.html$/, '')}`);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
  if (title && selfCanonical) (titles.get(title) || titles.set(title, []).get(title)).push(rel);

  // A skip link must be near the top of the document AND point at an element that exists.
  // Matching on a whitelist of target names ("#main", "#content") wrongly failed the two
  // pages whose main landmark is #home and #dash — the anchor is resolved instead.
  const firstChunk = body.slice(0, 4000);
  const skip = firstChunk.match(/<a[^>]+href=["']#([^"']+)["'][^>]*>/i);
  const targetExists = skip && new RegExp(`\\sid=["']${skip[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html);
  if (!targetExists) push('noSkipLink', skip ? { deadAnchor: `#${skip[1]}` } : {});

  for (const tag of body.match(/<img\b[^>]*>/gi) || []) {
    const alt = attrOf(tag, 'alt');
    if (alt === null) push('missingAlt', { tag: tag.slice(0, 90) });
    if (!attrOf(tag, 'width') || !attrOf(tag, 'height')) push('imgNoDims', { tag: tag.slice(0, 70) });
  }

  const headings = [...body.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({ l: +m[1][1], t: txt(m[2]) }));
  const h1 = headings.filter(h => h.l === 1);
  if (!h1.length) push('noH1');
  if (h1.length > 1) push('multiH1', { n: h1.length });
  let prev = 0;
  for (const h of headings) { if (prev && h.l > prev + 1) push('headingSkip', { from: prev, to: h.l, text: h.t.slice(0, 40) }); prev = h.l; }

  // Form controls need a programmatic name: a wrapping/for-linked <label>, aria-label,
  // aria-labelledby, or title. A placeholder alone is not an accessible name.
  const labelFor = new Set([...body.matchAll(/<label[^>]*\sfor=["']([^"']+)["']/gi)].map(m => m[1]));
  for (const tag of body.match(/<(input|select|textarea)\b[^>]*>/gi) || []) {
    const type = (attrOf(tag, 'type') || '').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
    const id = attrOf(tag, 'id');
    const named = (id && labelFor.has(id)) || attrOf(tag, 'aria-label') || attrOf(tag, 'aria-labelledby') || attrOf(tag, 'title');
    if (!named) push('unlabeledInput', { tag: tag.slice(0, 90) });
  }

  // The same check again, over the CONTENTS of the inline scripts.
  //
  // `body` has scripts stripped, so the loop above only ever sees controls that exist in the
  // file on disk. The atlas builds its filter bar in JavaScript, and its five <select> elements
  // were therefore invisible to this audit while being plainly unlabelled in the browser — a
  // Level A defect that a Lighthouse run caught and this file reported as zero. Reading built
  // HTML cannot see a control the browser creates at runtime; that is a property of static
  // analysis, not a bug that got fixed.
  //
  // This is a heuristic, not a parse: labels and controls in a template literal are matched
  // textually, and markup assembled from concatenated fragments will still slip through. It
  // narrows the blind spot rather than closing it. A browser pass remains the authority.
  for (const s of html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []) {
    // A control wrapped BY a label is named by it and carries no id — the compare checkbox on
    // every listing card is written that way. Matching only `for=` reported those as unnamed,
    // so wrapped controls are collected first and skipped. Both spellings of the association
    // are valid; an audit that knows one of them invents defects.
    const wrapped = new Set([...s.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)]
      .flatMap(m => m[0].match(/<(input|select|textarea)\b[^>]*>/gi) || []));
    // Ids in a template are interpolated ("e-name-${r.id}"), so both sides are compared with
    // the interpolation removed — otherwise a correctly associated pair never matches itself.
    const flat = v => String(v || '').replace(/\$\{[^}]*\}/g, '\u0000');
    const forAttr = new Set([...s.matchAll(/<label[^>]*\sfor=\\?["']([^"'\\]+)/gi)].map(m => flat(m[1])));
    for (const tag of s.match(/<(input|select|textarea)\b[^>]*>/gi) || []) {
      const type = (attrOf(tag, 'type') || '').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
      if (wrapped.has(tag)) continue;
      const id = flat(attrOf(tag, 'id'));
      const named = (id && forAttr.has(id)) || attrOf(tag, 'aria-label')
        || attrOf(tag, 'aria-labelledby') || attrOf(tag, 'title');
      if (!named) push('unlabeledInputInScript', { tag: tag.slice(0, 90) });
    }
  }

  for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const inner = txt(m[2]);
    const name = inner || attrOf(`<a${m[1]}>`, 'aria-label') || attrOf(`<a${m[1]}>`, 'title');
    if (!name) push('emptyLink', { tag: `<a${m[1]}>`.slice(0, 90) });
    else if (VAGUE.test(name)) push('vagueLink', { text: name });
  }

  for (const tag of body.match(/<[^>]+\stabindex=["'][^"']*["'][^>]*>/gi) || []) {
    const t = +attrOf(tag, 'tabindex');
    if (t > 0) push('positiveTabindex', { tag: tag.slice(0, 70) });
  }

  // aria-labelledby / aria-describedby / aria-controls must point at IDs that exist.
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]));
  for (const m of body.matchAll(/\saria-(labelledby|describedby|controls)=["']([^"']+)["']/gi)) {
    for (const ref of m[2].split(/\s+/)) if (ref && !ids.has(ref)) push('badAriaRef', { attr: m[1], ref });
  }
}

F.dupeTitle = [...titles].filter(([, v]) => v.length > 1).map(([t, v]) => ({ title: t, files: v }));

const report = {
  scanned: files.length,
  tokens: TOKENS,
  contrast,
  contrastFailures: contrast.filter(c => !c.pass),
  findings: Object.fromEntries(Object.entries(F).map(([k, v]) => [k, v.length])),
  detail: F,
  manualReview: [
    'Focus order matches visual order (2.4.3) — needs a keyboard pass in a browser',
    'No keyboard traps (2.1.2) — needs a keyboard pass in a browser',
    'Reflow at 200% zoom / 320px (1.4.10) — needs a browser at width',
    'Alt text accurately describes each image (1.1.1) — machine can verify presence, not accuracy',
    'Motion respects prefers-reduced-motion (2.3.3) — guard is present site-wide; confirm visually'
  ]
};

if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

console.log(`scanned: ${report.scanned} pages\n`);
console.log('LEVEL A / AA — MARKUP');
for (const [k, v] of Object.entries(report.findings)) console.log(`  ${v ? '🔴' : '  '} ${k.padEnd(20)} ${v}`);
console.log('\nCONTRAST — pairs the stylesheets actually use, computed from the tokens');
for (const c of [...contrast].sort((a, b) => a.ratio - b.ratio)) {
  console.log(`  ${c.pass ? '✅' : '🔴'} ${String(c.ratio).padStart(6)}:1 (needs ${c.required})  ${c.fg} on ${c.bg} — ${c.use}`);
}
