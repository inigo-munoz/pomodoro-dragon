# The three calls only the user could make

After the sweep, three items were left open because they were product decisions, not
defects. The user made them on 2026-10-02: **"Dragon reducir, solo mute, si leer."**

## 1. The dragon shrinks so it no longer covers the floor slots

Measured geometry in the lair room (percent of the room): the dragon's box spans
18–82 wide and 22–78 tall; the three floor slots start at 73 from the top (`floorLeft` 6–27,
`center` 39.5–60.5, `floorRight` 73–94 wide). So the dragon's bottom five percent sits over
the top of every floor slot, and the art's feet and tail hide part of what is placed there.
This was in the backlog for three sessions waiting for the user's call.

**Decision: reduce the dragon.** Calibrated in the real browser against the slots, not by
picking a number: the dragon is sized so its box clears the floor slots' top edge, kept
centred and anchored where it stands now. The exact value is recorded below once measured.

## 2. Music keeps playing through pause and completion — by design

Today only Mute stops the music; Pause and the end of a block leave it playing under the
bell. The sweep flagged it as "confirm this is intended". **The user confirmed it: only mute
stops the music.** Nothing changes. This paragraph exists so the next person who notices does
not "fix" it.

## 3. The instructions read the child's own settings

`src/ui/instructionsScreen.js` says "After 4 work blocks the break is a long one", reading
`config.durations.default`, while the comment above it claims the page cannot drift. After
she changes the cycle to 2 the page is wrong. It also omits quests, which are now a coin
source.

**Decision: the instructions read the saved settings** — the work length, the break, the long
break and the cycle count — and gain one line about quests. The lair price and the coin rate
stay from `config`, because those are not settings. `src/app.js` passes `state.settings` in;
the screen renders with the defaults when none are given, so it still works from the title
screen before any save exists.

## Constraints

- Strict TDD, runner `npm test -- --run`, baseline **34 files / 593 tests green**; counts only
  with `git worktree list` showing one worktree.
- RDD is off globally; ordinary checks only.
- UI copy stays English. No guilt wording (`lairScreen.test.js:166`).
- Every asserted selector stays. `config.storageKey` is untouched. No new CSS token.

## Tasks

- [x] **U1.** `1977fe2` Dragon sized to clear the floor slots, calibrated in the browser. Merged `39f87dd`.
- [x] **U2.** Music: no change; recorded above.
- [x] **U3.** `eac2f3c` Instructions read the saved settings and mention quests. Merged `5f5143f`.

## Progress

- U1 by the parent on `feat/dragon-room` in the main tree; U3 by a writer in an isolated
  worktree on `feat/instructions-read-settings`. Disjoint files.

## Result

**34 files / 601 tests green** on merged `main` (593 + 2 geometry + 6 instructions), build OK,
precache 123, one worktree.

U1, the measured value: the dragon is a centred **50% square** with its top kept at 22%, so
its base lands at **72%** — one point above the floor slots, which start at 73%. Pinned by a
test in `styles.test.js` that reads the stylesheet and asserts `top + height ≤ 100 − bottom −
slotHeight`, plus centring. Verified in the real Blaze room with the bed, the hatchling and
the chest placed: the box overlaps none of the three floor slots (measured, not eyeballed),
and the dragon is still the hero of the room. The wall slot's box still meets the dragon's
box by ~21px as it always did; the art's transparent top keeps the trophy clear.

U3: the instructions take `settings` and fall back to the defaults when none exist (the title
screen can open them before any save). A new "Quests" step names the Record and the coins.
The old comment claiming the page could not drift was rewritten.

Instrument notes, again: vitest on `main` picked up the writer's worktree copy of
`styles.test.js` and reported its 4 tests as if they were mine, while my own file had failed
to load (`new URL(..., import.meta.url)` is not a `file:` URL under vitest). Reusing the
file's existing `css` reader and running with `--exclude '.claude/**'` gave the honest RED
(78 > 73). And a save seeded with every slot filled paid seven quests on boot — 120 → 270
coins — which incidentally confirmed the quest payout end to end once more.

## Next step

Push; verify from the server (the bundle changed, so the hash is a valid signal).
