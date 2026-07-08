import { addCoins, spend } from './wallet.js';
import { currentLevel } from './dragon.js';

export const grantWorkReward = (state, config) => ({
  ...state,
  coins: addCoins(state.coins, config.coinsPerWork),
});

// XP is stored per dragon. These read/write the ACTIVE dragon's XP.
export const dragonXp = (state) => state.xpByDragon?.[state.dragonId] ?? 0;

export const addDragonXp = (state, amount) => ({
  ...state,
  xpByDragon: { ...state.xpByDragon, [state.dragonId]: dragonXp(state) + amount },
});

export const buyFood = (state, food) => {
  const coins = spend(state.coins, food.price); // throws if !canAfford
  return { ...addDragonXp(state, food.xp), coins };
};

export const leveledUp = (dragon, oldXp, newXp) =>
  currentLevel(dragon, newXp).level > currentLevel(dragon, oldXp).level;
