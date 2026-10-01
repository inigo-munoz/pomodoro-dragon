import { describe, it, expect, afterEach } from 'vitest';
import { resolveTheme, applyPalette } from './theme.js';
import { themes } from '../data/themes.js';

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

describe('resolveTheme furniture and room', () => {
  // The real dragon themes carry no lair art yet, so a fixture keeps these
  // assertions independent of which art has landed.
  const fixture = { furniture: { bed: 'x.webp' }, room: 'r.webp' };

  afterEach(() => { delete themes.fixture; });

  it('exposes a theme furniture override keyed by item id', () => {
    themes.fixture = fixture;
    expect(resolveTheme('fixture').furniture.bed).toBe('x.webp');
  });

  it('leaves a furniture key the theme omits to the fallbacks without throwing', () => {
    themes.fixture = fixture;
    expect(resolveTheme('fixture').furniture.chest).toBeUndefined();
    expect(resolveTheme('fixture').furniture).not.toBe(themes.default.furniture);
  });

  it('takes the room from the theme, and the default room otherwise', () => {
    themes.fixture = fixture;
    expect(resolveTheme('fixture').room).toBe('r.webp');
    expect(resolveTheme('does-not-exist').room).toBe(themes.default.room);
    expect(resolveTheme('does-not-exist').room.length).toBeGreaterThan(0);
  });

  it('resolves a room string for a real dragon theme', () => {
    expect(typeof resolveTheme('frost').room).toBe('string');
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
