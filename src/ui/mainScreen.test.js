import { describe, it, expect, vi } from 'vitest';
import { renderMainScreen } from './mainScreen.js';
import { assetUrl } from './art.js';
import { getDragon } from '../data/dragons.js';
import { resolveTheme } from '../core/theme.js';

const dragon = getDragon('frost');
const base = {
  state: { coins: 30 },
  lairPrice: 50,
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
    expect(shopIcon.getAttribute('src')).toBe(assetUrl('/art/icons/shop.webp'));
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

    it('keeps the player\'s own dragon on screen during a break, marked as resting', () => {
      // Swapping in the theme's sleeping-baby art made an egg look like it hatched when
      // the break began and reverted when it ended, and would show a baby to a player
      // who had raised an adult.
      const el = stage('break');
      const img = el.querySelector('img.dragon-art.alive.resting');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe(assetUrl('/art/dragons/frost-baby.webp'));
      expect(img.getAttribute('alt')).toBe(`${dragon.name} is resting`);
      expect(el.innerHTML).not.toContain('break.webp');
    });

    it('marks the stage as resting so the break can be shown without changing the art', () => {
      expect(stage('break').classList.contains('resting')).toBe(true);
      expect(stage('work').classList.contains('resting')).toBe(false);
    });

    it('shows the current level art, not the break art, while working', () => {
      const el = stage('work');
      expect(el.querySelector('img.dragon-art').getAttribute('src')).toContain('frost-baby.webp');
      expect(el.innerHTML).not.toContain('break.webp');
    });
  });
});

describe('mute button state', () => {
  const base = {
    state: { coins: 0, muted: false },
    lairPrice: 50,
    dragon: getDragon('frost'),
    xp: 0,
    timerState: { mode: 'work', remaining: 900, workSeconds: 900, running: false },
    lastReward: 0,
  };

  it('reads as not muted when sound is on', () => {
    const el = renderMainScreen({ ...base });
    const btn = el.querySelector('[data-action="mute"]');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Mute');
    expect(btn.classList.contains('is-muted')).toBe(false);
  });

  it('keeps the same speaker art in both states, because muted is a stroke over it', () => {
    const frost = { icons: { mute: '/art/icons/mute.webp', sound: '/art/icons/sound.webp' } };

    const on = renderMainScreen({ ...base, theme: frost });
    const off = renderMainScreen({ ...base, state: { coins: 0, muted: true }, theme: frost });

    // One symbol, not two: the separately drawn crossed-out art is never used for the
    // button any more, even for a theme that still ships it.
    expect(on.querySelector('[data-action="mute"] img').getAttribute('src'))
      .toBe(assetUrl('/art/icons/sound.webp'));
    expect(off.querySelector('[data-action="mute"] img').getAttribute('src'))
      .toBe(assetUrl('/art/icons/sound.webp'));

    // The muted state rides on the class, which is what .icon-btn.is-muted::after strokes.
    expect(off.querySelector('[data-action="mute"]').classList.contains('is-muted')).toBe(true);
  });

  it('falls back to the default emoji for a theme with no sound art, never the wrong symbol', () => {
    // A theme that only has the crossed-out speaker must not use it to mean "sound on".
    const partial = { icons: { mute: '/art/icons/blaze-mute.webp' } };
    const el = renderMainScreen({ ...base, theme: partial });
    const btn = el.querySelector('[data-action="mute"]');
    expect(btn.querySelector('img')).toBeNull();
    expect(btn.textContent).toContain('🔊');
  });

  it('reads as muted when sound is off, so the button shows its own state', () => {
    const el = renderMainScreen({ ...base, state: { coins: 0, muted: true } });
    const btn = el.querySelector('[data-action="mute"]');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Unmute');
    expect(btn.classList.contains('is-muted')).toBe(true);
  });
});

describe('lair navigation', () => {
  it('offers exactly one lair button in the nav bar, with an icon, that calls onLair', () => {
    const onLair = vi.fn();
    const el = renderMainScreen({
      ...base, onLair, timerState: { mode: 'work', remaining: 900, running: false },
    });
    const buttons = el.querySelectorAll('.nav-bar [data-action="lair"]');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent.trim()).not.toBe('');
    buttons[0].click();
    expect(onLair).toHaveBeenCalledTimes(1);

    // The existing destinations are untouched; the record sits after the lair.
    const actions = [...el.querySelectorAll('.nav-bar [data-action]')].map((b) => b.dataset.action);
    expect(actions).toEqual(['shop', 'lair', 'record', 'settings']);
  });

  describe('lock state', () => {
    const timerState = { mode: 'work', remaining: 900, running: false };

    it('shows a locked button with the price, and still calls onLair', () => {
      const onLair = vi.fn();
      const el = renderMainScreen({ ...base, onLair, timerState });
      const buttons = el.querySelectorAll('[data-action="lair"]');
      expect(buttons).toHaveLength(1);
      const btn = buttons[0];
      expect(btn.classList.contains('is-locked')).toBe(true);
      expect(btn.querySelector('.lock-price').textContent).toContain('50');
      expect(btn.getAttribute('aria-label')).toBe('Lair, locked, 50 coins');
      btn.click();
      expect(onLair).toHaveBeenCalledTimes(1);
      const actions = [...el.querySelectorAll('.nav-bar [data-action]')].map((b) => b.dataset.action);
      expect(actions).toEqual(['shop', 'lair', 'record', 'settings']);
    });

    it('shows no lock and no price once unlocked, and still calls onLair', () => {
      const onLair = vi.fn();
      const el = renderMainScreen({
        ...base, onLair, timerState, state: { ...base.state, lairUnlocked: true },
      });
      const buttons = el.querySelectorAll('[data-action="lair"]');
      expect(buttons).toHaveLength(1);
      const btn = buttons[0];
      expect(btn.classList.contains('is-locked')).toBe(false);
      expect(btn.querySelector('.lock-price')).toBeNull();
      expect(btn.textContent).not.toContain('50');
      expect(btn.getAttribute('aria-label')).toBe('Lair');
      btn.click();
      expect(onLair).toHaveBeenCalledTimes(1);
      const actions = [...el.querySelectorAll('.nav-bar [data-action]')].map((b) => b.dataset.action);
      expect(actions).toEqual(['shop', 'lair', 'record', 'settings']);
    });
  });
});

describe('record navigation', () => {
  it('offers exactly one record button in the nav bar, with an icon, that calls onRecord', () => {
    const onRecord = vi.fn();
    const el = renderMainScreen({
      ...base, onRecord, timerState: { mode: 'work', remaining: 900, running: false },
    });
    const buttons = el.querySelectorAll('.nav-bar [data-action="record"]');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent.trim()).not.toBe('');
    buttons[0].click();
    expect(onRecord).toHaveBeenCalledTimes(1);
  });
});

describe('long break and cycle progress', () => {
  const timer = (over) => ({
    mode: 'work', remaining: 100, running: false,
    sessionsBeforeLongBreak: 4, completedWork: 0, ...over,
  });
  const render = (over) => renderMainScreen({ ...base, timerState: timer(over) });
  const dots = (el) => [...el.querySelectorAll('.session-dot')];

  it('labels the three modes Work, Break and Long break', () => {
    const label = (mode) => render({ mode }).querySelector('.mode-label').textContent;
    expect(label('work')).toBe('Work');
    expect(label('break')).toBe('Break');
    expect(label('longBreak')).toBe('Long break');
  });

  it('keeps the resting dragon during a long break', () => {
    const el = render({ mode: 'longBreak', completedWork: 4 });
    expect(el.querySelector('.dragon-stage').classList.contains('resting')).toBe(true);
    const img = el.querySelector('img.dragon-art.alive.resting');
    expect(img).not.toBeNull();
    expect(img.getAttribute('alt')).toBe(`${dragon.name} is resting`);
  });

  it('offers Resume break for a paused long break', () => {
    const el = render({ mode: 'longBreak', completedWork: 4 });
    expect(el.querySelector('.controls').textContent).toContain('Resume break');
  });

  it('shows one dot per session, none filled at the start of a cycle', () => {
    const el = render({ completedWork: 0 });
    expect(dots(el)).toHaveLength(4);
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(0);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 1 of 4');
  });

  it('fills the dots for the work blocks finished in this cycle', () => {
    const el = render({ completedWork: 6 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(2);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 3 of 4');
  });

  it('fills every dot when the long break is due or running', () => {
    expect(render({ mode: 'longBreak', completedWork: 8 })
      .querySelectorAll('.session-dot.is-done')).toHaveLength(4);
  });

  it('starts a new cycle after the long break: an idle work block shows no filled dots', () => {
    const el = render({ mode: 'work', completedWork: 4 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(0);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 1 of 4');
  });

  it('starts a new cycle after the long break: a running work block shows no filled dots', () => {
    const el = render({ mode: 'work', completedWork: 8, running: true, remaining: 50 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(0);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 1 of 4');
  });

  it('renders no dots when the cycle length is unknown or not positive', () => {
    expect(render({ sessionsBeforeLongBreak: 0 }).querySelector('.session-dots')).toBeNull();
    expect(render({ sessionsBeforeLongBreak: undefined }).querySelector('.session-dots')).toBeNull();
  });
});

describe('a finished work block counts the moment the bell rings', () => {
  const timer = (over) => ({
    mode: 'work', remaining: 100, running: false,
    sessionsBeforeLongBreak: 4, completedWork: 0, ...over,
  });
  const render = (over) => renderMainScreen({ ...base, timerState: timer(over) });
  const parked = (over) => render({ remaining: 0, running: false, ...over });

  it('fills the dot while the block waits at zero, before Break is tapped', () => {
    const el = parked({ completedWork: 0 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(1);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 2 of 4');
  });

  it('fills every dot when the last block of the cycle waits at zero', () => {
    const el = parked({ completedWork: 3 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(4);
    expect(el.querySelector('.session-dots').getAttribute('aria-label')).toBe('Session 4 of 4');
  });

  it('does not count a running work block that merely shows zero seconds left', () => {
    const el = render({ completedWork: 1, remaining: 0, running: true });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(1);
  });

  it('does not count a break parked at zero', () => {
    const el = parked({ mode: 'break', completedWork: 1 });
    expect(el.querySelectorAll('.session-dot.is-done')).toHaveLength(1);
  });

  it('has no screen title: the top bar and the dragon already say where you are', () => {
    const el = renderMainScreen({
      ...base, timerState: { mode: 'work', remaining: 900, running: false },
    });
    expect(el.querySelector('.screen-title')).toBeNull();
  });
});

describe('main screen nav bar names', () => {
  const timerState = { mode: 'work', remaining: 900, running: false };

  // An icon-only button is announced as "button" unless it carries a name; art or emoji alike.
  it.each([
    ['themed art', resolveTheme(dragon.themeId)],
    ['the emoji fallback', undefined],
  ])('gives every nav button a non-empty accessible name with %s', (_label, theme) => {
    const el = renderMainScreen({ ...base, theme, timerState });
    const buttons = [...el.querySelectorAll('.nav-bar [data-action]')];
    expect(buttons.map((b) => b.dataset.action)).toEqual(['shop', 'lair', 'record', 'settings']);
    for (const b of buttons) {
      expect((b.getAttribute('aria-label') ?? '').trim()).not.toBe('');
    }
    expect(el.querySelector('[data-action="shop"]').getAttribute('aria-label')).toBe('Shop');
    expect(el.querySelector('[data-action="settings"]').getAttribute('aria-label')).toBe('Settings');
  });
});
