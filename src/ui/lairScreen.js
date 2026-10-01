import { currentLevel } from '../core/dragon.js';
import { lairOf, itemInSlot } from '../core/lair.js';
import { slots } from '../data/furniture.js';
import { art } from './art.js';
import { backButton } from './backButton.js';

// Every slot is a button, filled or empty: a filled slot must still open the picker, or
// an owned item could never be put back on display for free.
const slotButton = (slot, item, theme, onPickSlot) => {
  const btn = document.createElement('button');
  btn.className = 'lair-slot' + (item ? '' : ' is-empty');
  btn.dataset.slot = slot;
  btn.setAttribute('aria-label', item ? `Change the ${slot}` : `Add something to the ${slot}`);
  if (item) {
    // the id, not the art: a slot's contents must be identifiable whether the theme has
    // real art or is still falling back to an emoji
    btn.dataset.item = item.id;
    btn.appendChild(art(theme?.furniture?.[item.id] ?? item.fallback, item.name, item.fallback));
  } else {
    btn.textContent = '+';
  }
  btn.addEventListener('click', () => onPickSlot(slot));
  return btn;
};

export const renderLairScreen = ({ state, dragon, xp, theme, furniture, onPickSlot, onBack }) => {
  const section = document.createElement('section');
  section.className = 'screen lair';
  section.appendChild(backButton(onBack));

  const room = document.createElement('div');
  room.className = 'lair-room';

  // The wrapper, not the art node, is what CSS positions: art() returns a span for an
  // emoji and an img for a path, so a selector on either alone breaks the other.
  if (theme?.room) {
    const bg = document.createElement('div');
    bg.className = 'lair-bg';
    bg.appendChild(art(theme.room, 'Lair', theme.room));
    room.appendChild(bg);
  }

  const level = currentLevel(dragon, xp);
  const dragonNode = art(level.image, dragon.name, level.fallback);
  dragonNode.classList.add('dragon-art');
  room.appendChild(dragonNode);

  const lair = lairOf(state, state.dragonId);
  for (const slot of slots) {
    room.appendChild(slotButton(slot, itemInSlot(lair, furniture, slot), theme, onPickSlot));
  }

  section.appendChild(room);
  return section;
};
