// Talks to the backend Authentication Module (backend/routes/authRoutes.js).
// CRA's dev server proxies /api/* to the backend (see "proxy" in package.json).

async function parseResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Something went wrong. Please try again.');
  }
  return body;
}

export async function registerUser({ email, password, name }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return parseResponse(res);
}

export async function loginUser({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}
