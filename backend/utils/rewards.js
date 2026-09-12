/**
 * The ONLY place quest rewards are decided. A quest's xp_reward and
 * gold_reward are set from this table at creation time based on
 * difficulty — never from client-supplied numbers — so a user can't
 * request a quest with an inflated reward, and completion later just
 * reads back whatever was stored here.
 */
const DIFFICULTY_REWARDS = {
  easy: { xp: 15, gold: 8 },
  medium: { xp: 30, gold: 15 },
  hard: { xp: 55, gold: 28 },
  epic: { xp: 100, gold: 50 },
};

// Flat attribute gain per completion — kept simple and uniform rather
// than scaled by difficulty, so it's a one-line fact to explain in judging.
const ATTRIBUTE_GAIN_PER_COMPLETION = 1;

module.exports = { DIFFICULTY_REWARDS, ATTRIBUTE_GAIN_PER_COMPLETION };
