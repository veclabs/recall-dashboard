'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview', icon: '⬡' },
  { href: '/keys', label: 'API Keys', icon: '⌘' },
  { href: '/collections', label: 'Collections', icon: '◈' },
  { href: '/usage', label: 'Usage', icon: '▤' },
  { href: '/pricing', label: 'Upgrade', icon: '↑' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <div style={{
      width: 240,
      background: '#0a0a0a',
      borderRight: '1px solid #1a1a1a',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}>
          <div style={{
            width: 28,
            height: 28,
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#000',
            fontFamily: 'monospace',
          }}>R</div>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.04em',
          }}>RECALL</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          padding: '3px 8px',
          borderRadius: 3,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ fontSize: 10, color: '#666', fontFamily: 'monospace', letterSpacing: '0.1em' }}>FREE PLAN</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {links.map(link => {
          const active = path === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 4,
              fontSize: 13,
              textDecoration: 'none',
              color: active ? '#ffffff' : '#555',
              background: active ? '#1a1a1a' : 'transparent',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.02em',
              marginBottom: 2,
              transition: 'color 0.15s, background 0.15s',
            }}>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #1a1a1a',
      }}>
        <a
          href="https://docs.veclabs.xyz"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            fontSize: 11,
            color: '#444',
            textDecoration: 'none',
            fontFamily: 'monospace',
            marginBottom: 4,
          }}
        >
          docs.veclabs.xyz ↗
        </a>
        <a
          href="https://github.com/veclabs/recall"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            fontSize: 11,
            color: '#444',
            textDecoration: 'none',
            fontFamily: 'monospace',
          }}
        >
          github ↗
        </a>
      </div>
    </div>
  );
}