import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp } from './app.js';
import { config } from './data/config.js';
import { assetUrl } from './ui/art.js';

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

  const fakeAudio = () => ({
    setMuted: () => {}, unlock: () => {}, playMusic: () => {}, setPlaylist: vi.fn(),
    stopMusic: () => {}, playEffect: () => {}, toggleMute: () => false,
  });
  const withAudio = () => {
    // A dragon is needed to get past the choose screen to one that has a settings button.
    const saved = JSON.parse(window.localStorage.getItem(config.storageKey));
    window.localStorage.setItem(config.storageKey, JSON.stringify({ ...saved, dragonId: 'frost' }));
    const audio = fakeAudio();
    const audioFactory = vi.fn(() => audio);
    createApp(root, { audioFactory });
    return { audio, audioFactory };
  };
  const chooseStyle = (style) => {
    click('settings');
    root.querySelector(`[data-music-preset="${style}"]`).click();
  };
  const savedStyle = () => JSON.parse(window.localStorage.getItem(config.storageKey)).settings.musicStyle;

  it('resolves music paths against the deploy base (regression)', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-dragon/');
    const { audioFactory } = withAudio();
    const { music } = audioFactory.mock.calls[0][0];
    expect(music).toEqual(config.music.cozy.map((path) => `/pomodoro-dragon${path}`));
  });

  it('every path in every playlist resolves through assetUrl', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-dragon/');
    for (const style of config.musicStyles) {
      for (const path of config.music[style]) {
        expect(assetUrl(path)).toBe(`/pomodoro-dragon${path}`);
      }
    }
  });

  it('starts on the saved style', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({
      settings: { workMinutes: 1, breakMinutes: 1, musicStyle: 'lofi' },
    }));
    const { audioFactory } = withAudio();
    expect(audioFactory.mock.calls[0][0].music).toEqual(config.music.lofi.map(assetUrl));
  });

  it('falls back to the default style when the saved one is unknown', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({
      settings: { workMinutes: 1, breakMinutes: 1, musicStyle: 'jazz' },
    }));
    const { audioFactory } = withAudio();
    expect(audioFactory.mock.calls[0][0].music).toEqual(config.music.cozy.map(assetUrl));
  });

  it('choosing a style swaps the playlist through assetUrl', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-dragon/');
    const { audio } = withAudio();
    chooseStyle('lofi');
    expect(audio.setPlaylist).toHaveBeenCalledWith(
      config.music.lofi.map((path) => `/pomodoro-dragon${path}`),
    );
  });

  it('choosing a style persists it and it survives a reload', () => {
    withAudio();
    chooseStyle('lofi');
    expect(savedStyle()).toBe('lofi');
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    const { audioFactory } = withAudio();
    expect(audioFactory.mock.calls[0][0].music).toEqual(config.music.lofi.map(assetUrl));
    click('settings');
    expect(root.querySelector('[data-music-preset="lofi"]').classList.contains('active')).toBe(true);
  });

  it('changing the durations does not touch the playlist', () => {
    const { audio } = withAudio();
    click('settings');
    root.querySelector('[data-work-preset="25"]').click();
    expect(audio.setPlaylist).not.toHaveBeenCalled();
  });
});

describe('createApp per-second tick', () => {
  const dragonImg = () => root.querySelector('.dragon-stage img');

  it('keeps the dragon node alive so its CSS animation is not restarted (regression)', () => {
    createApp(root);
    pickDragon('frost');
    click('start');

    const before = dragonImg();
    expect(before).not.toBeNull();
    vi.advanceTimersByTime(1000);

    // A recreated <img> restarts float/breathe at 0%, which reads as a jump every second.
    expect(dragonImg()).toBe(before);
  });

  it('still updates the clock on a tick that does not complete the block', () => {
    createApp(root);
    pickDragon('frost');
    click('start');
    const before = timerText();

    vi.advanceTimersByTime(1000);

    expect(timerText()).not.toBe(before);
    expect(timerText()).toBe('00:59');
  });

  it('fully re-renders on the tick that completes the block', () => {
    createApp(root);
    pickDragon('frost');
    click('start');

    vi.advanceTimersByTime(ONE_BLOCK_MS);

    expect(root.querySelector('[data-action="break"]')).not.toBeNull();
    expect(root.querySelector('[data-action="pause"]')).toBeNull();
    expect(root.querySelector('.session-reward')).not.toBeNull();
  });
});

describe('createApp lair', () => {
  // A bed costs 40 and a one-minute block earns 1 coin, so a seeded purse is the only
  // practical way to reach a purchase without simulating forty blocks.
  const seedSave = (extra = {}) => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({
      // Unlocked by default: the lair tests below are about the room, not the gate. A test
      // for the locked path overrides it, and `...extra` stays last so it can.
      dragonId: 'frost', coins: 100, lairUnlocked: true,
      settings: { workMinutes: 1, breakMinutes: 1 }, ...extra,
    }),
  );
  const saved = () => JSON.parse(window.localStorage.getItem(config.storageKey));
  const slot = (name) => root.querySelector(`[data-slot="${name}"]`);
  const choose = (id) => root.querySelector(`[data-item="${id}"]`).click();
  const openLair = () => click('lair');

  it('opens the lair for the active dragon from the nav bar and returns with state unchanged', () => {
    seedSave();
    createApp(root);
    openLair();
    expect(root.querySelector('.screen.lair')).not.toBeNull();
    expect(root.querySelectorAll('[data-slot]')).toHaveLength(4);

    root.querySelector('.back-btn').click();
    expect(root.querySelector('.screen.main')).not.toBeNull();
    expect(coins()).toBe(100);
    // Nothing was saved at all, so no lair data was written.
    expect(saved().lairs).toBeUndefined();
  });

  it('opens the picker for an empty slot and for a filled slot', () => {
    seedSave({ lairs: { frost: { owned: ['bed'], slots: { floorLeft: 'bed' } } } });
    createApp(root);
    openLair();

    slot('wall').click();
    expect(root.querySelector('.screen.picker')).not.toBeNull();
    expect([...root.querySelectorAll('[data-item]')].map((c) => c.dataset.item))
      .toEqual(['banner', 'painting', 'trophy']);

    root.querySelector('.back-btn').click();
    expect(root.querySelector('.screen.lair')).not.toBeNull();

    slot('floorLeft').click();
    expect([...root.querySelectorAll('[data-item]')].map((c) => c.dataset.item))
      .toEqual(['bed', 'nest', 'cushion']);
  });

  it('buys an affordable item through the picker and returns to the lair with the slot filled', () => {
    seedSave();
    createApp(root);
    openLair();
    slot('floorLeft').click();
    choose('bed');

    expect(root.querySelector('.screen.lair')).not.toBeNull();
    expect(slot('floorLeft').classList.contains('is-empty')).toBe(false);
    expect(saved().coins).toBe(60);
    expect(saved().lairs.frost).toEqual({ owned: ['bed'], slots: { floorLeft: 'bed' } });
  });

  it('puts an owned item back on display for free without throwing or spending', () => {
    seedSave({
      coins: 5,
      lairs: { frost: { owned: ['banner', 'painting'], slots: { wall: 'painting' } } },
    });
    createApp(root);
    openLair();
    slot('wall').click();
    expect(() => choose('banner')).not.toThrow();

    expect(saved().coins).toBe(5);
    expect(saved().lairs.frost.owned).toEqual(['banner', 'painting']);
    expect(saved().lairs.frost.slots.wall).toBe('banner');
  });

  it('leaves an unaffordable item inert', () => {
    seedSave({ coins: 39 });
    createApp(root);
    openLair();
    slot('floorLeft').click();
    choose('bed');

    expect(root.querySelector('.screen.picker')).not.toBeNull();
    expect(saved().coins).toBe(39);
    // Nothing was saved at all, so no lair data was written.
    expect(saved().lairs).toBeUndefined();
  });

  it('keeps a purchase and a later placement across a reload', () => {
    seedSave();
    const first = createApp(root);
    openLair();
    slot('wall').click();
    choose('banner');
    slot('wall').click();
    choose('painting');
    slot('wall').click();
    choose('banner'); // free swap back
    first.destroy();

    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    createApp(root);
    openLair();

    expect(slot('wall').classList.contains('is-empty')).toBe(false);
    // by id, not by glyph: asserting the emoji would break the moment the theme gains art
    expect(slot('wall').dataset.item).toBe('banner');
    expect(saved().lairs.frost.owned).toEqual(['banner', 'painting']);
    expect(saved().coins).toBe(100 - 30 - 45);
  });

  it('leaves a sibling dragon\'s saved lair byte-identical after a purchase', () => {
    const blaze = { owned: ['trophy'], slots: { wall: 'trophy' } };
    seedSave({ lairs: { blaze } });
    createApp(root);
    openLair();
    slot('floorLeft').click();
    choose('bed');

    expect(JSON.stringify(saved().lairs.blaze)).toBe(JSON.stringify(blaze));
  });

  it('boots and opens an empty lair from an old save with no lairs field', () => {
    seedSave({ coins: 0 }); // still no lairs key, which is what this test is about
    createApp(root);
    openLair();
    expect(root.querySelectorAll('.lair-slot.is-empty')).toHaveLength(4);
  });

  it('keeps furniture out of the food shop', () => {
    seedSave();
    createApp(root);
    click('shop');
    const ids = [...root.querySelectorAll('[data-food]')].map((c) => c.dataset.food);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).not.toContain('bed');
    expect(root.querySelector('[data-item]')).toBeNull();
  });

  describe('unlock gate', () => {
    const lockedSave = (extra = {}) => seedSave({ lairUnlocked: false, coins: 80, ...extra });
    const confirm = () => click('unlock-confirm');

    it('shows the offer, not the lair, when the lair is locked', () => {
      lockedSave();
      createApp(root);
      openLair();
      expect(root.querySelector('.screen.unlock')).not.toBeNull();
      expect(root.querySelector('.screen.lair')).toBeNull();
    });

    it('spends 50, saves the flag and lands in the lair on confirm', () => {
      lockedSave();
      createApp(root);
      openLair();
      confirm();
      expect(root.querySelector('.screen.lair')).not.toBeNull();
      expect(saved().coins).toBe(30);
      expect(saved().lairUnlocked).toBe(true);
    });

    it('unlocks on exact change, leaving 0', () => {
      lockedSave({ coins: 50 });
      createApp(root);
      openLair();
      confirm();
      expect(saved().coins).toBe(0);
      expect(saved().lairUnlocked).toBe(true);
    });

    it('leaves the confirm inert one coin short', () => {
      lockedSave({ coins: 49 });
      createApp(root);
      openLair();
      confirm();
      expect(root.querySelector('.screen.unlock')).not.toBeNull();
      expect(saved().coins).toBe(49);
      expect(saved().lairUnlocked).not.toBe(true);
    });

    it('dismisses to the main screen with nothing changed, however often', () => {
      lockedSave();
      createApp(root);
      for (let i = 0; i < 10; i += 1) {
        openLair();
        root.querySelector('.back-btn').click();
        expect(root.querySelector('.screen.main')).not.toBeNull();
      }
      expect(coins()).toBe(80);
      expect(saved().lairUnlocked).not.toBe(true);
    });

    it('charges once when the same confirm button is clicked twice', () => {
      lockedSave({ coins: 100 });
      createApp(root);
      openLair();
      const btn = root.querySelector('[data-action="unlock-confirm"]');
      btn.click();
      btn.click();
      expect(saved().coins).toBe(50);
    });

    it('stays unlocked across a reload and a dragon switch, and never charges again', () => {
      lockedSave({ coins: 60 });
      const first = createApp(root);
      openLair();
      confirm();
      first.destroy();

      root.remove();
      root = document.createElement('div');
      document.body.appendChild(root);
      createApp(root);
      openLair();
      expect(root.querySelector('.screen.lair')).not.toBeNull();
      expect(root.querySelector('.screen.unlock')).toBeNull();

      for (let i = 0; i < 10; i += 1) {
        root.querySelector('.back-btn').click();
        openLair();
      }
      expect(saved().coins).toBe(10);

      // One payment is global: another dragon sees the same flag.
      root.querySelector('.back-btn').click();
      click('settings');
      click('change-dragon');
      pickDragon('blaze');
      openLair();
      expect(root.querySelector('.screen.lair')).not.toBeNull();
      expect(saved().coins).toBe(10);
    });

    it('offers the unlock to an old save that has neither lairs nor the flag', () => {
      seedSave({ coins: 0, lairUnlocked: false });
      expect(saved().lairs).toBeUndefined();
      createApp(root);
      openLair();
      expect(root.querySelector('.screen.unlock')).not.toBeNull();
    });

    it('shows a locked nav button on a fresh save, and an unlocked one after paying', () => {
      lockedSave({ coins: 50 });
      createApp(root);
      const before = root.querySelector('[data-action="lair"]');
      expect(before.classList.contains('is-locked')).toBe(true);
      expect(before.textContent).toContain('50');

      openLair();
      confirm();
      root.querySelector('.back-btn').click();
      const after = root.querySelector('[data-action="lair"]');
      expect(after.classList.contains('is-locked')).toBe(false);
      expect(after.textContent).not.toContain('50');
    });
  });
});
