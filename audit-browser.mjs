// Browser-driven checks — the ones no amount of reading built HTML can settle.
//
// audit-a11y.mjs reads files on disk. That is the right default, but it is blind to anything the
// browser constructs, and it cannot evaluate behaviour at all: whether focus moves in the order a
// sighted user reads, whether a modal can be escaped, whether the page reflows at 320px. A
// Lighthouse run on 2026-08-05 found three real defects this project had recorded as zero, which
// is what motivated this file.
//
// It drives Chrome over the DevTools Protocol directly — no puppeteer, no lighthouse, no install.
// Chrome ships in the puppeteer cache; its four NSS dependencies are resolved from a user-space
// directory via LD_LIBRARY_PATH (see NSS_LIB below), so this needs no root.
//
//   node audit-browser.mjs            # all criteria, all sample pages
//   node audit-browser.mjs --json
//   node audit-browser.mjs --url https://hitthewall.net/data/
//
// WHAT IT DOES NOT DO: alt-text accuracy (1.1.1) is a human judgement about whether a description
// is correct, not a thing a machine can assert. It stays outstanding by design.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const urlArg = process.argv.indexOf('--url');
const PORT = 9222;

// Chrome from the puppeteer cache, whichever version is present.
const CACHE = join(process.env.HOME, '.cache/puppeteer/chrome');
const rev = existsSync(CACHE) ? readdirSync(CACHE).sort().pop() : null;
if (!rev) { console.error('No Chrome in ~/.cache/puppeteer/chrome.'); process.exit(1); }
const CHROME = join(CACHE, rev, 'chrome-linux64', 'chrome');
const NSS_LIB = process.env.THEWALL_NSS_LIB || '';

const SITE = 'https://hitthewall.net';
const PAGES = urlArg > -1 ? [['custom', process.argv[urlArg + 1]]] : [
  ['homepage',      `${SITE}/`],
  ['listing',       `${SITE}/c/victorious.com.html`],
  ['hub',           `${SITE}/hubs/b2b-marketing-agency.html`],
  ['news index',    `${SITE}/news/`],
  ['data tables',   `${SITE}/data/`],
  ['find grid',     `${SITE}/find/content-marketing-agencies-florida.html`]
];

// ---------------------------------------------------------------- CDP plumbing
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launch() {
  const env = { ...process.env };
  if (NSS_LIB) env.LD_LIBRARY_PATH = `${NSS_LIB}${env.LD_LIBRARY_PATH ? ':' + env.LD_LIBRARY_PATH : ''}`;
  const proc = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--disable-dev-shm-usage', '--no-first-run', '--disable-extensions',
    `--remote-debugging-port=${PORT}`, 'about:blank'
  ], { env, stdio: 'ignore' });

  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return { proc, ws: (await r.json()).webSocketDebuggerUrl };
    } catch { /* not up yet */ }
    await sleep(250);
  }
  proc.kill();
  throw new Error('Chrome did not expose a debugging port.');
}

// Minimal CDP client. One socket to the browser, flat sessions per tab.
function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(`${m.error.message}`)) : resolve(m.result);
    } else if (m.method) events.push(m);
  });
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const msg = { id: ++id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    pending.set(msg.id, { resolve, reject });
    ws.send(JSON.stringify(msg));
    setTimeout(() => { if (pending.delete(msg.id)) reject(new Error(`${method} timed out`)); }, 45000);
  });
  return { ws, send, ready, events, close: () => ws.close() };
}

async function newPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => cdp.send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable'); await S('DOM.enable');
  // Without this, a headless page is never "focused" and synthesised Tab keys do not move
  // focus at all. The first run of this file reported 6-9 tab stops on pages with dozens of
  // links and called every page a keyboard trap — the keys were going nowhere.
  await S('Emulation.setFocusEmulationEnabled', { enabled: true });
  return { targetId, sessionId, S, close: () => cdp.send('Target.closeTarget', { targetId }) };
}

async function evalJs(S, expression) {
  const r = await S('Runtime.evaluate', {
    expression: `(() => { ${expression} })()`,
    returnByValue: true, awaitPromise: true
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
  return r.result.value;
}

async function goto(S, url) {
  await S('Page.navigate', { url });
  // Wait for the load event, then a beat for the atlas to fetch and render.
  for (let i = 0; i < 80; i++) {
    const state = await evalJs(S, 'return document.readyState');
    if (state === 'complete') break;
    await sleep(250);
  }
  await sleep(1200);
}

const tab = (S, shift = false) => S('Input.dispatchKeyEvent', {
  type: 'rawKeyDown', windowsVirtualKeyCode: 9, code: 'Tab', key: 'Tab',
  modifiers: shift ? 8 : 0
}).then(() => S('Input.dispatchKeyEvent', {
  type: 'keyUp', windowsVirtualKeyCode: 9, code: 'Tab', key: 'Tab', modifiers: shift ? 8 : 0
}));

const press = (S, key, vk) => S('Input.dispatchKeyEvent', {
  type: 'rawKeyDown', windowsVirtualKeyCode: vk, code: key, key
}).then(() => S('Input.dispatchKeyEvent', {
  type: 'keyUp', windowsVirtualKeyCode: vk, code: key, key
}));

// Describes whatever currently holds focus, with its position in the document.
const FOCUS_PROBE = `
  const a = document.activeElement;
  if (!a || a === document.body) return { tag: 'BODY', name: '(body)', top: -1, left: -1 };
  const r = a.getBoundingClientRect();
  const name = (a.getAttribute('aria-label') || a.textContent || a.value || a.tagName)
    .toString().replace(/\\s+/g, ' ').trim().slice(0, 48);
  return {
    tag: a.tagName,
    name,
    top: Math.round(r.top + window.scrollY),
    left: Math.round(r.left + window.scrollX),
    w: Math.round(r.width), h: Math.round(r.height),
    inDialog: !!a.closest('dialog, [role=dialog]'),
    hidden: r.width === 0 && r.height === 0,
    path: a.tagName + (a.id ? '#' + a.id : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '')
  };`;

// ------------------------------------------------------------------ the checks

// 2.4.3 Focus Order + 2.4.7 Focus Visible
async function focusOrder(S) {
  await evalJs(S, 'document.body.focus(); window.scrollTo(0,0); return 1');
  const seq = [];
  for (let i = 0; i < 120; i++) {
    await tab(S);
    const f = await evalJs(S, FOCUS_PROBE);
    if (f.tag === 'BODY' && seq.length > 3) break;      // cycled back out
    seq.push(f);
  }

  // Out-of-order = focus jumps UP the page by more than a comfortable row height while not
  // inside a dialog. Small upward moves are normal (a row of links wraps, a sticky bar).
  const jumps = [];
  for (let i = 1; i < seq.length; i++) {
    const p = seq[i - 1], c = seq[i];
    if (p.inDialog || c.inDialog || p.top < 0 || c.top < 0) continue;
    if (c.top < p.top - 120) jumps.push({ from: `${p.path} @${p.top}`, to: `${c.path} @${c.top}` });
  }
  const hidden = seq.filter(f => f.hidden && !f.inDialog).map(f => f.path);

  // 2.4.7 — something must visibly change on focus. Checked on the first real control.
  const visible = await evalJs(S, `
    const el = document.querySelector('a[href], button, input, select');
    if (!el) return { ok: true, note: 'no focusable control' };
    const before = getComputedStyle(el);
    const b = { outline: before.outlineStyle + before.outlineWidth, shadow: before.boxShadow, bg: before.backgroundColor, bc: before.borderColor };
    el.focus();
    const after = getComputedStyle(el, ':focus-visible') || getComputedStyle(el);
    const a = { outline: after.outlineStyle + after.outlineWidth, shadow: after.boxShadow, bg: after.backgroundColor, bc: after.borderColor };
    const changed = JSON.stringify(a) !== JSON.stringify(b) || a.outline !== 'none0px';
    return { ok: changed, before: b, after: a };`);

  return { tabStops: seq.length, outOfOrder: jumps, focusableButInvisible: [...new Set(hidden)], focusVisible: visible };
}

// 2.1.2 No Keyboard Trap — including the modal, which is the classic offender
async function keyboardTrap(S, hasModal) {
  const stuck = [];
  await evalJs(S, 'document.body.focus(); return 1');
  // Identity must include the name and position, not just tag+class. Consecutive footer links
  // are all bare "A" elements, so comparing the selector alone made six ordinary links in a row
  // look like focus stuck on one — the first run of this file called every page a trap that way.
  const idOf = f => `${f.path}|${f.name}|${f.top},${f.left}`;
  let last = null, run = 0;
  for (let i = 0; i < 160; i++) {
    await tab(S);
    const f = await evalJs(S, FOCUS_PROBE);
    const id = idOf(f);
    if (id === last) { if (++run >= 6) { stuck.push(`${f.path} "${f.name}"`); break; } } else { run = 0; last = id; }
  }

  let modal = null;
  if (hasModal) {
    const opened = await evalJs(S, `
      if (typeof openSubmit !== 'function') return null;
      openSubmit();
      const d = document.querySelector('dialog[open], dialog');
      return { open: !!(d && (d.open || d.hasAttribute('open'))) };`);
    if (opened) {
      // Inside a modal, focus SHOULD stay contained — that is correct behaviour, not a trap.
      // The trap test is whether there is a way out: Escape must close it.
      for (let i = 0; i < 25; i++) await tab(S);
      const containedAt = await evalJs(S, FOCUS_PROBE);
      await press(S, 'Escape', 27);
      await sleep(400);
      const afterEsc = await evalJs(S, `
        const d = document.querySelector('dialog');
        return { stillOpen: !!(d && (d.open || d.hasAttribute('open'))) };`);
      modal = { opened: opened.open, focusStaysInside: containedAt.inDialog, escapeCloses: !afterEsc.stillOpen };
    }
  }
  return { stuckOn: [...new Set(stuck)], modal };
}

// 1.4.10 Reflow — 320 CSS px, which is 1280 at 400% zoom
async function reflow(S, url) {
  await S('Emulation.setDeviceMetricsOverride', {
    width: 320, height: 512, deviceScaleFactor: 1, mobile: true
  });
  await goto(S, url);
  const r = await evalJs(S, `
    const de = document.documentElement;
    const over = [...document.querySelectorAll('body *')]
      .filter(el => {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return false;
        // An element inside a deliberate horizontal scroller is fine — that is the sanctioned
        // pattern for wide tables. Only unscrollable overflow breaks reflow.
        for (let p = el.parentElement; p; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (s.overflowX === 'auto' || s.overflowX === 'scroll') return false;
        }
        return b.right > de.clientWidth + 1;
      })
      .map(el => ({
        sel: el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''),
        right: Math.round(el.getBoundingClientRect().right)
      }));
    const seen = new Set(); const uniq = [];
    for (const o of over) if (!seen.has(o.sel)) { seen.add(o.sel); uniq.push(o); }
    return {
      docScrollWidth: de.scrollWidth,
      viewport: de.clientWidth,
      horizontalScroll: de.scrollWidth > de.clientWidth + 1,
      overflowing: uniq.slice(0, 10)
    };`);
  await S('Emulation.clearDeviceMetricsOverride');
  return r;
}

// 2.3.3 Animation from Interactions — the guard must actually suppress motion
async function reducedMotion(S, url) {
  await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await goto(S, url);
  const r = await evalJs(S, `
    const moving = [];
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      const dur = parseFloat(s.transitionDuration) || 0;
      const anim = parseFloat(s.animationDuration) || 0;
      if (dur > 0.05 || anim > 0.05) {
        const sel = el.tagName + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '');
        moving.push({ sel, transition: s.transitionDuration, animation: s.animationDuration });
      }
    }
    const seen = new Set(); const uniq = [];
    for (const m of moving) if (!seen.has(m.sel)) { seen.add(m.sel); uniq.push(m); }
    return { stillAnimating: uniq.slice(0, 12), count: uniq.length };`);
  await S('Emulation.setEmulatedMedia', { features: [] });
  return r;
}

// Core Web Vitals at MOBILE emulation, using Lighthouse's mobile throttling preset.
// These are measured metrics, not a Lighthouse score — no score is claimed.
async function mobileVitals(cdp, url) {
  const p = await newPage(cdp);
  await p.S('Network.enable');
  // A warm HTTP cache makes every number a lie: the first run reported TTFB of 1-3ms and 0KB
  // transferred, which is a cache hit, not a 1.6Mbps mobile connection.
  await p.S('Network.setCacheDisabled', { cacheDisabled: true });
  await p.S('Emulation.setDeviceMetricsOverride', { width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true });
  await p.S('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.S('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8
  });
  await p.S('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  ` });
  await goto(p.S, url);
  await sleep(2500);
  const v = await evalJs(p.S, `
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    let bytes = 0;
    for (const r of performance.getEntriesByType('resource')) bytes += r.transferSize || 0;
    return {
      lcp: Math.round(window.__lcp),
      cls: +(window.__cls || 0).toFixed(3),
      fcp: fcp ? Math.round(fcp.startTime) : null,
      ttfb: Math.round(nav.responseStart || 0),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      transferKB: Math.round(bytes / 1024)
    };`);
  await p.close();
  return v;
}

// ---------------------------------------------------------------------- driver
const { proc, ws } = await launch();
const cdp = connect(ws);
await cdp.ready;

const results = [];
try {
  for (const [label, url] of PAGES) {
    const p = await newPage(cdp);
    await goto(p.S, url);
    const isHome = url === `${SITE}/`;

    const fo = await focusOrder(p.S);
    const kt = await keyboardTrap(p.S, isHome);
    const rf = await reflow(p.S, url);
    const rm = await reducedMotion(p.S, url);
    await p.close();

    const vitals = await mobileVitals(cdp, url);
    results.push({ label, url, focusOrder: fo, keyboardTrap: kt, reflow: rf, reducedMotion: rm, mobileVitals: vitals });
    if (!JSON_OUT) console.error(`scanned ${label}`);
  }
} finally {
  cdp.close();
  proc.kill();
}

if (JSON_OUT) { console.log(JSON.stringify(results, null, 2)); process.exit(0); }

// ---------------------------------------------------------------------- report
let fail = 0;
const bad = s => { fail++; return `🔴 ${s}`; };

console.log(`\nBROWSER AUDIT — Chrome ${rev.replace('linux-', '')}, ${results.length} pages\n`);

for (const r of results) {
  console.log(`── ${r.label}  ${r.url}`);

  const f = r.focusOrder;
  console.log(`   2.4.3 focus order      ${f.outOfOrder.length ? bad(`${f.outOfOrder.length} backward jumps`) : `✅ ${f.tabStops} stops, reading order`}`);
  for (const j of f.outOfOrder.slice(0, 4)) console.log(`         ${j.from}  →  ${j.to}`);
  if (f.focusableButInvisible.length) console.log(`         ${bad(`focusable but zero-size: ${f.focusableButInvisible.slice(0, 4).join(', ')}`)}`);
  console.log(`   2.4.7 focus visible    ${f.focusVisible.ok ? '✅ indicator changes on focus' : bad('no visible change on focus')}`);

  const k = r.keyboardTrap;
  console.log(`   2.1.2 keyboard trap    ${k.stuckOn.length ? bad(`focus stuck on ${k.stuckOn.join(', ')}`) : '✅ no trap in tab cycle'}`);
  if (k.modal) {
    console.log(`         modal: opens ${k.modal.opened ? '✅' : '🔴'} · focus contained ${k.modal.focusStaysInside ? '✅' : '⚠️'} · Escape closes ${k.modal.escapeCloses ? '✅' : '🔴'}`);
    if (!k.modal.escapeCloses) fail++;
  }

  const rf = r.reflow;
  console.log(`   1.4.10 reflow @320px   ${rf.horizontalScroll ? bad(`h-scroll: doc ${rf.docScrollWidth}px vs viewport ${rf.viewport}px`) : '✅ no horizontal scroll'}`);
  for (const o of rf.overflowing.slice(0, 5)) console.log(`         overflows to ${o.right}px: ${o.sel}`);

  const rm = r.reducedMotion;
  console.log(`   2.3.3 reduced motion   ${rm.count ? bad(`${rm.count} elements still animate`) : '✅ motion suppressed'}`);
  for (const m of rm.stillAnimating.slice(0, 4)) console.log(`         ${m.sel} (transition ${m.transition}, animation ${m.animation})`);

  const v = r.mobileVitals;
  const lcpOk = v.lcp <= 2500, clsOk = v.cls <= 0.1;
  console.log(`   mobile vitals          LCP ${v.lcp}ms ${lcpOk ? '✅' : '🔴'} · CLS ${v.cls} ${clsOk ? '✅' : '🔴'} · FCP ${v.fcp}ms · TTFB ${v.ttfb}ms · ${v.transferKB}KB`);
  if (!lcpOk || !clsOk) fail++;
  console.log('');
}

console.log(fail ? `${fail} finding(s) need attention.` : 'No findings.');
console.log('Not covered here: alt-text accuracy (1.1.1) — a human judgement, not a machine assertion.');
process.exit(fail ? 1 : 0);
