import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { query, getPool } from '../db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = new URL(process.env.DATABASE_URL);
url.pathname = '/queuesmart_test';
process.env.DATABASE_URL = url.toString();

const adminConfig = {
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  multipleStatements: true,
};

export async function createSchema() {
  const conn = await mysql.createConnection(adminConfig);
  await conn.query('CREATE DATABASE IF NOT EXISTS queuesmart_test');
  await conn.query('USE queuesmart_test');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.end();
}

export async function seedAdmin() {
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

export async function seedServices(count = 3) {
  await query('DELETE FROM queueentry');
  await query('DELETE FROM queue');
  await query('DELETE FROM service');
  for (let i = 1; i <= count; i++) {
    await query(
      `INSERT INTO service (id, name, description, expectedDuration, priority, category, venue, eventTime, eventDate, price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [i, `Service ${i}`, `Description ${i}`, 60 + i, 'Medium', 'Sports Test', 'Test Venue', '7:00 PM', '2026-08-12', 10 * i, 500]
    );
    await query('INSERT INTO queue (serviceId, status) VALUES (?, ?)', [i, 'open']);
  }
}

export async function closePool() {
  await getPool().end();
}
