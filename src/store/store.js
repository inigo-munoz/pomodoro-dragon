export const defaultState = (config) => ({
  version: 1,
  dragonId: null,
  coins: 0,
  xp: 0,
  muted: false,
  settings: { ...config.durations.default },
});

export const createStore = (backend, config) => {
  const key = config.storageKey;
  return {
    save: (state) => backend.write(key, JSON.stringify(state)),
    load: () => {
      const raw = backend.read(key);
      if (!raw) return defaultState(config);
      try {
        return { ...defaultState(config), ...JSON.parse(raw) };
      } catch {
        return defaultState(config);
      }
    },
  };
};
