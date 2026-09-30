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
  describe('layout order', () => {
    const order = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const render = (mode, lastReward = 0) => renderMainScreen({
      ...base, lastReward, timerState: { mode, remaining: 0, running: false },
    });

    it.each(['work', 'break'])('puts the timer before the dragon stage in %s mode', (mode) => {
      const el = render(mode);
      expect(order(el.querySelector('.timer-display'), el.querySelector('.dragon-stage'))).toBe(true);
    });

    it('puts the session reward before the dragon stage', () => {
      const el = render('work', 25);
      expect(order(el.querySelector('.timer-display'), el.querySelector('.session-reward'))).toBe(true);
      expect(order(el.querySelector('.session-reward'), el.querySelector('.dragon-stage'))).toBe(true);
    });

    it('keeps the XP bar right after the dragon stage', () => {
      const el = render('work');
      expect(el.querySelector('.dragon-stage').nextElementSibling).toBe(el.querySelector('.xp-bar'));
    });
  });

  describe('dragon stage art', () => {
    const theme = { icons: { break: '/art/icons/break.webp' }, foods: {} };
    const stage = (mode) => renderMainScreen({
      ...base, theme, timerState: { mode, remaining: 100, running: false },
    }).querySelector('.dragon-stage');

    it('shows the break art instead of the dragon during a break', () => {
      const img = stage('break').querySelector('img.dragon-art.alive');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe('/art/icons/break.webp');
      expect(img.getAttribute('alt')).toBe(`${dragon.name} is resting`);
      expect(stage('break').innerHTML).not.toContain('frost-baby.webp');
    });

    it('shows the current level art, not the break art, while working', () => {
      const el = stage('work');
      expect(el.querySelector('img.dragon-art').getAttribute('src')).toContain('frost-baby.webp');
      expect(el.innerHTML).not.toContain('break.webp');
    });
  });
});
