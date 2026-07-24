import express from 'express';
import { db } from '../data/db.js';
import {
  validateService,
  buildService,
  nextId,
} from '../services/serviceService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.services);
});

router.get('/:id', (req, res) => {
  const service = db.services.find((s) => s.id === Number(req.params.id));
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

router.post('/', (req, res) => {
  const error = validateService(req.body);
  if (error) return res.status(400).json({ error });

  const service = buildService(req.body, nextId(db.services));
  db.services.push(service);
  res.status(201).json(service);
});

router.put('/:id', (req, res) => {
  const service = db.services.find((s) => s.id === Number(req.params.id));
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const error = validateService(req.body, { partial: true });
  if (error) return res.status(400).json({ error });

  const fields = [
    'name',
    'description',
    'expectedDuration',
    'priority',
    'venue',
    'date',
    'price',
    'quantity',
  ];
  for (const key of fields) {
    if (req.body[key] === undefined) continue;
    if (['expectedDuration', 'price', 'quantity'].includes(key)) {
      service[key] = Number(req.body[key]);
    } else if (typeof req.body[key] === 'string') {
      service[key] = req.body[key].trim();
    } else {
      service[key] = req.body[key];
    }
  }
  res.json(service);
});

router.delete('/:id', (req, res) => {
  const index = db.services.findIndex((s) => s.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Service not found' });
  const [removed] = db.services.splice(index, 1);
  res.json({ message: 'Service deleted', service: removed });
});

export default router;
