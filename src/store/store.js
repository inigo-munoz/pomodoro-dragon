export const defaultState = (config) => ({
  version: 4,
  dragonId: null,
  coins: 0,
  xpByDragon: {},
  lairs: {},
  lairUnlocked: false,
  history: {},
  muted: false,
  settings: { ...config.durations.default, musicStyle: config.musicStyles[0] },
  timer: null,
});

// The lair slot once called `corner` sits at the bottom centre, so v4 renamed it `center`.
// A saved lair keys its placed items by slot id, so without this move the pet a child had
// placed would stay owned but vanish from her room.
const renameCornerSlot = (lairs) => {
  const next = {};
  for (const [dragonId, lair] of Object.entries(lairs ?? {})) {
    if (!lair?.slots || !('corner' in lair.slots)) { next[dragonId] = lair; continue; }
    const { corner, ...slots } = lair.slots;
    next[dragonId] = { ...lair, slots: { center: corner, ...slots } };
  }
  return next;
};

// Upgrade older saves to the current shape. v1 (global `xp`) becomes the
// per-dragon `xpByDragon`; v2 gains `timer`, which the defaults merge fills in; v3 lairs
// move their `corner` slot to `center`.
const migrate = (merged, parsed) => {
  let next = merged;
  if ('xp' in parsed) {
    const xpByDragon = parsed.dragonId ? { [parsed.dragonId]: parsed.xp ?? 0 } : {};
    const { xp, ...rest } = merged;
    next = { ...rest, xpByDragon };
  }
  if ((parsed.version ?? 0) < 4) next = { ...next, lairs: renameCornerSlot(next.lairs) };
  return { ...next, version: 4 };
};

export const createStore = (backend, config) => {
  const key = config.storageKey;
  return {
    save: (state) => backend.write(key, JSON.stringify(state)),
    load: () => {
      const raw = backend.read(key);
      if (!raw) return defaultState(config);
      try {
        const parsed = JSON.parse(raw);
        const defaults = defaultState(config);
        // The merge is shallow, so a saved `settings` would replace the defaults wholesale
        // and drop any setting added since it was written. Merge that one level too.
        const settings = { ...defaults.settings, ...parsed.settings };
        return migrate({ ...defaults, ...parsed, settings }, parsed);
      } catch {
        return defaultState(config);
      }
    },
  };
};
