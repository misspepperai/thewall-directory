// Structural integrity check for every HTML file on the site.
//
// WHY: HTML has one rule that bites harder than any other — inside a <script> element the
// parser is NOT reading JavaScript, it is scanning for the characters "</script>". It does not
// know about strings, comments, or JSON. So a literal closing script tag anywhere in the body
// of an inline script silently ends the element there and dumps the remainder of the file into
// the DOM as text. The page still returns 200. Nothing logs an error. The half of the script
// that never ran simply never runs.
//
// This has now bitten twice on this site:
//   1. Three vendor records carried scraped markup in site_description, including a literal
//      closing script tag. Embedded in JSON-LD it destroyed those three pages.
//   2. The code comment written to document defect (1) quoted the tag literally, inside an
//      inline script, and took the homepage atlas down with it.
//
// Both are the same defect and both are mechanically detectable, so they are checked here
// rather than trusted to review.
//
//   node check-html.mjs           # check everything
//   node check-html.mjs index.html c/loom.com.html
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = dirname(fileURLToPath(import.meta.url));
const EXPLICIT = process.argv.slice(2).filter(a => !a.startsWith('--'));

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === '.git' || e === 'node_modules' || e === 'og' || e === 'art' || e === '.secrets') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = EXPLICIT.length ? EXPLICIT.map(f => join(ROOT, f)) : walk(ROOT);
const SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

let checked = 0;
const problems = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  const html = readFileSync(abs, 'utf8');
  const fail = msg => problems.push(`${rel}: ${msg}`);
  checked++;

  // Every built page has a main landmark. Its absence means the document was truncated,
  // which is exactly what an early script termination looks like from the outside.
  if (!/<main[\s>]/i.test(html)) fail('no <main> element — document is malformed or truncated');

  for (const m of html.matchAll(SCRIPT_RE)) {
    const attrs = m[1], body = m[2];
    const line = html.slice(0, m.index).split('\n').length;
    const isJSONLD = /application\/ld\+json/i.test(attrs);
    const isExternal = /\ssrc=/i.test(attrs);

    if (isJSONLD) {
      try { JSON.parse(body); }
      catch (e) { fail(`line ${line}: JSON-LD does not parse — ${e.message.slice(0, 80)}`); continue; }
      // JSON.stringify escapes quotes and backslashes but NOT "<", so a "<" that survives
      // into the element is unescaped output. Harmless today if it is a rate band, fatal
      // the moment the value is scraped markup. Escape it as < at the serializer.
      if (body.includes('<')) fail(`line ${line}: raw "<" inside JSON-LD — escape as \\u003c at the serializer`);
    } else if (!isExternal && body.trim()) {
      // A script cut short by a stray closing tag leaves a syntax error on BOTH halves.
      // Parsing is the general test; it catches truncation without knowing what truncated it.
      try { new vm.Script(body, { filename: `${rel}:${line}` }); }
      catch (e) {
        fail(`line ${line}: inline script does not parse — ${e.message.slice(0, 90)}`);
        fail(`  ↳ most likely a literal closing script tag in a string or comment inside the script body`);
      }
    }
  }
}

console.log(`html files checked : ${checked}`);
console.log(`problems           : ${problems.length}`);
for (const p of problems.slice(0, 40)) console.log('  ' + p);
if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`);
if (problems.length) process.exit(1);
