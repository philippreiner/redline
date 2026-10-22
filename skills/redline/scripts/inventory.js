// Style inventory: how many variants does the screen use?
// Counts every font family, size, weight, text color, background, radius,
// line (border weight and color), shadow, icon (rendered size and stroke),
// and flex or grid gap in the layer (window.__axesLayer, else the last open
// dialog or sheet, else the main column; window.__axesLayer = document.body
// for the whole page), plus button and control variants (one variant per
// distinct height, fill, ink, line, radius, and type). Access: text below
// WCAG AA contrast, controls without an accessible name, and targets under
// 24px. Covers the whole layer, scrolled out of view too. Each list holds
// [value, count, sample]; a value used once or twice is likely a one-off.
// Returns JSON. No overlay.
(() => {
  const set = window.__axesLayer;
  const layer =
    (typeof set === "string" ? document.querySelector(set) : set) ||
    [...document.querySelectorAll('dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"], [data-slot="sheet-content"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .pop() ||
    document.querySelector('main, [role="main"], [data-slot="sidebar-inset"]') ||
    document.body;
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  const hex = (c) => {
    const [r, g, b, a] = rgba(c);
    return `#${[r, g, b, ...(a < 255 ? [a] : [])].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  };
  const visible = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect(); // a 1px box is visually hidden text
    return (r.width > 1 || r.height > 1) && !el.closest("#__axes, #__view");
  };
  const sample = (el) => (el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || `${el.tagName.toLowerCase()}.${el.classList[0] || ""}`).trim().replace(/\s+/g, " ").slice(0, 32);
  const lists = {};
  const tally = (list, value, el) => {
    const m = (lists[list] ||= new Map());
    const e = m.get(value) || [value, 0, sample(el)];
    e[1]++;
    m.set(value, e);
  };

  // Luminance and contrast against the fills behind the text, composited over white.
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const over = (top, under) => under.map((v, i) => top[i] * (top[3] / 255) + v * (1 - top[3] / 255));
  const backdrop = (el) => {
    const stack = [];
    for (let n = el; n && stack.at(-1)?.[3] !== 255; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3]) stack.push(c);
    }
    return stack.reverse().reduce((under, c) => over(c, under), [255, 255, 255]);
  };
  const low = [];

  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  const textEls = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) if (t.textContent.trim() && t.parentElement) textEls.add(t.parentElement);
  for (const el of textEls) {
    // Separators such as "/" and "·" are decoration, not text styles.
    if (!visible(el) || !el.getBoundingClientRect().width || !/[\p{L}\p{N}–—-]/u.test(el.textContent)) continue;
    const cs = getComputedStyle(el);
    tally("fontFamilies", cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), el);
    tally("fontSizes", cs.fontSize, el);
    tally("fontWeights", cs.fontWeight, el);
    // Ink on a filled control is that control's role, not another text color.
    const control = el.closest("button, [role=button]");
    if (!control || rgba(getComputedStyle(control).backgroundColor)[3] < 200) tally("textColors", hex(cs.color), el);
    if (el.closest("[disabled], [aria-disabled=true]")) continue;
    const bg = backdrop(el);
    const fg = over(rgba(cs.color), bg);
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)} ${hex(cs.color)} on ${hex(`rgb(${bg.map(Math.round)})`)}: ${sample(el)}`);
  }

  const BUTTON = "button, [role=button], input[type=button], input[type=submit], a[href][class*=btn], a[href][class*=button]";
  const CONTROL = "input:not([type=hidden], [type=button], [type=submit]), select, textarea, [role=combobox], [role=switch], [role=checkbox], [role=radio], [role=slider]";
  let elements = 0;
  const unnamed = [];
  const targets = [];
  for (const el of [layer, ...layer.querySelectorAll("*")]) {
    if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || !visible(el)) continue;
    elements++;
    const cs = getComputedStyle(el);
    const fill = rgba(cs.backgroundColor)[3] > 0;
    const line = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none" && rgba(cs.borderTopColor)[3] > 0;
    // Drop the transparent layers utility frameworks leave in every shadow.
    const shadow = cs.boxShadow === "none" ? "" : cs.boxShadow.replace(/(rgba?|oklch|oklab|lab|lch|color)\([^)]*\)/g, (c) => hex(c)).split(/,\s*(?=#)/).filter((l) => !/^#[0-9a-f]{6}00 /.test(l)).join(", ");
    if (fill) tally("backgrounds", hex(cs.backgroundColor), el);
    if ((fill || line || shadow) && cs.borderRadius !== "0px") tally("radii", cs.borderRadius, el);
    if (shadow) tally("shadows", shadow, el);
    if (/flex|grid/.test(cs.display) && cs.gap !== "normal" && cs.gap !== "0px") tally("gaps", cs.gap, el);
    const sides = ["Top", "Right", "Bottom", "Left"].filter((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && rgba(cs[`border${s}Color`])[3] > 0);
    for (const l of new Set(sides.map((s) => `${cs[`border${s}Width`]} ${hex(cs[`border${s}Color`])}`))) tally("lines", l, el);
    // An icon's stroke renders scaled by its size over its viewBox.
    if (el instanceof SVGSVGElement && !el.parentElement.closest("svg")) {
      const stroke = cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0 ? `stroke ${((parseFloat(cs.strokeWidth) * r.width) / (el.viewBox.baseVal?.width || r.width)).toFixed(1)}` : "fill";
      tally("icons", `${Math.round(r.width)}x${Math.round(r.height)} ${stroke}`, el.closest("button, a, [role], li, label") || el.parentElement);
    }
    const kind = el.matches(CONTROL) ? "controls" : el.matches(BUTTON) ? "buttons" : null;
    if (kind) {
      const edge = line ? `line ${hex(cs.borderTopColor)}` : shadow ? "ring" : "flat";
      tally(kind, `${el.getAttribute("role") || (el.tagName === "INPUT" ? el.type : el.tagName.toLowerCase())} h${Math.round(r.height)} ${fill ? hex(cs.backgroundColor) : "clear"} ${hex(cs.color)} ${edge} r${cs.borderRadius} ${cs.fontSize}/${cs.fontWeight}`, el);
    }
    if (kind || el.matches("a[href]")) {
      // A label element names the control and widens its target.
      const label = el.labels?.length || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest("label");
      const named = el.innerText?.trim() || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title") || el.getAttribute("placeholder") || el.querySelector("svg title")?.textContent || (el.matches("input[type=button], input[type=submit]") && el.value) || label;
      const icon = [...(el.querySelector("svg")?.classList || [])].find((c) => /^(lucide|ph|icon|tabler|heroicons?)-/.test(c));
      if (!named) unnamed.push(icon || sample(el));
      if (cs.display !== "inline") targets.push({ el, r, small: (r.width < 24 || r.height < 24) && !label, name: `${Math.round(r.width)}x${Math.round(r.height)} ${named ? sample(el) : icon || sample(el)}` });
    }
  }

  // WCAG 2.5.8: a target under 24px passes when a 24px circle on its center touches no other target.
  const center = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const gap = ([x, y], r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
  const small = targets
    .filter((t) => t.small && targets.some((o) => o !== t && !o.el.contains(t.el) && !t.el.contains(o.el) && (o.small ? Math.hypot(...center(t.r).map((v, i) => v - center(o.r)[i])) < 24 : gap(center(t.r), o.r) < 12)))
    .map((t) => t.name);

  // Tokens: every custom property in the page's stylesheets, resolved on a probe to a color or a length.
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
  for (const el of [document.documentElement, document.body]) for (const n of getComputedStyle(el)) if (n.startsWith("--")) names.add(n);
  const host = document.body.appendChild(document.createElement("div"));
  host.style.cssText = "position:absolute;visibility:hidden;color:rgb(1, 2, 3);font-size:77px;width:1234px";
  const probe = host.appendChild(document.createElement("div"));
  const tokenColors = new Set();
  const tokenLengths = new Set();
  for (const n of names) {
    probe.style.cssText = `color:var(${n});font-size:var(${n});width:var(${n})`;
    const cs = getComputedStyle(probe);
    if (cs.color !== "rgb(1, 2, 3)") tokenColors.add(hex(cs.color).slice(0, 7));
    if (cs.fontSize !== "77px") tokenLengths.add(cs.fontSize);
    if (cs.width !== "1234px") tokenLengths.add(cs.width);
  }
  host.remove();
  // A value off the tokens is a raw value; a color matches its token whatever its opacity.
  const onToken = {
    textColors: (v) => tokenColors.has(v.slice(0, 7)),
    backgrounds: (v) => tokenColors.has(v.slice(0, 7)),
    fontSizes: (v) => tokenLengths.has(v),
    radii: (v) => v.split(" ").every((x) => tokenLengths.has(x) || x === "0px" || x.endsWith("%") || parseFloat(x) >= 999),
  };
  const raw = names.size ? Object.fromEntries(Object.entries(onToken).map(([k, f]) => [k, lists[k] ? [...lists[k].keys()].filter((v) => !f(v)) : []])) : null;
  // Gaps off a 4px grid.
  const offGrid = lists.gaps ? [...lists.gaps.keys()].filter((v) => v.split(" ").some((x) => parseFloat(x) % 4)) : [];

  const out = Object.fromEntries(Object.entries(lists).map(([k, m]) => [k, [...m.values()].sort((a, b) => b[1] - a[1])]));
  return JSON.stringify({
    layer: layer.getAttribute("data-slot") || layer.getAttribute("role") || layer.tagName.toLowerCase(),
    elements,
    distinct: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])),
    // With tokens, a value used once that is a token is a deliberate use of the system, not a one-off.
    oneOffs: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.filter(([val, n]) => n <= 2 && !(raw && onToken[k]?.(val))).length])),
    lowContrast: low.slice(0, 20),
    tokens: names.size,
    offToken: raw && Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.length])),
    offTokenValues: raw,
    offGrid,
    lowContrastCount: low.length,
    unnamedCount: unnamed.length,
    unnamed: unnamed.slice(0, 20),
    smallTargetCount: small.length,
    smallTargets: small.slice(0, 20),
    ...out,
  });
})();
