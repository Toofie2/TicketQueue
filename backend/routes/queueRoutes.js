import express from 'express';
import { query } from '../db/pool.js'; 
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/join', async (req, res) => {
  const { userId, serviceId, priority, tickets } = req.body;
  if (!userId || !serviceId) {
    return res.status(400).json({ error: "Missing required fields: integer userId and serviceId are required." });
  }

  try {
    const cleanUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    const cleanServiceId = isNaN(Number(serviceId)) ? 1 : Number(serviceId);
    const userCheck = await query('SELECT id FROM usercredentials WHERE id = ?', [cleanUserId]);
    if (!userCheck || userCheck.length === 0) {
      await query('INSERT IGNORE INTO usercredentials (id, email, password, role) VALUES (1, "harpreet@test.com", "DemoPassword123!", "user")');
    }

    const serviceCheck = await query('SELECT id FROM service WHERE id = ?', [cleanServiceId]);
    if (!serviceCheck || serviceCheck.length === 0) {
      await query(`
        INSERT INTO service (id, name, description, expectedDuration, priority, category, venue, price, quantity)
        VALUES (?, 'Standard Event Entry Pass', 'Live Ticket Queue Pass', 15, 'Medium', 'Concert', 'Main Stadium', 0.00, 100)
      `, [cleanServiceId]);
    }

    await query(`DELETE FROM queueentry WHERE userId = ?`, [cleanUserId]);

    const [queueRows] = await query(
  'SELECT id FROM queue WHERE serviceId = ? AND status = "open" LIMIT 1',
  [cleanServiceId]
);

let queueId = queueRows[0]?.id || null;

if (!queueId) {
  const [result] = await query(
    'INSERT INTO queue (serviceId, status) VALUES (?, "open")',
    [cleanServiceId]
  );

  queueId = result.insertId;
}
    const insertSql = `
      INSERT INTO queueentry (queueId, userId, tickets, priority, status) 
      VALUES (?, ?, ?, ?, 'waiting')
    `;
    await query(insertSql, [queueId, cleanUserId, Number(tickets) || 1, priority || 'Medium']);

    try {
      const [svcRows] = await query('SELECT name FROM service WHERE id = ?', [cleanServiceId]);
      const svcName = svcRows[0]?.name || 'the event';
      await query(
        `INSERT INTO notification (userId, serviceId, type, message) VALUES (?, ?, 'queue-join', ?)`,
        [cleanUserId, cleanServiceId, `You joined the queue for ${svcName}.`]
      );
    } catch (notifyErr) {
      console.error('Notification (join) failed:', notifyErr.message);
    }

    res.status(201).json({ message: "Joined successfully" });
  } catch (err) {
    console.error("🔴 CRITICAL SQL JOIN REJECT FAULT:", err); 
    res.status(500).json({ error: "Database execution failed to join line.", details: err.message });
  }
});

router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;

  try {
    const cleanUserId = isNaN(Number(userId)) ? 1 : Number(userId);

    let entrySql = `
  SELECT qe.* FROM queueentry qe
  JOIN queue q ON qe.queueId = q.id
  WHERE qe.userId = ? AND qe.status IN ('waiting', 'checking_out')
`;
let queryParams = [cleanUserId];

    if (serviceId && !isNaN(Number(serviceId))) {
      entrySql += ` AND q.serviceId = ?`;
      queryParams.push(Number(serviceId));
    }
    
    entrySql += ` ORDER BY qe.joinTime ASC LIMIT 1`;
    const [entryRows] = await query(entrySql, queryParams);
    const userEntry = entryRows[0];

    if (!userEntry) {
      return res.status(404).json({ message: "User not currently in line" });
    }

    const countSql = `
      SELECT COUNT(*) as positionAhead 
      FROM queueentry 
      WHERE queueId = ? AND status = 'waiting' AND (
        CASE priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END < CASE ? 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END OR (
          priority = ? AND joinTime < ?
        )
      )
    `;
    const [countRows] = await query(countSql, [
  userEntry.queueId,
  userEntry.priority,
  userEntry.priority,
  userEntry.joinTime
]);

const countRow = countRows[0];
    let positionAhead = 0;
    if (countRow) {
      positionAhead = countRow.positionAhead !== undefined ? countRow.positionAhead : (countRow['COUNT(*)'] || 0);
    }

    let waitTime = positionAhead * 1; 

    const [checkoutRows] = await query(
  `SELECT userId FROM queueentry WHERE queueId = ? AND status = 'checking_out' LIMIT 1`,
  [userEntry.queueId]
);

const checkoutRow = checkoutRows[0];

    if (positionAhead === 0) {
      if (!checkoutRow) {
        await query(`UPDATE queueentry SET status = 'checking_out' WHERE id = ?`, [userEntry.id]);
        waitTime = 0;

        try {
          const [svcRows] = await query(
            'SELECT s.id, s.name FROM service s JOIN queue q ON q.serviceId = s.id WHERE q.id = ?',
            [userEntry.queueId]
          );
          const svc = svcRows[0];
          if (svc) {
            const [existing] = await query(
              `SELECT id FROM notification WHERE userId = ? AND serviceId = ? AND type = 'ready-checkout' LIMIT 1`,
              [userEntry.userId, svc.id]
            );
            if (existing.length === 0) {
              await query(
                `INSERT INTO notification (userId, serviceId, type, message) VALUES (?, ?, 'ready-checkout', ?)`,
                [userEntry.userId, svc.id, `It's your turn! Your tickets for ${svc.name} are ready — checkout now.`]
              );
            }
          }
        } catch (notifyErr) {
          console.error('Notification (ready-checkout) failed:', notifyErr.message);
        }
      } else if (checkoutRow.userId !== userEntry.userId) {
        return res.json({
          positionAhead: 1,
          waitTime: 1, 
          tickets: userEntry.tickets || 1
        });
      } else {
        waitTime = 0;
      }
    }

    res.json({ 
      positionAhead, 
      waitTime, 
      tickets: userEntry.tickets || 1 
    });
  } catch (err) {
    console.error("🔴 CRITICAL STATUS CALCULATION CRASH:", err);
    res.status(500).json({ error: "Database execution failed to retrieve position data.", details: err.message });
  }
});

// 3. DELETE: Leave Queue / Soft-Delete (Updated to set status to 'canceled' instead of row purging)
router.delete('/leave/:userId', async (req, res) => {
  const { userId } = req.params;
  const { serviceId } = req.query;

  try {
    const cleanUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    let leaveSql = `UPDATE queueentry SET status = 'canceled' WHERE userId = ? AND status IN ('waiting', 'checking_out')`;
    let queryParams = [cleanUserId];

    if (serviceId && !isNaN(Number(serviceId))) {
      leaveSql = `
        UPDATE queueentry qe
        JOIN queue q ON qe.queueId = q.id
        SET qe.status = 'canceled'
        WHERE qe.userId = ? AND q.serviceId = ? AND qe.status IN ('waiting', 'checking_out')
      `;
      queryParams.push(Number(serviceId));
    }

    const result = await query(leaveSql, queryParams);
    console.log(`📉 User ID ${cleanUserId} marked as INACTIVE ('canceled') inside the cloud database.`);
    res.json({ message: "Left queue successfully", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("🔴 SQL Soft-Leave error:", err.message);
    res.status(500).json({ error: "Database execution failed to update status flag." });
  }
});

router.get('/admin/current', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT qe.id, qe.userId, qe.tickets, qe.priority, qe.joinTime, qe.status,
             s.id AS serviceId, s.name AS serviceName,
             c.email AS userEmail,
             COALESCE(p.fullName, c.email) AS name
      FROM queueentry qe
      JOIN queue q ON qe.queueId = q.id
      JOIN service s ON q.serviceId = s.id
      JOIN usercredentials c ON qe.userId = c.id
      LEFT JOIN userprofile p ON p.userId = c.id
      WHERE qe.status = 'waiting'
      ORDER BY
        CASE qe.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC,
        qe.joinTime ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("SQL Admin view error:", err.message);
    res.status(500).json({ error: "Database execution failed to query sorted line states." });
  }
});

router.post('/admin/serve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const selectSql = `
      SELECT * FROM queueentry 
      WHERE status = 'waiting'
      ORDER BY 
        CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END ASC, 
        joinTime ASC 
      LIMIT 1
    `;
    const rawEntries = await query(selectSql);
    const servedUser = Array.isArray(rawEntries) ? rawEntries[0] : rawEntries;

    if (!servedUser) {
      return res.status(400).json({ message: "Queue is empty" });
    }

    await query(`UPDATE queueentry SET status = 'served' WHERE id = ?`, [servedUser.id]);
    res.json({ message: "User served successfully", servedUser });
  } catch (err) {
    console.error("SQL Admin serve execution error:", err.message);
    res.status(500).json({ error: "Database execution failed to shift queue records." });
  }
});

router.post('/success', async (req, res) => {
  const { userId, serviceName, outcome } = req.body;

  try {
    const cleanUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    const formattedDate = new Date().toISOString().slice(0, 10);

    const historySql = `
      INSERT INTO history (userId, serviceName, outcome, eventDate) 
      VALUES (?, ?, ?, ?)
    `;
    await query(historySql, [cleanUserId, serviceName || "Event Entry Pass", outcome || 'Served', formattedDate]);
    
    const finalStatus = outcome === 'Left Queue' ? 'canceled' : 'served';

    const [entryRows] = await query(
      `SELECT qe.id, qe.tickets, q.serviceId
       FROM queueentry qe JOIN queue q ON qe.queueId = q.id
       WHERE qe.userId = ? AND qe.status IN ('waiting', 'checking_out')
       ORDER BY qe.joinTime ASC LIMIT 1`,
      [cleanUserId]
    );
    const entry = entryRows[0];

    if (entry) {
      await query(`UPDATE queueentry SET status = ? WHERE id = ?`, [finalStatus, entry.id]);
      if (finalStatus === 'served') {
        await query(
          `UPDATE service SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?`,
          [entry.tickets || 1, entry.serviceId]
        );
      }
    } else {
      await query(`UPDATE queueentry SET status = ? WHERE userId = ? AND status IN ('waiting', 'checking_out')`, [finalStatus, cleanUserId]);
    }

    res.status(201).json({ message: "Success" });
  } catch (err) {
    console.error("SQL Success History error:", err.message);
    res.status(500).json({ error: "Database execution error writing to group histories table." });
  }
});

export default router;
