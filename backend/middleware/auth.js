const jwt = require('jsonwebtoken');

const COOKIE_NAME = process.env.COOKIE_NAME || 'aether_drift_token';

function requireAuth(req, res, next) {
  const token =
    (req.cookies && req.cookies[COOKIE_NAME]) ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

module.exports = { requireAuth, COOKIE_NAME };
