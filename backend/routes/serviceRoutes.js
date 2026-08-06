import express from 'express';
import { query } from '../db/pool.js';
import { validateService, buildService } from '../services/serviceService.js';

const router = express.Router();

const SELECT_SERVICES = `
  SELECT s.id, s.name, s.description, s.expectedDuration, s.priority,
         s.category, s.venue, s.eventTime, s.eventDate, s.price, s.quantity,
         q.status AS queueStatus
  FROM service s
  LEFT JOIN queue q ON q.serviceId = s.id
`;

function toService(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    expectedDuration: row.expectedDuration,
    priority: row.priority,
    category: row.category,
    venue: row.venue,
    time: row.eventTime,
    date: row.eventDate,
    price: Number(row.price),
    quantity: row.quantity,
    queueOpen: row.queueStatus ? row.queueStatus === 'open' : true,
  };
}

const COLUMN_MAP = {
  name: 'name',
  description: 'description',
  expectedDuration: 'expectedDuration',
  priority: 'priority',
  category: 'category',
  venue: 'venue',
  time: 'eventTime',
  date: 'eventDate',
  price: 'price',
  quantity: 'quantity',
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await query(`${SELECT_SERVICES} ORDER BY s.id`);
    res.json(rows.map(toService));
  } catch {
    res.status(500).json({ error: 'Could not load services.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query(`${SELECT_SERVICES} WHERE s.id = ?`, [Number(req.params.id)]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    res.json(toService(rows[0]));
  } catch {
    res.status(500).json({ error: 'Could not load the service.' });
  }
});

router.post('/', async (req, res) => {
  const error = validateService(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const s = buildService(req.body, 0);
    const [result] = await query(
      `INSERT INTO service (name, description, expectedDuration, priority, category, venue, eventTime, eventDate, price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.name, s.description, s.expectedDuration, s.priority, s.category, s.venue, s.time, s.date || null, s.price, s.quantity]
    );
    await query('INSERT INTO queue (serviceId, status) VALUES (?, ?)', [
      result.insertId,
      s.queueOpen === false ? 'closed' : 'open',
    ]);
    const [rows] = await query(`${SELECT_SERVICES} WHERE s.id = ?`, [result.insertId]);
    res.status(201).json(toService(rows[0]));
  } catch {
    res.status(500).json({ error: 'Could not create the service.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const error = validateService(req.body, { partial: true });
  if (error) return res.status(400).json({ error });

  try {
    const [existing] = await query('SELECT id FROM service WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Service not found' });

    const sets = [];
    const values = [];
    for (const [key, col] of Object.entries(COLUMN_MAP)) {
      if (req.body[key] === undefined) continue;
      let value = req.body[key];
      if (['expectedDuration', 'price', 'quantity'].includes(key)) {
        value = Number(value);
      } else if (key === 'date') {
        value = value || null;
      } else if (typeof value === 'string') {
        value = value.trim();
      }
      sets.push(`\`${col}\` = ?`);
      values.push(value);
    }
    if (sets.length > 0) {
      values.push(id);
      await query(`UPDATE service SET ${sets.join(', ')} WHERE id = ?`, values);
    }
    if (req.body.queueOpen !== undefined) {
      await query('UPDATE queue SET status = ? WHERE serviceId = ?', [
        req.body.queueOpen === false ? 'closed' : 'open',
        id,
      ]);
    }
    const [rows] = await query(`${SELECT_SERVICES} WHERE s.id = ?`, [id]);
    res.json(toService(rows[0]));
  } catch {
    res.status(500).json({ error: 'Could not update the service.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await query(`${SELECT_SERVICES} WHERE s.id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    await query('DELETE FROM service WHERE id = ?', [id]);
    res.json({ message: 'Service deleted', service: toService(rows[0]) });
  } catch {
    res.status(500).json({ error: 'Could not delete the service.' });
  }
});

export default router;
