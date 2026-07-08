# Second Dragon (Blaze) + Per-Dragon Progress — Design Spec

## Goal

Add a second dragon, **Blaze** (fire/ember), that the child can switch to and grow
independently. Each dragon grows from its own egg with its own XP/level; coins are a
shared wallet. The theming system re-skins the whole app to the active dragon.

## Motivation

The theming system (shipped) already makes a dragon a data entry + theme + art. But
today XP is a single global number and the dragon can only be chosen ONCE (when
`dragonId` is null), so a child who already picked Frost can never reach a new dragon,
and a second dragon would inherit Frost's XP. This change makes dragons a real
*collection*: switchable, each grown from its own egg.

## Non-Goals

- Per-dragon coins (coins stay a single shared wallet).
- Unlock/purchase gating for dragons (all dragons are freely selectable).
- More than two dragons (the design generalizes to N, but only Blaze is added now).
- Real audio/art assets are out of scope for the code work — art is generated
  separately and slots in via the existing emoji fallback.

## Architecture

### 1. Data model: XP becomes per-dragon

Today (`src/store/store.js`):
```js
{ version: 1, dragonId: null, coins: 0, xp: 0, muted: false, settings }
```

New:
```js
{ version: 2, dragonId: null, coins: 0, xpByDragon: {}, muted: false, settings }
```

- `xpByDragon` maps `dragonId -> xp` (a plain object; missing key means 0).
- `coins` stays global (shared wallet — unchanged).
- The **active dragon's** XP is `state.xpByDragon[state.dragonId] ?? 0`. A single
  accessor centralizes this:
  ```js
  // src/core/game.js (or dragon.js)
  export const dragonXp = (state) => state.xpByDragon?.[state.dragonId] ?? 0;
  export const addDragonXp = (state, amount) => ({
    ...state,
    xpByDragon: {
      ...state.xpByDragon,
      [state.dragonId]: (state.xpByDragon?.[state.dragonId] ?? 0) + amount,
    },
  });
  ```
- `buyFood` uses `addDragonXp` instead of the old global `addXp`. Spend FIRST so an
  unaffordable purchase throws before any XP work happens:
  ```js
  export const buyFood = (state, food) => {
    const coins = spend(state.coins, food.price); // throws if !canAfford
    return { ...addDragonXp(state, food.xp), coins };
  };
  ```
- `src/core/dragon.js` (`currentLevel`, `levelProgress`) is UNCHANGED — it already
  takes `(dragon, xp)`. Callers pass the active dragon's XP.

### 2. Migration (v1 → v2)

`store.load()` upgrades old saves so no child loses progress:
- If parsed state has `version < 2` (or lacks `xpByDragon`), build
  `xpByDragon = parsed.dragonId ? { [parsed.dragonId]: parsed.xp ?? 0 } : {}`,
  delete the old `xp`, set `version: 2`.
- A brand-new save uses `defaultState` (already v2, `xpByDragon: {}`).
- Keep the existing `{ ...defaultState, ...parsed }` merge; run the migration on the
  merged result so defaults fill any missing fields.

### 3. Switch-dragon UX

- The chooser (`renderChooseDragon`) already iterates `dragons[]` and calls `onPick`.
  Reuse it for switching — no new selection UI.
- Add a **"Change Dragon"** button INSIDE the Settings screen
  (`renderSettingsScreen`), reached via the existing ⚙️ on the main screen. It calls a
  new `onChangeDragon` handler that shows the chooser.
- `onPick(id)` already sets `dragonId`, saves, and renders — reuse as-is. Picking Blaze
  when its `xpByDragon.blaze` is absent shows Blaze at level 1 (egg). Switching back to
  Frost restores Frost's level. Collection achieved.
- The chooser should indicate the currently-active dragon (e.g. a "current" marker) so
  the child knows which they're on — small polish, part of this change.

### 4. Blaze content

- `src/data/dragons.js`: add a `blaze` dragon — `id: 'blaze'`, `name: 'Blaze'`,
  `themeId: 'blaze'`, four levels (xpNeeded 0/100/300/600, same thresholds as Frost)
  pointing at `/art/dragons/blaze-{egg,baby,young,adult}.webp` with the same emoji
  fallbacks (🥚🐣🐉🐲).
- `src/data/themes.js`: add a `blaze` theme keyed like `frost`:
  - **palette** (fire, approved): `bg #1f0a08`, `accent #ff6b1a`, `accent-fg #2a0f00`,
    `xp-fill #ffc24d`, `card #3a1a12`, `back-btn #ffb37a`. `fg` omitted → falls back to
    default `#ffffff`.
  - **icons**: `/art/icons/blaze-{coin,shop,settings,mute,break}.webp`.
  - **foods**: `/art/foods/blaze-{apple,meat,cake}.webp`.
- Everything degrades to the default emoji until the art exists (existing `art()` /
  `themedIcon` error-fallback behavior), so the code ships and is testable now.

### 5. Art (generated separately)

12 Blaze images, generated in Gemini from prompts added to `docs/art-prompts.md`
(fire/ember aesthetic mirroring the frost prompt structure): dragon egg/baby/young/adult,
foods apple/meat/cake, UI icons coin/shop/settings/mute/break. Pipeline identical to the
frost assets (transparent PNG → `art-src/<group>/blaze-*.png` → 512px webp in
`public/art/<group>/`). Background-cutout model per subject type (character → isnet-anime;
object/icon → isnet-general-use). This is a follow-up art task, NOT part of the code plan.

## Component / Interface Impact

| File | Change |
|------|--------|
| `src/store/store.js` | `defaultState` → v2 + `xpByDragon`; migration in `load()` |
| `src/core/game.js` | `dragonXp`, `addDragonXp`; `buyFood` uses `addDragonXp` |
| `src/core/dragon.js` | unchanged (takes `(dragon, xp)`) |
| `src/app.js` | compute active XP via `dragonXp(state)`, pass to screens; `onChangeDragon` handler; feed updates active dragon's XP |
| `src/ui/mainScreen.js` | receive the active dragon's `xp` explicitly (no reaching into storage shape) |
| `src/ui/shopScreen.js` | receive/read the active dragon's `xp` explicitly |
| `src/ui/settingsScreen.js` | add "Change Dragon" button + `onChangeDragon` prop |
| `src/ui/chooseDragon.js` | mark the currently-active dragon |
| `src/data/dragons.js` | add `blaze` dragon |
| `src/data/themes.js` | add `blaze` theme |
| `docs/art-prompts.md` | Blaze prompt pack (art follow-up) |

**Interface principle:** screens receive the active dragon's XP as an explicit value.
No screen reads `state.xpByDragon` directly — the app resolves it via `dragonXp(state)`
and passes a plain `xp` number, keeping screens decoupled from the storage shape.

## Data Flow

1. `store.load()` → migrates old saves → state with `xpByDragon`.
2. `render()` → `dragon = getDragon(state.dragonId)`; `xp = dragonXp(state)`; theme
   resolved + palette applied; main screen gets `dragon`, `xp`, `theme`.
3. Feed in shop → `buyFood` spends coins + `addDragonXp` to the ACTIVE dragon →
   `leveledUp(dragon, oldXp, newXp)` uses that dragon's XP → level-up animation.
4. Settings → "Change Dragon" → chooser → `onPick(id)` sets `dragonId`, saves, renders
   → main screen now shows the newly-active dragon at ITS own level/XP + its theme.

## Error Handling / Edge Cases

- **Missing dragon XP:** `?? 0` everywhere; a never-fed dragon is level 1 (egg).
- **Unaffordable feed:** `spend()` still throws before XP is granted — unchanged.
- **Stale dev localStorage** with the old `xp` field: migrated on load; the old key is
  dropped so it can't shadow the new model.
- **Switch mid-timer:** allowed; the timer is independent of the dragon. Switching only
  changes the skin, palette, and which dragon's XP is shown. The per-second driver's
  `screens.current === 'main'` guard is untouched (no screen-yank).
- **Unknown/absent `dragonId`:** `render()` already shows the chooser when
  `!state.dragonId`; `dragonXp` returns 0 safely.

## Testing (TDD)

- `store.test.js`: v1→v2 migration (old `{xp, dragonId}` → `{xpByDragon}`); fresh
  default is v2; a v2 save round-trips unchanged.
- `game.test.js`: `dragonXp` reads active; `addDragonXp` adds only to the active dragon
  and leaves others untouched; `buyFood` grants XP to the active dragon and still throws
  when unaffordable.
- `dragon.test.js`: unchanged (still valid).
- `settingsScreen.test.js`: renders a "Change Dragon" button that invokes
  `onChangeDragon`.
- `chooseDragon.test.js`: marks the active dragon.
- `dragons.test.js` / theme: `getDragon('blaze')` exists with 4 levels + `themeId`;
  `resolveTheme('blaze')` returns the fire palette and overrides icons/foods.
- Full suite + `npm run build` green; default (Frost) look unchanged.

## Sequencing

1. **Code first** (this spec → plan): per-dragon XP + migration, Blaze data/theme,
   switch-in-settings, tests. Ships fully functional with emoji fallback.
2. **Art follow-up**: generate the 12 Blaze images, copy + optimize, commit. No code
   change needed — the theme already points at the (then-present) webp paths.

## Constraints

- Files ideally ≤ ~200 lines, single responsibility, DRY.
- TDD: failing test first. Conventional commits, no AI attribution.
- Default Frost/no-theme look stays pixel-identical.
- Test runner: `npm test -- --run`. Build: `npm run build`.
