import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp as createRawApp } from './app.js';
import { config } from './data/config.js';
import { assetUrl } from './ui/art.js';
import { quests } from './data/quests.js';

// One full interval tick is 1000ms. Blocks are seeded to 1 minute (60s), so
// advancing 61s guarantees we cross the completion boundary regardless of
// off-by-one interval alignment.
const ONE_BLOCK_MS = 61_000;

// Quests pay coins, and most suites below assert exact coin counts for something else: a
// block's reward, a purchase, an unlock. Those saves start with every quest already paid, so
// the payout stays out of their arithmetic. The quests suite at the end seeds its own saves
// and is the one place that looks at the payout itself.
const allPaid = quests.map((q) => q.id);

let root;

const click = (action) => {
  const btn = root.querySelector(`[data-action="${action}"]`);
  if (!btn) throw new Error(`no button for data-action="${action}"`);
  btn.click();
};

// Every launch now lands on the title screen. The suites below are about what happens after
// it, so they open the app through the front door: createApp is the real one plus a press of
// Start. The front-door suite at the end uses createRawApp to look at the title screen itself.
const createApp = (target, options) => {
  const app = createRawApp(target, options);
  target.querySelector('[data-action="start-app"]')?.click();
  // Start lands on the eggs now, so a test that seeded a dragon has to tap it to carry on.
  // This only replays what the child does; it hides no behaviour from the assertions.
  const saved = JSON.parse(window.localStorage.getItem(config.storageKey) || 'null')?.dragonId;
  if (saved) target.querySelector(`[data-dragon="${saved}"]`)?.click();
  return app;
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
    JSON.stringify({ settings: { workMinutes: 1, breakMinutes: 1 }, questsPaid: allPaid }),
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
    click('save-settings');

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
    // The settings screen repaints its panel on every change, so the button must be looked
    // up again each time — a held reference is detached after the first click.
    for (let i = 0; i < 14; i += 1) {
      root.querySelector('[data-step="work-minus"]').click();
    }
    click('save-settings');
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
      questsPaid: allPaid,
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
  let app;

  beforeEach(() => {
    resume = vi.fn(() => Promise.resolve());
    window.AudioContext = vi.fn(() => ({ state: 'suspended', resume }));
  });

  afterEach(() => {
    // The app listens on `document`, which outlives this test; an app left running would
    // keep reacting to later visibilitychange events with this AudioContext stub.
    app.destroy();
    delete window.AudioContext;
  });

  it('unlocks audio on the first Start press', () => {
    app = createApp(root);
    pickDragon('frost');
    expect(resume).not.toHaveBeenCalled();
    click('start');
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('unlocks audio when the mute button is pressed', () => {
    app = createApp(root);
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
    click('save-settings');
  };
  const savedStyle = () => JSON.parse(window.localStorage.getItem(config.storageKey)).settings.musicStyle;

  it('resolves music paths against the deploy base (regression)', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-fantasy/');
    const { audioFactory } = withAudio();
    const { music } = audioFactory.mock.calls[0][0];
    expect(music).toEqual(config.music.cozy.map((path) => `/pomodoro-fantasy${path}`));
  });

  it('every path in every playlist resolves through assetUrl', () => {
    vi.stubEnv('BASE_URL', '/pomodoro-fantasy/');
    for (const style of config.musicStyles) {
      for (const path of config.music[style]) {
        expect(assetUrl(path)).toBe(`/pomodoro-fantasy${path}`);
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
    vi.stubEnv('BASE_URL', '/pomodoro-fantasy/');
    const { audio } = withAudio();
    chooseStyle('lofi');
    expect(audio.setPlaylist).toHaveBeenCalledWith(
      config.music.lofi.map((path) => `/pomodoro-fantasy${path}`),
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
    click('save-settings');
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
      dragonId: 'frost', coins: 100, lairUnlocked: true, questsPaid: allPaid,
      settings: { workMinutes: 1, breakMinutes: 1 }, ...extra,
    }),
  );
  const saved = () => JSON.parse(window.localStorage.getItem(config.storageKey));
  const slot = (name) => root.querySelector(`[data-slot="${name}"]`);
  const shelf = (id) => root.querySelector(`[data-shelf-item="${id}"]`);
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

  it('shows the shelf with all twelve pieces and no picker screen anywhere', () => {
    seedSave({ lairs: { frost: { owned: ['bed'], slots: { floorLeft: 'bed' } } } });
    createApp(root);
    openLair();
    expect(root.querySelectorAll('.lair-shelf [data-shelf-item]')).toHaveLength(12);
    expect(shelf('bed').dataset.state).toBe('placed');
    expect(root.querySelector('.screen.picker')).toBeNull();
  });

  it('does nothing when a slot in the room is tapped', () => {
    seedSave({ lairs: { frost: { owned: ['bed'], slots: { floorLeft: 'bed' } } } });
    createApp(root);
    openLair();
    slot('wall').click();
    slot('floorLeft').click();
    expect(root.querySelector('.screen.lair')).not.toBeNull();
    expect(saved().coins).toBe(100);
  });

  it('buys from the shelf: spends the price and the piece appears in its slot', () => {
    seedSave();
    createApp(root);
    openLair();
    expect(coins()).toBe(100);
    expect(slot('floorLeft').classList.contains('is-empty')).toBe(true);

    shelf('bed').click();

    expect(root.querySelector('.screen.lair')).not.toBeNull();
    expect(coins()).toBe(60); // the counter on the lair screen itself updated
    expect(slot('floorLeft').classList.contains('is-empty')).toBe(false);
    expect(slot('floorLeft').dataset.item).toBe('bed');
    expect(shelf('bed').dataset.state).toBe('placed');
    expect(saved().coins).toBe(60);
    expect(saved().lairs.frost).toEqual({ owned: ['bed'], slots: { floorLeft: 'bed' } });
  });

  it('places an owned piece from the shelf for free, without throwing or spending', () => {
    seedSave({
      coins: 5,
      lairs: { frost: { owned: ['banner', 'painting'], slots: { wall: 'painting' } } },
    });
    createApp(root);
    openLair();
    expect(shelf('banner').dataset.state).toBe('owned');
    expect(() => shelf('banner').click()).not.toThrow();

    expect(slot('wall').dataset.item).toBe('banner');
    expect(shelf('banner').dataset.state).toBe('placed');
    expect(shelf('painting').dataset.state).toBe('owned');
    expect(saved().coins).toBe(5);
    expect(saved().lairs.frost.owned).toEqual(['banner', 'painting']);
    expect(saved().lairs.frost.slots.wall).toBe('banner');
  });

  it('cannot buy a piece the purse does not cover', () => {
    seedSave({ coins: 39 });
    createApp(root);
    openLair();
    expect(shelf('bed').dataset.state).toBe('locked');
    expect(shelf('bed').disabled).toBe(true);
    shelf('bed').click();

    expect(coins()).toBe(39);
    expect(slot('floorLeft').classList.contains('is-empty')).toBe(true);
    expect(saved().coins).toBe(39);
    // Nothing was saved at all, so no lair data was written.
    expect(saved().lairs).toBeUndefined();
  });

  it('keeps a purchase and a later placement across a reload', () => {
    seedSave();
    const first = createApp(root);
    openLair();
    shelf('banner').click();
    shelf('painting').click();
    shelf('banner').click(); // free swap back
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
    shelf('bed').click();

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

describe('createApp long break cycle', () => {
  const seedCycle = (timer) => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({
      dragonId: 'frost', coins: 0, timer,
      settings: { workMinutes: 1, breakMinutes: 1, longBreakMinutes: 3, sessionsBeforeLongBreak: 4 },
    }),
  );

  const runWorkBlock = () => { click('start'); vi.advanceTimersByTime(ONE_BLOCK_MS); };

  it('gives three short breaks and then a long one that pays nothing', () => {
    seedCycle(null);
    createApp(root);

    for (let block = 1; block <= 3; block += 1) {
      runWorkBlock();
      click('break');
      expect(modeLabel()).toBe('Break');
      expect(timerText()).toBe('01:00');
      vi.advanceTimersByTime(ONE_BLOCK_MS); // finish the break
    }

    runWorkBlock();
    const coinsBefore = coins();
    click('break');
    expect(modeLabel()).toBe('Long break');
    expect(timerText()).toBe('03:00');

    vi.advanceTimersByTime(3 * 60_000 + 1000);
    expect(coins()).toBe(coinsBefore); // resting is never paid
    expect(modeLabel()).toBe('Work');
    expect(timerText()).toBe('01:00');
  });

  it('remembers the cycle across a reload', () => {
    seedCycle(null);
    createApp(root);
    runWorkBlock();
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    runWorkBlock();
    click('break'); // the second block is counted when it is left, so two are done mid-cycle

    const at = Date.now();
    vi.clearAllTimers();
    vi.setSystemTime(at);
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    createApp(root);

    expect(root.querySelectorAll('.session-dot.is-done')).toHaveLength(2);
    vi.advanceTimersByTime(ONE_BLOCK_MS); // finish the break
    runWorkBlock();
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    runWorkBlock(); // the fourth block overall, two of them before the reload
    click('break');
    expect(modeLabel()).toBe('Long break');
  });
});

describe('createApp settings: long break and sessions through the real UI', () => {
  const seed = () => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({
      dragonId: 'frost', coins: 0,
      settings: { workMinutes: 1, breakMinutes: 1, longBreakMinutes: 3, sessionsBeforeLongBreak: 4 },
    }),
  );
  const savedSettings = () => JSON.parse(window.localStorage.getItem(config.storageKey)).settings;
  const reload = () => {
    vi.clearAllTimers();
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    createApp(root);
  };
  const tap = (hook, times) => {
    for (let i = 0; i < times; i += 1) root.querySelector(`[data-step="${hook}"]`).click();
  };

  it('saved values reach the running timer and survive a reload', () => {
    seed();
    createApp(root);
    click('settings');
    tap('longBreak-plus', 2); // 3 -> 5 minutes
    tap('sessions-minus', 2); // 4 -> 2 sessions
    expect(savedSettings().longBreakMinutes).toBe(3); // nothing is stored before SAVE
    click('save-settings');
    expect(savedSettings()).toMatchObject({ longBreakMinutes: 5, sessionsBeforeLongBreak: 2 });
    root.querySelector('.back-btn').click();

    // Two blocks now earn the long break, and it lasts the new five minutes.
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    expect(modeLabel()).toBe('Break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    expect(modeLabel()).toBe('Long break');
    expect(timerText()).toBe('05:00');

    reload();
    expect(savedSettings()).toMatchObject({ longBreakMinutes: 5, sessionsBeforeLongBreak: 2 });
    click('settings');
    const shownValue = (hook) =>
      root.querySelector(`[data-step="${hook}-plus"]`).closest('.setting-row .stepper')
        .querySelector('.value').textContent;
    expect(shownValue('longBreak')).toBe('5 min');
    expect(shownValue('sessions')).toBe('2');
  });

  it('a parked long break picks up a shorter saved length', () => {
    seed();
    createApp(root);
    click('settings');
    tap('longBreak-minus', 2); // 3 -> 1 minute
    click('save-settings');
    root.querySelector('.back-btn').click();
    for (let block = 1; block <= 3; block += 1) {
      click('start');
      vi.advanceTimersByTime(ONE_BLOCK_MS);
      click('break');
      vi.advanceTimersByTime(ONE_BLOCK_MS);
    }
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    expect(modeLabel()).toBe('Long break');
    expect(timerText()).toBe('01:00');
  });

  it('a change made after saving stays out of the save file until SAVE is pressed again', () => {
    seed();
    createApp(root);
    click('settings');
    tap('sessions-minus', 3);
    click('save-settings');
    tap('longBreak-plus', 1);
    expect(savedSettings().longBreakMinutes).toBe(3);
  });

  it("Back with unsaved changes asks, and Don't save leaves the save file alone", () => {
    seed();
    createApp(root);
    click('settings');
    tap('sessions-plus', 1);
    root.querySelector('.back-btn').click();
    expect(root.querySelector('.confirm-overlay')).not.toBeNull();
    click('confirm-discard');
    expect(root.querySelector('.screen.settings')).toBeNull();
    expect(savedSettings().sessionsBeforeLongBreak).toBe(4);
  });
});

describe('createApp block reminders', () => {
  let visibility;
  const setVisibility = (value) => {
    visibility.mockReturnValue(value);
    document.dispatchEvent(new Event('visibilitychange'));
  };

  // Permission stays 'default' unless a test says otherwise, so a dismissed prompt is
  // what the app sees by default and a second request would show up as a second call.
  const fakeReminders = () => ({
    permission: 'default',
    request: vi.fn(async () => 'granted'),
    notify: vi.fn(),
    keepAwake: vi.fn(async () => {}),
    release: vi.fn(async () => {}),
  });

  // These tests are about reminders, not sound; the real audio would hit whatever
  // AudioContext stub an earlier test left behind.
  const silentAudio = () => ({
    setMuted: () => {}, unlock: () => {}, playMusic: () => {}, setPlaylist: () => {},
    stopMusic: () => {}, playEffect: () => {}, toggleMute: () => false,
  });

  const seedCycle = () => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({
      dragonId: 'frost', coins: 0,
      settings: { workMinutes: 1, breakMinutes: 1, longBreakMinutes: 3, sessionsBeforeLongBreak: 2 },
    }),
  );

  let reminders;
  let app;
  const launch = () => {
    seedCycle();
    reminders = fakeReminders();
    app = createApp(root, { audioFactory: silentAudio, remindersFactory: () => reminders });
  };

  beforeEach(() => {
    visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });
  afterEach(() => {
    app?.destroy();
    app = null;
    visibility.mockRestore();
  });

  it('asks for permission on the first Start and never again', () => {
    launch();
    click('start');
    click('pause');
    click('start');
    expect(reminders.request).toHaveBeenCalledTimes(1);
  });

  it('does not ask when the browser has already decided', () => {
    seedCycle();
    reminders = { ...fakeReminders(), permission: 'denied' };
    app = createApp(root, { audioFactory: silentAudio, remindersFactory: () => reminders });
    click('start');
    expect(reminders.request).not.toHaveBeenCalled();
  });

  it('holds the wake lock while running and lets go on pause', () => {
    launch();
    expect(reminders.keepAwake).not.toHaveBeenCalled();
    click('start');
    expect(reminders.keepAwake).toHaveBeenCalledTimes(1);
    click('pause');
    expect(reminders.release).toHaveBeenCalledTimes(1);
    click('start');
    expect(reminders.keepAwake).toHaveBeenCalledTimes(2);
  });

  it('holds the lock through a break and lets go when the block completes', () => {
    launch();
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(reminders.release).toHaveBeenCalledTimes(1); // work block done, parked at 0:00
    click('break');
    expect(reminders.keepAwake).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(reminders.release).toHaveBeenCalledTimes(2);
  });

  it('takes the lock again when the page becomes visible during a block', () => {
    launch();
    click('start');
    setVisibility('hidden');
    expect(reminders.keepAwake).toHaveBeenCalledTimes(1); // nothing to take while hidden
    setVisibility('visible');
    expect(reminders.keepAwake).toHaveBeenCalledTimes(2);
  });

  it('does not take the lock when the page becomes visible while idle', () => {
    launch();
    setVisibility('hidden');
    setVisibility('visible');
    click('start');
    click('pause');
    reminders.keepAwake.mockClear();
    setVisibility('hidden');
    setVisibility('visible');
    expect(reminders.keepAwake).not.toHaveBeenCalled();
  });

  it('notifies when a work block ends while the page is hidden', () => {
    launch();
    click('start');
    setVisibility('hidden');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(reminders.notify).toHaveBeenCalledTimes(1);
    const { title, body } = reminders.notify.mock.calls[0][0];
    expect(`${title} ${body}`).toMatch(/break/i);
  });

  it('words a finished break as a call back to work', () => {
    launch();
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('break');
    setVisibility('hidden');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    const { title, body } = reminders.notify.mock.calls[0][0];
    expect(`${title} ${body}`).toMatch(/break'?s? (is )?over|back/i);
  });

  it('says so when it was the long break that ended', () => {
    launch();
    for (let block = 1; block <= 2; block += 1) {
      click('start');
      vi.advanceTimersByTime(ONE_BLOCK_MS);
      click('break');
      if (block === 1) vi.advanceTimersByTime(ONE_BLOCK_MS);
    }
    expect(modeLabel()).toBe('Long break');
    setVisibility('hidden');
    vi.advanceTimersByTime(3 * 60_000 + 1000);
    const { title, body } = reminders.notify.mock.calls[0][0];
    expect(`${title} ${body}`).toMatch(/long break/i);
  });

  it('does not notify when a block ends in front of her', () => {
    launch();
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(reminders.notify).not.toHaveBeenCalled();
  });

  it('settles a block that ended while away the moment the page returns', () => {
    launch();
    click('start');
    setVisibility('hidden');
    // The interval never fired (a suspended tab), but the clock moved on.
    vi.setSystemTime(Date.now() + ONE_BLOCK_MS);
    expect(root.querySelector('[data-action="break"]')).toBeNull();
    setVisibility('visible');
    expect(root.querySelector('[data-action="break"]')).not.toBeNull();
    expect(reminders.release).toHaveBeenCalledTimes(1);
    expect(reminders.notify).not.toHaveBeenCalled(); // she is looking at it now
  });

  it('stops listening and lets go of the lock when the app is destroyed', () => {
    launch();
    click('start');
    app.destroy();
    reminders.keepAwake.mockClear();
    setVisibility('visible');
    expect(reminders.keepAwake).not.toHaveBeenCalled();
    expect(reminders.release).toHaveBeenCalled();
    app = null;
  });
});

describe('createApp study record', () => {
  const saved = () => JSON.parse(window.localStorage.getItem(config.storageKey));
  const reload = () => {
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    return createApp(root);
  };
  const finishWork = () => { click('start'); vi.advanceTimersByTime(ONE_BLOCK_MS); };

  beforeEach(() => {
    // Late evening on purpose: the one-minute block ends at 23:31 local, and it must
    // still be recorded on that same day.
    vi.setSystemTime(new Date(2026, 9, 2, 23, 30, 0));
  });

  it('records one block and its minutes when a work block finishes', () => {
    createApp(root);
    pickDragon('frost');
    finishWork();
    expect(saved().history).toEqual({ '2026-10-02': { blocks: 1, minutes: 1 } });
  });

  it('records nothing when a break finishes', () => {
    createApp(root);
    pickDragon('frost');
    finishWork();
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(saved().history).toEqual({ '2026-10-02': { blocks: 1, minutes: 1 } });
  });

  it('records nothing for a long break', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({
      dragonId: 'frost', settings: { workMinutes: 1, breakMinutes: 1, longBreakMinutes: 1 },
      timer: { mode: 'longBreak', running: false, remaining: 60, endsAt: null, completedWork: 4 },
    }));
    createApp(root);
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(saved().history).toEqual({});
  });

  it('keeps the record across a reload and keeps adding to it', () => {
    const app = createApp(root);
    pickDragon('frost');
    finishWork();
    app.destroy();
    reload();
    expect(saved().history['2026-10-02'].blocks).toBe(1);
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    finishWork();
    expect(saved().history['2026-10-02']).toEqual({ blocks: 2, minutes: 2 });
  });

  it('prunes days older than the window when it records', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({
      dragonId: 'frost', settings: { workMinutes: 1, breakMinutes: 1 },
      history: {
        '2026-01-01': { blocks: 9, minutes: 225 },
        '2026-10-01': { blocks: 2, minutes: 50 },
      },
    }));
    createApp(root);
    finishWork();
    expect(Object.keys(saved().history)).toEqual(['2026-10-01', '2026-10-02']);
  });
});

describe('createApp lifetime total', () => {
  const saved = () => JSON.parse(window.localStorage.getItem(config.storageKey));
  const finishWork = () => { click('start'); vi.advanceTimersByTime(ONE_BLOCK_MS); };

  beforeEach(() => { vi.setSystemTime(new Date(2026, 9, 2, 10, 0, 0)); });

  it('counts a finished work block in the day and in the lifetime total', () => {
    createApp(root);
    pickDragon('frost');
    finishWork();
    expect(saved().history['2026-10-02'].blocks).toBe(1);
    expect(saved().lifetimeBlocks).toBe(1);
  });

  it('does not count a finished break', () => {
    createApp(root);
    pickDragon('frost');
    finishWork();
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(saved().lifetimeBlocks).toBe(1);
  });

  it('never loses a block when history is pruned past its day', () => {
    createApp(root);
    pickDragon('frost');
    finishWork();
    expect(saved().lifetimeBlocks).toBe(1);
    // Months later: the first block's day leaves the 60-day window on the next record.
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    vi.setSystemTime(new Date(2027, 0, 20, 10, 0, 0));
    finishWork();
    expect(Object.keys(saved().history)).toEqual(['2027-01-20']);
    expect(saved().lifetimeBlocks).toBe(2);
    click('record');
    expect(root.querySelector('.record-total').textContent)
      .toBe('You have finished 2 blocks in all.');
  });

  it('seeds an old save from its history and keeps counting from there', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({
      version: 4, dragonId: 'frost', settings: { workMinutes: 1, breakMinutes: 1 },
      history: { '2026-10-01': { blocks: 5, minutes: 125 } },
    }));
    createApp(root);
    finishWork();
    expect(saved().lifetimeBlocks).toBe(6);
  });
});

describe('createApp record screen', () => {
  it('opens from the fourth nav button and returns to the main screen', () => {
    createApp(root);
    pickDragon('frost');
    click('record');
    expect(root.querySelector('.screen.record')).not.toBeNull();
    expect(root.querySelector('.screen-title').textContent).toBe('Record');
    root.querySelector('.back-btn').click();
    expect(root.querySelector('.screen.main')).not.toBeNull();
    expect(root.querySelector('.screen.record')).toBeNull();
  });

  it('shows the blocks she just finished, today and in total', () => {
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0, 0));
    createApp(root);
    pickDragon('frost');
    click('start');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    click('record');
    expect(root.querySelector('.is-today .record-count').textContent).toBe('1');
    expect(root.querySelector('.record-total').textContent).toContain('1 block');
  });

  it('does not yank the record back to main while the timer keeps ticking', () => {
    createApp(root);
    pickDragon('frost');
    click('start');
    click('record');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    expect(root.querySelector('.screen.record')).not.toBeNull();
  });
});

describe('createApp front door', () => {
  const openRaw = () => createRawApp(root);

  it('opens on the title screen on every launch, even with a dragon already chosen', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({ dragonId: 'frost' }));
    openRaw();
    expect(root.querySelector('.screen.title')).not.toBeNull();
    expect(root.querySelector('.timer-display')).toBeNull();
  });

  it('Start with no dragon opens the chooser', () => {
    openRaw();
    click('start-app');
    expect(root.querySelector('.choose-dragon')).not.toBeNull();
    expect(root.querySelector('.screen.title')).toBeNull();
  });

  // Start always goes to the eggs, even when a dragon is already saved: the chooser marks the
  // current one, so continuing is one tap and changing dragon costs nothing extra.
  it('Start opens the egg selection even with a dragon already chosen', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({ dragonId: 'frost' }));
    openRaw();
    click('start-app');
    expect(root.querySelector('.choose-dragon')).not.toBeNull();
    expect(root.querySelector('.timer-display')).toBeNull();
  });

  it('marks the saved dragon on that screen, so one tap carries on', () => {
    window.localStorage.setItem(config.storageKey, JSON.stringify({ dragonId: 'blaze' }));
    openRaw();
    click('start-app');
    expect(root.querySelector('[data-dragon="blaze"]').className).toContain('current');
    root.querySelector('[data-dragon="blaze"]').click();
    expect(root.querySelector('.timer-display')).not.toBeNull();
  });

  it('opens the instructions and comes back to the title screen', () => {
    openRaw();
    click('instructions');
    expect(root.querySelector('.screen.instructions')).not.toBeNull();
    root.querySelector('.back-btn').click();
    expect(root.querySelector('.screen.title')).not.toBeNull();
  });

  it('does not touch the save just by showing the title screen', () => {
    const before = window.localStorage.getItem(config.storageKey);
    openRaw();
    expect(window.localStorage.getItem(config.storageKey)).toBe(before);
  });
});

describe('createApp quests', () => {
  const saved = () => JSON.parse(window.localStorage.getItem(config.storageKey));
  const seed = (extra = {}) => window.localStorage.setItem(
    config.storageKey,
    JSON.stringify({ dragonId: 'frost', settings: { workMinutes: 1, breakMinutes: 1 }, ...extra }),
  );
  const reload = () => {
    root.remove();
    root = document.createElement('div');
    document.body.appendChild(root);
    return createApp(root);
  };
  const finishWork = () => { click('start'); vi.advanceTimersByTime(ONE_BLOCK_MS); };

  beforeEach(() => { vi.setSystemTime(new Date(2026, 9, 2, 10, 0, 0)); });

  it('pays the first block once, on top of the block\'s own coins, and says only the block\'s coins', () => {
    seed();
    createApp(root);
    finishWork();
    expect(saved().questsPaid).toEqual(['blocks-1']);
    expect(saved().coins).toBe(1 + 5);
    expect(coins()).toBe(6);
    // The banner reports the block itself; the quest coins are not folded into it.
    expect(root.querySelector('.session-reward').textContent).toContain('+1');
  });

  it('pays nothing extra on a reload, and nothing more for the next block', () => {
    seed();
    createApp(root);
    finishWork();
    reload();
    expect(saved().coins).toBe(6);
    expect(saved().questsPaid).toEqual(['blocks-1']);
    click('break');
    vi.advanceTimersByTime(ONE_BLOCK_MS);
    finishWork();
    expect(saved().coins).toBe(7);
    expect(saved().questsPaid).toEqual(['blocks-1']);
  });

  it('pays a save that already holds 128 blocks the first four block quests at once, and once', () => {
    seed({ lifetimeBlocks: 128 });
    createApp(root);
    expect(saved().coins).toBe(135);
    expect(saved().questsPaid).toEqual(['blocks-1', 'blocks-10', 'blocks-50', 'blocks-100']);
    reload();
    expect(saved().coins).toBe(135);
    expect(saved().questsPaid).toHaveLength(4);
  });

  it('pays opening the lair', () => {
    seed({ coins: 80 });
    createApp(root);
    click('lair');
    click('unlock-confirm');
    expect(saved().coins).toBe(80 - 50 + 10);
    expect(saved().questsPaid).toEqual(['lair-open']);
  });

  it('pays the first decoration when a piece is bought', () => {
    seed({ coins: 100, lairUnlocked: true, questsPaid: ['lair-open'] });
    createApp(root);
    click('lair');
    root.querySelector('[data-shelf-item="bed"]').click();
    expect(saved().coins).toBe(100 - 40 + 10);
    expect(saved().questsPaid).toEqual(['lair-open', 'decor-1']);
  });

  it('completes the full-room quest when the fourth slot of a lair is filled', () => {
    seed({
      coins: 500, lairUnlocked: true, questsPaid: ['lair-open', 'decor-1'],
      lairs: { frost: {
        owned: ['banner', 'bed', 'lamp'],
        slots: { wall: 'banner', floorLeft: 'bed', floorRight: 'lamp' },
      } },
    });
    createApp(root);
    click('lair');
    expect(saved().questsPaid).toEqual(['lair-open', 'decor-1']);
    root.querySelector('[data-shelf-item="imp"]').click();
    expect(saved().questsPaid).toEqual(['lair-open', 'decor-1', 'room-full']);
    expect(saved().coins).toBe(500 - 80 + 40);
  });

  it('pays the growing dragon when feeding carries it past its first stage', () => {
    seed({ coins: 100, xpByDragon: { frost: 90 }, questsPaid: [] });
    createApp(root);
    // 100 coins were seeded with no quest done yet, so nothing is owed on boot.
    expect(saved().coins).toBe(100);
    click('shop');
    root.querySelector('[data-food="apple"]').click();
    expect(saved().coins).toBe(100 - 10 + 20);
    expect(saved().questsPaid).toEqual(['dragon-grow']);
  });

  it('never pays the same quest twice however many times the state changes', () => {
    seed({ coins: 100, xpByDragon: { frost: 90 } });
    createApp(root);
    click('shop');
    root.querySelector('[data-food="apple"]').click();
    root.querySelector('[data-food="apple"]').click();
    expect(saved().coins).toBe(100 - 10 + 20 - 10);
    expect(saved().questsPaid).toEqual(['dragon-grow']);
  });

  it('shows the ladder on the Record screen, with a quest she has just finished marked done', () => {
    seed();
    createApp(root);
    finishWork();
    click('record');
    expect(root.querySelectorAll('[data-quest]')).toHaveLength(quests.length);
    expect(root.querySelector('[data-quest="blocks-1"]').dataset.state).toBe('done');
    expect(root.querySelector('[data-quest="blocks-10"] .quest-progress').textContent).toBe('1 / 10');
  });
});
