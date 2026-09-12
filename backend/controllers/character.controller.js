const pool = require('../db/pool');
const { computeLevelState } = require('../utils/leveling');

async function getCharacter(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM characters WHERE user_id = ?', [req.userId]);
    const character = rows[0];
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    const { level, xpIntoLevel, xpForNextLevel } = computeLevelState(character.xp);

    res.json({
      level,
      xp: xpIntoLevel,
      xpForNextLevel,
      totalXp: character.xp,
      gold: character.gold,
      attributes: {
        strength: character.strength,
        intellect: character.intellect,
        agility: character.agility,
        vitality: character.vitality,
      },
      currentStreak: character.current_streak,
      longestStreak: character.longest_streak,
      lastActivityDate: character.last_activity_date,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCharacter };
