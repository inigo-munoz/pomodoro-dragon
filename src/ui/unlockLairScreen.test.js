import { describe, it, expect, vi } from 'vitest';
import { renderUnlockLair } from './unlockLairScreen.js';

const ctx = (over = {}) => ({
  state: Object.freeze({ coins: 80 }),
  price: 50,
  theme: { room: '🕳️' },
  onConfirm: vi.fn(),
  onBack: vi.fn(),
  ...over,
});

const confirmOf = (el) => el.querySelector('[data-action="unlock-confirm"]');

describe('unlock offer screen', () => {
  it('renders the offer structure with the price on the confirm button', () => {
    const el = renderUnlockLair(ctx());
    expect(el.matches('section.screen.unlock')).toBe(true);
    expect(el.querySelector('button.back-btn')).not.toBeNull();
    const card = el.querySelector('.unlock-card');
    for (const sel of ['.unlock-title', '.unlock-art', '.unlock-blurb']) {
      expect(card.querySelector(sel)).not.toBeNull();
    }
    expect(card.querySelector('button.big-btn.primary[data-action="unlock-confirm"]')).not.toBeNull();
    expect(confirmOf(el).textContent).toContain('50');
  });

  it('dims and disables the confirm one coin short, and a click spends nothing', () => {
    const onConfirm = vi.fn();
    const el = renderUnlockLair(ctx({ state: { coins: 49 }, onConfirm }));
    const btn = confirmOf(el);
    expect(btn.classList.contains('dimmed')).toBe(true);
    expect(btn.disabled).toBe(true);
    btn.click();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('keeps the confirm live on exact change and calls onConfirm once', () => {
    const onConfirm = vi.fn();
    const el = renderUnlockLair(ctx({ state: { coins: 50 }, onConfirm }));
    const btn = confirmOf(el);
    expect(btn.classList.contains('dimmed')).toBe(false);
    expect(btn.disabled).toBe(false);
    btn.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onBack from the back button and never onConfirm', () => {
    const onBack = vi.fn();
    const onConfirm = vi.fn();
    const el = renderUnlockLair(ctx({ onBack, onConfirm }));
    el.querySelector('.back-btn').click();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('costs nothing to look: rendering calls no callback and leaves a frozen state alone', () => {
    const onConfirm = vi.fn();
    const onBack = vi.fn();
    const state = Object.freeze({ coins: 80 });
    expect(() => renderUnlockLair(ctx({ state, onConfirm, onBack }))).not.toThrow();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(state).toEqual({ coins: 80 });
  });

  it('puts the coin directly in the button, never inside a .price-coin wrapper', () => {
    // .price-coin .art-img is declared after .big-btn .art-img at equal specificity and
    // would blow the coin up to 1.8em inside a button sized for 1.2em.
    const el = renderUnlockLair(ctx());
    expect(confirmOf(el).querySelector('.price-coin')).toBeNull();
    expect(confirmOf(el).closest('.price-coin')).toBeNull();
    expect(confirmOf(el).querySelector('.art-emoji, .art-img')).not.toBeNull();
  });

  it('previews the room through art(), and renders without error when the theme has none', () => {
    const withRoom = renderUnlockLair(ctx({ theme: { room: 'art/lair/frost-room.webp' } }));
    expect(withRoom.querySelector('.unlock-art img.art-img').getAttribute('src'))
      .toContain('frost-room.webp');
    expect(() => renderUnlockLair(ctx({ theme: {} }))).not.toThrow();
    expect(() => renderUnlockLair(ctx({ theme: undefined }))).not.toThrow();
  });

  it('shows no punitive copy at 0, 49 or 50 coins, and the same text whatever the purse', () => {
    const texts = [0, 49, 50].map((coins) =>
      renderUnlockLair(ctx({ state: { coins } })).textContent);
    for (const text of texts) expect(text).not.toMatch(/cannot|not enough|sorry|lost|fail/i);
    // A line that only appears when the child is short would read as a nudge about it.
    expect(new Set(texts).size).toBe(1);
  });

  it('has nothing draggable', () => {
    const el = renderUnlockLair(ctx());
    expect(el.querySelector('[draggable]')).toBeNull();
  });
});
