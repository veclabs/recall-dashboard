'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api, getStoredApiKey, setStoredApiKey } from '@/lib/api';
import StatCard from '@/components/StatCard';

interface Usage {
  collections?: number;
  writes?: number;
  queries?: number;
  write_count?: number;
  query_count?: number;
  vector_count?: number;
}

const LIMITS = { vectors: 5_000, writes: 1_000, queries: 10_000 };

export default function OverviewPage() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [usage, setUsage] = useState<Usage>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'ts' | 'py'>('ts');

  useEffect(() => {
    async function load() {
      const { data } = await getSupabase().auth.getUser();
      if (data.user?.email) setEmail(data.user.email);
      try {
        const storedKey = getStoredApiKey();
        if (!storedKey) {
          const { data: { session } } = await getSupabase().auth.getSession();
          const jwt = session?.access_token;
          if (jwt) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/provision`,
              { method: 'POST', headers: { Authorization: `Bearer ${jwt}` } });
            const provData = await res.json();
            if (provData.apiKey) setStoredApiKey(provData.apiKey);
          }
        }
        const activeKey = getStoredApiKey();
        if (activeKey) {
          setApiKey(activeKey);
          const u = await api.getUsage(activeKey);
          setUsage(u);
        }
      } catch { /* no keys yet */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const writes = usage.write_count ?? usage.writes ?? 0;
  const queries = usage.query_count ?? usage.queries ?? 0;
  const vectors = usage.vector_count ?? 0;
  const collections = usage.collections ?? 0;

  const tsCode = `import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ apiKey: '${apiKey || 'YOUR_API_KEY'}' });
const col = sv.collection('agent-memory', { dimensions: 1536 });

await col.upsert([{
  id: 'mem_001',
  values: embedding,
  metadata: { text: 'User prefers dark mode' },
}]);

const results = await col.query({ vector: queryEmbedding, topK: 5 });`;

  const pyCode = `from solvec import SolVec

sv = SolVec(api_key='${apiKey || 'YOUR_API_KEY'}')
col = sv.collection('agent-memory', dimensions=1536)

col.upsert([{
    'id': 'mem_001',
    'values': embedding,
    'metadata': {'text': 'User prefers dark mode'},
}])

results = col.query(vector=query_embedding, top_k=5)`;

  return (
    <div style={{ maxWidth: 820 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{email}</p>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          API Key
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--card-bg)',
          border: '1px solid var(--content-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <code style={{
            flex: 1, padding: '11px 16px', fontSize: 12,
            fontFamily: 'ui-monospace, monospace', color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {loading ? '—' : (apiKey || 'Not provisioned')}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
              padding: '11px 16px', background: 'none', border: 'none',
              borderLeft: '1px solid var(--content-border)', fontSize: 11,
              color: copied ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'color 0.15s',
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          This month · Free plan
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <StatCard label="Writes" value={loading ? '—' : writes.toLocaleString()} limit={LIMITS.writes} />
          <StatCard label="Queries" value={loading ? '—' : queries.toLocaleString()} limit={LIMITS.queries} />
          <StatCard label="Vectors" value={loading ? '—' : vectors.toLocaleString()} limit={LIMITS.vectors} />
          <StatCard label="Collections" value={loading ? '—' : collections.toLocaleString()} />
        </div>
      </div>

      {/* Quick start */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          Quick start
        </p>

        {/* Install */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>1 · Install</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['npm install @veclabs/solvec', 'pip install solvec --pre'].map(cmd => (
              <pre key={cmd} style={{
                flex: 1, margin: 0, padding: '10px 14px', background: 'var(--code-bg)',
                border: '1px solid var(--code-border)', borderRadius: 8,
                fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--text-secondary)',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>$ </span>{cmd}
              </pre>
            ))}
          </div>
        </div>

        {/* Code tabs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>2 · Use</p>
            <div style={{ display: 'flex', gap: 0, border: '1px solid var(--content-border)', borderRadius: 6, overflow: 'hidden' }}>
              {(['ts', 'py'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '5px 14px', fontSize: 11, fontFamily: 'inherit',
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                }}>
                  {t === 'ts' ? 'TypeScript' : 'Python'}
                </button>
              ))}
            </div>
          </div>
          <pre style={{
            margin: 0, padding: '16px 18px', background: '#1c0f08',
            border: '1px solid #2e1a10', borderRadius: 8,
            fontSize: 12, fontFamily: 'ui-monospace, monospace',
            color: '#d4bfa8', lineHeight: 1.7, overflowX: 'auto',
          }}>
            {tab === 'ts' ? tsCode : pyCode}
          </pre>
        </div>
      </div>

      {/* Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Documentation', href: 'https://docs.veclabs.xyz', desc: 'API reference, guides, security model' },
          { label: 'GitHub', href: 'https://github.com/veclabs/recall', desc: 'Rust core · Apache-2.0' },
          { label: 'Solana Explorer', href: 'https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet', desc: 'Live on devnet' },
        ].map(r => (
          <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', padding: '14px 16px',
            background: 'var(--card-bg)', border: '1px solid var(--content-border)',
            borderRadius: 8, textDecoration: 'none', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--content-border)'}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px' }}>
              {r.label} ↗
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{r.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
