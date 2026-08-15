import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
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
  
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  
  const tables = ['notification', 'history', 'queueentry', 'queue', 'service', 'userprofile', 'usercredentials'];
  
  try {
    const rawSchema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const safeSchema = rawSchema.replace(/CREATE TABLE /gi, 'CREATE TABLE IF NOT EXISTS ');
    await conn.query(safeSchema);
  } catch (err) {
    for (const table of tables) {
      await conn.query(`CREATE TABLE IF NOT EXISTS ${table} (id INT AUTO_INCREMENT PRIMARY KEY)`);
    }
  }
  
  for (const table of tables) {
    await conn.query(`TRUNCATE TABLE ${table}`);
  }
  
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
}

export async function seedServices(count = 3) {
  await query('SET FOREIGN_KEY_CHECKS = 0');
  await query('LOCK TABLES queueentry WRITE, queue WRITE, service WRITE');
  
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
  
  await query('UNLOCK TABLES');
  await query('SET FOREIGN_KEY_CHECKS = 1');
}

export async function closePool() {
  await getPool().end();
}