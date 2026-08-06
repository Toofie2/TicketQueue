import express from 'express';
import { db } from '../data/db.js';
import { users, history, nextHistoryId } from './mockDB.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/join', (req, res) => {
  const { userId, serviceId, priority, tickets } = req.body;

  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const userProfile = users.find(u => u.email === userId);
  const resolvedName = userProfile ? userProfile.name : "Demo User";
  const resolvedEmail = userProfile ? userProfile.email : userId;

  db.queue.push({
    userId,
    serviceId,
    name: resolvedName,
    email: resolvedEmail,
    priority: priority || "Medium",
    tickets: tickets || 1,
    joinedAt: new Date()
  });

  res.status(201).json({ message: "Joined successfully" });
});

router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;
  const belongsToUser = (q) => q.userId === userId || q.email === userId;
  const userEntry = db.queue.find(
    (q) => belongsToUser(q) && (!serviceId || q.serviceId === serviceId)
  );
  if (!userEntry) {
    return res.status(404).json({ message: "User not currently in line" });
  }
  const sameEvent = db.queue.filter(q => q.serviceId === userEntry.serviceId);
  const positionAhead = sameEvent.findIndex(belongsToUser);
  const estimatedWait = positionAhead * 1;
  res.json({ positionAhead, waitTime: estimatedWait, tickets: userEntry.tickets || 1 });
});

router.delete('/leave/:userId', (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;
  db.queue = db.queue.filter((q) => {
    const isUser = q.userId === userId || q.email === userId;
    if (!isUser) return true;
    if (serviceId && q.serviceId !== serviceId) return true;
    return false;
  });
  res.json({ message: "Left queue successfully" });
});

router.get('/admin/current', authenticate, authorizeAdmin, (req, res) => {
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };
  const sortedQueue = [...db.queue].sort((a, b) => {
    if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  res.json(sortedQueue);
});

router.post('/admin/serve', authenticate, authorizeAdmin, (req, res) => {
  if (db.queue.length === 0) {
    return res.status(400).json({ message: "Queue is empty" });
  }
  const servedUser = db.queue.shift();
  res.json({ message: "User served successfully", servedUser });
});

router.post('/success', (req, res) => {
  const { email, eventTitle, ticketQuantity, outcome } = req.body;

  if (!email || !eventTitle) {
    return res.status(400).json({ error: "Missing checkout parameters" });
  }
  history.push({
    id: nextHistoryId(),
    email: email,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    event: `${ticketQuantity || 1}x ${eventTitle}`,
    outcome: outcome || 'Served'
  });
  db.queue = db.queue.filter(q => q.userId !== email && q.email !== email);
  res.status(201).json({ message: "Success" });
});

router.get('/admin/history-query/:email', authenticate, authorizeAdmin, (req, res) => {
  const { email } = req.params;
  const userFilteredHistory = history.filter(h => h.email === email);
  res.json(userFilteredHistory);
});

export default router;
