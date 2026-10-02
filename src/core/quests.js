import { addCoins } from './wallet.js';
import { itemInSlot, lairOf } from './lair.js';
import { currentLevel } from './dragon.js';

// Pure, and fed everything it needs. `world` carries the catalogues ({ furniture, slots,
// dragons }) because core never imports data; the quests themselves are passed in the same way.

// Stages climbed by one dragon: 0 at its first stage, `levels.length - 1` at its last.
const stagesClimbed = (dragon, xp) => {
  const at = currentLevel(dragon, xp);
  return dragon.levels.indexOf(at);
};

// The furthest any single dragon has grown. A quest asks for "a dragon", never the sum of
// several, so growing a second one adds nothing here.
const bestGrowth = (state, dragons) =>
  Math.max(0, ...dragons.map((d) => stagesClimbed(d, state.xpByDragon?.[d.id] ?? 0)));

const lastStage = (dragons) => Math.max(0, ...dragons.map((d) => d.levels.length - 1));

// Slots filled in one lair, by the same read-time rule the room uses: a stale or misplaced
// id does not count as a decoration.
const filledSlots = (lair, { furniture, slots }) =>
  slots.filter((slot) => itemInSlot(lair, furniture, slot)).length;

const fullestRoom = (state, world) =>
  Math.max(0, ...Object.keys(state.lairs ?? {}).map((id) => filledSlots(lairOf(state, id), world)));

const measure = (quest, state, world) => {
  switch (quest.kind) {
    case 'blocks': return state.lifetimeBlocks ?? 0;
    case 'lair': return state.lairUnlocked ? 1 : 0;
    case 'decorations': return Math.min(1, fullestRoom(state, world));
    case 'fullRoom': return fullestRoom(state, world);
    case 'growing': return Math.min(1, bestGrowth(state, world.dragons));
    case 'fullGrown': return bestGrowth(state, world.dragons);
    default: return 0;
  }
};

const goalOf = (quest, world) => (quest.kind === 'fullGrown' ? lastStage(world.dragons) : quest.goal);

/**
 * How far one quest has come. `current` is capped at `goal`, so a finished quest reads
 * "10 / 10" however far past it she went, and nothing here can read as a shortfall.
 * @returns {{current: number, goal: number, done: boolean}}
 */
export const questProgress = (quest, state, world) => {
  const goal = goalOf(quest, world);
  const raw = measure(quest, state, world);
  return { current: Math.min(raw, goal), goal, done: raw >= goal };
};

// Every quest the state satisfies, whether or not it has been paid yet.
export const satisfiedQuests = (quests, state, world) =>
  quests.filter((q) => questProgress(q, state, world).done);

/**
 * Pay each satisfied quest that is not already in `questsPaid`, once and only once.
 * The paid list is the guard: coins get spent, so the purse can never say what was paid.
 * Running it again on its own result changes nothing, so callers may run it after any change.
 */
export const payQuests = (state, quests, world) => {
  const paid = state.questsPaid ?? [];
  const due = satisfiedQuests(quests, state, world).filter((q) => !paid.includes(q.id));
  if (due.length === 0) return state;
  return {
    ...state,
    coins: due.reduce((coins, q) => addCoins(coins, q.reward), state.coins),
    questsPaid: [...paid, ...due.map((q) => q.id)],
  };
};
