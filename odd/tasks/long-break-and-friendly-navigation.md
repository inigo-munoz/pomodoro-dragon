# Long break cycles and friendly navigation

## Objective

Two changes that the user asked for together, because they meet on the same screen:

1. **Long break every N sessions** — the classic Pomodoro cycle. The timer has no concept of
   a cycle today, so after N completed work blocks the break becomes a longer one.
2. **Friendlier navigation and settings** — every screen states where you are, and the timer
   settings become a single readable panel with arrow steppers, an explicit SAVE and a
   RESET TO DEFAULT, modelled on reference screenshots the user supplied.

## Problem

- `src/core/timer.js` alternates `work -> break -> work` forever. There is no counter
  anywhere in the codebase (verified: no `sessions`, `cycle`, `streak` or `completed` count
  exists), so every break is the same length and a long study run never earns a real rest.
- No screen except Settings and Choose-dragon has a title. The app is used by a child on a
  tablet: after two taps there is nothing on screen that says which place she is in.
- The settings screen is inconsistent with every other screen — its title is at the top but
  its `← Back` is at the bottom, while every other screen puts Back at the top.

## Why

The long break is the one real functional gap left in the app. The navigation chrome is what
makes the rest of the app legible to a six-year-old who cannot read fluently yet: a big word
plus a familiar layout in the same place on every screen.

## Decisions taken (by the user)

| Decision | Value | Who decided |
|---|---|---|
| Sessions before a long break | 4 (default) | user |
| Long break duration | 15 min (default) | user |
| Both configurable in Settings | yes | user |
| Settings commit model | explicit SAVE, not live-apply | user |
| Unsaved-changes exit | must not be silent — a friendly confirm card | assistant, accepted direction |

The user was offered shorter child-friendly defaults (3 sessions / 10 min) and chose the
classic values, making them configurable instead so the child's values can be tuned without
a code change.

## Scope

**In scope**
- `longBreakMinutes` and `sessionsBeforeLongBreak` settings, with defaults, persistence and
  clamping consistent with the existing `workMinutes` / `breakMinutes`.
- A cycle counter driving the long break, decided inside the pure `advance()`.
- A `longBreak` timer mode, with its own label and the existing resting-dragon treatment.
- A shared screen-title component used by every screen.
- Redesigned timer settings: arrow steppers, SAVE, RESET TO DEFAULT, unsaved-changes guard.
- Back button moved to the top of Settings, matching every other screen.

**Out of scope**
- The other backlog items: offline music caching, the dragon overlapping `floorLeft`, the
  two weak art pieces, the dead `.xp-fill` transition, repo housekeeping, TWA/APK.
- Any change to the coin economy or the lair.
- New art assets. The redesign uses CSS and existing themed icons only.

## Constraints

- **Strict TDD is enabled.** Runner: `npm test -- --run` (single file:
  `npx vitest --run <file>`). Every unit observes RED before GREEN.
- Baseline at start: **22 files / 262 tests green**, `main` clean and level with `origin/main`.
- Receipt-driven development is **off** (global). No review lifecycle is started, and it is
  not to be enabled. Ordinary functional checks only.
- `store.load()` merges `settings` one level deep, so new setting keys auto-fill on old
  saves: no version bump, no migration.
- Theming is token-driven. Any new colour must be added to `:root` in `styles.css` **and**
  to `default.palette` in `src/data/themes.js`, or it will not survive a theme switch.
- UI copy stays **English**, matching the existing app.
- These test selectors are a contract; keep them or update the tests deliberately:
  `data-step="work-minus|work-plus|break-minus|break-plus"`, `data-work-preset`,
  `data-break-preset`, `data-music-preset`, `data-action="change-dragon"`, `.back-btn` on
  every non-main screen, `.screen.<name>` classes, `.mode-label`, and the
  `.nav-bar [data-action]` count.

## Delivery

Strategy: `auto-chain` with `feature-branch-chain`, matching the repository's existing
history (feature branch per slice, merged into `main` with `--no-ff`). Forecast is about 570
authored changed lines, over the ~400-line delivery budget, hence three slices. Push, PR and
merge remain the user's decision.

| Slice | Branch | Scope |
|---|---|---|
| 1 | `feat/long-break-cycle` | T1-T2: the cycle, core and wiring |
| 2 | `feat/screen-titles` | T3: the shared screen title on every screen |
| 3 | `feat/friendly-settings` | T4-T6: the settings redesign, SAVE/RESET, the guard |

## Tasks

### Slice 1 — the long break cycle

- [x] **T1. Cycle in the pure core.** `96a0c06` `src/data/config.js`: add `longBreakPresets`,
      `sessionsPresets`, and `default.longBreakMinutes = 15`,
      `default.sessionsBeforeLongBreak = 4`, plus a range for the session count.
      `src/core/timer.js`: `createTimerState` bakes `longBreakSeconds` and starts
      `completedWork: 0`; `advance()` increments on leaving work and picks `longBreak` when
      `completedWork % sessionsBeforeLongBreak === 0`, resetting nothing else.
      Tests in `src/core/timer.test.js`.
      Route: delegated writer. Trigger: 3 non-trivial files + tests.
- [x] **T2. Wire it through the app.** `1bdb526`, `fd83014` `src/app.js`: persist the counter
      (`persistTimer` currently stores only mode/running/remaining/endsAt), extend the
      restore clamp and the settings re-bake to the new mode, keep `grantWorkReward` paying
      only for work. `src/ui/mainScreen.js`: the `.mode-label` gains `Long break`, and the
      resting-dragon checks keyed on `=== 'break'` must accept the long mode.
      `src/store/store.js` defaults. Update the exact-equality assertions in
      `store.test.js` and `settingsScreen.test.js`.
      Route: delegated writer. Trigger: 4+ non-trivial files.

### Slice 2 — say where you are

- [ ] **T3. Shared screen title.** New `src/ui/screenTitle.js`, in the idiom of
      `src/ui/backButton.js`. Applied to choose-dragon, shop, lair, slot picker, unlock and
      settings; the main screen keeps its `.top-bar` and `.mode-label` untouched. Settings
      drops its own `h1` and moves `← Back` to the top. New CSS for the watermark treatment,
      themeable.
      Route: delegated writer. Trigger: 7 files.

### Slice 3 — the friendly settings panel

- [ ] **T4. Arrow steppers and the panel.** Rework `group()` in
      `src/ui/settingsScreen.js` into a reusable row: label, `◀`, value box, `▶`, with the
      unit. Rows: Focus Time, Break Time, Long Break Time, Number of Sessions, Music. Keep
      every contracted `data-*` hook.
- [ ] **T5. SAVE and RESET TO DEFAULT.** The screen holds a local draft; `onChange` fires
      only on SAVE. RESET restores `config.durations.default`. SAVE is inert while the draft
      matches what is stored, and visibly live when it does not.
- [ ] **T6. The unsaved-changes guard.** Leaving with a dirty draft opens a confirm card
      reusing the `.unlock-card` / `.level-up-overlay` visual language: "Save your changes?"
      with two large buttons. No silent discard.
      Route for T4-T6: one delegated writer, they are one screen.

## Acceptance criteria

1. With defaults, four completed work blocks produce short, short, short, **long** (15 min),
   and the fifth starts the count again.
2. Both new values are editable in Settings, survive a reload, and apply to the next block.
3. An existing save file from before this change loads with the new defaults filled in and
   no data loss.
4. Every screen displays its name; the child can tell Shop from Lair from Settings without
   reading body text.
5. Changing a value and pressing Back without saving never discards silently.
6. `npm test -- --run` is green, with new tests covering the cycle, the draft/save model and
   the guard.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the final slice closes.
- Manual smoke on the dev server for the visual work in slices 2 and 3.

## Progress

- Baseline recorded: 22 files / 262 tests green, `main` == `origin/main`, tree clean.
- Exploration complete: timer/store/settings map and UI/CSS map both gathered.

### Slice 1 — DONE, on `feat/long-break-cycle`, not merged

| Commit | Subject |
|---|---|
| `96a0c06` | `feat(timer): a long break every four work sessions` |
| `1bdb526` | `feat(ui): show cycle progress and the long break on the main screen` |
| `fd83014` | `fix(ui): fill the session dot when the bell rings, not when Break is tapped` |

Observed: `npm test -- --run` → **22 files / 289 tests green** (baseline was 262).
`npm run build` → succeeded. Verified independently by the parent, not only reported.
Diff against the branch point: 9 files, ~347 authored lines, under the 400 budget.

**Scope added beyond the literal request, and disclosed to the user**: a session-progress
indicator on the main screen (`.session-dots`), because without it the long break arrives
unexplained. The user was told and can still have it removed.

**Defect found and fixed during review** (`fd83014`): the counter lives in `advance()`, which
runs only when Break is tapped, so a work block parked at 0:00 was earned but still showed an
empty dot — the reward landed one tap after the bell announcing it. The main screen now counts
the parked block for display only; the timer state stays the single source of truth.

**Known gap, deliberately left to slice 3**: nothing in the UI can change `longBreakMinutes`
or `sessionsBeforeLongBreak` yet, so the settings re-bake path for those two keys in
`src/app.js` has no integration test covering it. It is a plain object spread. Slice 3 adds
the controls and must add that test.

## Next step

T3 — the shared screen title, on branch `feat/screen-titles`, chained off
`feat/long-break-cycle`.
