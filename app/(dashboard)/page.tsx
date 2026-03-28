'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import StatCard from '@/components/StatCard';

interface Usage {
  collections?: number;
  writes?: number;
  queries?: number;
  api_key?: string;
}

export default function OverviewPage() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [usage, setUsage] = useState<Usage>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getSupabase().auth.getUser();
      if (data.user?.email) setEmail(data.user.email);

      try {
        const keys = await api.listKeys('');
        const key = keys?.[0]?.key ?? keys?.[0]?.id ?? '';
        setApiKey(key);
        if (key) {
          const u = await api.getUsage(key);
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

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Overview</h1>
        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{email}</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
        <StatCard
          label="Total Collections"
          value={loading ? '—' : (usage.collections ?? 0)}
        />
        <StatCard
          label="Writes"
          value={loading ? '—' : (usage.writes ?? 0)}
          sub="this month"
        />
        <StatCard
          label="Queries"
          value={loading ? '—' : (usage.queries ?? 0)}
          sub="this month"
        />
      </div>

      <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Quick start</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Install</p>
            <pre style={codeStyle}>{`npm install recall-sdk`}</pre>
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 6px' }}>Initialize</p>
            <pre style={codeStyle}>{`import { Recall } from 'recall-sdk';

const recall = new Recall({
  apiKey: '${apiKey || 'YOUR_API_KEY'}',
});

// Create a collection
const col = await recall.collections.create({ name: 'my-docs', dimensions: 1536 });

// Add vectors
await recall.collections.write(col.id, { vectors: [...] });

// Query
const results = await recall.collections.query(col.id, { vector: [...], topK: 5 });`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  background: '#f9f9f9',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  padding: '14px 16px',
  fontSize: 13,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: 0,
  overflowX: 'auto',
  color: '#111',
  lineHeight: 1.6,
};
