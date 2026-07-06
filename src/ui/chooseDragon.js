export const renderChooseDragon = ({ dragons, onPick }) => {
  const section = document.createElement('section');
  section.className = 'screen choose-dragon';

  const title = document.createElement('h1');
  title.textContent = 'Choose your dragon!';
  section.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'dragon-grid';

  for (const dragon of dragons) {
    const choice = document.createElement('button');
    choice.className = 'dragon-choice';
    choice.dataset.dragon = dragon.id;
    choice.innerHTML =
      `<span class="dragon-art">${dragon.levels[0].image}</span>` +
      `<span class="dragon-name">${dragon.name}</span>`;
    choice.addEventListener('click', () => onPick(dragon.id));
    grid.appendChild(choice);
  }

  section.appendChild(grid);
  return section;
};
