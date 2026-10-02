
export const currentLevel = (dragon, xp) => {
  let result = dragon.levels[0];
  for (const lvl of dragon.levels) {
    if (xp >= lvl.xpNeeded) result = lvl;
  }
  return result;
};

export const levelProgress = (dragon, xp) => {
  const current = currentLevel(dragon, xp);
  const next = dragon.levels.find((l) => l.level === current.level + 1);
  if (!next) {
    return { ratio: 1, current: 0, needed: 0, isMax: true };
  }
  const into = xp - current.xpNeeded;
  const span = next.xpNeeded - current.xpNeeded;
  return { ratio: into / span, current: into, needed: span, isMax: false };
};
