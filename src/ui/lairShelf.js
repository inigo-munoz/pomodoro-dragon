import { itemsForSlot, lairOf, itemInSlot } from '../core/lair.js';
import { canAfford } from '../core/wallet.js';
import { slots } from '../data/furniture.js';
import { art } from './art.js';
import { slotName } from './slotNames.js';
import { themedIcon } from './themedIcon.js';

// What each state of a piece says to assistive tech: what a tap does and what it costs.
const labelFor = (state, item) => {
  if (state === 'placed') return `${item.name}, already in the room`;
  if (state === 'owned') return `Put the ${item.name} in the room`;
  if (state === 'affordable') return `Buy the ${item.name} for ${item.price} coins`;
  return `${item.name} costs ${item.price} coins, not enough coins yet`;
};

const cellFor = (item, state, theme, { onBuy, onPlace }) => {
  const cell = document.createElement('button');
  cell.className = 'food-card shelf-item' + (state === 'locked' ? ' dimmed' : '');
  cell.dataset.shelfItem = item.id;
  cell.dataset.state = state;
  cell.disabled = state === 'locked';
  cell.setAttribute('aria-label', labelFor(state, item));

  const icon = document.createElement('span');
  icon.className = 'food-icon';
  icon.appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
  const name = document.createElement('span');
  name.className = 'food-name';
  name.textContent = item.name;
  cell.append(icon, name);

  // Owned pieces carry no price: she already paid, and a price would read as a charge.
  if (state === 'placed' || state === 'owned') {
    const tag = document.createElement('span');
    tag.className = 'food-owned';
    tag.textContent = state === 'placed' ? 'In the room' : 'Yours';
    cell.appendChild(tag);
  } else {
    const price = document.createElement('span');
    price.className = 'food-price';
    const coin = document.createElement('span');
    coin.className = 'price-coin';
    coin.appendChild(themedIcon(theme, 'coin'));
    price.append(coin, ` ${item.price}`);
    cell.appendChild(price);
  }

  // Each branch is exclusive and guarded by state: the core throws on buying what is
  // owned or placing what is not, so a tap must never reach the wrong one.
  cell.addEventListener('click', () => {
    if (state === 'owned') onPlace(item);
    else if (state === 'affordable') onBuy(item);
  });
  return cell;
};

// The whole catalogue under the room, one row per slot. Pure presentation: ownership and
// the purse are read from `state`, and the two callbacks are the only way anything changes.
export const renderLairShelf = ({ state, furniture, theme, onBuy, onPlace }) => {
  const shelf = document.createElement('div');
  shelf.className = 'lair-shelf';
  const lair = lairOf(state, state.dragonId);

  for (const slot of slots) {
    const row = document.createElement('div');
    row.className = 'shelf-row';
    row.dataset.shelfSlot = slot;

    const label = document.createElement('span');
    label.className = 'shelf-label';
    label.textContent = slotName(slot);
    row.appendChild(label);

    const placed = itemInSlot(lair, furniture, slot);
    for (const item of itemsForSlot(furniture, slot)) {
      let cellState;
      if (placed?.id === item.id) cellState = 'placed';
      else if (lair.owned.includes(item.id)) cellState = 'owned';
      else cellState = canAfford(state.coins, item.price) ? 'affordable' : 'locked';
      row.appendChild(cellFor(item, cellState, theme, { onBuy, onPlace }));
    }
    shelf.appendChild(row);
  }
  return shelf;
};
