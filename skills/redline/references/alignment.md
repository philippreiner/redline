# 6 Alignment and rhythm

A 2px offset is hard to see by eye, so measure it. Run `layout-meter.js` on each region you change: point `window.__axesLayer` at it (the content column, a box, a sheet), never the whole page, where the shell's lines bury the finding. Screenshot the overlay and look at it before the numbers: every magenta line is an edge, and fewer lines look calmer.

## Edges

- Every edge sits on an edge that is already there, across and down.
- Fewer edges look calmer. Remove an edge before adding one.
- Two neighbor edges 1 to 4px apart are a near-miss: move one onto the other, never add a third.
- Usual causes: two insets for one kind of box (16 beside 24), a button's text inset beside a chip's, a hand-set margin.
- Bad: a box heading at x248, the rows below it at x251. Good: both at x248.
- An edge inside its own visible box or chip is padding, not a miss: an icon 3px inside its tile aligns by the tile. A quiet button or an icon without a visible box is no box: its text or glyph sits on the edge, and the meter measures it there.
- Values sit in fixed columns: dates, amounts, and actions end on one right edge in every row, whatever trails them.
- Text left, numbers and row actions right, almost nothing centered.
- Items side by side share their top and bottom; text side by side in one row shares its baseline.
- A hairline runs the full length of its region. Two lines a few pixels apart, such as a box border on a divider, are one line too many; the meter marks them as violet bands.

## Spacing scale

- Keep the scale short: about six steps, each with a job, such as 4 inside a part, 8 between parts, 12 from a title to its content, 16 or 24 between groups, 32 or 48 between regions.
- Every gap and padding comes from the scale. A value off the scale is a defect; a new step needs two places that need it.
- Inside a group is at most half the gap between groups, every time.
- `inventory.js` `gaps` lists the gaps in use; more values than the scale has steps is drift.

## Rhythm

- Boxes of one kind share one inner padding.
- Siblings of one kind share one height: rows in a list, cards in a row.
- Repeated sections repeat their spacing: the same title-to-content gap everywhere.

## Numbers

From `layout-meter.js` on each region. The numbers are guidance: they show where to look, and the overlay shows what to move. The meter catches misses of 2 to 4px; a 1px miss shows only on a zoomed screenshot.

| Number | Target |
| --- | --- |
| `nearMissX`, `nearMissY`, `nearMissBaseline` | 0 |
| `unequalSiblings` | 0 |
| `doubledLines` | 0 |
| `leftAxes` | Fewer than before; look again above 10 in a panel, 20 on a page |
| `textStyles` | Look again above 8 in a panel, 12 on a page |
| `insets` | One value per kind of box |
| `inventory.js` `distinct.gaps` | No more values than the spacing scale has steps |
| `inventory.js` `offGrid` | None: every gap on the 4px grid |

- `nearMissPx` gives each miss as a pair of x positions inside the layer; find them on the overlay's red bands.
- A near-miss can be a coincidence of width: two right-aligned buttons that land 4px apart at one window width. Check a second width before moving anything.
