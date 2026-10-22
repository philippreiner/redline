// Views: see the screen without its details. Set window.__view first:
//   "far"       grayscale and blur, as if seen small from across the room:
//               can you name the page and point at what leads?
//   "wireframe" every box grey in its own tone, text as bars, icons as
//               blocks: do layout and balance hold without content?
//   "notext"    text erased, boxes and icons kept: is the structure clear?
//   "textonly"  boxes, lines, fills, and icons stripped, text in place: do the
//               groups still hold together with space and type alone?
//   "nolines"   borders, dividers, and shadows stripped, fills kept: which
//               lines and shadows does the screen miss?
// Covers the whole page, or window.__axesLayer (an element or a selector).
// Screenshot after it runs; window.__viewClear() restores the page.
(() => {
  const mode = window.__view || "far";
  const set = window.__axesLayer;
  const target = (typeof set === "string" ? document.querySelector(set) : set) || document.documentElement;
  window.__viewClear?.();
  const name = (el) => el.getAttribute("data-slot") || el.getAttribute("role") || el.tagName.toLowerCase();

  if (mode === "far") {
    const blur = window.__farBlur || Math.max(4, Math.round(innerWidth / 240));
    target.style.setProperty("filter", `grayscale(1) blur(${blur}px)`, "important");
    window.__viewClear = () => target.style.removeProperty("filter");
    return JSON.stringify({ view: mode, target: name(target), blurPx: blur });
  }
  const views = ["far", "wireframe", "notext", "textonly", "nolines"];
  if (!views.includes(mode)) return JSON.stringify({ error: `unknown view "${mode}"`, views });

  const page = target === document.documentElement;
  const R = page ? { left: 0, top: 0, right: innerWidth, bottom: innerHeight } : target.getBoundingClientRect();
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
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
  // The color behind an element: its own and its ancestors' fills, composited over white.
  const backdrop = (el) => {
    const stack = [];
    for (let n = el; n && stack.at(-1)?.[3] !== 255; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) stack.push(c);
    }
    let rgb = [255, 255, 255];
    for (const c of stack.reverse()) rgb = rgb.map((v, i) => c[i] * (c[3] / 255) + v * (1 - c[3] / 255));
    return `rgb(${rgb.map(Math.round)})`;
  };
  const els = page ? document.body.querySelectorAll("*") : [target, ...target.querySelectorAll("*")];

  // textonly and nolines restyle the page in place, so the layout stays exact.
  if (mode === "textonly" || mode === "nolines") {
    const saved = [];
    const put = (el, prop, value) => {
      saved.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
      el.style.setProperty(prop, value, "important");
    };
    const base = backdrop(page ? document.body : target);
    // The lines nolines strips: elements that draw a border or a shadow.
    const lines = [...els].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.boxShadow !== "none" || ["Top", "Right", "Bottom", "Left"].some((x) => parseFloat(cs[`border${x}Width`]) > 0 && cs[`border${x}Style`] !== "none" && rgba(cs[`border${x}Color`])[3] > 5);
    }).length;
    const s = "[data-view-scope]";
    const style = document.createElement("style");
    style.textContent =
      mode === "textonly"
        ? `${s}, ${s} *, ${s} *::before, ${s} *::after { background: transparent !important; border-color: transparent !important; outline-color: transparent !important; box-shadow: none !important }
           ${s} { background: ${base} !important }
           ${s} :is(svg, img, video, canvas, picture, iframe, input[type=checkbox], input[type=radio], [role=switch], [role=checkbox], [role=radio]) { visibility: hidden !important }`
        : `${s}, ${s} *, ${s} *::before, ${s} *::after { border-color: transparent !important; outline-color: transparent !important; box-shadow: none !important }
           ${s} hr { visibility: hidden !important }`;
    target.setAttribute("data-view-scope", "");
    document.head.appendChild(style);
    const count = { recolored: 0, dividers: 0 };
    if (mode === "textonly") {
      // Text that only showed on its fill, such as a primary button's label, takes the page's ink.
      const light = (c) => rgba(c).slice(0, 3).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ink = getComputedStyle(page ? document.body : target).color;
      const walker = document.createTreeWalker(page ? document.body : target, NodeFilter.SHOW_TEXT);
      const done = new Set();
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const el = t.parentElement;
        if (!t.textContent.trim() || !el || done.has(el)) continue;
        done.add(el);
        if (Math.abs(light(getComputedStyle(el).color) - light(base)) < 64) put(el, "color", ink), count.recolored++;
      }
    } else
      for (const el of els) {
        // An empty filled strip 1 or 2px thick is a divider.
        const r = el.getBoundingClientRect();
        if (!el.childElementCount && !el.textContent.trim() && rgba(getComputedStyle(el).backgroundColor)[3] > 0 && Math.min(r.width, r.height) <= 2 && Math.max(r.width, r.height) > 8)
          put(el, "visibility", "hidden"), count.dividers++;
      }
    window.__viewClear = () => {
      style.remove();
      target.removeAttribute("data-view-scope");
      for (const [el, prop, value, priority] of saved.reverse()) value ? el.style.setProperty(prop, value, priority) : el.style.removeProperty(prop);
    };
    const { recolored, dividers } = count;
    return JSON.stringify({ view: mode, target: name(target), ...(mode === "textonly" ? { recolored } : { lines, dividers }) });
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
        if (!el.parentElement.closest("svg")) add(r, `background:#9a9a9a;border-radius:${cs.borderRadius}`), n.media++;
        continue;
      }
      const fill = rgba(cs.backgroundColor)[3] > 5;
      const line = ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
      const ring = cs.boxShadow !== "none" && cs.boxShadow.split(/,(?![^(]*\))/).some((l) => rgba(l.match(/[a-z]+\([^)]*\)|#\w+/)?.[0] || "#000")[3] > 0);
      if (fill || line || ring) {
        add(r, `background:${fill ? grey(cs.backgroundColor) : "transparent"};${line || ring ? "outline:1px solid #b4b4b4;outline-offset:-1px;" : ""}border-radius:${cs.borderRadius}`);
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
        add({ left: r.left, top: r.top + (r.height - h) / 2, width: r.width, height: h }, `background:${grey(cs.color)};border-radius:2px`);
      } else add({ left: r.left - 1, top: r.top, width: r.width + 2, height: r.height + 3 }, `background:${backdrop(el)}`); // 3px more covers an underline
      n.textLines++;
    }
  }
  if (mode === "notext") {
    for (const el of els) {
      if (!el.matches?.("input, textarea, select")) continue;
      const r = el.getBoundingClientRect();
      if (!inView(r) || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const [pl, pr, pt, pb] = ["Left", "Right", "Top", "Bottom"].map((s) => parseFloat(cs[`padding${s}`]) + parseFloat(cs[`border${s}Width`]));
      add({ left: r.left + pl, top: r.top + pt, width: r.width - pl - pr, height: r.height - pt - pb }, `background:${backdrop(el)}`);
    }
  }
  document.body.appendChild(o);
  window.__viewClear = () => document.getElementById("__view")?.remove();
  return JSON.stringify({ view: mode, target: name(target), ...n });
})();
