import { describe, it, expect } from 'vitest';
import { dragons, getDragon } from './dragons.js';

describe('dragons data', () => {
  it('has at least one dragon with 4 ascending levels (egg → baby → young → adult)', () => {
    const d = dragons[0];
    expect(d.levels).toHaveLength(4);
    expect(d.levels[0].xpNeeded).toBe(0);
    expect(d.levels[1].xpNeeded).toBeGreaterThan(d.levels[0].xpNeeded);
    expect(d.levels[2].xpNeeded).toBeGreaterThan(d.levels[1].xpNeeded);
    expect(d.levels[3].xpNeeded).toBeGreaterThan(d.levels[2].xpNeeded);
  });

  it('getDragon returns a dragon by id and null when missing', () => {
    expect(getDragon('frost').id).toBe('frost');
    expect(getDragon('nope')).toBeNull();
  });

  it('every dragon level has an emoji fallback', () => {
    for (const d of dragons) {
      for (const lvl of d.levels) {
        expect(typeof lvl.fallback).toBe('string');
        expect(lvl.fallback.length).toBeGreaterThan(0);
      }
    }
  });
});
