// backend/routes/historyRoutes.js
// History Module: track queue participation history for users.

import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_OUTCOMES = ['Served', 'Left Queue', 'Joined Queue'];
const MAX_EVENT_LENGTH = 150;

function toHistoryRecord(row) {
  return {
    id: row.id,
    email: row.email,
    event: row.serviceName,
    outcome: row.outcome,
    date: row.eventDate,
  };
}

// GET /api/history/:email
router.get('/:email', async (req, res) => {
  const email = (req.params.email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  try {
    const [rows] = await query(
      `SELECT h.id, h.serviceName, h.outcome, h.eventDate, c.email
       FROM history h
       JOIN usercredentials c ON c.id = h.userId
       WHERE c.email = ?
       ORDER BY h.eventDate DESC, h.id DESC`,
      [email]
    );
    return res.status(200).json(rows.map(toHistoryRecord));
  } catch (err) {
    return res.status(500).json({ error: 'Could not load history.' });
  }
});

// POST /api/history
// Records a queue participation event (join, leave, served) for a user.
router.post('/', async (req, res) => {
  const { email, event, outcome, date } = req.body || {};

  if (!email || !event || !outcome) {
    return res.status(400).json({ error: 'email, event, and outcome are required.' });
  }
  if (typeof email !== 'string' || typeof event !== 'string' || typeof outcome !== 'string') {
    return res.status(400).json({ error: 'email, event, and outcome must be text values.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const trimmedEvent = event.trim();
  if (trimmedEvent.length === 0 || trimmedEvent.length > MAX_EVENT_LENGTH) {
    return res.status(400).json({ error: `Event name must be between 1 and ${MAX_EVENT_LENGTH} characters.` });
  }
  if (!VALID_OUTCOMES.includes(outcome)) {
    return res.status(400).json({ error: `Outcome must be one of: ${VALID_OUTCOMES.join(', ')}.` });
  }
  if (date !== undefined && typeof date !== 'string') {
    return res.status(400).json({ error: 'Date must be text in YYYY-MM-DD format.' });
  }

  try {
    const [users] = await query('SELECT id FROM usercredentials WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'No account exists for this email.' });
    }

    const eventDate = date || new Date().toISOString().slice(0, 10);
    const [result] = await query(
      'INSERT INTO history (userId, serviceName, outcome, eventDate) VALUES (?, ?, ?, ?)',
      [users[0].id, trimmedEvent, outcome, eventDate]
    );

    return res.status(201).json({
      id: result.insertId,
      email: normalizedEmail,
      event: trimmedEvent,
      outcome,
      date: eventDate,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not record history event.' });
  }
});

export default router;