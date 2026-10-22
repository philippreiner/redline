# Click dummy

Use this only when the user asks for a click dummy or a mockup. A click dummy is a thinking tool: rough, clickable HTML that shows a flow before any product code.

## 1 Parts first

- Break the design into its parts before you draw a screen: the row, the card, the form, the picker, the empty state.
- Put them on one parts page in every state they need (empty, one, many, long, error), with realistic content.
- Mark each part as existing, changed, or new, and settle the parts with the user before you compose screens.

## 2 Tell the story

- Compose screens from the settled parts in the order the user meets them: where they come from, the main task, the result, where they go next.
- Each direction (safe to bold) tells the same story through the same steps, so the directions compare step by step.
- Augment each screen with short numbered notes beside it: what the user sees, and why it is built that way. For a rework, put the old screenshot above the new screen.
- Make it clickable where the story needs it: links and buttons switch screens and states. Fake everything else.

## 3 Polish

- Run the lenses and the scripts on the dummy as on a real screen; `window.__axesLayer` points them at one mock.
- A dummy that rebuilds a screenshot to measure it matches the source to the pixel first; a 1px rebuild error can move a near-miss past the meter's limit.
- Fix what they find on the parts page first, so every screen inherits the fix.

## Keep the HTML small

- One HTML file per story and one shared CSS file that copies the product's tokens. Plain HTML and CSS, a few lines of JavaScript for state, no framework or build.
- Screens reuse the classes of the parts page instead of styling themselves.
- Real words and realistic data, in the product's vocabulary.
- Save it where the project keeps scratch work, outside the product code.
- The dummy is a draft, not the spec. Once the user picks, build the real screen from the decision and the library, held to every lens.
