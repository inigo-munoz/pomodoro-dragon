# Pomodoro Dragon MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of a gamified Pomodoro app for a 9-year-old: finish a work block → earn coins → buy food → feed a dragon → gain XP → level up → the dragon's image changes.

**Architecture:** Vanilla JS (ES modules) with a strict split between pure logic (`core/`), data (`data/`), persistence (`store/`), audio (`audio/`), and UI screens (`ui/`). All game math lives in pure, framework-free functions that are unit-tested. The UI is a thin layer that reads a single state object and renders it. Storage sits behind one `Store` interface so the backend can be swapped (localStorage now, native SQLite via Capacitor later) by touching one file.

**Tech Stack:** Vanilla JavaScript (ES modules), Vite (dev server + build), Vitest + jsdom (tests), plain CSS. Capacitor-ready (added post-MVP).

## Global Constraints

- Each file ideally ≤ ~200 lines of code.
- Clean architecture: one responsibility per module; content (data) separated from logic.
- Every iteration ends with a code review for dead code and duplication (DRY).
- Coins are granted only on **work** block completion, never on break.
- Wallet must never allow a negative balance (cannot buy without funds).
- The dragon's level is **derived** from XP + dragon data — never stored separately (single source of truth).
- Audio must not play before the first user tap (browser autoplay policy); global mute must be available and persisted.
- Placeholder art for MVP (emojis); final AI art replaces the `image`/`icon` fields only.
- All code, identifiers, and comments in English.

## Module Interfaces (canonical signatures — keep consistent across all tasks)

```
data/config.js   → export const config
data/dragons.js  → export const dragons; export const getDragon(id)
data/foods.js    → export const foods

core/wallet.js   → addCoins(coins, amount) → number
                   canAfford(coins, price) → boolean
                   spend(coins, price) → number   (throws if !canAfford)
core/dragon.js   → addXp(xp, amount) → number
                   currentLevel(dragon, xp) → levelObject
                   levelProgress(dragon, xp) → { ratio, current, needed, isMax }
core/timer.js    → createTimerState(settings) → state
                   start(state) → state ; pause(state) → state
                   tick(state) → { state, completed }
                   advance(state) → state
core/game.js     → grantWorkReward(state, config) → state
                   buyFood(state, food) → state   (throws if !canAfford)
                   leveledUp(dragon, oldXp, newXp) → boolean

store/store.js   → defaultState(config) → state
                   createStore(backend, config) → { save(state), load() }
store/localStorageBackend.js → localStorageBackend { read(key), write(key, value) }

audio/audio.js   → createAudio({ music, effects }) → { muted, setMuted(b),
                   toggleMute(), playMusic(), stopMusic(), playEffect(name) }

ui/screens.js       → createScreenManager(root, screens) → { show(name) }
ui/chooseDragon.js  → renderChooseDragon(ctx) → HTMLElement
ui/mainScreen.js    → renderMainScreen(ctx) → HTMLElement
ui/shopScreen.js    → renderShopScreen(ctx) → HTMLElement
ui/settingsScreen.js→ renderSettingsScreen(ctx) → HTMLElement
ui/levelUp.js       → showLevelUp(dragon, level) → void
```

The persisted game `state` shape:

```js
{ version: 1, dragonId: string|null, coins: number, xp: number,
  muted: boolean, settings: { workMinutes: number, breakMinutes: number } }
```

---

### Task 1: Project scaffold (Vite + Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/sanity.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a working dev server (`npm run dev`) and test runner (`npm test`).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pomodoro-dragon",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Pomodoro Dragon</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create placeholder `src/main.js` and `src/styles.css`**

```js
// src/main.js
document.querySelector('#app').textContent = 'Pomodoro Dragon';
```

```css
/* src/styles.css */
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
```

- [ ] **Step 5: Write the sanity test `src/sanity.test.js`**

```js
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs the test suite', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Install and verify**

Run: `npm install && npm test`
Expected: sanity test PASSES.
Run: `npm run dev` → open the URL → page shows "Pomodoro Dragon".

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.js index.html src/
git commit -m "chore: scaffold Vite + Vitest project"
```

---

### Task 2: Game data (config, dragons, foods)

**Files:**
- Create: `src/data/config.js`, `src/data/dragons.js`, `src/data/foods.js`
- Test: `src/data/dragons.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `config`, `dragons`, `getDragon(id)`, `foods`.

- [ ] **Step 1: Write the failing test `src/data/dragons.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { dragons, getDragon } from './dragons.js';

describe('dragons data', () => {
  it('has at least one dragon with 3 ascending levels', () => {
    const d = dragons[0];
    expect(d.levels).toHaveLength(3);
    expect(d.levels[0].xpNeeded).toBe(0);
    expect(d.levels[1].xpNeeded).toBeGreaterThan(d.levels[0].xpNeeded);
    expect(d.levels[2].xpNeeded).toBeGreaterThan(d.levels[1].xpNeeded);
  });

  it('getDragon returns a dragon by id and null when missing', () => {
    expect(getDragon('ember').id).toBe('ember');
    expect(getDragon('nope')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/dragons.test.js`
Expected: FAIL ("Cannot find module './dragons.js'").

- [ ] **Step 3: Create `src/data/config.js`**

```js
export const config = {
  coinsPerWork: 10,
  durations: {
    workPresets: [10, 15, 25],   // minutes
    breakPresets: [3, 5, 10],    // minutes
    customRange: { min: 1, max: 60 },
    default: { workMinutes: 15, breakMinutes: 5 },
  },
  storageKey: 'pomodoro-dragon-save-v1',
};
```

- [ ] **Step 4: Create `src/data/dragons.js` (placeholder art = emojis)**

```js
export const dragons = [
  {
    id: 'ember',
    name: 'Ember',
    levels: [
      { level: 1, xpNeeded: 0,   image: '🥚' },
      { level: 2, xpNeeded: 100, image: '🐉' },
      { level: 3, xpNeeded: 300, image: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
```

- [ ] **Step 5: Create `src/data/foods.js`**

```js
export const foods = [
  { id: 'apple', name: 'Apple', price: 10, xp: 20,  icon: '🍎' },
  { id: 'meat',  name: 'Meat',  price: 25, xp: 60,  icon: '🍖' },
  { id: 'cake',  name: 'Cake',  price: 50, xp: 150, icon: '🎂' },
];
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/data/dragons.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/
git commit -m "feat: add game data (config, dragons, foods)"
```

---

### Task 3: Wallet (coins logic)

**Files:**
- Create: `src/core/wallet.js`
- Test: `src/core/wallet.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `addCoins(coins, amount)`, `canAfford(coins, price)`, `spend(coins, price)`.

- [ ] **Step 1: Write the failing test `src/core/wallet.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { addCoins, canAfford, spend } from './wallet.js';

describe('wallet', () => {
  it('adds coins', () => {
    expect(addCoins(0, 10)).toBe(10);
    expect(addCoins(10, 5)).toBe(15);
  });

  it('reports affordability', () => {
    expect(canAfford(10, 10)).toBe(true);
    expect(canAfford(9, 10)).toBe(false);
  });

  it('spends coins when affordable', () => {
    expect(spend(50, 25)).toBe(25);
  });

  it('throws instead of allowing a negative balance', () => {
    expect(() => spend(5, 10)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/wallet.test.js`
Expected: FAIL ("Cannot find module './wallet.js'").

- [ ] **Step 3: Create `src/core/wallet.js`**

```js
export const addCoins = (coins, amount) => coins + amount;

export const canAfford = (coins, price) => coins >= price;

export const spend = (coins, price) => {
  if (!canAfford(coins, price)) {
    throw new Error('Insufficient coins');
  }
  return coins - price;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/wallet.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/wallet.js src/core/wallet.test.js
git commit -m "feat: add wallet coin logic"
```

---

### Task 4: Dragon (XP and level derivation)

**Files:**
- Create: `src/core/dragon.js`
- Test: `src/core/dragon.test.js`

**Interfaces:**
- Consumes: a `dragon` object from `data/dragons.js`.
- Produces: `addXp(xp, amount)`, `currentLevel(dragon, xp)`, `levelProgress(dragon, xp)`.

- [ ] **Step 1: Write the failing test `src/core/dragon.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { addXp, currentLevel, levelProgress } from './dragon.js';
import { getDragon } from '../data/dragons.js';

const ember = getDragon('ember'); // thresholds: 0, 100, 300

describe('dragon', () => {
  it('adds xp', () => {
    expect(addXp(0, 20)).toBe(20);
  });

  it('derives the level at exact thresholds (not before, not after)', () => {
    expect(currentLevel(ember, 0).level).toBe(1);
    expect(currentLevel(ember, 99).level).toBe(1);
    expect(currentLevel(ember, 100).level).toBe(2);
    expect(currentLevel(ember, 299).level).toBe(2);
    expect(currentLevel(ember, 300).level).toBe(3);
    expect(currentLevel(ember, 9999).level).toBe(3);
  });

  it('computes progress toward the next level', () => {
    const p = levelProgress(ember, 150); // level 2 (100..300)
    expect(p.current).toBe(50);
    expect(p.needed).toBe(200);
    expect(p.ratio).toBeCloseTo(0.25);
    expect(p.isMax).toBe(false);
  });

  it('reports max level progress as full', () => {
    const p = levelProgress(ember, 400);
    expect(p.isMax).toBe(true);
    expect(p.ratio).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/dragon.test.js`
Expected: FAIL ("Cannot find module './dragon.js'").

- [ ] **Step 3: Create `src/core/dragon.js`**

```js
export const addXp = (xp, amount) => xp + amount;

export const currentLevel = (dragon, xp) => {
  let result = dragon.levels[0];
  for (const lvl of dragon.levels) {
    if (xp >= lvl.xpNeeded) result = lvl;
  }
  return result;
};

export const levelProgress = (dragon, xp) => {
  const current = currentLevel(dragon, xp);
  const next = dragon.levels.find((l) => l.level === current.level + 1);
  if (!next) {
    return { ratio: 1, current: 0, needed: 0, isMax: true };
  }
  const into = xp - current.xpNeeded;
  const span = next.xpNeeded - current.xpNeeded;
  return { ratio: into / span, current: into, needed: span, isMax: false };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/dragon.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/dragon.js src/core/dragon.test.js
git commit -m "feat: add dragon xp and level derivation"
```

---

### Task 5: Timer (work/break state machine)

**Files:**
- Create: `src/core/timer.js`
- Test: `src/core/timer.test.js`

**Interfaces:**
- Consumes: `settings = { workMinutes, breakMinutes }`.
- Produces: `createTimerState(settings)`, `start(state)`, `pause(state)`, `tick(state)`, `advance(state)`. The real per-second interval lives in the UI driver (Task 11); this module is pure and time-free so it can be tested deterministically.

- [ ] **Step 1: Write the failing test `src/core/timer.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { createTimerState, start, pause, tick, advance } from './timer.js';

const settings = { workMinutes: 1, breakMinutes: 1 }; // 60s each

describe('timer', () => {
  it('starts in work mode, not running, full remaining', () => {
    const s = createTimerState(settings);
    expect(s.mode).toBe('work');
    expect(s.running).toBe(false);
    expect(s.remaining).toBe(60);
  });

  it('does not tick down while paused', () => {
    const s = createTimerState(settings);
    const { state, completed } = tick(s);
    expect(state.remaining).toBe(60);
    expect(completed).toBe(false);
  });

  it('ticks down one second while running', () => {
    const s = start(createTimerState(settings));
    const { state } = tick(s);
    expect(state.remaining).toBe(59);
  });

  it('signals completion when it reaches zero and stops running', () => {
    let s = start({ ...createTimerState(settings), remaining: 1 });
    const { state, completed } = tick(s);
    expect(completed).toBe(true);
    expect(state.remaining).toBe(0);
    expect(state.running).toBe(false);
  });

  it('advances from work to break and back, resetting remaining', () => {
    const work = createTimerState(settings);
    const brk = advance(work);
    expect(brk.mode).toBe('break');
    expect(brk.remaining).toBe(60);
    expect(brk.running).toBe(false);
    const back = advance(brk);
    expect(back.mode).toBe('work');
  });

  it('pause stops running', () => {
    const s = pause(start(createTimerState(settings)));
    expect(s.running).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/timer.test.js`
Expected: FAIL ("Cannot find module './timer.js'").

- [ ] **Step 3: Create `src/core/timer.js`**

```js
export const createTimerState = (settings) => ({
  mode: 'work',
  running: false,
  remaining: settings.workMinutes * 60,
  workSeconds: settings.workMinutes * 60,
  breakSeconds: settings.breakMinutes * 60,
});

export const start = (state) => ({ ...state, running: true });

export const pause = (state) => ({ ...state, running: false });

export const tick = (state) => {
  if (!state.running || state.remaining <= 0) {
    return { state, completed: false };
  }
  const remaining = state.remaining - 1;
  const completed = remaining <= 0;
  return {
    state: { ...state, remaining, running: completed ? false : true },
    completed,
  };
};

export const advance = (state) => {
  const nextMode = state.mode === 'work' ? 'break' : 'work';
  const remaining = nextMode === 'work' ? state.workSeconds : state.breakSeconds;
  return { ...state, mode: nextMode, remaining, running: false };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/timer.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/timer.js src/core/timer.test.js
git commit -m "feat: add work/break timer state machine"
```

---

### Task 6: Store (persistence behind one interface)

**Files:**
- Create: `src/store/localStorageBackend.js`, `src/store/store.js`
- Test: `src/store/store.test.js`

**Interfaces:**
- Consumes: `config` (for `storageKey` and default settings), a `backend` with `read(key)`/`write(key, value)`.
- Produces: `defaultState(config)`, `createStore(backend, config)` → `{ save(state), load() }`. `load()` returns `defaultState` when nothing is stored or the stored JSON is corrupt. This is the ONLY module that touches storage; swapping to native SQLite later means adding a new backend file, nothing else.

- [ ] **Step 1: Write the failing test `src/store/store.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { createStore, defaultState } from './store.js';
import { config } from '../data/config.js';

const memoryBackend = () => {
  const box = {};
  return {
    read: (k) => (k in box ? box[k] : null),
    write: (k, v) => { box[k] = v; },
  };
};

describe('store', () => {
  it('returns default state when nothing is saved', () => {
    const store = createStore(memoryBackend(), config);
    const s = store.load();
    expect(s.coins).toBe(0);
    expect(s.xp).toBe(0);
    expect(s.dragonId).toBeNull();
    expect(s.settings).toEqual(config.durations.default);
  });

  it('save then load returns the same state (roundtrip)', () => {
    const store = createStore(memoryBackend(), config);
    const saved = { ...defaultState(config), dragonId: 'ember', coins: 40, xp: 120 };
    store.save(saved);
    expect(store.load()).toEqual(saved);
  });

  it('falls back to defaults when stored data is corrupt', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, '{not valid json');
    const store = createStore(backend, config);
    expect(store.load().coins).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/store.test.js`
Expected: FAIL ("Cannot find module './store.js'").

- [ ] **Step 3: Create `src/store/store.js`**

```js
export const defaultState = (config) => ({
  version: 1,
  dragonId: null,
  coins: 0,
  xp: 0,
  muted: false,
  settings: { ...config.durations.default },
});

export const createStore = (backend, config) => {
  const key = config.storageKey;
  return {
    save: (state) => backend.write(key, JSON.stringify(state)),
    load: () => {
      const raw = backend.read(key);
      if (!raw) return defaultState(config);
      try {
        return { ...defaultState(config), ...JSON.parse(raw) };
      } catch {
        return defaultState(config);
      }
    },
  };
};
```

- [ ] **Step 4: Create `src/store/localStorageBackend.js`**

```js
export const localStorageBackend = {
  read: (key) => window.localStorage.getItem(key),
  write: (key, value) => window.localStorage.setItem(key, value),
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/store/store.test.js`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/store/
git commit -m "feat: add store with swappable localStorage backend"
```

---

### Task 7: Game rules (orchestration)

**Files:**
- Create: `src/core/game.js`
- Test: `src/core/game.test.js`

**Interfaces:**
- Consumes: `state`, `config`, a `food` object, a `dragon` object; uses `wallet` and `dragon` core modules.
- Produces: `grantWorkReward(state, config)`, `buyFood(state, food)`, `leveledUp(dragon, oldXp, newXp)`. All return NEW state objects (pure).

- [ ] **Step 1: Write the failing test `src/core/game.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { grantWorkReward, buyFood, leveledUp } from './game.js';
import { config } from '../data/config.js';
import { getDragon } from '../data/dragons.js';

const base = { version: 1, dragonId: 'ember', coins: 0, xp: 0, muted: false,
  settings: { workMinutes: 15, breakMinutes: 5 } };
const ember = getDragon('ember');

describe('game rules', () => {
  it('grants coins on work completion', () => {
    const s = grantWorkReward(base, config);
    expect(s.coins).toBe(config.coinsPerWork);
  });

  it('buying food spends coins and adds xp', () => {
    const rich = { ...base, coins: 100 };
    const food = { id: 'meat', price: 25, xp: 60 };
    const s = buyFood(rich, food);
    expect(s.coins).toBe(75);
    expect(s.xp).toBe(60);
  });

  it('buying food you cannot afford throws and does not mutate', () => {
    const poor = { ...base, coins: 5 };
    const food = { id: 'cake', price: 50, xp: 150 };
    expect(() => buyFood(poor, food)).toThrow();
    expect(poor.coins).toBe(5);
  });

  it('detects a level up across a threshold', () => {
    expect(leveledUp(ember, 90, 110)).toBe(true);   // crossed 100
    expect(leveledUp(ember, 110, 150)).toBe(false);  // same level
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/core/game.test.js`
Expected: FAIL ("Cannot find module './game.js'").

- [ ] **Step 3: Create `src/core/game.js`**

```js
import { addCoins, spend } from './wallet.js';
import { addXp, currentLevel } from './dragon.js';

export const grantWorkReward = (state, config) => ({
  ...state,
  coins: addCoins(state.coins, config.coinsPerWork),
});

export const buyFood = (state, food) => ({
  ...state,
  coins: spend(state.coins, food.price), // throws if !canAfford
  xp: addXp(state.xp, food.xp),
});

export const leveledUp = (dragon, oldXp, newXp) =>
  currentLevel(dragon, newXp).level > currentLevel(dragon, oldXp).level;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/core/game.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core/game.js src/core/game.test.js
git commit -m "feat: add game orchestration rules"
```

---

### Task 8: Audio (music, effects, mute)

**Files:**
- Create: `src/audio/audio.js`
- Test: `src/audio/audio.test.js`

**Interfaces:**
- Consumes: `{ music, effects }` where `music` is a URL string (or null) and `effects` is a map name→URL.
- Produces: `createAudio(...)` → `{ get muted, setMuted(b), toggleMute(), playMusic(), stopMusic(), playEffect(name) }`. Tests cover the mute-state logic (playback itself is verified manually). Passing `music: null` keeps the module test-safe under jsdom.

- [ ] **Step 1: Write the failing test `src/audio/audio.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { createAudio } from './audio.js';

describe('audio', () => {
  it('starts unmuted', () => {
    const a = createAudio({ music: null, effects: {} });
    expect(a.muted).toBe(false);
  });

  it('toggles and sets mute', () => {
    const a = createAudio({ music: null, effects: {} });
    expect(a.toggleMute()).toBe(true);
    expect(a.muted).toBe(true);
    expect(a.setMuted(false)).toBe(false);
    expect(a.muted).toBe(false);
  });

  it('does not throw when playing effects while muted', () => {
    const a = createAudio({ music: null, effects: {} });
    a.setMuted(true);
    expect(() => a.playEffect('bell')).not.toThrow();
    expect(() => a.playMusic()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/audio/audio.test.js`
Expected: FAIL ("Cannot find module './audio.js'").

- [ ] **Step 3: Create `src/audio/audio.js`**

```js
export const createAudio = ({ music, effects }) => {
  let muted = false;
  const bg = music ? new Audio(music) : null;
  if (bg) { bg.loop = true; bg.volume = 0.4; }

  const makers = {};
  for (const [name, src] of Object.entries(effects ?? {})) {
    makers[name] = () => new Audio(src);
  }

  const api = {
    get muted() { return muted; },
    setMuted(value) {
      muted = value;
      if (bg) bg.muted = value;
      return muted;
    },
    toggleMute() { return api.setMuted(!muted); },
    playMusic() { if (bg && !muted) bg.play().catch(() => {}); },
    stopMusic() { if (bg) bg.pause(); },
    playEffect(name) {
      if (muted || !makers[name]) return;
      makers[name]().play().catch(() => {});
    },
  };
  return api;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/audio/audio.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/audio/
git commit -m "feat: add audio module with mute control"
```

---

### Task 9: Screen manager (show/hide screens)

**Files:**
- Create: `src/ui/screens.js`
- Test: `src/ui/screens.test.js`

**Interfaces:**
- Consumes: a `root` HTMLElement and a `screens` map name→HTMLElement.
- Produces: `createScreenManager(root, screens)` → `{ show(name) }`. `show` appends only the active screen's element and marks it visible; others are detached. Used by every UI task and by `main.js` (Task 15).

- [ ] **Step 1: Write the failing test `src/ui/screens.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { createScreenManager } from './screens.js';

describe('screen manager', () => {
  it('shows only the requested screen', () => {
    const root = document.createElement('div');
    const a = document.createElement('section'); a.textContent = 'A';
    const b = document.createElement('section'); b.textContent = 'B';
    const mgr = createScreenManager(root, { a, b });

    mgr.show('a');
    expect(root.textContent).toBe('A');

    mgr.show('b');
    expect(root.textContent).toBe('B');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/screens.test.js`
Expected: FAIL ("Cannot find module './screens.js'").

- [ ] **Step 3: Create `src/ui/screens.js`**

```js
export const createScreenManager = (root, screens) => ({
  show(name) {
    root.replaceChildren();
    const el = screens[name];
    if (el) root.appendChild(el);
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/screens.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/screens.js src/ui/screens.test.js
git commit -m "feat: add screen manager"
```

---

### Task 10: Shop screen (affordability logic is unit-tested)

**Files:**
- Create: `src/ui/shopScreen.js`
- Test: `src/ui/shopScreen.test.js`

**Interfaces:**
- Consumes: a render context `ctx = { state, foods, onBuy(food), onBack() }`.
- Produces: `renderShopScreen(ctx)` → HTMLElement. Each food is a `.food-card`; a card the player cannot afford gets the `disabled` attribute and a `dimmed` class, and clicking it does not call `onBuy`. This affordability behavior is the testable core of the screen.

- [ ] **Step 1: Write the failing test `src/ui/shopScreen.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { renderShopScreen } from './shopScreen.js';

const foods = [
  { id: 'apple', name: 'Apple', price: 10, xp: 20, icon: '🍎' },
  { id: 'cake',  name: 'Cake',  price: 50, xp: 150, icon: '🎂' },
];

describe('shop screen', () => {
  it('dims foods the player cannot afford and blocks their purchase', () => {
    const onBuy = vi.fn();
    const el = renderShopScreen({
      state: { coins: 10 }, foods, onBuy, onBack: () => {},
    });
    const cards = el.querySelectorAll('.food-card');
    expect(cards).toHaveLength(2);

    const cake = el.querySelector('[data-food="cake"]');
    expect(cake.classList.contains('dimmed')).toBe(true);
    cake.click();
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('buys an affordable food on click', () => {
    const onBuy = vi.fn();
    const el = renderShopScreen({
      state: { coins: 10 }, foods, onBuy, onBack: () => {},
    });
    el.querySelector('[data-food="apple"]').click();
    expect(onBuy).toHaveBeenCalledWith(foods[0]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/shopScreen.test.js`
Expected: FAIL ("Cannot find module './shopScreen.js'").

- [ ] **Step 3: Create `src/ui/shopScreen.js`**

```js
import { canAfford } from '../core/wallet.js';

export const renderShopScreen = ({ state, foods, onBuy, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen shop';

  const back = document.createElement('button');
  back.className = 'back-btn';
  back.textContent = '← Back';
  back.addEventListener('click', onBack);
  section.appendChild(back);

  const grid = document.createElement('div');
  grid.className = 'food-grid';

  for (const food of foods) {
    const affordable = canAfford(state.coins, food.price);
    const card = document.createElement('button');
    card.className = 'food-card' + (affordable ? '' : ' dimmed');
    card.dataset.food = food.id;
    card.disabled = !affordable;
    card.innerHTML =
      `<span class="food-icon">${food.icon}</span>` +
      `<span class="food-name">${food.name}</span>` +
      `<span class="food-price">🪙 ${food.price}</span>` +
      `<span class="food-xp">+${food.xp} XP</span>`;
    card.addEventListener('click', () => {
      if (affordable) onBuy(food);
    });
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/shopScreen.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/shopScreen.js src/ui/shopScreen.test.js
git commit -m "feat: add shop screen with affordability gating"
```

---

### Task 11: Choose-dragon screen

**Files:**
- Create: `src/ui/chooseDragon.js`
- Test: `src/ui/chooseDragon.test.js`

**Interfaces:**
- Consumes: `ctx = { dragons, onPick(dragonId) }`.
- Produces: `renderChooseDragon(ctx)` → HTMLElement. Renders one `.dragon-choice` per dragon (showing its level-1 image); clicking calls `onPick(dragon.id)`.

- [ ] **Step 1: Write the failing test `src/ui/chooseDragon.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { renderChooseDragon } from './chooseDragon.js';
import { dragons } from '../data/dragons.js';

describe('choose dragon screen', () => {
  it('renders a choice per dragon and reports the picked id', () => {
    const onPick = vi.fn();
    const el = renderChooseDragon({ dragons, onPick });
    const choices = el.querySelectorAll('.dragon-choice');
    expect(choices).toHaveLength(dragons.length);
    el.querySelector('[data-dragon="ember"]').click();
    expect(onPick).toHaveBeenCalledWith('ember');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/chooseDragon.test.js`
Expected: FAIL ("Cannot find module './chooseDragon.js'").

- [ ] **Step 3: Create `src/ui/chooseDragon.js`**

```js
export const renderChooseDragon = ({ dragons, onPick }) => {
  const section = document.createElement('section');
  section.className = 'screen choose-dragon';

  const title = document.createElement('h1');
  title.textContent = 'Choose your dragon!';
  section.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'dragon-grid';

  for (const dragon of dragons) {
    const choice = document.createElement('button');
    choice.className = 'dragon-choice';
    choice.dataset.dragon = dragon.id;
    choice.innerHTML =
      `<span class="dragon-art">${dragon.levels[0].image}</span>` +
      `<span class="dragon-name">${dragon.name}</span>`;
    choice.addEventListener('click', () => onPick(dragon.id));
    grid.appendChild(choice);
  }

  section.appendChild(grid);
  return section;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/chooseDragon.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/chooseDragon.js src/ui/chooseDragon.test.js
git commit -m "feat: add choose-dragon screen"
```

---

### Task 12: Settings screen (work/break durations)

**Files:**
- Create: `src/ui/settingsScreen.js`
- Test: `src/ui/settingsScreen.test.js`

**Interfaces:**
- Consumes: `ctx = { settings, config, onChange({ workMinutes, breakMinutes }), onBack() }`.
- Produces: `renderSettingsScreen(ctx)` → HTMLElement. Renders preset buttons for work and break from `config.durations.workPresets`/`breakPresets`, plus +/− custom steppers clamped to `config.durations.customRange`. Any change calls `onChange` with the full new settings object.

- [ ] **Step 1: Write the failing test `src/ui/settingsScreen.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { renderSettingsScreen } from './settingsScreen.js';
import { config } from '../data/config.js';

const settings = { workMinutes: 15, breakMinutes: 5 };

describe('settings screen', () => {
  it('selecting a work preset reports the new settings', () => {
    const onChange = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange, onBack: () => {} });
    el.querySelector('[data-work-preset="25"]').click();
    expect(onChange).toHaveBeenCalledWith({ workMinutes: 25, breakMinutes: 5 });
  });

  it('the + stepper increases work minutes within range', () => {
    const onChange = vi.fn();
    const el = renderSettingsScreen({ settings, config, onChange, onBack: () => {} });
    el.querySelector('[data-step="work-plus"]').click();
    expect(onChange).toHaveBeenCalledWith({ workMinutes: 16, breakMinutes: 5 });
  });

  it('does not step below the minimum of the range', () => {
    const onChange = vi.fn();
    const atMin = { workMinutes: config.durations.customRange.min, breakMinutes: 5 };
    const el = renderSettingsScreen({ settings: atMin, config, onChange, onBack: () => {} });
    el.querySelector('[data-step="work-minus"]').click();
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/settingsScreen.test.js`
Expected: FAIL ("Cannot find module './settingsScreen.js'").

- [ ] **Step 3: Create `src/ui/settingsScreen.js`**

```js
const clamp = (n, { min, max }) => Math.min(max, Math.max(min, n));

export const renderSettingsScreen = ({ settings, config, onChange, onBack }) => {
  const range = config.durations.customRange;
  const section = document.createElement('section');
  section.className = 'screen settings';

  const emit = (next) => onChange({ ...settings, ...next });

  const group = (label, key, presets, stepPrefix) => {
    const wrap = document.createElement('div');
    wrap.className = 'setting-group';
    wrap.innerHTML = `<h2>${label}: <span class="value">${settings[key]}</span> min</h2>`;

    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    for (const p of presets) {
      const btn = document.createElement('button');
      btn.className = 'preset' + (settings[key] === p ? ' active' : '');
      btn.dataset[`${stepPrefix}Preset`] = String(p);
      btn.textContent = `${p}`;
      btn.addEventListener('click', () => emit({ [key]: p }));
      presetRow.appendChild(btn);
    }
    wrap.appendChild(presetRow);

    const stepRow = document.createElement('div');
    stepRow.className = 'step-row';
    const minus = document.createElement('button');
    minus.dataset.step = `${stepPrefix}-minus`;
    minus.textContent = '−';
    minus.addEventListener('click', () => {
      const next = clamp(settings[key] - 1, range);
      if (next !== settings[key]) emit({ [key]: next });
    });
    const plus = document.createElement('button');
    plus.dataset.step = `${stepPrefix}-plus`;
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      const next = clamp(settings[key] + 1, range);
      if (next !== settings[key]) emit({ [key]: next });
    });
    stepRow.append(minus, plus);
    wrap.appendChild(stepRow);
    return wrap;
  };

  section.appendChild(group('Work', 'workMinutes', config.durations.workPresets, 'work'));
  section.appendChild(group('Break', 'breakMinutes', config.durations.breakPresets, 'break'));

  const back = document.createElement('button');
  back.className = 'back-btn';
  back.textContent = '← Back';
  back.addEventListener('click', onBack);
  section.appendChild(back);

  return section;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/settingsScreen.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/settingsScreen.js src/ui/settingsScreen.test.js
git commit -m "feat: add settings screen for work/break durations"
```

---

### Task 13: Level-up celebration

**Files:**
- Create: `src/ui/levelUp.js`
- Test: `src/ui/levelUp.test.js`

**Interfaces:**
- Consumes: a `dragon` object and the new `level` object; optional `onAudio()` callback for the fanfare.
- Produces: `showLevelUp(dragon, level, onAudio)` → appends a `.level-up-overlay` to `document.body` showing the new image, and removes it on click/tap. The overlay presence and removal are the testable parts.

- [ ] **Step 1: Write the failing test `src/ui/levelUp.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { showLevelUp } from './levelUp.js';

describe('level up celebration', () => {
  it('shows an overlay with the new level image and dismisses on click', () => {
    const onAudio = vi.fn();
    showLevelUp({ name: 'Ember' }, { level: 2, image: '🐉' }, onAudio);
    const overlay = document.querySelector('.level-up-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('🐉');
    expect(onAudio).toHaveBeenCalled();

    overlay.click();
    expect(document.querySelector('.level-up-overlay')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/levelUp.test.js`
Expected: FAIL ("Cannot find module './levelUp.js'").

- [ ] **Step 3: Create `src/ui/levelUp.js`**

```js
export const showLevelUp = (dragon, level, onAudio) => {
  if (onAudio) onAudio();
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML =
    `<div class="level-up-card">` +
    `<p class="level-up-title">Level up!</p>` +
    `<div class="level-up-art">${level.image}</div>` +
    `<p class="level-up-sub">${dragon.name} is now level ${level.level}</p>` +
    `</div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/levelUp.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/levelUp.js src/ui/levelUp.test.js
git commit -m "feat: add level-up celebration overlay"
```

---

### Task 14: Main screen (dragon, coins, timer, controls)

**Files:**
- Create: `src/ui/mainScreen.js`
- Test: `src/ui/mainScreen.test.js`

**Interfaces:**
- Consumes: `ctx = { state, dragon, timerState, onStart(), onPause(), onBreak(), onShop(), onSettings(), onToggleMute() }`.
- Produces: `renderMainScreen(ctx)` → HTMLElement showing the current-level dragon image, coin counter, an XP progress bar (via `levelProgress`), a formatted `mm:ss` timer, a mode label ("Work"/"Break"), and buttons. Button visibility rules: show **Start** when not running and not just-completed; show **Pause** when running; show **☕ Break** only when a work block just completed (`timerState.mode === 'work' && timerState.remaining === 0`).

- [ ] **Step 1: Write the failing test `src/ui/mainScreen.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { renderMainScreen } from './mainScreen.js';
import { getDragon } from '../data/dragons.js';

const dragon = getDragon('ember');
const base = {
  state: { coins: 30, xp: 150 },
  dragon,
  onStart: vi.fn(), onPause: vi.fn(), onBreak: vi.fn(),
  onShop: vi.fn(), onSettings: vi.fn(), onToggleMute: vi.fn(),
};

describe('main screen', () => {
  it('shows coins and the current-level dragon image', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 900, running: false },
    });
    expect(el.querySelector('.coin-counter').textContent).toContain('30');
    // xp 150 → level 2 → image 🐉
    expect(el.querySelector('.dragon-art').textContent).toContain('🐉');
  });

  it('formats the remaining time as mm:ss', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 65, running: true },
    });
    expect(el.querySelector('.timer-display').textContent).toBe('01:05');
  });

  it('shows the Break button only when a work block just completed', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 0, running: false },
    });
    const breakBtn = el.querySelector('[data-action="break"]');
    expect(breakBtn).not.toBeNull();
    breakBtn.click();
    expect(base.onBreak).toHaveBeenCalled();
  });

  it('shows Pause while running and calls onPause', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 800, running: true },
    });
    const pause = el.querySelector('[data-action="pause"]');
    expect(pause).not.toBeNull();
    pause.click();
    expect(base.onPause).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/mainScreen.test.js`
Expected: FAIL ("Cannot find module './mainScreen.js'").

- [ ] **Step 3: Create `src/ui/mainScreen.js`**

```js
import { currentLevel, levelProgress } from '../core/dragon.js';

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const renderMainScreen = (ctx) => {
  const { state, dragon, timerState } = ctx;
  const level = currentLevel(dragon, state.xp);
  const progress = levelProgress(dragon, state.xp);
  const justFinishedWork =
    timerState.mode === 'work' && timerState.remaining === 0 && !timerState.running;

  const section = document.createElement('section');
  section.className = 'screen main';
  section.innerHTML =
    `<header class="top-bar">` +
      `<span class="coin-counter">🪙 ${state.coins}</span>` +
      `<span class="mode-label">${timerState.mode === 'work' ? 'Work' : 'Break'}</span>` +
      `<button class="icon-btn" data-action="mute">🔇</button>` +
    `</header>` +
    `<div class="dragon-stage"><span class="dragon-art">${level.image}</span></div>` +
    `<div class="xp-bar"><div class="xp-fill" style="width:${Math.round(progress.ratio * 100)}%"></div></div>` +
    `<p class="timer-display">${fmt(timerState.remaining)}</p>` +
    `<div class="controls"></div>` +
    `<footer class="nav-bar">` +
      `<button class="icon-btn" data-action="shop">🍎</button>` +
      `<button class="icon-btn" data-action="settings">⚙️</button>` +
    `</footer>`;

  const controls = section.querySelector('.controls');
  if (justFinishedWork) {
    controls.appendChild(button('☕ Break', 'break', ctx.onBreak, 'primary'));
  } else if (timerState.running) {
    controls.appendChild(button('⏸ Pause', 'pause', ctx.onPause, 'primary'));
  } else {
    controls.appendChild(button('▶ Start studying', 'start', ctx.onStart, 'primary'));
  }

  section.querySelector('[data-action="mute"]').addEventListener('click', ctx.onToggleMute);
  section.querySelector('[data-action="shop"]').addEventListener('click', ctx.onShop);
  section.querySelector('[data-action="settings"]').addEventListener('click', ctx.onSettings);
  return section;
};

const button = (label, action, handler, cls = '') => {
  const b = document.createElement('button');
  b.className = `big-btn ${cls}`.trim();
  b.dataset.action = action;
  b.textContent = label;
  b.addEventListener('click', handler);
  return b;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/mainScreen.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/mainScreen.js src/ui/mainScreen.test.js
git commit -m "feat: add main screen with timer and controls"
```

---

### Task 15: App wiring (main.js) + styles

**Files:**
- Create: `src/app.js`, `src/styles.css` (replace placeholder)
- Modify: `src/main.js`

**Interfaces:**
- Consumes: every module above.
- Produces: a running app. `src/app.js` exports `createApp(root, deps)` holding the single mutable `state`, the `timerState`, a `render()` that rebuilds the current screen, the per-second `setInterval` driver calling `timer.tick`, and all the `on*` handlers wired to core rules + `store.save`. `src/main.js` just constructs real dependencies and calls `createApp`.

- [ ] **Step 1: Create `src/app.js`**

```js
import { config } from './data/config.js';
import { dragons, getDragon } from './data/dragons.js';
import { foods } from './data/foods.js';
import { createStore } from './store/store.js';
import { localStorageBackend } from './store/localStorageBackend.js';
import { createAudio } from './audio/audio.js';
import { createScreenManager } from './ui/screens.js';
import { renderChooseDragon } from './ui/chooseDragon.js';
import { renderMainScreen } from './ui/mainScreen.js';
import { renderShopScreen } from './ui/shopScreen.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
import { showLevelUp } from './ui/levelUp.js';
import { createTimerState, start, pause, tick, advance } from './core/timer.js';
import { grantWorkReward, buyFood, leveledUp } from './core/game.js';

export const createApp = (root) => {
  const store = createStore(localStorageBackend, config);
  const audio = createAudio({ music: null, effects: {} }); // wire real assets later
  let state = store.load();
  audio.setMuted(state.muted);
  let timerState = createTimerState(state.settings);

  const save = () => store.save(state);

  const render = () => {
    if (!state.dragonId) {
      screens.set('choose', renderChooseDragon({ dragons, onPick }));
      return screens.show('choose');
    }
    const dragon = getDragon(state.dragonId);
    screens.set('main', renderMainScreen({
      state, dragon, timerState,
      onStart, onPause, onBreak, onShop, onSettings, onToggleMute,
    }));
    screens.show('main');
  };

  // --- handlers ---
  const onPick = (id) => { state = { ...state, dragonId: id }; save(); render(); };

  const onStart = () => {
    timerState = start(timerState);
    audio.playMusic();
    render();
  };
  const onPause = () => { timerState = pause(timerState); render(); };

  const onBreak = () => { timerState = advance(timerState); timerState = start(timerState); render(); };

  const onShop = () => {
    const dragon = getDragon(state.dragonId);
    screens.set('shop', renderShopScreen({
      state, foods,
      onBuy: (food) => {
        const oldXp = state.xp;
        state = buyFood(state, food);
        save();
        audio.playEffect('eat');
        if (leveledUp(dragon, oldXp, state.xp)) {
          const { currentLevel } = { currentLevel: dragon.levels.find };
          showLevelUp(dragon, dragon.levels.find(
            (l) => l.xpNeeded <= state.xp) && lvlAt(dragon, state.xp),
            () => audio.playEffect('levelup'));
        }
        onShop(); // re-render shop with updated coins/xp
      },
      onBack: render,
    }));
    screens.show('shop');
  };

  const onSettings = () => {
    screens.set('settings', renderSettingsScreen({
      settings: state.settings, config,
      onChange: (settings) => {
        state = { ...state, settings };
        save();
        if (!timerState.running) timerState = createTimerState(settings);
        onSettings();
      },
      onBack: render,
    }));
    screens.show('settings');
  };

  const onToggleMute = () => {
    const muted = audio.toggleMute();
    state = { ...state, muted };
    save();
    if (muted) audio.stopMusic(); else audio.playMusic();
    render();
  };

  const screens = createScreenManagerWithCache(root);

  // --- per-second driver ---
  setInterval(() => {
    if (!timerState.running) return;
    const result = tick(timerState);
    timerState = result.state;
    if (result.completed && timerState.mode === 'work') {
      state = grantWorkReward(state, config);
      save();
      audio.playEffect('bell');
    }
    render();
  }, 1000);

  render();
};

// helper: level object for an xp value
const lvlAt = (dragon, xp) => {
  let r = dragon.levels[0];
  for (const l of dragon.levels) if (xp >= l.xpNeeded) r = l;
  return r;
};

// screen manager with a small cache so we can pre-build then show by name
const createScreenManagerWithCache = (root) => {
  const cache = {};
  const mgr = createScreenManager(root, cache);
  return { set: (name, el) => { cache[name] = el; }, show: mgr.show };
};
```

> Implementation note for the engineer: Step 1 is intentionally the "first
> draft" wiring. Steps 2–3 below clean it up — the `onShop` level-up block
> above is deliberately convoluted and MUST be simplified using `lvlAt`
> before you commit. Do not ship the tangled version.

- [ ] **Step 2: Simplify the level-up branch in `onShop`**

Replace the `onBuy` body with this clean version (uses the shared `lvlAt` helper, no dead code):

```js
      onBuy: (food) => {
        const oldXp = state.xp;
        state = buyFood(state, food);
        save();
        audio.playEffect('eat');
        if (leveledUp(dragon, oldXp, state.xp)) {
          showLevelUp(dragon, lvlAt(dragon, state.xp),
            () => audio.playEffect('levelup'));
        }
        onShop(); // re-render shop with updated coins/xp
      },
```

- [ ] **Step 3: Replace `src/main.js`**

```js
import { createApp } from './app.js';

createApp(document.querySelector('#app'));
```

- [ ] **Step 4: Write `src/styles.css` (mobile-first, big touch targets)**

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #1b1030;
  color: #fff;
  -webkit-user-select: none;
  user-select: none;
}
#app { max-width: 480px; margin: 0 auto; min-height: 100vh; }
.screen { display: flex; flex-direction: column; align-items: center; padding: 16px; gap: 16px; min-height: 100vh; }

.top-bar, .nav-bar { display: flex; justify-content: space-between; width: 100%; align-items: center; }
.coin-counter { font-size: 1.4rem; font-weight: 700; }
.mode-label { font-size: 1.1rem; opacity: 0.8; }

.dragon-stage { flex: 1; display: flex; align-items: center; justify-content: center; }
.dragon-art { font-size: 6rem; }

.xp-bar { width: 100%; height: 18px; background: #33224d; border-radius: 9px; overflow: hidden; }
.xp-fill { height: 100%; background: #6cf; transition: width 0.3s ease; }

.timer-display { font-size: 3rem; font-variant-numeric: tabular-nums; margin: 0; }

.big-btn { font-size: 1.5rem; padding: 18px 28px; border: none; border-radius: 16px; background: #6c3; color: #06210a; font-weight: 700; }
.big-btn.primary { min-width: 240px; }
.icon-btn { font-size: 1.6rem; background: none; border: none; padding: 8px; }

.food-grid, .dragon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
.food-card, .dragon-choice { display: flex; flex-direction: column; gap: 4px; padding: 14px; border: none; border-radius: 16px; background: #2c1c4a; color: #fff; }
.food-card.dimmed { opacity: 0.4; }
.food-icon, .dragon-art { font-size: 2.5rem; }

.setting-group { width: 100%; }
.preset-row, .step-row { display: flex; gap: 10px; }
.preset, .step-row button { font-size: 1.3rem; padding: 12px 18px; border: none; border-radius: 12px; background: #2c1c4a; color: #fff; }
.preset.active { background: #6c3; color: #06210a; }

.back-btn { align-self: flex-start; font-size: 1.1rem; background: none; border: none; color: #9af; }

.level-up-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; }
.level-up-card { text-align: center; }
.level-up-title { font-size: 2rem; }
.level-up-art { font-size: 7rem; animation: pop 0.5s ease; }
@keyframes pop { 0% { transform: scale(0.2); } 100% { transform: scale(1); } }
```

- [ ] **Step 5: Manual verification (the fun part)**

Run: `npm run dev` → open on a phone-sized viewport (or the tablet).
Check the full loop by hand:
1. Choose the dragon → main screen appears.
2. Set a short work time (e.g. custom to 1 min via settings) → Start → wait → bell, coins go up, ☕ Break appears.
3. Tap Break → break counts down.
4. Open shop → buy an affordable food → XP bar rises; unaffordable food is dimmed.
5. Buy enough to cross 100 XP → level-up overlay shows the new dragon image.
6. Toggle mute → music stops; reload → mute preference and progress persist.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: ALL tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: wire app screens, timer loop, and styles"
```

---

### Task 16: PWA (installable, offline)

**Files:**
- Create: `public/manifest.webmanifest`, `public/icon-192.png`, `public/icon-512.png`, `src/registerSW.js`
- Modify: `index.html`, `vite.config.js`, `src/main.js`

**Interfaces:**
- Consumes: the built app.
- Produces: an installable PWA ("Add to home screen") that launches full-screen and works offline. Uses `vite-plugin-pwa` for the service worker so offline caching is generated at build time.

- [ ] **Step 1: Add the PWA plugin**

Run: `npm install -D vite-plugin-pwa`

- [ ] **Step 2: Configure the plugin in `vite.config.js`**

```js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pomodoro Dragon',
        short_name: 'Dragon',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1b1030',
        theme_color: '#1b1030',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom' },
});
```

- [ ] **Step 3: Add placeholder icons**

Create `public/icon-192.png` and `public/icon-512.png` (any square dragon
image for now; replace with final art later). A quick placeholder: a solid
`#1b1030` square with a 🐲 — export at 192×192 and 512×512.

- [ ] **Step 4: Verify install + offline**

Run: `npm run build && npm run preview`
- Open in Chrome on the tablet → menu → *Add to home screen* → launches full-screen without the browser bar.
- Turn off Wi-Fi → relaunch → the app still loads and the saved dragon is intact.

- [ ] **Step 5: Commit**

```bash
git add vite.config.js public/ index.html src/
git commit -m "feat: make the app an installable offline PWA"
```

---

### Task 17: Iteration close — code review (dead code + DRY)

**Files:** whole `src/` tree.

**Interfaces:** none — this is the mandatory end-of-iteration review from the Global Constraints.

- [ ] **Step 1: Dead-code sweep**

Run: `npx vite build` and scan for unused exports/imports. Manually check
each `src/` file: is everything exported actually consumed? Remove anything
that isn't (e.g. leftover helpers).

- [ ] **Step 2: DRY sweep**

Look for duplicated logic that a module already owns. Specific checks:
- Level-object lookup: `app.js` `lvlAt` duplicates `core/dragon.js`
  `currentLevel`. **Replace `lvlAt` with `currentLevel`** and delete
  `lvlAt`. Update the `onBuy` handler accordingly.
- Any `mm:ss` formatting outside `mainScreen.js` → there should be exactly
  one formatter.
- Any coin/xp arithmetic outside `core/` → move it into `wallet`/`dragon`.

- [ ] **Step 3: File-size check**

Confirm no file exceeds ~200 lines. If one does (likely `app.js`), extract
the screen-navigation handlers into `src/ui/navigation.js` and keep `app.js`
as thin wiring.

- [ ] **Step 4: Run the full suite after refactors**

Run: `npm test`
Expected: ALL tests still PASS (refactors must not change behavior).

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "refactor: remove dead code and duplication after MVP iteration"
```

---

## Self-Review (author checklist — completed)

**Spec coverage:**
- Core loop (earn → buy → feed → XP → level → image) → Tasks 3, 4, 7, 14, 15.
- Completed-work-only coins → Task 5 (mode) + Task 15 driver (grants only on `mode === 'work'`).
- Manual break start → Task 5 `advance` + Task 14 Break button + Task 15 `onBreak`.
- Configurable work/break (presets + custom) → Tasks 2 (data) + 12 (screen).
- Dragon image changes by level → Task 4 `currentLevel` + Task 14 render.
- Dimmed unaffordable food → Task 10.
- Store swappable (localStorage now) → Task 6.
- Audio + mute persisted → Tasks 8, 15.
- ≤200-line files + clean split → enforced structure + Task 17.
- End-of-iteration dead-code/DRY review → Task 17.
- Placeholder emoji art, English artifacts, PWA installable/offline → Tasks 2, 16.
- TDD on money/level/timer/store math → Tasks 3–7.

**Placeholder scan:** No "TBD"/"implement later" left. The one deliberately
messy block in Task 15 Step 1 is explicitly flagged and fixed in Step 2 and
Task 17 — this models the DRY review the user asked for, not a plan gap.

**Type consistency:** `currentLevel`, `levelProgress`, `createTimerState`,
`tick`, `advance`, `grantWorkReward`, `buyFood`, `leveledUp`,
`createStore`/`defaultState`, `createAudio`, `renderMainScreen` signatures
match across all tasks and the Module Interfaces table.

## Out of scope (post-MVP)
- Capacitor APK wrapper + native SQLite backend (swap `localStorageBackend`).
- Multiple dragons, more levels, special foods, achievements.
- Final AI-generated art and real audio assets.
