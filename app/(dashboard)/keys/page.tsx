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

const FREE_KEY_LIMIT = 1;
const PRO_KEY_LIMIT = 5;

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
  const [copiedNewKey, setCopiedNewKey] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [provisionCopied, setProvisionCopied] = useState(false);
  const [activeKeyCopied, setActiveKeyCopied] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro' | 'business' | 'enterprise'>('free');

  const activeKey = getStoredApiKey();
  const keyLimit = plan === 'free' ? FREE_KEY_LIMIT : plan === 'pro' ? PRO_KEY_LIMIT : -1;
  const atLimit = keyLimit !== -1 && keys.length >= keyLimit;

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    setLoading(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const jwt = session?.access_token;
      const storedKey = getStoredApiKey();

      if (!storedKey && jwt) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/provision`,
          { method: 'POST', headers: { Authorization: `Bearer ${jwt}` } }
        );
        const data = await res.json();
        if (data.apiKey) {
          setStoredApiKey(data.apiKey);
          setNewlyCreatedKey(data.apiKey);
          const listResult = await api.listKeys(data.apiKey);
          applyKeys(listResult);
          return;
        }
      }

      const currentKey = getStoredApiKey();
      if (currentKey) {
        const [listResult, usageResult] = await Promise.all([
          api.listKeys(currentKey),
          api.getUsage(currentKey).catch(() => ({})),
        ]);
        applyKeys(listResult);
        if ((usageResult as any)?.plan) setPlan((usageResult as any).plan);
      } else {
        applyKeys([]);
      }
    } catch (err) {
      console.error('loadKeys error:', err);
      applyKeys([]);
    } finally {
      setLoading(false);
    }
  }

  function applyKeys(list: unknown) {
    const k = Array.isArray(list) ? (list as ApiKey[]) : [];
    setKeys(k);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) return;
    setCreating(true);
    try {
      const result = await api.createKey(getStoredApiKey() ?? '', newName);
      setNewKey(result.key ?? result.api_key ?? '');
      setNewName('');
      setShowCreate(false);
      await loadKeys();
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
      // If revoking the active key, clear it from localStorage
      const key = keys.find(k => k.id === id);
      if (key && activeKey?.startsWith(key.key_prefix ?? '___')) {
        localStorage.removeItem('recall_api_key');
      }
      loadKeys();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setRevokeId(null);
    }
  }

  return (
    <div style={{ maxWidth: 860 }}>

      {/* New key banner */}
      {newlyCreatedKey && (
        <div style={{
          border: '1px solid #111',
          background: '#0a0a0a',
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
              API KEY CREATED — SAVE IT NOW. WON'T BE SHOWN AGAIN.
            </p>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 18, lineHeight: 1, padding: '0 0 0 12px' }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <code style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: 12,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              color: '#4ade80',
              background: '#111',
              border: '1px solid #1a1a1a',
            }}>
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newlyCreatedKey);
                setProvisionCopied(true);
                setTimeout(() => setProvisionCopied(false), 2000);
              }}
              style={{
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid #e8e8e8',
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
                color: '#111',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}
            >
              {provisionCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
        paddingBottom: 24,
        borderBottom: '1px solid #f0f0f0',
      }}>
        <div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#111',
            margin: '0 0 4px',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '-0.01em',
          }}>
            API Keys
          </h1>
          <p style={{ fontSize: 12, color: '#999', margin: 0, fontFamily: 'monospace' }}>
            {keys.length} / {keyLimit === -1 ? '∞' : keyLimit} keys used
            {atLimit && plan === 'free' && (
              <span style={{ color: '#dc2626', marginLeft: 8 }}>
                · Free plan limit reached
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {atLimit && plan === 'free' && (
            <a href="/pricing" style={{
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#111',
              border: '1px solid #e8e8e8',
              padding: '7px 14px',
              textDecoration: 'none',
            }}>
              Upgrade for more →
            </a>
          )}
          <button
            onClick={() => !atLimit && setShowCreate(true)}
            disabled={atLimit}
            style={{
              background: atLimit ? '#f5f5f5' : '#111',
              color: atLimit ? '#bbb' : '#fff',
              border: 'none',
              padding: '8px 16px',
              fontSize: 12,
              cursor: atLimit ? 'not-allowed' : 'pointer',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.04em',
            }}
          >
            + Create key
          </button>
        </div>
      </div>

      {/* Active key highlight */}
      {activeKey && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 10,
            color: '#999',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
          }}>
            Active key (stored in this browser)
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e8e8e8',
            background: '#fafafa',
          }}>
            <code style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#111',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {activeKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeKey);
                setActiveKeyCopied(true);
                setTimeout(() => setActiveKeyCopied(false), 2000);
              }}
              style={{
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                borderLeft: '1px solid #e8e8e8',
                fontSize: 11,
                fontFamily: 'monospace',
                color: activeKeyCopied ? '#111' : '#999',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}
            >
              {activeKeyCopied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Create key modal */}
      {showCreate && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px', fontFamily: 'monospace' }}>
              Create API key
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Key name (e.g. Production)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                autoFocus
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={ghostButtonStyle}>
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

      {/* New key modal */}
      {newKey && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 8px', fontFamily: 'monospace' }}>
              New API key
            </h2>
            <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 14px', fontFamily: 'monospace' }}>
              Save this — it won't be shown again.
            </p>
            <div style={{
              background: '#0a0a0a',
              padding: '10px 14px',
              fontSize: 12,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              marginBottom: 12,
              color: '#4ade80',
            }}>
              {newKey}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  setCopiedNewKey(true);
                  setTimeout(() => setCopiedNewKey(false), 2000);
                }}
                style={ghostButtonStyle}
              >
                {copiedNewKey ? 'Copied ✓' : 'Copy'}
              </button>
              <button onClick={() => setNewKey('')} style={primaryButtonStyle}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys table */}
      {loading ? (
        <p style={{ color: '#999', fontSize: 13, fontFamily: 'monospace' }}>Loading...</p>
      ) : keys.length === 0 ? (
        <p style={{ color: '#999', fontSize: 13, fontFamily: 'monospace' }}>No API keys yet.</p>
      ) : (
        <div style={{ border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                {['KEY', 'NAME', 'CREATED', 'LAST USED', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontWeight: 500,
                    color: '#bbb',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((k, i) => {
                const prefix = k.key_prefix ?? k.id?.slice(0, 8) ?? '—';
                const isActive = activeKey?.startsWith(prefix);
                return (
                  <tr
                    key={k.id}
                    style={{
                      borderBottom: i < keys.length - 1 ? '1px solid #f8f8f8' : 'none',
                      background: isActive ? '#fafffe' : 'transparent',
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isActive && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                        )}
                        <code style={{ fontFamily: 'monospace', color: '#666', fontSize: 11 }}>
                          {prefix}••••••••••••••••
                        </code>
                      </div>
                    </td>
                    <td style={cellStyle}>{k.name ?? '—'}</td>
                    <td style={cellStyle}>{formatDate(k.created_at)}</td>
                    <td style={cellStyle}>{formatDate(k.last_used_at)}</td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokeId === k.id}
                        style={{
                          background: 'none',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '4px 10px',
                          fontSize: 11,
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                        }}
                      >
                        {revokeId === k.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #e8e8e8',
  borderRadius: 0,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'ui-monospace, monospace',
  color: '#111',
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#111',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'ui-monospace, monospace',
  letterSpacing: '0.04em',
};

const ghostButtonStyle: React.CSSProperties = {
  background: '#fff',
  color: '#111',
  border: '1px solid #e8e8e8',
  padding: '8px 16px',
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'ui-monospace, monospace',
};

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#111',
  verticalAlign: 'middle',
  fontFamily: 'monospace',
  fontSize: 12,
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e8e8e8',
  padding: '24px',
  width: 420,
  maxWidth: '90vw',
};