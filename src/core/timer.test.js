import { describe, it, expect } from 'vitest';
import {
  createTimerState, start, pause, tick, advance, remainingAt, isBreak, secondsForMode,
} from './timer.js';
import { config } from '../data/config.js';

const settings = { workMinutes: 1, breakMinutes: 1 }; // 60s each
const T0 = 1_000_000;

describe('timer', () => {
  it('starts in work mode, not running, full remaining, no endsAt', () => {
    const s = createTimerState(settings);
    expect(s.mode).toBe('work');
    expect(s.running).toBe(false);
    expect(s.remaining).toBe(60);
    expect(s.endsAt).toBeNull();
  });

  it('does not tick down while paused', () => {
    const s = createTimerState(settings);
    const { state, completed } = tick(s, T0 + 5000);
    expect(state).toBe(s);
    expect(state.remaining).toBe(60);
    expect(completed).toBe(false);
  });

  it('start sets endsAt from now and remaining', () => {
    const s = start(createTimerState(settings), T0);
    expect(s.running).toBe(true);
    expect(s.endsAt).toBe(T0 + 60_000);
  });

  it('start on a running state returns it unchanged', () => {
    const s = start(createTimerState(settings), T0);
    expect(start(s, T0 + 10_000)).toBe(s);
  });

  it('ticks down one second while running', () => {
    const s = start(createTimerState(settings), T0);
    const { state, completed } = tick(s, T0 + 1000);
    expect(state.remaining).toBe(59);
    expect(completed).toBe(false);
  });

  it('shows the full duration during the first second', () => {
    const s = start(createTimerState(settings), T0);
    expect(tick(s, T0 + 100).state.remaining).toBe(60);
  });

  it('a tick that jumps several seconds reports the correct remaining', () => {
    const s = start(createTimerState(settings), T0);
    const { state, completed } = tick(s, T0 + 25_000);
    expect(state.remaining).toBe(35);
    expect(state.running).toBe(true);
    expect(completed).toBe(false);
  });

  it('signals completion when it reaches zero and stops running', () => {
    const s = start({ ...createTimerState(settings), remaining: 1 }, T0);
    const { state, completed } = tick(s, T0 + 1000);
    expect(completed).toBe(true);
    expect(state.remaining).toBe(0);
    expect(state.running).toBe(false);
    expect(state.endsAt).toBeNull();
  });

  it('a jump past the end completes exactly once with remaining 0', () => {
    const s = start(createTimerState(settings), T0);
    const first = tick(s, T0 + 500_000);
    expect(first.completed).toBe(true);
    expect(first.state.remaining).toBe(0);
    const second = tick(first.state, T0 + 600_000);
    expect(second.completed).toBe(false);
    expect(second.state.remaining).toBe(0);
  });

  it('pause freezes the live remaining and clears endsAt', () => {
    const s = pause(start(createTimerState(settings), T0), T0 + 20_000);
    expect(s.running).toBe(false);
    expect(s.remaining).toBe(40);
    expect(s.endsAt).toBeNull();
  });

  it('pause on a paused state returns it unchanged', () => {
    const s = createTimerState(settings);
    expect(pause(s, T0)).toBe(s);
  });

  it('pause then resume preserves remaining across a clock gap', () => {
    const paused = pause(start(createTimerState(settings), T0), T0 + 20_000);
    const resumed = start(paused, T0 + 50_000); // 30s of wall clock later
    expect(resumed.remaining).toBe(40);
    expect(remainingAt(resumed, T0 + 50_000)).toBe(40);
    expect(resumed.endsAt).toBe(T0 + 50_000 + 40_000);
  });

  it('remainingAt returns stored remaining when not running', () => {
    expect(remainingAt(createTimerState(settings), T0 + 99_000)).toBe(60);
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

  it('advance clears endsAt', () => {
    const running = start(createTimerState(settings), T0);
    expect(advance(running).endsAt).toBeNull();
  });
});

describe('the long-break cycle', () => {
  const cycleSettings = { workMinutes: 1, breakMinutes: 2, longBreakMinutes: 3, sessionsBeforeLongBreak: 4 };
  const modesAfterWorkBlocks = (state, blocks) => {
    const modes = [];
    let s = state;
    for (let i = 0; i < blocks; i += 1) {
      s = advance(s); // work -> break or longBreak
      modes.push(s.mode);
      s = advance(s); // back to work
    }
    return modes;
  };

  it('bakes the long break length, the cycle length and a zero counter', () => {
    const s = createTimerState(cycleSettings);
    expect(s.longBreakSeconds).toBe(180);
    expect(s.sessionsBeforeLongBreak).toBe(4);
    expect(s.completedWork).toBe(0);
    expect(s.workSeconds).toBe(60);
    expect(s.breakSeconds).toBe(120);
  });

  it('gives three short breaks and then a long one', () => {
    const modes = modesAfterWorkBlocks(createTimerState(cycleSettings), 4);
    expect(modes).toEqual(['break', 'break', 'break', 'longBreak']);
  });

  it('gives the long break its configured length', () => {
    let s = createTimerState(cycleSettings);
    for (let i = 0; i < 3; i += 1) s = advance(advance(s));
    s = advance(s);
    expect(s.mode).toBe('longBreak');
    expect(s.remaining).toBe(180);
    expect(s.running).toBe(false);
  });

  it('keeps counting across many cycles without resetting', () => {
    const modes = modesAfterWorkBlocks(createTimerState(cycleSettings), 12);
    const longs = modes.flatMap((m, i) => (m === 'longBreak' ? [i + 1] : []));
    expect(longs).toEqual([4, 8, 12]);
  });

  it('counts a work block when it ends and leaves the count alone on a break', () => {
    const work = createTimerState(cycleSettings);
    const afterWork = advance(work);
    expect(afterWork.completedWork).toBe(1);
    expect(advance(afterWork).completedWork).toBe(1);
  });

  it.each([0, -3, undefined])('never gives a long break when the cycle length is %s', (n) => {
    const modes = modesAfterWorkBlocks(
      createTimerState({ ...cycleSettings, sessionsBeforeLongBreak: n }), 8);
    expect(new Set(modes)).toEqual(new Set(['break']));
  });

  it('ticks a long break down and completes it like any other block', () => {
    let s = createTimerState({ ...cycleSettings, sessionsBeforeLongBreak: 1 });
    s = start(advance(s), T0);
    expect(s.mode).toBe('longBreak');
    expect(tick(s, T0 + 180_000).completed).toBe(true);
  });

  it('isBreak is true for both break modes and false for work', () => {
    expect(isBreak('break')).toBe(true);
    expect(isBreak('longBreak')).toBe(true);
    expect(isBreak('work')).toBe(false);
  });

  it('secondsForMode picks the length that belongs to the mode', () => {
    const s = createTimerState(cycleSettings);
    expect(secondsForMode(s, 'work')).toBe(60);
    expect(secondsForMode(s, 'break')).toBe(120);
    expect(secondsForMode(s, 'longBreak')).toBe(180);
  });
});

describe('cycle defaults', () => {
  it('ships the classic cycle: a 15 minute break after four sessions', () => {
    expect(config.durations.default).toMatchObject({
      workMinutes: 15, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4,
    });
    expect(config.durations.longBreakPresets).toEqual([10, 15, 20]);
    expect(config.durations.sessionsPresets).toEqual([2, 3, 4, 5]);
    expect(config.durations.sessionsRange).toEqual({ min: 1, max: 10 });
  });
});
