const express = require('express');
const { signup, login, logout, me } = require('../controllers/auth.controller');
const { signupRules, loginRules } = require('../middleware/validators');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
