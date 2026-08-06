import express from 'express';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAILS } from './mockDB.js';
import { signToken } from '../middleware/auth.js';
import { query } from '../db/pool.js';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 100;

function resolveRole(email) {
  return ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be text values.' });
  }
  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be text.' });
  }

  const trimmedEmail = email.trim();
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

  try {
    const [existing] = await query('SELECT id FROM usercredentials WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const role = resolveRole(normalizedEmail);
    const hashed = bcrypt.hashSync(password, 8);
    const [result] = await query(
      'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)',
      [normalizedEmail, hashed, role]
    );
    await query(
      'INSERT INTO userprofile (userId, fullName, email) VALUES (?, ?, ?)',
      [result.insertId, trimmedName, normalizedEmail]
    );

    const publicUser = { email: normalizedEmail, role, name: trimmedName };
    return res.status(201).json({
      message: 'Registration successful!',
      token: signToken(publicUser),
      user: publicUser,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not create the account.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password must be text values.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [rows] = await query(
      `SELECT c.email, c.password, c.role, p.fullName AS name
       FROM usercredentials c
       LEFT JOIN userprofile p ON p.userId = c.id
       WHERE c.email = ?`,
      [normalizedEmail]
    );

    const user = rows[0];
    const passwordMatches = user ? bcrypt.compareSync(password, user.password) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const publicUser = { email: user.email, role: user.role, name: user.name || '' };
    return res.status(200).json({
      message: 'Login successful!',
      token: signToken(publicUser),
      user: publicUser,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not log in.' });
  }
});

export default router;
