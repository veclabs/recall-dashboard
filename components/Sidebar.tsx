'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/keys', label: 'API Keys' },
  { href: '/collections', label: 'Collections' },
  { href: '/usage', label: 'Usage' },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <div style={{
      width: 220, background: '#f9f9f9', borderRight: '1px solid #e5e5e5',
      padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4,
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#111', padding: '4px 8px', marginBottom: 16 }}>
        Recall
      </div>
      {links.map(link => (
        <Link key={link.href} href={link.href} style={{
          padding: '6px 8px', borderRadius: 4, fontSize: 14, textDecoration: 'none',
          color: path === link.href ? '#111' : '#666',
          background: path === link.href ? '#efefef' : 'transparent',
          fontWeight: path === link.href ? 500 : 400,
        }}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
