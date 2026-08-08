import 'dotenv/config';
import { createApp } from './apiServer.js';
import { db } from './data/db.js';
import { notifyReadyForCheckout } from './services/notificationService.js';
import { query } from './db/pool.js'; 

const PORT = process.env.PORT || 4000;
const isMock = (entry) => String(entry.userId).startsWith('mock-');
const notifyFrontUsers = async () => {
  try {
    const selectSql = `
      SELECT qe.userId, qe.id, qe.queueId, q.serviceId 
      FROM queueentry qe
      JOIN queue q ON qe.queueId = q.id
      WHERE qe.status = 'waiting'
      ORDER BY qe.joinTime ASC
    `;
    const waitingEntries = await query(selectSql);
    const entriesRows = Array.isArray(waitingEntries) ? waitingEntries : [waitingEntries];
    const frontSeen = new Set();

    for (const entry of entriesRows) {
      if (!entry || !entry.queueId) continue;
      if (frontSeen.has(entry.queueId)) continue;
      frontSeen.add(entry.queueId);

      const existingNotice = await query(
        'SELECT id FROM notification WHERE userId = ? AND serviceId = ? AND type = "ready-checkout" LIMIT 1',
        [entry.userId, entry.serviceId]
      );
      
      const noticeRows = Array.isArray(existingNotice) ? existingNotice : [];

      if (noticeRows.length === 0) {
        notifyReadyForCheckout(entry.userId, entry.serviceId);

        const msgText = `Your turn has arrived! Proceed to checkout.`;
        await query(
          'INSERT INTO notification (userId, serviceId, type, message, status) VALUES (?, ?, "ready-checkout", ?, "sent")',
          [entry.userId, entry.serviceId, msgText]
        );
        console.log(`🔔 Automated checkout alert persisted to cloud database for User ID: ${entry.userId}`);
      }
    }
  } catch (err) {
    console.error("Background notification loop tracking issue:", err.message);
  }
};

setInterval(notifyFrontUsers, 5000);

setInterval(() => {
  const eventsWithRealUsers = new Set(
    db.queue.filter((e) => !isMock(e)).map((e) => e.serviceId)
  );
  const servedEvents = new Set();
  db.queue = db.queue.filter((entry) => {
    if (
      isMock(entry) &&
      eventsWithRealUsers.has(entry.serviceId) &&
      !servedEvents.has(entry.serviceId)
    ) {
      servedEvents.add(entry.serviceId);
      return false;
    }
    return true;
  });
}, 60000);

setInterval(notifyFrontUsers, 5000);

createApp().listen(PORT, () => {
  console.log(`QueueSmart API running on http://localhost:${PORT}`);
});
