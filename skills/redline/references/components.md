# 2 Components and objects

One part per job, composed from primitives, used as it is, everywhere.

## Reuse

- Name the jobs the screen does and take the library part for each.
- Reuse before building; a variant of an existing part before a new part. A new part goes into the library with its states, never into the feature.
- Use a part as it is: pass content and layout, and leave its look to the library.
- Same job, same part across the product. Two pickers, two empty states, or two section headers for one job are drift: fold them into one.
- In a diff, look for hand-built twins: a heading, picker, box, row, or empty state the library already has. Search the code for a repeated class string: two hits for one concept mean a missing part.
- `inventory.js` `buttons` and `controls`: one row per variant. Two variants that differ by one value are one variant built twice.

## Composable parts

Build parts the way shadcn/ui builds on Radix: small, open, composed.

- Behavior (focus, keyboard, ARIA, dismissal) comes from one tested primitive, look from the tokens; the part joins them.
- Compose instead of configuring: a card is a frame with header, body, and foot slots that take children, not one component with fifteen props.
- Variants sit on a few named axes (size, tone, emphasis) and serve every screen alike.
- Each part keeps one anatomy (container, lead, label, content, trailing, actions) in every use.
- Build at the lowest level that owns the job: a toolbar is buttons in a row, not a new kind of button.
- A part is done when it holds the shortest and the longest content and shows every state ([detail.md](detail.md#part-states)).

## The expected pattern

Use the pattern an expert in the field expects: users bring habits from the tools they already use. The pattern follows the shape of the answer: how many options, how long their words, whether the choice applies at once. The [pattern library](pattern-library.md) lists the common patterns and when to use each.

- Use a new pattern only for a job the familiar ones cannot do.

## Objects wear one look

- Each object type (a person, a file, a project, a ticket) has one icon, one color, and one chip, wherever it appears: lists, pickers, chips, search, headers.
- Pick an icon that names the object; a generic dot or square tells the user nothing. Two object types never share an icon.
- Keep the map of object to icon and color in one place, usually the library, and extend it there.
- A state renders one way (chip, dot, or text) in every list, from one status vocabulary. A state mark shows only on the exception; the normal state shows nothing.
- Each action keeps one word, one icon, and one shortcut everywhere.
- A value is not a state: durations, counts, and dates are plain text, never chips.

## Parts in a region

Parts in one region (a toolbar, a form row, a card's foot) look like one set:

- One primary action per region; the rest secondary, quiet, or in a menu.
- One style per role: every secondary button in the region looks the same.
- One height for controls side by side; their text and icons share the center line.
- One radius and one line weight across the region; gaps from one step of the spacing scale.
- `heatmap.js` paints each kind of element in its own color, outlines in red a member a few pixels or a shade off its kind, and boxes a row of controls with mixed heights or two filled buttons.

## Inner balance

- Icon and label are sized together and centered on the text's visual middle, not its line box.
- Padding is equal on matching sides; horizontal padding is at least the vertical. An icon-only button is square.
- Center by eye, not by numbers: a leading icon, a triangle, or a round shape shifts until it looks centered.
- One lead inside the part: the label or the value is strong, not both.
- At its longest value, content still keeps the part's padding.

## Numbers

| Number | Target |
| --- | --- |
| `heatmap.js` `counts.nearMisses` | 0 |
| `heatmap.js` `counts.mixedRows` | 0 |
| `inventory.js` `distinct.buttons`, `distinct.controls` | The library's variants, no more |
