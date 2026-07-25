// Talks to the backend History Module (backend/routes/historyRoutes.js).

export async function fetchHistory(email) {
  const res = await fetch(`/api/history/${encodeURIComponent(email)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to load history.');
  }
  return body;
}

// The server has no way to know the caller's timezone, so it would
// otherwise stamp records with its own (UTC) date. Sending the browser's
// local date keeps "today" matching what the user actually sees on screen.
function localDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Records a queue participation event (join/leave/served). Called from the
// Queue Management screens when a user's queue status changes. Logging
// failures shouldn't block the queue UI, so callers can fire-and-forget.
export async function logHistoryEvent({ email, event, outcome, date }) {
  if (!email) return null;
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, event, outcome, date: date || localDateString() }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to record history event.');
  }
  return body;
}