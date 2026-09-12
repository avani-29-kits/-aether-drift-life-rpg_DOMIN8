/**
 * Non-linear XP curve: XP required to go from `level` to `level + 1`
 * is 100 * level^1.5, rounded to the nearest integer. Each level costs
 * more than the last.
 */
function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

/**
 * `characters.xp` stores LIFETIME total XP ever earned. Level and
 * "progress into the current level" are always derived from it —
 * never stored/trusted separately — so the frontend can never fake
 * a level by sending one directly.
 */
function computeLevelState(totalXp) {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));

  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: xpRequiredForLevel(level),
  };
}

module.exports = { xpRequiredForLevel, computeLevelState };
