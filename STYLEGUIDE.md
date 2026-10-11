# Style Guide

The visual rules of the Inventar frontend, derived from `src/styles.css` and `src/app/app.css`.
New UI should look like it was always there: flat, boxy, monospace, few colors.

## Principles

1. **Monospace everywhere.** One typeface for all text, including inputs and buttons.
2. **Flat and rectangular.** Structure comes from 2px solid borders, not from shadows,
   gradients, or rounded corners.
3. **Few colors, used with a fixed role each.** Every color is a token on `:root`; no literal
   hex values in component CSS.
4. **Generous, even spacing.** rem-based, on a small set of steps.
5. **Plain layout.** Centered column, max 1400px, content stacks top to bottom.

## Color tokens

Defined in `src/styles.css`. Reference them via `var(--name)` only.

| Token         | Value       | Role                                                        |
|---------------|-------------|-------------------------------------------------------------|
| `--secondary` | `#ffffff`   | Page background; text on `--primary` fills                  |
| `--primary`   | `#7261a3ff` | Default text color, accent borders, input fill              |
| `--third`     | `#00171F`   | Structural borders (table, inputs), table header text       |
| `--success`   | `#63B995`   | Positive state (not used yet)                               |
| `--error`     | `#FE5F55`   | Errors, destructive actions (not used yet)                  |
| `--info`      | `#00A8E8`   | Neutral notices (not used yet)                              |

Contrast (WCAG 2.x, computed from the hex values):

- `--primary` on `--secondary` and `--secondary` on `--primary`: ~5.3:1, fine for body text.
- `--success`, `--error`, `--info` on white are all below 4.5:1 (~2.4–3:1). Use them as
  **fills or borders** with `--third` text on top, never as text color on the white page.

## Typography

- Family: `jetbrains-mono, monospace`, applied globally via `*` in `src/styles.css`. Don't set
  `font-family` in components.
- The font is self-hosted from `public/`; add no web-font CDNs.
- Emphasis through weight (`bold`), not through another typeface or color.
- Input text: `1.2rem`, bold. Other sizes use browser defaults (`h1` for the page title).

## Spacing

| Step      | Used for                                              |
|-----------|-------------------------------------------------------|
| `0.5rem`  | Inner padding of compact controls (inputs)            |
| `1rem`    | Vertical gap between blocks; horizontal gap of nav items |
| `1rem 2rem` | Padding of table cells and the header bar           |

Use logical properties (`margin-block`, `margin-inline`) like the existing CSS does.

## Borders

- Always `2px solid`. No other widths, no `dashed`/`dotted`, no `border-radius`.
- `--third` for borders that frame content (table, inputs, header row of a table).
- `--primary` for accent dividers (the header bar's bottom border).

## Components

**Header / nav** — horizontally centered flex row, no list bullets, `1rem` inline gap between
items, `1rem 2rem` padding, `2px solid var(--primary)` bottom border.

**Table** — full width, `border-collapse: collapse`, `2px solid var(--third)` frame. Cells
`1rem 2rem` padding, left-aligned. Header cells in `--third` with a `2px` bottom border in the
same color; body cells inherit `--primary`.

**Text input** — full width with `box-sizing: border-box`, `2px solid var(--third)` border,
`0.5rem` padding, `1rem` block margin, `--primary` fill, `--secondary` text, `1.2rem` bold.
Focus: `2px solid var(--third)` outline with `2px` offset — every focusable element needs a
visible focus state like this.
Always paired with a `<label for>`; give a German example as placeholder.

**Select / textarea** — same recipe as the text input (global in `src/styles.css`).
Textareas resize vertically only.

**Form field** — `<label>` (block) above the control; the field's error directly below it.
Required fields are marked with ` *` in the label and a `* Pflichtfeld` hint above the
submit button. Show errors once a field is touched or after a submit attempt, never on a
fresh form. Invalid controls get the `.invalid` class (border turns `--error`).

**Button** — `--primary` fill, `--secondary` bold text, `2px solid var(--third)` border,
`0.5rem 1rem` padding. `.danger` (destructive, e.g. "Entfernen"): `--error` fill with
`--third` text. Disabled: 60 % opacity. Keep submit buttons enabled while the form is invalid
(a disabled button doesn't say why); disable only while saving. The file input's picker
button uses the inverted look (`--secondary` fill, `--primary` text).

**Messages** — `.message.success` / `.message.error` for page-level feedback,
`.field-error` under a field: state-color fill, `--third` text, `2px solid var(--third)`
border, `0.5rem` padding. Use `role="status"` for success and `role="alert"` for errors.

**Nav links** — no underline; the active and hovered link get a `2px` `--primary` bottom
border and bold weight (`routerLinkActive="active"`).

**Confirmations** — destructive actions ask via the browser's `confirm()` with the item name
in German quotes: `„Kochtopf“ wirklich entfernen?`

## Utilities

- `.hidden { display: none; }` is global in `src/styles.css`. Reuse it instead of defining
  per-component hide classes.

## Content

- UI copy is German (`Übersicht`, `Hinzufügen`, `Suche`, `Anzahl`, …). Identifiers and CSS
  class names stay English.

## Where styles go

- Tokens, `@font-face`, global resets, utilities, and the shared control styles (inputs,
  selects, textareas, buttons, messages, field errors): `src/styles.css`.
- Everything else: the component's own stylesheet. The production build warns at 4 kB and
  fails at 8 kB per component stylesheet, so keep component CSS lean.
