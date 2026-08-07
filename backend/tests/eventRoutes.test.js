import request from 'supertest';
import { createApp } from '../apiServer.js';
import { signToken } from '../middleware/auth.js';
import { createSchema, seedServices, closePool } from './testDb.js';

const adminToken = signToken({ email: 'admin@tixq.com', role: 'admin', name: 'Admin' });

let app;

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedServices(3);
});

afterAll(async () => {
  await closePool();
});

describe('GET /api/events', () => {
  test('lists all events derived from services', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test('maps service fields into event shape', async () => {
    const res = await request(app).get('/api/events');
    const event = res.body.find((e) => e.id === 1);
    expect(event).toMatchObject({
      id: 1,
      title: 'Service 1',
      category: 'Sports Test',
      time: '7:00 PM',
      location: 'Test Venue',
    });
    expect(event).not.toHaveProperty('name');
    expect(event).not.toHaveProperty('venue');
    expect(event.queueOpen).toBe(true);
  });

  test('reflects a newly created service', async () => {
    await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Backend Gala',
        description: 'A test event',
        expectedDuration: 120,
        priority: 'High',
        venue: 'Gala Arena',
        category: 'Music',
        time: '8:30 PM',
      });
    const res = await request(app).get('/api/events');
    const created = res.body.find((e) => e.title === 'Backend Gala');
    expect(created).toBeDefined();
    expect(created.location).toBe('Gala Arena');
    expect(created.category).toBe('Music');
    expect(created.time).toBe('8:30 PM');
  });
});

describe('GET /api/events/:id', () => {
  test('returns a single event by id', async () => {
    const res = await request(app).get('/api/events/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe('Service 1');
  });

  test('404 for a missing event', async () => {
    const res = await request(app).get('/api/events/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event not found');
  });
});
