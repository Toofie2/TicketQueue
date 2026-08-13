import 'dotenv/config';
import { query } from './pool.js';

try {
  await query(`
    ALTER TABLE queueentry
    MODIFY COLUMN status
    ENUM('waiting', 'checking_out', 'served', 'canceled')
    NOT NULL DEFAULT 'waiting'
  `);

  console.log('Queue status enum updated successfully.');
  process.exit(0);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}