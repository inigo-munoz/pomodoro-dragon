# Dragon Lair — design

Date: 2026-10-01
Status: approved in conversation, not yet implemented

## Purpose

Coins currently have exactly one use: buy food, which converts into XP, which levels the
dragon. That is a single sink and a single goal. The lair gives coins a second, purely
cosmetic sink — a room per dragon that the child furnishes over time.

This is for one user: the author's eight-to-ten year old daughter, on an Android tablet.
That constrains the design more than any technical factor. The lair must never punish her
for being away, never create a loss state, and never require fine motor precision.

Success looks like: she finishes a work block, sees she can afford the chest she has been
saving for, and goes to put it in her dragon's room.

## Decisions taken, and why

These were decided explicitly during design. They are recorded here so a later reader does
not reopen them by accident.

1. **One lair per dragon, each fully themed.** Frost gets an ice cave, Blaze a lava cave,
   Thorn a forest hollow, Tempest a storm eyrie. Furniture is themed too: the ice bed and
   the lava bed are different art, not the same bed recoloured. This was chosen over a
   shared room with shared furniture, in full knowledge that it multiplies the art by four.
   The reason is that four distinct lairs are four distinct goals.
2. **Fixed slots, no free placement.** The room has four defined positions. Buying an item
   puts it in its slot. There is no dragging. A composition that cannot be arranged cannot
   be arranged badly, and a child on a tablet should not have to fight a drag target.
3. **Pets are decorative only.** They sit in the corner slot and idle. They have no hunger,
   no mood, no daily care. The needs-based pet is the mechanic this project rejects: it
   makes not studying into harming something, which is guilt dressed as engagement.
4. **Buying happens from inside the lair.** Tapping an empty slot opens a picker showing
   only the items that fit that slot, for that dragon's theme. The desire comes from seeing
   the empty space. The food shop is untouched.

## Out of scope

Deliberately excluded. Each could be added later without redesign:

- Dragging or repositioning items.
- Pet needs, moods or feeding.
- Selling items back, or refunds.
- A global catalogue screen listing every purchasable item.
- Sharing furniture between dragons.

## Data

New file `src/data/furniture.js`, shaped like the existing `src/data/foods.js`:

```js
export const slots = ['wall', 'floorLeft', 'floorRight', 'corner'];

export const furniture = [
  { id: 'banner',    slot: 'wall',       name: 'Banner',    price: 30 },
  { id: 'painting',  slot: 'wall',       name: 'Painting',  price: 45 },
  { id: 'trophy',    slot: 'wall',       name: 'Trophy',    price: 70 },
  { id: 'bed',       slot: 'floorLeft',  name: 'Bed',       price: 40 },
  { id: 'nest',      slot: 'floorLeft',  name: 'Nest',      price: 60 },
  { id: 'chest',     slot: 'floorRight', name: 'Chest',     price: 35 },
  { id: 'shelf',     slot: 'floorRight', name: 'Bookshelf', price: 55 },
  { id: 'lamp',      slot: 'floorRight', name: 'Lamp',      price: 25 },
  { id: 'imp',       slot: 'corner',     name: 'Imp',       price: 80, pet: true },
  { id: 'hatchling', slot: 'corner',     name: 'Hatchling', price: 90, pet: true },
];
```

Ten items across four slots, so every slot offers a choice. Prices sit between the apple
(10) and roughly twice the cake (50), which makes a single item a few completed blocks of
saving at one coin per minute.

The themed art is resolved exactly the way food art already is in `shopScreen.js`
(`theme?.foods?.[food.id] ?? food.icon`). Each theme in `src/data/themes.js` gains a
`furniture` map:

```js
furniture: {
  bed: '/art/lair/frost-bed.webp',
  // ...
},
room: '/art/lair/frost-room.webp',
```

No new art-resolution mechanism is introduced. `art()` and `assetUrl()` are reused as is,
which also means the existing emoji fallback behaviour applies unchanged.

## State

`defaultState` in `src/store/store.js` gains one field:

```js
lairs: {},
```

Populated per dragon:

```js
lairs: {
  frost: {
    owned: ['bed', 'banner', 'lamp'],
    slots: { wall: 'banner', floorLeft: 'bed', floorRight: 'lamp' },
  },
}
```

**Why `owned` and `slots` are separate.** `owned` is what she paid for; `slots` is what is
currently on display. Putting a new painting on the wall returns the banner to `owned`
rather than destroying it, so she can swap back for free. An item that vanishes when
replaced would mean losing 45 coins of saving with one tap, which is exactly the kind of
small betrayal this app should not contain.

**No migration is required.** `createStore.load` already does
`migrate({ ...defaultState(config), ...parsed }, parsed)`, so the defaults fill in fields
that an older save does not have. Adding `lairs: {}` is therefore additive and safe. The
`version` field stays at 3; it is bumped only for shape changes the defaults merge cannot
absorb.

## Core logic

New file `src/core/lair.js`. Pure, no DOM, tested like `src/core/game.js`.

```js
itemsForSlot(furniture, slot)        // -> the items that fit a slot
lairOf(state, dragonId)              // -> { owned, slots }, defaulted when absent
buyFurniture(state, item)            // spends coins, marks owned, places it in its slot
placeItem(state, slot, itemId)       // moves an owned item into a slot; never charges
```

`buyFurniture` spends through the existing `spend()` in `src/core/wallet.js`, which throws
when the purchase is unaffordable — the same contract `buyFood` relies on. It writes into
`lairs[state.dragonId]` by spreading the rest of `lairs`, mirroring how `addDragonXp`
spreads `xpByDragon` so other dragons are left untouched.

`placeItem` refuses an item that is not in `owned`, and refuses an item whose `slot` does
not match the target slot.

## UI

New file `src/ui/lairScreen.js`, and a third button in the existing nav bar alongside shop
and settings.

Layout, matching the agreed arrangement:

```
┌────────────────────────┐
│       [ wall ]         │
│                        │
│          🐉            │   the active dragon, at its current level
│                        │
│ [floorLeft] [floorRight]│
│       [ corner ]       │
└────────────────────────┘
```

The dragon in the centre reuses the level art the main screen already renders, so the lair
reflects growth with no additional logic: level up, and the dragon standing in the room is
the bigger one.

A filled slot renders its themed art. An empty slot renders a `+` affordance; tapping it
opens the picker for that slot, listing the items from `itemsForSlot`, each with its price
and dimmed when unaffordable — the same `canAfford` dimming the food shop already uses.

The room background comes from `theme.room`.

**Note on the render loop.** `lairScreen` must follow the convention established by commit
93a5518: anything that updates per second patches the mounted DOM in place rather than
rebuilding it, so idle animations are not restarted. The lair has no per-second updates
today, so this only matters if one is added later.

## Art inventory

| Asset | Count |
|---|---|
| Room backgrounds, one per theme | 4 |
| 10 items × 4 themes | 40 |
| **Total** | **44** |

This is the dominant cost of the feature and it is art, not code. Adding an eleventh item
later costs four more pieces; adding a fifth dragon costs eleven.

## Testing

`src/core/lair.test.js`:

- Buying deducts the price and records the item in `owned` and in its slot.
- Buying writes only to the active dragon and leaves other dragons' lairs intact — the
  direct counterpart of the existing `addDragonXp adds only to the active dragon` test.
- Buying without enough coins throws and changes nothing.
- Placing a new item in an occupied slot keeps the displaced item in `owned`.
- `placeItem` rejects an unowned item, and rejects a slot mismatch.
- `itemsForSlot` returns only matching items.

`src/ui/lairScreen.test.js`:

- Empty slots render a buy affordance; filled slots render the theme's art for that item.
- The dragon is rendered at its current level.
- An unaffordable item in the picker is dimmed and does not fire a purchase.
- A theme with no art for an item falls back rather than rendering a broken image.

Existing suites must stay green: this feature adds files and one state field and changes
no existing behaviour.

## Risks

- **Art volume.** 44 pieces is the real schedule. The code can land and be tested against
  emoji fallbacks before any art exists, which is the recommended order.
- **Economy pacing.** Four lairs funded from one shared coin purse may feel slow. Coins per
  minute and the price table are both single-value changes in `src/data/config.js` and
  `src/data/furniture.js` if it needs tuning after real use.
- **Nav bar crowding.** A third nav button at the current icon size (58px glyph, 78×90 tap
  target) must be checked at 480px, the app's maximum width.
