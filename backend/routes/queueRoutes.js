import express from 'express';
import db from '../data/db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/join', async (req, res) => {
  const { userId, serviceId, priority, tickets, name, email } = req.body;

  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields: userId and serviceId are required." });
  }

  try {
    const resolvedEmail = email || userId;
    const resolvedName = name || "Demo User";

    const query = `
      INSERT INTO queue_entries (userId, serviceId, name, email, priority, tickets) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [userId, serviceId, resolvedName, resolvedEmail, priority || 'Medium', tickets || 1]);

    res.status(201).json({ message: "Joined successfully" });
  } catch (err) {
    console.error("SQL Join error:", err.message);
    res.status(500).json({ error: "Database execution failed to join line." });
  }
});

router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;

  try {
    let entryQuery = `SELECT * FROM queue_entries WHERE userId = ? OR email = ?`;
    let queryParams = [userId, userId];

    if (serviceId) {
      entryQuery += ` AND serviceId = ?`;
      queryParams.push(serviceId);
    }
    
    entryQuery += ` ORDER BY joinedAt ASC LIMIT 1`;
    const [entries] = await db.query(entryQuery, queryParams);

    if (entries.length === 0) {
      return res.status(404).json({ message: "User not currently in line" });
    }

    const userEntry = entries[0];
    const countQuery = `
      SELECT COUNT(*) as positionAhead 
      FROM queue_entries 
      WHERE serviceId = ? AND joinedAt < ?
    `;
    const [counts] = await db.query(countQuery, [userEntry.serviceId, userEntry.joinedAt]);
    
    const positionAhead = counts[0].positionAhead;
    const estimatedWait = positionAhead * 1;

    res.json({ 
      positionAhead, 
      waitTime: estimatedWait, 
      tickets: userEntry.tickets || 1 
    });
  } catch (err) {
    console.error("SQL Status error:", err.message);
    res.status(500).json({ error: "Database execution failed to retrieve position data." });
  }
});

router.delete('/leave/:userId', async (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;

  try {
    let deleteQuery = `DELETE FROM queue_entries WHERE (userId = ? OR email = ?)`;
    let queryParams = [userId, userId];

    if (serviceId) {
      deleteQuery += ` AND serviceId = ?`;
      queryParams.push(serviceId);
    }

    await db.query(deleteQuery, queryParams);
    res.json({ message: "Left queue successfully" });
  } catch (err) {
    console.error("SQL Leave error:", err.message);
    res.status(500).json({ error: "Database execution failed to remove entry." });
  }
});

router.get('/admin/current', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const query = `
      SELECT * FROM queue_entries 
      ORDER BY 
        CASE priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END ASC, 
        joinedAt ASC
    `;
    const [sortedQueue] = await db.query(query);
    res.json(sortedQueue);
  } catch (err) {
    console.error("SQL Admin view error:", err.message);
    res.status(500).json({ error: "Database execution failed to query sorted line states." });
  }
});

router.post('/admin/serve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const selectQuery = `
      SELECT * FROM queue_entries 
      ORDER BY 
        CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC, 
        joinedAt ASC 
      LIMIT 1
    `;
    const [entries] = await db.query(selectQuery);

    if (entries.length === 0) {
      return res.status(400).json({ message: "Queue is empty" });
    }

    const servedUser = entries[0];

    await db.query(`DELETE FROM queue_entries WHERE id = ?`, [servedUser.id]);

    res.json({ message: "User served successfully", servedUser });
  } catch (err) {
    console.error("SQL Admin serve error:", err.message);
    res.status(500).json({ error: "Database execution failed to shift queue arrays." });
  }
});

router.post('/success', async (req, res) => {
  const { email, eventTitle, ticketQuantity, outcome } = req.body;

  if (!email || !eventTitle) {
    return res.status(400).json({ error: "Missing required checkout parameters." });
  }

  try {
    const formattedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const eventStringDetails = `${ticketQuantity || 1}x ${eventTitle}`;
    const historyQuery = `
      INSERT INTO history (email, date, event, outcome) 
      VALUES (?, ?, ?, ?)
    `;
    await db.query(historyQuery, [email, formattedDate, eventStringDetails, outcome || 'Served']);
    await db.query(`DELETE FROM queue_entries WHERE email = ? OR userId = ?`, [email, email]);

    res.status(201).json({ message: "Success" });
  } catch (err) {
    console.error("SQL Success History error:", err.message);
    res.status(500).json({ error: "Database execution error writing to group histories module table maps." });
  }
});

router.get('/admin/history-query/:email', authenticate, authorizeAdmin, async (req, res) => {
  const { email } = req.params;
  try {
    const [userFilteredHistory] = await db.query(`SELECT * FROM history WHERE email = ?`, [email]);
    res.json(userFilteredHistory);
  } catch (err) {
    console.error("SQL Admin history query error:", err.message);
    res.status(500).json({ error: "Database execution failed to filter record rows." });
  }
});

export default router;
