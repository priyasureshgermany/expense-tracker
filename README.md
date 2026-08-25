# பணப்பை (Panappai) — offline euro expense tracker

Single-file web app. No build step, no server, no required dependencies.
Open `index.html` in any browser, or host the file anywhere static.

*பணப்பை* is Tamil for "money bag / purse" — the app's name.

## What it does

- **Budget periods run the 15th to the 14th**, not calendar months — so a
  period reads as e.g. *15 Aug – 14 Sept*. Every total, filter, chart and the
  ◀ ▶ navigation follows that cycle.
- **Three views**, switched by the tab bar fixed along the bottom of the screen:
  **Dashboard** (charts), **வரவு செலவு** (the date-by-date ledger) and
  **Shopping cart** (grocery checklists).
- **Accounts.** Entries can name the account the money moved through, so you
  know where a payment came from or where income landed. Bank Transfer income
  records both ends. See *Your profile and accounts* below.
- **Dashboard chart.** *This period* compares income, planned expense and
  actual expense; each bar is tappable for a plain-English explanation of the
  number. (Groceries and Misc buffer charts used to sit alongside it — budget
  envelopes cover both per category and with real drawdown, so they were
  duplicate views and have gone.)
- **Period health colours**, on the dashboard's period strip, based on
  (income − expenses) ÷ income:
  - 🔴 **Red** — expenses exceed income
  - 🟠 **Orange** — a thin buffer, under 5% surplus
  - 🟡 **Yellow** — a comfortable 5–15% surplus
  - 🟢 **Green** — a healthy 15%+ surplus
- **A colourful, tactile feel** throughout — rich category colours, gradient
  buttons, a count-up animation on the headline figures, a small confetti burst
  when you mark something paid, and a soft fade between views.
- **Custom categories.** The built-in list is a starting point — the dashed
  **+ New category** chip at the end of the category list in a new entry adds
  your own, for income or expenses. They work everywhere the built-ins do:
  entries, recurring rules, budgets and charts. Colours are assigned spaced
  around the wheel so a new one doesn't look like an existing one, duplicate
  names are refused, and a category already used by an entry can't be deleted
  until those entries are retagged.
- **Budget envelopes** ("What's left to spend") for money spent bit by bit. A
  planned entry is one dated amount that's either pending or settled — right
  for rent, wrong for a €200 grocery allowance spent across a dozen trips. Set
  a per-period amount for a category and every expense in it draws the
  envelope down:
  - Each envelope shows spent, left, a percentage and a bar, going yellow near
    the limit, orange when well ahead of an even spend, red once over.
  - The card foots with how much is used against how far through the period
    you are — 60% spent 30% of the way in is the thing worth noticing.
  - Tap an envelope to see every spend against it with dates, and to add
    another in two taps — amount, optional note, done.
  - A shop saved in the **Shopping cart** lands in *Groceries — German* or
    *Groceries — Indian* automatically, by store.
  - **EMI** is deliberately not budgetable: a fixed amount on a known date is
    a recurring entry, not an envelope drawn down unpredictably.
  - One envelope can be the **catch-all** (*Everything else counts against*).
    Any expense that isn't a recurring bill and has no budget of its own is
    drawn from it, while keeping its real category on the entry — so a Buffer
    absorbs Education, a card payment or a one-off shop without you having to
    retag anything.
- **Budgets count as expected spending.** Whatever is still unspent in a budget
  is added to Expenses and subtracted from Net this period, since it's money
  already committed — no need to pre-enter dated entries for spending that
  happens unpredictably. The catch-all is the exception: as the cushion, only
  what's actually been spent from it counts.
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
- **Money already in the account.** The dashboard always shows a running
  balance from settled income minus settled expenses. Optionally set what the
  account holds today in **Settings** and it counts forward from there instead.
  Planned entries are excluded either way — they haven't touched the bank yet.
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

The **Shopping cart** tab keeps two checklists — **German stores** and **Indian
stores** — designed for tapping rather than typing:

- **Add items** opens a picker of staples per store, grouped by aisle
  (Molkerei & Eier, Obst & Gemüse, … / Dal & pulses, Spices, …). Tap a chip to
  add it, tap again to remove. A small "Not on the list?" field covers
  anything the catalogue misses.
- **A quantity box** sits beside each item, taking free text so "2", "1kg" and
  "500g" all work. It carries through to the saved purchase.
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
when you press Push, called directly from your browser via the GitHub REST
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
`data/panappai-backup.json`), then **Save & enable backup**. Sync is
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
| `tools/make-icons.py` | Draws the icon set — a leather wallet with Sansad Bhavan and a euro tooled into it — and writes every size into `icons/`. Run `python tools/make-icons.py` from the repo root after changing it; needs Pillow |

## Installing it as an app

`index.html` registers a service worker and links a web app manifest, so any
browser that supports PWAs (Chrome, Edge, Android; Safari via "Add to Home
Screen") can install it as a standalone app with its own icon, no browser
chrome, and offline access after the first load. It must be served over
`http(s)://` — service workers don't run from a `file://` URL, so host it on
any static server (GitHub Pages, Netlify, `python -m http.server`, etc.) to get
the install prompt.

Run the tests with `node test.mjs` (needs Playwright installed).

## Your profile and accounts

**Settings → Your profile** holds a first name, last name and email. The first
name is the only one that shows: the title bar greets you with
*வணக்கம் ‹first name›* once it's set.

**Settings → Accounts** is the list of places money actually sits — a bank, a
card, cash in a wallet. Every entry can name the account it moved through, so
the ledger answers *where did this come from* rather than only *what was it
for*. An expense asks **Paid from**; income asks **Paid into**. An account still
attached to entries can't be removed until those entries are retagged.

**Bank Transfer** income is the one case with two ends — it's your own money
moving between your own accounts — so it asks **From account** as well as
**To account**. Picking any other income category hides the from-field again.

## Naming the parts

Every region has a stable name, so a change can be asked for precisely —
"the balance card shows the wrong figure" beats "the blue box at the top".

**Always on**

| Name | What it is |
|---|---|
| Top bar | Brand + greeting (tap to return to this period's dashboard), 👁 show/hide amounts, ⚙ settings |
| Period bar | `‹ 15 Aug – 14 Sept 2026 ›`, plus a **Today** pill once you've navigated away |
| Tab bar | Fixed along the bottom: Dashboard · வரவு செலவு · Shopping cart |
| Add button | The round **+** above the tab bar; tapping it offers Income then Expense |

**Dashboard**, top to bottom

| Name | What it is |
|---|---|
| Balance card | "In the account now" |
| Statement | "Net this period", the Income/Expenses tiles and the paid meter |
| Money in, money out | Income vs planned vs actual bars |
| What's left to spend | The budget envelopes |
| Period health | The scrollable strip of periods |
| Where the money goes | Spending by category |

**வரவு செலவு**: the status tabs (All / Planned / Filled), the type pill
("Showing income only") and the entry rows.

**Shopping cart**: store tabs, **Add items**, the item list, **Scan receipt**,
the save block, **Recent purchases**.

**Sheets** (the panels that slide up): New entry, Recurring entries, Settings,
Budgets, Add items, Scan receipt, Purchase, What’s new, New category.

**Settings** opens on a grid of tiles rather than one long scroll — Your
profile, Accounts, Recurring entries, Starting balance, App lock, Notifications
& appearance, GitHub sync, Data & backup, About. Tapping one opens that pane; ‹
goes back. **Recurring entries** is the exception: it has no settings of its own,
so its tile opens the list itself.

**Recurring entries** are created and changed on their own page, reached from
Settings. Tap one to edit it, pause it or delete it; the **+** at the bottom
right adds a new one. Editing rewrites only the occurrences still ahead of you —
anything already ticked off as paid stays exactly as it was. Because cadence
lives here, the entry sheet has no Repeat field.

**Self transfers** move your own money between your own accounts. They carry an
amount, both accounts and a date — no category, no status — and are deliberately
absent from every dashboard total, since nothing was earned or spent. They show
under **Transfers** in the ledger, and they move the two account balances. Bank
Transfer has been retired from the income categories, which this replaces;
existing entries using it still read correctly.

**Starting balances are per account.** Each account gets its own opening
figure, and **Settings → Accounts** shows what each holds now — that opening
balance plus everything settled that has touched it since. Entries with no
account tagged count on the dashboard but in none of the accounts, which the
Accounts pane says out loud rather than leaving as a discrepancy.

**Deleting all entries and turning off backup ask for your PIN**, when one is
set. Both are irreversible and neither should rest on a double-tap alone.

**Reminders** (Settings → Notifications & appearance, off by default) put a dot on the bell
in the top bar for anything recurring that's due within three days: a green
heart at three days, amber at two, red from tomorrow onward, staying red while
overdue until you tick it off. A day's reminders count from **8am**, and the dot
clears once you open the bell, returning the next morning. They are in-app only
— the app can't wake itself while closed, so nothing is sent to your phone.

**Choosing things.** There are no native dropdowns. Anywhere you pick one of a
set — account, repeat cadence, account type, which category to budget — the
field shows the current choice, and tapping it opens a list beneath showing
about four rows, with whichever end has more behind it fading out. The popover
flips above the field when there isn't room below.

**Dates** use the app's own calendar rather than the browser's: a rounded month
grid, Monday-first, with the selected day filled, today outlined, and a
**Today** shortcut. It looks the same on every device, which the native control
does not.

## Versioning

**Settings → About** shows the deployed version, when it was deployed, and
whether this device is running the latest build or a cached older one.

Versions start at `1.0.0` and move on every release:

| Part | Bumped when |
|---|---|
| **major** | first release in a new calendar month |
| **middle** | first release made on a Monday |
| **minor** | every other release |

The higher rule wins and resets the parts below it, so a Monday that also opens
a new month bumps major only. `version.json` records the date of the last
release, which is what makes "first of the month" and "first on a Monday"
decidable.

`tools/bump-version.mjs` applies this and rewrites `APP_VERSION` / `APP_BUILT`
in `index.html` plus the service worker's cache name, so every release also
invalidates the old cache. A pre-commit hook runs it automatically — install it
once per clone:

```bash
sh tools/install-hooks.sh
```

The hook skips rebases and merges, and commits that only touch `data/` (the
app's own backup pushes) or `tools/`. Use `node tools/bump-version.mjs --dry`
to see what the next version would be without writing anything.

### One version per branch, not per commit

The hook compares `version.json` against **what is released on `origin/main`**,
not against the previous commit. So a branch needs exactly one bump however many
commits it takes, and a round of review feedback no longer costs a version
number. Anything reaching `main` still carries a version `main` has never seen,
which is the guarantee that actually matters.

When more work lands on a branch whose release is already prepared, add to that
version rather than cutting another:

```bash
node tools/bump-version.mjs --amend --note "Found in review"
```

`--amend` refuses when the current version is the released one — nothing has
been prepared on that branch yet, and amending would rewrite the notes of the
live release instead.

One thing worth knowing: if `index.html` or `sw.js` have unstaged edits, the
hook **stops the commit** rather than bumping. It has to stage those two files
after rewriting them, and doing so would otherwise pull unrelated working-tree
changes in with it.
