# Bench

A fixed regression set for this skill: three HTML fixtures rebuilt from real screens, with their known defects in [ground-truth.md](ground-truth.md). Rerun it after a change to the skill or its scripts.

## Scripts

From the skill's folder, measure each fixture and check the signals below:

```sh
scripts/measure.sh bench/sources-before.html /tmp/bench/sources .app
scripts/measure.sh bench/meetings-before.html /tmp/bench/meetings .app
scripts/measure.sh bench/meeting-rail.html /tmp/bench/rail '#rail'
```

| Fixture | Signal | Expected |
| --- | --- | --- |
| sources-before | `meter.json` `nearMissPx` | `[[216, 220]]`: an inset 4px off |
| sources-before | `meter.json` `frame.crumbOffKeyline` | `true` |
| sources-before | `text.json` `nothing` | the three "No …" lines |
| sources-before | `text.json` `repeats` | `4x Assign` |
| meetings-before | `meter.json` `frame` | `crumbOffKeyline` `true`, `crumbEndsInTitle` `false` (`last` is "Sources") |
| meetings-before | `text.json` `valueFormats` | three shapes: `9 a`, `a 9:9`, `9.9. 9:9` |
| meeting-rail | `meter.json` `nearMissPx` | `[[128, 131]]`: the value icon off the chip's edge |
| meeting-rail | `stress-long.json` `after.overlaps` | `2`: labels running under their values |

A run on a screen you consider clean shows the false positives: every signal there is a candidate.

## The whole skill

A fresh `designer` agent runs Review mode on each fixture without opening ground-truth.md, writes its findings, then scores them: each known defect found (by which script field or rule) or missed, and each extra finding valid or false. On 2026-10-22 the first run found 3 of 4 and 4 of 5; after that round's script fixes, the scripts alone signaled 8 of the 9 known defects in sources-before and meetings-before.
