// Site-wide top navigation. Loaded on every page via <script src="/nav.js" defer></script>.
// Detects .topbar-in on the page and replaces its contents with the full nav menu.
// Also injects the hover-menu CSS. Single-file source of truth for the nav.
// Update this file to change the menu across every page — no per-page edits needed.
// ---- GA4 ----
// nav.js is already on all ~2,590 pages, so tagging here tags the whole site with
// no rebuild. To switch analytics on: paste the Measurement ID (G-XXXXXXXXXX) below,
// commit, push. Empty string = no tag loaded, no requests, no cookies.
//
// !! DO NOT set this without doing the privacy-page edit in the same commit. !!
// privacy.html (generated from build-trust.mjs, ~line 156) currently states
// "the site sets no cookies and runs no advertising trackers". GA4 sets _ga /
// _ga_* first-party cookies, so that sentence becomes false the moment this is
// filled in. Edit build-trust.mjs, re-run `node build-trust.mjs`, commit both.
var GA4_MEASUREMENT_ID = 'G-7EVW8MX8Z9';

(function () {
  if (!GA4_MEASUREMENT_ID || window._ga4Injected) return;
  window._ga4Injected = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // page_type + vendor context ride on every event via config, so you can segment
  // any report by page type without adding params at each call site.
  window.gtag('config', GA4_MEASUREMENT_ID, wallContext());
})();

// ---- page context ----
// Derived from the URL and DOM, so it works on all ~2,590 pages with no rebuild
// and no per-page markup. Exposed for the tracking IIFE below.
function wallContext() {
  var p = location.pathname, t = 'other';
  if (p === '/' || /\/index\.html$/.test(p) && p.split('/').length === 2) t = 'atlas';
  else if (/^\/c\//.test(p)) t = 'listing';
  else if (/^\/pillars\//.test(p)) t = 'pillar';
  else if (/^\/hubs\//.test(p)) t = 'hub';
  else if (/^\/find\//.test(p)) t = 'find';
  else if (/^\/states\//.test(p)) t = 'state';
  else if (/^\/cities\//.test(p)) t = 'city';
  else if (/^\/compare\//.test(p)) t = 'compare';
  else if (/^\/questions\//.test(p)) t = 'question';
  else if (/^\/entities\//.test(p)) t = 'entity';
  else if (/^\/news\/updates\//.test(p)) t = 'update';
  else if (/^\/news\//.test(p)) t = 'briefing';
  else if (/^\/report\//.test(p)) t = 'report';
  else if (/^\/tools\//.test(p)) t = 'tool';
  else if (/^\/data\//.test(p)) t = 'data_corner';
  else if (/^\/wins\//.test(p)) t = 'win';
  else if (/^\/badge\//.test(p)) t = 'badge';
  else if (/^\/(partner|press)\.html$/.test(p)) t = 'funnel';
  else if (/^\/(about|contact|privacy|terms|editorial-policy|ai-policy|disclosures|accessibility|glossary|sitemap)\.html$/.test(p)) t = 'trust';
  var ctx = { page_type: t };
  if (t === 'listing') {
    var m = p.match(/^\/c\/(.+)\.html$/);
    if (m) ctx.vendor_domain = decodeURIComponent(m[1]).slice(0, 100);
    var sub = document.querySelector('.sub');
    if (sub) ctx.vendor_category = sub.textContent.split('/')[0].trim().slice(0, 100);
    var h1 = document.querySelector('h1');
    if (h1) ctx.vendor_name = h1.textContent.trim().slice(0, 100);
  }
  return ctx;
}

// ---- click + event tracking ----
// One delegated listener set on `document`, capture phase, so it fires even when a
// page's own handler calls stopPropagation. Nothing here depends on per-page markup
// beyond the selectors verified against the live DOM, and every handler is wrapped
// so a tracking bug can never break a page.
(function () {
  if (!GA4_MEASUREMENT_ID || window._wallTrackInjected) return;
  window._wallTrackInjected = true;

  function track(name, params) {
    try {
      if (typeof window.gtag !== 'function') return;
      var out = {};
      for (var k in params) {
        if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
        var v = params[k];
        if (v === undefined || v === null || v === '') continue;
        out[k] = typeof v === 'number' ? v : String(v).slice(0, 100);
      }
      window.gtag('event', name, out);
    } catch (e) { /* tracking must never break the page */ }
  }
  window.wallTrack = track;

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(sel)) return el;
      el = el.parentElement;
    }
    return null;
  }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) : ''; }

  // ---- self-diagnostic ----
  // Type wallDiag() in the browser console. Lives here so there is nothing to paste
  // (pasted snippets get mangled by terminals and smart quotes). Deliberately written
  // in plain ES5 with no arrow functions or template literals so it runs anywhere.
  // If wallDiag is "not defined", that is itself the answer: stale cached nav.js.
  window.wallDiag = function () {
    var rows = [];
    function add(k, v) { rows.push({ check: k, result: v ? 'PASS' : 'FAIL' }); return v; }

    var hasTrack = add('nav.js has tracking build', typeof window.wallTrack === 'function');
    add('gtag() defined', typeof window.gtag === 'function');
    var hasDL = add('dataLayer exists', Object.prototype.toString.call(window.dataLayer) === '[object Array]');
    // google_tag_manager only exists if gtag.js genuinely downloaded and ran.
    // Our own gtag() stub exists either way, so this is the real blocker test.
    var loaded = add('gtag.js actually LOADED', !!window.google_tag_manager);

    var el = document.querySelector('.claim .a-pri') || document.querySelector('.nav-main a');
    add('clickable element found', !!el);

    var before = hasDL ? window.dataLayer.length : 0;
    if (el) {
      try {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } catch (e) {
        var ev = document.createEvent('MouseEvents');
        ev.initEvent('click', true, true);
        el.dispatchEvent(ev);
      }
    }
    var sent = [], fired = false;
    if (hasDL) {
      for (var i = before; i < window.dataLayer.length; i++) {
        var a = Array.prototype.slice.call(window.dataLayer[i]);
        sent.push(a);
        if (a[0] === 'event') fired = true;
      }
    }
    add('event pushed to dataLayer', fired);

    if (console.table) console.table(rows);
    else console.log(rows);
    console.log('page_type context:', typeof wallContext === 'function' ? wallContext() : 'n/a');
    console.log('events pushed by this test:', sent);

    var msg;
    if (!hasTrack) msg = 'STALE CACHED nav.js. Hard-reload with Ctrl+Shift+R (Cmd+Shift+R on Mac), then run wallDiag() again.';
    else if (!loaded) msg = 'gtag.js is BLOCKED - ad blocker, Brave Shields, or strict tracking protection. Events fire correctly but never reach Google. Turn the blocker off for this site, or retest in an incognito window with extensions disabled.';
    else if (!fired) msg = 'Tracking loaded but no event fired. Send this table to Claude.';
    else msg = 'ALL GOOD - the event was sent. If GA4 Realtime still looks empty, scroll to the "Event count by Event name" card, and check Admin > Data Streams > Configure tag settings > Define internal traffic for an Active filter on your own IP.';
    console.log('%cDIAGNOSIS: ' + msg, 'font-weight:bold');
    return msg;
  };

  document.addEventListener('click', function (ev) {
    try {
      var a = closest(ev.target, 'a');

      // --- the money events: vendor claim funnel on /c/ pages ---
      if (a && closest(a, '.claim')) {
        var href = a.getAttribute('href') || '';
        if (a.matches('.a-pri')) track('claim_click', {});                    // "CLAIM & COUNT ME IN"
        else if (/^mailto:/i.test(href)) track('correction_click', {});       // "CORRECT THIS LISTING"
        else if (/partner\.html/.test(href)) track('partner_terms_click', { link_location: 'claim_block' });
        return;
      }

      // --- partner funnel from anywhere else (nav, homepage CTA, footer) ---
      if (a && /partner\.html/.test(a.getAttribute('href') || '')) {
        track('partner_terms_click', {
          link_location: closest(a, '.nav-main') ? 'nav'
            : closest(a, '.partner-cta') ? 'homepage_cta'
            : closest(a, '.vendor-strip') ? 'vendor_strip'
            : closest(a, 'footer') ? 'footer' : 'inline'
        });
        return;
      }

      // --- traffic we send OUT to a vendor (this is the 10% side of the deal) ---
      if (a && a.matches('.cta') && /^https?:/i.test(a.getAttribute('href') || '')) {
        track('vendor_outbound', { link_url: a.getAttribute('href') });
        return;
      }

      // --- nav usage: which menus actually get used ---
      var navLink = a && closest(a, '.nav-main');
      if (navLink) {
        var grp = closest(a, '.nav-group');
        track('nav_click', {
          nav_group: txt(grp && grp.querySelector('.nav-trigger')) || 'top',
          nav_label: txt(a),
          link_url: a.getAttribute('href')
        });
        return;
      }

      // --- journalist signal: CITE button on Data Corner charts ---
      var cite = closest(ev.target, '.chart-cite, .cite, [data-cite]');
      if (cite) {
        var chart = closest(cite, '.chart, figure, section');
        track('cite_copy', {
          chart: txt(chart && chart.querySelector('h3')) || (chart && chart.getAttribute('data-chart')) || ''
        });
        return;
      }

      // --- atlas: opening a listing from a card ---
      if (closest(ev.target, '.card-body')) {
        var dom = txt(closest(ev.target, '.card') && closest(ev.target, '.card').querySelector('.dom'));
        track('listing_open', { vendor_domain: dom, open_method: 'card' });
        return;
      }

      // --- compare tool ---
      if (closest(ev.target, '.cmpbar .btn')) {
        track('compare_action', { action: txt(closest(ev.target, '.btn')) });
        return;
      }

      // --- generic mailto (GA4 enhanced measurement does NOT track these) ---
      if (a && /^mailto:/i.test(a.getAttribute('href') || '')) {
        track('mailto_click', { link_label: txt(a) });
      }
    } catch (e) { /* never break a page */ }
  }, true);

  // --- atlas filters + compare checkboxes ---
  document.addEventListener('change', function (ev) {
    try {
      var el = ev.target;
      if (!el || !el.matches) return;
      if (closest(el, '.filterbar') && el.matches('select')) {
        var lbl = closest(el, '.fgroup');
        track('atlas_filter', {
          filter_name: txt(lbl && lbl.querySelector('label')) || 'unknown',
          filter_value: el.value || 'any'
        });
        return;
      }
      if (el.matches('input[type=checkbox]') && closest(el, '.card')) {
        track('compare_toggle', { checked: el.checked ? 1 : 0 });
      }
    } catch (e) { /* never break a page */ }
  }, true);

  // --- FAQ / Q&A accordion opens: real engagement depth on listing, pillar, hub pages ---
  // `toggle` does not bubble, but capture-phase on document still sees it.
  document.addEventListener('toggle', function (ev) {
    try {
      var d = ev.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open) return;
      track('faq_open', { question: txt(d.querySelector('summary')) });
    } catch (e) { /* never break a page */ }
  }, true);

  // --- atlas search box: what people actually look for on-site ---
  var q = document.getElementById('q'), qt = null;
  if (q) {
    q.addEventListener('input', function () {
      clearTimeout(qt);
      qt = setTimeout(function () {
        var v = (q.value || '').trim();
        if (v.length >= 3) track('atlas_search', { search_term: v.toLowerCase() });
      }, 900);
    });
  }

  // --- rate-benchmark calculator ---
  // The form is <form id="f" onsubmit="return false"> and the button is
  // <button type="button" onclick="run()"> — so there is no submit event to hook.
  // Listen on the button click instead.
  if (/rate-benchmark/.test(location.pathname)) {
    var rbForm = document.getElementById('f');
    if (rbForm) {
      rbForm.addEventListener('click', function (ev) {
        if (!closest(ev.target, 'button')) return;
        var cat = document.getElementById('cat'), rate = document.getElementById('rate');
        track('tool_use', {
          tool_name: 'rate_benchmark',
          tool_category: cat && cat.value,
          tool_rate: rate && rate.value
        });
      }, true);
    }
  }
})();

(function () {
  if (window._navInjected) return; // idempotent
  window._navInjected = true;
  var bar = document.querySelector('.topbar-in');
  if (!bar) return;

  var base = '';
  // Detect depth so relative hrefs resolve from /c/{domain}.html, /pillars/x.html, /find/x.html, etc.
  var path = window.location.pathname.replace(/^\/+/, '');
  var slashes = (path.match(/\//g) || []).length;
  if (path === '' || path === 'index.html' || !path.includes('/')) {
    base = './';
  } else {
    base = '../'.repeat(slashes);
    if (path.endsWith('/')) base = '../'.repeat(slashes);
    // Trim trailing slash miscount: /data/ → slashes=1 but should be one-up
  }
  // Simpler: use origin-anchored paths for cross-section links. Works because site is on a domain root.
  var A = window.location.hostname && window.location.hostname.length ? '/' : '';
  // If we're running on hitthewall.net → use root-anchored paths. On local file:// or preview, fall back.
  var useAbs = window.location.protocol.startsWith('http') && window.location.hostname.length > 0;
  function h(rel) { return useAbs ? '/' + rel : (base + rel); }

  var MENU = [
    {
      label: 'Directory',
      items: [
        { label: 'Atlas home', href: h('') },
        { label: 'Browse by pillar', href: h('pillars/') },
        { label: 'Find by state', href: h('find/') },
        { label: 'All US states', href: h('states/') },
        { label: 'All US cities', href: h('cities/') }
      ]
    },
    {
      label: 'Reference',
      items: [
        { label: 'Buyer hubs', href: h('hubs/') },
        { label: 'Platform reference', href: h('entities/') },
        { label: 'Head-to-heads', href: h('compare/') },
        { label: 'Q&A silo', href: h('questions/') },
        { label: 'Glossary', href: h('glossary.html') },
        { label: 'Rate benchmark', href: h('tools/rate-benchmark.html') }
      ]
    },
    {
      label: 'Newsroom',
      items: [
        { label: 'Briefings', href: h('news/') },
        { label: 'Data corner', href: h('data/') },
        { label: 'State-of-market report', href: h('report/state-of-the-us-growth-vendor-market-2026.html') },
        { label: 'Press & media kit', href: h('press.html') }
      ]
    },
    {
      label: 'Partner',
      items: [
        { label: 'Partner program', href: h('partner.html') },
        { label: 'Referral wins', href: h('wins/') },
        { label: '"Featured in The Wall" badge', href: h('badge/') }
      ]
    }
  ];

  // Preserve the existing wordmark; replace everything after it.
  var wordmark = bar.querySelector('.wordmark');
  var wordmarkHTML = wordmark ? wordmark.outerHTML : '<a class="wordmark" href="' + h('') + '">The Wall <small>OPERATIONS ATLAS</small></a>';

  var navHTML =
    wordmarkHTML +
    '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false">☰</button>' +
    '<nav class="nav-main">' +
      MENU.map(function (group) {
        return '<div class="nav-group">' +
          '<button class="nav-trigger" aria-haspopup="true" aria-expanded="false">' + group.label + ' <span class="caret">▾</span></button>' +
          '<div class="nav-menu">' +
            group.items.map(function (item) {
              return '<a href="' + item.href + '">' + item.label + '</a>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</nav>';

  bar.innerHTML = navHTML;

  // Wire dropdown behavior — hover on desktop, click on mobile.
  var groups = bar.querySelectorAll('.nav-group');
  function closeAll() {
    groups.forEach(function (g) {
      g.classList.remove('open');
      var trigger = g.querySelector('.nav-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
  groups.forEach(function (group) {
    var trigger = group.querySelector('.nav-trigger');
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasOpen = group.classList.contains('open');
      closeAll();
      if (!wasOpen) {
        group.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', function (e) {
    if (!bar.contains(e.target)) closeAll();
  });

  // Mobile hamburger toggles the whole nav
  var toggle = bar.querySelector('.nav-toggle');
  var nav = bar.querySelector('.nav-main');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Inject CSS — scoped to the new nav elements only, doesn't disturb existing styles.
  var css = '\
.topbar-in { flex-wrap: wrap; }\
.nav-main { display: flex; gap: 4px; align-items: center; margin-left: auto; }\
.nav-group { position: relative; }\
.nav-trigger { font-family: var(--mono, "IBM Plex Mono", monospace); font-size: 10.5px; font-weight: 600; letter-spacing: .1em; color: var(--body, #3B4557); background: none; border: 0; padding: 8px 12px; cursor: pointer; text-transform: uppercase; border-radius: 4px; transition: color .15s, background .15s; display: inline-flex; align-items: center; gap: 5px; }\
.nav-trigger:hover, .nav-group.open .nav-trigger { color: var(--cobalt, #1B4FD8); background: var(--stone-lt, #F2F0EA); }\
.nav-trigger .caret { font-size: 9px; opacity: .7; transition: transform .15s; }\
.nav-group.open .nav-trigger .caret { transform: rotate(180deg); }\
.nav-menu { display: none; position: absolute; top: calc(100% + 6px); right: 0; min-width: 220px; background: #fff; border: 1px solid var(--stone, #E7E3DA); border-radius: 8px; box-shadow: 0 8px 24px rgba(14,27,51,.08); padding: 6px 0; z-index: 50; }\
.nav-group.open .nav-menu { display: block; }\
.nav-menu a { display: block; font-family: var(--sans, "IBM Plex Sans", sans-serif); font-size: 13px; color: var(--ink, #0E1B33); text-decoration: none; padding: 8px 16px; transition: background .1s, color .1s; }\
.nav-menu a:hover { background: var(--stone-lt, #F2F0EA); color: var(--cobalt, #1B4FD8); }\
.nav-toggle { display: none; background: none; border: 0; font-size: 22px; color: var(--ink, #0E1B33); cursor: pointer; padding: 0 6px; margin-left: auto; line-height: 1; }\
@media (max-width: 780px) {\
  .topbar-in { position: relative; }\
  .nav-toggle { display: block; }\
  .nav-main { display: none; flex-direction: column; align-items: stretch; gap: 0; position: absolute; top: 100%; left: 0; right: 0; background: #fff; border-bottom: 1px solid var(--stone, #E7E3DA); box-shadow: 0 8px 24px rgba(14,27,51,.06); padding: 8px 0; z-index: 40; margin-left: 0; max-height: 70vh; overflow-y: auto; }\
  .nav-main.open { display: flex; }\
  .nav-group { border-bottom: 1px solid var(--stone-lt, #F2F0EA); }\
  .nav-group:last-child { border-bottom: none; }\
  .nav-trigger { width: 100%; text-align: left; padding: 12px 20px; justify-content: space-between; border-radius: 0; }\
  .nav-menu { display: none; position: static; box-shadow: none; border: 0; border-radius: 0; background: var(--stone-lt, #F2F0EA); padding: 0; min-width: 0; }\
  .nav-group.open .nav-menu { display: block; }\
  .nav-menu a { padding: 10px 32px; font-size: 14px; }\
}\
';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
})();
