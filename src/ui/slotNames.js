// The four slots are identified by id everywhere in the data and the save file. Those ids
// are not words a child hears: "floorLeft" has to become a title on the picker and a spoken
// name in a lair aria-label. Both live here so a slot is never named in two places.
//
// The title says the kind of place, so both floor slots read "Floor" — the picker is already
// opened from one specific slot, so the side adds nothing on that screen. The spoken name
// does need the side, because a screen reader announces all four buttons in one room.
const names = {
  wall: { title: 'Wall', spoken: 'wall' },
  floorLeft: { title: 'Floor', spoken: 'left floor' },
  floorRight: { title: 'Floor', spoken: 'right floor' },
  center: { title: 'Center', spoken: 'center' },
};

export const slotTitle = (slot) => names[slot]?.title ?? slot;
export const slotName = (slot) => names[slot]?.spoken ?? slot;
