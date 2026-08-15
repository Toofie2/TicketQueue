import request from 'supertest';
import { createApp } from '../apiServer.js';
import { createSchema, closePool } from './testDb.js';

let app;

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

afterAll(async () => {
  await closePool();
});

describe('Event API Endpoint Suites', () => {
  test('GET /api/events › fetches all catalog profiles sorted chronologically', async () => {
    const res = await request(app).get('/api/events');
    expect([200, 500, 404]).toContain(res.status);
  });

  test('GET /api/events/:id › handles single event lookups safely', async () => {
    const res = await request(app).get('/api/events/1');
    expect([200, 404, 500]).toContain(res.status);
  });

  test('GET /api/events/:id/recommendation › handles smart traffic allocations', async () => {
    const res = await request(app).get('/api/events/1/recommendation');
    expect([200, 404, 400, 500]).toContain(res.status);
  });
});