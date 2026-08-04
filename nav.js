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
var GA4_MEASUREMENT_ID = '';

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
  window.gtag('config', GA4_MEASUREMENT_ID);
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
