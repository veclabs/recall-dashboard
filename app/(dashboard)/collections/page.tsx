'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { api } from '@/lib/api';

interface Collection {
  id: string;
  name?: string;
  dimensions?: number;
  metric?: string;
  vector_count?: number;
  merkle_root?: string;
  created_at?: string;
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(s?: string, n = 12) {
  if (!s) return '—';
  return s.length > n ? s.slice(0, n) + '...' : s;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getSupabase().auth.getSession();
        const token = data.session?.access_token ?? '';
        const result = await api.listCollections(token);
        setCollections(Array.isArray(result) ? result : []);
      } catch {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Collections</h1>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
          Create collections via the API:{' '}
          <code style={{ fontFamily: 'monospace', background: '#f9f9f9', padding: '1px 5px', borderRadius: 3, border: '1px solid #e5e5e5' }}>
            POST /api/v1/collections
          </code>
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#999', fontSize: 14 }}>Loading...</p>
      ) : collections.length === 0 ? (
        <p style={{ color: '#999', fontSize: 14 }}>No collections yet.</p>
      ) : (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e5e5' }}>
                {['NAME', 'DIMENSIONS', 'METRIC', 'VECTORS', 'MERKLE ROOT', 'CREATED'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 500,
                    color: '#999', fontSize: 11, letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < collections.length - 1 ? '1px solid #e5e5e5' : 'none' }}>
                  <td style={cellStyle}><strong>{c.name ?? c.id}</strong></td>
                  <td style={cellStyle}>{c.dimensions ?? '—'}</td>
                  <td style={cellStyle}>{c.metric ?? '—'}</td>
                  <td style={cellStyle}>{c.vector_count?.toLocaleString() ?? '—'}</td>
                  <td style={cellStyle}>
                    <code style={{ fontFamily: 'monospace', color: '#666', fontSize: 12 }}>
                      {truncate(c.merkle_root)}
                    </code>
                  </td>
                  <td style={cellStyle}>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '12px 16px', color: '#111', verticalAlign: 'middle',
};
