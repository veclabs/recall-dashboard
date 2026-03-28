const BASE = process.env.NEXT_PUBLIC_API_URL;

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('recall_api_key');
}

export function setStoredApiKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('recall_api_key', key);
}

async function apiFetch(path: string, options: RequestInit & { apiKey?: string } = {}) {
  const { apiKey, ...rest } = options;
  // Fall back to stored key when no explicit key provided (or empty string passed)
  const effectiveKey = apiKey || getStoredApiKey() || undefined;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(effectiveKey ? { Authorization: `Bearer ${effectiveKey}` } : {}),
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
