import { config } from './data/config.js';
import { dragons, getDragon } from './data/dragons.js';
import { foods } from './data/foods.js';
import { createStore } from './store/store.js';
import { localStorageBackend } from './store/localStorageBackend.js';
import { createAudio } from './audio/audio.js';
import { tones } from './audio/tones.js';
import { createScreenManager } from './ui/screens.js';
import { renderChooseDragon } from './ui/chooseDragon.js';
import { renderMainScreen } from './ui/mainScreen.js';
import { renderShopScreen } from './ui/shopScreen.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
import { showLevelUp } from './ui/levelUp.js';
import { createTimerState, start, pause, tick, advance } from './core/timer.js';
import { grantWorkReward, buyFood, leveledUp, dragonXp } from './core/game.js';
import { currentLevel } from './core/dragon.js';
import { resolveTheme, applyPalette } from './core/theme.js';

export const createApp = (root, { now = () => Date.now() } = {}) => {
  const store = createStore(localStorageBackend, config);
  const audio = createAudio({ music: null, effects: {}, tones }); // music assets still pending
  let state = store.load();
  audio.setMuted(state.muted);
  // Settings-derived durations are recomputed; only the volatile part is restored.
  let timerState = { ...createTimerState(state.settings), ...state.timer };

  const save = () => store.save(state);

  // Persist only the volatile timer fields so a reload can resume the session.
  const persistTimer = () => {
    const { mode, running, remaining, endsAt } = timerState;
    state = { ...state, timer: { mode, running, remaining, endsAt } };
    save();
  };

  const render = () => {
    if (!state.dragonId) {
      screens.set('choose', renderChooseDragon({ dragons, onPick, currentId: state.dragonId }));
      return screens.show('choose');
    }
    const dragon = getDragon(state.dragonId);
    const theme = resolveTheme(dragon.themeId);
    applyPalette(theme.palette);
    screens.set('main', renderMainScreen({
      state, dragon, xp: dragonXp(state), timerState, theme,
      onStart, onPause, onBreak, onShop, onSettings, onToggleMute,
    }));
    screens.show('main');
  };

  // --- handlers ---
  const onPick = (id) => { state = { ...state, dragonId: id }; save(); render(); };

  const onChangeDragon = () => {
    screens.set('choose', renderChooseDragon({ dragons, onPick, currentId: state.dragonId }));
    screens.show('choose');
  };

  const onStart = () => {
    timerState = start(timerState, now());
    persistTimer();
    audio.unlock();
    audio.playMusic();
    render();
  };
  const onPause = () => { timerState = pause(timerState, now()); persistTimer(); render(); };

  const onBreak = () => {
    timerState = start(advance(timerState), now());
    persistTimer();
    render();
  };

  const onShop = () => {
    const dragon = getDragon(state.dragonId);
    const theme = resolveTheme(dragon.themeId);
    screens.set('shop', renderShopScreen({
      state, foods, theme,
      onBuy: (food) => {
        const oldXp = dragonXp(state);
        state = buyFood(state, food);
        save();
        audio.playEffect('eat');
        const newXp = dragonXp(state);
        if (leveledUp(dragon, oldXp, newXp)) {
          showLevelUp(dragon, currentLevel(dragon, newXp),
            () => audio.playEffect('levelup'));
        }
        onShop(); // re-render shop with updated coins/xp
      },
      onBack: render,
    }));
    screens.show('shop');
  };

  const onSettings = () => {
    screens.set('settings', renderSettingsScreen({
      settings: state.settings, config, onChangeDragon,
      onChange: (settings) => {
        state = { ...state, settings };
        if (!timerState.running) {
          const workSeconds = settings.workMinutes * 60;
          const breakSeconds = settings.breakMinutes * 60;
          const atFreshWorkStart =
            timerState.mode === 'work' && timerState.remaining === timerState.workSeconds;
          timerState = {
            ...timerState,
            workSeconds,
            breakSeconds,
            remaining: atFreshWorkStart ? workSeconds : timerState.remaining,
          };
        }
        persistTimer();
        onSettings();
      },
      onBack: render,
    }));
    screens.show('settings');
  };

  const onToggleMute = () => {
    audio.unlock();
    const muted = audio.toggleMute();
    state = { ...state, muted };
    save();
    if (muted) audio.stopMusic(); else audio.playMusic();
    render();
  };

  const screens = createScreenManagerWithCache(root);

  // --- per-second driver ---
  const handleTick = () => {
    if (!timerState.running) return;
    const result = tick(timerState, now());
    timerState = result.state;
    if (result.completed) {
      audio.playEffect('bell');
      if (timerState.mode === 'work') {
        // work finished → grant coins; stays at 0:00 so the ☕ Break button shows
        state = grantWorkReward(state, config, timerState.workSeconds / 60);
      } else {
        // break finished → return to a fresh idle work block (▶ Start shows)
        timerState = advance(timerState);
      }
      persistTimer();
    }
    if (screens.current === 'main') render();
  };

  setInterval(handleTick, 1000);
  handleTick(); // settle a session restored from a previous run (completes it once)

  render();
};

// screen manager with a small cache so we can pre-build then show by name
const createScreenManagerWithCache = (root) => {
  const cache = {};
  const mgr = createScreenManager(root, cache);
  let current = null;
  return {
    set: (name, el) => { cache[name] = el; },
    show: (name) => { current = name; mgr.show(name); },
    get current() { return current; },
  };
};
