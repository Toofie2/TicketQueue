export async function fetchNotifications(userId) {
  if (!userId) return [];
  const res = await fetch(`/api/notifications/${encodeURIComponent(userId)}`);
  const body = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(body.error || 'Unable to load notifications.');
  }
  return body;
}

export async function notifyQueueJoin({ userId, serviceId }) {
  if (!userId || !serviceId) return null;
  const res = await fetch('/api/notifications/queue-join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, serviceId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to create notification.');
  }
  return body;
}
