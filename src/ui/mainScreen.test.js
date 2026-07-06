import { describe, it, expect, vi } from 'vitest';
import { renderMainScreen } from './mainScreen.js';
import { getDragon } from '../data/dragons.js';

const dragon = getDragon('ember');
const base = {
  state: { coins: 30, xp: 150 },
  dragon,
  onStart: vi.fn(), onPause: vi.fn(), onBreak: vi.fn(),
  onShop: vi.fn(), onSettings: vi.fn(), onToggleMute: vi.fn(),
};

describe('main screen', () => {
  it('shows coins and the current-level dragon image', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 900, running: false },
    });
    expect(el.querySelector('.coin-counter').textContent).toContain('30');
    // xp 150 → level 2 → image 🐉
    expect(el.querySelector('.dragon-art').textContent).toContain('🐉');
  });

  it('formats the remaining time as mm:ss', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 65, running: true },
    });
    expect(el.querySelector('.timer-display').textContent).toBe('01:05');
  });

  it('shows the Break button only when a work block just completed', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 0, running: false },
    });
    const breakBtn = el.querySelector('[data-action="break"]');
    expect(breakBtn).not.toBeNull();
    breakBtn.click();
    expect(base.onBreak).toHaveBeenCalled();
  });

  it('shows Pause while running and calls onPause', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 800, running: true },
    });
    const pause = el.querySelector('[data-action="pause"]');
    expect(pause).not.toBeNull();
    pause.click();
    expect(base.onPause).toHaveBeenCalled();
  });
});
