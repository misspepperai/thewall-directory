// Site-wide accessibility chrome: a skip-to-content link and a visible focus style.
//
// WCAG 2.1 SC 2.4.1 (Bypass Blocks, Level A) requires a way past the repeated navigation.
// Every page on this site opens with the same masthead and nav, so a keyboard or screen-reader
// user was tabbing through the whole menu on all 2,591 pages before reaching any content.
//
// This is a post-processor rather than an edit to twelve builders and a handful of
// hand-written pages, for the same reason inject-og.mjs is: one pass over the rendered HTML
// covers every URL through one code path. It is deliberately NOT done in nav.js — a skip link
// that depends on JavaScript is missing exactly when the page is degraded and the user most
// needs it.
//
// Idempotent: the managed block is stripped before it is rewritten.
//
//   node inject-a11y.mjs           # write
//   node inject-a11y.mjs --check   # report only, exit 1 if any page is missing the block
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');

const BEGIN = '<!-- a11y:begin (managed by inject-a11y.mjs) -->';
const END = '<!-- a11y:end -->';
const rx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BLOCK_RE = new RegExp(`\\n?${rx(BEGIN)}[\\s\\S]*?${rx(END)}`, 'g');

// The link is visually hidden until focused, then pinned to the top-left. It is NOT
// display:none or visibility:hidden — either would take it out of the tab order and defeat
// the purpose. :focus-visible alone would miss browsers that only fire :focus here.
//
// The focus ring is declared for every interactive element as well: the design uses custom
// styling throughout, and several components had suppressed outlines with nothing in their
// place, which is SC 2.4.7 (Focus Visible).
const CSS = `<style>
.skip-link{position:absolute;left:-9999px;top:0;z-index:100;padding:12px 18px;background:var(--ink,#0E1B33);color:#fff;font-family:var(--sans,system-ui,sans-serif);font-size:14px;font-weight:600;text-decoration:none}
.skip-link:focus,.skip-link:focus-visible{left:0}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--cobalt,#1B4FD8);outline-offset:2px}
@media (prefers-contrast:more){a:focus-visible,button:focus-visible{outline-width:4px}}
</style>`;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (['.git', 'node_modules', 'og', 'art', '.secrets'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let written = 0;
const problems = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, '/');
  let html = readFileSync(abs, 'utf8').replace(BLOCK_RE, '');

  const mainTag = (html.match(/<main[^>]*>/i) || [''])[0];
  if (!mainTag) { problems.push(`${rel} (no <main> to skip to)`); continue; }

  // Reuse an existing id where the page has one; otherwise give <main> a stable target.
  // The anchor has to point at something real or the link silently does nothing.
  let id = (mainTag.match(/\sid=["']([^"']+)["']/i) || [, null])[1];
  if (!id) {
    id = 'main';
    html = html.replace(/<main([^>]*)>/i, (m, attrs) => `<main${attrs} id="main" tabindex="-1">`);
  } else if (!/\stabindex=/i.test(mainTag)) {
    // tabindex="-1" makes the target programmatically focusable, so the skip actually moves
    // focus rather than only scrolling — without it, the next Tab returns to the nav.
    html = html.replace(/<main([^>]*)>/i, (m, attrs) => `<main${attrs} tabindex="-1">`);
  }

  const block = `${BEGIN}${CSS}\n<a class="skip-link" href="#${id}">Skip to main content</a>\n${END}`;
  // First thing inside <body>, so it is the first focusable element on the page.
  const next = html.replace(/<body([^>]*)>/i, m => `${m}\n${block}`);
  if (next === html) { problems.push(`${rel} (no <body>)`); continue; }

  if (!CHECK) writeFileSync(abs, next);
  written++;
}

console.log(`html files       : ${files.length}`);
console.log(`skip link written: ${written}`);
if (problems.length) {
  console.log(`\nproblems (${problems.length}):`);
  for (const p of problems.slice(0, 20)) console.log('  ' + p);
}
if (problems.length) process.exit(1);
