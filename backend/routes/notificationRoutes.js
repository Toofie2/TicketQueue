<<<<<<< Updated upstream
import express from 'express';
import { db } from '../data/db.js';
import {
  notifyQueueJoin,
  notifyAlmostServed,
  notifyReadyForCheckout,
  isAlmostServed,
} from '../services/notificationService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.notifications);
});

router.post('/queue-join', (req, res) => {
  const { userId, serviceId } = req.body;
  if (!userId || !serviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const notification = notifyQueueJoin(userId, serviceId);
  res.status(201).json(notification);
});

router.post('/check-position', (req, res) => {
  const { userId, serviceId, position } = req.body;
  if (!userId || !serviceId || position === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pos = Number(position);
  if (Number.isNaN(pos) || pos < 0) {
    return res.status(400).json({ error: 'position must be a non-negative number.' });
  }
  if (isAlmostServed(pos)) {
    const notification = notifyAlmostServed(userId, serviceId, pos);
    return res.status(201).json({ triggered: true, notification });
  }
  res.json({ triggered: false, message: 'User is not close to being served yet.' });
});

router.post('/ready-checkout', (req, res) => {
  const { userId, serviceId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const notification = notifyReadyForCheckout(userId, serviceId);
  res.status(201).json(notification);
});

router.patch('/:id/read', (req, res) => {
  const notification = db.notifications.find((n) => n.id === Number(req.params.id));
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  res.json(notification);
});

router.get('/:userId', (req, res) => {
  const items = db.notifications.filter((n) => n.userId === req.params.userId);
  res.json(items);
});

export default router;
=======
import { query } from './db/pool.js';
import { notifyReadyForCheckout } from './services/notificationService.js';

const notifyFrontUsers = async () => {
  try {
    const selectSql = `
      SELECT qe.userId, qe.id, qe.queueId, q.serviceId 
      FROM queueentry qe
      JOIN queue q ON qe.queueId = q.id
      WHERE qe.status = 'waiting'
      ORDER BY qe.joinTime ASC
    `;
    const [waitingEntries] = await query(selectSql);
    const frontSeen = new Set();

    for (const entry of waitingEntries) {
      if (frontSeen.has(entry.queueId)) continue;
      frontSeen.add(entry.queueId);
      const [existingNotice] = await query(
        'SELECT id FROM notification WHERE userId = ? AND serviceId = ? AND type = "ready-checkout" LIMIT 1',
        [entry.userId, entry.serviceId]
      );

      if (existingNotice.length === 0) {
        notifyReadyForCheckout(entry.userId, entry.serviceId);
        const msgText = `Your turn has arrived! Proceed to checkout.`;
        await query(
          'INSERT INTO notification (userId, serviceId, type, message, status) VALUES (?, ?, "ready-checkout", ?, "sent")',
          [entry.userId, entry.serviceId, msgText]
        );
      }
    }
  } catch (err) {
    console.error("Background notification loop tracking issue:", err.message);
  }
};

setInterval(notifyFrontUsers, 5000);
>>>>>>> Stashed changes
