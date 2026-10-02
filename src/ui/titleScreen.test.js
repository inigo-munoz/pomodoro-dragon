import { describe, it, expect, vi } from 'vitest';
import { renderTitleScreen } from './titleScreen.js';

const render = (over = {}) =>
  renderTitleScreen({ onStart: vi.fn(), onInstructions: vi.fn(), ...over });

describe('title screen', () => {
  it('is the title screen and carries the name of the app as its hero', () => {
    const el = render();
    expect(el.className).toBe('screen title');
    const name = el.querySelector('.app-title');
    expect(name.textContent).toBe('Pomodoro Fantasy');
    // The app's own name, not a chapter watermark like the other screens.
    expect(el.querySelector('.screen-title')).toBeNull();
  });

  it('has a primary Start button that fires onStart', () => {
    const onStart = vi.fn();
    const start = render({ onStart }).querySelector('[data-action="start-app"]');
    expect(start.classList.contains('big-btn')).toBe(true);
    expect(start.classList.contains('primary')).toBe(true);
    start.click();
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('has an instructions link that fires onInstructions, not onStart', () => {
    const onStart = vi.fn();
    const onInstructions = vi.fn();
    const link = render({ onStart, onInstructions }).querySelector('[data-action="instructions"]');
    link.click();
    expect(onInstructions).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('renders with no dragon and no theme: it only needs its two callbacks', () => {
    expect(() => renderTitleScreen({ onStart: () => {}, onInstructions: () => {} })).not.toThrow();
  });

  it('uses no punitive copy', () => {
    expect(render().textContent).not.toMatch(/hungry|lost|missed|neglect|streak|warning/i);
  });
});
