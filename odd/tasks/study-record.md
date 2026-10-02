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

- [ ] **H1. The pure core.** `src/core/history.js`: `dayKey(now)` as a local `YYYY-MM-DD`,
      `recordBlock(history, now, minutes)` adding to that day's `blocks` and `minutes`,
      `pruneHistory(history, now, days)` keeping the most recent window, `lastDays(history,
      now, n)` returning n entries oldest-first including empty days, and a total.
- [ ] **H2. Save it.** `history: {}` in `defaultState`; record on work completion in `app.js`
      beside `grantWorkReward`, then prune. A test must prove an old save without the field
      loads clean and gains it.
- [ ] **H3. Show it.** `src/ui/recordScreen.js` with the screen title, the back button, a bar
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

- Branch `feat/study-record`, chained off `feat/block-reminders`.
- Nothing implemented yet.

## Next step

H1 — the pure core.
