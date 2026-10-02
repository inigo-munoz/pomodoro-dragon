import { config } from '../data/config.js';
import { backButton } from './backButton.js';
import { screenTitle } from './screenTitle.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Short and plain, for a child reading with an adult. The block, break and cycle lengths are
// the child's own settings, so they are read from `settings` (the saved shape); only the lair
// price and the coin rate are fixed rules and come from config. Nothing here may scold: the
// tests forbid it, and quests are described without a target or a deadline.
const defaultSettings = () => ({ ...config.durations.default, musicStyle: config.musicStyles[0] });

const steps = (settings) => [
  ['Work, then rest',
    `Work for ${plural(settings.workMinutes, 'minute')}, then take a ${plural(settings.breakMinutes, 'minute')} break. ` +
    'You can change how long both last in Settings.'],
  ['The long break',
    `After ${plural(settings.sessionsBeforeLongBreak, 'work block')} the break is a long one, ${plural(settings.longBreakMinutes, 'minute')}. ` +
    'You can change how many blocks and how long the long break lasts in Settings.'],
  ['Coins',
    `Every finished work block earns coins: ${plural(config.coinsPerMinute, 'coin')} for each minute you worked.`],
  ['Feed your dragon',
    'Spend coins on food in the Shop. Food gives your dragon XP, and with enough XP it grows into its next stage.'],
  ['The Lair',
    `Save up ${plural(config.lairUnlockPrice, 'coin')} to open the Lair. Then buy furniture from the shelf and place it in your dragon's room.`],
  ['Quests',
    'Finishing work blocks, decorating the Lair and growing your dragon complete quests. They are shown on the Record, and each one pays coins.'],
  ['The Record',
    'The Record keeps the work blocks you finished each day.'],
];

export const renderInstructionsScreen = ({ onBack, settings = defaultSettings() }) => {
  const section = document.createElement('section');
  section.className = 'screen instructions';

  const bar = document.createElement('div');
  bar.className = 'screen-bar';
  bar.appendChild(backButton(onBack));
  section.appendChild(bar);
  section.appendChild(screenTitle('How it works'));

  const list = document.createElement('ol');
  list.className = 'instruction-list';
  for (const [heading, body] of steps(settings)) {
    const item = document.createElement('li');
    item.className = 'instruction-step';
    const h = document.createElement('h2');
    h.textContent = heading;
    const p = document.createElement('p');
    p.textContent = body;
    item.append(h, p);
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
};
