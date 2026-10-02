import { lastDays, totalBlocks } from '../core/history.js';
import { backButton } from './backButton.js';
import { coinCounter } from './coinCounter.js';
import { screenTitle } from './screenTitle.js';

const WEEK = 7;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// The key is a local date, so the name is read from its parts rather than parsed as a
// string (new Date('2026-10-02') is UTC midnight and can name the wrong weekday).
const shortName = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
};

// One column per day. Only what she did is drawn: a day with nothing is an empty slot,
// with no number and no words. Bars are scaled to the best day on screen, so the tallest
// one fills its track and the others are read against it, never against a target.
const dayColumn = (day, isToday, best) => {
  const name = shortName(day.key);
  const col = document.createElement('div');
  col.className = 'record-day' + (isToday ? ' is-today' : '');
  col.dataset.day = day.key;
  if (isToday) col.setAttribute('aria-current', 'date');
  col.setAttribute('aria-label', `${name}, ${plural(day.blocks, 'block')}`);

  const count = document.createElement('span');
  count.className = 'record-count';
  count.textContent = day.blocks > 0 ? String(day.blocks) : '';

  const track = document.createElement('div');
  track.className = 'record-track';
  const bar = document.createElement('div');
  bar.className = 'record-bar';
  bar.style.height = `${best > 0 ? (day.blocks / best) * 100 : 0}%`;
  track.appendChild(bar);

  const label = document.createElement('span');
  label.className = 'record-day-name';
  label.textContent = name;

  col.append(count, track, label);
  return col;
};

export const renderRecordScreen = ({ state, now, theme, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen record';

  const bar = document.createElement('div');
  bar.className = 'screen-bar';
  bar.append(backButton(onBack), coinCounter(state.coins, theme));
  section.appendChild(bar);
  section.appendChild(screenTitle('Record'));

  const week = lastDays(state.history ?? {}, now, WEEK);
  const best = Math.max(...week.map((d) => d.blocks));
  const chart = document.createElement('div');
  chart.className = 'record-week';
  week.forEach((day, i) => chart.appendChild(dayColumn(day, i === WEEK - 1, best)));
  section.appendChild(chart);

  const total = document.createElement('p');
  total.className = 'record-total';
  total.textContent = `You have finished ${plural(totalBlocks(state.history ?? {}), 'block')} in all.`;
  section.appendChild(total);

  return section;
};
