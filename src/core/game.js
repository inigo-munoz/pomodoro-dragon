import { addCoins, spend } from './wallet.js';
import { addXp, currentLevel } from './dragon.js';

export const grantWorkReward = (state, config) => ({
  ...state,
  coins: addCoins(state.coins, config.coinsPerWork),
});

export const buyFood = (state, food) => ({
  ...state,
  coins: spend(state.coins, food.price), // throws if !canAfford
  xp: addXp(state.xp, food.xp),
});

export const leveledUp = (dragon, oldXp, newXp) =>
  currentLevel(dragon, newXp).level > currentLevel(dragon, oldXp).level;
