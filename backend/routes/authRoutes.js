// backend/routes/authRoutes.js
// Authentication Module: registration, login, and role handling (User vs Administrator).

import express from 'express';
import bcrypt from 'bcryptjs';
import { users, ADMIN_EMAILS } from './mockDB.js';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72; // bcrypt truncates/errors beyond this
const MAX_NAME_LENGTH = 100;

function resolveRole(email) {
  return ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
}

function toPublicUser(user) {
  return { email: user.email, role: user.role, name: user.name };
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};

  // Required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Field types
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be text values.' });
  }
  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be text.' });
  }

  const trimmedEmail = email.trim();

  // Field length limits
  if (trimmedEmail.length === 0 || trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return res.status(400).json({ error: `Email must be between 1 and ${MAX_EMAIL_LENGTH} characters.` });
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.` });
  }
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` });
  }

  const normalizedEmail = trimmedEmail.toLowerCase();
  const existingUser = users.find((u) => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // Role handling: derived server-side from the admin allow-list, never
  // trusted from client input.
  const role = resolveRole(normalizedEmail);
  const newUser = {
    email: normalizedEmail,
    password: bcrypt.hashSync(password, 8),
    role,
    name: trimmedName,
  };
  users.push(newUser);

  return res.status(201).json({ message: 'Registration successful!', user: toPublicUser(newUser) });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be text values.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);
  const passwordMatches = user ? bcrypt.compareSync(password, user.password) : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.status(200).json({ message: 'Login successful!', user: toPublicUser(user) });
});

export default router;
