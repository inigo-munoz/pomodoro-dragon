import { config } from './data/config.js';
import { dragons, getDragon } from './data/dragons.js';
import { foods } from './data/foods.js';
import { furniture, slots } from './data/furniture.js';
import { quests } from './data/quests.js';
import { createStore } from './store/store.js';
import { localStorageBackend } from './store/localStorageBackend.js';
import { createAudio } from './audio/audio.js';
import { createReminders } from './platform/reminders.js';
import { tones } from './audio/tones.js';
import { assetUrl } from './ui/art.js';
import { createScreenManager } from './ui/screens.js';
import { renderTitleScreen } from './ui/titleScreen.js';
import { renderInstructionsScreen } from './ui/instructionsScreen.js';
import { renderChooseDragon } from './ui/chooseDragon.js';
import { renderMainScreen, updateMainScreen } from './ui/mainScreen.js';
import { renderShopScreen } from './ui/shopScreen.js';
import { renderRecordScreen } from './ui/recordScreen.js';
import { renderLairScreen } from './ui/lairScreen.js';
import { renderUnlockLair } from './ui/unlockLairScreen.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
import { showLevelUp } from './ui/levelUp.js';
import { createTimerState, start, pause, tick, advance, secondsForMode } from './core/timer.js';
import { grantWorkReward, buyFood, leveledUp, dragonXp } from './core/game.js';
import { currentLevel } from './core/dragon.js';
import { lairOf, buyFurniture, placeItem, unlockLair } from './core/lair.js';
import { canAfford } from './core/wallet.js';
import { payQuests } from './core/quests.js';
import { recordBlock, pruneHistory } from './core/history.js';
import { resolveTheme, applyPalette, applyBackdrop } from './core/theme.js';

// What she is told when a block ends while she is not looking at the screen. A finished
// work block invites the break; a finished break, long or short, calls her back.
const endOfBlockNotice = {
  work: { title: 'Block finished!', body: 'Nice work. Time for a break.' },
  break: { title: 'Break is over', body: 'Time to get back to studying.' },
  longBreak: { title: 'Long break is over', body: 'Ready for a new round of studying?' },
};

export const createApp = (root, {
  now = () => Date.now(), audioFactory = createAudio, remindersFactory = createReminders,
} = {}) => {
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
  const reminders = remindersFactory();
  // The browser keeps the state as 'default' if the prompt is dismissed, so asking only
  // while undecided is not enough to avoid nagging; remember that we already asked.
  let askedPermission = false;
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

  // Quests are read from state that already exists, so any change to that state may finish
  // one. Every site that changes it settles first and saves after, in one write. The paid
  // list makes this safe to call as often as needed: a quest that has paid never pays again.
  const questWorld = { furniture, slots, dragons };
  const settleQuests = () => { state = payQuests(state, quests, questWorld); };

  // A save that predates quests, or one that earned a quest while the app was closed, is
  // settled on load: the work was done, so it counts.
  const loaded = state;
  settleQuests();
  if (state !== loaded) save();

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
      onStart, onPause, onBreak, onShop, onLair, onRecord, onSettings, onToggleMute,
    }));
    screens.show('main');
  };

  // The front door, shown on every launch. It needs no dragon, so it is not themed and
  // never reads the save: Start hands over to render(), which is where the app used to open.
  const showTitle = () => {
    // Start goes to the eggs, not straight to the timer, even when a dragon is already saved:
    // the chooser marks the current one, so carrying on is one tap and changing is free.
    screens.set('title', renderTitleScreen({ onStart: onChangeDragon, onInstructions: showInstructions }));
    screens.show('title');
  };

  const showInstructions = () => {
    screens.set('instructions', renderInstructionsScreen({ onBack: showTitle }));
    screens.show('instructions');
  };

  // --- handlers ---
  // Confirming the dragon already in play must not rewrite the save file. The front door now
  // sends everyone through this screen on every launch, so confirming is the common case and
  // changing is the rare one; a write on every start would be pure churn.
  const onPick = (id) => {
    if (id === state.dragonId) return render();
    state = { ...state, dragonId: id };
    save();
    render();
  };

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
    // The first Start is the first user gesture, which a permission prompt requires.
    if (!askedPermission && reminders.permission === 'default') {
      askedPermission = true;
      reminders.request();
    }
    reminders.keepAwake();
    render();
  };
  const onPause = () => {
    timerState = pause(timerState, now());
    persistTimer();
    reminders.release();
    render();
  };

  const onBreak = () => {
    lastReward = null;
    timerState = start(advance(timerState), now());
    persistTimer();
    reminders.keepAwake();
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
        settleQuests();
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
      onBuy: onBuyItem, onPlace: onPlaceItem, onBack: render,
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
    settleQuests();
    save();
    onLair();
  };

  // Buying and placing are mutually exclusive in core: placing needs an owned item, buying
  // an unowned one, and a wrong branch throws rather than quietly charging twice. The shelf
  // already routes by state, but ownership and the purse are re-checked here so no stale or
  // forged tap can reach the wrong branch or overspend. buyFurniture writes the slot itself.
  const onBuyItem = (item) => {
    const { owned } = lairOf(state, state.dragonId);
    if (owned.includes(item.id) || !canAfford(state.coins, item.price)) return;
    state = buyFurniture(state, item);
    settleQuests();
    save();
    onLair(); // rebuild so the room and the shelf both show the new piece
  };

  const onPlaceItem = (item) => {
    const { owned } = lairOf(state, state.dragonId);
    if (!owned.includes(item.id)) return;
    state = placeItem(state, item);
    settleQuests();
    save();
    onLair();
  };

  // Read-only: nothing here changes the save, so there is nothing to re-render on return.
  const onRecord = () => {
    const dragon = getDragon(state.dragonId);
    screens.set('record', renderRecordScreen({
      state, now: now(), theme: resolveTheme(dragon.themeId), onBack: render,
      quests, world: questWorld,
    }));
    screens.show('record');
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
      const ended = timerState.mode;
      audio.playEffect('bell');
      reminders.release();
      // In front of her, the bell and the dragon already do the job; a notification
      // would only be noise.
      if (document.visibilityState !== 'visible') reminders.notify(endOfBlockNotice[ended]);
      if (timerState.mode === 'work') {
        // work finished → grant coins; stays at 0:00 so the ☕ Break button shows
        const before = state.coins;
        state = grantWorkReward(state, config, timerState.workSeconds / 60);
        lastReward = state.coins - before;
        // Only work is an achievement: a finished break records nothing.
        const minutes = timerState.workSeconds / 60;
        state = {
          ...state,
          // Counted beside the history so the two can never disagree; pruning never touches it.
          lifetimeBlocks: (state.lifetimeBlocks ?? 0) + 1,
          history: pruneHistory(
            recordBlock(state.history, now(), minutes), now(), config.historyDays,
          ),
        };
        // After the block's own coins are counted, so the banner still says what the block paid.
        settleQuests();
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

  // A hidden page can have its interval throttled or suspended, and the browser drops the
  // wake lock on hide. On return, settle a block that ended meanwhile right away rather
  // than on the next tick, then take the lock back if a block is still running.
  const onVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return;
    handleTick();
    if (timerState.running) reminders.keepAwake();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  const interval = setInterval(handleTick, 1000);
  handleTick(); // settle a session restored from a previous run (completes it once)
  if (timerState.running) reminders.keepAwake(); // a restored block is still running

  showTitle();

  return {
    destroy: () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reminders.release();
    },
  };
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
