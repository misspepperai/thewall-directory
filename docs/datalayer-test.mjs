// Faithful production-path test: nothing of ours is stubbed. nav.js defines gtag
// itself; we only read window.dataLayer, which is exactly what the real gtag.js
// consumes. If events land here, they land in GA4.
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

const REPO = '/home/dan/directory-thewall';
const NAVJS = readFileSync(`${REPO}/nav.js`, 'utf8');

const vc = new VirtualConsole();
const errs = [];
vc.on('jsdomError', e => errs.push('jsdomError: ' + e.message));
vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(readFileSync(`${REPO}/c/108degrees.com.html`, 'utf8'), {
  url: 'https://hitthewall.net/c/108degrees.com.html',
  runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  resources: undefined, // do not fetch gtag.js — mirrors it being blocked/slow
});
const w = dom.window;

// Run nav.js exactly as a <script src> would.
try { w.eval(NAVJS); } catch (e) { errs.push('nav.js THREW: ' + e.message); }

console.log('errors during load:', errs.length ? errs : 'none');
console.log('window.gtag defined:', typeof w.gtag);
console.log('window.dataLayer exists:', Array.isArray(w.dataLayer));
console.log('dataLayer after load:', (w.dataLayer || []).map(a => Array.from(a)[0] + ':' + (Array.from(a)[1] || '')));

const before = (w.dataLayer || []).length;
const a = w.document.querySelector('.claim .a-pri');
console.log('\n.claim .a-pri found:', !!a, a && a.getAttribute('href').slice(0, 40));

a.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));

const pushed = (w.dataLayer || []).slice(before).map(x => Array.from(x));
console.log('dataLayer pushes from the click:', JSON.stringify(pushed, null, 2));

const fired = pushed.some(p => p[0] === 'event' && p[1] === 'claim_click');
console.log('\nclaim_click reached dataLayer:', fired ? 'YES' : 'NO');
process.exit(fired ? 0 : 1);
