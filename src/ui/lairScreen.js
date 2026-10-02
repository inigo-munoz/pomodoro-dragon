import { currentLevel } from '../core/dragon.js';
import { lairOf, itemInSlot } from '../core/lair.js';
import { slots } from '../data/furniture.js';
import { art } from './art.js';
import { defaultRoom } from '../core/theme.js';
import { backButton } from './backButton.js';
import { coinCounter } from './coinCounter.js';
import { renderLairShelf } from './lairShelf.js';
import { screenTitle } from './screenTitle.js';
import { slotName } from './slotNames.js';

// A slot only displays. Everything that changes the room happens on the shelf below it, so
// a slot is a div: a button here would promise a tap that does nothing. The dashed outline
// of an empty one stays, because it shows where a piece will go.
const slotView = (slot, item, theme) => {
  const el = document.createElement('div');
  el.className = 'lair-slot' + (item ? '' : ' is-empty');
  el.dataset.slot = slot;
  const place = slotName(slot);
  el.setAttribute('aria-label', item ? `${item.name} on the ${place}` : `Nothing on the ${place} yet`);
  if (item) {
    // the id, not the art: a slot's contents must be identifiable whether the theme has
    // real art or is still falling back to an emoji
    el.dataset.item = item.id;
    el.appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
  }
  return el;
};

export const renderLairScreen = ({ state, dragon, xp, theme, furniture, onBuy, onPlace, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen lair';
  // Back on the left, what she can spend on the right: the shelf below has prices.
  const bar = document.createElement('div');
  bar.className = 'screen-bar';
  bar.append(backButton(onBack), coinCounter(state.coins, theme));
  section.appendChild(bar);
  section.appendChild(screenTitle('Lair'));

  const room = document.createElement('div');
  room.className = 'lair-room';

  // The wrapper, not the art node, is what CSS positions: art() returns a span for an
  // emoji and an img for a path, so a selector on either alone breaks the other.
  if (theme?.room) {
    const bg = document.createElement('div');
    bg.className = 'lair-bg';
    bg.appendChild(art(theme.room, '', defaultRoom));
    room.appendChild(bg);
  }

  const level = currentLevel(dragon, xp);
  const dragonNode = art(level.image, dragon.name, level.fallback);
  dragonNode.classList.add('dragon-art');
  room.appendChild(dragonNode);

  const lair = lairOf(state, state.dragonId);
  for (const slot of slots) {
    room.appendChild(slotView(slot, itemInSlot(lair, furniture, slot), theme));
  }

  section.appendChild(room);
  section.appendChild(renderLairShelf({ state, furniture, theme, onBuy, onPlace }));
  return section;
};
