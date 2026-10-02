import { describe, it, expect } from 'vitest';
import {
  itemsForSlot, findItem, emptyLair, lairOf, itemInSlot, buyFurniture, placeItem, unlockLair,
} from './lair.js';
import { furniture, slots } from '../data/furniture.js';

describe('furniture catalogue', () => {
  it('has exactly four fixed slots, in order', () => {
    expect(slots).toEqual(['wall', 'floorLeft', 'floorRight', 'center']);
  });

  // Every slot offers the same number of choices on purpose. An uneven split means two
  // slots run out of things to want long before the others, so the balance is pinned here.
  it('holds twelve items, three in every slot', () => {
    expect(furniture).toHaveLength(12);
    expect(slots.map((s) => itemsForSlot(furniture, s).length)).toEqual([3, 3, 3, 3]);
  });

  it('places every item in a slot the room actually has', () => {
    for (const item of furniture) {
      expect(slots).toContain(item.slot);
    }
  });

  it('has no duplicate ids', () => {
    const ids = furniture.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prices every item as an integer between 25 and 90', () => {
    for (const item of furniture) {
      expect(Number.isInteger(item.price)).toBe(true);
      expect(item.price).toBeGreaterThanOrEqual(25);
      expect(item.price).toBeLessThanOrEqual(90);
    }
  });

  // The emoji lives only here, so the default theme carries no copy to drift.
  it('gives every catalogue item a fallback symbol', () => {
    for (const item of furniture) {
      expect(typeof item.fallback).toBe('string');
      expect(item.fallback.length).toBeGreaterThan(0);
    }
  });

  it('marks exactly three pets, all in the center', () => {
    const pets = furniture.filter((i) => i.pet === true);
    expect(pets).toHaveLength(3);
    expect(pets.every((i) => i.slot === 'center')).toBe(true);
  });
});

describe('slot lookup', () => {
  it('lists only the items of a slot, in catalogue order', () => {
    expect(itemsForSlot(furniture, 'floorRight').map((i) => i.id))
      .toEqual(['lamp', 'chest', 'shelf']);
  });

  it('finds an item by id and returns null for an unknown one', () => {
    expect(findItem(furniture, 'bed').slot).toBe('floorLeft');
    expect(findItem(furniture, 'nope')).toBeNull();
  });
});

const item = (id) => findItem(furniture, id);
const stateWith = (extra = {}) => ({ dragonId: 'frost', coins: 100, lairs: {}, ...extra });

describe('emptyLair and lairOf', () => {
  it('hands out a fresh empty lair each call', () => {
    const a = emptyLair();
    a.owned.push('bed');
    a.slots.wall = 'banner';
    expect(emptyLair()).toEqual({ owned: [], slots: {} });
  });

  it('returns an empty lair for a dragon never decorated', () => {
    const state = stateWith();
    expect(lairOf(state, 'frost')).toEqual({ owned: [], slots: {} });
    expect(state.lairs).toEqual({});
  });

  it('does not throw when the state has no lairs key at all', () => {
    expect(lairOf({}, 'frost')).toEqual({ owned: [], slots: {} });
  });

  it('returns a stored lair unchanged', () => {
    const lair = { owned: ['bed'], slots: { floorLeft: 'bed' } };
    expect(lairOf(stateWith({ lairs: { frost: lair } }), 'frost')).toEqual(lair);
  });
});

describe('itemInSlot', () => {
  it('is filled for a valid id saved under its own slot', () => {
    const lair = { owned: ['bed'], slots: { floorLeft: 'bed' } };
    expect(itemInSlot(lair, furniture, 'floorLeft')).toBe(item('bed'));
  });

  it('is null for an empty slot', () => {
    expect(itemInSlot(emptyLair(), furniture, 'wall')).toBeNull();
  });

  it('is null for an id that left the catalogue', () => {
    const lair = { owned: [], slots: { wall: 'gone' } };
    expect(itemInSlot(lair, furniture, 'wall')).toBeNull();
  });

  it('is null when the item no longer belongs to the slot it is saved under', () => {
    const lair = { owned: ['bed'], slots: { wall: 'bed', floorLeft: 'bed' } };
    expect(itemInSlot(lair, furniture, 'wall')).toBeNull();
    expect(itemInSlot(lair, furniture, 'floorLeft')).toBe(item('bed'));
  });
});

describe('buyFurniture', () => {
  it('deducts the price, records ownership once and fills the item slot', () => {
    const next = buyFurniture(stateWith(), item('bed'));
    expect(next.coins).toBe(60);
    expect(lairOf(next, 'frost').owned).toEqual(['bed']);
    expect(lairOf(next, 'frost').slots.floorLeft).toBe('bed');
  });

  it('succeeds with exact change and leaves zero coins', () => {
    const next = buyFurniture(stateWith({ coins: 40 }), item('bed'));
    expect(next.coins).toBe(0);
  });

  it('throws one coin short and leaves the state untouched', () => {
    const state = stateWith({ coins: 39 });
    const before = structuredClone(state);
    expect(() => buyFurniture(state, item('bed'))).toThrow('Insufficient coins');
    expect(state).toEqual(before);
  });

  it('does not mutate a frozen input state', () => {
    const state = Object.freeze(stateWith({ lairs: Object.freeze({}) }));
    expect(() => buyFurniture(state, item('bed'))).not.toThrow();
  });

  it('keeps the displaced item owned when a new one takes its slot', () => {
    const first = buyFurniture(stateWith(), item('banner'));
    const second = buyFurniture(first, item('painting'));
    const lair = lairOf(second, 'frost');
    expect(lair.slots.wall).toBe('painting');
    expect(lair.owned).toEqual(['banner', 'painting']);
  });

  it('refuses to charge again for an item already owned', () => {
    const once = buyFurniture(stateWith(), item('bed'));
    expect(() => buyFurniture(once, item('bed'))).toThrow('Item already owned');
    expect(once.coins).toBe(60);
  });

  it('leaves every sibling lair byte-identical', () => {
    const lairs = {
      blaze: { owned: ['lamp'], slots: { floorRight: 'lamp' } },
      thorn: { owned: ['nest'], slots: { floorLeft: 'nest' } },
      tempest: { owned: ['trophy'], slots: { wall: 'trophy' } },
    };
    const next = buyFurniture(stateWith({ lairs }), item('bed'));
    for (const id of ['blaze', 'thorn', 'tempest']) {
      expect(JSON.stringify(next.lairs[id])).toBe(JSON.stringify(lairs[id]));
    }
  });

  it('treats the same item id in two dragons as independent', () => {
    const lairs = { blaze: { owned: ['bed'], slots: { floorLeft: 'bed' } } };
    const next = buyFurniture(stateWith({ lairs }), item('bed'));
    expect(lairOf(next, 'frost').owned).toEqual(['bed']);
    expect(next.lairs.blaze).toEqual(lairs.blaze);
  });

  it('stores no per-pet fields', () => {
    const next = buyFurniture(stateWith(), item('imp'));
    expect(lairOf(next, 'frost')).toEqual({ owned: ['imp'], slots: { center: 'imp' } });
  });
});

describe('placeItem', () => {
  const owning = () => buyFurniture(buyFurniture(stateWith(), item('banner')), item('painting'));

  it('puts an owned item back for free and keeps both owned', () => {
    const state = owning();
    const next = placeItem(state, item('banner'));
    expect(lairOf(next, 'frost').slots.wall).toBe('banner');
    expect(lairOf(next, 'frost').owned).toEqual(['banner', 'painting']);
    expect(next.coins).toBe(state.coins);
  });

  it('refuses an item that is not owned and leaves the state untouched', () => {
    const state = owning();
    const before = structuredClone(state);
    expect(() => placeItem(state, item('trophy'))).toThrow('Item not owned');
    expect(state).toEqual(before);
  });

  it('is a harmless no-op for the item already on display', () => {
    const state = owning();
    expect(placeItem(state, item('painting'))).toEqual(state);
  });

  it('never shrinks owned however often the child swaps', () => {
    let state = owning();
    for (const id of ['banner', 'painting', 'banner', 'painting', 'banner']) {
      state = placeItem(state, item(id));
      expect(lairOf(state, 'frost').owned).toEqual(['banner', 'painting']);
      expect(state.coins).toBe(25);
    }
  });

  it('leaves a sibling dragon untouched', () => {
    const lairs = { blaze: { owned: ['banner'], slots: { wall: 'banner' } } };
    const state = buyFurniture(stateWith({ lairs }), item('painting'));
    const next = placeItem(buyFurniture(state, item('banner')), item('painting'));
    expect(JSON.stringify(next.lairs.blaze)).toBe(JSON.stringify(lairs.blaze));
  });
});

describe('unlockLair', () => {
  const locked = (coins, extra = {}) => ({ dragonId: 'frost', coins, lairs: {}, ...extra });

  it('spends the price and sets the flag', () => {
    const next = unlockLair(locked(80), 50);
    expect(next.coins).toBe(30);
    expect(next.lairUnlocked).toBe(true);
  });

  it('succeeds on exact change, leaving 0', () => {
    const next = unlockLair(locked(50), 50);
    expect(next.coins).toBe(0);
    expect(next.lairUnlocked).toBe(true);
  });

  it('throws one coin short and leaves the input untouched', () => {
    const state = locked(49);
    const before = JSON.stringify(state);
    expect(() => unlockLair(state, 50)).toThrow('Insufficient coins');
    expect(JSON.stringify(state)).toBe(before);
  });

  it('does not mutate a frozen input', () => {
    const state = Object.freeze(locked(100));
    expect(() => unlockLair(state, 50)).not.toThrow();
  });

  it('treats a state with no lairUnlocked key as locked', () => {
    const state = { coins: 60 };
    expect('lairUnlocked' in state).toBe(false);
    expect(unlockLair(state, 50).lairUnlocked).toBe(true);
  });

  it('returns the same reference when already unlocked, however many times, even when short', () => {
    const state = locked(200, { lairUnlocked: true });
    expect(unlockLair(state, 50)).toBe(state);
    expect(unlockLair(unlockLair(state, 50), 50)).toBe(state);
    const poor = locked(0, { lairUnlocked: true });
    expect(() => unlockLair(poor, 50)).not.toThrow();
    expect(unlockLair(poor, 50)).toBe(poor);
    expect(unlockLair(poor, 50).coins).toBe(0);
  });

  it('leaves the lairs map reference-equal', () => {
    const lairs = { blaze: { owned: ['trophy'], slots: { wall: 'trophy' } } };
    const next = unlockLair(locked(80, { lairs }), 50);
    expect(next.lairs).toBe(lairs);
  });

  it('is not furniture: the catalogue stays at twelve items and no unlock id is ownable', () => {
    expect(furniture).toHaveLength(12);
    const next = unlockLair(locked(80, { lairs: { frost: { owned: ['bed'], slots: {} } } }), 50);
    expect(next.lairs.frost.owned).toEqual(['bed']);
  });

  it('has no counterpart that locks again', async () => {
    const mod = await import('./lair.js');
    expect(Object.keys(mod).filter((k) => /^(re)?lock/i.test(k))).toEqual([]);
  });
});
