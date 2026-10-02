import { currentLevel, levelProgress } from '../core/dragon.js';
import { art } from './art.js';
import { themedIcon } from './themedIcon.js';
import { isBreak } from '../core/timer.js';

const fmt = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const idleLabel = ({ mode, remaining, workSeconds }) => {
  if (isBreak(mode)) return '▶ Resume break';
  return remaining < workSeconds ? '▶ Keep studying' : '▶ Start studying';
};

// During a break this shows the player's OWN dragon at its own level, resting — never a
// different creature. Swapping in the theme's sleeping-baby art made an egg appear to
// hatch when the break started and revert when it ended, and would have shown a baby to
// someone who had raised an adult. Rest is a state of your dragon, not another dragon.
const stageArt = ({ dragon, timerState }, level) => {
  const resting = isBreak(timerState.mode);
  const node = art(level.image, dragon.name, level.fallback);
  if (resting && node.tagName === 'IMG') node.alt = `${dragon.name} is resting`;
  node.classList.add('dragon-art', 'alive');
  if (resting) node.classList.add('resting');
  return node;
};

const MODE_LABELS = { work: 'Work', break: 'Break', longBreak: 'Long break' };

// Progress through the current cycle. A non-zero multiple means the long break is due or
// running, so every dot is filled rather than wrapping back to empty. With no usable cycle
// length there is nothing to count, so no row is drawn.
// A work block parked at 0:00 has been earned even though advance() has not run yet: it
// only runs when Break is tapped. The bell and the filled dot have to land together, or the
// dot looks like it belongs to the tap instead of to the work.
const earnedSessions = ({ mode, remaining, running, completedWork = 0 }) =>
  mode === 'work' && remaining === 0 && !running ? completedWork + 1 : completedWork;

const sessionDots = (timerState) => {
  const total = timerState.sessionsBeforeLongBreak;
  if (!(total > 0)) return '';
  const earned = earnedSessions(timerState);
  const inCycle = earned % total;
  const done = earned > 0 && inCycle === 0 ? total : inCycle;
  const current = Math.min(done + 1, total);
  const dots = Array.from({ length: total }, (_, i) =>
    `<span class="session-dot${i < done ? ' is-done' : ''}"></span>`).join('');
  return `<div class="session-dots" aria-label="Session ${current} of ${total}">${dots}</div>`;
};

export const renderMainScreen = (ctx) => {
  const { state, dragon, timerState, theme } = ctx;
  const reward = ctx.lastReward > 0 ? ctx.lastReward : 0;
  const xp = ctx.xp ?? 0;
  const level = currentLevel(dragon, xp);
  const progress = levelProgress(dragon, xp);
  // The button is always rendered and always calls onLair; whether it opens the room or
  // the offer is routed in app.js. Locked is only presentation, so no second callback.
  const lairLocked = !state.lairUnlocked;
  const justFinishedWork =
    timerState.mode === 'work' && timerState.remaining === 0 && !timerState.running;

  const section = document.createElement('section');
  section.className = 'screen main';
  section.innerHTML =
    `<header class="top-bar">` +
      `<span class="coin-counter"><span class="coin-icon"></span> ${state.coins}</span>` +
      `<span class="mode-label">${MODE_LABELS[timerState.mode] ?? 'Break'}</span>` +
      `<button class="icon-btn${state.muted ? ' is-muted' : ''}" data-action="mute"` +
        ` aria-pressed="${state.muted}"` +
        ` aria-label="${state.muted ? 'Unmute' : 'Mute'}"></button>` +
    `</header>` +
    sessionDots(timerState) +
    `<p class="timer-display">${fmt(timerState.remaining)}</p>` +
    (reward ? `<p class="session-reward">+${reward} <span class="coin-icon"></span></p>` : '') +
    `<div class="dragon-stage${isBreak(timerState.mode) ? ' resting' : ''}"></div>` +
    `<div class="xp-bar"><div class="xp-fill" style="width:${Math.round(progress.ratio * 100)}%"></div></div>` +
    `<div class="controls"></div>` +
    `<footer class="nav-bar">` +
      `<button class="icon-btn" data-action="shop"></button>` +
      `<button class="icon-btn${lairLocked ? ' is-locked' : ''}" data-action="lair"` +
        ` aria-label="${lairLocked ? `Lair, locked, ${ctx.lairPrice} coins` : 'Lair'}">` +
        // lairPrice is the one new interpolation: a numeric literal from config, never the save.
        (lairLocked ? `<span class="lock-price"><span class="price-coin"></span> ${ctx.lairPrice}</span>` : '') +
      `</button>` +
      `<button class="icon-btn" data-action="settings"></button>` +
    `</footer>`;

  section.querySelector('.dragon-stage').appendChild(stageArt(ctx, level));

  section.querySelector('.coin-icon').appendChild(themedIcon(theme, 'coin'));
  section.querySelector('.session-reward .coin-icon')?.appendChild(themedIcon(theme, 'coin'));
  // Always the sound icon: muted is the same speaker with a CSS stroke through it
  // (.icon-btn.is-muted::after), so the symbol stays one thing the child recognises
  // and a theme only has to supply one piece of art for the button.
  section.querySelector('[data-action="mute"]')
    .appendChild(themedIcon(theme, 'sound'));
  section.querySelector('[data-action="shop"]').appendChild(themedIcon(theme, 'shop'));
  section.querySelector('[data-action="lair"]').appendChild(themedIcon(theme, 'lair'));
  section.querySelector('[data-action="settings"]').appendChild(themedIcon(theme, 'settings'));
  section.querySelector('.lock-price .price-coin')?.appendChild(themedIcon(theme, 'coin'));

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
  section.querySelector('[data-action="lair"]').addEventListener('click', ctx.onLair);
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
