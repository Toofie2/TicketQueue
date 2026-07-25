import request from 'supertest';
import { createApp } from '../apiServer.js';
import { db, resetDb } from '../data/db.js';

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
});

describe('GET /api/events', () => {
  test('lists all events derived from services', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(db.services.length);
  });

  test('maps service fields into event shape', async () => {
    const res = await request(app).get('/api/events');
    const service = db.services[0];
    const event = res.body.find((e) => e.id === service.id);
    expect(event).toMatchObject({
      id: service.id,
      title: service.name,
      category: service.category,
      time: service.time,
      location: service.venue,
      price: service.price,
    });
    expect(event).not.toHaveProperty('name');
    expect(event).not.toHaveProperty('venue');
  });

  test('falls back to empty strings when category and time are absent', async () => {
    await request(app).post('/api/services').send({
      name: 'Minimal Event',
      description: 'No category or time',
      expectedDuration: 60,
      priority: 'Low',
    });
    const res = await request(app).get('/api/events');
    const created = res.body.find((e) => e.title === 'Minimal Event');
    expect(created.category).toBe('');
    expect(created.time).toBe('');
  });

  test('reflects a newly created service', async () => {
    await request(app).post('/api/services').send({
      name: 'Backend Gala',
      description: 'A test event',
      expectedDuration: 120,
      priority: 'High',
      venue: 'Test Arena',
      category: 'Music',
      time: '8:30 PM',
    });
    const res = await request(app).get('/api/events');
    const created = res.body.find((e) => e.title === 'Backend Gala');
    expect(created).toBeDefined();
    expect(created.location).toBe('Test Arena');
    expect(created.category).toBe('Music');
    expect(created.time).toBe('8:30 PM');
  });
});

describe('GET /api/events/:id', () => {
  test('returns a single event by id', async () => {
    const res = await request(app).get('/api/events/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe(db.services.find((s) => s.id === 1).name);
  });

  test('404 for a missing event', async () => {
    const res = await request(app).get('/api/events/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
});
