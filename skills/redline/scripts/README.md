# Scripts

Three plain browser scripts, no dependencies, plus `measure.sh`. Each script is one expression that returns a JSON string and draws an overlay. Each file's header comment holds its full rules. Paths are relative to this skill's folder; prettier formats the scripts with this folder's `.prettierrc.json`.

Run one script:

- agent-browser: `agent-browser eval "$(cat scripts/redline.js)"`
- Playwright: `await page.evaluate(fs.readFileSync("scripts/redline.js", "utf8"))`
- DevTools: paste the file into the console.

Set options in the same call, before the script: `agent-browser eval "window.__view = 'bands'; $(cat scripts/view.js)"`.

**Layer.** Every script reads one layer: `window.__axesLayer` (an element or a selector, first visible match), else the last open dialog or sheet, else the first visible `main`, else the body, with a `warning` in the JSON. Point it at the region you are fixing; on a whole page the shell buries the check. Reset with `window.__axesLayer = undefined`.

**Scene.** All three scripts share one block that reads the layer the way a designer does: columns (boxes side by side), containers (painted boxes: a fill, a full border, or a shadow), and data (charts, waveforms, bar runs and what sits over them, avatars and avatar stacks), which counts as one thing and is never measured inside.

## Findings

Each script returns `checks`, ranked by `score`, and numbers them on its overlay in the same order:

| Field | Holds |
| --- | --- |
| `kind` | `edge`, `baseline`, `inset` (redline); `contrast`, `sibling`, `control`, `crowding` (count); `rhythm`, `dead-zone`, `collision`, `break` (view bands) |
| `where` | The element that holds the value, by a handle you can search the code for: an id, `data-slot`, `data-testid`, or its rarest class that is not a utility class, else through the nearest ancestor with one (`ul[data-slot="list"] h2`) |
| `text` | Its visible text, or `image 320×180`, `box 120×80` |
| `against` | What it is off from, with that element and value |
| `off` | The mover minus the reference: px for geometry, the value's difference otherwise |
| `fix` | One edit: property, value, element |
| `apply` | The same edit as data, `[{selector, property, value}]`, for `measure.sh --try`; empty when the fix needs more than CSS |
| `count` | How many places this one check stands for |
| `score` | 0 to 1. At 0.5 or more a designer would fix it; under 0.5 is a note |

Every check is a deviation from its own group: an edge most of a column shares, a gap most siblings use, a value most of one kind use. A value that is merely off a scale is no check.

## redline.js

Do things sit on shared lines? It measures the part of the layer in view.

| Overlay | Means |
| --- | --- |
| Pink guide down, a small light count at one end | Three or more starts share this x in one column, or a card, tile, divider, or image edge runs here |
| Dashed pink guide | Shared right edges |
| Pink guide across | Shared tops or bottoms of boxes and edges |
| Red box, `+2` | A start or a box's right edge 1 to 3px off a guide |
| Orange box, `+8` | The same, 4 to 8px off (up to 12px inside a card) |
| Dashed purple guide across | A style line: where one text style (size, weight, color) of a row of cards sits, drawn on its baseline when something leaves it |
| Purple box | A baseline or inset miss; a box without a badge is a text the check names as pushed |
| Number badge | A check, same number as in the JSON, placed where it covers no text |

Guides are scoped: a start compares with starts in its own column and container, and the contents of sibling cards compare with each other. Right edges count for boxes (cards, inputs, buttons, tables, dividers, images) and right-aligned text, never for ragged text. A card whose content inset, left or right, disagrees with its column's other cards is one `inset` check. A table is its outer edges plus, per column, the edge its cells align on (the right edge for right-aligned numbers); a cell 1 to 8px off it is an `edge` check. A miss on both sides is one check with the symmetric edit (`padding-inline`), so a half edit leaves a check behind.

Down the page it measures as it does across: a card's first text below its top edge and its last content above its bottom edge, against cards of one kind (`inset`, `padding-block` when a taller header control centres the title lower); a label and its value in a `dl` or any list of side-by-side pairs on one line (`baseline`); in a row of three or more cards, each text style on one line, where a text that wraps and pushes the ones below it is one check naming what it pushes (`baseline`); and card tops, bottoms, and heading baselines in neighbouring columns that miss each other by 1 to 12px (`edge`, axis y; a larger difference is a layout choice). A check whose only fix would zero a control's padding, give it a negative margin, or change a font size is dropped.

**Live.** `window.__redlineLive = true` before the script, or `<script src=".../redline.js"></script>` in a click dummy, keeps it redrawing on DOM changes, scroll, and resize. **Alt+R** hides and shows it. `window.__redlineClear()` removes the overlay and its listeners.

JSON: `lines`, `rows` (guides drawn down and across), `near` and `far` (`[{text, where, off, axis}]`, 1 to 3px and 4 to 8px), `checks`.

## count.js

Is the screen crowded or inconsistent? A floating panel lists the checks by number, and outlines on the page match; it places itself where it covers the least. `window.__countClear()` removes it.

| Kind | Fires on |
| --- | --- |
| `contrast` | Text under WCAG AA against its painted background, one check per text color, every holder named; always 0.5 or more |
| `sibling` | One of three or more siblings of one kind (tag and class) styled differently: fill, border, padding, first text. Also a few cells unlike the rest of their column, in a table or four or more repeated rows: a link among plain text, a chip among bare text, a value in another format ("Nov 21" among "14.11.2026", no `apply`). In a row of three or more like cards, a text whose size, weight, or color differs from its row-mates', with their values as the `apply`. Hue alone is designed (status chips, a red overdue date) |
| `control` | Controls in one group whose heights differ by 1 to 4px |
| `crowding` | One action label on four or more buttons in a column; a note under 0.5 |

JSON besides `checks`: the inventory of the whole layer, scrolled out of view too (`fontSizes`, `fontWeights`, `lineHeights`, `textColors`, `backgrounds`, `radii`, `lines`, `shadows`, `gaps`, `icons`, `buttons`, `controls`, each `[value, count, sample]`), `distinct` and `oneOffs` per list, `tokens` and `offTokenValues`, `unnamed` and `smallTargets`, `slop` (the tells of [slop.md](../references/slop.md) a script can see, each `[tell, count, sample]`), `offGrid` (paddings and gaps off the 4px grid), `nestedRadius` (inner radii larger than their box's radius minus the inset), `words`, `rows` and `cards`, and `text` (`nothing`, `valueFormats`, `repeats`).

## view.js

`window.__view` picks the view; screenshot, then `window.__viewClear()`.

| View | Shows | Asks |
| --- | --- | --- |
| `bands` | Gaps tinted by role and gutters, per column: section between the column's top-level blocks, row between repeated siblings, inner inside a card, above and below headings | Does space group, and does the rhythm hold down and across? Checks: `rhythm`, `dead-zone` (a box with 120px or more empty on one side, only when it breaks with its siblings), `collision`, and `break` (text cut without an ellipsis, a short value or a column's odd one cut with one, an ID wrapped inside itself, a label struck by a line, chart labels included) |
| `lead` | The layer blurred grey, its three heaviest things lettered; decoration dashed | Does the heading or primary action lead? No checks |
| `grid` | An 8px grid from the layer's corner; down, each column's or card's edges and the edges shared inside it drawn heavier (right edges only for boxes that span their column); across, in orange, card tops and bottoms and header baselines shared along a row of columns, broken where a card misses the line (`rows` in the JSON) | What lines up, down and across? No checks |
| `wireframe` | Boxes in their own grey, text as bars, icons as blocks, checked boxes filled | Do layout and balance hold without content? |
| `notext` | Text erased; fills, boxes, and icons kept | Is the structure clear? |
| `textonly` | Boxes, lines, fills, and icons stripped; text and control outlines in place | Do the groups hold with space and type alone? |
| `long` | Text about 80% longer the way German runs (compounds and extra words; dates, times, and amounts keep their shape); plain counts in thousands | Does it hold in a longer language? |
| `many` | The first visible list's rows repeated to `window.__stressRows` (50), its other children (a divider, a label) kept in place | Does it hold for a mature account? |

`long` and `many` change the layer in place and return `before` and `after` (`clipped`: cut by a box hiding its overflow; `overlaps`: running into other text or across a box edge) and `broke`, the new breaks with where they are. An ellipsis or a line clamp is designed and not counted.

## measure.sh

```sh
scripts/measure.sh [--all] [--url <url-or-file>] <out-dir> [region-selector]
scripts/measure.sh --try <out-dir> <n> [fix.css]
scripts/measure.sh --compare <before-dir> <after-dir>
```

It measures the page already open in agent-browser's session (`AGENT_BROWSER_SESSION`, else the default), so a signed-in app stays signed in. `--url` opens a page first; a local file works. The page stays open for `--try`; `agent-browser close` ends the session. The window is `WIDTH` x `HEIGHT` (1440x900). It finishes the page's entry animations first, so every image shows the page at rest.

A run saves `page.png`, then `redline`, `count`, and `view-bands` as png and json, and `min-checks.json`: every check in one list, those at score 0.5 or more first, ranked by score and family (layout, then composition, then alignment, then tokens). It prints the minimum checks: the ones at score 0.5 or more, numbered by their place in `min-checks.json` (checks with the same edit print as one line), with `--all` the stress breaks, and last a line that sends you to the images:

```
Minimum checks: 1 layout, 2 alignment; fix layout before parts.
1. baseline (redline #1, 0.95) dl.kpis dt "Mean time between failures": off 17 from dl.kpis dt "Downtime, 30 days" and the row's other dt texts in section.card > dl.kpis take 1 line; "296 h" and "last 12 months" leave their row's lines at y 274 and 293. Set min-height to 2lh on section.card > dl.kpis dt; …
2. break (view-bands #1, 0.7) div.low > b "93": off 1 from div.plot > div.target, a line 722×1 at y 387. …
Stress: long 7 new breaks (td > span.progress clipped, tr > th.num clipped, div.low > b overlaps text, …); many 0 new breaks.
Now look at out/redline.png and out/view-bands.png yourself, region by region at 2x: these checks are the floor, the images show what no check names.
```

The checks are the floor of a review, not the review: an empty list means the scripts found nothing they measure, and the images still need your eyes.

`--all` adds the views lead, grid, wireframe, notext, and textonly and the stress views long and many.

`--try <out-dir> <n> [fix.css]` tries check `n`'s fix on the page the checks came from (it reopens that page when the session shows another, or opens and closes it when none is open): its `apply`, or the CSS you mean to put in the code, written to a file and applied as written, `@media` rules included. The printed `apply` names the check's elements (its holders); a fix may change only those. It compares the page before and after at `WIDTH` and `WIDTH` - 160 (1280, where a `nowrap` that fits at 1440 cuts) and prints FAIL with the reason when:

- the check is still there at any score, as after a half edit (`padding-left` where the right side is off too), or a new check reaches 0.5;
- the CSS matches elements other than the holders, their contents, and their ancestors (`table.tbl td a` recoloring every link for four), a pseudo-element counting as its element;
- any computed style of any element of the region, its ancestors, or their pseudo-elements (`::before`, `::after`, `::first-line`, `::first-letter`, `::placeholder`, `::marker`) changes beyond what the fix may change: the printed properties and layout properties (padding, margin, gap, alignment, flex, grid placement, min and max sizes, display, wrapping) on the holders, the printed properties inside them, and layout properties on their ancestors. So small caps, `scaleX`, `filter`, `mix-blend-mode`, a transform, a covering `::after`, or a hidden placeholder fail;
- a box outside the holders moves more than the holders grow or shrink, plus 2px, a box docked to its parent's bottom or right edge comes off it, or a holder loses an outer edge it shared with a sibling (`width: fit-content` on one of three full-width cards);
- a text that showed whole is cut, clipped (`overflow`, `contain`, `clip-path`, `mask`), covered, pushed out of its card, or run into other text, or now sits in a box that hides overflow.

Otherwise it prints CLEAN: the check is gone and nothing else measured changed. That is no proof the fix is good; look at it. A check under 0.5 prints NOTE, since the tools do not vouch for it, and a check without `apply` (its fix needs markup) is refused. It pauses animations and stops the page's timers, so reload the page after. Then make the edit in the code and run `measure.sh` again, and look at its images.

What it cannot see: the code (`!important` hides a specificity problem), meaning (links restyled to plain text, meta text in title ink), other states (hover, focus, dark, other data; `--all` covers long and many), widths other than the two, and a printed `apply` that is itself too broad, which the scripts guard by matching exactly the check's elements.

`--compare` prints what moved between two runs: checks gone, new, or rescored, distinct values and one-offs per inventory list, word count, and near and far misses.

## Regression set

The redline repo's [`bench/`](https://github.com/philippreiner/redline/tree/main/bench) holds fixtures with known defects, the signals the scripts give on them, and the `--try` cases. Rerun it after changing a script.
