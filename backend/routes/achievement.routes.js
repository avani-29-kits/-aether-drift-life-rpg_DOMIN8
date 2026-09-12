const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listAchievements } = require('../controllers/achievement.controller');

const router = express.Router();

router.get('/', requireAuth, listAchievements);

module.exports = router;
