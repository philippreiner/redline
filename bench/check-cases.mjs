// Fix cases: `measure.sh --try` must pass right fixes and fail wrong ones.
//   node bench/check-cases.mjs [case-number ...]
// Measures each screen once, then tries each case's fix (the printed `apply`, or a variant
// written as CSS) on a fresh reload and compares the verdict. Exits 1 on any miss. Runs in
// agent-browser session `check-cases` (AGENT_BROWSER_SESSION overrides it).
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const bench = path.dirname(new URL(import.meta.url).pathname);
const measure = path.join(bench, "../skills/redline/scripts/measure.sh");
const screens = {
  "rec-meetings": ["recorder.html#meetings", "#meetings .main"],
  "rec-meeting": ["recorder.html#meeting", "#meeting .detail"],
  "cmms-list": ["cmms.html#work-orders", "main"],
  "cmms-detail": ["cmms.html#work-order", "main"],
  "cmms-asset": ["cmms.html#asset", "main"],
  scope: ["scope.html", "main"],
  row: ["row.html", "main"],
  seeded: ["seeded.html", "main"],
  "cmms-cut": ["cmms-cut.html#asset", "main"],
  controls: ["controls.html", "#seeded"],
  shell: ["shell.html", ".app"],
  hierarchy: ["hierarchy.html", "#seeded"],
  "shell-chip": ["shell-chip.html", ".app"],
};

// [screen, check kind ("note": the first check under 0.5 with an apply), its text starts
// with, variant CSS (null: the printed apply), expected verdict, what it is]. NOAPPLY: the
// check's fix needs markup, so --try refuses it.
const cases = [
  ["rec-meetings", "baseline", "9:00 AM", null, "CLEAN", "printed: time cell to the top"],
  ["rec-meetings", "edge", "Today", null, "CLEAN", "printed: day heading margin"],
  ["rec-meeting", "edge", "box 269", null, "CLEAN", "printed: ask form padding-inline"],
  ["rec-meeting", "inset", "SUMMARY", null, "CLEAN", "printed: summary card padding-inline"],
  ["rec-meetings", "contrast", "Product", null, "CLEAN", "printed: darker gray on every holder"],
  ["cmms-asset", "baseline", "Mean time", null, "CLEAN", "printed: KPI label min-height"],
  ["cmms-asset", "edge", "ID", null, "CLEAN", "printed: first and last cell padding"],
  ["cmms-asset", "baseline", "Technician", null, "CLEAN", "printed: pairs on one baseline"],
  ["cmms-asset", "inset", "Documents", null, "CLEAN", "printed: the taller header's padding-block"],
  ["row", "baseline", "Decisions", null, "CLEAN", "printed: the wrapped title's min-height"],
  ["row", "baseline", "Decisions", "div.card > h3 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }", "FAIL", "cuts the title to one line"],
  ["cmms-asset", "break", "9", null, "CLEAN", "printed: a halo on the struck chart labels"],
  ["cmms-detail", "break", "Schuler", null, "CLEAN", "printed: the serial rewraps whole"],
  ["scope", "edge", "Items", null, "CLEAN 1", "printed: moves only the Items heading, one element"],
  ["rec-meetings", "edge", "Today", "div.day > h3 { transform: translateX(-2px) }", "FAIL", "right pixels, wrong code: a transform is no printed or layout property"],
  ["rec-meeting", "edge", "box 269", "form.ask { padding-left: 20px }", "FAIL", "half edit: the right side stays off"],
  ["rec-meeting", "inset", "SUMMARY", "div.sumcard { padding-left: 18px }", "FAIL", "half edit: the right inset stays off"],
  ["cmms-asset", "edge", "ID", "table.tbl :is(th, td):first-child { padding-left: 18px }", "FAIL", "half edit: the last column stays off"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }", "FAIL", "clip: fits at 1440 by 0.4px, cut when narrower"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { white-space: nowrap }", "FAIL", "holds at 1440 only, cut at 1280"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { height: 17px; overflow: hidden }", "FAIL", "clip: the label loses its second line"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { height: 17px }", "FAIL", "spill: the second line prints over the value"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { height: 17px; contain: paint }", "FAIL", "clip by contain"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { height: 17px; clip-path: inset(0) }", "FAIL", "clip by clip-path"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { font-size: 11px }", "FAIL", "shrinks the label to fit"],
  ["cmms-asset", "baseline", "Mean time", "dl.kpis dt { line-height: 1 }", "FAIL", "squeezes the lines to fit"],
  ["cmms-asset", "edge", "ID", "table.tbl { position: relative; left: 10px }", "FAIL", "shove: the table runs past its card's edge"],
  ["cmms-asset", "edge", "ID", "table.tbl { margin-left: 10px }", "FAIL", "shove: the table runs past its card's edge"],
  ["cmms-asset", "break", "9", "div.target { transform: translateY(14px) }", "FAIL", "moves the target line: the chart's value"],
  ["cmms-asset", "break", "9", "div.target { opacity: 0 }", "FAIL", "hides the target line"],
  ["cmms-detail", "break", "Schuler", "span.sub2 { font-size: 11px }", "FAIL", "shrinks the line to fit"],
  ["cmms-detail", "break", "Schuler", "span.sub2 { letter-spacing: -0.6px }", "FAIL", "tightens the tracking to fit"],
  ["rec-meetings", "baseline", "9:00 AM", "div.rtime { visibility: hidden }", "FAIL", "hides the mover"],
  ["scope", "edge", "Items", 'ul[data-slot="list"] h2 { padding-left: 52px }', "FAIL", "the name matches To review too"],
  ["cmms-list", "sibling", "Press HP-300", null, "NOAPPLY", "link every Asset cell or none: markup"],
  ["rec-meeting", "note", "", null, "NOTE FAIL", "a note under 0.5 never passes"],
  [
    "rec-meeting",
    "inset",
    "SUMMARY",
    'div#t-summary > div.sumcard { padding-inline: 18px; position: relative } div#t-summary > div.sumcard::after { content: ""; position: absolute; left: 0; right: 0; top: -250px; height: 245px; background: #fff; pointer-events: none }',
    "FAIL",
    "a pseudo-element covers the player",
  ],
  [
    "rec-meeting",
    "inset",
    "SUMMARY",
    'div#t-summary > div.sumcard { padding-inline: 18px; position: relative } div#t-summary > div.sumcard::after { content: ""; position: absolute; left: 0; right: 0; top: 700px; height: 110px; background: #fff }',
    "FAIL",
    "a pseudo-element covers text below the fold",
  ],
  [
    "rec-meeting",
    "inset",
    "SUMMARY",
    "div#t-summary > div.sumcard { padding-inline: 18px } div#t-summary li::first-line, div.talk p::first-line { color: #f4f3ef }",
    "FAIL",
    "first lines turn invisible",
  ],
  ["rec-meeting", "inset", "SUMMARY", "div#t-summary > div.sumcard { padding-inline: 18px } div#t-summary > div.sumcard > p { margin-left: 3px }", "FAIL", "one inner paragraph drifts"],
  ["cmms-detail", "break", "Schuler", "div > span.sub2 { font-variant-caps: all-small-caps }", "FAIL", "small caps squeeze the line"],
  ["cmms-detail", "break", "Schuler", "div > span.sub2 { display: inline-block; transform: scaleX(0.85); transform-origin: left; white-space: nowrap }", "FAIL", "scaleX squeezes the glyphs"],
  ["cmms-detail", "break", "Schuler", 'div > span.sub2 { font-stretch: condensed; font-feature-settings: "smcp", "c2sc" }', "FAIL", "condensed small caps"],
  ["cmms-detail", "break", "Schuler", "div > span.sub2 { text-wrap: balance } @media (max-width: 1300px) { main { visibility: hidden } }", "FAIL", "a media rule blanks the page at 1280"],
  ["rec-meetings", "baseline", "9:00 AM", "div.row > div.rtime { align-self: flex-start } div#list > div.day:first-child { margin-bottom: 11px }", "FAIL", "an unrelated day gap shrinks by 11px"],
  ["rec-meetings", "baseline", "9:00 AM", "@media (min-width: 1px) { div.row > div.rtime { align-self: flex-start } }", "CLEAN", "the printed fix inside a media rule"],
  ["rec-meetings", "baseline", "9:00 AM", "div.row > div.rtime { align-self: flex-start } #meetings .main { filter: blur(1.2px) grayscale(1) }", "FAIL", "the region blurs"],
  ["rec-meetings", "contrast", "Product", "div.search > span.kbd, div.rmeta > span.src, div.rmeta > span { color: #747068; filter: opacity(0.35) }", "FAIL", "a filter fades the text"],
  ["rec-meetings", "contrast", "Product", "div.search > span.kbd, div.rmeta > span.src, div.rmeta > span { color: #747068; mix-blend-mode: screen }", "FAIL", "a blend mode hides the text"],
  [
    "rec-meetings",
    "contrast",
    "Product",
    "div.search > span.kbd, div.rmeta > span.src, div.rmeta > span { color: #747068 } div.search > input#q::placeholder { color: transparent }",
    "FAIL",
    "the search placeholder disappears",
  ],
  ["seeded", "sibling", "+3.2", null, "CLEAN", "printed: the odd tile value at its row-mates' size"],
  ["seeded", "contrast", "Week 44", null, "CLEAN", "printed: a darker gray on the subtitle"],
  ["seeded", "edge", "480 k", null, "CLEAN", "printed: the number column's right padding"],
  ["seeded", "inset", "Overdue", null, "CLEAN", "printed: the odd tile's left padding"],
  ["seeded", "edge", "Follow-ups", null, "CLEAN", "printed: the heading's margin"],
  ["seeded", "control", "Send review", null, "CLEAN", "printed: the taller button's height"],
  ["seeded", "sibling", "Blocked", null, "NOAPPLY", "a chip needs markup"],
  ["seeded", "sibling", "Nov 21", null, "NOAPPLY", "a date format is a text change"],
  ["seeded", "inset", "Overdue", "div.tiles > dl.b { padding-left: 16px; width: fit-content }", "FAIL", "right inset, but the tile loses its shared width"],
  ["seeded", "control", "Send review", "div.actions > button.primary { height: 32px; font-size: 12px }", "FAIL", "right height, smaller label"],
  ["cmms-cut", "break", "24 Sep", null, "CLEAN", "printed: the date column 4px wider"],
  ["cmms-cut", "break", "24 Sep", "section.card:nth-child(3) > table.roomy tbody tr:nth-child(3) td:first-child { font-size: 12px }", "FAIL", "shrinks the date to fit"],
  ["cmms-cut", "break", "24 Sep", "section.card:nth-child(3) > table.roomy tbody tr:nth-child(3) td:first-child { letter-spacing: -0.4px }", "FAIL", "tightens the date to fit"],
  ["controls", "shape", "New workstream", null, "CLEAN", "printed: the pill takes the toolbar's 6px radius"],
  ["controls", "shape", "ERP migration", null, "CLEAN", "printed: the square select takes the form's 6px radius"],
  ["controls", "shape", "Share", null, "CLEAN", "printed: the square button takes the card's 6px radius"],
  ["controls", "shape", "WMS cutover", null, "CLEAN", "printed: the capsule tag takes the list's 4px radius"],
  ["controls", "square", "More actions", null, "CLEAN", "printed: the 28x24 icon button 28px tall"],
  ["controls", "shape", "New workstream", "div.toolbar > button.pill { border-radius: 3px }", "FAIL", "half fix: rounded, but not the toolbar's 6px"],
  ["controls", "shape", "New workstream", "section#seeded div.toolbar > button { border-radius: 999px }", "FAIL", "the other way: every toolbar button turns into a pill"],
  ["controls", "shape", "New workstream", "div.toolbar > button.pill { clip-path: inset(0 round 6px) }", "FAIL", "a clip looks rounded, the radius stays"],
  ["controls", "square", "More actions", "div.toolbar > button.short { height: 26px }", "FAIL", "half edit: 28x26 is still not square"],
  ["controls", "square", "More actions", "div.toolbar > button.short { transform: scaleY(1.17) }", "FAIL", "a transform stretches the icon"],
  ["controls", "volume", "Carrier", null, "NOAPPLY", "rows that carry a preview: markup and words"],
  ["controls", "large", "Cloud", null, "NOAPPLY", "four leads: markup"],
  ["shell", "band", "Chats", null, "CLEAN", "printed: odd pane headers at the majority height"],
  ["shell", "band", "Chats", "section.list > header.head { height: 40px }", "FAIL", "half edit: the detail header stays 44px"],
  ["shell", "axis", "Event", null, "CLEAN", "printed: the centred button back on the column's start"],
  ["shell", "axis", "Event", "div.stack > button.event { transform: translateX(-255px) }", "FAIL", "a transform"],
  ["shell", "indent", "Finance close", null, "CLEAN", "printed: the odd group's indent step"],
  ["shell", "indent", "Reports", null, "CLEAN", "printed: the outdented item's padding"],
  ["shell", "indent", "Reports", "nav.nav > a.reports { transform: translateX(4px) }", "FAIL", "a transform"],
  ["shell", "inset", "icon 16", null, "CLEAN", "printed: the odd pane's padding-inline"],
  ["shell", "inset", "icon 16", "section.files > div.fbody { padding-left: 16px }", "FAIL", "half edit: the right inset stays 12px"],
  ["shell", "edge", "Mon", null, "CLEAN", "printed: the late time's padding"],
  ["shell", "edge", "4", null, "CLEAN", "printed: the Inbox badge's margin"],
  ["hierarchy", "rank", "Wave 2 readiness", null, "CLEAN", "printed: the section title one step below the page title"],
  ["shell-chip", "control", "Active", null, "CLEAN", "printed: the status chip at the height of the button beside it"],
  ["shell-chip", "control", "Active", "header.head > span.chip { transform: scaleY(1.27) }", "FAIL", "a transform"],
];

const session = process.env.AGENT_BROWSER_SESSION || "check-cases";
const env = { ...process.env, AGENT_BROWSER_SESSION: session };
const ab = (...args) => execFileSync("agent-browser", args, { env, encoding: "utf8" });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "check-cases-"));
const open = (screen) => {
  ab("set", "viewport", "1440", "900");
  ab("open", `file://${path.join(bench, screens[screen][0])}`);
  ab("eval", "location.reload()");
  ab("wait", "1500");
};
const pick = process.argv.slice(2).map(Number);
const measured = {};
let misses = 0;
cases.forEach(([screen, kind, text, css, expected, what], i) => {
  if (pick.length && !pick.includes(i + 1)) return;
  const dir = path.join(tmp, screen);
  if (!measured[screen]) {
    open(screen);
    execFileSync("bash", [measure, dir, screens[screen][1]], {
      env,
      stdio: "ignore",
    });
    measured[screen] = JSON.parse(fs.readFileSync(path.join(dir, "min-checks.json"), "utf8")).checks;
  }
  const n = measured[screen].findIndex((f) => (kind === "note" ? f.score < 0.5 && f.apply?.length : f.kind === kind && (f.text || "").startsWith(text))) + 1;
  const [want, matches] = expected.split(/ (?=\d)/);
  let verdict = "MISSING",
    detail = `no ${kind} check on "${text}"`;
  if (n) {
    const args = [measure, "--try", dir, String(n)];
    if (css) (fs.writeFileSync(path.join(tmp, `case-${i + 1}.css`), css), args.push(path.join(tmp, `case-${i + 1}.css`)));
    open(screen);
    // How many elements the printed apply matches, for cases that pin it.
    const count =
      matches &&
      JSON.parse(JSON.parse(ab("eval", `JSON.stringify(new Set(${JSON.stringify(measured[screen][n - 1].apply.map((a) => a.selector))}.flatMap((s) => [...document.querySelectorAll(s)])).size)`)));
    const run = spawnSync("bash", args, { env, encoding: "utf8" });
    verdict = /has no apply/.test(run.stderr) ? "NOAPPLY" : run.stdout.split(/\s/)[0] || "ERROR";
    detail = run.stdout.trim().split("\n").slice(1).join("; ").replace(/\s+/g, " ").trim() || run.stderr.trim();
    if (matches && count !== Number(matches)) ((verdict += ` matching ${count}`), (detail = `the printed apply matches ${count} elements, want ${matches}; ${detail}`));
  }
  const ok = want.split(" ").includes(verdict);
  if (!ok) misses++;
  console.log(
    `${ok ? "ok  " : "MISS"} ${String(i + 1).padStart(2)} ${screen} ${kind} "${text}": ${verdict} (want ${want.replace(" ", " or ")}${matches ? `, matching ${matches}` : ""}), ${what}${detail ? ` | ${detail}` : ""}`,
  );
});
spawnSync("agent-browser", ["close"], { env });
fs.rmSync(tmp, { recursive: true, force: true });
console.log(misses ? `${misses} cases missed.` : "All cases sorted.");
process.exitCode = misses ? 1 : 0;
