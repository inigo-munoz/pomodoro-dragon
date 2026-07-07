# Dragon Theming System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each dragon an ambience theme (palette + UI icons + food icons) that
overrides a shared default, so selecting a dragon re-skins the whole app.

**Architecture:** A pure `themes` data map keyed by theme id. `resolveTheme(id)`
shallow-merges a theme over `default` per section. `applyPalette` writes the
palette as CSS custom properties on the root element. UI/food icons render through
the existing `art()` helper with the default emoji as fallback. Dragon growth art
stays on the dragon object.

**Tech Stack:** Vanilla JS (ES modules), Vite, Vitest + jsdom, plain CSS.

## Global Constraints

- Each file ideally ≤ ~200 lines, clean architecture, single responsibility.
- DRY: no duplicated logic — shared icon rendering goes through one helper.
- TDD: failing test first, then minimal implementation.
- Conventional commits. No AI attribution / no Co-Authored-By trailer.
- Default look must stay pixel-identical when no theme override applies
  (`:root` CSS variables equal today's hardcoded colors).
- Test runner: `npm test -- --run`. Build: `npm run build`.

---

### Task 1: Theme data + `resolveTheme`

**Files:**
- Create: `src/data/themes.js`
- Create: `src/core/theme.js`
- Test: `src/core/theme.test.js`

**Interfaces:**
- Produces: `themes` (object with `default` and `frost` keys, each
  `{ palette, icons, foods }`); `resolveTheme(themeId: string) => { palette, icons, foods }`.

- [ ] **Step 1: Write the failing test**

Create `src/core/theme.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { resolveTheme } from './theme.js';

describe('resolveTheme', () => {
  it('returns the default theme for an unknown or missing id', () => {
    expect(resolveTheme('nope').icons.coin).toBe('🪙');
    expect(resolveTheme(undefined).palette.bg).toBe('#1b1030');
  });

  it('overrides only what a theme defines and falls back for the rest', () => {
    const frost = resolveTheme('frost');
    expect(frost.icons.coin).toBe('/art/icons/coin.webp'); // overridden
    expect(frost.palette.bg).toBe('#0e1630');              // overridden
    expect(frost.palette.fg).toBe('#ffffff');              // falls back to default
  });

  it('exposes food overrides keyed by food id', () => {
    expect(resolveTheme('frost').foods.apple).toBe('/art/foods/apple.webp');
    expect(resolveTheme('default').foods.apple).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/core/theme.test.js`
Expected: FAIL — cannot import `./theme.js` / `resolveTheme is not a function`.

- [ ] **Step 3: Create the theme data**

Create `src/data/themes.js`:
```js
export const themes = {
  default: {
    palette: {
      bg: '#1b1030',
      fg: '#ffffff',
      accent: '#66cc33',
      'accent-fg': '#06210a',
      'xp-bar': '#33224d',
      'xp-fill': '#66ccff',
      card: '#2c1c4a',
      'back-btn': '#99aaff',
    },
    icons: { coin: '🪙', shop: '🍎', settings: '⚙️', mute: '🔇', break: '☕' },
    foods: {},
  },
  frost: {
    palette: {
      bg: '#0e1630',
      accent: '#3aa0ff',
      'accent-fg': '#04121f',
      'xp-fill': '#7fdfff',
      card: '#16233f',
      'back-btn': '#99ccff',
    },
    icons: {
      coin: '/art/icons/coin.webp',
      shop: '/art/icons/shop.webp',
      settings: '/art/icons/settings.webp',
      mute: '/art/icons/mute.webp',
      break: '/art/icons/break.webp',
    },
    foods: {
      apple: '/art/foods/apple.webp',
      meat: '/art/foods/meat.webp',
      cake: '/art/foods/cake.webp',
    },
  },
};
```

- [ ] **Step 4: Implement `resolveTheme`**

Create `src/core/theme.js`:
```js
import { themes } from '../data/themes.js';

// Merge a theme over the default, section by section. Anything a theme does
// not define falls back to the default theme.
export const resolveTheme = (themeId) => {
  const base = themes.default;
  const override = themes[themeId] ?? {};
  return {
    palette: { ...base.palette, ...(override.palette ?? {}) },
    icons: { ...base.icons, ...(override.icons ?? {}) },
    foods: { ...base.foods, ...(override.foods ?? {}) },
  };
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run src/core/theme.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/data/themes.js src/core/theme.js src/core/theme.test.js
git commit -m "feat: add theme data and resolveTheme merge"
```

---

### Task 2: `applyPalette` + CSS custom properties

**Files:**
- Modify: `src/core/theme.js` (add `applyPalette`)
- Modify: `src/core/theme.test.js` (add applyPalette tests)
- Modify: `src/styles.css` (hex → CSS variables + icon sizing)

**Interfaces:**
- Consumes: nothing new.
- Produces: `applyPalette(palette: object, root?: HTMLElement) => void` — sets
  `--<key>` custom properties on `root` (default `document.documentElement`).

- [ ] **Step 1: Write the failing test**

Append to `src/core/theme.test.js`:
```js
import { resolveTheme, applyPalette } from './theme.js';

describe('applyPalette', () => {
  it('sets each palette entry as a CSS custom property on the root', () => {
    const root = document.createElement('div');
    applyPalette({ bg: '#123456', 'accent-fg': '#abcdef' }, root);
    expect(root.style.getPropertyValue('--bg')).toBe('#123456');
    expect(root.style.getPropertyValue('--accent-fg')).toBe('#abcdef');
  });
});
```
(Update the existing top import line from `{ resolveTheme }` to
`{ resolveTheme, applyPalette }`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/core/theme.test.js`
Expected: FAIL — `applyPalette is not a function`.

- [ ] **Step 3: Implement `applyPalette`**

Append to `src/core/theme.js`:
```js
// Write palette entries as CSS custom properties (e.g. { bg } -> --bg).
export const applyPalette = (palette, root = document.documentElement) => {
  for (const [key, value] of Object.entries(palette)) {
    root.style.setProperty(`--${key}`, value);
  }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/core/theme.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Convert `styles.css` to CSS variables**

At the top of `src/styles.css`, add a `:root` block (values equal today's colors):
```css
:root {
  --bg: #1b1030;
  --fg: #ffffff;
  --accent: #66cc33;
  --accent-fg: #06210a;
  --xp-bar: #33224d;
  --xp-fill: #66ccff;
  --card: #2c1c4a;
  --back-btn: #99aaff;
}
```
Then replace the hardcoded colors with the variables:
- `body`: `background: #1b1030;` → `background: var(--bg);` and `color: #fff;` → `color: var(--fg);`
- `.xp-bar`: `background: #33224d;` → `background: var(--xp-bar);`
- `.xp-fill`: `background: #6cf;` → `background: var(--xp-fill);`
- `.big-btn`: `background: #6c3;` → `background: var(--accent);` and `color: #06210a;` → `color: var(--accent-fg);`
- `.food-card, .dragon-choice`: `background: #2c1c4a;` → `background: var(--card);` and `color: #fff;` → `color: var(--fg);`
- `.preset, .step-row button`: `background: #2c1c4a;` → `background: var(--card);` and `color: #fff;` → `color: var(--fg);`
- `.preset.active`: `background: #6c3;` → `background: var(--accent);` and `color: #06210a;` → `color: var(--accent-fg);`
- `.back-btn`: `color: #9af;` → `color: var(--back-btn);`

- [ ] **Step 6: Add icon-sizing rules**

In the `/* --- art elements --- */` section of `src/styles.css`, add:
```css
.icon-btn .art-img { width: 1.8rem; height: 1.8rem; }
.coin-icon, .price-coin { display: inline-flex; vertical-align: -0.15em; }
.coin-icon .art-img, .price-coin .art-img { width: 1.1em; height: 1.1em; }
```

- [ ] **Step 7: Verify the build and full suite**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS, build succeeds. (Default look unchanged — variables
equal the old hex.)

- [ ] **Step 8: Commit**

```bash
git add src/core/theme.js src/core/theme.test.js src/styles.css
git commit -m "feat: apply theme palette via CSS custom properties"
```

---

### Task 3: `themedIcon` shared helper

**Files:**
- Create: `src/ui/themedIcon.js`
- Test: `src/ui/themedIcon.test.js`

**Interfaces:**
- Consumes: `art` from `./art.js`, `themes` from `../data/themes.js`.
- Produces: `themedIcon(theme, key) => HTMLElement` — renders the active theme's
  icon for `key` via `art()`, using the default theme's emoji as the fallback.
  Works when `theme` is `undefined` (falls back to the default emoji).

- [ ] **Step 1: Write the failing test**

Create `src/ui/themedIcon.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { themedIcon } from './themedIcon.js';

describe('themedIcon', () => {
  it('renders the default emoji when no theme is given', () => {
    const el = themedIcon(undefined, 'coin');
    expect(el.classList.contains('art-emoji')).toBe(true);
    expect(el.textContent).toBe('🪙');
  });

  it('renders an image when the theme provides an icon path', () => {
    const theme = { icons: { coin: '/art/icons/coin.webp' } };
    const el = themedIcon(theme, 'coin');
    expect(el.tagName).toBe('IMG');
    expect(el.getAttribute('src')).toBe('/art/icons/coin.webp');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/ui/themedIcon.test.js`
Expected: FAIL — cannot import `./themedIcon.js`.

- [ ] **Step 3: Implement `themedIcon`**

Create `src/ui/themedIcon.js`:
```js
import { art } from './art.js';
import { themes } from '../data/themes.js';

// Render the active theme's UI icon for `key`, falling back to the default
// theme's emoji both as the value (no theme) and as the <img> error fallback.
export const themedIcon = (theme, key) => {
  const fallback = themes.default.icons[key];
  return art(theme?.icons?.[key] ?? fallback, key, fallback);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/ui/themedIcon.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/themedIcon.js src/ui/themedIcon.test.js
git commit -m "feat: add themedIcon helper for theme-aware UI icons"
```

---

### Task 4: Themed UI icons in the main screen

**Files:**
- Modify: `src/ui/mainScreen.js`
- Modify: `src/ui/mainScreen.test.js`

**Interfaces:**
- Consumes: `themedIcon(theme, key)` from `./themedIcon.js`; `ctx.theme` (the
  resolved theme, optional — degrades to default emojis when absent).
- Produces: main screen DOM whose coin counter, mute/shop/settings buttons and
  Break button render icons from `theme`.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/mainScreen.test.js` inside the `describe('main screen', ...)` block:
```js
  it('renders themed UI icons from the theme', () => {
    const theme = { icons: { coin: '/art/icons/coin.webp', shop: '/art/icons/shop.webp',
      settings: '/art/icons/settings.webp', mute: '/art/icons/mute.webp', break: '☕' }, foods: {} };
    const el = renderMainScreen({
      ...base, theme, timerState: { mode: 'work', remaining: 900, running: false },
    });
    const shopIcon = el.querySelector('[data-action="shop"] img.art-img');
    expect(shopIcon).not.toBeNull();
    expect(shopIcon.getAttribute('src')).toBe('/art/icons/shop.webp');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/ui/mainScreen.test.js`
Expected: FAIL — `[data-action="shop"] img.art-img` is null (still a hardcoded emoji).

- [ ] **Step 3: Rewrite the icon rendering in `mainScreen.js`**

Replace the imports at the top of `src/ui/mainScreen.js`:
```js
import { currentLevel, levelProgress } from '../core/dragon.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';
```

Destructure `theme` from `ctx` (line ~11):
```js
  const { state, dragon, timerState, theme } = ctx;
```

Change the coin-counter, mute, shop and settings markup to empty holders. Replace
the `section.innerHTML = ...` assignment's coin/mute/nav lines so they read:
```js
      `<span class="coin-counter"><span class="coin-icon"></span> ${state.coins}</span>` +
      `<span class="mode-label">${timerState.mode === 'work' ? 'Work' : 'Break'}</span>` +
      `<button class="icon-btn" data-action="mute"></button>` +
```
and the footer:
```js
      `<button class="icon-btn" data-action="shop"></button>` +
      `<button class="icon-btn" data-action="settings"></button>` +
```

After `section.querySelector('.dragon-stage').appendChild(dragonArt);`, append the
themed icons:
```js
  section.querySelector('.coin-icon').appendChild(themedIcon(theme, 'coin'));
  section.querySelector('[data-action="mute"]').appendChild(themedIcon(theme, 'mute'));
  section.querySelector('[data-action="shop"]').appendChild(themedIcon(theme, 'shop'));
  section.querySelector('[data-action="settings"]').appendChild(themedIcon(theme, 'settings'));
```

Update the Break control to use a themed icon. Change the `justFinishedWork` branch:
```js
  if (justFinishedWork) {
    controls.appendChild(button('Break', 'break', ctx.onBreak, 'primary', themedIcon(theme, 'break')));
  } else if (timerState.running) {
```

Extend the `button` helper to accept an optional leading icon node:
```js
const button = (label, action, handler, cls = '', iconNode = null) => {
  const b = document.createElement('button');
  b.className = `big-btn ${cls}`.trim();
  b.dataset.action = action;
  b.textContent = label;
  if (iconNode) b.prepend(iconNode, ' ');
  b.addEventListener('click', handler);
  return b;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/ui/mainScreen.test.js`
Expected: PASS — the new themed-icon test AND the existing tests (which pass no
`theme` and therefore get default emojis, so `.coin-counter` still contains the
coin count text).

- [ ] **Step 5: Commit**

```bash
git add src/ui/mainScreen.js src/ui/mainScreen.test.js
git commit -m "feat: render main-screen UI icons from the active theme"
```

---

### Task 5: Themed food + coin icons in the shop

**Files:**
- Modify: `src/ui/shopScreen.js`
- Modify: `src/ui/shopScreen.test.js`

**Interfaces:**
- Consumes: `themedIcon(theme, key)` from `./themedIcon.js`; `theme` param
  (optional — food icons fall back to `food.icon`, coin to the default emoji).
- Produces: shop DOM whose food icons come from `theme.foods[food.id]` (fallback
  `food.icon`) and whose price coin comes from `theme`.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/shopScreen.test.js`:
```js
import { themedIcon } from './themedIcon.js'; // (ensure themedIcon import exists if referenced)

it('renders themed food icons when a theme provides them', () => {
  const theme = { icons: { coin: '/art/icons/coin.webp' },
    foods: { apple: '/art/foods/apple.webp' } };
  const el = renderShopScreen({
    state: { coins: 100 }, foods, theme, onBuy: () => {}, onBack: () => {},
  });
  const appleIcon = el.querySelector('[data-food="apple"] .food-icon img.art-img');
  expect(appleIcon).not.toBeNull();
  expect(appleIcon.getAttribute('src')).toBe('/art/foods/apple.webp');
});
```
(The `themedIcon` import line is optional — include only if your editor flags an
unused symbol; the test itself does not call it directly.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/ui/shopScreen.test.js`
Expected: FAIL — the apple icon is still the emoji from `food.icon`, so
`.food-icon img.art-img` is null.

- [ ] **Step 3: Update `shopScreen.js`**

Replace the imports at the top of `src/ui/shopScreen.js`:
```js
import { canAfford } from '../core/wallet.js';
import { backButton } from './backButton.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';
```

Add `theme` to the destructured params:
```js
export const renderShopScreen = ({ state, foods, theme, onBuy, onBack }) => {
```

Change the price markup to hold a coin icon, and swap the food-icon source. In the
`card.innerHTML` template, replace the price line:
```js
      `<span class="food-price"><span class="price-coin"></span> ${food.price}</span>` +
```

Replace the food-icon append line:
```js
    const iconValue = theme?.foods?.[food.id] ?? food.icon;
    card.querySelector('.food-icon').appendChild(art(iconValue, food.name, food.fallback));
    card.querySelector('.price-coin').appendChild(themedIcon(theme, 'coin'));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/ui/shopScreen.test.js`
Expected: PASS — new themed-food test plus the existing dim/buy tests (they pass no
`theme`, so food icons stay `food.icon` emojis and the coin is the default emoji).

- [ ] **Step 5: Commit**

```bash
git add src/ui/shopScreen.js src/ui/shopScreen.test.js
git commit -m "feat: render shop food and coin icons from the active theme"
```

---

### Task 6: Wire the theme into the app

**Files:**
- Modify: `src/data/dragons.js` (add `themeId`)
- Modify: `src/app.js` (resolve theme, apply palette, pass `theme` to screens)

**Interfaces:**
- Consumes: `resolveTheme`, `applyPalette` from `./core/theme.js`;
  `dragon.themeId`.
- Produces: the running app resolves the selected dragon's theme, applies its
  palette, and passes `theme` to the main and shop screens.

- [ ] **Step 1: Add `themeId` to the dragon**

In `src/data/dragons.js`, add `themeId: 'frost'` to the `ember` object (top level,
alongside `id`/`name`):
```js
  {
    id: 'ember',
    name: 'Ember',
    themeId: 'frost',
    levels: [
```

- [ ] **Step 2: Import the theme functions in `app.js`**

Add to the imports in `src/app.js`:
```js
import { resolveTheme, applyPalette } from './core/theme.js';
```

- [ ] **Step 3: Resolve + apply + pass the theme in `render`**

In `src/app.js`, in the `render` function, after `const dragon = getDragon(state.dragonId);`:
```js
    const theme = resolveTheme(dragon.themeId);
    applyPalette(theme.palette);
    screens.set('main', renderMainScreen({
      state, dragon, timerState, theme,
      onStart, onPause, onBreak, onShop, onSettings, onToggleMute,
    }));
```

- [ ] **Step 4: Pass the theme into the shop**

In `onShop`, after `const dragon = getDragon(state.dragonId);`:
```js
  const onShop = () => {
    const dragon = getDragon(state.dragonId);
    const theme = resolveTheme(dragon.themeId);
    screens.set('shop', renderShopScreen({
      state, foods, theme,
      onBuy: (food) => {
```

- [ ] **Step 5: Run the full suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS (48 existing + the new theme/themedIcon/screen tests),
build succeeds, PWA precache includes the webp assets.

- [ ] **Step 6: Commit**

```bash
git add src/data/dragons.js src/app.js
git commit -m "feat: apply the selected dragon's theme across the app"
```

---

## Notes for the implementer

- The frost art files (`/art/icons/*.webp`, `/art/foods/*.webp`) do NOT exist yet.
  That is expected: `art()`/`themedIcon` fall back to the default emoji on image
  error, and the app stays fully functional. Assets arrive later via
  `docs/art-prompts.md`.
- Do not rename the `ember` dragon here — its frost-clashing name is a separate,
  pending decision.
- Keep every touched file within the ~200-line guideline; all changes here are
  small and local.
