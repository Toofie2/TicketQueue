import { db } from '../data/db.js';

export const ALMOST_THRESHOLD = 3;

const nextId = (list) =>
  list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1;

export function isAlmostServed(position) {
  const pos = Number(position);
  return !Number.isNaN(pos) && pos > 0 && pos <= ALMOST_THRESHOLD;
}

function serviceName(serviceId) {
  const service = db.services.find((s) => s.id === Number(serviceId));
  return service ? service.name : `service ${serviceId}`;
}

export function createNotification({ userId, serviceId = null, type, message }) {
  const notification = {
    id: nextId(db.notifications),
    userId,
    serviceId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);
  return notification;
}

export function notifyQueueJoin(userId, serviceId) {
  return createNotification({
    userId,
    serviceId,
    type: 'queue-join',
    message: `You've joined the queue for ${serviceName(
      serviceId
    )}. We'll let you know when you're close.`,
  });
}

export function notifyAlmostServed(userId, serviceId, position) {
  return createNotification({
    userId,
    serviceId,
    type: 'almost-served',
    message: `You're #${position} in line for ${serviceName(
      serviceId
    )}. Get ready — you're almost up!`,
  });
}
