# Dragon Theming System — Design

Date: 2026-07-07

## Overview

Each selectable dragon carries an **ambience theme** — a bundle of palette,
UI icons, and food icons. Selecting a dragon changes the whole app's look.
A neutral **default** theme provides the base; each dragon's theme overrides
only what differs and falls back to the default for the rest.

Today there is one dragon (`ember`, frost aesthetic). This iteration builds the
theming **engine** and wires the frost theme. It does NOT build a new selection
screen — `chooseDragon.js` already iterates `dragons[]` and renders the grid, so
future dragons appear automatically.

## Goals

- A theme = `{ palette, icons, foods }`, resolved by merging a dragon's theme
  over the `default` theme (per-section shallow merge).
- Palette applied at runtime via CSS custom properties.
- UI icons and food icons rendered through the existing `art()` helper, with the
  default emoji as the fallback when a themed image fails to load.
- Dragon growth art stays on the dragon object (intrinsic to the creature).
- Adding a future dragon = add its data + a theme object; no engine changes.

## Non-Goals

- No new dragon-selection UI (the existing `chooseDragon.js` already handles N).
- No per-level palette changes (theme is per-dragon, not per-level).
- No user-facing theme switcher independent of dragon choice.
- Renaming the `ember` dragon (its fire-y name clashing with frost is noted as a
  follow-up decision, out of scope here).

## Architecture

Two new single-purpose modules:

### `src/data/themes.js` — pure data

```js
export const themes = {
  default: {
    palette: {
      'bg': '#1b1030', 'fg': '#ffffff',
      'accent': '#6c3', 'accent-fg': '#06210a',
      'xp-bar': '#33224d', 'xp-fill': '#6cf',
      'card': '#2c1c4a', 'back-btn': '#9af',
    },
    icons: { coin: '🪙', shop: '🍎', settings: '⚙️', mute: '🔇', break: '☕' },
    foods: {}, // no overrides → shop uses food.icon
  },
  frost: {
    palette: { 'bg': '#0e1630', 'accent': '#3aa0ff', 'accent-fg': '#04121f',
               'xp-fill': '#7fdfff', 'card': '#16233f', 'back-btn': '#9cf' },
    icons: {
      coin: '/art/icons/coin.webp', shop: '/art/icons/shop.webp',
      settings: '/art/icons/settings.webp', mute: '/art/icons/mute.webp',
      break: '/art/icons/break.webp',
    },
    foods: {
      apple: '/art/foods/apple.webp', meat: '/art/foods/meat.webp',
      cake: '/art/foods/cake.webp',
    },
  },
};
```

Palette keys are the CSS variable names (without `--`) to avoid case conversion.

### `src/core/theme.js` — logic (unit-tested, no DOM data)

```js
import { themes } from '../data/themes.js';

// Merge a dragon's theme over the default; unspecified sections fall back.
export const resolveTheme = (themeId) => {
  const base = themes.default;
  const t = themes[themeId] ?? {};
  return {
    palette: { ...base.palette, ...(t.palette ?? {}) },
    icons:   { ...base.icons,   ...(t.icons ?? {}) },
    foods:   { ...base.foods,   ...(t.foods ?? {}) },
  };
};

// Apply palette values as CSS custom properties on the root element.
export const applyPalette = (palette, root = document.documentElement) => {
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--${key}`, value);
  }
};
```

`resolveTheme` returns the ACTIVE theme. The default emoji for any icon slot is
always available as `themes.default.icons[key]`, used as the `art()` fallback.

## Data Flow

1. `src/data/dragons.js`: `ember` gains `themeId: 'frost'`. Level images unchanged.
2. `src/app.js`, once `state.dragonId` is set:
   ```js
   const dragon = getDragon(state.dragonId);
   const theme = resolveTheme(dragon.themeId);
   applyPalette(theme.palette);
   renderMainScreen({ ..., theme });
   ```
   `onShop` passes `theme` into `renderShopScreen`.
3. Screens render icons via the existing helper with default-emoji fallback:
   - UI icon: `art(theme.icons.coin, 'coins', themes.default.icons.coin)`
   - Food icon: `art(theme.foods[food.id] ?? food.icon, food.name, food.fallback)`

The `chooseDragon` screen renders BEFORE a dragon is picked (no `dragonId`), so it
shows under the default palette and uses each dragon's own level-0 art. No theme
threading needed there.

## CSS Strategy

Convert hardcoded hex in `src/styles.css` to CSS custom properties, defined in
`:root` with the current values (so `:root` == the default theme):

```css
:root {
  --bg:#1b1030; --fg:#fff; --accent:#6c3; --accent-fg:#06210a;
  --xp-bar:#33224d; --xp-fill:#6cf; --card:#2c1c4a; --back-btn:#9af;
}
```

Replace usages: `background: var(--bg)`, `.big-btn { background: var(--accent); color: var(--accent-fg); }`, etc. If JS never calls `applyPalette`, the app looks identical to today. `applyPalette` overrides these on `document.documentElement` per theme.

**UI icon sizing:** emojis are sized by `font-size`; `<img>` icons need a fixed box.
Add `.icon-btn .art-img { width: 1.8rem; height: 1.8rem; }` and give the coin
counter icon a comparable fixed size. The coin counter (`🪙 30` text today)
becomes an icon element + number span.

**Coin appears in two places** — the top-bar coin counter (`mainScreen.js`) and
each food-card price (`shopScreen.js`). Both render the coin through
`theme.icons.coin` with the default emoji as fallback, so a themed coin stays
consistent across the app.

## Files Touched

New:
- `src/data/themes.js`
- `src/core/theme.js`
- `src/core/theme.test.js`

Edited:
- `src/data/dragons.js` — add `themeId: 'frost'`
- `src/styles.css` — hex → CSS custom properties
- `src/app.js` — resolve theme, apply palette, pass `theme` to screens
- `src/ui/mainScreen.js` — UI icons via `theme.icons` + `art()`
- `src/ui/shopScreen.js` — food icons via `theme.foods` + `art()`
- `src/ui/mainScreen.test.js`, `src/ui/shopScreen.test.js` — updated icon assertions

## Testing

- `theme.test.js`:
  - `resolveTheme('frost')` returns frost overrides AND default values for
    unspecified palette keys (fallback works).
  - `resolveTheme('nope')` / `resolveTheme(undefined)` returns the default theme.
  - `applyPalette` sets `--bg` etc. on a fake root element.
- Updated screen tests assert themed icons render (img `src` for a themed dragon,
  emoji fallback when the slot is default).

## Open Follow-ups (not this change)

- Rename `ember` (a fire name) to a frost-appropriate name — pending user choice.
- Generate and drop the frost art assets (dragon, foods, icons) via the prompt
  pack in `docs/art-prompts.md`. The engine renders emoji fallbacks until then.
- App launcher icons (`icon-192/512.png`) re-theme — optional, later.
