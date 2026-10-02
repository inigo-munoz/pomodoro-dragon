import { describe, it, expect } from 'vitest';
import {
  dayKey, recordBlock, pruneHistory, weekOf, monthOf, totalBlocks,
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

describe('weekOf', () => {
  const h = {
    '2026-09-30': { blocks: 2, minutes: 50 },
    '2026-10-02': { blocks: 3, minutes: 75 },
  };

  it('returns the calendar week containing now, Monday first', () => {
    // Friday 2 October 2026.
    const week = weekOf(h, at(2026, 10, 2));
    expect(week).toHaveLength(7);
    expect(week.map((d) => d.key)).toEqual([
      '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01',
      '2026-10-02', '2026-10-03', '2026-10-04',
    ]);
  });

  it('fills in the blocks and minutes, and zeros for days with nothing', () => {
    const week = weekOf(h, at(2026, 10, 2));
    expect(week[2]).toMatchObject({ key: '2026-09-30', blocks: 2, minutes: 50 });
    expect(week[3]).toMatchObject({ key: '2026-10-01', blocks: 0, minutes: 0 });
    expect(week[4]).toMatchObject({ key: '2026-10-02', blocks: 3, minutes: 75 });
  });

  // 2026-09-28 is a Monday, so Mon..Sun of that week are the 28th to 4 Oct.
  it.each([
    ['Monday', 28, 0], ['Tuesday', 29, 1], ['Wednesday', 30, 2], ['Thursday', 1, 3],
    ['Friday', 2, 4], ['Saturday', 3, 5], ['Sunday', 4, 6],
  ])('starts on Monday and ends on Sunday when now is a %s', (_name, _day, todayIndex) => {
    const base = new Date(2026, 8, 28 + todayIndex, 15).getTime();
    const week = weekOf({}, base);
    expect(week[0].key).toBe('2026-09-28');
    expect(week[6].key).toBe('2026-10-04');
    expect(week.findIndex((d) => d.isToday)).toBe(todayIndex);
  });

  it('puts Sunday last, not first (the classic getDay() off-by-one)', () => {
    const week = weekOf({}, at(2026, 10, 4));
    expect(week[6]).toMatchObject({ key: '2026-10-04', isToday: true });
    expect(week[0].key).toBe('2026-09-28');
  });

  it('marks exactly one entry as today and only later days as future', () => {
    const week = weekOf({}, at(2026, 10, 1)); // Thursday
    expect(week.filter((d) => d.isToday)).toHaveLength(1);
    expect(week.map((d) => d.isFuture)).toEqual([false, false, false, false, true, true, true]);
    expect(week[3].isFuture).toBe(false);
  });

  it('has no future days on a Sunday and six on a Monday', () => {
    expect(weekOf({}, at(2026, 10, 4)).filter((d) => d.isFuture)).toHaveLength(0);
    expect(weekOf({}, at(2026, 9, 28)).filter((d) => d.isFuture)).toHaveLength(6);
  });

  it('crosses a month boundary without skipping or repeating a day', () => {
    // Wednesday 1 April 2026: the week began on Monday 30 March.
    const keys = weekOf({}, at(2026, 4, 1)).map((d) => d.key);
    expect(keys).toEqual([
      '2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02',
      '2026-04-03', '2026-04-04', '2026-04-05',
    ]);
  });

  it('is not thrown off by a daylight-saving change in the week', () => {
    // Spain springs forward on Sunday 2026-03-29; the week of Mon 23 Mar contains it.
    const week = weekOf({}, at(2026, 3, 29));
    expect(new Set(week.map((d) => d.key)).size).toBe(7);
    expect(week[0].key).toBe('2026-03-23');
    expect(week[6].key).toBe('2026-03-29');
    // And the week after it, whose Monday is the day after the change.
    const next = weekOf({}, at(2026, 3, 31)).map((d) => d.key);
    expect(new Set(next).size).toBe(7);
    expect(next[0]).toBe('2026-03-30');
    expect(next[6]).toBe('2026-04-05');
  });
});

describe('monthOf', () => {
  const labels = (m) => m.map((w) => w.label);

  it('gives one entry per calendar week overlapping the month, Monday first', () => {
    // October 2026 starts on a Thursday and ends on a Saturday: five weeks.
    const month = monthOf({}, at(2026, 10, 2));
    expect(labels(month)).toEqual(['1-4', '5-11', '12-18', '19-25', '26-31']);
    expect(month.map((w) => w.key)).toEqual([
      '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26',
    ]);
  });

  it('starts a week on the 1st when the month begins on a Monday', () => {
    // February 2027 begins on a Monday and is 28 days long: exactly four whole weeks.
    const month = monthOf({}, at(2027, 2, 10));
    expect(labels(month)).toEqual(['1-7', '8-14', '15-21', '22-28']);
    expect(month[0].key).toBe('2027-02-01');
  });

  it('sums only the in-month days of the partial first and last weeks', () => {
    const history = {
      '2026-09-28': { blocks: 5, minutes: 125 }, // same week as 1 Oct, but September
      '2026-09-30': { blocks: 7, minutes: 175 }, // September
      '2026-10-01': { blocks: 2, minutes: 50 },
      '2026-10-04': { blocks: 1, minutes: 25 },
      '2026-10-30': { blocks: 3, minutes: 75 },
      '2026-10-31': { blocks: 4, minutes: 100 },
      '2026-11-01': { blocks: 9, minutes: 225 }, // November, same week as 26-31 Oct
    };
    const month = monthOf(history, at(2026, 10, 31));
    expect(month[0]).toMatchObject({ label: '1-4', blocks: 3, minutes: 75 });
    expect(month[4]).toMatchObject({ label: '26-31', blocks: 7, minutes: 175 });
    expect(month.reduce((t, w) => t + w.blocks, 0)).toBe(10);
  });

  it('never lets a block from an adjacent month leak in', () => {
    const history = {
      '2026-09-30': { blocks: 8, minutes: 200 },
      '2026-11-02': { blocks: 8, minutes: 200 },
    };
    const month = monthOf(history, at(2026, 10, 15));
    expect(month.every((w) => w.blocks === 0 && w.minutes === 0)).toBe(true);
  });

  it('marks exactly one week as current, the one holding today', () => {
    const month = monthOf({}, at(2026, 10, 14));
    expect(month.filter((w) => w.isCurrent).map((w) => w.label)).toEqual(['12-18']);
  });

  it('marks as future only the weeks that start after today', () => {
    // Friday 2 Oct: the first week (1-4) holds today, every later week is still to come.
    const month = monthOf({}, at(2026, 10, 2));
    expect(month.map((w) => w.isFuture)).toEqual([false, true, true, true, true]);
    // On the last day of the month nothing is in the future.
    expect(monthOf({}, at(2026, 10, 31)).some((w) => w.isFuture)).toBe(false);
  });

  it('counts a day to come in the current week as part of that week, not as future', () => {
    const month = monthOf({ '2026-10-02': { blocks: 2, minutes: 50 } }, at(2026, 10, 2));
    expect(month[0]).toMatchObject({ blocks: 2, isCurrent: true, isFuture: false });
  });

  it('labels a one-day week with the single date', () => {
    // March 2026 begins on a Sunday, so its first week is the 1st alone.
    expect(labels(monthOf({}, at(2026, 3, 10)))).toEqual(['1', '2-8', '9-15', '16-22', '23-29', '30-31']);
  });

  it('keeps every week distinct across a daylight-saving change', () => {
    // Spain springs forward on Sunday 2026-03-29, inside the week 23-29.
    const history = {
      '2026-03-28': { blocks: 1, minutes: 25 },
      '2026-03-29': { blocks: 2, minutes: 50 },
      '2026-03-30': { blocks: 4, minutes: 100 },
    };
    const month = monthOf(history, at(2026, 3, 29));
    expect(new Set(month.map((w) => w.key)).size).toBe(6);
    expect(month[4]).toMatchObject({ key: '2026-03-23', label: '23-29', blocks: 3 });
    expect(month[5]).toMatchObject({ key: '2026-03-30', label: '30-31', blocks: 4 });
  });

  it('handles a month that ends on a Sunday and a year boundary', () => {
    // 31 May 2026 is a Sunday: the last week is whole. December 2026 / January 2027 do not mix.
    expect(labels(monthOf({}, at(2026, 5, 20))).at(-1)).toBe('25-31');
    const dec = monthOf({ '2027-01-01': { blocks: 6, minutes: 150 } }, at(2026, 12, 20));
    expect(dec.at(-1).label).toBe('28-31');
    expect(dec.at(-1).blocks).toBe(0);
  });
});

describe('totals', () => {
  it('sum every day in the history', () => {
    const h = {
      '2026-09-30': { blocks: 2, minutes: 50 },
      '2026-10-02': { blocks: 3, minutes: 75 },
    };
    expect(totalBlocks(h)).toBe(5);
  });

  it('are zero for an empty history', () => {
    expect(totalBlocks({})).toBe(0);
  });

  it('skip days that are not objects, and fields that are not finite numbers', () => {
    const h = {
      a: { blocks: 2, minutes: 50 }, b: null, c: 'oops', d: 4, e: [],
      f: { blocks: 'x', minutes: NaN }, g: { blocks: 1, minutes: 25 },
    };
    expect(totalBlocks(h)).toBe(3);
  });

  it('are zero for a history that is not an object at all', () => {
    for (const h of [null, undefined, 'text', 7, []]) {
      expect(totalBlocks(h)).toBe(0);
    }
  });
});
