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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        fontFamily: 'ui-monospace, monospace',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{
            width: 48, height: 48,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#000',
            margin: '0 auto 24px',
          }}>R</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>
            Check your email
          </h1>
          <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Confirm your account to get your API key and start building with Recall.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }}>
      {/* Left panel */}
      <div style={{
        width: 420,
        background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 40px',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 32, height: 32,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#000',
            }}>R</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '0.06em' }}>
              RECALL
            </span>
          </div>

          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 12px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            Give your agent a memory it owns.
          </h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
            Free tier includes 5K vectors, 1K writes, and 10K queries per month.
            No credit card required.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24 }}>
          {[
            ['Free', '5K vectors · 1K writes/mo'],
            ['Pro · $25/mo', '500K vectors · Irys storage'],
            ['Business · $199/mo', '5M vectors · Team keys'],
          ].map(([plan, desc]) => (
            <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#fff' }}>{plan}</span>
              <span style={{ fontSize: 11, color: '#444' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#111',
              margin: '0 0 4px',
              letterSpacing: '-0.01em',
            }}>
              Create account
            </h1>
            <p style={{ color: '#999', fontSize: 13, margin: 0 }}>
              Free forever. No credit card required.
            </p>
          </div>

          <button onClick={handleGitHub} style={githubButtonStyle}>
            <GitHubIcon />
            Continue with GitHub
          </button>

          <div style={dividerStyle}>
            <div style={dividerLineStyle} />
            <span style={{ color: '#ccc', fontSize: 11, padding: '0 12px', background: '#fff', position: 'relative', zIndex: 1 }}>
              or
            </span>
            <div style={dividerLineStyle} />
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
            />
            {error && (
              <p style={{
                color: '#dc2626', fontSize: 12, margin: 0,
                padding: '8px 12px', background: '#fef2f2',
                border: '1px solid #fecaca',
              }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#111', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>

          <p style={{ marginTop: 16, fontSize: 11, color: '#ccc', textAlign: 'center', lineHeight: 1.5 }}>
            By creating an account you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #e8e8e8',
  borderRadius: 0,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'ui-monospace, monospace',
  color: '#111',
  background: '#fafafa',
};

const githubButtonStyle: React.CSSProperties = {
  background: '#0a0a0a',
  color: '#fff',
  border: 'none',
  padding: '11px 14px',
  borderRadius: 0,
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  justifyContent: 'center',
  width: '100%',
  fontFamily: 'ui-monospace, monospace',
  letterSpacing: '0.02em',
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#111',
  color: '#fff',
  border: 'none',
  padding: '11px',
  borderRadius: 0,
  fontSize: 13,
  cursor: 'pointer',
  width: '100%',
  fontFamily: 'ui-monospace, monospace',
  letterSpacing: '0.04em',
};

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0',
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: '#f0f0f0',
};