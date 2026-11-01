# Click dummy

Use this when the user asks for a click dummy, a mockup, a wireframe, or a configurator. A click dummy is a thinking tool: rough, clickable HTML that shows a flow before any product code.

## 1 Wireframe first

Recommended when the layout is open: draw the screens in greyscale (grey boxes, text as bars, real content order, no color, icons, or styling) and let the user pick the layout before parts get styled. Skip it when the layout is settled.

## 2 Parts

- Break the design into its parts before you style a screen: the row, the card, the form, the picker, the empty state.
- Put them on one parts page in every state they need (empty, one, many, long, error), with realistic content.
- Mark each part as existing, changed, or new, and settle the parts with the user before you compose screens.

## 3 Tell the story

- Compose screens from the settled parts in the order the user meets them: where they come from, the main task, the result, where they go next.
- Each direction tells the same story through the same steps, so the directions compare step by step.
- Augment each screen with short numbered notes beside it: what the user sees, and why it is built that way, in plain words. For a rework, put the old screenshot above the new screen.
- Make it clickable where the story needs it: links and buttons switch screens and states. Fake everything else.

## Configurator

A configurator is one dummy with a switch per part or per region, so the user can combine options in the browser.

- Each switch holds options that differ on one axis from SKILL.md's Explore list (structure, order, density, emphasis, type, words, pattern), and one option is the known pattern played straight.
- Hand-pick the options; a generator that emits every combination buries the choice.
- Every option keeps the settled decisions. A defect the user flagged is fixed in every option, not in one.

## Polish

- Include `scripts/redline.js` with a script tag and live mode so the overlay toggles in the dummy (see the scripts README), and run the other scripts with `window.__axesLayer` on one mock.
- A dummy that rebuilds a screenshot to measure it matches the source to the pixel first; a 1px rebuild error can move a near-miss from one redline tier to the other.
- Fix what they find on the parts page first, so every screen inherits the fix.

## Keep the HTML small

- One HTML file per story and one shared CSS file that copies the product's tokens. Plain HTML and CSS, a few lines of JavaScript for state, no framework or build.
- Screens reuse the classes of the parts page instead of styling themselves.
- Real words and realistic data, in the product's vocabulary. Save the settled decisions beside it.
- Optional, for a dummy that runs over many rounds: evolve the one file in place. A rebuild from scratch first lists what the old file had and what the new one drops.
- Save it where the project keeps scratch work, outside the product code, and give the user a clickable absolute link.

## Into the product

The dummy is a draft, not the spec. Once the user picks, build the real screen from the decision and the library, held to every lens. Optional, for a large dummy: list every element and state it shows, check each one off in the product, and show the dummy and the product side by side at one window size before handover.
