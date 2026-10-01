export const config = {
  coinsPerMinute: 1,
  lairUnlockPrice: 50,
  durations: {
    workPresets: [10, 15, 25],   // minutes
    breakPresets: [3, 5, 10],    // minutes
    customRange: { min: 1, max: 60 },
    default: { workMinutes: 15, breakMinutes: 5 },
  },
  // Lofi study tracks, played as a shuffled rotation. Deliberately NOT in the service
  // worker's precache globs: they are fetched when played, so installing the app stays
  // small and only the music you actually hear costs anything.
  music: [
    '/art/music/crossing-main-theme.mp3',
    '/art/music/crossing-noon.mp3',
    '/art/music/crossing-6pm.mp3',
    '/art/music/crossing-9pm.mp3',
  ],
  storageKey: 'pomodoro-dragon-save-v1',
};
