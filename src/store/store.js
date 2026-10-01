export const defaultState = (config) => ({
  version: 3,
  dragonId: null,
  coins: 0,
  xpByDragon: {},
  lairs: {},
  lairUnlocked: false,
  muted: false,
  settings: { ...config.durations.default, musicStyle: config.musicStyles[0] },
  timer: null,
});

// Upgrade older saves to the current shape. v1 (global `xp`) becomes the
// per-dragon `xpByDragon`; v2 gains `timer`, which the defaults merge fills in.
const migrate = (merged, parsed) => {
  if ('xp' in parsed) {
    const xpByDragon = parsed.dragonId ? { [parsed.dragonId]: parsed.xp ?? 0 } : {};
    const { xp, ...rest } = merged;
    return { ...rest, xpByDragon, version: 3 };
  }
  return { ...merged, version: 3 };
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
