# Release notes

Newest first. One line per change. Written by `tools/bump-version.mjs` on each
release, and shown in the app under **More → What’s new**.

Each line is tagged `fix:`, `new:` or `better:`. The app reads the tag to put an
icon beside it — a repair, something that was not there before, or something
existing made better. Guessing that from the wording alone does not work: “a bar
fixed along the bottom” is not a bug.

## 2.0.28 — 2026-09-04
- new: Mark a saved note as sorted, then clear all the sorted ones at once instead of deleting them one at a time
- better: The euro on the mark is larger, and tucks under the bottom step of the building rather than floating below it
- better: The tick-off control is a rounded square, the same as every other checkbox in the app

## 2.0.27 — 2026-09-04
- better: The three tiles on More take less room - 25px off each tile and 26px off the sheet
- fix: The mark stays on the top bar on every panel. It was taken away on the way to transactions or shopping, which left the bar looking like a different app's

## 2.0.26 — 2026-09-04
- fix: The update badge appears without a trip through Settings. The check only ran at boot and inside the About panel, so an app left open across a release never noticed one

## 2.0.25 — 2026-09-04
- fix: The bell shows a count whenever anything is due. It was counting what was unread, using two dates written differently, and between midnight and 5am it ran backwards - opening the bell was what made the badge appear

## 2.0.24 — 2026-09-03
- fix: Cards can hold a starting balance. PayPal is filed as a card, so it never appeared in the list and could not be given the money it actually holds
- fix: The total beside Accounts refreshes when a balance is saved or cleared, instead of sitting on the old figure until you left the pane and came back
- better: Shorter boxes and tighter rows in the starting balance list

## 2.0.23 — 2026-09-03
- better: The eyes in the hide-a-category list lost their boxes. The icon alone says what it is, and two dozen chips made the list read as a form
- better: The mark on the dashboard is half again bigger, sized to the bar it sits in rather than to a fixed number

## 2.0.22 — 2026-09-02
- new: Showing a hidden income category again asks the security question from App lock. Hiding one stays free
- better: No warning bar on the dashboard when a category is hidden

## 2.0.21 — 2026-09-02
- new: Notify this device: a notification on your phone or laptop for anything due tomorrow or today, once per entry per day
- better: A hidden category is now left out of everything rather than blanked. Its entries, budget, slice, bars, exports and reminders all go, so the totals change and the dashboard says so in a bar you can tap to put it back
- new: An info button beside Reminders and beside Keep a category off the screen, which is also where the explanations went so the category list has room to scroll
- better: Reminders stay put in the Notifications panel while the category list scrolls under them

## 2.0.20 — 2026-09-02
- better: Settings panels carry their colour on the left edge only, the same as More. The icon chips and names go back to the accent

## 2.0.19 — 2026-09-02
- fix: The three tiles on More are back to their old type and icons. Three rules setting them were deleted by mistake when the coloured edge went in, so the icons drew at their container size and the titles fell back to a browser default
- better: Light or dark is the plain segmented control again, with no colour of its own

## 2.0.18 — 2026-09-02
- fix: The hueless panel edge is dark on a light background. White was right on a dark card and all but invisible on a light one

## 2.0.17 — 2026-09-02
- fix: The balance card counted entries ticked off ahead of their date. A bill dated next January, settled early, came out of a balance the money was still sitting in
- better: Every panel in Settings and on More carries its own colour down its left edge, drawn from the pie chart's own palette
- better: Light or dark moved out of Notifications and onto More, as three buttons under the three tiles
- new: Any category can be kept off the screen on its own. Hide Salary and its entries, budget row, slice and report lines all read as dots while everything else stays readable
- better: Starting balance moved inside Accounts, which is what it is a fact about
- new: Feedback and Report a bug, each asking one question at a time, saved on the device with a list and a detail view

## 2.0.16 — 2026-09-01
- better: Reports count by the 15th-14th period by default, and that reading now sits first. Calendar months are the second option
- fix: The pie came out of Export PDF cut in half. The shell was still in the flow at a full viewport height, putting a blank page in front of everything, and the sheet is a flex column that Chrome fragments by clipping rather than by breaking
- fix: Exporting from dark mode gave pale grey type on white paper. The print styles forced the background light and left the ink dark

## 2.0.15 — 2026-09-01
- fix: Transfers seen from one account now show in the bar chart. They were skipped outright, so picking Transfers and a bank listed three entries above bars sitting at nothing
- fix: A report of nothing but transfers draws the ring around its larger side. Three transfers into Commerzbank and one out of it drew the ring around the 200 that left and said nothing of the 3.000 that arrived

## 2.0.14 — 2026-09-01
- fix: The bar chart follows the Income, Expenses and Transfers chips too. Filtering to Income left the report reading Expenses 0,00 over a chart still drawing expenses, which is the chart disagreeing with the total above it

## 2.0.13 — 2026-09-01
- fix: Tapping a slice on the ring narrows the bar chart to that category, the same way the chips do. It was only ever a highlight, so the ring showed one category while the bars underneath still showed all of them

## 2.0.12 — 2026-09-01
- fix: The report filters sit above Chart and Details rather than inside Details. They always governed both, so narrowing to a category and switching to Chart left the ring and the bars filtered with no way to see what was on, or to change it

## 2.0.11 — 2026-09-01
- new: The bar chart follows the category and account chips. Pick Groceries and the bars are groceries, month by month, with the caption naming what is being shown. Pick nothing and it is income against expenses as before

## 2.0.10 — 2026-09-01
- fix: The bar chart's monthly bars follow Counted by. They were always calendar months, so on the 15th-14th setting the range and the bars were measuring two different things

## 2.0.9 — 2026-09-01
- better: The starting balance rows are just account names and empty boxes. What each one currently holds is said once, as an In force now snapshot under Clear all balances, alongside the ones saved before it

## 2.0.8 — 2026-09-01
- better: The refresh on the reminders panel is gone. Opening the panel already builds the list afresh, and the schedule is worked out a year ahead on load, so it was a control that could find nothing

## 2.0.7 — 2026-09-01
- new: Saving starting balances keeps a snapshot of what was set and when, listed under Saved before, so a baseline replaced later can still be accounted for
- better: The starting balance boxes start empty and each account says what it currently holds underneath its name. A box left blank leaves that account alone rather than forgetting its figure — clearing is what Clear all balances is for

## 2.0.6 — 2026-09-01
- fix: The slot stamped on each recurring occurrence is written down rather than worked out afresh on every load. Left in memory it was recomputed from whatever date the entry happened to be sitting on, so an entry moved and not otherwise saved came back with the wrong slot and let the duplicate through again

## 2.0.5 — 2026-09-01
- new: A refresh on the reminders panel works the schedule out again and looks once more at what has been settled, for a bill paid somewhere other than here
- fix: A reminder no longer asks for a bill already settled for its period. Paying one by hand used to leave its planned twin still asking, and paying that too is how a ledger stops matching a bank. Weekly and every-28-days entries are judged by the date they fall on rather than the month, so a second one in the same month still shows

## 2.0.4 — 2026-09-01
- new: Reminders can be ticked off where they are. Each one carries the same tick the ledger does, and asks the same question about which day it was paid, rather than sending you into the entry to do it

## 2.0.3 — 2026-09-01
- fix: A recurring entry paid on a different day no longer comes back a second time. Each occurrence remembers the date the schedule asked for, so moving it to the day you actually paid does not leave the original looking unfilled — which is what was putting the same bill in a period twice and moving Net this period with it
- new: Ticking a recurring entry off asks when it was paid, if it is not sitting on today. One tap for the scheduled day, one for today

## 2.0.2 — 2026-09-01
- fix: Saving a recurring entry no longer puts a date you had moved by hand back on the schedule. Correcting an amount or marking one automatic leaves every planned date where it is; only changing how often it repeats, or the date it counts from, rebuilds them, and that asks first
- new: The recurring entries list shows A or M on each one, the same letters its entries carry
- better: On the dark theme the app mark is turned toward the blue the rest of it is built from, rather than sitting on the bar as a tan stain

## 2.0.1 — 2026-09-01
- better: The app's own mark sits in the middle of the top bar on the dashboard

## 2.0.0 — 2026-09-01
- new: Recurring entries say whether they are taken automatically or paid by hand. Entries carry a green A or an amber M in the ledger and in the report table, so the ones still wanting doing stand out
- new: A bank logo can be changed or removed. Tapping a tile that already has one asks which

## 1.2.9 — 2026-08-31
- better: Income, expenses and transfers are colour coded through the report: green, red and blue on the filter chips whether they are on or off, and on the Type column of the table. The same three colours the + button and the ledger already use

## 1.2.8 — 2026-08-31
- fix: Reports count only settled entries. An entry dated last month and still not ticked off is money that has not moved, and a report of what was spent no longer carries it
- fix: The monthly average is back wherever the stretch is longer than a month, and each category is divided by the months it actually ran in. Investment at 500 in one August reads 500 a month, not 500 divided by twelve
- new: Each account carries a mark: a bank or card glyph in a colour of its own, and your bank's logo in its place once you add one. Tap the tile beside an account in Settings to pick the image
- better: Bank names in the ledger are shown in their account's colour
- better: The Income, Expenses and Transfers filters carry the same marks the + button uses

## 1.2.7 — 2026-08-31
- fix: The monthly average is over the months a category actually ran in, not the length of the report. 500 spent on Investment in one August now reads 500, where dividing it by the eight months of the year had said 62,50. A category that ran in only one month shows no average at all
- better: Category and account are rows of chips you slide and tap, several at once, each carrying the colour its slice has
- better: Clearing every filter is a cross beside the search box rather than a bar underneath the list
- better: The bar chart takes its colours and its highlight from the ring: the chosen pair is lit and lifted rather than sitting on a slab of background
- better: Paid and planned are gone from the report filters. A report already stops at today, so the entries in it have happened
- better: The ranges read 1W, 1M, 12M, then the year itself, then Flex

## 1.2.6 — 2026-08-31
- fix: Reports count only what has happened. 1W, 1M, 1Y and 12M all stop at today, so planned entries dated in the months ahead no longer swell the totals. Flex still honours the dates you type
- fix: The monthly average appears only where there is more than one month to average, and is gone from 1M where it was just the total again
- better: The bar chart is deeper green and red, its columns are tappable, and it carries values up the side
- better: The bar chart says Income and Expense rather than In and Out, and tapping a column shows both figures for it

## 1.2.5 — 2026-08-31
- better: The report ranges are 1W, 1M, 1Y, 12M and Flex on a single row
- new: A bar chart of income against expenses over the last five, above the export buttons. It counts in days for 1W, weeks for 1M and months for 1Y and 12M
- new: Category and account can both be filtered to several at once, not just one
- new: Over 1Y and 12M the categories show what each one costs a month as well as in total
- new: A Clear filters button in Details puts every filter back to showing everything

## 1.2.4 — 2026-08-31
- better: The date range stays put at the top while you scroll, under the app bar, on the dashboard and the entry list alike. It was already pinned, but to the same place as the bar above it, so it slid underneath and out of sight

## 1.2.3 — 2026-08-31
- better: Each dashboard panel now carries its own icon, with the fold arrow on the left
- better: Edit on the Budget panel is a button at the bottom of it rather than a small link in the corner
- fix: Period health shows five periods with this one in the middle, two either side, and scrolls. It used to run three back and two forward, then drop anything before the app's first period — so early on it showed three, none of them centred
- better: Net this period sits in a rounded panel like the rest of the dashboard instead of a full-width band

## 1.2.2 — 2026-08-31
- better: Period health sits in a panel like the rest of the dashboard instead of a bare label on the page, and all four panels now share one title style, one gap and one folded height

## 1.2.1 — 2026-08-31
- new: The dashboard panels fold away. Tap the title of Money in, money out, Budget, Period health or Where the money goes to collapse it, and what you fold stays folded next time

## 1.2.0 — 2026-08-31
- fix: Categories that looked like one colour in the report chart now tell apart. Investment and Groceries — German were all but identical, and a custom category could match a built-in one exactly
- better: Chart colours are deeper, and a category keeps its colour everywhere it appears
- fix: Checkboxes follow the theme instead of arriving as a bright white box on a dark card

## 1.1.47 — 2026-08-30
- better: Keeping a shop as a reusable list is asked inside that shop rather than offered on every row of Recent purchases, and the name only appears once you have ticked to keep it.

## 1.1.46 — 2026-08-30
- new: A past shop can be bookmarked and reused: the bookmark beside a row in Recent purchases keeps it as a list, and saved lists sit at the top of Add items for that store, one tap to put everything back with its quantities.
- fix: The purchase note box and the line explaining what a total does shared an id, so that explanation was written into the box and its own line stayed blank.
- fix: The Earlier backups list had taken the class names Recent purchases was already using, which left the store badge on a saved shop as grey text instead of a coloured pill.

## 1.1.45 — 2026-08-30
- better: Each ledger row names the account it moved through, beside its category.
- fix: Forgot PIN looked dead. It was answering in a toast, and a toast is drawn under the lock screen, so nothing ever arrived. It answers on the lock screen now, and says what to do when no security question was set rather than offering no way out.
- new: A note on a saved purchase, under Paid from, which becomes the ledger entry's note. Correctable afterwards like its total and account.
- new: The Accounts pane totals every account beside its heading.
- better: The untagged-entries line says what they come to and opens to list them, and tapping one opens that entry to set its account.
- new: An account name opens a report of that account over the period the dashboard is showing.

## 1.1.44 — 2026-08-29
- fix: The report's chart was hard-wired to expenses, so it sat empty under a full table whenever you filtered to income, or to transfers seen from an account the money only arrived at. It now draws whichever side the rows have, captioned Where it went or Where it came from.

## 1.1.43 — 2026-08-29
- fix: See these entries came up empty when the slice was transfers seen from one account. It asked for expenses, and a transfer is not one — the chart had counted it as money out of that account, which is a different question.

## 1.1.42 — 2026-08-29
- new: An eye in the Reports header shows or hides the amounts without leaving the report. It flips the same setting the one in the top bar does.

## 1.1.41 — 2026-08-29
- better: The list of earlier backups is grouped by the day it was pushed, with a count per day, and rows carry just the time. Twenty load at a time, with Show older for the rest. Nothing is discarded.

## 1.1.40 — 2026-08-29
- new: Restore an earlier backup, under GitHub sync: every push you have ever made, newest first, each openable to see what it holds before restoring it.
- new: A push that would remove a lot of what the backup holds now says so first, with the numbers, and can be cancelled.

## 1.1.39 — 2026-08-29
- fix: Eight planned occurrences dated to a month that does not exist — 2026-13-01 and the like — are cleared out. A month-arithmetic bug wrote them in August and fixing it stopped new ones without removing the old, since occurrences are only ever added.
- fix: A date that cannot exist can no longer be written at all, and a skip keyed to one is dropped with it.

## 1.1.38 — 2026-08-29
- new: A shop records which account it was paid from. Paid from sits under the purchase date, and the account is saved on the purchase and on the ledger entry it posts.
- better: The account on a saved purchase can be corrected later, like its total, and the linked ledger entry follows.

## 1.1.37 — 2026-08-29
- new: Anything that destroys saved work now asks first, in a dialog that names what is about to go — an entry, a recurring entry, an account, every entry at once, the balances, the app lock, and both directions of sync.
- fix: Clearing the examples, clearing every starting balance and turning off the app lock had no confirmation at all.
- better: A transfer is filed under Bank Transfer instead of having no category, which had left it under the Other fallback.
- new: Choose an account in a report and its transfers count from its side: money leaving it is an expense, money arriving is income. Across all accounts a transfer still counts as neither, and the ledger never counts one either way.
- new: Each report tile says how much of its figure is still only planned, and the spreadsheet carries Settled, Planned and Total as separate rows.

## 1.1.36 — 2026-08-28
- better: Choosing a slice polishes it rather than ringing it: a broad sheen continuing the light already crossing the pie, and a tight highlight over it.
- fix: A narrow slice came back white when chosen, its colour lost under a highlight bigger than the slice. The highlight is sized to the slice now.

## 1.1.35 — 2026-08-28
- better: The pie's slices meet again, with one sheen laid over the whole top face instead of gaps between them.
- better: Choosing a slice lights it up rather than moving it: brighter colour, a glow and a bright rim, with the rest falling back.

## 1.1.34 — 2026-08-28
- better: The report's pie is shaded rather than flat: every face carries a gradient lit from one direction, the colours are stronger, and the slices are rounded and held slightly apart.

## 1.1.33 — 2026-08-28
- better: The report's chart is a pie drawn in projection now, with a wall under each slice, rather than a flat ring.
- new: Tapping a slice slides it out and lifts it, fades the rest back, and shows what it is, what it came to, its share, how many entries and their average — with a way straight into those entries.

## 1.1.32 — 2026-08-28
- new: Reports takes the place of Recurring entries in More: a ring of expenses by category and a filterable table of every line, over a week, month, year, the last twelve months or dates you pick.
- new: A report exports to PDF through the device's own print, and to a real .xlsx where dates are dates and amounts are numbers.
- better: Recurring entries stays where it always was, under Settings.

## 1.1.31 — 2026-08-28
- new: What's new is its own page, opened straight from More, and every line now carries a mark saying what kind of change it was.
- better: The version, build date and update button stay in Settings > About, which no longer doubles as the way in to the notes.

## 1.1.30 — 2026-08-28
- new: Settings has left the top bar. A More tab at the right of the bottom bar opens a short sheet with Recurring entries, What's new and Settings.
- new: A waiting update now shows as a red dot on the More tab, so it stays visible with the gear gone.

## 1.1.29 — 2026-08-28
- better: Reminders now count from 5am rather than 8am, so a payment due today is on the bell before the day starts.
- better: Anything due today or already overdue is marked with a broken heart in a deeper red, separating it from the merely-soon.

## 1.1.28 — 2026-08-27
- fix: A photo of a receipt is lit unevenly, and the old contrast stretch could not cope with that — it left the ink and the paper overlapping, so whole lines went missing. The lighting is now estimated and subtracted before reading.
- fix: A tax row such as 'B 6%  14,52  15,39' is no longer taken for something bought: a real item always carries a word, a table row is only a letter and figures.

## 1.1.27 — 2026-08-27
- better: The home screen name is now Panappai in Latin letters, so iPhone Spotlight and the Safari address bar can find it — Tamil script cannot be typed on an English keyboard.
- better: The Tamil name stays as it was everywhere inside the app.

## 1.1.26 — 2026-08-27
- better: Receipt photos are prepared before reading — greyscaled, enlarged and contrast-stretched — which stops a G being read as a 6 and a decimal comma as a full stop
- fix: Recognition runs in English and German together, so umlauts survive; German alone silently dropped whole lines
- fix: Fixed a scan of Apfel never matching Aepfel on the list, since the two spellings normalised differently
- fix: Payment, change and tax-table lines are filtered out, so a loose crop no longer turns a receipt footer into items
- fix: Fixed the crop buttons, where Read this area was squeezed to a sliver by Cancel
- new: An account in use can now be deleted; its entries are untagged rather than the deletion being refused
- better: Moved the photo button above the paste box, and left cards out of Starting balance since a card carries a debt rather than a balance
- new: Added Bank Transfer as an expense category

## 1.1.25 — 2026-08-27
- better: A receipt photo is now cropped before it is read: drag the box over the item lines and only that part is recognised
- better: Cropping is about a third quicker than reading the whole photo, and keeps the shop address and totals out of the text entirely
- better: The photo button is now Capture or select photo, and offers your gallery as well as the camera

## 1.1.24 — 2026-08-27
- new: Scan receipt can now read a photo, not just pasted text
- better: Text recognition runs on the device via Tesseract.js, fetched once from a CDN and cached offline after; nothing is uploaded anywhere
- better: The recognized text fills the box for you to check before Read receipt, since OCR sometimes misreads a digit or a squashed word
- better: Paste-in text still works exactly as before, as a fallback for a receipt that photographs badly

## 1.1.23 — 2026-08-27
- better: The Expense and Income tabs on a recurring entry match the ones on a normal entry, and carry the same red and green

## 1.1.22 — 2026-08-27
- fix: Hid the scrollbar down the right edge of the page and the panels, which the design never made room for

## 1.1.21 — 2026-08-27
- fix: Fixed tapping the kind an entry already is resetting its category, which the single tab on an edit made easy to do by accident
- better: About says when a newer build is out and offers an Update button that reloads into it, rather than asking you to close and reopen the app

## 1.1.20 — 2026-08-27
- better: Editing an entry shows only the kind it is, rather than offering to turn an expense into a transfer

## 1.1.19 — 2026-08-26
- new: Added back buttons to the sheets opened from inside another one, so returning lands where you left off
- new: Add items opens on a search box pinned above the staples, which filters them as you type
- better: Every shopping staple carries its own drawing rather than reading as a wall of text
- better: An unmatched receipt line can be renamed to re-match, or dragged onto a list item to merge into it
- fix: Two receipt lines landing on one item now add together instead of the last one winning
- better: Indian staples: dropped coconut oil, rajma, poha, rice flour, sambar powder and sona masoori rice
- better: Indian staples: added coffee powder, gingelly oil, groundnut oil, ponni boiled rice, raw banana and mint, with an Oils group

## 1.1.18 — 2026-08-25
- better: Telecom shows signal bars and Loan a coin, instead of the generic tag every custom category used to get
- better: A category you create now takes a drawing guessed from its name, and can carry one at all

## 1.1.17 — 2026-08-25
- better: Retagged the entries on retired categories: Gas, Electricity and ARD Radio stay on Utilities, which is offered again
- better: Internet and the three phone recharges moved to a new Telecom category
- better: McFit and the swimming club moved to Health, the personal loan to a new Loan category, and Kindergeld to a new Benefits
- better: Rent stays as it was

## 1.1.16 — 2026-08-25
- fix: An entry using a retired category now shows it, selected, instead of appearing to have none
- fix: Recurring entries follow the same rule, and no longer offer retired categories when adding a new one

## 1.1.15 — 2026-08-25
- fix: The ledger tabs sit on one row again; the fourth had been pushed onto a line of its own

## 1.1.14 — 2026-08-25
- new: Added Self transfer: your own money moving between your own accounts, absent from every dashboard total and moving only the two balances
- new: Added a Transfers tab to வரவு செலவு
- better: Retired Bank Transfer from the income categories, replaced by Self transfer

## 1.1.13 — 2026-08-25
- better: Starting balances are per account, so each bank and card carries its own opening figure
- better: Settings > Accounts shows what each account holds now, tracked from its opening balance
- better: Deleting all entries and turning off backup ask for your PIN when one is set
- new: Added back buttons to the recurring entries list and editor

## 1.1.12 — 2026-08-25
- fix: The unpushed count is a real comparison against the backup now, not a tally of saves — opening the app no longer looked like a change
- new: An eye button beside Push now lists exactly what would be pushed, added, changed and deleted
- better: Push asks twice, as pull does, since it replaces the backup outright
- fix: Restored the September rent again, overwritten by a single-tap push from a device that had not pulled

## 1.1.11 — 2026-08-25
- fix: Restored the September rent, whose occurrence had been deleted and so suppressed for good
- better: Saving a recurring entry now clears its future skips, so a month deleted by mistake comes back; past ones stand as history

## 1.1.10 — 2026-08-25
- new: Added an Every 28 days cadence, which is how mobile recharges actually run
- better: Set every existing recurring entry to Commerzbank
- better: Entries and recurring entries with no account offer Commerzbank rather than an empty picker
- better: The Push now button carries a count of changes not yet backed up
- better: A reminder appears once twenty changes are unpushed, and every twenty after
- better: The bell shows how many reminders are waiting, not just that some are
- better: Kept the four recurring entries already set to Deutsche Bank, setting only the other fourteen to Commerzbank

## 1.1.9 — 2026-08-25
- better: The amount box on a recurring entry is styled like the one on a normal entry, reading green or red as you type instead of plain white
- better: A recurring entry with no account set offers your first one (Commerzbank) instead of an empty picker; nothing is written until you save

## 1.1.8 — 2026-08-25
- better: Removed the backup button from the top bar; whether anything is unpushed is said in Settings instead
- better: Recurring amounts take the income and expense colours the ledger uses, rather than plain white
- fix: Restored the six accounts and the profile, overwritten again by a device still running the old build
- fix: Restored the profile as well, lost with the accounts to the same overwrite

## 1.1.7 — 2026-08-25
- better: Nothing is ever pushed automatically — push is a button you press, and the app never writes to your repo on its own
- fix: A pull no longer pushes straight back, which is how a pull that dropped accounts erased them from the repo without anyone pressing push
- new: Added a backup button to the top bar, carrying a dot while there are changes you haven't pushed
- fix: Restored the six accounts and the profile again

## 1.1.6 — 2026-08-25
- fix: Fixed a pull wiping your accounts and profile — the pull rebuilt state without them, and the next sync wrote that back
- better: Every backup is now read through one function, so a new field can't be dropped by whichever copy nobody updated
- better: Deleting all entries keeps your accounts and profile, as it already did for budgets and categories
- fix: Restored the six accounts and the profile lost this morning

## 1.1.5 — 2026-08-25
- better: The + is near-clear glass: the tint barely colours it and the blur, rim and specular carry the shape
- better: Thinned the + itself, and drew it in the theme's ink so it stays readable through glass

## 1.1.4 — 2026-08-25
- better: Notifications and appearance share one settings panel, each being a single control
- better: The + button is glossier and sits at 90% opacity
- better: Dropped the arrow on the About panel

## 1.1.3 — 2026-08-25
- better: The + button is glass now, tinted and blurred rather than solid
- better: Recurring entries opens straight from Settings, with no step in between
- new: Recurring entries are editable: tap one to change it, pause it or delete it, and + adds a new one
- better: Editing a recurring entry rewrites only what is still ahead; anything already paid stays put
- better: Removed Repeat from the entry sheet, cadence living on the recurring page now
- new: Added in-app reminders for recurring entries due within three days, under Settings > Notifications & appearance
- better: A bell beside the settings cog carries the reminders, counted from 8am and cleared when opened

## 1.1.2 — 2026-08-24
- better: New app icon: the whole tile is dark distressed leather, with Sansad Bhavan and a euro tooled into it
- new: Added tools/make-icons.py, which draws the icon set from scratch

## 1.1.1 — 2026-08-24
- fix: Fixed every date being a month ahead — a duplicate helper shadowed the original, so today, the current period and new entry dates were all wrong
- better: New app icon: a brown leather wallet with a euro stamped in gold
- better: The Today pill carries a curved arrow, and the + chooser slides up and back down instead of appearing
- better: Renamed Release notes to What's new
- better: Bigger icons on the settings tiles, with About spanning the row in its own shade

## 1.1.0 — 2026-08-24
- better: Moved the tabs to a bar fixed along the bottom of the screen
- better: Add entry is now a round + above the tab bar, offering Income or Expense first
- better: Tapping the title returns to this period's dashboard, and a Today pill appears once you navigate away
- new: Added Settings > Your profile; your first name greets you under the title
- new: Added Settings > Accounts, so an entry can record which account it moved through
- better: Bank Transfer income now records both the sending and the receiving account
- better: Trimmed the category pickers to the ones in use; retired ones still label existing entries
- better: Moved Recurring entries into Settings and removed Leave a note
- better: Settings opens on a grid of tiles, one topic per pane, instead of one long scroll
- better: Replaced every dropdown with a list that shows about four rows and fades the rest
- better: Replaced the browser's date control with the app's own calendar, the same on every device
- better: Bigger category buttons, each with its icon in a tile
- better: New app icon: a wallet with a euro coin
- fix: Folded 16 entries pointing at custom categories lost to the old save bug into Misc
- fix: Fixed the hidden attribute being ignored wherever a class set display

## 1.0.11 — 2026-08-23
- fix: Fixed the starting balance never syncing — it lived outside the backup, so a pull left it behind and In the account now ignored it

## 1.0.10 — 2026-08-23
- fix: Expenses is the ledger again — paid plus planned, with budgets no longer folded in on top
- better: Renamed the budgets card to Budget, and the Buffer category to Misc
- better: Misc now absorbs ad-hoc spending on backups saved before the catch-all existed, instead of counting only entries tagged Misc

## 1.0.9 — 2026-08-23
- fix: Fixed a device that has never pulled being able to overwrite the backup — a fresh browser is full of example entries, which replaced real data
- better: Push now asks twice before replacing a backup this device hasn't reconciled with

## 1.0.8 — 2026-08-23
- better: Froze the first period at 15 Aug 2026; the back arrow stops there
- new: One budget can now be the catch-all, absorbing any spend that isn't a recurring bill and has no budget of its own, while keeping its real category
- better: Unspent budget now counts as expected spending in Expenses and Net this period, so committed money isn't missing from the totals
- better: The catch-all is excluded from that, being a cushion rather than a commitment
- better: Removed the old general Groceries category, now covered by the German and Indian ones
- fix: Fixed custom categories being lost on reload, because load() never read them back

## 1.0.7 — 2026-08-23
- new: Added Settings → Leave a note, which parks thoughts in FEEDBACK.md in the synced repo
- better: Notes are queued locally and only cleared once GitHub has them, so writing one offline never loses it

## 1.0.6 — 2026-08-23
- better: Renamed the Expenses tab to வரவு செலவு
- better: Made the Income and Expenses totals on the dashboard tappable, opening the entries behind them
- new: Added release notes, viewable in the app under Settings → About

## 1.0.5 — 2026-08-23
- better: Removed the tick on each budget bar that looked like a rendering glitch; the card footer now states used-versus-elapsed in words

## 1.0.4 — 2026-08-23
- new: Added custom income and expense categories, created from a chip at the end of the category list
- better: Moved the income/expense chart above the budgets card so the overall picture reads first
- better: Renamed "This period" to "Money in, money out" and "Budgets this period" to "What's left to spend"

## 1.0.3 — 2026-08-22
- better: Removed the Groceries and Misc buffer charts, which budgets already covered
- better: Kept EMI out of budgets, since a fixed amount on a known date belongs in a recurring entry

## 1.0.2 — 2026-08-22
- new: Added budget envelopes: a per-period allowance per category that every expense draws down
- new: Added Groceries — German, Groceries — Indian, Non-Veg, EMI and Buffer categories
- better: A saved shop now posts to the grocery category matching its store

## 1.0.1 — 2026-08-22
- fix: Stopped the version hook from sweeping unstaged edits into a release commit

## 1.0.0 — 2026-08-22
- new: Added Kindergeld to the income categories
- new: Added Settings → About showing the deployed version and whether this device is running it
- better: Started versioning: major on a new month, middle on the first release of a Monday, minor otherwise
- better: Renamed the tabs to Expenses and Shopping cart, and gave each shopping item a quantity box
- better: Showed "In the account now" always, from settled income minus settled expenses
- new: Added Cash Withdrawal, Credit card payment, Investment, To Priya and To India categories
- better: Reported the real reason GitHub sync fails instead of one catch-all message
- fix: Stopped an empty browser from overwriting a good backup, and added "Pull onto this device"
- better: Made saved purchases tappable, with an editable total that posts to the ledger
- better: Simplified the shopping cart: tap-to-add staples, no per-item price, one total bill at the end
- new: Added receipt-text scanning that fills prices and appends unmatched items
- new: Added the shopping cart with German and Indian store checklists
- better: Switched budget periods to run the 15th to the 14th
- new: Added the lock screen banner, a PIN with security-question recovery, and re-locking after 5 minutes idle
- new: Hid amounts behind •••• by default, revealed by the eye button
- fix: Fixed the service worker pinning devices to the first build they ever cached
- better: Made the app installable as a PWA, with correct install steps on iOS
- better: Renamed the app to பணப்பை
