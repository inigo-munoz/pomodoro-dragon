import { describe, it, expect, afterEach, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { resolveTheme, applyPalette, applyBackdrop } from './theme.js';
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

describe('resolveTheme backdrop', () => {
  const ids = ['frost', 'blaze', 'thorn', 'tempest'];

  it.each(ids)('gives %s its own backdrop path', (id) => {
    expect(resolveTheme(id).backdrop).toBe(`/art/backdrops/${id}.webp`);
  });

  it('has no backdrop for the default theme or an unknown id', () => {
    expect(resolveTheme('default').backdrop).toBeNull();
    expect(resolveTheme('nope').backdrop).toBeNull();
  });

  it.each(ids)('has the %s file on disk under public/', (id) => {
    expect(existsSync(`public/art/backdrops/${id}.webp`)).toBe(true);
  });
});

describe('applyBackdrop', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('sets --backdrop to a url() routed through assetUrl', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-fantasy/');
    const root = document.createElement('div');
    applyBackdrop('/art/backdrops/frost.webp', root);
    expect(root.style.getPropertyValue('--backdrop'))
      .toBe('url("/pomodoro-fantasy/art/backdrops/frost.webp")');
  });

  it('removes --backdrop when the next theme has none, leaving no stale image', () => {
    const root = document.createElement('div');
    applyBackdrop('/art/backdrops/frost.webp', root);
    expect(root.style.getPropertyValue('--backdrop')).not.toBe('');
    applyBackdrop(null, root);
    expect(root.style.getPropertyValue('--backdrop')).toBe('');
  });
});

describe('the record icon', () => {
  // The nav button shipped with an emoji fallback while the art was being made. Every real
  // theme must now resolve its own, or one dragon silently keeps the placeholder.
  it.each(['frost', 'blaze', 'thorn', 'tempest'])('gives %s its own record icon', (id) => {
    expect(resolveTheme(id).icons.record).toMatch(/^\/art\/icons\/[a-z-]*record\.webp$/);
  });

  it('keeps an emoji on the default theme, which the chooser screen uses', () => {
    expect(resolveTheme('nope').icons.record).toBe('📖');
  });

  it('never gives two themes the same record icon', () => {
    const used = ['frost', 'blaze', 'thorn', 'tempest'].map((id) => resolveTheme(id).icons.record);
    expect(new Set(used).size).toBe(4);
  });
});
