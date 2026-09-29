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
- [x] **T5 — Break-aware controls, completion feedback, teardown.** Fix the
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

- **T5 done.** `idleLabel()` renders "Resume break" / "Keep studying" /
  "Start studying" while keeping `data-action="start"`, so the break no longer
  lies. A `.session-reward` line shows `+N` coins after a completed block,
  driven by the coins actually granted (`state.coins` delta) rather than a
  second copy of the reward formula. `createApp` now returns `{ destroy }`,
  which clears the interval and is safe to call twice. The T4b gap is closed:
  the unlock tests stub `window.AudioContext` and were confirmed to fail when
  `audio.unlock()` is removed. Verified independently: `npm test` -> 18 files,
  109 tests, all passing.

## Next step

Feature complete — final verification and review.

## Follow-up (user request, 2026-09-29)

The user asked for three things after the first five tasks landed.

1. *"Se tiene que poder seleccionar el tiempo del break"* — **already implemented.**
   Verified in the built app: Settings offers the 3/5/10 break presets plus
   `−`/`+`, and the choice persists (changed 5 -> 7, `breakMinutes: 7` in the
   save). The real problem is that the break duration is invisible outside
   Settings, which is what item 2 fixes.
2. The timer must sit **above** the dragon. User chose: the countdown moves
   above the dragon in **both** modes, so the number never jumps position.
3. During a break the dragon's level art (the egg) must be replaced by the
   break illustration.

- [x] **T6 — Break presentation.** Move `.timer-display` (and the reward line)
  above `.dragon-stage`, and render the theme's break art in the dragon stage
  while `timerState.mode === 'break'`.
  Route: delegated (writer trigger).

**T6 done.** DOM order is now `top-bar`, `timer-display`, `session-reward`,
`dragon-stage`, `xp-bar`, `controls`, `nav-bar`, identical in both modes. A
`stageArt` helper reuses `themedIcon(theme, 'break')` during a break so the
existing fallback path is preserved. Verified in the built app: work mode shows
the countdown above the egg, break mode shows it above the sleeping dragon.
`npm test` -> 18 files, 115 tests, all passing; `npm run build` succeeds.

### Open, not a code defect: baked-in checkerboard in the icon assets

Sampling the top-left 20x20 block of each asset in the browser:
`break.webp` 400/400 pixels opaque, `coin.webp` 400/400 opaque,
`frost-egg.webp` 0/400. The transparency checkerboard is real pixel data in the
icon files, not alpha — the background removal exported the pattern instead of
clearing it. Invisible at 28px as an icon, obvious now that `break.webp` fills
the dragon stage. Fix is to regenerate those assets, which the user has
deferred; no code change would help.

## Delivery

Final size: 960 authored changed lines across 8 work-unit commits, well over the
~400 slice budget. Chain strategy chosen: **stacked to main**, not a feature
branch chain — each slice leaves the app working and can merge on its own, so a
draft tracker PR would be pure ceremony in a single-maintainer repo.

The slice boundaries fall on existing commit boundaries, so no rebase was needed
and no conflict risk was introduced.

| Slice branch | Base | Lines | Tests |
|---|---|---|---|
| `slice/1-wall-clock-timer` | `main` | 256 | 72 |
| `slice/2-coins-per-minute` | slice 1 | 57 | 76 |
| `slice/3-session-persistence` | slice 2 | 146 | 82 |
| `slice/4-audible-completion` | slice 3 | 242 | 96 |
| `slice/5-main-screen` | slice 4 | 253 | 115 |

Every slice was verified independently at its own tip: `npm test` green and
`npm run build` succeeding on each, not only on the accumulated branch.

**Status: local only.** The repository has no git remote, so no pull requests
exist. The user chose to keep the work on disk rather than create a GitHub
repository. To integrate by hand, merge the slices into `main` in order 1 -> 5.
If PRs are wanted later, the stack is already cut and verified; it only needs a
remote and one push per branch.
