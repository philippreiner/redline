# Slop

The tells of a screen nobody designed: what a model or a template produces by default. Each line pairs the tell with its fix. Use it to triage a screen before work starts and to check it at the end. `count.js` `slop` lists the tells a script can see; the rest need your eyes.

Adapted from [unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0.

## Surfaces and color

- A hue-to-hue gradient on a background, card, button, or the active item → one neutral surface; the accent only where it means something.
- Gradient text in a heading, number, or logo → solid text in its ink.
- A colored glow or colored shadow → depth from a surface step and a hairline; a neutral shadow only on what floats.
- A color wash or blurred blob behind content → remove it.
- A neon or strong colored border → a hairline in the ink at low opacity.
- Many near-identical tints and opacities of one color → three inks from one neutral ramp.
- Everything highlighted, so nothing stands out → one accent, once or twice per screen.

## Type

- Headings at weight 700 to 900 → size and ink carry hierarchy; two weights.
- Uppercase labels with wide tracking ("PAID THIS MONTH") → sentence case at normal tracking.
- Negative tracking on small text, or a fashionable display serif set tight on every title because it looks designed → a face chosen for the character, tracking near zero below display sizes.
- Italic words for emphasis → plain text; let the sentence or the layout carry the weight.
- Numbers in mixed formats ("$48,210" beside "$124,860.40") → one format, tabular figures.

## Icons

- Emoji as icons, label decoration, or status → one line icon set, or nothing.
- A sparkle for anything AI → remove it, or a plain icon where it explains something.
- Icons in many sizes and colors → one size and stroke, in the ink of their text.

## Spacing

- One-off values (13, 7, 31) → steps of the scale, on the 4px grid.
- Rows of one list with different heights or gaps, sibling cards with different padding → one of each.
- A group closer to its neighbor than to its own items → smaller gaps inside groups than between them.

## Words

- A greeting as the title ("Welcome back, Anna! 👋") → the page or the period.
- Exclamation marks, hype words (supercharge, seamless, unlock, magic), "AI-powered" on everything → what the thing does, said plainly.
- A change without a reference ("+12%!!") → "+12% vs last month".
- Facts strung together with dots ("Press line 3 · Halle 2 · Werk Ingolstadt") → each fact its own quiet label, or the one that matters.
- Section numbers ("01 — Overview") → titles alone, unless the order is the content.
- Breadcrumbs or labels that read like code (`app / settings / users`, mono paths, `snake_case`) → the places' names in the user's words.
- Placeholder data ("$123,456", "[X]", "Lorem") → plausible values.

## Parts

- Glowing pills for counts, plans, or shortcuts → quiet text or a keycap.
- "New ✨", "PRO", "Beta 🚀" on many items → remove, or one quiet text badge.
- Everything a full pill, from search to cards → radius by size, nested ([foundations.md](foundations.md#lines-shapes-and-icons)).
- An icon in a tinted circle on every card, an eyebrow over every title, tags on everything → cut what does not carry information; a tag stays where it is a property people filter or act on.
- Containers with borders inside containers, a divider between every row → space groups first, then a tonal fill, a line only between fixed regions.
- Over-detailed parts: every row with meta, icons, badges, and a second line → the one primary text, one value, and one mark the row needs.
- Detailed diagrams, the more parts the worse → the simplest picture that answers the question, or a sentence.
- Sparklines or mini bars in every stat tile → the number, its label, and its comparison.
- Rainbow or glowing chart bars → one accent on what matters, the rest neutral.

## Motion

- Pulsing, pinging, or breathing elements that are not live → static.
- Cards that scale or jump on hover → a color or surface change.
- Everything flying in on load → at most one short entrance.

## Template look

Not slop, but what a cleaned-up screen falls back to when nobody decided: default grey, the default font, the old brand color on one button, and copy that would fit any product. The template check: swap the product's name for another's. If the screen still fits, push the direction (SKILL.md Start) harder in the words, the moments, and the signature.
