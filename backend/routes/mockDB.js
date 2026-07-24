// backend/routes/mockDB.js
// In-memory "database" for the Authentication and History modules.
// No real database is used in this assignment (A3 scope).

const bcrypt = require('bcryptjs');

// Emails in this list are treated as Administrators; everyone else is a
// regular User. Kept here (rather than trusting a client-supplied role)
// so role assignment stays authoritative on the backend.
const ADMIN_EMAILS = ['admin@tixq.com'];

const users = [];
const history = [];
const counter = { historyId: 1 };

const SEED_HISTORY = [
  { email: 'harpreet@test.com', date: '2026-06-15', event: 'FIFA World Cup Finals', outcome: 'Served' },
  { email: 'harpreet@test.com', date: '2026-05-22', event: 'Houston Rockets vs Lakers', outcome: 'Left Queue' },
  { email: 'harpreet@test.com', date: '2026-04-10', event: 'Hamilton on Broadway', outcome: 'Served' },
];

// Resets the in-memory store back to its seed state. Exported so tests can
// start every case from a known, isolated state.
function resetDB() {
  users.length = 0;
  users.push({
    email: 'admin@tixq.com',
    password: bcrypt.hashSync('Admin123!', 8),
    role: 'admin',
    name: 'Admin',
  });

  history.length = 0;
  counter.historyId = 1;
  SEED_HISTORY.forEach((record) => history.push({ id: counter.historyId++, ...record }));
}

function nextHistoryId() {
  return counter.historyId++;
}

resetDB();

module.exports = { users, history, ADMIN_EMAILS, resetDB, nextHistoryId };
