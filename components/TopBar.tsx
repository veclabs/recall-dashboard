'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    router.push('/login');
  }

  return (
    <div style={{
      height: 52,
      borderBottom: '1px solid var(--content-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 32px',
      background: 'var(--content-bg)',
      gap: 16,
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{email}</span>
      <button
        onClick={handleSignOut}
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          background: 'none',
          border: '1px solid var(--content-border)',
          padding: '5px 12px',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
