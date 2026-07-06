import { describe, it, expect } from 'vitest';
import { addXp, currentLevel, levelProgress } from './dragon.js';
import { getDragon } from '../data/dragons.js';

const ember = getDragon('ember'); // thresholds: 0, 100, 300

describe('dragon', () => {
  it('adds xp', () => {
    expect(addXp(0, 20)).toBe(20);
  });

  it('derives the level at exact thresholds (not before, not after)', () => {
    expect(currentLevel(ember, 0).level).toBe(1);
    expect(currentLevel(ember, 99).level).toBe(1);
    expect(currentLevel(ember, 100).level).toBe(2);
    expect(currentLevel(ember, 299).level).toBe(2);
    expect(currentLevel(ember, 300).level).toBe(3);
    expect(currentLevel(ember, 9999).level).toBe(3);
  });

  it('computes progress toward the next level', () => {
    const p = levelProgress(ember, 150); // level 2 (100..300)
    expect(p.current).toBe(50);
    expect(p.needed).toBe(200);
    expect(p.ratio).toBeCloseTo(0.25);
    expect(p.isMax).toBe(false);
  });

  it('reports max level progress as full', () => {
    const p = levelProgress(ember, 400);
    expect(p.isMax).toBe(true);
    expect(p.ratio).toBe(1);
  });
});
