// Loads real pages from the repo into jsdom, runs the real nav.js, fires real
// events, and asserts on what gtag() received. No mocks of our own code.
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

const REPO = '/home/dan/directory-thewall';
const NAVJS = readFileSync(`${REPO}/nav.js`, 'utf8');

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log(`  ✓ ${m}`)) : (fail++, console.log(`  ✗ FAIL: ${m}`)); };

function load(file, url) {
  const vc = new VirtualConsole(); // swallow page-script noise, surface real errors below
  const errs = [];
  vc.on('jsdomError', e => errs.push(e.message));
  const dom = new JSDOM(readFileSync(`${REPO}/${file}`, 'utf8'), {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc
  });
  const w = dom.window;
  const events = [];
  // Stub the network-loading part of gtag only; our nav.js code is untouched.
  w.HTMLScriptElement.prototype.__defineSetter__?.('src', function () {});
  w.eval(NAVJS);
  // capture everything pushed after our code defined gtag
  const realGtag = w.gtag;
  w.gtag = function (...a) { events.push(a); return realGtag?.apply(this, a); };
  return { w, events, errs, dom };
}

function click(w, el) {
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
}
const names = ev => ev.filter(e => e[0] === 'event').map(e => e[1]);
const paramsOf = (ev, n) => (ev.find(e => e[0] === 'event' && e[1] === n) || [])[2] || {};

// ---------- 1. listing page ----------
console.log('\n/c/108degrees.com.html (listing)');
{
  const { w, events, errs } = load('c/108degrees.com.html', 'https://hitthewall.net/c/108degrees.com.html');
  ok(errs.length === 0, `no jsdom errors ${errs.length ? '— ' + errs[0].slice(0, 120) : ''}`);

  const ctx = w.wallContext();
  ok(ctx.page_type === 'listing', `page_type = listing (got ${ctx.page_type})`);
  ok(ctx.vendor_domain === '108degrees.com', `vendor_domain = 108degrees.com (got ${ctx.vendor_domain})`);
  ok(ctx.vendor_category === 'AUTOMATION', `vendor_category captured (got ${ctx.vendor_category})`);
  ok(/108 Degrees/.test(ctx.vendor_name || ''), `vendor_name captured (got ${ctx.vendor_name})`);

  click(w, w.document.querySelector('.claim .a-pri'));
  ok(names(events).includes('claim_click'), 'CLAIM button → claim_click');

  events.length = 0;
  const secs = [...w.document.querySelectorAll('.claim .a-sec')];
  click(w, secs.find(a => a.getAttribute('href').startsWith('mailto:')));
  ok(names(events).includes('correction_click'), 'CORRECT LISTING → correction_click');
  ok(!names(events).includes('mailto_click'), 'correction does not double-fire mailto_click');

  events.length = 0;
  click(w, secs.find(a => /partner\.html/.test(a.getAttribute('href'))));
  ok(paramsOf(events, 'partner_terms_click').link_location === 'claim_block',
     `FULL TERMS → partner_terms_click{claim_block} (got ${paramsOf(events, 'partner_terms_click').link_location})`);

  events.length = 0;
  click(w, w.document.querySelector('a.cta'));
  ok(names(events).includes('vendor_outbound'), 'VISIT WEBSITE → vendor_outbound');

  events.length = 0;
  const d = w.document.querySelector('details:not([open])');
  d.open = true;
  d.dispatchEvent(new w.Event('toggle'));
  ok(names(events).includes('faq_open'), 'opening a Q&A accordion → faq_open');
  ok((paramsOf(events, 'faq_open').question || '').length > 5, 'faq_open carries the question text');

  events.length = 0;
  const d2 = w.document.querySelector('details[open]');
  d2.open = false;
  d2.dispatchEvent(new w.Event('toggle'));
  ok(!names(events).includes('faq_open'), 'CLOSING an accordion does NOT fire faq_open');

  events.length = 0;
  click(w, w.document.querySelector('.nav-main a'));
  ok(names(events).includes('nav_click'), 'nav link → nav_click');
  ok((paramsOf(events, 'nav_click').nav_group || '').length > 0, 'nav_click carries nav_group');
}

// ---------- 2. atlas homepage ----------
console.log('\n/ (atlas)');
{
  const { w, events, errs } = load('index.html', 'https://hitthewall.net/');
  ok(errs.length === 0, `no jsdom errors ${errs.length ? '— ' + errs[0].slice(0, 120) : ''}`);
  ok(w.wallContext().page_type === 'atlas', `page_type = atlas (got ${w.wallContext().page_type})`);
  ok(w.wallContext().vendor_domain === undefined, 'no vendor_* params leak onto non-listing pages');

  events.length = 0;
  const pc = w.document.querySelector('.partner-cta a[href*="partner"]');
  if (pc) { click(w, pc); ok(paramsOf(events, 'partner_terms_click').link_location === 'homepage_cta',
      `homepage partner CTA → link_location=homepage_cta (got ${paramsOf(events, 'partner_terms_click').link_location})`); }
  else ok(false, 'homepage partner CTA link found');

  events.length = 0;
  const vs = w.document.querySelector('.vendor-strip a[href*="partner"]');
  if (vs) { click(w, vs); ok(paramsOf(events, 'partner_terms_click').link_location === 'vendor_strip',
      `vendor strip → link_location=vendor_strip (got ${paramsOf(events, 'partner_terms_click').link_location})`); }
  else ok(false, 'vendor-strip partner link found');

  // The filterbar, cards and compare bar are rendered by the SPA after the Supabase
  // fetch, so they are absent from the static file. Inject the exact markup the SPA
  // produces (copied from index.html:593) — this is the real test of whether the
  // delegated listener catches DYNAMICALLY inserted elements.
  events.length = 0;
  ok(w.document.querySelector('.filterbar') === null, 'filterbar is SPA-rendered, absent statically');
  const host = w.document.createElement('div');
  host.innerHTML = `<div class="filterbar">
    <div class="fgroup"><label>RATE</label><select><option value="">Any</option><option value="150-199">$150 - $199 / hr</option></select></div>
    <div class="fgroup"><label>STATE</label><select><option value="">Any</option><option value="CA">CA</option></select></div>
  </div>
  <div class="card"><div class="card-body"><input type="checkbox"></div><div class="card-foot"><span class="dom">acme.com</span></div></div>
  <div class="cmpbar on"><button class="btn">COMPARE 2 →</button></div>`;
  w.document.body.appendChild(host);

  const sel = host.querySelector('.filterbar select');
  sel.value = '150-199';
  sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  ok(names(events).includes('atlas_filter'), 'DYNAMIC filter select → atlas_filter');
  ok(paramsOf(events, 'atlas_filter').filter_name === 'RATE',
     `atlas_filter names the filter (got ${paramsOf(events, 'atlas_filter').filter_name})`);
  ok(paramsOf(events, 'atlas_filter').filter_value === '150-199',
     `atlas_filter carries the value (got ${paramsOf(events, 'atlas_filter').filter_value})`);

  events.length = 0;
  click(w, host.querySelector('.card-body'));
  ok(names(events).includes('listing_open'), 'DYNAMIC card body click → listing_open');
  ok(paramsOf(events, 'listing_open').vendor_domain === 'acme.com',
     `listing_open carries vendor_domain (got ${paramsOf(events, 'listing_open').vendor_domain})`);

  events.length = 0;
  const cb = host.querySelector('.card input[type=checkbox]');
  cb.checked = true;
  cb.dispatchEvent(new w.Event('change', { bubbles: true }));
  ok(names(events).includes('compare_toggle'), 'DYNAMIC compare checkbox → compare_toggle');

  events.length = 0;
  click(w, host.querySelector('.cmpbar .btn'));
  ok(names(events).includes('compare_action'), 'DYNAMIC compare bar button → compare_action');

  events.length = 0;
  const q = w.document.getElementById('q');
  q.value = 'seo agency';
  q.dispatchEvent(new w.Event('input', { bubbles: true }));
  await new Promise(r => setTimeout(r, 1100));
  ok(names(events).includes('atlas_search'), 'search box (debounced) → atlas_search');
  ok(paramsOf(events, 'atlas_search').search_term === 'seo agency',
     `atlas_search term lowercased (got ${paramsOf(events, 'atlas_search').search_term})`);
}

// ---------- 3. page-type coverage ----------
console.log('\npage_type mapping across the site');
{
  const cases = [
    ['pillars/seo.html', '/pillars/seo.html', 'pillar'],
    ['hubs/marketing-consultant.html', '/hubs/marketing-consultant.html', 'hub'],
    ['data/index.html', '/data/index.html', 'data_corner'],
    ['tools/rate-benchmark.html', '/tools/rate-benchmark.html', 'tool'],
    ['privacy.html', '/privacy.html', 'trust'],
    ['partner.html', '/partner.html', 'funnel'],
  ];
  for (const [f, url, want] of cases) {
    try {
      const { w } = load(f, 'https://hitthewall.net' + url);
      const got = w.wallContext().page_type;
      ok(got === want, `${url} → ${want} (got ${got})`);
    } catch (e) { ok(false, `${url} loaded (${e.message.slice(0, 60)})`); }
  }
}

// ---------- 4. data corner CITE + tool ----------
console.log('\nCITE button + calculator');
{
  const { w, events } = load('data/index.html', 'https://hitthewall.net/data/index.html');
  // Charts are drawn client-side, so .chart-cite lives in a JS template string, not
  // the static HTML. Inject the exact markup from data/index.html:185.
  ok(w.document.querySelector('.chart-cite') === null, 'chart-cite is JS-rendered, absent statically');
  const ch = w.document.createElement('div');
  ch.innerHTML = '<div class="chart" data-chart="rates"><div class="chart-head">'
    + '<h3>Rate bands by category</h3><button class="chart-cite">CITE</button></div></div>';
  w.document.body.appendChild(ch);
  click(w, ch.querySelector('.chart-cite'));
  ok(names(events).includes('cite_copy'), 'DYNAMIC CITE button → cite_copy');
}
{
  const { w, events } = load('tools/rate-benchmark.html', 'https://hitthewall.net/tools/rate-benchmark.html');
  const b = w.document.querySelector('#f button');
  if (b) {
    click(w, b);
    ok(names(events).includes('tool_use'), 'calculator button → tool_use');
    ok(paramsOf(events, 'tool_use').tool_name === 'rate_benchmark', 'tool_use names the tool');
  } else ok(false, '#f button present');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
