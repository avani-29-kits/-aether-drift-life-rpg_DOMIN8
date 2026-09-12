const pool = require('../db/pool');

// ---------- LIST ----------
// Returns every item plus whether THIS user owns/has equipped it, so
// the frontend can render "Buy" vs "Equip"/"Equipped" in one request.
async function listShopItems(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT items.*, inventory.equipped, inventory.id AS inventory_id
       FROM items
       LEFT JOIN inventory ON inventory.item_id = items.id AND inventory.user_id = ?
       ORDER BY items.price ASC`,
      [req.userId]
    );
    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        type: row.type,
        price: row.price,
        owned: row.inventory_id !== null,
        equipped: Boolean(row.equipped),
      }))
    );
  } catch (err) {
    next(err);
  }
}

// ---------- PURCHASE ----------
// Price is read from the `items` table only — never from the request —
// and the gold check + deduction happen in one locked transaction so
// two simultaneous purchase clicks can't both succeed off a stale balance.
async function purchaseItem(req, res, next) {
  const { itemId } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [itemRows] = await conn.query('SELECT * FROM items WHERE id = ?', [itemId]);
    const item = itemRows[0];
    if (!item) {
      await conn.rollback();
      return res.status(404).json({ error: 'Item not found.' });
    }

    const [existingRows] = await conn.query(
      'SELECT id FROM inventory WHERE user_id = ? AND item_id = ?',
      [req.userId, itemId]
    );
    if (existingRows[0]) {
      await conn.rollback();
      return res.status(409).json({ error: 'You already own this item.' });
    }

    const [charRows] = await conn.query(
      'SELECT gold FROM characters WHERE user_id = ? FOR UPDATE',
      [req.userId]
    );
    const character = charRows[0];
    if (character.gold < item.price) {
      await conn.rollback();
      return res.status(400).json({ error: 'Not enough Glimmer for this item.' });
    }

    await conn.query('UPDATE characters SET gold = gold - ? WHERE user_id = ?', [item.price, req.userId]);
    await conn.query('INSERT INTO inventory (user_id, item_id) VALUES (?, ?)', [req.userId, itemId]);

    await conn.commit();
    res.status(201).json({ purchased: item.name, remainingGold: character.gold - item.price });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// ---------- EQUIP ----------
// For themes/avatar_frames/titles, only one can be active at a time, so
// equipping one un-equips any other owned item of the same type first.
// Badges are allowed to stack (no un-equip step).
async function equipItem(req, res, next) {
  const { itemId } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT inventory.id AS inventory_id, items.type
       FROM inventory JOIN items ON items.id = inventory.item_id
       WHERE inventory.user_id = ? AND inventory.item_id = ?`,
      [req.userId, itemId]
    );
    const owned = rows[0];
    if (!owned) {
      await conn.rollback();
      return res.status(403).json({ error: 'You do not own this item.' });
    }

    if (owned.type !== 'badge') {
      await conn.query(
        `UPDATE inventory
         SET equipped = 0
         WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE type = ?)`,
        [req.userId, owned.type]
      );
    }

    await conn.query('UPDATE inventory SET equipped = 1 WHERE id = ?', [owned.inventory_id]);

    await conn.commit();
    res.status(204).send();
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

module.exports = { listShopItems, purchaseItem, equipItem };
