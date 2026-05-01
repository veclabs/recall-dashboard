'use client';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleGitHub() {
    await getSupabase().auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: 'https://app.veclabs.xyz/auth/callback' },
    });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await getSupabase().auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: 'https://app.veclabs.xyz' },
    });
    if (error) { setError(error.message); setLoading(false); }
    else setSuccess(true);
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c0f08' }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ width: 44, height: 44, background: '#c2692a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 auto 20px' }}>R</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fdf6ee', margin: '0 0 10px' }}>Check your email</h1>
          <p style={{ color: '#7a5a3e', fontSize: 13, lineHeight: 1.65, margin: 0 }}>
            Confirm your account to get your API key and start building.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left */}
      <div style={{ width: 400, background: '#1c0f08', borderRight: '1px solid #2e1a10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 40px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 52 }}>
            <div style={{ width: 28, height: 28, background: '#c2692a', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>R</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fdf6ee' }}>Recall</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fdf6ee', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Give your agent a memory it owns.
          </h2>
          <p style={{ fontSize: 13, color: '#7a5a3e', lineHeight: 1.65, margin: 0 }}>
            Free forever. No credit card required. Start building in minutes.
          </p>
        </div>
        <div style={{ borderTop: '1px solid #2e1a10', paddingTop: 22 }}>
          {[['Free', '5K vectors · 1K writes/mo'], ['Pro · $25/mo', '500K vectors · Irys storage'], ['Business · $199/mo', '5M vectors · Team keys']].map(([p, d]) => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: '#c2692a', fontWeight: 500 }}>{p}</span>
              <span style={{ fontSize: 11, color: '#5a3a20' }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfcfb', padding: '44px 40px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a120a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Create account</h1>
          <p style={{ fontSize: 13, color: '#b8a898', margin: '0 0 24px' }}>Free forever. No credit card required.</p>

          <button onClick={handleGitHub} style={{ width: '100%', background: '#1a120a', color: '#fdf6ee', border: 'none', padding: '11px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 18, fontFamily: 'inherit' }}>
            <GHIcon /> Continue with GitHub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18, gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#ede8e3' }} />
            <span style={{ fontSize: 11, color: '#c8b8a8' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#ede8e3' }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
            {error && <p style={{ fontSize: 12, color: '#b84040', padding: '8px 12px', background: '#fdf0f0', border: '1px solid #f0d0d0', borderRadius: 6, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ background: '#c2692a', color: '#fff', border: 'none', padding: '11px', borderRadius: 8, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 500, marginTop: 2 }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 12, color: '#b8a898', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#c2692a', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GHIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #ede8e3', borderRadius: 8,
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  color: '#1a120a', background: '#fff', fontFamily: 'inherit',
};
