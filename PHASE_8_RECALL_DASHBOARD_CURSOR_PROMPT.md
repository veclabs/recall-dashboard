# Phase 8 — recall-dashboard
## Cursor Prompt: Developer Dashboard
## Repository: github.com/veclabs/recall-dashboard
## Deploys to: app.veclabs.xyz

---

## CONTEXT

You are building the developer dashboard for Recall by VecLabs.
Developers sign up here, get API keys, and monitor their usage.

Design: minimal, clean, white background, black text.
No fancy animations. No gradients. Think Linear or Vercel dashboard aesthetic.
Font: system font stack. No custom fonts needed.

This is a Next.js 14 App Router project. Read the existing scaffold first.

---

## BRANCH

```bash
git checkout -b feat/phase-8-dashboard
```

Commit prefix: `feat(dashboard):`
Never commit directly to main.

---

## ENVIRONMENT VARIABLES

These are already set in Vercel. For local dev create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://api.veclabs.xyz
NEXT_PUBLIC_APP_URL=https://app.veclabs.xyz
```

---

## PART 1 — INSTALL DEPENDENCIES

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## PART 2 — PROJECT STRUCTURE

```
recall-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          (sidebar + topbar)
│   │   ├── page.tsx            (overview)
│   │   ├── keys/page.tsx       (API key management)
│   │   ├── collections/page.tsx (collections list)
│   │   └── usage/page.tsx      (usage stats)
│   ├── layout.tsx
│   └── page.tsx                (redirect to /login or /overview)
├── components/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── StatCard.tsx
│   ├── KeyCard.tsx
│   ├── CollectionRow.tsx
│   └── UsageBar.tsx
├── lib/
│   ├── supabase.ts
│   └── api.ts                  (typed fetch wrapper for api.veclabs.xyz)
└── middleware.ts
```

---

## PART 3 — DESIGN SYSTEM

No Tailwind config changes needed. Use these exact inline styles / className values throughout:

```
Background:     #ffffff
Surface:        #f9f9f9  (cards, sidebar)
Border:         #e5e5e5
Text primary:   #111111
Text secondary: #666666
Text muted:     #999999
Accent:         #111111  (buttons, active states)
Danger:         #dc2626  (delete, revoke)
Success:        #16a34a  (verified, active)
Font:           -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Border radius:  6px for cards, 4px for inputs/buttons
```

All buttons: `border: 1px solid #e5e5e5, background: #fff, padding: 6px 14px, border-radius: 4px, font-size: 13px, cursor: pointer`
Primary button: `background: #111, color: #fff, border: none`
Danger button: `background: #fff, color: #dc2626, border: 1px solid #dc2626`

---

## PART 4 — SUPABASE CLIENT

### `lib/supabase.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## PART 5 — API CLIENT

### `lib/api.ts`

```typescript
// Typed wrapper around api.veclabs.xyz

const BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch(path: string, options: RequestInit & { apiKey?: string } = {}) {
  const { apiKey, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...rest.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listKeys: (apiKey: string) =>
    apiFetch('/api/v1/keys', { apiKey }),

  createKey: (apiKey: string, name: string) =>
    apiFetch('/api/v1/keys', {
      method: 'POST',
      apiKey,
      body: JSON.stringify({ name }),
    }),

  revokeKey: (apiKey: string, id: string) =>
    apiFetch(`/api/v1/keys/${id}`, { method: 'DELETE', apiKey }),

  listCollections: (apiKey: string) =>
    apiFetch('/api/v1/collections', { apiKey }),

  getUsage: (apiKey: string) =>
    apiFetch('/api/v1/usage', { apiKey }),
};
```

---

## PART 6 — AUTH PAGES

### `app/(auth)/login/page.tsx`

Clean centered form. Email + password. Link to register.
On success: redirect to `/`.

```tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fff', fontFamily: '-apple-system, sans-serif'
    }}>
      <div style={{ width: 360 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>
            Recall
          </h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={inputStyle}
          />
          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13, color: '#666' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#111', textDecoration: 'underline' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 4,
  fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 14px', background: '#111', color: '#fff', border: 'none',
  borderRadius: 4, fontSize: 14, cursor: 'pointer', fontWeight: 500,
};
```

### `app/(auth)/register/page.tsx`

Same style as login. Calls `api.register()` then redirects to `/login`.
Show a success message: "Account created. Check your email for your API key."

---

## PART 7 — DASHBOARD LAYOUT

### `app/(dashboard)/layout.tsx`

Sidebar on left (220px wide), content on right.
Sidebar items: Overview, API Keys, Collections, Usage.
Top bar: shows email + sign out button.

```tsx
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '32px 40px', background: '#fff' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

### `components/Sidebar.tsx`

```tsx
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
```

---

## PART 8 — DASHBOARD PAGES

### `app/(dashboard)/page.tsx` — Overview

Shows 3 stat cards: Total Collections, Total Writes (this month), Total Queries (this month).
Below: a quick start code snippet.

```tsx
// Page heading: "Overview"
// Subheading: current user email
// 3 StatCards in a row
// Quick start section with npm install + code example using their API key
```

### `components/StatCard.tsx`

```tsx
interface Props { label: string; value: string | number; sub?: string; }

export default function StatCard({ label, value, sub }: Props) {
  return (
    <div style={{
      border: '1px solid #e5e5e5', borderRadius: 6, padding: '20px 24px',
      background: '#fff', minWidth: 180,
    }}>
      <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 600, color: '#111', margin: 0 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}
```

---

### `app/(dashboard)/keys/page.tsx` — API Keys

Page heading: "API Keys"

Layout:
- Top right: "Create key" button → modal with name input
- List of existing keys in a table:
  - Prefix | Name | Created | Last used | Actions (Revoke)
- When a new key is created: show the full key in a modal with a copy button and a warning "Save this — it won't be shown again."

```tsx
// Table headers: PREFIX, NAME, CREATED, LAST USED, ACTIONS
// Each row shows key_prefix, name, created_at (formatted), last_used_at, revoke button
// Revoke: confirm dialog → calls api.revokeKey()
// Create: modal with name input → calls api.createKey() → shows raw key once
```

---

### `app/(dashboard)/collections/page.tsx` — Collections

Page heading: "Collections"

Table:
- Name | Dimensions | Metric | Vectors | Merkle Root | Created

```tsx
// No create button — collections are created via API
// Show a note: "Create collections via the API: POST /api/v1/collections"
// Table shows all collections with their current stats
```

---

### `app/(dashboard)/usage/page.tsx` — Usage

Page heading: "Usage"
Subheading: current month (e.g. "March 2026")

Shows:
- Current plan badge (Free / Pro)
- 3 usage bars: Writes, Queries, Vectors (used vs limit)
- Upgrade button if on free plan

### `components/UsageBar.tsx`

```tsx
interface Props { label: string; used: number; limit: number; }

export default function UsageBar({ label, used, limit }: Props) {
  const pct = Math.min((used / limit) * 100, 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#111', marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: '#666' }}>{used.toLocaleString()} / {limit.toLocaleString()}</span>
      </div>
      <div style={{ background: '#f0f0f0', borderRadius: 4, height: 6 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 4,
          background: pct > 90 ? '#dc2626' : '#111',
        }} />
      </div>
    </div>
  );
}
```

---

## PART 9 — MIDDLEWARE (Auth protection)

### `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) => res.cookies.set({ name, value, ...options }),
      remove: (name, options) => res.cookies.set({ name, value: '', ...options }),
    }}
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## PART 10 — DEFINITION OF DONE

- [ ] `npm run build` passes zero errors
- [ ] `/login` — email/password login works
- [ ] `/register` — creates account via api.veclabs.xyz/auth/register
- [ ] Unauthenticated users redirect to /login
- [ ] Authenticated users redirect from /login to /
- [ ] `/` — shows stat cards with real usage data
- [ ] `/keys` — lists keys, create new key shows raw key once, revoke works
- [ ] `/collections` — lists all collections with stats
- [ ] `/usage` — shows usage bars with free tier limits
- [ ] Sidebar active state highlights current page
- [ ] Sign out button works
- [ ] All pages are white background, black text, no color except accents
- [ ] Mobile responsive (sidebar collapses or scrolls)

---

## MERGE

```bash
git add -A
git commit -m "feat(dashboard): phase 8 developer dashboard complete"
git push origin feat/phase-8-dashboard
git checkout main
git merge --no-ff feat/phase-8-dashboard -m "merge(dashboard): phase 8 developer dashboard"
git push origin main
```
