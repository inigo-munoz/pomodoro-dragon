# Sweep remainder: everything left from the 2026-10-02 audit

## Objective

Close the rest of the full-app sweep, in the order of impact on a child using a tablet:
notifications that actually fire, controls she can hit, screens that never show her a file
path, a save that cannot be wiped by one bad day, and then the dead weight.

## Source

The sweep observation "Full-app sweep: 7 verified bugs…" and the three fixes already shipped
in `odd/tasks/sweep-fixes.md`. The user said "sigue con lo que queda".

## Groups, and why they are split this way

Writers run in parallel only when their files do not overlap. A and B are disjoint (A owns
`src/platform/reminders.js` and the reminder call sites in `src/app.js`; B owns the UI
screens, `src/styles.css` and the chooser wiring in `src/app.js` — different regions). C and
D both touch `src/core/history.js` and D touches `src/styles.css`, so they run after A and B
have merged.

### Group A — notifications that fire on the tablet
`new Notification()` throws on Android Chrome, which only shows notifications through a
service worker. `reminders.js` swallows that and the end-of-block notice silently never
appears on the one device this is for.

- `notify()` tries the service worker first: `navigator.serviceWorker.getRegistration()` →
  `registration.showNotification(title, { body })`, and falls back to `new Notification`
  only when there is no registration. Both paths stay silent on failure.
- Keep every existing contract of the adapter and its tests; add tests for the SW path, the
  fallback, and a SW whose `showNotification` throws.

### Group B — things she can reach, and nothing that lies
1. `← Back` renders **74×23** on every screen but Settings (which carries its own 48px rule at
   `styles.css:160`). Give the base `.back-btn` the 48px floor and drop the Settings override,
   so there is one rule, not one plus an exception.
2. The shop and settings nav buttons have no accessible name (`mainScreen.js:83,90`); lair,
   record and mute do. With the emoji fallback they announce as "red apple" and "gear".
3. `art(theme.room, 'Lair', theme.room)` in `unlockLairScreen.js:27` and `lairScreen.js:46`
   uses the IMAGE PATH as the fallback: a 404 or an offline miss shows
   `/art/lair/frost-room.webp` as text. The fallback is the default theme's room emoji, and the
   alt is `''` because the room is decorative.
4. The unlock screen asks for 50 coins and does not show the purse. It gets the `.screen-bar`
   with back and coin counter, like shop, lair and record.
5. The chooser has no way back. From the title screen Start goes there; from Settings, Change
   Dragon goes there. It gets a Back that returns to wherever it came from, through an
   `onBack` the app wires per entry point. Picking still works as before.
6. `.dragon-choice` cards are 218×47: one pixel under the floor. 48.

### Group C — a save that one bad day cannot wipe
`store.js` v<5 migration calls `totalBlocks(parsed.history)`, which reads `day[field]`; a
`null` or non-object day throws, the `catch` returns `defaultState`, and the whole save is
gone. Make `totalBlocks` / `totalMinutes` skip malformed days, and make the migration never
throw. Also: `lifetimeBlocks` is only validated for v<5 — a string value on a v5+ save yields
`"5" + 1 = "51"`; coerce on load. And `onConfirmUnlock` gets the same purse re-check as
`onBuyItem`, so the two sibling guards are symmetric.

### Group D — dead weight
- Remove, with their tests: `addXp` (`core/dragon.js`), `remainingAt` (`core/timer.js`),
  `slotTitle` and the `title` field (`ui/slotNames.js`), `.shelf-tag` and the duplicate
  `.screen.title { justify-content: center }` in `styles.css`.
- `totalMinutes` stays if Group C uses it; otherwise remove it.
- The `mute` icon key in every theme and the five `*-mute.webp` files: never rendered (main
  uses `sound` plus a CSS stroke). Remove the key and the files; they are precached today.
- Un-export what only its own file or tests use: `dayKey`, `findItem`, `emptyLair`,
  `satisfiedQuests`, `defaultState`, `isImagePath`, `addDragonXp`, `UNSUPPORTED` — only
  where the tests can still reach what they need; do not weaken a test to un-export.
- Comments that describe things gone: "the picker" in `slotNames.js`, the misplaced
  comments at `app.js:50-52` and `:62`.
- Docs: `docs/art-prompts.md` title and its `corner` references; a one-line note at the top
  of the two lair documents under `docs/superpowers/` saying the slot picker was replaced by
  the shelf and `corner` is now `center`. Historical documents are not rewritten.

### Housekeeping, done by the parent, not a writer
Close PRs #2–#5 (their work is merged), delete the merged local branches, prune remotes.

## Explicitly not in this batch
- The dragon overlapping `floorLeft`: needs the user to say how much to shrink it.
- "Music keeps playing through pause": behaviour to confirm with the user, not a bug.
- Instructions quoting defaults rather than the saved settings; naming drift
  (block/session, Work/Focus): product wording, to be decided, not silently changed.

## Constraints

- Strict TDD, runner `npm test -- --run`, baseline **32 files / 550 tests green**.
- RDD is off globally; ordinary checks only.
- UI copy stays English. No guilt wording (`lairScreen.test.js:166`).
- Every asserted selector and `data-*` hook stays. `config.storageKey` is untouched.
- Any new colour goes through existing tokens; no new custom property.
- Every asset path through `assetUrl()` or the Vite base.

## Tasks

- [x] **A.** `6bd2e29` Notifications through the service worker, with fallback. Merged as `7ab006d`.
- [x] **B.** `4c40b49`, `d4e8b65`, `8b65310` Back at 48px everywhere; named nav buttons; room
      fallback; unlock purse; chooser back; 48px dragon cards. Merged as `d6c6bfe`.
- [x] **C.** `ede970f` Migration that cannot wipe a save; `lifetimeBlocks` coerced; symmetric unlock guard.
- [x] **D.** `fcc7184`, `25aa8f8` Dead code, dead icons, stale comments, doc notes.
- [x] **H.** PRs closed, branches pruned. Done first, by the parent, while A and B ran:
      PRs #2–#5 confirmed at +0 against `main` (`git rev-list --count main..origin/<branch>`),
      closed with a note explaining they had merged through the chain, their remote branches
      deleted; 21 merged local branches deleted; `main` and the two live writer branches kept.
      `gh pr list --state open` → 0.

## Acceptance

1. On a device where `new Notification` throws, the end-of-block notice still appears via the
   service worker; on one with no registration, the old path still works.
2. Every `← Back` and every dragon card measures at least 48px tall in the real browser.
3. Shop and settings nav buttons have accessible names in both the art and emoji cases.
4. A failed room image shows an emoji, never a path.
5. The unlock screen shows the coin counter; the chooser has a working Back from both entries.
6. A v3 save with a `null` history day loads with everything else intact.
7. Build precache drops by the five removed `mute` files; the shipped bundle has no `addXp`.
8. `npm test -- --run` green, `npm run build` succeeds, deploy verified from the server.

## Progress

A and B ran in parallel in isolated worktrees off `44e3af7`, both merged into `main`:
**33 files / 571 tests green** on the merged result (550 + 9 + 12), build OK, precache still
127. Each writer's `app.js` touch landed in its own region (the `notify` call and the chooser
wiring) and the two merged without conflict.

Decisions the writers made and I kept:
- A: a `showNotification` that throws is NOT retried through the constructor — the worker
  owned the attempt, a retry could notify twice, and where the constructor throws (Android) it
  would fail anyway. The `notify` call in `app.js` is wrapped in `Promise.resolve(...).catch`
  so an async rejection can never surface as unhandled.
- B: `.dragon-choice` got its own `min-height: 48px` rule rather than widening the shared
  `.food-card` rule, so food cards are unchanged. The first-run chooser (no dragon yet) has no
  Back on purpose — there is no screen behind it; the title-entered and Settings-entered ones
  return where they came from. `defaultRoom` (🕳️) is exported from `core/theme.js` as the
  room fallback. A new `src/styles.test.js` reads the final CSS and pins the single
  `.back-btn` rule at 48px and the absence of the Settings override — the only way to test
  layout facts under jsdom.

Two instrument notes, because they cost time:
- Both worktrees were based on `origin/main` (`44e3af7`), not local `main`, so each writer's
  diff "deleted" this document. A 3-way merge keeps it; a diff apply would not. Checked with
  `git merge-tree` before merging.
- The worktrees live under `.claude/worktrees/` INSIDE the repo, so vitest on `main` ran their
  copies too and reported 98 files / 1692 tests. The honest count came back after removing
  them. The count must be taken with no worktrees present.

C and D run next as one writer on one branch in the main working tree: they share
`history.js` and `styles.css`, so splitting them buys a conflict, not speed.

### C and D — done, one writer, one branch

**34 files / 593 tests green**, build OK, **precache 127 → 123**: exactly the four `*mute*.webp`
files removed (the sweep said five; it was four). `addXp`, `remainingAt`, `totalMinutes`,
`slotTitle` and the `title` field are gone, with their tests; `src/data/themes.test.js` now
derives the icon keys the UI actually calls and pins every theme to exactly that set, so a dead
key cannot creep back. `styles.test.js` pins one `.screen.title` rule and no `.shelf-tag`.

Verified by hand, not from the report: a hostile v3 save — a `null` day, an `"oops"` day,
`lifetimeBlocks: '5'`, a `corner` slot — loads intact (frost, 88 coins, `center: bird`,
version 6, `lifetimeBlocks` 7 from the two valid days). Before C that exact file became
`defaultState`: total loss. All four migrations ran in order on it.

Honest notes from the writer, kept:
- The unlock guard produced NO observable RED: `unlockLairScreen.js` already gates on
  `affordable`, so a forced click with 49 coins was a no-op before and after. The app-level
  check is defence in depth, symmetric with `onBuyItem`; its test pins that no window `error`
  fires (jsdom swallows listener throws, so a bare `not.toThrow()` would be vacuous).
- Seven exports stay exported because a test imports each (`dayKey`, `findItem`, `emptyLair`,
  `satisfiedQuests`, `defaultState`, `isImagePath`, `addDragonXp`); only `UNSUPPORTED` was
  un-exported. No test was weakened to hide a symbol.
- The "Settings-derived durations" comment described the restore path, not the settings
  handler; it now sits above `createTimerState(...)` in the restore.
- `corner` still appears in the BODY of `docs/art-prompts.md` by design (historical prompts);
  the title and a note changed. The two lair documents got a two-line note and nothing else.

## Next step

Merge into `main`, push, verify from the server. Then only the user's items remain: the
dragon over `floorLeft`, music through pause, and the instructions wording.
