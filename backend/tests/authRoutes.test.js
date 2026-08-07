import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../apiServer.js';
import { query, getPool } from '../db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testUrl = new URL(process.env.DATABASE_URL);
testUrl.pathname = '/queuesmart_test';
process.env.DATABASE_URL = testUrl.toString();

const adminConfig = {
  host: testUrl.hostname,
  port: Number(testUrl.port) || 3306,
  user: decodeURIComponent(testUrl.username),
  password: decodeURIComponent(testUrl.password),
  multipleStatements: true,
};

async function resetAuthTables() {
  await query('DELETE FROM userprofile');
  await query('DELETE FROM usercredentials');
  const [r] = await query(
    'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
    ['admin@tixq.com', bcrypt.hashSync('Admin123!', 8), 'admin']
  );
  await query('INSERT INTO userprofile (userId, fullName, email) VALUES (?, ?, ?)', [
    r.insertId,
    'Admin',
    'admin@tixq.com',
  ]);
}

let app;

beforeAll(async () => {
  const conn = await mysql.createConnection(adminConfig);
  await conn.query('CREATE DATABASE IF NOT EXISTS queuesmart_test');
  await conn.query('USE queuesmart_test');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.end();
  app = createApp();
});

beforeEach(async () => {
  await resetAuthTables();
});

afterAll(async () => {
  await getPool().end();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    test('registers a new user with valid input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@test.com', password: 'password123', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful!');
      expect(res.body.user).toEqual({ email: 'newuser@test.com', role: 'user', name: 'New User' });
    });

    test('stores a hashed password, never plaintext', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'newuser@test.com', password: 'password123' });

      const [rows] = await query('SELECT password FROM usercredentials WHERE email = ?', [
        'newuser@test.com',
      ]);
      expect(rows[0].password).not.toBe('password123');
      expect(rows[0].password.length).toBeGreaterThan(20);
    });

    test('assigns the admin role only to allow-listed admin emails', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'plain-user@test.com', password: 'password123' });

      expect(res.body.user.role).toBe('user');
    });

    test('ignores a client-supplied role and derives it server-side', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'sneaky@test.com', password: 'password123', role: 'admin' });

      expect(res.body.user.role).toBe('user');
    });

    test('rejects registration missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'noPassword@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    test('rejects non-string field types', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 12345, password: 'password123' });
      expect(res.status).toBe(400);
    });

    test('rejects an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/valid email/i);
    });

    test('rejects a password shorter than the minimum length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'shortpw@test.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/password/i);
    });

    test('rejects a password longer than the maximum length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'longpw@test.com', password: 'a'.repeat(73) });
      expect(res.status).toBe(400);
    });

    test('rejects a name longer than the maximum length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'longname@test.com', password: 'password123', name: 'a'.repeat(101) });
      expect(res.status).toBe(400);
    });

    test('rejects duplicate registration for an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'admin@tixq.com', password: 'password123' });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    test('normalizes email casing and whitespace before storing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: '  MixedCase@Test.com  ', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('mixedcase@test.com');
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@tixq.com', password: 'Admin123!' });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({ email: 'admin@tixq.com', role: 'admin', name: 'Admin' });
    });

    test('returns a token on successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@tixq.com', password: 'Admin123!' });
      expect(typeof res.body.token).toBe('string');
    });

    test('login is case-insensitive on email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ADMIN@TIXQ.COM', password: 'Admin123!' });
      expect(res.status).toBe(200);
    });

    test('rejects an unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@test.com', password: 'whatever1' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid email or password/i);
    });

    test('rejects an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@tixq.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });

    test('rejects a login request missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'admin@tixq.com' });
      expect(res.status).toBe(400);
    });

    test('a newly registered user can log in with their own password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'roundtrip@test.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'roundtrip@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('user');
    });
  });
});
