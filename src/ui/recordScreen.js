import { weekOf, totalBlocks } from '../core/history.js';
import { backButton } from './backButton.js';
import { coinCounter } from './coinCounter.js';
import { screenTitle } from './screenTitle.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Fixed, not toLocaleDateString: the label must not change with the device locale, and in
// a Monday-first week the position already names the day.
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// One column per day. Only what she did is drawn: a past day with nothing is an empty
// slot, with no number and no words. A day still to come is quieter again and has no text
// whatsoever, so it can never read as something she did not do. Bars are scaled to the
// best day on screen, so the tallest one fills its track and the others are read against
// it, never against a target.
const dayColumn = (day, name, best) => {
  const col = document.createElement('div');
  col.className = 'record-day' + (day.isToday ? ' is-today' : '') + (day.isFuture ? ' is-future' : '');
  col.dataset.day = day.key;
  if (day.isToday) col.setAttribute('aria-current', 'date');
  col.setAttribute('aria-label', day.isFuture ? name : `${name}, ${plural(day.blocks, 'block')}`);

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
  label.textContent = day.isFuture ? '' : name;

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

  const week = weekOf(state.history ?? {}, now);
  const best = Math.max(...week.map((d) => d.blocks));
  const chart = document.createElement('div');
  chart.className = 'record-week';
  week.forEach((day, i) => chart.appendChild(dayColumn(day, DAY_NAMES[i], best)));
  section.appendChild(chart);

  const total = document.createElement('p');
  total.className = 'record-total';
  total.textContent = `You have finished ${plural(totalBlocks(state.history ?? {}), 'block')} in all.`;
  section.appendChild(total);

  return section;
};
