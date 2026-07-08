export const dragons = [
  {
    id: 'frost',
    name: 'Frost',
    themeId: 'frost',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/frost-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/frost-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/frost-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/frost-adult.webp', fallback: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
