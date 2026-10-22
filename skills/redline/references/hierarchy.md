# 4 Hierarchy and proximity

## Rank by level

- At each level (screen, region, part) name the first, second, and third thing. A dialog, a card, and a row each have their own order.
- The first wins the squint test, the second is found right after, the third is there when looked for. Anything below third moves down or goes.
- Rank by what the user came to do, not by what the data holds.

## One thing leads

- Quiet the neighbors before making the lead louder; add size or color last.
- A setup card the screen needs before it can work may lead until it is done.
- `text.js` `loudest`: the top entry is the thing the user came for.
- `views.js` `notext`: with the text erased, the structure still shows what leads and what groups.

## Groups

- What belongs together sits together, tighter inside than between.
- A fact true for a whole list sits once above it, ideally inside the control that changes it.
- Headings name what is there ("Connected"), not what you can do ("Add a new connection").

## Act where you look

- A control sits beside the fact it changes.
- A follow-up sits right under the choice that opens it.
- A choice that decides which fields apply comes before those fields.
- The next step is where the eye lands after the last one. Trace the eye through the main task: it moves down and on, never back up or across the screen.
- A repeated action becomes the row's own click. In-row actions stay quiet; hover fills the row and adds no new control.

## Show by level

- Each level shows what it needs: a list row shows what tells rows apart and decides the click; the detail shows the rest.
- A list is slimmer than its detail, a summary slimmer than its list. Metadata (created, updated, IDs) lives in the detail unless it sorts or decides.
- Detail folds away: progressive disclosure over walls of text.
- A rare explanation lives in a hover card on an info icon beside its term, at most one per region; a title needs none.

## Move down, cut

- Rank content by how often the user needs it. Rare settings, developer tools, and metadata move into a menu, a detail view, or the end.
- Cut a section that only says there is nothing ("No files yet", "Nothing needs you"). Keep one setup card where the screen needs a connection first, and one empty state where the screen's main content is empty. `text.js` `nothing` lists the candidates.
- Cut a second way to do the same thing on one screen: a header button, a dashed tile, and a banner that all add. `text.js` `actions` lists every action label.
- Cut decoration that carries no meaning.

## Numbers

| Number | Target |
| --- | --- |
| `text.js` `loudest`, first entry | The thing the user came for |
| `text.js` `counts.nothing` | 0, besides one empty state or setup card |
| `text.js` `counts.actions` | Fewer than before; no two labels for one action |
