import { describe, it, expect } from 'vitest';
import { addCoins, canAfford, spend } from './wallet.js';

describe('wallet', () => {
  it('adds coins', () => {
    expect(addCoins(0, 10)).toBe(10);
    expect(addCoins(10, 5)).toBe(15);
  });

  it('reports affordability', () => {
    expect(canAfford(10, 10)).toBe(true);
    expect(canAfford(9, 10)).toBe(false);
  });

  it('spends coins when affordable', () => {
    expect(spend(50, 25)).toBe(25);
  });

  it('throws instead of allowing a negative balance', () => {
    expect(() => spend(5, 10)).toThrow();
  });
});
