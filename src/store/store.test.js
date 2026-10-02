import { describe, it, expect } from 'vitest';
import { createStore, defaultState } from './store.js';
import { config } from '../data/config.js';

const memoryBackend = () => {
  const box = {};
  return {
    read: (k) => (k in box ? box[k] : null),
    write: (k, v) => { box[k] = v; },
  };
};

describe('store', () => {
  it('returns default state when nothing is saved', () => {
    const store = createStore(memoryBackend(), config);
    const s = store.load();
    expect(s.coins).toBe(0);
    expect(s.xpByDragon).toEqual({});
    expect(s.version).toBe(3);
    expect(s.timer).toBeNull();
    expect(s.dragonId).toBeNull();
    expect(s.settings).toEqual({ ...config.durations.default, musicStyle: 'cozy' });
  });

  it('save then load returns the same state (roundtrip)', () => {
    const store = createStore(memoryBackend(), config);
    const saved = { ...defaultState(config), dragonId: 'frost', coins: 40,
      xpByDragon: { frost: 120 } };
    store.save(saved);
    expect(store.load()).toEqual(saved);
  });

  it('migrates a v1 save (global xp) to per-dragon xpByDragon', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify(
      { version: 1, dragonId: 'frost', coins: 40, xp: 120, muted: false,
        settings: config.durations.default }));
    const store = createStore(backend, config);
    const s = store.load();
    expect(s.version).toBe(3);
    expect(s.xpByDragon).toEqual({ frost: 120 });
    expect(s.coins).toBe(40);
    expect('xp' in s).toBe(false);
  });

  it('loads an old save without a timer field with timer null and the new version', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify(
      { version: 2, dragonId: 'frost', coins: 5, xpByDragon: { frost: 10 }, muted: false,
        settings: config.durations.default }));
    const s = createStore(backend, config).load();
    expect(s.timer).toBeNull();
    expect(s.version).toBe(3);
    expect(s.coins).toBe(5);
  });

  it('round-trips a persisted timer through save and load', () => {
    const store = createStore(memoryBackend(), config);
    const timer = { mode: 'work', running: true, remaining: 90, endsAt: 1_700_000_000_000 };
    store.save({ ...defaultState(config), timer });
    expect(store.load().timer).toEqual(timer);
  });

  it('falls back to defaults when stored data is corrupt', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, '{not valid json');
    const store = createStore(backend, config);
    expect(store.load().coins).toBe(0);
  });
});

describe('store lairs field', () => {
  it('defaults lairs to an empty object without bumping the version', () => {
    expect(defaultState(config).lairs).toEqual({});
    expect(defaultState(config).version).toBe(3);
  });

  it('loads an old save without lairs, keeping every other field intact', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify(
      { version: 3, dragonId: 'frost', coins: 5, xpByDragon: { frost: 10 }, muted: false,
        settings: config.durations.default, timer: null }));
    const s = createStore(backend, config).load();
    expect(s.lairs).toEqual({});
    expect(s.version).toBe(3);
    expect(s.coins).toBe(5);
    expect(s.xpByDragon).toEqual({ frost: 10 });
  });
});

describe('lair unlock state', () => {
  it('defaults to locked with the version unchanged and exactly two new keys', () => {
    const s = defaultState(config);
    expect(s.lairUnlocked).toBe(false);
    expect(s.lairs).toEqual({});
    expect(s.version).toBe(3);
  });

  it('prices the unlock in config, as data', () => {
    expect(config.lairUnlockPrice).toBe(50);
  });

  it('loads a v3 save with neither lairs nor lairUnlocked as locked, other fields intact', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify(
      { version: 3, dragonId: 'frost', coins: 500, xpByDragon: { frost: 80 },
        muted: false, settings: config.durations.default, timer: null }));
    const s = createStore(backend, config).load();
    expect(s.lairUnlocked).toBe(false);
    expect(s.lairs).toEqual({});
    expect(s.coins).toBe(500);
    expect(s.xpByDragon).toEqual({ frost: 80 });
    expect(s.version).toBe(3);
  });

  it('keeps an unlocked flag across save and load', () => {
    const store = createStore(memoryBackend(), config);
    store.save({ ...defaultState(config), lairUnlocked: true });
    expect(store.load().lairUnlocked).toBe(true);
  });
});

describe('music style setting', () => {
  it('defaults to cozy, beside the durations, without bumping the version', () => {
    const s = defaultState(config);
    expect(s.settings).toEqual({
      workMinutes: 15, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4,
      musicStyle: 'cozy',
    });
    expect(s.version).toBe(3);
  });

  it('loads a save written before the setting existed with the default and loses nothing', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify({
      version: 3, dragonId: 'frost', coins: 42, muted: true,
      settings: { workMinutes: 25, breakMinutes: 10 },
    }));
    const s = createStore(backend, config).load();
    expect(s.settings).toEqual({
      workMinutes: 25, breakMinutes: 10, longBreakMinutes: 15, sessionsBeforeLongBreak: 4,
      musicStyle: 'cozy',
    });
    expect(s.dragonId).toBe('frost');
    expect(s.coins).toBe(42);
    expect(s.muted).toBe(true);
  });

  it('keeps a chosen style across save and load', () => {
    const store = createStore(memoryBackend(), config);
    const state = defaultState(config);
    store.save({ ...state, settings: { ...state.settings, musicStyle: 'lofi' } });
    expect(store.load().settings.musicStyle).toBe('lofi');
  });
});

describe('music playlists in config', () => {
  it('has a playlist for every offered style', () => {
    expect(config.musicStyles).toEqual(['cozy', 'lofi']);
    for (const style of config.musicStyles) {
      expect(config.music[style].length).toBeGreaterThan(0);
    }
  });
});

describe('long break settings', () => {
  it('fills the cycle defaults into a realistic save from before they existed', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify({
      version: 3, dragonId: 'ember', coins: 130, muted: false,
      xpByDragon: { ember: 240 },
      lairUnlocked: true,
      lairs: { ember: { owned: ['cushion'], placed: { floorLeft: 'cushion' } } },
      settings: { workMinutes: 20, breakMinutes: 4, musicStyle: 'lofi' },
      timer: { mode: 'break', running: false, remaining: 120, endsAt: null },
    }));
    const s = createStore(backend, config).load();
    expect(s.settings).toEqual({
      workMinutes: 20, breakMinutes: 4, musicStyle: 'lofi',
      longBreakMinutes: 15, sessionsBeforeLongBreak: 4,
    });
    expect(s.version).toBe(3);
    expect(s.dragonId).toBe('ember');
    expect(s.coins).toBe(130);
    expect(s.xpByDragon).toEqual({ ember: 240 });
    expect(s.lairUnlocked).toBe(true);
    expect(s.lairs.ember.owned).toEqual(['cushion']);
    expect(s.timer).toEqual({ mode: 'break', running: false, remaining: 120, endsAt: null });
  });

  it('keeps a saved cycle setting over the default', () => {
    const backend = memoryBackend();
    backend.write(config.storageKey, JSON.stringify({
      version: 3, settings: { longBreakMinutes: 10, sessionsBeforeLongBreak: 2 },
    }));
    const s = createStore(backend, config).load();
    expect(s.settings.longBreakMinutes).toBe(10);
    expect(s.settings.sessionsBeforeLongBreak).toBe(2);
    expect(s.settings.workMinutes).toBe(15);
  });
});

describe('store history field', () => {
  it('defaults history to an empty object without bumping the version', () => {
    expect(defaultState(config).history).toEqual({});
    expect(defaultState(config).version).toBe(3);
  });

  it('loads a realistic save from before the record existed, gaining history and losing nothing', () => {
    const backend = memoryBackend();
    const old = {
      version: 3, dragonId: 'blaze', coins: 37, xpByDragon: { blaze: 240, frost: 90 },
      lairs: { blaze: { owned: ['bed'], slots: { floorLeft: 'bed' } } },
      lairUnlocked: true, muted: true,
      settings: { ...config.durations.default, workMinutes: 20, musicStyle: 'lofi' },
      timer: { mode: 'break', running: false, remaining: 120, endsAt: null, completedWork: 2 },
    };
    backend.write(config.storageKey, JSON.stringify(old));
    const s = createStore(backend, config).load();
    expect(s.history).toEqual({});
    expect(s).toEqual({ ...old, history: {} });
  });

  it('round-trips a saved history', () => {
    const store = createStore(memoryBackend(), config);
    const history = { '2026-10-02': { blocks: 3, minutes: 75 } };
    store.save({ ...defaultState(config), history });
    expect(store.load().history).toEqual(history);
  });
});
