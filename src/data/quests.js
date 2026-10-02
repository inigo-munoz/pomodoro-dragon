// A ladder of goals, every one read from state the save already holds. Nothing here ever
// expires, resets or runs out: a quest is unstarted, in progress, or done, and a done one
// stays on the ladder. `kind` names what is measured; `goal` is the amount that finishes it
// (for `fullGrown` the goal is the last growth stage, resolved from the dragon catalogue).
export const quests = [
  { id: 'blocks-1',   title: 'Your first block',         reward: 5,  kind: 'blocks',      goal: 1 },
  { id: 'blocks-10',  title: 'Ten blocks',               reward: 15, kind: 'blocks',      goal: 10 },
  { id: 'blocks-50',  title: 'Fifty blocks',             reward: 40, kind: 'blocks',      goal: 50 },
  { id: 'blocks-100', title: 'A hundred blocks',         reward: 75, kind: 'blocks',      goal: 100 },
  { id: 'lair-open',  title: 'Open the lair',            reward: 10, kind: 'lair',        goal: 1 },
  { id: 'decor-1',    title: 'Your first decoration',    reward: 10, kind: 'decorations', goal: 1 },
  { id: 'room-full',  title: 'A room with everything',   reward: 40, kind: 'fullRoom',    goal: 4 },
  { id: 'dragon-grow', title: 'A growing dragon',        reward: 20, kind: 'growing',     goal: 1 },
  { id: 'dragon-full', title: 'A full-grown dragon',     reward: 50, kind: 'fullGrown',   goal: null },
];
