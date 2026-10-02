import { describe, it, expect, vi } from 'vitest';
import { renderSlotPicker } from './slotPicker.js';
import { furniture } from '../data/furniture.js';

const state = (over = {}) => ({ dragonId: 'frost', coins: 100, lairs: {}, ...over });

const render = (over = {}) => {
  const onChoose = vi.fn();
  const onBack = vi.fn();
  const el = renderSlotPicker({
    state: state(), slot: 'floorRight', furniture, theme: { furniture: {} },
    onChoose, onBack, ...over,
  });
  return { el, onChoose, onBack };
};

const item = (id) => furniture.find((i) => i.id === id);

describe('slot picker', () => {
  it('lists only the items of the tapped slot, each with its price', () => {
    const { el } = render();
    const ids = [...el.querySelectorAll('[data-item]')].map((c) => c.dataset.item);
    expect(ids).toEqual(['lamp', 'chest', 'shelf']);
    for (const card of el.querySelectorAll('[data-item]')) {
      expect(card.textContent).toMatch(/\d+/);
    }
    expect(el.querySelector('[data-item="banner"]')).toBeNull();
    expect(el.querySelector('[data-item="imp"]')).toBeNull();
  });

  it('never shows another dragon\'s furniture as owned', () => {
    const { el } = render({
      state: state({ coins: 0, lairs: { blaze: { owned: ['chest'], slots: {} } } }),
    });
    const chest = el.querySelector('[data-item="chest"]');
    expect(chest.textContent).not.toContain('Owned');
    expect(chest.textContent).toContain('35');
  });

  it('dims and disables an unaffordable unowned item and keeps the coins', () => {
    const s = state({ coins: 20 });
    const { el, onChoose } = render({ state: s });
    const shelf = el.querySelector('[data-item="shelf"]');
    expect(shelf.classList.contains('dimmed')).toBe(true);
    expect(shelf.disabled).toBe(true);
    shelf.click();
    expect(onChoose).not.toHaveBeenCalled();
    expect(s.coins).toBe(20);
  });

  it('treats an item priced exactly at coins as affordable', () => {
    const { el, onChoose } = render({ state: state({ coins: 35 }) });
    const chest = el.querySelector('[data-item="chest"]');
    expect(chest.classList.contains('dimmed')).toBe(false);
    chest.click();
    expect(onChoose).toHaveBeenCalledWith(item('chest'));
  });

  it('offers an owned item free at zero coins, labelled Owned, with no price', () => {
    const { el, onChoose } = render({
      state: state({ coins: 0, lairs: { frost: { owned: ['shelf'], slots: {} } } }),
    });
    const shelf = el.querySelector('[data-item="shelf"]');
    expect(shelf.classList.contains('dimmed')).toBe(false);
    expect(shelf.disabled).toBe(false);
    expect(shelf.textContent).toContain('Owned');
    expect(shelf.querySelector('.food-price')).toBeNull();
    shelf.click();
    expect(onChoose).toHaveBeenCalledWith(item('shelf'));
  });

  it('shows the price of an item owned by frost when blaze is active', () => {
    const { el } = render({
      state: state({ dragonId: 'blaze',
        lairs: { frost: { owned: ['chest'], slots: {} } } }),
    });
    const chest = el.querySelector('[data-item="chest"]');
    expect(chest.textContent).toContain('35');
    expect(chest.textContent).not.toContain('Owned');
  });

  it('renders themed art when present and the emoji fallback when not', () => {
    const { el } = render({
      theme: { furniture: { lamp: 'art/lair/frost-lamp.webp' } },
    });
    expect(el.querySelector('[data-item="lamp"] img.art-img').getAttribute('src'))
      .toContain('frost-lamp.webp');
    const chest = el.querySelector('[data-item="chest"]');
    expect(chest.textContent).toContain('🧰');
    expect(chest.querySelector('img')).toBeNull();
  });

  it('closes through the back control without choosing anything', () => {
    const { el, onChoose, onBack } = render();
    el.querySelector('.back-btn').click();
    expect(onBack).toHaveBeenCalledOnce();
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('shows no error state or punitive copy for a blocked tap', () => {
    const { el } = render({ state: state({ coins: 0 }) });
    el.querySelector('[data-item="shelf"]').click();
    expect(el.querySelector('.error')).toBeNull();
    expect(el.textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning|error/i);
  });

  it('offers no drag affordance', () => {
    const { el } = render();
    expect(el.querySelectorAll('[draggable]')).toHaveLength(0);
  });

  it('names the slot being filled, in plain words', () => {
    const titleOf = (slot) => render({ slot }).el.querySelector('.screen-title').textContent;
    expect(titleOf('wall')).toBe('Wall');
    expect(titleOf('floorLeft')).toBe('Floor');
    expect(titleOf('floorRight')).toBe('Floor');
    expect(titleOf('corner')).toBe('Corner');
  });
});
