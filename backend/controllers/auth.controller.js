const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { COOKIE_NAME } = require('../middleware/auth');

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [
      email.toLowerCase().trim(),
    ]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), passwordHash]
      );
      const userId = userResult.insertId;

      await connection.query('INSERT INTO characters (user_id) VALUES (?)', [userId]);

      await connection.commit();

      const token = signToken(userId);
      setAuthCookie(res, token);
      return res.status(201).json({ user: { id: userId, name: name.trim(), email } });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    const user = rows[0];

    const dummyHash = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8Fj1uJI1Sh8/BUpjD08MHmMr0USfLm';
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : dummyHash);

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ ok: true });
}

async function me(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [
      req.userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, logout, me };
