# 1 Foundations

Every value on screen comes from the product's system, and fewer variants look calmer. Measure with `inventory.js`.

## Follow the system

- Match the existing look and feel: a new screen looks as if it was always part of the product. Study the library and three neighbor screens before styling.
- Find the token source first: the theme file, the CSS variables, the utility config. Take every color, size, space, radius, line, and shadow from it. A raw value in a component is a defect unless a comment says why it is needed; `inventory.js` `offTokenValues` lists them.
- A missing token: use the nearest one. Propose a new token only when two places need it.

## Few variants

Every extra size, weight, color, radius, line, or gap is one more thing the eye has to sort. Count them on the inventory; above a cap, fold the one-off into its neighbor.

| Kind | Cap |
| --- | --- |
| Font families | One for the interface, at most one more for display or code |
| Font sizes | About five on a page, three per region, two per row |
| Font weights | Two: regular and one emphasis |
| Text colors | Three inks (primary, secondary, muted) plus meaning colors |
| Radii | One family: control, box, and pill |
| Lines | One hairline weight and color, one stronger line for focus or the picked item |
| Shadows | One per depth level |
| Icons | One set and style, one size per text size |
| Gaps | The steps of one short spacing scale ([alignment.md](alignment.md#spacing-scale)) |
| Button variants | Primary, secondary, quiet, destructive; one height per context |

- A value used once is a one-off until proven otherwise.

## Type

- A short type scale with a role per step: meta, body, section title, page title, key figure. Neighbor steps differ clearly, about 1.2 times or more; 13 beside 14 looks like a mistake.
- Hierarchy comes from size, weight, and ink order; a new grey or a third weight is a new variant.
- Body text runs at a line height of about 1.4 to 1.5, titles tighter; prose holds 60 to 75 characters a line.

## Color

- Color carries meaning: state, health, category, the one primary action. Everything else stays neutral, chrome included.
- Each color and each mark means one thing everywhere: a check means done in every list.
- One accent for actions; status colors from one ramp.
- Every color meaning also shows as a word, an icon, or a shape.

## Lines, shapes, and icons

- Lines, icon strokes, and text stems look like one weight: a hairline border, icons whose stroke renders near the stem of the body text. A heavy icon beside light text, or a 2px border among 1px ones, looks like another product.
- Icon sizes follow text sizes: about 16 beside 13 to 14px text, 20 beside 16 to 18px. `inventory.js` `icons` lists each size with its rendered stroke.
- Radii nest: an inner radius is the outer radius minus the padding between them, or square.
- One button shape: one radius and one padding rule; height by context.

## Contrast

- Text meets WCAG AA: 4.5:1, or 3:1 at 24px and above (18.66px bold). Icons and control edges meet 3:1.
- Muted text that carries information still meets 4.5:1.
- `inventory.js` lists `lowContrast`; fix every entry that carries information.

## Dark mode

- Dark mirrors roles: each token has a dark twin, and every component takes its dark color from the twin.
- Depth in dark comes from lighter surfaces, not shadows.
- Check each changed screen once in dark: hairlines vanish, tinted fills turn muddy, logos on white glare.

## Numbers

From `inventory.js` on each changed screen.

| Number | Target |
| --- | --- |
| `offToken` per list | 0 where the project has tokens: every value comes from one |
| `oneOffs` per list | 0, or each one named with its reason |
| `distinct` per list | At or under its cap in [Few variants](#few-variants) |
| `lowContrastCount` | 0 |
