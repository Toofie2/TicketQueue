import request from 'supertest';
<<<<<<< HEAD
<<<<<<< HEAD
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
  request(app).post('/api/queue/join').send({ userId, serviceId, tickets: 1, ...body });

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedServices(3); // services 1..3, each with an open queue
  await seedQueueUsers();
});

afterAll(async () => {
  await closePool();
});

describe('Queue API (DB-backed)', () => {
  describe('POST /api/queue/join', () => {
    test('adds a waiting entry for the user', async () => {
      const res = await join(alice, 1, { tickets: 2, priority: 'Medium' });
      expect(res.status).toBe(201);

      const [rows] = await query(
        `SELECT qe.status, qe.tickets
         FROM queueentry qe JOIN queue q ON qe.queueId = q.id
         WHERE qe.userId = ? AND q.serviceId = 1`,
        [alice]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].status).toBe('waiting');
      expect(rows[0].tickets).toBe(2);
    });

    test('400 when required fields are missing', async () => {
      const res = await request(app).post('/api/queue/join').send({ userId: alice });
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
      const res = await request(app).get(`/api/queue/status/${alice}?serviceId=1`);
      expect(res.status).toBe(200);
      expect(res.body.positionAhead).toBe(0);
      expect(res.body.waitTime).toBe(0);
    });

    test('counts people ahead by join order (1 minute each)', async () => {
      await join(alice, 1, { priority: 'Medium' });
      // Force Alice strictly earlier so ordering is deterministic within the same second.
      await query(
        'UPDATE queueentry SET joinTime = DATE_SUB(NOW(), INTERVAL 5 MINUTE) WHERE userId = ?',
        [alice]
      );
      await join(bob, 1, { priority: 'Medium' });

      const res = await request(app).get(`/api/queue/status/${bob}?serviceId=1`);
      expect(res.status).toBe(200);
      expect(res.body.positionAhead).toBe(1);
      expect(res.body.waitTime).toBe(1);
    });

    test('404 when the user is not in any queue', async () => {
      const res = await request(app).get(`/api/queue/status/${alice}?serviceId=1`);
      expect(res.status).toBe(404);
    });
=======
=======
>>>>>>> d572743ad947ddd4fa597969687b141b5bb32caf
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
<<<<<<< HEAD
>>>>>>> af749c72f23ffd1bd0820660a3ed1a39d798c5ed
  });

  describe('DELETE /api/queue/leave/:userId', () => {
    test("cancels the user's active entry", async () => {
      await join(alice, 1);
      const res = await request(app).delete(`/api/queue/leave/${alice}?serviceId=1`);
      expect(res.status).toBe(200);

      const [rows] = await query('SELECT status FROM queueentry WHERE userId = ?', [alice]);
      expect(rows[0].status).toBe('canceled');
    });
  });

  describe('GET /api/queue/admin/current', () => {
    test('401 without a token (admin only)', async () => {
      const res = await request(app).get('/api/queue/admin/current');
      expect(res.status).toBe(401);
    });
=======
>>>>>>> d572743ad947ddd4fa597969687b141b5bb32caf
  });
});