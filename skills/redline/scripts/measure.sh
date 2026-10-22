#!/usr/bin/env bash
# Measure a page or one region with every script; save the numbers and screenshots.
#   measure.sh <url-or-file> <out-dir> [region-selector]
#   measure.sh --compare <before-dir> <after-dir>    prints every number that changed
# Needs agent-browser and node. Window size from WIDTH and HEIGHT (1440x900).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

if [ "${1:-}" = "--compare" ]; then
  node - "$2" "$3" <<'EOF'
const fs = require("node:fs");
const path = require("node:path");
const [a, b] = process.argv.slice(2);
// Every number in a result, by its path: counts, distinct, oneOffs, offToken, before, after, frame.
const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o ?? {})) {
    const key = p ? `${p}.${k}` : k;
    if (typeof v === "number") out[key] = v;
    else if (v && typeof v === "object" && !Array.isArray(v)) flat(v, key, out);
  }
  return out;
};
const read = (f) => (fs.existsSync(f) ? flat(JSON.parse(fs.readFileSync(f, "utf8"))) : {});
for (const f of fs.readdirSync(b).filter((f) => f.endsWith(".json")).sort()) {
  const [before, after] = [read(path.join(a, f)), read(path.join(b, f))];
  for (const k of Object.keys({ ...before, ...after }))
    if (before[k] !== after[k]) console.log(`${f.slice(0, -5)} ${k}: ${before[k] ?? "-"} → ${after[k] ?? "-"}`);
}
EOF
  exit
fi

url="$1"
out="$2"
region="${3:-}"
[ -f "$url" ] && url="file://$(cd "$(dirname "$url")" && pwd)/$(basename "$url")"
mkdir -p "$out"
export AGENT_BROWSER_SESSION="design-measure-$$"
trap 'agent-browser close >/dev/null 2>&1 || true' EXIT
ab() { agent-browser "$@" >/dev/null; }
ab set viewport "${WIDTH:-1440}" "${HEIGHT:-900}"
ab open "$url"
ab wait 300
layer="window.__axesLayer = undefined;"
if [ -n "$region" ]; then
  layer="window.__axesLayer = $(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$region");"
  ab scrollintoview "$region"
fi

# run <script> <name> [setup]: evaluate the script on the region and save its JSON.
run() {
  agent-browser eval "$layer ${3:-} $(cat "$here/$1.js")" |
    node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{try{process.stdout.write(JSON.stringify(JSON.parse(JSON.parse(s)),null,1))}catch{process.stdout.write(s)}})' >"$out/$2.json"
}
shot() { ab screenshot "$out/$1.png"; }

shot page
run layout-meter meter && shot meter && ab eval "window.__axesClear()"
run heatmap heatmap && shot heatmap && ab eval "window.__heatClear()"
run text text
run inventory inventory
for v in far wireframe notext textonly nolines; do
  run views "view-$v" "window.__view = '$v';" && shot "view-$v" && ab eval "window.__viewClear()"
done
for m in long many; do
  run stress "stress-$m" "window.__stress = '$m';" && shot "stress-$m" && ab eval "window.__stressClear()"
done
echo "$out: $(ls "$out" | wc -l | tr -d ' ') files"
