# Block reminders: don't miss the end of a block

## Objective

Make the end of a work block reach the child when she is not staring at the screen. Two
mechanisms, in this order of importance: keep the tablet screen awake while a block runs, and
raise a system notification when the block ends while the app is not the thing in front of her.

## Problem

The end of a block is `audio.playEffect('bell')` and nothing else. A survey of `src/` finds no
`Notification`, no `wakeLock`, no `visibilitychange` — the only match for any of those words
is in `styles.css`.

So the real scenario fails. She sets fifteen minutes, puts the tablet down, does her homework.
The tablet screen sleeps. The block ends and **nothing tells her.** She comes back when she
happens to look.

The clock itself is fine: `src/core/timer.js` works from an `endsAt` timestamp, so on return
the remaining time is correct. What is lost is the *moment*, which is the entire reason a
pomodoro exists. This is not a missing extra; it is the existing feature failing off-screen.

## Why

A timer that only works while you watch it is a stopwatch. The whole promise of the method is
that you can forget about the clock and it will come and get you.

## Honest limits — state these, do not paper over them

This is an offline PWA with no backend, so there is no push service. **Nothing here can wake a
device that has gone to sleep.** What is achievable:

| Situation | After this change |
|---|---|
| App on screen | Bell rings, as today |
| App backgrounded, screen on | System notification fires |
| Screen asleep during a block | Prevented while a block runs, via a screen wake lock |
| Screen asleep anyway (OS overrode, battery saver, lock button) | Still missed. Caught up the instant she returns |
| Permission denied | Everything still works; no notification, no nagging |

The wake lock is the part that actually fixes the common case, because the common case is a
tablet lying on a desk going to sleep by itself.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| Build reminders before history or cycle rewards | yes | user, after being shown all three |
| Ask for notification permission on the FIRST "Start studying" | assistant | a permission prompt needs a user gesture, and that is the first honest one |
| Ask once, never nag | assistant | a denied permission cannot be re-requested by the page anyway |
| No Settings toggle | assistant | a toggle cannot restore a permission the browser has denied, so it would lie |
| Notify only when the page is NOT visible | assistant | the bell and the screen already do the job when she is looking |

## Scope

**In scope**
- `src/platform/reminders.js`: an injected adapter over Notification and Screen Wake Lock,
  following the `createAudio` factory idiom already used for audio.
- Acquire the wake lock while a block runs; release it on pause and on completion.
- Re-acquire it when the page becomes visible again, because browsers drop a wake lock on hide.
- Notify on completion when the page is hidden, with wording that fits the mode that ended.
- Settle an ended block the moment the page becomes visible, instead of waiting for the next
  one-second tick.

**Out of scope**
- Push notifications, a backend, or anything that could wake a sleeping device. Not possible
  here, and pretending otherwise would be worse than the gap.
- A Settings toggle. See the decision above.
- Changing `src/core/timer.js`. The clock is already correct across a hidden tab.
- History, stats, or cycle rewards. Those were the other two candidates and were not chosen.

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline: **25 files / 345 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English.
- Both APIs are absent in jsdom and in older browsers. **Every method must be a safe no-op when
  unsupported, and must never throw**, exactly as `src/audio/audio.js` swallows playback
  failures. A thrown error here would break the timer, which is far worse than a missed bell.
- Permission must be requested from a user gesture or the browser refuses it.
- Both APIs need a secure context. GitHub Pages is HTTPS, and `localhost` counts, so the dev
  server is a valid test bed.

## Tasks

- [ ] **R1. The adapter.** `src/platform/reminders.js`, exporting `createReminders` built like
      `createAudio`: dependencies injected so tests can drive it without globals. Surface:
      `permission`, `request()`, `notify({ title, body })`, `keepAwake()`, `release()`.
      Unsupported, denied and throwing environments all degrade to silence.
- [ ] **R2. Wire it into the app.** `src/app.js` takes a `remindersFactory` beside
      `audioFactory`. Request once on the first Start, hold the lock while running, release on
      pause and completion, notify on completion when hidden, re-acquire and settle on
      `visibilitychange`.

## Acceptance criteria

1. In a browser with neither API, nothing throws and the timer behaves exactly as before.
2. The first "Start studying" asks for notification permission once; a later Start does not.
3. While a block runs the screen wake lock is held; pausing or finishing releases it.
4. Hiding and re-showing the page re-acquires the lock if a block is still running.
5. A block that ends while the page is hidden raises a notification naming what ended.
6. A block that ends while the page is visible raises no notification; the bell is enough.
7. Returning to a hidden page whose block ended settles it immediately, not on the next tick.
8. `npm test -- --run` green, `npm run build` succeeds.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the branch closes.
- Manual smoke: run a one-minute block on the dev server, switch tabs, confirm the
  notification. Confirm the wake-lock sentinel is held while running and released on pause.

## Progress

- Branch `feat/block-reminders`, chained off `feat/lair-shelf`.
- Nothing implemented yet.

## Next step

R1 — the adapter.
