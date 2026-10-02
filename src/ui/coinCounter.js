import { themedIcon } from './themedIcon.js';

// How many coins she has, with the themed coin beside it. Deliberately dumb: no state and
// no callbacks, so any screen that shows prices can say what she can actually spend.
// `coins` is a number from the save, written with textContent so it is never parsed as HTML.
export const coinCounter = (coins, theme) => {
  const counter = document.createElement('span');
  counter.className = 'coin-counter';
  const icon = document.createElement('span');
  icon.className = 'coin-icon';
  icon.appendChild(themedIcon(theme, 'coin'));
  counter.append(icon, ` ${coins}`);
  return counter;
};
