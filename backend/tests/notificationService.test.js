import { db, resetDb } from '../data/db.js';
import {
  createNotification,
  notifyQueueJoin,
  notifyAlmostServed,
  isAlmostServed,
  ALMOST_THRESHOLD,
} from '../services/notificationService.js';

beforeEach(() => resetDb());

describe('isAlmostServed', () => {
  test('true at or under the threshold', () => {
    expect(isAlmostServed(1)).toBe(true);
    expect(isAlmostServed(ALMOST_THRESHOLD)).toBe(true);
  });

  test('false above the threshold or at position 0', () => {
    expect(isAlmostServed(ALMOST_THRESHOLD + 1)).toBe(false);
    expect(isAlmostServed(0)).toBe(false);
  });
});

describe('createNotification', () => {
  test('adds a notification with sensible defaults', () => {
    const notification = createNotification({
      userId: 'u1',
      type: 'test',
      message: 'hi',
    });
    expect(notification.id).toBeDefined();
    expect(notification.read).toBe(false);
    expect(notification.serviceId).toBeNull();
    expect(db.notifications).toHaveLength(1);
  });

  test('increments ids across notifications', () => {
    const a = createNotification({ userId: 'u1', type: 't', message: 'a' });
    const b = createNotification({ userId: 'u1', type: 't', message: 'b' });
    expect(b.id).toBe(a.id + 1);
  });
});

describe('notifyQueueJoin', () => {
  test('uses the real service name when it exists', () => {
    const notification = notifyQueueJoin('u1', 1);
    expect(notification.type).toBe('queue-join');
    expect(notification.message).toContain(db.services[0].name);
  });
});

describe('notifyAlmostServed', () => {
  test('includes the position in the message', () => {
    const notification = notifyAlmostServed('u1', 1, 2);
    expect(notification.type).toBe('almost-served');
    expect(notification.message).toContain('#2');
  });
});
