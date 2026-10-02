import { describe, it, expect } from 'vitest';
import { screenTitle } from './screenTitle.js';

describe('screenTitle', () => {
  it('is an h1.screen-title carrying the given text as written', () => {
    const el = screenTitle('Shop');
    expect(el.tagName).toBe('H1');
    expect(el.className).toBe('screen-title');
    expect(el.textContent).toBe('Shop');
  });
});
