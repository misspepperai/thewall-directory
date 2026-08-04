# GA4 tracking diagnostic — paste-in browser check

Use this when events aren't showing in GA4 Realtime. It tells you *which* of the four
possible causes you have, instead of guessing.

## Run it

1. Open <https://hitthewall.net/c/108degrees.com.html>
2. **Hard-reload first: `Ctrl+Shift+R`** (Windows) / `Cmd+Shift+R` (Mac).
   `nav.js` is served with `cache-control: max-age=600`, so a normal reload can hand you
   a cached copy from before tracking shipped. This is the single most common cause.
3. Open DevTools (`F12`) → **Console** tab
4. Paste the whole block below, press Enter

```js
(function () {
  var R = [];
  var newNav = typeof window.wallTrack === 'function';
  var gtagFn = typeof window.gtag === 'function';
  var dl     = Array.isArray(window.dataLayer);
  var loaded = !!window.google_tag_manager;
  var claim  = document.querySelector('.claim .a-pri');

  R.push(['nav.js has tracking build', newNav]);
  R.push(['gtag() defined',            gtagFn]);
  R.push(['dataLayer exists',          dl]);
  R.push(['gtag.js actually LOADED',   loaded]);
  R.push(['claim button on page',      !!claim]);

  var before = dl ? window.dataLayer.length : 0;
  if (claim) claim.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  var pushed = dl ? window.dataLayer.slice(before) : [];
  var fired  = pushed.some(function (p) { return p[0] === 'event' && p[1] === 'claim_click'; });
  R.push(['claim_click pushed',        fired]);

  console.table(R.map(function (r) { return {check: r[0], result: r[1] ? 'PASS' : 'FAIL'}; }));

  if (!newNav)      console.warn('DIAGNOSIS: stale cached nav.js. Hard-reload (Ctrl+Shift+R).');
  else if (!loaded) console.warn('DIAGNOSIS: gtag.js is BLOCKED — ad blocker / privacy extension / brave shields. Events fire but never reach Google. Disable the blocker for this site, or test in an incognito window with extensions off.');
  else if (!fired)  console.warn('DIAGNOSIS: tracking code loaded but the event did not fire. Send this table to Claude.');
  else              console.log('DIAGNOSIS: everything works. The event WAS sent. If GA4 Realtime still shows nothing, see "Realtime gotchas" below.');
})();
```

## Reading the result

| Symptom | Cause | Fix |
|---|---|---|
| `nav.js has tracking build` = FAIL | Cached old `nav.js` | Hard-reload `Ctrl+Shift+R`. Cache expires on its own in 10 min. |
| `gtag.js actually LOADED` = FAIL | **Ad blocker / privacy extension.** uBlock, AdBlock, Brave Shields, Firefox strict ETP and Safari ITP all block `googletagmanager.com`. Our code fires correctly; the request never leaves the browser. | Disable the blocker for hitthewall.net, or use an incognito/private window with extensions disabled. |
| `claim_click pushed` = FAIL, everything else PASS | A real bug | Send the table over. |
| All PASS but GA4 shows nothing | See below | |

## Realtime gotchas (all PASS but nothing in GA4)

- **Wrong card.** Realtime's default view is user-centric. Scroll to the
  **"Event count by Event name"** card — custom events appear there, not in the top tiles.
- **Internal traffic filter.** Admin → Data Streams → your stream → *Configure tag settings*
  → **Define internal traffic**. If your IP is listed and the filter is *Active*, your own
  events are excluded from reporting entirely. Set it to *Testing* while you verify.
- **Google Analytics opt-out add-on.** If you ever installed the official opt-out browser
  extension, it silently drops everything.
- **DebugView needs the debug flag.** DebugView is empty unless you have the *Google
  Analytics Debugger* Chrome extension enabled. Realtime does not require it.
- **Events list ≠ Realtime.** Admin → Events (where you mark key events) runs on a slower
  pipeline and can take up to 24h. Realtime is the immediate check.

## Why the mailto links do still count

`claim_click` and `correction_click` sit on `mailto:` links. Clicking one may open your mail
client, but it does **not** unload the page, and GA4 sends via `navigator.sendBeacon`, which
survives navigation anyway. The event is sent either way — and the diagnostic above fires the
click programmatically, so it won't open your mail client at all.
