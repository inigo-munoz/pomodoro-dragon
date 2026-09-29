import { describe, it, expect, vi } from 'vitest';
import { renderMainScreen } from './mainScreen.js';
import { getDragon } from '../data/dragons.js';

const dragon = getDragon('frost');
const base = {
  state: { coins: 30 },
  xp: 150,
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
    // xp 150 → level 2 → baby dragon image (egg=0, baby=100, young=300, adult=600)
    const img = el.querySelector('img.dragon-art.art-img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toContain('frost-baby.webp');
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

  it('renders themed UI icons from the theme', () => {
    const theme = { icons: { coin: '/art/icons/coin.webp', shop: '/art/icons/shop.webp',
      settings: '/art/icons/settings.webp', mute: '/art/icons/mute.webp', break: '☕' }, foods: {} };
    const el = renderMainScreen({
      ...base, theme, timerState: { mode: 'work', remaining: 900, running: false },
    });
    const shopIcon = el.querySelector('[data-action="shop"] img.art-img');
    expect(shopIcon).not.toBeNull();
    expect(shopIcon.getAttribute('src')).toBe('/art/icons/shop.webp');
  });

  describe('idle control label', () => {
    const label = (timerState) => {
      const el = renderMainScreen({ ...base, timerState: { workSeconds: 900, ...timerState } });
      return el.querySelector('.controls');
    };

    it('offers Resume break for a paused break', () => {
      const controls = label({ mode: 'break', remaining: 100, running: false });
      expect(controls.textContent).toContain('Resume break');
      expect(controls.textContent).not.toContain('Start studying');
      expect(controls.querySelector('[data-action="start"]')).not.toBeNull();
    });

    it('offers Keep studying for a paused, partly-spent work block', () => {
      const controls = label({ mode: 'work', remaining: 500, running: false });
      expect(controls.textContent).toContain('Keep studying');
      expect(controls.querySelector('[data-action="start"]')).not.toBeNull();
    });

    it('still offers Start studying for a fresh work block', () => {
      const controls = label({ mode: 'work', remaining: 900, running: false });
      expect(controls.textContent).toContain('Start studying');
      expect(controls.querySelector('[data-action="start"]')).not.toBeNull();
    });
  });

  describe('session reward', () => {
    const render = (lastReward) => renderMainScreen({
      ...base, lastReward, timerState: { mode: 'work', remaining: 0, running: false },
    });

    it('shows the amount earned when lastReward is positive', () => {
      const reward = render(25).querySelector('.session-reward');
      expect(reward).not.toBeNull();
      expect(reward.textContent).toContain('+25');
    });

    it.each([null, undefined, 0])('renders nothing for lastReward %s', (value) => {
      expect(render(value).querySelector('.session-reward')).toBeNull();
    });
  });
});
