import request from 'supertest';
import express from 'express';
import queueRouter from '../routes/queueRoutes.js';
import { db } from '../data/userMockData.js';

const app = express();
app.use(express.json());
app.use('/api/queue', queueRouter);

describe('Queue Module Logic Validation', () => {
  beforeEach(() => { db.queue = []; });

  test('POST /join should push a user into the array timeline', async () => {
    const res = await request(app)
      .post('/api/queue/join')
      .send({ userId: 'USR-TEST', serviceId: 'SVC-001', priority: 'High' });
    expect(res.statusCode).toBe(201);
    expect(db.queue.length).toBe(1);
  });

  test('GET /status must accurately calculate the position * 15 minute wait rule', async () => {
    db.queue.push({ userId: 'USR-TEST', serviceId: 'SVC-001', priority: 'Medium', joinedAt: new Date() });
    const res = await request(app).get('/api/queue/status/USR-TEST');
    expect(res.body.positionAhead).toBe(0);
    expect(res.body.waitTime).toBe(0);
  });
});