export const dragons = [
  {
    id: 'ember',
    name: 'Ember',
    levels: [
      { level: 1, xpNeeded: 0,   image: '🥚' },
      { level: 2, xpNeeded: 100, image: '🐉' },
      { level: 3, xpNeeded: 300, image: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
