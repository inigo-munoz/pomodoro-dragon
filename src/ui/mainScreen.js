import { currentLevel, levelProgress } from '../core/dragon.js';
import { art } from './art.js';

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const renderMainScreen = (ctx) => {
  const { state, dragon, timerState } = ctx;
  const level = currentLevel(dragon, state.xp);
  const progress = levelProgress(dragon, state.xp);
  const justFinishedWork =
    timerState.mode === 'work' && timerState.remaining === 0 && !timerState.running;

  const section = document.createElement('section');
  section.className = 'screen main';
  section.innerHTML =
    `<header class="top-bar">` +
      `<span class="coin-counter">🪙 ${state.coins}</span>` +
      `<span class="mode-label">${timerState.mode === 'work' ? 'Work' : 'Break'}</span>` +
      `<button class="icon-btn" data-action="mute">🔇</button>` +
    `</header>` +
    `<div class="dragon-stage"></div>` +
    `<div class="xp-bar"><div class="xp-fill" style="width:${Math.round(progress.ratio * 100)}%"></div></div>` +
    `<p class="timer-display">${fmt(timerState.remaining)}</p>` +
    `<div class="controls"></div>` +
    `<footer class="nav-bar">` +
      `<button class="icon-btn" data-action="shop">🍎</button>` +
      `<button class="icon-btn" data-action="settings">⚙️</button>` +
    `</footer>`;

  const dragonArt = art(level.image, dragon.name, level.fallback);
  dragonArt.classList.add('dragon-art', 'alive');
  section.querySelector('.dragon-stage').appendChild(dragonArt);

  const controls = section.querySelector('.controls');
  if (justFinishedWork) {
    controls.appendChild(button('☕ Break', 'break', ctx.onBreak, 'primary'));
  } else if (timerState.running) {
    controls.appendChild(button('⏸ Pause', 'pause', ctx.onPause, 'primary'));
  } else {
    controls.appendChild(button('▶ Start studying', 'start', ctx.onStart, 'primary'));
  }

  section.querySelector('[data-action="mute"]').addEventListener('click', ctx.onToggleMute);
  section.querySelector('[data-action="shop"]').addEventListener('click', ctx.onShop);
  section.querySelector('[data-action="settings"]').addEventListener('click', ctx.onSettings);
  return section;
};

const button = (label, action, handler, cls = '') => {
  const b = document.createElement('button');
  b.className = `big-btn ${cls}`.trim();
  b.dataset.action = action;
  b.textContent = label;
  b.addEventListener('click', handler);
  return b;
};
