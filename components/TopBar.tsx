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
      height: 52, borderBottom: '1px solid #e5e5e5', display: 'flex',
      alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px',
      background: '#fff', gap: 16,
    }}>
      {email && (
        <span style={{ fontSize: 13, color: '#666' }}>{email}</span>
      )}
      <button
        onClick={handleSignOut}
        style={{
          border: '1px solid #e5e5e5', background: '#fff', padding: '6px 14px',
          borderRadius: 4, fontSize: 13, cursor: 'pointer', color: '#111',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
