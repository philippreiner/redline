# Ground truth

Known defects per fixture, as people named them. Read this only after a run's findings are written.

## sources-before.html

A Sources overview before its redesign.

- Four container styles in one column.
- Insets of 16 and 24 that miss each other by 2 to 4px.
- Three ways to add a source.
- Four bordered Assign buttons that outweigh the titles.

## meetings-before.html

A Meetings list before its redesign.

- A centered column off the crumb's edge.
- A crumb that ends in "Sources" on the Meetings page.
- Three date formats.
- Durations dressed as status chips.
- A recorder icon on every row.

## meeting-rail.html

The details rail of a meeting.

- "Assigned automatically" under the Program value: one more line and one more grey for a single fact, where an icon or nothing would do.

## sources-after.html

sources-before with its alignment fixed, for the before and after images: one 16px inset in every card, and text after an icon on one edge in the search field, the banner, and the rows. The other three defects stay.

## seeded.html

A portfolio review page (three KPI tiles, a projects table, a follow-ups card) with eight seeded defects, region `main`. Measured 2026-11-01 with `measure.sh --all`: before that day's script round, 1, 5, 6, 7 reached the printed list, 8 scored 0.45, 2 scored 0.4, and 3 and 4 produced no check; after it, all eight print.

| # | Where | What is wrong | By how much |
| --- | --- | --- | --- |
| 1 | `dl.tile.b` "Overdue actions 4" | Left content inset differs from the two sibling tiles | 19px vs 16px, +3 |
| 2 | `section.two > h2` "Follow-ups" | Heading start right of the card's content edge shared by the card above | +2px |
| 3 | `section.one td.num.off` "480 k" | Right edge of a right-aligned number inside its column | 3px left of the column's other cells |
| 4 | `dl.tile.c > dd` "+3.2 %" | Value text size differs from the two sibling tiles | 22px vs 24px |
| 5 | `main > p.sub` "Week 44, 12 projects, 3 need attention" | Text under WCAG AA on #f6f7f9 | 2.44:1, needs 4.5:1 |
| 6 | `section.two > p.muted` "Last synced 2 minutes ago" | Text under WCAG AA on #ffffff | 1.97:1, needs 4.5:1 |
| 7 | `div.actions > button.primary` "Send review" | Control taller than the two beside it | 34px vs 32px |
| 8 | `section.one td` "Blocked", and `td.num` "Nov 21" | Status as plain text among chips; a second date format in a column of `dd.mm.yyyy` | 1 of 4 cells; 1 of 4 cells |

Not a defect, kept as a false-positive case: `main > section.two` is a full-width card with three lines of content, the same width as `section.one` above it. `view.js` `bands` once scored it `dead-zone` 0.9 with the fix `width: fit-content`, which would pull its right edge off the column, and `measure.sh --try` passed that fix. Now `bands` stays quiet on it, and `--try` fails a fix that takes a shared edge or width from its holder.

## shell.html

A four-pane app shell rebuilt from a critique screenshot (a rail with a nested nav tree and badges, a chat list, a detail pane, a files pane), region `.app`, with seeded defects. The redline signals are `redline.json` checks at score 0.5 or more; the count.js rows are seeded for count.js and listed for its owner.

| # | Where | What is wrong | By how much | Signal |
| --- | --- | --- | --- | --- |
| 1 | `section.list > header.head`, `section.detail > header.head` | Pane header bands at 36 and 44px where the rail and files headers are 40px: hairlines and centre lines miss | -4, +4 | `band`, one check x2, `height: 40px` on both |
| 2 | `div.stack > button.event` "+ Event" | Centred in a column whose other blocks start on its left edge | centre on the column's | `axis`, `align-self: flex-start` |
| 3 | `a.late time` "Mon", `a.pinned time` "Fri" | Trailing times off the right edge the other chat rows share | -3, -5 | `edge` (axis end) each |
| 4 | `a.inbox > span.badge` "4", `a.wms > span.badge` "7" | Nav badges off the right edge of the compose button, the other badges, and the section actions | -2, -4 | `edge` (axis end) each |
| 5 | `div.kids.fin` under S/4HANA Finance | Children indent 20px where the other three groups indent 16px | +4 | `indent`, one check x3, `padding-left: 16px` |
| 6 | `a.reports` "Reports" | Top-level item outdented | -4 | `indent`, `padding-left: 8px` |
| 7 | `section.files > div.fbody` | Content inset 12px where the other panes use 16px | -4 | `inset`, `padding-inline: 16px` |
| 8 | `section.detail > header.head` | Pill "New chat" beside 6px-radius "Goal" and "Active" | 999px vs 6px | count.js (`shape`) |
| 9 | `section.files button.x` | Icon-only button 28x24 beside 28x28 | 4px | count.js |
| 10 | `div.chats > a.chat` | Rows carry a title plus two lines of preview | 3 lines | count.js |
| 11 | `div.body h1`, `div.body h2`, `div.figure b` | Three large elements: two 28px titles and a 40px figure | 3 | count.js |

Not defects: the selected rows (`a.row.on`, `a.chat.on`) and the active tab are painted states, not boxes; the section "+" glyphs end on the badges' edge.

## sidebar.html

A clean Linear-like sidebar and top bar, region `.app`: traffic-light row, workspace row with search and compose, Inbox and My actions with badges, three sections with headers on the icon column, two teams with nested items one 24px step deep (each child's icon on its parent's label, the third level's text on its parent's label), and a main pane whose top bar is as tall as the sidebar's. Expected: no `redline.js` check at 0.5 or more. Before the 2026-11-09 round, `edge` scored the selected row's highlight 0.6 twice (its box 8px outside the icon and badge edges).

## controls.html

Aldermoor Logistics, Cloud Transformation. Region `#seeded`; the clean twin `#clean` has no check at 0.5 or more.

| # | Where | What is wrong | By how much |
| --- | --- | --- | --- |
| 1 | `div.toolbar > button.pill` "New workstream" | Pill beside rounded-rect buttons and a rounded-rect input | r999 vs r6 |
| 2 | `div.toolbar > button.short` "More actions" | Icon-only button not square | 28x24 |
| 3 | `form.add > select` "Workstream" | Square select between rounded inputs | r0 vs r6 |
| 4 | `div.foot > button.sq` "Share" | Square button beside rounded "Open plan" | r0 vs r6 |
| 5 | `span.meta > span.round` "WMS cutover" | Capsule tag beside rounded tags | r10 on 20px vs r4 |
| 6 | "Open plan" icon | Icon box not square (inventory note) | 16x14 |
| 7 | `ul > li.update` | Rows carry a title, a two-line explanatory sentence, and meta | 4 lines, 3 styles |
| 8 | `section.kpi > p.help`, `span.eyebrow` | Helper sentence under the card title; eyebrow above it | 14 words; 1 eyebrow |
| 9 | `section#seeded` | Four leads in view: heading, row of 28px figures, solid Add, solid Open plan | 4, at most 2 wanted |

## hierarchy.html

Aldermoor Logistics, Cloud Transformation. Region `#seeded`; the clean twin `#clean` has no check at 0.5 or more.

| # | Where | What is wrong |
| --- | --- | --- |
| 1 | `h2.wave` "Wave 2 readiness" | 28px, as large as the h1; its siblings are 18px |
| 2 | `div.figure > b` "68 %" | Ties the h1 at 28px |
| 3 | `section#seeded` | Three leads in view, two at 28px |
| 4 | `section.detail` | Five text sizes |
| 5 | `div.bar > button` "Add files" | Alone atop the body while the header holds Search and Close |
| 6 | "Add an action" and "+ Event" | Two creation controls in one section |
| 7 | "Actions 3" | No items, and "No actions due this week" |
| 8 | "Open questions 2" | Followed by "No open questions" |
| 9 | Header "Cloud Transformation" | Repeats the h1 |
