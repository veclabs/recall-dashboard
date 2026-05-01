interface Props {
  label: string;
  value: string | number;
  sub?: string;
  limit?: number;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, limit, accent }: Props) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const pct = limit ? Math.min((numericValue / limit) * 100, 100) : null;

  return (
    <div style={{
      border: '1px solid #e8e8e8',
      padding: '20px 24px',
      background: '#fff',
      minWidth: 180,
      flex: 1,
    }}>
      <p style={{
        fontSize: 10,
        color: '#999',
        margin: '0 0 12px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 32,
        fontWeight: 700,
        color: accent ? '#000' : '#111',
        margin: '0 0 4px',
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0', fontFamily: 'monospace' }}>
          {sub}
        </p>
      )}
      {pct !== null && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            height: 3,
            background: '#f0f0f0',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct > 80 ? '#ef4444' : '#111',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: 10, color: '#bbb', margin: '4px 0 0', fontFamily: 'monospace' }}>
            {numericValue.toLocaleString()} / {limit?.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}