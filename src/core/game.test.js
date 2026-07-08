import { describe, it, expect } from 'vitest';
import { grantWorkReward, buyFood, leveledUp, dragonXp, addDragonXp } from './game.js';
import { config } from '../data/config.js';
import { getDragon } from '../data/dragons.js';

const base = { version: 2, dragonId: 'frost', coins: 0, xpByDragon: {}, muted: false,
  settings: { workMinutes: 15, breakMinutes: 5 } };
const frost = getDragon('frost');

describe('game rules', () => {
  it('grants coins on work completion', () => {
    const s = grantWorkReward(base, config);
    expect(s.coins).toBe(config.coinsPerWork);
  });

  it('dragonXp reads the active dragon and defaults to 0', () => {
    expect(dragonXp(base)).toBe(0);
    expect(dragonXp({ ...base, xpByDragon: { frost: 42 } })).toBe(42);
  });

  it('addDragonXp adds only to the active dragon and leaves others intact', () => {
    const s = addDragonXp({ ...base, xpByDragon: { blaze: 10 } }, 60);
    expect(s.xpByDragon.frost).toBe(60);
    expect(s.xpByDragon.blaze).toBe(10);
  });

  it('buying food spends coins and adds xp to the active dragon', () => {
    const rich = { ...base, coins: 100 };
    const food = { id: 'meat', price: 25, xp: 60 };
    const s = buyFood(rich, food);
    expect(s.coins).toBe(75);
    expect(dragonXp(s)).toBe(60);
  });

  it('buying food you cannot afford throws and does not mutate', () => {
    const poor = { ...base, coins: 5 };
    const food = { id: 'cake', price: 50, xp: 150 };
    expect(() => buyFood(poor, food)).toThrow();
    expect(poor.coins).toBe(5);
  });

  it('detects a level up across a threshold', () => {
    expect(leveledUp(frost, 90, 110)).toBe(true);   // crossed 100
    expect(leveledUp(frost, 110, 150)).toBe(false);  // same level
  });
});
