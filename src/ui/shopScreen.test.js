import { describe, it, expect, vi } from 'vitest';
import { renderShopScreen } from './shopScreen.js';

const foods = [
  { id: 'apple', name: 'Apple', price: 10, xp: 20, icon: '🍎' },
  { id: 'cake',  name: 'Cake',  price: 50, xp: 150, icon: '🎂' },
];

describe('shop screen', () => {
  it('dims foods the player cannot afford and blocks their purchase', () => {
    const onBuy = vi.fn();
    const el = renderShopScreen({
      state: { coins: 10 }, foods, onBuy, onBack: () => {},
    });
    const cards = el.querySelectorAll('.food-card');
    expect(cards).toHaveLength(2);

    const cake = el.querySelector('[data-food="cake"]');
    expect(cake.classList.contains('dimmed')).toBe(true);
    cake.click();
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('buys an affordable food on click', () => {
    const onBuy = vi.fn();
    const el = renderShopScreen({
      state: { coins: 10 }, foods, onBuy, onBack: () => {},
    });
    el.querySelector('[data-food="apple"]').click();
    expect(onBuy).toHaveBeenCalledWith(foods[0]);
  });
});
