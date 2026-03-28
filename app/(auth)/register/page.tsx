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
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: 'https://app.veclabs.xyz',
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ width: 360 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Check your email</h1>
          <p style={{ color: '#666', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Check your email to confirm your account. Once confirmed you can sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fff',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: 360 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
            Create your account
          </h1>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
            Start building with Recall
          </p>
        </div>

        <button onClick={handleGitHub} style={githubButtonStyle}>
          <GitHubIcon />
          Continue with GitHub
        </button>

        <div style={dividerStyle}>
          <div style={dividerLineStyle} />
          <span style={{ color: '#999', fontSize: 12, padding: '0 12px', background: '#fff', position: 'relative', zIndex: 1 }}>or</span>
          <div style={dividerLineStyle} />
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={createButtonStyle}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13, color: '#666', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#111', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #e5e5e5',
  borderRadius: 4,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const githubButtonStyle: React.CSSProperties = {
  background: '#24292e',
  color: '#fff',
  border: 'none',
  padding: '10px 14px',
  borderRadius: 4,
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  justifyContent: 'center',
  width: '100%',
};

const createButtonStyle: React.CSSProperties = {
  background: '#111',
  color: '#fff',
  border: 'none',
  padding: 10,
  borderRadius: 4,
  fontSize: 14,
  cursor: 'pointer',
  width: '100%',
};

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0',
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#e5e5e5',
};
