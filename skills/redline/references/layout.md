# 4 Layout and shell

Start with the big picture: good detail cannot fix a wrong frame. This lens is the layout gate: look at the screen the way a loading skeleton shows it, grey boxes only, and decide what goes where before any part gets styled.

## Skeleton

The skeleton is the screen written down before anything is styled: six lines, then the greyscale wireframe drawn from them. Every later part fills a slot it names; a part with no slot is an addition to argue for.

- Frame: the frame from the list below and the screen in this product that already uses it.
- Regions: each mass in reading order, with its job and width (fixed, a share, or the rest).
- Bands: the rows across the screen (header, toolbar, content, foot) with heights every pane shares.
- Keylines: every x where things start, from the left, each named by the regions that use it. Few.
- Axis: start-aligned or centered, per region ([alignment.md](alignment.md#axis)).
- Lead: per region the first, second, and third thing; for the screen, the one thing that leads.

```
Frame: detail, list beside a sheet, like Programs
Regions: rail 240 | list 360 | detail, the rest, content capped at 880
Bands: header 48 in all three panes; detail foot 56 for the composer
Keylines: 24 rail, 264 list, 624 detail title and content
Axis: all start-aligned; the list's empty state centered
Lead: the detail title, then the health line, then the next due commitment
```

## Grey boxes

- For a new layout, draw the skeleton as a greyscale wireframe first. For an existing screen, run `view.js` with `window.__view = "wireframe"` and screenshot: boxes in their own grey, text as bars, icons as blocks.
- Name the masses. Two or three large shapes in a fixed order look calm; ten small ones look scattered.
- Each mass has one job. A mass without a job goes.
- One container language per screen: an input, a banner, a card, a tile, and a dashed tile in one column are four too many.

## Frames and regions

- Every screen is one of a few frames: list, detail (main column and side panel), settings, editor, panel, dialog. A feature fills the frame's slots and keeps its header, toolbar, and column width.
- One keyline: breadcrumb, title, and content start on one left edge on every page, so the title stays put between pages. The breadcrumb ends with the current page's name.
- Anchor content to that keyline. A column centered in a wide window moves away from the edge every other page shares.
- Cap widths: prose at a readable measure, lists and tables wider. Past the cap, the rest of a wide screen stays empty.
- Place the regions before polishing any of them.

## Placement

Where a thing goes is settled before how it looks; users look where the tools they know put it.

- A bar has three zones: leading for navigation and the title, the middle for the few common actions, trailing for search, More, and the one primary action. At most three clusters per bar.
- The answer the user came for sits in the top half of the first screen, on the content's left edge, distinguishing words first.
- A pane keeps its actions in one zone, its header's trailing side: search there and "Add" in the body splits them. One add per section, and it creates the section's own object; an add for another object (an event in an actions list) lives with that object.
- A screen-wide action sits in the header's trailing zone; an action on one thing sits beside it ([hierarchy.md](hierarchy.md#act-where-you-look)).
- What the user needs stays out of the bottom of a sidebar or long panel; account and settings may live there.
- A thing with no edge, region, or subject beside it has no place yet: give it one or cut it.

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

- Test it as a Bauhaus designer would: `view.js` `textonly` strips boxes, lines, fills, and icons. Groups that still hold together need no box.
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
- Chrome recedes so content leads: the rail and bars sit quieter than the content, with lighter ink, fewer and smaller icons, untinted surfaces, and few separators.
- Balance can be asymmetric: a dense pane balances a wide quiet one. Fill a light side with a few small things on its lines, never one big block.
- Columns side by side end together: card pairs share their height, and neighbor panes their foot line.

## Far view

Run `view.js` with `window.__view = "lead"` and screenshot. The grey blur stands in for the screen seen small from across the room; the three heaviest things are lettered, decoration dashed.

- You can name the page.
- One thing leads, and it is the thing the user came for.
- The masses form a few shapes in a fixed order.
- It looks like this product and no other: its signature moves (title style, object marks, status marks) sit where they sit on every screen.
- Neighbor screens share frame, keyline, and title position at this distance too.

## Numbers

| Number | Target |
| --- | --- |
| `redline.js` `lines` on the page | Fewer than before, or the same |
| Boxes inside boxes | One box inside another at most |
| Title and keyline | The same position on neighbor screens at one window size |
