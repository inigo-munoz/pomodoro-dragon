import { config } from './data/config.js';
import { dragons, getDragon } from './data/dragons.js';
import { foods } from './data/foods.js';
import { createStore } from './store/store.js';
import { localStorageBackend } from './store/localStorageBackend.js';
import { createAudio } from './audio/audio.js';
import { createScreenManager } from './ui/screens.js';
import { renderChooseDragon } from './ui/chooseDragon.js';
import { renderMainScreen } from './ui/mainScreen.js';
import { renderShopScreen } from './ui/shopScreen.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
import { showLevelUp } from './ui/levelUp.js';
import { createTimerState, start, pause, tick, advance } from './core/timer.js';
import { grantWorkReward, buyFood, leveledUp } from './core/game.js';
import { currentLevel } from './core/dragon.js';

export const createApp = (root) => {
  const store = createStore(localStorageBackend, config);
  const audio = createAudio({ music: null, effects: {} }); // wire real assets later
  let state = store.load();
  audio.setMuted(state.muted);
  let timerState = createTimerState(state.settings);

  const save = () => store.save(state);

  const render = () => {
    if (!state.dragonId) {
      screens.set('choose', renderChooseDragon({ dragons, onPick }));
      return screens.show('choose');
    }
    const dragon = getDragon(state.dragonId);
    screens.set('main', renderMainScreen({
      state, dragon, timerState,
      onStart, onPause, onBreak, onShop, onSettings, onToggleMute,
    }));
    screens.show('main');
  };

  // --- handlers ---
  const onPick = (id) => { state = { ...state, dragonId: id }; save(); render(); };

  const onStart = () => {
    timerState = start(timerState);
    audio.playMusic();
    render();
  };
  const onPause = () => { timerState = pause(timerState); render(); };

  const onBreak = () => { timerState = advance(timerState); timerState = start(timerState); render(); };

  const onShop = () => {
    const dragon = getDragon(state.dragonId);
    screens.set('shop', renderShopScreen({
      state, foods,
      onBuy: (food) => {
        const oldXp = state.xp;
        state = buyFood(state, food);
        save();
        audio.playEffect('eat');
        if (leveledUp(dragon, oldXp, state.xp)) {
          showLevelUp(dragon, currentLevel(dragon, state.xp),
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
      settings: state.settings, config,
      onChange: (settings) => {
        state = { ...state, settings };
        save();
        if (!timerState.running) timerState = createTimerState(settings);
        onSettings();
      },
      onBack: render,
    }));
    screens.show('settings');
  };

  const onToggleMute = () => {
    const muted = audio.toggleMute();
    state = { ...state, muted };
    save();
    if (muted) audio.stopMusic(); else audio.playMusic();
    render();
  };

  const screens = createScreenManagerWithCache(root);

  // --- per-second driver ---
  setInterval(() => {
    if (!timerState.running) return;
    const result = tick(timerState);
    timerState = result.state;
    if (result.completed && timerState.mode === 'work') {
      state = grantWorkReward(state, config);
      save();
      audio.playEffect('bell');
    }
    render();
  }, 1000);

  render();
};

// screen manager with a small cache so we can pre-build then show by name
const createScreenManagerWithCache = (root) => {
  const cache = {};
  const mgr = createScreenManager(root, cache);
  return { set: (name, el) => { cache[name] = el; }, show: mgr.show };
};
