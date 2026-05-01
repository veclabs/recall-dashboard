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

const PLAN_LIMITS = {
  free: { vectors: 5_000, writes: 1_000, queries: 10_000 },
  pro: { vectors: 500_000, writes: 50_000, queries: 500_000 },
  business: { vectors: 5_000_000, writes: 500_000, queries: 5_000_000 },
};

const codeStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #1a1a1a',
  padding: '16px 18px',
  fontSize: 12,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: 0,
  overflowX: 'auto',
  color: '#e5e5e5',
  lineHeight: 1.7,
  borderRadius: 0,
};

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
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/provision`,
              { method: 'POST', headers: { Authorization: `Bearer ${jwt}` } }
            );
            const provData = await res.json();
            if (provData.apiKey) {
              setStoredApiKey(provData.apiKey);
            }
          }
        }

        const activeKey = getStoredApiKey();
        if (activeKey) {
          setApiKey(activeKey);
          const u = await api.getUsage(activeKey);
          setUsage(u);
        }
      } catch {
        // no keys yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const limits = PLAN_LIMITS.free;
  const writes = usage.write_count ?? usage.writes ?? 0;
  const queries = usage.query_count ?? usage.queries ?? 0;
  const vectors = usage.vector_count ?? 0;
  const collections = usage.collections ?? 0;

  const tsCode = `import { SolVec } from '@veclabs/solvec';

const sv = new SolVec({ apiKey: '${apiKey || 'YOUR_API_KEY'}' });
const col = sv.collection('agent-memory', { dimensions: 1536 });

await col.upsert([{
  id: 'mem_001',
  values: embedding,          // float[] 1536-dim
  metadata: { text: 'User prefers dark mode' },
}]);

const results = await col.query({ vector: queryEmbedding, topK: 5 });
// results.matches: [{ id, score, metadata }]

// Verify integrity (Pro+)
const proof = await col.verify();
console.log(proof.solanaExplorerUrl);`;

  const pyCode = `from solvec import SolVec

sv = SolVec(api_key='${apiKey || 'YOUR_API_KEY'}')
col = sv.collection('agent-memory', dimensions=1536)

col.upsert([{
    'id': 'mem_001',
    'values': embedding,          # list[float] 1536-dim
    'metadata': {'text': 'User prefers dark mode'},
}])

results = col.query(vector=query_embedding, top_k=5)
# results.matches: [{'id', 'score', 'metadata'}]

# Verify integrity (Pro+)
proof = col.verify()
print(proof.solana_explorer_url)`;

  return (
    <div style={{ maxWidth: 860 }}>

      {/* Header */}
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#111',
              margin: '0 0 4px',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '-0.01em',
            }}>
              Overview
            </h1>
            <p style={{ fontSize: 13, color: '#999', margin: 0, fontFamily: 'monospace' }}>
              {email}
            </p>
          </div>
          <a
            href="/pricing"
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              background: '#111',
              border: 'none',
              padding: '8px 14px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Upgrade →
          </a>
        </div>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 10,
          color: '#999',
          margin: '0 0 8px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontFamily: 'monospace',
        }}>
          API Key
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #e8e8e8',
          background: '#fafafa',
        }}>
          <code style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 12,
            fontFamily: 'ui-monospace, monospace',
            color: '#111',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {loading ? '—' : (apiKey || 'Not provisioned')}
          </code>
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderLeft: '1px solid #e8e8e8',
              fontSize: 11,
              fontFamily: 'monospace',
              color: copied ? '#111' : '#999',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#bbb', margin: '6px 0 0', fontFamily: 'monospace' }}>
          Keep this secret. Rotatable from the API Keys page.
        </p>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 10,
          color: '#999',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontFamily: 'monospace',
        }}>
          This month · Free plan
        </p>
        <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <StatCard
            label="Writes"
            value={loading ? '—' : writes.toLocaleString()}
            limit={limits.writes}
          />
          <StatCard
            label="Queries"
            value={loading ? '—' : queries.toLocaleString()}
            limit={limits.queries}
          />
          <StatCard
            label="Vectors"
            value={loading ? '—' : vectors.toLocaleString()}
            limit={limits.vectors}
          />
          <StatCard
            label="Collections"
            value={loading ? '—' : collections.toLocaleString()}
          />
        </div>
      </div>

      {/* Quick start */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 10,
          color: '#999',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontFamily: 'monospace',
        }}>
          Quick start
        </p>

        {/* Install */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px', fontFamily: 'monospace' }}>
            1 · Install
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <pre style={{ ...codeStyle, flex: 1, padding: '10px 16px' }}>
              <span style={{ color: '#666' }}>$</span>{' '}
              <span style={{ color: '#4ade80' }}>npm install</span>{' '}
              @veclabs/solvec
            </pre>
            <pre style={{ ...codeStyle, flex: 1, padding: '10px 16px' }}>
              <span style={{ color: '#666' }}>$</span>{' '}
              <span style={{ color: '#4ade80' }}>pip install</span>{' '}
              solvec --pre
            </pre>
          </div>
        </div>

        {/* Code */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px', fontFamily: 'monospace' }}>
              2 · Use
            </p>
            <div style={{ display: 'flex', gap: 0 }}>
              {(['ts', 'py'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    background: tab === t ? '#0a0a0a' : '#f0f0f0',
                    color: tab === t ? '#fff' : '#999',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                  }}
                >
                  {t === 'ts' ? 'TypeScript' : 'Python'}
                </button>
              ))}
            </div>
          </div>
          <pre style={codeStyle}>{tab === 'ts' ? tsCode : pyCode}</pre>
        </div>
      </div>

      {/* Resources */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
      }}>
        {[
          { label: 'Documentation', href: 'https://docs.veclabs.xyz', desc: 'API reference, guides, security model' },
          { label: 'GitHub', href: 'https://github.com/veclabs/recall', desc: 'Rust core, open source, Apache-2.0' },
          { label: 'Solana Explorer', href: `https://explorer.solana.com/address/8xjQ2XrdhR4JkGAdTEB7i34DBkbrLRkcgchKjN1Vn5nP?cluster=devnet`, desc: 'Live on devnet · 8xjQ2X…Vn5nP' },
        ].map(r => (
          <a
            key={r.label}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '16px 20px',
              border: '1px solid #f0f0f0',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}
          >
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#111',
              margin: '0 0 4px',
              fontFamily: 'monospace',
            }}>
              {r.label} ↗
            </p>
            <p style={{ fontSize: 11, color: '#999', margin: 0, fontFamily: 'monospace' }}>
              {r.desc}
            </p>
          </a>
        ))}
      </div>

    </div>
  );
}