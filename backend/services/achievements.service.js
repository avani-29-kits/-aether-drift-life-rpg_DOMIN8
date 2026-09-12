const { computeLevelState } = require('../utils/leveling');

/**
 * Checks all achievement conditions for a user and inserts any newly
 * met ones into user_achievements. Must be called with the SAME
 * transaction connection used for quest completion, so an achievement
 * unlock and its triggering quest completion succeed or fail together.
 *
 * Each condition here mirrors the human-readable `requirement` text
 * already seeded in the achievements table (see db/seed.sql) — this
 * function is the code-side implementation of those same rules.
 */
async function checkAndUnlockAchievements(conn, userId) {
  const [[{ count: totalCompleted }]] = await conn.query(
    'SELECT COUNT(*) AS count FROM quest_history WHERE user_id = ?',
    [userId]
  );
  const [[{ count: intellectCompleted }]] = await conn.query(
    `SELECT COUNT(*) AS count FROM quest_history qh
     JOIN quests q ON qh.quest_id = q.id
     WHERE qh.user_id = ? AND q.attribute = 'intellect'`,
    [userId]
  );
  const [[{ count: strengthCompleted }]] = await conn.query(
    `SELECT COUNT(*) AS count FROM quest_history qh
     JOIN quests q ON qh.quest_id = q.id
     WHERE qh.user_id = ? AND q.attribute = 'strength'`,
    [userId]
  );

  const [charRows] = await conn.query('SELECT * FROM characters WHERE user_id = ?', [userId]);
  const character = charRows[0];
  const { level } = computeLevelState(character.xp);

  const candidates = [
    { code: 'first_quest', met: totalCompleted >= 1 },
    { code: 'week_warrior', met: character.current_streak >= 7 },
    { code: 'level_10', met: level >= 10 },
    { code: 'scholar', met: intellectCompleted >= 25 },
    { code: 'strong_one', met: strengthCompleted >= 25 },
    { code: 'quest_master', met: totalCompleted >= 100 },
  ];

  const newlyUnlocked = [];
  for (const candidate of candidates) {
    if (!candidate.met) continue;

    const [achRows] = await conn.query('SELECT id, name FROM achievements WHERE code = ?', [candidate.code]);
    const achievement = achRows[0];
    if (!achievement) continue;

    const [result] = await conn.query(
      'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
      [userId, achievement.id]
    );
    // affectedRows is 0 if it already existed (INSERT IGNORE) — only
    // report ones that were actually newly inserted this call.
    if (result.affectedRows > 0) {
      newlyUnlocked.push({ code: candidate.code, name: achievement.name });
    }
  }

  return newlyUnlocked;
}

module.exports = { checkAndUnlockAchievements };
