interface Props {
  label: string;
  value: string | number;
  sub?: string;
  limit?: number;
}

export default function StatCard({ label, value, sub, limit }: Props) {
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const pct = limit ? Math.min((num / limit) * 100, 100) : null;
  const danger = pct !== null && pct > 80;

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--content-border)',
      borderRadius: 10,
      padding: '16px 20px',
      flex: 1,
      minWidth: 140,
    }}>
      <p style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        margin: '0 0 10px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 500,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: 0,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          {sub}
        </p>
      )}
      {pct !== null && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            height: 3,
            background: 'var(--content-border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: danger ? '#dc6b6b' : 'var(--accent)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            margin: '5px 0 0',
          }}>
            {num.toLocaleString()} / {limit?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
