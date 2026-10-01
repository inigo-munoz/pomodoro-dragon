export const config = {
  coinsPerMinute: 1,
  lairUnlockPrice: 50,
  durations: {
    workPresets: [10, 15, 25],   // minutes
    breakPresets: [3, 5, 10],    // minutes
    customRange: { min: 1, max: 60 },
    default: { workMinutes: 15, breakMinutes: 5 },
  },
  // Study soundtracks, one shuffled rotation per style. Deliberately NOT in the service
  // worker's precache globs: they are fetched when played, so installing the app stays
  // small and only the music you actually hear costs anything.
  music: {
    cozy: [
      '/art/music/crossing-main-theme.mp3',
      '/art/music/crossing-noon.mp3',
      '/art/music/crossing-6pm.mp3',
      '/art/music/crossing-9pm.mp3',
    ],
    lofi: [
      '/art/music/lofi-01.mp3',
      '/art/music/lofi-02.mp3',
      '/art/music/lofi-03.mp3',
      '/art/music/lofi-04.mp3',
    ],
  },
  // The order the settings screen offers them in; the first is the default.
  musicStyles: ['cozy', 'lofi'],
  storageKey: 'pomodoro-dragon-save-v1',
};
