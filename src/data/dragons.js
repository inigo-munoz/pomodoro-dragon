export const dragons = [
  {
    id: 'ember',
    name: 'Ember',
    levels: [
      { level: 1, xpNeeded: 0,   image: '🥚', fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '🐉', fallback: '🐉' },
      { level: 3, xpNeeded: 300, image: '🐲', fallback: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
