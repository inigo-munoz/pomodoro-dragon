import { describe, it, expect } from 'vitest';
import { slots } from '../data/furniture.js';
import { slotName } from './slotNames.js';

describe('slot names', () => {
  it('speaks the two floor slots apart, because a title cannot', () => {
    expect(slotName('floorLeft')).toBe('left floor');
    expect(slotName('floorRight')).toBe('right floor');
    expect(slotName('wall')).toBe('wall');
    expect(slotName('center')).toBe('center');
  });

  it('names every slot the lair actually has', () => {
    for (const slot of slots) {
      expect(slotName(slot)).toBeTruthy();
      expect(slotName(slot)).not.toContain('floorLeft');
      expect(slotName(slot)).not.toContain('floorRight');
    }
  });

  it('falls back to the id rather than rendering nothing', () => {
    expect(slotName('ceiling')).toBe('ceiling');
  });
});
