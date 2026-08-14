import request from 'supertest';
import { createApp } from '../apiServer.js';
import { query } from '../db/pool.js';
import { createSchema, closePool } from './testDb.js';

let app;

async function seedHistoryUser() {
  await query('DELETE FROM history');
  await query('DELETE FROM userprofile');
  await query('DELETE FROM usercredentials');

  const [result] = await query(
    'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
    ['harpreet@test.com', 'not-a-real-hash', 'user']
  );
  const userId = result.insertId;

  const seedRecords = [
    ['FIFA World Cup Finals', 'Served', '2026-06-15'],
    ['Houston Rockets vs Lakers', 'Left Queue', '2026-05-22'],
    ['Hamilton on Broadway', 'Served', '2026-04-10'],
  ];
  for (const [serviceName, outcome, eventDate] of seedRecords) {
    await query(
      'INSERT INTO history (userId, serviceName, outcome, eventDate) VALUES (?, ?, ?, ?)',
      [userId, serviceName, outcome, eventDate]
    );
  }
}

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedHistoryUser();
});

afterAll(async () => {
  await closePool();
});

describe('History API', () => {
  describe('GET /api/history/:email', () => {
    test('returns seeded history for a known user, newest first', async () => {
      const res = await request(app).get('/api/history/harpreet@test.com');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].event).toBe('FIFA World Cup Finals');
    });

    test('is case-insensitive on email', async () => {
      const res = await request(app).get('/api/history/HARPREET@TEST.COM');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
    });

    test('returns an empty array for a user with no history', async () => {
      const res = await request(app).get('/api/history/nobody@test.com');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('rejects an invalid email in the path', async () => {
      const res = await request(app).get('/api/history/not-an-email');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/history', () => {
    test('records a new history entry with valid input', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'harpreet@test.com', event: 'Comedy Night Live', outcome: 'Joined Queue' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        email: 'harpreet@test.com',
        event: 'Comedy Night Live',
        outcome: 'Joined Queue',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('newly recorded entries show up in the GET listing', async () => {
      await request(app)
        .post('/api/history')
        .send({ email: 'harpreet@test.com', event: 'Comedy Night Live', outcome: 'Served' });

      const res = await request(app).get('/api/history/harpreet@test.com');
      expect(res.body.some((r) => r.event === 'Comedy Night Live')).toBe(true);
    });

    test('rejects a request missing required fields', async () => {
      const res = await request(app).post('/api/history').send({ email: 'harpreet@test.com' });
      expect(res.status).toBe(400);
    });

    test('rejects non-string field types', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'harpreet@test.com', event: 123, outcome: 'Served' });
      expect(res.status).toBe(400);
    });

    test('rejects an invalid email', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'not-an-email', event: 'Some Event', outcome: 'Served' });
      expect(res.status).toBe(400);
    });

    test('rejects an event name over the length limit', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'harpreet@test.com', event: 'a'.repeat(151), outcome: 'Served' });
      expect(res.status).toBe(400);
    });

    test('rejects an outcome outside the allowed set', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'harpreet@test.com', event: 'Some Event', outcome: 'Teleported' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/outcome/i);
    });

    test('404 when the email has no matching account', async () => {
      const res = await request(app)
        .post('/api/history')
        .send({ email: 'nobody@test.com', event: 'Some Event', outcome: 'Served' });
      expect(res.status).toBe(404);
    });
  });
});