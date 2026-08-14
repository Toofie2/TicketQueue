import express from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userParam', async (req, res) => {
  const { userParam } = req.params;

  try {
    let noticeSql;
    let queryParams = [userParam];

    if (!isNaN(Number(userParam))) {
      noticeSql = `SELECT * FROM notification WHERE userId = ? ORDER BY createdAt DESC`;
    } else {
      noticeSql = `SELECT * FROM notification WHERE userId = 1 ORDER BY createdAt DESC`;
    }
    const rows = await query(noticeSql, queryParams);
    return res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    return res.status(500).json({ error: "Database retrieval error.", details: err.message });
  }
});


router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const updateSql = "UPDATE notification SET status = 'viewed' WHERE id = ?";
    const result = await query(updateSql, [Number(id)]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const [rows] = await query('SELECT * FROM notification WHERE id = ?', [Number(id)]);
    res.json(rows[0]);
  } catch (err) {
    console.error("SQL error updating notification status:", err.message);
    res.status(500).json({ error: "Database execution failed to mutate record status." });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const cleanUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    const queryStr = 'SELECT * FROM notification WHERE userId = ? ORDER BY createdAt DESC';
    const [rows] = await query(queryStr, [cleanUserId]);
    res.json(rows);
  } catch (err) {
    console.error("🔴 SQL error filtering user notifications:", err.message);
    res.status(500).json({ error: "Database error retrieving user records." });
  }
});

export default router;
