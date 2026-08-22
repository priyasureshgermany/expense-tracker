# பணப்பை (Panappai) — offline euro expense tracker

Single-file web app. No build step, no server, no required dependencies.
Open `index.html` in any browser, or host the file anywhere static.

*பணப்பை* is Tamil for "money bag / purse" — the app's name.

## What it does

- **Dashboard first.** The home screen shows the month's net, income/expenses,
  a purse that visually empties as you spend, and a colour-coded strip of
  surrounding months. Tap **Tracker** (next to Dashboard) to switch to the
  date-by-date list of income and expenses — the two views share the same
  month navigation and Add/Import controls.
- **The purse.** "Income left in the purse" fills with this month's income
  and empties as expenses are actually paid (not merely planned), with coins
  spilling out of its drawstring neck while it's draining. Its colour follows
  the same health band as the monthly strip below.
- **A more colourful, tactile feel** throughout — richer category colours,
  gradient buttons, a count-up animation on the headline figures, a small
  confetti burst when you mark something paid, and a soft fade between the
  Dashboard and Tracker views.
- **Monthly health colours**, on the dashboard's monthly strip and the purse,
  based on (income − expenses) ÷ income for that month:
  - 🔴 **Red** — expenses exceed income
  - 🟠 **Orange** — a thin buffer, under 5% surplus
  - 🟡 **Yellow** — a comfortable 5–15% surplus
  - 🟢 **Green** — a healthy 15%+ surplus
- **Planned vs. filled** — every entry is either *planned* (still to come) or
  *filled* (settled). Tap the circle on a row to flip it.
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
- **Installable as an app** (PWA) — add it to your home screen or desktop, and
  it keeps working offline. On Chrome/Edge/Android an in-app banner offers an
  install button; on iOS Safari it shows the "Add to Home Screen" steps
  instead, since iOS has no programmatic install prompt.
- **App lock** — gate the app behind a 4-digit PIN, or your device's own
  Face ID / Touch ID / Windows Hello via WebAuthn. Set it up from
  **Settings → App lock**. This locks the *screen* only; it does not encrypt
  the data itself, so it's a deterrent for a shared device, not real
  cryptographic security.
- **Optional GitHub sync** — see below.

## Where the data lives

`localStorage` by default, in the browser on the device you use — nothing is
uploaded unless you turn on GitHub sync. Use
**Settings → Backup → Copy backup to clipboard** to move data to another
device by hand, or use GitHub sync for it to happen automatically.

### GitHub sync (optional)

**Settings → GitHub sync** can push a JSON backup file to a repo of your own
after every change, called directly from your browser via the GitHub REST
API — no server involved. Because it's a static page, the token has to live
in the browser to make those calls, which means:

- Anyone with access to that browser/device's storage could read the token.
- **Always use a fine-grained personal access token** (GitHub → Settings →
  Developer settings → Personal access tokens → Fine-grained tokens) scoped
  to just this one repository, with **Contents: Read and write** permission
  only — never a classic token with broad `repo` access.
- Treat it like any other secret: don't enable this on a public/shared
  computer, and revoke the token from GitHub if you ever stop using it.

Fill in the token, the repo as `owner/repo`, and a file path (defaults to
`data/panappai-backup.json`), then **Save & enable auto-sync**. Sync is
debounced a few seconds after each change so a burst of edits doesn't fire an
API call per row.

## Bank export instructions

- **Commerzbank:** Banking → Umsätze → Umsatzanzeige → *Exportieren als CSV*
- **Deutsche Bank:** Konto → Umsätze → *Export* → CSV

Direct bank login is deliberately not supported: neither bank offers a public
API for personal accounts, and a static page cannot hold credentials safely.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — open this |
| `kassenbuch.html` | An older, simpler body-fragment form of the app (used for hosted publishing elsewhere) — it has the mobile input-zoom fix but **not** the dashboard/purse/health-colour/lock/GitHub-sync features, since those need a `<head>` (PWA tags, app-lock pre-paint script) that a body fragment doesn't have |
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
the install prompt.

Run the tests with `node test.mjs` (needs Playwright installed).
