import { describe, it, expect } from 'vitest';
import { art, isImagePath } from './art.js';

describe('art helper', () => {
  it('detects image paths vs emoji', () => {
    expect(isImagePath('/art/dragons/frost-baby.png')).toBe(true);
    expect(isImagePath('sprite.webp')).toBe(true);
    expect(isImagePath('🐉')).toBe(false);
  });

  it('renders an <img> with src and alt for an image path', () => {
    const el = art('/art/dragons/frost-baby.png', 'Frost', '🥚');
    expect(el.tagName).toBe('IMG');
    expect(el.getAttribute('src')).toBe('/art/dragons/frost-baby.png');
    expect(el.getAttribute('alt')).toBe('Frost');
    expect(el.classList.contains('art-img')).toBe(true);
  });

  it('renders an emoji span for a non-path value', () => {
    const el = art('🐉', 'dragon', '🥚');
    expect(el.tagName).toBe('SPAN');
    expect(el.classList.contains('art-emoji')).toBe(true);
    expect(el.textContent).toBe('🐉');
  });

  it('falls back to the emoji when the image fails to load', () => {
    const parent = document.createElement('div');
    const el = art('/art/missing.png', 'Frost', '🥚');
    parent.appendChild(el);
    el.dispatchEvent(new Event('error'));
    expect(parent.querySelector('img')).toBeNull();
    expect(parent.querySelector('.art-emoji').textContent).toBe('🥚');
  });

  it('fallback preserves caller-added classes and swaps art-img to art-emoji', () => {
    const parent = document.createElement('div');
    const el = art('/art/missing.png', 'Frost', '🥚');
    el.classList.add('dragon-art', 'alive');
    parent.appendChild(el);
    el.dispatchEvent(new Event('error'));
    const span = parent.querySelector('.art-emoji');
    expect(span).not.toBeNull();
    expect(span.classList.contains('dragon-art')).toBe(true);
    expect(span.classList.contains('alive')).toBe(true);
    expect(span.classList.contains('art-img')).toBe(false);
    expect(span.textContent).toBe('🥚');
  });
});
