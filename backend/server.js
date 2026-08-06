import 'dotenv/config';
import { createApp } from './apiServer.js';
import { db } from './data/db.js';
import { notifyReadyForCheckout } from './services/notificationService.js';

const PORT = process.env.PORT || 4000;

const isMock = (entry) => String(entry.userId).startsWith('mock-');

const notifyFrontUsers = () => {
  const frontSeen = new Set();
  db.queue.forEach((entry) => {
    if (frontSeen.has(entry.serviceId)) return;
    frontSeen.add(entry.serviceId);
    if (!isMock(entry) && !entry.notifiedReady) {
      entry.notifiedReady = true;
      const service = db.services.find((s) => s.name === entry.serviceId);
      notifyReadyForCheckout(entry.userId, service ? service.id : null);
    }
  });
};

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
