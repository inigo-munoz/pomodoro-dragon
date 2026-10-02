> Historical: the slot picker was replaced by the lair shelf.
> The slot `corner` became `center`.

# Dragon Lair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each dragon a themed room the child furnishes with coins, through four fixed slots, with decorative-only pets.

**Architecture:** A pure core module (`src/core/lair.js`) owns the rules and is tested without a DOM, exactly as `src/core/game.js` is. One new screen (`src/ui/lairScreen.js`) renders the room, the dragon at its current level, and the four slots. Purchases happen from inside the room: tapping an empty slot opens a picker filtered to that slot. State lives in one new `lairs` field that the existing defaults-merge absorbs without a migration.

**Tech Stack:** Vanilla JS (ES modules), Vite 5, Vitest 2 + jsdom. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-01-dragon-lair-design.md`

## Global Constraints

- No new runtime dependencies. The app ships as a static PWA.
- All code, comments, test names and commit messages in English. Conventional Commits.
- Never add a `Co-Authored-By` or AI-attribution line to a commit.
- Asset paths are authored from the site root (`/art/...`) and MUST go through `assetUrl()` from `src/ui/art.js`. A raw path 404s under the `/pomodoro-dragon/` deploy base.
- Per-dragon state is written by spreading the sibling map, never by replacing it, so other dragons are untouched. See `addDragonXp` in `src/core/game.js:16`.
- Coin spending goes through `spend()` in `src/core/wallet.js`, which throws `Insufficient coins`.
- `canAfford` is `coins >= price`, so exact-change purchases must succeed.
- Anything updating per second patches mounted DOM in place rather than rebuilding it (commit 93a5518).
- The app's layout maximum width is 480px (`#app { max-width: 480px }` in `src/styles.css`).

## Review Focus

Five input classes the spec implies but no obvious task exercises. Each has a test assigned to the task that owns the code.

1. **A dragon with no `lairs` entry at all** (first ever visit) must render an empty room, not crash on `undefined.slots`. — Task 2.
2. **A saved slot pointing at an item id no longer in the catalogue** (catalogue edited in a later release) must render as empty, not as a broken tile. — Task 6.
3. **An item that moved to a different slot between releases** must not appear in two slots at once; the slot shown is the item's current `slot`. — Task 6.
4. **Buying with coins exactly equal to the price** must succeed and leave zero coins, because `canAfford` is `>=`. — Task 3.
5. **A theme with no furniture art for an item** must fall back to the emoji rather than render a broken image. — Task 7.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/data/furniture.js` (create) | The slot names and the catalogue. Data only. |
| `src/core/lair.js` (create) | Rules: lookup, purchase, placement. No DOM. |
| `src/core/lair.test.js` (create) | Tests for the above. |
| `src/store/store.js` (modify) | One new default field, `lairs: {}`. |
| `src/data/themes.js` (modify) | Default-theme emoji furniture; per-theme art later. |
| `src/ui/lairScreen.js` (create) | The room, the dragon, the four slots, the picker. |
| `src/ui/lairScreen.test.js` (create) | Tests for the above. |
| `src/ui/mainScreen.js` (modify) | A third nav button. |
| `src/app.js` (modify) | `onLair`, `onBuyFurniture`, `onPlaceItem` handlers and wiring. |
| `src/styles.css` (modify) | Room layout and slot positioning. |

---

### Task 1: Furniture catalogue and slot lookup

**Files:**
- Create: `src/data/furniture.js`
- Create: `src/core/lair.js`
- Test: `src/core/lair.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `slots: string[]`, `furniture: Item[]` where
  `Item = { id: string, slot: string, name: string, price: number, pet?: boolean }`;
  `itemsForSlot(furniture, slot) -> Item[]`; `findItem(furniture, id) -> Item | null`.

- [ ] **Step 1: Write the failing test**

Create `src/core/lair.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { itemsForSlot, findItem } from './lair.js';
import { furniture, slots } from '../data/furniture.js';

describe('furniture catalogue', () => {
  it('gives every slot at least two items to choose between', () => {
    for (const slot of slots) {
      expect(itemsForSlot(furniture, slot).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('places every item in a slot the room actually has', () => {
    for (const item of furniture) {
      expect(slots).toContain(item.slot);
    }
  });

  it('has no duplicate ids', () => {
    const ids = furniture.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds an item by id and returns null for an unknown one', () => {
    expect(findItem(furniture, 'bed').slot).toBe('floorLeft');
    expect(findItem(furniture, 'nope')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/core/lair.test.js`
Expected: FAIL — cannot resolve `./lair.js` and `../data/furniture.js`.

- [ ] **Step 3: Write minimal implementation**

Create `src/data/furniture.js`:

```js
// The room has four fixed positions. An item declares which one it belongs to, so a
// picker opened from a slot can offer only what fits there.
export const slots = ['wall', 'floorLeft', 'floorRight', 'corner'];

// Priced against the food shop (apple 10, meat 25, cake 50) at one coin per minute, so a
// single piece is a few completed blocks of saving.
export const furniture = [
  { id: 'banner',    slot: 'wall',       name: 'Banner',    price: 30, fallback: '🚩' },
  { id: 'painting',  slot: 'wall',       name: 'Painting',  price: 45, fallback: '🖼️' },
  { id: 'trophy',    slot: 'wall',       name: 'Trophy',    price: 70, fallback: '🏆' },
  { id: 'bed',       slot: 'floorLeft',  name: 'Bed',       price: 40, fallback: '🛏️' },
  { id: 'nest',      slot: 'floorLeft',  name: 'Nest',      price: 60, fallback: '🪹' },
  { id: 'lamp',      slot: 'floorRight', name: 'Lamp',      price: 25, fallback: '🪔' },
  { id: 'chest',     slot: 'floorRight', name: 'Chest',     price: 35, fallback: '🧰' },
  { id: 'shelf',     slot: 'floorRight', name: 'Bookshelf', price: 55, fallback: '📚' },
  { id: 'imp',       slot: 'corner',     name: 'Imp',       price: 80, fallback: '👺', pet: true },
  { id: 'hatchling', slot: 'corner',     name: 'Hatchling', price: 90, fallback: '🐣', pet: true },
];
```

Create `src/core/lair.js`:

```js
export const itemsForSlot = (furniture, slot) => furniture.filter((i) => i.slot === slot);

export const findItem = (furniture, id) => furniture.find((i) => i.id === id) ?? null;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/core/lair.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/furniture.js src/core/lair.js src/core/lair.test.js
git commit -m "feat(lair): add the furniture catalogue and slot lookup"
```

---

### Task 2: Lair state, defaulted for a dragon that has none

**Files:**
- Modify: `src/store/store.js` (the `defaultState` object)
- Modify: `src/core/lair.js`
- Test: `src/core/lair.test.js`

**Interfaces:**
- Consumes: Task 1's module.
- Produces: `emptyLair() -> { owned: [], slots: {} }`; `lairOf(state, dragonId) -> { owned: string[], slots: Record<string,string> }`, never undefined.

- [ ] **Step 1: Write the failing test**

Append to `src/core/lair.test.js` (and add `emptyLair, lairOf` to the import from `./lair.js`, plus `import { defaultState } from '../store/store.js';` and `import { config } from '../data/config.js';`):

```js
describe('lair state', () => {
  it('defaults a dragon that has never been decorated, instead of returning undefined', () => {
    expect(lairOf({ lairs: {} }, 'frost')).toEqual({ owned: [], slots: {} });
    expect(lairOf({}, 'frost')).toEqual({ owned: [], slots: {} });
  });

  it('returns the stored lair when there is one', () => {
    const state = { lairs: { frost: { owned: ['bed'], slots: { floorLeft: 'bed' } } } };
    expect(lairOf(state, 'frost')).toEqual({ owned: ['bed'], slots: { floorLeft: 'bed' } });
  });

  it('ships an empty lairs map in a fresh save', () => {
    expect(defaultState(config).lairs).toEqual({});
  });

  it('gives a fresh emptyLair each call, so callers cannot share one', () => {
    const a = emptyLair();
    a.owned.push('bed');
    expect(emptyLair().owned).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/core/lair.test.js`
Expected: FAIL — `lairOf is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `src/core/lair.js`:

```js
// A function, not a shared constant: callers mutate nothing, but handing out the same
// object would make an accidental push leak into every undecorated dragon.
export const emptyLair = () => ({ owned: [], slots: {} });

export const lairOf = (state, dragonId) => state.lairs?.[dragonId] ?? emptyLair();
```

In `src/store/store.js`, add one line to the `defaultState` object, after `xpByDragon: {},`:

```js
  lairs: {},
```

Leave `version` at 3. `load()` already does `migrate({ ...defaultState(config), ...parsed }, parsed)`, so an older save gains the field from the defaults merge with no migration code.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/core/lair.test.js src/store`
Expected: PASS, and the existing store tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/lair.js src/core/lair.test.js src/store/store.js
git commit -m "feat(lair): add per-dragon lair state with a safe default"
```

---

### Task 3: Buying furniture

**Files:**
- Modify: `src/core/lair.js`
- Test: `src/core/lair.test.js`

**Interfaces:**
- Consumes: `lairOf`, `emptyLair`, and `spend` from `src/core/wallet.js`.
- Produces: `buyFurniture(state, item) -> state`. Throws `Insufficient coins` when unaffordable.

- [ ] **Step 1: Write the failing test**

Append to `src/core/lair.test.js` (add `buyFurniture` to the `./lair.js` import):

```js
const bed = { id: 'bed', slot: 'floorLeft', name: 'Bed', price: 40 };
const lamp = { id: 'lamp', slot: 'floorRight', name: 'Lamp', price: 25 };
const baseState = { dragonId: 'frost', coins: 100, lairs: {} };

describe('buying furniture', () => {
  it('spends the price, records the item as owned and puts it in its slot', () => {
    const s = buyFurniture(baseState, bed);
    expect(s.coins).toBe(60);
    expect(lairOf(s, 'frost')).toEqual({ owned: ['bed'], slots: { floorLeft: 'bed' } });
  });

  it('succeeds on exact change and leaves no coins', () => {
    const s = buyFurniture({ ...baseState, coins: 40 }, bed);
    expect(s.coins).toBe(0);
    expect(lairOf(s, 'frost').owned).toEqual(['bed']);
  });

  it('throws and changes nothing when the coins are short by one', () => {
    const poor = { ...baseState, coins: 39 };
    expect(() => buyFurniture(poor, bed)).toThrow('Insufficient coins');
    expect(poor.coins).toBe(39);
    expect(poor.lairs).toEqual({});
  });

  it('writes only to the active dragon and leaves other lairs intact', () => {
    const shared = { ...baseState, lairs: { blaze: { owned: ['chest'], slots: { floorRight: 'chest' } } } };
    const s = buyFurniture(shared, bed);
    expect(lairOf(s, 'frost').owned).toEqual(['bed']);
    expect(lairOf(s, 'blaze')).toEqual({ owned: ['chest'], slots: { floorRight: 'chest' } });
  });

  it('does not duplicate an id in owned when the same item is bought twice', () => {
    const s = buyFurniture(buyFurniture(baseState, bed), bed);
    expect(lairOf(s, 'frost').owned).toEqual(['bed']);
    expect(s.coins).toBe(20);
  });

  it('keeps items bought for other slots', () => {
    const s = buyFurniture(buyFurniture(baseState, bed), lamp);
    expect(lairOf(s, 'frost').slots).toEqual({ floorLeft: 'bed', floorRight: 'lamp' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/core/lair.test.js`
Expected: FAIL — `buyFurniture is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add the import at the top of `src/core/lair.js`:

```js
import { spend } from './wallet.js';
```

Append:

```js
// Spreading `lairs` rather than replacing it is what keeps the other three dragons'
// rooms intact, the same guarantee addDragonXp gives their XP.
export const buyFurniture = (state, item) => {
  const coins = spend(state.coins, item.price); // throws if !canAfford
  const lair = lairOf(state, state.dragonId);
  return {
    ...state,
    coins,
    lairs: {
      ...state.lairs,
      [state.dragonId]: {
        owned: lair.owned.includes(item.id) ? lair.owned : [...lair.owned, item.id],
        slots: { ...lair.slots, [item.slot]: item.id },
      },
    },
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/core/lair.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/lair.js src/core/lair.test.js
git commit -m "feat(lair): buy furniture into the active dragon's room"
```

---

### Task 4: Placing an item already owned

**Files:**
- Modify: `src/core/lair.js`
- Test: `src/core/lair.test.js`

**Interfaces:**
- Consumes: `lairOf`.
- Produces: `placeItem(state, item) -> state`. Throws `Item not owned`.

The slot is read from `item.slot`, so a mismatch is not representable.

- [ ] **Step 1: Write the failing test**

Append to `src/core/lair.test.js` (add `placeItem` to the `./lair.js` import):

```js
const banner = { id: 'banner', slot: 'wall', name: 'Banner', price: 30 };
const painting = { id: 'painting', slot: 'wall', name: 'Painting', price: 45 };

describe('placing an owned item', () => {
  it('keeps the displaced item owned, so nothing paid for is ever lost', () => {
    const bought = buyFurniture(buyFurniture(baseState, banner), painting);
    expect(lairOf(bought, 'frost').slots.wall).toBe('painting');
    const back = placeItem(bought, banner);
    expect(lairOf(back, 'frost').slots.wall).toBe('banner');
    expect(lairOf(back, 'frost').owned).toEqual(['banner', 'painting']);
  });

  it('costs nothing', () => {
    const bought = buyFurniture(baseState, banner);
    expect(placeItem(bought, banner).coins).toBe(bought.coins);
  });

  it('refuses an item that was never bought', () => {
    expect(() => placeItem(baseState, banner)).toThrow('Item not owned');
  });

  it('leaves other dragons alone', () => {
    const shared = { ...baseState, lairs: { blaze: { owned: ['chest'], slots: { floorRight: 'chest' } } } };
    const s = placeItem(buyFurniture(shared, banner), banner);
    expect(lairOf(s, 'blaze')).toEqual({ owned: ['chest'], slots: { floorRight: 'chest' } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/core/lair.test.js`
Expected: FAIL — `placeItem is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `src/core/lair.js`:

```js
// `owned` is never pruned: swapping the wall banner for a painting must not destroy the
// banner, or a child loses thirty coins of saving to a single tap.
export const placeItem = (state, item) => {
  const lair = lairOf(state, state.dragonId);
  if (!lair.owned.includes(item.id)) throw new Error('Item not owned');
  return {
    ...state,
    lairs: {
      ...state.lairs,
      [state.dragonId]: { ...lair, slots: { ...lair.slots, [item.slot]: item.id } },
    },
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/core/lair.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/lair.js src/core/lair.test.js
git commit -m "feat(lair): place an owned item without losing the one it replaces"
```

---

### Task 5: Default-theme furniture art

**Files:**
- Modify: `src/data/themes.js`
- Test: `src/core/lair.test.js`

**Interfaces:**
- Consumes: the catalogue ids from Task 1.
- Produces: `theme.furniture: Record<id, string>` and `theme.room: string` on the default theme. The four dragon themes get image paths in Task 9, once art exists.

Real art does not exist yet. Shipping emoji on the default theme first means every later task can be built and tested without waiting for 44 images, and nothing 404s in the meantime.

- [ ] **Step 1: Write the failing test**

Append to `src/core/lair.test.js`, adding `import { resolveTheme } from '../core/theme.js';`. Note the path: `resolveTheme` lives in `src/core/theme.js`, NOT in `src/data/themes.js`, which exports only the `themes` object.

```js
describe('theme furniture art', () => {
  it('gives the default theme a symbol for every catalogue item', () => {
    const base = resolveTheme('does-not-exist');
    for (const item of furniture) {
      expect(base.furniture[item.id]).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/core/lair.test.js`
Expected: FAIL — `Cannot read properties of undefined (reading 'banner')`.

- [ ] **Step 3: Write minimal implementation**

In `src/data/themes.js`, on the DEFAULT theme object (the one at line 13 whose `icons` are emoji), add two entries beside `icons`:

```js
    room: '🕳️',
    furniture: {
      banner: '🚩', painting: '🖼️', trophy: '🏆',
      bed: '🛏️', nest: '🪹',
      lamp: '🪔', chest: '🧰', shelf: '📚',
      imp: '👺', hatchling: '🐣',
    },
```

Do not touch the four dragon themes in this task.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run`
Expected: PASS, whole suite green.

- [ ] **Step 5: Commit**

```bash
git add src/data/themes.js src/core/lair.test.js
git commit -m "feat(lair): give the default theme emoji furniture so the room renders before art exists"
```

---

### Task 6: The lair screen

**Files:**
- Create: `src/ui/lairScreen.js`
- Test: `src/ui/lairScreen.test.js`

**Interfaces:**
- Consumes: `slots`, `furniture`, `lairOf`, `findItem`, `currentLevel` from `src/core/dragon.js`, `art` from `src/ui/art.js`, `backButton` from `src/ui/backButton.js`.
- Produces: `renderLairScreen(ctx) -> HTMLElement` where
  `ctx = { state, dragon, xp, theme, furniture, onPickSlot, onBack }`.

- [ ] **Step 1: Write the failing test**

Create `src/ui/lairScreen.test.js`. Mirror the setup style of `src/ui/mainScreen.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { renderLairScreen } from './lairScreen.js';
import { furniture } from '../data/furniture.js';
import { getDragon } from '../data/dragons.js';

const dragon = getDragon('frost');
const theme = { room: '🕳️', furniture: { bed: '🛏️', banner: '🚩' } };
const ctx = (overrides = {}) => ({
  state: { dragonId: 'frost', coins: 100, lairs: {} },
  dragon, xp: 0, theme, furniture,
  onPickSlot: () => {}, onBack: () => {},
  ...overrides,
});

describe('lair screen', () => {
  it('renders one node per slot', () => {
    const el = renderLairScreen(ctx());
    expect(el.querySelectorAll('[data-slot]').length).toBe(4);
  });

  it('offers a buy affordance in every slot of an undecorated room', () => {
    const el = renderLairScreen(ctx());
    expect(el.querySelectorAll('[data-slot].is-empty').length).toBe(4);
  });

  it('renders the stored item in its slot', () => {
    const state = { dragonId: 'frost', coins: 0, lairs: { frost: { owned: ['bed'], slots: { floorLeft: 'bed' } } } };
    const el = renderLairScreen(ctx({ state }));
    const slot = el.querySelector('[data-slot="floorLeft"]');
    expect(slot.classList.contains('is-empty')).toBe(false);
    expect(slot.textContent).toContain('🛏️');
  });

  it('shows the dragon at its current level', () => {
    const el = renderLairScreen(ctx());
    expect(el.querySelector('.dragon-art')).not.toBeNull();
  });

  it('treats a slot holding an id that left the catalogue as empty', () => {
    const state = { dragonId: 'frost', coins: 0, lairs: { frost: { owned: ['ghost'], slots: { wall: 'ghost' } } } };
    const el = renderLairScreen(ctx({ state }));
    expect(el.querySelector('[data-slot="wall"]').classList.contains('is-empty')).toBe(true);
  });

  it('shows an item only in the slot the catalogue currently gives it', () => {
    const state = { dragonId: 'frost', coins: 0, lairs: { frost: { owned: ['bed'], slots: { wall: 'bed', floorLeft: 'bed' } } } };
    const el = renderLairScreen(ctx({ state }));
    expect(el.querySelector('[data-slot="wall"]').classList.contains('is-empty')).toBe(true);
    expect(el.querySelector('[data-slot="floorLeft"]').classList.contains('is-empty')).toBe(false);
  });

  it('calls onPickSlot with the slot name when an empty slot is tapped', () => {
    const onPickSlot = vi.fn();
    const el = renderLairScreen(ctx({ onPickSlot }));
    el.querySelector('[data-slot="corner"]').click();
    expect(onPickSlot).toHaveBeenCalledWith('corner');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/ui/lairScreen.test.js`
Expected: FAIL — cannot resolve `./lairScreen.js`.

- [ ] **Step 3: Write minimal implementation**

Create `src/ui/lairScreen.js`:

```js
import { currentLevel } from '../core/dragon.js';
import { lairOf, findItem } from '../core/lair.js';
import { slots } from '../data/furniture.js';
import { art } from './art.js';
import { backButton } from './backButton.js';

// A slot is shown filled only when the saved id still exists in the catalogue AND still
// belongs to this slot. A catalogue edited in a later release must degrade to an empty
// slot, never to a broken tile or the same item appearing twice.
const itemInSlot = (lair, furnitureList, slot) => {
  const item = findItem(furnitureList, lair.slots[slot]);
  return item && item.slot === slot ? item : null;
};

export const renderLairScreen = (ctx) => {
  const { state, dragon, xp, theme, furniture: furnitureList, onPickSlot, onBack } = ctx;
  const lair = lairOf(state, state.dragonId);

  const section = document.createElement('section');
  section.className = 'screen lair';
  section.appendChild(backButton(onBack));

  const room = document.createElement('div');
  room.className = 'lair-room';
  room.appendChild(art(theme?.room ?? '🕳️', 'Lair', '🕳️'));

  const level = currentLevel(dragon, xp ?? 0);
  const dragonNode = art(level.image, dragon.name, level.fallback);
  dragonNode.classList.add('dragon-art', 'alive');
  room.appendChild(dragonNode);

  for (const slot of slots) {
    const cell = document.createElement('button');
    cell.className = 'lair-slot';
    cell.dataset.slot = slot;
    const item = itemInSlot(lair, furnitureList, slot);
    if (item) {
      cell.appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
    } else {
      cell.classList.add('is-empty');
      cell.textContent = '+';
      cell.setAttribute('aria-label', `Add something to the ${slot}`);
    }
    cell.addEventListener('click', () => onPickSlot(slot));
    room.appendChild(cell);
  }

  section.appendChild(room);
  return section;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/ui/lairScreen.test.js`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/ui/lairScreen.js src/ui/lairScreen.test.js
git commit -m "feat(lair): render the room, the dragon and the four slots"
```

---

### Task 7: The slot picker

**Files:**
- Create: `src/ui/slotPicker.js`
- Test: `src/ui/slotPicker.test.js`

**Interfaces:**
- Consumes: `itemsForSlot`, `canAfford` from `src/core/wallet.js`, `art`, `themedIcon`, `backButton`.
- Produces: `renderSlotPicker(ctx) -> HTMLElement` where
  `ctx = { state, slot, furniture, theme, onChoose, onBack }`. `onChoose(item)` is called only for an item the child can afford or already owns.

- [ ] **Step 1: Write the failing test**

Create `src/ui/slotPicker.test.js`:

```js
import { describe, it, expect, vi } from 'vitest';
import { renderSlotPicker } from './slotPicker.js';
import { furniture } from '../data/furniture.js';

const theme = { furniture: { banner: '🚩' }, icons: { coin: '🪙' } };
const ctx = (overrides = {}) => ({
  state: { dragonId: 'frost', coins: 100, lairs: {} },
  slot: 'wall', furniture, theme,
  onChoose: () => {}, onBack: () => {},
  ...overrides,
});

describe('slot picker', () => {
  it('offers only the items that belong to the slot', () => {
    const el = renderSlotPicker(ctx());
    const ids = [...el.querySelectorAll('[data-item]')].map((n) => n.dataset.item);
    expect(ids.sort()).toEqual(['banner', 'painting', 'trophy']);
  });

  it('dims an item the child cannot afford and refuses to choose it', () => {
    const onChoose = vi.fn();
    const el = renderSlotPicker(ctx({ state: { dragonId: 'frost', coins: 10, lairs: {} }, onChoose }));
    const trophy = el.querySelector('[data-item="trophy"]');
    expect(trophy.classList.contains('dimmed')).toBe(true);
    trophy.click();
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('chooses an affordable item', () => {
    const onChoose = vi.fn();
    const el = renderSlotPicker(ctx({ onChoose }));
    el.querySelector('[data-item="banner"]').click();
    expect(onChoose).toHaveBeenCalledWith(expect.objectContaining({ id: 'banner' }));
  });

  it('offers an already-owned item free, even with no coins', () => {
    const onChoose = vi.fn();
    const state = { dragonId: 'frost', coins: 0, lairs: { frost: { owned: ['trophy'], slots: {} } } };
    const el = renderSlotPicker(ctx({ state, onChoose }));
    const trophy = el.querySelector('[data-item="trophy"]');
    expect(trophy.classList.contains('dimmed')).toBe(false);
    trophy.click();
    expect(onChoose).toHaveBeenCalledWith(expect.objectContaining({ id: 'trophy' }));
  });

  it('falls back to the emoji for an item the theme has no art for', () => {
    const el = renderSlotPicker(ctx());
    expect(el.querySelector('[data-item="trophy"]').textContent).toContain('🏆');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/ui/slotPicker.test.js`
Expected: FAIL — cannot resolve `./slotPicker.js`.

- [ ] **Step 3: Write minimal implementation**

Create `src/ui/slotPicker.js`:

```js
import { canAfford } from '../core/wallet.js';
import { itemsForSlot, lairOf } from '../core/lair.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';
import { backButton } from './backButton.js';

export const renderSlotPicker = (ctx) => {
  const { state, slot, furniture, theme, onChoose, onBack } = ctx;
  const owned = lairOf(state, state.dragonId).owned;

  const section = document.createElement('section');
  section.className = 'screen picker';
  section.appendChild(backButton(onBack));

  const grid = document.createElement('div');
  grid.className = 'food-grid';

  for (const item of itemsForSlot(furniture, slot)) {
    // Something already paid for costs nothing to put back on display.
    const free = owned.includes(item.id);
    const available = free || canAfford(state.coins, item.price);
    const card = document.createElement('button');
    card.className = 'food-card' + (available ? '' : ' dimmed');
    card.dataset.item = item.id;
    card.disabled = !available;
    card.innerHTML =
      `<span class="food-icon"></span>` +
      `<span class="food-name">${item.name}</span>` +
      `<span class="food-price">${free ? 'Owned' : `<span class="price-coin"></span> ${item.price}`}</span>`;
    card.querySelector('.food-icon')
      .appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
    card.querySelector('.price-coin')?.appendChild(themedIcon(theme, 'coin'));
    card.addEventListener('click', () => {
      if (available) onChoose(item);
    });
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/ui/slotPicker.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/ui/slotPicker.js src/ui/slotPicker.test.js
git commit -m "feat(lair): add the per-slot picker, free for items already owned"
```

---

### Task 8: Wire the lair into the app

**Files:**
- Modify: `src/ui/mainScreen.js` (the nav bar, around line 54, and the listeners around line 81)
- Modify: `src/app.js`
- Test: `src/app.test.js`, `src/ui/mainScreen.test.js`

**Interfaces:**
- Consumes: `renderLairScreen`, `renderSlotPicker`, `buyFurniture`, `placeItem`, `lairOf`.
- Produces: a `[data-action="lair"]` nav button and the `onLair` handler; purchases persist through the existing `save()`.

- [ ] **Step 1: Write the failing test**

Append to `src/ui/mainScreen.test.js`:

```js
it('has a lair button in the nav bar', () => {
  const el = renderMainScreen({ ...base, onLair: () => {} });
  expect(el.querySelector('[data-action="lair"]')).not.toBeNull();
});
```

Append to `src/app.test.js`. That file already has a module-level `root`, a `click(action)`
helper and a `beforeEach` that clears `localStorage`, seeds one-minute blocks and creates
`root`. Reuse them. First add this seeding helper beside the existing helpers near the top
of the file, because a bed costs 40 coins and a one-minute block only earns one:

```js
// The beforeEach seed keeps blocks at one minute. Lair tests also need a dragon already
// chosen and coins already in the purse, so they re-seed before createApp.
const seedSave = (extra) =>
  window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({ settings: { workMinutes: 1, breakMinutes: 1 }, ...extra }),
  );
```

Then append the describe block:

```js
describe('lair', () => {
  const buyBed = () => {
    click('lair');
    root.querySelector('[data-slot="floorLeft"]').click();
    root.querySelector('[data-item="bed"]').click();
  };
  const floorLeftFilled = () =>
    !root.querySelector('[data-slot="floorLeft"]').classList.contains('is-empty');

  it('opens the lair from the nav bar', () => {
    seedSave({ dragonId: 'frost' });
    createApp(root);
    click('lair');
    expect(root.querySelector('.screen.lair')).not.toBeNull();
  });

  it('buys through the picker and shows the item in its slot afterwards', () => {
    seedSave({ dragonId: 'frost', coins: 100 });
    createApp(root);
    buyBed();
    expect(floorLeftFilled()).toBe(true);
  });

  it('persists a purchase across a reload', () => {
    seedSave({ dragonId: 'frost', coins: 100 });
    const app = createApp(root);
    buyBed();
    app.destroy();

    // A second createApp over the same localStorage IS the reload: beforeEach only clears
    // storage between tests, so the save written above is still there.
    root.replaceChildren();
    createApp(root);
    click('lair');
    expect(floorLeftFilled()).toBe(true);
  });

  it('leaves the other dragon\'s room untouched', () => {
    seedSave({ dragonId: 'frost', coins: 100, lairs: { blaze: { owned: ['chest'], slots: { floorRight: 'chest' } } } });
    createApp(root);
    buyBed();
    const saved = JSON.parse(window.localStorage.getItem(config.storageKey));
    expect(saved.lairs.blaze).toEqual({ owned: ['chest'], slots: { floorRight: 'chest' } });
  });
});
```

`createApp` returns `{ destroy }`, which clears its interval — call it before building the
second app so two timers do not run at once.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/app.test.js src/ui/mainScreen.test.js`
Expected: FAIL — `Cannot read properties of null (reading 'click')` on the lair button.

- [ ] **Step 3: Write minimal implementation**

In `src/ui/mainScreen.js`, inside the `<footer class="nav-bar">` template string, add a third button between the shop and settings buttons:

```js
      `<button class="icon-btn" data-action="lair"></button>` +
```

After the shop icon append, add:

```js
  section.querySelector('[data-action="lair"]').appendChild(themedIcon(theme, 'lair'));
```

and with the other listeners:

```js
  section.querySelector('[data-action="lair"]').addEventListener('click', ctx.onLair);
```

Add a `lair` entry to the default theme's `icons` in `src/data/themes.js`: `lair: '🕳️',`.

In `src/app.js`, import the new modules and add the handlers next to `onShop`:

```js
const onLair = () => {
  const dragon = getDragon(state.dragonId);
  screens.set('lair', renderLairScreen({
    state, dragon, xp: dragonXp(state), theme: resolveTheme(dragon.themeId),
    furniture, onPickSlot, onBack: render,
  }));
  screens.show('lair');
};

const onPickSlot = (slot) => {
  const dragon = getDragon(state.dragonId);
  screens.set('picker', renderSlotPicker({
    state, slot, furniture, theme: resolveTheme(dragon.themeId),
    onChoose: onChooseItem, onBack: onLair,
  }));
  screens.show('picker');
};

// Already owned means already paid for: put it back on display for free.
const onChooseItem = (item) => {
  const owned = lairOf(state, state.dragonId).owned.includes(item.id);
  state = owned ? placeItem(state, item) : buyFurniture(state, item);
  save();
  onLair();
};
```

Pass `onLair` into `renderMainScreen` in `render()`, alongside `onShop`.

`onPickSlot` is referenced by `onLair` before its own `const` runs. Define `onPickSlot` and `onChooseItem` ABOVE `onLair`, or convert all three to function declarations — do not leave a temporal-dead-zone bug.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run`
Expected: PASS, whole suite green.

- [ ] **Step 5: Commit**

```bash
git add src/app.js src/app.test.js src/ui/mainScreen.js src/ui/mainScreen.test.js src/data/themes.js
git commit -m "feat(lair): open the lair from the nav bar and persist purchases"
```

---

### Task 9: Room layout and nav-bar fit

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the class names from Tasks 6 and 7 (`.lair`, `.lair-room`, `.lair-slot`, `.is-empty`).
- Produces: no JS interface.

- [ ] **Step 1: Write the styles**

Append to `src/styles.css`. Edit the file in ONE write — rewriting it several times in quick succession makes Vite's watcher serve a half-updated stylesheet.

```css
/* The room is a fixed stage, not a flow layout: the four slots sit at known positions so
   a composition cannot come out wrong, which is the whole reason slots are fixed. */
.lair-room {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  overflow: hidden;
  background: var(--card);
}
.lair-room > .art-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lair-room > .dragon-art { position: absolute; left: 50%; top: 44%; transform: translate(-50%, -50%); width: 40%; }
.lair-slot {
  position: absolute;
  width: 22%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  font-size: 2.4rem;
}
.lair-slot[data-slot="wall"]       { left: 50%; top: 12%; transform: translateX(-50%); }
.lair-slot[data-slot="floorLeft"]  { left: 8%;  bottom: 12%; }
.lair-slot[data-slot="floorRight"] { right: 8%; bottom: 12%; }
.lair-slot[data-slot="corner"]     { left: 50%; bottom: 4%; transform: translateX(-50%); }
.lair-slot.is-empty {
  color: var(--fg);
  opacity: 0.35;
  border: 2px dashed currentColor;
  border-radius: 12px;
}
.lair-slot .art-img { width: 100%; height: 100%; object-fit: contain; }
```

- [ ] **Step 2: Check the nav bar still fits**

Run `npm run dev`, open `http://localhost:5173/pomodoro-dragon/`, and confirm in the browser console:

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

Expected: `false`. The nav bar now has three buttons at a 58px glyph and a 78×90 tap target inside a 480px maximum width. If it overflows, reduce `.icon-btn` padding from 10px to 8px — do NOT shrink the glyph, which the user explicitly asked to enlarge three times.

- [ ] **Step 3: Run the whole suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests pass, build clean.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat(lair): lay out the room and its four slots"
```

---

### Task 10: Per-theme room and furniture art

**Files:**
- Modify: `src/data/themes.js`
- Add: `public/art/lair/*.webp` (44 files)

**Interfaces:**
- Consumes: the catalogue ids and the `theme.furniture` / `theme.room` shape from Task 5.
- Produces: nothing new in code.

This task is gated on art existing. Everything above ships and works on emoji before it. Do it last, and it can be split per theme — one dragon's room at a time is a working increment.

- [ ] **Step 1: Add the art files**

For each theme (`frost`, `blaze`, `thorn`, `tempest`): one room background plus ten items, as `.webp`, under `public/art/lair/`. Naming follows the existing icon convention: `frost-room.webp`, `frost-bed.webp`, `blaze-bed.webp`, and so on.

- [ ] **Step 2: Point the themes at them**

For each of the four dragon themes in `src/data/themes.js`, add beside `foods`:

```js
    room: '/art/lair/frost-room.webp',
    furniture: {
      banner: '/art/lair/frost-banner.webp',
      painting: '/art/lair/frost-painting.webp',
      trophy: '/art/lair/frost-trophy.webp',
      bed: '/art/lair/frost-bed.webp',
      nest: '/art/lair/frost-nest.webp',
      lamp: '/art/lair/frost-lamp.webp',
      chest: '/art/lair/frost-chest.webp',
      shelf: '/art/lair/frost-shelf.webp',
      imp: '/art/lair/frost-imp.webp',
      hatchling: '/art/lair/frost-hatchling.webp',
    },
```

Paths are authored from the site root; `art()` sends them through `assetUrl()`, so they resolve under `/pomodoro-dragon/`.

- [ ] **Step 3: Verify every file actually serves**

Run `npm run build && npm run preview`, then for each path:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:4173/pomodoro-dragon/art/lair/frost-bed.webp
```

Expected: `200 image/webp` for all 44. A missing file degrades silently to the emoji fallback, so a visual check is NOT sufficient.

- [ ] **Step 4: Run the whole suite and build**

Run: `npm test -- --run && npm run build`
Expected: all tests pass, build clean.

- [ ] **Step 5: Commit**

```bash
git add public/art/lair src/data/themes.js
git commit -m "feat(lair): add the themed room and furniture art"
```
