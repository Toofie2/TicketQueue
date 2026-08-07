import express from 'express';
import db from '../config/db.js';
import {
  notifyQueueJoin,
  notifyAlmostServed,
  notifyReadyForCheckout,
  isAlmostServed,
} from '../services/notificationService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notifications ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    console.error("SQL error fetching notifications:", err.message);
    res.status(500).json({ error: "Database execution failed to retrieve logs." });
  }
});

router.post('/queue-join', async (req, res) => {
  const { userId, serviceId } = req.body;
  if (!userId || !serviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const notification = notifyQueueJoin(userId, serviceId);
    const query = 'INSERT INTO notifications (userId, message, \`read\`) VALUES (?, ?, ?)';
    await db.query(query, [userId, notification.message, false]);
    
    res.status(201).json(notification);
  } catch (err) {
    console.error("SQL error logging join notice:", err.message);
    res.status(500).json({ error: "Database failed to persist notification data." });
  }
});

router.post('/check-position', async (req, res) => {
  const { userId, serviceId, position } = req.body;
  if (!userId || !serviceId || position === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pos = Number(position);
  if (Number.isNaN(pos) || pos < 0) {
    return res.status(400).json({ error: 'position must be a non-negative number.' });
  }
  
  try {
    if (isAlmostServed(pos)) {
      const notification = notifyAlmostServed(userId, serviceId, pos);
      const query = 'INSERT INTO notifications (userId, message, \`read\`) VALUES (?, ?, ?)';
      await db.query(query, [userId, notification.message, false]);
      
      return res.status(201).json({ triggered: true, notification });
    }
    res.json({ triggered: false, message: 'User is not close to being served yet.' });
  } catch (err) {
    console.error("SQL check position alert error:", err.message);
    res.status(500).json({ error: "Database execution failed." });
  }
});

router.post('/ready-checkout', async (req, res) => {
  const { userId, serviceId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const notification = notifyReadyForCheckout(userId, serviceId);
    const query = 'INSERT INTO notifications (userId, message, \`read\`) VALUES (?, ?, ?)';
    await db.query(query, [userId, notification.message, false]);
    
    res.status(201).json(notification);
  } catch (err) {
    console.error("SQL checkout alert logging error:", err.message);
    res.status(500).json({ error: "Database transaction failed." });
  }
});

router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const updateQuery = 'UPDATE notifications SET \`read\` = true WHERE id = ?';
    const [result] = await db.query(updateQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("SQL mark read error:", err.message);
    res.status(500).json({ error: "Database execution failed to mutate record status." });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = 'SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC';
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error("SQL filter user notifications error:", err.message);
    res.status(500).json({ error: "Database error retrieving user records." });
  }
});

setInterval(notifyFrontUsers, 5000);
