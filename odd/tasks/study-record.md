# The study record: let the app remember the effort

## Objective

Keep a record of the work blocks the child actually finishes, and give her a screen that shows
it back to her. Today the save file remembers what she bought and nothing about what she did.

## Problem

`defaultState` holds `coins`, `xpByDragon`, `lairs`, `lairUnlocked`, `muted`, `settings` and
`timer`. There is no history, no block count, no date anywhere in the app — a survey for
`history`, `stats`, `log` and friends finds nothing in `src/`.

Coins look like a record of effort but they are not: they are spent. The moment she buys the
cushion, the four blocks that paid for it leave no trace. She cannot answer "how much did I
study this week?", and neither can her father.

## Why

Effort that leaves no mark is effort she has to take on faith. A child decides whether
something was worth it by seeing it. This is also the one feature in the app that serves the
parent as much as the child.

## The rule this screen inherits

`src/ui/lairScreen.test.js:166` freezes a decision someone deliberately made:

```js
expect(el.textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
```

**This app does not use guilt.** No streaks to break, no missed days, no warnings, no falling
behind. A record screen is exactly where that temptation lives, so the same negative test comes
with it: the screen shows what she DID and never what she did not.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| Build the record after the reminders | yes | user, "sigue adelante" after the three candidates |
| Record completed WORK blocks only | assistant | a break is not an achievement, and a long break is a reward |
| Store per-day totals, not one row per block | assistant | bounded, enough for every question the screen asks |
| Keep 60 days, prune older | assistant | the save file is localStorage and must not grow forever |
| Last 7 days plus an all-time total | assistant | a week is what a child can hold; the total is what makes it feel cumulative |
| No streaks, no missed-day language | inherited, see above |

## Scope

**In scope**
- `src/core/history.js`, pure: record a block against a day key, prune, read a week, total.
- A `history` field in the save, filled for old saves by the existing shallow merge.
- Recording on work-block completion, in the same place the coins are granted.
- `src/ui/recordScreen.js`: the last seven days, today marked, and the all-time block count.
- A fourth nav button on the main screen to reach it, using an emoji fallback for now.

**Out of scope**
- New art. The nav icon falls back to an emoji exactly as the app did before it had art; the
  four themed icons can come later through the usual pipeline.
- Goals, targets, averages, or anything that can be failed.
- Recording what she studied. Naming the subject is a separate feature and a bigger one.
- Exporting or sharing.

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline: **26 files / 381 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English.
- `store.load()` merges top-level fields shallowly, so a new `history` key arrives on old saves
  with no migration and no version bump. Verify that rather than assume it.
- **The day key must be the LOCAL date**, not a UTC ISO string. A block finished at 23:30 in
  Spain belongs to that day, not to the next one. Derive it from the injected `now`, never from
  a bare `new Date()` inside core.
- `src/ui/mainScreen.test.js` asserts the exact count of `.nav-bar [data-action]`. A fourth
  button changes it; update that test deliberately.
- The timer core must not change.

## Tasks

- [x] **H1. The pure core.** `ca8d162` `src/core/history.js`: `dayKey(now)` as a local `YYYY-MM-DD`,
      `recordBlock(history, now, minutes)` adding to that day's `blocks` and `minutes`,
      `pruneHistory(history, now, days)` keeping the most recent window, `lastDays(history,
      now, n)` returning n entries oldest-first including empty days, and a total.
- [x] **H2. Save it.** `1b78741` `history: {}` in `defaultState`; record on work completion in `app.js`
      beside `grantWorkReward`, then prune. A test must prove an old save without the field
      loads clean and gains it.
- [x] **H3. Show it.** `c5638a1` `src/ui/recordScreen.js` with the screen title, the back button, a bar
      per day for the last seven with today marked, and the all-time block count. A fourth
      nav button on the main screen opens it. Carries the no-guilt negative test.

## Acceptance criteria

1. Finishing a work block adds one block and its minutes to today's entry.
2. Finishing a break adds nothing.
3. A block finished late in the evening lands on today, not tomorrow.
4. An existing save with no `history` loads and starts recording without losing anything.
5. The record screen shows seven days oldest to newest, marks today, and shows a total.
6. A day with no blocks renders as an empty day, with no language suggesting failure.
7. The screen contains none of: hungry, lost, missed, neglect, streak, warning.
8. History older than the window is pruned and the save does not grow without bound.
9. `npm test -- --run` green, `npm run build` succeeds.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the branch closes.
- Manual smoke: seed a save with history, open the screen, confirm it reads correctly and fits
  one screen without scrolling.

## Progress

Branch `feat/study-record`, chained off `feat/block-reminders`. All three tasks done.

| Commit | Subject |
|---|---|
| `ca8d162` | `feat(core): remember the blocks she finishes` |
| `1b78741` | `feat(store): keep the record in the save file` |
| `c5638a1` | `feat(ui): a screen that shows the work she did` |

Observed: **28 files / 420 tests green** (baseline 381), `npm run build` succeeds.

### A factual error in this document, corrected by the implementation

This document and the brief both claimed a block finished at **23:30 in Spain** would land on
the next day under `toISOString()`. **That is wrong.** Spain is UTC+1 or UTC+2, so 23:30 local
is still the same UTC day. What UTC actually breaks here is **00:00 to 02:00 local**, which it
pushes onto the PREVIOUS day. West of UTC it is the evening that breaks instead.

The bug was real and the fix is right; the example was backwards. The implementation kept the
23:30 case (correct and harmless) and added the 00:30 case, which is the one that genuinely
fails under `toISOString()` — and the RED run proves it:
`AssertionError: expected '2026-10-02' to be '2026-10-03'`.

It also went further than asked: `lastDays` and `pruneHistory` step back with
`new Date(y, m, d - n, 12)` so a daylight-saving change cannot skip or repeat a date, with a
test across Spain's 2026-03-29 transition, and the suite passes under `TZ=America/New_York`.

### Manual smoke test — RUN AND PASSED (2026-10-02)

Seeded a week with gaps (2, 4, none, 1, none, 5, 3 blocks) and opened the screen:

- Seven day columns oldest-first, today marked in the accent colour.
- The two empty days render as an empty track with no number and no message.
- The total reads "You have finished 15 blocks in all", which matches the seed.
- Content ends at 545 of 993 px: it fits a tablet screen with room to spare, answering the
  open question the implementation could not settle from jsdom.
- The no-guilt assertion holds against the live DOM.

### Note on the nav icon

`themedIcon` resolves a missing per-theme icon through `themes.default.icons[key]`, so the
fallback needed an entry there rather than a parameter: `record: '📖'` at `themes.js:13`. The
four themed icons are being generated separately; until they land, every theme shows that
emoji.

## Next step

The four themed `record` icons, then nothing outstanding. The branch sits unmerged at the end
of the chain.
