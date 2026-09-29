const liveRemaining = (state, now) =>
  Math.max(0, Math.ceil((state.endsAt - now) / 1000));

export const remainingAt = (state, now) =>
  state.running ? liveRemaining(state, now) : state.remaining;

export const createTimerState = (settings) => ({
  mode: 'work',
  running: false,
  remaining: settings.workMinutes * 60,
  endsAt: null,
  workSeconds: settings.workMinutes * 60,
  breakSeconds: settings.breakMinutes * 60,
});

export const start = (state, now) => {
  if (state.running) return state;
  return { ...state, running: true, endsAt: now + state.remaining * 1000 };
};

export const pause = (state, now) => {
  if (!state.running) return state;
  return { ...state, running: false, remaining: liveRemaining(state, now), endsAt: null };
};

export const tick = (state, now) => {
  if (!state.running) {
    return { state, completed: false };
  }
  const remaining = liveRemaining(state, now);
  if (remaining > 0) {
    return { state: { ...state, remaining }, completed: false };
  }
  return {
    state: { ...state, remaining: 0, running: false, endsAt: null },
    completed: true,
  };
};

export const advance = (state) => {
  const nextMode = state.mode === 'work' ? 'break' : 'work';
  const remaining = nextMode === 'work' ? state.workSeconds : state.breakSeconds;
  return { ...state, mode: nextMode, remaining, running: false, endsAt: null };
};
