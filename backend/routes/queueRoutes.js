import express from 'express';
<<<<<<< Updated upstream
import { db } from '../data/db.js';
import { users, history, nextHistoryId } from './mockDB.js';

const router = express.Router();

router.post('/join', (req, res) => {
  const { userId, serviceId, priority, tickets } = req.body;

  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields" });
=======
import { query } from '../db/pool.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/join', async (req, res) => {
  const { userId, serviceId, priority, tickets } = req.body;

  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields: integer userId and serviceId are required." });
>>>>>>> Stashed changes
  }
  const userProfile = users.find(u => u.email === userId);
  const resolvedName = userProfile ? userProfile.name : "Demo User";
  const resolvedEmail = userProfile ? userProfile.email : userId;

<<<<<<< Updated upstream
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
=======
  try {
    const [queues] = await query('SELECT id FROM queue WHERE serviceId = ? AND status = "open" LIMIT 1', [Number(serviceId)]);
    
    let queueId;
    if (queues.length === 0) {
      const result = await query('INSERT INTO queue (serviceId, status) VALUES (?, "open")', [Number(serviceId)]);
      queueId = result.insertId;
    } else {
      queueId = queues[0].id;
    }

    const insertSql = `
      INSERT INTO queueentry (queueId, userId, tickets, priority, status) 
      VALUES (?, ?, ?, ?, 'waiting')
    `;
    await query(insertSql, [queueId, Number(userId), Number(tickets) || 1, priority || 'Medium']);

    res.status(201).json({ message: "Joined successfully" });
  } catch (err) {
    console.error("SQL /join execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to join line." });
  }
>>>>>>> Stashed changes
});

router.get('/status/:userId', (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;
<<<<<<< Updated upstream
  const belongsToUser = (q) => q.userId === userId || q.email === userId;
  const userEntry = db.queue.find(
    (q) => belongsToUser(q) && (!serviceId || q.serviceId === serviceId)
  );
  if (!userEntry) {
    return res.status(404).json({ message: "User not currently in line" });
=======

  try {
    let entrySql = `
      SELECT qe.* FROM queueentry qe
      JOIN queue q ON qe.queueId = q.id
      WHERE qe.userId = ? AND qe.status = 'waiting'
    `;
    let queryParams = [Number(userId)];

    if (serviceId) {
      entrySql += ` AND q.serviceId = ?`;
      queryParams.push(Number(serviceId));
    }
    
    entrySql += ` ORDER BY qe.joinTime ASC LIMIT 1`;
    const [entries] = await query(entrySql, queryParams);

    if (entries.length === 0) {
      return res.status(404).json({ message: "User not currently in line" });
    }

    const userEntry = entries[0];
    const countSql = `
      SELECT COUNT(*) as positionAhead 
      FROM queueentry 
      WHERE queueId = ? AND status = 'waiting' AND joinTime < ?
    `;
    const [counts] = await query(countSql, [userEntry.queueId, userEntry.joinTime]);
    
    const positionAhead = counts[0].positionAhead;
    const estimatedWait = positionAhead * 1;

    res.json({ 
      positionAhead, 
      waitTime: estimatedWait, 
      tickets: userEntry.tickets || 1 
    });
  } catch (err) {
    console.error("SQL /status execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to retrieve line metrics." });
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
router.get('/admin/current', (req, res) => {
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };
  const sortedQueue = [...db.queue].sort((a, b) => {
    if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
=======
  try {
    let leaveSql = `
      UPDATE queueentry qe
      JOIN queue q ON qe.queueId = q.id
      SET qe.status = 'canceled'
      WHERE qe.userId = ? AND qe.status = 'waiting'
    `;
    let queryParams = [Number(userId)];

    if (serviceId) {
      leaveSql += ` AND q.serviceId = ?`;
      queryParams.push(Number(serviceId));
>>>>>>> Stashed changes
    }
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

<<<<<<< Updated upstream
  res.json(sortedQueue);
});

router.post('/admin/serve', (req, res) => {
  if (db.queue.length === 0) {
    return res.status(400).json({ message: "Queue is empty" });
=======
    await query(leaveSql, queryParams);
    res.json({ message: "Left queue successfully" });
  } catch (err) {
    console.error("SQL /leave execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to cancel line entry." });
  }
});

router.get('/admin/current', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const sortedSql = `
      SELECT * FROM queueentry 
      WHERE status = 'waiting'
      ORDER BY 
        CASE priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END ASC, 
        joinTime ASC
    `;
    const [sortedQueue] = await query(sortedSql);
    res.json(sortedQueue);
  } catch (err) {
    console.error("SQL /admin/current execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to query live line states." });
>>>>>>> Stashed changes
  }
  const servedUser = db.queue.shift();
  res.json({ message: "User served successfully", servedUser });
});

<<<<<<< Updated upstream
router.post('/success', (req, res) => {
  const { email, eventTitle, ticketQuantity, outcome } = req.body;

  if (!email || !eventTitle) {
    return res.status(400).json({ error: "Missing checkout parameters" });
=======
router.post('/admin/serve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const topSql = `
      SELECT * FROM queueentry 
      WHERE status = 'waiting'
      ORDER BY 
        CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC, 
        joinTime ASC 
      LIMIT 1
    `;
    const [entries] = await query(topSql);

    if (entries.length === 0) {
      return res.status(400).json({ message: "Queue is empty" });
    }

    const servedUser = entries[0];

    await query(`UPDATE queueentry SET status = 'served' WHERE id = ?`, [servedUser.id]);

    res.json({ message: "User served successfully", servedUser });
  } catch (err) {
    console.error("SQL /admin/serve execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to shift queue arrays." });
  }
});

router.post('/success', async (req, res) => {
  const { userId, serviceName, outcome } = req.body; 

  if (!userId || !serviceName) {
    return res.status(400).json({ error: "Missing checkout parameters: integer userId and serviceName string required." });
  }

  try {
    const formattedDate = new Date().toISOString().slice(0, 10);
    const historySql = `
      INSERT INTO history (userId, serviceName, outcome, eventDate) 
      VALUES (?, ?, ?, ?)
    `;
    await query(historySql, [Number(userId), serviceName, outcome || 'Served', formattedDate]);
    const finalStatus = outcome === 'Left Queue' ? 'canceled' : 'served';
    await query(`UPDATE queueentry SET status = ? WHERE userId = ? AND status = 'waiting'`, [finalStatus, Number(userId)]);

    res.status(201).json({ message: "Success" });
  } catch (err) {
    console.error("SQL /success execution error:", err.message);
    res.status(500).json({ error: "Database execution error writing to history table logs." });
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
router.get('/admin/history-query/:email', (req, res) => {
  const { email } = req.params;
  const userFilteredHistory = history.filter(h => h.email === email);
  res.json(userFilteredHistory);
=======
router.get('/admin/history-query/:userId', authenticate, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const [userFilteredHistory] = await query(`SELECT * FROM history WHERE userId = ? ORDER BY eventDate DESC`, [Number(userId)]);
    res.json(userFilteredHistory);
  } catch (err) {
    console.error("SQL history query execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to retrieve customer histories." });
  }
>>>>>>> Stashed changes
});

export default router;
