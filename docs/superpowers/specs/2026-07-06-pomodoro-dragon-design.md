# Pomodoro Dragon — Design Document

**Date:** 2026-07-06
**Status:** Approved (design phase)
**Target user:** A 9-year-old, on an Android tablet.

## 1. Purpose

A gamified Pomodoro study app for a child. Completing focused study
blocks earns coins. Coins buy food. Food feeds a pet dragon, which gains
experience (XP), levels up, and visibly changes its image. The goal is to
reinforce sitting down and finishing a block of concentration, and to
teach delayed gratification (save up → buy something better).

## 2. Core Loop (single reward circuit)

```
Finish a work block  →  earn coins  →  buy food (has a price)
                                          →  food gives XP
                                              →  XP reaches threshold
                                                  →  level up
                                                      →  dragon image changes
```

The timer alternates **work → break → work → break**. Coins are earned
only when a *work* block completes; the break is only for resting.

Design rules that keep the loop clear for a 9-year-old:

- **Earning:** a *completed* work block grants coins. Partial/abandoned
  blocks grant nothing. The rule is crystal clear: focus, finish, earn.
- **Break flow:** when a work block finishes and coins are granted, the
  child starts the break herself with a **☕ Break** button (it does not
  auto-start). This keeps her in control of her own rhythm and stops the
  timer running while she's away from the chair.
- **Leveling:** eating is the *only* way to gain XP. More expensive food
  gives more XP. One economy, no parallel currencies, no Tamagotchi-style
  "pet can die" mechanic (avoids guilt/anxiety on a day without study).

## 3. Scope

### MVP (first iteration)
- 1 dragon, 3 levels (baby → young → adult).
- 3 foods with different prices and XP values.
- Full loop working: pick → study → earn → buy → feed → level up.
- Placeholder art (emojis / simple shapes).

### Next iteration (ambitious)
- Several dragons to choose from, more levels, special foods, achievements.
- Final art via AI-generated images (replace placeholder filenames only).

The MVP must be built so that expanding is **editing a data file, not
rewriting logic**.

## 4. Architecture — data-driven, clean, small files

**Hard constraints (project conventions):**
- Each file ideally ≤ ~200 lines of code.
- Clean architecture: one responsibility per module; content separated
  from logic.
- Every iteration ends with a code review for dead code and duplication
  (DRY) — check whether new work is already handled elsewhere.

### 4.1 Content lives in data files

```
data/dragons.js  →  dragons and their levels (image + XP needed per level)
data/foods.js    →  foods (name, price, XP granted)
data/config.js   →  game rules: coins per work block, duration presets
                    (work + break), and the allowed custom range
```

Example dragon record:

```js
{
  id: "ember",
  name: "Ember",
  levels: [
    { level: 1, xpNeeded: 0,   image: "ember-baby.png"  },
    { level: 2, xpNeeded: 100, image: "ember-young.png" },
    { level: 3, xpNeeded: 300, image: "ember-adult.png" },
  ],
}
```

Adding dragons = adding objects to a list. Changing a price = editing a
number. The game logic never changes.

### 4.2 Logic modules (single responsibility each)

- **Timer** — counts down the current block and signals completion.
  Knows whether it is in a *work* or *break* block and alternates between
  them. Work duration and break duration are configurable via the settings
  screen (see §5). The
  break is started manually by the child, not auto-started.
- **Wallet** — coins: add on completion, subtract on purchase, never
  allow a negative balance.
- **Dragon** — holds current XP, computes the current level from XP.
- **Store** — persists and loads progress (the only module that touches
  storage — see §6).
- **Audio** — background music loop + event sound effects, global mute.

Each module is understandable and testable on its own.

## 5. Screens and flow

Large and clear screens, each its own component (small-file rule).

1. **Choose dragon** — first run or when changing. Baby dragon shown big
   to tap. MVP has one, but the screen is ready for many.
2. **Main** — the heart. Big dragon (current-level image) centered; coin
   counter; a large **▶ Start studying** button; timer countdown with a
   pause control while running. When a work block finishes, a **☕ Break**
   button appears so the child starts the break herself. Buttons for the
   shop 🍎, settings ⚙️, and mute 🔇. The screen shows whether the current
   block is *work* or *break*.
3. **Shop / Feed** — foods as cards (image, price, XP). Foods the child
   can't afford render "dimmed" (teach the limit without an ugly error).
   Buying feeds the dragon, grants XP, and fills a progress bar toward the
   next level.
4. **Settings** ⚙️ — choose **work** duration and **break** duration.
   Quick preset buttons by default (e.g. work → 10 / 15 / 25 min,
   break → 3 / 5 / 10 min) plus a **custom** mode (+ / − steppers) to
   fine-tune within an allowed range. Chosen durations persist via Store.
5. **Level up!** — not a fixed screen but a celebration moment:
   animation, fanfare sound, dragon swaps to its new image. This is the
   emotional payoff and must feel big.

Flow as the child experiences it:

> Pick my dragon → (optionally set work/break times in settings) → tap
> *Start studying* → study my chosen minutes → bell rings, I earned coins!
> → tap ☕ Break to rest → go to the shop → buy an apple for my dragon →
> it eats and the bar rises → repeat → LEVEL UP! → my dragon is now bigger.

## 6. Persistence (Store) and audio

### 6.1 Storage — swappable backend behind one interface

Store is an abstract interface. The rest of the game asks Store to
"save" / "load" without knowing how.

```
Store  →  single interface
   ├─ Web backend    (development): localStorage
   └─ Native backend (APK): native SQLite via Capacitor
```

- **Development:** `localStorage`. Data is disposable during development,
  so this is fast and frictionless.
- **Production / APK:** native **SQLite** via Capacitor
  (`@capacitor-community/sqlite`). This is durable and lives in native app
  storage — clearing the browser does NOT erase it; only uninstalling or
  clearing the app's data does.

Note (honest constraint): inside a pure browser, *no* storage
(`localStorage` or IndexedDB) survives a manual "clear site data". Real
durability comes from the native layer. Swapping the backend is a
one-file change because Store is isolated.

### 6.2 Audio

A single Audio module:
- Background music loop (starts on entry, mutable).
- Effects at key moments: bell on Pomodoro completion, "nom" on eating,
  fanfare on level up.
- 🔇 mutes everything at once and remembers the preference across sessions.

Browser rule handled by design: audio cannot play until the first user
tap (anti-annoyance policy); music starts on first interaction.

MVP uses royalty-free placeholder sounds (or silence); final audio
replaces files, same as images.

## 7. Testing

TDD on the business logic — the money and level math must be flawless,
because a bug there feels unfair to a child.

Covered by fast, browser-less tests:
- **Wallet:** add coins on completion; subtract on purchase; never allow
  a negative balance (can't buy without funds).
- **Dragon:** XP accumulates correctly; level computed correctly at the
  thresholds (reaching exactly 100 XP levels up — not before, not after).
- **Store:** save then load returns exactly the same state.
- **Timer:** completing a work block signals completion and switches the
  next block to *break*; completing a break switches back to *work*; only
  work completion triggers a coin grant.

Not auto-tested in the MVP: the visuals (art, animations) — verified by
eye, playing with the child.

## 8. Technology

- **Web app (PWA)**: HTML/CSS/JavaScript. Fastest change → see-result
  loop; runs full-screen on the Android tablet; works offline.
- **Capacitor-ready** from day one, so wrapping into a real APK later is
  trivial (bundles assets locally, no server needed) and unlocks the
  native SQLite storage above. No rewrite required.

## 9. Out of scope (YAGNI for MVP)

- Multiple dragons, achievements, special foods (next iteration).
- Cloud sync / multi-device.
- Final AI art and final audio (layered on after the loop is validated).
- Play Store distribution.
