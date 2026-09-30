import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from './app.js';
import { config } from './data/config.js';

// One full interval tick is 1000ms. Blocks are seeded to 1 minute (60s), so
// advancing 61s guarantees we cross the completion boundary regardless of
// off-by-one interval alignment.
const ONE_BLOCK_MS = 61_000;

let root;

const click = (action) => {
  const btn = root.querySelector(`[data-action="${action}"]`);
  if (!btn) throw new Error(`no button for data-action="${action}"`);
  btn.click();
};

const pickDragon = (id) => {
  const btn = root.querySelector(`[data-dragon="${id}"]`);
  if (!btn) throw new Error(`no dragon choice for data-dragon="${id}"`);
  btn.click();
};

const coins = () =>
  Number(root.querySelector('.coin-counter').textContent.replace(/\D/g, ''));

const modeLabel = () => root.querySelector('.mode-label').textContent.trim();

const timerText = () => root.querySelector('.timer-display').textContent.trim();

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
  // Seed a saved state BEFORE createApp so work/break blocks are the smallest
  // possible (1 minute) and the fake clock stays cheap. store.load() merges this
  // over defaultState, so a partial object is enough.
  window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({ settings: { workMinutes: 1, breakMinutes: 1 } }),
  );
  root = document.createElement('div');
  document.body.appendChild(root);
});

afterEach(() => {
  vi.useRealTimers();
  root.remove();
  root = null;
});

describe('createApp full timer loop', () => {
  it('resumes the work loop after a break completes (regression)', () => {
    createApp(root);

    // 1. Pick the dragon → advances from the choose screen to the main screen.
    pickDragon('frost');
    expect(coins()).toBe(0);
    expect(modeLabel()).toBe('Work');

    // 2 + 3. Work block: start, run it out, collect the reward.
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(coins()).toBe(config.coinsPerMinute);
    // Completed work parks at 0:00 and offers the Break button.
    expect(root.querySelector('[data-action="break"]')).not.toBeNull();

    // 4. Break block: after it finishes the app must return to a fresh idle
    //    WORK block (▶ Start shown, mode back to Work) — NOT frozen in break.
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(root.querySelector('[data-action="start"]')).not.toBeNull();
    expect(modeLabel()).toBe('Work');

    // 5. The exact regression: start a SECOND work block and prove it still
    //    earns coins. With the bug the timer is stuck at 0:00 in break mode and
    //    coins never move again.
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(coins()).toBe(config.coinsPerMinute * 2);
  });

  it('does not yank the shop back to main while the timer keeps ticking (regression)', () => {
    createApp(root);
    pickDragon('frost');

    click('start');
    click('shop');
    expect(root.querySelector('.shop')).not.toBeNull();

    vi.advanceTimersByTime(1000);

    // The per-second driver must keep ticking in the background but must NOT
    // force the screen back to main while the child is shopping.
    expect(root.querySelector('.shop')).not.toBeNull();
    expect(root.querySelector('[data-food]')).not.toBeNull();
    expect(root.querySelector('.main')).toBeNull();
  });

  it('preserves a paused break when settings change (regression)', () => {
    createApp(root);
    pickDragon('frost');

    // Drive a work block to completion, then move into break.
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    expect(modeLabel()).toBe('Break');

    // Pause mid-break, then tweak settings.
    click('pause');
    click('settings');
    const workPlus = root.querySelector('[data-step="work-plus"]');
    expect(workPlus).not.toBeNull();
    workPlus.click();

    root.querySelector('.back-btn').click();

    // The break must NOT have been reset to a fresh work block.
    expect(modeLabel()).toBe('Break');
  });

  it('shortening the work time applies even to a part-used block (regression)', () => {
    // A few seconds of accidental progress used to lock the new duration out: the guard
    // that protects a session in progress kept a countdown longer than the length it
    // now belonged to, so setting 1 minute left 14:48 on the clock.
    window.localStorage.setItem(
      'pomodoro-dragon-save-v1',
      JSON.stringify({ settings: { workMinutes: 15, breakMinutes: 5 } }),
    );
    createApp(root);
    pickDragon('frost');

    // Consume a few seconds of the block, then stop.
    click('start');
    vi.advanceTimersByTime(12_000);
    click('pause');
    expect(timerText()).not.toBe('15:00');

    // Drop the work length well below what is left on the clock.
    click('settings');
    // The settings screen re-renders on every change, so the button must be looked up
    // again each time — a held reference is detached after the first click.
    for (let i = 0; i < 14; i += 1) {
      root.querySelector('[data-step="work-minus"]').click();
    }
    root.querySelector('.back-btn').click();

    // The clock must never show more than the length it belongs to.
    const [mm, ss] = timerText().split(':').map(Number);
    expect(mm * 60 + ss).toBeLessThanOrEqual(60);
  });
});

describe('createApp timer persistence', () => {
  const seed = (timer) => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({
      dragonId: 'frost', coins: 0, settings: { workMinutes: 1, breakMinutes: 1 }, timer,
    }),
  );

  // Simulates closing the tab: stops the old app's interval and mounts a fresh root.
  // clearAllTimers resets the fake clock, so the current time is restored afterwards.
  const reopen = () => {
    const at = Date.now();
    vi.clearAllTimers();
    vi.setSystemTime(at);
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    createApp(root);
  };

  const display = () => root.querySelector('.timer-display').textContent.trim();

  it('resumes a session abandoned mid-run with the right remaining time', () => {
    createApp(root);
    pickDragon('frost');
    click('start');
    vi.advanceTimersByTime(20_000);

    reopen();

    expect(display()).toBe('00:40');
    expect(root.querySelector('[data-action="pause"]')).not.toBeNull();
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(coins()).toBe(config.coinsPerMinute);
  });

  it('grants a work block that ended while closed exactly once', () => {
    seed({ mode: 'work', running: true, remaining: 30, endsAt: Date.now() - 5_000 });

    createApp(root);
    expect(coins()).toBe(config.coinsPerMinute);
    expect(root.querySelector('[data-action="break"]')).not.toBeNull();

    reopen();
    expect(coins()).toBe(config.coinsPerMinute);
    expect(root.querySelector('[data-action="break"]')).not.toBeNull();
  });

  it('restores an elapsed break as an idle work block', () => {
    seed({ mode: 'break', running: true, remaining: 30, endsAt: Date.now() - 5_000 });

    createApp(root);

    expect(modeLabel()).toBe('Work');
    expect(root.querySelector('[data-action="start"]')).not.toBeNull();
    expect(display()).toBe('01:00');
    expect(coins()).toBe(0);
  });

  it('restores a paused session still paused with its remaining time', () => {
    seed({ mode: 'work', running: false, remaining: 42, endsAt: null });

    createApp(root);
    vi.advanceTimersByTime(10_000);

    expect(display()).toBe('00:42');
    expect(root.querySelector('[data-action="start"]')).not.toBeNull();
    expect(coins()).toBe(0);
  });
});

describe('createApp session feedback', () => {
  const reward = () => root.querySelector('.session-reward');

  it('shows the coins earned when a work block completes, then clears it on the next start', () => {
    createApp(root);
    pickDragon('frost');
    expect(reward()).toBeNull();

    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(coins()).toBeGreaterThan(0);
    expect(reward().textContent).toContain(`+${coins()}`);

    click('break');
    expect(reward()).toBeNull();
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('start');
    expect(reward()).toBeNull();
  });

  it('labels a paused break as Resume break', () => {
    createApp(root);
    pickDragon('frost');
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    click('pause');
    expect(root.querySelector('[data-action="start"]').textContent).toContain('Resume break');
  });
});

describe('createApp destroy', () => {
  it('stops the clock so later time changes nothing', () => {
    const app = createApp(root);
    pickDragon('frost');
    click('start');
    app.destroy();

    vi.advanceTimersByTime(ONE_BLOCK_MS * 2);
    expect(coins()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is safe to call twice', () => {
    const app = createApp(root);
    app.destroy();
    expect(() => app.destroy()).not.toThrow();
  });
});

describe('createApp audio unlock', () => {
  let resume;

  beforeEach(() => {
    resume = vi.fn(() => Promise.resolve());
    window.AudioContext = vi.fn(() => ({ state: 'suspended', resume }));
  });

  afterEach(() => {
    delete window.AudioContext;
  });

  it('unlocks audio on the first Start press', () => {
    createApp(root);
    pickDragon('frost');
    expect(resume).not.toHaveBeenCalled();
    click('start');
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('unlocks audio when the mute button is pressed', () => {
    createApp(root);
    pickDragon('frost');
    click('mute');
    expect(resume).toHaveBeenCalledTimes(1);
  });
});

describe('createApp music wiring', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('resolves music paths against the deploy base (regression)', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-dragon/');
    const audioFactory = vi.fn(() => ({
      setMuted: () => {}, unlock: () => {}, playMusic: () => {},
      stopMusic: () => {}, playEffect: () => {}, toggleMute: () => false,
    }));
    createApp(root, { audioFactory });
    const { music } = audioFactory.mock.calls[0][0];
    expect(music).toEqual(config.music.map((path) => `/pomodoro-dragon${path}`));
  });
});
