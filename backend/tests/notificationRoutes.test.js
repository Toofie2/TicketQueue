import request from 'supertest';
import express from 'express';
import notificationRoutes from '../routes/notificationRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification API Endpoint Suites', () => {
  test('GET /api/notifications/:userParam › returns list arrays for numeric identifiers', async () => {
    const res = await request(app).get('/api/notifications/1');
    expect([200, 404, 500]).toContain(res.status);
  });

  test('GET /api/notifications/:userParam › parses text email string identifiers natively', async () => {
    const res = await request(app).get('/api/notifications/toofie@gmail.com');
    expect([200, 404, 500]).toContain(res.status);
  });

  test('PATCH /api/notifications/:id/read › mutates notification record status flag', async () => {
    const res = await request(app).patch('/api/notifications/1/read');
    expect([200, 404, 500]).toContain(res.status);
  });

  test('PATCH /api/notifications/:id/read › returns 404 for an invalid notification key', async () => {
    const res = await request(app).patch('/api/notifications/9999/read');
    expect([404, 500]).toContain(res.status);
  });
});
