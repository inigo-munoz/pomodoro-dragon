import { canAfford } from '../core/wallet.js';
import { backButton } from './backButton.js';
import { art } from './art.js';
import { screenTitle } from './screenTitle.js';
import { themedIcon } from './themedIcon.js';

// A pure render: opening, reading and closing the offer cannot touch coins or the flag.
// onConfirm is the only path that changes state.
export const renderUnlockLair = ({ state, price, theme, onConfirm, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen unlock';
  section.appendChild(backButton(onBack));
  section.appendChild(screenTitle('Lair'));

  const card = document.createElement('div');
  card.className = 'unlock-card';
  card.innerHTML =
    `<p class="unlock-title">Open the lair</p>` +
    `<div class="unlock-art"></div>` +
    `<p class="unlock-blurb">A room for your dragon to fill with treasures.</p>`;

  // The room she is saving for, through art() so the path goes through assetUrl() and an
  // emoji or a missing room still renders. Skipped without a room: the card stays a panel.
  if (theme?.room) card.querySelector('.unlock-art').appendChild(art(theme.room, 'Lair', theme.room));

  const affordable = canAfford(state.coins, price);
  const btn = document.createElement('button');
  btn.className = 'big-btn primary' + (affordable ? '' : ' dimmed');
  btn.dataset.action = 'unlock-confirm';
  btn.disabled = !affordable;
  // The coin goes straight into the button, not in a .price-coin wrapper: that wrapper's
  // rule outranks .big-btn .art-img by source order and would oversize it.
  btn.append('Open it ', themedIcon(theme, 'coin'), ` ${price}`);
  btn.addEventListener('click', () => { if (affordable) onConfirm(); });
  card.appendChild(btn);

  section.appendChild(card);
  return section;
};
