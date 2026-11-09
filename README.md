# redline

redline is a visual linter for coding agents. With it, an agent makes UI screens that are aligned, balanced, and consistent.

The skill has two parts:

- Scripts that measure a page in the browser. They show each defect on the page and give the fix.
- Design rules. The agent uses them when it makes or changes a screen.

## Install

```sh
npx skills add philippreiner/redline
```

The agent uses the skill when you tell it to make or change a screen.

## Example

This is an app shell before and after one pass with redline. A pink line shows an edge that three or more items share. A red or orange box shows an item that is 1 to 8 px off a line.

| Before | After |
| --- | --- |
| ![The app shell before](docs/example-before.png) | ![The app shell after](docs/example-after.png) |
| The pane headers have three heights: 36, 40, and 44 px. | All pane headers are 40 px. |
| "+ Event" is centered. The items around it are aligned left. | "Add action" is at the end of the list. |
| Indents, times, and badges are 2 to 5 px off their lines. | All items are on their lines. |
| "Wave 2 readiness" is as large as the page title. | Section titles are smaller than the page title. |
| "Actions 3" is above "No actions due this week". | The three actions show as a list. |
| The workstreams are at the bottom, all in grey. | The workstreams are at the top. Blocked and at-risk workstreams are first. |

## What's inside

| Path | Holds |
| --- | --- |
| `skills/redline/SKILL.md` | The steps for the agent: measure the screen, plan the layout, then fix one region at a time. Modes for new screens, reviews, and rework. |
| `skills/redline/references/` | Nine checklists (structure, foundations, components, layout, hierarchy, detail, alignment, words, polish), a library of UI patterns, and instructions for click dummies. |
| `skills/redline/scripts/` | `redline.js` measures alignment. `count.js` measures consistency: font sizes, colors, shapes, quantity of text, hierarchy, and contrast. `view.js` shows the page as a wireframe and tests it with long text and many rows. `measure.sh` runs all three scripts and lists the fixes. |
| `bench/` | Test pages with known defects. Use them to test the scripts after a change. The install does not include them. |

## Run the scripts

Each script is plain JavaScript. You can run it in the DevTools console, Playwright, Puppeteer, or agent-browser. The script shows an overlay on the page and returns JSON.

`measure.sh` runs all three scripts and saves screenshots. It needs [agent-browser](https://www.npmjs.com/package/agent-browser) and Node. It measures the page that is open in the browser of the agent, so the session stays signed in.

```sh
scripts/measure.sh before main               # list the defects, save screenshots
scripts/measure.sh --try before 1            # test fix 1 in the browser
# change the code
scripts/measure.sh after main
scripts/measure.sh --compare before after    # compare the two runs
```

In a click dummy, add `<script src=".../redline.js"></script>`. Then the lines stay on the page. Alt+R shows and hides them.

## License

MIT
