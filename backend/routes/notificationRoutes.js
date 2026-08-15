import express from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();


router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const updateSql = "UPDATE notification SET status = 'viewed' WHERE id = ?";
    const [result] = await query(updateSql, [Number(id)]);

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
    let numericId;
    if (!isNaN(Number(userId))) {
      numericId = Number(userId);
    } else {
      const [users] = await query('SELECT id FROM usercredentials WHERE email = ?', [String(userId).trim().toLowerCase()]);
      if (users.length === 0) return res.json([]);
      numericId = users[0].id;
    }
    const queryStr = 'SELECT * FROM notification WHERE userId = ? ORDER BY createdAt DESC, id DESC';
    const [rows] = await query(queryStr, [numericId]);
    res.json(rows);
  } catch (err) {
    console.error("🔴 SQL error filtering user notifications:", err.message);
    res.status(500).json({ error: "Database error retrieving user records." });
  }
});

export default router;
