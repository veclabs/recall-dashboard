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
