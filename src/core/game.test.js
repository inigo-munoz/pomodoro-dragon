import { describe, it, expect } from 'vitest';
import { grantWorkReward, buyFood, leveledUp } from './game.js';
import { config } from '../data/config.js';
import { getDragon } from '../data/dragons.js';

const base = { version: 1, dragonId: 'ember', coins: 0, xp: 0, muted: false,
  settings: { workMinutes: 15, breakMinutes: 5 } };
const ember = getDragon('ember');

describe('game rules', () => {
  it('grants coins on work completion', () => {
    const s = grantWorkReward(base, config);
    expect(s.coins).toBe(config.coinsPerWork);
  });

  it('buying food spends coins and adds xp', () => {
    const rich = { ...base, coins: 100 };
    const food = { id: 'meat', price: 25, xp: 60 };
    const s = buyFood(rich, food);
    expect(s.coins).toBe(75);
    expect(s.xp).toBe(60);
  });

  it('buying food you cannot afford throws and does not mutate', () => {
    const poor = { ...base, coins: 5 };
    const food = { id: 'cake', price: 50, xp: 150 };
    expect(() => buyFood(poor, food)).toThrow();
    expect(poor.coins).toBe(5);
  });

  it('detects a level up across a threshold', () => {
    expect(leveledUp(ember, 90, 110)).toBe(true);   // crossed 100
    expect(leveledUp(ember, 110, 150)).toBe(false);  // same level
  });
});
