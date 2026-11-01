// Count: is the screen crowded or inconsistent? One count of the layer (window.__axesLayer, else
// the last open dialog or sheet, else main, else the body). It returns `checks`, the minimum checks
// (the floor of a review, not the review; ranked, at most 20, numbered on the page and in the panel),
// of four kinds:
//   crowding  one action label on 4+ buttons in a column (a note, under 0.5).
//   sibling   one of 4+ sibling containers of one kind (tag and first class) differs from the rest in
//             fill or border, padding, or first-text style; or a few cells of one column in a table or
//             in 4+ repeated rows rendered unlike the rest: a link among plain text, a chip among bare
//             text, another size or weight, the same text in another color. A chip's hue and a colored
//             value that is no link (an overdue date) are designed and stay quiet. Links among plain
//             text are a markup fix (link every cell, or none), with no `apply`.
//   control   controls in one group (the nearest box holding two or more) whose heights differ by 1 to 4px.
//   contrast  text under WCAG AA (4.5, or 3 for 24px or 18.66px bold text) against its painted
//             background, its and its ancestors' opacity multiplied into the ink; one check per text
//             color naming every holder, led by one in view (faded text: one per element holding the
//             fade); every fail scores 0.5 or more. Text under a running opacity animation is skipped.
//             An ink set per holder (inline, as speaker names) is a markup fix: darken each, no `apply`.
// `where` names the element holding the value (`div.rtime > span`), never a named ancestor. `apply`
// is the fix as `[{ selector, property, value }]`; its selector comes from exact() and matches only
// the elements the fix means (`[]` when none does, or when the fix is markup); the fix sentence
// names the same elements.
// Plus the style inventory of the whole layer (font families, sizes, weights, line heights, text
// colors, backgrounds, radii, lines, shadows, icons, gaps, buttons, controls; scrolled out of view
// too), tokens and off-token values, unnamed controls, small targets, `words` (every visible word in
// the layer, scrolled out of view too), `rows` and `cards` (sizes and emphases), and `text` (nothing
// lines, value formats, repeats, truncation). Data (charts, waveforms, avatar stacks) is skipped.
// Draws a panel (outside the region when the window has room) and numbered outlines;
// window.__countClear() removes them.
(() => {
  window.__countClear?.();
  const set = window.__axesLayer;
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
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  const toHex = (c) =>
    `#${c
      .slice(0, c[3] === undefined || c[3] >= 255 ? 3 : 4)
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")}`;
  const hex = (c) => toHex(rgba(c));
  const over = (top, under) => under.map((v, i) => top[i] * (top[3] / 255) + v * (1 - top[3] / 255));
  const flat = (c) => over(rgba(c), [255, 255, 255]); // a color as it shows on white
  const chroma = (c) => Math.max(...c.slice(0, 3)) - Math.min(...c.slice(0, 3));
  const hue = ([r, g, b]) => {
    const mx = Math.max(r, g, b),
      d = mx - Math.min(r, g, b);
    if (!d) return 0;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };
  const HUES = [
    [15, "red"],
    [45, "orange"],
    [70, "yellow"],
    [165, "green"],
    [195, "teal"],
    [255, "blue"],
    [290, "purple"],
    [345, "pink"],
    [360, "red"],
  ];
  const hueName = (c) => HUES.find(([h]) => hue(c) < h)[1];
  const visible = (el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !el.closest("#__axes, #__view, #__count");
  const textOf = (el) => {
    const r = el.getBoundingClientRect();
    return (
      (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40) ||
      `${/IMG|SVG|CANVAS|VIDEO/i.test(el.tagName) ? "image" : "box"} ${Math.round(r.width)}×${Math.round(r.height)}`
    );
  };
  // A named element to point at: climb past a bare div, span, i, or svg.
  const named = (el) => {
    let n = el;
    while (n !== layer && n.parentElement && (n instanceof SVGElement || (/^(DIV|SPAN|I|B)$/.test(n.tagName) && !firstClass(n)))) n = n.parentElement;
    return n;
  };
  // The element itself, by its parent when it has no class; under a bare parent, by its named ancestor.
  const at = (el) => (firstClass(el) || firstClass(el.parentElement) || el === layer ? sel(el) : `${sel(named(el.parentElement))} ${el.tagName.toLowerCase()}`);
  // The holders of a value, commonest first: "div.rtime > span and div.rstatus > span.act".
  const holders = (els) =>
    Object.entries(Object.groupBy(els, at))
      .sort((a, b) => b[1].length - a[1].length)
      .map(([k]) => k);
  const and = (hs) => (hs.length > 1 ? `${hs.slice(0, -1).join(", ")} and ${hs.at(-1)}` : hs[0]);
  // Each holder's selector for exactly its elements (exact(): same(m) lets m match too, it already
  // has the value), tried by its name, then under each named ancestor (`div.done div > span.txt`);
  // null when none fits. exactNames() lists them, lead's holder first, then commonest, else the
  // holder's name; the fix sentence names these, so it and `apply` mean the same elements.
  const exactOf = (es, same) => {
    const ups = [];
    for (let n = es[0].parentElement; n && n !== layer.parentElement; n = n.parentElement) if (firstClass(n) || n.id) ups.push(`${sel(n)} ${at(es[0])}`);
    return exact(es, [at(es[0]), ...ups], same);
  };
  const groups = (els, lead) => Object.values(Object.groupBy(els, at)).sort((a, b) => b.includes(lead) - a.includes(lead) || b.length - a.length);
  const exactNames = (els, same, lead) => groups(els, lead).map((es) => exactOf(es, same) || at(es[0]));
  // The fix as data on exactly els; null when no selector fits, and miss(els) says so.
  const apply = (els, decls, same, tries = []) => {
    const ps = groups(els).map((es) => exactOf(es, same));
    const selector = exact(els, [...tries, ps.every(Boolean) && ps.join(", ")], same);
    return selector && Object.entries(decls).map(([property, value]) => ({ selector, property, value }));
  };
  const miss = (els) => {
    const more = new Set(
      holders(els)
        .flatMap((h) => [...document.querySelectorAll(h)])
        .filter((m) => !els.includes(m)),
    ).size;
    return ` No selector matches only ${els.length > 1 ? "them" : "it"}: ${and(holders(els))} also ${els.length > 1 ? "match" : "matches"} ${more} other elements.`;
  };
  // Opacity on el and its ancestors fades its ink and fill; fades(el) lists the elements holding it.
  const fades = (el) => {
    const out = [];
    for (let n = el; n; n = n.parentElement) if (+getComputedStyle(n).opacity < 1) out.push(n);
    return out;
  };
  const opacity = (el) => fades(el).reduce((o, n) => o * getComputedStyle(n).opacity, 1);
  // Text under a running opacity animation (a fade-in, a pulse) has no resting ink and is not measured.
  const moving = new Set(
    document
      .getAnimations()
      .filter((a) => a.playState === "running" && a.effect?.getKeyframes().some((k) => "opacity" in k))
      .map((a) => a.effect.target),
  );
  const still = (el) => [...moving].every((m) => !m.contains(el));
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  };
  const filled = (cs) => rgba(cs.backgroundColor)[3] > 20;
  const lined = (cs, s = "Top") => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 0;
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratioOf = (f, b) => {
    const [x, y] = [lum(f), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  // The painted background under an element: the boxes at its center from the top down to the first
  // opaque one (siblings painted behind included), each fill faded by its opacity; off screen, its
  // ancestors. Null when another box covers it.
  const backdrop = (el, r) => {
    const [x, y] = [r.left + r.width / 2, r.top + r.height / 2];
    const onScreen = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
    const hits = onScreen ? document.elementsFromPoint(x, y).filter((n) => !n.closest("#__count")) : [];
    if (hits[0] && !el.contains(hits[0]) && !hits[0].contains(el)) return null;
    const boxes = hits.filter((n) => !el.contains(n) || n === el);
    if (!boxes.length) for (let n = el; n; n = n.parentElement) boxes.push(n);
    const stack = [];
    for (const n of boxes) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      c[3] *= opacity(n);
      if (c[3]) stack.push(c);
      if (c[3] >= 255) break;
    }
    return stack.reverse().reduce((under, c) => over(c, under), [255, 255, 255]);
  };
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  const checks = [];
  const check = (f) => checks.push(f);

  // 1. Inventory, whole layer. A list maps value -> [value, uses, sample, first element, every element].
  const lists = {};
  const tally = (list, value, el) => {
    const m = (lists[list] ||= new Map());
    const e = m.get(value) || [value, 0, textOf(el).slice(0, 32), el, []];
    e[1]++;
    e[4].push(el);
    m.set(value, e);
  };
  const BUTTON = "button, [role=button], input[type=button], input[type=submit], a[href][class*=btn], a[href][class*=button]";
  const CONTROL = "input:not([type=hidden], [type=button], [type=submit], [type=checkbox], [type=radio]), select, textarea, [role=combobox]";
  const STATE = "[aria-current]:not([aria-current=false]), [aria-selected=true], [aria-pressed=true], [data-state=active], [data-state=on], .active, .is-active, .selected, .on";
  const textEls = new Set();
  const all = [layer, ...layer.querySelectorAll("*")].filter((el) => !isData(el) && visible(el) && el.getBoundingClientRect().width);
  const lowContrast = new Map();
  const unnamed = [],
    targets = [],
    controls = [];
  for (const el of all) {
    const r = el.getBoundingClientRect(),
      cs = getComputedStyle(el);
    if (![...el.childNodes].some((t) => t.nodeType === 3 && /[\p{L}\p{N}]/u.test(t.textContent))) {
      // Not a text element: boxes, lines, shadows, gaps, icons, controls.
    } else {
      textEls.add(el);
      tally("fontFamilies", cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), el);
      tally("fontSizes", cs.fontSize, el);
      tally("fontWeights", cs.fontWeight, el);
      tally("lineHeights", cs.lineHeight, el);
      const control = el.closest("button, [role=button]"); // ink on a filled control is the control's role
      if (!control || !filled(getComputedStyle(control))) tally("textColors", hex(cs.color), el);
      const bg = !el.closest("[disabled], [aria-disabled=true]") && still(el) && backdrop(el, r);
      if (bg) {
        const ink = rgba(cs.color),
          op = opacity(el),
          fg = over([...ink.slice(0, 3), ink[3] * op], bg),
          ratio = ratioOf(fg, bg);
        const size = parseFloat(cs.fontSize),
          large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700),
          need = large ? 3 : 4.5;
        if (ratio < need) {
          // One check per ink and direction; faded text, one per element holding the fade.
          const dark = lum(bg) > 0.18,
            fade = op < 1 && fades(el),
            key = `${fade ? at(fade.at(-1)) : hex(cs.color)} ${dark}`;
          const e = lowContrast.get(key) || { dark, fade: new Set(), els: [], on: [] };
          if (fade) fade.forEach((n) => e.fade.add(n));
          e.els.push(el);
          e.on.push({ el, ink, fg, op, bg, need, ratio });
          lowContrast.set(key, e);
        }
      }
    }
    if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue;
    const fill = filled(cs),
      line = lined(cs);
    const shadow =
      cs.boxShadow === "none"
        ? ""
        : cs.boxShadow
            .replace(/(rgba?|oklch|oklab|lab|lch|color)\([^)]*\)/g, (c) => hex(c))
            .split(/,\s*(?=#)/)
            .filter((l) => !/^#[0-9a-f]{6}00 /.test(l))
            .join(", ");
    if (fill) tally("backgrounds", hex(cs.backgroundColor), el);
    if ((fill || line || shadow) && cs.borderRadius !== "0px") tally("radii", cs.borderRadius, el);
    if (shadow) tally("shadows", shadow, el);
    if (/flex|grid/.test(cs.display) && cs.gap !== "normal" && cs.gap !== "0px" && el.children.length > 1) tally("gaps", cs.gap, el);
    for (const l of new Set(["Top", "Right", "Bottom", "Left"].filter((s) => lined(cs, s)).map((s) => `${cs[`border${s}Width`]} ${hex(cs[`border${s}Color`])}`))) tally("lines", l, el);
    if (el instanceof SVGSVGElement) {
      const stroke = cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0 ? `stroke ${((parseFloat(cs.strokeWidth) * r.width) / (el.viewBox.baseVal?.width || r.width)).toFixed(1)}` : "fill";
      tally("icons", `${Math.round(r.width)}x${Math.round(r.height)} ${stroke}`, el.closest("button, a, [role], li, label") || el.parentElement);
    }
    const kind = el.matches(CONTROL) ? "controls" : el.matches(BUTTON) ? "buttons" : null;
    if (kind) {
      const edge = line ? `line ${hex(cs.borderTopColor)}` : shadow ? "ring" : "flat";
      tally(
        kind,
        `${el.getAttribute("role") || (el.tagName === "INPUT" ? el.type : el.tagName.toLowerCase())} h${Math.round(r.height)} ${fill ? hex(cs.backgroundColor) : "clear"} ${hex(cs.color)} ${edge} r${cs.borderRadius} ${cs.fontSize}/${cs.fontWeight}`,
        el,
      );
      // A painted control shows its height; a chip is a small painted run of text that is not a button.
      if ((fill || line) && (kind === "controls" || el.innerText.trim()) && !el.matches(STATE)) controls.push({ el, kind: "control", r, cs });
    } else if (fill && r.height < 32 && el.innerText?.trim() && cs.display.startsWith("inline") && !el.closest(BUTTON) && el.children.length <= 2) controls.push({ el, kind: "chip", r, cs });
    if (kind || el.matches("a[href]")) {
      const label = el.labels?.length || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest("label");
      const name =
        el.innerText?.trim() ||
        el.getAttribute("aria-label") ||
        el.getAttribute("aria-labelledby") ||
        el.getAttribute("title") ||
        el.getAttribute("placeholder") ||
        el.querySelector("svg title")?.textContent ||
        (el.matches("input[type=button], input[type=submit]") && el.value) ||
        label;
      if (!name) unnamed.push(sel(el));
      if (cs.display !== "inline") targets.push({ el, r, small: (r.width < 24 || r.height < 24) && !label, name: `${Math.round(r.width)}x${Math.round(r.height)} ${name ? textOf(el) : sel(el)}` });
    }
  }
  // WCAG 2.5.8: a target under 24px passes when a 24px circle on its center touches no other target.
  const center = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const dist = ([x, y], r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
  const small = targets
    .filter(
      (t) =>
        t.small &&
        targets.some((o) => o !== t && !o.el.contains(t.el) && !t.el.contains(o.el) && (o.small ? Math.hypot(...center(t.r).map((v, i) => v - center(o.r)[i])) < 24 : dist(center(t.r), o.r) < 12)),
    )
    .map((t) => t.name);
  // Tokens: every custom property, resolved on a probe to a color or a length.
  const names = new Set();
  const collect = (rules) => {
    for (const r of rules) {
      if (r.style) for (const n of r.style) if (n.startsWith("--")) names.add(n);
      if (r.cssRules) collect(r.cssRules);
    }
  };
  for (const sheet of document.styleSheets)
    try {
      collect(sheet.cssRules);
    } catch {} // a cross-origin or file:// sheet stays closed; the root's computed style still lists its tokens
  for (const n of getComputedStyle(document.documentElement)) if (n.startsWith("--")) names.add(n);
  const probe = document.body.appendChild(document.createElement("div"));
  const tokenColors = new Set(),
    tokenLengths = new Set();
  for (const n of names) {
    probe.style.cssText = `position:absolute;visibility:hidden;color:rgb(1, 2, 3);font-size:77px;width:1234px;color:var(${n});font-size:var(${n});width:var(${n})`;
    const cs = getComputedStyle(probe);
    if (cs.color !== "rgb(1, 2, 3)") tokenColors.add(hex(cs.color).slice(0, 7));
    if (cs.fontSize !== "77px") tokenLengths.add(cs.fontSize);
    if (cs.width !== "1234px") tokenLengths.add(cs.width);
  }
  probe.remove();
  const onToken = {
    textColors: (v) => tokenColors.has(v.slice(0, 7)),
    backgrounds: (v) => tokenColors.has(v.slice(0, 7)),
    fontSizes: (v) => tokenLengths.has(v),
    radii: (v) => v.split(" ").every((x) => tokenLengths.has(x) || x === "0px" || x.endsWith("%") || parseFloat(x) >= 999),
  };
  const offTokenValues = names.size ? Object.fromEntries(Object.entries(onToken).map(([k, f]) => [k, [...(lists[k]?.keys() || [])].filter((v) => !f(v))])) : null;

  // 2. control: controls side by side (buttons and inputs, or chips) whose heights differ by 1 to 4px
  // from their row's commonest. A control's row is the controls of its kind that overlap it vertically
  // inside the nearest box, up to three levels up, holding one: a toolbar, a segmented control, a
  // pager, a dialog footer. On a tie the height most controls of that kind use on the layer wins.
  const tall = (c) => Math.round(c.r.height);
  const peersOf = (c) => {
    for (let n = c.el.parentElement, d = 0; n && d < 3; n = n.parentElement, d++) {
      const ps = controls.filter((o) => o !== c && o.kind === c.kind && n.contains(o.el) && o.r.top < c.r.bottom && c.r.top < o.r.bottom);
      if (ps.length) return [n, ps];
      if (n === layer) break;
    }
    return [null, []];
  };
  const usual = (c, h) => controls.filter((o) => o.kind === c.kind && tall(o) === h).length;
  const odd = new Map();
  for (const c of controls) {
    const [g, ps] = peersOf(c);
    if (!g) continue;
    const [rh, rg] = [...Map.groupBy([c, ...ps], tall)].sort((a, b) => b[1].length - a[1].length || usual(c, b[0]) - usual(c, a[0]))[0];
    if (tall(c) === rh || Math.abs(tall(c) - rh) > 4) continue;
    const k = `${sel(g)}|${tall(c)}`;
    if (!odd.has(k)) odd.set(k, { c, g, rh, ref: rg[0], n: rg.length, els: [] });
    odd.get(k).els.push(c.el);
  }
  for (const { c, g, rh, ref, n, els } of odd.values()) {
    const h = tall(c),
      pad = (cs) => `${Math.round(parseFloat(cs.paddingTop))}px`;
    const [prop, value] = pad(c.cs) !== pad(ref.cs) ? ["padding-block", pad(ref.cs)] : ["height", `${rh}px`];
    const hs = holders(els),
      a = apply(els, { [prop]: value });
    check({
      kind: "control",
      where: hs[0],
      text: textOf(c.el),
      against: `height ${rh}px on ${n} beside it in ${sel(g)}, e.g. ${at(ref.el)} "${textOf(ref.el)}"`,
      off: h - rh,
      fix: `Set ${prop} to ${value} on ${and(exactNames(els))}; ${els.length > 1 ? `${els.length} are` : "it is"} ${h}px tall where ${n} beside ${els.length > 1 ? "them" : "it"} ${n > 1 ? "are" : "is"} ${rh}px.${a ? "" : miss(els)}`,
      count: els.length,
      score: Math.abs(h - rh) >= 2 ? 0.6 : 0.4,
      el: c.el,
      apply: a || [],
    });
  }

  // 3. contrast, one check per text color (and direction) with every holder; the fix darkens (or
  // lightens) the ink until it passes on every background it sits on. Faded text (opacity on it or an
  // ancestor) is one check per element holding the fade: the fix sets its opacity to 1 and each ink
  // to the faded color, darkened until it passes. It leads with a holder in view. Every AA fail blocks
  // a handover, so it scores 0.5 or more; the worst pair sets how far above.
  // An ink set per holder (inline on the text or an ancestor, as a color or a custom property, or
  // one holder name in two inks: speaker names) is data: the fix says to darken each in the markup
  // or data, and the check has no `apply`, since one CSS color would make every holder alike.
  const inline = (el) => {
    const c = hex(getComputedStyle(el).color);
    for (let n = el; n && n !== layer.parentElement; n = n.parentElement) if ([...n.style].some((p) => (p === "color" || p.startsWith("--")) && hex(n.style.getPropertyValue(p)) === c)) return true;
    return false;
  };
  const worst = (on) => on.reduce((a, b) => (b.ratio - b.need < a.ratio - a.need ? b : a));
  for (const e of lowContrast.values()) {
    const lead =
      holders(e.els)
        .map((h) => e.els.find((u) => at(u) === h && inView(u)))
        .find(Boolean) || e.els[0];
    const fade = [...e.fade],
      inks = [...Map.groupBy(e.on, (o) => toHex(o.ink))].map(([from, on]) => {
        const els = on.map((o) => o.el),
          same = fade.length ? undefined : (m) => layer.contains(m) && hex(getComputedStyle(m).color) === from;
        return { from, on, w: worst(on), els, hs: holders(els), own: els.some(inline), names: exactNames(els, same, lead), same };
      });
    for (const i of inks) {
      i.own ||= inks.some((o) => o !== i && o.hs.some((h) => i.hs.includes(h)));
      // A shared ink keeps the faded look; an ink per holder shows at full opacity once the fade goes.
      const base = fade.length && !i.own ? [...i.w.fg, 255] : i.w.ink,
        fails = (c) => i.on.some(({ bg, need }) => ratioOf(over(c, bg), bg) < need);
      let fix = base;
      for (let t = 0.05; t <= 1 && fails(fix); t += 0.05) fix = [...base.slice(0, 3).map((v) => v * (1 - t) + (e.dark ? 0 : 255) * t), 255];
      i.to = toHex(fix.slice(0, 3));
      i.apply = i.own ? null : apply(i.els, { color: i.to }, i.same);
    }
    const w = worst(e.on),
      bgs = [...new Set(e.on.map((o) => toHex(o.bg)))];
    const el = fade.length ? fades(lead).at(-1) : lead,
      own = inks.filter((i) => i.own),
      fadeApply = fade.length ? apply(fade, { opacity: "1" }) : [];
    const applies = [fadeApply, ...inks.map((i) => i.apply)];
    const darken = own.map(
      (i) => `darken each inline color on ${and(i.hs)} in the markup or data until it reads ${i.w.need}:1 on ${toHex(w.bg)} (${i.from} ${i.to === i.from ? "passes once opaque" : `becomes ${i.to}`})`,
    );
    const sets = [...(fade.length ? [`opacity to 1 on ${and(exactNames(fade))}`] : []), ...inks.filter((i) => !i.own).map((i) => `color to ${i.to} on ${and(i.names)}`)];
    const said = [sets.length && `Set ${sets.join(" and ")}`, ...darken].filter(Boolean).join(", and ");
    const why = fade.length
      ? `faded to opacity ${+opacity(lead).toFixed(2)}, ${inks.map((i) => `${i.hs[0]} reads ${i.w.ratio.toFixed(2)}:1`).join(" and ")} on ${toHex(w.bg)}`
      : `${inks[0].from} reads ${w.ratio.toFixed(2)}:1 on ${toHex(w.bg)}`;
    check({
      kind: "contrast",
      where: fade.length ? at(el) : at(lead),
      text: textOf(el),
      against: `${w.ratio.toFixed(2)}:1 on ${toHex(w.bg)}${bgs.length > 1 ? ` (worst of ${bgs.join(", ")})` : ""}${fade.length ? `, faded to opacity ${+opacity(lead).toFixed(2)}` : ""}, needs ${w.need}:1`,
      off: +(w.ratio - w.need).toFixed(2),
      fix:
        `${said[0].toUpperCase()}${said.slice(1)}; ${why}.` +
        (own.length ? " The color is set per holder, so one CSS color would make them alike." : applies.every(Boolean) ? "" : miss(fade.length ? [...fade, ...e.els] : e.els)),
      count: e.els.length,
      score: w.ratio < w.need - 1.5 ? 0.7 : w.ratio < w.need - 0.5 ? 0.6 : 0.5,
      el,
      apply: !own.length && applies.every(Boolean) ? applies.flat() : [],
    });
  }

  // 4. Rows and cards. A row type: 3+ siblings of one tag and class, 24 to 200px tall, stacked down;
  // not a table row, and not a card (painted and apart). A card: a painted box over 48px tall that is
  // not a row. Their pieces are the elements holding text, plus one piece per data cluster (an avatar stack).
  const rowTypes = new Map();
  const parents = [layer, ...layer.querySelectorAll("*")].filter((p) => p.children.length > 2 && !isData(p)); // display: contents wrappers too
  for (const p of parents) {
    const kids = [...p.children].filter((k) => !isData(k) && k.getClientRects().length);
    const byKind = kids.reduce((m, k) => m.set(kindOf(k), [...(m.get(kindOf(k)) || []), k]), new Map());
    for (const run of byKind.values()) {
      const rs = run.map((k) => k.getBoundingClientRect());
      if (
        run.length < 3 ||
        run[0].matches("td, th, tr, [role=row]") ||
        (paintedBox(run[0]) && rs[1].top - rs[0].bottom >= 4) ||
        !rs.every((r, i) => r.height >= 24 && r.height <= 200 && (i === 0 || r.top >= rs[i - 1].bottom - 1))
      )
        continue;
      rowTypes.set(sel(run[0]), []);
    }
  }
  // One row type across containers: a day of two rows still holds rows.
  for (const el of all) {
    const h = el.getBoundingClientRect().height;
    if (rowTypes.has(sel(el)) && h >= 24 && h <= 200) rowTypes.get(sel(el)).push(el);
  }
  const rowEls = new Set([...rowTypes.values()].flat());
  const BOXY = "button, input, select, textarea, table, tr, td, th, label";
  const cards = all.filter(
    (el) => el !== layer && el.getBoundingClientRect().height > 48 && el.getBoundingClientRect().width >= 120 && !rowEls.has(el) && !columns.has(el) && !el.matches(BOXY) && paintedBox(el),
  );
  // A row or a card counts its own text: nested rows and cards count theirs.
  const units = [...rowEls, ...cards];
  const inRow = (el, root) => units.some((r) => r !== root && root.contains(r) && r.contains(el));
  // One piece per chip, per avatar stack (its "+2" included), and per label with its dot.
  const stack = (el) => [...(el.parentElement?.children || [])].filter(isData).length >= 2 && el.parentElement;
  const pieceKey = (p) => p.chip || stack(p.el) || (p.dot && [...textEls].find((t) => t.contains(p.el))) || p.el;
  const commonest = (vs) => vs.sort((a, b) => vs.filter((v) => v === b).length - vs.filter((v) => v === a).length)[0];
  const piecesOf = (root) => {
    const out = [],
      seen = new Set();
    for (const el of textEls) {
      if (!root.contains(el) || inRow(el, root) || seen.has(el) || /^[·•|/–—-]$/.test(el.textContent.trim())) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      let chip = null;
      for (let n = el; n && n !== root; n = n.parentElement) if (filled(getComputedStyle(n)) && n.getBoundingClientRect().height < 32) chip = n;
      const ink = flat(cs.color);
      out.push({ el, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), color: chroma(ink) > 50 && !chip ? hueName(ink) : null, chip, dot: null });
    }
    for (const d of root.querySelectorAll("*")) {
      const r = d.getBoundingClientRect(),
        cs = getComputedStyle(d);
      if (isData(d) && !isData(d.parentElement) && !inRow(d, root) && !(d.matches("svg") && r.width <= 32)) out.push({ el: d, data: true });
      else if (!d.textContent.trim() && !isData(d) && r.width && r.width <= 12 && r.height <= 12 && filled(cs) && chroma(rgba(cs.backgroundColor)) > 50 && !inRow(d, root))
        out.push({ el: d, dot: hueName(rgba(cs.backgroundColor)) });
    }
    const texts = out.filter((p) => p.size);
    // The heading (largest, then boldest, then longest text) leads, so it is no emphasis. A fractional
    // size is a near-duplicate of the whole size within 1px that the unit uses most.
    const head = texts.slice().sort((a, b) => b.size - a.size || b.weight - a.weight || b.el.textContent.length - a.el.textContent.length)[0];
    const uses = (s) => texts.filter((p) => p.size === s).length;
    const whole = [...new Set(texts.map((p) => p.size))].filter((s) => !(s % 1));
    for (const p of texts) p.merged = (p.size % 1 && whole.filter((s) => Math.abs(s - p.size) <= 1).sort((a, b) => Math.abs(a - p.size) - Math.abs(b - p.size) || uses(b) - uses(a))[0]) || p.size;
    const baseWeight = commonest(texts.map((p) => p.weight));
    const emph = new Map();
    for (const p of out) {
      const label = p.chip ? "filled chip" : p.dot ? `${p.dot} dot` : p.color ? `${p.color} text` : p.size && p.weight >= 600 && baseWeight < 600 ? "bold" : null;
      if (label && p !== head) emph.set(label, [...(emph.get(label) || []), p]);
    }
    return { sizes: [...new Set(texts.map((p) => p.merged))].sort((a, b) => b - a), emph, pieces: new Set(out.map(pieceKey)).size };
  };
  // Each row type reports its busiest row.
  const rows = [...rowTypes].map(([type, els]) => {
    const c = els.map(piecesOf).sort((a, b) => b.pieces - a.pieces)[0];
    return { type, rows: els.length, pieces: c.pieces, sizes: c.sizes, emphases: [...c.emph.keys()] };
  });
  const cardList = cards.map((el) => {
    const c = piecesOf(el);
    return { card: sel(el), text: textOf(el), pieces: c.pieces, sizes: c.sizes };
  });

  const PROPS = [
    ["box", "background and border", 0.7],
    ["pad", "padding", 0.55],
    ["type", "font", 0.5],
  ];
  // 5. sibling: 4+ containers of one kind (tag and first class) side by side or stacked, about one
  // size; one differs from the rest. A card among sections is a designed difference, not a slip.
  for (const p of parents) {
    const kids = [...p.children].filter((k) => !isData(k) && !rowEls.has(k) && !k.matches(STATE) && visible(k) && k.getBoundingClientRect().height > 48 && k.getBoundingClientRect().width >= 120);
    for (const group of Map.groupBy(kids, kindOf).values()) {
      const rs = group.map((k) => k.getBoundingClientRect());
      const alike = (f) => Math.min(...rs.map(f)) >= Math.max(...rs.map(f)) * 0.85;
      if (group.length < 4 || !(alike((r) => r.width) || alike((r) => r.height))) continue;
      const first = (k) => [...textEls].find((t) => k.contains(t));
      const looks = group.map((k) => {
        const cs = getComputedStyle(k),
          t = first(k),
          ts = t && getComputedStyle(t);
        const pad = ["Top", "Right", "Bottom", "Left"].map((s) => `${Math.round(parseFloat(cs[`padding${s}`]))}px`).join(" ");
        return {
          k,
          t,
          box:
            [filled(cs) && `background ${hex(cs.backgroundColor)}`, lined(cs) && `border ${cs.borderTopWidth} ${hex(cs.borderTopColor)}`, cs.boxShadow !== "none" && "shadow"]
              .filter(Boolean)
              .join(", ") || "no fill or border",
          pad,
          type: t ? `${ts.fontSize}/${ts.fontWeight} ${hex(ts.color)}${ts.textTransform === "uppercase" ? " uppercase" : ""}` : "",
          // The declarations behind each look, to copy from a sibling.
          css: {
            box: {
              "background-color": filled(cs) ? hex(cs.backgroundColor) : "transparent",
              border: lined(cs) ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${hex(cs.borderTopColor)}` : "none",
              "border-radius": cs.borderRadius,
              "box-shadow": cs.boxShadow,
            },
            pad: { padding: pad },
            type: ts ? { "font-size": ts.fontSize, "font-weight": ts.fontWeight, color: hex(ts.color), "text-transform": ts.textTransform } : {},
          },
        };
      });
      for (const [prop, css, score] of PROPS) {
        const counts = looks.reduce((m, l) => m.set(l[prop], (m.get(l[prop]) || 0) + 1), new Map());
        const [common, n] = [...counts].sort((a, b) => b[1] - a[1])[0];
        const odd = looks.filter((l) => l[prop] !== common);
        if (odd.length !== 1 || n < 3 || !common) continue;
        // One odd sibling is one check: its fix copies every way the rest agree and it differs.
        const o = odd[0],
          ref = looks.find((l) => l[prop] === common),
          target = prop === "type" ? o.t : o.k,
          others = looks.filter((l) => l !== o);
        const want = (q) => q === prop || (others.every((l) => l[q] === others[0][q]) && o[q] !== others[0][q] && others[0][q]);
        const edits = PROPS.slice(PROPS.findIndex((x) => x[0] === prop))
          .filter(([q]) => want(q))
          .map(([q]) => [q === "type" ? o.t : o.k, Object.fromEntries(Object.entries(ref.css[q]).filter(([k, v]) => o.css[q][k] !== v))])
          .filter(([el, d]) => el && Object.keys(d).length);
        if (!edits.length) continue;
        const fix = edits
          .map(
            ([el, d]) =>
              `set ${Object.entries(d)
                .map(([k, v]) => `${k} to ${v}`)
                .join(", ")} on ${exactNames([el])[0]}`,
          )
          .join("; ");
        const as = edits.map(([el, d]) => apply([el], d));
        const off =
          prop === "pad" ? parseFloat(o.pad.split(" ")[3]) - parseFloat(common.split(" ")[3]) || parseFloat(o.pad) - parseFloat(common) : prop === "type" ? parseFloat(o.type) - parseFloat(common) : 0;
        check({
          kind: "sibling",
          where: at(target),
          text: textOf(target),
          against: `${n} siblings in ${sel(p)} with ${css} ${common}, e.g. ${sel(ref.k)} "${textOf(ref.k).slice(0, 24)}"`,
          off,
          fix: `${fix[0].toUpperCase()}${fix.slice(1)}, like its ${n} siblings.${as.every(Boolean) ? "" : miss(edits.map(([el]) => el))}`,
          count: 1,
          score: prop === "pad" && Math.abs(off) < 4 ? 0.4 : score,
          el: target,
          apply: as.every(Boolean) ? as.flat() : [],
        });
        break;
      }
    }
  }

  // 6. sibling, cell unlike its column: in a visible table, or in 4+ repeated rows (their children by
  // kind and order), each cell's look: a chip's shape (radius, height, padding; never its hue) or
  // bare, then the text's size, weight, style, decoration, case, family, and ink. A look on a third of
  // the cells or fewer, beside one on 60% or more, is a slip. A colored ink differs by design, bold or
  // not (an overdue date, an Urgent in red), unless the few are links among plain text (or the reverse)
  // or hold the majority's own text. A badge beside the value is added, not a restyle: the cell's text
  // outside it is compared. A control's label (a switch's "Will record") belongs to the control.
  const TYPE = ["font-size", "font-weight", "font-style", "text-decoration-line", "text-transform", "font-family"];
  const chipOf = (t, cell) => {
    let c = null;
    for (let n = t; n && n !== cell; n = n.parentElement) if ((filled(getComputedStyle(n)) || lined(getComputedStyle(n))) && n.getBoundingClientRect().height < 32) c = n;
    return c;
  };
  const cellLook = (cell) => {
    const ts = [...textEls].filter((e) => cell.contains(e)),
      t = ts.find((e) => !chipOf(e, cell)) || ts[0];
    const ctl = t?.closest("label, button, [role=button], [role=switch]");
    if (!t || (ctl && cell.contains(ctl)) || (t !== cell && t.parentElement.querySelector(":scope > :is(button, input, select, [role=switch])"))) return null;
    const chip = chipOf(t, cell),
      cs = getComputedStyle(t),
      cc = chip && getComputedStyle(chip),
      link = t.closest("a[href]");
    const shape = chip ? `chip r${cc.borderRadius} h${Math.round(chip.getBoundingClientRect().height)} p${cc.paddingLeft}` : "bare";
    return { t, chip, link: !!link && cell.contains(link), text: t.innerText.trim(), shape, type: TYPE.map((p) => cs.getPropertyValue(p)).join(" "), ink: chip ? "" : hex(cs.color) };
  };
  const cellCols = [
    ...[...layer.querySelectorAll("table")]
      .filter((tb) => visible(tb) && !isData(tb))
      .flatMap((tb) => {
        const trs = [...tb.rows].filter((r) => visible(r) && !r.closest("thead") && r.cells.length > 1),
          n = Math.max(0, ...trs.map((r) => r.cells.length));
        return Array.from({ length: n }, (_, i) => ({
          cells: trs.filter((r) => r.cells.length === n).map((r) => r.cells[i]),
          name: tb.tHead?.rows[0]?.cells[i]?.innerText.trim(),
          box: tb,
          path: `${sel(tb)} td:nth-child(${i + 1})`,
        }));
      }),
    ...[...rowTypes.values()]
      .filter((els) => els.length >= 4)
      .flatMap((els) => {
        const keyed = els.map((r) => {
          const seen = new Map();
          return new Map([...r.children].filter(visible).map((k) => [`${kindOf(k)}#${seen.set(kindOf(k), (seen.get(kindOf(k)) || 0) + 1).get(kindOf(k))}`, k]));
        });
        return [...new Set(keyed.flatMap((m) => [...m.keys()]))].map((key) => ({ cells: keyed.map((m) => m.get(key)).filter(Boolean), box: els[0].parentElement }));
      }),
  ];
  const form = (l) => (l.link ? "links" : l.chip ? "chips" : "plain text");
  for (const { cells, name, box, path } of cellCols) {
    const looks = cells.map(cellLook).filter(Boolean);
    if (looks.length < 4) continue;
    const groups = [...Map.groupBy(looks, (l) => `${l.shape}|${l.type}|${l.ink}`).values()].sort((a, b) => b.length - a.length);
    const major = groups[0],
      m = major[0],
      mcs = getComputedStyle(m.t);
    if (major.length < looks.length * 0.6) continue;
    for (const g of groups.slice(1)) {
      const o = g[0],
        ocs = getComputedStyle(o.t);
      const same = g.some((l) => major.some((x) => x.text === l.text)),
        signal = o.ink && o.ink !== m.ink && chroma(flat(o.ink)) > 50; // red and bold: an alarm
      if (g.length > looks.length / 3 || (o.shape === m.shape && o.link === m.link && !same && (o.type === m.type || signal))) continue;
      // The edit: the text's differing properties, and a chip's box cleared when the column is bare.
      const text = Object.fromEntries([
        ...(o.ink !== m.ink && m.ink ? [["color", m.ink]] : []),
        ...TYPE.filter((p) => ocs.getPropertyValue(p) !== mcs.getPropertyValue(p)).map((p) => [p, mcs.getPropertyValue(p)]),
      ]);
      const chipEdit =
        o.chip && !m.chip
          ? { "background-color": "transparent", border: "none", padding: "0px" }
          : o.chip && m.chip
            ? Object.fromEntries(
                ["border-radius", "padding", "height"].map((p) => [p, getComputedStyle(m.chip).getPropertyValue(p)]).filter(([p, v]) => getComputedStyle(o.chip).getPropertyValue(p) !== v),
              )
            : {};
      const texts = g.map((l) => l.t);
      const edits = [
        [texts, text],
        [g.map((l) => l.chip), chipEdit],
      ].filter(([els, d]) => els[0] && Object.keys(d).length);
      // A link among plain text (or the reverse) and a chip to add are markup: a recolor would hide links.
      const linking = o.link !== m.link,
        writable = !linking && !(m.chip && !o.chip) && edits.length;
      const has = (d) => (e) => Object.entries(d).every(([k, v]) => (k === "color" ? hex(getComputedStyle(e).color) : getComputedStyle(e).getPropertyValue(k)) === v);
      const as = writable ? edits.map(([els, d]) => apply(els, d, has(d), [path && `${path} ${els[0].tagName.toLowerCase()}${firstClass(els[0])}`])) : [];
      const say = (l) => (form(l) !== form(m) || l === m ? form(l) : `${getComputedStyle(l.t).fontSize}/${getComputedStyle(l.t).fontWeight}${l.ink ? ` ${l.ink}` : ""}${l.chip ? ` ${l.shape}` : ""}`);
      const decl = edits
        .map(([, d]) =>
          Object.entries(d)
            .map(([k, v]) => `${k} to ${v}`)
            .join(", "),
        )
        .join(", ");
      check({
        kind: "sibling",
        where: at(o.t),
        text: textOf(o.t),
        against: `${major.length} of ${looks.length} cells in ${name ? `column "${name}" of ` : "their column in "}${sel(box)} as ${say(m)}, e.g. "${m.text.slice(0, 24)}"`,
        off: +(parseFloat(ocs.fontSize) - parseFloat(mcs.fontSize)).toFixed(2),
        fix: linking
          ? `Link every ${name ? `${name} cell` : "cell in this column"}, or none; ${g.length} of ${looks.length} are ${form(o)} (${and(holders(g.map((l) => l.t)))}) where the other ${major.length} are ${form(m)}.`
          : writable
            ? `Set ${decl} on ${and(exactNames(texts, has(text)))}; ${g.length} of ${looks.length} cells render as ${say(o)} where the other ${major.length} are ${say(m)}.${as.every(Boolean) ? "" : miss(g.map((l) => l.t))}`
            : `Render ${and(holders(g.map((l) => l.t)))} as ${form(m)} like the other ${major.length} cells.`,
        count: g.length,
        score: linking ? 0.6 : !writable ? 0.45 : o.shape !== m.shape || ocs.fontSize !== mcs.fontSize ? 0.6 : 0.5,
        el: o.t,
        apply: as.every(Boolean) ? as.flat() : [],
      });
    }
  }

  // 7. Text: words, nothing lines, value formats, truncation, and one action label on 4+ buttons in a column.
  const runs = [...textEls].map((el) => ({
    el,
    text: [...el.childNodes]
      .filter((t) => t.nodeType === 3)
      .map((t) => t.textContent)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  }));
  const isValue = (s) => /^[\d\s.,:;%+\-–/€$£#×()]+$/.test(s) || /^\d[\d.,]*\s?[a-z%]{1,4}$/i.test(s) || /^[a-zäöü]{2,3}\.?,? \d{1,2}[./:]/i.test(s);
  const ROWISH = "li, tr, td, dd, [role=row], [role=listitem], [role=option], [role=gridcell]";
  const nothing = new Map(),
    shapes = new Map(),
    acts = new Map();
  for (const { el, text } of runs) {
    const act = el.closest(`${BUTTON}, a[href]`); // a control's own label is not a line of text
    if (
      (!el.closest(`${ROWISH}, label, th`) && !(act && act.innerText.trim() === el.innerText.trim()) && words(text) <= 8 && /\b(no|none|nothing|not yet|empty)\b/i.test(text)) ||
      /^[-–—]$/.test(text)
    )
      nothing.set(text, (nothing.get(text) || 0) + 1);
    if (/\d/.test(text) && (isValue(text) || el.closest("td, dd, output"))) {
      const k = text.replace(/\p{L}+/gu, "a").replace(/\d+/g, "9");
      shapes.set(k, [...(shapes.get(k) || []), text]);
    }
  }
  for (const b of all.filter((el) => el.matches(BUTTON) && el.innerText.trim())) {
    const k = `${b.innerText.trim().split("\n")[0]}\u0000${sel(column(b))}`;
    acts.set(k, [...(acts.get(k) || []), b]);
  }
  const repeats = [...acts].filter(([, bs]) => bs.length >= 4);
  for (const [k, bs] of repeats)
    check({
      kind: "crowding",
      where: sel(bs[0]),
      text: textOf(bs[0]),
      against: `${bs.length} "${k.split("\u0000")[0]}" buttons in ${k.split("\u0000")[1]}`,
      off: bs.length - 1,
      fix: `Show "${k.split("\u0000")[0]}" on hover or once in a bulk bar instead of on ${bs.length} rows.`,
      count: bs.length,
      score: 0.45,
      el: bs[0],
      apply: [],
    }); // a hover rule is no declaration
  const clipped = (e) => {
    const cs = getComputedStyle(e);
    return (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow === "ellipsis") || (e.scrollHeight > e.clientHeight + 1 && cs.getPropertyValue("-webkit-line-clamp") !== "none");
  };
  const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  const text = {
    nothing: [...nothing].map(([t, n]) => `${n}x ${cut(t, 48)}`),
    valueFormats: [...shapes].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${v.length}x ${k} (${cut(v[0], 24)})`),
    repeats: repeats.map(([k, bs]) => `${bs.length}x ${k.split("\u0000")[0]}`),
    truncated: runs.filter(({ el }) => clipped(el) || clipped(el.parentElement)).map(({ text }) => cut(text, 64)),
  };

  // Rank, number, draw.
  const ranked = checks.sort((a, b) => b.score - a.score).slice(0, 20);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const host = document.body.appendChild(document.createElement("div"));
  host.id = "__count";
  host.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483646";
  const root = host.attachShadow({ mode: "open" });
  const COLOR = { crowding: "#d9480f", sibling: "#7048e8", control: "#0c8599", contrast: "#c2255c" };
  const marks = ranked.map((f, i) => {
    const r = f.el.getBoundingClientRect(),
      [x, y] = [r.left + scrollX, r.top + scrollY];
    return `<i class="m" style="left:${x - 2}px;top:${y - 2}px;width:${r.width + 4}px;height:${r.height + 4}px;border-color:${COLOR[f.kind]}"><b style="background:${COLOR[f.kind]}">${i + 1}</b></i>`;
  });
  const total = runs.reduce((n, r) => n + words(r.text), 0);
  root.innerHTML = `<style>
    :host { all: initial; }
    .m { position: absolute; border: 2px solid; border-radius: 3px; box-sizing: border-box; }
    .m b { position: absolute; left: -2px; top: -18px; font: 600 11px/16px system-ui, sans-serif; color: #fff; padding: 0 5px; border-radius: 3px; }
    .panel { position: fixed; right: 16px; bottom: 16px; width: 360px; max-height: 45vh; overflow: auto; pointer-events: auto; background: #fff; color: #111; border-radius: 10px; box-shadow: 0 0 0 1px rgb(0 0 0 / .06), 0 12px 32px rgb(0 0 0 / .14); font: 400 12px/17px system-ui, sans-serif; padding: 8px 0; }
    .h { display: flex; flex-wrap: wrap; gap: 2px 12px; padding: 4px 14px 8px; border-bottom: 1px solid #ececec; color: #525252; white-space: nowrap; }
    .h b { color: #111; font-weight: 600; margin-right: auto; }
    .f { display: grid; grid-template-columns: 20px 1fr; gap: 0 6px; padding: 6px 14px; border-bottom: 1px solid #f3f3f3; }
    .f > b { font-weight: 600; color: #fff; border-radius: 3px; text-align: center; height: 17px; }
    .f em { font-style: normal; font-weight: 600; }
    .f span { grid-column: 2; color: #525252; }
    p { margin: 8px 14px 4px; color: #6b6b6b; }
  </style>${marks.join("")}<div class="panel"><div class="h"><b>Count</b><span>${total} words in layer</span><span>${rowTypes.size} row types</span><span>${cards.length} cards</span></div>
  ${ranked.map((f, i) => `<div class="f"><b style="background:${COLOR[f.kind]}">${i + 1}</b><div><em>${f.kind}</em> ${esc(f.where)} <span>${esc(f.text)}</span></div><span>${esc(f.fix)}</span></div>`).join("") || "<p>No checks.</p>"}</div>`;
  // Place the panel outside the region: in the wider strip beside it (the panel narrows to 200px to
  // fit), at the height that covers the least. When the region fills the window, the corner that
  // covers the least: marked checks above all, then text and controls, then the region a little.
  const panel = root.querySelector(".panel"),
    lr = layer.getBoundingClientRect();
  const strips = [
    [8, Math.max(0, lr.left) - 8],
    [Math.min(innerWidth, lr.right) + 8, innerWidth - 8],
  ]
    .map(([a, b]) => [a, b - a])
    .filter(([, w]) => w >= 216)
    .sort((a, b) => b[1] - a[1]);
  if (strips[0]) panel.style.cssText = `width:${Math.min(360, strips[0][1] - 8)}px;max-height:${innerHeight - 32}px`;
  const pw = panel.offsetWidth,
    ph = panel.offsetHeight;
  const cover = (r, x, y) => Math.max(0, Math.min(r.right, x + pw) - Math.max(r.left, x)) * Math.max(0, Math.min(r.bottom, y + ph) - Math.max(r.top, y));
  const busy = [
    ...[...textEls, ...controls.map((c) => c.el)].map((el) => [el.getBoundingClientRect(), 1]),
    ...ranked.flatMap((f) => {
      const r = f.el.getBoundingClientRect();
      return [
        [r, 25],
        [new DOMRect(r.left - 4, r.top - 20, 28, 18), 400],
      ];
    }),
    [lr, 0.1],
  ];
  const spots = strips[0]
    ? Array.from({ length: 9 }, (_, i) => [strips[0][0] + (strips[0][0] < lr.left ? strips[0][1] - pw : 0), innerHeight - ph - 16 - (i * (innerHeight - ph - 32)) / 8])
    : [16, innerWidth - pw - 16].flatMap((x) => [innerHeight - ph - 16, 16].map((y) => [x, y]));
  const [px, py] = spots.map(([x, y]) => [x, y, busy.reduce((n, [r, w]) => n + w * cover(r, x, y), 0)]).sort((a, b) => a[2] - b[2])[0];
  panel.style.left = `${px}px`;
  panel.style.top = `${py}px`;
  panel.style.right = panel.style.bottom = "auto";
  window.__countClear = () => {
    host.remove();
    delete window.__countClear;
  };

  const out = Object.fromEntries(Object.entries(lists).map(([k, m]) => [k, [...m.values()].sort((a, b) => b[1] - a[1]).map(([v, n, s]) => [v, n, s])]));
  return JSON.stringify({
    layer: layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase(),
    warning,
    checks: ranked.map(({ el, ...f }) => f),
    words: total,
    elements: all.length,
    distinct: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])),
    oneOffs: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.filter(([val, n]) => n <= 2 && !(offTokenValues && onToken[k]?.(val))).length])),
    tokens: names.size,
    offTokenValues,
    unnamed: unnamed.slice(0, 20),
    smallTargets: small.slice(0, 20),
    rows,
    cards: cardList.slice(0, 20),
    text,
    ...out,
  });
})();
