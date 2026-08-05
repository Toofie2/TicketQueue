import request from 'supertest';
import { createApp } from '../apiServer.js';
import { db, resetDb } from '../data/db.js';
import { signToken } from '../middleware/auth.js';

const adminToken = signToken({ email: 'admin@tixq.com', role: 'admin', name: 'Admin' });
const userToken = signToken({ email: 'user@tixq.com', role: 'user', name: 'User' });
const auth = (req) => req.set('Authorization', `Bearer ${adminToken}`);

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
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
  test('lists all seeded services', async () => {
    const res = await auth(request(app).get('/api/services'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(db.services.length);
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
    const before = db.services.length;
    const res = await auth(request(app).post('/api/services')).send({
      name: 'Playoff Game',
      description: 'Semi-final matchup',
      expectedDuration: 150,
      priority: 'High',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Playoff Game');
    expect(db.services.length).toBe(before + 1);
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

  test('404 for a missing service', async () => {
    const res = await auth(request(app).put('/api/services/9999')).send({
      priority: 'Low',
    });
    expect(res.status).toBe(404);
  });

  test('400 for an invalid update', async () => {
    const res = await auth(request(app).put('/api/services/1')).send({
      priority: 'Nope',
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/services/:id', () => {
  test('removes a service', async () => {
    const res = await auth(request(app).delete('/api/services/1'));
    expect(res.status).toBe(200);
    expect(db.services.find((s) => s.id === 1)).toBeUndefined();
  });

  test('404 for a missing service', async () => {
    const res = await auth(request(app).delete('/api/services/9999'));
    expect(res.status).toBe(404);
  });
});
