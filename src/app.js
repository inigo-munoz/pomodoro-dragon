import { config } from './data/config.js';
import { dragons, getDragon } from './data/dragons.js';
import { foods } from './data/foods.js';
import { furniture } from './data/furniture.js';
import { createStore } from './store/store.js';
import { localStorageBackend } from './store/localStorageBackend.js';
import { createAudio } from './audio/audio.js';
import { tones } from './audio/tones.js';
import { assetUrl } from './ui/art.js';
import { createScreenManager } from './ui/screens.js';
import { renderChooseDragon } from './ui/chooseDragon.js';
import { renderMainScreen, updateMainScreen } from './ui/mainScreen.js';
import { renderShopScreen } from './ui/shopScreen.js';
import { renderLairScreen } from './ui/lairScreen.js';
import { renderSlotPicker } from './ui/slotPicker.js';
import { renderUnlockLair } from './ui/unlockLairScreen.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
import { showLevelUp } from './ui/levelUp.js';
import { createTimerState, start, pause, tick, advance, secondsForMode } from './core/timer.js';
import { grantWorkReward, buyFood, leveledUp, dragonXp } from './core/game.js';
import { currentLevel } from './core/dragon.js';
import { lairOf, buyFurniture, placeItem, unlockLair } from './core/lair.js';
import { resolveTheme, applyPalette, applyBackdrop } from './core/theme.js';

export const createApp = (root, { now = () => Date.now(), audioFactory = createAudio } = {}) => {
  const store = createStore(localStorageBackend, config);
  // Music paths are authored from the site root like the art, so they must be resolved
  // against the deploy base too, or the tracks 404 when served from a subpath.
  let state = store.load();
  // A save can name a style this build no longer ships; fall back rather than hand the
  // audio an undefined playlist and lose the music silently.
  const playlistFor = (style) =>
    (config.music[style] ?? config.music[config.musicStyles[0]]).map(assetUrl);
  const audio = audioFactory({ music: playlistFor(state.settings.musicStyle), effects: {}, tones });
  audio.setMuted(state.muted);
  // Settings-derived durations are recomputed; only the volatile part is restored.
  let lastReward = null; // coins from the block just completed, shown until the next one starts
  // The saved countdown can outlive the length it belongs to: durations come from the
  // settings, `remaining` comes from the save, and nothing tied them together. Clamp on
  // load so a state written by an older build cannot start the timer out at fourteen
  // minutes inside a one-minute block.
  const restored = { ...createTimerState(state.settings), ...state.timer };
  let timerState = {
    ...restored,
    remaining: Math.min(restored.remaining, secondsForMode(restored, restored.mode)),
  };

  const save = () => store.save(state);

  // Persist only the volatile timer fields so a reload can resume the session.
  const persistTimer = () => {
    const { mode, running, remaining, endsAt, completedWork } = timerState;
    state = { ...state, timer: { mode, running, remaining, endsAt, completedWork } };
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
    applyBackdrop(theme.backdrop);
    screens.set('main', renderMainScreen({
      state, dragon, xp: dragonXp(state), timerState, lastReward, theme,
      lairPrice: config.lairUnlockPrice,
      onStart, onPause, onBreak, onShop, onLair, onSettings, onToggleMute,
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
    lastReward = null;
    timerState = start(timerState, now());
    persistTimer();
    audio.unlock();
    audio.playMusic();
    render();
  };
  const onPause = () => { timerState = pause(timerState, now()); persistTimer(); render(); };

  const onBreak = () => {
    lastReward = null;
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

  // The one place the lair is gated: it is the only place that shows the lair screen, so a
  // single check is a complete gate. The core rules are deliberately not gated; with no
  // screen there is no path to them.
  const onLair = () => {
    if (!state.lairUnlocked) return onUnlockOffer();
    const dragon = getDragon(state.dragonId);
    screens.set('lair', renderLairScreen({
      state, dragon, xp: dragonXp(state), theme: resolveTheme(dragon.themeId), furniture,
      onPickSlot, onBack: render,
    }));
    screens.show('lair');
  };

  const onUnlockOffer = () => {
    const dragon = getDragon(state.dragonId);
    screens.set('unlock', renderUnlockLair({
      state, price: config.lairUnlockPrice, theme: resolveTheme(dragon.themeId),
      onConfirm: onConfirmUnlock, onBack: render,
    }));
    screens.show('unlock');
  };

  // Re-enter onLair rather than opening the room here, so the post-unlock path and the
  // already-unlocked path are the same lines and cannot drift.
  const onConfirmUnlock = () => {
    state = unlockLair(state, config.lairUnlockPrice);
    save();
    onLair();
  };

  const onPickSlot = (slot) => {
    const dragon = getDragon(state.dragonId);
    screens.set('picker', renderSlotPicker({
      state, slot, furniture, theme: resolveTheme(dragon.themeId),
      onChoose: onChooseItem, onBack: onLair,
    }));
    screens.show('picker');
  };

  // The two core contracts are mutually exclusive on purpose: placing needs an owned
  // item, buying needs an unowned one. Routing on `owned` here keeps a re-display free,
  // and a wrong branch would throw rather than quietly charge twice, so nothing is caught.
  const onChooseItem = (item) => {
    const { owned } = lairOf(state, state.dragonId);
    state = owned.includes(item.id) ? placeItem(state, item) : buyFurniture(state, item);
    save();
    onLair(); // rebuild so the filled slot shows
  };

  const onSettings = () => {
    screens.set('settings', renderSettingsScreen({
      settings: state.settings, config, onChangeDragon,
      onSave: (settings) => {
        const styleChanged = settings.musicStyle !== state.settings.musicStyle;
        state = { ...state, settings };
        if (styleChanged) audio.setPlaylist(playlistFor(settings.musicStyle));
        if (!timerState.running) {
          const workSeconds = settings.workMinutes * 60;
          const breakSeconds = settings.breakMinutes * 60;
          const longBreakSeconds = settings.longBreakMinutes * 60;
          const atFreshWorkStart =
            timerState.mode === 'work' && timerState.remaining === timerState.workSeconds;
          // Never leave the countdown longer than the length it now belongs to. Keeping
          // a part-used block intact is worth doing, but a few seconds of accidental
          // progress used to lock the new duration out entirely: set work to 1 minute
          // with 14:48 on the clock and the clock stayed at 14:48.
          const rebaked = {
            ...timerState,
            workSeconds,
            breakSeconds,
            longBreakSeconds,
            sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
          };
          const limit = secondsForMode(rebaked, timerState.mode);
          timerState = {
            ...rebaked,
            remaining: atFreshWorkStart
              ? workSeconds
              : Math.min(timerState.remaining, limit),
          };
        }
        persistTimer();
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
        const before = state.coins;
        state = grantWorkReward(state, config, timerState.workSeconds / 60);
        lastReward = state.coins - before;
      } else {
        // break finished → return to a fresh idle work block (▶ Start shows)
        timerState = advance(timerState);
      }
      persistTimer();
    }
    if (screens.current !== 'main') return;
    // Completion changes structure (reward, mode label, controls); a plain tick only the clock.
    if (result.completed) render();
    else updateMainScreen(screens.get('main'), { timerState });
  };

  const interval = setInterval(handleTick, 1000);
  handleTick(); // settle a session restored from a previous run (completes it once)

  render();

  return { destroy: () => clearInterval(interval) };
};

// screen manager with a small cache so we can pre-build then show by name
const createScreenManagerWithCache = (root) => {
  const cache = {};
  const mgr = createScreenManager(root, cache);
  let current = null;
  return {
    set: (name, el) => { cache[name] = el; },
    show: (name) => { current = name; mgr.show(name); },
    get: (name) => cache[name],
    get current() { return current; },
  };
};
