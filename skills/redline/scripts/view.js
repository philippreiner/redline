// View: see the screen without its details, or under stress. Set window.__view first:
//   "wireframe" every box grey in its own tone, text as bars, icons as blocks, checked controls
//               filled: do the layout and the balance hold without content?
//   "notext"    text erased, each line covered with the fill painted under it; fills, boxes,
//               and icons kept: is the structure clear?
//   "textonly"  boxes, lines, fills, and icons stripped, text in place, checked controls
//               filled: do the groups hold together with space and type alone?
//   "lead"      the squint test: what does the eye land on first, and is it what the
//               screen is for? The layer blurred grey, its three heaviest things lettered
//               A B C with their share; weight is density, (contrast x ink)^2 x sqrt(area),
//               a chip, button, or chart weighing as one. Decoration is outlined dashed and
//               never leads. No checks.
//   "bands"     the minimum checks for rhythm and balance, per column: the vertical gaps between blocks tinted by
//               role, from structure (section: between siblings of the column's outermost
//               stack; row: between repeated siblings, one tag and class; inner: anything
//               else, such as inside a card; above or below a heading; insets grey) and the
//               gutters between side-by-side boxes with nothing between them. Checks, each 4px or more
//               off: a heading with less space above than below, same-role gaps or gutters
//               apart, except a wider gap after a card's edge (rhythm); a painted box leaving
//               120px or more empty on one side whose siblings share neither its width nor its
//               share of content, or an empty run in a column of 200px and 3x its largest
//               section gap (dead-zone); text running into other text, across a box edge, or
//               under an icon (collision); at rest, text cut with no ellipsis, a short value (a
//               date, ID, number, amount, a few words) or one its column's other values show
//               whole cut to an ellipsis, an ID-like token wrapped inside itself, or a label
//               struck by a line, chart labels included (break; its fix is tried in place first,
//               its text names every label it holds). Charts and data are one block. Badges sit off the text they flag; gap and
//               gutter labels take a spot clear of text, data, and other labels, else are left out.
//   "grid"      an 8px grid from the layer's content-box corner, the column edges, and the
//               edges three or more things in one card or column share (right edges only of boxes
//               that span their parent, not chips), drawn over that card or column only, both
//               heavier than the grid; across each row of side-by-side boxes, in orange, card tops
//               and bottoms (faint) and the card edges and header baselines (dashed) two or more
//               of them share, strong and joined across the gutters; no checks.
//   "long"      every text grows by 80% the way a longer language does: a phrase by longer
//               words and extra words, a single word as one long compound, word boundaries kept;
//               counts outside data and not before a % grow to thousands; other digits and key
//               hints (⌘K) keep their shape; placeholders grow too
//   "many"      the first visible list repeats its rows up to window.__stressRows (50), the
//               copies after its last row in view that no divider follows, so they land in
//               view and its other children (a NOW line) keep their neighbours
// lead, bands, grid, long, and many read the layer (window.__axesLayer, else the last open
// dialog or sheet, else main, else the body); bands returns checks
// ({ kind, where, text, against, off, fix, apply, count, score }), numbered 1..N on the overlay;
// apply is the fix as [{ selector, property, value }], each selector from exact() (only the elements
// the fix means, and others that already have the value), [] when the fix is a markup edit.
// long and many change it in place and count
// what breaks, before and after: text cut by a box that hides its overflow, or a placeholder wider
// than its field (clipped), an
// ID-like token wrapped inside itself (wraps), or running into other text, across the edge
// of a filled box or an icon, or struck by a line (overlaps); an
// ellipsis or a line clamp that renders is designed and not counted here (an inline-block,
// inline-flex, or inline-grid between the text and the clip cuts hard). wireframe, notext,
// and textonly cover the whole page,
// or window.__axesLayer (an element or a selector). Screenshot after it runs;
// window.__viewClear() restores the page.
(() => {
  const mode = window.__view;
  const views = ["wireframe", "notext", "textonly", "lead", "bands", "grid", "long", "many"];
  if (!views.includes(mode))
    return JSON.stringify({
      error: `set window.__view to one of: ${views.join(", ")}`,
    });
  const set = window.__axesLayer;
  const target = (typeof set === "string" ? [...document.querySelectorAll(set)].find((el) => el.getClientRects().length) : set) || document.documentElement;
  window.__viewClear?.();
  const layer =
    (typeof set === "string" ? [...document.querySelectorAll(set)].find((el) => el.getClientRects().length) : set) ||
    [...document.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    [...document.querySelectorAll('main, [role="main"], [data-slot="sidebar-inset"]')].find((el) => el.getClientRects().length) ||
    document.body;
  // Scene (the same block in redline.js, count.js, and view.js; change all three together).
  // Needs `layer`. sel(el) names an element the way an agent can search the code for it: by its own
  // handle (an id, data-slot, data-testid, or its rarest class that is not a utility class), else by
  // the nearest ancestor with one: `div.rtime > span`, `ul[data-slot="list"] h2`.
  const firstClass = (n) => (typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/)[0] : "");
  const utility = (c) =>
    /[:/[@!.]|^-/.test(c) ||
    /^(?:flex|grid|block|inline|inline-block|inline-flex|inline-grid|contents|hidden|table|relative|absolute|fixed|sticky|static|truncate|italic|uppercase|lowercase|capitalize|underline|sr-only|group|peer|container|isolate|shrink|grow|border|rounded|shadow|outline|ring|transition|transform|filter|blur|antialiased)$/.test(
      c,
    ) ||
    /^(?:shrink|grow|basis|order|col|row|gap|space|[pm][xytrblse]?|w|h|size|min|max|inset|top|right|bottom|left|start|end|z|text|font|leading|tracking|bg|from|via|to|border|divide|outline|ring|rounded|shadow|opacity|items|justify|content|self|place|overflow|object|aspect|whitespace|break|line|list|cursor|select|pointer|transition|duration|ease|delay|animate|transform|scale|rotate|translate|fill|stroke|align|float|clear|decoration|indent|columns|snap|scroll|touch|resize|appearance|will|accent|caret|backdrop|blur|filter|drop|mix|grid|flex|inline|sr|not|line-clamp)-/.test(
      c,
    );
  const handle = (n) => {
    if (n.id && !/:|\d{3,}/.test(n.id)) return `#${CSS.escape(n.id)}`;
    for (const a of ["data-slot", "data-testid"]) if (n.getAttribute(a)) return `[${a}="${n.getAttribute(a)}"]`;
    const own = (typeof n.className === "string" ? n.className.trim().split(/\s+/) : []).filter((c) => c && !utility(c));
    return own.length ? "." + CSS.escape(own.sort((a, b) => document.getElementsByClassName(a).length - document.getElementsByClassName(b).length)[0]) : "";
  };
  const tagged = (n) => n.tagName.toLowerCase() + handle(n);
  const sel = (el) => {
    const top = (n) => !n || n === document.body || n === document.documentElement;
    if (!handle(el)) for (let n = el.parentElement, d = 0; !top(n) && d < 4; n = n.parentElement, d++) if (handle(n)) return `${tagged(n)}${d ? " " : " > "}${tagged(el)}`;
    return top(el.parentElement) ? tagged(el) : `${tagged(el.parentElement)} > ${tagged(el)}`;
  };
  // exact(els, tries, same) is a selector for a fix's `apply` that matches every element of els and
  // nothing else, except elements that already have the value (same(m) true): the first of tries that
  // does, else the sel() names, else per element its sel() name with :nth-child(), else a
  // :nth-child() path. null when nothing does; then
  // the fix gets `apply: []` and says which other elements its name matches.
  const exact = (els, tries = [], same = () => false) => {
    const want = new Set(els);
    const fits = (q) => {
      try {
        const ms = [...document.querySelectorAll(q)];
        return els.every((e) => ms.includes(e)) && ms.every((m) => want.has(m) || same(m));
      } catch {
        return false;
      }
    };
    const one = (el) => {
      const named = el.parentElement ? `${sel(el)}:nth-child(${[...el.parentElement.children].indexOf(el) + 1})` : sel(el);
      const hit = document.querySelectorAll(named);
      if (hit.length === 1 && hit[0] === el) return named;
      let q = "";
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const nth = n.parentElement ? `:nth-child(${[...n.parentElement.children].indexOf(n) + 1})` : "";
        for (const step of [tagged(n), tagged(n) + nth]) {
          const s = q ? `${step} > ${q}` : step;
          const ms = document.querySelectorAll(s);
          if (ms.length === 1 && ms[0] === el) return s;
        }
        q = q ? `${tagged(n)}${nth} > ${q}` : tagged(n) + nth;
      }
      return null;
    };
    for (const q of [...tries, [...new Set(els.map(sel))].join(", ")]) if (q && fits(q)) return q;
    const each = els.map(one);
    return each.every(Boolean) && fits(each.join(", ")) ? each.join(", ") : null;
  };
  // Data is one thing, not layout: anything in a chart (svg over 32px, canvas, [role=img], progress,
  // meter); a run of four or more textless siblings of one kind that vary along one axis only (bars of
  // a chart or waveform: one width up to 64px and many heights, or one height up to 32px and many
  // widths), what sits over such a run (a playhead), and axis labels beside it; two or more siblings of
  // one kind that overlap in a row (an avatar stack); and a filled circle up to 40px holding one to
  // three capitals (an avatar).
  const kindOf = (n) => n.tagName + firstClass(n);
  const dataEls = new Set(),
    barRuns = new Set();
  for (const el of [layer, ...layer.querySelectorAll("*")]) {
    const box = el.getBoundingClientRect(),
      look = getComputedStyle(el);
    if (
      box.width &&
      box.width <= 40 &&
      Math.abs(box.width - box.height) <= 1 &&
      parseFloat(look.borderTopLeftRadius) >= box.width / 2 - 1 &&
      /^\p{Lu}{1,3}$/u.test(el.textContent.trim()) &&
      !/rgba?\([^)]*,\s*0\)|transparent/.test(look.backgroundColor)
    )
      dataEls.add(el);
    const kids = [...el.children].filter((k) => k.getClientRects().length);
    if (kids.length < 2) continue;
    const kinds = kids.reduce((m, k) => m.set(kindOf(k), [...(m.get(kindOf(k)) || []), k]), new Map());
    for (const run of kinds.values()) {
      const rs = run.map((k) => k.getBoundingClientRect());
      const spread = (f) => Math.max(...rs.map(f)) - Math.min(...rs.map(f));
      const bars =
        run.length >= 4 &&
        run.every((k) => !k.textContent.trim()) &&
        ((spread((r) => r.width) <= 1 && rs[0].width <= 64 && spread((r) => r.height) > 2) || (spread((r) => r.height) <= 1 && rs[0].height <= 32 && spread((r) => r.width) > 2));
      const stack = run.length >= 2 && rs.every((r, i) => i === 0 || (r.left > rs[i - 1].left && r.left < rs[i - 1].right - 2)) && spread((r) => r.top) <= 2;
      if (bars) barRuns.add(el);
      if (bars || stack) run.forEach((k) => dataEls.add(k));
    }
  }
  // Over a chart: anything inside the box of a bar run, give or take 8px (a playhead, a target line).
  const chartBoxes = [...barRuns].map((p) => p.getBoundingClientRect());
  const overChart = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && chartBoxes.some((b) => r.left >= b.left - 8 && r.right <= b.right + 8 && r.top >= b.top - 8 && r.bottom <= b.bottom + 8);
  };
  // Axis labels: a block beside a chart (svg, canvas, role=img, or a bar run) with its left and width.
  const besideChart = (el) => {
    for (let n = el, d = 0; n && n !== layer && d < 3; n = n.parentElement, d++)
      for (const s of [n.previousElementSibling, n.nextElementSibling]) {
        if (!s || !(s.matches("svg, canvas, [role=img]") || barRuns.has(s))) continue;
        const a = n.getBoundingClientRect(),
          b = s.getBoundingClientRect();
        if (Math.abs(a.left - b.left) <= 2 && Math.abs(a.width - b.width) <= 2) return true;
      }
    return false;
  };
  // An icon (an svg up to 32px with no role=img) is not data.
  const icon = (g) => {
    const r = g.getBoundingClientRect();
    return r.width <= 32 && r.height <= 32 && !g.closest("[role=img]");
  };
  const isData = (el) =>
    (!!el.closest("svg") && !icon(el.closest("svg"))) || !!el.closest("canvas, [role=img], progress, meter") || [...dataEls].some((d) => d.contains(el)) || besideChart(el) || overChart(el);
  // Columns: children of one parent that sit side by side (no overlap across, overlap down), each at
  // least 120px wide and 48px tall; a table is one unit; a floating panel (fixed or absolute, 120 by 48
  // or more) is a column of its own. column(el) is the nearest column holding el, else the layer.
  const columns = new Set();
  for (const el of [layer, ...layer.querySelectorAll("*")]) {
    if (el.closest("table, svg")) continue;
    const kids = [...el.children].map((k) => [k, k.getBoundingClientRect()]).filter(([, r]) => r.width >= 120 && r.height >= 48);
    for (let i = 0; i < kids.length; i++)
      for (let j = i + 1; j < kids.length; j++) {
        const [a, p] = kids[i],
          [b, q] = kids[j];
        if (Math.min(p.right, q.right) <= Math.max(p.left, q.left) + 1 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 24) (columns.add(a), columns.add(b));
      }
    const r = el.getBoundingClientRect();
    if (el !== layer && /fixed|absolute/.test(getComputedStyle(el).position) && r.width >= 120 && r.height >= 48) columns.add(el);
  }
  const column = (el) => {
    for (let n = el.parentElement; n && n !== layer; n = n.parentElement) if (columns.has(n)) return n;
    return layer;
  };
  // A container: the nearest painted box (fill unlike its parent's, a full border, or a shadow) over
  // 36px tall between el and its column; null when el sits on the column itself.
  const paintedBox = (n) => {
    const cs = getComputedStyle(n),
      bg = cs.backgroundColor;
    const fill = !/rgba?\([^)]*,\s*0\)|transparent/.test(bg) && bg !== getComputedStyle(n.parentElement || n).backgroundColor;
    const ring = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
    return fill || ring || cs.boxShadow !== "none";
  };
  const container = (el) => {
    const col = column(el);
    for (let n = el.parentElement; n && n !== col && n !== layer; n = n.parentElement) if (n.getBoundingClientRect().height > 36 && paintedBox(n)) return n;
    return null;
  };
  // A row of like cards (painted siblings of one kind) is not a set of columns: their contents compare.
  for (const a of [...columns]) if (paintedBox(a) && [...a.parentElement.children].some((b) => b !== a && kindOf(b) === kindOf(a) && paintedBox(b))) columns.delete(a);
  // Without a main region, dialog, or sheet the page chrome is measured as content.
  const warning = layer === document.body ? "No main region, dialog, or sheet: measured the whole page. Set window.__axesLayer to the content." : undefined;
  const color = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    color.clearRect(0, 0, 1, 1);
    color.fillStyle = "#000";
    color.fillStyle = c;
    color.fillRect(0, 0, 1, 1);
    return [...color.getImageData(0, 0, 1, 1).data];
  };
  // Inside a fixed or sticky bar, a dialog, or a sheet, below top.
  const pinned = (n, top = document.body) => {
    for (; n && n !== top; n = n.parentElement)
      if (/fixed|sticky/.test(getComputedStyle(n).position) || n.matches('dialog, [role=dialog], [aria-modal="true"], [data-slot="sheet-content"]')) return true;
    return false;
  };
  // What breaks, measured on the text (chart labels included: a label is text even when its bars are
  // data): cut by a box that hides its overflow (clipped); an ID-like token (letters and digits joined
  // by hyphens, with a digit) wrapped inside itself (wraps); running into other text, across the edge
  // of a filled or outlined box, or struck by a line, a box up to 3px thin, between its cap height and
  // its baseline (overlaps). An ellipsis or a line clamp is designed truncation, not a break; a line
  // under the text's own opaque fill is covered, not a strike. hits holds each overlap with both
  // parties; cuts, splits, and strikes hold the rest for bands.
  const tokens = /[\p{L}\d]+(?:-[\p{L}\d]+)+/gu;
  const splitAt = (t, at, len) => {
    const range = document.createRange();
    range.setStart(t, at);
    range.setEnd(t, at + len);
    const rs = [...range.getClientRects()].filter((q) => q.width > 1);
    return rs.length > 1 && Math.max(...rs.map((q) => q.top)) - Math.min(...rs.map((q) => q.top)) > rs[0].height / 2 ? rs : null;
  };
  // The part of the line inside the glyphs: from cap height to the baseline, from the font size.
  const strikeOf = (el, r, line) => {
    const s = line.getBoundingClientRect(),
      f = parseFloat(getComputedStyle(el).fontSize),
      base = r.bottom - 0.22 * f,
      cap = base - 0.72 * f;
    const over = Math.min(s.bottom, base + 0.5) - Math.max(s.top, cap),
      across = Math.min(s.right, r.right) - Math.max(s.left, r.left);
    if (over <= 0 || across <= 2) return 0;
    const x = Math.max(s.left, r.left) + across / 2,
      y = (Math.max(s.top, cap) + Math.min(s.bottom, base + 0.5)) / 2;
    const hit = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? document.elementFromPoint(x, y) : null;
    if (hit && !hit.contains(line) && (el.contains(hit) || hit.contains(el)))
      for (let n = el; n && !n.contains(line); n = n.parentElement) if (rgba(getComputedStyle(n).backgroundColor)[3] > 200) return 0;
    return over;
  };
  const breaks = () => {
    const runs = [];
    const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const el = t.parentElement;
      if (!t.textContent.trim() || !el || el.closest("svg, script, style, #__axes, #__view, #__heat")) continue;
      const box = el.getBoundingClientRect();
      if (box.width <= 1 && box.height <= 1) continue; // visually hidden text
      const range = document.createRange();
      range.selectNodeContents(t);
      for (const r of range.getClientRects()) {
        if (r.width <= 1 || r.height <= 1) continue;
        // Text under an open sheet, a dialog, or a fixed or sticky bar is covered, not broken.
        const x = r.left + r.width / 2,
          y = r.top + r.height / 2;
        const hit = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? document.elementFromPoint(x, y) : null;
        if (hit && !el.contains(hit) && !hit.contains(el) && pinned(hit) && !pinned(el)) continue;
        // The part of the text its clipping boxes let show.
        const v = {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
        };
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
          const b = n.getBoundingClientRect();
          Object.assign(v, {
            left: Math.max(v.left, b.left),
            top: Math.max(v.top, b.top),
            right: Math.min(v.right, b.right),
            bottom: Math.min(v.bottom, b.bottom),
          });
        }
        runs.push({ el, t, r, v });
      }
    }
    let clipped = 0,
      overlaps = 0,
      wraps = 0;
    const found = new Map(),
      hits = [],
      cuts = [],
      splits = [],
      strikes = [];
    const note = (kind, el) => {
      const k = `${kind} ${sel(el)}`,
        f = found.get(k) || {
          kind,
          at: sel(el),
          text: (el.matches("input") ? el.value || el.placeholder : el.textContent).trim().replace(/\s+/g, " ").slice(0, 40),
          n: 0,
          els: [],
        };
      (f.n++, f.els.push(el));
      found.set(k, f);
    };
    const cut = new Set();
    // The layer's own edge is the screen's edge, not a clip. An ellipsis renders only on text that flows
    // in the clipping box: an inline-block, inline-flex, or inline-grid between them cuts it hard.
    for (const { el, r } of runs)
      for (let n = el, atomic = false; n && n !== layer; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) {
          atomic ||= /^inline-(block|flex|grid)$/.test(cs.display);
          continue;
        }
        const b = n.getBoundingClientRect();
        if (!cut.has(n) && (r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1 || r.top < b.top - 1)) {
          cut.add(n);
          if (atomic || (cs.textOverflow !== "ellipsis" && cs.getPropertyValue("-webkit-line-clamp") === "none"))
            (clipped++,
              note("clipped", el),
              cuts.push({
                el,
                box: n,
                off: Math.round(Math.max(r.right - b.right, b.left - r.left, r.bottom - b.bottom, b.top - r.top)),
              }));
        }
        break;
      }
    // A placeholder wider than its field's content box, with no ellipsis, is cut too (it is not a text node).
    for (const f of layer.querySelectorAll("input[placeholder]:placeholder-shown")) {
      const cs = getComputedStyle(f);
      if (!f.getClientRects().length || cs.visibility === "hidden" || cs.textOverflow === "ellipsis") continue;
      color.font = cs.font;
      const off = Math.round(color.measureText(f.placeholder).width - (f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)));
      if (off > 1) (clipped++, note("clipped", f), cuts.push({ el: f, box: f, off }));
    }
    for (const t of new Set(runs.map((x) => x.t)))
      for (const m of t.nodeValue.matchAll(tokens)) {
        const rs = /\d/.test(m[0]) && splitAt(t, m.index, m[0].length);
        if (rs)
          (wraps++,
            note("wraps mid-token", t.parentElement),
            splits.push({
              el: t.parentElement,
              t,
              at: m.index,
              token: m[0],
              rs,
            }));
      }
    const meet = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    for (let i = 0; i < runs.length; i++)
      for (let j = i + 1; j < runs.length; j++) {
        const [p, q] = [runs[i], runs[j]];
        if (p.el !== q.el && !p.el.contains(q.el) && !q.el.contains(p.el) && meet(p.v, q.v)) (overlaps++, note("overlaps text", p.el), hits.push({ el: p.el, other: q.el, a: p.v, b: q.v }));
      }
    // Text crossing the edge of a filled or outlined box or an svg icon it does not live in; text fully
    // inside a highlight is fine.
    const boxes = [...layer.querySelectorAll("*")].filter((n) => {
      if (n.matches("svg")) return icon(n) && n.getBoundingClientRect().width > 8 && getComputedStyle(n).visibility !== "hidden";
      if (n.closest("svg")) return false;
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && (rgba(cs.backgroundColor)[3] > 12 || ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs[`border${s}Width`]) > 0));
    });
    for (const { el, v } of runs)
      for (const n of boxes) {
        if (n.contains(el) || el.contains(n)) continue;
        const b = n.getBoundingClientRect();
        const within = v.left >= b.left - 1 && v.right <= b.right + 1 && v.top >= b.top - 1 && v.bottom <= b.bottom + 1;
        if (!within && meet(v, b)) (overlaps++, note("crosses a box edge", el), hits.push({ el, other: n, a: v, b }));
      }
    const lines = [...layer.querySelectorAll("*")].filter((n) => {
      if (n.closest("svg")) return false;
      const r = n.getBoundingClientRect(),
        cs = getComputedStyle(n);
      return (
        ((r.height <= 3 && r.width >= 12) || (r.width <= 3 && r.height >= 12)) &&
        (rgba(cs.backgroundColor)[3] > 12 ||
          ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 12))
      );
    });
    for (const { el, r } of runs)
      for (const line of lines) {
        const over = !line.contains(el) && !el.contains(line) && strikeOf(el, r, line);
        if (over) (overlaps++, note("struck by a line", el), strikes.push({ el, r, line, off: Math.ceil(over) }));
      }
    return {
      clipped,
      overlaps,
      wraps,
      found,
      runs,
      hits,
      cuts,
      splits,
      strikes,
    };
  };
  if (mode === "long" || mode === "many")
    return (() => {
      const undo = [];
      const name = layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase();
      const before = breaks();
      // What the stress broke: each break by kind and selector, with how many more times it happens.
      const result = (extra) => {
        const after = breaks();
        // Matched by element and kind, not by name: a selector can change when the stress adds classes.
        const had = [...before.found.values()].flatMap((f) => f.els.map((el) => [f.kind, el]));
        const broke = [...after.found.values()]
          .map(({ els, ...f }) => ({
            ...f,
            n: f.n - had.filter(([k, el]) => k === f.kind && els.includes(el)).length,
          }))
          .filter((f) => f.n > 0)
          .sort((a, b) => b.n - a.n);
        const counts = ({ clipped, overlaps, wraps }) => ({
          clipped,
          overlaps,
          wraps,
        });
        window.__viewClear = () => undo.reverse().forEach((f) => f());
        return JSON.stringify({
          stress: mode,
          layer: name,
          ...(warning && { warning }),
          ...extra,
          before: counts(before),
          after: counts(after),
          broke: broke.slice(0, 12),
        });
      };

      if (mode === "long") {
        // A count alone ("7", "148") outside data and not before a % grows to thousands. Text grows by
        // 80% the way a longer language does: a single word as one compound ("Exportverwaltung"); a
        // phrase by longer words (a compound tail on words of four letters or more, up to half the
        // growth) and then extra words before its closing punctuation, whole words only, so it reads
        // as text and the stress never reads as a cut. Tokens with a digit (codes, IDs), a value with a
        // number and at most two words (a date, a time, "Halle 2", "Target 95 %"), and initials or
        // abbreviations of up to three capitals keep their shape.
        const after = (t) => {
          const w = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
          w.currentNode = t;
          for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim()) return n.nodeValue.trim();
          return "";
        };
        const tails = ["amt", "werk", "plan", "zeit", "liste", "daten", "bereich", "übersicht", "verwaltung", "einstellungen"];
        const filler = ["für", "alle", "offenen", "Einträge", "im", "Bereich", "der", "Planung"];
        // The shortest tails that reach n letters (within one letter of each other), one of two picked by
        // the word, so the tails vary and the growth stays near 80%.
        const tail = (n, w) => {
          let s = "";
          while (s.length < n) {
            const fits = tails.filter((x, _, all) => x.length >= n - s.length && x.length <= (all.find((y) => y.length >= n - s.length)?.length ?? 0) + 1);
            s += fits.length ? fits[(w.length + s.length) % Math.min(2, fits.length)] : tails.at(-1);
          }
          return s;
        };
        const grow = (text, t) => {
          if (/^\d{1,3}$/.test(text)) return t && !isData(t.parentElement) && !after(t).startsWith("%") ? (Number(text) * 1000 + 284).toLocaleString("en-US") : text;
          const growable = (w) => /\p{L}/u.test(w) && !/[\d\p{S}]/u.test(w) && !/^\p{Lu}{1,3}$/u.test(w);
          const words = text.split(/\s+/).filter(growable);
          if (!words.length || (/(^|\s)[\p{Sc}+\-−]?\d/u.test(text) && words.length <= 2)) return text;
          const caps = (s) => (/\p{Ll}/u.test(text) ? s : s.toUpperCase());
          const need = Math.ceil(text.length * 0.8);
          if (words.length === 1 && text === words[0]) return text + caps(tail(need, text));
          let added = 0;
          const out = text
            .split(/(\s+)/)
            .map((w) => {
              const m = growable(w) && added < need / 2 && w.match(/^(.*\p{L}{4})(\p{P}*)$/u);
              if (!m) return w;
              const s = caps(tail(Math.ceil(m[1].length * 0.4), m[1]));
              added += s.length;
              return m[1] + s + m[2];
            })
            .join("");
          const more = [];
          for (let i = 0; added < need; i++) (more.push(caps(filler[i % filler.length])), (added += filler[i % filler.length].length + 1));
          const [, body, end] = out.match(/^(.*?)([.,:;!?…)\]"'”’»]*)$/su);
          return more.length ? `${body} ${more.join(" ")}${end}` : out;
        };
        const shownText = (el) =>
          el &&
          (!el.checkVisibility ||
            el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            }));
        const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
        const nodes = [];
        for (let t = walker.nextNode(); t; t = walker.nextNode()) if (t.textContent.trim() && shownText(t.parentElement) && !t.parentElement.closest("script, style, svg")) nodes.push(t);
        for (const t of nodes) {
          const old = t.textContent,
            text = old.trim(),
            next = old.replace(text, grow(text, t));
          if (next === old) continue;
          t.textContent = next;
          undo.push(() => (t.textContent = old));
        }
        // Field values and placeholders grow the same way.
        for (const f of layer.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]), textarea")) {
          if (!shownText(f)) continue;
          for (const prop of ["value", "placeholder"]) {
            const old = f[prop];
            if (!old?.trim() || grow(old.trim()) === old.trim()) continue;
            f[prop] = grow(old.trim());
            undo.push(() => (f[prop] = old));
          }
        }
        return result({ texts: undo.length });
      }

      // A collection: a table body, a list, or a parent whose items (one tag and first class, at
      // least 32px tall, shorter than half the window) stack in rows or wrap as a grid of cards.
      // Never a table row's cells, a select's options, tabs, toolbars, navigation, a single row
      // of chips, cells, or bars, data (a chart's bars), a column of the layout (its stacked cards
      // are fixed), or a form's rows. Only the first one with a row in view grows. window.__stressList (a selector) names
      // the collections instead.
      const rows = window.__stressRows || 50;
      const kind = (n) => n.tagName + "." + (typeof n.className === "string" ? n.className.trim().split(/\s+/)[0] : "");
      const lists = [];
      if (window.__stressList) lists.push(...document.querySelectorAll(window.__stressList));
      else
        for (const el of layer.querySelectorAll("*")) {
          if (
            lists.some((l) => l.contains(el)) ||
            columns.has(el) ||
            el.matches("tr, thead, tfoot, colgroup, select, datalist, optgroup, dl") ||
            el.closest("svg, form, fieldset, nav, [role=navigation], [role=tablist], [role=menubar], [role=toolbar], [role=radiogroup], legend")
          )
            continue;
          // The rows: the children of its most common kind; the rest may only be short separators.
          const shownKids = [...el.children].filter((k) => k.getClientRects().length);
          const main = shownKids.map(kind).sort((p, q) => shownKids.filter((k) => kind(k) === q).length - shownKids.filter((k) => kind(k) === p).length)[0],
            kids = shownKids.filter((k) => kind(k) === main);
          if (kids.length < 2 || kids.some((k) => columns.has(k) || isData(k)) || shownKids.some((k) => kind(k) !== main && k.getBoundingClientRect().height >= 32)) continue;
          const rs = kids.map((k) => k.getBoundingClientRect());
          if (rs.some((r) => r.height < 32 || r.height > innerHeight / 2)) continue;
          const stacked = new Set(rs.map((r) => Math.round(r.top))).size > 1;
          if (!stacked || (kids.length < 3 && !el.matches("ul, ol, tbody, [role=list], [role=rowgroup], [role=grid]"))) continue;
          if (rs[0].top < innerHeight && rs[0].bottom > 0) {
            lists.push([el, kids]);
            break;
          }
        }
      const report = lists.map((item) => {
        const [list, kids] = Array.isArray(item) ? item : [item, [...item.children]],
          from = kids.length;
        // The copies go after the last row in view that no other child (a divider, a NOW line) follows,
        // so every original child keeps its neighbours.
        const k0 = kids.findLastIndex((k, i) => k.getBoundingClientRect().top < innerHeight && (!k.nextElementSibling || kids.includes(k.nextElementSibling)));
        let at = kids[Math.max(0, k0)];
        for (let i = 0; i < rows - from; i++) {
          const copy = kids[(Math.max(0, k0) + 1 + i) % from].cloneNode(true);
          copy.removeAttribute("id");
          at.after(copy);
          at = copy;
          undo.push(() => copy.remove());
        }
        return `${sel(list)} ${from} → ${Math.max(from, rows)}`;
      });
      return result({ lists: report });
    })();
  const name = (el) => el.getAttribute("data-slot") || el.getAttribute("role") || el.tagName.toLowerCase();

  // lead, bands, and grid draw over the layer; their host sits outside the body so a blurred body leaves it sharp.
  const B = layer.getBoundingClientRect();
  const V = {
    left: Math.max(0, B.left),
    top: Math.max(0, B.top),
    right: Math.min(innerWidth, B.right),
    bottom: Math.min(innerHeight, B.bottom),
  };
  const shown = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const label = (el) =>
    (el.matches?.("input") ? el.value || el.placeholder : el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40) ||
    el.getAttribute?.("aria-label") ||
    `${el.matches?.("img, svg, canvas, video, picture") ? "image" : "box"} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`;
  const painted = (el, cs = getComputedStyle(el), sides = ["Top", "Right", "Bottom", "Left"]) =>
    (rgba(cs.backgroundColor)[3] > 5 && cs.backgroundColor !== getComputedStyle(el.parentElement || el).backgroundColor) ||
    sides.some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 5) ||
    cs.boxShadow !== "none";
  const overlay = (html) => {
    const host = document.documentElement.appendChild(document.createElement("div"));
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    host.attachShadow({ mode: "open" }).innerHTML =
      `<style>i { position: absolute; display: block; box-sizing: border-box; } b { position: absolute; font: 600 10px/14px ui-monospace, Menlo, monospace; color: #fff; padding: 0 4px; border-radius: 2px; white-space: nowrap; }</style>${html}`;
    return host;
  };
  const box = (r, css, tag = "") => `<i style="left:${r.left}px;top:${r.top}px;width:${r.right - r.left}px;height:${r.bottom - r.top}px;${css}">${tag}</i>`;
  const pct = (v) => Math.round(v * 1000) / 10;
  const round4 = (v, up) => Math.max(0, (up ? Math.ceil : Math.round)(v / 4) * 4);
  // The outermost data thing holding el: the chart, the waveform's run of bars (its stacked layers
  // as one), the avatar stack.
  const dataRoot = (el) => {
    let d = null;
    for (let n = el; n && n !== layer; n = n.parentElement) if (n.matches("svg, canvas, [role=img], progress, meter")) d = n;
    if (d) return d;
    d = [...dataEls].find((k) => k.contains(el))?.parentElement;
    const dataish = (k) => [...dataEls].some((x) => k.contains(x));
    const kids = (n) => [...n.children].filter((k) => k.getClientRects().length);
    while (d && d.parentElement && d.parentElement !== layer && kids(d.parentElement).filter(dataish).length >= 2 && kids(d.parentElement).every((k) => dataish(k) || !k.textContent.trim()))
      d = d.parentElement;
    return d || el;
  };
  // A fix is held as edits, [{ els, property, value }], until the checks fold; then each edit becomes
  // an apply entry whose selector exact() picks for its elements (others that already have the value
  // may match). Edits of one property and value on several elements merge into one.
  const edit = (n, property, value) => [{ els: [n], property, value }];
  const union = (lists) => lists[0].map((a) => ({ ...a, els: [...new Set(lists.flatMap((l) => l.filter((b) => b.property === a.property && b.value === a.value).flatMap((b) => b.els)))] }));
  const toApply = (edits) => {
    const out = edits.map(({ els, property, value }) => ({ selector: exact(els, [], (m) => getComputedStyle(m).getPropertyValue(property) === value), property, value }));
    return out.every((a) => a.selector) ? out : null;
  };
  // Ranked by score, capped at 20; a repeated card or row folds into one check with its count and
  // every holder in apply. A check whose problem is uncertain (unsure) stays under 0.5; one with a
  // markup fix (apply []) may print.
  const ranked = (checks) => {
    const folded = new Map();
    for (const f of checks) {
      const k = `${f.kind}|${f.where}|${f.off}|${String(f.against).replace(/"[^"]*"/g, "")}`,
        e = folded.get(k);
      if (e) ((e.count += f.count), (e.edits = union([e.edits, f.edits])));
      else folded.set(k, { ...f, score: Math.round(Math.min(f.unsure ? 0.45 : 1, f.score) * 100) / 100 });
    }
    return [...folded.values()]
      .map(({ edits, unsure, ...f }) => {
        const apply = toApply(edits);
        if (apply) return { ...f, apply };
        const names = [...new Set(edits.map((e) => e.els.map(sel).join(", ")))].join(", ");
        return { ...f, apply: [], fix: `${f.fix} No selector matches only its elements: ${names} also names ${document.querySelectorAll(names).length - edits[0].els.length} others.` };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  };

  if (mode === "lead")
    return (() => {
      // Weight is density, not area: the sum of (contrast x ink)^2 x area over the sqrt of its outer box. Text ink is its stroke,
      // 0.4 x font weight / 400 x its size over the body size; fills and images weigh 1, icons 0.25.
      // A chip or button weighs as one, a chart or bar run as one. Decoration (aria-hidden,
      // presentation, unnamed images, svg, canvas, and the textless panel around them) is outlined
      // dashed and never leads. No checks: the view is a squint test for a person.
      const lum = ([r, g, b]) => [r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const over = (top, under) => under.map((v, i) => top[i] * (top[3] / 255) + v * (1 - top[3] / 255));
      const behind = (el) => {
        const stack = [];
        for (let n = el; n && stack.at(-1)?.[3] !== 255; n = n.parentElement) {
          const c = rgba(getComputedStyle(n).backgroundColor);
          if (c[3]) stack.push(c);
        }
        return stack.reverse().reduce((u, c) => over(c, u), [255, 255, 255]);
      };
      const clip = (r) => {
        const c = {
          left: Math.max(r.left, V.left),
          top: Math.max(r.top, V.top),
          right: Math.min(r.right, V.right),
          bottom: Math.min(r.bottom, V.bottom),
        };
        return c.right > c.left && c.bottom > c.top ? c : null;
      };
      const unit = (el) => {
        if (isData(el)) return dataRoot(el);
        for (let n = el; n && n !== layer; n = n.parentElement) {
          const r = n.getBoundingClientRect();
          if (r.height <= 48 && r.width <= (V.right - V.left) / 2 && (n.matches("button, a, [role=button], [role=tab], input, select, textarea") || painted(n))) return n;
        }
        return el;
      };
      const quiet = (n) => !n.textContent.trim() && !n.querySelector("button, a, input, select, textarea, [role=button]");
      const decor = (el, r) =>
        r.width > 48 &&
        r.height > 48 &&
        !el.matches("[role=img], [aria-label], [aria-labelledby]") &&
        (!!el.closest('[aria-hidden="true"], [role="presentation"], [role="none"]') || (el.matches("img") && !el.getAttribute("alt")) || el.matches("canvas, svg, video"));
      // A decoration's unit: the largest textless, controlless box around it, such as an illustration panel.
      const panel = (el) => {
        let u = el;
        for (let n = el.parentElement; n && n !== layer && quiet(n); n = n.parentElement) u = n;
        return u;
      };
      const items = new Map();
      const add = (el, rects, contrast, ink, art = false) => {
        const rs = rects.map(clip).filter(Boolean);
        const area = rs.reduce((s, r) => s + (r.right - r.left) * (r.bottom - r.top), 0);
        if (!area || (!contrast && !art)) return;
        const u = art ? panel(el) : unit(el),
          e = items.get(u) || { el: u, rects: [], area: 0, ink: 0, art };
        e.rects.push(...rs);
        e.art ||= art;
        e.area += area;
        e.ink += area * (contrast * ink) ** 2;
        items.set(u, e);
      };
      const range = document.createRange();
      const walk = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      const runs = [];
      for (let n; (n = walk.nextNode()); ) {
        if (!shown(n.parentElement)) continue;
        range.selectNodeContents(n);
        runs.push({
          el: n.parentElement,
          rects: [...range.getClientRects()],
          size: parseFloat(getComputedStyle(n.parentElement).fontSize),
          chars: n.nodeValue.trim().length,
        });
      }
      // The body size: the size most characters are set in.
      const bySize = runs.reduce((m, r) => m.set(r.size, (m.get(r.size) || 0) + r.chars), new Map());
      const body = [...bySize].sort((a, b) => b[1] - a[1])[0]?.[0] || 16;
      for (const r of runs) {
        const cs = getComputedStyle(r.el),
          bg = behind(r.el);
        add(r.el, r.rects, Math.abs(lum(over(rgba(cs.color), bg)) - lum(bg)), (Number(cs.fontWeight) / 400) * 0.4 * (r.size / body));
      }
      // An image's contrast, sampled at 16 x 16; mid-grey when the browser will not share its pixels.
      const sample = (el, bg) => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 16;
          const g = c.getContext("2d", { willReadFrequently: true });
          g.drawImage(el, 0, 0, 16, 16);
          const d = g.getImageData(0, 0, 16, 16).data;
          let sq = 0;
          for (let i = 0; i < d.length; i += 4) sq += (lum(over([d[i], d[i + 1], d[i + 2], d[i + 3]], bg)) - lum(bg)) ** 2;
          return Math.sqrt(sq / 256);
        } catch {
          return Math.abs(lum([128, 128, 128]) - lum(bg));
        }
      };
      for (const el of layer.querySelectorAll("*")) {
        if (el.parentElement?.closest("svg") || !shown(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 2 || r.height <= 2) continue;
        const cs = getComputedStyle(el),
          bg = behind(el.parentElement || el);
        if (el.matches("svg")) add(el, [r], Math.abs(lum(over(rgba(cs.stroke !== "none" ? cs.color : cs.fill), bg)) - lum(bg)), 0.25, decor(el, r));
        else if (el.matches("img, canvas, video")) add(el, [r], sample(el, bg), 1, decor(el, r));
        else {
          const fill = rgba(cs.backgroundColor);
          if (fill[3] > 5)
            add(
              el,
              [r],
              Math.abs(lum(over(fill, bg)) - lum(bg)),
              1,
              quiet(el) && (decor(el, r) || [...el.querySelectorAll("img, svg, canvas, video")].some((d) => decor(d, d.getBoundingClientRect()))),
            );
        }
      }
      // Density over the item's outer box, so text on its own fill does not count its area twice.
      const all = [...items.values()].map((i) => ({
        ...i,
        w:
          i.ink /
          Math.sqrt((Math.max(...i.rects.map((r) => r.right)) - Math.min(...i.rects.map((r) => r.left))) * (Math.max(...i.rects.map((r) => r.bottom)) - Math.min(...i.rects.map((r) => r.top)))),
      }));
      const content = all.filter((i) => !i.art).sort((a, b) => b.w - a.w);
      const art = all.filter((i) => i.art).sort((a, b) => b.w - a.w);
      const sum = content.reduce((s, i) => s + i.w, 0) || 1;
      const outer = (i) => ({
        left: Math.min(...i.rects.map((r) => r.left)) - 3,
        top: Math.min(...i.rects.map((r) => r.top)) - 3,
        right: Math.max(...i.rects.map((r) => r.right)) + 3,
        bottom: Math.max(...i.rects.map((r) => r.bottom)) + 3,
      });
      const [a, b] = content;
      const tint = ["rgb(230 0 90)", "rgb(245 130 0)", "rgb(0 110 230)"];
      const blur = Math.max(3, Math.round(innerWidth / 320));
      const saved = layer.style.getPropertyValue("filter");
      layer.style.setProperty("filter", `grayscale(1) blur(${blur}px)`, "important");
      const host = overlay(
        content
          .slice(0, 3)
          .map((i, k) => box(outer(i), `outline:2px solid ${tint[k]}`, `<b style="top:-15px;left:-2px;background:${tint[k]}">${"ABC"[k]} · ${pct(i.w / sum)}%</b>`))
          .join("") +
          art
            .slice(0, 3)
            .map((i) => box(outer(i), "outline:2px dashed #888", `<b style="top:4px;left:4px;background:#888">decoration${a ? ` · ${Math.round((i.w / a.w) * 100) / 100}x A` : ""}</b>`))
            .join(""),
      );
      window.__viewClear = () => {
        host.remove();
        saved ? layer.style.setProperty("filter", saved) : layer.style.removeProperty("filter");
      };
      return JSON.stringify({
        view: mode,
        layer: name(layer),
        ...(warning && { warning }),
        leaders: content.slice(0, 5).map((i) => ({
          where: sel(i.el),
          text: label(i.el),
          share: pct(i.w / sum),
        })),
        ratio: a && b ? Math.round((a.w / b.w) * 10) / 10 : null,
        decoration: art.slice(0, 3).map((i) => ({
          where: sel(i.el),
          vsLeader: a ? Math.round((i.w / a.w) * 100) / 100 : null,
        })),
      });
    })();

  if (mode === "bands")
    return (() => {
      // Down each column: what it holds (text by its line box, icons, images, controls, boxes up to
      // 48px tall, the top and bottom edges of bigger boxes; a chart as one block) projected onto y,
      // and the empty runs between as gaps. A gap's role comes from the structure it separates:
      // "inset" (a box and its own content, or two ruled rows that touch), "above" or "below" a
      // heading, "section" (two siblings of the column's outermost stack), "row" (two repeated
      // siblings), else "inner" (inside a card, a label and its value, a field and its actions).
      const HEAD = "h1, h2, h3, h4, h5, h6, [role=heading]";
      const lanes = new Map();
      const put = (el, top, bottom, lane = column(el)) => {
        const t = Math.max(top, V.top),
          b = Math.min(bottom, V.bottom);
        if (b - t >= 1)
          (lanes.get(lane) || lanes.set(lane, []).get(lane)).push({
            t: Math.round(t),
            b: Math.round(b),
            el,
          });
      };
      const inX = (r) => r.width > 2 && r.height > 2 && r.right > V.left && r.left < V.right && r.bottom > V.top && r.top < V.bottom;
      const seen = new Set();
      const range = document.createRange();
      const walk = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      for (let n; (n = walk.nextNode()); ) {
        const el = n.parentElement;
        if (!shown(el) || isData(el)) continue;
        range.selectNodeContents(n);
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        for (const r of range.getClientRects()) {
          const half = lh > r.height ? lh / 2 : r.height / 2,
            mid = (r.top + r.bottom) / 2;
          if (inX(r)) put(el, mid - half, mid + half);
        }
      }
      for (const el of layer.querySelectorAll("*")) {
        if (el.parentElement?.closest("svg") || !shown(el)) continue;
        const r = el.getBoundingClientRect();
        if (!inX(r)) continue;
        if (isData(el)) {
          const d = dataRoot(el),
            q = d.getBoundingClientRect();
          if (!seen.has(d)) (seen.add(d), put(d, q.top, q.bottom));
        } else if (columns.has(el)) put(el, r.top, r.bottom);
        else if (el.matches("svg, img, canvas, video, hr, input, select, textarea")) put(el, r.top, r.bottom);
        else if (painted(el, undefined, ["Top", "Bottom"])) {
          if (r.height <= 48) put(el, r.top, r.bottom);
          else (put(el, r.top, r.top + 1), put(el, r.bottom - 1, r.bottom));
        }
      }
      const lca = (a, b) => {
        let n = a;
        while (n && !n.contains(b)) n = n.parentElement;
        return n;
      };
      const childOf = (p, el) => {
        let n = el;
        while (n && n.parentElement !== p) n = n.parentElement;
        return n;
      };
      // Section level: the column's outermost stack (the first box down from the column with two or
      // more children stacked), and inside it any unpainted child that is itself a stack, is not a list,
      // and does not open with its own heading (a headed block is one section; its gaps are inner).
      const kidsOf = (n) => [...n.children].filter((k) => k.getClientRects().length && shown(k) && !/absolute|fixed/.test(getComputedStyle(k).position));
      const levels = new Map();
      const sectionLevel = (lane) => {
        if (levels.has(lane)) return levels.get(lane);
        const set = new Set();
        const down = (n, top) => {
          let ks = kidsOf(n);
          while (ks.length === 1 && !paintedBox(ks[0]) && !columns.has(ks[0])) ((n = ks[0]), (ks = kidsOf(n)));
          const rs = ks.map((k) => k.getBoundingClientRect());
          if (!rs.some((a) => rs.some((b) => b.top >= a.bottom - 1))) return;
          const f = ks[0],
            headed = f.matches(HEAD) || (!!f.querySelector(HEAD) && rs[0].height <= 64);
          const list =
            n.matches("ul, ol, dl, table, tbody, [role=list], [role=listbox], [role=grid], [role=rowgroup]") || (ks.length >= 3 && ks.every((k) => repeated(k, f)) && !n.querySelector(HEAD));
          if (!top && (headed || list)) return;
          set.add(n);
          for (const k of ks) if (!paintedBox(k) && !columns.has(k)) down(k, false);
        };
        let inCard = false; // a column inside a card (a cell of a KPI strip) holds inner gaps only
        for (let n = lane.parentElement; n && lane !== layer && !inCard && n !== layer; n = n.parentElement) inCard = paintedBox(n);
        if (!inCard) down(lane, true);
        levels.set(lane, set);
        return set;
      };
      // Repeated siblings: one tag and data-slot, and the same classes (or the same first class when it
      // is not a utility class).
      const repeated = (a, b) =>
        a.tagName === b.tagName &&
        a.getAttribute("data-slot") === b.getAttribute("data-slot") &&
        (a.className === b.className || (!!firstClass(a) && firstClass(a) === firstClass(b) && !utility(firstClass(a).slice(1))));
      // A heading run: a heading and nothing but what shares its parent (a checkbox beside it).
      const headingOf = (run) => {
        const h = run.els.map((el) => el.closest(HEAD)).find(Boolean);
        return h && run.els.every((el) => h.parentElement.contains(el)) ? h : null;
      };
      const gaps = [];
      for (const [lane, spans] of lanes) {
        spans.sort((a, b) => a.t - b.t);
        const runs = [];
        for (const s of spans) {
          const last = runs.at(-1);
          if (last && s.t <= last.bottom) {
            last.els.push(s.el);
            if (s.b > last.bottom) Object.assign(last, { bottom: s.b, lastEl: s.el });
          } else
            runs.push({
              top: s.t,
              bottom: s.b,
              firstEl: s.el,
              lastEl: s.el,
              els: [s.el],
            });
        }
        const lr = lane.getBoundingClientRect(),
          x = {
            left: Math.max(V.left, lr.left),
            right: Math.min(V.right, lr.right),
          };
        for (let i = 1; i < runs.length; i++) {
          const up = runs[i - 1],
            down = runs[i],
            U = up.lastEl,
            L = down.firstEl,
            P = lca(U, L);
          const g = {
            lane,
            ...x,
            top: up.bottom,
            bottom: down.top,
            h: down.top - up.bottom,
            U,
            L,
            P,
            A: childOf(P, U),
            B: childOf(P, L),
          };
          const hd = headingOf(down),
            hu = headingOf(up);
          if (U.contains(L) || L.contains(U)) g.role = "inset";
          else if (hd) Object.assign(g, { role: "above", head: hd });
          else if (hu) Object.assign(g, { role: "below", head: hu });
          else if (g.A !== g.B && sectionLevel(lane).has(P)) g.role = "section";
          else if (g.A !== g.B && repeated(g.A, g.B)) {
            // A row gap is the space between the row boxes: ruled or filled rows that touch have none.
            const a = g.A.getBoundingClientRect(),
              b = g.B.getBoundingClientRect();
            const ruled = painted(g.A, undefined, ["Top", "Bottom"]) || painted(g.B, undefined, ["Top", "Bottom"]);
            if (ruled && b.top - a.bottom <= 1) g.role = "inset";
            else
              Object.assign(
                g,
                { role: "row" },
                ruled && {
                  top: a.bottom,
                  bottom: b.top,
                  h: Math.round(b.top - a.bottom),
                },
              );
          } else g.role = "inner";
          gaps.push(g);
        }
      }
      // Across each row or grid: the gutters between side-by-side boxes (fills, outlines, images,
      // controls, columns) of one parent; wider than 64px is a push apart, not a gutter.
      const gutters = [];
      for (const el of [layer, ...layer.querySelectorAll("*")]) {
        if (isData(el) || el.closest("svg")) continue;
        const kids = [...el.children].filter(
          (k) => !isData(k) && shown(k) && inX(k.getBoundingClientRect()) && (columns.has(k) || k.matches("img, video, canvas, input, select, textarea, button") || paintedBox(k)),
        );
        if (kids.length < 3) continue;
        const rows = new Map();
        for (const k of kids) {
          const r = k.getBoundingClientRect(),
            key = [...rows.keys()].find((t) => Math.abs(t - r.top) <= 2) ?? r.top;
          rows.set(key, [...(rows.get(key) || []), [k, r]]);
        }
        for (const row of rows.values()) {
          row.sort((p, q) => p[1].left - q[1].left);
          for (let i = 1; i < row.length; i++) {
            const [U, p] = row[i - 1],
              [L, q] = row[i],
              w = Math.round(q.left - p.right);
            // Another child in between (a brand name after its logo) makes it no gutter.
            const between = [...el.children].some((c) => {
              if (c === U || c === L || !shown(c)) return false;
              const r = c.getBoundingClientRect();
              return r.width && r.left < q.left - 1 && r.right > p.right + 1 && r.top < Math.max(p.bottom, q.bottom) && r.bottom > Math.min(p.top, q.top);
            });
            if (w >= 0 && w <= 64 && !between)
              gutters.push({
                P: el,
                U,
                L,
                w,
                left: p.right,
                right: q.left,
                top: Math.max(V.top, Math.min(p.top, q.top)),
                bottom: Math.min(V.bottom, Math.max(p.bottom, q.bottom)),
              });
          }
        }
      }
      const tally = (xs) => [...xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())].sort((p, q) => q[1] - p[1] || p[0] - q[0]);
      // The reference of a set of gaps: its one most common size, else the smaller of a tie.
      const modeOf = (xs) => {
        const t = tally(xs);
        return t.length && (t.length === 1 || t[0][1] > t[1][1] ? t[0][0] : Math.min(t[0][0], t[1][0]));
      };
      const scale = tally([...gaps.filter((g) => g.role !== "inset").map((g) => g.h), ...gutters.map((g) => g.w)])
        .filter(([, n]) => n >= 2)
        .map(([v]) => v)
        .sort((p, q) => p - q);
      // What makes a gap: margins, paddings, and end-aligned min-heights between each side and the
      // shared parent, and the parent's gap. Prefer the given side; a box measured by its edge adds no padding of its own.
      const makers = (g, axis, side) => {
        const [a, b] = axis === "y" ? ["Bottom", "Top"] : ["Right", "Left"],
          out = [];
        const climb = (el, s, who) => {
          for (let n = el; n && n !== g.P; n = n.parentElement) {
            const cs = getComputedStyle(n);
            out.push({
              n,
              who,
              prop: `margin-${s.toLowerCase()}`,
              v: parseFloat(cs[`margin${s}`]),
            });
            if (n !== el || !painted(n))
              out.push({
                n,
                who,
                prop: `padding-${s.toLowerCase()}`,
                v: parseFloat(cs[`padding${s}`]),
              });
            // A row box with a min-height that pushes its content away from the gap: its min-height makes the space.
            if (axis === "y" && /flex/.test(cs.display) && !/column/.test(cs.flexDirection) && (s === "Top" ? /end/ : /start/).test(cs.alignItems))
              out.push({
                n,
                who,
                prop: "min-height",
                v: parseFloat(cs.minHeight) || 0,
              });
          }
        };
        climb(g.U, a, "U");
        climb(g.L, b, "L");
        const cs = getComputedStyle(g.P);
        if (/flex|grid/.test(cs.display))
          out.push({
            n: g.P,
            who: "P",
            prop: axis === "y" ? "row-gap" : "column-gap",
            v: parseFloat(axis === "y" ? cs.rowGap : cs.columnGap) || 0,
          });
        return out.filter((m) => m.v > 0).sort((p, q) => (q.who === side) - (p.who === side) || q.v - p.v);
      };
      // One sentence: change the biggest maker by delta, landing on the 4px scale.
      // The outermost box on el's side under the shared parent (a display: contents wrapper has no box).
      const boxOf = (g, el) => {
        let b = el;
        for (let n = el; n && n !== g.P; n = n.parentElement) if (getComputedStyle(n).display !== "contents") b = n;
        return b;
      };
      const fixFor = (g, axis, side, delta, why) => {
        const m = makers(g, axis, side)[0];
        const [n, prop, v] = m ? [m.n, m.prop, round4(m.v + delta, delta > 0)] : [boxOf(g, g.L), axis === "y" ? "margin-top" : "margin-left", round4(Math.abs(delta), delta > 0)];
        return {
          fix: `Set ${prop} to ${v}px on ${sel(n)}; ${why}.`,
          edits: edit(n, prop, `${v}px`),
        };
      };
      const checks = [];
      const flagged = new Set();
      const text = (el) => label(el.closest(HEAD) || el);
      // Rows: per list, a gap 4px or more off the list's reference (else the column's row reference).
      const rowGaps = gaps.filter((g) => g.role === "row");
      const laneRow = new Map([...new Set(rowGaps.map((g) => g.lane))].map((l) => [l, modeOf(rowGaps.filter((g) => g.lane === l).map((g) => g.h))]));
      const lists = new Map();
      for (const g of rowGaps) lists.set(g.P, [...(lists.get(g.P) || []), g]);
      for (const [P, list] of lists) {
        const t = tally(list.map((g) => g.h)),
          ref = t.length === 1 || t[0][1] > t[1][1] ? t[0][0] : laneRow.get(list[0].lane);
        const odd = list.filter((g) => Math.abs(g.h - ref) >= 4);
        for (const [h, n] of tally(odd.map((g) => g.h))) {
          const g = odd.find((x) => x.h === h),
            same = odd.filter((x) => x.h === h);
          same.forEach((x) => flagged.add(x));
          const fixes = same.map((x) => fixFor(x, "y", "L", ref - h, `the other rows of this list sit ${ref}px apart`));
          checks.push({
            kind: "rhythm",
            where: sel(makers(g, "y", "L")[0]?.n || boxOf(g, g.L)),
            text: label(g.B),
            against: `row gap ${ref}px in ${sel(P)}`,
            off: h - ref,
            fix: fixes[0].fix,
            edits: union(fixes.map((f) => f.edits)),
            count: n,
            score: 0.45 + Math.min(0.4, Math.abs(h - ref) * 0.04),
            g,
          });
        }
      }
      // Headings: 4px or more less space above than below.
      for (const g of gaps.filter((x) => x.role === "above")) {
        const next = gaps.find((x) => x.role === "below" && x.head === g.head);
        const card = container(g.head) || (g.lane !== layer && (paintedBox(g.lane) || [...g.lane.parentElement.children].filter((k) => kindOf(k) === kindOf(g.lane)).length > 1) ? g.lane : null);
        if (card && card.contains(g.U)) continue; // a heading under its own icon or eyebrow inside one card or tile
        if (next && next.h - g.h >= 4) {
          const want = next.h + 8;
          checks.push({
            kind: "rhythm",
            where: sel(makers(g, "y", "L")[0]?.n || boxOf(g, g.L)),
            text: text(g.head),
            against: `${next.h}px below it, to ${sel(boxOf(next, next.L))} "${label(next.L)}"`,
            off: g.h - next.h,
            ...fixFor(g, "y", "L", want - g.h, `"${text(g.head)}" sits ${g.h}px under the block above and ${next.h}px above its own content, so it reads as attached to the block above`),
            count: 1,
            score: 0.55 + Math.min(0.3, (next.h - g.h + 1) * 0.03),
            g,
          });
          flagged.add(g);
        }
      }
      // Same-role gaps around headings of one level in one column, 4px or more apart. A gap that follows
      // a card's bottom edge and is wider than the others is no slip: more space after a card is right.
      const afterCard = (g) => {
        for (let n = g.U; n && n !== g.P; n = n.parentElement) {
          const r = n.getBoundingClientRect();
          if (r.height > 48 && Math.abs(r.bottom - g.top) <= 1 && paintedBox(n)) return true;
        }
        return false;
      };
      for (const role of ["above", "below"]) {
        const sets = new Map();
        for (const g of gaps.filter((x) => x.role === role && !flagged.has(x))) {
          const k = `${role} ${g.head.tagName}`;
          sets.set(k, [...(sets.get(k) || []), g]);
        }
        for (const set of sets.values()) {
          const ref = modeOf(set.map((g) => g.h));
          for (const g of set.filter((x) => Math.abs(x.h - ref) >= 4 && !(x.h > ref && afterCard(x))))
            checks.push({
              kind: "rhythm",
              where: sel(makers(g, "y", role === "above" ? "L" : "U")[0]?.n || boxOf(g, g.L)),
              text: text(g.head),
              against: `${ref}px ${role} the other ${g.head.tagName.toLowerCase()} headings`,
              off: g.h - ref,
              ...fixFor(g, "y", role === "above" ? "L" : "U", ref - g.h, `the other ${g.head.tagName.toLowerCase()} headings have ${ref}px ${role}`),
              count: 1,
              score: role === "above" ? 0.4 : 0.25,
              g,
            });
        }
      }
      // Gutters: per parent, one 4px or more off the others.
      const rowsOf = new Map();
      for (const g of gutters) rowsOf.set(g.P, [...(rowsOf.get(g.P) || []), g]);
      for (const [P, set] of rowsOf) {
        const ref = modeOf(set.map((g) => g.w));
        const odd = set.filter((g) => Math.abs(g.w - ref) >= 4);
        for (const [w, n] of tally(odd.map((g) => g.w))) {
          const g = odd.find((x) => x.w === w),
            fixes = odd.filter((x) => x.w === w).map((x) => fixFor(x, "x", "L", ref - w, `the other gutters in this row are ${ref}px`));
          checks.push({
            kind: "rhythm",
            where: sel(g.L),
            text: label(g.L),
            against: `gutter ${ref}px between the other boxes in ${sel(P)}`,
            off: w - ref,
            fix: fixes[0].fix,
            edits: union(fixes.map((f) => f.edits)),
            count: n,
            score: 0.4 + Math.min(0.4, Math.abs(w - ref) * 0.04),
            gut: g,
          });
        }
      }
      // Dead zones: a painted box whose content, ending in a box (not ragged text), leaves 120px or
      // more empty on one side and under 60% filled, or 4x the space on the other side, and that breaks
      // with its siblings: none shares its width (within 2px) and no painted one its share of content
      // (within 0.15). A box alone in its parent, or one as wide as its siblings, is the layout.
      const extent = (el) => {
        let lo = null,
          hi = null;
        const boxes = [];
        const take = (q, n, isBox) => {
          if (q.width < 1 || q.height < 1) return;
          if (!lo || q.left < lo.x) lo = { x: q.left, n, isBox };
          if (!hi || q.right > hi.x) hi = { x: q.right, n, isBox };
        };
        for (const n of el.querySelectorAll("*")) {
          if (!shown(n) || n.parentElement.closest("svg")) continue;
          const q = n.getBoundingClientRect();
          if (q.width <= 2 || q.height <= 2) continue;
          if (n.matches("svg, img, canvas, video, picture, input, select, textarea, button") || paintedBox(n)) (take(q, n, true), boxes.push(q));
          else for (const c of n.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) (range.selectNodeContents(c), [...range.getClientRects()].forEach((t) => take(t, n, false)));
        }
        return { lo, hi, boxes, fill: lo ? (hi.x - lo.x) / el.getBoundingClientRect().width : 0 };
      };
      const zones = [];
      for (const el of layer.querySelectorAll("*")) {
        if (isData(el) || el.closest("svg") || el.matches("button, a, input, select, textarea, [role=button], label") || !shown(el) || !paintedBox(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 240 || r.height < 48 || !inX(r)) continue;
        const { lo, hi, boxes, fill } = extent(el);
        if (!lo || boxes.some((q) => Math.abs((q.left + q.right) / 2 - (r.left + r.right) / 2) <= 8)) continue; // a centered box is deliberate
        const sibs = [...el.parentElement.children].filter((k) => k !== el && shown(k) && k.getClientRects().length && !/absolute|fixed/.test(getComputedStyle(k).position));
        if (!sibs.length || sibs.some((k) => Math.abs(k.getBoundingClientRect().width - r.width) <= 2 || (paintedBox(k) && Math.abs(extent(k).fill - fill) <= 0.15))) continue;
        const left = lo.x - r.left,
          right = r.right - hi.x,
          big = Math.max(left, right),
          small = Math.min(left, right),
          edge = right >= left ? hi : lo;
        if (big < 120 || !edge.isBox || !((hi.x - lo.x) / r.width < 0.6 || big >= 4 * Math.max(small, 8))) continue;
        if (zones.some((z) => z.el.contains(el))) continue;
        const side = right >= left ? "right" : "left";
        let piece = edge.n;
        while (piece.parentElement !== el) piece = piece.parentElement;
        const fixed = getComputedStyle(piece).width;
        zones.push({ el });
        checks.push({
          kind: "dead-zone",
          where: sel(el),
          text: label(el),
          against: `${Math.round(small)}px on the ${side === "right" ? "left" : "right"}`,
          off: Math.round(big - small),
          fix: `Set width to fit-content on ${sel(el)}, or set margin-inline to auto on ${sel(piece)} (${fixed} wide); it leaves ${Math.round(big)}px empty on the ${side}.`,
          edits: edit(el, "width", "fit-content"),
          count: 1,
          score: 0.6 + Math.min(0.3, big / 1000),
          zone: {
            top: r.top,
            bottom: r.bottom,
            left: side === "right" ? hi.x : r.left,
            right: side === "right" ? r.right : lo.x,
          },
        });
      }
      // Vertical dead zones: an empty run in a column of 200px or more and 3x the column's largest
      // section gap (else its largest gap), held open by a stretched box, a margin, the parent's
      // justify-content, or a spacer. A box centered in its column (equal margins, centered content)
      // is deliberate. A scroll area keeps its flex-grow and height, so the space it holds open has no
      // CSS-only fix: what follows it moves in the markup (apply []).
      const holder = (g) => {
        const set = (n, property, value, now = "") => [n, `Set ${property} to ${value} on ${sel(n)}${now}`, edit(n, property, value)];
        for (const [el, up] of [
          [g.U, true],
          [g.L, false],
        ])
          for (let n = el; n && n !== g.P; n = n.parentElement) {
            const r = n.getBoundingClientRect(),
              cs = getComputedStyle(n);
            if ((up ? r.bottom - g.top : g.bottom - r.top) > g.h / 2) {
              if (/auto|scroll/.test(cs.overflowY))
                return [
                  n,
                  `No CSS-only fix: ${sel(n)} is a scroll area and keeps its ${parseFloat(cs.flexGrow) > 0 ? "flex-grow" : "height"}; move what follows it up in the markup, or fill the space`,
                  [],
                ];
              return parseFloat(cs.flexGrow) > 0 ? set(n, "flex", "none", ` (now ${cs.flexGrow} ${cs.flexShrink} ${cs.flexBasis})`) : set(n, "height", "auto", ` (now ${cs.height})`);
            }
            if (parseFloat(up ? cs.marginBottom : cs.marginTop) > g.h / 2)
              return Math.abs(parseFloat(cs.marginTop) - parseFloat(cs.marginBottom)) <= 8 ? null : set(n, `margin-${up ? "bottom" : "top"}`, "0px");
          }
        const jc = getComputedStyle(g.P).justifyContent;
        if (/center|around|evenly/.test(jc)) return null;
        if (/between|end/.test(jc)) return set(g.P, "justify-content", "flex-start");
        const spacer = [...g.P.children].find((k) => {
          const r = k.getBoundingClientRect();
          return r.top >= g.top - 1 && r.bottom <= g.bottom + 1 && r.height > g.h / 2;
        });
        if (spacer) return set(spacer, "flex", "none");
        return g.B && g.A ? [g.B, `Move ${sel(g.B)} up under ${sel(g.A)}`, []] : set(g.P, "height", "auto");
      };
      for (const lane of new Set(gaps.map((g) => g.lane))) {
        const own = gaps.filter((g) => g.lane === lane),
          small = own.filter((g) => g.h < 200);
        const ref = Math.max(0, ...small.filter((g) => g.role === "section").map((g) => g.h)) || Math.max(0, ...small.map((g) => g.h));
        for (const g of own.filter((x) => x.h >= 200 && x.h >= 3 * ref)) {
          const held = holder(g);
          if (!held) continue;
          const [n, fix, edits] = held;
          checks.push({
            kind: "dead-zone",
            where: sel(n),
            text: label(n),
            against: `largest section gap ${ref}px in ${sel(lane)}`,
            off: g.h - ref,
            fix: `${fix}; it leaves ${g.h}px empty between "${label(g.U).slice(0, 24)}" and "${label(g.L).slice(0, 24)}".`,
            edits,
            unsure: !edits.length,
            count: 1,
            score: 0.6 + Math.min(0.3, g.h / 1000),
            zone: g,
          });
        }
      }
      // Collisions on the page as it is: text running into other text, across the edge of a box, or
      // under an icon; both parties visible, neither data nor pinned. Text drawn inside an image is the
      // image's to fix, not CSS's. The fix moves the positioned party to its other edge, else drops a
      // negative margin.
      const brk = breaks(),
        { hits } = brk;
      const free = (el) => shown(el) && !isData(el) && !pinned(el, layer);
      const moveFix = (h) => {
        const top = lca(h.el, h.other) || layer;
        for (const el of [h.el, h.other])
          for (let n = el; n && n !== top && n !== layer; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.position === "absolute") {
              const inner = n.offsetParent?.getBoundingClientRect(),
                r = n.getBoundingClientRect();
              const low = inner && r.top + r.height / 2 > (inner.top + inner.bottom) / 2;
              const [to, from, v] = low ? ["top", "bottom", cs.bottom] : ["bottom", "top", cs.top];
              return [n, `Set ${to} to ${v} and ${from} to auto on ${sel(n)}`, [...edit(n, to, v), ...edit(n, from, "auto")]];
            }
            const side = parseFloat(cs.marginTop) < 0 ? "margin-top" : parseFloat(cs.marginLeft) < 0 ? "margin-left" : null;
            if (side) return [n, `Set ${side} to 0 on ${sel(n)}`, edit(n, side, "0px")];
          }
        return [h.el, `Separate ${sel(h.el)} from ${sel(h.other)} in the markup`, []];
      };
      const crashes = new Map();
      for (const h of hits) {
        if (!free(h.el) || !free(h.other)) continue;
        const k = `${sel(h.el)}|${sel(h.other)}`,
          e = crashes.get(k);
        if (e) e.count++;
        else crashes.set(k, { h, count: 1 });
      }
      for (const { h, count } of crashes.values()) {
        const [n, fix, edits] = moveFix(h),
          what = `${sel(h.other)} "${label(h.other)}"`;
        const o = {
          left: Math.max(h.a.left, h.b.left),
          top: Math.max(h.a.top, h.b.top),
          right: Math.min(h.a.right, h.b.right),
          bottom: Math.min(h.a.bottom, h.b.bottom),
        };
        checks.push({
          kind: "collision",
          where: sel(n),
          text: label(h.el),
          against: what,
          off: Math.round(Math.min(o.right - o.left, o.bottom - o.top)),
          fix: `${fix}; ${sel(h.el)} "${label(h.el).slice(0, 24)}" covers ${what}.`,
          edits,
          count,
          score: 0.7,
          zone: o,
        });
      }
      // Breaks at rest (chart labels included): a hard cut, an ID-like token wrapped inside itself, a
      // line through a label. Each candidate fix is tried in place and offered only when the break is
      // gone and the text stays whole (inside its block, that block's parent, and every clipping box);
      // when none holds, apply is [] and the fix names the markup edit.
      const trial = (edits, ok) => {
        const saved = edits.map(([n, p]) => [n, p, n.style.getPropertyValue(p), n.style.getPropertyPriority(p)]);
        edits.forEach(([n, p, v]) => n.style.setProperty(p, v, "important"));
        const good = ok();
        saved.reverse().forEach(([n, p, v, pr]) => (v ? n.style.setProperty(p, v, pr) : n.style.removeProperty(p)));
        return good;
      };
      const blockOf = (el) => {
        let n = el;
        while (n.parentElement && n !== layer && /^inline|contents/.test(getComputedStyle(n).display)) n = n.parentElement;
        return n;
      };
      const textRects = (el) =>
        [...el.childNodes]
          .filter((c) => c.nodeType === 3 && c.nodeValue.trim())
          .flatMap((c) => {
            range.selectNodeContents(c);
            return [...range.getClientRects()].filter((q) => q.width > 1);
          });
      const whole = (el) => {
        const b = blockOf(el),
          outs = [b, b.parentElement];
        for (let n = el; n && n !== document.body; n = n.parentElement) if (/hidden|clip/.test(getComputedStyle(n).overflowX + getComputedStyle(n).overflowY)) outs.push(n);
        return textRects(el).every((q) =>
          outs.every((n) => {
            const cs = getComputedStyle(n),
              o = n.getBoundingClientRect();
            const l = o.left + parseFloat(cs.borderLeftWidth) + (n === b ? parseFloat(cs.paddingLeft) : 0),
              r = o.right - parseFloat(cs.borderRightWidth) - (n === b ? parseFloat(cs.paddingRight) : 0);
            return q.left >= l - 1 && q.right <= r + 1 && (!/hidden|clip/.test(cs.overflowY) || (q.top >= o.top - 1 && q.bottom <= o.bottom + 1));
          }),
        );
      };
      const firstFix = (cands, ok) => cands.find((edits) => edits.length && trial(edits, ok)) || [];
      const asEdits = (edits) => [
        ...edits
          .reduce((m, [n, property, value]) => {
            const k = `${property}|${value}`;
            (m.get(k) || m.set(k, { els: [], property, value }).get(k)).els.push(n);
            return m;
          }, new Map())
          .values(),
      ];
      const say = (edits) => edits.map(([n, p, v]) => `${p} to ${v}`).join(", ") + (edits.length ? ` on ${sel(edits[0][0])}` : "");
      const breaking = new Map();
      // One check per break kind, element name, and cause; its text and fix name every label it holds
      // ("93" and "94"), its zones outline each.
      const addBreak = (key, el, f) => {
        const e = breaking.get(key);
        if (e) ((e.count += 1), (e.edits = union([e.edits, f.edits])), e.els.push(el), e.zones.push(f.zone));
        else breaking.set(key, { kind: "break", count: 1, ...f, els: [el], zones: [f.zone] });
      };
      const quote = (els) => {
        const q = [...new Set(els.map((el) => `"${label(el).slice(0, 24)}"`))];
        return q.length > 1 ? `${q.slice(0, -1).join(", ")} and ${q.at(-1)}` : q[0];
      };
      const open = (el) => shown(el) && !pinned(el, layer);
      for (const { el, box: n, off } of brk.cuts) {
        if (!open(el)) continue;
        let nw = null;
        for (let m = el; m && m !== n.parentElement; m = m.parentElement) if (/nowrap|pre$/.test(getComputedStyle(m).whiteSpace)) nw = m;
        const cs = getComputedStyle(n),
          edits = firstFix(
            [
              nw ? [[nw, "white-space", "normal"]] : [],
              /auto|scroll/.test(cs.overflowY)
                ? []
                : [
                    [n, "height", "auto"],
                    [n, "max-height", "none"],
                  ],
            ],
            () => whole(el),
          );
        addBreak(`cut|${sel(el)}|${sel(n)}`, el, {
          where: sel(edits[0]?.[0] || el),
          text: label(el),
          against: `cut by ${sel(n)} at ${Math.round(n.getBoundingClientRect().width)}×${Math.round(n.getBoundingClientRect().height)}, which hides its overflow`,
          off,
          fix: (q) =>
            edits.length ? `Set ${say(edits)}; ${sel(el)} ${q} is cut by ${off}px with no ellipsis.` : `No CSS-only fix keeps ${q} whole inside ${sel(n)}; shorten it or give it room in the markup.`,
          edits: asEdits(edits),
          score: 0.8,
          zone: n.getBoundingClientRect(),
        });
      }
      // A value cut to an ellipsis. An ellipsis is designed on a long text (a title in a list) and a break
      // on a short value (a date, ID, number, amount, or up to three words in 16 characters), 0.7, or on
      // a text no longer than its column's other values (same name, same left edge) that all show whole,
      // 0.6. It renders when the text passes the content box of the box that draws it, by any fraction.
      const ellipsisOf = (el) => {
        for (let n = el; n && n !== layer; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (/hidden|clip/.test(cs.overflowX)) return cs.textOverflow === "ellipsis" ? n : null;
          if (/^inline-(block|flex|grid)$/.test(cs.display)) return null;
        }
        return null;
      };
      const shortBy = (el) => {
        const n = ellipsisOf(el);
        if (!n) return 0;
        const cs = getComputedStyle(n),
          o = n.getBoundingClientRect(),
          l = o.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
          r = o.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
        return Math.max(0, ...textRects(el).map((q) => Math.max(q.right - r, l - q.left)));
      };
      const columnOf = (el) => {
        const x = el.getBoundingClientRect().left;
        let ms = [];
        try {
          ms = [...document.querySelectorAll(sel(el))];
        } catch {}
        return ms.filter((m) => m !== el && textRects(m).length && Math.abs(m.getBoundingClientRect().left - x) <= 2);
      };
      const valueCut = (el) => {
        if (shortBy(el) <= 0.01) return 0;
        const s = label(el),
          words = s.split(/\s+/).length,
          col = columnOf(el),
          rest = col.length >= 2 && col.every((m) => shortBy(m) <= 0.01) && s.length <= Math.max(...col.map((m) => label(m).length));
        return (s.length <= 16 && words <= 3) || (/\d/.test(s) && s.length <= 24 && words <= 4) ? { score: 0.7, rest } : rest ? { score: 0.6, rest } : 0;
      };
      const valueCuts = () => new Set([...new Set(brk.runs.map((x) => x.el))].filter((el) => open(el) && valueCut(el)));
      const cutNow = valueCuts();
      for (const el of cutNow) {
        const n = ellipsisOf(el),
          off = shortBy(el),
          { score, rest } = valueCut(el),
          w = n.getBoundingClientRect().width,
          want = round4(w + off, true);
        // A table cell takes the width from its column: the col when the table has one, else every cell.
        const cell = n.closest("td, th"),
          table = cell?.closest("table"),
          i = cell?.cellIndex,
          col = table?.querySelectorAll(":scope > colgroup > col, :scope > col")[i],
          cells = table ? [...table.rows].map((row) => row.cells[i]).filter(Boolean) : [],
          ws = getComputedStyle(n).whiteSpace,
          nowrap = /nowrap|pre$/.test(ws) ? [] : [[n, "white-space", "nowrap"]];
        const pad = (c) => {
          const cs = getComputedStyle(c);
          return cs.boxSizing === "border-box" ? 0 : ["Left", "Right"].reduce((s, d) => s + parseFloat(cs[`padding${d}`]) + parseFloat(cs[`border${d}Width`]), 0);
        };
        const edits = firstFix(
          cell
            ? [[...nowrap, ...(col ? [[col, "width", `${want}px`]] : cells.map((c) => [c, "width", `${want - pad(c)}px`]))]]
            : [
                [[n, "flex-shrink", "0"]],
                [
                  [n, "min-width", "max-content"],
                  [n, "flex-shrink", "0"],
                ],
              ],
          () => shortBy(el) <= 0.01 && whole(el) && [...valueCuts()].every((m) => cutNow.has(m)),
        );
        const on = cell ? `${col ? "the col of" : "every cell of"} column ${i + 1} in ${sel(table)}` : "";
        addBreak(`ellipsis|${sel(el)}|${sel(n)}`, el, {
          where: sel(el),
          text: label(el),
          against: `cut to an ellipsis by ${sel(n)} at ${Math.round(w)}px${rest ? ", where its column's other values show whole" : ""}`,
          off: Math.ceil(off),
          fix: (q) =>
            !edits.length
              ? `No CSS-only fix keeps ${q} whole in ${sel(n)} without cutting another value; give it ${want}px in the markup or shorten it.`
              : cell
                ? `Set width to ${want}px on ${on}${nowrap.length ? ` and white-space to nowrap on ${sel(n)}` : `, keeping white-space: nowrap`}; ${q} shows as an ellipsis, ${Math.ceil(off)}px too long for its cell.`
                : `Set ${say(edits)}; ${q} shows as an ellipsis, ${Math.ceil(off)}px too long for ${sel(n)}.`,
          edits: asEdits(edits),
          score,
          zone: n.getBoundingClientRect(),
        });
      }
      for (const { el, t, at, token, rs } of brk.splits) {
        if (!open(el)) continue;
        const block = blockOf(el),
          alone = el.textContent.trim() === token;
        const edits = firstFix(
          [alone ? [[el, "white-space", "nowrap"]] : [], block !== el || !alone ? [[block, "text-wrap", "balance"]] : [], alone ? [] : [[el, "white-space", "nowrap"]]],
          () => !splitAt(t, at, token.length) && whole(el),
        );
        (range.setStart(t, at), range.setEnd(t, at + token.length));
        const head = rs.filter((q) => Math.abs(q.top - rs[0].top) < 2).reduce((s, q) => s + q.width, 0),
          tail = rs.reduce((s, q) => s + q.width, 0) - head;
        addBreak(`wrap|${sel(el)}|${token}`, el, {
          where: sel(edits[0]?.[0] || el),
          text: label(el),
          against: `"${token}" wraps inside itself`,
          off: Math.round(tail),
          fix: () =>
            edits.length
              ? `Set ${say(edits)} so "${token}" stays on one line; it wraps mid-token and its last ${Math.round(tail)}px drop to the next line.${alone ? "" : ` Balance holds at this width only; "${token}" in its own element with white-space: nowrap holds at every width.`}`
              : `No CSS-only fix keeps "${token}" on one line without cutting text; wrap it in its own element with white-space: nowrap.`,
          edits: asEdits(edits),
          score: 0.7,
          zone: range.getBoundingClientRect(),
        });
      }
      for (const { el, r, line, off } of brk.strikes) {
        if (!open(el)) continue;
        const cs = getComputedStyle(el),
          x = (r.left + r.right) / 2,
          y = (r.top + r.bottom) / 2;
        const under =
          x >= 0 && y >= 0 && x < innerWidth && y < innerHeight
            ? document.elementsFromPoint(x, y).find((n) => !el.contains(n) && n !== line && !line.contains(n) && rgba(getComputedStyle(n).backgroundColor)[3] > 200)
            : null;
        const fill = under ? getComputedStyle(under).backgroundColor : "rgb(255, 255, 255)";
        const stretched = /absolute|fixed/.test(cs.position) && cs.left !== "auto" && cs.right !== "auto" && /center/.test(cs.textAlign);
        const edits = [
          ...(cs.position === "static" ? [[el, "position", "relative"]] : []),
          [el, "z-index", "1"],
          [el, "background-color", fill],
          ...(stretched
            ? [
                [el, "width", "fit-content"],
                [el, "margin-inline", "auto"],
              ]
            : []),
        ];
        const ok = trial(edits, () => textRects(el).every((q) => !strikeOf(el, q, line)) && whole(el));
        addBreak(`strike|${sel(el)}|${sel(line)}`, el, {
          where: sel(el),
          text: label(el),
          against: `${sel(line)}, a line ${Math.round(line.getBoundingClientRect().width)}×${Math.round(line.getBoundingClientRect().height)} at y ${Math.round(line.getBoundingClientRect().top)}`,
          off,
          fix: (q) =>
            ok
              ? `Set ${say(edits)}, so the line runs behind the label; ${sel(line)} strikes through ${q} between its cap height and baseline.`
              : `No CSS-only fix lifts ${q} off ${sel(line)}; move the label or the line in the markup.`,
          edits: ok ? asEdits(edits) : [],
          score: 0.7,
          zone: r,
        });
      }
      checks.push(...[...breaking.values()].map(({ els, zones, fix, ...f }) => ({ ...f, text: [...new Set(els.map(label))].join(", ").slice(0, 40), fix: fix(quote(els)), zone: zones })));
      const out = ranked(checks);
      const hue = {
        row: "210 80% 50%",
        above: "275 70% 55%",
        section: "275 70% 55%",
        inner: "0 0% 70%",
        below: "150 65% 40%",
        inset: "0 0% 55%",
      };
      // Labels are placed, not anchored: each takes the first of its spots that covers no text on the
      // screen and no label placed before it, else it is left out (its number stays in the JSON).
      // Check badges go first, at their fixed spots.
      const inks = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      for (let t; (t = tw.nextNode()); ) {
        if (!shown(t.parentElement)) continue;
        const rr = document.createRange();
        rr.selectNodeContents(t);
        for (const q of rr.getClientRects()) if (q.width > 1 && q.height > 1 && q.bottom > 0 && q.top < innerHeight) inks.push(q);
      }
      // Charts, waveforms, avatars, and media take no label either.
      for (const el of [...chartBoxes, ...[...dataEls, ...layer.querySelectorAll("img, video, canvas, svg, [role=img]")].map((n) => n.getBoundingClientRect())]) inks.push(el);
      const taken = [];
      color.font = "600 10px ui-monospace, Menlo, monospace";
      const tag = (text, spots, css, fixed = false) => {
        const w = Math.ceil(color.measureText(text).width) + 8,
          free = (s) =>
            s.left >= 0 &&
            s.top >= 0 &&
            s.left + w <= innerWidth &&
            s.top + 14 <= innerHeight &&
            ![...inks, ...taken].some((q) => q.left < s.left + w && q.right > s.left && q.top < s.top + 14 && q.bottom > s.top);
        const s = fixed ? spots[0] : spots.find(free);
        if (!s) return "";
        taken.push({ left: s.left, top: s.top, right: s.left + w, bottom: s.top + 14 });
        return `<b style="left:${s.left}px;top:${s.top}px;${css}">${text}</b>`;
      };
      const badges = out
        .map((f, k) => {
          // The badge sits off the text a break or collision flags: outside its box's top-left corner; else inside, at the right.
          const r = [f.g || f.gut || f.zone].flat()[0],
            w = Math.ceil(color.measureText(String(k + 1)).width) + 8;
          const at = /break|collision/.test(f.kind) ? { left: r.left - 1 - w, top: r.top - 15 } : { left: r.right - (f.gut ? -18 : 4) - w, top: (r.top + r.bottom) / 2 - 7 };
          return tag(String(k + 1), [at], "background:rgb(220 20 60);z-index:1", true);
        })
        .join("");
      // A gap's label: centered on its height, from the lane's left inset rightward, else just outside the lane.
      const gapTags = gaps
        .filter((g) => g.role !== "inset" && g.h >= 8)
        .map((g) => {
          const y = (g.top + g.bottom) / 2 - 7,
            text = `${g.h} ${g.role}`,
            w = color.measureText(text).width + 8;
          const xs = [];
          for (let x = g.left + 4; x + w <= g.right; x += 24) xs.push(x);
          return tag(
            text,
            [...xs, g.left - w - 2, g.right + 2].map((left) => ({ left, top: y })),
            `background:hsl(${hue[g.role]})`,
          );
        })
        .join("");
      // A gutter's label: at its top, middle, or bottom, else just above or below it.
      const gutTags = gutters
        .filter((g) => g.w >= 12)
        .map((g) => {
          const w = color.measureText(String(g.w)).width + 8,
            left = (g.left + g.right) / 2 - w / 2;
          return tag(
            String(g.w),
            [g.top + 2, (g.top + g.bottom) / 2 - 7, g.bottom - 16, g.top - 15, g.bottom + 1].map((top) => ({ left, top })),
            "background:hsl(30 80% 42%)",
          );
        })
        .join("");
      const host = overlay(
        gaps.map((g) => box(g, `background:hsl(${hue[g.role]} / ${g.role === "inset" ? 0.06 : 0.16})`)).join("") +
          gutters.map((g) => box(g, "background:hsl(30 90% 55% / .18)")).join("") +
          out
            .map((f) =>
              [f.g || f.gut || f.zone]
                .flat()
                .map((r) =>
                  box(
                    r,
                    `outline:2px solid rgb(220 20 60);${f.zone && !/break|collision/.test(f.kind) ? "background:repeating-linear-gradient(45deg,rgb(220 20 60 / .18) 0 6px,transparent 6px 12px)" : ""}`,
                  ),
                )
                .join(""),
            )
            .join("") +
          badges +
          gapTags +
          gutTags,
      );
      window.__viewClear = () => host.remove();
      const byRole = (role) => tally(gaps.filter((g) => g.role === role).map((g) => g.h));
      return JSON.stringify({
        view: mode,
        layer: name(layer),
        ...(warning && { warning }),
        scale,
        columns: lanes.size,
        gaps: Object.fromEntries(["row", "section", "inner", "above", "below", "inset"].map((r) => [r, byRole(r)])),
        gutters: tally(gutters.map((g) => g.w)),
        checks: out.map(({ g, gut, zone, ...f }) => f),
      });
    })();

  if (mode === "grid")
    return (() => {
      // An 8px grid from the layer's content-box corner, the scene's column edges (2px, over each column's
      // height), and the shared
      // edges (1px): a left edge that three or more things share (text by its line box, controls, media,
      // filled or outlined boxes), or a right edge of three boxes that span their parent or right-aligned
      // texts; drawn from the first to the last of them. Ragged right edges of text and of content-sized
      // boxes (chips, buttons) are not lines. No checks.
      const cs = getComputedStyle(layer);
      const x0 = B.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
        y0 = B.top + parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop);
      const things = [];
      const take = (el, r, right = true) => r.width > 2 && r.height > 2 && r.bottom > V.top && r.top < V.bottom && things.push({ r, right, scope: container(el) || column(el) });
      const spans = (el, r) => {
        const p = el.parentElement,
          q = p.getBoundingClientRect(),
          ps = getComputedStyle(p);
        return columns.has(el) || r.width >= q.width - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight) - parseFloat(ps.borderLeftWidth) - parseFloat(ps.borderRightWidth) - 2;
      };
      const range = document.createRange();
      const walk = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      for (let n; (n = walk.nextNode()); ) {
        if (!shown(n.parentElement) || isData(n.parentElement)) continue;
        range.selectNodeContents(n);
        const right = /right|end/.test(getComputedStyle(n.parentElement).textAlign);
        for (const r of range.getClientRects()) take(n.parentElement, r, right);
      }
      for (const el of layer.querySelectorAll("*"))
        if (!el.parentElement.closest("svg") && shown(el) && !isData(el) && (el.matches("svg, img, video, canvas, input, select, textarea, button") || paintedBox(el))) {
          const r = el.getBoundingClientRect();
          take(el, r, spans(el, r));
        }
      // Per card or column: an edge counts only among the things it holds, and is drawn over their span.
      const scopes = new Map();
      for (const { r, right, scope } of things) {
        const lines = scopes.get(scope) || scopes.set(scope, new Map()).get(scope);
        for (const x of new Set([Math.round(r.left), ...(right ? [Math.round(r.right)] : [])])) {
          const k = [...lines.keys()].find((v) => Math.abs(v - x) <= 1) ?? x,
            l = lines.get(k) || { n: 0, top: r.top, bottom: r.bottom };
          lines.set(k, {
            n: l.n + 1,
            top: Math.min(l.top, r.top),
            bottom: Math.max(l.bottom, r.bottom),
            scope,
          });
        }
      }
      const shared = [...scopes.values()]
        .flatMap((lines) => [...lines])
        .filter(([, l]) => l.n >= 3)
        .sort((p, q) => p[0] - q[0]);
      const cols = [...columns].filter((c) => layer.contains(c) && shown(c));
      const edges = cols.flatMap((c) => {
        const r = c.getBoundingClientRect();
        return [r.left, r.right].map((x) => ({
          left: Math.round(x) - 1,
          right: Math.round(x) + 1,
          top: Math.max(V.top, r.top),
          bottom: Math.min(V.bottom, r.bottom),
        }));
      });
      // Horizontal, per row of lanes (side-by-side children of one parent, 120 by 48 or more, a row of
      // like cards included): each lane's card tops and bottoms (its own when it is painted) and the
      // first baselines of its headings, of each card's first line, and of text sitting on the lane
      // itself (a KPI cell). An edge is drawn faint over its box; an edge or a baseline two or more lanes
      // of the row share is drawn strong over each of them and across the gutters between them.
      const lanes = new Set();
      for (const p of [layer, ...layer.querySelectorAll("*")]) {
        if (p.closest("table, svg") || isData(p)) continue;
        const ks = [...p.children]
          .filter(shown)
          .map((k) => [k, k.getBoundingClientRect()])
          .filter(([, r]) => r.width >= 120 && r.height >= 48);
        for (const [a, ra] of ks)
          if (ks.some(([b, rb]) => b !== a && (rb.left >= ra.right - 1 || rb.right <= ra.left + 1) && Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > 24)) lanes.add(a);
      }
      const laneOf = (el) => {
        for (let n = el; n && n !== layer; n = n.parentElement) if (lanes.has(n)) return n;
        return null;
      };
      const cardIn = (el, lane) => {
        for (let n = el; n && n !== lane; n = n.parentElement) if (n.getBoundingClientRect().height > 36 && paintedBox(n)) return n;
        return null;
      };
      const marks = [];
      const mark = (lane, kind, y, left, right) => y >= V.top && y <= V.bottom && marks.push({ lane, scope: lane.parentElement, kind, y, left, right });
      for (const el of layer.querySelectorAll("*")) {
        const lane = laneOf(el);
        if (!lane || !shown(el) || isData(el) || el.getBoundingClientRect().height <= 36 || !paintedBox(el) || (el !== lane && cardIn(el.parentElement, lane))) continue;
        const r = el.getBoundingClientRect();
        for (const y of [r.top, r.bottom]) mark(lane, "edge", y, r.left, r.right);
      }
      const firsts = new Set();
      const hwalk = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      for (let n; (n = hwalk.nextNode()); ) {
        const el = n.parentElement,
          lane = laneOf(el);
        if (!lane || !shown(el) || isData(el)) continue;
        const card = cardIn(el, lane),
          first = card && !firsts.has(card);
        if (card) firsts.add(card);
        if (card && !first && !el.closest("h1, h2, h3, h4, h5, h6, [role=heading]")) continue;
        range.selectNodeContents(n);
        const r = range.getClientRects()[0];
        if (!r) continue;
        const ts = getComputedStyle(el);
        color.font = `${ts.fontStyle} ${ts.fontWeight} ${ts.fontSize} ${ts.fontFamily}`;
        const m = color.measureText("Hx");
        const lr = lane.getBoundingClientRect();
        mark(lane, "baseline", r.top + (r.height - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent, lr.left, lr.right);
      }
      const rows = [];
      for (const p of marks) {
        const row = rows.find((q) => q.scope === p.scope && q.kind === p.kind && Math.abs(q.y - p.y) <= 1);
        if (row) row.marks.push(p);
        else rows.push({ scope: p.scope, kind: p.kind, y: p.y, marks: [p] });
      }
      const flat = [];
      for (const row of rows) {
        const members = new Set(row.marks.map((p) => p.lane));
        row.n = members.size;
        if (row.n < 2) {
          if (row.kind === "edge") for (const p of row.marks) flat.push({ ...p, strong: false });
          continue;
        }
        // Join neighbouring members unless a lane of the row that misses the line sits between them.
        const spans = row.marks.map((p) => ({ left: p.left, right: p.right })).sort((a, b) => a.left - b.left);
        const others = [...lanes].filter((l) => l.parentElement === row.scope && !members.has(l)).map((l) => l.getBoundingClientRect());
        const segs = [spans[0]];
        for (const s of spans.slice(1)) {
          const last = segs.at(-1);
          if (!others.some((o) => o.left >= last.right - 1 && o.right <= s.left + 1 && o.top <= row.y && o.bottom >= row.y)) last.right = Math.max(last.right, s.right);
          else segs.push({ ...s });
        }
        for (const s of segs) flat.push({ ...s, y: row.y, kind: row.kind, strong: true });
      }
      const across = rows.filter((row) => row.n >= 2);
      const host = overlay(
        box(
          V,
          `background-image:linear-gradient(to right, rgb(0 120 255 / .06) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 120 255 / .06) 1px, transparent 1px), linear-gradient(to right, rgb(0 120 255 / .10) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 120 255 / .10) 1px, transparent 1px);background-size:8px 8px, 8px 8px, 32px 32px, 32px 32px;background-position:${x0 - V.left}px ${y0 - V.top}px`,
        ) +
          shared
            .map(([x, l]) =>
              box(
                {
                  left: x,
                  right: x + 1,
                  top: Math.max(V.top, l.top),
                  bottom: Math.min(V.bottom, l.bottom),
                },
                "background:rgb(0 90 230 / .7)",
              ),
            )
            .join("") +
          edges.map((e) => box(e, "background:rgb(230 0 120 / .8)")).join("") +
          flat
            .map((s) => {
              const y = Math.round(s.y),
                h = s.kind === "edge" && s.strong ? 2 : 1;
              const paint =
                s.kind === "baseline" ? "background:repeating-linear-gradient(to right, rgb(240 110 0 / .9) 0 5px, transparent 5px 8px)" : `background:rgb(240 110 0 / ${s.strong ? 0.9 : 0.45})`;
              return box({ left: Math.max(V.left, s.left), right: Math.min(V.right, s.right), top: y - (h >> 1), bottom: y - (h >> 1) + h }, paint);
            })
            .join(""),
      );
      window.__viewClear = () => host.remove();
      return JSON.stringify({
        view: mode,
        layer: name(layer),
        ...(warning && { warning }),
        origin: { x: Math.round(x0), y: Math.round(y0) },
        columns: cols.length,
        edges: shared.map(([x, l]) => ({ x, n: l.n, in: sel(l.scope) })),
        rows: across.map((row) => ({ y: Math.round(row.y), kind: row.kind, n: row.n, in: sel(row.scope) })),
      });
    })();

  const page = target === document.documentElement;
  const R = page ? { left: 0, top: 0, right: innerWidth, bottom: innerHeight } : target.getBoundingClientRect();
  // One grey of the same lightness over white, so a dark button stays a heavy block.
  const grey = (c) => {
    const [r, g, b, a] = rgba(c);
    const v = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) * (a / 255) + 255 * (1 - a / 255));
    return `rgb(${v},${v},${v})`;
  };
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect(); // a 1px box is visually hidden text
    return r.width > 1 || r.height > 1;
  };
  const inView = (r) => r.width > 0 && r.height > 0 && r.bottom > R.top && r.top < R.bottom && r.right > R.left && r.left < R.right;
  // The color behind an element: the fills painted under the center of r (siblings behind included, the
  // element's own children not), else its own and its ancestors' fills, composited over white.
  const backdrop = (el, r) => {
    const [x, y] = r ? [r.left + r.width / 2, r.top + r.height / 2] : [-1, -1];
    const boxes =
      x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? document.elementsFromPoint(x, y).filter((n) => (!el.contains(n) || n === el) && !n.closest("#__axes, #__view, #__heat, #__count")) : [];
    if (!boxes.length) for (let n = el; n; n = n.parentElement) boxes.push(n);
    const stack = [];
    for (const n of boxes) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) stack.push(c);
      if (c[3] === 255) break;
    }
    let rgb = [255, 255, 255];
    for (const c of stack.reverse()) rgb = rgb.map((v, i) => c[i] * (c[3] / 255) + v * (1 - c[3] / 255));
    return `rgb(${rgb.map(Math.round)})`;
  };
  const els = page ? document.body.querySelectorAll("*") : [target, ...target.querySelectorAll("*")];

  // textonly restyles the page in place, so the layout stays exact.
  if (mode === "textonly") {
    const saved = [];
    const put = (el, prop, value) => {
      saved.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
      el.style.setProperty(prop, value, "important");
    };
    const base = backdrop(page ? document.body : target);
    const s = "[data-view-scope]";
    const style = document.createElement("style");
    style.textContent = `${s}, ${s} *, ${s} *::before, ${s} *::after { background: transparent !important; border-color: transparent !important; outline-color: transparent !important; box-shadow: none !important }
           ${s} { background: ${base} !important }
           ${s} :is(svg, img, video, canvas, picture, iframe) { visibility: hidden !important }
           ${s} :is(input:not([type=checkbox]):not([type=radio]), textarea, select) { outline: 1px solid #c8c8c8 !important; outline-offset: -1px }
           ${s} :is(input[type=checkbox], input[type=radio], [role=switch], [role=checkbox], [role=radio]) { appearance: none !important; outline: 1.5px solid #8a8a8a !important; outline-offset: -1.5px }
           ${s} :is(input[type=radio], [role=switch], [role=radio]) { border-radius: 999px !important }
           ${s} :is(input:checked, [aria-checked=true]) { background: #8a8a8a !important }
           ${s} [role=switch] > * { background: ${base} !important; outline: 1.5px solid #8a8a8a !important }`;
    target.setAttribute("data-view-scope", "");
    document.head.appendChild(style);
    let recolored = 0;
    {
      // Text that only showed on its fill, such as a primary button's label, takes the page's ink.
      const light = (c) =>
        rgba(c)
          .slice(0, 3)
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ink = getComputedStyle(page ? document.body : target).color;
      const walker = document.createTreeWalker(page ? document.body : target, NodeFilter.SHOW_TEXT);
      const done = new Set();
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const el = t.parentElement;
        if (!t.textContent.trim() || !el || done.has(el)) continue;
        done.add(el);
        if (Math.abs(light(getComputedStyle(el).color) - light(base)) < 64) (put(el, "color", ink), recolored++);
      }
    }
    window.__viewClear = () => {
      style.remove();
      target.removeAttribute("data-view-scope");
      for (const [el, prop, value, priority] of saved.reverse()) value ? el.style.setProperty(prop, value, priority) : el.style.removeProperty(prop);
    };
    return JSON.stringify({ view: mode, target: name(target), recolored });
  }

  const o = document.createElement("div");
  o.id = "__view";
  o.style.cssText = `position:fixed;left:${R.left}px;top:${R.top}px;width:${R.right - R.left}px;height:${R.bottom - R.top}px;overflow:hidden;pointer-events:none;z-index:2147483647;${mode === "wireframe" ? `background:${grey(backdrop(page ? document.body : target))}` : ""}`;
  const add = (r, css) => {
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:${r.left - R.left}px;top:${r.top - R.top}px;width:${r.width}px;height:${r.height}px;${css}`;
    o.appendChild(d);
  };
  const n = { boxes: 0, media: 0, textLines: 0 };

  if (mode === "wireframe") {
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (!inView(r) || !visible(el) || el.closest("#__axes")) continue;
      const cs = getComputedStyle(el);
      if (el.matches("img, svg, video, canvas, picture, iframe")) {
        if (!el.parentElement.closest("svg")) (add(r, `background:#9a9a9a;border-radius:${cs.borderRadius}`), n.media++);
        continue;
      }
      if (el.matches("input[type=checkbox], input[type=radio], [role=checkbox], [role=radio], [role=switch]")) {
        const on = el.checked || el.getAttribute("aria-checked") === "true" || el.getAttribute("data-state") === "checked";
        add(
          r,
          `box-sizing:border-box;border:1.5px solid #8a8a8a;background:${on ? "#8a8a8a" : "transparent"};border-radius:${el.matches("[type=radio], [role=radio], [role=switch]") ? "999px" : "3px"}`,
        );
        n.boxes++;
        continue;
      }
      const fill = rgba(cs.backgroundColor)[3] > 5;
      const sides = ["Top", "Right", "Bottom", "Left"].filter((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 5);
      const ring = cs.boxShadow !== "none" && cs.boxShadow.split(/,(?![^(]*\))/).some((l) => rgba(l.match(/[a-z]+\([^)]*\)|#\w+/)?.[0] || "#000")[3] > 0);
      if (fill || sides.length || ring) {
        const lines = ring ? "outline:1px solid #b4b4b4;outline-offset:-1px;" : sides.map((s) => `border-${s.toLowerCase()}:1px solid #b4b4b4;`).join("");
        add(r, `box-sizing:border-box;background:${fill ? grey(cs.backgroundColor) : "transparent"};${lines}border-radius:${cs.borderRadius}`);
        n.boxes++;
      }
    }
  }

  // Text: each line box becomes a bar (wireframe) or is painted over with its background (notext).
  const walker = document.createTreeWalker(page ? document.body : target, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!t.textContent.trim() || !el || el.closest("#__axes, #__view, script, style") || !visible(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(t);
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    for (const r of range.getClientRects()) {
      if (!inView(r)) continue;
      if (mode === "wireframe") {
        const h = Math.max(3, Math.round(size * 0.55));
        add(
          {
            left: r.left,
            top: r.top + (r.height - h) / 2,
            width: r.width,
            height: h,
          },
          `background:${grey(cs.color)};border-radius:2px`,
        );
      } else {
        // 3px more covers an underline, where the same fill runs on below the text (not into a bar under a value label).
        const fill = backdrop(el, r),
          under = backdrop(el, { left: r.left, width: r.width, top: r.bottom + 1, height: 2 });
        add(
          {
            left: r.left - 1,
            top: r.top,
            width: r.width + 2,
            height: r.height + (fill === under ? 3 : 0),
          },
          `background:${fill}`,
        );
      }
      n.textLines++;
    }
  }
  if (mode === "notext") {
    for (const el of els) {
      if (!el.matches?.("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select")) continue;
      const r = el.getBoundingClientRect();
      if (!inView(r) || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const [pl, pr, pt, pb] = ["Left", "Right", "Top", "Bottom"].map((s) => parseFloat(cs[`padding${s}`]) + parseFloat(cs[`border${s}Width`]));
      add(
        {
          left: r.left + pl,
          top: r.top + pt,
          width: r.width - pl - pr,
          height: r.height - pt - pb,
        },
        `background:${backdrop(el)}`,
      );
    }
  }
  document.body.appendChild(o);
  window.__viewClear = () => document.getElementById("__view")?.remove();
  return JSON.stringify({ view: mode, target: name(target), ...n });
})();
