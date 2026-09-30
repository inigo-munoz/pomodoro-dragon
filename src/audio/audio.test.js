import { describe, it, expect, vi } from 'vitest';
import { createAudio } from './audio.js';

const makeFakeContext = (state = 'suspended') => {
  const oscillators = [];
  const gains = [];
  const ctx = {
    state,
    resume: vi.fn(() => { ctx.state = 'running'; return Promise.resolve(); }),
    currentTime: 0,
    destination: { id: 'destination' },
    oscillators,
    gains,
    createOscillator: () => {
      const osc = {
        type: 'triangle',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(osc);
      return osc;
    },
    createGain: () => {
      const gain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
      gains.push(gain);
      return gain;
    },
  };
  return ctx;
};

const tones = {
  bell: [{ freq: 880, duration: 0.18 }, { freq: 1320, duration: 0.35 }],
};

describe('audio', () => {
  it('starts unmuted', () => {
    const a = createAudio({ music: null, effects: {} });
    expect(a.muted).toBe(false);
  });

  it('toggles and sets mute', () => {
    const a = createAudio({ music: null, effects: {} });
    expect(a.toggleMute()).toBe(true);
    expect(a.muted).toBe(true);
    expect(a.setMuted(false)).toBe(false);
    expect(a.muted).toBe(false);
  });

  it('does not throw when playing effects while muted', () => {
    const a = createAudio({ music: null, effects: {} });
    a.setMuted(true);
    expect(() => a.playEffect('bell')).not.toThrow();
    expect(() => a.playMusic()).not.toThrow();
  });
});

describe('audio synthesis', () => {
  it('synthesizes a tone when there is no asset', () => {
    const ctx = makeFakeContext();
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: () => ctx });
    a.playEffect('bell');
    expect(ctx.oscillators).toHaveLength(2);
    expect(ctx.oscillators.every((o) => o.type === 'sine')).toBe(true);
    expect(ctx.oscillators.map((o) => o.frequency.value)).toEqual([880, 1320]);
    ctx.oscillators.forEach((o) => {
      expect(o.start).toHaveBeenCalledTimes(1);
      expect(o.stop).toHaveBeenCalledTimes(1);
      expect(o.connect).toHaveBeenCalledWith(expect.anything());
    });
    expect(ctx.gains[0].connect).toHaveBeenCalledWith(ctx.destination);
  });

  it('schedules notes sequentially', () => {
    const ctx = makeFakeContext();
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: () => ctx });
    a.playEffect('bell');
    expect(ctx.oscillators[0].start).toHaveBeenCalledWith(0);
    expect(ctx.oscillators[1].start).toHaveBeenCalledWith(0.18);
  });

  it('creates nothing while muted, not even the context', () => {
    const factory = vi.fn(makeFakeContext);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    a.setMuted(true);
    a.playEffect('bell');
    expect(factory).not.toHaveBeenCalled();
  });

  it('creates the context lazily', () => {
    const factory = vi.fn(makeFakeContext);
    createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    expect(factory).not.toHaveBeenCalled();
  });

  it('creates the context once and reuses it', () => {
    const factory = vi.fn(makeFakeContext);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    a.playEffect('bell');
    a.playEffect('bell');
    a.playEffect('bell');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('is a silent no-op for a name with no asset and no tone', () => {
    const factory = vi.fn(makeFakeContext);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    expect(() => a.playEffect('nope')).not.toThrow();
    expect(factory).not.toHaveBeenCalled();
  });

  it('degrades to silence when the context cannot be created, without retrying', () => {
    const factory = vi.fn(() => { throw new Error('no web audio'); });
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    expect(() => a.playEffect('bell')).not.toThrow();
    expect(() => a.playEffect('bell')).not.toThrow();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

describe('audio unlock', () => {
  it('creates the context and resumes it when suspended', () => {
    const ctx = makeFakeContext('suspended');
    const factory = vi.fn(() => ctx);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    a.unlock();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('does not resume a context that is already running', () => {
    const ctx = makeFakeContext('running');
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: () => ctx });
    a.unlock();
    expect(ctx.resume).not.toHaveBeenCalled();
  });

  it('still creates and resumes the context while muted', () => {
    const ctx = makeFakeContext('suspended');
    const factory = vi.fn(() => ctx);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    a.setMuted(true);
    a.unlock();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('reuses the one context across repeated calls without throwing', () => {
    const ctx = makeFakeContext('suspended');
    const factory = vi.fn(() => ctx);
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    expect(() => { a.unlock(); a.unlock(); a.unlock(); }).not.toThrow();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the context cannot be created, and does not retry', () => {
    const factory = vi.fn(() => { throw new Error('no web audio'); });
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: factory });
    expect(() => a.unlock()).not.toThrow();
    expect(() => a.unlock()).not.toThrow();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the context has no resume method', () => {
    const ctx = makeFakeContext('suspended');
    delete ctx.resume;
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: () => ctx });
    expect(() => a.unlock()).not.toThrow();
  });

  it('swallows a rejected resume promise', async () => {
    const ctx = makeFakeContext('suspended');
    ctx.resume = vi.fn(() => Promise.reject(new Error('blocked')));
    const a = createAudio({ music: null, effects: {}, tones, createAudioContext: () => ctx });
    expect(() => a.unlock()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });
});

describe('music rotation', () => {
  const list = ['/a.mp3', '/b.mp3', '/c.mp3', '/d.mp3'];
  // Deterministic shuffle: always picks the last remaining index, reversing the list.
  const fixedRandom = () => 0.999;

  const nameOf = (a) => (a.nowPlaying || '').split('/').pop();

  it('plays nothing until asked', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    expect(a.nowPlaying).toBeNull();
  });

  it('starts a track when the music starts', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    a.playMusic();
    expect(list.some((t) => nameOf(a) === t.slice(1))).toBe(true);
  });

  it('moves to a different track when one ends, rather than repeating it', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    a.playMusic();
    const first = nameOf(a);
    a.skipTrack();
    expect(nameOf(a)).not.toBe(first);
  });

  it('plays every track before any repeats', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    a.playMusic();
    const heard = [nameOf(a)];
    for (let i = 0; i < list.length - 1; i += 1) {
      a.skipTrack();
      heard.push(nameOf(a));
    }
    expect(new Set(heard).size).toBe(list.length);
  });

  it('does not deal the track that just finished straight back after a reshuffle', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    a.playMusic();
    // Exhaust the whole order, forcing a reshuffle on the next advance.
    for (let i = 0; i < list.length - 1; i += 1) a.skipTrack();
    const last = nameOf(a);
    a.skipTrack();
    expect(nameOf(a)).not.toBe(last);
  });

  it('a single url still works, as one track', () => {
    const a = createAudio({ music: '/only.mp3', effects: {}, random: fixedRandom });
    a.playMusic();
    expect(nameOf(a)).toBe('only.mp3');
  });

  it('muted music never starts', () => {
    const a = createAudio({ music: list, effects: {}, random: fixedRandom });
    a.setMuted(true);
    a.playMusic();
    expect(a.nowPlaying).toBeNull();
  });
});
