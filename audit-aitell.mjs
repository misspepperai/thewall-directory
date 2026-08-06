// AI-tell scan over the site's genuinely written surfaces.
//
// SCOPE: news/ briefings, hubs/ guides, questions/ answers and the core pages. Listing pages are
// deliberately excluded — their copy is composed from database columns by template, so it is
// repetitive by construction and scoring it as prose measures the template, not the writing.
//
// Patterns from Wikipedia's "Signs of AI writing". The scan counts tells; it does not decide.
// A single em dash means nothing. Clusters are the signal, so output is ranked by tells per
// 1,000 words and every hit is quoted for a human to judge.
//
//   node audit-aitell.mjs
//   node audit-aitell.mjs --json
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const SURFACES = [/^news\//, /^hubs\//, /^questions\//, /^(about|partner|press|editorial-policy|ai-policy)\.html$/];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (['.git', 'node_modules', 'og', 'art', '.secrets', 'c'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

// Prose only. Nav, tables, data cells and code are not writing and would skew every count.
function prose(html) {
  let s = html.slice(html.search(/<main/i));
  s = s.replace(/<(script|style|table|nav|footer)[\s\S]*?<\/\1>/gi, ' ');
  const paras = [...s.matchAll(/<(p|li|h2|h3|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => m[2]);
  return paras.map(t => t.replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&[lr]dquo;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
}

const PATTERNS = [
  ['significance-inflation', /\b(stands as|serves as|is a testament|testament to|underscor\w+|highlight(?:s|ing) (?:the |its )?(?:importance|significance)|pivotal|reflects? a broader|marking a|represents a shift|turning point|evolving landscape|indelible|deeply rooted)\b/gi],
  ['ai-vocabulary', /\b(delve|intricate|intricacies|tapestry|vibrant|crucial|foster(?:s|ing)?|garner\w*|interplay|showcas\w+|myriad|realm|robust|seamless\w*|leverag(?:e|es|ed|ing) (?:our|their|its|the) |holistic|nuanced)\b/gi],
  ['promotional', /\b(boasts?|nestled|in the heart of|renowned|breathtaking|stunning|must-visit|cutting-edge|state-of-the-art|world-class|unparalleled)\b/gi],
  ['copula-avoidance', /\b(serves as a|stands as a|represents a|boasts a|offers a comprehensive)\b/gi],
  ['negative-parallelism', /\b(not (?:just|only|merely) [^.,;]{3,50}?,? (?:but|it'?s)\b|isn'?t (?:just|only) [^.,;]{3,50}?,? it'?s)\b/gi],
  ['persuasive-authority', /\b(the real question is|at its core|what really matters|the deeper issue|the heart of the matter|fundamentally,)/gi],
  ['signposting', /\b(let'?s (?:dive|explore|break this down|look at)|here'?s what you need to know|without further ado|in this (?:article|guide|post),? we)/gi],
  ['rhetorical-opener', /(?:^|\. )(Honestly\?|Look,|Here'?s the thing|The thing is,|Let'?s be honest|Real talk)/g],
  ['vague-attribution', /\b(industry reports|observers have|experts (?:argue|believe|say)|some critics argue|many believe|it is (?:believed|widely held)|studies show)\b/gi],
  ['hedging', /\b(could potentially|might possibly|it could be argued|arguably one of|somewhat of a|relatively speaking)\b/gi],
  ['filler', /\b(in order to|due to the fact that|at this point in time|it is important to note|it'?s worth noting that|has the ability to|in the event that)\b/gi],
  ['generic-conclusion', /\b(the future looks|exciting times|a step in the right direction|only time will tell|one thing is clear)\b/gi],
  ['aphorism-formula', /\b(is the (?:language|currency|architecture|backbone) of|becomes a trap)\b/gi],
  // Em dash and en dash are counted separately, and a en dash BETWEEN DIGITS is not counted at
  // all: "$40–$100/hr" and "11–50 people" are correct typography for a numeric range, not a
  // stylistic tic. Conflating the two put this site at 523 dashes when most were rate bands.
  ['em-dash', /—/g],
  ['en-dash-in-prose', /(?<!\d\s?)(?<![\d$])–(?![\d$])/g],
  // Double curly QUOTATION MARKS only. The right single quote is the correct apostrophe in
  // "The Wall's" and "won't"; flagging it counted good typography as a defect.
  ['curly-quote', /[“”]/g],
  // Pictographs only. The U+2600-27BF block also holds ★ and ✓, which this site uses as
  // rating and status glyphs — content, not decoration.
  ['emoji', /[\u{1F300}-\u{1FAFF}\u{1F004}-\u{1F0CF}]/gu]
];

const files = walk(ROOT).filter(f => SURFACES.some(re => re.test(relative(ROOT, f).replace(/\\/g, '/'))));
const results = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const paras = prose(readFileSync(abs, 'utf8'));
  const text = paras.join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 80) continue;

  const hits = {};
  const quotes = [];
  for (const [name, re] of PATTERNS) {
    const found = [...text.matchAll(re)];
    if (!found.length) continue;
    hits[name] = found.length;
    for (const m of found.slice(0, 3)) {
      quotes.push({ pattern: name, text: text.slice(Math.max(0, m.index - 55), m.index + m[0].length + 55).trim() });
    }
  }

  // Rule of three: three items separated by commas ending in "and X" — counted separately
  // because it needs sentence context rather than a keyword.
  const ruleOfThree = (text.match(/\b\w+, \w+(?: \w+)?, and \w+/g) || []).length;
  if (ruleOfThree) hits['rule-of-three'] = ruleOfThree;

  // Sentence-length variance. Human prose alternates; AI prose clusters at mid-length.
  const lens = text.split(/(?<=[.!?])\s+/).map(s => s.split(/\s+/).length).filter(n => n > 2);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));

  const total = Object.values(hits).reduce((a, b) => a + b, 0);
  results.push({ rel, words, sentences: lens.length, meanSentence: +mean.toFixed(1),
    sentenceSD: +sd.toFixed(1), tells: total, per1k: +(total / words * 1000).toFixed(1), hits, quotes });
}

results.sort((a, b) => b.per1k - a.per1k);

const agg = {};
for (const r of results) for (const [k, v] of Object.entries(r.hits)) agg[k] = (agg[k] || 0) + v;

const report = { surfacesScanned: results.length,
  totalWords: results.reduce((a, r) => a + r.words, 0),
  byPattern: Object.entries(agg).sort((a, b) => b[1] - a[1]), pages: results };

if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

console.log(`written surfaces scanned : ${report.surfacesScanned}`);
console.log(`words                    : ${report.totalWords.toLocaleString()}\n`);
console.log('TELLS BY PATTERN');
for (const [k, v] of report.byPattern) console.log(`  ${k.padEnd(24)} ${v}`);
console.log('\nWORST PAGES (tells per 1,000 words)');
for (const r of results.slice(0, 12)) {
  console.log(`  ${String(r.per1k).padStart(5)}  ${r.rel}  (${r.words}w, mean sentence ${r.meanSentence}, sd ${r.sentenceSD})`);
  console.log(`         ${Object.entries(r.hits).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}
