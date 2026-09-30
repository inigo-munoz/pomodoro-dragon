export const config = {
  coinsPerMinute: 1,
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
    '/art/music/lofi-01.mp3',
    '/art/music/lofi-02.mp3',
    '/art/music/lofi-03.mp3',
    '/art/music/lofi-04.mp3',
  ],
  storageKey: 'pomodoro-dragon-save-v1',
};
