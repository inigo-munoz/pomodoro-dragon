export const config = {
  coinsPerMinute: 1,
  durations: {
    workPresets: [10, 15, 25],   // minutes
    breakPresets: [3, 5, 10],    // minutes
    customRange: { min: 1, max: 60 },
    default: { workMinutes: 15, breakMinutes: 5 },
  },
  storageKey: 'pomodoro-dragon-save-v1',
};
