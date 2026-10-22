# 5 Detail

Break each part with worst-case data before polishing it, then design every state and every response.

## Text length

- Try the shortest, the typical, and the longest real value, and the longest translation (German and Finnish run 30 to 40% longer than English).
- Titles wrap to two lines, then clamp. A key value (an address, an amount, an ID, a name in a chip) is never cut: it wraps or opens.
- Where text must truncate, the full value stays reachable: a tooltip, an expansion, the detail view.
- `text.js` `truncated` lists text cut by an ellipsis or a line clamp; each entry is cut on purpose or a defect.
- `stress.js` `long` grows every text by 80% and small counts to thousands, in place; `many` repeats each list's rows up to 50. Run both on each changed screen and compare what breaks before and after.
- Numbers in columns: tabular figures, right-aligned, one unit and precision down the column.
- One date format across the product, the year only when it differs. `text.js` `valueFormats` shows each shape; two date shapes in one list are a defect.

## Density

- Size for the mature account: three items and three hundred both work. A long list gets search, grouping, or paging.
- One line per row by default; a second line only when it tells rows apart. A row carries one primary text, one chip, one icon at most.
- One row height per list.

## Variance with intent

- Every difference means something. Two greys, two paddings, or two radii for one job are accidents: fold them.
- Make one thing differ on purpose to make it stand out, the isolation effect: one per region, with everything around it uniform so the difference shows.
- A second line, a new size, or a new grey under a value is one more variant. Fold it into the value, show it as an icon with a tooltip, or drop it.

## Part states

- Each interactive part shows hover, focus, pressed, disabled, selected, and loading, from the library's states.
- A disabled control says what enables it, or it is hidden.
- Selected looks the same everywhere in the product. Loading keeps the part's size.

## Screen states

- Design every state of each changed surface: loading, empty, one item, many, long content, partial, error, no permission, stale.
- Loading draws the real layout: skeletons of the real shape and count. Nothing jumps when data arrives or between pages.
- Empty: one title, one line, one action. A screen that needs setup first shows one setup card.
- Check zero data: each changed screen in an account with no data at all, as a first-time user meets it. It shows one next step, not a stack of empty sections.
- A state change keeps in place whatever the user is looking at.

## Speed and motion

- Every input answers within 100ms: a pressed state, an optimistic update for a reversible write, or a progress mark.
- A loader appears only after about 300ms, as the skeleton; a spinner that flashes looks broken.
- A refresh keeps the old content in place and updates only the part that changed.
- Tiny animations explain a change: something opens, moves, arrives, or leaves. 100 to 300ms, ease-out, none on first render, reduced motion respected. The user can act during any animation.

## Feedback and errors

- Every action ends in a visible result where it happened: the row updates, "Saved" appears beside the field, a removal leaves a toast with Undo.
- Friction grows with how hard an action is to undo: Undo for anything reversible, a confirmation that names exactly what goes for the rest. When two designs tie, pick the reversible one.
- Look away after an action and back: you can tell whether it worked.
- An error says what happened, what still holds, and how to recover, in place. Retry only where retrying can work.
- Validate when a field is left or the form is sent; the error sits under its field and replaces the helper.
- Drafts and input survive navigation, reload, and failure.

## Browser behavior

- Navigation uses real links: Cmd-click opens a new tab, the address can be copied.
- The URL holds the view (tab, filter, sort, open record); reload and Back restore it, scroll included.
- Esc closes the top layer only. On open, focus lands on the title or the first field; on close, it returns to the trigger.
- Text a user may want to copy is selectable.

## Access

- Every control has an accessible name; an icon-only button gets a label. `inventory.js` `unnamed` lists the ones without.
- The keyboard reaches everything the pointer does, in reading order, and focus is always visible.
- Hit targets are at least 24px, 44px on touch. `inventory.js` `smallTargets` lists the candidates.
- Nothing clips at the narrowest supported width or at 200% zoom.
- Meaning rides on more than color or motion.

## Numbers

| Number | Target |
| --- | --- |
| `stress.js` `after.clipped`, `after.overlaps`, under `long` and `many` | 0 |
| `stress.js` `after.truncated`, `text.js` `counts.truncated` | Only text cut on purpose, with the full value reachable |
| `text.js` `valueFormats` | One shape per kind of value |
| `inventory.js` `unnamedCount`, `smallTargetCount` | 0 |
