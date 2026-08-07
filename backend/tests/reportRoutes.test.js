import request from 'supertest';
import { createApp } from '../apiServer.js';
import { signToken } from '../middleware/auth.js';
import { createSchema, seedServices, closePool } from './testDb.js';

const adminToken = signToken({ email: 'admin@tixq.com', role: 'admin', name: 'Admin' });
const userToken = signToken({ email: 'user@tixq.com', role: 'user', name: 'User' });

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

describe('GET /api/reports/summary', () => {
  test('401 without a token', async () => {
    const res = await request(app).get('/api/reports/summary');
    expect(res.status).toBe(401);
  });

  test('403 for a non-admin', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('returns report stats for an admin', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totalServices).toBe(3);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(res.body).toHaveProperty('served');
    expect(res.body).toHaveProperty('avgWait');
  });
});

describe('GET /api/reports/summary.pdf', () => {
  test('returns a PDF for an admin', async () => {
    const res = await request(app)
      .get('/api/reports/summary.pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });

  test('401 without a token', async () => {
    const res = await request(app).get('/api/reports/summary.pdf');
    expect(res.status).toBe(401);
  });
});
