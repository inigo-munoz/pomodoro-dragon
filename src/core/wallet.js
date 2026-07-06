export const addCoins = (coins, amount) => coins + amount;

export const canAfford = (coins, price) => coins >= price;

export const spend = (coins, price) => {
  if (!canAfford(coins, price)) {
    throw new Error('Insufficient coins');
  }
  return coins - price;
};
