import express from 'express';
import { db } from '../data/userMockData.js';

const router = express.Router();

router.post('/join', (req, res) => {
  const { userId, serviceId, priority } = req.body;
  
  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.queue.push({ 
    userId, 
    serviceId, 
    priority: priority || "Medium", 
    joinedAt: new Date() 
  });
  
  res.status(201).json({ message: "Joined successfully" });
});

router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const position = db.queue.findIndex(q => q.userId === userId) + 1;
  if (position === 0) {
    return res.status(404).json({ message: "User not currently in line" });
  }
  const estimatedWait = (position - 1) * 15;
  res.json({ positionAhead: position - 1, waitTime: estimatedWait });
});

router.delete('/leave/:userId', (req, res) => {
  db.queue = db.queue.filter(q => q.userId !== req.params.userId);
  res.json({ message: "Left queue successfully" });
});

router.get('/admin/current', (req, res) => {
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };
  const sortedQueue = [...db.queue].sort((a, b) => {
    if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  res.json(sortedQueue);
});

router.post('/admin/serve', (req, res) => {
  if (db.queue.length === 0) {
    return res.status(400).json({ message: "Queue is empty" });
  }
  const servedUser = db.queue.shift();
  res.json({ message: "User served successfully", servedUser });
});

export default router;