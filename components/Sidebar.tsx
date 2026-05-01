'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/keys', label: 'API Keys' },
  { href: '/collections', label: 'Collections' },
  { href: '/usage', label: 'Usage' },
  { href: '/pricing', label: 'Upgrade' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <div style={{
      width: 224,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 10,
        }}>
          <div style={{
            width: 26,
            height: 26,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            borderRadius: 5,
            flexShrink: 0,
          }}>R</div>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--sidebar-text-active)',
            letterSpacing: '0.04em',
          }}>Recall</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(194,105,42,0.15)',
          border: '1px solid rgba(194,105,42,0.25)',
          padding: '3px 9px',
          borderRadius: 20,
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--accent)',
          }} />
          <span style={{
            fontSize: 10,
            color: 'var(--accent-light)',
            letterSpacing: '0.06em',
          }}>Free plan</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 10px', flex: 1 }}>
        {links.map(link => {
          const active = path === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 13,
                textDecoration: 'none',
                color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                background: active ? 'var(--sidebar-active)' : 'transparent',
                fontWeight: active ? 500 : 400,
                marginBottom: 1,
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--sidebar-hover)';
                  e.currentTarget.style.color = 'var(--sidebar-text-active)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <a href="https://docs.veclabs.xyz" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: 'var(--sidebar-text)', textDecoration: 'none', opacity: 0.7 }}>
          Documentation ↗
        </a>
        <a href="https://github.com/veclabs/recall" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: 'var(--sidebar-text)', textDecoration: 'none', opacity: 0.7 }}>
          GitHub ↗
        </a>
      </div>
    </div>
  );
}
