# Pomodoro Core Loop — Full Functionality

**Feature:** pomodoro-core-loop
**Created:** 2026-09-29
**Branch:** feat/pomodoro-core-loop
**Status:** in progress

## Objective

Make the pomodoro timer fully usable on the target device (Android tablet,
offline PWA). Art and audio assets are explicitly out of scope; this feature
covers the usage system only.

## Problem

The reward loop (start -> countdown -> complete -> coins -> break) is
implemented and covered by 63 passing tests, but it breaks under real usage:

1. `timer.js` counts `setInterval` ticks instead of wall-clock time. A locked
   screen or a backgrounded tab throttles the interval, so the countdown
   stalls and a 25-minute session never completes.
2. Timer state lives only in an `app.js` closure. Reloading mid-session loses
   the session and its reward.
3. `createAudio({ music: null, effects: {} })` makes every sound a no-op, so
   session completion has no audible feedback. The design promises a bell.
4. A paused break renders "Start studying", which resumes the break.
5. The `setInterval` in `createApp` is never cleared; there is no teardown.
6. A completed work block grants a flat 10 coins regardless of its configured
   duration, so 1-minute sessions are the fastest path to coins.

## Why

The app is a study timer for a 9-year-old on a tablet. A timer that stalls
when the screen locks fails at its only job, and a silent completion breaks
the reward circuit the design depends on.

## Scope

**In scope:** wall-clock timing, timer persistence and restore, audible
completion without asset files, break-aware controls, interval teardown,
duration-proportional coin rewards.

**Out of scope:** art assets, music tracks, new dragons, auto-advance between
modes (the design deliberately requires a manual Break tap), XP from sessions
(the design states food is the only XP source).

## Constraints

- Preserve the documented design: manual break start, XP only from food,
  coins only on a completed work block.
- Core modules stay pure; time is injected, never read from inside core.
- Files stay small (core modules 10-40 lines); every module keeps a colocated
  `*.test.js`.
- No new runtime dependencies.

## Resolved configuration

- **TDD:** ON. Source: project convention (colocated tests for every module,
  prior sessions worked RED -> GREEN -> commit).
- **Test runner:** `npm test` (`vitest run`, jsdom).
- **Delivery strategy:** `ask-on-risk`. Forecast ~350 authored changed lines.

## Product decisions

- **Coin economy:** coins scale with the configured work duration at
  1 coin per minute, replacing the flat per-block reward of 10. Food prices stay
  as they are, which makes the default 15-minute session slightly more
  generous (15 coins, one apple) and removes the 1-minute shortcut.
  Decided by the user on 2026-09-29.
- **Restore of an elapsed session:** if the app reopens after a running work
  block's end time has passed, the block counts as completed and grants its
  coins. Wall-clock timing means real time passing away from the screen is
  exactly the case this feature exists to support.

## Tasks

- [x] **T1 — Wall-clock timer core.** Rework `src/core/timer.js` so a running
  timer derives `remaining` from an injected `now`. `start(state, now)` sets
  `endsAt`; `pause(state, now)` freezes `remaining`; `tick(state, now)`
  recomputes from the clock; `advance(state)` is unchanged. Update
  `timer.test.js`.
  Route: delegated (writer trigger — 2 non-trivial files).
- [x] **T2 — Coins per minute.** Replace the flat per-block coin config with
  `config.coinsPerMinute: 1` and make `grantWorkReward` scale with the
  completed block's duration. Update `game.test.js`.
  Route: delegated (writer trigger — 3 files incl. app.js call site).
- [x] **T3 — Persist and restore the timer.** Add timer fields to the store's
  default state and a migration, save on every meaningful transition, and
  restore on load, granting the reward for a work block that ended while the
  app was closed. Update `store.test.js` and `app.test.js`.
  Route: delegated (writer trigger).
- [x] **T4 — Audible completion without assets.** Give `audio.js` a synthesized
  WebAudio tone fallback for effects that have no asset, respecting mute, and
  wire the bell so a completed session is audible. Update `audio.test.js`.
  Route: delegated (writer trigger).
- [ ] **T5 — Break-aware controls, completion feedback, teardown.** Fix the
  misleading paused-break label, surface the coins earned on completion, and
  return a `destroy()` from `createApp` that clears the interval. Update
  `mainScreen.test.js` and `app.test.js`.
  Route: delegated (writer trigger).

## Acceptance criteria

- A work block started and left alone across a simulated clock jump completes
  with the correct reward, with no dependence on interval callback count.
- Reloading mid-session restores the same remaining time.
- Completing a work block produces an audible effect with no asset files
  present, and stays silent when muted.
- A paused break never renders "Start studying".
- `npm test` passes, with the existing 63 tests still green.

## Checks

`npm test` after every task. Full suite before each work-unit commit.

## Progress

Baseline verified 2026-09-29: `npm test` -> 18 files, 63 tests, all passing.

- **T1 done.** Wall-clock timer landed. `timer.js` is 44 lines and pure;
  `remainingAt(state, now)` is exported for later tasks. Timer tests grew
  6 -> 15. Verified independently by the parent: `npm test` -> 18 files,
  72 tests, all passing.

- **T2 done.** `coinsPerWork: 10` is gone; `coinsPerMinute: 1` replaces it and
  `grantWorkReward(state, config, workMinutes)` scales with the block, granting
  nothing for a non-positive or missing duration. Verified independently:
  `npm test` -> 18 files, 76 tests, all passing; `rg coinsPerWork` is clean.
  Note: the writer also rewrote the historical plan docs under
  `docs/superpowers/` to match the new config. Those are dated records of past
  decisions, not a mirror of the code, so the parent reverted them.

- **T3 done.** The timer persists as `{mode, running, remaining, endsAt}` under
  a new store v3; durations are always recomputed from current settings so a
  settings change is never resurrected stale. Restore reuses the normal tick
  path (`handleTick()` runs once at startup) rather than a second completion
  code path, so an elapsed work block grants its coins exactly once and an
  elapsed break returns to an idle work block. Verified independently:
  `npm test` -> 18 files, 82 tests, all passing.

- **T4 done.** Effects are synthesized with the Web Audio API from a data-only
  `src/audio/tones.js`, so the bell needs no asset files. The context is built
  lazily, in try/catch, with the failure cached so a platform without Web Audio
  degrades to silence instead of throwing every tick.
  Parent-caught defect, fixed as T4b before committing: the context was only
  ever created inside the interval callback, never in a user gesture, so
  autoplay policy would have left it `suspended` and silent on the target
  Android tablet even though the tests passed. `audio.unlock()` now runs from
  `onStart` and `onToggleMute`, which are real taps. Verified independently:
  `npm test` -> 18 files, 96 tests, all passing.
  Known test gap, to be closed in T5: no assertion that `onStart` actually
  calls `audio.unlock()`.

## Next step

T5 — break-aware controls, completion feedback, teardown.
