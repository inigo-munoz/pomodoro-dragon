import { describe, it, expect } from 'vitest';
import { slots } from '../data/furniture.js';
import { slotTitle, slotName } from './slotNames.js';

describe('slot names', () => {
  it('titles a slot by the place it is, not by its id', () => {
    expect(slotTitle('wall')).toBe('Wall');
    expect(slotTitle('floorLeft')).toBe('Floor');
    expect(slotTitle('floorRight')).toBe('Floor');
    expect(slotTitle('corner')).toBe('Corner');
  });

  it('speaks the two floor slots apart, because a title cannot', () => {
    expect(slotName('floorLeft')).toBe('left floor');
    expect(slotName('floorRight')).toBe('right floor');
    expect(slotName('wall')).toBe('wall');
    expect(slotName('corner')).toBe('corner');
  });

  it('names every slot the lair actually has', () => {
    for (const slot of slots) {
      expect(slotTitle(slot)).toBeTruthy();
      expect(slotName(slot)).toBeTruthy();
      expect(slotName(slot)).not.toContain('floorLeft');
      expect(slotName(slot)).not.toContain('floorRight');
    }
  });

  it('falls back to the id rather than rendering nothing', () => {
    expect(slotTitle('ceiling')).toBe('ceiling');
    expect(slotName('ceiling')).toBe('ceiling');
  });
});
