import { describe, it, expect } from 'vitest';
import { config } from './config.js';

describe('config', () => {
  // This test exists because the key LOOKS like an oversight. The app was renamed from
  // Pomodoro Dragon to Pomodoro Fantasy, but localStorage is scoped to the origin and not
  // the path, and the key is a plain string: as long as it is untouched, the child's coins,
  // dragon, lair and record survive the move to the new URL. Change this string and every
  // existing save is silently orphaned. Do not "fix" it to match the new name.
  it('keeps the storage key from before the rename', () => {
    expect(config.storageKey).toBe('pomodoro-dragon-save-v1');
  });
});
