# The lair shelf

## Objective

Put everything that can go in the room onto the lair screen itself: a shelf under the room
showing all twelve pieces, what is already owned and what still costs coins, buyable from
there, landing straight in its slot. The separate slot-picker screen then has no reason to
exist and is removed.

## Problem

Decorating today takes a detour. The child taps a slot, a second screen opens listing the
three items for that slot, she buys or places one, and comes back. So:

- She cannot see what the room could become without visiting four separate screens.
- Prices live on a screen she only reaches by tapping the exact slot the item belongs to,
  so she cannot compare what to save up for.
- Until the previous change the picker did not even show her coin balance.

## Why

A six-year-old decides what to want by looking at it. One screen that shows the room, the
twelve things that fit in it, and what each one costs, answers "what can I get next?"
without any navigation at all.

## Decisions taken

| Decision | Value | Who decided |
|---|---|---|
| Shelf lives under the room on the lair screen | yes | user |
| Shows owned and unowned, with prices | yes | user |
| Buying from the shelf places the item immediately | yes | user |
| The slot picker screen is removed as redundant | yes | user |
| Room slots stop being tappable | assistant, follows from removing the picker |

The user asked directly whether the picker should go: "sacalo si es redundante".

## Scope

**In scope**
- `src/ui/lairShelf.js`: four rows, one per slot, three items each, with state and price.
- Buy and place wired from the shelf; the lair screen gains the coin counter.
- Room slots become non-interactive display, keeping the dashed outline that shows where a
  piece goes but dropping the `+` affordance, which would now be a lie.
- `src/ui/slotPicker.js`, its test, its route and its screen name are deleted.

**Out of scope**
- Any change to `src/core/lair.js`. `buyFurniture` already writes the slot as it buys, and
  `placeItem` already moves an owned piece, so the semantics the user asked for exist.
- Selling, removing a placed piece, or emptying a slot. Replacing is how a slot changes.
- The food shop, which is a different screen with a different job.
- New art.

## Constraints

- Strict TDD. Runner `npm test -- --run`. Baseline at start: **25 files / 344 tests green**.
- RDD is off globally; no review lifecycle, ordinary checks only.
- UI copy stays English.
- `buyFurniture` throws on an already-owned item and `placeItem` throws on an unowned one.
  The shelf must route to the right one, never guess, and never offer a purchase the coins
  do not cover.
- These selectors are contracts asserted by surviving tests: `.coin-counter`, `.back-btn`,
  `.screen.lair`, `.screen-title`, `[data-slot]` for the four slots, `.lair-room > .lair-bg`,
  `img.dragon-art`, and `[draggable]` being absent.
- Tests that assert the picker screen, `.screen.picker`, or a tappable `button[data-slot]`
  are being deliberately retired with the feature. Change them honestly; do not weaken what
  survives.

## Tasks

- [x] **S1. The shelf component.** `d91331d` `src/ui/lairShelf.js`: four rows keyed by slot, each
      labelled with the spoken slot name from `src/ui/slotNames.js` (`wall`, `left floor`,
      `right floor`, `corner`) capitalised in CSS so no third naming form is invented. Each
      cell shows the art, the name, and either its price or its state. Four states: placed,
      owned, affordable, too expensive. Pure presentation plus `onBuy` / `onPlace`.
- [x] **S2. Wire it into the lair.** `b5fbc9a` `src/ui/lairScreen.js` renders the shelf under the room
      and gains the coin counter, since this screen now spends coins. Room slots become
      display elements. `src/app.js` passes the buy and place handlers.
- [x] **S3. Delete the picker.** `7ae4721` Remove `src/ui/slotPicker.js`, `src/ui/slotPicker.test.js`,
      the import, the `'picker'` route and its screen name, and the app tests that drove it.

## Acceptance criteria

1. Opening the lair shows the room and, below it, all twelve pieces grouped by where they go.
2. An unowned piece shows its price; tapping it when affordable spends the coins and the
   piece appears in its slot in the room immediately.
3. An unowned piece the child cannot afford is visibly inert and cannot be bought.
4. An owned piece that is not in the room can be placed from the shelf for free.
5. The piece currently in a slot is marked as such in the shelf.
6. The coin balance is visible on the lair screen and updates after a purchase.
7. Tapping a slot in the room does nothing; no picker screen exists anywhere.
8. `npm test -- --run` is green and `npm run build` succeeds.

## Checks

- `npm test -- --run` at the close of every task.
- `npm run build` before the branch closes.
- Manual smoke in the browser: buy a piece from the shelf and watch it land in the room.

## Progress

Branch `feat/lair-shelf`, chained off `feat/friendly-settings`. All three tasks done.

| Commit | Subject |
|---|---|
| `d91331d` | `feat(lair): a shelf of everything that fits in the room` |
| `b5fbc9a` | `feat(lair): buy and place from the shelf` |
| `7ae4721` | `refactor(lair): retire the slot picker, now redundant` |
| `1a10b05` | `style(lair): fit the shelf and the room on one screen` |

Observed: **25 files / 345 tests green**, `npm run build` succeeds. `src/core/lair.js` was
not touched, as planned: `buyFurniture` already wrote the slot as it bought.

### Layout defect found by looking, and fixed (`1a10b05`)

The shelf shipped 216px taller than the viewport (1152 against 936), so half of what the
child could buy sat below the fold, behind the room. Each row spent a whole line on its slot
name and each card was 114px tall. The slot name became a fourth grid column and the cards
were tightened: the shelf went 582px -> 343px and the screen now ends at 913 of 936. The room
keeps its full 420px, because the room is what she came to look at. Cards are 77px tall, well
above the 48px tap floor.

### Manual smoke test — RUN AND PASSED (2026-10-02)

Blaze lair, 75 coins, banner placed and lamp owned-but-stored:

- All four states rendered correctly: banner `placed`, lamp `owned`, imp (80) and hatchling
  (90) `locked` against 75 coins.
- Buying the cushion (30) took the counter and the save file from 75 to 45, put the cushion
  in `floorLeft` in the room, flipped its shelf cell to `placed`, and re-locked nothing that
  should not be — the imp stayed locked because 45 no longer covers 80.
- Tapping the locked imp did nothing: `disabled`, coins unchanged, corner still empty.
- Placing the already-owned lamp cost nothing and filled `floorRight`.
- Slots render as `DIV`, and `.screen.picker` is null anywhere in the app.

### Loose end, deliberately left

`slotTitle` in `src/ui/slotNames.js` lost its only production caller when the picker went;
only its own tests use it now. Its sibling `slotName` is still used by the shelf labels. The
comments in that file still mention the picker. Worth a cleanup pass, not worth a risk here.

## Next step

Nothing outstanding on this feature. The branch sits unmerged, chained after
`feat/friendly-settings`. Whether to merge, push or deploy is the user's call.
