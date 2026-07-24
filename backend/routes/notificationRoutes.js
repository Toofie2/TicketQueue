import express from 'express';
import { db } from '../data/db.js';
import {
  notifyQueueJoin,
  notifyAlmostServed,
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
