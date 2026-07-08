import { describe, it, expect } from 'vitest';
import { addXp, currentLevel, levelProgress } from './dragon.js';
import { getDragon } from '../data/dragons.js';

const frost = getDragon('frost'); // thresholds: 0, 100, 300, 600

describe('dragon', () => {
  it('adds xp', () => {
    expect(addXp(0, 20)).toBe(20);
  });

  it('derives the level at exact thresholds (not before, not after)', () => {
    expect(currentLevel(frost, 0).level).toBe(1);
    expect(currentLevel(frost, 99).level).toBe(1);
    expect(currentLevel(frost, 100).level).toBe(2);
    expect(currentLevel(frost, 299).level).toBe(2);
    expect(currentLevel(frost, 300).level).toBe(3);
    expect(currentLevel(frost, 599).level).toBe(3);
    expect(currentLevel(frost, 600).level).toBe(4);
    expect(currentLevel(frost, 9999).level).toBe(4);
  });

  it('computes progress toward the next level', () => {
    const p = levelProgress(frost, 150); // level 2 (100..300)
    expect(p.current).toBe(50);
    expect(p.needed).toBe(200);
    expect(p.ratio).toBeCloseTo(0.25);
    expect(p.isMax).toBe(false);
  });

  it('reports max level progress as full', () => {
    const p = levelProgress(frost, 700); // past the level-4 threshold (600)
    expect(p.isMax).toBe(true);
    expect(p.ratio).toBe(1);
  });
});
