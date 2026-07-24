// Talks to the backend History Module (backend/routes/historyRoutes.js).

export async function fetchHistory(email) {
  const res = await fetch(`/api/history/${encodeURIComponent(email)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Unable to load history.');
  }
  return body;
}
