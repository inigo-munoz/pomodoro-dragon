import { describe, it, expect } from 'vitest';
import { themedIcon } from './themedIcon.js';
import { assetUrl } from './art.js';

describe('themedIcon', () => {
  it('renders the default emoji when no theme is given', () => {
    const el = themedIcon(undefined, 'coin');
    expect(el.classList.contains('art-emoji')).toBe(true);
    expect(el.textContent).toBe('🪙');
  });

  it('renders an image when the theme provides an icon path', () => {
    const theme = { icons: { coin: '/art/icons/coin.webp' } };
    const el = themedIcon(theme, 'coin');
    expect(el.tagName).toBe('IMG');
    expect(el.getAttribute('src')).toBe(assetUrl('/art/icons/coin.webp'));
  });
});
