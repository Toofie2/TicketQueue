import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import events from '../data/events.js';

const PRIORITY_CYCLE = ['High', 'Medium', 'Low'];
const DURATION_CYCLE = [90, 120, 150, 180];
const MONTHS = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

const toISODate = (human) => {
  const match = /^(\w+)\s+(\d{1,2}),\s*(\d{4})$/.exec(human);
  if (!match) return human;
  const [, month, day, year] = match;
  return `${year}-${MONTHS[month]}-${String(day).padStart(2, '0')}`;
};

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to backend/.env');
  process.exit(1);
}

const parsed = new URL(url);
const config = {
  host: parsed.hostname,
  port: Number(parsed.port) || 3306,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ''),
};

try {
  const conn = await mysql.createConnection(config);

  for (const table of ['queueentry', 'notification', 'history', 'queue', 'service', 'userprofile', 'usercredentials']) {
    await conn.query(`DELETE FROM \`${table}\``);
  }

  const [admin] = await conn.query(
    'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
    ['admin@tixq.com', bcrypt.hashSync('Admin123!', 8), 'admin']
  );
  await conn.query(
    'INSERT INTO userprofile (userId, fullName, email) VALUES (?, ?, ?)',
    [admin.insertId, 'Admin', 'admin@tixq.com']
  );

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    await conn.query(
      `INSERT INTO service (id, name, description, expectedDuration, priority, category, venue, eventTime, eventDate, price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id,
        e.title,
        `${e.category} — live at ${e.location}.`,
        DURATION_CYCLE[i % DURATION_CYCLE.length],
        PRIORITY_CYCLE[i % PRIORITY_CYCLE.length],
        e.category,
        e.location,
        e.time,
        toISODate(e.date),
        e.price,
        500,
      ]
    );
    await conn.query('INSERT INTO queue (serviceId, status) VALUES (?, ?)', [e.id, 'open']);
  }

  const [[svc]] = await conn.query('SELECT COUNT(*) AS n FROM service');
  const [[q]] = await conn.query('SELECT COUNT(*) AS n FROM queue');
  const [[u]] = await conn.query('SELECT COUNT(*) AS n FROM usercredentials');
  console.log(`Seeded: ${u.n} user(s), ${svc.n} services, ${q.n} queues.`);
  await conn.end();
} catch (err) {
  console.error('Seed failed:', err.code || err.message);
  process.exit(1);
}
