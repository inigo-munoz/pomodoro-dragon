# Quests: a ladder made of work already done

## Objective

Give the child a visible ladder of goals that advance with everything she already does, pay a
few coins when one is reached, and can never be failed or lost.

## Problem

The app rewards a work block with coins, and coins buy food and furniture. That is one loop,
and it is immediate: finish a block, get paid. There is nothing that spans more than a single
block — no reason to look up from today and see that forty blocks have been done, or that one
more decoration finishes a room.

The data to say all of that already exists. `lifetimeBlocks` counts every block ever finished,
`history` keeps sixty days, `lairs` knows what is owned and placed, and `xpByDragon` knows how
far each dragon has grown. None of it is ever shown as progress toward anything.

## The decision the user already made

Offered daily quests, cumulative quests and a pick-your-own board, the user chose
**cumulative quests that never expire**, for the reason the option gave: the app does not use
guilt, and a daily quest that vanishes unfinished at midnight is a small failure every day.

That choice is the constraint on everything below. **A quest can only ever be unstarted, in
progress, or done.** There is no expiry, no reset, no deadline, no missed state, and no
wording that implies one — the rule frozen at `src/ui/lairScreen.test.js:166` applies here
more than anywhere else in the app.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| Cumulative, never expiring | yes | user |
| Rewards are coins | assistant — the app already has one currency, a second would dilute it |
| Quests derive from state that already exists | assistant — see below |
| The only new save field is which quests were paid | assistant |
| They live on the Record screen, not a new nav button | assistant — see below |

### Why no new counters

Every quest below reads state the save already holds. Adding a counter per quest would mean a
save migration per quest and two sources of truth for the same fact. The one thing that cannot
be derived is **which quests have already paid out**, because coins get spent — so that, and
only that, is stored.

### Why on the Record screen

The Record is already the "what you did" screen. Quests are the same evidence read as goals,
so they belong under the chart rather than behind a fifth nav icon — which would also need
four more themed art assets. If it earns its own screen later, moving it is cheap.

### A deliberate consequence, not a bug

An existing player has 128 lifetime blocks. The moment quests appear, the early ones are
already satisfied and pay out at once. That is correct: the work was done. It is a one-time
windfall, it is honest, and the alternative — starting everyone at zero — would mean telling a
child that the forty blocks she finished last month do not count.

## Scope

**In scope**
- `src/data/quests.js`: the catalogue, data only.
- `src/core/quests.js`: pure progress and payout logic.
- A `questsPaid` list in the save, with the usual version bump.
- Payout wired where state changes, so a quest completed by any action is paid.
- A quest list under the Record chart: title, progress, reward, and a done mark.

**Out of scope**
- Daily or expiring quests of any kind. The user ruled these out explicitly.
- A separate nav button, screen or art.
- Rewards other than coins: no badges, no titles, no unlocks.
- Quests that depend on counters the save does not keep, such as how many times the dragon
  was fed, or how many long breaks were taken. If a quest needs new bookkeeping, it is not in
  this round.

## The catalogue

All nine derive from existing state. Read the real APIs before using them — `currentLevel` and
the stage list live in `src/core/dragon.js` and `src/data/dragons.js`.

| Quest | Reads | Goal | Coins |
|---|---|---|---|
| Your first block | `lifetimeBlocks` | 1 | 5 |
| Ten blocks | `lifetimeBlocks` | 10 | 15 |
| Fifty blocks | `lifetimeBlocks` | 50 | 40 |
| A hundred blocks | `lifetimeBlocks` | 100 | 75 |
| Open the lair | `lairUnlocked` | true | 10 |
| Your first decoration | any slot filled in any lair | 1 | 10 |
| A room with everything | all four slots filled in one lair | 4 | 40 |
| A growing dragon | any dragon past its first stage | — | 20 |
| A full-grown dragon | any dragon at its last stage | — | 50 |

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline: **31 files / 495 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English.
- **No guilt.** No `hungry|lost|missed|neglect|streak|warning`, and no deadline, expiry or
  failure in any wording or state. An unfinished quest shows progress, never a shortfall.
- **A quest pays once, ever.** Paying twice is the same class of bug as a migration that runs
  twice. The paid list is the guard and must be checked, not assumed.
- `config.storageKey` is untouched.
- Use existing CSS tokens only; do not add a new custom property.
- The Record screen's existing contracts stay: `.record-day`, `.record-span`, `.is-today`,
  `.is-current`, `.is-future`, `[data-range]`, `.record-count`, the lifetime total line.

## Tasks

- [ ] **Q1. The catalogue and the core.** `src/data/quests.js` and `src/core/quests.js`, pure:
      progress for a quest against a state, the list of quests now satisfied, and a function
      that pays the unpaid satisfied ones, returning the new state with coins added and ids
      recorded. Never pays an id already in the list.
- [ ] **Q2. Save and pay.** `questsPaid: []` in `defaultState` with the version bump, and the
      payout called where state changes in `src/app.js`, so finishing a block, decorating a
      room or growing a dragon all settle their quests.
- [ ] **Q3. Show them.** A quest list under the Record chart: each with its title, its progress
      toward the goal, its reward, and a clear done mark. Done ones stay visible — the ladder
      is the point.

## Acceptance criteria

1. Finishing the first work block ever completes that quest and adds its coins once.
2. Re-opening the app, or the screen, never pays the same quest twice.
3. A save with 128 lifetime blocks pays the first four block quests at once, and only once.
4. Filling the fourth slot of a lair completes the full-room quest.
5. An unfinished quest shows how far along it is, with no language of failure or deadline.
6. Done quests stay listed and marked.
7. The Record screen's chart, range switch and lifetime total still work unchanged.
8. `npm test -- --run` green, `npm run build` succeeds.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the branch closes.
- Manual smoke: a seeded save with partial progress, confirming the list reads correctly and
  that a reload pays nothing extra.

## Progress

- Branch `feat/quests`, off `main`.
- Nothing implemented yet.

## Next step

Q1 — the catalogue and the core.
