# 1 Structure

The information architecture: which places exist, what each holds, how they nest, and how people move between them. Settle it in the layout gate, before the frame: a clean screen in the wrong place still fails.

## Objects and places

- List the objects people work with (a project, a ticket, a meeting) and the places that hold them. Name both in the user's words.
- Every object has one home: its page or its sheet. Everywhere else it shows as a link or a chip to that home, never as a second editable copy.
- A place answers one question. Two questions are two places, or one place with two tabs.
- Nest the way people think about their work, not the way the data is stored: workspace, then the project, then its items. Three levels deep is plenty; the breadcrumb shows the path.

## Expose or nest

Depth follows frequency:

- Daily: on the page, visible without a click.
- Weekly: one click away: a tab, a folded section, the row's menu.
- Rare: settings, the ⋯ menu, the detail.
- An action people take on many items stays on the item; nesting it to tidy the screen costs a click every time.
- Show a summary where the user decides and the full content one level down; a summary never hides a problem the user must act on.

## Pick the container

The [pattern library](pattern-library.md) lists each pattern; choose by the job:

- Tabs: two to five parallel views of one thing, each with its own URL. Not for steps, and not for unrelated things.
- A list: many items of one kind, with sort, filter, and search where it can grow.
- Sections on one page: content read together, in one order.
- A sheet or side panel: work on one item while the list stays in view.
- A page: sustained work on one item, or a place worth linking to.
- A dialog: only to confirm or to block.

## Links and routing

- Every place, view, tab, filter, and open item has a URL; reload and Back return the user to where they were.
- A link goes to the object's home. Its label predicts what is behind it (information scent): the name of the place or the object, never "Click here" or "More".
- Cross-link where the next question goes: from a finding to its source, from an item to its parent and its related items.
- Navigation names places, not actions. The current place is always marked.

## Similar things, similar places

- The same kind of object takes the same form (chip, row, card) and the same position on every page: the status always top right, the owner always in the same column.
- The same kind of page has the same frame and the same sections in the same order.
- Group what people compare; sort by the question the place answers (due first, newest first, worst first).
- A new place looks like its nearest sibling and differs only where its job differs.

## Check

- Walk three tasks the user does most, from where they start: count the clicks, and at each step say why the label leads there. A step that needs knowledge the screen does not give is a structure fix.
- Find each object's home from two other places in one click.
- Draw the places as a tree, one line per place with its URL; a place without a parent or with two parents is a finding.

## Numbers

| Number | Target |
| --- | --- |
| Clicks to each of the three main tasks | Fewer than before; two or less for a daily task |
| Homes per object | One |
| Nesting depth | Three levels or less |
| Tabs on one page | Two to five, each with a URL |
