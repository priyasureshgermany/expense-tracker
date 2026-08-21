# Kassenbuch — offline euro expense tracker

Single-file web app. No build step, no server, no dependencies.
Open `index.html` in any browser, or host the file anywhere static.

## What it does

- **Planned vs. filled** — every entry is either *planned* (still to come) or
  *filled* (settled). Tap the circle on a row to flip it.
- **Green = income, red = expense**, everywhere.
- **Recurring entries** at weekly / monthly / every-2-months / quarterly /
  every-6-months / yearly intervals. Future occurrences appear automatically as
  planned entries, 12 months ahead.
- **Bank CSV import** for Commerzbank and Deutsche Bank exports, plus most other
  German bank formats. Handles `;` and `,` delimiters, German (`1.234,56`) and
  English (`1,234.56`) number formats, `Betrag` single-column and `Soll`/`Haben`
  two-column layouts, UTF-8 and Windows-1252 encodings. Duplicate rows are
  detected on re-import.
- **Auto-categorisation** by merchant name (REWE, Telekom, Deutsche Bahn, …).
- **Dark and light themes**, following the system or forced in Settings.
- **Installable as an app** (PWA) — add it to your home screen or desktop from
  the browser's install prompt, and it keeps working offline.

## Where the data lives

`localStorage`, in the browser on the device you use. Nothing is uploaded
anywhere. That also means it does not sync between devices — use
**Settings → Backup → Copy backup to clipboard** and paste it into the restore
box on the other device.

## Bank export instructions

- **Commerzbank:** Banking → Umsätze → Umsatzanzeige → *Exportieren als CSV*
- **Deutsche Bank:** Konto → Umsätze → *Export* → CSV

Direct bank login is deliberately not supported: neither bank offers a public
API for personal accounts, and a static page cannot hold credentials safely.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — open this |
| `kassenbuch.html` | Same app, body-fragment form (used for hosted publishing) |
| `manifest.webmanifest` | PWA manifest — name, icons, standalone display |
| `sw.js` | Service worker — caches the app shell for offline / installed use |
| `icons/` | App icons (192, 512, maskable, apple-touch) |
| `test.mjs` | Playwright test suite — 19 checks incl. both bank CSV formats |

## Installing it as an app

`index.html` registers a service worker and links a web app manifest, so any
browser that supports PWAs (Chrome, Edge, Android; Safari via "Add to Home
Screen") can install it as a standalone app with its own icon, no browser
chrome, and offline access after the first load. It must be served over
`http(s)://` — service workers don't run from a `file://` URL, so host it on
any static server (GitHub Pages, Netlify, `python -m http.server`, etc.) to get
the install prompt. `kassenbuch.html` (the body-fragment file) does not carry
the PWA tags — those only apply to `index.html`.

Run the tests with `node test.mjs` (needs Playwright installed).
