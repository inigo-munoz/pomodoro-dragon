export const createTimerState = (settings) => ({
  mode: 'work',
  running: false,
  remaining: settings.workMinutes * 60,
  workSeconds: settings.workMinutes * 60,
  breakSeconds: settings.breakMinutes * 60,
});

export const start = (state) => ({ ...state, running: true });

export const pause = (state) => ({ ...state, running: false });

export const tick = (state) => {
  if (!state.running || state.remaining <= 0) {
    return { state, completed: false };
  }
  const remaining = state.remaining - 1;
  const completed = remaining <= 0;
  return {
    state: { ...state, remaining, running: completed ? false : true },
    completed,
  };
};

export const advance = (state) => {
  const nextMode = state.mode === 'work' ? 'break' : 'work';
  const remaining = nextMode === 'work' ? state.workSeconds : state.breakSeconds;
  return { ...state, mode: nextMode, remaining, running: false };
};
