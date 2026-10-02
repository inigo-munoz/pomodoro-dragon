// What she did, day by day. A history is a plain object keyed by local date:
// { '2026-10-02': { blocks: 3, minutes: 75 } }. Per-day totals rather than one row per
// block: bounded, and enough for every question the record screen asks.
//
// Every function takes `now` as a timestamp instead of reading the clock, like the rest
// of core, so a test can pin the day.

const pad = (n) => String(n).padStart(2, '0');

const keyOfDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// The LOCAL calendar date. toISOString() is UTC, which puts a block finished just after
// local midnight on the previous day (and an evening one in the Americas on the next).
export const dayKey = (now) => keyOfDate(new Date(now));

// `offset` days before `now`. Built from the calendar components at midday, not by
// subtracting 24h of milliseconds, so a 23- or 25-hour daylight-saving day cannot skip
// or repeat a date.
const keyDaysAgo = (now, offset) => {
  const d = new Date(now);
  return keyOfDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset, 12));
};

export const recordBlock = (history, now, minutes) => {
  const key = dayKey(now);
  const day = history[key] ?? { blocks: 0, minutes: 0 };
  return { ...history, [key]: { blocks: day.blocks + 1, minutes: day.minutes + minutes } };
};

// Keeps today and the `days - 1` before it. Keys are YYYY-MM-DD, so they compare as text.
export const pruneHistory = (history, now, days) => {
  const oldest = keyDaysAgo(now, days - 1);
  return Object.fromEntries(Object.entries(history).filter(([key]) => key >= oldest));
};

// The calendar week containing `now`: seven entries, Monday first, Sunday last. A day
// with nothing is a zero entry, not a gap. getDay() is 0 for Sunday, so (getDay() + 6) % 7
// maps Monday to 0 and Sunday to 6. A day after today is `isFuture`: it has not happened
// yet, which is not the same as a day she did nothing. Stepping goes through keyDaysAgo
// (calendar components at midday), so a negative offset is a later day and a
// daylight-saving change cannot skip or repeat a date.
export const weekOf = (history, now) => {
  const todayIndex = (new Date(now).getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const key = keyDaysAgo(now, todayIndex - i);
    const day = history[key];
    return {
      key,
      blocks: day?.blocks ?? 0,
      minutes: day?.minutes ?? 0,
      isToday: i === todayIndex,
      isFuture: i > todayIndex,
    };
  });
};

const sum = (history, field) =>
  Object.values(history).reduce((total, day) => total + day[field], 0);

export const totalBlocks = (history) => sum(history, 'blocks');
export const totalMinutes = (history) => sum(history, 'minutes');
