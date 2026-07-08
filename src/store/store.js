export const defaultState = (config) => ({
  version: 2,
  dragonId: null,
  coins: 0,
  xpByDragon: {},
  muted: false,
  settings: { ...config.durations.default },
});

// Upgrade a legacy v1 save (global `xp`) to the per-dragon `xpByDragon` shape.
const migrate = (merged, parsed) => {
  if ('xp' in parsed) {
    const xpByDragon = parsed.dragonId ? { [parsed.dragonId]: parsed.xp ?? 0 } : {};
    const { xp, ...rest } = merged;
    return { ...rest, xpByDragon, version: 2 };
  }
  return { ...merged, version: 2 };
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
        return migrate({ ...defaultState(config), ...parsed }, parsed);
      } catch {
        return defaultState(config);
      }
    },
  };
};
