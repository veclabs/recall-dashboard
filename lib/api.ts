const BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch(path: string, options: RequestInit & { apiKey?: string } = {}) {
  const { apiKey, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...rest.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listKeys: (apiKey: string) =>
    apiFetch('/api/v1/keys', { apiKey }),

  createKey: (apiKey: string, name: string) =>
    apiFetch('/api/v1/keys', {
      method: 'POST',
      apiKey,
      body: JSON.stringify({ name }),
    }),

  revokeKey: (apiKey: string, id: string) =>
    apiFetch(`/api/v1/keys/${id}`, { method: 'DELETE', apiKey }),

  listCollections: (apiKey: string) =>
    apiFetch('/api/v1/collections', { apiKey }),

  getUsage: (apiKey: string) =>
    apiFetch('/api/v1/usage', { apiKey }),
};
