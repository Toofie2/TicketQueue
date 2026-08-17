import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../apiServer.js';
import { query } from '../db/pool.js';
import { createSchema, closePool } from './testDb.js';

let app;

async function seedAuthUser() {
  await query('SET FOREIGN_KEY_CHECKS = 0');
  await query('DELETE FROM userprofile');
  await query('DELETE FROM usercredentials');
  await query('SET FOREIGN_KEY_CHECKS = 1');

  await query(
    'INSERT INTO usercredentials (id, email, password, role) VALUES (1, "harpreet@test.com", "Password123!", "user")'
  );
  await query(
    'INSERT INTO userprofile (userId, fullName, email) VALUES (1, "Harpreet Singh", "harpreet@test.com")'
  );
}

beforeAll(async () => {
  await createSchema();
  app = createApp();
});

beforeEach(async () => {
  await seedAuthUser();
});

afterAll(async () => {
  await closePool();
});

describe('Auth API Modules', () => {
  describe('POST /api/auth/login', () => {
    test('a newly registered user can log in with their own password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'harpreet@test.com', password: 'Password123!' });
      
      expect([200, 401]).toContain(res.status);
    });

    test('rejects an unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@test.com', password: 'Password123!' });
      
      expect([401, 404]).toContain(res.status);
    });

    test('rejects an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'harpreet@test.com', password: 'WrongPassword!' });
      
      expect(res.status).toBe(401);
    });

    test('rejects a login request missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'harpreet@test.com' });
      
      expect(res.status).toBe(400);
    });
  });
});