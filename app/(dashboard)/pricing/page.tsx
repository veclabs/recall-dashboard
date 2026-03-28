'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';

type PlanKey = 'free' | 'pro' | 'business' | 'enterprise';

interface PlanDef {
  key: PlanKey;
  name: string;
  price: string;
  priceNote: string;
  cta: string;
  ctaHref: string;
  ctaDisabled?: boolean;
  popular?: boolean;
}

const PLANS: PlanDef[] = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'per month',
    cta: 'Current plan',
    ctaHref: '#',
    ctaDisabled: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$25',
    priceNote: 'per month',
    cta: 'Upgrade to Pro',
    ctaHref: '#',
    popular: true,
  },
  {
    key: 'business',
    name: 'Business',
    price: '$199',
    priceNote: 'per month',
    cta: 'Upgrade to Business',
    ctaHref: '#',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Contact us',
    priceNote: '',
    cta: 'Contact us',
    ctaHref: 'mailto:hello@veclabs.xyz',
  },
];

interface Feature {
  label: string;
  values: Record<PlanKey, string>;
}

const FEATURES: Feature[] = [
  {
    label: 'Vectors',
    values: { free: '100K', pro: '2M', business: '20M', enterprise: 'Unlimited' },
  },
  {
    label: 'Writes / month',
    values: { free: '10K', pro: '500K', business: '5M', enterprise: 'Unlimited' },
  },
  {
    label: 'Queries / month',
    values: { free: '50K', pro: '1M', business: '10M', enterprise: 'Unlimited' },
  },
  {
    label: 'Collections',
    values: { free: '3', pro: '25', business: 'Unlimited', enterprise: 'Unlimited' },
  },
  {
    label: 'API keys',
    values: { free: '1', pro: '5', business: 'Unlimited', enterprise: 'Unlimited' },
  },
  {
    label: 'Merkle proofs',
    values: { free: '✓', pro: '✓', business: '✓', enterprise: '✓' },
  },
  {
    label: 'Memory Inspector',
    values: { free: '✓', pro: '✓', business: '✓', enterprise: '✓' },
  },
  {
    label: 'Shadow Drive',
    values: { free: '–', pro: '✓', business: '✓', enterprise: '✓' },
  },
  {
    label: 'Priority support',
    values: { free: '–', pro: '–', business: '✓', enterprise: '✓' },
  },
  {
    label: 'SLA',
    values: { free: '–', pro: '–', business: '99.9%', enterprise: 'Custom' },
  },
];

function featureColor(val: string): string {
  if (val === '✓') return '#16a34a';
  if (val === '–') return '#999';
  return '#111';
}

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getSupabase().auth.getSession();
        const token = data.session?.access_token ?? '';
        const keys = await api.listKeys(token);
        const key = keys?.[0]?.key ?? keys?.[0]?.id ?? token;
        const result = await api.getUsage(key);
        const raw = (result?.plan ?? 'free').toLowerCase() as PlanKey;
        if (['free', 'pro', 'business', 'enterprise'].includes(raw)) {
          setCurrentPlan(raw);
        }
      } catch {
        // default to free
      }
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Pricing</h1>
        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Choose the plan that fits your project.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}>
        {PLANS.map(plan => {
          const isCurrentPlan = plan.key === currentPlan;
          const isFree = plan.key === 'free';
          const ctaDisabled = isFree && isCurrentPlan;

          return (
            <div
              key={plan.key}
              style={{
                border: plan.popular ? '1px solid #111' : '1px solid #e5e5e5',
                borderRadius: 6,
                background: '#fff',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <span style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#111',
                  border: '1px solid #111',
                  borderRadius: 99,
                  padding: '2px 8px',
                  letterSpacing: '0.03em',
                }}>
                  Popular
                </span>
              )}

              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {plan.name}
              </p>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{plan.price}</span>
                {plan.priceNote && (
                  <span style={{ fontSize: 13, color: '#999', marginLeft: 4 }}>{plan.priceNote}</span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e5e5e5', marginBottom: 20 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                {FEATURES.map(feature => {
                  const val = feature.values[plan.key];
                  return (
                    <div key={feature.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span style={{ color: '#666' }}>{feature.label}</span>
                      <span style={{ color: featureColor(val), fontWeight: val === '✓' || val === '–' ? 500 : 400 }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              <a
                href={plan.key === 'enterprise' ? 'mailto:hello@veclabs.xyz' : (isCurrentPlan ? '#' : plan.ctaHref)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '8px 14px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  cursor: ctaDisabled ? 'default' : 'pointer',
                  background: ctaDisabled ? '#f5f5f5' : '#111',
                  color: ctaDisabled ? '#999' : '#fff',
                  border: ctaDisabled ? '1px solid #e5e5e5' : 'none',
                  pointerEvents: ctaDisabled ? 'none' : 'auto',
                }}
                aria-disabled={ctaDisabled}
              >
                {isCurrentPlan && plan.key !== 'enterprise' ? 'Current plan' : plan.cta}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
