// Redline: do things sit on shared lines? Guides are scoped: a start lines up only with starts
// in its own column (scene `column`), and at its own level there: things sitting directly in
// the column (headings, text, boxes, and the edges of cards, panels, tiles, dividers, and
// photos) compare with each other; things inside a card compare with things inside the
// column's other cards, so sibling cards' contents line up across cards. Pink guides run
// down where three or more starts share an x or along a painted edge (dashed: shared right
// edges) and across through shared box and edge tops and bottoms, each over its column only,
// its count in small light digits at one end, left out where it would cover text or a badge.
// A red mark sits on a start 1 to 3px off a guide, an orange one 4 to 8px off (12px inside a
// card); of two guides within 8px the weaker one's members are off. A start is measured only
// against starts in its own painted container, or, on the column, against the column's own;
// across cards the container is the unit: one whose content inset disagrees with what most of
// its column's cards use, on its left or its right, is one `inset` check. Not starts: data
// (scene `isData`: charts, waveforms, avatar stacks), the inner text of a box (chip, button,
// input), inline text that follows other text on its line, and cells of a table: a table is
// one unit, its outer edges plus one start per table column, and inside it each column's cells
// line up on their own: the right content edge of right-aligned cells, else the left, 1 to 8px
// off the line most of the column shares is an `edge` check. A start 1 to 3px off its own
// card's content edge, where its card-mates sit, scores like one 4px off. Right edges count
// like starts for boxes, cards, dividers, photos, tables, the last table column (its cells'
// content edge), and right-aligned text; never a ragged text end, an icon, or anything
// followed on its line. A thing off on both sides by the same amount is one check with the
// symmetric fix (`padding-inline`); off on one side, the fix names that side under the same
// `kind where`, so a half edit still shows.
// Horizontal lines get the same care. `inset` also compares a card's first text's distance below
// its top edge (a header that a taller button centres lower: padding-block) and its last
// content's distance above its bottom edge across cards of one kind, in neighbouring columns too.
// `baseline` covers style lines across a row: in three or more sibling cells side by side (KPI
// tiles, cards), each text style (size, weight, color) most cells carry sits on one line, drawn
// dashed across the row; a text that wraps where its twins do not is one check that names what
// it pushes off its lines. Also label/value pairs (dt and dd) whose value sits off its label's
// line (`align-items: baseline`), and row pairs: cells of repeated rows whose first texts sit a
// different distance apart from row to row. Across columns, a card top, card bottom, or heading
// baseline 1 to 12px off its like in the column beside is an `edge` check (axis y); farther is a
// layout decision. Also `inset`, a text start 9 to 16px inside the guide its column-mates share.
// These are minimum checks, the floor of a review, not the review: the overlay is what to look
// at. Checks (the contract: kind, where, text, against, off = mover minus reference, fix, count,
// score, apply) fold a repeated row or card into one; `where` names the element the fix edits and
// `text` is its text or the mover's inside it. Every `apply` selector comes from the scene's
// `exact()`: it matches the elements holding the value and nothing else; with none, `apply: []`
// and the fix names what else the name matches. A check whose only fix writes a negative padding
// or margin, zeroes a control's padding, or changes a font size is dropped. The overlay numbers
// the top 12 to match, each badge placed beside its box where it covers no text. Reads the layer
// (window.__axesLayer, else the last open dialog or sheet, else main, else the body), the part in
// view. Live: window.__redlineLive = true, or load it with a <script> tag, and it redraws on DOM
// changes, scroll, and resize; Alt+R hides and shows it. Returns JSON: lines, rows, near and far
// misses (axis x, end, or y), checks. window.__redlineClear() removes the overlay and the listeners.
(() => {
  window.__redlineClear?.();
  const live = window.__redlineLive === true || !!document.currentScript;
  const CONTROL = "input:not([type=hidden]), select, textarea, progress, meter, [role=checkbox], [role=switch], [role=radio], [role=slider], [role=progressbar], [role=textbox], [role=combobox]";
  const short = (s) => s.trim().replace(/\s+/g, " ").slice(0, 40);
  const alpha = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return c === "transparent" ? 0 : 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    return p.length > 3 ? Number(p[3]) : 1;
  };
  const px = (n, p) => parseFloat(getComputedStyle(n)[p]) || 0;
  let host = null,
    on = true,
    timer = 0,
    last = "{}";

  function draw() {
    host?.remove();
    host = null;
    if (!on) return last;
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
    const L = layer.getBoundingClientRect();
    const [top, bottom, left, right] = [Math.max(0, L.top), Math.min(innerHeight, L.bottom), Math.max(0, L.left), Math.min(innerWidth, L.right)];
    const inView = (r) => r.width > 0 && r.height > 0 && r.bottom > top && r.top < bottom && r.right > left && r.left < right;
    const shown = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    const topmost = (el, r) => {
      const x = Math.min(innerWidth - 1, Math.max(0, r.left + 2)),
        y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const hit = document.elementFromPoint(x, y);
      return !!hit && (hit === el || el.contains(hit) || hit.contains(el));
    };
    const skip = (el) => !!el.closest(".proto, select, option, script, style, template, noscript") || isData(el);
    // A name an agent can search for: the nearest element that is not a bare i, div, span, or svg.
    const named = (el) => {
      let n = el;
      while (n.parentElement && n !== layer && /^(I|DIV|SPAN|SVG|B|EM|STRONG)$/.test(n.tagName.toUpperCase()) && !firstClass(n)) n = n.parentElement;
      return n;
    };
    // A candidate selector for exact(): a table cell stands for its whole column.
    const target = (el) =>
      el.matches("th, td")
        ? `${sel(el.closest("table"))} :is(th, td):${!el.cellIndex ? "first-child" : el === el.parentElement.lastElementChild ? "last-child" : `nth-child(${el.cellIndex + 1})`}`
        : sel(el);
    // What a fix on el means: el, and the copies of it that hold the same value of p. Copies share its
    // name, class list, and parent's class list; a table cell's copies are its column in every copy
    // of its table.
    const copies = (el) => [...document.querySelectorAll(sel(el))].filter((n) => n.className === el.className && n.parentElement?.className === el.parentElement?.className);
    const cells = (table, at) => copies(table).flatMap((t) => [...t.rows].map((r) => r.cells[at === -1 ? r.cells.length - 1 : at]).filter(Boolean));
    const holders = (el, p) => {
      const peers = el.matches("th, td") ? cells(el.closest("table"), el.cellIndex) : copies(el);
      return [...new Set([el, ...peers.filter((n) => getComputedStyle(n)[p] === getComputedStyle(el)[p])])];
    };
    // Already holds a declaration: px values by number, keywords as computed; *-inline on both sides.
    const has = (n, d) =>
      (/-inline$/.test(d.property) ? ["Left", "Right"].map((s) => d.property.replace("-inline", s)) : [d.property]).every((p) => {
        const v = getComputedStyle(n)[p.replace(/-(\w)/g, (_, c) => c.toUpperCase())];
        return /px$/.test(d.value) ? parseFloat(v) === parseFloat(d.value) : v === d.value;
      });
    // The fix's selector from exact(): `on` names it in the fix text, `apply` carries the declarations.
    // With no exact selector, apply is empty and `note` says what else the name matches.
    const onto = (els, decls, tries = []) => {
      const same = (n) => decls.every((d) => has(n, d)),
        q = exact(els, tries, same);
      if (q) return { on: q, apply: decls.map((d) => ({ selector: q, ...d })), note: "" };
      const name = [...new Set(els.map(sel))].join(", "),
        others = [...document.querySelectorAll(name)].filter((n) => !els.includes(n) && !same(n));
      const list = others.slice(0, 3).map((n) => `"${textOf(n, n.getBoundingClientRect())}"`);
      return {
        on: name,
        apply: [],
        note: ` No selector reaches only these: ${name} also matches ${list.join(", ")}${others.length > 3 ? ` and ${others.length - 3} more` : ""}; give them a class of their own.`,
      };
    };
    const textOf = (el, r) =>
      short(el.innerText ?? el.textContent ?? "") ||
      short(el.getAttribute("aria-label") || "") ||
      `${el.matches("img, video, picture") ? "image" : el.matches("svg") ? "icon" : "box"} ${Math.round(r.width)}×${Math.round(r.height)}`;
    const firstRect = (n) => {
      const range = document.createRange();
      range.selectNodeContents(n);
      return [...range.getClientRects()].find((r) => r.width > 0 && r.height > 0);
    };
    const firstText = (el) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
      });
      return w.nextNode();
    };
    // Right-aligned text: text-align right or end, or pushed to its parent's right edge (auto margin,
    // flex end) more than 24px past the sibling before it. Measured by its right edge only.
    const pushedRight = (el, r) => {
      for (let n = el, d = 0; n && n !== layer && d < 5; n = n.parentElement, d++) {
        const p = n.parentElement,
          q = n.getBoundingClientRect(),
          cs = getComputedStyle(n);
        const innerRight = q.right - px(n, "paddingRight") - px(n, "borderRightWidth");
        if (Math.abs(innerRight - r.right) > 2) return false;
        if (/right|end/.test(cs.textAlign) && q.width - r.width > 1) return true;
        if (!p) return false;
        const pr = p.getBoundingClientRect(),
          pcs = getComputedStyle(p);
        if (Math.abs(pr.right - px(p, "paddingRight") - px(p, "borderRightWidth") - q.right) > 1.5) continue;
        const before = [...p.children]
          .filter((k) => k !== n && k.getClientRects().length)
          .map((k) => k.getBoundingClientRect())
          .filter((k) => k.right <= q.left + 1 && Math.min(k.bottom, q.bottom) - Math.max(k.top, q.top) > 0);
        if (before.length) {
          if (q.left - Math.max(...before.map((k) => k.right)) > 24) return true;
        } else if (/flex|grid/.test(pcs.display) && /end|right/.test(pcs.justifyContent) && q.left - pr.left > 24) return true;
      }
      return false;
    };

    // Boxes: controls, and small painted things (chip, button, pill, icon tile). A box is one start.
    const boxes = new Set();
    const inBox = (el) => {
      for (let n = el; n && n !== layer; n = n.parentElement) if (boxes.has(n)) return true;
      return false;
    };
    const painted = (el) => {
      const cs = getComputedStyle(el),
        bg = cs.backgroundColor;
      const fill = (alpha(bg) > 0.02 && bg !== getComputedStyle(el.parentElement || el).backgroundColor) || cs.backgroundImage !== "none";
      const edges = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && alpha(cs[`border${s}Color`]) > 0.02);
      return fill || edges || cs.boxShadow !== "none" || (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0);
    };
    const side = (cs, s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && alpha(cs[`border${s}Color`]) > 0.02;
    // A filled thing touching a sibling of the same fill (segmented headers) shows no edge there.
    const seam = (el, r, sib, toward) => {
      if (!sib) return false;
      const a = getComputedStyle(el),
        b = getComputedStyle(sib),
        q = sib.getBoundingClientRect();
      return (
        alpha(a.backgroundColor) > 0.02 && a.backgroundColor === b.backgroundColor && !side(a, toward) && Math.abs((toward === "Left" ? q.right : q.left) - (toward === "Left" ? r.left : r.right)) <= 1
      );
    };
    const visibleSides = (el, r) => ({
      x: !seam(el, r, el.previousElementSibling, "Left"),
      end: !seam(el, r, el.nextElementSibling, "Right"),
    });

    // A start: an element or text run with its left (x), right (end), top, and bottom edges, null
    // where nothing is drawn. kind: text, box, media, edge (container, divider, photo, table), or
    // tcol (a table column). Its scope is its column and level (in a card or not).
    const starts = [];
    const start = (el, r, kind, { x = 1, end = 1, top = 1, bot = 1 } = {}, at = el) => {
      const col = column(at),
        holder = container(at);
      starts.push({
        el,
        r,
        kind,
        col,
        holder,
        lvl: holder ? "in" : "col",
        x: x ? Math.round(r.left) : null,
        end: end ? Math.round(r.right) : null,
        top: top ? Math.round(r.top) : null,
        bot: bot ? Math.round(r.bottom) : null,
      });
    };
    const tables = new Set();
    for (const el of layer.querySelectorAll("*")) {
      if (inBox(el.parentElement) || (el.closest("svg") && el.tagName !== "svg")) continue;
      const t = el.closest("table");
      if (t && t !== el) continue;
      const r = el.getBoundingClientRect();
      if (!inView(r) || (Math.min(r.width, r.height) < 5 && Math.max(r.width, r.height) < 48 && !el.matches(CONTROL)) || skip(el)) continue;
      if (t) {
        // A table: its outer edges, and one start per table column at the header (or first row) text.
        tables.add(el);
        start(el, r, "edge");
        const row = el.tHead?.rows[0] || el.rows[0];
        let first = true;
        for (const cell of row ? row.cells : []) {
          const n = firstText(cell),
            q = n && firstRect(n);
          if (!q || !inView(q)) continue;
          const ra = /right|end/.test(getComputedStyle(cell).textAlign);
          // The last column's right edge is its cell's content edge, wherever its text ends.
          const last = cell === row.cells[row.cells.length - 1],
            cr = cell.getBoundingClientRect().right - px(cell, "paddingRight") - px(cell, "borderRightWidth");
          start(cell, last ? { left: q.left, right: cr, top: q.top, bottom: q.bottom, width: cr - q.left, height: q.height } : q, "tcol", { x: !ra, end: ra || last, top: 0, bot: 0 }, el);
          Object.assign(starts[starts.length - 1], {
            label: short(n.nodeValue),
            inner: !first,
            last,
          });
          first = false;
        }
        continue;
      }
      const box = el.matches(CONTROL) || (r.height <= 48 && (r.width <= L.width / 2 || !!el.querySelector("input, select, textarea")) && painted(el));
      const media = el.matches("img, video, picture, svg");
      if (!box && !media) {
        // A container (card, panel, tile, photo) or divider shows its painted edges; its contents keep their own starts.
        if (!shown(el)) continue;
        const cs = getComputedStyle(el);
        if (painted(el)) {
          const v = visibleSides(el, r);
          start(el, r, "edge", {
            x: v.x,
            end: v.end && r.width > 2,
            bot: r.height > 2,
          });
        } else if (["Left", "Right", "Top", "Bottom"].some((s) => side(cs, s)))
          start(el, r, "edge", {
            x: side(cs, "Left"),
            end: side(cs, "Right"),
            top: side(cs, "Top"),
            bot: side(cs, "Bottom"),
          });
        continue;
      }
      if (box) boxes.add(el);
      if (!shown(el) || !topmost(el, r)) continue;
      const big = media && r.width > 48 && r.height > 48;
      if (box && pushedRight(el, r)) start(el, r, "box", { x: 0 });
      else start(el, r, big ? "edge" : box ? "box" : "media", box ? visibleSides(el, r) : {});
    }
    // Text: the first line of a visible run outside a box, a table, and data.
    const runs = [];
    const walk = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
    });
    for (let n; (n = walk.nextNode()); ) {
      const el = n.parentElement,
        r = firstRect(n);
      if (!r || !inView(r) || el.closest("table") || inBox(el) || skip(el) || !shown(el) || !topmost(el, r)) continue;
      // Centered text (a label in a tile) has no edge to line up.
      const block = [el, el.parentElement].find((b) => {
        const q = b?.getBoundingClientRect(),
          mid = q && (q.left + px(b, "paddingLeft") + q.right - px(b, "paddingRight")) / 2;
        return q && q.width - r.width > 8 && Math.abs(mid - (r.left + r.right) / 2) <= 2;
      });
      if (block) continue;
      runs.push({ el, r, n, right: pushedRight(el, r) });
    }
    for (const t of runs) {
      start(t.el, t.r, "text", { x: !t.right, end: t.right, top: 0, bot: 0 });
      Object.assign(starts[starts.length - 1], {
        size: px(t.el, "fontSize"),
        label: short(t.n.nodeValue),
      });
    }
    // A text, box, or dot that follows text, an icon, or a dot on its line (within 16px) is not a
    // start; a control's label is.
    const dots = starts.filter((s) => (s.el.tagName === "svg" || (s.kind === "box" && s.r.width <= 16 && s.r.height <= 16)) && !s.el.matches(CONTROL)).map((s) => s.r);
    const solid = [...runs.map((t) => t.r), ...dots];
    const follows = (r) => solid.some((q) => q !== r && q.right <= r.left + 1 && r.left - q.right <= 16 && Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top) >= 0.5 * Math.min(q.height, r.height));
    // Likewise a text, box, or dot with something after it on its line (within 16px) has no right edge.
    const inline = [...runs.map((t) => t.r), ...starts.filter((s) => s.kind !== "edge" && s.kind !== "tcol").map((s) => s.r)];
    for (const s of starts)
      if (
        s.kind !== "edge" &&
        s.kind !== "tcol" &&
        inline.some((q) => q !== s.r && q.left >= s.r.right - 1 && q.left - s.r.right <= 16 && Math.min(q.bottom, s.r.bottom) - Math.max(q.top, s.r.top) >= 0.5 * Math.min(q.height, s.r.height))
      )
        s.end = null;
    starts.splice(0, starts.length, ...starts.filter((s) => s.kind === "edge" || s.kind === "tcol" || !follows(s.r)));

    // Guides per scope (column + level). A guide: three or more starts at one value, or an edge.
    const scopes = new Map();
    for (const s of starts) {
      const k = scopes.get(s.col) || new Map();
      scopes.set(s.col, k.set(s.lvl, [...(k.get(s.lvl) || []), s]));
    }
    const group = (list) => {
      const by = new Map();
      for (const m of list) by.set(m.at, [...(by.get(m.at) || []), m]);
      return by;
    };
    const guide = (l) => l.length >= 3 || l.some((m) => m.s.kind === "edge");
    const lines = [],
      ends = [],
      rows = [],
      misses = [],
      insets = [];
    const area = (s) => s.r.width * s.r.height;
    // Related: one holds the other, in the DOM or on screen (a caption over a photo).
    const inside = (a, b) => a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
    const related = (g, m) => g.el.contains(m.el) || m.el.contains(g.el) || (g.kind === "edge" && inside(m.r, g.r)) || (m.kind === "edge" && inside(g.r, m.r));
    for (const [col, levels] of scopes)
      for (const list of levels.values()) {
        const C = col.getBoundingClientRect();
        const span = {
          top: Math.max(top, C.top),
          bottom: Math.min(bottom, C.bottom),
          left: Math.max(left, C.left),
          right: Math.min(right, C.right),
        };
        const byX = group(list.filter((s) => s.x !== null).map((s) => ({ s, at: s.x })));
        const byR = group(list.filter((s) => s.end !== null).map((s) => ({ s, at: s.end })));
        const byY = group(list.flatMap((s) => [s.top, s.bot].filter((y) => y !== null).map((y) => ({ s, at: y }))));
        // A guide runs over its members and the starts off it, within the column.
        const along = (l, at, by, h) => {
          const near = [...by].filter(([v]) => Math.abs(v - at) <= 8).flatMap(([, k]) => k.map((m) => m.s.r));
          const a = Math.min(...near.map((r) => (h ? r.left : r.top))),
            b = Math.max(...near.map((r) => (h ? r.right : r.bottom)));
          return h
            ? {
                left: Math.max(span.left, a - 8),
                right: Math.min(span.right, b + 8),
              }
            : {
                top: Math.max(span.top, a - 8),
                bottom: Math.min(span.bottom, b + 8),
              };
        };
        // A lone edge is drawn only when something is off it.
        const lone = (l, at, axis) => l.length === 1 && !misses.some((m) => m.axis === axis && m.guide === at && m.s.col === col && m.s.lvl === l[0].s.lvl);
        const drawn = () => {
          for (const [x, l] of byX) if (guide(l) && !lone(l, x, "x")) lines.push({ x, n: l.length, ...along(l, x, byX) });
          for (const [x, l] of byR) if (guide(l) && !lone(l, x, "end")) ends.push({ x: x - 1, n: l.length, ...along(l, x, byR) });
          for (const [y, l] of byY) if (guide(l) && !lone(l, y, "y")) rows.push({ y, n: l.length, ...along(l, y, byY, true) });
        };
        // Padding inside its own visible box (a callout, a tinted note) is not an offset.
        const boxed = (s) => {
          for (let n = s.el; n && n !== col && n !== s.holder; n = n.parentElement) if (n.getBoundingClientRect().left < s.x - 4 && (paintedBox(n) || side(getComputedStyle(n), "Left"))) return true;
          return false;
        };
        const check = (by, axis, members) => {
          const guides = [...by].filter(([, l]) => guide(l)).map(([at]) => at);
          for (const m of members) {
            if ((m.s.inner && !(axis === "end" && m.s.last)) || (m.s.el.tagName === "svg" && m.s.lvl === "col") || (axis === "x" && m.s.kind === "text" && boxed(m.s))) continue;
            if (axis === "x" && m.s.end !== null && (byR.get(m.s.end) || []).filter((g) => g.s.x !== m.s.x).length >= 2) continue;
            // A reference shares the mover's painted container, or both sit on the column.
            const mates = (at) => by.get(at).filter((g) => g.s.holder === m.s.holder && !related(g.s, m.s));
            const own = by.get(m.at).filter((g) => g.s.holder === m.s.holder).length;
            const ok = (at) => {
              // Its own container's edges and its own contents are padding, not a line to sit on.
              // Inside a container a content edge may be up to 12px off.
              const l = mates(at),
                d = Math.abs(at - m.at);
              if (at === m.at || d > (axis !== "y" && m.s.holder ? 12 : 8) || !l.length) return false;
              // A table's columns sit inside its edges by cell padding.
              if ((m.s.kind === "tcol" && l.some((g) => g.s.el.tagName === "TABLE")) || (m.s.el.tagName === "TABLE" && l.every((g) => g.s.kind === "tcol"))) return false;
              if (axis === "y" && (d > 3 || !l.some((g) => (g.s.kind === "edge" && m.s.kind === "edge") || Math.abs(g.s.r.height - m.s.r.height) <= 1))) return false;
              return l.length > own || (l.length === own && (m.s.kind === "tcol" || area(m.s) < Math.max(...l.map((g) => area(g.s)))));
            };
            const at = guides.filter(ok).sort((a, b) => Math.abs(a - m.at) - Math.abs(b - m.at))[0];
            if (at !== undefined)
              misses.push({
                s: m.s,
                axis,
                at: m.at,
                guide: at,
                off: m.at - at,
                refs: mates(at).map((g) => g.s),
              });
          }
        };
        check(byX, "x", [...byX.values()].flat());
        // Right edges: boxes, edges (cards, dividers, photos, tables), table columns, and right-aligned
        // text; never a ragged text end or an icon.
        check(
          byR,
          "end",
          [...byR.values()].flat().filter((m) => (m.s.kind !== "text" && m.s.kind !== "media") || m.s.x === null),
        );
        check(byY, "y", [...byY.values()].flat());
        drawn();
        // Inset: a lone text start 9 to 16px inside a guide of three or more column-mates.
        const strong = [...byX].filter(([, l]) => l.length >= 3).map(([at]) => at);
        for (const [x, l] of byX) {
          if (guide(l)) continue;
          for (const m of l) {
            if (m.s.kind !== "text" || misses.some((n) => n.s === m.s) || boxed(m.s)) continue;
            const g = strong.filter((at) => x - at >= 9 && x - at <= 16).sort((a, b) => byX.get(b).length - byX.get(a).length)[0];
            if (g !== undefined)
              insets.push({
                s: m.s,
                axis: "x",
                at: x,
                guide: g,
                off: x - g,
                refs: byX.get(g).map((n) => n.s),
              });
          }
        }
      }
    // Table cells: in each table column, the cells' content edges (the right edge of right-aligned
    // cells, else the left) sit on one line. A cell 1 to 8px off the line three or more of its
    // column's cells share (and more than half) is an `edge` miss against them, its guide drawn.
    const content = (cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const rs = [...range.getClientRects()].filter((q) => q.width > 0 && q.height > 0);
      if (!rs.length) return null;
      const [l, t, r, b] = [Math.min(...rs.map((q) => q.left)), Math.min(...rs.map((q) => q.top)), Math.max(...rs.map((q) => q.right)), Math.max(...rs.map((q) => q.bottom))];
      return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
    };
    for (const t of tables) {
      const n = Math.max(0, ...[...t.rows].map((row) => row.cells.length)),
        trs = [...t.rows].filter((row) => row.cells.length === n && [...row.cells].every((c) => c.colSpan === 1));
      for (let i = 0; i < n; i++)
        for (const axis of ["x", "end"]) {
          const got = trs.flatMap((row) => {
            const cell = row.cells[i],
              ta = getComputedStyle(cell).textAlign,
              q = !skip(cell) && shown(cell) && !/center/.test(ta) && /right|end/.test(ta) === (axis === "end") && content(cell);
            return q && inView(q) ? [{ el: cell, r: q, kind: "tcol", label: short(cell.innerText), at: Math.round(axis === "end" ? q.right : q.left) }] : [];
          });
          const votes = (v) => got.filter((g) => Math.abs(g.at - v) <= 1).length,
            mode = got.map((g) => g.at).sort((a, b) => votes(b) - votes(a))[0],
            refs = got.filter((g) => g.at === mode);
          if (mode === undefined || refs.length < 3 || votes(mode) <= got.length / 2) continue;
          const off = got.filter((g) => Math.abs(g.at - mode) >= 1 && Math.abs(g.at - mode) <= 8);
          for (const g of off) misses.push({ s: { ...g, col: column(t), holder: container(t) }, axis, at: g.at, guide: mode, off: g.at - mode, refs, cell: true });
          if (off.length)
            (axis === "end" ? ends : lines).push({
              x: mode - (axis === "end" ? 1 : 0),
              n: refs.length,
              top: Math.min(...got.map((g) => g.r.top)) - 4,
              bottom: Math.max(...got.map((g) => g.r.bottom)) + 4,
            });
        }
    }

    // Style lines across a row: in three or more sibling cells side by side (KPI tiles, cards), each
    // text style (size, weight, color) that most cells carry sits on one line, its first line's baseline.
    // A cell's text 2 to 20px off (40 when a taller text above it pushes it) is a mover; each such
    // line is drawn across the row (`across`).
    // A text's baseline: its line's bottom less the font's descent, so a guide runs under the letters.
    const ruler = document.createElement("canvas").getContext("2d");
    const descent = (el) => {
      const cs = getComputedStyle(el);
      ruler.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      return ruler.measureText("x").fontBoundingBoxDescent || 0;
    };
    const baselines = [],
      across = [];
    for (const p of [layer, ...layer.querySelectorAll("*")]) {
      if (p.closest("table") || skip(p)) continue;
      const cells = [...p.children]
        .filter((k) => !skip(k) && shown(k))
        .map((k) => ({ k, r: k.getBoundingClientRect() }))
        .filter((c) => inView(c.r) && c.r.width >= 40 && c.r.height >= 20)
        .sort((a, b) => a.r.left - b.r.left);
      if (
        cells.length < 3 ||
        cells.some(
          (c, i) =>
            i && (c.r.left < cells[i - 1].r.right - 1 || Math.min(c.r.bottom, cells[i - 1].r.bottom) - Math.max(c.r.top, cells[i - 1].r.top) < 0.5 * Math.min(c.r.height, cells[i - 1].r.height)),
        )
      )
        continue;
      const bySig = new Map();
      for (const c of cells) {
        const seen = new Set();
        const w = document.createTreeWalker(c.k, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2),
        });
        const texts = [];
        for (let n; (n = w.nextNode()); ) {
          const el = n.parentElement,
            r = firstRect(n);
          if (!r || inBox(el) || skip(el) || !shown(el)) continue;
          const cs = getComputedStyle(el),
            sig = `${cs.fontSize}/${cs.fontWeight}/${cs.color}`;
          texts.push({ el, r, label: short(n.nodeValue), sig });
          if (seen.has(sig)) continue;
          seen.add(sig);
          bySig.set(sig, [...(bySig.get(sig) || []), { c, el, r, label: short(n.nodeValue), before: texts.slice(0, -1) }]);
        }
      }
      for (const list of bySig.values()) {
        if (list.length < 3 || list.length <= cells.length / 2) continue;
        const ys = list.map((t) => t.r.bottom).sort((a, b) => a - b),
          med = ys[Math.floor(ys.length / 2)],
          line = Math.round(med - descent(list[0].el));
        if (list.filter((t) => Math.abs(t.r.bottom - med) <= 1).length < Math.max(2, list.length / 2)) continue;
        const ref = list.find((u) => Math.abs(u.r.bottom - med) <= 1);
        // A taller text of one style above the mover than above the reference (a label that wraps) pushes it.
        const pusher = (t) =>
          t.before.find((b) => {
            const twin = ref.before.find((u) => u.sig === b.sig);
            return twin && b.el.getBoundingClientRect().height - twin.el.getBoundingClientRect().height >= 2;
          });
        const off = list.filter((t) => {
          const d = Math.abs(t.r.bottom - med);
          return d >= 1.5 && d <= (pusher(t) ? 40 : 20);
        });
        if (off.length)
          across.push({
            y: line,
            left: Math.round(cells[0].r.left),
            right: Math.round(cells[cells.length - 1].r.right),
          });
        for (const t of off)
          baselines.push({
            s: {
              el: t.el,
              r: t.r,
              kind: "text",
              label: t.label,
              size: px(t.el, "fontSize"),
            },
            axis: "y",
            at: Math.round(t.r.bottom - med) + line,
            guide: line,
            off: Math.round(t.r.bottom - med),
            refs: list.filter((u) => Math.abs(u.r.bottom - med) <= 1).map((u) => ({ el: u.el, r: u.r, label: u.label })),
            ref,
            row: p,
            pusher: pusher(t),
            mates: list,
          });
      }
    }

    // Row pairs: in three or more rows of one kind, each a row of cells side by side, the
    // first text of the first cell sits a set distance from the first text of each other cell. A row
    // 4px or more off the distance most rows share is the mover.
    const rowPairs = [];
    const lead = (c) => {
      const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) });
      for (let n; (n = w.nextNode()); ) {
        const r = firstRect(n);
        if (r && !inBox(n.parentElement) && !skip(n.parentElement) && shown(n.parentElement)) return { el: n.parentElement, r, label: short(n.nodeValue) };
      }
    };
    // Rows of one kind under parents of one kind in one column (the day lists of a calendar) are one set.
    const kinds = new Map();
    for (const k of layer.querySelectorAll("*")) {
      const p = k.parentElement;
      if (k.closest("table") || !(firstClass(k) || firstClass(p)) || skip(k) || !shown(k) || !inView(k.getBoundingClientRect())) continue;
      const key = `${kindOf(p)}>${kindOf(k)}`,
        col = column(k);
      const g = [...kinds.keys()].find((x) => x.key === key && x.col === col) || { key, col };
      kinds.set(g, [...(kinds.get(g) || []), k]);
    }
    for (const list of kinds.values()) {
      if (list.length < 3) continue;
      const rows = list.flatMap((row) => {
        const cells = [...row.children]
          .filter((c) => !skip(c) && shown(c))
          .map((c, i) => ({ c, i, r: c.getBoundingClientRect() }))
          .filter((c) => c.r.width > 0)
          .sort((a, b) => a.r.left - b.r.left);
        if (cells.length < 2 || cells.some((c, i) => i && c.r.left < cells[i - 1].r.right - 1)) return [];
        const texts = cells.map((c) => ({ ...c, t: lead(c.c) })).filter((c) => c.t);
        return texts.length >= 2 ? [{ row, cells, first: texts[0], rest: texts.slice(1) }] : [];
      });
      // Cells pair by place and by the kind of their first text, so a cell that holds other content
      // in some rows (a status pill in one, a switch in another) is not compared.
      const pairKey = (w, c) => `${w.first.i}|${c.i}|${kindOf(c.c)}|${kindOf(w.first.t.el)}|${kindOf(c.t.el)}`;
      const keys = new Set(rows.flatMap((w) => w.rest.map((c) => pairKey(w, c))));
      // Two cells shorter than their row and aligned differently (one at the top, one centred) vary by design.
      const align = (c) => (getComputedStyle(c).alignSelf === "auto" ? getComputedStyle(c.parentElement).alignItems : getComputedStyle(c).alignSelf);
      const fills = (c, w) => Math.abs(c.r.height - (w.getBoundingClientRect().height - px(w, "paddingTop") - px(w, "paddingBottom") - px(w, "borderTopWidth") - px(w, "borderBottomWidth"))) <= 1;
      const apart = (w, c) => !fills(w.first, w.row) && !fills(c, w.row) && align(w.first.c) !== align(c.c);
      for (const key of keys) {
        const got = rows.flatMap((w) => {
          const c = w.rest.find((x) => pairKey(w, x) === key);
          return c && !apart(w, c) ? [{ ...w, other: c, d: Math.round(w.first.t.r.top - c.t.r.top) }] : [];
        });
        if (got.length < 3) continue;
        const votes = (d) => got.filter((g) => Math.abs(g.d - d) <= 1).length;
        const mode = [...got].sort((a, b) => votes(b.d) - votes(a.d))[0].d;
        if (votes(mode) < 2 || got.some((g) => Math.abs(g.d - mode) > 1 && votes(g.d) >= votes(mode))) continue;
        for (const g of got.filter((g) => Math.abs(g.d - mode) >= 4))
          rowPairs.push({
            s: { el: g.first.t.el, r: g.first.t.r, kind: "text", label: g.first.t.label },
            axis: "y",
            at: g.d,
            guide: mode,
            off: g.d - mode,
            row: g.row,
            cells: g.cells,
            ref: got.find((u) => Math.abs(u.d - mode) <= 1),
            other: g.other,
            n: votes(mode),
            of: got.length,
          });
      }
    }

    // Headers: headings of one level in one column and container start on one x. Of those 4px or
    // more apart, the mover is the minority; of a tie, the one at the x where fewer of its column's
    // texts start (a list's heading starts with its rows' text, after their checkbox or icon), then
    // the one whose own padding sets its start (text after a checkbox has no CSS-only move), then
    // the one at the x fewer starts share.
    const heads = [];
    const hgroups = new Map();
    for (const h of layer.querySelectorAll("h1, h2, h3, h4, h5, h6, [role=heading]")) {
      const n = firstText(h),
        r = n && firstRect(n);
      if (!r || !inView(r) || skip(h) || !shown(h) || /center|right|end/.test(getComputedStyle(h).textAlign)) continue;
      const k = `${h.tagName}|${h.getAttribute("aria-level") || ""}`;
      const key = [k, column(h), container(h)];
      const g = [...hgroups.keys()].find((x) => x[0] === k && x[1] === key[1] && x[2] === key[2]) || key;
      // An icon before the text is where the heading starts.
      const x = Math.min(
        r.left,
        ...[...h.querySelectorAll("svg, img, i")]
          .map((i) => i.getBoundingClientRect())
          .filter((q) => q.width > 0 && q.left < r.left)
          .map((q) => q.left),
      );
      const own = Math.abs(x - (h.getBoundingClientRect().left + px(h, "paddingLeft") + px(h, "borderLeftWidth"))) <= 1;
      hgroups.set(g, [...(hgroups.get(g) || []), { el: h, r, x: Math.round(x), own, label: short(n.nodeValue) }]);
    }
    for (const list of hgroups.values()) {
      if (list.length < 2) continue;
      const votes = (x) => list.filter((h) => Math.abs(h.x - x) <= 1).length,
        shared = (x) => starts.filter((s) => s.x !== null && Math.abs(s.x - x) <= 1).length,
        texts = (x) => runs.filter((t) => column(t.el) === column(list[0].el) && container(t.el) === container(list[0].el) && Math.abs(t.r.left - x) <= 1).length;
      const most = Math.max(...list.map((h) => votes(h.x)));
      const ranked = [...list].sort((a, b) => votes(a.x) - votes(b.x) || texts(a.x) - texts(b.x) || b.own - a.own || shared(a.x) - shared(b.x));
      const m = ranked[0],
        ref = ranked.find((h) => votes(h.x) === most && Math.abs(h.x - m.x) >= 4);
      if (!ref || (votes(m.x) === most && !m.own)) continue;
      heads.push({
        s: { el: m.el, r: m.r, kind: "text", label: m.label, size: px(m.el, "fontSize") },
        axis: "x",
        at: m.x,
        guide: ref.x,
        off: m.x - ref.x,
        refs: [ref],
        own: m.own,
        n: list.length - votes(m.x),
      });
    }

    // Pairs: a list of label/value pairs side by side (dt and dd, or any two kinds alternating, three
    // pairs or more). The value's first text sits a set distance from its label's, most often on its
    // line; a pair 2px or more off the distance most pairs share is the mover.
    const pairs = [];
    for (const p of layer.querySelectorAll("*")) {
      const kids = [...p.children].filter((k) => k.getClientRects().length);
      if (kids.length < 6 || kids.length % 2 || skip(p) || p.closest("table")) continue;
      const [ka, kb] = [kindOf(kids[0]), kindOf(kids[1])];
      if (ka === kb || kids.some((k, i) => kindOf(k) !== (i % 2 ? kb : ka))) continue;
      const got = [];
      for (let i = 0; i < kids.length; i += 2) {
        const [a, b] = [kids[i], kids[i + 1]],
          [ra, rb] = [a.getBoundingClientRect(), b.getBoundingClientRect()];
        if (rb.left < ra.right - 1 || Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) <= 0) {
          got.length = 0;
          break;
        }
        const [la, lb] = [lead(a), lead(b)];
        if (la && lb && inView(la.r) && inView(lb.r)) got.push({ a, b, la, lb, d: lb.r.top - la.r.top });
      }
      if (got.length < 3) continue;
      const votes = (d) => got.filter((g) => Math.abs(g.d - d) <= 1).length,
        mode = [...got].sort((x, y) => votes(y.d) - votes(x.d))[0].d;
      if (votes(mode) < Math.max(2, got.length / 2)) continue;
      for (const g of got.filter((g) => Math.abs(g.d - mode) >= 2))
        pairs.push({
          s: { el: g.lb.el, r: g.lb.r, kind: "text", label: g.lb.label },
          axis: "y",
          at: Math.round(g.lb.r.top),
          guide: Math.round(g.la.r.top + mode),
          off: Math.round(g.d - mode),
          list: p,
          pair: g,
          refs: [g.la],
          n: votes(mode),
        });
    }

    // Across columns: the top-level cards of neighbouring columns (side by side, one parent) and their
    // headings line up where they come close. A card top, card bottom, or heading baseline 1 to 12px
    // off its nearest like in the column beside is an `edge` miss (axis y) on the higher one, which
    // moves down; farther apart is a layout decision.
    const xcols = [];
    const lineup = (col) => {
      const out = [];
      for (const el of [col, ...col.querySelectorAll("*")]) {
        if (skip(el) || !shown(el) || (el !== col && column(el) !== col)) continue;
        const r = el.getBoundingClientRect();
        if (paintedBox(el) && r.height > 36 && r.width >= 120 && (el === col || !container(el))) {
          if (r.top >= top && r.top <= bottom) out.push({ el, r, type: "top", y: r.top });
          if (r.bottom >= top && r.bottom <= bottom) out.push({ el, r, type: "bottom", y: r.bottom });
        } else if (el.matches("h1, h2, h3, h4, h5, h6, [role=heading]")) {
          const n = firstText(el),
            q = n && firstRect(n);
          if (q && inView(q)) out.push({ el, r: q, type: `head ${px(el, "fontSize")}`, y: q.bottom, label: short(n.nodeValue) });
        }
      }
      return out;
    };
    const colList = [...columns].filter((c) => inView(c.getBoundingClientRect()));
    for (const A of colList)
      for (const B of colList) {
        const [a, b] = [A.getBoundingClientRect(), B.getBoundingClientRect()];
        if (A === B || A.parentElement !== B.parentElement || b.left < a.right - 1) continue;
        if (colList.some((C) => C.parentElement === A.parentElement && C.getBoundingClientRect().left >= a.right - 1 && C.getBoundingClientRect().right <= b.left + 1)) continue;
        const [la, lb] = [lineup(A), lineup(B)],
          used = new Set();
        for (const i of la) {
          const o = lb.filter((j) => j.type === i.type && !used.has(j)).sort((x, y) => Math.abs(x.y - i.y) - Math.abs(y.y - i.y))[0],
            d = o && Math.round(i.y - o.y);
          if (!o || !d || Math.abs(d) > 12) continue;
          used.add(o);
          const [m, ref] = d < 0 ? [i, o] : [o, i];
          xcols.push({
            s: { el: m.el, r: m.r, kind: m.type.startsWith("head") ? "text" : "edge", label: m.label },
            type: m.type,
            axis: "y",
            at: Math.round(m.y),
            guide: Math.round(ref.y),
            off: Math.round(m.y - ref.y),
            refs: [{ el: ref.el, r: ref.r, label: ref.label }],
          });
          across.push({ y: Math.round(ref.y), left: Math.round(Math.min(i.r.left, o.r.left)), right: Math.round(Math.max(i.r.right, o.r.right)) });
        }
      }

    // Card insets: the painted containers of one column (cards, banners, tiles; not nested) hold
    // their content at one inset, the x most of a container's own starts share (ties: the leftmost)
    // minus its left edge. With three or more in view, a container 3 to 16px off the inset most of
    // the others share (within 2px) is the mover, once, measured against the nearest of them.
    const held = new Map();
    for (const s of starts) if (s.holder && s.x !== null && /text|box|media/.test(s.kind)) held.set(s.holder, [...(held.get(s.holder) || []), s]);
    // The right inset: from the container's right edge to the content edge its first start's blocks
    // stretch to (each block down from the container, while it fills its parent's content box).
    const contentRight = (n) => n.getBoundingClientRect().right - px(n, "paddingRight") - px(n, "borderRightWidth");
    const rightEdge = (c, el) => {
      const path = [];
      for (let n = el; n && n !== c; n = n.parentElement) path.unshift(n);
      let edge = c;
      for (const n of path) {
        if (Math.abs(n.getBoundingClientRect().right - contentRight(edge)) > 1) break;
        edge = n;
      }
      return edge;
    };
    const insetOf = [...held].map(([c, l]) => {
      const [at, ms] = [...group(l.map((s) => ({ s, at: s.x })))].sort(([a, p], [b, q]) => q.length - p.length || a - b)[0],
        r = c.getBoundingClientRect(),
        edge = rightEdge(c, ms[0].s.el);
      return { c, at, x: at - Math.round(r.left), end: Math.round(r.right - contentRight(edge)), edge, first: ms[0].s };
    });
    const cards = [];
    for (const a of insetOf) {
      const peers = insetOf.filter((b) => column(b.c) === column(a.c) && (b === a || !(b.c.contains(a.c) || a.c.contains(b.c))));
      if (peers.length < 3) continue;
      const r = a.c.getBoundingClientRect();
      for (const side of ["x", "end"]) {
        const votes = (x) => peers.filter((b) => Math.abs(b[side] - x[side]) <= 2).length;
        const most = Math.max(...peers.map(votes));
        if (votes(a) >= most) continue;
        const ref = peers
          .filter((b) => votes(b) === most && Math.abs(b[side] - a[side]) >= 3 && Math.abs(b[side] - a[side]) <= 16)
          .sort((x, y) => Math.abs(x[side] - a[side]) - Math.abs(y[side] - a[side]))[0];
        if (!ref) continue;
        const off = a[side] - ref[side],
          words = side === "x" ? "left" : "right";
        cards.push({
          s: { el: a.c, r, kind: "edge" },
          // The right side is fixed through its content edge, the mover's right edge moving by -off.
          ...(side === "x"
            ? { first: a.first, ref: ref.first, at: a.at, guide: Math.round(r.left) + ref.x, off }
            : {
                first: { el: a.edge, r: a.edge.getBoundingClientRect(), kind: "text" },
                ref: { el: ref.edge, r: ref.edge.getBoundingClientRect() },
                at: Math.round(contentRight(a.edge)),
                guide: Math.round(r.right) - ref.end,
                off: -off,
              }),
          axis: side,
          refs: [ref.first],
          against: `${sel(ref.c)}, content ${ref[side]}px from its ${words} edge, and ${most - 1} more within 2px of it`,
        });
      }
    }
    // Top and bottom insets: a container's first text sits a distance below its top edge, its last
    // content (text, media, control, painted box) a distance above its bottom edge. Containers of one kind, not
    // nested, compare across the layer (cards in neighbouring columns line up too); first texts only
    // with first texts of one size and weight. A container a sibling beside it stretches has no bottom
    // inset of its own. With three or more, one 3 to 16px off what most share (within 2px) is the mover.
    const vcards = [];
    const vInsets = [...held.keys()].flatMap((c) => {
      const r = c.getBoundingClientRect();
      if (r.top < top || r.top > bottom) return [];
      const first = runs.filter((t) => container(t.el) === c).sort((a, b) => a.r.top - b.r.top)[0];
      const p = c.parentElement,
        stretched =
          p &&
          [...p.children].some((b) => {
            const q = b.getBoundingClientRect();
            return b !== c && (q.right <= r.left + 1 || q.left >= r.right - 1) && Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top) > 0 && Math.abs(q.bottom - r.bottom) <= 1;
          });
      let low = -Infinity,
        lowEl = null;
      if (!stretched && r.bottom <= bottom) {
        const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) });
        for (let n; (n = w.nextNode()); ) {
          const range = document.createRange();
          range.selectNodeContents(n);
          const q = [...range.getClientRects()].filter((x) => x.height > 0).pop();
          if (q && shown(n.parentElement) && q.bottom > low) [low, lowEl] = [q.bottom, n.parentElement];
        }
        // A painted box inside (a note, a tile) or a table ends where its box ends, not its text; a card
        // that ends in a table has no bottom inset.
        for (const e of c.querySelectorAll("*")) {
          const q = e.getBoundingClientRect();
          if (q.height && q.bottom > low && (e.matches(`img, video, svg, canvas, button, table, ${CONTROL}`) || paintedBox(e)) && shown(e)) [low, lowEl] = [q.bottom, e];
        }
      }
      return [
        {
          c,
          r,
          kind: kindOf(c),
          first,
          sig: first && `${px(first.el, "fontSize")}/${getComputedStyle(first.el).fontWeight}`,
          y: first && Math.round(first.r.top - r.top),
          lowEl,
          bot: lowEl && !lowEl.matches("table") && low <= r.bottom ? Math.round(r.bottom - low) : null,
        },
      ];
    });
    for (const a of vInsets)
      for (const side of ["y", "bot"]) {
        if (a[side] === null || a[side] === undefined) continue;
        const peers = vInsets.filter(
          (b) => b.kind === a.kind && b[side] !== null && b[side] !== undefined && (side === "bot" || b.sig === a.sig) && (b === a || !(b.c.contains(a.c) || a.c.contains(b.c))),
        );
        if (peers.length < 3) continue;
        const votes = (x) => peers.filter((b) => Math.abs(b[side] - x[side]) <= 2).length;
        const most = Math.max(...peers.map(votes));
        if (votes(a) >= most) continue;
        const ref = peers
          .filter((b) => votes(b) === most && Math.abs(b[side] - a[side]) >= 3 && Math.abs(b[side] - a[side]) <= 16)
          .sort((x, y) => Math.abs(x[side] - a[side]) - Math.abs(y[side] - a[side]))[0];
        if (!ref) continue;
        const words = side === "y" ? "first text sits" : "last content ends",
          edge = side === "y" ? "top" : "bottom";
        vcards.push({
          s: { el: a.c, r: a.r, kind: "edge" },
          first: side === "y" ? { el: a.first.el, r: a.first.r, kind: "text", label: short(a.first.n.nodeValue) } : { el: a.lowEl, r: a.lowEl.getBoundingClientRect(), kind: "text" },
          ref: side === "y" ? { el: ref.first.el, r: ref.first.r, label: short(ref.first.n.nodeValue) } : { el: ref.lowEl, r: ref.lowEl.getBoundingClientRect() },
          axis: side,
          at: side === "y" ? Math.round(a.first.r.top) : Math.round(a.r.bottom - a.bot),
          guide: side === "y" ? Math.round(a.r.top) + ref.y : Math.round(a.r.bottom) - ref.bot,
          off: a[side] - ref[side],
          refs: [],
          against: `${sel(ref.c)}, whose ${words} ${ref[side]}px from its ${edge} edge, and ${most - 1} more within 2px of it`,
        });
      }

    // Fix: the property that differs. Walk the mover's and a reference's paths down from their common
    // ancestor and find the padding, margin, or border whose difference equals the offset; else
    // move the mover by its own margin, or by left or top when it is absolutely positioned.
    const S = { x: "Left", end: "Right", y: "Top", bot: "Bottom" };
    const chain = (el, stop) => {
      const a = [];
      for (let n = el; n && n !== stop; n = n.parentElement) a.unshift(n);
      return a;
    };
    const nearest = (m) => [...m.refs].sort((a, b) => Math.abs(a.r.top - m.s.r.top) - Math.abs(b.r.top - m.s.r.top));
    const propFix = (m) => {
      const sd = S[m.axis],
        sign = m.axis === "end" ? -1 : 1;
      for (const g of nearest(m).slice(0, 6)) {
        let c = m.s.el;
        while (c && !c.contains(g.el)) c = c.parentElement;
        if (!c) continue;
        // Pairs in order: same depth below the common ancestor, then two painted containers, then any.
        const pa = chain(m.s.el, c),
          pb = chain(g.el, c);
        const pairs = [
          ...pa.map((a, i) => [a, pb[i]]).filter(([, b]) => b),
          ...pa.flatMap((a) => pb.map((b) => [a, b])).sort(([a, b], [x, y]) => (paintedBox(x) && paintedBox(y)) - (paintedBox(a) && paintedBox(b))),
        ];
        for (const [a, b] of pairs)
          for (const p of [`padding${sd}`, `margin${sd}`]) {
            if ((p.startsWith("padding") && a === m.s.el && !/text|tcol/.test(m.s.kind)) || (p.startsWith("margin") && b.contains(m.s.el))) continue;
            const d = (px(a, p) - px(b, p)) * sign;
            if (d && Math.abs(d - m.off) <= 0.6) {
              const v = px(b, p),
                base = p.startsWith("padding") ? "padding" : "margin",
                prop = p.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
              const peers = b.parentElement ? [...b.parentElement.children].filter((k) => k !== a && kindOf(k) === kindOf(a) && px(k, p) === v).length : 0;
              const why =
                kindOf(b) === kindOf(a) && peers > 1
                  ? `its ${peers} siblings use ${v}px`
                  : sel(named(b)) === sel(named(a))
                    ? `the same element in the other rows has ${v}px`
                    : `${sel(named(b))} has ${v}px`;
              const even = (n) => px(n, `${base}Left`) === px(n, `${base}Right`);
              // A table's outer cells hold its side insets: the first cell's left, the last cell's right.
              // Both off the same way is one edit on both; one off alone is that side's edit. Either is
              // named by the pair, so a half edit leaves a check under the same name.
              const row = a.matches("th, td") && a.parentElement,
                outer = row && ((p === "paddingLeft" && a === row.firstElementChild) || (p === "paddingRight" && a === row.lastElementChild));
              if (outer) {
                const table = a.closest("table"),
                  t = sel(table),
                  both = px(row.firstElementChild, "paddingLeft") === px(row.lastElementChild, "paddingRight");
                const sides = [
                  { at: 0, q: `${t} :is(th, td):first-child`, property: "padding-left" },
                  { at: -1, q: `${t} :is(th, td):last-child`, property: "padding-right" },
                ]
                  .filter((s) => both || s.property === prop)
                  .map((s) => ({ ...s, ...onto(cells(table, s.at), [{ property: s.property, value: `${v}px` }], [s.q]) }));
                return {
                  el: a,
                  p,
                  where: `${t} :is(th, td):is(:first-child, :last-child)`,
                  text: `Set ${sides.map((s) => `${s.property} to ${v}px on ${s.on}`).join(" and ")}; ${why}.${sides.map((s) => s.note).join("")}`,
                  apply: sides.every((s) => s.apply.length) ? sides.flatMap((s) => s.apply) : [],
                  markup: sides.some((s) => s.note),
                };
              }
              // Both sides alike on the mover and the reference: the whole edit is the inline pair.
              const d = { property: m.axis !== "y" && even(a) && even(b) ? `${base}-inline` : prop, value: `${v}px` },
                o = onto(holders(a, p), [d], [target(a)]);
              return { el: a, p, text: `Set ${d.property} to ${v}px on ${o.on}; ${why}.${o.note}`, apply: o.apply, markup: !!o.note };
            }
          }
      }
      const el = m.s.el,
        abs = /absolute|fixed/.test(getComputedStyle(el).position) && m.axis !== "end",
        p = abs ? (m.axis === "y" ? "top" : "left") : `margin${sd}`,
        prop = abs ? p : `margin-${sd.toLowerCase()}`,
        v = Math.round(px(el, p) - m.off * sign),
        o = onto(holders(el, p), [{ property: prop, value: `${v}px` }], [target(el)]);
      return { el, text: `Set ${prop} to ${v}px on ${o.on} to sit on ${m.axis === "y" ? "y" : "x"} ${m.guide}.${o.note}`, apply: o.apply, markup: !!o.note };
    };
    const against = (m) => {
      const g = nearest(m)[0],
        more = m.refs.length - 1;
      return `${sel(named(g.el))} "${g.label || textOf(g.el, g.r)}"${more ? ` and ${more} more` : ""} at ${m.axis === "y" ? "y" : "x"} ${m.guide}${m.axis === "end" ? " (right edge)" : ""}`;
    };
    const big = (s) => s.kind === "edge" || s.kind === "media" || (s.size || 0) >= 16 || s.r.height >= 32;
    // Harmful: a negative padding or margin anywhere, zero padding on a control, any font-size change. Not applied.
    const harm = (a) =>
      /font-size/.test(a.property) ||
      (/^(padding|margin)/.test(a.property) && a.value.startsWith("-")) ||
      (/^padding/.test(a.property) && parseFloat(a.value) === 0 && [...document.querySelectorAll(a.selector)].some((n) => n.matches("button, a, input, select, [role=tab], [role=button]")));
    const found = new Map(),
      dropped = new Set();
    // A check whose only fix is a hack value is dropped, its mark too. `text` is the mover's when the
    // element the fix edits (`where`) holds it, else that element's own.
    const add = (kind, m, fix, score, ag = against(m)) => {
      if (fix.apply.some(harm)) return dropped.add(m);
      // A left and a right miss that the same edit fixes (padding-inline) are one check.
      const key = `${kind}|${m.axis === "y" || m.axis === "bot" ? "y" : "x"}|${fix.apply.length ? JSON.stringify(fix.apply) : fix.text}`;
      const f = found.get(key);
      if (f) return f.list.push(m);
      found.set(key, {
        kind,
        where: fix.where || sel(fix.el),
        text: fix.label || (fix.where || !fix.el || fix.el.contains(m.s.el) ? m.s.label || textOf(m.s.el, m.s.r) : textOf(fix.el, fix.el.getBoundingClientRect())),
        against: ag,
        off: m.off,
        fix: fix.text,
        apply: fix.apply,
        // A certain deviation whose fix is markup (fix.markup, or no selector reaches only its holders) prints with `apply: []`.
        score: fix.apply.length || fix.markup ? score : Math.min(score, 0.45),
        list: [m],
      });
    };
    // A container's content edge: inside its border and padding.
    const padEdge = (n, axis) => {
      const q = n.getBoundingClientRect();
      return axis === "x" ? q.left + px(n, "borderLeftWidth") + px(n, "paddingLeft") : q.right - px(n, "borderRightWidth") - px(n, "paddingRight");
    };
    for (const m of misses) {
      // A table column's line, and a start's own card's content edge its card-mates sit on, are strong references.
      const strongRef = m.refs.length >= 4 || m.refs.some((s) => s.kind === "edge") || m.cell,
        onPad = m.axis !== "y" && m.s.kind !== "tcol" && m.s.holder && Math.abs(padEdge(m.s.holder, m.axis) - m.guide) <= 1;
      add(
        "edge",
        m,
        propFix(m),
        (Math.abs(m.off) <= 3 && !onPad ? 0.4 : 0.5) +
          (strongRef ? 0.1 : 0) +
          (big(m.s) ? 0.1 : 0) -
          (m.axis === "y" ? 0.15 : 0) -
          (!/text|tcol/.test(m.s.kind) && Math.max(m.s.r.width, m.s.r.height) <= 16 ? 0.15 : 0),
      );
    }
    for (const m of insets) add("inset", m, propFix(m), 0.25);
    // A text that wraps where its twins in the row's other cells do not pushes what follows it off its
    // lines: one check on the wrapped text, naming every text it pushes. A text off on its own: its margin.
    const pushes = new Map(),
      leads = [];
    for (const m of [...baselines].sort((a, b) => a.s.r.top - b.s.r.top || a.s.r.left - b.s.r.left)) pushes.set(m.pusher?.el || m, [...(pushes.get(m.pusher?.el || m) || []), m]);
    for (const ms of pushes.values()) {
      const m = ms[0],
        tall = m.pusher;
      if (!tall) {
        const mt = Math.round(px(m.s.el, "marginTop") - m.off),
          o = onto(holders(m.s.el, "marginTop"), [{ property: "margin-top", value: `${mt}px` }], [target(m.s.el)]);
        add(
          "baseline",
          m,
          { el: m.s.el, text: `Set margin-top to ${mt}px on ${o.on} to sit on its row's line at y ${m.guide}.${o.note}`, apply: o.apply, markup: !!o.note },
          Math.min(0.95, 0.4 + Math.abs(m.off) / 30 + ((m.s.size || 0) >= 18 ? 0.15 : 0)),
          `${sel(named(m.ref.el))} "${m.ref.label}" and ${m.mates.length - 2} more cells of ${sel(named(m.row))} at y ${m.guide}`,
        );
        continue;
      }
      // The labels of the row share the tall one's height, so the text stays whole; in line heights when
      // it is a whole number of lines (2lh survives copy and font changes).
      const twin = m.ref.before.find((u) => u.sig === tall.sig),
        labels = `${sel(m.row)} ${tall.el.tagName.toLowerCase()}${firstClass(tall.el)}`,
        tr = tall.el.getBoundingClientRect(),
        th = Math.round(tr.height * 10) / 10,
        lh = px(tall.el, "lineHeight"),
        n = Math.round(th / lh),
        bare = !["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"].some((p) => px(tall.el, p)),
        h = lh && n >= 1 && bare && Math.abs(th - n * lh) <= 1 ? `${n}lh` : `${th}px`,
        lines = lh ? `${n} lines` : `${th}px`,
        names = ms.map((x) => `"${x.s.label}"`).join(" and "),
        o = onto(
          [...document.querySelectorAll(labels)].filter((x) => m.row.contains(x)),
          [{ property: "min-height", value: h }],
          [labels],
        );
      const lead = {
        ...m,
        s: { el: tall.el, r: tr, kind: "text", label: tall.label, size: px(tall.el, "fontSize") },
        pushed: ms,
      };
      leads.push(lead);
      add(
        "baseline",
        lead,
        {
          el: tall.el,
          text: `Set min-height to ${h} on ${o.on} (or lay the row out as a grid with a shared label row); "${tall.label}" wraps to ${lines} and pushes ${names} ${m.off}px down.${o.note}`,
          apply: o.apply,
          markup: !!o.note,
        },
        Math.min(0.95, 0.4 + Math.abs(m.off) / 30 + (ms.some((x) => (x.s.size || 0) >= 18) ? 0.15 : 0)),
        `${sel(named(twin.el))} "${twin.label}" and the row's other ${tall.el.tagName.toLowerCase()}${firstClass(tall.el)} texts in ${sel(named(m.row))} take ${Math.max(1, Math.round(twin.el.getBoundingClientRect().height / (lh || 1)))} line; ${names} leave their row's lines at y ${[...new Set(ms.map((x) => x.guide))].join(" and ")}`,
      );
    }
    for (const m of cards) {
      // The container's other parts that hold the same value on the same edge (a heading, rows, a footer) change with it.
      const fix = propFix({ ...m, s: m.first, refs: [m.ref] });
      const v = fix.p && px(fix.el, fix.p),
        edgeOf = (n) => n.getBoundingClientRect()[m.axis === "x" ? "left" : "right"],
        x = edgeOf(fix.el);
      const els = v ? [m.s.el, ...m.s.el.querySelectorAll("*")].filter((n) => px(n, fix.p) === v && Math.abs(edgeOf(n) - x) <= 1) : [];
      if (els.length > 1 && fix.apply.length === 1) {
        const { selector, ...d } = fix.apply[0],
          o = onto(els, [d], [[...new Set(els.map(target))].join(", ")]);
        Object.assign(fix, { text: fix.text.replace(`on ${selector};`, `on ${o.on};`) + o.note, apply: o.apply, markup: !!o.note });
      }
      add("inset", m, fix, Math.abs(m.off) >= 4 ? 0.6 : 0.5, m.against);
    }
    // A first text centred in a row (a card header) that something taller beside it (a button)
    // stretches sits lower: the row's padding-block, less the drop, gives back the other headers' height.
    const centred = (c, el, off) => {
      for (let k = el; k && k.parentElement && k !== c; k = k.parentElement) {
        const P = k.parentElement,
          cs = getComputedStyle(P),
          al = getComputedStyle(k).alignSelf === "auto" ? cs.alignItems : getComputedStyle(k).alignSelf;
        if (!((/flex/.test(cs.display) && !/column/.test(cs.flexDirection)) || /grid/.test(cs.display)) || !/center/.test(al)) continue;
        const drop = k.getBoundingClientRect().top - P.getBoundingClientRect().top - px(P, "paddingTop") - px(P, "borderTopWidth"),
          [pt, pb] = [px(P, "paddingTop"), px(P, "paddingBottom")];
        if (Math.abs(drop - off) > 1 || pt < drop || pb < drop) return null;
        const tall = [...P.children].filter((x) => x !== k).sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
        return {
          P,
          tall,
          decls:
            pt === pb
              ? [{ property: "padding-block", value: `${Math.round(pt - drop)}px` }]
              : [
                  { property: "padding-top", value: `${Math.round(pt - drop)}px` },
                  { property: "padding-bottom", value: `${Math.round(pb - drop)}px` },
                ],
        };
      }
      return null;
    };
    for (const m of vcards) {
      let fix = propFix({ ...m, s: m.first, refs: [m.ref] });
      const ctr = !fix.p && m.axis === "y" && centred(m.s.el, m.first.el, m.off);
      if (ctr) {
        const o = onto([ctr.P], ctr.decls, [target(ctr.P)]);
        fix = {
          el: ctr.P,
          text: `Set ${ctr.decls.map((d) => `${d.property} to ${d.value}`).join(" and ")} on ${o.on}; its "${textOf(ctr.tall, ctr.tall.getBoundingClientRect())}" makes it taller than the other cards' and centres "${m.first.label}" ${m.off}px lower.${o.note}`,
          apply: o.apply,
          markup: !!o.note,
        };
      } else if (!fix.p)
        fix = {
          el: m.s.el,
          text: `Give ${sel(m.s.el)} the ${m.axis === "y" ? "top" : "bottom"} inset of its sibling cards; its ${m.axis === "y" ? "first text" : "last content"} sits ${Math.abs(m.off)}px ${m.off > 0 ? "farther from" : "closer to"} the edge.`,
          apply: [],
        };
      add("inset", m, fix, Math.abs(m.off) >= 4 ? 0.6 : 0.5, m.against);
    }
    rowPairs.sort((a, b) => a.other.i - b.other.i || b.n - a.n);
    for (const m of rowPairs) {
      // A row that centers cells of unequal height moves each cell's text by half the difference.
      const cs = getComputedStyle(m.row),
        hs = m.cells.map((c) => c.r.height),
        centered = /flex|grid/.test(cs.display) && cs.alignItems === "center" && Math.max(...hs) - Math.min(...hs) > 2,
        row = sel(m.row);
      // The moving cell: of the pair, the one whose text sits a different distance from its row's top
      // than in the reference rows. It alone goes to the top, so the other cells stay centred.
      const drop = (t, w) => t.r.top - w.getBoundingClientRect().top,
        moved = [
          [m.cells.find((c) => c.c.contains(m.s.el))?.c, drop(m.s, m.row), drop(m.ref.first.t, m.ref.row), m.other.t.el],
          [m.other.c, drop(m.other.t, m.row), drop(m.ref.other.t, m.ref.row), m.s.el],
        ].filter(([c, a, b]) => c && Math.abs(a - b) >= 2);
      // Every row of the set takes the edit, so the rows stay alike.
      const o = moved.length === 1 ? onto(holders(moved[0][0], "alignSelf"), [{ property: "align-self", value: "flex-start" }], [target(moved[0][0])]) : null,
        all = !o && onto(holders(m.row, "alignItems"), [{ property: "align-items", value: "flex-start" }], [row]);
      const fix = !centered
        ? {
            el: m.row,
            text: `Give the cells of ${row} one vertical alignment; ${sel(named(m.s.el))} sits ${Math.abs(m.at)}px off ${sel(named(m.other.t.el))} here and ${Math.abs(m.guide)}px in the other rows.`,
            apply: [],
          }
        : o
          ? {
              el: moved[0][0],
              text: `Set align-self to flex-start on ${o.on}; ${row} centers cells of unequal height, so its text sits a different distance from ${sel(named(moved[0][3]))} from row to row.${o.note}`,
              apply: o.apply,
              markup: !!o.note,
            }
          : {
              el: m.row,
              text: `Set align-items to flex-start on ${all.on}; it centers cells of unequal height, so the first text of each cell sits a different distance from the others from row to row.${all.note}`,
              apply: all.apply,
              markup: !!all.note,
            };
      add(
        "baseline",
        m,
        fix,
        Math.min(0.8, 0.5 + Math.abs(m.off) / 40),
        `${sel(named(m.ref.first.t.el))} "${m.ref.first.t.label}" sits ${Math.abs(m.guide)}px ${m.guide >= 0 ? "below" : "above"} ${sel(named(m.ref.other.t.el))} "${m.ref.other.t.label}" in ${m.n} of ${m.of} ${row} rows; here ${Math.abs(m.at)}px`,
      );
    }
    for (const m of heads) {
      const v = Math.round(px(m.s.el, "paddingLeft") - m.off),
        ref = m.refs[0],
        o = onto(holders(m.s.el, "paddingLeft"), [{ property: "padding-left", value: `${v}px` }], [target(m.s.el)]);
      const fix = m.own
        ? { el: m.s.el, text: `Set padding-left to ${v}px on ${o.on} to start with ${sel(named(ref.el))} "${ref.label}" at x ${m.guide}.${o.note}`, apply: o.apply, markup: !!o.note }
        : {
            el: m.s.el,
            text: `Start ${sel(m.s.el)} at x ${m.guide} with ${sel(named(ref.el))} "${ref.label}"; what sits before it sets its start, so this needs a markup change.`,
            apply: [],
            markup: true,
          };
      add("edge", m, fix, Math.min(0.8, 0.5 + Math.abs(m.off) / 100), `${sel(named(ref.el))} "${ref.label}", a heading of the same level in this container, at x ${m.guide}`);
    }
    for (const m of pairs) {
      // A grid or flex list aligns each pair by its first baseline; else the label moves to its value.
      const { a, b, la } = m.pair,
        laid = /grid|flex/.test(getComputedStyle(m.list).display),
        mover = m.off > 0 ? a : b,
        pt = Math.round(px(mover, "paddingTop") + Math.abs(m.off)),
        o = laid ? onto(holders(m.list, "alignItems"), [{ property: "align-items", value: "baseline" }], [target(m.list)]) : onto([mover], [{ property: "padding-top", value: `${pt}px` }]);
      const tall = Math.round(b.getBoundingClientRect().height) > Math.round(a.getBoundingClientRect().height) + 1 ? ` (its value is ${Math.round(b.getBoundingClientRect().height)}px tall)` : "";
      add(
        "baseline",
        m,
        {
          el: laid ? m.list : mover,
          label: laid && `${la.label}: ${m.s.label}`.slice(0, 40),
          text: `Set ${laid ? "align-items to baseline" : `padding-top to ${pt}px`} on ${o.on}; "${m.s.label}" sits ${Math.abs(m.off)}px ${m.off > 0 ? "below" : "above"} its label "${la.label}"${tall}, where ${m.n} other pairs share a line.${o.note}`,
          apply: o.apply,
          markup: !!o.note,
        },
        Math.min(0.7, 0.5 + Math.abs(m.off) / 20),
        `its label ${sel(named(la.el))} "${la.label}" at y ${m.guide}; ${m.n} pairs of ${sel(m.list)} share their line`,
      );
    }
    for (const m of xcols) {
      // A card bottom moves by the card's min-height; a top or heading by the property that differs, else its margin.
      const ref = m.refs[0],
        fix =
          m.type === "bottom"
            ? (() => {
                const h = Math.round(m.s.r.height - m.off),
                  o = onto([m.s.el], [{ property: "min-height", value: `${h}px` }], [target(m.s.el)]);
                return { el: m.s.el, text: `Set min-height to ${h}px on ${o.on} to end with ${sel(named(ref.el))} in the next column at y ${m.guide}.${o.note}`, apply: o.apply, markup: !!o.note };
              })()
            : propFix(m);
      const what = m.type === "top" ? "top edge" : m.type === "bottom" ? "bottom edge" : "baseline";
      add(
        "edge",
        m,
        fix,
        (Math.abs(m.off) <= 2 ? 0.4 : 0.55) + (m.s.kind === "edge" ? 0.05 : 0),
        `${sel(named(ref.el))} "${ref.label || textOf(ref.el, ref.r)}", the ${what} beside it in the next column, at y ${m.guide}`,
      );
    }
    const checks = [...found.values()]
      .map((f) => {
        // A miss on both sides of one thing is one instance.
        const count = Math.max(...["x", "end", "y", "bot"].map((a) => f.list.filter((m) => m.axis === a).length));
        return { ...f, count, score: Math.round(Math.min(0.95, f.score + 0.05 * Math.min(count - 1, 4)) * 100) / 100 };
      })
      .sort((a, b) => b.score - a.score || Math.abs(b.off) - Math.abs(a.off))
      .slice(0, 20);
    const number = new Map();
    checks.slice(0, 12).forEach((f, i) => f.list.forEach((m) => number.set(m, i + 1)));

    host = document.createElement("div");
    host.__redline = true;
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const root = host.attachShadow({ mode: "open" });
    const box = (r, cls, inner = "", pad = 2) => `<i class="${cls}" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + 2 * pad}px;height:${r.height + 2 * pad}px">${inner}</i>`;
    // A miss marks a text or a box whole, and a container by the edge that is off; a numbered one leads with its check number.
    // A text a wrapped one pushes is boxed bare: the wrapped one carries the number.
    const mark = (m, kind, bare) => {
      const r = m.s.r,
        n = number.get(m),
        cls = kind === "edge" ? (Math.abs(m.off) <= 3 ? "miss" : "miss far") : `miss ${kind}`;
      const label = bare ? "" : `<b>${n ? `<u>${n}</u>` : ""}${m.off > 0 ? "+" : ""}${m.off}</b>`;
      if (m.s.kind !== "edge") return box(r, cls, label);
      if (m.axis === "y" || m.axis === "bot") return box({ left: r.left, top: m.at - 1, width: r.width, height: 2 }, `${cls} edge`, label, 0);
      return box({ left: m.at - 1, top: r.top, width: 2, height: r.height }, `${cls} edge`, label, 0);
    };
    root.innerHTML = `<style>
      :host { all: initial; }
      i { position: absolute; display: block; }
      .v { width: 1px; background: rgb(230 0 90 / .7); }
      .r { width: 0; background: none; border-left: 1px dashed rgb(230 0 90 / .75); }
      .h { height: 1px; background: rgb(230 0 90 / .45); }
      i > span { position: absolute; font: 400 8px/1 ui-monospace, Menlo, monospace; color: rgb(230 0 90 / .6); }
      .edge { box-shadow: none; background: rgb(230 0 0); }
      .edge.far { background: rgb(245 130 0); }
      .miss { box-shadow: 0 0 0 1.5px rgb(230 0 0); border-radius: 2px; }
      .miss b { position: absolute; top: -14px; left: -1px; white-space: nowrap; font: 600 9px/12px ui-monospace, Menlo, monospace; color: #fff; background: rgb(230 0 0); padding: 0 3px; border-radius: 2px; }
      .miss b u { text-decoration: none; margin: 0 4px 0 -3px; padding: 0 3px; background: #111; border-radius: 2px 0 0 2px; }
      .far { box-shadow: 0 0 0 1.5px rgb(245 130 0); }
      .far b { background: rgb(245 130 0); }
      .baseline, .inset { box-shadow: 0 0 0 1.5px rgb(120 60 220); }
      .baseline b, .inset b { background: rgb(120 60 220); }
      .x { height: 0; border-top: 1px dashed rgb(120 60 220 / .8); }
    </style>${across.map((l) => `<i class="x" style="left:${l.left}px;top:${l.y}px;width:${l.right - l.left}px"></i>`).join("")}${rows.map((l) => `<i class="h" style="left:${l.left}px;top:${l.y}px;width:${l.right - l.left}px"><span>${l.n}</span></i>`).join("")}${lines
      .map((l) => `<i class="v" style="left:${l.x}px;top:${l.top}px;height:${l.bottom - l.top}px"><span>${l.n}</span></i>`)
      .join("")}${ends.map((l) => `<i class="v r" style="left:${l.x}px;top:${l.top}px;height:${l.bottom - l.top}px"><span>${l.n}</span></i>`).join("")}${[
      ...misses.map((m) => [m, "edge"]),
      ...heads.map((m) => [m, "edge"]),
      ...rowPairs.map((m) => [m, "baseline"]),
      ...insets.map((m) => [m, "inset"]),
      ...cards.map((m) => [m, "inset"]),
      ...vcards.map((m) => [m, "inset"]),
      ...baselines.map((m) => [m, "baseline", !!m.pusher]),
      ...leads.map((m) => [m, "baseline"]),
      ...pairs.map((m) => [m, "baseline"]),
      ...xcols.map((m) => [m, "edge"]),
    ]
      .filter(([m]) => !dropped.has(m))
      .sort(([a], [b]) => (number.get(b) ? 1 : 0) - (number.get(a) ? 1 : 0) || Math.abs(b.off) - Math.abs(a.off))
      .reverse()
      .map(([m, kind, bare]) => mark(m, kind, bare))
      .join("")}`;
    document.body.append(host);
    // Badges never sit on text: each takes the first spot beside its box (above, below, left, right)
    // that covers no line of text and no badge placed before it, else the one that covers least.
    const inked = [];
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) });
    for (let n; (n = tw.nextNode()); ) {
      if (n.parentElement.closest(".proto, script, style, template, noscript")) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) if (q.width && q.height && q.bottom > 0 && q.top < innerHeight) inked.push(q);
    }
    const placed = [];
    const cover = (a, list) => list.reduce((t, q) => t + Math.max(0, Math.min(a.right, q.right) - Math.max(a.left, q.left)) * Math.max(0, Math.min(a.bottom, q.bottom) - Math.max(a.top, q.top)), 0);
    for (const b of root.querySelectorAll("b")) {
      const P = b.parentElement.getBoundingClientRect(),
        { width: w, height: h } = b.getBoundingClientRect();
      const spots = [
        [P.left - 1, P.top - h - 2],
        [P.right - w + 1, P.top - h - 2],
        [P.left - 1, P.bottom + 2],
        [P.right - w + 1, P.bottom + 2],
        [P.left - w - 3, P.top + (P.height - h) / 2],
        [P.right + 3, P.top + (P.height - h) / 2],
        [P.left - 1, P.top - 2 * h - 4],
        [P.left - 1, P.bottom + h + 4],
      ].map(([x, y]) => {
        const a = { left: x, top: y, right: x + w, bottom: y + h };
        const out = x < 0 || y < 0 || a.right > innerWidth || a.bottom > innerHeight;
        return { x, y, a, cost: cover(a, inked) + 4 * cover(a, placed) + (out ? 1e6 : 0) };
      });
      const best = spots.find((p) => !p.cost) || spots.sort((p, q) => p.cost - q.cost)[0];
      Object.assign(b.style, { left: `${best.x - P.left}px`, top: `${best.y - P.top}px` });
      placed.push(best.a);
    }
    // A guide's count sits at one end of its guide, beside it, where it covers no text and no badge; else it is left out.
    for (const s of root.querySelectorAll("i > span")) {
      const P = s.parentElement.getBoundingClientRect(),
        { width: w, height: h } = s.getBoundingClientRect(),
        [head, tail] = [P.top + 2, P.bottom - h - 2];
      const spots = s.parentElement.classList.contains("h")
        ? [
            [P.left + 2, P.top - h - 2],
            [P.right - w - 2, P.top - h - 2],
            [P.left + 2, P.top + 3],
            [P.right - w - 2, P.top + 3],
          ]
        : (s.parentElement.classList.contains("r") ? [tail, head] : [head, tail]).flatMap((y) => [
            [P.left + 3, y],
            [P.left - w - 2, y],
          ]);
      const spot = spots
        .map(([x, y]) => ({ x, y, a: { left: x, top: y, right: x + w, bottom: y + h } }))
        .find(({ a }) => a.left >= 0 && a.top >= 0 && a.right <= innerWidth && a.bottom <= innerHeight && !cover(a, inked) && !cover(a, placed));
      if (!spot) {
        s.remove();
        continue;
      }
      Object.assign(s.style, { left: `${spot.x - P.left}px`, top: `${spot.y - P.top}px` });
      placed.push(spot.a);
    }

    const item = (m) => ({
      text: m.s.label || textOf(m.s.el, m.s.r),
      where: sel(named(m.s.el)),
      off: m.off,
      axis: m.axis,
    });
    // One thing off by the same amount on both sides is listed once.
    const once = (l) => l.filter((m, i) => !l.slice(0, i).some((o) => o.s.el === m.s.el && o.axis !== m.axis && o.axis !== "y" && m.axis !== "y" && Math.abs(o.off) === Math.abs(m.off)));
    const near = once([...misses, ...cards].filter((m) => Math.abs(m.off) <= 3)),
      far = once([...misses, ...cards, ...heads].filter((m) => Math.abs(m.off) > 3));
    last = JSON.stringify({
      ...(warning && { warning }),
      lines: lines.length + ends.length,
      rows: rows.length,
      near: near.map(item),
      far: far.map(item),
      checks: checks.map(({ list, ...f }) => f),
    });
    return last;
  }

  // Live: redraw on page changes, scroll, and resize; Alt+R toggles.
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => requestAnimationFrame(draw), 80);
  };
  const ours = (n) => n.__redline === true;
  const observer = new MutationObserver((list) => {
    if (on && list.some((m) => (m.type === "childList" ? [...m.addedNodes, ...m.removedNodes].some((n) => !ours(n)) : !ours(m.target)))) schedule();
  });
  const onKey = (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.code !== "KeyR") return;
    e.preventDefault();
    on = !on;
    draw();
  };
  window.__redlineClear = () => {
    observer.disconnect();
    removeEventListener("scroll", schedule, true);
    removeEventListener("resize", schedule);
    removeEventListener("keydown", onKey, true);
    clearTimeout(timer);
    host?.remove();
    host = null;
    delete window.__redlineClear;
  };
  const begin = () => {
    draw();
    if (!live) return;
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "open"],
    });
    addEventListener("scroll", schedule, true);
    addEventListener("resize", schedule);
    addEventListener("keydown", onKey, true);
    document.fonts?.ready.then(schedule);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
  else begin();
  return last;
})();
