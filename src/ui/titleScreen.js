// The front door. It renders before any dragon has been chosen, so it runs on the default
// palette (no backdrop, emoji icons) and deliberately takes no state and no theme: nothing
// here may assume a dragon exists.
export const renderTitleScreen = ({ onStart, onInstructions }) => {
  const section = document.createElement('section');
  section.className = 'screen title';

  // The name of the app, not a chapter watermark: it is the hero, so it is not screenTitle().
  const name = document.createElement('h1');
  name.className = 'app-title';
  name.textContent = 'Pomodoro Fantasy';
  section.appendChild(name);

  const start = document.createElement('button');
  start.className = 'big-btn primary';
  start.dataset.action = 'start-app';
  start.textContent = 'Start';
  start.addEventListener('click', onStart);
  section.appendChild(start);

  const instructions = document.createElement('button');
  instructions.className = 'title-link';
  instructions.dataset.action = 'instructions';
  instructions.textContent = 'How it works';
  instructions.addEventListener('click', onInstructions);
  section.appendChild(instructions);

  return section;
};
