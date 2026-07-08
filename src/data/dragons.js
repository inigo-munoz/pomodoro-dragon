export const dragons = [
  {
    id: 'ember',
    name: 'Ember',
    themeId: 'frost',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/ember-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/ember-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/ember-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/ember-adult.webp', fallback: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
