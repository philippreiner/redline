// Text only: can the screen be followed by reading alone, and what is clutter?
// Reads the layer the layout meter reads (window.__axesLayer, else the last
// open dialog or sheet, else the main column) in DOM order, the order a screen
// reader takes. Each run of text gets a role: heading, label, button, link,
// icon (a named control without text), input (placeholder or value), value,
// helper (small grey text), or text. Returns JSON, no overlay: lines to read
// top to bottom, word count, repeated strings, value formats (digits as 9,
// words as a: two date shapes in one list are two formats), likely eyebrows
// (short small text right above a larger heading), labels that restate their
// neighbor, lines that only say there is nothing, text cut by an ellipsis or
// line clamp, the loudest text by size and weight, and every action label
// with its count (three ways to add one thing show up here).
(() => {
  const set = window.__axesLayer;
  const layer =
    (typeof set === "string" ? document.querySelector(set) : set) ||
    [...document.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    document.querySelector('main, [role="main"], [data-slot="sidebar-inset"]') ||
    document.body;
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect(); // a 1px box is visually hidden text
    return (r.width > 1 || r.height > 1) && !el.closest("#__axes, #__view");
  };
  const CONTROL = "button, [role=button], [role=tab], [role=menuitem], [role=option], [role=switch], [role=checkbox], [role=radio], summary";
  // A run is the text of one block, control, heading, or label.
  const host = (el) => {
    for (let n = el; n && n !== layer; n = n.parentElement)
      if (n.matches(`${CONTROL}, a[href], h1, h2, h3, h4, h5, h6, [role=heading], label, legend, th, td, dt, dd, li`) || getComputedStyle(n).display !== "inline") return n;
    return layer;
  };
  const runs = [];
  const byHost = new Map();
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 1) {
      const el = node;
      const named = el.getAttribute("aria-label") || el.getAttribute("title");
      const field = el.matches("input:not([type=hidden], [type=checkbox], [type=radio]), textarea");
      if (!(field || (named && el.matches(`${CONTROL}, a[href]`) && !el.textContent.trim())) || !visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const text = field ? el.value || el.placeholder : named;
      if (text) runs.push({ el, text, role: field ? "input" : "icon", r, cs: getComputedStyle(el) });
      continue;
    }
    const text = node.textContent.replace(/\s+/g, " ").trim();
    if (!/[\p{L}\p{N}–—-]/u.test(text) || !node.parentElement || !visible(node.parentElement)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    if (!rects.length) continue;
    const h = host(node.parentElement);
    const run = byHost.get(h);
    if (run && run === runs.at(-1)) run.text += ` ${text}`;
    else {
      const next = { el: h, p: node.parentElement, text, r: rects[0], cs: getComputedStyle(node.parentElement) };
      byHost.set(h, next);
      runs.push(next);
    }
  }

  const size = (run) => parseFloat(run.cs.fontSize);
  const weight = (run) => Number(run.cs.fontWeight);
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  const count = (f) => {
    const m = new Map();
    for (const run of runs) m.set(f(run), (m.get(f(run)) || 0) + words(run.text));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const base = count(size);
  const ink = count((run) => run.cs.color);
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const grey = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return Math.max(r, g, b) - Math.min(r, g, b) < 24;
  };
  // Numbers, amounts, durations, and dates are data, not words.
  const isValue = (s) => /^[\d\s.,:;%+\-–/€$£#×()]+$/.test(s) || /^\d[\d.,]*\s?[a-z%]{1,4}$/i.test(s) || /^[a-zäöü]{2,3}\.?,? \d{1,2}[./:]/i.test(s);
  // A control or link holding one run is labeled by it; runs inside a bigger one, such as a row link, keep their own roles.
  const ACT = `${CONTROL}, a[href], [role=link]`;
  const inside = new Map();
  for (const run of runs) {
    const k = run.el.closest(ACT);
    if (k) inside.set(k, (inside.get(k) || 0) + 1);
  }
  for (const run of runs) {
    if (run.role) continue;
    const c = (s) => run.el.closest(s);
    const k = c(ACT);
    run.role = c("h1, h2, h3, h4, h5, h6, [role=heading]")
      ? "heading"
      : k && inside.get(k) === 1
        ? k.matches(CONTROL) ? "button" : "link"
          : c("label, legend, th, dt, [role=columnheader]")
            ? "label"
            : c("td, dd, [role=cell], output") || isValue(run.text)
              ? "value"
              : size(run) >= Math.max(18, base * 1.3)
                ? "heading"
                : size(run) <= base && run.cs.color !== ink && grey(run.cs.color)
                  ? "helper"
                  : "text";
  }

  const norm = (s) => s.toLowerCase().replace(/[…:.]+$/, "").trim();
  const seen = new Map();
  // Interface strings that repeat; headings, links, values, and the text of rows are content.
  // A row is a list item or link, or an element repeated in its parent with one tag and class.
  const CONTENT = "li, tr, td, dd, [role=row], [role=listitem], [role=option], [role=gridcell], a[href]";
  const inRow = (el) => {
    if (el.closest(CONTENT)) return true;
    for (let n = el, i = 0; n?.parentElement && n !== layer && i < 5; n = n.parentElement, i++)
      if ([...n.parentElement.children].filter((c) => c.tagName === n.tagName && c.className === n.className).length > 1) return true;
    return false;
  };
  for (const run of runs)
    if ((["label", "button", "helper"].includes(run.role) || (run.role === "text" && !inRow(run.el))) && norm(run.text).length > 1)
      seen.set(norm(run.text), [run.text, (seen.get(norm(run.text))?.[1] || 0) + 1]);
  const eyebrows = [];
  const restated = [];
  runs.forEach((a, i) => {
    const b = runs[i + 1];
    if (!b) return;
    const gap = b.r.top - a.r.bottom;
    const small = ["text", "helper", "label", "heading"].includes(a.role) && words(a.text) <= 4;
    if (small && b.role !== "value" && gap >= -2 && gap <= 16 && Math.abs(a.r.left - b.r.left) <= 8 && size(a) < size(b) && (b.role === "heading" || size(b) >= size(a) + 2))
      eyebrows.push([a.text, b.text]);
    const [x, y] = [norm(a.text), norm(b.text)];
    const same = x.length > 2 && y.length > 2 && (x.startsWith(y) || y.startsWith(x));
    if (same && a.role !== b.role && Math.abs(b.r.top - a.r.top) <= 64) restated.push([`${a.role}: ${a.text}`, `${b.role}: ${b.text}`]);
  });
  // Lines that say there is nothing, and dashes standing in for a value. A named
  // missing value inside a row ("No date") is the fix, not a finding.
  const nothing = new Map();
  const ROWISH = "li, tr, td, dd, [role=row], [role=listitem], [role=option], [role=gridcell]";
  for (const run of runs)
    if ((["heading", "text", "helper"].includes(run.role) && !run.el.closest(ROWISH) && words(run.text) <= 8 && /\b(no|none|nothing|not yet|empty)\b/i.test(run.text)) || /^[-–—]$/.test(run.text))
      nothing.set(run.text, (nothing.get(run.text) || 0) + 1);
  const clipped = (e) => {
    const cs = getComputedStyle(e);
    return (e.scrollWidth > e.clientWidth + 1 && cs.textOverflow === "ellipsis") || (e.scrollHeight > e.clientHeight + 1 && cs.getPropertyValue("-webkit-line-clamp") !== "none");
  };
  const truncated = runs.filter((run) => run.p && (clipped(run.el) || clipped(run.p)));
  const shapes = new Map();
  for (const run of runs.filter((r) => r.role === "value" && /\d/.test(r.text))) {
    const k = run.text.replace(/\p{L}+/gu, "a").replace(/\d+/g, "9");
    shapes.set(k, [...(shapes.get(k) || []), run.text]);
  }
  const loud = [...runs].sort((a, b) => size(b) - size(a) || weight(b) - weight(a)).slice(0, 5);
  const cut = (s, n = 80) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

  const repeats = [...seen.values()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  // One action per control or link, nested ones included, by its accessible name or its first line.
  const acts = new Map();
  for (const el of layer.querySelectorAll(ACT)) {
    if (!visible(el)) continue;
    const name = (el.getAttribute("aria-label") || el.innerText.split("\n").find((l) => l.trim()) || el.getAttribute("title") || "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (name && !(el.matches("a[href]") && isValue(name))) acts.set(name, (acts.get(name) || 0) + 1); // a row led by its date is navigation
  }
  const actions = [...acts];
  const total = runs.reduce((n, run) => n + words(run.text), 0);

  return JSON.stringify({
    layer: layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase(),
    words: total,
    counts: { words: total, helpers: runs.filter((run) => run.role === "helper").length, repeats: repeats.length, eyebrows: eyebrows.length, restated: restated.length, nothing: nothing.size, truncated: truncated.length, actions: actions.length },
    runs: runs.length,
    baseSize: base,
    roles: runs.reduce((m, run) => ((m[run.role] = (m[run.role] || 0) + 1), m), {}),
    repeats: repeats.map(([t, n]) => `${n}x ${cut(t, 48)}`),
    valueFormats: [...shapes].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${v.length}x ${k} (${cut(v[0], 24)})`),
    eyebrows: eyebrows.map(([a, b]) => `${cut(a, 32)} ^ ${cut(b, 48)}`),
    nothing: [...nothing].map(([t, n]) => `${n}x ${cut(t, 48)}`),
    truncated: truncated.map((run) => cut(run.text, 64)),
    restated: restated.map(([a, b]) => `${cut(a, 48)} = ${cut(b, 48)}`),
    loudest: loud.map((run) => `${size(run)}/${weight(run)} ${cut(run.text, 48)}`),
    actions: actions.map(([t, n]) => `${n}x ${cut(t, 40)}`),
    lines: runs.slice(0, 200).map((run) => `${run.role} ${size(run)}${weight(run) >= 600 ? "b" : ""}: ${cut(run.text)}`),
  });
})();
