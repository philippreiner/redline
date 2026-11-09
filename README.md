# redline

redline gives coding agents verification for alignment and visual balance, so the UI they build lines up, stays consistent, and has a clear hierarchy.

Agents write UI code without looking at the result, so small layout errors ship. redline works like a visual linter. The agent runs its scripts on the page in the browser and gets a list of what's off. It fixes those and runs the scripts again. The skill also has design rules the agent follows while it builds, such as planning the layout before styling and keeping one thing in focus per screen.

## Install

```sh
npx skills add philippreiner/redline
```

Your agent then uses it for every UI task.

## Example

A four-pane app shell before and after one pass. Pink lines mark edges that three or more items share. A red box marks an item 1 to 3px off a line. An orange box marks one 4 to 8px off.

| Before                                           | After                                          |
| ------------------------------------------------ | ---------------------------------------------- |
| ![The app shell before](docs/example-before.png) | ![The app shell after](docs/example-after.png) |
| Headers at 36, 40, and 44px                      | All headers at 40px                            |
| "+ Event" centered, everything else left-aligned | One "Add action" at the end of the list        |
| Indents, times, and badges 2 to 5px off          | Everything on its line                         |
| Section title as big as the page title           | Section titles one step smaller                |
| "Actions 3" above "No actions due this week"     | Three actions in a list                        |
| Workstreams at the bottom, all grey              | Blocked and at-risk workstreams on top         |

## What's inside

| Path                         | Holds                                                                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/redline/SKILL.md`    | The workflow: measure, plan the layout, fix one region at a time. Modes for new screens, reviews, and reworks                                                                                                                                  |
| `skills/redline/references/` | Nine checklists (structure, foundations, components, layout, hierarchy, detail, alignment, words, polish), a library of common UI patterns, and a guide for clickable HTML mockups                                                             |
| `skills/redline/scripts/`    | `redline.js` checks alignment. `count.js` checks consistency: sizes, colors, shapes, amount of text, and contrast. `view.js` shows the page as a wireframe and with long text and many rows. `measure.sh` runs all three and lists what to fix |
| `bench/`                     | Test pages with known bugs, for checking the scripts after a change. Not installed                                                                                                                                                             |

## Run the scripts

Each script is plain JavaScript, so it runs wherever you can run code in a page: the DevTools console, Playwright, Puppeteer, or agent-browser. It draws an overlay and returns JSON.

`measure.sh` runs all three and saves screenshots. It needs [agent-browser](https://www.npmjs.com/package/agent-browser) and Node, and it uses the page already open in the agent's browser, so you stay signed in. Run it from the skill's folder; the last argument is the CSS selector of the region to measure.

```sh
scripts/measure.sh before main               # measure <main>, list what's off
scripts/measure.sh --try before 1            # apply fix 1 as CSS on the live page, check the result
# change the code
scripts/measure.sh after main
scripts/measure.sh --compare before after    # what moved between the runs
```

In a clickable HTML mockup, add `<script src=".../redline.js"></script>` and the overlay stays on while you click. Alt+R toggles it.

## License

MIT
