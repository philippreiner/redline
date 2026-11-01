# 7 Alignment and rhythm

A 2px offset is hard to see by eye, so measure it. Run `redline.js` on each region you change: point `window.__axesLayer` at it (the content column, a box, a sheet), never the whole page, where the shell buries the check. Screenshot the overlay and look at it before the checks: each line is an edge three or more things in one column share, a red box is something 1 to 3px off a line, an orange box 4 to 8px off, a purple box a baseline or card inset that breaks with its group, and each numbered badge a check with its fix. Fewer lines look calmer. `view.js` `bands` shows the gaps by role, and `grid` the 8px grid under the shared edges.

## Edges

- Every edge sits on an edge that is already there, across and down.
- Fewer edges look calmer. Remove an edge before adding one.
- Something 1 to 3px off a shared edge is a near-miss: move it onto the edge, never add a third. Something 4 to 8px off is usually a second inset for one job (16 beside 24): pick one.
- Usual causes: two insets for one kind of box (16 beside 24), a button's text inset beside a chip's, a hand-set margin.
- Bad: a box heading at x248, the rows below it at x251. Good: both at x248.
- An edge inside its own visible box or chip is padding, not a miss: an icon 3px inside its tile aligns by the tile. A quiet button or an icon without a visible box is no box: its text or glyph sits on the edge, and the meter measures it there.
- Values sit in fixed columns: dates, amounts, and actions end on one right edge in every row, whatever trails them.
- Text left, numbers and row actions right, almost nothing centered.
- Items side by side share their top and bottom; text side by side in one row shares its baseline.
- A hairline runs the full length of its region. Two lines a few pixels apart, such as a box border on a divider, are one line too many.

## Text styles per region

- A region holds at most three text sizes; a row two sizes and one emphasis. Above five styles in a region, fold the extra greys, weights, and sizes into the ones already there.
- `count.js` `fontSizes`, `fontWeights`, and `textColors` list every value with a sample; fold the one-offs first.

## Spacing scale

- Keep the scale short: about six steps, each with a job, such as 4 inside a part, 8 between parts, 12 from a title to its content, 16 or 24 between groups, 32 or 48 between regions.
- Every gap and padding comes from the scale. A value off the scale is a defect; a new step needs two places that need it.
- The scale sits on a 4px grid: gaps, paddings, and fixed heights are multiples of 4. A 2px step is fine inside a small control, and an odd value that exactly centers something stays. `view.js` `grid` draws the grid under the shared edges; `count.js` `offGrid` lists the values off it.
- Inside a group is at most half the gap between groups, every time.
- `count.js` `gaps` lists the gaps in use; more values than the scale has steps is drift.

## Rhythm

- Boxes of one kind share one inner padding.
- Siblings of one kind share one height: rows in a list, cards in a row.
- Repeated sections repeat their spacing: the same title-to-content gap everywhere.

## Numbers

From `measure.sh` on each region. They show where to look; the overlay shows what to move.

| Number | Target |
| --- | --- |
| `redline.js` `edge`, `baseline`, `inset` checks at 0.5 or more | None; `near` and `far` list every miss with its offset |
| `redline.js` `lines`, `rows` | Fewer than before |
| `view.js` `bands` `rhythm` checks | None |
| `count.js` `distinct.gaps` | No more values than the spacing scale has steps |

- A near-miss can be a coincidence of width: two right-aligned buttons that land a few px apart at one window width. Check a second width before moving anything.
