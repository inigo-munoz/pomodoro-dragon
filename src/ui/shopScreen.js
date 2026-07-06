import { canAfford } from '../core/wallet.js';
import { backButton } from './backButton.js';

export const renderShopScreen = ({ state, foods, onBuy, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen shop';

  section.appendChild(backButton(onBack));

  const grid = document.createElement('div');
  grid.className = 'food-grid';

  for (const food of foods) {
    const affordable = canAfford(state.coins, food.price);
    const card = document.createElement('button');
    card.className = 'food-card' + (affordable ? '' : ' dimmed');
    card.dataset.food = food.id;
    card.disabled = !affordable;
    card.innerHTML =
      `<span class="food-icon">${food.icon}</span>` +
      `<span class="food-name">${food.name}</span>` +
      `<span class="food-price">🪙 ${food.price}</span>` +
      `<span class="food-xp">+${food.xp} XP</span>`;
    card.addEventListener('click', () => {
      if (affordable) onBuy(food);
    });
    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
};
