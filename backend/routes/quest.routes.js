const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { questRules } = require('../middleware/validators');
const {
  listQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
} = require('../controllers/quest.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listQuests);
router.post('/', questRules, createQuest);
router.put('/:id', questRules, updateQuest);
router.delete('/:id', deleteQuest);
router.post('/:id/complete', completeQuest);

module.exports = router;
