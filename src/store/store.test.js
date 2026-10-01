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
    expect(s.settings).toEqual(config.durations.default);
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
