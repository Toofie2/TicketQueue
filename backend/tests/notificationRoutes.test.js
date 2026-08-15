import request from 'supertest';
import { createApp } from '../apiServer.js';
import { query } from '../db/pool.js';
import { createSchema, closePool } from './testDb.js';

let app;
let aliceId;

async function seedNotifications() {
  await query('DELETE FROM notification');
  await query('DELETE FROM userprofile');
  await query('DELETE FROM usercredentials');

  const [alice] = await query(
    'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
    ['alice@test.com', 'hash', 'user']
  );
  aliceId = alice.insertId;
  const [bob] = await query(
    'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
    ['bob@test.com', 'hash', 'user']
  );

  // Two notifications for Alice (queue-join inserted first, ready-checkout second),
  // one for Bob so we can prove the endpoint scopes to a single user.
  await query(
    "INSERT INTO notification (userId, serviceId, type, message) VALUES (?, ?, 'queue-join', ?)",
    [aliceId, 1, 'You joined the queue for Service 1.']
  );
  await query(
    "INSERT INTO notification (userId, serviceId, type, message) VALUES (?, ?, 'ready-checkout', ?)",
    [aliceId, 1, "It's your turn! Checkout now."]
  );
  await query(
    "INSERT INTO notification (userId, serviceId, type, message) VALUES (?, ?, 'queue-join', ?)",
    [bob.insertId, 2, 'Bob joined the queue.']
  );
}

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedNotifications();
});

afterAll(async () => {
  await closePool();
});

describe('Notifications API', () => {
  describe('GET /api/notifications/:userId', () => {
    test("returns a user's notifications by numeric id, newest first", async () => {
      const res = await request(app).get(`/api/notifications/${aliceId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      // Same-second createdAt is broken by id DESC, so the later insert leads.
      expect(res.body[0].type).toBe('ready-checkout');
      expect(res.body.every((n) => n.userId === aliceId)).toBe(true);
    });

    test('resolves an email address to the right user', async () => {
      const res = await request(app).get('/api/notifications/alice@test.com');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('is case-insensitive on the email', async () => {
      const res = await request(app).get('/api/notifications/ALICE@TEST.COM');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('does not leak another user’s notifications', async () => {
      const res = await request(app).get(`/api/notifications/${aliceId}`);
      expect(res.body.some((n) => n.message === 'Bob joined the queue.')).toBe(false);
    });

    test('returns an empty array for an unknown email', async () => {
      const res = await request(app).get('/api/notifications/nobody@test.com');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    test('marks a notification as viewed', async () => {
      const list = await request(app).get(`/api/notifications/${aliceId}`);
      const id = list.body[0].id;

      const res = await request(app).patch(`/api/notifications/${id}/read`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('viewed');

      const [rows] = await query('SELECT status FROM notification WHERE id = ?', [id]);
      expect(rows[0].status).toBe('viewed');
    });

    test('404 for a missing notification', async () => {
      const res = await request(app).patch('/api/notifications/999999/read');
      expect(res.status).toBe(404);
    });
  });
});
