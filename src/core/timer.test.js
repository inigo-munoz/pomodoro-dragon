import { describe, it, expect } from 'vitest';
import { createTimerState, start, pause, tick, advance } from './timer.js';

const settings = { workMinutes: 1, breakMinutes: 1 }; // 60s each

describe('timer', () => {
  it('starts in work mode, not running, full remaining', () => {
    const s = createTimerState(settings);
    expect(s.mode).toBe('work');
    expect(s.running).toBe(false);
    expect(s.remaining).toBe(60);
  });

  it('does not tick down while paused', () => {
    const s = createTimerState(settings);
    const { state, completed } = tick(s);
    expect(state.remaining).toBe(60);
    expect(completed).toBe(false);
  });

  it('ticks down one second while running', () => {
    const s = start(createTimerState(settings));
    const { state } = tick(s);
    expect(state.remaining).toBe(59);
  });

  it('signals completion when it reaches zero and stops running', () => {
    let s = start({ ...createTimerState(settings), remaining: 1 });
    const { state, completed } = tick(s);
    expect(completed).toBe(true);
    expect(state.remaining).toBe(0);
    expect(state.running).toBe(false);
  });

  it('advances from work to break and back, resetting remaining', () => {
    const work = createTimerState(settings);
    const brk = advance(work);
    expect(brk.mode).toBe('break');
    expect(brk.remaining).toBe(60);
    expect(brk.running).toBe(false);
    const back = advance(brk);
    expect(back.mode).toBe('work');
  });

  it('pause stops running', () => {
    const s = pause(start(createTimerState(settings)));
    expect(s.running).toBe(false);
  });
});
