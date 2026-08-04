# GA4 tracking diagnostic — paste-in browser check

Use this when events aren't showing in GA4 Realtime. It tells you *which* of the four
possible causes you have, instead of guessing.

## Run it

**Nothing to paste.** The diagnostic ships inside `nav.js`, which every page already loads.
Pasted snippets get mangled by terminals, smart quotes and line wrapping — that's a whole
class of problem avoided by typing nine characters instead.

1. Open <https://hitthewall.net/c/108degrees.com.html>
2. Open DevTools (`F12`) → **Console** tab
3. Type:

```
wallDiag()
```

It prints a PASS/FAIL table, the page context, the events it pushed, and a plain-English
diagnosis. It fires the click programmatically, so your mail client will not open.

> **If the console says `wallDiag is not defined`, that IS the diagnosis:** you have a stale
> cached `nav.js`. Hard-reload with `Ctrl+Shift+R` (`Cmd+Shift+R` on Mac) and run it again.
> `nav.js` is served with `cache-control: max-age=600`, so a normal reload can hand back a
> copy from before tracking shipped.

## Reading the result

| Symptom | Cause | Fix |
|---|---|---|
| `wallDiag is not defined`, or `nav.js has tracking build` = FAIL | Cached old `nav.js` | Hard-reload `Ctrl+Shift+R`. Cache expires on its own within 10 min. |
| `gtag.js actually LOADED` = FAIL | **Ad blocker / privacy extension.** uBlock, AdBlock, Brave Shields, Firefox strict ETP and Safari ITP all block `googletagmanager.com`. Our code fires correctly; the request never leaves the browser. Note `gtag() defined` will still PASS — that's our own stub, so it proves nothing on its own. | Disable the blocker for hitthewall.net, or use an incognito/private window with extensions disabled. |
| `event pushed to dataLayer` = FAIL, everything else PASS | A real bug | Send the table over. |
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
