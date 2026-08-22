# பணப்பை (Panappai) — offline euro expense tracker

Single-file web app. No build step, no server, no required dependencies.
Open `index.html` in any browser, or host the file anywhere static.

*பணப்பை* is Tamil for "money bag / purse" — the app's name.

## What it does

- **Budget periods run the 15th to the 14th**, not calendar months — so a
  period reads as e.g. *15 Aug – 14 Sept*. Every total, filter, chart and the
  ◀ ▶ navigation follows that cycle.
- **Three views**, switched by the toggle under the period bar:
  **Dashboard** (charts), **Tracker** (the date-by-date ledger) and
  **Shop** (grocery checklists).
- **Dashboard bar charts.** Three grouped comparisons, each bar tappable to
  reveal a plain-English explanation of the number:
  - *This period* — income vs. planned expense vs. actual expense
  - *Groceries* — planned vs. actual
  - *Misc buffer* — what's left after fixed bills and the grocery plan, versus
    the ad-hoc spending eating into it
- **Period health colours**, on the dashboard's period strip, based on
  (income − expenses) ÷ income:
  - 🔴 **Red** — expenses exceed income
  - 🟠 **Orange** — a thin buffer, under 5% surplus
  - 🟡 **Yellow** — a comfortable 5–15% surplus
  - 🟢 **Green** — a healthy 15%+ surplus
- **A colourful, tactile feel** throughout — rich category colours, gradient
  buttons, a count-up animation on the headline figures, a small confetti burst
  when you mark something paid, and a soft fade between views.
- **Planned vs. filled** — every entry is either *planned* (still to come) or
  *filled* (settled). Tap the circle on a row to flip it.
- **Recurring entries** at weekly / monthly / every-2-months / quarterly /
  every-6-months / yearly intervals. Future occurrences appear automatically as
  planned entries, 12 months ahead.
- **Bank CSV import** (Settings → Import a bank statement) for Commerzbank and Deutsche Bank exports, plus most other
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
- **Amounts hidden by default.** Every figure shows as `••••` until you tap the
  eye button in the top bar, so the app can be opened in public without the
  numbers on show. The choice is remembered.
- **Money already in the account.** Set what the account holds today in
  **Settings**, and the dashboard carries it forward: that balance, plus income
  received, minus expenses paid since that date. Planned entries are excluded —
  they haven't touched the bank yet.
- **App lock** — a 4-digit PIN, set from **Settings → App lock**. It asks again
  after 5 minutes idle and whenever the app is reopened, not only on a cold
  start. Pair it with a **security question**: the PIN is stored only as a
  salted hash and can never be shown back, so answering the question leads to
  setting a new PIN. The lock screen is a branded full-bleed gradient with the
  app name and a fan of euro notes. This locks the *screen* only; it does not
  encrypt the data itself, so it's a deterrent for a shared device, not real
  cryptographic security.
- **Optional GitHub sync** — see below.

## Shopping lists

The **Shop** tab keeps two checklists — **German stores** and **Indian
stores** — designed for tapping rather than typing:

- **Add items** opens a picker of staples per store, grouped by aisle
  (Molkerei & Eier, Obst & Gemüse, … / Dal & pulses, Spices, …). Tap a chip to
  add it, tap again to remove. A small "Not on the list?" field covers
  anything the catalogue misses.
- **Ticking an item asks for nothing** — no per-item price to fill in while
  you're standing in the shop.
- **One Total bill box** at the end, filled in once when you're done (or
  filled automatically by a receipt scan).
- **Save purchase** sits at the end of the page: it files the ticked items
  into *Recent purchases* with a purchase date, leaves anything unbought on
  the list, and can post the total bill to the ledger as a groceries expense.
- **Recent purchases are tappable** — opening one shows everything bought on
  that trip, with per-item prices where a scan supplied them. The **total is
  editable there**, so a shop saved without one can be priced afterwards:
  setting a total posts the groceries expense, changing it updates that same
  entry, and clearing it removes it again rather than leaving a €0 row.

### Scanning a receipt

**Scan receipt** (just above Save) takes the **text** of a receipt, pasted in.
It pulls out each priced line, matches it against the list — folding German
umlaut spellings, so `AEPFEL 1KG` finds *Äpfel* — ticks the item and records
its price, and appends anything it can't match to the end of the list. The
**Total bill** box is filled in from the scanned lines. Totals, change and tax
lines are ignored. You see the matched/new breakdown and confirm before
anything is applied.

Reading a **photo** of a receipt is deliberately not supported: on-device text
recognition would mean bundling an OCR library, which would end this app's
single-offline-file design. Most shops e-mail a digital receipt you can copy
the text from.

## Where the data lives

`localStorage` by default, in the browser on the device you use — nothing is
uploaded unless you turn on GitHub sync.

**`localStorage` is per-browser, not per-device.** Safari and Chrome on the
same phone have completely separate storage, so entries added in one are
invisible in the other, and an app lock set in one doesn't apply to the other.
There is no way for a web page to share storage across browsers. To carry data
over, either use **Settings → Backup → Copy backup to clipboard** and paste it
into the other browser's restore box, or set up GitHub sync in both and use
**Pull onto this device**.

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

**Push now** uploads immediately. **Pull onto this device** downloads the
backup and *replaces* whatever this browser currently holds — that's how a
second browser or phone catches up, so it asks for a second tap to confirm.

## Bank export instructions

- **Commerzbank:** Banking → Umsätze → Umsatzanzeige → *Exportieren als CSV*
- **Deutsche Bank:** Konto → Umsätze → *Export* → CSV

Direct bank login is deliberately not supported: neither bank offers a public
API for personal accounts, and a static page cannot hold credentials safely.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — open this |
| `kassenbuch.html` | An older, simpler body-fragment form of the app (used for hosted publishing elsewhere). It still works on calendar months and has **none** of the period/charts/Shop/lock/GitHub-sync features, which need a `<head>` (PWA tags, app-lock pre-paint script) that a body fragment doesn't have |
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
