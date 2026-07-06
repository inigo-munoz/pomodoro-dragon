import { describe, it, expect } from 'vitest';
import { art, isImagePath } from './art.js';

describe('art helper', () => {
  it('detects image paths vs emoji', () => {
    expect(isImagePath('/art/dragons/ember-baby.png')).toBe(true);
    expect(isImagePath('sprite.webp')).toBe(true);
    expect(isImagePath('🐉')).toBe(false);
  });

  it('renders an <img> with src and alt for an image path', () => {
    const el = art('/art/dragons/ember-baby.png', 'Ember', '🥚');
    expect(el.tagName).toBe('IMG');
    expect(el.getAttribute('src')).toBe('/art/dragons/ember-baby.png');
    expect(el.getAttribute('alt')).toBe('Ember');
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
    const el = art('/art/missing.png', 'Ember', '🥚');
    parent.appendChild(el);
    el.dispatchEvent(new Event('error'));
    expect(parent.querySelector('img')).toBeNull();
    expect(parent.querySelector('.art-emoji').textContent).toBe('🥚');
  });
});
