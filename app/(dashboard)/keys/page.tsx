'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api, getStoredApiKey, setStoredApiKey } from '@/lib/api';

interface ApiKey {
  id: string;
  key_prefix?: string;
  name?: string;
  created_at?: string;
  last_used_at?: string;
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [provisionCopied, setProvisionCopied] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    setLoading(true);
    try {
      // Step 1: Get Supabase session JWT
      const { data: { session } } = await getSupabase().auth.getSession();
      const jwt = session?.access_token;

      // Step 2: Check if we already have a stored vl_live_ key
      const storedKey = getStoredApiKey();

      // Step 3: If no stored key, call provision
      if (!storedKey && jwt) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/provision`,
          { method: 'POST', headers: { Authorization: `Bearer ${jwt}` } }
        );
        const data = await res.json();
        if (data.apiKey) {
          setStoredApiKey(data.apiKey);
          setNewlyCreatedKey(data.apiKey);
        }
      }

      // Step 4: Load keys list using the stored key
      const activeKey = getStoredApiKey();
      if (activeKey) {
        const result = await api.listKeys(activeKey);
        setKeys(Array.isArray(result) ? result : []);
      } else {
        setKeys([]);
      }
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await api.createKey(getStoredApiKey() ?? '', newName);
      setNewKey(result.key ?? result.api_key ?? '');
      setNewName('');
      setShowCreate(false);
      loadKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this key? This cannot be undone.')) return;
    setRevokeId(id);
    try {
      await api.revokeKey(getStoredApiKey() ?? '', id);
      loadKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setRevokeId(null);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleProvisionCopy() {
    if (!newlyCreatedKey) return;
    navigator.clipboard.writeText(newlyCreatedKey);
    setProvisionCopied(true);
    setTimeout(() => setProvisionCopied(false), 2000);
  }

  return (
    <div>
      {newlyCreatedKey && (
        <div style={{
          border: '1px solid #d97706',
          background: '#fffbeb',
          borderRadius: 6,
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: '#92400e', margin: 0, fontWeight: 500 }}>
              Your API key was created. Save it — it won&apos;t be shown again.
            </p>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: 16, lineHeight: 1, padding: '0 0 0 12px' }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div style={{
            background: '#fff', border: '1px solid #fcd34d', borderRadius: 4,
            padding: '10px 12px', fontSize: 13, fontFamily: 'monospace',
            wordBreak: 'break-all', color: '#111', marginBottom: 10,
          }}>
            {newlyCreatedKey}
          </div>
          <button onClick={handleProvisionCopy} style={buttonStyle}>
            {provisionCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: 0 }}>API Keys</h1>
        <button onClick={() => setShowCreate(true)} style={primaryButtonStyle}>
          Create key
        </button>
      </div>

      {showCreate && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Create API key</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text" placeholder="Key name (e.g. Production)" value={newName}
                onChange={e => setNewName(e.target.value)} required autoFocus
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={buttonStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={primaryButtonStyle}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newKey && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>Your new API key</h2>
            <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 16px' }}>
              Save this — it won&apos;t be shown again.
            </p>
            <div style={{
              background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 4,
              padding: '10px 12px', fontSize: 13, fontFamily: 'monospace',
              wordBreak: 'break-all', marginBottom: 12, color: '#111',
            }}>
              {newKey}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={handleCopy} style={buttonStyle}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setNewKey('')} style={primaryButtonStyle}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#999', fontSize: 14 }}>Loading...</p>
      ) : keys.length === 0 ? (
        <p style={{ color: '#999', fontSize: 14 }}>No API keys yet. Create one to get started.</p>
      ) : (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}>
                {['PREFIX', 'NAME', 'CREATED', 'LAST USED', 'ACTIONS'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 500,
                    color: '#999', fontSize: 11, letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => (
                <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? '1px solid #e5e5e5' : 'none' }}>
                  <td style={cellStyle}>
                    <code style={{ fontFamily: 'monospace', color: '#666' }}>{k.key_prefix ?? k.id?.slice(0, 8) ?? '—'}</code>
                  </td>
                  <td style={cellStyle}>{k.name ?? '—'}</td>
                  <td style={cellStyle}>{formatDate(k.created_at)}</td>
                  <td style={cellStyle}>{formatDate(k.last_used_at)}</td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => handleRevoke(k.id)}
                      disabled={revokeId === k.id}
                      style={dangerButtonStyle}
                    >
                      {revokeId === k.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 4,
  fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid #e5e5e5', background: '#fff', padding: '6px 14px',
  borderRadius: 4, fontSize: 13, cursor: 'pointer', color: '#111',
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#111', color: '#fff', border: 'none', padding: '6px 14px',
  borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 500,
};

const dangerButtonStyle: React.CSSProperties = {
  background: '#fff', color: '#dc2626', border: '1px solid #dc2626',
  padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
};

const cellStyle: React.CSSProperties = {
  padding: '12px 16px', color: '#111', verticalAlign: 'middle',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 6, border: '1px solid #e5e5e5',
  padding: '24px', width: 420, maxWidth: '90vw',
};
