import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

const toEvent = (service) => ({
  id: service.id,
  title: service.name,
  category: service.category || '',
  date: service.date,
  time: service.time || '',
  location: service.venue,
  price: service.price,
});

router.get('/', (req, res) => {
  res.json(db.services.map(toEvent));
});

router.get('/:id', (req, res) => {
  const service = db.services.find((s) => s.id === Number(req.params.id));
  if (!service) return res.status(404).json({ error: 'Event not found' });
  res.json(toEvent(service));
});

export default router;
