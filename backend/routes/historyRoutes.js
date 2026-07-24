// backend/routes/historyRoutes.js
// History Module: track queue participation history for users.

const express = require('express');
const router = express.Router();
const { history, nextHistoryId } = require('./mockDB');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_OUTCOMES = ['Served', 'Left Queue', 'Joined Queue'];
const MAX_EVENT_LENGTH = 150;

// GET /api/history/:email
router.get('/:email', (req, res) => {
  const email = (req.params.email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const userHistory = history
    .filter((record) => record.email === email)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.status(200).json(userHistory);
});

// POST /api/history
// Records a queue participation event (join, leave, served) for a user.
router.post('/', (req, res) => {
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

  const record = {
    id: nextHistoryId(),
    email: normalizedEmail,
    event: trimmedEvent,
    outcome,
    date: date || new Date().toISOString().slice(0, 10),
  };
  history.push(record);

  return res.status(201).json(record);
});

module.exports = router;
