'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import UsageBar from '@/components/UsageBar';

const FREE_LIMITS = {
  writes: 10000,
  queries: 10000,
  vectors: 100000,
};

interface UsageData {
  plan?: string;
  writes?: number;
  queries?: number;
  vectors?: number;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData>({});
  const [loading, setLoading] = useState(true);

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getSupabase().auth.getSession();
        const token = data.session?.access_token ?? '';
        const keys = await api.listKeys(token);
        const key = keys?.[0]?.key ?? keys?.[0]?.id ?? token;
        const result = await api.getUsage(key);
        setUsage(result);
      } catch {
        setUsage({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const plan = usage.plan ?? 'free';
  const isFreePlan = plan.toLowerCase() === 'free';

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Usage</h1>
        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{month}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-block', fontSize: 12, fontWeight: 500,
          padding: '3px 10px', borderRadius: 20, border: '1px solid #e5e5e5',
          color: isFreePlan ? '#666' : '#16a34a',
          background: isFreePlan ? '#fff' : '#f0fdf4',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {isFreePlan ? 'Free' : 'Pro'}
        </span>
      </div>

      {loading ? (
        <p style={{ color: '#999', fontSize: 14 }}>Loading...</p>
      ) : (
        <div style={{ maxWidth: 480 }}>
          <UsageBar label="Writes" used={usage.writes ?? 0} limit={FREE_LIMITS.writes} />
          <UsageBar label="Queries" used={usage.queries ?? 0} limit={FREE_LIMITS.queries} />
          <UsageBar label="Vectors" used={usage.vectors ?? 0} limit={FREE_LIMITS.vectors} />
        </div>
      )}

      {isFreePlan && !loading && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e5e5' }}>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>
            Need more? Upgrade to Pro for higher limits.
          </p>
          <button style={{
            background: '#111', color: '#fff', border: 'none', padding: '8px 16px',
            borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
