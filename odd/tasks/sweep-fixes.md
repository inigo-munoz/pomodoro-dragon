# Sweep fixes: the three bugs the child would see first

## Objective

Fix the three highest-impact defects found by the full-app sweep of 2026-10-02, in the order
the user approved: the dots after a long break, settings saved mid-block, and the unguarded
"Change Dragon" exit.

## Where these came from

A three-layer sweep: a reviewer over all of `src/`, a structural and visual walk of all nine
screens on localhost with real purchases, placements and settings flows, and the browser
console across a fresh load plus that walk (zero errors, zero warnings). Each of the three bugs
below was **re-verified against the real code before being reported** — bug 1 by running the
actual render, bugs 2 and 3 by reading the exact lines. The full list, including the ones not
in this round, is in the Engram observation "Full-app sweep: 7 verified bugs…".

## The three bugs

| # | Where | What the child sees |
|---|---|---|
| 1 | `src/ui/mainScreen.js` `sessionDots` | After a long break, the FIRST block of the new cycle shows 4/4 dots and "Session 4 of 4". Wrong every cycle. **This one is mine**: the "multiple ⇒ all full" rule from `fd83014` did not distinguish the long break from the block after it. |
| 2 | `src/app.js:259` | Saving Settings while a block runs changes nothing until a reload: the rebake sits inside `if (!timerState.running)`. She changes the break to 10 and the next break is still 5. |
| 3 | `src/ui/settingsScreen.js:199` | "Change Dragon" bypasses the unsaved-changes guard that Back has. A dirty draft is discarded silently — exactly what the guard was built to prevent. |

## Decisions

- Bug 1: a multiple fills every dot only during the long break itself or for a work block
  parked at 0:00. A running or idle work block on a multiple is the start of a new cycle.
- Bug 2: the four duration fields are always rebaked on save; only the `remaining` clamp
  (which protects a part-used block, a deliberate earlier fix) stays conditional on not running.
- Bug 3: one guard with a continuation, used by both exits — not a second overlay.

## Constraints

- Strict TDD, runner `npm test -- --run`, baseline **32 files / 542 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English. No guilt wording (`lairScreen.test.js:166`).
- Every asserted selector and `data-*` hook stays. `config.storageKey` is untouched.

## Tasks

- [x] **S1.** `d9eebd0` Dots start a new cycle after the long break — unit tests plus one real-app cycle.
- [x] **S2.** `dd0a09d` A save during a block reaches the timer — integration test with no reload.
- [x] **S3.** `ed645ad` Change Dragon asks before discarding — four guard cases.

## Acceptance

1. After the long break ends, the next work block shows 0 filled and "Session 1 of N".
2. Changing the break length and the cycle count mid-block applies to the very next break,
   and the running block's own remaining time is untouched.
3. Change Dragon with a dirty draft opens the card; Save saves then changes; Don't save only
   changes; a clean draft changes at once.
4. `npm test -- --run` green, `npm run build` succeeds.

## Not in this round (from the same sweep, approved order was 1-2-3 first)

Room-art fallback showing a raw path; notifications never firing on Android Chrome (needs
`registration.showNotification`); a corrupt history day wiping a v<5 save; `onConfirmUnlock`
with no purse re-check; `← Back` at 74×23 everywhere but Settings; nameless shop/settings nav
buttons; the unlock screen with no coin counter; no way back from the chooser; instructions
quoting defaults; music through pause; dead code (`addXp`, `remainingAt`, `totalMinutes`,
`slotTitle`, the `mute` icon set); doc drift.

## Progress

Branch `feat/sweep-fixes`, off `main`. All three done; not merged.

| Commit | Subject |
|---|---|
| `d9eebd0` | `fix(ui): the dots start a new cycle after the long break` |
| `dd0a09d` | `fix(settings): a save during a block still reaches the timer` |
| `ed645ad` | `fix(settings): Change Dragon asks before discarding a draft` |

Observed: **32 files / 550 tests green** (baseline 542, +8), `npm run build` succeeds. No
existing test was changed; only additions.

**Verified independently, not from the report**: the vite-node reproduction that proved bug 1
(`createTimerState` → three blocks → long break → `advance()` → real `renderMainScreen`) now
renders **0 / 4, "Session 1 of 4"** where it rendered 4 / 4. Bug 2: the rebake is unconditional
at `app.js:265` and only the `remaining` clamp sits under `if (!rebaked.running)`. Bug 3:
both exits call `askBeforeLeaving(...)` (`settingsScreen.js:200,202`); one overlay, one guard.

A nuance the implementer flagged: the old "multiple ⇒ all full" rule also fired during a
SHORT break on a multiple count. The fix follows the spec literally (long break, or a parked
work block). That combination cannot occur in normal play.

**A blemish, kept on purpose.** This document was created while the writer worked and was
swept into `d9eebd0` by a `git add -A`. The writer asked to rewrite history and was refused,
correctly. Rewriting three unpushed commits would be safe but buys nothing: ODD documents ride
feature commits throughout this repository. Left as is, recorded here.

## Next step

Merge and push are the user's call. Then the rest of the sweep list, in the order above.
