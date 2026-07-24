const request = require('supertest');
const { createApp } = require('../../server');
const { resetDB } = require('../mockDB');

describe('History API', () => {
  let app;

  beforeEach(() => {
    resetDB();
    app = createApp();
  });

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
        .send({ email: 'newperson@test.com', event: 'Comedy Night Live', outcome: 'Served' });

      const res = await request(app).get('/api/history/newperson@test.com');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].event).toBe('Comedy Night Live');
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
  });
});
