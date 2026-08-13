import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

const SELECT_EVENTS = `
  SELECT
    s.id,
    s.name,
    s.category,
    s.venue,
    s.eventTime,
    s.eventDate,
    s.price,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM queue q
        WHERE q.serviceId = s.id
          AND q.status = 'open'
      ) THEN 'open'
      WHEN EXISTS (
        SELECT 1
        FROM queue q
        WHERE q.serviceId = s.id
      ) THEN 'closed'
      ELSE NULL
    END AS queueStatus
  FROM service s
`;

function toEvent(row) {
  return {
    id: row.id,
    title: row.name,
    category: row.category || '',
    date: row.eventDate,
    time: row.eventTime || '',
    location: row.venue,
    price: Number(row.price),
    queueOpen: row.queueStatus ? row.queueStatus === 'open' : true,
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await query(`${SELECT_EVENTS} ORDER BY s.id`);
    res.json(rows.map(toEvent));
  } catch {
    res.status(500).json({ error: 'Could not load events.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query(`${SELECT_EVENTS} WHERE s.id = ?`, [Number(req.params.id)]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(toEvent(rows[0]));
  } catch {
    res.status(500).json({ error: 'Could not load the event.' });
  }
});

export default router;
