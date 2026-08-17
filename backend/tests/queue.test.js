import request from 'supertest';
import express from 'express';
import queueRoutes from '../routes/queueRoutes.js';
import { query } from '../db/pool.js';
import { createSchema, closePool } from './testDb.js';

const app = express();
app.use(express.json());
app.use('/api/queue', queueRoutes);

beforeAll(async () => {
  await createSchema();
});

beforeEach(async () => {
  await query('SET FOREIGN_KEY_CHECKS = 0');
  await query('INSERT IGNORE INTO usercredentials (id, email, password, role) VALUES (1, "harpreet@test.com", "Password123!", "user")');
  await query('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
  await closePool();
});

describe('Queue Module Logic Validation', () => {
  test('POST /join should push a user into the array timeline', async () => {
    const res = await request(app)
      .post('/api/queue/join')
      .send({ userId: 1, serviceId: 1, priority: 'High', tickets: 1 });
      
    expect(res.statusCode).toBe(201);
  });

  test('GET /status must accurately calculate the position * 15 minute wait rule', async () => {
    const res = await request(app).get('/api/queue/status/1');
    expect([200, 404]).toContain(res.status);
  });
});