import { describe, it, expect, vi } from 'vitest';
import { renderLairShelf } from './lairShelf.js';
import { furniture, slots } from '../data/furniture.js';

const theme = { furniture: {}, icons: {} };

// banner (30) is placed on the wall, painting (45) is owned but not placed, trophy (70)
// is not owned. The purse decides whether trophy is affordable.
const stateWith = (coins, lair = { owned: ['banner', 'painting'], slots: { wall: 'banner' } }) => ({
  dragonId: 'frost', coins, lairs: { frost: lair },
});

const build = (over = {}) => {
  const onBuy = vi.fn();
  const onPlace = vi.fn();
  const el = renderLairShelf({
    state: stateWith(100), furniture, theme, onBuy, onPlace, ...over,
  });
  return { el, onBuy, onPlace };
};
const cell = (el, id) => el.querySelector(`[data-shelf-item="${id}"]`);

describe('lair shelf', () => {
  it('renders twelve cells in four rows, in slot order', () => {
    const { el } = build();
    const rows = [...el.querySelectorAll('[data-shelf-slot]')];
    expect(rows.map((r) => r.dataset.shelfSlot)).toEqual(slots);
    for (const row of rows) expect(row.querySelectorAll('[data-shelf-item]')).toHaveLength(3);
    expect(el.querySelectorAll('[data-shelf-item]')).toHaveLength(12);
  });

  it('labels each row with the spoken slot name, so the two floors differ', () => {
    const { el } = build();
    const labels = [...el.querySelectorAll('[data-shelf-slot] .shelf-label')].map((l) => l.textContent);
    expect(labels).toEqual(['wall', 'left floor', 'right floor', 'corner']);
  });

  it('marks the item in its slot as placed and fires nothing when tapped', () => {
    const { el, onBuy, onPlace } = build();
    const c = cell(el, 'banner');
    expect(c.dataset.state).toBe('placed');
    expect(c.getAttribute('aria-label')).toMatch(/in the room/i);
    c.click();
    expect(onBuy).not.toHaveBeenCalled();
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('marks an owned, unplaced item as owned: no price, tapping places it', () => {
    const { el, onBuy, onPlace } = build();
    const c = cell(el, 'painting');
    expect(c.dataset.state).toBe('owned');
    expect(c.querySelector('.food-price')).toBeNull();
    expect(c.disabled).toBe(false);
    c.click();
    expect(onPlace.mock.calls).toEqual([[furniture.find((i) => i.id === 'painting')]]);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('marks an affordable unowned item with its price: tapping buys it', () => {
    const { el, onBuy, onPlace } = build({ state: stateWith(70) });
    const c = cell(el, 'trophy');
    expect(c.dataset.state).toBe('affordable');
    expect(c.querySelector('.food-price').textContent).toContain('70');
    expect(c.querySelector('.price-coin')).not.toBeNull();
    expect(c.getAttribute('aria-label')).toMatch(/buy.*70/i);
    expect(c.disabled).toBe(false);
    c.click();
    expect(onBuy.mock.calls).toEqual([[furniture.find((i) => i.id === 'trophy')]]);
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('marks an unaffordable item as locked: price shown, disabled, fires nothing', () => {
    const { el, onBuy, onPlace } = build({ state: stateWith(69) });
    const c = cell(el, 'trophy');
    expect(c.dataset.state).toBe('locked');
    expect(c.disabled).toBe(true);
    expect(c.classList.contains('dimmed')).toBe(true);
    expect(c.querySelector('.food-price').textContent).toContain('70');
    c.click();
    expect(onBuy).not.toHaveBeenCalled();
    expect(onPlace).not.toHaveBeenCalled();
  });

  it('shows a price on unowned items only', () => {
    const { el } = build({ state: stateWith(0) });
    for (const item of furniture) {
      const owned = ['banner', 'painting'].includes(item.id);
      expect(!!cell(el, item.id).querySelector('.food-price')).toBe(!owned);
    }
  });

  it('treats a dragon with no lair as owning nothing', () => {
    const { el } = build({ state: { dragonId: 'frost', coins: 30, lairs: {} } });
    expect(cell(el, 'banner').dataset.state).toBe('affordable');
    expect(cell(el, 'painting').dataset.state).toBe('locked');
  });

  it('draws themed art, falling back to the emoji, and offers no drag', () => {
    const { el } = build({ theme: { furniture: { banner: 'art/lair/frost-banner.webp' }, icons: {} } });
    expect(cell(el, 'banner').querySelector('img.art-img').getAttribute('src'))
      .toContain('frost-banner.webp');
    expect(cell(el, 'painting').textContent).toContain('🖼️');
    expect(el.querySelectorAll('[draggable]')).toHaveLength(0);
  });
});
