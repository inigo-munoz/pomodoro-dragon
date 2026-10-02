import { weekOf, monthOf } from '../core/history.js';
import { questProgress } from '../core/quests.js';
import { backButton } from './backButton.js';
import { coinCounter } from './coinCounter.js';
import { screenTitle } from './screenTitle.js';
import { themedIcon } from './themedIcon.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Fixed, not toLocaleDateString: the label must not change with the device locale, and in
// a Monday-first week the position already names the day.
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// A bar and its number, shared by both ranges. Only what she did is drawn: a span that has
// happened shows its count, and a count of 0 is printed as a plain 0, a fact and nothing
// more. A span still to come is quieter again and has no text whatsoever, so it can never
// read as something she did not do. Bars are scaled to the best bar on screen, so the
// tallest one fills its track and the others are read against it, never against a target.
const barParts = (entry, best) => {
  const count = document.createElement('span');
  count.className = 'record-count';
  // A span still to come is blank, with one exception: if it somehow holds work, that work is
  // shown. A tablet whose clock ran fast records real blocks on a date that becomes the future
  // once the clock is corrected, and a blank bar would read as if she had never done them.
  count.textContent = entry.isFuture && entry.blocks === 0 ? '' : String(entry.blocks);

  const track = document.createElement('div');
  track.className = 'record-track';
  const bar = document.createElement('div');
  bar.className = 'record-bar';
  bar.style.height = `${best > 0 ? (entry.blocks / best) * 100 : 0}%`;
  track.appendChild(bar);
  return { count, track };
};

const nameLabel = (text) => {
  const label = document.createElement('span');
  label.className = 'record-day-name';
  label.textContent = text;
  return label;
};

// One column per day: the week view.
const dayColumn = (day, name, best) => {
  const col = document.createElement('div');
  col.className = 'record-day' + (day.isToday ? ' is-today' : '') + (day.isFuture ? ' is-future' : '');
  col.dataset.day = day.key;
  if (day.isToday) col.setAttribute('aria-current', 'date');
  col.setAttribute('aria-label', day.isFuture ? name : `${name}, ${plural(day.blocks, 'block')}`);

  const { count, track } = barParts(day, best);
  col.append(count, track, nameLabel(day.isFuture ? '' : name));
  return col;
};

// One column per calendar week: the month view. It is `.record-span`, not `.record-day`,
// because it is a span of days, and the week view's selectors stay exactly as they were.
// The label is the in-month days it covers, and its count is the blocks of those days only.
const weekColumn = (week, best) => {
  const col = document.createElement('div');
  col.className = 'record-span' + (week.isCurrent ? ' is-current' : '') + (week.isFuture ? ' is-future' : '');
  col.dataset.week = week.key;
  if (week.isCurrent) col.setAttribute('aria-current', 'date');
  const name = `Days ${week.label}`;
  col.setAttribute('aria-label', week.isFuture ? name : `${name}, ${plural(week.blocks, 'block')}`);

  const { count, track } = barParts(week, best);
  col.append(count, track, nameLabel(week.isFuture ? '' : week.label));
  return col;
};

// One rung of the ladder. A quest is either done or in progress, and nothing else: there is
// no third state to draw, so an unfinished one can only show how far it has come. A done
// quest stays on the list with a mark, because the ladder is the point. Whether it was paid
// is not shown: that is bookkeeping, and the state alone says what she has done.
const questEntry = (quest, state, world, theme) => {
  const { current, goal, done } = questProgress(quest, state, world);
  const item = document.createElement('li');
  item.className = 'quest food-card';
  item.dataset.quest = quest.id;
  item.dataset.state = done ? 'done' : 'doing';

  const title = document.createElement('span');
  title.className = 'quest-title';
  title.textContent = quest.title;

  const progress = document.createElement('span');
  progress.className = 'quest-progress';
  progress.textContent = `${current} / ${goal}`;

  const reward = document.createElement('span');
  reward.className = 'quest-reward';
  const coin = document.createElement('span');
  coin.className = 'price-coin';
  coin.appendChild(themedIcon(theme, 'coin'));
  reward.append(coin, ` ${quest.reward}`);

  item.append(title, progress, reward);
  if (done) {
    const mark = document.createElement('span');
    mark.className = 'quest-mark';
    mark.textContent = '\u2713 Done';
    item.appendChild(mark);
  }
  return item;
};

const questList = (quests, state, world, theme) => {
  const list = document.createElement('ul');
  list.className = 'quest-list';
  list.setAttribute('aria-label', 'Quests');
  list.append(...quests.map((q) => questEntry(q, state, world, theme)));
  return list;
};

const RANGES = [
  { id: 'week', text: 'Week' },
  { id: 'month', text: 'Month' },
];

// `quests` and `world` come from the caller, like the shop's foods: this screen imports no
// data. With no quests handed in, there is simply no ladder.
export const renderRecordScreen = ({ state, now, theme, onBack, quests = [], world = {} }) => {
  const section = document.createElement('section');
  section.className = 'screen record';

  const bar = document.createElement('div');
  bar.className = 'screen-bar';
  bar.append(backButton(onBack), coinCounter(state.coins, theme));
  section.appendChild(bar);
  section.appendChild(screenTitle('Record'));

  const history = state.history ?? {};
  const chart = document.createElement('div');
  chart.className = 'record-week';

  // The range lives only in this render: the screen opens on the week every time.
  const buttons = RANGES.map(({ id, text }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset';
    btn.dataset.range = id;
    btn.textContent = text;
    btn.addEventListener('click', () => draw(id));
    return btn;
  });
  const switcher = document.createElement('div');
  switcher.className = 'preset-row record-range';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Range');
  switcher.append(...buttons);

  const draw = (range) => {
    const entries = range === 'month' ? monthOf(history, now) : weekOf(history, now);
    const best = Math.max(...entries.map((e) => e.blocks));
    chart.replaceChildren(...entries.map((e, i) => (
      range === 'month' ? weekColumn(e, best) : dayColumn(e, DAY_NAMES[i], best)
    )));
    buttons.forEach((btn) => {
      const on = btn.dataset.range === range;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  };
  draw('week');
  section.append(switcher, chart);

  const total = document.createElement('p');
  total.className = 'record-total';
  total.textContent = `You have finished ${plural(state.lifetimeBlocks ?? 0, 'block')} in all.`;
  section.appendChild(total);

  if (quests.length > 0) {
    const heading = document.createElement('h2');
    heading.className = 'quest-heading';
    heading.textContent = 'Quests';
    section.append(heading, questList(quests, state, world, theme));
  }

  return section;
};
