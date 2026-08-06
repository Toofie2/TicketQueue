import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to backend/.env');
  process.exit(1);
}

const parsed = new URL(url);
const database = parsed.pathname.replace(/^\//, '');
const config = {
  host: parsed.hostname,
  port: Number(parsed.port) || 3306,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  multipleStatements: true,
};

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
  const conn = await mysql.createConnection(config);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await conn.query(`USE \`${database}\``);
  await conn.query(sql);
  const [tables] = await conn.query('SHOW TABLES');
  console.log(`Schema applied to ${config.host}/${database}`);
  console.log('Tables now present:', tables.map((t) => Object.values(t)[0]).join(', '));
  await conn.end();
} catch (err) {
  console.error('Failed to apply schema:', err.code || err.message);
  process.exit(1);
}
