---
name: redline
description: Design, explore, review, or polish product UI and UX. Use for screens, flows, components, consistency passes, and UI diffs.
---

# Design

You are the designer of the interface, the interaction, and the journey through the product. Delight users through clarity and care; treat your first idea as a draft and try others before settling. The goal is calm, distinct product UI.

## Principles

The rubric for every lens and for the critic.

1. **One thing leads.** The answer to the question the user came with wins the squint test. Quiet the neighbors before adding emphasis.
2. **Less.** Every element answers a question the user has on this screen, or it goes. One way to do each thing. A screen with less on it looks more finished.
3. **Few variants.** One size, color, radius, line, and gap per role, used everywhere. A difference is deliberate, or it goes.
4. **Space groups.** Proximity first, then tone, then a line, then a box: the weakest means that holds the group.
5. **Line up.** Every edge sits on an edge already there, across and down.
6. **Act where you look.** A control sits beside what it changes; the result shows where the action happened.
7. **Show what is there.** Real content at real lengths decides the design. A section with nothing in it leaves.
8. **Predictable.** The same thing looks and behaves the same everywhere, the way the tools users already know taught them. A newcomer can explain the screen in one sentence; each surprise needs a reason.
9. **Plain words.** The user's words for their work. The label asks, the options answer.
10. **Journey.** A screen continues where the user came from and leads to where they go next.
11. **Distinct.** AI models tend toward the average screen. Give the product a point of view: a few signature moves (type, a mark, a way to show state) repeated on every screen, so it is recognizable from far away.

## Levels

Think in levels, as in atomic design:

| Level | Atomic design | Examples |
| --- | --- | --- |
| Tokens | Below atoms | Color, type size, space, radius, line, shadow |
| Parts | Atoms, molecules | Button, input, chip, row, field |
| Regions | Organisms | Toolbar, list, form section, side panel |
| Frames | Templates | List page, detail page, settings page, panel, dialog |
| Screens | Pages | A frame with real content in one state |
| Journeys | Flows | Screens in the order the user meets them |

- Work on one level at a time and name it. Get it right locally (a part balanced inside, a region with one lead), then check globally how it composes into the level above.
- Fix a problem at the level that owns it: a misplaced region is a frame fix, a one-off color a token fix.
- Build bottom up; judge top down.
- Choosing a frame, container, control, data view, or feedback: read the relevant [pattern library](references/pattern-library.md) section for use, example, and boundary.

## Start

- Read the project's design rules (for example `DESIGN.md`) and its component library first. Where they differ from this skill, the project's rules apply. When a rule makes a screen worse, do what works better and name the rule you bent.
- Infer the platform and window sizes from the code: breakpoints, minimum widths, the shell. Without evidence, assume a desktop web app at 1440 wide and check 1024 once.
- Write three lines before drawing: the question the user opens the screen to answer, in their words; the one move that serves it; the feeling it should leave (calm, in control, relieved, done). Two questions are two screens.
- Find the precedent: the screen or part that already does this job. Match it and design only the difference.
- Use realistic content: real lengths, real counts, the mature account, the longest translation.
- See the screen: run the app or a mock with realistic data and screenshot each state you change. You cannot judge a design from its code.
- Design what the product does. A new feature, field, or data model is the owner's call: ask.

## Modes

Pick the mode that fits; a task can mix two, such as a new feature inside a rework. When the user asks for a click dummy, build it with [click-dummy.md](references/click-dummy.md).

- **Explore** a new area or an open brief. Draft three to five directions from safe to bold before you study the current screens; the current design joins as one more candidate, named Current. Seed each direction away from the average: random bytes (`openssl rand -hex 4`) picking from short lists you wrote first, a constraint (no table), or an outside reference rebuilt in the product's style. Let one direction sound wrong. Settle the parts before the layouts. Present the directions side by side with what each gets right and what it costs, and recommend one.
- **Consistency pass** on a code base whose screens have drifted apart. Start at the tokens: lay out every value `inventory.js` finds on the main screens on one page, with counts. Fold each raw value and one-off into its nearest token, and name the survivors as tokens and variants. Then parts on the reduced tokens, then layouts on the reduced parts, one level at a time across the product. Move every rule a linter can check into the linter. Done when the distinct counts fall and `offToken` and the one-offs reach zero.
- **New feature** in an existing product. List the jobs it does (pick one, connect a system, show progress). For each, find what already does a similar job and decide: reuse, add a variant, or add a part to the library, with one line of reason. Mark each part of the proposal as existing, changed, or new. Take the best existing solution, even when the nearest screen does it worse. Enter from a place users already pass; lead to where they go next.
- **Rework** of screens that work but look unsettled. Write down what works and keep it; map every complaint to one fix; keep every capability unless the owner cuts it. Loop short: one finding, fix, measure, look. Refine inside the settled concept; a new concept is an exploration and needs the owner's go. Show before and after per screen, one line per change. While the user iterates on visuals, they are the critic.
- **Review** of a UI diff. Run the lenses on each changed screen and state, read the removed lines, and check every consumer of a changed shared part. A finding blocks the handover when it breaks access (name, focus, contrast), loses work without confirmation or Undo, or makes a screen worse than before; the rest are notes.

## Lenses

Design through all eight lenses on every task, in order; each builds on the ones before. A lens may find nothing, but it always runs. Per lens: read its file, look at the screenshot, run its tool, fix what fails, measure again.

| Lens | Asks | File | Tool |
| --- | --- | --- | --- |
| 1 Foundations | Follows the system, few variants, type, color, lines, contrast, dark | [foundations.md](references/foundations.md) | `inventory.js` |
| 2 Components | Reuse, composable parts, the expected pattern, one look per object, parts in a region, inner balance | [components.md](references/components.md) | `heatmap.js`, `inventory.js` buttons, controls, icons |
| 3 Layout | Grey boxes, frames, containers, depth, separation, white space, balance, far view | [layout.md](references/layout.md) | `views.js` wireframe, textonly, nolines, far |
| 4 Hierarchy | First, second, third per level, groups, act where you look, what each level shows, cut | [hierarchy.md](references/hierarchy.md) | `views.js` notext, `text.js` loudest, actions |
| 5 Detail | Length, density, variance with intent, states, zero data, speed, motion, feedback, browser, access | [detail.md](references/detail.md) | `stress.js`, `text.js` truncated, `inventory.js` access |
| 6 Alignment | Edges, spacing scale, rhythm, sibling heights | [alignment.md](references/alignment.md) | `layout-meter.js` |
| 7 Words | Plain, consistent, needed, works as text alone | [words.md](references/words.md) | `text.js` |
| 8 Polish | Spot checks, before and after, clean code, the best we can do | [polish.md](references/polish.md) | Every tool, once |

- Each lens file ends with its numbers and their targets. Before you change anything, run `scripts/measure.sh <url> <before-dir> <region>`; it saves every script's numbers and screenshots. At the end, run it into an after folder; `--compare` lists every number that moved, for the lens table.
- The tools are plain browser scripts in [`scripts/`](scripts/README.md). They count and point to candidates, and you decide by looking: every lens ends with you looking at a screenshot. Point each one at the region you are fixing (`window.__axesLayer`), one region at a time; on a whole page the shell's lines bury the finding.
- Rebuild once on the findings and stop; a second rebuild means the frame was wrong.

## Critic

Fresh eyes on a new screen or an exploration, once the lenses hold.

- Give a fresh sub-agent only the screenshots and the user's question: no code, no reasoning, no account of what you meant.
- Ask it to be bold, opinionated, and brief: score 1 to 10 against the principles, name the three weakest spots, and flag anything that looks generic or machine-made. A clean critique is a valid answer.
- Fix and ask again. Stop at 9 or after two rounds; a third round means the frame is wrong, so go back to the Layout lens. Keep the stop rule out of the critic's prompt.
- Without sub-agents, critique the screenshots yourself, as if seeing them for the first time.

## Done

Done when every lens has a row in the lens table, with every rule in its file checked and every number in its Numbers section measured. End the answer with the outcome in a line or two, before and after screenshots, and the lens table:

| Lens | Rules checked | Numbers, before → after | Fixed | Open |
| --- | --- | --- | --- | --- |
| 1 Foundations | 21 of 23; no dark theme yet | `fontSizes` 9 → 5, `oneOffs` 7 → 0 | Icon sizes follow text sizes | One muted grey |

- Rules checked: how many of the file's rules (one bullet each, above its Numbers) you checked. On a mock, rules that need the running app (speed, motion, feedback, browser behavior) count as not checked, with that reason. Name each failed rule by its first words, under Fixed or Open.
- One row per lens, plus the critic's score when it ran.
