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

// Every calendar week that overlaps the month containing `now`, Monday first, in order. The
// first and last weeks are usually partial, and a week's blocks and minutes count only the
// days that fall inside the month, so the entries add up to the month and nothing leaks in
// from the neighbouring ones. A week that begins after today is `isFuture`; the one holding
// today is `isCurrent` even if its later days have not happened. Days are stepped through
// calendar components at midday, like weekOf, so a daylight-saving change cannot skip or
// repeat a date.
export const monthOf = (history, now) => {
  const today = new Date(now);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const todayKey = keyOfDate(today);

  const weeks = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day, 12);
    const mondayOffset = (date.getDay() + 6) % 7;
    let week = weeks[weeks.length - 1];
    if (!week || mondayOffset === 0) {
      week = {
        key: keyOfDate(new Date(year, month, day - mondayOffset, 12)),
        first: day,
        last: day,
        blocks: 0,
        minutes: 0,
        isCurrent: false,
        isFuture: false,
      };
      weeks.push(week);
    }
    const entry = history[keyOfDate(date)];
    week.last = day;
    week.blocks += entry?.blocks ?? 0;
    week.minutes += entry?.minutes ?? 0;
    if (keyOfDate(date) === todayKey) week.isCurrent = true;
  }

  return weeks.map(({ key, first, last, blocks, minutes, isCurrent }) => ({
    key,
    label: first === last ? String(first) : `${first}-${last}`,
    blocks,
    minutes,
    isCurrent,
    // Keys are YYYY-MM-DD, so they compare as text. A week is still to come only when its
    // first in-month day is after today.
    isFuture: !isCurrent && keyOfDate(new Date(year, month, first, 12)) > todayKey,
  }));
};

// A save is data from outside: one `null`, string or half-written day must not take the
// whole total (and with it the migration) down, so such entries count for nothing.
const sum = (history, field) => {
  if (history === null || typeof history !== 'object') return 0;
  return Object.values(history).reduce((total, day) => {
    const n = day !== null && typeof day === 'object' ? day[field] : undefined;
    return Number.isFinite(n) ? total + n : total;
  }, 0);
};

export const totalBlocks = (history) => sum(history, 'blocks');
export const totalMinutes = (history) => sum(history, 'minutes');
