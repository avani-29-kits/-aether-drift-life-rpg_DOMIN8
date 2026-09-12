const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listShopItems, purchaseItem, equipItem } = require('../controllers/shop.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listShopItems);
router.post('/:itemId/purchase', purchaseItem);
router.post('/:itemId/equip', equipItem);

module.exports = router;
