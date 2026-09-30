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
  {
    id: 'blaze',
    name: 'Blaze',
    themeId: 'blaze',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/blaze-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/blaze-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/blaze-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/blaze-adult.webp', fallback: '🐲' },
    ],
  },
  {
    id: 'thorn',
    name: 'Thorn',
    themeId: 'thorn',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/thorn-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/thorn-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/thorn-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/thorn-adult.webp', fallback: '🐲' },
    ],
  },
  {
    id: 'tempest',
    name: 'Tempest',
    themeId: 'tempest',
    levels: [
      { level: 1, xpNeeded: 0,   image: '/art/dragons/tempest-egg.webp',   fallback: '🥚' },
      { level: 2, xpNeeded: 100, image: '/art/dragons/tempest-baby.webp',  fallback: '🐣' },
      { level: 3, xpNeeded: 300, image: '/art/dragons/tempest-young.webp', fallback: '🐉' },
      { level: 4, xpNeeded: 600, image: '/art/dragons/tempest-adult.webp', fallback: '🐲' },
    ],
  },
];

export const getDragon = (id) => dragons.find((d) => d.id === id) ?? null;
