export const showLevelUp = (dragon, level, onAudio) => {
  if (onAudio) onAudio();
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML =
    `<div class="level-up-card">` +
    `<p class="level-up-title">Level up!</p>` +
    `<div class="level-up-art">${level.image}</div>` +
    `<p class="level-up-sub">${dragon.name} is now level ${level.level}</p>` +
    `</div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
};
