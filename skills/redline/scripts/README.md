# Scripts

Plain browser JavaScript, no dependencies. Each file is one expression that returns a JSON string. Paths below are relative to this skill's folder.

The counts point at candidates, and you decide from the screenshot. Each lens file's Numbers section names the counts it uses and their targets.

## Run

`scripts/measure.sh <url-or-file> <out-dir> [region]` runs every script on a page or region and saves each result as JSON and a screenshot, in a session of its own. `scripts/measure.sh --compare <before-dir> <after-dir>` prints every number that changed. It needs agent-browser and node; `WIDTH` and `HEIGHT` set the window (1440x900).

One script at a time:

- agent-browser: `agent-browser eval "$(cat scripts/layout-meter.js)"`
- Playwright: `await page.evaluate(fs.readFileSync("scripts/layout-meter.js", "utf8"))`
- DevTools: paste the file into the console.

Set an option in the same call, before the script: `agent-browser eval "window.__view = 'far'; $(cat scripts/views.js)"`.

## Layer

`layout-meter.js`, `heatmap.js`, `text.js`, `inventory.js`, and `stress.js` read one layer: `window.__axesLayer` (an element or a selector), else the last open dialog or sheet, else `main`, else the body. `views.js` covers the whole page unless `window.__axesLayer` is set.

- Measure a sheet: open it; the scripts find it.
- Measure a region or a mock: `window.__axesLayer = ".my-stage"`. Point the scripts at the region you are fixing; on the whole page the shell's lines and values bury the finding.
- Reset: `window.__axesLayer = undefined`.

## layout-meter.js

Measures the part of the layer in view; scroll to measure the rest. Draws an overlay; screenshot it, then `window.__axesClear()`.

| Overlay | Means |
| --- | --- |
| Magenta line | A left edge |
| Dashed pink line | A right edge |
| Dashed blue line | Top or bottom of a box or control |
| Cyan line | A hairline rule |
| Red band | A near-miss: neighbor edges 1 to 4px apart |
| Violet band | A doubled line: two lines 1 to 3px apart |
| Orange outline | Siblings of one kind with unequal heights |

Fields: `frame`, `leftAxes`, `rightAxes`, `leftAxesPx`, `nearMissX`, `nearMissPx`, `nearMissY`, `nearMissBaseline`, `doubledLines`, `horizontalEdges`, `unequalSiblings`, `horizontalRules`, `verticalRules`, `boxes`, `boxNesting`, `insets`, `chips`, `textStyles`, `styles`, `words`, `mutedSample`, `layer`, `width`. Targets: [alignment.md](../references/alignment.md#numbers).

`frame` holds the page title's text, its position inside the layer, and its size, plus `crumb`: where the breadcrumb's first segment starts and what its last one says, and the flags `crumbOffKeyline` and `crumbEndsInTitle`. Run the meter at the top of neighbor screens at one window size: the values match when the frames match. A frame with its own nav, such as settings, differs on purpose.

`insets` lists how far each box's first left edge sits inside it, with counts.

What counts as an edge: a text start or end, an icon without a visible box around it, and a box or control. Text and icons inside a painted box up to 40px tall (a filled button, a chip, a tile) count by that box. A quiet button paints nothing, so its text and icon are its edges; text flush with its padding counts as left-aligned. A small group pushed to the right end of its row (actions, a trailing value) counts by its right edge only. Chips and icon tiles up to 40px are containers, not boxes, and a box filling the layer is its frame.

`nearMissBaseline` counts rows where text of a similar size sits 1.5 to 4px off its neighbor's baseline; the baseline comes from each font's ascent, so nothing on the page changes.

## heatmap.js

Groups the rows, boxes, controls, and headings in view by kind and paints each kind in its own color, lettered. Rows are list items, or an element repeated in its parent; a control's kind is its role and variant (filled, tinted, outline, quiet). Screenshot it, then `window.__heatClear()`.

| Overlay | Means |
| --- | --- |
| Tint and letter | One kind; the letter matches `groups` |
| Red outline | A near-miss: the member differs from its kind by up to 4px of height or padding, 3px of radius, 2px of text size, one weight step, or a close shade |
| Dashed red box | A row of controls whose heights differ by 1 to 8px, or with two filled buttons |

A clear difference within a kind counts as a deliberate variant: `groups` lists it with its looks, unmarked. A selected or current member differs on purpose and is never marked. Inside a row or a table, a cell's position is part of its kind, so the second cell of every row is one kind.

| Field | Lists |
| --- | --- |
| `counts` | `kinds`, `nearMisses`, `mixedRows` |
| `groups` | Each kind with its member count and, when they differ, its looks |
| `nearMisses` | Each near-miss with what differs, such as `padding 20/16/16/16 vs 16/16/16/16` |
| `rows` | Each mixed row of controls with why |

## views.js

`window.__view` picks the view; screenshot after it runs, then `window.__viewClear()`. `far`, `textonly`, and `nolines` restyle the page itself, so the layout stays exact; `wireframe` and `notext` draw an overlay.

| View | Shows | Asks |
| --- | --- | --- |
| `far` (default) | Grayscale and blur; `window.__farBlur` sets the pixels | Can you name the page and point at what leads? |
| `wireframe` | Boxes in their own grey, text as bars, images and icons as blocks | Do layout and balance hold without content? |
| `notext` | Text erased, boxes and icons kept | Is the structure clear? |
| `textonly` | Boxes, lines, fills, and icons stripped; text stays in place | Do the groups still hold together with space and type alone? |
| `nolines` | Borders, dividers, and shadows stripped; fills stay; `lines` counts what it stripped | Which lines and shadows does the screen miss? |

## stress.js

Changes the layer in place and counts what breaks, before and after. Screenshot it, run the meter and `text.js` on the result, then `window.__stressClear()`.

| `window.__stress` | Does |
| --- | --- |
| `long` (default) | Every text grows by 80%, a single word as one long compound; small counts grow to thousands; dates and times keep their shape |
| `many` | Every list repeats its rows up to `window.__stressRows` (50); a list is a list element or three or more children of one shape, while navigation, tabs, and toolbars keep their items |

`before` and `after` each hold `truncated` (text cut by an ellipsis or a line clamp), `clipped` (text cut by a box that hides its overflow), and `overlaps` (visible text running into other visible text, or across the edge of a filled or outlined box it does not live in; text under a sheet, outside its clipping box, or fully inside a highlight does not count). The layer's own edge is not a clip.

## text.js

The layer's text in DOM order with a role per run: heading, label, button, link, icon, input, value, helper, text. No overlay.

| Field | Lists |
| --- | --- |
| `counts` | `words`, `helpers`, `repeats`, `eyebrows`, `restated`, `nothing`, `truncated`, `actions` |
| `lines` | Role, font size (`b` for bold), and text, top to bottom |
| `words`, `roles` | Word count and runs per role |
| `repeats` | Strings that appear more than once (values excluded) |
| `valueFormats` | Value shapes with digits as 9 and words as a |
| `eyebrows` | Short small text right above a larger heading |
| `restated` | Neighbor runs where one starts with the other |
| `nothing` | Lines outside rows that say there is nothing, and dash placeholders |
| `truncated` | Text cut by an ellipsis or a line clamp |
| `loudest` | The five largest runs by size and weight |
| `actions` | One entry per button or short link, by its accessible name, with its count |

## inventory.js

Every style value in the whole layer, scrolled out of view included. Use `window.__axesLayer = document.body` for the page with its shell. No overlay.

| Field | Lists |
| --- | --- |
| `fontFamilies`, `fontSizes`, `fontWeights`, `textColors` | Values on text |
| `backgrounds`, `radii`, `lines`, `shadows`, `gaps` | Values on boxes and layouts; a line is a border weight and color |
| `icons` | Rendered size and stroke width, or `fill` |
| `buttons`, `controls` | One entry per variant: role, height, fill, ink, edge, radius, type |
| `distinct`, `oneOffs` | Values per list, and values used at most twice; with tokens, a value on a token is no one-off |
| `tokens`, `offToken`, `offTokenValues` | Custom properties found, and the text colors, backgrounds, font sizes, and radii that match none of them (`null` when the page has no tokens) |
| `offGrid` | Gaps off a 4px grid |
| `lowContrast`, `lowContrastCount` | Text below WCAG AA against the fills behind it |
| `unnamed`, `unnamedCount` | Buttons, links, and controls without an accessible name |
| `smallTargets`, `smallTargetCount` | Targets under 24px, without a label that widens them, that sit closer than 24px to another target |

Each list entry is `[value, count, sample]`; the sample is the first element's text.

## Regression set

[`bench/`](../bench/README.md) holds three fixtures with known defects and the signals the scripts give on them. Rerun it after changing a script.
