import { currentLevel, levelProgress } from '../core/dragon.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const renderMainScreen = (ctx) => {
  const { state, dragon, timerState, theme } = ctx;
  const level = currentLevel(dragon, state.xp);
  const progress = levelProgress(dragon, state.xp);
  const justFinishedWork =
    timerState.mode === 'work' && timerState.remaining === 0 && !timerState.running;

  const section = document.createElement('section');
  section.className = 'screen main';
  section.innerHTML =
    `<header class="top-bar">` +
      `<span class="coin-counter"><span class="coin-icon"></span> ${state.coins}</span>` +
      `<span class="mode-label">${timerState.mode === 'work' ? 'Work' : 'Break'}</span>` +
      `<button class="icon-btn" data-action="mute"></button>` +
    `</header>` +
    `<div class="dragon-stage"></div>` +
    `<div class="xp-bar"><div class="xp-fill" style="width:${Math.round(progress.ratio * 100)}%"></div></div>` +
    `<p class="timer-display">${fmt(timerState.remaining)}</p>` +
    `<div class="controls"></div>` +
    `<footer class="nav-bar">` +
      `<button class="icon-btn" data-action="shop"></button>` +
      `<button class="icon-btn" data-action="settings"></button>` +
    `</footer>`;

  const dragonArt = art(level.image, dragon.name, level.fallback);
  dragonArt.classList.add('dragon-art', 'alive');
  section.querySelector('.dragon-stage').appendChild(dragonArt);

  section.querySelector('.coin-icon').appendChild(themedIcon(theme, 'coin'));
  section.querySelector('[data-action="mute"]').appendChild(themedIcon(theme, 'mute'));
  section.querySelector('[data-action="shop"]').appendChild(themedIcon(theme, 'shop'));
  section.querySelector('[data-action="settings"]').appendChild(themedIcon(theme, 'settings'));

  const controls = section.querySelector('.controls');
  if (justFinishedWork) {
    controls.appendChild(button('Break', 'break', ctx.onBreak, 'primary', themedIcon(theme, 'break')));
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

const button = (label, action, handler, cls = '', iconNode = null) => {
  const b = document.createElement('button');
  b.className = `big-btn ${cls}`.trim();
  b.dataset.action = action;
  b.textContent = label;
  if (iconNode) b.prepend(iconNode, ' ');
  b.addEventListener('click', handler);
  return b;
};
