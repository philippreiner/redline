// Stress: does the screen hold with longer words and more rows?
// Changes the layer the layout meter reads, in place. window.__stress picks:
//   "long"  every text grows by 80%, a single word as one long compound, and
//           small counts grow to thousands, as in a longer language and a
//           mature account; dates and times keep their shape
//   "many"  every list repeats its rows up to window.__stressRows (50)
// Counts what breaks, before and after: text cut by an ellipsis or a line
// clamp (truncated), text cut by a box that hides its overflow (clipped), and
// text running into other text or across the edge of a filled box (overlaps). Screenshot after it runs, then run
// layout-meter.js and text.js on the result. window.__stressClear() restores
// the page.
(() => {
  const mode = window.__stress || "long";
  const set = window.__axesLayer;
  const layer =
    (typeof set === "string" ? document.querySelector(set) : set) ||
    [...document.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    document.querySelector('main, [role="main"], [data-slot="sidebar-inset"]') ||
    document.body;
  window.__stressClear?.();
  const undo = [];
  const name = layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase();
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  // What breaks, measured on the text: cut by an ellipsis or a line clamp
  // (truncated), cut by a box that hides its overflow (clipped), or running
  // into other text (overlaps).
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
        // Text under an open sheet or a sticky bar is covered, not broken.
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const hit = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? document.elementFromPoint(x, y) : null;
        if (hit && !el.contains(hit) && !hit.contains(el)) continue;
        // The part of the text its clipping boxes let show.
        const v = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
          const b = n.getBoundingClientRect();
          Object.assign(v, { left: Math.max(v.left, b.left), top: Math.max(v.top, b.top), right: Math.min(v.right, b.right), bottom: Math.min(v.bottom, b.bottom) });
        }
        runs.push({ el, r, v });
      }
    }
    let truncated = 0, clipped = 0, overlaps = 0;
    const cut = new Set();
    // The layer's own edge is the screen's edge, not a clip.
    for (const { el, r } of runs)
      for (let n = el; n && n !== layer; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
        const b = n.getBoundingClientRect();
        if (!cut.has(n) && (r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1 || r.top < b.top - 1)) {
          cut.add(n);
          if (cs.textOverflow === "ellipsis" || cs.getPropertyValue("-webkit-line-clamp") !== "none") truncated++;
          else clipped++;
        }
        break;
      }
    const meet = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    for (let i = 0; i < runs.length; i++)
      for (let j = i + 1; j < runs.length; j++) if (runs[i].el !== runs[j].el && meet(runs[i].v, runs[j].v)) overlaps++;
    // Text crossing the edge of a filled or outlined box it does not live in; text fully inside a highlight is fine.
    const boxes = [...layer.querySelectorAll("*")].filter((n) => {
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
        if (!within && meet(v, b)) overlaps++;
      }
    return { truncated, clipped, overlaps };
  };
  const before = breaks();

  if (mode === "long") {
    // A value (a date, a time, an amount) keeps its shape; only its small counts grow.
    const isValue = (s) => /^[\d\s.,:;%+\-–/€$£#×()]+$/.test(s) || /^[a-zäöü]{2,3}\.?,? \d{1,2}[./:]/i.test(s);
    const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let t = walker.nextNode(); t; t = walker.nextNode())
      if (t.textContent.trim() && !t.parentElement?.closest("script, style, #__axes, #__view, #__heat")) nodes.push(t);
    for (const t of nodes) {
      const old = t.textContent;
      const text = old.trim();
      let next = old.replace(/(?<![\d.:,/])\b\d{1,3}\b(?![.:,/]\d)/g, (n) => (Number(n) * 1000 + 284).toLocaleString("en-US"));
      if (/\p{L}/u.test(text) && !isValue(text)) {
        const words = text.split(/\s+/);
        const grow = Math.ceil(text.length * 0.8);
        const longer = words.length === 1 ? text + text.toLowerCase().slice(0, grow) : `${text} ${words.join(" ").slice(0, grow).trim()}`;
        next = next.replace(text, longer);
      }
      if (next === old) continue;
      t.textContent = next;
      undo.push(() => (t.textContent = old));
    }
    window.__stressClear = () => undo.reverse().forEach((f) => f());
    return JSON.stringify({ stress: mode, layer: name, texts: undo.length, before, after: breaks() });
  }
  if (mode !== "many") return JSON.stringify({ error: `unknown stress "${mode}"`, modes: ["long", "many"] });

  // A list is a list element, or a parent with three or more children of one
  // shape, each shorter than half the window; navigation, tabs, and toolbars
  // keep their items.
  const rows = window.__stressRows || 50;
  const shape = (n) => `${n.tagName}>${[...n.children].map((c) => c.tagName).join(",")}`;
  const lists = [];
  for (const el of layer.querySelectorAll("*")) {
    if (lists.some((l) => l.contains(el)) || el.closest("svg, nav, [role=navigation], [role=tablist], [role=menubar], [role=toolbar]")) continue;
    const kids = [...el.children];
    if (kids.length && kids.every((k) => k.matches("button, [role=tab], [role=button]"))) continue;
    if (kids.some((k) => k.getBoundingClientRect().height > innerHeight / 2)) continue;
    const same = kids.filter((k) => shape(k) === shape(kids.at(-1) || el));
    if (kids.length && (el.matches("ul, ol, tbody, [role=list], [role=listbox], [role=rowgroup]") || same.length >= 3) && same.length === kids.length) lists.push(el);
  }
  const report = lists.map((list) => {
    const from = list.children.length;
    const last = list.lastElementChild;
    for (let i = from; i < rows; i++) {
      const copy = list.children[i % from].cloneNode(true);
      copy.removeAttribute("id");
      list.insertBefore(copy, last.nextSibling);
      undo.push(() => copy.remove());
    }
    return `${list.tagName.toLowerCase()}.${list.classList[0] || ""} ${from} → ${Math.max(from, rows)}`;
  });
  window.__stressClear = () => undo.reverse().forEach((f) => f());
  return JSON.stringify({ stress: mode, layer: name, lists: report, before, after: breaks() });
})();
