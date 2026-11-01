#!/usr/bin/env bash
# Measure a page or one region; save the numbers and images; print the minimum checks.
#   measure.sh [--all] [--url <url-or-file>] <out-dir> [region-selector]
#   measure.sh --try <out-dir> <n> [fix.css]     tries check n's fix (or your own CSS) on the page
#   measure.sh --compare <before-dir> <after-dir>    prints what moved: checks, distinct values, misses
# Without --url (or with --url -) it measures the page already open in agent-browser's
# session: AGENT_BROWSER_SESSION, else its default session; a page it opens stays open
# for --try. Default run: page.png, then redline, count, and view-bands as png
# and json, and min-checks.json: every check in one ranked list. The checks are the floor
# of a review; the images are the review. --all adds the views lead, grid, wireframe,
# notext, and textonly and the stress views long and many. --try applies the check's
# `apply` (or fix.css) on the page the checks came from and prints CLEAN when the check is
# gone and nothing else measured changed, at WIDTH and WIDTH - 160 (no proof the fix is
# good: look at it); NOTE for a check under 0.5; FAIL with the reason. It stops the page's
# timers, so reload the page after. Window: WIDTH x HEIGHT (1440x900).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
usage() {
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 1
}

if [ "${1:-}" = "--compare" ]; then
  [ $# -eq 3 ] && [ -d "$2" ] && [ -d "$3" ] || usage
  node - "$2" "$3" <<'EOF'
const fs = require("node:fs");
const path = require("node:path");
const [a, b] = process.argv.slice(2);
// A result file holds plain JSON or the JSON string agent-browser printed; decode until it is an object.
const read = (d, f) => { let v = fs.existsSync(path.join(d, f)) ? fs.readFileSync(path.join(d, f), "utf8") : "{}"; while (typeof v === "string") { try { v = JSON.parse(v); } catch { return {}; } } return v; };
const out = [];
// The checks: gone, new, and a score that moved.
const checks = (d) => new Map((read(d, "min-checks.json").checks || []).map((c) => [`${c.kind} ${c.where}`, c]));
const [ca, cb] = [checks(a), checks(b)];
for (const [k, c] of ca) if (!cb.has(k)) out.push(`gone: ${k} (${c.score})`);
for (const [k, c] of cb) if (!ca.has(k)) out.push(`new: ${k} (${c.score})`);
for (const [k, c] of cb) if (ca.has(k) && Math.abs(ca.get(k).score - c.score) >= 0.05) out.push(`score: ${k} ${ca.get(k).score} → ${c.score}`);
// The inventory: distinct values and one-offs per list, near and far misses, words.
const [ia, ib] = [read(a, "count.json"), read(b, "count.json")];
for (const key of ["distinct", "oneOffs"]) for (const k of Object.keys({ ...ia[key], ...ib[key] })) if ((ia[key] || {})[k] !== (ib[key] || {})[k]) out.push(`${key} ${k}: ${(ia[key] || {})[k] ?? "-"} → ${(ib[key] || {})[k] ?? "-"}`);
if (ia.words !== ib.words) out.push(`words: ${ia.words ?? "-"} → ${ib.words ?? "-"}`);
const [ra, rb] = [read(a, "redline.json"), read(b, "redline.json")];
for (const k of ["near", "far"]) if ((ra[k] || []).length !== (rb[k] || []).length) out.push(`redline ${k}: ${(ra[k] || []).length} → ${(rb[k] || []).length}`);
console.log(out.length ? out.join("\n") : "Nothing measured changed.");
EOF
  exit
fi

all="" url="-" try="" page=""
while [ $# -gt 0 ]; do
  case "$1" in
    --all) all=1; shift ;;
    --url) [ $# -ge 2 ] || usage; url="$2"; shift 2 ;;
    --try) try=1; shift ;;
    -h|--help|--*) usage ;;
    *) break ;;
  esac
done
[ $# -ge 1 ] && [ $# -le $((${#try} ? 3 : 2)) ] || usage
out="$1"
region="${2:-}"
fixcss="${3:-}"
command -v agent-browser >/dev/null && command -v node >/dev/null || { echo "measure.sh needs agent-browser and node" >&2; exit 1; }
if [ -n "$try" ]; then
  [ -f "$out/min-checks.json" ] && [[ "$region" =~ ^[0-9]+$ ]] && { [ -z "$fixcss" ] || [ -f "$fixcss" ]; } || usage
  n="$region"
  region="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).region || "")' "$out/min-checks.json")"
  page="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).url || "")' "$out/min-checks.json")"
  out="$(mktemp -d)"
fi
if [ "$url" != "-" ] && [ -f "$url" ]; then url="file://$(cd "$(dirname "$url")" && pwd)/$(basename "$url")"; fi

session="${AGENT_BROWSER_SESSION:-default}"
export AGENT_BROWSER_SESSION="$session"
if ! agent-browser session list 2>/dev/null | grep -Eq "(^|[[:space:]])$session\$"; then
  # --try reopens the page the checks came from, and closes the session it opened.
  if [ -n "$try" ] && [ "$url" = "-" ] && [ -n "$page" ]; then url="$page"; fi
  [ "$url" != "-" ] || { echo "No open page in agent-browser session '$session'; pass --url." >&2; exit 1; }
  [ -z "$try" ] || trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
elif [ -n "$try" ] && [ "$url" = "-" ] && [ -n "$page" ] && [ "$(agent-browser get url)" != "$page" ]; then
  url="$page"
fi
mkdir -p "$out"
ab() { agent-browser "$@" >/dev/null; }
ab set viewport "${WIDTH:-1440}" "${HEIGHT:-900}"
if [ "$url" != "-" ]; then ab open "$url"; fi
case "$(agent-browser get url)" in about:blank | "") echo "No open page in agent-browser session '$session'; pass --url." >&2; exit 1 ;; esac
ab wait 300
layer="window.__axesLayer = undefined;"
if [ -n "$region" ]; then
  layer="window.__axesLayer = $(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$region");"
  ab eval "$layer [...document.querySelectorAll(window.__axesLayer)].find((el) => el.getClientRects().length)?.scrollIntoView({ block: 'nearest' })"
fi

# run <script> <name> [setup]: evaluate the script on the region and save its JSON.
run() {
  agent-browser eval "$layer ${3:-} $(cat "$here/$1.js")" |
    node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{let v=s;try{while(typeof v==="string")v=JSON.parse(v);process.stdout.write(JSON.stringify(v,null,1))}catch{process.stdout.write(s)}})' >"$out/$2.json"
}
shot() { ab screenshot "$out/$1.png"; }
rerun() {
  run redline redline "window.__redlineLive = false;" && ab eval "window.__redlineClear()"
  run count count && ab eval "window.__countClear()"
  run view view-bands "window.__view = 'bands';" && ab eval "window.__viewClear()"
}

if [ -n "$try" ]; then
  # A fix may change only its own elements. The printed `apply` names them (the holders). The CSS
  # under test (the printed `apply`, or the agent's own fix.css, injected as written, @media and
  # all) may match only the holders, their contents, and their ancestors, a pseudo-element counting
  # as its element. Its effect is judged at WIDTH and WIDTH - 160:
  #   style   every computed property of every element of the region, its ancestors, and their
  #           pseudo-elements stays, except the printed properties and layout properties on the
  #           holders, the printed properties inside them, and layout properties on their ancestors;
  #   place   boxes outside the holders move no more than the holders grow or shrink (+ 2px), and
  #           docked boxes stay docked;
  #   text    every text shows whole where it is: not cut, clipped, covered, out of its card, or run
  #           into other text, and in no new box that hides overflow.
  # The three scripts rerun at WIDTH judge the check itself: gone, and nothing new at 0.5.
  check="$(node -e 'const f = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).checks[process.argv[2] - 1]; if (!f) process.exit(1); process.stdout.write(JSON.stringify(f))' "$1/min-checks.json" "$n")" || { echo "No check $n in $1/min-checks.json" >&2; exit 1; }
  rules="$(node -e 'process.stdout.write(JSON.stringify(JSON.parse(process.argv[1]).apply || []))' "$check")"
  [ "$rules" != "[]" ] || { echo "Check $n has no apply: its fix needs markup. Make the edit in the code and run measure.sh again." >&2; exit 1; }
  if [ -n "$fixcss" ]; then css="$(cat "$fixcss")"; else css="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).map((a) => `${a.selector} { ${a.property}: ${a.value}; }`).join("\n"))' "$rules")"; fi
  json() { node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$1"; }
  W="${WIDTH:-1440}" H="${HEIGHT:-900}"
  N=$((W - 160))
  # Freeze the page so only the fix moves things: animations paused, the page's timers cleared
  # (reload it afterwards to resume them).
  ab eval "(() => { const s = document.createElement('style'); s.id = '__freeze'; s.textContent = '*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }'; document.head.append(s); const top = setTimeout(() => {}, 0); for (let i = 0; i <= top; i++) { clearTimeout(i); clearInterval(i); } window.requestAnimationFrame = () => 0; })()"
  read -r -d '' setup <<'JS' || true
(() => {
  const layer = [...document.querySelectorAll(window.__axesLayer || "main")].find((el) => el.getClientRects().length) || document.body;
  const holders = [...new Set(window.__tryApply.flatMap((a) => [...document.querySelectorAll(a.selector)]))];
  window.__tryHolders = holders;
  // The CSS as written, off until the fix is applied, every declaration made !important.
  const s = document.createElement("style");
  s.id = "__try";
  s.textContent = window.__tryCss;
  document.head.append(s);
  s.sheet.disabled = true;
  const rules = [];
  const each = (list) => { for (const r of list) { if (r.style && r.selectorText) { rules.push(r); r.style.cssText = r.style.cssText.split(/;(?![^(]*\))/).filter((d) => d.trim()).map((d) => d.replace(/\s*!important\s*$/, "") + " !important").join("; "); } if (r.cssRules) each(r.cssRules); } };
  each(s.sheet.cssRules);
  const host = (q) => q.replace(/::?(before|after|first-line|first-letter)\b|::[a-z-]+(\([^)]*\))?/gi, "") || "*";
  const name = (e) => e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/)[0] : "") + ` "${(e.innerText || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24)}"`;
  const edits = new Set(), bad = [];
  for (const r of rules) { try { document.querySelectorAll(host(r.selectorText)).forEach((e) => edits.add(e)); } catch { bad.push(r.selectorText); } }
  const outside = [...edits].filter((e) => !holders.some((h) => h === e || h.contains(e) || (e.contains(h) && layer.contains(e))));
  // Computed style, by role: the properties a fix may change on the holders, inside them, and on
  // their ancestors. Geometry (sizes, insets, grid tracks) is the place rule's job.
  const longhands = (p, v) => { const st = document.createElement("div").style; st.setProperty(p, v); return [...st].length ? [...st] : [p]; };
  const base = (p) => p.replace(/-(inline|block)(-(start|end))?$|-(left|right|top|bottom)$/, "");
  const printed = new Set(window.__tryApply.flatMap((a) => longhands(a.property, a.value)).map(base));
  const layout = /^(padding|margin|gap|row-gap|column-gap|align-|justify-|place-|flex|order|grid-(row|column|area|auto-flow)|(min|max)-(width|height|inline-size|block-size)|box-sizing|display|white-space|text-wrap|overflow-wrap|word-wrap|word-break|hyphens|vertical-align)/;
  // Layout properties that inherit: inside a holder they follow it.
  const inherits = /^(white-space|white-space-collapse|text-wrap.*|overflow-wrap|word-wrap|word-break|hyphens)$/;
  const geometry = /^(width|height|inline-size|block-size|top|right|bottom|left|inset.*|transform-origin|perspective-origin|grid-template-(columns|rows)|x|y|cx|cy|r|rx|ry|d)$/;
  const props = [...getComputedStyle(document.documentElement)].filter((p) => !geometry.test(p));
  const ci = props.indexOf("color"), margins = props.flatMap((p, i) => (p.startsWith("margin") ? [i] : []));
  const pseudo = { "::before": null, "::after": null, "::first-line": null, "::first-letter": null, "::placeholder": "input, textarea", "::marker": "li, summary" };
  const els = [...layer.querySelectorAll("*")];
  for (let n = layer; n; n = n.parentElement) els.unshift(n);
  const read = (cs) => props.map((p) => cs.getPropertyValue(p));
  // Margins as computed, so an auto margin stays auto while the space it fills changes.
  const own = (e) => { const v = read(getComputedStyle(e)), m = e.computedStyleMap(); for (const i of margins) v[i] = String(m.get(props[i])); return v; };
  window.__tryStyle = () => new Map(els.map((e) => [e, Object.fromEntries([["", own(e)], ...Object.entries(pseudo).filter(([, only]) => !only || e.matches(only)).map(([p]) => [p, read(getComputedStyle(e, p))])])]));
  window.__tryDiff = (A, B) => {
    const out = [], own = new Set();
    for (const [e, a] of A) {
      const b = B.get(e), role = holders.includes(e) ? "holder" : holders.some((h) => h.contains(e)) ? "inside" : holders.some((h) => e.contains(h)) && layer.contains(e) ? "ancestor" : "outside";
      own.clear();
      for (const p of Object.keys(a)) {
        const x = a[p], y = b[p];
        for (let i = 0; i < props.length; i++) {
          if (x[i] === y[i]) continue;
          // A property that follows the text color (currentcolor) changes with it.
          let prop = x[i] === x[ci] && y[i] === y[ci] ? "color" : props[i];
          const ok = p ? (role === "holder" || role === "inside") && printed.has(base(prop)) : role === "holder" ? printed.has(base(prop)) || layout.test(prop) : role === "inside" ? printed.has(base(prop)) || inherits.test(prop) : role === "ancestor" ? layout.test(prop) : false;
          // A pseudo-element that only inherits its element's change says nothing new.
          if (!p) own.add(prop);
          if (!ok && !(p && own.has(prop))) out.push(`${name(e)}${p} ${prop} ${prop === props[i] ? x[i] : x[ci]} → ${prop === props[i] ? y[i] : y[ci]}`);
        }
      }
    }
    return [...new Set(out)];
  };
  return JSON.stringify({ holders: holders.length, outside: outside.length, names: outside.slice(0, 3).map(name), bad });
})()
JS
  scope="$(agent-browser eval "$layer window.__tryApply = $rules; window.__tryCss = $(json "$css"); $setup")"
  read -r -d '' snap <<'JS' || true
(() => {
  const layer = [...document.querySelectorAll(window.__axesLayer || "main")].find((el) => el.getClientRects().length);
  if (!layer) return JSON.stringify({ error: "region not on this page" });
  const holders = window.__tryHolders || [];
  const under = (k) => (holders.some((h) => h.contains(k)) ? 1 : 0);
  const area = (q) => Math.max(0, q.right - q.left) * Math.max(0, q.bottom - q.top);
  const painted = (cs) => { const bg = cs.backgroundColor.match(/[\d.]+/g) || []; return (bg.length === 3 || +bg[3] > 0.05) || ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none") || cs.boxShadow !== "none"; };
  const name = (k) => `${k.parentElement.tagName.toLowerCase()} > ${k.tagName.toLowerCase()}${typeof k.className === "string" && k.className.trim() ? "." + k.className.trim().split(/\s+/)[0] : ""}`;
  const boxes = {}, text = {}, lines = [];
  // Every shown box by its child-index path, in page coordinates: under a holder, holds one, its
  // gap to its parent's inner bottom and right edges, and whether layout pins it there.
  // Every element with its own text: its area, the part inside every box that clips it (overflow,
  // contain, clip-path, mask), its label, how many such boxes, the share of its sample points
  // that hit it, and whether it sits inside its painted box.
  const walk = (el, path, clips, box) => [...el.children].forEach((k, i) => {
    if (/^(SCRIPT|STYLE|TEMPLATE)$/.test(k.tagName)) return;
    const p = `${path}/${i}`, r = k.getBoundingClientRect(), ks = getComputedStyle(k);
    const q = el.getBoundingClientRect(), cs = getComputedStyle(el), side = (s) => parseFloat(cs[`border${s}Width`]) + parseFloat(cs[`padding${s}`]);
    const flex = /flex/.test(cs.display), column = cs.flexDirection.startsWith("column");
    const pinned = (down) => (/absolute|fixed|sticky/.test(ks.position) && ks[down ? "bottom" : "right"] !== "auto") ||
      (flex && column === down && (/end|space-between/.test(cs.justifyContent) || [...el.children].slice(0, i).some((s) => parseFloat(getComputedStyle(s).flexGrow) > 0))) ||
      (flex && column !== down && /end/.test(ks.alignSelf === "auto" ? cs.alignItems : ks.alignSelf));
    const whole = /paint|content|strict/.test(ks.contain) || ks.clipPath !== "none" || (ks.maskImage || "none") !== "none";
    const cx = whole || /hidden|clip/.test(ks.overflowX), cy = whole || /hidden|clip/.test(ks.overflowY);
    const inner = cx || cy ? [...clips, [r, cx, cy]] : clips;
    const paint = painted(ks) ? r : box;
    if (r.width || r.height) boxes[p] = [r.left + scrollX, r.top + scrollY, r.width, r.height, under(k), holders.some((h) => k.contains(h)) ? 1 : 0, name(k), q.bottom - side("Bottom") - r.bottom, q.right - side("Right") - r.right, pinned(true) ? 1 : 0, pinned(false) ? 1 : 0];
    const own = [...k.childNodes].filter((t) => t.nodeType === 3 && t.data.trim());
    if (own.length) {
      let all = 0, seen = 0, hits = 0, tries = 0, inside = 1;
      for (const t of own) {
        const range = document.createRange();
        range.selectNodeContents(t);
        for (const g of range.getClientRects()) {
          if (!g.width || !g.height) continue;
          all += area(g);
          const v = { left: g.left, right: g.right, top: g.top, bottom: g.bottom };
          for (const [c, x, y] of inner) { if (x) { v.left = Math.max(v.left, c.left); v.right = Math.min(v.right, c.right); } if (y) { v.top = Math.max(v.top, c.top); v.bottom = Math.min(v.bottom, c.bottom); } }
          seen += area(v);
          lines.push([p, g.left, g.top, g.right, g.bottom]);
          if (paint && (g.left < paint.left - 1 || g.right > paint.right + 1 || g.top < paint.top - 1 || g.bottom > paint.bottom + 1)) inside = 0;
          for (const f of [0.2, 0.5, 0.8]) {
            const x = g.left + (g.right - g.left) * f, y = (g.top + g.bottom) / 2;
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
            tries++;
            const hit = document.elementFromPoint(x, y);
            if (hit && (hit === k || k.contains(hit))) hits++;
          }
        }
      }
      text[p] = [all, ks.visibility === "visible" ? seen : 0, (k.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), inner.length, tries ? +(hits / tries).toFixed(2) : -1, under(k), inside];
    }
    walk(k, p, inner, paint);
  });
  walk(layer, "", [], painted(getComputedStyle(layer)) ? layer.getBoundingClientRect() : null);
  // Pairs of texts whose lines overlap.
  lines.sort((a, b) => a[2] - b[2]);
  const over = new Set();
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length && lines[j][2] < lines[i][4] - 1; j++) {
      const [a, l1, , r1, b1] = lines[i], [b, l2, t2, r2] = lines[j];
      if (a === b || a.startsWith(b + "/") || b.startsWith(a + "/")) continue;
      if (Math.min(r1, r2) - Math.max(l1, l2) > 1 && Math.min(b1, lines[j][4]) - t2 > 1) over.add([a, b].sort().join(" "));
    }
  // The holders, then their containers up to the region.
  const frame = [...holders];
  for (const h of holders) for (let a = h.parentElement; a && a !== layer.parentElement; a = a.parentElement) if (!frame.includes(a)) frame.push(a);
  const sizes = frame.map((h) => { const r = h.getBoundingClientRect(); return [r.width, r.height]; });
  // What each shares with its siblings (an outer edge, its width or height) and, when it holds
  // elements, with its parent's content box (flush on a side), within 1px. Containers keep only
  // the lines across (a fix may make them taller); a text-only holder may hug its text (a halo
  // behind a chart label).
  const shared = frame.map((h, i) => {
    const r = h.getBoundingClientRect(), p = h.parentElement, sibs = [...(p?.children || [])].filter((s) => s !== h && s.getClientRects().length).map((s) => s.getBoundingClientRect());
    const pr = p?.getBoundingClientRect(), ps = p && getComputedStyle(p), inner = (e) => pr[e] + (e === "left" || e === "top" ? 1 : -1) * (parseFloat(ps[`padding${e[0].toUpperCase()}${e.slice(1)}`]) + parseFloat(ps[`border${e[0].toUpperCase()}${e.slice(1)}Width`]));
    const own = i < holders.length;
    return [
      ...(own ? ["left", "right", "top", "bottom"] : ["left", "right"]).filter((e) => sibs.some((q) => Math.abs(q[e] - r[e]) <= 1)).map((e) => `${e} edge with a sibling`),
      ...(own ? ["width", "height"] : ["width"]).filter((d) => sibs.some((q) => Math.abs(q[d] - r[d]) <= 1)).map((d) => `${d} with its siblings`),
      ...(pr && h.children.length ? ["left", "right"].filter((e) => Math.abs(inner(e) - r[e]) <= 1).map((e) => `${e} edge flush with its parent`) : []),
    ];
  });
  return JSON.stringify({ boxes, text, over: [...over], sizes, shared, names: frame.map(name), held: holders.length });
})()
JS
  snapshot() { agent-browser eval "$layer $snap" >"$out/$1.boxes"; }
  styles() { ab eval "window.__trySeen = window.__trySeen || {}; window.__trySeen['$1'] = window.__tryStyle();"; }
  restyled() { agent-browser eval "JSON.stringify(window.__tryDiff(window.__trySeen['$1'], window.__tryStyle()))" >"$out/$2.styles"; }
  snapshot before && styles wide
  ab wait 400
  snapshot still
  rerun && mkdir -p "$out/before" && mv "$out"/*.json "$out/before/"
  ab set viewport "$N" "$H" && ab wait 300
  snapshot narrow-before && styles narrow
  ab eval "document.getElementById('__try').sheet.disabled = false"
  ab wait 200
  snapshot narrow-after && restyled narrow narrow
  ab set viewport "$W" "$H" && ab wait 300
  snapshot after && restyled wide wide
  rerun
  ab eval "document.getElementById('__try')?.remove(); document.getElementById('__freeze')?.remove(); window.__tryApply = window.__tryCss = window.__tryHolders = window.__tryStyle = window.__tryDiff = window.__trySeen = undefined;"
  status=0
  node - "$out" "$check" "$scope" "$N" "${fixcss:+$(basename "$fixcss")}" <<'EOF' || status=$?
const fs = require("node:fs");
const path = require("node:path");
const [out, raw, scopeRaw, narrow, file] = process.argv.slice(2);
const f = JSON.parse(raw);
const read = (p) => { let v = fs.readFileSync(p, "utf8"); while (typeof v === "string") v = JSON.parse(v); return v; };
const keys = (dir, min) => ["redline", "count", "view-bands"].flatMap((t) => (read(path.join(dir, `${t}.json`)).checks || []).filter((x) => x.score >= min).map((x) => `${x.kind} ${x.where}`));
const before = new Set(keys(path.join(out, "before"), 0.5)), after = keys(out, 0.5);
const key = `${f.kind} ${f.where}`;
let scope = scopeRaw;
while (typeof scope === "string") scope = JSON.parse(scope);
const snaps = Object.fromEntries(["before", "still", "after", "narrow-before", "narrow-after"].map((s) => [s, read(path.join(out, `${s}.boxes`))]));
const broken = Object.values(snaps).find((s) => s.error);
if (broken) { console.log(`FAIL ${key}: ${broken.error}; open the page the checks came from.`); process.exit(1); }
const list = (xs, what) => (xs.length ? [`${xs.length} ${what}: ${xs.slice(0, 4).join(", ")}${xs.length > 4 ? ", …" : ""}`] : []);
const whole = (t) => t && t[0] > 0 && t[1] >= t[0] * 0.99;
// One width: A before, B after, S a second look before (what differs from A moves on its own).
const judge = (A, B, S, styles, at) => {
  // What the holders' change in size pushes along.
  const limit = Math.round(Math.max(0, ...A.sizes.slice(0, A.held).flatMap((s, i) => s.map((v, j) => Math.abs(B.sizes[i][j] - v))))) + 2;
  const steady = (p) => !S || (S.boxes[p] && A.boxes[p].slice(0, 4).every((v, i) => Math.abs(v - S.boxes[p][i]) <= 1));
  const calm = (p) => !S || JSON.stringify(S.text[p]) === JSON.stringify(A.text[p]);
  const moved = Object.entries(A.boxes).flatMap(([p, [x, y, w, h, held, holds, name, toBottom, toRight, pinB, pinR]]) => {
    if (held || !steady(p)) return [];
    const n = B.boxes[p];
    if (!n) return [`${name} disappeared`];
    const offB = pinB && Math.abs(toBottom) <= 2 && Math.abs(n[7]) > 2, offR = pinR && Math.abs(toRight) <= 2 && Math.abs(n[8]) > 2;
    if (offB || offR) return [`${name} came off its parent's ${offB ? "bottom" : "right"} edge`];
    const d = Math.max(Math.abs(n[0] - x), Math.abs(n[1] - y), ...(holds ? [] : [Math.abs(n[2] - w), Math.abs(n[3] - h)]));
    return d > limit ? [`${name} moved ${Math.round(d)}px`] : [];
  });
  const texts = Object.entries(A.text).filter(([p]) => calm(p) && B.text[p]);
  const cut = texts.filter(([p, t]) => whole(t) && !whole(B.text[p])).map(([, t]) => `"${t[2]}"`);
  const covered = texts.filter(([p, t]) => t[4] === 1 && B.text[p][4] >= 0 && B.text[p][4] < 1 && whole(B.text[p])).map(([, t]) => `"${t[2]}"`);
  const clippable = texts.filter(([p, t]) => whole(t) && whole(B.text[p]) && B.text[p][3] > t[3]).map(([, t]) => `"${t[2]}"`);
  const left = texts.filter(([p, t]) => t[6] && !B.text[p][6]).map(([, t]) => `"${t[2]}"`);
  const label = (p) => `"${(B.text[p] || A.text[p] || [, , p])[2]}"`;
  const was = new Set([...A.over, ...(S ? S.over : [])]);
  const runs = B.over.filter((pair) => !was.has(pair)).map((pair) => pair.split(" ").map(label).join(" over "));
  // A flush edge is lost only when the holder's width changed: a box that shrinks off its column,
  // not one the fix moves whole (centered).
  const lost = A.shared.flatMap((edges, i) =>
    edges.filter((e) => !B.shared[i].includes(e) && (!/flush/.test(e) || Math.abs(A.sizes[i][0] - B.sizes[i][0]) > 1)).map((e) => `${A.names[i]} ${e}`),
  );
  return [
    ...list(lost, "lost by the fix's elements or their containers"),
    ...list(styles, "style changes outside what the fix may change"),
    ...(moved.length ? [`${moved.length} boxes outside the fix moved (limit ${limit}px): ${moved.slice(0, 4).join(", ")}${moved.length > 4 ? ", …" : ""}`] : []),
    ...list(cut, "texts cut"),
    ...list(covered, "texts covered"),
    ...(S ? list(clippable, "texts now inside a box that hides overflow, which cuts them at another width or length") : []),
    ...list(left, "texts ran out of their card"),
    ...list(runs, "texts run into other text"),
  ].map((x) => (at ? `at ${at}px: ${x}` : x));
};
const wide = read(path.join(out, "wide.styles")), slim = read(path.join(out, "narrow.styles"));
const fails = [
  ...(scope.outside ? [`the CSS reaches ${scope.outside} ${scope.outside === 1 ? "element" : "elements"} outside the check's ${scope.holders}: ${scope.names.join(", ")}${scope.outside > 3 ? ", …" : ""}`] : []),
  ...(scope.bad.length ? [`selectors the check cannot resolve: ${scope.bad.join(", ")}`] : []),
  ...(keys(out, 0).includes(key) ? [`the check is still there`] : []),
  ...after.filter((k) => !before.has(k)).map((k) => `new at 0.5 or more: ${k}`),
  ...judge(snaps.before, snaps.after, snaps.still, wide, ""),
  ...judge(snaps["narrow-before"], snaps["narrow-after"], null, slim.filter((x) => !wide.includes(x)), narrow),
];
// A check under 0.5 is a note: the tools do not vouch for it, so its fix never passes.
const verdict = fails.length ? "FAIL" : f.score < 0.5 ? "NOTE" : "CLEAN";
console.log(`${verdict} ${key}: ${file || f.apply.map((r) => `${r.selector} { ${r.property}: ${r.value} }`).join(" ")}`);
for (const x of fails) console.log(`  ${x}`);
if (verdict === "NOTE") console.log(`  nothing measured got worse, but at score ${f.score} this is a note; judge it by eye.`);
if (verdict === "CLEAN") console.log("  the check is gone and nothing else measured changed; look at the page before you call the fix good.");
process.exitCode = { CLEAN: 0, FAIL: 1, NOTE: 2 }[verdict];
EOF
  rm -rf "$out"
  exit $status
fi

# Finish what animates in (a fade, a slide) so every image shows the page at rest.
ab eval "document.getAnimations().forEach((a) => { try { a.finish(); } catch {} })" && ab wait 100
shot page
run redline redline "window.__redlineLive = false; window.__redline = undefined;" && shot redline && ab eval "window.__redlineClear()"
run count count && shot count && ab eval "window.__countClear()"
for v in bands ${all:+lead grid wireframe notext textonly long many}; do
  run view "view-$v" "window.__view = '$v';" && shot "view-$v" && ab eval "window.__viewClear()"
done

# Rank every script's checks, those at score 0.5 or more first, then by score x family (layout
# before composition before alignment before tokens), and print only those at 0.5 or more: nothing
# under it has been a real problem. Each line's number is its place in min-checks.json, for --try;
# checks of one kind with the same edit print as one line naming every holder. The list is the
# floor: the last line sends the reader to the images.
node - "$out" "$region" "$(agent-browser get url)" <<'EOF'
const fs = require("node:fs");
const path = require("node:path");
const [out, region, url] = process.argv.slice(2);
const family = { rhythm: "layout", "dead-zone": "layout", collision: "layout", break: "layout", sibling: "composition", crowding: "composition", edge: "alignment", baseline: "alignment", inset: "alignment", control: "tokens", contrast: "tokens" };
const weight = { layout: 1, composition: 0.9, alignment: 0.85, tokens: 0.7 };
const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(out, f), "utf8")); } catch { return {}; } };
const found = ["redline", "count", "view-bands"].flatMap((tool) =>
  (read(`${tool}.json`).checks || []).map((f, i) => {
    const fam = family[f.kind] || "tokens";
    return { ...f, tool, n: i + 1, family: fam, rank: +(f.score * weight[fam]).toFixed(3) };
  }),
).sort((a, b) => (b.score >= 0.5) - (a.score >= 0.5) || b.rank - a.rank);
const open = found.filter((f) => f.score >= 0.5);
const byFamily = Object.keys(weight).map((k) => [k, open.filter((f) => f.family === k).length]).filter(([, n]) => n);
const heading = `Minimum checks: ${open.length ? `${byFamily.map(([k, n]) => `${n} ${k}`).join(", ")}${byFamily[0][0] === "layout" ? "; fix layout before parts" : ""}` : "none at score 0.5 or more"}.`;
const stress = ["long", "many"].map((v) => [v, read(`view-${v}.json`).broke]).filter(([, b]) => b);
const breaks = ([v, b]) => `${v} ${b.length} new breaks${b.length ? ` (${b.slice(0, 3).map((x) => `${x.at} ${x.kind}${x.n > 1 ? ` x${x.n}` : ""}`).join(", ")}${b.length > 3 ? ", …" : ""})` : ""}`;
fs.writeFileSync(path.join(out, "min-checks.json"), JSON.stringify({ url, region, total: found.length, checks: found }, null, 1));
const edit = (f) => (f.apply?.length ? `${f.kind} ${f.apply.map((a) => `${a.property}:${a.value}`).sort().join(";")}` : `${f.tool} ${f.n}`);
const groups = [...open.reduce((m, f) => m.set(edit(f), [...(m.get(edit(f)) || []), f]), new Map()).values()];
const line = ([f, ...more]) =>
  `${found.indexOf(f) + 1}. ${f.kind} (${f.tool} #${[f, ...more].map((x) => x.n).join(", #")}, ${+f.score.toFixed(2)}) ${f.where}${f.text ? ` "${f.text}"` : ""}: ${f.off ? `off ${f.off} from` : "unlike"} ${f.against}. ${f.fix}${more.length ? ` Same edit on ${more.map((x) => x.where).join(", ")}.` : ""}`;
const shown = groups.slice(0, 10);
const rest = found.length - shown.flat().length;
const look = `Now look at ${path.join(out, "redline.png")} and ${path.join(out, "view-bands.png")} yourself, region by region at 2x: these checks are the floor, the images show what no check names.`;
console.log([heading, ...shown.map(line), ...(rest ? [`${rest} more under score 0.5 or past the top 10 in min-checks.json; measure.sh --try ${out} <n> tries a fix.`] : []), ...(stress.length ? [`Stress: ${stress.map(breaks).join("; ")}.`] : []), look].join("\n"));
EOF
echo "$out: $(ls "$out" | wc -l | tr -d ' ') files"
