import { art } from './art.js';
import { screenTitle } from './screenTitle.js';

export const renderChooseDragon = ({ dragons, onPick, currentId }) => {
  const section = document.createElement('section');
  section.className = 'screen choose-dragon';

  section.appendChild(screenTitle('Dragons'));

  const lead = document.createElement('p');
  lead.className = 'screen-lead';
  lead.textContent = 'Choose your dragon!';
  section.appendChild(lead);

  const grid = document.createElement('div');
  grid.className = 'dragon-grid';

  for (const dragon of dragons) {
    const choice = document.createElement('button');
    choice.className = 'dragon-choice' + (dragon.id === currentId ? ' current' : '');
    choice.dataset.dragon = dragon.id;
    choice.innerHTML =
      `<span class="dragon-art"></span>` +
      `<span class="dragon-name">${dragon.name}</span>`;
    const lvl0 = dragon.levels[0];
    choice.querySelector('.dragon-art')
      .appendChild(art(lvl0.image, dragon.name, lvl0.fallback));
    choice.addEventListener('click', () => onPick(dragon.id));
    grid.appendChild(choice);
  }

  section.appendChild(grid);
  return section;
};
