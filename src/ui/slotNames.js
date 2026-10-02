// The four slots are identified by id everywhere in the data and the save file. Those ids
// are not words a child hears: "floorLeft" has to become a spoken name in a lair aria-label.
// It lives here so a slot is never named in two places.
//
// The spoken name needs the side, because a screen reader announces all four buttons in one
// room and two of them are floors.
const names = {
  wall: 'wall',
  floorLeft: 'left floor',
  floorRight: 'right floor',
  center: 'center',
};

export const slotName = (slot) => names[slot] ?? slot;
