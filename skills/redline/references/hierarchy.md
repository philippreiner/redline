# 5 Hierarchy and proximity

## Rank by level

- At each level (screen, region, part) name the first, second, and third thing. A dialog, a card, and a row each have their own order.
- The first wins the squint test, the second is found right after, the third is there when looked for. Anything below third moves down or goes.
- Rank by what the user came to do, not by what the data holds.

## One thing leads

- Quiet the neighbors before making the lead louder. Emphasis climbs from the cheapest means: position (first, top left, alone), then size, weight, ink, color, and last a mark or a box.
- Each region has one focal point; a screen has at most two large elements (a title, a key figure) and three ink levels. A row of like figures counts as one. `count.js` `large` lists the competitors.
- A new element takes the place of one or moves behind a click (a menu, the detail, a hover card). Adding comes after quieting, moving, and cutting.
- A section title sits a clear step below the page title, never level with it.
- A setup card the screen needs before it can work may lead until it is done.
- `view.js` `lead`: in the blur, leader A is the thing the user came for, and decoration (dashed) leads nothing.
- `view.js` `notext`: with the text erased, the structure still shows what leads and what groups.

## Text volume

Too much text is the miss users name most, and no alignment repairs it. Settle it before spacing and type.

- A row carries one lead, one value, and one mark; a second line only where it tells rows apart. A card or section head carries its title and no helper sentence.
- Previews, explanations, and metadata move to the detail or a hover card, or go. A label the layout already says ("Status:", "Owner:") goes.
- `count.js` `volume` lists rows over two lines or two text styles, helper sentences, and eyebrows, and `text.volume` the words per region.

## Groups

- What belongs together sits together, tighter inside than between.
- A fact true for a whole list sits once above it, ideally inside the control that changes it.
- Headings name what is there ("Connected"), not what you can do ("Add a new connection").

## Act where you look

- A control sits beside the fact it changes.
- A follow-up sits right under the choice that opens it.
- A choice that decides which fields apply comes before those fields.
- The next step is where the eye lands after the last one. Trace the eye through the main task: it moves down and on, never back up or across the screen.
- The row's own click opens it. An action people take on many rows (record, assign, mute) stays on the row, quiet, where they used it before; rare actions go in the row's menu.

## Show by level

- Each level shows what it needs: a list row shows what tells rows apart and decides the click; the detail shows the rest.
- A list is slimmer than its detail, a summary slimmer than its list. Metadata (created, updated, IDs) lives in the detail unless it sorts or decides.
- Detail folds away: progressive disclosure over walls of text.
- A rare explanation lives in a hover card on an info icon beside its term, at most one per region; a title needs none.

## Move down, cut

- Rank content by how often the user needs it. Rare settings, developer tools, and metadata move into a menu, a detail view, or the end.
- Cut a section that only says there is nothing ("No files yet", "Nothing needs you"). Keep one setup card where the screen needs a connection first, and one empty state where the screen's main content is empty. `count.js` `text.nothing` lists the candidates.
- A count and the content under it agree: "Actions 3" above "No actions due" is a defect. The pane header and the page title never repeat each other.
- Cut a second way to do the same thing on one screen: a header button, a dashed tile, and a banner that all add.
- Cut decoration that carries no meaning.

## Numbers

| Number | Target |
| --- | --- |
| `view.js` `lead`, leader A | The thing the user came for |
| `count.js` `volume`, `large` checks at 0.5 or more | None |
| `count.js` `text.nothing` | Empty, besides one empty state or setup card |
| `count.js` `text.repeats` | No label repeated down a list where one action would do |
