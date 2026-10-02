import { describe, it, expect } from 'vitest';
import { questProgress, satisfiedQuests, payQuests } from './quests.js';
import { quests } from '../data/quests.js';
import { furniture, slots } from '../data/furniture.js';
import { dragons } from '../data/dragons.js';

const world = { furniture, slots, dragons };
const quest = (id) => quests.find((q) => q.id === id);
const progress = (id, state) => questProgress(quest(id), state, world);
const GUILT = /hungry|lost|missed|neglect|streak|warning|expire|deadline|late|fail|overdue/i;

const base = (over = {}) => ({
  coins: 0, lifetimeBlocks: 0, lairUnlocked: false, lairs: {}, xpByDragon: {}, questsPaid: [], ...over,
});
const room = (slotMap) => ({ lairs: { frost: { owned: Object.values(slotMap), slots: slotMap } } });
const fullRoom = { wall: 'banner', floorLeft: 'bed', floorRight: 'lamp', center: 'imp' };

describe('quest catalogue', () => {
  it('holds the nine quests, each with an id, title, positive reward and a goal', () => {
    expect(quests.map((q) => q.id)).toEqual([
      'blocks-1', 'blocks-10', 'blocks-50', 'blocks-100', 'lair-open',
      'decor-1', 'room-full', 'dragon-grow', 'dragon-full',
    ]);
    expect(quests.map((q) => q.reward)).toEqual([5, 15, 40, 75, 10, 10, 40, 20, 50]);
    expect(new Set(quests.map((q) => q.id)).size).toBe(9);
    for (const q of quests) expect(q.title.length).toBeGreaterThan(0);
  });

  it('never words a quest as something that can be missed or run out', () => {
    for (const q of quests) expect(q.title).not.toMatch(GUILT);
  });
});

describe('questProgress', () => {
  it('counts lifetime blocks toward a block quest', () => {
    expect(progress('blocks-10', base({ lifetimeBlocks: 3 }))).toEqual({ current: 3, goal: 10, done: false });
  });

  it('is done exactly at the goal and one past it, never showing more than the goal', () => {
    expect(progress('blocks-10', base({ lifetimeBlocks: 10 }))).toEqual({ current: 10, goal: 10, done: true });
    expect(progress('blocks-10', base({ lifetimeBlocks: 11 }))).toEqual({ current: 10, goal: 10, done: true });
    expect(progress('blocks-10', base({ lifetimeBlocks: 9 })).done).toBe(false);
  });

  it('reads the lair as 0 / 1 until it is unlocked', () => {
    expect(progress('lair-open', base())).toEqual({ current: 0, goal: 1, done: false });
    expect(progress('lair-open', base({ lairUnlocked: true }))).toEqual({ current: 1, goal: 1, done: true });
  });

  it('counts a decoration in any lair, and the fullest single room for the full-room quest', () => {
    expect(progress('decor-1', base())).toEqual({ current: 0, goal: 1, done: false });
    const one = base(room({ wall: 'banner' }));
    expect(progress('decor-1', one).done).toBe(true);
    expect(progress('room-full', one)).toEqual({ current: 1, goal: 4, done: false });
    const three = base(room({ wall: 'banner', floorLeft: 'bed', center: 'imp' }));
    expect(progress('room-full', three).current).toBe(3);
    expect(progress('room-full', base(room(fullRoom)))).toEqual({ current: 4, goal: 4, done: true });
  });

  it('does not add up slots across different lairs for the full-room quest', () => {
    const state = base({ lairs: {
      frost: { owned: ['banner', 'bed'], slots: { wall: 'banner', floorLeft: 'bed' } },
      blaze: { owned: ['lamp', 'imp'], slots: { floorRight: 'lamp', center: 'imp' } },
    } });
    expect(progress('room-full', state)).toEqual({ current: 2, goal: 4, done: false });
    expect(progress('decor-1', state).done).toBe(true);
  });

  it('ignores a saved id the catalogue no longer holds or that belongs to another slot', () => {
    expect(progress('decor-1', base(room({ wall: 'ghost' }))).done).toBe(false);
    expect(progress('decor-1', base(room({ wall: 'bed' }))).done).toBe(false);
  });

  it('treats a growing dragon as any dragon past its first stage', () => {
    expect(progress('dragon-grow', base())).toEqual({ current: 0, goal: 1, done: false });
    expect(progress('dragon-grow', base({ xpByDragon: { frost: 99 } })).done).toBe(false);
    expect(progress('dragon-grow', base({ xpByDragon: { frost: 100 } }))).toEqual({ current: 1, goal: 1, done: true });
  });

  it('measures a full-grown dragon by stages climbed, done only at the last stage', () => {
    expect(progress('dragon-full', base({ xpByDragon: { blaze: 300 } }))).toEqual({ current: 2, goal: 3, done: false });
    expect(progress('dragon-full', base({ xpByDragon: { blaze: 600 } }))).toEqual({ current: 3, goal: 3, done: true });
    expect(progress('dragon-full', base({ xpByDragon: { blaze: 5000 } }))).toEqual({ current: 3, goal: 3, done: true });
  });

  it('takes the best dragon, not the sum of all of them', () => {
    expect(progress('dragon-full', base({ xpByDragon: { frost: 300, blaze: 300 } })).current).toBe(2);
  });

  it('survives a save with none of the fields', () => {
    expect(progress('blocks-1', {}).current).toBe(0);
    expect(progress('decor-1', {}).done).toBe(false);
    expect(progress('dragon-grow', {}).done).toBe(false);
  });
});

describe('satisfiedQuests', () => {
  it('is empty for a state with nothing yet', () => {
    expect(satisfiedQuests(quests, base(), world)).toEqual([]);
  });

  it('lists every quest the state satisfies, paid or not', () => {
    const state = base({ lifetimeBlocks: 10, lairUnlocked: true, questsPaid: ['blocks-1'] });
    expect(satisfiedQuests(quests, state, world).map((q) => q.id))
      .toEqual(['blocks-1', 'blocks-10', 'lair-open']);
  });
});

describe('payQuests', () => {
  it('pays nothing for a state with nothing yet', () => {
    const state = base({ coins: 7 });
    const next = payQuests(state, quests, world);
    expect(next).toEqual(state);
    expect(next.questsPaid).toEqual([]);
  });

  it('adds the reward and records the id', () => {
    const next = payQuests(base({ coins: 7, lifetimeBlocks: 1 }), quests, world);
    expect(next.coins).toBe(12);
    expect(next.questsPaid).toEqual(['blocks-1']);
  });

  it('pays once, ever: a second run on the result moves no coins and adds no ids', () => {
    const once = payQuests(base({ coins: 7, lifetimeBlocks: 1 }), quests, world);
    const twice = payQuests(once, quests, world);
    expect(twice.coins).toBe(once.coins);
    expect(twice.questsPaid).toEqual(once.questsPaid);
    expect(payQuests(twice, quests, world).coins).toBe(12);
  });

  it('never pays an id that is already in the list, even though it is satisfied', () => {
    const state = base({ coins: 100, lifetimeBlocks: 1, questsPaid: ['blocks-1'] });
    expect(payQuests(state, quests, world).coins).toBe(100);
  });

  it('pays only the quest that is not yet paid, not the ones already settled', () => {
    const state = base({ coins: 0, lifetimeBlocks: 10, questsPaid: ['blocks-1'] });
    const next = payQuests(state, quests, world);
    expect(next.coins).toBe(15);
    expect(next.questsPaid).toEqual(['blocks-1', 'blocks-10']);
  });

  it('keeps the coins spent: a paid quest is not paid again after the purse is emptied', () => {
    const paid = payQuests(base({ lifetimeBlocks: 1 }), quests, world);
    const spent = { ...paid, coins: 0 };
    expect(payQuests(spent, quests, world).coins).toBe(0);
  });

  it('pays the first four block quests at once from 128 lifetime blocks, and only once', () => {
    const once = payQuests(base({ lifetimeBlocks: 128 }), quests, world);
    expect(once.coins).toBe(5 + 15 + 40 + 75);
    expect(once.questsPaid).toEqual(['blocks-1', 'blocks-10', 'blocks-50', 'blocks-100']);
    const again = payQuests(once, quests, world);
    expect(again.coins).toBe(135);
    expect(again.questsPaid).toEqual(once.questsPaid);
  });

  it('pays the full-room quest, and the first decoration with it, when the fourth slot fills', () => {
    const next = payQuests(base(room(fullRoom)), quests, world);
    expect(next.questsPaid).toEqual(['decor-1', 'room-full']);
    expect(next.coins).toBe(50);
  });

  it('leaves every other field of the state alone and does not mutate the input', () => {
    const state = base({ coins: 1, lifetimeBlocks: 1, dragonId: 'frost', history: { a: 1 } });
    const frozen = JSON.parse(JSON.stringify(state));
    const next = payQuests(state, quests, world);
    expect(state).toEqual(frozen);
    expect(next).toEqual({ ...state, coins: 6, questsPaid: ['blocks-1'] });
  });

  it('copes with a save that has no questsPaid at all', () => {
    const next = payQuests({ coins: 0, lifetimeBlocks: 1 }, quests, world);
    expect(next.questsPaid).toEqual(['blocks-1']);
    expect(payQuests(next, quests, world).coins).toBe(5);
  });
});
