import { query } from './db/pool.js';
import { notifyReadyForCheckout } from './services/notificationService.js';

const notifyFrontUsers = async () => {
  try {
    const selectSql = `
      SELECT qe.userId, qe.id, qe.queueId, q.serviceId 
      FROM queueentry qe
      JOIN queue q ON qe.queueId = q.id
      WHERE qe.status = 'waiting'
      ORDER BY qe.joinTime ASC
    `;
    const [waitingEntries] = await query(selectSql);
    const frontSeen = new Set();

    for (const entry of waitingEntries) {
      if (frontSeen.has(entry.queueId)) continue;
      frontSeen.add(entry.queueId);
      const [existingNotice] = await query(
        'SELECT id FROM notification WHERE userId = ? AND serviceId = ? AND type = "ready-checkout" LIMIT 1',
        [entry.userId, entry.serviceId]
      );

      if (existingNotice.length === 0) {
        notifyReadyForCheckout(entry.userId, entry.serviceId);
        const msgText = `Your turn has arrived! Proceed to checkout.`;
        await query(
          'INSERT INTO notification (userId, serviceId, type, message, status) VALUES (?, ?, "ready-checkout", ?, "sent")',
          [entry.userId, entry.serviceId, msgText]
        );
      }
    }
  } catch (err) {
    console.error("Background notification loop tracking issue:", err.message);
  }
};

setInterval(notifyFrontUsers, 5000);
