// Count: is the screen crowded or inconsistent? One count of the layer (window.__axesLayer, else
// the last open dialog or sheet, else main, else the body). It returns `checks`, the minimum checks
// (the floor of a review, not the review; ranked, at most 20, numbered on the page and in the panel),
// of twelve kinds:
//   crowding  one action label on 4+ buttons in a column (a note, under 0.5).
//   sibling   one of 4+ sibling containers of one kind (tag and first class) differs from the rest in
//             fill or border, padding, or first-text style; or a few cells of one column in a table or
//             in 4+ repeated rows rendered unlike the rest: a link among plain text, a chip among bare
//             text, another size or weight, the same text in another color; or one text of a row of 3+
//             like cards styled unlike its row-mates (a 22px value beside two 24px ones; `apply` copies
//             theirs); or a value format a third of a column's values or fewer use (a second date
//             format among dd.mm.yyyy; rewriting it is data, no `apply`). A chip's hue and a colored
//             value that is no link (an overdue date) are designed and stay quiet. Links among plain
//             text and plain text among chips are one markup fix (link every cell or none, chip every
//             cell) at 0.6, with no `apply`; a placeholder ("–") among chips stays a note.
//   control   controls in one group (the nearest box holding two or more) whose heights differ by 1 to 4px.
//   contrast  text under WCAG AA (4.5, or 3 for 24px or 18.66px bold text) against its painted
//             background, its and its ancestors' opacity multiplied into the ink; one check per text
//             color naming every holder, led by one in view (faded text: one per element holding the
//             fade); every fail scores 0.5 or more. Text under a running opacity animation is skipped.
//             An ink set per holder (inline, as speaker names) is a markup fix: darken each, no `apply`.
//   shape     painted controls of one role in one region that mix shape classes: square (radius at
//             most 1px), rounded, capsule (radius at least half the shorter side minus 1). Roles:
//             buttons with text, icon-only buttons, inputs and selects (a field drawn by its wrapper
//             takes the wrapper's shape), tags (small painted text that is no control), and badges
//             (up to three characters, or a dot up to 12px). Selected and attached controls (a
//             button group with joined corners) are skipped. A region is the nearest painted box,
//             header, footer, form, fieldset, nav, dialog, or toolbar, group, search, menu, or tablist
//             role inside the column, else the controls side by side on one line. The odd ones take
//             the region's commonest class (a tie goes to the class the role uses most on the layer)
//             at its commonest radius: 0.6, or 0.55 on a tie. A rounded radius 2px or more off the
//             region's commonest is a note (0.4). One check per odd holder and radius, `count` folds
//             repeats.
//   square    an icon-only button (no text, one icon up to 32px) whose width and height differ by
//             1 to 8px; `apply` gives the smaller side the larger. 0.55 when painted, 0.5 unpainted
//             beside square icon buttons of its kind, else a note.
//   volume    text that crowds out a lead, `apply: []` (the fix is markup and words): rows of a list
//             (3+ row-type rows that hold no list, table, or rows, and are no sections) whose median row takes
//             more than two lines (0.6), more than three text styles (0.5), or three (a note);
//             a line is a stacked line box, so a badge centered beside two lines adds none, and a
//             style is size, weight (400, 500, 600) and ink (primary, secondary, accent), chips and
//             buttons aside. And a helper sentence under a title (a heading outside rows, or a
//             card's largest first text) when more content follows in its card or section: the
//             next text, 6+ words with a stretch of 5+ between commas, at most two numbers, no
//             dot-separated facts, in a lighter ink, up to three lines (0.55, one check for all).
//             Secondary ink reads under 0.6x the layer's highest text contrast and is not colored.
//   large     more than two things compete to lead in view: text at 1.6x the body size (the size
//             with the most words) or more, a solid fill (3:1 on what is under it; not selected)
//             holding text or 48px square and under a quarter of the view, an image, chart, or
//             background image over a quarter; like ones that overlap down (a row of figures, a
//             pair of solid buttons) count as one, and one inside another counts once. Four or more
//             score 0.55; three score 0.5 when two text leads share a size (a section title as large
//             as the page title), else a note. `apply: []`.
//   rank      the outline breaks: a heading at least as large as its parent (the nearest earlier
//             heading of a lower level in its column; a short bold or uppercase title after the
//             column's h1 counts as its child) at 0.6, `apply` the font-size its same-level
//             siblings take as a share of their parent's when more than half agree (with that
//             sibling's line-height when it differs), else none; the
//             two largest texts in view (1.25x body or more) at one size in different roles (h1,
//             h2, figure, text), not already an outline check, at 0.55; a column whose texts
//             outside rows, controls, and chips use five or more sizes at 0.5 (four is a note).
//   placement a pane or card whose header holds actions while a lone button opens its body (0.55);
//             two creation controls ("Add", "New", "Create", "+ word", or a plus icon with a name, or
//             an input whose placeholder starts so; a form's submit is not one) in one section, the
//             nearest ancestor whose first text is a title (0.55). No `apply`.
//   contradiction a title ending in a count (N > 0, not "week 45" or a year) whose section, its
//             following siblings up to the next title of its kind, shows no list items (li, rows,
//             two or more like siblings with a class) or an empty-state line ("No …"). 0.6, no `apply`.
//   repeat    a pane header's title (its first text, whole) equal to the pane's h1. 0.55, no `apply`.
// `where` names the element holding the value (`div.rtime > span`), never a named ancestor. `apply`
// is the fix as `[{ selector, property, value }]`; its selector comes from exact() and matches only
// the elements the fix means (`[]` when none does, or when the fix is markup); the fix sentence
// names the same elements.
// Plus the style inventory of the whole layer (font families, sizes, weights, line heights, text
// colors, backgrounds, radii, lines, shadows, icons, gaps, buttons, controls; scrolled out of view
// too), tokens and off-token values, unnamed controls, small targets, `slop` (the tells of an
// undesigned screen a script can see), `offGrid` (paddings and gaps off the 4px grid),
// `nestedRadius` (inner radii larger than their box's radius minus the inset), `words` (every visible word in
// the layer, scrolled out of view too), `rows` and `cards` (sizes and emphases), and `text` (nothing
// lines, value formats, repeats, truncation, and `volume`: words, per list of 3+ rows the median
// and max lines and text styles, explanatory sentences (secondary ink, a sentence as in volume)
// inside rows, cards, and under titles, eyebrows (a label of up to four words just above a title,
// left-aligned with it, smaller), and helper sentences). `shapes` is each role's shape classes
// `[shape, count, sample]`, `leads` what competes to lead in view `[kind, count, sample]`, and an
// icon whose box is not square says `not square` in `icons`. Data (charts, waveforms, avatar
// stacks) is skipped.
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
  const lowContrast = new Map(),
    inkRatio = new Map();
  const unnamed = [],
    targets = [],
    controls = [];
  // An inventory, not checks: the tells of an undesigned screen a script can see (references/slop.md),
  // paddings and gaps off the 4px grid, and inner radii that do not nest in their painted box.
  const slop = new Map(),
    offGrid = new Map(),
    nestedRadius = [];
  const note = (m, key, el) => m.set(key, [key, (m.get(key)?.[1] || 0) + 1, m.get(key)?.[2] || sel(el)]);
  const spread = (c) => {
    const [r0, g0, b0] = (c.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    return Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
  };
  const colorsIn = (v) => v.match(/rgba?\([^)]*\)/g) || [];
  const radiusOf = (cs, r) => Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2, r.width / 2);
  for (const el of all) {
    const r = el.getBoundingClientRect(),
      cs = getComputedStyle(el);
    if (/gradient\(/.test(cs.backgroundImage) && new Set(colorsIn(cs.backgroundImage).filter((c) => spread(c) >= 40)).size >= 2) note(slop, "hue gradient on a surface", el);
    if (/text/.test(cs.webkitBackgroundClip || cs.backgroundClip)) note(slop, "gradient text", el);
    if (colorsIn(`${cs.boxShadow} ${cs.textShadow}`).some((c) => spread(c) >= 40 && !/,\s*0\)$/.test(c))) note(slop, "colored glow or shadow", el);
    const ownText = [...el.childNodes]
      .filter((t) => t.nodeType === 3)
      .map((t) => t.textContent)
      .join(" ")
      .trim();
    if (ownText) {
      if (/\p{Extended_Pictographic}/u.test(ownText)) note(slop, "emoji in text", el);
      if (cs.textTransform === "uppercase" && parseFloat(cs.letterSpacing) >= 0.05 * parseFloat(cs.fontSize)) note(slop, "uppercase tracked label", el);
      if (Number(cs.fontWeight) >= 700 && (el.matches("h1, h2, h3, h4, h5, h6") || parseFloat(cs.fontSize) >= 20)) note(slop, "heading at weight 700 or more", el);
      if (ownText.length <= 80 && /\S!(\s|$)/.test(ownText)) note(slop, "exclamation mark", el);
      if (/\S\s[·•|]\s\S/.test(ownText)) note(slop, "dot or pipe between facts", el);
      if (cs.fontStyle === "italic" && el.matches("em, i, span") && el.parentElement?.innerText.trim().length > ownText.length) note(slop, "italic emphasis", el);
      if (el.matches("h1, h2, h3, h4, h5, h6") && /^(\d{1,2}|[IVX]+)[\s.):—–-]/.test(ownText)) note(slop, "numbered section heading", el);
    }
    const tight = r.height < 40 && (el.matches(BUTTON) || el.matches(CONTROL) || cs.display.startsWith("inline"));
    for (const v of new Set([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft, ...(/flex|grid/.test(cs.display) && el.children.length > 1 ? cs.gap.split(" ") : [])])) {
      const n = parseFloat(v);
      if (n > 2 && Number.isInteger(n) && n % 4 && !(tight && n % 2 === 0)) note(offGrid, v, el);
    }
    const ri = radiusOf(cs, r);
    if (ri > 0 && (filled(cs) || lined(cs))) {
      let p = el.parentElement;
      while (p && p !== layer.parentElement && !((filled(getComputedStyle(p)) || lined(getComputedStyle(p))) && radiusOf(getComputedStyle(p), p.getBoundingClientRect()) > 0)) p = p.parentElement;
      if (p && p !== layer.parentElement && nestedRadius.length < 20) {
        const q = p.getBoundingClientRect(),
          ro = radiusOf(getComputedStyle(p), q),
          inset = Math.min(r.left - q.left, r.top - q.top);
        const want = Math.max(ro - inset, 4);
        if (inset >= 0 && inset < ro && ri > want + 1) nestedRadius.push(`${sel(el)} r${Math.round(ri)} in ${sel(p)} r${Math.round(ro)}, ${Math.round(inset)}px in: wants r${Math.round(want)}`);
      }
    }
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
        inkRatio.set(el, ratio);
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
      tally("icons", `${Math.round(r.width)}x${Math.round(r.height)} ${stroke}${Math.round(r.width) !== Math.round(r.height) ? " not square" : ""}`, el.closest("button, a, [role], li, label") || el.parentElement);
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
      rowTypes.set([...Map.groupBy(run, sel)].sort((a, b) => b[1].length - a[1].length)[0][0], []);
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
    // A row of 3+ like cards (painted siblings of one kind side by side, about one width): each card's
    // texts by kind and order are a column of row-mates.
    ...parents.flatMap((p) =>
      [
        ...Map.groupBy(
          [...p.children].filter((k) => visible(k) && !isData(k) && !rowEls.has(k) && paintedBox(k)),
          kindOf,
        ).values(),
      ]
        .filter((g) => {
          const rs = g.map((k) => k.getBoundingClientRect());
          return (
            g.length >= 3 && rs.every((r, i) => !i || (r.left >= rs[i - 1].right - 1 && r.top < rs[i - 1].bottom)) && Math.min(...rs.map((r) => r.width)) >= Math.max(...rs.map((r) => r.width)) * 0.85
          );
        })
        .flatMap((g) => {
          const keyed = g.map((k) => {
            const seen = new Map();
            return new Map([...textEls].filter((t) => k.contains(t)).map((t) => [`${kindOf(t)}#${seen.set(kindOf(t), (seen.get(kindOf(t)) || 0) + 1).get(kindOf(t))}`, t]));
          });
          return [...new Set(keyed.flatMap((m) => [...m.keys()]))].map((key) => ({ cells: keyed.map((m) => m.get(key)).filter(Boolean), box: p, mates: true }));
        }),
    ),
  ];
  // A value's format: letters a, digit runs 9, a sign dropped and a decimal merged ("+3.2 %" is "9 %").
  const formatOf = (s) =>
    s
      .replace(/[+\-−–](?=\d)/g, "")
      .replace(/\p{L}+/gu, "a")
      .replace(/\d+/g, "9")
      .replace(/(?<![.,9])9[.,]9(?![.,:]?9)/g, "9");
  const form = (l) => (l.link ? "links" : l.chip ? "chips" : "plain text");
  const odd5 = new Set(checks.filter((c) => c.kind === "sibling").map((c) => c.el)); // a card's first text, checked in 5
  for (const { cells, name, box, path, mates } of cellCols) {
    const looks = cells.map(cellLook).filter(Boolean);
    if (looks.length < (mates ? 3 : 4)) continue;
    const where = name ? `column "${name}" of ${sel(box)}` : `their column in ${sel(box)}`;
    // A value format a third of the column's values or fewer use, beside one on 60% or more: a second
    // date format among dd.mm.yyyy. Values are short texts with a digit and at most one word; a card
    // row's values differ in unit by design. Rewriting the value is data, so no `apply`.
    const vals = mates ? [] : looks.filter((l) => /\d/.test(l.text) && l.text.length <= 24 && (l.text.match(/\p{L}+/gu) || []).length <= 1);
    const fmts = [...Map.groupBy(vals, (l) => formatOf(l.text)).values()].sort((a, b) => b.length - a.length);
    if (vals.length >= 4 && vals.length >= looks.length * 0.6 && fmts[0].length >= vals.length * 0.6)
      for (const g of fmts.slice(1).filter((g) => g.length <= vals.length / 3)) {
        const ex = fmts[0][0].text;
        check({
          kind: "sibling",
          where: at(g[0].t),
          text: textOf(g[0].t),
          against: `${fmts[0].length} of ${vals.length} values in ${where} in the format of "${ex}"`,
          off: g.length,
          fix: `Write ${and(g.map((l) => `"${l.text}"`))} (${and(holders(g.map((l) => l.t)))}) in the format ${ex.replace(/\d/g, "9")}, as "${ex}"; ${g.length} of ${vals.length} values use another format where the other ${fmts[0].length} share this one.`,
          count: g.length,
          score: 0.5,
          el: g[0].t,
          apply: [],
        });
      }
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
      if (g.length > looks.length / 3 || (o.shape === m.shape && o.link === m.link && !same && (o.type === m.type || signal)) || odd5.has(o.t)) continue;
      // The edit: the text's differing properties, and a chip's box cleared when the column is bare.
      const text = Object.fromEntries([
        ...(o.ink !== m.ink && m.ink ? [["color", m.ink]] : []),
        ...TYPE.filter((p) => ocs.getPropertyValue(p) !== mcs.getPropertyValue(p)).map((p) => [p, mcs.getPropertyValue(p)]),
        ...(ocs.fontSize !== mcs.fontSize && ocs.lineHeight !== mcs.lineHeight ? [["line-height", mcs.lineHeight]] : []), // a size brings its line
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
      // Both are one deviation, a cell in another form than its column, unless it holds a placeholder.
      const linking = o.link !== m.link,
        chipping = !linking && !!m.chip && !o.chip,
        writable = !linking && !chipping && edits.length,
        unit = mates ? "row-mates" : "cells";
      const has = (d) => (e) => Object.entries(d).every(([k, v]) => (k === "color" ? hex(getComputedStyle(e).color) : getComputedStyle(e).getPropertyValue(k)) === v);
      const as = writable ? edits.map(([els, d]) => apply(els, d, has(d), [path && `${path} ${els[0].tagName.toLowerCase()}${firstClass(els[0])}`])) : [];
      const say = (l, x) => (form(l) !== form(x) ? form(l) : `${getComputedStyle(l.t).fontSize}/${getComputedStyle(l.t).fontWeight}${l.ink ? ` ${l.ink}` : ""}${l.chip ? ` ${l.shape}` : ""}`);
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
        against: `${major.length} of ${looks.length} ${unit} in ${mates ? `${sel(box)} (${and(holders(major.map((l) => l.t)))})` : where} as ${say(m, o)}, e.g. "${m.text.slice(0, 24)}"`,
        off: +(parseFloat(ocs.fontSize) - parseFloat(mcs.fontSize)).toFixed(2),
        fix: linking
          ? `Link every ${name ? `${name} cell` : "cell in this column"}, or none; ${g.length} of ${looks.length} are ${form(o)} (${and(holders(g.map((l) => l.t)))}) where the other ${major.length} are ${form(m)}.`
          : writable
            ? `Set ${decl} on ${and(exactNames(texts, has(text)))}; ${g.length} of ${looks.length} ${unit} render as ${say(o, m)} where the other ${major.length} are ${say(m, o)}.${as.every(Boolean) ? "" : miss(g.map((l) => l.t))}`
            : chipping
              ? `Show every ${name ? `${name} cell` : "cell in this column"} as a chip; ${and(g.map((l) => `"${l.text.slice(0, 24)}"`))} (${and(holders(g.map((l) => l.t)))}) ${g.length > 1 ? "are" : "is"} ${form(o)} where the other ${major.length} are chips.`
              : `Render ${and(holders(g.map((l) => l.t)))} as ${form(m)} like the other ${major.length} ${unit}.`,
        count: g.length,
        score: (linking || chipping) && !/^([-–—]|n\/?a)$/i.test(o.text) ? 0.6 : !writable ? 0.45 : o.shape !== m.shape || ocs.fontSize !== mcs.fontSize ? 0.6 : 0.5,
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

  // 8. shape, square, volume, large.
  const painted = (cs) => filled(cs) || ["Top", "Right", "Bottom", "Left"].every((s) => lined(cs, s)) || cs.boxShadow !== "none";
  const cornerOf = (cs, r) => {
    const side = Math.min(r.width, r.height);
    const v = Math.max(
      ...["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((c) => {
        const x = cs[`border${c}Radius`].split(" ")[0];
        return x.endsWith("%") ? (parseFloat(x) * side) / 100 : parseFloat(x) || 0;
      }),
    );
    return Math.min(v, side / 2);
  };
  const formOf = (cs, r) => {
    const v = cornerOf(cs, r);
    return [v <= 1 ? "square" : v >= Math.min(r.width, r.height) / 2 - 1 ? "capsule" : "rounded", v];
  };
  const REGION = "header, footer, form, fieldset, nav, menu, dialog, [role=toolbar], [role=group], [role=search], [role=dialog], [role=menu], [role=tablist], [role=radiogroup]";
  const shaped = [];
  for (const el of all) {
    if (el === layer || el.matches(STATE)) continue;
    const r = el.getBoundingClientRect(),
      cs = getComputedStyle(el),
      t = el.innerText?.trim() || "";
    let role = el.matches(BUTTON) ? (t ? "buttons" : "icon buttons") : el.matches(CONTROL) ? "inputs" : null,
      box = el;
    if (role === "inputs" && !painted(cs))
      box = [el.parentElement, el.parentElement?.parentElement].find(
        (p) => p && p !== layer && p.getBoundingClientRect().height < 56 && painted(getComputedStyle(p)) && p.querySelectorAll(CONTROL).length === 1,
      );
    if (
      !role &&
      painted(cs) &&
      r.height < 32 &&
      r.width < 240 &&
      el.children.length <= 2 &&
      !el.matches("table, tr, td, th, label, li, kbd, code, pre") &&
      !el.closest(BUTTON) &&
      !el.querySelector(`${BUTTON}, ${CONTROL}`) &&
      (cs.display.startsWith("inline") || (r.width <= 160 && /flex|grid/.test(getComputedStyle(el.parentElement).display)))
    )
      role = t ? (t.length <= 3 ? "badges" : "tags") : r.width <= 12 && r.height <= 12 ? "badges" : null;
    if (!role || !box || !painted(getComputedStyle(box))) continue;
    const br = box.getBoundingClientRect(),
      [form, radius] = formOf(getComputedStyle(box), br);
    shaped.push({ el: box, role, r: br, form, radius, value: getComputedStyle(box).borderRadius });
  }
  const loose = shaped.filter(
    (s) =>
      !shaped.some(
        (o) =>
          o !== s &&
          o.role === s.role &&
          Math.min(Math.abs(o.r.left - s.r.right), Math.abs(s.r.left - o.r.right)) <= 1 &&
          Math.min(o.r.bottom, s.r.bottom) - Math.max(o.r.top, s.r.top) > s.r.height / 2,
      ),
  );
  const regionOf = (el) => {
    const col = column(el);
    for (let n = el.parentElement; n && n !== col && n !== layer; n = n.parentElement) if (n.matches(REGION) || (n.getBoundingClientRect().height > 36 && paintedBox(n))) return n;
    return null;
  };
  for (const s of loose) s.region = regionOf(s.el);
  const lineRegions = new Set();
  for (const s of loose)
    if (!s.region)
      for (let n = s.el.parentElement, d = 0; n && n !== layer && d < 3; n = n.parentElement, d++)
        if (loose.some((o) => o !== s && o.role === s.role && !o.region && n.contains(o.el) && o.r.top < s.r.bottom && s.r.top < o.r.bottom)) {
          lineRegions.add(n);
          break;
        }
  for (const s of loose) s.region ||= [...lineRegions].filter((n) => n.contains(s.el)).sort((a, b) => (a.contains(b) ? -1 : 1))[0];
  const layerUse = (role, form) => loose.filter((o) => o.role === role && o.form === form).length;
  const odds = new Map();
  for (const [region, g] of Map.groupBy(
    loose.filter((s) => s.region),
    (s) => s.region,
  ))
    for (const [role, ms] of Map.groupBy(g, (s) => s.role)) {
      if (ms.length < 2) continue;
      const byForm = [...Map.groupBy(ms, (s) => s.form)].sort((a, b) => b[1].length - a[1].length || layerUse(role, b[0]) - layerUse(role, a[0]));
      const [main, mains] = byForm[0],
        want = commonest(mains.map((s) => Math.round(s.radius))),
        ref = mains.find((s) => Math.round(s.radius) === want);
      const value = main === "capsule" ? "999px" : main === "square" ? "0px" : ref.value;
      const off = byForm.slice(1).flatMap(([, x]) => x),
        slip = main === "rounded" ? mains.filter((s) => Math.abs(s.radius - want) >= 2) : [];
      for (const [els, score] of [
        [off, mains.length > off.length ? 0.6 : 0.55],
        [slip, 0.4],
      ]) {
        if (!els.length) continue;
        const k = `${role}|${at(els[0].el)}|${value}|${score}`;
        const e = odds.get(k) || { role, main, ref, value, score, odd: els[0], els: [], regions: new Set(), n: 0 };
        e.els.push(...els.map((s) => s.el));
        e.regions.add(sel(region));
        e.n += mains.length;
        odds.set(k, e);
      }
    }
  for (const e of odds.values()) {
    const o = e.odd,
      a = apply(e.els, { "border-radius": e.value }),
      many = e.els.length > 1;
    check({
      kind: "shape",
      where: at(o.el),
      text: textOf(o.el),
      against: `${e.main} at border-radius ${e.ref.value} on ${e.n} of the ${e.role} in ${[...e.regions][0]}${e.regions.size > 1 ? ` and ${e.regions.size - 1} more` : ""}, e.g. ${at(e.ref.el)} "${textOf(e.ref.el)}"`,
      off: Math.round(o.radius - e.ref.radius),
      fix: `Set border-radius to ${e.value} on ${and(exactNames(e.els))}; ${many ? `${e.els.length} are` : "it is"} ${o.form}${e.score < 0.5 ? ` at ${Math.round(o.radius)}px` : ""} where the ${e.role} beside ${many ? "them" : "it"} are ${e.main}${e.score < 0.5 ? ` at ${Math.round(e.ref.radius)}px` : ""}.${a ? "" : miss(e.els)}`,
      count: e.els.length,
      score: e.score,
      el: o.el,
      apply: a || [],
    });
  }
  const shapeList = Object.fromEntries(
    [...Map.groupBy(shaped, (s) => s.role)].map(([role, ms]) => [
      role,
      [...Map.groupBy(ms, (s) => (s.form === "rounded" ? `rounded ${Math.round(s.radius)}px` : s.form))].sort((a, b) => b[1].length - a[1].length).map(([k, xs]) => [k, xs.length, textOf(xs[0].el).slice(0, 32)]),
    ]),
  );

  const iconOnly = all.filter((el) => {
    if (!el.matches(BUTTON) || el.innerText.trim() || getComputedStyle(el).display === "inline") return false;
    const gs = [...el.querySelectorAll("svg, img")].filter((g) => !g.parentElement.closest("svg")),
      gr = gs[0]?.getBoundingClientRect();
    return gs.length === 1 && gr.width <= 32 && gr.height <= 32;
  });
  const sides = (el) => [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)];
  const lopsided = new Map();
  for (const el of iconOnly) {
    const [w, h] = sides(el);
    if (Math.abs(w - h) < 1 || Math.abs(w - h) > 8) continue;
    const k = `${at(el)}|${w}x${h}`;
    lopsided.set(k, [...(lopsided.get(k) || []), el]);
  }
  for (const els of lopsided.values()) {
    const el = els[0],
      cs = getComputedStyle(el),
      r = el.getBoundingClientRect(),
      [w, h] = [Math.round(r.width), Math.round(r.height)];
    const [prop, edges] = w > h ? ["height", ["Top", "Bottom"]] : ["width", ["Left", "Right"]];
    const v = Math.max(w, h) - (cs.boxSizing === "border-box" ? 0 : edges.reduce((n, s) => n + parseFloat(cs[`padding${s}`]) + parseFloat(cs[`border${s}Width`]), 0));
    const a = apply(els, { [prop]: `${v}px` });
    check({
      kind: "square",
      where: at(el),
      text: textOf(el),
      against: `its ${prop === "height" ? "width" : "height"} ${Math.max(w, h)}px; an icon-only button is square`,
      off: Math.min(w, h) - Math.max(w, h),
      fix: `Set ${prop} to ${v}px on ${and(exactNames(els))}; ${els.length > 1 ? `${els.length} icon-only buttons are` : "the icon-only button is"} ${w}x${h}.${a ? "" : miss(els)}`,
      count: els.length,
      score: painted(cs) ? 0.55 : iconOnly.some((o) => kindOf(o) === kindOf(el) && sides(o)[0] === sides(o)[1]) ? 0.5 : 0.4,
      el,
      apply: a || [],
    });
  }

  const ordered = [...textEls],
    ownText = new Map(runs.map(({ el, text }) => [el, text]));
  const topInk = Math.max(0, ...inkRatio.values()),
    sizeOf = (el) => parseFloat(getComputedStyle(el).fontSize),
    inkOf = (el) => inkRatio.get(el) ?? inkRatio.get(ordered.find((e) => el.contains(e)));
  const secondary = (el) => inkRatio.get(el) < topInk * 0.6 && chroma(flat(getComputedStyle(el).color)) <= 50;
  const sentence = (el) => {
    const s = ownText.get(el) || "";
    return words(s) >= 6 && !/\s[·•|]\s/.test(s) && s.split(/[,;]|\.\s/).some((f) => words(f) >= 5) && (s.match(/\S*\d\S*/g) || []).length <= 2;
  };
  const follows = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) && !a.contains(b);
  const lineCount = (root) => {
    const rs = [],
      walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = walk.nextNode()); ) {
      if (!/\S/.test(n.textContent) || !visible(n.parentElement) || isData(n.parentElement)) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      rs.push(...[...rg.getClientRects()].filter((q) => q.width > 1));
    }
    let n = 0,
      bottom = -Infinity;
    for (const q of rs.sort((a, b) => a.bottom - b.bottom)) if (q.top >= bottom - q.height * 0.3) (n++, (bottom = q.bottom));
    return n;
  };
  const styleOf = (e) => {
    const cs = getComputedStyle(e),
      w = Number(cs.fontWeight);
    return `${Math.round(parseFloat(cs.fontSize))}/${w >= 600 ? 600 : w >= 500 ? 500 : 400} ${chroma(flat(cs.color)) > 50 ? "accent" : secondary(e) ? "secondary" : "primary"}`;
  };
  const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor((xs.length - 1) / 2)];
  const inList = (e) => [...rowEls].some((r) => r.contains(e));
  const volLists = [...rowTypes]
    .filter(([, els]) => els.length >= 3 && !els.some((r) => r.matches("section, fieldset, form, aside") || r.querySelector("ul, ol, dl, table") || [...rowEls].some((x) => x !== r && r.contains(x))))
    .map(([type, els]) => {
      const per = els.map((r) => {
        const ts = ordered.filter((e) => r.contains(e) && !inRow(e, r) && !e.closest(BUTTON) && !shaped.some((s) => s.el.contains(e)));
        return { r, lines: lineCount(r), styles: [...new Set(ts.map(styleOf))], long: ts.find(sentence) };
      });
      const busy = per.slice().sort((a, b) => b.lines - a.lines || b.styles.length - a.styles.length)[0];
      return {
        type,
        el: els[0],
        rows: els.length,
        lines: [median(per.map((p) => p.lines)), Math.max(...per.map((p) => p.lines))],
        styles: [median(per.map((p) => p.styles.length)), Math.max(...per.map((p) => p.styles.length))],
        names: busy.styles,
        long: per.find((p) => p.long)?.long,
      };
    });
  for (const l of volLists)
    if (l.lines[0] > 2 || l.styles[0] > 2)
      check({
        kind: "volume",
        where: l.type,
        text: textOf(l.el),
        against: `${l.rows} rows of ${l.type} carry a median ${l.lines[0]} lines (at most ${l.lines[1]}) in ${l.styles[0]} text styles (${l.names.join(", ")})`,
        off: Math.max(l.lines[0], l.styles[0]) - 2,
        fix: `One lead per row; move the preview into the detail: keep the title and one meta line in ${l.type}${l.long ? `, and cut ${at(l.long)} "${cut(ownText.get(l.long), 32)}"` : ""}.`,
        count: l.rows,
        score: l.lines[0] > 2 ? 0.6 : l.styles[0] > 3 ? 0.5 : 0.4,
        el: l.el,
        apply: [],
      });
  const titles = new Map();
  for (const h of all) if (h.matches("h1, h2, h3, h4, h5, h6, [role=heading]") && !inList(h)) titles.set(h, container(h) || column(h));
  for (const c of cards) {
    const t = ordered
      .filter((e) => c.contains(e) && !inRow(e, c))
      .slice(0, 3)
      .sort((a, b) => sizeOf(b) - sizeOf(a) || getComputedStyle(b).fontWeight - getComputedStyle(a).fontWeight)[0];
    if (t && ![...titles.keys()].some((h) => h.contains(t))) titles.set(t, c);
  }
  const helpers = [],
    eyebrows = [];
  for (const [t, scope] of titles) {
    const tr = t.getBoundingClientRect(),
      near = ordered.filter((e) => scope.contains(e) && !t.contains(e) && !e.contains(t));
    const prev = near.findLast((e) => follows(e, t)),
      next = near.find((e) => follows(t, e));
    const pr = prev?.getBoundingClientRect();
    if (prev && /\p{L}{2}/u.test(t.innerText) && !isValue(t.innerText.trim()) && pr.bottom <= tr.top + 2 && pr.top >= tr.top - 40 && Math.abs(pr.left - tr.left) <= 8 && words(ownText.get(prev) || "") <= 4 && sizeOf(prev) < sizeOf(t)) eyebrows.push(prev);
    if (
      next &&
      !inList(next) &&
      next.getBoundingClientRect().top >= tr.bottom - 2 &&
      sentence(next) &&
      (secondary(next) || inkRatio.get(next) < 0.8 * inkOf(t)) &&
      lineCount(next) <= 3 &&
      [...scope.querySelectorAll("*")].some((e) => follows(next, e) && visible(e) && (textEls.has(e) || e.matches(`${BUTTON}, ${CONTROL}, table, ul, ol, dl, img, canvas`)))
    )
      helpers.push([next, t]);
  }
  if (helpers.length) {
    const [h, t] = helpers[0];
    check({
      kind: "volume",
      where: at(h),
      text: textOf(h),
      against: `a helper sentence under the title ${at(t)} "${textOf(t)}"${helpers.length > 1 ? `, and under ${helpers.length - 1} more titles` : ""}`,
      off: words(ownText.get(h)),
      fix: `Cut the sentence under the title (${and(holders(helpers.map(([x]) => x)))}); one lead per card or section: the title and what follows say it, an explanation belongs in the empty state or a tooltip.`,
      count: helpers.length,
      score: 0.55,
      el: h,
      apply: [],
    });
  }
  const explained = ordered.filter((e) => secondary(e) && sentence(e) && (units.some((u) => u.contains(e)) || helpers.some(([h]) => h === e)));
  const total = runs.reduce((n, r) => n + words(r.text), 0);
  text.volume = {
    words: total,
    lists: volLists.map((l) => ({ list: l.type, rows: l.rows, lines: l.lines, styles: l.styles })),
    sentences: { count: explained.length, sample: explained.slice(0, 5).map((e) => cut(ownText.get(e), 48)) },
    eyebrows: { count: eyebrows.length, sample: eyebrows.slice(0, 5).map((e) => cut(ownText.get(e), 32)) },
    helpers: { count: helpers.length, sample: helpers.slice(0, 5).map(([e]) => cut(ownText.get(e), 48)) },
  };

  const bodySize = parseFloat(
    [...runs.reduce((m, { el, text }) => m.set(getComputedStyle(el).fontSize, (m.get(getComputedStyle(el).fontSize) || 0) + words(text)), new Map())].sort((a, b) => b[1] - a[1])[0]?.[0] || "16",
  );
  const lv = layer.getBoundingClientRect();
  const shown = (r) =>
    Math.max(0, Math.min(r.right, innerWidth, lv.right) - Math.max(r.left, 0, lv.left)) * Math.max(0, Math.min(r.bottom, innerHeight, lv.bottom) - Math.max(r.top, 0, lv.top));
  const view = shown(lv);
  const beneath = (el) => {
    const st = [];
    for (let n = el.parentElement; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) st.push(c);
      if (c[3] >= 255) break;
    }
    return st.reverse().reduce((u, c) => over(c, u), [255, 255, 255]);
  };
  const rivals = [];
  for (const el of textEls) if (shown(el.getBoundingClientRect()) && sizeOf(el) >= bodySize * 1.6) rivals.push({ el, what: "text", key: `text ${getComputedStyle(el).font}` });
  for (const el of all) {
    const cs = getComputedStyle(el),
      r = el.getBoundingClientRect();
    if (el === layer || el.matches(STATE) || !filled(cs) || r.width < 24 || r.height < 24 || !shown(r) || r.width * r.height > view / 4 || !(el.innerText?.trim() || (r.width >= 48 && r.height >= 48))) continue;
    const under = beneath(el);
    if (ratioOf(over(rgba(cs.backgroundColor), under), under) >= 3) rivals.push({ el, what: "solid fill", key: `fill ${hex(cs.backgroundColor)} ${Math.round(r.height)}` });
  }
  for (const el of layer.querySelectorAll("*"))
    if (
      (el.matches("img, video, canvas, picture, [role=img]") || (el instanceof SVGSVGElement && !el.parentElement.closest("svg")) || /url\(/.test(getComputedStyle(el).backgroundImage)) &&
      shown(el.getBoundingClientRect()) > view / 4
    )
      rivals.push({ el, what: "image", key: `image ${sel(el)}` });
  const leads = [];
  for (const c of rivals.filter((c) => !rivals.some((o) => o !== c && o.el.contains(c.el)))) {
    const r = c.el.getBoundingClientRect(),
      same = leads.find((l) => l.key === c.key && l.r.top < r.bottom && r.top < l.r.bottom);
    if (same) same.n++;
    else leads.push({ ...c, r, n: 1 });
  }
  const leadText = (l) => `${l.what} "${textOf(l.el).slice(0, 24)}"${l.n > 1 ? ` (a row of ${l.n})` : ""}`;
  const leadSizes = leads.filter((l) => l.what === "text").map((l) => Math.round(sizeOf(l.el))),
    leadTie = leadSizes.some((s, i) => leadSizes.indexOf(s) !== i);
  if (leads.length > 2)
    check({
      kind: "large",
      where: at(leads[0].el),
      text: textOf(leads[0].el),
      against: `${leads.length} things compete to lead in view: ${leads.map(leadText).join(", ")}${leadTie ? `; two of them share ${leadSizes.find((s, i) => leadSizes.indexOf(s) !== i)}px` : ""}`,
      off: leads.length - 2,
      fix: `Keep one lead and at most one second; set the rest back: figures to the body size, a second solid button to an outline, an image under a quarter of the view (${leads
        .map((l) => at(l.el))
        .join(", ")}).`,
      count: leads.length,
      score: leads.length >= 4 ? 0.55 : leadTie ? 0.5 : 0.4,
      el: leads[0].el,
      apply: [],
    });

  // 9. rank, placement, contradiction, repeat: the outline, where actions sit, and what a section says.
  const LEVEL = "h1, h2, h3, h4, h5, h6, [role=heading]";
  const level = (h) => (/^H\d$/.test(h.tagName) ? +h.tagName[1] : +h.getAttribute("aria-level") || 2);
  const own = (e) => !e.closest(`${BUTTON}, ${CONTROL}, [role=tab], ${STATE}`) && !shaped.some((s) => s.el.contains(e));
  const titleLike = (e) => {
    const s = ownText.get(e) || "",
      cs = getComputedStyle(e);
    return own(e) && !inList(e) && words(s) <= 6 && /\p{L}{2}/u.test(s) && !isValue(s) && (!!e.closest(LEVEL) || +cs.fontWeight >= 600 || cs.textTransform === "uppercase");
  };
  const heads = all.filter((e) => e.matches(LEVEL) && !inList(e) && e.innerText.trim());
  const parentOf = (h) => heads.findLast((p) => follows(p, h) && level(p) < level(h) && column(p) === column(h));
  const quote = (e) => `${at(e)} "${cut(e.innerText.trim().replace(/\s+/g, " "), 32)}"`;
  const outline = heads.map((h) => [h, parentOf(h)]);
  for (const pt of heads.filter((h) => level(h) === 1))
    for (const e of ordered) if (column(e) === column(pt) && follows(pt, e) && !e.closest(LEVEL) && titleLike(e) && sizeOf(e) >= sizeOf(pt) - 0.5) outline.push([e, pt]);
  const outlined = new Set();
  for (const [h, p] of outline) {
    if (!p || sizeOf(h) < sizeOf(p) - 0.5) continue;
    outlined.add(h).add(p);
    const sibs = heads.filter((o) => o !== h && h.matches(LEVEL) && level(o) === level(h) && parentOf(o)),
      stepOf = (o) => (sizeOf(o) < sizeOf(parentOf(o)) - 0.5 ? +(sizeOf(o) / sizeOf(parentOf(o))).toFixed(2) : 0),
      steps = sibs.map(stepOf).filter(Boolean),
      step = commonest(steps.slice()),
      value = step && steps.filter((s) => s === step).length > sibs.length / 2 && `${Math.round(sizeOf(p) * step)}px`,
      ref = value && getComputedStyle(sibs.find((o) => stepOf(o) === step)),
      decl = value && { "font-size": value, ...(ref.fontSize === value && ref.lineHeight !== getComputedStyle(h).lineHeight ? { "line-height": ref.lineHeight } : {}) },
      a = value && apply([h], decl);
    check({
      kind: "rank",
      where: at(h),
      text: textOf(h),
      against: `its parent ${quote(p)} at ${sizeOf(p)}px`,
      off: sizeOf(h) - sizeOf(p),
      fix: value
        ? `Set ${Object.entries(decl)
            .map(([k, v]) => `${k} to ${v}`)
            .join(", ")} on ${exactNames([h])[0]}; its ${steps.length} sibling titles take ${step}x their parent's size.${a ? "" : miss([h])}`
        : `Make ${quote(h)} (${sizeOf(h)}px) a clear step smaller than ${quote(p)} (${sizeOf(p)}px); a section title as large as its page title reads as a second page.`,
      count: 1,
      score: 0.6,
      el: h,
      apply: a || [],
    });
  }
  const roleOf = (e) => (e.closest(LEVEL) ? `h${level(e.closest(LEVEL))}` : isValue(ownText.get(e) || "") ? "figure" : "text");
  const big = ordered.filter((e) => own(e) && shown(e.getBoundingClientRect()) && sizeOf(e) >= bodySize * 1.25).sort((a, b) => sizeOf(b) - sizeOf(a));
  if (big.length > 1 && Math.abs(sizeOf(big[0]) - sizeOf(big[1])) < 0.5 && roleOf(big[0]) !== roleOf(big[1]) && !(outlined.has(big[0]) && outlined.has(big[1])))
    check({
      kind: "rank",
      where: at(big[1]),
      text: textOf(big[1]),
      against: `the largest text in view, ${quote(big[0])}, a ${roleOf(big[0])} at the same ${sizeOf(big[0])}px`,
      off: 0,
      fix: `Size ${quote(big[1])} (${roleOf(big[1])}) and ${quote(big[0])} (${roleOf(big[0])}) apart so one leads; two roles at one size compete.`,
      count: 2,
      score: 0.55,
      el: big[1],
      apply: [],
    });
  for (const [col, ts] of Map.groupBy(
    ordered.filter((e) => own(e) && !inList(e)),
    column,
  )) {
    const sizes = [...Map.groupBy(ts, (e) => Math.round(sizeOf(e)))].sort((a, b) => b[0] - a[0]);
    if (sizes.length > 3)
      check({
        kind: "rank",
        where: sel(col),
        text: textOf(col),
        against: `${sizes.length} text sizes outside its rows: ${sizes.map(([s, es]) => `${s}px "${cut(ownText.get(es[0]), 20)}"`).join(", ")}`,
        off: sizes.length - 3,
        fix: `Keep three text sizes in ${sel(col)}, title, body, and meta, and set the other ${sizes.length - 3} onto them.`,
        count: sizes.length,
        score: sizes.length > 4 ? 0.5 : 0.4,
        el: col,
        apply: [],
      });
  }
  const headerOf = (b) => {
    const ks = [...b.children].filter((k) => visible(k) && k.getBoundingClientRect().height),
      h = ks[0];
    if (!h || ks.length < 2) return null;
    const r = h.getBoundingClientRect();
    return h.matches("header, [role=toolbar]") || (r.width >= b.getBoundingClientRect().width * 0.9 && r.height <= 64 && lined(getComputedStyle(h), "Bottom")) ? h : null;
  };
  const panes = [layer, ...columns, ...cards].filter((b) => layer.contains(b) && headerOf(b));
  const nameOf = (e) => (e.innerText?.trim() || e.getAttribute("aria-label") || e.getAttribute("title") || "").replace(/\s+/g, " ");
  for (const b of panes) {
    const hd = headerOf(b),
      acts = [...hd.querySelectorAll(BUTTON)].filter((e) => visible(e) && !e.matches(`[role=tab], ${STATE}`)),
      body = [...b.children].filter((k) => follows(hd, k)),
      things = all.filter((e) => body.some((k) => k.contains(e)) && (e.matches(`${BUTTON}, ${CONTROL}`) || (textEls.has(e) && !e.closest(`${BUTTON}, ${CONTROL}`)))),
      f = things[0];
    if (!acts.length || !f?.matches(BUTTON)) continue;
    const fr = f.getBoundingClientRect();
    if (things.some((e) => !f.contains(e) && e.getBoundingClientRect().top < fr.bottom && fr.top < e.getBoundingClientRect().bottom)) continue;
    check({
      kind: "placement",
      where: at(f),
      text: textOf(f),
      against: `${sel(hd)} carries ${acts.length} actions (${acts.map((e) => `"${cut(nameOf(e), 16)}"`).join(", ")}) while this button sits alone atop the body`,
      off: Math.round(fr.top - hd.getBoundingClientRect().bottom),
      fix: `Move "${nameOf(f)}" into the trailing zone of ${sel(hd)}, beside ${and(acts.map((e) => `"${cut(nameOf(e), 16)}"`))}; one place for the pane's actions.`,
      count: 1,
      score: 0.55,
      el: f,
      apply: [],
    });
  }
  const plus = (svg) => {
    const u = svg.querySelector("use"),
      src = u ? document.querySelector(u.getAttribute("href") || u.getAttribute("xlink:href")) : svg;
    const pts = [...(src?.querySelectorAll("path, line, polyline") || [])].flatMap((g) => {
      try {
        const n = g.getTotalLength();
        return Array.from({ length: 25 }, (_, i) => g.getPointAtLength((n * i) / 24));
      } catch {
        return [];
      }
    });
    if (pts.length < 4) return false;
    const xs = pts.map((p) => Math.round(p.x * 2) / 2),
      ys = pts.map((p) => Math.round(p.y * 2) / 2),
      [cx, cy] = [commonest(xs.slice()), commonest(ys.slice())],
      w = Math.max(...xs) - Math.min(...xs),
      t = w * 0.08;
    return w > 0 && pts.every((p) => Math.abs(p.x - cx) <= t || Math.abs(p.y - cy) <= t) && [Math.min(...xs), Math.max(...xs)].every((x) => Math.abs(x - cx) > w / 3) && [Math.min(...ys), Math.max(...ys)].every((y) => Math.abs(y - cy) > w / 3);
  };
  const creates = all.filter(
    (e) =>
      (e.matches(`${BUTTON}, a[href]`) && nameOf(e) && !e.closest("form")?.querySelector("input:not([type=hidden], [type=checkbox], [type=radio]), textarea") && (/^(\+\s*\p{L}|add\b|new\b|create\b)/iu.test(nameOf(e)) || (e.querySelector("svg") && plus(e.querySelector("svg"))))) ||
      (e.matches("input, textarea") && /^(add|new|create)\b/i.test(e.placeholder || "")),
  );
  const sectionOf = (e) => {
    for (let n = e.parentElement; n && n !== layer; n = n.parentElement) {
      if (columns.has(n)) return n;
      const t = ordered.find((x) => n.contains(x) && own(x));
      if (t && (titleLike(t) || t.closest(LEVEL))) return n;
    }
    return layer;
  };
  for (const [sec, cs] of Map.groupBy(creates, sectionOf)) {
    if (cs.length < 2) continue;
    const say = (e) => `"${cut(nameOf(e) || e.placeholder, 24)}" (${at(e)})`;
    check({
      kind: "placement",
      where: at(cs[1]),
      text: nameOf(cs[1]) || cs[1].placeholder,
      against: `${cs.length} ways to add in ${sel(sec)}: ${and(cs.map(say))}`,
      off: cs.length - 1,
      fix: `Keep one way to add in ${sel(sec)}: fold ${and(cs.slice(1).map(say))} into ${say(cs[0])}, or into one Add menu.`,
      count: cs.length,
      score: 0.55,
      el: cs[1],
      apply: [],
    });
  }
  const NOT_COUNT = /\b(week|wave|day|sprint|phase|release|version|v|step|stage|rack|hall|gate|level|year|quarter|q|kw|cw|round|part|chapter|section|page|room|floor|building)$/i;
  const empty = (s) => words(s) <= 8 && /^(no|none|nothing|keine?|nichts)\b/i.test(s);
  for (const t of new Set([...heads, ...ordered.filter(titleLike)].map((e) => e.closest(LEVEL) || e))) {
    let row = t;
    while (row.parentElement && row.parentElement !== layer && row.parentElement.innerText.trim() === row.innerText.trim()) row = row.parentElement;
    const m = row.innerText
      .trim()
      .replace(/\s+/g, " ")
      .match(/^(.*\p{L}.*?)\s+(\d+)$/u);
    if (!m || +m[2] === 0 || +m[2] >= 1900 || NOT_COUNT.test(m[1]) || words(m[1]) > 5 || inList(row)) continue;
    const sec = [];
    for (let n = row.nextElementSibling; n && kindOf(n) !== kindOf(row); n = n.nextElementSibling) if (visible(n)) sec.push(n);
    if (!sec.length) continue;
    const items =
      sec.some((n) => n.matches("li, tr, [role=listitem], [role=row], [role=option], article") || n.querySelector("li, tr, [role=listitem], [role=row], [role=option]") || [...rowEls].some((r) => n.contains(r))) ||
      [...Map.groupBy(sec, kindOf)].some(([k, g]) => g.length >= 2 && k.includes("."));
    const none = ordered.filter((e) => sec.some((n) => n.contains(e)) && own(e) && empty(ownText.get(e) || ""));
    if (items && !none.length) continue;
    check({
      kind: "contradiction",
      where: at(t),
      text: textOf(row),
      against: `the count ${m[2]} beside ${[!items && "no items", none.length && `"${ownText.get(none[0])}"`].filter(Boolean).join(" and ")} in its section`,
      off: +m[2],
      fix: `Show the ${m[2]} ${m[1].toLowerCase()} the count promises under ${quote(t)}${none.length ? `, and drop ${and(holders(none))} "${ownText.get(none[0])}"` : ""}; or, when they are filtered out, say so in the count.`,
      count: 1 + none.length,
      score: 0.6,
      el: t,
      apply: [],
    });
  }
  const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
  for (const b of [layer, ...columns].filter((x) => layer.contains(x) && headerOf(x))) {
    const hd = headerOf(b),
      t = ordered.find((e) => hd.contains(e) && own(e)),
      h1 = heads.find((h) => level(h) === 1 && b.contains(h) && !hd.contains(h) && column(h) === (b === layer ? layer : b));
    if (t && h1 && norm(t.innerText) === norm(h1.innerText))
      check({
        kind: "repeat",
        where: at(t),
        text: textOf(t),
        against: `the pane's h1 ${quote(h1)} right below it`,
        off: 0,
        fix: `Say "${ownText.get(t)}" once: drop it from ${sel(hd)} and keep the h1, or show the header title only once the h1 scrolls away.`,
        count: 2,
        score: 0.55,
        el: t,
        apply: [],
      });
  }

  // Rank, number, draw.
  const ranked = checks.sort((a, b) => b.score - a.score).slice(0, 20);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const host = document.body.appendChild(document.createElement("div"));
  host.id = "__count";
  host.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483646";
  const root = host.attachShadow({ mode: "open" });
  const COLOR = { crowding: "#d9480f", sibling: "#7048e8", control: "#0c8599", contrast: "#c2255c", shape: "#2b8a3e", square: "#1971c2", volume: "#862e9c", large: "#e67700", rank: "#a61e4d", placement: "#5f3dc4", contradiction: "#c92a2a", repeat: "#364fc7" };
  const marks = ranked.map((f, i) => {
    const r = f.el.getBoundingClientRect(),
      [x, y] = [r.left + scrollX, r.top + scrollY];
    return `<i class="m" style="left:${x - 2}px;top:${y - 2}px;width:${r.width + 4}px;height:${r.height + 4}px;border-color:${COLOR[f.kind]}"><b style="background:${COLOR[f.kind]}">${i + 1}</b></i>`;
  });
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
    slop: [...slop.values()],
    shapes: shapeList,
    leads: leads.map((l) => [l.what, l.n, textOf(l.el).slice(0, 32)]),
    offGrid: [...offGrid.values()].sort((a, b) => b[1] - a[1]),
    nestedRadius,
    rows,
    cards: cardList.slice(0, 20),
    text,
    ...out,
  });
})();
