# Second Dragon (Blaze) + Per-Dragon Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second dragon "Blaze" (fire) that the child can switch to and grow independently — each dragon grows from its own egg with its own XP; coins stay a shared wallet.

**Architecture:** XP moves from a single global `state.xp` to `state.xpByDragon` (a `dragonId -> xp` map) with a v1→v2 save migration. The active dragon's XP is read through one accessor `dragonXp(state)`. A "Change Dragon" button in Settings reopens the existing chooser (reusing `onPick`). Blaze is a new data entry + theme; its art degrades to emojis until generated.

**Tech Stack:** Vanilla JS (ES modules), Vite, Vitest + jsdom, plain CSS.

## Global Constraints

- Each file ideally ≤ ~200 lines, single responsibility, DRY.
- TDD: failing test first, then minimal implementation.
- Conventional commits. No AI attribution / no Co-Authored-By trailer.
- Default Frost / no-theme look stays pixel-identical.
- Coins stay a single shared wallet (never per-dragon).
- Test runner: `npm test -- --run`. Build: `npm run build`.

---

### Task 1: Per-dragon XP model + save migration

Moves XP from global `state.xp` to `state.xpByDragon`, migrates old saves, and threads the active dragon's XP through the app and main screen. This is one cohesive task because the state shape must change consistently across the store, the game rules, the app, and the main screen — a partial change leaves an incoherent state.

**Files:**
- Modify: `src/store/store.js`
- Modify: `src/store/store.test.js`
- Modify: `src/core/game.js`
- Modify: `src/core/game.test.js`
- Modify: `src/app.js`
- Modify: `src/ui/mainScreen.js`
- Modify: `src/ui/mainScreen.test.js`

**Interfaces:**
- Produces: `dragonXp(state) => number` and `addDragonXp(state, amount) => state` (in `core/game.js`); `state.xpByDragon` (object `dragonId -> xp`); `defaultState` at `version: 2`.
- Consumes: `currentLevel`, `levelProgress` from `core/dragon.js` (unchanged, take `(dragon, xp)`).

- [ ] **Step 1: Update the game-rules tests (write the new expectations first)**

Replace the body of `src/core/game.test.js` with:
```js
import { describe, it, expect } from 'vitest';
import { grantWorkReward, buyFood, leveledUp, dragonXp, addDragonXp } from './game.js';
import { config } from '../data/config.js';
import { getDragon } from '../data/dragons.js';

const base = { version: 2, dragonId: 'frost', coins: 0, xpByDragon: {}, muted: false,
  settings: { workMinutes: 15, breakMinutes: 5 } };
const frost = getDragon('frost');

describe('game rules', () => {
  it('grants coins on work completion', () => {
    const s = grantWorkReward(base, config);
    expect(s.coins).toBe(config.coinsPerWork);
  });

  it('dragonXp reads the active dragon and defaults to 0', () => {
    expect(dragonXp(base)).toBe(0);
    expect(dragonXp({ ...base, xpByDragon: { frost: 42 } })).toBe(42);
  });

  it('addDragonXp adds only to the active dragon and leaves others intact', () => {
    const s = addDragonXp({ ...base, xpByDragon: { blaze: 10 } }, 60);
    expect(s.xpByDragon.frost).toBe(60);
    expect(s.xpByDragon.blaze).toBe(10);
  });

  it('buying food spends coins and adds xp to the active dragon', () => {
    const rich = { ...base, coins: 100 };
    const food = { id: 'meat', price: 25, xp: 60 };
    const s = buyFood(rich, food);
    expect(s.coins).toBe(75);
    expect(dragonXp(s)).toBe(60);
  });

  it('buying food you cannot afford throws and does not mutate', () => {
    const poor = { ...base, coins: 5 };
    const food = { id: 'cake', price: 50, xp: 150 };
    expect(() => buyFood(poor, food)).toThrow();
    expect(poor.coins).toBe(5);
  });

  it('detects a level up across a threshold', () => {
    expect(leveledUp(frost, 90, 110)).toBe(true);   // crossed 100
    expect(leveledUp(frost, 110, 150)).toBe(false);  // same level
  });
});
```

- [ ] **Step 2: Run the game test to verify it fails**

Run: `npm test -- --run src/core/game.test.js`
Expected: FAIL — `dragonXp`/`addDragonXp` are not exported; `buyFood` still writes `s.xp`.

- [ ] **Step 3: Implement the per-dragon helpers in `core/game.js`**

Replace `src/core/game.js` with:
```js
import { addCoins, spend } from './wallet.js';
import { currentLevel } from './dragon.js';

export const grantWorkReward = (state, config) => ({
  ...state,
  coins: addCoins(state.coins, config.coinsPerWork),
});

// XP is stored per dragon. These read/write the ACTIVE dragon's XP.
export const dragonXp = (state) => state.xpByDragon?.[state.dragonId] ?? 0;

export const addDragonXp = (state, amount) => ({
  ...state,
  xpByDragon: { ...state.xpByDragon, [state.dragonId]: dragonXp(state) + amount },
});

export const buyFood = (state, food) => {
  const coins = spend(state.coins, food.price); // throws if !canAfford
  return { ...addDragonXp(state, food.xp), coins };
};

export const leveledUp = (dragon, oldXp, newXp) =>
  currentLevel(dragon, newXp).level > currentLevel(dragon, oldXp).level;
```
(Note: `addXp` is no longer imported here. Leave `addXp` in `core/dragon.js` — it is still exported and independently tested by `dragon.test.js`.)

- [ ] **Step 4: Run the game test to verify it passes**

Run: `npm test -- --run src/core/game.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Update the store tests (default shape + migration)**

Replace the two relevant tests in `src/store/store.test.js`. Change the "returns default state" assertion and the roundtrip test, and ADD a migration test. The full `describe` block becomes:
```js
describe('store', () => {
  it('returns default state when nothing is saved', () => {
    const store = createStore(memoryBackend(), config);
    const s = store.load();
    expect(s.coins).toBe(0);
    expect(s.xpByDragon).toEqual({});
    expect(s.version).toBe(2);
    expect(s.dragonId).toBeNull();
    expect(s.settings).toEqual(config.durations.default);
  });

  it('save then load returns the same state (roundtrip)', () => {
    const store = createStore(memoryBackend(), config);
    const saved = { ...defaultState(config), dragonId: 'frost', coins: 40,
      xpByDragon: { frost: 120 } };
    store.save(saved);
    expect(store.load()).toEqual(saved);
  });

  it('migrates a v1 save (global xp) to per-dragon xpByDragon', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify(
      { version: 1, dragonId: 'frost', coins: 40, xp: 120, muted: false,
        settings: config.durations.default }));
    const store = createStore(backend, config);
    const s = store.load();
    expect(s.version).toBe(2);
    expect(s.xpByDragon).toEqual({ frost: 120 });
    expect(s.coins).toBe(40);
    expect('xp' in s).toBe(false);
  });

  it('falls back to defaults when stored data is corrupt', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, '{not valid json');
    const store = createStore(backend, config);
    expect(store.load().coins).toBe(0);
  });
});
```

- [ ] **Step 6: Run the store test to verify it fails**

Run: `npm test -- --run src/store/store.test.js`
Expected: FAIL — default state still has `xp`/`version: 1`; no migration.

- [ ] **Step 7: Implement the v2 default + migration in `src/store/store.js`**

Replace `src/store/store.js` with:
```js
export const defaultState = (config) => ({
  version: 2,
  dragonId: null,
  coins: 0,
  xpByDragon: {},
  muted: false,
  settings: { ...config.durations.default },
});

// Upgrade a legacy v1 save (global `xp`) to the per-dragon `xpByDragon` shape.
const migrate = (merged, parsed) => {
  if ('xp' in parsed) {
    const xpByDragon = parsed.dragonId ? { [parsed.dragonId]: parsed.xp ?? 0 } : {};
    const { xp, ...rest } = merged;
    return { ...rest, xpByDragon, version: 2 };
  }
  return { ...merged, version: 2 };
};

export const createStore = (backend, config) => {
  const key = config.storageKey;
  return {
    save: (state) => backend.write(key, JSON.stringify(state)),
    load: () => {
      const raw = backend.read(key);
      if (!raw) return defaultState(config);
      try {
        const parsed = JSON.parse(raw);
        return migrate({ ...defaultState(config), ...parsed }, parsed);
      } catch {
        return defaultState(config);
      }
    },
  };
};
```

- [ ] **Step 8: Run the store test to verify it passes**

Run: `npm test -- --run src/store/store.test.js`
Expected: PASS (4 tests, including migration).

- [ ] **Step 9: Update the main-screen test to pass XP explicitly**

In `src/ui/mainScreen.test.js`, change the `base` object so XP is a top-level ctx value (the screen will read `ctx.xp`, not `state.xp`):
```js
const base = {
  state: { coins: 30 },
  xp: 150,
  dragon,
  onStart: vi.fn(), onPause: vi.fn(), onBreak: vi.fn(),
  onShop: vi.fn(), onSettings: vi.fn(), onToggleMute: vi.fn(),
};
```
(No other changes — the "current-level dragon image" test still expects `frost-baby.webp` from xp 150.)

- [ ] **Step 10: Run the main-screen test to verify it fails**

Run: `npm test -- --run src/ui/mainScreen.test.js`
Expected: FAIL — `mainScreen.js` still reads `state.xp` (now undefined → level 1 egg), so the image is `frost-egg.webp`, not `frost-baby.webp`.

- [ ] **Step 11: Make `mainScreen.js` read `ctx.xp`**

In `src/ui/mainScreen.js`, update the destructure and the two XP reads. Change line 12 from:
```js
  const { state, dragon, timerState, theme } = ctx;
  const level = currentLevel(dragon, state.xp);
  const progress = levelProgress(dragon, state.xp);
```
to:
```js
  const { state, dragon, timerState, theme } = ctx;
  const xp = ctx.xp ?? 0;
  const level = currentLevel(dragon, xp);
  const progress = levelProgress(dragon, xp);
```

- [ ] **Step 12: Run the main-screen test to verify it passes**

Run: `npm test -- --run src/ui/mainScreen.test.js`
Expected: PASS (5 tests).

- [ ] **Step 13: Wire the active XP through `app.js`**

In `src/app.js`:

(a) Update the game import (line 14) to include `dragonXp`:
```js
import { grantWorkReward, buyFood, leveledUp, dragonXp } from './core/game.js';
```

(b) In `render()`, after `applyPalette(theme.palette);`, compute and pass `xp`:
```js
    const theme = resolveTheme(dragon.themeId);
    applyPalette(theme.palette);
    screens.set('main', renderMainScreen({
      state, dragon, xp: dragonXp(state), timerState, theme,
      onStart, onPause, onBreak, onShop, onSettings, onToggleMute,
    }));
```

(c) In `onShop`'s `onBuy`, read old/new XP via `dragonXp` instead of `state.xp`:
```js
      onBuy: (food) => {
        const oldXp = dragonXp(state);
        state = buyFood(state, food);
        save();
        audio.playEffect('eat');
        const newXp = dragonXp(state);
        if (leveledUp(dragon, oldXp, newXp)) {
          showLevelUp(dragon, currentLevel(dragon, newXp),
            () => audio.playEffect('levelup'));
        }
        onShop(); // re-render shop with updated coins/xp
      },
```

- [ ] **Step 14: Run the full suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS (app.test.js unchanged — it never asserts XP/level and its seeded save migrates cleanly to `xpByDragon: {}`), build succeeds.

- [ ] **Step 15: Commit**

```bash
git add src/store/store.js src/store/store.test.js src/core/game.js src/core/game.test.js src/app.js src/ui/mainScreen.js src/ui/mainScreen.test.js
git commit -m "feat: store XP per dragon with a v1 save migration"
```

---

### Task 2: Add the Blaze dragon + fire theme

**Files:**
- Modify: `src/data/dragons.js`
- Modify: `src/data/themes.js`
- Modify: `src/core/theme.test.js`
- Modify: `src/data/dragons.test.js`

**Interfaces:**
- Produces: a `blaze` dragon (`getDragon('blaze')`, `themeId: 'blaze'`, 4 levels) and a `themes.blaze` theme (`palette`, `icons`, `foods`) resolvable via `resolveTheme('blaze')`.

- [ ] **Step 1: Write the failing tests**

Add to `src/data/dragons.test.js` inside `describe('dragons data', ...)`:
```js
  it('has a Blaze dragon with a themeId and 4 levels', () => {
    const blaze = getDragon('blaze');
    expect(blaze.name).toBe('Blaze');
    expect(blaze.themeId).toBe('blaze');
    expect(blaze.levels).toHaveLength(4);
    expect(blaze.levels[0].image).toBe('/art/dragons/blaze-egg.webp');
  });
```
Add to `src/core/theme.test.js` inside `describe('resolveTheme', ...)`:
```js
  it('resolves the blaze fire theme (palette + icon/food overrides)', () => {
    const blaze = resolveTheme('blaze');
    expect(blaze.palette.bg).toBe('#1f0a08');       // fire bg
    expect(blaze.palette.fg).toBe('#ffffff');        // falls back to default
    expect(blaze.icons.coin).toBe('/art/icons/blaze-coin.webp');
    expect(blaze.foods.apple).toBe('/art/foods/blaze-apple.webp');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/data/dragons.test.js src/core/theme.test.js`
Expected: FAIL — `getDragon('blaze')` is null; `resolveTheme('blaze')` returns the default (`bg` is `#1b1030`).

- [ ] **Step 3: Add the Blaze dragon**

In `src/data/dragons.js`, append a second object to the `dragons` array (after the `frost` object, inside the array):
```js
  {
    id: 'blaze',
    name: 'Blaze',
    themeId: 'blaze',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/blaze-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/blaze-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/blaze-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/blaze-adult.webp', fallback: '🐲' },
    ],
  },
```

- [ ] **Step 4: Add the Blaze theme**

In `src/data/themes.js`, add a `blaze` key to the `themes` object (a sibling of `default` and `frost`):
```js
  blaze: {
    palette: {
      bg: '#1f0a08',
      accent: '#ff6b1a',
      'accent-fg': '#2a0f00',
      'xp-fill': '#ffc24d',
      card: '#3a1a12',
      'back-btn': '#ffb37a',
    },
    icons: {
      coin: '/art/icons/blaze-coin.webp',
      shop: '/art/icons/blaze-shop.webp',
      settings: '/art/icons/blaze-settings.webp',
      mute: '/art/icons/blaze-mute.webp',
      break: '/art/icons/blaze-break.webp',
    },
    foods: {
      apple: '/art/foods/blaze-apple.webp',
      meat: '/art/foods/blaze-meat.webp',
      cake: '/art/foods/blaze-cake.webp',
    },
  },
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- --run src/data/dragons.test.js src/core/theme.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/dragons.js src/data/themes.js src/data/dragons.test.js src/core/theme.test.js
git commit -m "feat: add Blaze dragon and fire theme"
```

---

### Task 3: "Change Dragon" button in Settings

**Files:**
- Modify: `src/ui/settingsScreen.js`
- Modify: `src/ui/settingsScreen.test.js`
- Modify: `src/app.js`

**Interfaces:**
- Consumes (settingsScreen): an optional `onChangeDragon` callback param.
- Produces: a `[data-action="change-dragon"]` button in the settings screen; an `onChangeDragon` handler in the app that reopens the chooser.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/settingsScreen.test.js` inside `describe('settings screen', ...)`:
```js
  it('renders a Change Dragon button that invokes onChangeDragon', () => {
    const onChangeDragon = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange: () => {},
      onBack: () => {}, onChangeDragon });
    const btn = el.querySelector('[data-action="change-dragon"]');
    expect(btn).not.toBeNull();
    btn.click();
    expect(onChangeDragon).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/ui/settingsScreen.test.js`
Expected: FAIL — no `[data-action="change-dragon"]` element.

- [ ] **Step 3: Add the button to `settingsScreen.js`**

In `src/ui/settingsScreen.js`, add `onChangeDragon` to the destructured params (line 5):
```js
export const renderSettingsScreen = ({ settings, config, onChange, onBack, onChangeDragon }) => {
```
Then, immediately BEFORE `section.appendChild(backButton(onBack));` (line 53), append the button:
```js
  const changeDragon = document.createElement('button');
  changeDragon.className = 'big-btn';
  changeDragon.dataset.action = 'change-dragon';
  changeDragon.textContent = '🐉 Change Dragon';
  if (onChangeDragon) changeDragon.addEventListener('click', onChangeDragon);
  section.appendChild(changeDragon);
```

- [ ] **Step 4: Run the settings test to verify it passes**

Run: `npm test -- --run src/ui/settingsScreen.test.js`
Expected: PASS (4 tests — the 3 existing ones still pass; they don't pass `onChangeDragon`, and the guard makes that a no-op).

- [ ] **Step 5: Wire `onChangeDragon` in `app.js`**

In `src/app.js`:

(a) Add the handler just after `onPick` (line 43):
```js
  const onChangeDragon = () => {
    screens.set('choose', renderChooseDragon({ dragons, onPick }));
    screens.show('choose');
  };
```

(b) Pass it into the settings screen. In `onSettings`, update the `renderSettingsScreen` call to include `onChangeDragon`:
```js
    screens.set('settings', renderSettingsScreen({
      settings: state.settings, config, onChangeDragon,
      onChange: (settings) => {
```

- [ ] **Step 6: Run the full suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/ui/settingsScreen.js src/ui/settingsScreen.test.js src/app.js
git commit -m "feat: add Change Dragon control in settings"
```

---

### Task 4: Mark the active dragon in the chooser

**Files:**
- Modify: `src/ui/chooseDragon.js`
- Modify: `src/ui/chooseDragon.test.js`
- Modify: `src/app.js`

**Interfaces:**
- Consumes (chooseDragon): an optional `currentId` param.
- Produces: the choice whose `dragon.id === currentId` gets a `current` CSS class.

- [ ] **Step 1: Write the failing test**

Add to `src/ui/chooseDragon.test.js` inside `describe('choose dragon screen', ...)`:
```js
  it('marks the current dragon when currentId is given', () => {
    const el = renderChooseDragon({ dragons, onPick: vi.fn(), currentId: 'frost' });
    expect(el.querySelector('[data-dragon="frost"]').classList.contains('current')).toBe(true);
    expect(el.querySelector('[data-dragon="blaze"]').classList.contains('current')).toBe(false);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/ui/chooseDragon.test.js`
Expected: FAIL — no `current` class is applied.

- [ ] **Step 3: Apply the marker in `chooseDragon.js`**

In `src/ui/chooseDragon.js`, add `currentId` to the destructured params (line 3):
```js
export const renderChooseDragon = ({ dragons, onPick, currentId }) => {
```
Then, in the loop, set the class conditionally. Change:
```js
    const choice = document.createElement('button');
    choice.className = 'dragon-choice';
```
to:
```js
    const choice = document.createElement('button');
    choice.className = 'dragon-choice' + (dragon.id === currentId ? ' current' : '');
```

- [ ] **Step 4: Run the chooser test to verify it passes**

Run: `npm test -- --run src/ui/chooseDragon.test.js`
Expected: PASS (2 tests — the existing "renders a choice per dragon" still passes; it omits `currentId`, so no marker).

- [ ] **Step 5: Pass `currentId` from `app.js` (both chooser call sites)**

In `src/app.js`, update BOTH `renderChooseDragon` calls to pass the active id:
- In `render()` (the initial chooser, `dragonId` is null there → no marker):
```js
      screens.set('choose', renderChooseDragon({ dragons, onPick, currentId: state.dragonId }));
```
- In `onChangeDragon` (added in Task 3):
```js
    screens.set('choose', renderChooseDragon({ dragons, onPick, currentId: state.dragonId }));
```

- [ ] **Step 6: Add a `current` style for the marker**

In `src/styles.css`, in the section with `.dragon-choice`, add:
```css
.dragon-choice.current { outline: 3px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 7: Run the full suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests PASS, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/ui/chooseDragon.js src/ui/chooseDragon.test.js src/app.js src/styles.css
git commit -m "feat: highlight the active dragon in the chooser"
```

---

### Task 5: Blaze art prompt pack

Documentation-only task — adds the Blaze generation prompts so the art can be produced later. No code, no test.

**Files:**
- Modify: `docs/art-prompts.md`

- [ ] **Step 1: Append the Blaze section**

At the end of `docs/art-prompts.md`, add a new top-level section. Blaze is the FIRE counterpart of Frost — keep the same storybook watercolor style and structure, swap the glacial palette for a warm ember one. Save targets mirror frost with a `blaze-` prefix.

```markdown
## Blaze — the fire dragon (second dragon)

Art direction: Blaze is the FIRE counterpart to Frost. SAME dark-fantasy children's
storybook watercolor style, SAME friendly-not-scary mood — but a warm ember palette
instead of the glacial one. Warm palette: deep charcoal-black and ember red-brown,
molten orange, gold, ash grey, with a soft warm glow and gentle glowing amber
highlights. Enchanted, cosy, friendly — NOT scary, NOT gory. Subtle ember-spark and
soft flame motifs. Same pipeline as Frost: transparent PNG → `art-src/<group>/blaze-*.png`
→ 512px webp in `public/art/<group>/`. Cutout model per subject: dragon character →
`isnet-anime`; discrete objects/icons/food → `isnet-general-use`.

### Dragons (save to art-src/dragons/)

#### blaze-egg.png
```
Match a dark-fantasy children's storybook illustration, moody painterly watercolor. Warm ember palette: deep charcoal-black and ember red-brown, molten orange, gold, ash grey, soft warm glow, gentle glowing amber highlights. Enchanted, mystical, friendly — NOT scary. Subtle ember-spark and soft flame motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single closed, UNHATCHED fire-dragon egg — warm cream-and-orange shell with faint glowing cracks of inner molten light and a soft ember glow, cute and magical. No dragon visible, just the egg.
```

#### blaze-baby.png
```
Match a dark-fantasy children's storybook illustration, moody painterly watercolor. Warm ember palette: deep charcoal-black and ember red-brown, molten orange, gold, ash grey, soft warm glow, gentle glowing amber highlights. Enchanted, cold-hearted? NO — warm-hearted and friendly, NOT scary, NOT gory. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby fire dragon just hatched — warm orange-and-gold scales with soft ember markings, big gentle glowing amber eyes, tiny wings with a warm glow, tiny curved horns, sitting, adorable and shy, a faint ember glow around it.
```

#### blaze-young.png
```
Attach the baby Blaze image. Keep the SAME dragon — same warm colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME fire dragon, now YOUNG — a bit bigger, longer warm-glowing wings, small curved horns, curious and playful.
```

#### blaze-adult.png
```
Attach the young Blaze image. Keep the SAME dragon — same warm colours, markings and features — and match the style/mood. Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Majestic but kind, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: the SAME fire dragon, now FULLY GROWN — majestic and warm, large ember-lit wings, elegant curved horns, a soft crown of warm light, confident and gentle.
```

### Foods — dragon treats (save to art-src/foods/)

#### blaze-apple.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single enchanted fire-touched red-orange apple with a faint warm glow and tiny glowing embers, cute and appetising.
```

#### blaze-meat.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a fire-roasted drumstick with a warm glowing sheen and tiny embers, cute — a hearty treat for a fire dragon.
```

#### blaze-cake.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a small enchanted ember cake with warm-orange frosting and a glowing amber gem on top, cute.
```

### UI icons — dragon-themed fire (save to art-src/icons/)

#### blaze-coin.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a single gold-and-ember dragon coin engraved with a dragon, warm glowing rim, amber edge — a cute game currency icon.
```

#### blaze-shop.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a dragon's warm treasure hoard — a small ember-lit treasure chest with glowing gold coins and amber gems spilling out, cute.
```

#### blaze-settings.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a glowing amber rune-circle forming a gear / cog shape, ember and gold, a cute settings icon.
```

#### blaze-mute.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute warm-amber speaker icon with a slash through it, faint embers, glowing edge — a mute icon.
```

#### blaze-break.png
```
Dark-fantasy children's storybook watercolor, warm ember palette (charcoal-black, ember red-brown, molten orange, gold, ash grey, amber glow). Warm-hearted and friendly, NOT scary. Subtle ember-spark motifs. Centered, front view, square 1:1, plain fully transparent background, PNG, no text, no scenery, no ground shadow. SUBJECT: a cute baby fire dragon curled up asleep by warm glowing embers, peaceful — a rest / take-a-break icon.
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/art-prompts.md
git commit -m "docs: add Blaze fire-dragon art prompt pack"
```

---

## Notes for the implementer

- The Blaze art files do NOT exist yet. That is expected: `art()` / `themedIcon` fall
  back to the default emoji on image error, so Blaze is fully playable (egg → adult via
  emoji, fire palette applied) until the assets arrive. Generating them is a separate art
  task using the Task 5 prompt pack.
- Do NOT make coins per-dragon — coins stay a single shared wallet.
- Keep every touched file within the ~200-line guideline; all changes here are small and
  local.
- The default Frost experience must stay pixel-identical — the only palette change happens
  when the child actively switches to Blaze.
