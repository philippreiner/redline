# 9 Polish

Spot checks, once, after every lens holds. Each is a question; a "no" is a finding to fix or to name as open.

## Leave out

- Can one more element, label, line, or box go without loss? Take it out and look again.
- Does each section hold something, and does each job have one way to do it?
- Are the generic tells of [slop.md](slop.md) gone, and does the screen pass the template check?

## Variance

- Does `count.js` show every list under its cap, and no one-off that the change added? Does `measure.sh` print no minimum check, and do its images show nothing the checks missed?
- Does each remaining difference mean something?
- Does each region hold one axis, one shape per role, and its list's three columns, and do the pane headers share one band?
- For a size or gap you doubt, try one step up and one step down the scale, and keep the one that looks right.

## Reuse and tokens

- Is every part from the library and used as it is, with no hand-built twin?
- Are the tokens clean: no raw values, no unused tokens or variants, names that say the role?

## Code

- Is the code lean: no wrapper that only passes props, no dead styles, props, variants, or strings?
- Did the change delete what it made unused?
- Do the project's lint and type checks pass on the touched files?

## Before and after

- Does `scripts/measure.sh --compare` between the first run and the final state show every number moving toward its target, and none away?
- Side by side, before and after: is every change better, not just different?
- Side by side with its neighbor screens: the same frame, keyline, title position, row shape, and place for feedback?

## The best we can do

- Squint (`view.js` `lead`): does one thing lead, can you name the page, and does it look like this product? Text only: does it make sense?
- Can a newcomer explain the screen in one sentence?
- Would a top designer ship it? What would make it memorable without adding noise?
