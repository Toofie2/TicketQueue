import express from 'express';
import { query } from '../db/pool.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM notification ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error("SQL error fetching all notifications:", err.message);
    res.status(500).json({ error: "Database execution failed to retrieve logs." });
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
