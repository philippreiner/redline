// Heatmap: which elements are one kind, and does each kind look the same?
// Groups the rows (list items, or an element repeated in its parent), boxes,
// controls, and headings in view by kind (tag, role, slot, first class, and
// the set of their children's tags; a control by its role, its variant, and
// whether it holds text) and paints each kind with two or more members in its
// own color, lettered. A red outline marks a near-miss: a member whose look
// differs from its kind's most common look by a little (up to 4px of height
// or padding, 3px of radius, 2px of text size, one weight step, or a close
// shade), which is likely an accident. A clear difference is a deliberate
// variant and is only listed. A dashed red box marks a row of controls whose
// heights differ by 1 to 8px, or that holds more than one filled button.
// Reads the layer the layout meter reads, the part in view. Returns JSON.
// window.__heatClear() removes the overlay.
(() => {
  const set = window.__axesLayer;
  const layer =
    (typeof set === "string" ? document.querySelector(set) : set) ||
    [...document.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    document.querySelector('main, [role="main"], [data-slot="sidebar-inset"]') ||
    document.body;
  const L = layer.getBoundingClientRect();
  const top = Math.max(0, L.top);
  const bottom = Math.min(innerHeight, L.bottom);
  const inView = (r) => r.width > 0 && r.height > 0 && r.bottom > top && r.top < bottom && r.right > L.left && r.left < L.right;
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    return true;
  };
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const strong = (c) => {
    const [r, g, b, a] = rgba(c);
    return a > 200 && (Math.max(r, g, b) - Math.min(r, g, b) > 60 || Math.max(r, g, b) < 140);
  };
  const sample = (el) => (el.innerText || el.getAttribute("aria-label") || el.tagName.toLowerCase()).trim().replace(/\s+/g, " ").slice(0, 28);
  const CONTROL = "button, [role=button], input:not([type=hidden], [type=checkbox], [type=radio]), select, textarea, [role=combobox], [role=tab]";
  const ROW = "li, tr, [role=row], [role=option], [role=menuitem]";
  const STATE = "[aria-current]:not([aria-current=false]), [aria-selected=true], [aria-pressed=true], [aria-checked=true], [data-state=active], [data-state=on], [data-state=checked], .active, .is-active, .selected, .on";
  const UNIT = `${CONTROL}, ${ROW}, a[href], [role=listitem], h1, h2, h3, h4, h5, h6, [data-slot]`;
  const tag = (n) => n.tagName.toLowerCase() + (n.getAttribute("role") ? `[${n.getAttribute("role")}]` : "") + (n.dataset?.slot ? `[${n.dataset.slot}]` : "");
  // An element repeated in its parent is a row too.
  const listy = (el) => [...(el.parentElement?.children || [])].filter((c) => c.tagName === el.tagName && c.className === el.className).length >= 2;

  // 1. Kinds and their looks.
  const kinds = new Map();
  for (const el of layer.querySelectorAll("*")) {
    if (el.closest("svg, #__axes, #__view, #__heat")) continue;
    const r = el.getBoundingClientRect();
    if (!inView(r) || r.width < 16 || r.height < 12 || (r.width > L.width * 0.9 && r.height > innerHeight * 0.5) || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const fill = rgba(cs.backgroundColor);
    const line = ["Top", "Right", "Bottom", "Left"].filter((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 5);
    const row = el.matches(`${CONTROL}, ${ROW}`) || listy(el);
    if (fill[3] <= 5 && !line.length && cs.boxShadow === "none" && !row && !el.matches(UNIT)) continue;
    const look = {
      h: row ? Math.round(r.height) : null,
      p: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => Math.round(parseFloat(v))),
      r: Math.round(parseFloat(cs.borderTopLeftRadius)) || 0,
      fill: fill[3] > 5 ? fill : null,
      line: line.map((s) => s[0]).join(""),
      fs: el.innerText?.trim() ? parseFloat(cs.fontSize) : null,
      fw: el.innerText?.trim() ? Number(cs.fontWeight) : null,
    };
    look.key = [look.h !== null && `h${look.h}`, `p${look.p.join("/")}`, look.r && `r${look.r}`, look.fill && hex(look.fill), look.line && `line ${look.line}`, look.fs && `${look.fs}px/${look.fw}`].filter(Boolean).join(" ");
    // Inside a row or a table, a cell's position is part of its kind: the second cell of every row is one kind.
    const p = el.parentElement;
    const slot = p && (p.matches(ROW) || listy(p) || el.matches("td, th, [role=cell], [role=gridcell]")) ? `:${[...p.children].indexOf(el)}` : "";
    // A control's kind is its role and variant (filled, tinted, outline, quiet), whatever icon or logo it holds.
    const variant = strong(cs.backgroundColor) ? "filled" : fill[3] > 5 ? "tinted" : line.length ? "outline" : "quiet";
    const key = el.matches(CONTROL) ? `${tag(el)}:${variant}${el.innerText?.trim() ? "" : ":icon"}` : `${tag(el)}${el.classList[0] ? `.${el.classList[0]}` : ""}${slot}>${[...new Set([...el.children].map(tag))].sort().join(",")}`;
    kinds.set(key, [...(kinds.get(key) || []), { el, r, look }]);
  }
  // A small difference is likely an accident; a clear one is a variant.
  const near = (a, b, max) => a !== null && b !== null && a !== b && Math.abs(a - b) <= max;
  const accidents = (x, y) =>
    [
      near(x.h, y.h, 4) && `height ${x.h} vs ${y.h}`,
      x.p.some((v, i) => near(v, y.p[i], 4)) && `padding ${x.p.join("/")} vs ${y.p.join("/")}`,
      near(x.r, y.r, 3) && `radius ${x.r} vs ${y.r}`,
      near(x.fs, y.fs, 2) && `text ${x.fs}px vs ${y.fs}px`,
      near(x.fw, y.fw, 100) && `weight ${x.fw} vs ${y.fw}`,
      x.fill && y.fill && hex(x.fill) !== hex(y.fill) && x.fill.every((v, i) => Math.abs(v - y.fill[i]) <= 24) && `fill ${hex(x.fill)} vs ${hex(y.fill)}`,
    ].filter(Boolean);

  // 2. Overlay.
  document.getElementById("__heat")?.remove();
  const o = document.createElement("div");
  o.id = "__heat";
  o.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
  const add = (r, css, label) => {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;${css}`;
    if (label) {
      const s = document.createElement("span");
      s.textContent = label;
      s.style.cssText = "position:absolute;left:0;top:0;font:600 10px/12px system-ui;color:#fff;background:rgba(0,0,0,.7);padding:0 3px";
      d.appendChild(s);
    }
    o.appendChild(d);
  };
  const HUES = [210, 30, 140, 280, 0, 90, 180, 330, 50, 250];
  const odd = [];
  const groups = [...kinds].filter(([, items]) => items.length > 1).sort((a, b) => b[1].length - a[1].length);
  const list = groups.map(([key, items], i) => {
    const letter = i < 26 ? String.fromCharCode(65 + i) : `${i}`;
    const counts = new Map();
    for (const it of items) counts.set(it.look.key, [it.look, (counts.get(it.look.key)?.[1] || 0) + 1]);
    const looks = [...counts.values()].sort((a, b) => b[1] - a[1]);
    const hue = HUES[i % HUES.length];
    items.forEach((it, j) => {
      // A selected or current member differs on purpose.
      const why = it.el.matches(STATE) ? [] : accidents(it.look, looks[0][0]);
      if (why.length) odd.push(`${letter} ${sample(it.el)}: ${why.join(", ")}`);
      if (i < 12 || why.length) add(it.r, `background:hsla(${hue},85%,55%,.16);outline:${why.length ? "2px solid rgba(255,0,0,.9)" : `1px solid hsla(${hue},85%,40%,.6)`};outline-offset:-1px`, j === 0 ? letter : "");
    });
    return `${letter} ${key} ×${items.length}${looks.length > 1 ? `, ${looks.length} looks: ${looks.map(([l, n]) => `${n}× ${l.key}`).join(" | ")}` : ""}`;
  });

  // 3. Rows of controls: one height, and at most one filled button with a label.
  const rows = new Map();
  for (const el of layer.querySelectorAll(CONTROL)) {
    if (el.parentElement?.closest(CONTROL) || !visible(el) || !inView(el.getBoundingClientRect())) continue;
    let p = el.parentElement;
    while (p && p !== layer && !(getComputedStyle(p).display.includes("flex") && !getComputedStyle(p).flexDirection.startsWith("column"))) p = p.parentElement;
    if (p && p !== layer) rows.set(p, [...(rows.get(p) || []), el]);
  }
  const mixed = [];
  for (const [p, els] of rows) {
    if (els.length < 2) continue;
    const heights = [...new Set(els.map((el) => Math.round(el.getBoundingClientRect().height)))].sort((a, b) => a - b);
    const filled = els.filter((el) => el.matches("button, [role=button]") && el.innerText.trim() && !el.matches("[aria-pressed=true], [aria-selected=true], [data-state=active], [data-state=on]") && strong(getComputedStyle(el).backgroundColor)).length;
    const why = [heights.length > 1 && heights.at(-1) - heights[0] <= 8 && `heights ${heights.join("/")}`, filled > 1 && `${filled} filled buttons`].filter(Boolean).join(", ");
    if (!why) continue;
    mixed.push(`${els.map(sample).join(", ")}: ${why}`);
    add(p.getBoundingClientRect(), "outline:2px dashed rgba(255,0,0,.9);outline-offset:2px");
  }
  document.body.appendChild(o);
  window.__heatClear = () => document.getElementById("__heat")?.remove();

  return JSON.stringify({
    layer: layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase(),
    counts: { kinds: groups.length, nearMisses: odd.length, mixedRows: mixed.length },
    groups: list.slice(0, 20),
    nearMisses: odd.slice(0, 20),
    rows: mixed.slice(0, 10),
  });
})();
