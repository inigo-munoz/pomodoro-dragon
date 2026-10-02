import { describe, it, expect } from 'vitest';
import {
  dayKey, recordBlock, pruneHistory, lastDays, totalBlocks, totalMinutes,
} from './history.js';

// Built from local components so the tests read the same in any timezone.
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('dayKey', () => {
  it('is the local calendar date, zero padded', () => {
    expect(dayKey(at(2026, 3, 7))).toBe('2026-03-07');
  });

  it('keeps a block finished at 23:30 on its own day, not the next', () => {
    // toISOString() would say tomorrow for anyone east of UTC-0 in the evening.
    expect(dayKey(at(2026, 10, 2, 23, 30))).toBe('2026-10-02');
  });

  it('starts a new day at local midnight', () => {
    expect(dayKey(at(2026, 10, 3, 0, 0))).toBe('2026-10-03');
  });

  it('puts 00:30 on the new day even where UTC is still the old one', () => {
    // Madrid is UTC+2 in October: 00:30 local is 22:30 UTC the day before.
    expect(dayKey(at(2026, 10, 3, 0, 30))).toBe('2026-10-03');
  });
});

describe('recordBlock', () => {
  it('starts a day at one block and its minutes', () => {
    expect(recordBlock({}, at(2026, 10, 2), 25)).toEqual({
      '2026-10-02': { blocks: 1, minutes: 25 },
    });
  });

  it('adds one block and the minutes to a day that already has some', () => {
    const h = { '2026-10-02': { blocks: 2, minutes: 50 } };
    expect(recordBlock(h, at(2026, 10, 2, 23, 30), 25)['2026-10-02'])
      .toEqual({ blocks: 3, minutes: 75 });
  });

  it('leaves other days alone', () => {
    const h = { '2026-10-01': { blocks: 4, minutes: 100 } };
    const next = recordBlock(h, at(2026, 10, 2), 25);
    expect(next['2026-10-01']).toEqual({ blocks: 4, minutes: 100 });
  });

  it('never mutates its input', () => {
    const h = { '2026-10-02': { blocks: 1, minutes: 25 } };
    const frozen = JSON.stringify(h);
    Object.freeze(h);
    Object.freeze(h['2026-10-02']);
    const next = recordBlock(h, at(2026, 10, 2), 25);
    expect(JSON.stringify(h)).toBe(frozen);
    expect(next).not.toBe(h);
  });
});

describe('pruneHistory', () => {
  const h = {
    '2026-09-20': { blocks: 1, minutes: 25 },
    '2026-09-30': { blocks: 2, minutes: 50 },
    '2026-10-02': { blocks: 3, minutes: 75 },
  };

  it('keeps today and the days before it up to the window, drops older', () => {
    // a 3-day window is Sep 30, Oct 1, Oct 2
    expect(Object.keys(pruneHistory(h, at(2026, 10, 2), 3))).toEqual(['2026-09-30', '2026-10-02']);
  });

  it('keeps everything inside a wide window', () => {
    expect(pruneHistory(h, at(2026, 10, 2), 60)).toEqual(h);
  });

  it('never mutates its input', () => {
    const copy = JSON.stringify(h);
    pruneHistory(h, at(2026, 10, 2), 3);
    expect(JSON.stringify(h)).toBe(copy);
  });
});

describe('lastDays', () => {
  const h = {
    '2026-09-30': { blocks: 2, minutes: 50 },
    '2026-10-02': { blocks: 3, minutes: 75 },
  };

  it('returns n entries, oldest first, ending on today', () => {
    const days = lastDays(h, at(2026, 10, 2), 7);
    expect(days).toHaveLength(7);
    expect(days.map((d) => d.key)).toEqual([
      '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29',
      '2026-09-30', '2026-10-01', '2026-10-02',
    ]);
  });

  it('includes days with nothing as zeros', () => {
    const days = lastDays(h, at(2026, 10, 2), 7);
    expect(days[5]).toEqual({ key: '2026-10-01', blocks: 0, minutes: 0 });
    expect(days[4]).toEqual({ key: '2026-09-30', blocks: 2, minutes: 50 });
    expect(days[6]).toEqual({ key: '2026-10-02', blocks: 3, minutes: 75 });
  });

  it('crosses a month boundary without skipping or repeating a day', () => {
    const keys = lastDays({}, at(2026, 3, 2), 4).map((d) => d.key);
    expect(keys).toEqual(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
  });

  it('is not thrown off by a daylight-saving change in the window', () => {
    // Spain springs forward on 2026-03-29; the window must still have 7 distinct days.
    const keys = lastDays({}, at(2026, 3, 31), 7).map((d) => d.key);
    expect(new Set(keys).size).toBe(7);
    expect(keys[0]).toBe('2026-03-25');
    expect(keys[6]).toBe('2026-03-31');
  });
});

describe('totals', () => {
  it('sum every day in the history', () => {
    const h = {
      '2026-09-30': { blocks: 2, minutes: 50 },
      '2026-10-02': { blocks: 3, minutes: 75 },
    };
    expect(totalBlocks(h)).toBe(5);
    expect(totalMinutes(h)).toBe(125);
  });

  it('are zero for an empty history', () => {
    expect(totalBlocks({})).toBe(0);
    expect(totalMinutes({})).toBe(0);
  });
});
