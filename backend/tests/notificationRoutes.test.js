import request from 'supertest';
import { createApp } from '../apiServer.js';
import { resetDb } from '../data/db.js';

let app;
beforeEach(() => {
  resetDb();
  app = createApp();
});

describe('POST /api/notifications/queue-join', () => {
  test('triggers a join notification', async () => {
    const res = await request(app)
      .post('/api/notifications/queue-join')
      .send({ userId: 'u1', serviceId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('queue-join');
    expect(res.body.userId).toBe('u1');
  });

  test('400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/notifications/queue-join')
      .send({ userId: 'u1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing required fields');
  });
});

describe('POST /api/notifications/check-position', () => {
  test('triggers when the user is close to being served', async () => {
    const res = await request(app)
      .post('/api/notifications/check-position')
      .send({ userId: 'u1', serviceId: 1, position: 2 });
    expect(res.status).toBe(201);
    expect(res.body.triggered).toBe(true);
    expect(res.body.notification.type).toBe('almost-served');
  });

  test('does not trigger when the user is far back', async () => {
    const res = await request(app)
      .post('/api/notifications/check-position')
      .send({ userId: 'u1', serviceId: 1, position: 50 });
    expect(res.status).toBe(200);
    expect(res.body.triggered).toBe(false);
  });

  test('400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/notifications/check-position')
      .send({ userId: 'u1', serviceId: 1 });
    expect(res.status).toBe(400);
  });

  test('400 on an invalid position', async () => {
    const res = await request(app)
      .post('/api/notifications/check-position')
      .send({ userId: 'u1', serviceId: 1, position: -3 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/notifications/:userId', () => {
  test('returns only that user\'s notifications', async () => {
    await request(app)
      .post('/api/notifications/queue-join')
      .send({ userId: 'alice', serviceId: 1 });
    await request(app)
      .post('/api/notifications/queue-join')
      .send({ userId: 'bob', serviceId: 2 });

    const res = await request(app).get('/api/notifications/alice');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe('alice');
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  test('marks a notification as read', async () => {
    const created = await request(app)
      .post('/api/notifications/queue-join')
      .send({ userId: 'u1', serviceId: 1 });
    const res = await request(app).patch(
      `/api/notifications/${created.body.id}/read`
    );
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  test('404 for a missing notification', async () => {
    const res = await request(app).patch('/api/notifications/9999/read');
    expect(res.status).toBe(404);
  });
});
