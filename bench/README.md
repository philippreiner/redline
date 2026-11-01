# Bench

A fixed regression set for the redline skill: three HTML fixtures rebuilt from real screens, with their known defects in [ground-truth.md](ground-truth.md), one fixed fixture, two click dummies (`recorder.html`, `cmms.html`), `scope.html` (two list headings that share one name, as on Antasar's Systems screen), `row.html` (four KPI cards, one title wraps and pushes its number down), which hold the fix cases, `seeded.html` (a portfolio review with eight seeded defects, listed in ground-truth.md), and `cmms-cut.html` (a CMMS screen whose date is cut short, which `view.js` must flag). It lives outside the skill, so an installed skill does not carry it. Rerun it after a change to the skill or its scripts.

## Scripts

From the repo root, measure each fixture and check the signals below:

```sh
s=skills/redline/scripts/measure.sh
$s --all --url bench/sources-before.html /tmp/bench/sources .app
$s --all --url bench/meetings-before.html /tmp/bench/meetings .app
$s --all --url bench/meeting-rail.html /tmp/bench/rail '#rail'
$s --url bench/sources-after.html /tmp/bench/sources-after .app
$s --compare /tmp/bench/sources /tmp/bench/sources-after
```

| Fixture | Signal | Expected |
| --- | --- | --- |
| sources-before | `redline.json` `far` | one card at `+8`: `section.needs` pads 24px where the banner and the three tiles pad 16px |
| sources-after | `redline.json` | `near` and `far` empty |
| sources-before | `count.json` `text.nothing` | the three "No …" lines |
| sources-before | `count.json` `text.repeats` | `4x Assign` |
| sources-before | `count.json` `checks` | `sibling` on `div.tiles > a.add`: the Add source tile is bare where its three siblings are cards |
| sources-before → after | `--compare` | `count distinct.gaps: 4 → 3`: the search field's 12px gap is gone |
| meetings-before | `count.json` `text.valueFormats` | three shapes: `9 a`, `a 9:9`, `9.9. 9:9` |
| meeting-rail | `redline.json` `near` | `Run routine` at `+1` |
| meeting-rail | `view-long.json` `after.overlaps` | `3`: two labels running under their values, and Workstreams under its chip's icon |

`redline.js` misses the search text (x 268) against the banner text (x 264): the search text sits inside an input, which is one start. It also misses the meetings crumb off the column (about 150px, in the header) and the rail's value icon, chip, and helper at 231, 232, and 234, where no three share an x. An offset is the mover minus its reference.

A run on a screen you consider clean shows the false positives: every signal there is a candidate.

## Fix check

`node bench/check-cases.mjs` runs `measure.sh --try` on 63 fixes on the two click dummies, `scope.html`, `row.html`, `seeded.html`, and `cmms-cut.html` and compares each verdict. The printed fixes print CLEAN, the printed fix inside an `@media` rule prints CLEAN, and the scope fixture's fix matches only its one heading. Wrong variants fail: half edits, clips (overflow, `contain`, `clip-path`), a fixed height that spills, smaller, tighter, small-caps, condensed, or `scaleX` type, a fit that holds at 1440 only, a table shoved past its card, a chart line moved or hidden, a hidden mover, a transform, a selector that reaches a sibling, a covering `::after` above or below the fold, invisible first lines, a hidden placeholder, a drifting inner paragraph, an unrelated gap that shrinks, a filter, a blend mode, a blurred region, a media rule that blanks the page at 1280, a tile that loses its shared width (`width: fit-content`), and a cut date shrunk or tightened to fit. A markup fix is refused, and a note under 0.5 never prints CLEAN. A case number runs one case: `node bench/check-cases.mjs 8`.

## The whole skill

A fresh `designer` agent runs Review mode on each fixture without opening ground-truth.md, writes its findings, then scores them: each known defect found (by which script field or rule) or missed, and each extra finding valid or false. On 2026-10-22 the first run found 3 of 4 and 4 of 5; after that round's script fixes, the scripts alone signaled 8 of the 9 known defects in sources-before and meetings-before.
