import { itemsForSlot, lairOf } from '../core/lair.js';
import { canAfford } from '../core/wallet.js';
import { backButton } from './backButton.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';

// Reuses the shop's grid and card classes so "too expensive" looks exactly like the
// affordance the child already knows. Names come from the static catalogue, never from
// saved state, so interpolating them into innerHTML (as shopScreen does) is safe.
export const renderSlotPicker = ({ state, slot, furniture, theme, onChoose, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen picker';
  section.appendChild(backButton(onBack));

  const { owned } = lairOf(state, state.dragonId);
  const grid = document.createElement('div');
  grid.className = 'food-grid';

  for (const item of itemsForSlot(furniture, slot)) {
    // An owned item is free to put back, whatever the purse holds.
    const isOwned = owned.includes(item.id);
    const available = isOwned || canAfford(state.coins, item.price);
    const card = document.createElement('button');
    card.className = 'food-card' + (available ? '' : ' dimmed');
    card.dataset.item = item.id;
    card.disabled = !available;
    card.innerHTML =
      `<span class="food-icon"></span>` +
      `<span class="food-name">${item.name}</span>` +
      (isOwned
        ? `<span class="food-owned">Owned</span>`
        : `<span class="food-price"><span class="price-coin"></span> ${item.price}</span>`);
    card.querySelector('.food-icon')
      .appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
    card.querySelector('.price-coin')?.appendChild(themedIcon(theme, 'coin'));
    card.addEventListener('click', () => {
      if (available) onChoose(item);
    });
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
};
