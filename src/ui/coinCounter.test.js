import { describe, it, expect } from 'vitest';
import { coinCounter } from './coinCounter.js';

describe('coin counter', () => {
  it('is a .coin-counter showing the number of coins', () => {
    const el = coinCounter(42);
    expect(el.classList.contains('coin-counter')).toBe(true);
    expect(el.textContent).toContain('42');
  });

  it('shows zero rather than nothing', () => {
    expect(coinCounter(0).textContent).toContain('0');
  });

  it('puts the themed coin art inside its .coin-icon', () => {
    const theme = { icons: { coin: '/art/icons/coin.webp' } };
    const img = coinCounter(5, theme).querySelector('.coin-icon img.art-img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('art/icons/coin.webp');
  });
});
