import { spend } from './wallet.js';

export const itemsForSlot = (furniture, slot) => furniture.filter((i) => i.slot === slot);

export const findItem = (furniture, id) => furniture.find((i) => i.id === id) ?? null;

// A function, not a shared constant: one accidental push into a handed-out
// object must never leak into every undecorated dragon.
export const emptyLair = () => ({ owned: [], slots: {} });

export const lairOf = (state, dragonId) => state.lairs?.[dragonId] ?? emptyLair();

// A slot counts as filled only while the saved id is still in the catalogue AND
// still belongs to that slot. Degradation is read-time only: the save is never
// rewritten, so a later release that restores an item restores the room too.
export const itemInSlot = (lair, furniture, slot) => {
  const item = findItem(furniture, lair.slots?.[slot]);
  return item && item.slot === slot ? item : null;
};

const withLair = (state, lair) => ({
  ...state,
  lairs: { ...state.lairs, [state.dragonId]: lair },
});

// Buying and placing have mutually exclusive contracts so a wrong branch in the
// caller fails loudly instead of silently charging for something already owned.
export const buyFurniture = (state, item) => {
  const lair = lairOf(state, state.dragonId);
  if (lair.owned.includes(item.id)) throw new Error('Item already owned');
  const coins = spend(state.coins, item.price);
  return {
    ...withLair(state, {
      owned: [...lair.owned, item.id],
      slots: { ...lair.slots, [item.slot]: item.id },
    }),
    coins,
  };
};

// The slot is read from the item, so a slot mismatch is not representable.
// Ownership is never touched: the displaced item stays owned and can come back free.
export const placeItem = (state, item) => {
  const lair = lairOf(state, state.dragonId);
  if (!lair.owned.includes(item.id)) throw new Error('Item not owned');
  return withLair(state, { ...lair, slots: { ...lair.slots, [item.slot]: item.id } });
};
