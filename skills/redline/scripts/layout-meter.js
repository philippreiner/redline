// Layout meter: are edges shared, siblings equal, boxes flat?
// Measures the top layer in view: the last open dialog or sheet, else the
// main column, else the body. window.__axesLayer (an element or a selector)
// picks another. Overlay: left edges magenta, right edges dashed pink, box
// and control edges dashed blue, rules cyan, near-misses red (edges 2 to 4px
// apart, or text baselines 1.5 to 4px apart in one row), doubled lines violet
// (two lines 1 to 3px apart), sibling boxes of unequal height orange. Returns
// JSON counts, box insets, and the frame (the title's and the breadcrumb's
// position) to compare across screens. window.__axesClear() removes the
// overlay.
(() => {
  const SNAP = 1; // px: edges closer than this count as one axis
  const q = (s) => [...document.querySelectorAll(s)];
  const set = window.__axesLayer;
  const layer =
    (typeof set === "string" ? document.querySelector(set) : set) ||
    q('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    document.querySelector('main, [role="main"], [data-slot="sidebar-inset"]') ||
    document.body;
  const L = layer.getBoundingClientRect();
  const top = Math.max(0, L.top);
  const bottom = Math.min(innerHeight, L.bottom);
  const inView = (r) =>
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > top &&
    r.top < bottom &&
    r.right > L.left &&
    r.left < L.right;
  const visible = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      if (Number(cs.opacity) === 0) return false;
    }
    return true;
  };
  const alpha = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return c === "transparent" ? 0 : 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    return p.length > 3 ? Number(p[3]) : 1;
  };

  const isBox = (el, cs, r) => {
    const bg = alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== getComputedStyle(el.parentElement || el).backgroundColor;
    const sides = ["Top", "Right", "Bottom", "Left"].filter(
      (s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && alpha(cs[`border${s}Color`]) > 0.02,
    ).length;
    const ring = cs.boxShadow && cs.boxShadow !== "none";
    return (bg || sides === 4 || ring) && r.width > 24 && r.height > 18;
  };

  // 1. Content edges: text line starts and ends, icons, images, controls.
  // A right-aligned run counts by its right edge, a centered one by neither.
  const lefts = [];
  const rights = [];
  const leftEls = [];
  const keyRightEls = [];
  const side = (el) => {
    const own = getComputedStyle(el);
    if (/center/.test(own.textAlign) || (own.display.includes("flex") && /center/.test(own.justifyContent)) || (own.display.includes("grid") && /center/.test(own.justifyItems))) return "center";
    if (/right|end/.test(own.textAlign) || (own.display.includes("flex") && /end|right/.test(own.justifyContent))) return "right";
    for (let n = el; n && n.parentElement && n !== layer; n = n.parentElement) {
      const ps = getComputedStyle(n.parentElement);
      if (ps.display.includes("grid") && /center/.test(ps.justifyItems)) return "center";
      if (ps.display.includes("flex")) return /center/.test(ps.justifyContent) ? "center" : /end|right/.test(ps.justifyContent) ? "right" : "left";
      if (getComputedStyle(n).display !== "inline") break;
    }
    return "left";
  };
  // Text and icons inside a small painted box (a button, chip, or tile up to 40px) are measured by that box.
  const painted = (n) => {
    const cs = getComputedStyle(n);
    return (alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== getComputedStyle(n.parentElement || n).backgroundColor) || cs.boxShadow !== "none" || ["Top", "Right", "Bottom", "Left"].every((x) => parseFloat(cs[`border${x}Width`]) > 0);
  };
  const inSmallBox = (node) => {
    for (let n = node; n && n !== layer; n = n.parentElement) if (painted(n)) return n.getBoundingClientRect().height <= 40;
    return false;
  };
  // A small group pushed to the right end of its row (actions, a trailing value) is right-aligned; its left edges are incidental.
  const pushedRight = (el) => {
    for (let n = el, i = 0; n && n !== layer && i < 5; n = n.parentElement, i++) {
      const p = n.parentElement;
      if (!p) break;
      const r = n.getBoundingClientRect(), pr = p.getBoundingClientRect(), ps = getComputedStyle(p);
      if (r.height <= 64 && Math.abs(r.right - (pr.right - parseFloat(ps.paddingRight) - parseFloat(ps.borderRightWidth))) <= 1 && r.left - pr.left > pr.width / 2) return true;
    }
    return false;
  };
  // Text flush with its button's padding is left-aligned, whatever the button's text-align says.
  const flush = (node, x) => {
    const b = node.closest?.("button, [role=button]");
    if (!b) return false;
    const cs = getComputedStyle(b);
    return Math.abs(x - (b.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft))) <= 1;
  };
  const edge = (ctx, l, r, node, top, bottom) => {
    const s = pushedRight(node) ? "right" : flush(node, l) ? "left" : side(ctx);
    if (s === "left") {
      lefts.push(l);
      leftEls.push({ x: l, el: node, top, bottom });
    }
    if (s === "right") keyRightEls.push({ x: r, el: node, top, bottom });
    rights.push(r);
  };
  const styles = new Map();
  let words = 0;
  // A text's baseline is its box top plus the font's ascent.
  const texts = [];
  const cv = document.createElement("canvas").getContext("2d");
  const ascents = new Map();
  const ascent = (cs) => {
    const f = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if (!ascents.has(f)) (cv.font = f), ascents.set(f, cv.measureText("Hg").fontBoundingBoxAscent);
    return ascents.get(f);
  };
  const muted = [];
  const fg = getComputedStyle(document.body).color;
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const text = t.textContent.trim();
    if (!text || !t.parentElement || !visible(t.parentElement)) continue;
    if (t.parentElement.closest(".sr-only, .visually-hidden, [aria-hidden=true] svg")) continue;
    const range = document.createRange();
    range.selectNodeContents(t);
    const rects = [...range.getClientRects()].filter(inView);
    if (!rects.length) continue;
    if (!inSmallBox(t.parentElement)) edge(t.parentElement, rects[0].left, Math.max(...rects.map((r) => r.right)), t.parentElement, rects[0].top, rects[rects.length - 1].bottom);
    words += text.split(/\s+/).length;
    const cs = getComputedStyle(t.parentElement);
    texts.push({ el: t.parentElement, r: rects[0], base: rects[0].top + ascent(cs), size: parseFloat(cs.fontSize) });
    const family = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    const key = `${family} ${cs.fontSize}/${cs.fontWeight} ${cs.color}`;
    styles.set(key, (styles.get(key) || 0) + 1);
    if (cs.color !== fg && muted.length < 40) muted.push(text.slice(0, 48));
  }
  const marks = q("svg, img, input, textarea, select, button, [role=combobox], [role=radio], [role=checkbox], [role=switch]")
    .filter((el) => layer.contains(el) && visible(el));
  for (const el of marks) {
    const r = el.getBoundingClientRect();
    // A quiet button paints nothing: its text and icon are its edges, not its box.
    if (!inView(r) || r.width < 6 || (el.matches("svg, img") && inSmallBox(el.parentElement)) || (el.matches("button, [role=button]") && !painted(el))) continue;
    // An icon without a visible box around it is seen by its own edge, not by its wrapper's centering.
    const p = el.parentElement || el;
    if (el.matches("svg, img") && !isBox(p, getComputedStyle(p), p.getBoundingClientRect()) && !pushedRight(el)) {
      lefts.push(r.left);
      leftEls.push({ x: r.left, el, top: r.top, bottom: r.bottom });
      rights.push(r.right);
    } else edge(p, r.left, r.right, el, r.top, r.bottom);
  }

  // 2. Boxes, rules, chips, nesting.
  const CONTROLS = "button, input, select, textarea, [role=button], [role=combobox], [role=switch], [role=checkbox], [role=radio]";
  const boxes = [];
  const hRules = [];
  const vRules = [];
  const drawn = [];
  let chips = 0;
  for (const el of [layer, ...layer.querySelectorAll("*")]) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!inView(r)) continue;
    const cs = getComputedStyle(el);
    const line = (s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && alpha(cs[`border${s}Color`]) > 0.02;
    const sides = ["Top", "Right", "Bottom", "Left"].filter(line);
    if (sides.length > 0 && sides.length < 4) {
      if (line("Top") && r.width > 40) hRules.push({ y: r.top, x1: r.left, x2: r.right });
      if (line("Bottom") && r.width > 40) hRules.push({ y: r.bottom, x1: r.left, x2: r.right });
      if (line("Left") && r.height > 16) vRules.push({ x: r.left, y1: r.top, y2: r.bottom });
      if (line("Right") && r.height > 16) vRules.push({ x: r.right, y1: r.top, y2: r.bottom });
    }
    // Every drawn line at the pixel it paints: borders on any side, and filled strips 1 or 2px thick.
    const w = (s) => parseFloat(cs[`border${s}Width`]);
    for (const s of sides) drawn.push(s === "Top" || s === "Bottom" ? { h: 1, at: s === "Top" ? r.top : r.bottom - w(s), a: r.left, b: r.right, el } : { h: 0, at: s === "Left" ? r.left : r.right - w(s), a: r.top, b: r.bottom, el });
    if (!el.children.length && alpha(cs.backgroundColor) > 0.02 && Math.min(r.width, r.height) <= 2 && Math.max(r.width, r.height) > 8)
      drawn.push(r.height <= 2 ? { h: 1, at: r.top, a: r.left, b: r.right, el } : { h: 0, at: r.left, a: r.top, b: r.bottom, el });
    // A box filling the layer is its frame, not a box inside it; a control is measured as a control.
    if (el !== layer && !el.matches(CONTROLS) && isBox(el, cs, r) && !(r.width >= L.width * 0.9 && r.height >= L.height * 0.8)) {
      // A chip's or an icon tile's edge is not counted as an axis, but it is the container its icon sits in.
      if ((r.height <= 26 && r.width < 240) || (r.width <= 40 && r.height <= 40)) chips++, leftEls.push({ x: r.left, el, top: r.top, bottom: r.bottom });
      else {
        boxes.push(el);
        lefts.push(r.left);
        leftEls.push({ x: r.left, el, top: r.top, bottom: r.bottom });
        rights.push(r.right);
      }
    }
  }
  const depth = Math.max(0, ...boxes.map((b) => {
    let d = 0;
    for (let n = b.parentElement; n && n !== layer; n = n.parentElement) if (boxes.includes(n)) d++;
    return d;
  }));
  // Content inset: how far a box's first left edge sits inside it. One kind of box keeps one inset.
  const insets = new Map();
  for (const b of boxes) {
    const xs = texts.filter((t) => b.contains(t.el)).map((t) => t.r.left);
    if (xs.length) {
      const v = Math.round(Math.min(...xs) - b.getBoundingClientRect().left);
      insets.set(v, (insets.get(v) || 0) + 1);
    }
  }
  // Doubled lines: two lines of different elements 1 to 3px apart that run side by side, such as a box border on a divider.
  const doubled = new Map();
  for (let i = 0; i < drawn.length; i++)
    for (let j = i + 1; j < drawn.length; j++) {
      const p = drawn[i], q = drawn[j];
      const d = Math.abs(p.at - q.at);
      const a = Math.max(p.a, q.a), b = Math.min(p.b, q.b);
      if (p.h === q.h && p.el !== q.el && d >= 1 && d <= 3 && b - a > 8) doubled.set(`${p.h}:${Math.round(Math.min(p.at, q.at))}:${Math.round(a)}`, { h: p.h, at: Math.min(p.at, q.at), a, b, d });
    }

  const cluster = (xs) => {
    const s = [...xs].map((x) => Math.round(x)).sort((a, b) => a - b);
    const out = [];
    for (const x of s) if (!out.length || x - out[out.length - 1] > SNAP) out.push(x);
    return out;
  };
  const leftAxes = cluster(lefts.filter((x) => x >= L.left - 1 && x <= L.right));
  const rightAxes = cluster(rights.filter((x) => x >= L.left && x <= L.right + 1));
  const ruleYs = cluster(hRules.map((r) => r.y));
  // Two edges 1 to 4px apart miss each other when they are neighbors (within
  // about 100px vertically) and neither sits inside the other's box.
  const nearMiss = (items) => {
    const groups = [];
    for (const it of [...items].sort((a, b) => a.x - b.x)) {
      const g = groups[groups.length - 1];
      if (g && it.x - g.x <= SNAP) g.items.push(it);
      else groups.push({ x: Math.round(it.x), items: [it] });
    }
    const related = (a, b) => a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el);
    const near = (a, b) => Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom) <= 100;
    // An edge whose own container sits on the other edge is that box's padding.
    const padded = (it, grp) => grp.items.some((o) => o.el !== it.el && o.el.contains(it.el));
    return groups.flatMap((g, i) => {
      const p = groups[i - 1];
      if (!p || g.x - p.x <= SNAP || g.x - p.x > 4) return [];
      return p.items.some((a) => !padded(a, g) && g.items.some((b) => !padded(b, p) && near(a, b) && !related(a, b))) ? [[p.x, g.x]] : [];
    });
  };

  // Horizontal lines: the top and bottom edges of boxes and controls.
  const ctl = q("input, textarea, select, button, [role=combobox]").filter((el) => layer.contains(el) && visible(el));
  const solids = [...boxes, ...ctl]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => inView(r) && r.height >= 18);
  const edgeYs = cluster(solids.flatMap(({ r }) => [r.top, r.bottom]));
  // Text ends are ragged by nature; right-edge misses count boxes and controls only.
  const inLayer = ({ x }) => x >= L.left - 1 && x <= L.right + 1;
  const missX = [...nearMiss(leftEls.filter(inLayer)), ...nearMiss([...solids.map(({ el, r }) => ({ x: r.right, el, top: r.top, bottom: r.bottom })), ...keyRightEls].filter(inLayer))];
  const missY = [];
  for (let i = 0; i < solids.length; i++)
    for (let j = i + 1; j < solids.length; j++) {
      const a = solids[i].r, b = solids[j].r;
      const side = a.right <= b.left + 1 || b.right <= a.left + 1;
      const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (!side || overlap < Math.min(a.height, b.height) / 2) continue;
      // Skip an edge whose own container already sits on the other edge.
      const onEdge = (el, k, y) => solids.some((c) => c.el !== el && c.el.contains(el) && Math.abs(c.r[k] - y) <= SNAP);
      for (const [k, y1, y2] of [["top", a.top, b.top], ["bottom", a.bottom, b.bottom]]) {
        const d = Math.abs(y1 - y2);
        if (d > SNAP && d <= 4 && !onEdge(solids[i].el, k, y2) && !onEdge(solids[j].el, k, y1)) missY.push(Math.round(Math.min(y1, y2)));
      }
    }
  // Baselines: text of a similar size side by side in one row shares its baseline; 1.5 to 4px apart is a near-miss.
  const missBase = new Map();
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el) || Math.abs(a.size - b.size) > 2) continue;
      const apart = a.r.right <= b.r.left || b.r.right <= a.r.left;
      const row = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > Math.min(a.r.height, b.r.height) / 2;
      const d = Math.abs(a.base - b.base);
      if (apart && row && d >= 1.5 && d <= 4)
        missBase.set(`${Math.round(Math.min(a.base, b.base))}:${Math.round(Math.max(a.base, b.base))}`, { left: Math.min(a.r.left, b.r.left), right: Math.max(a.r.right, b.r.right), top: Math.min(a.base, b.base), d });
    }
  // Siblings of one kind (same parent and slot or class; same width stacked, or same top side by side) of unequal height.
  const byParent = new Map();
  for (const b of boxes) {
    const tag = (n) => (n ? n.dataset?.slot || n.classList?.[0] || n.tagName : "");
    const kind = `${tag(b)}>${tag(b.children[0])}+${tag(b.children[1])}`;
    const kinds = byParent.get(b.parentElement) || new Map();
    byParent.set(b.parentElement, kinds);
    kinds.set(kind, [...(kinds.get(kind) || []), b.getBoundingClientRect()]);
  }
  const unequal = [...byParent.values()].flatMap((kinds) => [...kinds.values()]).filter((rs) => {
    if (rs.length < 2) return false;
    const same = (k) => Math.max(...rs.map((r) => r[k])) - Math.min(...rs.map((r) => r[k])) <= 2;
    return (same("width") || same("top")) && !same("height");
  });

  // 3. Overlay.
  document.getElementById("__axes")?.remove();
  const o = document.createElement("div");
  o.id = "__axes";
  o.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
  const add = (css) => {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;${css}`;
    o.appendChild(d);
  };
  for (const x of leftAxes) add(`left:${x}px;top:${top}px;height:${bottom - top}px;width:0;border-left:1px solid rgba(255,0,170,.75)`);
  for (const x of rightAxes) add(`left:${x}px;top:${top}px;height:${bottom - top}px;width:0;border-left:1px dashed rgba(255,0,170,.35)`);
  for (const y of edgeYs) add(`left:${L.left}px;top:${y}px;width:${L.width}px;height:0;border-top:1px dashed rgba(0,160,255,.4)`);
  for (const r of hRules) add(`left:${r.x1}px;top:${r.y}px;width:${r.x2 - r.x1}px;height:0;border-top:2px solid rgba(0,190,255,.9)`);
  for (const [a, b] of missX) add(`left:${a}px;top:${top}px;width:${b - a}px;height:${bottom - top}px;background:rgba(255,40,0,.35)`);
  for (const y of missY) add(`left:${L.left}px;top:${y - 1}px;width:${L.width}px;height:4px;background:rgba(255,40,0,.35)`);
  for (const m of missBase.values()) add(`left:${m.left}px;top:${m.top - 1}px;width:${m.right - m.left}px;height:${m.d + 2}px;background:rgba(255,40,0,.45)`);
  for (const l of doubled.values())
    add(l.h ? `left:${l.a}px;top:${l.at - 2}px;width:${l.b - l.a}px;height:${l.d + 5}px;background:rgba(140,0,255,.35)` : `left:${l.at - 2}px;top:${l.a}px;width:${l.d + 5}px;height:${l.b - l.a}px;background:rgba(140,0,255,.35)`);
  for (const rs of unequal) for (const r of rs) add(`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;outline:2px solid rgba(255,140,0,.9)`);
  document.body.appendChild(o);
  window.__axesClear = () => document.getElementById("__axes")?.remove();

  // Frame: where the page title's text sits inside the layer, to compare across neighbor screens.
  const title = layer.querySelector('h1, [role=heading][aria-level="1"]') || layer.querySelector("h2");
  const range = document.createRange();
  if (title) range.selectNodeContents(title);
  const tr = range.getBoundingClientRect();
  // The breadcrumb: where its first segment starts and what its last one says.
  // Found by its label or class, else as the first element whose children include a separator such as "/" or "›".
  const TRAIL = 'nav[aria-label*="readcrumb" i], [data-slot="breadcrumb"], .breadcrumb, [class*="crumb"]';
  const bySeparator = (root) => [...root.querySelectorAll("*")].find((el) => el.children.length >= 3 && [...el.children].some((c) => /^\s*[/›>»]\s*$/.test(c.textContent)));
  const trail = layer.querySelector(TRAIL) || document.querySelector(TRAIL) || bySeparator(layer) || bySeparator(document.body);
  const parts = [];
  if (trail) for (let w = document.createTreeWalker(trail, NodeFilter.SHOW_TEXT), t = w.nextNode(); t; t = w.nextNode()) if (/[\p{L}\p{N}]/u.test(t.textContent)) parts.push(t);
  const cr = document.createRange();
  if (parts.length) cr.selectNodeContents(parts[0]);
  const crumb = parts.length ? { x: Math.round(cr.getBoundingClientRect().left - L.left), last: parts.at(-1).textContent.trim().slice(0, 32) } : null;
  const head = title && { title: title.textContent.trim().slice(0, 32), x: Math.round(tr.left - L.left), y: Math.round(tr.top - L.top), size: getComputedStyle(title).fontSize };
  const frame = head || crumb ? { ...head, crumb, ...(head && crumb && { crumbOffKeyline: Math.abs(crumb.x - head.x) > 1, crumbEndsInTitle: crumb.last === head.title }) } : null;

  return JSON.stringify({
    layer: layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase(),
    width: Math.round(L.width),
    frame,
    leftAxes: leftAxes.length,
    rightAxes: rightAxes.length,
    nearMissX: missX.length,
    nearMissPx: missX.map(([a, b]) => [Math.round(a - L.left), Math.round(b - L.left)]),
    horizontalEdges: edgeYs.length,
    nearMissY: new Set(missY).size,
    nearMissBaseline: missBase.size,
    doubledLines: doubled.size,
    unequalSiblings: unequal.length,
    horizontalRules: ruleYs.length,
    verticalRules: cluster(vRules.map((r) => r.x)).length,
    boxes: boxes.length,
    boxNesting: depth,
    insets: [...insets].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}px ×${n}`),
    chips,
    textStyles: styles.size,
    words,
    styles: [...styles.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}x ${k}`),
    mutedSample: muted,
    leftAxesPx: leftAxes.map((x) => Math.round(x - L.left)),
  });
})();
