# Release notes

Newest first. One line per change. Written by `tools/bump-version.mjs` on each
release, and shown in the app under **Settings → About → What’s new**.

## 1.1.27 — 2026-08-27
- The home screen name is now Panappai in Latin letters, so iPhone Spotlight and the Safari address bar can find it — Tamil script cannot be typed on an English keyboard.
- The Tamil name stays as it was everywhere inside the app.

## 1.1.26 — 2026-08-27
- Receipt photos are prepared before reading — greyscaled, enlarged and contrast-stretched — which stops a G being read as a 6 and a decimal comma as a full stop
- Recognition runs in English and German together, so umlauts survive; German alone silently dropped whole lines
- Fixed a scan of Apfel never matching Aepfel on the list, since the two spellings normalised differently
- Payment, change and tax-table lines are filtered out, so a loose crop no longer turns a receipt footer into items
- Fixed the crop buttons, where Read this area was squeezed to a sliver by Cancel
- An account in use can now be deleted; its entries are untagged rather than the deletion being refused
- Moved the photo button above the paste box, and left cards out of Starting balance since a card carries a debt rather than a balance
- Added Bank Transfer as an expense category

## 1.1.25 — 2026-08-27
- A receipt photo is now cropped before it is read: drag the box over the item lines and only that part is recognised
- Cropping is about a third quicker than reading the whole photo, and keeps the shop address and totals out of the text entirely
- The photo button is now Capture or select photo, and offers your gallery as well as the camera

## 1.1.24 — 2026-08-27
- Scan receipt can now read a photo, not just pasted text
- Text recognition runs on the device via Tesseract.js, fetched once from a CDN and cached offline after; nothing is uploaded anywhere
- The recognized text fills the box for you to check before Read receipt, since OCR sometimes misreads a digit or a squashed word
- Paste-in text still works exactly as before, as a fallback for a receipt that photographs badly

## 1.1.23 — 2026-08-27
- The Expense and Income tabs on a recurring entry match the ones on a normal entry, and carry the same red and green

## 1.1.22 — 2026-08-27
- Hid the scrollbar down the right edge of the page and the panels, which the design never made room for

## 1.1.21 — 2026-08-27
- Fixed tapping the kind an entry already is resetting its category, which the single tab on an edit made easy to do by accident
- About says when a newer build is out and offers an Update button that reloads into it, rather than asking you to close and reopen the app

## 1.1.20 — 2026-08-27
- Editing an entry shows only the kind it is, rather than offering to turn an expense into a transfer

## 1.1.19 — 2026-08-26
- Added back buttons to the sheets opened from inside another one, so returning lands where you left off
- Add items opens on a search box pinned above the staples, which filters them as you type
- Every shopping staple carries its own drawing rather than reading as a wall of text
- An unmatched receipt line can be renamed to re-match, or dragged onto a list item to merge into it
- Two receipt lines landing on one item now add together instead of the last one winning
- Indian staples: dropped coconut oil, rajma, poha, rice flour, sambar powder and sona masoori rice
- Indian staples: added coffee powder, gingelly oil, groundnut oil, ponni boiled rice, raw banana and mint, with an Oils group

## 1.1.18 — 2026-08-25
- Telecom shows signal bars and Loan a coin, instead of the generic tag every custom category used to get
- A category you create now takes a drawing guessed from its name, and can carry one at all

## 1.1.17 — 2026-08-25
- Retagged the entries on retired categories: Gas, Electricity and ARD Radio stay on Utilities, which is offered again
- Internet and the three phone recharges moved to a new Telecom category
- McFit and the swimming club moved to Health, the personal loan to a new Loan category, and Kindergeld to a new Benefits
- Rent stays as it was

## 1.1.16 — 2026-08-25
- An entry using a retired category now shows it, selected, instead of appearing to have none
- Recurring entries follow the same rule, and no longer offer retired categories when adding a new one

## 1.1.15 — 2026-08-25
- The ledger tabs sit on one row again; the fourth had been pushed onto a line of its own

## 1.1.14 — 2026-08-25
- Added Self transfer: your own money moving between your own accounts, absent from every dashboard total and moving only the two balances
- Added a Transfers tab to வரவு செலவு
- Retired Bank Transfer from the income categories, replaced by Self transfer

## 1.1.13 — 2026-08-25
- Starting balances are per account, so each bank and card carries its own opening figure
- Settings > Accounts shows what each account holds now, tracked from its opening balance
- Deleting all entries and turning off backup ask for your PIN when one is set
- Added back buttons to the recurring entries list and editor

## 1.1.12 — 2026-08-25
- The unpushed count is a real comparison against the backup now, not a tally of saves — opening the app no longer looked like a change
- An eye button beside Push now lists exactly what would be pushed, added, changed and deleted
- Push asks twice, as pull does, since it replaces the backup outright
- Restored the September rent again, overwritten by a single-tap push from a device that had not pulled

## 1.1.11 — 2026-08-25
- Restored the September rent, whose occurrence had been deleted and so suppressed for good
- Saving a recurring entry now clears its future skips, so a month deleted by mistake comes back; past ones stand as history

## 1.1.10 — 2026-08-25
- Added an Every 28 days cadence, which is how mobile recharges actually run
- Set every existing recurring entry to Commerzbank
- Entries and recurring entries with no account offer Commerzbank rather than an empty picker
- The Push now button carries a count of changes not yet backed up
- A reminder appears once twenty changes are unpushed, and every twenty after
- The bell shows how many reminders are waiting, not just that some are
- Kept the four recurring entries already set to Deutsche Bank, setting only the other fourteen to Commerzbank

## 1.1.9 — 2026-08-25
- The amount box on a recurring entry is styled like the one on a normal entry, reading green or red as you type instead of plain white
- A recurring entry with no account set offers your first one (Commerzbank) instead of an empty picker; nothing is written until you save

## 1.1.8 — 2026-08-25
- Removed the backup button from the top bar; whether anything is unpushed is said in Settings instead
- Recurring amounts take the income and expense colours the ledger uses, rather than plain white
- Restored the six accounts and the profile, overwritten again by a device still running the old build
- Restored the profile as well, lost with the accounts to the same overwrite

## 1.1.7 — 2026-08-25
- Nothing is ever pushed automatically — push is a button you press, and the app never writes to your repo on its own
- A pull no longer pushes straight back, which is how a pull that dropped accounts erased them from the repo without anyone pressing push
- Added a backup button to the top bar, carrying a dot while there are changes you haven't pushed
- Restored the six accounts and the profile again

## 1.1.6 — 2026-08-25
- Fixed a pull wiping your accounts and profile — the pull rebuilt state without them, and the next sync wrote that back
- Every backup is now read through one function, so a new field can't be dropped by whichever copy nobody updated
- Deleting all entries keeps your accounts and profile, as it already did for budgets and categories
- Restored the six accounts and the profile lost this morning

## 1.1.5 — 2026-08-25
- The + is near-clear glass: the tint barely colours it and the blur, rim and specular carry the shape
- Thinned the + itself, and drew it in the theme's ink so it stays readable through glass

## 1.1.4 — 2026-08-25
- Notifications and appearance share one settings panel, each being a single control
- The + button is glossier and sits at 90% opacity
- Dropped the arrow on the About panel

## 1.1.3 — 2026-08-25
- The + button is glass now, tinted and blurred rather than solid
- Recurring entries opens straight from Settings, with no step in between
- Recurring entries are editable: tap one to change it, pause it or delete it, and + adds a new one
- Editing a recurring entry rewrites only what is still ahead; anything already paid stays put
- Removed Repeat from the entry sheet, cadence living on the recurring page now
- Added in-app reminders for recurring entries due within three days, under Settings > Notifications & appearance
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
