import { currentLevel, levelProgress } from '../core/dragon.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const idleLabel = ({ mode, remaining, workSeconds }) => {
  if (mode === 'break') return '▶ Resume break';
  return remaining < workSeconds ? '▶ Keep studying' : '▶ Start studying';
};

// During a break this shows the player's OWN dragon at its own level, resting — never a
// different creature. Swapping in the theme's sleeping-baby art made an egg appear to
// hatch when the break started and revert when it ended, and would have shown a baby to
// someone who had raised an adult. Rest is a state of your dragon, not another dragon.
const stageArt = ({ dragon, timerState }, level) => {
  const resting = timerState.mode === 'break';
  const node = art(level.image, dragon.name, level.fallback);
  if (resting && node.tagName === 'IMG') node.alt = `${dragon.name} is resting`;
  node.classList.add('dragon-art', 'alive');
  if (resting) node.classList.add('resting');
  return node;
};

export const renderMainScreen = (ctx) => {
  const { state, dragon, timerState, theme } = ctx;
  const reward = ctx.lastReward > 0 ? ctx.lastReward : 0;
  const xp = ctx.xp ?? 0;
  const level = currentLevel(dragon, xp);
  const progress = levelProgress(dragon, xp);
  const justFinishedWork =
    timerState.mode === 'work' && timerState.remaining === 0 && !timerState.running;

  const section = document.createElement('section');
  section.className = 'screen main';
  section.innerHTML =
    `<header class="top-bar">` +
      `<span class="coin-counter"><span class="coin-icon"></span> ${state.coins}</span>` +
      `<span class="mode-label">${timerState.mode === 'work' ? 'Work' : 'Break'}</span>` +
      `<button class="icon-btn${state.muted ? ' is-muted' : ''}" data-action="mute"` +
        ` aria-pressed="${state.muted}"` +
        ` aria-label="${state.muted ? 'Unmute' : 'Mute'}"></button>` +
    `</header>` +
    `<p class="timer-display">${fmt(timerState.remaining)}</p>` +
    (reward ? `<p class="session-reward">+${reward} <span class="coin-icon"></span></p>` : '') +
    `<div class="dragon-stage${timerState.mode === 'break' ? ' resting' : ''}"></div>` +
    `<div class="xp-bar"><div class="xp-fill" style="width:${Math.round(progress.ratio * 100)}%"></div></div>` +
    `<div class="controls"></div>` +
    `<footer class="nav-bar">` +
      `<button class="icon-btn" data-action="shop"></button>` +
      `<button class="icon-btn" data-action="settings"></button>` +
    `</footer>`;

  section.querySelector('.dragon-stage').appendChild(stageArt(ctx, level));

  section.querySelector('.coin-icon').appendChild(themedIcon(theme, 'coin'));
  section.querySelector('.session-reward .coin-icon')?.appendChild(themedIcon(theme, 'coin'));
  // Two icons, not one dimmed icon: the mute art is a speaker that is already crossed
  // out, so on its own it reads "silenced" in both states. Themes without their own
  // sound art fall back to the default set's emoji rather than showing the wrong symbol.
  section.querySelector('[data-action="mute"]')
    .appendChild(themedIcon(theme, state.muted ? 'mute' : 'sound'));
  section.querySelector('[data-action="shop"]').appendChild(themedIcon(theme, 'shop'));
  section.querySelector('[data-action="settings"]').appendChild(themedIcon(theme, 'settings'));

  const controls = section.querySelector('.controls');
  if (justFinishedWork) {
    controls.appendChild(button('Break', 'break', ctx.onBreak, 'primary', themedIcon(theme, 'break')));
  } else if (timerState.running) {
    controls.appendChild(button('⏸ Pause', 'pause', ctx.onPause, 'primary'));
  } else {
    controls.appendChild(button(idleLabel(timerState), 'start', ctx.onStart, 'primary'));
  }

  section.querySelector('[data-action="mute"]').addEventListener('click', ctx.onToggleMute);
  section.querySelector('[data-action="shop"]').addEventListener('click', ctx.onShop);
  section.querySelector('[data-action="settings"]').addEventListener('click', ctx.onSettings);
  return section;
};

// A plain tick only changes the clock. Patching it in place (rather than rebuilding the
// screen) keeps the dragon <img> mounted, so its float/breathe animation is not restarted
// at 0% every second, which read as a jump.
export const updateMainScreen = (section, { timerState }) => {
  const display = section?.querySelector('.timer-display');
  if (display) display.textContent = fmt(timerState.remaining);
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
