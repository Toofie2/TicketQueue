// Talks to the backend History Module (backend/routes/historyRoutes.js).

export async function fetchHistory(email) {
  const res = await fetch(`/api/history/${encodeURIComponent(email)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to load history.');
  }
  return body;
}

// Records a queue participation event (join/leave/served). Called from the
// Queue Management screens when a user's queue status changes. Logging
// failures shouldn't block the queue UI, so callers can fire-and-forget.
export async function logHistoryEvent({ email, event, outcome }) {
  if (!email) return null;
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, event, outcome }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to record history event.');
  }
  return body;
}
