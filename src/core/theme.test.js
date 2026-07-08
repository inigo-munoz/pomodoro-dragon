import { describe, it, expect } from 'vitest';
import { resolveTheme } from './theme.js';

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
});
