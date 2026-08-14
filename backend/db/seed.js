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

  const MOCK_PEOPLE = [
    { name: 'Ava Martinez', priority: 'Medium' },
    { name: 'Liam Chen', priority: 'Medium' },
    { name: 'Noah Patel', priority: 'Medium' },
    { name: 'Sofia Reyes', priority: 'Medium' },
    { name: 'Ethan Brooks', priority: 'Medium' },
  ];
  const MOCK_COUNTS = [2, 4, 1, 3, 2, 4, 5, 2, 1, 3, 3, 3, 2];

  const customers = [];
  for (const person of MOCK_PEOPLE) {
    const email = person.name.toLowerCase().replace(/\s+/g, '.') + '@demo.com';
    const [c] = await conn.query(
      'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
      [email, bcrypt.hashSync('Password123!', 8), 'user']
    );
    await conn.query('INSERT INTO userprofile (userId, fullName, email) VALUES (?, ?, ?)', [
      c.insertId,
      person.name,
      email,
    ]);
    customers.push({ id: c.insertId, name: person.name, email, priority: person.priority });
  }

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
    const [queueResult] = await conn.query('INSERT INTO queue (serviceId, status) VALUES (?, ?)', [e.id, 'open']);
    const count = MOCK_COUNTS[i] ?? 3;
    for (let j = 0; j < count; j++) {
      const person = customers[j % customers.length];
      await conn.query(
        `INSERT INTO queueentry (queueId, userId, tickets, priority, status, joinTime)
         VALUES (?, ?, ?, ?, 'waiting', NOW() + INTERVAL ? SECOND)`,
        [queueResult.insertId, person.id, 1, person.priority, j]
      );
    }
  }

  const historySeed = [
    [customers[0].id, events[0].title, 'Served', '2026-07-20'],
    [customers[0].id, events[3].title, 'Left Queue', '2026-07-18'],
    [customers[1].id, events[1].title, 'Served', '2026-07-15'],
    [customers[2].id, events[5].title, 'Joined Queue', '2026-07-22'],
    [customers[3].id, events[8].title, 'Served', '2026-07-10'],
  ];
  for (const h of historySeed) {
    await conn.query('INSERT INTO history (userId, serviceName, outcome, eventDate) VALUES (?, ?, ?, ?)', h);
  }

  const [[svc]] = await conn.query('SELECT COUNT(*) AS n FROM service');
  const [[q]] = await conn.query('SELECT COUNT(*) AS n FROM queue');
  const [[u]] = await conn.query('SELECT COUNT(*) AS n FROM usercredentials');
  const [[qe]] = await conn.query('SELECT COUNT(*) AS n FROM queueentry');
  const [[h]] = await conn.query('SELECT COUNT(*) AS n FROM history');
  console.log(
    `Seeded: ${u.n} users, ${svc.n} services, ${q.n} queues, ${qe.n} queue entries, ${h.n} history records.`
  );
  await conn.end();
} catch (err) {
  console.error('Seed failed:', err.code || err.message);
  process.exit(1);
}
