import { describe, it, expect } from 'vitest';
import { resolveTheme, applyPalette } from './theme.js';

describe('resolveTheme', () => {
  it('returns the default theme for an unknown or missing id', () => {
    expect(resolveTheme('nope').icons.coin).toBe('🪙');
    expect(resolveTheme(undefined).palette.bg).toBe('#1b1030');
  });

  it('overrides only what a theme defines and falls back for the rest', () => {
    const frost = resolveTheme('frost');
    expect(frost.icons.coin).toBe('/art/icons/coin.webp'); // overridden
    expect(frost.palette.bg).toBe('#0e1630');              // overridden
    expect(frost.palette.fg).toBe('#ffffff');              // falls back to default
  });

  it('exposes food overrides keyed by food id', () => {
    expect(resolveTheme('frost').foods.apple).toBe('/art/foods/apple.webp');
    expect(resolveTheme('default').foods.apple).toBeUndefined();
  });

  it('resolves the blaze fire theme (palette + icon/food overrides)', () => {
    const blaze = resolveTheme('blaze');
    expect(blaze.palette.bg).toBe('#1f0a08');       // fire bg
    expect(blaze.palette.fg).toBe('#ffffff');        // falls back to default
    expect(blaze.icons.coin).toBe('/art/icons/blaze-coin.webp');
    expect(blaze.foods.apple).toBe('/art/foods/blaze-apple.webp');
  });
});

describe('applyPalette', () => {
  it('sets each palette entry as a CSS custom property on the root', () => {
    const root = document.createElement('div');
    applyPalette({ bg: '#123456', 'accent-fg': '#abcdef' }, root);
    expect(root.style.getPropertyValue('--bg')).toBe('#123456');
    expect(root.style.getPropertyValue('--accent-fg')).toBe('#abcdef');
  });
});
