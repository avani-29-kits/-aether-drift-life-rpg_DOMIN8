const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getCharacter } = require('../controllers/character.controller');

const router = express.Router();

router.get('/', requireAuth, getCharacter);

module.exports = router;
