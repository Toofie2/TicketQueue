export async function fetchNotifications(userId) {
  if (!userId) return [];
  const res = await fetch(`/api/notifications/${encodeURIComponent(userId)}`);
  const body = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(body.error || 'Unable to load notifications.');
  }
  return body;
}
