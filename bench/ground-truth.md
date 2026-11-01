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
