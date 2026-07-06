import { describe, it, expect } from 'vitest';
import { createAudio } from './audio.js';

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
