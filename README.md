# redline

A visual linter for coding agents.

Agents write UI code without ever looking at the result. Things end up 3px off. Buttons come in three different heights, and a section title ends up as big as the page title. redline gives your agent scripts that measure the page in a browser and mark what's off. It also brings design rules, so more of the screen comes out right the first time.

## Install

```sh
npx skills add philippreiner/redline
```

Next time you ask your agent to build or tweak a screen, it picks up the skill.

## Example

A four-pane app shell before and after one pass with redline. Pink lines show edges that things share. A red or orange box means something sits a few pixels off one.

| Before | After |
| --- | --- |
| ![The app shell before](docs/example-before.png) | ![The app shell after](docs/example-after.png) |
| Pane headers at 36, 40, and 44px | Every header 40px |
| "+ Event" centered, everything around it left-aligned | One "Add action" at the end of the list |
| Indents, times, and badges 2 to 5px off | Everything on its line |
| "Wave 2 readiness" as big as the page title | Section titles a step below the page title |
| "Actions 3" above "No actions due this week" | The three actions, as a list |
| Workstreams last, all in the same grey | Workstreams first, blocked and at risk on top |

## What's inside

| Path | Holds |
| --- | --- |
| `skills/redline/SKILL.md` | What the agent does, step by step: measure the screen, sketch the layout, then fix one region at a time. Also covers new screens, reviews, and reworks |
| `skills/redline/references/` | Nine checklists (structure, foundations, components, layout, hierarchy, detail, alignment, words, polish), a library of common UI patterns, and a guide to click dummies |
| `skills/redline/scripts/` | `redline.js` checks alignment. `count.js` checks consistency: font sizes, colors, shapes, how much text, what stands out, contrast. `view.js` shows the page as a wireframe and stress-tests it with long text and many rows. `measure.sh` runs all three and lists what to fix |
| `bench/` | Test pages with known bugs, for when you change the scripts. Not installed with the skill |

## Run the scripts

Each script is plain JavaScript. Paste it into the DevTools console, or run it from Playwright, Puppeteer, or agent-browser. It draws its overlay on the page and returns JSON.

`measure.sh` runs all three for you and saves screenshots. It needs [agent-browser](https://www.npmjs.com/package/agent-browser) and Node, and it measures whatever page is open in the agent's browser, so you stay signed in:

```sh
scripts/measure.sh before main      # list what's off, save screenshots
scripts/measure.sh --try before 1   # try fix 1 in the browser first
# edit the code
scripts/measure.sh after main
scripts/measure.sh --compare before after
```

Building a click dummy? Add `<script src=".../redline.js"></script>` and the lines stay on while you click around. Alt+R hides them.

## License

MIT
