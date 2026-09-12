const pool = require('../db/pool');

async function listAchievements(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT achievements.*, user_achievements.unlocked_at
       FROM achievements
       LEFT JOIN user_achievements
         ON user_achievements.achievement_id = achievements.id
         AND user_achievements.user_id = ?
       ORDER BY achievements.id ASC`,
      [req.userId]
    );
    res.json(
      rows.map((row) => ({
        code: row.code,
        name: row.name,
        description: row.description,
        unlocked: row.unlocked_at !== null,
        unlockedAt: row.unlocked_at,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { listAchievements };
