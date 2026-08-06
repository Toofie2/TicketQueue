import request from 'supertest';
import { createApp } from '../apiServer.js';
import { signToken } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { createSchema, seedServices, closePool } from './testDb.js';

const adminToken = signToken({ email: 'admin@tixq.com', role: 'admin', name: 'Admin' });
const userToken = signToken({ email: 'user@tixq.com', role: 'user', name: 'User' });
const auth = (req) => req.set('Authorization', `Bearer ${adminToken}`);

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

describe('service route protection', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(401);
  });

  test('403 with a non-admin token', async () => {
    const res = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/services', () => {
  test('lists all services', async () => {
    const res = await auth(request(app).get('/api/services'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0].queueOpen).toBe(true);
  });
});

describe('GET /api/services/:id', () => {
  test('returns a service by id', async () => {
    const res = await auth(request(app).get('/api/services/1'));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('404 for a missing service', async () => {
    const res = await auth(request(app).get('/api/services/9999'));
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/services', () => {
  test('creates a valid service', async () => {
    const res = await auth(request(app).post('/api/services')).send({
      name: 'Playoff Game',
      description: 'Semi-final matchup',
      expectedDuration: 150,
      priority: 'High',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Playoff Game');

    const [rows] = await query('SELECT COUNT(*) AS n FROM service');
    expect(rows[0].n).toBe(4);
  });

  test('400 when required fields are missing', async () => {
    const res = await auth(request(app).post('/api/services')).send({
      description: 'no name here',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
  });

  test('400 when the duration is invalid', async () => {
    const res = await auth(request(app).post('/api/services')).send({
      name: 'X',
      description: 'Y',
      expectedDuration: -1,
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/services/:id', () => {
  test('updates an existing service', async () => {
    const res = await auth(request(app).put('/api/services/1')).send({
      priority: 'Low',
      expectedDuration: 200,
    });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('Low');
    expect(res.body.expectedDuration).toBe(200);
  });

  test('toggles the queue open/closed via queueOpen', async () => {
    const res = await auth(request(app).put('/api/services/1')).send({ queueOpen: false });
    expect(res.status).toBe(200);
    expect(res.body.queueOpen).toBe(false);
  });

  test('404 for a missing service', async () => {
    const res = await auth(request(app).put('/api/services/9999')).send({ priority: 'Low' });
    expect(res.status).toBe(404);
  });

  test('400 for an invalid update', async () => {
    const res = await auth(request(app).put('/api/services/1')).send({ priority: 'Nope' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/services/:id', () => {
  test('removes a service', async () => {
    const res = await auth(request(app).delete('/api/services/1'));
    expect(res.status).toBe(200);
    const [rows] = await query('SELECT id FROM service WHERE id = 1');
    expect(rows.length).toBe(0);
  });

  test('404 for a missing service', async () => {
    const res = await auth(request(app).delete('/api/services/9999'));
    expect(res.status).toBe(404);
  });
});
