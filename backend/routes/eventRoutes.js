import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

// 🌟 FIX 1: Added s.priority explicitly to the SELECT DISTINCT columns list 
// to permanently resolve the ORDER BY column validation mismatch crash!
const SELECT_EVENTS = `
  SELECT
    s.id,
    s.name,
    s.description,
    s.category,
    s.venue,
    s.eventTime,
    s.eventDate,
    s.price,
    s.image,
    s.priority,
    (SELECT q.status FROM queue q WHERE q.serviceId = s.id ORDER BY q.id LIMIT 1) AS queueStatus
  FROM service s
`;

function toEvent(row) {
  return {
    id: row.id,
    title: row.name,
    description: row.description,
    category: row.category || '',
    date: row.eventDate,
    time: row.eventTime || '',
    location: row.venue,
    price: Number(row.price),
    image: row.image || '',
    priority: row.priority || 'Medium',
    queueOpen: row.queueStatus ? row.queueStatus === 'open' : true,
  };
}

// 3. GET: Fetch All Events (Default Priority Sorting Matrix)
router.get('/', async (req, res) => {
  try {
    // 🌟 FIX 2: Clean, valid, and fully cross-compatible priority classification sort string
    const prioritySortSql = `
      ${SELECT_EVENTS} 
      ORDER BY 
        CASE s.priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END ASC,
        s.id ASC
    `;

    const [rows] = await query(prioritySortSql);
    res.json(rows.map(toEvent));
  } catch (err) {
    console.error("🔴 CRITICAL API /EVENTS UNHANDLED FAULT:", err);
    res.status(500).json({ error: 'Could not load events.', details: err.message });
  }
});

router.get('/:id/recommendation', async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId)) {
      return res.status(400).json({ error: 'Invalid event id.' });
    }

    const [currentRows] = await query(
      `
      SELECT
        s.id,
        s.name,
        s.category,
        s.expectedDuration,
        COUNT(qe.id) AS waitingCount
      FROM service s
      LEFT JOIN queue q
        ON q.serviceId = s.id
        AND q.status = 'open'
      LEFT JOIN queueentry qe
        ON qe.queueId = q.id
        AND qe.status = 'waiting'
      WHERE s.id = ?
      GROUP BY
        s.id,
        s.name,
        s.category,
        s.expectedDuration
      `,
      [serviceId]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const current = currentRows[0];
    const currentWaitingCount = Number(current.waitingCount);
    const currentEstimatedWait = currentWaitingCount;

    const [alternativeRows] = await query(
      `
      SELECT
        s.id,
        s.name,
        s.category,
        s.expectedDuration,
        COUNT(qe.id) AS waitingCount
      FROM service s
      LEFT JOIN queue q
        ON q.serviceId = s.id
        AND q.status = 'open'
      LEFT JOIN queueentry qe
        ON qe.queueId = q.id
        AND qe.status = 'waiting'
      WHERE s.id <> ?
        AND (
          NOT EXISTS (
            SELECT 1
            FROM queue q2
            WHERE q2.serviceId = s.id
          )
          OR EXISTS (
            SELECT 1
            FROM queue q3
            WHERE q3.serviceId = s.id
              AND q3.status = 'open'
          )
        )
      GROUP BY
        s.id,
        s.name,
        s.category,
        s.expectedDuration
      HAVING COUNT(qe.id) < ?
      ORDER BY
        COUNT(qe.id) ASC,
        s.id ASC
      LIMIT 1
      `,
      [serviceId, currentEstimatedWait]
    );

    const recommendation =
      alternativeRows.length > 0
        ? {
            id: alternativeRows[0].id,
            title: alternativeRows[0].name,
            category: alternativeRows[0].category,
            waitingCount: Number(alternativeRows[0].waitingCount),
            expectedDuration: Number(
              alternativeRows[0].expectedDuration
            ),
            estimatedWait: Number(alternativeRows[0].waitingCount),
          }
        : null;

    res.json({
      currentEvent: {
        id: current.id,
        title: current.name,
        waitingCount: currentWaitingCount,
        expectedDuration: Number(current.expectedDuration),
        estimatedWait: currentEstimatedWait,
      },
      recommendation,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Could not generate a smart recommendation.',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query(
      `${SELECT_EVENTS} WHERE s.id = ?`,
      [Number(req.params.id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(toEvent(rows[0]));
  } catch (err) {
    console.error("🔴 CRITICAL /EVENTS/:ID SINGLE REJECT FAULT:", err);
    res.status(500).json({ error: 'Could not load the event.', details: err.message });
  }
});

export default router;