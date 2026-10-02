# The Record, by week or by month

## Objective

Let the Record screen show either the current week or the current month, and make the block
count visible on every bar it draws.

## Problem

The Record shows one thing: the current Monday-to-Sunday week. There is no way to look at a
longer stretch, so a child who studied all month sees only the last few days of it, and the
`history` in the save — which already keeps 60 days — is mostly invisible.

A past day with no blocks also renders with no number at all, which reads as missing data
rather than as a day with none.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| A week / month switch on the Record | yes | user |
| The block count shows on every bar | yes | user |
| **A month is drawn as one bar per week, not per day** | assistant — see below | |
| A past day with no blocks shows `0` | assistant |
| Future days stay blank | inherited from the week view |

### Why a month is weeks and not days

The obvious reading of "by month" is thirty-one bars. On the 480px column the app is built
for, that is about 13px per bar — and at 13px **the number cannot be printed**, which breaks
the other half of what was asked. One bar per calendar week gives four or five bars, each wide
enough to carry its own total, and keeps the same chart the child already understands: a bar
is a span of time, its number is the blocks in it.

## Scope

**In scope**
- `src/core/history.js`: a month view, returning one entry per calendar week of the month
  containing `now`, plus the existing week view.
- `src/ui/recordScreen.js`: a two-way switch, the chosen range drawn, counts on every bar.
- Zeros shown on past days; future spans still blank and still marked as future.

**Out of scope**
- Any range beyond the month, custom ranges, or a date picker.
- Changing what `history` stores, or the 60-day pruning window.
- Minutes. The screen counts blocks; minutes are recorded but not drawn.
- Remembering the chosen range across launches — it resets to the week, which is the common
  case. Say so rather than build a preference for it.

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline: **31 files / 455 tests green**, plus
  whatever `feat/center-slot` adds.
- RDD is off globally; ordinary checks only.
- UI copy stays English.
- **The no-guilt rule**, frozen at `src/ui/lairScreen.test.js:166`: no
  `hungry|lost|missed|neglect|streak|warning`. A zero is a fact; it must never be dressed as a
  failure, and neither view may acquire a target, an average or a goal.
- Weeks start on **Monday**, as the week view already does. A month's first week is partial
  whenever the 1st is not a Monday; include it, and label it honestly.
- Keep the DST-safe date stepping already in `history.js` (`new Date(y, m, d - n, 12)`).
- Existing selectors are contracts: `.record-day` and `.is-today`, the all-time total line,
  `.back-btn`, `.screen.record`, `.screen-title`, `.coin-counter`.
- Use existing CSS tokens only; do not add a new custom property.

## Tasks

- [x] **D1. The month in the core.** `453485e` `monthOf(history, now)`: one entry per calendar week
      overlapping the month of `now`, Monday-first, each `{ key, label, blocks, minutes,
      isCurrent, isFuture }`, where a week's blocks are the sum of its days that fall inside
      the month. Partial first and last weeks are included and summed over their in-month days
      only.
- [x] **D2. The switch and the counts.** `b9365df` `recordScreen.js` renders a two-way control, draws
      the chosen range, shows the count on every past-or-current bar including `0`, and leaves
      future bars blank. The switch is keyboard-reachable and carries the usual 48px target.

## Acceptance criteria

1. The Record opens on the week, as now.
2. Switching to the month shows one bar per week of the current month, four or five of them.
3. Every bar that is not in the future shows its block count, `0` included.
4. The current week is marked in the month view, as today is in the week view.
5. A month whose 1st is not a Monday still totals correctly, counting only in-month days.
6. Neither view contains any of `hungry|lost|missed|neglect|streak|warning`.
7. The all-time total stays, unchanged by the range.
8. `npm test -- --run` green, `npm run build` succeeds.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the branch closes.
- Manual smoke: seed a history spanning two months and confirm both views, including a month
  starting mid-week.

## Progress

Branches `feat/record-range` and then `feat/lifetime-total`, chained after `feat/center-slot`.

| Commit | Subject |
|---|---|
| `453485e` | `feat(core): read the record a month at a time` |
| `b9365df` | `feat(record): switch between the week and the month` |
| `0153a43` | `fix(record): never hide work that landed in the future` |
| `54bb900` | `fix(record): the lifetime total must never shrink` |

Observed: **31 files / 495 tests green**, `npm run build` succeeds.

### The month stays a NATURAL month — the user decided this with the cost in front of them

Verified by hand on 2 October: the month view then shows one bar and four empty weeks, and all
of September's work is invisible because it belongs to another month. That is not a bug, it is
what a calendar month means, but it does mean **the first days of every month look almost
empty**. The alternative offered was a rolling four or five weeks, always populated; the user
chose the natural month, for consistency with the Monday-first calendar week.

### Two defects found by checking the output rather than trusting the tests

**`0153a43` — a future bar hid real work.** A span still to come is drawn blank, which is right
for a day that has not happened. It was also blanking the count on a date that *held* blocks,
and those can be real: a tablet whose clock ran fast records genuine work on a date that
becomes the future once the clock is corrected. Found by printing `monthOf` for a seeded month
and noticing the `26-31` week carried four blocks while being marked future. A future span with
no work is still blank; one with work now shows it.

**`54bb900` — "in all" was shrinking.** The user asked whether there was a limit on blocks.
There is none on blocks or coins, but the question exposed this: `history` is pruned to
`config.historyDays` (60), and the total line summed that pruned history while calling itself
"in all". **From day 61 the number would go DOWN.** A child who studied for three months would
watch her lifetime total shrink — the exact opposite of what the screen exists to say, and
against the project's no-guilt stance.

Fixed with a `lifetimeBlocks` counter in the save that only ever rises and is never pruned, at
version 5, seeded for existing saves from whatever history they still hold. Anything already
pruned is gone and cannot be recovered. The migration carries a
`!Number.isFinite(parsed.lifetimeBlocks)` guard so a save that already has a counter is never
reseeded — a migration that runs twice is the classic way to corrupt data.

Proved by round-trip rather than by the suite alone: a 60-day save seeded at 120 blocks, then
pruned five months later, leaves the history summing 0 while the counter still reads 120.

**The 60-day pruning stays.** It was never the bug. `localStorage` is not a database and
keeping every day forever grows the file without bound; the bug was calling a 60-day window a
lifetime.

## Next step

Nothing outstanding. Four branches sit chained and unmerged after `main`.
