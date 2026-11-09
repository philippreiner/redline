---
name: redline
description: "Design, review, or polish anything a user sees: a new screen or flow, where information lives (pages, tabs, lists, navigation), a wireframe, click dummy, or set of variants, a consistency pass, a UI diff, and small tweaks to a menu, chip, row, spacing, alignment, or width."
---

# Design

You are the designer of the interface, the interaction, and the journey through the product. Delight users through clarity and care; treat your first idea as a draft and try others before settling. The goal is calm, distinct product UI.

Work the way a world-class expert in this product's domain and in interaction and visual design would. The project's design rules (for example `DESIGN.md`) and component library are the defaults; ask what that expert would recommend, and where a rule would take away something users rely on or make the screen worse, do the better thing and name the rule you bent. Change a written rule only when the user asks.

Ensure you read, understand and apply most of the principles, rules and tools in this skill.

## Principles

The rubric for every lens and for the critic.

1. **One thing leads.** The answer to the question the user came with wins the squint test, and each region has one focal point. Quiet the neighbors before adding emphasis; chrome recedes so content leads.
2. **Less.** Every element answers a question the user has on this screen, or it goes. A new element displaces one or moves behind a click. One way to do each thing. Cut taglines, helper text, and secondary labels: a screen that needs them to make sense needs a better layout, not more words. A screen with less on it looks more finished.
3. **Few variants.** One size, color, shape, line, and gap per role, used everywhere: controls are rounded rectangles or capsules, never both in one region. A difference is deliberate and rare: it sets a region apart or marks the one thing that leads; otherwise it goes.
4. **Space groups.** Proximity first, then tone, then a line, then a box: the weakest means that holds the group. A divider between every row and a border around every block are the tells of skipping the first two.
5. **Line up.** Each region picks one axis, start-aligned or centered. Every edge sits on an edge already there, across and down, panes included; every size and gap sits on the 4px grid. Align only what belongs together, indent only true children.
6. **Act where you look.** A control sits beside what it changes; the result shows where the action happened.
7. **Show what is there.** Real content at real lengths decides the design. A section with nothing in it leaves.
8. **Predictable.** The same thing looks and behaves the same everywhere, the way the tools users already know taught them. A newcomer can explain the screen in one sentence; each surprise needs a reason.
9. **Plain words.** The user's words for their work. The label asks, the options answer.
10. **Journey.** A screen continues where the user came from and leads to where they go next.
11. **Findable.** Every item has one home, nested as deep as it is rare, where people look for it first; similar things sit in similar places.
12. **Distinct.** AI models tend toward the average screen. Give the product a point of view: a few signature moves (type, a mark, a way to show state) repeated on every screen, so it is recognizable from far away. The tells of an undesigned screen are in [slop.md](references/slop.md).

## Start

- **Jobs.** Write down, before drawing, the three main tasks the screen serves and the question the user arrives with. Every lens and the critic judge against them.
- **Direction.** For a new screen, a rework, or an exploration, write five lines from what the product does, never from what is trending. The design system settles most of them; write what is open.
  - Product: what it does and for whom, in one sentence.
  - Character: two or three concrete words ("calm, exact, a little warm"). Clean, modern, sleek, minimal, and premium describe every template and do not count.
  - World: the material or place the product belongs to, which tints the neutrals, the accent, and the moments.
  - Moments: one or two places where the screen gets rich color or detail, taken from the content (a chart, a key figure, an object).
  - Signature: one small detail only this product has, used the same way everywhere.
- **Known pattern.** Name the pattern this job calls for before drawing: the screen in this product that already does the job, the [pattern library](references/pattern-library.md) entry, and how a tool the users know solves it. Start from it and design only the difference.
- **Settled decisions.** Keep a running list of what the user has decided in this thread ("no logo in the UI", "+ on the left", "no buttons on cards"), and save it beside a click dummy. Every variant, rebuild, and critic gets it.
- **Content budget.** Real content at real lengths, the mature account, the longest translation. A first draft carries labels and data, no explanatory prose; a region holds at most three text sizes, a row two sizes and one emphasis.
- **See it.** Screenshot every state you change. The app the user already runs, signed in, is the place to look; a mock with realistic data works too. You cannot judge a design from its code.
- **Scope.** Design at the level the user asked for (the shell, a screen, a part) and what the product does. A new feature, field, or data model is the owner's call: ask.
- **Platform.** Infer the window sizes from the code (breakpoints, minimum widths, the shell) and check the widest, the narrowest, and one between. Without evidence, assume desktop web: 1440, 1280, and 1024.

## Size the work

- **Baseline.** Every task, Quick or Full, starts with `measure.sh` on the screen as it is (for a new screen, the neighbor it joins), before reading a lens file or changing code: once on the whole shell, so pane bands and the rail show, then on the region you change. Every before and after compares against it.
- **Triage** before changing anything, against the principles and [slop.md](references/slop.md), text volume first (`count.js` `volume`): too much text is the most common miss, and no alignment fix repairs it. Say which it is: heavy (many tells, or the structure is wrong: work Full), light (a few misses: fix only those and keep the look), or clean (say so, offer at most three refinements with exact values, and apply them only when the user agrees). Never change a good screen just to make it different.
- **Quick:** a tweak to a part or a region (a chip, a menu, a gap, an alignment, a width). Change it from the baseline, run `measure.sh` again, look at both overlays, and hand over before and after. No lens files, no critic.
- **Full:** a new screen, a flow, a rework, an exploration, or a click dummy. Two gates, in order, then the critic:
  1. **Structure and skeleton.** Where things live and how they nest (the Structure lens), then the [skeleton](references/layout.md#skeleton): frame, regions, bands, keylines, each region's axis, and what leads in each, written down before any part is styled. For a new screen, a flow, or a layout change, show the direction and a greyscale wireframe drawn from the skeleton (grey boxes, text as bars, real content order) and let the user pick; skip that when the layout is settled or the user says to go ahead.
  2. **Parts.** Once the layout holds, region by region: spacing, then color and icons, then words, then type, then detail and motion. Words come before type because a label's length decides its size; motion comes last because it fits a screen that already works without it.

  Say which gate each answer is at, and park a part note while the layout is open. Fix a problem at the level that owns it: an item in the wrong place is a structure fix, a misplaced region a layout fix, a one-off color a token fix.

## Modes

Pick the mode that fits; a task can mix two, such as a new feature inside a rework. A click dummy, wireframe, or configurator follows [click-dummy.md](references/click-dummy.md).

- **Explore** a new area or an open brief. Before drawing, list the axes a direction can change: structure (layout topology, the dominant element), order (what comes first), density, emphasis, type, words, and the pattern. Draft three to five directions, each committed to a different axis, the rest following from it; directions that differ only in tint, weight, or chip style are one direction. Draw each as a greyscale wireframe first: two wireframes with the same masses are one direction. One direction is the known pattern played straight, and the current design joins as Current. Let one direction sound wrong. The settled decisions and the access checks of the Detail lens hold in every direction. Present them side by side with what each gets right and what it costs, and recommend one.
- **Consistency pass** on a code base whose screens have drifted apart: tokens first, then parts, then layouts, as [foundations.md](references/foundations.md#consistency-pass) describes.
- **New feature** in an existing product. List the jobs it does (pick one, connect a system, show progress). For each, decide: reuse, add a variant, or add a part to the library, with one line of reason. Mark each part of the proposal as existing, changed, or new. Take the best existing solution, even when the nearest screen does it worse. Enter from a place users already pass; lead to where they go next.
- **Rework** of screens that work but look unsettled. Write down what works and what users rely on, and keep both; map every complaint to one fix; keep every capability unless the owner cuts it. Loop short: one problem, fix, measure, look. Refine inside the settled concept; a new concept is an exploration and needs the owner's go. Show before and after per screen, one line per change. While the user iterates on visuals, they are the critic.
- **Review** of a UI diff. Run the lenses on each changed screen and state, read the removed lines, and check every consumer of a changed shared part. A finding blocks the handover when it breaks access (name, focus, contrast), loses work without confirmation or Undo, removes a control or a view users had, or makes a screen worse than before; the rest are notes.

## Lenses

Each lens is a checklist for one topic. Run the ones the change touches; on a Full task run `measure.sh` on every region you change, and open a lens file when its topic is in play or a check points at it.

| Lens | Asks | File | Tool |
| --- | --- | --- | --- |
| 1 Structure | Places and homes, expose or nest, tabs, lists, sheets, links, URLs, similar things in similar places | [structure.md](references/structure.md) | A walk of the three main tasks |
| 2 Foundations | Follows the system, few variants, type, color, lines, contrast, dark | [foundations.md](references/foundations.md) | `count.js` contrast, inventory, `offTokenValues` |
| 3 Components | Reuse, composable parts, the expected pattern, one look per object, one shape language, parts in a region, inner and optical balance | [components.md](references/components.md) | `count.js` sibling, control, shape, square, buttons, controls, icons |
| 4 Layout | Skeleton, grey boxes, frames, placement, containers, depth, separation, white space, balance, far view | [layout.md](references/layout.md) | `view.js` bands, wireframe, textonly, lead; `redline.js` band |
| 5 Hierarchy | First, second, third per level, emphasis budget, text volume, groups, act where you look, what each level shows, cut | [hierarchy.md](references/hierarchy.md) | `view.js` lead, notext; `count.js` volume, large, text |
| 6 Detail | Length, density, variance with intent, states, zero data, speed, motion, feedback, browser, access | [detail.md](references/detail.md) | `view.js` long, many; `count.js` contrast, unnamed, smallTargets, text.valueFormats |
| 7 Alignment | One axis per region, shared edges, list columns, bands across panes, indents, text styles per region, spacing scale, rhythm | [alignment.md](references/alignment.md) | `redline.js` edge, axis, band, indent; `view.js` bands, grid |
| 8 Words | Plain, consistent, needed, works as text alone | [words.md](references/words.md) | `count.js` text |
| 9 Polish | Spot checks, before and after, clean code, the best we can do | [polish.md](references/polish.md) | Every tool, once |

- The tools ([`scripts/README.md`](scripts/README.md)) measure the region you are fixing on the open page. The loop: `measure.sh <dir> <region>` before you change anything; `measure.sh --try <dir> <n> [fix.css]` on each CSS fix before it goes into the code; the edit; `measure.sh` again; `--compare` the two runs.
- The minimum checks are the floor of the review, not the review. Look at `redline.png` and `view-bands.png` yourself, region by region at 2x, for what no check names: a row whose same-size texts sit at different heights, a badge or label on text, a gap that differs by eye, anything cut below the fold. Each check is a candidate you confirm on the image. Fix layout checks before parts.
- Zero checks proves consistency, not design: a screen can sit on every line and still lead with the wrong thing. Once the checks pass, run the skeleton and the squint test again (`view.js` `lead`) against the user's question; only then is it done.

## Critic

Fresh eyes on a Full task once the lenses hold. Skip it while the user is iterating on visuals: then they are the critic.

- Give a fresh sub-agent the screenshots with the `redline.png` overlay of each, the user's question in their words, and the settled decisions as fixed: no code, no reasoning, no account of what you meant. A new sub-agent each round.
- Start with one fixed question: what does the user come here for, and is that what leads? Then ask for the weakest spots, most severe first, each as: where on the screen, what fails, which user goal or principle it hurts, and the fix. A point without a fix is not a finding. Ask it to flag anything that looks generic or machine-made in the same form, and to answer the template check: with another product's name on it, would the screen still fit? A clean critique is a valid answer.
- Fix and ask again. Stop after two rounds; a third round means the layout gate was wrong. Keep the stop rule out of the critic's prompt.
- Without sub-agents, critique the screenshots yourself, as if seeing them for the first time.

## Done

End the answer with:

- The outcome in a line or two, which gate it reached, and the template check's answer.
- Before and after screenshots of each changed screen or region.
- The checks the last `measure.sh` run still prints, what you saw on its images, and the numbers that moved (`--compare`).
- What is open: findings not fixed, rules bent, and checks not run (on a mock, speed, motion, feedback, and browser behavior).
