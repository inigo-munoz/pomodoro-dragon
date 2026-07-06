import { describe, it, expect } from 'vitest';
import { dragons, getDragon } from './dragons.js';

describe('dragons data', () => {
  it('has at least one dragon with 3 ascending levels', () => {
    const d = dragons[0];
    expect(d.levels).toHaveLength(3);
    expect(d.levels[0].xpNeeded).toBe(0);
    expect(d.levels[1].xpNeeded).toBeGreaterThan(d.levels[0].xpNeeded);
    expect(d.levels[2].xpNeeded).toBeGreaterThan(d.levels[1].xpNeeded);
  });

  it('getDragon returns a dragon by id and null when missing', () => {
    expect(getDragon('ember').id).toBe('ember');
    expect(getDragon('nope')).toBeNull();
  });
});
