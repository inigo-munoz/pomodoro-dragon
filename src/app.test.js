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
