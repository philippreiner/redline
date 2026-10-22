# 3 Layout and shell

Start with the big picture: good detail cannot fix a wrong frame. Look at the screen the way a loading skeleton shows it, grey boxes only, and decide what goes where.

## Grey boxes

- Run `views.js` with `window.__view = "wireframe"` and screenshot: boxes in their own grey, text as bars, icons as blocks.
- Name the masses. Two or three large shapes in a fixed order look calm; ten small ones look scattered.
- Each mass has one job. A mass without a job goes.
- One container language per screen: an input, a banner, a card, a tile, and a dashed tile in one column are four too many.

## Frames and regions

- Every screen is one of a few frames: list, detail (main column and side panel), settings, editor, panel, dialog. A feature fills the frame's slots and keeps its header, toolbar, and column width.
- One keyline: breadcrumb, title, and content start on one left edge on every page, so the title stays put between pages. The breadcrumb ends with the current page's name. `layout-meter.js` `frame` gives the title's and the crumb's position to compare across screens.
- Anchor content to that keyline. A column centered in a wide window moves away from the edge every other page shares.
- Cap widths: prose at a readable measure, lists and tables wider. Past the cap, the rest of a wide screen stays empty.
- Place the regions before polishing any of them.

## Containers

Pick the container by the task's length, whether the page behind must stay in view, and whether it blocks. The project's rules decide which one it prefers for each job; the [pattern library](pattern-library.md#containers-and-overlays) lists the containers and when to use each.

- One container per job across the product.

## Depth

Depth shows what sits on top of what. Name the levels and give each one treatment, the same on every screen:

| Level | Holds | Treatment |
| --- | --- | --- |
| Ground | The page | The base surface |
| Surface | A set held together | A tonal fill, or nothing |
| Raised | What waits on a person; a tile | A soft shadow or a lighter fill |
| Overlay | Panels, dialogs, menus | A shadow, and a scrim when it blocks |

- Two or three levels on a screen. A box sits one level above its parent, and one box inside another is the deepest a screen goes.

## Separation

Every group is held by space, type, tone, a line, or a box. Use the weakest that works:

1. Space: proximity alone, tighter inside a group than between groups.
2. Type: a heading or a weight change starts a group.
3. Tone: a tonal fill holds a set.
4. Line: a hairline divides fixed regions (bars, table rows, a panel's foot).
5. Box: a border or shadow encloses what is edited or picked as one unit.

- Test it as a Bauhaus designer would: `views.js` `textonly` strips boxes, lines, fills, and icons. Groups that still hold together need no box.
- Then `views.js` `nolines` removes every line and shadow: keep the ones you miss, remove the ones you do not.
- Plain text and a single list stand on the page without a frame.

## White space

- White space is structure: it groups, rests the eye, and gives the lead room. The most important thing gets the most air.
- Generous between regions, tight inside a part; content keeps an inset from its container's edge.
- Leave space empty rather than stretching content across a wide screen.
- Empty space has a shape too: a panel 70% empty under a short form looks unfinished; shorten the container or dock the content.

## Balance

- Weight sits where reading starts (top left in left-to-right languages) and thins toward the edges.
- A heavy element far from what it acts on (a dark button alone in a corner, a big empty card) pulls the eye off the task. Move it beside its subject or lighten it.
- A row whose title ends at the left and whose value starts at the far right has a hole in the middle. Cap the row width or bring the value closer.

## Far view

Run `views.js` with `window.__view = "far"` and screenshot. The blur stands in for the screen seen small from across the room.

- You can name the page.
- One thing leads, and it is the thing the user came for.
- The masses form a few shapes in a fixed order.
- It looks like this product and no other: its signature moves (title style, object marks, status marks) sit where they sit on every screen.
- Neighbor screens share frame, keyline, and title position at this distance too.

## Numbers

| Number | Target |
| --- | --- |
| `layout-meter.js` `boxes` | Fewer than before, or the same |
| `layout-meter.js` `boxNesting` | 1 or less |
| `layout-meter.js` `frame` | The same on neighbor screens at one window size; `crumbOffKeyline` false, `crumbEndsInTitle` true |
