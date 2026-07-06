import { art } from './art.js';

export const showLevelUp = (dragon, level, onAudio) => {
  if (onAudio) onAudio();
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML =
    `<div class="level-up-card">` +
    `<p class="level-up-title">Level up!</p>` +
    `<div class="level-up-art"></div>` +
    `<p class="level-up-sub">${dragon.name} is now level ${level.level}</p>` +
    `</div>`;
  const artBox = overlay.querySelector('.level-up-art');
  artBox.appendChild(art(level.image, dragon.name, level.fallback));
  for (const [i, pos] of [['0%', '0%'], ['80%', '10%'], ['20%', '75%'], ['70%', '70%']].entries()) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = '✨';
    s.style.left = pos[0];
    s.style.top = pos[1];
    s.style.animationDelay = `${i * 0.12}s`;
    artBox.appendChild(s);
  }
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
};
