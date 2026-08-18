import request from 'supertest';
import { createApp } from '../apiServer.js';
import { query } from '../db/pool.js';
import { createSchema, seedServices, closePool } from './testDb.js';

let app;
let alice;
let bob;

async function seedQueueUsers() {
  await query('DELETE FROM queueentry');
  await query('DELETE FROM notification');
  await query('DELETE FROM history');
  await query('DELETE FROM userprofile');
  await query('DELETE FROM usercredentials');

  const [a] = await query(
    "INSERT INTO usercredentials (email, password, role) VALUES ('alice@q.com', 'h', 'user')"
  );

  const [b] = await query(
    "INSERT INTO usercredentials (email, password, role) VALUES ('bob@q.com', 'h', 'user')"
  );

  alice = a.insertId;
  bob = b.insertId;
}

const join = (userId, serviceId, body = {}) =>
  request(app)
    .post('/api/queue/join')
    .send({ userId, serviceId, tickets: 1, ...body });

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedServices(3);
  await seedQueueUsers();
});

afterAll(async () => {
  await closePool();
});

describe('Queue API (DB-backed)', () => {
  describe('POST /api/queue/join', () => {
    test('adds a waiting entry for the user', async () => {
      const res = await join(alice, 1, {
        tickets: 2,
        priority: 'Medium'
      });

      expect(res.status).toBe(201);

      const [rows] = await query(
        `SELECT qe.status, qe.tickets
         FROM queueentry qe
         JOIN queue q ON qe.queueId = q.id
         WHERE qe.userId = ? AND q.serviceId = 1`,
        [alice]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe('waiting');
      expect(rows[0].tickets).toBe(2);
    });

    test('400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/queue/join')
        .send({ userId: alice });

      expect(res.status).toBe(400);
    });

    test('records a "Joined Queue" history event', async () => {
      await join(alice, 1);

      const [rows] = await query(
        "SELECT outcome FROM history WHERE userId = ? AND outcome = 'Joined Queue'",
        [alice]
      );

      expect(rows).toHaveLength(1);
    });
  });

  describe('GET /api/queue/status/:userId', () => {
    test('reports zero ahead for the only person in line', async () => {
      await join(alice, 1);

      const res = await request(app)
        .get(`/api/queue/status/${alice}?serviceId=1`);

      expect(res.status).toBe(200);
      expect(res.body.positionAhead).toBe(0);
      expect(res.body.waitTime).toBe(0);
    });

    test('counts people ahead by join order (1 minute each)', async () => {
      await join(alice, 1, {
        priority: 'Medium'
      });

      // Force Alice strictly earlier so ordering is deterministic.
      await query(
        'UPDATE queueentry SET joinTime = DATE_SUB(NOW(), INTERVAL 5 MINUTE) WHERE userId = ?',
        [alice]
      );

      await join(bob, 1, {
        priority: 'Medium'
      });

      const res = await request(app)
        .get(`/api/queue/status/${bob}?serviceId=1`);

      expect(res.status).toBe(200);
      expect(res.body.positionAhead).toBe(1);
      expect(res.body.waitTime).toBe(1);
    });

    test('404 when the user is not in any queue', async () => {
      const res = await request(app)
        .get(`/api/queue/status/${alice}?serviceId=1`);

      expect(res.status).toBe(404);
    });

    test('calculates the queue position and wait time', async () => {
      await join(alice, 1, {
        priority: 'High'
      });

      const res = await request(app)
        .get(`/api/queue/status/${alice}?serviceId=1`);

      expect(res.status).toBe(200);
      expect(res.body.positionAhead).toBe(0);
      expect(res.body.waitTime).toBe(0);
    });
  });

  describe('DELETE /api/queue/leave/:userId', () => {
    test("cancels the user's active entry", async () => {
      await join(alice, 1);

      const res = await request(app)
        .delete(`/api/queue/leave/${alice}?serviceId=1`);

      expect(res.status).toBe(200);

      const [rows] = await query(
        'SELECT status FROM queueentry WHERE userId = ?',
        [alice]
      );

      expect(rows[0].status).toBe('canceled');
    });
  });

  describe('GET /api/queue/admin/current', () => {
    test('401 without a token (admin only)', async () => {
      const res = await request(app)
        .get('/api/queue/admin/current');

      expect(res.status).toBe(401);
    });
  });
});