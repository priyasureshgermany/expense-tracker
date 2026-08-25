# Release notes

Newest first. One line per change. Written by `tools/bump-version.mjs` on each
release, and shown in the app under **Settings → About → What’s new**.

## 1.1.3 — 2026-08-25
- The + button is glass now, tinted and blurred rather than solid
- Recurring entries opens straight from Settings, with no step in between
- Recurring entries are editable: tap one to change it, pause it or delete it, and + adds a new one
- Editing a recurring entry rewrites only what is still ahead; anything already paid stays put
- Removed Repeat from the entry sheet, cadence living on the recurring page now
- Added Settings > Notifications: in-app reminders for recurring entries due within three days
- A bell beside the settings cog carries the reminders, counted from 8am and cleared when opened

## 1.1.2 — 2026-08-24
- New app icon: the whole tile is dark distressed leather, with Sansad Bhavan and a euro tooled into it
- Added tools/make-icons.py, which draws the icon set from scratch

## 1.1.1 — 2026-08-24
- Fixed every date being a month ahead — a duplicate helper shadowed the original, so today, the current period and new entry dates were all wrong
- New app icon: a brown leather wallet with a euro stamped in gold
- The Today pill carries a curved arrow, and the + chooser slides up and back down instead of appearing
- Renamed Release notes to What's new
- Bigger icons on the settings tiles, with About spanning the row in its own shade

## 1.1.0 — 2026-08-24
- Moved the tabs to a bar fixed along the bottom of the screen
- Add entry is now a round + above the tab bar, offering Income or Expense first
- Tapping the title returns to this period's dashboard, and a Today pill appears once you navigate away
- Added Settings > Your profile; your first name greets you under the title
- Added Settings > Accounts, so an entry can record which account it moved through
- Bank Transfer income now records both the sending and the receiving account
- Trimmed the category pickers to the ones in use; retired ones still label existing entries
- Moved Recurring entries into Settings and removed Leave a note
- Settings opens on a grid of tiles, one topic per pane, instead of one long scroll
- Replaced every dropdown with a list that shows about four rows and fades the rest
- Replaced the browser's date control with the app's own calendar, the same on every device
- Bigger category buttons, each with its icon in a tile
- New app icon: a wallet with a euro coin
- Folded 16 entries pointing at custom categories lost to the old save bug into Misc
- Fixed the hidden attribute being ignored wherever a class set display

## 1.0.11 — 2026-08-23
- Fixed the starting balance never syncing — it lived outside the backup, so a pull left it behind and In the account now ignored it

## 1.0.10 — 2026-08-23
- Expenses is the ledger again — paid plus planned, with budgets no longer folded in on top
- Renamed the budgets card to Budget, and the Buffer category to Misc
- Misc now absorbs ad-hoc spending on backups saved before the catch-all existed, instead of counting only entries tagged Misc

## 1.0.9 — 2026-08-23
- Fixed a device that has never pulled being able to overwrite the backup — a fresh browser is full of example entries, which replaced real data
- Push now asks twice before replacing a backup this device hasn't reconciled with

## 1.0.8 — 2026-08-23
- Froze the first period at 15 Aug 2026; the back arrow stops there
- One budget can now be the catch-all, absorbing any spend that isn't a recurring bill and has no budget of its own, while keeping its real category
- Unspent budget now counts as expected spending in Expenses and Net this period, so committed money isn't missing from the totals
- The catch-all is excluded from that, being a cushion rather than a commitment
- Removed the old general Groceries category, now covered by the German and Indian ones
- Fixed custom categories being lost on reload, because load() never read them back

## 1.0.7 — 2026-08-23
- Added Settings → Leave a note, which parks thoughts in FEEDBACK.md in the synced repo
- Notes are queued locally and only cleared once GitHub has them, so writing one offline never loses it

## 1.0.6 — 2026-08-23
- Renamed the Expenses tab to வரவு செலவு
- Made the Income and Expenses totals on the dashboard tappable, opening the entries behind them
- Added release notes, viewable in the app under Settings → About

## 1.0.5 — 2026-08-23
- Removed the tick on each budget bar that looked like a rendering glitch; the card footer now states used-versus-elapsed in words

## 1.0.4 — 2026-08-23
- Added custom income and expense categories, created from a chip at the end of the category list
- Moved the income/expense chart above the budgets card so the overall picture reads first
- Renamed "This period" to "Money in, money out" and "Budgets this period" to "What's left to spend"

## 1.0.3 — 2026-08-22
- Removed the Groceries and Misc buffer charts, which budgets already covered
- Kept EMI out of budgets, since a fixed amount on a known date belongs in a recurring entry

## 1.0.2 — 2026-08-22
- Added budget envelopes: a per-period allowance per category that every expense draws down
- Added Groceries — German, Groceries — Indian, Non-Veg, EMI and Buffer categories
- A saved shop now posts to the grocery category matching its store

## 1.0.1 — 2026-08-22
- Stopped the version hook from sweeping unstaged edits into a release commit

## 1.0.0 — 2026-08-22
- Added Kindergeld to the income categories
- Added Settings → About showing the deployed version and whether this device is running it
- Started versioning: major on a new month, middle on the first release of a Monday, minor otherwise
- Renamed the tabs to Expenses and Shopping cart, and gave each shopping item a quantity box
- Showed "In the account now" always, from settled income minus settled expenses
- Added Cash Withdrawal, Credit card payment, Investment, To Priya and To India categories
- Reported the real reason GitHub sync fails instead of one catch-all message
- Stopped an empty browser from overwriting a good backup, and added "Pull onto this device"
- Made saved purchases tappable, with an editable total that posts to the ledger
- Simplified the shopping cart: tap-to-add staples, no per-item price, one total bill at the end
- Added receipt-text scanning that fills prices and appends unmatched items
- Added the shopping cart with German and Indian store checklists
- Switched budget periods to run the 15th to the 14th
- Added the lock screen banner, a PIN with security-question recovery, and re-locking after 5 minutes idle
- Hid amounts behind •••• by default, revealed by the eye button
- Fixed the service worker pinning devices to the first build they ever cached
- Made the app installable as a PWA, with correct install steps on iOS
- Renamed the app to பணப்பை
