'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import UsageBar from '@/components/UsageBar';

type PlanKey = 'free' | 'pro' | 'business' | 'enterprise';

const PLAN_LIMITS: Record<PlanKey, { writes: number; queries: number; vectors: number }> = {
  free:       { writes: 10_000,    queries: 50_000,     vectors: 100_000   },
  pro:        { writes: 500_000,   queries: 1_000_000,  vectors: 2_000_000 },
  business:   { writes: -1,        queries: -1,          vectors: -1        },
  enterprise: { writes: -1,        queries: -1,          vectors: -1        },
};

const PLAN_LABELS: Record<PlanKey, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

interface UsageData {
  plan?: string;
  writes?: number;
  queries?: number;
  vectors?: number;
}

function normalizePlan(raw?: string): PlanKey {
  const s = (raw ?? 'free').toLowerCase();
  if (s === 'pro') return 'pro';
  if (s === 'business') return 'business';
  if (s === 'enterprise') return 'enterprise';
  return 'free';
}

function UsagePageContent() {
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<UsageData>({});
  const [loading, setLoading] = useState(true);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (searchParams?.get('upgraded') === 'true') {
      setShowUpgradeBanner(true);
      const t = setTimeout(() => setShowUpgradeBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

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

  const plan = normalizePlan(usage.plan);
  const limits = PLAN_LIMITS[plan];
  const isUnlimited = limits.writes === -1;
  const isFreePlan = plan === 'free';

  return (
    <div>
      {showUpgradeBanner && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #16a34a',
          borderRadius: 4,
          padding: '12px 16px',
          color: '#15803d',
          fontSize: 14,
          marginBottom: 24,
        }}>
          You&apos;ve upgraded to {PLAN_LABELS[plan]}! Your new limits are now active.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: 0 }}>Usage</h1>
        <span style={{
          fontSize: 12,
          color: '#666',
          border: '1px solid #e5e5e5',
          borderRadius: 99,
          padding: '2px 10px',
        }}>
          {PLAN_LABELS[plan]}
        </span>
      </div>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 32px' }}>{month}</p>

      {loading ? (
        <p style={{ color: '#999', fontSize: 14 }}>Loading...</p>
      ) : isUnlimited ? (
        <div style={{ maxWidth: 480 }}>
          {(['Writes', 'Queries', 'Vectors'] as const).map(label => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#111', marginBottom: 6 }}>
                <span>{label}</span>
                <span style={{ color: '#999' }}>Unlimited</span>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 4, background: '#111', opacity: 0.15 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: 480 }}>
          <UsageBar label="Writes"   used={usage.writes  ?? 0} limit={limits.writes}  />
          <UsageBar label="Queries"  used={usage.queries ?? 0} limit={limits.queries} />
          <UsageBar label="Vectors"  used={usage.vectors ?? 0} limit={limits.vectors} />
        </div>
      )}

      {isFreePlan && !loading && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e5e5' }}>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>
            Need more? Upgrade to Pro for higher limits.
          </p>
          <a href="/pricing" style={{
            display: 'inline-block',
            background: '#111', color: '#fff', textDecoration: 'none',
            padding: '8px 16px', borderRadius: 4, fontSize: 13, fontWeight: 500,
          }}>
            View pricing
          </a>
        </div>
      )}
    </div>
  );
}

export default function UsagePage() {
  return (
    <Suspense>
      <UsagePageContent />
    </Suspense>
  );
}
