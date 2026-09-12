const pool = require('../db/pool');
const { DIFFICULTY_REWARDS, ATTRIBUTE_GAIN_PER_COMPLETION } = require('../utils/rewards');
const { checkAndUnlockAchievements } = require('../services/achievements.service');

// ---------- LIST ----------
async function listQuests(req, res, next) {
  try {
    const { completed } = req.query;
    let sql = 'SELECT * FROM quests WHERE user_id = ?';
    const params = [req.userId];

    if (completed === 'true' || completed === 'false') {
      sql += ' AND completed = ?';
      params.push(completed === 'true' ? 1 : 0);
    }
    sql += ' ORDER BY completed ASC, created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// ---------- CREATE ----------
// Rewards are computed from `difficulty` via DIFFICULTY_REWARDS — the
// request body's difficulty only SELECTS a reward tier, it never sets
// the reward amount directly.
async function createQuest(req, res, next) {
  try {
    const {
      title,
      description = null,
      category = 'other',
      difficulty = 'medium',
      attribute = 'intellect',
      dueDate = null,
    } = req.body;

    const reward = DIFFICULTY_REWARDS[difficulty];

    const [result] = await pool.query(
      `INSERT INTO quests
        (user_id, title, description, category, difficulty, xp_reward, gold_reward, attribute, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, description, category, difficulty, reward.xp, reward.gold, attribute, dueDate]
    );

    const [rows] = await pool.query('SELECT * FROM quests WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---------- UPDATE ----------
// Editable fields are the quest's definition only. If difficulty
// changes, the reward is recomputed from the table again — a user
// can't edit xp_reward/gold_reward directly because those columns
// are never written from req.body here either.
async function updateQuest(req, res, next) {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query(
      'SELECT * FROM quests WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    const quest = existingRows[0];
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found.' });
    }
    if (quest.completed) {
      return res.status(400).json({ error: 'Completed quests cannot be edited.' });
    }

    const {
      title = quest.title,
      description = quest.description,
      category = quest.category,
      difficulty = quest.difficulty,
      attribute = quest.attribute,
      dueDate = quest.due_date,
    } = req.body;

    const reward = DIFFICULTY_REWARDS[difficulty];

    await pool.query(
      `UPDATE quests
       SET title = ?, description = ?, category = ?, difficulty = ?,
           xp_reward = ?, gold_reward = ?, attribute = ?, due_date = ?
       WHERE id = ? AND user_id = ?`,
      [title, description, category, difficulty, reward.xp, reward.gold, attribute, dueDate, id, req.userId]
    );

    const [rows] = await pool.query('SELECT * FROM quests WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---------- DELETE ----------
async function deleteQuest(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM quests WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Quest not found.' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ---------- COMPLETE ----------
// The only endpoint that changes XP/gold/attributes/streak. Nothing in
// the request body is trusted for reward amounts — everything comes
// from the quest row itself, which was set server-side at creation.
async function completeQuest(req, res, next) {
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Row lock prevents a double-click / duplicate request from both
    // reading "not completed yet" and both awarding rewards.
    const [questRows] = await conn.query(
      'SELECT * FROM quests WHERE id = ? AND user_id = ? FOR UPDATE',
      [id, req.userId]
    );
    const quest = questRows[0];

    if (!quest) {
      await conn.rollback();
      return res.status(404).json({ error: 'Quest not found.' });
    }
    if (quest.completed) {
      await conn.rollback();
      return res.status(409).json({ error: 'This quest has already been completed.' });
    }

    const [charRows] = await conn.query(
      'SELECT * FROM characters WHERE user_id = ? FOR UPDATE',
      [req.userId]
    );
    const character = charRows[0];

    // ---- streak calculation ----
    const today = new Date().toISOString().slice(0, 10);
    let newStreak = 1;
    if (character.last_activity_date) {
      const last = new Date(character.last_activity_date);
      const diffDays = Math.round((new Date(today) - last) / 86400000);
      if (diffDays === 0) newStreak = character.current_streak; // already active today
      else if (diffDays === 1) newStreak = character.current_streak + 1; // consecutive day
      // else: gap of 2+ days resets to 1 (default above)
    }
    const newLongest = Math.max(character.longest_streak, newStreak);

    // ---- apply everything atomically ----
    await conn.query('UPDATE quests SET completed = 1, completed_at = NOW() WHERE id = ?', [id]);

    await conn.query(
      `UPDATE characters
       SET xp = xp + ?, gold = gold + ?, ${quest.attribute} = ${quest.attribute} + ?,
           current_streak = ?, longest_streak = ?, last_activity_date = ?
       WHERE user_id = ?`,
      [quest.xp_reward, quest.gold_reward, ATTRIBUTE_GAIN_PER_COMPLETION, newStreak, newLongest, today, req.userId]
    );

    await conn.query(
      'INSERT INTO quest_history (user_id, quest_id, xp_earned, gold_earned) VALUES (?, ?, ?, ?)',
      [req.userId, id, quest.xp_reward, quest.gold_reward]
    );

    const unlockedAchievements = await checkAndUnlockAchievements(conn, req.userId);

    await conn.commit();

    res.json({
      xpEarned: quest.xp_reward,
      goldEarned: quest.gold_reward,
      attribute: quest.attribute,
      currentStreak: newStreak,
      unlockedAchievements,
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { listQuests, createQuest, updateQuest, deleteQuest, completeQuest };
